<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'

const props = defineProps({
  item: { type: Object, required: true },
  size: { type: String, default: 'md' }, // 'sm' | 'md' | 'lg'
  showRequest: { type: Boolean, default: true }
})

const emit = defineEmits(['request'])

const router = useRouter()
const open = () => router.push({ name: 'player', params: { id: props.item.id } })

const aspect = computed(() => (props.item.kind === 'series' ? 'aspect-[16/10]' : 'aspect-[2/3]'))
const widthCls = computed(() => {
  if (props.size === 'sm') return 'w-28 sm:w-32'
  if (props.size === 'lg') return 'w-44 sm:w-56'
  return 'w-36 sm:w-44'
})

const hasStorage = computed(() => !!props.item.storage_key)
const requesting = ref(false)
const requested = ref(false)

async function ask() {
  if (!props.item.external_id && !props.item.tmdb_id) return
  requesting.value = true
  try {
    await emit('request', props.item)
    requested.value = true
  } finally {
    requesting.value = false
  }
}
</script>

<template>
  <div :class="['group relative shrink-0 snap-start overflow-hidden rounded-xl bg-ink-700 ring-1 ring-white/5 card-hover text-left', widthCls, aspect]">
    <button
      type="button"
      @click="open"
      class="absolute inset-0 z-0"
      :aria-label="`Ver ${item.title}`"
    />
    <img
      :src="item.poster || `https://placehold.co/500x750/262626/999?text=${encodeURIComponent(item.title)}`"
      :alt="item.title"
      loading="lazy"
      class="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-105"
      @error="(e) => e.target.src = `https://placehold.co/500x750/262626/999?text=${encodeURIComponent(item.title)}`"
    />

    <span v-if="item.kind === 'series'" class="pointer-events-none absolute left-2 top-2 rounded bg-black/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide backdrop-blur">
      Serie
    </span>

    <span
      v-if="hasStorage"
      class="pointer-events-none absolute right-2 top-2 rounded bg-emerald-500/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
    >
      Disponible
    </span>
    <span
      v-else
      class="pointer-events-none absolute right-2 top-2 rounded bg-amber-500/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
    >
      Próximamente
    </span>

    <span
      v-if="hasStorage"
      class="pointer-events-none absolute inset-0 grid place-items-center opacity-0 transition group-hover:opacity-100"
    >
      <span class="grid h-10 w-10 place-items-center rounded-full bg-white/90 text-black shadow-lg">
        <Icon icon="mdi:play" class="text-2xl" />
      </span>
    </span>

    <div class="pointer-events-none absolute inset-x-0 bottom-0 translate-y-2 bg-gradient-to-t from-black/95 via-black/60 to-transparent p-2.5 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
      <p class="line-clamp-2 text-xs font-semibold">{{ item.title }}</p>
      <p class="text-[10px] text-white/60">{{ item.year }} · ★ {{ item.rating }}</p>
    </div>

    <button
      v-if="!hasStorage && showRequest"
      @click.stop="ask"
      :disabled="requesting || requested"
      class="absolute inset-x-2 bottom-2 z-10 flex items-center justify-center gap-1 rounded-full bg-brand-500 py-1.5 text-xs font-bold text-white shadow-lg transition hover:bg-brand-600 disabled:opacity-60"
    >
      <template v-if="requested">
        <Icon icon="mdi:check" /> En cola
      </template>
      <template v-else-if="requesting">
        <Icon icon="mdi:loading" class="animate-spin" />
      </template>
      <template v-else>
        <Icon icon="mdi:download" /> Cargar
      </template>
    </button>
  </div>
</template>