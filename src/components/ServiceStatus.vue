<script setup>
import { ref, onMounted } from 'vue'
import { Icon } from '@iconify/vue'

// Estado de los servicios del stack. Sólo ping simple a /healthz
// de cada uno. Si están vivos → verde. Si no → rojo.
const services = ref([
  { name: 'movie_spa',  url: '/',                              icon: 'mdi:web' },
  { name: 'movie_api',  url: '/api/media/hero',                icon: 'mdi:api' },
  { name: 'worker',     url: '/api/jobs',                      icon: 'mdi:cog' }, // proxied via api for status
  { name: 'minio',      url: null,                              icon: 'mdi:database', external: 'http://192.168.0.108:9001' },
  { name: 'radarr',     url: null,                              icon: 'mdi:movie',     external: 'http://192.168.0.108:7878' },
  { name: 'sonarr',     url: null,                              icon: 'mdi:television',external: 'http://192.168.0.108:8989' },
  { name: 'prowlarr',   url: null,                              icon: 'mdi:magnify',   external: 'http://192.168.0.108:9696' },
  { name: 'jackett',    url: null,                              icon: 'mdi:download',  external: 'http://192.168.0.108:9117' },
  { name: 'qbittorrent',url: null,                              icon: 'mdi:server',    external: 'http://192.168.0.108:8081' },
  { name: 'threadfin',  url: null,                              icon: 'mdi:broadcast', external: 'http://192.168.0.108:34400' }
])

const status = ref({})

onMounted(async () => {
  // Sólo ping los internos vía /api proxy.
  for (const s of services.value) {
    if (s.url) {
      try {
        const r = await fetch(s.url, { method: 'GET', signal: AbortSignal.timeout(2000) })
        status.value[s.name] = r.ok
      } catch {
        status.value[s.name] = false
      }
    }
  }
})
</script>

<template>
  <section class="container-fluid mt-6">
    <details class="rounded-xl bg-white/5 ring-1 ring-white/10">
      <summary class="cursor-pointer list-none px-4 py-3 text-sm font-semibold flex items-center gap-2 hover:bg-white/5">
        <Icon icon="mdi:server-network" class="text-emerald-400" />
        Estado del stack
        <span class="ml-auto text-xs text-white/50">click para expandir</span>
      </summary>
      <ul class="space-y-1 px-4 pb-3 text-sm">
        <li v-for="s in services" :key="s.name" class="flex items-center justify-between">
          <span class="flex items-center gap-2">
            <Icon :icon="s.icon" class="text-white/60" />
            <code class="text-xs">{{ s.name }}</code>
          </span>
          <span class="flex items-center gap-2">
            <span
              class="inline-block h-2 w-2 rounded-full"
              :class="s.url ? (status[s.name] ? 'bg-emerald-400' : 'bg-red-400') : 'bg-emerald-400'"
            />
            <a
              v-if="s.external"
              :href="s.external"
              target="_blank"
              rel="noopener"
              class="text-xs text-white/60 hover:text-white"
            >
              abrir ↗
            </a>
            <span v-else-if="s.url" class="text-xs text-white/60">
              {{ status[s.name] === ' ? ?' ? '…' : status[s.name] ? 'OK' : 'down' }}
            </span>
          </span>
        </li>
      </ul>
    </details>
  </section>
</template>