<script setup>
import TopBar from '@/components/TopBar.vue'
import { Icon } from '@iconify/vue'

const profiles = [
  { name: 'Tú', color: 'from-brand-500 to-brand-700', active: true },
  { name: 'Invitado', color: 'from-blue-500 to-blue-700' },
  { name: 'Niños', color: 'from-emerald-500 to-emerald-700' },
  { name: 'Añadir', color: 'from-white/20 to-white/10', isAdd: true }
]

const items = [
  { icon: 'mdi:account-outline', label: 'Cuenta' },
  { icon: 'mdi:bell-outline', label: 'Notificaciones' },
  { icon: 'mdi:download-outline', label: 'Descargas' },
  { icon: 'mdi:cellphone', label: 'Dispositivos' },
  { icon: 'mdi:shield-check-outline', label: 'Privacidad' },
  { icon: 'mdi:help-circle-outline', label: 'Ayuda' }
]
</script>

<template>
  <div class="min-h-[100dvh] pb-24">
    <TopBar />

    <div class="container-fluid mt-2 space-y-8">
      <section class="space-y-3">
        <h2 class="text-base font-bold">Perfiles</h2>
        <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <button
            v-for="p in profiles"
            :key="p.name"
            class="space-y-2 text-center transition hover:opacity-90"
          >
            <div
              :class="['mx-auto grid aspect-square w-24 place-items-center rounded-xl bg-gradient-to-br text-2xl font-extrabold', p.color, p.active ? 'ring-2 ring-white' : '']"
            >
              <Icon v-if="p.isAdd" icon="mdi:plus" class="text-3xl text-white/80" />
              <span v-else>{{ p.name[0] }}</span>
            </div>
            <p class="text-xs font-semibold" :class="p.active ? 'text-white' : 'text-white/70'">
              {{ p.name }}
            </p>
          </button>
        </div>
      </section>

      <section class="space-y-2">
        <h2 class="text-base font-bold">Ajustes</h2>
        <ul class="divide-y divide-white/10 rounded-xl bg-white/5">
          <li v-for="i in items" :key="i.label">
            <button class="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-white/5">
              <span class="flex items-center gap-3">
                <Icon :icon="i.icon" class="text-white/70" />
                <span class="text-sm font-medium">{{ i.label }}</span>
              </span>
              <Icon icon="mdi:chevron-right" class="text-white/40" />
            </button>
          </li>
        </ul>
      </section>

      <p class="text-center text-xs text-white/40">movie_spa · v0.1.0 · self-hosted</p>
    </div>
  </div>
</template>