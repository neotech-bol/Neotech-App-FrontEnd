<template>
    <section class="services-section">
      <div class="services-header">
        <h2>Nuestros <span class="highlight">Servicios</span></h2>
        <p>Nuestro objetivo es simplificar el proceso de importación y garantizar que encuentres exactamente lo que necesitas.</p>
      </div>
  
      <div class="services-grid">
        <!-- Catálogo Renovado -->
        <div class="service-card">
          <div class="icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-6M12 12l-4-4m4 4l4-4m-4 4V3"/>
            </svg>
          </div>
          <h3>Catálogo Renovado</h3>
          <p>Productos nuevos en cada ciclo de compra.</p>
        </div>
  
        <!-- Calidad Garantizada -->
        <div class="service-card">
          <div class="icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <h3>Calidad Garantizada</h3>
          <p>Solo trabajamos con marcas confiables.</p>
        </div>
  
        <!-- Seguimiento en tiempo real -->
        <div class="service-card">
          <div class="icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 6v6l4 2"/>
            </svg>
          </div>
          <h3>Seguimiento en tiempo real</h3>
          <p>Monitorea el estado de tus pedidos fácilmente.</p>
        </div>
  
        <!-- Atención personalizada -->
        <div class="service-card">
          <div class="icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <h3>Atención personalizada</h3>
          <p>Trato cercano y profesional.</p>
        </div>
      </div>
    </section>
  </template>
  
  <style scoped>
  .services-section {
    max-width: 1200px;
    margin: 60px auto;
    padding: 0 20px;
  }
  
  .services-header {
    text-align: center;
    margin-bottom: 50px;
  }
  
  .services-header h2 {
    font-size: 2rem;
    color: #333;
    margin-bottom: 15px;
  }
  
  .highlight {
    color: #007bff;
  }
  
  .services-header p {
    color: #666;
    max-width: 600px;
    margin: 0 auto;
    line-height: 1.6;
  }
  
  .services-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 30px;
  }
  
  .service-card {
    background: #fff;
    padding: 30px;
    border-radius: 8px;
    text-align: center;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    border: 1px solid #eee;
  }
  
  .service-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  }
  
  .icon {
    width: 70px;
    height: 70px;
    margin: 0 auto 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: #f8f9fa;
    color: #007bff;
  }
  
  .service-card h3 {
    color: #333;
    font-size: 1.2rem;
    margin-bottom: 15px;
  }
  
  .service-card p {
    color: #666;
    font-size: 0.9rem;
    line-height: 1.5;
  }
  
  /* Responsive Design */
  @media (max-width: 1024px) {
    .services-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
  
  @media (max-width: 640px) {
    .services-grid {
      grid-template-columns: 1fr;
    }
  
    .services-header h2 {
      font-size: 1.75rem;
    }
  
    .service-card {
      padding: 20px;
    }
  }
  </style>