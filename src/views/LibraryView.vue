<script setup>
import { onMounted, ref } from 'vue'
import TopBar from '@/components/TopBar.vue'
import MediaGrid from '@/components/MediaGrid.vue'
import SectionTitle from '@/components/SectionTitle.vue'
import { useMedia } from '@/composables/useMedia'
import { Icon } from '@iconify/vue'

const { trending, loadHome } = useMedia()
const filter = ref('all')

onMounted(loadHome)

const collections = [
  { id: 'favs', title: 'Mi lista', icon: 'mdi:bookmark' },
  { id: 'movies', title: 'Películas', icon: 'mdi:movie-open' },
  { id: 'series', title: 'Series', icon: 'mdi:television' },
  { id: 'recent', title: 'Agregados recientemente', icon: 'mdi:history' },
  { id: 'kids', title: 'Niños', icon: 'mdi:teddy-bear' }
]
</script>

<template>
  <div class="min-h-[100dvh] pb-24">
    <TopBar />

    <div class="container-fluid mt-2 space-y-6">
      <SectionTitle title="Mi biblioteca" subtitle="Tus películas, series y listas" />

      <!-- Colecciones -->
      <section class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
        <button
          v-for="c in collections"
          :key="c.id"
          class="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-4 text-left transition hover:bg-white/10"
          @click="filter = c.id"
        >
          <Icon :icon="c.icon" class="text-2xl text-brand-500" />
          <span class="font-semibold">{{ c.title }}</span>
        </button>
      </section>

      <SectionTitle title="Todo el catálogo" subtitle="Vista cuadrícula · mobile-first" />

      <MediaGrid :items="trending" />
    </div>
  </div>
</template>