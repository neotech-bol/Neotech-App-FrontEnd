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
            <h2 class="carousel-title ms-md-5 ms-sm-4" v-html="image.title"></h2>
            <a :href="image.ctaLink" class="carousel-cta ms-md-5 ms-sm-4" @click.prevent="handleCtaClick">
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
        <button v-for="(image, index) in images" :key="index" :class="['indicator', { active: currentIndex === index }]"
          @click="goToSlide(index)" :aria-label="`Go to slide ${index + 1}`" :aria-current="currentIndex === index">
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
// Compute screen size category for more precise responsive adjustments
const screenSize = computed(() => {
  if (windowWidth.value <= 360) return 'xs';
  if (windowWidth.value <= 480) return 'sm';
  if (windowWidth.value <= 768) return 'md';
  if (windowWidth.value <= 1024) return 'lg';
  return 'xl';
});

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
.carousel-container {
  max-width: 100%;
  margin: 0 auto;
  padding: 0;
  position: relative;
  outline: none;
}

@media (min-width: 1440px) {
  .carousel-container {
    max-width: 1440px;
    padding: 0 1rem;
    /* Less padding on small screens */
  }
}

.carousel {
  position: relative;
  /* Improved height responsiveness with more precise clamp values */
  height: clamp(200px, 45vw, 600px);
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  user-select: none;
}

.carousel-slides {
  width: 100%;
  height: 100%;
  position: relative;
}

.carousel-slide {
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity 0.4s ease-in-out;
}

.carousel-slide.active {
  opacity: 1;
}

.carousel-image {
 /*  margin-top: 40px; */
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.6s ease-out;
}

.carousel:hover .carousel-image {
  transform: scale(1.03);
}

.carousel-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  /* Increased space at bottom to prevent overlap with indicators */
  background: linear-gradient(90deg, rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0.1) 100%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  padding: clamp(1rem, 2vw, 2.5rem);
  color: white;
  max-width: 100%;
  pointer-events: none;
  /* Allow clicks to pass through to indicators */
}

.carousel-title {
  font-size: clamp(1.2rem, 3vw, 2.5rem);
  font-weight: 700;
  line-height: 1.3;
  margin-bottom: clamp(0.75rem, 2vw, 1.5rem);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
  word-wrap: break-word;
  max-width: 100%;
  pointer-events: auto;
  /* Re-enable pointer events for title */
}

.carousel-cta {
  padding: clamp(0.5rem, 1vw, 0.75rem) clamp(1rem, 1.5vw, 1.5rem);
  background: var(--primary-color);
  color: white;
  text-decoration: none;
  border-radius: 6px;
  font-weight: 600;
  font-size: clamp(0.875rem, 2vw, 1rem);
  transition: all 0.3s ease;
  white-space: nowrap;
  pointer-events: auto;
  /* Re-enable pointer events for CTA button */
  z-index: 5;
  /* Ensure button is clickable */
}

.carousel-cta:hover,
.carousel-cta:focus {
  background: var(--primary-hover-color);
  transform: translateY(-3px);
  box-shadow: 0 6px 15px rgba(0, 123, 255, 0.3);
}

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
  left: 1.5rem;
}

.next {
  right: 1.5rem;
}

.carousel-indicators {
  position: absolute;
  bottom: 1.5rem;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: clamp(0.5rem, 1vw, 1rem);
  z-index: 20;
  /* Increased z-index to ensure indicators are above overlay */
  padding: 0.5rem 0;
  /* Add padding to increase hit area */
}

.indicator {
  width: clamp(8px, 1.5vw, 12px);
  height: clamp(8px, 1.5vw, 12px);
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.6);
  border: 2px solid white;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  /* For the pseudo-element */
}

.indicator::before {
  content: '';
  position: absolute;
  top: -5px;
  left: -5px;
  right: -5px;
  bottom: -5px;
  border-radius: 50%;
  /* Invisible but increases hit area for better touch targets */
}

.indicator.active {
  background: white;
  transform: scale(1.2);
  box-shadow: 0 0 8px rgba(255, 255, 255, 0.8);
  /* Add glow effect to active indicator */
}

