<template>
  <div class="carousel-container" ref="carouselContainer" tabindex="0" @keydown="handleKeydown">
    <div class="carousel" @touchstart="touchStart" @touchmove="touchMove" @touchend="touchEnd"
      @mouseenter="pauseAutoSlide" @mouseleave="resumeAutoSlide">
      <transition-group name="slide" tag="div" class="carousel-slides">
        <div v-for="(image, index) in images" :key="index"
          :class="['carousel-slide', { active: currentIndex === index }]"
          :style="{ zIndex: currentIndex === index ? 1 : 0 }">
          <img :src="image.url" :alt="image.alt" class="carousel-image" loading="lazy" @load="onImageLoad" />
          <div class="carousel-overlay">
            <h2 class="carousel-title" v-html="image.title"></h2>
            <a :href="image.ctaLink" class="carousel-cta" @click.prevent="handleCtaClick">
              {{ image.ctaText || 'Ver Colección' }}
            </a>
          </div>
        </div>
      </transition-group>

      <!-- Navigation Controls -->
      <button v-show="!isMobile" @click="prevSlide" class="carousel-control prev" aria-label="Previous slide"
        :disabled="isLoading">
        <i class="fas fa-chevron-left"></i>
      </button>
      <button v-show="!isMobile" @click="nextSlide" class="carousel-control next" aria-label="Next slide"
        :disabled="isLoading">
        <i class="fas fa-chevron-right"></i>
      </button>

      <!-- Indicators -->
      <div class="carousel-indicators">
        <button v-for="(image, index) in images" :key="index" 
          :class="['indicator', { active: currentIndex === index }]"
          @click="goToSlide(index)" 
          :aria-label="`Go to slide ${index + 1}`" 
          :aria-current="currentIndex === index">
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';

const images = ref([
  {
    title: '¡Ofertas disponibles <br/> por tiempo limitado!',
    url: '/imagenes/home-slider-1.png',
    alt: 'Special offer',
    ctaLink: '/productos',
    ctaText: 'Ver Colección'
  },
  // Add more slides here
]);

const currentIndex = ref(0);
const touchStartX = ref(0);
const touchEndX = ref(0);
const carouselContainer = ref(null);
const isLoading = ref(false);
const isPaused = ref(false);
const windowWidth = ref(window.innerWidth);

// Compute isMobile based on window width
const isMobile = computed(() => windowWidth.value <= 768);

let intervalId = null;
let resizeObserver = null;

const goToSlide = (index) => {
  currentIndex.value = index;
  resetAutoSlide();
};

const prevSlide = () => {
  currentIndex.value = (currentIndex.value - 1 + images.value.length) % images.value.length;
  resetAutoSlide();
};

const nextSlide = () => {
  currentIndex.value = (currentIndex.value + 1) % images.value.length;
  resetAutoSlide();
};

const startAutoSlide = () => {
  if (!isPaused.value) {
    intervalId = setInterval(nextSlide, 5000);
  }
};

const resetAutoSlide = () => {
  if (intervalId) clearInterval(intervalId);
  startAutoSlide();
};

const pauseAutoSlide = () => {
  isPaused.value = true;
  if (intervalId) clearInterval(intervalId);
};

const resumeAutoSlide = () => {
  isPaused.value = false;
  startAutoSlide();
};

const touchStart = (e) => {
  touchStartX.value = e.touches[0].clientX;
};

const touchMove = (e) => {
  touchEndX.value = e.touches[0].clientX;
};

const touchEnd = () => {
  const swipeDistance = touchStartX.value - touchEndX.value;
  // Reduced threshold for smaller screens to make swiping more responsive
  const threshold = isMobile.value ? 20 : 30;

  if (Math.abs(swipeDistance) > threshold) {
    swipeDistance > 0 ? nextSlide() : prevSlide();
  }
};

const handleKeydown = (e) => {
  if (e.key === 'ArrowLeft') prevSlide();
  if (e.key === 'ArrowRight') nextSlide();
};

