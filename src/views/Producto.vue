<template>
  <div class="product-detail">
    <!-- Mobile Header (visible only on small screens) -->
    <div class="mobile-header">
      <div class="mobile-nav">
        <button class="back-button" @click="goBack">
          <i class="fas fa-arrow-left"></i>
        </button>
        <div class="badge-container">
          <span v-if="discountPercentage > 0" class="sale-badge">
            <i class="fas fa-bolt"></i> OFERTA
          </span>
          <span v-if="isNewProduct" class="new-badge">
            <i class="fas fa-star"></i> NUEVO
          </span>
        </div>
      </div>
      <h1 class="product-title">{{ dato.nombre }}</h1>

      <!-- Mobile Price Quick View - Enhanced and more visible -->
      <div class="mobile-price-preview">
        <span class="current-price">{{ formatPrice(selectedModelPrice) }}</span>
        <div class="price-details" v-if="originalPrice > selectedModelPrice">
          <span class="original-price">{{ formatPrice(originalPrice) }}</span>
          <span class="discount-badge">-{{ discountPercentage }}%</span>
        </div>
      </div>
    </div>

    <div class="product-container">
      <!-- Product Images Section -->
      <div class="product-images">
        <!-- Main Image with Zoom -->
        <div class="main-image-wrapper">
          <div class="main-image-container" @mousemove="handleImageZoom" @mouseleave="resetZoom"
            @touchstart="handleTouchStart" @touchmove="handleTouchMove" @touchend="resetZoom">
            <img :src="currentImage" :alt="dato.nombre" class="main-image-img" ref="mainImage">
            <div class="image-overlay">
              <span class="zoom-hint">
                <i class="fas fa-search-plus"></i>
                <span>Zoom</span>
              </span>
            </div>

            <!-- Image Navigation Arrows -->
            <button class="image-nav prev" @click="prevImage" v-if="allImages.length > 1">
              <i class="fas fa-chevron-left"></i>
            </button>
            <button class="image-nav next" @click="nextImage" v-if="allImages.length > 1">
              <i class="fas fa-chevron-right"></i>
            </button>

            <!-- Image Pagination Dots for Mobile -->
            <div class="image-pagination">
              <span v-for="(_, index) in allImages" :key="index"
                :class="['pagination-dot', { active: selectedImage === index }]" @click="selectThumbnail(index)">
              </span>
            </div>
          </div>
        </div>

        <!-- Thumbnails Gallery -->
        <div class="thumbnail-list" ref="thumbnailScroll">
          <div class="thumbnail-container">
            <div v-for="(image, index) in allImages" :key="index"
              :class="['thumbnail', { active: selectedImage === index }]" @click="selectThumbnail(index)">
              <img :src="image" :alt="`Vista ${index + 1}`" loading="lazy">
              <div class="thumbnail-overlay"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Product Info Section -->
      <div class="product-info">
        <div class="sticky-header desktop-only">
          <div class="badge-container">
            <span v-if="isNewProduct" class="new-badge">
              <i class="fas fa-star"></i> NUEVO
            </span>
          </div>
          <h1 class="product-title">{{ dato.nombre }}</h1>
          <h2 class="product-subtitle">{{ dato.subtitulo || 'Producto de Alta Calidad' }}</h2>
        </div>

        <!-- Mobile Only Subtitle -->
        <h2 class="product-subtitle mobile-only">{{ dato.subtitulo || 'Producto de Alta Calidad' }}</h2>

        <div class="info-content">
          <!-- Price Section (Desktop) -->
          <div class="price-section desktop-only">
            <div class="price-container">
              <div class="price-info">
                <span class="current-price">{{ formatPrice(selectedModelPrice) }}</span>
                <div class="price-details" v-if="originalPrice > selectedModelPrice">
                </div>
              </div>
            </div>
          </div>

          <!-- Accordion Sections for Mobile -->
          <div class="accordion-sections">
            <!-- Price Section for Mobile (NEW) -->
            <div class="accordion-section price-accordion" :class="{ 'expanded': true }">
              <div class="accordion-header">
                <h3 class="section-title">Precio</h3>
                <div class="mobile-price-info">
                  <span class="current-price">{{ formatPrice(selectedModelPrice) }}</span>
                  <div class="price-details" v-if="originalPrice > selectedModelPrice">
                    <span class="original-price">{{ formatPrice(originalPrice) }}</span>
                    <span class="discount-badge">-{{ discountPercentage }}%</span>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Features Section -->
            <div class="accordion-section" :class="{ 'expanded': expandedSection === 'features' }">
              <div class="accordion-header" @click="toggleSection('features')">
                <h3 class="section-title">Características Destacadas</h3>
                <i class="fas" :class="expandedSection === 'features' ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
              </div>
              <div class="accordion-content">
                <ul class="features">
                  <li v-for="caracteristica in visibleCaracteristicas" :key="caracteristica.id" class="feature-item"
                    :class="{ 'feature-hover': hoveredFeature === caracteristica.id }"
                    @mouseover="hoveredFeature = caracteristica.id" @mouseleave="hoveredFeature = null">
                    <i class="fas fa-check-circle"></i>
                    <span>{{ caracteristica.caracteristica }}</span>
                  </li>
                </ul>
                <button v-if="shouldShowMoreButton" @click.stop="toggleShowAllFeatures" class="show-more-btn">
                  <span>{{ showAllFeatures ? 'Ver menos' : 'Ver más' }}</span>
                  <i class="fas" :class="showAllFeatures ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
                </button>
              </div>
            </div>

            <!-- Colores Disponibles - Solo mostrar si hay colores -->
            <div v-if="hasColors" class="accordion-section" :class="{ 'expanded': expandedSection === 'colors' }">
              <div class="accordion-header" @click="toggleSection('colors')">
                <h3 class="section-title">Colores Disponibles</h3>
                <i class="fas" :class="expandedSection === 'colors' ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
              </div>
              <div class="accordion-content">
                <div class="color-options">
                  <button v-for="(image, index) in imagesWithColors" :key="index" class="color-swatch"
                    :style="{ backgroundColor: image.color }" @click="selectColor(getOriginalIndex(index))"
                    :class="{ active: selectedImage === getOriginalIndex(index) + 1 }">
                    <div class="color-checkmark" v-if="selectedImage === getOriginalIndex(index) + 1">
                      <i class="fas fa-check"></i>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            <!-- Model Selection -->
            <div class="accordion-section" :class="{ 'expanded': expandedSection === 'models' }">
              <div class="accordion-header" @click="toggleSection('models')">
                <h3 class="section-title">Selecciona el Modelo</h3>
                <i class="fas" :class="expandedSection === 'models' ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
              </div>
              <div class="accordion-content">
                <div class="model-grid">
                  <button v-for="model in dato.modelos" :key="model.id"
                    :class="['model-card', { active: selectedModel === model.id }]" @click="selectModel(model)">
                    <span class="model-name">{{ model.nombre }}</span>
                    <span class="model-price">{{ formatPrice(model.precio) }}</span>
                    <div class="model-stock" v-if="model.cantidad_maxima <= 5">
                      <i class="fas fa-exclamation-circle"></i>
                      Últimas unidades
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Desktop Features Section -->
          <div class="features-section desktop-only">
            <h3 class="section-title">Características Destacadas</h3>
            <ul class="features">
              <li v-for="caracteristica in visibleCaracteristicas" :key="caracteristica.id" class="feature-item"
                :class="{ 'feature-hover': hoveredFeature === caracteristica.id }"
                @mouseover="hoveredFeature = caracteristica.id" @mouseleave="hoveredFeature = null">
                <i class="fas fa-check-circle"></i>
                <span>{{ caracteristica.caracteristica }}</span>
              </li>
            </ul>
            <button v-if="shouldShowMoreButton" @click="toggleShowAllFeatures" class="show-more-btn desktop">
              <span>{{ showAllFeatures ? 'Ver menos' : 'Ver más' }}</span>
              <i class="fas" :class="showAllFeatures ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
            </button>
          </div>

          <!-- Desktop Color Section - Solo mostrar si hay colores -->
          <div v-if="hasColors" class="color-section desktop-only">
            <h3 class="section-title">Colores Disponibles</h3>
            <div class="color-options">
              <button v-for="(image, index) in imagesWithColors" :key="index" class="color-swatch"
                :style="{ backgroundColor: image.color }" @click="selectColor(getOriginalIndex(index))"
                :class="{ active: selectedImage === getOriginalIndex(index) + 1 }">
                <div class="color-checkmark" v-if="selectedImage === getOriginalIndex(index) + 1">
                  <i class="fas fa-check"></i>
                </div>
              </button>
            </div>
          </div>

          <!-- Desktop Model Selection -->
          <div class="model-section desktop-only">
            <h3 class="section-title">Selecciona el Modelo</h3>
            <div class="model-grid">
              <button v-for="model in dato.modelos" :key="model.id"
                :class="['model-card', { active: selectedModel === model.id }]" @click="selectModel(model)">
                <span class="model-name">{{ model.nombre }}</span>
                <span class="model-price">{{ formatPrice(model.precio) }}</span>
                <div class="model-stock" v-if="model.cantidad_maxima <= 5">
                  <i class="fas fa-exclamation-circle"></i>
                  Últimas unidades
                </div>
              </button>
            </div>
          </div>

          <!-- Purchase Section -->
          <div class="purchase-section">
            <div class="quantity-section">
              <span class="quantity-label">Cantidad:</span>
              <div class="quantity-controls">
                <button @click="decreaseQuantity" :disabled="quantity <= cantMinimaModel" class="quantity-btn"
                  :class="{ 'pulse': quantity > cantMinimaModel }">
                  <i class="fas fa-minus"></i>
                </button>
                <input type="number" v-model="quantity" :min="cantMinimaModel" :max="cantMaximaModel"
                  class="quantity-input" @change="validateQuantity">
                <button @click="increaseQuantity" :disabled="quantity >= cantMaximaModel" class="quantity-btn"
                  :class="{ 'pulse': quantity < cantMaximaModel }">
                  <i class="fas fa-plus"></i>
                </button>
              </div>
              <span class="quantity-limits">
                Mínimo: {{ cantMinimaModel }} | Máximo: {{ cantMaximaModel }}
              </span>
            </div>

            <div class="action-buttons">
              <button class="add-to-cart" @click="addToCart" :disabled="!selectedModel || addingToCart"
                :class="{ 'loading': addingToCart }">
                <i class="fas" :class="addingToCart ? 'fa-spinner fa-spin' : 'fa-shopping-cart'"></i>
                <span>{{ addingToCart ? 'Agregando...' : 'Agregar al carrito' }}</span>
                <span class="btn-shine"></span>
              </button>
              <button class="add-to-wishlist" :class="{ 'in-wishlist': isInWishlist }" @click="toggleWishlist">
                <i class="fas" :class="isInWishlist ? 'fa-heart' : 'fa-heart'"></i>
                <div class="tooltip">
                  {{ isInWishlist ? 'Quitar de favoritos' : 'Agregar a favoritos' }}
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Rating -->
    <div class="rating-section" v-if="dato.id">
      <h2 class="section-title">
        Calificaciones y <span class="text-accent">Opiniones</span>
      </h2>

      <div class="rating-overview">
        <div class="rating-summary">
          <div class="average-rating">
            <span class="rating-value">{{ productRating.average_rating || 0 }}</span>
            <div class="rating-stars large">
              <div class="stars-container">
                <div class="stars-background">★★★★★</div>
                <div class="stars-foreground" :style="{ width: `${(productRating.average_rating || 0) * 20}%` }">★★★★★
                </div>
              </div>
            </div>
            <span class="rating-count">{{ productRating.total_ratings || 0 }} calificaciones</span>
          </div>

          <div class="rating-progress">
            <div v-for="i in 5" :key="i" class="rating-bar">
              <div class="rating-label">{{ 6 - i }} <span class="star-icon">★</span></div>
              <div class="progress-container">
                <div class="progress-bar" :style="{ width: `${productRating.rating_percentages?.[6 - i] || 0}%` }"></div>
              </div>
              <div class="rating-percentage">{{ productRating.rating_percentages?.[6 - i] || 0 }}%</div>
            </div>
          </div>
        </div>

        <div class="user-rating">
          <h4>Tu calificación</h4>
          <div class="rating-stars interactive" :class="{ 'has-rated': userRating > 0 }">
            <span v-for="star in 5" :key="star" class="star"
              :class="{ 'filled': star <= userRating, 'hover': star <= hoverRating && !isRatingSubmitting }"
              @mouseover="hoverRating = star" @mouseleave="hoverRating = 0" @click="rateProduct(star)">
              ★
            </span>
          </div>
          <div class="rating-label" v-if="userRating > 0">
            {{ getRatingLabel(userRating) }}
          </div>
          <div class="rating-label" v-else-if="hoverRating > 0 && !isRatingSubmitting">
            {{ getRatingLabel(hoverRating) }}
          </div>
          <div class="rating-label placeholder" v-else>
            Toca para calificar
          </div>
          
          <div class="rating-actions" v-if="userRating > 0">
            <button class="submit-rating" @click="submitRating" :disabled="isRatingSubmitting"
              :class="{ 'loading': isRatingSubmitting }">
              <i class="fas" :class="isRatingSubmitting ? 'fa-spinner fa-spin' : 'fa-check'"></i>
              {{ isRatingSubmitting ? 'Enviando...' : 'Guardar calificación' }}
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Productos Similares - Sección mejorada -->
    <div class="similar-products-section" v-if="productosSimilares.length > 0">
      <h2 class="section-title">
        Productos <span class="text-accent">Similares</span>
      </h2>

      <!-- Products Grid - Diseño mejorado y más responsive -->
      <div class="products-grid">
        <div v-for="(product, index) in productosSimilares" :key="product.id" class="product-card"
          :style="{ '--index': index }" @click="navegarAProducto(product.id)">
          <div class="product-image-wrapper">
            <div class="product-image">
              <transition name="fade" mode="out-in">
                <img :key="currentImageIndexSimilar[product.id]" :src="getCurrentImageSimilar(product)"
                  :alt="product.nombre" loading="lazy">
              </transition>

              <!-- Navigation Buttons -->
              <button class="nav-button prev" @click.stop="prevImageSimilar(product)"
                v-if="getProductImagesSimilar(product).length > 1">
                <i class="fas fa-chevron-left"></i>
              </button>
              <button class="nav-button next" @click.stop="nextImageSimilar(product)"
                v-if="getProductImagesSimilar(product).length > 1">
                <i class="fas fa-chevron-right"></i>
              </button>

              <!-- Badges -->
              <div class="badges">
                <span v-if="isNewProductSimilar(product)" class="badge badge-new">
                  <i class="fas fa-star-of-life"></i> NUEVO
                </span>
                <span v-if="getDiscountPercentage(product) > 0" class="badge badge-sale">
                  <i class="fas fa-bolt"></i> -{{ getDiscountPercentage(product) }}%
                </span>
              </div>

              <!-- Product Actions -->
              <div class="product-actions-bottom">
                <button class="action-button cart-btn" @click.stop="addToCartSimilar(product)"
                  aria-label="Agregar al carrito" :class="{ 'adding': addingToCartSimilar === product.id }">
                  <i class="fas"
                    :class="addingToCartSimilar === product.id ? 'fa-spinner fa-spin' : 'fa-shopping-cart'"></i>
                </button>
                <button class="action-button view-btn" @click.stop="navegarAProducto(product.id)"
                  aria-label="Ver producto">
                  <i class="fas fa-eye"></i>
                </button>
                <button class="action-button fav-btn" @click.stop="toggleFavoriteSimilar(product.id)"
                  aria-label="Agregar a favoritos"
                  :class="{ 'in-favorites': favoriteProductsSimilar.includes(product.id) }">
                  <i class="fas fa-heart"></i>
                </button>
              </div>
            </div>
          </div>
          <!-- Product Info -->
          <div class="product-info-card">
            <div class="category">
              <i class="fas fa-tag"></i> {{ product.categoria?.nombre || 'Sin categoría' }}
            </div>
            <h3 class="product-name">{{ product.nombre }}</h3>

            <div class="rating-container">
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
    </div>

    <!-- Mobile Sticky Add to Cart Bar -->
    <div class="mobile-sticky-bar">
      <div class="mobile-price">
        <div class="mobile-product-name">{{ dato.nombre }}</div>
        <div class="price-container">
          <span class="current-price">{{ formatPrice(selectedModelPrice) }}</span>
          <span class="original-price" v-if="originalPrice > selectedModelPrice">{{ formatPrice(originalPrice) }}</span>
        </div>
      </div>
      <button class="mobile-add-to-cart" @click="addToCart" :disabled="!selectedModel || addingToCart"
        :class="{ 'loading': addingToCart }">
        <i class="fas" :class="addingToCart ? 'fa-spinner fa-spin' : 'fa-shopping-cart'"></i>
        <span>{{ addingToCart ? 'Agregando...' : 'Agregar' }}</span>
      </button>
    </div>

    <!-- Mobile Share Button - Improved visibility -->
    <button class="mobile-share-button" @click="shareProduct">
      <i class="fas fa-share-alt"></i>
    </button>

    <!-- Mobile Swipe Indicator -->
    <div class="swipe-indicator" v-if="showSwipeIndicator">
      <div class="swipe-icon">
        <i class="fas fa-hand-pointer"></i>
        <i class="fas fa-arrows-alt-h"></i>
      </div>
      <span>Desliza para ver más imágenes</span>
    </div>

    <!-- Toast Notifications -->
    <div class="toast-container">
      <div v-for="(toast, index) in toasts" :key="index" 
           class="toast" 
           :class="[toast.type, {'toast-visible': toast.visible}]">
        <i class="fas" :class="getToastIcon(toast.type)"></i>
        <span>{{ toast.message }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { detalleProducto } from '@/Services/ProductoService';
import { useCartStore } from '@/stores/cart';
import { indexRatings, storeRating, getProductRatingStats } from '@/Services/RatingService';

const dato = ref({});
const router = useRouter();
const route = useRoute(); // Use route to access current route params
const selectedImage = ref(0);
const selectedModel = ref(null);
const selectedModelPrice = ref(0);
const nameModel = ref('');
const cantMinimaModel = ref(1);
const cantMaximaModel = ref(10);
const originalPrice = ref(0);
const idProducto = router.currentRoute.value.params.idProducto;
const cartStore = useCartStore();
const quantity = ref(1);
const addingToCart = ref(false);
const isInWishlist = ref(false);
const mainImage = ref(null);
const showScrollButtons = ref(false);
const thumbnailScroll = ref(null);
const animatePrice = ref(false);
const expandedSection = ref('features');
const touchStartX = ref(0);
const touchEndX = ref(0);
const selectedColor = ref(null);
const selectedColorImage = ref('');
const hoveredFeature = ref(null);
// Variables para productos similares
const productosSimilares = ref([]);
const currentImageIndexSimilar = ref({});
const favoriteProductsSimilar = ref([]);
const addingToCartSimilar = ref(null);
const userRatings = ref([]);
// Variables para la funcionalidad "Ver más" en características
const showAllFeatures = ref(false);
// Variables para el sistema de calificación
const userRating = ref(0);
const hoverRating = ref(0);
const isRatingSubmitting = ref(false);
const productRating = ref({
  average_rating: 0,
  total_ratings: 0,
  rating_percentage: 0,
  rating_distribution: {
    '1': 0, '2': 0, '3': 0, '4': 0, '5': 0
  },
  rating_percentages: {
    '1': 0, '2': 0, '3': 0, '4': 0, '5': 0
  }
});

// New mobile UX variables
const cartItemCount = computed(() => cartStore.productos?.length || 0);
const showSwipeIndicator = ref(true);
const toasts = ref([]);
const hasScrolled = ref(false);

// Etiquetas descriptivas para cada nivel de calificación
const ratingLabels = {
  1: 'Muy malo',
  2: 'Malo',
  3: 'Regular',
  4: 'Bueno',
  5: 'Excelente'
};

// Obtener la etiqueta correspondiente a una calificación
const getRatingLabel = (rating) => {
  return ratingLabels[rating] || '';
};

// Cargar las estadísticas de calificación del producto
const loadProductRatingStats = async (productId) => {
  try {
    const { data } = await getProductRatingStats(productId);
    productRating.value = data;

    // Verificar si el usuario ya ha calificado este producto
    checkUserRating(productId);
  } catch (error) {
    console.error('Error al cargar estadísticas de calificación:', error);
  }
};

// Verificar si el usuario ya ha calificado este producto
const checkUserRating = async (productId) => {
  try {
    // Esta función debería implementarse en el servicio de calificaciones
    // Aquí usaremos los datos que ya tenemos en userRatings
    const userRatingData = userRatings.value.find(r => r.producto_id === parseInt(productId));

    if (userRatingData) {
      userRating.value = userRatingData.rating;
    } else {
      userRating.value = 0;
    }
  } catch (error) {
    console.error('Error al verificar calificación del usuario:', error);
  }
};

// Calificar el producto
const rateProduct = (rating) => {
  if (isRatingSubmitting.value) return;

  // Si el usuario hace clic en la misma calificación, la elimina
  if (userRating.value === rating && hoverRating.value === rating) {
    userRating.value = 0;
  } else {
    userRating.value = rating;
  }
};

// Enviar la calificación
const submitRating = async () => {
  if (isRatingSubmitting.value || !userRating.value || !dato.value.id) return;

  isRatingSubmitting.value = true;

  try {
    await storeRating({
      producto_id: dato.value.id,
      rating: userRating.value
    });

    // Recargar las estadísticas de calificación
    await loadProductRatingStats(dato.value.id);

    // Actualizar las calificaciones de usuario
    await indexRatingUser();

    // Mostrar notificación de éxito
    showToast('Calificación guardada correctamente', 'success');

    isRatingSubmitting.value = false;
  } catch (error) {
    console.error('Error al enviar calificación:', error);
    showToast('Error al guardar la calificación', 'error');
    isRatingSubmitting.value = false;
  }
};

// Calcular todas las imágenes disponibles (principal + colores)
const allImages = computed(() => {
  return [dato.value.imagen_principal, ...(dato.value.images?.map(img => img.imagen) || [])];
});

// Filtrar imágenes que tienen color
const imagesWithColors = computed(() => {
  return dato.value.images?.filter(img => img.color !== null) || [];
});

// Verificar si hay colores disponibles
const hasColors = computed(() => {
  return imagesWithColors.value.length > 0;
});

// Función para obtener el índice original de una imagen con color
const getOriginalIndex = (filteredIndex) => {
  if (!dato.value.images) return filteredIndex;

  const imageWithColor = imagesWithColors.value[filteredIndex];
  return dato.value.images.findIndex(img => img.id === imageWithColor.id);
};

// Imagen actual seleccionada
const currentImage = computed(() => allImages.value[selectedImage.value]);

// Calcular porcentaje de descuento
const discountPercentage = computed(() => {
  if (originalPrice.value > selectedModelPrice.value) {
    return Math.round((1 - selectedModelPrice.value / originalPrice.value) * 100);
  }
  return 0;
});

// Determinar si el producto es nuevo (menos de 30 días)
const isNewProduct = computed(() => {
  if (!dato.value.created_at) return false;
  const productDate = new Date(dato.value.created_at);
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  return productDate > thirtyDaysAgo;
});

// Computed para mostrar características limitadas o todas
const visibleCaracteristicas = computed(() => {
  if (!dato.value.caracteristicas) return [];
  return showAllFeatures.value ? dato.value.caracteristicas : dato.value.caracteristicas.slice(0, 5);
});

// Computed para determinar si se debe mostrar el botón "Ver más"
const shouldShowMoreButton = computed(() => {
  return dato.value.caracteristicas && dato.value.caracteristicas.length > 5;
});

// Función para alternar la visualización de todas las características
const toggleShowAllFeatures = (event) => {
  if (event) event.stopPropagation();
  showAllFeatures.value = !showAllFeatures.value;
};

// Animar elementos al cargar
const animateElements = () => {
  const elements = document.querySelectorAll('.product-detail .animate-on-load');
  elements.forEach((el, index) => {
    setTimeout(() => {
      el.classList.add('animated');
    }, index * 100);
  });
};

// Verificar si se necesitan botones de desplazamiento para miniaturas
const checkThumbnailScroll = () => {
  if (!thumbnailScroll.value) return;
  const container = thumbnailScroll.value.querySelector('.thumbnail-container');
  showScrollButtons.value = container.scrollWidth > container.clientWidth;
};

// Seleccionar un modelo
const selectModel = (model) => {
  selectedModel.value = model.id;
  animatePrice.value = true;

  setTimeout(() => {
    selectedModelPrice.value = model.precio;
    nameModel.value = model.nombre;
    cantMinimaModel.value = model.cantidad_minima || 1;
    cantMaximaModel.value = model.cantidad_maxima || 10;
    quantity.value = cantMinimaModel.value;

    setTimeout(() => {
      animatePrice.value = false;
    }, 300);
  }, 150);
};

// Seleccionar un color
const selectColor = (index) => {
  selectedImage.value = index + 1;
  if (dato.value.images && dato.value.images[index]) {
    selectedColor.value = dato.value.images[index].color;
    selectedColorImage.value = dato.value.images[index].imagen;
  }
};

// Validar cantidad
const validateQuantity = () => {
  quantity.value = Math.max(cantMinimaModel.value, Math.min(cantMaximaModel.value, quantity.value));
};

// Aumentar cantidad
const increaseQuantity = () => {
  if (quantity.value < cantMaximaModel.value) quantity.value++;
};

// Disminuir cantidad
const decreaseQuantity = () => {
  if (quantity.value > cantMinimaModel.value) quantity.value--;
};

// Agregar al carrito
const addToCart = async () => {
  if (addingToCart.value) return;
  addingToCart.value = true;

  try {
    const productWithModelPrice = {
      ...dato.value,
      imagen_principal: selectedColorImage.value || dato.value.imagen_principal,
      precio: selectedModelPrice.value,
      modeloId: selectedModel.value,
      nombreModelo: nameModel.value,
      cantidad: quantity.value,
      cantidad_minima: cantMinimaModel.value,
      cantidad_maxima: cantMaximaModel.value,
      color: selectedColor.value,
      colorImage: selectedColorImage.value,
      uniqueId: `${dato.value.id}-${selectedModel.value}-${selectedColor.value || 'default'}`
    };

    await cartStore.addToCart(productWithModelPrice);
    showAddedToCartAnimation();
    showToast('Producto agregado al carrito', 'success');
  } catch (error) {
    console.error('Error al agregar al carrito:', error);
    showToast('Error al agregar al carrito', 'error');
  } finally {
    setTimeout(() => {
      addingToCart.value = false;
    }, 800);
  }
};

// Mostrar animación de agregado al carrito
const showAddedToCartAnimation = () => {
  const cartBtn = document.querySelector('.add-to-cart');
  if (cartBtn) {
    cartBtn.classList.add('success');
    setTimeout(() => {
      cartBtn.classList.remove('success');
    }, 2000);
  }
};

// Manejar zoom de imagen
const handleImageZoom = (event) => {
  if (!mainImage.value) return;
  const { left, top, width, height } = mainImage.value.getBoundingClientRect();
  const x = (event.clientX - left) / width;
  const y = (event.clientY - top) / height;
  mainImage.value.style.transformOrigin = `${x * 100}% ${y * 100}%`;
  mainImage.value.style.transform = 'scale(1.8)';
};

// Manejar inicio de toque
const handleTouchStart = (event) => {
  touchStartX.value = event.touches[0].clientX;
  
  // Hide swipe indicator after first interaction
  if (showSwipeIndicator.value && !hasScrolled.value) {
    hasScrolled.value = true;
    setTimeout(() => {
      showSwipeIndicator.value = false;
    }, 1500);
  }
};

// Manejar movimiento de toque
const handleTouchMove = (event) => {
  // Zoom con dos dedos
  if (event.touches.length === 2) {
    if (!mainImage.value) return;
    const touch = event.touches[0];
    const { left, top, width, height } = mainImage.value.getBoundingClientRect();
    const x = (touch.clientX - left) / width;
    const y = (touch.clientY - top) / height;
    mainImage.value.style.transformOrigin = `${x * 100}% ${y * 100}%`;
    mainImage.value.style.transform = 'scale(1.8)';
    return;
  }

  // Deslizar para cambiar imagen
  touchEndX.value = event.touches[0].clientX;
  const diffX = touchStartX.value - touchEndX.value;

  if (Math.abs(diffX) > 50) {
    if (diffX > 0) nextImage();
    else prevImage();
    touchStartX.value = touchEndX.value;
  }
};

// Resetear zoom
const resetZoom = () => {
  if (mainImage.value) mainImage.value.style.transform = 'scale(1)';
};

// Seleccionar miniatura
const selectThumbnail = (index) => {
  const imgElement = mainImage.value;
  if (imgElement) {
    imgElement.classList.add('changing');
    setTimeout(() => {
      selectedImage.value = index;
      setTimeout(() => {
        imgElement.classList.remove('changing');
      }, 300);
    }, 150);
  } else {
    selectedImage.value = index;
  }
};

// Ir a la siguiente imagen
const nextImage = () => {
  if (selectedImage.value < allImages.value.length - 1) {
    selectThumbnail(selectedImage.value + 1);
  } else {
    selectThumbnail(0);
  }
};

// Ir a la imagen anterior
const prevImage = () => {
  if (selectedImage.value > 0) {
    selectThumbnail(selectedImage.value - 1);
  } else {
    selectThumbnail(allImages.value.length - 1);
  }
};

// Alternar favoritos
const toggleWishlist = () => {
  const heartBtn = document.querySelector('.add-to-wishlist');
  if (heartBtn) {
    heartBtn.classList.add('animate-heart');
    setTimeout(() => {
      isInWishlist.value = !isInWishlist.value;
      setTimeout(() => {
        heartBtn.classList.remove('animate-heart');
      }, 300);
    }, 300);
  } else {
    isInWishlist.value = !isInWishlist.value;
  }
  
  showToast(isInWishlist.value ? 'Agregado a favoritos' : 'Eliminado de favoritos', 'info');
};

// Formatear precio
const formatPrice = (price) => {
  return new Intl.NumberFormat('es-BO', {
    style: 'currency',
    currency: 'BOB',
    minimumFractionDigits: 2
  }).format(price);
};

// Alternar sección de acordeón
const toggleSection = (section) => {
  expandedSection.value = expandedSection.value === section ? null : section;
};

// Funciones para productos similares
const getProductImagesSimilar = (product) => {
  const mainImage = product.imagen_principal;
  const additionalImages = product.images?.map(img => img.imagen) || [];
  return [mainImage, ...additionalImages].filter(Boolean);
};

const nextImageSimilar = (product) => {
  const images = getProductImagesSimilar(product);
  if (images.length > 1) {
    currentImageIndexSimilar.value[product.id] = (currentImageIndexSimilar.value[product.id] + 1) % images.length;
  }
};

const prevImageSimilar = (product) => {
  const images = getProductImagesSimilar(product);
  if (images.length > 1) {
    currentImageIndexSimilar.value[product.id] = (currentImageIndexSimilar.value[product.id] - 1 + images.length) % images.length;
  }
};

const getCurrentImageSimilar = (product) => {
  const images = getProductImagesSimilar(product);
  return images[currentImageIndexSimilar.value[product.id]] || product.imagen_principal || '/placeholder.jpg';
};

const isNewProductSimilar = (product) => {
  if (!product.created_at) return false;
  const productDate = new Date(product.created_at);
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  return productDate > thirtyDaysAgo;
};

const getDiscountPercentage = (product) => {
  if (product.precio_anterior && product.precio_anterior > product.precio) {
    return Math.round((1 - product.precio / product.precio_anterior) * 100);
  }
  return 0;
};

const addToCartSimilar = async (product) => {
  addingToCartSimilar.value = product.id;
  try {
    const cantidadMinima = product.cantidad_minima || 1;
    const productWithMinQuantity = { ...product, quantity: cantidadMinima };
    await cartStore.addToCart(productWithMinQuantity);
    showToast(`${product.nombre} agregado al carrito`, 'success');
  } catch (error) {
    console.error('Error al agregar al carrito:', error);
    showToast('Error al agregar al carrito', 'error');
  } finally {
    setTimeout(() => addingToCartSimilar.value = null, 800);
  }
};

const toggleFavoriteSimilar = async (productId) => {
  try {
    await storeFavorite({ producto_id: productId });
    const index = favoriteProductsSimilar.value.indexOf(productId);
    if (index > -1) {
      favoriteProductsSimilar.value.splice(index, 1);
      showToast('Eliminado de favoritos', 'info');
    } else {
      favoriteProductsSimilar.value.push(productId);
      showToast('Agregado a favoritos', 'success');
    }
  } catch (error) {
    console.error('Error al agregar a favoritos:', error.response?.data?.message || error);
    showToast('Error al agregar a favoritos', 'error');
  }
};

// Improved navigation function
const navegarAProducto = async (productId) => {
  // Avoid reloading the same product
  if (productId === parseInt(route.params.idProducto)) return;

  try {
    // First approach: Force component reload by using a key
    // This is done by navigating with replace and adding a timestamp
    await router.replace({
      path: `/producto/${productId}`,
      query: { _t: Date.now() } // Add timestamp to force reload
    });

    // Second approach: Manually reload the data after navigation
    const { data } = await detalleProducto(productId);
    dato.value = data.dato;
    productosSimilares.value = data.productos_similares || [];

    // Reset all state variables
    selectedImage.value = 0;
    selectedModel.value = null;
    selectedColor.value = null;
    selectedColorImage.value = '';
    showAllFeatures.value = false;
    showSwipeIndicator.value = true;
    hasScrolled.value = false;

    // Initialize similar products image indices
    productosSimilares.value.forEach(product => {
      currentImageIndexSimilar.value[product.id] = 0;
    });

    // Select first model if available
    if (dato.value.modelos?.length > 0) {
      selectModel(dato.value.modelos[0]);
    } else {
      originalPrice.value = dato.value.precio;
      selectedModelPrice.value = originalPrice.value;
    }

    // Reload ratings
    indexRatingUser();

    // Animate elements after loading
    nextTick(() => {
      animateElements();
      document.querySelector('.product-detail')?.classList.add('loaded');
      window.scrollTo(0, 0); // Scroll to top
    });

  } catch (error) {
    console.error('Error al navegar al producto:', error);
    // Fallback to traditional navigation if the above fails
    router.push(`/producto/${productId}`);
  }
};

// Navigation functions
const goBack = () => {
  router.go(-1);
};

const goToHome = () => {
  router.push('/');
};

const goToSearch = () => {
  router.push('/buscar');
};

const goToCategories = () => {
  router.push('/categorias');
};

const goToCart = () => {
  router.push('/carrito');
};

const shareProduct = async () => {
  try {
    if (navigator.share) {
      await navigator.share({
        title: dato.value.nombre,
        text: dato.value.subtitulo || 'Mira este producto',
        url: window.location.href
      });
      showToast('Compartido exitosamente', 'success');
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.href);
      showToast('Enlace copiado al portapapeles', 'success');
    }
  } catch (error) {
    console.error('Error al compartir:', error);
    showToast('Error al compartir el producto', 'error');
  }
};

