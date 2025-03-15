<template>
  <div class="about-container">
    <div class="about-grid">
      <!-- Enhanced Image Gallery with Touch Support -->
      <div class="image-gallery">
        <swiper-container 
          class="mobile-swiper"
          :slides-per-view="1"
          :space-between="10"
          :pagination="true"
          :autoplay="{ delay: 3000, disableOnInteraction: false }"
          :loop="true"
          :effect="'fade'"
          :navigation="true"
        >
          <swiper-slide v-for="(image, index) in images" :key="`mobile-${index}`">
            <div class="image-card mobile-card">
              <img :src="image.src" :alt="image.alt" loading="lazy" class="gallery-image" />
              <div class="image-overlay active">
                <span class="image-caption">{{ image.caption }}</span>
              </div>
            </div>
          </swiper-slide>
        </swiper-container>

        <!-- Desktop Gallery -->
        <div class="desktop-gallery">
          <div v-for="(image, index) in images" :key="`desktop-${index}`" 
               :class="['image-card', image.size]"
               @mouseenter="hoveredImage = index" 
               @mouseleave="hoveredImage = null"
               @click="openLightbox(index)">
            <img :src="image.src" :alt="image.alt" loading="lazy" :class="['gallery-image', `img-${index + 1}`]" />
            <div class="image-overlay" :class="{ active: hoveredImage === index }">
              <span class="image-caption">{{ image.caption }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="content-section" :class="{ 'fade-in': contentLoaded }">
        <div class="section-header">
          <h2 class="title">¿Quiénes <span class="highlight">Somos</span>?</h2>
          <h3 class="subtitle">LIDERANDO LA IMPORTACIÓN INTELIGENTE EN BOLIVIA DESDE 2019</h3>
        </div>

        <div class="description">
          <div v-for="(paragraph, index) in paragraphs" :key="index" class="paragraph-container">
            <p>{{ paragraph }}</p>
          </div>

          <div class="stats-container">
            <div v-for="(stat, index) in stats" :key="index" class="stat-item" :style="{ animationDelay: `${index * 0.2}s` }">
              <div class="stat-icon">
                <i :class="stat.icon"></i>
              </div>
              <div class="stat-value">{{ stat.value }}</div>
              <div class="stat-label">{{ stat.label }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Lightbox for image viewing -->
    <div class="lightbox" v-if="lightboxOpen" @click="closeLightbox">
      <div class="lightbox-content" @click.stop>
        <button class="lightbox-close" @click="closeLightbox">×</button>
        <img :src="images[currentLightboxImage].src" :alt="images[currentLightboxImage].alt" class="lightbox-image" />
        <div class="lightbox-caption">{{ images[currentLightboxImage].caption }}</div>
        <button class="lightbox-nav prev" @click.stop="prevImage">&lt;</button>
        <button class="lightbox-nav next" @click.stop="nextImage">&gt;</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
const hoveredImage = ref(null);
const contentLoaded = ref(false);
const lightboxOpen = ref(false);
const currentLightboxImage = ref(0);
const isMobile = ref(false);

// Enhanced data for images with captions instead of size notes
const images = ref([
  {
    src: "/imagenes/working-business-project.jpg",
    alt: "Trabajador con tablet",
    size: "large",
    caption: "Innovación y tecnología al servicio de nuestros clientes"
  },
  {
    src: "/imagenes/sobre-nosotros.jpg",
    alt: "Contenedores",
    size: "small",
    caption: "Logística internacional eficiente"
  },
  {
    src: "/imagenes/about-us-marker.jpg",
    alt: "Barco de carga",
    size: "small",
    caption: "Transporte marítimo de mercancías"
  }
]);

// Texto para los párrafos
const paragraphs = ref([
  "NeoTech - Bol fue fundada en 2019 por Jaime Jaldín Ninavia con el objetivo de ofrecer a los bolivianos una forma innovadora y accesible de adquirir productos de calidad internacional. Nos especializamos en la Importación de bienes por ciclos, adaptándonos a las necesidades de nuestros clientes y asegurando siempre las mejores condiciones en precio y disponibilidad.",
  "Actualmente, contamos con una base de más de 2,400 clientes satisfechos en todo el país, quienes confían en nuestra experiencia y profesionalismo. Aunque operamos principalmente de forma virtual a través de redes sociales, también ofrecemos atención personalizada en nuestra oficina ubicada en Cochabamba."
]);

// Estadísticas destacadas con iconos
const stats = ref([
  { value: "2,400+", label: "Clientes Satisfechos", icon: "fas fa-users" },
  { value: "5", label: "Años de Experiencia", icon: "fas fa-calendar-check" },
  { value: "3", label: "Ciudades Principales", icon: "fas fa-map-marker-alt" }
]);

// Check if device is mobile
const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768;
};

// Lightbox functions
const openLightbox = (index) => {
  if (isMobile.value) return; // Don't open lightbox on mobile
  currentLightboxImage.value = index;
  lightboxOpen.value = true;
  document.body.style.overflow = 'hidden'; // Prevent scrolling when lightbox is open
};

const closeLightbox = () => {
  lightboxOpen.value = false;
  document.body.style.overflow = ''; // Restore scrolling
};

const nextImage = () => {
  currentLightboxImage.value = (currentLightboxImage.value + 1) % images.value.length;
};

const prevImage = () => {
  currentLightboxImage.value = (currentLightboxImage.value - 1 + images.value.length) % images.value.length;
};

// Handle keyboard navigation for lightbox
const handleKeyDown = (e) => {
  if (!lightboxOpen.value) return;
  
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowRight') nextImage();
  if (e.key === 'ArrowLeft') prevImage();
};

const preloadImages = () => {
  const imagePromises = images.value.map(image => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = image.src;
      img.onload = resolve;
      img.onerror = reject;
    });
  });

  Promise.all(imagePromises)
    .then(() => {
      contentLoaded.value = true;
    })
    .catch(error => {
      console.error('Error al cargar imágenes:', error);
      contentLoaded.value = true; // Mostrar el contenido de todas formas
    });
};

