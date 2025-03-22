<template>
  <div class="checkout-container">
    <!-- Sticky Mobile Header -->
    <header class="checkout-header" :class="{ 'header-scrolled': isScrolled }">
      <div class="header-content">
        <div class="header-left">
          <button @click="goBack" class="back-button" aria-label="Volver atrás">
            <i class="fas fa-arrow-left"></i>
          </button>
          <div class="logo-container" @click="goToHome" role="button" tabindex="0">
            <img src="../../public/logo/Logo Neofetch PNG.png" alt="Logo de la empresa" class="company-logo" />
          </div>
        </div>
        <h1>Finalizar Pedido <span class="items-badge">{{ totalItems }}</span></h1>
        <div class="actions-container">
          <button @click="emptyCart" class="empty-cart-btn" :disabled="items.length === 0" aria-label="Vaciar carrito">
            <i class="fas fa-trash-alt"></i> <span class="btn-text">Vaciar</span>
          </button>
          <div class="lock-icon" aria-hidden="true">
            <i class="fas fa-lock"></i>
          </div>
        </div>
      </div>

      <!-- Improved Mobile Progress Indicator -->
      <div class="mobile-progress">
        <div class="steps-indicator">
          <div v-for="(step, index) in checkoutSteps" :key="index" :class="['step-indicator', {
            'active': activeStep === index,
            'completed': activeStep > index,
            'clickable': index <= activeStep || (index === activeStep + 1 && checkoutSteps[activeStep].completed)
          }]" @click="handleStepClick(index)" :aria-label="`Paso ${index + 1}: ${step.title}`" :tabindex="index <= activeStep || (index === activeStep + 1 && checkoutSteps[activeStep].completed) ? 0 : -1">
            <div class="step-number-container">
              <span class="step-number">{{ index + 1 }}</span>
              <i v-if="activeStep > index" class="fas fa-check check-icon" aria-hidden="true"></i>
            </div>
            <span class="step-label">{{ step.shortTitle || step.title }}</span>
            <div v-if="index <= activeStep || (index === activeStep + 1 && checkoutSteps[activeStep].completed)"
              class="step-tooltip">
              Ir al paso {{ index + 1 }}
            </div>
          </div>
        </div>
        <div class="progress-bar" role="progressbar" :aria-valuenow="progressPercentage" aria-valuemin="0" aria-valuemax="100">
          <div class="progress" :style="{ width: progressPercentage + '%' }"></div>
        </div>
      </div>
    </header>

    <div class="checkout-content" :class="{ 'summary-open': showSummary }">
      <div class="main-content">
        <div class="checkout-steps">
          <!-- Step 1: Delivery Information -->
          <div class="step" :class="{ 'active-step': activeStep === 0, 'completed-step': activeStep > 0 }" :aria-expanded="activeStep === 0 || (stepsVisible[0] && checkoutSteps[0].completed)">
            <div class="step-header" @click="toggleStepVisibility(0)">
              <div class="step-header-left">
                <div class="step-number-wrapper">
                  <span class="step-number">1</span>
                  <i v-if="activeStep > 0" class="fas fa-check check-icon" aria-hidden="true"></i>
                </div>
                <h2>Ubicación de Entrega</h2>
              </div>
              <div class="step-header-right">
                <button v-if="activeStep >= 0 && checkoutSteps[0].completed" @click.stop="toggleEdit(0)"
                  class="edit-button" :aria-label="checkoutSteps[0].editing ? 'Guardar información' : 'Editar información'">
                  <i class="fas" :class="checkoutSteps[0].editing ? 'fa-save' : 'fa-edit'" aria-hidden="true"></i>
                  <span class="btn-text">{{ checkoutSteps[0].editing ? 'Guardar' : 'Editar' }}</span>
                </button>
                <i v-if="activeStep !== 0" class="fas"
                  :class="stepsVisible[0] ? 'fa-chevron-up' : 'fa-chevron-down'" aria-hidden="true"></i>
              </div>
            </div>
            <div class="step-content" v-show="activeStep === 0 || (stepsVisible[0] && checkoutSteps[0].completed)">
              <div v-if="!checkoutSteps[0].editing && isDeliveryInfoComplete" class="delivery-info-display">
                <div class="info-card">
                  <p v-if="deliveryInfo.nombre"><i class="fas fa-user" aria-hidden="true"></i> {{ deliveryInfo.nombre }} {{
                    deliveryInfo.apellido }}</p>
                  <p v-if="deliveryInfo.direccion"><i class="fas fa-map-marker-alt" aria-hidden="true"></i> {{ deliveryInfo.direccion }}
                  </p>
                  <p v-if="deliveryInfo.telefono"><i class="fas fa-phone" aria-hidden="true"></i> {{ deliveryInfo.telefono }}</p>
                  <p v-if="deliveryInfo.email"><i class="fas fa-envelope" aria-hidden="true"></i> {{ deliveryInfo.email }}</p>
                </div>
              </div>
              <div v-else class="form-grid">
                <div class="form-group">
                  <label for="nombre">Nombre *</label>
                  <div class="input-wrapper">
                    <i class="fas fa-user input-icon" aria-hidden="true"></i>
                    <input id="nombre" v-model="deliveryInfo.nombre" placeholder="Ingrese su nombre" required
                      class="responsive-input" :class="{ 'input-error': !deliveryInfo.nombre && formSubmitted }"
                      aria-describedby="nombre-error">
                    <span class="input-focus-indicator"></span>
                    <span v-if="!deliveryInfo.nombre && formSubmitted" class="error-message" id="nombre-error">
                      Este campo es obligatorio
                    </span>
                  </div>
                </div>
                <div class="form-group">
                  <label for="apellido">Apellido *</label>
                  <div class="input-wrapper">
                    <i class="fas fa-user input-icon" aria-hidden="true"></i>
                    <input id="apellido" v-model="deliveryInfo.apellido" placeholder="Ingrese su apellido" required
                      class="responsive-input" :class="{ 'input-error': !deliveryInfo.apellido && formSubmitted }"
                      aria-describedby="apellido-error">
                    <span class="input-focus-indicator"></span>
                    <span v-if="!deliveryInfo.apellido && formSubmitted" class="error-message" id="apellido-error">
                      Este campo es obligatorio
                    </span>
                  </div>
                </div>
                <div class="form-group full-width">
                  <label for="direccion">Dirección *</label>
                  <div class="input-wrapper">
                    <i class="fas fa-map-marker-alt input-icon" aria-hidden="true"></i>
                    <input id="direccion" v-model="deliveryInfo.direccion" placeholder="Ingrese su dirección completa"
                      required class="responsive-input"
                      :class="{ 'input-error': !deliveryInfo.direccion && formSubmitted }"
                      aria-describedby="direccion-error">
                    <span class="input-focus-indicator"></span>
                    <span v-if="!deliveryInfo.direccion && formSubmitted" class="error-message" id="direccion-error">
                      Este campo es obligatorio
                    </span>
                  </div>
                </div>
                <div class="form-group">
                  <label for="telefono">Teléfono *</label>
                  <div class="input-wrapper">
                    <i class="fas fa-phone input-icon" aria-hidden="true"></i>
                    <input id="telefono" v-model="deliveryInfo.telefono" placeholder="Ingrese su número" required
                      type="tel" pattern="[0-9]*" inputmode="numeric" class="responsive-input"
                      :class="{ 'input-error': !deliveryInfo.telefono && formSubmitted }"
                      aria-describedby="telefono-error">
                    <span class="input-focus-indicator"></span>
                    <span v-if="!deliveryInfo.telefono && formSubmitted" class="error-message" id="telefono-error">
                      Este campo es obligatorio
                    </span>
                  </div>
                </div>
                <div class="form-group">
                  <label for="email">Email *</label>
                  <div class="input-wrapper">
                    <i class="fas fa-envelope input-icon" aria-hidden="true"></i>
                    <input id="email" v-model="deliveryInfo.email" placeholder="Ingrese su email" required type="email"
                      class="responsive-input" :class="{ 'input-error': !deliveryInfo.email && formSubmitted }"
                      aria-describedby="email-error">
                    <span class="input-focus-indicator"></span>
                    <span v-if="!deliveryInfo.email && formSubmitted" class="error-message" id="email-error">
                      Este campo es obligatorio
                    </span>
                  </div>
                </div>
              </div>
              <div class="step-actions" v-if="activeStep === 0">
                <button @click="nextStep" class="next-button" aria-label="Continuar al siguiente paso">
                  Continuar <i class="fas fa-arrow-right" aria-hidden="true"></i>
                </button>
              </div>
            </div>
          </div>

          <!-- Step 2: Review Items -->
          <div class="step" :class="{ 'active-step': activeStep === 1, 'completed-step': activeStep > 1 }" :aria-expanded="activeStep === 1 || (stepsVisible[1] && checkoutSteps[1].completed)">
            <div class="step-header" @click="toggleStepVisibility(1)">
              <div class="step-header-left">
                <div class="step-number-wrapper">
                  <span class="step-number">2</span>
                  <i v-if="activeStep > 1" class="fas fa-check check-icon" aria-hidden="true"></i>
                </div>
                <h2>Revise los Items y Envío</h2>
              </div>
              <div class="step-header-right">
                <i v-if="activeStep !== 1" class="fas"
                  :class="stepsVisible[1] ? 'fa-chevron-up' : 'fa-chevron-down'" aria-hidden="true"></i>
              </div>
            </div>
            <div class="step-content" v-show="activeStep === 1 || (stepsVisible[1] && checkoutSteps[1].completed)">
              <div v-if="items.length === 0" class="empty-cart-message">
                <i class="fas fa-shopping-cart" aria-hidden="true"></i>
                <p>Tu carrito está vacío</p>
                <button @click="goShopping" class="go-shopping-btn">
                  <i class="fas fa-store" aria-hidden="true"></i> Ir a comprar
                </button>
              </div>
              <div v-else class="product-list">
                <!-- Product Item - Improved UI for Price Type Selection -->
                <div v-for="product in items" :key="product.uniqueId" class="product-item">
                  <div class="product-image-container">
                    <img :src="getProductImage(product)" :alt="product.nombre" class="product-image"
                      @error="handleImageError">
                    <div v-if="product.color" class="color-indicator">
                      <div class="color-circle" :style="{ backgroundColor: product.color }" aria-hidden="true"></div>
                      <span class="color-name">{{ product.color }}</span>
                    </div>
                  </div>
                  <div class="product-info">
                    <div class="product-header">
                      <h3>{{ product.nombre }}</h3>
                      <div class="price-type-badge"
                        :class="{ 'preventa': product.es_preventa, 'regular': !product.es_preventa }">
                        <i class="fas" :class="product.es_preventa ? 'fa-bolt' : 'fa-tag'" aria-hidden="true"></i>
                        {{ product.es_preventa ? 'Preventa' : 'Regular' }}
                      </div>
                    </div>

                    <p v-if="product.specs" class="specs">{{ product.specs }}</p>

                    <!-- Enhanced Price Type Selector with Better UX -->
                    <div class="price-type-container">
                      <div class="price-type-tabs" role="tablist">
                        <button 
                          @click="switchToPriceType(product, false)" 
                          :class="['tab-btn', { 'active': !product.es_preventa }]"
                          :disabled="!canSwitchToRegular(product)"
                          role="tab"
                          :aria-selected="!product.es_preventa"
                          :aria-controls="`regular-price-${product.uniqueId}`">
                          <i class="fas fa-tag" aria-hidden="true"></i> Precio Regular
                        </button>
                        <button 
                          @click="switchToPriceType(product, true)" 
                          :class="['tab-btn', { 'active': product.es_preventa }]"
                          :disabled="!canSwitchToPreventa(product)"
                          role="tab"
                          :aria-selected="product.es_preventa"
                          :aria-controls="`preventa-price-${product.uniqueId}`">
                          <i class="fas fa-bolt" aria-hidden="true"></i> Precio Preventa
                        </button>
                      </div>
                      
                      <div class="price-type-content">
                        <!-- Current Price Card -->
                        <div class="current-price-card" :id="product.es_preventa ? `preventa-price-${product.uniqueId}` : `regular-price-${product.uniqueId}`" role="tabpanel">
                          <div class="price-card-header">
                            <i :class="product.es_preventa ? 'fas fa-bolt' : 'fas fa-tag'" aria-hidden="true"></i>
                            <span>{{ product.es_preventa ? 'Precio de Preventa' : 'Precio Regular' }}</span>
                          </div>
                          <div class="price-card-body">
                            <div class="price-row">
                              <span class="price-label">Precio unitario:</span>
                              <span class="price-value">{{ formatPrice(product.es_preventa ? product.precio_preventa : product.precio) }}</span>
                            </div>
                            <div class="price-row">
                              <span class="price-label">Total:</span>
                              <span class="price-value total">{{ formatPrice((product.es_preventa ? product.precio_preventa : product.precio) * product.cantidad) }}</span>
                            </div>
                            <div class="price-row">
                              <span class="price-label">Rango de cantidad:</span>
                              <span class="price-value">{{ product.es_preventa ? 
                                `${product.cantidad_minima_preventa} - ${product.cantidad_maxima_preventa}` : 
                                `${product.cantidad_minima} - ${product.cantidad_maxima}` }} unidades</span>
                            </div>
                          </div>
                        </div>
                        
                        <!-- Price Comparison Info -->
                        <div class="price-comparison" v-if="canSwitchToPreventa(product) && canSwitchToRegular(product)">
                          <div class="comparison-header">
                            <i class="fas fa-info-circle" aria-hidden="true"></i> Comparación de precios
                          </div>
                          <div class="comparison-body">
                            <div class="comparison-row">
                              <div class="comparison-item">
                                <div class="comparison-label">Regular</div>
                                <div class="comparison-value">{{ formatPrice(product.precio) }}</div>
                                <div class="comparison-range">{{ product.cantidad_minima }}-{{ product.cantidad_maxima }} und.</div>
                              </div>
                              <div class="comparison-divider" aria-hidden="true">vs</div>
                              <div class="comparison-item">
                                <div class="comparison-label">Preventa</div>
                                <div class="comparison-value">{{ formatPrice(product.precio_preventa) }}</div>
                                <div class="comparison-range">{{ product.cantidad_minima_preventa }}-{{ product.cantidad_maxima_preventa }} und.</div>
                              </div>
                            </div>
                            <div class="savings-info" v-if="product.precio > product.precio_preventa">
                              <i class="fas fa-piggy-bank" aria-hidden="true"></i> Ahorro por unidad: 
                              <span>{{ formatPrice(product.precio - product.precio_preventa) }}</span>
                              ({{ Math.round((1 - product.precio_preventa/product.precio) * 100) }}%)
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Información del modelo si existe -->
                    <div class="model-info" v-if="product.nombreModelo">
                      <div class="model-badge">
                        <i class="fas fa-cube" aria-hidden="true"></i> Modelo: {{ product.nombreModelo }}
                      </div>
                    </div>

                    <!-- Control de cantidad mejorado -->
                    <div class="quantity-control-section">
                      <div class="quantity-label">
                        <span>Cantidad:</span>
                        <span class="quantity-status" :class="{
                          'warning': isNearRangeLimit(product),
                          'error': isQuantityOutOfRange(product)
                        }">
                          <i class="fas" :class="getQuantityStatusIcon(product)" aria-hidden="true"></i>
                          {{ getQuantityStatusText(product) }}
                        </span>
                      </div>

                      <div class="quantity-controls">
                        <div class="quantity-selector" role="group" aria-label="Control de cantidad">
                          <button @click="decreaseQuantity(product)" :disabled="isAtMinQuantity(product)"
                            class="quantity-btn decrease" aria-label="Disminuir cantidad">
                            <i class="fas fa-minus" aria-hidden="true"></i>
                          </button>
                          <div class="quantity-input-container">
                            <input type="number" v-model.number="product.cantidad"
                              @change="validateAndUpdateQuantity(product)" class="quantity-input"
                              :min="getMinQuantity(product)" :max="getMaxQuantity(product)" 
                              :aria-label="`Cantidad de ${product.nombre}`" />
                          </div>
                          <button @click="increaseQuantity(product)" :disabled="isAtMaxQuantity(product)"
                            class="quantity-btn increase" aria-label="Aumentar cantidad">
                            <i class="fas fa-plus" aria-hidden="true"></i>
                          </button>
                        </div>
                        <button @click="removeProduct(product)" class="remove-btn" :aria-label="`Eliminar ${product.nombre} del carrito`">
                          <i class="fas fa-trash" aria-hidden="true"></i> <span class="btn-text">Eliminar</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="step-actions" v-if="activeStep === 1">
                <button @click="prevStep" class="prev-button" aria-label="Volver al paso anterior">
                  <i class="fas fa-arrow-left" aria-hidden="true"></i> Anterior
                </button>
                <button @click="nextStep" class="next-button" :disabled="items.length === 0" aria-label="Continuar al siguiente paso">
                  Continuar <i class="fas fa-arrow-right" aria-hidden="true"></i>
                </button>
              </div>
            </div>
          </div>

          <!-- Step 3: Coupon -->
          <div class="step" :class="{ 'active-step': activeStep === 2, 'completed-step': activeStep > 2 }" :aria-expanded="activeStep === 2 || (stepsVisible[2] && checkoutSteps[2].completed)">
            <div class="step-header" @click="toggleStepVisibility(2)">
              <div class="step-header-left">
                <div class="step-number-wrapper">
                  <span class="step-number">3</span>
                  <i v-if="activeStep > 2" class="fas fa-check check-icon" aria-hidden="true"></i>
                </div>
                <h2>Cupón de Descuento</h2>
              </div>
              <div class="step-header-right">
                <i v-if="activeStep !== 2" class="fas"
                  :class="stepsVisible[2] ? 'fa-chevron-up' : 'fa-chevron-down'" aria-hidden="true"></i>
              </div>
            </div>
            <div class="step-content" v-show="activeStep === 2 || (stepsVisible[2] && checkoutSteps[2].completed)">
              <div class="coupon-section">
                <div class="form-group">
                  <label for="cupon">Código de Cupón</label>
                  <div class="coupon-input-group">
                    <div class="input-wrapper">
                      <i class="fas fa-tag input-icon" aria-hidden="true"></i>
                      <input id="cupon" type="text" v-model="cuponForm.codigo" placeholder="Ingrese el código del cupón"
                        class="coupon-input responsive-input" aria-describedby="coupon-message" />
                      <span class="input-focus-indicator"></span>
                    </div>
                    <button @click="applyCoupon" class="apply-coupon-btn" :disabled="!cuponForm.codigo" aria-label="Aplicar cupón">
                      <i class="fas fa-check" aria-hidden="true"></i> <span class="btn-text">Aplicar</span>
                    </button>
                  </div>
                </div>
                <p v-if="couponMessage" class="coupon-message" :class="{ 'error-message': couponError }" id="coupon-message" role="status">
                  <i :class="couponError ? 'fas fa-exclamation-circle' : 'fas fa-check-circle'" aria-hidden="true"></i>
                  {{ couponMessage }}
                </p>
                <div v-if="cartStore.descuento > 0" class="discount-info">
                  <p><i class="fas fa-money-bill-wave" aria-hidden="true"></i> Descuento aplicado: {{ formatPrice(cartStore.montoDescuento) }}</p>
                  <p v-if="cartStore.tipoDescuento === 'porcentaje'"><i class="fas fa-percentage" aria-hidden="true"></i> Porcentaje de
                    descuento: {{ cartStore.descuento }}%</p>
                  <button @click="removeCoupon" class="remove-coupon-btn" aria-label="Eliminar cupón">
                    <i class="fas fa-times" aria-hidden="true"></i> <span class="btn-text">Eliminar Cupón</span>
                  </button>
                </div>
              </div>
              <div class="step-actions" v-if="activeStep === 2">
                <button @click="prevStep" class="prev-button" aria-label="Volver al paso anterior">
                  <i class="fas fa-arrow-left" aria-hidden="true"></i> Anterior
                </button>
                <button @click="nextStep" class="next-button" aria-label="Continuar al siguiente paso">
                  Continuar <i class="fas fa-arrow-right" aria-hidden="true"></i>
                </button>
              </div>
            </div>
          </div>

          <!-- Step 4: Payment Method -->
          <div class="step" :class="{ 'active-step': activeStep === 3, 'completed-step': activeStep > 3 }" :aria-expanded="activeStep === 3 || (stepsVisible[3] && checkoutSteps[3].completed)">
    <div class="step-header" @click="toggleStepVisibility(3)">
      <div class="step-header-left">
        <div class="step-number-wrapper">
          <span class="step-number">4</span>
          <i v-if="activeStep > 3" class="fas fa-check check-icon" aria-hidden="true"></i>
        </div>
        <h2>Método de Pago</h2>
      </div>
      <div class="step-header-right">
        <i v-if="activeStep !== 3" class="fas"
          :class="stepsVisible[3] ? 'fa-chevron-up' : 'fa-chevron-down'" aria-hidden="true"></i>
      </div>
    </div>
    <div class="step-content" v-show="activeStep === 3 || (stepsVisible[3] && checkoutSteps[3].completed)">
      <div class="payment-options">
        <!-- Opción de pago por QR -->
        <div class="payment-option" :class="{ 'selected': paymentMethod === 'qr' }"
          @click="paymentMethod = 'qr'">
          <div class="payment-option-header">
            <div class="custom-radio">
              <input type="radio" id="qr-payment" name="payment-method" value="qr" v-model="paymentMethod" class="radio-input">
              <span class="radio-checkmark"></span>
            </div>
            <label for="qr-payment" class="payment-label">
              <i class="fas fa-qrcode" aria-hidden="true"></i> Pago por QR
            </label>
          </div>
          <div v-if="paymentMethod === 'qr'" class="payment-details">
            <p>Escanea el siguiente código QR para realizar el pago:</p>
            <div class="qr-payment-image">
              <img src="https://placehold.co/300x300/png?text=QR+Code" alt="QR Code para pago">
            </div>
            <div class="voucher-upload">
              <label for="voucher-file">Subir comprobante de pago (requerido)</label>
              <div class="file-upload-container">
                <input type="file" id="voucher-file" @change="handleFileUpload" accept="image/*"
                  class="file-input" capture="environment" aria-describedby="file-name">
                <div class="file-upload-button">
                  <i class="fas fa-upload" aria-hidden="true"></i> Seleccionar archivo
                </div>
                <span v-if="voucherFile" class="file-name" id="file-name">{{ voucherFile.name }}</span>
              </div>
              <div v-if="voucherPreview" class="voucher-preview">
                <img :src="voucherPreview" alt="Vista previa del comprobante">
                <button @click="removeVoucher" class="remove-voucher-btn" aria-label="Eliminar comprobante">
                  <i class="fas fa-times" aria-hidden="true"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Opción de pago en instalaciones -->
        <div class="payment-option" :class="{ 'selected': paymentMethod === 'in-person' }"
          @click="paymentMethod = 'in-person'">
          <div class="payment-option-header">
            <div class="custom-radio">
              <input type="radio" id="in-person" name="payment-method" value="in-person" v-model="paymentMethod" class="radio-input">
              <span class="radio-checkmark"></span>
            </div>
            <label for="in-person" class="payment-label">
              <i class="fas fa-store" aria-hidden="true"></i> Pago en Instalaciones
            </label>
          </div>
          <div v-if="paymentMethod === 'in-person'" class="payment-details">
            <p>Puedes realizar el pago directamente en nuestras instalaciones. Por favor selecciona una ubicación:</p>
            <div class="location-selector" role="radiogroup" aria-labelledby="location-heading">
              <h3 id="location-heading" class="sr-only">Selecciona una ubicación</h3>
              <div v-for="(location, key) in locationOptions" :key="key"
                :class="['location-option', { 'selected': selectedLocation === key }]"
                @click.stop="selectedLocation = key">
                <div class="custom-radio location-radio">
                  <input type="radio" :id="`location-${key}`" name="location" :value="key"
                    v-model="selectedLocation" class="radio-input">
                  <span class="radio-checkmark"></span>
                </div>
                <label :for="`location-${key}`" class="location-label">{{ location.name }}</label>
              </div>
            </div>
            <div v-if="selectedLocation" class="store-info">
              <div class="store-info-item">
                <i class="fas fa-map-marker-alt" aria-hidden="true"></i>
                <div>
                  <h4>Dirección:</h4>
                  <p>{{ locationOptions[selectedLocation].address }}</p>
                </div>
              </div>
              <div class="store-info-item">
                <i class="fas fa-clock" aria-hidden="true"></i>
                <div>
                  <h4>Horario:</h4>
                  <p>{{ locationOptions[selectedLocation].hours }}</p>
                </div>
              </div>
              <div class="store-info-item">
                <i class="fas fa-phone" aria-hidden="true"></i>
                <div>
                  <h4>Teléfono:</h4>
                  <p>{{ locationOptions[selectedLocation].phone }}</p>
                </div>
              </div>
              <div class="store-info-item">
                <i class="fas fa-envelope" aria-hidden="true"></i>
                <div>
                  <h4>Email:</h4>
                  <p>{{ locationOptions[selectedLocation].email }}</p>
                </div>
              </div>
              <div class="store-info-item">
                <i class="fas fa-info-circle" aria-hidden="true"></i>
                <div>
                  <h4>Información adicional:</h4>
                  <p>{{ locationOptions[selectedLocation].additionalInfo }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="step-actions" v-if="activeStep === 3">
        <button @click="prevStep" class="prev-button" aria-label="Volver al paso anterior">
          <i class="fas fa-arrow-left" aria-hidden="true"></i> Anterior
        </button>
        <button @click="finalizeOrder" class="checkout-button" :disabled="!isPaymentValid" aria-label="Finalizar pedido">
          <i class="fas fa-check-circle" aria-hidden="true"></i> FINALIZAR PEDIDO
        </button>
      </div>
    </div>
  </div>
        </div>
      </div>

      <!-- Fixed Order Summary for Mobile -->
      <div class="order-summary" :class="{ 'summary-expanded': showSummary }">
        <div class="summary-header" @click="toggleSummary">
          <div class="summary-header-left">
            <h2>Resumen del pedido</h2>
            <div class="summary-badge" v-if="items.length > 0">{{ items.length }}</div>
          </div>
          <div class="toggle-summary-btn" aria-label="Mostrar u ocultar resumen">
            <i class="fas" :class="showSummary ? 'fa-chevron-up' : 'fa-chevron-down'" aria-hidden="true"></i>
          </div>
        </div>

        <transition name="fade">
          <div class="summary-content" v-if="showSummary">
            <div v-if="items.length === 0" class="empty-summary">
              <i class="fas fa-shopping-cart" aria-hidden="true"></i>
              <p>No hay productos en el carrito</p>
            </div>
            <div v-else>
              <div class="summary-items">
                <div class="summary-item">
                  <span>Total en Productos:</span>
                  <span class="price-value">{{ formatPrice(cartStore.totalAmount) }}</span>
                </div>
                <div class="summary-item discount-item" v-if="cartStore.montoDescuento > 0">
                  <span v-if="cartStore.tipoDescuento === 'porcentaje'">Descuento ({{ cartStore.descuento }}%):</span>
                  <span v-else>Descuento:</span>
                  <span class="price-value">-{{ formatPrice(cartStore.montoDescuento) }}</span>
                </div>
                <div class="summary-item">
                  <span>Total después del descuento:</span>
                  <span class="price-value">{{ formatPrice(cartStore.totalAfterDiscount) }}</span>
                </div>
                <div class="summary-item">
                  <span>Monto a cancelar (70%):</span>
                  <span class="price-value">{{ formatPrice(cartStore.totalToPay) }}</span>
                </div>
                <div class="summary-item">
                  <span>Pendiente (30%):</span>
                  <span class="price-value">{{ formatPrice(cartStore.pending) }}</span>
                </div>
              </div>
              <div class="total">
                <span>Monto final:</span>
                <span class="total-amount">{{ formatPrice(cartStore.totalAfterDiscount) }}</span>
              </div>
              <div class="mini-cart-preview mobile-only">
                <div class="mini-cart-scroll">
                  <div v-for="product in items" :key="product.uniqueId" class="mini-cart-item">
                    <img :src="getProductImage(product)" :alt="product.nombre" class="mini-cart-image">
                    <div class="mini-cart-details">
                      <p class="mini-cart-name">{{ product.nombre }}</p>
                      <p class="mini-cart-price">{{ formatPrice(product.precio * product.cantidad) }}</p>
                      <p class="mini-cart-unit-price">Precio unitario: {{ formatPrice(product.precio) }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="checkout-progress desktop-only">
              <div class="progress-bar" role="progressbar" :aria-valuenow="progressPercentage" aria-valuemin="0" aria-valuemax="100">
                <div class="progress" :style="{ width: progressPercentage + '%' }"></div>
              </div>
              <p class="progress-text">Paso {{ activeStep + 1 }} de {{ checkoutSteps.length }}</p>
            </div>
            <p class="terms">
              Al hacer clic en "Finalizar pedido", aceptas los
              <a href="/terminos-condiciones">términos y condiciones</a> del servicio.
            </p>
            <div class="mobile-finalize-container" v-if="activeStep === 3 && !orderFinalized">
              <button @click="finalizeOrder" class="mobile-finalize-button" :disabled="!isPaymentValid" aria-label="Finalizar pedido">
                <i class="fas fa-check-circle" aria-hidden="true"></i> FINALIZAR PEDIDO
              </button>
            </div>
          </div>
        </transition>

        <div v-if="orderFinalized" class="order-finalized">
          <div class="success-animation">
            <i class="fas fa-check-circle" aria-hidden="true"></i>
          </div>
          <h3>¡Gracias por tu pedido!</h3>
          <p>Puedes contactarnos por WhatsApp para cualquier consulta:</p>
          <a :href="whatsappLink" class="whatsapp-button">
            <i class="fab fa-whatsapp" aria-hidden="true"></i> Contactar por WhatsApp
          </a>
          <div class="qr-code">
            <img src="https://placehold.co/200x200/png?text=QR+Code" alt="QR Code para seguimiento de pedido" />
            <p>Escanea este código QR para seguir tu pedido</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Navigation Controls for Mobile -->
    <div class="mobile-nav-controls" v-if="!orderFinalized">
      <div class="nav-buttons-container">
        <button v-if="activeStep > 0" @click="prevStep" class="mobile-nav-btn prev-btn" aria-label="Paso anterior">
          <i class="fas fa-arrow-left" aria-hidden="true"></i>
        </button>
        <button @click="toggleSummary" class="mobile-cart-btn" aria-label="Ver resumen del carrito">
          <i class="fas fa-shopping-cart" aria-hidden="true"></i>
          <span class="cart-count" v-if="items.length > 0">{{ items.length }}</span>
          <span class="cart-total">{{ formatPrice(totalAmount) }}</span>
        </button>
        <button v-if="activeStep < checkoutSteps.length - 1" @click="nextStep" class="mobile-nav-btn next-btn"
          :disabled="(activeStep === 1 && items.length === 0)" aria-label="Siguiente paso">
          <i class="fas fa-arrow-right" aria-hidden="true"></i>
        </button>
        <button v-else @click="finalizeOrder" class="mobile-nav-btn checkout-btn" :disabled="!isPaymentValid" aria-label="Finalizar pedido">
          <i class="fas fa-check" aria-hidden="true"></i>
        </button>
      </div>
    </div>

    <!-- Modal de confirmación para vaciar carrito -->
    <transition name="modal">
      <div v-if="showEmptyCartModal" class="modal-container" aria-modal="true" role="dialog">
        <div class="modal-overlay" @click="cancelEmptyCart"></div>
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3><i class="fas fa-exclamation-triangle" aria-hidden="true"></i> Vaciar carrito</h3>
            <button class="close-modal" @click="cancelEmptyCart" aria-label="Cerrar">
              <i class="fas fa-times" aria-hidden="true"></i>
            </button>
          </div>
          <div class="modal-body">
            <p>¿Estás seguro de que deseas vaciar tu carrito? Esta acción no se puede deshacer.</p>
          </div>
          <div class="modal-footer">
            <button class="cancel-btn" @click="cancelEmptyCart">
              <i class="fas fa-times" aria-hidden="true"></i> Cancelar
            </button>
            <button class="confirm-btn" @click="confirmEmptyCart">
              <i class="fas fa-trash-alt" aria-hidden="true"></i> Vaciar carrito
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Login Prompt Modal -->
    <transition name="modal">
      <div v-if="showLoginPrompt" class="modal-container" aria-modal="true" role="dialog">
        <div class="modal-overlay" @click="cancelLoginPrompt"></div>
        <div class="modal-content login-prompt" @click.stop>
          <div class="modal-header">
            <h3><i class="fas fa-user-lock" aria-hidden="true"></i> Iniciar sesión</h3>
            <button class="close-modal" @click="cancelLoginPrompt" aria-label="Cerrar">
              <i class="fas fa-times" aria-hidden="true"></i>
            </button>
          </div>
          <div class="modal-body">
            <p>Para guardar tus datos de envío y facilitar futuras compras, te recomendamos iniciar sesión o
              registrarte.</p>
            <p>Sin embargo, puedes continuar como invitado si lo prefieres.</p>
          </div>
          <div class="modal-footer login-options">
            <button class="guest-btn" @click="continueAsGuest">
              <i class="fas fa-user" aria-hidden="true"></i> Continuar como invitado
            </button>
            <button class="login-btn" @click="goToLogin">
              <i class="fas fa-sign-in-alt" aria-hidden="true"></i> Iniciar sesión
            </button>
            <button class="register-btn" @click="goToRegister">
              <i class="fas fa-user-plus" aria-hidden="true"></i> Registrarse
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { validateCuponBE } from '@/Services/CuponService';
import { storePedido } from '@/Services/PedidoService';
import { updateDatosInfoUser } from '@/Services/UsuarioService';
import { useCartStore } from '@/stores/cart';
import { useThemeStore } from '@/stores/themeStore';
import { useRouter } from 'vue-router';
import Swal from 'sweetalert2';
import { computed, ref, onMounted, watch, onBeforeUnmount } from 'vue';

const router = useRouter();

const goBack = () => {
  router.go(-1);
};

const goToHome = () => {
  router.push('/');
};

const cartStore = useCartStore();
const themeStore = useThemeStore();
const userData = ref({});
const couponMessage = ref('');
const couponError = ref(false);
const cuponForm = ref({ codigo: '' });
const orderFinalized = ref(false);
const whatsappNumber = '+59170000000';
const whatsappLink = computed(() => `https://wa.me/${whatsappNumber}`);
const showSummary = ref(window.innerWidth > 768);
const stepsVisible = ref([true, true, true, true]);
const isScrolled = ref(false);
const showEmptyCartModal = ref(false);
const showLoginPrompt = ref(false);
const formSubmitted = ref(false);
const redirectAfterLogin = ref(false);
const activeStepClicked = ref(null);

const deliveryInfo = ref({
  nombre: '',
  apellido: '',
  direccion: '',
  telefono: '',
  email: ''
});

const paymentMethod = ref('');
const voucherFile = ref(null);
const voucherPreview = ref('');

const selectedLocation = ref('');
const locationOptions = ref({
  'la-paz': {
    name: 'La Paz',
    address: 'Av. 16 de Julio #1490, Zona Central, La Paz',
    hours: 'Lunes a Viernes de 8:30 a 18:00, Sábados de 9:00 a 13:00',
    phone: '+591 2 2334455',
    email: 'tienda.lapaz@empresa.com',
    additionalInfo: 'Referencia: Frente al Banco Nacional, edificio Torre Azul, planta baja.'
  },
  'cochabamba': {
    name: 'Cochabamba',
    address: 'Av. América #1234, Zona Norte, Cochabamba',
    hours: 'Lunes a Viernes de 9:00 a 18:30, Sábados de 9:00 a 14:00',
    phone: '+591 4 4556677',
    email: 'tienda.cochabamba@empresa.com',
    additionalInfo: 'Referencia: A media cuadra de la Plaza Principal, local con fachada verde.'
  },
});

const activeStep = ref(0);
const checkoutSteps = ref([
  { id: 'delivery', title: 'Ubicación de Entrega', shortTitle: 'Entrega', editable: true, editing: false, completed: false },
  { id: 'review', title: 'Revise los Items y Envío', shortTitle: 'Items', editable: false, editing: false, completed: false },
  { id: 'coupon', title: 'Cupón de Descuento', shortTitle: 'Cupón', editable: false, editing: false, completed: false },
  { id: 'payment', title: 'Método de Pago', shortTitle: 'Pago', editable: false, editing: false, completed: false }
]);
const placeholderImage = ref('https://placehold.co/100x100/png?text=Image+Not+Found');

const progressPercentage = computed(() => {
  return (activeStep.value / (checkoutSteps.value.length - 1)) * 100;
});

const isDeliveryInfoComplete = computed(() => {
  return deliveryInfo.value.nombre &&
    deliveryInfo.value.apellido &&
    deliveryInfo.value.direccion &&
    deliveryInfo.value.telefono &&
    deliveryInfo.value.email;
});

const isPaymentValid = computed(() => {
  if (paymentMethod.value === 'qr') {
    return voucherFile.value !== null;
  } else if (paymentMethod.value === 'in-person') {
    return selectedLocation.value !== '';
  }
  return false;
});

watch(() => cartStore.productos, (newValue) => {
  if (newValue.length === 0 && activeStep.value === 1) {
    console.log('Carrito vacío en paso de revisión');
  }
}, { deep: true });

const isAuthenticated = computed(() => {
  return !!localStorage.getItem('token');
});

const checkRedirectFromLogin = () => {
  const redirectParam = new URLSearchParams(window.location.search).get('fromLogin');
  if (redirectParam === 'true' && !isAuthenticated.value) {
    showLoginPrompt.value = true;
  }
};

onMounted(() => {
  if (themeStore.currentDepartment === 'la-paz' || themeStore.currentDepartment === 'cochabamba') {
    selectedLocation.value = themeStore.currentDepartment;
  } else {
    selectedLocation.value = 'la-paz';
  }

  const storedData = localStorage.getItem('datosUser');
  if (storedData) {
    deliveryInfo.value = JSON.parse(storedData);
  }

  window.addEventListener('resize', handleResize);
  window.addEventListener('scroll', handleScroll);
  window.addEventListener('touchstart', handleTouchStart, { passive: true });

  if (cartStore.productos.length === 0) {
    Swal.fire({
      title: "Carrito vacío",
      text: "No hay productos en tu carrito. ¿Deseas ir a la tienda?",
      icon: "info",
      showCancelButton: true,
      confirmButtonText: "Ir a la tienda",
      cancelButtonText: "Cancelar"
    }).then((result) => {
      if (result.isConfirmed) {
        router.push('/productos');
      }
    });
  }

  if (!isAuthenticated.value && activeStep.value === 0) {
    showLoginPrompt.value = true;
  }

  checkRedirectFromLogin();
  document.addEventListener('keydown', handleKeyDown);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
  window.removeEventListener('scroll', handleScroll);
  window.removeEventListener('touchstart', handleTouchStart);
  document.removeEventListener('keydown', handleKeyDown);
});

const handleTouchStart = (e) => {
  if (e.target.closest('.toggle-summary-btn') || e.target.closest('.summary-header')) {
    e.preventDefault();
  }
};

const handleKeyDown = (e) => {
  if (e.key === 'Escape') {
    if (showEmptyCartModal.value) cancelEmptyCart();
    if (showLoginPrompt.value) cancelLoginPrompt();
  }
};

const handleScroll = () => {
  isScrolled.value = window.scrollY > 10;
};

const handleResize = () => {
  if (window.innerWidth > 768) {
    showSummary.value = true;
  } else {
    if (activeStep.value === checkoutSteps.value.length - 1) {
      showSummary.value = true;
    }
  }
};

const handleStepClick = (index) => {
  if (index <= activeStep.value || (index === activeStep.value + 1 && checkoutSteps.value[activeStep.value].completed)) {
    activeStepClicked.value = index;
    const stepElement = document.querySelector(`.step-indicator:nth-child(${index + 1})`);
    if (stepElement) {
      stepElement.classList.add('step-clicked');
      setTimeout(() => {
        stepElement.classList.remove('step-clicked');
      }, 300);
    }
    goToStep(index);
    if (index !== activeStep.value) {
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: `Navegando al paso ${index + 1}: ${checkoutSteps.value[index].title}`,
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true
      });
    }
  }
};

