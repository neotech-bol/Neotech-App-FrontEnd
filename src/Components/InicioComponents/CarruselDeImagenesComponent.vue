<template>
  <div class="carousel-container" ref="carouselContainer" tabindex="0" @keydown="handleKeydown">
    <div class="carousel" @touchstart="touchStart" @touchmove="touchMove" @touchend="touchEnd"
      @mouseenter="pauseAutoSlide" @mouseleave="resumeAutoSlide">
      <transition-group name="slide" tag="div" class="carousel-slides">
        <div v-for="(image, index) in images" :key="index"
          :class="['carousel-slide', { active: currentIndex === index }]"
          :style="{ zIndex: currentIndex === index ? 1 : 0 }"
          :aria-hidden="currentIndex !== index ? 'true' : 'false'">
          <picture>
            <source :srcset="image.url" type="image/png" />
            <img :src="image.url" :srcset="image.url"
                 :alt="image.alt" class="carousel-image"
                 :loading="index === 0 ? 'eager' : 'lazy'"
                 fetchpriority="index === 0 ? 'high' : 'auto'"
                 @load="onImageLoad" />
          </picture>
          <div class="carousel-overlay">
            <h2 class="carousel-title">{{ image.title }}</h2>
            <router-link :to="image.ctaLink" class="carousel-cta" :aria-label="image.ctaText || 'Ver Colección'">
              {{ image.ctaText || 'Ver Colección' }}
            </router-link>
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
    title: '¡Ofertas disponibles por tiempo limitado!',
    url: '/imagenes/home-slider-1.webp',
    alt: 'Ofertas exclusivas en productos electrónicos',
    ctaLink: '/productos',
    ctaText: 'Ver Colección'
  },
  // Add more slides with url, url2x, urlWebp, urlWebp2x
]);

const currentIndex = ref(0);
const touchStartX = ref(0);
const touchEndX = ref(0);
const carouselContainer = ref(null);
const isLoading = ref(false);
const isPaused = ref(false);
const windowWidth = ref(window.innerWidth);

const isMobile = computed(() => windowWidth.value <= 768);

let intervalId = null;

const goToSlide = (index) => {
  currentIndex.value = index;
  resetAutoSlide();
};

const prevSlide = () => {
  currentIndex.value = (currentIndex.value - 1 + images.value.length) % images.value.length;
  resetAutoSlide();
  focusCarousel();
};

const nextSlide = () => {
  currentIndex.value = (currentIndex.value + 1) % images.value.length;
  resetAutoSlide();
  focusCarousel();
};

const focusCarousel = () => {
  if (carouselContainer.value) {
    carouselContainer.value.focus();
  }
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

const handleResize = () => {
  windowWidth.value = window.innerWidth;
};

onMounted(() => {
  startAutoSlide();

  const intersectionObserver = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        startAutoSlide();
      } else {
        if (intervalId) clearInterval(intervalId);
      }
    },
    { threshold: 0.1 }
  );

  if (carouselContainer.value) {
    intersectionObserver.observe(carouselContainer.value);
  }

  window.addEventListener('resize', handleResize);
  handleResize();
});

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId);
  window.removeEventListener('resize', handleResize);
});
</script>

<style scoped>
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
  height: clamp(200px, calc(100vw * 0.45), 600px);
  overflow: hidden;
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
  transition: opacity 0.3s ease-in-out;
}

.carousel-slide.active {
  opacity: 1;
  z-index: 2;
}

.carousel-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

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
  z-index: 3;
}

.carousel-title {
  font-size: clamp(1.2rem, 3vw, 2.5rem);
  font-weight: 700;
  line-height: 1.3;
  margin-bottom: clamp(0.75rem, 2vw, 1.5rem);
  max-width: min(90%, 600px);
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
  transition: background 0.2s ease;
  white-space: nowrap;
  margin-left: clamp(1rem, 5vw, 3rem);
}

.carousel-cta:hover,
.carousel-cta:focus {
  background: var(--primary-hover-color, #0066b3);
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
  transition: background 0.2s ease;
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
}

.indicator {
  width: clamp(8px, 1.5vw, 14px);
  height: clamp(8px, 1.5vw, 14px);
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.6);
  border: 2px solid white;
  cursor: pointer;
  transition: background 0.2s ease;
  padding: 0;
}

.indicator.active {
  background: white;
}

.indicator:hover {
  background: rgba(255, 255, 255, 0.9);
}

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

@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
  .carousel-title {
    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.6);
  }
  .carousel-overlay {
    background: linear-gradient(90deg, rgba(0, 0, 0, 0.65) 0%, rgba(0, 0, 0, 0.25) 70%, rgba(0, 0, 0, 0.1) 100%);
  }
}

@media print {
  .carousel {
    height: auto;
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
  }
  .carousel-cta {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .carousel-slide,
  .slide-enter-active,
  .slide-leave-active,
  .carousel-cta {
    transition: none;
  }
}
</style>