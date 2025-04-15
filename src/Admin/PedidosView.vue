<template>
  <div class="container-fluid py-4">
    <div class="card shadow-sm border-0 rounded-3">
      <!-- Header con título y acciones principales -->
      <div class="card-header bg-white border-0 d-flex justify-content-between align-items-center flex-wrap gap-3 p-4">
        <h2 class="card-title h4 m-0 d-flex align-items-center">
          <span class="badge bg-primary bg-opacity-10 text-primary p-2 me-2 rounded-circle">
            <i class="fas fa-shopping-cart"></i>
          </span>
          Gestión de Pedidos
        </h2>
        <div class="d-flex flex-wrap gap-2">
          <!-- Dropdown para exportar con diseño mejorado -->
          <div class="dropdown">
            <button class="btn btn-primary dropdown-toggle" type="button" @click="toggleExportDropdown">
              <i class="fas fa-file-export me-2"></i>Exportar
            </button>
            <ul class="dropdown-menu dropdown-menu-end shadow-sm border-0 py-2" :class="{ 'show': showExportDropdown }"
              style="position: absolute; min-width: 240px;">
              <li class="dropdown-header px-3 py-2 text-uppercase small fw-bold text-muted">Excel</li>
              <li>
                <button class="dropdown-item d-flex align-items-center px-3 py-2" @click="fetchOrders">
                  <i class="fas fa-file-excel me-2 text-success"></i>
                  <div>
                    <div>Excel (Todos)</div>
                    <small class="text-muted">Exportar todos los pedidos</small>
                  </div>
                </button>
              </li>
              <li>
                <button class="dropdown-item d-flex align-items-center px-3 py-2" @click="descargarExcelPedidosPorCatalogo">
                  <i class="fas fa-file-excel me-2 text-primary"></i>
                  <div>
                    <div>Excel (Por Catálogo)</div>
                    <small class="text-muted">Filtrar por catálogo específico</small>
                  </div>
                </button>
              </li>
              <li><hr class="dropdown-divider mx-3"></li>
              <li class="dropdown-header px-3 py-2 text-uppercase small fw-bold text-muted">PDF</li>
              <li>
                <button class="dropdown-item d-flex align-items-center px-3 py-2" @click="descargarPdfPedidosCompletado">
                  <i class="fas fa-file-pdf me-2 text-danger"></i>
                  <div>
                    <div>PDF (Completados)</div>
                    <small class="text-muted">Solo pedidos completados</small>
                  </div>
                </button>
              </li>
              <li>
                <button class="dropdown-item d-flex align-items-center px-3 py-2" @click="descargarPdfPedidosEnProceso">
                  <i class="fas fa-file-pdf me-2 text-warning"></i>
                  <div>
                    <div>PDF (En proceso)</div>
                    <small class="text-muted">Solo pedidos pendientes</small>
                  </div>
                </button>
              </li>
              <li>
                <button class="dropdown-item d-flex align-items-center px-3 py-2" @click="descargarPdfPedidosPorCatalogo">
                  <i class="fas fa-file-pdf me-2 text-primary"></i>
                  <div>
                    <div>PDF (Por Catálogo)</div>
                    <small class="text-muted">Filtrar por catálogo específico</small>
                  </div>
                </button>
              </li>
              <li>
                <button class="dropdown-item d-flex align-items-center px-3 py-2" @click="descargarPdfPedidosEnProcesoPorCatalogo">
                  <i class="fas fa-file-pdf me-2 text-warning"></i>
                  <div>
                    <div>PDF (En proceso por Catálogo)</div>
                    <small class="text-muted">Pedidos pendientes por catálogo</small>
                  </div>
                </button>
              </li>
              <li>
                <button class="dropdown-item d-flex align-items-center px-3 py-2" @click="descargarPdfPedidosCompletadosPorCatalogo">
                  <i class="fas fa-file-pdf me-2 text-success"></i>
                  <div>
                    <div>PDF (Completados por Catálogo)</div>
                    <small class="text-muted">Pedidos completados por catálogo</small>
                  </div>
                </button>
              </li>
            </ul>
          </div>
          <button class="btn btn-outline-primary d-flex align-items-center" @click="listOrders">
            <i class="fas fa-sync-alt me-2"></i>Actualizar
          </button>
        </div>
      </div>

      <!-- Filtros y búsqueda con diseño mejorado -->
      <div class="card-body p-0">
        <div class="p-4 bg-light border-top border-bottom">
          <div class="row g-3">
            <div class="col-lg-5">
              <div class="input-group shadow-sm">
                <span class="input-group-text bg-white border-end-0">
                  <i class="fas fa-search text-muted"></i>
                </span>
                <input type="text" class="form-control border-start-0 ps-0" 
                  placeholder="Buscar por nombre, email, número de pedido..."
                  v-model="searchText" @input="applyFilters">
                <button class="btn btn-outline-secondary border-start-0" type="button" 
                  @click="clearSearch()" v-if="searchText">
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>
            <div class="col-lg-7">
              <div class="d-flex gap-2 flex-wrap">
                <div class="input-group shadow-sm flex-grow-1 flex-md-grow-0">
                  <span class="input-group-text bg-white border-end-0">
                    <i class="fas fa-filter text-muted"></i>
                  </span>
                  <select class="form-select border-start-0 ps-0" v-model="statusFilter" @change="applyFilters">
                    <option value="all">Todos los estados</option>
                    <option value="pending">Pendientes</option>
                    <option value="completed">Completados</option>
                  </select>
                </div>
                <div class="input-group shadow-sm flex-grow-1 flex-md-grow-0">
                  <span class="input-group-text bg-white border-end-0">
                    <i class="fas fa-book text-muted"></i>
                  </span>
                  <select class="form-select border-start-0 ps-0" v-model="catalogoFilter" @change="applyFilters">
                    <option value="">Todos los catálogos</option>
                    <option v-for="catalogo in catalogos" :key="catalogo.id" :value="catalogo.id">
                      {{ catalogo.nombre }}
                    </option>
                  </select>
                </div>
                <div class="input-group shadow-sm flex-grow-1 flex-md-grow-0">
                  <span class="input-group-text bg-white border-end-0">
                    <i class="fas fa-sort text-muted"></i>
                  </span>
                  <select class="form-select border-start-0 ps-0" v-model="sortBy" @change="applyFilters">
                    <option value="date_desc">Más recientes primero</option>
                    <option value="date_asc">Más antiguos primero</option>
                    <option value="amount_desc">Mayor importe primero</option>
                    <option value="amount_asc">Menor importe primero</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Contador de resultados y selector de vista -->
        <div class="d-flex justify-content-between align-items-center p-4">
          <div class="d-flex align-items-center">
            <span class="badge bg-primary rounded-pill me-2">{{ pagination.total }}</span>
            <p class="text-muted mb-0">
              Mostrando {{ datos.length }} de {{ pagination.total }} pedidos
            </p>
          </div>
          <div class="btn-group shadow-sm">
            <button class="btn" :class="viewMode === 'table' ? 'btn-primary' : 'btn-light'"
              @click="viewMode = 'table'">
              <i class="fas fa-table me-1"></i><span class="d-none d-md-inline">Tabla</span>
            </button>
            <button class="btn" :class="viewMode === 'cards' ? 'btn-primary' : 'btn-light'"
              @click="viewMode = 'cards'">
              <i class="fas fa-th-large me-1"></i><span class="d-none d-md-inline">Tarjetas</span>
            </button>
          </div>
        </div>

        <!-- Mensaje cuando no hay resultados con diseño mejorado -->
        <div v-if="datos.length === 0 && pagination.total > 0" class="text-center py-5">
          <div class="mb-3">
            <span class="badge bg-light p-3 rounded-circle">
              <i class="fas fa-search fa-2x text-muted"></i>
            </span>
          </div>
          <h5 class="text-muted">No se encontraron pedidos</h5>
          <p class="text-muted">Intenta con otra búsqueda o cambia los filtros</p>
          <button class="btn btn-primary mt-2 shadow-sm" @click="clearFilters">
            <i class="fas fa-filter me-2"></i>Limpiar filtros
          </button>
        </div>

        <!-- Empty state con diseño mejorado -->
        <div v-if="pagination.total === 0" class="text-center py-5">
          <div class="mb-3">
            <span class="badge bg-light p-3 rounded-circle">
              <i class="fas fa-shopping-cart fa-2x text-muted"></i>
            </span>
          </div>
          <h5 class="text-muted">No hay pedidos registrados</h5>
          <p class="text-muted">Los pedidos aparecerán aquí cuando se realicen</p>
        </div>

        <!-- Table view con diseño mejorado -->
        <div class="table-responsive" v-if="datos.length > 0 && (viewMode === 'table' || windowWidth >= 768)">
          <table class="table table-hover align-middle mb-0">
            <thead class="bg-light">
              <tr>
                <th class="px-4 py-3">
                  <div class="d-flex align-items-center">
                    <span>ID</span>
                    <button class="btn btn-sm text-primary border-0 p-0 ms-1" @click="toggleSort('id')">
                      <i class="fas" :class="getSortIcon('id')"></i>
                    </button>
                  </div>
                </th>
                <th class="px-4 py-3">
                  <div class="d-flex align-items-center">
                    <span>Cliente</span>
                    <button class="btn btn-sm text-primary border-0 p-0 ms-1" @click="toggleSort('name')">
                      <i class="fas" :class="getSortIcon('name')"></i>
                    </button>
                  </div>
                </th>
                <th class="px-4 py-3">Email</th>
                <th class="px-4 py-3">
                  <div class="d-flex align-items-center">
                    <span>Productos</span>
                    <button class="btn btn-sm text-primary border-0 p-0 ms-1" @click="toggleSort('products')">
                      <i class="fas" :class="getSortIcon('products')"></i>
                    </button>
                  </div>
                </th>
                <th class="px-4 py-3">
                  <div class="d-flex align-items-center">
                    <span>Monto</span>
                    <button class="btn btn-sm text-primary border-0 p-0 ms-1" @click="toggleSort('amount')">
                      <i class="fas" :class="getSortIcon('amount')"></i>
                    </button>
                  </div>
                </th>
                <th class="px-4 py-3">
                  <div class="d-flex align-items-center">
                    <span>Fecha</span>
                    <button class="btn btn-sm text-primary border-0 p-0 ms-1" @click="toggleSort('date')">
                      <i class="fas" :class="getSortIcon('date')"></i>
                    </button>
                  </div>
                </th>
                <th class="px-4 py-3">Estado</th>
                <th class="px-4 py-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in datos" :key="item.id">
                <td class="px-4 py-3 fw-bold">#{{ item.id }}</td>
                <td class="px-4 py-3">
                  <div class="d-flex align-items-center">
                    <div class="avatar-circle me-2" :style="{ backgroundColor: getAvatarColor(item.user?.nombre) }">
                      {{ getInitials(item.user?.nombre, item.user?.apellido) }}
                    </div>
                    <div class="text-start">
                      <div class="fw-medium">{{ item.user?.nombre }} {{ item.user?.apellido }}</div>
                      <small class="text-muted">{{ item.user?.telefono }}</small>
                    </div>
                  </div>
                </td>
                <td class="px-4 py-3">{{ item.user?.email }}</td>
                <td class="px-4 py-3 text-center">
                  <span class="badge bg-info rounded-pill">{{ item.productos?.length || 0 }}</span>
                </td>
                <td class="px-4 py-3">
                  <span class="fw-medium">{{ formatCurrency(item.total_amount) }}</span>
                </td>
                <td class="px-4 py-3">
                  <div>{{ formatDate(item.created_at) }}</div>
                  <small class="text-muted">{{ getTimeAgo(item.created_at) }}</small>
                </td>
                <td class="px-4 py-3">
                  <span class="badge rounded-pill" :class="item.estado == false ? 'bg-warning' : 'bg-success'">
                    {{ item.estado == false ? 'Pendiente' : 'Completado' }}
                  </span>
                </td>
                <td class="px-4 py-3 text-center">
                  <div class="btn-group shadow-sm">
                    <button class="btn btn-sm btn-light" @click="showOrder(item.id)" title="Ver detalles">
                      <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-light" @click="completeOrderPending(item.id)"
                      :disabled="item.estado === true" title="Marcar como completado">
                      <i class="fas fa-check" :class="{'text-success': item.estado !== true}"></i>
                    </button>
                    <button class="btn btn-sm btn-light" @click="fetchOrdersPDFId(item.id)"
                      title="Generar PDF">
                      <i class="fas fa-file-pdf text-danger"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Cards view con diseño mejorado -->
        <div v-if="datos.length > 0 && (viewMode === 'cards' || windowWidth < 768)">
          <div class="row g-4 p-4">
            <div class="col-md-6 col-lg-4" v-for="item in datos" :key="item.id">
              <div class="card h-100 border-0 shadow-sm hover-card rounded-3">
                <div class="card-header bg-white d-flex justify-content-between align-items-center p-3 border-0">
                  <div class="d-flex align-items-center">
                    <div class="avatar-circle me-2" :style="{ backgroundColor: getAvatarColor(item.user?.nombre) }">
                      {{ getInitials(item.user?.nombre, item.user?.apellido) }}
                    </div>
                    <h5 class="card-title mb-0 fw-bold">Pedido #{{ item.id }}</h5>
                  </div>
                  <span class="badge rounded-pill" :class="item.estado == false ? 'bg-warning' : 'bg-success'">
                    {{ item.estado == false ? 'Pendiente' : 'Completado' }}
                  </span>
                </div>
                <div class="card-body p-3">
                  <ul class="list-group list-group-flush mb-3">
                    <li class="list-group-item d-flex justify-content-between px-0 py-2">
                      <span class="text-muted"><i class="fas fa-user me-2"></i>Cliente:</span>
                      <span class="fw-medium">{{ item.user?.nombre }} {{ item.user?.apellido }}</span>
                    </li>
                    <li class="list-group-item d-flex justify-content-between px-0 py-2">
                      <span class="text-muted"><i class="fas fa-envelope me-2"></i>Email:</span>
                      <span class="text-truncate ms-2" style="max-width: 180px;">{{ item.user?.email }}</span>
                    </li>
                    <li class="list-group-item d-flex justify-content-between px-0 py-2">
                      <span class="text-muted"><i class="fas fa-box me-2"></i>Productos:</span>
                      <span class="badge bg-info rounded-pill">{{ item.productos?.length || 0 }}</span>
                    </li>
                    <li class="list-group-item d-flex justify-content-between px-0 py-2">
                      <span class="text-muted"><i class="fas fa-money-bill-wave me-2"></i>Monto:</span>
                      <span class="fw-bold">{{ formatCurrency(item.total_amount) }}</span>
                    </li>
                    <li class="list-group-item d-flex justify-content-between px-0 py-2">
                      <span class="text-muted"><i class="fas fa-calendar-alt me-2"></i>Fecha:</span>
                      <span>{{ formatDate(item.created_at) }}</span>
                    </li>
                    <li class="list-group-item d-flex justify-content-between px-0 py-2" v-if="item.payment_method">
                      <span class="text-muted"><i class="fas fa-credit-card me-2"></i>Pago:</span>
                      <span class="badge rounded-pill" :class="item.payment_method === 'in-person' ? 'bg-warning' : 'bg-info'">
                        {{ item.payment_method === 'in-person' ? 'En persona' : 'Pago por QR' }}
                      </span>
                    </li>
                  </ul>
                </div>
                <div class="card-footer bg-white p-3 border-top-0">
                  <div class="d-flex justify-content-between">
                    <button class="btn btn-sm btn-primary" @click="showOrder(item.id)">
                      <i class="fas fa-eye me-1"></i>Detalles
                    </button>
                    <button class="btn btn-sm btn-success" @click="completeOrderPending(item.id)"
                      :disabled="item.estado === true">
                      <i class="fas fa-check me-1"></i>Completar
                    </button>
                    <button class="btn btn-sm btn-danger" @click="fetchOrdersPDFId(item.id)">
                      <i class="fas fa-file-pdf me-1"></i>PDF
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Paginación con diseño mejorado -->
        <div class="d-flex justify-content-center py-4" v-if="pagination.last_page > 1">
          <nav aria-label="Navegación de pedidos">
            <ul class="pagination shadow-sm">
              <li class="page-item" :class="{ disabled: pagination.current_page === 1 }">
                <a class="page-link" href="#" @click.prevent="changePage(1)" aria-label="Primera página">
                  <i class="fas fa-angle-double-left"></i>
                </a>
              </li>
              <li class="page-item" :class="{ disabled: pagination.current_page === 1 }">
                <a class="page-link" href="#" @click.prevent="changePage(pagination.current_page - 1)" aria-label="Página anterior">
                  <i class="fas fa-angle-left"></i>
                </a>
              </li>

              <li class="page-item" v-for="page in paginationRange" :key="page"
                :class="{ active: pagination.current_page === page }">
                <a class="page-link" href="#" @click.prevent="changePage(page)">{{ page }}</a>
              </li>

              <li class="page-item" :class="{ disabled: pagination.current_page === pagination.last_page }">
                <a class="page-link" href="#" @click.prevent="changePage(pagination.current_page + 1)" aria-label="Página siguiente">
                  <i class="fas fa-angle-right"></i>
                </a>
              </li>
              <li class="page-item" :class="{ disabled: pagination.current_page === pagination.last_page }">
                <a class="page-link" href="#" @click.prevent="changePage(pagination.last_page)" aria-label="Última página">
                  <i class="fas fa-angle-double-right"></i>
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>

    <!-- Modal de detalles del pedido con diseño mejorado -->
    <div class="modal fade" id="orderDetailModal" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1"
      aria-labelledby="orderDetailModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content border-0 shadow">
          <!-- Encabezado del Modal mejorado -->
          <div class="modal-header bg-white">
            <h5 class="modal-title" id="orderDetailModalLabel">
              <span class="badge bg-primary bg-opacity-10 text-primary p-2 me-2 rounded-circle">
                <i class="fas fa-info-circle"></i>
              </span>
              Detalle del Pedido #{{ detailOrder.id }}
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>

          <!-- Cuerpo del Modal -->
          <div class="modal-body">
            <!-- Barra de estado del pedido mejorada -->
            <div class="order-status-bar mb-4">
              <div class="progress" style="height: 5px;">
                <div class="progress-bar bg-success" role="progressbar"
                  :style="{ width: detailOrder.estado ? '100%' : '50%' }" aria-valuenow="50" aria-valuemin="0"
                  aria-valuemax="100"></div>
              </div>
              <div class="d-flex justify-content-between mt-2">
                <div class="text-center">
                  <div class="status-circle active">
                    <i class="fas fa-shopping-cart"></i>
                  </div>
                  <div class="small mt-1">Pedido realizado</div>
                  <div class="small text-muted">{{ formatDate(detailOrder.created_at) }}</div>
                </div>
                <div class="text-center">
                  <div class="status-circle" :class="{ active: detailOrder.estado }">
                    <i class="fas fa-check"></i>
                  </div>
                  <div class="small mt-1">Pedido completado</div>
                  <div class="small text-muted" v-if="detailOrder.estado">{{ formatDate(detailOrder.updated_at) }}</div>
                  <div class="small text-muted" v-else>Pendiente</div>
                </div>
              </div>
            </div>

            <div class="row g-4">
              <!-- Columna 1: Datos del Usuario mejorada -->
              <div class="col-12 col-md-4">
                <div class="card h-100 border-0 shadow-sm rounded-3">
                  <div class="card-header bg-white border-0">
                    <span class="card-title h5 d-flex align-items-center">
                      <span class="badge bg-primary bg-opacity-10 text-primary p-2 me-2 rounded-circle">
                        <i class="fas fa-user"></i>
                      </span>
                      Datos del Cliente
                    </span>
                  </div>
                  <div class="card-body">
                    <div class="text-center mb-3">
                      <div class="avatar-circle-lg mx-auto mb-2"
                        :style="{ backgroundColor: getAvatarColor(detailOrder.user?.nombre) }">
                        {{ getInitials(detailOrder.user?.nombre, detailOrder.user?.apellido) }}
                      </div>
                      <h5 class="mb-0">{{ detailOrder.user?.nombre }} {{ detailOrder.user?.apellido }}</h5>
                      <p class="text-muted mb-0">{{ detailOrder.user?.email }}</p>
                    </div>
                    <ul class="list-group list-group-flush">
                      <li class="list-group-item d-flex justify-content-between px-0 py-2">
                        <span class="text-muted"><i class="fas fa-phone me-2"></i>Teléfono:</span>
                        <span class="fw-medium">{{ detailOrder.user?.telefono }}</span>
                      </li>
                      <li class="list-group-item d-flex justify-content-between px-0 py-2">
                        <span class="text-muted"><i class="fas fa-id-card me-2"></i>CI:</span>
                        <span class="fw-medium">{{ detailOrder.user?.ci }}</span>
                      </li>
                      <li class="list-group-item d-flex justify-content-between px-0 py-2">
                        <span class="text-muted"><i class="fas fa-globe me-2"></i>País:</span>
                        <span class="fw-medium">{{ detailOrder.user?.pais || 'Bolivia' }}</span>
                      </li>
                      <li class="list-group-item d-flex justify-content-between px-0 py-2">
                        <span class="text-muted"><i class="fas fa-map me-2"></i>Departamento:</span>
                        <span class="fw-medium text-capitalize">{{ detailOrder.user?.departamento || 'No especificado'
                        }}</span>
                      </li>
                      <li class="list-group-item px-0 py-2">
                        <span class="text-muted"><i class="fas fa-map-marker-alt me-2"></i>Dirección:</span>
                        <p class="mb-0 mt-1">{{ detailOrder.user?.direccion }}</p>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <!-- Columna 2: Productos del Pedido mejorada -->
              <div class="col-12 col-md-4">
                <div class="card h-100 border-0 shadow-sm rounded-3">
                  <div class="card-header bg-white border-0">
                    <span class="card-title h5 d-flex align-items-center">
                      <span class="badge bg-primary bg-opacity-10 text-primary p-2 me-2 rounded-circle">
                        <i class="fas fa-box"></i>
                      </span>
                      Productos del Pedido
                    </span>
                  </div>
                  <div class="card-body p-0">
                    <div class="table-responsive">
                      <table class="table table-hover mb-0">
                        <thead class="table-light">
                          <tr>
                            <th>Producto</th>
                            <th class="text-center">Cant.</th>
                            <th class="text-end">Precio</th>
                            <th class="text-end">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-for="(producto, index) in detailOrder.productos" :key="index">
                            <td>
                              <div class="d-flex align-items-center">
                                <div>
                                  <div class="fw-medium">{{ producto.nombre }}</div>
                                  <div v-if="producto.pivot?.modelo_id" class="small text-muted">
                                    Modelo: {{ getModelName(producto.pivot.modelo_id, producto) }}
                                  </div>
                                  <div v-if="producto.pivot?.color" class="small text-muted">
                                    Color: {{ producto.pivot.color }}
                                  </div>
                                  <div class="badge rounded-pill" :class="producto.pivot?.es_preventa ? 'bg-warning' : 'bg-info'">
                                    {{ producto.pivot?.es_preventa ? 'Estandar' : 'Especial' }}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td class="text-center">{{ producto.pivot?.cantidad }}</td>
                            <td class="text-end">
                              {{ formatCurrency(producto.pivot?.es_preventa ? producto.pivot?.precio_preventa :
                                producto.pivot?.precio) }}
                            </td>
                            <td class="text-end fw-medium">
                              {{ formatCurrency((producto.pivot?.es_preventa ? producto.pivot?.precio_preventa :
                                producto.pivot?.precio) * producto.pivot?.cantidad) }}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Columna 3: Resumen Financiero Mejorado -->
              <div class="col-12 col-md-4">
                <div class="card h-100 border-0 shadow-sm rounded-3">
                  <div class="card-header bg-white border-0">
                    <span class="card-title h5 d-flex align-items-center">
                      <span class="badge bg-primary bg-opacity-10 text-primary p-2 me-2 rounded-circle">
                        <i class="fas fa-money-bill-wave"></i>
                      </span>
                      Resumen Financiero
                    </span>
                  </div>
                  <div class="card-body">
                    <!-- Alerta de estado de pago mejorada -->
                    <div class="alert rounded-3 border-0 shadow-sm" 
                      :class="detailOrder.pending > 0 ? 'alert-warning bg-warning bg-opacity-10' : 'alert-success bg-success bg-opacity-10'"
                      role="alert">
                      <div class="d-flex">
                        <div class="me-3">
                          <i
                            :class="detailOrder.pending > 0 ? 'fas fa-exclamation-triangle fa-2x text-warning' : 'fas fa-check-circle fa-2x text-success'"></i>
                        </div>
                        <div>
                          <h5 class="alert-heading">{{ detailOrder.pending > 0 ? 'Pago pendiente' : 'Pago completado' }}
                          </h5>
                          <p class="mb-0">{{ detailOrder.pending > 0 ? 'Este pedido tiene un saldo pendiente de pago.' :
                            'Este pedido ha sido pagado completamente.' }}</p>
                        </div>
                      </div>
                    </div>

                    <!-- Resumen financiero mejorado -->
                    <ul class="list-group list-group-flush">
                      <!-- Subtotal (antes de descuentos) -->
                      <li class="list-group-item d-flex justify-content-between px-0 py-2">
                        <span class="text-muted">Subtotal:</span>
                        <span class="fw-medium">{{ formatCurrency(detailOrder.total_amount) }}</span>
                      </li>

                      <!-- Información del cupón mejorada -->
                      <li class="list-group-item px-0 py-2" v-if="detailOrder.cupon">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                          <span class="text-muted">Cupón Aplicado:</span>
                          <div class="text-end">
                            <div class="d-flex align-items-center">
                              <span class="badge bg-info rounded-pill me-2">{{ detailOrder.cupon.codigo }}</span>
                              <span class="badge rounded-pill"
                                :class="detailOrder.cupon.tipo === 'porcentaje' ? 'bg-primary' : 'bg-success'">
                                {{ detailOrder.cupon.tipo === 'porcentaje' ?
                                  detailOrder.cupon.descuento + '%' :
                                  'Bs. ' + detailOrder.cupon.descuento }}
                              </span>
                            </div>
                          </div>
                        </div>

                        <!-- Detalles del descuento -->
                        <div class="discount-details p-3 mb-2 rounded-3 shadow-sm"
                          :class="detailOrder.cupon.tipo === 'porcentaje' ? 'bg-primary bg-opacity-10' : 'bg-success bg-opacity-10'">
                          <div class="d-flex justify-content-between mb-1">
                            <span class="text-muted">Tipo:</span>
                            <span class="fw-medium">{{ detailOrder.cupon.tipo === 'porcentaje' ? 'Porcentaje' : 'Monto Fijo' }}</span>
                          </div>
                          <div class="d-flex justify-content-between mb-1">
                            <span class="text-muted">Valor:</span>
                            <span class="fw-medium">{{ detailOrder.cupon.tipo === 'porcentaje' ?
                              detailOrder.cupon.descuento + '%' :
                              formatCurrency(detailOrder.cupon.descuento) }}</span>
                          </div>
                          <div class="d-flex justify-content-between">
                            <span class="text-muted">Descuento aplicado:</span>
                            <span class="fw-medium text-danger">-{{ formatCurrency(calcularMontoDescuento()) }}</span>
                          </div>
                        </div>
                      </li>

                      <!-- Total después del descuento -->
                      <li class="list-group-item d-flex justify-content-between px-0 py-2 fw-bold">
                        <span class="text-muted">Total con descuento:</span>
                        <span class="text-primary">{{ formatCurrency(detailOrder.total_amount -
                          calcularMontoDescuento()) }}</span>
                      </li>

                      <!-- Desglose de pagos -->
                      <li class="list-group-item d-flex justify-content-between px-0 py-2">
                        <span class="text-muted">Monto Pagado:</span>
                        <span class="fw-medium text-success">{{ formatCurrency(detailOrder.total_to_pay) }}</span>
                      </li>
                      <li class="list-group-item d-flex justify-content-between px-0 py-2">
                        <span class="text-muted">Saldo Pendiente:</span>
                        <span class="fw-medium text-danger">{{ formatCurrency(detailOrder.pending) }}</span>
                      </li>

                      <!-- Método de pago y estado -->
                      <li class="list-group-item d-flex justify-content-between px-0 py-2">
                        <span class="text-muted">Método de Pago:</span>
                        <span class="badge rounded-pill"
                          :class="detailOrder.payment_method === 'in-person' ? 'bg-warning' : 'bg-info'">
                          {{ detailOrder.payment_method === 'in-person' ? 'En persona' : 'Pago por QR' }}
                        </span>
                      </li>
                      <li class="list-group-item d-flex justify-content-between px-0 py-2">
                        <span class="text-muted">Estado:</span>
                        <span class="badge rounded-pill" :class="detailOrder.estado == false ? 'bg-warning' : 'bg-success'">
                          {{ detailOrder.estado == false ? 'Pendiente' : 'Completado' }}
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <!-- Sección de Comprobante/Voucher mejorada -->
              <div class="col-12" v-if="detailOrder.payment_method === 'qr' && detailOrder.voucher">
                <div class="card border-0 shadow-sm rounded-3">
                  <div class="card-header bg-white border-0">
                    <span class="card-title h5 d-flex align-items-center">
                      <span class="badge bg-primary bg-opacity-10 text-primary p-2 me-2 rounded-circle">
                        <i class="fas fa-receipt"></i>
                      </span>
                      Comprobante de Pago
                    </span>
                  </div>
                  <div class="card-body">
                    <div class="row align-items-center">
                      <div class="col-md-8">
                        <div class="alert alert-info bg-info bg-opacity-10 border-0 rounded-3 shadow-sm mb-3">
                          <i class="fas fa-info-circle me-2"></i>
                          El cliente ha proporcionado un comprobante de pago. Haga clic en la imagen para verla en
                          tamaño completo.
                        </div>
                        <p class="mb-0">
                          <strong>Fecha de carga:</strong> {{ formatDate(detailOrder.updated_at) }}<br>
                          <strong>Método de pago:</strong> Pago por QR
                        </p>
                      </div>
                      <div class="col-md-4 text-center">
                        <div class="voucher-container shadow-sm">
                          <img :src="getVoucherUrl(detailOrder.voucher)" alt="Comprobante de pago"
                            class="img-fluid voucher-image" @click="openVoucherModal(detailOrder.voucher)">
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Pie del Modal mejorado -->
          <div class="modal-footer border-0">
            <div class="d-flex justify-content-between w-100">
              <div>
                <button type="button" class="btn btn-danger shadow-sm" @click="fetchOrdersPDFId(detailOrder.id)"
                  v-if="detailOrder.id">
                  <i class="fas fa-file-pdf me-2"></i>Generar PDF
                </button>
              </div>
              <div>
                <button type="button" class="btn btn-light shadow-sm me-2" data-bs-dismiss="modal">
                  <i class="fas fa-times me-2"></i>Cerrar
                </button>
                <button type="button" class="btn btn-success shadow-sm" @click="completeOrderPending(detailOrder.id)"
                  :disabled="detailOrder.estado === true" v-if="detailOrder.id">
                  <i class="fas fa-check me-2"></i>Completar Pedido
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal para ver el voucher en tamaño completo mejorado -->
    <div class="modal fade" id="voucherModal" tabindex="-1" aria-labelledby="voucherModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content border-0 shadow">
          <div class="modal-header bg-white">
            <h5 class="modal-title" id="voucherModalLabel">
              <span class="badge bg-primary bg-opacity-10 text-primary p-2 me-2 rounded-circle">
                <i class="fas fa-receipt"></i>
              </span>
              Comprobante de Pago
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body text-center p-0 bg-light">
            <img :src="currentVoucherUrl" alt="Comprobante de pago" class="img-fluid">
          </div>
          <div class="modal-footer border-0">
            <button type="button" class="btn btn-primary shadow-sm" @click="downloadVoucher">
              <i class="fas fa-download me-2"></i>Descargar
            </button>
            <button type="button" class="btn btn-light shadow-sm" data-bs-dismiss="modal">Cerrar</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast de notificación mejorado -->
    <div class="position-fixed bottom-0 end-0 p-3" style="z-index: 11">
      <div id="liveToast" class="toast hide border-0 shadow-lg" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="toast-header" :class="toastType === 'success' ? 'bg-success text-white' : 'bg-danger text-white'">
          <i class="fas" :class="toastType === 'success' ? 'fa-check-circle me-2' : 'fa-exclamation-circle me-2'"></i>
          <strong class="me-auto">{{ toastTitle }}</strong>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
        <div class="toast-body">
          {{ toastMessage }}
        </div>
      </div>
    </div>
  </div>
