import { obtenerPermisos } from "@/services/UserService";
import { defineStore } from "pinia";
import { ref } from 'vue'
export const usePermisoStore = defineStore('permisosUser', () => {
    const permisosUser = ref([]);
    const permisos = async () => {
        try {
            const { data } = await obtenerPermisos();
            permisosUser.value = data.datos;
            console.log(permisosUser.value);
        } catch (error) {
            console.log(error);
        }
    }
    return {
        permisosUser,
        permisos
    }
})