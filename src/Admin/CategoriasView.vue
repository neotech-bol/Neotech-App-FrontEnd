<template>
    <div class="container">
        <div class="row">
            <div class="col-12">
                <div class="card">
                    <div class="card-header">
                        <span class="card-title h3">Categorías</span>
                    </div>
                    <div class="card-body">
                        <div class="row gy-4">
                            <div class="col-12 col-md-8">
                                <input type="text" class="form-control" placeholder="Buscar categoría">
                            </div>
                            <div class="col-12 col-md-4 text-center">
                                <button type="button" class="btn btn-primary" @click="abrirModal">Agregar categoría <i class="fas fa-plus"></i></button>
                            </div>
                            <div class="col-12">
                                <div class="table-responsive">
                                    <table class="table table-hover table-striped">
                                        <thead class="table-primary">
                                            <tr>
                                                <th>ID</th>
                                                <th>Nombre</th>
                                                <th>Descripción</th>
                                                <th>Acciones</th>
                                            </tr>
                                        </thead>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

</template>
<script setup>
import { onMounted, ref } from 'vue';
onMounted(() => {
    
})
</script>
<style>
    
</style>