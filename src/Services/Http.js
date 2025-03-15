import axios from "axios"
import { Buffer } from "buffer"
import {
  getCacheKey,
  getFromCache,
  saveToCache,
  invalidateCache,
  invalidateAllCache,
  clearOldCache,
} from "@/Utils/cacheUtils"

// ===== CONFIGURACIÓN DE URLS BASE =====
// Define URLs base para API y assets usando variables de entorno con valores por defecto
// Estas URLs se utilizan en toda la aplicación para todas las peticiones API
// Las URLs se configuran en los archivos .env (ver abajo para la configuración de .env)

// Para entorno de desarrollo local
//export const urlBase = import.meta.env.VITE_API_URL || "http://neotechbol.test/api/"
//export const urlBaseAsset = import.meta.env.VITE_ASSET_URL || "http://neotechbol.test/" 

// Para entornos de producción (comentados, descomentar según sea necesario)
// Opción 1: subdominio adm
export const urlBase = import.meta.env.VITE_API_URL || 'https://adm.neotechbol.com/api/';
export const urlBaseAsset = import.meta.env.VITE_ASSET_URL || 'https://adm.neotechbol.com/';   

// Opción 2: subdominio admin
// export const urlBase = import.meta.env.VITE_API_URL || 'https://admin.neotechbol.com/api/';
// export const urlBaseAsset = import.meta.env.VITE_ASSET_URL || 'https://admin.neotechbol.com/'; 

// ===== CONFIGURACIÓN BASE DE AXIOS =====
// Configuración común para todas las instancias de axios
const baseConfig = {
  timeout: 15000, // 15 segundos de tiempo límite para todas las peticiones
  headers: {
    Accept: "application/json", // Cabecera Accept por defecto
  },
}

// ===== GESTIÓN DE TOKENS =====
/**
 * Obtiene el token de autenticación desde localStorage
 * El token se almacena en formato base64 y se decodifica antes de usarlo
 * @returns {string} El token de autenticación decodificado o cadena vacía si no se encuentra
 */
const getToken = () => {
  const storedToken = localStorage.getItem("token")
  return storedToken ? Buffer.from(storedToken, "base64").toString("ascii") : ""
}

// ===== MANEJO DE ERRORES =====
/**
 * Manejador global de errores para todas las peticiones axios
 * Maneja errores 401 No Autorizado limpiando localStorage y redirigiendo al login
 * @param {Error} error - El objeto de error de axios
 * @returns {Promise} Promesa rechazada con el error
 */
const handleError = (error) => {
  if (error.response?.status === 401) {
    // Si no está autorizado, limpia todo el almacenamiento local y redirige al login
    localStorage.clear()
    window.location.href = "/login"
  }
  return Promise.reject(error)
}

// ===== FÁBRICA DE INTERCEPTORES AXIOS =====
/**
 * Crea una instancia de axios con configuración personalizada e interceptores
 * Añade automáticamente el token de autenticación si está disponible
 * @param {Object} customConfig - Configuración personalizada de axios para fusionar con la configuración base
 * @returns {AxiosInstance} Instancia de axios configurada
 */
const createInterceptor = (customConfig = {}) => {
  const token = getToken()
  const config = {
    ...baseConfig,
    ...customConfig,
  }

  // Añade cabecera de autorización si existe el token
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    }
  }

  // Crea instancia de axios con la configuración fusionada
  const interceptor = axios.create(config)

  // Añade interceptor de respuesta para manejo global de errores
  interceptor.interceptors.response.use((response) => response, handleError)

  return interceptor
}

// ===== IMPLEMENTACIÓN DE PETICIONES CON CACHÉ =====
/**
 * Realiza una petición HTTP GET con soporte de caché persistente
 * Características: caché, forzar actualización, tiempo de caché configurable, reintentos automáticos
 * 
 * @param {string} url - URL de la petición
 * @param {Object} options - Opciones de configuración
 * @param {Object} options.params - Parámetros de URL
 * @param {boolean} options.forceRefresh - Si se debe omitir la caché
 * @param {number} options.cacheTime - Duración de la caché en milisegundos
 * @param {number} options.retries - Número de intentos de reintento para errores 429
 * @param {number} options.delay - Retraso entre reintentos en milisegundos
 * @returns {Promise<Object>} Respuesta con datos y estado de caché
 */
const fetchWithCache = async (url, options = {}) => {
  const {
    params = {},
    forceRefresh = false,
    cacheTime = 5 * 60 * 1000, // 5 minutos de tiempo de caché por defecto
    retries = 3,
    delay = 1000,
    ...config
  } = options

  // Genera clave de caché única basada en URL y parámetros
  const cacheKey = getCacheKey(url, params)

  // Intenta obtener datos de la caché si no se fuerza la actualización
  if (!forceRefresh) {
    const cachedData = getFromCache(cacheKey)
    if (cachedData) {
      console.log(`Usando datos en caché para: ${url}`)
      return { data: cachedData, fromCache: true }
    }
  }

  try {
    // Realiza la petición si no está en caché o se fuerza la actualización
    const response = await httpNotToken().get(url, {
      ...config,
      params,
    })

    // Maneja respuesta 204 Sin Contenido
    if (response.status === 204) {
      return { data: null, fromCache: false }
    }

    // Almacena respuesta en caché
    saveToCache(cacheKey, response.data, cacheTime)

    return { ...response, fromCache: false }
  } catch (error) {
    // Maneja limitación de tasa (429 Demasiadas Peticiones)
    if (error.response?.status === 429 && retries > 0) {
      console.warn(`Error 429: Demasiadas peticiones. Reintentando en ${delay} ms...`)
      await new Promise((res) => setTimeout(res, delay))

      // Reintenta con retroceso exponencial
      return fetchWithCache(url, {
        ...options,
        retries: retries - 1,
        delay: delay * 2, // Duplica el retraso para cada reintento
      })
    }

    throw error
  }
}

// ===== CLIENTES HTTP ESPECIALIZADOS =====

/**
 * Cliente HTTP estándar con tipo de contenido JSON y autenticación
 * Usar para la mayoría de peticiones API que envían y reciben JSON
 */
export const http = () =>
  createInterceptor({
    headers: {
      "Content-Type": "application/json",
    },
  })

/**
 * Cliente HTTP para subida de archivos con multipart/form-data
 * Usar cuando se suben archivos o datos de formulario con archivos
 */
export const httpAsset = () =>
  createInterceptor({
    headers: {
      "Content-Type": "multipart/form-data",
    },
  })

/**
 * Cliente HTTP sin token de autenticación
 * Usar para endpoints API públicos que no requieren autenticación
 */
export const httpNotToken = () => createInterceptor()

/**
 * Cliente HTTP para descargar archivos con autenticación
 * La respuesta se devuelve como un Blob para descargas de archivos
 */
export const httpDownload = () =>
  createInterceptor({
    headers: {
      "Content-Type": "application/json",
    },
    responseType: "blob",
  })

/**
 * Cliente HTTP para descargar archivos sin autenticación
 * Usar para descargas de archivos públicos que no requieren autenticación
 */
export const httpDownloadWithoutToken = () =>
  createInterceptor({
    headers: {
      "Content-Type": "application/json",
    },
    responseType: "blob",
  })

// Exporta funciones relacionadas con la caché para usar en otras partes de la aplicación
export { fetchWithCache, invalidateCache, invalidateAllCache, clearOldCache }