<template>
  <div class="favorites-container">
    <!-- Header simple -->
    <header class="favorites-header">
      <h1>Favoritos</h1>
      <span class="favorites-count">{{ favorites.length }} items</span>
    </header>

    <!-- Grid de productos -->
    <div class="products-grid">
      <div v-for="product in favorites" :key="product.producto.id" class="product-card">
        <div class="image-container">
          <img :src="product.producto.imagen_principal" :alt="product.producto.nombre">
          <button @click="removeFromFavorites(product.id)" class="remove-button" title="Eliminar de favoritos">
            <i class="fas fa-heart-broken"></i>
          </button>
        </div>

        <div class="product-info">
          <h3>{{ product.producto.nombre }}</h3>
          <p class="price">{{ formatPrice(product.producto.precio) }} Bs</p>
        </div>
      </div>
    </div>

    <!-- Estado vacío -->
    <div v-if="favorites.length === 0" class="empty-state">
      <i class="fas fa-heart"></i>
      <p>No hay favoritos guardados</p>
    </div>

    <!-- Notificación flotante -->
    <div v-if="showNotification" class="notification" :class="{ 'show': showNotification }">
      {{ notificationMessage }}
    </div>
  </div>
</template>

<script setup>
import { indexFavorites } from '@/Services/FavoriteService'
import { onMounted, ref } from 'vue'

const favorites = ref([]);
const showNotification = ref(false);
const notificationMessage = ref('');

onMounted(() => {
  userFavorites();
});

const removeFromFavorites = (productId) => {
  favorites.value = favorites.value.filter(product => product.id !== productId);
  showNotificationMessage('Eliminado de favoritos');
};

const showNotificationMessage = (message) => {
  notificationMessage.value = message;
  showNotification.value = true;
  setTimeout(() => {
    showNotification.value = false;
  }, 2000);
};

const userFavorites = async () => {
  try {
    const { data } = await indexFavorites();
    console.log(data);
    favorites.value = data;

    console.log(favorites.value);
  } catch (error) {
    console.log(error);
  }
};

// Función para formatear el precio
const formatPrice = (price) => {
  const numericPrice = parseFloat(price); // Convierte la cadena a un número
  if (!isNaN(numericPrice)) { // Verifica si la conversión fue exitosa
    return numericPrice.toFixed(2); // Formatea el número a 2 decimales
  }
  return 'N/A'; // O cualquier valor predeterminado que desees mostrar
};
</script>

<style scoped>
.favorites-container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 15px;
}

.favorites-header {
  margin-bottom: 20px;
  display: flex;
  align-items: baseline;
  gap: 10px;
}

.favorites-header h1 {
  font-size: 22px;
  font-weight: 600;
  margin: 0;
}

.favorites-count {
  color: #666;
  font-size: 14px;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
}

.product-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.2s;
}

.product-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
}

.image-container {
  position: relative;
  padding-top: 100%;
}

.image-container img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  background-color: #f8f8f8;
}

.remove-button {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 26px;
  height: 26px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  color: #e53e3e;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.remove-button:hover {
  background: #e53e3e;
  color: white;
}

.product-info {
  padding: 12px;
}

.product-info h3 {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.price {
  margin: 5px 0 0;
  font-size: 15px;
  font-weight: 600;
  color: #2c5282;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #666;
}

.empty-state i {
  font-size: 32px;
  color: #cbd5e0;
  margin-bottom: 10px;
}

.empty-state p {
  margin: 0;
  font-size: 14px;
}

.notification {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%) translateY(100px);
  background-color: #333;
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  opacity: 0;
  transition: all 0.3s;
}

.notification.show {
  transform: translateX(-50%) translateY(0);
  opacity: 1;
}

@media (max-width: 640px) {
  .favorites-container {
    padding: 10px;
  }

  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 10px;
  }

  .product-info {
    padding: 8px;
  }

  .product-info h3 {
    font-size: 13px;
  }

  .price {
    font-size: 14px;
  }
}
</style>