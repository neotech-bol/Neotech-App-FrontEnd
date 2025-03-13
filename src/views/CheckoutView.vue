<template>
  <div class="checkout-container">
    <header class="checkout-header">
      <h1>Finalizar Pedido <span>({{ totalItems }} ítems)</span></h1>
      <div class="actions-container">
        <button @click="emptyCart" class="empty-cart-btn" :disabled="items.length === 0">
          <i class="fas fa-trash-alt"></i> Vaciar Carrito
        </button>
        <div class="lock-icon">
          <i class="fas fa-lock"></i>
        </div>
      </div>
    </header>

    <!-- Indicador de progreso móvil -->
    <div class="mobile-progress">
      <div class="steps-indicator">
        <div v-for="(step, index) in checkoutSteps" :key="index" :class="['step-indicator', {
          'active': activeStep === index,
          'completed': activeStep > index
        }]" @click="goToStep(index)">
          <span class="step-number">{{ index + 1 }}</span>
        </div>
      </div>
      <div class="progress-bar">
        <div class="progress" :style="{ width: progressPercentage + '%' }"></div>
      </div>
    </div>

    <div class="checkout-content">
      <div class="main-content">
        <div class="checkout-steps">
          <!-- Step 1: Delivery Information -->
          <div class="step" :class="{ 'active-step': activeStep === 0, 'completed-step': activeStep > 0 }">
            <div class="step-header">
              <span class="step-number">1</span>
              <h2>Ubicación de Entrega</h2>
              <button v-if="activeStep >= 0" @click="toggleEdit(0)" class="edit-button">
                <i class="fas" :class="checkoutSteps[0].editing ? 'fa-save' : 'fa-edit'"></i>
                {{ checkoutSteps[0].editing ? 'Guardar' : 'Alterar' }}
              </button>
            </div>
            <div class="step-content" v-show="activeStep === 0 || checkoutSteps[0].completed">
              <div v-if="!checkoutSteps[0].editing" class="delivery-info-display">
                <p v-if="deliveryInfo.nombre"><i class="fas fa-user"></i> {{ deliveryInfo.nombre }} {{
                  deliveryInfo.apellido }}</p>
                <p v-if="deliveryInfo.direccion"><i class="fas fa-map-marker-alt"></i> {{ deliveryInfo.direccion }}</p>
                <p v-if="deliveryInfo.telefono"><i class="fas fa-phone"></i> {{ deliveryInfo.telefono }}</p>
                <p v-if="deliveryInfo.email"><i class="fas fa-envelope"></i> {{ deliveryInfo.email }}</p>
              </div>
              <div v-else class="form-grid">
                <div class="form-group">
                  <label for="nombre">Nombre</label>
                  <input id="nombre" v-model="deliveryInfo.nombre" placeholder="Nombre" required>
                </div>
                <div class="form-group">
                  <label for="apellido">Apellido</label>
                  <input id="apellido" v-model="deliveryInfo.apellido" placeholder="Apellido" required>
                </div>
                <div class="form-group full-width">
                  <label for="direccion">Dirección</label>
                  <input id="direccion" v-model="deliveryInfo.direccion" placeholder="Dirección" required>
                </div>
                <div class="form-group">
                  <label for="telefono">Teléfono</label>
                  <input id="telefono" v-model="deliveryInfo.telefono" placeholder="Teléfono" required>
                </div>
                <div class="form-group">
                  <label for="email">Email</label>
                  <input id="email" v-model="deliveryInfo.email" placeholder="Email" required>
                </div>
              </div>
              <div class="step-actions" v-if="activeStep === 0">
                <button @click="nextStep" class="next-button" :disabled="!isDeliveryInfoComplete">
                  Continuar <i class="fas fa-arrow-right"></i>
                </button>
              </div>
            </div>
          </div>

          <!-- Step 2: Review Items -->
          <div class="step" :class="{ 'active-step': activeStep === 1, 'completed-step': activeStep > 1 }">
            <div class="step-header">
              <span class="step-number">2</span>
              <h2>Revise los Items y Envío</h2>
            </div>
            <div class="step-content" v-show="activeStep === 1 || checkoutSteps[1].completed">
              <div v-if="items.length === 0" class="empty-cart-message">
                <i class="fas fa-shopping-cart"></i>
                <p>Tu carrito está vacío</p>
                <button @click="goShopping" class="go-shopping-btn">
                  <i class="fas fa-store"></i> Ir a comprar
                </button>
              </div>
              <div v-else class="product-list">
                <div v-for="product in items" :key="product.id" class="product-item">
                  <div class="product-image-container">
                    <img :src="product.image" :alt="product.nombre" class="product-image">
                  </div>
                  <div class="product-info">
                    <h3>{{ product.nombre }}</h3>
                    <p v-if="product.specs" class="specs">{{ product.specs }}</p>
                    <p class="price">{{ formatPrice(product.precio) }}</p>
                    <p class="unit-price">(Precio unitario: {{ formatPrice(product.precio) }})</p>

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
                        <button @click="decreaseQuantity(product)"
                          :disabled="product.cantidad <= product.cantidad_minima" class="quantity-btn">
                          <i class="fas fa-minus"></i>
                        </button>
                        <span class="quantity">{{ product.cantidad }}</span>
                        <button @click="increaseQuantity(product)"
                          :disabled="product.cantidad >= product.cantidad_maxima" class="quantity-btn">
                          <i class="fas fa-plus"></i>
                        </button>
                      </div>
                      <button @click="removeProduct(product)" class="remove-btn">
                        <i class="fas fa-trash"></i> Eliminar
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
            <div class="step-header">
              <span class="step-number">3</span>
              <h2>Cupón de Descuento</h2>
            </div>
            <div class="step-content" v-show="activeStep === 2 || checkoutSteps[2].completed">
              <div class="coupon-section">
                <div class="form-group">
                  <label for="cupon">Código de Cupón</label>
                  <div class="coupon-input-group">
                    <input id="cupon" type="text" v-model="cuponForm.codigo" placeholder="Ingrese el código del cupón"
                      class="coupon-input" />
                    <button @click="applyCoupon" class="apply-coupon-btn" :disabled="!cuponForm.codigo">
                      <i class="fas fa-tag"></i> Aplicar
                    </button>
                  </div>
                </div>
                <p v-if="couponMessage" class="coupon-message" :class="{ 'error-message': couponError }">
                  <i :class="couponError ? 'fas fa-exclamation-circle' : 'fas fa-check-circle'"></i>
                  {{ couponMessage }}
                </p>
                <div v-if="cartStore.descuento > 0" class="discount-info">
                  <p>
                    <i class="fas fa-money-bill-wave"></i> Descuento aplicado:
                    {{ formatPrice(cartStore.montoDescuento) }}
                  </p>
                  <p v-if="cartStore.tipoDescuento === 'porcentaje'">
                    <i class="fas fa-percentage"></i> Porcentaje de descuento: {{ cartStore.descuento }}%
                  </p>
                  <button @click="removeCoupon" class="remove-coupon-btn">
                    <i class="fas fa-times"></i> Eliminar Cupón
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
            <div class="step-header">
              <span class="step-number">4</span>
              <h2>Método de Pago</h2>
            </div>
            <div class="step-content" v-show="activeStep === 3 || checkoutSteps[3].completed">
              <div class="payment-options">
                <div class="payment-option" :class="{ 'selected': paymentMethod === 'qr' }"
                  @click="paymentMethod = 'qr'">
                  <div class="payment-option-header">
                    <input type="radio" id="qr-payment" name="payment-method" value="qr" v-model="paymentMethod">
                    <label for="qr-payment">
                      <i class="fas fa-qrcode"></i>
                      Pago por QR
                    </label>
                  </div>
                  <div v-if="paymentMethod === 'qr'" class="payment-details">
                    <p>Escanea el siguiente código QR para realizar el pago:</p>
                    <div class="qr-payment-image">
                      <img src="#" alt="QR Code para pago">
                    </div>
                    <div class="voucher-upload">
                      <label for="voucher-file">Subir comprobante de pago (requerido)</label>
                      <div class="file-upload-container">
                        <input type="file" id="voucher-file" @change="handleFileUpload" accept="image/*"
                          class="file-input">
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
                <div class="payment-option" :class="{ 'selected': paymentMethod === 'in-person' }"
                  @click="paymentMethod = 'in-person'">
                  <div class="payment-option-header">
                    <input type="radio" id="in-person" name="payment-method" value="in-person" v-model="paymentMethod">
                    <label for="in-person">
                      <i class="fas fa-store"></i>
                      Pago en Instalaciones
                    </label>
                  </div>
                  <div v-if="paymentMethod === 'in-person'" class="payment-details">
                    <p>Puedes realizar el pago directamente en nuestras instalaciones. Por favor selecciona una
                      ubicación:</p>

                    <!-- Location selector -->
                    <div class="location-selector">
                      <div v-for="(location, key) in locationOptions" :key="key"
                        :class="['location-option', { 'selected': selectedLocation === key }]"
                        @click="selectedLocation = key">
                        <input type="radio" :id="`location-${key}`" name="location" :value="key"
                          v-model="selectedLocation">
                        <label :for="`location-${key}`">{{ location.name }}</label>
                      </div>
                    </div>

                    <!-- Selected location details -->
                    <div v-if="selectedLocation" class="store-info">
                      <div class="store-info-item">
                        <i class="fas fa-map-marker-alt"></i>
                        <span><b>Dirección: </b> {{ locationOptions[selectedLocation].address }}</span>
                      </div>
                      <div class="store-info-item">
                        <i class="fas fa-clock"></i>
                        <span>Horario: {{ locationOptions[selectedLocation].hours }}</span>
                      </div>
                      <div class="store-info-item">
                        <i class="fas fa-phone"></i>
                        <span>Teléfono: {{ locationOptions[selectedLocation].phone }}</span>
                      </div>
                      <div class="store-info-item">
                        <i class="fas fa-envelope"></i>
                        <span>Email: {{ locationOptions[selectedLocation].email }}</span>
                      </div>
                      <div class="store-info-item">
                        <i class="fas fa-info-circle"></i>
                        <span>{{ locationOptions[selectedLocation].additionalInfo }}</span>
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

      <div class="order-summary">
        <div class="summary-header">
          <h2>Resumen del pedido</h2>
          <button class="toggle-summary" @click="toggleSummary">
            <i class="fas" :class="showSummary ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
          </button>
        </div>

        <div class="summary-content" :class="{ 'summary-hidden': !showSummary }">
          <div v-if="items.length === 0" class="empty-summary">
            <i class="fas fa-shopping-cart"></i>
            <p>No hay productos en el carrito</p>
          </div>
          <div v-else>
            <div class="summary-items">
              <div class="summary-item">
                <span>Total en Productos:</span>
                <span>{{ formatPrice(cartStore.totalAmount) }}</span>
              </div>
              <!-- Mostrar descuento según tipo -->
              <div class="summary-item" v-if="cartStore.montoDescuento > 0">
                <span v-if="cartStore.tipoDescuento === 'porcentaje'">
                  Descuento ({{ cartStore.descuento }}%):
                </span>
                <span v-else>
                  Descuento:
                </span>
                <span>-{{ formatPrice(cartStore.montoDescuento) }}</span>
              </div>

              <div class="summary-item">
                <span>Total después del descuento:</span>
                <span>{{ formatPrice(cartStore.totalAfterDiscount) }}</span>
              </div>

              <!-- Resto del resumen permanece igual -->
              <div class="summary-item">
                <span>Monto a cancelar (70%):</span>
                <span>{{ formatPrice(cartStore.totalToPay) }}</span>
              </div>
              <div class="summary-item">
                <span>Pendiente (30%):</span>
                <span>{{ formatPrice(cartStore.pending) }}</span>
              </div>
            </div>

            <div class="total">
              <span>Monto final:</span>
              <span class="total-amount">{{ formatPrice(cartStore.totalAfterDiscount) }}</span>
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
        </div>

        <div v-if="orderFinalized" class="order-finalized">
          <h3>¡Gracias por tu pedido!</h3>
          <p>Puedes contactarnos por WhatsApp para cualquier consulta:</p>
          <a :href="whatsappLink" class="whatsapp-button">
            <i class="fab fa-whatsapp"></i> Contactar por WhatsApp
          </a>
          <div class="qr-code">
            <img src="../../public/QrDueño/images.png" alt="QR Code para seguimiento de pedido" />
            <p>Escanea este código QR para seguir tu pedido</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Botón flotante para mostrar resumen en móvil -->
    <button class="floating-summary-button mobile-only" @click="toggleSummary">
      <i class="fas fa-shopping-cart"></i>
      <span class="floating-total">{{ formatPrice(totalAmount) }}</span>
    </button>
    
    <!-- Modal de confirmación para vaciar carrito -->
    <div v-if="showEmptyCartModal" class="modal-overlay" @click="cancelEmptyCart">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3><i class="fas fa-exclamation-triangle"></i> Vaciar carrito</h3>
          <button class="close-modal" @click="cancelEmptyCart">
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
import { computed, ref, onMounted, watch } from 'vue';

