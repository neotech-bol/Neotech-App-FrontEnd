<template >
  <header class="header">
    <div class="top-bar">
      <div class="top-bar-inner">
        <div class="contact">
          <a href="tel:+59177997694"><i class="fas fa-phone-alt"></i> +591 77997694</a>
        </div>
        <div class="announcement text-color">
          La experiencia de compra más veloz del país
        </div>
        <div class="top-links">
          <a href="#\">Ayuda</a>
<!--           <select v-model="language" class="language-select" @change="changeLanguage">
            <option value="es">Español</option>
            <option value="en">English</option>
          </select>
          <select v-model="currency" class="currency-select">
            <option value="bs">Bs</option>
            <option value="usd">USD</option>
          </select> -->
        </div>
      </div>
    </div>
    <div class="main-header">
      <div class="logo">
        <img src="/logo/Logo Neofetch PNG.png" alt="Logo" />
      </div>
      <div class="mobile-toggle" @click="toggleMobileMenu">
        <i :class="isMobileMenuOpen ? 'fas fa-times' : 'fas fa-bars'"></i>
      </div>
      <div class="search-bar">
        <input v-model="searchQuery" type="text" placeholder="¿Qué estás buscando en este ciclo?" />
        <button class="search-button" @click="performSearch">
          <i class="fas fa-search"></i>
        </button>
      </div>
      <div class="user-actions">
        <button class="icon-button" @click="handleAccountClick">
          <img src="/svg/icono-header-cuenta.svg" alt="Account">
          <span class="label">{{ isLoggedIn ? 'Cuenta' : 'Iniciar sesión' }}</span>
        </button>
        <button class="icon-button" @click="goFavorites()">
          <img src="/svg/icono-header-favoritos.svg" alt="Favorites">
          <span class="label">Favoritos</span>
        </button>
        <button class="icon-button cart-button" @click="carritoView()">
          <img src="/svg/icono-header-carrito.svg" alt="Cart">
          <span class="label">Carrito</span>
          <span class="cart-count" v-if="cartItemCount > 0">{{ cartItemCount }}</span>
        </button>
      </div>
    </div>
    <hr>
    <nav class="main-nav" :class="{ 'mobile-nav-open': isMobileMenuOpen }">
      <button class="catalog-button" @click="toggleSidebar">
        <i class="fas fa-th-large"></i>
        Ver catálogo
      </button>
      <ul class="nav-links">
        <li v-for="item in navItems" :key="item.path">
          <router-link :to="item.path" :class="{ 'active': $route.path === item.path }" @click="closeMobileMenu">
            <span class="link-text">{{item.nombre}}</span>
          </router-link>
        </li>
      </ul>
      <div :class="[
    'location-selector',
    currentDepartment === 'la-paz' ? 'location-selector-naranja' : '',
    currentDepartment === 'cochabamba' ? 'location-selector-azul' : ''
  ]">
    <i class="fas fa-map-marker-alt"></i>
    <select v-model="currentDepartment" class="location-select" @change="updateDepartment">
      <option value="la-paz">La Paz</option>
      <option value="cochabamba">Cochabamba</option>
      <option value="santa-cruz">Santa Cruz</option>
      <option value="tarija">Tarija</option>
      <option value="potosi">Potosí</option>
      <option value="oruro">Oruro</option>
      <option value="beni">Beni</option>
      <option value="pando">Pando</option>
      <option value="chuquisaca">Chuquisaca</option>
      <option value="el-beni">El Beni</option>
    </select>
  </div>
    </nav>
    <hr>
  </header>

  <div :class="['sidebar', { 'open': isSidebarOpen }]">
    <div class="sidebar-header">
      <h2>Catálogos</h2>
      <button class="close-sidebar" @click="toggleSidebar">
        <i class="fas fa-times"></i>
      </button>
    </div>

    <div class="sidebar-content">
      <!-- Sección de Catálogos Activos -->
      <div class="catalog-section">
        <h3 @click="toggleSection('activos')" :class="{ 'active': activeSections.activos }">
          Catálogos Activos
          <i :class="['fas', activeSections.activos ? 'fa-chevron-up' : 'fa-chevron-down']"></i>
        </h3>
        <transition name="accordion">
          <ul v-if="activeSections.activos" class="category-list">
            <li v-for="catalogo in catalogosActivos" :key="catalogo.id">
              <a href="#" @click="viewCatalogoActivo(catalogo.id)">
                <i class="fas fa-book-open"></i>
                {{ catalogo.nombre }}
              </a>
              <ul v-if="catalogo.categorias" class="subcategory-list">
                <li v-for="categoria in catalogo.categorias" :key="categoria.id">
                  <a href="#" @click="viewCategoria(categoria.id)">
                    <i class="fas fa-tag"></i>
                    {{ categoria.nombre }}
                  </a>
                </li>
              </ul>
            </li>
          </ul>
        </transition>
      </div>

      <!-- Sección de Catálogos Anteriores -->
      <div class="catalog-section">
        <h3 @click="toggleSection('anteriores')" :class="{ 'active': activeSections.anteriores }">
          Historial de Catálogos
          <i :class="['fas', activeSections.anteriores ? 'fa-chevron-up' : 'fa-chevron-down']"></i>
        </h3>
        <transition name="accordion">
          <ul v-if="activeSections.anteriores" class="category-list">
            <li v-for="catalogo in catalogosAnteriores" :key="catalogo.id">
              <a href="#" @click="viewCatalogoHistorial(catalogo.id)">
                <i class="fas fa-history"></i>
                {{ catalogo.nombre }}
              </a>
            </li>
          </ul>
        </transition>
      </div>
    </div>
  </div>
  <div :class="['sidebar-overlay', { 'active': isSidebarOpen || isMobileMenuOpen }]" @click="closeAllMenus"></div>

  <!-- Mensaje flotante -->
  <div v-if="showLoginMessage" class="login-message">
    <div class="message-content">
      <i class="fas fa-exclamation-circle"></i>
      <span>Debes iniciar sesión para acceder a Favoritos</span>
      <button @click="showLoginMessage = false" class="close-button">
        <i class="fas fa-times"></i>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, provide } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart';
