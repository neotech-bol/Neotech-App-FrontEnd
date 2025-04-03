<template>
  <Teleport to="body">
    <div class="global-search-portal" v-show="!isSidebarOpen && !isMenuOpen">
      <div class="global-search">
        <div class="search-container" :class="{ 'active': isSearchActive }">
          <div class="search-input-wrapper">
            <input
              type="text"
              v-model="searchQuery"
              @input="handleInput"
              @focus="handleFocus"
              @keyup.enter="performSearch"
              @keydown.down.prevent="navigateResults('down')"
              @keydown.up.prevent="navigateResults('up')"
              @keydown.esc="clearSearch"
              placeholder="Buscar productos, categorías, catálogos..."
              class="search-input"
              ref="searchInput"
            />
            <button 
              v-if="searchQuery" 
              @click="clearSearch" 
              class="clear-button" 
              aria-label="Limpiar búsqueda"
              type="button"
            >
              <i class="fas fa-times"></i>
            </button>
            <button 
              @click="performSearch" 
              class="search-button" 
              :disabled="isLoading"
              aria-label="Buscar"
              type="button"
            >
              <i class="fas" :class="isLoading ? 'fa-spinner fa-spin' : 'fa-search'"></i>
            </button>
          </div>

          <!-- Resultados de búsqueda (solo se muestran cuando está activo) -->
          <div v-if="showResults" class="search-results-wrapper">
            <div class="search-results">
              <!-- Indicador de carga -->
              <div v-if="isLoading" class="loading-indicator">
                <div class="spinner"></div>
                <span>Buscando...</span>
              </div>

              <!-- Resultados -->
              <template v-else>
                <!-- Productos -->
                <div v-if="resultadosProductos.length > 0" class="result-section">
                  <h3 class="section-title">
                    <i class="fas fa-box"></i> Productos
                  </h3>
                  <ul class="result-list">
                    <li 
                      v-for="(producto, index) in resultadosProductos" 
                      :key="`producto-${producto.id}`"
                      :class="['result-item', { 'selected': selectedIndex === getGlobalIndex('productos', index) }]"
                      @click="navigateToResult('producto', producto.id)"
                      @mouseover="selectedIndex = getGlobalIndex('productos', index)"
                    >
                      <div class="result-icon">
                        <i class="fas fa-box"></i>
                      </div>
                      <div class="result-content">
                        <span class="result-name">{{ producto.nombre }}</span>
                      </div>
                    </li>
                  </ul>
                </div>

                <!-- Categorías -->
                <div v-if="resultadosCategorias.length > 0" class="result-section">
                  <h3 class="section-title">
                    <i class="fas fa-tag"></i> Categorías
                  </h3>
                  <ul class="result-list">
                    <li 
                      v-for="(categoria, index) in resultadosCategorias" 
                      :key="`categoria-${categoria.id}`"
                      :class="['result-item', { 'selected': selectedIndex === getGlobalIndex('categorias', index) }]"
                      @click="navigateToResult('categoria', categoria.id)"
                      @mouseover="selectedIndex = getGlobalIndex('categorias', index)"
                    >
                      <div class="result-icon">
                        <i class="fas fa-tag"></i>
                      </div>
                      <div class="result-content">
                        <span class="result-name">{{ categoria.nombre }}</span>
                      </div>
                    </li>
                  </ul>
                </div>

                <!-- Catálogos -->
                <div v-if="resultadosCatalogos.length > 0" class="result-section">
                  <h3 class="section-title">
                    <i class="fas fa-book"></i> Catálogos
                  </h3>
                  <ul class="result-list">
                    <li 
                      v-for="(catalogo, index) in resultadosCatalogos" 
                      :key="`catalogo-${catalogo.id}`"
                      :class="['result-item', { 'selected': selectedIndex === getGlobalIndex('catalogos', index) }]"
                      @click="navigateToResult('catalogo', catalogo.id)"
                      @mouseover="selectedIndex = getGlobalIndex('catalogos', index)"
                    >
                      <div class="result-icon">
                        <i class="fas fa-book"></i>
                      </div>
                      <div class="result-content">
                        <span class="result-name">{{ catalogo.nombre }}</span>
                      </div>
                    </li>
                  </ul>
                </div>

                <!-- Sugerencias -->
                <div v-if="sugerencias.length > 0 && searchResults.length === 0" class="result-section">
                  <h3 class="section-title">
                    <i class="fas fa-lightbulb"></i> Sugerencias
                  </h3>
                  <ul class="result-list">
                    <li 
                      v-for="(sugerencia, index) in sugerencias" 
                      :key="`sugerencia-${index}`"
                      :class="['result-item', { 'selected': selectedIndex === getGlobalIndex('sugerencias', index) }]"
                      @click="applySearchSuggestion(sugerencia)"
                      @mouseover="selectedIndex = getGlobalIndex('sugerencias', index)"
                    >
                      <div class="result-icon">
                        <i class="fas fa-search"></i>
                      </div>
                      <div class="result-content">
                        <span class="result-name">{{ sugerencia }}</span>
                      </div>
                    </li>
                  </ul>
                </div>

                <!-- Sin resultados -->
                <div v-if="searchResults.length === 0 && sugerencias.length === 0 && searchQuery.length >= 2" class="no-results">
                  <i class="fas fa-search"></i>
                  <p>No se encontraron resultados para "<strong>{{ searchQuery }}</strong>"</p>
                  <p class="no-results-tip">Intenta con otras palabras o términos más generales</p>
                </div>
              </template>

              <!-- Footer de resultados -->
              <div v-if="searchResults.length > 0" class="results-footer">
                <span class="results-count">{{ totalResults }} resultados encontrados</span>
                <button @click="showAllResults" class="show-all-button" type="button">
                  Ver todos los resultados <i class="fas fa-arrow-right"></i>
                </button>
              </div>
            </div>
            
            <!-- Overlay para cerrar los resultados al hacer clic fuera -->
            <div class="search-overlay" @click="clearSearch"></div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
  
  <!-- Elemento placeholder para mantener el espacio en el layout original -->
  <div class="search-placeholder"></div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { searchProductoCategoriaCatalogo } from '@/Services/SearchService';

