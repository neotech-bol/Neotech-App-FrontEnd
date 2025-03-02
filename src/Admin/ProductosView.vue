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

  <div class="modal fade" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1"
    aria-labelledby="staticBackdropLabel" aria-hidden="true">
    <div class="modal-dialog modal-fullscreen"> <!-- Cambiado a modal-fullscreen para máximo tamaño -->
      <div class="modal-content">
        <div class="modal-header bg-primary text-white py-3">
          <h3 class="modal-title" id="staticBackdropLabel">
            {{ posicion != "" ? 'Editar producto' : 'Nuevo producto' }}
          </h3>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body p-4">
          <div class="row g-4">
            <!-- Información básica -->
            <div class="col-12 col-lg-6">
              <h4 class="mb-3">Información básica</h4>
              <div class="mb-3">
                <label for="nombre" class="form-label fw-bold">Nombre <span class="text-danger">*</span></label>
                <input type="text" id="nombre" class="form-control form-control-lg" :class="{ 'is-invalid': errors.nombre }" v-model="formulario.nombre" placeholder="Ingrese el nombre del producto">
                <div class="invalid-feedback" v-if="errors.nombre">{{ errors.nombre[0] }}</div>
              </div>
              <div class="mb-3">
                <label for="precio" class="form-label fw-bold">Precio <span class="text-danger">*</span></label>
                <input type="number" id="precio" class="form-control form-control-lg" :class="{ 'is-invalid': errors.precio }" v-model="formulario.precio" placeholder="Ingrese el precio">
                <div class="invalid-feedback" v-if="errors.precio">{{ errors.precio[0] }}</div>
              </div>
              <div class="mb-3">
                <label for="categoria" class="form-label fw-bold">Categoría</label>
                <select class="form-select form-select-lg" id="categoria" v-model="formulario.categoria_id">
                  <option value="" selected>Seleccione una categoría</option>
                  <option :value="item.id" v-for="item in categorias" :key="item.id">{{ item.nombre }}</option>
                </select>
              </div>
              <div class="mb-3">
                <label for="descripcion" class="form-label fw-bold">Descripción</label>
                <textarea id="descripcion" class="form-control form-control-lg" v-model="formulario.descripcion" placeholder="Ingrese la descripción del producto" rows="4"></textarea>
              </div>
            </div>

            <!-- Cantidades y imagen principal -->
            <div class="col-12 col-lg-6">
              <h4 class="mb-3">Cantidades e imagen principal</h4>
              <div class="row g-3">
                <div class="col-md-6">
                  <label for="cantidad_minima" class="form-label fw-bold">Cantidad mínima <span class="text-danger">*</span></label>
                  <input type="number" id="cantidad_minima" class="form-control form-control-lg" :class="{ 'is-invalid': errors.cantidad_minima }" v-model="formulario.cantidad_minima" placeholder="Mínimo">
                  <div class="invalid-feedback" v-if="errors.cantidad_minima">{{ errors.cantidad_minima[0] }}</div>
                </div>
                <div class="col-md-6">
                  <label for="cantidad_maxima" class="form-label fw-bold">Cantidad máxima <span class="text-danger">*</span></label>
                  <input type="number" id="cantidad_maxima" class="form-control form-control-lg" :class="{ 'is-invalid': errors.cantidad_maxima }" v-model="formulario.cantidad_maxima" placeholder="Máximo">
                  <div class="invalid-feedback" v-if="errors.cantidad_maxima">{{ errors.cantidad_maxima[0] }}</div>
                </div>
              </div>
              <div class="mt-3">
                <label for="imagen" class="form-label fw-bold">Imagen principal <span class="text-danger">*</span></label>
                <input type="file" class="form-control form-control-lg" id="imagen" @change="obtenerImagen($event)" :class="{ 'is-invalid': errors.imagen_principal }">
                <div class="invalid-feedback" v-if="errors.imagen_principal">{{ errors.imagen_principal[0] }}</div>
                <img v-if="imagenPreview" :src="imagenPreview" alt="Vista previa" class="img-fluid mt-3 rounded" style="max-height: 200px;">
              </div>
            </div>

            <!-- Características -->
            <div class="col-12">
              <h4 class="mb-3">Características <span class="text-danger">*</span></h4>
              <div v-for="(caracteristica, index) in formulario.caracteristicas" :key="index" class="input-group mb-2">
                <input type="text" class="form-control form-control-lg" v-model="formulario.caracteristicas[index]" placeholder="Ingrese una característica del producto">
                <button type="button" class="btn btn-outline-danger btn-lg" @click="eliminarCaracteristicas(index)">
                  <i class="fas fa-trash-alt"></i>
                </button>
              </div>
              <button type="button" class="btn btn-outline-secondary btn-lg mt-2" @click="agregarCaracteristicas()">
                <i class="fas fa-plus"></i> Agregar Característica
              </button>
              <div class="invalid-feedback d-block" v-if="errors.caracteristicas">{{ errors.caracteristicas[0] }}</div>
            </div>

            <!-- Modelos -->
            <div class="col-12">
              <h4 class="mb-3">Modelos <span class="text-danger">*</span></h4>
              <div class="table-responsive">
                <table class="table table-bordered">
                  <thead class="table-light">
                    <tr>
                      <th>Nombre</th>
                      <th>Precio</th>
                      <th>Cantidad mínima</th>
                      <th>Cantidad máxima</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(modelo, index) in formulario.modelos" :key="index">
                      <td><input type="text" class="form-control" v-model="modelo.nombre" placeholder="Nombre"></td>
                      <td><input type="number" class="form-control" v-model="modelo.precio" placeholder="Precio"></td>
                      <td><input type="number" class="form-control" v-model="modelo.cantidad_minima" placeholder="Mínimo"></td>
                      <td><input type="number" class="form-control" v-model="modelo.cantidad_maxima" placeholder="Máximo"></td>
                      <td>
                        <button type="button" class="btn btn-outline-danger" @click="eliminarModelo(index)">
                          <i class="fas fa-trash-alt"></i>
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <button type="button" class="btn btn-outline-secondary btn-lg mt-2" @click="agregarModelo">
                <i class="fas fa-plus"></i> Agregar Modelo
              </button>
              <div class="invalid-feedback d-block" v-if="errors.modelos">{{ errors.modelos[0] }}</div>
            </div>

            <!-- Imágenes adicionales -->
            <div class="col-12">
              <h4 class="mb-3">Imágenes adicionales <span class="text-danger">*</span></h4>
              <div class="row g-3">
                <div class="col-md-4" v-for="(image, index) in formulario.images" :key="index">
                  <div class="card">
                    <div class="card-body">
                      <input type="file" class="form-control mb-2" @change="(event) => handleFileUpload(event, index)">
                      <div class="d-flex align-items-center mb-2">
                        <label :for="'color-' + index" class="me-2">Color:</label>
                        <input type="color" class="form-control form-control-color" :id="'color-' + index" v-model="image.color" @input="handleColorChange($event, index)">
                      </div>
                      <img v-if="image.preview" :src="image.preview" class="img-fluid rounded mb-2" alt="Preview">
                      <button type="button" class="btn btn-outline-danger btn-sm w-100" @click="eliminarImage(index)">
                        <i class="fas fa-trash-alt"></i> Eliminar
                      </button>
                    </div>
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="card h-100">
                    <div class="card-body d-flex align-items-center justify-content-center">
                      <button type="button" class="btn btn-outline-secondary btn-lg" @click="agregarImagenes">
                        <i class="fas fa-plus"></i> Agregar Imagen
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div class="invalid-feedback d-block" v-if="errors.images">{{ errors.images[0] }}</div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-outline-secondary btn-lg" data-bs-dismiss="modal">Cancelar</button>
          <button type="button" class="btn btn-lg" :class="posicion != '' ? 'btn-warning' : 'btn-primary'" @click="guardarProducto">
            {{ posicion != "" ? 'Actualizar producto' : "Guardar producto" }}
          </button>
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
    caracteristicas: [], // Asegúrate de que esto esté inicializado como un array
    modelos: [] // Inicializa el array de modelos
  };
  imagenPreview.value = ''; // Limpiar la vista previa de la imagen
  instanciaModal.show();
};
const listarCategorias = async () => {
  try {
    const { data } = await indexActivosCategorias();
    console.log(data);
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
    let newImageIndex = 0;
    for (let i = 0; i < formulario.value.images.length; i++) {
      const image = formulario.value.images[i];

      if (image.isExisting) {
        // Si es una imagen existente pero con un nuevo archivo
        if (image.file) {
          formData.append(`existing_images_files[${image.id}]`, image.file); // Nuevo archivo
        }
        formData.append(`existing_images[${image.id}]`, image.color); // Color actualizado
      } else if (image.file) {
        // Para imágenes nuevas
        formData.append('images[]', image.file);
        formData.append(`colors[${newImageIndex}]`, image.color);
        newImageIndex++;
      }
    }

    // Enviar las características como cadenas
    formulario.value.caracteristicas.forEach(caracteristica => {
      formData.append('caracteristicas[]', caracteristica); // Asegúrate de que el nombre sea correcto
    });
    formulario.value.modelos.forEach(modelo => {
      formData.append('modelos[]', JSON.stringify(modelo)); // Asegúrate de que modelo sea un objeto
    });
    console.log([formulario.value.images]); // Verifica los datos enviados
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

    // Cargar las imágenes directamente en el formulario
    // Cargar las imágenes directamente en el formulario, pero ahora incluyendo el ID
    const images = data.dato.images.map(image => ({
      id: image.id, // Guarda el ID de la imagen existente
      file: null,   // Inicializa el archivo como null
      preview: image.imagen, // URL de la imagen
      color: image.color || '#FFFFFF', // Color de la imagen (valor predeterminado si no existe)
      isExisting: true // Marca esta imagen como existente
    }));
    console.log(images);
    const caracteristicas = Array.isArray(data.dato.caracteristicas) ?
      data.dato.caracteristicas.map(h => h.caracteristica) : []; // Devuelve las características como strings

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
      images: images, // Asigna las imágenes directamente
      caracteristicas: caracteristicas,
      modelos: modelos
    };

    console.log(formulario.value);
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
const agregarImagenes = () => {
  formulario.value.images.push({
    preview: '', // Para almacenar la URL de la vista previa
    color: '#FFFFFF', // Inicializa el color con un valor por defecto
    file: null // Inicializa el archivo como null
  });
};
const eliminarImage = async (index) => {
  const image = formulario.value.images[index];

  // Si la imagen existe en la base de datos (tiene ID)
  if (image && image.id && image.isExisting) {
    try {
      // Llamar al endpoint de eliminación en el backend
      await deleteImage(posicion.value, image.id);

      // Si la eliminación en el backend fue exitosa, eliminarla del array local
      formulario.value.images.splice(index, 1);

      // Opcional: mostrar mensaje de éxito
      console.log('Imagen eliminada correctamente');
    } catch (error) {
      console.error('Error al eliminar la imagen:', error);
      // Opcional: mostrar mensaje de error al usuario
    }
  } else {
    // Si es solo una imagen nueva que aún no está en la base de datos
    formulario.value.images.splice(index, 1);
  }
};
const handleFileUpload = (event, index) => {
  const file = event.target.files[0];
  if (file) {
    // Actualizar el archivo en el objeto de imagen
    formulario.value.images[index].file = file;

    // Crear una vista previa de la imagen
    const reader = new FileReader();
    reader.onload = (e) => {
      formulario.value.images[index].preview = e.target.result; // Guardar la URL de la vista previa
    };
    reader.readAsDataURL(file);
  }
};
const handleColorChange = (event, index) => {
  formulario.value.images[index].color = event.target.value; // Actualiza el color en el objeto de imagen
};
</script>

<style scoped></style>