const toggleSummary = (e) => {
  if (e) e.stopPropagation();
  showSummary.value = !showSummary.value;
};

const toggleStepVisibility = (index) => {
  if (activeStep.value !== index && checkoutSteps.value[index].completed) {
    stepsVisible.value[index] = !stepsVisible.value[index];
  }
};

const goToStep = (index) => {
  if (index <= activeStep.value || (index === activeStep.value + 1 && checkoutSteps.value[activeStep.value].completed)) {
    activeStep.value = index;
    if (window.innerWidth <= 768) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
};

const nextStep = () => {
  formSubmitted.value = true;
  if (activeStep.value === 0 && !isDeliveryInfoComplete.value) {
    Swal.fire({
      title: "Información incompleta",
      text: "Por favor, completa todos los campos obligatorios antes de continuar.",
      icon: "warning",
      confirmButtonText: "Entendido",
    });
    return;
  }
  if (activeStep.value < checkoutSteps.value.length - 1) {
    checkoutSteps.value[activeStep.value].completed = true;
    activeStep.value++;
    if (activeStep.value === checkoutSteps.value.length - 1 && window.innerWidth <= 768) {
      showSummary.value = true;
    }
    if (window.innerWidth <= 768) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
};

const prevStep = () => {
  if (activeStep.value > 0) {
    activeStep.value--;
    if (window.innerWidth <= 768) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
};

const handleFileUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    voucherFile.value = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      voucherPreview.value = e.target.result;
    };
    reader.readAsDataURL(file);
  }
};