onMounted(() => {
  preloadImages();
  checkMobile();
  window.addEventListener('resize', checkMobile);
  window.addEventListener('keydown', handleKeyDown);
  
  // Add animation to stats when they come into view
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate');
      }
    });
  }, { threshold: 0.2 });
  
  document.querySelectorAll('.stat-item').forEach(item => {
    observer.observe(item);
  });
});

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile);
  window.removeEventListener('keydown', handleKeyDown);
});
</script>

<style scoped>
.about-container {
  max-width: 1440px;
  margin: 0 auto;
  padding: 60px 20px;
}

.about-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;
}

/* Mobile Swiper */
.mobile-swiper {
  display: none;
  width: 100%;
  height: 300px;
  border-radius: 12px;
  overflow: hidden;
}

.mobile-card {
  width: 100%;
  height: 100%;
  position: relative;
}

/* Desktop Gallery */
.desktop-gallery {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, 200px);
  gap: 20px;
}

.image-card {
  position: relative;
  overflow: hidden;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
}

.image-card.large {
  grid-row: 1 / 3;
  grid-column: 1;
  height: 420px;
}

.image-card.small {
  height: 200px;
}

.gallery-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.image-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

.image-card:hover .gallery-image {
  transform: scale(1.08);
}

.image-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
  height: 100%;
  display: flex;
  align-items: flex-end;
  padding: 15px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.image-overlay.active {
  opacity: 1;
}

.image-caption {
  color: white;
  font-size: 0.95rem;
  font-weight: 500;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.5);
}

/* Lightbox */
.lightbox {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.lightbox-content {
  position: relative;
  max-width: 90%;
  max-height: 90%;
}

.lightbox-image {
  max-width: 100%;
  max-height: 80vh;
  object-fit: contain;
  border-radius: 4px;
}

.lightbox-caption {
  color: white;
  text-align: center;
  padding: 15px;
  font-size: 1.1rem;
}

.lightbox-close {
  position: absolute;
  top: -40px;
  right: 0;
  background: transparent;
  border: none;
  color: white;
  font-size: 2rem;
  cursor: pointer;
}

.lightbox-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.3s;
}

.lightbox-nav:hover {
  background: rgba(255, 255, 255, 0.4);
}

.lightbox-nav.prev {
  left: -60px;
}

.lightbox-nav.next {
  right: -60px;
}

/* Content Section */
.content-section {
  padding: 20px 0;
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.8s ease, transform 0.8s ease;
}

