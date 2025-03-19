<template>
  <footer class="footer">
    <div class="footer-content">
      <!-- Logo y descripción -->
      <div class="footer-brand">
        <div class="logo">
          <img src="/logo/Logo Neofetch PNG.png" alt="Neo Tech Bol" />
        </div>
        <p class="description">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque molestie eu dolor at eleifend. Lorem
          ipsum dolor sit amet, consectetur adipiscing elit.
        </p>
      </div>

      <!-- Secciones colapsables -->
      <div v-for="(section, index) in footerSections" :key="index" class="footer-section">
        <div class="section-header" @click="toggleSection(index)" :class="{ 'active': section.isOpen }">
          <h3>{{ section.title }}</h3>
          <span class="toggle-icon">{{ section.isOpen ? '−' : '+' }}</span>
        </div>
        <transition name="slide">
          <ul v-show="section.isOpen || !isMobile" class="links-list">
            <li v-for="(link, linkIndex) in section.links" :key="linkIndex">
              <a :href="link.url" class="footer-link">
                <span class="link-text">{{ link.text }}</span>
              </a>
            </li>
          </ul>
        </transition>
      </div>

      <!-- Contacto -->
      <div class="footer-section contact-section">
        <div class="section-header" @click="toggleSection(footerSections.length)"
          :class="{ 'active': contactSectionOpen }">
          <h3>Contacto</h3>
          <span class="toggle-icon">{{ contactSectionOpen ? '−' : '+' }}</span>
        </div>
        <transition name="slide">
          <div v-show="contactSectionOpen || !isMobile" class="contact-content">
            <div class="contact-info">
              <p><i class="fas fa-map-marker-alt" style="color: var(--primary-color);"></i> Avenida América y
                Libertador, Zona Cala Cala Cochabamba, Bolivia.</p>
              <p><i class="fas fa-phone-alt" style="color: var(--primary-color);"></i> +591 759-01415</p>
              <p><i class="fas fa-envelope" style="color: var(--primary-color);"></i> contacto@neotechbo.com</p>
            </div>
            <div class="social-links">
              <a href="#" class="social-link">
                <i class="fab fa-facebook-f"></i>
              </a>
              <a href="#" class="social-link">
                <i class="fab fa-twitter"></i>
              </a>
              <a href="#" class="social-link">
                <i class="fab fa-linkedin-in"></i>
              </a>
              <a href="#" class="social-link">
                <i class="fab fa-instagram"></i>
              </a>
            </div>
          </div>
        </transition>
      </div>
    </div>

    <!-- Footer bottom -->
    <div class="footer-bottom">
      <p>Desarrollado por Tinkuna Dev. 2025.</p>
    </div>
  </footer>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

// Estado para controlar las secciones colapsables
const footerSections = ref([
/*   {
    title: 'Categorías',
    isOpen: false,
    links: [
      { text: 'Motos Eléctricas', url: '/categorias/motos-electricas' },
      { text: 'Calentadores a Gas', url: '/categorias/calentadores-gas' },
      { text: 'Aspiradores Robot', url: '/categorias/aspiradores-robot' },
      { text: 'Purificadores de Aire', url: '/categorias/purificadores-aire' },
      { text: 'Paneles Solares', url: '/categorias/paneles-solares' },
      { text: 'Secadores de Cabello', url: '/categorias/secadores-cabello' }
    ]
  }, */
  {
    title: 'Neotech Bol',
    isOpen: false,
    links: [
      { text: 'Sobre Nosotros', url: '/sobre-nosotros' },
      { text: 'Rastrear Pedido', url: '/rastrear-pedido' },
      { text: 'Información Legal', url: '/informacion-legal' },
      { text: 'Términos y condiciones', url: '/terminos-condiciones' },
      { text: 'Pago seguro', url: '/pago-seguro' },
      { text: 'Contáctanos', url: '/contacto' }
    ]
  },
  {
    title: 'Cuenta',
    isOpen: false,
    links: [
      { text: 'Entrar', url: '/login' },
      { text: 'Ver Carrito', url: '/carrito' },
      { text: 'Política de devoluciones', url: '/politica-devoluciones' },
      { text: 'Trabaja con nosotros', url: '/trabaja-con-nosotros' },
      { text: 'Programa de afiliados', url: '/afiliados' }
    ]
  }
]);

const contactSectionOpen = ref(false);
const isMobile = ref(false);

// Función para alternar la visibilidad de las secciones
const toggleSection = (index) => {
  if (!isMobile.value) return;

  if (index === footerSections.value.length) {
    contactSectionOpen.value = !contactSectionOpen.value;
  } else {
    footerSections.value[index].isOpen = !footerSections.value[index].isOpen;
  }
};