</template>


<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { Modal, Toast } from 'bootstrap/dist/js/bootstrap.bundle.min';
import { format, formatDistance } from 'date-fns';
import { es } from 'date-fns/locale';
import { completeOrder, excelPedidosCatalogo, generaPDFPedidoID, generateExcel, indexPedidos, modelsAll, pdfPedidosCatalogo, pdfPedidosCompletados, pdfPedidosPendientes, pdfPedidosEnProcesoPorCatalogo, pdfPedidosCompletadosPorCatalogo, showPedido } from '@/Services/PedidoService';
import Swal from 'sweetalert2';
import { indexCatalogosactives } from '@/Services/CatalogoService';

// Estado
const datos = ref([]);
const searchText = ref('');
const detailOrder = ref({});
const models = ref([]);
const currentVoucherUrl = ref('');
const viewMode = ref('table');
const windowWidth = ref(window.innerWidth);
const statusFilter = ref('all');
const catalogoFilter = ref(''); // Nuevo filtro para catálogos
const sortBy = ref('date_desc');
const sortField = ref('created_at');
const sortDirection = ref('desc');
const toastType = ref('success');
const toastTitle = ref('');
const toastMessage = ref('');
const currentPage = ref(1);
const showExportDropdown = ref(false);
const pagination = ref({
  current_page: 1,
  last_page: 1,
  per_page: 10,
  total: 0,
  from: 0,
  to: 0
});
const catalogos = ref([]);
let orderDetailModal = null;
let voucherModal = null;
let liveToast = null;

