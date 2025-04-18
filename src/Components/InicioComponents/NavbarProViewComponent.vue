<template>
  <ThemePageWrapper>
    <header class="header">
      <div class="top-bar">
        <div class="top-bar-inner">
          <div class="contact">
            <a href="https://wa.me/59177997694" target="_blank" style="text-decoration: none; color: #838384;">
              <i class="fab fa-whatsapp"></i> <!-- Cambié el ícono a uno de WhatsApp -->
              +591 77997694
            </a>
          </div>
          <div class="announcement">
            Experimenta la mejor tecnología
          </div>
          <div class="top-links">
            <router-link to="/contacto" style="text-decoration: none;"><a href="#"
                style="text-decoration: none; color: #838384;">Ayuda</a></router-link>
            <!--   <router-link to="/faq" style="text-decoration: none;" class="ms-2"><a href="#"
                style="text-decoration: none; color: #838384;">FAQ</a></router-link> -->
                          <!-- Botón de alternar tema -->
<!--           <button @click="themeStoreDark.toggleDarkMode" class="theme-toggle-btn"
            :title="themeStoreDark.isDarkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'">
            <i v-if="!themeStoreDark.isDarkMode" class="fas fa-sun"></i>
            <i v-else class="fas fa-moon"></i>
          </button> -->
          </div>
        </div>
      </div>
      <div class="main-header">
        <div class="logo">
          <router-link to="/">
            <img src="/logo/Logo Neofetch PNG.png" alt="Logo" />
          </router-link>
        </div>


        <!-- Barra de búsqueda mejorada y centrada -->
        <div class="search-container">
          <GlobalSearch />
        </div>

        <div class="header-actions">
          <!-- Botones de acción para escritorio -->
          <div class="user-actions">
            <button class="icon-button" @click="handleAccountClick">
              <img src="/svg/icono-header-cuenta.svg" alt="Account" />
              <span class="label">{{ isLoggedIn ? 'Mi Cuenta' : 'Iniciar Sesión' }}</span>
            </button>
            <button class="icon-button" @click="goFavorites">
              <img src="/svg/icono-header-favoritos.svg" alt="Favorites" />
              <span class="label">Favoritos</span>
            </button>
            <button class="icon-button cart-button" @click="carritoView">
              <img src="/svg/icono-header-carrito.svg" alt="Cart" />
              <span class="label">Carrito</span>
              <span class="cart-count" v-if="cartItemCount > 0">{{ cartItemCount }}</span>
            </button>
          </div>

          <!-- Botones para móvil (carrito y menú) -->
          <div class="mobile-header-actions">
            <button class="icon-button cart-button" @click="carritoView">
              <img src="/svg/icono-header-carrito.svg" alt="Cart" />
              <span class="cart-count cart-count-animated" v-if="cartItemCount > 0">{{ cartItemCount }}</span>
            </button>
            <div class="mobile-toggle" @click="toggleMobileMenu">
              <i :class="isMobileMenuOpen ? 'fas fa-times' : 'fas fa-bars'"></i>
            </div>
          </div>
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

        <!-- Barra de búsqueda móvil -->
      <!--   <div class="mobile-search" v-if="isMobileMenuOpen">
          <div class="search-bar">
            <input v-model="searchQuery" type="text" placeholder="Buscar productos, categorías y más..."
              @keyup.enter="performSearch" />
            <button class="search-button" @click="performSearch">
              <i class="fas fa-search"></i>
            </button>
          </div>
        </div> -->

        <button class="catalog-button" @click="toggleSidebar">
          <i class="fas fa-th-large"></i>
          Ver Catálogo
        </button>
        <ul class="nav-links">
          <li v-for="item in navItems" :key="item.path">
            <router-link :to="item.path" :class="{ 'active': $route.path === item.path }" @click="closeMobileMenu">
              <i :class="item.icon"></i>
              <span class="link-text">{{ item.nombre }}</span>
            </router-link>
          </li>
        </ul>

        <!-- Selector de ubicación completamente rediseñado para móviles -->
        <div class="location-selector-container">
          <!-- Botón para abrir el selector de ubicación -->
          <button :class="[
            'location-button',
            currentDepartment === 'la-paz' ? 'location-button-naranja' : '',
            currentDepartment === 'cochabamba' ? 'location-button-azul' : '',
          ]" @click.stop="openLocationModal">
            <i class="fas fa-map-marker-alt location-icon"></i>
            <span class="current-location">{{ getDepartmentLabel(currentDepartment) }}</span>
            <i class="fas fa-chevron-down location-arrow"></i>
          </button>
        </div>

        <div class="mobile-user-actions" v-if="isMobileMenuOpen">
          <div class="mobile-user-actions-header">
            <h3>Mi cuenta</h3>
          </div>
          <button class="mobile-action-button" @click="handleAccountClick">
            <i class="fas fa-user"></i>
            <span>{{ isLoggedIn ? 'Mi Cuenta' : 'Iniciar Sesión' }}</span>
            <i class="fas fa-chevron-right action-arrow"></i>
          </button>
          <button class="mobile-action-button" @click="goFavorites">
            <i class="fas fa-heart"></i>
            <span>Favoritos</span>
            <i class="fas fa-chevron-right action-arrow"></i>
          </button>
          <button class="mobile-action-button" @click="carritoView">
            <i class="fas fa-shopping-cart"></i>
            <span>Carrito</span>
            <span class="mobile-cart-count" v-if="cartItemCount > 0">{{ cartItemCount }}</span>
            <i class="fas fa-chevron-right action-arrow"></i>
          </button>
        </div>
      </nav>
      <hr />
    </header>

    <!-- Barra de navegación móvil fija en la parte inferior -->
    <div class="mobile-nav-bar">
      <button class="mobile-nav-item" @click="goHome">
        <i class="fas fa-home"></i>
        <span>Inicio</span>
      </button>
      <button class="mobile-nav-item" @click="toggleSidebar">
        <i class="fas fa-th-large"></i>
        <span>Catálogo</span>
      </button>
      <button class="mobile-nav-item" @click="handleAccountClick">
        <i class="fas fa-user"></i>
        <span>Cuenta</span>
      </button>
      <button class="mobile-nav-item cart-button" @click="carritoView">
        <i class="fas fa-shopping-cart"></i>
        <span>Carrito</span>
        <span class="mobile-nav-count" v-if="cartItemCount > 0">{{ cartItemCount }}</span>
      </button>
    </div>

    <div :class="['sidebar', { 'open': isSidebarOpen }]">
      <div class="sidebar-header">
        <h2>Catálogos</h2>
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
                <a href="#" @click.prevent="viewCatalogoActivo(catalogo.id, catalogo.nombre)">
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
                <a href="#" @click.prevent="viewCatalogoHistorial(catalogo.id, catalogo.nombre)">
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

    <!-- Modal para selección de ubicación (enfoque móvil) -->
    <div v-if="showLocationModal" class="location-modal-overlay" @click="closeLocationModal">
      <div class="location-modal" @click.stop>
        <div class="location-modal-header">
          <h3>Selecciona tu ubicación</h3>
          <button class="close-modal" @click="closeLocationModal">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="location-modal-body">
          <div v-for="dept in departments" :key="dept.value" class="location-modal-option"
            :class="{ 'active': currentDepartment === dept.value }" @click="selectDepartmentAndClose(dept.value)">
            <i></i>
            <span>{{ dept.label }}</span>
            <i class="fas fa-check" v-if="currentDepartment === dept.value"></i>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showLoginMessage" class="login-message">
      <div class="message-content">
        <i class="fas fa-exclamation-circle"></i>
        <span>Debes iniciar sesión para acceder a Favoritos</span>
        <button @click="showLoginMessage = false" class="close-button">
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>

    <!-- Notificación de producto agregado al carrito -->
    <div v-if="showCartNotification" class="cart-notification">
      <div class="cart-notification-content">
        <i class="fas fa-check-circle"></i>
        <span>Producto agregado al carrito</span>
      </div>
    </div>
  </ThemePageWrapper>
