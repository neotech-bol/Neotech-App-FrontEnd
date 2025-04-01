<template>
  <div class="catalog-container">
    <!-- Título Principal -->
    <h1 class="main-title">
      Explora Nuestras <span class="text-accent">Categorías</span>
    </h1>

    <!-- Sección de Filtros - Mejorada para pantallas grandes -->
    <div class="filters-wrapper">
      <div class="filters">
        <!-- Contenedor de búsqueda y selector de categoría mejorados -->
        <div class="filter-controls">
          <div class="search-container">
            <div class="search-wrapper">
              <i class="fas fa-search search-icon"></i>
              <input v-model="searchQuery" type="text" placeholder="Buscar productos..." class="search-input"
                aria-label="Buscar productos" />
            </div>
          </div>
          <div class="select-wrapper">
            <select v-model="selectedCategory" class="category-select" aria-label="Filtrar por categoría">
              <option value="">Todas las Categorías</option>
              <option v-for="category in uniqueCategories" :key="category" :value="category">
                {{ category }}
              </option>
            </select>
            <i class="fas fa-chevron-down select-arrow"></i>
          </div>
        </div>
      </div>
    </div>

    <!-- Estado de Carga -->
    <div v-if="loading" class="loading-overlay">
      <div class="spinner"></div>
      <p>Cargando categorias...</p>
    </div>

    <!-- Estado de Error -->
    <div v-else-if="error" class="error-message">
      <i class="fas fa-exclamation-circle error-icon"></i>
      <p>{{ error }}</p>
      <button @click="listarCategorias" class="retry-button">
        <i class="fas fa-sync-alt"></i> Reintentar
      </button>
    </div>

    <!-- Contenido del Catálogo -->
    <div v-else class="categories-wrapper">
      <div v-for="(categoria, index) in filteredCategorias" :key="categoria.id" class="category-section"
        :style="{ '--index': index }">
        <!-- Banner de ancho completo -->
        <div class="category-banner-container">
          <div class="category-banner" @click="viewAllProducts(categoria.id)">
            <img :src="categoria.banner" :alt="categoria.nombre" loading="lazy" />
            <div class="banner-overlay">
              <div class="banner-content">
                <h2 class="banner-title">{{ categoria.nombre }}</h2>
                <div class="banner-description-container">
                  <p class="banner-description" v-if="categoria.descripcion !== null && categoria.descripcion !== '' && categoria.descripcion !== 'null'">
                      {{ getTruncatedDescription(categoria.descripcion) }}
                      <button v-if="isDescriptionTruncated(categoria.descripcion)" class="read-more-btn"
                        @click.stop="showDescriptionModal(categoria)">
                        Ver más
                      </button>
                    </p>
                    <p v-else>No hay descripción disponible.</p>
                </div>
                <button class="banner-cta" @click="irCategoria(categoria.id)">
                  <span>Ver Colección</span>
                  <i class="fas fa-arrow-right"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Encabezado de Categoría -->
        <div class="category-header">
          <h2>
            {{ categoria.titulo ? categoria.titulo.split(" ").slice(0, -1).join(" ") : '' }}
            <span class="text-accent">{{ categoria.titulo ? getLastWord(categoria.titulo) : categoria.nombre }}</span>
          </h2>
          <p>{{ categoria.subtitulo }}</p>
        </div>

        <!-- Cuadrícula de Productos -->
        <div class="products-grid">
          <div v-for="(product, productIndex) in categoria.productos" :key="product.id" class="product-card"
            :style="{ '--index': productIndex }" @click="viewProductDetails(product.id)">
            <div class="product-image-wrapper">
              <div class="product-image">
                <transition name="fade" mode="out-in">
                  <img :src="getCurrentImage(product)" :alt="product.nombre" loading="lazy"
                    :key="currentImageIndex[product.id]" />
                </transition>

                <!-- Botones de Navegación -->
                <button v-if="getProductImages(product).length > 1" class="nav-button prev"
                  @click.stop="prevImage(product)" aria-label="Imagen anterior">
                  <i class="fas fa-chevron-left"></i>
                </button>
                <button v-if="getProductImages(product).length > 1" class="nav-button next"
                  @click.stop="nextImage(product)" aria-label="Imagen siguiente">
                  <i class="fas fa-chevron-right"></i>
                </button>

                <!-- Insignias de descuento -->
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

                <!-- Acciones del Producto -->
                <div class="product-actions-bottom">
                  <button @click.stop="addToCart(product)" class="action-button cart-btn"
                    aria-label="Agregar al carrito" :class="{ 'adding': addingToCart === product.id }">
                    <i class="fas" :class="addingToCart === product.id ? 'fa-spinner fa-spin' : 'fa-shopping-cart'"></i>
                  </button>
                  <button @click.stop="viewProductDetails(product.id)" class="action-button view-btn"
                    aria-label="Ver producto">
                    <i class="fas fa-eye"></i>
                  </button>
                  <button @click.stop="favoriteUser(product.id)" class="action-button fav-btn"
                    aria-label="Agregar a favoritos" :class="{ 'in-favorites': favoriteProducts.includes(product.id) }">
                    <i class="fas fa-heart"></i>
                  </button>
                </div>
              </div>
            </div>

            <!-- Información del Producto -->
            <div class="product-info">
              <div class="category">
                <i class="fas fa-tag"></i> {{ product.categoria?.nombre || categoria.nombre }}
              </div>
              <h3 class="product-name">{{ product.nombre }}</h3>
              <!-- Descripción truncada -->
              <p v-if="product.descripcion" class="product-description">
                {{ truncateDescription(product.descripcion, 60) }}
              </p>
              
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
      </div>
    </div>

    <!-- Paginación -->
    <div v-if="totalPages > 1" class="pagination">
      <button v-if="currentPage > 1" @click="changePage(currentPage - 1)" class="page-button page-nav"
        aria-label="Página anterior">
        <i class="fas fa-chevron-left"></i>
      </button>

      <button v-for="page in totalPages" :key="page" @click="changePage(page)"
        :class="['page-button', { active: currentPage === page }]" :aria-label="`Ir a página ${page}`">
        {{ page }}
      </button>

      <button v-if="currentPage < totalPages" @click="changePage(currentPage + 1)" class="page-button page-nav"
        aria-label="Página siguiente">
        <i class="fas fa-chevron-right"></i>
      </button>
    </div>

    <!-- Modal para descripción completa -->
    <div class="description-modal" v-if="isModalOpen && selectedCategoria" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ selectedCategoria.nombre }}</h3>
          <button class="close-btn" @click="closeModal" aria-label="Cerrar modal">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <p>{{ selectedCategoria.descripcion }}</p>
        </div>
        <div class="modal-footer">
          <button class="modal-btn" @click="closeModal">Cerrar</button>
          <button class="modal-btn primary" @click="viewCollectionFromModal(selectedCategoria.id)">
            <span>Ver Colección</span>
            <i class="fas fa-arrow-right"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { indexCategoriasConProductos } from '@/Services/CategoriaService';
