<template>
  <div class="checkout-container">
    <header class="checkout-header">
 <!--      <div class="logo">
        <img src="../../public/logo/Logo Neofetch PNG.png" alt="Neo Tech-Bol" />
      </div> -->
      <h1>Finalizar Pedido <span>({{ totalItems }} ítems)</span></h1>
      <div class="lock-icon">
        <i class="fas fa-lock"></i>
      </div>
    </header>

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
              <div v-if="!checkoutSteps[0].editing">
                <p v-if="deliveryInfo.nombre"><i class="fas fa-user"></i> {{ deliveryInfo.nombre }}</p>
                <p v-if="deliveryInfo.direccion"><i class="fas fa-map-marker-alt"></i> {{ deliveryInfo.direccion }}</p>
                <p v-if="deliveryInfo.telefono"><i class="fas fa-phone"></i> {{ deliveryInfo.telefono }}</p>
                <p v-if="deliveryInfo.email"><i class="fas fa-envelope"></i> {{ deliveryInfo.email }}</p>
              </div>
              <div v-else class="form-grid">
                <div class="form-group">
                  <label for="nombre">Nombre completo</label>
                  <input id="nombre" v-model="deliveryInfo.nombre" placeholder="Nombre completo" required>
                </div>
                <div class="form-group">
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
              <div class="product-list">
                <div v-for="product in items" :key="product.id" class="product-item">
                  <img :src="product.image" :alt="product.nombre" class="product-image">
                  <div class="product-info">
                    <h3>{{ product.nombre }}</h3>
                    <p v-if="product.specs" class="specs">{{ product.specs }}</p>
                    <p class="price">{{ formatPrice(product.precio) }}</p>
                    <p class="unit-price">(Precio unitario: {{ formatPrice(product.precio) }})</p>
                    <div class="product-details">
                      <p class="min-quantity">Cantidad mínima: {{ product.cantidad_minima }} und.</p>
                      <p class="max-quantity">Cantidad máxima: {{ product.cantidad_maxima }} und.</p>
                      <p class="model">Modelo: {{ product.modelo }}</p>
                    </div>
                    <div class="quantity-controls">
                      <button @click="decreaseQuantity(product)" :disabled="product.cantidad <= product.cantidad_minima"
                        class="quantity-btn">
                        <i class="fas fa-minus"></i>
                      </button>
                      <span class="quantity">{{ product.cantidad }} und.</span>
                      <button @click="increaseQuantity(product)" :disabled="product.cantidad >= product.cantidad_maxima"
                        class="quantity-btn">
                        <i class="fas fa-plus"></i>
                      </button>
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
                    <i class="fas fa-percentage"></i> Descuento aplicado: 
                    {{ cartStore.tipoDescuento === 'porcentaje' ? cartStore.descuento + '%' : formatPrice(cartStore.descuento) }}
                  </p>
                  <p>
                    <i class="fas fa-calculator"></i> Monto de descuento en porcentaje: {{ cartStore.montoPorcentaje }}%
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
                <div class="payment-option">
                  <input type="radio" id="qr-payment" name="payment-method" value="qr" v-model="paymentMethod">
                  <label for="qr-payment">
                    <i class="fas fa-qrcode"></i>
                    Pago por QR
                  </label>
                  <div v-if="paymentMethod === 'qr'" class="payment-details">
                    <p>Escanea el siguiente código QR para realizar el pago:</p>
                    <div class="qr-payment-image">
                      <img src="../../public/QrDueño/payment-qr.png" alt="QR Code para pago">
                    </div>
                    <div class="voucher-upload">
                      <label for="voucher-file">Subir comprobante de pago (requerido)</label>
                      <div class="file-upload-container">
                        <input type="file" id="voucher-file" @change="handleFileUpload" accept="image/*" class="file-input">
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
                <div class="payment-option">
                  <input type="radio" id="in-person" name="payment-method" value="in-person" v-model="paymentMethod">
                  <label for="in-person">
                    <i class="fas fa-store"></i>
                    Pago en Instalaciones
                  </label>
                  <div v-if="paymentMethod === 'in-person'" class="payment-details">
                    <p>Puedes realizar el pago directamente en nuestras instalaciones:</p>
                    <div class="store-info">
                      <p><i class="fas fa-map-marker-alt"></i> Dirección: Av. Principal #123, La Paz</p>
                      <p><i class="fas fa-clock"></i> Horario: Lunes a Viernes de 9:00 a 18:00</p>
                      <p><i class="fas fa-phone"></i> Teléfono: +591 2 1234567</p>
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
        <h2>Resumen del pedido</h2>

        <div class="summary-items">
          <div class="summary-item">
            <span>Total en Productos:</span>
            <span>{{ formatPrice(totalAmount) }}</span>
          </div>
          <div class="summary-item" v-if="cartStore.descuento > 0">
            <span>Descuento:</span>
            <span>-{{ cartStore.tipoDescuento === 'porcentaje' ? cartStore.descuento + '%' : formatPrice(cartStore.descuento) }}</span>
          </div>
          <div class="summary-item">
            <span>Monto a cancelar:</span>
            <span>{{ formatPrice(totalToPay) }}</span>
          </div>
          <div class="summary-item">
            <span>Pendiente:</span>
            <span>{{ formatPrice(pending) }}</span>
          </div>
        </div>

        <div class="total">
          <span>Monto final:</span>
          <span class="total-amount">{{ formatPrice(totalAmount) }}</span>
        </div>

        <div class="checkout-progress">
          <div class="progress-bar">
            <div class="progress" :style="{ width: progressPercentage + '%' }"></div>
          </div>
          <p class="progress-text">Paso {{ activeStep + 1 }} de {{ checkoutSteps.length }}</p>
        </div>

        <p class="terms">
          Al hacer clic en "Finalizar pedido", aceptas los
          <a href="#">términos y condiciones</a> del servicio.
        </p>

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
  </div>
