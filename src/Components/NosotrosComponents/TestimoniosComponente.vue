<template>
    <section class="testimonials">
      <div class="testimonial-card">
        <div class="quote-mark start">"</div>
        <div class="testimonial-content">
          <p class="testimonial-text">{{ testimonials[currentIndex].text }}</p>
          <div class="testimonial-author">
            <div class="author-image">
              <img :src="testimonials[currentIndex].image" :alt="testimonials[currentIndex].name">
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
  
  <script>
  export default {
    name: 'TestimonialsCarousel',
    data() {
      return {
        currentIndex: 0,
        interval: null,
        testimonials: [
          {
            text: "NeoTech ha cambiado la forma en la que compro productos internacionales. Su atención personalizada y claridad en el proceso son lo que más valoro como cliente.",
            name: "Andrea Rojas",
            role: "Emprendedora",
            image: ""
          },
          {
            text: "Excelente servicio y atención al cliente. Los tiempos de entrega son precisos y el proceso es muy transparente.",
            name: "Carlos Mendoza",
            role: "Empresario",
            image: ""
          },
          {
            text: "La mejor opción para importar productos. Su plataforma es intuitiva y el seguimiento en tiempo real es muy útil.",
            name: "María González",
            role: "Comerciante",
            image: ""
          }
        ]
      }
    },
    mounted() {
      this.startAutoPlay()
    },
    beforeDestroy() {
      this.stopAutoPlay()
    },
    methods: {
      startAutoPlay() {
        this.interval = setInterval(this.nextTestimonial, 20000)
      },
      stopAutoPlay() {
        if (this.interval) {
          clearInterval(this.interval)
        }
      },
      nextTestimonial() {
        this.currentIndex = (this.currentIndex + 1) % this.testimonials.length
      },
      setTestimonial(index) {
        this.currentIndex = index
        // Reinicia el temporizador cuando se cambia manualmente
        this.stopAutoPlay()
        this.startAutoPlay()
      }
    }
  }
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
  
  .author-image {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    overflow: hidden;
  }
  
  .author-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .author-info {
    text-align: left;
  }
  
  .author-name {
    color: #007bff;
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
    background: #007bff;
  }
  
  /* Animaciones */
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
  
    .author-image {
      width: 50px;
      height: 50px;
    }
  }
  
  @media (max-width: 480px) {
    .testimonial-author {
      flex-direction: column;
      text-align: center;
    }
  
    .author-info {
      text-align: center;
    }
  }
  </style>