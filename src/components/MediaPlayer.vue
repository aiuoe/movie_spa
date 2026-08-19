<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { Icon } from '@iconify/vue'

const props = defineProps({
  src: { type: String, required: true },
  poster: { type: String, default: '' },
  title: { type: String, default: '' }
})

const videoEl = ref(null)
const playing = ref(false)
const muted = ref(false)
const fullscreen = ref(false)
const progress = ref(0)
const duration = ref(0)
const current = ref(0)
const buffered = ref(0)
const showControls = ref(true)
let hideTimer = null

function fmt(s) {
  if (!isFinite(s)) return '0:00'
  const m = Math.floor(s / 60)
  const r = Math.floor(s % 60)
  return `${m}:${r.toString().padStart(2, '0')}`
}

function togglePlay() {
  const v = videoEl.value
  if (!v) return
  if (v.paused) v.play()
  else v.pause()
}

function toggleMute() {
  const v = videoEl.value
  if (!v) return
  v.muted = !v.muted
  muted.value = v.muted
}

function onTime() {
  const v = videoEl.value
  if (!v) return
  current.value = v.currentTime
  duration.value = v.duration
  progress.value = (v.currentTime / v.duration) * 100 || 0
  if (v.buffered.length) {
    buffered.value = (v.buffered.end(v.buffered.length - 1) / v.duration) * 100
  }
}

function seek(e) {
  const v = videoEl.value
  if (!v || !v.duration) return
  const rect = e.currentTarget.getBoundingClientRect()
  const pct = (e.clientX - rect.left) / rect.width
  v.currentTime = pct * v.duration
}

function toggleFullscreen() {
  const v = videoEl.value
  if (!v) return
  if (!document.fullscreenElement) v.requestFullscreen?.()
  else document.exitFullscreen?.()
}

function wakeControls() {
  showControls.value = true
  clearTimeout(hideTimer)
  hideTimer = setTimeout(() => {
    if (playing.value) showControls.value = false
  }, 2500)
}

function onKey(e) {
  if (e.code === 'Space') { e.preventDefault(); togglePlay() }
  if (e.key.toLowerCase() === 'm') toggleMute()
  if (e.key === 'ArrowRight') videoEl.value && (videoEl.value.currentTime += 5)
  if (e.key === 'ArrowLeft') videoEl.value && (videoEl.value.currentTime -= 5)
  if (e.key.toLowerCase() === 'f') toggleFullscreen()
}

onMounted(() => {
  document.addEventListener('keydown', onKey)
  document.addEventListener('fullscreenchange', () => {
    fullscreen.value = !!document.fullscreenElement
  })
  wakeControls()
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKey)
  clearTimeout(hideTimer)
})

watch(() => props.src, () => {
  if (videoEl.value) {
    videoEl.value.load()
    videoEl.value.play().catch(() => {})
  }
})
</script>

<template>
  <div
    class="relative h-full w-full bg-black select-none"
    @mousemove="wakeControls"
    @click="togglePlay"
  >
    <video
      ref="videoEl"
      :src="src"
      :poster="poster"
      class="h-full w-full object-contain"
      playsinline
      autoplay
      @timeupdate="onTime"
      @play="playing = true; wakeControls()"
      @pause="playing = false; showControls = true"
    ></video>

    <!-- Backdrop click transparente para captar click play/pause -->
    <div class="pointer-events-none absolute inset-0"></div>

    <!-- Top bar (título + back) -->
    <transition name="fade">
      <div v-if="showControls" class="pointer-events-none absolute inset-x-0 top-0 z-10">
        <slot name="top" />
      </div>
    </transition>

    <!-- Center play/pause -->
    <transition name="fade">
      <div v-if="showControls && !playing" class="pointer-events-none absolute inset-0 z-10 grid place-items-center">
        <button class="grid h-20 w-20 place-items-center rounded-full bg-white/90 text-black shadow-2xl">
          <Icon icon="mdi:play" class="text-4xl" />
        </button>
      </div>
    </transition>

    <!-- Bottom controls -->
    <transition name="fade">
      <div
        v-if="showControls"
        class="pointer-events-auto absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/90 via-black/50 to-transparent px-4 pb-6 pt-12 sm:px-8"
      >
        <!-- Progress -->
        <div class="relative h-1 cursor-pointer rounded-full bg-white/15" @click.stop="seek">
          <div class="absolute inset-y-0 left-0 rounded-full bg-white/30" :style="{ width: buffered + '%' }"></div>
          <div class="absolute inset-y-0 left-0 rounded-full bg-brand-500" :style="{ width: progress + '%' }"></div>
        </div>

        <div class="mt-3 flex items-center justify-between gap-3 text-sm">
          <div class="flex items-center gap-3">
            <button @click.stop="togglePlay" class="grid h-9 w-9 place-items-center rounded-full hover:bg-white/15">
              <Icon :icon="playing ? 'mdi:pause' : 'mdi:play'" class="text-2xl" />
            </button>
            <button @click.stop="toggleMute" class="grid h-9 w-9 place-items-center rounded-full hover:bg-white/15">
              <Icon :icon="muted ? 'mdi:volume-off' : 'mdi:volume-high'" class="text-xl" />
            </button>
            <span class="tabular-nums text-white/80">{{ fmt(s) }} / {{ fmt(duration) }}</span>
          </div>
          <div class="flex items-center gap-3">
            <button class="hidden sm:grid h-9 w-9 place-items-center rounded-full hover:bg-white/15" title="Settings">
              <Icon icon="mdi:cog-outline" class="text-xl" />
            </button>
            <button @click.stop="toggleFullscreen" class="grid h-9 w-9 place-items-center rounded-full hover:bg-white/15">
              <Icon :icon="fullscreen ? 'mdi:fullscreen-exit' : 'mdi:fullscreen'" class="text-xl" />
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity .2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>