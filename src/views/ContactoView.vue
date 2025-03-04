<template>
  <section class="contact-section">
    <div class="contact-container">
      <div class="section-header animate__animated animate__fadeIn">
        <h2>Contáctanos <span class="highlight">Hoy</span></h2>
        <p>Conéctate con nosotros de la manera que prefieras</p>
      </div>

      <!-- Improved Department Selector -->
      <div class="department-selector">
        <div class="select-wrapper">
          <select v-model="selectedDepartment" class="department-dropdown">
            <option v-for="dept in departments" :key="dept" :value="dept">
              {{ dept.charAt(0).toUpperCase() + dept.slice(1).replace('-', ' ') }}
            </option>
          </select>
          <i class="fas fa-chevron-down select-arrow"></i>
        </div>
      </div>

      <!-- Contact Cards -->
      <div class="contact-cards">
        <div v-for="(card, index) in contactCards" :key="index" 
             class="contact-card animate__animated animate__fadeInUp"
             :style="{ animationDelay: `${index * 0.2}s` }">
          <div class="icon">
            <i :class="['fas', card.icon]"></i>
          </div>
          <h3>{{ card.title }}</h3>
          <a v-if="card.href" :href="card.href" class="contact-link">{{ card.content }}</a>
          <p v-else>{{ card.content }}</p>
        </div>
      </div>

      <!-- Contact Forms -->
      <div class="contact-content">
        <div class="form-container animate__animated animate__fadeInLeft">
          <h3>Envíanos un Mensaje</h3>
          <form class="contact-form" @submit.prevent="handleSubmit">
            <div class="form-group">
              <div class="input-wrapper">
                <i class="fas fa-user input-icon"></i>
                <input type="text" v-model="formData.nombre_completo" 
                       :class="{ 'has-error': errors.nombre_completo }"
                       placeholder="Nombre Completo" required>
              </div>
              <transition name="fade">
                <small v-if="errors.nombre_completo">{{ errors.nombre_completo[0] }}</small>
              </transition>
            </div>
            <div class="form-group">
              <div class="input-wrapper">
                <i class="fas fa-envelope input-icon"></i>
                <input type="email" v-model="formData.correo"
                       :class="{ 'has-error': errors.correo }"
                       placeholder="Correo Electrónico" required>
              </div>
              <transition name="fade">
                <small v-if="errors.correo">{{ errors.correo[0] }}</small>
              </transition>
            </div>
            <div class="form-group">
              <div class="input-wrapper">
                <i class="fas fa-phone input-icon"></i>
                <input type="tel" v-model="formData.telefono"
                       :class="{ 'has-error': errors.telefono }"
                       placeholder="Teléfono" required>
              </div>
              <transition name="fade">
                <small v-if="errors.telefono">{{ errors.telefono[0] }}</small>
              </transition>
            </div>
            <div class="form-group">
              <div class="input-wrapper">
                <i class="fas fa-comment input-icon"></i>
                <textarea v-model="formData.mensaje"
                          :class="{ 'has-error': errors.mensaje }"
                          placeholder="Tu Mensaje" rows="4" required></textarea>
              </div>
              <transition name="fade">
                <small v-if="errors.mensaje">{{ errors.mensaje[0] }}</small>
              </transition>
            </div>
            <button type="submit" class="submit-btn" :disabled="isLoading">
              <span v-if="isLoading" class="spinner"></span>
              {{ isLoading ? 'Enviando...' : 'Enviar Mensaje' }}
            </button>
          </form>
        </div>

        <div class="form-container animate__animated animate__fadeInRight">
          <h3>Agenda una Cita</h3>
          <form class="contact-form" @submit.prevent="handleAppointment">
            <div class="form-group">
              <div class="input-wrapper">
                <i class="fas fa-user input-icon"></i>
                <input type="text" v-model="appointmentData.nombre" 
                       placeholder="Nombre Completo" required>
              </div>
            </div>
            <div class="form-group">
              <div class="input-wrapper">
                <i class="fas fa-envelope input-icon"></i>
                <input type="email" v-model="appointmentData.correo" 
                       placeholder="Correo Electrónico" required>
              </div>
            </div>
            <div class="form-group">
              <div class="input-wrapper">
                <i class="fas fa-phone input-icon"></i>
                <input type="tel" v-model="appointmentData.telefono" 
                       placeholder="Teléfono" required>
              </div>
            </div>
            <div class="form-group">
              <div class="input-wrapper">
                <i class="fas fa-calendar input-icon"></i>
                <input type="date" v-model="appointmentData.fecha" required>
              </div>
            </div>
            <div class="form-group">
              <div class="input-wrapper">
                <i class="fas fa-clock input-icon"></i>
                <input type="time" v-model="appointmentData.hora" required>
              </div>
            </div>
            <button type="submit" class="submit-btn">Agendar Ahora</button>
          </form>
        </div>
      </div>

      <!-- Map -->
      <div class="map-container animate__animated animate__fadeIn">
        <iframe :src="currentLocation.mapUrl" width="100%" height="450" 
                style="border:0;" allowfullscreen="" loading="lazy" 
                referrerpolicy="no-referrer-when-downgrade"></iframe>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, watchEffect } from 'vue'
