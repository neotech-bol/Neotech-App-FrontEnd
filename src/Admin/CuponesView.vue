<template>
  <div class="container-fluid py-4">
    <div class="card shadow-sm border-0 rounded-3">
      <!-- Header -->
      <div class="card-header bg-primary bg-opacity-10 d-flex justify-content-between align-items-center flex-wrap gap-3 p-3">
        <h2 class="card-title h4 m-0">
          <i class="fas fa-ticket-alt me-2"></i>Gestión de Cupones
        </h2>
        <div class="d-flex gap-2">
          <button class="btn btn-primary d-flex align-items-center" @click="openModal()">
            <i class="fas fa-plus me-2"></i>Agregar Cupón
          </button>
          <button class="btn btn-outline-primary d-flex align-items-center" @click="allCupones()">
            <i class="fas fa-sync-alt me-2"></i>Actualizar
          </button>
        </div>
      </div>

      <!-- Toolbar -->
      <div class="p-3 border-bottom">
        <div class="row g-3">
          <!-- Search -->
          <div class="col-md-6 col-lg-4">
            <div class="input-group">
              <span class="input-group-text bg-light border-end-0">
                <i class="fas fa-search text-muted"></i>
              </span>
              <input 
                type="text" 
                class="form-control border-start-0" 
                placeholder="Buscar por código, tipo..." 
                v-model="searchText"
                aria-label="Buscar cupones"
              >
              <button 
                v-if="searchText" 
                class="btn btn-outline-secondary border-start-0" 
                type="button" 
                @click="searchText = ''"
                aria-label="Limpiar búsqueda"
              >
                <i class="fas fa-times"></i>
              </button>
            </div>
          </div>

          <!-- Filters and stats -->
          <div class="col-md-6 col-lg-8 d-flex justify-content-md-end align-items-center flex-wrap gap-3">
            <div class="d-flex align-items-center me-3">
              <span class="badge bg-primary rounded-pill me-2">{{ filteredCupones.length }}</span>
              <span class="text-muted">{{ filteredCupones.length === 1 ? 'cupón encontrado' : 'cupones encontrados' }}</span>
            </div>
            
            <div class="btn-group">
              <button 
                class="btn btn-sm" 
                :class="statusFilter === 'all' ? 'btn-primary' : 'btn-outline-primary'" 
                @click="statusFilter = 'all'"
                aria-label="Ver todos los cupones"
              >
                <i class="fas fa-list-ul me-1"></i><span class="d-none d-sm-inline">Todos</span>
              </button>
              <button 
                class="btn btn-sm" 
                :class="statusFilter === 'active' ? 'btn-success' : 'btn-outline-success'" 
                @click="statusFilter = 'active'"
                aria-label="Ver cupones activos"
              >
                <i class="fas fa-check-circle me-1"></i><span class="d-none d-sm-inline">Activos</span>
              </button>
              <button 
                class="btn btn-sm" 
                :class="statusFilter === 'expired' ? 'btn-danger' : 'btn-outline-danger'" 
                @click="statusFilter = 'expired'"
                aria-label="Ver cupones vencidos"
              >
                <i class="fas fa-times-circle me-1"></i><span class="d-none d-sm-inline">Vencidos</span>
              </button>
            </div>
            
            <div class="btn-group">
              <button 
                class="btn btn-sm" 
                :class="viewMode === 'table' ? 'btn-primary' : 'btn-outline-primary'" 
                @click="viewMode = 'table'"
                aria-label="Ver como tabla"
              >
                <i class="fas fa-table me-1"></i><span class="d-none d-sm-inline">Tabla</span>
              </button>
              <button 
                class="btn btn-sm" 
                :class="viewMode === 'cards' ? 'btn-primary' : 'btn-outline-primary'" 
                @click="viewMode = 'cards'"
                aria-label="Ver como tarjetas"
              >
                <i class="fas fa-th-large me-1"></i><span class="d-none d-sm-inline">Tarjetas</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Content -->
      <div class="card-body p-0">
        <!-- Empty state -->
        <div v-if="filteredAndSortedCupones.length === 0" class="text-center py-5">
          <div class="empty-state-icon mb-3">
            <i class="fas fa-ticket-alt fa-3x text-muted"></i>
          </div>
          <h5 class="text-muted">No se encontraron cupones</h5>
          <p class="text-muted mb-4">
            {{ datos.length > 0 ? 'Intenta con otra búsqueda o limpia los filtros.' : 'Comienza creando un nuevo cupón para ofrecer descuentos a tus clientes.' }}
          </p>
          <div class="d-flex justify-content-center gap-2">
            <button v-if="searchText || statusFilter !== 'all'" class="btn btn-outline-secondary" @click="clearFilters">
              <i class="fas fa-filter-circle-xmark me-2"></i>Limpiar filtros
            </button>
            <button class="btn btn-primary" @click="openModal()">
              <i class="fas fa-plus me-2"></i>Agregar Cupón
            </button>
          </div>
        </div>

        <!-- Table view -->
        <div v-else-if="viewMode === 'table'" class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="bg-light">
              <tr>
                <th class="px-3" style="width: 60px;">
                  <div class="d-flex align-items-center">
                    <span>ID</span>
                    <button 
                      class="btn btn-sm text-primary border-0 p-0 ms-1" 
                      @click="toggleSort('id')"
                      aria-label="Ordenar por ID"
                    >
                      <i class="fas" :class="getSortIcon('id')"></i>
                    </button>
                  </div>
                </th>
                <th class="px-3">
                  <div class="d-flex align-items-center">
                    <span>Código</span>
                    <button 
                      class="btn btn-sm text-primary border-0 p-0 ms-1" 
                      @click="toggleSort('codigo')"
                      aria-label="Ordenar por código"
                    >
                      <i class="fas" :class="getSortIcon('codigo')"></i>
                    </button>
                  </div>
                </th>
                <th class="px-3">
                  <div class="d-flex align-items-center">
                    <span>Descuento</span>
                    <button 
                      class="btn btn-sm text-primary border-0 p-0 ms-1" 
                      @click="toggleSort('descuento')"
                      aria-label="Ordenar por descuento"
                    >
                      <i class="fas" :class="getSortIcon('descuento')"></i>
                    </button>
                  </div>
                </th>
                <th class="px-3">Tipo</th>
                <th class="px-3">
                  <div class="d-flex align-items-center">
                    <span>Vigencia</span>
                    <button 
                      class="btn btn-sm text-primary border-0 p-0 ms-1" 
                      @click="toggleSort('fecha_inicio')"
                      aria-label="Ordenar por fecha"
                    >
                      <i class="fas" :class="getSortIcon('fecha_inicio')"></i>
                    </button>
                  </div>
                </th>
                <th class="px-3">Estado</th>
                <th class="px-3 text-end" style="width: 120px;">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in filteredAndSortedCupones" :key="item.id" :class="{'bg-light': !isActive(item)}">
                <td class="px-3">{{ item.id }}</td>
                <td class="px-3">
                  <div class="d-flex align-items-center">
                    <div class="coupon-icon me-2" :class="{'coupon-icon-expired': !isActive(item)}">
                      <i class="fas fa-ticket-alt"></i>
                    </div>
                    <div>
                      <div class="fw-medium">{{ item.codigo }}</div>
                      <small v-if="isExpiringSoon(item) && isActive(item)" class="text-warning">
                        <i class="fas fa-clock me-1"></i>Vence pronto
                      </small>
                    </div>
                  </div>
                </td>
                <td class="px-3">
                  <span class="badge" :class="getBadgeClass(item)">
                    {{ item.descuento }}{{ item.tipo === 'porcentaje' ? '%' : ' Bs.' }}
                  </span>
                </td>
                <td class="px-3">
                  <span class="badge bg-light text-dark">
                    {{ item.tipo === 'porcentaje' ? 'Porcentaje' : 'Valor fijo' }}
                  </span>
                </td>
                <td class="px-3">
                  <div>
                    <div><i class="fas fa-calendar-day me-1 text-muted"></i>{{ formatDate(item.fecha_inicio) }}</div>
                    <div><i class="fas fa-calendar-check me-1 text-muted"></i>{{ formatDate(item.fecha_fin) }}</div>
                  </div>
                </td>
                <td class="px-3">
                  <span class="badge" :class="isActive(item) ? 'bg-success' : 'bg-danger'">
                    {{ isActive(item) ? 'Activo' : 'Vencido' }}
                  </span>
                </td>
                <td class="px-3 text-end">
                  <div class="btn-group">
                    <button 
                      class="btn btn-sm btn-outline-primary" 
                      @click="duplicateCoupon(item)"
                      aria-label="Duplicar cupón"
                      title="Duplicar cupón"
                    >
                      <i class="fas fa-copy"></i>
                    </button>
                    <button 
                      class="btn btn-sm btn-outline-warning" 
                      @click="showIdCupon(item.id)"
                      aria-label="Editar cupón"
                      title="Editar cupón"
                    >
                      <i class="fas fa-edit"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Cards view -->
        <div v-else class="p-3">
          <div class="row g-3">
            <div class="col-md-6 col-lg-4" v-for="item in filteredAndSortedCupones" :key="item.id">
              <div 
                class="card h-100 border-0 shadow-sm hover-card" 
                :class="{'border-danger border-opacity-25': !isActive(item)}"
              >
                <div class="card-header d-flex justify-content-between align-items-center" 
                     :class="isActive(item) ? 'bg-light' : 'bg-danger bg-opacity-10'">
                  <div class="d-flex align-items-center">
                    <div class="coupon-icon me-2" :class="{'coupon-icon-expired': !isActive(item)}">
                      <i class="fas fa-ticket-alt"></i>
                    </div>
                    <h5 class="card-title mb-0">{{ item.codigo }}</h5>
                  </div>
                  <span class="badge" :class="isActive(item) ? 'bg-success' : 'bg-danger'">
                    {{ isActive(item) ? 'Activo' : 'Vencido' }}
                  </span>
                </div>
                <div class="card-body">
                  <div class="mb-3">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                      <span class="text-muted">Descuento:</span>
                      <span class="badge" :class="getBadgeClass(item)">
                        {{ item.descuento }}{{ item.tipo === 'porcentaje' ? '%' : ' Bs.' }}
                      </span>
                    </div>
                    <div class="d-flex justify-content-between align-items-center mb-2">
                      <span class="text-muted">Tipo:</span>
                      <span class="badge bg-light text-dark">
                        {{ item.tipo === 'porcentaje' ? 'Porcentaje' : 'Valor fijo' }}
                      </span>
                    </div>
                    <div class="d-flex justify-content-between align-items-center">
                      <span class="text-muted">ID:</span>
                      <span class="badge bg-secondary">{{ item.id }}</span>
                    </div>
                  </div>
                  
                  <div class="alert" :class="getAlertClass(item)" role="alert">
                    <div class="d-flex">
                      <div class="me-2">
                        <i class="fas" :class="getAlertIcon(item)"></i>
                      </div>
                      <div>
                        <div class="fw-medium">Vigencia:</div>
                        <div>{{ formatDate(item.fecha_inicio) }} - {{ formatDate(item.fecha_fin) }}</div>
                        <div v-if="isExpiringSoon(item) && isActive(item)" class="text-warning mt-1">
                          <i class="fas fa-exclamation-triangle me-1"></i>Vence en {{ getDaysRemaining(item) }} días
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="card-footer bg-white border-top-0">
                  <div class="d-flex justify-content-between">
                    <button 
                      class="btn btn-sm btn-outline-primary" 
                      @click="duplicateCoupon(item)"
                      aria-label="Duplicar cupón"
                    >
                      <i class="fas fa-copy me-1"></i>Duplicar
                    </button>
                    <button 
                      class="btn btn-sm btn-outline-warning" 
                      @click="showIdCupon(item.id)"
                      aria-label="Editar cupón"
                    >
                      <i class="fas fa-edit me-1"></i>Editar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal para agregar/editar cupón -->
    <div class="modal fade" id="cuponModal" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1"
      aria-labelledby="cuponModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header" :class="posicion ? 'bg-warning bg-opacity-10' : 'bg-primary bg-opacity-10'">
            <h5 class="modal-title" id="cuponModalLabel">
              <i :class="posicion ? 'fas fa-edit me-2' : 'fas fa-plus me-2'"></i>
              {{ posicion ? 'Editar Cupón' : 'Nuevo Cupón' }}
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveCupon" id="cuponForm" class="needs-validation" novalidate>
              <!-- Código del cupón -->
              <div class="mb-4">
                <label for="codigo" class="form-label fw-bold">Código <span class="text-danger">*</span></label>
                <div class="input-group has-validation">
                  <span class="input-group-text bg-light">
                    <i class="fas fa-ticket-alt"></i>
                  </span>
                  <input 
                    type="text" 
                    id="codigo" 
                    v-model="formulario.codigo" 
                    class="form-control" 
                    :class="{ 'is-invalid': errors.codigo }" 
                    placeholder="Ej: VERANO2025"
                    required
                    autocomplete="off"
                  >
                  <button 
                    type="button" 
                    class="btn btn-outline-secondary" 
                    @click="generateRandomCode"
                    aria-label="Generar código aleatorio"
                  >
                    <i class="fas fa-random me-1"></i>Generar
                  </button>
                  <div class="invalid-feedback" v-if="errors.codigo">
                    {{ errors.codigo[0] }}
                  </div>
                </div>
                
                <!-- Opciones del generador de códigos -->
                <div class="code-generator-options mt-3 p-3 bg-light rounded">
                  <div class="d-flex justify-content-between align-items-center mb-2">
                    <h6 class="mb-0">Opciones del generador</h6>
                    <button 
                      type="button" 
                      class="btn btn-sm btn-link p-0" 
                      @click="toggleGeneratorOptions"
                      aria-label="Mostrar/ocultar opciones del generador"
                    >
                      <i class="fas" :class="showGeneratorOptions ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
                    </button>
                  </div>
                  
                  <div v-if="showGeneratorOptions">
                    <div class="mb-2">
                      <div class="form-check form-check-inline">
                        <input 
                          class="form-check-input" 
                          type="radio" 
                          name="codeType" 
                          id="lettersOnly" 
                          v-model="codeOptions.type" 
                          value="letters"
                        >
                        <label class="form-check-label" for="lettersOnly">Solo letras</label>
                      </div>
                      <div class="form-check form-check-inline">
                        <input 
                          class="form-check-input" 
                          type="radio" 
                          name="codeType" 
                          id="numbersOnly" 
                          v-model="codeOptions.type" 
                          value="numbers"
                        >
                        <label class="form-check-label" for="numbersOnly">Solo números</label>
                      </div>
                      <div class="form-check form-check-inline">
                        <input 
                          class="form-check-input" 
                          type="radio" 
                          name="codeType" 
                          id="mixed" 
                          v-model="codeOptions.type" 
                          value="mixed"
                        >
                        <label class="form-check-label" for="mixed">Mixto</label>
                      </div>
                    </div>
                    
                    <div class="d-flex align-items-center mb-2">
                      <label for="codeLength" class="form-label me-2 mb-0">Longitud:</label>
                      <input 
                        type="range" 
                        class="form-range" 
                        min="4" 
                        max="16" 
                        v-model="codeOptions.length" 
                        id="codeLength"
                      >
                      <span class="ms-2 badge bg-primary">{{ codeOptions.length }}</span>
                    </div>
                    
                    <div class="form-check mb-2">
                      <input 
                        class="form-check-input" 
                        type="checkbox" 
                        id="usePrefix" 
                        v-model="codeOptions.usePrefix"
                      >
                      <label class="form-check-label" for="usePrefix">
                        Usar prefijo
                      </label>
                    </div>
                    
                    <div class="input-group mb-2" v-if="codeOptions.usePrefix">
                      <span class="input-group-text bg-light">Prefijo</span>
                      <input 
                        type="text" 
                        class="form-control" 
                        v-model="codeOptions.prefix" 
                        placeholder="Ej: PROMO"
                      >
                    </div>
                    
                    <div class="d-flex justify-content-end">
                      <button 
                        type="button" 
                        class="btn btn-sm btn-primary" 
                        @click="generateRandomCode"
                        aria-label="Generar código con estas opciones"
                      >
                        <i class="fas fa-magic me-1"></i>Generar con estas opciones
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div class="row g-3">
                <!-- Descuento -->
                <div class="col-md-6">
                  <label for="descuento" class="form-label fw-bold">Descuento <span class="text-danger">*</span></label>
                  <div class="input-group has-validation">
                    <span class="input-group-text bg-light">
                      <i class="fas" :class="formulario.tipo === 'porcentaje' ? 'fa-percentage' : 'fa-money-bill-wave'"></i>
                    </span>
                    <input 
                      type="number" 
                      id="descuento" 
                      v-model="formulario.descuento" 
                      class="form-control" 
                      :class="{ 'is-invalid': errors.descuento }" 
                      placeholder="Ej: 10"
                      min="0"
                      :max="formulario.tipo === 'porcentaje' ? 100 : 10000"
                      required
                    >
                    <div class="invalid-feedback" v-if="errors.descuento">
                      {{ errors.descuento[0] }}
                    </div>
                  </div>
                  <small class="text-muted" v-if="formulario.tipo === 'porcentaje'">
                    <i class="fas fa-info-circle me-1"></i>Valor entre 0 y 100
                  </small>
                </div>

                <!-- Tipo -->
                <div class="col-md-6">
                  <label for="tipo" class="form-label fw-bold">Tipo <span class="text-danger">*</span></label>
                  <select 
                    id="tipo" 
                    v-model="formulario.tipo" 
                    class="form-select" 
                    :class="{ 'is-invalid': errors.tipo }"
                    required
                  >
                    <option value="">Seleccione un tipo</option>
                    <option value="porcentaje">Porcentaje (%)</option>
                    <option value="fijo">Valor fijo (Bs.)</option>
                  </select>
                  <div class="invalid-feedback" v-if="errors.tipo">
                    {{ errors.tipo[0] }}
                  </div>
                </div>

                <!-- Fecha Inicio -->
                <div class="col-md-6">
                  <label for="fecha_inicio" class="form-label fw-bold">Fecha Inicio <span class="text-danger">*</span></label>
                  <div class="input-group has-validation">
                    <span class="input-group-text bg-light">
                      <i class="fas fa-calendar-alt"></i>
                    </span>
                    <input 
                      type="date" 
                      id="fecha_inicio" 
                      v-model="formulario.fecha_inicio" 
                      class="form-control" 
                      :class="{ 'is-invalid': errors.fecha_inicio }"
                      :min="getTodayDate()"
                      required
                    >
                    <div class="invalid-feedback" v-if="errors.fecha_inicio">
                      {{ errors.fecha_inicio[0] }}
                    </div>
                  </div>
                </div>

                <!-- Fecha Fin -->
                <div class="col-md-6">
                  <label for="fecha_fin" class="form-label fw-bold">Fecha Fin <span class="text-danger">*</span></label>
                  <div class="input-group has-validation">
                    <span class="input-group-text bg-light">
                      <i class="fas fa-calendar-alt"></i>
                    </span>
                    <input 
                      type="date" 
                      id="fecha_fin" 
                      v-model="formulario.fecha_fin" 
                      class="form-control" 
                      :class="{ 'is-invalid': errors.fecha_fin }"
                      :min="formulario.fecha_inicio || getTodayDate()"
                      required
                    >
                    <div class="invalid-feedback" v-if="errors.fecha_fin">
                      {{ errors.fecha_fin[0] }}
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Vista previa del cupón -->
              <div class="mt-4">
                <h6 class="mb-3">Vista previa del cupón</h6>
                <div class="coupon-preview p-3 border rounded">
                  <div class="d-flex justify-content-between align-items-center mb-2">
                    <div class="d-flex align-items-center">
                      <div class="coupon-icon me-2">
                        <i class="fas fa-ticket-alt"></i>
                      </div>
                      <h5 class="mb-0">{{ formulario.codigo || 'CÓDIGO' }}</h5>
                    </div>
                    <span class="badge" :class="getPreviewBadgeClass()">
                      {{ formulario.descuento || '0' }}{{ formulario.tipo === 'porcentaje' ? '%' : ' Bs.' }}
                    </span>
                  </div>
                  <div class="small text-muted">
                    <div><i class="fas fa-info-circle me-1"></i>Tipo: {{ formulario.tipo === 'porcentaje' ? 'Porcentaje' : formulario.tipo === 'fijo' ? 'Valor fijo' : 'No seleccionado' }}</div>
                    <div><i class="fas fa-calendar-day me-1"></i>Desde: {{ formulario.fecha_inicio ? formatDate(formulario.fecha_inicio) : 'No definido' }}</div>
                    <div><i class="fas fa-calendar-check me-1"></i>Hasta: {{ formulario.fecha_fin ? formatDate(formulario.fecha_fin) : 'No definido' }}</div>
                  </div>
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">
              <i class="fas fa-times me-2"></i>Cancelar
            </button>
            <button 
              type="button" 
              class="btn" 
              :class="posicion ? 'btn-warning' : 'btn-primary'" 
              @click="validateAndSave"
            >
              <i :class="posicion ? 'fas fa-edit me-2' : 'fas fa-save me-2'"></i>
              {{ posicion ? 'Actualizar' : 'Guardar' }}
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Toast de notificación -->
    <div class="position-fixed bottom-0 end-0 p-3" style="z-index: 11">
      <div id="liveToast" class="toast hide" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="toast-header" :class="toastType === 'success' ? 'bg-success text-white' : 'bg-danger text-white'">
          <i class="fas" :class="toastType === 'success' ? 'fa-check-circle me-2' : 'fa-exclamation-circle me-2'"></i>
          <strong class="me-auto">{{ toastTitle }}</strong>
          <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
        <div class="toast-body">
          {{ toastMessage }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { indexCupones, showCupon, storeCupon, updateCupon } from '@/Services/CuponService';
import { Modal, Toast } from 'bootstrap/dist/js/bootstrap.bundle.min';
import { onMounted, ref, computed } from 'vue';
import { format, differenceInDays } from 'date-fns';

// Estado
const formulario = ref({
  codigo: '',
  descuento: '',
  tipo: '',
  fecha_inicio: '',
  fecha_fin: ''
});
const datos = ref([]);
const errors = ref({});
const posicion = ref('');
const searchText = ref('');
const statusFilter = ref('all');
const viewMode = ref(window.innerWidth >= 768 ? 'table' : 'cards');
const sortField = ref('id');
const sortDirection = ref('asc');
const showGeneratorOptions = ref(false);
const toastType = ref('success');
const toastTitle = ref('');
const toastMessage = ref('');

// Configuración del generador de códigos
const codeOptions = ref({
  type: 'mixed',  // 'letters', 'numbers', 'mixed'
  length: 8,
  usePrefix: false,
  prefix: 'PROMO'
});

// Modal y Toast
let cuponModal = null;
let liveToast = null;

// Computed properties
const filteredCupones = computed(() => {
  if (!searchText.value && statusFilter.value === 'all') return datos.value;
  
  let result = datos.value;
  
  // Filtrar por texto de búsqueda
  if (searchText.value) {
    const search = searchText.value.toLowerCase();
    result = result.filter(cupon => {
      return (
        cupon.codigo.toLowerCase().includes(search) ||
        cupon.tipo.toLowerCase().includes(search) ||
        cupon.descuento.toString().includes(search)
      );
    });
  }
  
  // Filtrar por estado
  if (statusFilter.value !== 'all') {
    const isActiveFilter = statusFilter.value === 'active';
    result = result.filter(cupon => isActive(cupon) === isActiveFilter);
  }
  
  return result;
});

const filteredAndSortedCupones = computed(() => {
  // Aplicar ordenamiento a los cupones filtrados
  return filteredCupones.value.sort((a, b) => {
    let valueA, valueB;
    
    switch (sortField.value) {
      case 'codigo':
        valueA = a.codigo.toLowerCase();
        valueB = b.codigo.toLowerCase();
        break;
      case 'descuento':
        valueA = parseFloat(a.descuento);
        valueB = parseFloat(b.descuento);
        break;
      case 'fecha_inicio':
        valueA = new Date(a.fecha_inicio).getTime();
        valueB = new Date(b.fecha_inicio).getTime();
        break;
      case 'id':
      default:
        valueA = a.id;
        valueB = b.id;
    }
    
    if (sortDirection.value === 'asc') {
      return valueA > valueB ? 1 : -1;
    } else {
      return valueA < valueB ? 1 : -1;
    }
  });
});

// Lifecycle hooks
onMounted(() => {
  cuponModal = new Modal(document.getElementById('cuponModal'));
  liveToast = new Toast(document.getElementById('liveToast'));
  
  // Detectar tamaño de pantalla para vista predeterminada
  window.addEventListener('resize', handleResize);
  
  // Cargar cupones
  allCupones();
});

// Métodos
const handleResize = () => {
  // Cambiar automáticamente a vista de tarjetas en móviles
  if (window.innerWidth < 768 && viewMode.value === 'table') {
    viewMode.value = 'cards';
  }
};

const openModal = () => {
  posicion.value = '';
  errors.value = {};
  formulario.value = {
    codigo: '',
    descuento: '',
    tipo: '',
    fecha_inicio: getTodayDate(),
    fecha_fin: ''
  };
  cuponModal.show();
};

const toggleGeneratorOptions = () => {
  showGeneratorOptions.value = !showGeneratorOptions.value;
};

// Generador de códigos aleatorios
const generateRandomCode = () => {
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // Excluye I y O para evitar confusión
  const numbers = '23456789'; // Excluye 0 y 1 para evitar confusión
  
  let characters = '';
  
  switch (codeOptions.value.type) {
    case 'letters':
      characters = letters;
      break;
    case 'numbers':
      characters = numbers;
      break;
    case 'mixed':
    default:
      characters = letters + numbers;
      break;
  }
  
  let result = '';
  const length = parseInt(codeOptions.value.length);
  
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  // Agregar prefijo si está habilitado
  if (codeOptions.value.usePrefix && codeOptions.value.prefix) {
    result = `${codeOptions.value.prefix}-${result}`;
  }
  
  // Verificar si el código ya existe en la lista de cupones
  const codeExists = datos.value.some(cupon => cupon.codigo === result);
  
  if (codeExists) {
    // Si existe, generar otro código recursivamente
    return generateRandomCode();
  }
  
  formulario.value.codigo = result;
};

const validateAndSave = () => {
  // Validar el formulario antes de guardar
  const form = document.getElementById('cuponForm');
  
  if (!form.checkValidity()) {
    form.classList.add('was-validated');
    return;
  }
  
  saveCupon();
};

const saveCupon = async () => {
  errors.value = {};
  try {
    if (posicion.value) {
      const { data } = await updateCupon(posicion.value, formulario.value);
      await allCupones();
      cuponModal.hide();
      showToast('success', 'Cupón actualizado', 'El cupón se ha actualizado correctamente');
    } else {
      const { data } = await storeCupon(formulario.value);
      await allCupones();
      cuponModal.hide();
      showToast('success', 'Cupón creado', 'El cupón se ha creado correctamente');
    }
  } catch (error) {
    if (error.response && error.response.status === 422) {
      errors.value = error.response.data.errors;
    } else {
      console.error('Error al guardar cupón:', error);
      showToast('error', 'Error', 'No se pudo guardar el cupón');
    }
  }
};

const allCupones = async () => {
  try {
    const { data } = await indexCupones();
    datos.value = data.datos;
    showToast('success', 'Datos cargados', 'Los cupones se han cargado correctamente');
  } catch (error) {
    console.error('Error al cargar cupones:', error);
    showToast('error', 'Error', 'No se pudieron cargar los cupones');
  }
};

const showIdCupon = async (id) => {
  try {
    const { data } = await showCupon(id);
    formulario.value = {
      id: data.id,
      codigo: data.codigo,
      descuento: data.descuento,
      tipo: data.tipo,
      fecha_inicio: format(new Date(data.fecha_inicio), 'yyyy-MM-dd'),
      fecha_fin: format(new Date(data.fecha_fin), 'yyyy-MM-dd')
    };
    posicion.value = id;
    cuponModal.show();
  } catch (error) {
    console.error('Error al obtener cupón:', error);
    showToast('error', 'Error', 'No se pudo cargar el cupón');
  }
};

const duplicateCoupon = (cupon) => {
  posicion.value = '';
  errors.value = {};
  
  // Crear una copia del cupón con un nuevo código
  formulario.value = {
    codigo: `${cupon.codigo}-COPY`,
    descuento: cupon.descuento,
    tipo: cupon.tipo,
    fecha_inicio: getTodayDate(),
    fecha_fin: format(new Date(cupon.fecha_fin), 'yyyy-MM-dd')
  };
  
  cuponModal.show();
};

// Función para formatear la fecha
const formatDate = (dateString) => {
  if (!dateString) return ''; // Manejar caso de fecha vacía
  const date = new Date(dateString); // Convertir a objeto Date
  return format(date, 'dd/MM/yyyy'); // Formato deseado
};

// Obtener la fecha actual en formato YYYY-MM-DD
const getTodayDate = () => {
  return format(new Date(), 'yyyy-MM-dd');
};

// Verificar si un cupón está activo
const isActive = (cupon) => {
  const now = new Date();
  const startDate = new Date(cupon.fecha_inicio);
  const endDate = new Date(cupon.fecha_fin);
  endDate.setHours(23, 59, 59); // Incluir todo el día de fin
  return now >= startDate && now <= endDate;
};

// Verificar si un cupón está por vencer (en los próximos 7 días)
const isExpiringSoon = (cupon) => {
  const now = new Date();
  const endDate = new Date(cupon.fecha_fin);
  endDate.setHours(23, 59, 59);
  
  const daysRemaining = differenceInDays(endDate, now);
  return daysRemaining >= 0 && daysRemaining <= 7;
};

// Obtener los días restantes hasta que venza el cupón
const getDaysRemaining = (cupon) => {
  const now = new Date();
  const endDate = new Date(cupon.fecha_fin);
  endDate.setHours(23, 59, 59);
  
  return differenceInDays(endDate, now);
};

// Obtener la clase para el badge de descuento
const getBadgeClass = (cupon) => {
  if (cupon.tipo === 'porcentaje') {
    const descuento = parseFloat(cupon.descuento);
    if (descuento >= 50) return 'bg-danger';
    if (descuento >= 25) return 'bg-warning';
    return 'bg-info';
  }
  return 'bg-primary';
};

// Obtener la clase para el badge de descuento en la vista previa
const getPreviewBadgeClass = () => {
  if (!formulario.value.tipo || !formulario.value.descuento) return 'bg-secondary';
  
  if (formulario.value.tipo === 'porcentaje') {
    const descuento = parseFloat(formulario.value.descuento);
    if (descuento >= 50) return 'bg-danger';
    if (descuento >= 25) return 'bg-warning';
    return 'bg-info';
  }
  return 'bg-primary';
};

// Obtener la clase para la alerta de vigencia
const getAlertClass = (cupon) => {
  if (!isActive(cupon)) return 'alert-danger bg-opacity-25';
  if (isExpiringSoon(cupon)) return 'alert-warning bg-opacity-25';
  return 'alert-success bg-opacity-25';
};

// Obtener el icono para la alerta de vigencia
const getAlertIcon = (cupon) => {
  if (!isActive(cupon)) return 'fa-calendar-times text-danger';
  if (isExpiringSoon(cupon)) return 'fa-clock text-warning';
  return 'fa-calendar-check text-success';
};

// Funciones para ordenamiento
const toggleSort = (field) => {
  if (sortField.value === field) {
    // Si ya estamos ordenando por este campo, cambiar la dirección
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
  } else {
    // Si es un nuevo campo, establecer como ascendente por defecto
    sortField.value = field;
    sortDirection.value = 'asc';
  }
};

const getSortIcon = (field) => {
  if (sortField.value !== field) {
    return 'fa-sort';
  }
  return sortDirection.value === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
};

// Limpiar filtros
const clearFilters = () => {
  searchText.value = '';
  statusFilter.value = 'all';
};

// Función para mostrar notificaciones toast
const showToast = (type, title, message) => {
  toastType.value = type;
  toastTitle.value = title;
  toastMessage.value = message;
  liveToast.show();
};
</script>

<style scoped>
.card {
  transition: box-shadow 0.3s ease-in-out;
  border-radius: 0.5rem;
}

.hover-card {
  transition: all 0.3s ease;
}

.hover-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
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

.modal-header,
.modal-footer {
  padding: 1rem;
}

.modal-body {
  padding: 1.5rem;
}

.invalid-feedback {
  font-size: 0.8rem;
}

/* Estilos para los iconos de cupones */
.coupon-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: rgba(13, 110, 253, 0.1);
  color: var(--bs-primary);
}

