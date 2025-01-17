<template>
    <div class="container">
        <div class="row">
            <div class="col-12">
                <div class="card">
                    <div class="card-header bg-primary-subtle">
                        <span class="card-title h3">Categorías</span>
                    </div>
                    <div class="card-body">
                        <div class="row gy-4">
                            <div class="col-12 col-md-8">
                                <input type="text" class="form-control" placeholder="Buscar categoría">
                            </div>
                            <div class="col-12 col-md-4 text-center">
                                <button type="button" class="btn btn-primary" @click="abrirModal()">Agregar categoría <i
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
                                                <th>Productos</th>
                                                <th>Estado</th>
                                                <th>Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr v-if="categorias.length === 0">
                                                <td colspan="12" class="text-center text-danger">No hay categorias
                                                    registrados</td>
                                            </tr>
                                            <tr v-for="(item, index) in categorias" :key="item.id" class="text-center">
                                                <td>{{ item.id }}</td>
                                                <td>{{ item.nombre }}</td>
                                                <td>{{ item.descripcion }}</td>
                                                <td>{{ item.productos?.length }}</td>
                                                <td>
                                                    <span class="badge"
                                                        :class="item.estado == true ? 'bg-success' : 'bg-danger'">
                                                        {{ item.estado == true ? 'Activo' : 'Inactivo' }}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div class="btn-group">
                                                        <button class="btn btn-sm btn-warning"
                                                            @click="mostrarCategoria(item.id)">Editar</button>
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
                <div class="modal-header" :class="posicion != '' ? 'bg-warning' : 'bg-primary'">
                    <h5 class="modal-title" id="staticBackdropLabel">{{ posicion != '' ? 'Editar registro' : 'Nuevo registro' }}</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="row gy-4">
                        <div class="col-12">
                            <label for="nombre" class="label-form fw-bold">Nombre <span
                                    class="text-danger">*</span></label>
                            <input type="text" class="form-control" id="nombre" name="nombre"
                                v-model="formulario.nombre" required>
                        </div>
                        <div class="col-12">
                            <label for="descripcion" class="label-form fw-bold">Descripción</label>
                            <textarea class="form-control" id="descripcion" name="descripcion"
                                v-model="formulario.descripcion"></textarea>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-danger" data-bs-dismiss="modal">Cerrar</button>
                    <button type="button" class="btn" :class="posicion != '' ? 'btn-warning' : 'btn-primary'" @click="guardarCategoria()">{{ posicion != '' ?
                        'Editar' : 'Guardar' }}</button>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup>
import { destroyCategoria, indexCategorias, showCategoria, storeCategoria, updateCategoria } from '@/Services/CategoriaService';
import { Modal } from 'bootstrap/dist/js/bootstrap.bundle.min';
import { onMounted, ref } from 'vue';
let modal = null;
let instanciaModal = null;
const categorias = ref([]);
const posicion = ref('');
const formulario = ref({
    nombre: '',
    descripcion: ''
});
onMounted(() => {
    modal = document.getElementById('staticBackdrop');
    instanciaModal = new Modal(modal);
    listarCategorias();
})
const abrirModal = () => {
    posicion.value = '';
    formulario.value = {
        nombre: '',
        descripcion: ''
    }
    instanciaModal.show();
}
const cerrarModal = () => {
    instanciaModal.hide();
}
const listarCategorias = async () => {
    try {
        const { data } = await indexCategorias();
        categorias.value = data.datos.data
        console.log(categorias.value);
    } catch (error) {
        console.log(error);
    }
}
const guardarCategoria = async () => {
    try {
        if (posicion.value != '') {
            const { data } = await updateCategoria(posicion.value, formulario.value);
            console.log(data);
            cerrarModal();
            listarCategorias();
        } else {
            const { data } = await storeCategoria(formulario.value);
            console.log(data);
            cerrarModal();
            listarCategorias();
        }
    } catch (error) {
        console.log(error);
    }
}
const cambiarEstado = async (id) => {
    try {
        const { data } = await destroyCategoria(id);
        console.log(data);
        listarCategorias();
    } catch (error) {
        console.log(error);
    }
}
const mostrarCategoria = async (id) => {
    try {
        const {data} = await showCategoria(id);
        console.log(data);
        formulario.value = {
            nombre: data.dato.nombre,
            descripcion: data.dato.descripcion
        }
        instanciaModal.show();
        posicion.value = id;
    } catch (error) {
        console.log(error);
    }
}
</script>
<style></style>