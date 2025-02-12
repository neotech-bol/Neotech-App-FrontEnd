import { http, httpAsset, httpNotToken, urlBase } from "./Http";


export const indexCategorias = () => {
    return http().get(`${urlBase}categorias`);
}

export const storeCategoria = (formulario) => {
    return httpAsset().post(`${urlBase}categoria-nueva`, formulario);
}

export const showCategoria = (id) => {
    return http().get(`${urlBase}categoria/${id}`);
}

export const updateCategoria = (id, formulario) => {
    return httpAsset().post(`${urlBase}categoria/${id}`, formulario);
}

export const destroyCategoria = (id) => {
    return http().delete(`${urlBase}categoria/${id}`);
}

export const indexActivosCategorias = () => {
    return http().get(`${urlBase}categorias-activas`);
}