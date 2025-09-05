<template>
    <div class="container-fluid py-2 py-md-4 px-2 px-md-3">
        <div class="card shadow-sm border-0 rounded-3">
            <!-- Header con título y acciones principales -->
            <div class="card-header bg-primary bg-opacity-10 d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 p-3 p-md-4 border-0">
                <h2 class="card-title h5 h4-md m-0 d-flex align-items-center">
                    <span class="badge bg-primary bg-opacity-10 text-primary p-2 me-2 rounded-circle">
                        <i class="fas fa-calendar-check"></i>
                    </span>
                    <span class="d-none d-sm-inline">Gestión de Citas</span>
                    <span class="d-sm-none">Citas</span>
                </h2>
                <div class="d-flex flex-column flex-sm-row gap-2 w-100 w-md-auto justify-content-end">
                    <button class="btn btn-primary  w-sm-auto" v-on:click="abrirModal()">
                        <i class="fas fa-plus me-2"></i>
                        <span class="d-none d-sm-inline">Agregar Cita</span>
                        <span class="d-sm-none">Agregar</span>
                    </button>
                </div>
            </div>

            <!-- Filtros y búsqueda -->
            <div class="card-body p-0">
                <div class="p-3 p-md-4 bg-light border-top border-bottom">
                    <div class="row g-2 g-md-3">
                        <div class="col-12 col-lg-8">
                            <div class="input-group shadow-sm">
                                <span class="input-group-text bg-white border-end-0">
                                    <i class="fas fa-search text-muted"></i>
                                </span>
                                <input type="text" class="form-control border-start-0 ps-0" 
                                    placeholder="Buscar por nombre, correo, servicio..." 
                                    v-model="search" @input="filtrarCitas">
                                <button class="btn btn-outline-secondary border-start-0" type="button" 
                                    @click="search = ''; filtrarCitas()" v-if="search">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>
                        </div>
                        <div class="col-12 col-lg-4">
                            <div class="input-group shadow-sm">
                                <span class="input-group-text bg-white border-end-0">
                                    <i class="fas fa-filter text-muted"></i>
                                </span>
                                <select class="form-select border-start-0 ps-0" v-model="estadoSeleccionado" @change="filtrarPorEstado">
                                    <option value="">Todos los estados</option>
                                    <option value="0">Pendiente</option>
                                    <option value="1">Confirmada</option>
                                    <option value="2">Cancelada</option>
                                    <option value="3">Completada</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <!-- Contador de resultados -->
                    <div class="d-flex align-items-center mt-3">
                        <span class="badge bg-primary rounded-pill me-2">{{ citas.length }}</span>
                        <p class="text-muted mb-0 small">
                            <span class="d-none d-sm-inline">Mostrando {{ citas.length }} citas</span>
                            <span class="d-sm-none">Citas</span>
                        </p>
                    </div>
                </div>

                <!-- Mensaje cuando no hay resultados -->
                <div v-if="citas.length === 0" class="text-center py-4 py-md-5 px-3">
                    <div class="mb-3">
                        <span class="badge bg-light p-3 rounded-circle">
                            <i class="fas fa-calendar-times fa-2x text-muted"></i>
                        </span>
                    </div>
                    <h5 class="text-muted">No se encontraron citas</h5>
                    <p class="text-muted small">Intenta con otra búsqueda o agrega una nueva cita</p>
                    <button class="btn btn-primary mt-2 shadow-sm" @click="abrirModal()">
                        <i class="fas fa-plus me-2"></i>Agregar cita
                    </button>
                </div>

                <!-- Table view - Solo en desktop -->
                <div class="d-none d-lg-block" v-if="citas.length > 0">
                    <div class="table-responsive">
                        <table class="table table-hover align-middle mb-0">
                            <thead class="bg-light">
                                <tr>
                                    <th class="px-3 py-3">ID</th>
                                    <th class="px-3 py-3">Nombre</th>
                                    <th class="px-3 py-3">Fecha</th>
                                    <th class="px-3 py-3">Hora</th>
                                    <th class="px-3 py-3">Servicio</th>
                                    <th class="px-3 py-3">Estado</th>
                                    <th class="px-3 py-3">Departamento</th>
                                    <th class="px-3 py-3 text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="item in citas" :key="item.id" class="cita-row">
                                    <td class="px-3 py-3">#{{ item.id }}</td>
                                    <td class="px-3 py-3">
                                        <div class="d-flex align-items-center">
                                            <div class="avatar-circle me-2" :style="{ backgroundColor: getAvatarColor(item.nombre_completo) }">
                                                {{ getInitials(item.nombre_completo) }}
                                            </div>
                                            <div class="text-start">
                                                <div class="fw-medium">{{ item.nombre_completo }}</div>
                                                <small class="text-muted">{{ item.correo }}</small>
                                            </div>
                                        </div>
                                    </td>
                                    <td class="px-3 py-3">
                                        <i class="fas fa-calendar me-1 text-muted"></i>
                                        {{ formatearFecha(item.fecha_de_cita) }}
                                    </td>
                                    <td class="px-3 py-3">
                                        <i class="fas fa-clock me-1 text-muted"></i>
                                        {{ formatearHora(item.hora_de_cita) }}
                                    </td>
                                    <td class="px-3 py-3">{{ item.servicio_solicitado }}</td>
                                    <td class="px-3 py-3">
                                        <span class="badge rounded-pill" :class="getEstadoClass(item.estado)">
                                            {{ getEstadoTexto(item.estado) }}
                                        </span>
                                    </td>
                                    <td class="px-3 py-3">{{ item.departamento || 'No especificado' }}</td>
                                    <td class="px-3 py-3 text-center">
                                        <div class="btn-group shadow-sm">
                                            <button class="btn btn-sm btn-outline-primary" @click="mostrarCita(item.id)" title="Editar">
                                                <i class="fas fa-edit"></i>
                                            </button>
                                            <button class="btn btn-sm btn-outline-info" @click="verDetalles(item.id)" title="Ver detalles">
                                                <i class="fas fa-info-circle"></i>
                                            </button>
                                            <button class="btn btn-sm"
                                                :class="item.estado === 0 ? 'btn-outline-success' : 'btn-outline-danger'"
                                                @click="cambiarEstado(item.id)" 
                                                :title="item.estado === 0 ? 'Confirmar' : 'Cancelar'">
                                                <i :class="item.estado === 0 ? 'fas fa-check' : 'fas fa-times'"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Cards view - Responsive para móviles y tablets -->
                <div v-if="citas.length > 0" class="d-lg-none">
                    <div class="row g-3 g-md-4 p-3 p-md-4">
                        <div class="col-12 col-sm-6 col-xl-4" v-for="item in citas" :key="item.id">
                            <div class="card h-100 border-0 shadow-sm hover-card rounded-3">
                                <div class="card-header bg-white d-flex justify-content-between align-items-center p-3 border-0">
                                    <div class="d-flex align-items-center min-w-0 flex-grow-1">
                                        <div class="avatar-circle me-2 flex-shrink-0" :style="{ backgroundColor: getAvatarColor(item.nombre_completo) }">
                                            {{ getInitials(item.nombre_completo) }}
                                        </div>
                                        <h5 class="card-title mb-0 fw-bold text-truncate">{{ item.nombre_completo }}</h5>
                                    </div>
                                    <span class="badge rounded-pill flex-shrink-0 ms-2" :class="getEstadoClass(item.estado)">
                                        {{ getEstadoTexto(item.estado) }}
                                    </span>
                                </div>
                                <div class="card-body p-3">
                                    <div class="row g-2 small">
                                        <div class="col-12">
                                            <div class="d-flex justify-content-between align-items-center">
                                                <span class="text-muted"><i class="fas fa-envelope me-1"></i>Correo:</span>
                                                <span class="fw-medium text-end text-truncate ms-2" style="max-width: 60%;">
                                                    {{ item.correo }}
                                                </span>
                                            </div>
                                        </div>
                                        <div class="col-12">
                                            <div class="d-flex justify-content-between align-items-center">
                                                <span class="text-muted"><i class="fas fa-calendar me-1"></i>Fecha:</span>
                                                <span class="fw-medium">{{ formatearFecha(item.fecha_de_cita) }}</span>
                                            </div>
                                        </div>
                                        <div class="col-12">
                                            <div class="d-flex justify-content-between align-items-center">
                                                <span class="text-muted"><i class="fas fa-clock me-1"></i>Hora:</span>
                                                <span class="fw-medium">{{ formatearHora(item.hora_de_cita) }}</span>
                                            </div>
                                        </div>
                                        <div class="col-12">
                                            <div class="d-flex justify-content-between align-items-center">
                                                <span class="text-muted"><i class="fas fa-briefcase me-1"></i>Servicio:</span>
                                                <span class="fw-medium text-end text-truncate ms-2" style="max-width: 60%;">
                                                    {{ item.servicio_solicitado }}
                                                </span>
                                            </div>
                                        </div>
                                        <div class="col-12">
                                            <div class="d-flex justify-content-between align-items-center">
                                                <span class="text-muted"><i class="fas fa-map-marker-alt me-1"></i>Departamento:</span>
                                                <span class="fw-medium">{{ item.departamento || 'No especificado' }}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="card-footer bg-white p-3 border-top-0">
                                    <div class="d-flex flex-column flex-sm-row gap-2">
                                        <button class="btn btn-sm btn-outline-primary flex-fill" @click="mostrarCita(item.id)">
                                            <i class="fas fa-edit me-1"></i>Editar
                                        </button>
                                        <button class="btn btn-sm btn-outline-info flex-fill" @click="verDetalles(item.id)">
                                            <i class="fas fa-info-circle me-1"></i>Detalles
                                        </button>
                                        <button class="btn btn-sm flex-fill"
                                            :class="item.estado === 0 ? 'btn-outline-success' : 'btn-outline-danger'"
                                            @click="cambiarEstado(item.id)">
                                            <i :class="item.estado === 0 ? 'fas fa-check me-1' : 'fas fa-times me-1'"></i>
                                            {{ item.estado === 0 ? 'Confirmar' : 'Cancelar' }}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Paginación responsive -->
                <div class="d-flex justify-content-center py-3 py-md-4 px-3" v-if="pagination && pagination.last_page > 1">
                    <nav aria-label="Navegación de citas">
                        <ul class="pagination pagination-sm shadow-sm mb-0">
                            <!-- Primera página - Solo en desktop -->
                            <li class="page-item d-none d-md-block" :class="{ disabled: pagination.current_page === 1 }">
                                <button type="button" class="page-link" aria-label="Primera" @click="cambiarPagina(1)">
                                    <i class="fas fa-angle-double-left"></i>
                                </button>
                            </li>
                            <!-- Página anterior -->
                            <li class="page-item" :class="{ disabled: pagination.current_page === 1 }">
                                <button type="button" class="page-link" aria-label="Anterior" @click="cambiarPagina(pagination.current_page - 1)">
                                    <i class="fas fa-angle-left"></i>
                                </button>
                            </li>

                            <!-- Páginas numeradas - Responsive -->
                            <li v-for="page in paginationRange" :key="page" class="page-item" :class="{ active: pagination.current_page === page }">
                                <button type="button" class="page-link" @click="cambiarPagina(page)">{{ page }}</button>
                            </li>

                            <!-- Página siguiente -->
                            <li class="page-item" :class="{ disabled: pagination.current_page === pagination.last_page }">
                                <button type="button" class="page-link" aria-label="Siguiente" @click="cambiarPagina(pagination.current_page + 1)">
                                    <i class="fas fa-angle-right"></i>
                                </button>
                            </li>
                            <!-- Última página - Solo en desktop -->
                            <li class="page-item d-none d-md-block" :class="{ disabled: pagination.current_page === pagination.last_page }">
                                <button type="button" class="page-link" aria-label="Última" @click="cambiarPagina(pagination.last_page)">
                                    <i class="fas fa-angle-double-right"></i>
                                </button>
                            </li>
                        </ul>
                    </nav>
                </div>
            </div>
        </div>

        <!-- Modal para agregar/editar cita -->
        <div class="modal fade" id="citaModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered modal-fullscreen-sm-down modal-lg">
                <div class="modal-content border-0 shadow">
                    <div class="modal-header p-3 p-md-4"
                        :class="posicion ? 'bg-warning bg-opacity-10' : 'bg-primary bg-opacity-10'">
                        <h5 class="modal-title">
                            <span class="badge p-2 me-2 rounded-circle"
                                :class="posicion ? 'bg-warning bg-opacity-10 text-warning' : 'bg-primary bg-opacity-10 text-primary'">
                                <i :class="posicion ? 'fas fa-edit' : 'fas fa-plus'"></i>
                            </span>
                            <span class="d-none d-sm-inline">{{ posicion ? 'Editar Cita' : 'Nueva Cita' }}</span>
                            <span class="d-sm-none">{{ posicion ? 'Editar' : 'Nueva' }}</span>
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body p-3 p-md-4">
                        <!-- Alerta de campos requeridos -->
                        <div class="alert alert-info rounded-3 shadow-sm mb-4" role="alert">
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

                        <form @submit.prevent="guardarCita" id="citaForm" class="needs-validation" novalidate>
                            <div class="row g-3">
                                <div class="col-md-6">
                                    <label for="nombre_completo" class="form-label fw-bold">Nombre Completo <span
                                            class="text-danger">*</span></label>
                                    <div class="input-group">
                                        <span class="input-group-text"><i class="fas fa-user"></i></span>
                                        <input type="text" class="form-control"
                                            :class="{ 'is-invalid': errors.nombre_completo }" id="nombre_completo"
                                            v-model="formulario.nombre_completo" placeholder="Ej: Juan Pérez" required>
                                        <div class="invalid-feedback" v-if="errors.nombre_completo">
                                            {{ errors.nombre_completo[0] }}
                                        </div>
                                        <div class="invalid-feedback" v-else>
                                            El nombre completo es obligatorio
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <label for="correo" class="form-label fw-bold">Correo Electrónico <span
                                            class="text-danger">*</span></label>
                                    <div class="input-group">
                                        <span class="input-group-text"><i class="fas fa-envelope"></i></span>
                                        <input type="email" class="form-control"
                                            :class="{ 'is-invalid': errors.correo }" id="correo"
                                            v-model="formulario.correo" placeholder="Ej: ejemplo@correo.com" required>
                                        <div class="invalid-feedback" v-if="errors.correo">
                                            {{ errors.correo[0] }}
                                        </div>
                                        <div class="invalid-feedback" v-else>
                                            El correo electrónico es obligatorio
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <label for="telefono" class="form-label fw-bold">Teléfono <span
                                            class="text-danger">*</span></label>
                                    <div class="input-group">
                                        <span class="input-group-text"><i class="fas fa-phone"></i></span>
                                        <input type="tel" class="form-control"
                                            :class="{ 'is-invalid': errors.telefono }" id="telefono"
                                            v-model="formulario.telefono" placeholder="Ej: 77997694" required>
                                        <div class="invalid-feedback" v-if="errors.telefono">
                                            {{ errors.telefono[0] }}
                                        </div>
                                        <div class="invalid-feedback" v-else>
                                            El teléfono es obligatorio
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <label for="departamento" class="form-label fw-bold">Departamento <span
                                            class="text-danger">*</span></label>
                                    <div class="input-group">
                                        <span class="input-group-text"><i class="fas fa-map-marker-alt"></i></span>
                                        <select class="form-select" :class="{ 'is-invalid': errors.departamento }" id="departamento"
                                            v-model="formulario.departamento" required>
                                            <option value="">Seleccione un departamento</option>
                                            <option value="cochabamba">Cochabamba</option>
                                            <option value="la-paz">La Paz</option>
                                            <option value="santa-cruz">Santa Cruz</option>
                                        </select>
                                        <div class="invalid-feedback" v-if="errors.departamento">
                                            {{ errors.departamento[0] }}
                                        </div>
                                        <div class="invalid-feedback" v-else>
                                            El departamento es obligatorio
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <label for="fecha_de_cita" class="form-label fw-bold">Fecha de Cita <span
                                            class="text-danger">*</span></label>
                                    <div class="input-group">
                                        <span class="input-group-text"><i class="fas fa-calendar"></i></span>
                                        <input type="date" class="form-control"
                                            :class="{ 'is-invalid': errors.fecha_de_cita }" id="fecha_de_cita"
                                            v-model="formulario.fecha_de_cita" required>
                                        <div class="invalid-feedback" v-if="errors.fecha_de_cita">
                                            {{ errors.fecha_de_cita[0] }}
                                        </div>
                                        <div class="invalid-feedback" v-else>
                                            La fecha de cita es obligatoria
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <label for="hora_de_cita" class="form-label fw-bold">Hora de Cita <span
                                            class="text-danger">*</span></label>
                                    <div class="input-group">
                                        <span class="input-group-text"><i class="fas fa-clock"></i></span>
                                        <input type="time" class="form-control"
                                            :class="{ 'is-invalid': errors.hora_de_cita }" id="hora_de_cita"
                                            v-model="formulario.hora_de_cita" required>
                                        <div class="invalid-feedback" v-if="errors.hora_de_cita">
                                            {{ errors.hora_de_cita[0] }}
                                        </div>
                                        <div class="invalid-feedback" v-else>
                                            La hora de cita es obligatoria
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <label for="servicio_solicitado" class="form-label fw-bold">Servicio Solicitado <span
                                            class="text-danger">*</span></label>
                                    <div class="input-group">
                                        <span class="input-group-text"><i class="fas fa-briefcase"></i></span>
                                        <select class="form-select" :class="{ 'is-invalid': errors.servicio_solicitado }" id="servicio_solicitado"
                                            v-model="formulario.servicio_solicitado" required>
                                            <option value="">Seleccione un servicio</option>
                                            <option value="consulta">Consulta general</option>
                                            <option value="soporte">Soporte técnico</option>
                                            <option value="compra">Asesoría de compra</option>
                                            <option value="reclamo">Reclamo</option>
                                            <option value="otro">Otro</option>
                                        </select>
                                        <div class="invalid-feedback" v-if="errors.servicio_solicitado">
                                            {{ errors.servicio_solicitado[0] }}
                                        </div>
                                        <div class="invalid-feedback" v-else>
                                            El servicio solicitado es obligatorio
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <label for="estado" class="form-label fw-bold">Estado <span
                                            class="text-danger">*</span></label>
                                    <div class="input-group">
                                        <span class="input-group-text"><i class="fas fa-tag"></i></span>
                                        <select class="form-select" :class="{ 'is-invalid': errors.estado }" id="estado"
                                            v-model="formulario.estado" required>
                                            <option value="">Seleccione un estado</option>
                                            <option value="0">Pendiente</option>
                                            <option value="1">Confirmada</option>
                                            <option value="2">Cancelada</option>
                                            <option value="3">Completada</option>
                                        </select>
                                        <div class="invalid-feedback" v-if="errors.estado">
                                            {{ errors.estado[0] }}
                                        </div>
                                        <div class="invalid-feedback" v-else>
                                            El estado es obligatorio
                                        </div>
                                    </div>
                                </div>
                                <div class="col-12" v-if="formulario.servicio_solicitado === 'otro'">
                                    <label for="otro_servicio" class="form-label fw-bold">Especifique el servicio <span
                                            class="text-danger">*</span></label>
                                    <div class="input-group">
                                        <span class="input-group-text"><i class="fas fa-comment"></i></span>
                                        <input type="text" class="form-control"
                                            :class="{ 'is-invalid': errors.otro_servicio }" id="otro_servicio"
                                            v-model="formulario.otro_servicio" placeholder="Especifique el servicio" required>
                                        <div class="invalid-feedback" v-if="errors.otro_servicio">
                                            {{ errors.otro_servicio[0] }}
                                        </div>
                                        <div class="invalid-feedback" v-else>
                                            Debe especificar el servicio
                                        </div>
                                    </div>
                                </div>
                                <div class="col-12">
                                    <label for="mensaje" class="form-label fw-bold">Mensaje adicional</label>
                                    <div class="input-group">
                                        <span class="input-group-text"><i class="fas fa-sticky-note"></i></span>
                                        <textarea class="form-control" :class="{ 'is-invalid': errors.mensaje }"
                                            id="mensaje" v-model="formulario.mensaje"
                                            placeholder="Mensaje adicional sobre la cita..." rows="3"></textarea>
                                        <div class="invalid-feedback" v-if="errors.mensaje">
                                            {{ errors.mensaje[0] }}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer border-0 p-3 p-md-4">
                        <div class="d-flex flex-column flex-sm-row justify-content-between w-100 gap-2">
                            <div>
                                <span v-if="Object.keys(errors).length > 0" class="text-danger">
                                    <i class="fas fa-exclamation-circle me-1"></i>
                                    Por favor, corrija los errores en el formulario
                                </span>
                            </div>
                            <div class="d-flex flex-column flex-sm-row gap-2">
                                <button type="button" class="btn btn-outline-secondary w-100 w-sm-auto" data-bs-dismiss="modal">
                                    <i class="fas fa-times me-2"></i>Cancelar
                                </button>
                                <button type="button" class="btn w-100 w-sm-auto" :class="posicion ? 'btn-warning' : 'btn-primary'"
                                    @click="validarYGuardar">
                                    <i class="fas" :class="posicion ? 'fa-save me-2' : 'fa-plus me-2'"></i>
                                    {{ posicion ? 'Actualizar' : 'Guardar' }}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Modal de detalles de la cita -->
        <div class="modal fade" id="detallesModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered modal-fullscreen-sm-down modal-lg">
                <div class="modal-content border-0 shadow">
                    <div class="modal-header bg-info bg-opacity-10 p-3 p-md-4">
                        <h5 class="modal-title">
                            <span class="badge bg-info bg-opacity-10 text-info p-2 me-2 rounded-circle">
                                <i class="fas fa-info-circle"></i>
                            </span>
                            <span class="d-none d-sm-inline">Detalles de la Cita</span>
                            <span class="d-sm-none">Detalles</span>
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body p-3 p-md-4" v-if="citaSeleccionada">
                        <div class="row g-3 g-md-4">
                            <div class="col-md-4 text-center mb-3">
                                <div class="cita-profile-placeholder mb-3">
                                    <div class="avatar-circle-lg mx-auto" :style="{ backgroundColor: getAvatarColor(citaSeleccionada.nombre_completo) }">
                                        {{ getInitials(citaSeleccionada.nombre_completo) }}
                                    </div>
                                </div>
                                <div class="mt-3">
                                    <span class="badge rounded-pill" :class="getEstadoClass(citaSeleccionada.estado)">
                                        {{ getEstadoTexto(citaSeleccionada.estado) }}
                                    </span>
                                </div>
                            </div>
                            <div class="col-md-8">
                                <div class="card h-100 border-0 shadow-sm rounded-3">
                                    <div class="card-header bg-white border-0 p-3">
                                        <span class="card-title h6 d-flex align-items-center">
                                            <span class="badge bg-info bg-opacity-10 text-info p-2 me-2 rounded-circle">
                                                <i class="fas fa-user"></i>
                                            </span>
                                            Información del Cliente
                                        </span>
                                    </div>
                                    <div class="card-body p-3">
                                        <h4 class="mb-1">{{ citaSeleccionada.nombre_completo }}</h4>
                                        <p class="text-muted mb-3">{{ citaSeleccionada.correo }}</p>
                                        
                                        <div class="row g-2 small">
                                            <div class="col-12">
                                                <div class="d-flex justify-content-between">
                                                    <span class="text-muted"><i class="fas fa-phone me-1"></i>Teléfono:</span>
                                                    <span class="fw-medium">{{ citaSeleccionada.telefono }}</span>
                                                </div>
                                            </div>
                                            <div class="col-12">
                                                <div class="d-flex justify-content-between">
                                                    <span class="text-muted"><i class="fas fa-map-marker-alt me-1"></i>Departamento:</span>
                                                    <span class="fw-medium">{{ citaSeleccionada.departamento || 'No especificado' }}</span>
                                                </div>
                                            </div>
                                            <div class="col-12">
                                                <div class="d-flex justify-content-between">
                                                    <span class="text-muted"><i class="fas fa-calendar me-1"></i>Fecha:</span>
                                                    <span class="fw-medium">{{ formatearFecha(citaSeleccionada.fecha_de_cita) }}</span>
                                                </div>
                                            </div>
                                            <div class="col-12">
                                                <div class="d-flex justify-content-between">
                                                    <span class="text-muted"><i class="fas fa-clock me-1"></i>Hora:</span>
                                                    <span class="fw-medium">{{ formatearHora(citaSeleccionada.hora_de_cita) }}</span>
                                                </div>
                                            </div>
                                            <div class="col-12">
                                                <div class="d-flex justify-content-between">
                                                    <span class="text-muted"><i class="fas fa-briefcase me-1"></i>Servicio:</span>
                                                    <span class="fw-medium">{{ citaSeleccionada.servicio_solicitado }}</span>
                                                </div>
                                            </div>
                                            <div class="col-12">
                                                <div class="d-flex justify-content-between">
                                                    <span class="text-muted"><i class="fas fa-calendar-plus me-1"></i>Creación:</span>
                                                    <span class="fw-medium">{{ formatearFecha(citaSeleccionada.created_at) }}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="col-12" v-if="citaSeleccionada.mensaje">
                                <div class="card border-0 shadow-sm rounded-3">
                                    <div class="card-header bg-white border-0 p-3">
                                        <span class="card-title h6 d-flex align-items-center">
                                            <span class="badge bg-info bg-opacity-10 text-info p-2 me-2 rounded-circle">
                                                <i class="fas fa-sticky-note"></i>
                                            </span>
                                            Mensaje Adicional
                                        </span>
                                    </div>
                                    <div class="card-body p-3">
                                        <div class="bg-light rounded-3 p-3">
                                            <p class="mb-0">{{ citaSeleccionada.mensaje }}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer border-0 p-3 p-md-4">
                        <div class="d-flex flex-column flex-sm-row justify-content-between w-100 gap-2">
                            <div class="d-flex flex-column flex-sm-row gap-2">
                                <button v-if="citaSeleccionada && citaSeleccionada.estado === 0"
                                    type="button" class="btn btn-success w-100 w-sm-auto" @click="confirmarCita(citaSeleccionada.id)">
                                    <i class="fas fa-check me-2"></i>Confirmar
                                </button>
                                <button v-if="citaSeleccionada && citaSeleccionada.estado !== 2"
                                    type="button" class="btn btn-danger w-100 w-sm-auto" @click="cancelarCita(citaSeleccionada.id)">
                                    <i class="fas fa-times me-2"></i>Cancelar
                                </button>
                                <button v-if="citaSeleccionada && (citaSeleccionada.estado === 1 || citaSeleccionada.estado === 0)"
                                    type="button" class="btn btn-info w-100 w-sm-auto" @click="completarCita(citaSeleccionada.id)">
                                    <i class="fas fa-check-double me-2"></i>Completar
                                </button>
                            </div>
                            <div>
                                <button type="button" class="btn btn-outline-secondary w-100 w-sm-auto" data-bs-dismiss="modal">
                                    <i class="fas fa-times me-2"></i>Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { Modal } from 'bootstrap/dist/js/bootstrap.bundle.min';
