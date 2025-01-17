<template>
    <div class="top-navbar bg-primary text-white py-2">
      <div class="container">
        <div class="row align-items-center">
          <!-- Contact Info -->
          <div class="col-12 col-md-4 mb-2 mb-md-0">
            <div class="d-flex justify-content-center justify-content-md-start align-items-center">
              <a href="tel:+59177788899" class="text-white text-decoration-none me-3">
                <i class="fas fa-phone me-1"></i>
                +591 77788899
              </a>
              <a href="#" class="text-white text-decoration-none d-none d-sm-inline">
                <i class="fas fa-envelope me-1"></i>
                info@example.com
              </a>
            </div>
          </div>
  
          <!-- Slogan -->
          <div class="col-12 col-md-4 text-center mb-2 mb-md-0">
            <span class="fw-bold d-inline-block px-2 py-1 rounded bg-white text-primary">
              La experiencia de compra más veloz del país
            </span>
          </div>
  
          <!-- Right Side Links and Dropdowns -->
          <div class="col-12 col-md-4">
            <div class="d-flex justify-content-center justify-content-md-end align-items-center flex-wrap">
              <a href="#" class="text-white text-decoration-none me-3 mb-2 mb-md-0">
                <i class="fas fa-question-circle me-1"></i>
                Ayuda
              </a>
              <a href="#" class="text-white text-decoration-none me-3 mb-2 mb-md-0">
                <i class="fas fa-truck me-1"></i>
                Rastrear Pedido
              </a>
              <div class="dropdown me-2 mb-2 mb-md-0">
                <button class="btn btn-sm btn-outline-light dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                  <i class="fas fa-globe me-1"></i>Español
                </button>
                <ul class="dropdown-menu">
                  <li><a class="dropdown-item" href="#"><i class="fas fa-check me-1"></i>Español</a></li>
                  <li><a class="dropdown-item" href="#"><i class="fas fa-check me-1"></i>English</a></li>
                </ul>
              </div>
              <div class="dropdown mb-2 mb-md-0">
                <button class="btn btn-sm btn-outline-light dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                  <i class="fas fa-money-bill-wave me-1"></i>BS
                </button>
                <ul class="dropdown-menu">
                  <li><a class="dropdown-item" href="#"><i class="fas fa-check me-1"></i>BS</a></li>
                  <li><a class="dropdown-item" href="#"><i class="fas fa-check me-1"></i>USD</a></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  // No additional script needed
  </script>
  
  <style scoped>
  .top-navbar {
    font-size: 0.9rem;
  }
  
  .btn-outline-light {
    border-width: 1px;
    font-size: 0.9rem;
  }
  
  .btn-outline-light:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
  
  .dropdown-menu {
    font-size: 0.9rem;
  }
  
  .dropdown-item:hover {
    background-color: #f8f9fa;
  }
  
  @media (max-width: 767.98px) {
    .top-navbar {
      font-size: 0.8rem;
    }
  
    .btn-outline-light {
      font-size: 0.8rem;
      padding: 0.2rem 0.5rem;
    }
  }
  </style>
  
  