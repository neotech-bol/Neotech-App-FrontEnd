<script setup>
import { ref, computed, watchEffect, onMounted, nextTick } from 'vue'
import { useThemeStore } from '../stores/themeStore'
import { store } from '@/Services/ContactoService'
import Swal from 'sweetalert2'
import { storeCitaUser } from '@/Services/CitasService'

const themeStore = useThemeStore()

// Enhanced department locations with more details
const departmentLocations = {
  /*   'la-paz': {
      address: 'Av. 16 de Julio #1490, El Prado, La Paz - BO',
      mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3825.3681896113545!2d-68.13309!3d-16.499611!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTbCsDI5JzU4LjYiUyA2OMKwMDcnNTkuMSJX!5e0!3m2!1ses!2sbo!4v1234567890!5m2!1ses!2sbo',
      directionsUrl: 'https://goo.gl/maps/abcdefg123456',
      additionalInfo: 'Edificio Torre Azul, planta baja. Referencia: Frente al Banco Nacional.',
      color: '#F8A812' // Naranja para La Paz
    }, */
  'cochabamba': {
    address: 'Calle Tarija #234, esquina América, Cochabamba - BO',
    mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3807.3758801973644!2d-66.1552!3d-17.393611!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTfCsDIyJzIyLjciUyA2NsKwMDknMzguNyJX!5e0!3m2!1ses!2sbo!4v1234567890!5m2!1ses!2sbo',
    directionsUrl: 'https://goo.gl/maps/hijklmn789012',
    additionalInfo: 'Local con fachada verde. Referencia: A media cuadra de la Plaza Principal.',
    color: '#3B82F6' // Azul para Cochabamba
  },
  /*   'santa-cruz': {
      address: 'Av. Irala #456, Santa Cruz - BO',
      mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3799.1234567890123!2d-63.1234!3d-17.7890!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTfCsDQ3JzIwLjQiUyA2M8KwMDcnMjAuMiJX!5e0!3m2!1ses!2sbo!4v1234567890!5m2!1ses!2sbo',
      directionsUrl: 'https://goo.gl/maps/opqrstu345678',
      additionalInfo: 'Centro Comercial Las Brisas, Local 12. Amplio estacionamiento disponible.',
      color: '#10B981' // Verde para Santa Cruz
    } */
}

// State variables
const currentDepartment = computed(() => themeStore.currentDepartment)
const errors = ref({})
const isLoading = ref(false)
const activeTab = ref('message')
const activeFaq = ref(null)
const showSuccessModal = ref(false)
const successMessage = ref({ title: '', message: '' })
const isMobile = ref(false)
const isTablet = ref(false)
const isIntersecting = ref({
  cards: false,
  form: false,
  location: false,
  faq: false
})
const touchStartX = ref(0)
const touchEndX = ref(0)
const cardSwipeIndex = ref(0)
const formHeight = ref(0)
const formTransition = ref(true)
const showFloatingContact = ref(false)
const showFloatingMenu = ref(false)

// Get current location based on selected department
const currentLocation = computed(() => {
  const department = selectedDepartment.value || 'cochabamba'
  return departmentLocations[department] || departmentLocations['cochabamba']
})

// Form data
const formData = ref({
  nombre_completo: '',
  correo: '',
  telefono: '',
  mensaje: ''
})

const appointmentData = ref({
  nombre_completo: '',
  correo: '',
  telefono: '',
  fecha_de_cita: '',
  hora_de_cita: '',
  servicio_solicitado: '',
})

// FAQ data
const faqs = ref([
  {
    question: '¿Cuál es el tiempo de respuesta a mis consultas?',
    answer: 'Nos comprometemos a responder todas las consultas en un plazo máximo de 24 horas hábiles. Para casos urgentes, recomendamos contactarnos directamente por teléfono.'
  },
  {
    question: '¿Ofrecen soporte técnico remoto?',
    answer: 'Sí, ofrecemos soporte técnico remoto para nuestros clientes. Puedes solicitar este servicio a través del formulario de contacto o llamando directamente a nuestro número de atención.'
  },
  {
    question: '¿Cómo puedo cancelar o reprogramar una cita?',
    answer: 'Para cancelar o reprogramar una cita, puedes contactarnos por teléfono con al menos 24 horas de anticipación, o enviarnos un correo electrónico a contacto@neotechbol.com indicando tu nombre y la fecha de la cita original.'
  },
  {
    question: '¿Tienen servicio a domicilio?',
    answer: 'Sí, contamos con servicio a domicilio para instalaciones y soporte técnico. Este servicio está disponible en las principales ciudades donde operamos, con costo adicional según la distancia.'
  }
])

const enviarMensaje = async () => {
  errors.value = {}
  isLoading.value = true
  try {
    // Add the selected department to the form data before sending
    const formDataWithDepartment = {
      ...formData.value,
      departamento: selectedDepartment.value
    }
    
    const { data } = await store(formDataWithDepartment)

    // Show success modal instead of Swal
    successMessage.value = {
      title: '¡Mensaje Enviado!',
      message: 'Gracias por contactarnos. Te responderemos lo antes posible.'
    }
    showSuccessModal.value = true

    formData.value = { nombre_completo: '', correo: '', telefono: '', mensaje: '' }
  } catch (error) {
    if (error.response?.status === 422) {
      errors.value = error.response.data.errors
    }
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Por favor, revisa los datos ingresados',
      confirmButtonText: 'Intentar de nuevo',
      confirmButtonColor: getDepartmentColor(selectedDepartment.value)
    })
  } finally {
    isLoading.value = false
  }
}

