<template>
  <div class="container-fluid py-4">
    <div class="card shadow-sm border-0">
      <!-- Header -->
      <div class="card-header bg-primary bg-opacity-10 d-flex justify-content-between align-items-center flex-wrap gap-3 p-3">
        <h2 class="card-title h4 m-0">
          <i class="fas fa-user-tag me-2"></i>Gestión de Roles
        </h2>
        <div class="d-flex gap-2">
          <button class="btn btn-primary d-flex align-items-center" @click="abrirModal()">
            <i class="fas fa-plus me-2"></i>Agregar Rol
          </button>
          <button class="btn btn-outline-primary d-flex align-items-center" @click="listarRoles()">
            <i class="fas fa-sync-alt me-2"></i>Actualizar
          </button>
        </div>
      </div>

      <!-- Toolbar -->
      <div class="p-3 border-bottom">
        <div class="row g-3">
          <!-- Search -->
          <div class="col-md-6 col-lg-4">
            <div class="input-group">
              <span class="input-group-text bg-light border-end-0">
                <i class="fas fa-search text-muted"></i>
              </span>
              <input 
                type="text" 
                class="form-control border-start-0" 
                placeholder="Buscar por nombre de rol..." 
                v-model="search" 
                @input="filtrarRoles"
                aria-label="Buscar roles"
              >
              <button 
                v-if="search" 
                class="btn btn-outline-secondary border-start-0" 
                type="button" 
                @click="search = ''; filtrarRoles()"
                aria-label="Limpiar búsqueda"
              >
                <i class="fas fa-times"></i>
              </button>
            </div>
          </div>

          <!-- View toggle and stats -->
          <div class="col-md-6 col-lg-8 d-flex justify-content-md-end align-items-center flex-wrap gap-3">
            <div class="d-flex align-items-center me-3">
              <span class="badge bg-primary rounded-pill me-2">{{ rolesFiltrados.length }}</span>
              <span class="text-muted">{{ rolesFiltrados.length === 1 ? 'rol encontrado' : 'roles encontrados' }}</span>
            </div>
            
            <div class="btn-group">
              <button 
                class="btn btn-sm" 
                :class="viewMode === 'table' ? 'btn-primary' : 'btn-outline-primary'" 
                @click="viewMode = 'table'"
                aria-label="Ver como tabla"
              >
                <i class="fas fa-table me-1"></i><span class="d-none d-sm-inline">Tabla</span>
              </button>
              <button 
                class="btn btn-sm" 
                :class="viewMode === 'cards' ? 'btn-primary' : 'btn-outline-primary'" 
                @click="viewMode = 'cards'"
                aria-label="Ver como tarjetas"
              >
                <i class="fas fa-th-large me-1"></i><span class="d-none d-sm-inline">Tarjetas</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Content -->
      <div class="card-body p-0">
        <!-- Empty state -->
        <div v-if="rolesFiltrados.length === 0" class="text-center py-5">
          <div class="empty-state-icon mb-3">
            <i class="fas fa-user-shield fa-3x text-muted"></i>
          </div>
          <h5 class="text-muted">No se encontraron roles</h5>
          <p class="text-muted mb-4">
            {{ roles.length > 0 ? 'Intenta con otra búsqueda o limpia los filtros.' : 'Comienza creando un nuevo rol para gestionar los permisos de usuarios.' }}
          </p>
          <div class="d-flex justify-content-center gap-2">
            <button v-if="search" class="btn btn-outline-secondary" @click="search = ''; filtrarRoles()">
              <i class="fas fa-filter-circle-xmark me-2"></i>Limpiar filtros
            </button>
            <button class="btn btn-primary" @click="abrirModal()">
              <i class="fas fa-plus me-2"></i>Agregar Rol
            </button>
          </div>
        </div>

        <!-- Table view -->
        <div v-else-if="viewMode === 'table'" class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="bg-light">
              <tr>
                <th class="px-3" style="width: 80px;">
                  <div class="d-flex align-items-center">
                    <span>ID</span>
                    <button 
                      class="btn btn-sm text-primary border-0 p-0 ms-1" 
                      @click="toggleSort('id')"
                      aria-label="Ordenar por ID"
                    >
                      <i class="fas" :class="getSortIcon('id')"></i>
                    </button>
                  </div>
                </th>
                <th class="px-3">
                  <div class="d-flex align-items-center">
                    <span>Rol</span>
                    <button 
                      class="btn btn-sm text-primary border-0 p-0 ms-1" 
                      @click="toggleSort('name')"
                      aria-label="Ordenar por nombre"
                    >
                      <i class="fas" :class="getSortIcon('name')"></i>
                    </button>
                  </div>
                </th>
                <th class="px-3">
                  <div class="d-flex align-items-center">
                    <span>Permisos</span>
                    <button 
                      class="btn btn-sm text-primary border-0 p-0 ms-1" 
                      @click="toggleSort('permissions')"
                      aria-label="Ordenar por cantidad de permisos"
                    >
                      <i class="fas" :class="getSortIcon('permissions')"></i>
                    </button>
                  </div>
                </th>
                <th class="px-3 text-end" style="width: 150px;">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in rolesFiltrados" :key="item.id" :class="{'table-primary bg-opacity-10': isSystemRole(item.name)}">
                <td class="px-3">{{ item.id }}</td>
                <td class="px-3">
                  <div class="d-flex align-items-center">
                    <div class="role-icon me-2" :class="isSystemRole(item.name) ? 'role-icon-system' : ''">
                      <i class="fas" :class="getRoleIcon(item.name)"></i>
                    </div>
                    <div>
                      <div class="fw-medium">{{ item.name }}</div>
                      <small v-if="isSystemRole(item.name)" class="text-primary">
                        <i class="fas fa-shield-alt me-1"></i>Rol del sistema
                      </small>
                    </div>
                  </div>
                </td>
                <td class="px-3">
                  <div class="d-flex align-items-center">
                    <span class="badge bg-info rounded-pill me-2">{{ item.permissions.length }}</span>
                    <button 
                      class="btn btn-sm btn-outline-info py-0 px-2" 
                      @click="mostrarPermisos(item)"
                      aria-label="Ver permisos"
                    >
                      <i class="fas fa-eye me-1"></i>Ver permisos
                    </button>
                  </div>
                </td>
                <td class="px-3 text-end">
                  <div class="btn-group">
                    <button 
                      class="btn btn-sm btn-outline-primary" 
                      @click="mostrar(item.id)"
                      aria-label="Editar rol"
                      :title="`Editar ${item.name}`"
                    >
                      <i class="fas fa-edit"></i>
                    </button>
                    <button 
                      class="btn btn-sm btn-outline-danger" 
                      @click="confirmarEliminar(item)"
                      aria-label="Eliminar rol"
                      :title="`Eliminar ${item.name}`"
                      :disabled="isSystemRole(item.name)"
                    >
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Cards view -->
        <div v-else class="p-3">
          <div class="row g-3">
            <div class="col-md-6 col-lg-4" v-for="item in rolesFiltrados" :key="item.id">
              <div 
                class="card h-100 border-0 shadow-sm hover-card" 
                :class="{'border-primary border-opacity-25': isSystemRole(item.name)}"
              >
                <div class="card-header d-flex justify-content-between align-items-center" 
                     :class="isSystemRole(item.name) ? 'bg-primary bg-opacity-10' : 'bg-light'">
                  <div class="d-flex align-items-center">
                    <div class="role-icon me-2" :class="isSystemRole(item.name) ? 'role-icon-system' : ''">
                      <i class="fas" :class="getRoleIcon(item.name)"></i>
                    </div>
                    <h5 class="card-title mb-0">{{ item.name }}</h5>
                  </div>
                  <span class="badge bg-info rounded-pill">
                    {{ item.permissions.length }} permisos
                  </span>
                </div>
                <div class="card-body">
                  <div v-if="isSystemRole(item.name)" class="alert alert-info bg-opacity-25 py-2 mb-3">
                    <small><i class="fas fa-shield-alt me-1"></i>Este es un rol del sistema con privilegios especiales</small>
                  </div>
                  
                  <div class="mb-3">
                    <h6 class="text-muted mb-2">Permisos principales:</h6>
                    <div class="permission-tags">
                      <span 
                        v-for="(permiso, index) in item.permissions.slice(0, 5)" 
                        :key="index" 
                        class="badge bg-light text-dark me-1 mb-1"
                      >
                        {{ permiso.name }}
                      </span>
                      <span v-if="item.permissions.length > 5" class="badge bg-secondary me-1 mb-1">
                        +{{ item.permissions.length - 5 }} más
                      </span>
                    </div>
                  </div>
                  
                  <div class="text-muted small">
                    <div><i class="fas fa-hashtag me-1"></i>ID: {{ item.id }}</div>
                    <div><i class="fas fa-key me-1"></i>Total de permisos: {{ item.permissions.length }}</div>
                  </div>
                </div>
                <div class="card-footer bg-white border-top-0">
                  <div class="d-flex justify-content-between">
                    <button 
                      class="btn btn-sm btn-outline-primary" 
                      @click="mostrar(item.id)"
                      aria-label="Editar rol"
                    >
                      <i class="fas fa-edit me-1"></i>Editar
                    </button>
                    <button 
                      class="btn btn-sm btn-outline-info" 
                      @click="mostrarPermisos(item)"
                      aria-label="Ver permisos"
                    >
                      <i class="fas fa-eye me-1"></i>Ver permisos
                    </button>
                    <button 
                      class="btn btn-sm btn-outline-danger" 
                      @click="confirmarEliminar(item)"
                      aria-label="Eliminar rol"
                      :disabled="isSystemRole(item.name)"
                    >
                      <i class="fas fa-trash me-1"></i>Eliminar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal para agregar/editar rol -->
    <div class="modal fade" id="rolModal" tabindex="-1" aria-labelledby="rolModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header" :class="posicion ? 'bg-warning bg-opacity-10' : 'bg-primary bg-opacity-10'">
            <h5 class="modal-title" id="rolModalLabel">
              <i class="fas" :class="posicion ? 'fa-edit me-2' : 'fa-plus-circle me-2'"></i>
              {{ posicion ? 'Editar Rol' : 'Nuevo Rol' }}
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="validarYGuardar" id="rolForm" class="needs-validation" novalidate>
              <!-- Información del rol -->
              <div class="mb-4">
                <label for="nombre" class="form-label fw-bold">Nombre del Rol <span class="text-danger">*</span></label>
                <div class="input-group has-validation">
                  <span class="input-group-text"><i class="fas fa-user-tag"></i></span>
                  <input 
                    type="text" 
                    class="form-control" 
                    :class="{ 'is-invalid': errors.name }" 
                    id="nombre"
                    v-model="formulario.name" 
                    placeholder="Ej: Editor, Vendedor, Supervisor..."
                    required
                    :disabled="isSystemRole(formulario.name)"
                    autocomplete="off"
                  >
                  <div class="invalid-feedback" v-if="errors.name">
                    {{ errors.name[0] }}
                  </div>
                  <div class="invalid-feedback" v-else>
                    El nombre del rol es obligatorio
                  </div>
                </div>
                <div class="form-text">
                  <i class="fas fa-info-circle me-1"></i>
                  El nombre debe ser único y descriptivo de las funciones del rol
                </div>
                
                <div v-if="isSystemRole(formulario.name)" class="alert alert-warning mt-3">
                  <div class="d-flex">
                    <div class="me-3">
                      <i class="fas fa-exclamation-triangle fa-lg"></i>
                    </div>
                    <div>
                      <h6 class="alert-heading">Rol del sistema</h6>
                      <p class="mb-0">Este es un rol del sistema y su nombre no puede ser modificado. Sin embargo, puedes ajustar sus permisos.</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Sección de permisos -->
              <div class="mb-4">
                <div class="d-flex justify-content-between align-items-center mb-3">
                  <label class="form-label fw-bold mb-0">Permisos</label>
                  <div>
                    <button type="button" class="btn btn-sm btn-outline-primary me-1" @click="seleccionarTodos">
                      <i class="fas fa-check-square me-1"></i>Seleccionar todos
                    </button>
                    <button type="button" class="btn btn-sm btn-outline-secondary" @click="deseleccionarTodos">
                      <i class="fas fa-square me-1"></i>Deseleccionar todos
                    </button>
                  </div>
                </div>
                
                <!-- Búsqueda y filtros de permisos -->
                <div class="row g-2 mb-3">
                  <div class="col-md-8">
                    <div class="input-group">
                      <span class="input-group-text"><i class="fas fa-search"></i></span>
                      <input 
                        type="text" 
                        class="form-control" 
                        placeholder="Buscar permisos..." 
                        v-model="permisosSearch"
                        aria-label="Buscar permisos"
                      >
                      <button 
                        v-if="permisosSearch" 
                        class="btn btn-outline-secondary" 
                        type="button" 
                        @click="permisosSearch = ''"
                        aria-label="Limpiar búsqueda de permisos"
                      >
                        <i class="fas fa-times"></i>
                      </button>
                    </div>
                  </div>
                  <div class="col-md-4">
                    <select 
                      class="form-select" 
                      v-model="categoriaSeleccionada"
                      aria-label="Filtrar por categoría"
                    >
                      <option value="">Todas las categorías</option>
                      <option v-for="categoria in categorias" :key="categoria" :value="categoria">
                        {{ categoria }}
                      </option>
                    </select>
                  </div>
                </div>
                
                <!-- Contador de permisos seleccionados -->
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <span class="text-muted small">
                    <i class="fas fa-filter me-1"></i>
                    Mostrando {{ permisosFiltrados.length }} de {{ permisos.length }} permisos
                  </span>
                  <span class="badge bg-primary">
                    {{ formulario.permissions.length }} seleccionados
                  </span>
                </div>
                
                <!-- Lista de permisos -->
                <div class="permissions-container border rounded p-3" style="max-height: 300px; overflow-y: auto;">
                  <div v-if="permisosFiltrados.length === 0" class="text-center py-3 text-muted">
                    <i class="fas fa-search fa-2x mb-2"></i>
                    <p class="mb-0">No se encontraron permisos con ese criterio</p>
                    <button type="button" class="btn btn-sm btn-link" @click="permisosSearch = ''; categoriaSeleccionada = ''">
                      Limpiar filtros
                    </button>
                  </div>
                  
                  <div v-else>
                    <!-- Agrupar por categoría -->
                    <div v-for="categoria in permisosAgrupados" :key="categoria.nombre" class="mb-3">
                      <h6 class="border-bottom pb-2 text-muted">
                        <i class="fas fa-folder me-1"></i>{{ categoria.nombre }}
                      </h6>
                      <div class="row g-2">
                        <div class="col-md-6" v-for="permiso in categoria.permisos" :key="permiso.id">
                          <div class="form-check permission-item p-2 rounded">
                            <input 
                              type="checkbox" 
                              class="form-check-input" 
                              :id="'permiso-' + permiso.id"
                              :value="permiso.name" 
                              v-model="formulario.permissions"
                            >
                            <label class="form-check-label" :for="'permiso-' + permiso.id">
                              {{ permiso.name }}
                            </label>
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
    
    <!-- Modal para ver permisos -->
    <div class="modal fade" id="permisosModal" tabindex="-1" aria-labelledby="permisosModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header bg-info bg-opacity-10">
            <h5 class="modal-title" id="permisosModalLabel">
              <i class="fas fa-key me-2"></i>Permisos del Rol: {{ rolSeleccionado.name }}
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <!-- Búsqueda de permisos -->
            <div class="input-group mb-3">
              <span class="input-group-text"><i class="fas fa-search"></i></span>
              <input 
                type="text" 
                class="form-control" 
                placeholder="Buscar permisos..." 
                v-model="permisosModalSearch"
                aria-label="Buscar permisos en el modal"
              >
              <button 
                v-if="permisosModalSearch" 
                class="btn btn-outline-secondary" 
                type="button" 
                @click="permisosModalSearch = ''"
                aria-label="Limpiar búsqueda de permisos en el modal"
              >
                <i class="fas fa-times"></i>
              </button>
            </div>
            
            <!-- Contador de permisos -->
            <div class="d-flex justify-content-between align-items-center mb-3">
              <span class="text-muted">
                <i class="fas fa-filter me-1"></i>
                Mostrando {{ permisosModalFiltrados.length }} de {{ rolSeleccionado.permissions?.length || 0 }} permisos
              </span>
              <div>
                <button 
                  type="button" 
                  class="btn btn-sm btn-outline-primary" 
                  @click="exportarPermisos"
                  aria-label="Exportar permisos"
                >
                  <i class="fas fa-download me-1"></i>Exportar
                </button>
              </div>
            </div>
            
            <!-- Lista de permisos -->
            <div v-if="rolSeleccionado.permissions && rolSeleccionado.permissions.length > 0">
              <!-- Agrupar por categoría -->
              <div v-for="categoria in permisosModalAgrupados" :key="categoria.nombre" class="mb-4">
                <h6 class="border-bottom pb-2 d-flex align-items-center">
                  <i class="fas fa-folder me-2 text-info"></i>
                  <span>{{ categoria.nombre }}</span>
                  <span class="badge bg-info ms-2">{{ categoria.permisos.length }}</span>
                </h6>
                
                <div class="row g-3">
                  <div class="col-md-6" v-for="permiso in categoria.permisos" :key="permiso.id">
                    <div class="card border h-100 permission-card">
                      <div class="card-body p-2">
                        <div class="d-flex align-items-center">
                          <div class="permission-icon me-2">
                            <i class="fas fa-check-circle text-success"></i>
                          </div>
                          <div>
                            <h6 class="mb-0">{{ permiso.name }}</h6>
                            <small class="text-muted">{{ getPermissionDescription(permiso.name) }}</small>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Si no hay resultados en la búsqueda -->
              <div v-if="permisosModalFiltrados.length === 0" class="text-center py-4">
                <i class="fas fa-search fa-2x text-muted mb-3"></i>
                <h5 class="text-muted">No se encontraron permisos</h5>
                <p class="text-muted">Intenta con otra búsqueda</p>
                <button type="button" class="btn btn-sm btn-outline-secondary" @click="permisosModalSearch = ''">
                  Limpiar búsqueda
                </button>
              </div>
            </div>
            
            <!-- Si el rol no tiene permisos -->
            <div v-else class="text-center py-4">
              <div class="empty-state-icon mb-3">
                <i class="fas fa-exclamation-circle fa-3x text-warning"></i>
              </div>
              <h5 class="text-muted">Este rol no tiene permisos asignados</h5>
              <p class="text-muted mb-3">Los usuarios con este rol no tendrán acceso a ninguna funcionalidad restringida.</p>
              <button type="button" class="btn btn-primary" @click="mostrar(rolSeleccionado.id)">
                <i class="fas fa-edit me-1"></i>Editar Rol
              </button>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
              <i class="fas fa-times me-1"></i>Cerrar
            </button>
            <button type="button" class="btn btn-primary" @click="mostrar(rolSeleccionado.id)">
              <i class="fas fa-edit me-1"></i>Editar Rol
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Modal de confirmación para eliminar -->
    <div class="modal fade" id="confirmDeleteModal" tabindex="-1" aria-labelledby="confirmDeleteModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header bg-danger text-white">
            <h5 class="modal-title" id="confirmDeleteModalLabel">
              <i class="fas fa-exclamation-triangle me-2"></i>Confirmar eliminación
            </h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class="text-center mb-4">
              <div class="delete-icon mb-3">
                <i class="fas fa-trash-alt fa-4x text-danger"></i>
              </div>
              <h4>¿Está seguro de eliminar este rol?</h4>
              <p class="mb-0">Está a punto de eliminar el rol <strong>{{ rolAEliminar.name }}</strong>.</p>
              <p class="text-danger">Esta acción no se puede deshacer.</p>
            </div>
            
            <div class="alert alert-warning">
              <div class="d-flex">
                <div class="me-3">
                  <i class="fas fa-info-circle fa-lg"></i>
                </div>
                <div>
                  <h6 class="alert-heading">Importante</h6>
                  <p class="mb-0">Si hay usuarios asignados a este rol, perderán los permisos asociados y podrían perder acceso a ciertas funcionalidades del sistema.</p>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
              <i class="fas fa-times me-1"></i>Cancelar
            </button>
            <button type="button" class="btn btn-danger" @click="eliminarRol(rolAEliminar.id)">
              <i class="fas fa-trash me-1"></i>Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Toast de notificación -->
    <div class="position-fixed bottom-0 end-0 p-3" style="z-index: 11">
      <div id="liveToast" class="toast hide" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="toast-header" :class="toastType === 'success' ? 'bg-success text-white' : 'bg-danger text-white'">
          <i class="fas" :class="toastType === 'success' ? 'fa-check-circle me-2' : 'fa-exclamation-circle me-2'"></i>
          <strong class="me-auto">{{ toastTitle }}</strong>
          <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
        <div class="toast-body">
          {{ toastMessage }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { Modal, Toast } from 'bootstrap/dist/js/bootstrap.bundle.min';
import { destroyRol, indexPermisos, indexRoles, showRolesAndPermisos, storeRol, updateRolAndPermisos } from '@/Services/RolesPermisosService';

// Estado
const roles = ref([]);
const permisos = ref([]);
const search = ref('');
const posicion = ref('');
const formulario = ref({
  name: '',
  permissions: []
});
const errors = ref({});
const viewMode = ref('table');
const windowWidth = ref(window.innerWidth);
const permisosSearch = ref('');
const categoriaSeleccionada = ref('');
const rolSeleccionado = ref({});
const permisosModalSearch = ref('');
const rolAEliminar = ref({});
const sortField = ref('id');
const sortDirection = ref('asc');
const toastType = ref('success');
const toastTitle = ref('');
const toastMessage = ref('');

// Referencias a modales
let rolModal = null;
let permisosModal = null;
let confirmDeleteModal = null;
let liveToast = null;

// Actualizar el ancho de la ventana cuando cambia el tamaño
const actualizarAnchoPantalla = () => {
  windowWidth.value = window.innerWidth;
};

// Computed properties
const rolesFiltrados = computed(() => {
  let result = roles.value;
  
  // Filtrar por búsqueda
  if (search.value) {
    const searchLower = search.value.toLowerCase();
    result = result.filter(rol => 
      rol.name.toLowerCase().includes(searchLower)
    );
  }
  
  // Ordenar
  return result.sort((a, b) => {
    let valueA, valueB;
    
    switch (sortField.value) {
      case 'name':
        valueA = a.name.toLowerCase();
        valueB = b.name.toLowerCase();
        break;
      case 'permissions':
        valueA = a.permissions.length;
        valueB = b.permissions.length;
        break;
      case 'id':
      default:
        valueA = a.id;
        valueB = b.id;
    }
    
    if (sortDirection.value === 'asc') {
      return valueA > valueB ? 1 : -1;
    } else {
      return valueA < valueB ? 1 : -1;
    }
  });
});

const categorias = computed(() => {
  // Extraer categorías únicas de los permisos
  const categoriasSet = new Set();
  
  permisos.value.forEach(permiso => {
    const categoria = getCategoriaPermiso(permiso.name);
    categoriasSet.add(categoria);
  });
  
  return Array.from(categoriasSet);
});

const permisosFiltrados = computed(() => {
  let result = permisos.value;
  
  // Filtrar por búsqueda
  if (permisosSearch.value) {
    const searchLower = permisosSearch.value.toLowerCase();
    result = result.filter(permiso => 
      permiso.name.toLowerCase().includes(searchLower)
    );
  }
  
  // Filtrar por categoría
  if (categoriaSeleccionada.value) {
    result = result.filter(permiso => 
      getCategoriaPermiso(permiso.name) === categoriaSeleccionada.value
    );
  }
  
  return result;
});

const permisosAgrupados = computed(() => {
  // Agrupar permisos filtrados por categoría
  const grupos = {};
  
  permisosFiltrados.value.forEach(permiso => {
    const categoria = getCategoriaPermiso(permiso.name);
    if (!grupos[categoria]) {
      grupos[categoria] = [];
    }
    grupos[categoria].push(permiso);
  });
  
  // Convertir a array para v-for
  return Object.keys(grupos).map(nombre => ({
    nombre,
    permisos: grupos[nombre]
  }));
});

const permisosModalFiltrados = computed(() => {
  if (!rolSeleccionado.value.permissions) return [];
  
  if (!permisosModalSearch.value) return rolSeleccionado.value.permissions;
  
  const searchLower = permisosModalSearch.value.toLowerCase();
  return rolSeleccionado.value.permissions.filter(permiso => 
    permiso.name.toLowerCase().includes(searchLower)
  );
});

const permisosModalAgrupados = computed(() => {
  // Agrupar permisos del modal por categoría
  const grupos = {};
  
  permisosModalFiltrados.value.forEach(permiso => {
    const categoria = getCategoriaPermiso(permiso.name);
    if (!grupos[categoria]) {
      grupos[categoria] = [];
    }
    grupos[categoria].push(permiso);
  });
  
  // Convertir a array para v-for
  return Object.keys(grupos).map(nombre => ({
    nombre,
    permisos: grupos[nombre]
  }));
});

const formularioValido = computed(() => {
  return !!formulario.value.name;
});

// Lifecycle hooks
onMounted(() => {
  rolModal = new Modal(document.getElementById('rolModal'));
  permisosModal = new Modal(document.getElementById('permisosModal'));
  confirmDeleteModal = new Modal(document.getElementById('confirmDeleteModal'));
  liveToast = new Toast(document.getElementById('liveToast'));
  
  listarRoles();
  listarPermisos();
  
  // Agregar event listener para el cambio de tamaño de ventana
  window.addEventListener('resize', actualizarAnchoPantalla);
});

onUnmounted(() => {
  // Eliminar event listener cuando el componente se desmonta
  window.removeEventListener('resize', actualizarAnchoPantalla);
});

// Métodos
const listarRoles = async () => {
  try {
    const { data } = await indexRoles();
    roles.value = data.datos;
    showToast('success', 'Datos cargados', 'Los roles se han cargado correctamente');
  } catch (error) {
    console.error('Error al cargar roles:', error);
    showToast('error', 'Error', 'No se pudieron cargar los roles');
  }
};

const listarPermisos = async () => {
  try {
    const { data } = await indexPermisos();
    permisos.value = data.datos;
  } catch (error) {
    console.error('Error al cargar permisos:', error);
    showToast('error', 'Error', 'No se pudieron cargar los permisos');
  }
};

const abrirModal = () => {
  posicion.value = '';
  formulario.value = {
    name: '',
    permissions: []
  };
  errors.value = {};
  permisosSearch.value = '';
  categoriaSeleccionada.value = '';
  rolModal.show();
};

const validarFormulario = () => {
  // Validar campos requeridos
  const form = document.getElementById('rolForm');
  
  if (!form.checkValidity()) {
    form.classList.add('was-validated');
    return false;
  }
  
  // Validaciones adicionales
  let esValido = true;
  errors.value = {};
  
  if (!formulario.value.name) {
    errors.value.name = ['El campo nombre es obligatorio.'];
    esValido = false;
  }
  
  return esValido;
};

const validarYGuardar = () => {
  if (validarFormulario()) {
    guardarRol();
  } else {
    // Scroll al primer error
    setTimeout(() => {
      const primerError = document.querySelector('.is-invalid');
      if (primerError) {
        primerError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        primerError.focus();
      }
    }, 100);
  }
};

const guardarRol = async () => {
  errors.value = {};
  try {
    if (posicion.value) {
      await updateRolAndPermisos(posicion.value, formulario.value);
      showToast('success', 'Rol actualizado', 'El rol se ha actualizado correctamente');
    } else {
      await storeRol(formulario.value);
      showToast('success', 'Rol creado', 'El rol se ha creado correctamente');
    }
    await listarRoles();
    rolModal.hide();
  } catch (error) {
    if (error.response && error.response.status === 422) {
      errors.value = error.response.data.errors;
      
      // Scroll al primer error
      setTimeout(() => {
        const primerError = document.querySelector('.is-invalid');
        if (primerError) {
          primerError.scrollIntoView({ behavior: 'smooth', block: 'center' });
          primerError.focus();
        }
      }, 100);
    } else {
      console.error('Error al guardar rol:', error);
      showToast('error', 'Error', 'No se pudo guardar el rol');
    }
  }
};

const confirmarEliminar = (rol) => {
  rolAEliminar.value = rol;
  confirmDeleteModal.show();
};

const eliminarRol = async (id) => {
  try {
    await destroyRol(id);
    await listarRoles();
    confirmDeleteModal.hide();
    showToast('success', 'Rol eliminado', 'El rol ha sido eliminado correctamente');
  } catch (error) {
    console.error('Error al eliminar rol:', error);
    showToast('error', 'Error', 'No se pudo eliminar el rol');
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
    permisosSearch.value = '';
    categoriaSeleccionada.value = '';
    
    // Si el modal de permisos está abierto, cerrarlo
    if (permisosModal._isShown) {
      permisosModal.hide();
    }
    
    rolModal.show();
  } catch (error) {
    console.error('Error al obtener rol:', error);
    showToast('error', 'Error', 'No se pudo cargar el rol');
  }
};

const mostrarPermisos = (rol) => {
  rolSeleccionado.value = rol;
  permisosModalSearch.value = '';
  permisosModal.show();
};

const filtrarRoles = () => {
  // La función computed 'rolesFiltrados' se encargará de filtrar automáticamente
};

const seleccionarTodos = () => {
  formulario.value.permissions = permisos.value.map(permiso => permiso.name);
};

const deseleccionarTodos = () => {
  formulario.value.permissions = [];
};

const getCategoriaPermiso = (nombrePermiso) => {
  // Extraer la categoría del nombre del permiso (generalmente antes del primer punto o guion)
  const parts = nombrePermiso.split(/[.-]/);
  return parts[0] || 'General';
};

const getPermissionDescription = (nombrePermiso) => {
  // Generar una descripción legible del permiso
  const parts = nombrePermiso.split(/[.-]/);
  if (parts.length < 2) return 'Permiso general';
  
  const action = parts[parts.length - 1];
  const resource = parts.slice(1, -1).join(' ');
  
  const actionMap = {
    'index': 'Ver listado de',
    'show': 'Ver detalles de',
    'create': 'Crear',
    'store': 'Guardar',
    'edit': 'Editar',
    'update': 'Actualizar',
    'destroy': 'Eliminar',
    'delete': 'Eliminar',
    'list': 'Listar',
    'view': 'Ver',
    'manage': 'Gestionar'
  };
  
  return `${actionMap[action] || action} ${resource || parts[0]}`;
};

const toggleSort = (field) => {
  if (sortField.value === field) {
    // Si ya estamos ordenando por este campo, cambiar la dirección
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
  } else {
    // Si es un nuevo campo, establecer como ascendente por defecto
    sortField.value = field;
    sortDirection.value = 'asc';
  }
};

const getSortIcon = (field) => {
  if (sortField.value !== field) {
    return 'fa-sort';
  }
  return sortDirection.value === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
};

const isSystemRole = (roleName) => {
  // Verificar si es un rol del sistema que no debe ser eliminado
  const systemRoles = ['admin', 'superadmin', 'administrator', 'super-admin'];
  return systemRoles.includes(roleName?.toLowerCase());
};

const getRoleIcon = (roleName) => {
  // Devolver un icono apropiado según el nombre del rol
  const roleLower = roleName?.toLowerCase() || '';
  
  if (roleLower.includes('admin')) return 'fa-user-shield text-primary';
  if (roleLower.includes('editor')) return 'fa-edit text-info';
  if (roleLower.includes('user')) return 'fa-user text-success';
  if (roleLower.includes('guest')) return 'fa-user-clock text-warning';
  if (roleLower.includes('manager')) return 'fa-user-tie text-dark';
  
  return 'fa-user-tag text-primary';
};

const exportarPermisos = () => {
  if (!rolSeleccionado.value.permissions || rolSeleccionado.value.permissions.length === 0) {
    showToast('error', 'Error', 'No hay permisos para exportar');
    return;
  }
  
  // Crear un texto con los permisos
  const permisosList = rolSeleccionado.value.permissions.map(p => p.name).join('\n');
  const blob = new Blob([permisosList], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  
  // Crear un enlace para descargar
  const a = document.createElement('a');
  a.href = url;
  a.download = `permisos_${rolSeleccionado.value.name}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  showToast('success', 'Exportación completada', 'Los permisos se han exportado correctamente');
};

// Función para mostrar notificaciones toast
const showToast = (type, title, message) => {
  toastType.value = type;
  toastTitle.value = title;
  toastMessage.value = message;
  liveToast.show();
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

/* Estilos para los iconos de roles y permisos */
.role-icon, .permission-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: rgba(13, 110, 253, 0.1);
}

.role-icon-system {
  background-color: rgba(13, 110, 253, 0.2);
}

.permission-icon {
  background-color: rgba(25, 135, 84, 0.1);
}

.fw-medium {
  font-weight: 500;
}

/* Estilos para los items de permisos */
.permission-item {
  transition: background-color 0.2s ease;
}

.permission-item:hover {
  background-color: rgba(13, 110, 253, 0.05);
}

.permission-item .form-check-input:checked ~ .form-check-label {
  font-weight: 500;
  color: var(--bs-primary);
}

/* Estilos para las etiquetas de permisos */
.permission-tags {
  max-height: 100px;
  overflow-y: auto;
}

/* Estilos para las tarjetas de permisos */
.permission-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.permission-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 0.25rem 0.5rem rgba(0, 0, 0, 0.1);
}

/* Estilos para los iconos de estado vacío */
.empty-state-icon, .delete-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: rgba(108, 117, 125, 0.1);
}

.delete-icon {
  background-color: rgba(220, 53, 69, 0.1);
}

/* Animaciones */
.btn {
  transition: all 0.2s ease-in-out;
}

.btn:hover:not(:disabled) {
  transform: translateY(-2px);
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

/* Toast personalizado */
.toast-header {
  padding: 0.5rem 0.75rem;
}

.toast-header .btn-close {
  filter: brightness(0) invert(1);
}

/* Estilos para botones deshabilitados */
.btn:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

/* Estilos para la tabla */
.table th, .table td {
  vertical-align: middle;
}

/* Estilos para el scrollbar personalizado */
.permissions-container::-webkit-scrollbar {
  width: 8px;
}

.permissions-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.permissions-container::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 4px;
}

.permissions-container::-webkit-scrollbar-thumb:hover {
  background: #aaa;
}
</style>