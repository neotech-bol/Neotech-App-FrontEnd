<script setup lang="ts">
defineProps<{
  summary: {
    totalProducts: number
    amountToPay: number
    pending: number
    discount: number
  }
}>()

const formatPrice = (price: number) => {
  return `${price.toLocaleString()} Bs`
}
</script>

<template>
  <div class="order-summary">
    <h2>Resumen del pedido</h2>
    
    <div class="summary-items">
      <div class="summary-item">
        <span>Total en Productos:</span>
        <span>{{ formatPrice(summary.totalProducts) }}</span>
      </div>
      <div class="summary-item">
        <span>Monto a cancelar:</span>
        <span>{{ formatPrice(summary.amountToPay) }}</span>
      </div>
      <div class="summary-item">
        <span>Pendiente:</span>
        <span>{{ formatPrice(summary.pending) }}</span>
      </div>
      <div class="summary-item">
        <span>Descuento aplicado:</span>
        <span>{{ formatPrice(summary.discount) }}</span>
      </div>
    </div>

    <div class="total">
      <span>Monto final:</span>
      <span class="total-amount">{{ formatPrice(summary.amountToPay) }}</span>
    </div>

    <button class="checkout-button">FINALIZAR PEDIDO</button>

    <p class="terms">
      Al hacer clic en "Realizar pedido", aceptas los 
      <a href="#">términos y condiciones</a> del servicio.
    </p>
  </div>
</template>

<style scoped>
.order-summary {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
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

@media (max-width: 1024px) {
  .order-summary {
    border-radius: 0;
    margin: 0 -20px;
  }
}
</style>