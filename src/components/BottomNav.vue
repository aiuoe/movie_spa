<script setup>
import { useRoute, RouterLink } from 'vue-router'
import { Icon } from '@iconify/vue'
import { computed } from 'vue'

const route = useRoute()
const tabs = [
  { to: '/', name: 'home', label: 'Inicio', icon: 'mdi:home-outline', active: 'mdi:home' },
  { to: '/library', name: 'library', label: 'Biblioteca', icon: 'mdi:view-grid-outline', active: 'mdi:view-grid' },
  { to: '/search', name: 'search', label: 'Buscar', icon: 'mdi:magnify', active: 'mdi:magnify' },
  { to: '/profile', name: 'profile', label: 'Perfil', icon: 'mdi:account-circle-outline', active: 'mdi:account-circle' }
]
const activeName = computed(() => route.name)
</script>

<template>
  <nav
    class="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-ink-900/90 backdrop-blur lg:hidden"
    style="padding-bottom: env(safe-area-inset-bottom)"
  >
    <ul class="grid grid-cols-4">
      <li v-for="t in tabs" :key="t.name">
        <RouterLink
          :to="t.to"
          class="flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-medium transition"
          :class="activeName === t.name ? 'text-white' : 'text-white/50 hover:text-white/80'"
        >
          <Icon :icon="activeName === t.name ? t.active : t.icon" class="text-xl" />
          {{ t.label }}
        </RouterLink>
      </li>
    </ul>
  </nav>
</template>