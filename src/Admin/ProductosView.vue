<template>
  <div class="container">
    <div class="row">
      <div class="col-12">
        <div class="card">
          <div class="card-header bg-primary-subtle">
            <span class="card-title h3">Productos</span>
          </div>
          <div class="card-body">
            <div class="row gy-4">
              <div class="col-12 col-md-8">
                <input type="text" class="form-control" placeholder="Buscar producto">
              </div>
              <div class="col-12 col-md-4 text-center">
                <button type="button" class="btn btn-primary" @click="abrirModal">Agregar producto <i
                    class="fas fa-plus"></i></button>
              </div>
              <div class="col-12">
                <div class="table-responsive">
                  <table class="table table-hover table-striped">
                    <thead class="table-primary">
                      <tr class="text-center">
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Precio</th>
                        <th>Stock a Pedir</th>
                        <th>Categoría</th>
                        <th>Catalogo</th>
                        <th>Imagenes</th>
                        <th>Usuario</th>
                        <th>Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-if="productos.length === 0">
                        <td colspan="12" class="text-center text-danger">No hay productos
                          registrados</td>
                      </tr>
                      <tr v-for="(item, index) in productos" :key="item.id" class="text-center">
                        <td>{{ index + 1 }}</td>
                        <td>{{ item.nombre }}</td>
                        <td>{{ item.precio }}</td>
                        <td>{{ 0 }}</td>
                        <td>{{ item.categoria?.nombre || 'No hay categoría' }}</td>
                        <td>{{ item.catalogo?.nombre || 'No hay catalogo'}}</td>
                        <td>{{ item.images?.length }}</td>
                        <td>{{ item.user?.nombre }} {{ item.user?.apellido }}</td>
                        <td>
                          <div class="btn-group">
                            <button class="btn btn-sm btn-warning" @click="mostrarProducto(item.id)">Editar</button>
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
          <h5 class="modal-title" id="staticBackdropLabel">{{ posicion != "" ? 'Editar registro' : 'Guardar registro' }}
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <div class="row gy-4">
            <div class="col-12 col-md-6">
              <label for="nombre" class="label-form fw-bold">Nombre <i class="text-danger">*</i></label>
              <input type="text" id="nombre" class="form-control" v-model="formulario.nombre">
            </div>
            <div class="col-12 col-md-6">
              <label for="precio" class="label-form fw-bold">Precio <i class="text-danger">*</i></label>
              <input type="number" id="precio" class="form-control" v-model="formulario.precio">
            </div>
            <div class="col-12 col-md-6">
              <label for="catalogo" class="label-form fw-bold">Catalogo</label>
              <select class="form-select" aria-label="Default select example" id="catalogo"
                v-model="formulario.catalogo_id">
                <option value="" selected>Seleccione</option>
                <option :value="item.id" v-for="item in catalogos" :key="item.id">
                  {{ item.nombre }}
                </option>
              </select>
            </div>
            <div class="col-12 col-md-6">
              <label for="catalogo" class="label-form fw-bold">Categoria</label>
              <select class="form-select" aria-label="Default select example" id="catalogo"
                v-model="formulario.categoria_id">
                <option value="" selected>Seleccione</option>
                <option :value="item.id" v-for="item in categorias" :key="item.id">
                  {{ item.nombre }}
                </option>
              </select>
            </div>
            <div class="col-12 col-md-6">
              <label for="descripcion" class="label-form fw-bold">Descripcion</label>
              <textarea name="descripcion" id="descripcion" class="form-control"
                v-model="formulario.descripcion"></textarea>
            </div>
            <div class="col-12">
              <label for="imagenes" class="label-form fw-bold">Imágenes <i class="text-danger">*</i></label>
              <input type="file" id="imagenes" class="form-control" @change="handleFileUpload" multiple>
            </div>
            <div class="col-12 mt-3">
              <h6>Imágenes seleccionadas:</h6>
              <div class="row" v-if="formulario.imagePreviews.length > 0">
                <div class="col-4" v-for="(image, index) in formulario.imagePreviews" :key="index">
                  <div class="position-relative">
                    <img :src="image.preview" class="img-fluid" alt="Preview" />
                    <button type="button" class="btn-close position-absolute top-0 end-0"
                      @click="removeImage(index)"></button>
                  </div>
                  <button class="btn btn-danger" @click="eliminarImage(image.id)">Eliminar</button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-danger" data-bs-dismiss="modal">Cerrar</button>
          <button type="button" class="btn" :class="posicion != '' ? 'btn-warning' : 'btn-primary'"
            @click="guardarProducto">{{ posicion != "" ? 'Editar' : "Guardar" }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { Modal } from 'bootstrap/dist/js/bootstrap.bundle.min';
import { indexCatalogoItems } from '@/Services/CatalogoService';
import { deleteImage, indexProductos, showProducto, storeProducto, updateProducto } from '@/Services/ProductoService';
import { indexActivosCategorias } from '@/Services/CategoriaService';

let modal = null;
let instanciaModal = null;
const catalogos = ref([]);
const productos = ref([]);
const categorias = ref([]);
const formulario = ref({
  nombre: '',
  precio: '',
  catalogo_id: '',
  categoria_id: '',
  descripcion: '',
  images: [],
  imagePreviews: []
});
const posicion = ref('');
onMounted(() => {
  modal = document.getElementById('staticBackdrop');
  instanciaModal = new Modal(modal);
  listarCatalogosActivos();
  listarCategorias();
  listarProductos();
});

const abrirModal = () => {
  posicion.value = '';
  formulario.value = {
    nombre: '',
    precio: '',
    catalogo_id: '',
    categoria_id: '',
    descripcion: '',
    images: [],
    imagePreviews: []
  };
  instanciaModal.show();
};
const listarCategorias = async () => {
  try {
    const {data} = await indexActivosCategorias();
    categorias.value = data.datos;
    console.log(categorias.value);
  } catch (error) {
    console.log(error);
  }
}
const listarCatalogosActivos = async () => {
  try {
    const { data } = await indexCatalogoItems();
    catalogos.value = data.datos;
    console.log(catalogos.value);
  } catch (error) {
    console.log(error);
  }
};

const listarProductos = async () => {
  try {
    const { data } = await indexProductos();
    productos.value = data.datos;
    console.log(productos.value);
  } catch (error) {
    console.log(error);
  }
};

const handleFileUpload = (event) => {
  const files = Array.from(event.target.files);

  // Crear un nuevo array de imágenes con vistas previas
  const newImages = files.map(file => ({
    file: file,
    preview: URL.createObjectURL(file) // Crear una vista previa de la imagen
  }));
  console.log(newImages);

  // Combinar las imágenes existentes con las nuevas
  formulario.value.images = [...(formulario.value.images || []), ...newImages];
  console.log(formulario.value.images);

  // Actualizar las vistas previas
  formulario.value.imagePreviews = [
    ...(formulario.value.imagePreviews || []), 
    ...newImages.map(img => ({ preview: img.preview }))
  ];
  console.log(formulario.value.imagePreviews);
};

const removeImage = (index) => {
  // Eliminar de images
  formulario.value.images.splice(index, 1);
  
  // Eliminar de imagePreviews
  formulario.value.imagePreviews.splice(index, 1);
};


const guardarProducto = async () => {
  try {
    const formData = new FormData();
    formData.append('nombre', formulario.value.nombre);
    formData.append('precio', formulario.value.precio);
    formData.append('catalogo_id', formulario.value.catalogo_id);
    formData.append('categoria_id', formulario.value.categoria_id);
    formData.append('descripcion', formulario.value.descripcion);

    for (let i = 0; i < formulario.value.images.length; i++) {
      formData.append('images[]', formulario.value.images[i].file);
    }
    if (posicion.value != '') {
      formData.append('_method', 'PUT')
      const { data } = await updateProducto(posicion.value, formData);
      console.log(data);
      instanciaModal.hide();
      listarProductos();
    } else {
      const { data } = await storeProducto(formData);
      console.log(data);
      instanciaModal.hide();
      listarProductos();
    }
  } catch (error) {
    console.log(error);
  }
};
const mostrarProducto = async (id) => {
  try {
    const { data } = await showProducto(id);
    instanciaModal.show();

    // Crear un nuevo array de imágenes con vistas previas
    const imagePreviews = data.dato.images.map(image => ({
      id: image.id, // Asegúrate de que `id` sea la propiedad correcta
      preview: image.imagen // Asegúrate de que `imagen` sea la propiedad correcta
    }));
    console.log(imagePreviews);
    formulario.value = {
      nombre: data.dato.nombre,
      precio: data.dato.precio,
      catalogo_id: data.dato.catalogo_id,
      categoria_id: data.dato.categoria_id,
      descripcion: data.dato.descripcion,
      images: [], // Mantener esto vacío ya que no tenemos archivos
      imagePreviews: imagePreviews // Asignar las vistas previas
    };

    posicion.value = id;
    console.log(data);
  } catch (error) {
    console.log(error);
  }
}
const eliminarImage = async (idImagen) => {
  try {
    const { data } = await deleteImage(posicion.value, idImagen);
    console.log(data);

    // Actualizar las vistas previas de imágenes
    formulario.value.imagePreviews = formulario.value.imagePreviews.filter(image => image.id !== idImagen);
    listarProductos();
  } catch (error) {
    console.log(error);
  }
}
</script>

<style scoped>
.btn-close {
  background-color: rgba(255, 255, 255, 0.5);
  border-radius: 50%;
}
</style>