import { index, show, store, update, cambiarEstadoCita } from '@/Services/CitasService';

const citas = ref([]);
const search = ref('');
const estadoSeleccionado = ref('');
const posicion = ref('');
const formulario = ref({
    nombre_completo: '',
    correo: '',
    telefono: '',
    departamento: '',
    fecha_de_cita: '',
    hora_de_cita: '',
    servicio_solicitado: '',
    otro_servicio: '',
    estado: 0,
    mensaje: ''
});
const errors = ref({});
const citaSeleccionada = ref(null);
const formValidado = ref(false);
const currentPage = ref(1);
const pagination = ref({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
    from: 0,
    to: 0
});

let citaModal = null;
let detallesModal = null;

onMounted(() => {
    citaModal = new Modal(document.getElementById('citaModal'));
    detallesModal = new Modal(document.getElementById('detallesModal'));
    listarCitas();
});

const paginationRange = computed(() => {
    const range = [];
    const maxVisiblePages = 5;
    const startPage = Math.max(1, pagination.value.current_page - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(pagination.value.last_page, startPage + maxVisiblePages - 1);

    for (let i = startPage; i <= endPage; i++) {
        range.push(i);
    }

    return range;
});

const listarCitas = async () => {
    try {
        const response = await index(currentPage.value, search.value, estadoSeleccionado.value);
        if (response && response.data) {
            // Acceder a los datos correctamente según la estructura de la respuesta
            citas.value = response.data.datos.data || [];
            
            // Asignar datos de paginación
            pagination.value = {
                current_page: response.data.datos.current_page,
                last_page: response.data.datos.last_page,
                per_page: response.data.datos.per_page,
                total: response.data.datos.total,
                from: response.data.datos.from,
                to: response.data.datos.to
            };
        }
    } catch (error) {
        console.error('Error al cargar citas:', error);
    }
};

const cambiarPagina = async (page) => {
    if (page < 1 || page > pagination.value.last_page) return;

    currentPage.value = page;
    await listarCitas();
};

const filtrarCitas = async () => {
    currentPage.value = 1; // Reiniciar a la primera página
    await listarCitas();
};

const filtrarPorEstado = async () => {
    currentPage.value = 1; // Reiniciar a la primera página
    await listarCitas();
};

const getEstadoClass = (estado) => {
    switch (Number(estado)) {
        case 1:
            return 'bg-success';
        case 0:
            return 'bg-warning';
        case 2:
            return 'bg-danger';
        case 3:
            return 'bg-info';
        default:
            return 'bg-secondary';
    }
};

const getEstadoTexto = (estado) => {
    switch (Number(estado)) {
        case 0:
            return 'Pendiente';
        case 1:
            return 'Confirmada';
        case 2:
            return 'Cancelada';
        case 3:
            return 'Completada';
        default:
            return 'Desconocido';
    }
};

const formatearFecha = (fecha) => {
    if (!fecha) return 'No disponible';

    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(fecha).toLocaleDateString('es-ES', options);
};

const formatearHora = (hora) => {
    if (!hora) return 'No disponible';
    
    // Si es un string de hora en formato HH:MM:SS
    if (hora.includes(':')) {
        const [horas, minutos] = hora.split(':');
        const date = new Date();
        date.setHours(horas);
        date.setMinutes(minutos);
        return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    }
    
    // Si es un timestamp
    return new Date(hora).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
};

const abrirModal = () => {
    posicion.value = '';
    formulario.value = {
        nombre_completo: '',
        correo: '',
        telefono: '',
        departamento: '',
        fecha_de_cita: '',
        hora_de_cita: '',
        servicio_solicitado: '',
        otro_servicio: '',
        estado: 0,
        mensaje: ''
    };
    errors.value = {};
    formValidado.value = false;
    citaModal.show();
};

const validarFormulario = () => {
    // Validar campos requeridos
    const form = document.getElementById('citaForm');
    formValidado.value = true;

    if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return false;
    }

    // Validaciones adicionales
    let esValido = true;
    errors.value = {};

    if (!formulario.value.nombre_completo) {
        errors.value.nombre_completo = ['El campo nombre completo es obligatorio.'];
        esValido = false;
    }

    if (!formulario.value.correo) {
        errors.value.correo = ['El campo correo electrónico es obligatorio.'];
        esValido = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formulario.value.correo)) {
        errors.value.correo = ['El correo electrónico no tiene un formato válido.'];
        esValido = false;
    }

    if (!formulario.value.telefono) {
        errors.value.telefono = ['El campo teléfono es obligatorio.'];
        esValido = false;
    }

    if (!formulario.value.departamento) {
        errors.value.departamento = ['El campo departamento es obligatorio.'];
        esValido = false;
    }

    if (!formulario.value.fecha_de_cita) {
        errors.value.fecha_de_cita = ['La fecha de cita es obligatoria.'];
        esValido = false;
    }

    if (!formulario.value.hora_de_cita) {
        errors.value.hora_de_cita = ['La hora de cita es obligatoria.'];
        esValido = false;
    }

    if (!formulario.value.servicio_solicitado) {
        errors.value.servicio_solicitado = ['El servicio solicitado es obligatorio.'];
        esValido = false;
    }

    if (formulario.value.servicio_solicitado === 'otro' && !formulario.value.otro_servicio) {
        errors.value.otro_servicio = ['Debe especificar el servicio.'];
        esValido = false;
    }

    return esValido;
};

