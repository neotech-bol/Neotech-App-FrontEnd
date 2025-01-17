<template>
    <div class="container">
      <!-- Header Section -->
      <div class="header">
        <h2>Recién Llegadas</h2>
        <p>¡Apresúrate! Estas ofertas no durarán mucho.</p>
      </div>
  
      <!-- Products Grid -->
      <div class="products-grid">
        <div v-for="product in products" :key="product.id" class="product-card">
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
              <span v-for="i in 5" :key="i">★</span>
            </div>
  
            <div class="price">
              <span class="current-price">{{ product.price }} Bs</span>
              <span class="old-price">{{ product.oldPrice }} Bs</span>
            </div>
          </div>
        </div>
      </div>
  
      <!-- Banner Section -->
      <div class="banner">
        <img src="" alt="Motos Eléctricas" />
        <div class="banner-content">
          <h2>Motos Eléctricas</h2>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'ProductListing',
    data() {
      return {
        products: [
          {
            id: 1,
            name: 'Moto FAPP 350W',
            category: 'Motos Eléctricas',
            price: '1,150',
            oldPrice: '1,450',
            image: '',
            badge: 'LIMITADO',
            rating: 4
          },
          {
            id: 2,
            name: 'Moto Vogue 350W',
            category: 'Motos Eléctricas',
            price: '2,030',
            oldPrice: '2,450',
            image: '',
            badge: 'NUEVO',
            rating: 4
          },
          {
            id: 3,
            name: 'Triciclo Eléctrico 600W',
            category: 'Motos Eléctricas',
            price: '3,850',
            oldPrice: '4,000',
            image: '',
            badge: 'NUEVO',
            rating: 4
          },
          {
            id: 4,
            name: 'Triciclo Super 600W',
            category: 'Motos Eléctricas',
            price: '5,500',
            oldPrice: '5,900',
            image: '',
            badge: 'NUEVO',
            rating: 4
          },
          {
            id: 5,
            name: 'Calentador tipo Hongo 13KW',
            category: 'Calentadores a Gas',
            price: '1,150',
            oldPrice: '1,350',
            image: '',
            badge: 'NUEVO',
            rating: 4
          }
        ]
      }
    }
  }
  </script>
  
  <style scoped>
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
  }
  
  .header {
    margin-bottom: 2rem;
  }
  
  .header h2 {
    font-size: 1.5rem;
    font-weight: bold;
    color: #333;
    margin-bottom: 0.5rem;
  }
  
  .header p {
    color: #666;
  }
  
  .products-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
  }
  
  .product-card {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    overflow: hidden;
    transition: transform 0.2s;
  }
  
  .product-card:hover {
    transform: translateY(-5px);
  }
  
  .product-image {
    position: relative;
    height: 200px;
  }
  
  .product-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .badge {
    position: absolute;
    top: 10px;
    right: 10px;
    padding: 4px 12px;
    border-radius: 20px;
    color: white;
    font-size: 0.75rem;
    font-weight: bold;
  }
  
  .badge-limited {
    background-color: #ff4757;
  }
  
  .badge-new {
    background-color: #2ed573;
  }
  
  .product-info {
    padding: 1rem;
  }
  
  .category {
    font-size: 0.875rem;
    color: #666;
    margin-bottom: 0.5rem;
  }
  
  .product-name {
    font-size: 1rem;
    font-weight: 500;
    color: #333;
    margin-bottom: 0.5rem;
  }
  
  .rating {
    color: #ffd700;
    margin-bottom: 0.5rem;
  }
  
  .price {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .current-price {
    font-weight: bold;
    font-size: 1.125rem;
    color: #333;
  }
  
  .old-price {
    color: #666;
    text-decoration: line-through;
    font-size: 0.875rem;
  }
  
  .banner {
    position: relative;
    height: 300px;
    border-radius: 8px;
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
    background: rgba(0,0,0,0.4);
    display: flex;
    align-items: center;
    padding: 2rem;
  }
  
  .banner-content h2 {
    color: white;
    font-size: 2.5rem;
    font-weight: bold;
  }
  
  /* Responsive Design */
  @media (max-width: 768px) {
    .products-grid {
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 1rem;
    }
  
    .product-image {
      height: 150px;
    }
  
    .banner-content h2 {
      font-size: 2rem;
    }
  }
  
  @media (max-width: 480px) {
    .products-grid {
      grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
    }
  
    .product-image {
      height: 130px;
    }
  
    .banner-content h2 {
      font-size: 1.5rem;
    }
  }
  </style>