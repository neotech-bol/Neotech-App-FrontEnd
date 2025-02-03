<template>
  <footer class="footer">
    <div class="footer-content">
      <!-- Logo y descripción -->
      <div class="footer-brand">
        <div class="logo">
          <img src="../../../public/logo/Logo Neofetch PNG.png" alt="Neo Tech Bol" />
        </div>
        <p class="description">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque molestie eu dolor at eleifend. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
        </p>
      </div>

      <!-- Categorías -->
      <div class="footer-section">
        <h3><i class="fas fa-th-large"></i> Categorías</h3>
        <ul>
          <li><a href="#"><i class="fas fa-motorcycle"></i> Motos Eléctricas</a></li>
          <li><a href="#"><i class="fas fa-fire"></i> Calentadores a Gas</a></li>
          <li><a href="#"><i class="fas fa-robot"></i> Aspiradores Robot</a></li>
          <li><a href="#"><i class="fas fa-wind"></i> Purificadores de Aire</a></li>
          <li><a href="#"><i class="fas fa-solar-panel"></i> Paneles Solares</a></li>
          <li><a href="#"><i class="fas fa-fan"></i> Secadores de Cabello</a></li>
        </ul>
      </div>

      <!-- Neotech Bol -->
      <div class="footer-section">
        <h3><i class="fas fa-info-circle"></i> Neotech Bol</h3>
        <ul>
          <li><a href="#"><i class="fas fa-users"></i> Sobre Nosotros</a></li>
          <li><a href="#"><i class="fas fa-truck"></i> Rastrear Pedido</a></li>
          <li><a href="#"><i class="fas fa-gavel"></i> Información Legal</a></li>
          <li><a href="#"><i class="fas fa-file-contract"></i> Términos y condiciones</a></li>
          <li><a href="#"><i class="fas fa-lock"></i> Pago seguro</a></li>
          <li><a href="#"><i class="fas fa-envelope"></i> Contáctanos</a></li>
        </ul>
      </div>

      <!-- Cuenta -->
      <div class="footer-section">
        <h3><i class="fas fa-user-circle"></i> Cuenta</h3>
        <ul>
          <li><a href="#"><i class="fas fa-sign-in-alt"></i> Entrar</a></li>
          <li><a href="#"><i class="fas fa-shopping-cart"></i> Ver Carrito</a></li>
          <li><a href="#"><i class="fas fa-undo"></i> Política de devoluciones</a></li>
          <li><a href="#"><i class="fas fa-briefcase"></i> Trabaja con nosotros</a></li>
          <li><a href="#"><i class="fas fa-handshake"></i> Programa de afiliados</a></li>
          <li><a href="#"><i class="fas fa-credit-card"></i> Métodos de Pagos</a></li>
        </ul>
      </div>

      <!-- Contacto -->
      <div class="footer-section">
        <h3><i class="fas fa-address-book"></i> Contacto</h3>
        <div class="contact-info">
          <p><i class="fas fa-map-marker-alt"></i> Avenida América y Libertador, Zona Cala Cala Cochabamba, Bolivia.</p>
          <p><i class="fas fa-phone-alt"></i> +591 759-01415</p>
          <p><i class="fas fa-envelope"></i> contacto@neotechbo.com</p>
        </div>
        <div class="social-links">
          <a href="#" class="social-link">
            <i class="fab fa-facebook-f"></i>
          </a>
          <a href="#" class="social-link">
            <i class="fab fa-twitter"></i>
          </a>
          <a href="#" class="social-link">
            <i class="fab fa-linkedin-in"></i>
          </a>
          <a href="#" class="social-link">
            <i class="fab fa-instagram"></i>
          </a>
        </div>
      </div>
    </div>

    <!-- Footer bottom -->
    <div class="footer-bottom">
      <p>Desarrollado por Tinkuna Dev. 2025.</p>
      <div class="payment-methods">
        <i class="fab fa-cc-visa"></i>
        <i class="fab fa-cc-mastercard"></i>
        <i class="fab fa-cc-paypal"></i>
        <i class="fab fa-cc-stripe"></i>
        <i class="fas fa-qrcode"></i>
        <i class="fab fa-cc-visa"></i>
      </div>
    </div>
  </footer>
</template>

<script setup>
// No additional script needed for this component
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css');

.footer {
  font-family: 'Poppins', Arial, sans-serif;
  background-color: #f8f9fa;
  padding: 60px 0 0;
  border-top: 1px solid #e9ecef;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: grid;
  grid-template-columns: 2fr repeat(4, 1fr);
  gap: 40px;
}

.footer-brand {
  padding-right: 40px;
}

.logo img {
  max-width: 200px;
  margin-bottom: 20px;
}

.description {
  color: #6c757d;
  line-height: 1.6;
  font-size: 0.95rem;
}

.footer-section h3 {
  color: #343a40;
  font-size: 1.2rem;
  margin-bottom: 25px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 10px;
}

.footer-section h3 i {
  color: #007bff;
}

.footer-section ul {
  list-style: none;
  padding: 0;
}

.footer-section ul li {
  margin-bottom: 15px;
}

.footer-section ul li a {
  color: #6c757d;
  text-decoration: none;
  font-size: 0.95rem;
  transition: color 0.3s, transform 0.3s;
  display: flex;
  align-items: center;
  gap: 10px;
}

.footer-section ul li a:hover {
  color: #007bff;
  transform: translateX(5px);
}

.contact-info p {
  color: #6c757d;
  margin-bottom: 15px;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  gap: 10px;
}

.social-links {
  display: flex;
  gap: 20px;
  margin-top: 25px;
}

.social-link {
  color: #6c757d;
  font-size: 1.2rem;
  transition: color 0.3s, transform 0.3s;
}

.social-link:hover {
  color: #007bff;
  transform: translateY(-3px);
}

.footer-bottom {
  margin-top: 60px;
  padding: 25px 20px;
  border-top: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 60px auto 0;
}

.footer-bottom p {
  color: #6c757d;
  font-size: 0.9rem;
}

.payment-methods {
  display: flex;
  gap: 20px;
  align-items: center;
}

.payment-methods i {
  font-size: 2rem;
  color: #6c757d;
  transition: color 0.3s;
}

.payment-methods i:hover {
  color: #007bff;
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

  .payment-methods {
    justify-content: center;
  }
}
</style>