const router = useRouter();
const cartStore = useCartStore();
const themeStore = useThemeStore();
const userData = ref({});
const couponMessage = ref('');
const couponError = ref(false);
const cuponForm = ref({
  codigo: '',
});
const orderFinalized = ref(false);
const whatsappNumber = '+59170000000'; // Reemplaza con el número real
const whatsappLink = computed(() => `https://wa.me/${whatsappNumber}`);

// Estado para controlar la visibilidad del resumen en móvil
const showSummary = ref(window.innerWidth > 768);

// Estado para el modal de confirmación de vaciar carrito
const showEmptyCartModal = ref(false);

const deliveryInfo = ref({
  nombre: '',
  apellido: '',
  direccion: '',
  telefono: '',
  email: ''
});

// Payment method
const paymentMethod = ref('');
const voucherFile = ref(null);
const voucherPreview = ref('');

// Location options for in-person payment
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
  }
});
// Active step tracking
const activeStep = ref(0);
const checkoutSteps = ref([
  { id: 'delivery', title: 'Ubicación de Entrega', editable: true, editing: false, completed: false },
  { id: 'review', title: 'Revise los Items y Envío', editable: false, editing: false, completed: false },
  { id: 'coupon', title: 'Cupón de Descuento', editable: false, editing: false, completed: false },
  { id: 'payment', title: 'Método de Pago', editable: false, editing: false, completed: false }
]);

