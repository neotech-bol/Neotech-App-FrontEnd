<template>
  <div class="product-detail">
    <!-- Mobile Header (visible only on small screens) -->
    <div class="mobile-header">
      <div class="badge-container">
        <span v-if="discountPercentage > 0" class="sale-badge">
          <i class="fas fa-bolt"></i> OFERTA
        </span>
        <span v-if="isNewProduct" class="new-badge">
          <i class="fas fa-star"></i> NUEVO
        </span>
      </div>
      <h1 class="product-title" :style="gradientStyle">{{ dato.nombre }}</h1>
      
      <!-- Mobile Price Quick View -->
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
        <!-- Swipeable Main Image for Mobile -->
        <div class="main-image-wrapper">
          <div class="main-image-container" 
               @mousemove="handleImageZoom" 
               @mouseleave="resetZoom"
               @touchstart="handleTouchStart" 
               @touchmove="handleTouchMove" 
               @touchend="resetZoom">
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
              <span 
                v-for="(_, index) in allImages" 
                :key="index" 
                :class="['pagination-dot', { active: selectedImage === index }]"
                @click="selectThumbnail(index)">
              </span>
            </div>
          </div>
        </div>
        
        <div class="thumbnail-list" ref="thumbnailScroll">
          <button class="scroll-btn left" @click="scrollThumbnails('left')" v-show="showScrollButtons">
            <i class="fas fa-chevron-left"></i>
          </button>
          <div class="thumbnail-container">
            <button 
              v-for="(image, index) in allImages" 
              :key="index" 
              :class="['thumbnail', { active: selectedImage === index }]" 
              @click="selectThumbnail(index)">
              <img :src="image" :alt="`Vista ${index + 1}`" loading="lazy">
              <div class="thumbnail-overlay"></div>
            </button>
          </div>
          <button class="scroll-btn right" @click="scrollThumbnails('right')" v-show="showScrollButtons">
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>

      <!-- Product Info Section -->
      <div class="product-info">
        <div class="sticky-header desktop-only">
          <div class="badge-container">
            <span v-if="discountPercentage > 0" class="sale-badge">
              <i class="fas fa-bolt"></i> OFERTA DEL DÍA
            </span>
            <span v-if="isNewProduct" class="new-badge">
              <i class="fas fa-star"></i> NUEVO
            </span>
          </div>
          <h1 class="product-title" :style="gradientStyle">{{ dato.nombre }}</h1>
          <h2 class="product-subtitle">{{ dato.subtitulo || 'Producto de Alta Calidad' }}</h2>
        </div>

        <!-- Mobile Only Subtitle -->
        <h2 class="product-subtitle mobile-only">{{ dato.subtitulo || 'Producto de Alta Calidad' }}</h2>

        <div class="info-content">
          <!-- Enhanced Rating -->
          <div class="rating-section">
            <div class="rating-stars">
              <div class="stars-container">
                <div class="stars-background">
                  <i v-for="i in 5" :key="`bg-${i}`" class="fas fa-star"></i>
                </div>
                <div class="stars-foreground" :style="`width: ${(dato.rating || 0) * 20}%`">
                  <i v-for="i in 5" :key="`fg-${i}`" class="fas fa-star"></i>
                </div>
              </div>
              <span class="rating-value">{{ dato.rating || 0 }}/5</span>
            </div>
            <div class="reviews-summary">
              <span class="reviews-count">{{ dato.total_reviews || 0 }} valoraciones</span>
              <button class="write-review-btn" @click="openReviewModal">
                <i class="fas fa-pen"></i>
                <span class="desktop-only">Escribir reseña</span>
                <span class="mobile-only">Reseña</span>
              </button>
            </div>
          </div>

          <!-- Price Section (Desktop) -->
          <div class="price-section desktop-only">
            <div class="price-container">
              <div class="price-info">
                <span class="current-price">{{ formatPrice(selectedModelPrice) }}</span>
                <div class="price-details" v-if="originalPrice > selectedModelPrice">
                  <span class="original-price">{{ formatPrice(originalPrice) }}</span>
                  <span class="discount-badge">-{{ discountPercentage }}%</span>
                </div>
              </div>
              <div class="price-tags">
                <span class="shipping-tag" v-if="freeShipping">
                  <i class="fas fa-truck"></i> Envío Gratis
                </span>
                <span class="warranty-tag">
                  <i class="fas fa-shield-alt"></i> Garantía 12 meses
                </span>
              </div>
            </div>
          </div>

          <!-- Stock Status -->
          <div class="stock-status" :class="{ 'low-stock': isLowStock }">
            <i :class="['fas', isLowStock ? 'fa-exclamation-circle' : 'fa-check-circle']"></i>
            <span>{{ stockMessage }}</span>
          </div>

          <!-- Accordion Sections for Mobile -->
          <div class="accordion-sections">
            <!-- Features Section -->
            <div class="accordion-section" :class="{ 'expanded': expandedSection === 'features' }">
              <div class="accordion-header" @click="toggleSection('features')">
                <h3 class="section-title">Características Destacadas</h3>
                <i class="fas" :class="expandedSection === 'features' ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
              </div>
              <div class="accordion-content">
                <ul class="features">
                  <li 
                    v-for="caracteristica in dato.caracteristicas" 
                    :key="caracteristica.id" 
                    class="feature-item"
                    :class="{ 'feature-hover': hoveredFeature === caracteristica.id }"
                    @mouseover="hoveredFeature = caracteristica.id" 
                    @mouseleave="hoveredFeature = null">
                    <i class="fas fa-check-circle"></i>
                    <span>{{ caracteristica.caracteristica }}</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <!-- Colores Disponibles -->
            <div class="accordion-section" :class="{ 'expanded': expandedSection === 'colors' }">
              <div class="accordion-header" @click="toggleSection('colors')">
                <h3 class="section-title">Colores Disponibles</h3>
                <i class="fas" :class="expandedSection === 'colors' ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
              </div>
              <div class="accordion-content">
                <div class="color-options">
                  <button 
                    v-for="(image, index) in dato.images" 
                    :key="index" 
                    class="color-swatch"
                    :style="{ backgroundColor: image.color }" 
                    @click="selectColor(index)"
                    :class="{ active: selectedImage === index + 1 }">
                    <div class="color-checkmark" v-if="selectedImage === index + 1">
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
                  <button 
                    v-for="model in dato.modelos" 
                    :key="model.id"
                    :class="['model-card', { active: selectedModel === model.id }]" 
                    @click="selectModel(model)">
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
              <li 
                v-for="caracteristica in dato.caracteristicas" 
                :key="caracteristica.id" 
                class="feature-item"
                :class="{ 'feature-hover': hoveredFeature === caracteristica.id }"
                @mouseover="hoveredFeature = caracteristica.id" 
                @mouseleave="hoveredFeature = null">
                <i class="fas fa-check-circle"></i>
                <span>{{ caracteristica.caracteristica }}</span>
              </li>
            </ul>
          </div>
          
          <!-- Desktop Color Section -->
          <div class="color-section desktop-only">
            <h3 class="section-title">Colores Disponibles</h3>
            <div class="color-options">
              <button 
                v-for="(image, index) in dato.images" 
                :key="index" 
                class="color-swatch"
                :style="{ backgroundColor: image.color }" 
                @click="selectColor(index)"
                :class="{ active: selectedImage === index + 1 }">
                <div class="color-checkmark" v-if="selectedImage === index + 1">
                  <i class="fas fa-check"></i>
                </div>
              </button>
            </div>
          </div>
          
          <!-- Desktop Model Selection -->
          <div class="model-section desktop-only">
            <h3 class="section-title">Selecciona el Modelo</h3>
            <div class="model-grid">
              <button 
                v-for="model in dato.modelos" 
                :key="model.id"
                :class="['model-card', { active: selectedModel === model.id }]" 
                @click="selectModel(model)">
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
                <button 
                  @click="decreaseQuantity" 
                  :disabled="quantity <= cantMinimaModel" 
                  class="quantity-btn"
                  :class="{ 'pulse': quantity > cantMinimaModel }">
                  <i class="fas fa-minus"></i>
                </button>
                <input 
                  type="number" 
                  v-model="quantity" 
                  :min="cantMinimaModel" 
                  :max="cantMaximaModel"
                  class="quantity-input" 
                  @change="validateQuantity">
                <button 
                  @click="increaseQuantity" 
                  :disabled="quantity >= cantMaximaModel" 
                  class="quantity-btn"
                  :class="{ 'pulse': quantity < cantMaximaModel }">
                  <i class="fas fa-plus"></i>
                </button>
              </div>
              <span class="quantity-limits">
                Mínimo: {{ cantMinimaModel }} | Máximo: {{ cantMaximaModel }}
              </span>
            </div>

            <div class="action-buttons">
              <button 
                class="add-to-cart" 
                @click="addToCart" 
                :disabled="!selectedModel || addingToCart"
                :class="{ 'loading': addingToCart }">
                <i class="fas" :class="addingToCart ? 'fa-spinner fa-spin' : 'fa-shopping-cart'"></i>
                <span>{{ addingToCart ? 'Agregando...' : 'Agregar al carrito' }}</span>
                <span class="btn-shine"></span>
              </button>
              <button 
                class="add-to-wishlist" 
                :class="{ 'in-wishlist': isInWishlist }" 
                @click="toggleWishlist">
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
    
    <!-- Mobile Sticky Add to Cart Bar -->
    <div class="mobile-sticky-bar">
      <div class="mobile-price">
        <span class="current-price">{{ formatPrice(selectedModelPrice) }}</span>
        <span class="original-price" v-if="originalPrice > selectedModelPrice">{{ formatPrice(originalPrice) }}</span>
      </div>
      <button 
        class="mobile-add-to-cart" 
        @click="addToCart" 
        :disabled="!selectedModel || addingToCart"
        :class="{ 'loading': addingToCart }">
        <i class="fas" :class="addingToCart ? 'fa-spinner fa-spin' : 'fa-shopping-cart'"></i>
        <span>{{ addingToCart ? 'Agregando...' : 'Agregar' }}</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { detalleProducto } from '@/Services/ProductoService';
