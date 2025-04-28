<template>
  <section class="testimonials" :class="{ 'fade-in': contentLoaded }">
    <h2 class="section-title">Lo que dicen <span class="highlight">nuestros clientes</span></h2>
    
    <!-- Mobile Swipeable Testimonials -->
    <div class="testimonials-container" 
         ref="testimonialsContainer"
         @touchstart="touchStart" 
         @touchmove="touchMove" 
         @touchend="touchEnd">
      
      <div class="testimonial-track" :style="trackStyle">
        <div v-for="(testimonial, index) in testimoniosArray" 
             :key="index" 
             class="testimonial-card"
             :class="{ 'active': currentIndex === index }">
          
          <div class="quote-mark start">"</div>
          
          <div class="testimonial-content">
            <p class="testimonial-text">{{ testimonial.experiencia }}</p>
            <div class="testimonial-author">
              <div class="author-avatar" :style="getAvatarStyle(testimonial)">
                <span v-if="!testimonial.avatar">{{ getInitials(testimonial.nombre_completo) }}</span>
                <img v-else :src="testimonial.avatar" :alt="testimonial.nombre_completo" />
              </div>
              <div class="author-info">
                <h3 class="author-name">{{ testimonial.nombre_completo }}</h3>
                <p class="author-role">{{ testimonial.ocupacion }}</p>
                <div class="rating">
                  <span v-for="star in 5" :key="star" class="star" 
                        :class="{ 'filled': star <= testimonial.calificacion, 'half-filled': star - 0.5 === testimonial.calificacion }">
                    ★
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="quote-mark end">"</div>
        </div>
      </div>
      
      <!-- Navigation Arrows -->
      <button class="nav-arrow prev" @click="prevTestimonial" aria-label="Testimonio anterior">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>
      <button class="nav-arrow next" @click="nextTestimonial" aria-label="Testimonio siguiente">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>
    </div>

    <!-- Indicators -->
    <div class="indicators">
      <button 
        v-for="(_, index) in testimoniosArray" 
        :key="index"
        :class="['indicator', { active: currentIndex === index }]"
        @click="setTestimonial(index)"
        :aria-label="`Ver testimonio ${index + 1}`"
      ></button>
    </div>
    
    <!-- Add Testimonial CTA -->
    <div class="testimonial-cta">
      <p>¿Has tenido una buena experiencia con nosotros?</p>
      <button class="add-testimonial-btn" @click="showAddTestimonialForm = true">
        Comparte tu opinión
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
        </svg>
      </button>
    </div>
    
    <!-- Add Testimonial Modal -->
    <div class="modal" v-if="showAddTestimonialForm" @click="closeModal">
      <div class="modal-content" @click.stop>
        <button class="close-modal" @click="showAddTestimonialForm = false">×</button>
        <h3>Comparte tu experiencia</h3>
        <form @submit.prevent="submitTestimonial" class="testimonial-form">
          <div class="form-group">
            <label for="name">Nombre completo</label>
            <input type="text" id="name" v-model="newTestimonial.nombre_completo" required>
          </div>
          <div class="form-group">
            <label for="role">Ocupación</label>
            <input type="text" id="role" v-model="newTestimonial.ocupacion" required>
          </div>
          <div class="form-group">
            <label for="testimonial">Tu experiencia</label>
            <textarea id="testimonial" v-model="newTestimonial.experiencia" rows="4" required></textarea>
          </div>
          <div class="form-group">
            <label>Calificación</label>
            <div class="rating-selector">
              <button 
                v-for="rating in 5" 
                :key="rating" 
                type="button"
                class="rating-star" 
                :class="{ 'selected': rating <= newTestimonial.calificacion }"
                @click="newTestimonial.calificacion = rating"
              >★</button>
            </div>
          </div>
          <button type="submit" class="submit-btn">Enviar testimonio</button>
        </form>
      </div>
    </div>
  </section>
</template>

