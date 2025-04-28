<script setup>
import { RouterView } from 'vue-router'
import { useThemeStore } from '@/stores/themeStore';
import WhastsAppBubble from './Components/WhastsAppBubble.vue';
import ThemePageWrapper from './Components/ThemePageWrapper.vue';
const themeStore = useThemeStore();
themeStore.applyTheme(themeStore.currentDepartment); // Aplicar tema al iniciar
</script>

<template>
  <ThemePageWrapper>
    <RouterView />
    <WhastsAppBubble />
  </ThemePageWrapper>
</template>

<style>

</style>
