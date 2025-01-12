import axios from "axios";
import { Buffer } from "buffer";
/* export const urlBase = 'http://neotechbol.test/api/';
export const urlBaseAsset = 'http://neotechbol.test/'; */
export const urlBase = 'http://neotech-app-backend.test/api/';
export const urlBaseAsset = 'http://neotech-app-backend.test/';
export const http = () => {
	let token = "";
	if (localStorage.getItem("token") != null) {
		token = Buffer.from(localStorage.getItem("token"), "base64").toString(
			"ascii"
		);
	}

	const interceptor = axios.create({
		headers: {
			Accept: "application/json",
			"Content-Type": "application/json",
			Authorization: `Bearer ${token}`,
		},
		timeout: 15000,
	});
	interceptor.interceptors.response.use(
		function (response) {
			return response;
		},
		function (error) {
			if (error.response.status == 401) {
				localStorage.clear();
				window.location.href = "/login";
			}
			return Promise.reject(error);
		}
	);
	return interceptor;
};
export const httpAsset = () => {
	let token = "";
	if (localStorage.getItem("token") != null) {
		token = Buffer.from(localStorage.getItem("token"), "base64").toString(
			"ascii"
		);
	}
	const interceptor = axios.create({
		headers: {
			Accept: "application/json",
			"Content-Type": "multipart/form-data",
			Authorization: `Bearer ${token}`,
		},
		timeout: 15000,
	});
	interceptor.interceptors.response.use(
		function (response) {
			return response;
		},
		function (error) {
			if (error.response.status == 401) {
				localStorage.clear();
				window.location.href = "/login";
			}
			return Promise.reject(error);
		}
	);
	return interceptor;
};


export const httpNotToken = () => {
	const interceptor = axios.create({
		timeout: 15000,
	});
	interceptor.interceptors.response.use(
		function (response) {
			return response;
		},

	);
	return interceptor;
};
export const httpDownload = () => {
	let token = "";
	if (localStorage.getItem("token") != null) {
		token = Buffer.from(localStorage.getItem("token"), "base64").toString("ascii");
	}

	const interceptor = axios.create({
		headers: {
			Accept: "application/json",
			"Content-Type": "application/json",
			Authorization: `Bearer ${token}`,
		},
		responseType: 'blob', // Configura el tipo de respuesta para descargar blobs
		timeout: 15000,
	});

	interceptor.interceptors.response.use(
		function (response) {
			return response;
		},
		function (error) {
			if (error.response && error.response.status === 401) {
				localStorage.clear();
				window.location.href = "/login";
			}
			return Promise.reject(error);
		}
	);

	return interceptor;
};
// Nueva función para descargar archivos sin headers de autorización
export const httpDownloadWithoutToken = () => {
	const interceptor = axios.create({
		headers: {
			Accept: "application/json",
			"Content-Type": "application/json",
		},
		responseType: 'blob', // Configura el tipo de respuesta para descargar blobs
		timeout: 15000,
	});

	interceptor.interceptors.response.use(
		function (response) {
			return response;
		},
		function (error) {
			// Manejo de errores, puedes personalizarlo según tus necesidades
			return Promise.reject(error);
		}
	);

	return interceptor;
};