const onImageLoad = () => {
  isLoading.value = false;
};

const handleCtaClick = () => {
  window.location.href = images.value[currentIndex.value].ctaLink;
};

const handleResize = () => {
  windowWidth.value = window.innerWidth;
};

onMounted(() => {
  startAutoSlide();

  // Use Intersection Observer to pause/resume carousel when in/out of viewport
  const intersectionObserver = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        startAutoSlide();
      } else {
        if (intervalId) clearInterval(intervalId);
      }
    },
    { threshold: 0.3 }
  );

  if (carouselContainer.value) {
    intersectionObserver.observe(carouselContainer.value);
  }

  // Better resize handling with debounce
  let resizeTimeout;
  const debouncedResize = () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(handleResize, 100);
  };

  window.addEventListener('resize', debouncedResize);

  // Initial size check
  handleResize();

  // Use ResizeObserver if available for more efficient resize detection
  if (typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(debouncedResize);
    if (carouselContainer.value) {
      resizeObserver.observe(carouselContainer.value);
    }
  }
});

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId);

  // Clean up all event listeners
  window.removeEventListener('resize', handleResize);

  // Clean up ResizeObserver if it was created
  if (resizeObserver && carouselContainer.value) {
    resizeObserver.unobserve(carouselContainer.value);
    resizeObserver.disconnect();
  }
});
</script>

<style scoped>
/* Base Styles */
.carousel-container {
  width: 100%;
  max-width: 100%;
  margin: 0 auto;
  padding: 0;
  position: relative;
  outline: none;
  overflow: hidden;
}

@media (min-width: 1440px) {
  .carousel-container {
    max-width: 1440px;
    padding: 0 1rem;
  }
}

.carousel {
  position: relative;
  /* Improved height calculation with aspect ratio approach */
  height: clamp(200px, calc(100vw * 0.45), 600px);
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  user-select: none;
}

/* Slides */
.carousel-slides {
  width: 100%;
  height: 100%;
  position: relative;
}

.carousel-slide {
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity 0.5s ease-in-out;
  will-change: opacity; /* Performance optimization */
}

.carousel-slide.active {
  opacity: 1;
  z-index: 2; /* Ensure active slide is on top */
}

.carousel-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.6s ease-out;
}

/* Overlay */
.carousel-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, rgba(0, 0, 0, 0.6) 0%, rgba(0, 0, 0, 0.2) 50%, rgba(0, 0, 0, 0) 100%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  padding: max(1rem, min(4vw, 2.5rem));
  color: white;
  pointer-events: none;
  z-index: 3;
}

.carousel-title {
  font-size: clamp(1.2rem, 3vw, 2.5rem);
  font-weight: 700;
  line-height: 1.3;
  margin-bottom: clamp(0.75rem, 2vw, 1.5rem);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  word-wrap: break-word;
  max-width: min(90%, 600px);
  pointer-events: auto;
  margin-left: clamp(1rem, 5vw, 3rem);
}

.carousel-cta {
  padding: clamp(0.5rem, 1vw, 0.75rem) clamp(1rem, 1.5vw, 1.5rem);
  background: var(--primary-color, #0077cc);
  color: white;
  text-decoration: none;
  border-radius: 6px;
  font-weight: 600;
  font-size: clamp(0.875rem, 1.5vw, 1rem);
  transition: all 0.3s ease;
  white-space: nowrap;
  pointer-events: auto;
  z-index: 5;
  margin-left: clamp(1rem, 5vw, 3rem);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.carousel-cta:hover,
.carousel-cta:focus {
  background: var(--primary-hover-color, #0066b3);
  transform: translateY(-3px);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.3);
}

/* Controls */
.carousel-control {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.6);
  border: none;
  width: clamp(40px, 5vw, 48px);
  height: clamp(40px, 5vw, 48px);
  border-radius: 50%;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 10;
  opacity: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: clamp(14px, 1.5vw, 18px);
}

.carousel:hover .carousel-control {
  opacity: 1;
}

.carousel-control:hover,
.carousel-control:focus {
  background: rgba(0, 0, 0, 0.8);
  transform: translateY(-50%) scale(1.1);
}

.carousel-control:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.prev {
  left: clamp(0.5rem, 2vw, 1.5rem);
}

.next {
  right: clamp(0.5rem, 2vw, 1.5rem);
}

/* Indicators */
.carousel-indicators {
  position: absolute;
  bottom: clamp(0.75rem, 2vw, 1.5rem);
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: clamp(0.5rem, 1vw, 1rem);
  z-index: 20;
  padding: 0.5rem 0.75rem;
  width: fit-content;
  margin: 0 auto;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 20px;
  backdrop-filter: blur(4px);
}

.indicator {
  width: clamp(8px, 1.5vw, 14px);
  height: clamp(8px, 1.5vw, 14px);
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.6);
  border: 2px solid white;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  padding: 0;
}

