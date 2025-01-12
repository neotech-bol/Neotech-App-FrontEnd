import { http, httpAsset, urlBase } from "./Http";


export const indexProductos = () => {
    return http().get(`${urlBase}productos`);
}

export const showProducto = (id) => {
    return http().get(`${urlBase}producto/${id}`);
}

export const updateProducto = (id, formulario) => {
    return httpAsset().put(`${urlBase}producto/${id}`, formulario);
}


export const storeProducto = (formulario) => {
    return httpAsset().post(`${urlBase}producto-nuevo`, formulario);
}