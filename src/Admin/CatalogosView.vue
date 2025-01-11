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
                                                <td>{{ index + 1 }}</td>
                                                <td>{{ item.nombre }}</td>
                                                <td>{{ item.descripcion }}</td>
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
                <div class="modal-header">
                    <h5 class="modal-title" id="staticBackdropLabel">Nuevo catalogo</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="row gy-4">
                        <div class="col-12">
                            <label for="nombre" class="label-form fw-bold">Nombre <i class="text-danger">*</i></label>
                            <input type="text" class="form-control" id="nombre" v-model="formulario.nombre">
                        </div>
                        <div class="col-12">
                            <label for="descripcion" class="label-form fw-bold">Descripción</label>
                            <textarea class="form-control" id="descripcion" v-model="formulario.descripcion"></textarea>
                        </div>
                        <div class="col-12">
                            <h6>Productos en el Catálogo:</h6>
                            <div class="row" v-if="formulario.productos && formulario.productos.length > 0">
                                <div class="col-4" v-for="(producto, index) in formulario.productos" :key="producto.id">
                                    <div class="card">
                                        <div class="card-body">
                                            <h5 class="card-title">{{ producto.nombre }}</h5>
                                            <p class="card-text">Precio: {{ producto.precio }}</p>
                                            <p class="card-text">Descripción: {{ producto.descripcion || 'Sindescripción' }}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div v-else>
                                <p>No hay productos en este catálogo.</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-danger" data-bs-dismiss="modal">Cerrar</button>
                    <button type="button" class="btn btn-primary" @click="guardarCatalogo()">Guardar</button>
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
});
const datos = ref([]);
const posicion = ref('');
onMounted(() => {
    modal = document.getElementById('staticBackdrop');
    instanciaModal = new Modal(modal);
    listarCatalogos();
})
const abrirModal = () => {
    formulario.value = {
        nombre: '',
        descripcion: '',
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
    try {
        if (posicion.value != '') {
            const { data } = await updateCatalogo(posicion.value, formulario.value);
            listarCatalogos();
            cerrarModal();
            console.log(data);
        } else {
            const { data } = await storeCatalogo(formulario.value);
            listarCatalogos();
            cerrarModal();
            console.log(data);
        }
    } catch (error) {
        console.log(error);
    }
}
const mostrarCatalogo = async (id) => {
    try {
        const { data } = await showCatalogo(id);
        console.log(data);
        formulario.value = {
            nombre: data.dato.nombre,
            descripcion: data.dato.descripcion,
            productos: data.dato.productos
        }
        instanciaModal.show();
        posicion.value = id;
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