<script setup>
import { indexTestimoniosActivos, storeTestimonio } from '@/Services/TestimoniosService';
import Swal from 'sweetalert2';
import { ref, computed, onMounted, onBeforeUnmount, inject, watchEffect, nextTick, toRaw } from 'vue';

const currentIndex = ref(0);
const contentLoaded = ref(false);
const testimonialsContainer = ref(null);
const showAddTestimonialForm = ref(false);
const touchStartX = ref(0);
const touchEndX = ref(0);
const isDragging = ref(false);
const dragOffset = ref(0);
const cardWidth = ref(0);
const isMobile = ref(false);

let interval = null;

// Enhanced testimonials with ratings and optional avatars
const testimonials = ref([]);
const testimoniosArray = ref([]);

const listarTestimoniosAprobados = async () => {
  try {
    // Datos de ejemplo fijos para asegurar que siempre haya algo para mostrar
    const datosEjemplo = [
      {
        id: 2,
        nombre_completo: 'Isaac Parisaca Huallpa',
        ocupacion: 'Desarrollador Full Stack Developer',
        experiencia: 'Me gusta mucho la forma de trabajar de la empresa, son muy profesionales y siempre están dispuestos a ayudar.',
        calificacion: 5,
        estado: 'aprobado',
        fecha_publicacion: null,
        imagen: null,
        user_id: null,
        created_at: '2025-03-27T20:40:00.000000Z',
        updated_at: '2025-03-27T20:40:04.000000Z'
      }
    ];
    
    // Intentar cargar desde la API
    const response = await indexTestimoniosActivos();
    // Verificar diferentes estructuras de datos posibles
    if (Array.isArray(response)) {
      testimonials.value = response;
    } 
    else if (response && response.data) {
      if (Array.isArray(response.data)) {
        testimonials.value = response.data;
      }
      else if (response.data.datos && Array.isArray(response.data.datos)) {
        testimonials.value = response.data.datos;
      }
      else {
        testimonials.value = datosEjemplo;
      }
    } 
    else {
      console.error('Estructura de respuesta inesperada, usando datos de ejemplo:', response);
      testimonials.value = datosEjemplo;
    }
    
    // Si después de todo no hay testimonios, usar los datos de ejemplo
    if (!testimonials.value || testimonials.value.length === 0) {
      testimonials.value = datosEjemplo;
    }
    // Convertir el Proxy a un array normal para evitar problemas de reactividad
    testimoniosArray.value = Array.isArray(testimonials.value) ? [...testimonials.value] : [testimonials.value];
    
    // Si es un objeto con propiedades numéricas, convertirlo a array
    if (!Array.isArray(testimoniosArray.value) && typeof testimoniosArray.value === 'object') {
      const tempArray = [];
      Object.keys(testimoniosArray.value).forEach(key => {
        if (!isNaN(Number(key))) {
          tempArray.push(testimoniosArray.value[key]);
        }
      });
      if (tempArray.length > 0) {
        testimoniosArray.value = tempArray;
      }
    }
    
    // Asegurarse de que sea un array
    if (!Array.isArray(testimoniosArray.value)) {
      testimoniosArray.value = [testimoniosArray.value];
    }
    
    // Filtrar elementos nulos o indefinidos
    testimoniosArray.value = testimoniosArray.value.filter(item => item && typeof item === 'object');
    
  } catch (error) {
    console.error('Error al cargar testimonios activos:', error);
    
    // En caso de error, cargar datos de ejemplo
    testimoniosArray.value = [
      {
        id: 2,
        nombre_completo: 'diego',
        ocupacion: 'Desarrollador web',
        experiencia: 'xd',
        calificacion: 5,
        estado: 'aprobado',
        fecha_publicacion: null,
        imagen: null,
        user_id: null,
        created_at: '2025-03-27T20:40:00.000000Z',
        updated_at: '2025-03-27T20:40:04.000000Z'
      }
    ];
  }
};

