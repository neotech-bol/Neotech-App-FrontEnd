<template>
  <div class="product-detail">
    <!-- Cabecera Móvil -->
    <div class="mobile-header">
      <div class="mobile-nav">
        <button class="back-button" @click="goBack" aria-label="Volver">
          <i class="fas fa-arrow-left"></i>
        </button>
        <div class="badge-container">
          <span v-if="isNewProduct" class="new-badge">
            <i class="fas fa-star"></i> NUEVO
          </span>
        </div>
      </div>
      <h1 class="product-title">{{ dato.nombre }}</h1>

      <!-- Vista rápida de precio para móvil - Mejorada -->
      <div class="mobile-price-preview">
        <span class="current-price">{{ formatPrice(selectedPrice) }}</span>
        <span v-if="originalPrice > selectedPrice" class="original-price">{{ formatPrice(originalPrice) }}</span>
      </div>
    </div>

    <div class="product-container">
      <!-- Sección de Imágenes del Producto -->
      <div class="product-images">
        <!-- Imagen Principal con Zoom -->
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

            <!-- Flechas de Navegación de Imágenes -->
            <button class="image-nav prev" @click="prevImage" v-if="allImages.length > 1" aria-label="Imagen anterior">
              <i class="fas fa-chevron-left"></i>
            </button>
            <button class="image-nav next" @click="nextImage" v-if="allImages.length > 1" aria-label="Imagen siguiente">
              <i class="fas fa-chevron-right"></i>
            </button>

            <!-- Puntos de Paginación para Móvil -->
            <div class="image-pagination">
              <span v-for="(_, index) in allImages" :key="index"
                :class="['pagination-dot', { active: selectedImage === index }]" @click="selectThumbnail(index)">
              </span>
            </div>
          </div>
        </div>

        <!-- Galería de Miniaturas - Más compacta -->
        <div class="thumbnail-list" ref="thumbnailScroll">
          <div class="thumbnail-container">
            <div v-for="(image, index) in allImages" :key="index"
              :class="['thumbnail', { active: selectedImage === index }]" @click="selectThumbnail(index)">
              <img :src="image" :alt="`Vista ${index + 1} de ${dato.nombre}`" loading="lazy">
              <div class="thumbnail-overlay"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Sección de Información del Producto -->
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

        <!-- Subtítulo solo para móvil -->
        <h2 class="product-subtitle mobile-only">{{ dato.subtitulo || 'Producto de Alta Calidad' }}</h2>

        <div class="info-content">
          <!-- Indicador de Tipo de Precio Actual - Más compacto -->
          <div class="current-price-type">
            <div class="price-type-badge" :class="{ 'preventa': isPreventaActive, 'regular': !isPreventaActive }">
              <i class="fas" :class="isPreventaActive ? 'fa-bolt' : 'fa-tag'"></i>
              <span>{{ isPreventaActive ? 'Precio de Preventa' : 'Precio Regular' }}</span>
            </div>
            <div class="price-value-display">
              <span class="price-value">{{ formatPrice(selectedPrice) }}</span>
            </div>
            <div class="quantity-limits-display">
              <span class="quantity-limit">
                <i class="fas fa-arrow-down"></i> Mín: <strong>{{ minQuantity }}</strong>
              </span>
              <span class="quantity-limit">
                <i class="fas fa-arrow-up"></i> Máx: <strong>{{ maxQuantity }}</strong>
              </span>
            </div>
          </div>

          <!-- MEJORADO: Resumen de Precios - Cajas lado a lado más compactas -->
          <div class="pricing-overview">
            <div class="pricing-boxes-container">
              <!-- Caja de Precio de Preventa - Más compacta -->
              <div class="preventa-box" v-if="hasPreventaPrice">
                <div class="preventa-header">
                  <i class="fas fa-bolt"></i> Preventa
                </div>
                <div class="preventa-content">
                  <div class="price-info-row">
                    <span class="preventa-price-value">{{ formatPrice(preventaPrice) }}</span>
                    <div class="preventa-limits">
                      <span>Mín: <strong>{{ cantidadMinimaPreventa }}</strong></span>
                      <span>Máx: <strong>{{ cantidadMaximaPreventa }}</strong></span>
                    </div>
                  </div>
                  <button class="apply-preventa-btn" @click="applyPreventaPrice" :disabled="isPreventaActive">
                    <i class="fas" :class="isPreventaActive ? 'fa-check' : 'fa-bolt'"></i>
                    {{ isPreventaActive ? 'Aplicado' : 'Usar' }}
                  </button>
                </div>
              </div>

              <!-- Caja de Precio Regular - Más compacta -->
              <div class="regular-box">
                <div class="regular-header">
                  <i class="fas fa-tag"></i> Regular
                </div>
                <div class="regular-content">
                  <div class="price-info-row">
                    <span class="regular-price-value">{{ formatPrice(regularPrice) }}</span>
                    <div class="regular-limits">
                      <span>Mín: <strong>{{ cantidadMinima }}</strong></span>
                      <span>Máx: <strong>{{ cantidadMaxima }}</strong></span>
                    </div>
                  </div>
                  <button v-if="isPreventaActive" class="apply-regular-btn" @click="applyRegularPrice">
                    <i class="fas fa-tag"></i> Usar
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Secciones de Acordeón para Móvil -->
          <div class="accordion-sections">
            <!-- Sección de Precio para Móvil - Mejorada -->
            <div class="accordion-section price-accordion" :class="{ 'expanded': expandedSection === 'price' }">
              <div class="accordion-header" @click="toggleSection('price')">
                <h3 class="section-title">Precio</h3>
                <div class="mobile-price-info">
                  <span class="current-price">{{ formatPrice(selectedPrice) }}</span>
                  <i class="fas" :class="expandedSection === 'price' ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
                </div>
              </div>
              <div class="accordion-content">
                <!-- MEJORADO: Precios en móvil lado a lado más compactos -->
                <div class="mobile-prices-container">
                  <!-- Sección de precio de preventa para móvil -->
                  <div class="preventa-price-info mobile-preventa" v-if="hasPreventaPrice">
                    <div class="mobile-price-header">
                      <div class="preventa-badge">
                        <i class="fas fa-bolt"></i> Preventa
                      </div>
                      <span class="preventa-price">{{ formatPrice(preventaPrice) }}</span>
                    </div>
                    <div class="mobile-price-details">
                      <span>{{ cantidadMinimaPreventa }}-{{ cantidadMaximaPreventa }}</span>
                      <button class="apply-preventa-btn-mobile" @click="applyPreventaPrice" :disabled="isPreventaActive">
                        <i class="fas" :class="isPreventaActive ? 'fa-check' : 'fa-bolt'"></i>
                        {{ isPreventaActive ? 'Aplicado' : 'Usar' }}
                      </button>
                    </div>
                  </div>

                  <!-- Sección de precio regular para móvil -->
                  <div class="regular-price-info mobile-regular">
                    <div class="mobile-price-header">
                      <div class="regular-badge">
                        <i class="fas fa-tag"></i> Regular
                      </div>
                      <span class="regular-price">{{ formatPrice(regularPrice) }}</span>
                    </div>
                    <div class="mobile-price-details">
                      <span>{{ cantidadMinima }}-{{ cantidadMaxima }}</span>
                      <button v-if="isPreventaActive" class="apply-regular-btn-mobile" @click="applyRegularPrice">
                        <i class="fas fa-tag"></i> Usar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Sección de Características - Más compacta -->
            <div class="accordion-section" :class="{ 'expanded': expandedSection === 'features' }">
              <div class="accordion-header" @click="toggleSection('features')">
                <h3 class="section-title">Características</h3>
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

            <!-- Colores Disponibles - Más compacto -->
            <div v-if="hasColors" class="accordion-section" :class="{ 'expanded': expandedSection === 'colors' }">
              <div class="accordion-header" @click="toggleSection('colors')">
                <h3 class="section-title">Colores</h3>
                <i class="fas" :class="expandedSection === 'colors' ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
              </div>
              <div class="accordion-content">
                <div class="color-options">
                  <button v-for="(image, index) in imagesWithColors" :key="index" class="color-swatch"
                    :style="{ backgroundColor: image.color }" @click="selectColor(getOriginalIndex(index))"
                    :class="{ active: selectedImage === getOriginalIndex(index) + 1 }"
                    :aria-label="`Color ${index + 1}`">
                    <div class="color-checkmark" v-if="selectedImage === getOriginalIndex(index) + 1">
                      <i class="fas fa-check"></i>
                    </div>
                  </button>
                </div>
                <div class="selected-color-info" v-if="selectedColor">
                  <span>Color: <strong>{{ selectedColor }}</strong></span>
                </div>
              </div>
            </div>

            <!-- Selección de Modelo - Más compacto -->
            <div v-if="dato.modelos && dato.modelos.length > 0" class="accordion-section"
              :class="{ 'expanded': expandedSection === 'models' }">
              <div class="accordion-header" @click="toggleSection('models')">
                <h3 class="section-title">Modelos</h3>
                <i class="fas" :class="expandedSection === 'models' ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
              </div>
              <div class="accordion-content">
                <div class="model-grid">
                  <button v-for="model in dato.modelos" :key="model.id"
                    :class="['model-card', { active: selectedModel === model.id }]" @click="selectModel(model)">
                    <span class="model-name">{{ model.nombre }}</span>
                    <div class="model-prices">
                      <span class="model-price">{{ formatPrice(model.precio) }}</span>
                      <span class="model-preventa-price" v-if="model.precio_preventa">
                        {{ formatPrice(model.precio_preventa) }}
                      </span>
                    </div>
                    <div class="model-limits">
                      <div class="model-regular-limits">
                        {{ model.cantidad_minima || 1 }}-{{ model.cantidad_maxima || 10 }}
                      </div>
                      <div class="model-stock" v-if="model.cantidad_maxima <= 5">
                        <i class="fas fa-exclamation-circle"></i>
                        Últimas unidades
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Sección de Características para Escritorio - Más compacta -->
          <div class="features-section desktop-only">
            <h3 class="section-title">Características</h3>
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

          <!-- Sección de Colores para Escritorio - Más compacta -->
          <div v-if="hasColors" class="color-section desktop-only">
            <h3 class="section-title">Colores</h3>
            <div class="color-options">
              <button v-for="(image, index) in imagesWithColors" :key="index" class="color-swatch"
                :style="{ backgroundColor: image.color }" @click="selectColor(getOriginalIndex(index))"
                :class="{ active: selectedImage === getOriginalIndex(index) + 1 }"
                :aria-label="`Color ${index + 1}`">
                <div class="color-checkmark" v-if="selectedImage === getOriginalIndex(index) + 1">
                  <i class="fas fa-check"></i>
                </div>
              </button>
            </div>
            <div class="selected-color-info" v-if="selectedColor">
              <span>Color: <strong>{{ selectedColor }}</strong></span>
            </div>
          </div>

          <!-- Selección de Modelo para Escritorio - Más compacta -->
          <div v-if="dato.modelos && dato.modelos.length > 0" class="model-section desktop-only">
            <h3 class="section-title">Modelos</h3>
            <div class="model-grid">
              <button v-for="model in dato.modelos" :key="model.id"
                :class="['model-card', { active: selectedModel === model.id }]" @click="selectModel(model)">
                <span class="model-name">{{ model.nombre }}</span>
                <div class="model-prices">
                  <span class="model-price">{{ formatPrice(model.precio) }}</span>
                  <span class="model-preventa-price" v-if="model.precio_preventa">
                    {{ formatPrice(model.precio_preventa) }}
                  </span>
                </div>
                <div class="model-limits">
                  <div class="model-regular-limits">
                    {{ model.cantidad_minima || 1 }}-{{ model.cantidad_maxima || 10 }}
                  </div>
                  <div class="model-stock" v-if="model.cantidad_maxima <= 5">
                    <i class="fas fa-exclamation-circle"></i>
                    Últimas unidades
                  </div>
                </div>
              </button>
            </div>
          </div>

          <!-- Sección de cantidad - Más compacta -->
          <div class="quantity-section">
            <div class="quantity-header">
              <span class="quantity-label">Cantidad:</span>
              <span class="quantity-limits">
                Mín: {{ minQuantity }} | Máx: {{ maxQuantity }}
              </span>
            </div>
            <div class="quantity-controls">
              <button @click="decreaseQuantity" :disabled="quantity <= minQuantity" class="quantity-btn"
                :class="{ 'pulse': quantity > minQuantity }" aria-label="Disminuir cantidad">
                <i class="fas fa-minus"></i>
              </button>
              <input type="number" v-model="quantity" :min="minQuantity" :max="maxQuantity" class="quantity-input"
                @change="validateQuantity" aria-label="Cantidad">
              <button @click="increaseQuantity" :disabled="quantity >= maxQuantity" class="quantity-btn"
                :class="{ 'pulse': quantity < maxQuantity }" aria-label="Aumentar cantidad">
                <i class="fas fa-plus"></i>
              </button>
            </div>

            <!-- Indicador de precio de preventa activo -->
            <div class="preventa-indicator" v-if="isPreventaActive">
              <i class="fas fa-check-circle"></i>
              <span>Precio de preventa aplicado</span>
            </div>
          </div>

          <!-- Sección de Compra - Más compacta -->
          <div class="purchase-section">
            <div class="action-buttons">
              <button class="add-to-cart" @click="addToCart" :disabled="addingToCart"
                :class="{ 'loading': addingToCart }" aria-label="Agregar al carrito">
                <i class="fas" :class="addingToCart ? 'fa-spinner fa-spin' : 'fa-shopping-cart'"></i>
                <span>{{ addingToCart ? 'Agregando...' : 'Agregar al carrito' }}</span>
                <span class="btn-shine"></span>
              </button>
              <button class="add-to-wishlist" :class="{ 'in-wishlist': isInWishlist }" @click="toggleWishlist"
                aria-label="Agregar a favoritos">
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

    <!-- Calificaciones - Más compactas -->
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
                <div class="progress-bar" :style="{ width: `${productRating.rating_percentages?.[6 - i] || 0}%` }">
                </div>
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
              @mouseover="hoverRating = star" @mouseleave="hoverRating = 0" @click="rateProduct(star)"
              :aria-label="`Calificar ${star} estrellas`">
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

    <!-- Productos Similares - Más compactos -->
    <div class="similar-products-section" v-if="productosSimilares.length > 0">
      <h2 class="section-title">
        Productos <span class="text-accent">Similares</span>
      </h2>

      <!-- Cuadrícula de Productos - Más compacta -->
      <div class="products-grid">
        <div v-for="(product, index) in productosSimilares" :key="product.id" class="product-card"
          :style="{ '--index': index }" @click="navegarAProducto(product.id)">
          <div class="product-image-wrapper">
            <div class="product-image">
              <transition name="fade" mode="out-in">
                <img :key="currentImageIndexSimilar[product.id]" :src="getCurrentImageSimilar(product)"
                  :alt="product.nombre" loading="lazy">
              </transition>

              <!-- Botones de Navegación -->
              <button class="nav-button prev" @click.stop="prevImageSimilar(product)"
                v-if="getProductImagesSimilar(product).length > 1" aria-label="Imagen anterior">
                <i class="fas fa-chevron-left"></i>
              </button>
              <button class="nav-button next" @click.stop="nextImageSimilar(product)"
                v-if="getProductImagesSimilar(product).length > 1" aria-label="Imagen siguiente">
                <i class="fas fa-chevron-right"></i>
              </button>

              <!-- Insignias -->
              <div class="badges">
                <span v-if="isNewProductSimilar(product)" class="badge badge-new">
                  <i class="fas fa-star-of-life"></i> NUEVO
                </span>
              </div>

              <!-- Acciones del Producto -->
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
          <!-- Información del Producto - Más compacta -->
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

    <!-- Barra Fija de Agregar al Carrito para Móvil - Más compacta -->
    <div class="mobile-sticky-bar">
      <div class="mobile-price">
        <div class="mobile-product-name">{{ dato.nombre }}</div>
        <div class="price-container">
          <span class="current-price">{{ formatPrice(selectedPrice) }}</span>
          <span class="original-price" v-if="originalPrice > selectedPrice">{{ formatPrice(originalPrice) }}</span>
        </div>
      </div>
      <button class="mobile-add-to-cart" @click="addToCart" :disabled="addingToCart"
        :class="{ 'loading': addingToCart }" aria-label="Agregar al carrito">
        <i class="fas" :class="addingToCart ? 'fa-spinner fa-spin' : 'fa-shopping-cart'"></i>
        <span>{{ addingToCart ? 'Agregando...' : 'Agregar' }}</span>
      </button>
    </div>

    <!-- Botón de Compartir para Móvil -->
    <button class="mobile-share-button" @click="shareProduct" aria-label="Compartir producto">
      <i class="fas fa-share-alt"></i>
    </button>

    <!-- Indicador de Deslizamiento para Móvil -->
    <div class="swipe-indicator" v-if="showSwipeIndicator">
      <div class="swipe-icon">
        <i class="fas fa-hand-pointer"></i>
        <i class="fas fa-arrows-alt-h"></i>
      </div>
      <span>Desliza para ver más imágenes</span>
    </div>

    <!-- Notificaciones Toast -->
    <div class="toast-container">
      <div v-for="(toast, index) in toasts" :key="index" class="toast"
        :class="[toast.type, { 'toast-visible': toast.visible }]" role="alert">
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
const route = useRoute();
const selectedImage = ref(0);
const selectedModel = ref(null);
const selectedModelData = ref(null);
const quantity = ref(1);
const originalPrice = ref(0);
const idProducto = router.currentRoute.value.params.idProducto;
const cartStore = useCartStore();
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

