<template>
    <div class="unauthorized-container">
      <div class="content-box">
        <div class="status-code">401</div>
        <h1 class="title">No Autorizado</h1>
        <p class="message">Lo sentimos, no tienes permiso para acceder a esta página.</p>
        <div class="illustration">
          <div class="lock">
            <div class="lock-body"></div>
            <div class="lock-shackle"></div>
          </div>
        </div>
        <div class="actions">
          <button @click="goBack" class="btn btn-secondary">
            <i class="bi bi-arrow-left"></i> Volver
          </button>
          <router-link to="/login" class="btn btn-primary">
            <i class="bi bi-box-arrow-in-right"></i> Iniciar Sesión
          </router-link>
          <button @click="refreshPage" class="btn btn-outline-info">
            <i class="bi bi-arrow-clockwise"></i> Recargar
          </button>
        </div>
        <div class="additional-info" v-if="showAdditionalInfo">
          <h2>¿Necesitas ayuda?</h2>
          <ul>
            <li>Verifica que hayas iniciado sesión correctamente.</li>
            <li>Asegúrate de tener los permisos necesarios para esta acción.</li>
            <li>Si crees que esto es un error, contacta a soporte técnico.</li>
          </ul>
          <button @click="contactSupport" class="btn btn-link">
            Contactar Soporte
          </button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';
  
  const router = useRouter();
  const showAdditionalInfo = ref(false);
  
  const goBack = () => {
    router.go(-1);
  };
  
  const refreshPage = () => {
    window.location.reload();
  };
  
  const contactSupport = () => {
    // Implement your contact support logic here
    console.log('Contacting support...');
  };
  
  setTimeout(() => {
    showAdditionalInfo.value = true;
  }, 3000);
  </script>
  
  <style scoped>
  @import 'bootstrap/dist/css/bootstrap.min.css';
  @import 'bootstrap-icons/font/bootstrap-icons.css';
  
  .unauthorized-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background-color: #f0f4f8;
    padding: 2rem;
  }
  
  .content-box {
    background-color: #ffffff;
    border-radius: 12px;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
    padding: 3rem;
    max-width: 600px;
    width: 100%;
    text-align: center;
    animation: fadeInUp 0.6s ease-out;
  }
  
  .status-code {
    font-size: 6rem;
    font-weight: bold;
    color: #e63946;
    margin-bottom: 1rem;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  .title {
    font-size: 2.5rem;
    color: #1d3557;
    margin-bottom: 1rem;
  }
  
  .message {
    font-size: 1.2rem;
    color: #457b9d;
    margin-bottom: 2rem;
  }
  
  .illustration {
    margin-bottom: 2rem;
  }
  
  .lock {
    position: relative;
    width: 100px;
    height: 140px;
    margin: 0 auto;
  }
  
  .lock-body {
    position: absolute;
    bottom: 0;
    width: 100%;
    height: 100px;
    background-color: #a8dadc;
    border-radius: 10px;
    animation: lockBody 1.5s infinite alternate;
  }
  
  .lock-shackle {
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 60px;
    height: 60px;
    border: 12px solid #1d3557;
    border-radius: 30px 30px 0 0;
    border-bottom: none;
    animation: lockShackle 1.5s infinite alternate;
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
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
    transition: all 0.3s ease;
  }
  
  .btn:hover {
    transform: translateY(-2px);
  }
  
  .additional-info {
    background-color: #f1faee;
    border-radius: 8px;
    padding: 1.5rem;
    margin-top: 2rem;
    text-align: left;
    animation: fadeIn 0.5s ease-out;
  }
  
  .additional-info h2 {
    font-size: 1.4rem;
    color: #1d3557;
    margin-bottom: 1rem;
  }
  
  .additional-info ul {
    padding-left: 1.5rem;
    color: #457b9d;
    margin-bottom: 1rem;
  }
  
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  
  @keyframes lockBody {
    from {
      transform: scale(1);
    }
    to {
      transform: scale(1.05);
    }
  }
  
  @keyframes lockShackle {
    from {
      transform: translateX(-50%) rotate(0deg);
    }
    to {
      transform: translateX(-50%) rotate(-5deg);
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