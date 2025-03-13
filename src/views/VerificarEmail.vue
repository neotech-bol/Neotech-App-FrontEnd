<template>
    <div class="verificar-email">
      <div class="card-verificacion">
        <div v-if="loading" class="loading-container">
          <div class="spinner"></div>
          <p>Verificando tu correo electrónico...</p>
        </div>
        
        <div v-else-if="error" class="error-container">
          <i class="fas fa-exclamation-circle"></i>
          <h2>Error de verificación</h2>
          <p>{{ errorMessage }}</p>
          <button @click="irALogin" class="boton-login">
            <i class="fas fa-sign-in-alt"></i> Ir a iniciar sesión
          </button>
        </div>
        
        <div v-else class="success-container">
          <i class="fas fa-check-circle"></i>
          <h2>¡Correo verificado con éxito!</h2>
          <p>Tu dirección de correo electrónico ha sido verificada correctamente.</p>
          <button @click="irALogin" class="boton-login">
            <i class="fas fa-sign-in-alt"></i> Iniciar sesión
          </button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { useRouter, useRoute } from 'vue-router';
  import { verificarEmail } from '@/Services/AuthService';
  
  const router = useRouter();
  const route = useRoute();
  const loading = ref(true);
  const error = ref(false);
  const errorMessage = ref('');
  
  onMounted(async () => {
    const { id, hash } = route.params;
    
    if (!id || !hash) {
      error.value = true;
      errorMessage.value = 'Enlace de verificación inválido o incompleto.';
      loading.value = false;
      return;
    }
    
    try {
      await verificarEmail(id, hash);
      loading.value = false;
      
      // Opcional: Mostrar un mensaje de éxito por unos segundos y luego redirigir automáticamente
      setTimeout(() => {
        irALogin();
      }, 3000); // Redirige después de 3 segundos
    } catch (err) {
      error.value = true;
      if (err.response?.status === 400) {
        errorMessage.value = 'El enlace de verificación es inválido o ha expirado.';
      } else if (err.response?.status === 200) {
        // Si el correo ya estaba verificado, consideramos que es un éxito
        error.value = false;
      } else {
        errorMessage.value = 'Ocurrió un error al verificar tu correo electrónico. Por favor, intenta más tarde.';
      }
      loading.value = false;
    }
  });
  
  const irALogin = () => {
    router.push('/login');
  };
  </script>
  
  <style scoped>
  @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css');
  
  .verificar-email {
    min-height: 100vh;
    background-color: #f0f2f5;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 2rem;
  }
  
  .card-verificacion {
    max-width: 500px;
    width: 100%;
    padding: 3rem 2rem;
    text-align: center;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }
  
  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  
  .spinner {
    width: 50px;
    height: 50px;
    border: 5px solid #f3f3f3;
    border-top: 5px solid #4CAF50;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 1.5rem;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  .success-container, .error-container {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  .success-container i, .error-container i {
    font-size: 5rem;
    margin-bottom: 1.5rem;
  }
  
  .success-container i {
    color: #4CAF50;
  }
  
  .error-container i {
    color: #f44336;
  }
  
  h2 {
    margin-bottom: 1rem;
    color: #333;
  }
  
  p {
    margin-bottom: 2rem;
    color: #666;
  }
  
  .boton-login {
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
  }
  
  .boton-login i {
    margin-right: 0.5rem;
  }
  
  .boton-login:hover {
    background-color: #45a049;
  }
  
  @media (max-width: 768px) {
    .verificar-email {
      padding: 1rem;
    }
    
    .card-verificacion {
      padding: 2rem 1.5rem;
    }
  }
  </style>
  
  