const router = useRouter();
const searchQuery = ref('');
const isSearchActive = ref(false);
const isLoading = ref(false);
const searchResults = ref([]);
const sugerencias = ref([]);
const selectedIndex = ref(-1);
const searchInput = ref(null);
const debounceTime = 300; // ms
let debounceTimeout = null;
const isSidebarOpen = ref(false);
const isMenuOpen = ref(false);
const searchPosition = ref({ top: 0, left: 0, width: 0 });

// Computed para controlar cuándo mostrar los resultados
const showResults = computed(() => {
  return isSearchActive.value && 
         (searchResults.value.length > 0 || sugerencias.value.length > 0 || isLoading.value || searchQuery.value.length >= 2);
});

// Función debounce personalizada
const debounce = (func, wait) => {
  return function(...args) {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
      func.apply(this, args);
    }, wait);
  };
};

// Resultados por tipo
const resultadosProductos = computed(() => {
  return searchResults.value.filter(item => item.type === 'productos');
});

const resultadosCategorias = computed(() => {
  return searchResults.value.filter(item => item.type === 'categorias');
});

const resultadosCatalogos = computed(() => {
  return searchResults.value.filter(item => item.type === 'catalogos');
});

const totalResults = computed(() => {
  return searchResults.value.length;
});

// Obtener el índice global para la navegación con teclado
const getGlobalIndex = (type, localIndex) => {
  let globalIndex = localIndex;
  
  if (type === 'categorias') {
    globalIndex += resultadosProductos.value.length;
  } else if (type === 'catalogos') {
    globalIndex += resultadosProductos.value.length + resultadosCategorias.value.length;
  } else if (type === 'sugerencias') {
    globalIndex += resultadosProductos.value.length + resultadosCategorias.value.length + resultadosCatalogos.value.length;
  }
  
  return globalIndex;
};

