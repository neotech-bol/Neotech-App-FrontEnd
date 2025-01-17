<template>
    <footer class="footer">
      <div class="footer-content">
        <!-- Logo y descripción -->
        <div class="footer-brand">
          <div class="logo">
            <img src="" alt="Neo Tech Bol" />
          </div>
          <p class="description">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque molestie eu dolor at eleifend. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          </p>
        </div>
  
        <!-- Categorías -->
        <div class="footer-section">
          <h3>Categorías</h3>
          <ul>
            <li><a href="#">Motos Eléctricas</a></li>
            <li><a href="#">Calentadores a Gas</a></li>
            <li><a href="#">Aspiradores Robot</a></li>
            <li><a href="#">Purificadores de Aire</a></li>
            <li><a href="#">Paneles Solares</a></li>
            <li><a href="#">Secadores de Cabello</a></li>
          </ul>
        </div>
  
        <!-- Neotech Bol -->
        <div class="footer-section">
          <h3>Neotech Bol</h3>
          <ul>
            <li><a href="#">Sobre Nosotros</a></li>
            <li><a href="#">Rastrear Pedido</a></li>
            <li><a href="#">Información Legal</a></li>
            <li><a href="#">Términos y condiciones</a></li>
            <li><a href="#">Pago seguro</a></li>
            <li><a href="#">Contáctanos</a></li>
          </ul>
        </div>
  
        <!-- Cuenta -->
        <div class="footer-section">
          <h3>Cuenta</h3>
          <ul>
            <li><a href="#">Entrar</a></li>
            <li><a href="#">Ver Carrito</a></li>
            <li><a href="#">Política de devoluciones</a></li>
            <li><a href="#">Trabaja con nosotros</a></li>
            <li><a href="#">Programa de afiliados</a></li>
            <li><a href="#">Métodos de Pagos</a></li>
          </ul>
        </div>
  
        <!-- Contacto -->
        <div class="footer-section">
          <h3>Contacto</h3>
          <div class="contact-info">
            <p><i class="location-icon"></i> Avenida América y Libertador, Zona Cala Cala Cochabamba, Bolivia.</p>
            <p><i class="phone-icon"></i> +591 759-01415</p>
            <p><i class="email-icon"></i> contacto@neotechbo.com</p>
          </div>
          <div class="social-links">
            <a href="#" class="social-link">
              <img src="" alt="Facebook" />
            </a>
            <a href="#" class="social-link">
              <img src="" alt="Twitter" />
            </a>
            <a href="#" class="social-link">
              <img src="" alt="LinkedIn" />
            </a>
            <a href="#" class="social-link">
              <img src="" alt="Instagram" />
            </a>
          </div>
        </div>
      </div>
  
      <!-- Footer bottom -->
      <div class="footer-bottom">
        <p>Desarrollado por Tinkuna Dev. 2025.</p>
        <div class="payment-methods">
          <img src="" alt="Visa" />
          <img src="" alt="Mastercard" />
          <img src="" alt="PayPal" />
          <img src="" alt="Skrill" />
          <img src="" alt="QR" />
          <img src="" alt="Visa Electron" />
        </div>
      </div>
    </footer>
  </template>
  
  <style scoped>
  .footer {
    background-color: #fff;
    padding: 40px 0 0;
    border-top: 1px solid #eee;
  }
  
  .footer-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
    display: grid;
    grid-template-columns: 2fr repeat(4, 1fr);
    gap: 30px;
  }
  
  .footer-brand {
    padding-right: 40px;
  }
  
  .logo img {
    max-width: 200px;
    margin-bottom: 20px;
  }
  
  .description {
    color: #666;
    line-height: 1.5;
    font-size: 0.9rem;
  }
  
  .footer-section h3 {
    color: #333;
    font-size: 1.1rem;
    margin-bottom: 20px;
    font-weight: 600;
  }
  
  .footer-section ul {
    list-style: none;
    padding: 0;
  }
  
  .footer-section ul li {
    margin-bottom: 12px;
  }
  
  .footer-section ul li a {
    color: #666;
    text-decoration: none;
    font-size: 0.9rem;
    transition: color 0.3s;
  }
  
  .footer-section ul li a:hover {
    color: #007bff;
  }
  
  .contact-info p {
    color: #666;
    margin-bottom: 12px;
    font-size: 0.9rem;
    display: flex;
    align-items: center;
  }
  
  .social-links {
    display: flex;
    gap: 15px;
    margin-top: 20px;
  }
  
  .social-link img {
    width: 24px;
    height: 24px;
    transition: opacity 0.3s;
  }
  
  .social-link:hover img {
    opacity: 0.7;
  }
  
  .footer-bottom {
    margin-top: 40px;
    padding: 20px;
    border-top: 1px solid #eee;
    display: flex;
    justify-content: space-between;
    align-items: center;
    max-width: 1200px;
    margin: 40px auto 0;
  }
  
  .footer-bottom p {
    color: #666;
    font-size: 0.9rem;
  }
  
  .payment-methods {
    display: flex;
    gap: 15px;
    align-items: center;
  }
  
  .payment-methods img {
    height: 25px;
    opacity: 0.7;
  }
  
  /* Responsive Design */
  @media (max-width: 1024px) {
    .footer-content {
      grid-template-columns: repeat(3, 1fr);
    }
  
    .footer-brand {
      grid-column: span 3;
      padding-right: 0;
    }
  }
  
  @media (max-width: 768px) {
    .footer-content {
      grid-template-columns: repeat(2, 1fr);
    }
  
    .footer-brand {
      grid-column: span 2;
    }
  }
  
  @media (max-width: 480px) {
    .footer-content {
      grid-template-columns: 1fr;
    }
  
    .footer-brand {
      grid-column: span 1;
    }
  
    .footer-bottom {
      flex-direction: column;
      gap: 20px;
      text-align: center;
    }
  }
  </style>