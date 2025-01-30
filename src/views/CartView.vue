<template>
    <div class="cart-container">
      <div class="cart-header">
        <h1>Carrito de Compras</h1>
        <p v-if="cartStore.totalItems === 0" class="empty-cart-message">
          Tu carrito está vacío
        </p>
      </div>
  
      <div v-if="cartStore.totalItems > 0" class="cart-content">
        <div class="cart-items">
          <div v-for="item in cartStore.items" :key="item.id" class="cart-item">
            <div class="item-image">
              <img :src="item.image" :alt="item.nombre">
            </div>
            
            <div class="item-details">
              <h3>{{ item.nombre }}</h3>
              <p class="item-price">{{ item.precio }} Bs</p>
            </div>
  
            <div class="quantity-controls">
              <button @click="cartStore.updateQuantity(item.id, item.cantidad - 1)">-</button>
              <span>{{ item.cantidad }}</span>
              <button @click="cartStore.updateQuantity(item.id, item.cantidad + 1)">+</button>
            </div>
  
            <div class="item-total">
              {{ (item.precio * item.cantidad).toFixed(2) }} Bs
            </div>
  
            <button class="remove-item" @click="cartStore.removeFromCart(item.id)">
              ✕
            </button>
          </div>
        </div>
  
        <div class="cart-summary">
          <h2>Resumen del Pedido</h2>
          <div class="summary-row">
            <span>Subtotal:</span>
            <span>{{ cartStore.totalAmount.toFixed(2) }} Bs</span>
          </div>
          <div class="summary-row">
            <span>Envío:</span>
            <span>Calculado al finalizar</span>
          </div>
          <div class="summary-total">
            <span>Total:</span>
            <span>{{ cartStore.totalAmount.toFixed(2) }} Bs</span>
          </div>
          <button class="checkout-button" @click="checkout">
            Proceder al Pago
          </button>
          <button class="clear-cart" @click="cartStore.clearCart">
            Vaciar Carrito
          </button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { useCartStore } from '@/stores/cart'; 
  
  const cartStore = useCartStore();
  
  const checkout = () => {
    // Implement checkout logic here
    console.log('Proceeding to checkout...');
  };
  </script>
  
  <style scoped>
  .cart-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
  }
  
  .cart-header {
    margin-bottom: 2rem;
  }
  
  .cart-header h1 {
    font-size: 2rem;
    color: #333;
  }
  
  .empty-cart-message {
    text-align: center;
    font-size: 1.2rem;
    color: #666;
    margin-top: 2rem;
  }
  
  .cart-content {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 2rem;
  }
  
  .cart-items {
    background: white;
    border-radius: 8px;
    padding: 1rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  .cart-item {
    display: grid;
    grid-template-columns: auto 1fr auto auto auto;
    gap: 1rem;
    align-items: center;
    padding: 1rem;
    border-bottom: 1px solid #eee;
  }
  
  .item-image img {
    width: 80px;
    height: 80px;
    object-fit: cover;
    border-radius: 4px;
  }
  
  .item-details h3 {
    margin: 0;
    font-size: 1.1rem;
  }
  
  .item-price {
    color: #666;
    margin: 0.5rem 0;
  }
  
  .quantity-controls {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .quantity-controls button {
    background: #f0f0f0;
    border: none;
    width: 24px;
    height: 24px;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .quantity-controls span {
    min-width: 24px;
    text-align: center;
  }
  
  .item-total {
    font-weight: bold;
  }
  
  .remove-item {
    background: none;
    border: none;
    color: #ff4444;
    cursor: pointer;
    font-size: 1.2rem;
  }
  
  .cart-summary {
    background: white;
    border-radius: 8px;
    padding: 1.5rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    height: fit-content;
  }
  
  .summary-row {
    display: flex;
    justify-content: space-between;
    margin: 1rem 0;
    color: #666;
  }
  
  .summary-total {
    display: flex;
    justify-content: space-between;
    margin: 1.5rem 0;
    font-weight: bold;
    font-size: 1.2rem;
    border-top: 2px solid #eee;
    padding-top: 1rem;
  }
  
  .checkout-button {
    width: 100%;
    padding: 1rem;
    background: #4CAF50;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 1.1rem;
    cursor: pointer;
    margin-bottom: 1rem;
  }
  
  .checkout-button:hover {
    background: #45a049;
  }
  
  .clear-cart {
    width: 100%;
    padding: 0.8rem;
    background: #ff4444;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .clear-cart:hover {
    background: #ff3333;
  }
  </style>