// Función para realizar la búsqueda
const performSearch = async () => {
  if (!searchQuery.value || searchQuery.value.length < 2) return;
  
  isLoading.value = true;
  searchResults.value = [];
  sugerencias.value = [];
  
  try {
    // Usar el servicio de búsqueda existente
    const response = await searchProductoCategoriaCatalogo(searchQuery.value.trim());
    
    if (response && response.data) {
      const data = response.data;
      
      // Procesar resultados
      if (data.results) {
        // Productos
        if (data.results.productos) {
          data.results.productos.forEach(producto => {
            searchResults.value.push({
              id: producto.id,
              nombre: producto.nombre,
              type: 'productos'
            });
          });
        }
        
        // Categorías
        if (data.results.categorias) {
          data.results.categorias.forEach(categoria => {
            searchResults.value.push({
              id: categoria.id,
              nombre: categoria.nombre,
              type: 'categorias'
            });
          });
        }
        
        // Catálogos
        if (data.results.catalogos) {
          data.results.catalogos.forEach(catalogo => {
            searchResults.value.push({
              id: catalogo.id,
              nombre: catalogo.nombre,
              type: 'catalogos'
            });
          });
        }
      }
      
      // Procesar sugerencias
      if (data.sugerencias) {
        sugerencias.value = data.sugerencias;
      }
      
      // Guardar búsqueda reciente
      saveRecentSearch(searchQuery.value.trim());
    }
  } catch (error) {
    console.error('Error al realizar la búsqueda:', error);
  } finally {
    isLoading.value = false;
  }
};

// Crear una versión con debounce de la función de búsqueda
const debouncedSearch = debounce(performSearch, debounceTime);

// Manejar cambios en el input
const handleInput = () => {
  if (searchQuery.value.length >= 2) {
    debouncedSearch();
  } else {
    searchResults.value = [];
    sugerencias.value = [];
  }
};

// Manejar el focus del input
const handleFocus = () => {
  isSearchActive.value = true;
  checkNavigationStatus();
  updateSearchPosition();
};

// Limpiar la búsqueda
const clearSearch = () => {
  searchQuery.value = '';
  searchResults.value = [];
  sugerencias.value = [];
  selectedIndex.value = -1;
  isSearchActive.value = false;
};

// Navegar a un resultado
const navigateToResult = (type, id) => {
  isSearchActive.value = false;
  
  // Definir las rutas según el tipo de resultado
  const routes = {
    producto: `/producto/${id}`,
    categoria: `/categoria/${id}`,
    catalogo: `/catalogo-activo/${id}`
  };
  
  if (routes[type]) {
    router.push(routes[type]);
  }
};

// Aplicar una sugerencia de búsqueda
const applySearchSuggestion = (suggestion) => {
  searchQuery.value = suggestion;
  performSearch();
};

// Navegar por los resultados con teclado
const navigateResults = (direction) => {
  const totalItems = searchResults.value.length + sugerencias.value.length;
  
  if (totalItems === 0) return;
  
  if (direction === 'down') {
    selectedIndex.value = (selectedIndex.value + 1) % totalItems;
  } else if (direction === 'up') {
    selectedIndex.value = (selectedIndex.value - 1 + totalItems) % totalItems;
  }
  
  // Seleccionar el elemento actual al presionar Enter
  if (selectedIndex.value !== -1) {
    const item = getSelectedItem();
    if (item) {
      if (item.type === 'sugerencia') {
        applySearchSuggestion(item.nombre);
      } else {
        navigateToResult(item.type.slice(0, -1), item.id); // Quitar la 's' final (productos -> producto)
      }
    }
  }
};

// Obtener el elemento seleccionado actualmente
const getSelectedItem = () => {
  if (selectedIndex.value < 0) return null;
  
  const allItems = [
    ...resultadosProductos.value.map(item => ({ ...item })),
    ...resultadosCategorias.value.map(item => ({ ...item })),
    ...resultadosCatalogos.value.map(item => ({ ...item })),
    ...sugerencias.value.map((sugerencia, index) => ({
      id: index,
      nombre: sugerencia,
      type: 'sugerencia'
    }))
  ];
  
  return allItems[selectedIndex.value] || null;
};

// Ver todos los resultados
const showAllResults = () => {
  router.push({
    path: '/search',
    query: { q: searchQuery.value }
  });
  isSearchActive.value = false;
};

// Búsquedas recientes
const recentSearches = ref([]);

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

// Cerrar la búsqueda al presionar Escape
const handleEscKey = (event) => {
  if (event.key === 'Escape' && isSearchActive.value) {
    clearSearch();
  }
};

