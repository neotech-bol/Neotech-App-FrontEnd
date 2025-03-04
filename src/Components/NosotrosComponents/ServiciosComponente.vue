<template>
  <section class="services-section" :class="{ 'fade-in': contentLoaded }">
    <div class="services-header">
      <h2>Nuestros <span class="highlight">Servicios</span></h2>
      <p>Nuestro objetivo es simplificar el proceso de importación y garantizar que encuentres exactamente lo que
        necesitas.</p>
    </div>

    <div class="services-grid">
      <div v-for="(service, index) in services" :key="index" class="service-card"
        :class="{ 'active': hoveredService === index }" @mouseenter="hoveredService = index"
        @mouseleave="hoveredService = null">
        <div class="service-content">
          <div class="icon-container">
            <div class="icon" :style="{ backgroundColor: `var(--service-bg-${index})` }">
              <component :is="service.icon" class="service-icon" />
            </div>
          </div>
          <h3>{{ service.title }}</h3>
          <p>{{ service.description }}</p>
          <div class="service-details" :class="{ 'expanded': hoveredService === index }">
            <ul>
              <li v-for="(detail, detailIndex) in service.details" :key="detailIndex">
                {{ detail }}
              </li>
            </ul>
          </div>
        </div>
        <div class="card-footer">
          <button class="learn-more-btn" @click="toggleDetails(index)">
            {{ hoveredService === index ? 'Menos detalles' : 'Conocer más' }}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 12h14M12 5l7 7-7 7"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <div class="services-cta">
      <h3>¿Necesitas un servicio personalizado?</h3>
      <p>Contáctanos para discutir opciones adaptadas a tus necesidades específicas.</p>
      <button class="contact-btn">Contactar ahora</button>
    </div>
  </section>
</template>

<script setup>
import { inject, ref, watchEffect, onMounted, h } from 'vue'

const hoveredService = ref(null);
const contentLoaded = ref(false);
// Definición de iconos como componentes funcionales
const DownloadIcon = () => h('svg', {
  width: '40',
  height: '40',
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  'stroke-width': '2',
  innerHTML: '<path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-6M12 12l-4-4m4 4l4-4m-4 4V3"/>'
});

const ShieldIcon = () => h('svg', {
  width: '40',
  height: '40',
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  'stroke-width': '2',
  innerHTML: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>'
});

const ClockIcon = () => h('svg', {
  width: '40',
  height: '40',
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  'stroke-width': '2',
  innerHTML: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>'
});

const UserIcon = () => h('svg', {
  width: '40',
  height: '40',
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  'stroke-width': '2',
  innerHTML: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>'
});

// Datos de servicios
const services = ref([
  {
    icon: DownloadIcon,
    title: 'Catálogo Renovado',
    description: 'Productos nuevos en cada ciclo de compra para mantenerte a la vanguardia.',
    details: [
      'Actualizaciones mensuales',
      'Tendencias internacionales',
      'Ofertas exclusivas'
    ]
  },
  {
    icon: ShieldIcon,
    title: 'Calidad Garantizada',
    description: 'Solo trabajamos con marcas confiables y productos verificados.',
    details: [
      'Certificación de autenticidad',
      'Garantía de devolución',
      'Inspección pre-envío'
    ]
  },
  {
    icon: ClockIcon,
    title: 'Seguimiento en tiempo real',
    description: 'Monitorea el estado de tus pedidos fácilmente desde cualquier dispositivo.',
    details: [
      'Actualizaciones automáticas',
      'Notificaciones por correo/SMS',
      'Panel de control personalizado'
    ]
  },
  {
    icon: UserIcon,
    title: 'Atención personalizada',
    description: 'Trato cercano y profesional por parte de nuestro equipo de expertos.',
    details: [
      'Asesores especializados',
      'Soporte multicanal',
      'Atención post-venta'
    ]
  }
]);



const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : null;
};

const simulateLoading = () => {
  setTimeout(() => {
    contentLoaded.value = true;
  }, 300);
};

const toggleDetails = (index) => {
  hoveredService.value = hoveredService.value === index ? null : index;
};


onMounted(() => {
  simulateLoading();
});
</script>

<style scoped>
.services-section {
  max-width: 1440px;
  margin: 80px auto;
  padding: 0 20px;
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.8s ease, transform 0.8s ease;
}

.services-section.fade-in {
  opacity: 1;
  transform: translateY(0);
}

.services-header {
  text-align: center;
  margin-bottom: 60px;
}

