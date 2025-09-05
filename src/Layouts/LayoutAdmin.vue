<template>
  <div class="admin-layout">
    <nav :class="['sidebar', { 'open': sidebarOpen }]">
      <div class="sidebar-header">
        <h3>Admin Panel</h3>
        <button @click="toggleSidebar" class="close-sidebar d-md-none">
          <i class="bi bi-x-lg"></i>
        </button>
      </div>
      <ul class="sidebar-menu">
        <li v-for="item in menuItems" :key="item.path">
          <div class="sidebar-link" :class="{ 'active': isActive(item.path) }" @click="toggleSubmenu(item)">
            <i :class="['bi', item.icon]"></i>
            <span>{{ item.name }}</span>
            <i v-if="item.subItems"
              :class="['bi', 'submenu-indicator', item.expanded ? 'bi-chevron-down' : 'bi-chevron-right']"></i>
          </div>
          <transition name="slide-fade">
            <ul v-if="item.subItems && item.expanded" class="submenu">
              <li v-for="subItem in item.subItems" :key="subItem.path">
                <router-link :to="subItem.path" class="submenu-link" :class="{ 'active': $route.path === subItem.path }"
                  @click="closeSidebarOnMobile">
                  <i :class="['bi', subItem.icon]"></i>
                  {{ subItem.name }}
                </router-link>
              </li>
            </ul>
          </transition>
        </li>
      </ul>
    </nav>
    <div class="content-wrapper" :class="{ 'sidebar-open': sidebarOpen }">
      <header class="top-navbar">
        <div class="container-fluid">
          <button class="sidebar-toggle d-md-none" @click="toggleSidebar">
            <i :class="['bi', sidebarOpen ? 'bi-x-lg' : 'bi-list']"></i>
          </button>
          <router-link to="/" class="home-link">
            <i class="bi bi-house-door"></i>
            <span class="d-none d-md-inline">Home</span>
          </router-link>
          <div class="user-menu">
            <button class="user-menu-toggle" @click="toggleUserMenu">
              <i class="bi bi-person-circle"></i>
              <span class="d-none d-md-inline">{{ currentUser.name }}</span>
              <i class="bi bi-chevron-down"></i>
            </button>
            <transition name="fade">
              <ul class="user-menu-dropdown" v-show="userMenuOpen">
                <li><a href="#" @click.prevent="goToProfile"><i class="bi bi-person"></i> Profile</a></li>
                <li><a href="#" @click.prevent="goToSettings"><i class="bi bi-gear"></i> Settings</a></li>
                <li>
                  <hr class="dropdown-divider">
                </li>
                <li><a href="#" @click.prevent="logout" class="logout-link"><i class="bi bi-box-arrow-right"></i>
                    Logout</a></li>
              </ul>
            </transition>
          </div>
        </div>
      </header>
      <main class="main-content" @click="closeRouterViewOnMobile">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();
const sidebarOpen = ref(window.innerWidth >= 768);
const userMenuOpen = ref(false);

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value;
};

const toggleUserMenu = () => {
  userMenuOpen.value = !userMenuOpen.value;
};

const closeSidebarOnMobile = () => {
  if (window.innerWidth < 768) {
    sidebarOpen.value = false;
  }
};

const closeRouterViewOnMobile = () => {
  if (window.innerWidth < 768) {
    sidebarOpen.value = false;
    userMenuOpen.value = false;
  }
};

const menuItems = ref([
  {
    name: 'Dashboard',
    path: '/admin-panel',
    icon: 'bi-speedometer2'
  },
  {
    name: 'Users',
    path: '/usuarios',
    icon: 'bi-people',
    subItems: [
      { name: 'User List', path: '/usuarios', icon: 'bi-list-ul' },
    ]
  },
  {
    name: 'Catalogos',
/*     path: '/catalogos', */
    icon: 'bi-collection',
    subItems: [
      { name: 'Catalogos Activos', path: '/catalogos', icon: 'bi-list-ul' },
      { name: 'Historial de Catalogos', path: '/catalgos-historiales', icon: 'bi-plus-circle' },
    ]
  },
  {
    name: 'Categories',
    path: '/categorias-panel',
    icon: 'bi-tags'
  },
  {
    name: 'Products',
    path: '/productos-admin',
    icon: 'bi-box-seam',
  },
  {
    name: 'Roles',
    path: '/roles',
    icon: 'bi-shield-check'
  },
  {
    name: 'Pedidos',
    path: '/pedidos',
    icon: 'bi-cart-fill',
  },
  {
    name: 'Cupones',
    path: '/cupones',
    icon: 'bi-bell-fill'
  },
  {
    name:'Contactanos',
    path: '/contactanos-admin',
    icon: 'bi-envelope',
  },
  {
    name: 'Testimonios',
    path: '/testimonios-admin',
    icon: 'bi-chat-left-text',
  },
  {
    name: 'Citas',
    path: '/citas-admin',
    icon: 'bi-calendar',
  }
]);

