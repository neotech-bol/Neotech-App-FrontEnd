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
        <div v-for="(testimonial, index) in testimonials" 
             :key="index" 
             class="testimonial-card"
             :class="{ 'active': currentIndex === index, 'prev': getPrevIndex() === index, 'next': getNextIndex() === index }">
          
          <div class="quote-mark start">"</div>
          
          <div class="testimonial-content">
            <p class="testimonial-text">{{ testimonial.text }}</p>
            <div class="testimonial-author">
              <div class="author-avatar" :style="getAvatarStyle(testimonial)">
                <span v-if="!testimonial.avatar">{{ getInitials(testimonial.name) }}</span>
                <img v-else :src="testimonial.avatar" :alt="testimonial.name" />
              </div>
              <div class="author-info">
                <h3 class="author-name">{{ testimonial.name }}</h3>
                <p class="author-role">{{ testimonial.role }}</p>
                <div class="rating">
                  <span v-for="star in 5" :key="star" class="star" 
                        :class="{ 'filled': star <= testimonial.rating, 'half-filled': star - 0.5 === testimonial.rating }">
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
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>
      <button class="nav-arrow next" @click="nextTestimonial" aria-label="Testimonio siguiente">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>
    </div>

    <!-- Indicators -->
    <div class="indicators">
      <button 
        v-for="(_, index) in testimonials" 
        :key="index"
        :class="['indicator', { active: currentIndex === index }]"
        @click="setTestimonial(index)"
        :aria-label="`Ver testimonio de ${testimonials[index].name}`"
      ></button>
    </div>
    
    <!-- Add Testimonial CTA -->
    <div class="testimonial-cta">
      <p>¿Has tenido una buena experiencia con nosotros?</p>
      <button class="add-testimonial-btn" @click="showAddTestimonialForm = true">
        Comparte tu opinión
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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
            <input type="text" id="name" v-model="newTestimonial.name" required>
          </div>
          <div class="form-group">
            <label for="role">Ocupación</label>
            <input type="text" id="role" v-model="newTestimonial.role" required>
          </div>
          <div class="form-group">
            <label for="testimonial">Tu experiencia</label>
            <textarea id="testimonial" v-model="newTestimonial.text" rows="4" required></textarea>
          </div>
          <div class="form-group">
            <label>Calificación</label>
            <div class="rating-selector">
              <button 
                v-for="rating in 5" 
                :key="rating" 
                type="button"
                class="rating-star" 
                :class="{ 'selected': rating <= newTestimonial.rating }"
                @click="newTestimonial.rating = rating"
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
import { ref, computed, onMounted, onBeforeUnmount, inject, watchEffect, nextTick } from 'vue';

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
const testimonials = ref([
  {
    text: "NeoTech ha cambiado la forma en la que compro productos internacionales. Su atención personalizada y claridad en el proceso son lo que más valoro como cliente.",
    name: "Andrea Rojas",
    role: "Emprendedora",
    rating: 5,
    avatar: null
  },
  {
    text: "Excelente servicio y atención al cliente. Los tiempos de entrega son precisos y el proceso es muy transparente. Recomendaría NeoTech a cualquier persona que busque importar productos de calidad.",
    name: "Carlos Mendoza",
    role: "Empresario",
    rating: 4.5,
    avatar: null
  },
  {
    text: "La mejor opción para importar productos. Su plataforma es intuitiva y el seguimiento en tiempo real es muy útil. He realizado varias compras y siempre han cumplido con los plazos establecidos.",
    name: "María González",
    role: "Comerciante",
    rating: 5,
    avatar: null
  },
  {
    text: "Después de probar varias opciones, NeoTech es definitivamente la mejor. Su equipo de soporte responde rápidamente y siempre están dispuestos a ayudar con cualquier consulta.",
    name: "Juan Pérez",
    role: "Diseñador",
    rating: 4,
    avatar: null
  }
]);

