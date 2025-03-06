<template>
  <header class="header">
    <div class="top-bar">
      <div class="top-bar-inner">
        <div class="contact">
          <a href="tel:+59177997694" style="text-decoration: none; color: #838384;"><i class="fas fa-phone-alt"></i>
            +591 77997694</a>
        </div>
        <div class="announcement">
          {{ translate('experience') }}
        </div>
        <div class="top-links">
<!--           <select v-model="currentLanguage" @change="handleLanguageChange" class="language-select">
            <option value="es">Español</option>
            <option value="en">English</option>
          </select> -->
          <a href="#" style="text-decoration: none; color: #838384;">{{ translate('help') }}</a>
        </div>
      </div>
    </div>
    <div class="main-header">
      <div class="logo">
        <img src="/logo/Logo Neofetch PNG.png" alt="Logo" />
      </div>
      <div class="search-bar">
        <input v-model="searchQuery" type="text" :placeholder="translate('search_placeholder')" />
        <button class="search-button" @click="performSearch">
          <i class="fas fa-search"></i>
        </button>
      </div>
      <div class="user-actions">
        <button class="icon-button" @click="handleAccountClick">
          <img src="/svg/icono-header-cuenta.svg" alt="Account" />
          <span class="label">{{ translate(isLoggedIn ? 'account' : 'login') }}</span>
        </button>
        <button class="icon-button" @click="goFavorites">
          <img src="/svg/icono-header-favoritos.svg" alt="Favorites" />
          <span class="label">{{ translate('favorites') }}</span>
        </button>
        <button class="icon-button cart-button" @click="carritoView">
          <img src="/svg/icono-header-carrito.svg" alt="Cart" />
          <span class="label">{{ translate('cart') }}</span>
          <span class="cart-count" v-if="cartItemCount > 0">{{ cartItemCount }}</span>
        </button>
      </div>
      <div class="mobile-toggle" @click="toggleMobileMenu">
        <i :class="isMobileMenuOpen ? 'fas fa-times' : 'fas fa-bars'"></i>
      </div>
    </div>
    <hr />
    <nav class="main-nav" :class="{ 'mobile-nav-open': isMobileMenuOpen }">
      <div class="nav-header" v-if="isMobileMenuOpen">
        <div class="logo">
          <img src="/logo/Logo Neofetch PNG.png" alt="Logo" />
        </div>
        <button class="close-nav" @click="closeMobileMenu">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <button class="catalog-button" @click="toggleSidebar">
        <i class="fas fa-th-large"></i>
        {{ translate('view_catalog') }} <!-- Traducción aquí -->
      </button>
      <ul class="nav-links">
        <li v-for="item in navItems" :key="item.path">
          <router-link :to="item.path" :class="{ 'active': $route.path === item.path }" @click="closeMobileMenu">
            <i :class="item.icon"></i>
            <span class="link-text">{{ translate(item.nombre) }}</span> <!-- Traducción aquí -->
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
      <div class="mobile-user-actions" v-if="isMobileMenuOpen">
        <button class="mobile-action-button" @click="handleAccountClick">
          <i class="fas fa-user"></i>
          <span>{{ translate(isLoggedIn ? 'account' : 'login') }}</span> <!-- Traducción aquí -->
        </button>
        <button class="mobile-action-button" @click="goFavorites">
          <i class="fas fa-heart"></i>
          <span>{{ translate('favorites') }}</span> <!-- Traducción aquí -->
        </button>
        <button class="mobile-action-button" @click="carritoView">
          <i class="fas fa-shopping-cart"></i>
          <span>{{ translate('cart') }}</span> <!-- Traducción aquí -->
          <span class="mobile-cart-count" v-if="cartItemCount > 0">{{ cartItemCount }}</span>
        </button>
      </div>
    </nav>
    <hr />
  </header>

  <div :class="['sidebar', { 'open': isSidebarOpen }]">
    <div class="sidebar-header">
      <h2>{{ translate('catalogs') }}</h2> <!-- Traducción aquí -->
      <button class="close-sidebar" @click="toggleSidebar">
        <i class="fas fa-times"></i>
      </button>
    </div>
    <div class="sidebar-content">
      <div class="catalog-section">
        <h3 @click="toggleSection('activos')" :class="{ 'active': activeSections.activos }">
          Catálogos Activos
          <i :class="['fas', activeSections.activos ? 'fa-chevron-up' : 'fa-chevron-down']"></i>
        </h3>
        <transition name="accordion">
          <ul v-if="activeSections.activos" class="category-list">
            <li v-for="catalogo in catalogosActivos" :key="catalogo.id">
              <a href="#" @click.prevent="viewCatalogoActivo(catalogo.id)">
                <i class="fas fa-book-open"></i>
                {{ catalogo.nombre }}
              </a>
              <ul v-if="catalogo.categorias" class="subcategory-list">
                <li v-for="categoria in catalogo.categorias" :key="categoria.id">
                  <a href="#" @click.prevent="viewCategoria(categoria.id)">
                    <i class="fas fa-tag"></i>
                    {{ categoria.nombre }}
                  </a>
                </li>
              </ul>
            </li>
          </ul>
        </transition>
      </div>
      <div class="catalog-section">
        <h3 @click="toggleSection('anteriores')" :class="{ 'active': activeSections.anteriores }">
          Historial de Catálogos
          <i :class="['fas', activeSections.anteriores ? 'fa-chevron-up' : 'fa-chevron-down']"></i>
        </h3>
        <transition name="accordion">
          <ul v-if="activeSections.anteriores" class="category-list">
            <li v-for="catalogo in catalogosAnteriores" :key="catalogo.id">
              <a href="#" @click.prevent="viewCatalogoHistorial(catalogo.id)">
                <i class="fas fa-history"></i>
                {{ catalogo.nombre }}
              </a>
            </li>
          </ul>
        </transition>
      </div>
    </div>
  </div>
  <div :class="['sidebar-overlay', { 'active': isSidebarOpen }]" @click="closeAllMenus"></div>

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
import { ref, computed, onMounted, watch, provide } from 'vue';
import { useRouter } from 'vue-router';
import { useCartStore } from '@/stores/cart';
import { updateDeparatamento } from '@/Services/UsuarioService';
import { idCatalogoHistorial } from '@/Services/CatalogoHistorialesService';
import { indexCatalogosactives } from '@/Services/CatalogoService';
import { useUserStore } from '@/stores/userAuht';
import { useThemeStore } from '@/stores/themeStore';
import useLanguageStore from '@/stores/languageStore';

