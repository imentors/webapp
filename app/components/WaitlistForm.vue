<script setup lang="ts">
import { ref } from "vue";

const toast = useToast();

const email = ref("");
const name = ref("");
const isLoading = ref(false);

const handleSubmit = async () => {

  isLoading.value = true;

  try {
    const { error } = await useFetch("/api/waitlist", {
      method: "POST",
      body: { 
        email: email.value,
        name: name.value 
      },
    });

    if (error.value) {
      throw error.value;
    }
    toast.add({
      title: "Success!",
      description: "Thanks for joining!",
      color: "success",
    });
    email.value = "";
    name.value = "";
  } catch (error: any) {
    toast.add({
      title: "Error joining waitlist",
      description: "Failed to join. Try again.",
      color: "error",
    });
    console.error("Error joining waitlist:", error);
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="w-full max-w-lg">
    <form
      @submit.prevent="handleSubmit"
      class="flex flex-col gap-2 md:gap-4 w-full"
    >
      <div class="flex flex-col sm:flex-row gap-2 w-full">
        <UInput
          v-model="name"
          type="text"
          placeholder="Your name"
          :disabled="isLoading"
          class="flex-1"
          size="xl"
          required
        />
      </div>
      <div class="flex flex-col sm:flex-row gap-2 w-full">
        <UInput
          v-model="email"
          type="email"
          placeholder="Your email"
          :disabled="isLoading"
          class="flex-1"
          size="xl"
          required
        />

        <UButton
          type="submit"
          :loading="isLoading"
          color="primary"
          size="xl"
          class="whitespace-nowrap justify-center w-full sm:w-auto"
        >
          Join Waitlist
        </UButton>
      </div>
    </form>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
