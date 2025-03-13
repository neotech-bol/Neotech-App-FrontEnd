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

// Configuración de URLs base usando variables de entorno
/* export const urlBase = import.meta.env.VITE_API_URL || "http://neotechbol.test/api/"
export const urlBaseAsset = import.meta.env.VITE_ASSET_URL || "http://neotechbol.test/" */
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
  },
}

// Función helper para obtener el token
const getToken = () => {
  const storedToken = localStorage.getItem("token")
  return storedToken ? Buffer.from(storedToken, "base64").toString("ascii") : ""
}

// Manejador común de errores
const handleError = (error) => {
  if (error.response?.status === 401) {
    localStorage.clear()
    window.location.href = "/login"
  }
  return Promise.reject(error)
}

// Función para crear interceptor con configuración personalizada
const createInterceptor = (customConfig = {}) => {
  const token = getToken()
  const config = {
    ...baseConfig,
    ...customConfig,
  }

  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    }
  }

  const interceptor = axios.create(config)

  interceptor.interceptors.response.use((response) => response, handleError)

  return interceptor
}

/**
 * Realiza una solicitud HTTP GET con soporte de caché persistente
 * @param {string} url - URL de la solicitud
 * @param {Object} options - Opciones de configuración
 * @returns {Promise<Object>} - Respuesta de la solicitud
 */
const fetchWithCache = async (url, options = {}) => {
  const {
    params = {},
    forceRefresh = false,
    cacheTime = 5 * 60 * 1000, // 5 minutos por defecto
    retries = 3,
    delay = 1000,
    ...config
  } = options

  const cacheKey = getCacheKey(url, params)

  // Si no se fuerza la actualización, intentar obtener del caché
  if (!forceRefresh) {
    const cachedData = getFromCache(cacheKey)
    if (cachedData) {
      console.log(`Usando datos en caché para: ${url}`)
      return { data: cachedData, fromCache: true }
    }
  }

  try {
    // Realizar la solicitud si no está en caché o se fuerza la actualización
    const response = await httpNotToken().get(url, {
      ...config,
      params,
    })

    // Manejo de respuesta 204
    if (response.status === 204) {
      return { data: null, fromCache: false }
    }

    // Almacenar en caché
    saveToCache(cacheKey, response.data, cacheTime)

    return { ...response, fromCache: false }
  } catch (error) {
    // Manejo de error 429 (Too Many Requests)
    if (error.response?.status === 429 && retries > 0) {
      console.warn(`Error 429: Too Many Requests. Reintentando en ${delay} ms...`)
      await new Promise((res) => setTimeout(res, delay))

      // Reintentar con menos reintentos y mayor retraso
      return fetchWithCache(url, {
        ...options,
        retries: retries - 1,
        delay: delay * 2,
      })
    }

    throw error
  }
}

// Exportación de funciones principales
export const http = () =>
  createInterceptor({
    headers: {
      "Content-Type": "application/json",
    },
  })

export const httpAsset = () =>
  createInterceptor({
    headers: {
      "Content-Type": "multipart/form-data",
    },
  })

export const httpNotToken = () => createInterceptor()

export const httpDownload = () =>
  createInterceptor({
    headers: {
      "Content-Type": "application/json",
    },
    responseType: "blob",
  })

export const httpDownloadWithoutToken = () =>
  createInterceptor({
    headers: {
      "Content-Type": "application/json",
    },
    responseType: "blob",
  })

// Exporta la función de fetch con caché y funciones relacionadas
export { fetchWithCache, invalidateCache, invalidateAllCache, clearOldCache }