// Toast notification system
const showToast = (message, type = 'info') => {
  const toast = {
    message,
    type,
    visible: true,
    id: Date.now()
  };
  
  toasts.value.push(toast);
  
  // Auto hide after 3 seconds
  setTimeout(() => {
    const index = toasts.value.findIndex(t => t.id === toast.id);
    if (index !== -1) {
      toasts.value[index].visible = false;
      
      // Remove from array after animation completes
      setTimeout(() => {
        toasts.value = toasts.value.filter(t => t.id !== toast.id);
      }, 300);
    }
  }, 3000);
};

const getToastIcon = (type) => {
  switch (type) {
    case 'success': return 'fa-check-circle';
    case 'error': return 'fa-exclamation-circle';
    case 'warning': return 'fa-exclamation-triangle';
    case 'info': 
    default: return 'fa-info-circle';
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

// Función para guardar favoritos (simulada)
const storeFavorite = async (data) => {
  // Simulación de una llamada a API
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true });
    }, 300);
  });
};

// Cargar datos del producto
const verProducto = async () => {
  try {
    const { data } = await detalleProducto(route.params.idProducto);
    console.log(data);
    dato.value = data.dato;
    originalPrice.value = dato.value.precio;

    // Cargar productos similares
    productosSimilares.value = data.productos_similares || [];

    // Inicializar índices de imágenes para productos similares
    productosSimilares.value.forEach(product => {
      currentImageIndexSimilar.value[product.id] = 0;
    });

    // Seleccionar el primer modelo por defecto si existe
    if (dato.value.modelos?.length > 0) {
      selectModel(dato.value.modelos[0]);
    } else {
      selectedModelPrice.value = originalPrice.value;
    }

    // Animar elementos después de cargar
    nextTick(() => {
      animateElements();
    });

    // Cargar calificaciones de usuarios
    indexRatingUser();

    // Resetear el estado de "Ver más" al cargar un nuevo producto
    showAllFeatures.value = false;
  } catch (error) {
    console.error('Error al obtener detalles del producto:', error);
    showToast('Error al cargar el producto', 'error');
  }
};

