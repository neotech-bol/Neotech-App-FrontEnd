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
          <!-- Banner -->
          <div class="category-banner" @click="viewCollection">
            <img :src="categoria.banner" :alt="`Banner de ${categoria.nombre}`" loading="lazy" />
            <div class="banner-overlay">
              <h2>{{ categoria.nombre }}</h2>
              <p>{{ categoria.descripcion }}</p>
              <button class="banner-cta">Ver Colección</button>
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

          <!-- Products Grid -->
          <div class="products-grid">
            <div v-for="product in categoria.productos" 
                 :key="product.id" 
                 class="product-card"
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

                  <!-- Badge -->
                  <span v-if="product.badge" :class="['badge', product.badge === 'LIMITADO' ? 'badge-limited' : 'badge-new']">
                    {{ product.badge }}
                  </span>
                                  <!-- Product Actions -->
                <div class="product-actions-bottom">
                  <button class="action-button cart-button" 
                          @click.stop="addToCart(product)" 
                          aria-label="Agregar al carrito">
                    <i class="fas fa-shopping-cart"></i>
                  </button>
                  <button class="action-button view-button" 
                          @click.stop="verProducto(product.id)" 
                          aria-label="Ver producto">
                    <i class="fas fa-eye"></i>
                  </button>
                  <button class="action-button favorite-button" 
                          @click.stop="fororiteUser(product.id)" 
                          aria-label="Agregar a favoritos">
                    <i class="fas fa-heart"></i>
                  </button>
                </div>
                </div>
              </div>
              <!-- Product Info -->
              <div class="product-info">
                <div class="category">{{ categoria?.nombre || 'Sin categoría' }}</div>
                <h3 class="product-name">{{ product.nombre }}</h3>

                <div class="rating-container">
                  <div class="rating">
                    <span v-for="star in 5" 
                          :key="star" 
                          class="star"
                          :class="{ 'filled': star <= (userRatings.find(r => r.producto_id === product.id)?.rating || 0) }"
                          @click.stop="storeRatingUser(product.id, star)">
                      ★
                    </span>
                  </div>
                  <div class="rating-count">
                    {{ userRatings.find(r => r.producto_id === product.id)?.total_users || 0 }} calificaciones
                  </div>
                </div>

                <div class="price">
                  <span class="current-price">{{ product.precio }} Bs</span>
                  <span v-if="product.oldPrice" class="old-price">{{ product.oldPrice }} Bs</span>
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
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { indexCatalogoItems } from '@/Services/CatalogoService';
import { useCartStore } from '@/stores/cart';
import { useRouter } from 'vue-router';
import { storeFavorite } from '@/Services/FavoriteService';
import { indexRatings, storeRating } from '@/Services/RatingService';

const cartStore = useCartStore();
const datos = ref([]);
const router = useRouter();
const fovoritesForm = ref({});
const userRatings = ref([]);
const currentImageIndex = ref({});
const loading = ref(true);
const error = ref(null);

onMounted(() => {
  listarCatalogo();
  indexRatingUser();
});

const verProducto = param => {
  router.push({ path: `/producto/${param}` });
};

const listarCatalogo = async () => {
  loading.value = true;
  error.value = null;
  try {
    const { data } = await indexCatalogoItems('');
    console.log(data);
    datos.value = data.datos;
    console.log(datos.value);
    data.datos.forEach(catalog => {
      catalog.categorias.forEach(categoria => {
        categoria.productos.forEach(product => {
          if (!currentImageIndex.value[product.id]) {
            currentImageIndex.value[product.id] = 0;
          }
        });
      });
    });
  } catch (err) {
    console.error('Error al listar el catálogo:', err);
    error.value = 'Hubo un error al cargar el catálogo. Por favor, intente de nuevo.';
  } finally {
    loading.value = false;
  }
};

const fororiteUser = async (idProducto) => {
  try {
    fovoritesForm.value = {
      "producto_id": idProducto,
    };
    await storeFavorite(fovoritesForm.value);
    // Show success notification
    showNotification('Producto agregado a favoritos', 'success');
  } catch (error) {
    console.error('Error al agregar a favoritos:', error.response?.data?.message || error);
    showNotification('Error al agregar a favoritos', 'error');
  }
};

