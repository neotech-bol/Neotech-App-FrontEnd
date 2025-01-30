<template>
    <div class="container">
        <div class="row">
            <div class="col-12">
                <div class="card">
                    <div class="card-header bg-primary-subtle">
                        <span class="card-title h3">Usuarios</span>
                    </div>
                    <div class="card-body">
                        <div class="row gy-4">
                            <div class="col-12 col-md-8">
                                <input type="text" class="form-control" placeholder="Buscar usuario" v-model="search" @keyup="listarUsuarios()">
                            </div>
                            <div class="col-12 col-md-4 text-center" >
                                <button class="btn btn-primary" @click="abrirModal()">Agregar <i
                                        class="fas fa-plus"></i></button>
                            </div>
                            <div class="col-12">
                                <div class="table-responsive">
                                    <table class="table table-striped table-hover">
                                        <thead class="table-primary">
                                            <tr class="text-center">
                                                <th>Id</th>
                                                <th>Nombre</th>
                                                <th>Correo electrónico</th>
                                                <th>CI</th>
                                                <th>Direccion</th>
                                                <th>Edad</th>
                                                <th>Telefono</th>
                                                <th>Genero</th>
                                                <th>Rol</th>
                                                <th>Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr v-for="(item, index) in datos" :key="item.id" class="text-center">
                                                <td>{{ item.id }}</td>
                                                <td>{{ item.nombre }} {{ item.apellido }}</td>
                                                <td>{{ item.email }}</td>
                                                <td>{{ item.ci }}</td>
                                                <td>{{ item.direccion }}</td>
                                                <td>{{ item.edad }}</td>
                                                <td>{{ item.telefono }}</td>
                                                <td>{{ item.genero }}</td>
                                                <td>{{ item.roles[0]?.name }}</td>
                                                <td>
                                                    <div class="btn-group">
                                                        <button class="btn btn-sm btn-warning" @click="mostarUser(item.id)">Editar</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <!-- Modal -->
    <div class="modal fade" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1"
        aria-labelledby="staticBackdropLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header" :class="posicion != '' ? 'bg-warning' : 'bg-primary'">
                    <h1 class="modal-title fs-5" id="staticBackdropLabel">{{ posicion != '' ? 'Editar registro' : 'Nuevo registro' }}</h1>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="row">

                        <div class="col-md-6">
                            <div class="form-floating mb-3">
                                <input type="text" class="form-control" :class="{ 'is-invalid': errors?.nombre }"
                                    id="nombre" v-model="formulario.nombre" placeholder="Nombre" required>
                                <label for="nombre">👤 Nombre</label>
                                <div class="invalid-feedback" v-if="errors.nombre">
                                    <i class="fas fa-exclamation-circle me-1"></i>{{ errors.nombre?.[0] }}
                                </div>
                            </div>
                        </div>

                        <div class="col-md-6">
                            <div class="form-floating mb-3">
                                <input type="text" class="form-control" :class="{ 'is-invalid': errors?.apellido }"
                                    id="apellido" v-model="formulario.apellido" placeholder="Apellido" required>
                                <label for="apellido">👤 Apellido</label>
                                <div class="invalid-feedback" v-if="errors.apellido">
                                    <i class="fas fa-exclamation-circle me-1"></i>{{ errors.apellido?.[0] }}
                                </div>
                            </div>
                        </div>

                        <div class="col-md-6">
                            <div class="form-floating mb-3">
                                <input type="text" class="form-control" :class="{ 'is-invalid': errors?.ci }" id="ci"
                                    v-model="formulario.ci" placeholder="CI" required>
                                <label for="ci">🪪 CI</label>
                                <div class="invalid-feedback" v-if="errors.ci">
                                    <i class="fas fa-exclamation-circle me-1"></i>{{ errors.ci?.[0] }}
                                </div>
                            </div>
                        </div>

                        <div class="col-md-6">
                            <div class="form-floating mb-3">
                                <input type="text" class="form-control" :class="{ 'is-invalid': errors?.nit }" id="nit"
                                    v-model="formulario.nit" placeholder="NIT">
                                <label for="nit">🏢 NIT</label>
                                <div class="invalid-feedback" v-if="errors.nit">
                                    <i class="fas fa-exclamation-circle me-1"></i>{{ errors.nit?.[0] }}
                                </div>
                            </div>
                        </div>

                        <div class="col-12">
                            <div class="form-floating mb-3">
                                <input type="text" class="form-control" :class="{ 'is-invalid': errors?.direccion }"
                                    id="direccion" v-model="formulario.direccion" placeholder="Dirección" required>
                                <label for="direccion">📍 Dirección</label>
                                <div class="invalid-feedback" v-if="errors.direccion">
                                    <i class="fas fa-exclamation-circle me-1"></i>{{ errors.direccion?.[0]
                                    }}
                                </div>
                            </div>
                        </div>

                        <div class="col-md-6">
                            <div class="form-floating mb-3">
                                <input type="tel" class="form-control" :class="{ 'is-invalid': errors?.telefono }"
                                    id="telefono" v-model="formulario.telefono" placeholder="Teléfono" required>
                                <label for="telefono">📱 Teléfono</label>
                                <div class="invalid-feedback" v-if="errors.telefono">
                                    <i class="fas fa-exclamation-circle me-1"></i>{{ errors.telefono?.[0] }}
                                </div>
                            </div>
                        </div>

                        <div class="col-md-6">
                            <div class="form-floating mb-3">
                                <input type="number" class="form-control" :class="{ 'is-invalid': errors?.edad }"
                                    id="edad" v-model="formulario.edad" placeholder="Edad" required>
                                <label for="edad">🎂 Edad</label>
                                <div class="invalid-feedback" v-if="errors.edad">
                                    <i class="fas fa-exclamation-circle me-1"></i>{{ errors.edad?.[0] }}
                                </div>
                            </div>
                        </div>

                        <div class="col-md-6">
                            <div class="form-floating mb-3">
                                <select class="form-select" :class="{ 'is-invalid': errors?.genero }" id="genero"
                                    v-model="formulario.genero" required>
                                    <option value="">Seleccione</option>
                                    <option value="M">Masculino</option>
                                    <option value="F">Femenino</option>
                                    <option value="O">Otro</option>
                                </select>
                                <label for="genero">⚥ Género</label>
                                <div class="invalid-feedback" v-if="errors.genero">
                                    <i class="fas fa-exclamation-circle me-1"></i>{{ errors.genero?.[0] }}
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-floating mb-3">
                                <select class="form-select" :class="{ 'is-invalid': errors?.role }" id="roles"
                                    v-model="formulario.role" required>
                                    <option value="">Seleccione</option>
                                    <option :value="item.name" v-for="(item, index) in roles" :key="item.id">{{ item.name }}</option>
                                </select>
                                <label for="role">Rol</label>
                                <div class="invalid-feedback" v-if="errors.role">
                                    <i class="fas fa-exclamation-circle me-1"></i>{{ errors.role?.[0] }}
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-floating mb-3">
                                <input type="email" class="form-control" :class="{ 'is-invalid': errors?.email }"
                                    id="email" v-model="formulario.email" placeholder="Email" required>
                                <label for="email">✉️ Email</label>
                                <div class="invalid-feedback" v-if="errors.email">
                                    <i class="fas fa-exclamation-circle me-1"></i>{{ errors.email?.[0] }}
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-danger" data-bs-dismiss="modal">Cerrar</button>
                    <button type="button" class="btn" :class="posicion != '' ? 'btn-warning' : 'btn-primary'" @click="guardarUserAndUpdate()">{{ posicion != '' ? 'Editar' : 'Guardar' }}</button>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup>
