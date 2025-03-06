<template>
  <div class="container-fluid py-4">
    <div class="card shadow">
      <div
        class="card-header bg-primary bg-opacity-10 d-flex justify-content-between align-items-center flex-wrap gap-3 p-3">
        <h2 class="card-title h4 m-0">Gestión de Cupones</h2>
        <div>
          <button class="btn btn-primary" @click="openModal()">
            <i class="fas fa-plus me-2"></i>Agregar Cupón
          </button>
        </div>
      </div>
      <div class="card-body p-0">
        <div class="p-3">
          <div class="input-group mb-3">
            <span class="input-group-text bg-light">
              <i class="fas fa-search"></i>
            </span>
            <input type="text" class="form-control" placeholder="Buscar por código, tipo..." v-model="searchText">
          </div>
        </div>

        <!-- Table for larger screens -->
        <div class="table-responsive d-none d-md-block">
          <table class="table table-hover align-middle mb-0">
            <thead class="bg-light">
              <tr class="text-center">
                <th>ID</th>
                <th>Código</th>
                <th>Descuento</th>
                <th>Tipo</th>
                <th>Fecha Inicio</th>
                <th>Fecha Fin</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="filteredCupones.length === 0">
                <td colspan="8" class="text-center py-4 text-muted">No hay cupones registrados</td>
              </tr>
              <tr v-for="(item, index) in filteredCupones" :key="item.id" class="text-center">
                <td>{{ index + 1 }}</td>
                <td>{{ item.codigo }}</td>
                <td>
                  <span class="badge bg-info">{{ item.descuento }}{{ item.tipo === 'porcentaje' ? '%' : ' Bs.' }}</span>
                </td>
                <td>{{ item.tipo === 'porcentaje' ? 'Porcentaje' : 'Valor fijo' }}</td>
                <td>{{ formatDate(item.fecha_inicio) }}</td>
                <td>{{ formatDate(item.fecha_fin) }}</td>
                <td>
                  <span class="badge" :class="isActive(item) ? 'bg-success' : 'bg-danger'">
                    {{ isActive(item) ? 'Activo' : 'Vencido' }}
                  </span>
                </td>
                <td>
                  <div class="btn-group">
                    <button class="btn btn-sm btn-outline-warning" @click="showIdCupon(item.id)">
                      <i class="fas fa-edit me-1"></i><span class="d-none d-lg-inline">Editar</span>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Cards for mobile view -->
        <div class="d-md-none">
          <div v-if="filteredCupones.length === 0" class="text-center py-4 text-muted">
            <div class="mb-3">
              <i class="fas fa-ticket-alt fa-3x text-muted"></i>
            </div>
            <h5 class="text-muted">No hay cupones registrados</h5>
            <p class="text-muted">Los cupones aparecerán aquí cuando se creen</p>
          </div>
          <div v-for="(item, index) in filteredCupones" :key="item.id" class="card mb-3 mx-3">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <h5 class="card-title mb-0">{{ item.codigo }}</h5>
                <span class="badge" :class="isActive(item) ? 'bg-success' : 'bg-danger'">
                  {{ isActive(item) ? 'Activo' : 'Vencido' }}
                </span>
              </div>
              <p class="card-text">
                <strong>Descuento:</strong> {{ item.descuento }}{{ item.tipo === 'porcentaje' ? '%' : ' Bs.' }}<br>
                <strong>Tipo:</strong> {{ item.tipo === 'porcentaje' ? 'Porcentaje' : 'Valor fijo' }}<br>
                <strong>Vigencia:</strong> {{ formatDate(item.fecha_inicio) }} - {{ formatDate(item.fecha_fin) }}
              </p>
              <div class="d-flex justify-content-end">
                <button class="btn btn-sm btn-outline-warning" @click="showIdCupon(item.id)">
                  <i class="fas fa-edit me-1"></i>Editar
                </button>
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
            <form @submit.prevent="saveCupon">
              <div class="row g-3">
                <div class="col-12">
                  <label for="codigo" class="form-label">Código <span class="text-danger">*</span></label>
                  <div class="input-group">
                    <span class="input-group-text bg-light">
                      <i class="fas fa-ticket-alt"></i>
                    </span>
                    <input type="text" id="codigo" v-model="formulario.codigo" class="form-control"
                      :class="{ 'is-invalid': errors.codigo }" placeholder="Ej: VERANO2025">
                    <button type="button" class="btn btn-outline-secondary" @click="generateRandomCode">
                      <i class="fas fa-random me-1"></i>Generar
                    </button>
                  </div>
                  <div class="invalid-feedback d-block" v-if="errors.codigo">
                    <i class="fas fa-exclamation-circle me-1"></i>{{ errors.codigo[0] }}
                  </div>
                  <div class="mt-2">
                    <div class="form-check form-check-inline">
                      <input class="form-check-input" type="radio" name="codeType" id="lettersOnly" 
                        v-model="codeOptions.type" value="letters">
                      <label class="form-check-label" for="lettersOnly">Solo letras</label>
                    </div>
                    <div class="form-check form-check-inline">
                      <input class="form-check-input" type="radio" name="codeType" id="numbersOnly" 
                        v-model="codeOptions.type" value="numbers">
                      <label class="form-check-label" for="numbersOnly">Solo números</label>
                    </div>
                    <div class="form-check form-check-inline">
                      <input class="form-check-input" type="radio" name="codeType" id="mixed" 
                        v-model="codeOptions.type" value="mixed">
                      <label class="form-check-label" for="mixed">Mixto</label>
                    </div>
                  </div>
                  <div class="d-flex align-items-center mt-2">
                    <label for="codeLength" class="form-label me-2 mb-0">Longitud:</label>
                    <input type="range" class="form-range" min="4" max="16" v-model="codeOptions.length" id="codeLength">
                    <span class="ms-2">{{ codeOptions.length }}</span>
                  </div>
                  <div class="form-check mt-2">
                    <input class="form-check-input" type="checkbox" id="usePrefix" v-model="codeOptions.usePrefix">
                    <label class="form-check-label" for="usePrefix">
                      Usar prefijo
                    </label>
                  </div>
                  <div class="input-group mt-2" v-if="codeOptions.usePrefix">
                    <span class="input-group-text bg-light">Prefijo</span>
                    <input type="text" class="form-control" v-model="codeOptions.prefix" placeholder="Ej: PROMO">
                  </div>
                </div>

                <div class="col-md-6">
                  <label for="descuento" class="form-label">Descuento <span class="text-danger">*</span></label>
                  <div class="input-group">
                    <span class="input-group-text bg-light">
                      <i class="fas fa-percentage"></i>
                    </span>
                    <input type="number" id="descuento" v-model="formulario.descuento" class="form-control"
                      :class="{ 'is-invalid': errors.descuento }" placeholder="Ej: 10">
                  </div>
                  <div class="invalid-feedback d-block" v-if="errors.descuento">
                    <i class="fas fa-exclamation-circle me-1"></i>{{ errors.descuento[0] }}
                  </div>
                </div>

                <div class="col-md-6">
                  <label for="tipo" class="form-label">Tipo <span class="text-danger">*</span></label>
                  <select id="tipo" v-model="formulario.tipo" class="form-select"
                    :class="{ 'is-invalid': errors.tipo }">
                    <option value="">Seleccione un tipo</option>
                    <option value="porcentaje">Porcentaje</option>
                    <option value="fijo">Valor fijo</option>
                  </select>
                  <div class="invalid-feedback d-block" v-if="errors.tipo">
                    <i class="fas fa-exclamation-circle me-1"></i>{{ errors.tipo[0] }}
                  </div>
                </div>

                <div class="col-md-6">
                  <label for="fecha_inicio" class="form-label">Fecha Inicio <span class="text-danger">*</span></label>
                  <div class="input-group">
                    <span class="input-group-text bg-light">
                      <i class="fas fa-calendar-alt"></i>
                    </span>
                    <input type="date" id="fecha_inicio" v-model="formulario.fecha_inicio" class="form-control"
                      :class="{ 'is-invalid': errors.fecha_inicio }">
                  </div>
                  <div class="invalid-feedback d-block" v-if="errors.fecha_inicio">
                    <i class="fas fa-exclamation-circle me-1"></i>{{ errors.fecha_inicio[0] }}
                  </div>
                </div>

                <div class="col-md-6">
                  <label for="fecha_fin" class="form-label">Fecha Fin <span class="text-danger">*</span></label>
                  <div class="input-group">
                    <span class="input-group-text bg-light">
                      <i class="fas fa-calendar-alt"></i>
                    </span>
                    <input type="date" id="fecha_fin" v-model="formulario.fecha_fin" class="form-control"
                      :class="{ 'is-invalid': errors.fecha_fin }">
                  </div>
                  <div class="invalid-feedback d-block" v-if="errors.fecha_fin">
                    <i class="fas fa-exclamation-circle me-1"></i>{{ errors.fecha_fin[0] }}
                  </div>
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">
              <i class="fas fa-times me-2"></i>Cancelar
            </button>
            <button type="button" class="btn" :class="posicion ? 'btn-warning' : 'btn-primary'" @click="saveCupon()">
              <i :class="posicion ? 'fas fa-edit me-2' : 'fas fa-save me-2'"></i>
              {{ posicion ? 'Actualizar' : 'Guardar' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { indexCupones, showCupon, storeCupon, updateCupon } from '@/Services/CuponService';
import { Modal } from 'bootstrap/dist/js/bootstrap.bundle.min';
import { onMounted, ref, computed } from 'vue';
import { format } from 'date-fns';

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
// Configuración del generador de códigos
const codeOptions = ref({
  type: 'mixed',  // 'letters', 'numbers', 'mixed'
  length: 8,
  usePrefix: false,
  prefix: 'PROMO'
});

// Modal
let cuponModal = null;

// Computed
const filteredCupones = computed(() => {
  if (!searchText.value) return datos.value;

  const search = searchText.value.toLowerCase();
  return datos.value.filter(cupon => {
    return (
      cupon.codigo.toLowerCase().includes(search) ||
      cupon.tipo.toLowerCase().includes(search)
    );
  });
});

// Lifecycle hooks
onMounted(() => {
  cuponModal = new Modal(document.getElementById('cuponModal'));
  allCupones();
});

// Métodos
const openModal = () => {
  posicion.value = '';
  errors.value = {};
  formulario.value = {
    codigo: '',
    descuento: '',
    tipo: '',
    fecha_inicio: '',
    fecha_fin: ''
  };
  cuponModal.show();
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
const saveCupon = async () => {
  errors.value = {};
  try {
    if (posicion.value) {
      const { data } = await updateCupon(posicion.value, formulario.value);
      console.log(data);
      await allCupones();
      cuponModal.hide();
    } else {
      const { data } = await storeCupon(formulario.value);
      console.log(data);
      await allCupones();
      cuponModal.hide();
    }
  } catch (error) {
    if (error.response && error.response.status === 422) {
      errors.value = error.response.data.errors;
    } else {
      console.log(error);
    }
  }
};

const allCupones = async () => {
  try {
    const { data } = await indexCupones();
    datos.value = data.datos;
    console.log(datos.value);
  } catch (error) {
    console.log(error);
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
    console.log(data);
  } catch (error) {
    console.log(error);
  }
};

// Función para formatear la fecha
const formatDate = (dateString) => {
  if (!dateString) return ''; // Manejar caso de fecha vacía
  const date = new Date(dateString); // Convertir a objeto Date
  return format(date, 'dd/MM/yyyy'); // Formato deseado
};

// Verificar si un cupón está activo
const isActive = (cupon) => {
  const now = new Date();
  const startDate = new Date(cupon.fecha_inicio);
  const endDate = new Date(cupon.fecha_fin);
  return now >= startDate && now <= endDate;
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
</style>