<template>
  <section class="services-section" :class="{ 'fade-in': contentLoaded }">
    <div class="services-header">
      <h2>Nuestros <span class="highlight">Servicios</span></h2>
      <p>Nuestro objetivo es simplificar el proceso de importación y garantizar que encuentres exactamente lo que
        necesitas.</p>
    </div>

    <!-- Mobile Accordion View -->
    <div class="services-accordion" v-if="isMobile">
      <div v-for="(service, index) in services" :key="`mobile-${index}`" class="accordion-item"
        :class="{ 'active': expandedService === index }">
        <div class="accordion-header" @click="toggleAccordion(index)">
          <div class="icon" :style="{ backgroundColor: `var(--service-bg-${index})` }">
            <component :is="service.icon" class="service-icon" />
          </div>
          <h3>{{ service.title }}</h3>
          <div class="accordion-arrow">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>
        </div>
        <div class="accordion-content" :style="accordionHeight(index)">
          <div class="accordion-inner">
            <p>{{ service.description }}</p>
            <ul>
              <li v-for="(detail, detailIndex) in service.details" :key="`mobile-detail-${detailIndex}`">
                {{ detail }}
              </li>
            </ul>
            <button class="mobile-action-btn" @click="contactForService(service.title)">
              Solicitar servicio
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M5 12h14M12 5l7 7-7 7"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Desktop Card View -->
    <div class="services-grid" v-else>
      <div v-for="(service, index) in services" :key="`desktop-${index}`" class="service-card"
        :class="{ 'active': hoveredService === index }" @mouseenter="hoveredService = index"
        @mouseleave="hoveredService = null">
        <div class="service-content">
          <div class="icon-container">
            <div class="icon" :style="{ backgroundColor: `var(--service-bg-${index})` }">
              <component :is="service.icon" class="service-icon" />
            </div>
          </div>
          <h3>{{ service.title }}</h3>
          <p>{{ service.description }}</p>
          <div class="service-details" :class="{ 'expanded': hoveredService === index }">
            <ul>
              <li v-for="(detail, detailIndex) in service.details" :key="`desktop-detail-${detailIndex}`">
                {{ detail }}
              </li>
            </ul>
          </div>
        </div>
        <div class="card-footer">
          <button class="learn-more-btn" @click="toggleDetails(index)">
            {{ hoveredService === index ? 'Menos detalles' : 'Conocer más' }}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 12h14M12 5l7 7-7 7"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Swipeable Service Cards for Tablets -->
    <div class="services-swiper" v-if="isTablet && !isMobile">
      <button class="swiper-nav prev" @click="scrollServices('left')" :disabled="scrollPosition <= 0">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>
      <div class="swiper-container" ref="swiperContainer" @touchstart="touchStart" @touchmove="touchMove" @touchend="touchEnd">
        <div v-for="(service, index) in services" :key="`swiper-${index}`" class="swiper-card"
          :class="{ 'active': hoveredService === index }">
          <div class="icon" :style="{ backgroundColor: `var(--service-bg-${index})` }">
            <component :is="service.icon" class="service-icon" />
          </div>
          <h3>{{ service.title }}</h3>
          <p>{{ service.description }}</p>
          <button class="swiper-action-btn" @click="contactForService(service.title)">
            Solicitar
          </button>
        </div>
      </div>
      <button class="swiper-nav next" @click="scrollServices('right')" 
              :disabled="scrollPosition >= maxScrollPosition">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>
      <div class="swiper-indicators">
        <span v-for="(_, index) in services" :key="`indicator-${index}`" 
              class="indicator" :class="{ 'active': currentSlide === index }"></span>
      </div>
    </div>

<!--     <div class="services-cta">
      <h3>¿Necesitas un servicio personalizado?</h3>
      <p>Contáctanos para discutir opciones adaptadas a tus necesidades específicas.</p>
      <button class="contact-btn" @click="contactUs">Contactar ahora</button>
    </div> -->
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, h, nextTick } from 'vue';

