import { http, httpAsset, httpDownload, httpNotToken, urlBase } from "./Http";

// Obtener todos los pedidos con filtros opcionales y paginación
export const indexPedidos = (
    searchText = "", // Texto de búsqueda opcional
    status = "all", // Estado del pedido (todos, completados, pendientes, etc.)
    sortField = "created_at", // Campo por el cual se ordenan los resultados
    sortDirection = "desc", // Dirección del ordenamiento (ascendente o descendente)
    page = 1, // Número de página para la paginación
) => {
    let url = `${urlBase}pedidos?page=${page}`; // Base de la URL para obtener pedidos

    // Añadir parámetros de búsqueda si se proporcionan
    if (searchText && searchText.trim() !== "") {
        url += `&search=${encodeURIComponent(searchText)}`; // Codificar y añadir el texto de búsqueda
    }

    // Añadir parámetros de filtro por estado
    if (status !== "all") {
        url += `&status=${status}`; // Añadir el estado si no es "todos"
    }

    // Añadir parámetros de ordenamiento
    url += `&sort_field=${sortField}&sort_direction=${sortDirection}`; // Añadir el campo y dirección de ordenamiento

    return http().get(url); // Realizar la solicitud GET a la URL construida
}

// Almacenar un nuevo pedido
export const storePedido = (pedido) => {
    return httpAsset().post(`${urlBase}pedido-nuevo`, pedido); // Realizar una solicitud POST para crear un nuevo pedido
}

// Obtener los detalles de un pedido específico por ID
export const showPedido = (id) => {
    return http().get(`${urlBase}pedido/${id}`); // Realizar una solicitud GET para obtener un pedido por su ID
}

// Completar un pedido específico por ID
export const completeOrder = (id) => {
    return http().post(`${urlBase}pedido-complementado/${id}`); // Realizar una solicitud POST para marcar un pedido como completado
}

// Generar un archivo Excel con todos los pedidos
export const generateExcel = () => {
    return httpDownload().get(`${urlBase}pedidos/exportar`); // Realizar una solicitud GET para exportar pedidos a Excel
}

// Generar un PDF de un pedido específico por ID
export const generaPDFPedidoID = (id) => {
    return httpDownload().get(`${urlBase}pedidos/${id}/pdf`); // Realizar una solicitud GET para generar un PDF de un pedido por su ID
}

// Repetir un pedido específico por ID
export const repitOrder = (id) => {
    return httpNotToken().post(`${urlBase}pedidos/${id}/repetir`); // Realizar una solicitud POST para repetir un pedido
}

// Obtener todos los modelos de productos
export const modelsAll = () => {
    return http().get(`${urlBase}modelos-productos`); // Realizar una solicitud GET para obtener todos los modelos de productos
}

// Generar un PDF de todos los pedidos completados
export const pdfPedidosCompletados = () => {
    return httpDownload().get(`${urlBase}pedidos/pdf/completados`); // Realizar una solicitud GET para generar un PDF de pedidos completados
}

// Generar un PDF de todos los pedidos pendientes
export const pdfPedidosPendientes = () => {
    return httpDownload().get(`${urlBase}pedidos/pdf/en-proceso`); // Realizar una solicitud GET para generar un PDF de pedidos pendientes
}
// Generar un PDF de todos los pedidos de un catálogo específico
export const pdfPedidosCatalogo = (catalogoId) => {
    return httpDownload().get(`${urlBase}pedidos/catalogo/${catalogoId}/pdf`); // Realizar una solicitud GET para generar un PDF de pedidos de un catálogo específico
}