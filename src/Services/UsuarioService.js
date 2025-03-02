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
//user autenticado
 export const userAutenticado = () => {
    return httpNotToken().get(`${urlBase}usuario-autenticado`)
}
 
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
