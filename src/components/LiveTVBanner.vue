<script setup>
import { Icon } from '@iconify/vue'
</script>

<template>
  <section class="container-fluid mt-6">
    <a
      href="http://192.168.0.108:34400/web/"
      target="_blank"
      rel="noopener"
      class="flex items-center gap-3 rounded-xl bg-gradient-to-r from-purple-600/20 to-pink-600/20 px-4 py-3 ring-1 ring-white/10 hover:ring-white/30 transition"
    >
      <Icon icon="mdi:broadcast" class="text-2xl text-purple-400" />
      <div class="flex-1">
        <p class="text-sm font-semibold">TV en vivo · Threadfin</p>
        <p class="text-xs text-white/60">Canales IPTV con guía EPG — UI en http://192.168.0.108:34400/web/</p>
      </div>
      <Icon icon="mdi:chevron-right" class="text-white/40" />
    </a>
      <Icon icon="mdi:broadcast" class="text-2xl text-purple-400" />
      <div class="flex-1">
        <p class="text-sm font-semibold">TV en vivo · Threadfin</p>
        <p class="text-xs text-white/60">Canales IPTV con guía EPG — configurar lista M3U</p>
      </div>
      <Icon icon="mdi:chevron-right" class="text-white/40" />
    </a>
  </section>
</template>