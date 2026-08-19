<script setup>
import { Icon } from '@iconify/vue'
</script>

<template>
  <header
    class="sticky top-0 z-40 flex items-center justify-between bg-gradient-to-b from-ink-900/95 to-ink-900/0 px-4 py-3 backdrop-blur sm:px-6"
    style="padding-top: max(env(safe-area-inset-top), 0.75rem)"
  >
    <RouterLink to="/" class="flex items-center gap-2 text-lg font-extrabold tracking-tight">
      <Icon icon="mdi:play-box-multiple" class="text-brand-500 text-2xl" />
      <span class="hidden sm:inline">movie_spa</span>
    </RouterLink>

    <nav class="hidden items-center gap-6 text-sm font-medium md:flex">
      <RouterLink to="/" class="hover:text-white/80" active-class="text-white">Inicio</RouterLink>
      <RouterLink to="/library" class="text-white/70 hover:text-white">Biblioteca</RouterLink>
      <RouterLink to="/search" class="text-white/70 hover:text-white">Buscar</RouterLink>
      <RouterLink to="/profile" class="text-white/70 hover:text-white">Perfil</RouterLink>
    </nav>

    <button class="grid h-9 w-9 place-items-center rounded-full bg-white/10 hover:bg-white/20">
      <Icon icon="mdi:magnify" />
    </button>
  </header>
</template>