import { updateDeparatamento } from '@/Services/UsuarioService';
import { idCatalogoHistorial } from '@/Services/CatalogoHistorialesService';
import { indexCatalogosactives } from '@/Services/CatalogoService';
import { useUserStore } from '@/stores/userAuht';
import { useThemeStore } from '@/stores/themeStore';

const router = useRouter();
const cartStore = useCartStore();
const language = ref(localStorage.getItem('lang') || 'es');
const searchQuery = ref('')
const currency = ref('bs')
const isSidebarOpen = ref(false)
const cartItemCount = computed(() => cartStore.uniqueItemCount);
const isLoggedIn = ref(false);
const isMobileMenuOpen = ref(false)
const catalogosAnteriores = ref([]);
const catalogosActivos = ref([]);
// Initialize stores
const themeStore = useThemeStore()
const userStore = useUserStore();
const selectedLocation = computed(() => form.value.departamento);
// Provide the selected location to all child components
provide('selectedLocation', selectedLocation);
// Función para obtener la ubicación inicial
const getInitialLocation = () => {
  return localStorage.getItem('departamento') || userStore.user.departamento || 'cochabamba';
};
const form = ref({
  departamento: localStorage.getItem('departamento') || userStore.user.departamento || 'cochabamba'
});
// Create a reactive reference to the current department
const currentDepartment = computed({
  get: () => themeStore.currentDepartment,
  set: (value) => themeStore.setDepartment(value)
})
// Function to update department
const updateDepartment = async () => {
  try {
    // If user is authenticated, update their preference in the backend
    if (userStore.isAuthenticated) {
      // Uncomment this when you have the updateDepartamento function
      const { data } = await updateDeparatamento({ departamento: currentDepartment.value });
      console.log(data);
      userStore.user.departamento = currentDepartment.value
      console.log('Department updated for authenticated user')
    }
    
    // This will update localStorage and apply the theme
    themeStore.setDepartment(currentDepartment.value)
  } catch (error) {
    console.error('Error updating department:', error)
  }
}

const navItems = [
  { nombre: 'Inicio', path: '/', icon: 'fas fa-home' },
  { nombre: 'Productos', path: '/productos', icon: 'fas fa-box-open' },
  { nombre: 'Categorías', path: '/categorias', icon: 'fas fa-th-list' },
  { nombre: 'Nosotros', path: '/nosotros', icon: 'fas fa-info-circle' },
  { nombre: 'Contacto', path: '/contacto', icon: 'fas fa-envelope' }
];