const removeVoucher = () => {
  voucherFile.value = null;
  voucherPreview.value = '';
  const fileInput = document.getElementById('voucher-file');
  if (fileInput) fileInput.value = '';
};

const totalItems = computed(() => cartStore.totalItems);
const totalAmount = computed(() => cartStore.totalAmount);
const totalToPay = computed(() => cartStore.totalToPay);
const pending = computed(() => cartStore.pending);
const items = computed(() => cartStore.productos);

// Function to check if quantity is near range limit
function isNearRangeLimit(product) {
  const min = getMinQuantity(product);
  const max = getMaxQuantity(product);

  return (product.cantidad - min <= 2) || (max - product.cantidad <= 2);
}

// Improved function to validate and update quantity
function validateAndUpdateQuantity(product) {
  const min = getMinQuantity(product);
  const max = getMaxQuantity(product);

  if (isNaN(product.cantidad) || product.cantidad === '') {
    product.cantidad = min;
    updateQuantityWithoutPriceChange(product, min);
    return;
  }

  // Convert to number to ensure proper comparison
  let cantidad = parseInt(product.cantidad);

  if (cantidad < min || cantidad > max) {
    let message, options;

    if (product.es_preventa) {
      if (cantidad < min) {
        message = `La cantidad (${cantidad}) es menor que el mínimo de preventa (${min}).`;
        options = [
          { text: `Ajustar a mínimo (${min})`, action: 'adjust-min' },
          { text: 'Cambiar a precio regular', action: 'switch-regular' }
        ];
      } else {
        message = `La cantidad (${cantidad}) es mayor que el máximo de preventa (${max}).`;
        options = [
          { text: `Ajustar a máximo (${max})`, action: 'adjust-max' },
          { text: 'Cambiar a precio regular', action: 'switch-regular' }
        ];
      }
    } else {
      if (cantidad < min) {
        message = `La cantidad (${cantidad}) es menor que el mínimo regular (${min}).`;
        options = [
          { text: `Ajustar a mínimo (${min})`, action: 'adjust-min' }
        ];
        if (canSwitchToPreventa(product) && 
            cantidad >= product.cantidad_minima_preventa && 
            cantidad <= product.cantidad_maxima_preventa) {
          options.push({ text: 'Cambiar a precio de preventa', action: 'switch-preventa' });
        }
      } else {
        message = `La cantidad (${cantidad}) es mayor que el máximo regular (${max}).`;
        options = [
          { text: `Ajustar a máximo (${max})`, action: 'adjust-max' }
        ];
      }
    }

    Swal.fire({
      title: "Cantidad fuera de rango",
      text: message,
      icon: "warning",
      input: 'radio',
      inputOptions: options.reduce((acc, opt, idx) => {
        acc[idx] = opt.text;
        return acc;
      }, {}),
      inputValidator: (value) => {
        if (!value) {
          return 'Debes seleccionar una opción';
        }
      },
      showCancelButton: true,
      confirmButtonText: "Aplicar",
      cancelButtonText: "Cancelar"
    }).then((result) => {
      if (result.isConfirmed) {
        const selectedOption = options[result.value];
        switch (selectedOption.action) {
          case 'adjust-min':
            updateQuantityWithoutPriceChange(product, min);
            break;
          case 'adjust-max':
            updateQuantityWithoutPriceChange(product, max);
            break;
          case 'switch-regular':
            switchToPriceType(product, false);
            break;
          case 'switch-preventa':
            switchToPriceType(product, true);
            break;
        }
      } else {
        // If canceled, reset to the appropriate minimum
        updateQuantityWithoutPriceChange(product, min);
      }
    });
  } else {
    // If within range, just update the quantity without changing price type
    updateQuantityWithoutPriceChange(product, cantidad);
  }
}