// New testimonial form data
const newTestimonial = ref({
  name: '',
  role: '',
  text: '',
  rating: 5,
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
  return name.split(' ').map(n => n[0]).join('').toUpperCase();
};

const getAvatarStyle = (testimonial) => {
  // Generate a consistent color based on the name
  const hash = testimonial.name.split('').reduce((acc, char) => {
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
  return (currentIndex.value - 1 + testimonials.value.length) % testimonials.value.length;
};

const getNextIndex = () => {
  return (currentIndex.value + 1) % testimonials.value.length;
};

// Navigation functions
const nextTestimonial = () => {
  currentIndex.value = getNextIndex();
  resetAutoPlay();
};

const prevTestimonial = () => {
  currentIndex.value = getPrevIndex();
  resetAutoPlay();
};

const setTestimonial = (index) => {
  currentIndex.value = index;
  resetAutoPlay();
};

// Auto-play functions
const startAutoPlay = () => {
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
const submitTestimonial = () => {
  // In a real app, you would send this to your backend
  // For demo purposes, we'll just add it to the local array
  testimonials.value.push({...newTestimonial.value});
  
  // Reset form
  newTestimonial.value = {
    name: '',
    role: '',
    text: '',
    rating: 5,
    avatar: null
  };
  
  // Close modal
  showAddTestimonialForm.value = false;
  
  // Show success message
  alert('¡Gracias por compartir tu experiencia!');
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
onMounted(() => {
  simulateLoading();
  checkMobile();
  window.addEventListener('resize', checkMobile);
  
  if (selectedLocation.value) {
    updateColors(selectedLocation.value);
  }
  
  startAutoPlay();
  
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
  color: var(--text-primary);
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
  background-color: var(--primary-color);
  border-radius: 2px;
}

.highlight {
  color: var(--primary-color);
}

.testimonials-container {
  position: relative;
  overflow: hidden;
  border-radius: 15px;
  box-shadow: var(--card-shadow);
  margin-bottom: 30px;
}

.testimonial-track {
  display: flex;
  transition: transform 0.5s ease;
  width: 100%;
}

.testimonial-card {
  flex: 0 0 100%;
  background: var(--card-bg);
  padding: 40px;
  position: relative;
  display: flex;
  align-items: center;
  min-height: 300px;
  transition: opacity 0.3s ease, transform 0.5s ease;
}

.testimonial-card.active {
  opacity: 1;
  z-index: 2;
}

.testimonial-card.prev,
.testimonial-card.next {
  opacity: 0;
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
  color: var(--text-secondary);
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
  background-color: var(--primary-color);
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
  color: var(--primary-color);
  font-size: 1.3rem;
  font-weight: 700;
  margin-bottom: 5px;
}

.author-role {
  color: var(--text-secondary);
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
  color: var(--star-color);
}

.star.half-filled {
  position: relative;
  color: #ddd;
}

.star.half-filled::before {
  content: '★';
  position: absolute;
  color: var(--star-color);
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
  color: var(--text-primary);
  transition: all 0.3s ease;
}

.nav-arrow:hover {
  background: var(--primary-color);
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
  background: var(--primary-color);
  transform: scale(1.2);
}

.indicator:hover {
  background: #ccc;
}

.indicator.active:hover {
  background: var(--primary-color);
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
  color: var(--text-secondary);
  margin-bottom: 15px;
}

.add-testimonial-btn {
  background-color: var(--primary-color);
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
  background-color: var(--primary-hover-color);
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
  color: var(--text-primary);
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
  color: var(--text-secondary);
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
  border-color: var(--primary-color);
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
  color: var(--star-color);
}

.submit-btn {
  background-color: var(--primary-color);
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
  background-color: var(--primary-hover-color);
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
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

@media (max-width: 480px) {
  .testimonials {
    margin: 50px auto;
    padding: 0 15px;
  }
  
  .section-title {
    font-size: 1.5rem;
  }
  
  .section-title::after {
    width: 60px;
    height: 3px;
  }
  
  .testimonial-card {
    padding: 20px 15px 25px;
  }
  
  .testimonial-text {
    font-size: 0.9rem;
    margin-bottom: 20px;
  }
  
  .author-name {
    font-size: 1rem;
  }
  
  .author-role {
    font-size: 0.85rem;
  }
  
  .star {
    font-size: 0.9rem;
  }
  
  .modal-content {
    padding: 20px 15px;
  }
  
  .close-modal {
    top: 10px;
    right: 15px;
    font-size: 1.5rem;
  }
  
  .modal-content h3 {
    font-size: 1.3rem;
    margin-bottom: 15px;
  }
  
  .form-group input,
  .form-group textarea {
    padding: 10px;
    font-size: 0.9rem;
  }
  
  .rating-star {
    font-size: 1.3rem;
  }
}

/* Touch device optimizations */
@media (hover: none) {
  .nav-arrow {
    opacity: 0.9;
    background: rgba(255, 255, 255, 0.9);
  }
  
  .add-testimonial-btn:active {
    transform: scale(0.98);
  }
  
  .indicator:active {
    transform: scale(1.1);
  }
  
  .indicator.active:active {
    transform: scale(1.2);
  }
}

/* Accessibility Improvements */
@media (prefers-reduced-motion: reduce) {
  .testimonials,
  .testimonial-card,
  .nav-arrow,
  .indicator,
  .add-testimonial-btn,
  .modal,
  .modal-content,
  .testimonial-track {
    transition: none;
    animation: none;
  }
  
  .testimonials {
    opacity: 1;
    transform: none;
  }
  
  .add-testimonial-btn:hover {
    transform: none;
  }
}
</style>