.coupon-icon-expired {
  background-color: rgba(220, 53, 69, 0.1);
  color: var(--bs-danger);
}

.fw-medium {
  font-weight: 500;
}

/* Estilos para la vista previa del cupón */
.coupon-preview {
  background-color: #f8f9fa;
  border-radius: 0.5rem;
  transition: all 0.3s ease;
}

.coupon-preview:hover {
  box-shadow: 0 0.25rem 0.5rem rgba(0, 0, 0, 0.1);
}

/* Estilos para el estado vacío */
.empty-state-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: rgba(108, 117, 125, 0.1);
}

/* Animaciones */
.btn {
  transition: all 0.2s ease-in-out;
}

.btn:hover:not(:disabled) {
  transform: translateY(-2px);
}

/* Validación de formulario */
.was-validated .form-control:invalid,
.form-control.is-invalid {
  border-color: #dc3545;
  padding-right: calc(1.5em + 0.75rem);
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12' width='12' height='12' fill='none' stroke='%23dc3545'%3e%3ccircle cx='6' cy='6' r='4.5'/%3e%3cpath stroke-linejoin='round' d='M5.8 3.6h.4L6 6.5z'/%3e%3ccircle cx='6' cy='8.2' r='.6' fill='%23dc3545' stroke='none'/%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right calc(0.375em + 0.1875rem) center;
  background-size: calc(0.75em + 0.375rem) calc(0.75em + 0.375rem);
}

/* Toast personalizado */
.toast-header {
  padding: 0.5rem 0.75rem;
}

.toast-header .btn-close {
  filter: brightness(0) invert(1);
}

/* Estilos para botones deshabilitados */
.btn:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

/* Estilos para la tabla */
.table th, .table td {
  vertical-align: middle;
}

/* Estilos para el generador de códigos */
.code-generator-options {
  transition: all 0.3s ease;
}
</style>