<template>
    <div class="container-fluid py-4">
      <div class="card shadow">
        <div class="card-header bg-primary bg-opacity-10 d-flex justify-content-between align-items-center flex-wrap gap-3 p-3">
          <h2 class="card-title h4 m-0">Gestión de Catálogos</h2>
          <button class="btn btn-primary" @click="abrirModal()">
            <i class="fas fa-plus me-2"></i>Agregar Catálogo
          </button>
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
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Descripción</th>
                  <th>Categorías</th>
                  <th>Orden</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in catalogosFiltrados" :key="item.id">
                  <td>{{ item.id }}</td>
                  <td>{{ item.nombre }}</td>
                  <td>{{ item.descripcion || 'N/A' }}</td>
                  <td>{{ item.categorias?.length || 0 }}</td>
                  <td>{{ item.orden }}</td>
                  <td>
                    <span class="badge" :class="item.estado ? 'bg-success' : 'bg-danger'">
                      {{ item.estado ? 'Activo' : 'Inactivo' }}
                    </span>
                  </td>
                  <td>
                    <div class="btn-group">
                      <button class="btn btn-sm btn-outline-primary" @click="mostrarCatalogo(item.id)">
                        <i class="fas fa-edit"></i>
                      </button>
                      <button 
                        class="btn btn-sm" 
                        :class="item.estado ? 'btn-outline-danger' : 'btn-outline-success'"
                        @click="cambiarEstado(item.id)"
                      >
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
            <div v-for="item in catalogosFiltrados" :key="item.id" class="card mb-3 mx-3">
              <div class="card-body">
                <h5 class="card-title">{{ item.nombre }}</h5>
                <p class="card-text">
                  <strong>Descripción:</strong> {{ item.descripcion || 'N/A' }}<br>
                  <strong>Categorías:</strong> {{ item.categorias?.length || 0 }}<br>
                  <strong>Orden:</strong> {{ item.orden }}<br>
                  <strong>Estado:</strong> 
                  <span class="badge" :class="item.estado ? 'bg-success' : 'bg-danger'">
                    {{ item.estado ? 'Activo' : 'Inactivo' }}
                  </span>
                </p>
                <div class="d-flex justify-content-end gap-2">
                  <button class="btn btn-sm btn-outline-primary" @click="mostrarCatalogo(item.id)">
                    <i class="fas fa-edit me-1"></i>Editar
                  </button>
                  <button 
                    class="btn btn-sm" 
                    :class="item.estado ? 'btn-outline-danger' : 'btn-outline-success'"
                    @click="cambiarEstado(item.id)"
                  >
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
  
      <!-- Modal para agregar/editar catálogo -->
      <div class="modal fade" id="catalogoModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header" :class="posicion ? 'bg-warning bg-opacity-10' : 'bg-primary bg-opacity-10'">
              <h5 class="modal-title">{{ posicion ? 'Editar Catálogo' : 'Nuevo Catálogo' }}</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="guardarCatalogo">
                <div class="mb-3">
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
                <div class="mb-3">
                  <label for="descripcion" class="form-label">Descripción</label>
                  <textarea 
                    class="form-control" 
                    id="descripcion" 
                    v-model="formulario.descripcion"
                    rows="3"
                  ></textarea>
                </div>
                <div class="mb-3">
                  <label for="orden" class="form-label">Orden</label>
                  <input 
                    type="number" 
                    class="form-control" 
                    id="orden" 
                    v-model="formulario.orden"
                  >
                </div>
              </form>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
              <button type="button" class="btn" :class="posicion ? 'btn-warning' : 'btn-primary'" @click="guardarCatalogo">
                {{ posicion ? 'Actualizar' : 'Guardar' }}
              </button>
            </div>
          </div>
        </div>
      </div>
  
      <!-- Modal de detalles del catálogo -->
      <div class="modal fade" id="detallesModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header bg-info bg-opacity-10">
              <h5 class="modal-title">Detalles del Catálogo</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body" v-if="catalogoSeleccionado">
              <h4>{{ catalogoSeleccionado.nombre }}</h4>
              <p><strong>Descripción:</strong> {{ catalogoSeleccionado.descripcion || 'N/A' }}</p>
              <p><strong>Orden:</strong> {{ catalogoSeleccionado.orden }}</p>
              <p><strong>Estado:</strong> 
                <span class="badge" :class="catalogoSeleccionado.estado ? 'bg-success' : 'bg-danger'">
                  {{ catalogoSeleccionado.estado ? 'Activo' : 'Inactivo' }}
                </span>
              </p>
              <p><strong>Fecha de creación:</strong> {{ formatearFecha(catalogoSeleccionado.created_at) }}</p>
              <p><strong>Última actualización:</strong> {{ formatearFecha(catalogoSeleccionado.updated_at) }}</p>
  
              <h5 class="mt-4">Categorías</h5>
              <div v-if="catalogoSeleccionado.categorias && catalogoSeleccionado.categorias.length > 0">
                <div v-for="categoria in catalogoSeleccionado.categorias" :key="categoria.id" class="card mb-3">
                  <div class="card-body">
                    <h6 class="card-title">{{ categoria.nombre }}</h6>
                    <p class="card-text">
                      <strong>Título:</strong> {{ categoria.titulo }}<br>
                      <strong>Subtítulo:</strong> {{ categoria.subtitulo }}<br>
                      <strong>Descripción:</strong> {{ categoria.descripcion || 'N/A' }}
                    </p>
                    <p><strong>Productos:</strong> {{ categoria.productos?.length || 0 }}</p>
                  </div>
                </div>
              </div>
              <p v-else>Este catálogo no tiene categorías.</p>
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
  let catalogoModal = null;
  let detallesModal = null;
  
  onMounted(() => {
    catalogoModal = new Modal(document.getElementById('catalogoModal'));
    detallesModal = new Modal(document.getElementById('detallesModal'));
    listarCatalogos();
  });
  
  const catalogosFiltrados = computed(() => {
    if (!search.value) return datos.value;
    return datos.value.filter(catalogo => 
      catalogo.nombre.toLowerCase().includes(search.value.toLowerCase()) ||
      (catalogo.descripcion && catalogo.descripcion.toLowerCase().includes(search.value.toLowerCase()))
    );
  });
  
  const abrirModal = () => {
    formulario.value = {
      nombre: '',
      descripcion: '',
      orden: '',
    };
    errors.value = {};
    posicion.value = '';
    catalogoModal.show();
  };
  
  const listarCatalogos = async () => {
    try {
      const { data } = await indexCatalogos();
      datos.value = data.datos;
    } catch (error) {
      console.error('Error al cargar catálogos:', error);
    }
  };
  
  const guardarCatalogo = async () => {
    errors.value = {};
    try {
      const formData = new FormData();
      formData.append('nombre', formulario.value.nombre);
      if (formulario.value.descripcion) {
        formData.append('descripcion', formulario.value.descripcion);
      }
      if (formulario.value.orden) {
        formData.append('orden', formulario.value.orden);
      }
  
      if (posicion.value) {
        formData.append('_method', 'PUT');
        await updateCatalogo(posicion.value, formData);
      } else {
        await storeCatalogo(formData);
      }
      await listarCatalogos();
      catalogoModal.hide();
    } catch (error) {
      if (error.response && error.response.status === 422) {
        errors.value = error.response.data.errors;
      } else {
        console.error('Error al guardar catálogo:', error);
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
      catalogoModal.show();
    } catch (error) {
      console.error('Error al obtener catálogo:', error);
    }
  };
  
  const cambiarEstado = async (id) => {
    try {
      await destroyCatalogo(id);
      await listarCatalogos();
    } catch (error) {
      console.error('Error al cambiar estado del catálogo:', error);
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