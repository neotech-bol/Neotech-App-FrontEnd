<template>
    <div class="faq-container">
      <h1 class="faq-title">Preguntas Frecuentes</h1>
  
      <div class="search-container">
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Buscar preguntas..."
          class="search-input"
          @input="filterQuestions"
        >
      </div>
  
      <div class="faq-categories">
        <button 
          v-for="category in categories" 
          :key="category"
          @click="selectCategory(category)"
          :class="['category-button', { active: category === selectedCategory }]"
        >
          {{ category }}
        </button>
      </div>
  
      <div class="faq-list">
        <div 
          v-for="question in filteredQuestions" 
          :key="question.id" 
          class="faq-item"
        >
          <div 
            class="faq-question" 
            @click="toggleAnswer(question.id)"
            :class="{ 'active': expandedQuestions.includes(question.id) }"
          >
            {{ question.question }}
            <span class="toggle-icon">{{ expandedQuestions.includes(question.id) ? '−' : '+' }}</span>
          </div>
          <transition name="fade">
            <div v-if="expandedQuestions.includes(question.id)" class="faq-answer">
              {{ question.answer }}
            </div>
          </transition>
        </div>
      </div>
  
      <div v-if="filteredQuestions.length === 0" class="no-results">
        No se encontraron resultados para tu búsqueda.
      </div>
  
      <div class="contact-support">
        <p>¿No encontraste lo que buscabas?</p>
        <button @click="contactSupport" class="support-button">Contactar Soporte</button>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue';
  
  const categories = ['General', 'Cuenta', 'Pedidos', 'Envíos', 'Devoluciones'];
  const selectedCategory = ref('General');
  const searchQuery = ref('');
  const expandedQuestions = ref([]);
  
  const faqData = [
    { id: 1, category: 'General', question: '¿Cómo funciona la plataforma?', answer: 'Nuestra plataforma permite a los usuarios comprar productos de manera fácil y segura. Puedes navegar por categorías, agregar productos al carrito y realizar el pago de forma segura.' },
    { id: 2, category: 'Cuenta', question: '¿Cómo puedo crear una cuenta?', answer: 'Para crear una cuenta, haz clic en el botón "Registrarse" en la esquina superior derecha de la página. Llena el formulario con tu información y sigue las instrucciones para verificar tu correo electrónico.' },
    { id: 3, category: 'Pedidos', question: '¿Cómo puedo realizar un pedido?', answer: 'Para realizar un pedido, selecciona los productos que deseas comprar, agrégalos al carrito, y procede al pago. Asegúrate de estar registrado o inicia sesión antes de finalizar la compra.' },
    { id: 4, category: 'Envíos', question: '¿Cuánto tiempo tarda en llegar mi pedido?', answer: 'El tiempo de entrega depende de tu ubicación y el método de envío seleccionado. Generalmente, los pedidos se entregan en un plazo de 3 a 7 días hábiles.' },
    { id: 5, category: 'Devoluciones', question: '¿Cuál es la política de devoluciones?', answer: 'Aceptamos devoluciones dentro de los 30 días posteriores a la compra. El producto debe estar sin usar y en su empaque original. Consulta nuestra política de devoluciones para más detalles.' },
    { id: 6, category: 'General', question: '¿Ofrecen descuentos para compras al por mayor?', answer: 'Sí, ofrecemos descuentos para compras al por mayor. Por favor, contacta a nuestro equipo de ventas para obtener más información sobre precios especiales.' },
    { id: 7, category: 'Cuenta', question: '¿Cómo puedo cambiar mi contraseña?', answer: 'Para cambiar tu contraseña, inicia sesión en tu cuenta, ve a la sección de "Configuración de cuenta" y selecciona "Cambiar contraseña". Sigue las instrucciones para establecer una nueva contraseña segura.' },
    { id: 8, category: 'Pedidos', question: '¿Puedo cancelar mi pedido?', answer: 'Puedes cancelar tu pedido dentro de las 24 horas posteriores a la realización del mismo, siempre que no haya sido enviado. Contacta a nuestro servicio al cliente para solicitar la cancelación.' },
  ];
  
  const filteredQuestions = computed(() => {
    return faqData
      .filter(q => q.category === selectedCategory.value)
      .filter(q => 
        q.question.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        q.answer.toLowerCase().includes(searchQuery.value.toLowerCase())
      );
  });
  
  const selectCategory = (category) => {
    selectedCategory.value = category;
    expandedQuestions.value = [];
  };
  
  const toggleAnswer = (id) => {
    const index = expandedQuestions.value.indexOf(id);
    if (index === -1) {
      expandedQuestions.value.push(id);
    } else {
      expandedQuestions.value.splice(index, 1);
    }
  };
  
  const filterQuestions = () => {
    expandedQuestions.value = [];
  };
  
  const contactSupport = () => {
    // Implementar lógica para contactar al soporte
    alert('Redirigiendo al formulario de contacto de soporte...');
  };
  </script>
  
  <style scoped>
  .faq-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
    font-family: Arial, sans-serif;
  }
  
  .faq-title {
    font-size: 2.5rem;
    color: #333;
    text-align: center;
    margin-bottom: 2rem;
  }
  
  .search-container {
    margin-bottom: 2rem;
  }
  
  .search-input {
    width: 100%;
    padding: 0.75rem;
    font-size: 1rem;
    border: 1px solid #ddd;
    border-radius: 4px;
  }
  
  .faq-categories {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-bottom: 2rem;
  }
  
  .category-button {
    padding: 0.5rem 1rem;
    background-color: #f0f0f0;
    border: none;
    border-radius: 20px;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }
  
  .category-button:hover {
    background-color: #e0e0e0;
  }
  
  .category-button.active {
    background-color: #007bff;
    color: white;
  }
  
  .faq-item {
    margin-bottom: 1rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    overflow: hidden;
  }
  
  .faq-question {
    padding: 1rem;
    background-color: #f9f9f9;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: bold;
    transition: background-color 0.3s ease;
  }
  
  .faq-question:hover {
    background-color: #f0f0f0;
  }
  
  .faq-question.active {
    background-color: #e6f2ff;
  }
  
  .toggle-icon {
    font-size: 1.2rem;
  }
  
  .faq-answer {
    padding: 1rem;
    background-color: white;
    border-top: 1px solid #ddd;
  }
  
  .no-results {
    text-align: center;
    color: #666;
    margin-top: 2rem;
  }
  
  .contact-support {
    text-align: center;
    margin-top: 3rem;
  }
  
  .support-button {
    padding: 0.75rem 1.5rem;
    background-color: #28a745;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
    transition: background-color 0.3s ease;
  }
  
  .support-button:hover {
    background-color: #218838;
  }
  
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.3s ease;
  }
  
  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
  
  @media (max-width: 600px) {
    .faq-container {
      padding: 1rem;
    }
  
    .faq-title {
      font-size: 2rem;
    }
  
    .category-button {
      font-size: 0.9rem;
    }
  }
  </style>