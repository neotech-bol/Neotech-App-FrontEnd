<template>
  <div class="terms-container">
    <div class="terms-header">
      <h1 class="terms-title">Términos y Condiciones</h1>
      <p class="terms-subtitle">Última actualización: {{ lastUpdated }}</p>
    </div>

    <div class="terms-content">
      <div class="table-of-contents" :class="{ 'sticky': isSticky }">
        <h2>Contenido</h2>
        <ul>
          <li v-for="(section, index) in sections" :key="index">
            <a :href="`#section-${index}`" @click.prevent="scrollToSection(`section-${index}`)">
              {{ section.title }}
            </a>
          </li>
        </ul>
      </div>

      <div class="terms-sections" ref="termsSections">
        <div v-for="(section, index) in sections" :key="index" :id="`section-${index}`" class="terms-section">
          <h2>{{ section.title }}</h2>
          <div v-html="section.content"></div>
        </div>
      </div>
    </div>

    <div class="acceptance-form">
      <h3>Aceptación de Términos</h3>
      <label class="checkbox-container">
        <input type="checkbox" v-model="accepted">
        <span class="checkmark"></span>
        He leído y acepto los Términos y Condiciones
      </label>
      <button @click="submitAcceptance" :disabled="!accepted" class="accept-button">
        Aceptar y Continuar
      </button>
    </div>

    <div class="additional-actions">
      <button @click="printTerms" class="action-button print-button">
        <i class="fas fa-print"></i> Imprimir
      </button>
      <button @click="downloadPDF" class="action-button download-button">
        <i class="fas fa-file-pdf"></i> Descargar PDF
      </button>
    </div>

    <div class="terms-footer">
      <p>Si tiene alguna pregunta sobre estos términos, por favor <a href="#" @click.prevent="showContactForm">contáctenos</a>.</p>
    </div>

    <transition name="fade">
      <div v-if="showContact" class="contact-overlay">
        <div class="contact-form">
          <h3>Contáctenos</h3>
          <button @click="showContact = false" class="close-button">&times;</button>
          <form @submit.prevent="submitContact">
            <div class="form-group">
              <label for="name">Nombre:</label>
              <input type="text" id="name" v-model="contactForm.name" required>
            </div>
            <div class="form-group">
              <label for="email">Email:</label>
              <input type="email" id="email" v-model="contactForm.email" required>
            </div>
            <div class="form-group">
              <label for="message">Mensaje:</label>
              <textarea id="message" v-model="contactForm.message" required></textarea>
            </div>
            <button type="submit" class="submit-button">Enviar</button>
          </form>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const accepted = ref(false);
const isSticky = ref(false);
const showContact = ref(false);
const termsSections = ref(null);

const lastUpdated = "22 de Mayo, 2023";

const contactForm = ref({
  name: '',
  email: '',
  message: ''
});

const sections = [
  {
    title: "1. Introducción",
    content: `
      <p>Bienvenido a nuestra plataforma. Estos términos y condiciones describen las reglas y regulaciones para el uso de nuestro sitio web.</p>
      <p>Al acceder a este sitio web, asumimos que aceptas estos términos y condiciones en su totalidad. No continúes usando el sitio web si no aceptas todos los términos y condiciones establecidos en esta página.</p>
    `
  },
  {
    title: "2. Licencia de uso",
    content: `
      <p>A menos que se indique lo contrario, nosotros y/o nuestros licenciantes poseemos los derechos de propiedad intelectual de todo el material en este sitio. Todos los derechos de propiedad intelectual están reservados.</p>
      <p>Puedes ver y/o imprimir páginas desde este sitio web para tu uso personal sujeto a las restricciones establecidas en estos términos y condiciones.</p>
    `
  },
  {
    title: "3. Restricciones",
    content: `
      <p>Están específicamente restringidos a:</p>
      <ul>
        <li>Publicar cualquier material del sitio web en cualquier otro medio.</li>
        <li>Vender, sublicenciar y/o comercializar cualquier material del sitio web.</li>
        <li>Realizar y/o mostrar públicamente cualquier material del sitio web.</li>
        <li>Usar este sitio web de cualquier manera que sea, o pueda ser, perjudicial para este sitio web.</li>
        <li>Usar este sitio web de cualquier manera que impacte el acceso de usuarios a este sitio web.</li>
      </ul>
    `
  },
  {
    title: "4. Limitaciones de responsabilidad",
    content: `
      <p>En ningún caso seremos responsables por cualquier daño incluyendo, sin limitación, daños indirectos o consecuentes, o cualquier daño que surja del uso o la imposibilidad de usar este sitio web.</p>
    `
  },
  {
    title: "5. Privacidad",
    content: `
      <p>Por favor, revisa nuestra Política de Privacidad, que también rige tu visita a nuestro sitio web, para entender nuestras prácticas.</p>
    `
  }
];

