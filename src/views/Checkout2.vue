<template>
  <div class="checkout-container">
    <header class="checkout-header">
      <div class="logo">
        <img src="../../public/logo/Logo Neofetch PNG.png" alt="Neo Tech-Bol" />
      </div>
      <h1 class="checkout-title">
        Finalizar Pedido
        <span class="badge">{{ totalItems }} ítems</span>
      </h1>
      <div class="secure-checkout">
        <i class="fas fa-shield-alt"></i>
        <span>Compra Segura</span>
      </div>
    </header>

    <div class="checkout-content">
      <div class="steps-container">
        <div class="progress-bar">
          <div class="progress-step" :class="{ active: currentStep >= 1, completed: currentStep > 1 }">
            <div class="step-indicator">1</div>
            <span>Datos de Envío</span>
          </div>
          <div class="progress-line" :class="{ active: currentStep > 1 }"></div>
          <div class="progress-step" :class="{ active: currentStep >= 2 }">
            <div class="step-indicator">2</div>
            <span>Resumen de Compra</span>
          </div>
        </div>
      </div>

      <div class="main-content">
        <!-- Delivery Information -->
        <section v-show="currentStep === 1" class="delivery-section">
          <div class="section-header">
            <h2>Información de Entrega</h2>
            <button @click="editDeliveryInfo" class="edit-btn">
              <i class="fas fa-edit"></i> Editar
            </button>
          </div>

          <div class="user-info-card">
            <div class="info-row">
              <i class="fas fa-user"></i>
              <div>
                <label>Nombre</label>
                <p>{{ userData.nombre || 'No especificado' }}</p>
              </div>
            </div>
            <div class="info-row">
              <i class="fas fa-map-marker-alt"></i>
              <div>
                <label>Dirección</label>
                <p>{{ userData.direccion || 'No especificada' }}</p>
              </div>
            </div>
            <div class="info-row">
              <i class="fas fa-phone"></i>
              <div>
                <label>Teléfono</label>
                <p>{{ userData.telefono || 'No especificado' }}</p>
              </div>
            </div>
            <div class="info-row">
              <i class="fas fa-envelope"></i>
              <div>
                <label>Email</label>
                <p>{{ userData.email || 'No especificado' }}</p>
              </div>
            </div>
          </div>

          <button @click="nextStep" class="continue-btn" :disabled="!isDeliveryInfoComplete">
            Continuar con el Pedido
            <i class="fas fa-arrow-right"></i>
          </button>
        </section>

        <!-- Product List -->
        <section v-show="currentStep === 2" class="products-section">
          <div class="section-header">
            <h2>Productos en tu Carrito</h2>
            <span class="items-count">{{ totalItems }} items</span>
          </div>

          <TransitionGroup name="list" tag="div" class="product-list">
            <div v-for="product in items" :key="product.id" class="product-card">
              <div class="product-image-container">
                <img :src="product.image" :alt="product.nombre" class="product-image">
                <div class="image-overlay">
                  <button @click="showProductDetails(product)" class="view-details-btn">
                    <i class="fas fa-search-plus"></i>
                  </button>
                </div>
              </div>

              <div class="product-details">
                <h3>{{ product.nombre }}</h3>
                <p v-if="product.specs" class="specs">{{ product.specs }}</p>

                <div class="price-tag">
                  <span class="current-price">{{ formatPrice(product.precio) }}</span>
                  <span class="unit-price">{{ formatPrice(product.precio) }}/und</span>
                </div>

                <div class="product-meta">
                  <span class="meta-item">
                    <i class="fas fa-box"></i> Min: {{ product.cantidad_minima }}
                  </span>
                  <span class="meta-item">
                    <i class="fas fa-boxes"></i> Max: {{ product.cantidad_maxima }}
                  </span>
                  <span class="meta-item">
                    <i class="fas fa-tag"></i> {{ product.modelo }}
                  </span>
                </div>

                <div class="quantity-control">
                  <button @click="decreaseQuantity(product)" :disabled="product.cantidad <= product.cantidad_minima"
                    class="control-btn">
                    <i class="fas fa-minus"></i>
                  </button>
                  <div class="quantity-display">
                    <span>{{ product.cantidad }}</span>
                    <small>unidades</small>
                  </div>
                  <button @click="increaseQuantity(product)" :disabled="product.cantidad >= product.cantidad_maxima"
                    class="control-btn">
                    <i class="fas fa-plus"></i>
                  </button>
                </div>

                <button @click="confirmRemoveProduct(product)" class="remove-btn">
                  <i class="fas fa-trash-alt"></i>
                  <span>Eliminar</span>
                </button>
              </div>
            </div>
          </TransitionGroup>

          <button @click="previousStep" class="back-btn">
            <i class="fas fa-arrow-left"></i> Volver a Datos de Envío
          </button>
        </section>
      </div>

      <!-- Order Summary -->
      <div class="order-summary" :class="{ 'visible': isOrderSummaryVisible }">
        <div class="summary-header">
          <h2>Resumen del Pedido</h2>
          <button @click="toggleSummary" class="toggle-summary-btn">
            <i :class="isOrderSummaryVisible ? 'fa-chevron-down' : 'fa-chevron-up'" class="fas"></i>
          </button>
        </div>

        <div v-show="isOrderSummaryVisible" class="summary-content">
          <div class="summary-items">
            <div class="summary-row">
              <span>Subtotal:</span>
              <span>{{ formatPrice(totalAmount) }}</span>
            </div>
            <div class="summary-row">
              <span>Descuento:</span>
              <span class="discount">-{{ formatPrice(cartStore.descuento) }}</span>
            </div>
            <div class="summary-row total">
              <span>Total a Pagar:</span>
              <span>{{ formatPrice(totalToPay) }}</span>
            </div>
          </div>

          <div class="coupon-section">
            <div class="coupon-input-group">
              <input type="text" v-model="cuponForm.codigo" placeholder="Código de descuento" class="coupon-input"
                :disabled="!!cartStore.cupon_id" />
              <button v-if="!cartStore.cupon_id" @click="applyCoupon" class="apply-coupon-btn"
                :disabled="!cuponForm.codigo">
                <i class="fas fa-tag"></i>
                Aplicar
              </button>
              <button v-else @click="removeCoupon" class="remove-coupon-btn">
                <i class="fas fa-times"></i>
                Eliminar
              </button>
            </div>
            <TransitionGroup name="fade">
              <p v-if="couponMessage" :key="'message'"
                :class="['coupon-message', { 'success': couponSuccess, 'error': !couponSuccess }]">
                {{ couponMessage }}
              </p>
              <div v-if="cartStore.descuento > 0" :key="'discount'" class="applied-discount">
                <i class="fas fa-check-circle"></i>
                <span>Descuento aplicado: {{ cartStore.montoPorcentaje }}%</span>
              </div>
            </TransitionGroup>
          </div>

          <button @click="finalizeOrder" class="checkout-btn" :disabled="!canCheckout">
            <i class="fas fa-lock"></i>
            Finalizar Compra
          </button>

          <div class="secure-payment">
            <i class="fas fa-shield-alt"></i>
            <span>Pago Seguro Garantizado</span>
          </div>

          <p class="terms">
            Al finalizar la compra, aceptas nuestros
            <a href="#" @click.prevent="showTerms">términos y condiciones</a>
          </p>
        </div>
      </div>
    </div>

    <!-- Success Modal -->
    <Transition name="modal">
      <div v-if="orderFinalized" class="success-modal">
        <div class="modal-content">
          <div class="success-icon">
            <i class="fas fa-check-circle"></i>
          </div>
          <h3>¡Gracias por tu Compra!</h3>
          <p>Tu pedido ha sido procesado exitosamente.</p>

          <div class="order-details">
            <p class="order-number">Pedido #{{ orderId }}</p>
            <p class="order-date">{{ formatDate(new Date()) }}</p>
          </div>

          <div class="contact-options">
            <a :href="whatsappLink" class="whatsapp-btn">
              <i class="fab fa-whatsapp"></i>
              Contactar por WhatsApp
            </a>

            <div class="qr-section">
              <img src="../../public/QrDueño/images.png" alt="QR Code" class="qr-code" />
              <p>Escanea para seguir tu pedido</p>
            </div>
          </div>

          <button @click="closeSuccessModal" class="continue-shopping-btn">
            Continuar Comprando
          </button>
        </div>
      </div>
    </Transition>
  </div>
  <!-- Modal -->
  <div class="modal fade" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1"
    aria-labelledby="staticBackdropLabel" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="staticBackdropLabel">Información de entrega</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <div class="row">
            <div class="col-12">
              <label for="nombre" class="form-label fw-bold">Nombre</label>
              <input type="text" class="form-control" placeholder="Escribe..." id="nombre">
            </div>
            <div class="col-12">
              <label for="direccion" class="form-label fw-bold">Dirección</label>
              <input type="text" class="form-control" placeholder="Escribe..." id="direccion">
            </div>
            <div class="col-12">
              <label for="telefono" class="form-label fw-bold">Teléfono</label>
              <input type="text" class="form-control" placeholder="Escribe..." id="telefono">
            </div>
            <div class="col-12">
              <label for="email" class="form-label fw-bold">Email</label>
              <input type="text" class="form-control" placeholder="Escribe..." id="email">
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-danger" data-bs-dismiss="modal">Cerrar</button>
          <button type="button" class="btn btn-primary">Guardar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { validateCuponBE } from '@/Services/CuponService';
