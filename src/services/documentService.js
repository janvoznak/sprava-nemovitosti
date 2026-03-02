import documents from '@/mock/documents'
import { API_CONFIG } from '@/config/api.config'
import apiClient from '@/api/client'

/**
 * Document Service
 * Manages document uploads, categorization, and retrieval
 * Supports version control and metadata management
 */

const STORAGE_KEY = 'sprava_nemovitosti_documents';

// Helper to load from storage or fallback to mock
const loadFromStorage = () => {
    if (typeof localStorage === 'undefined') return [...documents];
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        try {
            const parsed = JSON.parse(stored);
            const storedIds = new Set(parsed.map(d => d.id));
            const newMocks = documents.filter(d => !storedIds.has(d.id));
            return [...newMocks, ...parsed];
        } catch (e) {
            console.error('Failed to parse stored documents', e);
            return [...documents];
        }
    }
    return [...documents];
};

// Helper to save to storage
const saveToStorage = (data) => {
    if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
};

// Storage for uploaded documents (in-memory for mock mode)
let uploadedDocuments = loadFromStorage()
let nextDocumentId = uploadedDocuments.length > 0
    ? Math.max(...uploadedDocuments.map(d => parseInt(d.id.replace('DOC', '')) || 0)) + 1
    : 100

export const documentService = {
    /**
     * Get all documents for a property
     * @param {string} propertyId - Property ID
     * @returns {Promise<Array>} List of documents
     */
    async getDocuments(propertyId) {
        try {
            if (API_CONFIG.useMock) {
                return new Promise((resolve) => {
                    setTimeout(() => {
                        const propertyDocs = uploadedDocuments.filter(
                            doc => doc.propertyId === propertyId
                        )

                        // Sort by upload date (newest first)
                        propertyDocs.sort((a, b) =>
                            new Date(b.uploadDate) - new Date(a.uploadDate)
                        )

                        if (API_CONFIG.debug) {
                            console.log(`📁 Mock: Fetching documents for property ${propertyId}`, propertyDocs.length)
                        }
                        resolve(propertyDocs)
                    }, 300)
                })
            }

            const response = await apiClient.get(`/properties/${propertyId}/documents`)
            return response.data || []
        } catch (error) {
            console.error('Error fetching documents:', error)
            throw error
        }
    },

    /**
     * Get documents by category
     * @param {string} propertyId - Property ID
     * @param {string} category - Category filter
     * @returns {Promise<Array>} Filtered documents
     */
    async getDocumentsByCategory(propertyId, category) {
        const docs = await this.getDocuments(propertyId)
        return docs.filter(doc => doc.category === category)
    },

    /**
     * Upload a new document
     * @param {string} propertyId - Property ID
     * @param {File} file - File object
     * @param {Object} metadata - Document metadata
     * @returns {Promise<Object>} Uploaded document
     */
    async uploadDocument(propertyId, file, metadata) {
        try {
            if (API_CONFIG.useMock) {
                return new Promise((resolve) => {
                    setTimeout(() => {
                        const newDoc = {
                            id: `DOC${String(nextDocumentId++).padStart(3, '0')}`,
                            propertyId,
                            category: metadata.category || 'contracts',
                            name: metadata.name || file.name,
                            originalName: file.name,
                            fileType: file.type,
                            fileSize: file.size,
                            uploadDate: new Date().toISOString(),
                            uploadedBy: 'Admin',
                            version: 1,
                            previousVersionId: null,
                            metadata: metadata.metadata || {},
                            tags: metadata.tags || [],
                            url: `/mock/documents/${file.name}`,
                            thumbnailUrl: `/mock/thumbnails/${file.name.replace(/\.[^/.]+$/, '')}.jpg`,
                            // E-Signing fields
                            status: metadata.signable ? 'pending' : 'none', // pending, signed, none
                            signable: metadata.signable || false,
                            signedDate: null,
                            signature: null
                        }

                        uploadedDocuments.unshift(newDoc) // Add to beginning
                        saveToStorage(uploadedDocuments)

                        if (API_CONFIG.debug) {
                            console.log('📁 Mock: Uploaded document', newDoc)
                        }
                        resolve(newDoc)
                    }, 800) // Simulate upload time
                })
            }

            const formData = new FormData()
            formData.append('file', file)
            formData.append('metadata', JSON.stringify(metadata))

            const response = await apiClient.post(
                `/properties/${propertyId}/documents`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            )
            return response.data
        } catch (error) {
            console.error('Error uploading document:', error)
            throw error
        }
    },

    /**
     * Sign a document
     * @param {string} documentId - Document ID
     * @param {Object} signatureData - Signature data { name, date, ... }
     * @returns {Promise<Object>} Signed document
     */
    async signDocument(documentId, signatureData) {
        try {
            if (API_CONFIG.useMock) {
                return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        const doc = uploadedDocuments.find(d => d.id === documentId)
                        if (doc) {
                            doc.status = 'signed'
                            doc.signedDate = new Date().toISOString()
                            doc.signature = signatureData
                            saveToStorage(uploadedDocuments)
                            if (API_CONFIG.debug) {
                                console.log('📁 Mock: Signed document', doc)
                            }
                            resolve(doc)
                        } else {
                            reject(new Error('Document not found'))
                        }
                    }, 500)
                })
            }
            // Real API implementation would go here
            return await apiClient.post(`/documents/${documentId}/sign`, signatureData)
        } catch (error) {
            console.error('Error signing document:', error)
            throw error
        }
    },

    /**
     * Delete a document
     * @param {string} documentId - Document ID
     * @returns {Promise<boolean>} Success status
     */
    async deleteDocument(documentId) {
        try {
            if (API_CONFIG.useMock) {
                return new Promise((resolve) => {
                    setTimeout(() => {
                        const index = uploadedDocuments.findIndex(doc => doc.id === documentId)
                        if (index !== -1) {
                            uploadedDocuments.splice(index, 1)
                            saveToStorage(uploadedDocuments)
                            if (API_CONFIG.debug) {
                                console.log('📁 Mock: Deleted document', documentId)
                            }
                            resolve(true)
                        } else {
                            resolve(false)
                        }
                    }, 200)
                })
            }

            await apiClient.delete(`/documents/${documentId}`)
            return true
        } catch (error) {
            console.error('Error deleting document:', error)
            throw error
        }
    },

    /**
     * Update document metadata
     * @param {string} documentId - Document ID
     * @param {Object} metadata - Updated metadata
     * @returns {Promise<Object>} Updated document
     */
    async updateDocumentMetadata(documentId, metadata) {
        try {
            if (API_CONFIG.useMock) {
                return new Promise((resolve) => {
                    setTimeout(() => {
                        const doc = uploadedDocuments.find(d => d.id === documentId)
                        if (doc) {
                            doc.metadata = { ...doc.metadata, ...metadata }
                            saveToStorage(uploadedDocuments)
                            if (API_CONFIG.debug) {
                                console.log('📁 Mock: Updated document metadata', doc)
                            }
                            resolve(doc)
                        }
                    }, 200)
                })
            }

            const response = await apiClient.patch(`/documents/${documentId}`, { metadata })
            return response.data
        } catch (error) {
            console.error('Error updating document metadata:', error)
            throw error
        }
    },

    /**
     * Download a document
     * @param {string} documentId - Document ID
     * @returns {Promise<string>} Download URL
     */
    async downloadDocument(documentId) {
        try {
            const doc = uploadedDocuments.find(d => d.id === documentId)
            if (!doc) {
                throw new Error('Document not found')
            }

            if (API_CONFIG.useMock) {
                // In mock mode, return the mock URL
                // In real app, this would trigger a download
                if (API_CONFIG.debug) {
                    console.log('📁 Mock: Download document', doc.name)
                }
                return doc.url
            }

            const response = await apiClient.get(`/documents/${documentId}/download`, {
                responseType: 'blob'
            })
            return window.URL.createObjectURL(response.data)
        } catch (error) {
            console.error('Error downloading document:', error)
            throw error
        }
    },

    /**
     * Get preview URL for a document
     * @param {string} documentId - Document ID
     * @returns {Promise<string>} Preview URL
     */
    async getPreviewUrl(documentId) {
        try {
            const doc = uploadedDocuments.find(d => d.id === documentId)
            if (!doc) {
                throw new Error('Document not found')
            }

            if (API_CONFIG.useMock) {
                // For mock mode, return a mock PDF or image URL
                if (doc.fileType.startsWith('image/')) {
                    // For images, return the mock thumbnail
                    return doc.url
                } else if (doc.fileType === 'application/pdf') {
                    // For PDFs, return a sample PDF URL
                    return 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
                }
                return doc.url
            }

            const response = await apiClient.get(`/documents/${documentId}/preview`)
            return response.data.url
        } catch (error) {
            console.error('Error getting preview URL:', error)
            throw error
        }
    },

    /**
     * Search documents by name or tags
     * @param {string} propertyId - Property ID
     * @param {string} query - Search query
     * @returns {Promise<Array>} Matching documents
     */
    async searchDocuments(propertyId, query) {
        const docs = await this.getDocuments(propertyId)
        const lowerQuery = query.toLowerCase()

        return docs.filter(doc =>
            doc.name.toLowerCase().includes(lowerQuery) ||
            doc.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
            (doc.metadata.tenant && doc.metadata.tenant.toLowerCase().includes(lowerQuery)) ||
            (doc.metadata.notes && doc.metadata.notes.toLowerCase().includes(lowerQuery))
        )
    },

    /**
     * Get document statistics for a property
     * @param {string} propertyId - Property ID
     * @returns {Promise<Object>} Statistics
     */
    async getDocumentStats(propertyId) {
        const docs = await this.getDocuments(propertyId)

        return {
            total: docs.length,
            byCategory: {
                contracts: docs.filter(d => d.category === 'contracts').length,
                revisions: docs.filter(d => d.category === 'revisions').length,
                invoices: docs.filter(d => d.category === 'invoices').length,
                insurance: docs.filter(d => d.category === 'insurance').length,
                photos: docs.filter(d => d.category === 'photos').length
            },
            totalSize: docs.reduce((sum, d) => sum + d.fileSize, 0)
        }
    },

    /**
     * Validate file before upload
     * @param {File} file - File to validate
     * @returns {Object} Validation result { valid: boolean, error?: string }
     */
    validateFile(file) {
        const maxSize = 10 * 1024 * 1024 // 10MB
        const allowedTypes = [
            'application/pdf',
            'image/jpeg',
            'image/jpg',
            'image/png',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' // .xlsx
        ]

        if (file.size > maxSize) {
            return {
                valid: false,
                error: `Soubor je příliš velký. Maximální velikost je 10MB. (${(file.size / 1024 / 1024).toFixed(2)}MB)`
            }
        }

        if (!allowedTypes.includes(file.type)) {
            return {
                valid: false,
                error: `Nepodporovaný typ souboru. Povolené typy: PDF, JPG, PNG, DOCX, XLSX. (${file.type})`
            }
        }

        return { valid: true }
    },

    /**
     * Format file size for display
     * @param {number} bytes - File size in bytes
     * @returns {string} Formatted size
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 B'
        const k = 1024
        const sizes = ['B', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
    },

    /**
     * Get icon for file type
     * @param {string} fileType - MIME type
     * @returns {string} Icon emoji
     */
    getFileIcon(fileType) {
        if (fileType.startsWith('image/')) return '📷'
        if (fileType === 'application/pdf') return '📄'
        if (fileType.includes('word')) return '📝'
        if (fileType.includes('sheet') || fileType.includes('excel')) return '📊'
        return '📎'
    },

    /**
     * Get category label (Czech)
     * @param {string} category - Category key
     * @returns {string} Czech label
     */
    getCategoryLabel(category) {
        const labels = {
            contracts: 'Smlouvy',
            revisions: 'Revize',
            invoices: 'Faktury',
            insurance: 'Pojištění',
            photos: 'Fotky'
        }
        return labels[category] || category
    },

    /**
     * Get category icon
     * @param {string} category - Category key
     * @returns {string} Icon emoji
     */
    getCategoryIcon(category) {
        const icons = {
            contracts: '📄',
            revisions: '🔧',
            invoices: '💰',
            insurance: '🛡️',
            photos: '📷'
        }
        return icons[category] || '📎'
    }
}
