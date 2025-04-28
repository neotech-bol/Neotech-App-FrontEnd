<template>
  <div class="favorites-container">
    <header class="favorites-header">
      <div class="header-content">
        <h1>Mis Favoritos</h1>
        <span class="favorites-count">{{ favorites.length }} items</span>
      </div>
      <div class="header-actions">
        <button @click="goToProducts" class="browse-button">
          <i class="fas fa-store"></i> Seguir comprando
        </button>
      </div>
    </header>

    <transition-group name="fade" tag="div" class="products-grid" mode="out-in">
      <div v-for="product in favorites" :key="product.producto.id" class="product-card">
        <div class="image-container">
          <img :src="product.producto.imagen_principal" :alt="product.producto.nombre" loading="lazy" />
          
          <!-- Product Actions -->
          <div class="product-actions">
            <button @click="viewProductDetails(product.producto.id)" class="action-button view-button" aria-label="Ver detalles del producto">
              <i class="fas fa-eye"></i>
            </button>
            <button @click="addToCart(product.producto)" class="action-button cart-button" :disabled="addingToCart === product.producto.id" aria-label="Añadir al carrito">
              <i class="fas fa-shopping-cart"></i>
            </button>
          </div>

          <!-- Remove Button -->
          <button @click="removeFromFavorites(product.id)" class="remove-favorite-button" aria-label="Eliminar de favoritos">
            <i class="fas fa-heart-broken"></i>
          </button>
          
          <!-- Product Badges -->
          <div class="product-badges">
            <span v-if="product.producto.estado === 1" class="badge badge-in-stock">
              <i class="fas fa-check-circle"></i> Disponible
            </span>
            <span v-if="isNewProduct(product.producto)" class="badge badge-new">
              <i class="fas fa-star"></i> NUEVO
            </span>
            <span v-if="hasDiscount(product.producto)" class="badge badge-sale">
              <i class="fas fa-bolt"></i> -{{ calculateDiscount(product.producto) }}%
            </span>
            <span v-if="hasPreventaPrices(product.producto)" class="badge badge-preventa">
              <i class="fas fa-tag"></i> PREVENTA
            </span>
          </div>
        </div>

        <div class="product-info">
          <div class="category" v-if="product.producto.categoria">
            <i class="fas fa-tag"></i> {{ product.producto.categoria.nombre || 'Sin categoría' }}
          </div>
          
          <h3 class="product-name" :title="product.producto.nombre">{{ product.producto.nombre }}</h3>
          
          <div class="rating" v-if="product.producto.rating">
            <div class="stars">
              <span v-for="star in 5" :key="star" class="star" :class="{ filled: star <= (product.producto.rating || 0) }">★</span>
            </div>
            <span class="rating-count">{{ product.producto.total_ratings || 0 }} calificaciones</span>
          </div>
          
          <!-- Prices Container -->
          <div class="prices-container">
            <div class="prices-header">
              <span class="prices-title">Precios de Preventa</span>
              <button class="toggle-prices-btn" @click.stop="togglePriceDetails(product.producto.id)" aria-label="Alternar detalles de precios">
                <i class="fas" :class="isPriceExpanded(product.producto.id) ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
              </button>
            </div>
            
            <div class="price-details" :class="{ expanded: isPriceExpanded(product.producto.id) }">
              <!-- Standard Preventa Price -->
              <div class="price-card" v-if="product.producto.precio">
                <div class="price-card-header">
                  <span class="price-type">Preventa Estándar</span>
                  <span class="price-value">{{ formatPrice(product.producto.precio) }}</span>
                </div>
                <div class="price-card-body">
                  <div class="quantity-range">
                    <div class="quantity-item">
                      <span class="quantity-label">Mínimo:</span>
                      <span class="quantity-value">{{ product.producto.cantidad_minima || 1 }} unidades</span>
                    </div>
                    <div class="quantity-item">
                      <span class="quantity-label">Máximo:</span>
                      <span class="quantity-value">{{ product.producto.cantidad_maxima || 'Sin límite' }} unidades</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Special Preventa Price -->
              <div class="price-card special" v-if="product.producto.precio_preventa">
                <div class="price-card-header">
                  <span class="price-type">Preventa Especial</span>
                  <span class="price-value">{{ formatPrice(product.producto.precio_preventa) }}</span>
                </div>
                <div class="price-card-body">
                  <div class="quantity-range">
                    <div class="quantity-item">
                      <span class="quantity-label">Mínimo:</span>
                      <span class="quantity-value">{{ product.producto.cantidad_minima_preventa || product.producto.cantidad_minima || 1 }} unidades</span>
                    </div>
                    <div class="quantity-item">
                      <span class="quantity-label">Máximo:</span>
                      <span class="quantity-value">{{ product.producto.cantidad_maxima_preventa || product.producto.cantidad_maxima || 'Sin límite' }} unidades</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Sale Price -->
              <div class="price-card sale" v-if="product.producto.precio_venta">
                <div class="price-card-header">
                  <span class="price-type">Precio de Venta</span>
                  <span class="price-value">{{ formatPrice(product.producto.precio_venta) }}</span>
                </div>
              </div>
              
              <!-- Previous Price -->
              <div class="price-card old" v-if="product.producto.precio_anterior && !product.producto.precio_venta">
                <div class="price-card-header">
                  <span class="price-type">Precio Anterior</span>
                  <span class="price-value old-price">{{ formatPrice(product.producto.precio_anterior) }}</span>
                </div>
              </div>
            </div>
            
            <!-- Price Summary -->
            <div class="prices-summary">
              <div class="summary-item" v-if="product.producto.precio">
                <span class="summary-label">Estándar:</span>
                <div class="summary-content">
                  <span class="summary-price">{{ formatPrice(product.producto.precio) }}</span>
                  <span class="summary-quantity">{{ product.producto.cantidad_minima || 1 }}+ uds</span>
                </div>
              </div>
              <div class="summary-item special" v-if="product.producto.precio_preventa">
                <span class="summary-label">Especial:</span>
                <div class="summary-content">
                  <span class="summary-price">{{ formatPrice(product.producto.precio_preventa) }}</span>
                  <span class="summary-quantity">{{ product.producto.cantidad_minima_preventa || product.producto.cantidad_minima || 1 }}+ uds</span>
                </div>
              </div>
              <div class="summary-item sale" v-if="product.producto.precio_venta">
                <span class="summary-label">Venta:</span>
                <div class="summary-content">
                  <span class="summary-price">{{ formatPrice(product.producto.precio_venta) }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <button @click="addToCart(product.producto)" class="add-to-cart-button" :disabled="addingToCart === product.producto.id">
            <i class="fas fa-shopping-cart"></i> 
            <span class="button-text">Añadir al carrito</span>
          </button>
        </div>
      </div>
    </transition-group>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Cargando tus favoritos...</p>
    </div>

    <!-- Empty State -->
    <div v-if="favorites.length === 0 && !loading" class="empty-state">
      <div class="empty-icon">
        <i class="fas fa-heart-broken"></i>
      </div>
      <h2>No tienes favoritos guardados</h2>
      <p>Agrega productos a tus favoritos para verlos aquí</p>
      <button @click="goToProducts" class="browse-products-button">
        <i class="fas fa-search"></i> Explorar productos
      </button>
    </div>

    <!-- Notification -->
    <transition name="notification-fade">
      <div v-if="showNotification" class="notification" :class="notificationType">
        <i :class="notificationType === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle'"></i>
        {{ notificationMessage }}
        <button @click="closeNotification" class="close-notification" aria-label="Cerrar notificación">
          <i class="fas fa-times"></i>
        </button>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { indexFavorites, removeFavorite } from '@/Services/FavoriteService'
import { useCartStore } from '@/stores/cart'
import { onMounted, ref, computed, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
const addingToCart = ref(null);
const router = useRouter()
const cartStore = useCartStore()
const favorites = ref([])
const showNotification = ref(false)
const notificationMessage = ref('')
const notificationType = ref('success')
const loading = ref(true)
const error = ref(null)
const notificationTimeout = ref(null)
const expandedPriceDetails = ref([]) // Para controlar los detalles de precios expandidos

onMounted(() => {
  userFavorites()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (notificationTimeout.value) {
    clearTimeout(notificationTimeout.value)
  }
})

const handleResize = () => {
  // Responsive adjustments if needed
}

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

// Verificar si un producto tiene precios de preventa
const hasPreventaPrices = (product) => {
  return product.precio_preventa || 
         product.precio_preventa_mayorista || 
         product.precio_preventa_distribuidor;
};

const removeFromFavorites = async (favoriteId) => {
  try {
    await removeFavorite(favoriteId)
    favorites.value = favorites.value.filter(item => item.id !== favoriteId);
    userFavorites();
    showNotificationMessage('Producto eliminado de favoritos', 'success')
  } catch (error) {
    console.error('Error al eliminar de favoritos:', error)
    showNotificationMessage('Error al eliminar el producto', 'error')
  }
}

const showNotificationMessage = (message, type = 'success') => {
  // Clear any existing timeout
  if (notificationTimeout.value) {
    clearTimeout(notificationTimeout.value)
  }
  
  notificationMessage.value = message
  notificationType.value = type
  showNotification.value = true
  
  // Set new timeout
  notificationTimeout.value = setTimeout(() => {
    showNotification.value = false
  }, 3000)
}

const closeNotification = () => {
  showNotification.value = false
  if (notificationTimeout.value) {
    clearTimeout(notificationTimeout.value)
  }
}

const userFavorites = async () => {
  loading.value = true
  error.value = null
  
  try {
    const { data } = await indexFavorites()
    favorites.value = data
    loading.value = false
  } catch (err) {
    console.error('Error al cargar los favoritos:', err)
    error.value = err
    loading.value = false
    showNotificationMessage('Error al cargar los favoritos', 'error')
  }
}

const formatPrice = (price) => {
  return new Intl.NumberFormat('es-BO', {
    style: 'currency',
    currency: 'BOB',
    minimumFractionDigits: 2
  }).format(price)
}

const addToCart = async (product) => {
  try {
    const cantidadMinima = product.cantidad_minima || 1;
    await cartStore.addToCart({
      ...product,
      quantity: cantidadMinima
    })
    showNotificationMessage(`${product.nombre} añadido al carrito`, 'success')
  } catch (error) {
    console.error('Error al añadir al carrito:', error)
    showNotificationMessage('Error al añadir al carrito', 'error')
  }
}

const goToProducts = () => {
  router.push('/productos')
}

const viewProductDetails = (productId) => {
  router.push(`/producto/${productId}`)
}

const isNewProduct = (product) => {
  if (!product.created_at) return false
  const productDate = new Date(product.created_at)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  return productDate > thirtyDaysAgo
}

const hasDiscount = (product) => {
  return product.precio_anterior && product.precio_anterior > product.precio
}

const calculateDiscount = (product) => {
  if (hasDiscount(product)) {
    return Math.round((1 - product.precio / product.precio_anterior) * 100)
  }
  return 0
}
</script>

<style scoped>
/* CSS Variables */
:root {
  --primary-color: #3498db;
  --primary-hover-color: #2980b9;
  --success-color: #27ae60;
  --error-color: #e53e3e;
  --text-primary: #2d3748;
  --text-secondary: #718096;
  --background-light: #f8fafc;
  --border-light: #e2e8f0;
}

/* Base Styles */
.favorites-container {
  max-width: 1440px;
  margin: 0 auto;
  padding: clamp(1rem, 2vw, 1.5rem);
  background: #fff;
  min-height: 100vh;
  font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

/* Header Styles */
.favorites-header {
  margin-bottom: clamp(1.5rem, 3vw, 2rem);
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-light);
  padding-bottom: 1rem;
  flex-wrap: wrap;
}

.header-content {
  display: flex;
  flex-direction: column;
}

.header-content h1 {
  font-size: clamp(1.75rem, 3vw, 2.5rem);
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  position: relative;
  display: inline-block;
}

.header-content h1::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: var(--primary-color);
  transform: scaleX(0);
  transition: transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  transform-origin: left;
}

.favorites-header:hover .header-content h1::after {
  transform: scaleX(1);
}

.favorites-count {
  color: var(--text-secondary);
  font-size: clamp(0.875rem, 1.5vw, 1rem);
  margin-top: 0.25rem;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.browse-button {
  padding: clamp(0.5rem, 1vw, 0.75rem) clamp(1rem, 1.5vw, 1.5rem);
  background: var(--background-light);
  border: 1px solid var(--border-light);
  border-radius: 6px;
  color: var(--text-primary);
  font-size: clamp(0.875rem, 1.5vw, 1rem);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.browse-button:hover {
  background: #e9ecef;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* Products Grid */
.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: clamp(1rem, 2vw, 1.5rem);
  margin-bottom: 2rem;
}

/* Product Card */
.product-card {
  background: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  animation: fadeInUp 0.6s forwards;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
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

/* Image Container */
.image-container {
  position: relative;
  width: 100%;
  padding-bottom: 100%;
  overflow: hidden;
  background-color: #f5f5f5;
}

.image-container img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  transition: transform 0.6s cubic-bezier(0.165, 0.84, 0.44, 1);
}

.product-card:hover .image-container img {
  transform: scale(1.05);
}

/* Remove Favorite Button */
.remove-favorite-button {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  width: 30px;
  height: 30px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  color: var(--error-color);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  font-size: 0.875rem;
  z-index: 10;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.remove-favorite-button:hover {
  background: var(--error-color);
  color: white;
  transform: scale(1.1);
}

/* Product Actions */
.product-actions {
  position: absolute;
  bottom: 0.5rem;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
  opacity: 0;
  transition: opacity 0.3s ease, transform 0.3s ease;
  z-index: 2;
  transform: translateY(10px);
}

.product-card:hover .product-actions {
  opacity: 1;
  transform: translateY(0);
}

.action-button {
  background: rgba(255, 255, 255, 0.9);
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
  color: var(--text-primary);
  font-size: 0.75rem;
}

.action-button:hover {
  transform: scale(1.1);
}

.view-button:hover {
  background: #6b46c1;
  color: white;
}

.cart-button:hover {
  background: var(--primary-color);
  color: white;
}

.cart-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

/* Product Badges */
.product-badges {
  position: absolute;
  top: 0.5rem;
  left: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  z-index: 2;
}

.badge {
  padding: 0.25rem 0.5rem;
  font-size: clamp(0.65rem, 1.2vw, 0.7rem);
  font-weight: 700;
  border-radius: 9999px;
  text-transform: uppercase;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  letter-spacing: 0.5px;
}

.badge-in-stock {
  background: linear-gradient(45deg, #48bb78, #38a169);
  color: white;
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
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

/* Product Info */
.product-info {
  padding: clamp(0.75rem, 1.5vw, 1rem);
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  background: white;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.category {
  font-size: clamp(0.65rem, 1.2vw, 0.7rem);
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
}

.product-name {
  font-size: clamp(0.875rem, 1.8vw, 1rem);
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.4;
  transition: color 0.3s ease;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  height: 2.8rem;
  margin: 0 0 0.75rem 0;
}

.product-card:hover .product-name {
  color: var(--primary-color);
}

/* Rating */
.rating {
  margin-bottom: 0.75rem;
}

.stars {
  display: flex;
  gap: 2px;
  margin-bottom: 0.25rem;
}

.star {
  color: #e2e8f0;
  font-size: 0.875rem;
}

.star.filled {
  color: #f6ad55;
}

.rating-count {
  font-size: clamp(0.65rem, 1.2vw, 0.7rem);
  color: var(--text-secondary);
}

/* Prices Container */
.prices-container {
  margin: 0.5rem 0 1rem;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--border-light);
  background: var(--background-light);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.prices-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  background: linear-gradient(to right, var(--background-light), #edf2f7);
  border-bottom: 1px solid var(--border-light);
}

.prices-title {
  font-size: clamp(0.7rem, 1.4vw, 0.75rem);
  font-weight: 700;
  color: var(--text-primary);
}

.toggle-prices-btn {
  background: none;
  border: none;
  color: var(--text-secondary);
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
  background: var(--border-light);
  color: var(--text-primary);
}

/* Price Details */
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
  max-height: 400px;
  opacity: 1;
  padding: 0.5rem;
}

/* Price Cards */
.price-card {
  border-radius: 6px;
  overflow: hidden;
  background: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid #edf2f7;
}

.price-card.special {
  border-left: 3px solid #ed8936;
}

.price-card.sale {
  border-left: 3px solid var(--error-color);
}

.price-card.old {
  border-left: 3px solid #a0aec0;
}

.price-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  background: #f7fafc;
  border-bottom: 1px solid #edf2f7;
}

.price-type {
  font-size: clamp(0.65rem, 1.2vw, 0.7rem);
  font-weight: 700;
  color: var(--text-primary);
}

.price-value {
  font-size: clamp(0.75rem, 1.4vw, 0.8rem);
  font-weight: 700;
  color: var(--text-primary);
}

.price-card.special .price-value {
  color: #dd6b20;
}

.price-card.sale .price-value {
  color: var(--error-color);
}

.price-value.old-price {
  color: #a0aec0;
  text-decoration: line-through;
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
  font-size: clamp(0.6rem, 1.2vw, 0.65rem);
  color: var(--text-secondary);
}

.quantity-label {
  font-weight: 600;
}

.quantity-value {
  color: var(--text-primary);
}

/* Price Summary */
.prices-summary {
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  border-top: 1px dashed var(--border-light);
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: clamp(0.65rem, 1.2vw, 0.7rem);
}

.summary-item.special {
  font-weight: 700;
}

.summary-item.sale {
  font-weight: 700;
}

.summary-label {
  color: var(--text-primary);
  font-weight: 600;
}

.summary-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.summary-price {
  font-weight: 700;
  color: var(--text-primary);
}

.summary-item.special .summary-price {
  color: #dd6b20;
}

.summary-item.sale .summary-price {
  color: var(--error-color);
}

.summary-quantity {
  font-size: clamp(0.6rem, 1.2vw, 0.65rem);
  color: var(--text-secondary);
  background: #edf2f7;
  padding: 0.1rem 0.3rem;
  border-radius: 4px;
}

/* Add to Cart Button */
.add-to-cart-button {
  width: 100%;
  padding: clamp(0.5rem, 1vw, 0.75rem) clamp(1rem, 1.5vw, 1.5rem);
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: clamp(0.875rem, 1.5vw, 1rem);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: auto;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 10px rgba(52, 152, 219, 0.3);
}

.add-to-cart-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: var(--primary-hover-color);
  transform: translateX(-100%);
  transition: transform 0.3s ease;
  z-index: -1;
}

.add-to-cart-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 15px rgba(52, 152, 219, 0.4);
}

.add-to-cart-button:hover::before {
  transform: translateX(0);
}

.add-to-cart-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: clamp(2rem, 4vw, 3rem) clamp(1rem, 2vw, 2rem);
  background: var(--background-light);
  border-radius: 12px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  max-width: 600px;
  margin: 2rem auto;
}

.empty-icon {
  font-size: clamp(3rem, 6vw, 4rem);
  color: #cbd5e0;
  margin-bottom: 1.5rem;
}

.empty-state h2 {
  font-size: clamp(1.25rem, 2.5vw, 1.5rem);
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
}

.empty-state p {
  color: var(--text-secondary);
  font-size: clamp(0.875rem, 1.5vw, 1rem);
  margin: 0 0 2rem 0;
}

.browse-products-button {
  padding: clamp(0.5rem, 1vw, 0.75rem) clamp(1rem, 1.5vw, 1.5rem);
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: clamp(0.875rem, 1.5vw, 1rem);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 4px 10px rgba(52, 152, 219, 0.3);
}

.browse-products-button:hover {
  transform: translateY(-3px);
  background: var(--primary-hover-color);
  box-shadow: 0 6px 15px rgba(52, 152, 219, 0.4);
}

/* Loading State */
.loading-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  gap: 1rem;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(52, 152, 219, 0.2);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-container p {
  color: var(--text-secondary);
  font-size: clamp(0.875rem, 1.5vw, 1rem);
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Notification */
.notification {
  position: fixed;
  bottom: 20px;
  right: 20px;
  padding: clamp(0.5rem, 1vw, 0.75rem) clamp(1rem, 1.5vw, 1.5rem);
  border-radius: 12px;
  font-size: clamp(0.875rem, 1.5vw, 1rem);
  font-weight: 500;
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 300px;
  max-width: 400px;
  justify-content: space-between;
}

.notification.success {
  background: linear-gradient(45deg, #48bb78, #38a169);
  color: white;
}

.notification.error {
  background: linear-gradient(45deg, var(--error-color), #c53030);
  color: white;
}

.close-notification {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 0.875rem;
  opacity: 0.8;
  transition: opacity 0.2s ease;
}

.close-notification:hover {
  opacity: 1;
}

/* Transitions */
.fade-enter-active, .fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.notification-fade-enter-active, .notification-fade-leave-active {
  transition: all 0.3s ease;
}

.notification-fade-enter-from, .notification-fade-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

/* Responsive Styles */
@media (min-width: 1200px) {
  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.5rem;
  }
}

@media (min-width: 992px) and (max-width: 1199px) {
  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1.25rem;
  }
}

@media (min-width: 768px) and (max-width: 991px) {
  .favorites-container {
    padding: clamp(1rem, 2vw, 1.25rem);
  }

  .favorites-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .header-actions {
    width: 100%;
  }

  .browse-button {
    width: 100%;
    justify-content: center;
  }

  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
  }

  .product-info {
    padding: 0.75rem;
  }

  .product-name {
    font-size: clamp(0.8rem, 1.6vw, 0.9rem);
    height: 2.4rem;
  }
}

@media (min-width: 576px) and (max-width: 767px) {
  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 0.75rem;
  }

  .action-button {
    width: 28px;
    height: 28px;
    font-size: 0.7rem;
  }

  .remove-favorite-button {
    width: 28px;
    height: 28px;
    font-size: 0.8rem;
  }
}

@media (min-width: 480px) and (max-width: 575px) {
  .favorites-container {
    padding: 0.75rem;
  }

  .favorites-header h1 {
    font-size: clamp(1.5rem, 2.5vw, 2rem);
  }

  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 0.5rem;
  }

  .product-info {
    padding: 0.5rem;
  }

  .product-name {
    font-size: clamp(0.75rem, 1.4vw, 0.8rem);
    height: 2.2rem;
  }

  .add-to-cart-button {
    padding: 0.5rem;
    font-size: clamp(0.75rem, 1.4vw, 0.875rem);
  }

  .button-text {
    display: none;
  }
}

