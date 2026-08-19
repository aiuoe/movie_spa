<script setup>
import { ref, onMounted } from 'vue'
import TopBar from '@/components/TopBar.vue'
import { Icon } from '@iconify/vue'

const channels = ref([])
const loading = ref(true)
const filter = ref('all')

async function load() {
  loading.value = true
  try {
    const r = await fetch('/api/livetv')
    if (r.ok) channels.value = await r.json()
  } catch (e) {
    console.warn('livetv', e)
  }
  loading.value = false
}

onMounted(load)

function logoUrl(ch) {
  return ch.Logo || ch.logo || ''
}
</script>

<template>
  <div class="min-h-[100dvh] pb-24">
    <TopBar />

    <div class="container-fluid mt-2 space-y-4">
      <header>
        <h1 class="text-2xl font-extrabold">TV en vivo</h1>
        <p class="mt-1 text-sm text-white/60">
          Canales IPTV via Threadfin · configurar lista M3U en
          <a href="http://192.168.0.108:34400/web/" target="_blank" class="underline">threadfin.local:34400</a>
        </p>
      </header>

      <div v-if="loading" class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        <div v-for="i in 8" :key="i" class="aspect-video animate-pulse rounded-xl bg-ink-700"></div>
      </div>

      <div v-else-if="!channels.length" class="py-16 text-center">
        <Icon icon="mdi:broadcast-off" class="mx-auto text-6xl text-white/30" />
        <p class="mt-4 text-white/60">No hay canales configurados</p>
        <p class="mt-2 text-sm text-white/40">
          Andá a <a href="http://192.168.0.108:34400/web/" target="_blank" class="underline">Threadfin UI</a>
          y pegá una lista M3U
        </p>
      </div>

      <div v-else class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        <a
          v-for="ch in channels"
          :key="ch._id || ch.Key || ch.Number"
          :href="ch.URL || ch.url || '#'"
          target="_blank"
          rel="noopener"
          class="group relative aspect-video overflow-hidden rounded-xl bg-ink-700 ring-1 ring-white/10 hover:ring-white/30 transition"
        >
          <img
            v-if="logoUrl(ch)"
            :src="logoUrl(ch)"
            :alt="ch.Name || ch.name"
            class="absolute inset-0 h-full w-full object-contain bg-black/80 p-3"
            @error="(e) => e.target.style.display = 'none'"
          />
          <div v-else class="absolute inset-0 grid place-items-center">
            <Icon icon="mdi:television" class="text-5xl text-white/30" />
          </div>
          <div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-2">
            <p class="line-clamp-1 text-xs font-semibold">{{ ch.Name || ch.name }}</p>
            <p class="text-[10px] text-white/60">#{{ ch.Number || ch.number }}</p>
          </div>
          <span class="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-red-500/90 text-white opacity-0 transition group-hover:opacity-100">
            <Icon icon="mdi:play" />
          </span>
        </a>
      </div>
    </div>
  </div>
</template>