const hoveredService = ref(null);
const expandedService = ref(null);
const contentLoaded = ref(false);
const isMobile = ref(false);
const isTablet = ref(false);
const swiperContainer = ref(null);
const scrollPosition = ref(0);
const maxScrollPosition = ref(0);
const currentSlide = ref(0);
const touchStartX = ref(0);
const accordionContentRefs = ref({});

// Definición de iconos como componentes funcionales
const DownloadIcon = () => h('svg', {
  width: '40',
  height: '40',
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  'stroke-width': '2',
  innerHTML: '<path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-6M12 12l-4-4m4 4l4-4m-4 4V3"/>'
});

const ShieldIcon = () => h('svg', {
  width: '40',
  height: '40',
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  'stroke-width': '2',
  innerHTML: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>'
});

const ClockIcon = () => h('svg', {
  width: '40',
  height: '40',
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  'stroke-width': '2',
  innerHTML: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>'
});

const UserIcon = () => h('svg', {
  width: '40',
  height: '40',
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  'stroke-width': '2',
  innerHTML: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>'
});

// Datos de servicios
const services = ref([
  {
    icon: DownloadIcon,
    title: 'Catálogo Renovado',
    description: 'Productos nuevos en cada ciclo de compra para mantenerte a la vanguardia.',
    details: [
      'Actualizaciones mensuales',
      'Tendencias internacionales',
      'Ofertas exclusivas'
    ]
  },
  {
    icon: ShieldIcon,
    title: 'Calidad Garantizada',
    description: 'Solo trabajamos con marcas confiables y productos verificados.',
    details: [
      'Certificación de autenticidad',
      'Garantía de devolución',
      'Inspección pre-envío'
    ]
  },
  {
    icon: ClockIcon,
    title: 'Seguimiento en tiempo real',
    description: 'Monitorea el estado de tus pedidos fácilmente desde cualquier dispositivo.',
    details: [
      'Actualizaciones automáticas',
      'Notificaciones por correo/SMS',
      'Panel de control personalizado'
    ]
  },
  {
    icon: UserIcon,
    title: 'Atención personalizada',
    description: 'Trato cercano y profesional por parte de nuestro equipo de expertos.',
    details: [
      'Asesores especializados',
      'Soporte multicanal',
      'Atención post-venta'
    ]
  }
]);

// Accordion height calculation
const accordionHeight = (index) => {
  if (expandedService.value === index) {
    return { maxHeight: 'fit-content' };
  }
  return { maxHeight: '0px' };
};

// Toggle accordion on mobile
const toggleAccordion = (index) => {
  expandedService.value = expandedService.value === index ? null : index;
};

// Toggle details on desktop
const toggleDetails = (index) => {
  hoveredService.value = hoveredService.value === index ? null : index;
};

// Scroll services horizontally on tablet
const scrollServices = (direction) => {
  if (!swiperContainer.value) return;
  
  const container = swiperContainer.value;
  const cardWidth = container.querySelector('.swiper-card').offsetWidth + 20; // card width + gap
  
  if (direction === 'left') {
    container.scrollBy({ left: -cardWidth, behavior: 'smooth' });
  } else {
    container.scrollBy({ left: cardWidth, behavior: 'smooth' });
  }
};

// Touch events for swiper
const touchStart = (e) => {
  touchStartX.value = e.touches[0].clientX;
};

const touchMove = (e) => {
  e.preventDefault(); // Prevent page scrolling while swiping
};

const touchEnd = (e) => {
  const touchEndX = e.changedTouches[0].clientX;
  const diff = touchStartX.value - touchEndX;
  
  if (Math.abs(diff) > 50) { // Minimum swipe distance
    if (diff > 0) {
      scrollServices('right');
    } else {
      scrollServices('left');
    }
  }
};

