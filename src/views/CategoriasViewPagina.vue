<script setup>
import { ref, onMounted, computed } from 'vue';
import { indexCategoriasConProductos } from '@/Services/CategoriaService';
import { useCartStore } from '@/stores/cart';
import { useRouter } from 'vue-router';
import { storeFavorite } from '@/Services/FavoriteService';
import { indexRatings, storeRating } from '@/Services/RatingService';

const router = useRouter();
const cartStore = useCartStore();

const categorias = ref([]);
const loading = ref(true);
const error = ref(null);
const currentPage = ref(1);
const totalPages = ref(1);
const searchQuery = ref('');
const selectedCategory = ref('');
const userRatings = ref([]);
const currentImageIndex = ref({});
const favoriteProducts = ref([]);
const addingToCart = ref(null);

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
  return images[currentImageIndex.value[product.id]] || '/placeholder.jpg';
};

const getLastWord = (title) => {
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
};

const showNotification = (message, type) => {
  // Implementación de notificaciones
  console.log(`${type}: ${message}`);
  // Aquí podrías implementar un sistema de notificaciones toast
};

onMounted(() => {
  listarCategorias();
  indexRatingUser();
});
</script>

<template>
  <div class="catalog-container">
    <!-- Main Title -->
    <h1 class="main-title">
      Explora Nuestras <span class="text-accent">Categorías</span>
    </h1>

    <!-- Search and Filter -->
    <div class="search-filter-bar">
      <div class="search-wrapper">
        <i class="fas fa-search search-icon"></i>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Buscar productos..."
          class="search-input"
          aria-label="Buscar productos"
        />
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

    <!-- Loading State -->
    <div v-if="loading" class="loading-overlay">
      <div class="spinner"></div>
      <p>Cargando catálogo...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-message">
      <i class="fas fa-exclamation-circle error-icon"></i>
      <p>{{ error }}</p>
      <button @click="listarCategorias" class="retry-button">
        <i class="fas fa-sync-alt"></i> Reintentar
      </button>
    </div>

    <!-- Catalog Content -->
    <div v-else class="categories-wrapper">
      <div v-for="(categoria, index) in filteredCategorias" :key="categoria.id" 
           class="category-section"
           :style="{ '--index': index }">
        <!-- Full-width Banner -->
        <div class="category-banner" @click="viewAllProducts(categoria.id)">
          <img :src="categoria.banner" :alt="categoria.nombre" loading="lazy" />
          <div class="banner-overlay">
            <div class="banner-content">
              <h2>
                {{ categoria.nombre }}
              </h2>
              <p>{{ categoria.descripcion }}</p>
              <button class="banner-cta">Explorar Colección</button>
            </div>
          </div>
        </div>

        <!-- Category Header -->
        <div class="category-header">
          <h2>
            {{ categoria.titulo ? categoria.titulo.split(" ").slice(0, -1).join(" ") : '' }}
            <span class="text-accent">{{ categoria.titulo ? getLastWord(categoria.titulo) : categoria.nombre }}</span>
          </h2>
          <p>{{ categoria.subtitulo }}</p>
        </div>

        <!-- Products Grid -->
        <div class="products-grid">
          <div v-for="product in categoria.productos" :key="product.id" class="product-card">
            <div class="product-image-container">
              <transition name="fade" mode="out-in">
                <img
                  :src="getCurrentImage(product)"
                  :alt="product.nombre"
                  loading="lazy"
                  :key="currentImageIndex[product.id]"
                />
              </transition>

              <!-- Navigation Buttons -->
              <button
                v-if="getProductImages(product).length > 1"
                class="nav-button prev"
                @click.stop="prevImage(product)"
                aria-label="Imagen anterior"
              >
                <i class="fas fa-chevron-left"></i>
              </button>
              <button
                v-if="getProductImages(product).length > 1"
                class="nav-button next"
                @click.stop="nextImage(product)"
                aria-label="Imagen siguiente"
              >
                <i class="fas fa-chevron-right"></i>
              </button>

              <!-- Badge -->
              <span v-if="product.badge" :class="['badge', product.badge === 'LIMITADO' ? 'limited' : 'new']">
                {{ product.badge }}
              </span>

              <!-- Product Actions -->
              <div class="product-actions">
                <button @click.stop="addToCart(product)" class="action-button" aria-label="Agregar al carrito"
                        :class="{ 'adding': addingToCart === product.id }">
                  <i class="fas" :class="addingToCart === product.id ? 'fa-spinner fa-spin' : 'fa-shopping-cart'"></i>
                </button>
                <button @click.stop="viewProductDetails(product.id)" class="action-button" aria-label="Ver producto">
                  <i class="fas fa-eye"></i>
                </button>
                <button @click.stop="favoriteUser(product.id)" class="action-button" aria-label="Agregar a favoritos"
                        :class="{ 'in-favorites': favoriteProducts.includes(product.id) }">
                  <i class="fas fa-heart"></i>
                </button>
              </div>
            </div>

            <!-- Product Info -->
            <div class="product-info">
              <span class="category-label">{{ product.categoria?.nombre || categoria.nombre }}</span>
              <h3 class="product-title">{{ product.nombre }}</h3>
              <div class="rating-container">
                <div class="stars">
                  <span
                    v-for="star in 5"
                    :key="star"
                    class="star"
                    :class="{ filled: star <= (userRatings.find(r => r.producto_id === product.id)?.rating || 0) }"
                    @click="storeRatingUser(product.id, star)"
                  >
                    ★
                  </span>
                </div>
                <span class="rating-count">
                  ({{ userRatings.find(r => r.producto_id === product.id)?.total_users || 0 }})
                </span>
              </div>
              <div class="price-container">
                <span class="current-price">{{ formatPrice(product.precio) }}</span>
                <span v-if="product.precio_anterior" class="old-price">{{ formatPrice(product.precio_anterior) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="pagination">
      <button
        v-for="page in totalPages"
        :key="page"
        @click="changePage(page)"
        :class="['page-button', { active: currentPage === page }]"
        :aria-label="`Ir a página ${page}`"
      >
        {{ page }}
      </button>
    </div>

    <!-- Skeleton Loader (Visible when loading) -->
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

<style scoped>
/* Base Container */
.catalog-container {
  max-width: 1440px;
  margin: 0 auto;
  padding: 2rem;
  font-family: 'Poppins', sans-serif;
  background: linear-gradient(to bottom, #f8f9fa 0%, #ffffff 100%);
}

/* Main Title */
.main-title {
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: 700;
  color: #1a202c;
  text-align: center;
  margin-bottom: 3rem;
  letter-spacing: -0.5px;
}

.text-accent {
  color: #3182ce;
  position: relative;
}

.text-accent::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: #3182ce;
  transform: scaleX(0);
  transition: transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  transform-origin: left;
}

.category-header h2:hover .text-accent::after {
  transform: scaleX(1);
}

/* Search and Filter Bar */
.search-filter-bar {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 3rem;
  max-width: 900px;
  margin-left: auto;
  margin-right: auto;
  align-items: center;
  animation: fadeIn 0.6s ease;
}

.search-wrapper {
  position: relative;
  flex: 2;
}

.search-icon {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #718096;
  font-size: 16px;
}

.search-input {
  width: 100%;
  padding: 1rem 1rem 1rem 3rem;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.search-input:focus {
  border-color: #3182ce;
  box-shadow: 0 0 0 3px rgba(49,130,206,0.2);
  outline: none;
}

.select-wrapper {
  position: relative;
  flex: 1;
}

.category-select {
  width: 100%;
  padding: 1rem 2.5rem 1rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1rem;
  background: white;
  appearance: none;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.category-select:focus {
  border-color: #3182ce;
  box-shadow: 0 0 0 3px rgba(49,130,206,0.2);
  outline: none;
}

.select-arrow {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #718096;
  font-size: 14px;
  pointer-events: none;
  transition: transform 0.3s ease;
}

.category-select:focus + .select-arrow {
  transform: translateY(-50%) rotate(180deg);
}

/* Category Section */
.categories-wrapper {
  display: flex;
  flex-direction: column;
  gap: 4rem;
}

.category-section {
  background: #ffffff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0,0,0,0.05);
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

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Full-width Responsive Banner */
.category-banner {
  position: relative;
  width: 100%;
  height: clamp(300px, 50vh, 500px);
  cursor: pointer;
  overflow: hidden;
  background: #f7fafc;
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
  background: linear-gradient(to right, rgba(0,0,0,0.7), transparent);
  display: flex;
  align-items: center;
}

.banner-content {
  max-width: 50%;
  color: #ffffff;
  padding: 2rem;
}

.banner-content h2 {
  font-size: clamp(1.8rem, 4vw, 3rem);
  font-weight: 700;
  margin-bottom: 1rem;
  line-height: 1.2;
}

.banner-content p {
  font-size: clamp(1rem, 2vw, 1.25rem);
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

.banner-cta {
  padding: 0.85rem 2rem;
  background: #38a169;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.banner-cta:hover {
  background: #2f855a;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

/* Category Header */
.category-header {
  text-align: center;
  padding: 2rem;
}

.category-header h2 {
  font-size: clamp(1.8rem, 3vw, 2.2rem);
  font-weight: 700;
  color: #2d3748;
}

.category-header p {
  font-size: clamp(1rem, 2vw, 1.1rem);
  color: #718096;
  max-width: 600px;
  margin: 0.5rem auto 0;
}

/* Products Grid */
.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
  padding: 2rem;
}

.product-card {
  background: #ffffff;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  border: 1px solid #edf2f7;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
}

.product-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.1);
}

/* Product Image */
.product-image-container {
  position: relative;
  aspect-ratio: 1 / 1;
  background: #f7fafc;
  overflow: hidden;
}

.product-image-container img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  transition: transform 0.4s ease;
}

.product-card:hover .product-image-container img {
  transform: scale(1.08);
}

.nav-button {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255,255,255,0.95);
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
  opacity: 0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  z-index: 2;
  color: #2d3748;
  display: flex;
  align-items: center;
  justify-content: center;
}

.product-card:hover .nav-button {
  opacity: 1;
}

.nav-button.prev {
  left: 1rem;
}

.nav-button.next {
  right: 1rem;
}

.nav-button:hover {
  background: #ffffff;
  transform: translateY(-50%) scale(1.05);
  color: #3182ce;
}

.badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  color: #ffffff;
  z-index: 1;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.badge.limited {
  background: #e53e3e;
}

.badge.new {
  background: #38a169;
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

/* Product Actions */
.product-actions {
  position: absolute;
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 0.75rem;
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 2;
}

.product-card:hover .product-actions {
  opacity: 1;
}

.action-button {
  width: 44px;
  height: 44px;
  background: #ffffff;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
  color: #4a5568;
}

.action-button:hover {
  background: #3182ce;
  color: #ffffff;
  transform: scale(1.1);
}

.action-button.in-favorites {
  background: #e53e3e;
  color: #ffffff;
}

.action-button.adding {
  pointer-events: none;
}

/* Product Info */
.product-info {
  padding: 1.5rem;
}

.category-label {
  font-size: 0.85rem;
  color: #a0aec0;
  text-transform: uppercase;
  margin-bottom: 0.5rem;
  display: block;
  letter-spacing: 0.5px;
  font-weight: 600;
}

.product-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 0.75rem;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  height: 3rem;
}

.product-card:hover .product-title {
  color: #3182ce;
}

.rating-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.stars {
  display: flex;
  gap: 4px;
}

.star {
  font-size: 1.1rem;
  color: #e2e8f0;
  cursor: pointer;
  transition: all 0.2s ease;
}

.star.filled {
  color: #ecc94b;
}

.star:hover {
  transform: scale(1.15);
}

.rating-count {
  font-size: 0.9rem;
  color: #718096;
}

.price-container {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.current-price {
  font-size: 1.3rem;
  font-weight: 700;
  color: #2d3748;
}

.old-price {
  font-size: 0.95rem;
  color: #a0aec0;
  text-decoration: line-through;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  gap: 0.75rem;
  margin-top: 3rem;
  padding-bottom: 2rem;
  animation: fadeIn 0.6s ease;
}

.page-button {
  padding: 0.75rem 1.25rem;
  background: #edf2f7;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  color: #4a5568;
}

.page-button.active {
  background: #3182ce;
  color: #ffffff;
}

.page-button:hover:not(.active) {
  background: #e2e8f0;
  transform: translateY(-2px);
}

/* Loading Overlay */
.loading-overlay {
  position: fixed;
  inset: 0;
  background: rgba(255,255,255,0.95);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #edf2f7;
  border-top: 4px solid #3182ce;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Error Message */
.error-message {
  padding: 2rem;
  background: #fefcbf;
  border-radius: 12px;
  text-align: center;
  margin: 2rem auto;
  max-width: 600px;
  border: 1px solid #fbd38d;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  animation: shakeX 0.75s cubic-bezier(.36,.07,.19,.97) both;
}

.error-icon {
  font-size: 3rem;
  color: #e53e3e;
}

@keyframes shakeX {
  10%, 90% {
    transform: translateX(-1px);
  }
  20%, 80% {
    transform: translateX(2px);
  }
  30%, 50%, 70% {
    transform: translateX(-4px);
  }
  40%, 60% {
    transform: translateX(4px);
  }
}

.retry-button {
  padding: 0.75rem 1.5rem;
  background: #3182ce;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.retry-button:hover {
  background: #2b6cb0;
  transform: translateY(-2px);
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

/* Responsive Design */
@media (max-width: 1024px) {
  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  }

  .banner-content {
    max-width: 60%;
  }
}

@media (max-width: 768px) {
  .catalog-container {
    padding: 1.5rem;
  }

  .search-filter-bar {
    flex-direction: column;
    gap: 1rem;
  }

  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1.5rem;
  }

  .banner-content {
    max-width: 70%;
  }

  .banner-content h2 {
    font-size: clamp(1.5rem, 3vw, 2rem);
  }

  .banner-cta {
    padding: 0.75rem 1.5rem;
  }

  .nav-button,
  .product-actions {
    opacity: 1;
  }
  
  .category-banner {
    height: 300px;
  }
}

@media (max-width: 480px) {
  .catalog-container {
    padding: 1rem;
  }

  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 1rem;
  }

  .banner-content {
    max-width: 100%;
    padding: 1rem;
  }

  .banner-content h2 {
    font-size: 1.5rem;
  }

  .banner-content p {
    font-size: 0.9rem;
  }

  .product-title {
    font-size: 1rem;
  }

  .current-price {
    font-size: 1.1rem;
  }

  .action-button {
    width: 36px;
    height: 36px;
  }

  .nav-button {
    width: 32px;
    height: 32px;
  }
}

@media (max-width: 360px) {
  .products-grid {
    grid-template-columns: 1fr;
  }

  .product-image-container {
    aspect-ratio: 4 / 3;
  }
}

/* Dark Mode Support */
@media (prefers-color-scheme: dark) {
  .catalog-container {
    background: linear-gradient(to bottom, #1a202c 0%, #2d3748 100%);
  }
  
  .category-section {
    background: #2d3748;
  }
  
  .main-title,
  .category-header h2 {
    color: #e2e8f0;
  }
  
  .category-header p {
    color: #a0aec0;
  }
  
  .product-card {
    background-color: #2d3748;
    border-color: #4a5568;
  }
  
  .product-image-container {
    background-color: #1a202c;
  }
  
  .product-title {
    color: #e2e8f0;
  }
  
  .product-card:hover .product-title {
    color: #63b3ed;
  }
  
  .category-label {
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
  
  .search-input,
  .category-select {
    background: #2d3748;
    border-color: #4a5568;
    color: #e2e8f0;
  }
  
  .search-icon,
  .select-arrow {
    color: #a0aec0;
  }
  
  .loading-overlay {
    background-color: rgba(26, 32, 44, 0.9);
    color: #e2e8f0;
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
  
  .product-card:hover .product-image-container img {
    transform: none;
  }
  
  .spinner {
    animation: none;
  }
  
  .badge.new {
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
  
  .category-section {
    animation: none;
    opacity: 1;
    transform: none;
  }
}
</style>