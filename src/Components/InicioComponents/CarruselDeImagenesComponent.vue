<template>
    <div class="carousel-container">
      <div class="carousel-wrapper">
        <div class="carousel">
          <transition-group name="fade">
            <div v-for="(image, index) in images" 
                 :key="index"
                 v-show="currentIndex === index"
                 class="carousel-slide">
              <img :src="image.url" :alt="image.alt" class="carousel-image">
            </div>
          </transition-group>
        </div>
        <div class="carousel-content">
          <h2 class="carousel-title">¡Ofertas disponibles <br>
            por tiempo limitado!</h2>
          <a href="/productos" class="carousel-link-button">Aprovechar ahora</a>
        </div>
        <div class="carousel-indicators">
          <button v-for="(image, index) in images" 
                  :key="index"
                  :class="['indicator', { active: currentIndex === index }]"
                  @click="goToSlide(index)"
                  :aria-label="`Ir a la diapositiva ${index + 1}`">
          </button>
        </div>
        <button @click="prevSlide" class="carousel-control prev" aria-label="Diapositiva anterior">
          <span class="carousel-control-icon">&lsaquo;</span>
        </button>
        <button @click="nextSlide" class="carousel-control next" aria-label="Siguiente diapositiva">
          <span class="carousel-control-icon">&rsaquo;</span>
        </button>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, onUnmounted } from 'vue';
  
  const images = ref([
   /*  { url: 'https://www.publimpresos.com/wp-content/uploads/2023/12/banner-intro.jpg', alt: 'Imagen 1' }, */
    { url: '../../../public/imagenes/home-slider-1.png', alt: 'Imagen 2' },
  ]);
  
  const currentIndex = ref(0);
  let intervalId = null;
  
  const nextSlide = () => {
    currentIndex.value = (currentIndex.value + 1) % images.value.length;
  };
  
  const prevSlide = () => {
    currentIndex.value = (currentIndex.value - 1 + images.value.length) % images.value.length;
  };
  
  const goToSlide = (index) => {
    currentIndex.value = index;
  };
  
  const startAutoSlide = () => {
    intervalId = setInterval(nextSlide, 5000);
  };
  
  onMounted(() => {
    startAutoSlide();
  });
  
  onUnmounted(() => {
    if (intervalId) clearInterval(intervalId);
  });
  </script>
  
  <style scoped>
  
  .carousel-container {
    max-width: 100%;
    margin: 20px auto; /* Añadido margen arriba y abajo */
    padding: 0 20px; /* Añadido padding izquierdo y derecho */
  }
  
  @media (min-width: 1024px) {
    .carousel-container {
      max-width: 1480px;
    }
  }
  
  .carousel-wrapper {
    position: relative;
    overflow: hidden;
    border-radius: 0;
  }
  
  .carousel {
    position: relative;
    height: 300px;
  }
  
  @media (min-width: 768px) {
    .carousel {
      height: 400px;
    }
  }
  
  @media (min-width: 1024px) {
    .carousel {
      height: 500px;
    }
  }
  
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
  }
  
  .carousel-content {
    position: absolute;
    top: 50%;
    left: 20px;
    right: 20px;
    padding-left: 30px;
    transform: translateY(-50%);
    text-align: center;
    z-index: 2;
  }
  
  @media (min-width: 768px) {
    .carousel-content {
      left: 50px;
      right: auto;
      text-align: left;
    }
  }
  
  .carousel-title {
    font-size: 1.5rem;
    color: #342C1F;
    margin-bottom: 15px;
  }
  
  @media (min-width: 768px) {
    .carousel-title {
      font-size: 2rem;
    }
  }
  
  @media (min-width: 1024px) {
    .carousel-title {
      font-size: 2.5rem;
    }
  }
  
  .carousel-link-button {
    display: inline-block;
    padding: 10px 20px;
    background-color: #007bff;
    color: white;
    text-decoration: none;
    border-radius: 5px;
    font-weight: bold;
    transition: background-color 0.3s, transform 0.2s;
  }
  
  .carousel-link-button:hover {
    background-color: #0056b3;
    transform: translateY(-2px);
  }
  
  .carousel-indicators {
    position: absolute;
    bottom: 10px;
    left: 0;
    right: 0;
    display: flex;
    justify-content: center;
    gap: 8px;
    margin: 0 auto;
    padding: 0 20px;
    z-index: 2;
  }
  
  .indicator {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: rgba(255, 255, 255, 0.5);
    border: none;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  .indicator.active {
    background-color: #ffffff;
    transform: scale(1.2);
  }
  
  .carousel-control {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background-color: rgba(0, 0, 0, 0.5);
    color: white;
    border: none;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background-color 0.3s;
    z-index: 2;
    font-size: 24px;
    line-height: 1;
  }
  
  .carousel-control:hover {
    background-color: rgba(0, 0, 0, 0.7);
  }
  
  .carousel-control.prev {
    left: 10px;
  }
  
  .carousel-control.next {
    right: 10px;
  }
  
  .carousel-control-icon {
    display: block;
    width: 100%;
    text-align: center;
  }
  
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.5s ease;
  }
  
  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
  </style>
  
  