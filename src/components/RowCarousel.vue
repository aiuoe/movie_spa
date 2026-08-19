<script setup>
import { ref } from 'vue'
import { Icon } from '@iconify/vue'
import MediaCard from '@/components/MediaCard.vue'

const props = defineProps({
  title: { type: String, required: true },
  items: { type: Array, required: true },
  cardSize: { type: String, default: 'md' }
})

const scroller = ref(null)

function scroll(dir) {
  const el = scroller.value
  if (!el) return
  el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: 'smooth' })
}
</script>

<template>
  <section class="relative space-y-3">
    <div class="container-fluid flex items-center justify-between">
      <h2 class="text-lg font-bold tracking-tight sm:text-xl">{{ title }}</h2>
      <div class="hidden gap-2 sm:flex">
        <button @click="scroll(-1)" class="grid h-8 w-8 place-items-center rounded-full bg-white/10 hover:bg-white/20">
          <Icon icon="mdi:chevron-left" />
        </button>
        <button @click="scroll(1)" class="grid h-8 w-8 place-items-center rounded-full bg-white/10 hover:bg-white/20">
          <Icon icon="mdi:chevron-right" />
        </button>
      </div>
    </div>

    <div
      ref="scroller"
      class="no-scrollbar container-fluid flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2"
    >
      <MediaCard v-for="item in items" :key="item.id" :item="item" :size="cardSize" />
    </div>
  </section>
</template>