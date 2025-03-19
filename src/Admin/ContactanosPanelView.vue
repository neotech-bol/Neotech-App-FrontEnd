<template>
  <div class="container-fluid py-4">
    <div class="card shadow">
      <div class="card-header bg-success bg-opacity-10 d-flex justify-content-between align-items-center flex-wrap gap-3 p-3">
        <h2 class="card-title h4 m-0">
          <i class="fas fa-address-book me-2"></i>Gestión de Contactos
        </h2>
        <div>
          <button type="button" class="btn btn-danger me-2" @click="generatePDF()">
            <i class="fas fa-file-pdf me-2"></i>Generar PDF
          </button>
          <button type="button" class="btn btn-success" @click="generateExcel()">
            <i class="fas fa-file-excel me-2"></i>Generar Excel
          </button>
        </div>
      </div>
      <div class="card-body p-0">
        <div class="p-3">
          <div class="input-group mb-3">
            <span class="input-group-text bg-light">
              <i class="fas fa-search"></i>
            </span>
            <input type="text" class="form-control" placeholder="Buscar por nombre, correo, teléfono..." v-model="searchText">
            <button class="btn btn-outline-secondary" type="button" @click="searchText = ''" v-if="searchText">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <!-- Contador de resultados y filtros -->
          <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
            <p class="text-muted mb-0">
              <i class="fas fa-list-ul me-1"></i>
              Mostrando {{ filteredContacts.length }} contactos
            </p>
            <div class="d-flex gap-2 flex-wrap">
              <div class="btn-group">
                <button class="btn btn-sm"
                  :class="vistaActual === 'tabla' ? 'btn-success' : 'btn-outline-success'"
                  @click="vistaActual = 'tabla'">
                  <i class="fas fa-table me-1"></i>Tabla
                </button>
                <button class="btn btn-sm"
                  :class="vistaActual === 'tarjetas' ? 'btn-success' : 'btn-outline-success'"
                  @click="vistaActual = 'tarjetas'">
                  <i class="fas fa-th-large me-1"></i>Tarjetas
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Mensaje cuando no hay resultados -->
        <div v-if="filteredContacts.length === 0" class="text-center py-5">
          <i class="fas fa-address-card fa-3x text-muted mb-3"></i>
          <h5 class="text-muted">No se encontraron contactos</h5>
          <p class="text-muted">Intenta con otra búsqueda o agrega un nuevo contacto</p>
        </div>

        <!-- Table view -->
        <div class="table-responsive"
          v-if="filteredContacts.length > 0 && (vistaActual === 'tabla' || windowWidth >= 768)">
          <table class="table table-hover align-middle mb-0">
            <thead class="bg-light">
              <tr>
                <th class="px-3">
                  <div class="d-flex align-items-center">
                    <span>#</span>
                    <button class="btn btn-sm text-success border-0 p-0 ms-1"
                      @click="ordenarPor('id')">
                      <i class="fas" :class="getIconoOrdenamiento('id')"></i>
                    </button>
                  </div>
                </th>
                <th class="px-3">
                  <div class="d-flex align-items-center">
                    <span>Nombre</span>
                    <button class="btn btn-sm text-success border-0 p-0 ms-1"
                      @click="ordenarPor('nombre_completo')">
                      <i class="fas" :class="getIconoOrdenamiento('nombre_completo')"></i>
                    </button>
                  </div>
                </th>
                <th class="px-3">Correo electrónico</th>
                <th class="px-3">Teléfono</th>
                <th class="px-3">Mensaje</th>
                <th class="px-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in filteredContacts" :key="item.id" class="contact-row">
                <td class="px-3">{{ index + 1 }}</td>
                <td>
                  <div class="d-flex align-items-center">
                    <div class="avatar-circle"
                      :style="{ backgroundColor: getAvatarColor(item.nombre_completo) }">
                      {{ getInitials(item.nombre_completo) }}
                    </div>
                    <div class="ms-2">
                      <div class="fw-medium">{{ item.nombre_completo }}</div>
                      <small class="text-muted">Contacto #{{ item.id }}</small>
                    </div>
                  </div>
                </td>
                <td>
                  <a :href="`mailto:${item.correo}`" class="text-decoration-none">
                    <i class="fas fa-envelope me-1 text-muted"></i>{{ item.correo }}
                  </a>
                </td>
                <td>
                  <a :href="`tel:${item.telefono}`" class="text-decoration-none">
                    <i class="fas fa-phone me-1 text-muted"></i>{{ item.telefono }}
                  </a>
                </td>
                <td>
                  <span class="message-preview">{{ truncateMessage(item.mensaje, 50) }}</span>
                  <button v-if="item.mensaje && item.mensaje.length > 50" 
                          class="btn btn-link btn-sm p-0 ms-1" 
                          @click="showFullMessage(item.mensaje)">
                    Ver más
                  </button>
                </td>
                <td class="text-center">
                  <div class="btn-group">
                    <button type="button" class="btn btn-outline-info btn-sm" @click="showFullMessage(item.mensaje)">
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

        <!-- Cards view -->
        <div v-if="filteredContacts.length > 0 && (vistaActual === 'tarjetas' || windowWidth < 768)">
          <div class="row g-3 p-3">
            <div class="col-md-6 col-lg-4" v-for="(item, index) in filteredContacts" :key="item.id">
              <div class="card h-100 border-0 shadow-sm hover-card">
                <div class="card-header bg-light d-flex justify-content-between align-items-center">
                  <div class="d-flex align-items-center">
                    <div class="avatar-circle me-2"
                      :style="{ backgroundColor: getAvatarColor(item.nombre_completo) }">
                      {{ getInitials(item.nombre_completo) }}
                    </div>
                    <h5 class="card-title mb-0">{{ item.nombre_completo }}</h5>
                  </div>
                  <span class="badge bg-light text-dark">#{{ index + 1 }}</span>
                </div>
                <div class="card-body">
                  <ul class="list-group list-group-flush mb-3">
                    <li class="list-group-item d-flex justify-content-between px-0">
                      <span class="text-muted"><i class="fas fa-envelope me-2"></i>Correo:</span>
                      <a :href="`mailto:${item.correo}`" class="text-decoration-none">{{ item.correo }}</a>
                    </li>
                    <li class="list-group-item d-flex justify-content-between px-0">
                      <span class="text-muted"><i class="fas fa-phone me-2"></i>Teléfono:</span>
                      <a :href="`tel:${item.telefono}`" class="text-decoration-none">{{ item.telefono }}</a>
                    </li>
                    <li class="list-group-item px-0">
                      <div class="d-flex justify-content-between">
                        <span class="text-muted"><i class="fas fa-comment me-2"></i>Mensaje:</span>
                        <button v-if="item.mensaje && item.mensaje.length > 100" 
                                class="btn btn-link btn-sm p-0" 
                                @click="showFullMessage(item.mensaje)">
                          Ver completo
                        </button>
                      </div>
                      <div class="mt-2 message-preview">
                        {{ truncateMessage(item.mensaje, 100) }}
                      </div>
                    </li>
                  </ul>
                </div>
                <div class="card-footer bg-white border-top-0">
                  <div class="d-flex justify-content-between">
                    <button type="button" class="btn btn-outline-info btn-sm" @click="showFullMessage(item.mensaje)">
                      <i class="fas fa-eye me-1"></i>Ver mensaje
                    </button>
                    <button type="button" class="btn btn-outline-danger btn-sm" @click="confirmDelete(item.id, item.nombre_completo)">
                      <i class="fas fa-trash-alt me-1"></i>Eliminar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div class="p-3 border-top d-flex justify-content-between align-items-center flex-wrap gap-2" v-if="datos.length > 0">
          <div class="text-muted small">
            Mostrando página {{ paginacion.paginaActual }} de {{ totalPaginas }}
          </div>
          <nav aria-label="Navegación de páginas">
            <ul class="pagination pagination-sm mb-0">
              <li class="page-item" :class="!paginacion.paginaAnterior ? 'disabled' : ''">
                <button type="button" class="page-link" aria-label="Primera" @click="irAPrimeraPagina">
                  <i class="fas fa-angle-double-left"></i>
                </button>
              </li>
              <li class="page-item" :class="!paginacion.paginaAnterior ? 'disabled' : ''">
                <button type="button" class="page-link" aria-label="Anterior" @click="paginaAnterior">
                  <i class="fas fa-angle-left"></i>
                </button>
              </li>
              <li v-for="pagina in paginasVisibles" :key="pagina" class="page-item" :class="pagina === paginacion.paginaActual ? 'active' : ''">
                <button type="button" class="page-link" @click="irAPagina(pagina)">{{ pagina }}</button>
              </li>
              <li class="page-item" :class="!paginacion.paginaSiguiente ? 'disabled' : ''">
                <button type="button" class="page-link" aria-label="Siguiente" @click="paginaSiguiente">
                  <i class="fas fa-angle-right"></i>
                </button>
              </li>
              <li class="page-item" :class="!paginacion.paginaSiguiente ? 'disabled' : ''">
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
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header bg-danger bg-opacity-10">
            <h5 class="modal-title" id="deleteModalLabel">
              <i class="fas fa-trash-alt me-2"></i>Confirmar eliminación
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class="d-flex align-items-center mb-3">
              <div class="avatar-circle me-3" :style="{ backgroundColor: getAvatarColor(contactToDelete.name) }">
                {{ getInitials(contactToDelete.name) }}
              </div>
              <div>
                <h5 class="mb-1">{{ contactToDelete.name }}</h5>
                <p class="text-muted mb-0">ID: {{ contactToDelete.id }}</p>
              </div>
            </div>
            <div class="alert alert-warning">
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
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">
              <i class="fas fa-times me-2"></i>Cancelar
            </button>
            <button type="button" class="btn btn-danger" @click="deleteContact">
              <i class="fas fa-trash-alt me-2"></i>Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal para ver mensaje completo -->
    <div class="modal fade" id="messageModal" tabindex="-1" aria-labelledby="messageModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header bg-success bg-opacity-10">
            <h5 class="modal-title" id="messageModalLabel">
              <i class="fas fa-comment me-2"></i>Mensaje completo
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class="card border-0 bg-light">
              <div class="card-body">
                <p class="mb-0">{{ fullMessage }}</p>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-success" data-bs-dismiss="modal">
              <i class="fas fa-check me-2"></i>Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast de notificaciones -->
    <div class="position-fixed bottom-0 end-0 p-3" style="z-index: 11">
      <div id="notificationToast" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="toast-header" :class="toastConfig.headerClass">
          <i :class="toastConfig.icon + ' me-2'"></i>
          <strong class="me-auto">{{ toastConfig.title }}</strong>
          <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
        <div class="toast-body">
          {{ toastConfig.message }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { eliminarContacto, generarExcel, generarPDF, index } from '@/services/ContactoService';
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
.card {
  transition: box-shadow 0.3s ease-in-out;
  border-radius: 0.5rem;
}

.hover-card {
  transition: all 0.3s ease;
}

.hover-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
}

