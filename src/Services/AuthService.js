import { httpNotToken, urlBase } from "./Http";


export const login = (credenciales) => {
    return httpNotToken().post(`${urlBase}login`, credenciales);
}
export const register = (formulario) => {
    return httpNotToken().post(`${urlBase}register`, formulario);
}
// New routes for email verification
export const verifyEmail = (id, hash) => {
    return httpNotToken().get(`${urlBase}email/verify/${id}/${hash}`);
}

export const resendVerificationEmail = () => {
    return httpNotToken().post(`${urlBase}email/verification-notification`);
}