@media (max-width: 479px) {
  .favorites-container {
    padding: 0.5rem;
  }

  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 0.5rem;
  }

  .product-info {
    padding: 0.5rem;
  }

  .product-name {
    font-size: clamp(0.7rem, 1.4vw, 0.75rem);
    height: 2rem;
  }

  .prices-container {
    margin: 0.25rem 0 0.75rem;
  }

  .prices-title {
    font-size: clamp(0.65rem, 1.2vw, 0.7rem);
  }

  .toggle-prices-btn {
    width: 20px;
    height: 20px;
  }

  .add-to-cart-button {
    padding: 0.4rem;
    font-size: clamp(0.7rem, 1.2vw, 0.8rem);
  }

  .button-text {
    display: none;
  }

  .empty-state {
    padding: clamp(1.5rem, 3vw, 2rem) 1rem;
  }

  .empty-icon {
    font-size: clamp(2.5rem, 5vw, 3rem);
  }

  .empty-state h2 {
    font-size: clamp(1rem, 2vw, 1.25rem);
  }

  .empty-state p {
    font-size: clamp(0.75rem, 1.4vw, 0.875rem);
  }

  .browse-products-button {
    padding: 0.5rem 1rem;
    font-size: clamp(0.75rem, 1.4vw, 0.875rem);
  }

  .notification {
    right: 10px;
    min-width: 250px;
    max-width: 90%;
  }
}

