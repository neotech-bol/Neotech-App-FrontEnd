import { http, urlBase } from "./Http";

/**
 * Guarda una nueva calificación para un producto
 * @param {Object} ratings - Datos de la calificación (producto_id, rating, comment)
 * @returns {Promise} - Promesa con la respuesta del servidor
 */
export const storeRating = (ratings) => {
    return http().post(`${urlBase}ratings`, ratings);
};

/**
 * Obtiene todas las calificaciones del usuario autenticado
 * @returns {Promise} - Promesa con la lista de calificaciones
 */
export const indexRatings = () => {
    return http().get(`${urlBase}ratings`);
};

/**
 * Actualiza una calificación existente
 * @param {number} id - ID de la calificación a actualizar
 * @param {Object} ratings - Nuevos datos de la calificación
 * @returns {Promise} - Promesa con la respuesta del servidor
 */
export const updateRating = (id, ratings) => {
    return http().put(`${urlBase}ratings/${id}`, ratings);
};

/**
 * Obtiene estadísticas detalladas de calificación para un producto específico
 * @param {number} productoId - ID del producto
 * @returns {Promise} - Promesa con las estadísticas de calificación
 */
export const getProductRatingStats = (productoId) => {
    return http().get(`${urlBase}products/${productoId}/ratings/stats`);
};

/**
 * Ruta alternativa para obtener estadísticas de calificación
 * @param {number} productoId - ID del producto
 * @returns {Promise} - Promesa con las estadísticas de calificación
 */
export const getProductRatingStatsAlt = (productoId) => {
    return http().get(`${urlBase}ratings/product/${productoId}/stats`);
};