<template>
    <ThemePageWrapper>
        <QuienesSomosComponents />
        <ServiciosComponente />
        <TestimoniosComponente />
        <EstadiscticasAndPersonal />
    </ThemePageWrapper>
</template>

<script setup>
import ThemePageWrapper from '@/components/ThemePageWrapper.vue';
import QuienesSomosComponents from '@/Components/NosotrosComponents/QuienesSomosComponents.vue';
import ServiciosComponente from '@/Components/NosotrosComponents/ServiciosComponente.vue';
import TestimoniosComponente from '@/Components/NosotrosComponents/TestimoniosComponente.vue';
import EstadiscticasAndPersonal from '@/Components/NosotrosComponents/EstadiscticasAndPersonal.vue';
</script>