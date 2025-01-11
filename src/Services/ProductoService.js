import { http, httpAsset, urlBase } from "./Http";


export const indexProductos = () => {
    return http().get(`${urlBase}productos`);
}

export const storeProducto = (formulario) => {
    return httpAsset().post(`${urlBase}producto-nuevo`, formulario);
}