const router = useRouter();
const cartStore = useCartStore();
const searchQuery = ref('');
const currency = ref('bs');
const isSidebarOpen = ref(false);
const cartItemCount = computed(() => cartStore.uniqueItemCount);
const isLoggedIn = ref(false);
const isMobileMenuOpen = ref(false);
const catalogosAnteriores = ref([]);
const catalogosActivos = ref([]);
const themeStore = useThemeStore();
const userStore = useUserStore();

const languageStore = useLanguageStore();
// Language related computeds and methods
const currentLanguage = computed(() => languageStore.currentLanguage);
const translate = (key) => languageStore.translate(key);
const handleLanguageChange = (event) => {
  languageStore.setLanguage(event.target.value);
};

const getInitialLocation = () => {
  return localStorage.getItem('departamento') || userStore.user.departamento || 'cochabamba';
};

// Mantener solo esta implementación con el store
const currentDepartment = computed({
  get: () => themeStore.currentDepartment,
  set: (value) => themeStore.setDepartment(value),
});

const updateDepartment = async () => {
  try {
    if (userStore.isAuthenticated) {
      const { data } = await updateDeparatamento({ departamento: currentDepartment.value });
      userStore.user.departamento = currentDepartment.value;
    }
    themeStore.setDepartment(currentDepartment.value);
  } catch (error) {
    console.error('Error updating department:', error);
  }
};

const navItems = [
  { nombre: 'home', path: '/', icon: 'fas fa-home' },
  { nombre: 'products', path: '/productos', icon: 'fas fa-box-open' },
  { nombre: 'categories', path: '/categorias', icon: 'fas fa-th-list' },
  { nombre: 'about', path: '/nosotros', icon: 'fas fa-info-circle' },
  { nombre: 'contact', path: '/contacto', icon: 'fas fa-envelope' },
];

// Función para listar catálogos históricos
const listarCatalogosHistoriales = async () => {
  try {
    const { data } = await idCatalogoHistorial(); // Realiza la petición a la API
    catalogosAnteriores.value = languageStore.translateApiData(data.datos); // Traduce los datos antes de almacenarlos
  } catch (error) {
    console.log(error);
  }
};