import { useCartStore } from '@/stores/cart';

// Estado reactivo
const dato = ref({});
const router = useRouter();
const selectedImage = ref(0);
const selectedModel = ref(null);
const selectedModelPrice = ref(0);
const nameModel = ref('');
const cantMinimaModel = ref(0);
const cantMaximaModel = ref(0);
const originalPrice = ref(0);
const idProducto = router.currentRoute.value.params.idProducto;
const cartStore = useCartStore();
const quantity = ref(1);
const addingToCart = ref(false);
const isInWishlist = ref(false);
const mainImage = ref(null);
const showScrollButtons = ref(false);
const thumbnailScroll = ref(null);
const hoveredFeature = ref(null);
const animatePrice = ref(false);
const expandedSection = ref('features'); // Para acordeón móvil
const touchStartX = ref(0);
const touchEndX = ref(0);

// Computed properties
const allImages = computed(() => {
  return [dato.value.imagen_principal, ...(dato.value.images?.map(img => img.imagen) || [])];
});

const currentImage = computed(() => allImages.value[selectedImage.value]);

const discountPercentage = computed(() => {
  if (originalPrice.value > selectedModelPrice.value) {
    return Math.round((1 - selectedModelPrice.value / originalPrice.value) * 100);
  }
  return 0;
});

