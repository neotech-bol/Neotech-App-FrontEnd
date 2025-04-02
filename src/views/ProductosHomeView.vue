<template>
  <div class="catalog-container">
    <!-- Título Principal -->
    <h1 class="main-title">
      Explora Nuestros <span class="text-accent">Productos</span>
    </h1>

    <!-- Sección de Filtros - Mejorada para pantallas grandes -->
    <div class="filters-wrapper">
      <div class="filters">
        <!-- Controles de Filtro - Layout mejorado -->
        <div class="filter-controls">
          <select v-model="filtroCategoria" @change="listarProductos" class="filter-select">
            <option value="">Todas las categorías</option>
            <option :value="item.id" v-for="item in categorias" :key="item.id">{{ item.nombre }}</option>
          </select>
          
          <select v-model="filtroCatalogo" @change="listarProductos" class="filter-select">
            <option value="">Todos los catálogos</option>
            <option :value="item.id" v-for="item in catalogos" :key="item.id">{{ item.nombre }}</option>
          </select>
          
          <div class="search-container">
            <input 
              v-model="searchQuery" 
              @input="listarProductos" 
              placeholder="Buscar productos..." 
              class="search-input"
            >
            <span class="search-icon">
              <i class="fas fa-search"></i>
            </span>
          </div>
        </div>
        
        <!-- Filtros Activos y Botón de Reinicio -->
        <div v-if="hasActiveFilters" class="active-filters">
          <div class="active-filters-list">
            <span v-if="filtroCategoria" class="active-filter">
              Categoría
              <button @click="removeFilter('categoria')" class="remove-filter">
                <i class="fas fa-times"></i>
              </button>
            </span>
            <span v-if="filtroCatalogo" class="active-filter">
              Catálogo
              <button @click="removeFilter('catalogo')" class="remove-filter">
                <i class="fas fa-times"></i>
              </button>
            </span>
            <span v-if="searchQuery" class="active-filter">
              "{{ searchQuery }}"
              <button @click="removeFilter('search')" class="remove-filter">
                <i class="fas fa-times"></i>
              </button>
            </span>
          </div>
          <button @click="resetFilters" class="reset-all-button">
            <i class="fas fa-undo-alt"></i> Limpiar filtros
          </button>
        </div>
      </div>
    </div>

    <!-- Estado de Carga -->
    <div v-if="loading" class="loading-overlay">
      <div class="spinner"></div>
      <p>Cargando productos...</p>
    </div>

    <!-- Estado de Error -->
    <div v-else-if="error" class="error-message">
      <i class="fas fa-exclamation-circle error-icon"></i>
      <p>{{ error }}</p>
      <button @click="listarProductos()" class="retry-button">
        <i class="fas fa-sync-alt"></i> Reintentar
      </button>
    </div>

    <!-- Vista de Productos -->
    <div v-else class="main-catalog">
      <div class="products-grid">
        <div v-for="(product, productIndex) in productos" :key="product.id" class="product-card"
          :style="{ '--index': productIndex }" @click="viewProductDetails(product.id)">
          <div class="product-image-wrapper">
            <div class="product-image">
              <transition name="fade" mode="out-in">
                <img :key="currentImageIndex[product.id]" :src="getCurrentImage(product)" :alt="product.nombre"
                  loading="lazy">
              </transition>

              <button class="nav-button prev" @click.stop="prevImage(product)"
                v-if="getProductImages(product).length > 1" aria-label="Imagen anterior">
                <i class="fas fa-chevron-left"></i>
              </button>
              <button class="nav-button next" @click.stop="nextImage(product)"
                v-if="getProductImages(product).length > 1" aria-label="Imagen siguiente">
                <i class="fas fa-chevron-right"></i>
              </button>

              <!-- Insignias -->
              <div class="badges">
                <span v-if="product.badge" class="badge badge-new">
                  <i class="fas fa-star-of-life"></i> {{ product.badge }}
                </span>
                <span v-if="product.descuento" class="badge badge-sale">
                  <i class="fas fa-bolt"></i> -{{ product.descuento }}%
                </span>
                <span v-if="hasPreventaPrices(product)" class="badge badge-preventa">
                  <i class="fas fa-tag"></i> PREVENTA
                </span>
              </div>

              <div class="product-actions-bottom">
                <button class="action-button cart-btn" @click.stop="addToCart(product)" aria-label="Agregar al carrito"
                  :class="{ 'adding': addingToCart === product.id }">
                  <i class="fas" :class="addingToCart === product.id ? 'fa-spinner fa-spin' : 'fa-shopping-cart'"></i>
                </button>
                <button class="action-button view-btn" @click.stop="viewProductDetails(product.id)"
                  aria-label="Ver producto">
                  <i class="fas fa-eye"></i>
                </button>
                <button class="action-button fav-btn" @click.stop="favoriteUser(product.id)"
                  aria-label="Agregar a favoritos" :class="{ 'in-favorites': favoriteProducts.includes(product.id) }">
                  <i class="fas fa-heart"></i>
                </button>
              </div>
            </div>
          </div>

          <div class="product-info">
            <div class="category">
              <i class="fas fa-tag"></i> {{ product.categoria?.nombre || 'General' }}
            </div>
            <h3 class="product-name">{{ product.nombre }}</h3>
            
            <!-- Descripción truncada -->
         <!--    <p v-if="product.descripcion" class="product-description">
              {{ truncateDescription(product.descripcion, 60) }}
            </p>
             -->
            <!-- Contenedor de precios mejorado -->
            <div class="prices-container">
              <div class="prices-header">
                <span class="prices-title">Precios de Preventa</span>
                <button class="toggle-prices-btn" @click.stop="togglePriceDetails(product.id)">
                  <i class="fas" :class="isPriceExpanded(product.id) ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
                </button>
              </div>
              
              <div class="price-details" :class="{ 'expanded': isPriceExpanded(product.id) }">
                <!-- Precio Estándar (Preventa por Volumen) -->
                <div class="price-card">
                  <div class="price-card-header">
                    <span class="price-type">Preventa Especial</span>
                    <span class="price-value">{{ formatPrice(product.precio) }}</span>
                  </div>
                  <div class="price-card-body">
                    <div class="quantity-range">
                      <div class="quantity-item">
                        <span class="quantity-label">Mínimo:</span>
                        <span class="quantity-value">{{ product.cantidad_minima || 1 }} unidades</span>
                      </div>
                      <div class="quantity-item">
                        <span class="quantity-label">Máximo:</span>
                        <span class="quantity-value">{{ product.cantidad_maxima || 'Sin límite' }} unidades</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- Precio Preventa Especial -->
                <div class="price-card special" v-if="product.precio_preventa">
                  <div class="price-card-header">
                    <span class="price-type">Preventa Estándar</span>
                    <span class="price-value">{{ formatPrice(product.precio_preventa) }}</span>
                  </div>
                  <div class="price-card-body">
                    <div class="quantity-range">
                      <div class="quantity-item">
                        <span class="quantity-label">Mínimo:</span>
                        <span class="quantity-value">{{ product.cantidad_minima_preventa || product.cantidad_minima || 1 }} unidades</span>
                      </div>
                      <div class="quantity-item">
                        <span class="quantity-label">Máximo:</span>
                        <span class="quantity-value">{{ product.cantidad_maxima_preventa || product.cantidad_maxima || 'Sin límite' }} unidades</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Vista resumida de precios (siempre visible) -->
              <div class="prices-summary">
                <div class="summary-item">
                  <span class="summary-label">Especial:</span>
                  <div class="summary-content">
                    <span class="summary-price">{{ formatPrice(product.precio) }}</span>
                    <span class="summary-quantity">{{ product.cantidad_minima || 1 }}+ uds</span>
                  </div>
                </div>
                <div class="summary-item special" v-if="product.precio_preventa">
                  <span class="summary-label">Estándar:</span>
                  <div class="summary-content">
                    <span class="summary-price">{{ formatPrice(product.precio_preventa) }}</span>
                    <span class="summary-quantity">{{ product.cantidad_minima_preventa || product.cantidad_minima || 1 }}+ uds</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="productos.length === 0" class="no-products">
        <i class="fas fa-box-open no-products-icon"></i>
        <p>No se encontraron productos</p>
        <button @click="resetFilters" class="reset-filters-button">
          <i class="fas fa-undo"></i> Restablecer filtros
        </button>
      </div>
    </div>

    <!-- Paginación -->
    <div v-if="totalPages > 1" class="pagination">
      <button 
        v-if="currentPage > 1" 
        @click="changePage(currentPage - 1)" 
        class="page-button page-nav"
        aria-label="Página anterior"
      >
        <i class="fas fa-chevron-left"></i>
      </button>
      
      <button v-for="page in paginationRange" :key="page" @click="changePage(page)"
        :class="['page-button', { active: currentPage === page }]" :aria-label="`Ir a página ${page}`">
        {{ page }}
      </button>
      
      <button 
        v-if="currentPage < totalPages" 
        @click="changePage(currentPage + 1)" 
        class="page-button page-nav"
        aria-label="Página siguiente"
      >
        <i class="fas fa-chevron-right"></i>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { filtrosProductos } from '@/Services/ProductoService';
