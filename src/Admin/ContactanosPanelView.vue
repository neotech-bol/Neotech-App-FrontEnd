<template>
  <div class="container-fluid py-2 py-md-4 px-2 px-md-3">
    <div class="card shadow-sm border-0 rounded-3">
      <!-- Header con título y acciones principales -->
      <div class="card-header bg-success bg-opacity-10 d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 p-3 p-md-4 border-0">
        <h2 class="card-title h5 h4-md m-0 d-flex align-items-center">
          <span class="badge bg-success bg-opacity-10 text-success p-2 me-2 rounded-circle">
            <i class="fas fa-address-book"></i>
          </span>
          <span class="d-none d-sm-inline">Gestión de Contactos</span>
          <span class="d-sm-none">Contactos</span>
        </h2>
        <div class="d-flex flex-column flex-sm-row gap-2 w-100 w-md-auto">
          <button type="button" class="btn btn-danger w-100 w-sm-auto" @click="generatePDF()">
            <i class="fas fa-file-pdf me-2"></i>
            <span class="d-none d-sm-inline">Generar PDF</span>
            <span class="d-sm-none">PDF</span>
          </button>
          <button type="button" class="btn btn-success w-100 w-sm-auto" @click="generateExcel()">
            <i class="fas fa-file-excel me-2"></i>
            <span class="d-none d-sm-inline">Generar Excel</span>
            <span class="d-sm-none">Excel</span>
          </button>
        </div>
      </div>

      <!-- Filtros y búsqueda -->
      <div class="card-body p-0">
        <div class="p-3 p-md-4 bg-light border-top border-bottom">
          <div class="input-group shadow-sm mb-3">
            <span class="input-group-text bg-white border-end-0">
              <i class="fas fa-search text-muted"></i>
            </span>
            <input type="text" class="form-control border-start-0 ps-0" 
              placeholder="Buscar por nombre, correo, teléfono..." 
              v-model="searchText">
            <button class="btn btn-outline-secondary border-start-0" type="button" 
              @click="searchText = ''" v-if="searchText">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <!-- Contador de resultados y selector de vista -->
          <div class="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-3">
            <div class="d-flex align-items-center">
              <span class="badge bg-success rounded-pill me-2">{{ filteredContacts.length }}</span>
              <p class="text-muted mb-0 small">
                <span class="d-none d-sm-inline">Mostrando {{ filteredContacts.length }} contactos</span>
                <span class="d-sm-none">Contactos</span>
              </p>
            </div>
            <div class="btn-group shadow-sm w-100 w-sm-auto">
              <button class="btn btn-sm" :class="vistaActual === 'tabla' ? 'btn-success' : 'btn-outline-success'"
                @click="vistaActual = 'tabla'">
                <i class="fas fa-table me-1"></i><span class="d-none d-md-inline">Tabla</span>
              </button>
              <button class="btn btn-sm" :class="vistaActual === 'tarjetas' ? 'btn-success' : 'btn-outline-success'"
                @click="vistaActual = 'tarjetas'">
                <i class="fas fa-th-large me-1"></i><span class="d-none d-md-inline">Tarjetas</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Mensaje cuando no hay resultados -->
        <div v-if="filteredContacts.length === 0" class="text-center py-4 py-md-5 px-3">
          <div class="mb-3">
            <span class="badge bg-light p-3 rounded-circle">
              <i class="fas fa-address-card fa-2x text-muted"></i>
            </span>
          </div>
          <h5 class="text-muted">No se encontraron contactos</h5>
          <p class="text-muted small">Intenta con otra búsqueda o agrega un nuevo contacto</p>
        </div>

        <!-- Table view - Solo en desktop -->
        <div class="d-none d-lg-block" v-if="filteredContacts.length > 0 && vistaActual === 'tabla'">
          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead class="bg-light">
                <tr>
                  <th class="px-3 py-3">
                    <div class="d-flex align-items-center">
                      <span>#</span>
                      <button class="btn btn-sm text-success border-0 p-0 ms-1" @click="ordenarPor('id')">
                        <i class="fas" :class="getIconoOrdenamiento('id')"></i>
                      </button>
                    </div>
                  </th>
                  <th class="px-3 py-3">
                    <div class="d-flex align-items-center">
                      <span>Nombre</span>
                      <button class="btn btn-sm text-success border-0 p-0 ms-1" @click="ordenarPor('nombre_completo')">
                        <i class="fas" :class="getIconoOrdenamiento('nombre_completo')"></i>
                      </button>
                    </div>
                  </th>
                  <th class="px-3 py-3">Correo electrónico</th>
                  <th class="px-3 py-3">Teléfono</th>
                  <th class="px-3 py-3">Mensaje</th>
                  <th class="px-3 py-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in filteredContacts" :key="item.id" class="contact-row">
                  <td class="px-3 py-3">{{ index + 1 }}</td>
                  <td class="px-3 py-3">
                    <div class="d-flex align-items-center">
                      <div class="avatar-circle me-2" :style="{ backgroundColor: getAvatarColor(item.nombre_completo) }">
                        {{ getInitials(item.nombre_completo) }}
                      </div>
                      <div class="text-start">
                        <div class="fw-medium">{{ item.nombre_completo }}</div>
                        <small class="text-muted">Contacto #{{ item.id }}</small>
                      </div>
                    </div>
                  </td>
                  <td class="px-3 py-3">
                    <a :href="`mailto:${item.correo}`" class="text-decoration-none">
                      <i class="fas fa-envelope me-1 text-muted"></i>{{ item.correo }}
                    </a>
                  </td>
                  <td class="px-3 py-3">
                    <a :href="`tel:${item.telefono}`" class="text-decoration-none">
                      <i class="fas fa-phone me-1 text-muted"></i>{{ item.telefono }}
                    </a>
                  </td>
                  <td class="px-3 py-3">
                    <span class="message-preview">{{ truncateMessage(item.mensaje, 50) }}</span>
                    <button v-if="item.mensaje && item.mensaje.length > 50" 
                            class="btn btn-link btn-sm p-0 ms-1" 
                            @click="showFullMessage(item.mensaje)">
                      Ver más
                    </button>
                  </td>
                  <td class="px-3 py-3 text-center">
                    <div class="btn-group shadow-sm">
                      <button type="button" class="btn btn-outline-success btn-sm" @click="showFullMessage(item.mensaje)">
                        <i class="fas fa-eye"></i>
                      </button>
                      <button type="button" class="btn btn-outline-danger btn-sm" @click="confirmDelete(item.id, item.nombre_completo)">
                        <i class="fas fa-trash-alt"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Cards view - Responsive para móviles y tablets -->
        <div v-if="filteredContacts.length > 0 && (vistaActual === 'tarjetas' || windowWidth < 992)">
          <div class="row g-3 g-md-4 p-3 p-md-4">
            <div class="col-12 col-sm-6 col-xl-4" v-for="(item, index) in filteredContacts" :key="item.id">
              <div class="card h-100 border-0 shadow-sm hover-card rounded-3">
                <div class="card-header bg-light d-flex justify-content-between align-items-center p-3 border-0">
                  <div class="d-flex align-items-center min-w-0 flex-grow-1">
                    <div class="avatar-circle me-2 flex-shrink-0" :style="{ backgroundColor: getAvatarColor(item.nombre_completo) }">
                      {{ getInitials(item.nombre_completo) }}
                    </div>
                    <h5 class="card-title mb-0 fw-bold text-truncate">{{ item.nombre_completo }}</h5>
                  </div>
                  <span class="badge bg-light text-dark flex-shrink-0 ms-2">#{{ index + 1 }}</span>
                </div>
                <div class="card-body p-3">
                  <div class="row g-2 small">
                    <div class="col-12">
                      <div class="d-flex justify-content-between align-items-center">
                        <span class="text-muted"><i class="fas fa-envelope me-1"></i>Correo:</span>
                        <a :href="`mailto:${item.correo}`" class="text-decoration-none text-end text-truncate ms-2" style="max-width: 60%;">
                          {{ item.correo }}
                        </a>
                      </div>
                    </div>
                    <div class="col-12">
                      <div class="d-flex justify-content-between align-items-center">
                        <span class="text-muted"><i class="fas fa-phone me-1"></i>Teléfono:</span>
                        <a :href="`tel:${item.telefono}`" class="text-decoration-none text-end text-truncate ms-2" style="max-width: 60%;">
                          {{ item.telefono }}
                        </a>
                      </div>
                    </div>
                    <div class="col-12">
                      <div class="d-flex justify-content-between align-items-center mb-1">
                        <span class="text-muted"><i class="fas fa-comment me-1"></i>Mensaje:</span>
                        <button v-if="item.mensaje && item.mensaje.length > 100" 
                                class="btn btn-link btn-sm p-0" 
                                @click="showFullMessage(item.mensaje)">
                          Ver completo
                        </button>
                      </div>
                      <div class="message-preview small">
                        {{ truncateMessage(item.mensaje, 100) }}
                      </div>
                    </div>
                  </div>
                </div>
                <div class="card-footer bg-white p-3 border-top-0">
                  <div class="d-flex flex-column flex-sm-row gap-2">
                    <button type="button" class="btn btn-sm btn-outline-success flex-fill" @click="showFullMessage(item.mensaje)">
                      <i class="fas fa-eye me-1"></i>Ver mensaje
                    </button>
                    <button type="button" class="btn btn-sm btn-outline-danger flex-fill" @click="confirmDelete(item.id, item.nombre_completo)">
                      <i class="fas fa-trash-alt me-1"></i>Eliminar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Paginación responsive -->
        <div class="d-flex justify-content-center py-3 py-md-4 px-3" v-if="datos.length > 0">
          <nav aria-label="Navegación de contactos">
            <ul class="pagination pagination-sm shadow-sm mb-0">
              <!-- Primera página - Solo en desktop -->
              <li class="page-item d-none d-md-block" :class="!paginacion.paginaAnterior ? 'disabled' : ''">
                <button type="button" class="page-link" aria-label="Primera" @click="irAPrimeraPagina">
                  <i class="fas fa-angle-double-left"></i>
                </button>
              </li>
              <!-- Página anterior -->
              <li class="page-item" :class="!paginacion.paginaAnterior ? 'disabled' : ''">
                <button type="button" class="page-link" aria-label="Anterior" @click="paginaAnterior">
                  <i class="fas fa-angle-left"></i>
                </button>
              </li>

              <!-- Páginas numeradas - Responsive -->
              <li v-for="pagina in paginasVisibles" :key="pagina" class="page-item" :class="pagina === paginacion.paginaActual ? 'active' : ''">
                <button type="button" class="page-link" @click="irAPagina(pagina)">{{ pagina }}</button>
              </li>

              <!-- Página siguiente -->
              <li class="page-item" :class="!paginacion.paginaSiguiente ? 'disabled' : ''">
                <button type="button" class="page-link" aria-label="Siguiente" @click="paginaSiguiente">
                  <i class="fas fa-angle-right"></i>
                </button>
              </li>
              <!-- Última página - Solo en desktop -->
              <li class="page-item d-none d-md-block" :class="!paginacion.paginaSiguiente ? 'disabled' : ''">
                <button type="button" class="page-link" aria-label="Última" @click="irAUltimaPagina">
                  <i class="fas fa-angle-double-right"></i>
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>

    <!-- Modal para confirmar eliminación -->
    <div class="modal fade" id="deleteModal" tabindex="-1" aria-labelledby="deleteModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered modal-fullscreen-sm-down">
        <div class="modal-content border-0 shadow">
          <div class="modal-header bg-danger bg-opacity-10 p-3 p-md-4">
            <h5 class="modal-title" id="deleteModalLabel">
              <span class="badge bg-danger bg-opacity-10 text-danger p-2 me-2 rounded-circle">
                <i class="fas fa-trash-alt"></i>
              </span>
              <span class="d-none d-sm-inline">Confirmar eliminación</span>
              <span class="d-sm-none">Eliminar</span>
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body p-3 p-md-4">
            <div class="d-flex align-items-center mb-3">
              <div class="avatar-circle me-3" :style="{ backgroundColor: getAvatarColor(contactToDelete.name) }">
                {{ getInitials(contactToDelete.name) }}
              </div>
              <div>
                <h5 class="mb-1">{{ contactToDelete.name }}</h5>
                <p class="text-muted mb-0">ID: {{ contactToDelete.id }}</p>
              </div>
            </div>
            <div class="alert alert-warning rounded-3 shadow-sm">
              <div class="d-flex">
                <div class="me-3">
                  <i class="fas fa-exclamation-triangle fa-2x"></i>
                </div>
                <div>
                  <h5 class="alert-heading">¿Estás seguro?</h5>
                  <p class="mb-0">Esta acción eliminará permanentemente el contacto y no podrá ser recuperado.</p>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer border-0 p-3 p-md-4">
            <div class="d-flex flex-column flex-sm-row justify-content-end w-100 gap-2">
              <button type="button" class="btn btn-outline-secondary w-100 w-sm-auto" data-bs-dismiss="modal">
                <i class="fas fa-times me-2"></i>Cancelar
              </button>
              <button type="button" class="btn btn-danger w-100 w-sm-auto" @click="deleteContact">
                <i class="fas fa-trash-alt me-2"></i>Eliminar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal para ver mensaje completo -->
    <div class="modal fade" id="messageModal" tabindex="-1" aria-labelledby="messageModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered modal-fullscreen-sm-down">
        <div class="modal-content border-0 shadow">
          <div class="modal-header bg-success bg-opacity-10 p-3 p-md-4">
            <h5 class="modal-title" id="messageModalLabel">
              <span class="badge bg-success bg-opacity-10 text-success p-2 me-2 rounded-circle">
                <i class="fas fa-comment"></i>
              </span>
              <span class="d-none d-sm-inline">Mensaje completo</span>
              <span class="d-sm-none">Mensaje</span>
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body p-3 p-md-4">
            <div class="card border-0 bg-light rounded-3 shadow-sm">
              <div class="card-body p-3">
                <p class="mb-0">{{ fullMessage }}</p>
              </div>
            </div>
          </div>
          <div class="modal-footer border-0 p-3 p-md-4">
            <button type="button" class="btn btn-success w-100 w-sm-auto" data-bs-dismiss="modal">
              <i class="fas fa-check me-2"></i>Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast de notificaciones -->
    <div class="position-fixed bottom-0 end-0 p-3" style="z-index: 11">
      <div id="notificationToast" class="toast hide border-0 shadow-lg" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="toast-header" :class="toastConfig.headerClass">
          <i :class="toastConfig.icon + ' me-2'"></i>
          <strong class="me-auto">{{ toastConfig.title }}</strong>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
        <div class="toast-body">
          {{ toastConfig.message }}
        </div>
      </div>
    </div>
  </div>
