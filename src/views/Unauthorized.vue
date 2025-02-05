<template>
    <div>
        <h1>Acceso Denegado</h1>
        <p>No tienes permiso para acceder a esta página.</p>
        <router-link to="/">Volver a la página de inicio</router-link>
    </div>
</template>

<script>
export default {
    name: 'Unauthorized',
};
</script>