import { storePedido } from '@/Services/PedidoService';
import { useCartStore } from '@/stores/cart';
import Swal from 'sweetalert2';
import { Modal } from 'bootstrap/dist/js/bootstrap.bundle.min';
import { useRouter } from 'vue-router';
//Route
const router = useRouter();
// Store and State
const cartStore = useCartStore();
const currentStep = ref(1);
const isOrderSummaryVisible = ref(true);
const orderFinalized = ref(false);
const orderId = ref(null);
const couponMessage = ref('');
const couponSuccess = ref(false);
const cuponForm = ref({ codigo: '' });
//Modal 
let modal = null;
let instanciaModal = null;
// User Data
const userData = ref(JSON.parse(localStorage.getItem('datosUser') || '{}'));

// Computed Properties
const totalItems = computed(() => cartStore.totalItems);
const totalAmount = computed(() => cartStore.totalAmount);
const totalToPay = computed(() => cartStore.totalToPay);
const items = computed(() => cartStore.productos);
const whatsappLink = computed(() => `https://wa.me/+59170000000`);
const isDeliveryInfoComplete = computed(() => {
  return userData.value.nombre &&
    userData.value.direccion &&
    userData.value.telefono &&
    userData.value.email;
});
const canCheckout = computed(() => {
  return items.value.length > 0 && currentStep.value === 2;
});

