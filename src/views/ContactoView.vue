<script setup lang="ts">
import { ref } from 'vue'

const formData = ref({
  nombre: '',
  correo: '',
  telefono: '',
  mensaje: ''
})

const handleSubmit = (event: Event) => {
  event.preventDefault()
  console.log('Form submitted:', formData.value)
  // Handle form submission logic here
}

const contactCards = [
  { icon: 'fa-envelope', title: 'Escríbenos', content: 'contacto@neotechbol.com', href: 'mailto:contacto@neotechbol.com' },
  { icon: 'fa-phone', title: 'Llámanos', content: '+591 77997694', href: 'tel:+59177997694' },
  { icon: 'fa-map-marker-alt', title: 'Visítanos', content: 'Calle Tarija, esquina América, Cochabamba - BO' },
]
</script>

<template>
  <section class="contact-section">
    <div class="contact-container">
      <div class="section-header">
        <h2>Envíanos tu <span class="highlight">Consulta</span></h2>
        <p>Puedes contactarnos a través de nuestro email, teléfono o visitándonos directamente.</p>
        <p>Si lo prefieres, llena el formulario de contacto y nos pondremos en contacto contigo.</p>
      </div>

      <div class="contact-cards">
        <div v-for="(card, index) in contactCards" :key="index" class="contact-card">
          <div class="icon">
            <i :class="['fas', card.icon]"></i>
          </div>
          <h3>{{ card.title }}</h3>
          <a v-if="card.href" :href="card.href">{{ card.content }}</a>
          <p v-else>{{ card.content }}</p>
        </div>
      </div>

      <div class="contact-content">
        <div class="map-container">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3807.3758801973644!2d-66.1552!3d-17.393611!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTfCsDIyJzIyLjciUyA2NsKwMDknMzguNyJX!5e0!3m2!1ses!2sbo!4v1234567890!5m2!1ses!2sbo"
            width="100%" height="100%" style="border:0;" allowfullscreen="" loading="lazy"
            referrerpolicy="no-referrer-when-downgrade"></iframe>
        </div>

        <form class="contact-form" @submit="handleSubmit">
          <div class="form-group">
            <input type="text" v-model="formData.nombre" placeholder="Nombre Completo" required>
          </div>
          <div class="form-group">
            <input type="email" v-model="formData.correo" placeholder="Correo" required>
          </div>
          <div class="form-group">
            <input type="tel" v-model="formData.telefono" placeholder="Teléfono" required>
          </div>
          <div class="form-group">
            <textarea v-model="formData.mensaje" placeholder="Mensaje" rows="4" required></textarea>
          </div>
          <button type="submit" class="submit-btn">Enviar</button>
        </form>
      </div>
    </div>
  </section>
</template>

<style scoped>
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
  margin: 0 auto 10px;
  line-height: 1.6;
}

.highlight {
  color: #007bff;
}

.contact-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-bottom: 40px;
}

.contact-card {
  background: #f8f9fa;
  padding: 24px;
  border-radius: 12px;
  text-align: center;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.contact-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
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
  color: white;
  font-size: 24px;
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
  transition: color 0.3s ease;
}

.contact-card a:hover {
  color: #007bff;
}

.contact-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  margin-top: 40px;
}

.map-container {
  height: 400px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.contact-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.form-group input:focus,
.form-group textarea:focus {
  border-color: #007bff;
  outline: none;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25);
}

.submit-btn {
  background: #007bff;
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.submit-btn:hover {
  background: #0056b3;
}

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

