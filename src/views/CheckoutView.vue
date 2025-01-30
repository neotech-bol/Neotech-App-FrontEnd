<template>
  <div class="checkout-container">
    <header class="checkout-header">
      <div class="logo">
        <img src="" alt="Neo Tech-Bol" />
      </div>
      <h1>Finalizar Pedido <span>({{ totalItems }} ítems)</span></h1>
      <div class="lock-icon">🔒</div>
    </header>
    <div class="checkout-content">
      <div class="main-content">
        <div class="checkout-steps">
          <div class="step">
            <div class="step-header">
              <span class="step-number">1</span>
              <h2>Ubicación de Entrega</h2>
              <button class="edit-button">Alterar</button>
            </div>
            <div class="step-content">
              <p>{{ deliveryAddress.name }}</p>
              <p>{{ deliveryAddress.address }}</p>
              <p>{{ deliveryAddress.district }}</p>
              <p>{{ deliveryAddress.phone }}</p>
            </div>
          </div>

          <div class="step">
            <div class="step-header">
              <span class="step-number">2</span>
              <h2>Método de Pago</h2>
              <button class="edit-button">Alterar</button>
            </div>
            <div class="step-content">
              <p>{{ paymentMethod.type }} {{ paymentMethod.number }}</p>
              <p>{{ paymentMethod.bank }}</p>
            </div>
          </div>

          <div class="step">
            <div class="step-header">
              <span class="step-number">3</span>
              <h2>Ofertas</h2>
            </div>
            <div class="step-content">
              <input type="text" placeholder="¿Tienes un cupón? Ingrésalo aquí" class="coupon-input">
            </div>
          </div>

          <div class="step">
            <div class="step-header">
              <span class="step-number">4</span>
              <h2>Revise los Items y Envío</h2>
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
                <button @click="decreaseQuantity(product.id)" :disabled="product.cantidad <= 10">-</button>
                <span class="quantity">{{ product.cantidad }} und.</span>
                <button @click="increaseQuantity(product.id)">+</button>
                <button @click="removeProduct(product.id)">Eliminar</button> <!-- Botón para eliminar el producto -->
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
            <span>{{ formatPrice(totalToPay) }}</span> <!-- Monto a pagar (70%) -->
          </div>
          <div class="summary-item">
            <span>Pendiente:</span>
            <span>{{ formatPrice(pending) }}</span> <!-- Muestra el monto pendiente (30%) -->
          </div>
        </div>

        <div class="total">
          <span>Monto final:</span>
          <span class="total-amount">{{ formatPrice(totalAmount) }}</span>
        </div>

        <button class="checkout-button" @click="finalizeOrder">FINALIZAR PEDIDO</button>

        <p class="terms">
          Al hacer clic en "Realizar pedido", aceptas los
          <a href="#">términos y condiciones</a> del servicio.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useCartStore } from '@/stores/cart'; // Asegúrate de que la ruta sea correcta
import { computed } from 'vue';

const cartStore = useCartStore(); // Inicializa el store del carrito
const deliveryAddress = {
  name: 'María Fernanda Antezana',
  address: 'Circunvalación y Av. Blanco Galindo, #305',
  district: 'Barrio: Las Lomas, Cochabamba',
  phone: '+591 709 876543'
}

const paymentMethod = {
  type: 'Tarjeta de Crédito VISA',
  number: '**** **** **** 8420',
  bank: 'Banco Económico'
}

// Computed properties para acceder a los datos del carrito
const totalItems = computed(() => cartStore.totalItems);
const totalAmount = computed(() => cartStore.totalAmount);
const totalToPay = computed(() => cartStore.totalToPay); // Accede al 70% del total
const pending = computed(() => cartStore.pending); // Accede al 30% del total
const items = computed(() => cartStore.items);

// Función para aumentar la cantidad de un producto
const increaseQuantity = (productId) => {
  const item = cartStore.items.find(item => item.id === productId);
  if (item) {
    // Permitir aumentar la cantidad sin restricciones
    cartStore.updateQuantity(productId, item.cantidad + 1);
  }
};

