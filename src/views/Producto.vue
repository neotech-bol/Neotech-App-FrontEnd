<template>
  <div class="product-detail">
    <!-- Cabecera Móvil Mejorada -->
    <div class="mobile-header">
      <div class="mobile-nav">
        <button class="back-button" @click="goBack" aria-label="Volver">
          <i class="fas fa-arrow-left"></i>
        </button>
        <button class="mobile-share-button-header" @click="shareProduct" aria-label="Compartir producto">
          <i class="fas fa-share-alt"></i>
        </button>
      </div>

      <h1 class="product-title">{{ dato.nombre }}</h1>
    </div>

    <div class="product-container">
      <!-- Sección de Imágenes del Producto -->
      <div class="product-images">
        <!-- Imagen Principal con Zoom -->
        <div class="main-image-wrapper">
          <div class="main-image-container" @mousemove="handleImageZoom" @mouseleave="resetZoom"
            @touchstart="handleTouchStart" @touchmove="handleTouchMove" @touchend="resetZoom">
            <img :src="currentImage" :alt="dato.nombre" class="main-image-img" ref="mainImage">

            <!-- Cursor de lupa al pasar el mouse -->
            <div class="magnifier-cursor" v-if="showMagnifier" :style="magnifierStyle">
              <i class="fas fa-search-plus"></i>
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

        <!-- Galería de Miniaturas - Con Paginación -->
        <div class="thumbnail-list" ref="thumbnailScroll">
          <!-- Botones de Navegación de Miniaturas -->
          <button class="thumbnail-nav prev" @click="prevThumbnailPage" :disabled="currentThumbnailPage === 0"
            aria-label="Miniaturas anteriores">
            <i class="fas fa-chevron-left"></i>
          </button>

          <div class="thumbnail-container" ref="thumbnailContainer">
            <div class="thumbnail-wrapper" :style="thumbnailWrapperStyle">
              <div v-for="(image, index) in allImages" :key="index"
                :class="['thumbnail', { active: selectedImage === index }]" @click="selectThumbnail(index)">
                <img :src="image" :alt="`Vista ${index + 1} de ${dato.nombre}`" loading="lazy">
              </div>
            </div>
          </div>

          <button class="thumbnail-nav next" @click="nextThumbnailPage"
            :disabled="currentThumbnailPage >= maxThumbnailPage" aria-label="Miniaturas siguientes">
            <i class="fas fa-chevron-right"></i>
          </button>

          <!-- Indicador de Página -->
          <div class="thumbnail-pagination" v-if="totalThumbnailPages > 1">
            <span v-for="page in totalThumbnailPages" :key="page"
              :class="['thumbnail-page-dot', { active: currentThumbnailPage === page - 1 }]"
              @click="goToThumbnailPage(page - 1)"></span>
          </div>
        </div>
      </div>

      <!-- Sección de Información del Producto -->
      <div class="product-info">
        <div class="sticky-header desktop-only">
          <h1 class="product-title">{{ dato.nombre }}</h1>
          <h2 class="product-subtitle">{{ dato.subtitulo || 'Producto de Alta Calidad' }}</h2>
        </div>

        <!-- Subtítulo solo para móvil -->
        <h2 class="product-subtitle mobile-only">{{ dato.subtitulo || 'Producto de Alta Calidad' }}</h2>

        <div class="info-content">
          <!-- Sección de Precios Mejorada -->
          <div class="price-section">
            <!-- Indicador de Tipo de Precio Actual -->
            <div class="price-type-indicator">
              <div class="price-badge"
                :class="{ 'preventa-especial': isPreventaEspecialActive, 'preventa-estandar': isPreventaEstandarActive, 'regular': !isPreventaEspecialActive && !isPreventaEstandarActive }">
                <i class="fas" :class="getPriceBadgeIcon"></i>
                <span>{{ getPriceTypeName }}</span>
              </div>
            </div>

            <!-- Precio Principal con Descuento -->
            <div class="main-price-display">
              <div class="price-value-display">
                <span class="price-value">{{ formatPrice(selectedPrice) }}</span>
                <span v-if="originalPrice > selectedPrice" class="original-price">{{ formatPrice(originalPrice)
                  }}</span>
                <span v-if="originalPrice > selectedPrice" class="discount-percentage">
                  -{{ Math.round((1 - selectedPrice / originalPrice) * 100) }}%
                </span>
              </div>

              <div class="quantity-range">
                <span class="range-label">Rango: </span>
                <span class="range-value">{{ minQuantity }} - {{ maxQuantity }} unidades</span>
              </div>
            </div>

            <!-- Selector de Tipo de Precio Mejorado -->
            <div class="price-type-selector" v-if="hasMultiplePriceTypes">
              <div class="price-tabs">
                <button @click="applyPreventaEstandar" :class="['price-tab', { 'active': isPreventaEstandarActive }]"
                  :disabled="!canSwitchToPreventaEstandar" aria-pressed="isPreventaEstandarActive">
                  <i class="fas fa-tag"></i> Preventa Especial
                </button>
                <button @click="applyPreventaEspecial" :class="['price-tab', { 'active': isPreventaEspecialActive }]"
                  :disabled="!canSwitchToPreventaEspecial" aria-pressed="isPreventaEspecialActive">
                  <i class="fas fa-bolt"></i> Preventa Estándar
                </button>
              </div>
            </div>

            <!-- Comparación de Precios -->
            <div class="price-comparison" v-if="hasMultiplePriceTypes">
              <div class="comparison-header">
                <i class="fas fa-info-circle"></i> Comparación de precios
              </div>
              <div class="comparison-body">
                <div class="comparison-grid">
                  <!-- Preventa Estándar -->
                  <div class="comparison-item">
                    <div class="comparison-label">Preventa Especial</div>
                    <div class="comparison-value">{{ formatPrice(regularPrice) }}</div>
                    <div class="comparison-range">{{ cantidadMinima }}-{{ cantidadMaxima }} und.</div>
                  </div>

                  <!-- Preventa Especial -->
                  <div class="comparison-item" v-if="hasPreventaEspecialPrice">
                    <div class="comparison-label">Preventa Estándar</div>
                    <div class="comparison-value">{{ formatPrice(preventaEspecialPrice) }}</div>
                    <div class="comparison-range">{{ cantidadMinimaPreventaEspecial }}-{{ cantidadMaximaPreventaEspecial
                      }} und.</div>
                  </div>
                </div>

                <!-- Información de Ahorro -->
                <div class="savings-info" v-if="regularPrice > preventaEspecialPrice && hasPreventaEspecialPrice">
                  <i class="fas fa-piggy-bank"></i> Ahorro por unidad:
                  <span>{{ formatPrice(regularPrice - preventaEspecialPrice) }}</span>
                  ({{ Math.round((1 - preventaEspecialPrice / regularPrice) * 100) }}%)
                </div>
              </div>
            </div>
          </div>

          <!-- Secciones de Acordeón para Móvil -->
          <div class="accordion-sections">
            <!-- Sección de Características -->
            <div class="accordion-section" :class="{ 'expanded': expandedSection === 'features' }">
              <div class="accordion-header" @click="toggleSection('features')">
                <h3 class="section-title">Características</h3>
                <i class="fas" :class="expandedSection === 'features' ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
              </div>
              <div class="accordion-content">
                <ul class="features">
                  <li v-for="caracteristica in visibleCaracteristicas" :key="caracteristica.id" class="feature-item">
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

            <!-- Colores Disponibles -->
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

            <!-- Selección de Modelo -->
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
                    <div class="model-price">{{ formatPrice(model.precio) }}</div>
                    <div class="model-stock" v-if="model.cantidad_maxima <= 5">
                      <i class="fas fa-exclamation-circle"></i>
                      Últimas unidades
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Sección de Características para Escritorio -->
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

          <!-- Sección de Colores para Escritorio -->
          <div v-if="hasColors" class="color-section desktop-only">
            <h3 class="section-title">Colores</h3>
            <div class="color-options">
              <button v-for="(image, index) in imagesWithColors" :key="index" class="color-swatch"
                :style="{ backgroundColor: image.color }" @click="selectColor(getOriginalIndex(index))"
                :class="{ active: selectedImage === getOriginalIndex(index) + 1 }" :aria-label="`Color ${index + 1}`">
                <div class="color-checkmark" v-if="selectedImage === getOriginalIndex(index) + 1">
                  <i class="fas fa-check"></i>
                </div>
              </button>
            </div>
            <div class="selected-color-info" v-if="selectedColor">
              <span>Color: <strong>{{ selectedColor }}</strong></span>
            </div>
          </div>

          <!-- Selección de Modelo para Escritorio -->
          <div v-if="dato.modelos && dato.modelos.length > 0" class="model-section desktop-only">
            <h3 class="section-title">Modelos</h3>
            <div class="model-grid">
              <button v-for="model in dato.modelos" :key="model.id"
                :class="['model-card', { active: selectedModel === model.id }]" @click="selectModel(model)">
                <span class="model-name">{{ model.nombre }}</span>
                <div class="model-price">{{ formatPrice(model.precio) }}</div>
                <div class="model-stock" v-if="model.cantidad_maxima <= 5">
                  <i class="fas fa-exclamation-circle"></i>
                  Últimas unidades
                </div>
              </button>
            </div>
          </div>

          <!-- Sección de cantidad -->
          <div class="quantity-section">
            <div class="quantity-header">
              <span class="quantity-label">Cantidad:</span>
              <div class="quantity-status" :class="{
                'warning': isNearRangeLimit,
                'error': isQuantityOutOfRange
              }">
                <i class="fas" :class="quantityStatusIcon"></i>
                <span>{{ quantityStatusText }}</span>
              </div>
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
            <div class="price-type-active-indicator" v-if="isPreventaEspecialActive || isPreventaEstandarActive">
              <i class="fas fa-check-circle"></i>
              <span>{{ isPreventaEspecialActive ? 'Precio de Preventa Especial aplicado' : 'Precio de Preventa Estándar plicado' }}</span>
            </div>
          </div>

          <!-- Sección de Compra -->
          <div class="purchase-section">
            <div class="action-buttons">
              <button class="add-to-cart" @click="addToCart" :disabled="addingToCart"
                :class="{ 'loading': addingToCart }" aria-label="Agregar al carrito">
                <i class="fas" :class="addingToCart ? 'fa-spinner fa-spin' : 'fa-shopping-cart'"></i>
                <span>{{ addingToCart ? 'Agregando...' : 'Agregar al carrito' }}</span>
              </button>
              <button class="add-to-wishlist" :class="{ 'in-wishlist': isInWishlist }" @click="toggleWishlist"
                aria-label="Agregar a favoritos">
                <i class="fas" :class="isInWishlist ? 'fa-heart' : 'fa-heart'"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Calificaciones -->
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

    <!-- Productos Similares with updated styles -->
    <div class="similar-products-section" v-if="productosSimilares.length > 0">
      <h2 class="section-title">
        Productos <span class="text-accent">Similares</span>
      </h2>

      <!-- Cuadrícula de Productos con estilos actualizados -->
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
                <span v-if="hasPreventaPricesSimilar(product)" class="badge badge-preventa">
                  <i class="fas fa-tag"></i> PREVENTA
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

          <!-- Información del Producto -->
          <div class="product-info">
            <div class="category">
              <i class="fas fa-tag"></i> {{ product.categoria?.nombre || 'General' }}
            </div>
            <h3 class="product-name">{{ product.nombre }}</h3>
            <!-- Descripción truncada -->
            <p v-if="product.descripcion" class="product-description">
              {{ truncateDescription(product.descripcion, 60) }}
            </p>

            <!-- Contenedor de precios mejorado -->
            <div class="prices-container">
              <div class="prices-header">
                <span class="prices-title">Precios de Preventa</span>
                <button class="toggle-prices-btn" @click.stop="togglePriceDetails(product.id)">
                  <i class="fas" :class="isPriceExpanded(product.id) ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
                </button>
              </div>

              <div class="price-details" :class="{ 'expanded': isPriceExpanded(product.id) }">
                <!-- Precio Estándar (Preventa Estándar) -->
                <div class="price-card">
                  <div class="price-card-header" v-if="product.precio_preventa">
                    <span class="price-type">Preventa Estándar</span>
                    <span class="price-value">{{ formatPrice(product.precio_preventa) }}</span>
                  </div>
                  <div class="price-card-body">
                    <div class="quantity-range">
                      <div class="quantity-item">
                        <span class="quantity-label">Mínimo:</span>
                        <span class="quantity-value">{{ product.cantidad_minima_preventa || 1 }} unidades</span>
                      </div>
                      <div class="quantity-item">
                        <span class="quantity-label">Máximo:</span>
                        <span class="quantity-value">{{ product.cantidad_maxima_preventa || 'Sin límite' }} unidades</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Precio Preventa Especial -->
                <div class="price-card special" v-if="product.precio">
                  <div class="price-card-header">
                    <span class="price-type">Preventa Especial</span>
                    <span class="price-value">{{ formatPrice(product.precio) }}</span>
                  </div>
                  <div class="price-card-body">
                    <div class="quantity-range">
                      <div class="quantity-item">
                        <span class="quantity-label">Mínimo:</span>
                        <span class="quantity-value">{{ product.cantidad_minima || 1 }} unidades</span>
                      </div>
                      <div class="quantity-item">
                        <span class="quantity-label">Máximo:</span>
                        <span class="quantity-value">{{ product.cantidad_maxima || 'Sin límite' }} unidades</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Vista resumida de precios (siempre visible) -->
              <div class="prices-summary">
                <div class="summary-item">
                  <span class="summary-label">Estándar:</span>
                  <div class="summary-content">
                    <span class="summary-price">{{ formatPrice(product.precio_preventa) }}</span>
          <!--           <span class="summary-quantity">{{ product.cantidad_minima || 1 }}+ uds</span> -->
                  </div>
                </div>
                <div class="summary-item special" v-if="product.precio">
                  <span class="summary-label">Especial:</span>
                  <div class="summary-content">
                    <span class="summary-price">{{ formatPrice(product.precio) }}</span>