.content-section.fade-in {
  opacity: 1;
  transform: translateY(0);
}

.section-header {
  margin-bottom: 40px;
}

.title {
  font-size: 2.75rem;
  font-weight: 800;
  color: #333;
  margin-bottom: 1rem;
  position: relative;
}

.title::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 0;
  width: 80px;
  height: 4px;
  background-color: var(--primary-color, #3498db);
  border-radius: 2px;
}

.highlight {
  color: var(--primary-color, #3498db);
  position: relative;
}

.subtitle {
  font-size: 1.2rem;
  color: #666;
  margin-top: 20px;
  font-weight: 600;
  letter-spacing: 1px;
}

.description {
  color: #555;
  line-height: 1.8;
}

.paragraph-container {
  margin-bottom: 25px;
}

.paragraph-container p {
  text-align: justify;
  font-size: 1.05rem;
}

/* Enhanced Statistics */
.stats-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-top: 40px;
  text-align: center;
}

.stat-item {
  padding: 25px 20px;
  background-color: #f9f9f9;
  border-radius: 12px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  opacity: 0;
  transform: translateY(20px);
}

.stat-item.animate {
  animation: fadeInUp 0.6s forwards;
}

.stat-icon {
  font-size: 2rem;
  color: var(--primary-color, #3498db);
  margin-bottom: 15px;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--primary-color, #3498db);
  margin-bottom: 5px;
}

.stat-label {
  font-size: 0.95rem;
  color: #666;
  font-weight: 500;
}

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

/* Responsive Design - Enhanced for Mobile */
@media (max-width: 1024px) {
  .about-grid {
    gap: 40px;
  }

  .title {
    font-size: 2.25rem;
  }
}

@media (max-width: 968px) {
  .about-grid {
    grid-template-columns: 1fr;
    gap: 50px;
  }

  .desktop-gallery {
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 350px 200px;
  }

  .content-section {
    order: 0;
  }

  .image-gallery {
    order: 1;
  }

  .image-card.large {
    grid-row: auto;
    grid-column: span 2;
    height: 350px;
  }

  .image-card.small {
    height: 200px;
  }
}

@media (max-width: 768px) {
  /* Switch to mobile swiper view */
  .desktop-gallery {
    display: none;
  }
  
  .mobile-swiper {
    display: block;
  }
  
  .stats-container {
    grid-template-columns: repeat(2, 1fr);
  }

  .stat-item:last-child {
    grid-column: span 2;
  }
  
  .lightbox-nav.prev {
    left: -40px;
  }

  .lightbox-nav.next {
    right: -40px;
  }
}

@media (max-width: 640px) {
  .about-container {
    padding: 40px 15px;
  }

  .title {
    font-size: 2rem;
  }

  .subtitle {
    font-size: 1rem;
  }

  .stats-container {
    grid-template-columns: 1fr;
    gap: 15px;
  }

  .stat-item {
    padding: 20px 15px;
  }

  .stat-item:last-child {
    grid-column: span 1;
  }
  
  .mobile-swiper {
    height: 250px;
  }
  
  .lightbox-nav {
    width: 35px;
    height: 35px;
  }
  
  .lightbox-nav.prev {
    left: 10px;
  }

  .lightbox-nav.next {
    right: 10px;
  }
}

@media (max-width: 480px) {
  .title {
    font-size: 1.75rem;
  }

  .subtitle {
    font-size: 0.9rem;
  }

  .paragraph-container p {
    font-size: 0.95rem;
  }

  .stat-value {
    font-size: 1.75rem;
  }

  .stat-label {
    font-size: 0.85rem;
  }
  
  .mobile-swiper {
    height: 200px;
  }
  
  .image-caption {
    font-size: 0.85rem;
  }
}

/* Touch device optimizations */
@media (hover: none) {
  .image-overlay {
    opacity: 1;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.1), transparent);
  }
  
  .image-card:active {
    transform: scale(0.98);
  }
}

/* Accessibility improvements */
@media (prefers-reduced-motion: reduce) {
  .image-card,
  .gallery-image,
  .content-section,
  .stat-item {
    transition: none;
  }
  
  .stat-item.animate {
    animation: none;
    opacity: 1;
    transform: none;
  }
}
</style>