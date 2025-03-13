<template>
  <div class="contenedor-auth">
    <nav class="barra-navegacion">
      <a @click.prevent="irAHome" href="#" class="logo">
        <img src="/public/logo/Logo Neofetch PNG.png" alt="Logo" class="logo-image" />
      </a>
      <a @click.prevent="irAHome" href="#" class="boton-home">
        <i class="fas fa-home"></i> Ir al Home
      </a>
    </nav>
    <div class="contenido-auth">
      <div class="imagen-auth">
        <img src="../../../public/imagenes/sunset-photography-1000-x-1000-wallpaper-gzdhdzyk67cfal0m.jpg"
          alt="Imagen de naturaleza" class="imagen-fondo">
        <div class="overlay-texto">
          <h2>Únete a nuestra comunidad</h2>
          <p>Crea una cuenta y disfruta de todos nuestros servicios</p>
        </div>
      </div>
      <div class="formulario-auth">
        <div class="formulario-contenedor" :class="{ 'form-active': formActive }">
          <h1 class="titulo-auth">Crear una cuenta</h1>
          <p class="subtitulo-auth">Completa tus datos para registrarte</p>

          <div v-if="errors.message" class="error-mensaje">
            <i class="fas fa-exclamation-circle"></i>
            {{ errors.message }}
          </div>

          <form class="formulario" @submit.prevent="registrarUsuario">
            <div class="pasos-registro">
              <div class="paso" :class="{ 'paso-activo': pasoActual === 1, 'paso-completado': pasoActual > 1 }">1</div>
              <div class="linea-paso" :class="{ 'linea-completada': pasoActual > 1 }"></div>
              <div class="paso" :class="{ 'paso-activo': pasoActual === 2, 'paso-completado': pasoActual > 2 }">2</div>
              <div class="linea-paso" :class="{ 'linea-completada': pasoActual > 2 }"></div>
              <div class="paso" :class="{ 'paso-activo': pasoActual === 3 }">3</div>
            </div>

            <!-- Paso 1: Información personal -->
            <div v-if="pasoActual === 1" class="paso-contenido">
              <h3 class="paso-titulo">Información personal</h3>

              <div class="campos-grid">
                <div class="campo-formulario" :class="{ 'campo-activo': campoActivo === 'nombre' }">
                  <label for="nombre"><i class="fas fa-user"></i> Nombre</label>
                  <input id="nombre" v-model="formulario.nombre" type="text" required placeholder="Ej: María"
                    :class="{ 'is-invalid': errors.nombre, 'campo-con-valor': formulario.nombre }"
                    @focus="campoActivo = 'nombre'" @blur="campoActivo = ''">
                  <span class="campo-barra"></span>
                  <span v-if="errors.nombre" class="mensaje-error">
                    <i class="fas fa-exclamation-circle"></i>{{ errors.nombre[0] }}
                  </span>
                </div>

                <div class="campo-formulario" :class="{ 'campo-activo': campoActivo === 'apellido' }">
                  <label for="apellido"><i class="fas fa-user"></i> Apellido</label>
                  <input id="apellido" v-model="formulario.apellido" type="text" required placeholder="Ej: García"
                    :class="{ 'is-invalid': errors.apellido, 'campo-con-valor': formulario.apellido }"
                    @focus="campoActivo = 'apellido'" @blur="campoActivo = ''">
                  <span class="campo-barra"></span>
                  <span v-if="errors.apellido" class="mensaje-error">
                    <i class="fas fa-exclamation-circle"></i>{{ errors.apellido[0] }}
                  </span>
                </div>

                <div class="campo-formulario" :class="{ 'campo-activo': campoActivo === 'ci' }">
                  <label for="ci"><i class="fas fa-id-card"></i> CI</label>
                  <input id="ci" v-model="formulario.ci" type="text" required placeholder="Ej: 1234567"
                    :class="{ 'is-invalid': errors.ci, 'campo-con-valor': formulario.ci }" @focus="campoActivo = 'ci'"
                    @blur="campoActivo = ''">
                  <span class="campo-barra"></span>
                  <span v-if="errors.ci" class="mensaje-error">
                    <i class="fas fa-exclamation-circle"></i>{{ errors.ci[0] }}
                  </span>
                </div>

                <div class="campo-formulario" :class="{ 'campo-activo': campoActivo === 'nit' }">
                  <label for="nit"><i class="fas fa-building"></i> NIT</label>
                  <input id="nit" v-model="formulario.nit" type="text" placeholder="Ej: 1234567890"
                    :class="{ 'is-invalid': errors.nit, 'campo-con-valor': formulario.nit }"
                    @focus="campoActivo = 'nit'" @blur="campoActivo = ''">
                  <span class="campo-barra"></span>
                  <span v-if="errors.nit" class="mensaje-error">
                    <i class="fas fa-exclamation-circle"></i>{{ errors.nit[0] }}
                  </span>
                </div>
              </div>

              <div class="botones-navegacion">
                <button type="button" class="boton-siguiente" @click="siguientePaso">
                  Siguiente <i class="fas fa-arrow-right"></i>
                </button>
              </div>
            </div>

            <!-- Paso 2: Información de contacto -->
            <div v-if="pasoActual === 2" class="paso-contenido">
              <h3 class="paso-titulo">Información de contacto</h3>

              <div class="campos-grid">
                <div class="campo-formulario" :class="{ 'campo-activo': campoActivo === 'direccion' }">
                  <label for="direccion"><i class="fas fa-map-marker-alt"></i> Dirección</label>
                  <input id="direccion" v-model="formulario.direccion" type="text" required
                    placeholder="Ej: Calle 123, Ciudad"
                    :class="{ 'is-invalid': errors.direccion, 'campo-con-valor': formulario.direccion }"
                    @focus="campoActivo = 'direccion'" @blur="campoActivo = ''">
                  <span class="campo-barra"></span>
                  <span v-if="errors.direccion" class="mensaje-error">
                    <i class="fas fa-exclamation-circle"></i>{{ errors.direccion[0] }}
                  </span>
                </div>

                <div class="campo-formulario" :class="{ 'campo-activo': campoActivo === 'pais' }">
                  <label for="pais"><i class="fas fa-globe-americas"></i> País</label>
                  <select id="pais" v-model="formulario.pais" required
                    :class="{ 'is-invalid': errors.pais, 'campo-con-valor': formulario.pais }"
                    @focus="campoActivo = 'pais'" @blur="campoActivo = ''">
                    <option value="">Selecciona un país</option>
                    <option value="Bolivia">Bolivia</option>
                    <option value="Argentina">Argentina</option>
                    <option value="Brasil">Brasil</option>
                    <option value="Chile">Chile</option>
                    <option value="Colombia">Colombia</option>
                    <option value="Ecuador">Ecuador</option>
                    <option value="Paraguay">Paraguay</option>
                    <option value="Perú">Perú</option>
                    <option value="Uruguay">Uruguay</option>
                    <option value="Venezuela">Venezuela</option>
                    <option value="Otro">Otro</option>
                  </select>
                  <span class="campo-barra"></span>
                  <span v-if="errors.pais" class="mensaje-error">
                    <i class="fas fa-exclamation-circle"></i>{{ errors.pais[0] }}
                  </span>
                </div>

                <div class="campo-formulario" :class="{ 'campo-activo': campoActivo === 'telefono' }">
                  <label for="telefono"><i class="fas fa-phone"></i> Teléfono</label>
                  <input id="telefono" v-model="formulario.telefono" type="tel" required placeholder="Ej: +591 12345678"
                    :class="{ 'is-invalid': errors.telefono, 'campo-con-valor': formulario.telefono }"
                    @focus="campoActivo = 'telefono'" @blur="campoActivo = ''">
                  <span class="campo-barra"></span>
                  <span v-if="errors.telefono" class="mensaje-error">
                    <i class="fas fa-exclamation-circle"></i>{{ errors.telefono[0] }}
                  </span>
                </div>

                <div class="campo-formulario" :class="{ 'campo-activo': campoActivo === 'email' }">
                  <label for="email"><i class="fas fa-envelope"></i> Correo electrónico</label>
                  <input id="email" v-model="formulario.email" type="email" required placeholder="tu@email.com"
                    :class="{ 'is-invalid': errors.email, 'campo-con-valor': formulario.email }"
                    @focus="campoActivo = 'email'" @blur="campoActivo = ''">
                  <span class="campo-barra"></span>
                  <span v-if="errors.email" class="mensaje-error">
                    <i class="fas fa-exclamation-circle"></i>{{ errors.email[0] }}
                  </span>
                </div>
              </div>

              <div class="botones-navegacion">
                <button type="button" class="boton-anterior" @click="anteriorPaso">
                  <i class="fas fa-arrow-left"></i> Anterior
                </button>
                <button type="button" class="boton-siguiente" @click="siguientePaso">
                  Siguiente <i class="fas fa-arrow-right"></i>
                </button>
              </div>
            </div>

            <!-- Paso 3: Información adicional -->
            <div v-if="pasoActual === 3" class="paso-contenido">
              <h3 class="paso-titulo">Información adicional</h3>

              <div class="campos-grid">
                <div class="campo-formulario" :class="{ 'campo-activo': campoActivo === 'fecha_nacimiento' }">
                  <label for="fecha_de_nacimiento"><i class="fas fa-birthday-cake"></i> Fecha de nacimiento</label>
                  <input id="fecha_de_nacimiento" v-model="formulario.fecha_de_nacimiento" type="date" required
                    :class="{ 'is-invalid': errors.fecha_de_nacimiento, 'campo-con-valor': formulario.fecha_de_nacimiento }"
                    @focus="campoActivo = 'fecha_de_nacimiento'" @blur="campoActivo = ''">
                  <span class="campo-barra"></span>
                  <span v-if="errors.fecha_de_nacimiento" class="mensaje-error">
                    <i class="fas fa-exclamation-circle"></i>{{ errors.fecha_de_nacimiento[0] }}
                  </span>
                </div>

                <div class="campo-formulario" :class="{ 'campo-activo': campoActivo === 'genero' }">
                  <label for="genero"><i class="fas fa-venus-mars"></i> Género</label>
                  <select id="genero" v-model="formulario.genero" required
                    :class="{ 'is-invalid': errors.genero, 'campo-con-valor': formulario.genero }"
                    @focus="campoActivo = 'genero'" @blur="campoActivo = ''">
                    <option value="">Selecciona un género</option>
                    <option value="M">Masculino</option>
                    <option value="F">Femenino</option>
                    <option value="O">Otro</option>
                  </select>
                  <span class="campo-barra"></span>
                  <span v-if="errors.genero" class="mensaje-error">
                    <i class="fas fa-exclamation-circle"></i>{{ errors.genero[0] }}
                  </span>
                </div>
              </div>

              <div class="terminos-condiciones">
                <label class="checkbox-container">
                  <input type="checkbox" v-model="aceptaTerminos" required>
                  <span class="checkmark"></span>
                  <span>Acepto los <a href="#" class="enlace-terminos">términos y condiciones</a> y la <a href="#"
                      class="enlace-terminos">política de privacidad</a></span>
                </label>
              </div>

              <div class="botones-navegacion">
                <button type="button" class="boton-anterior" @click="anteriorPaso">
                  <i class="fas fa-arrow-left"></i> Anterior
                </button>
                <button type="submit" class="boton-auth" :disabled="isLoading || !aceptaTerminos"
                  :class="{ 'boton-cargando': isLoading }">
                  <span v-if="isLoading" class="loader"></span>
                  <span><i class="fas fa-user-plus"></i> {{ isLoading ? 'Registrando...' : 'Completar registro'
                    }}</span>
                </button>
              </div>
            </div>
          </form>

          <p class="texto-alternativa">
            ¿Ya tienes una cuenta? <a href="#" @click.prevent="irALogin" class="enlace-auth">Inicia sesión</a>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { register } from '@/Services/AuthService';
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Buffer } from "buffer";

