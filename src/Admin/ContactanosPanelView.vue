<template>
    <div class="container py-4">
      <div class="card shadow">
        <div class="card-header bg-success bg-opacity-10 d-flex justify-content-between align-items-center flex-wrap gap-3 p-3">
          <h2 class="card-title h4 m-0">
            <i class="fas fa-address-book me-2"></i>Contactos
          </h2>
          <div class="btn-group">
            <button type="button" class="btn btn-danger" @click="generatePDF()">
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
            </div>
          </div>
  
          <!-- Table for larger screens -->
          <div class="table-responsive d-none d-md-block">
            <table class="table table-hover align-middle mb-0">
              <thead class="bg-light">
                <tr>
                  <th class="ps-3">#</th>
                  <th>Nombre completo</th>
                  <th>Correo electrónico</th>
                  <th>Teléfono</th>
                  <th>Mensaje</th>
                  <th class="text-center">Acción</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="filteredContacts.length === 0">
                  <td colspan="6" class="text-center py-4">
                    <div class="alert alert-warning mb-0">
                      <i class="fas fa-exclamation-triangle me-2"></i>No se encuentran datos disponibles
                    </div>
                  </td>
                </tr>
                <tr v-for="(item, index) in filteredContacts" :key="item.id" class="contact-row">
                  <td class="ps-3">{{ index + 1 }}</td>
                  <td>
                    <div class="d-flex align-items-center">
                      <div class="avatar-circle bg-success bg-opacity-10 text-success me-2">
                        {{ getInitials(item.nombre_completo) }}
                      </div>
                      <span>{{ item.nombre_completo }}</span>
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
                    <button type="button" class="btn btn-danger btn-sm" @click="confirmDelete(item.id, item.nombre_completo)">
                      <i class="fas fa-trash-alt"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
  
          <!-- Cards for mobile view -->
          <div class="d-md-none">
            <div v-if="filteredContacts.length === 0" class="text-center py-4 px-3">
              <div class="alert alert-warning">
                <div class="mb-3">
                  <i class="fas fa-exclamation-triangle fa-3x text-warning"></i>
                </div>
                <h5>No se encuentran datos disponibles</h5>
                <p class="mb-0">No hay contactos que mostrar en este momento</p>
              </div>
            </div>
            <div v-for="(item, index) in filteredContacts" :key="item.id" class="card mb-3 mx-3">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <div class="d-flex align-items-center">
                    <div class="avatar-circle bg-success bg-opacity-10 text-success me-2">
                      {{ getInitials(item.nombre_completo) }}
                    </div>
                    <h5 class="card-title mb-0">{{ item.nombre_completo }}</h5>
                  </div>
                  <span class="badge bg-light text-dark">#{{ index + 1 }}</span>
                </div>
                <div class="card-text">
                  <p class="mb-1">
                    <a :href="`mailto:${item.correo}`" class="text-decoration-none">
                      <i class="fas fa-envelope me-2 text-muted"></i>{{ item.correo }}
                    </a>
                  </p>
                  <p class="mb-1">
                    <a :href="`tel:${item.telefono}`" class="text-decoration-none">
                      <i class="fas fa-phone me-2 text-muted"></i>{{ item.telefono }}
                    </a>
                  </p>
                  <p class="mb-1">
                    <i class="fas fa-comment me-2 text-muted"></i>
                    <span>{{ truncateMessage(item.mensaje, 100) }}</span>
                    <button v-if="item.mensaje && item.mensaje.length > 100" 
                            class="btn btn-link btn-sm p-0 ms-1" 
                            @click="showFullMessage(item.mensaje)">
                      Ver más
                    </button>
                  </p>
                </div>
                <div class="d-flex justify-content-end mt-3">
                  <button type="button" class="btn btn-danger btn-sm" @click="confirmDelete(item.id, item.nombre_completo)">
                    <i class="fas fa-trash-alt me-1"></i>Eliminar
                  </button>
                </div>
              </div>
            </div>
          </div>
  
          <!-- Pagination -->
          <div class="p-3 border-top" v-if="datos.length > 0">
            <nav aria-label="Navegación de páginas">
              <ul class="pagination justify-content-center mb-0">
                <li class="page-item" :class="!paginacion.paginaAnterior ? 'disabled' : ''">
                  <button type="button" class="page-link" aria-label="Anterior" @click="paginaAnterior">
                    <i class="fas fa-chevron-left"></i>
                  </button>
                </li>
                <li class="page-item">
                  <span class="page-link bg-light">
                    Página {{ paginacion.paginaActual }} de {{ totalPaginas }}
                  </span>
                </li>
                <li class="page-item" :class="!paginacion.paginaSiguiente ? 'disabled' : ''">
                  <button type="button" class="page-link" aria-label="Siguiente" @click="paginaSiguiente">
                    <i class="fas fa-chevron-right"></i>
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
              <p>¿Estás seguro que deseas eliminar el contacto de <strong>{{ contactToDelete.name }}</strong>?</p>
              <p class="text-danger mb-0"><small>Esta acción no se puede deshacer.</small></p>
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
              <p>{{ fullMessage }}</p>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-success" data-bs-dismiss="modal">
                <i class="fas fa-check me-2"></i>Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { eliminarContacto, generarExcel, generarPDF, index } from '@/services/ContactoService';
  import { onMounted, ref, computed } from 'vue';
  import { Modal } from 'bootstrap/dist/js/bootstrap.min';
  
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
  
  // Modales
  let deleteModalInstance = null;
  let messageModalInstance = null;
  
  // Computed
  const filteredContacts = computed(() => {
    if (!searchText.value) return datos.value;
    
    const search = searchText.value.toLowerCase();
    return datos.value.filter(contact => {
      return (
        (contact.nombre_completo && contact.nombre_completo.toLowerCase().includes(search)) ||
        (contact.correo && contact.correo.toLowerCase().includes(search)) ||
        (contact.telefono && contact.telefono.toLowerCase().includes(search)) ||
        (contact.mensaje && contact.mensaje.toLowerCase().includes(search))
      );
    });
  });
  
  // Lifecycle hooks
  onMounted(() => {
    listar();
    deleteModalInstance = new Modal(document.getElementById('deleteModal'));
    messageModalInstance = new Modal(document.getElementById('messageModal'));
  });
  
  // Métodos
  const listar = async () => {
    try {
      const { data } = await index(paginacion.value.paginaActual);
      datos.value = data.datos.data;
      paginacion.value.paginaAnterior = data.datos.prev_page_url;
      paginacion.value.paginaSiguiente = data.datos.next_page_url;
      totalPaginas.value = data.datos.last_page;
    } catch (error) {
      console.log(error);
    }
  };
  
  const paginaSiguiente = async () => {
    if (paginacion.value.paginaSiguiente != null) {
      paginacion.value.paginaActual++;
      listar();
    }
  };
  
  const paginaAnterior = async () => {
    if (paginacion.value.paginaAnterior != null) {
      paginacion.value.paginaActual--;
      listar();
    }
  };
  
  const confirmDelete = (id, name) => {
    contactToDelete.value = { id, name };
    deleteModalInstance.show();
  };
  
  const deleteContact = async () => {
    try {
      await eliminarContacto(contactToDelete.value.id);
      deleteModalInstance.hide();
      listar();
      // Aquí podrías mostrar un toast o notificación de éxito
    } catch (error) {
      console.log(error);
      // Aquí podrías mostrar un toast o notificación de error
    }
  };
  
  const generatePDF = async () => {
    try {
      const response = await generarPDF();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'contactos.pdf');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      // Aquí podrías mostrar un toast o notificación de éxito
    } catch (error) {
      console.error("Error generando el PDF:", error);
      // Aquí podrías mostrar un toast o notificación de error
    }
  };
  
  const generateExcel = async () => {
    try {
      const response = await generarExcel();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'contactos.xlsx');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      // Aquí podrías mostrar un toast o notificación de éxito
    } catch (error) {
      console.log(error);
      // Aquí podrías mostrar un toast o notificación de error
    }
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
    fullMessage.value = message;
    messageModalInstance.show();
  };
  </script>
  
  <style scoped>
  .card {
    transition: box-shadow 0.3s ease-in-out;
    border-radius: 0.5rem;
  }
  
  .card:hover {
    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
  }
  
  .card-header {
    border-top-left-radius: 0.5rem;
    border-top-right-radius: 0.5rem;
  }
  
  .avatar-circle {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 0.9rem;
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
  
  .page-link {
    color: #198754;
    border-color: #dee2e6;
  }
  
  .page-link:hover {
    color: #0f5132;
    background-color: #e9ecef;
    border-color: #dee2e6;
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
      width: 100%;
    }
    
    .btn-group .btn {
      flex: 1;
    }
  }
  </style>