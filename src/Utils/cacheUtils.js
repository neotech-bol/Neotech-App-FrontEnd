// Configuración de caché
const CACHE_PREFIX = "api_cache_"
const DEFAULT_CACHE_TIME = 5 * 60 * 1000 // 5 minutos en milisegundos

/**
 * Genera una clave de caché única para una URL y parámetros
 * @param {string} url - URL de la solicitud
 * @param {Object} params - Parámetros de consulta
 * @returns {string} - Clave de caché única
 */
export const getCacheKey = (url, params = {}) => {
  const queryParams = new URLSearchParams(params).toString()
  const fullUrl = queryParams ? `${url}?${queryParams}` : url
  return `${CACHE_PREFIX}${fullUrl}`
}

/**
 * Guarda datos en el caché con un tiempo de expiración
 * @param {string} key - Clave de caché
 * @param {any} data - Datos a almacenar
 * @param {number} expirationTime - Tiempo de expiración en milisegundos
 */
export const saveToCache = (key, data, expirationTime = DEFAULT_CACHE_TIME) => {
  const cacheItem = {
    data,
    timestamp: Date.now(),
    expiration: expirationTime,
  }

  try {
    localStorage.setItem(key, JSON.stringify(cacheItem))
  } catch (error) {
    console.warn("Error al guardar en caché:", error)
    // Si localStorage está lleno, limpiar entradas antiguas
    if (
      error instanceof DOMException &&
      (error.name === "QuotaExceededError" || error.name === "NS_ERROR_DOM_QUOTA_REACHED")
    ) {
      clearOldCache()
      try {
        localStorage.setItem(key, JSON.stringify(cacheItem))
      } catch (e) {
        console.error("No se pudo guardar en caché incluso después de limpiar:", e)
      }
    }
  }
}

/**
 * Obtiene datos del caché si existen y no han expirado
 * @param {string} key - Clave de caché
 * @returns {any|null} - Datos almacenados o null si no existen o han expirado
 */
export const getFromCache = (key) => {
  try {
    const cacheItem = JSON.parse(localStorage.getItem(key))

    if (!cacheItem) return null

    // Verificar si el caché ha expirado
    const now = Date.now()
    if (now - cacheItem.timestamp > cacheItem.expiration) {
      localStorage.removeItem(key)
      return null
    }

    return cacheItem.data
  } catch (error) {
    console.warn("Error al leer del caché:", error)
    return null
  }
}

/**
 * Limpia entradas antiguas del caché
 * @param {number} maxAge - Edad máxima en milisegundos
 */
export const clearOldCache = (maxAge = 24 * 60 * 60 * 1000) => {
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

/**
 * Invalida una entrada específica del caché
 * @param {string} url - URL de la solicitud
 * @param {Object} params - Parámetros de consulta
 */
export const invalidateCache = (url, params = {}) => {
  const key = getCacheKey(url, params)
  localStorage.removeItem(key)
}

/**
 * Invalida todo el caché
 */
export const invalidateAllCache = () => {
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith(CACHE_PREFIX)) {
      localStorage.removeItem(key)
    }
  })
}

