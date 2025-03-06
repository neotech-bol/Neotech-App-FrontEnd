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

        <div class="thumbnail-list" ref="thumbnailScroll">
          <button class="scroll-btn left" @click="scrollThumbnails('left')" v-show="showScrollButtons">
            <i class="fas fa-chevron-left"></i>
          </button>
          <div class="thumbnail-container">
            <button v-for="(image, index) in allImages" :key="index"
              :class="['thumbnail', { active: selectedImage === index }]" @click="selectThumbnail(index)">
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
                  <li v-for="caracteristica in dato.caracteristicas" :key="caracteristica.id" class="feature-item"
                    :class="{ 'feature-hover': hoveredFeature === caracteristica.id }"
                    @mouseover="hoveredFeature = caracteristica.id" @mouseleave="hoveredFeature = null">
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
                  <button v-for="(image, index) in dato.images" :key="index" class="color-swatch"
                    :style="{ backgroundColor: image.color }" @click="selectColor(index)"
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
              <li v-for="caracteristica in dato.caracteristicas" :key="caracteristica.id" class="feature-item"
                :class="{ 'feature-hover': hoveredFeature === caracteristica.id }"
                @mouseover="hoveredFeature = caracteristica.id" @mouseleave="hoveredFeature = null">
                <i class="fas fa-check-circle"></i>
                <span>{{ caracteristica.caracteristica }}</span>
              </li>
            </ul>
          </div>

          <!-- Desktop Color Section -->
          <div class="color-section desktop-only">
            <h3 class="section-title">Colores Disponibles</h3>
            <div class="color-options">
              <button v-for="(image, index) in dato.images" :key="index" class="color-swatch"
                :style="{ backgroundColor: image.color }" @click="selectColor(index)"
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

    <!-- Mobile Sticky Add to Cart Bar -->
    <div class="mobile-sticky-bar">
      <div class="mobile-price">
        <span class="current-price">{{ formatPrice(selectedModelPrice) }}</span>
        <span class="original-price" v-if="originalPrice > selectedModelPrice">{{ formatPrice(originalPrice) }}</span>
      </div>
      <button class="mobile-add-to-cart" @click="addToCart" :disabled="!selectedModel || addingToCart"
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
const animatePrice = ref(false);
const expandedSection = ref('features');
const touchStartX = ref(0);
const touchEndX = ref(0);
const selectedColor = ref(null); // Para almacenar el color seleccionado
const selectedColorImage = ref(''); // Para almacenar la imagen del color seleccionado

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
    nextTick(() => {
      animateElements();
    });
  } catch (error) {
    console.error('Error al obtener detalles del producto:', error);
  }
};

const animateElements = () => {
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
  selectedImage.value = index + 1;
  selectedColor.value = dato.value.images[index].color; // Guarda el color seleccionado
  selectedColorImage.value = dato.value.images[index].imagen; // Guarda la imagen del color seleccionado
};

const validateQuantity = () => {
  quantity.value = Math.max(cantMinimaModel.value, Math.min(cantMaximaModel.value, quantity.value));
};

const increaseQuantity = () => {
  if (quantity.value < cantMaximaModel.value) quantity.value++;
};

const decreaseQuantity = () => {
  if (quantity.value > cantMinimaModel.value) quantity.value--;
};

const addToCart = async () => {
  if (addingToCart.value) return;
  addingToCart.value = true;
  try {
    const productWithModelPrice = {
      ...dato.value,
      // Usar la imagen del color seleccionado o la principal
      imagen_principal: selectedColorImage.value || dato.value.imagen_principal,
      precio: selectedModelPrice.value,
      modeloId: selectedModel.value,
      nombreModelo: nameModel.value,
      cantidad: quantity.value,
      cantidad_minima: cantMinimaModel.value,
      cantidad_maxima: cantMaximaModel.value,
      color: selectedColor.value,
      colorImage: selectedColorImage.value,
      // Crear un ID único combinando producto, modelo y color
      uniqueId: `${dato.value.id}-${selectedModel.value}-${selectedColor.value || 'default'}`
    };
    
    await cartStore.addToCart(productWithModelPrice);
    showAddedToCartAnimation();
  } catch (error) {
    console.error('Error al agregar al carrito:', error);
  } finally {
    setTimeout(() => {
      addingToCart.value = false;
    }, 800);
  }
};

const showAddedToCartAnimation = () => {
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
  touchEndX.value = event.touches[0].clientX;
  const diffX = touchStartX.value - touchEndX.value;
  if (Math.abs(diffX) > 50) {
    if (diffX > 0) nextImage();
    else prevImage();
    touchStartX.value = touchEndX.value;
  }
};

const resetZoom = () => {
  if (mainImage.value) mainImage.value.style.transform = 'scale(1)';
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

const nextImage = () => {
  if (selectedImage.value < allImages.value.length - 1) {
    selectThumbnail(selectedImage.value + 1);
  } else {
    selectThumbnail(0);
  }
};

const prevImage = () => {
  if (selectedImage.value > 0) {
    selectThumbnail(selectedImage.value - 1);
  } else {
    selectThumbnail(allImages.value.length - 1);
  }
};

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
};

const formatPrice = (price) => {
  return new Intl.NumberFormat('es-BO', {
    style: 'currency',
    currency: 'BOB',
    minimumFractionDigits: 2
  }).format(price);
};

const openReviewModal = () => {
  console.log('Open review modal');
};

const toggleSection = (section) => {
  expandedSection.value = expandedSection.value === section ? null : section;
};