import { indexRoles } from '@/Services/RolesPermisosService';
import { indexUsers, showUser, storeUserAdmin, updateUser } from '@/Services/UsuarioService';
import { Modal } from 'bootstrap/dist/js/bootstrap.bundle.min';
import { onMounted, ref } from 'vue';
const formulario = ref({});
const errors = ref({});
const datos = ref([]);
let modal = null;
let instanciaModal = null;
const roles = ref([]);
const search = ref('');
const posicion = ref('');
onMounted(() => {
    modal = document.getElementById('staticBackdrop');
    instanciaModal = new Modal(modal);
    listarRoles();
    listarUsuarios();
})
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
    instanciaModal.show();
}
const cerrarModal = () => {
    instanciaModal.hide();
}
const listarRoles = async () => {
    try {
        const { data } = await indexRoles();
        roles.value = data.datos;
        console.log(roles.value);
    } catch (error) {
        console.log(error);
    }
}
const listarUsuarios = async () => {
    try {
        const { data } = await indexUsers(search.value);
        datos.value = data.datos.data;
        console.log(datos.value);
    } catch (error) {
        console.log(error);
    }
}
const guardarUserAndUpdate = async () => { 
    errors.value = {};
    try {
        posicion.value != '' ? await updateUser(posicion.value, formulario.value) : await storeUserAdmin(formulario.value);
        listarUsuarios();
        cerrarModal();
    } catch (error) {
        if (error.response.status == 422) {
            errors.value = error.response.data.errors;
        } else {
            console.log(error);
        }
    }
}
const mostarUser = async (id) => {
    console.log(id);
    errors.value = {};
    try {
        const {data} = await showUser(id);
        console.log(data);
        formulario.value = {
            nombre: data.dato.nombre,
            apellido: data.dato.apellido,
            ci: data.dato.ci,
            nit: data.dato.nit,
            direccion: data.dato.direccion,
            telefono: data.dato.telefono,
            edad: data.dato.edad,
            genero: data.dato.genero,
            role: data.dato.roles.length > 0 ? data.dato.roles[0].name : 'Sin rol', // Accediendo al primer rol
            email: data.dato.email,
        };
        instanciaModal.show();
        posicion.value = id;
    } catch (error) {
        console.log(error);
    }
}
</script>
<style></style>