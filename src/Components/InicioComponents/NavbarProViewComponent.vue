<template>
  <header class="header">
    <div class="top-bar">
      <div class="top-bar-inner">
        <div class="contact">
          <a href="tel:+59177997694"><i class="fas fa-phone-alt"></i> +591 77997694</a>
        </div>
        <div class="announcement text-color">
          La experiencia de compra más veloz del país
        </div>
        <div class="top-links">
          <a href="#">Ayuda</a>
          <a href="#">Rastrear Pedido</a>
          <select v-model="language" class="language-select">
            <option value="es">Español</option>
            <option value="en">English</option>
          </select>
          <select v-model="currency" class="currency-select">
            <option value="bs">Bs</option>
            <option value="usd">USD</option>
          </select>
        </div>
      </div>
    </div>
    <div class="main-header">
      <div class="logo">
        <img src="/logo/Logo Neofetch PNG.png" alt="Logo" />
      </div>

      <div class="search-bar">
        <input v-model="searchQuery" type="text" placeholder="¿Qué estás buscando en este ciclo?" />
        <button class="search-button">
          <i class="fas fa-search"></i>
        </button>
      </div>
      <div class="user-actions">
        <button class="icon-button" @click="handleAccountClick">
          <img src="/svg/icono-header-cuenta.svg" alt="">
          <span class="label">{{ isLoggedIn ? 'Cuenta' : 'Iniciar sesión' }}</span>
        </button>
        <button class="icon-button" @click="goFavorites()">
          <img src="/svg/icono-header-favoritos.svg" alt="">
          <span class="label">Favoritos</span>
        </button>
        <button class="icon-button cart-button" @click="carritoView()">
          <img src="/svg/icono-header-carrito.svg" alt="">
          <span class="label">Carrito</span>
          <span class="cart-count" v-if="cartItemCount > 0">{{ cartItemCount }}</span>
        </button>
      </div>
    </div>
    <hr>
    <nav class="main-nav">
      <button class="catalog-button" @click="toggleSidebar">
        <i class="fas fa-bars"></i>
        Ver catálogo
      </button>

      <ul class="nav-links">
        <li v-for="item in navItems" :key="item.path">
          <router-link :to="item.path">
            {{ item.nombre }}
          </router-link>
        </li>
      </ul>
      <select v-model="location" class="location-select">
        <option value="cochabamba">Cochabamba</option>
        <option value="la-paz">La Paz</option>
        <option value="santa-cruz">Santa Cruz</option>
      </select>
    </nav>
    <hr>
  </header>

  <!-- Sidebar -->
  <div :class="['sidebar', { 'open': isSidebarOpen }]">
    <button class="close-sidebar" @click="toggleSidebar">
      <i class="fas fa-times"></i>
    </button>
    <h2>Categorías</h2>
    <ul>
      <li v-for="category in categories" :key="category">
        <a href="#">{{ category }}</a>
      </li>
    </ul>
  </div>
  <div :class="['sidebar-overlay', { 'active': isSidebarOpen }]" @click="toggleSidebar"></div>
</template>

<script setup>
import { useCartStore } from '@/stores/cart';
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter();
const searchQuery = ref('')
const language = ref('es')
const currency = ref('bs')
const location = ref('cochabamba')
const isSidebarOpen = ref(false)
const cartStore = useCartStore();
const cartItemCount = computed(() => cartStore.uniqueItemCount);
const navItems = [
  { nombre: 'Inicio', path: '/' },
  { nombre: 'Productos', path: '/productos' },
  { nombre: 'Categorías', path: '/categorias' },
  { nombre: 'Nosotros', path: '/nosotros' },
  { nombre: 'Contacto', path: '/contacto' }
]
const isLoggedIn = ref(false);
const categories = [
  'Electrónicos', 'Ropa', 'Hogar', 'Deportes', 'Libros', 'Juguetes', 'Belleza', 'Alimentos'
]

onMounted(() => {
  const token = localStorage.getItem('token');
  isLoggedIn.value = !!token;
});

const handleAccountClick = () => {
  if (isLoggedIn.value) {
    router.push({ path: '/perfil' });
  } else {
    router.push({ path: '/login' });
  }
};

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
}

