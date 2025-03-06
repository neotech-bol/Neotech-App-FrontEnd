<template>
  <div class="contenedor-auth">
    <nav class="barra-navegacion">
      <a @click.prevent="irAHome" href="#" class="logo">
        <img src="/public/logo/Logo Neofetch PNG.png" alt="Logo" class="logo-image" />
      </a>
      <a @click.prevent="irAHome" href="#" class="boton-home">Ir al Home</a>
    </nav>
    <div class="contenido-auth">
      <div class="imagen-auth">
        <img src="/imagenes/sunset-photography-1000-x-1000-wallpaper-gzdhdzyk67cfal0m.jpg" alt="Imagen de tecnología" class="imagen-fondo">
      </div>
      <div class="formulario-auth">
        <h1 class="titulo-auth">Bienvenido de nuevo</h1>
        <p class="subtitulo-auth">Inicia sesión para acceder a tu cuenta</p>
        <form class="formulario" @submit.prevent="iniciarSesion" @keyup.enter="iniciarSesion">
          <div v-if="error" class="error-mensaje">
            {{ error }}
          </div>
          <div class="campo-formulario">
            <label for="email">Correo electrónico</label>
            <input 
              id="email" 
              v-model="credenciales.email" 
              type="email" 
              required 
              placeholder="tu@email.com"
              autocomplete="email"
            >
          </div>
          <div class="campo-formulario">
            <label for="password">Contraseña</label>
            <div class="password-container">
              <input 
                id="password" 
                v-model="credenciales.password" 
                :type="mostrarPassword ? 'text' : 'password'" 
                required 
                placeholder="Tu contraseña"
                autocomplete="current-password"
              >
              <button 
                type="button" 
                class="toggle-password" 
                @click="mostrarPassword = !mostrarPassword"
                :aria-label="mostrarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
              >
                <svg v-if="mostrarPassword" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path>
                  <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path>
                  <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path>
                  <line x1="2" x2="22" y1="2" y2="22"></line>
                </svg>
              </button>
            </div>
          </div>
          <div class="opciones-adicionales">
            <label class="recordar-usuario">
              <input type="checkbox" v-model="recordar">
              <span>Recordarme</span>
            </label>
            <a href="#" class="enlace-olvidado">¿Olvidaste tu contraseña?</a>
          </div>
          <button type="submit" class="boton-auth" :disabled="isLoading || !credenciales.email || !credenciales.password">
            <span v-if="isLoading" class="loader"></span>
            <span>{{ isLoading ? 'Iniciando sesión...' : 'Iniciar sesión' }}</span>
          </button>
        </form>
        <div class="separador">
          <span>o</span>
        </div>
        <p class="texto-alternativa">
          ¿No tienes una cuenta? <a href="#" @click.prevent="irARegistro" class="enlace-auth">Regístrate</a>
        </p>
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
const credenciales = ref({
  email: '',
  password: ''
});
const recordar = ref(false);
const error = ref('');
const isLoading = ref(false);
const mostrarPassword = ref(false);

const iniciarSesion = async () => {
  if (!credenciales.value.email || !credenciales.value.password) {
    return;
  }
  
  error.value = '';
  isLoading.value = true;
  try {
    const { data } = await login(credenciales.value);
    console.log(data);
    const tokenEncrypt = Buffer.from(data.access_token).toString('base64');
    localStorage.setItem('token', tokenEncrypt);
    
    if (recordar.value) {
      localStorage.setItem('email', credenciales.value.email);
    } else {
      localStorage.removeItem('email');
    }
    
    let datosUser = {
      id: data.user.id,
      nombre: data.user.nombre,
      apellido: data.user.apellido,
      email: data.user.email,
      direccion: data.user.direccion,
      telefono: data.user.telefono,
      rol: data.user.roles[0].name
    };
    localStorage.setItem('datosUser', JSON.stringify(datosUser));
    
    if (data.user.roles[0].name === 'cliente') {
      router.push({path: '/'});
    } else {
      router.push({path: '/admin-panel'});
    }
  } catch (err) {
    console.error(err);
    if (err.response && err.response.data) {
      if (err.response.data.message) {
        error.value = err.response.data.message;
      } else if (typeof err.response.data === 'string') {
        error.value = err.response.data;
      } else {
        error.value = 'Ha ocurrido un error. Por favor, inténtelo de nuevo.';
      }
    } else {
      error.value = 'Ha ocurrido un error de red. Por favor, verifique su conexión.';
    }
  } finally {
    isLoading.value = false;
  }
};

