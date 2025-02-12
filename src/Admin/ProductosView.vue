<template>
  <div class="container">
    <div class="row">
      <div class="col-12">
        <div class="card shadow-sm"> <!-- Agregar sombra para un diseño más moderno -->
          <div class="card-header bg-primary-subtle">
            <span class="card-title h3">Productos</span>
          </div>
          <div class="card-body">
            <div class="row gy-4">
              <!-- Barra de búsqueda y botón de agregar -->
              <div class="col-12 col-md-8">
                <div class="input-group">
                  <input type="text" class="form-control form-control-lg" placeholder="Buscar producto"
                    aria-label="Buscar producto">
                  <button class="btn btn-primary" type="button">
                    <i class="fas fa-search"></i>
                  </button>
                </div>
              </div>
              <div class="col-12 col-md-4 text-center">
                <button type="button" class="btn btn-primary btn-lg w-100" @click="abrirModal">
                  <i class="fas fa-plus me-2"></i>Agregar producto
                </button>
              </div>

              <!-- Tabla de productos -->
              <div class="col-12">
                <div class="table-responsive">
                  <table class="table table-hover table-striped table-bordered">
                    <thead class="table-primary">
                      <tr class="text-center">
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Precio</th>
                        <th>Stock a Pedir</th>
                        <th>Categoría</th>
                        <th>Imágenes</th>
                        <th>Usuario</th>
                        <th>Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-if="productos.length === 0">
                        <td colspan="9" class="text-center text-danger py-4">
                          <i class="fas fa-exclamation-circle me-2"></i>No hay productos registrados
                        </td>
                      </tr>
                      <tr v-for="(item, index) in productos" :key="item.id" class="text-center align-middle">
                        <td>{{ index + 1 }}</td>
                        <td>{{ item.nombre }}</td>
                        <td>{{ item.precio }}</td>
                        <td>{{ item.cantidad }}</td>
                        <td>{{ item.categoria?.nombre || 'No hay categoría' }}</td>
                        <td>
                          <span class="badge bg-secondary">{{ item.images?.length || 0 }}</span>
                        </td>
                        <td>{{ item.user?.nombre }} {{ item.user?.apellido }}</td>
                        <td>
                          <div class="btn-group">
                            <button class="btn btn-sm btn-warning" @click="mostrarProducto(item.id)">
                              <i class="fas fa-edit me-1"></i>Editar
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
    <div class="modal-dialog modal-xl"> <!-- Aumentar el tamaño del modal a extra grande -->
      <div class="modal-content">
        <div class="modal-header bg-primary text-white"> <!-- Cambiar el color del header -->
          <h5 class="modal-title" id="staticBackdropLabel">{{ posicion != "" ? 'Editar registro' : 'Guardar registro' }}
          </h5>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <div class="row gy-4">
            <div class="col-12 col-md-6">
              <label for="nombre" class="label-form fw-bold">Nombre <i class="text-danger">*</i></label>
              <input type="text" id="nombre" class="form-control form-control-lg" v-model="formulario.nombre"
                placeholder="Ingrese el nombre">
            </div>
            <div class="col-12 col-md-6">
              <label for="precio" class="label-form fw-bold">Precio <i class="text-danger">*</i></label>
              <input type="number" id="precio" class="form-control form-control-lg" v-model="formulario.precio"
                placeholder="Ingrese el precio">
            </div>
            <div class="col-12 col-md-6">
              <label for="categoria" class="label-form fw-bold">Categoría</label>
              <select class="form-select form-select-lg" aria-label="Default select example" id="categoria"
                v-model="formulario.categoria_id">
                <option value="" selected>Seleccione una categoría</option>
                <option :value="item.id" v-for="item in categorias" :key="item.id">{{ item.nombre }}</option>
              </select>
            </div>
            <div class="col-12 col-md-6">
              <label for="descripcion" class="label-form fw-bold">Descripción</label>
              <textarea name="descripcion" id="descripcion" class="form-control form-control-lg"
                v-model="formulario.descripcion" placeholder="Ingrese la descripción"></textarea>
            </div>
            <div class="col-12 col-md-6">
              <label for="cantidad_minima" class="label-form fw-bold">Cantidad mínima <i
                  class="text-danger">*</i></label>
              <input type="number" id="cantidad_minima" class="form-control form-control-lg"
                v-model="formulario.cantidad_minima" placeholder="Ingrese la cantidad mínima">
            </div>
            <div class="col-12 col-md-6">
              <label for="cantidad_maxima" class="label-form fw-bold">Cantidad máxima <i
                  class="text-danger">*</i></label>
              <input type="number" id="cantidad_maxima" class="form-control form-control-lg"
                v-model="formulario.cantidad_maxima" placeholder="Ingrese la cantidad máxima">
            </div>
            <div class="col-12 col-md-6">
              <label for="imagen" class="label-form fw-bold">Imagen principal <span class="text-danger">*</span></label>
              <input type="file" class="form-control form-control-lg" id="imagen" @change="obtenerImagen($event)"
                :class="{ 'border-danger': errors.imagen_principal }">
              <small class="text-danger fst-italic text-xs" v-if="errors.imagen_principal"><i
                  class="fas fa-times me-1"></i>{{ errors.imagen_principal[0] }}</small>
              <img v-if="imagenPreview" :src="imagenPreview" alt="Imagen" class="img-fluid mt-3"
                style="max-width: 100%; height: auto;">
            </div>
            <div class="col-12">
              <label for="imagenes" class="label-form fw-bold">Imágenes <i class="text-danger">*</i></label>
              <input type="file" id="imagenes" class="form-control form-control-lg" @change="handleFileUpload" multiple>
            </div>
            <div class="col-12 mt-3">
              <h6>Imágenes seleccionadas:</h6>
              <div class="row" v-if="formulario.imagePreviews.length > 0">
                <div class="col-4 mb-3" v-for="(image, index) in formulario.imagePreviews" :key="index">
                  <div class="position-relative">
                    <img :src="image.preview" class="img-fluid rounded" alt="Preview" />
                    <button type="button" class="btn-close position-absolute top-0 end-0 bg-danger rounded-circle p-2"
                      @click="removeImage(index)"></button>
                  </div>
                  <button class="btn btn-danger mt-2" @click="eliminarImage(image.id)">Eliminar</button>
                </div>
              </div>
            </div>
            <div class="col-12 col-md-12">
              <label for="caracteristicas" class="form-label fw-bold">Características <span
                  class="text-danger">*</span></label>
              <div v-for="(caracteristica, index) in formulario.caracteristicas" :key="index" class="input-group mb-2">
                <input type="text" class="form-control form-control-lg" v-model="formulario.caracteristicas[index]"
                  placeholder="Ingrese las características del producto">
                <button type="button" class="btn btn-danger btn-lg"
                  @click="eliminarCaracteristicas(index)">Eliminar</button>
              </div>
              <button type="button" class="btn btn-secondary btn-lg mt-2" @click="agregarCaracteristicas()">Agregar
                Característica</button>
            </div>
            <div class="col-12">
              <h6>Modelos <i class="text-danger">*</i></h6>
              <div v-for="(modelo, index) in formulario.modelos" :key="index" class="input-group mb-2">
                <input type="text" class="form-control" v-model="modelo.nombre" placeholder="Nombre del modelo"
                  required>
                <input type="number" class="form-control" v-model="modelo.precio" placeholder="Precio" required>
                <input type="number" class="form-control" v-model="modelo.cantidad_minima" placeholder="Cantidad mínima"
                  required>
                <input type="number" class="form-control" v-model="modelo.cantidad_maxima" placeholder="Cantidad máxima"
                  required>
                <button type="button" class="btn btn-danger" @click="eliminarModelo(index)">Eliminar</button>
              </div>
              <button type="button" class="btn btn-secondary" @click="agregarModelo">Agregar Modelo</button>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-danger btn-lg" data-bs-dismiss="modal">Cerrar</button>
          <button type="button" class="btn btn-lg" :class="posicion != '' ? 'btn-warning' : 'btn-primary'"
            @click="guardarProducto">{{ posicion != "" ? 'Editar' : "Guardar" }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { Modal } from 'bootstrap/dist/js/bootstrap.bundle.min';
import { deleteImage, indexProductos, showProducto, storeProducto, updateProducto } from '@/Services/ProductoService';
import { indexActivosCategorias } from '@/Services/CategoriaService';

let modal = null;
let instanciaModal = null;
const productos = ref([]);
const categorias = ref([]);
const formulario = ref({
  nombre: '',
  precio: '',
  catalogo_id: '',
  categoria_id: '',
  descripcion: '',
  cantidad_minima: '',
  cantidad_maxima: '',
  images: [],
  imagePreviews: [],
  imagen_principal: '',
  caracteristicas: [], // Asegúrate de que esto esté inicializado como un array
  modelos: [] // Inicializa el array de modelos
});
const posicion = ref('');
const imagenPreview = ref('');
const errors = ref({});

onMounted(() => {
  modal = document.getElementById('staticBackdrop');
  instanciaModal = new Modal(modal);
  listarCategorias();
  listarProductos();
});

const obtenerImagen = (event) => {
  if (event.target.files[0]) {
    formulario.value.imagen_principal = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      imagenPreview.value = e.target.result;
    };
    reader.readAsDataURL(event.target.files[0]);
  } else {
    imagenPreview.value = formulario.value.imagen_principal;
  }
};
const abrirModal = () => {
  posicion.value = '';
  formulario.value = {
    nombre: '',
    precio: '',
    catalogo_id: '',
    categoria_id: '',
    descripcion: '',
    images: [],
    imagePreviews: [],
    caracteristicas: [], // Asegúrate de que esto esté inicializado como un array
    modelos: [] // Inicializa el array de modelos
  };
  imagenPreview.value = ''; // Limpiar la vista previa de la imagen
  instanciaModal.show();
};
const listarCategorias = async () => {
  try {
    const { data } = await indexActivosCategorias();
    categorias.value = data.datos;
    console.log(categorias.value);
  } catch (error) {
    console.log(error);
  }
}
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
  errors.value = {};
  try {
    const formData = new FormData();
    if (formulario.value.nombre) {
      formData.append('nombre', formulario.value.nombre);
    }
    if (formulario.value.precio) {
      formData.append('precio', formulario.value.precio);
    }
    if (formulario.value.catalogo_id) {
      formData.append('catalogo_id', formulario.value.catalogo_id);
    }
    if (formulario.value.categoria_id) {
      formData.append('categoria_id', formulario.value.categoria_id);
    }
    if (formulario.value.descripcion) {
      formData.append('descripcion', formulario.value.descripcion);
    }
    if (formulario.value.cantidad_minima) {
      formData.append('cantidad_minima', formulario.value.cantidad_minima);
    }
    if (formulario.value.cantidad_maxima) {
      formData.append('cantidad_maxima', formulario.value.cantidad_maxima);
    }
    // Solo agregar el archivo de imagen si se seleccionó uno nuevo
    if (formulario.value.imagen_principal instanceof File) {
      formData.append('imagen_principal', formulario.value.imagen_principal);
    }
    for (let i = 0; i < formulario.value.images.length; i++) {
      formData.append('images[]', formulario.value.images[i].file);
    }
    // Enviar las características como cadenas
    formulario.value.caracteristicas.forEach(caracteristica => {
      formData.append('caracteristicas[]', caracteristica); // Asegúrate de que el nombre sea correcto
    });
    formulario.value.modelos.forEach(modelo => {
      formData.append('modelos[]', JSON.stringify(modelo)); // Asegúrate de que modelo sea un objeto
    });
    console.log('modelos a enviar:', formulario.value.modelos);
    console.log(formulario.value);
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
    if (error.response.status == 422) {
      errors.value = error.response.data.errors;
    } else {
      console.log(error);
    }
  }
};
// En el método mostrarProducto, asegúrate de que las características se carguen correctamente
const mostrarProducto = async (id) => {
  try {
    const { data } = await showProducto(id);
    console.log(data);
    instanciaModal.show();

    const imagePreviews = data.dato.images.map(image => ({
      id: image.id,
      preview: image.imagen
    }));
    const caracteristicas = Array.isArray(data.dato.caracteristicas) ?
      data.dato.caracteristicas.map(h => h.caracteristica) : []; // Devuelve los días como strings
    // Cargar los modelos
    const modelos = Array.isArray(data.dato.modelos) ?
      data.dato.modelos.map(modelo => ({
        nombre: modelo.nombre,
        precio: modelo.precio,
        cantidad_minima: modelo.cantidad_minima,
        cantidad_maxima: modelo.cantidad_maxima
      })) : []; // Asegúrate de que sea un array
    formulario.value = {
      nombre: data.dato.nombre,
      precio: data.dato.precio,
      catalogo_id: data.dato.catalogo_id,
      categoria_id: data.dato.categoria_id,
      imagen_principal: data.dato.imagen_principal,
      descripcion: data.dato.descripcion,
      cantidad_minima: data.dato.cantidad_minima,
      cantidad_maxima: data.dato.cantidad_maxima,
      images: [],
      imagePreviews: imagePreviews,
      caracteristicas: caracteristicas,
      modelos: modelos
    };

    imagenPreview.value = formulario.value.imagen_principal;
    posicion.value = id;
  } catch (error) {
    console.log(error);
  }
};
const agregarCaracteristicas = () => {
  formulario.value.caracteristicas.push('');
};

const eliminarCaracteristicas = (index) => {
  formulario.value.caracteristicas.splice(index, 1);
};

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
// Función para agregar un nuevo modelo
const agregarModelo = () => {
  formulario.value.modelos.push({
    nombre: '',
    precio: null,
    cantidad_minima: null,
    cantidad_maxima: null
  });
}
// Función para eliminar un modelo
const eliminarModelo = (index) => {
  formulario.value.modelos.splice(index, 1);
};
</script>

<style scoped></style>