.indicator::before {
  content: '';
  position: absolute;
  top: -8px;
  left: -8px;
  right: -8px;
  bottom: -8px;
  border-radius: 50%;
}

.indicator.active {
  background: white;
  transform: scale(1.3);
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.9);
}

.indicator:hover {
  background: rgba(255, 255, 255, 0.9);
  transform: scale(1.1);
}

/* Transitions */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform, opacity;
}

.slide-enter-from {
  opacity: 0;
  transform: translateX(5%);
}

.slide-leave-to {
  opacity: 0;
  transform: translateX(-5%);
}

/* Responsive Breakpoints - Desktop First Approach */
@media (max-width: 1200px) {
  .carousel {
    height: clamp(200px, 50vw, 500px);
  }
  
  .carousel-title {
    font-size: clamp(1.1rem, 2.8vw, 2.2rem);
  }
}

@media (max-width: 992px) {
  .carousel {
    height: clamp(180px, 50vw, 450px);
  }
  
  .carousel-overlay {
    background: linear-gradient(90deg, rgba(0, 0, 0, 0.65) 0%, rgba(0, 0, 0, 0.3) 70%, rgba(0, 0, 0, 0.1) 100%);
  }
  
  .carousel-control {
    opacity: 0.8;
  }
}

@media (max-width: 768px) {
  .carousel {
    height: clamp(180px, 55vw, 350px);
  }

  .carousel-overlay {
    background: linear-gradient(90deg, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0.3) 100%);
    padding: clamp(0.75rem, 3vw, 1.5rem);
  }

  .carousel-title {
    font-size: clamp(1rem, 2.5vw, 1.8rem);
    margin-bottom: clamp(0.5rem, 1.5vw, 1rem);
    margin-left: clamp(0.5rem, 3vw, 1.5rem);
    max-width: 80%;
  }

  .carousel-cta {
    margin-left: clamp(0.5rem, 3vw, 1.5rem);
    font-size: clamp(0.8rem, 1.8vw, 1rem);
    padding: clamp(0.4rem, 1vw, 0.6rem) clamp(0.8rem, 1.5vw, 1.2rem);
  }

  .carousel-control {
    width: 36px;
    height: 36px;
    font-size: 14px;
  }
  
  .carousel-indicators {
    padding: 0.4rem 0.8rem;
  }
  
  .indicator {
    width: 10px;
    height: 10px;
    border-width: 1.5px;
  }
}

@media (max-width: 576px) {
  .carousel {
    height: clamp(160px, 60vw, 280px);
  }

  .carousel-overlay {
    padding: 0.75rem;
    background: linear-gradient(90deg, rgba(0, 0, 0, 0.75) 0%, rgba(0, 0, 0, 0.4) 100%);
  }

  .carousel-title {
    font-size: clamp(0.9rem, 5vw, 1.4rem);
    margin-bottom: 0.5rem;
    margin-left: 0.5rem;
    max-width: 90%;
  }

  .carousel-cta {
    padding: 0.4rem 0.8rem;
    font-size: 0.875rem;
    margin-left: 0.5rem;
    border-radius: 4px;
  }

  .carousel-control {
    width: 32px;
    height: 32px;
    font-size: 12px;
  }

  .prev {
    left: 0.5rem;
  }

  .next {
    right: 0.5rem;
  }

  .carousel-indicators {
    bottom: 0.5rem;
    gap: 0.5rem;
    padding: 0.3rem 0.7rem;
  }
  
  .indicator {
    width: 8px;
    height: 8px;
    border-width: 1px;
  }
}