<!--                     <span class="summary-quantity">{{ product.cantidad_minima_preventa || product.cantidad_minima || 1
                      }}+ uds</span> -->
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Barra Fija de Agregar al Carrito para Móvil -->
    <div class="mobile-sticky-bar">
      <div class="mobile-price">
        <div class="price-container">
          <span class="current-price">{{ formatPrice(selectedPrice) }}</span>
          <span class="original-price" v-if="originalPrice > selectedPrice">{{ formatPrice(originalPrice) }}</span>
        </div>
        <div class="price-type-label">
          {{ getPriceTypeName }}
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
const expandedPriceDetails = ref([]);

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
// Variables para la paginación de miniaturas
const thumbnailsPerPage = ref(5); // Número de miniaturas por página
const currentThumbnailPage = ref(0);
const thumbnailWidth = ref(80); // Ancho de cada miniatura en px
const thumbnailGap = ref(8); // Espacio entre miniaturas en px
const thumbnailContainer = ref(0); //
// Variables para el cursor de lupa
const showMagnifier = ref(false);
const magnifierPosition = ref({ x: 0, y: 0 });

// Propiedades computadas para precios y cantidades
const regularPrice = computed(() => {
  if (selectedModelData.value) {
    return selectedModelData.value.precio;
  }
  return dato.value.precio || 0;
});