.indicator:hover {
  background: rgba(255, 255, 255, 0.9);
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.5s ease;
}

.slide-enter-from {
  opacity: 0;
  transform: translateX(30%);
}

.slide-leave-to {
  opacity: 0;
  transform: translateX(-30%);
}

/* Improved Responsive Design with more breakpoints */
@media (max-width: 1024px) {
  .carousel {
    height: clamp(200px, 45vw, 450px);
  }

  .carousel-overlay {
    padding: clamp(0.75rem, 1.5vw, 2rem);
  }
}

@media (max-width: 768px) {
  .carousel {
    height: clamp(180px, 50vw, 350px);
    /* Smaller radius for mobile */
  }

  .carousel-overlay {
    background: linear-gradient(90deg, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0.2) 100%);
    justify-content: center;
    bottom: 0;
    /* More space for indicators */
    max-width: 100%;
    /* Full width on mobile */
  }

  .carousel-control {
    opacity: 1;
    width: 36px;
    height: 36px;
  }

  .carousel-indicators {
    bottom: 1rem;
    background: rgba(0, 0, 0, 0.3);
    /* Semi-transparent background for better visibility */
    border-radius: 20px;
    padding: 0.5rem;
    width: fit-content;
    margin: 0 auto;
  }
}

@media (max-width: 480px) {
  .carousel {
    height: clamp(160px, 55vw, 280px);
  }

  .carousel-container {
    padding: 0 0.4rem;
    /* Less padding on small screens */
  }

  .carousel-overlay {
    padding: 0.75rem 1rem;
    background: linear-gradient(90deg, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0.3) 100%);
    bottom: 0;
  }

  .carousel-title {
    font-size: clamp(1rem, 5vw, 1.5rem);
    margin-bottom: 0.5rem;
    text-align: left;
    width: 100%;
  }

  .carousel-cta {
    padding: 0.4rem 0.8rem;
    font-size: 0.875rem;
    align-self: flex-start;
    /* Align to left on mobile */
  }

  .carousel-control {
    width: 32px;
    height: 32px;
  }

  .prev {
    left: 0.5rem;
  }

  .next {
    right: 0.5rem;
  }

  .indicator {
    width: 8px;
    height: 8px;
  }

  .carousel-indicators {
    bottom: 0.5rem;
    gap: 0.4rem;
    padding: 0.4rem 0.8rem;
  }
}

@media (max-width: 360px) {
  .carousel {
    height: clamp(140px, 60vw, 220px);
  }

  .carousel-overlay {
    padding: 0.5rem 0.75rem;
    justify-content: center;
    bottom: 2.5rem;
  }

  .carousel-title {
    font-size: clamp(0.875rem, 4.5vw, 1.25rem);
    margin-bottom: 0.4rem;
  }

  .carousel-cta {
    padding: 0.35rem 0.7rem;
    font-size: 0.75rem;
    border-radius: 4px;
  }

  .carousel-control {
    width: 28px;
    height: 28px;
  }

  .indicator {
    width: 6px;
    height: 6px;
    border-width: 1px;
  }
}

/* Additional breakpoint for very small devices */
@media (max-width: 320px) {
  .carousel {
    height: clamp(120px, 55vw, 180px);
  }

  .carousel-title {
    font-size: clamp(0.75rem, 4vw, 1rem);
  }

  .carousel-cta {
    padding: 0.3rem 0.6rem;
    font-size: 0.7rem;
  }

  .carousel-indicators {
    bottom: 0.3rem;
  }
}

/* Orientation-specific adjustments */
@media (max-height: 500px) and (orientation: landscape) {
  .carousel {
    height: clamp(120px, 40vh, 250px);
  }

  .carousel-overlay {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: 0.5rem 2rem;
    bottom: 2.5rem;
  }

  .carousel-title {
    margin-bottom: 0;
    margin-right: 1rem;
    font-size: clamp(0.875rem, 3vh, 1.5rem);
  }
}
</style>