const validarYGuardar = () => {
    if (validarFormulario()) {
        guardarCita();
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

const guardarCita = async () => {
    try {
        // Preparar datos para enviar
        const datosParaEnviar = { ...formulario.value };
        
        // Asegurarse de que estado sea un número
        datosParaEnviar.estado = Number(datosParaEnviar.estado);
        
        // Si el servicio es "otro", usar el valor especificado
        if (datosParaEnviar.servicio_solicitado === 'otro' && datosParaEnviar.otro_servicio) {
            datosParaEnviar.servicio_solicitado = datosParaEnviar.otro_servicio;
            delete datosParaEnviar.otro_servicio;
        }

        if (posicion.value) {
            // Actualizar cita existente
            await update(posicion.value, datosParaEnviar);
        } else {
            // Crear nueva cita
            await store(datosParaEnviar);
        }

        // Recargar lista de citas
        await listarCitas();
        citaModal.hide();
        alert(posicion.value ? 'Cita actualizada correctamente' : 'Cita creada correctamente');
    } catch (error) {
        if (error.response && error.response.status === 422) {
            errors.value = error.response.data.errors;
            setTimeout(() => {
                const primerError = document.querySelector('.is-invalid');
                if (primerError) {
                    primerError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 100);
        } else {
            console.error('Error al guardar cita:', error);
            alert('Error al guardar la cita. Intente nuevamente.');
        }
    }
};

const mostrarCita = async (id) => {
    try {
        const { data } = await show(id);
        formulario.value = {
            nombre_completo: data.datos.nombre_completo,
            correo: data.datos.correo,
            telefono: data.datos.telefono,
            departamento: data.datos.departamento,
            fecha_de_cita: data.datos.fecha_de_cita,
            hora_de_cita: data.datos.hora_de_cita,
            servicio_solicitado: data.datos.servicio_solicitado,
            estado: data.datos.estado,
            mensaje: data.datos.mensaje || ''
        };
        
        posicion.value = id;
        errors.value = {};
        formValidado.value = false;
        citaModal.show();
    } catch (error) {
        console.error('Error al obtener cita:', error);
        alert('Error al cargar la cita. Intente nuevamente.');
    }
};

const cambiarEstado = async (id) => {
    try {
        const index = citas.value.findIndex(c => c.id === id);
        if (index !== -1) {
            const estadoActual = Number(citas.value[index].estado);
            const nuevoEstado = estadoActual === 0 ? 1 : 2;

            // Actualizar el estado localmente
            citas.value[index].estado = nuevoEstado;

            // Enviar la solicitud a la API para cambiar el estado
            await cambiarEstadoCita(id, { estado: nuevoEstado });

            // Recargar la lista después de cambiar el estado
            await listarCitas();
        }
    } catch (error) {
        console.error('Error al cambiar estado de la cita:', error);
        alert('Error al cambiar el estado de la cita. Intente nuevamente.');
    }
};

const verDetalles = async (id) => {
    try {
        // Obtener los detalles de la cita
        const { data } = await show(id);
        
        if (data && data.datos) {
            citaSeleccionada.value = data.datos;
            detallesModal.show();
        } else {
            alert('No se encontró la cita solicitada');
        }
    } catch (error) {
        console.error('Error al obtener detalles de la cita:', error);
        alert('Error al cargar los detalles de la cita. Intente nuevamente.');
    }
};

const confirmarCita = async (id) => {
    try {
        await cambiarEstado(id, { estado: 1 });
        
        // Actualizar el estado en la vista
        citaSeleccionada.value.estado = 1;
        
        // Actualizar la lista de citas
        await listarCitas();
        
        alert('Cita confirmada correctamente');
    } catch (error) {
        console.error('Error al confirmar cita:', error);
        alert('Error al confirmar la cita. Intente nuevamente.');
    }
};

const cancelarCita = async (id) => {
    try {
        await cambiarEstado(id, { estado: 2 });
        
        // Actualizar el estado en la vista
        citaSeleccionada.value.estado = 2;
        
        // Actualizar la lista de citas
        await listarCitas();
        
        alert('Cita cancelada correctamente');
    } catch (error) {
        console.error('Error al cancelar cita:', error);
        alert('Error al cancelar la cita. Intente nuevamente.');
    }
};

const completarCita = async (id) => {
    try {
        await cambiarEstado(id, { estado: 3 });
        
        // Actualizar el estado en la vista
        citaSeleccionada.value.estado = 3;
        
        // Actualizar la lista de citas
        await listarCitas();
        
        alert('Cita marcada como completada correctamente');
    } catch (error) {
        console.error('Error al completar cita:', error);
        alert('Error al marcar la cita como completada. Intente nuevamente.');
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
</script>

<style scoped>
/* Estilos base mejorados */
.container-fluid {
    max-width: 100%;
    overflow-x: hidden;
}

.card {
    transition: all 0.3s ease;
    border-radius: 0.75rem;
    overflow: hidden;
    box-shadow: 0 0.25rem 0.75rem rgba(0, 0, 0, 0.1) !important;
}

.card:hover {
    box-shadow: 0 0.5rem 1.5rem rgba(0, 0, 0, 0.15) !important;
    transform: translateY(-2px);
}

.card-header {
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    padding: 1.25rem;
}

.modal-header,
.modal-footer {
    padding: 1.25rem;
}

.modal-body {
    padding: 1.5rem;
}

.modal-content {
    border: none;
    border-radius: 0.75rem;
    box-shadow: 0 0.5rem 2rem rgba(0, 0, 0, 0.15);
}

.btn {
    border-radius: 0.5rem;
    font-weight: 500;
    padding: 0.5rem 1.25rem;
    transition: all 0.2s ease-in-out;
    display: inline-flex;
    align-items: center;
    justify-content: center;
}

.btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 0.25rem 0.5rem rgba(0, 0, 0, 0.1);
}

.btn-sm {
    padding: 0.375rem 0.75rem;
    font-size: 0.875rem;
}

.input-group {
    box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.05);
    border-radius: 0.5rem;
    overflow: hidden;
}

.input-group-text {
    border: none;
    background-color: #f8f9fa;
}

.form-control, .form-select {
    border: none;
    padding: 0.625rem 1rem;
}

.form-control:focus, .form-select:focus {
    box-shadow: none;
    border-color: #0d6efd;
}

/* Estilos para citas en vista móvil */
.hover-card {
    transition: all 0.3s ease;
}

.hover-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
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

.avatar-circle-lg {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 28px;
    box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
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
.cita-row {
    transition: background-color 0.2s ease;
}

.cita-row:hover {
    background-color: rgba(0, 0, 0, 0.02);
}

.fw-medium {
    font-weight: 500;
}

/* Estilos para la paginación responsive */
.pagination {
    margin-bottom: 0;
    border-radius: 0.375rem;
    overflow: hidden;
    box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.05);
}

.page-item.active .page-link {
    background-color: #0d6efd;
    border-color: #0d6efd;
    color: white;
    font-weight: 600;
}

.page-link {
    border: none;
    color: #0d6efd;
    padding: 0.5rem 0.75rem;
    transition: all 0.2s ease;
}

.page-link:hover {
    background-color: #e9ecef;
    color: #0a58ca;
    transform: translateY(-1px);
}

.page-item.disabled .page-link {
    color: #6c757d;
    opacity: 0.5;
}

/* Estilos para detalles de la cita */
.cita-profile-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto;
}

/* Estilos para badges */
.badge {
    font-weight: 500;
    padding: 0.5rem 0.75rem;
    border-radius: 50rem;
    box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.1);
    transition: all 0.2s ease;
}

.badge:hover {
    transform: translateY(-1px);
    box-shadow: 0 0.25rem 0.5rem rgba(0, 0, 0, 0.15);
}

.badge.rounded-circle {
    width: 36px;
    height: 36px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0;
}

/* Estilos para alertas */
.alert {
    border: none;
    border-radius: 0.75rem;
    box-shadow: 0 0.25rem 0.75rem rgba(0, 0, 0, 0.1);
}

/* Animaciones */
@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Media queries para mejorar la responsividad */
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

    .avatar-circle-lg {
        width: 60px;
        height: 60px;
        font-size: 22px;
    }
}

@media (min-width: 576px) and (max-width: 767.98px) {
    /* Estilos para móviles grandes */
    .avatar-circle {
        width: 30px;
        height: 30px;
        font-size: 13px;
    }

    .avatar-circle-lg {
        width: 70px;
        height: 70px;
        font-size: 24px;
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
        transition: none !important;
    }

    .hover-card:hover,
    .card:hover,
    .btn:hover,
    .page-link:hover,
    .badge:hover {
        transform: none !important;
    }
}

/* Estilos para la tabla */
.table {
    margin-bottom: 0;
}

.table th {
    font-weight: 600;
    text-transform: uppercase;
    font-size: 0.8rem;
    letter-spacing: 0.5px;
    color: #495057;
    padding: 1rem;
    border-bottom: 2px solid #e9ecef;
}

.table td {
    padding: 1rem;
    vertical-align: middle;
    border-bottom: 1px solid #e9ecef;
}

.table tbody tr {
    transition: all 0.2s ease;
}

.table tbody tr:hover {
    background-color: rgba(13, 110, 253, 0.05);
}

/* Estilos para inputs y selects */
.form-control::placeholder,
.form-select::placeholder {
    color: #adb5bd;
    opacity: 0.7;
}

.form-control:focus,
.form-select:focus {
    border-color: #0d6efd;
    box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}

/* Estilos para botones de acción en la tabla */
.btn-group .btn {
    margin-left: -1px;
}

.btn-group .btn:first-child {
    border-top-left-radius: 0.5rem;
    border-bottom-left-radius: 0.5rem;
}

.btn-group .btn:last-child {
    border-top-right-radius: 0.5rem;
    border-bottom-right-radius: 0.5rem;
}

/* Estilos para el contenedor principal */
.container-fluid {
    max-width: 1400px;
    margin: 0 auto;
}
</style>