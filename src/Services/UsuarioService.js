import { http, httpNotToken, urlBase } from "./Http";

export const indexUsers = (search) => {
    return http().get(`${urlBase}usuarios?search=${search}`);
}
export const storeUserAdmin = (formulario) => {
    return http().post(`${urlBase}usuario-nuevo`, formulario)
}
export const showUser = (id) => {
    return http().get(`${urlBase}usuario/${id}`)
}
export const updateUser = (id, formulario) => {
    return http().put(`${urlBase}usuario/${id}`, formulario)
}

export const changeStatus = (id) => {
    return http().delete(`${urlBase}usuario/${id}`)
}
// Función para obtener el usuario autenticado con filtro opcional
export const userAutenticado = (filtro = null) => {
    let params = '';
    
    // Agregar parámetro de filtro si existe
    if (filtro && filtro !== 'todos') {
        const estadoValue = filtro === 'entregados' ? '1' : '0';
        params = `?estado=${estadoValue}`;
    }
    
    return httpNotToken().get(`${urlBase}usuario-autenticado${params}`);
};
export const updateDeparatamento = (form) => {
    return httpNotToken().post(`${urlBase}usuario/departamento`, form)
}
export const updateUserWeb = (formulario) => {
    return http().put(`${urlBase}usuario-edit`, formulario)
}

//Servicio Obtener permisos
export const obtenerPermisos = () => {
    return http().get(`${urlBase}usuario-permiso`);
}

export const updateDatosInfoUser = (formulario) => {
    return http().put(`${urlBase}user/update-basic-info`, formulario)
}