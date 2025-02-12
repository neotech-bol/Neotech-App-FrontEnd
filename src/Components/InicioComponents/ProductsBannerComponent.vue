<template>
  <div class="container">
    <div class="main-catalog">
      <div v-for="catalog in datos" :key="catalog.id">
       <div v-for="(categoria, index) in catalog.categorias" :key="index">
        <div class="banner">
          <img :src="categoria.banner" alt="Banner de {{ categoria.nombre }}" />
          <div class="banner-content">
            <h2>{{ categoria.nombre }}</h2>
            <p>{{ categoria.descripcion }}</p>
            <button class="banner-cta" @click="viewCollection">Ver Colección</button>
          </div>
        </div>
        <div class="header">
          <h2>Movilidad <span class="text-accent">Inteligente</span></h2>
          <p>Velocidad, diseño y tecnología en cada modelo.</p>
        </div>

        <div class="products-grid">
          <div v-for="product in categoria.productos" :key="product.id" class="product-card">
            <div class="product-image">
              <img :src="product.imagen_principal" :alt="product.nombre">
              <span v-if="product.badge"
                :class="['badge', product.badge === 'LIMITADO' ? 'badge-limited' : 'badge-new']">
                {{ product.badge }}
              </span>
              <div class="product-actions">
                <button class="action-button" @click="addToCart(product)">
                  🛒
                </button>
                <button class="action-button" @click="verProducto(product.id)">
                  👁️
                </button>
                <button class="action-button" @click="fororiteUser(product.id)">
                  ❤️
                </button>
              </div>
            </div>

            <div class="product-info">
              <div class="category">{{ product.categoria?.nombre }}</div>
              <h3 class="product-name">{{ product.nombre }}</h3>

              <div class="rating">
                <span v-for="star in 5" :key="star" class="star" 
                      :class="{ 'filled': star <= (userRatings.find(r => r.producto_id === product.id)?.rating || 0) }"
                      @click="storeRatingUser(product.id, star)">
                  ★
                </span>
              </div>
              <div class="rating-count">
                <p>{{ userRatings.find(r => r.producto_id === product.id)?.total_users || 0 }} usuarios han calificado este producto.</p>
              </div>
              <div class="price">
                <span class="current-price">{{ product.precio }} Bs</span>
                <span class="old-price">{{ product.oldPrice }} Bs</span>
              </div>
            </div>
          </div>
        </div>
       </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { indexCatalogoItems } from '@/Services/CatalogoService';
import { useCartStore } from '@/stores/cart';
import { useRouter } from 'vue-router';
import { storeFavorite } from '@/Services/FavoriteService';
import { indexRatings, storeRating } from '@/Services/RatingService';
onMounted(() => {
  indexRatingUser();
})
const cartStore = useCartStore();
const datos = ref([]);
const router = useRouter();
const fovoritesForm = ref({});

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

const fororiteUser = async (idProducto) => {
  try {
    fovoritesForm.value = {
      "producto_id": idProducto,
    };
    const {data} = await storeFavorite(fovoritesForm.value);
  } catch (error) {
    if(error.response.data.message){
      console.log(error.response.data.message);
    }else{
      console.log(error);
    }
  }
}

const addToCart = (product) => {
  cartStore.addToCart(product);
  console.log(`Agregado al carrito: ${product.cantidad_minima}`);
};

const viewCollection = () => {
  console.log('Ver colección de Motos Eléctricas');
};

const storeRatingUser = async (productID, rating) => {
  console.log(productID, rating);
  let ratingForm = {
    "producto_id": productID,
    "rating": rating
  };
  console.log(ratingForm); 
  try {
    const { data } = await storeRating(ratingForm);
    console.log(data.message); // Mensaje de éxito
    // Aquí puedes actualizar la calificación en el producto si es necesario
    const product = datos.value.find(p => p.id === productID);
    if (product) {
      product.rating = rating; // Actualiza la calificación localmente
    }
    indexRatingUser();
  } catch (error) {
    if (error.response && error.response.data.message) {
      console.log(error.response.data.message); // Mensaje de error del servidor
    } else {
      console.log(error);
    }
  }
};
const userRatings = ref([]); // Para almacenar las calificaciones del usuario

const indexRatingUser  = async () => {
  try {
    const { data } = await indexRatings();
    userRatings.value = data; // Almacena las calificaciones del usuario
    console.log(userRatings.value);
  } catch (error) {
    console.log(error);
  }
};
const updateRatingUser = async () => {

}
onMounted(() => {
  listarCatalogo();
});
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
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
  position: relative;
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
  cursor: pointer;
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

/* Nuevos estilos para los botones de acción */
.product-actions {
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 10px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.product-card:hover .product-actions {
  opacity: 1;
}

.action-button {
  background-color: rgba(255, 255, 255, 0.8);
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.action-button:hover {
  background-color: rgba(255, 255, 255, 1);
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