import { useCartStore } from '@/stores/cart';
import { useRouter } from 'vue-router';
import { storeFavorite } from '@/Services/FavoriteService';

const router = useRouter();
const cartStore = useCartStore();

const categorias = ref([]);
const loading = ref(true);
const error = ref(null);
const currentPage = ref(1);
const totalPages = ref(1);
const searchQuery = ref('');
const selectedCategory = ref('');
const currentImageIndex = ref({});
const favoriteProducts = ref([]);
const addingToCart = ref(null);
const expandedPriceDetails = ref([]); // Para controlar los detalles de precios expandidos

// Estados para el modal de descripción
const isModalOpen = ref(false);
const selectedCategoria = ref(null);
const maxDescriptionLength = 120; // Longitud máxima para mostrar en el banner

// Métodos para la descripción truncada
const getTruncatedDescription = (descripcion) => {
  if (!descripcion) return '';

  if (descripcion.length > maxDescriptionLength) {
    return descripcion.substring(0, maxDescriptionLength) + '...';
  }

  return descripcion;
};

// Verificar si la descripción está truncada
const isDescriptionTruncated = (descripcion) => {
  return descripcion && descripcion.length > maxDescriptionLength;
};

// Mostrar modal con descripción completa
const showDescriptionModal = (categoria) => {
  selectedCategoria.value = categoria;
  isModalOpen.value = true;
  document.body.classList.add('modal-open'); // Prevenir scroll del body
};