/* Touch Device Optimizations */
@media (hover: none) {
  .product-card:hover {
    transform: none;
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.05);
  }

  .product-card:active {
    transform: scale(0.98);
  }

  .product-actions {
    opacity: 1;
    transform: translateY(0);
    background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
  }

  .action-button:hover,
  .add-to-cart-button:hover,
  .browse-products-button:hover,
  .browse-button:hover {
    transform: none;
  }

  .action-button:active,
  .add-to-cart-button:active,
  .browse-products-button:active,
  .browse-button:active {
    transform: scale(0.95);
  }
}

/* Accessibility Improvements */
@media (prefers-reduced-motion: reduce) {
  .product-card,
  .action-button,
  .add-to-cart-button,
  .browse-products-button,
  .browse-button,
  .notification,
  .price-details,
  .product-card:hover .image-container img {
    transition: none;
  }

  .badge-new {
    animation: none;
  }

  .loading-spinner {
    animation: none;
  }

  .fade-enter-active,
  .fade-leave-active,
  .notification-fade-enter-active,
  .notification-fade-leave-active {
    transition: none;
  }

  .header-content h1::after {
    transition: none;
  }
}

/* Focus Styles for Keyboard Navigation */
.action-button:focus-visible,
.add-to-cart-button:focus-visible,
.browse-products-button:focus-visible,
.browse-button:focus-visible,
.close-notification:focus-visible,
.toggle-prices-btn:focus-visible,
.remove-favorite-button:focus-visible {
  outline: 2px solid var(--primary-color);
  outline-offset: 2px;
}
</style>