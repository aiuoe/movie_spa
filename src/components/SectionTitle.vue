<script setup>
defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' }
})
</script>

<template>
  <div class="container-fluid flex items-end justify-between gap-4">
    <div>
      <h2 class="text-xl font-extrabold tracking-tight sm:text-2xl">{{ title }}</h2>
      <p v-if="subtitle" class="mt-1 text-sm text-white/60">{{ subtitle }}</p>
    </div>
    <slot name="actions" />
  </div>
</template>