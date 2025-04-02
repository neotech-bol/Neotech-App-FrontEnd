<template>
  <section class="recently-arrived">
    <div class="container">
      <h2 class="section-title">Recién <span class="text-accent">Llegados</span></h2>
      <p class="section-description">Descubre nuestras últimas novedades en movilidad inteligente</p>

      <!-- Loading State -->
      <div v-if="loading" class="loading-overlay">
        <div class="spinner"></div>
        <p>Cargando productos recientes...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error-message">
        <i class="fas fa-exclamation-circle error-icon"></i>
        <p>{{ error }}</p>
        <button @click="fetchRecentProducts" class="retry-button"> 
          <i class="fas fa-sync-alt"></i> Intentar de nuevo
        </button>
      </div>

      <!-- Products Grid -->
      <div v-else class="products-grid">
        <div v-for="(product, index) in recentProducts" :key="product.id" class="product-card"
          :style="{ '--index': index }" @click="viewProduct(product.id)">
          <div class="product-image-wrapper">
            <div class="product-image">
              <transition name="fade" mode="out-in">
                <img :key="currentImageIndex[product.id]" :src="getCurrentImage(product)" :alt="product.nombre"
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
                <span class="badge badge-new">
                  <i class="fas fa-star-of-life"></i> NUEVO
                </span>
                <span class="badge badge-preventa">
                  <i class="fas fa-tag"></i> PREVENTA
                </span>
              </div>

              <!-- Product Actions -->
              <div class="product-actions-bottom">
                <button class="action-button cart-btn" @click.stop="addToCart(product)" aria-label="Agregar al carrito"
                  :class="{ 'adding': addingToCart === product.id }">
                  <i class="fas" :class="addingToCart === product.id ? 'fa-spinner fa-spin' : 'fa-shopping-cart'"></i>
                </button>
                <button class="action-button view-btn" @click.stop="viewProduct(product.id)" aria-label="Ver producto">
                  <i class="fas fa-eye"></i>
                </button>
                <button class="action-button fav-btn" @click.stop="addToFavorites(product.id)"
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
          <!--   <p v-if="product.descripcion" class="product-description">
              {{ truncateDescription(product.descripcion, 60) }}
            </p> -->
            
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
                        <span class="quantity-value">{{ product.cantidad_minima }} unidades</span>
                      </div>
                      <div class="quantity-item">
                        <span class="quantity-label">Máximo:</span>
                        <span class="quantity-value">{{ product.cantidad_maxima }} unidades</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- Precio Preventa Especial -->
                <div class="price-card special">
                  <div class="price-card-header">
                    <span class="price-type">Preventa Estándar</span>
                    <span class="price-value">{{ formatPrice(product.precio_preventa) }}</span>
                  </div>
                  <div class="price-card-body">
                    <div class="quantity-range">
                      <div class="quantity-item">
                        <span class="quantity-label">Mínimo:</span>
                        <span class="quantity-value">{{ product.cantidad_minima_preventa }} unidades</span>
                      </div>
                      <div class="quantity-item">
                        <span class="quantity-label">Máximo:</span>
                        <span class="quantity-value">{{ product.cantidad_maxima_preventa }} unidades</span>
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
                    <span class="summary-quantity">{{ product.cantidad_minima }}+ uds</span>
                  </div>
                </div>
                <div class="summary-item special">
                  <span class="summary-label">Estándar:</span>
                  <div class="summary-content">
                    <span class="summary-price">{{ formatPrice(product.precio_preventa) }}</span>
                    <span class="summary-quantity">{{ product.cantidad_minima_preventa }}-{{ product.cantidad_maxima_preventa }} uds</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useCartStore } from '@/stores/cart';
import { recientesProductos } from '@/Services/ProductoService';
import { storeFavorite } from '@/Services/FavoriteService';
import bootstrapBundleMin from 'bootstrap/dist/js/bootstrap.bundle.min';