import { activesCategoriasTrue } from '@/Services/CategoriaService';
import { useCartStore } from '@/stores/cart';
import { useRouter } from 'vue-router';
import { storeFavorite } from '@/Services/FavoriteService';
import { indexCatalogosactives } from '@/Services/CatalogoService';
const router = useRouter();
const cartStore = useCartStore();

// Estados para el catálogo
const categorias = ref([]);
const catalogos = ref([]);
const productos = ref([]);
const loading = ref(true);
const error = ref(null);
const currentPage = ref(1);
const totalPages = ref(1);
const currentImageIndex = ref({});
const favoriteProducts = ref([]);
const addingToCart = ref(null);
const expandedPriceDetails = ref([]); // Para controlar los detalles de precios expandidos

// Estados para filtros
const filtroCategoria = ref('');
const filtroCatalogo = ref('');
const searchQuery = ref('');

// Propiedades computadas
const hasActiveFilters = computed(() => {
  return filtroCategoria.value || filtroCatalogo.value || searchQuery.value;
});

// Rango de paginación (mostrar máximo 5 páginas)
const paginationRange = computed(() => {
  const range = [];
  const maxVisiblePages = 5;
  
  if (totalPages.value <= maxVisiblePages) {
    // Si hay menos páginas que el máximo visible, mostrar todas
    for (let i = 1; i <= totalPages.value; i++) {
      range.push(i);
    }
  } else {
    // Calcular el rango de páginas a mostrar
    let start = Math.max(1, currentPage.value - Math.floor(maxVisiblePages / 2));
    let end = Math.min(totalPages.value, start + maxVisiblePages - 1);
    
    // Ajustar el inicio si estamos cerca del final
    if (end === totalPages.value) {
      start = Math.max(1, end - maxVisiblePages + 1);
    }
    
    for (let i = start; i <= end; i++) {
      range.push(i);
    }
  }
  
  return range;
});

