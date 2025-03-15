// ===== CONFIGURACIÓN GENERAL DE CACHÉ =====
// Prefijo para identificar las entradas de caché en localStorage
const CACHE_PREFIX = "api_cache_"
// Tiempo predeterminado de expiración de caché: 5 minutos (en milisegundos)
const DEFAULT_CACHE_TIME = 5 * 60 * 1000 // 5 minutos en milisegundos

/**
 * Genera una clave de caché única para una URL y sus parámetros
 * Combina la URL y los parámetros para crear un identificador único
 * 
 * @param {string} url - URL de la solicitud API
 * @param {Object} params - Parámetros de consulta (query params)
 * @returns {string} - Clave de caché única con prefijo para identificación
 */
export const getCacheKey = (url, params = {}) => {
  // Convierte los parámetros a formato de cadena de consulta
  const queryParams = new URLSearchParams(params).toString()
  // Combina URL y parámetros si existen
  const fullUrl = queryParams ? `${url}?${queryParams}` : url
  // Devuelve la clave con el prefijo para identificar entradas de caché
  return `${CACHE_PREFIX}${fullUrl}`
}

/**
 * Almacena datos en el caché (localStorage) con metadatos de tiempo
 * Incluye timestamp y tiempo de expiración para control de validez
 * 
 * @param {string} key - Clave de caché generada por getCacheKey
 * @param {any} data - Datos a almacenar en caché (serán convertidos a JSON)
 * @param {number} expirationTime - Tiempo de expiración en milisegundos
 */
export const saveToCache = (key, data, expirationTime = DEFAULT_CACHE_TIME) => {
  // Crea objeto con datos y metadatos de tiempo
  const cacheItem = {
    data,                    // Datos a almacenar
    timestamp: Date.now(),   // Momento actual de almacenamiento
    expiration: expirationTime, // Duración de validez
  }

  try {
    // Intenta guardar en localStorage como string JSON
    localStorage.setItem(key, JSON.stringify(cacheItem))
  } catch (error) {
    console.warn("Error al guardar en caché:", error)
    
    // Manejo específico para error de cuota excedida (localStorage lleno)
    if (
      error instanceof DOMException &&
      (error.name === "QuotaExceededError" || error.name === "NS_ERROR_DOM_QUOTA_REACHED")
    ) {
      // Si localStorage está lleno, limpia entradas antiguas
      clearOldCache()
      // Intenta guardar nuevamente después de limpiar
      try {
        localStorage.setItem(key, JSON.stringify(cacheItem))
      } catch (e) {
        console.error("No se pudo guardar en caché incluso después de limpiar:", e)
      }
    }
  }
}

/**
 * Recupera datos del caché si existen y no han expirado
 * Verifica la validez temporal de los datos antes de devolverlos
 * 
 * @param {string} key - Clave de caché a buscar
 * @returns {any|null} - Datos almacenados o null si no existen, han expirado o hay error
 */
export const getFromCache = (key) => {
  try {
    // Obtiene y parsea el item de localStorage
    const cacheItem = JSON.parse(localStorage.getItem(key))

    // Si no existe, retorna null
    if (!cacheItem) return null

    // Verifica si el caché ha expirado comparando timestamps
    const now = Date.now()
    if (now - cacheItem.timestamp > cacheItem.expiration) {
      // Si expiró, elimina la entrada y retorna null
      localStorage.removeItem(key)
      return null
    }

    // Si es válido, retorna los datos almacenados
    return cacheItem.data
  } catch (error) {
    // Manejo de errores al leer o parsear
    console.warn("Error al leer del caché:", error)
    return null
  }
}

/**
 * Limpia entradas antiguas del caché para liberar espacio
 * Útil para evitar que localStorage se llene completamente
 * 
 * @param {number} maxAge - Edad máxima permitida en milisegundos (por defecto 24 horas)
 */
export const clearOldCache = (maxAge = 24 * 60 * 60 * 1000) => {
  // Obtiene el timestamp actual
  const now = Date.now()

  // Recorre todas las claves en localStorage
  Object.keys(localStorage).forEach((key) => {
    // Solo procesa las que pertenecen a nuestro sistema de caché
    if (key.startsWith(CACHE_PREFIX)) {
      try {
        // Obtiene y parsea el item
        const cacheItem = JSON.parse(localStorage.getItem(key))
        // Si es más antiguo que maxAge, lo elimina
        if (now - cacheItem.timestamp > maxAge) {
          localStorage.removeItem(key)
        }
      } catch (e) {
        // Si hay error al parsear (datos corruptos), elimina la entrada
        localStorage.removeItem(key)
      }
    }
  })
}

/**
 * Invalida (elimina) una entrada específica del caché
 * Útil cuando se sabe que los datos para una URL específica han cambiado
 * 
 * @param {string} url - URL de la solicitud cuyo caché se quiere invalidar
 * @param {Object} params - Parámetros de consulta asociados a la URL
 */
export const invalidateCache = (url, params = {}) => {
  // Genera la clave de caché para la URL y parámetros
  const key = getCacheKey(url, params)
  // Elimina la entrada del localStorage
  localStorage.removeItem(key)
}

/**
 * Invalida (elimina) todas las entradas de caché de la aplicación
 * Útil para limpiar completamente el caché, por ejemplo al cerrar sesión
 */
export const invalidateAllCache = () => {
  // Recorre todas las claves en localStorage
  Object.keys(localStorage).forEach((key) => {
    // Solo elimina las que pertenecen a nuestro sistema de caché
    if (key.startsWith(CACHE_PREFIX)) {
      localStorage.removeItem(key)
    }
  })
}