const progressPercentage = computed(() => {
  return (activeStep.value / (checkoutSteps.value.length - 1)) * 100;
});

// Validation
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
    return selectedLocation.value !== ''; // Ensure a location is selected
  }
  return false;
});

// Observar cambios en el carrito para actualizar la UI
watch(() => cartStore.productos, (newValue) => {
  if (newValue.length === 0 && activeStep.value === 1) {
    // Si el carrito está vacío y estamos en el paso de revisión, mostrar mensaje
    console.log('Carrito vacío en paso de revisión');
  }
}, { deep: true });

onMounted(() => {
  // Check if the current department is one of our locations
  if (themeStore.currentDepartment === 'la-paz' || themeStore.currentDepartment === 'cochabamba') {
    selectedLocation.value = themeStore.currentDepartment;
  } else {
    // Default to first location
    selectedLocation.value = 'la-paz';
  }

  const storedData = localStorage.getItem('datosUser');
  if (storedData) {
    deliveryInfo.value = JSON.parse(storedData);
  }

  // Listener para ajustar la visibilidad del resumen según el tamaño de la pantalla
  window.addEventListener('resize', handleResize);
});

const handleResize = () => {
  if (window.innerWidth > 768) {
    showSummary.value = true;
  }
};

const toggleSummary = () => {
  showSummary.value = !showSummary.value;
};

