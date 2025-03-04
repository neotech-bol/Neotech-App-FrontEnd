<template>
    <div class="container-fluid py-4">
      <div class="card shadow">
        <div class="card-header bg-primary bg-opacity-10 d-flex justify-content-between align-items-center flex-wrap gap-3 p-3">
          <h2 class="card-title h4 m-0">Gestión de Roles</h2>
          <button class="btn btn-primary" @click="abrirModal()">
            <i class="fas fa-plus me-2"></i>Agregar Rol
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
                placeholder="Buscar rol..." 
                v-model="search" 
                @input="filtrarRoles"
              >
            </div>
          </div>
  
          <!-- Table for larger screens -->
          <div class="table-responsive d-none d-md-block">
            <table class="table table-hover align-middle mb-0">
              <thead class="bg-light">
                <tr class="text-center">
                  <th>ID</th>
                  <th>Rol</th>
                  <th>Permisos</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="rolesFiltrados.length === 0">
                  <td colspan="4" class="text-center text-danger py-4">
                    <i class="fas fa-exclamation-circle me-2"></i>No hay roles registrados
                  </td>
                </tr>
                <tr v-for="(item, index) in rolesFiltrados" :key="item.id" class="text-center">
                  <td>{{ index + 1 }}</td>
                  <td>{{ item.name }}</td>
                  <td>
                    <span class="badge bg-info">{{ item.permissions.length }}</span>
                  </td>
                  <td>
                    <div class="btn-group">
                      <button class="btn btn-sm btn-warning" @click="mostrar(item.id)">
                        <i class="fas fa-edit"></i>
                      </button>
                      <button class="btn btn-sm btn-danger" @click="eliminarRol(item.id)">
                        <i class="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
  
          <!-- Cards for mobile view -->
          <div class="d-md-none">
            <div v-for="(item, index) in rolesFiltrados" :key="item.id" class="card mb-3 mx-3">
              <div class="card-body">
                <h5 class="card-title">{{ item.name }}</h5>
                <p class="card-text">
                  <strong>ID:</strong> {{ index + 1 }}<br>
                  <strong>Permisos:</strong> 
                  <span class="badge bg-info">{{ item.permissions.length }}</span>
                </p>
                <div class="d-flex justify-content-end gap-2">
                  <button class="btn btn-sm btn-warning" @click="mostrar(item.id)">
                    <i class="fas fa-edit me-1"></i>Editar
                  </button>
                  <button class="btn btn-sm btn-danger" @click="eliminarRol(item.id)">
                    <i class="fas fa-trash me-1"></i>Eliminar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  
      <!-- Modal para agregar/editar rol -->
      <div class="modal fade" id="rolModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header" :class="posicion ? 'bg-warning bg-opacity-10' : 'bg-primary bg-opacity-10'">
              <h5 class="modal-title">{{ posicion ? 'Editar Rol' : 'Nuevo Rol' }}</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="guardarRol">
                <div class="mb-3">
                  <label for="nombre" class="form-label fw-bold">Nombre <span class="text-danger">*</span></label>
                  <input 
                    type="text" 
                    class="form-control" 
                    :class="{ 'is-invalid': errors.name }"
                    id="nombre" 
                    v-model="formulario.name" 
                    required
                  >
                  <div class="invalid-feedback" v-if="errors.name">
                    {{ errors.name[0] }}
                  </div>
                </div>
                <div class="mb-3">
                  <label class="form-label fw-bold">Permisos</label>
                  <div class="row">
                    <div class="col-md-6" v-for="permiso in permisos" :key="permiso.id">
                      <div class="form-check">
                        <input 
                          type="checkbox" 
                          class="form-check-input" 
                          :id="'permiso-' + permiso.id"
                          :value="permiso.name" 
                          v-model="formulario.permissions"
                        >
                        <label class="form-check-label" :for="'permiso-' + permiso.id">{{ permiso.name }}</label>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
              <button type="button" class="btn" :class="posicion ? 'btn-warning' : 'btn-primary'" @click="guardarRol">
                {{ posicion ? 'Actualizar' : 'Guardar' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted } from 'vue';
  import { Modal } from 'bootstrap/dist/js/bootstrap.bundle.min';
  import { destroyRol, indexPermisos, indexRoles, showRolesAndPermisos, storeRol, updateRolAndPermisos } from '@/Services/RolesPermisosService';
  
  const roles = ref([]);
  const permisos = ref([]);
  const search = ref('');
  const posicion = ref('');
  const formulario = ref({
    name: '',
    permissions: []
  });
  const errors = ref({});
  
  let rolModal = null;
  
  onMounted(() => {
    rolModal = new Modal(document.getElementById('rolModal'));
    listarRoles();
    listarPermisos();
  });
  
  const rolesFiltrados = computed(() => {
    if (!search.value) return roles.value;
    return roles.value.filter(rol => 
      rol.name.toLowerCase().includes(search.value.toLowerCase())
    );
  });
  
  const listarRoles = async () => {
    try {
      const { data } = await indexRoles();
      roles.value = data.datos;
    } catch (error) {
      console.error('Error al cargar roles:', error);
    }
  };
  
  const listarPermisos = async () => {
    try {
      const { data } = await indexPermisos();
      permisos.value = data.datos;
    } catch (error) {
      console.error('Error al cargar permisos:', error);
    }
  };
  
  const abrirModal = () => {
    posicion.value = '';
    formulario.value = {
      name: '',
      permissions: []
    };
    errors.value = {};
    rolModal.show();
  };
  
  const guardarRol = async () => {
    errors.value = {};
    try {
      if (posicion.value) {
        await updateRolAndPermisos(posicion.value, formulario.value);
      } else {
        await storeRol(formulario.value);
      }
      await listarRoles();
      rolModal.hide();
    } catch (error) {
      if (error.response && error.response.status === 422) {
        errors.value = error.response.data.errors;
      } else {
        console.error('Error al guardar rol:', error);
      }
    }
  };
  
  const eliminarRol = async (id) => {
    if (confirm('¿Está seguro de que desea eliminar este rol?')) {
      try {
        await destroyRol(id);
        await listarRoles();
      } catch (error) {
        console.error('Error al eliminar rol:', error);
      }
    }
  };
  
  const mostrar = async (id) => {
    try {
      const { data } = await showRolesAndPermisos(id);
      formulario.value = {
        name: data.datos.name,
        permissions: data.datos.permissions.map(permiso => permiso.name)
      };
      posicion.value = id;
      errors.value = {};
      rolModal.show();
    } catch (error) {
      console.error('Error al obtener rol:', error);
    }
  };
  
  const filtrarRoles = () => {
    // La función computed 'rolesFiltrados' se encargará de filtrar automáticamente
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