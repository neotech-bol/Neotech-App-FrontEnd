<template>
  <div class="about-container">
    <div class="about-grid">
      <div class="image-gallery">
        <div v-for="(image, index) in images" :key="index" :class="['image-card', image.size]"
          @mouseenter="hoveredImage = index" @mouseleave="hoveredImage = null">
          <img :src="image.src" :alt="image.alt" loading="lazy" :class="['gallery-image', `img-${index + 1}`]" />
          <div class="image-overlay" :class="{ active: hoveredImage === index }">
            <span class="image-size-note">{{ image.sizeText }}</span>
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
            <div v-for="(stat, index) in stats" :key="index" class="stat-item">
              <div class="stat-value">{{ stat.value }}</div>
              <div class="stat-label">{{ stat.label }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, inject, watchEffect, onMounted } from 'vue'
const hoveredImage = ref(null);
const contentLoaded = ref(false);

// Datos dinámicos para las imágenes
const images = ref([
  {
    src: "/imagenes/working-business-project.jpg",
    alt: "Trabajador con tablet",
    size: "large",
    sizeText: "Tamaño recomendado: 600x800px"
  },
  {
    src: "/imagenes/sobre-nosotros.jpg",
    alt: "Contenedores",
    size: "small",
    sizeText: "Tamaño recomendado: 400x300px"
  },
  {
    src: "/imagenes/about-us-marker.jpg",
    alt: "Barco de carga",
    size: "small",
    sizeText: "Tamaño recomendado: 400x300px"
  }
]);

// Texto para los párrafos
const paragraphs = ref([
  "NeoTech - Bol fue fundada en 2019 por Jaime Jaldín Ninavia con el objetivo de ofrecer a los bolivianos una forma innovadora y accesible de adquirir productos de calidad internacional. Nos especializamos en la Importación de bienes por ciclos, adaptándonos a las necesidades de nuestros clientes y asegurando siempre las mejores condiciones en precio y disponibilidad.",
  "Actualmente, contamos con una base de más de 2,400 clientes satisfechos en todo el país, quienes confían en nuestra experiencia y profesionalismo. Aunque operamos principalmente de forma virtual a través de redes sociales, también ofrecemos atención personalizada en nuestra oficina ubicada en Cochabamba."
]);

// Estadísticas destacadas
const stats = ref([
  { value: "2,400+", label: "Clientes Satisfechos" },
  { value: "5", label: "Años de Experiencia" },
  { value: "3", label: "Ciudades Principales" }
]);


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

/* Galería de imágenes mejorada */
.image-gallery {
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

.image-size-note {
  color: white;
  font-size: 0.85rem;
  font-weight: 500;
}

/* Sección de contenido */
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
  background-color: var(--primary-color);
  border-radius: 2px;
}

.highlight {
  color: var(--primary-color);
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

/* Estadísticas */
.stats-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-top: 40px;
  text-align: center;
}

.stat-item {
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.stat-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--primary-color);
  margin-bottom: 5px;
}

.stat-label {
  font-size: 0.9rem;
  color: #666;
  font-weight: 500;
}

/* Diseño Responsive Mejorado */
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

  .image-gallery {
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 350px 200px;
    order: 1;
  }

  .content-section {
    order: 0;
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
  .stats-container {
    grid-template-columns: repeat(2, 1fr);
  }

  .stat-item:last-child {
    grid-column: span 2;
  }

  .image-gallery {
    grid-template-columns: 1fr;
    grid-template-rows: repeat(3, auto);
  }

  .image-card.large,
  .image-card.small {
    height: 250px;
    grid-column: span 1;
  }
}

@media (max-width: 640px) {
  .about-container {
    padding: 40px 20px;
  }

  .title {
    font-size: 2rem;
  }

  .subtitle {
    font-size: 1rem;
  }

  .stats-container {
    grid-template-columns: 1fr;
  }

  .stat-item {
    padding: 15px;
  }

  .stat-item:last-child {
    grid-column: span 1;
  }

  .image-card.large,
  .image-card.small {
    height: 200px;
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
    font-size: 0.8rem;
  }
}

/* Mejoras de accesibilidad */
@media (prefers-reduced-motion: reduce) {
  .image-card,
  .gallery-image,
  .content-section,
  .stat-item {
    transition: none;
  }
}
</style>