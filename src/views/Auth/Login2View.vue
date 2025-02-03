<template>
  <div class="contenedor-auth">
    <nav class="barra-navegacion">
      <a @click.prevent="irAHome" href="#" class="logo">MiApp</a>
      <a @click.prevent="irAHome" href="#" class="boton-home">Ir al Home</a>
    </nav>
    <div class="contenido-auth">
      <div class="imagen-auth">
        <!-- 1000x1000 -->
        <img src="../../../public/imagenes/sunset-photography-1000-x-1000-wallpaper-gzdhdzyk67cfal0m.jpg" alt="Imagen de tecnología" class="imagen-fondo">
      </div>
      <div class="formulario-auth">
        <h1 class="titulo-auth">Bienvenido de nuevo</h1>
        <p class="subtitulo-auth">Inicia sesión para acceder a tu cuenta</p>
        <form @submit.prevent="iniciarSesion" class="formulario">
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
          <button type="submit" class="boton-auth">Iniciar sesión</button>
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

const router = useRouter();

const credenciales = ref({
  email: '',
  password: ''
});

const recordar = ref(false);

const iniciarSesion = () => {
  // Aquí iría la lógica de inicio de sesión
  console.log('Iniciando sesión:', credenciales.value);
  console.log('Recordar usuario:', recordar.value);
  // Después de un inicio de sesión exitoso, redirigir al usuario
  router.push('/dashboard');
};

const irARegistro = () => {
  router.push('/registro');
};

const irAHome = () => {
  router.push('/');
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
  font-size: 1.5rem;
  font-weight: bold;
  text-decoration: none;
  color: #333;
  cursor: pointer;
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
  color: white;
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




.icono-social {
  width: 1.5rem;
  height: 1.5rem;
  margin-right: 0.5rem;
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
</style>