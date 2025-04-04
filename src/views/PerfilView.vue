<template>
  <div class="contenedor-perfil">
    <header class="encabezado-perfil">
      <div class="avatar-perfil" @mouseover="avatarHover = true" @mouseleave="avatarHover = false"
        :class="{ 'avatar-hover': avatarHover }">
        {{ inicialesUsuario }}
      </div>
      <div class="titulo-perfil">
        <h1 class="gradient-text">{{ user.nombre }} {{ user.apellido }}</h1>
        <p>{{ user.email }}</p>
      </div>
      <button @click="cerrarSesion" class="boton-cerrar-sesion">
        <i class="fas fa-sign-out-alt"></i>
        <span>Cerrar Sesión</span>
      </button>
    </header>
    <main class="contenido-perfil">
      <section class="info-perfil">
        <div class="section-header">
          <h2>Información del Perfil</h2>
        </div>
        <div class="grid-info">
          <div class="item-info" v-for="(valor, clave) in camposEditables" :key="clave">
            <strong>{{ formatearEtiqueta(clave) }}:</strong>
            <div class="input-container">
              <span v-if="!editando" class="info-value">
                {{ clave === 'genero' ? formatearGenero(valor) : (valor || 'No especificado') }}
              </span>
              <template v-else>
                <select v-if="clave === 'genero'" v-model="usuarioEditado[clave]" class="input-animated">
                  <option value="M">Masculino</option>
                  <option value="F">Femenino</option>
                  <option value="Otro">Otro</option>
                </select>
                <input v-else v-model="usuarioEditado[clave]" :placeholder="formatearEtiqueta(clave)"
                  class="input-animated" :class="{ 'input-error': validationErrors[clave] }" />
              </template>
              <span v-if="validationErrors[clave]" class="error-message">{{ validationErrors[clave][0] }}</span>
            </div>
          </div>
        </div>
        <div class="botones-edicion">
          <button v-if="!editando" @click="iniciarEdicion" class="boton-principal">
            <i class="fas fa-pencil-alt"></i>
            <span>Editar Perfil</span>
          </button>
          <template v-else>
            <button @click="guardarCambios" class="boton-principal" :disabled="guardando">
              <i class="fas" :class="guardando ? 'fa-spinner fa-spin' : 'fa-check'"></i>
              <span>{{ guardando ? 'Guardando...' : 'Guardar Cambios' }}</span>
            </button>
            <button @click="cancelarEdicion" class="boton-secundario">
              <i class="fas fa-times"></i>
              <span>Cancelar</span>
            </button>
          </template>
        </div>
      </section>
      <section class="historial-pedidos">
        <div class="section-header">
          <h2>Historial de Pedidos</h2>
          <div class="filtros-pedidos">
            <button class="filtro-btn" :class="{ active: filtroActual === 'todos' }" @click="filtrarPedidos('todos')">
              Todos
            </button>
            <button class="filtro-btn" :class="{ active: filtroActual === 'entregados' }"
              @click="filtrarPedidos('entregados')">
              Entregados
            </button>
            <button class="filtro-btn" :class="{ active: filtroActual === 'proceso' }"
              @click="filtrarPedidos('proceso')">
              En Proceso
            </button>
          </div>
        </div>
        <div v-if="cargando" class="cargando-pedidos">
          <i class="fas fa-spinner fa-spin"></i>
          <p>Cargando pedidos...</p>
        </div>
        <template v-else>
          <div class="paginacion-superior">
            <button @click="cambiarPagina(paginaActual - 1)" :disabled="paginaActual === 1" class="boton-pagina">
              <i class="fas fa-chevron-left"></i>
            </button>
            <div class="paginas-info">
              <span class="pagina-actual">{{ paginaActual }}</span>
              <span class="separador">/</span>
              <span class="total-paginas">{{ totalPaginas }}</span>
            </div>
            <button @click="cambiarPagina(paginaActual + 1)" :disabled="paginaActual === totalPaginas"
              class="boton-pagina">
              <i class="fas fa-chevron-right"></i>
            </button>
          </div>
          <div class="lista-pedidos">
            <div v-for="pedido in pedidosPaginados" :key="pedido.id" class="item-pedido"
              :class="{ 'item-hover': hoveredPedido === pedido.id }" @mouseover="hoveredPedido = pedido.id"
              @mouseleave="hoveredPedido = null">
              <div class="encabezado-pedido">
                <span class="id-pedido">
                  <i class="fas fa-shopping-bag"></i>
                  Pedido #{{ pedido.id }}
                </span>
                <span class="fecha-pedido">
                  <i class="fas fa-calendar-alt"></i>
                  {{ formatearFecha(pedido.created_at) }}
                </span>
              </div>
              <div class="detalles-pedido">
                <span class="total-pedido">{{ formatearPrecio(pedido.total_amount) }}</span>
                <span class="estado-pedido" :class="pedido.estado == 1 ? 'entregado' : 'proceso'">
                  <i class="fas" :class="pedido.estado == 1 ? 'fa-check-circle' : 'fa-clock'"></i>
                  {{ pedido.estado == 1 ? 'Entregado' : 'En Proceso' }}
                </span>
              </div>
              <div class="progreso-pedido">
                <div class="barra-progreso" :style="{ width: obtenerProgresoPedido(pedido.estado) }">
                  <div class="progreso-animation"></div>
                </div>
              </div>
              <div class="acciones-pedido">
                <button @click="descargarDetallePedido(pedido.id)" class="boton-accion descargar"
                  v-if="pedido.estado == 1">
                  <i class="fas fa-download"></i>
                  <span>Descargar Detalle</span>
                </button>
                <button @click="repetirPedido(pedido.id)" class="boton-accion repetir">
                  <i class="fas fa-redo"></i>
                  <span>Pedir de Nuevo</span>
                </button>
              </div>
            </div>
            <div v-if="pedidosPaginados.length === 0" class="no-pedidos">
              <i class="fas fa-shopping-cart"></i>
              <p>No hay pedidos que mostrar</p>
              <button class="boton-principal" @click="irAProductos()">Ir a comprar</button>
            </div>
          </div>
        </template>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { updateUserWeb, userAutenticado } from '@/Services/UsuarioService'
