<script setup lang="ts">
import { ref } from 'vue'

const selectedImage = ref(0)
const selectedModel = ref('350W')
const selectedColor = ref('blue')
const quantity = ref(1)

const images = [
  '../../public/imagenes/Sin título.png',
  '../../public/imagenes/Sin título.png',
  '../../public/imagenes/Sin título.png',
  '../../public/imagenes/Sin título.png'
]

const colors = [
  { id: 'blue', name: 'Azul' },
  { id: 'red', name: 'Rojo' },
  { id: 'green', name: 'Verde' }
]

const models = [
  { id: '350W', power: '350W' },
  { id: '250W', power: '250W' },
  { id: '150W', power: '150W' }
]

const incrementQuantity = () => {
  if (quantity.value < 10) quantity.value++
}

const decrementQuantity = () => {
  if (quantity.value > 1) quantity.value--
}

const addToCart = () => {
  console.log('Agregando al carrito:', {
    model: selectedModel.value,
    color: selectedColor.value,
    quantity: quantity.value
  })
}
</script>

<template>
  <div class="product-detail">
    <div class="product-container">
      <!-- Product Images -->
      <div class="product-images">
        <div class="main-image">
          <img :src="images[selectedImage]" alt="Moto Eléctrica">
        </div>
        <div class="thumbnail-list">
          <button 
            v-for="(image, index) in images" 
            :key="index"
            :class="['thumbnail', { active: selectedImage === index }]"
            @click="selectedImage = index"
          >
            <img :src="image" :alt="`Vista ${index + 1}`">
          </button>
        </div>
      </div>

      <!-- Product Info -->
      <div class="product-info">
        <h1>Moto Eléctrica FAPP 350W con Batería Recargable</h1>
        <h2>Tecnología Avanzada de Litio</h2>

        <!-- Rating -->
        <div class="rating">
          <span class="stars">★★★★☆</span>
          <span class="reviews">(22 Reviews)</span>
        </div>

        <!-- Price -->
        <div class="price">
          <span class="current-price">1.150 Bs</span>
          <span class="original-price">2.300 Bs</span>
          <span class="discount">-60%</span>
        </div>

        <p class="description">
          La moto eléctrica que combina estilo y eficiencia. Disfruta de un
          desplazamiento silencioso, ecológico y económico con una
          batería de larga duración.
        </p>

        <!-- Features -->
        <ul class="features">
          <li>Potencia de 350W</li>
          <li>Velocidad máxima de 25 km/h</li>
          <li>Autonomía de hasta 40 km con una sola carga</li>
        </ul>

        <!-- Model Selection -->
        <div class="option-section">
          <h3>MODELO</h3>
          <div class="model-options">
            <button
              v-for="model in models"
              :key="model.id"
              :class="['model-btn', { active: selectedModel === model.id }]"
              @click="selectedModel = model.id"
            >
              {{ model.power }}
            </button>
          </div>
        </div>

        <!-- Color Selection -->
        <div class="option-section">
          <h3>COLOR</h3>
          <div class="color-options">
            <button
              v-for="color in colors"
              :key="color.id"
              :class="['color-btn', color.id, { active: selectedColor === color.id }]"
              @click="selectedColor = color.id"
              :title="color.name"
            ></button>
          </div>
        </div>

        <!-- Quantity and Add to Cart -->
        <div class="purchase-section">
          <div class="quantity-selector">
            <button @click="decrementQuantity">-</button>
            <input type="number" v-model="quantity" min="1" max="10">
            <button @click="incrementQuantity">+</button>
          </div>
          <div class="action-buttons">
            <button class="add-to-cart" @click="addToCart">
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

.color-btn.blue { background: #007bff; }
.color-btn.red { background: #dc3545; }
.color-btn.green { background: #28a745; }

/* Purchase Section */
.purchase-section {
  display: flex;
  gap: 20px;
  margin-top: 20px;
}

.quantity-selector {
  display: flex;
  align-items: center;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.quantity-selector button {
  padding: 8px 16px;
  border: none;
  background: none;
  cursor: pointer;
  color: #666;
}

.quantity-selector input {
  width: 50px;
  text-align: center;
  border: none;
  border-left: 1px solid #ddd;
  border-right: 1px solid #ddd;
  padding: 8px;
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

  .quantity-selector {
    width: 100%;
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