// Variables para UX móvil
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

// Propiedades computadas para precios y cantidades
const regularPrice = computed(() => {
  if (selectedModelData.value) {
    return selectedModelData.value.precio;
  }
  return dato.value.precio || 0;
});

const preventaPrice = computed(() => {
  if (selectedModelData.value && selectedModelData.value.precio_preventa) {
    return selectedModelData.value.precio_preventa;
  }
  return dato.value.precio_preventa || 0;
});

const cantidadMinima = computed(() => {
  if (selectedModelData.value) {
    return selectedModelData.value.cantidad_minima || 1;
  }
  return dato.value.cantidad_minima || 1;
});

const cantidadMaxima = computed(() => {
  if (selectedModelData.value) {
    return selectedModelData.value.cantidad_maxima || 1000;
  }
  return dato.value.cantidad_maxima || 1000;
});

const cantidadMinimaPreventa = computed(() => {
  if (selectedModelData.value && selectedModelData.value.cantidad_minima_preventa) {
    return selectedModelData.value.cantidad_minima_preventa;
  }
  return dato.value.cantidad_minima_preventa || 0;
});

const cantidadMaximaPreventa = computed(() => {
  if (selectedModelData.value && selectedModelData.value.cantidad_maxima_preventa) {
    return selectedModelData.value.cantidad_maxima_preventa;
  }
  return dato.value.cantidad_maxima_preventa || 0;
});