// Cerrar modal
const closeModal = () => {
  isModalOpen.value = false;
  document.body.classList.remove('modal-open');
};

// Ver colección (desde el modal)
const viewCollectionFromModal = (categoryId) => {
  closeModal();
  viewAllProducts(categoryId);
};

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

const listarCategorias = async (page = 1) => {
  loading.value = true;
  error.value = null;
  try {
    const { data } = await indexCategoriasConProductos();
    categorias.value = data.datos.data;
    totalPages.value = data.datos.last_page;
    currentPage.value = page;
    categorias.value.forEach(categoria => {
      categoria.productos.forEach(product => {
        currentImageIndex.value[product.id] = 0;
      });
    });
  } catch (err) {
    console.error('Error al cargar las categorías:', err);
    error.value = 'Hubo un error al cargar las categorías. Por favor, intenta de nuevo.';
  } finally {
    loading.value = false;
  }
};

const viewProductDetails = (productId) => {
  router.push({ path: `/producto/${productId}` });
};

const viewAllProducts = (categoryId) => {
  router.push({ path: `/categoria/${categoryId}` });
};

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

const formatPrice = (price) => {
  return new Intl.NumberFormat('es-BO', {
    style: 'currency',
    currency: 'BOB',
    minimumFractionDigits: 2
  }).format(price);
};

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

const getLastWord = (title) => {
  if (!title) return '';
  const words = title.split(' ');
  return words[words.length - 1];
};

const uniqueCategories = computed(() => {
  return [...new Set(categorias.value.map(cat => cat.nombre))];
});

const filteredCategorias = computed(() => {
  return categorias.value
    .filter(categoria => !selectedCategory.value || categoria.nombre === selectedCategory.value)
    .map(categoria => ({
      ...categoria,
      productos: categoria.productos.filter(producto =>
        producto.nombre.toLowerCase().includes(searchQuery.value.toLowerCase())
      )
    }))
    .filter(categoria => categoria.productos.length > 0);
});

const changePage = (page) => {
  listarCategorias(page);
  // Desplazamiento hacia arriba al cambiar de página
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const showNotification = (message, type) => {
  // Implementación de notificaciones
  console.log(`${type}: ${message}`);
  // Aquí podrías implementar un sistema de notificaciones toast
};

const irCategoria = (idCategoria) => {
  router.push({ path: `/categoria/${idCategoria}` });
}

// Truncar descripción
const truncateDescription = (text, maxLength) => {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

onMounted(() => {
  listarCategorias();
  // Cerrar modal con tecla Escape
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isModalOpen.value) {
      closeModal();
    }
  });
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
  color: #3498db;
  position: relative;
}

.text-accent::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: #3498db;
  transform: scaleX(0);
  transition: transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  transform-origin: left;
}

