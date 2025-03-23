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
          <div class="category-banner-container">
            <div class="category-banner" @click="viewCollection">
              <img :src="categoria.banner" :alt="`Banner de ${categoria.nombre}`" loading="lazy" />
              <div class="banner-overlay">
                <div class="banner-content">
                  <h2 class="banner-title">{{ categoria.nombre }}</h2>
                  <div class="banner-description-container">
                    <p class="banner-description">
                      {{ getTruncatedDescription(categoria.descripcion) }}
                      <button v-if="isDescriptionTruncated(categoria.descripcion)" class="read-more-btn"
                        @click.stop="showDescriptionModal(categoria)">
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
                  <button class="modal-btn primary" @click="viewCollectionFromModal">
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
              {{ categoria.titulo.split(" ").slice(0, -1).join(" ") }}
              <span class="text-accent">{{ getLastWord(categoria.titulo) }}</span>
            </h2>
            <p>{{ categoria.subtitulo }}</p>
          </div>

          <!-- Products Grid -->
          <div class="products-grid">
            <div v-for="(product, productIndex) in categoria.productos" :key="product.id" class="product-card"
              :style="{ '--index': productIndex }" @click="verProducto(product.id)">
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
                    <span v-if="product.badge" class="badge badge-new">
                      <i class="fas fa-star-of-life"></i> {{ product.badge }}
                    </span>
                    <span v-if="product.descuento" class="badge badge-sale">
                      <i class="fas fa-bolt"></i> -{{ product.descuento }}%
                    </span>
                  </div>

                  <!-- Product Actions -->
                  <div class="product-actions-bottom">
                    <button class="action-button cart-btn" @click.stop="addToCart(product)"
                      aria-label="Agregar al carrito" :class="{ 'adding': addingToCart === product.id }">
                      <i class="fas"
                        :class="addingToCart === product.id ? 'fa-spinner fa-spin' : 'fa-shopping-cart'"></i>
                    </button>
                    <button class="action-button view-btn" @click.stop="verProducto(product.id)"
                      aria-label="Ver producto">
                      <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-button fav-btn" @click.stop="fororiteUser(product.id)"
                      aria-label="Agregar a favoritos"
                      :class="{ 'in-favorites': favoriteProducts.includes(product.id) }">
                      <i class="fas fa-heart"></i>
                    </button>
                  </div>
                </div>
              </div>
              <!-- Product Info -->
              <div class="product-info">
                <div class="category">
                  <i class="fas fa-tag"></i> {{ categoria?.nombre || 'General' }}
                </div>
                <h3 class="product-name">{{ product.nombre }}</h3>

           <!--      <div class="rating-container">
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
                    <span v-if="product.precio_anterior" class="old-price">{{ formatPrice(product.precio_anterior)
                    }}</span>
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
const fromCache = ref(false);
const addingToCart = ref(null);
const favoriteProducts = ref([]);
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
const viewCollectionFromModal = () => {
  closeModal();
  viewCollection();
};

onMounted(() => {
  listarCatalogo();
  indexRatingUser();

  // Cerrar modal con tecla Escape
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isModalOpen.value) {
      closeModal();
    }
  });
});

const verProducto = param => {
  router.push({ path: `/producto/${param}` });
};

const listarCatalogo = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await indexCatalogoItems();
    // Actualizar el estado de caché
    fromCache.value = response.fromCache || false;
    datos.value = response.data.datos;
    console.log(datos.value);
    // Inicializar los índices de imágenes para cada producto
    response.data.datos.forEach(catalog => {
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

// Función para forzar una actualización desde la API
const refreshCatalogo = async () => {
  loading.value = true;
  try {
    const response = await indexCatalogoItems({}, true); // forceRefresh = true
    datos.value = response.data.datos;
    fromCache.value = false;

    // Inicializar los índices de imágenes para cada producto
    response.data.datos.forEach(catalog => {
      catalog.categorias.forEach(categoria => {
        categoria.productos.forEach(product => {
          if (!currentImageIndex.value[product.id]) {
            currentImageIndex.value[product.id] = 0;
          }
        });
      });
    });
  } catch (err) {
    console.error('Error al actualizar el catálogo:', err);
    error.value = 'Hubo un error al actualizar el catálogo. Por favor, intente de nuevo.';
  } finally {
    loading.value = false;
  }
};

const fororiteUser = async (productId) => {
  try {
    fovoritesForm.value = {
      "producto_id": productId,
    };
    await storeFavorite(fovoritesForm.value);

    // Actualizar estado visual de favoritos
    const index = favoriteProducts.value.indexOf(productId);
    if (index > -1) {
      favoriteProducts.value.splice(index, 1);
    } else {
      favoriteProducts.value.push(productId);
    }

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
  addingToCart.value = product.id;
  try {
    const cantidadMinima = product.cantidad_minima || 1;
    const productWithMinQuantity = { ...product, quantity: cantidadMinima };
    cartStore.addToCart(productWithMinQuantity);
    showNotification(`${product.nombre} agregado al carrito`, 'success');
  } catch (error) {
    console.error('Error al agregar al carrito:', error);
    showNotification('Error al agregar al carrito', 'error');
  } finally {
    setTimeout(() => addingToCart.value = null, 800);
  }
};

const viewCollection = () => {
  // Implementar lógica para ver la colección
  console.log('Ver colección');
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

const formatPrice = (price) => {
  return new Intl.NumberFormat('es-BO', {
    style: 'currency',
    currency: 'BOB',
    minimumFractionDigits: 2
  }).format(price);
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
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
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
  background: linear-gradient(to right,
      rgba(0, 0, 0, 0.8) 0%,
      rgba(0, 0, 0, 0.6) 30%,
      rgba(0, 0, 0, 0.3) 60%,
      rgba(0, 0, 0, 0) 100%);
  display: flex;
  align-items: center;
  color: #fff;
  padding: 2rem;
  transition: background 0.3s ease;
}

.category-banner:hover .banner-overlay {
  background: linear-gradient(to right,
      rgba(0, 0, 0, 0.85) 0%,
      rgba(0, 0, 0, 0.65) 30%,
      rgba(0, 0, 0, 0.35) 60%,
      rgba(0, 0, 0, 0) 100%);
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
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
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
  color: var(--text-color);
  margin-bottom: 0.5rem;
}

.text-accent {
  color: var(--primary-color);
  position: relative;
}

.text-accent::after {
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

.category-header h2:hover .text-accent::after {
  transform: scaleX(1);
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
  color: var(--text-color);
}

.old-price {
  font-size: 0.75rem;
  color: #a0aec0;
  text-decoration: line-through;
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
    background: linear-gradient(to top,
        rgba(0, 0, 0, 0.8) 0%,
        rgba(0, 0, 0, 0.6) 40%,
        rgba(0, 0, 0, 0.3) 70%,
        rgba(0, 0, 0, 0) 100%);
    align-items: flex-end;
    padding: 1.5rem;
  }

  .category-banner:hover .banner-overlay {
    background: linear-gradient(to top,
        rgba(0, 0, 0, 0.85) 0%,
        rgba(0, 0, 0, 0.65) 40%,
        rgba(0, 0, 0, 0.35) 70%,
        rgba(0, 0, 0, 0) 100%);
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
  .refresh-button:hover,
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
}
</style>