<template>
  <div class="catalog-container">
    <!-- Estado de Carga -->
    <div v-if="loading" class="loading-overlay">
      <div class="spinner"></div>
      <p>Cargando catálogo...</p>
    </div>

    <!-- Estado de Error -->
    <div v-else-if="error" class="error-message">
      <i class="fas fa-exclamation-circle error-icon"></i>
      <p>{{ error }}</p>
      <button @click="listarCatalogo" class="retry-button">
        <i class="fas fa-sync-alt"></i> Reintentar
      </button>
    </div>

    <!-- Contenido de la Categoría -->
    <div v-else-if="categoria" class="category-section">
      <!-- Banner de ancho completo -->
      <div class="category-banner-container">
        <div class="category-banner" @click="viewCollection">
          <img :src="categoria.banner" :alt="`Banner de ${categoria.nombre}`" loading="lazy" />
          <div class="banner-overlay">
            <div class="banner-content">
              <h2 class="banner-title">{{ categoria.nombre }}</h2>
              <div class="banner-description-container">
                <p class="banner-description" v-if="categoria.descripcion !== null && categoria.descripcion !== '' && categoria.descripcion !== 'null'">
                  {{ getTruncatedDescription(categoria.descripcion) }}
                  <button v-if="isDescriptionTruncated(categoria.descripcion)" class="read-more-btn" @click.stop="showDescriptionModal(categoria)" aria-label="Ver descripción completa">
                    Ver más
                  </button>
                </p>
                <p v-else>No hay descripción disponible.</p>
              </div>
              <button class="banner-cta" @click="irCategoria(categoria.id, categoria.nombre)">
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
          {{ categoria.titulo ? categoria.titulo.split(" ").slice(0, -1).join(" ") : categoria.nombre }}
          <span class="text-accent">{{ categoria.titulo ? getLastWord(categoria.titulo) : 'Productos' }}</span>
        </h2>
        <p>{{ categoria.subtitulo || 'Calidad y variedad en cada producto' }}</p>
      </div>

      <!-- Cuadrícula de Productos -->
      <div class="products-grid">
        <div v-for="(product, productIndex) in categoria.productos" :key="product.id" class="product-card"
             :style="{ '--index': productIndex }" @click="verProducto(product.id, product.nombre)">
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

              <!-- Insignias -->
              <div class="badges">
                <span v-if="hasPreventaPrices(product)" class="badge badge-preventa">
                  <i class="fas fa-tag"></i> PREVENTA
                </span>
              </div>

              <!-- Acciones del Producto -->
              <div class="product-actions-bottom">
                <button @click.stop="addToCart(product)" class="action-button cart-btn" aria-label="Agregar al carrito"
                        :class="{ 'adding': addingToCart === product.id }">
                  <i class="fas" :class="addingToCart === product.id ? 'fa-spinner fa-spin' : 'fa-shopping-cart'"></i>
                </button>
                <button @click.stop="verProducto(product.id, product.nombre)" class="action-button view-btn" aria-label="Ver producto">
                  <i class="fas fa-eye"></i>
                </button>
                <button @click.stop="favoriteUser(product.id)" class="action-button fav-btn" aria-label="Agregar a favoritos"
                        :class="{ 'in-favorites': favoriteProducts.includes(product.id) }">
                  <i class="fas fa-heart"></i>
                </button>
              </div>
            </div>
          </div>

          <!-- Información del Producto -->
          <div class="product-info">
            <div class="category">
              <i class="fas fa-tag"></i> {{ categoria.nombre }}
            </div>
            <h3 class="product-name">{{ product.nombre }}</h3>

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
                <div class="price-card" v-if="product.precio_preventa">
                  <div class="price-card-header">
                    <span class="price-type">Preventa Estándar</span>
                    <span class="price-value">{{ formatPrice(product.precio_preventa) }}</span>
                  </div>
                  <div class="price-card-body">
                    <div class="quantity-range">
                      <div class="quantity-item">
                        <span class="quantity-label">Mínimo:</span>
                        <span class="quantity-value">{{ product.cantidad_minima_preventa || 1 }} unidades</span>
                      </div>
                      <div class="quantity-item">
                        <span class="quantity-label">Máximo:</span>
                        <span class="quantity-value">{{ product.cantidad_maxima_preventa || 'Sin límite' }} unidades</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Precio Preventa Especial -->
                <div class="price-card special" v-if="product.precio">
                  <div class="price-card-header">
                    <span class="price-type">Preventa Especial</span>
                    <span class="price-value">{{ formatPrice(product.precio) }}</span>
                  </div>
                  <div class="price-card-body">
                    <div class="quantity-range">
                      <div class="quantity-item">
                        <span class="quantity-label">Mínimo:</span>
                        <span class="quantity-value">{{ product.cantidad_minima }} unidades</span>
                      </div>
                      <div class="quantity-item">
                        <span class="quantity-label">Máximo:</span>
                        <span class="quantity-value">{{ product.cantidad_maxima }} unidades</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Vista resumida de precios (siempre visible) -->
              <div class="prices-summary">
                <div class="summary-item" v-if="product.precio_preventa">
                  <span class="summary-label">Estándar:</span>
                  <div class="summary-content">
                    <span class="summary-price">{{ formatPrice(product.precio_preventa) }}</span>
                  </div>
                </div>
                <div class="summary-item special" v-if="product.precio">
                  <span class="summary-label">Especial:</span>
                  <div class="summary-content">
                    <span class="summary-price">{{ formatPrice(product.precio) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
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
          <p>{{ selectedCategoria.descripcion || 'No hay descripción disponible para esta categoría.' }}</p>
        </div>
        <div class="modal-footer">
          <button class="modal-btn" @click="closeModal">Cerrar</button>
          <button class="modal-btn primary" @click="viewCollectionFromModal">
            <span>Ver Colección</span>
            <i class="fas fa-arrow-right"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Skeleton Loader -->
    <div v-if="loading" class="skeleton-loader">
      <div class="skeleton-category">
        <div class="skeleton-banner"></div>
        <div class="skeleton-header"></div>
        <div class="skeleton-grid">
          <div v-for="j in 4" :key="j" class="skeleton-card">
            <div class="skeleton-image"></div>
            <div class="skeleton-details"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { categoriaIdActives } from '@/Services/CategoriaService';
import { useRouter } from 'vue-router';
import { useCartStore } from '@/stores/cart';
import { storeFavorite } from '@/Services/FavoriteService';

const router = useRouter();
const cartStore = useCartStore();
const idCategoria = ref(router.currentRoute.value.params.idCategoria);

// Estados
const categoria = ref(null);
const loading = ref(true);
const error = ref(null);
const searchQuery = ref('');
const currentImageIndex = ref({});
const favoriteProducts = ref([]);
const addingToCart = ref(null);
const expandedPriceDetails = ref([]); // Para controlar los detalles de precios expandidos

// Estados para el modal de descripción
const isModalOpen = ref(false);
const selectedCategoria = ref(null);
const maxDescriptionLength = 120; // Longitud máxima para mostrar en el banner

// Obtener la categoría por ID
const verCategoria = async () => {
  loading.value = true;
  error.value = null;
  try {
    const { data } = await categoriaIdActives(idCategoria.value);
    categoria.value = data.datos;
    
    // Inicializar índices de imágenes para cada producto
    if (categoria.value && categoria.value.productos) {
      categoria.value.productos.forEach(product => {
        currentImageIndex.value[product.id] = 0;
      });
    }
  } catch (err) {
    console.error('Error al cargar la categoría:', err);
    error.value = 'Hubo un error al cargar la categoría. Por favor, intenta de nuevo.';
  } finally {
    loading.value = false;
  }
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

// Obtener la última palabra de un título
const getLastWord = (title) => {
  if (!title) return '';
  const words = title.split(' ');
  return words[words.length - 1];
};

// Productos filtrados y ordenados
const filteredProducts = computed(() => {
  if (!categoria.value || !categoria.value.productos) return [];
  
  let result = [...categoria.value.productos];
  
  // Filtrar por búsqueda
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(product => 
      product.nombre.toLowerCase().includes(query) || 
      (product.descripcion && product.descripcion.toLowerCase().includes(query))
    );
  }
  
  return result;
});

// Resetear filtros
const resetFilters = () => {
  searchQuery.value = '';
};

// Ver detalles del producto
const viewProductDetails = (productId) => {
  router.push({ path: `/producto/${productId}` });
};

// Agregar al carrito
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

// Formatear precio
const formatPrice = (price) => {
  return new Intl.NumberFormat('es-BO', {
    style: 'currency',
    currency: 'BOB',
    minimumFractionDigits: 2
  }).format(price);
};

// Agregar a favoritos
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

// Obtener imágenes del producto
const getProductImages = (product) => {
  const mainImage = product.imagen_principal;
  const additionalImages = product.images?.map(img => img.imagen) || [];
  return [mainImage, ...additionalImages].filter(Boolean);
};

// Navegar a la imagen anterior
const prevImage = (product) => {
  const images = getProductImages(product);
  if (images.length > 1) {
    currentImageIndex.value[product.id] = (currentImageIndex.value[product.id] - 1 + images.length) % images.length;
  }
};

// Navegar a la siguiente imagen
const nextImage = (product) => {
  const images = getProductImages(product);
  if (images.length > 1) {
    currentImageIndex.value[product.id] = (currentImageIndex.value[product.id] + 1) % images.length;
  }
};

// Obtener la imagen actual
const getCurrentImage = (product) => {
  const images = getProductImages(product);
  return images[currentImageIndex.value[product.id]] || '/placeholder.jpg';
};

// Mostrar notificación
const showNotification = (message, type) => {
  // Implementación de notificaciones
  console.log(`${type}: ${message}`);
  // Aquí podrías implementar un sistema de notificaciones toast
};

// Observar cambios en el ID de categoría (para navegación entre categorías)
watch(() => router.currentRoute.value.params.idCategoria, (newId) => {
  if (newId && newId !== idCategoria.value) {
    idCategoria.value = newId;
    verCategoria();
  }
});

// Cargar datos al montar el componente
onMounted(() => {
  verCategoria();
  
  // Cerrar modal con tecla Escape
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isModalOpen.value) {
      closeModal();
    }
  });
});
</script>

