import { http, urlBase } from "./Http";
export const storeRating = (Ratings) => {
    return http().post(`${urlBase}ratings`, Ratings);
}
export const indexRatings = () => {
    return http().get(`${urlBase}ratings`);
}
export const updateRating = (id, ratings) => {
    return http().put(`${urlBase}ratings/${id}`, ratings);
}