@media (max-width: 480px) {
  .carousel {
    height: clamp(140px, 60vw, 240px);
  }

  .carousel-overlay {
    padding: 0.5rem;
    justify-content: center;
  }

  .carousel-title {
    font-size: clamp(0.85rem, 4.5vw, 1.2rem);
    margin-bottom: 0.4rem;
    text-align: left;
    margin-left: 0.3rem;
  }

  .carousel-cta {
    padding: 0.35rem 0.7rem;
    font-size: 0.8rem;
    margin-left: 0.3rem;
  }

  .carousel-indicators {
    bottom: 0.4rem;
    gap: 0.4rem;
    padding: 0.25rem 0.6rem;
  }
  
  .indicator {
    width: 7px;
    height: 7px;
  }
}

@media (max-width: 360px) {
  .carousel {
    height: clamp(120px, 55vw, 200px);
  }

  .carousel-title {
    font-size: clamp(0.75rem, 4vw, 1rem);
    margin-bottom: 0.3rem;
  }

  .carousel-cta {
    padding: 0.3rem 0.6rem;
    font-size: 0.75rem;
  }
  
  .indicator {
    width: 6px;
    height: 6px;
  }
}

/* Special case for very small screens */
@media (max-width: 320px) {
  .carousel {
    height: clamp(100px, 50vw, 180px);
  }

  .carousel-title {
    font-size: 0.7rem;
  }

  .carousel-cta {
    padding: 0.25rem 0.5rem;
    font-size: 0.7rem;
  }
  
  .carousel-indicators {
    padding: 0.2rem 0.5rem;
  }
  
  .indicator {
    width: 5px;
    height: 5px;
  }
}

/* Landscape orientation handling */
@media (max-height: 500px) and (orientation: landscape) {
  .carousel {
    height: clamp(120px, 70vh, 250px);
  }

  .carousel-overlay {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: 0.5rem 2rem 0.5rem 1rem;
  }

  .carousel-title {
    margin-bottom: 0;
    margin-right: 1rem;
    font-size: clamp(0.8rem, 3vh, 1.3rem);
    max-width: 60%;
  }
  
  .carousel-cta {
    align-self: center;
  }
  
  .carousel-indicators {
    bottom: 0.3rem;
    right: 1rem;
    left: auto;
    justify-content: flex-end;
  }
}

/* High-DPI screens */
@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
  .carousel-title {
    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.6);
  }
  
  .carousel-overlay {
    background: linear-gradient(90deg, rgba(0, 0, 0, 0.65) 0%, rgba(0, 0, 0, 0.25) 70%, rgba(0, 0, 0, 0.1) 100%);
  }
}

/* Print styles */
@media print {
  .carousel {
    height: auto;
    box-shadow: none;
  }
  
  .carousel-control,
  .carousel-indicators {
    display: none;
  }
  
  .carousel-slide {
    position: relative;
    display: block;
    page-break-inside: avoid;
    margin-bottom: 1cm;
  }
  
  .carousel-overlay {
    position: relative;
    background: none;
    color: black;
  }
  
  .carousel-title {
    color: black;
    text-shadow: none;
  }
  
  .carousel-cta {
    display: none;
  }
}

/* Prefers reduced motion */
@media (prefers-reduced-motion: reduce) {
  .carousel-slide,
  .slide-enter-active,
  .slide-leave-active,
  .carousel-image,
  .carousel-control,
  .indicator,
  .carousel-cta {
    transition: none;
  }
  
  .slide-enter-from,
  .slide-leave-to {
    transform: none;
  }
}
</style>