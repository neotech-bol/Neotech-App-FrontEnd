<template>
  <div class="container-fluid py-4">
    <div class="card shadow">
      <div
        class="card-header bg-primary bg-opacity-10 d-flex justify-content-between align-items-center flex-wrap gap-3 p-3">
        <h2 class="card-title h4 m-0">
          <i class="fas fa-book me-2"></i>Gestión de Catálogos
        </h2>
        <div>
          <button class="btn btn-primary" @click="abrirModal()">
            <i class="fas fa-plus me-2"></i>Agregar Catálogo
          </button>
          <button class="btn btn-outline-secondary ms-2" @click="exportarCatalogos()">
            <i class="fas fa-download me-2"></i>Exportar
          </button>
        </div>
      </div>
      <div class="card-body p-0">
        <div class="p-3">
          <div class="input-group mb-3">
            <span class="input-group-text bg-light">
              <i class="fas fa-search"></i>
            </span>
            <input type="text" class="form-control" placeholder="Buscar por nombre o descripción..." v-model="search"
              @input="filtrarCatalogos">
            <button class="btn btn-outline-secondary" type="button" @click="search = ''" v-if="search">
              <i class="fas fa-times"></i>
            </button>
          </div>
          
          <!-- Contador de resultados -->
          <div class="d-flex justify-content-between align-items-center mb-3">
            <p class="text-muted mb-0">
              <i class="fas fa-list-ul me-1"></i>
              Mostrando {{ catalogosFiltrados.length }} de {{ datos.length }} catálogos
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
        <div v-if="catalogosFiltrados.length === 0" class="text-center py-5">
          <i class="fas fa-book-open fa-3x text-muted mb-3"></i>
          <h5 class="text-muted">No se encontraron catálogos</h5>
          <p class="text-muted">Intenta con otra búsqueda o agrega un nuevo catálogo</p>
          <button class="btn btn-primary mt-2" @click="abrirModal()">
            <i class="fas fa-plus me-2"></i>Agregar Catálogo
          </button>
        </div>

        <!-- Table view -->
        <div class="table-responsive" v-if="catalogosFiltrados.length > 0 && (vistaActual === 'tabla' || windowWidth >= 768)">
          <table class="table table-hover align-middle mb-0">
            <thead class="bg-light">
              <tr>
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
                <th class="px-3">Descripción</th>
                <th class="px-3">
                  <div class="d-flex align-items-center">
                    <span>Categorías</span>
                    <button class="btn btn-sm text-primary border-0 p-0 ms-1" @click="ordenarPor('categorias')">
                      <i class="fas" :class="getIconoOrdenamiento('categorias')"></i>
                    </button>
                  </div>
                </th>
                <th class="px-3">
                  <div class="d-flex align-items-center">
                    <span>Orden</span>
                    <button class="btn btn-sm text-primary border-0 p-0 ms-1" @click="ordenarPor('orden')">
                      <i class="fas" :class="getIconoOrdenamiento('orden')"></i>
                    </button>
                  </div>
                </th>
                <th class="px-3">Estado</th>
                <th class="px-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in catalogosFiltrados" :key="item.id">
                <td>{{ item.id }}</td>
                <td>
                  <div class="d-flex align-items-center">
                    <div class="catalog-icon me-2">
                      <i class="fas fa-book text-primary"></i>
                    </div>
                    <span class="fw-medium">{{ item.nombre }}</span>
                  </div>
                </td>
                <td>
                  <span v-if="item.descripcion">{{ truncateText(item.descripcion, 50) }}</span>
                  <span v-else class="text-muted fst-italic">Sin descripción</span>
                </td>
                <td>
                  <span class="badge bg-info text-dark">{{ item.categorias?.length || 0 }}</span>
                </td>
                <td>
                  <span class="badge bg-secondary">{{ item.orden }}</span>
                </td>
                <td>
                  <span class="badge" :class="item.estado ? 'bg-success' : 'bg-danger'">
                    {{ item.estado ? 'Activo' : 'Inactivo' }}
                  </span>
                </td>
                <td>
                  <div class="btn-group">
                    <button class="btn btn-sm btn-outline-primary" @click="mostrarCatalogo(item.id)" title="Editar">
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
        <div v-if="catalogosFiltrados.length > 0 && (vistaActual === 'tarjetas' || windowWidth < 768)">
          <div class="row g-3 p-3">
            <div class="col-md-6 col-lg-4" v-for="item in catalogosFiltrados" :key="item.id">
              <div class="card h-100 border-0 shadow-sm hover-card">
                <div class="card-header bg-light d-flex justify-content-between align-items-center">
                  <h5 class="card-title mb-0">
                    <i class="fas fa-book text-primary me-2"></i>{{ item.nombre }}
                  </h5>
                  <span class="badge" :class="item.estado ? 'bg-success' : 'bg-danger'">
                    {{ item.estado ? 'Activo' : 'Inactivo' }}
                  </span>
                </div>
                <div class="card-body">
                  <div class="mb-3">
                    <p class="card-text" v-if="item.descripcion">{{ item.descripcion }}</p>
                    <p class="card-text text-muted fst-italic" v-else>Sin descripción</p>
                  </div>
                  <div class="d-flex justify-content-between align-items-center mb-2">
                    <div>
                      <span class="badge bg-info text-dark me-2">
                        <i class="fas fa-folder me-1"></i>{{ item.categorias?.length || 0 }} categorías
                      </span>
                    </div>
                    <div>
                      <span class="badge bg-secondary">
                        <i class="fas fa-sort-numeric-down me-1"></i>Orden: {{ item.orden }}
                      </span>
                    </div>
                  </div>
                  <div class="text-muted small">
                    <div>ID: {{ item.id }}</div>
                    <div>Creado: {{ formatearFecha(item.created_at) }}</div>
                  </div>
                </div>
                <div class="card-footer bg-white border-top-0">
                  <div class="d-flex justify-content-between">
                    <button class="btn btn-sm btn-outline-primary" @click="mostrarCatalogo(item.id)">
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

    <!-- Modal para agregar/editar catálogo -->
    <div class="modal fade" id="catalogoModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header" :class="posicion ? 'bg-warning bg-opacity-10' : 'bg-primary bg-opacity-10'">
            <h5 class="modal-title">
              <i class="fas" :class="posicion ? 'fa-edit me-2' : 'fa-plus-circle me-2'"></i>
              {{ posicion ? 'Editar Catálogo' : 'Nuevo Catálogo' }}
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

            <form @submit.prevent="guardarCatalogo" id="catalogoForm" class="needs-validation" novalidate>
              <div class="mb-4">
                <label for="nombre" class="form-label fw-bold">Nombre <span class="text-danger">*</span></label>
                <div class="input-group">
                  <span class="input-group-text"><i class="fas fa-tag"></i></span>
                  <input 
                    type="text" 
                    class="form-control" 
                    :class="{ 'is-invalid': errors.nombre }" 
                    id="nombre"
                    v-model="formulario.nombre" 
                    placeholder="Ej: Vehículos Eléctricos"
                    required
                  >
                  <div class="invalid-feedback" v-if="errors.nombre">
                    {{ errors.nombre[0] }}
                  </div>
                  <div class="invalid-feedback" v-else>
                    El nombre del catálogo es obligatorio
                  </div>
                </div>
                <small class="text-muted">Nombre principal que identificará al catálogo</small>
              </div>
              
              <div class="mb-4">
                <label for="descripcion" class="form-label fw-bold">Descripción</label>
                <div class="input-group">
                  <span class="input-group-text"><i class="fas fa-align-left"></i></span>
                  <textarea 
                    class="form-control" 
                    id="descripcion" 
                    v-model="formulario.descripcion" 
                    rows="3"
                    placeholder="Describa el catálogo..."
                  ></textarea>
                </div>
                <small class="text-muted">Descripción detallada del catálogo (opcional)</small>
              </div>
              
              <div class="mb-4">
                <label for="orden" class="form-label fw-bold">Orden <span class="text-danger">*</span></label>
                <div class="input-group">
                  <span class="input-group-text"><i class="fas fa-sort-numeric-down"></i></span>
                  <input 
                    type="number" 
                    class="form-control" 
                    :class="{ 'is-invalid': errors.orden }" 
                    id="orden" 
                    v-model="formulario.orden"
                    min="1"
                    required
                    placeholder="Ej: 1, 2, 3..."
                  >
                  <div class="invalid-feedback" v-if="errors.orden">
                    {{ errors.orden[0] }}
                  </div>
                  <div class="invalid-feedback" v-else>
                    El orden es obligatorio
                  </div>
                </div>
                <div class="form-text">
                  <i class="fas fa-info-circle me-1"></i>
                  El orden determina la posición en que se mostrará este catálogo (menor número = mayor prioridad).
                </div>
              </div>
              
              <!-- Controles de orden rápido -->
              <div class="mb-4">
                <label class="d-block mb-2 fw-bold">Selección rápida de orden:</label>
                <div class="btn-group w-100">
                  <button 
                    type="button" 
                    v-for="n in 5" 
                    :key="n" 
                    class="btn" 
                    :class="formulario.orden == n ? 'btn-primary' : 'btn-outline-secondary'"
                    @click="formulario.orden = n"
                  >
                    {{ n }}
                  </button>
                </div>
                <div class="mt-2 text-center">
                  <button 
                    type="button" 
                    class="btn btn-sm btn-outline-primary" 
                    @click="sugerirOrdenAutomatico"
                    title="Sugerir orden automáticamente"
                  >
                    <i class="fas fa-magic me-1"></i>Sugerir orden automático
                  </button>
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
                  :disabled="!formularioValido"
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

    <!-- Modal de detalles del catálogo -->
    <div class="modal fade" id="detallesModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header bg-info bg-opacity-10">
            <h5 class="modal-title">
              <i class="fas fa-info-circle me-2"></i>Detalles del Catálogo
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body" v-if="catalogoSeleccionado">
            <div class="row">
              <div class="col-md-6">
                <div class="card border-0 shadow-sm mb-3">
                  <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                      <h4 class="card-title mb-0">{{ catalogoSeleccionado.nombre }}</h4>
                      <span class="badge" :class="catalogoSeleccionado.estado ? 'bg-success' : 'bg-danger'">
                        {{ catalogoSeleccionado.estado ? 'Activo' : 'Inactivo' }}
                      </span>
                    </div>
                    <p class="card-text" v-if="catalogoSeleccionado.descripcion">{{ catalogoSeleccionado.descripcion }}</p>
                    <p class="card-text text-muted fst-italic" v-else>Sin descripción</p>
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
                        <span class="badge bg-secondary">{{ catalogoSeleccionado.id }}</span>
                      </li>
                      <li class="list-group-item d-flex justify-content-between align-items-center">
                        <span><i class="fas fa-sort-numeric-down me-2"></i>Orden:</span>
                        <span class="badge bg-primary">{{ catalogoSeleccionado.orden }}</span>
                      </li>
                      <li class="list-group-item d-flex justify-content-between align-items-center">
                        <span><i class="fas fa-folder me-2"></i>Categorías:</span>
                        <span class="badge bg-info text-dark">{{ catalogoSeleccionado.categorias?.length || 0 }}</span>
                      </li>
                      <li class="list-group-item d-flex justify-content-between align-items-center">
                        <span><i class="fas fa-calendar-alt me-2"></i>Creado:</span>
                        <span>{{ formatearFecha(catalogoSeleccionado.created_at) }}</span>
                      </li>
                      <li class="list-group-item d-flex justify-content-between align-items-center">
                        <span><i class="fas fa-edit me-2"></i>Actualizado:</span>
                        <span>{{ formatearFecha(catalogoSeleccionado.updated_at) }}</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Categorías -->
            <div class="card border-0 shadow-sm mt-4">
              <div class="card-header bg-light d-flex justify-content-between align-items-center">
                <h5 class="mb-0">
                  <i class="fas fa-folder me-2"></i>Categorías
                </h5>
                <span class="badge bg-info text-dark">{{ catalogoSeleccionado.categorias?.length || 0 }} categorías</span>
              </div>
              <div class="card-body">
                <div v-if="catalogoSeleccionado.categorias && catalogoSeleccionado.categorias.length > 0">
                  <div class="row g-3">
                    <div class="col-md-6" v-for="categoria in catalogoSeleccionado.categorias" :key="categoria.id">
                      <div class="card border h-100">
                        <div class="card-header bg-light">
                          <h6 class="card-title mb-0">{{ categoria.nombre }}</h6>
                        </div>
                        <div class="card-body">
                          <h6 class="text-primary">{{ categoria.titulo }}</h6>
                          <p class="text-muted small">{{ categoria.subtitulo }}</p>
                          <p class="small" v-if="categoria.descripcion">{{ categoria.descripcion }}</p>
                          <p class="small text-muted fst-italic" v-else>Sin descripción</p>
                          <div class="d-flex justify-content-between align-items-center">
                            <span class="badge bg-light text-dark">
                              <i class="fas fa-box me-1"></i>{{ categoria.productos?.length || 0 }} productos
                            </span>
                            <span class="badge" :class="categoria.estado ? 'bg-success' : 'bg-danger'">
                              {{ categoria.estado ? 'Activo' : 'Inactivo' }}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div v-else class="text-center py-4">
                  <i class="fas fa-folder-open fa-3x text-muted mb-3"></i>
                  <h5 class="text-muted">No hay categorías en este catálogo</h5>
                  <p class="text-muted">Este catálogo aún no tiene categorías asociadas</p>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
              <i class="fas fa-times me-1"></i>Cerrar
            </button>
            <button type="button" class="btn btn-primary" @click="mostrarCatalogo(catalogoSeleccionado.id)" v-if="catalogoSeleccionado">
              <i class="fas fa-edit me-1"></i>Editar
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { Modal } from 'bootstrap/dist/js/bootstrap.bundle.min';
import { destroyCatalogo, indexCatalogos, showCatalogo, storeCatalogo, updateCatalogo } from '@/Services/CatalogoService';

