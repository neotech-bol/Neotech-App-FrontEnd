<template>
  <div class="container-fluid py-4">
    <div class="card shadow">
      <div class="card-header bg-primary bg-opacity-10 d-flex justify-content-between align-items-center flex-wrap gap-3 p-3">
        <h2 class="card-title h4 m-0">Gestión de Productos</h2>
        <div>
          <button class="btn btn-primary me-2" @click="abrirModal()">
            <i class="fas fa-plus me-2"></i>Agregar Producto
          </button>
          <button class="btn btn-info" @click="mostrarDatosPrueba()">
            <i class="fas fa-eye me-2"></i>Ver Datos de Prueba
          </button>
        </div>
      </div>
      <div class="card-body p-0">
        <div class="p-3">
          <div class="input-group mb-3">
            <span class="input-group-text bg-light">
              <i class="fas fa-search"></i>
            </span>
            <input 
              type="text" 
              class="form-control" 
              placeholder="Buscar producto..." 
              v-model="search" 
              @input="filtrarProductos"
            >
          </div>
        </div>

        <!-- Table for larger screens -->
        <div class="table-responsive d-none d-md-block">
          <table class="table table-hover align-middle mb-0">
            <thead class="bg-light">
              <tr class="text-center">
                <th>ID</th>
                <th>Nombre</th>
                <th>Precio</th>
                <th>Categoría</th>
                <th>Stock</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in productosFiltrados" :key="item.id" class="text-center">
                <td>{{ item.id }}</td>
                <td>{{ item.nombre }}</td>
                <td>{{ formatearPrecio(item.precio) }}</td>
                <td>{{ item.categoria?.nombre || 'N/A' }}</td>
                <td>{{ item.cantidad || 'N/A' }}</td>
                <td>
                  <span class="badge" :class="item.estado ? 'bg-success' : 'bg-danger'">
                    {{ item.estado ? 'Activo' : 'Inactivo' }}
                  </span>
                </td>
                <td>
                  <div class="btn-group">
                    <button class="btn btn-sm btn-outline-primary" @click="mostrarProducto(item.id)">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-info" @click="verDetalles(item.id)">
                      <i class="fas fa-info-circle"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Cards for mobile view -->
        <div class="d-md-none">
          <div v-for="item in productosFiltrados" :key="item.id" class="card mb-3 mx-3">
            <div class="card-body">
              <h5 class="card-title">{{ item.nombre }}</h5>
              <p class="card-text">
                <strong>Precio:</strong> {{ formatearPrecio(item.precio) }}<br>
                <strong>Categoría:</strong> {{ item.categoria?.nombre || 'N/A' }}<br>
                <strong>Stock:</strong> {{ item.cantidad || 'N/A' }}<br>
                <strong>Estado:</strong> 
                <span class="badge" :class="item.estado ? 'bg-success' : 'bg-danger'">
                  {{ item.estado ? 'Activo' : 'Inactivo' }}
                </span>
              </p>
              <div class="d-flex justify-content-end gap-2">
                <button class="btn btn-sm btn-outline-primary" @click="mostrarProducto(item.id)">
                  <i class="fas fa-edit me-1"></i>Editar
                </button>
                <button class="btn btn-sm btn-outline-info" @click="verDetalles(item)">
                  <i class="fas fa-info-circle me-1"></i>Detalles
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal para agregar/editar producto -->
    <div class="modal fade" id="productoModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-xl">
        <div class="modal-content">
          <div class="modal-header" :class="posicion ? 'bg-warning bg-opacity-10' : 'bg-primary bg-opacity-10'">
            <h5 class="modal-title">{{ posicion ? 'Editar Producto' : 'Nuevo Producto' }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="guardarProducto">
              <div class="row g-3">
                <div class="col-md-6">
                  <label for="nombre" class="form-label">Nombre <span class="text-danger">*</span></label>
                  <input 
                    type="text" 
                    class="form-control" 
                    :class="{ 'is-invalid': errors.nombre }"
                    id="nombre" 
                    v-model="formulario.nombre" 
                    required
                  >
                  <div class="invalid-feedback" v-if="errors.nombre">
                    {{ errors.nombre[0] }}
                  </div>
                </div>
                <div class="col-md-6">
                  <label for="precio" class="form-label">Precio <span class="text-danger">*</span></label>
                  <input 
                    type="number" 
                    class="form-control" 
                    :class="{ 'is-invalid': errors.precio }"
                    id="precio" 
                    v-model="formulario.precio" 
                    required
                  >
                  <div class="invalid-feedback" v-if="errors.precio">
                    {{ errors.precio[0] }}
                  </div>
                </div>
                <div class="col-md-6">
                  <label for="categoria" class="form-label">Categoría</label>
                  <select 
                    class="form-select" 
                    id="categoria" 
                    v-model="formulario.categoria_id"
                  >
                    <option value="">Seleccione una categoría</option>
                    <option :value="item.id" v-for="item in categorias" :key="item.id">
                      {{ item.nombre }}
                    </option>
                  </select>
                </div>
                <div class="col-md-6">
                  <label for="cantidad" class="form-label">Cantidad</label>
                  <input 
                    type="number" 
                    class="form-control" 
                    id="cantidad" 
                    v-model="formulario.cantidad"
                  >
                </div>
                <div class="col-12">
                  <label for="descripcion" class="form-label">Descripción</label>
                  <textarea 
                    class="form-control" 
                    id="descripcion" 
                    v-model="formulario.descripcion"
                    rows="3"
                  ></textarea>
                </div>
                <div class="col-md-6">
                  <label for="cantidad_minima" class="form-label">Cantidad Mínima</label>
                  <input 
                    type="number" 
                    class="form-control" 
                    id="cantidad_minima" 
                    v-model="formulario.cantidad_minima"
                  >
                </div>
                <div class="col-md-6">
                  <label for="cantidad_maxima" class="form-label">Cantidad Máxima</label>
                  <input 
                    type="number" 
                    class="form-control" 
                    id="cantidad_maxima" 
                    v-model="formulario.cantidad_maxima"
                  >
                </div>
                <div class="col-12">
                  <label for="imagen_principal" class="form-label">Imagen Principal</label>
                  <input 
                    type="file" 
                    class="form-control" 
                    id="imagen_principal" 
                    @change="obtenerImagen($event)"
                  >
                  <img v-if="imagenPreview" :src="imagenPreview" alt="Vista previa" class="img-fluid mt-2" style="max-height: 200px;">
                </div>
                <div class="col-12">
                  <h5>Características</h5>
                  <div v-for="(caracteristica, index) in formulario.caracteristicas" :key="index" class="mb-2">
                    <div class="input-group">
                      <input 
                        type="text" 
                        class="form-control" 
                        v-model="formulario.caracteristicas[index]" 
                        placeholder="Característica"
                      >
                      <button type="button" class="btn btn-outline-danger" @click="eliminarCaracteristica(index)">
                        <i class="fas fa-trash-alt"></i>
                      </button>
                    </div>
                  </div>
                  <button type="button" class="btn btn-outline-secondary mt-2" @click="agregarCaracteristica">
                    <i class="fas fa-plus"></i> Agregar Característica
                  </button>
                </div>
                <div class="col-12">
                  <h5>Modelos</h5>
                  <div v-for="(modelo, index) in formulario.modelos" :key="index" class="card mb-3">
                    <div class="card-body">
                      <div class="row g-2">
                        <div class="col-md-6">
                          <input type="text" class="form-control" v-model="modelo.nombre" placeholder="Nombre del modelo">
                        </div>
                        <div class="col-md-6">
                          <input type="number" class="form-control" v-model="modelo.precio" placeholder="Precio">
                        </div>
                        <div class="col-md-6">
                          <input type="number" class="form-control" v-model="modelo.cantidad_minima" placeholder="Cantidad mínima">
                        </div>
                        <div class="col-md-6">
                          <input type="number" class="form-control" v-model="modelo.cantidad_maxima" placeholder="Cantidad máxima">
                        </div>
                      </div>
                      <button type="button" class="btn btn-outline-danger mt-2" @click="eliminarModelo(index)">
                        <i class="fas fa-trash-alt"></i> Eliminar Modelo
                      </button>
                    </div>
                  </div>
                  <button type="button" class="btn btn-outline-secondary" @click="agregarModelo">
                    <i class="fas fa-plus"></i> Agregar Modelo
                  </button>
                </div>
                <div class="col-12">
                  <h5>Imágenes Adicionales</h5>
                  <div class="row g-3">
                    <div class="col-md-4" v-for="(imagen, index) in formulario.images" :key="index">
                      <div class="card">
                        <div class="card-body">
                          <input type="file" class="form-control mb-2" @change="(event) => handleFileUpload(event, index)">
                          <div class="d-flex align-items-center mb-2">
                            <label :for="'color-' + index" class="me-2">Color:</label>
                            <input type="color" class="form-control form-control-color" :id="'color-' + index" v-model="imagen.color">
                          </div>
                          <img v-if="imagen.preview" :src="imagen.preview" class="img-fluid rounded mb-2" alt="Preview">
                          <button type="button" class="btn btn-outline-danger btn-sm w-100" @click="eliminarImagen(index)">
                            <i class="fas fa-trash-alt"></i> Eliminar
                          </button>
                        </div>
                      </div>
                    </div>
                    <div class="col-md-4">
                      <div class="card h-100">
                        <div class="card-body d-flex align-items-center justify-content-center">
                          <button type="button" class="btn btn-outline-secondary" @click="agregarImagen">
                            <i class="fas fa-plus"></i> Agregar Imagen
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
            <button type="button" class="btn" :class="posicion ? 'btn-warning' : 'btn-primary'" @click="guardarProducto">
              {{ posicion ? 'Actualizar' : 'Guardar' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de detalles del producto -->
    <div class="modal fade" id="detallesModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header bg-info bg-opacity-10">
            <h5 class="modal-title">Detalles del Producto</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body" v-if="productoSeleccionado">
            <div class="row">
              <div class="col-md-6">
                <img :src="productoSeleccionado.imagen_principal" alt="Imagen principal" class="img-fluid rounded mb-3">
              </div>
              <div class="col-md-6">
                <h4>{{ productoSeleccionado.nombre }}</h4>
                <p><strong>Precio:</strong> {{ formatearPrecio(productoSeleccionado.precio) }}</p>
                <p><strong>Categoría:</strong> {{ productoSeleccionado.categoria?.nombre || 'N/A' }}</p>
                <p><strong>Descripción:</strong> {{ productoSeleccionado.descripcion || 'N/A' }}</p>
                <p><strong>Cantidad Mínima:</strong> {{ productoSeleccionado.cantidad_minima }}</p>
                <p><strong>Cantidad Máxima:</strong> {{ productoSeleccionado.cantidad_maxima }}</p>
                <p><strong>Estado:</strong> 
                  <span class="badge" :class="productoSeleccionado.estado ? 'bg-success' : 'bg-danger'">
                    {{ productoSeleccionado.estado ? 'Activo' : 'Inactivo' }}
                  </span>
                </p>
              </div>
            </div>
            <h5 class="mt-4">Características</h5>
            <ul>
              <li v-for="(caracteristica, index) in productoSeleccionado.caracteristicas" :key="index">
                {{ caracteristica.caracteristica }}
              </li>
            </ul>
            <h5 class="mt-4">Modelos</h5>
            <div class="table-responsive">
              <table class="table table-sm">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Precio</th>
                    <th>Cantidad Mínima</th>
                    <th>Cantidad Máxima</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="modelo in productoSeleccionado.modelos" :key="modelo.id">
                    <td>{{ modelo.nombre }}</td>
                    <td>{{ formatearPrecio(modelo.precio) }}</td>
                    <td>{{ modelo.cantidad_minima }}</td>
                    <td>{{ modelo.cantidad_maxima }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <h5 class="mt-4">Imágenes Adicionales</h5>
            <div class="row g-3">
              <div class="col-md-4" v-for="imagen in productoSeleccionado.images" :key="imagen.id">
                <div class="card">
                  <img :src="imagen.imagen" class="card-img-top" :alt="productoSeleccionado.nombre">
                  <div class="card-body">
                    <p class="card-text">Color: <span :style="{ backgroundColor: imagen.color, width: '20px', height: '20px', display: 'inline-block', verticalAlign: 'middle' }"></span></p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { Modal } from 'bootstrap/dist/js/bootstrap.bundle.min';
import { indexProductos, showProducto, storeProducto, updateProducto, deleteImage } from '@/Services/ProductoService';
import { indexActivosCategorias } from '@/Services/CategoriaService';

const productos = ref([]);
const categorias = ref([]);
const search = ref('');
const posicion = ref('');
const formulario = ref({
  nombre: '',
  precio: '',
  categoria_id: '',
  descripcion: '',
  cantidad: '',
  cantidad_minima: '',
  cantidad_maxima: '',
  imagen_principal: '',
  caracteristicas: [],
  modelos: [],
  images: []
});
const errors = ref({});
const imagenPreview = ref('');
const productoSeleccionado = ref(null);

let productoModal = null;
let detallesModal = null;

onMounted(() => {
  productoModal = new Modal(document.getElementById('productoModal'));
  detallesModal = new Modal(document.getElementById('detallesModal'));
  listarProductos();
  listarCategorias();
});

const productosFiltrados = computed(() => {
  if (!search.value) return productos.value;
  return productos.value.filter(producto => 
    producto.nombre.toLowerCase().includes(search.value.toLowerCase()) ||
    producto.categoria?.nombre.toLowerCase().includes(search.value.toLowerCase())
  );
});

const obtenerImagen = (event) => {
  const file = event.target.files[0];
  if (file) {
    formulario.value.imagen_principal = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      imagenPreview.value = e.target.result;
    };
    reader.readAsDataURL(file);
  } else {
    imagenPreview.value = '';
  }
};

const abrirModal = () => {
  posicion.value = '';
  formulario.value = {
    nombre: '',
    precio: '',
    categoria_id: '',
    descripcion: '',
    cantidad: '',
    cantidad_minima: '',
    cantidad_maxima: '',
    imagen_principal: '',
    caracteristicas: [],
    modelos: [],
    images: []
  };
  imagenPreview.value = '';
  errors.value = {};
  productoModal.show();
};

const listarProductos = async () => {
  try {
    const { data } = await indexProductos();
    productos.value = data.datos;
  } catch (error) {
    console.error('Error al cargar productos:', error);
  }
};

const listarCategorias = async () => {
  try {
    const { data } = await indexActivosCategorias();
    categorias.value = data.datos;
  } catch (error) {
    console.error('Error al cargar categorías:', error);
  }
};

const guardarProducto = async () => {
  errors.value = {};
  try {
    const formData = new FormData();
    Object.keys(formulario.value).forEach(key => {
      if (formulario.value[key] !== '' && key !== 'images' && key !== 'caracteristicas' && key !== 'modelos') {
        formData.append(key, formulario.value[key]);
      }
    });

    formulario.value.caracteristicas.forEach((caracteristica, index) => {
      formData.append(`caracteristicas[${index}]`, caracteristica);
    });

    formulario.value.modelos.forEach((modelo, index) => {
      Object.keys(modelo).forEach(key => {
        formData.append(`modelos[${index}][${key}]`, modelo[key]);
      });
    });

    formulario.value.images.forEach((imagen, index) => {
      if (imagen.file) {
        formData.append(`images[${index}]`, imagen.file);
        formData.append(`colors[${index}]`, imagen.color);
      }
    });

    if (posicion.value) {
      formData.append('_method', 'PUT');
      await updateProducto(posicion.value, formData);
    } else {
      await storeProducto(formData);
    }
    await listarProductos();
    productoModal.hide();
  } catch (error) {
    if (error.response && error.response.status === 422) {
      errors.value = error.response.data.errors;
    } else {
      console.error('Error al guardar producto:', error);
    }
  }
};

const mostrarProducto = async (id) => {
  try {
    const { data } = await showProducto(id);
    console.log(data);
    formulario.value = {
      nombre: data.dato.nombre,
      precio: data.dato.precio,
      categoria_id: data.dato.categoria_id,
      descripcion: data.dato.descripcion,
      cantidad: data.dato.cantidad,
      cantidad_minima: data.dato.cantidad_minima,
      cantidad_maxima: data.dato.cantidad_maxima,
      imagen_principal: data.dato.imagen_principal,
      caracteristicas: data.dato.caracteristicas.map(c => c.caracteristica),
      modelos: data.dato.modelos,
      images: data.dato.images.map(img => ({
        id: img.id,
        preview: img.imagen,
        color: img.color,
        file: null
      }))
    };
    imagenPreview.value = data.dato.imagen_principal;
    posicion.value = id;
    productoModal.show();
  } catch (error) {
    console.error('Error al obtener producto:', error);
  }
};

const verDetalles = async (productoIO) => {
  productoSeleccionado.value = productoIO;
  try {
    const {data} = await  showProducto(productoIO);
    productoSeleccionado.value = data.dato;
    console.log(productoSeleccionado);
    detallesModal.show();
  } catch (error) {
    console.log(error);
  }
};

const formatearPrecio = (precio) => {
  return new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB' }).format(precio);
};

const filtrarProductos = () => {
  // La función computed 'productosFiltrados' se encargará de filtrar automáticamente
};

const agregarCaracteristica = () => {
  formulario.value.caracteristicas.push('');
};

const eliminarCaracteristica = (index) => {
  formulario.value.caracteristicas.splice(index, 1);
};

const agregarModelo = () => {
  formulario.value.modelos.push({
    nombre: '',
    precio: '',
    cantidad_minima: '',
    cantidad_maxima: ''
  });
};

const eliminarModelo = (index) => {
  formulario.value.modelos.splice(index, 1);
};

const agregarImagen = () => {
  formulario.value.images.push({
    file: null,
    preview: '',
    color: '#000000'
  });
};

const eliminarImagen = async (index) => {
  const imagen = formulario.value.images[index];
  if (imagen.id) {
    try {
      await deleteImage(posicion.value, imagen.id);
    } catch (error) {
      console.error('Error al eliminar imagen:', error);
    }
  }
  formulario.value.images.splice(index, 1);
};

const handleFileUpload = (event, index) => {
  const file = event.target.files[0];
  if (file) {
    formulario.value.images[index].file = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      formulario.value.images[index].preview = e.target.result;
    };
    reader.readAsDataURL(file);
  }
};

const mostrarDatosPrueba = () => {
  const datosPrueba = {
    mensaje: 'Producto cargado correctamente',
    dato: {
      id: 1,
      categoria_id: 1,
      user_id: 1,
      nombre: 'Motocicleta electrica',
      descripcion: null,
      precio: '2500.00',
      estado: 1,
      cantidad: 0,
      imagen_principal: 'http://neotechbol.test/images/imagenes_principales/01a0cb6696e17c86fb70b669472b61f9.jpeg',
      cantidad_minima: 10,
      cantidad_maxima: 100,
      created_at: '2025-02-28T06:40:55.000000Z',
      updated_at: '2025-02-28T06:40:55.000000Z',
      images: [
        {
          id: 1,
          producto_id: 1,
          imagen: 'http://neotechbol.test/images/productos/5a090581d2954ab1e3c1c1f64f0bc37a.jpeg',
          color: '#497e25',
          created_at: '2025-02-28T06:40:55.000000Z',
          updated_at: '2025-02-28T06:40:55.000000Z'
        }
      ],
      categoria: {
        id: 1,
        catalogo_id: 1,
        nombre: 'Motocicletas',
        banner: '67c79fd30a2d910b6e39d5cbd5637c2f.webp',
        titulo: 'Movilidad Inteligente',
        subtitulo: 'Velocidad, diseño y tecnología en cada modelo.',
        descripcion: 'ninguna',
        estado: 1,
        created_at: '2025-02-28T06:38:29.000000Z',
        updated_at: '2025-02-28T06:39:27.000000Z'
      },
      user: {
        id: 1,
        nombre: 'Super Admin',
        apellido: 'Administrador',
        ci: '4254192123',
        nit: '4254192123',
        direccion: 'Calle del super Admin',
        telefono: '60792059',
        edad: 19,
        genero: 'M',
        email: 'superadmin@gmail.com',
        email_verified_at: null,
        departamento: 'cochabamba',
        estado: 1,
        created_at: '2025-02-28T06:36:25.000000Z',
        updated_at: '2025-03-04T05:52:30.000000Z'
      },
      caracteristicas: [
        {
          id: 1,
          producto_id: 1,
          caracteristica: 'Características 1',
          created_at: '2025-02-28T06:40:55.000000Z',
          updated_at: '2025-02-28T06:40:55.000000Z'
        },
        {
          id: 2,
          producto_id: 1,
          caracteristica: 'Características 2',
          created_at: '2025-02-28T06:40:55.000000Z',
          updated_at: '2025-02-28T06:40:55.000000Z'
        },
        {
          id: 3,
          producto_id: 1,
          caracteristica: 'Características 3',
          created_at: '2025-02-28T06:40:55.000000Z',
          updated_at: '2025-02-28T06:40:55.000000Z'
        },
        {
          id: 4,
          producto_id: 1,
          caracteristica: 'Características 4',
          created_at: '2025-02-28T06:40:55.000000Z',
          updated_at: '2025-02-28T06:40:55.000000Z'
        },
        {
          id: 5,
          producto_id: 1,
          caracteristica: 'Características 5',
          created_at: '2025-02-28T06:40:55.000000Z',
          updated_at: '2025-02-28T06:40:55.000000Z'
        }
      ],
      modelos: [
        {
          id: 1,
          producto_id: 1,
          nombre: 'exclusive',
          precio: '3000.00',
          cantidad_minima: 20,
          cantidad_maxima: 200,
          created_at: '2025-02-28T06:40:55.000000Z',
          updated_at: '2025-02-28T06:40:55.000000Z'
        }
      ]
    }
  };

  productoSeleccionado.value = datosPrueba.dato;
  detallesModal.show();
};
</script>

<style scoped>
.card {
  transition: box-shadow 0.3s ease-in-out;
}

.card:hover {
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
}

.modal-header, .modal-footer {
  padding: 1rem;
}

.modal-body {
  padding: 1.5rem;
}

@media (max-width: 767.98px) {
  .btn-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .btn-group .btn {
    width: 100%;
  }
}
</style>