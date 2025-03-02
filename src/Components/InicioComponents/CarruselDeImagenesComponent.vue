<template>
  <div class="carousel-container mt-5" ref="carouselContainer">
    <div class="carousel" @touchstart="touchStart" @touchmove="touchMove" @touchend="touchEnd">
      <transition-group name="slide" tag="div" class="carousel-slides">
        <div v-for="(image, index) in images" :key="index" v-show="currentIndex === index" class="carousel-slide">
          <img :src="image.url" :alt="image.alt" class="carousel-image" loading="lazy" />
          <div class="carousel-overlay">
            <h2 class="carousel-title" v-html="image.title"></h2>
            <a href="/productos" class="carousel-cta col-2 text-center">Ver Colección</a>
          </div>
        </div>
      </transition-group>

      <!-- Navigation Controls -->
      <button @click="prevSlide" class="carousel-control prev" aria-label="Diapositiva anterior">
        <i class="fas fa-chevron-left"></i>
      </button>
      <button @click="nextSlide" class="carousel-control next" aria-label="Diapositiva siguiente">
        <i class="fas fa-chevron-right"></i>
      </button>
    </div>

    <!-- Indicators -->
    <div class="carousel-indicators">
      <button v-for="(image, index) in images" :key="index" :class="['indicator', { active: currentIndex === index }]"
        @click="goToSlide(index)" :aria-label="`Ir a diapositiva ${index + 1}`"></button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const images = ref([
  {
    title: '¡Ofertas disponibles <br/> por tiempo limitado!',
    titleKey: 'ofertas_disponibles',
    url: '/imagenes/home-slider-1.png',
    alt: 'Oferta especial'
  },
  // Puedes agregar más imágenes aquí para probar el carrusel
]);

const currentIndex = ref(0);
const touchStartX = ref(0);
const touchEndX = ref(0);
const carouselContainer = ref(null);

let intervalId = null;

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
  intervalId = setInterval(nextSlide, 5000);
};

const resetAutoSlide = () => {
  if (intervalId) clearInterval(intervalId);
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
  if (swipeDistance > 50) nextSlide();
  if (swipeDistance < -50) prevSlide();
};

onMounted(() => {
  startAutoSlide();
  if (carouselContainer.value) {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          startAutoSlide();
        } else {
          if (intervalId) clearInterval(intervalId);
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(carouselContainer.value);
  }
});

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId);
});
</script>

<style scoped>
/* Container */
.carousel-container {
  max-width: 100%;
  margin: 0 auto;
  padding: 0 1rem;
  position: relative;
  overflow: hidden;
}

@media (min-width: 1440px) {
  .carousel-container {
    max-width: 1440px;
  }
}

/* Carousel */
.carousel {
  position: relative;
  height: clamp(250px, 50vw, 500px);
  touch-action: pan-y;
  border-radius: 12px;
  overflow: hidden;
}

.carousel-slides {
  width: 100%;
  height: 100%;
}

/* Slide */
.carousel-slide {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.carousel-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.carousel-slide:hover .carousel-image {
  transform: scale(1.05);
}

/* Overlay Content */
.carousel-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to right, rgba(0, 0, 0, 0.1), transparent);
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 2rem;
  color: #fff;
  z-index: 1;
}

.carousel-title {
  font-size: clamp(1.25rem, 4vw, 2.5rem);
  font-weight: 700;
  margin-bottom: 1rem;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.5);
}

.carousel-cta {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background: #3498db;
  color: #fff;
  text-decoration: none;
  border-radius: 6px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.carousel-cta:hover,
.carousel-cta:focus {
  background: #2980b9;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
}

/* Controls */
.carousel-control {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.5);
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  cursor: pointer;
  transition: all 0.3s ease;
  opacity: 0;
  z-index: 2;
}

.carousel-container:hover .carousel-control {
  opacity: 1;
}

.carousel-control:hover,
.carousel-control:focus {
  background: rgba(0, 0, 0, 0.8);
  transform: translateY(-50%) scale(1.1);
}

.carousel-control.prev {
  left: 1rem;
}

.carousel-control.next {
  right: 1rem;
}

/* Indicators */
.carousel-indicators {
  position: absolute;
  bottom: 1rem;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: 0.75rem;
  padding: 0 1rem;
  z-index: 2;
}

.indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.indicator.active {
  background: #fff;
  transform: scale(1.3);
}

.indicator:hover {
  background: rgba(255, 255, 255, 0.8);
}

/* Transitions */
.slide-enter-active,
.slide-leave-active {
  transition: opacity 0.5s ease, transform 0.5s ease;
}

.slide-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.slide-leave-to {
  opacity: 0;
  transform: translateX(-100%);
}

/* Responsive Design */
@media (max-width: 1024px) {
  .carousel {
    height: clamp(200px, 40vw, 400px);
  }

  .carousel-overlay {
    padding: 1.5rem;
  }
}

@media (max-width: 768px) {
  .carousel {
    height: clamp(180px, 50vw, 300px);
  }

  .carousel-overlay {
    padding: 1rem;
    background: linear-gradient(to bottom, rgba(0, 0, 0, 0.6), transparent);
    justify-content: flex-end;
  }

  .carousel-title {
    margin-bottom: 0.75rem;
  }

  .carousel-cta {
    padding: 0.5rem 1rem;
  }

  .carousel-control {
    width: 36px;
    height: 36px;
    opacity: 1;
  }
}

@media (max-width: 480px) {
  .carousel {
    height: clamp(150px, 60vw, 250px);
  }

  .carousel-title {
    font-size: clamp(1rem, 3vw, 1.5rem);
  }

  .carousel-cta {
    padding: 0.5rem 0.75rem;
    font-size: 0.875rem;
  }

  .carousel-control {
    width: 32px;
    height: 32px;
  }

  .indicator {
    width: 8px;
    height: 8px;
  }
}

@media (max-width: 360px) {
  .carousel {
    height: clamp(120px, 50vw, 200px);
  }

  .carousel-overlay {
    padding: 0.75rem;
  }
}
</style>