<template>
    <div class="admin-layout">
      <nav :class="['sidebar', { 'open': sidebarOpen }]">
        <div class="sidebar-header">
          <h3>Admin Panel</h3>
        </div>
        <ul class="sidebar-menu">
          <li v-for="item in menuItems" :key="item.path">
            <router-link :to="item.path" class="sidebar-link" :class="{ 'active': $route.path === item.path }" @click="closeSidebarOnMobile">
              <i :class="['bi', item.icon]"></i>
              <span>{{ item.name }}</span>
            </router-link>
          </li>
        </ul>
      </nav>
      <div class="content-wrapper">
        <header class="top-navbar">
          <div class="container-fluid">
            <router-link to="/admin" class="home-link">
              <i class="bi bi-house-door"></i>
              <span>Home</span>
            </router-link>
            <div class="user-menu">
              <button class="user-menu-toggle" @click="toggleUserMenu">
                <i class="bi bi-person-circle"></i>
                <span>Admin User</span>
                <i class="bi bi-chevron-down"></i>
              </button>
              <ul class="user-menu-dropdown" v-show="userMenuOpen">
                <li><a href="#" @click.prevent="goToProfile"><i class="bi bi-person"></i> Profile</a></li>
                <li><a href="#" @click.prevent="goToSettings"><i class="bi bi-gear"></i> Settings</a></li>
                <li><hr class="dropdown-divider"></li>
                <li><a href="#" @click.prevent="logout" class="logout-link"><i class="bi bi-box-arrow-right"></i> Logout</a></li>
              </ul>
            </div>
          </div>
        </header>
        <main class="main-content">
          <RouterView />
        </main>
      </div>
      <!-- Always visible toggle button -->
      <button class="sidebar-toggle" @click="toggleSidebar">
        <i :class="['bi', sidebarOpen ? 'bi-x' : 'bi-list']"></i>
      </button>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, onUnmounted } from 'vue';
  import { useRouter } from 'vue-router';
  
  const router = useRouter();
  const sidebarOpen = ref(window.innerWidth > 768);
  const userMenuOpen = ref(false);
  
  const toggleSidebar = () => {
    sidebarOpen.value = !sidebarOpen.value;
  };
  
  const toggleUserMenu = () => {
    userMenuOpen.value = !userMenuOpen.value;
  };
  
  const closeSidebarOnMobile = () => {
    if (window.innerWidth <= 768) {
      sidebarOpen.value = false;
    }
  };
  
  const menuItems = [
    { name: 'Dashboard', path: '/inicio', icon: 'bi-speedometer2' },
    { name: 'Usuarios', path: '/usuarios', icon: 'bi-people' },
    { name: 'Catalogos', path: '/catalogos', icon: 'bi-box' },
    { name: 'Categorias', path: '/categorias', icon: 'bi-gear' },
    { name: 'Productos', path: '/productos', icon: 'bi-box-arrow-right', logout: true }
  ];
  
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
    if (window.innerWidth > 768) {
      sidebarOpen.value = true;
    } else {
      sidebarOpen.value = false;
    }
  };
  
  onMounted(() => {
    window.addEventListener('resize', handleResize);
  });
  
  onUnmounted(() => {
    window.removeEventListener('resize', handleResize);
  });
  </script>
  
  <style scoped>
  .admin-layout {
    display: flex;
    min-height: 100vh;
    background-color: #f8f9fa;
    position: relative;
  }
  
  .sidebar {
    width: 250px;
    background-color: #2c3e50;
    color: #ecf0f1;
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
    background-color: #34495e;
    text-align: center;
  }
  
  .sidebar-header h3 {
    margin: 0;
    font-size: 1.2rem;
    font-weight: 600;
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
    color: #ecf0f1;
    text-decoration: none;
    transition: all 0.2s ease;
  }
  
  .sidebar-link:hover, .sidebar-link.active {
    background-color: #34495e;
  }
  
  .sidebar-link i {
    font-size: 1.2rem;
    margin-right: 0.75rem;
  }
  
  .content-wrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
    margin-left: 250px;
    transition: all 0.3s ease;
  }
  
  .top-navbar {
    background-color: #ffffff;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    padding: 0.5rem 1rem;
  }
  
  .top-navbar .container-fluid {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  
  .home-link, .user-menu-toggle {
    background: none;
    border: none;
    color: #2c3e50;
    font-size: 1rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    padding: 0.5rem;
    transition: all 0.2s ease;
  }
  
  .home-link:hover, .user-menu-toggle:hover {
    color: #3498db;
  }
  
  .home-link {
    text-decoration: none;
  }
  
  .home-link i, .user-menu-toggle i {
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
    background-color: #ffffff;
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
    color: #2c3e50;
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
    color: #e74c3c !important;
  }
  
  .logout-link:hover {
    background-color: #fde8e7 !important;
  }
  
  .main-content {
    flex: 1;
    padding: 2rem;
    overflow-y: auto;
  }
  
  .sidebar-toggle {
    position: fixed;
    top: 1rem;
    right: 1rem;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: #3498db;
    color: #ffffff;
    border: none;
    font-size: 1.2rem;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    z-index: 1001;
    transition: all 0.3s ease;
  }
  
  .sidebar-toggle:hover {
    background-color: #2980b9;
  }
  
  @media (max-width: 768px) {
    .sidebar {
      width: 100%;
      max-width: 300px;
    }
  
    .content-wrapper {
      margin-left: 0;
    }
  
    .sidebar-toggle {
      top: 0.5rem;
      right: 0.5rem;
    }
  
    .home-link span, .user-menu-toggle span {
      display: none;
    }
  }
  </style>
  
  