// Update scroll position and current slide
const updateScrollPosition = () => {
  if (!swiperContainer.value) return;
  
  const container = swiperContainer.value;
  scrollPosition.value = container.scrollLeft;
  maxScrollPosition.value = container.scrollWidth - container.clientWidth;
  
  // Calculate current slide
  const cardWidth = container.querySelector('.swiper-card').offsetWidth + 20;
  currentSlide.value = Math.round(scrollPosition.value / cardWidth);
};

// Contact functions
const contactForService = (serviceTitle) => {
  console.log(`Solicitud de servicio: ${serviceTitle}`);
  // Implement your contact logic here
  alert(`Gracias por tu interés en nuestro servicio: ${serviceTitle}. Te contactaremos pronto.`);
};

const contactUs = () => {
  console.log('Contacto general solicitado');
  // Implement your contact logic here
  alert('Gracias por tu interés. Te contactaremos pronto.');
};

// Check device type
const checkDeviceType = () => {
  isMobile.value = window.innerWidth <= 640;
  isTablet.value = window.innerWidth > 640 && window.innerWidth <= 1024;
  
  // Reset expanded service when switching between mobile and desktop
  if (!isMobile.value) {
    expandedService.value = null;
  }
  
  // Update swiper on resize
  nextTick(() => {
    if (isTablet.value && swiperContainer.value) {
      updateScrollPosition();
    }
  });
};

// Simulate loading
const simulateLoading = () => {
  setTimeout(() => {
    contentLoaded.value = true;
  }, 300);
};

// Scroll event handler for swiper
const handleScroll = () => {
  if (isTablet.value && swiperContainer.value) {
    updateScrollPosition();
  }
};

onMounted(() => {
  simulateLoading();
  checkDeviceType();
  window.addEventListener('resize', checkDeviceType);
  
  if (swiperContainer.value) {
    swiperContainer.value.addEventListener('scroll', handleScroll);
    updateScrollPosition();
  }
  
  // Add intersection observer for animation on scroll
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
      }
    });
  }, { threshold: 0.1 });
  
  document.querySelectorAll('.service-card, .accordion-item, .swiper-card').forEach(item => {
    observer.observe(item);
  });
});

onUnmounted(() => {
  window.removeEventListener('resize', checkDeviceType);
  if (swiperContainer.value) {
    swiperContainer.value.removeEventListener('scroll', handleScroll);
  }
});
</script>

<style scoped>
.services-section {
  max-width: 1440px;
  margin: 80px auto;
  padding: 0 20px;
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.8s ease, transform 0.8s ease;
}

.services-section.fade-in {
  opacity: 1;
  transform: translateY(0);
}

.services-header {
  text-align: center;
  margin-bottom: 60px;
}

.services-header h2 {
  font-size: 2.5rem;
  font-weight: 800;
  color: #333;
  margin-bottom: 20px;
  position: relative;
  display: inline-block;
}

.services-header h2::after {
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

.services-header p {
  color: #666;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.8;
  font-size: 1.1rem;
}

/* Desktop Grid View */
.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 30px;
}

.service-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  transition: all 0.4s ease;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  border: 1px solid #eee;
  position: relative;
  opacity: 0;
  transform: translateY(20px);
  animation: fadeInUp 0.6s forwards;
  animation-delay: calc(var(--index, 0) * 0.1s);
}

.service-card.in-view {
  opacity: 1;
  transform: translateY(0);
}

.service-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: var(--primary-color);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.4s ease;
}

.service-card.active::before {
  transform: scaleX(1);
}

.service-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
}

.service-content {
  padding: 35px 30px 25px;
}

.icon-container {
  margin-bottom: 25px;
}

.icon {
  width: 80px;
  height: 80px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: var(--primary-color);
  transition: all 0.3s ease;
}

.service-card:hover .icon {
  transform: scale(1.1);
  color: var(--primary-hover-color);
}

.service-icon {
  transition: transform 0.4s ease;
}

