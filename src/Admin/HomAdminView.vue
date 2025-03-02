<template>
  <div class="dashboard">
    <h1 class="dashboard-title">
      <font-awesome-icon icon="chart-line" class="title-icon" />
      Panel de Control
    </h1>
    
    <div class="stats-container">
      <div class="stat-card">
        <font-awesome-icon icon="shopping-cart" class="stat-icon" />
        <h3>Total Pedidos</h3>
        <p>{{ totalDePedidos }}</p>
      </div>
      <div class="stat-card">
        <font-awesome-icon icon="users" class="stat-icon" />
        <h3>Total Usuarios</h3>
        <p>{{ allUsers }}</p>
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
import { ref, onMounted, computed } from 'vue';
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

onMounted(async () => {
  await Promise.all([
    listarPedidosTotal(),
    listarPedidosTotalProceso(),
    listarPedidosTotalCompletados(),
    listarUsuariosTotal(),
    listarUsuariosTotalActivos(),
    listarUsuariosTotalInactivos(),
  ]);
});

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

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom'
    }
  }
};

const barChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top'
    },
    title: {
      display: true,
      text: 'Distribución de Estados de Pedidos'
    }
  },
  scales: {
    y: {
      beginAtZero: true
    }
  }
};
</script>

<style scoped>
.dashboard {
  padding: 2rem;
  background-color: #f8fafc;
  min-height: 100vh;
}

.dashboard-title {
  font-size: 2.5rem;
  color: #1e293b;
  margin-bottom: 2rem;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.title-icon {
  color: #41B883;
}

.stats-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background-color: white;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  text-align: center;
  transition: transform 0.2s ease-in-out;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-icon {
  font-size: 2rem;
  color: #41B883;
  margin-bottom: 1rem;
}

.stat-card h3 {
  font-size: 1.1rem;
  color: #64748b;
  margin-bottom: 0.75rem;
}

.stat-card p {
  font-size: 2rem;
  color: #1e293b;
  font-weight: bold;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
}

.chart-container {
  background-color: white;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  transition: transform 0.2s ease-in-out;
}

.chart-container:hover {
  transform: translateY(-5px);
}

.chart-container h2 {
  font-size: 1.3rem;
  color: #1e293b;
  margin-bottom: 1.5rem;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.chart-icon {
  color: #41B883;
}

.chart-wrapper {
  flex-grow: 1;
  height: 300px;
  position: relative;
}

.full-width {
  grid-column: 1 / -1;
}

@media (max-width: 768px) {
  .dashboard {
    padding: 1rem;
  }

  .dashboard-title {
    font-size: 2rem;
  }

  .dashboard-grid {
    grid-template-columns: 1fr;
  }

  .chart-wrapper {
    height: 250px;
  }

  .stat-card {
    padding: 1rem;
  }
}
</style>