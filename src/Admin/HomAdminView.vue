<template>
  <div class="dashboard">
    <header class="dashboard-header">
      <h1 class="dashboard-title">
        <font-awesome-icon icon="chart-line" class="title-icon" />
        Panel de Control
      </h1>
    </header>
    
    <div class="stats-container">
      <div class="stat-card">
        <div class="stat-icon-wrapper">
          <font-awesome-icon icon="shopping-cart" class="stat-icon" />
        </div>
        <div class="stat-content">
          <h3>Total Pedidos</h3>
          <p>{{ totalDePedidos }}</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon-wrapper">
          <font-awesome-icon icon="users" class="stat-icon" />
        </div>
        <div class="stat-content">
          <h3>Total Usuarios</h3>
          <p>{{ allUsers }}</p>
        </div>
      </div>
    </div>

    <div class="dashboard-grid">
      <div class="chart-container">
        <h2>
          <font-awesome-icon icon="shopping-cart" class="chart-icon" />
          Estado de Pedidos
        </h2>
        <div class="chart-wrapper">
          <Doughnut :data="ordersChartData" :options="chartOptions" />
        </div>
      </div>
      
      <div class="chart-container">
        <h2>
          <font-awesome-icon icon="users" class="chart-icon" />
          Estado de Usuarios
        </h2>
        <div class="chart-wrapper">
          <Doughnut :data="usersChartData" :options="chartOptions" />
        </div>
      </div>
      
      <div class="chart-container full-width">
        <h2>
          <font-awesome-icon icon="chart-line" class="chart-icon" />
          Distribución de Pedidos
        </h2>
        <div class="chart-wrapper">
          <Bar :data="ordersBarChartData" :options="barChartOptions" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, onBeforeUnmount } from 'vue';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title, BarElement } from 'chart.js';
import { Doughnut, Bar } from 'vue-chartjs';
import { totalCompletadosPedidos, totalEnProcesoPedidos, totalPedidos, totalUsers, totalUsersActives, totalUsersInactives } from '@/Services/DashboardService';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title, BarElement);

const totalDePedidos = ref(0);
const totalProcesoPedidos = ref(0);
const totalPedidosCompletados = ref(0);
const allUsers = ref(0);
const allUsersActives = ref(0);
const allUsersInactives = ref(0);
const isMobile = ref(window.innerWidth < 768);

// Función para actualizar el estado de isMobile
const checkMobile = () => {
  isMobile.value = window.innerWidth < 768;
};

// Agregar event listener para el resize
onMounted(() => {
  window.addEventListener('resize', checkMobile);
  loadDashboardData();
});

// Limpiar event listener
onBeforeUnmount(() => {
  window.removeEventListener('resize', checkMobile);
});

const loadDashboardData = async () => {
  try {
    await Promise.all([
      listarPedidosTotal(),
      listarPedidosTotalProceso(),
      listarPedidosTotalCompletados(),
      listarUsuariosTotal(),
      listarUsuariosTotalActivos(),
      listarUsuariosTotalInactivos(),
    ]);
  } catch (error) {
    console.error('Error al cargar datos del dashboard:', error);
  }
};

const listarPedidosTotal = async () => {
  try {
    const { data } = await totalPedidos();
    totalDePedidos.value = data.total_pedidos;
  } catch (error) {
    console.error('Error al obtener total de pedidos:', error);
  }
};

const listarPedidosTotalProceso = async () => {
  try {
    const { data } = await totalEnProcesoPedidos();
    totalProcesoPedidos.value = data.total_pedidos_en_proceso;
  } catch (error) {
    console.error('Error al obtener pedidos en proceso:', error);
  }
};

const listarPedidosTotalCompletados = async () => {
  try {
    const { data } = await totalCompletadosPedidos();
    totalPedidosCompletados.value = data.total_pedidos_completados;
  } catch (error) {
    console.error('Error al obtener pedidos completados:', error);
  }
};

const listarUsuariosTotal = async () => {
  try {
    const { data } = await totalUsers();
    allUsers.value = data.total_usuarios;
  } catch (error) {
    console.error('Error al obtener total de usuarios:', error);
  }
};

const listarUsuariosTotalActivos = async () => {
  try {
    const { data } = await totalUsersActives();
    allUsersActives.value = data.total_usuarios_activos;
  } catch (error) {
    console.error('Error al obtener usuarios activos:', error);
  }
};

const listarUsuariosTotalInactivos = async () => {
  try {
    const { data } = await totalUsersInactives();
    allUsersInactives.value = data.total_usuarios_inactivos;
  } catch (error) {
    console.error('Error al obtener usuarios inactivos:', error);
  }
};

const ordersChartData = computed(() => ({
  labels: ['Completados', 'En Proceso', 'Otros'],
  datasets: [
    {
      backgroundColor: ['#41B883', '#FFCE56', '#FF6384'],
      data: [totalPedidosCompletados.value, totalProcesoPedidos.value, totalDePedidos.value - totalPedidosCompletados.value - totalProcesoPedidos.value]
    }
  ]
}));

const usersChartData = computed(() => ({
  labels: ['Activos', 'Inactivos'],
  datasets: [
    {
      backgroundColor: ['#36A2EB', '#FF6384'],
      data: [allUsersActives.value, allUsersInactives.value]
    }
  ]
}));

