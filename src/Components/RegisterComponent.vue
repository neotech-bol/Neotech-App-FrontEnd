<template>
	<div class="bg-gradient min-vh-100 d-flex align-items-center py-5">
		<div class="container">
			<div class="row justify-content-center">
				<div class="col-12 col-md-10 col-lg-8 col-xl-6">
					<div class="card bg-white shadow-lg rounded-lg overflow-hidden">
						<div class="card-header bg-primary text-white text-center py-4">
							<h2 class="h3 mb-0">Registro de Usuario</h2>
						</div>
						<div class="card-body p-4 p-md-5">
							<p class="text-muted text-center mb-4">Complete sus datos para registrarse</p>

							<form>
								<div class="row g-3">
									<div class="col-md-6">
										<div class="form-floating mb-3">
											<input type="text" class="form-control"
												:class="{ 'is-invalid': errors?.nombre }" id="nombre"
												v-model="formulario.nombre" placeholder="Nombre" required>
											<label for="nombre">👤 Nombre</label>
											<div class="invalid-feedback" v-if="errors.nombre">
												<i class="fas fa-exclamation-circle me-1"></i>{{ errors.nombre?.[0] }}
											</div>
										</div>
									</div>

									<div class="col-md-6">
										<div class="form-floating mb-3">
											<input type="text" class="form-control"
												:class="{ 'is-invalid': errors?.apellido }" id="apellido"
												v-model="formulario.apellido" placeholder="Apellido" required>
											<label for="apellido">👤 Apellido</label>
											<div class="invalid-feedback" v-if="errors.apellido">
												<i class="fas fa-exclamation-circle me-1"></i>{{ errors.apellido?.[0] }}
											</div>
										</div>
									</div>

									<div class="col-md-6">
										<div class="form-floating mb-3">
											<input type="text" class="form-control"
												:class="{ 'is-invalid': errors?.ci }" id="ci" v-model="formulario.ci"
												placeholder="CI" required>
											<label for="ci">🪪 CI</label>
											<div class="invalid-feedback" v-if="errors.ci">
												<i class="fas fa-exclamation-circle me-1"></i>{{ errors.ci?.[0] }}
											</div>
										</div>
									</div>

									<div class="col-md-6">
										<div class="form-floating mb-3">
											<input type="text" class="form-control"
												:class="{ 'is-invalid': errors?.nit }" id="nit" v-model="formulario.nit"
												placeholder="NIT">
											<label for="nit">🏢 NIT</label>
											<div class="invalid-feedback" v-if="errors.nit">
												<i class="fas fa-exclamation-circle me-1"></i>{{ errors.nit?.[0] }}
											</div>
										</div>
									</div>

									<div class="col-12">
										<div class="form-floating mb-3">
											<input type="text" class="form-control"
												:class="{ 'is-invalid': errors?.direccion }" id="direccion"
												v-model="formulario.direccion" placeholder="Dirección" required>
											<label for="direccion">📍 Dirección</label>
											<div class="invalid-feedback" v-if="errors.direccion">
												<i class="fas fa-exclamation-circle me-1"></i>{{ errors.direccion?.[0]
												}}
											</div>
										</div>
									</div>

									<div class="col-md-6">
										<div class="form-floating mb-3">
											<input type="tel" class="form-control"
												:class="{ 'is-invalid': errors?.telefono }" id="telefono"
												v-model="formulario.telefono" placeholder="Teléfono" required>
											<label for="telefono">📱 Teléfono</label>
											<div class="invalid-feedback" v-if="errors.telefono">
												<i class="fas fa-exclamation-circle me-1"></i>{{ errors.telefono?.[0] }}
											</div>
										</div>
									</div>

									<div class="col-md-6">
										<div class="form-floating mb-3">
											<input type="number" class="form-control"
												:class="{ 'is-invalid': errors?.edad }" id="edad"
												v-model="formulario.edad" placeholder="Edad" required>
											<label for="edad">🎂 Edad</label>
											<div class="invalid-feedback" v-if="errors.edad">
												<i class="fas fa-exclamation-circle me-1"></i>{{ errors.edad?.[0] }}
											</div>
										</div>
									</div>

									<div class="col-md-6">
										<div class="form-floating mb-3">
											<select class="form-select" :class="{ 'is-invalid': errors?.genero }"
												id="genero" v-model="formulario.genero" required>
												<option value="">Seleccione</option>
												<option value="M">Masculino</option>
												<option value="F">Femenino</option>
												<option value="O">Otro</option>
											</select>
											<label for="genero">⚥ Género</label>
											<div class="invalid-feedback" v-if="errors.genero">
												<i class="fas fa-exclamation-circle me-1"></i>{{ errors.genero?.[0] }}
											</div>
										</div>
									</div>

									<div class="col-md-6">
										<div class="form-floating mb-3">
											<input type="email" class="form-control"
												:class="{ 'is-invalid': errors?.email }" id="email"
												v-model="formulario.email" placeholder="Email" required>
											<label for="email">✉️ Email</label>
											<div class="invalid-feedback" v-if="errors.email">
												<i class="fas fa-exclamation-circle me-1"></i>{{ errors.email?.[0] }}
											</div>
										</div>
									</div>
								</div>

								<div class="d-grid gap-2 mt-4">
									<button type="submit" class="btn btn-primary btn-lg" :disabled="isLoading"
										@click="registrarUsuario()">
										<span v-if="!isLoading">Registrar</span>
										<div v-else class="spinner-border spinner-border-sm" role="status">
											<span class="visually-hidden">Cargando...</span>
										</div>
									</button>
								</div>
							</form>
							<!-- Message for email verification -->
							<div v-if="verificationMessage" class="alert alert-info mt-3">
								{{ verificationMessage }}
							</div>

							<!-- Button to resend verification email -->
							<div v-if="showResendButton" class="mt-3">
								<button class="btn btn-secondary" @click="resendVerificationEmails">Reenviar correo de verificación</button>
							</div>

							<!-- Verification section -->
						 <div v-if="verificationId && verificationHash">
							 <button class="btn btn-success mt-3" @click="verifyEmails(verificationId, verificationHash)">Verificar Correo</button>
						 </div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { register, resendVerificationEmail, verifyEmail } from '@/Services/AuthService';