// Actualizar el ancho de la ventana cuando cambia el tamaño
const actualizarAnchoPantalla = () => {
  windowWidth.value = window.innerWidth;
};

// Función para controlar el dropdown de exportación
const toggleExportDropdown = () => {
  showExportDropdown.value = !showExportDropdown.value;
};

// Cerrar el dropdown cuando se hace clic fuera de él
const closeDropdownOnClickOutside = (event) => {
  if (showExportDropdown.value && !event.target.closest('.dropdown')) {
    showExportDropdown.value = false;
  }
};

// Computed para el rango de paginación
const paginationRange = computed(() => {
  const range = [];
  const maxVisiblePages = 5;
  const startPage = Math.max(1, pagination.value.current_page - Math.floor(maxVisiblePages / 2));
  const endPage = Math.min(pagination.value.last_page, startPage + maxVisiblePages - 1);

  for (let i = startPage; i <= endPage; i++) {
    range.push(i);
  }

  return range;
});

// Lifecycle hooks
onMounted(() => {
  orderDetailModal = new Modal(document.getElementById('orderDetailModal'));
  voucherModal = new Modal(document.getElementById('voucherModal'));
  liveToast = new Toast(document.getElementById('liveToast'));

  // Agregar event listener para cerrar el dropdown al hacer clic fuera
  document.addEventListener('click', closeDropdownOnClickOutside);

  listOrders();
  loadModels();
  catalogosActivos();
  // Agregar event listener para el cambio de tamaño de ventana
  window.addEventListener('resize', actualizarAnchoPantalla);

  // Configurar ordenamiento inicial basado en sortBy
  updateSortFieldAndDirection();
});

