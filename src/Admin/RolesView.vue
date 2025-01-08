<template>
    <div class="container">
        <div class="row">
            <div class="col-12">
                <div class="card">
                    <div class="card-header bg-primary-subtle">
                        <span class="card-title h3">Roles</span>
                    </div>
                    <div class="card-body">
                        <div class="row gy-4">
                            <div class="col-12 col-md-8">
                                <input type="text" class="form-control" placeholder="Buscar rol">
                            </div>
                            <div class="col-12 col-md-4 text-center">
                                <button type="button" class="btn btn-primary" @click="abrirModal()">Agregar <i
                                        class="fas fa-plus"></i></button>
                            </div>
                            <div class="col-12">
                                <div class="table-responsive">
                                    <table class="table table-hover table-striped">
                                        <thead class="table-primary">
                                            <tr class="text-center">
                                                <th>ID</th>
                                                <th>Rol</th>
                                                <th>Permisos</th>
                                                <th>Opciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr v-if="datos.length === 0">
                                                <td colspan="12" class="text-center text-danger">No hay roles
                                                    registrados</td>
                                            </tr>
                                            <tr v-for="(item, index) in datos" :key="item.id" class="text-center">
                                                <td>{{ index + 1 }}</td>
                                                <td>{{ item.name }}</td>
                                                <td>
                                                    <div v-for="permiso in item.permissions" :key="permiso.id">
                                                        {{ permiso.name }}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div class="btn-group">
                                                        <button type="button" class="btn btn-sm btn-warning">
                                                            <i class="fas fa-edit"></i>
                                                        </button>
                                                        <button type="button" class="btn btn-sm btn-danger" @click="eliminarRol(item.id)">
                                                            <i class="fas fa-trash"></i>
                                                        </button>
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
    </div>
    <!-- Modal -->
    <div class="modal fade" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1"
        aria-labelledby="staticBackdropLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h1 class="modal-title fs-5" id="staticBackdropLabel">Nuevo Rol</h1>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="row">
                        <div class="col-12">
                            <label for="nombre" class="form-label fw-bold">Name <i class="text-danger">*</i></label>
                            <input type="text" class="form-control" id="nombre" v-model="formulario.name">
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-danger" data-bs-dismiss="modal">Cerrar</button>
                    <button type="button" class="btn btn-primary" @click="guardarRol()">Guardar</button>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup>
import { destroyRol, indexRoles, storeRol } from '@/Services/RolesPermisosService';
import { Modal } from 'bootstrap/dist/js/bootstrap.bundle.min';
import { onMounted, ref } from 'vue';
const datos = ref([]);
const formulario = ref({
    name: ''
});
let modal = null;
let instanciaModal = null;
onMounted(() => {
    modal = document.getElementById('staticBackdrop');
    instanciaModal = new Modal(modal)
    listarRoles();
})
const listarRoles = async () => {
    try {
        const { data } = await indexRoles();
        datos.value = data.datos;
        console.log(datos.value);
    } catch (error) {
        console.log(error);
    }
}
const abrirModal = () => {
    instanciaModal.show();
}
const cerrarModal = () => {
    instanciaModal.hide();
    formulario.value = {
        name: ''
    };
}
const guardarRol = async () => {
    try {
        const {data} = await storeRol(formulario.value);
        listarRoles();
        cerrarModal();
        console.log(data);
    } catch (error) {
        console.log(error);
    }
}
const eliminarRol = async (id) => {
    try {
        const {data} = await destroyRol(id);
        listarRoles();
        console.log(data);
    } catch (error) {
        console.log(error);
    }
}
</script>
<style></style>