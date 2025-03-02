<template>
    <div class="unauthorized-container">
      <div class="content-box">
        <div class="icon-wrapper">
          <i class="bi bi-shield-lock-fill"></i>
        </div>
        <h1 class="title">Acceso Denegado</h1>
        <p class="message">Lo sentimos, no tienes permiso para acceder a esta página.</p>
        <div class="actions">
          <router-link to="/" class="btn btn-primary">
            <i class="bi bi-house-door"></i> Volver al Inicio
          </router-link>
          <button @click="contactSupport" class="btn btn-outline-secondary">
            <i class="bi bi-headset"></i> Contactar Soporte
          </button>
        </div>
        <div class="additional-info" v-if="showAdditionalInfo">
          <h2>¿Necesitas ayuda?</h2>
          <ul>
            <li>Verifica que hayas iniciado sesión correctamente.</li>
            <li>Si crees que esto es un error, contacta a tu administrador.</li>
            <li>Asegúrate de tener los permisos necesarios para esta acción.</li>
          </ul>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';
  
  const router = useRouter();
  const showAdditionalInfo = ref(false);
  
  const contactSupport = () => {
    showAdditionalInfo.value = !showAdditionalInfo.value;
  };
  </script>
  
  <style scoped>
  @import 'bootstrap/dist/css/bootstrap.min.css';
  @import 'bootstrap-icons/font/bootstrap-icons.css';
  
  .unauthorized-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background-color: #f8f9fa;
    padding: 2rem;
  }
  
  .content-box {
    background-color: #ffffff;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    padding: 2rem;
    max-width: 500px;
    width: 100%;
    text-align: center;
    animation: fadeIn 0.5s ease-out;
  }
  
  .icon-wrapper {
    font-size: 4rem;
    color: #dc3545;
    margin-bottom: 1rem;
  }
  
  .title {
    font-size: 2rem;
    color: #343a40;
    margin-bottom: 1rem;
  }
  
  .message {
    font-size: 1.1rem;
    color: #6c757d;
    margin-bottom: 2rem;
  }
  
  .actions {
    display: flex;
    justify-content: center;
    gap: 1rem;
    margin-bottom: 2rem;
  }
  
  .btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    font-size: 1rem;
    transition: all 0.3s ease;
  }
  
  .btn:hover {
    transform: translateY(-2px);
  }
  
  .additional-info {
    background-color: #e9ecef;
    border-radius: 8px;
    padding: 1rem;
    margin-top: 2rem;
    text-align: left;
    animation: slideDown 0.3s ease-out;
  }
  
  .additional-info h2 {
    font-size: 1.2rem;
    color: #495057;
    margin-bottom: 1rem;
  }
  
  .additional-info ul {
    padding-left: 1.5rem;
    color: #6c757d;
  }
  
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @media (max-width: 576px) {
    .actions {
      flex-direction: column;
    }
  
    .btn {
      width: 100%;
    }
  }
  </style>