// Función para ir directamente a un paso específico (para el indicador móvil)
const goToStep = (index) => {
  // Solo permitir ir a pasos completados o al siguiente paso
  if (index <= activeStep.value || (index === activeStep.value + 1 && checkoutSteps.value[activeStep.value].completed)) {
    activeStep.value = index;
  }
};

// Navigation functions
const nextStep = () => {
  if (activeStep.value < checkoutSteps.value.length - 1) {
    checkoutSteps.value[activeStep.value].completed = true;
    activeStep.value++;
    // En móvil, mostrar el resumen al llegar al último paso
    if (activeStep.value === checkoutSteps.value.length - 1 && window.innerWidth <= 768) {
      showSummary.value = true;
    }
  }
};

const prevStep = () => {
  if (activeStep.value > 0) {
    activeStep.value--;
  }
};

// File handling
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
  if (fileInput) {
    fileInput.value = '';
  }
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
      // Usar el uniqueId que ya viene con el producto en lugar de generarlo nuevamente
      cartStore.removeFromCart(product.uniqueId);
    }
  });
};

// Función para vaciar el carrito (nueva)
const emptyCart = () => {
  if (items.value.length === 0) {
    return;
  }
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
  
  // Si estamos en el paso de revisión de productos, volver al paso 1
  if (activeStep.value === 1) {
    activeStep.value = 0;
    checkoutSteps.value[1].completed = false;
  }
};

const cancelEmptyCart = () => {
  showEmptyCartModal.value = false;
};

// Función para ir a la tienda
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
      console.log(response.data.cupon);
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
  if (items.value.length === 0) {
    Swal.fire({
      title: "Advertencia",
      text: "Por favor, ingresa productos antes de finalizar el pedido.",
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
      title: "Advertencia",
      text: warningMessage,
      icon: "warning",
      confirmButtonText: "Aceptar",
    });
    return;
  }

  // Verificar que items.value sea un array válido
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

  // Crear un objeto FormData para enviar datos de formulario multipart
  const formData = new FormData();

  // Añadir cada producto como una entrada separada en el FormData
  items.value.forEach((producto, index) => {
    formData.append(`productos[${index}][id]`, producto.id);
    formData.append(`productos[${index}][cantidad]`, producto.cantidad);
    formData.append(`productos[${index}][precio]`, producto.precio); // Añadir el precio
    if (producto.modeloId) {
      formData.append(`productos[${index}][modelo_id]`, producto.modeloId);
    }
    if (producto.color) {
      formData.append(`productos[${index}][color]`, producto.color);
    }
  });

  // Agregar otros datos del pedido
  formData.append('total_amount', totalAmount.value);
  formData.append('total_to_pay', totalToPay.value);
  formData.append('pending', pending.value);
  formData.append('cupon_id', cartStore.cupon_id || '');
  formData.append('payment_method', paymentMethod.value);

  // Añadir la ubicación seleccionada si el método de pago es en persona
  if (paymentMethod.value === 'in-person' && selectedLocation.value) {
    formData.append('location', selectedLocation.value);
    formData.append('location_details', JSON.stringify(locationOptions.value[selectedLocation.value]));
  }

  // Para delivery_info, sí necesitamos usar JSON.stringify porque es un objeto complejo
  formData.append('delivery_info', JSON.stringify(deliveryInfo.value));

  // Agregar el archivo del voucher si existe
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
        // Enviar el FormData
        const { data } = await storePedido(formData);

        Swal.fire({
          title: "¡Pedido Finalizado!",
          text: "Tu pedido ha sido realizado con éxito.",
          icon: "success",
          confirmButtonText: "Aceptar",
        }).then(() => {
          // Limpiar todos los datos después de que el usuario cierre el mensaje de éxito
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
    } else {
      console.log("El usuario ha cancelado el proceso del pedido.");
    }
  });
};

