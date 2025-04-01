import { http, httpNotToken, urlBase } from "./Http";
export const index = () => {
    return http().get(`${urlBase}citas`);
}
export const store = (formulario) => {
    return http().post(`${urlBase}cita-nueva-admin`, formulario);
};
export const show = (id) => {
    return http().get(`${urlBase}cita-ver/${id}`);
}
export const update = (id, formulario) => {
    return http().post(`${urlBase}cita/${id}`, formulario);
}
export const destroy = (id) => {
    return http().delete(`${urlBase}cita/${id}`);
}
export const cambiarEstadoCita = (id) => {
    return http().put(`${urlBase}cita/${id}/estado`);
}
export const storeCitaUser = (formulario) => {
    return httpNotToken().post(`${urlBase}cita-nueva-user`, formulario);
};