// Verificar si un producto tiene precios de preventa
const hasPreventaPrices = (product) => {
  return product.precio_preventa || 
         product.precio_preventa_mayorista || 
         product.precio_preventa_distribuidor;
};

// Funciones para manejar los detalles de precios
const togglePriceDetails = (productId) => {
  const index = expandedPriceDetails.value.indexOf(productId);
  if (index > -1) {
    expandedPriceDetails.value.splice(index, 1);
  } else {
    expandedPriceDetails.value.push(productId);
  }
};

const isPriceExpanded = (productId) => {
  return expandedPriceDetails.value.includes(productId);
};

// Obtener productos filtrados
const listarProductos = async (page = 1) => {
  loading.value = true;
  error.value = null;
  try {
    const { data } = await filtrosProductos(filtroCategoria.value, filtroCatalogo.value, searchQuery.value, page);
    console.log(data);
    productos.value = data.datos.data || data.datos; // Manejar ambos formatos de respuesta
    
    // Manejar paginación si está disponible
    if (data.datos.last_page) {
      totalPages.value = data.datos.last_page;
      currentPage.value = page;
    } else {
      totalPages.value = 1;
      currentPage.value = 1;
    }
    
    // Inicializar índices de imágenes
    productos.value.forEach(product => {
      if (!currentImageIndex.value[product.id]) {
        currentImageIndex.value[product.id] = 0;
      }
    });
  } catch (err) {
    console.error('Error al listar los productos:', err);
    error.value = 'Hubo un error al cargar los productos. Por favor, intente de nuevo.';
  } finally {
    loading.value = false;
  }
};