const gradientStyle = computed(() => ({
  background: 'linear-gradient(45deg, #2196F3, #00BCD4)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent'
}));

const isNewProduct = computed(() => {
  if (!dato.value.created_at) return false;
  const productDate = new Date(dato.value.created_at);
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  return productDate > thirtyDaysAgo;
});

const freeShipping = computed(() => {
  return selectedModelPrice.value >= 1000;
});

const isLowStock = computed(() => {
  return cantMaximaModel.value <= 5;
});

const stockMessage = computed(() => {
  if (isLowStock.value) {
    return `¡Solo quedan ${cantMaximaModel.value} unidades!`;
  }
  return 'En Stock';
});

// Métodos
const verProducto = async () => {
  try {
    const { data } = await detalleProducto(idProducto);
    dato.value = data.dato;
    originalPrice.value = dato.value.precio;
    if (dato.value.modelos?.length > 0) {
      selectModel(dato.value.modelos[0]);
    } else {
      selectedModelPrice.value = originalPrice.value;
    }
    
    // Iniciar animaciones después de cargar los datos
    nextTick(() => {
      animateElements();
    });
  } catch (error) {
    console.error('Error al obtener detalles del producto:', error);
  }
};

const animateElements = () => {
  // Añadir clase para animar elementos
  const elements = document.querySelectorAll('.product-detail .animate-on-load');
  elements.forEach((el, index) => {
    setTimeout(() => {
      el.classList.add('animated');
    }, index * 100);
  });
};

