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
              <div class="formulario">
                <div v-if="error" class="error-mensaje">
                  {{ error }}
                </div>
                <div class="campo-formulario">
                  <label for="email">Correo electrónico</label>
                  <input id="email" v-model="credenciales.email" type="email" required placeholder="tu@email.com">
                </div>
                <div class="campo-formulario">
                  <label for="password">Contraseña</label>
                  <input id="password" v-model="credenciales.password" type="password" required placeholder="Tu contraseña">
                </div>
                <div class="opciones-adicionales">
                  <label class="recordar-usuario">
                    <input type="checkbox" v-model="recordar">
                    Recordarme
                  </label>
                </div>
                <button type="button" class="boton-auth" @click="iniciarSesion" :disabled="isLoading">
                  {{ isLoading ? 'Iniciando sesión...' : 'Iniciar sesión' }}
                </button>
              </div>
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
      
      const iniciarSesion = async () => {
        error.value = '';
        isLoading.value = true;
        try {
          const { data } = await login(credenciales.value);
          console.log(data);
          const tokenEncrypt = Buffer.from(data.access_token).toString('base64');
          localStorage.setItem('token', tokenEncrypt);
          
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
        router.push('/register2');
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
      }
      
      .boton-auth:hover {
        background-color: #166fe5;
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
      
      @media (min-width: 768px) {
        .imagen-auth {
          display: block;
          flex: 1;
        }
      
        .formulario-auth {
          flex: 1;
        }
        .contenido-auth {
          flex-direction: row;
        }
      }
      .error-mensaje {
        background-color: #ffebee;
        color: #c62828;
        padding: 0.75rem;
        border-radius: 0.25rem;
        margin-bottom: 1rem;
        text-align: center;
      }
      
      .boton-auth:disabled {
        background-color: #cccccc;
        cursor: not-allowed;
      }
      
      </style>