// Obtener lista de categorías para filtros
const listarCategoriasActivas = async () => {
  try {
    const { data } = await activesCategoriasTrue();
    categorias.value = data.datos;
  } catch (error) {
    console.error('Error al listar categorías:', error);
  }
};
// Obtener lista de catalogos Actives
const listarCatalogosActive = async () => {
  try {
    const {data} = await indexCatalogosactives();
    catalogos.value = data.datos
    console.log(catalogos.value);
  } catch (error) {
    console.log(error);
  }
}

// Navegación
const viewProductDetails = (productId) => {
  router.push({ path: `/producto/${productId}` });
};

// Carrito
const addToCart = async (product) => {
  addingToCart.value = product.id;
  try {
    const cantidadMinima = product.cantidad_minima || 1;
    const productWithMinQuantity = { ...product, quantity: cantidadMinima };
    await cartStore.addToCart(productWithMinQuantity);
    showNotification(`${product.nombre} agregado al carrito`, 'success');
  } catch (error) {
    console.error('Error al agregar al carrito:', error);
    showNotification('Error al agregar al carrito', 'error');
  } finally {
    setTimeout(() => addingToCart.value = null, 800);
  }
};

// Formateo de precios
const formatPrice = (price) => {
  return new Intl.NumberFormat('es-BO', {
    style: 'currency',
    currency: 'BOB',
    minimumFractionDigits: 2
  }).format(price);
};