const hasPreventaPrice = computed(() => {
  return preventaPrice.value > 0 && cantidadMinimaPreventa.value > 0 && cantidadMaximaPreventa.value > 0;
});

// Determinar si el precio de preventa está activo según la cantidad
const isPreventaActive = computed(() => {
  if (hasPreventaPrice.value) {
    return quantity.value >= cantidadMinimaPreventa.value && quantity.value <= cantidadMaximaPreventa.value;
  }
  return false;
});

// Precio seleccionado (preventa o regular) basado en la cantidad
const selectedPrice = computed(() => {
  return isPreventaActive.value ? preventaPrice.value : regularPrice.value;
});

// Límites de cantidad basados en si es preventa o no
const minQuantity = computed(() => {
  return isPreventaActive.value ? cantidadMinimaPreventa.value : cantidadMinima.value;
});

const maxQuantity = computed(() => {
  return isPreventaActive.value ? cantidadMaximaPreventa.value : cantidadMaxima.value;
});

// Calcular porcentaje de descuento
const calcularDescuento = (precioOriginal, precioFinal) => {
  if (precioOriginal <= 0 || precioFinal <= 0) return 0;
  const descuento = ((precioOriginal - precioFinal) / precioOriginal) * 100;
  return Math.round(descuento);
};

// Obtener la etiqueta correspondiente a una calificación
const getRatingLabel = (rating) => {
  return ratingLabels[rating] || '';
};

