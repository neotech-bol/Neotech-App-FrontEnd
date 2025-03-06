<template>
  <div class="container-fluid py-4">
    <div class="card shadow">
      <div
        class="card-header bg-primary bg-opacity-10 d-flex justify-content-between align-items-center flex-wrap gap-3 p-3">
        <h2 class="card-title h4 m-0">Gestión de Categorías</h2>
        <button class="btn btn-primary" @click="abrirModal()">
          <i class="fas fa-plus me-2"></i>Agregar Categoría
        </button>
      </div>
      <div class="card-body p-0">
        <div class="p-3">
          <div class="input-group mb-3">
            <span class="input-group-text bg-light">
              <i class="fas fa-search"></i>
            </span>
            <input type="text" class="form-control" placeholder="Buscar categoría..." v-model="search"
              @input="filtrarCategorias">
          </div>
        </div>

        <!-- Table for larger screens -->
        <div class="table-responsive d-none d-md-block">
          <table class="table table-hover align-middle mb-0">
            <thead class="bg-light">
              <tr class="text-center">
                <th>ID</th>
                <th>Nombre</th>
                <th>Título</th>
                <th>Subtítulo</th>
                <th>Descripción</th>
                <th>Productos</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in categoriasFiltradas" :key="item.id" class="text-center">
                <td>{{ item.id }}</td>
                <td>{{ item.nombre }}</td>
                <td>{{ item.titulo }}</td>
                <td>{{ item.subtitulo }}</td>
                <td>{{ item.descripcion }}</td>
                <td>{{ item.productos?.length || 0 }}</td>
                <td>
                  <span class="badge" :class="item.estado ? 'bg-success' : 'bg-danger'">
                    {{ item.estado ? 'Activo' : 'Inactivo' }}
                  </span>
                </td>
                <td>
                  <div class="btn-group">
                    <button class="btn btn-sm btn-outline-primary" @click="mostrarCategoria(item.id)">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm" :class="item.estado ? 'btn-outline-danger' : 'btn-outline-success'"
                      @click="cambiarEstado(item.id)">
                      <i class="fas" :class="item.estado ? 'fa-toggle-off' : 'fa-toggle-on'"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-info" @click="verDetalles(item)">
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
          <div v-for="item in categoriasFiltradas" :key="item.id" class="card mb-3 mx-3">
            <div class="card-body">
              <h5 class="card-title">{{ item.nombre }}</h5>
              <p class="card-text">
                <strong>Título:</strong> {{ item.titulo }}<br>
                <strong>Subtítulo:</strong> {{ item.subtitulo }}<br>
                <strong>Descripción:</strong> {{ item.descripcion || 'N/A' }}<br>
                <strong>Productos:</strong> {{ item.productos?.length || 0 }}<br>
                <strong>Estado:</strong>
                <span class="badge" :class="item.estado ? 'bg-success' : 'bg-danger'">
                  {{ item.estado ? 'Activo' : 'Inactivo' }}
                </span>
              </p>
              <div class="d-flex justify-content-end gap-2">
                <button class="btn btn-sm btn-outline-primary" @click="mostrarCategoria(item.id)">
                  <i class="fas fa-edit me-1"></i>Editar
                </button>
                <button class="btn btn-sm" :class="item.estado ? 'btn-outline-danger' : 'btn-outline-success'"
                  @click="cambiarEstado(item.id)">
                  <i class="fas me-1" :class="item.estado ? 'fa-toggle-off' : 'fa-toggle-on'"></i>
                  {{ item.estado ? 'Desactivar' : 'Activar' }}
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

    <!-- Modal para agregar/editar categoría -->
    <div class="modal fade" id="categoriaModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header" :class="posicion ? 'bg-warning bg-opacity-10' : 'bg-primary bg-opacity-10'">
            <h5 class="modal-title">{{ posicion ? 'Editar Categoría' : 'Nueva Categoría' }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="guardarCategoria">
              <div class="row g-3">
                <div class="col-md-6">
                  <label for="nombre" class="form-label">Nombre <span class="text-danger">*</span></label>
                  <input type="text" class="form-control" :class="{ 'is-invalid': errors.nombre }" id="nombre"
                    v-model="formulario.nombre" required>
                  <div class="invalid-feedback" v-if="errors.nombre">
                    {{ errors.nombre[0] }}
                  </div>
                </div>
                <div class="col-md-6">
                  <label for="catalogo" class="form-label">Catálogo</label>
                  <select class="form-select" id="catalogo" v-model="formulario.catalogo_id">
                    <option value="">Seleccione un catálogo</option>
                    <option :value="item.id" v-for="item in catalogos" :key="item.id">
                      {{ item.nombre }}
                    </option>
                  </select>
                </div>
                <div class="col-md-6">
                  <label for="titulo" class="form-label">Título <span class="text-danger">*</span></label>
                  <input type="text" class="form-control" :class="{ 'is-invalid': errors.titulo }" id="titulo"
                    v-model="formulario.titulo" required>
                  <div class="invalid-feedback" v-if="errors.titulo">
                    {{ errors.titulo[0] }}
                  </div>
                </div>
                <div class="col-md-6">
                  <label for="subtitulo" class="form-label">Subtítulo <span class="text-danger">*</span></label>
                  <input type="text" class="form-control" :class="{ 'is-invalid': errors.subtitulo }" id="subtitulo"
                    v-model="formulario.subtitulo" required>
                  <div class="invalid-feedback" v-if="errors.subtitulo">
                    {{ errors.subtitulo[0] }}
                  </div>
                </div>
                <div class="col-12">
                  <label for="descripcion" class="form-label">Descripción</label>
                  <textarea class="form-control" id="descripcion" v-model="formulario.descripcion" rows="3"></textarea>
                </div>
                <div class="col-12">
                  <label for="banner" class="form-label">Imagen banner</label>
                  <input type="file" class="form-control" :class="{ 'is-invalid': errors.banner }" id="banner"
                    @change="obtenerImagen($event)">
                  <div class="invalid-feedback" v-if="errors.banner">
                    {{ errors.banner[0] }}
                  </div>
                </div>
                <div class="col-12" v-if="imagenPreview">
                  <img :src="imagenPreview" alt="Vista previa" class="img-fluid mt-2" style="max-height: 200px;">
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
            <button type="button" class="btn" :class="posicion ? 'btn-warning' : 'btn-primary'"
              @click="guardarCategoria">
              {{ posicion ? 'Actualizar' : 'Guardar' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de detalles de la categoría -->
    <div class="modal fade" id="detallesModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header bg-info bg-opacity-10">
            <h5 class="modal-title">Detalles de la Categoría</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body" v-if="categoriaSeleccionada">
            <div class="row">
              <div class="col-md-6">
                <img :src="categoriaSeleccionada.banner" alt="Banner" class="img-fluid rounded mb-3">
              </div>
              <div class="col-md-6">
                <h4>{{ categoriaSeleccionada.nombre }}</h4>
                <p><strong>Título:</strong> {{ categoriaSeleccionada.titulo }}</p>
                <p><strong>Subtítulo:</strong> {{ categoriaSeleccionada.subtitulo }}</p>
                <p><strong>Descripción:</strong> {{ categoriaSeleccionada.descripcion || 'N/A' }}</p>
                <p><strong>Estado:</strong>
                  <span class="badge" :class="categoriaSeleccionada.estado ? 'bg-success' : 'bg-danger'">
                    {{ categoriaSeleccionada.estado ? 'Activo' : 'Inactivo' }}
                  </span>
                </p>
                <p><strong>Fecha de creación:</strong> {{ formatearFecha(categoriaSeleccionada.created_at) }}</p>
                <p><strong>Última actualización:</strong> {{ formatearFecha(categoriaSeleccionada.updated_at) }}</p>
              </div>
            </div>
            <h5 class="mt-4">Productos</h5>
            <div v-if="categoriaSeleccionada.productos && categoriaSeleccionada.productos.length > 0">
              <div class="table-responsive">
                <table class="table table-sm">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Nombre</th>
                      <th>Precio</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="producto in categoriaSeleccionada.productos" :key="producto.id">
                      <td>{{ producto.id }}</td>
                      <td>{{ producto.nombre }}</td>
                      <td>{{ formatearPrecio(producto.precio) }}</td>
                      <td>
                        <span class="badge" :class="producto.estado ? 'bg-success' : 'bg-danger'">
                          {{ producto.estado ? 'Activo' : 'Inactivo' }}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <p v-else>Esta categoría no tiene productos.</p>
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
import { indexCatalogoItems } from '@/Services/CatalogoService';
import { destroyCategoria, indexCategorias, showCategoria, storeCategoria, updateCategoria } from '@/Services/CategoriaService';

const categorias = ref([]);
const catalogos = ref([]);
const search = ref('');
const posicion = ref('');
const formulario = ref({
  nombre: '',
  titulo: '',
  subtitulo: '',
  descripcion: '',
  banner: '',
  catalogo_id: ''
});
const errors = ref({});
const imagenPreview = ref('');
const categoriaSeleccionada = ref(null);

let categoriaModal = null;
let detallesModal = null;

onMounted(() => {
  categoriaModal = new Modal(document.getElementById('categoriaModal'));
  detallesModal = new Modal(document.getElementById('detallesModal'));
  listarCategorias();
  mostrarCatalogos();
});

const categoriasFiltradas = computed(() => {
  if (!search.value) return categorias.value;
  return categorias.value.filter(categoria =>
    categoria.nombre.toLowerCase().includes(search.value.toLowerCase()) ||
    categoria.titulo.toLowerCase().includes(search.value.toLowerCase()) ||
    categoria.subtitulo.toLowerCase().includes(search.value.toLowerCase())
  );
});

const obtenerImagen = (event) => {
  const file = event.target.files[0];
  if (file) {
    formulario.value.banner = file;
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
    titulo: '',
    subtitulo: '',
    descripcion: '',
    banner: '',
    catalogo_id: ''
  };
  imagenPreview.value = '';
  errors.value = {};
  categoriaModal.show();
};

const listarCategorias = async () => {
  try {
    const { data } = await indexCategorias();
    categorias.value = data.datos.data;
  } catch (error) {
    console.error('Error al cargar categorías:', error);
  }
};

const guardarCategoria = async () => {
  errors.value = {};
  try {
    const formData = new FormData();
    Object.keys(formulario.value).forEach(key => {
      if (formulario.value[key] !== '') {
        formData.append(key, formulario.value[key]);
      }
    });

    // Solo agregar el banner si hay un nuevo archivo
    if (formulario.value.banner) {
      formData.append('banner', formulario.value.banner);
    }

    if (posicion.value) {
      formData.append('_method', 'PUT');
      await updateCategoria(posicion.value, formData);
    } else {
      await storeCategoria(formData);
    }
    await listarCategorias();
    categoriaModal.hide();
  } catch (error) {
    if (error.response && error.response.status === 422) {
      errors.value = error.response.data.errors;
    } else {
      console.error('Error al guardar categoría:', error);
    }
  }
};

const cambiarEstado = async (id) => {
  try {
    await destroyCategoria(id);
    await listarCategorias();
  } catch (error) {
    console.error('Error al cambiar estado de la categoría:', error);
  }
};

const mostrarCategoria = async (id) => {
  try {
    const { data } = await showCategoria(id);
    formulario.value = {
      nombre: data.dato.nombre,
      titulo: data.dato.titulo,
      subtitulo: data.dato.subtitulo,
      descripcion: data.dato.descripcion,
/*       banner: data.dato.banner, */
      catalogo_id: data.dato.catalogo_id
    };
    imagenPreview.value = data.dato.banner;
    posicion.value = id;
    categoriaModal.show();
  } catch (error) {
    console.error('Error al obtener categoría:', error);
  }
};

const mostrarCatalogos = async () => {
  try {
    const { data } = await indexCatalogoItems('');
    catalogos.value = data.datos;
  } catch (error) {
    console.error('Error al cargar catálogos:', error);
  }
};

const verDetalles = (categoria) => {
  categoriaSeleccionada.value = categoria;
  detallesModal.show();
};

const formatearFecha = (fecha) => {
  if (!fecha) return 'N/A';
  return new Date(fecha).toLocaleString();
};

const formatearPrecio = (precio) => {
  return new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB' }).format(precio);
};

const filtrarCategorias = () => {
  // La función computed 'categoriasFiltradas' se encargará de filtrar automáticamente
};

// Función para mostrar los datos proporcionados
const mostrarDatosPrueba = () => {
  const datosPrueba = {
    mensaje: 'Dato cargado',
    dato: {
      id: 1,
      catalogo_id: 1,
      nombre: 'Motocicletas',
      banner: 'http://neotechbol.test/images/categorias/banners/67c79fd30a2d910b6e39d5cbd5637c2f.webp',
      titulo: 'Movilidad Inteligente',
      subtitulo: 'Velocidad, diseño y tecnología en cada modelo.',
      descripcion: 'ninguna',
      estado: 1,
      created_at: '2025-02-28T06:38:29.000000Z',
      updated_at: '2025-02-28T06:39:27.000000Z',
      productos: [
        {
          id: 1,
          categoria_id: 1,
          user_id: 1,
          nombre: 'Motocicleta electrica',
          descripcion: null,
          precio: '2500.00',
          estado: 1,
          cantidad: 0,
          imagen_principal: '01a0cb6696e17c86fb70b669472b61f9.jpeg',
          cantidad_minima: 10,
          cantidad_maxima: 100,
          created_at: '2025-02-28T06:40:55.000000Z',
          updated_at: '2025-02-28T06:40:55.000000Z'
        }
      ]
    }
  };

  categoriaSeleccionada.value = datosPrueba.dato;
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

.modal-header,
.modal-footer {
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