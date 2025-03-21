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
};

const showNotification = (message, type) => {
  // Implementación de notificaciones
  console.log(`${type}: ${message}`);
  // Aquí podrías implementar un sistema de notificaciones toast
};

onMounted(() => {
  listarCategorias();
  indexRatingUser();
  
  // Cerrar modal con tecla Escape
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isModalOpen.value) {
      closeModal();
    }
  });
});
</script>

<template>
  <div class="catalog-container">
    <!-- Main Title -->
    <h1 class="main-title">
      Explora Nuestras <span class="text-accent">Categorías</span>
    </h1>
    <!-- Filters Section -->
    <div class="filters-wrapper">
      <div class="filters">
        <div class="search-container">
          <div class="search-wrapper">
            <i class="fas fa-search search-icon"></i>
            <input v-model="searchQuery" type="text" placeholder="Buscar productos..." class="search-input" aria-label="Buscar productos" />
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
      <div v-for="(categoria, index) in filteredCategorias" :key="categoria.id" class="category-section" :style="{ '--index': index }">
        <!-- Full-width Banner -->
        <div class="category-banner-container">
          <div class="category-banner" @click="viewAllProducts(categoria.id)">
            <img :src="categoria.banner" :alt="categoria.nombre" loading="lazy" />
            <div class="banner-overlay">
              <div class="banner-content">
                <h2 class="banner-title">{{ categoria.nombre }}</h2>
                <div class="banner-description-container">
                  <p class="banner-description">
                    {{ getTruncatedDescription(categoria.descripcion) }}
                    <button 
                      v-if="isDescriptionTruncated(categoria.descripcion)" 
                      class="read-more-btn" 
                      @click.stop="showDescriptionModal(categoria)"
                    >
                      Ver más
                    </button>
                  </p>
                </div>
                <button class="banner-cta">
                  <span>Ver Colección</span>
                  <i class="fas fa-arrow-right"></i>
                </button>
              </div>
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

        <!-- Products Grid - Actualizado con estilos de productos recientes -->
        <div class="products-grid">
          <div v-for="(product, productIndex) in categoria.productos" :key="product.id" class="product-card"
            :style="{ '--index': productIndex }" @click="viewProductDetails(product.id)">
            <div class="product-image-wrapper">
              <div class="product-image">
                <transition name="fade" mode="out-in">
                  <img :src="getCurrentImage(product)" :alt="product.nombre" loading="lazy"
                    :key="currentImageIndex[product.id]" />
                </transition>

                <!-- Navigation Buttons -->
                <button v-if="getProductImages(product).length > 1" class="nav-button prev"
                  @click.stop="prevImage(product)" aria-label="Imagen anterior">
                  <i class="fas fa-chevron-left"></i>
                </button>
                <button v-if="getProductImages(product).length > 1" class="nav-button next"
                  @click.stop="nextImage(product)" aria-label="Imagen siguiente">
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
                </div>

                <!-- Product Actions Bottom -->
                <div class="product-actions-bottom">
                  <button @click.stop="addToCart(product)" class="action-button cart-btn" aria-label="Agregar al carrito"
                    :class="{ 'adding': addingToCart === product.id }">
                    <i class="fas" :class="addingToCart === product.id ? 'fa-spinner fa-spin' : 'fa-shopping-cart'"></i>
                  </button>
                  <button @click.stop="viewProductDetails(product.id)" class="action-button view-btn" aria-label="Ver producto">
                    <i class="fas fa-eye"></i>
                  </button>
                  <button @click.stop="favoriteUser(product.id)" class="action-button fav-btn" aria-label="Agregar a favoritos"
                    :class="{ 'in-favorites': favoriteProducts.includes(product.id) }">
                    <i class="fas fa-heart"></i>
                  </button>
                </div>
              </div>
            </div>

            <!-- Product Info -->
            <div class="product-info">
              <div class="category">
                <i class="fas fa-tag"></i> {{ product.categoria?.nombre || categoria.nombre }}
              </div>
              <h3 class="product-name">{{ product.nombre }}</h3>
           <!--    <div class="rating-container">
                <div class="rating">
                  <span v-for="star in 5" :key="star" class="star"
                    :class="{ 'filled': star <= (userRatings.find(r => r.producto_id === product.id)?.rating || 0) }"
                    @click.stop="storeRatingUser(product.id, star)">
                    ★
                  </span>
                </div>
                <div class="rating-count">
                  {{userRatings.find(r => r.producto_id === product.id)?.total_users || 0}} calificaciones
                </div>
              </div> -->
              <div class="price-container">
                <div class="price">
                  <span class="current-price">{{ formatPrice(product.precio) }}</span>
                  <span v-if="product.precio_anterior" class="old-price">{{ formatPrice(product.precio_anterior) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="pagination">
      <button v-for="page in totalPages" :key="page" @click="changePage(page)" :class="['page-button', { active: currentPage === page }]" :aria-label="`Ir a página ${page}`">
        {{ page }}
      </button>
    </div>
    
    <!-- Modal para descripción completa (fuera del bucle) -->
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

<style scoped>
/* Base Container */
.catalog-container {
  max-width: 1440px;
  margin: 0 auto;
  padding: 2rem;
  font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

/* Main Title */
.main-title {
  font-size: clamp(2rem, 5vw, 2.5rem);
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

/* Filters Section */
.filters-wrapper {
  position: sticky;
  top: 0;
  z-index: 100;
  background-color: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(10px);
  padding: 1rem 0;
  margin-bottom: 2rem;
  border-bottom: 1px solid rgba(226, 232, 240, 0.8);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.search-filter-bar {
  display: flex;
  gap: 1.5rem;
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
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.search-input:focus {
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
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
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.category-select:focus {
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
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

.category-select:focus+.select-arrow {
  transform: translateY(-50%) rotate(180deg);
}

/* Advanced Filters */
.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.search-container {
  position: relative;
  flex-grow: 1;
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
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
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

/* Container para mantener proporciones consistentes */
.category-banner-container {
  margin-bottom: 2rem;
  width: 100%;
  position: relative;
}

/* Banner principal con efectos mejorados */
.category-banner {
  position: relative;
  height: clamp(250px, 40vh, 500px);
  cursor: pointer;
  overflow: hidden;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.category-banner:hover {
  transform: translateY(-5px);
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

.banner-title {
  font-size: clamp(1.75rem, 5vw, 3.5rem);
  font-weight: 800;
  margin-bottom: 1rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  position: relative;
  display: inline-block;
}

.banner-title::after {
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

.category-banner:hover .banner-title::after {
  transform: scaleX(1);
}

.banner-description-container {
  position: relative;
}

.banner-description {
  font-size: clamp(1rem, 2vw, 1.25rem);
  max-width: 60ch;
  margin-bottom: 1.5rem;
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

.category-header p {
  font-size: clamp(1rem, 1.5vw, 1.25rem);
  color: #666;
  max-width: 700px;
  margin: 0 auto;
}

/* Products Grid - Estilos actualizados del componente de productos recientes */
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
  background: #3498db;
  color: #ffffff;
}

.page-button:hover:not(.active) {
  background: #e2e8f0;
  transform: translateY(-2px);
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
  
  .category-banner {
    height: clamp(200px, 50vh, 300px);
  }

  .banner-overlay {
    background: linear-gradient(
      to top,
      rgba(0, 0, 0, 0.8) 0%,
      rgba(0, 0, 0, 0.6) 40%,
      rgba(0, 0, 0, 0.3) 70%,
      rgba(0, 0, 0, 0) 100%
    );
    align-items: flex-end;
    padding: 1.5rem;
  }

  .category-banner:hover .banner-overlay {
    background: linear-gradient(
      to top,
      rgba(0, 0, 0, 0.85) 0%,
      rgba(0, 0, 0, 0.65) 40%,
      rgba(0, 0, 0, 0.35) 70%,
      rgba(0, 0, 0, 0) 100%
    );
  }

  .banner-content {
    max-width: 100%;
  }

  .banner-title {
    font-size: clamp(1.5rem, 7vw, 2.5rem);
  }

  .banner-description {
    font-size: clamp(0.875rem, 4vw, 1rem);
    margin-bottom: 1rem;
  }

  .banner-cta {
    padding: 0.6rem 1.25rem;
    font-size: 0.875rem;
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
}

@media (max-width: 480px) {
  .category-banner {
    height: 180px;
    border-radius: 8px;
  }

  .banner-overlay {
    padding: 1rem;
  }

  .banner-title {
    font-size: 1.25rem;
    margin-bottom: 0.5rem;
  }

  .banner-description {
    font-size: 0.8rem;
    margin-bottom: 0.75rem;
    -webkit-line-clamp: 2;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .banner-cta {
    padding: 0.5rem 1rem;
    font-size: 0.75rem;
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
}

@media (min-width: 480px) and (max-width: 575px) {
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
  }

  .banner-cta::before {
    display: none;
  }

  /* Añadir efecto de pulso para indicar interactividad */
  .banner-cta {
    animation: pulse 2s infinite;
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

  .spinner,
  .badge-new {
    animation: none;
  }

  .retry-button:hover,
  .action-button:hover,
  .banner-cta:hover,
  .reset-filters-button:hover,
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
}
</style>