// Versión extendida que también carga estadísticas de calificación
const verProductoConRatings = async () => {
  await verProducto();
  if (dato.value.id) {
    await loadProductRatingStats(dato.value.id);
  }
};

// Al montar el componente
onMounted(() => {
  verProductoConRatings(); // Usar la versión extendida aquí
  checkThumbnailScroll();
  window.addEventListener('resize', checkThumbnailScroll);

  setTimeout(() => {
    document.querySelector('.product-detail')?.classList.add('loaded');
  }, 100);

  if (window.innerWidth <= 768) {
    expandedSection.value = 'features';
    // Mostrar el mobile header
    const mobileHeader = document.querySelector('.mobile-header');
    if (mobileHeader) mobileHeader.style.display = 'block';
  }

  // Si ya tenemos un ID de producto, cargar las estadísticas de calificación
  if (route.params.idProducto) {
    loadProductRatingStats(route.params.idProducto);
  }
  
  // Auto-hide swipe indicator after 5 seconds
  setTimeout(() => {
    if (!hasScrolled.value) {
      showSwipeIndicator.value = false;
    }
  }, 5000);
});

// Al desmontar el componente
onUnmounted(() => {
  window.removeEventListener('resize', checkThumbnailScroll);
});

// Observar cambios en la cantidad
watch(quantity, validateQuantity);