</template>


<script setup>
import { eliminarContacto, generarExcel, generarPDF, index } from '@/Services/ContactoService';
import { onMounted, ref, computed, onUnmounted } from 'vue';
import { Modal, Toast } from 'bootstrap/dist/js/bootstrap.bundle.min';

// Estado
const datos = ref([]);
const paginacion = ref({
  paginaActual: 1,
  paginaAnterior: null,
  paginaSiguiente: null
});
const totalPaginas = ref(0);
const searchText = ref('');
const contactToDelete = ref({ id: null, name: '' });
const fullMessage = ref('');
const vistaActual = ref('tabla');
const windowWidth = ref(window.innerWidth);
const toastConfig = ref({
  title: '',
  message: '',
  headerClass: '',
  icon: ''
});
const ordenamiento = ref({
  campo: 'id',
  direccion: 'asc'
});

// Modales y Toast
let deleteModalInstance = null;
let messageModalInstance = null;
let notificationToast = null;

// Computed
const filteredContacts = computed(() => {
  if (!searchText.value) {
    return ordenarContactos([...datos.value]);
  }
  
  const search = searchText.value.toLowerCase();
  const filtered = datos.value.filter(contact => {
    return (
      (contact.nombre_completo && contact.nombre_completo.toLowerCase().includes(search)) ||
      (contact.correo && contact.correo.toLowerCase().includes(search)) ||
      (contact.telefono && contact.telefono.toLowerCase().includes(search)) ||
      (contact.mensaje && contact.mensaje.toLowerCase().includes(search))
    );
  });
  
  return ordenarContactos(filtered);
});

