<template>
    <NavbarProViewComponent />
    <RouterView/>
    <ComunicadoModal />
    <FooterComponente />
</template>
<script setup>
import NavbarProViewComponent from '@/Components/InicioComponents/NavbarProViewComponent.vue';
import FooterComponente from '@/Components/FooterComponents/FooterComponente.vue';
import ComunicadoModal from '@/Components/ComunicadoModal.vue';
</script>
<style>
    
</style>