// Verificar el estado de la navegación (sidebar y menú móvil)
const checkNavigationStatus = () => {
  // Verificar sidebar
  const sidebarElement = document.querySelector('.sidebar');
  if (sidebarElement) {
    isSidebarOpen.value = sidebarElement.classList.contains('open');
  }
  
  // Verificar menú móvil
  const mobileMenuElement = document.querySelector('.main-nav.mobile-nav-open');
  isMenuOpen.value = !!mobileMenuElement;
  
  // Si alguno está abierto, cerrar los resultados de búsqueda
  if ((isSidebarOpen.value || isMenuOpen.value) && isSearchActive.value) {
    isSearchActive.value = false;
  }
};

// Actualizar la posición del buscador para que coincida con el placeholder
const updateSearchPosition = () => {
  nextTick(() => {
    const placeholder = document.querySelector('.search-placeholder');
    if (placeholder) {
      const rect = placeholder.getBoundingClientRect();
      searchPosition.value = {
        top: rect.top + window.scrollY,
        left: rect.left,
        width: rect.width
      };
      
      // Aplicar posición al portal
      const portal = document.querySelector('.global-search-portal');
      if (portal) {
        portal.style.position = 'absolute';
        portal.style.top = `${searchPosition.value.top}px`;
        portal.style.left = `${searchPosition.value.left}px`;
        portal.style.width = `${searchPosition.value.width}px`;
      }
    }
  });
};

// Manejar clics en botones de catálogo
const handleCatalogButtonClick = (event) => {
  // Verificar si el clic fue en un botón de catálogo
  const target = event.target;
  const isCatalogButton = 
    target.classList.contains('catalog-button') || 
    target.closest('.catalog-button') || 
    (target.classList.contains('mobile-nav-item') && target.textContent.includes('Catálogo'));
  
  if (isCatalogButton) {
    // Cerrar la búsqueda
    clearSearch();
  }
};

// Lifecycle hooks
onMounted(() => {
  document.addEventListener('keydown', handleEscKey);
  document.addEventListener('click', handleCatalogButtonClick);
  window.addEventListener('resize', updateSearchPosition);
  loadRecentSearches();
  
  // Inicializar posición
  updateSearchPosition();
  
  // Observar cambios en el DOM para detectar cuando se abre/cierra el sidebar o menú
  const observer = new MutationObserver(() => {
    checkNavigationStatus();
    if (!isSidebarOpen.value && !isMenuOpen.value) {
      updateSearchPosition();
    }
  });
  
  // Observar cambios en el cuerpo del documento
  observer.observe(document.body, { 
    childList: true, 
    subtree: true,
    attributes: true,
    attributeFilter: ['class']
  });
  
  // Limpiar al desmontar
  onUnmounted(() => {
    document.removeEventListener('keydown', handleEscKey);
    document.removeEventListener('click', handleCatalogButtonClick);
    window.removeEventListener('resize', updateSearchPosition);
    clearTimeout(debounceTimeout);
    observer.disconnect();
  });
});

// Observar cambios en isSearchActive
watch(isSearchActive, (newValue) => {
  if (newValue) {
    // Verificar si el sidebar o menú está abierto
    checkNavigationStatus();
    
    // Enfocar el input cuando se activa la búsqueda
    nextTick(() => {
      if (searchInput.value) {
        searchInput.value.focus();
      }
    });
  }
});

// Observar cambios en el DOM para detectar cuando se abre/cierra el sidebar o menú
watch([isSidebarOpen, isMenuOpen], ([newSidebarOpen, newMenuOpen]) => {
  if (newSidebarOpen || newMenuOpen) {
    isSearchActive.value = false;
  } else {
    // Actualizar posición cuando se cierran
    updateSearchPosition();
  }
});
</script>

<style scoped>
/* Placeholder para mantener el espacio en el layout original */
.search-placeholder {
  width: 100%;
  height: 48px; /* Altura aproximada del input de búsqueda */
  max-width: 600px;
  margin: 0 auto;
}

.global-search-portal {
  z-index: 9999; /* Valor muy alto para estar por encima de todo */
}

.global-search {
  position: relative;
  width: 100%;
}

.search-container {
  position: relative;
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  transition: all 0.3s ease;
}

