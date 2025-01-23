<script setup lang="ts">
defineProps<{
  products: Array<{
    id: number
    name: string
    specs?: string
    price: number
    unitPrice: number
    quantity: number
    image: string
  }>
}>()

const formatPrice = (price: number) => {
  return `${price.toLocaleString()} Bs`
}
</script>

<template>
  <div class="product-list">
    <div v-for="product in products" :key="product.id" class="product-item">
      <img :src="product.image" :alt="product.name" class="product-image">
      <div class="product-info">
        <h3>{{ product.name }}</h3>
        <p v-if="product.specs" class="specs">{{ product.specs }}</p>
        <p class="price">{{ formatPrice(product.price) }}</p>
        <p class="unit-price">(Precio unitario: {{ formatPrice(product.unitPrice) }})</p>
        <p class="quantity">{{ product.quantity }} und.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
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
</style>