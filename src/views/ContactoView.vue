<script setup lang="ts">
import { ref } from 'vue'

const searchQuery = ref('')
const showMobileMenu = ref(false)
const formData = ref({
  nombre: '',
  correo: '',
  telefono: '',
  mensaje: ''
})

const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value
}

const handleSubmit = (event: Event) => {
  event.preventDefault()
  // Handle form submission logic here
  console.log('Form submitted:', formData.value)
}

// Previous stats and teamMembers data remains unchanged...
</script>

<template>
  <!-- Previous header and sections remain unchanged -->

  <!-- Contact Section -->
  <section class="contact-section">
    <div class="contact-container">
      <div class="section-header">
        <h2>Envíanos tu <span class="highlight">Consulta</span></h2>
        <p>Puedes contactarnos a través de nuestro email, teléfono o visitándonos directamente.</p>
        <p>Si lo prefieres, llena el formulario de contacto y nos pondremos en contacto contigo.</p>
      </div>

      <div class="contact-cards">
        <div class="contact-card">
          <div class="icon">
            <span class="material-icon">✉️</span>
          </div>
          <h3>Escríbenos</h3>
          <a href="mailto:contacto@neotechbol.com">contacto@neotechbol.com</a>
        </div>

        <div class="contact-card">
          <div class="icon">
            <span class="material-icon">📞</span>
          </div>
          <h3>Llámanos</h3>
          <a href="tel:+59175901415">+591 759-01415</a>
        </div>

        <div class="contact-card">
          <div class="icon">
            <span class="material-icon">📍</span>
          </div>
          <h3>Visítanos</h3>
          <p>Calle Tarija, esquina América, Cochabamba - BO</p>
        </div>
      </div>

      <div class="contact-content">
        <div class="map-container">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3807.3758801973644!2d-66.1552!3d-17.393611!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTfCsDIyJzIyLjciUyA2NsKwMDknMzguNyJX!5e0!3m2!1ses!2sbo!4v1234567890!5m2!1ses!2sbo"
            width="100%"
            height="100%"
            style="border:0;"
            allowfullscreen=""
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>

        <form class="contact-form" @submit="handleSubmit">
          <div class="form-group">
            <input 
              type="text" 
              v-model="formData.nombre"
              placeholder="Nombre Completo"
              required
            >
          </div>
          <div class="form-group">
            <input 
              type="email" 
              v-model="formData.correo"
              placeholder="Correo"
              required
            >
          </div>
          <div class="form-group">
            <input 
              type="tel" 
              v-model="formData.telefono"
              placeholder="Teléfono"
              required
            >
          </div>
          <div class="form-group">
            <textarea 
              v-model="formData.mensaje"
              placeholder="Mensaje"
              rows="4"
              required
            ></textarea>
          </div>
          <button type="submit" class="submit-btn">Enviar</button>
        </form>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Previous styles remain unchanged */

/* Contact Section */
.contact-section {
  padding: 60px 0;
  background-color: #fff;
}

.contact-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.section-header {
  text-align: center;
  margin-bottom: 40px;
}

.section-header h2 {
  font-size: 2rem;
  color: #333;
  margin-bottom: 12px;
}

.section-header p {
  color: #666;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
}

/* Contact Cards */
.contact-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-bottom: 40px;
}

.contact-card {
  background: #f8f9fa;
  padding: 24px;
  border-radius: 8px;
  text-align: center;
  transition: transform 0.3s ease;
}

.contact-card:hover {
  transform: translateY(-5px);
}

.contact-card .icon {
  width: 64px;
  height: 64px;
  background: #007bff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
}

.contact-card .material-icon {
  font-size: 28px;
  color: white;
}

.contact-card h3 {
  font-size: 1.2rem;
  color: #333;
  margin-bottom: 8px;
}

.contact-card a,
.contact-card p {
  color: #666;
  text-decoration: none;
  font-size: 0.9rem;
}

.contact-card a:hover {
  color: #007bff;
}

/* Contact Content */
.contact-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  margin-top: 40px;
}

.map-container {
  height: 400px;
  border-radius: 8px;
  overflow: hidden;
}

/* Contact Form */
.contact-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group input,
.form-group textarea {
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.form-group input:focus,
.form-group textarea:focus {
  border-color: #007bff;
  outline: none;
}

.submit-btn {
  background: #007bff;
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.submit-btn:hover {
  background: #0056b3;
}

/* Responsive Styles */
@media (max-width: 1024px) {
  .contact-cards {
    grid-template-columns: repeat(3, 1fr);
  }

  .contact-content {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .contact-cards {
    grid-template-columns: repeat(2, 1fr);
  }

  .map-container {
    height: 300px;
  }
}

@media (max-width: 480px) {
  .contact-cards {
    grid-template-columns: 1fr;
  }

  .section-header h2 {
    font-size: 1.75rem;
  }

  .contact-card {
    padding: 20px;
  }

  .map-container {
    height: 250px;
  }
}
</style>