<script setup>
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'

const props = defineProps({
  item: { type: Object, required: true }
})
const router = useRouter()
const open = () => router.push({ name: 'player', params: { id: props.item.id } })
</script>

<template>
  <section class="relative h-[78vh] min-h-[520px] w-full overflow-hidden">
    <img
      :src="item.backdrop"
      :alt="item.title"
      class="absolute inset-0 h-full w-full object-cover"
    />
    <!-- Vignette lateral -->
    <div class="absolute inset-0 gradient-hero"></div>
    <!-- Vignette inferior para que el contenido respire con el background -->
    <div class="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-ink-900 to-transparent"></div>

    <div class="relative z-10 flex h-full items-end pb-16 sm:pb-24">
      <div class="container-fluid max-w-3xl space-y-5 animate-slide-up">
        <span class="chip chip-active">★ Destacado</span>
        <h1 class="text-3xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
          {{ item.title }}
        </h1>
        <div class="flex flex-wrap items-center gap-3 text-xs text-white/80 sm:text-sm">
          <span class="rounded bg-white/15 px-2 py-0.5">{{ item.year }}</span>
          <span class="flex items-center gap-1">
            <Icon icon="mdi:star" class="text-yellow-400" />
            {{ item.rating }}
          </span>
          <span>· {{ item.duration }}</span>
          <span v-for="g in item.genres" :key="g" class="rounded border border-white/20 px-2 py-0.5">
            {{ g }}
          </span>
        </div>
        <p class="max-w-xl text-sm text-white/80 sm:text-base">{{ item.tagline || item.overview }}</p>
        <div class="flex flex-wrap gap-3 pt-2">
          <button @click="open" class="btn-primary">
            <Icon icon="mdi:play" /> Reproducir
          </button>
          <button class="btn-secondary">
            <Icon icon="mdi:information-outline" /> Más info
          </button>
        </div>
      </div>
    </div>
  </section>
</template>