<template>
  <div class="checkout-container">
    <!-- Sticky Mobile Header -->
    <header class="checkout-header" :class="{ 'header-scrolled': isScrolled }">
      <div class="header-content">
        <div class="header-left">
          <div class="logo-container">
            <img src="../../public/logo/Logo Neofetch PNG.png" alt="Logo de la empresa" class="company-logo" />
          </div>
          
        </div>
        <h1>Finalizar Pedido <span class="items-badge">{{ totalItems }}</span></h1>
        <div class="actions-container">
          <button @click="emptyCart" class="empty-cart-btn" :disabled="items.length === 0">
            <i class="fas fa-trash-alt"></i> <span class="btn-text">Vaciar</span>
          </button>
          <div class="lock-icon">
            <i class="fas fa-lock"></i>
          </div>
        </div>
      </div>

      <!-- Improved Mobile Progress Indicator -->
      <div class="mobile-progress">
        <div class="steps-indicator">
          <div v-for="(step, index) in checkoutSteps" :key="index" 
               :class="['step-indicator', {
                 'active': activeStep === index,
                 'completed': activeStep > index,
                 'clickable': index <= activeStep || (index === activeStep + 1 && checkoutSteps[activeStep].completed)
               }]" 
               @click="handleStepClick(index)">
            <div class="step-number-container">
              <span class="step-number">{{ index + 1 }}</span>
              <i v-if="activeStep > index" class="fas fa-check check-icon"></i>
            </div>
            <span class="step-label">{{ step.shortTitle || step.title }}</span>
            <div v-if="index <= activeStep || (index === activeStep + 1 && checkoutSteps[activeStep].completed)" class="step-tooltip">
              Ir al paso {{ index + 1 }}
            </div>
          </div>
        </div>
        <div class="progress-bar">
          <div class="progress" :style="{ width: progressPercentage + '%' }"></div>
        </div>
      </div>
    </header>

    <div class="checkout-content" :class="{ 'summary-open': showSummary }">
      <div class="main-content">
        <div class="checkout-steps">
          <!-- Step 1: Delivery Information -->
          <div class="step" :class="{ 'active-step': activeStep === 0, 'completed-step': activeStep > 0 }">
            <div class="step-header" @click="toggleStepVisibility(0)">
              <div class="step-header-left">
                <div class="step-number-wrapper">
                  <span class="step-number">1</span>
                  <i v-if="activeStep > 0" class="fas fa-check check-icon"></i>
                </div>
                <h2>Ubicación de Entrega</h2>
              </div>
              <div class="step-header-right">
                <button v-if="activeStep >= 0 && checkoutSteps[0].completed" @click.stop="toggleEdit(0)"
                  class="edit-button">
                  <i class="fas" :class="checkoutSteps[0].editing ? 'fa-save' : 'fa-edit'"></i>
                  <span class="btn-text">{{ checkoutSteps[0].editing ? 'Guardar' : 'Editar' }}</span>
                </button>
                <i v-if="activeStep !== 0" class="fas"
                  :class="stepsVisible[0] ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
              </div>
            </div>
            <div class="step-content" v-show="activeStep === 0 || (stepsVisible[0] && checkoutSteps[0].completed)">
              <div v-if="!checkoutSteps[0].editing && isDeliveryInfoComplete" class="delivery-info-display">
                <div class="info-card">
                  <p v-if="deliveryInfo.nombre"><i class="fas fa-user"></i> {{ deliveryInfo.nombre }} {{ deliveryInfo.apellido }}</p>
                  <p v-if="deliveryInfo.direccion"><i class="fas fa-map-marker-alt"></i> {{ deliveryInfo.direccion }}</p>
                  <p v-if="deliveryInfo.telefono"><i class="fas fa-phone"></i> {{ deliveryInfo.telefono }}</p>
                  <p v-if="deliveryInfo.email"><i class="fas fa-envelope"></i> {{ deliveryInfo.email }}</p>
                </div>
              </div>
              <div v-else class="form-grid">
                <div class="form-group">
                  <label for="nombre">Nombre *</label>
                  <div class="input-wrapper">
                    <i class="fas fa-user input-icon"></i>
                    <input 
                      id="nombre" 
                      v-model="deliveryInfo.nombre" 
                      placeholder="Ingrese su nombre" 
                      required 
                      class="responsive-input"
                      :class="{ 'input-error': !deliveryInfo.nombre && formSubmitted }"
                    >
                    <span class="input-focus-indicator"></span>
                    <span v-if="!deliveryInfo.nombre && formSubmitted" class="error-message">
                      Este campo es obligatorio
                    </span>
                  </div>
                </div>
                <div class="form-group">
                  <label for="apellido">Apellido *</label>
                  <div class="input-wrapper">
                    <i class="fas fa-user input-icon"></i>
                    <input 
                      id="apellido" 
                      v-model="deliveryInfo.apellido" 
                      placeholder="Ingrese su apellido" 
                      required 
                      class="responsive-input"
                      :class="{ 'input-error': !deliveryInfo.apellido && formSubmitted }"
                    >
                    <span class="input-focus-indicator"></span>
                    <span v-if="!deliveryInfo.apellido && formSubmitted" class="error-message">
                      Este campo es obligatorio
                    </span>
                  </div>
                </div>
                <div class="form-group full-width">
                  <label for="direccion">Dirección *</label>
                  <div class="input-wrapper">
                    <i class="fas fa-map-marker-alt input-icon"></i>
                    <input 
                      id="direccion" 
                      v-model="deliveryInfo.direccion" 
                      placeholder="Ingrese su dirección completa" 
                      required 
                      class="responsive-input"
                      :class="{ 'input-error': !deliveryInfo.direccion && formSubmitted }"
                    >
                    <span class="input-focus-indicator"></span>
                    <span v-if="!deliveryInfo.direccion && formSubmitted" class="error-message">
                      Este campo es obligatorio
                    </span>
                  </div>
                </div>
                <div class="form-group">
                  <label for="telefono">Teléfono *</label>
                  <div class="input-wrapper">
                    <i class="fas fa-phone input-icon"></i>
                    <input 
                      id="telefono" 
                      v-model="deliveryInfo.telefono" 
                      placeholder="Ingrese su número" 
                      required 
                      type="tel"
                      pattern="[0-9]*" 
                      inputmode="numeric" 
                      class="responsive-input"
                      :class="{ 'input-error': !deliveryInfo.telefono && formSubmitted }"
                    >
                    <span class="input-focus-indicator"></span>
                    <span v-if="!deliveryInfo.telefono && formSubmitted" class="error-message">
                      Este campo es obligatorio
                    </span>
                  </div>
                </div>
                <div class="form-group">
                  <label for="email">Email *</label>
                  <div class="input-wrapper">
                    <i class="fas fa-envelope input-icon"></i>
                    <input 
                      id="email" 
                      v-model="deliveryInfo.email" 
                      placeholder="Ingrese su email" 
                      required 
                      type="email" 
                      class="responsive-input"
                      :class="{ 'input-error': !deliveryInfo.email && formSubmitted }"
                    >
                    <span class="input-focus-indicator"></span>
                    <span v-if="!deliveryInfo.email && formSubmitted" class="error-message">
                      Este campo es obligatorio
                    </span>
                  </div>
                </div>
              </div>
              <div class="step-actions" v-if="activeStep === 0">
                <button @click="nextStep" class="next-button">
                  Continuar <i class="fas fa-arrow-right"></i>
                </button>
              </div>
            </div>
          </div>

          <!-- Step 2: Review Items -->
          <div class="step" :class="{ 'active-step': activeStep === 1, 'completed-step': activeStep > 1 }">
            <div class="step-header" @click="toggleStepVisibility(1)">
              <div class="step-header-left">
                <div class="step-number-wrapper">
                  <span class="step-number">2</span>
                  <i v-if="activeStep > 1" class="fas fa-check check-icon"></i>
                </div>
                <h2>Revise los Items y Envío</h2>
              </div>
              <div class="step-header-right">
                <i v-if="activeStep !== 1" class="fas"
                  :class="stepsVisible[1] ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
              </div>
            </div>
            <div class="step-content" v-show="activeStep === 1 || (stepsVisible[1] && checkoutSteps[1].completed)">
              <div v-if="items.length === 0" class="empty-cart-message">
                <i class="fas fa-shopping-cart"></i>
                <p>Tu carrito está vacío</p>
                <button @click="goShopping" class="go-shopping-btn">
                  <i class="fas fa-store"></i> Ir a comprar
                </button>
              </div>
              <div v-else class="product-list">
                <div v-for="product in items" :key="product.uniqueId" class="product-item">
                  <div class="product-image-container">
                    <img :src="product.image" :alt="product.nombre" class="product-image">
                  </div>
                  <div class="product-info">
                    <h3>{{ product.nombre }}</h3>
                    <p v-if="product.specs" class="specs">{{ product.specs }}</p>
                    <div class="price-container">
                      <p class="price">{{ formatPrice(product.precio * product.cantidad) }}</p>
                      <p class="unit-price">Precio unitario: {{ formatPrice(product.precio) }}</p>
                    </div>
                    <div class="product-details">
                      <div class="detail-item">
                        <span class="detail-label">Cantidad mínima:</span>
                        <span class="detail-value">{{ product.cantidad_minima }} und.</span>
                      </div>
                      <div class="detail-item">
                        <span class="detail-label">Cantidad máxima:</span>
                        <span class="detail-value">{{ product.cantidad_maxima }} und.</span>
                      </div>
                      <div class="detail-item" v-if="product.modelo">
                        <span class="detail-label">Modelo:</span>
                        <span class="detail-value">{{ product.modelo }}</span>
                      </div>
                      <div class="detail-item" v-if="product.color">
                        <span class="detail-label">Color:</span>
                        <span class="detail-value" :style="{ color: product.color }">{{ product.color }}</span>
                      </div>
                      <div class="detail-item" v-if="product.colorImage">
                        <span class="detail-label">Imagen del Color:</span>
                        <img :src="product.colorImage" alt="Color seleccionado" class="color-image" />
                      </div>
                    </div>
                    <div class="quantity-controls">
                      <div class="quantity-selector">
                        <button @click="decreaseQuantity(product)" :disabled="product.cantidad <= product.cantidad_minima" class="quantity-btn">
                          <i class="fas fa-minus"></i>
                        </button>
                        <span class="quantity">{{ product.cantidad }}</span>
                        <button @click="increaseQuantity(product)" :disabled="product.cantidad >= product.cantidad_maxima" class="quantity-btn">
                          <i class="fas fa-plus"></i>
                        </button>
                      </div>
                      <button @click="removeProduct(product)" class="remove-btn">
                        <i class="fas fa-trash"></i> <span class="btn-text">Eliminar</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div class="step-actions" v-if="activeStep === 1">
                <button @click="prevStep" class="prev-button">
                  <i class="fas fa-arrow-left"></i> Anterior
                </button>
                <button @click="nextStep" class="next-button" :disabled="items.length === 0">
                  Continuar <i class="fas fa-arrow-right"></i>
                </button>
              </div>
            </div>
          </div>

          <!-- Step 3: Coupon -->
          <div class="step" :class="{ 'active-step': activeStep === 2, 'completed-step': activeStep > 2 }">
            <div class="step-header" @click="toggleStepVisibility(2)">
              <div class="step-header-left">
                <div class="step-number-wrapper">
                  <span class="step-number">3</span>
                  <i v-if="activeStep > 2" class="fas fa-check check-icon"></i>
                </div>
                <h2>Cupón de Descuento</h2>
              </div>
              <div class="step-header-right">
                <i v-if="activeStep !== 2" class="fas"
                  :class="stepsVisible[2] ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
              </div>
            </div>
            <div class="step-content" v-show="activeStep === 2 || (stepsVisible[2] && checkoutSteps[2].completed)">
              <div class="coupon-section">
                <div class="form-group">
                  <label for="cupon">Código de Cupón</label>
                  <div class="coupon-input-group">
                    <div class="input-wrapper">
                      <i class="fas fa-tag input-icon"></i>
                      <input id="cupon" type="text" v-model="cuponForm.codigo" placeholder="Ingrese el código del cupón" class="coupon-input responsive-input" />
                      <span class="input-focus-indicator"></span>
                    </div>
                    <button @click="applyCoupon" class="apply-coupon-btn" :disabled="!cuponForm.codigo">
                      <i class="fas fa-check"></i> <span class="btn-text">Aplicar</span>
                    </button>
                  </div>
                </div>
                <p v-if="couponMessage" class="coupon-message" :class="{ 'error-message': couponError }">
                  <i :class="couponError ? 'fas fa-exclamation-circle' : 'fas fa-check-circle'"></i>
                  {{ couponMessage }}
                </p>
                <div v-if="cartStore.descuento > 0" class="discount-info">
                  <p><i class="fas fa-money-bill-wave"></i> Descuento aplicado: {{ formatPrice(cartStore.montoDescuento) }}</p>
                  <p v-if="cartStore.tipoDescuento === 'porcentaje'"><i class="fas fa-percentage"></i> Porcentaje de descuento: {{ cartStore.descuento }}%</p>
                  <button @click="removeCoupon" class="remove-coupon-btn">
                    <i class="fas fa-times"></i> <span class="btn-text">Eliminar Cupón</span>
                  </button>
                </div>
              </div>
              <div class="step-actions" v-if="activeStep === 2">
                <button @click="prevStep" class="prev-button">
                  <i class="fas fa-arrow-left"></i> Anterior
                </button>
                <button @click="nextStep" class="next-button">
                  Continuar <i class="fas fa-arrow-right"></i>
                </button>
              </div>
            </div>
          </div>

          <!-- Step 4: Payment Method -->
          <div class="step" :class="{ 'active-step': activeStep === 3, 'completed-step': activeStep > 3 }">
            <div class="step-header" @click="toggleStepVisibility(3)">
              <div class="step-header-left">
                <div class="step-number-wrapper">
                  <span class="step-number">4</span>
                  <i v-if="activeStep > 3" class="fas fa-check check-icon"></i>
                </div>
                <h2>Método de Pago</h2>
              </div>
              <div class="step-header-right">
                <i v-if="activeStep !== 3" class="fas"
                  :class="stepsVisible[3] ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
              </div>
            </div>
            <div class="step-content" v-show="activeStep === 3 || (stepsVisible[3] && checkoutSteps[3].completed)">
              <div class="payment-options">
                <div class="payment-option" :class="{ 'selected': paymentMethod === 'qr' }" @click="paymentMethod = 'qr'">
                  <div class="payment-option-header">
                    <input type="radio" id="qr-payment" name="payment-method" value="qr" v-model="paymentMethod">
                    <label for="qr-payment"><i class="fas fa-qrcode"></i> Pago por QR</label>
                  </div>
                  <div v-if="paymentMethod === 'qr'" class="payment-details">
                    <p>Escanea el siguiente código QR para realizar el pago:</p>
                    <div class="qr-payment-image">
                      <img src="https://placehold.co/300x300/png?text=QR+Code" alt="QR Code para pago">
                    </div>
                    <div class="voucher-upload">
                      <label for="voucher-file">Subir comprobante de pago (requerido)</label>
                      <div class="file-upload-container">
                        <input type="file" id="voucher-file" @change="handleFileUpload" accept="image/*" class="file-input" capture="environment">
                        <div class="file-upload-button">
                          <i class="fas fa-upload"></i> Seleccionar archivo
                        </div>
                        <span v-if="voucherFile" class="file-name">{{ voucherFile.name }}</span>
                      </div>
                      <div v-if="voucherPreview" class="voucher-preview">
                        <img :src="voucherPreview" alt="Vista previa del comprobante">
                        <button @click="removeVoucher" class="remove-voucher-btn">
                          <i class="fas fa-times"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="payment-option" :class="{ 'selected': paymentMethod === 'in-person' }" @click="paymentMethod = 'in-person'">
                  <div class="payment-option-header">
                    <input type="radio" id="in-person" name="payment-method" value="in-person" v-model="paymentMethod">
                    <label for="in-person"><i class="fas fa-store"></i> Pago en Instalaciones</label>
                  </div>
                  <div v-if="paymentMethod === 'in-person'" class="payment-details">
                    <p>Puedes realizar el pago directamente en nuestras instalaciones. Por favor selecciona una ubicación:</p>
                    <div class="location-selector">
                      <div v-for="(location, key) in locationOptions" :key="key" :class="['location-option', { 'selected': selectedLocation === key }]" @click="selectedLocation = key">
                        <input type="radio" :id="`location-${key}`" name="location" :value="key" v-model="selectedLocation">
                        <label :for="`location-${key}`">{{ location.name }}</label>
                      </div>
                    </div>
                    <div v-if="selectedLocation" class="store-info">
                      <div class="store-info-item">
                        <i class="fas fa-map-marker-alt"></i>
                        <div>
                          <h4>Dirección:</h4>
                          <p>{{ locationOptions[selectedLocation].address }}</p>
                        </div>
                      </div>
                      <div class="store-info-item">
                        <i class="fas fa-clock"></i>
                        <div>
                          <h4>Horario:</h4>
                          <p>{{ locationOptions[selectedLocation].hours }}</p>
                        </div>
                      </div>
                      <div class="store-info-item">
                        <i class="fas fa-phone"></i>
                        <div>
                          <h4>Teléfono:</h4>
                          <p>{{ locationOptions[selectedLocation].phone }}</p>
                        </div>
                      </div>
                      <div class="store-info-item">
                        <i class="fas fa-envelope"></i>
                        <div>
                          <h4>Email:</h4>
                          <p>{{ locationOptions[selectedLocation].email }}</p>
                        </div>
                      </div>
                      <div class="store-info-item">
                        <i class="fas fa-info-circle"></i>
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
                <button @click="prevStep" class="prev-button">
                  <i class="fas fa-arrow-left"></i> Anterior
                </button>
                <button @click="finalizeOrder" class="checkout-button" :disabled="!isPaymentValid">
                  <i class="fas fa-check-circle"></i> FINALIZAR PEDIDO
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
          <div class="toggle-summary-btn">
            <i class="fas" :class="showSummary ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
          </div>
        </div>

        <transition name="fade">
          <div class="summary-content" v-if="showSummary">
            <div v-if="items.length === 0" class="empty-summary">
              <i class="fas fa-shopping-cart"></i>
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
                    <img :src="product.image" :alt="product.nombre" class="mini-cart-image">
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
              <div class="progress-bar">
                <div class="progress" :style="{ width: progressPercentage + '%' }"></div>
              </div>
              <p class="progress-text">Paso {{ activeStep + 1 }} de {{ checkoutSteps.length }}</p>
            </div>
            <p class="terms">
              Al hacer clic en "Finalizar pedido", aceptas los
              <a href="/terminos-condiciones">términos y condiciones</a> del servicio.
            </p>
            <div class="mobile-finalize-container" v-if="activeStep === 3 && !orderFinalized">
              <button @click="finalizeOrder" class="mobile-finalize-button" :disabled="!isPaymentValid">
                <i class="fas fa-check-circle"></i> FINALIZAR PEDIDO
              </button>
            </div>
          </div>
        </transition>

        <div v-if="orderFinalized" class="order-finalized">
          <div class="success-animation">
            <i class="fas fa-check-circle"></i>
          </div>
          <h3>¡Gracias por tu pedido!</h3>
          <p>Puedes contactarnos por WhatsApp para cualquier consulta:</p>
          <a :href="whatsappLink" class="whatsapp-button">
            <i class="fab fa-whatsapp"></i> Contactar por WhatsApp
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
        <button v-if="activeStep > 0" @click="prevStep" class="mobile-nav-btn prev-btn">
          <i class="fas fa-arrow-left"></i>
        </button>
        <button @click="toggleSummary" class="mobile-cart-btn">
          <i class="fas fa-shopping-cart"></i>
          <span class="cart-count" v-if="items.length > 0">{{ items.length }}</span>
          <span class="cart-total">{{ formatPrice(totalAmount) }}</span>
        </button>
        <button v-if="activeStep < checkoutSteps.length - 1" @click="nextStep" class="mobile-nav-btn next-btn" :disabled="(activeStep === 1 && items.length === 0)">
          <i class="fas fa-arrow-right"></i>
        </button>
        <button v-else @click="finalizeOrder" class="mobile-nav-btn checkout-btn" :disabled="!isPaymentValid">
          <i class="fas fa-check"></i>
        </button>
      </div>
    </div>

    <!-- Modal de confirmación para vaciar carrito -->
    <transition name="modal">
      <div v-if="showEmptyCartModal" class="modal-container" aria-modal="true" role="dialog">
        <div class="modal-overlay" @click="cancelEmptyCart"></div>
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3><i class="fas fa-exclamation-triangle"></i> Vaciar carrito</h3>
            <button class="close-modal" @click="cancelEmptyCart" aria-label="Cerrar">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="modal-body">
            <p>¿Estás seguro de que deseas vaciar tu carrito? Esta acción no se puede deshacer.</p>
          </div>
          <div class="modal-footer">
            <button class="cancel-btn" @click="cancelEmptyCart">
              <i class="fas fa-times"></i> Cancelar
            </button>
            <button class="confirm-btn" @click="confirmEmptyCart">
              <i class="fas fa-trash-alt"></i> Vaciar carrito
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
            <h3><i class="fas fa-user-lock"></i> Iniciar sesión</h3>
            <button class="close-modal" @click="cancelLoginPrompt" aria-label="Cerrar">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="modal-body">
            <p>Para guardar tus datos de envío y facilitar futuras compras, te recomendamos iniciar sesión o registrarte.</p>
            <p>Sin embargo, puedes continuar como invitado si lo prefieres.</p>
          </div>
          <div class="modal-footer login-options">
            <button class="guest-btn" @click="continueAsGuest">
              <i class="fas fa-user"></i> Continuar como invitado
            </button>
            <button class="login-btn" @click="goToLogin">
              <i class="fas fa-sign-in-alt"></i> Iniciar sesión
            </button>
            <button class="register-btn" @click="goToRegister">
              <i class="fas fa-user-plus"></i> Registrarse
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
const activeStepClicked = ref(null); // Track which step was clicked for animation

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
  'santa-cruz': {
    name: 'Santa Cruz',
    address: 'Av. Irala #456, Zona Central, Santa Cruz',
    hours: 'Lunes a Viernes de 8:00 a 19:00, Sábados de 9:00 a 15:00',
    phone: '+591 3 3445566',
    email: 'tienda.santacruz@empresa.com',
    additionalInfo: 'Referencia: Centro Comercial Las Brisas, Local 12. Amplio estacionamiento disponible.'
  }
});

