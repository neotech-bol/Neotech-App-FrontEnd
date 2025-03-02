import axios from "axios";
import { Buffer } from "buffer";

// Configuración de URLs base usando variables de entorno
/* export const urlBase = import.meta.env.VITE_API_URL || 'http://neotechbol.test/api/';
export const urlBaseAsset = import.meta.env.VITE_ASSET_URL || 'http://neotechbol.test/';  */
//production
export const urlBase = import.meta.env.VITE_API_URL || 'https://adm.neotechbol.com/api/';
export const urlBaseAsset = import.meta.env.VITE_ASSET_URL || 'https://adm.neotechbol.com/'; 
/* export const urlBase = import.meta.env.VITE_API_URL || 'https://admin.neotechbol.com/api/';
export const urlBaseAsset = import.meta.env.VITE_ASSET_URL || 'https://admin.neotechbol.com/'; */

// Configuración base común para axios
const baseConfig = {
    timeout: 15000,
    headers: {
        Accept: "application/json",
    }
};
// Objeto de caché para almacenar respuestas
const cache = {};
// Función helper para obtener el token
const getToken = () => {
    const storedToken = localStorage.getItem("token");
    return storedToken ? Buffer.from(storedToken, "base64").toString("ascii") : "";
};
// Manejador común de errores
const handleError = (error) => {
    if (error.response?.status === 401) {
        localStorage.clear();
        window.location.href = "/login";
    }
    return Promise.reject(error);
};

// Función para crear interceptor con configuración personalizada
const createInterceptor = (customConfig = {}) => {
    const token = getToken();
    const config = {
        ...baseConfig,
        ...customConfig
    };

    if (token) {
        config.headers = {
            ...config.headers,
            Authorization: `Bearer ${token}`
        };
    }

    const interceptor = axios.create(config);
    
    interceptor.interceptors.response.use(
        response => {
            // Almacena la respuesta en caché
            if (response.config.cache) {
                cache[response.config.url] = response.data;
            }
            return response;
        },
        handleError
    );

    return interceptor;
};
// Función para realizar solicitudes con caché
const fetchWithCache = async (url, config = {}, retries = 5, delay = 1000) => {
    // Verifica si la respuesta está en caché
    if (cache[url]) {
        return { data: cache[url] }; // Devuelve la respuesta de la caché
    }

    try {
        // Realiza la solicitud si no está en caché
        const response = await httpNotToken().get(url, { ...config, cache: true });

        // Manejo de respuesta 204
        if (response.status === 204) {
            return { data: null }; // Devuelve null si no hay contenido
        }

        // Almacena la respuesta en caché
        cache[url] = response.data; // Almacena en caché
        return response;
    } catch (error) {
        // Manejo de error 429
        if (error.response?.status === 429 && retries > 0) {
            console.warn(`Error 429: Too Many Requests. Reintentando en ${delay} ms...`);
            await new Promise(res => setTimeout(res, delay)); // Espera antes de reintentar
            return fetchWithCache(url, config, retries - 1, delay * 2); // Reintenta la solicitud con un retraso exponencial
        }

        // Si se recibe otro error, lanza el error
        throw error; // Lanza el error si no hay más reintentos
    }
};
// Exportación de funciones principales
export const http = () => createInterceptor({
    headers: {
        "Content-Type": "application/json"
    }
});

export const httpAsset = () => createInterceptor({
    headers: {
        "Content-Type": "multipart/form-data"
    }
});

export const httpNotToken = () => createInterceptor();

export const httpDownload = () => createInterceptor({
    headers: {
        "Content-Type": "application/json"
    },
    responseType: 'blob'
});

export const httpDownloadWithoutToken = () => createInterceptor({
    headers: {
        "Content-Type": "application/json"
    },
    responseType: 'blob'
});
// Exporta la función de fetch con caché
export { fetchWithCache }; // Exporta correctamente la función