<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'

const props = defineProps({
  item: { type: Object, required: true },
  size: { type: String, default: 'md' } // 'sm' | 'md' | 'lg'
})

const router = useRouter()
const open = () => router.push({ name: 'player', params: { id: props.item.id } })

const aspect = computed(() => (props.item.kind === 'series' ? 'aspect-[16/10]' : 'aspect-[2/3]'))
const widthCls = computed(() => {
  if (props.size === 'sm') return 'w-28 sm:w-32'
  if (props.size === 'lg') return 'w-44 sm:w-56'
  return 'w-36 sm:w-44'
})
</script>

<template>
  <button
    type="button"
    @click="open"
    :class="[
      'group relative shrink-0 snap-start overflow-hidden rounded-xl bg-ink-700 ring-1 ring-white/5 card-hover text-left',
      widthCls,
      aspect
    ]"
  >
    <img
      :src="item.poster"
      :alt="item.title"
      loading="lazy"
      class="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-105"
    />

    <!-- Overlay info en hover -->
    <div class="absolute inset-x-0 bottom-0 translate-y-2 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 gradient-overlay p-3">
      <p class="line-clamp-2 text-xs font-semibold">{{ item.title }}</p>
      <div class="mt-1 flex items-center gap-2 text-[10px] text-white/70">
        <span class="rounded bg-white/15 px-1.5 py-0.5">{{ item.year }}</span>
        <span class="flex items-center gap-0.5">
          <Icon icon="mdi:star" class="text-yellow-400" />
          {{ item.rating }}
        </span>
      </div>
    </div>

    <!-- Badge kind -->
    <span
      v-if="item.kind === 'series'"
      class="absolute left-2 top-2 rounded bg-black/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide backdrop-blur"
    >
      Serie
    </span>

    <!-- Botón play centrado en hover -->
    <span class="absolute inset-0 grid place-items-center opacity-0 transition group-hover:opacity-100">
      <span class="grid h-10 w-10 place-items-center rounded-full bg-white/90 text-black shadow-lg">
        <Icon icon="mdi:play" class="text-2xl" />
      </span>
    </span>
  </button>
</template>