const activeStep = ref(0);
const checkoutSteps = ref([
  { id: 'delivery', title: 'Ubicación de Entrega', shortTitle: 'Entrega', editable: true, editing: false, completed: false },
  { id: 'review', title: 'Revise los Items y Envío', shortTitle: 'Items', editable: false, editing: false, completed: false },
  { id: 'coupon', title: 'Cupón de Descuento', shortTitle: 'Cupón', editable: false, editing: false, completed: false },
  { id: 'payment', title: 'Método de Pago', shortTitle: 'Pago', editable: false, editing: false, completed: false }
]);

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

// Check for redirect from login page
const checkRedirectFromLogin = () => {
  const redirectParam = new URLSearchParams(window.location.search).get('fromLogin');
  if (redirectParam === 'true' && !isAuthenticated.value) {
    showLoginPrompt.value = true;
  }
};

onMounted(() => {
  if (themeStore.currentDepartment === 'la-paz' || themeStore.currentDepartment === 'cochabamba' || themeStore.currentDepartment === 'santa-cruz') {
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
  // Improve touch responsiveness
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
    // En móvil, mantener el estado actual o mostrar en el último paso
    if (activeStep.value === checkoutSteps.value.length - 1) {
      showSummary.value = true;
    }
  }
};

// Enhanced step click handler with feedback
const handleStepClick = (index) => {
  if (index <= activeStep.value || (index === activeStep.value + 1 && checkoutSteps.value[activeStep.value].completed)) {
    activeStepClicked.value = index; // Set which step was clicked for animation
    
    // Provide visual feedback
    const stepElement = document.querySelector(`.step-indicator:nth-child(${index + 1})`);
    if (stepElement) {
      stepElement.classList.add('step-clicked');
      setTimeout(() => {
        stepElement.classList.remove('step-clicked');
      }, 300);
    }
    
    // Navigate to the step
    goToStep(index);
    
    // Show a brief toast notification
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
  formSubmitted.value = true; // Activar validación visual
  if (activeStep.value === 0 && !isDeliveryInfoComplete.value) {
    Swal.fire({
      title: "Información incompleta",
      text: "Por favor, completa todos los campos obligatorios antes de continuar.",
      icon: "warning",
      confirmButtonText: "Entendido",
    });
    return; // No avanzar si la información no está completa
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

const increaseQuantity = (product) => {
  if (product.cantidad < product.cantidad_maxima) {
    cartStore.updateQuantity(product.uniqueId, product.cantidad + 1);
  } else {
    Swal.fire({
      title: "Advertencia",
      text: `No se puede aumentar la cantidad del producto ${product.nombre} más allá de ${product.cantidad_maxima}.`,
      icon: "warning",
      confirmButtonText: "Aceptar",
    });
  }
};

const decreaseQuantity = (product) => {
  if (product.cantidad > product.cantidad_minima) {
    cartStore.updateQuantity(product.uniqueId, product.cantidad - 1);
  } else {
    Swal.fire({
      title: "Advertencia",
      text: `La cantidad mínima para el producto ${product.nombre} es ${product.cantidad_minima}.`,
      icon: "warning",
      confirmButtonText: "Aceptar",
    });
  }
};

const removeProduct = (product) => {
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
};

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

function generarUniqueId(product) {
  return `${product.id}-${product.modeloId || 'default'}-${product.color || 'default'}`;
}

const formatPrice = (price) => {
  return price ? `${price.toLocaleString()} Bs` : '0 Bs';
};

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
      cartStore.applyCoupon(response.data.cupon);
      couponMessage.value = `Cupón aplicado: ${response.data.cupon.codigo}`;
      couponError.value = false;
      Swal.fire({
        title: "¡Éxito!",
        text: `Cupón aplicado: ${response.data.cupon.codigo}`,
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

const finalizeOrder = async () => {
  if (!isAuthenticated.value) {
    Swal.fire({
      title: "Iniciar sesión",
      text: "Para finalizar tu pedido, te recomendamos iniciar sesión o registrarte. ¿Deseas continuar?",
      icon: "info",
      showCancelButton: true,
      confirmButtonText: "Iniciar sesión",
      cancelButtonText: "Continuar como invitado"
    }).then((result) => {
      if (result.isConfirmed) {
        goToLogin();
        return;
      } else {
        processOrder();
      }
    });
  } else {
    processOrder();
  }
};

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
    if (producto.modeloId) formData.append(`productos[${index}][modelo_id]`, producto.modeloId);
    if (producto.color) formData.append(`productos[${index}][color]`, producto.color);
  });
  formData.append('total_amount', totalAmount.value);
  formData.append('total_to_pay', totalToPay.value);
  formData.append('pending', pending.value);
  formData.append('cupon_id', cartStore.cupon_id || '');
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
        const { data } = await storePedido(formData);
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
  gap: 10px;
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
  0% { opacity: 0.7; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.1); }
  100% { opacity: 0.7; transform: scale(1); }
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
  0% { transform: scale(1); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
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
  from { background-position: 1rem 0; }
  to { background-position: 0 0; }
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
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
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
  from { opacity: 0; transform: translateX(-10px); }
  to { opacity: 1; transform: translateX(0); }
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
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-20px); }
  60% { transform: translateY(-10px); }
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

input:focus + .input-icon {
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

input:focus ~ .input-focus-indicator {
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
  align-items: center;
  justify-content: center;
}

.product-image {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 8px;
  transition: transform 0.3s ease;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.product-image:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
}

.product-info {
  flex: 1;
  min-width: 0;
}

.product-info h3 {
  margin: 0 0 10px 0;
  font-size: clamp(16px, 3vw, 20px);
  font-weight: 600;
  color: #343a40;
}

.specs {
  color: #28a745;
  margin: 0 0 10px 0;
  font-size: clamp(12px, 2vw, 14px);
}

.price-container {
  margin: 10px 0;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.price {
  font-weight: 600;
  color: var(--primary-color);
  font-size: clamp(16px, 3vw, 18px);
  margin: 0;
}

.unit-price {
  color: #000000;
  font-size: clamp(12px, 2vw, 14px);
  margin: 0;
  font-weight: 500;
  background-color: #f0f8ff;
  padding: 5px 8px;
  border-radius: 4px;
  display: inline-block;
  border-left: 3px solid var(--primary-color);
}

.product-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 15px 0;
  background-color: #f8f9fa;
  padding: 10px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.product-details:hover {
  background-color: #e9ecef;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  font-size: clamp(12px, 2vw, 14px);
  padding: 5px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-label {
  color: #000000;
  font-weight: 500;
}

.detail-value {
  color: #343a40;
  font-weight: 600;
}

.color-image {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid white;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.quantity-controls {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-top: 15px;
  flex-wrap: wrap;
}

.quantity-selector {
  display: flex;
  align-items: center;
  gap: 10px;
  background-color: #f8f9fa;
  padding: 5px 10px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.quantity-selector:hover {
  background-color: #e9ecef;
}

.quantity-btn,
.remove-btn {
  padding: clamp(6px, 2vw, 8px) clamp(10px, 3vw, 12px);
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: clamp(14px, 2vw, 16px);
}

.quantity-btn:hover:not(:disabled),
.remove-btn:hover {
  background-color: var(--primary-hover-color);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 123, 255, 0.3);
}

.quantity-btn:active:not(:disabled),
.remove-btn:active {
  transform: scale(0.95);
  box-shadow: 0 2px 4px rgba(0, 123, 255, 0.3);
}

.quantity-btn:disabled {
  background-color: #707070;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.quantity {
  font-weight: bold;
  font-size: clamp(16px, 3vw, 18px);
  min-width: 30px;
  text-align: center;
}

.remove-btn {
  background-color: var(--danger-color);
  display: flex;
  align-items: center;
  gap: 8px;
}

.remove-btn:hover {
  background-color: #c82333;
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
  0% { transform: scale(0); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
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
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
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

/* Media Queries */
@media (max-width: 768px) {
  .checkout-container {
    padding: 10px;
    padding-bottom: 70px; /* Space for fixed navigation */
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
</style>