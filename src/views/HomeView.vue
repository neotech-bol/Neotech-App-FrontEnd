<template>
  <div class="font-container">
    <CarruselDeImagenesComponent />
    <ProductsRecienLlegadosView />
    <ProductsBannerComponent />
  </div>
</template>

<script setup>
import CarruselDeImagenesComponent from '@/Components/InicioComponents/CarruselDeImagenesComponent.vue';
import ProductsBannerComponent from '@/Components/InicioComponents/ProductsBannerComponent.vue';
import ProductsRecienLlegadosView from '@/Components/InicioComponents/ProductsRecienLlegadosView.vue';
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

.font-container {
    font-family: 'Inter', sans-serif; /* Aplica la fuente a este contenedor */
}
</style>