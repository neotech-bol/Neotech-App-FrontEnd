<template>
    <div class="login-container">
        <div class="login-background"></div>
        <div class="container">
            <div class="row justify-content-center">
                <div class="col-md-6">
                    <div class="card login-card">
                        <div class="card-body">
                            <h2 class="text-center mb-4">Iniciar sesión</h2>
                                <div class="mb-3">
                                    <label for="email" class="form-label">Correo electrónico</label>
                                    <input type="email" class="form-control" id="email" v-model="formulario.email" required>
                                </div>
                                <div class="mb-3">
                                    <label for="password" class="form-label">Contraseña</label>
                                    <input type="password" class="form-control" id="password" v-model="formulario.password"
                                        required>
                                </div>
                                <div class="d-grid">
                                    <button type="submit" class="btn btn-primary btn-login" @click="inicioSesion()">Ingresar</button>
                                </div>
                            <div class="text-center mt-3">
                                <a href="#" class="text-decoration-none">¿Olvidaste tu contraseña?</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { login } from '@/Services/AuthService';
import { ref } from 'vue';
import { Buffer } from "buffer";
import { useRouter } from 'vue-router';
const formulario = ref({
    email: '',
    password: ''
})
const router = useRouter();
const inicioSesion = async () => {
    try {
        const {data} = await login(formulario.value);
        const tokenEncrypt = Buffer.from(data.access_token).toString('base64');
        localStorage.setItem('token', tokenEncrypt);
        let datosUser = {
            id: data.user.id,
            nombre: data.user.nombre,
            apellido: data.user.apellido,
            email: data.user.email,
            direccion: data.user.direccion,
            telefono: data.user.telefono
        }
        localStorage.setItem('datosUser', JSON.stringify(datosUser));
        if(data.user.roles[0].name == 'cliente'){
            router.push('/');
        }else {
            router.push('/inicio');
        }
        console.log(data);
    } catch (error) {
        console.log(error);
    }
}
</script>

<style scoped>
.login-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    position: relative;
    overflow: hidden;
}

.login-background {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, #ff9a9e 0%, #fad0c4 99%, #fad0c4 100%);
    z-index: -1;
}

.login-card {
    background-color: rgba(255, 255, 255, 0.9);
    border-radius: 15px;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
}

.btn-login {
    background-color: #ff6b6b;
    border-color: #ff6b6b;
    transition: all 0.3s ease;
}

.btn-login:hover {
    background-color: #ff5252;
    border-color: #ff5252;
    transform: translateY(-2px);
}

.form-control:focus {
    border-color: #ff6b6b;
    box-shadow: 0 0 0 0.2rem rgba(255, 107, 107, 0.25);
}

a {
    color: #ff6b6b;
}

a:hover {
    color: #ff5252;
}
</style>