const router = useRouter();
const formulario = ref({
  nombre: '',
  apellido: '',
  ci: '',
  nit: '',
  direccion: '',
  pais: '',
  telefono: '',
  fecha_de_nacimiento: '',
  genero: '',
  email: '',
});
const errors = ref({});
const isLoading = ref(false);
const verificationSent = ref(false);
const formActive = ref(false);
const campoActivo = ref('');
const pasoActual = ref(1);
const aceptaTerminos = ref(false);

onMounted(() => {
  // Activar animación del formulario
  setTimeout(() => {
    formActive.value = true;
  }, 100);

  // Enfocar el primer campo
  setTimeout(() => {
    const nombreInput = document.getElementById('nombre');
    if (nombreInput) {
      nombreInput.focus();
      campoActivo.value = 'nombre';
    }
  }, 500);
});

const siguientePaso = () => {
  // Validar campos del paso actual antes de avanzar
  if (pasoActual.value === 1) {
    if (!formulario.value.nombre || !formulario.value.apellido || !formulario.value.ci) {
      mostrarErrorPaso("Por favor completa todos los campos obligatorios");
      return;
    }
  } else if (pasoActual.value === 2) {
    if (!formulario.value.direccion || !formulario.value.pais || !formulario.value.telefono || !formulario.value.email) {
      mostrarErrorPaso("Por favor completa todos los campos obligatorios");
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formulario.value.email)) {
      errors.value = { email: ["Por favor ingresa un correo electrónico válido"] };
      return;
    }
  }

  // Si pasa la validación, avanzar al siguiente paso
  pasoActual.value++;

  // Limpiar errores al cambiar de paso
  errors.value = {};

  // Enfocar el primer campo del nuevo paso
  setTimeout(() => {
    let campoParaEnfocar = '';

    if (pasoActual.value === 2) {
      campoParaEnfocar = 'direccion';
    } else if (pasoActual.value === 3) {
      campoParaEnfocar = 'fecha_nacimiento';
    }

    if (campoParaEnfocar) {
      const input = document.getElementById(campoParaEnfocar);
      if (input) {
        input.focus();
        campoActivo.value = campoParaEnfocar;
      }
    }
  }, 100);
};