</template>

<script setup>
import { ref, computed, onMounted, watch, onUnmounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { useCartStore } from '@/stores/cart';
import { updateDeparatamento } from '@/Services/UsuarioService';
import { idCatalogoHistorial } from '@/Services/CatalogoHistorialesService';
import { indexCatalogosactives } from '@/Services/CatalogoService';
import { useUserStore } from '@/stores/userAuht';
import { useThemeStore } from '@/stores/themeStore';
import { useThemeStoreDark } from '@/stores/themeDarkStore';
import ThemePageWrapper from '@/components/ThemePageWrapper.vue';
import { searchProductoCategoriaCatalogo } from '@/Services/SearchService';
import GlobalSearch from '../GlobalSearch.vue';
import { generarSlug } from '@/Utils/string-utils';
const router = useRouter();
const cartStore = useCartStore();
const searchQuery = ref('');
const isSidebarOpen = ref(false);
const cartItemCount = computed(() => cartStore.uniqueItemCount);
const isLoggedIn = ref(false);
const isMobileMenuOpen = ref(false);
const catalogosAnteriores = ref([]);
const catalogosActivos = ref([]);
const themeStore = useThemeStore();
const themeStoreDark = useThemeStoreDark();
const showCartNotification = ref(false);
const lastCartCount = ref(0);
// Variable para controlar la visibilidad del modal de ubicación
const showLocationModal = ref(false);

// Departamentos con iconos
const departments = [
  { value: 'la-paz', label: 'La Paz', icon: 'fa-mountain' },
  { value: 'cochabamba', label: 'Cochabamba', icon: 'fa-tree' },
  { value: 'santa-cruz', label: 'Santa Cruz', icon: 'fa-sun' },
  { value: 'tarija', label: 'Tarija', icon: 'fa-wine-glass' },
  { value: 'potosi', label: 'Potosí', icon: 'fa-coins' },
  { value: 'oruro', label: 'Oruro', icon: 'fa-mask' },
  { value: 'beni', label: 'Beni', icon: 'fa-water' },
  { value: 'pando', label: 'Pando', icon: 'fa-leaf' },
  { value: 'chuquisaca', label: 'Chuquisaca', icon: 'fa-landmark' },
  { value: 'el-beni', label: 'El Beni', icon: 'fa-water' }
];

const userStore = useUserStore();

// Nuevas variables para la búsqueda mejorada
const searchFocused = ref(false);
const recentSearches = ref([]);
const popularSearches = ref(['Laptops', 'Smartphones', 'Tablets', 'Accesorios', 'Monitores', 'Teclados']);
const selectedSuggestionIndex = ref(-1);
// Añadir una variable para el estado de carga
const isSearchLoading = ref(false);
const searchResults = ref(null);
// Cargar búsquedas recientes desde localStorage
const loadRecentSearches = () => {
  const saved = localStorage.getItem('recentSearches');
  if (saved) {
    try {
      recentSearches.value = JSON.parse(saved).slice(0, 5); // Limitar a 5 búsquedas recientes
    } catch (e) {
      console.error('Error loading recent searches:', e);
      recentSearches.value = [];
    }
  }
};

// Guardar búsqueda reciente
const saveRecentSearch = (query) => {
  if (!query || query.trim() === '') return;

  // Eliminar duplicados y añadir al principio
  const updatedSearches = [query, ...recentSearches.value.filter(s => s !== query)].slice(0, 5);
  recentSearches.value = updatedSearches;

  // Guardar en localStorage
  localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
};

// Filtrar sugerencias basadas en la consulta actual
const filteredSuggestions = computed(() => {
  if (!searchQuery.value) return [...recentSearches.value, ...popularSearches.value];

  const query = searchQuery.value.toLowerCase();
  const allSuggestions = [...recentSearches.value, ...popularSearches.value];

  // Eliminar duplicados
  const uniqueSuggestions = [...new Set(allSuggestions)];

  return uniqueSuggestions.filter(s => s.toLowerCase().includes(query));
});

// Seleccionar sugerencia
const selectSuggestion = (suggestion) => {
  searchQuery.value = suggestion;
  performSearch();
};

// Navegación por teclado en sugerencias
const handleKeyNavigation = (e) => {
  if (!searchFocused.value || filteredSuggestions.value.length === 0) return;

  if (e.key === 'ArrowDown') {
    e.preventDefault();
    selectedSuggestionIndex.value = (selectedSuggestionIndex.value + 1) % filteredSuggestions.value.length;
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    selectedSuggestionIndex.value = selectedSuggestionIndex.value <= 0 ?
      filteredSuggestions.value.length - 1 : selectedSuggestionIndex.value - 1;
  } else if (e.key === 'Enter' && selectedSuggestionIndex.value >= 0) {
    e.preventDefault();
    selectSuggestion(filteredSuggestions.value[selectedSuggestionIndex.value]);
  }
};

const getInitialLocation = () => {
  return localStorage.getItem('departamento') || userStore.user.departamento || 'cochabamba';
};

// Mantener solo esta implementación con el store
const currentDepartment = computed({
  get: () => themeStore.currentDepartment,
  set: (value) => themeStore.setDepartment(value),
});

// Obtener el nombre del departamento actual
const getDepartmentLabel = (value) => {
  const dept = departments.find(d => d.value === value);
  return dept ? dept.label : 'Seleccionar ubicación';
};

// Abrir el modal de ubicación
const openLocationModal = () => {
  showLocationModal.value = true;
  document.body.style.overflow = 'hidden'; // Prevenir scroll
};

// Cerrar el modal de ubicación
const closeLocationModal = () => {
  showLocationModal.value = false;
  document.body.style.overflow = ''; // Restaurar scroll
};

// Seleccionar departamento y cerrar modal
const selectDepartmentAndClose = (value) => {
  currentDepartment.value = value;
  updateDepartment();
  closeLocationModal();
};

const updateDepartment = async () => {
  try {
    if (userStore.isAuthenticated) {
      const { data } = await updateDeparatamento({ departamento: currentDepartment.value });
      userStore.user.departamento = currentDepartment.value;
    }
    themeStore.setDepartment(currentDepartment.value);
    localStorage.setItem('departamento', currentDepartment.value);
  } catch (error) {
    console.error('Error updating department:', error);
  }
};

const navItems = [
  { nombre: 'Inicio', path: '/', icon: 'fas fa-home' },
  { nombre: 'Productos', path: '/productos', icon: 'fas fa-box-open' },
  { nombre: 'Categorías', path: '/categorias', icon: 'fas fa-th-list' },
  { nombre: 'Nosotros', path: '/nosotros', icon: 'fas fa-info-circle' },
  { nombre: 'Contacto', path: '/contacto', icon: 'fas fa-envelope' },
];

// Función para listar catálogos históricos
const listarCatalogosHistoriales = async () => {
  try {
    const { data } = await idCatalogoHistorial(); // Realiza la petición a la API
    catalogosAnteriores.value = data.datos;
  } catch (error) {
    console.log(error);
  }
};

const listarCatalogosActivos = async () => {
  try {
    const { data } = await indexCatalogosactives();
    catalogosActivos.value = data.datos;
  } catch (error) {
    console.log(error);
  }
};

const viewCatalogoHistorial = (idCatalogoHistorial, idCatalogoHistorialName) => {
  const slug = generarSlug(idCatalogoHistorialName);
  router.push({ path: `/catalogo-historial/${idCatalogoHistorial}/${slug}` });
  toggleSidebar();
};

const viewCatalogoActivo = (idCatalogo, nameCategoria) => {
  const slug = generarSlug(nameCategoria);
  router.push({ path: `/catalogo-activo/${idCatalogo}/${slug}` });
  toggleSidebar();
};

const viewCategoria = (idCategoria) => {
  router.push({ path: `/categoria/${idCategoria}` });
  toggleSidebar();
};

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
  isSidebarOpen.value = false; // Cerrar sidebar al abrir el menú móvil
  showLocationModal.value = false; // Cerrar modal de ubicación
};

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false;
};