</template>

<script setup>
import { validateCuponBE } from '@/Services/CuponService';
import { storePedido } from '@/Services/PedidoService';
import { useCartStore } from '@/stores/cart';
import Swal from 'sweetalert2';
import { computed, ref, onMounted } from 'vue';

const cartStore = useCartStore();
const userData = ref({});
const couponMessage = ref('');
const couponError = ref(false);
const cuponForm = ref({
  codigo: '',
});
const orderFinalized = ref(false);
const whatsappNumber = '+59170000000'; // Reemplaza con el número real
const whatsappLink = computed(() => `https://wa.me/${whatsappNumber}`);

const deliveryInfo = ref({
  nombre: '',
  direccion: '',
  telefono: '',
  email: ''
});

// Payment method
const paymentMethod = ref('');
const voucherFile = ref(null);
const voucherPreview = ref('');

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
         deliveryInfo.value.direccion && 
         deliveryInfo.value.telefono && 
         deliveryInfo.value.email;
});

const isPaymentValid = computed(() => {
  if (paymentMethod.value === 'qr') {
    return voucherFile.value !== null;
  } else if (paymentMethod.value === 'in-person') {
    return true;
  }
  return false;
});

onMounted(() => {
  const storedData = localStorage.getItem('datosUser');
  if (storedData) {
    deliveryInfo.value = JSON.parse(storedData);
  }
});