const preventaEspecialPrice = computed(() => {
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

const cantidadMinimaPreventaEspecial = computed(() => {
  if (selectedModelData.value && selectedModelData.value.cantidad_minima_preventa) {
    return selectedModelData.value.cantidad_minima_preventa;
  }
  return dato.value.cantidad_minima_preventa || 0;
});

const cantidadMaximaPreventaEspecial = computed(() => {
  if (selectedModelData.value && selectedModelData.value.cantidad_maxima_preventa) {
    return selectedModelData.value.cantidad_maxima_preventa;
  }
  return dato.value.cantidad_maxima_preventa || 0;
});

const hasPreventaEspecialPrice = computed(() => {
  return preventaEspecialPrice.value > 0 && cantidadMinimaPreventaEspecial.value > 0 && cantidadMaximaPreventaEspecial.value > 0;
});

// Determinar si hay múltiples tipos de precio disponibles
const hasMultiplePriceTypes = computed(() => {
  return hasPreventaEspecialPrice.value && regularPrice.value > 0;
});

// Determinar si el precio de preventa especial está activo según la cantidad
const isPreventaEspecialActive = computed(() => {
  if (hasPreventaEspecialPrice.value) {
    return quantity.value >= cantidadMinimaPreventaEspecial.value && quantity.value <= cantidadMaximaPreventaEspecial.value;
  }
  return false;
});

// Determinar si el precio de preventa estándar está activo
const isPreventaEstandarActive = computed(() => {
  return !isPreventaEspecialActive.value && quantity.value >= cantidadMinima.value && quantity.value <= cantidadMaxima.value;
});

// Precio seleccionado (preventa especial, preventa estándar o regular) basado en la cantidad
const selectedPrice = computed(() => {
  return isPreventaEspecialActive.value ? preventaEspecialPrice.value : regularPrice.value;
});

// Límites de cantidad basados en el tipo de precio activo
const minQuantity = computed(() => {
  return isPreventaEspecialActive.value ? cantidadMinimaPreventaEspecial.value : cantidadMinima.value;
});

const maxQuantity = computed(() => {
  return isPreventaEspecialActive.value ? cantidadMaximaPreventaEspecial.value : cantidadMaxima.value;
});

// Verificar si se puede cambiar a precio de preventa estándar
const canSwitchToPreventaEstandar = computed(() => {
  return regularPrice.value > 0 && cantidadMinima.value > 0 && cantidadMaxima.value > 0;
});

// Verificar si se puede cambiar a precio de preventa especial
const canSwitchToPreventaEspecial = computed(() => {
  return hasPreventaEspecialPrice.value;
});

// Obtener el nombre del tipo de precio actual
const getPriceTypeName = computed(() => {
  if (isPreventaEspecialActive.value) return 'Preventa Estándar';
  if (isPreventaEstandarActive.value) return 'Preventa Especial';
  return 'Precio Regular';
});

// Obtener el icono para el badge de precio
const getPriceBadgeIcon = computed(() => {
  if (isPreventaEspecialActive.value) return 'fa-bolt';
  if (isPreventaEstandarActive.value) return 'fa-tag';
  return 'fa-dollar-sign';
});

// Verificar si la cantidad está cerca del límite del rango
const isNearRangeLimit = computed(() => {
  const min = minQuantity.value;
  const max = maxQuantity.value;
  return (quantity.value - min <= 2) || (max - quantity.value <= 2);
});

// Verificar si la cantidad está fuera del rango
const isQuantityOutOfRange = computed(() => {
  const min = minQuantity.value;
  const max = maxQuantity.value;
  return quantity.value < min || quantity.value > max;
});

// Obtener el icono para el estado de la cantidad
const quantityStatusIcon = computed(() => {
  if (isQuantityOutOfRange.value) {
    return 'fa-exclamation-circle';
  } else if (isNearRangeLimit.value) {
    return 'fa-exclamation-triangle';
  } else {
    return 'fa-check-circle';
  }
});

// Obtener el texto para el estado de la cantidad
const quantityStatusText = computed(() => {
  const min = minQuantity.value;
  const max = maxQuantity.value;

  if (quantity.value < min) {
    return `Por debajo del mínimo (${min})`;
  } else if (quantity.value > max) {
    return `Por encima del máximo (${max})`;
  } else if (isNearRangeLimit.value) {
    if (quantity.value - min <= 2) {
      return `Cerca del mínimo (${min})`;
    } else if (max - quantity.value <= 2) {
      return `Cerca del máximo (${max})`;
    }
  }
  return `Dentro del rango (${min}-${max})`;
});

// Obtener la etiqueta correspondiente a una calificación
const getRatingLabel = (rating) => {
  return ratingLabels[rating] || '';
};

// Aplicar precio de preventa estándar manualmente
const applyPreventaEstandar = () => {
  if (canSwitchToPreventaEstandar.value) {
    // Establecer la cantidad al mínimo de preventa estándar
    quantity.value = cantidadMinima.value;
    validateQuantity(); // Validar la cantidad para asegurar que esté en el rango correcto
    showToast('Precio de preventa estándar aplicado', 'success');
  }
};

// Aplicar precio de preventa especial manualmente
const applyPreventaEspecial = () => {
  if (hasPreventaEspecialPrice.value) {
    // Establecer la cantidad al mínimo de preventa especial
    quantity.value = cantidadMinimaPreventaEspecial.value;
    validateQuantity(); // Validar la cantidad para asegurar que esté en el rango correcto
    showToast('Precio de preventa especial aplicado', 'success');
  }
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

// Enviar la calificación - CORREGIDO PARA QUE GUARDE CORRECTAMENTE
const submitRating = async () => {
  if (isRatingSubmitting.value || !userRating.value || !dato.value.id) return;

  isRatingSubmitting.value = true;

  try {
    // Asegurarse de que el ID del producto sea un número
    const productoId = parseInt(dato.value.id);

    // Llamar al servicio para guardar la calificación
    await storeRating({
      producto_id: productoId,
      rating: userRating.value
    });

    // Recargar las estadísticas de calificación
    await loadProductRatingStats(productoId);

    // Actualizar las calificaciones de usuario
    await indexRatingUser();

    // Mostrar notificación de éxito
    showToast('Calificación guardada correctamente', 'success');
  } catch (error) {
    console.error('Error al enviar calificación:', error);
    showToast('Error al guardar la calificación', 'error');
  } finally {
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

  // Verificar si estamos en modo preventa especial y la cantidad excede el máximo
  if (hasPreventaEspecialPrice.value && isPreventaEspecialActive.value && numQuantity > cantidadMaximaPreventaEspecial.value) {
    // Mostrar alerta para cambiar al precio de preventa estándar
    if (confirm('Has superado la cantidad máxima para precio de preventa especial. ¿Deseas cambiar al precio de preventa estándar?')) {
      // Cambiar al precio de preventa estándar
      applyPreventaEstandar();
      return;
    } else {
      // Mantener en el máximo de preventa especial
      quantity.value = cantidadMaximaPreventaEspecial.value;
      return;
    }
  }

  // Verificar si la cantidad está en el rango de preventa especial
  if (hasPreventaEspecialPrice.value && numQuantity >= cantidadMinimaPreventaEspecial.value && numQuantity <= cantidadMaximaPreventaEspecial.value) {
    // Estamos en rango de preventa especial
    quantity.value = numQuantity;
  }
  // Si no está en rango de preventa especial, verificar rango de preventa estándar
  else if (numQuantity >= cantidadMinima.value && numQuantity <= cantidadMaxima.value) {
    // Estamos en rango de preventa estándar
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
    const newQuantity = quantity.value + 1;

    // Verificar si estamos en modo preventa especial y vamos a exceder el máximo
    if (hasPreventaEspecialPrice.value && isPreventaEspecialActive.value && newQuantity > cantidadMaximaPreventaEspecial.value) {
      // Mostrar alerta para cambiar al precio de preventa estándar
      if (confirm('Al aumentar la cantidad superarás el máximo para precio de preventa especial. ¿Deseas cambiar al precio de preventa estándar?')) {
        // Cambiar al precio de preventa estándar y establecer la nueva cantidad
        quantity.value = newQuantity;
        validateQuantity();
      }
      // Si no acepta, se mantiene en el máximo de preventa especial
      return;
    }

    quantity.value = newQuantity;
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

// Mejorar el manejo del zoom de imagen con cursor de lupa
const handleImageZoom = (event) => {
  if (!mainImage.value) return;

  // Mostrar el cursor de lupa
  showMagnifier.value = true;

  // Calcular la posición del cursor
  const { left, top, width, height } = mainImage.value.getBoundingClientRect();
  const x = event.clientX - left;
  const y = event.clientY - top;

  // Actualizar la posición del cursor de lupa
  magnifierPosition.value = { x, y };

  // Aplicar el zoom
  const xPercent = x / width;
  const yPercent = y / height;
  mainImage.value.style.transformOrigin = `${xPercent * 100}% ${yPercent * 100}%`;
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

// Resetear zoom y ocultar cursor de lupa
const resetZoom = () => {
  if (mainImage.value) {
    mainImage.value.style.transform = 'scale(1)';
  }
  showMagnifier.value = false;
};

// Modificar la función selectThumbnail para asegurar que la miniatura seleccionada esté visible
const selectThumbnail = (index) => {
  const imgElement = mainImage.value;
  if (imgElement) {
    imgElement.classList.add('changing');
    setTimeout(() => {
      selectedImage.value = index;
      ensureSelectedThumbnailVisible(); // Asegurar que la miniatura seleccionada esté visible
      setTimeout(() => {
        imgElement.classList.remove('changing');
      }, 300);
    }, 150);
  } else {
    selectedImage.value = index;
    ensureSelectedThumbnailVisible(); // Asegurar que la miniatura seleccionada esté visible
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
      precio_preventa: preventaEspecialPrice.value,
      es_preventa: isPreventaEspecialActive.value,
      modeloId: selectedModel.value || null,
      nombreModelo: selectedModelData.value?.nombre || '',
      cantidad: quantity.value,
      cantidad_minima: cantidadMinima.value,
      cantidad_maxima: cantidadMaxima.value,
      cantidad_minima_preventa: cantidadMinimaPreventaEspecial.value,
      cantidad_maxima_preventa: cantidadMaximaPreventaEspecial.value,
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

// Verificar si un producto tiene precios de preventa
const hasPreventaPricesSimilar = (product) => {
  return product.precio_preventa ||
    product.precio_preventa_mayorista ||
    product.precio_preventa_distribuidor;
};

// Funciones para manejar los detalles de precios
const togglePriceDetails = (productId) => {
  const index = expandedPriceDetails.value.indexOf(productId);
  if (index > -1) {
    expandedPriceDetails.value.splice(index, 1);
  } else {
    expandedPriceDetails.value.push(productId);
  }
};

const isPriceExpanded = (productId) => {
  return expandedPriceDetails.value.includes(productId);
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
    if (hasPreventaEspecialPrice.value) {
      quantity.value = cantidadMinimaPreventaEspecial.value;
    } else {
      quantity.value = cantidadMinima.value;
    }

    // Validar la cantidad inicial
    validateQuantity();

    // Recargar calificaciones
    indexRatingUser();

    // Animar elementos después de cargar
    nextTick(() => {
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
    if (hasPreventaEspecialPrice.value) {
      quantity.value = cantidadMinimaPreventaEspecial.value;
    } else {
      quantity.value = cantidadMinima.value;
    }

    // Validar la cantidad inicial
    validateQuantity();

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

// Modificar onMounted para inicializar la paginación
onMounted(() => {
  verProductoConRatings();
  checkThumbnailScroll();
  window.addEventListener('resize', checkThumbnailScroll);

  setTimeout(() => {
    document.querySelector('.product-detail')?.classList.add('loaded');
  }, 100);

  if (window.innerWidth <= 768) {
    expandedSection.value = 'features';
  }

  if (route.params.idProducto) {
    loadProductRatingStats(route.params.idProducto);
  }

  setTimeout(() => {
    if (!hasScrolled.value) {
      showSwipeIndicator.value = false;
    }
  }, 5000);
});

// Actualizar la función checkThumbnailScroll para manejar la paginación
const checkThumbnailScroll = () => {
  if (!thumbnailContainer.value) return;

  // Calcular el número de miniaturas visibles basado en el ancho del contenedor
  const containerWidth = thumbnailContainer.value.clientWidth;
  thumbnailsPerPage.value = Math.floor(containerWidth / (thumbnailWidth.value + thumbnailGap.value));

  // Asegurar que la miniatura seleccionada esté visible
  ensureSelectedThumbnailVisible();
};

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

// Función para truncar descripción
const truncateDescription = (text, maxLength) => {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

// Calcular el estilo del wrapper de miniaturas para la paginación
const thumbnailWrapperStyle = computed(() => {
  const translateX = -currentThumbnailPage.value * (thumbnailsPerPage.value * (thumbnailWidth.value + thumbnailGap.value));
  return {
    transform: `translateX(${translateX}px)`,
    transition: 'transform 0.3s ease',
    display: 'flex',
    gap: `${thumbnailGap.value}px`
  };
});
// Calcular el número total de páginas de miniaturas
const totalThumbnailPages = computed(() => {
  if (!allImages.value.length) return 1;
  return Math.ceil(allImages.value.length / thumbnailsPerPage.value);
});
// Calcular la página máxima de miniaturas
const maxThumbnailPage = computed(() => {
  return totalThumbnailPages.value - 1;
});

// Estilo para el cursor de lupa
const magnifierStyle = computed(() => {
  return {
    left: `${magnifierPosition.value.x}px`,
    top: `${magnifierPosition.value.y}px`
  };
});
// Ir a la página anterior de miniaturas
const prevThumbnailPage = () => {
  if (currentThumbnailPage.value > 0) {
    currentThumbnailPage.value--;
  }
};

// Ir a la página siguiente de miniaturas
const nextThumbnailPage = () => {
  if (currentThumbnailPage.value < maxThumbnailPage.value) {
    currentThumbnailPage.value++;
  }
};
// Ir a una página específica de miniaturas
const goToThumbnailPage = (page) => {
  if (page >= 0 && page <= maxThumbnailPage.value) {
    currentThumbnailPage.value = page;
  }
};

// Asegurarse de que la miniatura seleccionada esté visible
const ensureSelectedThumbnailVisible = () => {
  const thumbnailPage = Math.floor(selectedImage.value / thumbnailsPerPage.value);
  if (thumbnailPage !== currentThumbnailPage.value) {
    currentThumbnailPage.value = thumbnailPage;
  }
};
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css');

/* Estilos Base */
.product-detail {
  padding: 1rem;
  min-height: 100vh;
  opacity: 0;
  animation: fadeIn 0.6s cubic-bezier(0.23, 1, 0.32, 1) forwards;
  animation-delay: 0.2s;
  padding-bottom: 80px;
  /* Espacio para la barra fija móvil */
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

/* Sección de Precios Mejorada */
.price-section {
  margin-bottom: 1.5rem;
  background: #f8f9fa;
  border-radius: 0.75rem;
  padding: 1.25rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.price-section:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.price-type-indicator {
  margin-bottom: 0.75rem;
}

.price-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.35rem 0.75rem;
  border-radius: 2rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: white;
}

.price-badge.preventa-especial {
  background: #3498db;
}

.price-badge.preventa-estandar {
  background: #2ecc71;
}

.price-badge.regular {
  background: #7f8c8d;
}

.main-price-display {
  margin-bottom: 1rem;
}

.price-value-display {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.price-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #333;
}

.original-price {
  color: #999;
  text-decoration: line-through;
  font-size: 0.9rem;
}

.discount-percentage {
  background: #ff4444;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 600;
}

.quantity-range {
  font-size: 0.8rem;
  color: #666;
}

.range-label {
  font-weight: 600;
}

/* Selector de Tipo de Precio Mejorado */
.price-type-selector {
  margin-bottom: 1rem;
}

.price-tabs {
  display: flex;
  border: 1px solid #e0e0e0;
  border-radius: 0.5rem;
  overflow: hidden;
}

.price-tab {
  flex: 1;
  padding: 0.75rem;
  background: #f8f9fa;
  border: none;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.price-tab.active {
  background: white;
  box-shadow: inset 0 -2px 0 #007bff;
  color: #007bff;
}

.price-tab:first-child.active {
  color: #2ecc71;
  box-shadow: inset 0 -2px 0 #2ecc71;
}

.price-tab:hover:not(.active):not(:disabled) {
  background: #e9ecef;
}

.price-tab:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Comparación de Precios */
.price-comparison {
  margin-top: 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 0.5rem;
  overflow: hidden;
}

.comparison-header {
  padding: 0.75rem;
  background: #f5f5f5;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #333;
  border-bottom: 1px solid #e0e0e0;
}

.comparison-body {
  padding: 0.75rem;
}

.comparison-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.comparison-item {
  background: #f9f9f9;
  padding: 0.75rem;
  border-radius: 0.5rem;
  text-align: center;
}

.comparison-label {
  font-weight: 600;
  margin-bottom: 0.25rem;
  color: #666;
  font-size: 0.8rem;
}

.comparison-value {
  font-size: 1rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
  color: #333;
}

.comparison-range {
  font-size: 0.75rem;
  color: #666;
}

.savings-info {
  background: #e8f5e9;
  padding: 0.75rem;
  border-radius: 0.5rem;
  color: #2e7d32;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
}

.savings-info span {
  font-weight: 700;
}

/* Cabecera Móvil Mejorada */
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

.mobile-share-button-header {
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

/* Sección de Imágenes */
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

/* Navegación de Imágenes */
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

/* Paginación de Imágenes para Móvil */
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
  background: rgba(170, 184, 214, 0.6);
  cursor: pointer;
  transition: all 0.3s ease;
}

.pagination-dot.active {
  background: rgb(69, 67, 211);
  transform: scale(1.4);
}

/* Miniaturas */
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
  scrollbar-width: none;
  /* Firefox */
}

.thumbnail-container::-webkit-scrollbar {
  display: none;
  /* Chrome, Safari, Edge */
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

.thumbnail:hover img {
  transform: scale(1.1);
}

.thumbnail.active {
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.2);
}

/* Secciones de Acordeón para Móvil */
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

/* Sección de Características */
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

/* Botón "Ver más" para Características */
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

/* Sección de Colores */
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
}

.selected-color-info {
  margin-top: 0.5rem;
  font-size: 0.8rem;
  color: #666;
}

/* Sección de Modelo */
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
  padding: 0.75rem;
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

.model-card:hover {
  border-color: #007bff;
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(0, 123, 255, 0.15);
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

.model-price {
  font-size: 0.75rem;
  color: #666;
}

.model-stock {
  font-size: 0.65rem;
  color: #f57c00;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin-top: 0.25rem;
}

/* Sección de cantidad */
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

.quantity-status {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 1rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  background-color: #e8f5e9;
  color: #388e3c;
}

.quantity-status.warning {
  background-color: #fff8e1;
  color: #ff8f00;
}

.quantity-status.error {
  background-color: #ffebee;
  color: #d32f2f;
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

.quantity-input {
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

.price-type-active-indicator {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin-top: 0.4rem;
  color: #2ecc71;
  font-size: 0.8rem;
  font-weight: 500;
  animation: fadeIn 0.3s ease;
}

.price-type-active-indicator i {
  font-size: 0.9rem;
}

/* Sección de Compra */
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

.add-to-cart:hover:not(:disabled) {
  background-color: #0069d9;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 123, 255, 0.4);
}

.add-to-cart:disabled {
  opacity: 0.7;
  cursor: not-allowed;
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

/* Sección de Calificaciones */
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

.text-accent {
  color: #3498db;
  position: relative;
  display: inline-block;
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

/* Productos Similares - Grid Mejorado */
.similar-products-section {
  max-width: 1440px;
  margin: 2.5rem auto;
  padding: 1.5rem 1rem;
  border-radius: 1rem;
  background: #ffffff;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.similar-products-section .section-title {
  font-size: clamp(1.5rem, 3vw, 2rem);
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 1.5rem;
  text-align: center;
  position: relative;
}

.similar-products-section .section-title::after {
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

.text-accent {
  color: #3498db;
  position: relative;
  display: inline-block;
}

/* Products Grid - Mejorado para responsividad */
.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 0.75rem;
  margin: 0 0.5rem 2rem;
}

/* Product Card */
.product-card {
  background: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
  opacity: 0;
  transform: translateY(20px);
  animation: fadeInUp 0.6s forwards;
  animation-delay: calc(var(--index, 0) * 0.1s);
  height: 100%;
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(0, 0, 0, 0.05);
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
  background: #f8f9fa;
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
  width: 28px;
  height: 28px;
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
  padding: 0.2rem 0.4rem;
  font-size: 0.6rem;
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

.badge-preventa {
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

/* Product Actions - Mejorado para móviles */
.product-actions-bottom {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: 0.4rem;
  padding: 0.4rem;
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
  width: 26px;
  height: 26px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(4px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  color: #2d3748;
  font-size: 0.7rem;
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
  padding: 0.6rem;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  background-color: white;
}

.category {
  font-size: 0.65rem;
  color: #718096;
  margin-bottom: 0.4rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
}

.product-name {
  font-size: 0.8rem;
  font-weight: 700;
  color: #333;
  line-height: 1.4;
  transition: color 0.3s ease;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  height: 2.2rem;
  margin-bottom: 0.4rem;
}

.product-card:hover .product-name {
  color: #3498db;
}

/* Descripción del producto */
.product-description {
  font-size: 0.7rem;
  color: #718096;
  line-height: 1.4;
  margin-bottom: 0.4rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* NUEVO DISEÑO DE PRECIOS - Optimizado para móviles */
.prices-container {
  margin-top: 0.4rem;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  background-color: #f8fafc;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.prices-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.4rem;
  background: linear-gradient(to right, #f8fafc, #edf2f7);
  border-bottom: 1px solid #e2e8f0;
}

.prices-title {
  font-size: 0.7rem;
  font-weight: 700;
  color: #4a5568;
}

.toggle-prices-btn {
  background: none;
  border: none;
  color: #718096;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.toggle-prices-btn:hover {
  background-color: #e2e8f0;
  color: #4a5568;
}

/* Detalles de precios expandibles */
.price-details {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease, opacity 0.3s ease;
  opacity: 0;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  padding: 0 0.4rem;
}

.price-details.expanded {
  max-height: 500px;
  opacity: 1;
  padding: 0.4rem;
}

/* Tarjetas de precio */
.price-card {
  border-radius: 6px;
  overflow: hidden;
  background-color: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid #edf2f7;
}

.price-card.special {
  border-left: 3px solid #ed8936;
}

.price-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.4rem;
  background-color: #f7fafc;
  border-bottom: 1px solid #edf2f7;
}

.price-type {
  font-size: 0.65rem;
  font-weight: 700;
  color: #4a5568;
}

.price-value {
  font-size: 0.75rem;
  font-weight: 700;
  color: #2d3748;
}

.price-card.special .price-value {
  color: #dd6b20;
}

.price-card-body {
  padding: 0.4rem;
}

.quantity-range {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.quantity-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.6rem;
  color: #718096;
}

.quantity-label {
  font-weight: 600;
}

.quantity-value {
  color: #4a5568;
}

/* Vista resumida de precios */
.prices-summary {
  padding: 0.4rem;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  border-top: 1px dashed #e2e8f0;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.65rem;
}

.summary-item.special {
  font-weight: 700;
}

.summary-label {
  color: #4a5568;
  font-weight: 600;
}

.summary-content {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.summary-price {
  font-weight: 700;
  color: #2d3748;
}

.summary-item.special .summary-price {
  color: #dd6b20;
}

.summary-quantity {
  font-size: 0.55rem;
  color: #718096;
  background-color: #edf2f7;
  padding: 0.1rem 0.3rem;
  border-radius: 4px;
}

/* Media Queries Mejorados */
@media (min-width: 400px) {
  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 0.75rem;
  }

  .product-name {
    font-size: 0.85rem;
  }

  .action-button {
    width: 28px;
    height: 28px;
  }
}

@media (min-width: 576px) {
  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
    gap: 1rem;
    margin: 0 0 2rem;
  }

  .product-info {
    padding: 0.75rem;
  }

  .product-name {
    font-size: 0.9rem;
    height: 2.5rem;
  }

  .product-description {
    font-size: 0.75rem;
  }

  .action-button {
    width: 30px;
    height: 30px;
    font-size: 0.75rem;
  }

  .badge {
    padding: 0.25rem 0.5rem;
    font-size: 0.65rem;
  }

  /* Mostrar botones de navegación y acciones en tablets */
  .product-actions-bottom {
    opacity: 0.9;
  }

  .nav-button {
    opacity: 0.7;
  }
}

@media (min-width: 768px) {
  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 1.25rem;
  }

  .product-info {
    padding: 0.85rem;
  }

  .product-name {
    font-size: 0.95rem;
    height: 2.6rem;
    margin-bottom: 0.5rem;
  }

  .product-description {
    font-size: 0.8rem;
    margin-bottom: 0.75rem;
  }

  .prices-title {
    font-size: 0.8rem;
  }

  .price-type {
    font-size: 0.75rem;
  }

  .price-value {
    font-size: 0.85rem;
  }

  .quantity-item {
    font-size: 0.7rem;
  }

  .summary-item {
    font-size: 0.75rem;
  }

  .summary-quantity {
    font-size: 0.65rem;
  }

  .action-button {
    width: 32px;
    height: 32px;
    font-size: 0.8rem;
  }

  .nav-button {
    width: 32px;
    height: 32px;
  }

  .badge {
    padding: 0.3rem 0.6rem;
    font-size: 0.7rem;
  }
}

@media (min-width: 992px) {
  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1.5rem;
  }

  .product-name {
    font-size: 1rem;
    height: 2.8rem;
  }

  .product-info {
    padding: 1rem;
  }

  .price-value {
    font-size: 0.9rem;
  }

  /* Restaurar comportamiento hover en desktop */
  .product-actions-bottom {
    opacity: 0;
  }

  .nav-button {
    opacity: 0;
  }
}

@media (min-width: 1200px) {
  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 1.75rem;
  }

  .product-info {
    padding: 1.25rem;
  }

  .product-name {
    font-size: 1.1rem;
    height: 3rem;
  }

  .action-button {
    width: 35px;
    height: 35px;
    font-size: 0.9rem;
  }

  .nav-button {
    width: 35px;
    height: 35px;
  }

  .price-value {
    font-size: 1rem;
  }

  .summary-price {
    font-size: 0.9rem;
  }
}

/* Touch Device Optimizations - Mejorado */
@media (hover: none) {
  .product-card:hover {
    transform: none;
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.05);
  }

  .product-card:hover .product-image img {
    transform: none;
  }

  .product-actions-bottom {
    opacity: 1;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0.3) 50%, transparent 100%);
    padding-bottom: 0.6rem;
    /* Aumentado para facilitar el toque */
  }

  .nav-button {
    opacity: 0.8;
    width: 32px;
    /* Aumentado para facilitar el toque */
    height: 32px;
    /* Aumentado para facilitar el toque */
  }

  .action-button {
    width: 32px;
    /* Aumentado para facilitar el toque */
    height: 32px;
    /* Aumentado para facilitar el toque */
  }

  .action-button:active {
    transform: scale(0.95);
  }

  .product-card:active {
    transform: scale(0.98);
  }

  /* Asegurar que los botones de toggle sean fáciles de tocar */
  .toggle-prices-btn {
    width: 28px;
    height: 28px;
  }
}

/* Accessibility Improvements */
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
}

/* Estilos para la paginación de miniaturas */
.thumbnail-list {
  position: relative;
  display: flex;
  align-items: center;
  margin: 1rem 0;
}

.thumbnail-container {
  flex: 1;
  overflow: hidden;
  position: relative;
  height: 90px;
  /* Altura para acomodar miniaturas y paginación */
}

.thumbnail-wrapper {
  position: absolute;
  left: 0;
  top: 0;
  display: flex;
  height: 80px;
}

.thumbnail {
  flex: 0 0 80px;
  height: 80px;
  border-radius: 0.75rem;
  border: 2px solid transparent;
  transition: all 0.2s ease;
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

.thumbnail:hover img {
  transform: scale(1.1);
}

.thumbnail.active {
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.2);
}

.thumbnail-nav {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: white;
  border: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 5;
  margin: 0 0.5rem;
  flex-shrink: 0;
}

.thumbnail-nav:hover:not(:disabled) {
  background: #f8f9fa;
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.thumbnail-nav:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.thumbnail-pagination {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  display: flex;
  justify-content: center;
  gap: 6px;
  padding: 4px 0;
}

.thumbnail-page-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #e0e0e0;
  cursor: pointer;
  transition: all 0.3s ease;
}

.thumbnail-page-dot.active {
  background: #007bff;
  transform: scale(1.2);
}

/* Estilos para el cursor de lupa */
.magnifier-cursor {
  position: absolute;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  z-index: 10;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  transform: translate(-50%, -50%);
  color: #333;
  font-size: 14px;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .thumbnail-nav {
    width: 24px;
    height: 24px;
    font-size: 12px;
  }

  .thumbnail {
    flex: 0 0 60px;
    height: 60px;
  }

  .thumbnail-container {
    height: 70px;
  }

  .thumbnail-wrapper {
    height: 60px;
  }
}

/* Barra Fija para Móvil */
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

.price-container {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.mobile-price .current-price {
  font-size: 1rem;
  font-weight: 700;
}

.mobile-price .original-price {
  font-size: 0.8rem;
  color: #999;
  text-decoration: line-through;
}

.price-type-label {
  font-size: 0.7rem;
  color: #666;
  margin-top: 0.2rem;
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

/* Botón de Compartir para Móvil */
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

/* Indicador de Deslizamiento */
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

  0%,
  100% {
    opacity: 0;
  }

  20%,
  80% {
    opacity: 1;
  }
}

/* Notificaciones Toast */
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

/* Diseño Responsivo */
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

  .mobile-header {
    display: block;
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

  /* Mejorar objetivos táctiles para móvil */
  .quantity-btn {
    width: 36px;
    height: 36px;
  }

  .quantity-input {
    width: 45px;
    height: 36px;
    font-size: 16px;
    /* Evitar zoom en iOS */
  }
}

@media (max-width: 480px) {
  .product-title {
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

  /* Ajustar barra fija para pantallas más pequeñas */
  .mobile-sticky-bar {
    padding: 0.4rem 0.8rem;
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
}

/* Animaciones */
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
}
</style>