.service-card:hover .service-icon {
  transform: scale(1.1);
}

.service-card h3 {
  color: #333;
  font-size: 1.3rem;
  font-weight: 700;
  margin-bottom: 15px;
  transition: color 0.3s ease;
}

.service-card:hover h3 {
  color: var(--primary-color);
}

.service-card p {
  color: #666;
  line-height: 1.6;
  margin-bottom: 20px;
}

.service-details {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease, opacity 0.3s ease;
  opacity: 0;
}

.service-details.expanded {
  max-height: 500px;
  opacity: 1;
}

.service-details ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.service-details li {
  position: relative;
  padding-left: 25px;
  margin-bottom: 10px;
  color: #555;
  text-align: left;
}

.service-details li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 10px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: var(--primary-color);
}

.card-footer {
  padding: 20px 30px;
  border-top: 1px solid #f0f0f0;
  margin-top: auto;
}

.learn-more-btn {
  background: transparent;
  border: none;
  color: var(--primary-color);
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 10px 0;
  transition: all 0.3s ease;
}

.learn-more-btn svg {
  transition: transform 0.3s ease;
}

.learn-more-btn:hover {
  color: var(--primary-hover-color);
}

.learn-more-btn:hover svg {
  transform: translateX(5px);
}

/* Mobile Accordion View */
.services-accordion {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 40px;
}

.accordion-item {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  border: 1px solid #eee;
  transition: all 0.3s ease;
  opacity: 0;
  transform: translateY(20px);
  animation: fadeInUp 0.5s forwards;
  animation-delay: calc(var(--index, 0) * 0.1s);
}

.accordion-item.in-view {
  opacity: 1;
  transform: translateY(0);
}

.accordion-item.active {
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.accordion-header {
  display: flex;
  align-items: center;
  padding: 15px;
  cursor: pointer;
  gap: 15px;
  position: relative;
}

.accordion-header .icon {
  width: 50px;
  height: 50px;
  min-width: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.accordion-header .icon svg {
  width: 25px;
  height: 25px;
}

.accordion-header h3 {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
  flex-grow: 1;
}

.accordion-arrow {
  transition: transform 0.3s ease;
}

.accordion-item.active .accordion-arrow {
  transform: rotate(180deg);
}

.accordion-content {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;
}

.accordion-inner {
  padding: 0 15px 20px;
}

.accordion-inner p {
  margin-bottom: 15px;
  color: #666;
  line-height: 1.6;
}

.accordion-inner ul {
  list-style: none;
  padding: 0;
  margin: 0 0 20px 0;
}

.accordion-inner li {
  position: relative;
  padding-left: 25px;
  margin-bottom: 10px;
  color: #555;
}

.accordion-inner li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 10px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: var(--primary-color);
}

.mobile-action-btn {
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  transition: all 0.3s ease;
}

.mobile-action-btn:hover {
  background-color: var(--primary-hover-color);
}

.mobile-action-btn svg {
  transition: transform 0.3s ease;
}

.mobile-action-btn:hover svg {
  transform: translateX(5px);
}

/* Tablet Swiper View */
.services-swiper {
  position: relative;
  margin: 40px 0;
  padding: 20px 0;
}

.swiper-container {
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  gap: 20px;
  padding: 10px 5px;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
  scroll-behavior: smooth;
}

.swiper-container::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}

.swiper-card {
  min-width: 280px;
  flex: 0 0 280px;
  background: #fff;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  border: 1px solid #eee;
  scroll-snap-align: start;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  gap: 15px;
  opacity: 0;
  transform: translateY(20px);
  animation: fadeInUp 0.5s forwards;
}

.swiper-card.in-view {
  opacity: 1;
  transform: translateY(0);
}

.swiper-card .icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 5px;
}

.swiper-card .icon svg {
  width: 30px;
  height: 30px;
}

.swiper-card h3 {
  font-size: 1.2rem;
  font-weight: 700;
  margin: 0 0 10px 0;
  color: #333;
}