const toggleSubmenu = (item) => {
  if (item.subItems) {
    item.expanded = !item.expanded;
  } else {
    router.push(item.path);
    closeSidebarOnMobile();
  }
};

const isActive = (path) => {
  return route.path.startsWith(path);
};

const currentUser = ref({
  name: 'Admin User',
  // Add more user properties as needed
});

const goToProfile = () => {
  router.push('/admin/profile');
  userMenuOpen.value = false;
};

const goToSettings = () => {
  router.push('/admin/settings');
  userMenuOpen.value = false;
};

const logout = () => {
  // Implement logout logic here
  console.log('Logging out...');
  router.push('/login');
};

const handleResize = () => {
  sidebarOpen.value = window.innerWidth >= 768;
};

onMounted(() => {
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});
</script>

<style scoped>
@import 'bootstrap/dist/css/bootstrap.min.css';
@import 'bootstrap-icons/font/bootstrap-icons.css';

.admin-layout {
  display: flex;
  min-height: 100vh;
  background-color: #f8f9fa;
}

.sidebar {
  width: 250px;
  background-color: #343a40;
  color: #fff;
  transition: all 0.3s ease;
  overflow-y: auto;
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  z-index: 1000;
}

.sidebar:not(.open) {
  transform: translateX(-100%);
}

.sidebar-header {
  padding: 1rem;
  background-color: #212529;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sidebar-header h3 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
}

.close-sidebar {
  background: none;
  border: none;
  color: #fff;
  font-size: 1.2rem;
  cursor: pointer;
}

.sidebar-menu {
  list-style-type: none;
  padding: 0;
  margin: 1rem 0;
}

.sidebar-link {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  color: #fff;
  text-decoration: none;
  transition: all 0.2s ease;
  cursor: pointer;
}

.sidebar-link:hover,
.sidebar-link.active {
  background-color: #495057;
}

.sidebar-link i {
  font-size: 1.2rem;
  margin-right: 0.75rem;
}

.submenu-indicator {
  margin-left: auto;
  transition: transform 0.3s ease;
}

.sidebar-link[aria-expanded="true"] .submenu-indicator {
  transform: rotate(180deg);
}

.submenu {
  list-style-type: none;
  padding-left: 2rem;
  background-color: #495057;
}

.submenu-link {
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  color: #fff;
  text-decoration: none;
  transition: all 0.2s ease;
}

.submenu-link:hover,
.submenu-link.active {
  background-color: #6c757d;
}

.submenu-link i {
  font-size: 1rem;
  margin-right: 0.5rem;
}

.content-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: 0;
  transition: all 0.3s ease;
}

@media (min-width: 768px) {
  .content-wrapper {
    margin-left: 250px;
  }
}

.top-navbar {
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 0.5rem 1rem;
}

.top-navbar .container-fluid {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.home-link,
.user-menu-toggle {
  background: none;
  border: none;
  color: #343a40;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 0.5rem;
  transition: all 0.2s ease;
}

.home-link:hover,
.user-menu-toggle:hover {
  color: #007bff;
}

.home-link {
  text-decoration: none;
}

.home-link i,
.user-menu-toggle i {
  margin-right: 0.5rem;
}

.user-menu {
  position: relative;
}

.user-menu-toggle span {
  margin: 0 0.5rem;
}

.user-menu-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  background-color: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  list-style-type: none;
  padding: 0.5rem 0;
  margin: 0.5rem 0 0;
  min-width: 200px;
  z-index: 1000;
}

.user-menu-dropdown li a {
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  color: #343a40;
  text-decoration: none;
  transition: all 0.2s ease;
}

.user-menu-dropdown li a:hover {
  background-color: #f8f9fa;
}

.user-menu-dropdown li a i {
  margin-right: 0.5rem;
}

.user-menu-dropdown hr {
  margin: 0.5rem 0;
  border-color: #e0e0e0;
}

.logout-link {
  color: #dc3545 !important;
}

.logout-link:hover {
  background-color: #fde8e7 !important;
}

.main-content {
  flex: 1;
  padding: 0.5rem;
  overflow-y: auto;
}

.sidebar-toggle {
  background-color: transparent;
  color: #343a40;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0;
  margin-right: 1rem;
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Responsive styles for Bootstrap tables */
.table-responsive {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

@media (max-width: 767.98px) {
  .table-responsive-md {
    display: block;
    width: 100%;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
}
</style>