// Methods
const formatPrice = (price) => {
  return price ? `${price.toLocaleString()} Bs` : '0 Bs';
};

const formatDate = (date) => {
  return new Intl.DateTimeFormat('es-BO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

const nextStep = () => {
  if (currentStep.value < 2) {
    currentStep.value++;
  }
};

const previousStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--;
  }
};

const editDeliveryInfo = () => {
  // Check if the user is logged in
  if (!token) {
    // Redirect to the login page
    router.push({ path: '/login' }); // Adjust the path as necessary
    return; // Exit the function
  }

  // If the user is logged in, show the modal
  instanciaModal.show();
};

const toggleSummary = () => {
  isOrderSummaryVisible.value = !isOrderSummaryVisible.value;
};

const showProductDetails = (product) => {
  Swal.fire({
    title: product.nombre,
    html: `
        <div class="product-details-modal">
          <img src="${product.image}" alt="${product.nombre}" style="max-width: 200px;">
          <p>${product.specs || ''}</p>
          <p class="price">${formatPrice(product.precio)}</p>
          <div class="specs">
            <p>Modelo: ${product.modelo}</p>
            <p>Cantidad mínima: ${product.cantidad_minima} unidades</p>
            <p>Cantidad máxima: ${product.cantidad_maxima} unidades</p>
          </div>
        </div>
      `,
    width: 600,
    showConfirmButton: false,
    showCloseButton: true
  });
};

