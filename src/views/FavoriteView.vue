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
          <img :src="product.producto.imagen_principal" :alt="product.producto.nombre" loading="lazy">
          
          <!-- Product Actions -->
          <div class="product-actions">
            <button @click="viewProductDetails(product.producto.id)" class="action-button view-button" aria-label="Ver detalles">
              <i class="fas fa-eye"></i>
            </button>
            <button @click="addToCart(product.producto)" class="action-button cart-button" aria-label="Añadir al carrito">
              <i class="fas fa-shopping-cart"></i>
            </button>
          </div>

          <!-- Remove Button - Always visible -->
          <button @click="removeFromFavorites(product.id)" class="remove-favorite-button" aria-label="Eliminar de favoritos">
            <i class="fas fa-heart-broken"></i>
          </button>
          
          <!-- Product Badges -->
          <div class="product-badges">
            <span v-if="product.producto.estado === 1" class="badge in-stock">
              <i class="fas fa-check-circle"></i> Disponible
            </span>
            <span v-if="isNewProduct(product.producto)" class="badge new-product">
              <i class="fas fa-star"></i> NUEVO
            </span>
            <span v-if="hasDiscount(product.producto)" class="badge discount">
              <i class="fas fa-bolt"></i> -{{ calculateDiscount(product.producto) }}%
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
              <span v-for="star in 5" :key="star" class="star" :class="{ 'filled': star <= (product.producto.rating || 0) }">★</span>
            </div>
            <span class="rating-count">{{ product.producto.total_ratings || 0 }} calificaciones</span>
          </div>
          
          <div class="price-container">
            <span class="current-price">{{ formatPrice(product.producto.precio) }}</span>
            <span v-if="product.producto.precio_anterior && product.producto.precio_anterior > product.producto.precio" 
                  class="original-price">{{ formatPrice(product.producto.precio_anterior) }}</span>
          </div>
          
          <button @click="addToCart(product.producto)" class="add-to-cart-button">
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

const router = useRouter()
const cartStore = useCartStore()
const favorites = ref([])
const showNotification = ref(false)
const notificationMessage = ref('')
const notificationType = ref('success')
const loading = ref(true)
const error = ref(null)
const notificationTimeout = ref(null)

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
    await cartStore.addToCart({
      ...product,
      cantidad: 1
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
/* Base Styles */
.favorites-container {
  max-width: 1440px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
  background: #fff;
  min-height: 100vh;
}

/* Header Styles */
.favorites-header {
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: 1rem;
}

.header-content h1 {
  font-size: 1.75rem;
  font-weight: 700;
  color: #333;
  margin: 0;
}

.favorites-count {
  color: #666;
  font-size: 1rem;
  margin-top: 0.25rem;
  display: inline-block;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.browse-button {
  padding: 0.5rem 1rem;
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 0.5rem;
  color: #333;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.browse-button:hover {
  background: #e9ecef;
  transform: translateY(-2px);
}

/* Products Grid */
.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

/* Product Card */
.product-card {
  background: white;
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
}

.product-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.12);
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
  transform: scale(1.08);
}

/* Remove Favorite Button - Always visible */
.remove-favorite-button {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  color: #e53e3e;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  font-size: 1rem;
  z-index: 10;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.remove-favorite-button:hover {
  background: #e53e3e;
  color: white;
  transform: scale(1.1);
}

/* Product Actions */
.product-actions {
  position: absolute;
  bottom: 10px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.5), transparent);
  opacity: 0;
  transition: opacity 0.3s ease, transform 0.3s ease;
  z-index: 2;
  transform: translateY(10px);
}

.action-button {
  background-color: rgba(255, 255, 255, 0.95);
  border: none;
  width: 35px;
  height: 35px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(4px);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15);
  color: #2d3748;
  font-size: 0.85rem;
}

.action-button:hover {
  transform: scale(1.15);
}

.remove-button {
  color: #e53e3e;
}

.remove-button:hover {
  background-color: #e53e3e;
  color: white;
}

.view-button:hover {
  background-color: #6b46c1;
  color: white;
}

.cart-button:hover {
  background-color: #3498db;
  color: white;
}

/* Product Badges */
.product-badges {
  position: absolute;
  bottom: 10px;
  left: 10px;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  z-index: 2;
}

.badge {
  padding: 0.35rem 0.7rem;
  font-size: 0.7rem;
  font-weight: 700;
  border-radius: 9999px;
  text-transform: uppercase;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15);
  letter-spacing: 0.5px;
}

