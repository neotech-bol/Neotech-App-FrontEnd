import { http, urlBase } from "./Http";


export const indexCategorias = () => {
    return http().get(`${urlBase}categorias`);
}

export const storeCategoria = (formulario) => {
    return http().post(`${urlBase}categoria-nueva`, formulario);
}

export const showCategoria = (id) => {
    return http().get(`${urlBase}categoria/${id}`);
}

export const updateCategoria = (id, formulario) => {
    return http().put(`${urlBase}categoria/${id}`, formulario);
}

export const destroyCategoria = (id) => {
    return http().delete(`${urlBase}categoria/${id}`);
}

export const indexActivosCategorias = () => {
    return http().get(`${urlBase}categorias-activas`);
}