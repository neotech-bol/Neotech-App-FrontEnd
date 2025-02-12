<template>
  <div class="product-detail">
    <div class="product-container">
      <!-- Product Images -->
      <div class="product-images">
        <div class="main-image">
          <img :src="dato.imagen_principal" alt="Moto Eléctrica">
        </div>
        <div class="thumbnail-list">
          <button v-for="(image, index) in dato.images" :key="index"
            :class="['thumbnail', { active: selectedImage === index }]" @click="selectedImage = index">
            <img :src="image.imagen" :alt="`Vista ${index + 1}`">
          </button>
        </div>
      </div>

      <!-- Product Info -->
      <div class="product-info">
        <h1>{{ dato.nombre }}</h1>
        <h2>Tecnología Avanzada de Litio</h2>

        <!-- Rating -->
        <div class="rating">
          <span class="stars">★★★★☆</span>
          <span class="reviews">(22 Reviews)</span>
        </div>

<!-- Price -->
<div class="price">
  <span class="current-price">{{ selectedModelPrice }} Bs</span>
<!--   <span class="original-price">{{ originalPrice }} Bs</span>
  <span class="discount">-60%</span> -->
</div>

        <p class="description">
          {{ dato.descripcion != null ? dato.descripcion : 'No hay descripción' }}
        </p>

        <!-- Features -->
        <ul class="features">
          <li v-for="caracteristica in dato.caracteristicas" :key="caracteristica.id">
            {{ caracteristica.caracteristica }}
          </li>
        </ul>

        <!-- Model Selection -->
        <div class="option-section">
          <h3>MODELO</h3>
          <div class="model-options">
            <button v-for="model in dato.modelos" :key="model.id"
              :class="['model-btn', { active: selectedModel === model.id }]" @click="selectModel(model)">
              {{ model.nombre }}
            </button>
          </div>
        </div>

        <!-- Quantity and Add to Cart -->
        <div class="purchase-section">
          <div class="action-buttons">
            <button class="add-to-cart" @click="addToCart(dato)">
              <span class="cart-icon">🛒</span>
              Agregar al carrito
            </button>
            <button class="add-to-wishlist">
              <span class="heart-icon">♡</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { detalleProducto } from '@/Services/ProductoService';
import { useCartStore } from '@/stores/cart';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const dato = ref({});
const router = useRouter();
const selectedImage = ref(0);
const selectedModel = ref(null); // Inicializa como null
const selectedModelPrice = ref(0); // Para almacenar el precio del modelo seleccionado
const originalPrice = ref(0); // Para almacenar el precio original del producto
const idProducto = router.currentRoute.value.params.idProducto;
const cartStore = useCartStore();

onMounted(() => {
  verProducto();
});

const verProducto = async () => {
  try {
    const { data } = await detalleProducto(idProducto);
    dato.value = data.dato;

    // Establecer el precio original
    originalPrice.value = dato.value.precio; // Asigna el precio original

    // Si hay modelos, puedes establecer el precio del primer modelo
    if (dato.value.modelos.length > 0) {
      selectedModel.value = dato.value.modelos[0].id; // Selecciona el primer modelo por defecto
      selectedModelPrice.value = dato.value.modelos[0].precio; // Establece el precio del primer modelo
    } else {
      selectedModelPrice.value = originalPrice.value; // Si no hay modelos, usa el precio original
    }
  } catch (error) {
    console.log(error);
  }
};

const selectModel = (model) => {
  selectedModel.value = model.id; // Cambia el modelo seleccionado
  selectedModelPrice.value = model.precio; // Cambia el precio al del modelo seleccionado
};

const addToCart = () => {
  // Crea un objeto que incluya el producto y el precio del modelo seleccionado
  const productWithModelPrice = {
    ...dato.value, // Copia todas las propiedades del producto
    precio: selectedModelPrice.value, // Agrega el precio del modelo seleccionado
    modeloId: selectedModel.value // Agrega el ID del modelo seleccionado
  };

  cartStore.addToCart(productWithModelPrice);
  console.log(`Agregado al carrito: ${productWithModelPrice.nombre} con precio: ${productWithModelPrice.precio} Bs`);
};

</script>
<style scoped>
.product-detail {
  padding: 40px 20px;
  background: #fff;
}

.product-container {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
}

/* Product Images */
.product-images {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.main-image {
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
}

.main-image img {
  width: 100%;
  height: auto;
  object-fit: cover;
}

.thumbnail-list {
  display: flex;
  gap: 10px;
}

.thumbnail {
  width: 80px;
  height: 80px;
  border: 2px solid transparent;
  border-radius: 4px;
  padding: 2px;
  cursor: pointer;
  background: none;
}

.thumbnail.active {
  border-color: #007bff;
}

.thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 2px;
}

/* Product Info */
.product-info {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.product-info h1 {
  font-size: 1.8rem;
  color: #333;
  margin: 0;
}

.product-info h2 {
  font-size: 1.2rem;
  color: #666;
  font-weight: normal;
  margin: 0;
}

/* Rating */
.rating {
  display: flex;
  align-items: center;
  gap: 10px;
}

.stars {
  color: #ffc107;
}

.reviews {
  color: #666;
  font-size: 0.9rem;
}

/* Price */
.price {
  display: flex;
  align-items: center;
  gap: 12px;
}

.current-price {
  font-size: 2rem;
  font-weight: bold;
  color: #333;
}

.original-price {
  font-size: 1.2rem;
  color: #999;
  text-decoration: line-through;
}

.discount {
  background: #ff4444;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.9rem;
}

/* Features */
.features {
  list-style: none;
  padding: 0;
  margin: 0;
}

.features li {
  padding: 8px 0;
  color: #666;
  display: flex;
  align-items: center;
  gap: 8px;
}

.features li::before {
  content: "•";
  color: #007bff;
}

/* Options */
.option-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.option-section h3 {
  font-size: 0.9rem;
  color: #666;
  margin: 0;
}

.model-options {
  display: flex;
  gap: 10px;
}

.model-btn {
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.model-btn.active {
  border-color: #007bff;
  background: #007bff;
  color: white;
}

.color-options {
  display: flex;
  gap: 10px;
}

.color-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
  position: relative;
}

.color-btn.active::after {
  content: "✓";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
}

.color-btn.blue {
  background: #007bff;
}

.color-btn.red {
  background: #dc3545;
}

.color-btn.green {
  background: #28a745;
}

/* Purchase Section */
.purchase-section {
  display: flex;
  gap: 20px;
  margin-top: 20px;
}



.action-buttons {
  display: flex;
  gap: 10px;
  flex: 1;
}

.add-to-cart {
  flex: 1;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 12px 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: background-color 0.3s ease;
}

.add-to-cart:hover {
  background: #0056b3;
}

.add-to-wishlist {
  width: 48px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.add-to-wishlist:hover {
  border-color: #ff4444;
  color: #ff4444;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .product-container {
    grid-template-columns: 1fr;
    gap: 30px;
  }

  .thumbnail {
    width: 60px;
    height: 60px;
  }
}

@media (max-width: 768px) {
  .product-detail {
    padding: 20px;
  }

  .product-info h1 {
    font-size: 1.5rem;
  }

  .current-price {
    font-size: 1.6rem;
  }

  .purchase-section {
    flex-direction: column;
  }

}

@media (max-width: 480px) {
  .thumbnail-list {
    justify-content: center;
  }

  .model-options,
  .color-options {
    flex-wrap: wrap;
  }

  .action-buttons {
    flex-direction: column;
  }

  .add-to-wishlist {
    width: 100%;
    height: 48px;
  }
}
</style>