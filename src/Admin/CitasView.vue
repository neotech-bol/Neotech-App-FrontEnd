<template>
    <div class="container-fluid py-4">
        <div class="card shadow">
            <div
                class="card-header bg-primary bg-opacity-10 d-flex justify-content-between align-items-center flex-wrap gap-3 p-3">
                <h2 class="card-title h4 m-0">Gestión de Citas</h2>
                <div>
                    <button class="btn btn-primary" v-on:click="abrirModal()">
                        <i class="fas fa-plus me-2"></i>Agregar Cita
                    </button>
                </div>
            </div>
            <div class="card-body p-0">
                <div class="p-3">
                    <div class="row g-2">
                        <div class="col-md-8">
                            <div class="input-group mb-3">
                                <span class="input-group-text bg-light">
                                    <i class="fas fa-search"></i>
                                </span>
                                <input type="text" class="form-control" placeholder="Buscar cita..."
                                    v-model="search" @input="filtrarCitas">
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="input-group mb-3">
                                <span class="input-group-text bg-light">
                                    <i class="fas fa-filter"></i>
                                </span>
                                <select class="form-select" v-model="estadoSeleccionado" @change="filtrarPorEstado">
                                    <option value="">Todos los estados</option>
                                    <option value="0">Pendiente</option>
                                    <option value="1">Confirmada</option>
                                    <option value="2">Cancelada</option>
                                    <option value="3">Completada</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Table for larger screens -->
                <div class="table-responsive d-none d-md-block">
                    <table class="table table-hover align-middle mb-0">
                        <thead class="bg-light">
                            <tr class="text-center">
                                <th>ID</th>
                                <th>Nombre</th>
                                <th>Fecha</th>
                                <th>Hora</th>
                                <th>Servicio</th>
                                <th>Estado</th>
                                <th>Departamento</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="item in citas" :key="item.id" class="text-center">
                                <td>{{ item.id }}</td>
                                <td>{{ item.nombre_completo }}</td>
                                <td>{{ formatearFecha(item.fecha_de_cita) }}</td>
                                <td>{{ formatearHora(item.hora_de_cita) }}</td>
                                <td>{{ item.servicio_solicitado }}</td>
                                <td>
                                    <span class="badge" :class="getEstadoClass(item.estado)">
                                        {{ getEstadoTexto(item.estado) }}
                                    </span>
                                </td>
                                <td>{{ item.departamento || 'No especificado' }}</td>
                                <td>
                                    <div class="btn-group">
                                        <button class="btn btn-sm btn-outline-primary"
                                            @click="mostrarCita(item.id)">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        <button class="btn btn-sm btn-outline-info" @click="verDetalles(item.id)">
                                            <i class="fas fa-info-circle"></i>
                                        </button>
                                        <button class="btn btn-sm"
                                            :class="item.estado === 0 ? 'btn-outline-success' : 'btn-outline-danger'"
                                            @click="cambiarEstado(item.id)">
                                            <i
                                                :class="item.estado === 0 ? 'fas fa-check' : 'fas fa-times'"></i>
                                            {{ item.estado === 0 ? 'Confirmar' : 'Cancelar' }}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- Cards for mobile view -->
                <div class="d-md-none">
                    <div v-for="item in citas" :key="item.id" class="card cita-card mb-3 mx-3">
                        <div class="card-body">
                            <h5 class="card-title text-truncate">{{ item.nombre_completo }}</h5>
                            <div class="cita-info">
                                <div class="cita-detail">
                                    <strong>Fecha:</strong> {{ formatearFecha(item.fecha_de_cita) }}
                                </div>
                                <div class="cita-detail">
                                    <strong>Hora:</strong> {{ formatearHora(item.hora_de_cita) }}
                                </div>
                                <div class="cita-detail">
                                    <strong>Servicio:</strong> {{ item.servicio_solicitado }}
                                </div>
                                <div class="cita-detail">
                                    <strong>Estado:</strong>
                                    <span class="badge" :class="getEstadoClass(item.estado)">
                                        {{ getEstadoTexto(item.estado) }}
                                    </span>
                                </div>
                                <div class="cita-detail">
                                    <strong>Departamento:</strong> {{ item.departamento || 'No especificado' }}
                                </div>
                            </div>
                            <div class="d-flex justify-content-end gap-2 mt-3">
                                <button class="btn btn-sm btn-outline-primary action-btn"
                                    @click="mostrarCita(item.id)">
                                    <i class="fas fa-edit me-1"></i>Editar
                                </button>
                                <button class="btn btn-sm btn-outline-info action-btn" @click="verDetalles(item.id)">
                                    <i class="fas fa-info-circle me-1"></i>Detalles
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Pagination -->
                <div class="d-flex justify-content-center my-4" v-if="pagination && pagination.last_page > 1">
                    <nav aria-label="Navegación de citas" class="pagination-container">
                        <ul class="pagination pagination-sm flex-wrap">
                            <li class="page-item" :class="{ disabled: pagination.current_page === 1 }">
                                <a class="page-link" href="#" @click.prevent="cambiarPagina(1)"
                                    aria-label="Primera página">
                                    <i class="fas fa-angle-double-left"></i>
                                </a>
                            </li>
                            <li class="page-item" :class="{ disabled: pagination.current_page === 1 }">
                                <a class="page-link" href="#"
                                    @click.prevent="cambiarPagina(pagination.current_page - 1)"
                                    aria-label="Página anterior">
                                    <i class="fas fa-angle-left"></i>
                                </a>
                            </li>

                            <li class="page-item" v-for="page in paginationRange" :key="page"
                                :class="{ active: pagination.current_page === page }">
                                <a class="page-link" href="#" @click.prevent="cambiarPagina(page)">{{ page }}</a>
                            </li>

                            <li class="page-item"
                                :class="{ disabled: pagination.current_page === pagination.last_page }">
                                <a class="page-link" href="#"
                                    @click.prevent="cambiarPagina(pagination.current_page + 1)"
                                    aria-label="Página siguiente">
                                    <i class="fas fa-angle-right"></i>
                                </a>
                            </li>
                            <li class="page-item"
                                :class="{ disabled: pagination.current_page === pagination.last_page }">
                                <a class="page-link" href="#" @click.prevent="cambiarPagina(pagination.last_page)"
                                    aria-label="Última página">
                                    <i class="fas fa-angle-double-right"></i>
                                </a>
                            </li>
                        </ul>
                    </nav>
                </div>
            </div>
        </div>

        <!-- Modal para agregar/editar cita -->
        <div class="modal fade" id="citaModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header"
                        :class="posicion ? 'bg-warning bg-opacity-10' : 'bg-primary bg-opacity-10'">
                        <h5 class="modal-title">{{ posicion ? 'Editar Cita' : 'Nueva Cita' }}</h5>
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

                        <form @submit.prevent="guardarCita" id="citaForm" class="needs-validation"
                            novalidate>
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
                                    <i class="fas" :class="posicion ? 'fa-save me-1' : 'fa-plus me-1'"></i>
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
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header bg-info bg-opacity-10">
                        <h5 class="modal-title">Detalles de la Cita</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body" v-if="citaSeleccionada">
                        <div class="row">
                            <div class="col-md-4 text-center mb-3">
                                <div class="cita-profile-placeholder">
                                    <i class="fas fa-calendar-check fa-5x text-muted"></i>
                                </div>
                                <div class="mt-3">
                                    <span class="badge" :class="getEstadoClass(citaSeleccionada.estado)">
                                        {{ getEstadoTexto(citaSeleccionada.estado) }}
                                    </span>
                                </div>
                            </div>
                            <div class="col-md-8">
                                <h4 class="cita-title">{{ citaSeleccionada.nombre_completo }}</h4>
                                <p class="text-muted mb-3">{{ citaSeleccionada.correo }}</p>

                                <div class="cita-detail-item">
                                    <h6 class="fw-bold">Teléfono:</h6>
                                    <p>{{ citaSeleccionada.telefono }}</p>
                                </div>

                                <div class="cita-detail-item">
                                    <h6 class="fw-bold">Departamento:</h6>
                                    <p>{{ citaSeleccionada.departamento || 'No especificado' }}</p>
                                </div>

                                <div class="cita-detail-item">
                                    <h6 class="fw-bold">Fecha y Hora:</h6>
                                    <p>{{ formatearFecha(citaSeleccionada.fecha_de_cita) }} a las {{ formatearHora(citaSeleccionada.hora_de_cita) }}</p>
                                </div>

                                <div class="cita-detail-item">
                                    <h6 class="fw-bold">Servicio Solicitado:</h6>
                                    <p>{{ citaSeleccionada.servicio_solicitado }}</p>
                                </div>

                                <div class="cita-detail-item">
                                    <h6 class="fw-bold">Fecha de Creación:</h6>
                                    <p>{{ formatearFecha(citaSeleccionada.created_at) }}</p>
                                </div>
                            </div>
                        </div>

                        <div class="cita-notes mt-4" v-if="citaSeleccionada.mensaje">
                            <h5 class="section-title">Mensaje Adicional</h5>
                            <div class="p-3 bg-light rounded">
                                <p class="mb-0">{{ citaSeleccionada.mensaje }}</p>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                        <button v-if="citaSeleccionada && citaSeleccionada.estado === 0"
                            type="button" class="btn btn-success" @click="confirmarCita(citaSeleccionada.id)">
                            <i class="fas fa-check me-1"></i>Confirmar
                        </button>
                        <button v-if="citaSeleccionada && citaSeleccionada.estado !== 2"
                            type="button" class="btn btn-danger" @click="cancelarCita(citaSeleccionada.id)">
                            <i class="fas fa-times me-1"></i>Cancelar
                        </button>
                        <button v-if="citaSeleccionada && (citaSeleccionada.estado === 1 || citaSeleccionada.estado === 0)"
                            type="button" class="btn btn-info" @click="completarCita(citaSeleccionada.id)">
                            <i class="fas fa-check-double me-1"></i>Marcar como Completada
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
</script>

