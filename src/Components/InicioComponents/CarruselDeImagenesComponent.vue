<template>
    <div class="carousel-container">
        <div class="carousel-wrapper">
            <div class="carousel">
                <div v-for="(image, index) in images" 
                     :key="index"
                     :class="['carousel-slide', { active: currentIndex === index }]">
                    <img :src="image.url" :alt="image.alt">
                </div>
            </div>
            <div class="carousel-content">
                <h2 class="carousel-title">Nuestras Imágenes Destacadas</h2>
                <a href="/productos" class="carousel-link-button">Ver Productos</a>
            </div>
            <div class="carousel-indicators">
                <button v-for="(image, index) in images" 
                        :key="index"
                        :class="['indicator', { active: currentIndex === index }]"
                        @click="goToSlide(index)">
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const images = ref([
    { url: 'https://www.publimpresos.com/wp-content/uploads/2023/12/banner-intro.jpg', alt: 'Imagen 1' },
    { url: '../../../public/imagenes/Sin título.png', alt: 'Imagen 2' },
]);

const currentIndex = ref(0);
let intervalId = null;

const nextSlide = () => {
    currentIndex.value = (currentIndex.value + 1) % images.value.length;
};

const goToSlide = (index) => {
    currentIndex.value = index;
};

const startAutoSlide = () => {
    intervalId = setInterval(nextSlide, 10000);
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
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

.carousel-wrapper {
    position: relative;
    overflow: hidden;
    border-radius: 10px;
}

.carousel-content {
    position: absolute;
    top: 50%;
    left: 50px;
    transform: translateY(-50%);
    text-align: left;
    z-index: 2;
}

.carousel-title {
    font-size: 2.5rem;
    color: rgb(0, 0, 0);
    margin-bottom: 20px;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.carousel-link-button {
    display: inline-block;
    padding: 12px 25px;
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

.carousel-slide {
    width: 100%;
    position: absolute;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.5s ease-in-out;
}

.carousel-slide.active {
    opacity: 1;
    visibility: visible;
}

.carousel-slide img {
    width: 100%;
    height: 500px;
    object-fit: contain;
}

.carousel-indicators {
    position: absolute;
    bottom: 20px;
    left: 0;
    right: 0;
    display: flex;
    justify-content: center;
    gap: 10px;
    margin: 0 auto;
    padding: 0 20px;
    z-index: 2;
}

.indicator {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background-color: rgba(109, 99, 99, 0.849);
    border: none;
    cursor: pointer;
    transition: all 0.3s ease;
}

.indicator.active {
    background-color: rgb(0, 26, 255);
    transform: scale(1.2);
}

.carousel {
    position: relative;
    height: 500px;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: scale(0.98);
    }
    to {
        opacity: 1;
        transform: scale(1);
    }
}
</style>