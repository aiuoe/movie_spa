<script setup>
import MediaCard from '@/components/MediaCard.vue'

defineProps({
  items: { type: Array, required: true },
  cardSize: { type: String, default: 'md' }
})
</script>

<template>
  <div
    class="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
  >
    <MediaCard v-for="item in items" :key="item.id" :item="item" :size="cardSize" />
  </div>
</template>