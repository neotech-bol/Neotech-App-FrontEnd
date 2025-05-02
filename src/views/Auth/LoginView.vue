<template>
  <div class="contenedor-auth">
    <nav class="barra-navegacion">
      <a @click.prevent="irAHome" href="#" class="logo">
        <img src="/public/logo/Logo Neofetch PNG.png" alt="Logo" class="logo-image" />
      </a>
      <a @click.prevent="irAHome" href="#" class="boton-home">
        <i class="fas fa-home"></i>Inicio
      </a>
    </nav>
    <div class="contenido-auth">
      <div class="imagen-auth">
        <img src="/imagenes/sunset-photography-1000-x-1000-wallpaper-gzdhdzyk67cfal0m.webp" alt="Imagen de tecnología"
          class="imagen-fondo">
        <div class="overlay-texto">
          <h2>Bienvenido a nuestra plataforma</h2>
          <p>Accede a todas nuestras funcionalidades y servicios</p>
        </div>
      </div>
      <div class="formulario-auth">
        <div class="formulario-contenedor" :class="{ 'form-active': formActive }">
          <h1 class="titulo-auth">Bienvenido de nuevo</h1>
          <p class="subtitulo-auth">Inicia sesión para acceder a tu cuenta</p>

          <transition name="fade">
            <div v-if="error" class="error-mensaje">
              <i class="fas fa-exclamation-circle"></i>
              {{ error }}
            </div>
          </transition>

          <form class="formulario" @submit.prevent="iniciarSesion">
            <div class="campo-formulario" :class="{ 'campo-activo': campoActivo === 'email' }">
              <label for="email">
                <i class="fas fa-envelope"></i> Correo electrónico
              </label>
              <input id="email" v-model="credenciales.email" type="email" required placeholder="tu@email.com"
                autocomplete="email" :class="{ 'campo-con-valor': credenciales.email }" @focus="campoActivo = 'email'"
                @blur="campoActivo = ''">
              <span class="campo-barra"></span>
            </div>

            <div class="campo-formulario" :class="{ 'campo-activo': campoActivo === 'password' }">
              <label for="password">
                <i class="fas fa-lock"></i> Contraseña
              </label>
              <div class="password-container">
                <input id="password" v-model="credenciales.password" :type="mostrarPassword ? 'text' : 'password'"
                  required placeholder="Tu contraseña" autocomplete="current-password"
                  :class="{ 'campo-con-valor': credenciales.password }" @focus="campoActivo = 'password'"
                  @blur="campoActivo = ''">
                <button type="button" class="toggle-password" @click="mostrarPassword = !mostrarPassword"
                  :aria-label="mostrarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'">
                  <i :class="mostrarPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                </button>
                <span class="campo-barra"></span>
              </div>
            </div>

            <div class="opciones-adicionales">
              <label class="recordar-usuario">
                <input type="checkbox" v-model="recordar">
                <span class="checkmark"></span>
                <span>Recordarme</span>
              </label>
            </div>

            <button type="submit" class="boton-auth"
              :disabled="isLoading || !credenciales.email || !credenciales.password"
              :class="{ 'boton-cargando': isLoading }">
              <span v-if="isLoading" class="loader"></span>
              <span>{{ isLoading ? 'Iniciando sesión...' : 'Iniciar sesión' }}</span>
            </button>
          </form>

          <p class="texto-alternativa">
            ¿No tienes una cuenta? <a href="#" @click.prevent="irARegistro" class="enlace-auth">Regístrate ahora</a>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { login } from '@/Services/AuthService';
import { Buffer } from "buffer";
import { useUserStore } from '@/stores/userAuht'; 

const router = useRouter();
// Verificar si hay un parámetro de redirección en la URL
const route = useRoute();
const userStore = useUserStore();
const credenciales = ref({
  email: '',
  password: ''
});
const recordar = ref(false);
const error = ref('');
const isLoading = ref(false);
const mostrarPassword = ref(false);
const campoActivo = ref('');
const formActive = ref(false);




onMounted(() => {
  // Activar animación del formulario
  setTimeout(() => {
    formActive.value = true;
  }, 100);

  // Verificar si hay credenciales guardadas
  const savedEmail = localStorage.getItem('savedEmail');
  if (savedEmail) {
    credenciales.value.email = savedEmail;
    recordar.value = true;
  }

  // Enfocar el campo adecuado
  setTimeout(() => {
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');

    if (!credenciales.value.email && emailInput) {
      emailInput.focus();
      campoActivo.value = 'email';
    } else if (passwordInput) {
      passwordInput.focus();
      campoActivo.value = 'password';
    }
  }, 500);

});