import { useThemeStore } from '../stores/themeStore'
import { store } from '@/Services/ContactoService'
import Swal from 'sweetalert2'

const themeStore = useThemeStore()

const departmentLocations = {
  'la-paz': {
    address: 'Av. 16 de Julio, El Prado, La Paz - BO',
    mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3825.3681896113545!2d-68.13309!3d-16.499611!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTbCsDI5JzU4LjYiUyA2OMKwMDcnNTkuMSJX!5e0!3m2!1ses!2sbo!4v1234567890!5m2!1ses!2sbo'
  },
  'cochabamba': {
    address: 'Calle Tarija, esquina América, Cochabamba - BO',
    mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3807.3758801973644!2d-66.1552!3d-17.393611!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTfCsDIyJzIyLjciUyA2NsKwMDknMzguNyJX!5e0!3m2!1ses!2sbo!4v1234567890!5m2!1ses!2sbo'
  },
  // ... other department locations ...
}

const currentDepartment = computed(() => themeStore.currentDepartment)
const errors = ref({})
const isLoading = ref(false)
const currentLocation = computed(() => {
  const department = currentDepartment.value || 'cochabamba'
  return departmentLocations[department] || departmentLocations['cochabamba']
})

const formData = ref({
  nombre_completo: '',
  correo: '',
  telefono: '',
  mensaje: ''
})

const appointmentData = ref({
  nombre: '',
  correo: '',
  telefono: '',
  fecha: '',
  hora: ''
})

const enviarMensaje = async () => {
  errors.value = {}
  isLoading.value = true
  try {
    const { data } = await store(formData.value)
    Swal.fire({
      icon: 'success',
      title: '¡Mensaje Enviado!',
      text: 'Te responderemos lo antes posible',
      confirmButtonText: 'Aceptar',
      timer: 3000,
      timerProgressBar: true,
      showConfirmButton: false,
      background: '#fff',
      customClass: {
        popup: 'animated fadeInDown'
      }
    })
    formData.value = { nombre_completo: '', correo: '', telefono: '', mensaje: '' }
  } catch (error) {
    if (error.response?.status === 422) {
      errors.value = error.response.data.errors
    }
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Por favor, revisa los datos ingresados',
      confirmButtonText: 'Intentar de nuevo'
    })
  } finally {
    isLoading.value = false
  }
}

const contactCards = computed(() => [
  { icon: 'fa-envelope', title: 'Escríbenos', content: 'contacto@neotechbol.com', href: 'mailto:contacto@neotechbol.com' },
  { icon: 'fa-phone', title: 'Llámanos', content: '+591 77997694', href: 'tel:+59177997694' },
  { icon: 'fa-map-marker-alt', title: 'Visítanos', content: currentLocation.value.address }
])

const handleSubmit = () => {
  enviarMensaje()
}

const handleAppointment = () => {
  Swal.fire({
    icon: 'success',
    title: '¡Cita Agendada!',
    text: 'Te hemos enviado un correo de confirmación',
    confirmButtonText: 'Aceptar',
    timer: 3000,
    timerProgressBar: true
  })
  appointmentData.value = { nombre: '', correo: '', telefono: '', fecha: '', hora: '' }
}

const departments = Object.keys(departmentLocations)
const selectedDepartment = ref(currentDepartment.value || 'cochabamba')

watchEffect(() => {
  themeStore.setDepartment(selectedDepartment.value)
})
</script>

<style scoped>
.contact-section {
  padding: 60px 20px;
  min-height: 100vh;
}

.contact-container {
  max-width: 1300px;
  margin: 0 auto;
}

.section-header {
  text-align: center;
  margin-bottom: 40px;
}

.section-header h2 {
  font-size: clamp(2rem, 5vw, 2.8rem);
  color: #333333;
  font-weight: 700;
  margin-bottom: 15px;
  letter-spacing: -0.5px;
}

.section-header p {
  color: #666666;
  font-size: clamp(1rem, 3vw, 1.2rem);
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.7;
}

.highlight {
  color: var(--primary-color);
  padding: 0 8px;
}

/* Improved Department Selector */
.department-selector {
  text-align: center;
  margin-bottom: 40px;
}

.select-wrapper {
  position: relative;
  display: inline-block;
  width: 100%;
  max-width: 300px;
}