const anteriorPaso = () => {
  pasoActual.value--;
  errors.value = {};
};

const mostrarErrorPaso = (mensaje) => {
  errors.value = { message: mensaje };

  // Hacer vibrar el formulario para indicar error
  const formularioEl = document.querySelector('.formulario');
  if (formularioEl) {
    formularioEl.classList.add('shake');
    setTimeout(() => {
      formularioEl.classList.remove('shake');
    }, 500);
  }
};
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
      pais: data.user.pais,
      telefono: data.user.telefono,
      fecha_nacimiento: data.user.fecha_nacimiento,
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
/* const registrarUsuario = async () => {
  // Validar campos del último paso
  if (!formulario.value.fecha_nacimiento || !formulario.value.genero) {
    mostrarErrorPaso("Por favor completa todos los campos obligatorios");
    return;
  }
  
  if (!aceptaTerminos.value) {
    mostrarErrorPaso("Debes aceptar los términos y condiciones para continuar");
    return;
  }
  
  errors.value = {};
  isLoading.value = true;
  
  try {
    const { data } = await register(formulario.value);
    
    // Almacenamos el token para poder usarlo en solicitudes autenticadas
    const tokenEncrypt = Buffer.from(data.access_token).toString('base64');
    localStorage.setItem('token', tokenEncrypt);
    
    const datosUser = {
      id: data.user.id,
      nombre: data.user.nombre,
      apellido: data.user.apellido,
      email: data.user.email,
      direccion: data.user.direccion,
      pais: data.user.pais,
      telefono: data.user.telefono,
      fecha_nacimiento: data.user.fecha_nacimiento,
    };
    
    localStorage.setItem('datosUser', JSON.stringify(datosUser));
    
    // Animación de salida antes de redirigir
    formActive.value = false;
    
    setTimeout(() => {
      // Redirigir a la página de verificación pendiente
      router.replace('/verificacion-pendiente');
    }, 300);
  } catch (error) {
    manejarError(error);
  } finally {
    isLoading.value = false;
  }
}; */