const listarCatalogosActivos = async () => {
  try {
    const { data } = await indexCatalogosactives();
    catalogosActivos.value = languageStore.translateApiData(data.datos); // Traduce los datos antes de almacenarlos
    console.log(catalogosActivos.value); // Actual);
  } catch (error) {
    console.log(error);
  }
};

const viewCatalogoHistorial = (idCatalogoHistorial) => {
  router.push({ path: `/catalogo-historial/${idCatalogoHistorial}` });
  toggleSidebar();
};

const viewCatalogoActivo = (idCatalogo) => {
  router.push({ path: `/catalogo-activo/${idCatalogo}` });
  toggleSidebar();
};

const viewCategoria = (idCategoria) => {
  router.push({ path: `/categoria/${idCategoria}` });
  toggleSidebar();
};

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
  isSidebarOpen.value = false; // Cerrar sidebar al abrir el menú móvil
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
  router.push({ path: isLoggedIn.value ? '/perfil' : '/login' });
  closeMobileMenu();
};

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
  isMobileMenuOpen.value = false; // Cerrar menú móvil al abrir sidebar
};

const closeAllMenus = () => {
  isSidebarOpen.value = false;
  isMobileMenuOpen.value = false;
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
    setTimeout(() => (showLoginMessage.value = false), 3000);
    router.push({ path: '/login' });
  }
};

onMounted(() => {
  const token = localStorage.getItem('token');
  isLoggedIn.value = !!token;
  listarCatalogosHistoriales();
  listarCatalogosActivos();
});

watch([isSidebarOpen, isMobileMenuOpen], () => {
  document.body.style.overflow = isSidebarOpen.value || isMobileMenuOpen.value ? 'hidden' : 'auto';
});

const activeSections = ref({
  activos: true,
  anteriores: true,
});

const toggleSection = (section) => {
  activeSections.value[section] = !activeSections.value[section];
};
//api
/* import { useLanguageStore } from '../stores/languageStore'

const { translateApiData } = useLanguageStore()

// When fetching data
const response = await axios.get('/api/endpoint')
const translatedData = translateApiData(response.data) */
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css');
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

/* Base styles (Mobile-first) */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', sans-serif;
}

.header {
  position: sticky;
  top: 0;
  z-index: 1000;
  background: #fff;
  width: 100%;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

hr {
  background-color: #e5e7eb;
  border: none;
  height: 1px;
  margin: 0;
}

/* Top Bar */
.top-bar {
  background-color: #f8f8fb;
  padding: 6px 0;
  font-size: 12px;
}

.top-bar-inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1500px;
  margin: 0 auto;
  padding: 0 16px;
}

.contact,
.top-links {
  display: none;
}

.announcement {
  color: #838384;
  font-weight: 500;
  text-align: center;
  width: 80%;
}

/* Main Header */
.main-header {
  max-width: 1510px;
  margin: 0 auto;
  padding: 12px 16px;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 12px;
}

.logo {
  justify-self: start;
}

.logo img {
  height: 36px;
  object-fit: contain;
  transition: transform 0.3s ease;
}

.logo img:hover {
  transform: scale(1.05);
}

.mobile-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  font-size: 20px;
  background: none;
  border: none;
  cursor: pointer;
  color: #333;
  justify-self: end;
  grid-column: 3;
  grid-row: 1;
}

.search-bar {
  position: relative;
  grid-column: 1 / -1;
  grid-row: 2;
  width: 100%;
  margin-top: 8px;
}

.search-bar input {
  width: 100%;
  padding: 12px 40px 12px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 400;
  background-color: #f9fafb;
}

.search-bar input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.25);
  background-color: #fff;
}

.search-button {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  font-size: 18px;
  color: #6b7280;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.search-button:hover {
  color: #3b82f6;
}

.user-actions {
  display: none;
}

.icon-button {
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px;
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
  font-weight: 500;
  color: #4b5563;
}

.cart-button {
  position: relative;
}

.cart-count {
  position: absolute;
  top: 0;
  right: 0;
  background-color: var(--primary-color, #3b82f6);
  color: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: bold;
}

/* Main Navigation */
.main-nav {
  display: none;
  padding: 12px 16px;
  max-width: 1500px;
  margin: 0 auto;
  background: #fff;
}

.main-nav.mobile-nav-open {
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  z-index: 1001;
  /* Mayor que el overlay */
  padding: 0;
  overflow-y: auto;
  background-color: #fff;
}

.nav-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
}