// New testimonial form data
const newTestimonial = ref({
  nombre_completo: '',
  ocupacion: '',
  experiencia: '',
  calificacion: 5,
  avatar: null
});

// Computed style for the testimonial track
const trackStyle = computed(() => {
  if (isDragging.value) {
    return {
      transform: `translateX(calc(-${currentIndex.value * 100}% + ${dragOffset.value}px))`,
      transition: 'none'
    };
  }
  return {
    transform: `translateX(-${currentIndex.value * 100}%)`,
    transition: 'transform 0.5s ease'
  };
});

// Helper functions
const getInitials = (name) => {
  if (!name) return '';
  return name.split(' ').map(n => n[0]).join('').toUpperCase();
};

const getAvatarStyle = (testimonial) => {
  if (!testimonial || !testimonial.nombre_completo) {
    return { backgroundColor: '#3B82F6' };
  }
  
  // Generate a consistent color based on the name
  const hash = testimonial.nombre_completo.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  
  const hue = Math.abs(hash % 360);
  const saturation = 70 + (hash % 20);
  const lightness = 45 + (hash % 10);
  
  return {
    backgroundColor: testimonial.avatar ? 'transparent' : `hsl(${hue}, ${saturation}%, ${lightness}%)`,
  };
};

const getPrevIndex = () => {
  if (!testimoniosArray.value || testimoniosArray.value.length === 0) return 0;
  return (currentIndex.value - 1 + testimoniosArray.value.length) % testimoniosArray.value.length;
};

const getNextIndex = () => {
  if (!testimoniosArray.value || testimoniosArray.value.length === 0) return 0;
  return (currentIndex.value + 1) % testimoniosArray.value.length;
};

// Navigation functions
const nextTestimonial = () => {
  if (!testimoniosArray.value || testimoniosArray.value.length <= 1) return;
  currentIndex.value = getNextIndex();
  resetAutoPlay();
};

const prevTestimonial = () => {
  if (!testimoniosArray.value || testimoniosArray.value.length <= 1) return;
  currentIndex.value = getPrevIndex();
  resetAutoPlay();
};

const setTestimonial = (index) => {
  if (!testimoniosArray.value || index >= testimoniosArray.value.length) return;
  currentIndex.value = index;
  resetAutoPlay();
};

// Auto-play functions
const startAutoPlay = () => {
  if (!testimoniosArray.value || testimoniosArray.value.length <= 1) return;
  interval = setInterval(nextTestimonial, 8000); // Reduced from 20s to 8s for better engagement
};

const stopAutoPlay = () => {
  if (interval) {
    clearInterval(interval);
    interval = null;
  }
};

const resetAutoPlay = () => {
  stopAutoPlay();
  startAutoPlay();
};

// Touch event handlers
const touchStart = (e) => {
  if (isMobile.value) {
    touchStartX.value = e.touches[0].clientX;
    isDragging.value = true;
    dragOffset.value = 0;
    stopAutoPlay();
  }
};

const touchMove = (e) => {
  if (isDragging.value && isMobile.value) {
    const currentX = e.touches[0].clientX;
    dragOffset.value = currentX - touchStartX.value;
    
    // Limit dragging to one card width
    if (Math.abs(dragOffset.value) > cardWidth.value) {
      dragOffset.value = dragOffset.value > 0 ? cardWidth.value : -cardWidth.value;
    }
    
    // Prevent page scrolling while swiping
    if (Math.abs(dragOffset.value) > 10) {
      e.preventDefault();
    }
  }
};

const touchEnd = () => {
  if (isDragging.value && isMobile.value) {
    const threshold = cardWidth.value * 0.2; // 20% of card width
    
    if (dragOffset.value > threshold) {
      prevTestimonial();
    } else if (dragOffset.value < -threshold) {
      nextTestimonial();
    }
    
    isDragging.value = false;
    dragOffset.value = 0;
    startAutoPlay();
  }
};