const formulario = ref({
  nombre: '',
  descripcion: '',
  orden: '',
});
const errors = ref({});
const datos = ref([]);
const search = ref('');
const posicion = ref('');
const catalogoSeleccionado = ref(null);
const formValidado = ref(false);
const vistaActual = ref('tabla');
const windowWidth = ref(window.innerWidth);
const ordenamiento = ref({
  campo: 'id',
  direccion: 'asc'
});

let catalogoModal = null;
let detallesModal = null;

// Actualizar el ancho de la ventana cuando cambia el tamaño
const actualizarAnchoPantalla = () => {
  windowWidth.value = window.innerWidth;
};

onMounted(() => {
  catalogoModal = new Modal(document.getElementById('catalogoModal'));
  detallesModal = new Modal(document.getElementById('detallesModal'));
  listarCatalogos();
  
  // Agregar event listener para el cambio de tamaño de ventana
  window.addEventListener('resize', actualizarAnchoPantalla);
});

onUnmounted(() => {
  // Eliminar event listener cuando el componente se desmonta
  window.removeEventListener('resize', actualizarAnchoPantalla);
});

// Validar formulario
const formularioValido = computed(() => {
  return !!formulario.value.nombre && !!formulario.value.orden;
});

// Sugerir orden automáticamente
const sugerirOrden = () => {
  if (!formulario.value.orden && datos.value.length > 0) {
    // Encontrar el orden más alto y sugerir el siguiente
    const maxOrden = Math.max(...datos.value.map(item => parseInt(item.orden) || 0));
    formulario.value.orden = maxOrden + 1;
  } else if (!formulario.value.orden) {
    // Si no hay catálogos, sugerir 1
    formulario.value.orden = 1;
  }
};