const listarCatalogosHistoriales = async () => {
  try {
    const { data } = await idCatalogoHistorial();
    catalogosAnteriores.value = data.datos
    console.log(catalogosAnteriores.value);
  } catch (error) {
    console.log(error);
  }
}
const listarCatalogosActivos = async () => {
  try {
    const { data } = await indexCatalogosactives();
    catalogosActivos.value = data.datos
    console.log(catalogosActivos.value);
  } catch (error) {
    console.log(error);
  }
}
const viewCatalogoHistorial = (idCatalogoHistorial) => {
  console.log(idCatalogoHistorial);
  router.push({ path: `/catalogo-historial/${idCatalogoHistorial}` });
  toggleSidebar();
};
const viewCatalogoActivo = (idCatalogo) => {
  console.log(idCatalogo);
  router.push({ path: `/catalogo-activo/${idCatalogo}` });
  toggleSidebar();
};

const changeLanguage = () => {
  locale.value = language.value;
  localStorage.setItem('lang', language.value);
};

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
  
};

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false;
  
};

const performSearch = () => {
  if (searchQuery.value.trim()) {
    router.push({ path: '/search', query: { q: searchQuery.value } });
    searchQuery.value = '';
    closeMobileMenu();
  }
};

const handleAccountClick = () => {
  if (isLoggedIn.value) {
    router.push({ path: '/perfil' });
  } else {
    router.push({ path: '/login' });
  }
  closeMobileMenu();
};

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
  
};

const closeAllMenus = () => {
  isSidebarOpen.value = false;
  isMobileMenuOpen.value = false;
  
};

const updateColors = (location) => {
  document.documentElement.style.setProperty('--primary-color', location === 'la-paz' ? '#f8a812' : '#3B82F6');
  document.documentElement.style.setProperty('--primary-hover-color', location === 'la-paz' ? '#e69711' : '#2563eb');
};

const carritoView = () => {
  router.push({ path: '/checkout' });
  closeMobileMenu();
};

const showLoginMessage = ref(false);

const goFavorites = () => {
  if (isLoggedIn.value) {
    router.push({ path: '/favoritos' });
    closeMobileMenu();
  } else {
    showLoginMessage.value = true;
    setTimeout(() => {
      showLoginMessage.value = false;
    }, 3000);
    router.push({ path: '/login' }); // Opcional: redirigir a login
  }
};

onMounted(() => {
  const token = localStorage.getItem('token');
  isLoggedIn.value = !!token;

  // Asegura que el departamento se cargue correctamente
  if (localStorage.getItem('departamento')) {
    form.value.departamento = localStorage.getItem('departamento');
  }

  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
      closeMobileMenu();
    }
  });
  updateColors(form.value.departamento);
  listarCatalogosHistoriales();
  listarCatalogosActivos(); 
});

watch([isSidebarOpen, isMobileMenuOpen], () => {
  if (isSidebarOpen.value || isMobileMenuOpen.value) {
    document.addEventListener('keydown', handleEscKey);
  } else {
    document.removeEventListener('keydown', handleEscKey);
  }
    // Set initial CSS custom properties
    document.documentElement.style.setProperty('--primary-color', form.value.departamento === 'la-paz' ? '#f8a812' : '#3B82F6');
  document.documentElement.style.setProperty('--primary-hover-color', form.value.departamento === 'la-paz' ? '#e69711' : '#2563eb');
});
const activeSections = ref({
  activos: true,
  anteriores: true
});


const toggleSection = (section) => {
  activeSections.value[section] = !activeSections.value[section];
};