const router = useRouter();
const cartStore = useCartStore();
const recentProducts = ref([]);
const loading = ref(true);
const error = ref(null);
const addingToCart = ref(null);
const favoriteProducts = ref([]);
const currentImageIndex = ref({});
const expandedPriceDetails = ref([]);

onMounted(async () => {
  await fetchRecentProducts();
});

const fetchRecentProducts = async () => {
  loading.value = true;
  error.value = null;
  try {
    const { data } = await recientesProductos('');
    recentProducts.value = data.datos;
    initializeImageIndexes();
  } catch (err) {
    error.value = 'Error al cargar productos recientes';
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const initializeImageIndexes = () => {
  recentProducts.value.forEach(product => {
    currentImageIndex.value[product.id] = 0;
  });
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

const addToCart = async (product) => {
  addingToCart.value = product.id;
  try {
    const productWithMinQty = { ...product, quantity: product.cantidad_minima || 1 };
    await cartStore.addToCart(productWithMinQty);
    showNotification(`${product.nombre} agregado al carrito`, 'success');
  } catch (error) {
    console.error('Error al agregar al carrito:', error);
    showNotification('Error al agregar al carrito', 'error');
  } finally {
    setTimeout(() => addingToCart.value = null, 800);
  }
};

const viewProduct = (id) => {
  router.push(`/producto/${id}`);
};

const addToFavorites = async (productId) => {
  try {
    await storeFavorite({ producto_id: productId });
    const index = favoriteProducts.value.indexOf(productId);
    if (index > -1) {
      favoriteProducts.value.splice(index, 1);
    } else {
      favoriteProducts.value.push(productId);
    }
    showNotification('Producto agregado a favoritos', 'success');
  } catch (err) {
    console.error('Error en favoritos:', err);
    showNotification('Error al agregar a favoritos', 'error');
  }
};

const formatPrice = (price) => {
  return new Intl.NumberFormat('es-BO', {
    style: 'currency',
    currency: 'BOB',
    minimumFractionDigits: 2
  }).format(price);
};

// Función para truncar descripción
const truncateDescription = (text, maxLength) => {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

const showNotification = (message, type) => {
  // Crear un ID único para el toast
  const toastId = `toast-${Date.now()}`;

  // Determinar la clase de color según el tipo
  let bgClass = 'bg-primary text-white';
  let icon = 'info-circle';

  if (type === 'success') {
    bgClass = 'bg-success text-white';
    icon = 'check-circle';
  } else if (type === 'error') {
    bgClass = 'bg-danger text-white';
    icon = 'exclamation-circle';
  } else if (type === 'warning') {
    bgClass = 'bg-warning';
    icon = 'exclamation-triangle';
  }

  // Crear el elemento toast
  const toastHTML = `
    <div id="${toastId}" class="toast align-items-center ${bgClass} border-0" role="alert" aria-live="assertive" aria-atomic="true">
      <div class="d-flex">
        <div class="toast-body">
          <i class="fas fa-${icon} me-2"></i> ${message}
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
    </div>
  `;

  // Crear contenedor de toasts si no existe
  let toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
    toastContainer.style.zIndex = '1080';
    document.body.appendChild(toastContainer);
  }

  // Añadir el toast al contenedor
  toastContainer.innerHTML += toastHTML;

  // Inicializar y mostrar el toast
  const toastElement = document.getElementById(toastId);
  const bsToast = new bootstrapBundleMin.Toast(toastElement, {
    autohide: true,
    delay: 3000
  });

  bsToast.show();

  // También mantener el log en consola para debugging
  console.log(`${type}: ${message}`);
};
</script>

<style scoped>
/* Base Styles */
.recently-arrived {
  padding: 3rem 0;
  position: relative;
}

.container {
  max-width: 1440px;
  margin: 0 auto;
  /*   padding: 0 1rem; */
}

/* Section Header */
.section-title {
  font-size: clamp(1.75rem, 5vw, 2.5rem);
  font-weight: 800;
  color: var(--text-color);
  text-align: center;
  margin-bottom: 0.75rem;
  position: relative;
  display: inline-block;
  left: 50%;
  transform: translateX(-50%);
}

.text-accent {
  color: var(--primary-color);
  position: relative;
  display: inline-block;
  background: var(--primary-color);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.text-accent::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 100%;
  height: 2px;
  background: var(--primary-color);
  transform: scaleX(0);
  transition: transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  transform-origin: left;
}

.section-title:hover .text-accent::after {
  transform: scaleX(1);
}

.section-description {
  font-size: clamp(0.875rem, 3vw, 1.125rem);
  color: #4a5568;
  text-align: center;
  max-width: 600px;
  margin: 0 auto 2rem;
  line-height: 1.6;
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
  border-top: 4px solid #3498db;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1s cubic-bezier(0.68, -0.55, 0.27, 1.55) infinite;
  margin-bottom: 1rem;
  box-shadow: 0 4px 10px rgba(52, 152, 219, 0.2);
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
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
  background: linear-gradient(45deg, #3498db, #2980b9);
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

.retry-button:active {
  transform: translateY(0);
}

/* Products Grid */
.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

/* Product Card */
.product-card {
  background: var(--background-color);
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 3px 6px var(--shadow-color);
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

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px var(--shadow-color);
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
  background-color: var(--background-color);
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
  color: var(--text-color);
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

@media (min-width: 768px) {
  .product-description {
    font-size: 0.8rem;
    margin-bottom: 0.75rem;
  }
  
  .prices-title {
    font-size: 0.8rem;
  }
  
  .price-type {
    font-size: 0.75rem;
  }
  
  .price-value {
    font-size: 0.9rem;
  }
  
  .quantity-item {
    font-size: 0.7rem;
  }
  
  .summary-item {
    font-size: 0.75rem;
  }
  
  .summary-quantity {
    font-size: 0.65rem;
  }
}

@media (min-width: 1200px) {
  .price-value {
    font-size: 1rem;
  }
  
  .summary-price {
    font-size: 0.9rem;
  }
}

/* Responsive Styles - Enhanced for better mobile experience */
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
  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1.25rem;
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
}

@media (min-width: 576px) and (max-width: 767px) {
  .recently-arrived {
    padding: 2.5rem 0;
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
  
  .price-details.expanded {
    max-height: 350px;
  }
}

@media (min-width: 480px) and (max-width: 575px) {
  .recently-arrived {
    padding: 2rem 0;
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
}

@media (min-width: 400px) and (max-width: 479px) {
  .recently-arrived {
    padding: 1.5rem 0;
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
}

@media (max-width: 399px) {
  .recently-arrived {
    padding: 1.5rem 0;
  }

  .products-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.5rem;
  }

  .product-info {
    padding: 0.4rem;
  }

  .product-name {
    font-size: 0.75rem;
    height: 2.1rem;
    margin-bottom: 0.25rem;
    -webkit-line-clamp: 2;
  }

  .category {
    font-size: 0.6rem;
    margin-bottom: 0.25rem;
  }

  .action-button {
    width: 24px;
    height: 24px;
    font-size: 0.65rem;
  }

  .nav-button {
    width: 24px;
    height: 24px;
  }

  .badge {
    padding: 0.15rem 0.3rem;
    font-size: 0.55rem;
  }
  
  .prices-container {
    margin-top: 0.25rem;
  }
  
  .prices-header {
    padding: 0.25rem;
  }
  
  .prices-title {
    font-size: 0.65rem;
  }
  
  .toggle-prices-btn {
    width: 18px;
    height: 18px;
  }
  
  .price-details.expanded {
    max-height: 450px;
  }
  
  .price-card-header {
    padding: 0.25rem;
  }
  
  .price-card-body {
    padding: 0.25rem;
  }
  
  .prices-summary {
    padding: 0.25rem;
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
  .action-button:hover {
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
</style>