// Contact cards with enhanced actions
const contactCards = computed(() => [
  {
    icon: 'fa-envelope',
    title: 'Escríbenos',
    content: 'contacto@neotechbol.com',
    href: 'mailto:contacto@neotechbol.com',
    action: {
      icon: 'fa-copy',
      text: 'Copiar',
      handler: () => copyToClipboard('contacto@neotechbol.com')
    }
  },
  {
    icon: 'fa-phone',
    title: 'Llámanos',
    content: '+591 77997694',
    href: 'tel:+59177997694',
    action: {
      icon: 'fa-phone-alt',
      text: 'Llamar ahora',
      handler: () => window.location.href = 'tel:+59177997694'
    }
  },
  {
    icon: 'fa-map-marker-alt',
    title: 'Visítanos',
    content: currentLocation.value.address,
    action: {
      icon: 'fa-directions',
      text: 'Ver en mapa',
      handler: () => window.open(currentLocation.value.directionsUrl, '_blank')
    }
  }
])

// Visible cards for mobile swiper
const visibleCardIndex = computed(() => {
  if (!isMobile.value) return -1
  return cardSwipeIndex.value % contactCards.value.length
})

// Form submission handlers
const handleSubmit = () => {
  enviarMensaje()
}
// Fixed handleAppointment function to include department
const handleAppointment = async() => {
  try {
    // Add the selected department to the appointment data before sending
    const appointmentDataWithDepartment = {
      ...appointmentData.value,
      departamento: selectedDepartment.value
    }
    
    const {data} = await storeCitaUser(appointmentDataWithDepartment);
    
    // Reset form after successful submission
    appointmentData.value = {
      nombre_completo: '',
      correo: '',
      telefono: '',
      fecha_de_cita: '',
      hora_de_cita: '',
      servicio_solicitado: '',
    }
    
    // Mostrar mensaje de éxito con SweetAlert
    Swal.fire({
      icon: 'success',
      title: '¡Cita Agendada!',
      text: `Tu cita ha sido agendada para el ${formatDate(data.fecha_de_cita || '')} a las ${data.hora_de_cita || ''}. Te hemos enviado un correo de confirmación.`,
      confirmButtonText: 'Entendido',
      confirmButtonColor: getDepartmentColor(selectedDepartment.value)
    })
  } catch (error) {
    console.error('Error al agendar cita:', error);
    
    // Show error message
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'No se pudo agendar la cita. Por favor, intenta nuevamente.',
      confirmButtonText: 'Intentar de nuevo',
      confirmButtonColor: getDepartmentColor(selectedDepartment.value)
    })
    
    // If there are validation errors, set them
    if (error.response?.status === 422) {
      errors.value = error.response.data.errors
    }
  }
}

// Helper functions
const departments = Object.keys(departmentLocations)
const selectedDepartment = ref(currentDepartment.value || 'cochabamba')

const getDepartmentColor = (dept) => {
  return departmentLocations[dept]?.color || '#3B82F6'
}

const getFormattedDepartment = (dept) => {
  return dept.charAt(0).toUpperCase() + dept.slice(1).replace('-', ' ')
}

const toggleFaq = (index) => {
  activeFaq.value = activeFaq.value === index ? null : index
}

const closeSuccessModal = () => {
  showSuccessModal.value = false
}

const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text).then(() => {
    Swal.fire({
      icon: 'success',
      title: '¡Copiado!',
      text: 'Texto copiado al portapapeles',
      timer: 1500,
      showConfirmButton: false,
      position: 'top-end',
      toast: true
    })
  })
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })
}

const showVirtualTour = () => {
  Swal.fire({
    title: 'Tour Virtual',
    text: 'Esta función estará disponible próximamente',
    icon: 'info',
    confirmButtonText: 'Entendido',
    confirmButtonColor: getDepartmentColor(selectedDepartment.value)
  })
}

// Mobile-specific functions
const checkDeviceType = () => {
  isMobile.value = window.innerWidth <= 640
  isTablet.value = window.innerWidth > 640 && window.innerWidth <= 1024
}

// Touch events for card swiping
const handleTouchStart = (e) => {
  touchStartX.value = e.touches[0].clientX
}

const handleTouchMove = (e) => {
  touchEndX.value = e.touches[0].clientX
}

const handleTouchEnd = () => {
  const minSwipeDistance = 50
  const swipeDistance = touchStartX.value - touchEndX.value

  if (Math.abs(swipeDistance) > minSwipeDistance) {
    if (swipeDistance > 0) {
      // Swiped left - next card
      nextCard()
    } else {
      // Swiped right - previous card
      prevCard()
    }
  }
}

const nextCard = () => {
  cardSwipeIndex.value = (cardSwipeIndex.value + 1) % contactCards.value.length
}

const prevCard = () => {
  cardSwipeIndex.value = (cardSwipeIndex.value - 1 + contactCards.value.length) % contactCards.value.length
}

// Scroll handling for floating contact button
const handleScroll = () => {
  const scrollPosition = window.scrollY
  const windowHeight = window.innerHeight
  const documentHeight = document.documentElement.scrollHeight

  // Show floating contact button when scrolled down 300px
  showFloatingContact.value = scrollPosition > 300

  // Hide floating contact button near the bottom of the page
  if (scrollPosition + windowHeight > documentHeight - 200) {
    showFloatingContact.value = false
  }
}

// Toggle floating menu
const toggleFloatingMenu = () => {
  showFloatingMenu.value = !showFloatingMenu.value
}

// Setup intersection observer for animations
const setupIntersectionObserver = () => {
  const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -100px 0px'
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        if (entry.target.classList.contains('contact-cards')) {
          isIntersecting.value.cards = true
        } else if (entry.target.classList.contains('contact-content')) {
          isIntersecting.value.form = true
        } else if (entry.target.classList.contains('location-section')) {
          isIntersecting.value.location = true
        } else if (entry.target.classList.contains('faq-section')) {
          isIntersecting.value.faq = true
        }
      }
    })
  }, observerOptions)

  // Observe sections
  nextTick(() => {
    const sections = [
      '.contact-cards',
      '.contact-content',
      '.location-section',
      '.faq-section'
    ]

    sections.forEach(selector => {
      const element = document.querySelector(selector)
      if (element) observer.observe(element)
    })
  })
}