const performSearch = async () => {
  if (searchQuery.value.trim()) {
    saveRecentSearch(searchQuery.value.trim());

    try {
      // Mostrar estado de carga
      isSearchLoading.value = true;
      // Llamar a la API de búsqueda
      const response = await searchProductoCategoriaCatalogo(searchQuery.value.trim());
      // Verificar si la respuesta tiene la estructura esperada
      if (response && response.data) {
        // Guardar los resultados
        searchResults.value = response.data.results;

        // Navegar a la página de resultados con la consulta y resultados
        router.push({
          path: '/search',
          query: { q: searchQuery.value },
          state: { searchResults: response.data.results }
        });

        // Resetear la consulta de búsqueda
        searchQuery.value = '';
        closeMobileMenu();
        searchFocused.value = false;
      } else {
        console.error('La respuesta no tiene el formato esperado:', response);
      }
    } catch (error) {
      console.error('Error al realizar la búsqueda:', error);
      if (error.response) {
        console.error('Datos del error:', error.response.data);
        console.error('Estado del error:', error.response.status);
      }
    } finally {
      // Ocultar estado de carga
      isSearchLoading.value = false;
    }
  }
};
const handleAccountClick = () => {
  router.push({ path: isLoggedIn.value ? '/perfil' : '/login' });
  closeMobileMenu();
};

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
  isMobileMenuOpen.value = false; // Cerrar menú móvil al abrir sidebar
  showLocationModal.value = false; // Cerrar modal de ubicación
};