// Navigation functions
const nextStep = () => {
  if (activeStep.value < checkoutSteps.value.length - 1) {
    checkoutSteps.value[activeStep.value].completed = true;
    activeStep.value++;
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
console.log(items.value);
const pedidoForm = ref({});

const increaseQuantity = (product) => {
  const item = cartStore.productos.find(item => item.id === product.id && item.modeloId === product.modeloId);
  if (item && item.cantidad < item.cantidad_maxima) {
    cartStore.updateQuantity(item.id, item.modeloId, item.cantidad + 1);
  } else if (item) {
    Swal.fire({
      title: "Advertencia",
      text: `No se puede aumentar la cantidad del producto ${item.nombre} más allá de ${item.cantidad_maxima}.`,
      icon: "warning",
      confirmButtonText: "Aceptar",
    });
  }
};

const decreaseQuantity = (product) => {
  const item = cartStore.productos.find(item => item.id === product.id && item.modeloId === product.modeloId);
  if (item && item.cantidad > item.cantidad_minima) {
    cartStore.updateQuantity(item.id, item.modeloId, item.cantidad - 1);
  } else if (item) {
    Swal.fire({
      title: "Advertencia",
      text: `La cantidad mínima para el producto ${item.nombre} es ${item.cantidad_minima}.`,
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
      cartStore.removeFromCart(product.id, product.modeloId);
    }
  });
};

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
    Swal.fire({
      title: "Advertencia",
      text: paymentMethod.value === 'qr' 
        ? "Por favor, sube el comprobante de pago antes de finalizar el pedido." 
        : "Por favor, selecciona un método de pago.",
      icon: "warning",
      confirmButtonText: "Aceptar",
    });
    return;
  }

  // Verificar que items.value sea un array válido
  console.log("Productos a enviar:", items.value);
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
  
  // No usar JSON.stringify para los productos
  // En su lugar, añadir cada producto como una entrada separada en el FormData
  items.value.forEach((producto, index) => {
    formData.append(`productos[${index}][id]`, producto.id);
    formData.append(`productos[${index}][cantidad]`, producto.cantidad);
    // Si necesitas enviar más campos de cada producto, agrégalos aquí
  });
  
  // Agregar otros datos del pedido
  formData.append('total_amount', totalAmount.value);
  formData.append('total_to_pay', totalToPay.value);
  formData.append('pending', pending.value);
  formData.append('cupon_id', cartStore.cupon_id || '');
  formData.append('payment_method', paymentMethod.value);
  
  // Para delivery_info, sí necesitamos usar JSON.stringify porque es un objeto complejo
  // y no está siendo validado como array en el backend
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
        // Mostrar los datos que se van a enviar para depuración
        console.log("FormData a enviar:");
        for (let [key, value] of formData.entries()) {
          console.log(key, value);
        }
        
        // Enviar el FormData
        const { data } = await storePedido(formData);
        console.log("Respuesta del servidor:", data);
        
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
  
  console.log('Todos los datos del pedido han sido limpiados');
  
  // Opcional: mostrar mensaje de confirmación
  Swal.fire({
    title: "Datos limpiados",
    text: "Tu carrito, cupón y datos de pago han sido eliminados",
    icon: "success",
    confirmButtonText: "Aceptar",
  });
};

const toggleEdit = (index) => {
  const step = checkoutSteps.value[index];
  if (step.editable) {
    step.editing = !step.editing;
    if (!step.editing) {
      localStorage.setItem('datosUser', JSON.stringify(deliveryInfo.value));
    }
  }
};
</script>

<style scoped>
body {
  margin: 0;
  font-family: 'Roboto', sans-serif;
  color: #343a40;
  background-color: #f8f9fa;
}

.checkout-container {
  max-width: 1440px;
  margin: 0 auto;
  padding: 20px;
}

.checkout-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 0;
  border-bottom: 2px solid #007bff;
  margin-bottom: 20px;
}

.logo img {
  height: 40px;
  transition: transform 0.3s ease;
}

.logo img:hover {
  transform: scale(1.05);
}

h1 {
  font-size: 28px;
  font-weight: 700;
  margin: 0;
  text-align: center;
  flex-grow: 1;
  color: #007bff;
}

h1 span {
  color: #6c757d;
  font-weight: normal;
}

.lock-icon {
  color: #007bff;
  font-size: 24px;
}

.checkout-content {
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 30px;
}

