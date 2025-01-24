import { http, urlBase } from "./Http";

export const indexPermisos = () => {
    return http().get(`${urlBase}permisos`);
}
export const indexRoles = () => {
    return http().get(`${urlBase}roles`);
}
export const showRolesAndPermisos = (id) => {
    return http().get(`${urlBase}roles/${id}/permisos`);
}
export const updateRolAndPermisos = (id, formulario) => {
    return http().put(`${urlBase}roles/${id}`, formulario);
}
export const storeRol = (formulario) => {
    return http().post(`${urlBase}rol-nuevo`, formulario);
}
export const destroyRol = (id) => {
    return http().delete(`${urlBase}rol/${id}`);
}