// Observar cambios en el ID del producto
watch(
  () => route.params.idProducto,
  async (newId, oldId) => {
    if (newId && newId !== oldId) {
      try {
        await verProductoConRatings(); // Usar la versión extendida aquí también
      } catch (error) {
        console.error('Error al cargar el producto:', error);
        showToast('Error al cargar el producto', 'error');
      }
    }
  }
);

// Función simplificada para calificar productos similares
const storeRatingUser = async (productId, rating) => {
  try {
    await storeRating({
      producto_id: productId,
      rating
    });

    // Recargar las calificaciones
    await indexRatingUser();

    // Si el producto actual es el que se calificó, actualizar sus estadísticas
    if (dato.value.id === productId) {
      await loadProductRatingStats(productId);
    }

    showToast('Calificación guardada', 'success');
  } catch (error) {
    console.error('Error al calificar el producto:', error.response?.data?.message || error);
    showToast('Error al guardar calificación', 'error');
  }
};
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css');

/* Base Styles */
.product-detail {
  padding: 2rem 1.5rem;
  min-height: 100vh;
  opacity: 0;
  animation: fadeIn 0.6s cubic-bezier(0.23, 1, 0.32, 1) forwards;
  animation-delay: 0.2s;
  padding-bottom: 20px; /* Reduced padding since we removed bottom nav */
}

