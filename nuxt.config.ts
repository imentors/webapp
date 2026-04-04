// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  css: ['~/assets/css/main.css'],

  modules: [
    '@nuxt/eslint',
    '@nuxt/image',
    '@nuxt/scripts',
    '@nuxt/test-utils',
    '@nuxt/ui',
    'nuxt-charts'
  ],

  runtimeConfig: {
    brevoApiKey: process.env.NUXT_BREVO_API_KEY,
    betterAuthSecret: process.env.NUXT_BETTER_AUTH_SECRET,
    openaiApiKey: process.env.NUXT_OPENAI_API_KEY,
    awsRegion: process.env.NUXT_AWS_REGION,
    awsAccessKeyId: process.env.NUXT_AWS_ACCESS_KEY_ID,
    awsSecretAccessKey: process.env.NUXT_AWS_SECRET_ACCESS_KEY,
    awsS3Bucket: process.env.NUXT_AWS_S3_BUCKET,
    awsEndpointUrl: process.env.AWS_ENDPOINT_URL,
    googleMapsApiKey: process.env.NUXT_GOOGLE_MAPS_API_KEY,
    public: {
      betterAuthUrl: process.env.NUXT_BETTER_AUTH_URL || 'http://localhost:3000',
      stripePublishableKey: process.env.NUXT_STRIPE_PUBLISHABLE_KEY,
    },
  },
})