<style scoped>
.card {
    transition: box-shadow 0.3s ease-in-out;
}

.card:hover {
    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
}

.modal-header,
.modal-footer {
    padding: 1rem;
}

.modal-body {
    padding: 1.5rem;
}

/* Estilos para citas en vista móvil */
.cita-card {
    transition: all 0.3s ease;
    border-left: 3px solid transparent;
}

.cita-card:hover {
    border-left-color: #0d6efd;
    transform: translateX(5px);
}

.cita-info {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 0.5rem;
    margin: 0.75rem 0;
}

.cita-detail {
    padding: 0.5rem;
    background-color: #f8f9fa;
    border-radius: 0.25rem;
    font-size: 0.875rem;
}

.action-btn {
    transition: all 0.2s ease;
}

.action-btn:hover {
    transform: translateY(-2px);
}

/* Estilos para la paginación responsive */
.pagination-container {
    overflow-x: auto;
    padding: 0.5rem 0;
}

.pagination {
    flex-wrap: nowrap;
    min-width: max-content;
}

/* Estilos para detalles de la cita */
.cita-profile-placeholder {
    width: 150px;
    height: 150px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f8f9fa;
    border-radius: 50%;
    margin: 0 auto;
}

.cita-title {
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: #333;
}

.cita-detail-item {
    margin-bottom: 1rem;
}

.cita-notes {
    background-color: #fff;
    border-radius: 0.5rem;
}

.section-title {
    position: relative;
    padding-bottom: 0.5rem;
    margin-bottom: 1rem;
    font-weight: 600;
}

.section-title::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 50px;
    height: 2px;
    background: linear-gradient(to right, #0d6efd, #0dcaf0);
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

.cita-card {
    animation: fadeIn 0.5s ease-out;
}

/* Media queries para mejorar la responsividad */
@media (max-width: 767.98px) {
    .btn-group {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .btn-group .btn {
        width: 100%;
    }

    .cita-info {
        grid-template-columns: 1fr;
    }

    .cita-profile-placeholder {
        width: 120px;
        height: 120px;
    }
}
</style>