<template>
    <div class="contenedor-auth">
      <nav class="barra-navegacion">
        <a @click.prevent="irAHome" href="#" class="logo">MiApp</a>
        <a @click.prevent="irAHome" href="#" class="boton-home">Ir al Home</a>
      </nav>
      <div class="contenido-auth">
        <div class="imagen-auth">
          <img src="../../../public/imagenes/sunset-photography-1000-x-1000-wallpaper-gzdhdzyk67cfal0m.jpg" alt="Imagen de naturaleza" class="imagen-fondo">
        </div>
        <div class="formulario-auth">
          <h1 class="titulo-auth">Crear una cuenta</h1>
          <p class="subtitulo-auth">Únete a nuestra comunidad y disfruta de nuestros servicios</p>
          <form @submit.prevent="registrar" class="formulario">
            <div class="campo-formulario">
              <label for="nombre">Nombre completo</label>
              <input id="nombre" v-model="usuario.nombre" type="text" required placeholder="Ej: María García">
            </div>
            <div class="campo-formulario">
              <label for="email">Correo electrónico</label>
              <input id="email" v-model="usuario.email" type="email" required placeholder="tu@email.com">
            </div>
            <div class="campo-formulario">
              <label for="password">Contraseña</label>
              <input id="password" v-model="usuario.password" type="password" required placeholder="Mínimo 8 caracteres">
            </div>
            <div class="campo-formulario">
              <label for="confirmarPassword">Confirmar contraseña</label>
              <input id="confirmarPassword" v-model="usuario.confirmarPassword" type="password" required placeholder="Repite tu contraseña">
            </div>
            <button type="submit" class="boton-auth">Registrarse</button>
          </form>
          <p class="texto-alternativa">
            ¿Ya tienes una cuenta? <a href="#" @click.prevent="irALogin" class="enlace-auth">Inicia sesión</a>
          </p>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';
  
  const router = useRouter();
  
  const usuario = ref({
    nombre: '',
    email: '',
    password: '',
    confirmarPassword: ''
  });
  
  const registrar = () => {
    // Lógica de registro...
  };
  
  const irALogin = () => {
    router.push('/login');
  };
  
  const irAHome = () => {
    router.push('/');
  };
  </script>
  
  <style scoped>
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
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
  
  .logo {
    font-size: 1.5rem;
    font-weight: bold;
    color: #4CAF50;
    text-decoration: none;
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
  
  .boton-auth {
    background-color: #4CAF50;
    color: white;
    padding: 0.75rem;
    border: none;
    border-radius: 0.25rem;
    font-size: 1rem;
    cursor: pointer;
    transition: background-color 0.3s;
  }
  
  .boton-auth:hover {
    background-color: #45a049;
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
  </style>