// Funcion para iniciar sesión
const iniciarSesion = async () => {
  if (!credenciales.value.email || !credenciales.value.password) {
    return;
  }
  error.value = '';
  isLoading.value = true;
  
  // Guardar email si "recordarme" está activado
  if (recordar.value) {
    localStorage.setItem('savedEmail', credenciales.value.email);
  } else {
    localStorage.removeItem('savedEmail');
  }

  try {
    const { data } = await login(credenciales.value);

    const tokenEncrypt = Buffer.from(data.access_token).toString('base64');
    localStorage.setItem('token', tokenEncrypt);

    const datosUser = {
      id: data.user.id,
      nombre: data.user.nombre,
      apellido: data.user.apellido,
      email: data.user.email,
      direccion: data.user.direccion,
      telefono: data.user.telefono,
      rol: data.user.roles[0].name
    };

    // Update the user store with the user data
    userStore.user = datosUser;
    localStorage.setItem('datosUser', JSON.stringify(datosUser));

    // Get redirect path from route query
    const redirectPath = route.query.redirect;
    
    // Use the centralized redirect handler
    userStore.handleLoginRedirect(router, redirectPath ? redirectPath.toString() : null);
    
  } catch (err) {
    manejarError(err);
  } finally {
    isLoading.value = false;
  }
};

const manejarError = (err) => {
  console.error('Error en el inicio de sesión:', err);
  if (err.response) {
    if (err.response.status === 422) {
      error.value = 'Credenciales inválidas. Por favor, verifica tu email y contraseña.';
    } else if (err.response.status === 404) {
      error.value = 'Credenciales incorrectas. Por favor, verifica tu email y contraseña.';
    } else {
      error.value = 'Error en el servidor. Por favor, intenta más tarde.';
    }
  } else {
    error.value = 'No se pudo conectar con el servidor. Por favor, verifica tu conexión a internet.';
  }

  // Animación de error
  const formulario = document.querySelector('.formulario');
  if (formulario) {
    formulario.classList.add('shake');
    setTimeout(() => {
      formulario.classList.remove('shake');
    }, 500);
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
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css');

.contenedor-auth {
  display: flex;
  min-height: 100vh;
  background-color: #f8f9fa;
  flex-direction: column;
}

.barra-navegacion {
  background-color: #fff;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 100;
}

.logo {
  text-decoration: none;
  color: #333;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.logo-image {
  height: 40px;
  width: auto;
  transition: transform 0.3s ease;
}

.logo:hover .logo-image {
  transform: scale(1.05);
}

.boton-home {
  background-color: #4361ee;
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
}

.boton-home:hover {
  background-color: #3a56d4;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(67, 97, 238, 0.3);
}

.boton-home:active {
  transform: translateY(0);
}

.contenido-auth {
  flex: 1;
  display: flex;
}

.imagen-auth {
  display: none;
  position: relative;
}

.imagen-fondo {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.overlay-texto {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.7));
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  color: white;
  text-align: center;
}

.overlay-texto h2 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  opacity: 0;
  transform: translateY(20px);
  animation: fadeInUp 0.8s ease forwards 0.5s;
}

.overlay-texto p {
  font-size: 1.2rem;
  max-width: 80%;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  opacity: 0;
  transform: translateY(20px);
  animation: fadeInUp 0.8s ease forwards 0.8s;
}

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.formulario-auth {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  background-color: white;
}

.formulario-contenedor {
  width: 100%;
  max-width: 450px;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
  background-color: white;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.5s ease;
}

.form-active {
  opacity: 1;
  transform: translateY(0);
}

.titulo-auth {
  font-size: 2.5rem;
  color: #333;
  margin-bottom: 0.5rem;
  font-weight: 700;
}

.subtitulo-auth {
  font-size: 1.1rem;
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
  position: relative;
  margin-bottom: 0.5rem;
}

.campo-formulario label {
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #333;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: color 0.3s ease;
}

.campo-formulario.campo-activo label {
  color: #4361ee;
}

.campo-formulario label i {
  color: #4361ee;
}

.campo-formulario input {
  padding: 0.9rem 1rem;
  border: 1.5px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background-color: #f8f9fa;
  position: relative;
  z-index: 1;
}

.campo-formulario input:focus {
  outline: none;
  border-color: #4361ee;
  background-color: white;
}

.campo-barra {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 2px;
  background-color: #4361ee;
  transition: width 0.3s ease;
  z-index: 2;
}

.campo-formulario.campo-activo .campo-barra {
  width: 100%;
}

.campo-con-valor {
  background-color: white !important;
  border-color: #4361ee !important;
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
  right: 12px;
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
  transition: color 0.3s ease;
  z-index: 2;
}

.toggle-password:hover {
  color: #4361ee;
}

.opciones-adicionales {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  font-size: 0.95rem;
}

.recordar-usuario {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  position: relative;
  padding-left: 28px;
  user-select: none;
}

.recordar-usuario input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

.checkmark {
  position: absolute;
  top: 0;
  left: 0;
  height: 20px;
  width: 20px;
  background-color: #f8f9fa;
  border: 1.5px solid #e0e0e0;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.recordar-usuario:hover input~.checkmark {
  background-color: #f0f0f0;
}

