<template>
  <section class="testimonials">
    <div class="testimonial-card">
      <div class="quote-mark start">"</div>
      <div class="testimonial-content">
        <p class="testimonial-text">{{ testimonials[currentIndex].text }}</p>
        <div class="testimonial-author">
          <div class="author-avatar">
            {{ getInitials(testimonials[currentIndex].name) }}
          </div>
          <div class="author-info">
            <h3 class="author-name">{{ testimonials[currentIndex].name }}</h3>
            <p class="author-role">{{ testimonials[currentIndex].role }}</p>
            <div class="rating">
              <span v-for="star in 5" :key="star" class="star">★</span>
            </div>
          </div>
        </div>
      </div>
      <div class="quote-mark end">"</div>
    </div>

    <!-- Indicadores -->
    <div class="indicators">
      <button 
        v-for="(_, index) in testimonials" 
        :key="index"
        :class="['indicator', { active: currentIndex === index }]"
        @click="setTestimonial(index)"
      ></button>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, inject, watchEffect } from 'vue';

const currentIndex = ref(0);
let interval = null;

const testimonials = [
  {
    text: "NeoTech ha cambiado la forma en la que compro productos internacionales. Su atención personalizada y claridad en el proceso son lo que más valoro como cliente.",
    name: "Andrea Rojas",
    role: "Emprendedora"
  },
  {
    text: "Excelente servicio y atención al cliente. Los tiempos de entrega son precisos y el proceso es muy transparente.",
    name: "Carlos Mendoza",
    role: "Empresario"
  },
  {
    text: "La mejor opción para importar productos. Su plataforma es intuitiva y el seguimiento en tiempo real es muy útil.",
    name: "María González",
    role: "Comerciante"
  }
];

const startAutoPlay = () => {
  interval = setInterval(nextTestimonial, 20000);
};

const stopAutoPlay = () => {
  if (interval) {
    clearInterval(interval);
  }
};

const nextTestimonial = () => {
  currentIndex.value = (currentIndex.value + 1) % testimonials.length;
};

const setTestimonial = (index) => {
  currentIndex.value = index;
  stopAutoPlay();
  startAutoPlay();
};

const getInitials = (name) => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase();
};
onBeforeUnmount(() => {
  stopAutoPlay();
});
//colores 
// Función para obtener el valor inicial del localStorage o usar el valor por defecto
const getInitialLocation = () => {
  const storedLocation = localStorage.getItem('selectedLocation');
  return storedLocation || 'cochabamba';
};

const selectedLocation = inject('selectedLocation');
const updateColors = (location) => {
  if (location === 'la-paz') {
    document.documentElement.style.setProperty('--primary-color', '#f8a812');
    document.documentElement.style.setProperty('--primary-hover-color', '#e69711');
  } else {
    document.documentElement.style.setProperty('--primary-color', '#3B82F6');
    document.documentElement.style.setProperty('--primary-hover-color', '#2563eb');
  }
};
// Watch for changes in selectedLocation
watchEffect(() => {
  if (selectedLocation && selectedLocation.value) {
    updateColors(selectedLocation.value);
  }
});

// Asegurarse de que los colores se actualicen cuando el componente se monta
onMounted(() => {
  if (selectedLocation && selectedLocation.value) {
    updateColors(selectedLocation.value);
  }
  startAutoPlay();
});
</script>
<style scoped>
.testimonials {
  max-width: 1200px;
  margin: 60px auto;
  padding: 0 20px;
  position: relative;
}

.testimonial-card {
  background: #f8f9fa;
  border-radius: 15px;
  padding: 40px;
  position: relative;
  display: flex;
  align-items: center;
  min-height: 300px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.quote-mark {
  font-size: 120px;
  color: #e1e5ea;
  font-family: serif;
  position: absolute;
  line-height: 1;
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
  transition: opacity 0.5s ease;
}

.testimonial-text {
  font-size: 1.1rem;
  color: #555;
  line-height: 1.6;
  margin-bottom: 30px;
  max-width: 800px;
  margin: 0 auto 30px;
}

.testimonial-author {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
}

.author-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: var(--primary-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  font-weight: bold;
}

.author-info {
  text-align: left;
}

.author-name {
  color: var(--primary-color);
  font-size: 1.2rem;
  margin-bottom: 5px;
}

.author-role {
  color: #666;
  font-size: 0.9rem;
}

.rating {
  margin-top: 5px;
}

.star {
  color: #ffd700;
  font-size: 1rem;
}

.indicators {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 30px;
}

.indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #ddd;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.indicator.active {
  background: var(--primary-color);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.testimonial-content {
  animation: fadeIn 0.5s ease;
}

/* Responsive Design */
@media (max-width: 768px) {
  .testimonial-card {
    padding: 30px 20px;
  }

  .quote-mark {
    font-size: 80px;
  }

  .testimonial-text {
    font-size: 1rem;
  }

  .author-avatar {
    width: 50px;
    height: 50px;
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .testimonial-card {
    padding: 20px 15px;
  }

  .quote-mark {
    font-size: 60px;
  }

  .testimonial-text {
    font-size: 0.9rem;
  }

  .testimonial-author {
    flex-direction: column;
    text-align: center;
  }

  .author-info {
    text-align: center;
  }

  .author-avatar {
    margin-bottom: 10px;
  }
}
</style>