.department-dropdown {
  width: 100%;
  padding: 14px 40px 14px 20px;
  font-size: 1.1rem;
  border-radius: 12px;
  border: 2px solid #ddd;
  background: white;
  cursor: pointer;
  appearance: none;
  transition: all 0.3s ease;
  color: #333333;
}

.department-dropdown:hover,
.department-dropdown:focus {
  border-color: #007bff;
  box-shadow: 0 2px 10px rgba(0,123,255,0.1);
  outline: none;
}

.select-arrow {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #666666;
  font-size: 14px;
  pointer-events: none;
  transition: transform 0.3s ease;
}

.department-dropdown:focus + .select-arrow {
  transform: translateY(-50%) rotate(180deg);
}

/* Contact Cards */
.contact-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 25px;
  margin-bottom: 50px;
}

.contact-card {
  padding: 30px;
  border-radius: 20px;
  text-align: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border: 1px solid #eef2f7;
}

.contact-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 15px 35px rgba(0,0,0,0.08);
}

.contact-card .icon {
  width: 60px;
  height: 60px;
  background: var(--primary-color);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  color: white;
  font-size: 24px;
  transition: transform 0.3s ease;
}

.contact-card:hover .icon {
  transform: scale(1.1);
}

.contact-card h3 {
  font-size: 1.3rem;
  color: #333333;
  margin-bottom: 15px;
  font-weight: 600;
}

.contact-link {
  color: #007bff;
  text-decoration: none;
  font-size: 1.1rem;
  transition: color 0.3s ease;
}

.contact-link:hover {
  color: #0056b3;
  text-decoration: underline;
}

.contact-card p {
  color: #666666;
  font-size: 1.1rem;
}

/* Contact Forms */
.contact-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 35px;
  margin-bottom: 50px;
}

.form-container {
  background: #ffffff;
  padding: 30px;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.05);
  border: 1px solid #eef2f7;
}

.form-container h3 {
  font-size: 1.5rem;
  color: #333333;
  margin-bottom: 25px;
  text-align: center;
  font-weight: 600;
}

.contact-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.input-wrapper {
  position: relative;
  width: 100%;
}

.input-icon {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
  font-size: 16px;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 15px 15px 15px 40px;
  border: 2px solid #e9ecef;
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: #fff;
}

.form-group textarea {
  padding-top: 20px;
  resize: vertical;
  min-height: 120px;
}

.form-group input:focus,
.form-group textarea:focus {
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0,123,255,0.1);
  outline: none;
}

.has-error {
  border-color: #dc3545 !important;
}

.form-group small {
  color: #dc3545;
  font-size: 0.85rem;
  margin-top: 5px;
  display: block;
}

.submit-btn {
  background: var(--primary-color);
  color: white;
  padding: 14px 30px;
  border: none;
  border-radius: 10px;
  font-size: 1.1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.submit-btn:hover {
  background: var(--primary-hover-color);
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0,123,255,0.3);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.spinner {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 2px solid #ffffff;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 10px;
  vertical-align: middle;
}

/* Map */
.map-container {
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0,0,0,0.05);
  border: 1px solid #eef2f7;
}

/* Animations */
@keyframes spin {
  to { transform: rotate(360deg); }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .contact-content {
    grid-template-columns: 1fr;
  }
  
  .section-header h2 {
    font-size: 2.2rem;
  }
}

@media (max-width: 768px) {
  .contact-section {
    padding: 40px 15px;
  }
  
  .form-container {
    padding: 25px;
  }
  
  .contact-card {
    padding: 25px;
  }
}

@media (max-width: 480px) {
  .section-header h2 {
    font-size: 1.8rem;
  }
  
  .form-container {
    padding: 20px;
  }
  
  .submit-btn {
    padding: 12px 20px;
    font-size: 1rem;
  }
  
  .select-wrapper {
    width: 100%;
  }
  
  .contact-cards {
    grid-template-columns: 1fr;
  }

  .contact-card {
    padding: 20px;
  }

  .contact-card .icon {
    width: 50px;
    height: 50px;
    font-size: 20px;
  }

  .contact-card h3 {
    font-size: 1.2rem;
  }

  .contact-link,
  .contact-card p {
    font-size: 1rem;
  }

  .form-group input,
  .form-group textarea {
    padding: 12px 12px 12px 35px;
    font-size: 0.9rem;
  }

  .input-icon {
    font-size: 14px;
    left: 12px;
  }
}

/* Accessibility Improvements */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Focus styles for keyboard navigation */
a:focus,
button:focus,
input:focus,
select:focus,
textarea:focus {
  outline: 2px solid #007bff;
  outline-offset: 2px;
}

/* High contrast mode adjustments */
@media (forced-colors: active) {
  .contact-card,
  .form-container,
  .submit-btn {
    border: 2px solid currentColor;
  }
}
</style>