import { generaPDFPedidoID, repitOrder } from '@/Services/PedidoService';
import Swal from 'sweetalert2';
import { useRouter } from 'vue-router';
import { logout } from '@/Services/AuthService';

// Estado reactivo
const user = ref({});
const paginaActual = ref(1);
const pedidosPorPagina = 5;
const editando = ref(false);
const usuarioEditado = ref({});
const guardando = ref(false);
const hoveredPedido = ref(null);
const avatarHover = ref(false);
const filtroActual = ref('todos');
const validationErrors = ref({});
const router = useRouter();
const cargando = ref(false);

// Mounted hook
onMounted(() => {
  userAuth();
});

// Funciones
const userAuth = async (filtro = null) => {
  cargando.value = true;
  try {
    // Usar el filtro pasado como parámetro o el filtro actual
    const filtroAplicar = filtro || filtroActual.value;
    
    // Llamar a userAutenticado con el filtro correspondiente
    let { data } = await userAutenticado(filtroAplicar !== 'todos' ? filtroAplicar : null);
    
    user.value = data.datos;
    console.log('Usuario con pedidos:', user.value);
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    Swal.fire({
      title: 'Error',
      text: 'No se pudieron cargar los datos del usuario',
      icon: 'error'
    });
  } finally {
    cargando.value = false;
  }
};

const filtrarPedidos = (filtro) => {
  console.log('Filtrando por:', filtro);
  filtroActual.value = filtro;
  paginaActual.value = 1;
  
  // Llamar a userAuth con el filtro seleccionado
  userAuth(filtro);
};

// Computed properties
const pedidosFiltrados = computed(() => {
  if (!user.value || !user.value.pedidos || !Array.isArray(user.value.pedidos)) {
    return [];
  }
  return user.value.pedidos;
});