const closeAllMenus = () => {
  isSidebarOpen.value = false;
  isMobileMenuOpen.value = false;
  showLocationModal.value = false;
};

const carritoView = () => {
  router.push({ path: '/checkout' });
  closeMobileMenu();
};

const goHome = () => {
  router.push('/');
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

// Observar cambios en el carrito para mostrar notificación
watch(cartItemCount, (newCount, oldCount) => {
  if (newCount > oldCount && oldCount !== 0) {
    showCartNotification.value = true;
    setTimeout(() => {
      showCartNotification.value = false;
    }, 3000);
  }
  lastCartCount.value = newCount;
});

onMounted(() => {
  const token = localStorage.getItem('token');
  isLoggedIn.value = !!token;
  listarCatalogosHistoriales();
  listarCatalogosActivos();
  loadRecentSearches();
  lastCartCount.value = cartItemCount.value;

  // Agregar event listener para navegación por teclado
  window.addEventListener('keydown', handleKeyNavigation);

  // Siempre iniciar con el tema claro, independientemente de lo guardado en localStorage
  themeStoreDark.setDarkMode(false);

  // Inicializar el departamento desde localStorage o store
  nextTick(() => {
    const initialDept = getInitialLocation();
    if (initialDept) {
      currentDepartment.value = initialDept;
    }
  });

  // Cerrar el modal de ubicación al presionar Escape
  const handleEscKey = (e) => {
    if (e.key === 'Escape' && showLocationModal.value) {
      closeLocationModal();
    }
  };

  window.addEventListener('keydown', handleEscKey);

  // Limpiar al desmontar
  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyNavigation);
    window.removeEventListener('keydown', handleEscKey);
  });
});