const confirmRemoveProduct = (product) => {
  Swal.fire({
    title: '¿Eliminar producto?',
    text: `¿Estás seguro de eliminar ${product.nombre} del carrito?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.isConfirmed) {
      cartStore.removeFromCart(product.id, product.modeloId);
      showToast('Producto eliminado del carrito', 'success');
    }
  });
};

const showToast = (message, icon = 'success') => {
  Swal.fire({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    icon,
    title: message
  });
};

const increaseQuantity = (product) => {
  if (product.cantidad < product.cantidad_maxima) {
    cartStore.updateQuantity(product.id, product.modeloId, product.cantidad + 1);
    showToast(`Cantidad actualizada: ${product.cantidad + 1}`, 'info');
  }
};

const decreaseQuantity = (product) => {
  if (product.cantidad > product.cantidad_minima) {
    cartStore.updateQuantity(product.id, product.modeloId, product.cantidad - 1);
    showToast(`Cantidad actualizada: ${product.cantidad - 1}`, 'info');
  }
};

const applyCoupon = async () => {
  if (!cuponForm.value.codigo) {
    showToast('Por favor, ingrese un código de cupón', 'warning');
    return;
  }

  try {
    const response = await validateCuponBE(cuponForm.value);
    if (response.data.success) {
      cartStore.applyCoupon(response.data.cupon);
      couponMessage.value = `¡Cupón aplicado exitosamente!`;
      couponSuccess.value = true;
      showToast('Cupón aplicado con éxito', 'success');
    } else {
      couponMessage.value = 'Cupón no válido o expirado';
      couponSuccess.value = false;
      showToast('Cupón no válido', 'error');
    }
  } catch (error) {
    couponMessage.value = 'Error al aplicar el cupón';
    couponSuccess.value = false;
    showToast('Error al procesar el cupón', 'error');
  }
};

const removeCoupon = () => {
  cartStore.removeCoupon();
  cuponForm.value.codigo = '';
  couponMessage.value = '';
  showToast('Cupón eliminado', 'info');
};

const showTerms = () => {
  Swal.fire({
    title: 'Términos y Condiciones',
    html: `
        <div class="terms-modal">
          <h3>Términos de Compra</h3>
          <p>Al realizar una compra en nuestra plataforma, aceptas los siguientes términos...</p>
          <!-- Agregar más contenido de términos y condiciones -->
        </div>
      `,
    width: 600,
    confirmButtonText: 'Entendido'
  });
};
let token = localStorage.getItem('token');
const finalizeOrder = async () => {
  if (!canCheckout.value) return;

  // Check if the user is logged in
  if (!token) {
    // Redirect to the login page
    router.push({ path: '/login' }); // Adjust the path as necessary
    return; // Exit the function
  }

  try {
    const orderData = {
      productos: items.value,
      total_amount: totalAmount.value,
      total_to_pay: totalToPay.value,
      cupon_id: cartStore.cupon_id,
      user_info: userData.value
    };

    const { data } = await storePedido(orderData);
    orderId.value = data.orderId || Math.random().toString(36).substr(2, 9);
    orderFinalized.value = true;
    cartStore.$reset();

    showToast('¡Pedido realizado con éxito!', 'success');
  } catch (error) {
    showToast('Error al procesar el pedido', 'error');
  }
};

const closeSuccessModal = () => {
  orderFinalized.value = false;
  window.location.href = '/productos'; // O la ruta que desees
};

onMounted(() => {
  modal = document.getElementById("staticBackdrop");
  instanciaModal = new Modal(modal);
});
</script>

<style scoped>
.checkout-container {
  max-width: 1440px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f8f9fa;
  min-height: 100vh;
}

.checkout-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
}

.logo img {
  height: 48px;
  transition: transform 0.3s;
}

.logo img:hover {
  transform: scale(1.05);
}

.checkout-title {
  font-size: 24px;
  font-weight: bold;
  color: #333;
}

.badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: 9999px;
  font-size: 14px;
  background-color: #e6f0ff;
  color: #1a56db;
  margin-left: 8px;
}

.secure-checkout {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #10b981;
}

.checkout-content {
  display: flex;
  gap: 24px;
}

.steps-container {
  flex: 0 0 200px;
}

.progress-bar {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.progress-step {
  display: flex;
  align-items: center;
  gap: 12px;
}

.step-indicator {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  transition: background-color 0.3s, color 0.3s;
}

.progress-step.active .step-indicator {
  background-color: #3b82f6;
  color: white;
}

.progress-line {
  width: 2px;
  height: 40px;
  background-color: #e5e7eb;
  margin-left: 15px;
  transition: background-color 0.3s;
}

.progress-line.active {
  background-color: #3b82f6;
}

.main-content {
  flex: 1;
}

.delivery-section,
.products-section {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 24px;
  margin-bottom: 24px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.edit-btn,
.continue-btn,
.remove-btn,
.control-btn,
.apply-coupon-btn,
.remove-coupon-btn,
.checkout-btn,
.back-btn {
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: bold;
  transition: background-color 0.3s, color 0.3s;
  cursor: pointer;
  margin: 10px 0;
}

.edit-btn {
  background-color: #f3f4f6;
  color: #4b5563;
}

.edit-btn:hover {
  background-color: #e5e7eb;
}

.continue-btn,
.back-btn {
  background-color: #3b82f6;
  color: white;
}

.continue-btn:hover,
.back-btn:hover {
  background-color: #2563eb;
}

.remove-btn {
  background-color: #ef4444;
  color: white;
}

.remove-btn:hover {
  background-color: #dc2626;
}

.control-btn {
  background-color: #f3f4f6;
  color: #4b5563;
  padding: 8px 12px;
}

.control-btn:hover:not(:disabled) {
  background-color: #e5e7eb;
}

.apply-coupon-btn {
  background-color: #10b981;
  color: white;
}

.apply-coupon-btn:hover {
  background-color: #059669;
}

.remove-coupon-btn {
  background-color: #ef4444;
  color: white;
}

.remove-coupon-btn:hover {
  background-color: #dc2626;
}

.checkout-btn {
  background-color: #3b82f6;
  color: white;
  width: 100%;
  padding: 12px;
  font-size: 18px;
  margin-top: 20px;
}

.checkout-btn:hover:not(:disabled) {
  background-color: #2563eb;
}

.checkout-btn:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
}

.user-info-card {
  background-color: #f9fafb;
  border-radius: 8px;
  padding: 16px;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.info-row i {
  font-size: 20px;
  color: #4b5563;
}

.info-row label {
  font-weight: bold;
  color: #374151;
}

.product-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 16px;
  margin-bottom: 16px;
  display: flex;
  gap: 16px;
  transition: box-shadow 0.3s;
}

.product-card:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.product-image-container {
  position: relative;
  width: 128px;
  height: 128px;
  flex-shrink: 0;
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
}

.image-overlay {
  position: absolute;
  inset: 0;
  background-color: rgba(0, 0, 0, 0);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: background-color 0.3s, opacity 0.3s;
}

.product-card:hover .image-overlay {
  background-color: rgba(0, 0, 0, 0.3);
  opacity: 1;
}

.view-details-btn {
  padding: 8px;
  background-color: white;
  border-radius: 50%;
  color: #1f2937;
  transform: scale(0.9);
  transition: transform 0.3s;
}

.view-details-btn:hover {
  transform: scale(1);
}

.product-details {
  flex: 1;
}

.price-tag {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-top: 8px;
}

.current-price {
  font-size: 20px;
  font-weight: bold;
  color: #2563eb;
}

.unit-price {
  font-size: 14px;
  color: #6b7280;
}

.product-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 8px;
}

.meta-item {
  font-size: 14px;
  color: #4b5563;
  background-color: #f3f4f6;
  padding: 4px 8px;
  border-radius: 9999px;
}

.quantity-control {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
}

.quantity-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 60px;
  text-align: center;
}

.order-summary {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 24px;
  flex: 0 0 300px;
  align-self: flex-start;
}

.summary-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.summary-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #4b5563;
}

.summary-row.total {
  font-size: 18px;
  font-weight: bold;
  color: #111827;
  padding-top: 12px;
  border-top: 1px solid #e5e7eb;
}

.coupon-input-group {
  display: flex;
  gap: 8px;
  margin-top: 16px;
}

.coupon-input {
  flex: 1;
  padding: 8px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
}

.coupon-input:focus {
  outline: none;
  box-shadow: 0 0 0 2px #3b82f6;
  border-color: #3b82f6;
}

.success-modal {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 50;
}

.modal-content {
  background-color: white;
  border-radius: 8px;
  padding: 32px;
  max-width: 400px;
  width: 100%;
  margin: 0 16px;
  text-align: center;
}

.success-icon {
  font-size: 48px;
  color: #10b981;
  margin-bottom: 16px;
}

@media (max-width: 1024px) {
  .checkout-content {
    flex-direction: column;
  }

  .order-summary {
    position: sticky;
    top: 20px;
    width: 100%;
    margin-top: 24px;
  }
}

@media (max-width: 768px) {
  .checkout-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .checkout-title {
    margin-top: 12px;
    margin-bottom: 12px;
  }

  .secure-checkout {
    margin-top: 12px;
  }

  .progress-bar {
    flex-direction: row;
    justify-content: space-between;
  }

  .progress-line {
    width: 40px;
    height: 2px;
    margin: 0;
  }

  .product-card {
    flex-direction: column;
  }

  .product-image-container {
    width: 100%;
    height: 200px;
  }

  .order-summary {
    position: static;
  }

  .coupon-input-group {
    flex-direction: column;
  }

  .coupon-input,
  .apply-coupon-btn,
  .remove-coupon-btn {
    width: 100%;
    margin-top: 8px;
  }
}

@media (max-width: 480px) {
  .checkout-header {
    padding: 16px;
  }

  .logo img {
    height: 36px;
  }

  .checkout-title {
    font-size: 20px;
  }

  .badge {
    font-size: 12px;
  }

  .progress-bar {
    flex-direction: column;
    align-items: flex-start;
  }

  .progress-line {
    width: 2px;
    height: 24px;
    margin-left: 15px;
  }

  .product-meta {
    flex-direction: column;
    gap: 8px;
  }

  .quantity-control {
    flex-wrap: wrap;
    justify-content: center;
  }
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes slideDown {
  from {
    transform: translateY(-20px);
    opacity: 0;
  }

  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
  }

  to {
    transform: translateX(0);
  }
}

.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>