<style scoped>
/* Base Container */
.catalog-container {
  width: 100%;
  max-width: 1440px;
  margin: 0 auto;
  padding: 0;
  font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

@media (min-width: 1440px) {
  .catalog-container {
    padding: 0 1rem;
  }
}

/* Category Banner Container */
.category-banner-container {
  margin-bottom: clamp(1.5rem, 3vw, 2.5rem);
  width: 100%;
  position: relative;
  overflow: hidden;
}

/* Banner principal con efectos mejorados */
.category-banner {
  position: relative;
  height: clamp(200px, 45vw, 600px);
  cursor: pointer;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  will-change: transform, box-shadow;
}

.category-banner:hover {
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
}

.category-banner img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s cubic-bezier(0.165, 0.84, 0.44, 1);
  will-change: transform;
}

.category-banner:hover img {
  transform: scale(1.05);
}

/* Overlay con gradiente mejorado y animaciones */
.banner-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, 
    rgba(0, 0, 0, 0.8) 0%,
    rgba(0, 0, 0, 0.6) 30%,
    rgba(0, 0, 0, 0.3) 60%,
    rgba(0, 0, 0, 0) 100%);
  display: flex;
  align-items: center;
  color: #fff;
  padding: clamp(1rem, 2vw, 2.5rem);
  transition: background 0.3s ease;
}