// Switch tabs with animation
const switchTab = (tab) => {
  // Disable transition temporarily when switching tabs
  formTransition.value = false

  // Get current form height
  const formContainer = document.querySelector('.form-container')
  if (formContainer) {
    formHeight.value = formContainer.offsetHeight
  }

  // Switch tab after a small delay
  setTimeout(() => {
    activeTab.value = tab

    // Re-enable transition after tab switch
    setTimeout(() => {
      formTransition.value = true
      formHeight.value = 0 // Reset height to auto
    }, 50)
  }, 50)
}

// Watch for department changes
watchEffect(() => {
  themeStore.setDepartment(selectedDepartment.value)
})

onMounted(() => {
  // Set min date for appointment to today
  const today = new Date()
  const yyyy = today.getFullYear()
  const mm = String(today.getMonth() + 1).padStart(2, '0')
  const dd = String(today.getDate()).padStart(2, '0')
  const minDate = `${yyyy}-${mm}-${dd}`

  const dateInputs = document.querySelectorAll('input[type="date"]')
  dateInputs.forEach(input => {
    input.min = minDate
  })

  // Check device type
  checkDeviceType()
  window.addEventListener('resize', checkDeviceType)

  // Setup scroll handler
  window.addEventListener('scroll', handleScroll)

  // Setup intersection observer
  setupIntersectionObserver()

  // Set initial card index
  cardSwipeIndex.value = 0
})
</script>