const clearOrderData = () => {
  // Limpiar el carrito
  if (typeof cartStore.clearCart === 'function') {
    cartStore.clearCart();
  } else {
    // Alternativa si no existe la función clearCart
    cartStore.productos = [];
    cartStore.total = 0;
  }

  // Limpiar el cupón
  cartStore.removeCoupon();
  cuponForm.value.codigo = '';
  couponMessage.value = '';
  couponError.value = false;

  // Limpiar la imagen del voucher
  voucherFile.value = null;
  voucherPreview.value = '';
  const fileInput = document.getElementById('voucher-file');
  if (fileInput) {
    fileInput.value = '';
  }

  // Resetear método de pago
  paymentMethod.value = '';

  // Restablecer pasos del checkout
  checkoutSteps.value.forEach(step => {
    step.completed = false;
    step.editing = false;
  });

  // Volver al primer paso
  activeStep.value = 0;

  // Marcar que el pedido se ha finalizado
  orderFinalized.value = true;
};

const toggleEdit = async (index) => {
  const step = checkoutSteps.value[index];

  // Verificar si el usuario está autenticado
  const isAuthenticated = !!localStorage.getItem('token'); // Cambia 'token' por la clave que uses para almacenar el token de autenticación

  if (!isAuthenticated) {
    // Si no está autenticado, mostrar un mensaje de alerta
    Swal.fire({
      title: "Acceso Denegado",
      text: "Por favor, inicia sesión o regístrate para editar tus datos.",
      icon: "warning",
      confirmButtonText: "Aceptar",
    });
    return; // Salir de la función si no está autenticado
  }

  // Si el usuario está autenticado, permitir la edición
  if (step.editable) {
    step.editing = !step.editing;

    // Si se está saliendo del modo de edición, actualizar los datos
    if (!step.editing) {
      try {
        const { data } = await updateDatosInfoUser(deliveryInfo.value);

        // Limpiar el localStorage antes de guardar
        localStorage.removeItem('datosUser');

        // Actualizar localStorage con los nuevos datos
        localStorage.setItem('datosUser', JSON.stringify(deliveryInfo.value));

        // Mostrar mensaje de éxito
        Swal.fire({
          title: "¡Éxito!",
          text: "Tus datos han sido actualizados correctamente.",
          icon: "success",
          confirmButtonText: "Aceptar",
        });
      } catch (error) {
        console.error("Error al actualizar los datos del usuario:", error);

        // Mostrar mensaje de error
        Swal.fire({
          title: "Error",
          text: error.response?.data?.message || "Hubo un error al actualizar los datos. Por favor, intenta nuevamente.",
          icon: "error",
          confirmButtonText: "Aceptar",
        });
      }
    }
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
  padding: 20px;
  width: 100%;
  box-sizing: border-box;
  position: relative;
}

/* Header Styles */
.checkout-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 0;
  border-bottom: 2px solid var(--primary-color);
  margin-bottom: 20px;
  flex-wrap: wrap;
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
}

h1 span {
  color: #000000;
  font-weight: normal;
  font-size: 0.85em;
}

.lock-icon {
  color: var(--primary-color);
  font-size: clamp(18px, 3vw, 24px);
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
}

.empty-cart-btn:disabled {
  background-color: #e9ecef;
  color: #6c757d;
  cursor: not-allowed;
}

/* Mobile Progress Indicator */
.mobile-progress {
  display: none;
  margin-bottom: 20px;
}

.steps-indicator {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.step-indicator {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;
}

.step-indicator::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 100%;
  width: calc(100% - 40px);
  height: 2px;
  background-color: #f8f9fa;
  transform: translateY(-50%);
}

.step-indicator:last-child::after {
  display: none;
}

.step-indicator.active {
  background-color: var(--primary-color);
  color: white;
}

.step-indicator.completed {
  background-color: #28a745;
  color: white;
}

.step-indicator.completed::after {
  background-color: #28a745;
}

/* Layout Styles */
.checkout-content {
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 30px;
}

