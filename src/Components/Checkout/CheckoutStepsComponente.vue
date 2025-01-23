<!-- CheckoutSteps Pasos para pagar -->
<script setup lang="ts">
defineProps<{
  deliveryAddress: {
    name: string
    address: string
    district: string
    phone: string
  }
  paymentMethod: {
    type: string
    number: string
    bank: string
  }
}>()
</script>

<template>
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
        <input 
          type="text" 
          placeholder="¿Tienes un cupón? Ingrésalo aquí"
          class="coupon-input"
        >
      </div>
    </div>

    <div class="step">
      <div class="step-header">
        <span class="step-number">4</span>
        <h2>Revise los Items y Envío</h2>
      </div>
    </div>
  </div>
</template>

<style scoped>
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
</style>