// Función para verificar si es dispositivo móvil
const checkIfMobile = () => {
  isMobile.value = window.innerWidth <= 768;

  // Si no es móvil, asegurarse de que todas las secciones estén abiertas
  if (!isMobile.value) {
    footerSections.value.forEach(section => {
      section.isOpen = true;
    });
    contactSectionOpen.value = true;
  } else {
    // En móvil, cerrar todas las secciones por defecto
    footerSections.value.forEach(section => {
      section.isOpen = false;
    });
    contactSectionOpen.value = false;
  }
};

// Configurar event listeners para el resize
onMounted(() => {
  checkIfMobile();
  window.addEventListener('resize', checkIfMobile);
});

onUnmounted(() => {
  window.removeEventListener('resize', checkIfMobile);
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css');

.footer {
  font-family: 'Poppins', Arial, sans-serif;
  background-color: var(--background-color);
  padding: 40px 0 0;
  border-top: 1px solid var(--border-color);
}

.footer-content {
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 20px;
  display: grid;
  grid-template-columns: 2fr repeat(4, 1fr);
  gap: 30px;
}

.footer-brand {
  padding-right: 20px;
}

.logo img {
  max-width: 180px;
  margin-bottom: 15px;
}

.description {
  color: #6c757d;
  line-height: 1.5;
  font-size: 0.9rem;
}

.footer-section h3 {
  color: var(--text-color);
  font-size: 1.1rem;
  margin-bottom: 20px;
  font-weight: 600;
}

.links-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-section ul li {
  margin-bottom: 12px;
}

.footer-link {
  color: #6c757d;
  text-decoration: none;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  display: inline-block;
  position: relative;
  padding: 4px 0;
}

.footer-link::before {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 2px;
  background-color: var(--primary-color);
  transition: all 0.3s ease;
}

.footer-link:hover {
  color: var(--primary-color);
}

.footer-link:hover::before {
  width: 100%;
}

.link-text {
  position: relative;
  z-index: 1;
}

.contact-info p {
  color: #6c757d;
  margin-bottom: 12px;
  font-size: 0.8rem;
}

.contact-info i {
  margin-right: 10px;
  color: #007bff;
}

.social-links {
  display: flex;
  gap: 15px;
  margin-top: 20px;
}

.social-link {
  color: #6c757d;
  font-size: 1.2rem;
  transition: all 0.3s ease;
  background-color: var(--background-color);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
}

.social-link:hover {
  color: #fff;
  background-color: var(--primary-color);
  transform: translateY(-3px);
  box-shadow: 0 4px 8px rgba(0, 123, 255, 0.2);
}

.footer-bottom {
  margin-top: 40px;
  padding: 20px;
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: center;
  align-items: center;
  max-width: 1200px;
  margin: 40px auto 0;
}

.footer-bottom p {
  color: #6c757d;
  font-size: 0.85rem;
}

/* Estilos para secciones colapsables */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  margin-bottom: 20px;
}

.toggle-icon {
  display: none;
  font-size: 1.2rem;
  font-weight: bold;
  color: #6c757d;
  transition: color 0.3s ease;
}

.section-header.active .toggle-icon {
  color: #007bff;
}

/* Animación para el colapso */
.slide-enter-active,
.slide-leave-active {
  transition: max-height 0.3s ease, opacity 0.3s ease;
  max-height: 500px;
  overflow: hidden;
  opacity: 1;
}

.slide-enter-from,
.slide-leave-to {
  max-height: 0;
  opacity: 0;
}

.contact-content {
  overflow: hidden;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .footer-content {
    grid-template-columns: repeat(3, 1fr);
  }

  .footer-brand {
    grid-column: span 3;
    padding-right: 0;
    margin-bottom: 20px;
  }
}

@media (max-width: 768px) {
  .footer-content {
    grid-template-columns: 1fr;
    gap: 0;
  }

  .footer-brand {
    grid-column: span 1;
    margin-bottom: 30px;
  }

  .footer-section {
    border-bottom: 1px solid #e9ecef;
    padding-bottom: 0;
  }

  .footer-section:last-child {
    border-bottom: none;
  }

  .section-header {
    padding: 15px 0;
    margin-bottom: 0;
  }

  .toggle-icon {
    display: block;
  }

  .footer-section h3 {
    margin-bottom: 0;
    font-size: 1rem;
  }

  .links-list {
    padding: 10px 0;
  }

  .footer-section ul li {
    margin-bottom: 10px;
  }

  .contact-section {
    margin-bottom: 20px;
  }

  .contact-content {
    padding: 10px 0;
  }

  .social-links {
    margin-top: 15px;
  }

  .footer-bottom {
    margin-top: 20px;
    padding: 15px;
  }
}

@media (max-width: 480px) {
  .footer {
    padding: 30px 0 0;
  }

  .footer-content {
    padding: 0 15px;
  }

  .logo img {
    max-width: 150px;
  }

  .description {
    font-size: 0.85rem;
  }

  .footer-link,
  .contact-info p {
    font-size: 0.85rem;
  }

  .social-link {
    width: 36px;
    height: 36px;
    font-size: 1rem;
  }
}
</style>