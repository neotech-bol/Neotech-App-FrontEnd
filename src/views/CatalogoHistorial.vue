<template>
  <div class="catalog-container">
    <!-- Loading Overlay -->
    <div v-if="loading" class="loading-overlay">
      <div class="spinner"></div>
      <p>Cargando catálogo...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-message">
      <i class="fas fa-exclamation-circle error-icon"></i>
      <p>{{ error }}</p>
      <button @click="listarCatalogo" class="retry-button">
        <i class="fas fa-sync-alt"></i> Reintentar
      </button>
    </div>

    <!-- Main Catalog Content -->
    <div v-else class="catalog-content">
      <div v-for="catalog in datos" :key="catalog.id" class="catalog-section">
        <div v-for="(categoria, index) in catalog.categorias" :key="index" class="category-wrapper">
          <!-- Banner con descripción truncada -->
          <div class="category-banner-container">
            <div class="category-banner" @click="viewCollection">
              <img :src="categoria.banner" :alt="`Banner de ${categoria.nombre}`" loading="lazy" />
              <div class="banner-overlay">
                <div class="banner-content">
                  <h2>{{ categoria.nombre }}</h2>
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
<!--                   <button class="banner-cta">
                    <span>Ver Colección</span>
                    <i class="fas fa-arrow-right"></i>
                  </button> -->
                </div>
              </div>
            </div>
          </div>

          <!-- Category Header -->
          <div class="category-header">
            <h2>
              {{ categoria.titulo.split(" ").slice(0, -1).join(" ") }}
              <span class="text-accent">{{ getLastWord(categoria.titulo) }}</span>
            </h2>
            <p>{{ categoria.subtitulo }}</p>
          </div>

          <!-- Products Grid - Actualizado con estilos de productos recientes -->
          <div class="products-grid">
            <div v-for="(product, productIndex) in categoria.productos" 
                 :key="product.id" 
                 class="product-card"
                 :style="{ '--index': productIndex }"
                 :class="{ 'product-active': product.activo }"
                 @click="verProducto(product.id)">
              <div class="product-image-wrapper">
                <div class="product-image">
                  <transition name="fade" mode="out-in">
                    <img :key="currentImageIndex[product.id]"
                         :src="getCurrentImage(product)" 
                         :alt="product.nombre"
                         loading="lazy">
                  </transition>
                  
                  <!-- Navigation Buttons -->
                  <button class="nav-button prev" @click.stop="prevImage(product)" 
                          v-if="getProductImages(product).length > 1">
                    <i class="fas fa-chevron-left"></i>
                  </button>
                  <button class="nav-button next" @click.stop="nextImage(product)"
                          v-if="getProductImages(product).length > 1">
                    <i class="fas fa-chevron-right"></i>
                  </button>

                  <!-- Badges -->
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
                  
                  <!-- Active Indicator -->
                  <span v-if="product.activo" class="active-indicator">Activo</span>
                  
                  <!-- Product Actions -->
                  <div class="product-actions-bottom">
                    <button class="action-button cart-btn" 
                            @click.stop="addToCart(product)" 
                            aria-label="Agregar al carrito">
                      <i class="fas fa-shopping-cart"></i>
                    </button>
                    <button class="action-button view-btn" 
                            @click.stop="verProducto(product.id)" 
                            aria-label="Ver producto">
                      <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-button fav-btn" 
                            @click.stop="fororiteUser(product.id)" 
                            aria-label="Agregar a favoritos">
                      <i class="fas fa-heart"></i>
                    </button>
                  </div>
                </div>
              </div>
              <!-- Product Info -->
              <div class="product-info">
                <div class="category">
                  <i class="fas fa-tag"></i> {{ categoria?.nombre || 'Sin categoría' }}
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
                    <div class="price-card">
                      <div class="price-card-header" v-if="product.precio_preventa">
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
                            <span class="quantity-value">{{ product.cantidad_maxima  }} unidades</span>
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
                 <!--        <span class="summary-quantity">{{ product.cantidad_minima || 1 }}+ uds</span> -->
                      </div>
                    </div>
                    <div class="summary-item special" v-if="product.precio">
                      <span class="summary-label">Especial:</span>
                      <div class="summary-content">
                        <span class="summary-price">{{ formatPrice(product.precio) }}</span>
                      <!--   <span class="summary-quantity">{{ product.cantidad_minima_preventa || product.cantidad_minima || 1 }}+ uds</span> -->
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Skeleton Loader -->
    <div v-if="loading" class="skeleton-loader">
      <div v-for="i in 2" :key="i" class="skeleton-category">
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

    <!-- Modal para descripción completa -->
    <div class="description-modal" v-if="isModalOpen && selectedCategoria" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ selectedCategoria.nombre }}</h3>
          <button class="close-btn" @click="closeModal">
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
import { ref, onMounted, watch, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useCartStore } from '@/stores/cart';
import { indexCatalogoItems } from '@/Services/CatalogoService';
import { storeFavorite } from '@/Services/FavoriteService';
import { indexRatings, storeRating } from '@/Services/RatingService';
import { showCatalogosHistoriales } from '@/Services/CatalogoHistorialesService';