const showNotification = (message, type) => {
  // This is a placeholder for a notification system
  console.log(`${type}: ${message}`);
  // You could implement a toast notification system here
};

const addToCart = (product) => {
  const cantidadMinima = product.cantidad_minima || 1;
  const productWithMinQuantity = { ...product, quantity: cantidadMinima };
  cartStore.addToCart(productWithMinQuantity);
  showNotification(`${product.nombre} agregado al carrito`, 'success');
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
  return images[currentImageIndex.value[product.id]] || product.imagen_principal || '/placeholder-image.jpg';
};

const getLastWord = (title) => {
  const words = title.split(' ');
  return words[words.length - 1]; // Retorna la última palabra
};
</script>

<style scoped>
/* Base Container */
.catalog-container {
  max-width: 1440px;
  margin: 0 auto;
  padding: 1.5rem;
  font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

/* Category Banner */
.category-banner {
  position: relative;
  height: clamp(300px, 50vh, 500px);
  cursor: pointer;
  overflow: hidden;
  border-radius: 12px;
  margin-bottom: 2rem;
}

.category-banner img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.category-banner:hover img {
  transform: scale(1.05);
}

.banner-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to right, rgba(0, 0, 0, 0.7), transparent);
  padding: 2rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  color: #fff;
}

.banner-overlay h2 {
  font-size: clamp(1.5rem, 4vw, 3rem);
  font-weight: 700;
  margin-bottom: 1rem;
}

.banner-overlay p {
  font-size: clamp(1rem, 2vw, 1.25rem);
  max-width: 60ch;
  margin-bottom: 1.5rem;
}

.banner-cta {
  padding: 0.75rem 1.5rem;
  background: #3498db;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  transition: all 0.3s ease;
  width: fit-content;
}

.banner-cta:hover {
  background: #2980b9;
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
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

/* Products Grid */
.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
  margin-bottom: 4rem;
}

.product-card {
  position: relative;
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  opacity: 0;
  transform: translateY(20px);
  animation: fadeInUp 0.6s forwards;
  animation-delay: calc(var(--index, 0) * 0.1s);
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
  transform: translateY(-8px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

/* Product Image */
.product-image-wrapper {
  position: relative;
  width: 100%;
  padding-bottom: 100%;
  background-color: #f7fafc;
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
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.product-card:hover .product-image img {
  transform: scale(1.08);
}

/* Navigation Buttons */
.nav-button {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background-color: rgba(255, 255, 255, 0.9);
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0;
  transition: all 0.3s ease;
  z-index: 2;
  color: #2d3748;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.nav-button.prev {
  left: 1rem;
}

.nav-button.next {
  right: 1rem;
}

.product-card:hover .nav-button {
  opacity: 1;
}

.nav-button:hover {
  background-color: white;
  transform: translateY(-50%) scale(1.1);
  color: #3498db;
}

/* Badge */
.badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  color: white;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 1;
}

.badge-limited {
  background-color: #e53e3e;
}

.badge-new {
  background-color: #38a169;
  animation: pulse 2s infinite;
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
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
}

.category {
  font-size: 0.8rem;
  color: #718096;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
}

.product-name {
  font-size: 1.1rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 0.75rem;
  line-height: 1.4;
  transition: color 0.3s ease;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  height: 3rem;
}

.product-card:hover .product-name {
  color: #3498db;
}

/* Rating System */
.rating-container {
  margin-bottom: 1rem;
}

.rating {
  display: flex;
  gap: 4px;
  margin-bottom: 0.25rem;
}

.star {
  color: #e2e8f0;
  font-size: 1.25rem;
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
  font-size: 0.8rem;
  color: #718096;
}

/* Price Section */
.price {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.current-price {
  font-weight: 700;
  font-size: 1.25rem;
  color: #2d3748;
}

.old-price {
  font-size: 0.875rem;
  color: #a0aec0;
  text-decoration: line-through;
}

/* Product Actions Bottom */
.product-actions-bottom {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: 1rem;
  padding: 1rem;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7) 20%, transparent);
  opacity: 0;
  transition: all 0.3s ease;
  z-index: 2;
}
.product-image:hover .product-actions-bottom {
  opacity: 1;
}
.action-button {
  background-color: rgba(255, 255, 255, 0.9);
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(4px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  color: #2d3748;
}

/* Añadir espacio inferior en la info del producto */
.product-info {
  padding-bottom: 2rem;
}
.action-button:hover {
  transform: scale(1.1);
}

.action-button.cart-button:hover {
  background-color: #3498db;
  color: white;
}

.action-button.view-button:hover {
  background-color: #2ecc71;
  color: white;
}

.action-button.favorite-button:hover {
  background-color: #e74c3c;
  color: white;
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
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
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
@media (max-width: 1200px) {
  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1.5rem;
  }
}

@media (max-width: 992px) {
  .catalog-container {
    padding: 1.25rem;
  }
  
  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 1.25rem;
  }
  
  .product-info {
    padding: 1.25rem;
  }
}

@media (max-width: 768px) {
  .catalog-container {
    padding: 1rem;
  }
  
  .category-banner {
    height: 300px;
  }
  
  .banner-overlay {
    padding: 1.5rem;
  }
  
  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
  }
  
  .nav-button {
    opacity: 0.8;
    width: 35px;
    height: 35px;
  }
  
  .product-info {
    padding: 1rem;
  }
  
  .product-name {
    font-size: 1rem;
  }
  .product-actions-bottom {
    opacity: 1;
    padding: 0.75rem;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.5) 30%, transparent);
  }
  
  .action-button {
    width: 35px;
    height: 35px;
  }
}