onUnmounted(() => {
  // Eliminar event listeners cuando el componente se desmonta
  window.removeEventListener('resize', actualizarAnchoPantalla);
  document.removeEventListener('click', closeDropdownOnClickOutside);
});

// Watch para actualizar el ordenamiento cuando cambia sortBy
const updateSortFieldAndDirection = () => {
  switch (sortBy.value) {
    case 'date_desc':
      sortField.value = 'created_at';
      sortDirection.value = 'desc';
      break;
    case 'date_asc':
      sortField.value = 'created_at';
      sortDirection.value = 'asc';
      break;
    case 'amount_desc':
      sortField.value = 'amount';
      sortDirection.value = 'desc';
      break;
    case 'amount_asc':
      sortField.value = 'amount';
      sortDirection.value = 'asc';
      break;
  }
};

// Métodos
const listOrders = async () => {
  try {
    // Mostrar indicador de carga
    Swal.fire({
      title: 'Cargando pedidos...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
    
    // Construir la URL con los parámetros de filtro
    let url = `${searchText.value}&status=${statusFilter.value}&sort_field=${sortField.value}&sort_direction=${sortDirection.value}&page=${currentPage.value}`;
    
    // Agregar el filtro de catálogo si está seleccionado
    if (catalogoFilter.value) {
      url += `&catalogo_id=${catalogoFilter.value}`;
    }
    
    const { data } = await indexPedidos(
      searchText.value,
      statusFilter.value,
      sortField.value,
      sortDirection.value,
      currentPage.value,
      catalogoFilter.value // Pasar el ID del catálogo seleccionado
    );

    datos.value = data.datos;
    // Actualizar información de paginación
    if (data.pagination) {
      pagination.value = data.pagination;
    } else {
      console.warn('Datos de paginación no encontrados en la respuesta de la API');
    }

    // Cerrar indicador de carga
    Swal.close();
    showToast('success', 'Datos cargados', 'Los pedidos se han cargado correctamente');
  } catch (error) {
    console.error('Error al cargar pedidos:', error);
    Swal.close();
    showToast('error', 'Error', 'No se pudieron cargar los pedidos');
  }
};

const changePage = async (page) => {
  if (page < 1 || page > pagination.value.last_page) return;

  currentPage.value = page;
  await listOrders();
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return format(date, 'dd/MM/yyyy HH:mm');
};

const getTimeAgo = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return formatDistance(date, new Date(), { addSuffix: true, locale: es });
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
  try {
    // Mostrar indicador de carga
    Swal.fire({
      title: 'Cargando detalles...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
    
    const { data } = await showPedido(id);
    detailOrder.value = data;
    
    // Cerrar indicador de carga
    Swal.close();
    orderDetailModal.show();
  } catch (error) {
    console.error('Error al obtener detalles del pedido:', error);
    Swal.close();
    showToast('error', 'Error', 'No se pudieron cargar los detalles del pedido');
  }
};

const getVoucherUrl = (voucherPath) => {
  // Si la ruta ya es una URL completa, devolverla
  if (voucherPath && voucherPath.startsWith('http')) {
    return voucherPath;
  }
  // Si no, construir la URL completa
  return voucherPath ? `/vouchers/${voucherPath}` : '';
};

const openVoucherModal = (voucherPath) => {
  currentVoucherUrl.value = getVoucherUrl(voucherPath);
  voucherModal.show();
};

const downloadVoucher = () => {
  if (currentVoucherUrl.value) {
    const link = document.createElement('a');
    link.href = currentVoucherUrl.value;
    link.download = `comprobante_pedido_${detailOrder.value.id}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('success', 'Descarga iniciada', 'El comprobante se está descargando');
  }
};

const completeOrderPending = async (id) => {
  // Mostrar un cuadro de confirmación
  const result = await Swal.fire({
    title: 'Confirmar acción',
    text: 'Una vez completado, no podrás revertir este cambio. ¿Estás seguro de que deseas continuar?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, completar pedido',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#28a745',
    cancelButtonColor: '#6c757d',
    reverseButtons: true
  });

  // Si el usuario confirma, proceder a completar el pedido
  if (result.isConfirmed) {
    try {
      // Mostrar indicador de carga
      Swal.fire({
        title: 'Procesando...',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });
      
      await completeOrder(id);
      
      // Cerrar indicador de carga
      Swal.close();
      
      // Actualizar la lista de pedidos
      listOrders();

      // Si el pedido actual está abierto en el modal, actualizar su estado también
      if (detailOrder.value.id === id) {
        detailOrder.value.estado = true;
      }

      showToast('success', 'Pedido completado', 'El pedido ha sido marcado como completado');
    } catch (error) {
      console.error('Error al completar pedido:', error);
      Swal.close();
      showToast('error', 'Error', 'No se pudo completar el pedido');
    }
  } else {
    // Si el usuario cancela, puedes mostrar un mensaje opcional
    showToast('info', 'Acción cancelada', 'El pedido no ha sido completado');
  }
};

const fetchOrders = async () => {
  try {
    showExportDropdown.value = false; // Cerrar el dropdown después de hacer clic
    
    // Mostrar indicador de carga
    Swal.fire({
      title: 'Generando Excel...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
    
    const response = await generateExcel();
    
    // Cerrar indicador de carga
    Swal.close();
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'pedidos.xlsx');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    showToast('success', 'Excel generado', 'El archivo Excel se ha descargado correctamente');
  } catch (error) {
    console.error('Error al generar Excel:', error);
    Swal.close();
    showToast('error', 'Error', 'No se pudo generar el archivo Excel');
  }
};

// Función simplificada para descargar Excel por catálogo
const descargarExcelPedidosPorCatalogo = async () => {
  try {
    showExportDropdown.value = false; // Cerrar el dropdown después de hacer clic
    
    // Mostrar modal de selección de catálogo
    Swal.fire({
      title: 'Exportar Excel por Catálogo',
      html: `
        <div class="form-group">
          <label for="catalogo-select" class="form-label">Seleccione un catálogo:</label>
          <select id="catalogo-select" class="form-select">
            <option value="">Seleccione un catálogo</option>
            ${catalogos.value.map(cat => `<option value="${cat.id}">${cat.nombre}</option>`).join('')}
          </select>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Exportar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#0d6efd',
      cancelButtonColor: '#6c757d',
      preConfirm: () => {
        const catalogoId = document.getElementById('catalogo-select').value;
        if (!catalogoId) {
          Swal.showValidationMessage('Por favor seleccione un catálogo');
          return false;
        }
        return catalogoId;
      }
    }).then(async (result) => {
      if (result.isConfirmed && result.value) {
        const catalogoId = result.value;
        
        // Mostrar indicador de carga
        Swal.fire({
          title: 'Generando Excel...',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });
        
        const response = await excelPedidosCatalogo(catalogoId);
        
        // Cerrar indicador de carga
        Swal.close();
        
        // Crear un blob y descargar directamente
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `pedidos_catalogo_${catalogoId}.xlsx`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        showToast('success', 'Excel generado', 'El archivo Excel se ha descargado correctamente');
      }
    });
  } catch (error) {
    console.error('Error al descargar el Excel de pedidos por catálogo:', error);
    Swal.close();
    showToast('error', 'Error', 'No se pudo generar el Excel de pedidos por catálogo');
  }
};

const fetchOrdersPDFId = async (id) => {
  try {
    // Mostrar indicador de carga
    Swal.fire({
      title: 'Generando PDF...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
    
    const response = await generaPDFPedidoID(id);
    
    // Cerrar indicador de carga
    Swal.close();
    
    handlePdfResponse(response, `pedido_${id}.pdf`);
  } catch (error) {
    console.error('Error al obtener el PDF:', error);
    Swal.close();
    showToast('error', 'Error', 'No se pudo generar el PDF del pedido');
  }
};

const descargarPdfPedidosCompletado = async () => {
  try {
    showExportDropdown.value = false; // Cerrar el dropdown después de hacer clic
    
    // Mostrar indicador de carga
    Swal.fire({
      title: 'Generando PDF...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
    
    const response = await pdfPedidosCompletados();
    
    // Cerrar indicador de carga
    Swal.close();
    
    handlePdfResponse(response, 'pedidos_completados.pdf');
  } catch (error) {
    console.error('Error al descargar el PDF de pedidos completados:', error);
    Swal.close();
    showToast('error', 'Error', 'No se pudo generar el PDF de pedidos completados');
  }
};

const descargarPdfPedidosEnProceso = async () => {
  try {
    showExportDropdown.value = false; // Cerrar el dropdown después de hacer clic
    
    // Mostrar indicador de carga
    Swal.fire({
      title: 'Generando PDF...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
    
    const response = await pdfPedidosPendientes();
    
    // Cerrar indicador de carga
    Swal.close();
    
    handlePdfResponse(response, 'pedidos_en_proceso.pdf');
  } catch (error) {
    console.error('Error al descargar el PDF de pedidos en proceso:', error);
    Swal.close();
    showToast('error', 'Error', 'No se pudo generar el PDF de pedidos en proceso');
  }
};

const descargarPdfPedidosPorCatalogo = async () => {
  try {
    showExportDropdown.value = false; // Cerrar el dropdown después de hacer clic
    
    // Mostrar modal de selección de catálogo mejorado
    Swal.fire({
      title: 'Exportar PDF por Catálogo',
      html: `
        <div class="form-group">
          <label for="catalogo-select" class="form-label">Seleccione un catálogo:</label>
          <select id="catalogo-select" class="form-select">
            <option value="">Seleccione un catálogo</option>
            ${catalogos.value.map(cat => `<option value="${cat.id}">${cat.nombre}</option>`).join('')}
          </select>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Exportar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#0d6efd',
      cancelButtonColor: '#6c757d',
      preConfirm: () => {
        const catalogoId = document.getElementById('catalogo-select').value;
        if (!catalogoId) {
          Swal.showValidationMessage('Por favor seleccione un catálogo');
          return false;
        }
        return catalogoId;
      }
    }).then(async (result) => {
      if (result.isConfirmed && result.value) {
        const catalogoId = result.value;
        
        // Mostrar indicador de carga
        Swal.fire({
          title: 'Generando PDF...',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });
        
        const response = await pdfPedidosCatalogo(catalogoId);
        
        // Cerrar indicador de carga
        Swal.close();
        
        handlePdfResponse(response, `pedidos_catalogo_${catalogoId}.pdf`);
        showToast('success', 'PDF generado', 'El archivo PDF se ha descargado correctamente');
      }
    });
  } catch (error) {
    console.error('Error al descargar el PDF de pedidos por catálogo:', error);
    Swal.close();
    showToast('error', 'Error', 'No se pudo generar el PDF de pedidos por catálogo');
  }
};

const descargarPdfPedidosEnProcesoPorCatalogo = async () => {
  try {
    showExportDropdown.value = false; // Cerrar el dropdown después de hacer clic
    
    // Mostrar modal de selección de catálogo mejorado
    Swal.fire({
      title: 'Exportar PDF de Pedidos En Proceso por Catálogo',
      html: `
        <div class="form-group">
          <label for="catalogo-select" class="form-label">Seleccione un catálogo:</label>
          <select id="catalogo-select" class="form-select">
            <option value="">Seleccione un catálogo</option>
            ${catalogos.value.map(cat => `<option value="${cat.id}">${cat.nombre}</option>`).join('')}
          </select>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Exportar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#0d6efd',
      cancelButtonColor: '#6c757d',
      preConfirm: () => {
        const catalogoId = document.getElementById('catalogo-select').value;
        if (!catalogoId) {
          Swal.showValidationMessage('Por favor seleccione un catálogo');
          return false;
        }
        return catalogoId;
      }
    }).then(async (result) => {
      if (result.isConfirmed && result.value) {
        const catalogoId = result.value;
        
        // Mostrar indicador de carga
        Swal.fire({
          title: 'Generando PDF...',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });
        
        const response = await pdfPedidosEnProcesoPorCatalogo(catalogoId);
        
        // Cerrar indicador de carga
        Swal.close();
        
        handlePdfResponse(response, `pedidos_en_proceso_catalogo_${catalogoId}.pdf`);
        showToast('success', 'PDF generado', 'El archivo PDF de pedidos en proceso por catálogo se ha descargado correctamente');
      }
    });
  } catch (error) {
    console.error('Error al descargar el PDF de pedidos en proceso por catálogo:', error);
    Swal.close();
    showToast('error', 'Error', 'No se pudo generar el PDF de pedidos en proceso por catálogo');
  }
};

const descargarPdfPedidosCompletadosPorCatalogo = async () => {
  try {
    showExportDropdown.value = false; // Cerrar el dropdown después de hacer clic
    
    // Mostrar modal de selección de catálogo mejorado
    Swal.fire({
      title: 'Exportar PDF de Pedidos Completados por Catálogo',
      html: `
        <div class="form-group">
          <label for="catalogo-select" class="form-label">Seleccione un catálogo:</label>
          <select id="catalogo-select" class="form-select">
            <option value="">Seleccione un catálogo</option>
            ${catalogos.value.map(cat => `<option value="${cat.id}">${cat.nombre}</option>`).join('')}
          </select>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Exportar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#0d6efd',
      cancelButtonColor: '#6c757d',
      preConfirm: () => {
        const catalogoId = document.getElementById('catalogo-select').value;
        if (!catalogoId) {
          Swal.showValidationMessage('Por favor seleccione un catálogo');
          return false;
        }
        return catalogoId;
      }
    }).then(async (result) => {
      if (result.isConfirmed && result.value) {
        const catalogoId = result.value;
        
        // Mostrar indicador de carga
        Swal.fire({
          title: 'Generando PDF...',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });
        
        const response = await pdfPedidosCompletadosPorCatalogo(catalogoId);
        
        // Cerrar indicador de carga
        Swal.close();
        
        handlePdfResponse(response, `pedidos_completados_catalogo_${catalogoId}.pdf`);
        showToast('success', 'PDF generado', 'El archivo PDF de pedidos completados por catálogo se ha descargado correctamente');
      }
    });
  } catch (error) {
    console.error('Error al descargar el PDF de pedidos completados por catálogo:', error);
    Swal.close();
    showToast('error', 'Error', 'No se pudo generar el PDF de pedidos completados por catálogo');
  }
};

const handlePdfResponse = (response, defaultFilename) => {
  // Verificar el tipo de contenido de la respuesta
  const contentType = response.headers['content-type'];

  if (contentType === 'application/pdf') {
    // Si es un PDF, manejarlo como descarga directa
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', defaultFilename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    showToast('success', 'PDF generado', 'El archivo PDF se ha descargado correctamente');
  } else if (contentType.includes('application/json')) {
    // Si es JSON, probablemente estamos recibiendo base64 o URL
    const data = response.data;

    if (data.success) {
      if (data.data.base64) {
        // Manejar datos PDF en base64
        const byteCharacters = atob(data.data.base64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', data.data.filename || defaultFilename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        showToast('success', 'PDF generado', 'El archivo PDF se ha descargado correctamente');
      } else if (data.data.url) {
        // Manejar respuesta de URL
        window.open(data.data.url, '_blank');
        showToast('success', 'PDF generado', 'El PDF se ha abierto en una nueva pestaña');
      } else {
        console.error('Formato de respuesta inesperado');
        showToast('error', 'Error', 'Formato de respuesta inesperado');
      }
    } else {
      console.error('Error en la respuesta:', data.message);
      showToast('error', 'Error', data.message || 'Error al generar el PDF');
    }
  } else {
    console.error('Tipo de contenido no esperado:', contentType);
    showToast('error', 'Error', 'Tipo de contenido no esperado');
  }
};

const loadModels = async () => {
  try {
    const { data } = await modelsAll();
    models.value = data;
  } catch (error) {
    console.error('Error al cargar modelos:', error);
  }
};

const getModelName = (modeloId, producto) => {
  // Primero buscar en los modelos del producto si están disponibles
  if (producto.modelos && producto.modelos.length > 0) {
    const modeloEnProducto = producto.modelos.find(m => m.id === modeloId);
    if (modeloEnProducto) return modeloEnProducto.nombre;
  }

  // Si no se encuentra en el producto, buscar en los modelos globales
  const model = models.value.find(m => m.id === modeloId);
  return model ? model.nombre : 'Desconocido';
};

// Función para generar iniciales a partir del nombre y apellido
const getInitials = (nombre, apellido) => {
  const inicial1 = nombre ? nombre.charAt(0).toUpperCase() : '';
  const inicial2 = apellido ? apellido.charAt(0).toUpperCase() : '';
  return inicial1 + inicial2;
};

// Función para generar un color basado en el nombre
const getAvatarColor = (nombre) => {
  if (!nombre) return '#6c757d';

  // Generar un color basado en el nombre
  let hash = 0;
  for (let i = 0; i < nombre.length; i++) {
    hash = nombre.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Convertir a un color hexadecimal
  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xFF;
    color += ('00' + value.toString(16)).substr(-2);
  }

  return color;
};

// Funciones para filtros y ordenamiento
const applyFilters = () => {
  updateSortFieldAndDirection();
  currentPage.value = 1; // Resetear a la primera página al aplicar filtros
  listOrders(); // Cargar datos con los nuevos filtros
};

const clearSearch = () => {
  searchText.value = '';
  applyFilters();
};

const clearFilters = () => {
  searchText.value = '';
  statusFilter.value = 'all';
  catalogoFilter.value = ''; // Limpiar también el filtro de catálogo
  sortBy.value = 'date_desc';
  updateSortFieldAndDirection();
  currentPage.value = 1;
  listOrders();
};

const toggleSort = (field) => {
  if (sortField.value === field) {
    // Si ya estamos ordenando por este campo, cambiar la dirección
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
  } else {
    // Si es un nuevo campo, establecer como ascendente por defecto
    sortField.value = field;
    sortDirection.value = 'asc';
  }

  // Actualizar el valor de sortBy para mantener sincronizado
  if (field === 'created_at' || field === 'date') {
    sortBy.value = sortDirection.value === 'asc' ? 'date_asc' : 'date_desc';
  } else if (field === 'amount') {
    sortBy.value = sortDirection.value === 'asc' ? 'amount_asc' : 'amount_desc';
  }

  // Aplicar el nuevo ordenamiento
  listOrders();
};

const getSortIcon = (field) => {
  const mappedField = field === 'date' ? 'created_at' : field;

  if (sortField.value !== mappedField) {
    return 'fa-sort';
  }
  return sortDirection.value === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
};

// Función para mostrar notificaciones toast
const showToast = (type, title, message) => {
  toastType.value = type;
  toastTitle.value = title;
  toastMessage.value = message;
  liveToast.show();
};

// Función mejorada para calcular el monto de descuento basada en la estructura de datos proporcionada
const calcularMontoDescuento = () => {
  if (!detailOrder.value.cupon) return 0;

  const subtotal = parseFloat(detailOrder.value.total_amount);
  let discountAmount = 0;

  if (detailOrder.value.cupon.tipo === 'porcentaje') {
    // Calcular descuento porcentual
    discountAmount = (subtotal * Number.parseFloat(detailOrder.value.cupon.descuento)) / 100;
  } else {
    // Descuento de monto fijo
    discountAmount = Number.parseFloat(detailOrder.value.cupon.descuento);
  }

  // Asegurar que el descuento no exceda el monto total
  return Math.min(discountAmount, subtotal);
};

//catalogos activos
const catalogosActivos = async () => {
  try {
    const {data} = await indexCatalogosactives();
    catalogos.value = data.datos;
  } catch (error) {
    console.log(error);
  }
}
</script>

<style scoped>
/* Estilos generales */
.card {
  transition: all 0.3s ease;
  border-radius: 0.5rem;
}

.shadow-sm {
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075) !important;
}

.rounded-3 {
  border-radius: 0.5rem !important;
}

/* Estilos para tarjetas */
.hover-card {
  transition: all 0.3s ease;
}

.hover-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
}

/* Estilos para botones */
.btn {
  transition: all 0.2s ease-in-out;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.375rem;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 0.25rem 0.5rem rgba(0, 0, 0, 0.1) !important;
}

.btn-group .btn {
  border-radius: 0.375rem;
}

.btn-group > .btn:not(:last-child) {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}

.btn-group > .btn:not(:first-child) {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}

/* Estilos para badges */
.badge {
  font-weight: 500;
  padding: 0.35rem 0.65rem;
  border-radius: 50rem;
}

.badge.rounded-circle {
  width: 36px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

/* Estilos para listas */
.list-group-item {
  border-left: none;
  border-right: none;
  padding: 0.75rem 0;
  transition: background-color 0.2s ease;
}

.list-group-item:first-child {
  border-top: none;
}

.list-group-item:last-child {
  border-bottom: none;
}

.list-group-item:hover {
  background-color: rgba(0, 0, 0, 0.01);
}

/* Estilos para modales */
.modal-content {
  border-radius: 0.5rem;
  overflow: hidden;
}

.modal-header,
.modal-footer {
  padding: 1rem 1.5rem;
  border: none;
}

.modal-body {
  padding: 1.5rem;
}

/* Estilos para el voucher */
.voucher-container {
  max-width: 100%;
  margin: 0 auto;
  border-radius: 0.5rem;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.voucher-container:hover {
  transform: scale(1.02);
}

.voucher-image {
  max-height: 300px;
  object-fit: contain;
}

#voucherModal .modal-body {
  background-color: #f8f9fa;
  padding: 0;
}

#voucherModal img {
  max-height: 80vh;
}

/* Estilos para los avatares */
.avatar-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 16px;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}

.avatar-circle-lg {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 28px;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}

.fw-medium {
  font-weight: 500;
}

/* Estilos para la barra de estado del pedido */
.order-status-bar {
  position: relative;
  padding: 0 20px;
}

.status-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #f8f9fa;
  border: 2px solid #dee2e6;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6c757d;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}

.status-circle.active {
  background-color: #198754;
  border-color: #198754;
  color: white;
}

/* Estilos para paginación */
.pagination {
  margin-bottom: 0;
  border-radius: 0.375rem;
  overflow: hidden;
}

.page-item.active .page-link {
  background-color: #0d6efd;
  border-color: #0d6efd;
}

.page-link {
  color: #0d6efd;
  border: none;
  padding: 0.5rem 0.75rem;
}

.page-link:hover {
  color: #0a58ca;
  background-color: #e9ecef;
  z-index: 2;
}

/* Toast personalizado */
.toast {
  border-radius: 0.5rem;
}

.toast-header {
  padding: 0.75rem 1rem;
  border-bottom: none;
}

.toast-header .btn-close {
  filter: brightness(0) invert(1);
}

.toast-body {
  padding: 1rem;
}

/* Estilos para el dropdown personalizado */
.dropdown {
  position: relative;
  display: inline-block;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  z-index: 1000;
  display: none;
  min-width: 10rem;
  padding: 0.5rem 0;
  margin: 0.125rem 0 0;
  font-size: 1rem;
  color: #212529;
  text-align: left;
  list-style: none;
  background-color: #fff;
  background-clip: padding-box;
  border-radius: 0.5rem;
}

.dropdown-menu.show {
  display: block;
  animation: fadeIn 0.2s ease-in-out;
}

.dropdown-header {
  font-size: 0.75rem;
  letter-spacing: 0.05em;
}

.dropdown-divider {
  height: 0;
  margin: 0.5rem 0;
  overflow: hidden;
  border-top: 1px solid #e9ecef;
}

.dropdown-item {
  display: block;
  width: 100%;
  padding: 0.5rem 1rem;
  clear: both;
  font-weight: 400;
  color: #212529;
  text-align: inherit;
  white-space: nowrap;
  background-color: transparent;
  border: 0;
  border-radius: 0.25rem;
  margin: 0 0.25rem;
  width: calc(100% - 0.5rem);
  transition: all 0.2s ease;
}

.dropdown-item:hover,
.dropdown-item:focus {
  color: #16181b;
  text-decoration: none;
  background-color: #f8f9fa;
  transform: translateX(5px);
}

/* Estilos para los detalles del descuento */
.discount-details {
  border-left: 3px solid;
  border-color: inherit;
}

/* Animaciones */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Estilos responsivos */
@media (max-width: 767.98px) {
  .card-header {
    flex-direction: column;
    align-items: flex-start !important;
  }
  
  .card-header > div {
    margin-top: 1rem;
    width: 100%;
  }
  
  .btn-group {
    width: 100%;
  }
  
  .btn-group .btn {
    flex: 1;
  }
  
  .dropdown {
    width: 100%;
  }
  
  .dropdown button {
    width: 100%;
    justify-content: center;
  }
  
  .input-group {
    margin-bottom: 0.5rem;
  }
}

/* Mejoras de accesibilidad */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

/* Estilos para tablas */
.table {
  margin-bottom: 0;
}

.table th {
  font-weight: 600;
  border-top: none;
  white-space: nowrap;
}

.table td {
  vertical-align: middle;
}

.table-hover tbody tr:hover {
  background-color: rgba(0, 0, 0, 0.02);
}

/* Estilos para inputs */
.form-control, .form-select {
  border-radius: 0.375rem;
  padding: 0.5rem 0.75rem;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.form-control:focus, .form-select:focus {
  border-color: #86b7fe;
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}

.input-group-text {
  border-radius: 0.375rem;
}

.input-group > .form-control:not(:last-child),
.input-group > .input-group-text:not(:last-child) {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}

.input-group > .form-control:not(:first-child),
.input-group > .input-group-text:not(:first-child) {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}
</style>