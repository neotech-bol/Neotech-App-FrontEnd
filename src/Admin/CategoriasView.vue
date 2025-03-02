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
                                                <th>Titulo</th>
                                                <th>Subtitulo</th>
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
                                                <td>{{ item.titulo }}</td>
                                                <td>{{ item.subtitulo }}</td>
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
                                v-model="formulario.nombre" required :class="{ 'border-danger': errors.nombre }">
                            <small class="text-danger fst-italic text-xs" v-if="errors.nombre"><i
                                    class="fas fa-times me-1"></i>{{ errors.nombre[0] }}</small>
                        </div>
                        <div class="col-12">
                            <label for="titulo" class="label-form fw-bold">Titulo <span
                                    class="text-danger">*</span></label>
                            <input type="text" class="form-control" id="titulo" name="titulo"
                                v-model="formulario.titulo" required :class="{ 'border-danger': errors.titulo }">
                            <small class="text-danger fst-italic text-xs" v-if="errors.titulo"><i
                                    class="fas fa-times me-1"></i>{{ errors.titulo[0] }}</small>
                        </div>
                        <div class="col-12">
                            <label for="subtitulo" class="label-form fw-bold">Subtitulo <span
                                    class="text-danger">*</span></label>
                            <input type="text" class="form-control" id="subtitulo" name="subtitulo"
                                v-model="formulario.subtitulo" required :class="{ 'border-danger': errors.subtitulo }">
                            <small class="text-danger fst-italic text-xs" v-if="errors.subtitulo"><i
                                    class="fas fa-times me-1"></i>{{ errors.subtitulo[0] }}</small>
                        </div>
                        <div class="col-12 col-md-12">
                            <label for="categoria" class="label-form fw-bold">Catalogo</label>
                            <select class="form-select form-select-lg" aria-label="Default select example"
                                id="categoria" v-model="formulario.catalogo_id">
                                <option value="" selected>Seleccione un catalogo</option>
                                <option :value="item.id" v-for="item in catalogos" :key="item.id">{{ item.nombre }}
                                </option>
                            </select>
                        </div>
                        <div class="col-12">
                            <label for="imagen" class="label-form fw-bold">Imagen banner</label>
                            <input type="file" class="form-control" id="imagen" placeholder="Escribe..."
                                @change="obtenerImagen($event)" :class="{ 'border-danger': errors.banner }">
                            <small class="text-danger fst-italic text-xs" v-if="errors.banner"><i
                                    class="fas fa-times me-1"></i>{{ errors.banner[0] }}</small>
                            <img v-if="imagenPreview" :src="imagenPreview" alt="Imagen"
                                style="width: 400px; height: 200px; margin-top: 30px;">
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
                    <button type="button" class="btn" :class="posicion != '' ? 'btn-warning' : 'btn-primary'"
                        @click="guardarCategoria()">{{ posicion != '' ? 'Editar' : 'Guardar' }}</button>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup>
import { indexCatalogoItems } from '@/Services/CatalogoService';
import { destroyCategoria, indexCategorias, showCategoria, storeCategoria, updateCategoria } from '@/Services/CategoriaService';
import { Modal } from 'bootstrap/dist/js/bootstrap.bundle.min';
import { onMounted, ref } from 'vue';
let modal = null;
let instanciaModal = null;
const categorias = ref([]);
const catalogos = ref(['']);
const posicion = ref('');
const formulario = ref({
    nombre: '',
    descripcion: '',
    banner: '',
    catalogo_id: ' '
});
const errors = ref({});
const imagenPreview = ref('');
onMounted(() => {
    modal = document.getElementById('staticBackdrop');
    instanciaModal = new Modal(modal);
    listarCategorias();
    mostrarCatalogos();
})
const obtenerImagen = (event) => {
    if (event.target.files[0]) {
        formulario.value.banner = event.target.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
            imagenPreview.value = e.target.result;
        };
        reader.readAsDataURL(event.target.files[0]);
    } else {
        imagenPreview.value = formulario.value.banner;
    }
};
const abrirModal = () => {
    posicion.value = '';
    formulario.value = {
        nombre: '',
        titulo: '',
        subtitulo: '',
        descripcion: '',
        banner: '',
        catalogo_id: ''
    }
    imagenPreview.value = '';
    instanciaModal.show();
    errors.value = {};
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
    errors.value = {};
    try {
        const formData = new FormData();
        formData.append('nombre', formulario.value.nombre);
        formData.append('titulo', formulario.value.titulo);
        formData.append('subtitulo', formulario.value.subtitulo);
        formData.append('descripcion', formulario.value.descripcion);
        formData.append('catalogo_id', formulario.value.catalogo_id);
        // Solo agregar el archivo de imagen si se seleccionó uno nuevo
        if (formulario.value.banner instanceof File) {
            formData.append('banner', formulario.value.banner);
        }

        if (posicion.value != '') {
            formData.append('_method', 'PUT')
            const { data } = await updateCategoria(posicion.value, formData);
            console.log(data);
            cerrarModal();
            listarCategorias();
        } else {
            const { data } = await storeCategoria(formData);
            console.log(data);
            cerrarModal();
            listarCategorias();
        }
    } catch (error) {
        if (error.response.status == 422) {
            errors.value = error.response.data.errors;
        } else {
            console.log(error);
        }
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
        const { data } = await showCategoria(id);
        console.log(data);
        formulario.value = {
            nombre: data.dato.nombre,
            titulo: data.dato.titulo,
            subtitulo: data.dato.subtitulo,
            descripcion: data.dato.descripcion,
            banner: data.dato.banner,
            catalogo_id: data.dato.catalogo_id
        }
        imagenPreview.value = formulario.value.banner;
        instanciaModal.show();
        posicion.value = id;
    } catch (error) {
        console.log(error);
    }
}
const mostrarCatalogos = async () => {
    try {
        const {data} = await indexCatalogoItems('');
        console.log(data);
        catalogos.value = data.datos;
        console.log(catalogos.value);
    } catch (error) {
        console.log(error);
    }
}
</script>
<style></style>