const scrollToSection = (sectionId) => {
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
  }
};

const submitAcceptance = () => {
  if (accepted.value) {
    alert('Gracias por aceptar los Términos y Condiciones.');
  }
};

const printTerms = () => {
  window.print();
};

const downloadPDF = () => {
  // Aquí iría la lógica para generar y descargar el PDF
  alert('Descargando PDF de los Términos y Condiciones...');
};

const showContactForm = () => {
  showContact.value = true;
};

const submitContact = () => {
  // Aquí iría la lógica para enviar el formulario de contacto
  alert('Mensaje enviado. Gracias por contactarnos.');
  showContact.value = false;
};

const handleScroll = () => {
  if (termsSections.value) {
    const rect = termsSections.value.getBoundingClientRect();
    isSticky.value = rect.top <= 0;
  }
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>

<style scoped>
.terms-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
  font-family: 'Arial', sans-serif;
  color: #333;
  background-color: #f9f9f9;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.terms-header {
  text-align: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e0e0e0;
}

.terms-title {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.terms-subtitle {
  font-size: 1rem;
  color: #666;
}

.terms-content {
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
}

.table-of-contents {
  flex: 0 0 250px;
  background-color: #ffffff;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.table-of-contents.sticky {
  position: sticky;
  top: 2rem;
  align-self: flex-start;
}

.table-of-contents h2 {
  font-size: 1.3rem;
  margin-bottom: 1rem;
  color: #2c3e50;
  border-bottom: 2px solid #e0e0e0;
  padding-bottom: 0.5rem;
}

.table-of-contents ul {
  list-style-type: none;
  padding: 0;
}

.table-of-contents li {
  margin-bottom: 0.75rem;
}

.table-of-contents a {
  color: #3498db;
  text-decoration: none;
  font-size: 1rem;
  transition: color 0.3s ease;
}

.table-of-contents a:hover {
  color: #2980b9;
  text-decoration: underline;
}

.terms-sections {
  flex: 1;
}

.terms-section {
  background-color: #ffffff;
  padding: 2rem;
  margin-bottom: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.terms-section h2 {
  color: #2c3e50;
  border-bottom: 2px solid #e0e0e0;
  padding-bottom: 0.5rem;
  margin-bottom: 1rem;
}

.terms-section p {
  line-height: 1.6;
  margin-bottom: 1rem;
}

.terms-section ul {
  padding-left: 1.5rem;
  margin-bottom: 1rem;
}

.terms-section li {
  margin-bottom: 0.5rem;
}

.acceptance-form {
  background-color: #ffffff;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 2rem;
}

.acceptance-form h3 {
  margin-bottom: 1rem;
  color: #2c3e50;
}

.checkbox-container {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  cursor: pointer;
}

.checkbox-container input {
  margin-right: 0.5rem;
}

.accept-button {
  background-color: #27ae60;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s ease;
}

.accept-button:hover:not(:disabled) {
  background-color: #2ecc71;
}

.accept-button:disabled {
  background-color: #95a5a6;
  cursor: not-allowed;
}

.additional-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.action-button {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.action-button:hover {
  background-color: #2980b9;
}

.action-button i {
  font-size: 1.2rem;
}

.terms-footer {
  text-align: center;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 2px solid #e0e0e0;
}

.terms-footer a {
  color: #3498db;
  text-decoration: none;
}

.terms-footer a:hover {
  text-decoration: underline;
}

.contact-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.contact-form {
  background-color: #ffffff;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 90%;
  max-width: 500px;
  position: relative;
}

.contact-form h3 {
  margin-bottom: 1rem;
  color: #2c3e50;
}

.close-button {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #95a5a6;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #34495e;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #bdc3c7;
  border-radius: 4px;
  font-size: 1rem;
}

.form-group textarea {
  height: 100px;
  resize: vertical;
}

.submit-button {
  background-color: #27ae60;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s ease;
}

.submit-button:hover {
  background-color: #2ecc71;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media print {
  .table-of-contents,
  .acceptance-form,
  .additional-actions,
  .terms-footer {
    display: none;
  }

  .terms-container {
    box-shadow: none;
    padding: 0;
  }

  .terms-section {
    page-break-inside: avoid;
  }
}

@media (max-width: 768px) {
  .terms-content {
    flex-direction: column;
  }

  .table-of-contents {
    position: static;
    margin-bottom: 2rem;
    width: 100%;
  }

  .terms-section {
    padding: 1.5rem;
  }

  .additional-actions {
    flex-direction: column;
    align-items: center;
  }

  .action-button {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .terms-container {
    padding: 1rem;
  }

  .terms-title {
    font-size: 2rem;
  }

  .terms-section h2 {
    font-size: 1.5rem;
  }

  .contact-form {
    padding: 1.5rem;
  }
}
</style>