import { useRoute } from 'vue-router';

const formulario = ref({
	nombre: '',
	apellido: '',
	ci: '',
	nit: '',
	direccion: '',
	telefono: '',
	edad: '',
	genero: '',
	email: '',
});

const errors = ref({});
const isLoading = ref(false);
const verificationMessage = ref('');
const showResendButton = ref(false);
// Variables for verification
const verificationId = ref(null); // Store the ID for verification
const verificationHash = ref(null); // Store the hash for verification

const registrarUsuario = async () => {
	errors.value = {};
	isLoading.value = true;
	verificationMessage.value = '';
	showResendButton.value = false;

	try {
		const { data } = await register(formulario.value);
		console.log(data);
		verificationMessage.value = 'Usuario registrado con éxito. Por favor verifica tu correo electrónico.';
		showResendButton.value = true; // Mostrar el botón de reenvío después del registro exitoso
	} catch (error) {
		console.error(error);
		if (error.response && error.response.status === 422) {
			errors.value = error.response.data;
		} else {
			console.error('Ocurrió un error inesperado:', error);
		}
	} finally {
		isLoading.value = false;
	}
};

const resendVerificationEmails = async () => {
	try {
		await resendVerificationEmail();
		verificationMessage.value = 'Se ha enviado un nuevo correo de verificación.';
	} catch (error) {
		console.error('Error al reenviar el correo de verificación:', error);
		verificationMessage.value = 'Error al enviar el correo de verificación. Inténtalo de nuevo más tarde.';
	}
};
const verifyEmails = async (id, hash) => {
	console.log(id, hash);
    try {
        const response = await verifyEmail(id, hash);
        // Assuming the response contains the redirect URL
        if (response.data.redirect_url) {
            window.location.href = response.data.redirect_url; // Redirect to the specified URL
        }
    } catch (error) {
        console.error('Error verifying email:', error);
        verificationMessage.value = 'Error al verificar el correo electrónico. Por favor, inténtalo de nuevo.';
    }
};
// Set verificationId and verificationHash from URL parameters
const route = useRoute(); // Access the route object
onMounted(() => {
    verificationId.value = route.params.id; // Extract ID from URL
    verificationHash.value = route.params.hash; // Extract hash from URL

    // Optionally, you can call verifyEmails here if you want to verify immediately
    if (verificationId.value && verificationHash.value) {
        verifyEmails(verificationId.value, verificationHash.value);
    }
});
</script>

<style scoped>
.bg-gradient {
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.card {
	transition: all 0.3s ease-in-out;
}

.card:hover {
	transform: translateY(-5px);
	box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2) !important;
}

.form-control:focus,
.form-select:focus {
	border-color: #4a5568;
	box-shadow: 0 0 0 0.2rem rgba(74, 85, 104, 0.25);
}

.btn-primary {
	background-color: #4a5568;
	border-color: #4a5568;
}

.btn-primary:hover,
.btn-primary:focus {
	background-color: #2d3748;
	border-color: #2d3748;
}

.invalid-feedback {
	font-size: 0.875em;
}

@media (max-width: 767.98px) {
	.card-body {
		padding: 1.5rem;
	}
}
</style>