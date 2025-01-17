<template>
    <header class="sticky-top">
      <!-- Main Navigation -->
      <nav class="navbar navbar-expand-lg navbar-dark custom-navbar">
        <div class="container">
          <!-- Logo -->
          <a class="navbar-brand" href="#">
            <img src="@/assets/logo.png" alt="Logo" height="40">
          </a>
  
          <!-- Mobile Toggle -->
          <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarContent" aria-controls="navbarContent" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
          </button>
  
          <!-- Navbar Content -->
          <div class="collapse navbar-collapse" id="navbarContent">
            <!-- Search Bar -->
            <form class="d-flex mx-auto mt-2 mt-lg-0 col-12 col-lg-4">
              <div class="input-group">
                <input class="form-control" type="search" placeholder="Buscar productos..." aria-label="Search">
                <button class="btn btn-outline-light" type="submit">
                  <i class="fas fa-search"></i>
                </button>
              </div>
            </form>
  
            <!-- Right Navigation Items -->
            <ul class="navbar-nav ms-auto mb-2 mb-lg-0">
              <li class="nav-item">
                <a class="nav-link" href="/login">
                  <i class="fas fa-user me-1"></i>
                  <span>Login</span>
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link" href="#">
                  <i class="fas fa-heart me-1"></i>
                  <span>Favoritos</span>
                </a>
              </li>
              <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                  <i class="fas fa-shopping-cart me-1"></i>
                  <span>Carrito</span>
                  <span class="badge bg-danger ms-1">{{ cartItems }}</span>
                </a>
                <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown">
                  <li><a class="dropdown-item" href="#">No hay items en el carrito</a></li>
                </ul>
              </li>
            </ul>
          </div>
        </div>
      </nav>
  
      <!-- Secondary Navigation -->
      <nav class="navbar navbar-expand-lg navbar-light bg-light-blue">
        <div class="container">
          <div class="row w-100">
            <!-- Left Select -->
            <div class="col-12 col-lg-3 mb-2 mb-lg-0">
              <div class="dropdown">
                <button class="btn btn-primary dropdown-toggle w-100" type="button" id="catalogDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                  <i class="fas fa-th-list me-1"></i>Catálogos
                </button>
                <ul class="dropdown-menu" aria-labelledby="catalogDropdown">
                  <li><a class="dropdown-item" href="#">Catálogo 1</a></li>
                  <li><a class="dropdown-item" href="#">Catálogo 2</a></li>
                  <li><a class="dropdown-item" href="#">Catálogo 3</a></li>
                </ul>
              </div>
            </div>
  
            <!-- Center Navigation -->
            <div class="col-12 col-lg-6 mb-2 mb-lg-0">
              <ul class="nav justify-content-center">
                <li class="nav-item">
                  <a class="nav-link" href="#">Inicio</a>
                </li>
                <li class="nav-item">
                  <a class="nav-link" href="#">Categorías</a>
                </li>
                <li class="nav-item">
                  <a class="nav-link" href="#">Productos</a>
                </li>
                <li class="nav-item">
                  <a class="nav-link" href="#">Ofertas</a>
                </li>
                <li class="nav-item">
                  <a class="nav-link" href="#">Contacto</a>
                </li>
              </ul>
            </div>
  
            <!-- Right Select -->
            <div class="col-12 col-lg-3">
              <div class="dropdown">
                <button class="btn btn-primary dropdown-toggle w-100" type="button" id="countryDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                  <i class="fas fa-globe me-1"></i>País
                </button>
                <ul class="dropdown-menu" aria-labelledby="countryDropdown">
                  <li><a class="dropdown-item" href="#">Bolivia</a></li>
                  <li><a class="dropdown-item" href="#">Perú</a></li>
                  <li><a class="dropdown-item" href="#">Chile</a></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  
  const cartItems = ref(0);
  </script>
  
  <style scoped>
  .custom-navbar {
    background: linear-gradient(to right, #0056b3, #007bff);
  }
  
  .navbar-dark .navbar-nav .nav-link {
    color: rgba(255, 255, 255, 0.9) !important;
    font-weight: 600;
    transition: color 0.3s ease, transform 0.3s ease;
  }
  
  .navbar-dark .navbar-nav .nav-link:hover {
    color: #ffffff !important;
    text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
    transform: translateY(-2px);
  }
  
  .bg-light-blue {
    background-color: #e6f2ff;
  }
  
  .bg-light-blue .nav-link {
    color: #0056b3 !important;
    font-weight: 600;
    transition: color 0.3s ease, transform 0.3s ease;
  }
  
  .bg-light-blue .nav-link:hover {
    color: #007bff !important;
    transform: translateY(-2px);
  }
  
  .dropdown-menu {
    min-width: 200px;
    border: none;
    box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
  }
  
  .btn-secondary {
    background-color: #0056b3;
    border-color: #0056b3;
    transition: background-color 0.3s ease;
  }
  
  .btn-secondary:hover {
    background-color: #004494;
    border-color: #004494;
  }
  
  @media (max-width: 991.98px) {
    .navbar-nav {
      margin-top: 1rem;
    }
    
    .nav-item {
      text-align: center;
    }
  }
  </style>
  
  