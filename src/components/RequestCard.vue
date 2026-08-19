<script setup>
import { Icon } from '@iconify/vue'

const props = defineProps({
  item: { type: Object, required: true },
  loading: { type: Boolean, default: false },
  requested: { type: Boolean, default: false }
})
const emit = defineEmits(['request'])
</script>

<template>
  <div class="group relative overflow-hidden rounded-xl bg-ink-700 ring-1 ring-white/5 text-left">
    <!-- Poster -->
    <div class="aspect-[2/3] overflow-hidden bg-ink-600">
      <img
        v-if="item.poster"
        :src="item.poster"
        :alt="item.title"
        loading="lazy"
        class="h-full w-full object-cover transition duration-300 group-hover:scale-105"
      />
      <div v-else class="grid h-full w-full place-items-center text-white/30">
        <Icon icon="mdi:movie-off-outline" class="text-5xl" />
      </div>
    </div>

    <!-- Overlay con info + botón -->
    <div class="absolute inset-x-0 bottom-0 translate-y-2 bg-gradient-to-t from-black/95 via-black/60 to-transparent p-3 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
      <p class="line-clamp-2 text-xs font-semibold">{{ item.title }}</p>
      <p class="text-[10px] text-white/60">{{ item.year }} · {{ item.kind === 'series' ? 'Serie' : 'Película' }}</p>
    </div>

    <!-- Botón Pedir — siempre visible abajo -->
    <div class="absolute inset-x-0 bottom-0 p-2">
      <button
        @click="emit('request')"
        :disabled="loading || requested"
        class="flex w-full items-center justify-center gap-1.5 rounded-full bg-brand-500 py-1.5 text-xs font-semibold text-white shadow-lg transition hover:bg-brand-600 disabled:opacity-60"
      >
        <template v-if="requested">
          <Icon icon="mdi:check" /> Pedido
        </template>
        <template v-else-if="loading">
          <Icon icon="mdi:loading" class="animate-spin" /> Pidiendo…
        </template>
        <template v-else>
          <Icon icon="mdi:download" /> Pedir
        </template>
      </button>
    </div>
  </div>
</template>