const router = useRouter();
const cartStore = useCartStore();
const datos = ref([]);
const fovoritesForm = ref({});
const userRatings = ref([]);
const currentImageIndex = ref({});
const loading = ref(true);
const error = ref(null);
const idCatalogoHistorial = ref(null);
const favoriteProducts = ref([]);
const isMobile = ref(false);
const expandedPriceDetails = ref([]); // Para controlar los detalles de precios expandidos

// Estados para el modal de descripción
const isModalOpen = ref(false);
const selectedCategoria = ref(null);
const maxDescriptionLength = computed(() => isMobile.value ? 80 : 120); // Longitud máxima para mostrar en el banner

onMounted(() => {
  idCatalogoHistorial.value = router.currentRoute.value.params.idCatalogoHistorial;
  listarCatalogo();
  indexRatingUser();
  checkMobile();

  // Verificar si es dispositivo móvil al cambiar el tamaño de la ventana
  window.addEventListener('resize', checkMobile);

  // Cerrar modal con tecla Escape
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isModalOpen.value) {
      closeModal();
    }
  });
});

// Verificar si es dispositivo móvil
const checkMobile = () => {
  isMobile.value = window.innerWidth < 768;
};

// Métodos para la descripción truncada
const getTruncatedDescription = (descripcion) => {
  if (!descripcion) return '';

  if (descripcion.length > maxDescriptionLength.value) {
    return descripcion.substring(0, maxDescriptionLength.value) + '...';
  }

  return descripcion;
};