const ordersBarChartData = computed(() => ({
  labels: ['Completados', 'En Proceso', 'Pendientes'],
  datasets: [
    {
      label: 'Cantidad de Pedidos',
      backgroundColor: ['#41B883', '#FFCE56', '#FF6384'],
      data: [
        totalPedidosCompletados.value,
        totalProcesoPedidos.value,
        totalDePedidos.value - totalPedidosCompletados.value - totalProcesoPedidos.value
      ]
    }
  ]
}));

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: isMobile.value ? 'top' : 'bottom',
      labels: {
        boxWidth: isMobile.value ? 12 : 20,
        font: {
          size: isMobile.value ? 10 : 12
        }
      }
    },
    tooltip: {
      bodyFont: {
        size: isMobile.value ? 10 : 14
      },
      titleFont: {
        size: isMobile.value ? 12 : 16
      }
    }
  }
}));

const barChartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
      labels: {
        boxWidth: isMobile.value ? 12 : 20,
        font: {
          size: isMobile.value ? 10 : 12
        }
      }
    },
    title: {
      display: true,
      text: 'Distribución de Estados de Pedidos',
      font: {
        size: isMobile.value ? 14 : 18
      }
    },
    tooltip: {
      bodyFont: {
        size: isMobile.value ? 10 : 14
      },
      titleFont: {
        size: isMobile.value ? 12 : 16
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        font: {
          size: isMobile.value ? 10 : 12
        }
      }
    },
    x: {
      ticks: {
        font: {
          size: isMobile.value ? 10 : 12
        }
      }
    }
  }
}));
</script>

<style scoped>
.dashboard {
  padding: clamp(0.75rem, 5vw, 2rem);
  background-color: #f8fafc;
  min-height: 100vh;
  width: 100%;
  overflow-x: hidden;
}

.dashboard-header {
  margin-bottom: clamp(1rem, 4vw, 2rem);
  position: sticky;
  top: 0;
  z-index: 10;
  background-color: rgba(248, 250, 252, 0.95);
  backdrop-filter: blur(5px);
  padding: 0.75rem 0;
}

.dashboard-title {
  font-size: clamp(1.5rem, 5vw, 2.5rem);
  color: #1e293b;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.title-icon {
  color: #41B883;
}

.stats-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 250px), 1fr));
  gap: clamp(0.75rem, 3vw, 1.5rem);
  margin-bottom: clamp(1.5rem, 4vw, 2rem);
}

.stat-card {
  background-color: white;
  border-radius: 1rem;
  padding: clamp(1rem, 3vw, 1.5rem);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
}

.stat-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: clamp(3rem, 10vw, 4rem);
  height: clamp(3rem, 10vw, 4rem);
  border-radius: 50%;
  background-color: rgba(65, 184, 131, 0.1);
  flex-shrink: 0;
}

.stat-icon {
  font-size: clamp(1.25rem, 4vw, 1.75rem);
  color: #41B883;
}

.stat-content {
  flex-grow: 1;
}

.stat-card h3 {
  font-size: clamp(0.875rem, 3vw, 1.1rem);
  color: #64748b;
  margin-bottom: 0.5rem;
  white-space: nowrap;
}

.stat-card p {
  font-size: clamp(1.5rem, 5vw, 2rem);
  color: #1e293b;
  font-weight: bold;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 350px), 1fr));
  gap: clamp(1rem, 4vw, 2rem);
}

.chart-container {
  background-color: white;
  border-radius: 1rem;
  padding: clamp(1rem, 3vw, 1.5rem);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  height: auto;
}

.chart-container:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
}

.chart-container h2 {
  font-size: clamp(1rem, 3.5vw, 1.3rem);
  color: #1e293b;
  margin-bottom: clamp(1rem, 3vw, 1.5rem);
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.chart-icon {
  color: #41B883;
}

.chart-wrapper {
  flex-grow: 1;
  height: clamp(200px, 50vh, 300px);
  position: relative;
  width: 100%;
}

.full-width {
  grid-column: 1 / -1;
}

@media (max-width: 480px) {
  .dashboard {
    padding: 0.75rem;
  }
  
  .stat-card {
    padding: 0.875rem;
  }
  
  .chart-container {
    padding: 0.875rem;
  }
  
  .chart-wrapper {
    height: 200px;
  }
}

@media (min-width: 481px) and (max-width: 767px) {
  .dashboard {
    padding: 1rem;
  }
  
  .chart-wrapper {
    height: 250px;
  }
}

@media (min-width: 768px) and (max-width: 1023px) {
  .dashboard-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .full-width {
    grid-column: span 2;
  }
}

@media (min-width: 1024px) {
  .dashboard-grid {
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  }
}

/* Animaciones */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.stat-card, .chart-container {
  animation: fadeIn 0.5s ease-out forwards;
}

.stat-card:nth-child(1) { animation-delay: 0.1s; }
.stat-card:nth-child(2) { animation-delay: 0.2s; }
.chart-container:nth-child(1) { animation-delay: 0.3s; }
.chart-container:nth-child(2) { animation-delay: 0.4s; }
.chart-container:nth-child(3) { animation-delay: 0.5s; }
</style>