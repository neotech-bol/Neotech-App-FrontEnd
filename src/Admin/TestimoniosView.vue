<template>
    <div class="container-fluid py-4">
        <div class="card shadow">
            <div
                class="card-header bg-primary bg-opacity-10 d-flex justify-content-between align-items-center flex-wrap gap-3 p-3">
                <h2 class="card-title h4 m-0">Gestión de Testimonios</h2>
                <div>
                    <button class="btn btn-primary" v-on:click="abrirModal()">
                        <i class="fas fa-plus me-2"></i>Agregar Testimonio
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
                                <input type="text" class="form-control" placeholder="Buscar testimonio..."
                                    v-model="search" @input="filtrarTestimonios">
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="input-group mb-3">
                                <span class="input-group-text bg-light">
                                    <i class="fas fa-filter"></i>
                                </span>
                                <select class="form-select" v-model="estadoSeleccionado" @change="filtrarPorEstado">
                                    <option value="">Todos los estados</option>
                                    <option value="pendiente">Pendiente</option>
                                    <option value="aprobado">Aprobado</option>
                                    <option value="rechazado">Rechazado</option>
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
                                <th>Ocupación</th>
                                <th>Calificación</th>
                                <th>Estado</th>
                                <th>Fecha</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="item in testimonios" :key="item.id" class="text-center">
                                <td>{{ item.id }}</td>
                                <td>{{ item.nombre_completo }}</td>
                                <td>{{ item.ocupacion }}</td>
                                <td>
                                    <div class="d-flex justify-content-center">
                                        <div class="stars">
                                            <i v-for="n in 5" :key="n" class="fas fa-star"
                                                :class="n <= item.calificacion ? 'text-warning' : 'text-muted'"></i>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <span class="badge" :class="getEstadoClass(item.estado)">
                                        {{ item.estado }}
                                    </span>
                                </td>
                                <td>{{ formatearFecha(item.created_at) }}</td>
                                <td>
                                    <div class="btn-group">
                                        <button class="btn btn-sm btn-outline-primary"
                                            @click="mostrarTestimonio(item.id)">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        <button class="btn btn-sm btn-outline-info" @click="verDetalles(item.id)">
                                            <i class="fas fa-info-circle"></i>
                                        </button>
                                        <button class="btn btn-sm"
                                            :class="item.estado === 'pendiente' ? 'btn-outline-success' : 'btn-outline-danger'"
                                            @click="cambiarEstado(item.id)">
                                            <i
                                                :class="item.estado === 'pendiente' ? 'fas fa-check' : 'fas fa-times'"></i>
                                            {{ item.estado === 'pendiente' ? 'Aprobar' : 'Rechazar' }}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- Cards for mobile view -->
                <div class="d-md-none">
                    <div v-for="item in testimonios" :key="item.id" class="card testimonio-card mb-3 mx-3">
                        <div class="card-body">
                            <h5 class="card-title text-truncate">{{ item.nombre_completo }}</h5>
                            <div class="testimonio-info">
                                <div class="testimonio-detail">
                                    <strong>Ocupación:</strong> {{ item.ocupacion }}
                                </div>
                                <div class="testimonio-detail">
                                    <strong>Calificación:</strong>
                                    <div class="stars">
                                        <i v-for="n in 5" :key="n" class="fas fa-star"
                                            :class="n <= item.calificacion ? 'text-warning' : 'text-muted'"></i>
                                    </div>
                                </div>
                                <div class="testimonio-detail">
                                    <strong>Estado:</strong>
                                    <span class="badge" :class="getEstadoClass(item.estado)">
                                        {{ item.estado }}
                                    </span>
                                </div>
                                <div class="testimonio-detail">
                                    <strong>Fecha:</strong> {{ formatearFecha(item.fecha_publicacion) }}
                                </div>
                            </div>
                            <div class="d-flex justify-content-end gap-2 mt-3">
                                <button class="btn btn-sm btn-outline-primary action-btn"
                                    @click="mostrarTestimonio(item.id)">
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
                    <nav aria-label="Navegación de testimonios" class="pagination-container">
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

        <!-- Modal para agregar/editar testimonio -->
        <div class="modal fade" id="testimonioModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header"
                        :class="posicion ? 'bg-warning bg-opacity-10' : 'bg-primary bg-opacity-10'">
                        <h5 class="modal-title">{{ posicion ? 'Editar Testimonio' : 'Nuevo Testimonio' }}</h5>
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

                        <form @submit.prevent="guardarTestimonio" id="testimonioForm" class="needs-validation"
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
                                    <label for="ocupacion" class="form-label fw-bold">Ocupación <span
                                            class="text-danger">*</span></label>
                                    <div class="input-group">
                                        <span class="input-group-text"><i class="fas fa-briefcase"></i></span>
                                        <input type="text" class="form-control"
                                            :class="{ 'is-invalid': errors.ocupacion }" id="ocupacion"
                                            v-model="formulario.ocupacion" placeholder="Ej: Desarrollador Web" required>
                                        <div class="invalid-feedback" v-if="errors.ocupacion">
                                            {{ errors.ocupacion[0] }}
                                        </div>
                                        <div class="invalid-feedback" v-else>
                                            La ocupación es obligatoria
                                        </div>
                                    </div>
                                </div>
                                <div class="col-12">
                                    <label for="experiencia" class="form-label fw-bold">Experiencia <span
                                            class="text-danger">*</span></label>
                                    <div class="input-group">
                                        <span class="input-group-text"><i class="fas fa-comment"></i></span>
                                        <textarea class="form-control" :class="{ 'is-invalid': errors.experiencia }"
                                            id="experiencia" v-model="formulario.experiencia"
                                            placeholder="Describa su experiencia..." rows="4" required></textarea>
                                        <div class="invalid-feedback" v-if="errors.experiencia">
                                            {{ errors.experiencia[0] }}
                                        </div>
                                        <div class="invalid-feedback" v-else>
                                            La experiencia es obligatoria
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <label for="calificacion" class="form-label fw-bold">Calificación <span
                                            class="text-danger">*</span></label>
                                    <div class="stars-input">
                                        <i v-for="n in 5" :key="n" class="fas fa-star fa-2x"
                                            :class="n <= formulario.calificacion ? 'text-warning' : 'text-muted'"
                                            @click="formulario.calificacion = n"></i>
                                    </div>
                                    <div class="invalid-feedback d-block" v-if="errors.calificacion">
                                        {{ errors.calificacion[0] }}
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
                                            <option value="pendiente">Pendiente</option>
                                            <option value="aprobado">Aprobado</option>
                                            <option value="rechazado">Rechazado</option>
                                        </select>
                                        <div class="invalid-feedback" v-if="errors.estado">
                                            {{ errors.estado[0] }}
                                        </div>
                                        <div class="invalid-feedback" v-else>
                                            El estado es obligatorio
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

        <!-- Modal de detalles del testimonio -->
        <div class="modal fade" id="detallesModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header bg-info bg-opacity-10">
                        <h5 class="modal-title">Detalles del Testimonio</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body" v-if="testimonioSeleccionado">
                        <div class="row">
                            <div class="col-md-4 text-center mb-3">
                                <img v-if="testimonioSeleccionado.imagen" :src="testimonioSeleccionado.imagen"
                                    alt="Imagen de perfil" class="img-fluid rounded-circle testimonio-profile-img">
                                <div v-else class="testimonio-profile-placeholder">
                                    <i class="fas fa-user-circle fa-5x text-muted"></i>
                                </div>
                                <div class="mt-3">
                                    <div class="stars">
                                        <i v-for="n in 5" :key="n" class="fas fa-star fa-lg"
                                            :class="n <= testimonioSeleccionado.calificacion ? 'text-warning' : 'text-muted'"></i>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-8">
                                <h4 class="testimonio-title">{{ testimonioSeleccionado.nombre_completo }}</h4>
                                <p class="text-muted mb-3">{{ testimonioSeleccionado.ocupacion }}</p>

                                <div class="testimonio-detail-item">
                                    <h6 class="fw-bold">Estado:</h6>
                                    <span class="badge" :class="getEstadoClass(testimonioSeleccionado.estado)">
                                        {{ testimonioSeleccionado.estado }}
                                    </span>
                                </div>

                                <div class="testimonio-detail-item">
                                    <h6 class="fw-bold">Fecha de Publicación:</h6>
                                    <p>{{ formatearFecha(testimonioSeleccionado.fecha_publicacion) || 'No publicado' }}
                                    </p>
                                </div>

                                <div class="testimonio-detail-item">
                                    <h6 class="fw-bold">Fecha de Creación:</h6>
                                    <p>{{ formatearFecha(testimonioSeleccionado.created_at) }}</p>
                                </div>
                            </div>
                        </div>

                        <div class="testimonio-experience mt-4">
                            <h5 class="section-title">Experiencia</h5>
                            <div class="p-3 bg-light rounded">
                                <p class="mb-0">{{ testimonioSeleccionado.experiencia }}</p>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                        <button v-if="testimonioSeleccionado && testimonioSeleccionado.estado === 'pendiente'"
                            type="button" class="btn btn-success" @click="aprobarTestimonio(testimonioSeleccionado.id)">
                            <i class="fas fa-check me-1"></i>Aprobar
                        </button>
                        <button v-if="testimonioSeleccionado && testimonioSeleccionado.estado !== 'rechazado'"
                            type="button" class="btn btn-danger" @click="rechazarTestimonio(testimonioSeleccionado.id)">
                            <i class="fas fa-times me-1"></i>Rechazar
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
import { cambiarEstadoTestimonio, indexTestimonios, showTestimonio, storeTestimonio, updateTestimonio } from '@/Services/TestimoniosService';
// import { showTestimonio, storeTestimonio, updateTestimonio, changeStatus } from '@/Services/TestimoniosService';
const testimonios = ref([]);
const search = ref('');
const estadoSeleccionado = ref('');
const posicion = ref('');
const formulario = ref({
    nombre_completo: '',
    ocupacion: '',
    experiencia: '',
    calificacion: 0,
    estado: 'pendiente',
    fecha_publicacion: '',
    imagen: null
});
const errors = ref({});
const imagenPreview = ref('');
const testimonioSeleccionado = ref(null);
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

