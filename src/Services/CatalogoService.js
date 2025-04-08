import { fetchWithCache, http, httpAsset, httpNotToken, urlBase } from "./Http"

export const indexCatalogos = () => {
    return http().get(`${urlBase}catalogos`)
}
export const storeCatalogo = (formulario) => {
    return httpAsset().post(`${urlBase}catalogo-nuevo`, formulario)
}
export const showCatalogo = (id) => {
    return http().get(`${urlBase}catalogo/${id}`)
}

export const updateCatalogo = (id, formulario) => {
    return httpAsset().post(`${urlBase}catalogo/${id}`, formulario)
}

export const destroyCatalogo = (id) => {
    return http().delete(`${urlBase}catalogo/${id}`)
}
/**
 * Obtiene la lista de catálogos activos
 * @param {Object} params - Parámetros de consulta opcionales
 * @param {boolean} forceRefresh - Si se debe forzar la actualización desde la API
 * @returns {Promise<Object>} - Respuesta con los datos del catálogo
 */
/* export const indexCatalogoItems = (params = {}, forceRefresh = false) => {
    return fetchWithCache(`${urlBase}catalogos-activos`, {
      params,
      forceRefresh,
      cacheTime: 10 * 60 * 1000, // Caché de 10 minutos
    })
  } */
export const indexCatalogoItems = () => {
    return httpNotToken().get(`${urlBase}catalogos-activos`)
}

export const indexCatalogoCategorias = () => {
    return httpNotToken().get(`${urlBase}catalogos-con-categorias`)
}

export const indexCatalogosactives = () => {
    return httpNotToken().get(`${urlBase}catalogos-activos-ids`)
}

export const showCatalogoActive = (id) => {
    return httpNotToken().get(`${urlBase}catalogo-activo/${id}`)
}