const paginasVisibles = computed(() => {
  const paginas = [];
  const totalPaginasValue = totalPaginas.value;
  const paginaActual = paginacion.value.paginaActual;
  
  // Mostrar máximo 5 páginas
  let inicio = Math.max(1, paginaActual - 2);
  let fin = Math.min(totalPaginasValue, inicio + 4);
  
  // Ajustar el inicio si estamos cerca del final
  if (fin === totalPaginasValue) {
    inicio = Math.max(1, fin - 4);
  }
  
  for (let i = inicio; i <= fin; i++) {
    paginas.push(i);
  }
  
  return paginas;
});

// Lifecycle hooks
onMounted(() => {
  listar();
  deleteModalInstance = new Modal(document.getElementById('deleteModal'));
  messageModalInstance = new Modal(document.getElementById('messageModal'));
  notificationToast = new Toast(document.getElementById('notificationToast'));
  
  // Agregar event listener para el cambio de tamaño de ventana
  window.addEventListener('resize', actualizarAnchoPantalla);
});

onUnmounted(() => {
  // Eliminar event listener cuando el componente se desmonta
  window.removeEventListener('resize', actualizarAnchoPantalla);
});

// Métodos
const actualizarAnchoPantalla = () => {
  windowWidth.value = window.innerWidth;
};

