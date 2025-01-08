import { http, urlBase } from "./Http";

export const indexUsers = () => {
    return http().get(`${urlBase}usuarios`);
}