<template>
  <section class="contact-section">
    <div class="contact-container">
      <div class="section-header" :class="{ 'animate-in': true }">
        <h2>Contáctanos <span class="highlight"
            :style="{ '--highlight-color': getDepartmentColor(selectedDepartment) }">Hoy</span></h2>
        <p>Conéctate con nosotros de la manera que prefieras</p>
      </div>

      <!-- Department Selector with Visual Indicators -->
      <div class="department-selector" :class="{ 'animate-in': true }">
        <div class="select-wrapper">
          <select v-model="selectedDepartment" class="department-dropdown" aria-label="Seleccionar departamento">
            <option v-for="dept in departments" :key="dept" :value="dept">
              {{ getFormattedDepartment(dept) }}
            </option>
          </select>
          <i class="fas fa-chevron-down select-arrow"></i>
        </div>
        <div class="department-indicator">
          <span class="indicator-dot" :style="{ background: getDepartmentColor(selectedDepartment) }"></span>
          <span class="indicator-text">{{ getFormattedDepartment(selectedDepartment) }}</span>
        </div>
      </div>

      <!-- Contact Cards with Enhanced Visual Design -->
      <div class="contact-cards" :class="{ 'animate-in': isIntersecting.cards }">
        <!-- Mobile Card Swiper -->
        <div v-if="isMobile" class="mobile-card-swiper" @touchstart="handleTouchStart" @touchmove="handleTouchMove"
          @touchend="handleTouchEnd">
          <div class="swiper-navigation">
            <button class="swipe-arrow prev" @click="prevCard" aria-label="Contacto anterior">
              <i class="fas fa-chevron-left"></i>
            </button>
            <div class="swiper-indicators">
              <span v-for="(_, index) in contactCards" :key="`indicator-${index}`"
                :class="['swiper-dot', { active: visibleCardIndex === index }]"></span>
            </div>
            <button class="swipe-arrow next" @click="nextCard" aria-label="Contacto siguiente">
              <i class="fas fa-chevron-right"></i>
            </button>
          </div>

          <div class="swiper-container">
            <div class="swiper-track" :style="{ transform: `translateX(-${visibleCardIndex * 100}%)` }">
              <div v-for="(card, index) in contactCards" :key="`mobile-${index}`" class="contact-card mobile-card">
                <div class="icon" :style="{ background: getDepartmentColor(selectedDepartment) }">
                  <i :class="['fas', card.icon]"></i>
                </div>
                <h3>{{ card.title }}</h3>
                <a v-if="card.href" :href="card.href" class="contact-link"
                  :style="{ color: getDepartmentColor(selectedDepartment) }">
                  {{ card.content }}
                </a>
                <p v-else>{{ card.content }}</p>
                <div class="card-action" v-if="card.action">
                  <button class="action-button" @click="card.action.handler"
                    :style="{ background: getDepartmentColor(selectedDepartment) }">
                    <i :class="['fas', card.action.icon]"></i>
                    {{ card.action.text }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Desktop/Tablet Cards -->
        <div v-else v-for="(card, index) in contactCards" :key="`desktop-${index}`" class="contact-card"
          :class="{ 'animate-card': true }" :style="{ '--card-delay': `${index * 0.15}s` }">
          <div class="icon" :style="{ background: getDepartmentColor(selectedDepartment) }">
            <i :class="['fas', card.icon]"></i>
          </div>
          <h3>{{ card.title }}</h3>
          <a v-if="card.href" :href="card.href" class="contact-link"
            :style="{ color: getDepartmentColor(selectedDepartment) }">
            {{ card.content }}
          </a>
          <p v-else>{{ card.content }}</p>
          <div class="card-action" v-if="card.action">
            <button class="action-button" @click="card.action.handler"
              :style="{ background: getDepartmentColor(selectedDepartment) }">
              <i :class="['fas', card.action.icon]"></i>
              {{ card.action.text }}
            </button>
          </div>
        </div>
      </div>

      <!-- Tabs for Contact Forms -->
      <div class="form-tabs" :class="{ 'animate-in': isIntersecting.form }">
        <button :class="['tab-button', { active: activeTab === 'message' }]" @click="switchTab('message')"
          :style="activeTab === 'message' ? { borderColor: getDepartmentColor(selectedDepartment) } : {}">
          <i class="fas fa-envelope"></i> Enviar Mensaje
        </button>
        <button :class="['tab-button', { active: activeTab === 'appointment' }]" @click="switchTab('appointment')"
          :style="activeTab === 'appointment' ? { borderColor: getDepartmentColor(selectedDepartment) } : {}">
          <i class="fas fa-calendar-alt"></i> Agendar Cita
        </button>
      </div>

      <!-- Contact Forms with Improved UX -->
      <div class="contact-content" :class="{ 'animate-in': isIntersecting.form }">
        <div class="form-wrapper" :style="formHeight ? { height: `${formHeight}px` } : {}"
          :class="{ 'no-transition': !formTransition }">
          <div v-if="activeTab === 'message'" class="form-container" key="message">
            <h3>Envíanos un Mensaje</h3>
            <form class="contact-form" @submit.prevent="handleSubmit">
              <div class="form-group">
                <div class="input-wrapper">
                  <i class="fas fa-user input-icon"></i>
                  <input type="text" v-model="formData.nombre_completo" :class="{ 'has-error': errors.nombre_completo }"
                    placeholder="Nombre Completo" required aria-label="Nombre Completo">
                  <div class="input-status">
                    <i v-if="formData.nombre_completo && !errors.nombre_completo"
                      class="fas fa-check-circle valid-icon"></i>
                    <i v-if="errors.nombre_completo" class="fas fa-exclamation-circle error-icon"></i>
                  </div>
                </div>
                <transition name="fade">
                  <small v-if="errors.nombre_completo" class="error-message">{{ errors.nombre_completo[0] }}</small>
                </transition>
              </div>

              <div class="form-group">
                <div class="input-wrapper">
                  <i class="fas fa-envelope input-icon"></i>
                  <input type="email" v-model="formData.correo" :class="{ 'has-error': errors.correo }"
                    placeholder="Correo Electrónico" required aria-label="Correo Electrónico">
                  <div class="input-status">
                    <i v-if="formData.correo && !errors.correo" class="fas fa-check-circle valid-icon"></i>
                    <i v-if="errors.correo" class="fas fa-exclamation-circle error-icon"></i>
                  </div>
                </div>
                <transition name="fade">
                  <small v-if="errors.correo" class="error-message">{{ errors.correo[0] }}</small>
                </transition>
              </div>

              <div class="form-group">
                <div class="input-wrapper">
                  <i class="fas fa-phone input-icon"></i>
                  <input type="tel" v-model="formData.telefono" :class="{ 'has-error': errors.telefono }"
                    placeholder="Teléfono" required aria-label="Teléfono">
                  <div class="input-status">
                    <i v-if="formData.telefono && !errors.telefono" class="fas fa-check-circle valid-icon"></i>
                    <i v-if="errors.telefono" class="fas fa-exclamation-circle error-icon"></i>
                  </div>
                </div>
                <transition name="fade">
                  <small v-if="errors.telefono" class="error-message">{{ errors.telefono[0] }}</small>
                </transition>
              </div>

              <div class="form-group">
                <div class="input-wrapper textarea-wrapper">
                  <i class="fas fa-comment input-icon textarea-icon"></i>
                  <textarea v-model="formData.mensaje" :class="{ 'has-error': errors.mensaje }" placeholder="Tu Mensaje"
                    rows="4" required aria-label="Tu Mensaje"></textarea>
                  <div class="input-status textarea-status">
                    <i v-if="formData.mensaje && !errors.mensaje" class="fas fa-check-circle valid-icon"></i>
                    <i v-if="errors.mensaje" class="fas fa-exclamation-circle error-icon"></i>
                  </div>
                </div>
                <transition name="fade">
                  <small v-if="errors.mensaje" class="error-message">{{ errors.mensaje[0] }}</small>
                </transition>
                <div class="character-count" :class="{ 'warning': formData.mensaje.length > 200 }">
                  {{ formData.mensaje.length }}/300 caracteres
                </div>
              </div>

              <button type="submit" class="submit-btn" :disabled="isLoading"
                :style="{ background: getDepartmentColor(selectedDepartment) }">
                <span v-if="isLoading" class="spinner"></span>
                <i class="fas fa-paper-plane" v-if="!isLoading"></i>
                {{ isLoading ? 'Enviando...' : 'Enviar Mensaje' }}
              </button>
            </form>
          </div>

          <div v-else-if="activeTab === 'appointment'" class="form-container" key="appointment">
            <h3>Agenda una Cita</h3>
            <form class="contact-form" @submit.prevent="handleAppointment">
              <div class="form-group">
                <div class="input-wrapper">
                  <i class="fas fa-user input-icon"></i>
                  <input type="text" v-model="appointmentData.nombre_completo" placeholder="Nombre Completo" required
                    aria-label="Nombre Completo">
                </div>
              </div>

              <div class="form-group">
                <div class="input-wrapper">
                  <i class="fas fa-envelope input-icon"></i>
                  <input type="email" v-model="appointmentData.correo" placeholder="Correo Electrónico" required
                    aria-label="Correo Electrónico">
                </div>
              </div>

              <div class="form-group">
                <div class="input-wrapper">
                  <i class="fas fa-phone input-icon"></i>
                  <input type="tel" v-model="appointmentData.telefono" placeholder="Teléfono" required
                    aria-label="Teléfono">
                </div>
              </div>

              <div class="form-row">
                <div class="form-group half-width">
                  <label for="appointment-date">Fecha de la cita</label>
                  <div class="input-wrapper">
                    <i class="fas fa-calendar input-icon"></i>
                    <input id="appointment-date" type="date" v-model="appointmentData.fecha_de_cita" required min="2023-01-01"
                      aria-label="Fecha de la cita">
                  </div>
                </div>

                <div class="form-group half-width">
                  <label for="appointment-time">Hora de la cita</label>
                  <div class="input-wrapper">
                    <i class="fas fa-clock input-icon"></i>
                    <input id="appointment-time" type="time" v-model="appointmentData.hora_de_cita" required min="09:00"
                      max="18:00" aria-label="Hora de la cita">
                  </div>
                  <small class="time-hint">Horario de atención: 9:00 - 18:00</small>
                </div>
              </div>

              <div class="form-group">
                <label for="appointment-reason">Motivo de la cita</label>
                <div class="input-wrapper">
                  <i class="fas fa-clipboard-list input-icon"></i>
                  <select id="appointment-reason" v-model="appointmentData.servicio_solicitado" required
                    aria-label="Motivo de la cita">
                    <option value="" disabled selected>Selecciona un motivo</option>
                    <option value="consulta">Consulta general</option>
                    <option value="soporte">Soporte técnico</option>
                    <option value="compra">Asesoría de compra</option>
                    <option value="reclamo">Reclamo</option>
                    <option value="otro">Otro</option>
                  </select>
                  <i class="fas fa-chevron-down select-arrow appointment-select-arrow"></i>
                </div>
              </div>

              <div class="form-group" v-if="appointmentData.servicio_solicitado === 'otro'">
                <div class="input-wrapper">
                  <i class="fas fa-comment-alt input-icon"></i>
                  <input type="text" v-model="appointmentData.servicio_solicitado" placeholder="Especifica el motivo" required
                    aria-label="Especifica el motivo">
                </div>
              </div>

              <button type="submit" class="submit-btn" :style="{ background: getDepartmentColor(selectedDepartment) }">
                <i class="fas fa-calendar-check"></i>
                Agendar Ahora
              </button>
            </form>
          </div>
        </div>
      </div>

      <!-- Map with Location Info -->
      <div class="location-section" :class="{ 'animate-in': isIntersecting.location }">
        <div class="location-info">
          <h3>Nuestra Ubicación</h3>
          <div class="location-details">
            <div class="location-item">
              <i class="fas fa-map-marker-alt" :style="{ color: getDepartmentColor(selectedDepartment) }"></i>
              <div>
                <h4>Dirección</h4>
                <p>{{ currentLocation.address }}</p>
              </div>
            </div>
            <div class="location-item">
              <i class="fas fa-clock" :style="{ color: getDepartmentColor(selectedDepartment) }"></i>
              <div>
                <h4>Horario de Atención</h4>
                <p>Lunes a Viernes: 9:00 - 18:00</p>
                <p>Sábados: 9:00 - 13:00</p>
              </div>
            </div>
            <!--             <div class="location-item">
              <i class="fas fa-info-circle" :style="{ color: getDepartmentColor(selectedDepartment) }"></i>
              <div>
                <h4>Información Adicional</h4>
                <p>{{ currentLocation.additionalInfo || 'Estacionamiento disponible para clientes.' }}</p>
              </div>
            </div> -->
          </div>
          <!--           <div class="location-actions">
            <a :href="currentLocation.directionsUrl" target="_blank" class="direction-btn">
              <i class="fas fa-directions"></i> Cómo llegar
            </a>
            <button class="virtual-tour-btn" @click="showVirtualTour">
              <i class="fas fa-street-view"></i> Tour Virtual
            </button>
          </div> -->
        </div>

        <div class="map-container">
          <iframe :src="currentLocation.mapUrl" width="100%" height="450" style="border:0;" allowfullscreen=""
            loading="lazy" referrerpolicy="no-referrer-when-downgrade" title="Mapa de ubicación"></iframe>
        </div>
      </div>

      <!-- FAQ Section -->
      <div class="faq-section" :class="{ 'animate-in': isIntersecting.faq }">
        <h3>Preguntas Frecuentes</h3>
        <div class="faq-container">
          <div v-for="(faq, index) in faqs" :key="index" class="faq-item"
            :class="{ 'active': activeFaq === index, 'animate-faq': true }"
            :style="{ '--faq-delay': `${index * 0.1}s` }">
            <div class="faq-question" @click="toggleFaq(index)">
              <h4>{{ faq.question }}</h4>
              <i class="fas" :class="activeFaq === index ? 'fa-minus' : 'fa-plus'"></i>
            </div>
            <div class="faq-answer" :style="{ maxHeight: activeFaq === index ? '500px' : '0' }">
              <p>{{ faq.answer }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Success Message Modal -->
      <transition name="modal">
        <div v-if="showSuccessModal" class="success-modal">
          <div class="modal-content">
            <div class="success-icon">
              <i class="fas fa-check-circle"></i>
            </div>
            <h3>{{ successMessage.title }}</h3>
            <p>{{ successMessage.message }}</p>
            <button @click="closeSuccessModal" class="close-modal-btn"
              :style="{ background: getDepartmentColor(selectedDepartment) }">
              Entendido
            </button>
          </div>
        </div>
      </transition>
      <div v-if="showSuccessModal" class="modal-overlay" @click="closeSuccessModal"></div>

      <!-- Floating Contact Button for Mobile -->
      <transition name="fade-up">
        <div v-if="showFloatingContact" class="floating-contact">
          <button class="floating-contact-btn" @click="toggleFloatingMenu"
            :style="{ background: getDepartmentColor(selectedDepartment) }">
            <i class="fas" :class="showFloatingMenu ? 'fa-times' : 'fa-comment-dots'"></i>
          </button>

          <transition name="scale">
            <div v-if="showFloatingMenu" class="floating-menu">
              <a href="tel:+59177997694" class="floating-menu-item">
                <i class="fas fa-phone"></i>
                <span>Llamar</span>
              </a>
              <a href="mailto:contacto@neotechbol.com" class="floating-menu-item">
                <i class="fas fa-envelope"></i>
                <span>Email</span>
              </a>
              <a href="#" @click.prevent="activeTab = 'message'; showFloatingMenu = false" class="floating-menu-item">
                <i class="fas fa-paper-plane"></i>
                <span>Mensaje</span>
              </a>
            </div>
          </transition>
        </div>
      </transition>
    </div>
  </section>
</template>

<style scoped>
/* Base Styles */
.contact-section {
  padding: 80px 20px;
  min-height: 100vh;
  color: #1f2937;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.contact-container {
  max-width: 1300px;
  margin: 0 auto;
}

/* Section Header */
.section-header {
  text-align: center;
  margin-bottom: 50px;
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.8s ease, transform 0.8s ease;
}

.section-header.animate-in {
  opacity: 1;
  transform: translateY(0);
}

.section-header h2 {
  font-size: clamp(2.2rem, 5vw, 3rem);
  font-weight: 700;
  color: #111827;
  text-align: center;
  margin-bottom: 1.5rem;
  letter-spacing: -0.5px;
  line-height: 1.2;
}

.section-header p {
  color: #4b5563;
  font-size: clamp(1.1rem, 3vw, 1.3rem);
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.7;
}

.highlight {
  color: var(--primary-color, #3B82F6);
  position: relative;
  display: inline-block;
  color: var(--highlight-color, #3B82F6);
}

.highlight::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 6px;
  background-color: var(--highlight-color, #3B82F6);
  opacity: 0.2;
  border-radius: 3px;
}

/* Enhanced Department Selector */
.department-selector {
  text-align: center;
  margin-bottom: 50px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.8s ease, transform 0.8s ease;
}

.department-selector.animate-in {
  opacity: 1;
  transform: translateY(0);
}

.select-wrapper {
  position: relative;
  display: inline-block;
  width: 100%;
  max-width: 320px;
}

.department-dropdown {
  width: 100%;
  padding: 16px 45px 16px 20px;
  font-size: 1.1rem;
  border-radius: 12px;
  border: 2px solid #e5e7eb;
  background: white;
  cursor: pointer;
  appearance: none;
  transition: all 0.3s ease;
  color: #1f2937;
  font-weight: 500;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.department-dropdown:hover,
.department-dropdown:focus {
  border-color: var(--primary-color, #3B82F6);
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.15);
  outline: none;
}

.select-arrow {
  position: absolute;
  right: 18px;
  top: 50%;
  transform: translateY(-50%);
  color: #6b7280;
  font-size: 16px;
  pointer-events: none;
  transition: transform 0.3s ease;
}

.department-dropdown:focus+.select-arrow {
  transform: translateY(-50%) rotate(180deg);
  color: var(--primary-color, #3B82F6);
}

.department-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.95rem;
  color: #4b5563;
  font-weight: 500;
}

.indicator-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--primary-color, #3B82F6);
  display: inline-block;
}

/* Contact Cards */
.contact-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 30px;
  margin-bottom: 60px;
  opacity: 0;
  transition: opacity 0.8s ease;
}

.contact-cards.animate-in {
  opacity: 1;
}

.contact-card {
  padding: 35px 25px;
  border-radius: 16px;
  text-align: center;
  transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
  border: 1px solid #e5e7eb;
  background: white;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
  position: relative;
  overflow: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  opacity: 0;
  transform: translateY(30px);
}

.contact-card.animate-card {
  animation: fadeInUp 0.8s forwards;
  animation-delay: var(--card-delay, 0s);
}

.contact-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 0;
  background: var(--primary-color, #3B82F6);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.3s ease;
}

.contact-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
}

.contact-card:hover::before {
  transform: scaleX(1);
}

.contact-card .icon {
  width: 70px;
  height: 70px;
  background: var(--primary-color, #3B82F6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 25px;
  color: white;
  font-size: 28px;
  transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
  box-shadow: 0 10px 25px rgba(59, 130, 246, 0.25);
}

.contact-card:hover .icon {
  transform: scale(1.1) rotate(5deg);
}

.contact-card h3 {
  font-size: 1.4rem;
  color: #111827;
  margin-bottom: 15px;
  font-weight: 600;
}

.contact-link {
  color: var(--primary-color, #3B82F6);
  text-decoration: none;
  font-size: 1.15rem;
  transition: all 0.3s ease;
  font-weight: 500;
  display: inline-block;
  position: relative;
}

.contact-link::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: var(--primary-color, #3B82F6);
  transform: scaleX(0);
  transform-origin: right;
  transition: transform 0.3s ease;
}

.contact-link:hover {
  color: var(--primary-hover-color, #2563eb);
}

.contact-link:hover::after {
  transform: scaleX(1);
  transform-origin: left;
}

.contact-card p {
  color: #4b5563;
  font-size: 1.15rem;
  line-height: 1.6;
}

.card-action {
  margin-top: 20px;
}

.action-button {
  background: var(--primary-color, #3B82F6);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.action-button:hover {
  background: var(--primary-hover-color, #2563eb);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
}

/* Mobile Card Swiper */
.mobile-card-swiper {
  width: 100%;
  position: relative;
}

.swiper-container {
  overflow: hidden;
  width: 100%;
  border-radius: 16px;
}

.swiper-track {
  display: flex;
  transition: transform 0.5s ease;
  width: 100%;
}

.mobile-card {
  flex: 0 0 100%;
  opacity: 1;
  transform: none;
  animation: none;
}

.swiper-navigation {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  gap: 15px;
}

.swipe-arrow {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: white;
  border: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #6b7280;
}

.swipe-arrow:hover {
  background: #f3f4f6;
  color: #111827;
}

.swiper-indicators {
  display: flex;
  gap: 8px;
}

.swiper-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #d1d5db;
  transition: all 0.3s ease;
}

.swiper-dot.active {
  width: 24px;
  border-radius: 12px;
  background: var(--primary-color, #3B82F6);
}

/* Form Tabs */
.form-tabs {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 40px;
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.8s ease, transform 0.8s ease;
}

.form-tabs.animate-in {
  opacity: 1;
  transform: translateY(0);
}

.tab-button {
  padding: 12px 25px;
  background: transparent;
  border: none;
  border-bottom: 3px solid #e5e7eb;
  font-size: 1.1rem;
  font-weight: 600;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 10px;
}

.tab-button.active {
  color: #111827;
  border-color: var(--primary-color, #3B82F6);
}

.tab-button:hover {
  color: #111827;
}

.tab-button i {
  font-size: 1rem;
}

/* Contact Forms */
.contact-content {
  margin-bottom: 60px;
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.8s ease, transform 0.8s ease;
}

.contact-content.animate-in {
  opacity: 1;
  transform: translateY(0);
}

.form-wrapper {
  transition: height 0.3s ease;
  overflow: hidden;
}

.form-wrapper.no-transition {
  transition: none;
}

.form-container {
  background: white;
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
  max-width: 800px;
  margin: 0 auto;
}

.form-container h3 {
  font-size: 1.6rem;
  color: #111827;
  margin-bottom: 30px;
  text-align: center;
  font-weight: 600;
  position: relative;
  padding-bottom: 15px;
}

.form-container h3::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 3px;
  background: var(--primary-color, #3B82F6);
  border-radius: 3px;
}

.contact-form {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.form-group {
  position: relative;
}

.form-row {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.half-width {
  flex: 1 1 calc(50% - 10px);
  min-width: 250px;
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
  color: #6b7280;
  font-size: 18px;
  transition: color 0.3s ease;
}

.textarea-icon {
  top: 20px;
  transform: none;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #4b5563;
  font-size: 0.95rem;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 16px 16px 16px 45px;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: #fff;
  color: #1f2937;
}

.form-group textarea {
  padding-top: 16px;
  resize: vertical;
  min-height: 150px;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  border-color: var(--primary-color, #3B82F6);
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
  outline: none;
}

.form-group input:focus+.input-icon,
.form-group textarea:focus+.input-icon,
.form-group select:focus+.input-icon {
  color: var(--primary-color, #3B82F6);
}

.has-error {
  border-color: #ef4444 !important;
}

.has-error+.input-icon {
  color: #ef4444 !important;
}

.form-group small {
  color: #ef4444;
  font-size: 0.85rem;
  margin-top: 6px;
  display: block;
  font-weight: 500;
}

.input-status {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
}

.textarea-status {
  top: 20px;
  transform: none;
}

.valid-icon {
  color: #10b981;
  font-size: 18px;
}

.error-icon {
  color: #ef4444;
  font-size: 18px;
}

.character-count {
  text-align: right;
  font-size: 0.85rem;
  color: #6b7280;
  margin-top: 5px;
}

.character-count.warning {
  color: #f59e0b;
}

.time-hint {
  font-size: 0.85rem;
  color: #6b7280;
  margin-top: 5px;
  display: block;
}

.appointment-select-arrow {
  right: 15px;
}

.submit-btn {
  background: var(--primary-color, #3B82F6);
  color: white;
  padding: 16px 30px;
  border: none;
  border-radius: 10px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: 10px;
}

.submit-btn:hover {
  background: var(--primary-hover-color, #2563eb);
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(59, 130, 246, 0.25);
}

.submit-btn:active {
  transform: translateY(-1px);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.submit-btn::after {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: -100%;
  background: linear-gradient(90deg,
      transparent,
      rgba(255, 255, 255, 0.2),
      transparent);
  transition: 0.5s;
}

.submit-btn:hover::after {
  left: 100%;
}

.spinner {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* Location Section */
.location-section {
  display: grid;
  grid-template-columns: 1fr 1.5fr;
  gap: 40px;
  margin-bottom: 60px;
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.8s ease, transform 0.8s ease;
}

.location-section.animate-in {
  opacity: 1;
  transform: translateY(0);
}

.location-info {
  background: white;
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
}

.location-info h3 {
  font-size: 1.6rem;
  color: #111827;
  margin-bottom: 30px;
  font-weight: 600;
  position: relative;
  padding-bottom: 15px;
}

.location-info h3::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 60px;
  height: 3px;
  background: var(--primary-color, #3B82F6);
  border-radius: 3px;
}

.location-details {
  display: flex;
  flex-direction: column;
  gap: 25px;
  margin-bottom: 30px;
}

.location-item {
  display: flex;
  gap: 20px;
}

.location-item i {
  font-size: 24px;
  color: var(--primary-color, #3B82F6);
  margin-top: 5px;
}

.location-item h4 {
  font-size: 1.2rem;
  color: #111827;
  margin-bottom: 8px;
  font-weight: 600;
}

.location-item p {
  color: #4b5563;
  font-size: 1rem;
  line-height: 1.6;
}

.location-actions {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.direction-btn,
.virtual-tour-btn {
  padding: 12px 20px;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  justify-content: center;
  min-width: 150px;
}

.direction-btn {
  background: var(--primary-color, #3B82F6);
  color: white;
  text-decoration: none;
  border: none;
}

.direction-btn:hover {
  background: var(--primary-hover-color, #2563eb);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
}

.virtual-tour-btn {
  background: transparent;
  color: #4b5563;
  border: 2px solid #e5e7eb;
}

.virtual-tour-btn:hover {
  border-color: var(--primary-color, #3B82F6);
  color: var(--primary-color, #3B82F6);
  transform: translateY(-2px);
}

.map-container {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
  height: 100%;
  min-height: 450px;
}

/* FAQ Section */
.faq-section {
  margin-bottom: 60px;
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.8s ease, transform 0.8s ease;
}

.faq-section.animate-in {
  opacity: 1;
  transform: translateY(0);
}

.faq-section h3 {
  font-size: 1.8rem;
  color: #111827;
  margin-bottom: 30px;
  text-align: center;
  font-weight: 600;
}

.faq-container {
  max-width: 900px;
  margin: 0 auto;
}

.faq-item {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  margin-bottom: 15px;
  overflow: hidden;
  transition: all 0.3s ease;
  opacity: 0;
  transform: translateY(20px);
}

.faq-item.animate-faq {
  animation: fadeInUp 0.6s forwards;
  animation-delay: var(--faq-delay, 0s);
}

.faq-item.active {
  border-color: var(--primary-color, #3B82F6);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.05);
}

.faq-question {
  padding: 20px 25px;
  background: white;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.faq-question h4 {
  font-size: 1.1rem;
  color: #111827;
  font-weight: 600;
  margin: 0;
}

.faq-question i {
  font-size: 1rem;
  color: #6b7280;
  transition: transform 0.3s ease;
}

.faq-item.active .faq-question i {
  color: var(--primary-color, #3B82F6);
  transform: rotate(180deg);
}

.faq-answer {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.5s ease;
  background: #f9fafb;
}

.faq-answer p {
  padding: 20px 25px;
  color: #4b5563;
  font-size: 1rem;
  line-height: 1.7;
  margin: 0;
}

/* Success Modal */
.success-modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  max-width: 500px;
  width: 90%;
  text-align: center;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
}

.success-icon {
  font-size: 60px;
  color: #10b981;
  margin-bottom: 20px;
}

.success-modal h3 {
  font-size: 1.8rem;
  color: #111827;
  margin-bottom: 15px;
  font-weight: 600;
}

.success-modal p {
  color: #4b5563;
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 25px;
}

.close-modal-btn {
  background: var(--primary-color, #3B82F6);
  color: white;
  padding: 12px 25px;
  border: none;
  border-radius: 10px;
  font-size: 1.1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.close-modal-btn:hover {
  background: var(--primary-hover-color, #2563eb);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
}

/* Floating Contact Button */
.floating-contact {
  position: fixed;
  bottom: 30px;
  right: 30px;
  z-index: 99;
}

.floating-contact-btn {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: var(--primary-color, #3B82F6);
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(59, 130, 246, 0.3);
  transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}

.floating-contact-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 30px rgba(59, 130, 246, 0.4);
}

.floating-menu {
  position: absolute;
  bottom: 75px;
  right: 0;
  display: flex;
  flex-direction: column;
  gap: 15px;
  align-items: flex-end;
}

.floating-menu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  background: white;
  padding: 10px 15px;
  border-radius: 30px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  text-decoration: none;
  color: #4b5563;
  font-weight: 500;
  transition: all 0.3s ease;
}

.floating-menu-item:hover {
  transform: translateX(-5px);
  background: #f9fafb;
  color: var(--primary-color, #3B82F6);
}

.floating-menu-item i {
  width: 30px;
  height: 30px;
  background: var(--primary-color, #3B82F6);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Animations */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.9);
}

.fade-up-enter-active,
.fade-up-leave-active {
  transition: all 0.3s ease;
}

.fade-up-enter-from,
.fade-up-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

.scale-enter-active,
.scale-leave-active {
  transition: all 0.3s ease;
}

.scale-enter-from,
.scale-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

/* Responsive Design */
@media (max-width: 1024px) {
  .location-section {
    grid-template-columns: 1fr;
  }

  .section-header h2 {
    font-size: 2.2rem;
  }

  .contact-cards {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  }
}

@media (max-width: 768px) {
  .contact-section {
    padding: 60px 15px;
  }

  .form-container {
    padding: 30px;
  }

  .contact-card {
    padding: 30px 20px;
  }

  .form-tabs {
    flex-direction: column;
    gap: 10px;
  }

  .tab-button {
    width: 100%;
    justify-content: center;
  }

  .location-info {
    padding: 30px;
  }

  .floating-contact {
    bottom: 20px;
    right: 20px;
  }

  .floating-contact-btn {
    width: 50px;
    height: 50px;
    font-size: 20px;
  }
}

@media (max-width: 640px) {
  .contact-section {
    padding: 40px 15px;
  }

  .section-header h2 {
    font-size: 1.8rem;
  }

  .form-container {
    padding: 25px 20px;
  }

  .submit-btn {
    padding: 14px 20px;
    font-size: 1rem;
  }

  .select-wrapper {
    width: 100%;
  }

  .location-item {
    gap: 15px;
  }

  .location-item i {
    font-size: 20px;
  }

  .location-item h4 {
    font-size: 1.1rem;
  }

  .faq-question h4 {
    font-size: 1rem;
  }

  .faq-answer p {
    padding: 15px 20px;
    font-size: 0.95rem;
  }
}

@media (max-width: 480px) {
  .contact-section {
    padding: 40px 15px;
  }

  .section-header h2 {
    font-size: 1.8rem;
  }

  .form-container {
    padding: 25px 20px;
  }

  .submit-btn {
    padding: 14px 20px;
    font-size: 1rem;
  }

  .select-wrapper {
    width: 100%;
  }

  .contact-card {
    padding: 25px 20px;
  }

  .contact-card .icon {
    width: 60px;
    height: 60px;
    font-size: 22px;
  }

  .contact-card h3 {
    font-size: 1.3rem;
  }

  .contact-link,
  .contact-card p {
    font-size: 1rem;
  }

  .form-group input,
  .form-group textarea,
  .form-group select {
    padding: 14px 14px 14px 40px;
    font-size: 0.95rem;
  }

  .input-icon {
    font-size: 16px;
    left: 14px;
  }

  .success-modal {
    padding: 30px 20px;
  }

  .success-icon {
    font-size: 50px;
  }

  .success-modal h3 {
    font-size: 1.5rem;
  }

  .success-modal p {
    font-size: 1rem;
  }

  .floating-menu-item span {
    display: none;
  }

  .floating-menu-item {
    padding: 8px;
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

  .animate-in,
  .animate-card,
  .animate-faq {
    opacity: 1 !important;
    transform: none !important;
    animation: none !important;
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
  outline: 2px solid var(--primary-color, #3B82F6);
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