// Aplicar precio de preventa manualmente
const applyPreventaPrice = () => {
  if (hasPreventaPrice.value) {
    // Establecer la cantidad al mínimo de preventa para activar el precio de preventa
    quantity.value = cantidadMinimaPreventa.value;
    validateQuantity(); // Validar la cantidad para asegurar que esté en el rango correcto
    showToast('Precio de preventa aplicado', 'success');
  }
};

// Aplicar precio regular manualmente
const applyRegularPrice = () => {
  // Establecer la cantidad al mínimo regular para desactivar el precio de preventa
  quantity.value = cantidadMinima.value;
  validateQuantity(); // Validar la cantidad para asegurar que esté en el rango correcto
  showToast('Precio regular aplicado', 'success');
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
  selectedModelData.value = model;
  animatePrice.value = true;

  // Establecer cantidad inicial al mínimo según el rango adecuado
  if (model.precio_preventa && model.cantidad_minima_preventa) {
    quantity.value = model.cantidad_minima_preventa;
  } else {
    quantity.value = model.cantidad_minima || 1;
  }

  // Actualizar precio original para comparación
  originalPrice.value = model.precio;

  setTimeout(() => {
    animatePrice.value = false;
  }, 300);
};

// Seleccionar un color
const selectColor = (index) => {
  selectedImage.value = index + 1;
  if (dato.value.images && dato.value.images[index]) {
    selectedColor.value = dato.value.images[index].color;
    selectedColorImage.value = dato.value.images[index].imagen;
  }
};

// Validar cantidad y actualizar rangos
const validateQuantity = () => {
  // Asegurarse de que la cantidad sea un número
  let numQuantity = parseInt(quantity.value);
  if (isNaN(numQuantity)) {
    numQuantity = minQuantity.value;
  }
  
  // Verificar si la cantidad está en el rango de preventa
  if (hasPreventaPrice.value && numQuantity >= cantidadMinimaPreventa.value && numQuantity <= cantidadMaximaPreventa.value) {
    // Estamos en rango de preventa
    quantity.value = numQuantity;
  } 
  // Si no está en rango de preventa, verificar rango regular
  else if (numQuantity >= cantidadMinima.value && numQuantity <= cantidadMaxima.value) {
    // Estamos en rango regular
    quantity.value = numQuantity;
  } 
  // Si está fuera de ambos rangos, ajustar al límite más cercano
  else if (numQuantity < cantidadMinima.value) {
    quantity.value = cantidadMinima.value;
  } else {
    quantity.value = cantidadMaxima.value;
  }
};

// Aumentar cantidad
const increaseQuantity = () => {
  if (quantity.value < maxQuantity.value) {
    quantity.value++;
    validateQuantity(); // Validar después de cambiar la cantidad
  }
};