onMounted(() => {
  verProducto();
  checkThumbnailScroll();
  window.addEventListener('resize', checkThumbnailScroll);
  setTimeout(() => {
    document.querySelector('.product-detail').classList.add('loaded');
  }, 100);
  if (window.innerWidth <= 768) expandedSection.value = 'features';
});

watch(quantity, validateQuantity);
</script>

<style scoped>
/* Base Styles */
/* Estructura principal */
.product-detail {
  padding: 2rem 1.5rem;
  background: #fff;
  min-height: 100vh;
  opacity: 0;
  animation: fadeIn 0.6s cubic-bezier(0.23, 1, 0.32, 1) forwards;
  animation-delay: 0.2s;
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
.desktop-only { display: block; }
.mobile-only { display: none; }

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
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes slideIn {
  from { transform: translateX(20px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
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
  background: #f8f9fa;
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
}
.thumbnail-container::-webkit-scrollbar { display: none; }

.scroll-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: white;
  border: 1px solid #e0e0e0;
  cursor: pointer;
  z-index: 1;
  transition: all 0.2s ease;
  font-size: 0.9rem;
}
.scroll-btn.left { left: -0.75rem; }
.scroll-btn.right { right: -0.75rem; }
.scroll-btn:hover { background: #f8f9fa; border-color: #007bff; color: #007bff; }
.thumbnail {
  flex: 0 0 100px;
  height: 100px;
  border-radius: 1rem;
  border: 2px solid transparent;
  transition: all 0.2s ease;
  scroll-snap-align: start;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
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
/* Rating Section */
.rating-section {
  padding: 0.75rem 0;
  border-bottom: 1px solid #e5e5e5;
}

.rating-stars {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.stars-container {
  position: relative;
  font-size: 1rem;
}

.stars-background { color: #e0e0e0; }
.stars-foreground {
  position: absolute;
  top: 0;
  left: 0;
  overflow: hidden;
  color: #ffc107;
}
.rating-value { font-weight: 600; font-size: 1rem; }

.reviews-summary {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.reviews-count { font-size: 0.9rem; color: #666; }
.write-review-btn {
  padding: 0.5rem 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 2rem;
  background: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
}

.write-review-btn:hover {
  border-color: #007bff;
  color: #007bff;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 123, 255, 0.15);
}

/* Price Section */
/* Price Section */
.price-section { padding: 1rem 0; border-bottom: 1px solid #e0e0e0; }

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

.price-tags {
  display: flex;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.shipping-tag,
.warranty-tag {
  padding: 0.5rem 1rem;
  border-radius: 2rem;
  font-size: 0.875rem;
  background: #f0f0f0;
  color: #666;
}

.shipping-tag:hover,
.warranty-tag:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
/* Stock Status */
.stock-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  border-radius: 0.5rem;
  background: #e8f5e9;
  color: #2e7d32;
  font-size: 0.9rem;
}

.stock-status.low-stock {
  background: #fff3e0;
  color: #f57c00;
  animation: pulse 2s infinite;
  box-shadow: 0 2px 6px rgba(245, 124, 0, 0.15);
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.02);
  }

  100% {
    transform: scale(1);
  }
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
  0% {
    transform: translateX(-100%);
  }

  100% {
    transform: translateX(100%);
  }
}

/* Diseño responsivo dinámico */
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
    padding: 1rem;
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
  
  .mobile-sticky-bar {
    display: flex;
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(8px);
    padding: 1rem;
    box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.1);
    z-index: 100;
  }
}

@media (max-width: 480px) {
  .product-title {
    font-size: 1.5rem;
  }
  
  .current-price {
    font-size: 2rem;
  }
  
  .add-to-cart {
    height: 48px;
  }
  
  .thumbnail {
    flex: 0 0 70px;
    height: 70px;
  }
}

/* Mejoras de interacción */
.quantity-controls {
  border-radius: 0.5rem;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.quantity-btn:active {
  transform: scale(0.95);
}

/* Efectos de hover modernos */
.model-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(0, 123, 255, 0.1);
}
/* Touch Device Optimizations */
/* Touch Device Optimizations */
@media (hover: none) {
  .add-to-cart:hover:not(:disabled),
  .model-card:hover,
  .quantity-btn:hover:not(:disabled) { transform: none; box-shadow: none; }
  .add-to-wishlist:hover i { transform: none; }
  .tooltip { display: none; }
  .zoom-hint { display: none; }
  .image-nav { opacity: 1; }
  .add-to-cart:active:not(:disabled) { transform: scale(0.98); }
  .add-to-wishlist:active { transform: scale(0.95); }
  .model-card:active { background: rgba(0, 123, 255, 0.05); }
}
/* Optimizaciones táctiles */
@media (pointer: coarse) {
  .thumbnail {
    flex: 0 0 90px;
    height: 90px;
  }
  
  .action-buttons {
    gap: 0.75rem;
  }
}

/* Transiciones suaves */
.product-info > * {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Mejora en la visualización móvil */
.mobile-price-preview {
  display: none;
  padding: 1rem;
  background: #fff;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  z-index: 100;
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
/* Efectos de carga mejorados */
.loading::after {
  animation: shimmer 1.5s infinite linear;
  background: linear-gradient(
    90deg,
    rgba(248, 250, 252, 0) 25%,
    rgba(241, 245, 249, 0.5) 50%,
    rgba(248, 250, 252, 0) 75%
  );
  background-size: 200% 100%;
}
@media (max-width: 768px) {
  .desktop-only {
    display: none !important;
  }
  
  .mobile-only {
    display: block !important;
  }
  
  .accordion-sections {
    display: block;
    margin-top: 1.5rem;
  }
  
  .features-section,
  .color-section {
    display: none;
  }
}
@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>