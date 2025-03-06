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
        <div v-for="(product, index) in recentProducts" 
             :key="product.id" 
             class="product-card"
             :style="{ '--index': index }"
             @click="viewProduct(product.id)">
          <div class="product-image-wrapper">
            <div class="product-image">
              <transition name="fade" mode="out-in">
                <img :key="currentImageIndex[product.id]" 
                     :src="getCurrentImage(product)" 
                     :alt="product.nombre" 
                     loading="lazy">
              </transition>
              
              <!-- Navigation Buttons -->
              <button class="nav-button prev" 
                      @click.stop="prevImage(product)" 
                      v-if="getProductImages(product).length > 1">
                <i class="fas fa-chevron-left"></i>
              </button>
              <button class="nav-button next" 
                      @click.stop="nextImage(product)"
                      v-if="getProductImages(product).length > 1">
                <i class="fas fa-chevron-right"></i>
              </button>

              <!-- Badges -->
              <div class="badges">
                <span class="badge badge-new">
                  <i class="fas fa-star-of-life"></i> NUEVO
                </span>
                <span v-if="product.descuento" class="badge badge-sale">
                  <i class="fas fa-bolt"></i> -{{ product.descuento }}%
                </span>
              </div>

              <!-- Product Actions -->
              <div class="product-actions-bottom">
                <button class="action-button cart-btn" 
                        @click.stop="addToCart(product)" 
                        aria-label="Agregar al carrito"
                        :class="{ 'adding': addingToCart === product.id }">
                  <i class="fas" :class="addingToCart === product.id ? 'fa-spinner fa-spin' : 'fa-shopping-cart'"></i>
                </button>
                <button class="action-button view-btn" 
                        @click.stop="viewProduct(product.id)" 
                        aria-label="Ver producto">
                  <i class="fas fa-eye"></i>
                </button>
                <button class="action-button fav-btn" 
                        @click.stop="addToFavorites(product.id)"
                        aria-label="Agregar a favoritos" 
                        :class="{ 'in-favorites': favoriteProducts.includes(product.id) }">
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

            <div class="rating-container">
              <div class="rating">
                <span v-for="star in 5" 
                      :key="star" 
                      class="star"
                      :class="{ 'filled': star <= (userRatings.find(r => r.producto_id === product.id)?.rating || 0 )}"
                      @click.stop="storeRatingUser(product.id, star)">
                  ★
                </span>
              </div>
              <div class="rating-count">
                {{ userRatings.find(r => r.producto_id === product.id)?.total_users || 0 }} calificaciones
              </div>
            </div>

            <div class="price-container">
              <div class="price">
                <span class="current-price">{{ formatPrice(product.precio) }}</span>
                <span v-if="product.precio_anterior" class="old-price">{{ formatPrice(product.precio_anterior) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="view-all-container" v-if="recentProducts.length > 0">
        <button class="view-all-btn" @click="viewAllProducts">
          Ver todos los productos
          <i class="fas fa-arrow-right"></i>
        </button>
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
import { indexRatings, storeRating } from '@/Services/RatingService';

const router = useRouter();
const cartStore = useCartStore();
const recentProducts = ref([]);
const loading = ref(true);
const error = ref(null);
const addingToCart = ref(null);
const favoriteProducts = ref([]);
const userRatings = ref([]);
const currentImageIndex = ref({});

onMounted(async () => {
  await fetchRecentProducts();
  await indexRatingUser();
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

const storeRatingUser = async (productId, rating) => {
  try {
    await storeRating({ producto_id: productId, rating });
    await indexRatingUser();
    showNotification('Calificación guardada', 'success');
  } catch (err) {
    console.error('Error al calificar:', err);
    showNotification('Error al guardar calificación', 'error');
  }
};

const indexRatingUser = async () => {
  try {
    const { data } = await indexRatings();
    userRatings.value = data;
  } catch (err) {
    console.error('Error cargando calificaciones:', err);
  }
};

const viewAllProducts = () => {
  router.push('/productos');
};

const formatPrice = (price) => {
  return new Intl.NumberFormat('es-BO', {
    style: 'currency',
    currency: 'BOB',
    minimumFractionDigits: 2
  }).format(price);
};

const showNotification = (message, type) => {
  // Implementación de notificaciones
  console.log(`${type}: ${message}`);
  // Aquí podrías implementar un sistema de notificaciones toast
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
  padding: 0 1rem;
}

/* Section Header */
.section-title {
  font-size: clamp(1.75rem, 5vw, 2.5rem);
  font-weight: 800;
  color: #1a202c;
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

/* Rating */
.rating-container {
  margin-bottom: 0.5rem;
}

.rating {
  display: flex;
  gap: 2px;
  margin-bottom: 0.25rem;
}

.star {
  color: #e2e8f0;
  font-size: 0.875rem;
  cursor: pointer;
  transition: transform 0.2s ease, color 0.2s ease;
}

.star:hover {
  transform: scale(1.2);
}

.star.filled {
  color: #f6ad55;
}

.rating-count {
  font-size: 0.65rem;
  color: #718096;
}

/* Price */
.price-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
}

.price {
  display: flex;
  align-items: baseline;
  gap: 0.25rem;
  flex-wrap: wrap;
}

.current-price {
  font-weight: 700;
  font-size: 0.95rem;
  color: #2d3748;
}

.old-price {
  font-size: 0.75rem;
  color: #a0aec0;
  text-decoration: line-through;
}

/* View All Button */
.view-all-container {
  display: flex;
  justify-content: center;
  margin-top: 1.5rem;
}

.view-all-btn {
  padding: 0.6rem 1.5rem;
  background: transparent;
  color: var(--primary-color);
  border: 2px solid var(--primary-color);
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.view-all-btn:hover {
  background: var(--primary-color);
  color: white;
  transform: translateY(-3px);
  box-shadow: 0 6px 15px rgba(52, 152, 219, 0.2);
}

.view-all-btn:active {
  transform: translateY(-1px);
}

.view-all-btn i {
  transition: transform 0.3s ease;
}

.view-all-btn:hover i {
  transform: translateX(5px);
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
  
  .star {
    font-size: 1rem;
  }
  
  .current-price {
    font-size: 1.1rem;
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
  
  .rating {
    gap: 1px;
  }
  
  .star {
    font-size: 0.75rem;
  }
  
  .rating-count {
    font-size: 0.6rem;
  }
  
  .current-price {
    font-size: 0.85rem;
  }
  
  .old-price {
    font-size: 0.7rem;
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
  
  .rating {
    gap: 1px;
  }
  
  .star {
    font-size: 0.75rem;
  }
  
  .rating-count {
    font-size: 0.6rem;
  }
  
  .current-price {
    font-size: 0.85rem;
  }
  
  .old-price {
    font-size: 0.7rem;
  }
}

@media (max-width: 399px) {
  .recently-arrived {
    padding: 1.5rem 0;
  }
  
  .container {
    padding: 0 0.5rem;
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
  
  .rating {
    gap: 1px;
  }
  
  .star {
    font-size: 0.7rem;
  }
  
  .rating-count {
    font-size: 0.55rem;
  }
  
  .current-price {
    font-size: 0.8rem;
  }
  
  .old-price {
    font-size: 0.65rem;
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
  
  .view-all-btn {
    padding: 0.5rem 1rem;
    font-size: 0.8rem;
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
  .action-button:hover,
  .view-all-btn:hover {
    transform: none;
  }
  
  .fade-enter-active,
  .fade-leave-active {
    transition: none;
  }
}
</style>