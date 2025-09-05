<template>
  <div class="container-fluid py-2 py-md-4 px-2 px-md-3">
    <div class="card shadow-sm border-0 rounded-3">
      <!-- Header con título y acciones principales -->
      <div class="card-header bg-primary bg-opacity-10 border-0 p-3 p-md-4">
        <div class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
          <h2 class="card-title h5 h4-md m-0 d-flex align-items-center">
            <span class="badge bg-primary bg-opacity-10 text-primary p-2 me-2 rounded-circle">
              <i class="fas fa-shopping-cart"></i>
            </span>
            <span class="d-none d-sm-inline">Gestión de Pedidos</span>
            <span class="d-sm-none">Pedidos</span>
          </h2>
          <div class="d-flex flex-column flex-sm-row gap-2 w-100 w-md-auto">
            <!-- Dropdown para exportar con diseño mejorado -->
            <div class="dropdown w-100 w-sm-auto position-relative">
              <button class="btn btn-primary dropdown-toggle w-100 w-sm-auto shadow-sm" type="button" @click="toggleExportDropdown">
                <i class="fas fa-file-export me-2"></i>
                <span class="d-none d-sm-inline">Exportar</span>
                <span class="d-sm-none">Export</span>
              </button>
              <ul class="dropdown-menu dropdown-menu-end shadow border-0 py-2 rounded-3" 
                  :class="{ 'show': showExportDropdown }"
                  style="position: absolute; min-width: 320px; max-width: 90vw; z-index: 1050;">
                <li class="dropdown-header px-3 py-2 text-uppercase small fw-bold text-muted border-bottom">
                  <i class="fas fa-file-excel me-2 text-success"></i>Excel
                </li>
                <li>
                  <button class="dropdown-item d-flex align-items-center px-3 py-2 rounded-2" @click="fetchOrders">
                    <i class="fas fa-file-excel me-3 text-success flex-shrink-0"></i>
                    <div class="text-start">
                      <div class="fw-medium">Excel (Todos)</div>
                      <small class="text-muted d-block">Exportar todos los pedidos</small>
                    </div>
                  </button>
                </li>
                <li>
                  <button class="dropdown-item d-flex align-items-center px-3 py-2 rounded-2" @click="descargarExcelPedidosPorCatalogo">
                    <i class="fas fa-file-excel me-3 text-primary flex-shrink-0"></i>
                    <div class="text-start">
                      <div class="fw-medium">Excel (Por Catálogo)</div>
                      <small class="text-muted d-block">Filtrar por catálogo específico</small>
                    </div>
                  </button>
                </li>
                <li><hr class="dropdown-divider mx-3 my-2"></li>
                <li class="dropdown-header px-3 py-2 text-uppercase small fw-bold text-muted border-bottom">
                  <i class="fas fa-file-pdf me-2 text-danger"></i>PDF
                </li>
                <li>
                  <button class="dropdown-item d-flex align-items-center px-3 py-2 rounded-2" @click="descargarPdfPedidosCompletado">
                    <i class="fas fa-file-pdf me-3 text-danger flex-shrink-0"></i>
                    <div class="text-start">
                      <div class="fw-medium">PDF (Completados)</div>
                      <small class="text-muted d-block">Solo pedidos completados</small>
                    </div>
                  </button>
                </li>
                <li>
                  <button class="dropdown-item d-flex align-items-center px-3 py-2 rounded-2" @click="descargarPdfPedidosEnProceso">
                    <i class="fas fa-file-pdf me-3 text-warning flex-shrink-0"></i>
                    <div class="text-start">
                      <div class="fw-medium">PDF (En proceso)</div>
                      <small class="text-muted d-block">Solo pedidos pendientes</small>
                    </div>
                  </button>
                </li>
                <li>
                  <button class="dropdown-item d-flex align-items-center px-3 py-2 rounded-2" @click="descargarPdfPedidosPorCatalogo">
                    <i class="fas fa-file-pdf me-3 text-primary flex-shrink-0"></i>
                    <div class="text-start">
                      <div class="fw-medium">PDF (Por Catálogo)</div>
                      <small class="text-muted d-block">Filtrar por catálogo específico</small>
                    </div>
                  </button>
                </li>
                <li>
                  <button class="dropdown-item d-flex align-items-center px-3 py-2 rounded-2" @click="descargarPdfPedidosEnProcesoPorCatalogo">
                    <i class="fas fa-file-pdf me-3 text-warning flex-shrink-0"></i>
                    <div class="text-start">
                      <div class="fw-medium">PDF (En proceso por Catálogo)</div>
                      <small class="text-muted d-block">Pedidos pendientes por catálogo</small>
                    </div>
                  </button>
                </li>
                <li>
                  <button class="dropdown-item d-flex align-items-center px-3 py-2 rounded-2" @click="descargarPdfPedidosCompletadosPorCatalogo">
                    <i class="fas fa-file-pdf me-3 text-success flex-shrink-0"></i>
                    <div class="text-start">
                      <div class="fw-medium">PDF (Completados por Catálogo)</div>
                      <small class="text-muted d-block">Pedidos completados por catálogo</small>
                    </div>
                  </button>
                </li>
              </ul>
            </div>
            <button class="btn btn-outline-primary d-flex align-items-center justify-content-center w-100 w-sm-auto shadow-sm" @click="listOrders">
              <i class="fas fa-sync-alt me-2"></i>
              <span class="d-none d-sm-inline">Actualizar</span>
              <span class="d-sm-none">Sync</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Filtros y búsqueda con diseño mejorado -->
      <div class="card-body p-0">
        <div class="p-3 p-md-4 bg-light border-top border-bottom">
          <div class="row g-2 g-md-3">
            <div class="col-12 col-lg-5">
              <div class="input-group shadow-sm rounded-3 overflow-hidden">
                <span class="input-group-text bg-white border-end-0">
                  <i class="fas fa-search text-muted"></i>
                </span>
                <input type="text" class="form-control border-start-0 ps-0" 
                  placeholder="Buscar por nombre, email, número..."
                  v-model="searchText" @input="applyFilters">
                <button class="btn btn-outline-secondary border-start-0" type="button" 
                  @click="clearSearch()" v-if="searchText">
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>
            <div class="col-12 col-lg-7">
              <div class="row g-2">
                <div class="col-12 col-sm-4">
                  <div class="input-group shadow-sm rounded-3 overflow-hidden">
                    <span class="input-group-text bg-white border-end-0 d-none d-sm-flex">
                      <i class="fas fa-filter text-muted"></i>
                    </span>
                    <select class="form-select ps-2 ps-sm-0" :class="{'border-start-0': windowWidth >= 576}" v-model="statusFilter" @change="applyFilters">
                      <option value="all">Todos los estados</option>
                      <option value="pending">Pendientes</option>
                      <option value="completed">Completados</option>
                    </select>
                  </div>
                </div>
                <div class="col-12 col-sm-4">
                  <div class="input-group shadow-sm rounded-3 overflow-hidden">
                    <span class="input-group-text bg-white border-end-0 d-none d-sm-flex">
                      <i class="fas fa-book text-muted"></i>
                    </span>
                    <select class="form-select ps-2 ps-sm-0" :class="{'border-start-0': windowWidth >= 576}" v-model="catalogoFilter" @change="applyFilters">
                      <option value="">Todos los catálogos</option>
                      <option v-for="catalogo in catalogos" :key="catalogo.id" :value="catalogo.id">
                        {{ catalogo.nombre }}
                      </option>
                    </select>
                  </div>
                </div>
                <div class="col-12 col-sm-4">
                  <div class="input-group shadow-sm rounded-3 overflow-hidden">
                    <span class="input-group-text bg-white border-end-0 d-none d-sm-flex">
                      <i class="fas fa-sort text-muted"></i>
                    </span>
                    <select class="form-select ps-2 ps-sm-0" :class="{'border-start-0': windowWidth >= 576}" v-model="sortBy" @change="applyFilters">
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
        </div>

        <!-- Contador de resultados y selector de vista -->
        <div class="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-3 p-3 p-md-4">
          <div class="d-flex align-items-center">
            <span class="badge bg-primary rounded-pill me-2 shadow-sm">{{ pagination.total }}</span>
            <p class="text-muted mb-0 small">
              <span class="d-none d-sm-inline">Mostrando {{ datos.length }} de {{ pagination.total }} pedidos</span>
              <span class="d-sm-none">{{ datos.length }}/{{ pagination.total }}</span>
            </p>
          </div>
          <div class="btn-group shadow-sm w-100 w-sm-auto rounded-3 overflow-hidden">
            <button class="btn btn-sm" :class="viewMode === 'table' ? 'btn-primary' : 'btn-light'"
              @click="viewMode = 'table'">
              <i class="fas fa-table me-1"></i><span class="d-none d-md-inline">Tabla</span>
            </button>
            <button class="btn btn-sm" :class="viewMode === 'cards' ? 'btn-primary' : 'btn-light'"
              @click="viewMode = 'cards'">
              <i class="fas fa-th-large me-1"></i><span class="d-none d-md-inline">Tarjetas</span>
            </button>
          </div>
        </div>

        <!-- Mensaje cuando no hay resultados -->
        <div v-if="datos.length === 0 && pagination.total > 0" class="text-center py-4 py-md-5 px-3">
          <div class="mb-3">
            <span class="badge bg-light p-3 rounded-circle shadow-sm">
              <i class="fas fa-search fa-2x text-muted"></i>
            </span>
          </div>
          <h5 class="text-muted">No se encontraron pedidos</h5>
          <p class="text-muted small">Intenta con otra búsqueda o cambia los filtros</p>
          <button class="btn btn-primary mt-2 shadow-sm rounded-3" @click="clearFilters">
            <i class="fas fa-filter me-2"></i>Limpiar filtros
          </button>
        </div>

        <!-- Empty state -->
        <div v-if="pagination.total === 0" class="text-center py-4 py-md-5 px-3">
          <div class="mb-3">
            <span class="badge bg-light p-3 rounded-circle shadow-sm">
              <i class="fas fa-shopping-cart fa-2x text-muted"></i>
            </span>
          </div>
          <h5 class="text-muted">No hay pedidos registrados</h5>
          <p class="text-muted small">Los pedidos aparecerán aquí cuando se realicen</p>
        </div>

        <!-- Table view - Solo en desktop -->
        <div class="d-none d-lg-block" v-if="datos.length > 0 && viewMode === 'table'">
          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead class="bg-light">
                <tr>
                  <th class="px-3 py-3 border-0">
                    <div class="d-flex align-items-center">
                      <span class="fw-bold text-dark">ID</span>
                      <button class="btn btn-sm text-primary border-0 p-0 ms-1" @click="toggleSort('id')">
                        <i class="fas" :class="getSortIcon('id')"></i>
                      </button>
                    </div>
                  </th>
                  <th class="px-3 py-3 border-0">
                    <div class="d-flex align-items-center">
                      <span class="fw-bold text-dark">Cliente</span>
                      <button class="btn btn-sm text-primary border-0 p-0 ms-1" @click="toggleSort('name')">
                        <i class="fas" :class="getSortIcon('name')"></i>
                      </button>
                    </div>
                  </th>
                  <th class="px-3 py-3 border-0 fw-bold text-dark">Email</th>
                  <th class="px-3 py-3 border-0">
                    <div class="d-flex align-items-center">
                      <span class="fw-bold text-dark">Productos</span>
                      <button class="btn btn-sm text-primary border-0 p-0 ms-1" @click="toggleSort('products')">
                        <i class="fas" :class="getSortIcon('products')"></i>
                      </button>
                    </div>
                  </th>
                  <th class="px-3 py-3 border-0">
                    <div class="d-flex align-items-center">
                      <span class="fw-bold text-dark">Monto</span>
                      <button class="btn btn-sm text-primary border-0 p-0 ms-1" @click="toggleSort('amount')">
                        <i class="fas" :class="getSortIcon('amount')"></i>
                      </button>
                    </div>
                  </th>
                  <th class="px-3 py-3 border-0">
                    <div class="d-flex align-items-center">
                      <span class="fw-bold text-dark">Fecha</span>
                      <button class="btn btn-sm text-primary border-0 p-0 ms-1" @click="toggleSort('date')">
                        <i class="fas" :class="getSortIcon('date')"></i>
                      </button>
                    </div>
                  </th>
                  <th class="px-3 py-3 border-0 fw-bold text-dark">Estado</th>
                  <th class="px-3 py-3 text-center border-0 fw-bold text-dark">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in datos" :key="item.id" class="order-row">
                  <td class="px-3 py-3">
                    <span class="badge bg-primary bg-opacity-10 text-primary fw-bold px-2 py-1 rounded-2">#{{ item.id }}</span>
                  </td>
                  <td class="px-3 py-3">
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
                  <td class="px-3 py-3">
                    <span class="text-truncate d-inline-block" style="max-width: 200px;">{{ item.user?.email }}</span>
                  </td>
                  <td class="px-3 py-3 text-center">
                    <span class="badge bg-info rounded-pill shadow-sm">{{ item.productos?.length || 0 }}</span>
                  </td>
                  <td class="px-3 py-3">
                    <span class="fw-bold text-success">{{ formatCurrency(item.total_amount) }}</span>
                  </td>
                  <td class="px-3 py-3">
                    <div>{{ formatDate(item.created_at) }}</div>
                    <small class="text-muted">{{ getTimeAgo(item.created_at) }}</small>
                  </td>
                  <td class="px-3 py-3">
                    <span class="badge rounded-pill shadow-sm" :class="item.estado == false ? 'bg-warning' : 'bg-success'">
                      {{ item.estado == false ? 'Pendiente' : 'Completado' }}
                    </span>
                  </td>
                  <td class="px-3 py-3 text-center">
                    <div class="btn-group shadow-sm rounded-3 overflow-hidden">
                      <button class="btn btn-sm btn-light" @click="showOrder(item.id)" title="Ver detalles">
                        <i class="fas fa-eye text-primary"></i>
                      </button>
                      <button class="btn btn-sm btn-light" @click="completeOrderPending(item.id)"
                        :disabled="item.estado === true" title="Marcar como completado">
                        <i class="fas fa-check" :class="{'text-success': item.estado !== true, 'text-muted': item.estado === true}"></i>
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
        </div>

        <!-- Cards view - Responsive para móviles y tablets -->
        <div v-if="datos.length > 0 && (viewMode === 'cards' || windowWidth < 992)">
          <div class="row g-3 g-md-4 p-3 p-md-4">
            <div class="col-12 col-sm-6 col-xl-4" v-for="item in datos" :key="item.id">
              <div class="card h-100 border-0 shadow-sm hover-card rounded-3 overflow-hidden">
                <div class="card-header bg-white d-flex justify-content-between align-items-center p-3 border-0">
                  <div class="d-flex align-items-center min-w-0 flex-grow-1">
                    <div class="avatar-circle me-2 flex-shrink-0" :style="{ backgroundColor: getAvatarColor(item.user?.nombre) }">
                      {{ getInitials(item.user?.nombre, item.user?.apellido) }}
                    </div>
                    <h5 class="card-title mb-0 fw-bold text-truncate">
                      <span class="badge bg-primary bg-opacity-10 text-primary me-1">#{{ item.id }}</span>
                      <span class="d-none d-sm-inline">Pedido</span>
                    </h5>
                  </div>
                  <span class="badge rounded-pill flex-shrink-0 ms-2 shadow-sm" :class="item.estado == false ? 'bg-warning' : 'bg-success'">
                    <span class="d-none d-sm-inline">{{ item.estado == false ? 'Pendiente' : 'Completado' }}</span>
                    <span class="d-sm-none">{{ item.estado == false ? 'P' : 'C' }}</span>
                  </span>
                </div>
                <div class="card-body p-3">
                  <div class="row g-2 small">
                    <div class="col-12">
                      <div class="d-flex justify-content-between align-items-center">
                        <span class="text-muted"><i class="fas fa-user me-1"></i>Cliente:</span>
                        <span class="fw-medium text-end text-truncate ms-2" style="max-width: 60%;">
                          {{ item.user?.nombre }} {{ item.user?.apellido }}
                        </span>
                      </div>
                    </div>
                    <div class="col-12">
                      <div class="d-flex justify-content-between align-items-center">
                        <span class="text-muted"><i class="fas fa-envelope me-1"></i>Email:</span>
                        <span class="text-truncate text-end ms-2" style="max-width: 60%;">{{ item.user?.email }}</span>
                      </div>
                    </div>
                    <div class="col-6">
                      <div class="d-flex justify-content-between align-items-center">
                        <span class="text-muted"><i class="fas fa-box me-1"></i>Productos:</span>
                        <span class="badge bg-info rounded-pill shadow-sm">{{ item.productos?.length || 0 }}</span>
                      </div>
                    </div>
                    <div class="col-6">
                      <div class="d-flex justify-content-between align-items-center">
                        <span class="text-muted"><i class="fas fa-money-bill-wave me-1"></i>Monto:</span>
                        <span class="fw-bold text-success">{{ formatCurrency(item.total_amount) }}</span>
                      </div>
                    </div>
                    <div class="col-12">
                      <div class="d-flex justify-content-between align-items-center">
                        <span class="text-muted"><i class="fas fa-calendar-alt me-1"></i>Fecha:</span>
                        <span>{{ formatDate(item.created_at) }}</span>
                      </div>
                    </div>
                    <div class="col-12" v-if="item.payment_method">
                      <div class="d-flex justify-content-between align-items-center">
                        <span class="text-muted"><i class="fas fa-credit-card me-1"></i>Pago:</span>
                        <span class="badge rounded-pill shadow-sm" :class="item.payment_method === 'in-person' ? 'bg-warning' : 'bg-info'">
                          {{ item.payment_method === 'in-person' ? 'En persona' : 'QR' }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="card-footer bg-white p-3 border-top-0">
                  <div class="d-flex flex-column flex-sm-row gap-2">
                    <button class="btn btn-sm btn-primary flex-fill shadow-sm" @click="showOrder(item.id)">
                      <i class="fas fa-eye me-1"></i>Detalles
                    </button>
                    <button class="btn btn-sm btn-success flex-fill shadow-sm" @click="completeOrderPending(item.id)"
                      :disabled="item.estado === true">
                      <i class="fas fa-check me-1"></i>
                      <span class="d-none d-sm-inline">Completar</span>
                      <span class="d-sm-none">OK</span>
                    </button>
                    <button class="btn btn-sm btn-danger flex-fill shadow-sm" @click="fetchOrdersPDFId(item.id)">
                      <i class="fas fa-file-pdf me-1"></i>PDF
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Paginación responsive -->
        <div class="d-flex justify-content-center py-3 py-md-4 px-3" v-if="pagination.last_page > 1">
          <nav aria-label="Navegación de pedidos">
            <ul class="pagination shadow-sm mb-0 rounded-3 overflow-hidden">
              <!-- Primera página - Solo en desktop -->
              <li class="page-item d-none d-md-block" :class="{ disabled: pagination.current_page === 1 }">
                <a class="page-link border-0" href="#" @click.prevent="changePage(1)" aria-label="Primera página">
                  <i class="fas fa-angle-double-left"></i>
                </a>
              </li>
              <!-- Página anterior -->
              <li class="page-item" :class="{ disabled: pagination.current_page === 1 }">
                <a class="page-link border-0" href="#" @click.prevent="changePage(pagination.current_page - 1)" aria-label="Página anterior">
                  <i class="fas fa-angle-left"></i>
                </a>
              </li>

              <!-- Páginas numeradas - Responsive -->
              <li class="page-item" v-for="page in paginationRange" :key="page"
                :class="{ active: pagination.current_page === page }">
                <a class="page-link border-0" href="#" @click.prevent="changePage(page)">{{ page }}</a>
              </li>

              <!-- Página siguiente -->
              <li class="page-item" :class="{ disabled: pagination.current_page === pagination.last_page }">
                <a class="page-link border-0" href="#" @click.prevent="changePage(pagination.current_page + 1)" aria-label="Página siguiente">
                  <i class="fas fa-angle-right"></i>
                </a>
              </li>
              <!-- Última página - Solo en desktop -->
              <li class="page-item d-none d-md-block" :class="{ disabled: pagination.current_page === pagination.last_page }">
                <a class="page-link border-0" href="#" @click.prevent="changePage(pagination.last_page)" aria-label="Última página">
                  <i class="fas fa-angle-double-right"></i>
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>

    <!-- Modal de detalles del pedido - Responsive -->
    <div class="modal fade" id="orderDetailModal" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1"
      aria-labelledby="orderDetailModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-fullscreen-sm-down modal-xl modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content border-0 shadow-lg rounded-3">
          <!-- Encabezado del Modal -->
          <div class="modal-header bg-primary bg-opacity-10 p-3 p-md-4 border-0">
            <h5 class="modal-title" id="orderDetailModalLabel">
              <span class="badge bg-primary bg-opacity-10 text-primary p-2 me-2 rounded-circle">
                <i class="fas fa-info-circle"></i>
              </span>
              <span class="d-none d-sm-inline">Detalle del Pedido #{{ detailOrder.id }}</span>
              <span class="d-sm-none">Pedido #{{ detailOrder.id }}</span>
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>

          <!-- Cuerpo del Modal -->
          <div class="modal-body p-3 p-md-4">
            <!-- Barra de estado del pedido -->
            <div class="order-status-bar mb-4 p-3 bg-light rounded-3">
              <div class="progress mb-3" style="height: 8px;">
                <div class="progress-bar bg-gradient bg-success" role="progressbar"
                  :style="{ width: detailOrder.estado ? '100%' : '50%' }" aria-valuenow="50" aria-valuemin="0"
                  aria-valuemax="100"></div>
              </div>
              <div class="d-flex justify-content-between">
                <div class="text-center">
                  <div class="status-circle active shadow-sm">
                    <i class="fas fa-shopping-cart"></i>
                  </div>
                  <div class="small mt-2 fw-medium">Pedido realizado</div>
                  <div class="small text-muted">{{ formatDate(detailOrder.created_at) }}</div>
                </div>
                <div class="text-center">
                  <div class="status-circle shadow-sm" :class="{ active: detailOrder.estado }">
                    <i class="fas fa-check"></i>
                  </div>
                  <div class="small mt-2 fw-medium">Pedido completado</div>
                  <div class="small text-muted" v-if="detailOrder.estado">{{ formatDate(detailOrder.updated_at) }}</div>
                  <div class="small text-muted" v-else>Pendiente</div>
                </div>
              </div>
            </div>

            <div class="row g-3 g-md-4">
              <!-- Datos del Usuario -->
              <div class="col-12 col-lg-4">
                <div class="card h-100 border-0 shadow-sm rounded-3">
                  <div class="card-header bg-white border-0 p-3">
                    <span class="card-title h6 d-flex align-items-center">
                      <span class="badge bg-primary bg-opacity-10 text-primary p-2 me-2 rounded-circle">
                        <i class="fas fa-user"></i>
                      </span>
                      Datos del Cliente
                    </span>
                  </div>
                  <div class="card-body p-3">
                    <div class="text-center mb-3">
                      <div class="avatar-circle-lg mx-auto mb-2 shadow-sm"
                        :style="{ backgroundColor: getAvatarColor(detailOrder.user?.nombre) }">
                        {{ getInitials(detailOrder.user?.nombre, detailOrder.user?.apellido) }}
                      </div>
                      <h6 class="mb-0 fw-bold">{{ detailOrder.user?.nombre }} {{ detailOrder.user?.apellido }}</h6>
                      <p class="text-muted mb-0 small text-truncate">{{ detailOrder.user?.email }}</p>
                    </div>
                    <div class="row g-2 small">
                      <div class="col-12">
                        <div class="d-flex justify-content-between">
                          <span class="text-muted"><i class="fas fa-phone me-1"></i>Teléfono:</span>
                          <span class="fw-medium">{{ detailOrder.user?.telefono }}</span>
                        </div>
                      </div>
                      <div class="col-12">
                        <div class="d-flex justify-content-between">
                          <span class="text-muted"><i class="fas fa-id-card me-1"></i>CI:</span>
                          <span class="fw-medium">{{ detailOrder.user?.ci }}</span>
                        </div>
                      </div>
                      <div class="col-12">
                        <div class="d-flex justify-content-between">
                          <span class="text-muted"><i class="fas fa-globe me-1"></i>País:</span>
                          <span class="fw-medium">{{ detailOrder.user?.pais || 'Bolivia' }}</span>
                        </div>
                      </div>
                      <div class="col-12">
                        <div class="d-flex justify-content-between">
                          <span class="text-muted"><i class="fas fa-map me-1"></i>Departamento:</span>
                          <span class="fw-medium text-capitalize">{{ detailOrder.user?.departamento || 'No especificado' }}</span>
                        </div>
                      </div>
                      <div class="col-12">
                        <span class="text-muted"><i class="fas fa-map-marker-alt me-1"></i>Dirección:</span>
                        <p class="mb-0 mt-1 small">{{ detailOrder.user?.direccion }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Productos del Pedido -->
              <div class="col-12 col-lg-4">
                <div class="card h-100 border-0 shadow-sm rounded-3">
                  <div class="card-header bg-white border-0 p-3">
                    <span class="card-title h6 d-flex align-items-center">
                      <span class="badge bg-primary bg-opacity-10 text-primary p-2 me-2 rounded-circle">
                        <i class="fas fa-box"></i>
                      </span>
                      Productos del Pedido
                    </span>
                  </div>
                  <div class="card-body p-0">
                    <div class="table-responsive">
                      <table class="table table-hover mb-0 small">
                        <thead class="table-light">
                          <tr>
                            <th class="p-2 border-0 fw-bold">Producto</th>
                            <th class="text-center p-2 border-0 fw-bold">Cant.</th>
                            <th class="text-end p-2 border-0 fw-bold">Precio</th>
                            <th class="text-end p-2 border-0 fw-bold">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-for="(producto, index) in detailOrder.productos" :key="index" class="product-row">
                            <td class="p-2">
                              <div>
                                <div class="fw-medium">{{ producto.nombre }}</div>
                                <div v-if="producto.pivot?.modelo_id" class="small text-muted">
                                  Modelo: {{ getModelName(producto.pivot.modelo_id, producto) }}
                                </div>
                                <div v-if="producto.pivot?.color" class="small text-muted">
                                  Color: {{ producto.pivot.color }}
                                </div>
                                <div class="badge rounded-pill shadow-sm" :class="producto.pivot?.es_preventa ? 'bg-warning' : 'bg-info'">
                                  {{ producto.pivot?.es_preventa ? 'Estándar' : 'Especial' }}
                                </div>
                              </div>
                            </td>
                            <td class="text-center p-2">
                              <span class="badge bg-primary bg-opacity-10 text-primary rounded-pill">{{ producto.pivot?.cantidad }}</span>
                            </td>
                            <td class="text-end p-2">
                              {{ formatCurrency(producto.pivot?.es_preventa ? producto.pivot?.precio_preventa :
                                producto.pivot?.precio) }}
                            </td>
                            <td class="text-end fw-medium p-2 text-success">
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

              <!-- Resumen Financiero -->
              <div class="col-12 col-lg-4">
                <div class="card h-100 border-0 shadow-sm rounded-3">
                  <div class="card-header bg-white border-0 p-3">
                    <span class="card-title h6 d-flex align-items-center">
                      <span class="badge bg-primary bg-opacity-10 text-primary p-2 me-2 rounded-circle">
                        <i class="fas fa-money-bill-wave"></i>
                      </span>
                      Resumen Financiero
                    </span>
                  </div>
                  <div class="card-body p-3">
                    <!-- Alerta de estado de pago -->
                    <div class="alert rounded-3 border-0 shadow-sm mb-3" 
                      :class="detailOrder.pending > 0 ? 'alert-warning bg-warning bg-opacity-10' : 'alert-success bg-success bg-opacity-10'"
                      role="alert">
                      <div class="d-flex">
                        <div class="me-2">
                          <i :class="detailOrder.pending > 0 ? 'fas fa-exclamation-triangle text-warning' : 'fas fa-check-circle text-success'"></i>
                        </div>
                        <div>
                          <h6 class="alert-heading">{{ detailOrder.pending > 0 ? 'Pago pendiente' : 'Pago completado' }}</h6>
                          <p class="mb-0 small">{{ detailOrder.pending > 0 ? 'Este pedido tiene un saldo pendiente de pago.' :
                            'Este pedido ha sido pagado completamente.' }}</p>
                        </div>
                      </div>
                    </div>

                    <!-- Resumen financiero -->
                    <div class="row g-2 small">
                      <div class="col-12">
                        <div class="d-flex justify-content-between">
                          <span class="text-muted">Subtotal:</span>
                          <span class="fw-medium">{{ formatCurrency(detailOrder.total_amount) }}</span>
                        </div>
                      </div>

                      <!-- Información del cupón -->
                      <div class="col-12" v-if="detailOrder.cupon">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                          <span class="text-muted">Cupón Aplicado:</span>
                          <div class="text-end">
                            <div class="d-flex align-items-center flex-wrap justify-content-end gap-1">
                              <span class="badge bg-info rounded-pill shadow-sm">{{ detailOrder.cupon.codigo }}</span>
                              <span class="badge rounded-pill shadow-sm"
                                :class="detailOrder.cupon.tipo === 'porcentaje' ? 'bg-primary' : 'bg-success'">
                                {{ detailOrder.cupon.tipo === 'porcentaje' ?
                                  detailOrder.cupon.descuento + '%' :
                                  'Bs. ' + detailOrder.cupon.descuento }}
                              </span>
                            </div>
                          </div>
                        </div>

                        <!-- Detalles del descuento -->
                        <div class="discount-details p-2 mb-2 rounded-3 shadow-sm"
                          :class="detailOrder.cupon.tipo === 'porcentaje' ? 'bg-primary bg-opacity-10' : 'bg-success bg-opacity-10'">
                          <div class="row g-1">
                            <div class="col-12">
                              <div class="d-flex justify-content-between">
                                <span class="text-muted">Tipo:</span>
                                <span class="fw-medium">{{ detailOrder.cupon.tipo === 'porcentaje' ? 'Porcentaje' : 'Monto Fijo' }}</span>
                              </div>
                            </div>
                            <div class="col-12">
                              <div class="d-flex justify-content-between">
                                <span class="text-muted">Valor:</span>
                                <span class="fw-medium">{{ detailOrder.cupon.tipo === 'porcentaje' ?
                                  detailOrder.cupon.descuento + '%' :
                                  formatCurrency(detailOrder.cupon.descuento) }}</span>
                              </div>
                            </div>
                            <div class="col-12">
                              <div class="d-flex justify-content-between">
                                <span class="text-muted">Descuento aplicado:</span>
                                <span class="fw-medium text-danger">-{{ formatCurrency(calcularMontoDescuento()) }}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <!-- Total después del descuento -->
                      <div class="col-12">
                        <div class="d-flex justify-content-between fw-bold">
                          <span class="text-muted">Total con descuento:</span>
                          <span class="text-primary">{{ formatCurrency(detailOrder.total_amount - calcularMontoDescuento()) }}</span>
                        </div>
                      </div>

                      <!-- Desglose de pagos -->
                      <div class="col-12">
                        <div class="d-flex justify-content-between">
                          <span class="text-muted">Monto Pagado:</span>
                          <span class="fw-medium text-success">{{ formatCurrency(detailOrder.total_to_pay) }}</span>
                        </div>
                      </div>
                      <div class="col-12">
                        <div class="d-flex justify-content-between">
                          <span class="text-muted">Saldo Pendiente:</span>
                          <span class="fw-medium text-danger">{{ formatCurrency(detailOrder.pending) }}</span>
                        </div>
                      </div>

                      <!-- Método de pago y estado -->
                      <div class="col-12">
                        <div class="d-flex justify-content-between">
                          <span class="text-muted">Método de Pago:</span>
                          <span class="badge rounded-pill shadow-sm"
                            :class="detailOrder.payment_method === 'in-person' ? 'bg-warning' : 'bg-info'">
                            {{ detailOrder.payment_method === 'in-person' ? 'En persona' : 'Pago por QR' }}
                          </span>
                        </div>
                      </div>
                      <div class="col-12">
                        <div class="d-flex justify-content-between">
                          <span class="text-muted">Estado:</span>
                          <span class="badge rounded-pill shadow-sm" :class="detailOrder.estado == false ? 'bg-warning' : 'bg-success'">
                            {{ detailOrder.estado == false ? 'Pendiente' : 'Completado' }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Sección de Comprobante/Voucher -->
              <div class="col-12" v-if="detailOrder.payment_method === 'qr' && detailOrder.voucher">
                <div class="card border-0 shadow-sm rounded-3">
                  <div class="card-header bg-white border-0 p-3">
                    <span class="card-title h6 d-flex align-items-center">
                      <span class="badge bg-primary bg-opacity-10 text-primary p-2 me-2 rounded-circle">
                        <i class="fas fa-receipt"></i>
                      </span>
                      Comprobante de Pago
                    </span>
                  </div>
                  <div class="card-body p-3">
                    <div class="row align-items-center g-3">
                      <div class="col-12 col-md-8">
                        <div class="alert alert-info bg-info bg-opacity-10 border-0 rounded-3 shadow-sm mb-3">
                          <i class="fas fa-info-circle me-2"></i>
                          <span class="small">El cliente ha proporcionado un comprobante de pago. Haga clic en la imagen para verla en tamaño completo.</span>
                        </div>
                        <div class="small">
                          <p class="mb-1">
                            <strong>Fecha de carga:</strong> {{ formatDate(detailOrder.updated_at) }}
                          </p>
                          <p class="mb-0">
                            <strong>Método de pago:</strong> Pago por QR
                          </p>
                        </div>
                      </div>
                      <div class="col-12 col-md-4 text-center">
                        <div class="voucher-container shadow-sm rounded-3 overflow-hidden">
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

          <!-- Pie del Modal -->
          <div class="modal-footer border-0 p-3 p-md-4 bg-light">
            <div class="d-flex flex-column flex-sm-row justify-content-between w-100 gap-2">
              <div>
                <button type="button" class="btn btn-danger shadow-sm w-100 w-sm-auto rounded-3" @click="fetchOrdersPDFId(detailOrder.id)"
                  v-if="detailOrder.id">
                  <i class="fas fa-file-pdf me-2"></i>Generar PDF
                </button>
              </div>
              <div class="d-flex flex-column flex-sm-row gap-2">
                <button type="button" class="btn btn-light shadow-sm rounded-3" data-bs-dismiss="modal">
                  <i class="fas fa-times me-2"></i>Cerrar
                </button>
                <button type="button" class="btn btn-success shadow-sm rounded-3" @click="completeOrderPending(detailOrder.id)"
                  :disabled="detailOrder.estado === true" v-if="detailOrder.id">
                  <i class="fas fa-check me-2"></i>Completar Pedido
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal para ver el voucher en tamaño completo -->
    <div class="modal fade" id="voucherModal" tabindex="-1" aria-labelledby="voucherModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-fullscreen-sm-down modal-lg modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg rounded-3">
          <div class="modal-header bg-primary bg-opacity-10 p-3 border-0">
            <h5 class="modal-title" id="voucherModalLabel">
              <span class="badge bg-primary bg-opacity-10 text-primary p-2 me-2 rounded-circle">
                <i class="fas fa-receipt"></i>
              </span>
              Comprobante de Pago
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body text-center p-0 bg-light">
            <img :src="currentVoucherUrl" alt="Comprobante de pago" class="img-fluid" style="max-height: 80vh;">
          </div>
          <div class="modal-footer border-0 p-3 bg-light">
            <div class="d-flex flex-column flex-sm-row gap-2 w-100">
              <button type="button" class="btn btn-primary shadow-sm flex-fill rounded-3" @click="downloadVoucher">
                <i class="fas fa-download me-2"></i>Descargar
              </button>
              <button type="button" class="btn btn-light shadow-sm flex-fill rounded-3" data-bs-dismiss="modal">Cerrar</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast de notificación -->
    <div class="position-fixed bottom-0 end-0 p-3" style="z-index: 11">
      <div id="liveToast" class="toast hide border-0 shadow-lg rounded-3" role="alert" aria-live="assertive" aria-atomic="true">
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
/* Estilos base responsive */
.container-fluid {
  max-width: 100%;
  overflow-x: hidden;
}

/* Estilos para tarjetas */
.card {
  transition: all 0.3s ease;
  border-radius: 0.75rem;
  overflow: hidden;
  box-shadow: 0 0.25rem 0.75rem rgba(0, 0, 0, 0.1) !important;
}

.card:hover {
  box-shadow: 0 0.5rem 1.5rem rgba(0, 0, 0, 0.15) !important;
  transform: translateY(-2px);
}

.hover-card {
  transition: all 0.3s ease;
}

.hover-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
}

/* Estilos para botones responsive */
.btn {
  transition: all 0.2s ease-in-out;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;
  white-space: nowrap;
  font-weight: 500;
  padding: 0.5rem 1.25rem;
}

.btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 0.25rem 0.5rem rgba(0, 0, 0, 0.1) !important;
}

.btn-sm {
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
}

/* Estilos para badges */
.badge {
  font-weight: 500;
  padding: 0.35rem 0.65rem;
  border-radius: 50rem;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.badge:hover {
  transform: translateY(-1px);
  box-shadow: 0 0.25rem 0.5rem rgba(0, 0, 0, 0.15);
}

.badge.rounded-circle {
  width: 36px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

/* Estilos para avatares responsive */
.avatar-circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 14px;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  flex-shrink: 0;
}

.avatar-circle-lg {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 20px;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}

/* Estilos para la barra de estado */
.order-status-bar {
  position: relative;
  padding: 0 10px;
}

.status-circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #f8f9fa;
  border: 2px solid #dee2e6;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6c757d;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  transition: all 0.3s ease;
}

.status-circle.active {
  background-color: #198754;
  border-color: #198754;
  color: white;
}

/* Estilos para dropdown responsive */
.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  z-index: 1000;
  display: none;
  min-width: 10rem;
  padding: 0.5rem 0;
  margin: 0.125rem 0 0;
  font-size: 0.9rem;
  color: #212529;
  text-align: left;
  list-style: none;
  background-color: #fff;
  background-clip: padding-box;
  border-radius: 0.75rem;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
}