// Función para disminuir la cantidad de un producto
const decreaseQuantity = (productId) => {
  const item = cartStore.items.find(item => item.id === productId);
  if (item) {
    // Solo permite disminuir si la cantidad es mayor a 10
    if (item.cantidad > 10) {
      cartStore.updateQuantity(productId, item.cantidad - 1);
    } else {
      console.warn(`La cantidad mínima para el producto ${item.nombre} es 10.`);
    }
  }
};

// Función para eliminar un producto del carrito
const removeProduct = (productId) => {
  cartStore.removeFromCart(productId); // Llama a la función del store para eliminar el producto
};

// Función para formatear precios
const formatPrice = (price) => {
  if (price === undefined || price === null) {
    return '0 Bs'; // O cualquier valor predeterminado que desees
  }
  return `${price.toLocaleString()} Bs`;
}
const finalizeOrder = () => {
  // Aquí puedes agregar la lógica para validar los datos
  // y enviar el pedido a tu API o backend.
  console.log("Pedido finalizado:", {
    items: items.value,
    totalAmount: totalAmount.value,
    totalToPay: totalToPay.value,
    deliveryAddress,
    paymentMethod,
  });

  // Aquí podrías redirigir al usuario a una página de confirmación
  // o mostrar un mensaje de éxito.
}
</script>
<style scoped>
.root-variables {
  --primary-color: #C41E3A;
  --text-color: #333;
  --border-color: #E5E5E5;
  --background-gray: #F5F5F5;
}
.quantity-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.quantity-controls button {
  padding: 5px 10px;
  background-color: #C41E3A;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.quantity-controls button:disabled {
  background-color: #ccc; /* Color para el botón deshabilitado */
  cursor: not-allowed;
}

.quantity {
  font-weight: bold;
}
.checkout-header {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 15px 0;
}

.logo img {
  height: 40px;
}

h1 {
  font-size: 24px;
  font-weight: 500;
  margin: 0;
}

h1 span {
  color: #666;
  font-weight: normal;
}

.lock-icon {
  margin-left: auto;
  color: #666;
}

.app-defaults {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  color: var(--text-color);
  background-color: var(--background-gray);
}

.checkout-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.checkout-content {
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 20px;
  margin-top: 20px;
}

.main-content {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.order-summary-sidebar {
  position: relative;
}

.order-summary {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

h2 {
  margin: 0 0 20px 0;
  font-size: 18px;
  font-weight: 500;
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
  border-top: 1px solid #b92e47;
}

.total-amount {
  color: #2022a3;
  font-size: 20px;
}

.checkout-button {
  width: 100%;
  padding: 15px;
  background: #b92e47;
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.checkout-button:hover {
  background-color: #a01830;
}

.terms {
  margin: 15px 0 0 0;
  font-size: 12px;
  color: #666;
  text-align: center;
}

.terms a {
  color: #0066cc;
  text-decoration: none;
}

.terms a:hover {
  text-decoration: underline;
}

.product-list {
  margin-top: 20px;
}

.product-item {
  display: flex;
  gap: 20px;
  padding: 20px 0;
  border-bottom: 1px solid var(--border-color);
}

.product-item:last-child {
  border-bottom: none;
}

.product-image {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 4px;
}

.product-info {
  flex: 1;
}

.product-info h3 {
  margin: 0 0 5px 0;
  font-size: 16px;
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
}

.unit-price {
  color: #666;
  font-size: 14px;
  margin: 0;
}

.quantity {
  color: #666;
  font-size: 14px;
  margin: 5px 0 0 0;
}

.checkout-steps {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.step {
  border-bottom: 1px solid var(--border-color);
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
  background: var(--primary-color);
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}

h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
}

.edit-button {
  margin-left: auto;
  color: #0066cc;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
}

.step-content {
  padding-left: 39px;
}

.step-content p {
  margin: 5px 0;
  color: #666;
}

.coupon-input {
  width: 100%;
  max-width: 300px;
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 14px;
}

.coupon-input::placeholder {
  color: #999;
}

@media (max-width: 1024px) {
  .order-summary {
    border-radius: 0;
    margin: 0 -20px;
  }
}

@media (max-width: 1024px) {
  .checkout-content {
    grid-template-columns: 1fr;
  }

  .order-summary-sidebar {
    position: sticky;
    bottom: 0;
    background: white;
    padding: 15px;
    box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  }
}
</style>