function removeProduct(product) {
  Swal.fire({
    title: "¿Eliminar producto?",
    text: `¿Estás seguro de eliminar ${product.nombre} del carrito?`,
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar"
  }).then((result) => {
    if (result.isConfirmed) {
      cartStore.removeFromCart(product.uniqueId);
    }
  });
}

const emptyCart = () => {
  if (items.value.length === 0) return;
  showEmptyCartModal.value = true;
};

const confirmEmptyCart = () => {
  cartStore.clearCart();
  showEmptyCartModal.value = false;
  Swal.fire({
    title: "Carrito vaciado",
    text: "Todos los productos han sido eliminados del carrito",
    icon: "success",
    confirmButtonText: "Aceptar",
  });
  if (activeStep.value === 1) {
    activeStep.value = 0;
    checkoutSteps.value[1].completed = false;
  }
};

const cancelEmptyCart = () => {
  showEmptyCartModal.value = false;
};

const cancelLoginPrompt = () => {
  showLoginPrompt.value = false;
};

const continueAsGuest = () => {
  showLoginPrompt.value = false;
};

const goToLogin = () => {
  redirectAfterLogin.value = true;
  localStorage.setItem('checkoutRedirect', 'true');
  router.push('/login?redirect=checkout');
};

const goToRegister = () => {
  redirectAfterLogin.value = true;
  localStorage.setItem('checkoutRedirect', 'true');
  router.push('/register?redirect=checkout');
};

const goShopping = () => {
  router.push('/productos');
};

// Function to generate unique ID for cart items
function generarUniqueId(product) {
  const preventaStatus = product.es_preventa ? 'preventa' : 'regular';
  return `${product.id}-${product.modeloId || "default"}-${product.color || "default"}-${preventaStatus}`;
}

function getProductImage(product) {
  // Si hay un color seleccionado, buscar la imagen correspondiente en 'images'
  if (product.color && product.images && product.images.length > 0) {
    const imageForColor = product.images.find(img => img.color === product.color);
    if (imageForColor && imageForColor.imagen && imageForColor.imagen !== 'undefined' && imageForColor.imagen !== '') {
      return imageForColor.imagen;
    }
  }

  // Priorizar propiedades en orden si no hay color o no se encontró imagen para el color
  if (product.imagen_principal && product.imagen_principal !== 'undefined' && product.imagen_principal !== '') {
    return product.imagen_principal;
  }
  if (product.colorImage && product.colorImage !== 'undefined' && product.colorImage !== '') {
    return product.colorImage;
  }
  if (product.image && product.image !== 'undefined' && product.image !== '') {
    return product.image;
  }

  // Si no hay imagen válida, devolver el placeholder
  return placeholderImage.value;
}

// Improved function to handle image loading errors
function handleImageError(event) {
  if (event.target.src !== placeholderImage.value) {
    event.target.src = placeholderImage.value;
  }
}

// Check if product can switch to preventa price
function canSwitchToPreventa(product) {
  return product.precio_preventa > 0 &&
    product.cantidad_minima_preventa > 0 &&
    product.cantidad_maxima_preventa > 0;
}

// Check if product can switch to regular price
function canSwitchToRegular(product) {
  return product.precio > 0 &&
    product.cantidad_minima > 0 &&
    product.cantidad_maxima > 0;
}

const formatPrice = (price) => {
  return price ? `${price.toLocaleString()} Bs` : '0 Bs';
};

/**
 * Calcula el monto de descuento basado en el tipo y valor del descuento
 * @param {number} totalAmount - Monto total antes del descuento
 * @param {string} discountType - Tipo de descuento ('porcentaje' o 'fijo')
 * @param {number} discountValue - Valor del descuento (porcentaje o monto fijo)
 * @returns {number} - El monto de descuento calculado
 */
function calculateDiscountAmount(totalAmount, discountType, discountValue) {
  if (!totalAmount || !discountValue) return 0;
  
  let discountAmount = 0;
  
  if (discountType === 'porcentaje') {
    // Calcular descuento porcentual
    discountAmount = (totalAmount * discountValue) / 100;
  } else if (discountType === 'fijo') {
    // Descuento de monto fijo
    discountAmount = discountValue;
  }
  
  // Asegurar que el descuento no exceda el monto total
  return Math.min(discountAmount, totalAmount);
}