// Form submission
const submitTestimonial = async () => {
  try {
    const formData = new FormData();
    
    // Añadir todos los campos al FormData
    Object.keys(newTestimonial.value).forEach(key => {
      if (newTestimonial.value[key] !== null) {
        formData.append(key, newTestimonial.value[key]);
      }
    });
    
    // Asegurarse de que el estado sea 'pendiente'
    formData.append('estado', 'pendiente');
    
    const response = await storeTestimonio(formData);
    
    // Mostrar mensaje de éxito con SweetAlert2
    Swal.fire({
      title: '¡Gracias por compartir tu experiencia!',
      text: 'Tu testimonio será revisado antes de ser publicado.',
      icon: 'success',
      confirmButtonText: 'Aceptar',
      timer: 3000 // Mostrar el mensaje por 3 segundos
    });
    
    // Cerrar el modal y resetear el formulario
    showAddTestimonialForm.value = false;
    newTestimonial.value = {
      nombre_completo: '',
      ocupacion: '',
      experiencia: '',
      calificacion: 5,
      avatar: null
    };
  } catch (error) {
    console.error('Error al enviar testimonio:', error);
    Swal.fire({
      title: 'Error al enviar testimonio',
      text: 'Hubo un problema al enviar tu testimonio. Por favor, inténtalo de nuevo.',
      icon: 'error',
      confirmButtonText: 'Aceptar',
      timer: 3000 // Mostrar el mensaje por 3 segundos
    });
  }
};

const closeModal = (e) => {
  if (e.target.classList.contains('modal')) {
    showAddTestimonialForm.value = false;
  }
};

// Check if device is mobile
const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768;
  
  // Calculate card width for swipe threshold
  nextTick(() => {
    if (testimonialsContainer.value) {
      cardWidth.value = testimonialsContainer.value.offsetWidth;
    }
  });
};

// Color theming
const selectedLocation = inject('selectedLocation', ref('cochabamba'));

const updateColors = (location) => {
  if (location === 'la-paz') {
    document.documentElement.style.setProperty('--primary-color', '#f8a812');
    document.documentElement.style.setProperty('--primary-hover-color', '#e69711');
  } else {
    document.documentElement.style.setProperty('--primary-color', '#3B82F6');
    document.documentElement.style.setProperty('--primary-hover-color', '#2563eb');
  }
};

// Simulate loading
const simulateLoading = () => {
  setTimeout(() => {
    contentLoaded.value = true;
  }, 300);
};

// Lifecycle hooks
onMounted(async () => {
  simulateLoading();
  checkMobile();
  window.addEventListener('resize', checkMobile);
  
  if (selectedLocation.value) {
    updateColors(selectedLocation.value);
  }
  
  // Cargar testimonios activos antes de iniciar el autoplay
  await listarTestimoniosAprobados();
  
  // Solo iniciar autoplay si hay testimonios
  if (testimoniosArray.value && testimoniosArray.value.length > 0) {
    startAutoPlay();
  }
  
  // Add intersection observer for animation on scroll
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
      }
    });
  }, { threshold: 0.1 });
  
  if (testimonialsContainer.value) {
    observer.observe(testimonialsContainer.value);
  }
});

// Watch for changes in selectedLocation
watchEffect(() => {
  if (selectedLocation.value) {
    updateColors(selectedLocation.value);
  }
});

onBeforeUnmount(() => {
  stopAutoPlay();
  window.removeEventListener('resize', checkMobile);
});
</script>

<style scoped>
.debug-info {
  font-family: monospace;
  font-size: 14px;
  margin-bottom: 20px;
}

.loading-testimonials {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 15px;
  font-size: 1.2rem;
  color: var(--text-secondary);
}

.testimonials {
  max-width: 1440px;
  margin: 80px auto;
  padding: 0 20px;
  position: relative;
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.8s ease, transform 0.8s ease;
}

.testimonials.fade-in {
  opacity: 1;
  transform: translateY(0);
}

