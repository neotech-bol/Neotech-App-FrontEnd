<template>
  <div class="checkout-container">
    <header class="checkout-header">
      <div class="logo">
        <img src="../../public/logo/Logo Neofetch PNG.png" alt="Neo Tech-Bol" />
      </div>
      <h1>Finalizar Pedido <span>({{ totalItems }} ítems)</span></h1>
      <div class="lock-icon">
        <i class="fas fa-lock"></i>
      </div>
    </header>
    <div class="checkout-content">
      <div class="main-content">
        <div class="checkout-steps">
          <div v-for="(step, index) in checkoutSteps" :key="index" class="step">
            <div class="step-header">
              <span class="step-number">{{ index + 1 }}</span>
              <h2>{{ step.title }}</h2>
              <button v-if="step.editable" class="edit-button">
                <i class="fas fa-edit"></i> Alterar
              </button>
            </div>
            <div class="step-content">
              <component :is="step.component" v-bind="step.props" />
            </div>
          </div>
        </div>

        <div class="product-list">
          <div v-for="product in items" :key="product.id" class="product-item">
            <img :src="product.image" :alt="product.nombre" class="product-image">
            <div class="product-info">
              <h3>{{ product.nombre }}</h3>
              <p v-if="product.specs" class="specs">{{ product.specs }}</p>
              <p class="price">{{ formatPrice(product.precio) }}</p>
              <p class="unit-price">(Precio unitario: {{ formatPrice(product.precio) }})</p>
              <div class="quantity-controls">
                <button @click="decreaseQuantity(product.id)" :disabled="product.cantidad <= 10" class="quantity-btn">
                  <i class="fas fa-minus"></i>
                </button>
                <span class="quantity">{{ product.cantidad }} und.</span>
                <button @click="increaseQuantity(product.id)" class="quantity-btn">
                  <i class="fas fa-plus"></i>
                </button>
                <button @click="removeProduct(product.id)" class="remove-btn">
                  <i class="fas fa-trash"></i> Eliminar
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

        <button class="checkout-button" @click="finalizeOrder">
          <i class="fas fa-check-circle"></i> FINALIZAR PEDIDO
        </button>

        <p class="terms">
          Al hacer clic en "Realizar pedido", aceptas los
          <a href="#">términos y condiciones</a> del servicio.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useCartStore } from '@/stores/cart';
import { computed, ref } from 'vue';

const cartStore = useCartStore();

const deliveryAddress = {
  name: 'María Fernanda Antezana',
  address: 'Circunvalación y Av. Blanco Galindo, #305',
  district: 'Barrio: Las Lomas, Cochabamba',
  phone: '+591 709 876543'
};

const paymentMethod = {
  type: 'Tarjeta de Crédito VISA',
  number: '**** **** **** 8420',
  bank: 'Banco Económico'
};

const totalItems = computed(() => cartStore.totalItems);
const totalAmount = computed(() => cartStore.totalAmount);
const totalToPay = computed(() => cartStore.totalToPay);
const pending = computed(() => cartStore.pending);
const items = computed(() => cartStore.items);

const increaseQuantity = (productId) => {
  const item = cartStore.items.find(item => item.id === productId);
  if (item) {
    cartStore.updateQuantity(productId, item.cantidad + 1);
  }
};

const decreaseQuantity = (productId) => {
  const item = cartStore.items.find(item => item.id === productId);
  if (item && item.cantidad > 10) {
    cartStore.updateQuantity(productId, item.cantidad - 1);
  }
};

const removeProduct = (productId) => {
  cartStore.removeFromCart(productId);
};

const formatPrice = (price) => {
  return price ? `${price.toLocaleString()} Bs` : '0 Bs';
};

const finalizeOrder = () => {
  console.log("Pedido finalizado:", {
    items: items.value,
    totalAmount: totalAmount.value,
    totalToPay: totalToPay.value,
    pending: pending.value,
    deliveryAddress,
  });
};

const checkoutSteps = [
  {
    title: 'Ubicación de Entrega',
    editable: true,
    component: 'div',
    props: {
      innerHTML: `
        <p>${deliveryAddress.name}</p>
        <p>${deliveryAddress.address}</p>
        <p>${deliveryAddress.district}</p>
        <p>${deliveryAddress.phone}</p>
      `
    }
  },
  {
    title: 'Revise los Items y Envío',
    editable: false,
    component: 'div'
  }
];
</script>