const applyCoupon = async () => {
  if (!cuponForm.value.codigo) {
    Swal.fire({
      title: "Advertencia",
      text: "Por favor, ingresa un cupón.",
      icon: "warning",
      confirmButtonText: "Aceptar",
    });
    return;
  }
  try {
    const response = await validateCuponBE(cuponForm.value);
    if (response.data.success) {
      // Aplicar el cupón usando la función mejorada de cálculo de descuento
      const cupon = response.data.cupon;
      
      // Calcular el monto de descuento usando la nueva función
      const discountAmount = calculateDiscountAmount(
        totalAmount.value,
        cupon.tipo,
        cupon.descuento
      );
      
      // Actualizar el objeto del cupón con el monto calculado
      const cuponConMontoCalculado = {
        ...cupon,
        montoCalculado: discountAmount
      };
      
      // Aplicar el cupón al carrito
      cartStore.applyCoupon(cuponConMontoCalculado);
      
      couponMessage.value = `Cupón aplicado: ${cupon.codigo}`;
      couponError.value = false;
      Swal.fire({
        title: "¡Éxito!",
        text: `Cupón aplicado: ${cupon.codigo}`,
        icon: "success",
        confirmButtonText: "Aceptar",
      });
    } else {
      couponMessage.value = 'Cupón no válido o expirado.';
      couponError.value = true;
      Swal.fire({
        title: "Error",
        text: "Cupón no válido o expirado.",
        icon: "error",
        confirmButtonText: "Aceptar",
      });
    }
  } catch (error) {
    couponMessage.value = 'Error al aplicar el cupón. Intenta de nuevo más tarde.';
    couponError.value = true;
    Swal.fire({
      title: "Error",
      text: "Error al aplicar el cupón. Intenta de nuevo más tarde.",
      icon: "error",
      confirmButtonText: "Aceptar",
    });
  }
};

const removeCoupon = () => {
  cartStore.removeCoupon();
  couponMessage.value = 'Cupón eliminado.';
  couponError.value = false;
  Swal.fire({
    title: "Información",
    text: "Cupón eliminado correctamente.",
    icon: "info",
    confirmButtonText: "Aceptar",
  });
};

// Función mejorada para procesar el pedido
const processOrder = async () => {
  if (items.value.length === 0) {
    Swal.fire({
      title: "Advertencia",
      text: "Por favor, ingresa productos antes de finalizar el pedido.",
      icon: "warning",
      confirmButtonText: "Aceptar",
    });
    return;
  }
  if (!isDeliveryInfoComplete.value) {
    Swal.fire({
      title: "Información incompleta",
      text: "Por favor, completa todos los datos de entrega antes de continuar.",
      icon: "warning",
      confirmButtonText: "Aceptar",
    });
    activeStep.value = 0;
    return;
  }
  if (!isPaymentValid.value) {
    let warningMessage = "Por favor, selecciona un método de pago.";
    if (paymentMethod.value === 'qr') {
      warningMessage = "Por favor, sube el comprobante de pago antes de finalizar el pedido.";
    } else if (paymentMethod.value === 'in-person' && !selectedLocation.value) {
      warningMessage = "Por favor, selecciona una ubicación para el pago en instalaciones.";
    }
    Swal.fire({
      title: "Advertencia",
      text: warningMessage,
      icon: "warning",
      confirmButtonText: "Aceptar",
    });
    return;
  }
  if (!Array.isArray(items.value)) {
    console.error("Error: items.value no es un array", items.value);
    Swal.fire({
      title: "Error",
      text: "Ha ocurrido un error con el formato de los productos",
      icon: "error",
      confirmButtonText: "Aceptar",
    });
    return;
  }

  const formData = new FormData();
  items.value.forEach((producto, index) => {
    formData.append(`productos[${index}][id]`, producto.id);
    formData.append(`productos[${index}][cantidad]`, producto.cantidad);
    formData.append(`productos[${index}][precio]`, producto.precio);
    formData.append(`productos[${index}][es_preventa]`, producto.es_preventa ? '1' : '0');
    if (producto.precio_preventa) formData.append(`productos[${index}][precio_preventa]`, producto.precio_preventa);
    if (producto.modeloId) formData.append(`productos[${index}][modelo_id]`, producto.modeloId);
    if (producto.color) formData.append(`productos[${index}][color]`, producto.color);
  });
  
  // Usar el monto después del descuento como total_amount
  formData.append('total_amount', cartStore.totalAfterDiscount);
  formData.append('total_to_pay', cartStore.totalToPay);
  formData.append('pending', cartStore.pending);
  
  // Información del descuento aplicado
  if (cartStore.cupon_id) {
    formData.append('cupon_id', cartStore.cupon_id);
    formData.append('descuento_aplicado', cartStore.montoDescuento);
    formData.append('tipo_descuento', cartStore.tipoDescuento);
    formData.append('valor_descuento', cartStore.descuento);
  }
  
  formData.append('payment_method', paymentMethod.value);
  formData.append('is_guest', !isAuthenticated.value);
  if (paymentMethod.value === 'in-person' && selectedLocation.value) {
    formData.append('location', selectedLocation.value);
    formData.append('location_details', JSON.stringify(locationOptions.value[selectedLocation.value]));
  }
  formData.append('delivery_info', JSON.stringify(deliveryInfo.value));
  if (voucherFile.value && paymentMethod.value === 'qr') {
    formData.append('voucher', voucherFile.value);
  }

  Swal.fire({
    title: "¿Deseas terminar el proceso del pedido?",
    text: "Puedes continuar con el proceso o cancelar.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Confirmar",
    cancelButtonText: "Cancelar",
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        Swal.fire({
          title: "Procesando pedido",
          text: "Por favor espera mientras procesamos tu pedido...",
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });
        
        // Mostrar en consola los valores que se están enviando (para depuración)
        console.log('Enviando pedido con los siguientes valores:');
        console.log('Total original:', cartStore.totalAmount);
        console.log('Descuento aplicado:', cartStore.montoDescuento);
        console.log('Total después del descuento:', cartStore.totalAfterDiscount);
        console.log('Total a pagar (70%):', cartStore.totalToPay);
        console.log('Pendiente (30%):', cartStore.pending);
        
        const { data } = await storePedido(formData);
        console.log('Respuesta del servidor:', data);
        
        Swal.fire({
          title: "¡Pedido Finalizado!",
          text: "Tu pedido ha sido realizado con éxito.",
          icon: "success",
          confirmButtonText: "Aceptar",
        }).then(() => {
          clearOrderData();
        });
      } catch (error) {
        console.error("Error al finalizar el pedido:", error.response?.data || error);
        Swal.fire({
          title: "Error",
          text: error.response?.data?.message || "Hubo un error al finalizar el pedido. Por favor, intente nuevamente.",
          icon: "error",
          confirmButtonText: "Aceptar",
        });
      }
    }
  });
};

const clearOrderData = () => {
  if (typeof cartStore.clearCart === 'function') {
    cartStore.clearCart();
  } else {
    cartStore.productos = [];
    cartStore.total = 0;
  }
  cartStore.removeCoupon();
  cuponForm.value.codigo = '';
  couponMessage.value = '';
  couponError.value = false;
  voucherFile.value = null;
  voucherPreview.value = '';
  const fileInput = document.getElementById('voucher-file');
  if (fileInput) fileInput.value = '';
  paymentMethod.value = '';
  checkoutSteps.value.forEach(step => {
    step.completed = false;
    step.editing = false;
  });
  activeStep.value = 0;
  orderFinalized.value = true;
  if (isAuthenticated.value) {
    localStorage.setItem('datosUser', JSON.stringify(deliveryInfo.value));
  }
};

const toggleEdit = async (index) => {
  const step = checkoutSteps.value[index];
  if (isAuthenticated.value) {
    if (step.editable) {
      step.editing = !step.editing;
      if (!step.editing) {
        try {
          const { data } = await updateDatosInfoUser(deliveryInfo.value);
          localStorage.removeItem('datosUser');
          localStorage.setItem('datosUser', JSON.stringify(deliveryInfo.value));
          Swal.fire({
            title: "¡Éxito!",
            text: "Tus datos han sido actualizados correctamente.",
            icon: "success",
            confirmButtonText: "Aceptar",
          });
        } catch (error) {
          console.error("Error al actualizar los datos del usuario:", error);
          Swal.fire({
            title: "Error",
            text: error.response?.data?.message || "Hubo un error al actualizar los datos. Por favor, intenta nuevamente.",
            icon: "error",
            confirmButtonText: "Aceptar",
          });
        }
      }
    }
  } else {
    showLoginPrompt.value = true;
  }
};

function getMinQuantity(product) {
  return product.es_preventa ? (product.cantidad_minima_preventa || 1) : (product.cantidad_minima || 1);
}

function getMaxQuantity(product) {
  return product.es_preventa ? (product.cantidad_maxima_preventa || 999) : (product.cantidad_maxima || 999);
}

function isAtMinQuantity(product) {
  return product.cantidad <= getMinQuantity(product);
}

function isAtMaxQuantity(product) {
  return product.cantidad >= getMaxQuantity(product);
}

function isQuantityOutOfRange(product) {
  const min = getMinQuantity(product);
  const max = getMaxQuantity(product);

  return product.cantidad < min || product.cantidad > max;
}

function getQuantityStatusIcon(product) {
  if (isQuantityOutOfRange(product)) {
    return 'fa-exclamation-circle';
  } else if (isNearRangeLimit(product)) {
    return 'fa-exclamation-triangle';
  } else {
    return 'fa-check-circle';
  }
}

function getQuantityStatusText(product) {
  const min = getMinQuantity(product);
  const max = getMaxQuantity(product);

  if (product.cantidad < min) {
    return `Por debajo del mínimo (${min})`;
  } else if (product.cantidad > max) {
    return `Por encima del máximo (${max})`;
  } else if (isNearRangeLimit(product)) {
    if (product.cantidad - min <= 2) {
      return `Cerca del mínimo (${min})`;
    } else if (max - product.cantidad <= 2) {
      return `Cerca del máximo (${max})`;
    }
  }
  return `Dentro del rango (${min}-${max})`;
}

// Improved functions for quantity changes
function increaseQuantity(product) {
  if (product.cantidad < getMaxQuantity(product)) {
    const nuevaCantidad = parseInt(product.cantidad) + 1;

    if (product.es_preventa && nuevaCantidad > product.cantidad_maxima_preventa) {
      Swal.fire({
        title: "Límite de preventa alcanzado",
        text: `Has alcanzado el máximo para preventa (${product.cantidad_maxima_preventa}). ¿Deseas cambiar a precio regular?`,
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Cambiar a precio regular",
        cancelButtonText: "Mantener en preventa"
      }).then((result) => {
        if (result.isConfirmed) {
          switchToPriceType(product, false);
        } else {
          updateQuantityWithoutPriceChange(product, product.cantidad_maxima_preventa);
        }
      });
      return;
    }

    updateQuantityWithoutPriceChange(product, nuevaCantidad);
  } else {
    Swal.fire({
      title: "Cantidad máxima",
      text: `No se puede aumentar más allá de ${getMaxQuantity(product)} unidades.`,
      icon: "info",
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 3000
    });
  }
}

function decreaseQuantity(product) {
  if (product.cantidad > getMinQuantity(product)) {
    const nuevaCantidad = parseInt(product.cantidad) - 1;

    if (!product.es_preventa && canSwitchToPreventa(product) &&
        nuevaCantidad >= product.cantidad_minima_preventa &&
        nuevaCantidad <= product.cantidad_maxima_preventa) {
      Swal.fire({
        title: "Cambio de precio",
        text: `Al disminuir a ${nuevaCantidad}, entra en el rango de preventa (${product.cantidad_minima_preventa}-${product.cantidad_maxima_preventa}). ¿Desea cambiar a precio de preventa?`,
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Sí, cambiar",
        cancelButtonText: "No, mantener regular"
      }).then((result) => {
        if (result.isConfirmed) {
          switchToPriceType(product, true);
        } else {
          updateQuantityWithoutPriceChange(product, nuevaCantidad);
        }
      });
      return;
    }

    updateQuantityWithoutPriceChange(product, nuevaCantidad);
  } else {
    Swal.fire({
      title: "Cantidad mínima",
      text: `No se puede disminuir por debajo de ${getMinQuantity(product)} unidades.`,
      icon: "info",
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 3000
    });
  }
}

// Función para cambiar el tipo de precio y preservar imágenes
function switchToPriceType(product, isPreventa) {
  if (isPreventa && !canSwitchToPreventa(product)) {
    Swal.fire({
      title: "No se puede cambiar a preventa",
      text: "Este producto no tiene precio de preventa válido.",
      icon: "warning",
      confirmButtonText: "Entendido"
    });
    return;
  }
  
  if (!isPreventa && !canSwitchToRegular(product)) {
    Swal.fire({
      title: "No se puede cambiar a regular",
      text: "Este producto no tiene precio regular válido.",
      icon: "warning",
      confirmButtonText: "Entendido"
    });
    return;
  }

  // Guardar la imagen actual antes de cualquier cambio
  const currentImageUrl = getProductImage(product);

  if (isPreventa !== product.es_preventa) {
    let nuevaCantidad = product.cantidad;
    
    if (isPreventa) {
      nuevaCantidad = Math.max(product.cantidad_minima_preventa, Math.min(product.cantidad_maxima_preventa, nuevaCantidad));
    } else {
      nuevaCantidad = Math.max(product.cantidad_minima, Math.min(product.cantidad_maxima, nuevaCantidad));
    }

    // Crear una copia del producto con el nuevo tipo de precio
    const productoActualizado = {
      ...product,
      es_preventa: isPreventa,
      cantidad: nuevaCantidad,
      uniqueId: generarUniqueId({ ...product, es_preventa: isPreventa }),
      imagen_principal: product.imagen_principal || currentImageUrl, // Priorizar la imagen existente
      colorImage: product.colorImage,
      image: product.image || currentImageUrl // Asegurar que image tenga un valor
    };

    // Actualizar el carrito
    cartStore.removeFromCart(product.uniqueId);
    cartStore.addToCart(productoActualizado);

    Swal.fire({
      title: "Precio actualizado",
      text: `Se ha cambiado al precio de ${isPreventa ? 'preventa' : 'regular'}${nuevaCantidad !== product.cantidad ? ` y la cantidad se ajustó a ${nuevaCantidad}` : ''}`,
      icon: "success",
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 3000
    });
  }
}

