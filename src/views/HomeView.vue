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
const providerFilter = ref('all')
const requested = ref(new Set())

onMounted(loadHome)

const allProviders = [
  { id: 'Netflix', color: 'bg-red-600' },
  { id: 'Disney+', color: 'bg-blue-800' },
  { id: 'HBO Max', color: 'bg-purple-600' },
  { id: 'Paramount+', color: 'bg-blue-500' },
  { id: 'Hulu', color: 'bg-emerald-500' },
  { id: 'Apple TV+', color: 'bg-zinc-900' },
  { id: 'Prime Video', color: 'bg-blue-400' }
]

const visibleGrid = computed(() => {
  let base = []
  if (tab.value === 'movies') base = movies.value
  else if (tab.value === 'series') base = series.value
  else base = trending.value
  if (providerFilter.value !== 'all') {
    base = base.filter((m) => m.providers?.includes(providerFilter.value))
  }
  return base
})

// Carruseles agrupados por provider
const providerRows = computed(() => {
  const rows = []
  for (const p of allProviders) {
    const items = trending.value.filter((m) => m.providers?.includes(p.id))
    if (items.length) rows.push({ provider: p, items })
  }
  return rows
})

async function sendRequest(item) {
  try {
    // Si el item ya tiene external_id (de la seed), lo usamos directo
    const extId = item.external_id || item.externalId
    if (extId) {
      await request({
        kind: item.kind === 'series' ? 'series' : 'movie',
        title: item.title,
        external_id: extId
      })
      requested.value.add(item.id)
      requested.value = new Set(requested.value)
    } else {
      alert('Sin ID externo — pedí desde /search → Descubrir')
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

    <!-- Carruseles por plataforma (Netflix, Disney+, HBO Max…) -->
    <div class="mt-8 space-y-10">
      <RowCarousel
        v-for="row in providerRows"
        :key="row.provider.id"
        :title="row.provider.id"
        :items="row.items"
        card-size="md"
      />

      <!-- Filtros + Grid principal -->
      <section class="space-y-4">
        <SectionTitle title="Explorar catálogo" :subtitle="`${visibleGrid.length} títulos visibles`">
          <template #actions>
            <div class="hidden gap-2 sm:flex flex-wrap">
              <button
                v-for="t in [{ id: 'all', label: 'Todo' }, { id: 'movies', label: 'Películas' }, { id: 'series', label: 'Series' }]"
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

        <!-- Chips de plataforma (filtro) -->
        <div class="flex gap-2 overflow-x-auto no-scrollbar">
          <button
            @click="providerFilter = 'all'"
            class="chip shrink-0"
            :class="{ 'chip-active': providerFilter === 'all' }"
          >
            Todas las plataformas
          </button>
          <button
            v-for="p in allProviders"
            :key="p.id"
            @click="providerFilter = p.id"
            class="chip shrink-0"
            :class="{ 'chip-active': providerFilter === p.id }"
          >
            <span class="inline-block h-2 w-2 rounded-full mr-1" :class="p.color" />
            {{ p.id }}
          </button>
        </div>

        <div v-if="loading" class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          <div v-for="i in 12" :key="i" class="aspect-[2/3] animate-pulse rounded-xl bg-ink-700"></div>
        </div>

        <div v-else class="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          <div
            v-for="item in visibleGrid"
            :key="item.id"
            class="group relative shrink-0 snap-start overflow-hidden rounded-xl bg-ink-700 ring-1 ring-white/5 aspect-[2/3] card-hover"
          >
            <RouterLink
              :to="{ name: 'detail', params: { id: item.id } }"
              class="absolute inset-0 z-0"
            />
            <img
              :src="item.poster"
              :alt="item.title"
              loading="eager"
              decoding="async"
              class="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-105"
              @error="(e) => e.target.src = `data:image/svg+xml;utf8,${encodeURIComponent('<svg xmlns=\\'http://www.w3.org/2000/svg\\' viewBox=\\'0 0 500 750\\'><rect width=\\'500\\' height=\\'750\\' fill=\\'%23333\\'/><text x=\\'250\\' y=\\'380\\' font-family=\\'sans-serif\\' font-size=\\'24\\' font-weight=\\'800\\' fill=\\'%23fff\\' text-anchor=\\'middle\\'>' + (item.title || '').replace(/[<>&]/g, '') + '</text></svg>')}`"
            />
            <span v-if="item.kind === 'series'" class="pointer-events-none absolute left-2 top-2 rounded bg-black/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide backdrop-blur">Serie</span>
            <span
              v-if="item.storage_key"
              class="pointer-events-none absolute right-2 top-2 rounded bg-emerald-500/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
            >✓</span>
            <span
              v-else-if="item.is_estreno"
              class="pointer-events-none absolute right-2 top-2 rounded bg-amber-500/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
            >⭐</span>
            <span
              v-if="item.providers?.[0]"
              class="pointer-events-none absolute bottom-12 right-2 rounded bg-black/70 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide backdrop-blur"
            >{{ item.providers[0] }}</span>
            <div class="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent p-2.5">
              <p class="line-clamp-2 text-xs font-semibold">{{ item.title }}</p>
              <p class="text-[10px] text-white/60">{{ item.year }} · ★ {{ item.rating }}</p>
            </div>
          </div>
        </div>

        <div v-if="!loading && visibleGrid.length === 0" class="py-12 text-center">
          <Icon icon="mdi:magnify-close" class="mx-auto text-5xl text-white/30" />
          <p class="mt-3 text-white/60">Sin resultados para este filtro</p>
        </div>
      </section>
    </div>
  </div>
</template>