.category-header h2:hover .text-accent::after {
  transform: scaleX(1);
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

/* Filtros - MEJORADOS */
.filters {
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
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

/* Ajustes para tablets */
@media (min-width: 640px) {
  .filter-controls {
    flex-direction: row;
    gap: 1rem;
  }

  .search-container {
    flex: 1;
  }

  .select-wrapper {
    width: 40%;
  }
}

/* Ajustes para pantallas medianas */
@media (min-width: 768px) {
  .filter-controls {
    gap: 1.25rem;
  }

  .select-wrapper {
    width: 35%;
  }
}

/* Ajustes para pantallas grandes - SOLUCIÓN PARA DESPROPORCIONES */
@media (min-width: 1024px) {
  .filter-controls {
    gap: 1.5rem;
  }

  .search-container {
    flex: 1;
    max-width: 60%;
    /* Limitar el ancho del buscador */
  }

  .select-wrapper {
    width: auto;
    min-width: 220px;
    /* Ancho mínimo para mantener legibilidad */
    max-width: 300px;
    /* Ancho máximo para evitar que sea demasiado grande */
  }
}

/* Ajustes para pantallas extra grandes */
@media (min-width: 1280px) {
  .search-container {
    max-width: 65%;
    /* Ligeramente más ancho en pantallas muy grandes */
  }

  .select-wrapper {
    min-width: 240px;
    /* Ligeramente más ancho */
  }
}

/* Contenedor de búsqueda */
.search-container {
  position: relative;
  width: 100%;
}

.search-wrapper {
  position: relative;
  width: 100%;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #718096;
  font-size: 14px;
}

@media (min-width: 768px) {
  .search-icon {
    left: 15px;
    font-size: 16px;
  }
}

.search-input {
  width: 100%;
  padding: 0.75rem 0.75rem 0.75rem 2.5rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.875rem;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  height: 42px;
  /* Altura fija para consistencia */
}

@media (min-width: 768px) {
  .search-input {
    padding: 0.75rem 1rem 0.75rem 2.75rem;
    font-size: 0.95rem;
    border-radius: 10px;
    height: 46px;
    /* Ligeramente más alto en pantallas grandes */
  }
}

.search-input:focus {
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
  outline: none;
}

/* Contenedor del selector */
.select-wrapper {
  position: relative;
  width: 100%;
}

.category-select {
  width: 100%;
  padding: 0.75rem 2rem 0.75rem 0.75rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.875rem;
  background: white;
  appearance: none;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  height: 42px;
  /* Altura fija para consistencia */
}

@media (min-width: 768px) {
  .category-select {
    padding: 0.75rem 2.5rem 0.75rem 1rem;
    font-size: 0.95rem;
    border-radius: 10px;
    height: 46px;
    /* Ligeramente más alto en pantallas grandes */
  }
}

.category-select:focus {
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
  outline: none;
}

.select-arrow {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #718096;
  font-size: 12px;
  pointer-events: none;
  transition: transform 0.3s ease;
}

@media (min-width: 768px) {
  .select-arrow {
    right: 15px;
    font-size: 14px;
  }
}

.category-select:focus+.select-arrow {
  transform: translateY(-50%) rotate(180deg);
}

/* Sección de Categorías */
.categories-wrapper {
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

@media (min-width: 768px) {
  .categories-wrapper {
    gap: 4rem;
  }
}

.category-section {
  background: #ffffff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  opacity: 0;
  transform: translateY(20px);
  animation: fadeInUp 0.6s forwards;
  animation-delay: calc(var(--index, 0) * 0.1s);
}

@media (min-width: 768px) {
  .category-section {
    border-radius: 16px;
  }
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

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

/* Contenedor para mantener proporciones consistentes */
.category-banner-container {
  margin-bottom: 1.5rem;
  width: 100%;
  position: relative;
}

@media (min-width: 768px) {
  .category-banner-container {
    margin-bottom: 2rem;
  }
}

/* Banner principal con efectos mejorados */
.category-banner {
  position: relative;
  height: 180px;
  cursor: pointer;
  overflow: hidden;
  border-radius: 8px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

@media (min-width: 480px) {
  .category-banner {
    height: 220px;
  }
}

@media (min-width: 768px) {
  .category-banner {
    height: clamp(250px, 40vh, 500px);
    border-radius: 12px;
  }
}

.category-banner:hover {
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
}

.category-banner img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.8s cubic-bezier(0.165, 0.84, 0.44, 1);
}

.category-banner:hover img {
  transform: scale(1.05);
}

/* Overlay con gradiente mejorado y animaciones */
.banner-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top,
      rgba(0, 0, 0, 0.8) 0%,
      rgba(0, 0, 0, 0.6) 40%,
      rgba(0, 0, 0, 0.3) 70%,
      rgba(0, 0, 0, 0) 100%);
  display: flex;
  align-items: flex-end;
  color: #fff;
  padding: 1rem;
  transition: background 0.3s ease;
}

@media (min-width: 768px) {
  .banner-overlay {
    background: linear-gradient(to right,
        rgba(0, 0, 0, 0.8) 0%,
        rgba(0, 0, 0, 0.6) 30%,
        rgba(0, 0, 0, 0.3) 60%,
        rgba(0, 0, 0, 0) 100%);
    align-items: center;
    padding: 2rem;
  }

  .category-banner:hover .banner-overlay {
    background: linear-gradient(to right,
        rgba(0, 0, 0, 0.85) 0%,
        rgba(0, 0, 0, 0.65) 30%,
        rgba(0, 0, 0, 0.35) 60%,
        rgba(0, 0, 0, 0) 100%);
  }
}

/* Contenido del banner con animaciones */
.banner-content {
  max-width: 100%;
  transform: translateY(0);
  opacity: 1;
  transition: transform 0.5s ease, opacity 0.5s ease;
}

@media (min-width: 768px) {
  .banner-content {
    max-width: 600px;
  }
}

.banner-title {
  font-size: clamp(1.25rem, 5vw, 3.5rem);
  font-weight: 800;
  margin-bottom: 0.5rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  position: relative;
  display: inline-block;
}

@media (min-width: 768px) {
  .banner-title {
    margin-bottom: 1rem;
  }
}

.banner-title::after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 0;
  width: 40px;
  height: 3px;
  background-color: #3498db;
  transform: scaleX(1);
  transform-origin: left;
  transition: transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@media (min-width: 768px) {
  .banner-title::after {
    transform: scaleX(0);
    width: 60px;
  }

  .category-banner:hover .banner-title::after {
    transform: scaleX(1);
  }
}

.banner-description-container {
  position: relative;
}

.banner-description {
  font-size: 0.875rem;
  max-width: 100%;
  margin-bottom: 0.75rem;
  line-height: 1.4;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  opacity: 0.9;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

@media (min-width: 768px) {
  .banner-description {
    font-size: clamp(1rem, 2vw, 1.25rem);
    max-width: 60ch;
    margin-bottom: 1.5rem;
    line-height: 1.6;
    -webkit-line-clamp: initial;
  }
}

/* Botón "Ver más" mejorado para móviles */
.read-more-btn {
  background: rgba(52, 152, 219, 0.2);
  border: none;
  color: #fff;
  font-weight: 600;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  margin-left: 0.25rem;
  font-size: 0.75rem;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  transition: all 0.2s ease;
  border-radius: 4px;
  display: inline-block;
  vertical-align: middle;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.read-more-btn:hover,
.read-more-btn:active {
  background: rgba(52, 152, 219, 0.4);
  transform: translateY(-1px);
}

@media (min-width: 768px) {
  .read-more-btn {
    background: none;
    padding: 0;
    text-decoration: underline;
    display: inline;
    box-shadow: none;
    font-size: 0.9em;
  }

  .read-more-btn:hover {
    color: #2980b9;
    background: none;
  }
}

/* Botón CTA mejorado para móviles */
.banner-cta {
  padding: 0.6rem 1.25rem;
  background: #3498db;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.875rem;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  width: fit-content;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  position: relative;
  overflow: hidden;
  z-index: 1;
  box-shadow: 0 4px 10px rgba(52, 152, 219, 0.3);
}

@media (min-width: 768px) {
  .banner-cta {
    padding: 0.75rem 1.5rem;
    font-size: clamp(0.875rem, 1.5vw, 1rem);
  }
}

.banner-cta::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #2980b9;
  transform: translateX(-100%);
  transition: transform 0.3s ease;
  z-index: -1;
}

.banner-cta:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 15px rgba(52, 152, 219, 0.4);
}

.banner-cta:hover::before {
  transform: translateX(0);
}

.banner-cta i {
  transition: transform 0.3s ease;
}

.banner-cta:hover i {
  transform: translateX(3px);
}

/* Modal de descripción */
.description-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 1rem;
  backdrop-filter: blur(5px);
  animation: fadeIn 0.3s ease;
}

.modal-content {
  background-color: white;
  border-radius: 12px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2);
  animation: slideUp 0.3s ease;
  overflow: hidden;
}