function updateQuantityWithoutPriceChange(product, newQuantity) {
  const currentImageUrl = getProductImage(product);

  // Crear una copia del producto con la nueva cantidad
  const updatedProduct = {
    ...product,
    cantidad: newQuantity,
    uniqueId: generarUniqueId(product),
    imagen_principal: product.imagen_principal || currentImageUrl,
    colorImage: product.colorImage,
    image: product.image || currentImageUrl
  };

  // Actualizar el carrito
  cartStore.removeFromCart(product.uniqueId);
  cartStore.addToCart(updatedProduct);
}
// Función finalizeOrder que llama a processOrder
const finalizeOrder = async () => {
  // Validaciones básicas antes de procesar el pedido
  if (items.value.length === 0) {
    Swal.fire({
      title: "Advertencia",
      text: "Tu carrito está vacío. Agrega productos antes de finalizar el pedido.",
      icon: "warning",
      confirmButtonText: "Aceptar",
    });
    return;
  }
  
  if (!isPaymentValid.value) {
    let warningMessage = "Por favor, selecciona un método de pago.";
    if (paymentMethod.value === 'qr') {
      warningMessage = "Por favor, sube el comprobante de pago antes de finalizar el pedido.";
    } else if (paymentMethod.value === 'in-person' && !selectedLocation.value) {
      warningMessage = "Por favor, selecciona una ubicación para el pago en instalaciones.";
    }
    Swal.fire({
      title: "Método de pago incompleto",
      text: warningMessage,
      icon: "warning",
      confirmButtonText: "Entendido",
    });
    return;
  }
  
  // Llamar a processOrder que ya tiene la lógica para enviar el total con descuento
  await processOrder();
};
function showToast(message, type = 'info') {
  Swal.fire({
    toast: true,
    position: 'top-end',
    icon: type,
    title: message,
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true
  });
}
</script>

<script>
// Añade estos métodos a tu componente existente
export default {
  methods: {
    // Método para seleccionar el método de pago
    selectPaymentMethod(method) {
      this.paymentMethod = method;
    },
    
    // Método para seleccionar la ubicación
    selectLocation(key) {
      this.selectedLocation = key;
      // Detener la propagación para evitar que se active el evento del contenedor padre
      event.stopPropagation();
    }
  }
}
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css');

/* Base Styles */
:root {
  --primary-color: #007bff;
  --primary-hover-color: #0069d9;
  --secondary-color: #6c757d;
  --success-color: #28a745;
  --danger-color: #dc3545;
  --light-color: #f8f9fa;
  --dark-color: #343a40;
  --border-radius: 8px;
  --box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
  --transition: all 0.3s ease;
  --header-height: 150px;
}

body {
  margin: 0;
  font-family: 'Roboto', sans-serif;
  color: #343a40;
  background-color: #f8f9fa;
  line-height: 1.6;
}

.checkout-container {
  max-width: 1480px;
  margin: 0 auto;
  padding: clamp(10px, 3vw, 20px);
  width: 100%;
  box-sizing: border-box;
  position: relative;
}

/* Logo Styles */
.logo-container {
  display: flex;
  align-items: center;
  margin-right: 15px;
}

.company-logo {
  height: clamp(30px, 5vw, 40px);
  width: auto;
  transition: all 0.3s ease;
}

/* Header Styles */
.checkout-header {
  position: sticky;
  top: 0;
  z-index: 1000;
  background-color: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border-radius: var(--border-radius);
  margin-bottom: 20px;
  padding: clamp(10px, 3vw, 15px);
  transition: all 0.3s ease;
  width: 100%;
}

.header-scrolled {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  transform: translateY(-5px);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 15px;
}

.header-left {
  display: flex;
  align-items: center;
  width: 100%;
  justify-content: flex-start;
}

.actions-container {
  display: flex;
  align-items: center;
  gap: 15px;
}

h1 {
  font-size: clamp(20px, 4vw, 28px);
  font-weight: 700;
  margin: 0;
  color: var(--primary-color);
  display: flex;
  align-items: center;
  gap: 10px;
}

.items-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: var(--primary-color);
  color: white;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  font-size: 14px;
  font-weight: normal;
}

.lock-icon {
  color: var(--primary-color);
  font-size: clamp(18px, 3vw, 24px);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    opacity: 0.7;
    transform: scale(1);
  }

  50% {
    opacity: 1;
    transform: scale(1.1);
  }

  100% {
    opacity: 0.7;
    transform: scale(1);
  }
}

/* Empty Cart Button */
.empty-cart-btn {
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 15px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.empty-cart-btn:hover:not(:disabled) {
  background-color: #c82333;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(220, 53, 69, 0.3);
}

.empty-cart-btn:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(220, 53, 69, 0.3);
}

.empty-cart-btn:disabled {
  background-color: #e9ecef;
  color: #6c757d;
  cursor: not-allowed;
}

/* Improved Mobile Progress Indicator */
.mobile-progress {
  margin-top: 15px;
}

.steps-indicator {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  position: relative;
}

.step-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;
  flex: 1;
  opacity: 0.7;
  z-index: 1;
}

.step-indicator.clickable {
  opacity: 1;
  cursor: pointer;
}

.step-indicator.clickable:hover .step-number-container {
  transform: translateY(-3px);
  box-shadow: 0 4px 8px rgba(0, 123, 255, 0.3);
}

.step-indicator::after {
  content: '';
  position: absolute;
  top: 20px;
  left: 50%;
  width: 100%;
  height: 2px;
  background-color: #f8f9fa;
  z-index: 0;
}

.step-indicator:last-child::after {
  display: none;
}

.step-number-container {
  position: relative;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
  transition: all 0.3s ease;
}

.step-number {
  font-weight: bold;
  font-size: clamp(16px, 2vw, 18px);
  transition: all 0.3s ease;
}

.check-icon {
  position: absolute;
  font-size: 16px;
  opacity: 0;
  transform: scale(0);
  transition: all 0.3s ease;
}

.step-indicator.completed .check-icon {
  opacity: 1;
  transform: scale(1);
}

.step-label {
  font-size: 12px;
  color: #6c757d;
  text-align: center;
  transition: all 0.3s ease;
}

.step-indicator.active .step-number-container {
  background-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25);
}

.step-indicator.active .step-number {
  color: white;
}

.step-indicator.active .step-label {
  color: var(--primary-color);
  font-weight: 600;
}

.step-indicator.completed .step-number-container {
  background-color: #28a745;
  color: white;
}

.step-indicator.completed .step-number {
  opacity: 0;
}

.step-indicator.completed .step-label {
  color: #28a745;
}

.step-indicator.completed::after {
  background-color: #28a745;
}

/* New tooltip for step indicators */
.step-tooltip {
  position: absolute;
  bottom: -30px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 12px;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
  white-space: nowrap;
  z-index: 10;
}

.step-indicator.clickable:hover .step-tooltip {
  opacity: 1;
}

/* Animation for clicked step */
.step-clicked .step-number-container {
  animation: clickPulse 0.3s ease;
}

@keyframes clickPulse {
  0% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.2);
  }

  100% {
    transform: scale(1);
  }
}

/* Progress Bar */
.progress-bar {
  height: 8px;
  background-color: #f8f9fa;
  border-radius: 4px;
  overflow: hidden;
  margin-top: 5px;
}

.progress {
  height: 100%;
  background-color: var(--primary-color);
  transition: width 0.5s ease;
  background-image: linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-size: 1rem 1rem;
  animation: progress-bar-stripes 1s linear infinite;
}

@keyframes progress-bar-stripes {
  from {
    background-position: 1rem 0;
  }

  to {
    background-position: 0 0;
  }
}

/* Layout Styles */
.checkout-content {
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 30px;
  transition: all 0.3s ease;
  padding-top: 20px;
}

.main-content,
.order-summary {
  background: white;
  border-radius: 8px;
  padding: clamp(15px, 3vw, 30px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.main-content {
  animation: fadeIn 0.5s ease;
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

/* Checkout Steps */
.checkout-steps {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.step {
  border-bottom: 2px solid #f8f9fa;
  padding-bottom: 20px;
  transition: all 0.3s ease;
  position: relative;
}

.step:last-child {
  border-bottom: none;
}

.active-step {
  border-left: 4px solid var(--primary-color);
  padding-left: 15px;
  background-color: #f8f9fa;
  border-radius: 8px;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }

  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.completed-step .step-number {
  background: #28a745;
}

.step-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  cursor: pointer;
  padding: 10px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.step-header:hover {
  background-color: rgba(0, 123, 255, 0.05);
}

.step-header-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.step-header-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.step-number-wrapper {
  position: relative;
  background: var(--primary-color);
  color: white;
  width: 40px;
  height: 40px;
  min-width: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: clamp(16px, 2vw, 18px);
  font-weight: bold;
  transition: all 0.3s ease;
}

.step-number-wrapper .check-icon {
  position: absolute;
  opacity: 0;
  transform: scale(0);
  transition: all 0.3s ease;
}

.completed-step .step-number-wrapper .check-icon {
  opacity: 1;
  transform: scale(1);
}

.completed-step .step-number-wrapper .step-number {
  opacity: 0;
}

.completed-step .step-number-wrapper {
  background: #28a745;
}

h2 {
  margin: 0;
  font-size: clamp(18px, 3vw, 22px);
  font-weight: 600;
  color: var(--primary-color);
}

.edit-button {
  color: var(--primary-color);
  background: none;
  border: none;
  cursor: pointer;
  font-size: clamp(14px, 2vw, 16px);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 8px 12px;
  border-radius: 8px;
}

.edit-button:hover {
  color: var(--primary-hover-color);
  background-color: rgba(0, 123, 255, 0.1);
  transform: translateY(-2px);
}

.edit-button:active {
  transform: translateY(0);
}

.step-content {
  padding-left: 60px;
  transition: all 0.3s ease;
}

.info-card {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 15px;
  border-left: 4px solid var(--primary-color);
  transition: all 0.3s ease;
}

.info-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.delivery-info-display p {
  margin: 10px 0;
  color: #000000;
  font-size: clamp(14px, 2vw, 16px);
  display: flex;
  align-items: center;
  gap: 10px;
}

.delivery-info-display p i {
  color: var(--primary-color);
  width: 20px;
  min-width: 20px;
}

/* Empty Cart Message */
.empty-cart-message,
.empty-summary {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px;
  text-align: center;
  background-color: #f8f9fa;
  border-radius: 8px;
  margin: 20px 0;
}

.empty-cart-message i,
.empty-summary i {
  font-size: 48px;
  color: #adb5bd;
  margin-bottom: 15px;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-20px);
  }
  60% {
    transform: translateY(-10px);
  }
}

.empty-cart-message p,
.empty-summary p {
  color: #6c757d;
  font-size: 18px;
  margin-bottom: 20px;
}

.go-shopping-btn {
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.go-shopping-btn:hover {
  background-color: var(--primary-hover-color);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 123, 255, 0.3);
}

.go-shopping-btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(0, 123, 255, 0.3);
}

/* Form Styles */
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group.full-width {
  grid-column: span 2;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #343a40;
  font-size: clamp(14px, 2.5vw, 16px);
}

.input-wrapper {
  position: relative;
  width: 100%;
}

.input-icon {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #6b7280;
  font-size: 20px;
  transition: color 0.3s ease;
}

input {
  width: 100%;
  padding: 14px 15px 14px 45px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: clamp(16px, 2.5vw, 18px);
  transition: all 0.3s ease;
  box-sizing: border-box;
  background-color: #fff;
  min-height: 56px;
}

.responsive-input {
  font-size: 16px;
  min-height: 56px;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.05);
}

input:focus {
  border-color: var(--primary-color);
  outline: none;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25);
}

input:focus+.input-icon {
  color: var(--primary-color);
}

.input-focus-indicator {
  position: absolute;
  bottom: -2px;
  left: 0;
  height: 2px;
  width: 0;
  background-color: var(--primary-color);
  transition: width 0.3s ease;
}