const irAHome = () => {
  router.push('/');
};

const irARegistro = () => {
  router.push('/register');
};
</script>

<style scoped>
.contenedor-auth {
  display: flex;
  min-height: 100vh;
  background-color: #f0f2f5;
  flex-direction: column;
}

.barra-navegacion {
  background-color: #fff;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.logo {
  text-decoration: none;
  color: #333;
  cursor: pointer;
}

.logo-image {
  height: 40px;
  width: auto;
}

.boton-home {
  background-color: #1877F2;
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.25rem;
  font-size: 1rem;
  cursor: pointer;
  text-decoration: none;
  transition: background-color 0.3s;
}

.boton-home:hover {
  background-color: #166fe5;
}

.contenido-auth {
  flex: 1;
  display: flex;
}

.imagen-auth {
  display: none;
}

.imagen-fondo {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.formulario-auth {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 2rem;
  background-color: white;
}

.titulo-auth {
  font-size: 2.5rem;
  color: #333;
  margin-bottom: 0.5rem;
}

.subtitulo-auth {
  font-size: 1rem;
  color: #666;
  margin-bottom: 2rem;
}

.formulario {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.campo-formulario {
  display: flex;
  flex-direction: column;
}

.campo-formulario label {
  margin-bottom: 0.5rem;
  font-weight: bold;
  color: #333;
}

.campo-formulario input {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 0.25rem;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.campo-formulario input:focus {
  outline: none;
  border-color: #1877F2;
  box-shadow: 0 0 0 2px rgba(24, 119, 242, 0.2);
}

.password-container {
  position: relative;
}

.password-container input {
  width: 100%;
  padding-right: 40px;
}

.toggle-password {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.toggle-password:hover {
  color: #333;
}

.opciones-adicionales {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
}

.recordar-usuario {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.enlace-olvidado {
  color: #1877F2;
  text-decoration: none;
}

.enlace-olvidado:hover {
  text-decoration: underline;
}

.boton-auth {
  background-color: #1877F2;
  color: white;
  padding: 0.75rem;
  border: none;
  border-radius: 0.25rem;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  height: 48px;
}

.boton-auth:hover:not(:disabled) {
  background-color: #166fe5;
}

.boton-auth:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.loader {
  width: 20px;
  height: 20px;
  border: 2px solid #ffffff;
  border-bottom-color: transparent;
  border-radius: 50%;
  display: inline-block;
  animation: rotation 1s linear infinite;
}

@keyframes rotation {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.separador {
  display: flex;
  align-items: center;
  text-align: center;
  margin: 1.5rem 0;
}

.separador::before,
.separador::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid #ddd;
}

.separador span {
  padding: 0 0.5rem;
  color: #666;
}

.texto-alternativa {
  margin-top: 1.5rem;
  text-align: center;
  color: #666;
}

.enlace-auth {
  color: #1877F2;
  text-decoration: none;
  font-weight: 600;
}

.enlace-auth:hover {
  text-decoration: underline;
}

.error-mensaje {
  background-color: #ffebee;
  color: #c62828;
  padding: 0.75rem;
  border-radius: 0.25rem;
  margin-bottom: 1rem;
  text-align: center;
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (min-width: 768px) {
  .imagen-auth {
    display: block;
    flex: 1;
  }

  .formulario-auth {
    flex: 1;
  }
}

@media (max-width: 767px) {
  .titulo-auth {
    font-size: 2rem;
  }
  
  .boton-home {
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
  }
}

@media (max-width: 480px) {
  .opciones-adicionales {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
  
  .enlace-olvidado {
    align-self: flex-end;
  }
}
</style>