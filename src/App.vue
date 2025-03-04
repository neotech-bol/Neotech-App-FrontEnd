<script setup>
import { RouterView } from 'vue-router'
import { useThemeStore } from '@/stores/themeStore';

const themeStore = useThemeStore();
themeStore.applyTheme(themeStore.currentDepartment); // Aplicar tema al iniciar
</script>

<template>
  <RouterView />
</template>

<style>

</style>