@keyframes slideUp {
  from {
    transform: translateY(30px);
    opacity: 0;
  }

  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header {
  padding: 1rem;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

@media (min-width: 768px) {
  .modal-header {
    padding: 1.25rem;
  }
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  color: #333;
}

@media (min-width: 768px) {
  .modal-header h3 {
    font-size: 1.5rem;
  }
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.25rem;
  color: #666;
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background-color: #f5f5f5;
  color: #333;
}

.modal-body {
  padding: 1rem;
  overflow-y: auto;
  color: #333;
  line-height: 1.6;
  font-size: 0.9rem;
}

@media (min-width: 768px) {
  .modal-body {
    padding: 1.5rem;
    font-size: 1rem;
  }
}

.modal-footer {
  padding: 0.75rem 1rem;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

@media (min-width: 768px) {
  .modal-footer {
    padding: 1rem 1.25rem;
  }
}

.modal-btn {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid #ddd;
  background-color: white;
  color: #333;
  font-size: 0.85rem;
}

@media (min-width: 768px) {
  .modal-btn {
    padding: 0.6rem 1.25rem;
    font-size: 0.9rem;
  }
}

.modal-btn:hover {
  background-color: #f5f5f5;
}

.modal-btn.primary {
  background-color: #3498db;
  color: white;
  border-color: #3498db;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.modal-btn.primary:hover {
  background-color: #2980b9;
  border-color: #2980b9;
}

.modal-btn.primary i {
  transition: transform 0.2s ease;
}

.modal-btn.primary:hover i {
  transform: translateX(3px);
}

/* Clase para prevenir scroll del body cuando el modal está abierto */
:global(.modal-open) {
  overflow: hidden;
}

/* Encabezado de Categoría */
.category-header {
  text-align: center;
  margin-bottom: 1.5rem;
}

@media (min-width: 768px) {
  .category-header {
    margin-bottom: 2rem;
  }
}

.category-header h2 {
  font-size: clamp(1.5rem, 3vw, 2.5rem);
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 0.5rem;
}

.category-header p {
  font-size: clamp(0.875rem, 1.5vw, 1.25rem);
  color: #666;
  max-width: 700px;
  margin: 0 auto;
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
  width: 24px;
  height: 24px;
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
  font-size: 0.65rem;
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
    color: #3498db;
  }
}

.nav-button.prev {
  left: 0.5rem;
}

.nav-button.next {
  right: 0.5rem;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.05);
  }

  100% {
    transform: scale(1);
  }
}