.main-content,
.order-summary {
  background: white;
  border-radius: 8px;
  padding: clamp(15px, 3vw, 30px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
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
}

.step:last-child {
  border-bottom: none;
}

.active-step {
  border-left: 4px solid var(--primary-color);
  padding-left: 15px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.completed-step .step-number {
  background: #28a745;
}

.step-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.step-number {
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
}

h2 {
  margin: 0;
  font-size: clamp(18px, 3vw, 22px);
  font-weight: 600;
  color: var(--primary-color);
}

.edit-button {
  margin-left: auto;
  color: var(--primary-color);
  background: none;
  border: none;
  cursor: pointer;
  font-size: clamp(14px, 2vw, 16px);
  transition: color 0.3s ease;
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 8px 12px;
  border-radius: 8px;
}

.edit-button:hover {
  color: var(--primary-hover-color);
  background-color: rgba(127, 130, 134, 0.1);
}

.step-content {
  padding-left: 60px;
  transition: padding 0.3s ease;
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
.empty-cart-message, .empty-summary {
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

.empty-cart-message i, .empty-summary i {
  font-size: 48px;
  color: #adb5bd;
  margin-bottom: 15px;
}

.empty-cart-message p, .empty-summary p {
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
}

/* Form Styles */
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group.full-width {
  grid-column: span 2;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  color: #343a40;
  font-size: clamp(14px, 2vw, 16px);
}

input,
select {
  width: 100%;
  padding: 12px 15px;
  border: 2px solid #f8f9fa;
  border-radius: 8px;
  font-size: clamp(14px, 2vw, 16px);
  transition: border-color 0.3s ease;
  box-sizing: border-box;
}

input:focus,
select:focus {
  border-color: var(--primary-color);
  outline: none;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25);
}

/* Button Styles */
.step-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
  flex-wrap: wrap;
  gap: 10px;
}

.next-button,
.prev-button {
  padding: clamp(8px, 2vw, 10px) clamp(15px, 3vw, 20px);
  border-radius: 8px;
  font-size: clamp(14px, 2vw, 16px);
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

.next-button:hover {
  background-color: var(--primary-hover-color);
  transform: translateY(-2px);
}

.prev-button {
  background-color: #f8f9fa;
  color: #000000;
  border: 1px solid #dee2e6;
}

.prev-button:hover {
  background-color: #e9ecef;
  transform: translateY(-2px);
}

.next-button:disabled,
.prev-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
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
}

.product-image:hover {
  transform: scale(1.05);
}

.product-info {
  flex: 1;
  min-width: 0;
  /* Prevents flexbox items from overflowing */
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

.price {
  font-weight: 600;
  margin: 10px 0;
  color: var(--primary-color);
  font-size: clamp(16px, 3vw, 18px);
}

.unit-price {
  color: #000000;
  font-size: clamp(12px, 2vw, 14px);
  margin: 0;
}

.product-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 15px 0;
  background-color: #f8f9fa;
  padding: 10px;
  border-radius: 8px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  font-size: clamp(12px, 2vw, 14px);
}

.detail-label {
  color: #000000;
  font-weight: 500;
}

.detail-value {
  color: #343a40;
  font-weight: 600;
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

.quantity-btn:hover,
.remove-btn:hover {
  background-color: var(--primary-hover-color);
  transform: translateY(-2px);
}

.quantity-btn:active,
.remove-btn:active {
  transform: scale(0.95);
}

.quantity-btn:disabled {
  background-color: #707070;
  cursor: not-allowed;
  transform: none;
}

.quantity {
  font-weight: bold;
  font-size: clamp(16px, 3vw, 18px);
  min-width: 30px;
  text-align: center;
}

.remove-btn {
  background-color: #dc3545;
  display: flex;
  align-items: center;
  gap: 5px;
  margin-left: auto;
}

.remove-btn:hover {
  background-color: #c82333;
}

/* Coupon Section Styles */
.coupon-section {
  margin-top: 20px;
}

.coupon-input-group {
  display: flex;
  gap: 10px;
}

.coupon-input {
  flex: 1;
  padding: 12px 15px;
  border: 2px solid #f8f9fa;
  border-radius: 8px;
  font-size: clamp(14px, 2vw, 16px);
  transition: all 0.3s ease;
}

.coupon-input:focus {
  border-color: var(--primary-color);
  outline: none;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25);
}

.apply-coupon-btn,
.remove-coupon-btn {
  padding: clamp(8px, 2vw, 12px);
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: clamp(14px, 2vw, 16px);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 5px;
  white-space: nowrap;
}

.apply-coupon-btn:hover,
.remove-coupon-btn:hover {
  background-color: #218838;
  transform: translateY(-2px);
}

.apply-coupon-btn:disabled {
  background-color: #28a745;
  cursor: not-allowed;
  transform: none;
}

.remove-coupon-btn {
  background-color: #dc3545;
  margin-top: 10px;
}

.remove-coupon-btn:hover {
  background-color: #c82333;
}

.coupon-message {
  margin-top: 10px;
  font-size: clamp(12px, 2vw, 14px);
  color: #28a745;
  display: flex;
  align-items: center;
  gap: 5px;
}

.error-message {
  color: #dc3545;
}

.discount-info {
  margin-top: 15px;
  padding: 15px;
  background-color: #e9f7ef;
  border-radius: 8px;
  border-left: 4px solid #28a745;
}

.discount-info p {
  margin: 5px 0;
  color: #28a745;
  font-size: clamp(12px, 2vw, 14px);
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Payment Options Styles */
.payment-options {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.payment-option {
  padding: 15px;
  border: 2px solid #f8f9fa;
  border-radius: 8px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.payment-option:hover {
  border-color: var(--primary-color);
  box-shadow: 0 3px 8px rgba(0, 123, 255, 0.15);
}

.payment-option.selected {
  border-color: var(--primary-color);
  background-color: rgba(0, 123, 255, 0.05);
}

.payment-option-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.payment-option input[type="radio"] {
  margin-right: 10px;
  width: auto;
}

.payment-option label {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 500;
  cursor: pointer;
  font-size: clamp(14px, 2vw, 16px);
}

.payment-option label i {
  color: var(--primary-color);
  font-size: clamp(16px, 3vw, 20px);
}

.payment-details {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #f8f9fa;
}

.qr-payment-image {
  display: flex;
  justify-content: center;
  margin: 20px 0;
}

.qr-payment-image img {
  width: clamp(150px, 50vw, 200px);
  height: clamp(150px, 50vw, 200px);
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 10px;
}

.voucher-upload {
  margin-top: 20px;
}

.file-upload-container {
  position: relative;
  margin-top: 10px;
}

.file-input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
  z-index: 2;
}

.file-upload-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 15px;
  background-color: #f8f9fa;
  border: 2px dashed #dee2e6;
  border-radius: 8px;
  color: #000000;
  font-size: clamp(14px, 2vw, 16px);
  transition: all 0.3s ease;
}

.file-upload-button:hover {
  background-color: #e9ecef;
  border-color: #adb5bd;
}

.file-name {
  display: block;
  margin-top: 10px;
  font-size: clamp(12px, 2vw, 14px);
  color: #28a745;
  word-break: break-all;
}

.voucher-preview {
  margin-top: 15px;
  position: relative;
  display: inline-block;
}

.voucher-preview img {
  max-width: 100%;
  max-height: 200px;
  border-radius: 8px;
  border: 1px solid #dee2e6;
}

.remove-voucher-btn {
  position: absolute;
  top: -10px;
  right: -10px;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: #dc3545;
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
}

.remove-voucher-btn:hover {
  background-color: #c82333;
  transform: rotate(90deg);
}

.store-info {
  margin-top: 15px;
}

.store-info-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin: 10px 0;
  color: #000000;
  font-size: clamp(14px, 2vw, 16px);
}

.store-info-item i {
  color: var(--primary-color);
  width: 20px;
  min-width: 20px;
  margin-top: 3px;
}

/* Order Summary Styles */
.order-summary {
  position: sticky;
  top: 20px;
  height: max-content;
}

.summary-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #f8f9fa;
}

.toggle-summary {
  background: none;
  border: none;
  color: var(--primary-color);
  cursor: pointer;
  font-size: 18px;
  display: none;
}

.summary-content {
  transition: max-height 0.3s ease, opacity 0.3s ease;
  max-height: 1000px;
  opacity: 1;
  overflow: hidden;
}

.summary-hidden {
  max-height: 0;
  opacity: 0;
  overflow: hidden;
}

.summary-items {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 30px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  color: #000000;
  font-size: clamp(14px, 2vw, 16px);
}

.total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  margin: 30px 0;
  padding-top: 20px;
  border-top: 2px solid var(--primary-color);
}

