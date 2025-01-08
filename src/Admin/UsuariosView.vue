<template>
    <div class="container">
        <div class="row">
            <div class="col-12">
                <div class="card">
                    <div class="card-header bg-primary-subtle">
                        <span class="card-title h4">Usuarios</span>
                    </div>
                    <div class="card-body">
                        <div class="row gy-4">
                            <div class="col-12 col-md-8">
                                <input type="text" class="form-control" placeholder="Buscar usuario">
                            </div>
                            <div class="col-12 col-md-4 text-center">
                                <button class="btn btn-primary">Agregar <i class="fas fa-plus"></i></button>
                            </div>
                            <div class="col-12">
                                <div class="table-responsive">
                                    <table class="table table-striped table-hover">
                                        <thead class="table-primary">
                                            <tr class="text-center">
                                                <th>Id</th>
                                                <th>Nombre</th>
                                                <th>Correo electrónico</th>
                                                <th>CI</th>
                                                <th>Direccion</th>
                                                <th>Edad</th>
                                                <th>Telefono</th>
                                                <th>Genero</th>
                                                <th>Rol</th>
                                                <th>Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr v-for="(item, index) in datos" :key="item.id" class="text-center"> 
                                                <td>{{ item.id }}</td>
                                                <td>{{ item.nombre }} {{ item.apellido }}</td>
                                                <td>{{ item.email }}</td>     
                                                <td>{{ item.ci }}</td>
                                                <td>{{ item.direccion }}</td>
                                                <td>{{ item.edad }}</td>
                                                <td>{{ item.telefono }}</td>
                                                <td>{{ item.genero }}</td>
                                                <td>{{ item.roles[0]?.name }}</td>
                                                <td>
                                                    <div class="btn-group">
                                                        <button class="btn btn-sm btn-warning">Editar</button>
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
</template>
<script setup>
import { indexUsers } from '@/Services/UsuarioService';
import { onMounted, ref } from 'vue';
onMounted(() => {
    listarUsuarios();
})
const datos = ref([]);
const listarUsuarios = async () => {
    try {
        const {data} = await indexUsers();
        datos.value = data.datos.data;
        console.log(datos.value);
    } catch (error) {
        console.log(error);
    }
}
</script>
<style>
    
</style>