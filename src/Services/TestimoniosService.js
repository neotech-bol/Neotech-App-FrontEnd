import { urlBase, http, httpNotToken } from "./Http";
export function indexTestimonios(page, search = '', estado = '') {
    return http().get(`${urlBase}testimonios`, {
        params: {
            page,
            search,
            estado
        }
    });
}
export function storeTestimonio(data) {
  return httpNotToken().post(`${urlBase}testimonio-nuevo`, data);
}

export function updateTestimonio(id, data) {
    return http().put(`${urlBase}testimonio/${id}`, data);
}

export function cambiarEstadoTestimonio(id, data) {
    return http().put(`${urlBase}testimonio/${id}/estado`, data);
}
export function showTestimonio(id) {
    return http().get(`${urlBase}testimonio/${id}`);
}

export function indexTestimoniosActivos() {
    return httpNotToken().get(`${urlBase}testimonios-activos`);
}