// Disminuir cantidad
const decreaseQuantity = () => {
  if (quantity.value > minQuantity.value) {
    quantity.value--;
    validateQuantity(); // Validar después de cambiar la cantidad
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
  
  // Ocultar indicador de deslizamiento después de la primera interacción
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

// Agregar al carrito
const addToCart = async () => {
  if (addingToCart.value) return;
  addingToCart.value = true;

  try {
    // Crear objeto de producto para agregar al carrito
    const productToAdd = {
      ...dato.value,
      imagen_principal: selectedColorImage.value || dato.value.imagen_principal,
      precio: regularPrice.value,
      precio_preventa: preventaPrice.value,
      es_preventa: isPreventaActive.value,
      modeloId: selectedModel.value || null,
      nombreModelo: selectedModelData.value?.nombre || '',
      cantidad: quantity.value,
      cantidad_minima: cantidadMinima.value,
      cantidad_maxima: cantidadMaxima.value,
      cantidad_minima_preventa: cantidadMinimaPreventa.value,
      cantidad_maxima_preventa: cantidadMaximaPreventa.value,
      color: selectedColor.value,
      colorImage: selectedColorImage.value,
    };

    await cartStore.addToCart(productToAdd);
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

// Función de navegación mejorada
const navegarAProducto = async (productId) => {
  // Evitar recargar el mismo producto
  if (productId === parseInt(route.params.idProducto)) return;

  try {
    // Primer enfoque: Forzar recarga del componente usando una clave
    // Esto se hace navegando con replace y añadiendo una marca de tiempo
    await router.replace({
      path: `/producto/${productId}`,
      query: { _t: Date.now() } // Añadir marca de tiempo para forzar recarga
    });

    // Segundo enfoque: Recargar manualmente los datos después de la navegación
    const { data } = await detalleProducto(productId);
    dato.value = data.dato;
    productosSimilares.value = data.productos_similares || [];

    // Resetear todas las variables de estado
    selectedImage.value = 0;
    selectedModel.value = null;
    selectedModelData.value = null;
    selectedColor.value = null;
    selectedColorImage.value = '';
    showAllFeatures.value = false;
    showSwipeIndicator.value = true;
    hasScrolled.value = false;

    // Inicializar índices de imágenes para productos similares
    productosSimilares.value.forEach(product => {
      currentImageIndexSimilar.value[product.id] = 0;
    });

    // Inicializar precio original con el precio del producto principal
    originalPrice.value = dato.value.precio;

    // Establecer cantidad inicial según si hay precio de preventa
    if (hasPreventaPrice.value) {
      quantity.value = cantidadMinimaPreventa.value;
    } else {
      quantity.value = cantidadMinima.value;
    }
    
    // Validar la cantidad inicial
    validateQuantity();

    // Recargar calificaciones
    indexRatingUser();

    // Animar elementos después de cargar
    nextTick(() => {
      animateElements();
      document.querySelector('.product-detail')?.classList.add('loaded');
      window.scrollTo(0, 0); // Desplazar al inicio
    });

  } catch (error) {
    console.error('Error al navegar al producto:', error);
    // Fallback a navegación tradicional si lo anterior falla
    router.push(`/producto/${productId}`);
  }
};

// Funciones de navegación
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
      // Fallback para navegadores que no soportan Web Share API
      navigator.clipboard.writeText(window.location.href);
      showToast('Enlace copiado al portapapeles', 'success');
    }
  } catch (error) {
    console.error('Error al compartir:', error);
    showToast('Error al compartir el producto', 'error');
  }
};

// Sistema de notificaciones toast
const showToast = (message, type = 'info') => {
  const toast = {
    message,
    type,
    visible: true,
    id: Date.now()
  };
  
  toasts.value.push(toast);
  
  // Auto ocultar después de 3 segundos
  setTimeout(() => {
    const index = toasts.value.findIndex(t => t.id === toast.id);
    if (index !== -1) {
      toasts.value[index].visible = false;
      
      // Eliminar del array después de completar la animación
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
    console.log('Datos del producto:', data);
    dato.value = data.dato;
    
    // Inicializar precio original con el precio del producto principal
    originalPrice.value = dato.value.precio;

    // Cargar productos similares
    productosSimilares.value = data.productos_similares || [];

    // Inicializar índices de imágenes para productos similares
    productosSimilares.value.forEach(product => {
      currentImageIndexSimilar.value[product.id] = 0;
    });

    // Establecer cantidad inicial según si hay precio de preventa
    if (hasPreventaPrice.value) {
      quantity.value = cantidadMinimaPreventa.value;
    } else {
      quantity.value = cantidadMinima.value;
    }
    
    // Validar la cantidad inicial
    validateQuantity();

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
    expandedSection.value = 'price'; // Mostrar sección de precio por defecto en móvil
    // Mostrar el mobile header
    const mobileHeader = document.querySelector('.mobile-header');
    if (mobileHeader) mobileHeader.style.display = 'block';
  }

  // Si ya tenemos un ID de producto, cargar las estadísticas de calificación
  if (route.params.idProducto) {
    loadProductRatingStats(route.params.idProducto);
  }
  
  // Auto-ocultar indicador de deslizamiento después de 5 segundos
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

// Observar cambios en la cantidad para actualizar el estado de preventa
watch(quantity, () => {
  // Validar la cantidad cada vez que cambie para asegurar que esté en el rango correcto
  validateQuantity();
});

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

/* Estilos Base */
.product-detail {
  padding: 2rem 1.5rem;
  min-height: 100vh;
  opacity: 0;
  animation: fadeIn 0.6s cubic-bezier(0.23, 1, 0.32, 1) forwards;
  animation-delay: 0.2s;
  padding-bottom: 80px; /* Espacio para la barra fija móvil */
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

/* Clases de Utilidad */
.desktop-only {
  display: block;
}

.mobile-only {
  display: none;
}

/* Indicador de Tipo de Precio Actual - Más compacto */
.current-price-type {
  background: #f8f9fa;
  border-radius: 0.75rem;
  padding: 0.75rem;
  margin-bottom: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border-left: 4px solid #2ecc71;
  transition: all 0.3s ease;
}

.current-price-type:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.price-type-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.35rem 0.75rem;
  border-radius: 2rem;
  font-size: 0.8rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: white;
}

.price-type-badge.preventa {
  background: #3498db;
}

.price-type-badge.regular {
  background: #2ecc71;
}

.price-value-display {
  margin-bottom: 0.5rem;
}

.price-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #333;
  display: block;
}

.price-original {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.25rem;
}

.original-value {
  color: #999;
  text-decoration: line-through;
  font-size: 0.9rem;
}

.discount-tag {
  background: #ff4444;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 600;
}

.quantity-limits-display {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.quantity-limit {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: #666;
}

.quantity-limit i {
  color: #3498db;
}

/* MEJORADO: Resumen de Precios - Cajas lado a lado más compactas */
.pricing-overview {
  margin-bottom: 1rem;
  border-radius: 0.75rem;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.pricing-boxes-container {
  display: flex;
  flex-direction: row;
  gap: 0.5rem;
}

.preventa-box,
.regular-box {
  flex: 1;
  border-radius: 0.5rem;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.preventa-box {
  border: 1px solid #3498db;
}

.regular-box {
  border: 1px solid #2ecc71;
}

.preventa-header,
.regular-header {
  padding: 0.5rem 0.75rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: white;
  font-size: 0.9rem;
}

.preventa-header {
  background: #3498db;
}

.regular-header {
  background: #2ecc71;
}

.preventa-content,
.regular-content {
  padding: 0.75rem;
  background: white;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.price-info-row {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.preventa-price-value,
.regular-price-value {
  font-size: 1.25rem;
  font-weight: 700;
  text-align: center;
}

.preventa-price-value {
  color: #3498db;
}

.regular-price-value {
  color: #2ecc71;
}

.preventa-limits,
.regular-limits {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.7rem;
  color: #666;
  text-align: center;
}

.apply-preventa-btn,
.apply-regular-btn,
.apply-preventa-btn-mobile,
.apply-regular-btn-mobile {
  padding: 0.4rem 0.75rem;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  justify-content: center;
  width: 100%;
}

.apply-preventa-btn,
.apply-preventa-btn-mobile {
  background: #3498db;
  color: white;
}

.apply-regular-btn,
.apply-regular-btn-mobile {
  background: #2ecc71;
  color: white;
}

.apply-preventa-btn:hover:not(:disabled),
.apply-regular-btn:hover:not(:disabled),
.apply-preventa-btn-mobile:hover:not(:disabled),
.apply-regular-btn-mobile:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.apply-preventa-btn:disabled,
.apply-preventa-btn-mobile:disabled {
  background: #a8d4f5;
  cursor: not-allowed;
}

.apply-preventa-btn-mobile,
.apply-regular-btn-mobile {
  margin-top: 0.5rem;
  width: 100%;
  padding: 0.4rem;
  font-size: 0.75rem;
}

/* MEJORADO: Precios en móvil lado a lado más compactos */
.mobile-prices-container {
  display: flex;
  flex-direction: row;
  gap: 0.5rem;
}

.mobile-preventa,
.mobile-regular {
  flex: 1;
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
  padding: 0.5rem;
}

/* Cabecera Móvil */
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

/* Vista previa de precio para móvil - Más compacta */
.mobile-price-preview {
  display: none;
  align-items: center;
  gap: 8px;
  margin-top: 0.5rem;
  background-color: #f8f9fa;
  padding: 0.5rem 0.75rem;
  border-radius: 0.75rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.mobile-price-preview .current-price {
  font-size: 1.1rem;
  font-weight: 700;
  color: #333;
}

.mobile-price-preview .original-price {
  font-size: 0.8rem;
  color: #999;
  text-decoration: line-through;
}

/* Clases de Animación */
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

/* Sección de Imágenes - Más compacta */
.product-images {
  position: sticky;
  top: 1rem;
  display: grid;
  gap: 1rem;
}

.main-image-wrapper {
  border-radius: 1rem;
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

/* Navegación de Imágenes - Más compacta */
.image-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 36px;
  height: 36px;
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

/* Paginación de Imágenes para Móvil - Más compacta */
.image-pagination {
  position: absolute;
  bottom: 10px;
  width: 100%;
  display: flex;
  justify-content: center;
  gap: 8px;
}

.pagination-dot {
  width: 8px;
  height: 8px;
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
  padding: 0.4rem 0.8rem;
  border-radius: 2rem;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.8rem;
}

.main-image-container:hover .zoom-hint {
  transform: translateY(0);
  opacity: 1;
}

/* Miniaturas - Más compactas */
.thumbnail-list {
  position: relative;
  display: flex;
  gap: 0.5rem;
}

.thumbnail-container {
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  padding: 0.5rem 0;
  margin: 0 -1.5rem;
  padding: 0 1.5rem;
  scrollbar-width: none; /* Firefox */
}

.thumbnail-container::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Edge */
}

.thumbnail {
  flex: 0 0 80px;
  height: 80px;
  border-radius: 0.75rem;
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

/* Secciones de Acordeón para Móvil - Más compactas */
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

.price-accordion {
  background-color: #f8f9fa;
  border-color: #007bff;
  margin-bottom: 0.75rem;
}

.price-accordion .accordion-header {
  background-color: rgba(0, 123, 255, 0.05);
  padding: 0.75rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.mobile-price-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.accordion-header {
  padding: 0.75rem;
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
  font-weight: 600;
}

.accordion-content {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.4s ease;
  padding: 0 1rem;
}

.accordion-section.expanded .accordion-content {
  max-height: 600px;
  padding: 0.75rem 1rem;
}

/* Preventa and Regular Price Info - Más compactas */
.preventa-price-info,
.regular-price-info {
  padding: 0.5rem;
  border-radius: 0.75rem;
}

.preventa-price-info {
  background: rgba(52, 152, 219, 0.1);
  border-left: 3px solid #3498db;
}

.regular-price-info {
  background: rgba(46, 204, 113, 0.1);
  border-left: 3px solid #2ecc71;
}

.preventa-badge,
.regular-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  border-radius: 1rem;
  font-size: 0.7rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.preventa-badge {
  background: #3498db;
  color: white;
}

.regular-badge {
  background: #2ecc71;
  color: white;
}

.preventa-price,
.regular-price {
  font-size: 1.1rem;
  font-weight: 700;
  display: block;
  margin-bottom: 0.25rem;
}

.preventa-price {
  color: #3498db;
}

.regular-price {
  color: #2ecc71;
}

.preventa-details,
.regular-details {
  font-size: 0.7rem;
  color: #666;
}

/* Sección de Características - Más compacta */
.features-section {
  margin: 1.25rem 0;
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: #333;
  position: relative;
  display: inline-block;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 30px;
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
  gap: 0.4rem;
}

.feature-item {
  transition: all 0.3s ease;
  padding: 0.5rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  border: 1px solid transparent;
}

.feature-item i {
  color: #4CAF50;
  font-size: 0.9rem;
}

.feature-hover {
  background: rgba(33, 150, 243, 0.08);
  transform: translateX(0.5rem);
  border-color: rgba(33, 150, 243, 0.2);
  box-shadow: 0 2px 8px rgba(33, 150, 243, 0.1);
}

/* Botón "Ver más" para Características - Más compacto */
.show-more-btn {
  margin-top: 0.75rem;
  background: none;
  border: none;
  color: #007bff;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.75rem;
  border-radius: 0.5rem;
  transition: all 0.3s ease;
}

.show-more-btn:hover {
  background: rgba(0, 123, 255, 0.1);
  transform: translateY(-2px);
}

.show-more-btn.desktop {
  margin-top: 0.75rem;
}

/* Sección de Colores - Más compacta */
.color-section {
  margin: 1.25rem 0;
}

.color-options {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.color-swatch {
  width: 32px;
  height: 32px;
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
  font-size: 0.7rem;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  animation: scaleIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.selected-color-info {
  margin-top: 0.5rem;
  font-size: 0.8rem;
  color: #666;
}

@keyframes scaleIn {
  from {
    transform: translate(-50%, -50%) scale(0);
  }

  to {
    transform: translate(-50%, -50%) scale(1);
  }
}

/* Sección de Modelo - Más compacta */
.model-section {
  margin: 1.25rem 0;
}

.model-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.model-card {
  padding: 0.5rem;
  border: 1px solid #e0e0e0;
  border-radius: 0.75rem;
  background: white;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
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
  font-size: 0.8rem;
  font-weight: 600;
  color: #333;
}

.model-prices {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.model-price {
  font-size: 0.75rem;
  color: #666;
}

.model-preventa-price {
  font-size: 0.7rem;
  color: #3498db;
  font-weight: 500;
}

.model-limits {
  font-size: 0.65rem;
  color: #777;
  margin-top: 0.25rem;
}

.model-regular-limits,
.model-preventa-limits {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.model-preventa-limits {
  color: #3498db;
}

.model-stock {
  font-size: 0.7rem;
  color: #f57c00;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin-top: 0.25rem;
}

/* Sección de cantidad - Más compacta */
.quantity-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin: 1.25rem 0;
}

.quantity-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.quantity-label {
  font-size: 0.85rem;
  color: #333;
  font-weight: 500;
}

.quantity-limits {
  font-size: 0.7rem;
  color: #666;
}

.quantity-controls {
  display: flex;
  align-items: center;
  border: 1px solid #e0e0e0;
  border-radius: 0.5rem;
  overflow: hidden;
  height: 2.25rem;
  background: white;
  transition: all 0.3s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  width: fit-content;
}

.quantity-controls:hover {
  border-color: #007bff;
  box-shadow: 0 4px 10px rgba(0, 123, 255, 0.1);
}

.quantity-btn {
  width: 2.25rem;
  height: 2.25rem;
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
  font-size: 0.7rem;
}

.quantity-input {
  color: #000;
  width: 2.5rem;
  height: 2.25rem;
  border: none;
  text-align: center;
  font-size: 0.85rem;
  font-weight: 500;
  background: white;
  padding: 0;
}

.quantity-input::-webkit-outer-spin-button,
.quantity-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.preventa-indicator {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin-top: 0.4rem;
  color: #2ecc71;
  font-size: 0.8rem;
  font-weight: 500;
  animation: fadeIn 0.3s ease;
}

.preventa-indicator i {
  font-size: 0.9rem;
}

/* Sección de Compra - Más compacta */
.purchase-section {
  margin-top: 1.25rem;
  padding-top: 1.25rem;
  border-top: 1px solid #e0e0e0;
}

.action-buttons {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 0.5rem;
}

.add-to-cart {
  height: 2.75rem;
  padding: 0 1.25rem;
  border: none;
  border-radius: 0.75rem;
  background: linear-gradient(45deg, #007bff, #0056b3);
  color: white;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
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
  font-size: 0.85rem;
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
  width: 2.75rem;
  height: 2.75rem;
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
  font-size: 0.9rem;
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
  padding: 0.4rem 0.6rem;
  border-radius: 0.5rem;
  font-size: 0.7rem;
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
  border-width: 4px;
  border-style: solid;
  border-color: rgba(0, 0, 0, 0.8) transparent transparent transparent;
}

.add-to-wishlist:hover .tooltip {
  opacity: 1;
  visibility: visible;
  transform: translateX(-50%) translateY(-4px);
}

/* Barra Fija para Móvil - Más compacta */
.mobile-sticky-bar {
  display: none;
  position: fixed;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  width: calc(100% - 32px);
  max-width: 480px;
  background: white;
  padding: 0.6rem 0.8rem;
  border-radius: 0.8rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
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
  font-size: 0.9rem;
  color: #333;
  margin-bottom: 0.2rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 160px;
}

.price-container {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.mobile-price .current-price {
  font-size: 1rem;
}

.mobile-price .original-price {
  font-size: 0.8rem;
}

.mobile-add-to-cart {
  height: 2.25rem;
  padding: 0 1rem;
  border: none;
  border-radius: 0.5rem;
  background: linear-gradient(45deg, #007bff, #0056b3);
  color: white;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
}

.mobile-add-to-cart:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Botón de Compartir para Móvil - Más compacto */
.mobile-share-button {
  display: none;
  position: fixed;
  bottom: 70px;
  right: 16px;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #007bff;
  color: white;
  border: none;
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
  z-index: 90;
  cursor: pointer;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
}

.mobile-share-button:active {
  transform: scale(0.95);
  background: #0056b3;
}

/* Indicador de Deslizamiento - Más compacto */
.swipe-indicator {
  display: none;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 0.6rem 0.8rem;
  border-radius: 0.8rem;
  z-index: 10;
  text-align: center;
  animation: fadeInOut 3s ease-in-out;
}

.swipe-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  margin-bottom: 0.4rem;
  font-size: 1.1rem;
}

@keyframes fadeInOut {
  0%, 100% {
    opacity: 0;
  }

  20%, 80% {
    opacity: 1;
  }
}

/* Notificaciones Toast - Más compactas */
.toast-container {
  position: fixed;
  bottom: 70px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  width: 90%;
  max-width: 280px;
}

.toast {
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 0.6rem 0.8rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.3s ease;
  font-size: 0.85rem;
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

/* Estado de Carga */
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

/* Sección de Calificaciones - Más compacta */
.rating-section {
  max-width: 1440px;
  margin: 2.5rem auto;
  padding: 1.5rem 1rem;
  border-radius: 1rem;
  animation: fadeIn 0.8s ease forwards;
  animation-delay: 0.3s;
  opacity: 0;
}

.rating-section .section-title {
  font-size: clamp(1.5rem, 3vw, 2rem);
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 1.5rem;
  text-align: center;
  position: relative;
}

.rating-section .section-title::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 3px;
  background: linear-gradient(45deg, #007bff, #00bcd4);
  border-radius: 3px;
}

.rating-overview {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  margin-top: 1.25rem;
}

@media (min-width: 768px) {
  .rating-overview {
    grid-template-columns: 1fr 1fr;
  }
}

.rating-summary {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.average-rating {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
}

.rating-value {
  font-size: 2.5rem;
  font-weight: 700;
  color: #333;
  line-height: 1;
}

.rating-count {
  font-size: 0.8rem;
  color: #666;
}

.rating-stars {
  display: flex;
  align-items: center;
}

.rating-stars.large {
  font-size: 1.5rem;
}

.rating-stars.small {
  font-size: 0.9rem;
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
  gap: 0.6rem;
}

.rating-bar {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.rating-label {
  min-width: 2.25rem;
  font-size: 0.8rem;
  color: #555;
  display: flex;
  align-items: center;
  gap: 0.2rem;
}

.star-icon {
  color: #FFD700;
  font-size: 0.8rem;
}

.progress-container {
  flex-grow: 1;
  height: 0.4rem;
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
  min-width: 2.25rem;
  font-size: 0.7rem;
  color: #666;
  text-align: right;
}

.user-rating {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  padding: 1.25rem;
  background: white;
  border-radius: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.user-rating h4 {
  margin: 0;
  font-size: 1rem;
  color: #333;
}

.rating-stars.interactive {
  display: flex;
  gap: 0.4rem;
  font-size: 1.75rem;
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
  font-size: 0.9rem;
  font-weight: 500;
  color: #333;
  min-height: 1.25rem;
}

.rating-label.placeholder {
  color: #999;
  font-style: italic;
  font-weight: normal;
}

.rating-actions {
  display: flex;
  justify-content: center;
  margin-top: 0.8rem;
}

.submit-rating {
  padding: 0.6rem 1.25rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.4rem;
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

/* Productos Similares - Más compactos */
.similar-products-section {
  max-width: 1440px;
  margin: 2.5rem auto;
  padding: 1.5rem 1rem;
  border-radius: 1rem;
}

.similar-products-section .section-title {
  font-size: clamp(1.5rem, 3vw, 2rem);
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 1.5rem;
  text-align: center;
  position: relative;
}

.text-accent {
  color: #3498db;
  position: relative;
  display: inline-block;
}

/* Cuadrícula de Productos - Más compacta */
.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1rem;
  margin-top: 1.5rem;
}

.product-card {
  background: white;
  border-radius: 0.8rem;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  cursor: pointer;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.product-image-wrapper {
  position: relative;
  padding-top: 100%;
  overflow: hidden;
}

.product-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.product-card:hover .product-image img {
  transform: scale(1.05);
}

.product-info-card {
  padding: 0.8rem;
}

.category {
  font-size: 0.7rem;
  color: #666;
  margin-bottom: 0.4rem;
  display: flex;
  align-items: center;
  gap: 0.2rem;
}

.product-name {
  font-size: 0.9rem;
  font-weight: 600;
  margin: 0.4rem 0;
  color: #333;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  height: 2.25rem;
}

.rating-container {
  margin: 0.4rem 0;
}

.rating {
  display: flex;
  gap: 0.2rem;
}

.star {
  color: #e0e0e0;
  font-size: 0.8rem;
}

.star.filled {
  color: #FFD700;
}

.rating-count {
  font-size: 0.7rem;
  color: #666;
  margin-top: 0.2rem;
}

.price {
  display: flex;
  align-items: baseline;
  gap: 0.4rem;
}

.current-price {
  font-size: 1rem;
  font-weight: 700;
  color: #333;
}

.old-price {
  font-size: 0.8rem;
  color: #999;
  text-decoration: line-through;
}

.badges {
  position: absolute;
  top: 8px;
  left: 8px;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  z-index: 5;
}

.badge {
  padding: 0.2rem 0.4rem;
  border-radius: 0.25rem;
  font-size: 0.7rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.2rem;
}

.badge-new {
  background: linear-gradient(45deg, #4CAF50, #8BC34A);
  color: white;
}

.product-actions-bottom {
  position: absolute;
  bottom: 8px;
  right: 8px;
  display: flex;
  gap: 0.4rem;
  z-index: 5;
}

.action-button {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.action-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.cart-btn {
  color: #007bff;
}

.view-btn {
  color: #333;
}

.fav-btn {
  color: #dc3545;
}

.fav-btn.in-favorites {
  background: #dc3545;
  color: white;
}

.nav-button {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.8);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 5;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.nav-button.prev {
  left: 8px;
}

.nav-button.next {
  right: 8px;
}

/* Diseño Responsivo - Optimizado */
@media (max-width: 1024px) {
  .product-container {
    gap: 1.25rem;
  }

  .product-images {
    position: relative;
    top: 0;
  }

  .product-title {
    font-size: 1.5rem;
  }
  
  /* MODIFICADO: Cajas de precio en tablet */
  .pricing-boxes-container {
    flex-direction: row;
    gap: 0.5rem;
  }
}

@media (max-width: 768px) {
  .product-detail {
    padding: 0.5rem 1rem 70px 1rem;
  }

  .desktop-only {
    display: none !important;
  }

  .mobile-only {
    display: block !important;
  }

  .main-image-wrapper {
    border-radius: 0.8rem;
  }

  .thumbnail {
    flex: 0 0 70px;
    height: 70px;
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
    margin-top: 1.25rem;
  }

  /* MODIFICADO: Cajas de precio en móvil - Mantener lado a lado */
  .pricing-boxes-container {
    flex-direction: row;
    gap: 0.5rem;
  }

  /* Mejorar objetivos táctiles para móvil */
  .quantity-btn {
    width: 36px;
    height: 36px;
  }

  .quantity-input {
    width: 45px;
    height: 36px;
    font-size: 16px; /* Evitar zoom en iOS */
  }

  /* Mejorar secciones de acordeón para mejor UX móvil */
  .accordion-section {
    margin-bottom: 0.75rem;
  }

  .accordion-header {
    padding: 0.75rem;
  }

  .accordion-content {
    padding: 0 0.75rem;
  }

  .accordion-section.expanded .accordion-content {
    padding: 0.75rem;
  }

  /* Mejorar navegación de imágenes en móvil */
  .image-nav {
    width: 32px;
    height: 32px;
    opacity: 0.9;
  }

  .pagination-dot {
    width: 6px;
    height: 6px;
  }

  /* Mejorar muestras de color para táctil */
  .color-swatch {
    width: 30px;
    height: 30px;
  }

  .price-value {
    font-size: 1.25rem; /* Reducido para tablets */
  }

  .preventa-price-value,
  .regular-price-value {
    font-size: 1.25rem; /* Reducido para tablets */
  }

  .current-price {
    font-size: 1.25rem; /* Reducido para tablets */
  }
}

@media (max-width: 480px) {
  .product-title {
    font-size: 1.25rem;
  }

  .current-price {
    font-size: 1.25rem;
  }

  .add-to-cart {
    height: 42px;
  }

  .thumbnail {
    flex: 0 0 60px;
    height: 60px;
  }

  .quantity-section {
    flex-direction: column;
    align-items: flex-start;
  }

  .quantity-controls {
    width: 100%;
    justify-content: center;
  }

  /* MODIFICADO: Mantener precios en móvil pequeño lado a lado */
  .mobile-prices-container {
    flex-direction: row;
    gap: 0.5rem;
  }

  /* Ajustar barra fija para pantallas más pequeñas */
  .mobile-sticky-bar {
    padding: 0.4rem 0.8rem;
  }

  .mobile-product-name {
    font-size: 0.8rem;
    max-width: 140px;
  }

  .mobile-price .current-price {
    font-size: 1rem;
  }

  .mobile-add-to-cart {
    padding: 0 0.8rem;
  }

  /* Mejorar notificaciones toast */
  .toast-container {
    max-width: 260px;
  }

  .toast {
    padding: 0.5rem 0.7rem;
    font-size: 0.8rem;
  }

  .price-value {
    font-size: 1.1rem; /* Reducido aún más para móvil */
  }

  .preventa-price-value,
  .regular-price-value {
    font-size: 1.1rem; /* Reducido aún más para móvil */
  }

  .current-price {
    font-size: 1.1rem; /* Reducido aún más para móvil */
  }

  /* Mejorar visualización de precio en acordeón para móvil */
  .mobile-price-info .current-price {
    font-size: 1rem;
  }

  .preventa-price,
  .regular-price {
    font-size: 1rem;
  }

  /* Mejorar vista previa de precio para móvil */
  .mobile-price-preview .current-price {
    font-size: 1rem;
  }
}

/* Optimizaciones para Dispositivos Táctiles */
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
    transform: scale(0.95);
  }

  .model-card:active {
    background: rgba(0, 123, 255, 0.05);
  }

  /* Mejorar retroalimentación táctil */
  .color-swatch:active {
    transform: scale(1.1);
  }

  .quantity-btn:active:not(:disabled) {
    background: rgba(0, 123, 255, 0.2);
  }

  .mobile-add-to-cart:active {
    transform: scale(0.98);
  }

  /* Asegurar objetivos táctiles lo suficientemente grandes */
  .pagination-dot {
    width: 10px;
    height: 10px;
    margin: 0 3px;
  }

  .image-nav {
    width: 36px;
    height: 36px;
  }
}

/* Mejoras de Accesibilidad */
@media (prefers-reduced-motion: reduce) {
  .product-detail {
    animation: none;
    opacity: 1;
  }

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

  .btn-shine {
    animation: none;
  }
}
</style>