const checkThumbnailScroll = () => {
  if (!thumbnailScroll.value) return;
  const container = thumbnailScroll.value.querySelector('.thumbnail-container');
  showScrollButtons.value = container.scrollWidth > container.clientWidth;
};

const selectModel = (model) => {
  selectedModel.value = model.id;
  
  // Animar cambio de precio
  animatePrice.value = true;
  setTimeout(() => {
    selectedModelPrice.value = model.precio;
    nameModel.value = model.nombre;
    cantMinimaModel.value = model.cantidad_minima;
    cantMaximaModel.value = model.cantidad_maxima;
    quantity.value = cantMinimaModel.value;
    
    setTimeout(() => {
      animatePrice.value = false;
    }, 300);
  }, 150);
};

const selectColor = (index) => {
  selectedImage.value = index + 1; // +1 porque la primera imagen es la principal
};

const validateQuantity = () => {
  quantity.value = Math.max(cantMinimaModel.value, Math.min(cantMaximaModel.value, quantity.value));
};

const increaseQuantity = () => {
  if (quantity.value < cantMaximaModel.value) {
    quantity.value++;
  }
};

const decreaseQuantity = () => {
  if (quantity.value > cantMinimaModel.value) {
    quantity.value--;
  }
};

const addToCart = async () => {
  if (addingToCart.value) return;
  addingToCart.value = true;
  
  try {
    const productWithModelPrice = {
      ...dato.value,
      precio: selectedModelPrice.value,
      modeloId: selectedModel.value,
      nombreModelo: nameModel.value,
      cantidad: quantity.value,
      cantidad_minima: cantMinimaModel.value,
      cantidad_maxima: cantMaximaModel.value
    };
    
    await cartStore.addToCart(productWithModelPrice);
    
    // Mostrar animación de éxito
    showAddedToCartAnimation();
  } catch (error) {
    console.error('Error al agregar al carrito:', error);
    // Mostrar mensaje de error
  } finally {
    setTimeout(() => {
      addingToCart.value = false;
    }, 800);
  }
};

const showAddedToCartAnimation = () => {
  // Implementar animación de éxito
  const cartBtn = document.querySelector('.add-to-cart');
  if (cartBtn) {
    cartBtn.classList.add('success');
    setTimeout(() => {
      cartBtn.classList.remove('success');
    }, 2000);
  }
};

const handleImageZoom = (event) => {
  if (!mainImage.value) return;
  const { left, top, width, height } = mainImage.value.getBoundingClientRect();
  const x = (event.clientX - left) / width;
  const y = (event.clientY - top) / height;
  mainImage.value.style.transformOrigin = `${x * 100}% ${y * 100}%`;
  mainImage.value.style.transform = 'scale(1.8)';
};

const handleTouchStart = (event) => {
  touchStartX.value = event.touches[0].clientX;
};

const handleTouchMove = (event) => {
  // Para zoom
  if (event.touches.length === 2) {
    // Implementación de zoom con dos dedos
    if (!mainImage.value) return;
    const touch = event.touches[0];
    const { left, top, width, height } = mainImage.value.getBoundingClientRect();
    const x = (touch.clientX - left) / width;
    const y = (touch.clientY - top) / height;
    mainImage.value.style.transformOrigin = `${x * 100}% ${y * 100}%`;
    mainImage.value.style.transform = 'scale(1.8)';
    return;
  }
  
  // Para deslizar
  touchEndX.value = event.touches[0].clientX;
  const diffX = touchStartX.value - touchEndX.value;
  
  // Si el deslizamiento es significativo (más de 50px)
  if (Math.abs(diffX) > 50) {
    if (diffX > 0) {
      // Deslizamiento a la izquierda, mostrar siguiente imagen
      nextImage();
    } else {
      // Deslizamiento a la derecha, mostrar imagen anterior
      prevImage();
    }
    // Reiniciar valores para evitar múltiples cambios
    touchStartX.value = touchEndX.value;
  }
};