// Verificar si la descripción está truncada
const isDescriptionTruncated = (descripcion) => {
  return descripcion && descripcion.length > maxDescriptionLength.value;
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
  // Implementar lógica para ver la colección
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

const listarCatalogo = async () => {
  loading.value = true;
  error.value = null;
  try {
    let response;
    if (idCatalogoHistorial.value) {
      // Fetch historical catalog
      response = await showCatalogosHistoriales(idCatalogoHistorial.value);
      const catalogData = response.data?.datos?.catalogo;
      if (!catalogData) {
        throw new Error('No catalog data found in response');
      }

      // Assign the catalogo object directly, wrapped in an array to maintain consistency
      datos.value = [catalogData];
    } else {
      // Fetch current catalog
      response = await indexCatalogoItems('');
      datos.value = response.data.datos || response.data || [];
    }

    // Validate and process the data
    if (!Array.isArray(datos.value)) {
      console.error('Datos is not an array:', datos.value);
      datos.value = [];
      throw new Error('Invalid data format received');
    }

    // Initialize image indices for products
    datos.value.forEach(catalog => {
      if (catalog.categorias && Array.isArray(catalog.categorias)) {
        catalog.categorias.forEach(categoria => {
          if (categoria.productos && Array.isArray(categoria.productos)) {
            categoria.productos.forEach(product => {
              if (!currentImageIndex.value[product.id]) {
                currentImageIndex.value[product.id] = 0;
              }
            });
          } else {
            console.warn('No products found in category:', categoria);
            categoria.productos = [];
          }
        });
      } else {
        console.warn('No categories found in catalog:', catalog);
        catalog.categorias = [];
      }
    });

  } catch (err) {
    console.error('Error al listar el catálogo:', err);
    error.value = 'Hubo un error al cargar el catálogo. Por favor, intente de nuevo.';
    datos.value = [];
  } finally {
    loading.value = false;
  }
};

const verProducto = param => {
  router.push({ path: `/producto/${param}` });
};

const fororiteUser = async (idProducto) => {
  try {
    fovoritesForm.value = { "producto_id": idProducto };
    await storeFavorite(fovoritesForm.value);
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

const showNotification = (message, type) => {
  console.log(`${type}: ${message}`);
  // Implementar sistema de notificaciones aquí
};

const addToCart = (product) => {
  const cantidadMinima = product.cantidad_minima || 1;
  const productWithMinQuantity = { ...product, quantity: cantidadMinima };
  cartStore.addToCart(productWithMinQuantity);
  showNotification(`${product.nombre} agregado al carrito`, 'success');
};

const formatPrice = (price) => {
  return new Intl.NumberFormat('es-BO', {
    style: 'currency',
    currency: 'BOB',
    minimumFractionDigits: 2
  }).format(price);
};

const viewCollection = () => {
  // Implementar lógica para ver la colección
};

const storeRatingUser = async (productID, rating) => {
  try {
    await storeRating({ producto_id: productID, rating });
    await indexRatingUser();
    showNotification('Calificación guardada', 'success');
  } catch (error) {
    console.error('Error al calificar el producto:', error.response?.data?.message || error);
    showNotification('Error al guardar calificación', 'error');
  }
};

const indexRatingUser = async () => {
  try {
    const { data } = await indexRatings();
    userRatings.value = data;
  } catch (error) {
    console.error('Error al obtener las calificaciones:', error);
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
  return images[currentImageIndex.value[product.id]] || product.imagen_principal || '/placeholder.jpg';
};

const getLastWord = (title) => {
  const words = title.split(' ');
  return words[words.length - 1];
};

watch(() => router.currentRoute.value.params.idCatalogoHistorial, (newId) => {
  idCatalogoHistorial.value = newId;
  listarCatalogo();
});
</script>

<style scoped>
/* Base Container */
.catalog-container {
  max-width: 1440px;
  margin: 0 auto;
  padding: 0.5rem;
  font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

/* Container para mantener proporciones consistentes */
.category-banner-container {
  margin-bottom: 2rem;
  width: 100%;
  position: relative;
  padding: 0;
}

/* Category Banner - Corregido para ser responsive */
.category-banner {
  position: relative;
  height: clamp(200px, 40vh, 500px);
  cursor: pointer;
  overflow: hidden;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  width: 100%;
}

.category-banner img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.8s cubic-bezier(0.165, 0.84, 0.44, 1);
}

/* Overlay con gradiente mejorado y animaciones */
.banner-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to right,
    rgba(0, 0, 0, 0.8) 0%,
    rgba(0, 0, 0, 0.6) 30%,
    rgba(0, 0, 0, 0.3) 60%,
    rgba(0, 0, 0, 0) 100%
  );
  display: flex;
  align-items: center;
  color: #fff;
  padding: 2rem;
  transition: background 0.3s ease;
}

.category-banner:hover .banner-overlay {
  background: linear-gradient(
    to right,
    rgba(0, 0, 0, 0.85) 0%,
    rgba(0, 0, 0, 0.65) 30%,
    rgba(0, 0, 0, 0.35) 60%,
    rgba(0, 0, 0, 0) 100%
  );
}

/* Contenido del banner con animaciones */
.banner-content {
  max-width: 600px;
  transform: translateY(0);
  opacity: 1;
  transition: transform 0.5s ease, opacity 0.5s ease;
}

.category-banner:hover .banner-content {
  transform: translateY(-5px);
}

.banner-overlay h2 {
  font-size: clamp(1.5rem, 4vw, 3rem);
  font-weight: 800;
  margin-bottom: 1rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  position: relative;
  display: inline-block;
}

.banner-overlay h2::after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 0;
  width: 60px;
  height: 3px;
  background-color: #3498db;
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.category-banner:hover .banner-overlay h2::after {
  transform: scaleX(1);
}

.banner-description-container {
  position: relative;
  margin-bottom: 1.5rem;
}

.banner-description {
  font-size: clamp(0.9rem, 2vw, 1.25rem);
  max-width: 60ch;
  line-height: 1.6;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  opacity: 0.9;
}

.read-more-btn {
  background: none;
  border: none;
  color: #3498db;
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
  color: #2980b9;
}

/* Botón CTA mejorado */
.banner-cta {
  padding: 0.75rem 1.5rem;
  background: #3498db;
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
  from { transform: translateY(30px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
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

/* Category Header */
.category-header {
  text-align: center;
  margin-bottom: 2rem;
}

.category-header h2 {
  font-size: clamp(1.75rem, 3vw, 2.5rem);
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 0.5rem;
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

.category-header p {
  font-size: clamp(1rem, 1.5vw, 1.25rem);
  color: #666;
  max-width: 700px;
  margin: 0 auto;
}

/* Products Grid - Actualizado con estilos de productos recientes */
.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

/* Product Card */
.product-card {
  background: white;
  border-radius: 10px;
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

/* Estilo para productos activos */
.product-active {
  box-shadow: 0 0 0 2px #27ae60, 0 3px 6px rgba(0, 0, 0, 0.05);
}

.active-indicator {
  position: absolute;
  top: 0.5rem;
  left: 0.5rem;
  background-color: #27ae60;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.65rem;
  font-weight: 700;
  z-index: 2;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-transform: uppercase;
  letter-spacing: 0.5px;
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
  width: 30px;
  height: 30px;
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
  color: #3498db;
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

.badge-new {
  background: linear-gradient(45deg, #48bb78, #38a169);
  color: white;
  animation: pulse 2s infinite;
}

.badge-sale {
  background: linear-gradient(45deg, #ed8936, #dd6b20);
  color: white;
}

.badge-preventa {
  background: linear-gradient(45deg, #ed8936, #dd6b20);
  color: white;
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
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(4px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  color: #2d3748;
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
  color: #2d3748;
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
  color: #3498db;
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

/* Loading Overlay */
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
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Error State */
.error-message {
  text-align: center;
  padding: 3rem 2rem;
  background-color: #fff5f5;
  border-radius: 12px;
  margin-bottom: 2rem;
  border: 1px solid #fed7d7;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.error-icon {
  font-size: 3rem;
  color: #e53e3e;
}

.retry-button {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
  margin-top: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.retry-button:hover {
  background-color: #2980b9;
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
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
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 1rem;
}

.skeleton-card {
  background: #f5f5f5;
  border-radius: 10px;
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
  .catalog-container {
    padding: 1.5rem;
  }
  
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

  .action-button {
    width: 35px;
    height: 35px;
    font-size: 0.875rem;
  }

  .nav-button {
    width: 35px;
    height: 35px;
  }

  .badge {
    padding: 0.35rem 0.7rem;
    font-size: 0.7rem;
  }
}

@media (min-width: 992px) and (max-width: 1199px) {
  .catalog-container {
    padding: 1.25rem;
  }
  
  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1.25rem;
  }
}

@media (min-width: 768px) and (max-width: 991px) {
  .catalog-container {
    padding: 1rem;
  }
  
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
    height: clamp(200px, 40vh, 400px);
  }
  
  .banner-overlay {
    padding: 1.5rem;
  }
}

@media (min-width: 576px) and (max-width: 767px) {
  .catalog-container {
    padding: 0.75rem;
  }
  
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
    height: clamp(180px, 35vh, 350px);
  }
  
  .banner-overlay {
    background: linear-gradient(
      to right,
      rgba(0, 0, 0, 0.85) 0%,
      rgba(0, 0, 0, 0.7) 40%,
      rgba(0, 0, 0, 0.4) 70%,
      rgba(0, 0, 0, 0.2) 100%
    );
    padding: 1.25rem;
  }
  
  .banner-description {
    font-size: 0.9rem;
    margin-bottom: 1rem;
  }
  
  .banner-cta {
    padding: 0.6rem 1.25rem;
    font-size: 0.875rem;
  }
}

@media (max-width: 575px) {
  .banner-overlay {
    background: linear-gradient(
      to right,
      rgba(0, 0, 0, 0.9) 0%,
      rgba(0, 0, 0, 0.8) 60%,
      rgba(0, 0, 0, 0.6) 100%
    );
    padding: 1rem;
  }
  
  .banner-content {
    max-width: 100%;
  }
  
  .banner-description {
    -webkit-line-clamp: 2;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    overflow: hidden;
    max-width: 100%;
  }
}

@media (min-width: 480px) and (max-width: 575px) {
  .catalog-container {
    padding: 0.5rem;
  }
  
  .products-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 0.5rem;
  }

  .product-info {
    padding: 0.5rem;
  }

  .product-name {
    font-size: 0.8rem;
    height: 2.2rem;
    margin-bottom: 0.25rem;
  }

  .category {
    font-size: 0.65rem;
    margin-bottom: 0.25rem;
  }

  .action-button {
    width: 26px;
    height: 26px;
    font-size: 0.7rem;
  }

  .nav-button {
    width: 26px;
    height: 26px;
  }

  .badge {
    padding: 0.2rem 0.4rem;
    font-size: 0.6rem;
  }
  
  .category-banner {
    height: clamp(160px, 30vh, 300px);
  }
  
  .banner-overlay h2 {
    font-size: 1.25rem;
    margin-bottom: 0.5rem;
  }
  
  .banner-description {
    font-size: 0.8rem;
    margin-bottom: 0.75rem;
  }
  
  .banner-cta {
    padding: 0.5rem 1rem;
    font-size: 0.8rem;
  }
}

@media (max-width: 479px) {
  .catalog-container {
    padding: 0.5rem;
  }
  
  .products-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.5rem;
  }

  .product-info {
    padding: 0.5rem;
  }

  .product-name {
    font-size: 0.8rem;
    height: 2.2rem;
    margin-bottom: 0.25rem;
  }

  .category {
    font-size: 0.65rem;
    margin-bottom: 0.25rem;
  }
  
  .category-banner {
    height: clamp(150px, 30vh, 250px);
  }
  
  .banner-description {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
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

  .action-button:active {
    transform: scale(0.95);
  }

  .product-card:active {
    transform: scale(0.98);
  }
  
  .category-banner:hover {
    transform: none;
  }
  
  .category-banner:hover img {
    transform: none;
  }
  
  .banner-cta:active {
    transform: scale(0.95);
  }
}

/* Accessibility Improvements */
@media (prefers-reduced-motion: reduce) {
  .product-card {
    animation: none;
    opacity: 1;
    transform: none;
  }

  .product-card:hover {
    transform: none;
  }

  .product-card:hover .product-image img {
    transform: none;
  }

  .spinner {
    animation: none;
  }

  .badge-new {
    animation: none;
  }

  .retry-button:hover,
  .action-button:hover,
  .banner-cta:hover {
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
  
  .category-banner:hover {
    transform: none;
  }
  
  .category-banner:hover img {
    transform: none;
  }
  
  .banner-overlay h2::after {
    transition: none;
  }
  
  .banner-cta::before {
    transition: none;
  }
  
  .banner-cta i {
    transition: none;
  }
  
  .price-details {
    transition: none;
  }
}
</style>