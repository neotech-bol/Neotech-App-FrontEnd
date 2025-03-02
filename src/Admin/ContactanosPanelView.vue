<template>
    <div class="container">
        <div class="row">
            <div class="col-12 mt-4">
                <div class="card">
                    <div class="card-header bg-success-subtle">
                        <h2 class="card-title">Contactos</h2>
                    </div>
                    <div class="card-body">
                        <div class="row gy-4">
                            <div class="col-12 col-md-8">
                                <input type="text" class="form-control" placeholder="Buscar...">
                            </div>
                            <div class="col-12 col-md-4 text-center">
                                <div class="btn-group">
                                    <button type="button" class="btn btn-danger" @click="generatePDF()">Generar PDF</button>
                                    
                                    <button type="button" class="btn btn-success" @click="generateExcel()">Generar Excel</button>
                                </div>
                            </div>
                            <div class="table-responsive">
                                <table class="table table-hover table-striped">
                                    <thead class="table-success">
                                        <tr>
                                            <th>ID</th>
                                            <th>Nombre completo</th>
                                            <th>Correo electrónico</th>
                                            <th>Teléfono</th>
                                            <th>Mensaje</th>
                                            <th>Acción</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-if="datos.length === 0">
                                            <td colspan="12" class="text-center text-danger alert alert-danger">
                                                No se encuentran datos disponibles
                                            </td>
                                        </tr>
                                        <tr v-for="(item, index) in datos" :key="item.id">
                                            <td>{{ index + 1 }}</td>
                                            <td>{{ item.nombre_completo }}</td>
                                            <td>{{ item.correo }}</td>
                                            <td>{{ item.telefono }}</td>
                                            <td>{{ item.mensaje }}</td>
                                            <td>
                                                <div class="btn-group">
                                                    <button type="button" class="btn btn-danger"
                                                        @click="deleteMensaje(item.id)">🗑</button>
                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                                <div class="col-12" v-if="datos.length > 0">
                                        <nav aria-label="Page navigation example">
                                            <ul class="pagination justify-content-center">
                                                <li class="page-item">
                                                    <button type="button" class="page-link"
                                                        :class="!paginacion.paginaAnterior ? 'disabled' : ''"
                                                        aria-label="Previous" @click="paginaAnterior">
                                                        <span aria-hidden="true">&laquo;</span>
                                                    </button>
                                                </li>
                                                <li class="page-item">
                                                    <button type="button" class="page-link bg-gray-700">
                                                        {{ paginacion.paginaActual }} de {{ totalPaginas }}
                                                    </button>
                                                </li>
                                                <li class="page-item">
                                                    <button type="button" class="page-link"
                                                        :class="!paginacion.paginaSiguiente ? 'disabled' : ''"
                                                        aria-label="Next" @click="paginaSiguiente">
                                                        <span aria-hidden="true">&raquo;</span>
                                                    </button>
                                                </li>
                                            </ul>
                                        </nav>
                                    </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup>
import { eliminarContacto, generarExcel, generarPDF, index } from '@/services/ContactoService';
import { onMounted, ref } from 'vue';
import { Modal } from 'bootstrap/dist/js/bootstrap.min';
onMounted(() => {
    listar();

})
const datos = ref([]);
const paginacion = ref({
    paginaActual: 1,
    paginaAnterior: null,
    paginaSiguiente: null
});
const totalPaginas = ref(0); // Nueva referencia para el total de páginas
const listar = async () => {
    try {
        const { data } = await index(paginacion.value.paginaActual);
        datos.value = data.datos.data
        paginacion.value.paginaAnterior = data.datos.prev_page_url;
        paginacion.value.paginaSiguiente = data.datos.next_page_url;
        totalPaginas.value = data.datos.last_page; // Asigna el total de páginas
    } catch (error) {
        console.log(error);
    }
}
const paginaSiguiente = async () => {
    if (paginacion.value.paginaSiguiente != null) {
        paginacion.value.paginaActual++;
        listar();
    }
}
const paginaAnterior = async () => {
    if (paginacion.value.paginaAnterior != null) {
        paginacion.value.paginaActual--;
        listar();
    }
}
const deleteMensaje = async (param) => {
    try {
        const { data } = await eliminarContacto(param);
        listar();
    } catch (error) {
        console.log(error);
    }
}
// Función para generar y descargar el PDF
const generatePDF = async () => {
    try {
        const response = await generarPDF();
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'contactos.pdf'); // Nombre del archivo a descargar
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url); // Liberar el objeto URL
    } catch (error) {
        console.error("Error generando el PDF:", error);
        // Aquí puedes mostrar un mensaje de error al usuario si lo deseas
    }
};
const generateExcel = async () => {
    try {
        const response = await generarExcel();
    // Crea un objeto URL a partir de la respuesta
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'contactos.xlsx'); // Nombre del archivo a descargar
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url); // Liberar el objeto URL
    } catch (error) {
        console.log(error);
    }
}
</script>
<style scoped>
</style>