import { http, httpNotToken, urlBase } from "./Http"


export const indexCatalogosHistoriales = () => {
    return http().get(`${urlBase}catalogos/historiales`);
}

export const showCatalogosHistoriales = (id) => {
    return httpNotToken().get(`${urlBase}historiales/${id}`);
}

export const changeStatus = (id) => {
    return http().delete(`${urlBase}historiales/${id}`);
}
export const idCatalogoHistorial = () => {
    return httpNotToken().get(`${urlBase}historiales-activos-ids`);
}