<template>
    <div class="container">
        <div class="row">
            <div class="col-12 col-md-12 col-sm-12">
                <div class="card">
                    <div class="card-header bg-primary-subtle">
                        <span class="card-title h3">Cupones</span>
                    </div>
                    <div class="card-body">
                        <div class="row gy-4">
                            <div class="col-12 col-md-8">
                                <input type="text" class="form-control">
                            </div>
                            <div class="col-12 col-md-4 text-center">
                                <button type="button" class="btn btn-primary" @click="openModal()">Agregar</button>
                            </div>
                            <div class="col-12">
                                <div class="table-responsive">
                                    <table class="table table-hover table-striped">
                                        <thead class="table-primary">
                                            <tr class="text-center">
                                                <th>ID</th>
                                                <th>Codigo</th>
                                                <th>Descuento</th>
                                                <th>tipo</th>
                                                <th>fecha_inicio</th>
                                                <th>fecha_fin</th>
                                                <th>Opciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr v-if="datos.length === 0">
                                                <td colspan="12" class="text-center text-danger">No hay roles
                                                    registrados</td>
                                            </tr>
                                            <tr v-for="(item, index) in datos" :key="item.id" class="text-center">
                                                <td>{{ index + 1}}</td>
                                                <td>{{ item.codigo }}</td>
                                                <td>{{ item.descuento }} %</td>
                                                <td>{{ item.tipo }}</td>
                                                <td>{{ formatDate(item.fecha_inicio)  }}</td>
                                                <td>{{ formatDate(item.fecha_fin) }}</td>
                                                <td>
                                                    <div class="btn-group">
                                                        <button type="button" class="btn btn-warning" @click="showIdCupon(item.id)">Editar</button>
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
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header" :class="posicion != '' ? 'bg-warning' : 'bg-primary'">
                    <h1 class="modal-title fs-5" id="staticBackdropLabel">{{ posicion != '' ? 'Editar registro' : 'Nuevo registro' }}</h1>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="row gy-4">
                        <div class="col-12">
                            <!-- <label for="codigo" class="form-label fw-bold">Codigo<i class="text-danger">*</i></label> -->
                            <input type="text" id="codigo" v-model="formulario.codigo" class="form-control" :class="{ 'border-danger': errors.codigo }" placeholder="Código">
                            <small class="text-danger fst-italic text-xs" v-if="errors.codigo"><i
                                class="fas fa-times me-1"></i>{{ errors.codigo[0] }}</small>
                        </div>
                        <div class="col-12">
                            <input type="number" v-model="formulario.descuento" class="form-control" :class="{ 'border-danger': errors.descuento }" placeholder="Descuento">
                            <small class="text-danger fst-italic text-xs" v-if="errors.descuento"><i
                                class="fas fa-times me-1"></i>{{ errors.descuento[0] }}</small>
                        </div>
                        <div class="col-12">
                            <select v-model="formulario.tipo" class="form-select" :class="{ 'border-danger': errors.tipo }">
                                <option value="">Seleccione un tipo</option>
                                <option value="porcentaje">Porcentaje</option>
                                <option value="fijo">Valor fijo</option>
                            </select>
                            <small class="text-danger fst-italic text-xs" v-if="errors.tipo"><i
                                class="fas fa-times me-1"></i>{{ errors.tipo[0] }}</small>
                        </div>
                        <div class="col-12">
                            <input type="date" v-model="formulario.fecha_inicio" class="form-control" :class="{ 'border-danger': errors.fecha_inicio }">
                            <small class="text-danger fst-italic text-xs" v-if="errors.fecha_inicio"><i
                                class="fas fa-times me-1"></i>{{ errors.fecha_inicio[0] }}</small>
                        </div>
                        <div class="col-12">
                            <input type="date" v-model="formulario.fecha_fin" class="form-control" :class="{ 'border-danger': errors.fecha_fin }">
                            <small class="text-danger fst-italic text-xs" v-if="errors.fecha_fin"><i
                                class="fas fa-times me-1"></i>{{ errors.fecha_fin[0] }}</small>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-danger" data-bs-dismiss="modal">Cerrar</button>
                    <button type="button" class="btn" :class="posicion != '' ? 'btn-warning' : 'btn-primary'" @click="saveCupon()">{{ posicion != '' ? 'Editar' : 'Guardar' }}</button>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup>
import { indexCupones, showCupon, storeCupon, updateCupon } from '@/Services/CuponService';
import { Modal } from 'bootstrap/dist/js/bootstrap.bundle.min';
import { onMounted, ref } from 'vue';
import { format } from 'date-fns'; // Importar la función format
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
//Modal
let modal = null;
let instanciaModal = null;
onMounted(() => {
  modal = document.getElementById('staticBackdrop');
  instanciaModal = new Modal(modal);
  allCupones();
})
 
const openModal = () => {
    posicion.value = '';
    errors.value = {};
    formulario.value = {
        codigo: '',
        descuento: '',
        tipo: '',
        fecha_inicio: '',
        fecha_fin: ''
    }
    instanciaModal.show();
}

const saveCupon = async () => {
    try {
        if (posicion.value != '') {
            const {data} = await updateCupon(posicion.value, formulario.value);
            console.log(data);
            instanciaModal.hide();
        } else {
            const {data} = await storeCupon(formulario.value);
            console.log(data);
            instanciaModal.hide();
        }
    } catch (error) {
        if (error.response.status == 422) {
            errors.value = error.response.data.errors;
        } else {
            console.log(error);
        }
    }
}
const allCupones = async () => {
    try {
        const {data} = await indexCupones();
        datos.value = data.datos;
        console.log(datos.value);
    } catch (error) {
        console.log(error);
    }
}

const showIdCupon = async (id) => {
    try {
        const {data} = await showCupon(id);
        formulario.value = {
            id: data.id,
            codigo: data.codigo,
            descuento: data.descuento,
            tipo: data.tipo,
            fecha_inicio: format(new Date(data.fecha_inicio), 'yyyy-MM-dd'),
            fecha_fin: format(new Date(data.fecha_fin), 'yyyy-MM-dd')
        };
        posicion.value = id;
        instanciaModal.show();
        console.log(data);
    } catch (error) {
        console.log(error);
    }
}

// Función para formatear la fecha
const formatDate = (dateString) => {
    if (!dateString) return ''; // Manejar caso de fecha vacía
    const date = new Date(dateString); // Convertir a objeto Date
    return format(date, 'dd/MM/yyyy'); // Formato deseado
}
</script>
<style></style>