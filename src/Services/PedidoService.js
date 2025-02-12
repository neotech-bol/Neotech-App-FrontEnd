import { http, urlBase } from "./Http";
export const indexPedidos = () => {
    return http().get(`${urlBase}pedidos`);
}
export const storePedido = (pedido) => {
    return http().post(`${urlBase}pedido-nuevo`, pedido);
}
export const showPedido = (id) => {
    return http().get(`${urlBase}pedido/${id}`);
}