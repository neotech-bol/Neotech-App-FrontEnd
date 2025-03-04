<template>
    <div class="container-fluid py-4">
      <div class="card shadow">
        <div class="card-header bg-primary bg-opacity-10 d-flex justify-content-between align-items-center flex-wrap gap-3 p-3">
          <h2 class="card-title h4 m-0">Registros de pedidos</h2>
          <div>
            <button class="btn btn-primary" @click="fetchOrders()">
              <i class="fas fa-file-excel me-2"></i>Exportar Excel
            </button>
          </div>
        </div>
        <div class="card-body p-0">
          <div class="p-3">
            <div class="input-group mb-3">
              <span class="input-group-text bg-light">
                <i class="fas fa-search"></i>
              </span>
              <input 
                type="text" 
                class="form-control" 
                placeholder="Buscar por nombre, email, número de pedido..." 
                v-model="searchText"
              >
            </div>
          </div>
  
          <!-- Table for larger screens -->
          <div class="table-responsive d-none d-md-block">
            <table class="table table-hover align-middle mb-0">
              <thead class="bg-light">
                <tr class="text-center">
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Número de pedido</th>
                  <th>Productos</th>
                  <th>Fecha</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in filteredOrders" :key="item.id" class="text-center">
                  <td>{{ index + 1 }}</td>
                  <td>{{ item.user?.nombre }} {{ item.user?.apellido }}</td>
                  <td>{{ item.user?.email }}</td>
                  <td>{{ item.id }}</td>
                  <td>
                    <span class="badge bg-info rounded-pill">{{ item.productos?.length || 0 }}</span>
                  </td>
                  <td>{{ formatDate(item.created_at) }}</td>
                  <td>
                    <span class="badge" :class="item.estado == false ? 'bg-warning' : 'bg-success'">
                      {{ item.estado == false ? 'Pendiente' : 'Completado' }}
                    </span>
                  </td>
                  <td>
                    <div class="btn-group">
                      <button class="btn btn-sm btn-outline-primary" @click="showOrder(item.id)">
                        <i class="fas fa-eye me-1"></i><span class="d-none d-lg-inline">Ver</span>
                      </button>
                      <button class="btn btn-sm btn-outline-success" @click="completeOrderPending(item.id)" :disabled="item.estado === true">
                        <i class="fas fa-check me-1"></i><span class="d-none d-lg-inline">Completar</span>
                      </button>
                      <button class="btn btn-sm btn-outline-danger" @click="fetchOrdersPDFId(item.id)">
                        <i class="fas fa-file-pdf me-1"></i><span class="d-none d-lg-inline">PDF</span>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
  
          <!-- Cards for mobile view -->
          <div class="d-md-none">
            <div v-for="(item, index) in filteredOrders" :key="item.id" class="card mb-3 mx-3">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <h5 class="card-title mb-0">Pedido #{{ item.id }}</h5>
                  <span class="badge" :class="item.estado == false ? 'bg-warning' : 'bg-success'">
                    {{ item.estado == false ? 'Pendiente' : 'Completado' }}
                  </span>
                </div>
                <p class="card-text">
                  <strong>Cliente:</strong> {{ item.user?.nombre }} {{ item.user?.apellido }}<br>
                  <strong>Email:</strong> {{ item.user?.email }}<br>
                  <strong>Productos:</strong> <span class="badge bg-info rounded-pill">{{ item.productos?.length || 0 }}</span><br>
                  <strong>Fecha:</strong> {{ formatDate(item.created_at) }}
                </p>
                <div class="d-flex justify-content-end gap-2">
                  <button class="btn btn-sm btn-outline-primary" @click="showOrder(item.id)">
                    <i class="fas fa-eye me-1"></i>Ver
                  </button>
                  <button class="btn btn-sm btn-outline-success" @click="completeOrderPending(item.id)" :disabled="item.estado === true">
                    <i class="fas fa-check me-1"></i>Completar
                  </button>
                  <button class="btn btn-sm btn-outline-danger" @click="fetchOrdersPDFId(item.id)">
                    <i class="fas fa-file-pdf me-1"></i>PDF
                  </button>
                </div>
              </div>
            </div>
          </div>
  
          <!-- Empty state -->
          <div v-if="datos.length === 0" class="text-center py-5">
            <div class="mb-3">
              <i class="fas fa-shopping-cart fa-3x text-muted"></i>
            </div>
            <h5 class="text-muted">No hay pedidos registrados</h5>
            <p class="text-muted">Los pedidos aparecerán aquí cuando se realicen</p>
          </div>
        </div>
      </div>
  
      <!-- Modal de detalles del pedido -->
      <div class="modal fade" id="orderDetailModal" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1"
        aria-labelledby="orderDetailModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-xl modal-dialog-centered">
          <div class="modal-content">
            <!-- Encabezado del Modal -->
            <div class="modal-header bg-primary bg-opacity-10">
              <h5 class="modal-title" id="orderDetailModalLabel">
                <i class="fas fa-info-circle me-2"></i>Detalle del Pedido #{{ detailOrder.id }}
              </h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
  
            <!-- Cuerpo del Modal -->
            <div class="modal-body">
              <div class="row g-4">
                <!-- Columna 1: Datos del Usuario -->
                <div class="col-12 col-md-4">
                  <div class="card h-100 border-0 shadow-sm">
                    <div class="card-header bg-primary bg-opacity-10">
                      <span class="card-title h5">
                        <i class="fas fa-user me-2"></i>Datos del Cliente
                      </span>
                    </div>
                    <div class="card-body">
                      <ul class="list-group list-group-flush">
                        <li class="list-group-item d-flex justify-content-between px-0">
                          <span class="text-muted">Nombre:</span>
                          <span class="fw-medium">{{ detailOrder.user?.nombre }} {{ detailOrder.user?.apellido }}</span>
                        </li>
                        <li class="list-group-item d-flex justify-content-between px-0">
                          <span class="text-muted">Email:</span>
                          <span class="fw-medium">{{ detailOrder.user?.email }}</span>
                        </li>
                        <li class="list-group-item d-flex justify-content-between px-0">
                          <span class="text-muted">Teléfono:</span>
                          <span class="fw-medium">{{ detailOrder.user?.telefono }}</span>
                        </li>
                        <li class="list-group-item d-flex justify-content-between px-0">
                          <span class="text-muted">CI:</span>
                          <span class="fw-medium">{{ detailOrder.user?.ci }}</span>
                        </li>
                        <li class="list-group-item px-0">
                          <span class="text-muted">Dirección:</span>
                          <p class="mb-0 mt-1">{{ detailOrder.user?.direccion }}</p>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
  
                <!-- Columna 2: Productos del Pedido -->
                <div class="col-12 col-md-4">
                  <div class="card h-100 border-0 shadow-sm">
                    <div class="card-header bg-primary bg-opacity-10">
                      <span class="card-title h5">
                        <i class="fas fa-shopping-cart me-2"></i>Productos
                      </span>
                    </div>
                    <div class="card-body p-0">
                      <div class="list-group list-group-flush">
                        <div class="list-group-item" v-for="(item, index) in detailOrder.productos" :key="item.id">
                          <div class="d-flex justify-content-between align-items-start">
                            <div>
                              <div class="d-flex align-items-center">
                                <span class="badge bg-primary rounded-pill me-2">{{ item.pivot?.cantidad }}</span>
                                <span class="fw-medium">{{ item.nombre }}</span>
                              </div>
                              <div class="text-muted small mt-1">
                                Precio unitario: {{ formatCurrency(item.precio) }}
                              </div>
                            </div>
                            <span class="fw-bold">{{ formatCurrency(item.precio * item.pivot?.cantidad) }}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
  
                <!-- Columna 3: Resumen Financiero -->
                <div class="col-12 col-md-4">
                  <div class="card h-100 border-0 shadow-sm">
                    <div class="card-header bg-primary bg-opacity-10">
                      <span class="card-title h5">
                        <i class="fas fa-money-bill-wave me-2"></i>Resumen Financiero
                      </span>
                    </div>
                    <div class="card-body">
                      <ul class="list-group list-group-flush">
                        <li class="list-group-item d-flex justify-content-between px-0">
                          <span class="text-muted">Monto Total:</span>
                          <span class="fw-bold">{{ formatCurrency(detailOrder.total_amount) }}</span>
                        </li>
                        <li class="list-group-item d-flex justify-content-between px-0">
                          <span class="text-muted">Monto a Pagar:</span>
                          <span class="fw-bold text-success">{{ formatCurrency(detailOrder.total_to_pay) }}</span>
                        </li>
                        <li class="list-group-item d-flex justify-content-between px-0">
                          <span class="text-muted">Saldo Pendiente:</span>
                          <span class="fw-bold text-danger">{{ formatCurrency(detailOrder.pending) }}</span>
                        </li>
                        <li class="list-group-item d-flex justify-content-between px-0" v-if="detailOrder.cupon">
                          <span class="text-muted">Cupón Aplicado:</span>
                          <span class="badge bg-info">{{ detailOrder.cupon?.codigo }} ({{ detailOrder.cupon?.descuento }}%)</span>
                        </li>
                        <li class="list-group-item d-flex justify-content-between px-0">
                          <span class="text-muted">Método de Pago:</span>
                          <span class="badge" :class="detailOrder.payment_method === 'in-person' ? 'bg-warning' : 'bg-info'">
                            {{ detailOrder.payment_method === 'in-person' ? 'En persona' : detailOrder.payment_method }}
                          </span>
                        </li>
                        <li class="list-group-item d-flex justify-content-between px-0">
                          <span class="text-muted">Estado:</span>
                          <span class="badge" :class="detailOrder.estado == false ? 'bg-warning' : 'bg-success'">
                            {{ detailOrder.estado == false ? 'Pendiente' : 'Completado' }}
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
  
            <!-- Pie del Modal -->
            <div class="modal-footer">
              <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">
                <i class="fas fa-times me-2"></i>Cerrar
              </button>
              <button 
                type="button" 
                class="btn btn-success" 
                @click="completeOrderPending(detailOrder.id)" 
                :disabled="detailOrder.estado === true"
                v-if="detailOrder.id"
              >
                <i class="fas fa-check me-2"></i>Completar Pedido
              </button>
              <button 
                type="button" 
                class="btn btn-danger" 
                @click="fetchOrdersPDFId(detailOrder.id)"
                v-if="detailOrder.id"
              >
                <i class="fas fa-file-pdf me-2"></i>Generar PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted } from 'vue';
  import { Modal } from 'bootstrap/dist/js/bootstrap.bundle.min';
  import { format } from 'date-fns';
  import { completeOrder, generaPDFPedidoID, generateExcel, indexPedidos, showPedido } from '@/Services/PedidoService';
  
  // Estado
  const datos = ref([]);
  const searchText = ref('');
  const detailOrder = ref({});
  let orderDetailModal = null;
  
  // Computed
  const filteredOrders = computed(() => {
    if (!searchText.value) return datos.value;
    
    const search = searchText.value.toLowerCase();
    return datos.value.filter(order => {
      return (
        (order.user?.nombre + ' ' + order.user?.apellido).toLowerCase().includes(search) ||
        order.user?.email.toLowerCase().includes(search) ||
        order.id.toString().includes(search)
      );
    });
  });
  
  // Lifecycle hooks
  onMounted(() => {
    orderDetailModal = new Modal(document.getElementById('orderDetailModal'));
    listOrders();
  });
  
  // Métodos
  const listOrders = async () => {
    try {
      const { data } = await indexPedidos();
      datos.value = data.datos;
      console.log(datos.value);
    } catch (error) {
      console.log(error);
    }
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return ''; // Manejar caso de fecha vacía
    const date = new Date(dateString); // Convertir a objeto Date
    return format(date, 'dd/MM/yyyy HH:mm'); // Formato deseado
  };
  
  const formatCurrency = (value) => {
    if (!value) return 'Bs. 0.00';
    return new Intl.NumberFormat('es-BO', { 
      style: 'currency', 
      currency: 'BOB',
      minimumFractionDigits: 2
    }).format(parseFloat(value));
  };
  
  const showOrder = async (id) => {
    console.log(`Ver pedido ${id}`);
    try {
      const { data } = await showPedido(id);
      console.log(data);
      detailOrder.value = data;
      orderDetailModal.show();
    } catch (error) {
      console.log(error);
    }
  };
  
  const completeOrderPending = async (id) => {
    console.log(`Completar pedido ${id}`);
    try {
      const { data } = await completeOrder(id);
      console.log(data);
      listOrders();
      
      // Si el pedido actual está abierto en el modal, actualizar su estado también
      if (detailOrder.value.id === id) {
        detailOrder.value.estado = true;
      }
    } catch (error) {
      console.log(error);
    }
  };
  
  const fetchOrders = async () => {
    try {
      const response = await generateExcel();
      // Crea un objeto URL a partir de la respuesta
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'pedidos.xlsx'); // Nombre del archivo a descargar
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url); // Liberar el objeto URL
    } catch (error) {
      console.log(error);
    }
  };
  
  const fetchOrdersPDFId = async (id) => {
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
  };
  </script>
  
  <style scoped>
  .card {
    transition: box-shadow 0.3s ease-in-out;
  }
  
  .card:hover {
    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
  }
  
  .btn-group .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
  
  @media (max-width: 767.98px) {
    .btn-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    
    .btn-group .btn {
      width: 100%;
    }
  }
  
  .list-group-item {
    border-left: none;
    border-right: none;
    padding: 0.75rem 0;
  }
  
  .list-group-item:first-child {
    border-top: none;
  }
  
  .list-group-item:last-child {
    border-bottom: none;
  }
  
  .modal-header, .modal-footer {
    padding: 1rem;
  }
  
  .modal-body {
    padding: 1.5rem;
  }
  </style>