.main-content, .order-summary {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.3s ease;
}

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
  border-left: 4px solid #007bff;
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
  gap: 20px;
  margin-bottom: 20px;
}

.step-number {
  background: #007bff;
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: bold;
}

h2 {
  margin: 0;
  font-size: 22px;
  font-weight: 600;
  color: #007bff;
}

.edit-button {
  margin-left: auto;
  color: #007bff;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  transition: color 0.3s ease;
  display: flex;
  align-items: center;
  gap: 5px;
}

.edit-button:hover {
  color: #17a2b8;
}

.step-content {
  padding-left: 60px;
}

.step-content p {
  margin: 10px 0;
  color: #6c757d;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.step-content p i {
  color: #007bff;
  width: 20px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  color: #343a40;
}

input, select {
  width: 100%;
  padding: 12px 15px;
  border: 2px solid #f8f9fa;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.3s ease;
}

input:focus, select:focus {
  border-color: #007bff;
  outline: none;
}

.step-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

.next-button, .prev-button {
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.1s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.next-button {
  background-color: #007bff;
  color: white;
  border: none;
}

.next-button:hover {
  background-color: #0069d9;
}

.prev-button {
  background-color: #f8f9fa;
  color: #6c757d;
  border: 1px solid #dee2e6;
}

.prev-button:hover {
  background-color: #e9ecef;
}

.next-button:disabled, .prev-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.product-list {
  margin-top: 1px;
}

.product-item {
  display: flex;
  gap: 30px;
  padding: 20px;
  border-bottom: 2px solid #f8f9fa;
  transition: background-color 0.3s ease;
  border-radius: 8px;
}

.product-item:hover {
  background-color: #f8f9fa;
}

.product-item:last-child {
  border-bottom: none;
}

.product-image {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 12px;
  transition: transform 0.3s ease;
}

.product-image:hover {
  transform: scale(1.1);
}

.product-info {
  flex: 1;
}

.product-info h3 {
  margin: 0 0 10px 0;
  font-size: 20px;
  font-weight: 600;
  color: #343a40;
}

.specs {
  color: #6c757d;
  margin: 0 0 10px 0;
  font-size: 14px;
}

.price {
  font-weight: 600;
  margin: 10px 0;
  color: #007bff;
  font-size: 18px;
}

.unit-price {
  color: #6c757d;
  font-size: 14px;
  margin: 0;
}

.product-details {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin: 10px 0;
}

.min-quantity, .max-quantity, .model {
  color: #6c757d;
  font-size: 14px;
  margin: 5px 0;
}

.quantity-controls {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-top: 15px;
}

.quantity-btn, .remove-btn {
  padding: 8px 12px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.1s ease;
  font-size: 16px;
}

.quantity-btn:hover, .remove-btn:hover {
  background-color: #17a2b8;
}

.quantity-btn:active, .remove-btn:active {
  transform: scale(0.95);
}

.quantity-btn:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

.quantity {
  font-weight: bold;
  font-size: 18px;
}

.remove-btn {
  background-color: #dc3545;
  display: flex;
  align-items: center;
  gap: 5px;
}

.remove-btn:hover {
  background-color: #c82333;
}

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
  font-size: 16px;
  transition: border-color 0.3s ease;
}

.coupon-input:focus {
  border-color: #007bff;
  outline: none;
}

.apply-coupon-btn, .remove-coupon-btn {
  padding: 12px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  display: flex;
  align-items: center;
  gap: 5px;
}

.apply-coupon-btn:hover, .remove-coupon-btn:hover {
  background-color: #218838;
}

