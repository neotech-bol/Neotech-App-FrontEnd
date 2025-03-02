<template>
    <div class="container">
        <div class="row">
            <div class="col-12">
                <div class="card">
                    <div class="card-header bg-primary-subtle">
                        <span class="card-title h3">Historial de catalogos</span>
                    </div>
                    <div class="card-body">
                        <div class="row">
                            <div class="col-12 col-md-8">
                                <input type="text" class="form-control" placeholder="Buscar...">
                            </div>
                            <div class="table-responsive">
                                <table class="table-hover table-striped table">
                                    <thead class="table-primary">
                                        <tr class="text-center">
                                            <th>#</th>
                                            <th>Nombre</th>
                                            <th>Descripcion</th>
                                            <th>Estado</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="(item, index) in catalogosHistoriales" :key="item.id"
                                            class="text-center">
                                            <td>{{ index + 1 }}</td>
                                            <td>{{ item.nombre }}</td>
                                            <td>{{ item.descripcion }}</td>
                                            <td>
                                                <span class="badge" :class="item.estado == true ? 'bg-success' : 'bg-danger'">{{item.estado == true ? 'Activo' : 'Inactivo'}}</span>
                                            </td>
                                            <td>
                                                <div class="btn-group">
                                                    <button type="button" class="btn btn-sm" :class="item.estado == true ? 'btn-danger' : 'btn-success'" @click="cambiarEstado(item.id)">{{ item.estado == true ? 'Desactivar' : 'Activar' }}</button>
                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup>
import { changeStatus, indexCatalogosHistoriales } from '@/Services/CatalogoHistorialesService';
import { onMounted, ref } from 'vue';
const catalogosHistoriales = ref([]);
onMounted(() => {
    listarCatalogosHistorial();
})
const listarCatalogosHistorial = async () => {
    try {
        const { data } = await indexCatalogosHistoriales();
        catalogosHistoriales.value = data.datos;
        console.log(catalogosHistoriales.value);
    } catch (error) {
        console.log(error);
    }
}
const cambiarEstado = async (id) => {
    try {
        const {data} = await changeStatus(id);
        console.log(data);
        listarCatalogosHistorial();
    } catch (error) {
        console.log(error);
    }
}
</script>
<style></style>