const manejarError = (error) => {
  console.error('Error en el registro:', error);
  if (error.response) {
    if (error.response.status === 422) {
      errors.value = error.response.data;

      // Si hay errores en campos de pasos anteriores, volver a ese paso
      const errorKeys = Object.keys(error.response.data);

      const paso1Fields = ['nombre', 'apellido', 'ci', 'nit'];
      const paso2Fields = ['direccion', 'pais', 'telefono', 'email'];

      if (errorKeys.some(key => paso1Fields.includes(key))) {
        pasoActual.value = 1;
      } else if (errorKeys.some(key => paso2Fields.includes(key))) {
        pasoActual.value = 2;
      }
    } else {
      errors.value = { message: 'Error en el servidor, por favor intenta más tarde.' };
    }
  } else {
    errors.value = { message: 'Ocurrió un error inesperado, por favor intenta más tarde.' };
  }

  // Hacer vibrar el formulario para indicar error
  const formularioEl = document.querySelector('.formulario');
  if (formularioEl) {
    formularioEl.classList.add('shake');
    setTimeout(() => {
      formularioEl.classList.remove('shake');
    }, 500);
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
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css');

.contenedor-auth {
  min-height: 100vh;
  background-color: #f8f9fa;
  display: flex;
  flex-direction: column;
}

.barra-navegacion {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 100;
}

.logo {
  text-decoration: none;
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
  display: flex;
  flex: 1;
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
  overflow-y: auto;
}

.formulario-contenedor {
  width: 100%;
  max-width: 800px;
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

.pasos-registro {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 2rem;
}

.paso {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #e0e0e0;
  color: #666;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
  transition: all 0.3s ease;
}

.paso-activo {
  background-color: #4361ee;
  color: white;
  transform: scale(1.1);
  box-shadow: 0 4px 8px rgba(67, 97, 238, 0.3);
}

.paso-completado {
  background-color: #4caf50;
  color: white;
}

.linea-paso {
  flex: 1;
  height: 3px;
  background-color: #e0e0e0;
  margin: 0 10px;
  transition: background-color 0.3s ease;
}

.linea-completada {
  background-color: #4caf50;
}

.paso-contenido {
  animation: fadeIn 0.5s ease;
}

.paso-titulo {
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 1.5rem;
  text-align: center;
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
  position: relative;
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

.campo-formulario input,
.campo-formulario select {
  padding: 0.9rem 1rem;
  font-size: 1rem;
  line-height: 1.5;
  color: #495057;
  background-color: #f8f9fa;
  border: 1.5px solid #e0e0e0;
  border-radius: 8px;
  transition: all 0.3s ease;
  position: relative;
  z-index: 1;
}

.campo-formulario input:focus,
.campo-formulario select:focus {
  outline: none;
  border-color: #4361ee;
  background-color: white;
  box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.15);
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

.botones-navegacion {
  display: flex;
  justify-content: space-between;
  margin-top: 2rem;
}

.boton-anterior,
.boton-siguiente {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
}

.boton-anterior {
  background-color: #f0f0f0;
  color: #333;
}

.boton-anterior:hover {
  background-color: #e0e0e0;
  transform: translateX(-2px);
}

.boton-siguiente {
  background-color: #4361ee;
  color: white;
}

.boton-siguiente:hover {
  background-color: #3a56d4;
  transform: translateX(2px);
  box-shadow: 0 4px 8px rgba(67, 97, 238, 0.3);
}

.terminos-condiciones {
  margin: 1.5rem 0;
}

.checkbox-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  position: relative;
  padding-left: 28px;
  user-select: none;
}

.checkbox-container input {
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

.checkbox-container:hover input~.checkmark {
  background-color: #f0f0f0;
}

.checkbox-container input:checked~.checkmark {
  background-color: #4361ee;
  border-color: #4361ee;
}

.checkmark:after {
  content: "";
  position: absolute;
  display: none;
}

.checkbox-container input:checked~.checkmark:after {
  display: block;
}

.checkbox-container .checkmark:after {
  left: 7px;
  top: 3px;
  width: 5px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.enlace-terminos {
  color: #4361ee;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;
}

.enlace-terminos:hover {
  color: #3a56d4;
  text-decoration: underline;
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
  overflow: hidden;
  position: relative;
  width: 100%;
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
  animation: fadeIn 0.3s ease-in-out;
}

.error-mensaje i {
  font-size: 1.2rem;
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

  .campos-grid {
    grid-template-columns: 1fr;
  }

  .paso {
    width: 35px;
    height: 35px;
    font-size: 0.9rem;
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

  .campo-formulario input,
  .campo-formulario select {
    padding: 0.8rem;
  }

  .botones-navegacion {
    flex-direction: column;
    gap: 1rem;
  }

  .boton-anterior,
  .boton-siguiente,
  .boton-auth {
    width: 100%;
    justify-content: center;
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