.total-amount {
  color: var(--primary-color);
  font-size: clamp(22px, 4vw, 28px);
  font-weight: bold;
}

.checkout-progress {
  margin: 30px 0;
}

.progress-bar {
  height: 8px;
  background-color: #f8f9fa;
  border-radius: 4px;
  overflow: hidden;
}

.progress {
  height: 100%;
  background-color: var(--primary-color);
  transition: width 0.3s ease;
}

.progress-text {
  margin-top: 10px;
  text-align: center;
  color: #000000;
  font-size: clamp(12px, 2vw, 14px);
}

.checkout-button {
  width: 100%;
  padding: clamp(12px, 3vw, 15px);
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: clamp(16px, 3vw, 18px);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.checkout-button:hover {
  background-color: #0069d9;
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 123, 255, 0.3);
}

.checkout-button:active {
  transform: translateY(-1px);
}

.checkout-button:disabled {
  background-color: #28a745;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.terms {
  margin: 20px 0 0 0;
  font-size: clamp(12px, 2vw, 14px);
  color: #000000;
  text-align: center;
}

.terms a {
  color: var(--primary-color);
  text-decoration: none;
  transition: color 0.3s ease;
}

.terms a:hover {
  color: #17a2b8;
  text-decoration: underline;
}

/* Floating Summary Button for Mobile */
.floating-summary-button {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 50px;
  padding: 12px 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  z-index: 100;
  transition: all 0.3s ease;
  display: none;
}

.floating-summary-button:hover {
  background-color: #0069d9;
  transform: translateY(-3px);
}

.floating-total {
  font-weight: bold;
}

