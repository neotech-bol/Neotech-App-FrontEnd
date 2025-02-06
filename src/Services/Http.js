import axios from "axios";
import { Buffer } from "buffer";

// Configuración de URLs base usando variables de entorno
export const urlBase = import.meta.env.VITE_API_URL || 'http://neotechbol.test/api/';
export const urlBaseAsset = import.meta.env.VITE_ASSET_URL || 'http://neotechbol.test/';

// Configuración base común para axios
const baseConfig = {
    timeout: 15000,
    headers: {
        Accept: "application/json",
    }
};

// Función helper para obtener el token
const getToken = () => {
    const storedToken = localStorage.getItem("token");
    return storedToken ? Buffer.from(storedToken, "base64").toString("ascii") : "";
};

// Manejador común de errores
const handleError = (error) => {
    if (error.response?.status === 402) {
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
        response => response,
        handleError
    );

    return interceptor;
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