.product-detail.loaded {
  opacity: 1;
  transform: translateY(0);
}

.product-container {
  max-width: 1440px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  align-items: start;
}

/* Utility Classes */
.desktop-only {
  display: block;
}

.mobile-only {
  display: none;
}

/* Mobile Header */
.mobile-header {
  display: none;
  padding: 1rem 0;
  margin-bottom: 1rem;
  border-bottom: 1px solid #eee;
}

.mobile-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.back-button {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #f8f9fa;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.back-button:active {
  transform: scale(0.95);
  background: #e9ecef;
}

/* Animation Classes */
.animate-on-load {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.5s ease, transform 0.5s ease;
}

.animate-on-load.animated {
  opacity: 1;
  transform: translateY(0);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideIn {
  from {
    transform: translateX(20px);
    opacity: 0;
  }

  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideInRight {
  from {
    transform: translateX(20px);
    opacity: 0;
  }

  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Image Section */
.product-images {
  position: sticky;
  top: 1rem;
  display: grid;
  gap: 1.5rem;
}

.main-image-wrapper {
  border-radius: 1.5rem;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.main-image-wrapper:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
}

.main-image-container {
  position: relative;
  padding-top: 75%;
  overflow: hidden;
}

.main-image-img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  transition: transform 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
}

.main-image-img.changing {
  opacity: 0;
  transform: scale(0.9);
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.03);
  opacity: 0;
  transition: opacity 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.main-image-container:hover .image-overlay {
  opacity: 1;
}

/* Image Navigation */
.image-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  cursor: pointer;
  z-index: 5;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  opacity: 0.8;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.main-image-container:hover .image-nav {
  opacity: 1;
}

.image-nav.prev {
  left: 10px;
}

.image-nav.next {
  right: 10px;
}

.image-nav:hover {
  background: white;
  transform: translateY(-50%) scale(1.1);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
}

/* Image Pagination for Mobile */
.image-pagination {
  position: absolute;
  bottom: 15px;
  width: 100%;
  display: flex;
  justify-content: center;
  gap: 10px;
}

.pagination-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  transition: all 0.3s ease;
}

.pagination-dot.active {
  background: white;
  transform: scale(1.4);
}

.zoom-hint {
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 2rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
}

.main-image-container:hover .zoom-hint {
  transform: translateY(0);
  opacity: 1;
}

.thumbnail-list {
  position: relative;
  display: flex;
  gap: 0.75rem;
}

/* Thumbnails interactivos */
.thumbnail-container {
  display: flex;
  gap: 1rem;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  padding: 1rem 0;
  margin: 0 -1.5rem;
  padding: 0 1.5rem;
  scrollbar-width: none;
  /* Firefox */
}

.thumbnail-container::-webkit-scrollbar {
  display: none;
  /* Chrome, Safari, Edge */
}

.thumbnail {
  flex: 0 0 100px;
  height: 100px;
  border-radius: 1rem;
  border: 2px solid transparent;
  transition: all 0.2s ease;
  scroll-snap-align: start;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: hidden;
  cursor: pointer;
}

.thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.thumbnail-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.1);
  opacity: 0;
  transition: opacity 0.2s ease;
}

.thumbnail:hover .thumbnail-overlay {
  opacity: 1;
}

.thumbnail:hover img {
  transform: scale(1.1);
}

.thumbnail.active {
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.2);
}

