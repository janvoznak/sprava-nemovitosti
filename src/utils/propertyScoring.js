/**
 * Utility for calculating property health score.
 * 
 * Components:
 * 1. Occupancy (40%): Direct percentage of occupancy.
 * 2. Financial (30%):
 *    - No Debt: 15%
 *    - Deposit Collected > 80%: 15%
 * 3. Technical (30%):
 *    - No Expired Revisions: 15%
 *    - No Expiring Revisions: 15%
 */

export const calculatePropertyScore = (property) => {
    if (!property) return { score: 0, breakdown: {}, color: 'red', label: 'Unknown' };

    let breakdown = {
        occupancy: 0,
        financial: 0,
        technical: 0
    };

    // 1. Occupancy (Max 40)
    const occupancyRate = property.occupancyPercentage || 0;
    breakdown.occupancy = Math.round((occupancyRate / 100) * 40);

    // 2. Financial (Max 30)
    // No Debt -> 15 pts
    if (!property.hasDebt) {
        breakdown.financial += 15;
    }

    // Deposit Collected > 80% -> 15 pts
    // Handle cases where depositTotal might be 0 or missing
    const depositTotal = property.depositTotal || 0;
    const depositCollected = property.depositCollected || 0;

    if (depositTotal > 0 && (depositCollected / depositTotal) >= 0.8) {
        breakdown.financial += 15;
    } else if (depositTotal === 0) {
        // If no deposit expected, give full points? Or neutral?
        // Let's assume neutral/good context -> give points
        breakdown.financial += 15;
    }

    // 3. Technical (Max 30)
    // We check either the summary object or the revisions array
    let hasExpired = false;
    let hasExpiring = false;

    if (property.revisionStatus) {
        hasExpired = property.revisionStatus.expired;
        hasExpiring = property.revisionStatus.expiring;
    } else if (property.revisions && Array.isArray(property.revisions)) {
        hasExpired = property.revisions.some(r => r.status !== 'Platná');
        // Note: 'Expiruje' might be a status string based on mock data
        hasExpiring = property.revisions.some(r => r.status === 'Expiruje');
    }

    if (!hasExpired) breakdown.technical += 15;
    if (!hasExpiring) breakdown.technical += 15;

    // Total Score
    const totalScore = breakdown.occupancy + breakdown.financial + breakdown.technical;

    // Determine Status Label & Color
    let status = { color: 'red', label: 'CRITICAL' };
    if (totalScore >= 80) {
        status = { color: 'green', label: 'EXCELLENT' };
    } else if (totalScore >= 50) {
        status = { color: 'amber', label: 'WARNING' };
    }

    return {
        score: totalScore,
        breakdown,
        status
    };
};