.services-header h2 {
  font-size: 2.5rem;
  font-weight: 800;
  color: #333;
  margin-bottom: 20px;
  position: relative;
  display: inline-block;
}

.services-header h2::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  height: 4px;
  background-color: var(--primary-color);
  border-radius: 2px;
}

.highlight {
  color: var(--primary-color);
}

.services-header p {
  color: #666;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.8;
  font-size: 1.1rem;
}

.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 30px;
}

.service-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  transition: all 0.4s ease;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  border: 1px solid #eee;
  position: relative;
}

.service-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: var(--primary-color);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.4s ease;
}

.service-card.active::before {
  transform: scaleX(1);
}

.service-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
}

.service-content {
  padding: 35px 30px 25px;
}

.icon-container {
  margin-bottom: 25px;
}

.icon {
  width: 80px;
  height: 80px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: var(--primary-color);
  transition: all 0.3s ease;
}

.service-card:hover .icon {
  transform: scale(1.1);
  color: var(--primary-hover-color);
}

.service-icon {
  transition: transform 0.4s ease;
}

.service-card:hover .service-icon {
  transform: scale(1.1);
}

.service-card h3 {
  color: #333;
  font-size: 1.3rem;
  font-weight: 700;
  margin-bottom: 15px;
  transition: color 0.3s ease;
}

.service-card:hover h3 {
  color: var(--primary-color);
}

.service-card p {
  color: #666;
  line-height: 1.6;
  margin-bottom: 20px;
}

.service-details {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease, opacity 0.3s ease;
  opacity: 0;
}

.service-details.expanded {
  max-height: 500px;
  opacity: 1;
}

.service-details ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.service-details li {
  position: relative;
  padding-left: 25px;
  margin-bottom: 10px;
  color: #555;
  text-align: left;
}

.service-details li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 10px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: var(--primary-color);
}

.card-footer {
  padding: 20px 30px;
  border-top: 1px solid #f0f0f0;
}

.learn-more-btn {
  background: transparent;
  border: none;
  color: var(--primary-color);
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 10px 0;
  transition: all 0.3s ease;
}

.learn-more-btn svg {
  transition: transform 0.3s ease;
}

.learn-more-btn:hover {
  color: var(--primary-hover-color);
}

.learn-more-btn:hover svg {
  transform: translateX(5px);
}

/* CTA Section */
.services-cta {
  margin-top: 80px;
  text-align: center;
  padding: 50px;
  background: linear-gradient(to right, rgba(var(--primary-rgb), 0.05), rgba(var(--primary-rgb), 0.1));
  border-radius: 12px;
}

.services-cta h3 {
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 15px;
  color: #333;
}

.services-cta p {
  max-width: 600px;
  margin: 0 auto 30px;
  color: #666;
  font-size: 1.1rem;
}

.contact-btn {
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 15px 30px;
  border-radius: 50px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.contact-btn:hover {
  background-color: var(--primary-hover-color);
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

/* Responsive Design */
@media (max-width: 1024px) {
  .services-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .services-cta {
    padding: 40px 30px;
  }
}

@media (max-width: 768px) {
  .services-header h2 {
    font-size: 2.2rem;
  }

  .services-cta h3 {
    font-size: 1.6rem;
  }

  .service-card h3 {
    font-size: 1.2rem;
  }
}

@media (max-width: 640px) {
  .services-grid {
    grid-template-columns: 1fr;
  }

  .services-header {
    margin-bottom: 40px;
  }

  .services-header h2 {
    font-size: 1.9rem;
  }

  .services-cta {
    padding: 30px 20px;
    margin-top: 60px;
  }

  .service-content {
    padding: 25px 20px 15px;
  }

  .icon {
    width: 70px;
    height: 70px;
  }

  .card-footer {
    padding: 15px 20px;
  }
}

@media (max-width: 480px) {
  .services-section {
    margin: 60px auto;
  }

  .services-header h2 {
    font-size: 1.7rem;
  }

  .services-header p {
    font-size: 1rem;
  }

  .services-cta h3 {
    font-size: 1.4rem;
  }

  .contact-btn {
    padding: 12px 25px;
    font-size: 0.95rem;
  }
}

/* Accessibility Improvements */
@media (prefers-reduced-motion: reduce) {
  .services-section,
  .service-card,
  .icon,
  .service-icon,
  .learn-more-btn,
  .contact-btn {
    transition: none;
  }
}
</style>