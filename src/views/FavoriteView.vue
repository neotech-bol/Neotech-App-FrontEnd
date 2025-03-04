<template>
  <div class="favorites-container">
    <header class="favorites-header">
      <h1>Mis Favoritos</h1>
      <span class="favorites-count">{{ favorites.length }} items</span>
    </header>

    <transition-group name="fade" tag="div" class="products-grid">
      <div v-for="product in favorites" :key="product.producto.id" class="product-card">
        <div class="image-container">
          <img :src="product.producto.imagen_principal" :alt="product.producto.nombre" loading="lazy">
          <button @click="removeFromFavorites(product.id)" class="remove-button" aria-label="Eliminar de favoritos">
            <i class="fas fa-heart-broken"></i>
          </button>
          <div class="product-badges" v-if="product.producto.estado === 1">
            <span class="badge in-stock">Disponible</span>
          </div>
        </div>

        <div class="product-info">
          <h3 :title="product.producto.nombre">{{ product.producto.nombre }}</h3>
          <p class="price">{{ formatPrice(product.producto.precio) }} Bs</p>
          <button @click="addToCart(product.producto)" class="add-to-cart-button">
            <i class="fas fa-shopping-cart"></i> 
            <span class="button-text">Añadir al carrito</span>
          </button>
        </div>
      </div>
    </transition-group>

    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
    </div>

    <div v-if="favorites.length === 0 && !loading" class="empty-state">
      <i class="fas fa-heart-broken"></i>
      <p>No tienes favoritos guardados</p>
      <button @click="goToProducts" class="browse-products-button">
        <i class="fas fa-search"></i> Explorar productos
      </button>
    </div>

    <transition name="fade">
      <div v-if="showNotification" class="notification" :class="notificationType">
        <i :class="notificationType === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle'"></i>
        {{ notificationMessage }}
      </div>
    </transition>
  </div>
</template>

<script setup>
import { indexFavorites } from '@/Services/FavoriteService'
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