.search-container.active {
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
}

.search-input-wrapper {
  display: flex;
  align-items: center;
  background-color: var(--background-color, #fff);
  border: 1px solid var(--input-border, #e0e0e0);
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.search-container.active .search-input-wrapper {
  border-color: var(--primary-color, #007bff);
}

.search-input {
  flex: 1;
  padding: 12px 16px;
  border: none;
  outline: none;
  font-size: 16px;
  color: var(--text-color, #333);
  background: transparent;
}

.search-input::placeholder {
  color: var(--text-muted, #999);
}

.clear-button,
.search-button {
  background: none;
  border: none;
  padding: 0 16px;
  height: 100%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted, #666);
  transition: color 0.2s ease;
}

.clear-button:hover {
  color: #ff4444;
}

.search-button {
  background-color: var(--surface-color, #f5f5f5);
  border-left: 1px solid var(--input-border, #e0e0e0);
  padding: 12px 20px;
  color: var(--text-color, #333);
}

.search-button:hover {
  background-color: var(--primary-color, #007bff);
  color: white;
}

.search-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Resultados de búsqueda */
.search-results-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  z-index: 9999; /* Valor muy alto para estar por encima de todo */
}

.search-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.3);
}

.search-results {
  position: absolute;
  top: 48px; /* Altura del input */
  width: 100%;
  max-width: 600px;
  background-color: var(--background-color, #fff);
  border: 1px solid var(--input-border, #e0e0e0);
  border-radius: 0 0 8px 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  max-height: 70vh;
  overflow-y: auto;
  z-index: 1; /* Solo necesita ser mayor que el overlay */
}

.loading-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  color: var(--text-muted, #666);
  gap: 10px;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(0, 123, 255, 0.3);
  border-radius: 50%;
  border-top-color: var(--primary-color, #007bff);
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.result-section {
  padding: 10px 0;
  border-bottom: 1px solid var(--border-light, #f0f0f0);
}

.result-section:last-child {
  border-bottom: none;
}

.section-title {
  padding: 0 16px;
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-muted, #666);
  display: flex;
  align-items: center;
  gap: 8px;
}

.result-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.result-item {
  display: flex;
  align-items: center;
  padding: 10px 16px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.result-item:hover,
.result-item.selected {
  background-color: var(--hover-color, #f5f9ff);
}

.result-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--surface-color, #f0f4f8);
  border-radius: 6px;
  margin-right: 12px;
  color: var(--primary-color, #007bff);
}

.result-content {
  flex: 1;
}

.result-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-color, #333);
  display: block;
  margin-bottom: 2px;
}

.no-results {
  padding: 24px 16px;
  text-align: center;
  color: var(--text-muted, #666);
}

.no-results i {
  font-size: 24px;
  margin-bottom: 8px;
  color: var(--text-muted, #999);
}

.no-results p {
  margin: 8px 0;
}

.no-results-tip {
  font-size: 13px;
  color: var(--text-muted, #999);
}

.results-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background-color: var(--surface-color, #f9f9f9);
  border-top: 1px solid var(--border-light, #eee);
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
}

.results-count {
  font-size: 13px;
  color: var(--text-muted, #666);
}

.show-all-button {
  background: none;
  border: none;
  color: var(--primary-color, #007bff);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.show-all-button:hover {
  background-color: rgba(0, 123, 255, 0.1);
}

/* Responsive */
@media (max-width: 768px) {
  .search-container {
    max-width: 100%;
  }
  
  .search-input {
    font-size: 14px;
    padding: 10px 12px;
  }
  
  .search-button {
    padding: 10px 16px;
  }
  
  .search-results {
    max-height: 60vh;
    max-width: 90%;
  }
}

@media (max-width: 480px) {
  .result-item {
    padding: 8px 12px;
  }
  
  .result-icon {
    width: 28px;
    height: 28px;
    margin-right: 8px;
  }
  
  .section-title {
    font-size: 13px;
  }
  
  .result-name {
    font-size: 13px;
  }
  
  .results-footer {
    flex-direction: column;
    gap: 8px;
    align-items: flex-start;
  }
  
  .show-all-button {
    width: 100%;
    justify-content: center;
  }
}
</style>