.close-nav {
  background: none;
  border: none;
  font-size: 24px;
  color: #4b5563;
  cursor: pointer;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.catalog-button {
  background: var(--primary-color, #3b82f6);
  color: white;
  border: none;
  padding: 12px 16px;
  border-radius: 8px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: background 0.3s ease;
  margin: 16px;
  width: calc(100% - 32px);
  justify-content: center;
}

.catalog-button:hover {
  background: var(--primary-hover-color, #2563eb);
}

.nav-links {
  list-style: none;
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0 16px;
}

.nav-links li {
  border-bottom: 1px solid #f3f4f6;
}

.nav-links a {
  color: #1f2937;
  text-decoration: none;
  font-weight: 500;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: color 0.3s ease;
}

.nav-links a i {
  font-size: 18px;
  color: #6b7280;
}

.nav-links a:hover,
.nav-links a.active {
  color: var(--primary-color, #3b82f6);
}

.nav-links a:hover i,
.nav-links a.active i {
  color: var(--primary-color, #3b82f6);
}

.location-selector {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--primary-color, #3b82f6);
  padding: 12px 16px;
  border-radius: 8px;
  margin: 16px;
}

.location-selector-naranja {
  background: #f8a812;
}

.location-selector-azul {
  background: #3b82f6;
}

.location-selector i {
  color: #fff;
}

.location-select {
  border: none;
  background: none;
  color: #fff;
  font-weight: 500;
  cursor: pointer;
  width: 100%;
  font-size: 14px;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
}

.location-select option {
  color: #000;
}

.location-select:focus {
  outline: none;
}

.mobile-user-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
  margin-top: 16px;
  border-top: 1px solid #e5e7eb;
}

.mobile-action-button {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #f3f4f6;
  border: none;
  border-radius: 8px;
  padding: 16px;
  font-size: 16px;
  font-weight: 500;
  color: #4b5563;
  cursor: pointer;
  transition: background 0.3s ease;
  text-align: left;
}

.mobile-action-button:hover {
  background: #e5e7eb;
}

.mobile-action-button i {
  font-size: 20px;
  color: var(--primary-color, #3b82f6);
}

.mobile-cart-count {
  background-color: var(--primary-color, #3b82f6);
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
  margin-left: auto;
}

/* Sidebar */
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  max-width: 320px;
  height: 100%;
  background: #fff;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  z-index: 1002;
  transform: translateX(-100%);
  transition: transform 0.3s ease;
  overflow-y: auto;
}

.sidebar.open {
  transform: translateX(0);
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #2563eb;
  color: #fff;
}

.sidebar-header h2 {
  font-size: 20px;
  font-weight: 700;
}

.close-sidebar {
  background: none;
  border: none;
  font-size: 20px;
  color: #fff;
  cursor: pointer;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sidebar-content {
  padding: 16px;
}

.catalog-section {
  margin-bottom: 16px;
}

.catalog-section h3 {
  font-size: 16px;
  color: #1f2937;
  margin: 0 0 10px;
  padding: 12px;
  background: #f3f4f6;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.3s ease;
}

.catalog-section h3.active {
  background: #2563eb;
  color: #fff;
}

.category-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.category-list li {
  margin-bottom: 4px;
}

.category-list li a {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: #374151;
  text-decoration: none;
  padding: 12px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.category-list li a:hover {
  background: #e0f2fe;
  color: #2563eb;
}

.subcategory-list {
  list-style: none;
  padding-left: 16px;
  margin-top: 4px;
}

.subcategory-list li a {
  font-size: 13px;
  color: #4b5563;
  padding: 10px 12px;
}

/* Sidebar Overlay */
.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  /* Menor que el menú móvil */
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.sidebar-overlay.active {
  opacity: 1;
  visibility: visible;
  pointer-events: auto;
}

/* Login Message */
.login-message {
  position: fixed;
  bottom: 16px;
  right: 16px;
  background: #ef4444;
  color: #fff;
  padding: 12px 20px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 2000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    transform: translateY(100%);
    opacity: 0;
  }

  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.message-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.close-button {
  background: none;
  border: none;
  color: #fff;
  cursor: pointer;
  margin-left: 8px;
}

/* Accordion Animation */
.accordion-enter-active,
.accordion-leave-active {
  transition: max-height 0.3s ease;
  overflow: hidden;
}

.accordion-enter-from,
.accordion-leave-to {
  max-height: 0;
}

.accordion-enter-to,
.accordion-leave-from {
  max-height: 1000px;
}

/* Small Mobile (375px and up) */
@media (min-width: 375px) {
  .main-header {
    grid-template-columns: auto 1fr auto;
  }

  .search-bar {
    grid-column: 1 / -1;
    grid-row: 2;
  }

  .logo img {
    height: 40px;
  }
}

/* Medium Mobile (480px and up) */
@media (min-width: 480px) {
  .top-bar-inner {
    padding: 0 20px;
  }

  .main-header {
    padding: 12px 20px;
  }

  .search-bar input {
    font-size: 15px;
  }
}

/* Tablet (640px and up) */
@media (min-width: 640px) {
  .top-bar-inner {
    padding: 0 24px;
  }

  .contact {
    display: block;
  }

  .main-header {
    grid-template-columns: auto 1fr auto auto;
    padding: 16px 24px;
    gap: 16px;
  }

  .search-bar {
    grid-column: 2;
    grid-row: 1;
    margin-top: 0;
  }

  .logo img {
    height: 42px;
  }
}

/* Tablet (768px and up) */
@media (min-width: 768px) {
  .top-bar {
    padding: 8px 0;
    font-size: 14px;
  }

  .top-bar-inner {
    padding: 0 32px;
  }

  .contact,
  .top-links {
    display: block;
  }

  .main-header {
    padding: 16px 32px;
    grid-template-columns: auto 1fr auto;
    gap: 24px;
  }

  .logo img {
    height: 44px;
  }

  .mobile-toggle {
    display: none;
  }

  .user-actions {
    display: flex;
    gap: 16px;
  }

  .main-nav {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding: 12px 32px;
  }

  .main-nav.mobile-nav-open {
    position: static;
    height: auto;
    padding: 12px 32px;
  }

  .nav-header {
    display: none;
  }

  .catalog-button {
    margin: 0;
    width: auto;
    padding: 10px 16px;
  }

  .nav-links {
    flex-direction: row;
    gap: 16px;
    padding: 0;
  }

  .nav-links li {
    border-bottom: none;
  }

  .nav-links a {
    padding: 8px 12px;
  }

  .nav-links a i {
    display: none;
  }

  .location-selector {
    margin: 0;
    padding: 8px 12px;
  }

  .mobile-user-actions {
    display: none;
  }

  .sidebar {
    max-width: 350px;
  }
}

/* Desktop (1024px and up) */
@media (min-width: 1024px) {

  .top-bar-inner,
  .main-header,
  .main-nav {
    padding-left: 40px;
    padding-right: 40px;
  }

  .main-header {
    padding-top: 20px;
    padding-bottom: 20px;
    gap: 32px;
  }

  .logo img {
    height: 48px;
  }

  .search-bar {
    max-width: 500px;
  }

  .search-bar input {
    padding: 14px 44px 14px 20px;
    font-size: 16px;
  }

  .icon-button {
    padding: 8px 12px;
  }

  .icon-button img {
    width: 28px;
    height: 28px;
  }

  .icon-button .label {
    font-size: 13px;
  }

  .nav-links {
    gap: 24px;
  }

  .nav-links a {
    padding: 8px 16px;
    font-size: 15px;
  }

  .catalog-button {
    padding: 12px 20px;
    font-size: 15px;
  }

  .location-selector {
    padding: 10px 16px;
  }

  .location-select {
    font-size: 15px;
  }
}

/* Large Desktop (1280px and up) */
@media (min-width: 1280px) {

  .top-bar-inner,
  .main-header,
  .main-nav {
    padding-left: 48px;
    padding-right: 48px;
  }

  .main-header {
    gap: 40px;
  }

  .logo img {
    height: 52px;
  }

  .search-bar {
    max-width: 600px;
  }

  .user-actions {
    gap: 24px;
  }

  .icon-button img {
    width: 30px;
    height: 30px;
  }

  .icon-button .label {
    font-size: 14px;
  }

  .nav-links {
    gap: 32px;
  }

  .nav-links a {
    font-size: 16px;
  }
}

.language-select {
  padding: 4px 8px;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  background-color: white;
  color: #838384;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.language-select:hover {
  border-color: #007bff;
}

.language-select:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}
</style>