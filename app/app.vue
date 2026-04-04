<template>
  <UApp>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <Analytics />
  </UApp>
</template>

<script setup>
import { Analytics } from '@vercel/analytics/nuxt'
</script>
