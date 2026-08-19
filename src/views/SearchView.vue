<script setup>
import { ref, computed } from 'vue'
import TopBar from '@/components/TopBar.vue'
import MediaGrid from '@/components/MediaGrid.vue'
import { Icon } from '@iconify/vue'
import { useMedia } from '@/composables/useMedia'

const { search, trending } = useMedia()
const q = ref('')
const results = ref([])
const loading = ref(false)

async function run() {
  loading.value = true
  results.value = await search(q.value)
  loading.value = false
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
          <button v-if="q" @click="q = ''; results = []" class="text-white/60 hover:text-white">
            <Icon icon="mdi:close" />
          </button>
        </label>

        <div class="mt-3 flex gap-2 overflow-x-auto no-scrollbar">
          <button
            v-for="s in suggestions"
            :key="s"
            @click="q = s; run()"
            class="chip shrink-0"
          >
            {{ s }}
          </button>
        </div>
      </div>

      <div v-if="loading" class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        <div v-for="i in 12" :key="i" class="aspect-[2/3] animate-pulse rounded-xl bg-ink-700"></div>
      </div>

      <MediaGrid v-else-if="results.length" :items="results" />

      <section v-else class="space-y-4">
        <h2 class="text-base font-bold">Tendencias para inspirarte</h2>
        <MediaGrid :items="trending8" />
      </section>
    </div>
  </div>
</template>