.card-header {
  border-top-left-radius: 0.5rem;
  border-top-right-radius: 0.5rem;
  padding: 0.75rem 1rem;
}

.modal-header,
.modal-footer {
  padding: 1rem;
}

.modal-body {
  padding: 1.5rem;
}

.avatar-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 16px;
}

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

.page-link {
  color: #198754;
  border-color: #dee2e6;
}

.page-link:hover {
  color: #0f5132;
  background-color: #e9ecef;
  border-color: #dee2e6;
}

.page-item.active .page-link {
  background-color: #198754;
  border-color: #198754;
}

.page-item.disabled .page-link {
  color: #6c757d;
  pointer-events: none;
  background-color: #fff;
  border-color: #dee2e6;
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

/* Toast de notificaciones */
.toast {
  opacity: 1 !important;
}

.toast-header {
  padding: 0.5rem 0.75rem;
}

.toast-body {
  padding: 0.75rem;
}
</style>

## Mejoras implementadas en la gestión de contactos

He mejorado la interfaz de usuario y la experiencia de usuario del componente de gestión de contactos para que sea más dinámica y coherente con el estilo del componente de gestión de usuarios:

1. **Diseño consistente**:
   - Implementé el mismo estilo de tarjetas, botones y elementos visuales
   - Utilicé los mismos componentes de avatar con colores generados dinámicamente
   - Mantuve la misma estructura de encabezados y secciones

2. **Vistas alternativas**:
   - Agregué un selector de vista (tabla/tarjetas) igual al de gestión de usuarios
   - Mejoré la vista de tarjetas con un diseño más organizado y atractivo
   - Optimicé la visualización en dispositivos móviles

3. **Funcionalidades mejoradas**:
   - Implementé ordenamiento de columnas en la vista de tabla
   - Mejoré el sistema de paginación con números de página visibles
   - Agregué botones para ir a la primera y última página

4. **Interactividad**:
   - Añadí efectos de hover y transiciones suaves
   - Mejoré los modales con más información y mejor organización
   - Implementé un sistema de notificaciones toast para feedback al usuario

5. **Experiencia de usuario**:
   - Añadí contador de resultados y filtros
   - Mejoré la visualización de mensajes largos
   - Implementé scroll automático al cambiar de página

Estas mejoras hacen que la gestión de contactos sea más coherente con el resto de la aplicación y proporcione una experiencia de usuario más fluida y agradable.