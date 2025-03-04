<template>
    <div class="container-fluid py-4">
        <div class="card shadow">
            <div class="card-header bg-primary bg-opacity-10 d-flex justify-content-between align-items-center flex-wrap gap-3 p-3">
                <h2 class="card-title h4 m-0">Gestión de Usuarios</h2>
                <button class="btn btn-primary" @click="abrirModal()">
                    <i class="fas fa-user-plus me-2"></i>Agregar Usuario
                </button>
            </div>
            <div class="card-body p-0">
                <div class="p-3">
                    <div class="input-group mb-3">
                        <span class="input-group-text bg-light">
                            <i class="fas fa-search"></i>
                        </span>
                        <input type="text" class="form-control" placeholder="Buscar usuario..." v-model="search"
                            @input="listarUsuarios">
                    </div>
                </div>

                <!-- Table for larger screens -->
                <div class="table-responsive d-none d-md-block">
                    <table class="table table-hover align-middle mb-0">
                        <thead class="bg-light">
                            <tr>
                                <th>ID</th>
                                <th>Nombre</th>
                                <th>Email</th>
                                <th>CI</th>
                                <th>Rol</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="item in datos" :key="item.id">
                                <td>{{ item.id }}</td>
                                <td>{{ item.nombre }} {{ item.apellido }}</td>
                                <td>{{ item.email }}</td>
                                <td>{{ item.ci }}</td>
                                <td>{{ item.roles[0]?.name || 'Sin rol' }}</td>
                                <td>
                                    <span class="badge" :class="item.estado == true ? 'bg-success' : 'bg-danger'">
                                        {{ item.estado ? 'Activo' : 'Inactivo' }}
                                    </span>
                                </td>
                                <td>
                                    <div class="btn-group">
                                        <button class="btn btn-sm btn-outline-primary" @click="mostarUser(item.id)">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        <button class="btn btn-sm"
                                            :class="item.estado ? 'btn-outline-danger' : 'btn-outline-success'"
                                            @click="cambiarEstado(item.id)">
                                            <i class="fas" :class="item.estado ? 'fa-user-slash' : 'fa-user-check'"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- Cards for mobile view -->
                <div class="d-md-none">
                    <div v-for="item in datos" :key="item.id" class="card mb-3 mx-3">
                        <div class="card-body">
                            <h5 class="card-title">{{ item.nombre }} {{ item.apellido }}</h5>
                            <p class="card-text">
                                <strong>Email:</strong> {{ item.email }}<br>
                                <strong>CI:</strong> {{ item.ci }}<br>
                                <strong>Rol:</strong> {{ item.roles[0]?.name || 'Sin rol' }}<br>
                                <strong>Estado:</strong>
                                <span class="badge" :class="item.estado ? 'bg-success' : 'bg-danger'">
                                    {{ item.estado ? 'Activo' : 'Inactivo' }}
                                </span>
                            </p>
                            <div class="d-flex justify-content-end gap-2">
                                <button class="btn btn-sm btn-outline-primary" @click="mostarUser(item.id)">
                                    <i class="fas fa-edit me-1"></i>Editar
                                </button>
                                <button class="btn btn-sm"
                                    :class="item.estado ? 'btn-outline-danger' : 'btn-outline-success'"
                                    @click="cambiarEstado(item.id)">
                                    <i class="fas me-1" :class="item.estado ? 'fa-user-slash' : 'fa-user-check'"></i>
                                    {{ item.estado ? 'Desactivar' : 'Activar' }}
                                </button>
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
                        <h5 class="modal-title">{{ posicion ? 'Editar Usuario' : 'Nuevo Usuario' }}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form @submit.prevent="guardarUserAndUpdate">
                            <div class="row g-3">
                                <div class="col-md-6">
                                    <div class="form-floating">
                                        <input type="text" class="form-control"
                                            :class="{ 'is-invalid': errors?.nombre }" id="nombre"
                                            v-model="formulario.nombre" placeholder="Nombre" required>
                                        <label for="nombre"><i class="fas fa-user me-2"></i>Nombre</label>
                                        <div class="invalid-feedback" v-if="errors.nombre">
                                            {{ errors.nombre[0] }}
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="form-floating">
                                        <input type="text" class="form-control"
                                            :class="{ 'is-invalid': errors?.apellido }" id="apellido"
                                            v-model="formulario.apellido" placeholder="Apellido" required>
                                        <label for="apellido"><i class="fas fa-user me-2"></i>Apellido</label>
                                        <div class="invalid-feedback" v-if="errors.apellido">
                                            {{ errors.apellido[0] }}
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="form-floating">
                                        <input type="text" class="form-control" :class="{ 'is-invalid': errors?.ci }"
                                            id="ci" v-model="formulario.ci" placeholder="CI" required>
                                        <label for="ci"><i class="fas fa-id-card me-2"></i>CI</label>
                                        <div class="invalid-feedback" v-if="errors.ci">
                                            {{ errors.ci[0] }}
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="form-floating">
                                        <input type="text" class="form-control" :class="{ 'is-invalid': errors?.nit }"
                                            id="nit" v-model="formulario.nit" placeholder="NIT">
                                        <label for="nit"><i class="fas fa-building me-2"></i>NIT</label>
                                        <div class="invalid-feedback" v-if="errors.nit">
                                            {{ errors.nit[0] }}
                                        </div>
                                    </div>
                                </div>
                                <div class="col-12">
                                    <div class="form-floating">
                                        <textarea class="form-control" :class="{ 'is-invalid': errors?.direccion }"
                                            id="direccion" v-model="formulario.direccion" placeholder="Dirección"
                                            required style="height: 100px"></textarea>
                                        <label for="direccion"><i
                                                class="fas fa-map-marker-alt me-2"></i>Dirección</label>
                                        <div class="invalid-feedback" v-if="errors.direccion">
                                            {{ errors.direccion[0] }}
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="form-floating">
                                        <input type="tel" class="form-control"
                                            :class="{ 'is-invalid': errors?.telefono }" id="telefono"
                                            v-model="formulario.telefono" placeholder="Teléfono" required>
                                        <label for="telefono"><i class="fas fa-phone me-2"></i>Teléfono</label>
                                        <div class="invalid-feedback" v-if="errors.telefono">
                                            {{ errors.telefono[0] }}
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="form-floating">
                                        <input type="number" class="form-control"
                                            :class="{ 'is-invalid': errors?.edad }" id="edad" v-model="formulario.edad"
                                            placeholder="Edad" required>
                                        <label for="edad"><i class="fas fa-birthday-cake me-2"></i>Edad</label>
                                        <div class="invalid-feedback" v-if="errors.edad">
                                            {{ errors.edad[0] }}
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="form-floating">
                                        <select class="form-select" :class="{ 'is-invalid': errors?.genero }"
                                            id="genero" v-model="formulario.genero" required>
                                            <option value="">Seleccione</option>
                                            <option value="M">Masculino</option>
                                            <option value="F">Femenino</option>
                                            <option value="O">Otro</option>
                                        </select>
                                        <label for="genero"><i class="fas fa-venus-mars me-2"></i>Género</label>
                                        <div class="invalid-feedback" v-if="errors.genero">
                                            {{ errors.genero[0] }}
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="form-floating">
                                        <select class="form-select" :class="{ 'is-invalid': errors?.role }" id="role"
                                            v-model="formulario.role" required>
                                            <option value="">Seleccione</option>
                                            <option :value="item.name" v-for="item in roles" :key="item.id">{{ item.name
                                                }}</option>
                                        </select>
                                        <label for="role"><i class="fas fa-user-tag me-2"></i>Rol</label>
                                        <div class="invalid-feedback" v-if="errors.role">
                                            {{ errors.role[0] }}
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="form-floating">
                                        <input type="email" class="form-control"
                                            :class="{ 'is-invalid': errors?.email }" id="email"
                                            v-model="formulario.email" placeholder="Email" required>
                                        <label for="email"><i class="fas fa-envelope me-2"></i>Email</label>
                                        <div class="invalid-feedback" v-if="errors.email">
                                            {{ errors.email[0] }}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                        <button type="button" class="btn" :class="posicion ? 'btn-warning' : 'btn-primary'"
                            @click="guardarUserAndUpdate">
                            {{ posicion ? 'Actualizar' : 'Guardar' }}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
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
let userModal = null;

onMounted(() => {
    userModal = new Modal(document.getElementById('userModal'));
    listarRoles();
    listarUsuarios();
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
    userModal.show();
};

const listarRoles = async () => {
    try {
        const { data } = await indexRoles();
        roles.value = data.datos;
    } catch (error) {
        console.error('Error al cargar roles:', error);
    }
};

const listarUsuarios = async () => {
    try {
        const { data } = await indexUsers(search.value);
        datos.value = data.datos.data;
    } catch (error) {
        console.error('Error al cargar usuarios:', error);
    }
};

const guardarUserAndUpdate = async () => {
    errors.value = {};
    try {
        if (posicion.value) {
            await updateUser(posicion.value, formulario.value);
        } else {
            await storeUserAdmin(formulario.value);
        }
        listarUsuarios();
        userModal.hide();
    } catch (error) {
        if (error.response && error.response.status === 422) {
            errors.value = error.response.data.errors;
        } else {
            console.error('Error al guardar usuario:', error);
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
        userModal.show();
    } catch (error) {
        console.error('Error al obtener usuario:', error);
    }
};

const cambiarEstado = async (id) => {
    try {
        await changeStatus(id);
        listarUsuarios();
    } catch (error) {
        console.error('Error al cambiar estado:', error);
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