const carritoView = () => {
  router.push({ path: '/checkout' })
}
const goFavorites = () => {
  router.push({ path: '/favoritos' })
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css');
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'); 

.header {
 font-family: "Inter", sans-serif;
  width: 100%;
  margin: 0;
}

.top-bar {
  background-color: #F8F8FB;
  width: 100%;
}

.top-bar-inner {
  max-width: 1440px;
  margin: 0 auto;
  padding: 8px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  font-size: 14px;
  font-weight: 300;
}

.top-bar a,
.top-bar select {
  color: #838384;
  text-decoration: none;
  margin-right: 16px;
  transition: color 0.3s ease;
}

.top-bar a:hover {
  color: #007bff;
}

.language-select,
.currency-select {
  background: none;
  border: none;
  color: #838384;
  font-size: 14px;
  cursor: pointer;
  outline: none;
}

.text-color {
  color: #838384;
  font-weight: 250;
}

.top-links {
  display: flex;
  align-items: center;
}

.main-header {
  max-width: 1440px;
  margin: 0 auto;
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  background-color: white;
}

.logo img {
  height: 40px;
  transition: transform 0.3s ease;
}

.logo img:hover {
  transform: scale(1.05);
}

.search-bar {
  flex-grow: 1;
  display: flex;
  margin: 0 16px;
  position: relative;
  max-width: 600px;
}

.search-bar input {
  width: 100%;
  padding: 12px 40px 12px 16px;
  border: 1px solid #F5F5F5;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
  font-weight: 250;
}

.search-bar input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25);
}

.search-button {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  font-size: 20px;
  color: #838384;
  transition: color 0.3s ease;
}

.search-button:hover {
  color: #0056b3;
}

.user-actions {
  display: flex;
  gap: 16px;
}

.icon-button {
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: transform 0.3s ease;
}

.icon-button:hover {
  transform: translateY(-2px);
}

.icon-button i {
  font-size: 24px;
}

.icon-button .label {
  font-size: 12px;
  margin-top: 4px;
}

.cart-button {
  position: relative;
}

.cart-count {
  position: absolute;
  top: -5px;
  right: -5px;
  background-color: #ff4136;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 12px;
  font-weight: bold;
}

.main-nav {
  background-color: white;
  padding: 3px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  border: 1px solid #F8F8FB;
  max-width: 1440px;
  margin: 0 auto;
}

.catalog-button,
.location-select {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.3s ease, transform 0.3s ease;
}

.catalog-button:hover,
.location-select:hover {
  background-color: #0056b3;
  transform: translateY(-2px);
}

.nav-links {
  display: flex;
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.nav-links li {
  margin-right: 24px;
}

.nav-links a {
  color: #4C5A67;
  text-decoration: none;
  font-weight: 400;
  transition: color 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.nav-links a:hover {
  color: #007bff;
}

hr {
  background-color: #838384;
  margin: 0;
  border: none;
  height: 1px;
}

/* Sidebar styles */
.sidebar {
  position: fixed;
  top: 0;
  left: -300px;
  width: 300px;
  height: 100%;
  background-color: #ffffff;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
  transition: left 0.3s ease;
  z-index: 1000;
  overflow-y: auto;
  padding: 20px;
}

.sidebar.open {
  left: 0;
}

.close-sidebar {
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #333;
}

.sidebar h2 {
  font-size: 24px;
  margin-bottom: 20px;
  color: #007bff;
}

.sidebar ul {
  list-style-type: none;
  padding: 0;
}

.sidebar li {
  margin-bottom: 15px;
}

.sidebar a {
  color: #333;
  text-decoration: none;
  font-size: 16px;
  transition: color 0.3s ease;
}

.sidebar a:hover {
  color: #007bff;
}

.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: none;
  z-index: 999;
}

.sidebar-overlay.active {
  display: block;
}

@media (max-width: 1024px) {
  .main-header {
    padding: 16px;
  }

  .search-bar {
    max-width: 100%;
    margin: 16px 0;
  }

  .user-actions {
    width: 100%;
    justify-content: space-around;
    margin-top: 16px;
  }
}

@media (max-width: 768px) {
  .top-bar {
    display: none;
  }

  .main-header {
    flex-direction: column;
    align-items: stretch;
  }

  .logo {
    align-self: center;
    margin-bottom: 16px;
  }

  .search-bar {
    order: 1;
  }

  .nav-links {
    display: none;
  }

  .catalog-button,
  .location-select {
    width: 100%;
    justify-content: center;
    margin-bottom: 8px;
  }

  .main-nav {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    left: -100%;
  }
}

@media (max-width: 480px) {
  .main-header {
    padding: 12px;
  }

  .logo img {
    height: 32px;
  }

  .search-bar input {
    font-size: 14px;
    padding: 10px 36px 10px 12px;
  }

  .user-actions {
    gap: 8px;
  }

  .icon-button .label {
    display: none;
  }

  .cart-count {
    top: -8px;
    right: -8px;
  }
}
</style>