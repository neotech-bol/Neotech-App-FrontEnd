<template>
    <div class="orders-dashboard">
      <h1 class="dashboard-title">Panel de Pedidos</h1>
      
      <div class="dashboard-summary">
        <div class="summary-card">
          <h3>Pedidos Totales</h3>
          <p class="summary-number">{{ totalOrders }}</p>
        </div>
        <div class="summary-card">
          <h3>Pedidos Pendientes</h3>
          <p class="summary-number">{{ pendingOrders }}</p>
        </div>
        <div class="summary-card">
          <h3>Ingresos Totales</h3>
          <p class="summary-number">{{ totalRevenue }} Bs</p>
        </div>
      </div>
  
      <div class="orders-list-container">
        <h2>Pedidos Recientes</h2>
        <div class="orders-list">
          <div v-for="order in recentOrders" :key="order.id" class="order-item" @click="selectOrder(order)">
            <div class="order-basic-info">
              <span class="order-number">#{{ order.number }}</span>
              <span :class="['order-status', order.status]">{{ order.status }}</span>
            </div>
            <div class="order-details">
              <p>{{ order.customerName }}</p>
              <p>{{ order.date }}</p>
              <p class="order-total">{{ order.total }} Bs</p>
            </div>
          </div>
        </div>
      </div>
  
      <transition name="fade">
        <div v-if="selectedOrder" class="order-details-modal">
          <div class="modal-content">
            <button class="close-button" @click="closeOrderDetails">&times;</button>
            <h2>Detalles del Pedido #{{ selectedOrder.number }}</h2>
            <div class="order-info">
              <p><strong>Cliente:</strong> {{ selectedOrder.customerName }}</p>
              <p><strong>Fecha:</strong> {{ selectedOrder.date }}</p>
              <p><strong>Estado:</strong> <span :class="['order-status', selectedOrder.status]">{{ selectedOrder.status }}</span></p>
            </div>
            <div class="order-items">
              <h3>Artículos</h3>
              <ul>
                <li v-for="item in selectedOrder.items" :key="item.id">
                  {{ item.name }} - {{ item.quantity }} x {{ item.price }} Bs
                </li>
              </ul>
            </div>
            <div class="order-total">
              <h3>Total: {{ selectedOrder.total }} Bs</h3>
            </div>
            <div class="order-actions">
              <button class="action-button approve" @click="approveOrder">Aprobar Pedido</button>
              <button class="action-button reject" @click="rejectOrder">Rechazar Pedido</button>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue';
  
  // Datos de ejemplo
  const orders = ref([
    { id: 1, number: '1001', status: 'pending', customerName: 'Juan Pérez', date: '2023-05-15', total: 1500, items: [
      { id: 1, name: 'Producto A', quantity: 2, price: 500 },
      { id: 2, name: 'Producto B', quantity: 1, price: 500 }
    ]},
    { id: 2, number: '1002', status: 'approved', customerName: 'María García', date: '2023-05-14', total: 2000, items: [
      { id: 3, name: 'Producto C', quantity: 1, price: 2000 }
    ]},
    { id: 3, number: '1003', status: 'pending', customerName: 'Carlos Rodríguez', date: '2023-05-13', total: 1000, items: [
      { id: 4, name: 'Producto D', quantity: 2, price: 500 }
    ]},
  ]);
  
  const selectedOrder = ref(null);
  
  const totalOrders = computed(() => orders.value.length);
  const pendingOrders = computed(() => orders.value.filter(order => order.status === 'pending').length);
  const totalRevenue = computed(() => orders.value.reduce((sum, order) => sum + order.total, 0));
  
  const recentOrders = computed(() => orders.value.slice(0, 5)); // Mostrar solo los 5 pedidos más recientes
  
  const selectOrder = (order) => {
    selectedOrder.value = order;
  };
  
  const closeOrderDetails = () => {
    selectedOrder.value = null;
  };
  
  const approveOrder = () => {
    if (selectedOrder.value) {
      selectedOrder.value.status = 'approved';
      // Aquí iría la lógica para actualizar el estado en el backend
      alert('Pedido aprobado');
      closeOrderDetails();
    }
  };
  
  const rejectOrder = () => {
    if (selectedOrder.value) {
      selectedOrder.value.status = 'rejected';
      // Aquí iría la lógica para actualizar el estado en el backend
      alert('Pedido rechazado');
      closeOrderDetails();
    }
  };
  </script>
  
  <style scoped>
  .orders-dashboard {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
    font-family: Arial, sans-serif;
  }
  
  .dashboard-title {
    font-size: 2.5rem;
    color: #333;
    margin-bottom: 2rem;
    text-align: center;
  }
  
  .dashboard-summary {
    display: flex;
    justify-content: space-between;
    margin-bottom: 3rem;
  }
  
  .summary-card {
    background-color: #f0f0f0;
    border-radius: 8px;
    padding: 1.5rem;
    width: 30%;
    text-align: center;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
  
  .summary-card h3 {
    font-size: 1.2rem;
    color: #666;
    margin-bottom: 0.5rem;
  }
  
  .summary-number {
    font-size: 2rem;
    font-weight: bold;
    color: #333;
  }
  
  .orders-list-container {
    background-color: #fff;
    border-radius: 8px;
    padding: 2rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
  
  .orders-list-container h2 {
    font-size: 1.5rem;
    color: #333;
    margin-bottom: 1rem;
  }
  
  .order-item {
    border-bottom: 1px solid #e0e0e0;
    padding: 1rem 0;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }
  
  .order-item:hover {
    background-color: #f9f9f9;
  }
  
  .order-basic-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
  }
  
  .order-number {
    font-weight: bold;
    font-size: 1.1rem;
  }
  
  .order-status {
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.9rem;
  }
  
  .order-status.pending {
    background-color: #ffd700;
    color: #333;
  }
  
  .order-status.approved {
    background-color: #4caf50;
    color: white;
  }
  
  .order-status.rejected {
    background-color: #f44336;
    color: white;
  }
  
  .order-details p {
    margin: 0.25rem 0;
    color: #666;
  }
  
  .order-total {
    font-weight: bold;
    color: #333;
  }
  
  .order-details-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }
  
  .modal-content {
    background-color: #fff;
    border-radius: 8px;
    padding: 2rem;
    width: 80%;
    max-width: 600px;
    max-height: 80vh;
    overflow-y: auto;
    position: relative;
  }
  
  .close-button {
    position: absolute;
    top: 1rem;
    right: 1rem;
    font-size: 1.5rem;
    background: none;
    border: none;
    cursor: pointer;
  }
  
  .order-info {
    margin-bottom: 1rem;
  }
  
  .order-items {
    margin-bottom: 1rem;
  }
  
  .order-items ul {
    list-style-type: none;
    padding: 0;
  }
  
  .order-items li {
    margin-bottom: 0.5rem;
  }
  
  .order-actions {
    display: flex;
    justify-content: space-between;
    margin-top: 2rem;
  }
  
  .action-button {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 4px;
    font-weight: bold;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }
  
  .action-button.approve {
    background-color: #4caf50;
    color: white;
  }
  
  .action-button.approve:hover {
    background-color: #45a049;
  }
  
  .action-button.reject {
    background-color: #f44336;
    color: white;
  }
  
  .action-button.reject:hover {
    background-color: #d32f2f;
  }
  
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.3s ease;
  }
  
  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
  
  @media (max-width: 768px) {
    .dashboard-summary {
      flex-direction: column;
    }
  
    .summary-card {
      width: 100%;
      margin-bottom: 1rem;
    }
  
    .modal-content {
      width: 95%;
    }
  }
  </style>