/* Order Finalized Styles */
.order-finalized {
  margin-top: 30px;
  text-align: center;
  padding: 20px;
  background-color: #e9f7ef;
  border-radius: 8px;
  border-left: 4px solid #28a745;
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

.order-finalized h3 {
  color: #28a745;
  font-size: clamp(20px, 4vw, 24px);
  margin-bottom: 15px;
}

.whatsapp-button {
  display: inline-flex;
  background-color: #25D366;
  color: white;
  padding: clamp(8px, 2vw, 10px) clamp(15px, 3vw, 20px);
  border-radius: 8px;
  text-decoration: none;
  font-size: clamp(14px, 2vw, 16px);
  margin-top: 15px;
  transition: all 0.3s ease;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
}

.whatsapp-button:hover {
  background-color: #128C7E;
  transform: translateY(-2px);
}

.qr-code {
  margin-top: 30px;
}

.qr-code img {
  width: clamp(120px, 40vw, 150px);
  height: clamp(120px, 40vw, 150px);
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 10px;
}

.qr-code p {
  margin-top: 10px;
  font-size: clamp(12px, 2vw, 14px);
  color: #28a745;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

.modal-content {
  background-color: white;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(50px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #f8f9fa;
}

.modal-header h3 {
  margin: 0;
  font-size: 20px;
  color: var(--danger-color);
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
  transition: color 0.3s ease;
}

.close-modal:hover {
  color: var(--danger-color);
}

.modal-body {
  padding: 20px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 15px 20px;
  border-top: 1px solid #f8f9fa;
}

.cancel-btn, .confirm-btn {
  padding: 10px 15px;
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
  color: #6c757d;
  border: 1px solid #dee2e6;
}

.cancel-btn:hover {
  background-color: #e9ecef;
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

/* Utility Classes */
.mobile-only {
  display: none;
}

.desktop-only {
  display: block;
}

/* Responsive Media Queries */
@media (max-width: 1024px) {
  .checkout-content {
    grid-template-columns: 1fr;
  }

  .order-summary {
    position: relative;
    margin-top: 30px;
    top: 0;
  }
}

@media (max-width: 768px) {
  .checkout-container {
    padding: 15px;
  }

  .checkout-header {
    flex-direction: column;
    align-items: center;
    gap: 15px;
    padding: 10px 0;
  }

  .mobile-progress {
    display: block;
  }

  .mobile-only {
    display: block;
  }

  .desktop-only {
    display: none;
  }

  .floating-summary-button {
    display: flex;
  }

  .toggle-summary {
    display: block;
  }

  .step-header {
    gap: 10px;
  }

  .step-content {
    padding-left: 0;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .product-item {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 15px;
  }

  .product-image {
    width: 180px;
    height: 180px;
  }

  .product-details {
    text-align: left;
  }

  .detail-item {
    padding: 8px 0;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  }

  .detail-item:last-child {
    border-bottom: none;
  }

  .quantity-controls {
    justify-content: center;
    flex-direction: column;
    align-items: center;
  }

  .quantity-selector {
    width: 100%;
    justify-content: center;
  }

  .remove-btn {
    margin-left: 0;
    width: 100%;
    justify-content: center;
  }

  .step-actions {
    flex-direction: column;
  }

  .next-button,
  .prev-button {
    width: 100%;
    justify-content: center;
  }

  .coupon-input-group {
    flex-direction: column;
  }

  .apply-coupon-btn {
    width: 100%;
    justify-content: center;
  }

  .payment-option-header {
    flex-wrap: wrap;
  }

  .store-info-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .store-info-item i {
    margin-bottom: 5px;
  }
  
  .modal-content {
    width: 95%;
  }
}

@media (max-width: 480px) {
  .checkout-container {
    padding: 10px;
  }

  .main-content,
  .order-summary {
    padding: 15px;
    border-radius: 8px;
  }

  .step {
    padding-bottom: 15px;
    margin-bottom: 15px;
  }

  .active-step {
    padding-left: 10px;
  }

  .step-number {
    width: 30px;
    height: 30px;
    min-width: 30px;
  }

  .product-image {
    width: 150px;
    height: 150px;
  }

  .whatsapp-button {
    padding: 10px;
  }

  .file-upload-button {
    font-size: 12px;
    padding: 10px;
  }

  .file-name {
    font-size: 11px;
  }
  
  .modal-header h3 {
    font-size: 18px;
  }
  
  .modal-body {
    padding: 15px;
  }
  
  .modal-footer {
    padding: 10px 15px;
    flex-direction: column;
  }
  
  .cancel-btn, .confirm-btn {
    width: 100%;
    justify-content: center;
  }
}

/* Animations and Effects */
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

.checkout-button:not(:disabled):hover {
  animation: pulse 2s infinite;
}

.active-step {
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
    /* Larger touch targets */
  }

  input,
  select {
    padding: 15px;
  }

  .payment-option label {
    padding: 10px 0;
  }
}

/* High contrast mode for accessibility */
@media (prefers-contrast: high) {
  :root {
    --primary-color: #0056b3;
    --secondary-color: #495057;
    --success-color: #1e7e34;
    --danger-color: #bd2130;
  }

  input,
  select {
    border-width: 2px;
  }

  .step-content p i,
  .payment-option label i,
  .store-info-item i {
    color: black;
  }
}

.location-selector {
  display: flex;
  gap: 15px;
  margin: 15px 0;
  flex-wrap: wrap;
}

.location-option {
  flex: 1;
  min-width: 200px;
  padding: 15px;
  border: 2px solid #f8f9fa;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 10px;
}

.location-option:hover {
  border-color: var(--primary-color);
  background-color: rgba(0, 123, 255, 0.05);
}

.location-option.selected {
  border-color: var(--primary-color);
  background-color: rgba(0, 123, 255, 0.1);
}

.location-option input[type="radio"] {
  margin: 0;
  width: auto;
}

.location-option label {
  cursor: pointer;
  font-weight: 500;
  margin: 0;
}

/* Customize location options based on department */
.location-option.selected[for="location-la-paz"] {
  border-color: #f8a812;
  background-color: rgba(248, 168, 18, 0.1);
}

.location-option.selected[for="location-cochabamba"] {
  border-color: #3B82F6;
  background-color: rgba(59, 130, 246, 0.1);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .location-selector {
    flex-direction: column;
  }

  .location-option {
    width: 100%;
  }
}
</style>