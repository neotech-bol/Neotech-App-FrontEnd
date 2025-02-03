<template>
  <header class="header">
    <div class="top-bar">
      <div class="contact">
        <a href="tel:+59177997694"><i class="fas fa-phone-alt"></i> +591 77997694</a>
      </div>
      <div class="announcement">
        <i class="fas fa-bolt"></i> La experiencia de compra más veloz del país
      </div>
      <div class="top-links">
        <a href="#"><i class="fas fa-question-circle"></i> Ayuda</a>
        <a href="#"><i class="fas fa-truck"></i> Rastrear Pedido</a>
        <select v-model="language" class="select-styled">
          <option value="es">🇪🇸 Español</option>
          <option value="en">🇺🇸 English</option>
        </select>
        <select v-model="currency" class="select-styled">
          <option value="bs">Bs</option>
          <option value="usd">USD</option>
        </select>
      </div>
    </div>

    <div class="main-header">
      <div class="logo">
        <img src="../../../public/logo/Logo Neofetch PNG.png" alt="Logo"/>
      </div>

      <div class="search-bar">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="¿Qué estás buscando en este ciclo?"
        />
        <button class="search-button">
          <i class="fas fa-search"></i>
        </button>
      </div>

      <div class="user-actions">
        <button class="icon-button" @click="handleAccountClick">
          <i class="fas fa-user"></i>
          <span class="label">{{ isLoggedIn ? 'Cuenta' : 'Iniciar sesión' }}</span>
        </button>
        <button class="icon-button">
          <i class="fas fa-heart"></i>
          <span class="label">Favoritos</span>
        </button>
        <button class="icon-button cart-button" @click="carritoView()">
          <i class="fas fa-shopping-cart"></i>
          <span class="label">Carrito</span>
          <span class="cart-count" v-if="cartItemCount > 0">{{ cartItemCount }}</span>
        </button>
      </div>
    </div>

    <nav class="main-nav">
      <button class="catalog-button">
        <i class="fas fa-bars"></i>
        Ver catálogo
      </button>

      <button class="mobile-menu-toggle" @click="toggleMobileMenu">
        <i class="fas fa-bars"></i>
        <span class="label">Menú</span>
      </button>

      <ul :class="['nav-links', { 'mobile-open': isMobileMenuOpen }]">
        <li v-for="item in navItems" :key="item.path">
          <router-link :to="item.path">
            <i :class="item.icon"></i> {{ item.nombre }}
          </router-link>
        </li>
      </ul>

      <select v-model="location" class="select-styled location-select">
        <option value="cochabamba">Cochabamba</option>
        <option value="la-paz">La Paz</option>
        <option value="santa-cruz">Santa Cruz</option>
      </select>
    </nav>
  </header>
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
const isMobileMenuOpen = ref(false)
const cartStore = useCartStore(); // Usar el store de carrito
// Computed property para obtener el conteo de artículos en el carrito
const cartItemCount = computed(() => cartStore.uniqueItemCount); // Asegúrate de que totalItems esté definido en tu store
const navItems = [
  {
    nombre: 'Categorías',
    path: '/',
    icon: 'fas fa-th-large'
  },
  {
    nombre: 'Productos',
    path: '/producto',
    icon: 'fas fa-box-open'
  },
  {
    nombre: 'Nosotros',
    path: '/nosotros',
    icon: 'fas fa-users'
  },
  {
    nombre: 'Contacto',
    path: '/contacto',
    icon: 'fas fa-envelope'
  }
]
const isLoggedIn = ref(false); // Replace this with your actual authentication logic
// Verificar el token al montar el componente
onMounted(() => {
  const token = localStorage.getItem('token');
  isLoggedIn.value = !!token; // Establecer isLoggedIn en true si el token existe
  console.log(token); // Para depuración
});


const handleAccountClick = () => {
  if (isLoggedIn.value) {
    // Navegar a la vista de cuenta
    router.push({ path: '/perfil' }); // Ajusta la ruta según sea necesario
  } else {
    // Iniciar el proceso de inicio de sesión
    router.push({ path: '/login' }); // Ajusta la ruta según sea necesario
  }
};
const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

const carritoView = () => {
  router.push({path: '/checkout'})
}

</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css');

.header {
  font-family: 'Poppins', Arial, sans-serif;
  max-width: 1440px;
  margin: 0 auto;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.top-bar {
  background-color: #f0f0f0;
  padding: 8px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  font-size: 14px;
}

.top-bar a, .top-bar select {
  color: #333;
  text-decoration: none;
  margin-right: 16px;
  transition: color 0.3s ease;
}

.top-bar a:hover {
  color: #007bff;
}

.top-links {
  display: flex;
  align-items: center;
}

.select-styled {
  padding: 4px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
  cursor: pointer;
  transition: border-color 0.3s ease;
}

.select-styled:hover {
  border-color: #007bff;
}

.main-header {
  padding: 16px;
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
}

.search-bar input {
  width: 100%;
  padding: 12px 40px 12px 16px;
  border: 2px solid #ddd;
  border-radius: 25px;
  font-size: 16px;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.search-bar input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25);
}

.search-button {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  font-size: 20px;
  color: #007bff;
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
  background-color: #f8f9fa;
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
}

.catalog-button {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: #007bff;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 25px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.3s ease, transform 0.3s ease;
}

.catalog-button:hover {
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
  color: #333;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.nav-links a:hover {
  color: #007bff;
}

.location-select {
  padding: 8px 16px;
}

.mobile-menu-toggle {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
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
    margin: 16px 0;
  }

  .user-actions {
    justify-content: space-around;
    margin-top: 16px;
  }

  .mobile-menu-toggle {
    margin-top: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    padding: 12px;
    background-color: #007bff;
    color: white;
    border-radius: 25px;
    margin-bottom: 16px;
    font-weight: bold;
    transition: background-color 0.3s ease;
  }

  .mobile-menu-toggle:hover {
    background-color: #0056b3;
  }

  .mobile-menu-toggle i {
    margin-right: 8px;
  }

  .nav-links {
    display: none;
    flex-direction: column;
    width: 100%;
  }

  .nav-links.mobile-open {
    display: flex;
  }

  .nav-links li {
    margin-right: 0;
    margin-bottom: 12px;
  }

  .location-select {
    width: 100%;
    margin-top: 12px;
  }

  .catalog-button {
    width: 100%;
    justify-content: center;
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