.dropdown-menu.show {
  display: block;
  animation: fadeIn 0.2s ease-in-out;
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
  border-radius: 0.5rem;
  margin: 0 0.25rem;
  width: calc(100% - 0.5rem);
  transition: all 0.2s ease;
}

.dropdown-item:hover,
.dropdown-item:focus {
  color: #16181b;
  text-decoration: none;
  background-color: #f8f9fa;
  transform: translateX(2px);
}

/* Estilos para voucher responsive */
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
  max-height: 200px;
  object-fit: contain;
  width: 100%;
}

/* Estilos para filas de tabla */
.order-row {
  transition: all 0.2s ease;
}

.order-row:hover {
  background-color: rgba(13, 110, 253, 0.05);
}

.product-row {
  transition: all 0.2s ease;
}

.product-row:hover {
  background-color: rgba(13, 110, 253, 0.03);
}

/* Utilidades responsive */
.min-w-0 {
  min-width: 0;
}

.flex-shrink-0 {
  flex-shrink: 0;
}

.text-truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Estilos para inputs y selects */
.input-group {
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.05);
  border-radius: 0.5rem;
  overflow: hidden;
}

.input-group-text {
  border: none;
  background-color: #f8f9fa;
}

.form-control, .form-select {
  border: none;
  padding: 0.625rem 1rem;
}