const pedidosPaginados = computed(() => {
  const inicio = (paginaActual.value - 1) * pedidosPorPagina;
  const fin = inicio + pedidosPorPagina;
  return pedidosFiltrados.value.slice(inicio, fin);
});

const totalPaginas = computed(() => {
  return Math.max(1, Math.ceil(pedidosFiltrados.value.length / pedidosPorPagina));
});

const inicialesUsuario = computed(() => {
  const nombreCompleto = `${user.value.nombre || ''} ${user.value.apellido || ''}`.trim();
  return nombreCompleto
    ? nombreCompleto.split(' ').map(nombre => nombre[0]).join('').toUpperCase()
    : '';
});

const camposEditables = computed(() => {
  const { nombre, apellido, direccion, telefono, genero, email, ci, nit } = user.value;
  return { nombre, apellido, direccion, telefono, genero, email, ci, nit };
});

// Métodos
const iniciarEdicion = () => {
  usuarioEditado.value = { ...camposEditables.value };
  editando.value = true;
};

const guardarCambios = async () => {
  guardando.value = true;
  validationErrors.value = {};
  try {
    const { data } = await updateUserWeb(usuarioEditado.value);
    console.log('Usuario actualizado:', data);
    userAuth(filtroActual.value); // Mantener el filtro actual al recargar
    editando.value = false;
    
    Swal.fire({
      title: '¡Éxito!',
      text: 'Perfil actualizado correctamente',
      icon: 'success',
      timer: 2000,
      timerProgressBar: true
    });
  } catch (error) {
    if (error.response && error.response.data && error.response.data.errors) {
      validationErrors.value = error.response.data.errors;
    } else {
      console.error('Error al guardar cambios:', error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudo actualizar el perfil',
        icon: 'error'
      });
    }
  } finally {
    guardando.value = false;
  }
};

const cancelarEdicion = () => {
  validationErrors.value = {};
  editando.value = false;
};

const cambiarPagina = (nuevaPagina) => {
  if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas.value) {
    paginaActual.value = nuevaPagina;
  }
};

const descargarDetallePedido = async (id) => {
  try {
    console.log('Descargando detalle del pedido:', id);
    const response = await generaPDFPedidoID(id);
    // Crea un objeto URL a partir de la respuesta
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `pedido_${id}.pdf`); // Nombre del archivo a descargar
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url); // Liberar el objeto URL
    
    Swal.fire({
      title: '¡Éxito!',
      text: 'Detalle descargado correctamente',
      icon: 'success',
      timer: 2000,
      timerProgressBar: true,
      showConfirmButton: false
    });
  } catch (error) {
    console.error('Error al descargar detalle:', error);
    Swal.fire({
      title: 'Error',
      text: 'No se pudo descargar el detalle del pedido',
      icon: 'error'
    });
  }
};

const repetirPedido = async (id) => {
  try {
    console.log('Repitiendo pedido:', id);
    const { data } = await repitOrder(id);
    console.log('Pedido repetido:', data);
    
    // Recargar los pedidos después de repetir uno
    userAuth(filtroActual.value);
    
    Swal.fire({
      title: '¡Éxito!',
      text: 'Pedido repetido correctamente',
      icon: 'success',
      timer: 2000,
      timerProgressBar: true
    });
  } catch (error) {
    console.error('Error al repetir el pedido:', error);
    Swal.fire({
      title: 'Error',
      text: 'No se pudo repetir el pedido',
      icon: 'error'
    });
  }
};

const formatearGenero = (genero) => {
  const generos = {
    'M': 'Masculino',
    'F': 'Femenino',
    'Otro': 'Otro'
  };
  return generos[genero] || 'No especificado';
};

const formatearEtiqueta = (clave) => {
  const etiquetas = {
    nombre: 'Nombre',
    apellido: 'Apellidos',
    direccion: 'Dirección',
    telefono: 'Teléfono',
    genero: 'Género',
    email: 'Correo Electrónico',
    ci: 'Cédula de Identidad',
    nit: 'NIT',
  };
  return etiquetas[clave] || clave;
};

const formatearFecha = (fechaString) => {
  const opciones = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(fechaString).toLocaleDateString('es-ES', opciones);
};