onMounted(() => {
  userFavorites()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

const handleResize = () => {
  // Implement any responsive logic here if needed
}

const removeFromFavorites = async (productId) => {
  try {
    // Implement the actual removal logic here
    // await removeFavorite(productId)
    favorites.value = favorites.value.filter(product => product.id !== productId)
    showNotificationMessage('Producto eliminado de favoritos', 'success')
  } catch (error) {
    console.error(error)
    showNotificationMessage('Error al eliminar el producto', 'error')
  }
}

const showNotificationMessage = (message, type = 'success') => {
  notificationMessage.value = message
  notificationType.value = type
  showNotification.value = true
  setTimeout(() => {
    showNotification.value = false
  }, 3000)
}

const userFavorites = async () => {
  loading.value = true
  error.value = null
  
  try {
    const { data } = await indexFavorites()
    favorites.value = data
    loading.value = false
  } catch (err) {
    console.error(err)
    error.value = err
    loading.value = false
    showNotificationMessage('Error al cargar los favoritos', 'error')
  }
}

const formatPrice = (price) => {
  const numericPrice = parseFloat(price)
  return isNaN(numericPrice) ? 'N/A' : numericPrice.toFixed(2)
}

const addToCart = (product) => {
  cartStore.addToCart(product)
  showNotificationMessage('Producto añadido al carrito', 'success')
}

const goToProducts = () => {
  router.push('/productos')
}
</script>

<style scoped>
.favorites-container {
  max-width: 1440px;
  margin: 0 auto;
  padding: 20px;
}

.favorites-header {
  margin-bottom: 30px;
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}

.favorites-header h1 {
  font-size: 28px;
  font-weight: 700;
  color: #2d3748;
}

.favorites-count {
  color: #718096;
  font-size: 16px;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 24px;
}

.product-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.image-container {
  position: relative;
  padding-top: 100%;
  background-color: #f7fafc;
  overflow: hidden;
}

.image-container img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.product-card:hover .image-container img {
  transform: scale(1.05);
}

.remove-button {
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
  font-size: 16px;
  z-index: 5;
}

.remove-button:hover {
  background: #e53e3e;
  color: white;
  transform: scale(1.1);
}

.product-badges {
  position: absolute;
  bottom: 10px;
  left: 10px;
  z-index: 5;
}

.badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}

.badge.in-stock {
  background-color: #48bb78;
  color: white;
}

.product-info {
  padding: 16px;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.product-info h3 {
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 600;
  color: #2d3748;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.price {
  margin: 0 0 16px;
  font-size: 18px;
  font-weight: 700;
  color: #2c5282;
}

.add-to-cart-button {
  width: 100%;
  padding: 10px 16px;
  background-color: #4299e1;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: auto;
}

.add-to-cart-button:hover {
  background-color: #3182ce;
  transform: translateY(-2px);
}

.add-to-cart-button:active {
  transform: translateY(0);
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #718096;
}

.empty-state i {
  font-size: 48px;
  color: #cbd5e0;
  margin-bottom: 16px;
}

.empty-state p {
  margin: 0 0 24px;
  font-size: 18px;
}

.browse-products-button {
  padding: 12px 24px;
  background-color: #4299e1;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.browse-products-button:hover {
  background-color: #3182ce;
  transform: translateY(-2px);
}

.notification {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 24px;
  border-radius: 30px;
  font-size: 16px;
  font-weight: 500;
  opacity: 0.95;
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.notification.success {
  background-color: #48bb78;
  color: white;
}

.notification.error {
  background-color: #e53e3e;
  color: white;
}

/* Transitions */
.fade-enter-active, .fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

/* Loading state */
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(66, 153, 225, 0.2);
  border-radius: 50%;
  border-top-color: #4299e1;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Responsive styles */
@media (max-width: 1024px) {
  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }
}

@media (max-width: 768px) {
  .favorites-container {
    padding: 15px;
  }

  .favorites-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .favorites-count {
    margin-top: 5px;
  }

  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 15px;
  }
  
  .remove-button {
    width: 32px;
    height: 32px;
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .favorites-header h1 {
    font-size: 24px;
  }

  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 12px;
  }

  .product-info {
    padding: 12px;
  }

  .product-info h3 {
    font-size: 14px;
  }

  .price {
    font-size: 16px;
    margin-bottom: 12px;
  }

  .add-to-cart-button {
    font-size: 12px;
    padding: 8px 12px;
  }

  .button-text {
    display: none;
  }

  .add-to-cart-button i {
    margin-right: 0;
  }

  .notification {
    width: 90%;
    font-size: 14px;
    padding: 10px 16px;
  }
  
  .empty-state {
    padding: 40px 15px;
  }
  
  .browse-products-button {
    padding: 10px 20px;
    font-size: 14px;
  }
}

/* Accessibility improvements */
@media (prefers-reduced-motion: reduce) {
  .product-card,
  .remove-button,
  .add-to-cart-button,
  .browse-products-button {
    transition: none;
  }

  .loading-spinner {
    animation: none;
  }
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .product-card {
    border: 2px solid #000;
  }

  .badge.in-stock {
    background-color: #000;
    color: #fff;
    outline: 1px solid #fff;
  }

  .add-to-cart-button,
  .browse-products-button {
    background-color: #000;
    color: #fff;
    border: 2px solid #fff;
  }
}

/* Touch device optimizations */
@media (hover: none) {
  .product-card:hover {
    transform: none;
  }

  .product-card:active {
    transform: translateY(-2px);
  }

  .remove-button:hover,
  .add-to-cart-button:hover,
  .browse-products-button:hover {
    transform: none;
  }

  .remove-button:active,
  .add-to-cart-button:active,
  .browse-products-button:active {
    transform: scale(0.98);
  }
}

/* Improved focus styles for keyboard navigation */
.remove-button:focus,
.add-to-cart-button:focus,
.browse-products-button:focus {
  outline: 2px solid #4299e1;
  outline-offset: 2px;
}

/* Smooth scrolling for the entire page */
html {
  scroll-behavior: smooth;
}

/* Prevent text size adjustment on orientation change */
html {
  -webkit-text-size-adjust: 100%;
  text-size-adjust: 100%;
}
</style>