const listar = async () => {
  try {
    const { data } = await index(paginacion.value.paginaActual);
    datos.value = data.datos.data;
    paginacion.value.paginaAnterior = data.datos.prev_page_url;
    paginacion.value.paginaSiguiente = data.datos.next_page_url;
    totalPaginas.value = data.datos.last_page;
  } catch (error) {
    console.error('Error al cargar contactos:', error);
    mostrarNotificacion('Error al cargar contactos', 'error');
  }
};

const paginaSiguiente = async () => {
  if (paginacion.value.paginaSiguiente != null) {
    paginacion.value.paginaActual++;
    await listar();
    scrollToTop();
  }
};

const paginaAnterior = async () => {
  if (paginacion.value.paginaAnterior != null) {
    paginacion.value.paginaActual--;
    await listar();
    scrollToTop();
  }
};

const irAPagina = async (pagina) => {
  if (pagina !== paginacion.value.paginaActual) {
    paginacion.value.paginaActual = pagina;
    await listar();
    scrollToTop();
  }
};

const irAPrimeraPagina = async () => {
  if (paginacion.value.paginaActual !== 1) {
    paginacion.value.paginaActual = 1;
    await listar();
    scrollToTop();
  }
};

const irAUltimaPagina = async () => {
  if (paginacion.value.paginaActual !== totalPaginas.value) {
    paginacion.value.paginaActual = totalPaginas.value;
    await listar();
    scrollToTop();
  }
};

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const confirmDelete = (id, name) => {
  contactToDelete.value = { id, name };
  deleteModalInstance.show();
};