const formatearPrecio = (precio) => {
  return new Intl.NumberFormat('es-BO', {
    style: 'currency',
    currency: 'BOB',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(precio);
};

const obtenerProgresoPedido = (estado) => {
  return estado == 1 ? '100%' : '60%';
};

// Función para hacer scroll al inicio de la página
const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
};

// Función para cerrar sesión con confirmación de SweetAlert
const cerrarSesion = async () => {
  // Mostrar diálogo de confirmación con SweetAlert
  const result = await Swal.fire({
    title: '¿Cerrar sesión?',
    text: '¿Estás seguro que deseas cerrar tu sesión?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Sí, cerrar sesión',
    cancelButtonText: 'Cancelar'
  });
  
  // Si el usuario confirma
  if (result.isConfirmed) {
    try {
      // 1. Llamar al endpoint de logout en el backend (si existe)
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      if (token) {
        try {
          const { data } = await logout();
          console.log('Logout exitoso:', data);
        } catch (apiError) {
          console.warn('Error al llamar al endpoint de logout:', apiError);
          // Continuamos con el proceso aunque falle la API
        }
      }
      
      // 2. Limpiar tokens y datos de usuario del almacenamiento local
      localStorage.removeItem('token');
      localStorage.removeItem('datosUser');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('datosUser');
      
      // 3. Mostrar notificación de éxito con SweetAlert
      await Swal.fire({
        title: '¡Sesión cerrada!',
        text: 'Has cerrado sesión correctamente',
        icon: 'success',
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false
      });
      
      // 4. Redireccionar al login
      router.push('/login');
      return Promise.resolve();
    } catch (error) {
      console.error('Error en cerrarSesion:', error);
      
      // Mostrar error con SweetAlert
      await Swal.fire({
        title: 'Error',
        text: 'No se pudo cerrar la sesión',
        icon: 'error'
      });
      
      return Promise.reject(error);
    }
  }
};

const irAProductos = () => {
  router.push({path:'/productos'});
};

// Watchers
watch(filtroActual, (nuevoFiltro) => {
  console.log('Filtro cambiado a:', nuevoFiltro);
});

// Definir variable CSS para colores primarios
const style = document.createElement('style');
style.innerHTML = ':root { --primary-color: linear-gradient(135deg, #3B82F6, #2563EB); }';
document.head.appendChild(style);
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css');

/* Base Styles */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Inter', sans-serif;
  color: #1f2937;
  line-height: 1.5;
  background-color: #f9fafb;
}

/* Container */
.contenedor-perfil {
  max-width: 1440px;
  margin: 0 auto;
  padding: clamp(1rem, 5vw, 2rem);
  color: #1f2937;
  font-family: 'Inter', sans-serif;
  animation: fadeIn 0.5s ease-out;
}

/* Header */
.encabezado-perfil {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin-bottom: 2rem;
  background-color: #fff;
  padding: clamp(1.25rem, 4vw, 2rem);
  border-radius: 1rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  flex-wrap: wrap;
  gap: 1.5rem;
}

.encabezado-perfil::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 5px;
  background: var(--primary-color);
}

.encabezado-perfil:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
}

.avatar-perfil {
  width: clamp(80px, 15vw, 110px);
  height: clamp(80px, 15vw, 110px);
  background: var(--primary-color);
  color: white;
  font-size: clamp(1.75rem, 4vw, 2.5rem);
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  margin-right: clamp(1rem, 3vw, 2rem);
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  cursor: pointer;
  position: relative;
  box-shadow: 0 4px 10px rgba(37, 99, 235, 0.3);
  flex-shrink: 0;
}

