import { fetchWithCache, http, httpAsset, httpNotToken, urlBase } from "./Http";

// Obtener todos los productos con paginación
export const indexProductos = (page = 1) => {
    return http().get(`${urlBase}productos?page=${page}`)
  }
  
  // Obtener todos los productos con filtros y paginación
  export const indexProductosFiltrados = (categoria_id = null, search = null, page = 1) => {
    let url = `${urlBase}productos?page=${page}`
  
    if (categoria_id && categoria_id !== "") {
      url += `&categoria_id=${categoria_id}`
    }
  
    if (search && search.length >= 2) {
      url += `&search=${encodeURIComponent(search)}`
    }
  
    return http().get(url)
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

export const recientesProductos = async () => {
    return await httpNotToken().get(`${urlBase}productos-recientes`);
}


export const filtrosProductos = (categoriaID, catalogoID, search) => {
    return httpNotToken().get(`${urlBase}productos/filtrar?categoria_id=${categoriaID}&catalogo_id=${catalogoID}&search=${search}`);
}

export const changeStatus = (idProducto) => {
  return http().delete(`${urlBase}producto/${idProducto}`);
}