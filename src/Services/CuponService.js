import { http, urlBase } from "./Http";

export const indexCupones = () => {
    return http().get(`${urlBase}cupones`);
}

export const showCupon = (id) => {
    return http().get(`${urlBase}cupon/${id}`);
}

export const storeCupon = (cupon) => {
    return http().post(`${urlBase}cupon-nuevo`, cupon);
}

export const updateCupon = (id, cupon) => {
    return http().put(`${urlBase}cupon/${id}`, cupon);
}

export const destroyCupon = (id) => {
    return http().delete(`${urlBase}cupon/${id}`);
}




export const validateCuponBE = (form) => {
    return http().post(`${urlBase}cupon-validar`, form);
}