watch([isSidebarOpen, isMobileMenuOpen, showLocationModal], () => {
  document.body.style.overflow = isSidebarOpen.value || isMobileMenuOpen.value || showLocationModal.value ? 'hidden' : 'auto';
});

const activeSections = ref({
  activos: true,
  anteriores: true,
});

const toggleSection = (section) => {
  activeSections.value[section] = !activeSections.value[section];
};
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
  padding-bottom: 60px;
  /* Espacio para la barra de navegación móvil */
}

.header {
  top: 0;
  z-index: 1000;
  width: 100%;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  background-color: var(--background-color);
  color: var(--text-color);
}

hr {
  background-color: #e5e7eb;
  border: none;
  height: 1px;
  margin: 0;
}

/* Top Bar */
.top-bar {
  background-color: var(--surface-color);
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
  color: var(--text-muted);
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
  position: relative;
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

/* Header Actions Container */
.header-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  grid-column: 3;
}

.mobile-header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-actions {
  display: none;
}

/* Mobile Toggle Button */
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
  color: var(--text-color);
}

/* Modificación para solucionar el problema del buscador */
.search-container {
  grid-column: 1 / -1;
  grid-row: 2;
  width: 100%;
  margin-top: 12px;
  display: flex;
  justify-content: center;
  position: relative; /* Añadido para establecer un contexto de apilamiento */
  z-index: 1010; /* Valor mayor que la navegación principal (1000) */
}
.search-bar {
  position: relative;
  width: 100%;
  max-width: 600px;
}

