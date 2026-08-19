<script setup>
import { ref, computed, onMounted } from 'vue'
import TopBar from '@/components/TopBar.vue'
import MediaGrid from '@/components/MediaGrid.vue'
import RequestCard from '@/components/RequestCard.vue'
import { Icon } from '@iconify/vue'
import { useMedia } from '@/composables/useMedia'

const { search, lookup, request, trending } = useMedia()
const q = ref('')
const tab = ref('local') // 'local' | 'discover'
const kind = ref('movie')

const localResults = ref([])
const discoverResults = ref([])
const loading = ref(false)
const requesting = ref(null)
const requested = ref(new Set())

async function run() {
  loading.value = true
  if (tab.value === 'local') {
    localResults.value = await search(q.value)
  } else {
    discoverResults.value = await lookup(q.value, kind.value)
  }
  loading.value = false
}

async function sendRequest(item) {
  requesting.value = `${item.external_id}-${item.kind}`
  try {
    await request(item)
    requested.value.add(`${item.external_id}-${item.kind}`)
    requested.value = new Set(requested.value)
  } catch (e) {
    alert('Error al pedir: ' + e.message)
  } finally {
    requesting.value = null
  }
}

const trending8 = computed(() => trending.value.slice(0, 8))

const suggestions = ['Sci-Fi', 'Drama', 'Acción', 'Aventura', 'Terror', 'Misterio']
</script>

<template>
  <div class="min-h-[100dvh] pb-24">
    <TopBar />

    <div class="container-fluid mt-2 space-y-6">
      <div class="sticky top-14 z-30 -mx-4 bg-ink-900/90 px-4 pb-3 pt-1 backdrop-blur sm:-mx-6 sm:px-6">
        <label class="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2.5">
          <Icon icon="mdi:magnify" class="text-white/60" />
          <input
            v-model="q"
            @input="run"
            type="text"
            placeholder="Buscar películas, series, géneros…"
            class="w-full bg-transparent text-sm outline-none placeholder:text-white/50"
          />
          <button v-if="q" @click="q = ''; localResults = []; discoverResults = []" class="text-white/60 hover:text-white">
            <Icon icon="mdi:close" />
          </button>
        </label>

        <!-- Tabs: local / discover -->
        <div class="mt-3 flex gap-2">
          <button
            @click="tab = 'local'; run()"
            class="chip"
            :class="{ 'chip-active': tab === 'local' }"
          >
            <Icon icon="mdi:home" /> Mi catálogo
          </button>
          <button
            @click="tab = 'discover'; run()"
            class="chip"
            :class="{ 'chip-active': tab === 'discover' }"
          >
            <Icon icon="mdi:earth" /> Descubrir
          </button>
        </div>

        <!-- Kind selector cuando estamos en discover -->
        <div v-if="tab === 'discover'" class="mt-3 flex gap-2">
          <button
            @click="kind = 'movie'; run()"
            class="chip"
            :class="{ 'chip-active': kind === 'movie' }"
          >Películas</button>
          <button
            @click="kind = 'series'; run()"
            class="chip"
            :class="{ 'chip-active': kind === 'series' }"
          >Series</button>
        </div>

        <div v-if="!q" class="mt-3 flex gap-2 overflow-x-auto no-scrollbar">
          <button
            v-for="s in suggestions"
            :key="s"
            @click="q = s; tab = 'local'; run()"
            class="chip shrink-0"
          >
            {{ s }}
          </button>
        </div>
      </div>

      <!-- Loading skeletons -->
      <div v-if="loading" class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        <div v-for="i in 12" :key="i" class="aspect-[2/3] animate-pulse rounded-xl bg-ink-700"></div>
      </div>

      <!-- Local results (mi catálogo) -->
      <MediaGrid v-else-if="tab === 'local' && q && localResults.length" :items="localResults" />

      <!-- Discover results (TMDB vía Radarr/Sonarr) — con botón Pedir -->
      <section v-else-if="tab === 'discover' && q && discoverResults.length" class="space-y-3">
        <h2 class="text-lg font-bold">Resultados · {{ discoverResults.length }}</h2>
        <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          <RequestCard
            v-for="item in discoverResults"
            :key="`${item.external_id}-${item.kind}`"
            :item="item"
            :loading="requesting === `${item.external_id}-${item.kind}`"
            :requested="requested.has(`${item.external_id}-${item.kind}`)"
            @request="sendRequest(item)"
          />
        </div>
      </section>

      <!-- Empty state cuando no hay query -->
      <section v-else-if="!q" class="space-y-4">
        <h2 class="text-base font-bold">Tendencias para inspirarte</h2>
        <MediaGrid :items="trending8" />
      </section>

      <!-- Empty state cuando hay query pero 0 resultados -->
      <div v-else class="py-16 text-center">
        <Icon icon="mdi:magnify-close" class="mx-auto text-5xl text-white/30" />
        <p class="mt-3 text-white/60">Sin resultados para "{{ q }}"</p>
      </div>
    </div>
  </div>
</template>