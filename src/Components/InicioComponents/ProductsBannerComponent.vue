<template>
  <div class="container">

    <div class="recent-products-section">
      <div class="header">
        <h2>Recién Llegadas</h2>
        <p>¡Apresúrate! Estas ofertas no durarán mucho.</p>
      </div>

      <div class="products-grid">
        <div v-for="product in paginatedProducts" :key="product.id" class="product-card">
          <div class="product-image">
            <img :src="product.image" :alt="product.name">
            <span v-if="product.badge" :class="['badge', product.badge === 'LIMITADO' ? 'badge-limited' : 'badge-new']">
              {{ product.badge }}
            </span>
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
    </div>

    <div class="main-catalog">
  <div v-for="catalog in datos" :key="catalog.id">
    <div class="banner">
      <img :src="catalog.banner" alt="Banner de {{ catalog.nombre }}" />
      <div class="banner-content">
        <h2>{{ catalog.nombre }}</h2>
        <p>{{ catalog.descripcion }}</p>
        <button class="banner-cta" @click="viewCollection">Ver Colección</button>
      </div>
    </div>
    <div class="header">
      <h2>Movilidad <span class="text-accent">Inteligente</span></h2>
      <p>Velocidad, diseño y tecnología en cada modelo.</p>
    </div>

    <div class="products-grid">
      <div v-for="product in catalog.productos" :key="product.id" class="product-card">
        <div class="product-image">
          <img :src="product.imagen_principal" :alt="product.nombre">
          <span v-if="product.badge"
            :class="['badge', product.badge === 'LIMITADO' ? 'badge-limited' : 'badge-new']">
            {{ product.badge }}
          </span>
        </div>

        <div class="product-info">
          <div class="category">{{ product.categoria?.nombre }}</div>
          <h3 class="product-name">{{ product.nombre }}</h3>

          <div class="rating">
            <span v-for="star in 5" :key="star" class="star" :class="{ 'filled': star <= product.rating }">★</span>
          </div>

          <div class="price">
            <span class="current-price">{{ product.precio }} Bs</span>
            <span class="old-price">{{ product.oldPrice }} Bs</span>
          </div>

          <button class="add-to-cart" @click="addToCart(product)">
            <span class="icon">🛒</span>
            Agregar al carrito
          </button>
          <button class="add-to-cart mt-2" @click="verProducto(product.id)">
            Ver Producto
          </button>
        </div>
      </div>
    </div>
  </div>
</div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { indexCatalogoItems } from '@/Services/CatalogoService';
import { useCartStore } from '@/stores/cart';
import { useRouter } from 'vue-router';
const cartStore = useCartStore();
const datos = ref([]);
const currentPage = ref(1);
const productsPerPage = ref(4);
const router = useRouter();
const products = ref([
  // ... more products
]);

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
const verProducto = param => {
    router.push({ path: `/producto/${param}` })
}
const listarCatalogo = async () => {
  try {
    const { data } = await indexCatalogoItems();
    datos.value = data.datos;
    console.log(datos.value);
  } catch (error) {
    console.error(error);
  }
};

const addToCart = (product) => {
  cartStore.addToCart(product);
  console.log(`Agregado al carrito: ${product.nombre}`);
};

const viewCollection = () => {
  console.log('Ver colección de Motos Eléctricas');
};

onMounted(() => {
  listarCatalogo();
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  font-family: 'Poppins', sans-serif;
}

.banner {
  position: relative;
  height: 400px;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 3rem;
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
  color: white;
}

.banner-content h2 {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.banner-cta {
  padding: 0.75rem 1.5rem;
  background-color: #2ecc71;
  color: white;
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

.header {
  text-align: center;
  margin-bottom: 3rem;
}

.header h2 {
  font-size: 2.5rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 0.5rem;
}

.text-accent {
  color: #3498db;
}

.header p {
  font-size: 1.1rem;
  color: #666;
}

.recent-products-section {
  margin-bottom: 4rem;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}

.product-card {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.3s ease;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 12px rgba(0, 0, 0, 0.15);
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

.badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  color: white;
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
  gap: 0.75rem;
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
  width: 100%;
  padding: 0.75rem;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: background-color 0.3s ease;
}

.add-to-cart:hover {
  background-color: #2980b9;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin: 2rem 0;
}

.pagination button {
  padding: 0.5rem 1rem;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .container {
    padding: 1rem;
  }

  .banner {
    height: 300px;
    margin-bottom: 2rem;
  }

  .banner-content h2 {
    font-size: 2rem;
  }

  .header h2 {
    font-size: 2rem;
  }

  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 1rem;
  }
}

@media (max-width: 480px) {
  .banner {
    height: 250px;
  }

  .banner-content h2 {
    font-size: 1.5rem;
  }

  .header h2 {
    font-size: 1.75rem;
  }

  .products-grid {
    grid-template-columns: 1fr;
  }
}
</style>