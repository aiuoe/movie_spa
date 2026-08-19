<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { useMedia } from '@/composables/useMedia'
import MediaPlayer from '@/components/MediaPlayer.vue'
import MediaCard from '@/components/MediaCard.vue'
import { Icon } from '@iconify/vue'

const route = useRoute()
const router = useRouter()
const { getById } = useMedia()

const media = ref(null)
const loading = ref(true)
const selectedEpisode = ref(null)

async function load() {
  loading.value = true
  media.value = await getById(route.params.id)
  selectedEpisode.value = media.value?.episodes?.[0] || null
  loading.value = false
}

onMounted(load)
watch(() => route.params.id, load)

const playSrc = computed(() => {
  if (!media.value) return ''
  // Cuando movie_api esté listo, esto se reemplaza por la URL real del stream.
  return media.value.source
})

function back() {
  if (window.history.length > 1) router.back()
  else router.push('/')
}
</script>

<template>
  <div class="min-h-[100dvh] bg-ink-900 pb-24 lg:pb-0">
    <!-- Layout responsive: en móvil el player arriba, en desktop pantalla completa con panel lateral -->
    <div class="lg:grid lg:min-h-[100dvh] lg:grid-cols-[1fr_360px] xl:grid-cols-[1fr_420px]">
      <!-- Player -->
      <div class="relative bg-black lg:h-[100dvh]">
        <MediaPlayer :src="playSrc" :poster="media?.backdrop" :title="media?.title">
          <template #top>
            <div class="pointer-events-auto flex items-center justify-between gap-3 bg-gradient-to-b from-black/80 to-transparent px-4 py-3 sm:px-6">
              <button @click="back" class="grid h-9 w-9 place-items-center rounded-full bg-white/15 hover:bg-white/25 backdrop-blur">
                <Icon icon="mdi:arrow-left" class="text-xl" />
              </button>
              <div class="min-w-0 flex-1 text-center">
                <p class="truncate text-sm font-semibold sm:text-base">{{ media?.title }}</p>
                <p v-if="selectedEpisode" class="truncate text-xs text-white/60">
                  {{ selectedEpisode.title }}
                </p>
              </div>
              <div class="flex items-center gap-2">
                <button class="grid h-9 w-9 place-items-center rounded-full bg-white/15 hover:bg-white/25 backdrop-blur">
                  <Icon icon="mdi:cast" class="text-xl" />
                </button>
              </div>
            </div>
          </template>
        </MediaPlayer>

        <!-- Loading -->
        <div v-if="loading" class="absolute inset-0 grid place-items-center bg-ink-900">
          <Icon icon="mdi:loading" class="animate-spin text-4xl text-white/60" />
        </div>
      </div>

      <!-- Side panel: metadata + episodes + similar -->
      <aside v-if="media" class="container-fluid space-y-6 py-6 lg:h-[100dvh] lg:overflow-y-auto lg:py-8">
        <div>
          <span class="chip">{{ media.kind === 'series' ? 'Serie' : 'Película' }}</span>
          <h1 class="mt-2 text-2xl font-extrabold leading-tight sm:text-3xl">{{ media.title }}</h1>
          <div class="mt-2 flex flex-wrap items-center gap-3 text-sm text-white/70">
            <span class="rounded bg-white/10 px-2 py-0.5">{{ media.year }}</span>
            <span class="flex items-center gap-1">
              <Icon icon="mdi:star" class="text-yellow-400" />
              {{ media.rating }}
            </span>
            <span>· {{ media.duration }}</span>
            <span v-for="g in media.genres" :key="g" class="rounded border border-white/15 px-2 py-0.5">
              {{ g }}
            </span>
          </div>
          <p class="mt-3 text-sm leading-relaxed text-white/80">{{ media.overview }}</p>
        </div>

        <div class="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p class="text-white/50">Dirección</p>
            <p class="font-medium">{{ media.director }}</p>
          </div>
          <div>
            <p class="text-white/50">Temporadas</p>
            <p class="font-medium">{{ media.seasons }}</p>
          </div>
          <div class="col-span-2">
            <p class="text-white/50">Reparto</p>
            <p class="font-medium">{{ media.cast.join(' · ') }}</p>
          </div>
        </div>

        <!-- Botones de acción -->
        <div class="flex flex-wrap gap-2">
          <button class="btn-primary"><Icon icon="mdi:download" /> Descargar</button>
          <button class="btn-secondary"><Icon icon="mdi:plus" /> Mi lista</button>
          <button class="btn-secondary"><Icon icon="mdi:thumb-up-outline" /></button>
          <button class="btn-secondary"><Icon icon="mdi:thumb-down-outline" /></button>
          <button class="btn-secondary"><Icon icon="mdi:share-variant" /></button>
        </div>

        <!-- Episodes (solo series) -->
        <section v-if="media.kind === 'series' && media.episodes?.length" class="space-y-3">
          <h3 class="text-base font-bold">Episodios</h3>
          <ul class="space-y-2">
            <li v-for="ep in media.episodes" :key="ep.id">
              <button
                @click="selectedEpisode = ep"
                class="flex w-full gap-3 rounded-lg bg-white/5 p-2 text-left transition hover:bg-white/10"
                :class="{ 'ring-2 ring-brand-500': selectedEpisode?.id === ep.id }"
              >
                <div class="relative aspect-video w-32 shrink-0 overflow-hidden rounded-md bg-ink-700 sm:w-40">
                  <img :src="ep.thumb" :alt="ep.title" class="absolute inset-0 h-full w-full object-cover" />
                  <span class="absolute inset-0 grid place-items-center bg-black/40 opacity-0 hover:opacity-100 transition">
                    <Icon icon="mdi:play-circle-outline" class="text-3xl" />
                  </span>
                </div>
                <div class="min-w-0 flex-1">
                  <p class="truncate text-sm font-semibold">{{ ep.title }}</p>
                  <p class="mt-1 line-clamp-2 text-xs text-white/60">{{ ep.overview }}</p>
                  <p class="mt-1 text-[10px] text-white/40">{{ ep.duration }}</p>
                </div>
              </button>
            </li>
          </ul>
        </section>

        <!-- Similar -->
        <section class="space-y-3">
          <h3 class="text-base font-bold">También te puede gustar</h3>
          <div class="grid grid-cols-3 gap-3 sm:grid-cols-3">
            <MediaCard v-for="m in media.similar" :key="m.id" :item="m" size="sm" />
          </div>
        </section>
      </aside>
    </div>
  </div>
</template>