.badge.in-stock {
  background: linear-gradient(45deg, #48bb78, #38a169);
  color: white;
}

.badge.new-product {
  background: linear-gradient(45deg, #4CAF50, #8BC34A);
  color: white;
  animation: pulse 2s infinite;
}

.badge.discount {
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

/* Product Info */
.product-info {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  background-color: white;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
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
  font-size: 0.95rem;
  font-weight: 700;
  color: #2d3748;
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
  color: #3498db;
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
  font-size: 0.95rem;
}

.star.filled {
  color: #f6ad55;
}

.rating-count {
  font-size: 0.7rem;
  color: #718096;
}

/* Price */
.price-container {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.current-price {
  font-weight: 700;
  font-size: 1.1rem;
  color: #2d3748;
}

.original-price {
  font-size: 0.8rem;
  color: #a0aec0;
  text-decoration: line-through;
}

/* Add to Cart Button */
.add-to-cart-button {
  width: 100%;
  padding: 0.75rem 1rem;
  background: linear-gradient(45deg, #007bff, #0056b3);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.875rem;
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
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
}

.add-to-cart-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 123, 255, 0.4);
  background: linear-gradient(45deg, #0062cc, #0046a1);
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
  padding: 4rem 2rem;
  background: #f8f9fa;
  border-radius: 1rem;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  max-width: 600px;
  margin: 2rem auto;
}

.empty-icon {
  font-size: 4rem;
  color: #cbd5e0;
  margin-bottom: 1.5rem;
}

.empty-state h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0 0 0.5rem 0;
}

.empty-state p {
  color: #718096;
  margin: 0 0 2rem 0;
  font-size: 1rem;
}

.browse-products-button {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(45deg, #007bff, #0056b3);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
}

.browse-products-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 123, 255, 0.4);
  background: linear-gradient(45deg, #0062cc, #0046a1);
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
  border: 4px solid rgba(0, 123, 255, 0.1);
  border-radius: 50%;
  border-top-color: #007bff;
  animation: spin 1s ease-in-out infinite;
}

.loading-container p {
  color: #718096;
  font-size: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Notification */
.notification {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  padding: 0.75rem 1.5rem;
  border-radius: 2rem;
  font-size: 0.875rem;
  font-weight: 500;
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 300px;
  justify-content: space-between;
}

.notification.success {
  background: linear-gradient(45deg, #48bb78, #38a169);
  color: white;
}

.notification.error {
  background: linear-gradient(45deg, #e53e3e, #c53030);
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
  transform: translate(-50%, 20px);
}

/* Responsive Styles */
@media (max-width: 1024px) {
  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 1.25rem;
  }
}

@media (max-width: 768px) {
  .favorites-container {
    padding: 1.5rem 1rem;
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
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 1rem;
  }

  .product-info {
    padding: 0.75rem;
  }

  .product-name {
    font-size: 0.85rem;
    height: 2.4rem;
  }

  .action-button {
    width: 32px;
    height: 32px;
    font-size: 0.8rem;
  }

  .notification {
    width: 90%;
    min-width: auto;
    max-width: 400px;
  }
}

@media (max-width: 480px) {
  .favorites-header h1 {
    font-size: 1.5rem;
  }

  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 0.75rem;
  }

  .product-info {
    padding: 0.5rem;
  }

  .product-name {
    font-size: 0.8rem;
    height: 2.2rem;
    margin-bottom: 0.5rem;
  }

  .price-container {
    margin-bottom: 0.75rem;
  }

  .current-price {
    font-size: 0.9rem;
  }

  .original-price {
    font-size: 0.7rem;
  }

  .add-to-cart-button {
    padding: 0.5rem;
    font-size: 0.75rem;
  }

  .button-text {
    display: none;
  }

  .badge {
    padding: 0.25rem 0.5rem;
    font-size: 0.65rem;
  }

  .empty-state {
    padding: 2rem 1rem;
  }

  .empty-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  .empty-state h2 {
    font-size: 1.25rem;
  }

  .empty-state p {
    font-size: 0.875rem;
    margin-bottom: 1.5rem;
  }

  .browse-products-button {
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
  }
}

/* Accessibility Improvements */
@media (prefers-reduced-motion: reduce) {
  .product-card,
  .action-button,
  .add-to-cart-button,
  .browse-products-button,
  .notification,
  .product-card:hover .image-container img {
    transition: none;
  }

  .badge.new-product {
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
}

/* Focus Styles for Keyboard Navigation */
.action-button:focus-visible,
.add-to-cart-button:focus-visible,
.browse-products-button:focus-visible,
.browse-button:focus-visible,
.close-notification:focus-visible {
  outline: 2px solid #007bff;
  outline-offset: 2px;
}

/* Touch Device Optimizations */
@media (hover: none) {
  .product-card:hover {
    transform: none;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
  }

  .product-card:active {
    transform: scale(0.98);
  }

  .product-actions {
    opacity: 1;
    transform: translateY(0);
    background: linear-gradient(to bottom, rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0.3) 50%, transparent 100%);
  }

  .action-button:hover {
    transform: none;
  }

  .action-button:active {
    transform: scale(0.95);
  }

  .add-to-cart-button:hover,
  .browse-products-button:hover,
  .browse-button:hover {
    transform: none;
  }

  .add-to-cart-button:active,
  .browse-products-button:active,
  .browse-button:active {
    transform: scale(0.98);
  }
}
</style>