<script setup lang="ts">
</script>

<template>
  <header class="checkout-header">
    <div class="logo">
      <img src="" alt="Neo Tech-Bol" />
    </div>
    <h1>Finalizar Pedido <span>(2 ítems)</span></h1>
    <div class="lock-icon">🔒</div>
  </header>
</template>

<style scoped>
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
</style>