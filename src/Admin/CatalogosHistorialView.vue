<template>
    <div class="container-fluid py-4">
      <div class="card shadow">
        <div class="card-header bg-primary bg-opacity-10 d-flex justify-content-between align-items-center flex-wrap gap-3 p-3">
          <h2 class="card-title h4 m-0">Historial de Catálogos</h2>
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
                placeholder="Buscar catálogo..." 
                v-model="search" 
                @input="filtrarCatalogos"
              >
            </div>
          </div>
  
          <!-- Table for larger screens -->
          <div class="table-responsive d-none d-md-block">
            <table class="table table-hover align-middle mb-0">
              <thead class="bg-light">
                <tr class="text-center">
                  <th>#</th>
                  <th>Nombre</th>
                  <th>Descripción</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in catalogosFiltrados" :key="item.id" class="text-center">
                  <td>{{ index + 1 }}</td>
                  <td>{{ item.nombre }}</td>
                  <td>{{ item.descripcion || 'N/A' }}</td>
                  <td>
                    <span class="badge" :class="item.estado ? 'bg-success' : 'bg-danger'">
                      {{ item.estado ? 'Activo' : 'Inactivo' }}
                    </span>
                  </td>
                  <td>
                    <button 
                      class="btn btn-sm" 
                      :class="item.estado ? 'btn-outline-danger' : 'btn-outline-success'"
                      @click="cambiarEstado(item.id)"
                    >
                      {{ item.estado ? 'Desactivar' : 'Activar' }}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
  
          <!-- Cards for mobile view -->
          <div class="d-md-none">
            <div v-for="(item, index) in catalogosFiltrados" :key="item.id" class="card mb-3 mx-3">
              <div class="card-body">
                <h5 class="card-title">{{ item.nombre }}</h5>
                <p class="card-text">
                  <strong>#:</strong> {{ index + 1 }}<br>
                  <strong>Descripción:</strong> {{ item.descripcion || 'N/A' }}<br>
                  <strong>Estado:</strong> 
                  <span class="badge" :class="item.estado ? 'bg-success' : 'bg-danger'">
                    {{ item.estado ? 'Activo' : 'Inactivo' }}
                  </span>
                </p>
                <div class="d-flex justify-content-end">
                  <button 
                    class="btn btn-sm" 
                    :class="item.estado ? 'btn-outline-danger' : 'btn-outline-success'"
                    @click="cambiarEstado(item.id)"
                  >
                    {{ item.estado ? 'Desactivar' : 'Activar' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
  
          <!-- Pagination -->
          <div class="d-flex justify-content-center align-items-center p-3">
            <button 
              class="btn btn-sm btn-outline-primary me-2" 
              @click="cambiarPagina(-1)" 
              :disabled="paginaActual === 1"
            >
              Anterior
            </button>
            <span>Página {{ paginaActual }} de {{ totalPaginas }}</span>
            <button 
              class="btn btn-sm btn-outline-primary ms-2" 
              @click="cambiarPagina(1)" 
              :disabled="paginaActual === totalPaginas"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
  
      <!-- Toast para notificaciones -->
      <div class="position-fixed bottom-0 end-0 p-3" style="z-index: 11">
        <div 
          id="notificationToast" 
          class="toast" 
          role="alert" 
          aria-live="assertive" 
          aria-atomic="true"
        >
          <div class="toast-header" :class="notificacion.tipo === 'success' ? 'bg-success text-white' : 'bg-danger text-white'">
            <strong class="me-auto">Notificación</strong>
            <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
          </div>
          <div class="toast-body">
            {{ notificacion.mensaje }}
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted } from 'vue';
  import { Toast } from 'bootstrap/dist/js/bootstrap.bundle.min';
  import { changeStatus, indexCatalogosHistoriales } from '@/Services/CatalogoHistorialesService';
  
  const catalogosHistoriales = ref([]);
  const search = ref('');
  const paginaActual = ref(1);
  const itemsPorPagina = 10;
  const notificacion = ref({ tipo: '', mensaje: '' });
  let toastElement;
  
  onMounted(() => {
    listarCatalogosHistorial();
    toastElement = new Toast(document.getElementById('notificationToast'));
  });
  
  const listarCatalogosHistorial = async () => {
    try {
      const { data } = await indexCatalogosHistoriales();
      catalogosHistoriales.value = data.datos;
    } catch (error) {
      console.error('Error al cargar catálogos:', error);
      mostrarNotificacion('error', 'Error al cargar los catálogos');
    }
  };
  
  const catalogosFiltrados = computed(() => {
    let filtrados = catalogosHistoriales.value;
    if (search.value) {
      const searchLower = search.value.toLowerCase();
      filtrados = filtrados.filter(catalogo => 
        catalogo.nombre.toLowerCase().includes(searchLower) ||
        (catalogo.descripcion && catalogo.descripcion.toLowerCase().includes(searchLower))
      );
    }
    return filtrados;
  });
  
  const catalogosPaginados = computed(() => {
    const inicio = (paginaActual.value - 1) * itemsPorPagina;
    const fin = inicio + itemsPorPagina;
    return catalogosFiltrados.value.slice(inicio, fin);
  });
  
  const totalPaginas = computed(() => {
    return Math.ceil(catalogosFiltrados.value.length / itemsPorPagina);
  });
  
  const cambiarPagina = (direccion) => {
    paginaActual.value = Math.max(1, Math.min(paginaActual.value + direccion, totalPaginas.value));
  };
  
  const cambiarEstado = async (id) => {
    try {
      const { data } = await changeStatus(id);
      await listarCatalogosHistorial();
      mostrarNotificacion('success', 'Estado del catálogo actualizado correctamente');
    } catch (error) {
      console.error('Error al cambiar el estado:', error);
      mostrarNotificacion('error', 'Error al cambiar el estado del catálogo');
    }
  };
  
  const filtrarCatalogos = () => {
    paginaActual.value = 1; // Resetear a la primera página al filtrar
  };
  
  const mostrarNotificacion = (tipo, mensaje) => {
    notificacion.value = { tipo, mensaje };
    toastElement.show();
  };
  </script>
  
  <style scoped>
  .card {
    transition: box-shadow 0.3s ease-in-out;
  }
  
  .card:hover {
    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
  }
  
  .table-responsive {
    min-height: 300px;
  }
  
  @media (max-width: 767.98px) {
    .card-title {
      font-size: 1.25rem;
    }
  }
  </style>