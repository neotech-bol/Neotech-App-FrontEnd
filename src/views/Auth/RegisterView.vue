<template>
  <div class="contenedor-auth">
    <nav class="barra-navegacion">
      <a @click.prevent="irAHome" href="#" class="logo">
        <img src="/public/logo/Logo Neofetch PNG.png" alt="Logo" class="logo-image" />
      </a>
      <a @click.prevent="irAHome" href="#" class="boton-home">
        <i class="fas fa-arrow-left"></i> Ir al Home
      </a>
    </nav>
    <div class="contenido-auth">
      <div class="imagen-auth">
        <img src="../../../public/imagenes/sunset-photography-1000-x-1000-wallpaper-gzdhdzyk67cfal0m.jpg"
          alt="Imagen de naturaleza" class="imagen-fondo">
      </div>
      <div class="formulario-auth">
        <h1 class="titulo-auth">Crear una cuenta</h1>
        <p class="subtitulo-auth">Únete a nuestra comunidad y disfruta de nuestros servicios</p>
        <form class="formulario">
          <div class="campos-grid">
            <div class="campo-formulario">
              <label for="nombre"><i class="fas fa-user"></i> Nombre</label>
              <input id="nombre" v-model="formulario.nombre" type="text" required placeholder="Ej: María"
                :class="{ 'is-invalid': errors.nombre }">
              <span v-if="errors.nombre" class="mensaje-error"><i class="fas fa-exclamation-circle"></i>{{ errors.nombre[0] }}</span>
            </div>
            <div class="campo-formulario">
              <label for="apellido"><i class="fas fa-user"></i> Apellido</label>
              <input id="apellido" v-model="formulario.apellido" type="text" required placeholder="Ej: García"
                :class="{ 'is-invalid': errors.apellido }">
              <span v-if="errors.apellido" class="mensaje-error"><i class="fas fa-exclamation-circle"></i>{{ errors.apellido[0] }}</span>
            </div>
            <div class="campo-formulario">
              <label for="ci"><i class="fas fa-id-card"></i> CI</label>
              <input id="ci" v-model="formulario.ci" type="text" required placeholder="Ej: 1234567"
                :class="{ 'is-invalid': errors.ci }">
              <span v-if="errors.ci" class="mensaje-error"><i class="fas fa-exclamation-circle"></i>{{ errors.ci[0] }}</span>
            </div>
            <div class="campo-formulario">
              <label for="nit"><i class="fas fa-building"></i> NIT</label>
              <input id="nit" v-model="formulario.nit" type="text" placeholder="Ej: 1234567890"
                :class="{ 'is-invalid': errors.nit }">
              <span v-if="errors.nit" class="mensaje-error"><i class="fas fa-exclamation-circle"></i>{{ errors.nit[0] }}</span>
            </div>
            <div class="campo-formulario">
              <label for="direccion"><i class="fas fa-map-marker-alt"></i> Dirección</label>
              <input id="direccion" v-model="formulario.direccion" type="text" required placeholder="Ej: Calle 123, Ciudad"
                :class="{ 'is-invalid': errors.direccion }">
              <span v-if="errors.direccion" class="mensaje-error"><i class="fas fa-exclamation-circle"></i>{{ errors.direccion[0] }}</span>
            </div>
            <div class="campo-formulario">
              <label for="telefono"><i class="fas fa-phone"></i> Teléfono</label>
              <input id="telefono" v-model="formulario.telefono" type="tel" required placeholder="Ej: +591 12345678"
                :class="{ 'is-invalid': errors.telefono }">
              <span v-if="errors.telefono" class="mensaje-error"><i class="fas fa-exclamation-circle"></i>{{ errors.telefono[0] }}</span>
            </div>
            <div class="campo-formulario">
              <label for="edad"><i class="fas fa-birthday-cake"></i> Edad</label>
              <input id="edad" v-model="formulario.edad" type="number" required placeholder="Ej: 30"
                :class="{ 'is-invalid': errors.edad }">
              <span v-if="errors.edad" class="mensaje-error"><i class="fas fa-exclamation-circle"></i>{{ errors.edad[0] }}</span>
            </div>
            <div class="campo-formulario">
              <label for="genero"><i class="fas fa-venus-mars"></i> Género</label>
              <select id="genero" v-model="formulario.genero" required :class="{ 'is-invalid': errors.genero }">
                <option value="">Selecciona un género</option>
                <option value="M">Masculino</option>
                <option value="F">Femenino</option>
                <option value="O">Otro</option>
              </select>
              <span v-if="errors.genero" class="mensaje-error"><i class="fas fa-exclamation-circle"></i>{{ errors.genero[0] }}</span>
            </div>
            <div class="campo-formulario">
              <label for="email"><i class="fas fa-envelope"></i> Correo electrónico</label>
              <input id="email" v-model="formulario.email" type="email" required placeholder="tu@email.com"
                :class="{ 'is-invalid': errors.email }">
              <span v-if="errors.email" class="mensaje-error"><i class="fas fa-exclamation-circle"></i>{{ errors.email[0] }}</span>
            </div>
          </div>
          <button type="submit" class="boton-auth" :disabled="isLoading" @click="registrarUsuario()">
            <span v-if="isLoading" class="loader"></span>
            <span><i class="fas fa-user-plus"></i> {{ isLoading ? 'Registrando...' : 'Registrarse' }}</span>
          </button>
        </form>
        <p class="texto-alternativa">
          ¿Ya tienes una cuenta? <a href="#" @click.prevent="irALogin" class="enlace-auth">Inicia sesión</a>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { register } from '@/Services/AuthService';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { Buffer } from "buffer";

