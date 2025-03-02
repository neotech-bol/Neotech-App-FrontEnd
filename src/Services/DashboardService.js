import { http, urlBase } from "./Http";


//Pedidos
export const totalPedidos = () => {
    return http().get(`${urlBase}pedidos/total`);
}
export const totalEnProcesoPedidos = () => {
    return http().get(`${urlBase}pedidos/total/en-proceso`);
}
export const totalCompletadosPedidos = () => {
    return http().get(`${urlBase}pedidos/total/completados`);
}
//Usuarios

export const totalUsers = () => {
    return http().get(`${urlBase}usuarios/total`);
}
export const totalUsersActives = () => {
    return http().get(`${urlBase}usuarios/total/activos`);
}
export const totalUsersInactives = () => {
    return http().get(`${urlBase}usuarios/total/inactivos`);
}
