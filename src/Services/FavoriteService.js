import { http, urlBase } from "./Http";

export const indexFavorites = () => {
    return http().get(`${urlBase}favorites`);
}

export const storeFavorite = (formIdProducto) => {
    return http().post(`${urlBase}favorite-nuevo`, formIdProducto);
}
export const removeFavorite = (formIdProducto) => {
    return http().delete(`${urlBase}favorite/${formIdProducto}`);
}