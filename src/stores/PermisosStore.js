import { obtenerPermisos } from "@/Services/UsuarioService";
import { defineStore } from "pinia";
import { ref } from 'vue'

export const usePermisoStore = defineStore('permisosUser', () => {
    const permisosUser = ref([]);
    const isLoading = ref(false);
    const error = ref(null);

    const permisos = async () => {
        isLoading.value = true;
        error.value = null;
        
        try {
            const { data } = await obtenerPermisos();
            
            if (data && data.datos) {
                // Asumiendo que data.datos es un array de strings con los permisos
                permisosUser.value = data.datos;
            } else {
                // Si la estructura es diferente, ajusta según sea necesario
                permisosUser.value = [];
                console.error('Formato de datos de permisos inesperado:', data);
            }
            
            console.log('Permisos cargados:', permisosUser.value);
        } catch (err) {
            console.error('Error al obtener permisos:', err);
            error.value = err.message || 'Error al cargar permisos';
            permisosUser.value = [];
        } finally {
            isLoading.value = false;
        }
    }

    // Método para verificar si el usuario tiene un permiso específico
    const hasPermission = (permission) => {
        return permisosUser.value.includes(permission);
    }

    // Método para verificar si el usuario tiene al menos uno de los permisos especificados
    const hasAnyPermission = (permissions) => {
        return permissions.some(permission => permisosUser.value.includes(permission));
    }

    // Método para verificar si el usuario tiene todos los permisos especificados
    const hasAllPermissions = (permissions) => {
        return permissions.every(permission => permisosUser.value.includes(permission));
    }

    return {
        permisosUser,
        isLoading,
        error,
        permisos,
        hasPermission,
        hasAnyPermission,
        hasAllPermissions
    }
})