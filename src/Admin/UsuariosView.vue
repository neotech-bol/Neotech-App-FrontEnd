<template>
    <div class="container-fluid py-4">
        <div class="card shadow">
            <div
                class="card-header bg-primary bg-opacity-10 d-flex justify-content-between align-items-center flex-wrap gap-3 p-3">
                <h2 class="card-title h4 m-0">
                    <i class="fas fa-users me-2"></i>Gestión de Usuarios
                </h2>
                <div>
                    <button class="btn btn-primary" @click="abrirModal()">
                        <i class="fas fa-user-plus me-2"></i>Agregar Usuario
                    </button>
                    <button class="btn btn-outline-secondary ms-2" @click="exportarUsuarios()">
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
                        <input type="text" class="form-control" placeholder="Buscar por nombre, email o CI..."
                            v-model="search" @input="listarUsuarios">
                        <button class="btn btn-outline-secondary" type="button" @click="search = ''; listarUsuarios()"
                            v-if="search">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>

                    <!-- Contador de resultados y filtros -->
                    <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                        <p class="text-muted mb-0">
                            <i class="fas fa-list-ul me-1"></i>
                            Mostrando {{ datos.length }} usuarios
                        </p>
                        <div class="d-flex gap-2 flex-wrap">
                            <div class="btn-group">
                                <button class="btn btn-sm"
                                    :class="vistaActual === 'tabla' ? 'btn-primary' : 'btn-outline-primary'"
                                    @click="vistaActual = 'tabla'">
                                    <i class="fas fa-table me-1"></i>Tabla
                                </button>
                                <button class="btn btn-sm"
                                    :class="vistaActual === 'tarjetas' ? 'btn-primary' : 'btn-outline-primary'"
                                    @click="vistaActual = 'tarjetas'">
                                    <i class="fas fa-th-large me-1"></i>Tarjetas
                                </button>
                            </div>
                            <select class="form-select form-select-sm" v-model="filtroRol" @change="aplicarFiltros()"
                                style="width: auto;">
                                <option value="">Todos los roles</option>
                                <option :value="item.name" v-for="item in roles" :key="item.id">{{ item.name }}</option>
                            </select>
                            <select class="form-select form-select-sm" v-model="filtroEstado" @change="aplicarFiltros()"
                                style="width: auto;">
                                <option value="">Todos los estados</option>
                                <option value="1">Activos</option>
                                <option value="0">Inactivos</option>
                            </select>
                        </div>
                    </div>
                </div>

                <!-- Mensaje cuando no hay resultados -->
                <div v-if="usuariosFiltrados.length === 0" class="text-center py-5">
                    <i class="fas fa-user-slash fa-3x text-muted mb-3"></i>
                    <h5 class="text-muted">No se encontraron usuarios</h5>
                    <p class="text-muted">Intenta con otra búsqueda o agrega un nuevo usuario</p>
                    <button class="btn btn-primary mt-2" @click="abrirModal()">
                        <i class="fas fa-user-plus me-2"></i>Agregar Usuario
                    </button>
                </div>

                <!-- Table view -->
                <div class="table-responsive"
                    v-if="usuariosFiltrados.length > 0 && (vistaActual === 'tabla' || windowWidth >= 768)">
                    <table class="table table-hover align-middle mb-0">
                        <thead class="bg-light">
                            <tr>
                                <th class="px-3">
                                    <div class="d-flex align-items-center">
                                        <span>ID</span>
                                        <button class="btn btn-sm text-primary border-0 p-0 ms-1"
                                            @click="ordenarPor('id')">
                                            <i class="fas" :class="getIconoOrdenamiento('id')"></i>
                                        </button>
                                    </div>
                                </th>
                                <th class="px-3">
                                    <div class="d-flex align-items-center">
                                        <span>Nombre</span>
                                        <button class="btn btn-sm text-primary border-0 p-0 ms-1"
                                            @click="ordenarPor('nombre')">
                                            <i class="fas" :class="getIconoOrdenamiento('nombre')"></i>
                                        </button>
                                    </div>
                                </th>
                                <th class="px-3">Email</th>
                                <th class="px-3">CI</th>
                                <th class="px-3">
                                    <div class="d-flex align-items-center">
                                        <span>Rol</span>
                                        <button class="btn btn-sm text-primary border-0 p-0 ms-1"
                                            @click="ordenarPor('rol')">
                                            <i class="fas" :class="getIconoOrdenamiento('rol')"></i>
                                        </button>
                                    </div>
                                </th>
                                <th class="px-3">Estado</th>
                                <th class="px-3">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="item in usuariosFiltrados" :key="item.id">
                                <td>{{ item.id }}</td>
                                <td>
                                    <div class="d-flex align-items-center">
                                        <div class="user-avatar me-2">
                                            <div class="avatar-circle"
                                                :style="{ backgroundColor: getAvatarColor(item.nombre) }">
                                                {{ getInitials(item.nombre, item.apellido) }}
                                            </div>
                                        </div>
                                        <div>
                                            <div class="fw-medium">{{ item.nombre }} {{ item.apellido }}</div>
                                            <small class="text-muted">{{ item.telefono }}</small>
                                        </div>
                                    </div>
                                </td>
                                <td>{{ item.email }}</td>
                                <td>{{ item.ci }}</td>
                                <td>
                                    <span class="badge bg-primary bg-opacity-10 text-primary">
                                        {{ item.roles[0]?.name || 'Sin rol' }}
                                    </span>
                                </td>
                                <td>
                                    <span class="badge" :class="item.estado == true ? 'bg-success' : 'bg-danger'">
                                        {{ item.estado ? 'Activo' : 'Inactivo' }}
                                    </span>
                                </td>
                                <td>
                                    <div class="btn-group">
                                        <button class="btn btn-sm btn-outline-primary" @click="mostarUser(item.id)"
                                            title="Editar">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        <button class="btn btn-sm"
                                            :class="item.estado ? 'btn-outline-danger' : 'btn-outline-success'"
                                            @click="cambiarEstado(item.id)"
                                            :title="item.estado ? 'Desactivar' : 'Activar'">
                                            <i class="fas" :class="item.estado ? 'fa-user-slash' : 'fa-user-check'"></i>
                                        </button>
                                        <button class="btn btn-sm btn-outline-info" @click="verDetalles(item)"
                                            title="Ver detalles">
                                            <i class="fas fa-info-circle"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- Cards view -->
                <div v-if="usuariosFiltrados.length > 0 && (vistaActual === 'tarjetas' || windowWidth < 768)">
                    <div class="row g-3 p-3">
                        <div class="col-md-6 col-lg-4" v-for="item in usuariosFiltrados" :key="item.id">
                            <div class="card h-100 border-0 shadow-sm hover-card">
                                <div class="card-header bg-light d-flex justify-content-between align-items-center">
                                    <div class="d-flex align-items-center">
                                        <div class="avatar-circle me-2"
                                            :style="{ backgroundColor: getAvatarColor(item.nombre) }">
                                            {{ getInitials(item.nombre, item.apellido) }}
                                        </div>
                                        <h5 class="card-title mb-0">{{ item.nombre }} {{ item.apellido }}</h5>
                                    </div>
                                    <span class="badge" :class="item.estado ? 'bg-success' : 'bg-danger'">
                                        {{ item.estado ? 'Activo' : 'Inactivo' }}
                                    </span>
                                </div>
                                <div class="card-body">
                                    <ul class="list-group list-group-flush mb-3">
                                        <li class="list-group-item d-flex justify-content-between px-0">
                                            <span class="text-muted"><i class="fas fa-envelope me-2"></i>Email:</span>
                                            <span>{{ item.email }}</span>
                                        </li>
                                        <li class="list-group-item d-flex justify-content-between px-0">
                                            <span class="text-muted"><i class="fas fa-id-card me-2"></i>CI:</span>
                                            <span>{{ item.ci }}</span>
                                        </li>
                                        <li class="list-group-item d-flex justify-content-between px-0">
                                            <span class="text-muted"><i class="fas fa-phone me-2"></i>Teléfono:</span>
                                            <span>{{ item.telefono }}</span>
                                        </li>
                                        <li class="list-group-item d-flex justify-content-between px-0">
                                            <span class="text-muted"><i class="fas fa-user-tag me-2"></i>Rol:</span>
                                            <span class="badge bg-primary bg-opacity-10 text-primary">
                                                {{ item.roles[0]?.name || 'Sin rol' }}
                                            </span>
                                        </li>
                                    </ul>
                                    <div class="text-muted small">
                                        <div>ID: {{ item.id }}</div>
                                        <div>Género: {{ formatearGenero(item.genero) }}</div>
                                        <div>Edad: {{ item.edad }} años</div>
                                    </div>
                                </div>
                                <div class="card-footer bg-white border-top-0">
                                    <div class="d-flex justify-content-between">
                                        <button class="btn btn-sm btn-outline-primary" @click="mostarUser(item.id)">
                                            <i class="fas fa-edit me-1"></i>Editar
                                        </button>
                                        <button class="btn btn-sm"
                                            :class="item.estado ? 'btn-outline-danger' : 'btn-outline-success'"
                                            @click="cambiarEstado(item.id)">
                                            <i class="fas me-1"
                                                :class="item.estado ? 'fa-user-slash' : 'fa-user-check'"></i>
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

        <!-- Modal para agregar/editar usuario -->
        <div class="modal fade" id="userModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header"
                        :class="posicion ? 'bg-warning bg-opacity-10' : 'bg-primary bg-opacity-10'">
                        <h5 class="modal-title">
                            <i class="fas" :class="posicion ? 'fa-user-edit me-2' : 'fa-user-plus me-2'"></i>
                            {{ posicion ? 'Editar Usuario' : 'Nuevo Usuario' }}
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
                                    <p class="mb-0">Los campos marcados con <span class="text-danger fw-bold">*</span>
                                        son obligatorios.</p>
                                </div>
                            </div>
                        </div>

                        <form @submit.prevent="guardarUserAndUpdate" id="userForm" class="needs-validation" novalidate>
                            <div class="row g-3">
                                <!-- Información personal -->
                                <div class="col-12">
                                    <div class="card border-0 bg-light mb-3">
                                        <div class="card-header bg-primary bg-opacity-10">
                                            <h5 class="mb-0">
                                                <i class="fas fa-user me-2"></i>Información personal
                                            </h5>
                                        </div>
                                        <div class="card-body">
                                            <div class="row g-3">
                                                <div class="col-md-6">
                                                    <label for="nombre" class="form-label fw-bold">Nombre <span
                                                            class="text-danger">*</span></label>
                                                    <div class="input-group">
                                                        <span class="input-group-text"><i
                                                                class="fas fa-user"></i></span>
                                                        <input type="text" class="form-control"
                                                            :class="{ 'is-invalid': errors?.nombre }" id="nombre"
                                                            v-model="formulario.nombre" placeholder="Ej: Juan" required>
                                                        <div class="invalid-feedback" v-if="errors.nombre">
                                                            {{ errors.nombre[0] }}
                                                        </div>
                                                        <div class="invalid-feedback" v-else>
                                                            El nombre es obligatorio
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="col-md-6">
                                                    <label for="apellido" class="form-label fw-bold">Apellido <span
                                                            class="text-danger">*</span></label>
                                                    <div class="input-group">
                                                        <span class="input-group-text"><i
                                                                class="fas fa-user"></i></span>
                                                        <input type="text" class="form-control"
                                                            :class="{ 'is-invalid': errors?.apellido }" id="apellido"
                                                            v-model="formulario.apellido" placeholder="Ej: Pérez"
                                                            required>
                                                        <div class="invalid-feedback" v-if="errors.apellido">
                                                            {{ errors.apellido[0] }}
                                                        </div>
                                                        <div class="invalid-feedback" v-else>
                                                            El apellido es obligatorio
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="col-md-6">
                                                    <label for="ci" class="form-label fw-bold">CI <span
                                                            class="text-danger">*</span></label>
                                                    <div class="input-group">
                                                        <span class="input-group-text"><i
                                                                class="fas fa-id-card"></i></span>
                                                        <input type="text" class="form-control"
                                                            :class="{ 'is-invalid': errors?.ci }" id="ci"
                                                            v-model="formulario.ci" placeholder="Ej: 12345678" required>
                                                        <div class="invalid-feedback" v-if="errors.ci">
                                                            {{ errors.ci[0] }}
                                                        </div>
                                                        <div class="invalid-feedback" v-else>
                                                            El CI es obligatorio
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="col-md-6">
                                                    <label for="nit" class="form-label fw-bold">NIT</label>
                                                    <div class="input-group">
                                                        <span class="input-group-text"><i
                                                                class="fas fa-building"></i></span>
                                                        <input type="text" class="form-control"
                                                            :class="{ 'is-invalid': errors?.nit }" id="nit"
                                                            v-model="formulario.nit" placeholder="Ej: 12345678">
                                                        <div class="invalid-feedback" v-if="errors.nit">
                                                            {{ errors.nit[0] }}
                                                        </div>
                                                    </div>
                                                    <small class="text-muted">Opcional</small>
                                                </div>
                                                <div class="col-md-6">
                                                    <label for="edad" class="form-label fw-bold">Edad <span
                                                            class="text-danger">*</span></label>
                                                    <div class="input-group">
                                                        <span class="input-group-text"><i
                                                                class="fas fa-birthday-cake"></i></span>
                                                        <input type="number" class="form-control"
                                                            :class="{ 'is-invalid': errors?.edad }" id="edad"
                                                            v-model="formulario.edad" placeholder="Ej: 30" min="18"
                                                            max="100" required>
                                                        <div class="invalid-feedback" v-if="errors.edad">
                                                            {{ errors.edad[0] }}
                                                        </div>
                                                        <div class="invalid-feedback" v-else>
                                                            La edad es obligatoria
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="col-md-6">
                                                    <label for="genero" class="form-label fw-bold">Género <span
                                                            class="text-danger">*</span></label>
                                                    <div class="input-group">
                                                        <span class="input-group-text"><i
                                                                class="fas fa-venus-mars"></i></span>
                                                        <select class="form-select"
                                                            :class="{ 'is-invalid': errors?.genero }" id="genero"
                                                            v-model="formulario.genero" required>
                                                            <option value="">Seleccione</option>
                                                            <option value="M">Masculino</option>
                                                            <option value="F">Femenino</option>
                                                            <option value="O">Otro</option>
                                                        </select>
                                                        <div class="invalid-feedback" v-if="errors.genero">
                                                            {{ errors.genero[0] }}
                                                        </div>
                                                        <div class="invalid-feedback" v-else>
                                                            Debe seleccionar un género
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Información de contacto -->
                                <div class="col-12">
                                    <div class="card border-0 bg-light mb-3">
                                        <div class="card-header bg-primary bg-opacity-10">
                                            <h5 class="mb-0">
                                                <i class="fas fa-address-book me-2"></i>Información de contacto
                                            </h5>
                                        </div>
                                        <div class="card-body">
                                            <div class="row g-3">
                                                <div class="col-md-6">
                                                    <label for="telefono" class="form-label fw-bold">Teléfono <span
                                                            class="text-danger">*</span></label>
                                                    <div class="input-group">
                                                        <span class="input-group-text"><i
                                                                class="fas fa-phone"></i></span>
                                                        <input type="tel" class="form-control"
                                                            :class="{ 'is-invalid': errors?.telefono }" id="telefono"
                                                            v-model="formulario.telefono" placeholder="Ej: 70123456"
                                                            required>
                                                        <div class="invalid-feedback" v-if="errors.telefono">
                                                            {{ errors.telefono[0] }}
                                                        </div>
                                                        <div class="invalid-feedback" v-else>
                                                            El teléfono es obligatorio
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="col-md-6">
                                                    <label for="email" class="form-label fw-bold">Email <span
                                                            class="text-danger">*</span></label>
                                                    <div class="input-group">
                                                        <span class="input-group-text"><i
                                                                class="fas fa-envelope"></i></span>
                                                        <input type="email" class="form-control"
                                                            :class="{ 'is-invalid': errors?.email }" id="email"
                                                            v-model="formulario.email"
                                                            placeholder="Ej: usuario@ejemplo.com" required>
                                                        <div class="invalid-feedback" v-if="errors.email">
                                                            {{ errors.email[0] }}
                                                        </div>
                                                        <div class="invalid-feedback" v-else>
                                                            El email es obligatorio y debe ser válido
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="col-12">
                                                    <label for="direccion" class="form-label fw-bold">Dirección <span
                                                            class="text-danger">*</span></label>
                                                    <div class="input-group">
                                                        <span class="input-group-text"><i
                                                                class="fas fa-map-marker-alt"></i></span>
                                                        <textarea class="form-control"
                                                            :class="{ 'is-invalid': errors?.direccion }" id="direccion"
                                                            v-model="formulario.direccion"
                                                            placeholder="Ej: Calle Principal #123, Zona Central"
                                                            rows="3" required></textarea>
                                                        <div class="invalid-feedback" v-if="errors.direccion">
                                                            {{ errors.direccion[0] }}
                                                        </div>
                                                        <div class="invalid-feedback" v-else>
                                                            La dirección es obligatoria
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Información de acceso -->
                                <div class="col-12">
                                    <div class="card border-0 bg-light">
                                        <div class="card-header bg-primary bg-opacity-10">
                                            <h5 class="mb-0">
                                                <i class="fas fa-lock me-2"></i>Información de acceso
                                            </h5>
                                        </div>
                                        <div class="card-body">
                                            <div class="row g-3">
                                                <div class="col-md-6">
                                                    <label for="role" class="form-label fw-bold">Rol <span
                                                            class="text-danger">*</span></label>
                                                    <div class="input-group">
                                                        <span class="input-group-text"><i
                                                                class="fas fa-user-tag"></i></span>
                                                        <select class="form-select"
                                                            :class="{ 'is-invalid': errors?.role }" id="role"
                                                            v-model="formulario.role" required>
                                                            <option value="">Seleccione un rol</option>
                                                            <option :value="item.name" v-for="item in roles"
                                                                :key="item.id">{{ item.name }}</option>
                                                        </select>
                                                        <div class="invalid-feedback" v-if="errors.role">
                                                            {{ errors.role[0] }}
                                                        </div>
                                                        <div class="invalid-feedback" v-else>
                                                            Debe seleccionar un rol
                                                        </div>
                                                    </div>
                                                    <small class="text-muted">El rol determina los permisos del usuario
                                                        en el sistema</small>
                                                </div>
                                                <!--                           <div class="col-md-6" v-if="!posicion">
                            <div class="alert alert-warning">
                              <i class="fas fa-info-circle me-2"></i>
                              <strong>Nota:</strong> La contraseña se generará automáticamente y se enviará al correo electrónico del usuario.
                            </div>
                          </div> -->
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
                                <button type="button" class="btn" :class="posicion ? 'btn-warning' : 'btn-primary'"
                                    @click="validarYGuardar">
                                    <i class="fas" :class="posicion ? 'fa-save me-1' : 'fa-user-plus me-1'"></i>
                                    {{ posicion ? 'Actualizar' : 'Guardar' }}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Modal de detalles del usuario -->
        <div class="modal fade" id="detallesModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header bg-info bg-opacity-10">
                        <h5 class="modal-title">
                            <i class="fas fa-info-circle me-2"></i>Detalles del Usuario
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body" v-if="usuarioSeleccionado">
                        <div class="row">
                            <div class="col-md-4 text-center mb-4 mb-md-0">
                                <div class="avatar-circle-lg mx-auto mb-3"
                                    :style="{ backgroundColor: getAvatarColor(usuarioSeleccionado.nombre) }">
                                    {{ getInitials(usuarioSeleccionado.nombre, usuarioSeleccionado.apellido) }}
                                </div>
                                <h4>{{ usuarioSeleccionado.nombre }} {{ usuarioSeleccionado.apellido }}</h4>
                                <p class="badge bg-primary bg-opacity-10 text-primary">
                                    {{ usuarioSeleccionado.roles[0]?.name || 'Sin rol' }}
                                </p>
                                <p>
                                    <span class="badge"
                                        :class="usuarioSeleccionado.estado ? 'bg-success' : 'bg-danger'">
                                        {{ usuarioSeleccionado.estado ? 'Activo' : 'Inactivo' }}
                                    </span>
                                </p>
                            </div>
                            <div class="col-md-8">
                                <div class="card border-0 shadow-sm mb-3">
                                    <div class="card-header bg-light">
                                        <h5 class="mb-0">
                                            <i class="fas fa-user me-2"></i>Información personal
                                        </h5>
                                    </div>
                                    <div class="card-body">
                                        <ul class="list-group list-group-flush">
                                            <li
                                                class="list-group-item d-flex justify-content-between align-items-center">
                                                <span><i class="fas fa-id-card me-2"></i>CI:</span>
                                                <span>{{ usuarioSeleccionado.ci }}</span>
                                            </li>
                                            <li
                                                class="list-group-item d-flex justify-content-between align-items-center">
                                                <span><i class="fas fa-building me-2"></i>NIT:</span>
                                                <span>{{ usuarioSeleccionado.nit || 'No especificado' }}</span>
                                            </li>
                                            <li
                                                class="list-group-item d-flex justify-content-between align-items-center">
                                                <span><i class="fas fa-birthday-cake me-2"></i>Edad:</span>
                                                <span>{{ usuarioSeleccionado.edad }} años</span>
                                            </li>
                                            <li
                                                class="list-group-item d-flex justify-content-between align-items-center">
                                                <span><i class="fas fa-venus-mars me-2"></i>Género:</span>
                                                <span>{{ formatearGenero(usuarioSeleccionado.genero) }}</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>

                                <div class="card border-0 shadow-sm mb-3">
                                    <div class="card-header bg-light">
                                        <h5 class="mb-0">
                                            <i class="fas fa-address-book me-2"></i>Información de contacto
                                        </h5>
                                    </div>
                                    <div class="card-body">
                                        <ul class="list-group list-group-flush">
                                            <li
                                                class="list-group-item d-flex justify-content-between align-items-center">
                                                <span><i class="fas fa-envelope me-2"></i>Email:</span>
                                                <span>{{ usuarioSeleccionado.email }}</span>
                                            </li>
                                            <li
                                                class="list-group-item d-flex justify-content-between align-items-center">
                                                <span><i class="fas fa-phone me-2"></i>Teléfono:</span>
                                                <span>{{ usuarioSeleccionado.telefono }}</span>
                                            </li>
                                            <li
                                                class="list-group-item d-flex justify-content-between align-items-center">
                                                <span><i class="fas fa-map-marker-alt me-2"></i>Dirección:</span>
                                                <span>{{ usuarioSeleccionado.direccion }}</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>

                                <div class="card border-0 shadow-sm">
                                    <div class="card-header bg-light">
                                        <h5 class="mb-0">
                                            <i class="fas fa-clock me-2"></i>Información del sistema
                                        </h5>
                                    </div>
                                    <div class="card-body">
                                        <ul class="list-group list-group-flush">
                                            <li
                                                class="list-group-item d-flex justify-content-between align-items-center">
                                                <span><i class="fas fa-id-badge me-2"></i>ID:</span>
                                                <span>{{ usuarioSeleccionado.id }}</span>
                                            </li>
                                            <li
                                                class="list-group-item d-flex justify-content-between align-items-center">
                                                <span><i class="fas fa-calendar-alt me-2"></i>Creado:</span>
                                                <span>{{ formatearFecha(usuarioSeleccionado.created_at) }}</span>
                                            </li>
                                            <li
                                                class="list-group-item d-flex justify-content-between align-items-center">
                                                <span><i class="fas fa-edit me-2"></i>Actualizado:</span>
                                                <span>{{ formatearFecha(usuarioSeleccionado.updated_at) }}</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                            <i class="fas fa-times me-1"></i>Cerrar
                        </button>
                        <button type="button" class="btn btn-primary" @click="mostarUser(usuarioSeleccionado.id)"
                            v-if="usuarioSeleccionado">
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
import { indexRoles } from '@/Services/RolesPermisosService';
import { changeStatus, indexUsers, showUser, storeUserAdmin, updateUser } from '@/Services/UsuarioService';

