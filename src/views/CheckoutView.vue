<script setup>
import CheckoutHeaderComponent from '@/Components/Checkout/CheckoutHeaderComponent.vue'
import CheckoutStepsComponente from '@/Components/Checkout/CheckoutStepsComponente.vue'
import OrderSummaryComponent from '@/Components/Checkout/OrderSummaryComponent.vue'
import ProductListComponent from '@/Components/Checkout/ProductListComponent.vue'

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

const products = [
  {
    id: 1,
    name: 'Moto Eléctrica FAPP 350W',
    specs: '(Batería de Litio)',
    price: 55500,
    unitPrice: 1850,
    quantity: 30,
    image: '/moto.jpg'
  },
  {
    id: 2,
    name: 'Calentador tipo Hongo 13KW',
    price: 86150,
    unitPrice: 1150,
    quantity: 75,
    image: '/calentador.jpg'
  }
]

const orderSummary = {
  totalProducts: 141750,
  amountToPay: 99225,
  pending: 42525,
  discount: 0
}
</script>

<template>
  <div class="checkout-container">
    <CheckoutHeaderComponent />
    <div class="checkout-content">
      <div class="main-content">
        <CheckoutStepsComponente
          :delivery-address="deliveryAddress"
          :payment-method="paymentMethod"
        />
        <ProductListComponent :products="products" />
      </div>
      <OrderSummaryComponent
        :summary="orderSummary"
        class="order-summary-sidebar"
      />
    </div>
  </div>
</template>

<style scoped>
.root-variables {
  --primary-color: #C41E3A;
  --text-color: #333;
  --border-color: #E5E5E5;
  --background-gray: #F5F5F5;
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
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.order-summary-sidebar {
  position: relative;
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
    box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
  }
}
</style>