<template>
    <div class="container">
        <div class="row">
            <div class="col-12">
                <div class="card">
                    <div class="card-header bg-primary-subtle">
                        <span class="card-title h3">Registros de pedidos</span>
                    </div>
                    <div class="card-body">
                        <div class="row gy-4">
                            <div class="col-12 col-md-8">
                                <input type="text" class="form-control" v-model="searchText"
                                    placeholder="Buscar por nombre, email, número de pedido...">
                            </div>
                            <!-- Tabla -->
                            <div class="col-12">
                                <div class="table-responsive">
                                    <table class="table table-striped table-hover">
                                        <thead class="table-primary">
                                            <tr class="text-center">
                                                <th>ID</th>
                                                <th>Nombre</th>
                                                <th>Email</th>
                                                <th>Número de pedido</th>
                                                <th>Productos</th>
                                                <th>Fecha de creación</th>
                                                <th>Estado</th>
                                                <th>Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr v-for="(item, index) in datos" :key="item.id" class="text-center">
                                                <td>{{ index + 1 }}</td>
                                                <td>{{ item.user?.nombre }} {{ item.user?.apellido }}</td>
                                                <td>{{ item.user?.email }}</td>
                                                <td>{{ item.id }}</td>
                                                <td>{{ item.productos?.length }}</td>
                                                <td>{{ formatDate(item.created_at) }}</td>
                                                <td>
                                                    <span class="badge bg-success">estado</span>
                                                </td>
                                                <td>
                                                    <div class="btn-group">
                                                        <button class="btn btn-sm btn-primary"
                                                            @click="showOrder(item.id)">Ver</button>
                                                        <button class="btn btn-sm btn-danger"
                                                            @click="deleteOrder(item.id)">Eliminar</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <!-- Modal -->
    <div class="modal fade" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1"
    aria-labelledby="staticBackdropLabel" aria-hidden="true">
    <div class="modal-dialog modal-xl modal-dialog-centered">
        <div class="modal-content">
            <!-- Encabezado del Modal -->
            <div class="modal-header bg-primary text-white">
                <h5 class="modal-title" id="staticBackdropLabel">Detalle del Pedido</h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>

            <!-- Cuerpo del Modal -->
            <div class="modal-body">
                <div class="row g-3">
                    <!-- Columna 1: Datos del Usuario -->
                    <div class="col-12 col-md-4">
                        <div class="card h-100 shadow-sm">
                            <div class="card-header bg-primary text-white">
                                <span class="card-title h5">Datos del Usuario</span>
                            </div>
                            <div class="card-body">
                                <p class="mb-2"><strong>Nombre:</strong> {{ detailOrder.user?.nombre }} {{ detailOrder.user?.apellido }}</p>
                                <p class="mb-2"><strong>Email:</strong> {{ detailOrder.user?.email }}</p>
                                <p class="mb-2"><strong>Teléfono:</strong> {{ detailOrder.user?.telefono }}</p>
                                <p class="mb-2"><strong>Dirección:</strong> {{ detailOrder.user?.direccion }}</p>
                                <p class="mb-0"><strong>CI:</strong> {{ detailOrder.user?.ci }}</p>
                            </div>
                        </div>
                    </div>

                    <!-- Columna 2: Productos del Pedido -->
                    <div class="col-12 col-md-4">
                        <div class="card h-100 shadow-sm">
                            <div class="card-header bg-primary text-white">
                                <span class="card-title h5">Productos del Pedido</span>
                            </div>
                            <div class="card-body">
                                <ul class="list-group list-group-flush">
                                    <li class="list-group-item" v-for="(item, index) in detailOrder.productos" :key="item.id">
                                        <div class="d-flex justify-content-between align-items-center">
                                            <span>{{ index + 1 }}. {{ item.nombre }}</span>
                                            <span class="badge bg-primary rounded-pill">{{ item.pivot?.cantidad }}</span>
                                        </div>
                                        <small class="text-muted">Precio unitario: {{ item.precio }}</small>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <!-- Columna 3: A Cuenta del Pedido -->
                    <div class="col-12 col-md-4">
                        <div class="card h-100 shadow-sm">
                            <div class="card-header bg-primary text-white">
                                <span class="card-title h5">A Cuenta del Pedido</span>
                            </div>
                            <div class="card-body">
                                <p class="mb-2"><strong>Monto Total:</strong> {{ detailOrder.total_amount }}</p>
                                <p class="mb-2"><strong>Monto a Pagar:</strong> {{ detailOrder.total_to_pay }}</p>
                                <p class="mb-0"><strong>Saldo Pendiente:</strong> {{ detailOrder.pending }}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Pie del Modal -->
            <div class="modal-footer">
                <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cerrar</button>
            </div>
        </div>
    </div>
</div>
</template>
<script setup>
import { indexPedidos, showPedido } from '@/Services/PedidoService';
import { onMounted, ref } from 'vue';
import { format } from 'date-fns'; // Importar la función format
import { Modal } from 'bootstrap/dist/js/bootstrap.bundle.min';
const datos = ref([]);
let modal = null;
let instanciaModal = null;
const detailOrder = ref({});
onMounted(() => {
    modal = document.getElementById('staticBackdrop');
    instanciaModal = new Modal(modal);
    listOrders();
})
const listOrders = async () => {
    try {
        const { data } = await indexPedidos();
        datos.value = data.datos;
        console.log(datos.value);
    } catch (error) {
        console.log(error);
    }
}
// Función para formatear la fecha
const formatDate = (dateString) => {
    if (!dateString) return ''; // Manejar caso de fecha vacía
    const date = new Date(dateString); // Convertir a objeto Date
    return format(date, 'dd/MM/yyyy HH:mm'); // Formato deseado
}

const showOrder = async (id) => {
    console.log(`Ver pedido ${id}`);
    try {
        const { data } = await showPedido(id);
        console.log(data);
        detailOrder.value = {
            user: data.user,
            productos: data.productos,
            total_amount: data.total_amount,
            total_to_pay: data.total_to_pay,
            pending: data.pending,
        }
        console.log(detailOrder.value);
        instanciaModal.show();
    } catch (error) {
        console.log(error);
    }
}
</script>
<style></style>