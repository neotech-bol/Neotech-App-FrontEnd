import { httpNotToken } from "@/Services/Http"

// Prefijo para las claves de caché
const CACHE_PREFIX = "api_cache_"

// Función para generar una clave de caché única
const getCacheKey = (url, params = {}) => {
  const queryParams = new URLSearchParams(params).toString()
  const fullUrl = queryParams ? `${url}?${queryParams}` : url
  return `${CACHE_PREFIX}${fullUrl}`
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
    try {
      const cachedData = localStorage.getItem(cacheKey)

      if (cachedData) {
        const { data, timestamp } = JSON.parse(cachedData)
        const now = Date.now()

        // Verificar si el caché ha expirado
        if (now - timestamp < cacheTime) {
          console.log(`Usando datos en caché para: ${url}`)
          return { data, fromCache: true }
        } else {
          // Caché expirado, eliminar
          localStorage.removeItem(cacheKey)
        }
      }
    } catch (error) {
      console.warn("Error al leer del caché:", error)
      // Si hay un error al leer del caché, continuar con la solicitud
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
    try {
      localStorage.setItem(
        cacheKey,
        JSON.stringify({
          data: response.data,
          timestamp: Date.now(),
        }),
      )
    } catch (error) {
      console.warn("Error al guardar en caché:", error)
      // Si localStorage está lleno, limpiar entradas antiguas
      if (
        error instanceof DOMException &&
        (error.name === "QuotaExceededError" || error.name === "NS_ERROR_DOM_QUOTA_REACHED")
      ) {
        clearOldCache()
      }
    }

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

// Función para limpiar entradas antiguas del caché
const clearOldCache = (maxAge = 24 * 60 * 60 * 1000) => {
  // Por defecto 24 horas
  const now = Date.now()

  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith(CACHE_PREFIX)) {
      try {
        const cacheItem = JSON.parse(localStorage.getItem(key))
        if (now - cacheItem.timestamp > maxAge) {
          localStorage.removeItem(key)
        }
      } catch (e) {
        // Si hay un error al parsear, eliminar la entrada
        localStorage.removeItem(key)
      }
    }
  })
}

// Función para invalidar una entrada específica del caché
export const invalidateCache = (url, params = {}) => {
  const cacheKey = getCacheKey(url, params)
  localStorage.removeItem(cacheKey)
}

// Función para invalidar todo el caché
export const invalidateAllCache = () => {
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith(CACHE_PREFIX)) {
      localStorage.removeItem(key)
    }
  })
}

export default fetchWithCache

