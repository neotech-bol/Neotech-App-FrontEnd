import { http, httpNotToken, urlBase } from "./Http"

export const indexCatalogos = () => {
    return http().get(`${urlBase}catalogos`)
}
export const storeCatalogo = (formulario) => {
    return http().post(`${urlBase}catalogo-nuevo`, formulario)
}
export const showCatalogo = (id) => {
    return http().get(`${urlBase}catalogo/${id}`)
}

export const updateCatalogo = (id, formulario) => {
    return http().put(`${urlBase}catalogo/${id}`, formulario)
}

export const destroyCatalogo = (id) => {
    return http().delete(`${urlBase}catalogo/${id}`)
}

export const indexCatalogoItems = () => {
    return httpNotToken().get(`${urlBase}catalogos-activos`)
}