.avatar-perfil::after {
  content: '';
  position: absolute;
  top: -4px;
  left: -4px;
  right: -4px;
  bottom: -4px;
  background: var(--primary-color);
  border-radius: 50%;
  z-index: -1;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.avatar-hover {
  transform: scale(1.08);
  box-shadow: 0 8px 20px rgba(37, 99, 235, 0.4);
}

.avatar-hover::after {
  opacity: 0.3;
}

.titulo-perfil {
  flex: 1;
  min-width: 0; /* Importante para que el texto se ajuste */
}

.titulo-perfil h1 {
  font-size: clamp(1.5rem, 4vw, 2.5rem);
  margin-bottom: 0.5rem;
  font-weight: 700;
  letter-spacing: -0.5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.gradient-text {
  background: var(--primary-color);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  color: transparent;
}

.titulo-perfil p {
  font-size: clamp(0.875rem, 2vw, 1.25rem);
  color: #4b5563;
  font-weight: 400;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Main Content */
.contenido-perfil {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 500px), 1fr));
  gap: clamp(1.25rem, 3vw, 2rem);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.info-perfil,
.historial-pedidos {
  background-color: #fff;
  border-radius: 1rem;
  padding: clamp(1.25rem, 3vw, 2rem);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  height: fit-content;
}

.info-perfil::before,
.historial-pedidos::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 5px;
  background: var(--primary-color);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.info-perfil:hover::before,
.historial-pedidos:hover::before {
  opacity: 1;
}

.info-perfil:hover,
.historial-pedidos:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
}

h2 {
  font-size: clamp(1.25rem, 3vw, 1.75rem);
  color: #1f2937;
  margin: 0;
  font-weight: 700;
  position: relative;
  display: inline-block;
}

h2::after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 0;
  width: 40px;
  height: 3px;
  background: var(--primary-color);
  border-radius: 3px;
}

.grid-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 200px), 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
}

.item-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  transition: all 0.3s ease;
  padding: 1rem;
  border-radius: 0.5rem;
}

.item-info:hover {
  background-color: #f9fafb;
  transform: translateY(-2px);
}

.item-info strong {
  font-size: 0.875rem;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
}

.info-value {
  font-size: 1rem;
  color: #1f2937;
  padding: 0.5rem 0;
  font-weight: 500;
  word-break: break-word;
}

.input-container {
  position: relative;
}

.input-animated {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: #f9fafb;
  font-family: 'Inter', sans-serif;
}

.input-animated:focus {
  border-color: #3B82F6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
  background: white;
  outline: none;
}

.input-error {
  border-color: #ef4444;
  background-color: #fef2f2;
}

.input-error:focus {
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.2);
}

.error-message {
  color: #ef4444;
  font-size: 0.75rem;
  margin-top: 0.5rem;
  display: block;
  font-weight: 500;
  animation: shake 0.5s ease-in-out;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-5px); }
  40%, 80% { transform: translateX(5px); }
}

.botones-edicion {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  flex-wrap: wrap;
}

.boton-principal,
.boton-secundario {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  font-family: 'Inter', sans-serif;
  font-size: 0.875rem;
  flex: 1;
  justify-content: center;
  min-width: 140px;
}

.boton-principal {
  background: var(--primary-color);
  color: white;
  box-shadow: 0 4px 10px rgba(37, 99, 235, 0.3);
}

.boton-secundario {
  background: #f3f4f6;
  color: #4b5563;
  border: 2px solid #e5e7eb;
}

.boton-principal:hover,
.boton-secundario:hover {
  transform: translateY(-3px) scale(1.03);
}

.boton-principal:hover {
  box-shadow: 0 6px 15px rgba(37, 99, 235, 0.4);
}

.boton-secundario:hover {
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  border-color: #d1d5db;
}

.boton-principal:active,
.boton-secundario:active {
  transform: translateY(0) scale(0.98);
}

.boton-principal:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* Filters */
.filtros-pedidos {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  width: 100%;
}

.filtro-btn {
  padding: 0.5rem 1.25rem;
  border: 1px solid #e5e7eb;
  border-radius: 2rem;
  background: white;
  color: #4b5563;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  font-size: 0.875rem;
  font-family: 'Inter', sans-serif;
  flex: 1;
  text-align: center;
  white-space: nowrap;
  min-width: 80px;
}

.filtro-btn.active {
  background: linear-gradient(135deg, #3B82F6, #2563EB);
  border-color: #3B82F6;
  color: white;
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3);
}

