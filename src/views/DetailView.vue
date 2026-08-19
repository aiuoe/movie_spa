<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { useMedia } from '@/composables/useMedia'
import MediaCard from '@/components/MediaCard.vue'
import { Icon } from '@iconify/vue'

const route = useRoute()
const router = useRouter()
const { getById, request, lookup } = useMedia()

const media = ref(null)
const loading = ref(true)
const requesting = ref(false)
const requested = ref(false)
const error = ref(null)

async function load() {
  loading.value = true
  error.value = null
  media.value = null
  requested.value = false

  const id = route.params.id
  try {
    media.value = await getById(id)
    if (!media.value) {
      error.value = 'No encontrado'
    }
  } catch (e) {
    error.value = e.message
  }
  loading.value = false
}

onMounted(load)
watch(() => route.params.id, load)

const hasStorage = computed(() => !!media.value?.storage_key)
const isEstreno = computed(() => !!media.value?.is_estreno)

async function ask() {
  if (!media.value) return
  requesting.value = true
  try {
    // Buscar el external_id (TMDB/TVDB) antes de pedir
    const kind = media.value.kind === 'series' ? 'series' : 'movie'
    const results = await lookup(media.value.title, kind)
    const found = results[0]
    if (found && found.external_id) {
      await request({
        kind,
        title: found.title || media.value.title,
        external_id: found.external_id
      })
      requested.value = true
    } else {
      error.value = 'No se encontró "' + media.value.title + '" en TMDB. Probá desde /search.'
    }
  } catch (e) {
    error.value = e.message
  } finally {
    requesting.value = false
  }
}

function playNow() {
  router.push({ name: 'player', params: { id: route.params.id } })
}

function back() {
  if (window.history.length > 1) router.back()
  else router.push('/')
}
</script>

