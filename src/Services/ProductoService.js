import { http, httpAsset, httpNotToken, urlBase } from "./Http";


export const indexProductos = () => {
    return http().get(`${urlBase}productos`);
}

export const showProducto = (id) => {
    return http().get(`${urlBase}producto/${id}`);
}

export const updateProducto = (id, formulario) => {
    return httpAsset().post(`${urlBase}producto/${id}`, formulario);
}


export const storeProducto = (formulario) => {
    return httpAsset().post(`${urlBase}producto-nuevo`, formulario);
}
export const deleteImage = (idProducto, idImagen) => {
    return http().delete(`${urlBase}productos/${idProducto}/images/${idImagen}`);
}

export const detalleProducto = (idProducto) => {
    return httpNotToken().get(`${urlBase}producto-ver/${idProducto}`);
}