import { http, urlBase } from "./Http";

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