const deleteContact = async () => {
  try {
    await eliminarContacto(contactToDelete.value.id);
    deleteModalInstance.hide();
    await listar();
    mostrarNotificacion('Contacto eliminado correctamente', 'success');
  } catch (error) {
    console.error('Error al eliminar contacto:', error);
    mostrarNotificacion('Error al eliminar el contacto', 'error');
  }
};

const generatePDF = async () => {
  try {
    mostrarNotificacion('Generando PDF...', 'info');
    const response = await generarPDF();
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `contactos_${new Date().toISOString().split('T')[0]}.pdf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    mostrarNotificacion('PDF generado correctamente', 'success');
  } catch (error) {
    console.error("Error generando el PDF:", error);
    mostrarNotificacion('Error al generar el PDF', 'error');
  }
};

const generateExcel = async () => {
  try {
    mostrarNotificacion('Generando Excel...', 'info');
    const response = await generarExcel();
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `contactos_${new Date().toISOString().split('T')[0]}.xlsx`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    mostrarNotificacion('Excel generado correctamente', 'success');
  } catch (error) {
    console.error('Error generando el Excel:', error);
    mostrarNotificacion('Error al generar el Excel', 'error');
  }
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

const ordenarContactos = (contactos) => {
  return contactos.sort((a, b) => {
    let valorA = a[ordenamiento.value.campo];
    let valorB = b[ordenamiento.value.campo];
    
    // Manejar valores nulos o indefinidos
    if (valorA === null || valorA === undefined) valorA = '';
    if (valorB === null || valorB === undefined) valorB = '';
    
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
};

const getIconoOrdenamiento = (campo) => {
  if (ordenamiento.value.campo !== campo) {
    return 'fa-sort';
  }
  return ordenamiento.value.direccion === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
};

// Funciones de utilidad
const getInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

const truncateMessage = (message, length) => {
  if (!message) return '';
  return message.length > length ? message.substring(0, length) + '...' : message;
};

const showFullMessage = (message) => {
  if (!message) {
    fullMessage.value = 'No hay mensaje disponible';
  } else {
    fullMessage.value = message;
  }
  messageModalInstance.show();
};

// Función para generar un color basado en el nombre
const getAvatarColor = (nombre) => {
  if (!nombre) return '#6c757d';

  // Generar un color basado en el nombre
  let hash = 0;
  for (let i = 0; i < nombre.length; i++) {
    hash = nombre.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Convertir a un color hexadecimal
  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xFF;
    color += ('00' + value.toString(16)).substr(-2);
  }

  return color;
};

const mostrarNotificacion = (mensaje, tipo) => {
  switch (tipo) {
    case 'success':
      toastConfig.value = {
        title: 'Éxito',
        message: mensaje,
        headerClass: 'bg-success text-white',
        icon: 'fas fa-check-circle'
      };
      break;
    case 'error':
      toastConfig.value = {
        title: 'Error',
        message: mensaje,
        headerClass: 'bg-danger text-white',
        icon: 'fas fa-exclamation-circle'
      };
      break;
    case 'info':
      toastConfig.value = {
        title: 'Información',
        message: mensaje,
        headerClass: 'bg-info text-white',
        icon: 'fas fa-info-circle'
      };
      break;
    case 'warning':
      toastConfig.value = {
        title: 'Advertencia',
        message: mensaje,
        headerClass: 'bg-warning text-dark',
        icon: 'fas fa-exclamation-triangle'
      };
      break;
  }
  
  notificationToast.show();
};
</script>

<style scoped>
/* Estilos base responsive */
.container-fluid {
  max-width: 100%;
  overflow-x: hidden;
}

/* Estilos para tarjetas */
.card {
  transition: all 0.3s ease;
  border-radius: 0.5rem;
}

.hover-card {
  transition: all 0.3s ease;
}

.hover-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
}

/* Estilos para botones responsive */
.btn {
  transition: all 0.2s ease-in-out;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.375rem;
  white-space: nowrap;
}

.btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 0.25rem 0.5rem rgba(0, 0, 0, 0.1) !important;
}

/* Estilos para badges */
.badge {
  font-weight: 500;
  padding: 0.35rem 0.65rem;
  border-radius: 50rem;
}

.badge.rounded-circle {
  width: 36px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

/* Estilos para avatares responsive */
.avatar-circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 14px;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  flex-shrink: 0;
}

/* Estilos para dropdown responsive */
.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  z-index: 1000;
  display: none;
  min-width: 10rem;
  padding: 0.5rem 0;
  margin: 0.125rem 0 0;
  font-size: 0.9rem;
  color: #212529;
  text-align: left;
  list-style: none;
  background-color: #fff;
  background-clip: padding-box;
  border-radius: 0.5rem;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
}

.dropdown-menu.show {
  display: block;
  animation: fadeIn 0.2s ease-in-out;
}

/* Utilidades responsive */
.min-w-0 {
  min-width: 0;
}

.flex-shrink-0 {
  flex-shrink: 0;
}

.text-truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Estilos para la vista de tabla */
.contact-row {
  transition: background-color 0.2s ease;
}

.contact-row:hover {
  background-color: rgba(0, 0, 0, 0.02);
}

.message-preview {
  color: #666;
}

.btn-link {
  color: #198754;
  text-decoration: none;
  font-size: 0.85rem;
}

.btn-link:hover {
  text-decoration: underline;
}

.fw-medium {
  font-weight: 500;
}

/* Estilos para paginación */
.pagination {
  margin-bottom: 0;
  border-radius: 0.375rem;
  overflow: hidden;
}

.page-item.active .page-link {
  background-color: #198754;
  border-color: #198754;
}

.page-link {
  color: #198754;
  border: none;
  padding: 0.5rem 0.75rem;
}

.page-link:hover {
  color: #0f5132;
  background-color: #e9ecef;
  z-index: 2;
}

/* Animaciones */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Media queries para responsive design */
@media (max-width: 575.98px) {
  /* Estilos para móviles pequeños */
  .container-fluid {
    padding-left: 0.5rem;
    padding-right: 0.5rem;
  }
  
  .card-header {
    padding: 1rem !important;
  }
  
  .card-body {
    padding: 1rem !important;
  }
  
  .modal-header,
  .modal-footer,
  .modal-body {
    padding: 1rem !important;
  }
  
  .btn {
    font-size: 0.875rem;
    padding: 0.5rem 1rem;
  }
  
  .btn-sm {
    font-size: 0.8rem;
    padding: 0.375rem 0.75rem;
  }
  
  .avatar-circle {
    width: 28px;
    height: 28px;
    font-size: 12px;
  }
}

@media (min-width: 576px) and (max-width: 767.98px) {
  /* Estilos para móviles grandes */
  .avatar-circle {
    width: 30px;
    height: 30px;
    font-size: 13px;
  }
}

@media (min-width: 768px) and (max-width: 991.98px) {
  /* Estilos para tablets */
  .avatar-circle {
    width: 34px;
    height: 34px;
    font-size: 15px;
  }
}

@media (min-width: 992px) {
  /* Estilos para desktop */
  .avatar-circle {
    width: 40px;
    height: 40px;
    font-size: 16px;
  }
}

/* Mejoras de accesibilidad */
@media (prefers-reduced-motion: reduce) {
  .card,
  .btn,
  .hover-card {
    transition: none;
  }
  
  .hover-card:hover {
    transform: none;
  }
  
  .btn:hover {
    transform: none;
  }
}

/* Toast de notificaciones */
.toast {
  opacity: 1 !important;
  border-radius: 0.5rem;
}

.toast-header {
  padding: 0.75rem 1rem;
  border-bottom: none;
}

.toast-header .btn-close {
  filter: brightness(0) invert(1);
}

.toast-body {
  padding: 1rem;
}
</style>