.recordar-usuario input:checked~.checkmark {
  background-color: #4361ee;
  border-color: #4361ee;
}

.checkmark:after {
  content: "";
  position: absolute;
  display: none;
}

.recordar-usuario input:checked~.checkmark:after {
  display: block;
}

.recordar-usuario .checkmark:after {
  left: 7px;
  top: 3px;
  width: 5px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.boton-auth {
  background-color: #4361ee;
  color: white;
  padding: 0.9rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  height: 54px;
  margin-top: 1.5rem;
  overflow: hidden;
  position: relative;
}

.boton-auth:hover:not(:disabled) {
  background-color: #3a56d4;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(67, 97, 238, 0.3);
}

.boton-auth:active:not(:disabled) {
  transform: translateY(0);
}

.boton-auth:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.boton-auth::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition: width 0.6s ease, height 0.6s ease;
}

.boton-auth:hover:not(:disabled)::before {
  width: 300px;
  height: 300px;
}

.boton-cargando {
  pointer-events: none;
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

.texto-alternativa {
  margin-top: 2rem;
  text-align: center;
  color: #666;
}

.enlace-auth {
  color: #4361ee;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.3s ease;
  position: relative;
  display: inline-block;
}

.enlace-auth::after {
  content: '';
  position: absolute;
  width: 0;
  height: 2px;
  bottom: -2px;
  left: 0;
  background-color: #4361ee;
  transition: width 0.3s ease;
}

.enlace-auth:hover {
  color: #3a56d4;
}

.enlace-auth:hover::after {
  width: 100%;
}

.error-mensaje {
  background-color: #fee2e2;
  color: #b91c1c;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.error-mensaje i {
  font-size: 1.2rem;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.shake {
  animation: shake 0.5s cubic-bezier(.36, .07, .19, .97) both;
}

@keyframes shake {

  10%,
  90% {
    transform: translateX(-1px);
  }

  20%,
  80% {
    transform: translateX(2px);
  }

  30%,
  50%,
  70% {
    transform: translateX(-4px);
  }

  40%,
  60% {
    transform: translateX(4px);
  }
}

/* Mejoras para dispositivos móviles */
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
  .contenedor-auth {
    background: linear-gradient(135deg, #4361ee 0%, #3a56d4 100%);
  }

  .formulario-auth {
    background: transparent;
    padding: 1rem;
  }

  .formulario-contenedor {
    padding: 1.5rem;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  }

  .titulo-auth {
    font-size: 2rem;
    text-align: center;
  }

  .subtitulo-auth {
    text-align: center;
  }

  .boton-home {
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
  }

  .formulario-contenedor {
    padding: 1.25rem;
  }

  .campo-formulario input {
    padding: 0.8rem;
  }

  .boton-auth {
    height: 48px;
  }
}

@media (max-width: 480px) {
  .barra-navegacion {
    padding: 0.75rem 1rem;
  }

  .logo-image {
    height: 32px;
  }

  .boton-home {
    padding: 0.5rem 0.75rem;
    font-size: 0.85rem;
  }

  .formulario-contenedor {
    padding: 1.25rem;
  }

  .campo-formulario input {
    padding: 0.8rem;
  }

  .boton-auth {
    height: 48px;
  }
}

/* Animaciones para entrada en dispositivos móviles */
@media (max-width: 767px) {
  .formulario-contenedor {
    animation: slideUpMobile 0.5s ease forwards;
  }

  @keyframes slideUpMobile {
    from {
      transform: translateY(50px);
      opacity: 0;
    }

    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
}
</style>
/* const iniciarSesion = async () => {
error.value = '';
isLoading.value = true;

// Guardar email si "recordarme" está activado
if (recordar.value) {
localStorage.setItem('savedEmail', credenciales.value.email);
} else {
localStorage.removeItem('savedEmail');
}

try {
const { data } = await login(credenciales.value);

// Verificar si el correo está verificado
if (data.email_verified === false) {
// Si no está verificado, guardar datos para poder reenviar el correo
const datosUser = {
email: credenciales.value.email
};
localStorage.setItem('datosUser', JSON.stringify(datosUser));

// Redirigir a la página de verificación pendiente
router.replace('/verificacion-pendiente');
return;
}

// Si el correo está verificado, continuar con el flujo normal
const tokenEncrypt = Buffer.from(data.access_token).toString('base64');
localStorage.setItem('token', tokenEncrypt);

const datosUser = {
id: data.user.id,
nombre: data.user.nombre,
apellido: data.user.apellido,
email: data.user.email,
direccion: data.user.direccion,
telefono: data.user.telefono,
};

localStorage.setItem('datosUser', JSON.stringify(datosUser));

// Animación de salida antes de redirigir
formActive.value = false;

setTimeout(() => {
if (data.user.roles[0].name === 'cliente') {
router.replace('/');
} else {
router.replace('/admin-panel');
}
}, 300);

} catch (err) {
manejarError(err);
} finally {
isLoading.value = false;
}
}; */