input:focus~.input-focus-indicator {
  width: 100%;
}

.input-error {
  border-color: var(--danger-color);
  background-color: #fef2f2;
}

.input-error:focus {
  box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.25);
}

.error-message {
  color: var(--danger-color);
  font-size: 0.8rem;
  margin-top: 5px;
  display: block;
  position: absolute;
}

/* Button Styles */
.step-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 25px;
  flex-wrap: wrap;
  gap: 15px;
}

.next-button,
.prev-button {
  padding: clamp(10px, 2.5vw, 12px) clamp(20px, 3.5vw, 25px);
  border-radius: 8px;
  font-size: clamp(15px, 2.5vw, 17px);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.next-button {
  background-color: var(--primary-color);
  color: white;
  border: none;
}

.next-button:hover:not(:disabled) {
  background-color: var(--primary-hover-color);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 123, 255, 0.3);
}

.next-button:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(0, 123, 255, 0.3);
}

.prev-button {
  background-color: #f8f9fa;
  color: #000000;
  border: 1px solid #dee2e6;
}

.prev-button:hover:not(:disabled) {
  background-color: #e9ecef;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.prev-button:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.next-button:disabled,
.prev-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* Product List Styles */
.product-list {
  margin-top: 1px;
}

.product-item {
  display: flex;
  gap: 20px;
  padding: 20px;
  border-bottom: 2px solid #f8f9fa;
  transition: all 0.3s ease;
  border-radius: 8px;
}

.product-item:hover {
  background-color: #f8f9fa;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
}

.product-item:last-child {
  border-bottom: none;
}

.product-image-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
}

.product-image {
  width: 180px;
  height: 140px;
  object-fit: contain;
  border-radius: 8px;
  transition: transform 0.3s ease;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.product-image:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
}

.color-indicator {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-top: 8px;
  font-size: 14px;
  color: #666;
}

.color-circle {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 1px solid #ccc;
  display: inline-block;
}

.color-name {
  font-size: 14px;
}

.product-info {
  flex: 1;
  min-width: 0;
}

.product-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
  flex-wrap: wrap;
  gap: 10px;
}

.product-info h3 {
  margin: 0;
  font-size: clamp(16px, 3vw, 20px);
  font-weight: 600;
  color: #343a40;
}

.specs {
  color: #28a745;
  margin: 0 0 10px 0;
  font-size: clamp(12px, 2vw, 14px);
}

/* New styles for the enhanced price type selector */
.price-type-container {
  margin-bottom: 20px;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.price-type-tabs {
  display: flex;
  width: 100%;
  border-bottom: 1px solid #e0e0e0;
}

.tab-btn {
  flex: 1;
  padding: 12px;
  background-color: #f5f5f5;
  border: none;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #666;
}

.tab-btn.active {
  background-color: white;
  color: #0288d1;
  box-shadow: inset 0 -3px 0 #0288d1;
}

.tab-btn:first-child.active {
  color: #689f38;
  box-shadow: inset 0 -3px 0 #689f38;
}

.tab-btn:hover:not(:disabled) {
  background-color: #e9e9e9;
}

.tab-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.price-type-content {
  padding: 15px;
  background-color: white;
}

.current-price-card {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin-bottom: 15px;
}

.price-card-header {
  padding: 10px 15px;
  color: white;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: #689f38;
}

.price-card-header i {
  font-size: 16px;
}

.price-type-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  color: white;
}

.price-type-badge.preventa {
  background-color: #0288d1;
}

.price-type-badge.regular {
  background-color: #689f38;
}

.price-card-body {
  padding: 15px;
}

.price-row {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  border-bottom: 1px solid #f0f0f0;
}

.price-row:last-child {
  border-bottom: none;
}

.price-label {
  color: #666;
}

.price-value {
  font-weight: 600;
  color: #333;
}

.price-value.total {
  font-size: 18px;
  color: #0288d1;
}

.price-comparison {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin-top: 15px;
}

.comparison-header {
  padding: 10px 15px;
  background-color: #f5f5f5;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #333;
}

.comparison-body {
  padding: 15px;
}

.comparison-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.comparison-item {
  flex: 1;
  text-align: center;
  padding: 10px;
  background-color: #f9f9f9;
  border-radius: 8px;
}

.comparison-divider {
  padding: 0 15px;
  font-weight: bold;
  color: #666;
}

.comparison-label {
  font-weight: 600;
  margin-bottom: 5px;
  color: #666;
}

.comparison-value {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 5px;
}

.comparison-range {
  font-size: 13px;
  color: #666;
}

.savings-info {
  margin-top: 15px;
  padding: 10px;
  background-color: #e8f5e9;
  border-radius: 8px;
  color: #2e7d32;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
}

.savings-info span {
  font-weight: 700;
}

.model-info {
  margin-bottom: 20px;
}

.model-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background-color: #f3e5f5;
  color: #7b1fa2;
  border-radius: 6px;
  font-weight: 600;
  font-size: 14px;
}

.quantity-control-section {
  margin-top: 20px;
}

.quantity-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.quantity-label>span:first-child {
  font-weight: 600;
  color: #333;
}

.quantity-status {
  font-size: 13px;
  padding: 4px 10px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 6px;
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
  gap: 15px;
}

.quantity-selector {
  display: flex;
  align-items: center;
  background-color: #f5f5f5;
  border-radius: 8px;
  padding: 4px;
}

.quantity-btn {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  border: none;
  background-color: white;
  color: #333;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.quantity-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.quantity-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.quantity-input-container {
  width: 60px;
  padding: 0 10px;
}

.quantity-input {
  width: 100%;
  text-align: center;
  border: none;
  background: transparent;
  font-size: 18px;
  font-weight: 600;
  color: #333;
  padding: 8px 0;
}

.quantity-input::-webkit-inner-spin-button,
.quantity-input::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.quantity-input:focus {
  outline: none;
}

.remove-btn {
  background-color: #f44336;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
}

.remove-btn:hover {
  background-color: #d32f2f;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(244, 67, 54, 0.3);
}

