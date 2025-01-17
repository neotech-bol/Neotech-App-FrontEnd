<template>
    <TopNavbarComponent />
    <NavbarComponent />

    <RouterView />
    
    <FooterComponente />
</template>
<script setup>
import TopNavbarComponent from '@/Components/InicioComponents/TopNavbarComponent.vue';
import NavbarComponent from '@/Components/InicioComponents/NavbarComponent.vue';
import FooterComponente from '@/Components/FooterComponents/FooterComponente.vue';
</script>
<style>
    
</style>