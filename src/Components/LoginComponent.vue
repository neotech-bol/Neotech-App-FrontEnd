<template>
    <div class="bg-gradient min-vh-100 d-flex align-items-center justify-content-center py-5">
        <div class="container">
            <div class="row justify-content-center">
                <div class="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5">
                    <div class="card bg-dark text-white shadow-lg rounded-lg overflow-hidden">
                        <div class="card-header bg-primary text-white text-center py-4">
                            <h2 class="h3 mb-0">Iniciar Sesión</h2>
                        </div>
                        <div class="card-body p-4 p-md-5">
                            <p class="text-muted text-center mb-4">Ingrese sus credenciales para acceder</p>

                            <form @submit.prevent="inicioSesion">
                                <div v-if="errors.general" class="alert alert-danger" role="alert">
                                    <i class="fas fa-exclamation-circle me-1"></i>{{ errors.general }}
                                </div>

                                <div class="form-floating mb-3">
                                    <input type="email" class="form-control bg-dark text-white"
                                        :class="{ 'is-invalid': errors.email }" id="email" v-model="formulario.email"
                                        placeholder="Email" required>
                                    <label for="email" class="text-muted">✉️ Email</label>
                                    <div class="invalid-feedback" v-if="errors.email">
                                        <i class="fas fa-exclamation-circle me-1"></i>{{ errors.email[0] }}
                                    </div>
                                </div>

                                <div class="form-floating mb-3">
                                    <input type="password" class="form-control bg-dark text-white"
                                        :class="{ 'is-invalid': errors.password }" id="password"
                                        v-model="formulario.password" placeholder="Contraseña" required>
                                    <label for="password" class="text-muted">🔒 Contraseña</label>
                                    <div class="invalid-feedback" v-if="errors.password">
                                        <i class="fas fa-exclamation-circle me-1"></i>{{ errors.password[0] }}
                                    </div>
                                </div>

                                <div class="d-grid gap-2 mt-4">
                                    <button type="submit" class="btn btn-primary btn-lg" :disabled="isLoading">
                                        <span v-if="!isLoading">Ingresar</span>
                                        <div v-else class="spinner-border spinner-border-sm" role="status">
                                            <span class="visually-hidden">Cargando...</span>
                                        </div>
                                    </button>
                                </div>
                            </form>

                            <div class="mt-4 text-center">
                                <a href="#" class="text-muted">¿Olvidaste tu contraseña?</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { login } from '@/Services/AuthService';
import { Buffer } from "buffer";

const router = useRouter();
const formulario = ref({
    email: '',
    password: ''
});
const errors = ref({});
const isLoading = ref(false);

const inicioSesion = async () => {
    errors.value = {}; // Limpiar errores anteriores
    isLoading.value = true; // Establecer estado de carga
    try {
        const { data } = await login(formulario.value);
        const tokenEncrypt = Buffer.from(data.access_token).toString('base64');
        localStorage.setItem('token', tokenEncrypt);
        
        let datosUser = {
            id: data.user.id,
            nombre: data.user.nombre,
            apellido: data.user.apellido,
            email: data.user.email,
            direccion: data.user.direccion,
            telefono: data.user.telefono
        };
        localStorage.setItem('datosUser', JSON.stringify(datosUser));
        
        // Redirigir según el rol del usuario
        if (data.user.roles[0].name === 'cliente') {
            router.push('/');
        } else {
            router.push('/admin-panel');
        }
    } catch (error) {
        console.error(error);
        if (error.response && error.response.data) {
            if (error.response.data.errors) {
                // Manejar errores de validación
                errors.value = error.response.data.errors;
            } else if (error.response.data.message) {
                // Manejar mensaje de error general
                errors.value = { general: error.response.data.message };
            } else {
                errors.value = error.response.data;
            }
        } else {
            errors.value = { general: 'Ha ocurrido un error. Por favor, inténtelo de nuevo.' };
        }
    } finally {
        isLoading.value = false; // Restablecer estado de carga
    }
};
</script>

<style scoped>
.bg-gradient {
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
}

.card {
    transition: all 0.3s ease-in-out;
}

.card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2) !important;
}

.form-control {
    border-color: #2a2a3a;
}

.form-control:focus {
    border-color: #3a3a4a;
    box-shadow: 0 0 0 0.2rem rgba(58, 58, 74, 0.25);
}

.btn-primary {
    background-color: #4a5568;
    border-color: #4a5568;
}

.btn-primary:hover,
.btn-primary:focus {
    background-color: #2d3748;
    border-color: #2d3748;
}

.invalid-feedback {
    font-size: 0.875em;
}

@media (max-width: 767.98px) {
    .card-body {
        padding: 1.5rem;
    }
}
</style>