/* Coupon Section */
.coupon-section {
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.coupon-input-group {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}

.coupon-input {
  flex: 1;
  min-width: 200px;
}

.apply-coupon-btn {
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.apply-coupon-btn:hover:not(:disabled) {
  background-color: var(--primary-hover-color);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 123, 255, 0.3);
}

.apply-coupon-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.coupon-message {
  margin-top: 15px;
  padding: 10px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.coupon-message.error-message {
  background-color: #f8d7da;
  color: var(--danger-color);
}

.coupon-message:not(.error-message) {
  background-color: #d4edda;
  color: var(--success-color);
}

.discount-info {
  margin-top: 15px;
  padding: 15px;
  background-color: #d4edda;
  border-radius: 8px;
  border-left: 4px solid var(--success-color);
}

.discount-info p {
  margin: 5px 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.remove-coupon-btn {
  background-color: var(--danger-color);
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.remove-coupon-btn:hover {
  background-color: #c82333;
  transform: translateY(-2px);
}

/* Payment Options */
.payment-options {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.payment-option {
  padding: 15px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.payment-option:hover {
  border-color: var(--primary-color);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.payment-option.selected {
  border-color: var(--primary-color);
  background-color: #f0f8ff;
}

.payment-option-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
}

.payment-option-header input[type="radio"] {
  margin: 0;
}

.payment-option-header label {
  font-weight: 600;
  font-size: clamp(14px, 2.5vw, 16px);
  color: #343a40;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
}

.payment-details {
  padding-left: 25px;
}

.qr-payment-image {
  margin: 15px 0;
  display: flex;
  justify-content: center;
}

.qr-payment-image img {
  width: 180px;
  height: 180px;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.voucher-upload {
  margin-top: 15px;
}

.file-upload-container {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.file-input {
  opacity: 0;
  position: absolute;
  width: 100%;
  height: 100%;
  cursor: pointer;
}

.file-upload-button {
  background-color: var(--primary-color);
  color: white;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.file-upload-button:hover {
  background-color: var(--primary-hover-color);
  transform: translateY(-2px);
}

.file-name {
  color: #6c757d;
  font-size: 14px;
}

.voucher-preview {
  margin-top: 15px;
  position: relative;
  display: inline-block;
}

.voucher-preview img {
  max-width: 200px;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.remove-voucher-btn {
  position: absolute;
  top: -10px;
  right: -10px;
  background-color: var(--danger-color);
  color: white;
  border: none;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.remove-voucher-btn:hover {
  background-color: #c82333;
  transform: scale(1.1);
}

/* Location selector - REDUCED SIZE */
.location-selector {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 15px;
}

.location-option {
  padding: 8px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 13px;
}

.location-option:hover {
  border-color: var(--primary-color);
}

.location-option.selected {
  border-color: var(--primary-color);
  background-color: #f0f8ff;
}

.location-option input[type="radio"] {
  margin-right: 8px;
}

.location-option label {
  cursor: pointer;
  font-weight: 500;
  font-size: 13px;
}

.store-info {
  margin-top: 15px;
  padding: 12px;
  background-color: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid var(--primary-color);
  font-size: 13px;
}

.store-info-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 10px;
}

.store-info-item i {
  color: var(--primary-color);
  font-size: 14px;
  margin-top: 2px;
}

.store-info-item h4 {
  margin: 0 0 3px 0;
  font-size: 13px;
  color: #343a40;
}

.store-info-item p {
  margin: 0;
  color: #000000;
  font-size: 12px;
}

.checkout-button {
  background-color: var(--success-color);
  color: white;
  border: none;
  padding: clamp(12px, 2.5vw, 15px) clamp(25px, 3.5vw, 30px);
  border-radius: 8px;
  font-size: clamp(16px, 3vw, 18px);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  margin-top: 20px;
}

.checkout-button:hover:not(:disabled) {
  background-color: #218838;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(40, 167, 69, 0.3);
}

.checkout-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Order Summary - FIXED STICKY POSITION */
.order-summary {
  position: sticky;
  top: calc(var(--header-height) + 20px);
  height: fit-content;
  transition: all 0.3s ease;
  align-self: flex-start;
}

.summary-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px;
  background-color: var(--primary-color);
  color: white;
  border-radius: 8px 8px 0 0;
  cursor: pointer;
  transition: all 0.3s ease;
}

.summary-header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.summary-header h2 {
  font-size: clamp(18px, 3vw, 20px);
  margin: 0;
  color: white;
}

.summary-badge {
  background-color: white;
  color: var(--primary-color);
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 14px;
}

.toggle-summary-btn {
  width: 44px;
  height: 44px;
  min-width: 44px;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: white;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 50%;
}

.toggle-summary-btn:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.toggle-summary-btn:active {
  transform: scale(0.95);
}

.summary-content {
  padding: 20px;
  border: 2px solid #e5e7eb;
  border-top: none;
  border-radius: 0 0 8px 8px;
  transition: all 0.3s ease;
}

.summary-items {
  margin-bottom: 20px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #e5e7eb;
  font-size: clamp(14px, 2vw, 16px);
}

.summary-item:last-child {
  border-bottom: none;
}

/* Fixed price alignment - ensuring "Bs" stays on the same line */
.price-value {
  white-space: nowrap;
  text-align: right;
  min-width: 100px;
}

.discount-item {
  color: var(--success-color);
}

.total {
  display: flex;
  justify-content: space-between;
  padding: 15px 0;
  font-weight: bold;
  font-size: clamp(16px, 3vw, 18px);
  border-top: 2px solid #e5e7eb;
}

.total-amount {
  color: var(--primary-color);
  white-space: nowrap;
}

.mini-cart-preview {
  margin-top: 20px;
  border-top: 1px solid #e5e7eb;
  padding-top: 15px;
}

.mini-cart-scroll {
  max-height: 200px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--primary-color) #f8f9fa;
}

.mini-cart-item {
  display: flex;
  gap: 15px;
  padding: 10px 0;
  border-bottom: 1px solid #e5e7eb;
}

.mini-cart-image {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
}

.mini-cart-details {
  flex: 1;
}

.mini-cart-name {
  font-weight: 500;
  margin: 0 0 5px 0;
  font-size: 14px;
}

.mini-cart-price {
  font-weight: 600;
  color: var(--primary-color);
  margin: 0;
  font-size: 14px;
  white-space: nowrap;
}

.mini-cart-unit-price {
  color: #000000;
  font-size: 12px;
  margin: 5px 0 0 0;
  white-space: nowrap;
}

.checkout-progress {
  margin-top: 20px;
}

.progress-text {
  text-align: center;
  margin-top: 10px;
  color: #6c757d;
  font-size: 14px;
}

.terms {
  font-size: 12px;
  color: #6c757d;
  margin-top: 20px;
  text-align: center;
}

.terms a {
  color: var(--primary-color);
  text-decoration: none;
}

.terms a:hover {
  text-decoration: underline;
}

.mobile-finalize-container {
  margin-top: 20px;
}

.mobile-finalize-button {
  width: 100%;
  background-color: var(--success-color);
  color: white;
  border: none;
  padding: 15px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.mobile-finalize-button:hover:not(:disabled) {
  background-color: #218838;
  transform: translateY(-2px);
}

.mobile-finalize-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.order-finalized {
  text-align: center;
  padding: 30px;
}

.success-animation {
  font-size: 60px;
  color: var(--success-color);
  margin-bottom: 20px;
  animation: successBounce 0.5s ease;
}

@keyframes successBounce {
  0% {
    transform: scale(0);
  }

  50% {
    transform: scale(1.2);
  }

  100% {
    transform: scale(1);
  }
}

.order-finalized h3 {
  color: var(--success-color);
  font-size: 24px;
  margin-bottom: 20px;
}

.order-finalized p {
  color: #6c757d;
  font-size: 16px;
  margin-bottom: 20px;
}

.whatsapp-button {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background-color: #25D366;
  color: white;
  padding: 12px 20px;
  border-radius: 8px;
  text-decoration: none;
  transition: all 0.3s ease;
}

.whatsapp-button:hover {
  background-color: #20bd57;
  transform: translateY(-2px);
}

.qr-code {
  margin-top: 30px;
}

.qr-code img {
  width: 150px;
  height: 150px;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.qr-code p {
  margin-top: 15px;
  font-size: 14px;
}

/* New Mobile Navigation Controls */
.mobile-nav-controls {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: white;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  padding: 10px 15px;
  z-index: 990;
  transition: all 0.3s ease;
}

.nav-buttons-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}

.mobile-nav-btn {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  border: none;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.prev-btn {
  background-color: #6c757d;
}

.next-btn {
  background-color: var(--primary-color);
}

.checkout-btn {
  background-color: var(--success-color);
}

.mobile-nav-btn:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.mobile-nav-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.mobile-cart-btn {
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 30px;
  padding: 8px 15px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  flex: 1;
  justify-content: center;
  position: relative;
}

.mobile-cart-btn:hover {
  background-color: var(--primary-hover-color);
  transform: translateY(-2px);
}

.mobile-cart-btn .cart-count {
  position: absolute;
  top: -8px;
  right: -8px;
  background-color: var(--danger-color);
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.cart-total {
  font-weight: 600;
  white-space: nowrap;
}

/* Modal Styles */
.modal-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
}

.modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
  position: relative;
  animation: modalFadeIn 0.3s ease;
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.modal-header h3 {
  margin: 0;
  font-size: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.close-modal {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #6c757d;
  transition: all 0.3s ease;
}

.close-modal:hover {
  color: var(--danger-color);
}

.modal-body {
  margin-bottom: 20px;
}

.modal-body p {
  margin: 10px 0;
  color: #000000;
}

.modal-footer {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  flex-wrap: wrap;
}

.cancel-btn,
.confirm-btn {
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.cancel-btn {
  background-color: #f8f9fa;
  color: #000000;
  border: 1px solid #dee2e6;
}

.cancel-btn:hover {
  background-color: #e9ecef;
  transform: translateY(-2px);
}

.confirm-btn {
  background-color: var(--danger-color);
  color: white;
  border: none;
}

.confirm-btn:hover {
  background-color: #c82333;
  transform: translateY(-2px);
}

.login-options {
  justify-content: space-between;
}

.guest-btn,
.login-btn,
.register-btn {
  padding: 10px 15px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  justify-content: center;
}

.guest-btn {
  background-color: #f8f9fa;
  color: #000000;
  border: 1px solid #dee2e6;
}

.guest-btn:hover {
  background-color: #e9ecef;
}

.login-btn {
  background-color: var(--primary-color);
  color: white;
  border: none;
}

.login-btn:hover {
  background-color: var(--primary-hover-color);
}

.register-btn {
  background-color: var(--success-color);
  color: white;
  border: none;
}

.register-btn:hover {
  background-color: #218838;
}

/* Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-content,
.modal-leave-active .modal-content {
  transition: all 0.3s ease;
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  transform: scale(0.9);
}

/* Fade transition for summary content */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Accessibility */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

/* Media Queries */
@media (max-width: 768px) {
  .checkout-container {
    padding: 10px;
    padding-bottom: 70px;
    /* Space for fixed navigation */
  }

  .checkout-content {
    grid-template-columns: 1fr;
    padding-top: 0;
  }

  .order-summary {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    top: auto;
    z-index: 990;
    border-radius: 16px 16px 0 0;
    box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
    padding: 0;
    transform: translateY(calc(100% - 60px));
    transition: transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    background-color: white;
  }

  .order-summary.summary-expanded {
    transform: translateY(0);
  }

  .summary-header {
    border-radius: 16px 16px 0 0;
    padding: 15px;
    margin-bottom: 0;
  }

  .summary-content {
    border: none;
    padding: 15px;
    max-height: 70vh;
    overflow-y: auto;
  }

  .checkout-header {
    padding: 10px;
  }

  .header-content {
    flex-direction: column;
    align-items: flex-start;
  }

  .actions-container {
    width: 100%;
    justify-content: space-between;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .form-group.full-width {
    grid-column: span 1;
  }

  .step-content {
    padding-left: 0;
  }

  .step-header {
    padding: 5px;
  }

  .product-item {
    flex-direction: column;
    padding: 15px;
  }

  .product-image {
    width: 100%;
    height: auto;
    max-width: 200px;
    margin: 0 auto;
  }

  .quantity-controls {
    justify-content: space-between;
  }

  .desktop-only {
    display: none;
  }

  .mobile-only {
    display: block;
  }

  .checkout-button {
    width: 100%;
    margin-top: 15px;
  }

  .step-actions {
    flex-direction: column;
    gap: 10px;
  }

  .next-button,
  .prev-button {
    width: 100%;
  }

  /* Fix for toggle summary button on mobile */
  .toggle-summary-btn {
    width: 44px;
    height: 44px;
    min-width: 44px;
    min-height: 44px;
    font-size: 20px;
  }

  /* Improve mini cart scrolling */
  .mini-cart-scroll {
    padding-bottom: 15px;
    display: flex;
    gap: 10px;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
  }

  .mini-cart-item {
    flex: 0 0 auto;
    width: 150px;
    scroll-snap-align: start;
  }

  /* Adjust bottom padding when summary is expanded */
  .summary-open {
    padding-bottom: 0;
  }

  /* Ensure prices always stay in a single line on mobile */
  .summary-item {
    display: flex;
    align-items: center;
  }

  .price-value {
    flex-shrink: 0;
  }

  /* Responsive comparison row */
  .comparison-row {
    flex-direction: column;
    gap: 15px;
  }

  .comparison-divider {
    padding: 10px 0;
  }
}

@media (min-width: 769px) {
  .mobile-only {
    display: none;
  }

  .desktop-only {
    display: block;
  }

  .mobile-nav-controls {
    display: none;
  }
}

@media (max-width: 480px) {
  h1 {
    font-size: 20px;
  }

  .step-number-wrapper {
    width: 35px;
    height: 35px;
    font-size: 16px;
  }

  h2 {
    font-size: 18px;
  }

  .edit-button {
    font-size: 14px;
    padding: 6px 10px;
  }

  .input-icon {
    font-size: 18px;
  }

  input {
    font-size: 16px;
    padding: 12px 12px 12px 40px;
  }

  .coupon-input-group {
    flex-direction: column;
  }

  .apply-coupon-btn {
    width: 100%;
  }

  /* Improved touch targets for mobile */
  .quantity-btn,
  .remove-btn,
  .apply-coupon-btn,
  .toggle-summary-btn {
    min-height: 44px;
    min-width: 44px;
  }

  /* Responsive input fields */
  .responsive-input {
    font-size: clamp(16px, 4vw, 18px);
    height: clamp(44px, 8vw, 56px);
  }

  /* Smaller payment option buttons */
  .payment-option {
    padding: 10px;
  }

  .payment-option-header label {
    font-size: 14px;
  }

  .payment-details {
    padding-left: 15px;
    font-size: 13px;
  }
}

/* Touch-friendly improvements */
@media (hover: none) {
  .next-button,
  .prev-button,
  .apply-coupon-btn,
  .remove-coupon-btn,
  .quantity-btn,
  .remove-btn,
  .checkout-button {
    padding: 12px 20px;
  }

  input,
  select {
    padding: 15px 15px 15px 45px;
  }

  .payment-option label {
    padding: 10px 0;
  }
}

/* Reduced motion preferences */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

/* Back Button Styles */
.back-button {
  background: none;
  border: none;
  color: var(--primary-color);
  font-size: 20px;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  margin-right: 10px;
}

.back-button:hover {
  background-color: rgba(0, 123, 255, 0.1);
  transform: translateY(-2px);
}

.back-button:active {
  transform: translateY(0);
}

/* Make logo clickable */
.logo-container {
  cursor: pointer;
  transition: transform 0.3s ease;
}

.logo-container:hover {
  transform: scale(1.05);
}

/* Improve mobile header layout */
@media (max-width: 768px) {
  .header-left {
    display: flex;
    align-items: center;
    width: 100%;
    justify-content: flex-start;
  }
  
  .company-logo {
    height: 30px;
  }
  
  .back-button {
    font-size: 18px;
  }
}

/* Improved mobile UX */
@media (max-width: 480px) {
  .checkout-container {
    padding-bottom: 80px;
  }
  
  .step-header {
    padding: 12px 8px;
  }
  
  .step-header-left {
    gap: 10px;
  }
  
  .step-number-wrapper {
    width: 32px;
    height: 32px;
    min-width: 32px;
  }
  
  .toggle-summary-btn, 
  .mobile-nav-btn,
  .quantity-btn,
  .remove-btn {
    min-height: 48px;
    min-width: 48px;
  }
  
  .mobile-nav-controls {
    padding: 12px;
  }
  
  .nav-buttons-container {
    gap: 12px;
  }
  
  /* Improve form inputs for mobile */
  .responsive-input {
    font-size: 16px;
    padding: 14px 14px 14px 45px;
  }
  
  /* Improve scrolling experience */
  .mini-cart-scroll {
    -webkit-overflow-scrolling: touch;
    scroll-padding: 10px;
  }
  
  /* Better tap targets */
  .payment-option-header,
  .location-option {
    padding: 12px;
  }
}
</style>

<style>
/* Estilos para los radio buttons personalizados */
.custom-radio {
  position: relative;
  display: inline-block;
  width: 20px;
  height: 20px;
  margin-right: 10px;
  cursor: pointer;
}

.radio-input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.radio-checkmark {
  position: absolute;
  top: 0;
  left: 0;
  width: 20px;
  height: 20px;
  background-color: #fff;
  border: 2px solid #ccc;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.radio-input:checked ~ .radio-checkmark {
  border-color: var(--primary-color);
}

.radio-checkmark:after {
  content: "";
  position: absolute;
  display: none;
  top: 50%;
  left: 50%;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--primary-color);
  transform: translate(-50%, -50%);
}

.radio-input:checked ~ .radio-checkmark:after {
  display: block;
}

/* Estilos para las opciones de pago */
.payment-option {
  padding: 15px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 15px;
}

.payment-option:hover {
  border-color: var(--primary-color);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.payment-option.selected {
  border-color: var(--primary-color);
  background-color: #f0f8ff;
}

.payment-option-header {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.payment-label {
  font-weight: 600;
  font-size: 16px;
  color: #343a40;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
}

.payment-details {
  padding-left: 30px;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Estilos para las opciones de ubicación */
.location-selector {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 15px;
}

.location-option {
  display: flex;
  align-items: center;
  padding: 10px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.location-option:hover {
  border-color: var(--primary-color);
  background-color: rgba(0, 123, 255, 0.05);
}

.location-option.selected {
  border-color: var(--primary-color);
  background-color: #f0f8ff;
}

.location-radio {
  margin-right: 8px;
}

.location-label {
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
}

/* Estilos para la información de la tienda */
.store-info {
  margin-top: 15px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid var(--primary-color);
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Estilos responsivos */
@media (max-width: 768px) {
  .payment-details {
    padding-left: 15px;
  }
  
  .payment-label {
    font-size: 15px;
  }
  
  .location-option {
    padding: 8px;
  }
}

@media (max-width: 480px) {
  .custom-radio {
    width: 18px;
    height: 18px;
  }
  
  .radio-checkmark {
    width: 18px;
    height: 18px;
  }
  
  .radio-checkmark:after {
    width: 8px;
    height: 8px;
  }
  
  .payment-label {
    font-size: 14px;
  }
  
  .location-label {
    font-size: 13px;
  }
}
</style>