.form-control:focus, .form-select:focus {
  box-shadow: none;
  border-color: #0d6efd;
}

/* Estilos para la paginación responsive */
.pagination {
  margin-bottom: 0;
  border-radius: 0.5rem;
  overflow: hidden;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.05);
}

.page-item.active .page-link {
  background-color: #0d6efd;
  border-color: #0d6efd;
  color: white;
  font-weight: 600;
}

.page-link {
  border: none;
  color: #0d6efd;
  padding: 0.5rem 0.75rem;
  transition: all 0.2s ease;
}

.page-link:hover {
  background-color: #e9ecef;
  color: #0a58ca;
  transform: translateY(-1px);
}

.page-item.disabled .page-link {
  color: #6c757d;
  opacity: 0.5;
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

/* Media queries para responsive design */
@media (max-width: 575.98px) {
  .container-fluid {
    padding-left: 0.5rem;
    padding-right: 0.5rem;
  }
  
  .card-header {
    padding: 1rem !important;
  }
  
  .card-body {
    padding: 1rem !important;
  }
  
  .modal-header,
  .modal-footer,
  .modal-body {
    padding: 1rem !important;
  }
  
  .btn {
    font-size: 0.875rem;
    padding: 0.5rem 1rem;
  }
  
  .btn-sm {
    font-size: 0.8rem;
    padding: 0.375rem 0.75rem;
  }
  
  .avatar-circle {
    width: 28px;
    height: 28px;
    font-size: 12px;
  }
  
  .avatar-circle-lg {
    width: 50px;
    height: 50px;
    font-size: 18px;
  }
  
  .status-circle {
    width: 28px;
    height: 28px;
  }
  
  .dropdown-menu {
    font-size: 0.85rem;
    min-width: 250px;
    max-width: 85vw;
  }
}

@media (min-width: 576px) and (max-width: 767.98px) {
  .avatar-circle {
    width: 30px;
    height: 30px;
    font-size: 13px;
  }
  
  .avatar-circle-lg {
    width: 55px;
    height: 55px;
    font-size: 19px;
  }
  
  .status-circle {
    width: 30px;
    height: 30px;
  }
}

@media (min-width: 768px) and (max-width: 991.98px) {
  .avatar-circle {
    width: 34px;
    height: 34px;
    font-size: 15px;
  }
  
  .avatar-circle-lg {
    width: 65px;
    height: 65px;
    font-size: 22px;
  }
}

@media (min-width: 992px) {
  .avatar-circle {
    width: 40px;
    height: 40px;
    font-size: 16px;
  }
  
  .avatar-circle-lg {
    width: 80px;
    height: 80px;
    font-size: 28px;
  }
}

/* Mejoras de accesibilidad */
@media (prefers-reduced-motion: reduce) {
  .card,
  .btn,
  .hover-card,
  .voucher-container,
  .order-row,
  .product-row,
  .status-circle,
  .badge,
  .page-link,
  .dropdown-item {
    transition: none !important;
  }
  
  .hover-card:hover,
  .card:hover,
  .btn:hover,
  .voucher-container:hover,
  .badge:hover,
  .page-link:hover,
  .dropdown-item:hover {
    transform: none !important;
  }
}

/* Estilos para la tabla */
.table {
  margin-bottom: 0;
}

.table th {
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.8rem;
  letter-spacing: 0.5px;
  color: #495057;
  padding: 1rem;
  border-bottom: 2px solid #e9ecef;
}

.table td {
  padding: 1rem;
  vertical-align: middle;
  border-bottom: 1px solid #e9ecef;
}

.table tbody tr {
  transition: all 0.2s ease;
}

.table tbody tr:hover {
  background-color: rgba(13, 110, 253, 0.05);
}

/* Estilos para botones de acción en la tabla */
.btn-group .btn {
  margin-left: -1px;
}

.btn-group .btn:first-child {
  border-top-left-radius: 0.5rem;
  border-bottom-left-radius: 0.5rem;
}

.btn-group .btn:last-child {
  border-top-right-radius: 0.5rem;
  border-bottom-right-radius: 0.5rem;
}

/* Estilos para alertas */
.alert {
  border: none;
  border-radius: 0.75rem;
  box-shadow: 0 0.25rem 0.75rem rgba(0, 0, 0, 0.1);
}

/* Estilos para el contenedor principal */
.container-fluid {
  max-width: 1400px;
  margin: 0 auto;
}
</style>