const handleEscKey = (event) => {
  if (event.key === 'Escape') {
    closeAllMenus();
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css');
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

hr {
  background-color: #838384;
  /* Color de fondo */
  margin: 0;
  border: none;
  /* Elimina el borde */
  height: 0.3px;
  /* Aumenta la altura para que sea más visible */
  opacity: 0.6;
  /* Asegúrate de que la opacidad sea 1 */
}

.header {
  font-family: "Inter", sans-serif;
  width: 100%;
  margin: 0;
  position: sticky;
  /* Mantiene el elemento en la parte superior */
  top: 0;
  /* Posición en la parte superior */
  z-index: 1000;
  /* Asegúrate de que esté por encima de otros elementos */
}


.top-bar {
  background-color: #F8F8FB;
  width: 100%;
}

.top-bar-inner {
  max-width: 1440px;
  margin: 0 auto;
  padding: 8px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  font-size: 14px;
  font-weight: 300;
}

.top-bar a,
.top-bar select {
  color: #838384;
  text-decoration: none;
  margin-right: 16px;
  transition: color 0.3s ease;
}

.top-bar a:hover {
  color: #3B82F6;
}

.language-select,
.currency-select {
  background: none;
  border: none;
  color: #838384;
  font-size: 14px;
  cursor: pointer;
  outline: none;
}

.text-color {
  color: #838384;
  font-weight: 250;
}

.top-links {
  display: flex;
  align-items: center;
}

.main-header {
  max-width: 1440px;
  margin: 0 auto;
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  background-color: #FFFFFF;
}

.logo img {
  height: 40px;
  transition: transform 0.3s ease;
}

.logo img:hover {
  transform: scale(1.05);
}

.mobile-toggle {
  display: none;
  font-size: 24px;
  background: none;
  border: none;
  cursor: pointer;
  color: #333;
  z-index: 1001;
}

.search-bar {
  flex-grow: 1;
  display: flex;
  margin: 0 16px;
  position: relative;
  max-width: 600px;
}

.search-bar input {
  width: 100%;
  padding: 12px 40px 12px 16px;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
  font-weight: 250;
}

.search-bar input:focus {
  outline: none;
  border-color: #3B82F6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.25);
}

.search-button {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  font-size: 20px;
  color: #6B7280;
  transition: color 0.3s ease;
}

.search-button:hover {
  color: #3B82F6;
}

.user-actions {
  display: flex;
  gap: 16px;
}

.icon-button {
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: transform 0.3s ease;
}

.icon-button:hover {
  transform: translateY(-2px);
}

.icon-button img {
  width: 24px;
  height: 24px;
}

.icon-button .label {
  font-size: 12px;
  margin-top: 4px;
}

.cart-button {
  position: relative;
}

.cart-count {
  position: absolute;
  top: -5px;
  right: -5px;
  background-color: var(--primary-color);
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 12px;
  font-weight: bold;
}

.main-nav {
  padding: 5px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 8px;
  max-width: 1440px;
  background-color: #FFFFFF;
  /* Establece el fondo blanco */
  margin: 0 auto;
}

.catalog-button {
  background: var(--primary-color);
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 6px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.catalog-button:hover {
  background: var(--primary-hover-color);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(52, 152, 219, 0.3);
}

.nav-links {
  display: flex;
  list-style-type: none;
  gap: 24px;
  margin: 0;
  padding: 0;
}

.nav-links a {
  color: #1F2937;
  text-decoration: none;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.nav-links a:hover,
.nav-links a.active {
  color: var(--primary-color);
}


.nav-links a i {
  font-size: 18px;
}

.location-selector {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: var(--primary-color);
  padding: 12px 16px;
  border-radius: 6px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.location-selector-naranja {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: #f8a812; /* More orange color */
  padding: 12px 16px;
  border-radius: 6px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.location-selector-azul {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: #3B82F6; /* Blue color */
  padding: 12px 16px;
  border-radius: 6px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.location-selector i {
  color: #FFFFFF;
}

.location-select {
  text-decoration: none;
  /* appearance: none; */
  border: none;
  background: none;
  font-weight: 500;
  color: #fcfcfc;
  cursor: pointer;
  /*   -webkit-appearance: none;
  -moz-appearance: none; */
}

/* Opcional: Estilo al hacer foco */
.location-select:focus {
  outline: none;
  /* Elimina el contorno al hacer foco */
}

.location-select option {
  color: black;
  /* Color del texto de las opciones */
  background-color: white;
  /* Fondo blanco para las opciones */
}

.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: 350px;
  height: 100%;
  background-color: #ffffff;
  box-shadow: 0 0 30px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  overflow-y: auto;
  padding: 0;
  transform: translateX(-100%);
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border-right: 1px solid #e5e7eb;
}

.sidebar.open {
  transform: translateX(0);
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 28px;
  background-color: #2563eb;
  color: #ffffff;
}

.sidebar-header h2 {
  font-size: 28px;
  margin: 0;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.close-sidebar {
  background: none;
  border: none;
  font-size: 24px;
  color: #ffffff;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.close-sidebar:hover {
  transform: rotate(90deg);
}

.sidebar-content {
  padding: 20px;
}

.catalog-section {
  margin-bottom: 20px;
}

h3 {
  font-size: 20px;
  color: #1f2937;
  margin: 0 0 16px;
  font-weight: 600;
  padding: 12px 16px;
  background-color: #f3f4f6;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

h3:hover,
h3.active {
  background-color: #2563eb;
  color: #ffffff;
}

.category-list {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.category-list>li {
  margin-bottom: 12px;
}

.category-list>li>a {
  display: flex;
  align-items: center;
  gap: 14px;
  font-size: 16px;
  font-weight: 500;
  color: #374151;
  text-decoration: none;
  padding: 14px 18px;
  border-radius: 8px;
  transition: all 0.3s ease;
  background-color: #f9fafb;
}

.category-list>li>a:hover {
  background-color: #e0f2fe;
  color: #2563eb;
  transform: translateX(5px);
}

.category-list>li>a i {
  font-size: 20px;
  color: #2563eb;
}

.subcategory-list {
  list-style-type: none;
  padding-left: 20px;
  margin-top: 8px;
}

.subcategory-list li a {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: #4b5563;
  text-decoration: none;
  padding: 10px 14px;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.subcategory-list li a:hover {
  background-color: #f3f4f6;
  color: #2563eb;
}

.accordion-enter-active,
.accordion-leave-active {
  transition: max-height 0.3s ease, opacity 0.3s ease;
  max-height: 1000px;
  overflow: hidden;
}

.accordion-enter-from,
.accordion-leave-to {
  max-height: 0;
  opacity: 0;
}

@media (max-width: 640px) {
  .sidebar {
    width: 100%;
  }
}

@media (max-width: 1024px) {
  .main-header {
    padding: 16px;
  }

  .search-bar {
    max-width: 100%;
    margin: 16px 0;
  }

  .user-actions {
    width: 100%;
    justify-content: space-around;
    margin-top: 16px;
  }

  .main-nav {
    justify-content: center;
  }

  .nav-links {
    flex-wrap: wrap;
    justify-content: center;
  }

  .nav-links li {
    margin: 8px 12px;
  }
}

@media (max-width: 768px) {
  .mobile-toggle {
    display: block;
  }

  .top-bar-inner {
    justify-content: center;
  }

  .main-header {
    flex-wrap: wrap;
  }

  .logo img {
    height: 36px;
  }

  .search-bar {
    order: 1;
    margin: 15px 0;
    width: 100%;
  }

  .user-actions {
    order: 2;
    width: 100%;
    justify-content: space-around;
  }

  .main-nav {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    background: #FFFFFF;
    z-index: 1000;
    padding: 20px;
    flex-direction: column;
    gap: 20px;
    overflow-y: auto;
  }

  .main-nav.mobile-nav-open {
    display: flex;
  }

  .nav-links {
    flex-direction: column;
    width: 100%;
    gap: 15px;
  }

  .nav-links a {
    padding: 10px 0;
    display: block;
    border-bottom: 1px solid #E5E7EB;
  }

  .catalog-button,
  .location-selector {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .top-bar-inner {
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }

  .top-links {
    display: none;
    flex-wrap: wrap;
    justify-content: center;
  }

  .main-header {
    padding: 12px;
  }

  .logo img {
    height: 32px;
  }

  .search-bar input {
    font-size: 14px;
    padding: 10px 36px 10px 12px;
  }

  .user-actions {
    gap: 8px;
  }

  .icon-button .label {
    font-size: 10px;
  }

  .announcement {
    display: none;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}
.login-message {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: #ff4444;
  color: white;
  padding: 15px 25px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 2000;
  animation: slideIn 0.3s ease-out;
}

.message-content {
  display: flex;
  align-items: center;
  gap: 10px;
}

.close-button {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 5px;
  margin-left: 15px;
}

.close-button:hover {
  opacity: 0.8;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}
</style>