.filtro-btn:hover:not(.active) {
  border-color: #3B82F6;
  color: #3B82F6;
  transform: translateY(-2px);
}

/* Pagination */
.paginacion-superior {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 0.5rem;
  background-color: #f9fafb;
  border-radius: 2rem;
  width: fit-content;
  margin-left: auto;
  margin-right: auto;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.boton-pagina {
  width: 2.5rem;
  height: 2.5rem;
  border: 2px solid #e5e7eb;
  border-radius: 50%;
  background: white;
  color: #4b5563;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  font-size: 0.875rem;
}

.boton-pagina:not(:disabled):hover {
  border-color: #3B82F6;
  color: #3B82F6;
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.2);
}

.boton-pagina:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.paginas-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  font-size: 0.875rem;
}

.pagina-actual {
  color: #3B82F6;
  font-size: 1.125rem;
}

.separador {
  color: #6b7280;
}

/* Orders List */
.lista-pedidos {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.item-pedido {
  background: white;
  border-radius: 1rem;
  padding: clamp(1rem, 3vw, 1.5rem);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  border: 1px solid #f3f4f6;
}

.item-pedido::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: linear-gradient(to bottom, #3B82F6, #10B981);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.item-hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
  border-color: #e5e7eb;
}

.item-hover::before {
  opacity: 1;
}

.encabezado-pedido {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.id-pedido {
  font-weight: 600;
  color: #3B82F6;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
}

.fecha-pedido {
  color: #6b7280;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.detalles-pedido {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.total-pedido {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
}

.estado-pedido {
  padding: 0.5rem 1rem;
  border-radius: 2rem;
  font-size: 0.875rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.estado-pedido.entregado {
  background: linear-gradient(135deg, #10B981, #059669);
  color: white;
}

.estado-pedido.proceso {
  background: linear-gradient(135deg, #F59E0B, #D97706);
  color: white;
}

.progreso-pedido {
  height: 6px;
  background: #e5e7eb;
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 1.5rem;
}

.barra-progreso {
  height: 100%;
  background: linear-gradient(90deg, #3B82F6, #10B981);
  border-radius: 3px;
  transition: width 0.5s ease;
  position: relative;
  overflow: hidden;
}

.progreso-animation {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg,
      rgba(255, 255, 255, 0) 0%,
      rgba(255, 255, 255, 0.4) 50%,
      rgba(255, 255, 255, 0) 100%);
  animation: shine 2s infinite;
}

@keyframes shine {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(100%);
  }
}

.acciones-pedido {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  flex-wrap: wrap;
}

.boton-accion {
  flex: 1;
  min-width: 140px;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative;
  font-family: 'Inter', sans-serif;
  font-size: 0.875rem;
}

.boton-accion.descargar {
  background: linear-gradient(135deg, #4B5563, #374151);
  color: white;
  box-shadow: 0 4px 10px rgba(55, 65, 81, 0.3);
}

.boton-accion.repetir {
  background: linear-gradient(135deg, #3B82F6, #2563EB);
  color: white;
  box-shadow: 0 4px 10px rgba(37, 99, 235, 0.3);
}

.boton-accion:hover {
  transform: translateY(-3px) scale(1.03);
}

.boton-accion.descargar:hover {
  box-shadow: 0 6px 15px rgba(55, 65, 81, 0.4);
}

.boton-accion.repetir:hover {
  box-shadow: 0 6px 15px rgba(37, 99, 235, 0.4);
}

.boton-accion:active {
  transform: translateY(0) scale(0.98);
}

/* Empty state */
.no-pedidos {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  background-color: #f9fafb;
  border-radius: 1rem;
  border: 2px dashed #e5e7eb;
  gap: 1rem;
  text-align: center;
}

.no-pedidos i {
  font-size: 3rem;
  color: #9ca3af;
  margin-bottom: 1rem;
}

.no-pedidos p {
  font-size: 1.125rem;
  color: #4b5563;
  margin-bottom: 1.5rem;
}

/* Loading state */
.cargando-pedidos {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  gap: 1rem;
  text-align: center;
}

.cargando-pedidos i {
  font-size: 2rem;
  color: #3B82F6;
}

.cargando-pedidos p {
  font-size: 1.125rem;
  color: #4b5563;
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Estilo para el botón de cerrar sesión */
.boton-cerrar-sesion {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  font-family: 'Inter', sans-serif;
  font-size: 0.875rem;
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  box-shadow: 0 4px 10px rgba(239, 68, 68, 0.3);
  margin-left: auto;
}

.boton-cerrar-sesion:hover {
  transform: translateY(-3px) scale(1.03);
  box-shadow: 0 6px 15px rgba(239, 68, 68, 0.4);
}

.boton-cerrar-sesion:active {
  transform: translateY(0) scale(0.98);
}

/* Responsive Styles - Mejorados */
@media (max-width: 1200px) {
  .contenedor-perfil {
    padding: 1.5rem;
  }
  
  .grid-info {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  }
}

@media (max-width: 1024px) {
  .contenido-perfil {
    grid-template-columns: 1fr;
  }
  
  .info-perfil, 
  .historial-pedidos {
    width: 100%;
  }
  
  .encabezado-perfil {
    padding: 1.5rem;
  }
  
  .titulo-perfil h1 {
    font-size: clamp(1.5rem, 5vw, 2rem);
  }
  
  .grid-info {
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  }
}

@media (max-width: 768px) {
  .contenedor-perfil {
    padding: 1rem;
  }
  
  .encabezado-perfil {
    flex-direction: row;
    align-items: center;
    gap: 1rem;
  }
  
  .avatar-perfil {
    margin-right: 1rem;
  }
  
  .boton-cerrar-sesion {
    margin-left: 0;
    margin-top: 0;
    order: 3;
    width: 100%;
  }
  
  .titulo-perfil {
    order: 2;
    flex: 1;
  }
  
  .grid-info {
    grid-template-columns: 1fr;
  }
  
  .acciones-pedido {
    flex-direction: column;
  }
  
  .boton-accion {
    width: 100%;
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .filtros-pedidos {
    width: 100%;
    justify-content: space-between;
    margin-top: 1rem;
  }
  
  .filtro-btn {
    flex: 1;
    text-align: center;
    padding: 0.5rem 0.75rem;
    font-size: 0.75rem;
  }
  
  .paginacion-superior {
    width: 100%;
  }
  
  .encabezado-pedido,
  .detalles-pedido {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
  
  .estado-pedido {
    align-self: flex-start;
  }
}

@media (max-width: 640px) {
  .encabezado-perfil {
    flex-direction: column;
    text-align: center;
    padding: 1.5rem 1rem;
  }
  
  .avatar-perfil {
    margin: 0 0 1.5rem 0;
  }
  
  .titulo-perfil {
    text-align: center;
    width: 100%;
  }
  
  .titulo-perfil h1 {
    font-size: 1.75rem;
    white-space: normal;
  }
  
  .titulo-perfil p {
    font-size: 1rem;
    white-space: normal;
  }
  
  .boton-cerrar-sesion {
    margin-top: 1.5rem;
    width: 100%;
  }
  
  .botones-edicion {
    justify-content: center;
    flex-direction: column;
  }
  
  .item-pedido {
    padding: 1.25rem 1rem;
  }
  
  .info-perfil,
  .historial-pedidos {
    padding: 1.25rem 1rem;
  }
  
  .filtro-btn {
    font-size: 0.7rem;
    padding: 0.5rem;
  }
}

@media (max-width: 480px) {
  .contenedor-perfil {
    padding: 0.75rem;
  }
  
  .encabezado-perfil {
    margin-bottom: 1.25rem;
    padding: 1.25rem 0.75rem;
  }
  
  .avatar-perfil {
    width: 70px;
    height: 70px;
    font-size: 1.5rem;
  }
  
  .titulo-perfil h1 {
    font-size: 1.5rem;
  }
  
  .titulo-perfil p {
    font-size: 0.875rem;
  }
  
  .section-header h2 {
    font-size: 1.25rem;
  }
  
  .item-info {
    padding: 0.75rem;
  }
  
  .item-info strong {
    font-size: 0.75rem;
  }
  
  .info-value {
    font-size: 0.875rem;
  }
  
  .boton-principal,
  .boton-secundario,
  .boton-accion {
    padding: 0.625rem 1rem;
    font-size: 0.8125rem;
  }
  
  .paginacion-superior {
    gap: 0.5rem;
  }
  
  .boton-pagina {
    width: 2rem;
    height: 2rem;
  }
  
  .pagina-actual {
    font-size: 1rem;
  }
  
  .id-pedido {
    font-size: 0.875rem;
  }
  
  .fecha-pedido {
    font-size: 0.75rem;
  }
  
  .total-pedido {
    font-size: 1.125rem;
  }
  
  .estado-pedido {
    padding: 0.375rem 0.75rem;
    font-size: 0.75rem;
  }
  
  .no-pedidos {
    padding: 2rem 1rem;
  }
  
  .no-pedidos i {
    font-size: 2.5rem;
  }
  
  .no-pedidos p {
    font-size: 1rem;
  }
  
  /* Mejorar la experiencia táctil en dispositivos pequeños */
  .boton-principal,
  .boton-secundario,
  .boton-accion,
  .filtro-btn,
  .boton-pagina {
    min-height: 44px; /* Altura mínima para objetivos táctiles */
  }
}

/* Mejoras para dispositivos táctiles */
@media (hover: none) {
  .boton-principal:hover,
  .boton-secundario:hover,
  .boton-accion:hover,
  .filtro-btn:hover:not(.active),
  .boton-pagina:not(:disabled):hover,
  .item-pedido:hover,
  .info-perfil:hover,
  .historial-pedidos:hover,
  .encabezado-perfil:hover,
  .item-info:hover {
    transform: none;
    box-shadow: none;
  }
  
  .boton-principal:active,
  .boton-secundario:active,
  .boton-accion:active,
  .filtro-btn:active {
    transform: scale(0.98);
  }
  
  /* Asegurar que los elementos táctiles tengan suficiente espacio */
  .filtro-btn,
  .boton-pagina,
  .boton-accion,
  .boton-principal,
  .boton-secundario {
    padding: 0.75rem 1rem;
  }
}

/* Mejoras para accesibilidad */
@media (prefers-reduced-motion: reduce) {
  .contenedor-perfil,
  .avatar-hover,
  .boton-principal:hover,
  .boton-secundario:hover,
  .boton-accion:hover,
  .item-pedido:hover,
  .progreso-animation,
  .info-perfil:hover,
  .historial-pedidos:hover {
    animation: none !important;
    transition: none !important;
    transform: none !important;
  }
}

/* Soporte para modo oscuro */
/* @media (prefers-color-scheme: dark) {
  body {
    background-color: #111827;
    color: #f9fafb;
  }
  
  .encabezado-perfil,
  .info-perfil,
  .historial-pedidos,
  .item-pedido {
    background-color: #1f2937;
    border-color: #374151;
  }
  
  .titulo-perfil p,
  .fecha-pedido {
    color: #9ca3af;
  }
  
  .info-value {
    color: #e5e7eb;
  }
  
  .item-info:hover {
    background-color: #111827;
  }
  
  .input-animated {
    background: #111827;
    border-color: #374151;
    color: #e5e7eb;
  }
  
  .input-animated:focus {
    background: #111827;
    border-color: #3B82F6;
  }
  
  .boton-secundario {
    background: #374151;
    color: #e5e7eb;
    border-color: #4b5563;
  }
  
  .filtro-btn {
    background: #1f2937;
    border-color: #374151;
    color: #e5e7eb;
  }
  
  .paginacion-superior {
    background-color: #111827;
  }
  
  .boton-pagina {
    background: #1f2937;
    border-color: #374151;
    color: #e5e7eb;
  }
  
  .no-pedidos {
    background-color: #111827;
    border-color: #374151;
  }
  
  .no-pedidos p {
    color: #9ca3af;
  }
} */
</style>