/* Acciones del Producto - Optimizadas para móviles */
.product-actions-bottom {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.4rem;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
  opacity: 1;
  z-index: 2;
}

@media (min-width: 768px) {
  .product-actions-bottom {
    opacity: 0;
    padding: 0.5rem;
    transition: opacity 0.3s ease;
  }

  .product-card:hover .product-actions-bottom,
  .product-image:hover .product-actions-bottom {
    opacity: 1;
  }
}

.action-button {
  background-color: rgba(255, 255, 255, 0.9);
  border: none;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(4px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  color: #2d3748;
  font-size: 0.7rem;
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
    background-color: #3498db;
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
    color: #3498db;
  }
}

@media (min-width: 1200px) {
  .product-name {
    font-size: 1rem;
    height: 2.8rem;
  }
}

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
  border-top: 4px solid #3498db;
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
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
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
  background-color: #3498db;
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
  background: #3498db;
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

  .category-banner:hover {
    transform: none;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  }

  .category-banner:hover img {
    transform: scale(1);
  }

  .banner-title::after {
    transform: scaleX(1);
    width: 40px;
  }

  .banner-cta {
    background: linear-gradient(to right, #3498db, #2980b9);
    animation: pulse 2s infinite;
  }

  .banner-cta::before {
    display: none;
  }
}

/* Mejoras de accesibilidad */
@media (prefers-reduced-motion: reduce) {
  .product-card,
  .category-banner,
  .modal-content,
  .description-modal {
    animation: none;
    opacity: 1;
    transform: none;
  }

  .product-card:hover,
  .category-banner:hover,
  .banner-cta:hover,
  .action-button:hover,
  .nav-button:hover {
    transform: none;
  }

  .product-card:hover .product-image img,
  .category-banner:hover img {
    transform: none;
  }

  .spinner {
    animation: none;
  }

  .retry-button:hover,
  .action-button:hover,
  .banner-cta:hover,
  .page-button:hover,
  .modal-btn:hover {
    transform: none;
  }

  .fade-enter-active,
  .fade-leave-active {
    transition: none;
  }

  .banner-title::after,
  .banner-cta::before,
  .banner-cta i,
  .modal-btn.primary i {
    transition: none;
    transform: none;
  }
  
  .price-details {
    transition: none;
  }
}
</style>