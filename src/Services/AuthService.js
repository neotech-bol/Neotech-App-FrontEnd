import { http, urlBase } from "./Http";


export const login = (credenciales) => {
    return http().post(`${urlBase}login`, credenciales);
}
export const register = (credenciales) => {
    return http().post(`${urlBase}register`, credenciales);
}