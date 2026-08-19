<script setup>
import { onMounted, ref, computed } from 'vue'
import { useMedia } from '@/composables/useMedia'
import Hero from '@/components/Hero.vue'
import TopBar from '@/components/TopBar.vue'
import RowCarousel from '@/components/RowCarousel.vue'
import MediaGrid from '@/components/MediaGrid.vue'
import SectionTitle from '@/components/SectionTitle.vue'
import { Icon } from '@iconify/vue'

const { hero, trending, movies, series, continueWatching, loadHome, loading } = useMedia()
const tab = ref('all')

onMounted(loadHome)

const visibleGrid = computed(() => {
  if (tab.value === 'movies') return movies.value
  if (tab.value === 'series') return series.value
  return trending.value
})
</script>

<template>
  <div class="pb-24 lg:pb-10">
    <!-- HERO a pantalla completa en móvil, contenido debajo -->
    <Hero v-if="hero" :item="hero" />

    <div class="container-fluid mt-4 space-y-4 sm:mt-6">
      <TopBar v-if="!hero" />
    </div>

    <!-- Continuar viendo -->
    <div v-if="continueWatching.length" class="mt-6 space-y-8">
      <RowCarousel title="Continuar viendo" :items="continueWatching" card-size="md" />
    </div>

    <!-- Trending -->
    <div class="mt-8 space-y-10">
      <RowCarousel title="Tendencias" :items="trending" card-size="md" />
      <RowCarousel title="Series" :items="series" card-size="md" />
      <RowCarousel title="Películas" :items="movies" card-size="md" />

      <!-- Filtros + Grid principal -->
      <section class="space-y-4">
        <SectionTitle title="Explorar catálogo" subtitle="Tu biblioteca scrapeada por Radarr y Sonarr">
          <template #actions>
            <div class="hidden gap-2 sm:flex">
              <button
                v-for="t in [
                  { id: 'all', label: 'Todo' },
                  { id: 'movies', label: 'Películas' },
                  { id: 'series', label: 'Series' }
                ]"
                :key="t.id"
                @click="tab = t.id"
                class="chip"
                :class="{ 'chip-active': tab === t.id }"
              >
                {{ t.label }}
              </button>
            </div>
          </template>
        </SectionTitle>

        <!-- Filtros en móvil (caja select simple) -->
        <div class="flex gap-2 overflow-x-auto no-scrollbar sm:hidden">
          <button
            v-for="t in [
              { id: 'all', label: 'Todo' },
              { id: 'movies', label: 'Películas' },
              { id: 'series', label: 'Series' }
            ]"
            :key="t.id"
            @click="tab = t.id"
            class="chip shrink-0"
            :class="{ 'chip-active': tab === t.id }"
          >
            {{ t.label }}
          </button>
        </div>

        <div v-if="loading" class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          <div v-for="i in 12" :key="i" class="aspect-[2/3] animate-pulse rounded-xl bg-ink-700"></div>
        </div>
        <MediaGrid v-else :items="visibleGrid" />
      </section>
    </div>
  </div>
</template>