.search-bar input {
  width: 100%;
  padding: 12px 40px 12px 16px;
  border: 1px solid var(--input-border);
  border-radius: 8px;
  font-size: 14px;
  font-weight: 400;
  background-color: var(--background-color);
  transition: all 0.3s ease;
}

.search-bar input:focus {
  outline: none;
  border-color: var(--border-color);
  box-shadow: 0 0 0 3px var(--shadow-color);
  background-color: var(--background-color);
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

/* Sugerencias de búsqueda */
.search-suggestions {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0 0 8px 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 1500;
  /* Aumentado para estar por encima del menú de navegación */
  max-height: 300px;
  overflow-y: auto;
  margin-top: 4px;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.suggestion-item {
  padding: 12px 16px;
  cursor: pointer;
  transition: background 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.suggestion-item:hover,
.suggestion-item.active {
  background: #f3f4f6;
}

.no-suggestions {
  padding: 12px 16px;
  color: #6b7280;
  text-align: center;
  font-style: italic;
}

/* Barra de búsqueda móvil */
.mobile-search {
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
}

.mobile-search .search-bar {
  width: 100%;
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
  color: var(--text-color);
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
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: bold;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.cart-count-animated {
  animation: pulse 1s ease-in-out;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.3);
  }

  100% {
    transform: scale(1);
  }
}

/* Main Navigation */
.main-nav {
  display: none;
  padding: 12px 16px;
  max-width: 1500px;
  margin: 0 auto;
  background: #fff;
  background-color: var(--background-color);
  position: sticky;
  top: 0;
  z-index: 999;
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
  background: var(--primary-color);
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
  background: var(--primary-hover-color);
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
  color: var(--text-color);
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
  color: var(--primary-color);
}

.nav-links a:hover i,
.nav-links a.active i {
  color: var(--primary-color);
}

/* Selector de ubicación rediseñado */
.location-selector-container {
  margin: 16px;
  width: calc(100% - 32px);
  /* Full width minus margins on mobile */
}

@media (min-width: 768px) {
  .location-selector-container {
    margin: 0;
    width: auto;
    max-width: 200px;
    /* Reduced width on desktop */
  }
}

.location-button {
  display: flex;
  align-items: center;
  gap: 8px;
  /* Reduced gap */
  padding: 10px 12px;
  /* Reduced padding */
  width: 100%;
  border: none;
  border-radius: 8px;
  background: var(--primary-color);
  color: white;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.current-location {
  flex: 1;
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  /* Add ellipsis for long text */
}

.location-arrow {
  font-size: 12px;
}

/* Modal de ubicación */
.location-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  animation: fadeIn 0.3s ease;
}

.location-modal {
  width: 90%;
  max-width: 350px;
  max-height: 90vh;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  animation: slideUp 0.3s ease;
}

.location-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.location-modal-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.close-modal {
  background: none;
  border: none;
  font-size: 20px;
  color: #6b7280;
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 0.2s ease;
}

.close-modal:hover {
  background: #f3f4f6;
  color: #111827;
}

.location-modal-body {
  padding: 8px;
  max-height: 70vh;
  overflow-y: auto;
}

.location-modal-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  cursor: pointer;
  border-radius: 8px;
  transition: background 0.2s ease;
}

.location-modal-option:hover {
  background: #f3f4f6;
}

.location-modal-option.active {
  background: #f0f9ff;
  color: #3b82f6;
  font-weight: 500;
}

.location-modal-option i:first-child {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.location-modal-option i.fa-check {
  margin-left: auto;
  color: #3b82f6;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.mobile-user-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
  margin-top: 16px;
  border-top: 1px solid #e5e7eb;
}

.mobile-user-actions-header {
  margin-bottom: 8px;
}

.mobile-user-actions-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: #374151;
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

.mobile-action-button i:first-child {
  font-size: 20px;
  color: var(--primary-color);
}

.action-arrow {
  margin-left: auto;
  font-size: 14px;
  color: #9ca3af;
}

.mobile-cart-count {
  background-color: var(--primary-color);
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
  margin-right: 8px;
}

/* Barra de navegación móvil fija */
.mobile-nav-bar {
  display: flex;
  justify-content: space-around;
  align-items: center;
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 60px;
  background: white;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  z-index: 998;
}

.mobile-nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  flex: 1;
  height: 100%;
  background: none;
  border: none;
  cursor: pointer;
  color: #6b7280;
  font-size: 10px;
  transition: color 0.2s ease;
  position: relative;
}

.mobile-nav-item i {
  font-size: 18px;
}

.mobile-nav-item:hover,
.mobile-nav-item:active {
  color: var(--primary-color);
}

.mobile-nav-count {
  position: absolute;
  top: 2px;
  right: calc(50% - 18px);
  background-color: var(--primary-color);
  color: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: bold;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
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
  bottom: 70px;
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

/* Notificación de carrito */
.cart-notification {
  position: fixed;
  bottom: 70px;
  left: 50%;
  transform: translateX(-50%);
  background: #10b981;
  color: #fff;
  padding: 12px 20px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 2000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: slideUp 0.3s ease;
}

.cart-notification-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.cart-notification-content i {
  font-size: 18px;
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

  .search-container {
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
    grid-template-columns: auto 1fr auto;
    padding: 16px 24px;
    gap: 16px;
  }

/* Asegurar que en tablets y escritorio mantenga su posición correcta */
@media (min-width: 640px) {
  .search-container {
    grid-column: 2;
    grid-row: 1;
    margin-top: 0;
    justify-self: center;
  }
}

  .logo img {
    height: 42px;
  }

  .mobile-header-actions {
    display: flex;
  }

  body {
    padding-bottom: 0;
    /* Eliminar espacio para la barra de navegación móvil */
  }

  .mobile-nav-bar {
    display: none;
    /* Ocultar barra de navegación móvil en tablets */
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

  .mobile-header-actions {
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

  .mobile-search {
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

  .location-selector-container {
    margin: 0;
    width: auto;
    max-width: 200px;
    /* Reduced width on desktop */
  }

  .location-button {
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

  .location-button {
    padding: 10px 16px;
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

  .search-container {
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
</style>

He solucionado el problema de las sugerencias de búsqueda que estaban siendo tapadas por el menú de navegación. La
solución principal fue aumentar el z-index de las sugerencias de búsqueda para asegurar que aparezcan por encima de
todos los demás elementos:

```css
.search-suggestions {
/* ... otras propiedades ... */
z-index: 1500; /* Aumentado para estar por encima del menú de navegación */
/* ... otras propiedades ... */
}