const resetZoom = () => {
  if (mainImage.value) {
    mainImage.value.style.transform = 'scale(1)';
  }
};

const scrollThumbnails = (direction) => {
  if (!thumbnailScroll.value) return;
  const scrollAmount = 200;
  const container = thumbnailScroll.value.querySelector('.thumbnail-container');
  if (direction === 'left') {
    container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
  } else {
    container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  }
};

const selectThumbnail = (index) => {
  // Animar cambio de imagen
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
  
  // Si es una imagen de color, actualizar el color seleccionado
  if (index > 0) {
    const colorIndex = index - 1;
    // Opcional: agregar lógica adicional si es necesario
  }
};

const nextImage = () => {
  if (selectedImage.value < allImages.value.length - 1) {
    selectThumbnail(selectedImage.value + 1);
  } else {
    selectThumbnail(0); // Volver al principio
  }
};

const prevImage = () => {
  if (selectedImage.value > 0) {
    selectThumbnail(selectedImage.value - 1);
  } else {
    selectThumbnail(allImages.value.length - 1); // Ir al final
  }
};

const toggleWishlist = () => {
  // Animar corazón
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
  
  // Aquí normalmente llamarías a una API para actualizar el estado de la lista de deseos
};

const formatPrice = (price) => {
  return new Intl.NumberFormat('es-BO', {
    style: 'currency',
    currency: 'BOB',
    minimumFractionDigits: 2
  }).format(price);
};

const openReviewModal = () => {
  // Implementar la lógica para abrir un modal de reseñas
  console.log('Open review modal');
};

// Método para controlar el acordeón en móvil
const toggleSection = (section) => {
  expandedSection.value = expandedSection.value === section ? null : section;
};

// Lifecycle hooks
onMounted(() => {
  verProducto();
  checkThumbnailScroll();
  window.addEventListener('resize', checkThumbnailScroll);
  
  // Iniciar animaciones de entrada
  setTimeout(() => {
    document.querySelector('.product-detail').classList.add('loaded');
  }, 100);
  
  // Detectar si es móvil para expandir la primera sección
  if (window.innerWidth <= 768) {
    expandedSection.value = 'features';
  } else {
    expandedSection.value = null;
  }
});

// Watchers
watch(quantity, validateQuantity);
</script>

<style scoped>
/* Base Styles */
.product-detail {
  padding: 1.5rem;
  background: #fff;
  min-height: 100vh;
  opacity: 0;
  transform: translateY(10px);
  transition: opacity 0.5s ease, transform 0.5s ease;
}

.product-detail.loaded {
  opacity: 1;
  transform: translateY(0);
}