const formulario = ref({
    nombre: '',
    apellido: '',
    ci: '',
    nit: '',
    direccion: '',
    telefono: '',
    edad: '',
    genero: '',
    role: '',
    email: '',
});
const errors = ref({});
const datos = ref([]);
const roles = ref([]);
const search = ref('');
const posicion = ref('');
const formValidado = ref(false);
const vistaActual = ref('tabla');
const windowWidth = ref(window.innerWidth);
const filtroRol = ref('');
const filtroEstado = ref('');
const usuarioSeleccionado = ref(null);
const ordenamiento = ref({
    campo: 'id',
    direccion: 'asc'
});

let userModal = null;
let detallesModal = null;

// Actualizar el ancho de la ventana cuando cambia el tamaño
const actualizarAnchoPantalla = () => {
    windowWidth.value = window.innerWidth;
};

onMounted(() => {
    userModal = new Modal(document.getElementById('userModal'));
    detallesModal = new Modal(document.getElementById('detallesModal'));
    listarRoles();
    listarUsuarios();

    // Agregar event listener para el cambio de tamaño de ventana
    window.addEventListener('resize', actualizarAnchoPantalla);
});

onUnmounted(() => {
    // Eliminar event listener cuando el componente se desmonta
    window.removeEventListener('resize', actualizarAnchoPantalla);
});

