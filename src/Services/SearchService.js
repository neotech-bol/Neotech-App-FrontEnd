import { httpNotToken, urlBase } from "./Http";
export const searchProductoCategoriaCatalogo = (query) => {
    return httpNotToken.get(`${urlBase}search?q=${encodeURIComponent(query)}`);
};