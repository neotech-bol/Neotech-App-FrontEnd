import { http, httpAsset, httpDownload, httpNotToken, urlBase } from "./Http";
export const indexPedidos = () => {
    return http().get(`${urlBase}pedidos`);
}
export const storePedido = (pedido) => {
    return httpAsset().post(`${urlBase}pedido-nuevo`, pedido);
}
export const showPedido = (id) => {
    return http().get(`${urlBase}pedido/${id}`);
}
export const completeOrder = (id) => {
    return http().post(`${urlBase}pedido-complementado/${id}`);
}
export const generateExcel = () => {
    return httpDownload().get(`${urlBase}pedidos/exportar`);
}
export const generaPDFPedidoID = (id) => {
    return httpDownload().get(`${urlBase}pedidos/${id}/pdf`);
}
export const repitOrder = (id) => {
    return httpNotToken().post(`${urlBase}pedidos/${id}/repetir`)
}

export const modelsAll = () => {
    return http().get(`${urlBase}modelos-productos`);
}

export const pdfPedidosCompletados = () => {
    return httpDownload().get(`${urlBase}pedidos/pdf/completados`);
}
export const pdfPedidosPendientes = () => {
    return httpDownload().get(`${urlBase}pedidos/pdf/en-proceso`);
}