<script setup>
import { onMounted, ref, computed } from 'vue'
import { useMedia } from '@/composables/useMedia'
import Hero from '@/components/Hero.vue'
import TopBar from '@/components/TopBar.vue'
import RowCarousel from '@/components/RowCarousel.vue'
import MediaGrid from '@/components/MediaGrid.vue'
import SectionTitle from '@/components/SectionTitle.vue'
import ServiceStatus from '@/components/ServiceStatus.vue'
import LiveTVBanner from '@/components/LiveTVBanner.vue'
import { Icon } from '@iconify/vue'

const { hero, trending, movies, series, continueWatching, loadHome, loading, request } = useMedia()
const tab = ref('all')
const requested = ref(new Set())

onMounted(loadHome)

const visibleGrid = computed(() => {
  if (tab.value === 'movies') return movies.value
  if (tab.value === 'series') return series.value
  return trending.value
})

// Enriquecemos los items con campos esperados por MediaCard (external_id, tmdb_id).
// En la API nueva van a venir del lookup; acá los derivamos desde el id.
function withRequestIds(item) {
  // Por ahora sin IDs externos reales — el pedido desde el home funciona si
  // el item está en el catálogo TMDB vía Radarr/Sonarr (ver SearchView).
  return { ...item, external_id: 0 }
}

async function sendRequest(item) {
  // Lookup rápido para obtener external_id (tmdb/tvdb) antes de pedir.
  try {
    const r = await fetch(`/api/lookup?kind=${item.kind === 'series' ? 'series' : 'movie'}&q=${encodeURIComponent(item.title)}`)
    const j = await r.json()
    const found = (j.results || [])[0]
    if (found) {
      await request({
        kind: item.kind === 'series' ? 'series' : 'movie',
        title: found.title || item.title,
        external_id: found.external_id || 0
      })
      requested.value.add(item.id)
      requested.value = new Set(requested.value)
    } else {
      alert(`No se encontró "${item.title}" en TMDB. Probá desde /search → Descubrir.`)
    }
  } catch (e) {
    alert('Error: ' + e.message)
  }
}
</script>

<template>
  <div class="pb-24 lg:pb-10">
    <!-- HERO -->
    <Hero v-if="hero" :item="hero" />
    <div class="container-fluid mt-4 space-y-4 sm:mt-6">
      <TopBar v-if="!hero" />
    </div>

    <!-- Banner Live TV -->
    <LiveTVBanner />

    <!-- Service status -->
    <ServiceStatus />

    <!-- Continuar viendo -->
    <div v-if="continueWatching.length" class="mt-6">
      <RowCarousel title="Continuar viendo" :items="continueWatching" card-size="md" />
    </div>

    <!-- Trending -->
    <div class="mt-8 space-y-10">
      <RowCarousel v-if="series.length" title="Series populares" :items="series" card-size="md" />
      <RowCarousel v-if="movies.length" title="Películas populares" :items="movies" card-size="md" />

      <!-- Filtros + Grid principal -->
      <section class="space-y-4">
        <SectionTitle title="Explorar catálogo" subtitle="22 títulos · lo que ves en verde ya está disponible, en ámbar podés pedirlo">
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

        <!-- Grid con botón "Cargar" en items pendientes -->
        <div v-else class="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          <div
            v-for="item in visibleGrid"
            :key="item.id"
            class="group relative shrink-0 snap-start overflow-hidden rounded-xl bg-ink-700 ring-1 ring-white/5 aspect-[2/3] card-hover"
          >
            <button
              type="button"
              @click="$router.push({ name: 'player', params: { id: item.id } })"
              class="absolute inset-0 z-0"
            />
            <img
              :src="item.poster || `https://placehold.co/500x750/262626/999?text=${encodeURIComponent(item.title)}`"
              :alt="item.title"
              loading="lazy"
              class="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-105"
              @error="(e) => e.target.src = `https://placehold.co/500x750/262626/999?text=${encodeURIComponent(item.title)}`"
            />
            <span v-if="item.kind === 'series'" class="pointer-events-none absolute left-2 top-2 rounded bg-black/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide backdrop-blur">Serie</span>
            <span
              v-if="item.storage_key"
              class="pointer-events-none absolute right-2 top-2 rounded bg-emerald-500/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
            >Disponible</span>
            <span
              v-else
              class="pointer-events-none absolute right-2 top-2 rounded bg-amber-500/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
            >Pendiente</span>
            <span v-if="item.storage_key" class="pointer-events-none absolute inset-0 grid place-items-center opacity-0 transition group-hover:opacity-100">
              <span class="grid h-10 w-10 place-items-center rounded-full bg-white/90 text-black shadow-lg">
                <Icon icon="mdi:play" class="text-2xl" />
              </span>
            </span>
            <div class="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent p-2.5">
              <p class="line-clamp-2 text-xs font-semibold">{{ item.title }}</p>
              <p class="text-[10px] text-white/60">{{ item.year }} · ★ {{ item.rating }}</p>
            </div>
            <button
              v-if="!item.storage_key"
              @click.stop="sendRequest(item)"
              :disabled="requested.has(item.id)"
              class="absolute inset-x-2 bottom-2 z-10 flex items-center justify-center gap-1 rounded-full bg-brand-500 py-1.5 text-xs font-bold text-white shadow-lg transition hover:bg-brand-600 disabled:opacity-60"
            >
              <template v-if="requested.has(item.id)">
                <Icon icon="mdi:check" /> En cola
              </template>
              <template v-else>
                <Icon icon="mdi:download" /> Cargar
              </template>
            </button>
          </div>
        </div>

        <div v-if="!loading && visibleGrid.length === 0" class="py-12 text-center">
          <Icon icon="mdi:movie-off-outline" class="mx-auto text-5xl text-white/30" />
          <p class="mt-3 text-white/60">Catálogo vacío</p>
        </div>
      </section>
    </div>
  </div>
</template>