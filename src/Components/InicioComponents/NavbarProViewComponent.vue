<script setup>
import { ref } from 'vue'

const searchQuery = ref('')
</script>

<template>
  <header>
    <!-- Top Bar -->
    <div class="top-bar">
      <div class="contact">
        <a href="tel:+59175901415">+591 759-01415</a>
      </div>
      <div class="announcement">
        La experiencia de compra más veloz del país
      </div>
      <div class="top-links">
        <a href="#">Ayuda</a>
        <a href="#">Rastrear Pedido</a>
        <select class="language-select">
          <option value="es">Español</option>
        </select>
        <select class="currency-select">
          <option value="bs">Moneda (Bs)</option>
        </select>
      </div>
    </div>

    <!-- Main Header -->
    <div class="main-header">
      <div class="logo">
        <img src="" alt="Logo" />
      </div>

      <div class="search-bar">
        <input type="text" v-model="searchQuery" placeholder="¿Qué estás buscando en este ciclo?">
        <button class="search-button">
          <i class="search-icon">🔍</i>
        </button>
      </div>

      <div class="user-actions">
        <div class="account">
          <i class="user-icon">👤</i>
          <div class="account-text">
            <span>Cuenta</span>
            <span>LOGIN</span>
          </div>
        </div>
        <div class="favorites">
          <i class="heart-icon">❤️</i>
          <div class="count">3-ITEMS</div>
        </div>
        <div class="cart">
          <i class="cart-icon">🛒</i>
          <div class="count">2-ITEMS</div>
        </div>
      </div>
    </div>

    <!-- Navigation -->
    <nav class="main-nav">
      <button class="catalog-btn">
        <i class="menu-icon">☰</i>
        Ver catálogo
      </button>

      <ul class="nav-links">
        <li><router-link to="/">Inicio</router-link></li>
        <li><router-link to="">Categorías</router-link></li>
        <li><router-link to="/producto">Productos</router-link></li>
        <li><router-link to="">Ofertas</router-link></li>
        <li><router-link to="/nosotros">Nosotros</router-link></li>
        <li><router-link to="/contacto">Contacto</router-link></li>
      </ul>

      <div class="location">
        <select>
          <option>Cochabamba</option>
        </select>
      </div>
    </nav>
  </header>
</template>

<style scoped>
/* Base Styles */
header {
  font-family: Inter, system-ui, sans-serif;
  width: 100%;
  max-width: 1440px;
  margin: 0 auto;
}

/* Top Bar */
.top-bar {
  background: #f8f9fa;
  padding: 8px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
}

.top-bar a {
  color: #333;
  text-decoration: none;
  transition: color 0.3s ease;
}

.top-bar a:hover {
  color: #007bff;
}

.top-links {
  display: flex;
  gap: 16px;
}

.language-select,
.currency-select {
  border: none;
  background: transparent;
  cursor: pointer;
  transition: opacity 0.3s ease;
}

.language-select:hover,
.currency-select:hover {
  opacity: 0.8;
}

/* Main Header */
.main-header {
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 24px;
  max-width: 1200px;
  margin: 0 auto;
  background: white;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  transition: transform 0.3s ease;
}

.logo:hover {
  transform: scale(1.05);
}

.logo img {
  height: 40px;
}

.search-bar {
  flex: 1;
  display: flex;
  position: relative;
}

.search-bar input {
  width: 100%;
  padding: 12px 48px 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.search-bar input:focus {
  border-color: #007bff;
  outline: none;
}

.search-button {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.search-button:hover {
  transform: translateY(-50%) scale(1.1);
}

.user-actions {
  display: flex;
  gap: 24px;
  align-items: center;
}

.account,
.favorites,
.cart {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.account:hover,
.favorites:hover,
.cart:hover {
  transform: translateY(-2px);
}

.account-text {
  display: flex;
  flex-direction: column;
  font-size: 14px;
}

.count {
  font-size: 12px;
  color: #666;
}

/* Navigation */
.main-nav {
  background: #f8f9fa;
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.catalog-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #007bff;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.catalog-btn:hover {
  background: #0056b3;
}

.nav-links {
  display: flex;
  gap: 24px;
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav-links a {
  color: #333;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;
}

.nav-links a:hover {
  color: #007bff;
}

.location select {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  transition: border-color 0.3s ease;
}

.location select:hover {
  border-color: #007bff;
}

/* Responsive Styles */
@media (max-width: 1024px) {
  .top-bar {
    padding: 6px 12px;
  }

  .main-header {
    padding: 12px;
    flex-wrap: wrap;
  }

  .search-bar {
    order: 3;
    width: 100%;
    margin-top: 12px;
  }

  .user-actions {
    gap: 16px;
  }

  .account-text,
  .count {
    display: none;
  }
}

@media (max-width: 480px) {
  .main-header {
    padding: 8px;
  }

  .logo img {
    height: 32px;
  }

  .search-bar input {
    padding: 8px 40px 8px 12px;
    font-size: 14px;
  }

  .user-actions {
    gap: 8px;
  }
}
</style>