// Función para sugerir orden automático (botón)
const sugerirOrdenAutomatico = () => {
  sugerirOrden();
};

const catalogosFiltrados = computed(() => {
  // Primero filtrar por búsqueda
  let resultado = datos.value;
  
  if (search.value) {
    resultado = resultado.filter(catalogo =>
      catalogo.nombre.toLowerCase().includes(search.value.toLowerCase()) ||
      (catalogo.descripcion && catalogo.descripcion.toLowerCase().includes(search.value.toLowerCase()))
    );
  }
  
  // Luego ordenar según el campo y dirección seleccionados
  return resultado.sort((a, b) => {
    let valorA, valorB;
    
    if (ordenamiento.value.campo === 'categorias') {
      valorA = a.categorias?.length || 0;
      valorB = b.categorias?.length || 0;
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

const abrirModal = () => {
  formulario.value = {
    nombre: '',
    descripcion: '',
    orden: '',
  };
  errors.value = {};
  posicion.value = '';
  formValidado.value = false;

  // Sugerir orden automáticamente al abrir el modal
  sugerirOrden();

  catalogoModal.show();
};

const listarCatalogos = async () => {
  try {
    const { data } = await indexCatalogos();
    datos.value = data.datos;
  } catch (error) {
    console.error('Error al cargar catálogos:', error);
    mostrarNotificacion('Error al cargar catálogos', 'error');
  }
};

const validarFormulario = () => {
  // Validar campos requeridos
  const form = document.getElementById('catalogoForm');
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
  
  if (!formulario.value.orden) {
    errors.value.orden = ['El campo orden es obligatorio.'];
    esValido = false;
  }
  
  return esValido;
};

const validarYGuardar = () => {
  if (validarFormulario()) {
    guardarCatalogo();
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

const guardarCatalogo = async () => {
  // Validar que el orden esté presente
  if (!formulario.value.orden) {
    errors.value.orden = ['El campo orden es obligatorio.'];
    return;
  }

  errors.value = {};
  try {
    const formData = new FormData();
    formData.append('nombre', formulario.value.nombre);
    if (formulario.value.descripcion) {
      formData.append('descripcion', formulario.value.descripcion);
    }

    // Asegurar que el orden se envíe siempre
    formData.append('orden', formulario.value.orden);

    if (posicion.value) {
      formData.append('_method', 'PUT');
      await updateCatalogo(posicion.value, formData);
      mostrarNotificacion('Catálogo actualizado correctamente', 'success');
    } else {
      await storeCatalogo(formData);
      mostrarNotificacion('Catálogo creado correctamente', 'success');
    }
    await listarCatalogos();
    catalogoModal.hide();
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
      console.error('Error al guardar catálogo:', error);
      mostrarNotificacion('Error al guardar el catálogo', 'error');
    }
  }
};

const mostrarCatalogo = async (id) => {
  try {
    const { data } = await showCatalogo(id);
    formulario.value = {
      nombre: data.dato.nombre,
      descripcion: data.dato.descripcion,
      orden: data.dato.orden,
    };
    posicion.value = id;
    errors.value = {};
    formValidado.value = false;
    
    // Si el modal de detalles está abierto, cerrarlo
    if (detallesModal._isShown) {
      detallesModal.hide();
    }
    
    // Mostrar el modal de edición
    catalogoModal.show();
  } catch (error) {
    console.error('Error al obtener catálogo:', error);
    mostrarNotificacion('Error al cargar el catálogo', 'error');
  }
};

const cambiarEstado = async (id) => {
  try {
    await destroyCatalogo(id);
    await listarCatalogos();
    mostrarNotificacion('Estado del catálogo actualizado correctamente', 'success');
  } catch (error) {
    console.error('Error al cambiar estado del catálogo:', error);
    mostrarNotificacion('Error al cambiar el estado del catálogo', 'error');
  }
};

const verDetalles = (catalogo) => {
  catalogoSeleccionado.value = catalogo;
  detallesModal.show();
};

const formatearFecha = (fecha) => {
  if (!fecha) return 'N/A';
  return new Date(fecha).toLocaleString();
};

const filtrarCatalogos = () => {
  // La función computed 'catalogosFiltrados' se encargará de filtrar automáticamente
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

// Función para truncar texto largo
const truncateText = (text, maxLength) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Función para exportar catálogos
const exportarCatalogos = () => {
  // Crear un objeto con los datos a exportar
  const datosExportar = datos.value.map(catalogo => ({
    ID: catalogo.id,
    Nombre: catalogo.nombre,
    Descripción: catalogo.descripcion || 'N/A',
    Orden: catalogo.orden,
    Categorías: catalogo.categorias?.length || 0,
    Estado: catalogo.estado ? 'Activo' : 'Inactivo',
    'Fecha Creación': formatearFecha(catalogo.created_at),
    'Última Actualización': formatearFecha(catalogo.updated_at)
  }));
  
  // Convertir a CSV
  const headers = Object.keys(datosExportar[0]);
  const csvContent = [
    headers.join(','),
    ...datosExportar.map(row => headers.map(header => JSON.stringify(row[header])).join(','))
  ].join('\n');
  
  // Crear un blob y descargar
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `catalogos_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  mostrarNotificacion('Catálogos exportados correctamente', 'success');
};

// Función para mostrar notificaciones
const mostrarNotificacion = (mensaje, tipo) => {
  // Esta función podría integrarse con un sistema de notificaciones
  // Por ahora, usamos alert para simplificar
  if (tipo === 'error') {
    alert(`❌ ${mensaje}`);
  } else {
    alert(`✅ ${mensaje}`);
  }
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

/* Estilos para el campo de orden */
input[type="number"] {
  -moz-appearance: textfield;
}

input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
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
.catalog-icon {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: rgba(13, 110, 253, 0.1);
}

.fw-medium {
  font-weight: 500;
}
</style>