.swiper-card p {
  color: #666;
  line-height: 1.6;
  margin: 0 0 15px 0;
  flex-grow: 1;
}

.swiper-action-btn {
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 10px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: auto;
}

.swiper-action-btn:hover {
  background-color: var(--primary-hover-color);
}

.swiper-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: white;
  border: 1px solid #eee;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.swiper-nav:hover {
  background: var(--primary-color);
  color: white;
}

.swiper-nav:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.swiper-nav.prev {
  left: -10px;
}

.swiper-nav.next {
  right: -10px;
}

.swiper-indicators {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 20px;
}

.indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ddd;
  transition: all 0.3s ease;
}

.indicator.active {
  background: var(--primary-color);
  transform: scale(1.2);
}

/* CTA Section */
.services-cta {
  margin-top: 80px;
  text-align: center;
  padding: 50px;
  background: linear-gradient(to right, rgba(52, 152, 219, 0.05), rgba(52, 152, 219, 0.1));
  border-radius: 12px;
}

.services-cta h3 {
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 15px;
  color: #333;
}

.services-cta p {
  max-width: 600px;
  margin: 0 auto 30px;
  color: #666;
  font-size: 1.1rem;
}

.contact-btn {
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 15px 30px;
  border-radius: 50px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.contact-btn:hover {
  background-color: var(--primary-hover-color);
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

/* Animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive Design */
@media (max-width: 1024px) {
  .services-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .services-cta {
    padding: 40px 30px;
  }
  
  .swiper-nav.prev {
    left: 5px;
  }
  
  .swiper-nav.next {
    right: 5px;
  }
}

@media (max-width: 768px) {
  .services-header h2 {
    font-size: 2.2rem;
  }

  .services-cta h3 {
    font-size: 1.6rem;
  }

  .service-card h3 {
    font-size: 1.2rem;
  }
  
  .swiper-card {
    min-width: 250px;
    flex: 0 0 250px;
  }
}

@media (max-width: 640px) {
  .services-section {
    margin: 60px auto;
  }
  
  .services-header {
    margin-bottom: 40px;
  }

  .services-header h2 {
    font-size: 1.9rem;
  }
  
  .services-header p {
    font-size: 1rem;
  }

  .services-cta {
    padding: 30px 20px;
    margin-top: 60px;
  }
  
  .accordion-header .icon {
    width: 40px;
    height: 40px;
    min-width: 40px;
  }
  
  .accordion-header .icon svg {
    width: 20px;
    height: 20px;
  }
  
  .accordion-header h3 {
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .services-section {
    margin: 50px auto;
    padding: 0 15px;
  }

  .services-header h2 {
    font-size: 1.7rem;
  }

  .services-cta h3 {
    font-size: 1.4rem;
  }

  .contact-btn {
    padding: 12px 25px;
    font-size: 0.95rem;
  }
  
  .accordion-item {
    border-radius: 8px;
  }
  
  .accordion-header {
    padding: 12px;
    gap: 10px;
  }
  
  .mobile-action-btn {
    padding: 8px 15px;
    font-size: 0.9rem;
  }
}

/* Touch device optimizations */
@media (hover: none) {
  .service-card:hover {
    transform: none;
  }
  
  .service-card:active {
    transform: scale(0.98);
  }
  
  .learn-more-btn:active svg,
  .mobile-action-btn:active svg {
    transform: translateX(5px);
  }
}

/* Accessibility Improvements */
@media (prefers-reduced-motion: reduce) {
  .services-section,
  .service-card,
  .accordion-item,
  .swiper-card,
  .icon,
  .service-icon,
  .learn-more-btn,
  .contact-btn,
  .accordion-arrow,
  .accordion-content {
    transition: none;
    animation: none;
  }
  
  .service-card,
  .accordion-item,
  .swiper-card {
    opacity: 1;
    transform: none;
  }
}
</style>