.category-banner:hover .banner-overlay {
  background: linear-gradient(90deg, 
    rgba(0, 0, 0, 0.85) 0%,
    rgba(0, 0, 0, 0.65) 30%,
    rgba(0, 0, 0, 0.35) 60%,
    rgba(0, 0, 0, 0) 100%);
}

/* Contenido del banner con animaciones */
.banner-content {
  max-width: min(90%, 600px);
  transform: translateY(0);
  opacity: 1;
  transition: transform 0.5s ease, opacity 0.5s ease;
}

.category-banner:hover .banner-content {
  transform: translateY(-5px);
}

.banner-title {
  font-size: clamp(1.2rem, 3vw, 2.5rem);
  font-weight: 800;
  margin-bottom: clamp(0.75rem, 2vw, 1.5rem);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  position: relative;
  display: inline-block;
  margin-left: clamp(1rem, 5vw, 3rem);
}

.banner-title::after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 0;
  width: 60px;
  height: 3px;
  background-color: var(--primary-color, #3498db);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.category-banner:hover .banner-title::after {
  transform: scaleX(1);
}

.banner-description-container {
  position: relative;
  margin-left: clamp(1rem, 5vw, 3rem);
}

.banner-description {
  font-size: clamp(1rem, 1.5vw, 1.25rem);
  max-width: min(90%, 60ch);
  margin-bottom: clamp(0.75rem, 2vw, 1.5rem);
  line-height: 1.6;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  opacity: 0.9;
}