<style scoped>
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  color: #333;
  background-color: #F5F5F5;
}

.checkout-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.checkout-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 0;
  border-bottom: 1px solid #E5E5E5;
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
  font-size: 24px;
  font-weight: 500;
  margin: 0;
  text-align: center;
  flex-grow: 1;
}

h1 span {
  color: #666;
  font-weight: normal;
}

.lock-icon {
  color: #C41E3A;
  font-size: 20px;
}

.checkout-content {
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 20px;
}

.main-content, .order-summary {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.3s ease;
}

.main-content:hover, .order-summary:hover {
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.checkout-steps {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.step {
  border-bottom: 1px solid #E5E5E5;
  padding-bottom: 20px;
}

.step:last-child {
  border-bottom: none;
}

.step-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
}

.step-number {
  background: #C41E3A;
  color: white;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: bold;
}

h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
}

.edit-button {
  margin-left: auto;
  color: #C41E3A;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  transition: color 0.3s ease;
}

.edit-button:hover {
  color: #a01830;
}

.step-content {
  padding-left: 45px;
}

.step-content p {
  margin: 5px 0;
  color: #666;
}

.coupon-input {
  width: 100%;
  max-width: 300px;
  padding: 10px 12px;
  border: 1px solid #E5E5E5;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.3s ease;
}

.coupon-input:focus {
  border-color: #C41E3A;
  outline: none;
}

.product-list {
  margin-top: 20px;
}

.product-item {
  display: flex;
  gap: 20px;
  padding: 20px 0;
  border-bottom: 1px solid #E5E5E5;
  transition: background-color 0.3s ease;
}

.product-item:hover {
  background-color: #f9f9f9;
}

.product-item:last-child {
  border-bottom: none;
}

.product-image {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 8px;
  transition: transform 0.3s ease;
}

.product-image:hover {
  transform: scale(1.05);
}

.product-info {
  flex: 1;
}

.product-info h3 {
  margin: 0 0 5px 0;
  font-size: 18px;
  font-weight: 500;
}

.specs {
  color: #666;
  margin: 0 0 5px 0;
  font-size: 14px;
}

.price {
  font-weight: 500;
  margin: 5px 0;
  color: #C41E3A;
}

.unit-price {
  color: #666;
  font-size: 14px;
  margin: 0;
}

.quantity-controls {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
}

.quantity-btn, .remove-btn {
  padding: 5px 10px;
  background-color: #C41E3A;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.quantity-btn:hover, .remove-btn:hover {
  background-color: #a01830;
}

.quantity-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.quantity {
  font-weight: bold;
}

.remove-btn {
  background-color: #dc3545;
}

.remove-btn:hover {
  background-color: #c82333;
}

.summary-items {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  color: #666;
  font-size: 14px;
}

.total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 500;
  margin: 20px 0;
  padding-top: 20px;
  border-top: 1px solid #C41E3A;
}

.total-amount {
  color: #C41E3A;
  font-size: 24px;
  font-weight: bold;
}

.checkout-button {
  width: 100%;
  padding: 15px;
  background: #C41E3A;
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.1s ease;
}

.checkout-button:hover {
  background-color: #a01830;
}

.checkout-button:active {
  transform: scale(0.98);
}

.terms {
  margin: 15px 0 0 0;
  font-size: 12px;
  color: #666;
  text-align: center;
}

.terms a {
  color: #C41E3A;
  text-decoration: none;
  transition: color 0.3s ease;
}

.terms a:hover {
  color: #a01830;
}

@media (max-width: 1024px) {
  .checkout-content {
    grid-template-columns: 1fr;
  }

  .order-summary {
    position: sticky;
    bottom: 0;
    background: white;
    padding: 15px;
    box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
    z-index: 10;
  }
}

@media (max-width: 768px) {
  .checkout-header {
    flex-direction: column;
    align-items: center;
    gap: 10px;
  }

  .logo img {
    height: 30px;
  }

  h1 {
    font-size: 20px;
  }

  .product-item {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .product-image {
    width: 150px;
    height: 150px;
  }

  .quantity-controls {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .checkout-container {
    padding: 10px;
  }

  .main-content, .order-summary {
    padding: 15px;
  }

  .step-content {
    padding-left: 0;
  }

  .coupon-input {
    max-width: 100%;
  }
}
</style>

