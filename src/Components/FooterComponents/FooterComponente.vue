<template>
  <footer class="footer">
    <div class="footer-content">
      <!-- Logo y descripción -->
      <div class="footer-brand">
        <div class="logo">
          <img src="/logo/Logo Neofetch PNG.png" alt="Neo Tech Bol" />
        </div>
        <p class="description">
          Fundada en 2019 por Jaime Jaldín Ninavia, ofrece productos de calidad internacional a los bolivianos. Nos especializamos en la importación de bienes por ciclos y contamos con más de 2,400 clientes satisfechos. Operamos principalmente de forma virtual, con atención personalizada en Cochabamba.
        </p>
      </div>

      <!-- Categorías dinámicas -->
      <div class="footer-section">
        <div class="section-header" @click="toggleCategorias" :class="{ 'active': categoriasOpen }">
          <h3>Categorías</h3>
          <span class="toggle-icon">{{ categoriasOpen ? '−' : '+' }}</span>
        </div>
        <transition name="slide">
          <ul v-show="categoriasOpen || !isMobile" class="links-list">
            <li v-for="categoria in categorias" :key="categoria.id">
              <a href="#" @click.prevent="irCategoria(categoria.id, categoria.nombre)" class="footer-link">
                <span class="link-text">{{ categoria.nombre }}</span>
              </a>
            </li>
            <li v-if="categorias.length === 0" class="loading-text">
              <span>Cargando categorías...</span>
            </li>
          </ul>
        </transition>
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
              <a 
                :href="link.url === '#' ? '#' : undefined" 
                class="footer-link"
                @click.prevent="handleLinkClick(link)"
              >
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
              <p><i class="fas fa-phone-alt" style="color: var(--primary-color);"></i> +591 77997694</p>
              <p><i class="fas fa-envelope" style="color: var(--primary-color);"></i> contacto@neotechbo.com</p>
            </div>
            <div class="social-links">
              <a href="https://www.facebook.com/NeoTech.Bol" class="social-link" target="_blank">
                <i class="fab fa-facebook-f"></i>
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

    <!-- Modal de confirmación para cerrar sesión -->
    <div v-if="showLogoutModal" class="logout-modal">
      <div class="logout-modal-content">
        <div class="logout-modal-header">
          <h3>Cerrar Sesión</h3>
          <button class="close-modal" @click="cancelLogout">×</button>
        </div>
        <div class="logout-modal-body">
          <p>¿Estás seguro que deseas cerrar sesión?</p>
        </div>
        <div class="logout-modal-footer">
          <button class="cancel-btn" @click="cancelLogout">Cancelar</button>
          <button class="logout-btn" @click="confirmLogout">
            <i class="fas fa-sign-out-alt"></i> Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import { categoriasActivesID } from '@/Services/CategoriaService';
import { useRouter, useRoute } from 'vue-router';
import { useUserStore } from '@/stores/userAuht'; // Asegúrate de tener este store
import { logout } from '@/Services/AuthService'; // Importa la función de logout
import { generarSlug } from '@/Utils/string-utils';

// Router y store
const router = useRouter();
const route = useRoute();
const authStore = useUserStore();

// Estado para el modal de logout
const showLogoutModal = ref(false);

// Estado para controlar las secciones colapsables
const footerSections = ref([
  {
    title: 'Neotech Bol',
    isOpen: false,
    links: [
      { text: 'Sobre Nosotros', url: '/nosotros', action: 'navigate', scrollTop: true },
      { text: 'Contáctanos', url: '/contacto', action: 'navigate', scrollTop: true }
    ]
  },
  {
    title: 'Cuenta',
    isOpen: false,
    links: [
      { text: 'Entrar', url: '/login', action: 'navigate' },
      { text: 'Ver Carrito', url: '/checkout', action: 'navigate' },
      { text: 'Cerrar sesion', url: '#', action: 'logout' },
    ]
  }
]);

// Estado para las categorías
const categorias = ref([]);
const categoriasOpen = ref(false);
const contactSectionOpen = ref(false);
const isMobile = ref(false);
const isLoading = ref(false);

// Función para manejar clics en enlaces
const handleLinkClick = async (link) => {
  if (link.action === 'logout') {
    showLogoutModal.value = true;
  } else if (link.action === 'navigate' && link.url) {
    // Si estamos en la misma ruta y se requiere scroll al top
    if (route.path === link.url && link.scrollTop) {
      scrollToTop();
    } else {
      // Navegar a la nueva ruta
      await router.push(link.url);
      
      // Si se requiere scroll al top, hacerlo después de la navegación
      if (link.scrollTop) {
        // Esperar a que el DOM se actualice
        await nextTick();
        scrollToTop();
      }
    }
  }
};

// Función para hacer scroll al inicio de la página
const scrollToTop = () => {
  // Scroll suave
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
};

// Funciones para el modal de logout
const cancelLogout = () => {
  showLogoutModal.value = false;
};

const confirmLogout = async () => {
  try {
    await cerrarSesion();
    showLogoutModal.value = false;
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
    showNotification('Error al cerrar sesión', 'error');
  }
};

