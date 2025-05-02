<script setup>
import { RouterView } from 'vue-router'
import { useThemeStore } from '@/stores/themeStore';
import ThemePageWrapper from './Components/ThemePageWrapper.vue';
const themeStore = useThemeStore();
themeStore.applyTheme(themeStore.currentDepartment); // Aplicar tema al iniciar
</script>

<template>
  <ThemePageWrapper>
    <RouterView />
  </ThemePageWrapper>
</template>

<style>

</style>