/* Mobile Price Preview */
.mobile-price-preview {
  display: none;
  align-items: center;
  gap: 12px;
  margin-top: 0.75rem;
  background-color: #f8f9fa;
  padding: 0.75rem;
  border-radius: 0.75rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

/* Info Section */
.product-info {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  animation: fadeIn 0.8s ease forwards;
  animation-delay: 0.2s;
  opacity: 0;
}

.sticky-header {
  position: sticky;
  top: 0;
  background: white;
  padding: 1rem 0;
  z-index: 10;
}

.badge-container {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.sale-badge,
.new-badge {
  padding: 0.5rem 1rem;
  border-radius: 2rem;
  font-size: 0.875rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.sale-badge {
  background: linear-gradient(45deg, #ff4444, #ff6b6b);
  color: white;
  animation: pulseSale 2s infinite;
}

.new-badge {
  background: linear-gradient(45deg, #4CAF50, #8BC34A);
  color: white;
}

@keyframes pulseSale {
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

.product-title {
  font-size: 1.75rem;
  line-height: 1.2;
  margin: 0;
  font-weight: 700;
  color: #333;
}

.product-subtitle {
  font-size: 1.1rem;
  color: #555;
  margin: 0.5rem 0 0;
  font-weight: 500;
}

/* Accordion Sections for Mobile */
.accordion-sections {
  display: none;
}

.accordion-section {
  border: 1px solid #e5e5e5;
  border-radius: 0.75rem;
  margin-bottom: 0.75rem;
  overflow: hidden;
  transition: all 0.3s ease;
}

.accordion-section.expanded {
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  border-color: #007bff;
}

/* Price Accordion - NEW */
.price-accordion {
  background-color: #f8f9fa;
  border-color: #007bff;
  margin-bottom: 1rem;
}

.price-accordion .accordion-header {
  background-color: rgba(0, 123, 255, 0.05);
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.mobile-price-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.mobile-price-info .current-price {
  font-size: 1.5rem;
  font-weight: 700;
  color: #333;
}

.mobile-price-info .price-details {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.accordion-header {
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  background: #f8f9fa;
  transition: background 0.3s ease;
}

.accordion-section.expanded .accordion-header {
  background: rgba(0, 123, 255, 0.05);
}

.accordion-header h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.accordion-content {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.4s ease;
  padding: 0 1.25rem;
}

.accordion-section.expanded .accordion-content {
  max-height: 600px;
  padding: 1rem 1.25rem;
}

/* Price Section */
.price-section {
  padding: 0.1rem 0;
  border-bottom: 1px solid #e0e0e0;
}

.price-info {
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.current-price {
  font-size: 2rem;
  font-weight: 700;
  color: #333;
}

.price-info.animate .current-price {
  transform: scale(1.1);
  opacity: 0;
}

.original-price {
  color: #999;
  text-decoration: line-through;
  font-size: 1.1rem;
}

.discount-badge {
  background: #ff4444;
  color: white;
  padding: 0.3rem 0.75rem;
  border-radius: 2rem;
  font-size: 0.9rem;
}

/* Features Section */
.features-section {
  margin: 1.5rem 0;
}

.section-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #333;
  position: relative;
  display: inline-block;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 40px;
  height: 2px;
  background: linear-gradient(45deg, #2196F3, #00BCD4);
  transition: width 0.3s ease;
}

.section-title:hover::after {
  width: 100%;
}

.features {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.feature-item {
  transition: all 0.3s ease;
  padding: 0.75rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.875rem;
  border: 1px solid transparent;
}

.feature-item i {
  color: #4CAF50;
  font-size: 1rem;
}

.feature-hover {
  background: rgba(33, 150, 243, 0.08);
  transform: translateX(0.5rem);
  border-color: rgba(33, 150, 243, 0.2);
  box-shadow: 0 2px 8px rgba(33, 150, 243, 0.1);
}

/* Show More Button for Features */
.show-more-btn {
  margin-top: 1rem;
  background: none;
  border: none;
  color: #007bff;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  transition: all 0.3s ease;
}

.show-more-btn:hover {
  background: rgba(0, 123, 255, 0.1);
  transform: translateY(-2px);
}

.show-more-btn.desktop {
  margin-top: 1rem;
}

/* Color Section */
.color-section {
  margin: 1.5rem 0;
}

.color-options {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.color-swatch {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
  position: relative;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.color-swatch.active {
  border-color: #007bff;
  transform: scale(1.15);
  box-shadow: 0 0 0 2px white, 0 0 0 4px #007bff, 0 4px 8px rgba(0, 0, 0, 0.15);
}

.color-swatch:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
}

.color-checkmark {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 0.8rem;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  animation: scaleIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes scaleIn {
  from {
    transform: translate(-50%, -50%) scale(0);
  }

  to {
    transform: translate(-50%, -50%) scale(1);
  }
}

/* Model Section */
.model-section {
  margin: 1.5rem 0;
}

.model-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 0.75rem;
  margin-top: 0.75rem;
}

.model-card {
  padding: 0.75rem;
  border: 1px solid #e0e0e0;
  border-radius: 0.75rem;
  background: white;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: hidden;
}

.model-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, rgba(33, 150, 243, 0.1), rgba(0, 188, 212, 0.1));
  opacity: 0;
  transition: opacity 0.3s ease;
}

.model-card:hover {
  border-color: #007bff;
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(0, 123, 255, 0.15);
}

.model-card:hover::before {
  opacity: 1;
}

.model-card.active {
  border-color: #007bff;
  background: #f8f9fa;
  position: relative;
  box-shadow: 0 6px 16px rgba(0, 123, 255, 0.15);
}

.model-card.active::after {
  content: '';
  position: absolute;
  top: -1px;
  left: -1px;
  right: -1px;
  height: 3px;
  background: linear-gradient(45deg, #007bff, #00bcd4);
  border-radius: 0.5rem 0.5rem 0 0;
}

.model-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: #333;
}

.model-price {
  font-size: 0.8125rem;
  color: #666;
}

.model-stock {
  font-size: 0.75rem;
  color: #f57c00;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin-top: 0.375rem;
}

/* Purchase Section */
.purchase-section {
  position: sticky;
  bottom: 0;
  background: white;
  padding: 1.25rem 0;
  border-top: 1px solid #e0e0e0;
  margin-top: auto;
  box-shadow: 0 -4px 10px rgba(0, 0, 0, 0.05);
  border-radius: 1rem 1rem 0 0;
  z-index: 5;
}

.quantity-section {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
}

.quantity-label {
  font-size: 0.875rem;
  color: #333;
  font-weight: 500;
}

.quantity-controls {
  display: flex;
  align-items: center;
  border: 1px solid #e0e0e0;
  border-radius: 0.5rem;
  overflow: hidden;
  height: 2.5rem;
  background: white;
  transition: all 0.3s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.quantity-controls:hover {
  border-color: #007bff;
  box-shadow: 0 4px 10px rgba(0, 123, 255, 0.1);
}

.quantity-btn {
  width: 2.5rem;
  height: 2.5rem;
  border: none;
  background: #f8f9fa;
  color: #333;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.quantity-btn:hover:not(:disabled) {
  background: #e9ecef;
  color: #007bff;
}

.quantity-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.quantity-btn.pulse:not(:disabled) {
  animation: btnPulse 1.5s infinite;
}

@keyframes btnPulse {
  0% {
    background: #f8f9fa;
  }

  50% {
    background: rgba(0, 123, 255, 0.1);
  }

  100% {
    background: #f8f9fa;
  }
}

.quantity-btn i {
  font-size: 0.75rem;
}

.quantity-input {
  color: #000;
  width: 3rem;
  height: 2.5rem;
  border: none;
  text-align: center;
  font-size: 0.875rem;
  font-weight: 500;
  background: white;
  padding: 0;
}

.quantity-input::-webkit-outer-spin-button,
.quantity-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.quantity-limits {
  font-size: 0.75rem;
  color: #666;
}

.action-buttons {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 0.75rem;
}

.add-to-cart {
  height: 3rem;
  padding: 0 1.5rem;
  border: none;
  border-radius: 0.75rem;
  background: linear-gradient(45deg, #007bff, #0056b3);
  color: white;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
}

.add-to-cart::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: all 0.5s ease;
}

.add-to-cart:hover::before {
  left: 100%;
}

.add-to-cart:hover:not(:disabled) {
  background-color: #0069d9;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 123, 255, 0.4);
}

.add-to-cart:active:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 3px 8px rgba(0, 123, 255, 0.3);
}

.add-to-cart:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.add-to-cart i {
  font-size: 0.875rem;
}

.btn-shine {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg,
      rgba(255, 255, 255, 0) 0%,
      rgba(255, 255, 255, 0.2) 50%,
      rgba(255, 255, 255, 0) 100%);
  animation: shine 3s infinite;
}

@keyframes shine {
  0% {
    left: -100%;
  }

  20% {
    left: 100%;
  }

  100% {
    left: 100%;
  }
}

.add-to-cart.success {
  background: linear-gradient(45deg, #4CAF50, #2E7D32);
}

.add-to-wishlist {
  width: 3rem;
  height: 3rem;
  border: 1px solid #e0e0e0;
  border-radius: 0.75rem;
  background: white;
  color: #dc3545;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.add-to-wishlist:hover {
  border-color: #dc3545;
  background: #fff5f5;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(220, 53, 69, 0.15);
}

.add-to-wishlist.in-wishlist {
  background: #dc3545;
  border-color: #dc3545;
  color: white;
  box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3);
}

.add-to-wishlist i {
  font-size: 1rem;
  transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.add-to-wishlist:hover i {
  transform: scale(1.2);
}

.add-to-wishlist.animate-heart i {
  animation: heartBeat 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes heartBeat {
  0% {
    transform: scale(1);
  }

  15% {
    transform: scale(1.3);
  }

  30% {
    transform: scale(0.9);
  }

  45% {
    transform: scale(1.2);
  }

  60% {
    transform: scale(0.9);
  }

  100% {
    transform: scale(1);
  }
}

.tooltip {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%) translateY(-8px);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  font-size: 0.75rem;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
  pointer-events: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border-width: 5px;
  border-style: solid;
  border-color: rgba(0, 0, 0, 0.8) transparent transparent transparent;
}

.add-to-wishlist:hover .tooltip {
  opacity: 1;
  visibility: visible;
  transform: translateX(-50%) translateY(-4px);
}

/* Mobile Sticky Bar */
.mobile-sticky-bar {
  display: none;
  position: fixed;
  bottom: 20px; /* Adjusted since we removed bottom nav */
  left: 0;
  width: 100%;
  background: white;
  padding: 0.75rem 1rem;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  z-index: 100;
  align-items: center;
  justify-content: space-between;
}

.mobile-price {
  display: flex;
  flex-direction: column;
}

.mobile-product-name {
  font-weight: 600;
  font-size: 1rem;
  color: #333;
  margin-bottom: 0.25rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 180px;
}

.price-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.mobile-price .current-price {
  font-size: 1.25rem;
}

.mobile-price .original-price {
  font-size: 0.875rem;
}

.mobile-add-to-cart {
  height: 2.5rem;
  padding: 0 1.25rem;
  border: none;
  border-radius: 0.5rem;
  background: linear-gradient(45deg, #007bff, #0056b3);
  color: white;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
}

.mobile-add-to-cart:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Mobile Share Button */
.mobile-share-button {
  display: none;
  position: fixed;
  bottom: 80px;
  right: 20px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: #007bff;
  color: white;
  border: none;
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
  z-index: 90;
  cursor: pointer;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

.mobile-share-button:active {
  transform: scale(0.95);
  background: #0056b3;
}

/* Swipe Indicator */
.swipe-indicator {
  display: none;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 0.75rem 1rem;
  border-radius: 1rem;
  z-index: 10;
  text-align: center;
  animation: fadeInOut 3s ease-in-out;
}

.swipe-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  font-size: 1.25rem;
}

@keyframes fadeInOut {
  0%, 100% { opacity: 0; }
  20%, 80% { opacity: 1; }
}

/* Toast Notifications */
.toast-container {
  position: fixed;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 90%;
  max-width: 300px;
}

.toast {
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.3s ease;
}

.toast.toast-visible {
  opacity: 1;
  transform: translateY(0);
}

.toast.success {
  background: rgba(40, 167, 69, 0.9);
}

.toast.error {
  background: rgba(220, 53, 69, 0.9);
}

.toast.warning {
  background: rgba(255, 193, 7, 0.9);
}

.toast.info {
  background: rgba(23, 162, 184, 0.9);
}

/* Loading State */
.loading {
  position: relative;
  overflow: hidden;
}

.loading::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }

  100% {
    transform: translateX(100%);
  }
}

/* Responsive Design */
@media (max-width: 1024px) {
  .product-container {
    gap: 1.5rem;
  }

  .product-images {
    position: relative;
    top: 0;
  }

  .product-title {
    font-size: 1.75rem;
  }
}

@media (max-width: 768px) {
  .product-detail {
    padding: 0.5rem 1rem 80px 1rem;
  }

  .desktop-only {
    display: none !important;
  }

  .mobile-only {
    display: block !important;
  }

  .main-image-wrapper {
    border-radius: 1rem;
  }

  .thumbnail {
    flex: 0 0 80px;
    height: 80px;
  }

  .action-buttons {
    grid-template-columns: 1fr;
  }

  .mobile-header {
    display: block;
  }

  .mobile-price-preview {
    display: flex;
  }

  .mobile-sticky-bar {
    display: flex;
  }

  .mobile-share-button {
    display: flex;
  }

  .swipe-indicator {
    display: block;
  }

  .accordion-sections {
    display: block;
    margin-top: 1.5rem;
  }

  .features-section,
  .color-section,
  .model-section {
    display: none;
  }

  /* Improve touch targets for mobile */
  .quantity-btn {
    width: 40px;
    height: 40px;
  }

  .quantity-input {
    width: 50px;
    height: 40px;
    font-size: 16px; /* Prevent zoom on iOS */
  }

  /* Enhance accordion sections for better mobile UX */
  .accordion-section {
    margin-bottom: 1rem;
  }

  .accordion-header {
    padding: 1rem;
  }

  .accordion-content {
    padding: 0 1rem;
  }

  .accordion-section.expanded .accordion-content {
    padding: 1rem;
  }

  /* Improve image navigation on mobile */
  .image-nav {
    width: 36px;
    height: 36px;
    opacity: 0.9;
  }

  .pagination-dot {
    width: 8px;
    height: 8px;
  }

  /* Enhance color swatches for touch */
  .color-swatch {
    width: 36px;
    height: 36px;
  }
}

@media (max-width: 480px) {
  .product-title {
    font-size: 1.5rem;
  }

  .current-price {
    font-size: 1.75rem;
  }

  .add-to-cart {
    height: 48px;
  }

  .thumbnail {
    flex: 0 0 70px;
    height: 70px;
  }

  .quantity-section {
    flex-direction: column;
    align-items: flex-start;
  }

  .quantity-controls {
    width: 100%;
    justify-content: center;
  }

  /* Adjust sticky bar for smaller screens */
  .mobile-sticky-bar {
    padding: 0.5rem 1rem;
  }

  .mobile-product-name {
    font-size: 0.9rem;
    max-width: 150px;
  }

  .mobile-price .current-price {
    font-size: 1.1rem;
  }

  .mobile-add-to-cart {
    padding: 0 1rem;
  }

  /* Improve toast notifications */
  .toast-container {
    max-width: 280px;
  }

  .toast {
    padding: 0.6rem 0.8rem;
    font-size: 0.9rem;
  }
}

/* Touch Device Optimizations */
@media (hover: none) {
  .add-to-cart:hover:not(:disabled),
  .model-card:hover,
  .quantity-btn:hover:not(:disabled) {
    transform: none;
    box-shadow: none;
  }

  .add-to-wishlist:hover i {
    transform: none;
  }

  .tooltip {
    display: none;
  }

  .zoom-hint {
    display: none;
  }

  .image-nav {
    opacity: 1;
  }

  .add-to-cart:active:not(:disabled) {
    transform: scale(0.98);
  }

  .add-to-wishlist:active {
    transform: scale(0.98);
  }

  .add-to-wishlist:active {
    transform: scale(0.95);
  }

  .model-card:active {
    background: rgba(0, 123, 255, 0.05);
  }

  /* Improve touch feedback */
  .color-swatch:active {
    transform: scale(1.1);
  }

  .quantity-btn:active:not(:disabled) {
    background: rgba(0, 123, 255, 0.2);
  }

  .mobile-add-to-cart:active {
    transform: scale(0.98);
  }

  /* Ensure large enough touch targets */
  .pagination-dot {
    width: 12px;
    height: 12px;
    margin: 0 4px;
  }

  .image-nav {
    width: 44px;
    height: 44px;
  }
}

/* Enhanced Animations */
@keyframes floatIn {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }

  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.info-content>* {
  animation: floatIn 0.5s ease forwards;
  opacity: 0;
}

.info-content>*:nth-child(1) {
  animation-delay: 0.1s;
}

.info-content>*:nth-child(2) {
  animation-delay: 0.2s;
}

.info-content>*:nth-child(3) {
  animation-delay: 0.3s;
}

.info-content>*:nth-child(4) {
  animation-delay: 0.4s;
}

.info-content>*:nth-child(5) {
  animation-delay: 0.5s;
}

.info-content>*:nth-child(6) {
  animation-delay: 0.6s;
}

.info-content>*:nth-child(7) {
  animation-delay: 0.7s;
}

/* Sección de Productos Similares - Estilos mejorados */
.similar-products-section {
  max-width: 1440px;
  margin: 3rem auto;
  padding: 2rem 1rem;
  border-radius: 1.5rem;
}

.similar-products-section .section-title {
  font-size: clamp(1.75rem, 3vw, 2.25rem);
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 2rem;
  text-align: center;
  position: relative;
}

.similar-products-section .section-title::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  height: 3px;
  background: linear-gradient(45deg, #3498db, #2980b9);
  border-radius: 3px;
}

.text-accent {
  color: #3498db;
  position: relative;
  display: inline-block;
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

.section-title:hover .text-accent::after {
  transform: scaleX(1);
}

/* Products Grid - Estilos mejorados */
.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

/* Product Card - Estilos mejorados */
.product-card {
  background: white;
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
  opacity: 0;
  transform: translateY(20px);
  animation: fadeInUp 0.6s forwards;
  animation-delay: calc(var(--index, 0) * 0.1s);
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
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
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.12);
}

/* Product Image - Estilos mejorados */
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
  background-color: #f5f5f5;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  transition: transform 0.6s cubic-bezier(0.165, 0.84, 0.44, 1);
}

.product-card:hover .product-image img {
  transform: scale(1.08);
}

/* Navigation Buttons - Estilos mejorados */
.nav-button {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.9);
  width: 32px;
  height: 32px;
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
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.nav-button.prev {
  left: 0.75rem;
}

.nav-button.next {
  right: 0.75rem;
}

.product-card:hover .nav-button {
  opacity: 1;
}

.nav-button:hover {
  background-color: white;
  transform: translateY(-50%) scale(1.1);
  color: #3498db;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

/* Badges - Estilos mejorados */
.badges {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
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

.badge-new {
  background: linear-gradient(45deg, #48bb78, #38a169);
  color: white;
  animation: pulse 2s infinite;
}

.badge-sale {
  background: linear-gradient(45deg, #ed8936, #dd6b20);
  color: white;
}

/* Product Actions - Estilos mejorados */
.product-actions-bottom {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
  opacity: 0;
  transition: opacity 0.3s ease, transform 0.3s ease;
  z-index: 2;
  transform: translateY(10px);
}

.product-card:hover .product-actions-bottom {
  opacity: 1;
  transform: translateY(0);
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

/* Product Info - Estilos mejorados */
.product-info-card {
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
  margin-bottom: 0.75rem;
}

.product-card:hover .product-name {
  color: #3498db;
}

/* Rating - Estilos mejorados */
.rating-container {
  margin-bottom: 0.75rem;
}

.rating {
  display: flex;
  gap: 2px;
  margin-bottom: 0.25rem;
}

.star {
  color: #e2e8f0;
  font-size: 0.95rem;
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
  font-size: 0.7rem;
  color: #718096;
}

/* Price - Estilos mejorados */
.price-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
}

.price {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.product-info-card .current-price {
  font-weight: 700;
  font-size: 1.1rem;
  color: #2d3748;
}

.old-price {
  font-size: 0.8rem;
  color: #a0aec0;
  text-decoration: line-through;
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

/* Responsive Styles para Productos Similares */
@media (min-width: 1200px) {
  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 1.5rem;
  }

  .product-info-card {
    padding: 1.25rem;
  }

  .product-name {
    font-size: 1rem;
    height: 2.8rem;
  }

  .star {
    font-size: 1rem;
  }

  .product-info-card .current-price {
    font-size: 1.2rem;
  }

  .action-button {
    width: 38px;
    height: 38px;
    font-size: 0.95rem;
  }

  .nav-button {
    width: 38px;
    height: 38px;
  }

  .badge {
    padding: 0.4rem 0.8rem;
    font-size: 0.75rem;
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

  .similar-products-section {
    padding: 1.5rem 1rem;
  }
}

@media (min-width: 576px) and (max-width: 767px) {
  .products-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 0.75rem;
  }

  .product-actions-bottom {
    opacity: 1;
    padding: 0.5rem;
  }

  .action-button {
    width: 32px;
    height: 32px;
    font-size: 0.8rem;
  }

  .nav-button {
    opacity: 0.8;
    width: 30px;
    height: 30px;
  }

  .similar-products-section {
    padding: 1.25rem 0.75rem;
    margin: 2rem auto;
  }

  .product-info-card {
    padding: 0.75rem;
  }

  .product-name {
    font-size: 0.85rem;
    height: 2.4rem;
  }
}

@media (min-width: 480px) and (max-width: 575px) {
  .products-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
  }

  .product-info-card {
    padding: 0.75rem;
  }

  .product-name {
    font-size: 0.85rem;
    height: 2.4rem;
    margin-bottom: 0.5rem;
  }

  .category {
    font-size: 0.65rem;
    margin-bottom: 0.25rem;
  }

  .rating {
    gap: 1px;
  }

  .star {
    font-size: 0.8rem;
  }

  .rating-count {
    font-size: 0.65rem;
  }

  .product-info-card .current-price {
    font-size: 0.9rem;
  }

  .old-price {
    font-size: 0.75rem;
  }

  .action-button {
    width: 30px;
    height: 30px;
    font-size: 0.75rem;
  }

  .nav-button {
    width: 28px;
    height: 28px;
  }

  .badge {
    padding: 0.25rem 0.5rem;
    font-size: 0.65rem;
  }

  .similar-products-section {
    padding: 1rem 0.75rem;
    margin: 1.5rem auto;
    border-radius: 1rem;
  }
}

@media (max-width: 479px) {
  .products-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.5rem;
  }

  .product-info-card {
    padding: 0.5rem;
  }

  .product-name {
    font-size: 0.8rem;
    height: 2.2rem;
    margin-bottom: 0.35rem;
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
    font-size: 0.75rem;
  }

  .rating-count {
    font-size: 0.6rem;
  }

  .product-info-card .current-price {
    font-size: 0.85rem;
  }

  .old-price {
    font-size: 0.7rem;
  }

  .action-button {
    width: 28px;
    height: 28px;
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

  .similar-products-section {
    padding: 1rem 0.5rem;
    margin: 1rem auto;
    border-radius: 0.75rem;
  }

  .similar-products-section .section-title {
    font-size: 1.25rem;
    margin-bottom: 1rem;
  }

  .similar-products-section .section-title::after {
    bottom: -5px;
    width: 50px;
    height: 2px;
  }
}

/* rating */
/* Estilos para el sistema de calificación */
.rating-section {
  max-width: 1440px;
  margin: 3rem auto;
  padding: 2rem 1rem;
  border-radius: 1.5rem;
  animation: fadeIn 0.8s ease forwards;
  animation-delay: 0.3s;
  opacity: 0;
}

.rating-section .section-title {
  font-size: clamp(1.75rem, 3vw, 2.25rem);
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 2rem;
  text-align: center;
  position: relative;
}

.rating-section .section-title::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  height: 3px;
  background: linear-gradient(45deg, #007bff, #00bcd4);
  border-radius: 3px;
}

.rating-overview {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  margin-top: 1.5rem;
}

@media (min-width: 768px) {
  .rating-overview {
    grid-template-columns: 1fr 1fr;
  }
}

.rating-summary {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.average-rating {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.rating-value {
  font-size: 3rem;
  font-weight: 700;
  color: #333;
  line-height: 1;
}

.rating-count {
  font-size: 0.875rem;
  color: #666;
}

.rating-stars {
  display: flex;
  align-items: center;
}

.rating-stars.large {
  font-size: 1.75rem;
}

.rating-stars.small {
  font-size: 1rem;
}

.stars-container {
  position: relative;
  display: inline-block;
  line-height: 1;
}

.stars-background {
  color: #e0e0e0;
}

.stars-foreground {
  color: #FFD700;
  position: absolute;
  top: 0;
  left: 0;
  white-space: nowrap;
  overflow: hidden;
  width: 0;
}

.rating-progress {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.rating-bar {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.rating-label {
  min-width: 2.5rem;
  font-size: 0.875rem;
  color: #555;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.star-icon {
  color: #FFD700;
  font-size: 0.875rem;
}

.progress-container {
  flex-grow: 1;
  height: 0.5rem;
  background: #f0f0f0;
  border-radius: 1rem;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(45deg, #FFD700, #FFA500);
  border-radius: 1rem;
  width: 0;
  transition: width 1s cubic-bezier(0.23, 1, 0.32, 1);
}

.rating-percentage {
  min-width: 2.5rem;
  font-size: 0.75rem;
  color: #666;
  text-align: right;
}

.user-rating {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
  background: white;
  border-radius: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.user-rating h4 {
  margin: 0;
  font-size: 1.125rem;
  color: #333;
}

.rating-stars.interactive {
  display: flex;
  gap: 0.5rem;
  font-size: 2rem;
  justify-content: center;
}

.rating-stars.interactive .star {
  cursor: pointer;
  color: #e0e0e0;
  transition: all 0.2s ease;
  position: relative;
}

.rating-stars.interactive .star:hover {
  transform: scale(1.2);
}

.rating-stars.interactive .star.filled,
.rating-stars.interactive .star.hover {
  color: #FFD700;
}

.rating-stars.interactive .star.filled {
  animation: starPulse 0.5s ease;
}

@keyframes starPulse {
  0% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.3);
  }

  100% {
    transform: scale(1);
  }
}

.rating-stars.has-rated .star.filled {
  text-shadow: 0 0 5px rgba(255, 215, 0, 0.5);
}

.rating-label {
  text-align: center;
  font-size: 1rem;
  font-weight: 500;
  color: #333;
  min-height: 1.5rem;
}

.rating-label.placeholder {
  color: #999;
  font-style: italic;
  font-weight: normal;
}

.rating-actions {
  display: flex;
  justify-content: center;
  margin-top: 1rem;
}

.submit-rating {
  padding: 0.75rem 1.5rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
}

.submit-rating:hover:not(:disabled) {
  background: #0056b3;
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0, 123, 255, 0.3);
}

.submit-rating:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.submit-rating.loading {
  background: #0056b3;
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

  .badge-new {
    animation: none;
  }

  .action-button:hover {
    transform: none;
  }

  .fade-enter-active,
  .fade-leave-active {
    transition: none;
  }
  
  .swipe-indicator {
    animation: none;
  }
  
  .toast {
    transition: none;
  }
}
</style>