@media (max-width: 576px) {
  .products-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
  }
  
  .product-card:hover {
    transform: translateY(-4px);
  }
  
  .product-info {
    padding: 0.75rem;
  }
  
  .category {
    font-size: 0.7rem;
  }
  
  .product-name {
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
    height: 2.5rem;
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
  }
}

@media (max-width: 400px) {
  .products-grid {
    grid-template-columns: 1fr;
  }
  
  .product-image-wrapper {
    padding-bottom: 75%;
  }
  
  .category-banner {
    height: 200px;
  }
}

/* Dark Mode Support */
@media (prefers-color-scheme: dark) {
  .category-header h2 {
    color: #e2e8f0;
  }
  
  .category-header p {
    color: #a0aec0;
  }
  
  .product-card {
    background-color: #2d3748;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -1px rgba(0, 0, 0, 0.1);
  }
  
  .product-image-wrapper {
    background-color: #1a202c;
  }
  
  .product-name {
    color: #e2e8f0;
  }
  
  .product-card:hover .product-name {
    color: #63b3ed;
  }
  
  .category {
    color: #a0aec0;
  }
  
  .current-price {
    color: #e2e8f0;
  }
  
  .old-price {
    color: #718096;
  }
  
  .star {
    color: #4a5568;
  }
  
  .star.filled {
    color: #f6ad55;
  }
  
  .rating-count {
    color: #a0aec0;
  }
  
  .action-button {
    background-color: #4a5568;
    color: #e2e8f0;
  }
  
  .nav-button {
    background-color: rgba(74, 85, 104, 0.9);
    color: #e2e8f0;
  }
  
  .nav-button:hover {
    background-color: #4a5568;
  }
  
  .loading-overlay {
    background-color: rgba(26, 32, 44, 0.9);
  }
  
  .error-message {
    background-color: #742a2a;
    border-color: #9b2c2c;
    color: #fed7d7;
  }
  
  .error-icon {
    color: #fc8181;
  }
  
  .skeleton-banner,
  .skeleton-header,
  .skeleton-image,
  .skeleton-details {
    background-color: #4a5568;
  }
  
  .skeleton-card {
    background-color: #2d3748;
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
}
</style>