let testimonioModal = null;
let detallesModal = null;

onMounted(() => {
    testimonioModal = new Modal(document.getElementById('testimonioModal'));
    detallesModal = new Modal(document.getElementById('detallesModal'));
    listarTestimonios();
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

const listarTestimonios = async () => {
    try {
        const response = await indexTestimonios(currentPage.value, search.value, estadoSeleccionado.value);
        console.log(response);
        if (response && response.data) {
            testimonios.value = response.data.datos.data || [];
            // Asignar datos de paginación si existen
            if (response.data.pagination) {
                pagination.value = response.data.pagination;
            } else if (response.data.current_page) {
                pagination.value = {
                    current_page: response.data.current_page,
                    last_page: response.data.last_page,
                    per_page: response.data.per_page,
                    total: response.data.total,
                    from: response.data.from,
                    to: response.data.to
                };
            }
        }
    } catch (error) {
        console.error('Error al cargar testimonios:', error);
    }
};

const cambiarPagina = async (page) => {
    if (page < 1 || page > pagination.value.last_page) return;

    currentPage.value = page;
    await listarTestimonios();
};

const filtrarTestimonios = async () => {
    console.log('Filtrando por:', search.value);
    currentPage.value = 1; // Reiniciar a la primera página
    await listarTestimonios();
};
const filtrarPorEstado = async () => {
  console.log('Filtrando por estado:', estadoSeleccionado.value);
  currentPage.value = 1; // Reiniciar a la primera página
  await listarTestimonios();
};

const getEstadoClass = (estado) => {
    switch (estado) {
        case 'aprobado':
            return 'bg-success';
        case 'pendiente':
            return 'bg-warning';
        case 'rechazado':
            return 'bg-danger';
        default:
            return 'bg-secondary';
    }
};

const formatearFecha = (fecha) => {
    if (!fecha) return 'No disponible';

    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(fecha).toLocaleDateString('es-ES', options);
};

const abrirModal = () => {
    posicion.value = '';
    formulario.value = {
        nombre_completo: '',
        ocupacion: '',
        experiencia: '',
        calificacion: 0,
        estado: 'pendiente',
    };
    errors.value = {};
    formValidado.value = false;
    testimonioModal.show();
};

const validarFormulario = () => {
    // Validar campos requeridos
    const form = document.getElementById('testimonioForm');
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

    if (!formulario.value.ocupacion) {
        errors.value.ocupacion = ['El campo ocupación es obligatorio.'];
        esValido = false;
    }

    if (!formulario.value.experiencia) {
        errors.value.experiencia = ['El campo experiencia es obligatorio.'];
        esValido = false;
    }

    if (!formulario.value.calificacion) {
        errors.value.calificacion = ['La calificación es obligatoria.'];
        esValido = false;
    }

    if (!formulario.value.estado) {
        errors.value.estado = ['El campo estado es obligatorio.'];
        esValido = false;
    }

    return esValido;
};

const validarYGuardar = () => {
    if (validarFormulario()) {
        guardarTestimonio();
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

// Implementación temporal de las funciones comentadas
const guardarTestimonio = async () => {
    try {
        const formData = new FormData();

        // Agregar campos básicos
        Object.keys(formulario.value).forEach(key => {
            if (formulario.value[key] !== '' && key !== 'imagen_file') {
                formData.append(key, formulario.value[key]);
            }
        });

        // Agregar imagen si existe
        if (formulario.value.imagen_file) {
            formData.append('imagen', formulario.value.imagen_file);
        }

        // Simulación de guardado
        console.log('Datos a guardar:', Object.fromEntries(formData));

        if (posicion.value) {
            // Actualizar testimonio existente
            await updateTestimonio(posicion.value, formData);
            console.log('Actualizando testimonio:', posicion.value);
        } else {
            // Crear nuevo testimonio
            await storeTestimonio(formData);
            console.log('Creando nuevo testimonio');
        }

        // Simulación de éxito
        await listarTestimonios();
        testimonioModal.hide();
        alert(posicion.value ? 'Testimonio actualizado correctamente' : 'Testimonio creado correctamente');
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
            console.error('Error al guardar testimonio:', error);
            alert('Error al guardar el testimonio. Intente nuevamente.');
        }
    }
};

const mostrarTestimonio = async (id) => {
    try {

        const { data } = await showTestimonio(id);
        console.log(data);
        formulario.value = {
            nombre_completo: data.datos.nombre_completo,
            ocupacion: data.datos.ocupacion,
            experiencia: data.datos.experiencia,
            calificacion: data.datos.calificacion,
            estado: data.datos.estado,
        };
        posicion.value = id;
        errors.value = {};
        formValidado.value = false;
        testimonioModal.show();
    } catch (error) {
        console.error('Error al obtener testimonio:', error);
        alert('Error al cargar el testimonio. Intente nuevamente.');
    }
};

const cambiarEstado = async (id) => {
    try {
        console.log(id); // Simulación de cambio de estado
        const index = testimonios.value.findIndex(t => t.id === id);
        if (index !== -1) {
            const nuevoEstado = testimonios.value[index].estado === 'pendiente' ? 'aprobado' : 'pendiente';

            // Actualizar el estado localmente
            testimonios.value[index].estado = nuevoEstado;
            console.log(`Estado del testimonio ${id} cambiado a: ${nuevoEstado}`);

            // Enviar la solicitud a la API para cambiar el estado
            await cambiarEstadoTestimonio(id, { estado: nuevoEstado }); // Enviar el nuevo estado como un objeto

            // Recargar la lista después de cambiar el estado
            await listarTestimonios();
        }
    } catch (error) {
        console.error('Error al cambiar estado del testimonio:', error);
        alert('Error al cambiar el estado del testimonio. Intente nuevamente.');
    }
};

const verDetalles = async (id) => {
    try {
        // Simulación de obtención de datos del testimonio
        const testimonio = testimonios.value.find(t => t.id === id);

        if (testimonio) {
            testimonioSeleccionado.value = testimonio;
            detallesModal.show();
        } else {
            alert('No se encontró el testimonio solicitado');
        }
    } catch (error) {
        console.error('Error al obtener detalles del testimonio:', error);
        alert('Error al cargar los detalles del testimonio. Intente nuevamente.');
    }
};

const aprobarTestimonio = async (id) => {
    try {
        // Implementar lógica para aprobar un testimonio
        console.log('Aprobando testimonio:', id);

        // Por ahora, simulamos la aprobación
        const index = testimonios.value.findIndex(t => t.id === id);
        if (index !== -1) {
            testimonios.value[index].estado = 'aprobado';
            testimonioSeleccionado.value.estado = 'aprobado';
        }

        // Cerrar el modal de detalles
        detallesModal.hide();
    } catch (error) {
        console.error('Error al aprobar testimonio:', error);
        alert('Error al aprobar el testimonio. Intente nuevamente.');
    }
};

const rechazarTestimonio = async (id) => {
    try {
        // Implementar lógica para rechazar un testimonio
        console.log('Rechazando testimonio:', id);

        // Por ahora, simulamos el rechazo
        const index = testimonios.value.findIndex(t => t.id === id);
        if (index !== -1) {
            testimonios.value[index].estado = 'rechazado';
            testimonioSeleccionado.value.estado = 'rechazado';
        }

        // Cerrar el modal de detalles
        detallesModal.hide();
    } catch (error) {
        console.error('Error al rechazar testimonio:', error);
        alert('Error al rechazar el testimonio. Intente nuevamente.');
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

/* Estilos para testimonios en vista móvil */
.testimonio-card {
    transition: all 0.3s ease;
    border-left: 3px solid transparent;
}

.testimonio-card:hover {
    border-left-color: #0d6efd;
    transform: translateX(5px);
}

.testimonio-info {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 0.5rem;
    margin: 0.75rem 0;
}

.testimonio-detail {
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

/* Estilos para estrellas */
.stars {
    display: inline-flex;
    gap: 0.25rem;
}

.stars-input {
    display: flex;
    gap: 0.5rem;
    cursor: pointer;
}

.stars-input i {
    transition: all 0.2s ease;
}

.stars-input i:hover {
    transform: scale(1.2);
}

/* Estilos para detalles del testimonio */
.testimonio-profile-img {
    width: 150px;
    height: 150px;
    object-fit: cover;
    border: 5px solid #f8f9fa;
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
}

.testimonio-profile-placeholder {
    width: 150px;
    height: 150px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f8f9fa;
    border-radius: 50%;
    margin: 0 auto;
}

.testimonio-title {
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: #333;
}

.testimonio-detail-item {
    margin-bottom: 1rem;
}

.testimonio-experience {
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

.testimonio-card {
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

    .testimonio-info {
        grid-template-columns: 1fr;
    }

    .testimonio-profile-img,
    .testimonio-profile-placeholder {
        width: 120px;
        height: 120px;
    }
}
</style>