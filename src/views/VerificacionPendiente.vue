<template>
    <div class="verificacion-pendiente">
      <nav class="barra-navegacion">
        <a @click.prevent="irAHome" href="#" class="logo">
          <img src="/logo/Logo Neofetch PNG.png" alt="Logo" class="logo-image" />
        </a>
        <a @click.prevent="irAHome" href="#" class="boton-home">
          <i class="fas fa-arrow-left"></i> Ir al Home
        </a>
      </nav>
      
      <div class="contenido-verificacion">
        <div class="card-verificacion">
          <h1>Verificación de correo pendiente</h1>
          <div class="icon-container">
            <i class="fas fa-envelope-open-text"></i>
          </div>
          <p>Se ha enviado un correo de verificación a tu dirección de email.</p>
          <p><strong>Por favor, verifica tu cuenta antes de iniciar sesión.</strong></p>
          
          <div v-if="!emailInput">
            <p>Si no has recibido el correo, puedes solicitar uno nuevo:</p>
            <button @click="reenviarVerificacion" :disabled="isLoading" v-if="email">
              <i class="fas fa-paper-plane"></i> {{ isLoading ? 'Enviando...' : 'Reenviar correo de verificación' }}
            </button>
            <button @click="mostrarInputEmail" v-else>
              <i class="fas fa-envelope"></i> Solicitar nuevo correo de verificación
            </button>
          </div>
          
          <div v-else class="email-input-container">
            <p>Ingresa tu dirección de correo electrónico:</p>
            <div class="input-group">
              <i class="fas fa-envelope input-icon"></i>
              <input 
                type="email" 
                v-model="emailValue" 
                placeholder="tu@email.com" 
                class="email-input"
              />
            </div>
            <div class="button-group">
              <button @click="solicitarNuevoCorreo" :disabled="isLoading || !emailValue">
                <i class="fas fa-paper-plane"></i> {{ isLoading ? 'Enviando...' : 'Enviar' }}
              </button>
              <button @click="cancelarInputEmail" class="cancel-button">
                <i class="fas fa-times"></i> Cancelar
              </button>
            </div>
          </div>
          
          <div v-if="mensaje" class="mensaje" :class="{ 'error': esError }">
            <i :class="esError ? 'fas fa-exclamation-circle' : 'fas fa-check-circle'"></i> {{ mensaje }}
          </div>
          
          <div class="links">
            <a href="#" @click.prevent="irALogin" class="enlace-auth">
              <i class="fas fa-sign-in-alt"></i> Volver a iniciar sesión
            </a>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { reenviarVerificacionEmail, generarEnlaceVerificacion } from '@/Services/AuthService';
  
  const router = useRouter();
  const isLoading = ref(false);
  const email = ref('');
  const emailInput = ref(false);
  const emailValue = ref('');
  const mensaje = ref('');
  const esError = ref(false);
  
  onMounted(() => {
    // Intentar obtener el email del usuario desde localStorage
    try {
      const datosUser = JSON.parse(localStorage.getItem('datosUser'));
      if (datosUser && datosUser.email) {
        email.value = datosUser.email;
      }
    } catch (error) {
      console.error('Error al obtener datos del usuario:', error);
    }
  });
  
  const reenviarVerificacion = async () => {
    isLoading.value = true;
    mensaje.value = '';
    
    try {
      // Si tenemos el email del usuario en localStorage, usamos la función autenticada
      if (localStorage.getItem('token')) {
        await reenviarVerificacionEmail();
      } else {
        // Si no hay token, usamos la función no autenticada con el email
        await generarEnlaceVerificacion(email.value);
      }
      
      mensaje.value = 'Se ha enviado un nuevo correo de verificación.';
      esError.value = false;
    } catch (error) {
      console.error('Error al reenviar el correo de verificación:', error);
      mensaje.value = 'Hubo un error al reenviar el correo de verificación. Por favor, intenta más tarde.';
      esError.value = true;
    } finally {
      isLoading.value = false;
    }
  };
  
  const mostrarInputEmail = () => {
    emailInput.value = true;
  };
  
  const cancelarInputEmail = () => {
    emailInput.value = false;
    emailValue.value = '';
  };
  
  const solicitarNuevoCorreo = async () => {
    if (!emailValue.value) return;
    
    isLoading.value = true;
    mensaje.value = '';
    
    try {
      await generarEnlaceVerificacion(emailValue.value);
      mensaje.value = 'Se ha enviado un nuevo correo de verificación.';
      esError.value = false;
      emailInput.value = false; // Ocultar el input después de enviar
    } catch (error) {
      console.error('Error al solicitar nuevo correo:', error);
      mensaje.value = 'Hubo un error al enviar el correo de verificación. Por favor, verifica que el email sea correcto.';
      esError.value = true;
    } finally {
      isLoading.value = false;
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
  
  .verificacion-pendiente {
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
  
  .contenido-verificacion {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 2rem;
  }
  
  .card-verificacion {
    max-width: 600px;
    width: 100%;
    padding: 2rem;
    text-align: center;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }
  
  .icon-container {
    font-size: 4rem;
    color: #4CAF50;
    margin: 1.5rem 0;
  }
  
  h1 {
    color: #333;
    margin-bottom: 1rem;
  }
  
  button {
    margin-top: 1rem;
    padding: 0.75rem 1.5rem;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s;
    font-size: 1rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
  
  button i {
    margin-right: 0.5rem;
  }
  
  button:hover:not(:disabled) {
    background-color: #45a049;
  }
  
  button:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
  
  .cancel-button {
    background-color: #f44336;
    margin-left: 0.5rem;
  }
  
  .cancel-button:hover {
    background-color: #d32f2f;
  }
  
  .email-input-container {
    margin-top: 1.5rem;
  }
  
  .input-group {
    position: relative;
    margin-bottom: 1rem;
  }
  
  .input-icon {
    position: absolute;
    left: 10px;
    top: 50%;
    transform: translateY(-50%);
    color: #666;
  }
  
  .email-input {
    padding: 0.75rem 0.75rem 0.75rem 2.5rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    width: 100%;
    font-size: 1rem;
  }
  
  .button-group {
    display: flex;
    justify-content: center;
  }
  
  .mensaje {
    margin-top: 1.5rem;
    padding: 1rem;
    border-radius: 4px;
    background-color: #e8f5e9;
    color: #2e7d32;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .mensaje i {
    margin-right: 0.5rem;
    font-size: 1.25rem;
  }
  
  .mensaje.error {
    background-color: #ffebee;
    color: #c62828;
  }
  
  .links {
    margin-top: 2rem;
    padding-top: 1rem;
    border-top: 1px solid #eee;
  }
  
  .enlace-auth {
    color: #4CAF50;
    text-decoration: none;
    font-weight: bold;
    display: inline-flex;
    align-items: center;
  }
  
  .enlace-auth i {
    margin-right: 0.5rem;
  }
  
  .enlace-auth:hover {
    text-decoration: underline;
  }
  
  @media (max-width: 768px) {
    .contenido-verificacion {
      padding: 1rem;
    }
    
    .card-verificacion {
      padding: 1.5rem;
    }
    
    .button-group {
      flex-direction: column;
    }
    
    .cancel-button {
      margin-left: 0;
      margin-top: 0.5rem;
    }
  }
  </style>
  
  