.apply-coupon-btn:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
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
  font-size: 14px;
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
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.payment-options {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.payment-option {
  padding: 15px;
  border: 2px solid #f8f9fa;
  border-radius: 8px;
  transition: border-color 0.3s ease;
}

.payment-option:hover {
  border-color: #007bff;
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
}

.payment-option label i {
  color: #007bff;
  font-size: 20px;
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
  width: 200px;
  height: 200px;
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
  color: #6c757d;
  font-size: 16px;
  transition: all 0.3s ease;
}

.file-upload-button:hover {
  background-color: #e9ecef;
  border-color: #adb5bd;
}

.file-name {
  display: block;
  margin-top: 10px;
  font-size: 14px;
  color: #6c757d;
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
  transition: background-color 0.3s ease;
}

.remove-voucher-btn:hover {
  background-color: #c82333;
}

.store-info {
  margin-top: 15px;
}

.store-info p {
  margin: 10px 0;
  color: #6c757d;
  display: flex;
  align-items: center;
  gap: 10px;
}

.store-info p i {
  color: #007bff;
  width: 20px;
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
  color: #6c757d;
  font-size: 16px;
}

.total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  margin: 30px 0;
  padding-top: 20px;
  border-top: 2px solid #007bff;
}

.total-amount {
  color: #007bff;
  font-size: 28px;
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
  background-color: #007bff;
  transition: width 0.3s ease;
}

.progress-text {
  margin-top: 10px;
  text-align: center;
  color: #6c757d;
  font-size: 14px;
}

.checkout-button {
  width: 100%;
  padding: 15px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 18px;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.1s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.checkout-button:hover {
  background-color: #0069d9;
}

.checkout-button:active {
  transform: scale(0.98);
}

.checkout-button:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

.terms {
  margin: 20px 0 0 0;
  font-size: 14px;
  color: #6c757d;
  text-align: center;
}

.terms a {
  color: #007bff;
  text-decoration: none;
  transition: color 0.3s ease;
}

.terms a:hover {
  color: #17a2b8;
}

.order-finalized {
  margin-top: 30px;
  text-align: center;
  padding: 20px;
  background-color: #e9f7ef;
  border-radius: 8px;
  border-left: 4px solid #28a745;
}

.order-finalized h3 {
  color: #28a745;
  font-size: 24px;
  margin-bottom: 15px;
}

.whatsapp-button {
  display: inline-block;
  background-color: #25D366;
  color: white;
  padding: 10px 20px;
  border-radius: 8px;
  text-decoration: none;
  font-size: 16px;
  margin-top: 15px;
  transition: background-color 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
}

.whatsapp-button:hover {
  background-color: #128C7E;
}

.qr-code {
  margin-top: 30px;
}

.qr-code img {
  width: 150px;
  height: 150px;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 10px;
}

.qr-code p {
  margin-top: 10px;
  font-size: 14px;
  color: #6c757d;
}

@media (max-width: 1024px) {
  .checkout-content {
    grid-template-columns: 1fr;
  }
  
  .order-summary {
    position: relative;
    margin-top: 30px;
  }
}

@media (max-width: 768px) {
  .checkout-header {
    flex-direction: column;
    align-items: center;
    gap: 15px;
  }
  
  .logo img {
    height: 35px;
  }
  
  h1 {
    font-size: 24px;
  }
  
  .product-item {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .product-image {
    width: 180px;
    height: 180px;
  }
  
  .quantity-controls {
    justify-content: center;
  }
  
  .step-content {
    padding-left: 0;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .product-details {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .checkout-container {
    padding: 15px;
  }
  
  .main-content, .order-summary {
    padding: 15px;
  }
  
  h1 {
    font-size: 22px;
  }
  
  h2 {
    font-size: 20px;
  }
  
  .step-number {
    width: 35px;
    height: 35px;
    font-size: 16px;
  }
  
  .product-image {
    width: 150px;
    height: 150px;
  }
  
  .coupon-input-group {
    flex-direction: column;
  }
  
  .checkout-button {
    font-size: 16px;
  }
  
  .whatsapp-button {
    font-size: 14px;
    padding: 8px 16px;
  }
  
  .qr-code img {
    width: 120px;
    height: 120px;
  }
}
</style>