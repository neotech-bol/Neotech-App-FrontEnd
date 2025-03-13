import { http, httpNotToken, urlBase } from "./Http"

export const login = (credenciales) => {
  return httpNotToken().post(`${urlBase}login`, credenciales)
}

export const register = (formulario) => {
  return httpNotToken().post(`${urlBase}register`, formulario)
}

// Función para reenviar el correo de verificación (usuario autenticado)
export const reenviarVerificacionEmail = () => {
  return http().post(`${urlBase}email/verification-notification`)
}

// Función para solicitar un nuevo enlace de verificación (usuario no autenticado)
export const generarEnlaceVerificacion = (email) => {
  return httpNotToken().post(`${urlBase}email/generate-verification`, { email })
}

// Función para verificar el correo electrónico con el enlace
export const verificarEmail = (id, hash) => {
  return httpNotToken().get(`${urlBase}email/verify/${id}/${hash}`)
}

export const logout = () => {
  return http().post(`${urlBase}logout`)
}