const router = useRouter();
const formulario = ref({
  nombre: '',
  apellido: '',
  ci: '',
  nit: '',
  direccion: '',
  telefono: '',
  edad: '',
  genero: '',
  email: '',
});
const errors = ref({});
const isLoading = ref(false);

const registrarUsuario = async () => {
  errors.value = {};
  isLoading.value = true;
  try {
    const { data } = await register(formulario.value);
    
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
    
    if (data.user.roles[0].name === 'cliente') {
      router.replace('/');
    } else {
      router.replace('/admin-panel');
    }
  } catch (error) {
    manejarError(error);
  } finally {
    isLoading.value = false;
  }
};

const manejarError = (error) => {
  console.error('Error en el registro:', error);
  if (error.response) {
    if (error.response.status === 422) {
      errors.value = error.response.data;
    } else {
      errors.value = { message: 'Error en el servidor, por favor intenta más tarde.' };
    }
  } else {
    errors.value = { message: 'Ocurrió un error inesperado, por favor intenta más tarde.' };
  }
};

const irALogin = () => {
  router.push('/login');
};

const irAHome = () => {
  router.push('/');
};
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css');

.contenedor-auth {
  min-height: 100vh;
  background-color: #f0f2f5;
  display: flex;
  flex-direction: column;
}

.barra-navegacion {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.logo {
  text-decoration: none;
}

.logo-image {
  height: 40px;
  width: auto;
}

.boton-home {
  padding: 0.5rem 1rem;
  background-color: #4CAF50;
  color: white;
  text-decoration: none;
  border-radius: 0.25rem;
  transition: background-color 0.3s;
}

.boton-home:hover {
  background-color: #45a049;
}

.contenido-auth {
  display: flex;
  flex: 1;
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
  overflow-y: auto;
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

.campos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
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

.campo-formulario input,
.campo-formulario select {
  padding: 0.75rem;
  font-size: 1rem;
  line-height: 1.5;
  color: #495057;
  background-color: #fff;
  background-clip: padding-box;
  border: 1px solid #ced4da;
  border-radius: 0.25rem;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.campo-formulario input:focus,
.campo-formulario select:focus {
  color: #495057;
  background-color: #fff;
  border-color: #80bdff;
  outline: 0;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.is-invalid {
  border-color: #dc3545 !important;
}

.is-invalid:focus {
  box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25) !important;
}

.mensaje-error {
  color: #dc3545;
  font-size: 0.875rem;
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
}

.mensaje-error i {
  margin-right: 0.5rem;
}

.boton-auth {
  background-color: #4CAF50;
  color: white;
  padding: 0.75rem;
  border: none;
  border-radius: 0.25rem;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
  margin-top: 1rem;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.boton-auth:hover:not(:disabled) {
  background-color: #45a049;
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
  margin-right: 0.5rem;
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
  margin-top: 1.5rem;
  text-align: center;
  color: #666;
}

.enlace-auth {
  color: #4CAF50;
  text-decoration: none;
  font-weight: bold;
}

.enlace-auth:hover {
  text-decoration: underline;
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
  .campos-grid {
    grid-template-columns: 1fr;
  }
  
  .titulo-auth {
    font-size: 2rem;
  }
  
  .boton-home {
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
  }
}
</style>