.section-title {
  text-align: center;
  font-size: 2.5rem;
  font-weight: 800;
  color: var(--text-primary, #333);
  margin-bottom: 40px;
  position: relative;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  height: 4px;
  background-color: var(--primary-color, #3B82F6);
  border-radius: 2px;
}

.highlight {
  color: var(--primary-color, #3B82F6);
}

.testimonials-container {
  position: relative;
  overflow: hidden;
  border-radius: 15px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
  background-color: white;
}

.testimonial-track {
  display: flex;
  transition: transform 0.5s ease;
  width: 100%;
}

.testimonial-card {
  flex: 0 0 100%;
  background: white;
  padding: 40px;
  position: relative;
  display: flex;
  align-items: center;
  min-height: 300px;
  transition: opacity 0.3s ease, transform 0.5s ease;
  opacity: 0; /* Cambiado de 1 a 0 para que solo la activa sea visible */
  z-index: 1;
}

.testimonial-card.active {
  opacity: 1;
  z-index: 2;
}

.quote-mark {
  font-size: 120px;
  color: #e1e5ea;
  font-family: serif;
  position: absolute;
  line-height: 1;
  z-index: 0;
  user-select: none;
}

.quote-mark.start {
  top: 20px;
  left: 20px;
}

.quote-mark.end {
  bottom: 20px;
  right: 20px;
}

.testimonial-content {
  width: 100%;
  text-align: center;
  z-index: 1;
  position: relative;
}

.testimonial-text {
  font-size: 1.2rem;
  color: var(--text-secondary, #666);
  line-height: 1.8;
  margin-bottom: 30px;
  max-width: 800px;
  margin: 0 auto 30px;
  position: relative;
}

.testimonial-author {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
}

.author-avatar {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background-color: var(--primary-color, #3B82F6);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  font-weight: bold;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.author-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.author-info {
  text-align: left;
}

.author-name {
  color: var(--primary-color, #3B82F6);
  font-size: 1.3rem;
  font-weight: 700;
  margin-bottom: 5px;
}

.author-role {
  color: var(--text-secondary, #666);
  font-size: 0.95rem;
}

.rating {
  margin-top: 8px;
  display: flex;
  gap: 2px;
}

.star {
  color: #ddd;
  font-size: 1.1rem;
}

.star.filled {
  color: var(--star-color, #FFD700);
}

.star.half-filled {
  position: relative;
  color: #ddd;
}

.star.half-filled::before {
  content: '★';
  position: absolute;
  color: var(--star-color, #FFD700);
  width: 50%;
  overflow: hidden;
}

/* Navigation Arrows */
.nav-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  color: var(--text-primary, #333);
  transition: all 0.3s ease;
}

.nav-arrow:hover {
  background: var(--primary-color, #3B82F6);
  color: white;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
}

.nav-arrow.prev {
  left: 15px;
}

.nav-arrow.next {
  right: 15px;
}

/* Indicators */
.indicators {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 20px;
}

.indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #ddd;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.indicator.active {
  background: var(--primary-color, #3B82F6);
  transform: scale(1.2);
}

.indicator:hover {
  background: #ccc;
}

.indicator.active:hover {
  background: var(--primary-color, #3B82F6);
}

/* Add Testimonial CTA */
.testimonial-cta {
  margin-top: 50px;
  text-align: center;
  padding: 30px;
  background: linear-gradient(to right, rgba(59, 130, 246, 0.05), rgba(59, 130, 246, 0.1));
  border-radius: 12px;
}

.testimonial-cta p {
  font-size: 1.1rem;
  color: var(--text-secondary, #666);
  margin-bottom: 15px;
}

.add-testimonial-btn {
  background-color: var(--primary-color, #3B82F6);
  color: white;
  border: none;
  padding: 12px 25px;
  border-radius: 50px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin: 0 auto;
  transition: all 0.3s ease;
  font-size: 1rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.add-testimonial-btn:hover {
  background-color: var(--primary-hover-color, #2563eb);
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.add-testimonial-btn svg {
  transition: transform 0.3s ease;
}

.add-testimonial-btn:hover svg {
  transform: translateX(3px);
}

/* Modal */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  animation: fadeIn 0.3s ease;
}

.modal-content {
  background: white;
  border-radius: 12px;
  padding: 30px;
  width: 100%;
  max-width: 500px;
  position: relative;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  animation: slideUp 0.4s ease;
}

.close-modal {
  position: absolute;
  top: 15px;
  right: 20px;
  background: transparent;
  border: none;
  font-size: 1.8rem;
  cursor: pointer;
  color: #999;
  transition: color 0.3s ease;
}

.close-modal:hover {
  color: #333;
}

.modal-content h3 {
  font-size: 1.5rem;
}

.close-modal:hover {
  color: #333;
}

.modal-content h3 {
  font-size: 1.5rem;
  color: var(--text-primary, #333);
  margin-bottom: 20px;
  text-align: center;
}

.testimonial-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.form-group label {
  font-size: 0.95rem;
  color: var(--text-secondary, #666);
  font-weight: 500;
}

.form-group input,
.form-group textarea {
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.form-group input:focus,
.form-group textarea:focus {
  border-color: var(--primary-color, #3B82F6);
  outline: none;
}

.rating-selector {
  display: flex;
  gap: 5px;
}

.rating-star {
  background: transparent;
  border: none;
  font-size: 1.5rem;
  color: #ddd;
  cursor: pointer;
  transition: color 0.2s ease;
}

.rating-star.selected {
  color: var(--star-color, #FFD700);
}

.submit-btn {
  background-color: var(--primary-color, #3B82F6);
  color: white;
  border: none;
  padding: 12px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
  margin-top: 10px;
}

.submit-btn:hover {
  background-color: var(--primary-hover-color, #2563eb);
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.testimonial-content {
  animation: fadeIn 0.5s ease;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .section-title {
    font-size: 2.2rem;
  }

  .testimonial-text {
    font-size: 1.1rem;
  }
}

@media (max-width: 768px) {
  .testimonials {
    margin: 60px auto;
  }

  .section-title {
    font-size: 1.9rem;
    margin-bottom: 30px;
  }

  .testimonial-card {
    padding: 30px 20px;
    min-height: auto;
  }

  .quote-mark {
    font-size: 80px;
  }

  .quote-mark.start {
    top: 10px;
    left: 10px;
  }

  .quote-mark.end {
    bottom: 10px;
    right: 10px;
  }

  .testimonial-text {
    font-size: 1rem;
    margin-bottom: 25px;
  }

  .author-avatar {
    width: 60px;
    height: 60px;
    font-size: 1.2rem;
  }

  .author-name {
    font-size: 1.1rem;
  }

  .nav-arrow {
    width: 36px;
    height: 36px;
  }

  .nav-arrow.prev {
    left: 10px;
  }

  .nav-arrow.next {
    right: 10px;
  }

  .testimonial-cta {
    padding: 25px 20px;
    margin-top: 40px;
  }
}

@media (max-width: 640px) {
  .testimonial-card {
    padding: 25px 15px 30px;
  }

  .quote-mark {
    font-size: 60px;
  }

  .quote-mark.start {
    top: 5px;
    left: 5px;
  }

  .quote-mark.end {
    bottom: 5px;
    right: 5px;
  }

  .testimonial-text {
    font-size: 0.95rem;
    line-height: 1.6;
  }

  .testimonial-author {
    flex-direction: column;
    gap: 10px;
  }

  .author-info {
    text-align: center;
  }

  .author-avatar {
    width: 55px;
    height: 55px;
    font-size: 1.1rem;
  }

  .nav-arrow {
    width: 32px;
    height: 32px;
    opacity: 0.8;
  }

  .section-title {
    font-size: 1.7rem;
  }

  .add-testimonial-btn {
    padding: 10px 20px;
    font-size: 0.95rem;
  }
}
</style>