// Truncar descripción
const truncateDescription = (text, maxLength) => {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

// Favoritos
const favoriteUser = async (idProducto) => {
  try {
    const favoriteForm = { producto_id: idProducto };
    await storeFavorite(favoriteForm);
    const index = favoriteProducts.value.indexOf(idProducto);
    if (index > -1) {
      favoriteProducts.value.splice(index, 1);
    } else {
      favoriteProducts.value.push(idProducto);
    }
    showNotification('Producto agregado a favoritos', 'success');
  } catch (error) {
    console.error('Error al agregar a favoritos:', error.response?.data?.message || error);
    showNotification('Error al agregar a favoritos', 'error');
  }
};

// Manejo de imágenes
const getProductImages = (product) => {
  const mainImage = product.imagen_principal;
  const additionalImages = product.images?.map(img => img.imagen) || [];
  return [mainImage, ...additionalImages].filter(Boolean);
};

const nextImage = (product) => {
  const images = getProductImages(product);
  if (images.length > 1) {
    currentImageIndex.value[product.id] = (currentImageIndex.value[product.id] + 1) % images.length;
  }
};

const prevImage = (product) => {
  const images = getProductImages(product);
  if (images.length > 1) {
    currentImageIndex.value[product.id] = (currentImageIndex.value[product.id] - 1 + images.length) % images.length;
  }
};

const getCurrentImage = (product) => {
  const images = getProductImages(product);
  return images[currentImageIndex.value[product.id]] || '/placeholder.jpg';
};

// Cambio de página
const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    listarProductos(page);
    // Desplazamiento hacia arriba al cambiar de página
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

// Resetear filtros
const resetFilters = () => {
  filtroCategoria.value = '';
  filtroCatalogo.value = '';
  searchQuery.value = '';
  listarProductos();
};

// Remover filtro específico
const removeFilter = (filterType) => {
  if (filterType === 'categoria') {
    filtroCategoria.value = '';
  } else if (filterType === 'catalogo') {
    filtroCatalogo.value = '';
  } else if (filterType === 'search') {
    searchQuery.value = '';
  }
  listarProductos();
};

// Notificaciones
const showNotification = (message, type) => {
  // Implementación de notificaciones
  console.log(`${type}: ${message}`);
  // Aquí podrías implementar un sistema de notificaciones toast
};

onMounted(async () => {
  await listarCategoriasActivas();
  await listarProductos();
  await listarCatalogosActive();
});
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css');

/* Contenedor Base */
.catalog-container {
  max-width: 1440px;
  margin: 0 auto;
  padding: 1rem;
  font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

@media (min-width: 768px) {
  .catalog-container {
    padding: 2rem;
  }
}

/* Título Principal */
.main-title {
  font-size: clamp(1.5rem, 5vw, 2.5rem);
  font-weight: 500;
  color: #1a202c;
  text-align: center;
  margin-bottom: 1.5rem;
  letter-spacing: -0.5px;
}

.text-accent {
  color: var(--primary-color, #3498db);
  position: relative;
}

.text-accent::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: var(--primary-color, #3498db);
  transform: scaleX(0);
  transition: transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  transform-origin: left;
}

/* Sección de Filtros - MEJORADA para pantallas grandes */
.filters-wrapper {
  position: sticky;
  top: 0;
  z-index: 100;
  background-color: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(10px);
  padding: 1rem 0;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid rgba(226, 232, 240, 0.8);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

/* Filtros Avanzados - MEJORADOS */
.filters {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 0.5rem;
}

@media (min-width: 768px) {
  .filters {
    padding: 0 1rem;
  }
}

/* Controles de Filtro - MEJORADOS para pantallas grandes */
.filter-controls {
  display: grid;
  grid-template-columns: 2fr;
  gap: 0.75rem;
}

/* Ajustes para tablets */
@media (min-width: 640px) {
  .filter-controls {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .search-container {
    grid-column: span 2;
  }
}

/* Ajustes para pantallas medianas */
@media (min-width: 768px) {
  .filter-controls {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .search-container {
    grid-column: auto;
  }
}

/* Ajustes para pantallas grandes - SOLUCIÓN PARA DESPROPORCIONES */
@media (min-width: 1024px) {
  .filter-controls {
    display: flex;
    align-items: center;
    gap: 1rem; /* Aumentado para mejor espaciado */
  }
  
  .filter-select {
    flex: 0 0 auto;
    width: auto; /* Ancho automático en lugar de fijo */
    min-width: 200px; /* Ancho mínimo para mantener legibilidad */
    max-width: 250px; /* Ancho máximo para evitar que sea demasiado grande */
  }
  
  .search-container {
    flex: 1;
    max-width: 500px; /* Limitar el ancho máximo del buscador */
    margin-left: auto; /* Empujar hacia la derecha */
  }
}

/* Ajustes para pantallas extra grandes */
@media (min-width: 1280px) {
  .filter-controls {
    gap: 1.5rem; /* Más espacio entre elementos */
  }
  
  .filter-select {
    min-width: 220px; /* Ligeramente más ancho */
  }
  
  .search-container {
    max-width: 600px; /* Buscador más ancho */
  }
}

/* Estilos para los selectores de filtro */
.filter-select {
  padding: 0.75rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.875rem;
  color: #4a5568;
  background-color: white;
  width: 100%;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%234A5568'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 1rem;
  transition: all 0.2s ease;
  height: 42px; /* Altura fija para consistencia */
}

.filter-select:hover {
  border-color: #cbd5e0;
}

.filter-select:focus {
  outline: none;
  border-color: var(--primary-color, #3498db);
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
}

/* Contenedor de búsqueda */
.search-container {
  position: relative;
  width: 100%;
}

.search-input {
  width: 100%;
  padding: 0.75rem 0.75rem 0.75rem 2.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.875rem;
  transition: all 0.3s ease;
  height: 44px; /* Altura fija para consistencia con los selectores */
}

.search-input:focus {
  outline: none;
  border-color: var(--primary-color, #3498db);
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #a0aec0;
}

/* Filtros Activos - MEJORADOS */
.active-filters {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding-top: 0.5rem;
}

@media (min-width: 768px) {
  .active-filters {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}

/* Lista de filtros activos */
.active-filters-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.active-filter {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.35rem 0.75rem;
  background-color: #edf2f7;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
  color: #4a5568;
}

.remove-filter {
  background: none;
  border: none;
  color: #718096;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.remove-filter:hover {
  background-color: #e2e8f0;
  color: #4a5568;
}

/* Botón para limpiar todos los filtros */
.reset-all-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.35rem 0.75rem;
  background-color: #f7fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
  color: #4a5568;
  cursor: pointer;
  transition: all 0.2s ease;
}

.reset-all-button:hover {
  background-color: #edf2f7;
  border-color: #cbd5e0;
}

/* Cuadrícula de Productos - Optimizada para móviles */
.products-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

@media (min-width: 480px) {
  .products-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 0.75rem;
  }
}

@media (min-width: 768px) {
  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 1rem;
    margin-bottom: 2rem;
  }
}

@media (min-width: 1200px) {
  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 1.5rem;
  }
}

/* Tarjeta de Producto */
.product-card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
  opacity: 0;
  transform: translateY(20px);
  animation: fadeInUp 0.6s forwards;
  animation-delay: calc(var(--index, 0) * 0.1s);
  height: 100%;
  display: flex;
  flex-direction: column;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (min-width: 768px) {
  .product-card {
    border-radius: 10px;
  }
  
  .product-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  }
}

/* Imagen del Producto */
.product-image-wrapper {
  position: relative;
  width: 100%;
  padding-bottom: 100%;
  overflow: hidden;
}

.product-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  transition: transform 0.6s cubic-bezier(0.165, 0.84, 0.44, 1);
}

.product-card:hover .product-image img {
  transform: scale(1.05);
}

/* Insignias */
.badges {
  position: absolute;
  top: 8px;
  left: 8px;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  z-index: 2;
}

.badge {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 600;
  color: white;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.badge-new {
  background: linear-gradient(45deg, #4CAF50, #8BC34A);
}

.badge-sale {
  background: linear-gradient(45deg, #FF5722, #FF9800);
}

.badge-preventa {
  background: linear-gradient(45deg, #ed8936, #dd6b20);
}

/* Botones de Navegación */
.nav-button {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.9);
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.8;
  z-index: 2;
  border: none;
  cursor: pointer;
  color: #2d3748;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  font-size: 0.7rem;
}

@media (min-width: 768px) {
  .nav-button {
    width: 30px;
    height: 30px;
    opacity: 0;
    font-size: 0.75rem;
  }
  
  .product-card:hover .nav-button {
    opacity: 1;
  }
  
  .nav-button:hover {
    background-color: white;
    transform: translateY(-50%) scale(1.1);
    color: var(--primary-color, #3498db);
  }
}

.nav-button.prev {
  left: 0.5rem;
}

.nav-button.next {
  right: 0.5rem;
}

/* Acciones del Producto - Optimizado para móviles */
.product-actions-bottom {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.4) 70%, transparent);
  opacity: 1;
  z-index: 2;
}

@media (min-width: 768px) {
  .product-actions-bottom {
    opacity: 0;
    padding: 0.5rem;
    transition: opacity 0.3s ease;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
  }
  
  .product-card:hover .product-actions-bottom,
  .product-image:hover .product-actions-bottom {
    opacity: 1;
  }
}

.action-button {
  background-color: rgba(255, 255, 255, 0.95);
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(4px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  color: #2d3748;
  font-size: 0.8rem;
}

@media (min-width: 768px) {
  .action-button {
    width: 30px;
    height: 30px;
    font-size: 0.75rem;
  }
  
  .action-button:hover {
    transform: scale(1.1);
  }
  
  .cart-btn:hover {
    background-color: var(--primary-color, #3498db);
    color: white;
  }
  
  .view-btn:hover {
    background-color: #6b46c1;
    color: white;
  }
  
  .fav-btn:hover {
    background-color: #e53e3e;
    color: white;
  }
}

.action-button:active {
  transform: scale(0.95);
}

.fav-btn.in-favorites {
  background-color: #e53e3e;
  color: white;
}

.action-button.adding {
  pointer-events: none;
}

/* Información del Producto */
.product-info {
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

@media (min-width: 768px) {
  .product-info {
    padding: 0.75rem;
  }
}

@media (min-width: 1200px) {
  .product-info {
    padding: 1rem;
  }
}

.category {
  font-size: 0.65rem;
  color: #718096;
  margin-bottom: 0.25rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
}

@media (min-width: 768px) {
  .category {
    font-size: 0.7rem;
    margin-bottom: 0.5rem;
  }
}

.product-name {
  font-size: 0.8rem;
  font-weight: 700;
  color: #2d3748;
  line-height: 1.4;
  transition: color 0.3s ease;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  height: 2.2rem;
  margin-bottom: 0.25rem;
}

@media (min-width: 768px) {
  .product-name {
    font-size: 0.875rem;
    height: 2.5rem;
    margin-bottom: 0.5rem;
  }
  
  .product-card:hover .product-name {
    color: var(--primary-color, #3498db);
  }
}

@media (min-width: 1200px) {
  .product-name {
    font-size: 1rem;
    height: 2.8rem;
  }
}

/* Descripción del producto */
.product-description {
  font-size: 0.75rem;
  color: #718096;
  line-height: 1.4;
  margin-bottom: 0.5rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

@media (min-width: 768px) {
  .product-description {
    font-size: 0.8rem;
    margin-bottom: 0.75rem;
  }
}

/* NUEVO DISEÑO DE PRECIOS */
.prices-container {
  margin-top: 0.5rem;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  background-color: #f8fafc;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.prices-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  background: linear-gradient(to right, #f8fafc, #edf2f7);
  border-bottom: 1px solid #e2e8f0;
}

.prices-title {
  font-size: 0.75rem;
  font-weight: 700;
  color: #4a5568;
}

.toggle-prices-btn {
  background: none;
  border: none;
  color: #718096;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.toggle-prices-btn:hover {
  background-color: #e2e8f0;
  color: #4a5568;
}

/* Detalles de precios expandibles */
.price-details {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease, opacity 0.3s ease;
  opacity: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0 0.5rem;
}

.price-details.expanded {
  max-height: 300px;
  opacity: 1;
  padding: 0.5rem;
}

/* Tarjetas de precio */
.price-card {
  border-radius: 6px;
  overflow: hidden;
  background-color: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid #edf2f7;
}

.price-card.special {
  border-left: 3px solid #ed8936;
}

.price-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  background-color: #f7fafc;
  border-bottom: 1px solid #edf2f7;
}

.price-type {
  font-size: 0.7rem;
  font-weight: 700;
  color: #4a5568;
}

.price-value {
  font-size: 0.8rem;
  font-weight: 700;
  color: #2d3748;
}

.price-card.special .price-value {
  color: #dd6b20;
}

.price-card-body {
  padding: 0.5rem;
}

.quantity-range {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.quantity-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.65rem;
  color: #718096;
}

.quantity-label {
  font-weight: 600;
}

.quantity-value {
  color: #4a5568;
}

/* Vista resumida de precios */
.prices-summary {
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  border-top: 1px dashed #e2e8f0;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.7rem;
}

.summary-item.special {
  font-weight: 700;
}

.summary-label {
  color: #4a5568;
  font-weight: 600;
}

.summary-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.summary-price {
  font-weight: 700;
  color: #2d3748;
}

.summary-item.special .summary-price {
  color: #dd6b20;
}

.summary-quantity {
  font-size: 0.6rem;
  color: #718096;
  background-color: #edf2f7;
  padding: 0.1rem 0.3rem;
  border-radius: 4px;
}

/* Overlay de Carga */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
}

.spinner {
  border: 4px solid rgba(52, 152, 219, 0.2);
  border-top: 4px solid var(--primary-color, #3498db);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@media (min-width: 768px) {
  .spinner {
    width: 50px;
    height: 50px;
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Estado de Error */
.error-message {
  text-align: center;
  padding: 2rem 1rem;
  background-color: #fff5f5;
  border-radius: 12px;
  margin-bottom: 2rem;
  border: 1px solid #fed7d7;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

@media (min-width: 768px) {
  .error-message {
    padding: 3rem 2rem;
  }
}

.error-icon {
  font-size: 2.5rem;
  color: #e53e3e;
}

@media (min-width: 768px) {
  .error-icon {
    font-size: 3rem;
  }
}

.retry-button {
  background-color: var(--primary-color, #3498db);
  color: white;
  border: none;
  padding: 0.6rem 1.25rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
  margin-top: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

@media (min-width: 768px) {
  .retry-button {
    padding: 0.75rem 1.5rem;
  }
  
  .retry-button:hover {
    background-color: #2980b9;
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
}

/* Estado Sin Productos */
.no-products {
  text-align: center;
  padding: 3rem 1.5rem;
  background-color: #f7fafc;
  border-radius: 12px;
  margin-bottom: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

@media (min-width: 768px) {
  .no-products {
    padding: 4rem 2rem;
  }
}

.no-products-icon {
  font-size: 3rem;
  color: #a0aec0;
  margin-bottom: 0.5rem;
}

@media (min-width: 768px) {
  .no-products-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
  }
}

.reset-filters-button {
  background-color: #4a5568;
  color: white;
  border: none;
  padding: 0.6rem 1.25rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
  margin-top: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

@media (min-width: 768px) {
  .reset-filters-button {
    padding: 0.75rem 1.5rem;
    margin-top: 1rem;
  }
  
  .reset-filters-button:hover {
    background-color: #2d3748;
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
}

/* Paginación - MEJORADA */
.pagination {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 2rem;
  padding-bottom: 1.5rem;
  animation: fadeIn 0.6s ease;
  flex-wrap: wrap;
}

@media (min-width: 768px) {
  .pagination {
    gap: 0.75rem;
    margin-top: 3rem;
    padding-bottom: 2rem;
  }
}

.page-button {
  padding: 0.5rem 1rem;
  background: #edf2f7;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  color: #4a5568;
  font-size: 0.875rem;
  min-width: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-button.page-nav {
  background-color: white;
  border: 1px solid #e2e8f0;
}

@media (min-width: 768px) {
  .page-button {
    padding: 0.75rem 1.25rem;
    border-radius: 8px;
    min-width: 45px;
  }
  
  .page-button:hover:not(.active) {
    background: #e2e8f0;
    transform: translateY(-2px);
  }
  
  .page-button.page-nav:hover {
    background-color: #f7fafc;
    border-color: #cbd5e0;
  }
}

.page-button.active {
  background: var(--primary-color, #3498db);
  color: #ffffff;
}

/* Transiciones */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Optimizaciones para dispositivos táctiles */
@media (hover: none) {
  .product-card:hover {
    transform: none;
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.05);
  }

  .product-actions-bottom {
    opacity: 1;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0.3) 50%, transparent 100%);
  }

  .nav-button {
    opacity: 0.8;
  }

  .action-button:active {
    transform: scale(0.95);
  }

  .product-card:active {
    transform: scale(0.98);
  }
}

/* Mejoras de accesibilidad */
@media (prefers-reduced-motion: reduce) {
  .product-card {
    animation: none;
    opacity: 1;
    transform: none;
  }

  .product-card:hover,
  .action-button:hover,
  .nav-button:hover {
    transform: none;
  }

  .product-card:hover .product-image img {
    transform: none;
  }

  .spinner {
    animation: none;
  }

  .retry-button:hover,
  .action-button:hover,
  .reset-filters-button:hover,
  .page-button:hover {
    transform: none;
  }

  .fade-enter-active,
  .fade-leave-active {
    transition: none;
  }
  
  .price-details {
    transition: none;
  }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>