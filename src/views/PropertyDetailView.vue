<template>
  <div class="property-detail-view">
    <PropertyDetail 
      v-if="propertyId" 
      :propertyId="propertyId" 
      @back="handleBack" 
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PropertyDetail from '@/components/PropertyDetail.vue'

const route = useRoute()
const router = useRouter()

// Get property ID from route params
const propertyId = computed(() => route.params.id)

// Navigate back to property list
const handleBack = () => {
  router.push({ name: 'PropertyList' })
}
</script>

<style scoped>
.property-detail-view {
  /* PropertyDetail má vlastní styling, zde není třeba extra */
}
</style>
