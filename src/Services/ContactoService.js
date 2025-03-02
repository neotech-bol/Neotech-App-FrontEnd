import { http,urlBase,httpDownload } from "./Http";
export const index = (page) => {
    return http().get(`${urlBase}contacto?page=${page}`);
}
export const store = (formulario) => {
    return http().post(`${urlBase}contacto-nuevo`, formulario);
}
export const eliminarContacto = (id) => {
    return http().delete(`${urlBase}contacto/${id}`);
}
export const generarPDF = () => {
    return httpDownload().get(`${urlBase}contactos/pdf`);
}
export const generarExcel = () => {
    return httpDownload().get(`${urlBase}contactos/excel`);
}