<template>
    <div class="container">
        <div class="row">
            <div class="col-12">
                <div class="card">
                    <div class="card-header bg-primary-subtle">
                        <span class="card-title h3">Catalogos</span>
                    </div>
                    <div class="card-body">
                        <div class="row gy-4">
                            <div class="col-12 col-md-8">
                                <input type="text" class="form-control" placeholder="Buscar catalogo">
                            </div>
                            <div class="col-12 col-md-4 text-center">
                                <button type="button" class="btn btn-primary" @click="abrirModal()">Agregar Catalogo <i
                                        class="fas fa-plus"></i></button>
                            </div>
                            <div class="col-12">
                                <div class="table-responsive">
                                    <table class="table table-hover table-striped">
                                        <thead class="table-primary">
                                            <tr class="text-center">
                                                <th>ID</th>
                                                <th>Nombre</th>
                                                <th>Descripción</th>
                                                <th>Categorias</th>
                                                <th>Orden</th>
                                                <th>Estado</th>
                                                <th>Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr v-if="datos.length === 0">
                                                <td colspan="12" class="text-center text-danger">No hay catalogos
                                                    registrados</td>
                                            </tr>
                                            <tr v-for="(item, index) in datos" :key="item.id" class="text-center">
                                                <td>{{ item.id}}</td>
                                                <td>{{ item.nombre }}</td>
                                                <td>{{ item.descripcion }}</td>
                                                <td>{{ item.categorias?.length }}</td>
                                                <td>{{ item.orden }}</td>
                                                <td>
                                                    <span class="badge"
                                                        :class="item.estado == true ? 'bg-success' : 'bg-danger'">
                                                        {{ item.estado == true ? 'Activo' : 'Inactivo' }}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div class="btn-group">
                                                        <button class="btn btn-sm btn-warning"
                                                            @click="mostrarCatalogo(item.id)">Editar</button>
                                                        <button class="btn btn-sm"
                                                            :class="item.estado == true ? 'btn-danger' : 'btn-success'"
                                                            @click=cambiarEstado(item.id)>{{ item.estado == true ?
                                                                'Desactivar' : 'Activar' }}
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
                <div class="modal-header" :class="posicion != '' ? 'bg-warning-subtle' : 'bg-primary-subtle'">
                    <h5 class="modal-title" id="staticBackdropLabel">{{ posicion != "" ? 'Editar registro' : 'Guardar Registro' }}</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="row gy-4">
                        <div class="col-12">
                            <label for="nombre" class="label-form fw-bold">Nombre <i class="text-danger">*</i></label>
                            <input type="text" class="form-control" :class="{ 'border-danger': errors.nombre }"
                                id="nombre" v-model="formulario.nombre">
                                <small class="text-danger fst-italic text-xs" v-if="errors.nombre"><i
                                    class="fas fa-times me-1"></i>{{ errors.nombre[0] }}</small>
                        </div>
                        <div class="col-12">
                            <label for="descripcion" class="label-form fw-bold">Descripción</label>
                            <textarea class="form-control" id="descripcion" v-model="formulario.descripcion"></textarea>
                        </div>
                        <div class="col-12">
                            <label for="orden" class="label-form fw-bold">Orden</label>
                            <input type="number" id="orden" class="form-control" v-model="formulario.orden">
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-danger" data-bs-dismiss="modal">Cerrar</button>
                    <button type="button" class="btn" :class="posicion != '' ? 'btn-warning' : 'btn-primary'" @click="guardarCatalogo()">{{ posicion != '' ? 'Editar' : 'Guardar' }}</button>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup>
import { destroyCatalogo, indexCatalogos, showCatalogo, storeCatalogo, updateCatalogo } from '@/Services/CatalogoService';
import { Modal } from 'bootstrap/dist/js/bootstrap.bundle.min';
import { onMounted, ref } from 'vue';
let modal = null;
let instanciaModal = null;
const formulario = ref({
    nombre: '',
    descripcion: '',
    banner: '',
    orden: '',
});
const datos = ref([]);
const posicion = ref('');
const errors = ref({});
onMounted(() => {
    modal = document.getElementById('staticBackdrop');
    instanciaModal = new Modal(modal);
    listarCatalogos();
})
const abrirModal = () => {
    formulario.value = {
        nombre: '',
        descripcion: '',
        banner: '',
        orden: '',
    }
    posicion.value = '';
    instanciaModal.show();
}
const cerrarModal = () => {
    instanciaModal.hide();
}
const listarCatalogos = async () => {
    try {
        const { data } = await indexCatalogos();
        datos.value = data.datos
        console.log(datos.value);
    } catch (error) {
        console.log(error);
    }
}
const guardarCatalogo = async () => {
    errors.value = {};
    try {
        const formData = new FormData();
            if (formulario.value.nombre) {
                formData.append('nombre', formulario.value.nombre);
            }
            if (formulario.value.descripcion) {
                formData.append('descripcion', formulario.value.descripcion);
            }
            if (formulario.value.orden) {
                formData.append('orden', formulario.value.orden);
            }
        if (posicion.value != '') {
            formData.append('_method', 'PUT')
            const { data } = await updateCatalogo(posicion.value, formData);
            listarCatalogos();
            cerrarModal();
            console.log(data);
        } else {
            const { data } = await storeCatalogo(formData);
            listarCatalogos();
            cerrarModal();
            console.log(data);
        }
    } catch (error) {
        if (error.response.status == 422) {
            errors.value = error.response.data.errors;
        } else {
            console.log(error);
        }
    }
}
const mostrarCatalogo = async (id) => {
    try {
        const { data } = await showCatalogo(id);
        console.log(data);
        formulario.value = {
            nombre: data.dato.nombre,
            descripcion: data.dato.descripcion,
            productos: data.dato.productos,
            orden: data.dato.orden,
        }
        instanciaModal.show();
        posicion.value = id;
        errors.value = {};
    } catch (error) {
        console.log(error);
    }
}
const cambiarEstado = async (id) => {
    try {
        const { data } = await destroyCatalogo(id);
        console.log(data);
        listarCatalogos();
    } catch (error) {
        console.log(error);
    }
}
</script>
<style></style>