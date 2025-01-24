import { http, urlBase } from "./Http";

export const indexUsers = () => {
    return http().get(`${urlBase}usuarios`);
}
export const storeUserAdmin = () => {
    return http().post(`${urlBase}usuario-nuevo`)
}