<template>
  <div class="min-h-[100dvh] bg-ink-900 pb-24">
    <!-- Botón volver flotante -->
    <button
      @click="back"
      class="fixed left-4 top-4 z-30 grid h-10 w-10 place-items-center rounded-full bg-black/60 backdrop-blur hover:bg-black/80"
      aria-label="Volver"
    >
      <Icon icon="mdi:arrow-left" class="text-xl" />
    </button>

    <!-- Loading -->
    <div v-if="loading" class="grid min-h-screen place-items-center">
      <Icon icon="mdi:loading" class="animate-spin text-5xl text-white/40" />
    </div>

    <!-- Error -->
    <div v-else-if="error" class="grid min-h-screen place-items-center p-6 text-center">
      <div>
        <Icon icon="mdi:alert-circle-outline" class="mx-auto text-6xl text-white/40" />
        <p class="mt-3 text-white/70">{{ error }}</p>
        <RouterLink to="/" class="btn-secondary mt-4">
          <Icon icon="mdi:home" /> Volver al home
        </RouterLink>
      </div>
    </div>

    <!-- Contenido -->
    <div v-else-if="media">
      <!-- Backdrop hero -->
      <div class="relative">
        <div class="aspect-video w-full overflow-hidden">
          <img
            v-if="media.backdrop"
            :src="media.backdrop"
            :alt="media.title"
            class="h-full w-full object-cover"
          />
          <div v-else class="h-full w-full bg-ink-700" />
        </div>
        <div class="absolute inset-0 bg-gradient-to-t from-ink-900 via-ink-900/70 to-transparent" />
      </div>

      <div class="container-fluid -mt-32 relative z-10 space-y-6">
        <!-- Header: poster + meta + acciones -->
        <div class="flex flex-col gap-6 sm:flex-row">
          <!-- Poster -->
          <div class="shrink-0">
            <img
              v-if="media.poster"
              :src="media.poster"
              :alt="media.title"
              class="w-44 rounded-xl shadow-2xl ring-1 ring-white/10 sm:w-56"
            />
            <div v-else class="grid w-44 aspect-[2/3] place-items-center rounded-xl bg-ink-700 sm:w-56">
              <Icon icon="mdi:movie-off" class="text-5xl text-white/30" />
            </div>
          </div>

          <!-- Info + acciones -->
          <div class="flex-1 space-y-4">
            <div class="flex flex-wrap items-center gap-2">
              <span class="rounded bg-white/15 px-2 py-0.5 text-xs font-semibold uppercase">
                {{ media.kind === 'series' ? 'Serie' : 'Película' }}
              </span>
              <span
                v-if="hasStorage"
                class="rounded bg-emerald-500 px-2 py-0.5 text-xs font-bold uppercase"
              >✓ Disponible</span>
              <span
                v-else-if="isEstreno"
                class="rounded bg-amber-500 px-2 py-0.5 text-xs font-bold uppercase"
              >⭐ Estreno</span>
              <span
                v-else
                class="rounded bg-white/15 px-2 py-0.5 text-xs font-semibold uppercase"
              >Pendiente</span>
            </div>

            <h1 class="text-3xl font-extrabold leading-tight sm:text-4xl">{{ media.title }}</h1>

            <div class="flex flex-wrap items-center gap-3 text-sm text-white/80">
              <span class="font-semibold">{{ media.year }}</span>
              <span>·</span>
              <span class="flex items-center gap-1">
                <Icon icon="mdi:star" class="text-yellow-400" />
                {{ media.rating }}
              </span>
              <span>·</span>
              <span>{{ media.duration }}</span>
              <span v-if="media.lang" class="rounded bg-white/10 px-2 py-0.5 text-xs uppercase">{{ media.lang }}</span>
            </div>

            <div v-if="media.genres?.length" class="flex flex-wrap gap-2">
              <span
                v-for="g in media.genres"
                :key="g"
                class="rounded-full border border-white/20 px-3 py-1 text-xs"
              >{{ g }}</span>
            </div>

            <p class="max-w-2xl text-sm leading-relaxed text-white/80 sm:text-base">
              {{ media.overview }}
            </p>

            <!-- Acciones -->
            <div class="flex flex-wrap gap-3 pt-2">
              <button
                v-if="hasStorage"
                @click="playNow"
                class="btn-primary"
              >
                <Icon icon="mdi:play" /> Reproducir
              </button>
              <button
                v-else-if="requested"
                disabled
                class="btn bg-emerald-500 text-white"
              >
                <Icon icon="mdi:check" /> Pedido enviado
              </button>
              <button
                v-else
                @click="ask"
                :disabled="requesting"
                class="btn-primary"
              >
                <Icon v-if="requesting" icon="mdi:loading" class="animate-spin" />
                <Icon v-else icon="mdi:download" />
                {{ requesting ? 'Pidiendo…' : 'Cargar' }}
              </button>
              <button class="btn-secondary">
                <Icon icon="mdi:plus" /> Mi lista
              </button>
              <button class="btn-secondary">
                <Icon icon="mdi:thumb-up-outline" />
              </button>
              <button class="btn-secondary">
                <Icon icon="mdi:share-variant" />
              </button>
            </div>

            <p v-if="error" class="text-sm text-red-400">
              <Icon icon="mdi:alert" /> {{ error }}
            </p>
          </div>
        </div>

        <!-- Detalles extendidos -->
        <section v-if="media.cast?.length" class="space-y-3">
          <h2 class="text-xl font-bold">Reparto</h2>
          <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
            <div v-for="actor in media.cast" :key="actor" class="rounded-xl bg-white/5 p-3 text-center">
              <div class="mx-auto grid h-16 w-16 place-items-center rounded-full bg-ink-600">
                <Icon icon="mdi:account" class="text-2xl text-white/50" />
              </div>
              <p class="mt-2 text-sm font-medium">{{ actor }}</p>
            </div>
          </div>
        </section>

        <section v-if="media.director" class="space-y-2">
          <h2 class="text-xl font-bold">Dirección</h2>
          <p class="text-white/80">{{ media.director }}</p>
        </section>

        <!-- Temporadas (placeholder para series) -->
        <section v-if="media.kind === 'series'" class="space-y-3">
          <h2 class="text-xl font-bold">Temporadas</h2>
          <div class="rounded-xl bg-white/5 p-4 text-sm text-white/60">
            <Icon icon="mdi:information-outline" class="mr-2" />
            Las temporadas aparecerán después de pedir el título.
          </div>
        </section>

        <!-- Similares -->
        <section v-if="media.similar?.length" class="space-y-3">
          <h2 class="text-xl font-bold">También te puede gustar</h2>
          <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            <MediaCard v-for="m in media.similar" :key="m.id" :item="m" :show-request="false" />
          </div>
        </section>
      </div>
    </div>
  </div>
</template>