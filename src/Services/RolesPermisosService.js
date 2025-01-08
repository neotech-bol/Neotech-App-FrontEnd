import { http, urlBase } from "./Http";

export const indexRoles = () => {
    return http().get(`${urlBase}roles`);
}
export const storeRol = (formulario) => {
    return http().post(`${urlBase}rol-nuevo`, formulario);
}
export const destroyRol = (id) => {
    return http().delete(`${urlBase}rol/${id}`);
}