const usuariosFiltrados = computed(() => {
    // Primero filtrar por búsqueda (ya se hace en la API)
    let resultado = datos.value;

    // Filtrar por rol
    if (filtroRol.value) {
        resultado = resultado.filter(usuario =>
            usuario.roles.some(rol => rol.name === filtroRol.value)
        );
    }

    // Filtrar por estado
    if (filtroEstado.value !== '') {
        const estadoBoolean = filtroEstado.value === '1';
        resultado = resultado.filter(usuario => usuario.estado === estadoBoolean);
    }

    // Luego ordenar según el campo y dirección seleccionados
    return resultado.sort((a, b) => {
        let valorA, valorB;

        if (ordenamiento.value.campo === 'rol') {
            valorA = a.roles[0]?.name || '';
            valorB = b.roles[0]?.name || '';
        } else if (ordenamiento.value.campo === 'nombre') {
            valorA = a.nombre + ' ' + a.apellido;
            valorB = b.nombre + ' ' + b.apellido;
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
        apellido: '',
        ci: '',
        nit: '',
        direccion: '',
        telefono: '',
        edad: '',
        genero: '',
        role: '',
        email: '',
    };
    errors.value = {};
    posicion.value = '';
    formValidado.value = false;
    userModal.show();
};

const listarRoles = async () => {
    try {
        const { data } = await indexRoles();
        roles.value = data.datos;
    } catch (error) {
        console.error('Error al cargar roles:', error);
        mostrarNotificacion('Error al cargar roles', 'error');
    }
};

const listarUsuarios = async () => {
    try {
        const { data } = await indexUsers(search.value);
        datos.value = data.datos.data;
    } catch (error) {
        console.error('Error al cargar usuarios:', error);
        mostrarNotificacion('Error al cargar usuarios', 'error');
    }
};

const validarFormulario = () => {
    // Validar campos requeridos
    const form = document.getElementById('userForm');
    formValidado.value = true;

    if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return false;
    }

    // Validaciones adicionales
    let esValido = true;
    errors.value = {};

    // Aquí podrías agregar validaciones personalizadas

    return esValido;
};

const validarYGuardar = () => {
    if (validarFormulario()) {
        guardarUserAndUpdate();
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

const guardarUserAndUpdate = async () => {
    errors.value = {};
    try {
        if (posicion.value) {
            await updateUser(posicion.value, formulario.value);
            mostrarNotificacion('Usuario actualizado correctamente', 'success');
        } else {
            await storeUserAdmin(formulario.value);
            mostrarNotificacion('Usuario creado correctamente', 'success');
        }
        listarUsuarios();
        userModal.hide();
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
            console.error('Error al guardar usuario:', error);
            mostrarNotificacion('Error al guardar usuario', 'error');
        }
    }
};

const mostarUser = async (id) => {
    errors.value = {};
    try {
        const { data } = await showUser(id);
        formulario.value = {
            nombre: data.dato.nombre,
            apellido: data.dato.apellido,
            ci: data.dato.ci,
            nit: data.dato.nit,
            direccion: data.dato.direccion,
            telefono: data.dato.telefono,
            edad: data.dato.edad,
            genero: data.dato.genero,
            role: data.dato.roles.length > 0 ? data.dato.roles[0].name : '',
            email: data.dato.email,
        };
        posicion.value = id;
        formValidado.value = false;

        // Si el modal de detalles está abierto, cerrarlo
        if (detallesModal._isShown) {
            detallesModal.hide();
        }

        // Mostrar el modal de edición
        userModal.show();
    } catch (error) {
        console.error('Error al obtener usuario:', error);
        mostrarNotificacion('Error al cargar el usuario', 'error');
    }
};

const cambiarEstado = async (id) => {
    try {
        await changeStatus(id);
        listarUsuarios();
        mostrarNotificacion('Estado del usuario actualizado correctamente', 'success');
    } catch (error) {
        console.error('Error al cambiar estado:', error);
        mostrarNotificacion('Error al cambiar el estado del usuario', 'error');
    }
};

const verDetalles = (usuario) => {
    usuarioSeleccionado.value = usuario;
    detallesModal.show();
};

const formatearFecha = (fecha) => {
    if (!fecha) return 'N/A';
    return new Date(fecha).toLocaleString();
};

const formatearGenero = (genero) => {
    if (genero === 'M') return 'Masculino';
    if (genero === 'F') return 'Femenino';
    if (genero === 'O') return 'Otro';
    return 'No especificado';
};

const aplicarFiltros = () => {
    // Los filtros se aplican automáticamente a través del computed
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

// Función para generar iniciales a partir del nombre y apellido
const getInitials = (nombre, apellido) => {
    const inicial1 = nombre ? nombre.charAt(0).toUpperCase() : '';
    const inicial2 = apellido ? apellido.charAt(0).toUpperCase() : '';
    return inicial1 + inicial2;
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

// Función para exportar usuarios
const exportarUsuarios = () => {
    // Crear un objeto con los datos a exportar
    const datosExportar = datos.value.map(usuario => ({
        ID: usuario.id,
        Nombre: usuario.nombre,
        Apellido: usuario.apellido,
        Email: usuario.email,
        CI: usuario.ci,
        NIT: usuario.nit || 'N/A',
        Dirección: usuario.direccion,
        Teléfono: usuario.telefono,
        Edad: usuario.edad,
        Género: formatearGenero(usuario.genero),
        Rol: usuario.roles[0]?.name || 'Sin rol',
        Estado: usuario.estado ? 'Activo' : 'Inactivo',
        'Fecha Creación': formatearFecha(usuario.created_at),
        'Última Actualización': formatearFecha(usuario.updated_at)
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
    link.setAttribute('download', `usuarios_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    mostrarNotificacion('Usuarios exportados correctamente', 'success');
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

/* Estilos para los avatares */
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

.avatar-circle-lg {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 36px;
}

.fw-medium {
    font-weight: 500;
}

/* Estilos para los filtros */
.form-select-sm {
    font-size: 0.875rem;
    padding-top: 0.25rem;
    padding-bottom: 0.25rem;
    padding-left: 0.5rem;
}
</style>