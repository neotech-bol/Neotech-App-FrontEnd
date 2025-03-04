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
    </header>
    <main class="contenido-perfil">
      <section class="info-perfil">
        <div class="section-header">
          <h2>Información del Perfil</h2>
          <div class="badge-container">
            <span class="member-badge">
              <i class="fas fa-crown"></i> Cliente Premium
            </span>
          </div>
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
              <span class="estado-pedido" :class="pedido.estado === 1 ? 'entregado' : 'proceso'">
                <i class="fas" :class="pedido.estado === 1 ? 'fa-check-circle' : 'fa-clock'"></i>
                {{ pedido.estado === 1 ? 'Entregado' : 'En Proceso' }}
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
            <button class="boton-principal">Ir a comprar</button>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { updateUserWeb, userAutenticado } from '@/Services/UsuarioService'
import { generaPDFPedidoID, repitOrder } from '@/Services/PedidoService';

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
const validationErrors = ref({})
// Mounted hook
onMounted(() => {
  userAuth();
});

// Funciones
const userAuth = async () => {
  try {
    const { data } = await userAutenticado();
    user.value = data.datos;
  } catch (error) {
    console.error(error);
  }
};

const filtrarPedidos = (filtro) => {
  filtroActual.value = filtro;
  paginaActual.value = 1;
};

const pedidosFiltrados = computed(() => {
  if (!user.value.pedidos) return [];

  switch (filtroActual.value) {
    case 'entregados':
      return user.value.pedidos.filter(p => p.estado === 1);
    case 'proceso':
      return user.value.pedidos.filter(p => p.estado === 0);
    default:
      return user.value.pedidos;
  }
});

// Computed properties
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
  guardando.value = true
  validationErrors.value = {}
  try {
    const { data } = await updateUserWeb(usuarioEditado.value)
    console.log(data)
    userAuth()
    editando.value = false
  } catch (error) {
    if (error.response && error.response.data && error.response.data.errors) {
      validationErrors.value = error.response.data.errors
    } else {
      console.error(error)
    }
  } finally {
    guardando.value = false
  }
}


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
  } catch (error) {
    console.log(error);
  }
}
const repetirPedido = async (pedido) => {
  try {
    console.log('Repitiendo pedido:', pedido.id);
    const { data } = await repitOrder(pedido);
    console.log('Pedido repetido:', data);
  } catch (error) {
    console.error('Error al repetir el pedido:', error);
  }
};
const formatearGenero = (genero) => {
  const generos = {
    'M': 'Masculino',
    'F': 'Femenino',
    'Otro': 'Otro'
  }
  return generos[genero] || 'No especificado'
}
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
  return estado === 1 ? '100%' : '60%';
};

// Watchers
watch(filtroActual, () => {
  paginaActual.value = 1;
});
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
  padding: 2rem;
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
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
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
  width: 110px;
  height: 110px;
  background: var(--primary-color);
  color: white;
  font-size: 2.5rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  margin-right: 2rem;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  cursor: pointer;
  position: relative;
  box-shadow: 0 4px 10px rgba(37, 99, 235, 0.3);
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

.titulo-perfil h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.gradient-text {
  background: var(--primary-color);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  color: transparent;
}

.titulo-perfil p {
  font-size: 1.25rem;
  color: #4b5563;
  font-weight: 400;
}

/* Main Content */
.contenido-perfil {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.member-badge {
  background: linear-gradient(135deg, #F59E0B, #D97706);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 2rem;
  font-size: 0.875rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 2px 8px rgba(213, 119, 6, 0.3);
  transition: all 0.3s ease;
}

.member-badge:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(213, 119, 6, 0.4);
}

.info-perfil,
.historial-pedidos {
  background-color: #fff;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
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
  font-size: 1.75rem;
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
  grid-template-columns: repeat(2, 1fr);
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
  padding: 1.5rem;
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

/* Responsive Styles */
@media (max-width: 1200px) {
  .contenedor-perfil {
    padding: 1.5rem;
  }
}

@media (max-width: 1024px) {
  .contenido-perfil {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  
  .info-perfil, 
  .historial-pedidos {
    width: 100%;
  }
  
  .encabezado-perfil {
    padding: 1.5rem;
  }
  
  .titulo-perfil h1 {
    font-size: 2rem;
  }
}

@media (max-width: 768px) {
  .contenedor-perfil {
    padding: 1rem;
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
  
  .titulo-perfil h1 {
    font-size: 1.75rem;
  }
  
  .titulo-perfil p {
    font-size: 1rem;
  }
  
  .botones-edicion {
    justify-content: center;
  }
  
  .item-pedido {
    padding: 1.25rem 1rem;
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

@media (max-width: 480px) {
  .contenedor-perfil {
    padding: 0.75rem;
  }
  
  .paginacion-superior {
    width: 100%;
  }
  
  .filtro-btn {
    font-size: 0.75rem;
    padding: 0.5rem;
  }
  
  .boton-principal,
  .boton-secundario,
  .boton-accion {
    width: 100%;
    justify-content: center;
  }
  
  .botones-edicion {
    flex-direction: column;
    width: 100%;
  }
}
</style>