.read-more-btn {
  background: none;
  border: none;
  color: var(--primary-color, #3498db);
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  margin-left: 0.25rem;
  font-size: 0.9em;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  transition: color 0.2s ease;
  text-decoration: underline;
  display: inline;
}

.read-more-btn:hover {
  color: var(--primary-hover-color, #2980b9);
}

/* Botón CTA mejorado */
.banner-cta {
  padding: clamp(0.5rem, 1vw, 0.75rem) clamp(1rem, 1.5vw, 1.5rem);
  background: var(--primary-color, #3498db);
  color: #fff;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  font-size: clamp(0.875rem, 1.5vw, 1rem);
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  width: fit-content;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  position: relative;
  overflow: hidden;
  z-index: 1;
  box-shadow: 0 4px 10px rgba(52, 152, 219, 0.3);
  margin-left: clamp(1rem, 5vw, 3rem);
}

.banner-cta::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: var(--primary-hover-color, #2980b9);
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

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
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
  padding: 1.25rem;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.5rem;
  color: #333;
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
  padding: 1.5rem;
  overflow-y: auto;
  color: #333;
  line-height: 1.6;
  font-size: 1rem;
}

.modal-footer {
  padding: 1rem 1.25rem;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.modal-btn {
  padding: 0.6rem 1.25rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid #ddd;
  background-color: white;
  color: #333;
}

.modal-btn:hover {
  background-color: #f5f5f5;
}

.modal-btn.primary {
  background-color: var(--primary-color, #3498db);
  color: white;
  border-color: var(--primary-color, #3498db);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.modal-btn.primary:hover {
  background-color: var(--primary-hover-color, #2980b9);
  border-color: var(--primary-hover-color, #2980b9);
}

.modal-btn.primary i {
  transition: transform 0.2s ease;
}

.modal-btn.primary:hover i {
  transform: translateX(3px);
}

/* Category Header */
.category-header {
  text-align: center;
  margin-bottom: clamp(1.5rem, 3vw, 2.5rem);
}

.category-header h2 {
  font-size: clamp(1.5rem, 3vw, 2.5rem);
  font-weight: 700;
  color: var(--text-color, #333);
  margin-bottom: 0.5rem;
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

.category-header h2:hover .text-accent::after {
  transform: scaleX(1);
}

.category-header p {
  font-size: clamp(1rem, 1.5vw, 1.25rem);
  color: #666;
  max-width: 700px;
  margin: 0 auto;
}

/* Products Grid */
.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 220px), 1fr));
  gap: clamp(0.75rem, 1.5vw, 1.5rem);
  margin-bottom: clamp(2rem, 4vw, 3rem);
  padding: 0.5rem;
}

/* Product Card */
.product-card {
  background: var(--background-color, white);
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 3px 6px var(--shadow-color, rgba(0, 0, 0, 0.1));
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
  opacity: 0;
  transform: translateY(20px);
  animation: fadeInUp 0.6s forwards;
  animation-delay: calc(var(--index, 0) * 0.1s);
  height: 100%;
  display: flex;
  flex-direction: column;
  will-change: transform, opacity;
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

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

/* Product Image */
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
  will-change: transform;
}

.product-card:hover .product-image img {
  transform: scale(1.05);
}

/* Navigation Buttons */
.nav-button {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.9);
  width: clamp(28px, 3vw, 36px);
  height: clamp(28px, 3vw, 36px);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.3s ease;
  z-index: 2;
  border: none;
  cursor: pointer;
  color: #2d3748;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  font-size: clamp(0.7rem, 1vw, 0.9rem);
}

.nav-button.prev {
  left: 0.5rem;
}

.nav-button.next {
  right: 0.5rem;
}

.product-card:hover .nav-button {
  opacity: 1;
}

.nav-button:hover {
  background-color: white;
  transform: translateY(-50%) scale(1.1);
  color: var(--primary-color, #3498db);
}

/* Badges */
.badges {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  z-index: 2;
}

.badge {
  padding: 0.25rem 0.5rem;
  font-size: 0.65rem;
  font-weight: 700;
  border-radius: 9999px;
  text-transform: uppercase;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  letter-spacing: 0.5px;
}

.badge-preventa {
  background: linear-gradient(45deg, #ed8936, #dd6b20);
  color: white;
}

/* Product Actions */
.product-actions-bottom {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 2;
}

.product-card:hover .product-actions-bottom,
.product-image:hover .product-actions-bottom {
  opacity: 1;
}

.action-button {
  background-color: rgba(255, 255, 255, 0.9);
  border: none;
  width: clamp(28px, 2.5vw, 35px);
  height: clamp(28px, 2.5vw, 35px);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(4px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  color: #2d3748;
  font-size: clamp(0.7rem, 1vw, 0.85rem);
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

.fav-btn.in-favorites {
  background-color: #e53e3e;
  color: white;
}

.action-button.adding {
  pointer-events: none;
}

/* Product Info */
.product-info {
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  background-color: var(--background-color, white);
}

.category {
  font-size: 0.7rem;
  color: #718096;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
}

.product-name {
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--text-color, #333);
  line-height: 1.4;
  transition: color 0.3s ease;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  height: 2.5rem;
  margin-bottom: 0.5rem;
}

.product-card:hover .product-name {
  color: var(--primary-color, #3498db);
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

/* Loading State */
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
  width: 50px;
  height: 50px;
  animation: spin 1s cubic-bezier(0.68, -0.55, 0.27, 1.55) infinite;
  margin-bottom: 1rem;
  box-shadow: 0 4px 10px rgba(52, 152, 219, 0.2);
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Error Message */
.error-message {
  text-align: center;
  padding: 2rem 1.5rem;
  background-color: #fff5f5;
  border-radius: 12px;
  margin-bottom: 2rem;
  box-shadow: 0 10px 25px rgba(254, 178, 178, 0.2);
  border: 1px solid #fed7d7;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  animation: fadeIn 0.5s ease;
}

.error-icon {
  font-size: 2.5rem;
  color: #e53e3e;
  margin-bottom: 0.5rem;
}

.retry-button {
  background: linear-gradient(45deg, var(--primary-color, #3498db), var(--primary-hover-color, #2980b9));
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
  margin-top: 0.75rem;
  box-shadow: 0 4px 10px rgba(52, 152, 219, 0.3);
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.retry-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(52, 152, 219, 0.4);
}

/* Skeleton Loader */
.skeleton-loader {
  padding: 1rem;
}

.skeleton-category {
  margin-bottom: 3rem;
}

.skeleton-banner {
  height: clamp(200px, 40vh, 400px);
  background: #eee;
  border-radius: 12px;
  margin-bottom: 1.5rem;
  animation: pulse 1.5s infinite;
}

.skeleton-header {
  height: 60px;
  background: #eee;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  animation: pulse 1.5s infinite;
}

.skeleton-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 220px), 1fr));
  gap: 1.5rem;
}

.skeleton-card {
  background: #f5f5f5;
  border-radius: 12px;
  overflow: hidden;
}

.skeleton-image {
  aspect-ratio: 1 / 1;
  background: #eee;
  animation: pulse 1.5s infinite;
}

.skeleton-details {
  padding: 1rem;
  height: 80px;
  background: #eee;
  animation: pulse 1.5s infinite;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Responsive Styles */
@media (min-width: 1200px) {
  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 1.5rem;
  }

  .product-info {
    padding: 1rem;
  }

  .product-name {
    font-size: 1rem;
    height: 2.8rem;
  }

  .price-value {
    font-size: 0.9rem;
  }

  .summary-price {
    font-size: 0.9rem;
  }

  .action-button {
    width: 35px;
    height: 35px;
    font-size: 0.875rem;
  }

  .nav-button {
    width: 35px;
    height: 35px;
  }
}

@media (min-width: 992px) and (max-width: 1199px) {
  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1.25rem;
  }

  .category-banner {
    height: clamp(200px, 50vw, 500px);
  }

  .banner-title {
    font-size: clamp(1.1rem, 2.8vw, 2.2rem);
  }

  .banner-overlay {
    background: linear-gradient(90deg, 
      rgba(0, 0, 0, 0.65) 0%,
      rgba(0, 0, 0, 0.3) 70%,
      rgba(0, 0, 0, 0.1) 100%);
  }
}

@media (min-width: 768px) and (max-width: 991px) {
  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 1rem;
  }

  .product-actions-bottom {
    opacity: 0.9;
  }

  .nav-button {
    opacity: 0.7;
  }

  .category-banner {
    height: clamp(180px, 50vw, 350px);
  }

  .banner-overlay {
    background: linear-gradient(90deg,
      rgba(0, 0, 0, 0.7) 0%,
      rgba(0, 0, 0, 0.4) 60%,
      rgba(0, 0, 0, 0.2) 100%);
    padding: clamp(0.75rem, 3vw, 1.5rem);
  }

  .banner-title {
    font-size: clamp(1rem, 2.5vw, 1.8rem);
    margin-bottom: clamp(0.5rem, 1.5vw, 1rem);
    margin-left: clamp(0.5rem, 3vw, 1.5rem);
  }

  .banner-description {
    font-size: clamp(0.875rem, 1.8vw, 1rem);
    margin-bottom: 1rem;
  }

  .banner-cta {
    padding: 0.6rem 1.25rem;
    font-size: 0.875rem;
    margin-left: clamp(0.5rem, 3vw, 1.5rem);
  }

  .modal-content {
    max-width: 90%;
  }
}

@media (min-width: 576px) and (max-width: 767px) {
  .products-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 0.75rem;
  }

  .product-actions-bottom {
    opacity: 1;
    padding: 0.4rem;
  }

  .action-button {
    width: 28px;
    height: 28px;
  }

  .nav-button {
    opacity: 0.8;
    width: 28px;
    height: 28px;
  }

  .category-banner {
    height: clamp(160px, 55vw, 280px);
  }

  .banner-overlay {
    padding: 0.75rem 1rem;
    background: linear-gradient(90deg,
      rgba(0, 0, 0, 0.75) 0%,
      rgba(0, 0, 0, 0.4) 100%);
  }

  .banner-title {
    font-size: clamp(0.9rem, 5vw, 1.4rem);
    margin-bottom: 0.5rem;
    margin-left: 0.5rem;
  }

  .banner-description {
    font-size: 0.8rem;
    margin-bottom: 0.75rem;
    -webkit-line-clamp: 2;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    overflow: hidden;
    margin-left: 0.5rem;
  }

  .banner-cta {
    padding: 0.4rem 0.8rem;
    font-size: 0.8rem;
    margin-left: 0.5rem;
  }

  .price-details.expanded {
    max-height: 350px;
  }
}

@media (max-width: 575px) {
  .products-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.5rem;
  }

  .category-banner {
    height: clamp(140px, 60vw, 240px);
  }

  .banner-overlay {
    padding: 0.5rem;
    background: linear-gradient(90deg,
      rgba(0, 0, 0, 0.8) 0%,
      rgba(0, 0, 0, 0.5) 100%);
  }

  .banner-title {
    font-size: clamp(0.85rem, 4.5vw, 1.2rem);
    margin-bottom: 0.4rem;
    margin-left: 0.3rem;
  }

  .banner-description-container {
    margin-left: 0.3rem;
  }

  .banner-description {
    font-size: 0.8rem;
    margin-bottom: 0.5rem;
    -webkit-line-clamp: 2;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .banner-cta {
    padding: 0.35rem 0.7rem;
    font-size: 0.75rem;
    margin-left: 0.3rem;
  }

  .modal-header h3 {
    font-size: 1.25rem;
  }

  .modal-body {
    padding: 1rem;
    font-size: 0.9rem;
  }

  .modal-footer {
    padding: 0.75rem 1rem;
  }

  .modal-btn {
    padding: 0.5rem 1rem;
    font-size: 0.85rem;
  }

  .prices-container {
    margin-top: 0.25rem;
  }

  .prices-header {
    padding: 0.3rem 0.5rem;
  }

  .prices-title {
    font-size: 0.7rem;
  }

  .toggle-prices-btn {
    width: 20px;
    height: 20px;
  }

  .price-details.expanded {
    max-height: 400px;
  }

  .product-name {
    font-size: 0.8rem;
    height: 2.2rem;
  }
}

@media (max-width: 480px) {
  .category-banner {
    height: clamp(120px, 55vw, 200px);
  }

  .banner-title {
    font-size: clamp(0.8rem, 4vw, 1.1rem);
    margin-bottom: 0.3rem;
  }

  .banner-description {
    font-size: 0.75rem;
    -webkit-line-clamp: 1;
    margin-bottom: 0.4rem;
  }

  .banner-cta {
    padding: 0.3rem 0.6rem;
    font-size: 0.7rem;
  }

  .product-actions-bottom {
    padding: 0.3rem;
    gap: 0.3rem;
  }

  .action-button {
    width: 26px;
    height: 26px;
    font-size: 0.7rem;
  }
}

@media (max-width: 360px) {
  .products-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.4rem;
  }

  .category-banner {
    height: clamp(100px, 50vw, 180px);
  }

  .banner-title {
    font-size: clamp(0.75rem, 4vw, 1rem);
    margin-bottom: 0.2rem;
  }

  .banner-description {
    display: none;
  }

  .banner-cta {
    padding: 0.25rem 0.5rem;
    font-size: 0.65rem;
  }

  .product-name {
    font-size: 0.7rem;
    height: 2rem;
  }

  .price-value,
  .summary-price {
    font-size: 0.7rem;
  }
}

/* Touch Device Optimizations */
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
    background: linear-gradient(to right, var(--primary-color, #3498db), var(--primary-hover-color, #2980b9));
  }

  .banner-cta::before {
    display: none;
  }
}

/* Accessibility Improvements */
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
  .modal-btn:hover {
    transform: none;
  }

  .fade-enter-active,
  .fade-leave-active {
    transition: none;
  }

  .skeleton-banner,
  .skeleton-header,
  .skeleton-image,
  .skeleton-details {
    animation: none;
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

/* Print styles */
@media print {
  .category-banner {
    height: auto;
    box-shadow: none;
  }

  .banner-overlay {
    position: relative;
    background: none;
    color: black;
  }

  .banner-title {
    color: black;
    text-shadow: none;
  }

  .banner-cta {
    display: none;
  }

  .product-actions-bottom,
  .nav-button {
    display: none;
  }
}
</style>