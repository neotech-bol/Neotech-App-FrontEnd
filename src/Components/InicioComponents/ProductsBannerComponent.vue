<template>
  <div class="container">
    <div class="header">
      <h2>Recién Llegadas</h2>
      <p>¡Apresúrate! Estas ofertas no durarán mucho.</p>
    </div>

    <div class="products-grid">
      <div v-for="product in paginatedProducts" :key="product.id" class="product-card">
        <div class="product-image">
          <span v-if="product.badge" 
                :class="['badge', product.badge === 'LIMITADO' ? 'badge-limited' : 'badge-new']">
            {{ product.badge }}
          </span>
          <img :src="product.image" :alt="product.name"/>
        </div>

        <div class="product-info">
          <div class="category">{{ product.category }}</div>
          <h3 class="product-name">{{ product.name }}</h3>
          
          <div class="rating">
            <span v-for="star in 5" :key="star" class="star" :class="{ 'filled': star <= product.rating }">★</span>
          </div>

          <div class="price">
            <span class="current-price">{{ product.price }} Bs</span>
            <span class="old-price">{{ product.oldPrice }} Bs</span>
          </div>

          <button class="add-to-cart" @click="addToCart(product)">
            <span class="icon">🛒</span>
            Agregar al carrito
          </button>
        </div>
      </div>
    </div>

    <div class="pagination">
      <button @click="prevPage" :disabled="currentPage === 1">Anterior</button>
      <span>Página {{ currentPage }} de {{ totalPages }}</span>
      <button @click="nextPage" :disabled="currentPage === totalPages">Siguiente</button>
    </div>

    <div class="banner">
      <img src="https://via.placeholder.com/1200x400.png?text=Motos+Eléctricas" alt="Motos Eléctricas" />
      <div class="banner-content">
        <h2>Motos Eléctricas</h2>
        <p>Descubre nuestra nueva colección de motos eléctricas</p>
        <button class="banner-cta" @click="viewCollection">Ver Colección</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const products = ref([
  {
    id: 1,
    name: 'Moto FAPP 350W',
    category: 'Motos Eléctricas',
    price: '1,150',
    oldPrice: '1,450',
    image: 'https://via.placeholder.com/300x300.png?text=Moto+FAPP+350W',
    badge: 'LIMITADO',
    rating: 4
  },
  {
    id: 2,
    name: 'Moto Vogue 350W',
    category: 'Motos Eléctricas',
    price: '2,030',
    oldPrice: '2,450',
    image: 'https://via.placeholder.com/300x300.png?text=Moto+Vogue+350W',
    badge: 'NUEVO',
    rating: 4
  },
  {
    id: 3,
    name: 'Triciclo Eléctrico 600W',
    category: 'Motos Eléctricas',
    price: '3,850',
    oldPrice: '4,000',
    image: 'https://via.placeholder.com/300x300.png?text=Triciclo+Eléctrico+600W',
    badge: 'NUEVO',
    rating: 4
  },
  {
    id: 4,
    name: 'Triciclo Super 600W',
    category: 'Motos Eléctricas',
    price: '5,500',
    oldPrice: '5,900',
    image: 'https://via.placeholder.com/300x300.png?text=Triciclo+Super+600W',
    badge: 'NUEVO',
    rating: 4
  },
  {
    id: 5,
    name: 'Calentador tipo Hongo 13KW',
    category: 'Calentadores a Gas',
    price: '1,150',
    oldPrice: '1,350',
    image: 'https://via.placeholder.com/300x300.png?text=Calentador+tipo+Hongo+13KW',
    badge: 'NUEVO',
    rating: 4
  }
]);

const currentPage = ref(1);
const productsPerPage = ref(4);

const totalPages = computed(() => Math.ceil(products.value.length / productsPerPage.value));

const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * productsPerPage.value;
  const end = start + productsPerPage.value;
  return products.value.slice(start, end);
});

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
};

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};

const addToCart = (product) => {
  console.log(`Agregado al carrito: ${product.name}`);
  // Aquí puedes implementar la lógica para agregar al carrito
};

const viewCollection = () => {
  console.log('Ver colección de Motos Eléctricas');
  // Aquí puedes implementar la navegación a la colección
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');

body {
  font-family: 'Poppins', sans-serif;
  background-color: #f4f4f4;
  color: #333;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.header {
  text-align: center;
  margin-bottom: 3rem;
}

.header h2 {
  font-size: 2.5rem;
  font-weight: 700;
  color: #3498db;
  margin-bottom: 0.5rem;
}

.header p {
  font-size: 1.1rem;
  color: #666;
}

.products-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 2rem;
  margin-bottom: 3rem;
}

.product-card {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.3s ease;
  width: calc(25% - 1.5rem);
  max-width: 300px;
}

.product-card:hover {
  box-shadow: 0 8px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-5px);
}

.product-image {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.product-card:hover .product-image img {
  transform: scale(1.05);
}

.badge {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 6px 12px;
  border-radius: 20px;
  color: #ffffff;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.badge-limited {
  background-color: #e74c3c;
}

.badge-new {
  background-color: #2ecc71;
}

.product-info {
  padding: 1.5rem;
}

.category {
  font-size: 0.875rem;
  color: #666;
  margin-bottom: 0.5rem;
}

.product-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.75rem;
}

.rating {
  display: flex;
  gap: 2px;
  margin-bottom: 0.75rem;
}

.star {
  color: #d1d5db;
  font-size: 1.25rem;
}

.star.filled {
  color: #ffd700;
}

.price {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 1rem;
}

.current-price {
  font-weight: 700;
  font-size: 1.25rem;
  color: #3498db;
}

.old-price {
  color: #999;
  text-decoration: line-through;
  font-size: 0.95rem;
}

.add-to-cart {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 0.75rem;
  background-color: #3498db;
  color: #ffffff;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.add-to-cart:hover {
  background-color: #2980b9;
}

.icon {
  font-size: 1.2rem;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 2rem;
  gap: 1rem;
}

.pagination button {
  padding: 0.5rem 1rem;
  background-color: #3498db;
  color: #ffffff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.pagination button:hover:not(:disabled) {
  background-color: #2980b9;
}

.pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.banner {
  position: relative;
  height: 400px;
  border-radius: 12px;
  overflow: hidden;
  margin-top: 3rem;
}

.banner img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.banner-content {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  padding: 3rem;
}

.banner-content h2 {
  color: #ffffff;
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.banner-content p {
  color: #ffffff;
  font-size: 1.2rem;
  margin-bottom: 1.5rem;
}

.banner-cta {
  padding: 0.75rem 1.5rem;
  background-color: #2ecc71;
  color: #ffffff;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.banner-cta:hover {
  background-color: #27ae60;
}

@media (max-width: 1024px) {
  .product-card {
    width: calc(33.33% - 1.33rem);
  }
}

@media (max-width: 768px) {
  .container {
    padding: 1rem;
  }

  .header h2 {
    font-size: 2rem;
  }

  .product-card {
    width: calc(50% - 1rem);
  }

  .banner {
    height: 300px;
  }

  .banner-content {
    padding: 2rem;
  }

  .banner-content h2 {
    font-size: 2.5rem;
  }
}

@media (max-width: 480px) {
  .header h2 {
    font-size: 1.75rem;
  }

  .product-card {
    width: 100%;
  }

  .product-image {
    height: 250px;
  }

  .banner {
    height: 250px;
  }

  .banner-content h2 {
    font-size: 2rem;
  }

  .banner-content p {
    font-size: 1rem;
  }
}
</style>