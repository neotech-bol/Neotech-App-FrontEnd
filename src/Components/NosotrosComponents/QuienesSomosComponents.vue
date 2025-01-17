<template>
    <div class="about-container">
      <div class="about-grid">
        <div class="image-grid">
          <!-- Imagen del trabajador (Tamaño recomendado: 600x800px) -->
          <div class="image-card large">
            <img src="../../../public/imagenes/Sin título.png" alt="Trabajador con tablet" />
            <span class="image-size-note">Tamaño recomendado: 600x800px</span>
          </div>
          <!-- Imagen de contenedores (Tamaño recomendado: 400x300px) -->
          <div class="image-card small">
            <img src="../../../public/imagenes/Sin título.png" alt="Contenedores" />
            <span class="image-size-note">Tamaño recomendado: 400x300px</span>
          </div>
          <!-- Imagen del barco (Tamaño recomendado: 400x300px) -->
          <div class="image-card small">
            <img src="../../../public/imagenes/Sin título.png" alt="Barco de carga" />
            <span class="image-size-note">Tamaño recomendado: 400x300px</span>
          </div>
        </div>
  
        <div class="content-section">
          <h2 class="title">¿Quiénes <span class="highlight">Somos</span>?</h2>
          <h3 class="subtitle">LIDERANDO LA IMPORTACIÓN INTELIGENTE EN BOLIVIA DESDE 2019</h3>
          
          <div class="description">
            <p>
              NeoTech - Bol fue fundada en 2019 por Jaime Jaldín Ninavia con el objetivo de ofrecer a los bolivianos una forma 
              innovadora y accesible de adquirir productos de calidad internacional. Nos especializamos en la Importación de 
              bienes por ciclos, adaptándonos a las necesidades de nuestros clientes y asegurando siempre las mejores 
              condiciones en precio y disponibilidad. Desde nuestros inicios, nos hemos comprometido a combinar tecnología y 
              eficiencia logística para conectar a Bolivia con las mejores ofertas del mercado global.
            </p>
            
            <p>
              Actualmente, contamos con una base de más de 2,400 clientes satisfechos en todo el país, quienes confían en 
              nuestra experiencia y profesionalismo. Aunque operamos principalmente de forma virtual a través de redes sociales, 
              también ofrecemos atención personalizada en nuestra oficina ubicada en Cochabamba. En NeoTech - Bol, nuestro 
              propósito es ser el puente entre las oportunidades del comercio internacional y las familias bolivianas, haciendo que 
              cada compra sea sencilla, confiable y beneficiosa.
            </p>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <style scoped>
  .about-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 40px 20px;
  }
  
  .about-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 40px;
    align-items: center; /* Cambiado de start a center */
  }
  
  .image-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(2, 200px);
    gap: 20px;
  }
  
  .image-card {
    position: relative;
    overflow: hidden;
    border-radius: 8px;
  }
  
  .image-card.large {
    grid-row: 1 / 3;
    grid-column: 1;
    height: 420px;
  }
  
  .image-card.small {
    height: 200px;
  }
  
  .image-card img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }
  
  .image-card:hover img {
    transform: scale(1.05);
  }

  .image-size-note {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(0,0,0,0.7);
    color: white;
    padding: 5px;
    font-size: 0.8rem;
    text-align: center;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .image-card:hover .image-size-note {
    opacity: 1;
  }
  
  .content-section {
    padding: 20px 0;
  }
  
  .title {
    font-size: 2.5rem;
    font-weight: bold;
    color: #333;
    margin-bottom: 1rem;
  }
  
  .highlight {
    color: #007bff;
  }
  
  .subtitle {
    font-size: 1.2rem;
    color: #666;
    margin-bottom: 2rem;
    font-weight: 500;
  }
  
  .description {
    color: #555;
    line-height: 1.6;
  }
  
  .description p {
    margin-bottom: 1.5rem;
    text-align: justify;
  }
  
  /* Responsive Design */
  @media (max-width: 968px) {
    .about-grid {
      grid-template-columns: 1fr;
    }
  
    .image-grid {
      grid-template-columns: 1fr 1fr;
      grid-template-rows: 300px 150px;
    }
  
    .image-card.large {
      grid-row: auto;
      grid-column: span 2;
      height: 300px;
    }

    .image-card.small {
      height: 150px;
    }
  }
  
  @media (max-width: 640px) {
    .title {
      font-size: 2rem;
    }
  
    .subtitle {
      font-size: 1rem;
    }
  
    .image-grid {
      grid-template-columns: 1fr;
      grid-template-rows: 250px 150px 150px;
    }
  
    .image-card.large {
      grid-column: span 1;
      height: 250px;
    }

    .image-card.small {
      height: 150px;
    }
  }
  </style>