// Función completa para cerrar sesión
const cerrarSesion = async () => {
  try {
    // 1. Llamar al endpoint de logout en el backend (si existe)
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    
    if (token) {
      try {
        const { data } = await logout();
      } catch (apiError) {
        console.warn('Error al llamar al endpoint de logout:', apiError);
        // Continuamos con el proceso aunque falle la API
      }
    }
    
    // 2. Limpiar tokens y datos de usuario del almacenamiento local
    localStorage.removeItem('token');
    localStorage.removeItem('datosUser');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('datosUser');
    
    // 3. Mostrar notificación de éxito
    showNotification('Sesión cerrada correctamente', 'success');
    
    // 4. Redireccionar al login
    router.push('/login');
    
    // 5. Hacer scroll al top después de redireccionar
    nextTick(() => {
      scrollToTop();
    });
    
    return Promise.resolve();
  } catch (error) {
    console.error('Error en cerrarSesion:', error);
    showNotification('Error al cerrar sesión', 'error');
    return Promise.reject(error);
  }
};

// Función para mostrar notificaciones
const showNotification = (message, type) => {
  // Ejemplo básico de notificación
  const notificationElement = document.createElement('div');
  notificationElement.className = `notification notification-${type}`;
  notificationElement.innerHTML = `
    <div class="notification-content">
      <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
      <span>${message}</span>
    </div>
  `;
  
  document.body.appendChild(notificationElement);
  
  // Eliminar la notificación después de 3 segundos
  setTimeout(() => {
    notificationElement.classList.add('notification-hide');
    setTimeout(() => {
      document.body.removeChild(notificationElement);
    }, 300);
  }, 3000);
};

// Función para listar categorías desde la API
const listarCategorias = async () => {
  isLoading.value = true;
  try {
    const { data } = await categoriasActivesID();
    if (data && data.datos) {
      categorias.value = data.datos;
    } else {
      console.error('Formato de respuesta inesperado:', data);
      categorias.value = [];
    }
  } catch (error) {
    console.error('Error al cargar categorías:', error);
    categorias.value = [];
  } finally {
    isLoading.value = false;
  }
};

const irCategoria = (idCategoria, nameCategoria) => {
  const slug = generarSlug(nameCategoria);
  // Navegar a la ruta de la categoría
  router.push({ path: `/categoria/${idCategoria}/${slug}` });
  // Hacer scroll al top después de navegar a la categoría
  nextTick(() => {
    scrollToTop();
  });
}

// Función para alternar la visibilidad de las secciones
const toggleSection = (index) => {
  if (!isMobile.value) return;

  if (index === footerSections.value.length) {
    contactSectionOpen.value = !contactSectionOpen.value;
  } else {
    footerSections.value[index].isOpen = !footerSections.value[index].isOpen;
  }
};

// Función para alternar la sección de categorías
const toggleCategorias = () => {
  if (!isMobile.value) return;
  categoriasOpen.value = !categoriasOpen.value;
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
    categoriasOpen.value = true;
  } else {
    // En móvil, cerrar todas las secciones por defecto
    footerSections.value.forEach(section => {
      section.isOpen = false;
    });
    contactSectionOpen.value = false;
    categoriasOpen.value = false;
  }
};

// Configurar event listeners para el resize y cargar categorías al montar
onMounted(() => {
  checkIfMobile();
  listarCategorias(); // Cargar categorías al montar el componente
  window.addEventListener('resize', checkIfMobile);
  
  // Escuchar la tecla Escape para cerrar el modal
  window.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener('resize', checkIfMobile);
  window.removeEventListener('keydown', handleKeyDown);
});

// Manejar teclas para accesibilidad
const handleKeyDown = (e) => {
  if (e.key === 'Escape' && showLogoutModal.value) {
    cancelLogout();
  }
};
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

.loading-text {
  color: #6c757d;
  font-style: italic;
  font-size: 0.9rem;
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

/* Modal de logout */
.logout-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(3px);
}

.logout-modal-content {
  background-color: white;
  border-radius: 10px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  animation: modalFadeIn 0.3s ease;
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.logout-modal-header {
  padding: 15px 20px;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logout-modal-header h3 {
  margin: 0;
  font-size: 1.2rem;
  color: #333;
}

.close-modal {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #6c757d;
  cursor: pointer;
  transition: color 0.2s ease;
}

.close-modal:hover {
  color: #dc3545;
}

.logout-modal-body {
  padding: 20px;
}

.logout-modal-body p {
  margin: 0;
  font-size: 1rem;
  color: #333;
}

.logout-modal-footer {
  padding: 15px 20px;
  border-top: 1px solid #e9ecef;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.cancel-btn, .logout-btn {
  padding: 8px 16px;
  border-radius: 5px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancel-btn {
  background-color: #f8f9fa;
  color: #333;
  border: 1px solid #dee2e6;
}

.cancel-btn:hover {
  background-color: #e9ecef;
}

.logout-btn {
  background-color: #dc3545;
  color: white;
  border: none;
  display: flex;
  align-items: center;
  gap: 8px;
}

.logout-btn:hover {
  background-color: #c82333;
}

/* Estilos para notificaciones */
.notification {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 15px 20px;
  border-radius: 5px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1100;
  animation: notificationSlideIn 0.3s ease;
  max-width: 350px;
}

.notification-content {
  display: flex;
  align-items: center;
  gap: 10px;
}

.notification-success {
  background-color: #d4edda;
  color: #155724;
  border-left: 4px solid #28a745;
}

.notification-error {
  background-color: #f8d7da;
  color: #721c24;
  border-left: 4px solid #dc3545;
}

.notification-hide {
  animation: notificationSlideOut 0.3s ease forwards;
}

@keyframes notificationSlideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes notificationSlideOut {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
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
  
  .logout-modal-content {
    width: 95%;
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
  
  .logout-modal-header h3 {
    font-size: 1.1rem;
  }
  
  .logout-modal-body p {
    font-size: 0.9rem;
  }
  
  .cancel-btn, .logout-btn {
    padding: 7px 14px;
    font-size: 0.85rem;
  }
}
</style>