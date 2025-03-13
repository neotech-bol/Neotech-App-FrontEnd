<template>
  <div class="container-fluid py-4">
    <div class="card shadow">
      <div
        class="card-header bg-primary bg-opacity-10 d-flex justify-content-between align-items-center flex-wrap gap-3 p-3">
        <h2 class="card-title h4 m-0">
          <i class="fas fa-folder me-2"></i>Gestión de Categorías
        </h2>
        <div>
          <button class="btn btn-primary" @click="abrirModal()">
            <i class="fas fa-plus me-2"></i>Agregar Categoría
          </button>
          <button class="btn btn-info ms-2" @click="mostrarDatosPrueba()">
            <i class="fas fa-eye me-2"></i>Ver Ejemplo
          </button>
        </div>
      </div>
      <div class="card-body p-0">
        <div class="p-3">
          <div class="input-group mb-3">
            <span class="input-group-text bg-light">
              <i class="fas fa-search"></i>
            </span>
            <input type="text" class="form-control" placeholder="Buscar por nombre, título o subtítulo..." v-model="search"
              @input="filtrarCategorias">
            <button class="btn btn-outline-secondary" type="button" @click="search = ''" v-if="search">
              <i class="fas fa-times"></i>
            </button>
          </div>
          
          <!-- Contador de resultados -->
          <div class="d-flex justify-content-between align-items-center mb-3">
            <p class="text-muted mb-0">
              <i class="fas fa-list-ul me-1"></i>
              Mostrando {{ categoriasFiltradas.length }} de {{ categorias.length }} categorías
            </p>
            <div class="btn-group">
              <button class="btn btn-sm" :class="vistaActual === 'tabla' ? 'btn-primary' : 'btn-outline-primary'" @click="vistaActual = 'tabla'">
                <i class="fas fa-table me-1"></i>Tabla
              </button>
              <button class="btn btn-sm" :class="vistaActual === 'tarjetas' ? 'btn-primary' : 'btn-outline-primary'" @click="vistaActual = 'tarjetas'">
                <i class="fas fa-th-large me-1"></i>Tarjetas
              </button>
            </div>
          </div>
        </div>

        <!-- Mensaje cuando no hay resultados -->
        <div v-if="categoriasFiltradas.length === 0" class="text-center py-5">
          <i class="fas fa-folder-open fa-3x text-muted mb-3"></i>
          <h5 class="text-muted">No se encontraron categorías</h5>
          <p class="text-muted">Intenta con otra búsqueda o agrega una nueva categoría</p>
          <button class="btn btn-primary mt-2" @click="abrirModal()">
            <i class="fas fa-plus me-2"></i>Agregar Categoría
          </button>
        </div>

        <!-- Table view -->
        <div class="table-responsive" v-if="categoriasFiltradas.length > 0 && (vistaActual === 'tabla' || windowWidth >= 768)">
          <table class="table table-hover align-middle mb-0">
            <thead class="bg-light">
              <tr class="text-center">
                <th class="px-3">
                  <div class="d-flex align-items-center">
                    <span>ID</span>
                    <button class="btn btn-sm text-primary border-0 p-0 ms-1" @click="ordenarPor('id')">
                      <i class="fas" :class="getIconoOrdenamiento('id')"></i>
                    </button>
                  </div>
                </th>
                <th class="px-3">
                  <div class="d-flex align-items-center">
                    <span>Nombre</span>
                    <button class="btn btn-sm text-primary border-0 p-0 ms-1" @click="ordenarPor('nombre')">
                      <i class="fas" :class="getIconoOrdenamiento('nombre')"></i>
                    </button>
                  </div>
                </th>
                <th class="px-3">Título</th>
                <th class="px-3">Subtítulo</th>
                <th class="px-3">
                  <div class="d-flex align-items-center justify-content-center">
                    <span>Productos</span>
                    <button class="btn btn-sm text-primary border-0 p-0 ms-1" @click="ordenarPor('productos')">
                      <i class="fas" :class="getIconoOrdenamiento('productos')"></i>
                    </button>
                  </div>
                </th>
                <th class="px-3">Estado</th>
                <th class="px-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in categoriasFiltradas" :key="item.id" class="text-center">
                <td>{{ item.id }}</td>
                <td>
                  <div class="d-flex align-items-center">
                    <div class="category-image me-2">
                      <img :src="item.banner" alt="Banner" class="img-thumbnail" style="width: 40px; height: 40px; object-fit: cover;">
                    </div>
                    <span>{{ item.nombre }}</span>
                  </div>
                </td>
                <td>{{ item.titulo }}</td>
                <td>{{ item.subtitulo }}</td>
                <td>
                  <span class="badge bg-info text-dark">{{ item.productos?.length || 0 }}</span>
                </td>
                <td>
                  <span class="badge" :class="item.estado ? 'bg-success' : 'bg-danger'">
                    {{ item.estado ? 'Activo' : 'Inactivo' }}
                  </span>
                </td>
                <td>
                  <div class="btn-group">
                    <button class="btn btn-sm btn-outline-primary" @click="mostrarCategoria(item.id)" title="Editar">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm" :class="item.estado ? 'btn-outline-danger' : 'btn-outline-success'"
                      @click="cambiarEstado(item.id)" :title="item.estado ? 'Desactivar' : 'Activar'">
                      <i class="fas" :class="item.estado ? 'fa-toggle-off' : 'fa-toggle-on'"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-info" @click="verDetalles(item)" title="Ver detalles">
                      <i class="fas fa-info-circle"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Cards view -->
        <div v-if="categoriasFiltradas.length > 0 && (vistaActual === 'tarjetas' || windowWidth < 768)">
          <div class="row g-3 p-3">
            <div class="col-md-6 col-lg-4" v-for="item in categoriasFiltradas" :key="item.id">
              <div class="card h-100 border-0 shadow-sm hover-card">
                <div class="position-relative">
                  <img :src="item.banner" class="card-img-top" alt="Banner" style="height: 140px; object-fit: cover;">
                  <div class="position-absolute top-0 end-0 m-2">
                    <span class="badge" :class="item.estado ? 'bg-success' : 'bg-danger'">
                      {{ item.estado ? 'Activo' : 'Inactivo' }}
                    </span>
                  </div>
                </div>
                <div class="card-body">
                  <h5 class="card-title">{{ item.nombre }}</h5>
                  <h6 class="card-subtitle mb-2 text-muted">{{ item.titulo }}</h6>
                  <p class="card-text small">{{ item.subtitulo }}</p>
                  <div class="d-flex justify-content-between align-items-center">
                    <span class="badge bg-light text-dark">
                      <i class="fas fa-box me-1"></i>{{ item.productos?.length || 0 }} productos
                    </span>
                    <span class="text-muted small">ID: {{ item.id }}</span>
                  </div>
                </div>
                <div class="card-footer bg-white border-top-0">
                  <div class="d-flex justify-content-between">
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
      </div>
    </div>

    <!-- Modal para agregar/editar categoría -->
    <div class="modal fade" id="categoriaModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header" :class="posicion ? 'bg-warning bg-opacity-10' : 'bg-primary bg-opacity-10'">
            <h5 class="modal-title">
              <i class="fas" :class="posicion ? 'fa-edit me-2' : 'fa-plus-circle me-2'"></i>
              {{ posicion ? 'Editar Categoría' : 'Nueva Categoría' }}
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <!-- Alerta de campos requeridos -->
            <div class="alert alert-info mb-4" role="alert">
              <div class="d-flex">
                <div class="me-3">
                  <i class="fas fa-info-circle fa-2x"></i>
                </div>
                <div>
                  <h5 class="alert-heading">Información importante</h5>
                  <p class="mb-0">Los campos marcados con <span class="text-danger fw-bold">*</span> son obligatorios.</p>
                </div>
              </div>
            </div>

            <form @submit.prevent="guardarCategoria" id="categoriaForm" class="needs-validation" novalidate>
              <div class="row g-3">
                <!-- Información básica -->
                <div class="col-12">
                  <div class="card border-0 bg-light">
                    <div class="card-header bg-primary bg-opacity-10">
                      <h5 class="mb-0">
                        <i class="fas fa-info-circle me-2"></i>Información básica
                      </h5>
                    </div>
                    <div class="card-body">
                      <div class="row g-3">
                        <div class="col-md-6">
                          <label for="nombre" class="form-label fw-bold">Nombre <span class="text-danger">*</span></label>
                          <div class="input-group">
                            <span class="input-group-text"><i class="fas fa-tag"></i></span>
                            <input 
                              type="text" 
                              class="form-control" 
                              :class="{ 'is-invalid': errors.nombre }" 
                              id="nombre"
                              v-model="formulario.nombre" 
                              placeholder="Ej: Motocicletas"
                              required
                            >
                            <div class="invalid-feedback" v-if="errors.nombre">
                              {{ errors.nombre[0] }}
                            </div>
                            <div class="invalid-feedback" v-else>
                              El nombre de la categoría es obligatorio
                            </div>
                          </div>
                          <small class="text-muted">Nombre principal de la categoría</small>
                        </div>
                        <div class="col-md-6">
                          <label for="catalogo" class="form-label fw-bold">Catálogo <span class="text-danger">*</span></label>
                          <div class="input-group">
                            <span class="input-group-text"><i class="fas fa-book"></i></span>
                            <select 
                              class="form-select" 
                              id="catalogo" 
                              v-model="formulario.catalogo_id"
                              :class="{ 'is-invalid': errors.catalogo_id }"
                              required
                            >
                              <option value="">Seleccione un catálogo</option>
                              <option :value="item.id" v-for="item in catalogos" :key="item.id">
                                {{ item.nombre }}
                              </option>
                            </select>
                            <div class="invalid-feedback" v-if="errors.catalogo_id">
                              {{ errors.catalogo_id[0] }}
                            </div>
                            <div class="invalid-feedback" v-else>
                              Debe seleccionar un catálogo
                            </div>
                          </div>
                          <small class="text-muted">Catálogo al que pertenecerá esta categoría</small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Presentación -->
                <div class="col-12">
                  <div class="card border-0 bg-light">
                    <div class="card-header bg-primary bg-opacity-10">
                      <h5 class="mb-0">
                        <i class="fas fa-paint-brush me-2"></i>Presentación
                      </h5>
                    </div>
                    <div class="card-body">
                      <div class="row g-3">
                        <div class="col-md-6">
                          <label for="titulo" class="form-label fw-bold">Título <span class="text-danger">*</span></label>
                          <div class="input-group">
                            <span class="input-group-text"><i class="fas fa-heading"></i></span>
                            <input 
                              type="text" 
                              class="form-control" 
                              :class="{ 'is-invalid': errors.titulo }" 
                              id="titulo"
                              v-model="formulario.titulo" 
                              placeholder="Ej: Movilidad Inteligente"
                              required
                            >
                            <div class="invalid-feedback" v-if="errors.titulo">
                              {{ errors.titulo[0] }}
                            </div>
                            <div class="invalid-feedback" v-else>
                              El título es obligatorio
                            </div>
                          </div>
                          <small class="text-muted">Título principal que se mostrará en la página</small>
                        </div>
                        <div class="col-md-6">
                          <label for="subtitulo" class="form-label fw-bold">Subtítulo <span class="text-danger">*</span></label>
                          <div class="input-group">
                            <span class="input-group-text"><i class="fas fa-align-left"></i></span>
                            <input 
                              type="text" 
                              class="form-control" 
                              :class="{ 'is-invalid': errors.subtitulo }" 
                              id="subtitulo"
                              v-model="formulario.subtitulo" 
                              placeholder="Ej: Velocidad, diseño y tecnología en cada modelo"
                              required
                            >
                            <div class="invalid-feedback" v-if="errors.subtitulo">
                              {{ errors.subtitulo[0] }}
                            </div>
                            <div class="invalid-feedback" v-else>
                              El subtítulo es obligatorio
                            </div>
                          </div>
                          <small class="text-muted">Texto complementario que aparecerá debajo del título</small>
                        </div>
                        <div class="col-12">
                          <label for="descripcion" class="form-label fw-bold">Descripción</label>
                          <div class="input-group">
                            <span class="input-group-text"><i class="fas fa-align-justify"></i></span>
                            <textarea 
                              class="form-control" 
                              id="descripcion" 
                              v-model="formulario.descripcion" 
                              rows="3"
                              placeholder="Describa la categoría..."
                            ></textarea>
                          </div>
                          <small class="text-muted">Descripción detallada de la categoría (opcional)</small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Imagen banner -->
                <div class="col-12">
                  <div class="card border-0 bg-light">
                    <div class="card-header bg-primary bg-opacity-10">
                      <h5 class="mb-0">
                        <i class="fas fa-image me-2"></i>Imagen Banner
                      </h5>
                    </div>
                    <div class="card-body">
                      <div class="row">
                        <div class="col-md-8">
                          <label for="banner" class="form-label fw-bold">Seleccionar imagen <span v-if="!posicion" class="text-danger">*</span></label>
                          <div class="input-group mb-3">
                            <span class="input-group-text"><i class="fas fa-upload"></i></span>
                            <input 
                              type="file" 
                              class="form-control" 
                              :class="{ 'is-invalid': errors.banner }" 
                              id="banner"
                              @change="obtenerImagen($event)"
                              accept="image/*"
                              :required="!posicion"
                            >
                            <div class="invalid-feedback" v-if="errors.banner">
                              {{ errors.banner[0] }}
                            </div>
                            <div class="invalid-feedback" v-else>
                              La imagen banner es obligatoria
                            </div>
                          </div>
                          <small class="text-muted">Formatos recomendados: JPG, PNG, WEBP. Tamaño máximo: 2MB</small>
                          <div class="form-text mt-2">
                            <i class="fas fa-info-circle me-1"></i>
                            Esta imagen se mostrará como banner principal de la categoría
                          </div>
                        </div>
                        <div class="col-md-4 text-center">
                          <div v-if="imagenPreview" class="border p-2 rounded bg-white">
                            <img :src="imagenPreview" alt="Vista previa" class="img-fluid" style="max-height: 150px;">
                          </div>
                          <div v-else class="border p-2 rounded bg-white d-flex align-items-center justify-content-center" style="height: 150px;">
                            <span class="text-muted">Vista previa no disponible</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <div class="d-flex justify-content-between w-100">
              <div>
                <span v-if="Object.keys(errors).length > 0" class="text-danger">
                  <i class="fas fa-exclamation-circle me-1"></i>
                  Por favor, corrija los errores en el formulario
                </span>
              </div>
              <div>
                <button type="button" class="btn btn-secondary me-2" data-bs-dismiss="modal">
                  <i class="fas fa-times me-1"></i>Cancelar
                </button>
                <button 
                  type="button" 
                  class="btn" 
                  :class="posicion ? 'btn-warning' : 'btn-primary'"
                  @click="validarYGuardar"
                >
                  <i class="fas" :class="posicion ? 'fa-save me-1' : 'fa-plus me-1'"></i>
                  {{ posicion ? 'Actualizar' : 'Guardar' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de detalles de la categoría -->
    <div class="modal fade" id="detallesModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header bg-info bg-opacity-10">
            <h5 class="modal-title">
              <i class="fas fa-info-circle me-2"></i>Detalles de la Categoría
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body" v-if="categoriaSeleccionada">
            <div class="row">
              <div class="col-md-6">
                <div class="card border-0 shadow-sm mb-3">
                  <img :src="categoriaSeleccionada.banner" alt="Banner" class="card-img-top rounded-top" style="height: 200px; object-fit: cover;">
                  <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                      <h4 class="card-title mb-0">{{ categoriaSeleccionada.nombre }}</h4>
                      <span class="badge" :class="categoriaSeleccionada.estado ? 'bg-success' : 'bg-danger'">
                        {{ categoriaSeleccionada.estado ? 'Activo' : 'Inactivo' }}
                      </span>
                    </div>
                    <h6 class="text-muted">{{ categoriaSeleccionada.titulo }}</h6>
                    <p class="card-text">{{ categoriaSeleccionada.subtitulo }}</p>
                  </div>
                </div>
              </div>
              <div class="col-md-6">
                <div class="card border-0 shadow-sm mb-3">
                  <div class="card-header bg-light">
                    <h5 class="mb-0">
                      <i class="fas fa-clipboard-list me-2"></i>Información
                    </h5>
                  </div>
                  <div class="card-body">
                    <ul class="list-group list-group-flush">
                      <li class="list-group-item d-flex justify-content-between align-items-center">
                        <span><i class="fas fa-id-card me-2"></i>ID:</span>
                        <span class="badge bg-secondary">{{ categoriaSeleccionada.id }}</span>
                      </li>
                      <li class="list-group-item d-flex justify-content-between align-items-center">
                        <span><i class="fas fa-book me-2"></i>Catálogo:</span>
                        <span>{{ categoriaSeleccionada.catalogo?.nombre || 'N/A' }}</span>
                      </li>
                      <li class="list-group-item d-flex justify-content-between align-items-center">
                        <span><i class="fas fa-box me-2"></i>Productos:</span>
                        <span class="badge bg-info text-dark">{{ categoriaSeleccionada.productos?.length || 0 }}</span>
                      </li>
                      <li class="list-group-item d-flex justify-content-between align-items-center">
                        <span><i class="fas fa-calendar-alt me-2"></i>Creado:</span>
                        <span>{{ formatearFecha(categoriaSeleccionada.created_at) }}</span>
                      </li>
                      <li class="list-group-item d-flex justify-content-between align-items-center">
                        <span><i class="fas fa-edit me-2"></i>Actualizado:</span>
                        <span>{{ formatearFecha(categoriaSeleccionada.updated_at) }}</span>
                      </li>
                    </ul>
                  </div>
                </div>
                <div class="card border-0 shadow-sm">
                  <div class="card-header bg-light">
                    <h5 class="mb-0">
                      <i class="fas fa-align-left me-2"></i>Descripción
                    </h5>
                  </div>
                  <div class="card-body">
                    <p v-if="categoriaSeleccionada.descripcion">{{ categoriaSeleccionada.descripcion }}</p>
                    <p v-else class="text-muted">No hay descripción disponible</p>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Productos -->
            <div class="card border-0 shadow-sm mt-4">
              <div class="card-header bg-light d-flex justify-content-between align-items-center">
                <h5 class="mb-0">
                  <i class="fas fa-box me-2"></i>Productos
                </h5>
                <span class="badge bg-info text-dark">{{ categoriaSeleccionada.productos?.length || 0 }} productos</span>
              </div>
              <div class="card-body">
                <div v-if="categoriaSeleccionada.productos && categoriaSeleccionada.productos.length > 0">
                  <div class="table-responsive">
                    <table class="table table-hover">
                      <thead class="table-light">
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
                <div v-else class="text-center py-4">
                  <i class="fas fa-box-open fa-3x text-muted mb-3"></i>
                  <h5 class="text-muted">No hay productos en esta categoría</h5>
                  <p class="text-muted">Esta categoría aún no tiene productos asociados</p>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
              <i class="fas fa-times me-1"></i>Cerrar
            </button>
            <button type="button" class="btn btn-primary" @click="mostrarCategoria(categoriaSeleccionada.id)" v-if="categoriaSeleccionada">
              <i class="fas fa-edit me-1"></i>Editar
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
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
const formValidado = ref(false);
const vistaActual = ref('tabla');
const windowWidth = ref(window.innerWidth);
const ordenamiento = ref({
  campo: 'id',
  direccion: 'asc'
});

let categoriaModal = null;
let detallesModal = null;

// Actualizar el ancho de la ventana cuando cambia el tamaño
const actualizarAnchoPantalla = () => {
  windowWidth.value = window.innerWidth;
};

onMounted(() => {
  categoriaModal = new Modal(document.getElementById('categoriaModal'));
  detallesModal = new Modal(document.getElementById('detallesModal'));
  listarCategorias();
  mostrarCatalogos();
  
  // Agregar event listener para el cambio de tamaño de ventana
  window.addEventListener('resize', actualizarAnchoPantalla);
});

onUnmounted(() => {
  // Eliminar event listener cuando el componente se desmonta
  window.removeEventListener('resize', actualizarAnchoPantalla);
});

const categoriasFiltradas = computed(() => {
  // Primero filtrar por búsqueda
  let resultado = categorias.value;
  
  if (search.value) {
    resultado = resultado.filter(categoria =>
      categoria.nombre.toLowerCase().includes(search.value.toLowerCase()) ||
      categoria.titulo.toLowerCase().includes(search.value.toLowerCase()) ||
      categoria.subtitulo.toLowerCase().includes(search.value.toLowerCase())
    );
  }
  
  // Luego ordenar según el campo y dirección seleccionados
  return resultado.sort((a, b) => {
    let valorA, valorB;
    
    if (ordenamiento.value.campo === 'productos') {
      valorA = a.productos?.length || 0;
      valorB = b.productos?.length || 0;
    } else {
      valorA = a[ordenamiento.value.campo];
      valorB = b[ordenamiento.value.campo];
    }
    
    // Ordenar strings
    if (typeof valorA === 'string') {
      if (ordenamiento.value.direccion === 'asc') {
        return valorA.localeCompare(valorB);
      } else {
        return valorB.localeCompare(valorA);
      }
    }
    
    // Ordenar números
    if (ordenamiento.value.direccion === 'asc') {
      return valorA - valorB;
    } else {
      return valorB - valorA;
    }
  });
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
  formValidado.value = false;
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

const validarFormulario = () => {
  // Validar campos requeridos
  const form = document.getElementById('categoriaForm');
  formValidado.value = true;
  
  if (!form.checkValidity()) {
    form.classList.add('was-validated');
    return false;
  }
  
  // Validaciones adicionales
  let esValido = true;
  errors.value = {};
  
  if (!formulario.value.nombre) {
    errors.value.nombre = ['El campo nombre es obligatorio.'];
    esValido = false;
  }
  
  if (!formulario.value.titulo) {
    errors.value.titulo = ['El campo título es obligatorio.'];
    esValido = false;
  }
  
  if (!formulario.value.subtitulo) {
    errors.value.subtitulo = ['El campo subtítulo es obligatorio.'];
    esValido = false;
  }
  
  if (!formulario.value.catalogo_id) {
    errors.value.catalogo_id = ['Debe seleccionar un catálogo.'];
    esValido = false;
  }
  
  // Solo validar banner si es un nuevo registro
  if (!posicion.value && !formulario.value.banner) {
    errors.value.banner = ['La imagen banner es obligatoria.'];
    esValido = false;
  }
  
  return esValido;
};

const validarYGuardar = () => {
  if (validarFormulario()) {
    guardarCategoria();
  } else {
    // Scroll al primer error
    setTimeout(() => {
      const primerError = document.querySelector('.is-invalid');
      if (primerError) {
        primerError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  }
};

const guardarCategoria = async () => {
  try {
    const formData = new FormData();
    Object.keys(formulario.value).forEach(key => {
      if (formulario.value[key] !== '') {
        formData.append(key, formulario.value[key]);
      }
    });

    if (posicion.value) {
      formData.append('_method', 'PUT');
      await updateCategoria(posicion.value, formData);
    } else {
      await storeCategoria(formData);
    }
    await listarCategorias();
    categoriaModal.hide();
    
    // Mostrar mensaje de éxito
    alert(posicion.value ? 'Categoría actualizada correctamente' : 'Categoría creada correctamente');
  } catch (error) {
    if (error.response && error.response.status === 422) {
      errors.value = error.response.data.errors;
      
      // Scroll al primer error
      setTimeout(() => {
        const primerError = document.querySelector('.is-invalid');
        if (primerError) {
          primerError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    } else {
      console.error('Error al guardar categoría:', error);
      alert('Error al guardar la categoría. Intente nuevamente.');
    }
  }
};

const cambiarEstado = async (id) => {
  try {
    await destroyCategoria(id);
    await listarCategorias();
  } catch (error) {
    console.error('Error al cambiar estado de la categoría:', error);
    alert('Error al cambiar el estado de la categoría. Intente nuevamente.');
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
      catalogo_id: data.dato.catalogo_id,
      banner: ''
    };
    imagenPreview.value = data.dato.banner;
    posicion.value = id;
    errors.value = {};
    formValidado.value = false;
    
    // Si el modal de detalles está abierto, cerrarlo
    if (detallesModal._isShown) {
      detallesModal.hide();
    }
    
    // Mostrar el modal de edición
    categoriaModal.show();
  } catch (error) {
    console.error('Error al obtener categoría:', error);
    alert('Error al cargar la categoría. Intente nuevamente.');
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

const ordenarPor = (campo) => {
  if (ordenamiento.value.campo === campo) {
    // Si ya estamos ordenando por este campo, cambiar la dirección
    ordenamiento.value.direccion = ordenamiento.value.direccion === 'asc' ? 'desc' : 'asc';
  } else {
    // Si es un nuevo campo, establecer como ascendente por defecto
    ordenamiento.value.campo = campo;
    ordenamiento.value.direccion = 'asc';
  }
};

const getIconoOrdenamiento = (campo) => {
  if (ordenamiento.value.campo !== campo) {
    return 'fa-sort';
  }
  return ordenamiento.value.direccion === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
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
      catalogo: {
        id: 1,
        nombre: 'Vehículos Eléctricos',
        descripcion: 'Catálogo de vehículos eléctricos',
        orden: 1,
        estado: 1
      },
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

.hover-card {
  transition: all 0.3s ease;
}

.hover-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
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

/* Estilos para mejorar la UI */
.form-label {
  font-size: 0.9rem;
}

.input-group-text {
  background-color: #f8f9fa;
}

.card-header {
  padding: 0.75rem 1rem;
}

.form-control:focus,
.form-select:focus {
  border-color: #86b7fe;
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}

/* Animaciones */
.btn {
  transition: all 0.2s ease-in-out;
}

.btn:hover {
  transform: translateY(-1px);
}

/* Validación de formulario */
.was-validated .form-control:invalid,
.form-control.is-invalid {
  border-color: #dc3545;
  padding-right: calc(1.5em + 0.75rem);
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12' width='12' height='12' fill='none' stroke='%23dc3545'%3e%3ccircle cx='6' cy='6' r='4.5'/%3e%3cpath stroke-linejoin='round' d='M5.8 3.6h.4L6 6.5z'/%3e%3ccircle cx='6' cy='8.2' r='.6' fill='%23dc3545' stroke='none'/%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right calc(0.375em + 0.1875rem) center;
  background-size: calc(0.75em + 0.375rem) calc(0.75em + 0.375rem);
}

/* Estilos para la vista de tarjetas */
.category-image {
  width: 40px;
  height: 40px;
  overflow: hidden;
  border-radius: 4px;
}

.category-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>