.product-container {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: minmax(300px, 2fr) 3fr;
  gap: 2rem;
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
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes scaleIn {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

@keyframes slideInRight {
  from { transform: translateX(20px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

/* Image Section */
.product-images {
  position: sticky;
  top: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  animation: fadeIn 0.6s ease forwards;
}

.main-image-wrapper {
  position: relative;
  width: 100%;
  border-radius: 0.75rem;
  overflow: hidden;
  background: #f8f9fa;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.main-image-wrapper:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
}

.main-image-container {
  position: relative;
  width: 100%;
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
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.8);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 5;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  opacity: 0;
  transition: all 0.3s ease;
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
  left: 0;
  width: 100%;
  display: flex;
  justify-content: center;
  gap: 8px;
  z-index: 5;
}

.pagination-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: all 0.3s ease;
}

.pagination-dot.active {
  background: white;
  transform: scale(1.3);
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.3);
}

.zoom-hint {
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 2rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transform: translateY(10px);
  opacity: 0;
  transition: all 0.3s ease;
  font-size: 0.875rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.main-image-container:hover .zoom-hint {
  transform: translateY(0);
  opacity: 1;
}

.thumbnail-list {
  position: relative;
  display: flex;
  gap: 0.5rem;
}

.thumbnail-container {
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  scroll-behavior: smooth;
  scrollbar-width: none;
  -ms-overflow-style: none;
  padding: 0.5rem 0;
}

.thumbnail-container::-webkit-scrollbar {
  display: none;
}

.scroll-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background: white;
  border: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 1;
  transition: all 0.2s ease;
  font-size: 0.75rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.scroll-btn:hover {
  background: #f8f9fa;
  border-color: #007bff;
  color: #007bff;
  transform: translateY(-50%) scale(1.1);
}

.scroll-btn.left {
  left: -0.5rem;
}

.scroll-btn.right {
  right: -0.5rem;
}

.thumbnail {
  flex: 0 0 60px;
  height: 60px;
  border: 2px solid transparent;
  border-radius: 0.5rem;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  background: white;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
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
  gap: 10px;
  margin-top: 10px;
}

/* Info Section */
.product-info {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
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
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.badge-container {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
}

.sale-badge, .new-badge {
  padding: 0.375rem 0.75rem;
  border-radius: 1.5rem;
  font-size: 0.8125rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.375rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

.product-title {
  font-size: 1.75rem;
  line-height: 1.2;
  margin: 0;
  font-weight: 700;
  transition: all 0.3s ease;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.product-subtitle {
  font-size: 1rem;
  color: #666;
  margin: 0.375rem 0 0;
  font-weight: 500;
}

/* Accordion Sections for Mobile */
.accordion-sections {
  display: none;
}

.accordion-section {
  border: 1px solid #e0e0e0;
  border-radius: 0.75rem;
  margin-bottom: 1rem;
  overflow: hidden;
  transition: all 0.3s ease;
}

.accordion-section.expanded {
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  border-color: #007bff;
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
  font-size: 1rem;
}

.accordion-content {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;
  padding: 0 1rem;
}

.accordion-section.expanded .accordion-content {
  max-height: 500px;
  padding: 1rem;
}

/* Rating Section */
.rating-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #e0e0e0;
}

.rating-stars {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.stars-container {
  position: relative;
  display: inline-block;
  font-size: 0.875rem;
}

.stars-background {
  color: #e0e0e0;
}

.stars-foreground {
  position: absolute;
  top: 0;
  left: 0;
  white-space: nowrap;
  overflow: hidden;
  color: #ffc107;
  transition: width 0.5s ease;
}

.rating-value {
  font-weight: 600;
  color: #333;
  font-size: 0.875rem;
}

.reviews-summary {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.reviews-count {
  font-size: 0.875rem;
  color: #666;
}

.write-review-btn {
  padding: 0.375rem 0.75rem;
  border: 1px solid #e0e0e0;
  border-radius: 1.5rem;
  background: white;
  color: #666;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.8125rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.write-review-btn:hover {
  border-color: #007bff;
  color: #007bff;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 123, 255, 0.15);
}

/* Price Section */
.price-section {
  padding: 1rem 0;
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
  background: linear-gradient(45deg, #333, #666);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.price-info.animate .current-price {
  transform: scale(1.1);
  opacity: 0;
}

.original-price {
  color: #999;
  text-decoration: line-through;
  font-size: 1rem;
}

.discount-badge {
  background: #ff4444;
  color: white;
  padding: 0.25rem 0.625rem;
  border-radius: 1.5rem;
  font-weight: 600;
  font-size: 0.8125rem;
  box-shadow: 0 2px 6px rgba(255, 68, 68, 0.2);
}

.price-tags {
  display: flex;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.shipping-tag, .warranty-tag {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  border-radius: 1.5rem;
  font-size: 0.8125rem;
  background: #f8f9fa;
  color: #666;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
}

.shipping-tag:hover, .warranty-tag:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* Stock Status */
.stock-status {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.625rem;
  border-radius: 0.5rem;
  background: #e8f5e9;
  color: #2e7d32;
  font-weight: 500;
  transition: all 0.3s ease;
  font-size: 0.875rem;
  box-shadow: 0 2px 6px rgba(46, 125, 50, 0.1);
}

.stock-status.low-stock {
  background: #fff3e0;
  color: #f57c00;
  animation: pulse 2s infinite;
  box-shadow: 0 2px 6px rgba(245, 124, 0, 0.15);
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.02); }
  100% { transform: scale(1); }
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
  0% { background: #f8f9fa; }
  50% { background: rgba(0, 123, 255, 0.1); }
  100% { background: #f8f9fa; }
}

.quantity-btn i {
  font-size: 0.75rem;
}

.quantity-input {
  width: 3rem;
  height: 2.5rem;
  border: none;
  text-align: center;
  font-size: 0.875rem;
  font-weight: 500;
  -moz-appearance: textfield;
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

.add-to-cart:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 123, 255, 0.4);
  background: linear-gradient(45deg, #0062cc, #0046a1);
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
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.2) 50%,
    rgba(255, 255, 255, 0) 100%
  );
  animation: shine 3s infinite;
}

@keyframes shine {
  0% { left: -100%; }
  20% { left: 100%; }
  100% { left: 100%; }
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
  0% { transform: scale(1); }
  15% { transform: scale(1.3); }
  30% { transform: scale(0.9); }
  45% { transform: scale(1.2); }
  60% { transform: scale(0.9); }
  100% { transform: scale(1); }
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
  bottom: 0;
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
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

/* Responsive Design */
@media (max-width: 1024px) {
  .product-container {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .product-images {
    position: relative;
    top: 0;
    max-width: 600px;
    margin: 0 auto;
  }
  
  .sticky-header {
    position: static;
  }
}

@media (max-width: 768px) {
  .product-detail {
    padding: 0.75rem;
  }
  
  .desktop-only {
    display: none;
  }
  
  .mobile-only {
    display: block;
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
  
  .product-title {
    font-size: 1.5rem;
  }
  
  .current-price {
    font-size: 1.5rem;
  }
  
  .rating-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
  
  .reviews-summary {
    width: 100%;
    justify-content: space-between;
  }
  
  .accordion-sections {
    display: block;
  }
  
  .features-section,
  .color-section,
  .model-section {
    display: none;
  }
  
  .image-pagination {
    display: flex;
  }
  
  .quantity-section {
    flex-wrap: wrap;
  }
  
  .quantity-label {
    width: 100%;
  }
  
  .quantity-controls {
    flex: 1;
    max-width: 200px;
  }
  
  /* Adjust purchase section for mobile */
  .purchase-section {
    position: static;
    box-shadow: none;
    padding-bottom: 5rem; /* Space for sticky bar */
  }
  
  /* Make thumbnails smaller on mobile */
  .thumbnail {
    flex: 0 0 50px;
    height: 50px;
  }
}

@media (max-width: 480px) {
  .product-detail {
    padding: 0.5rem;
  }
  
  .badge-container {
    flex-wrap: wrap;
  }
  
  .price-tags {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .quantity-section {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .quantity-controls {
    width: 100%;
    max-width: none;
  }
  
  .action-buttons {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
  
  .add-to-cart {
    height: 3rem;
    font-size: 1rem;
  }
  
  .add-to-wishlist {
    width: 100%;
    height: 3rem;
  }
  
  .model-grid {
    grid-template-columns: 1fr;
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
  
  .quantity-controls,
  .add-to-cart,
  .add-to-wishlist,
  .model-card {
    -webkit-tap-highlight-color: transparent;
  }
  
  /* Add active states for touch */
  .add-to-cart:active:not(:disabled) {
    transform: scale(0.98);
  }
  
  .add-to-wishlist:active {
    transform: scale(0.95);
  }
  
  .model-card:active {
    background: rgba(0, 123, 255, 0.05);
  }
  
  /* Hide zoom hint on touch devices */
  .zoom-hint {
    display: none;
  }
  
  /* Make image navigation always visible on touch */
  .image-nav {
    opacity: 0.8;
  }
}

/* Enhanced Animations */
@keyframes floatIn {
  0% { opacity: 0; transform: translateY(20px); }
  100% { opacity: 1; transform: translateY(0); }
}

.info-content > * {
  animation: floatIn 0.5s ease forwards;
  opacity: 0;
}

.info-content > *:nth-child(1) { animation-delay: 0.1s; }
.info-content > *:nth-child(2) { animation-delay: 0.2s; }
.info-content > *:nth-child(3) { animation-delay: 0.3s; }
.info-content > *:nth-child(4) { animation-delay: 0.4s; }
.info-content > *:nth-child(5) { animation-delay: 0.5s; }
.info-content > *:nth-child(6) { animation-delay: 0.6s; }
.info-content > *:nth-child(7) { animation-delay: 0.7s; }
</style>