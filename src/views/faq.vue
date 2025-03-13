<template>
  <div class="faq-container">
    <div class="faq-header">
      <h1 class="faq-title">Preguntas Frecuentes</h1>
      <p class="faq-subtitle">Encuentra respuestas a las dudas más comunes sobre nuestros servicios</p>
    </div>

    <div class="search-container">
      <div class="search-wrapper">
        <i class="fas fa-search search-icon"></i>
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Buscar preguntas..." 
          class="search-input"
          @input="filterQuestions"
          aria-label="Buscar preguntas"
        >
        <button 
          v-if="searchQuery" 
          @click="clearSearch" 
          class="clear-search"
          aria-label="Limpiar búsqueda"
        >
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>

    <div class="faq-categories">
      <button 
        v-for="category in categories" 
        :key="category.id" 
        @click="selectCategory(category.id)"
        :class="['category-button', { active: category.id === selectedCategory }]"
        :aria-pressed="category.id === selectedCategory"
      >
        <i :class="['fas', category.icon]"></i>
        <span>{{ category.name }}</span>
      </button>
    </div>

    <div class="faq-content">
      <transition-group name="list" tag="div" class="faq-list">
        <div 
          v-for="question in filteredQuestions" 
          :key="question.id" 
          class="faq-item"
          :class="{ 'highlighted': isHighlighted(question) }"
        >
          <div 
            class="faq-question" 
            @click="toggleAnswer(question.id)"
            :class="{ 'active': expandedQuestions.includes(question.id) }"
            :aria-expanded="expandedQuestions.includes(question.id)"
            tabindex="0"
            @keydown.enter="toggleAnswer(question.id)"
            @keydown.space="toggleAnswer(question.id)"
          >
            <div class="question-content">
              <span class="question-category-tag" :style="getCategoryStyle(question.category)">
                {{ getCategoryName(question.category) }}
              </span>
              <span class="question-text">{{ question.question }}</span>
            </div>
            <span class="toggle-icon" :class="{ 'rotated': expandedQuestions.includes(question.id) }">
              <i class="fas fa-chevron-down"></i>
            </span>
          </div>
          <transition name="slide">
            <div v-if="expandedQuestions.includes(question.id)" class="faq-answer">
              <div class="answer-content" v-html="formatAnswer(question.answer)"></div>
              <div class="answer-actions">
                <button class="action-button helpful-button" @click="markAsHelpful(question.id)">
                  <i class="fas fa-thumbs-up"></i> 
                  <span>Útil</span>
                  <span v-if="question.helpfulCount" class="count-badge">{{ question.helpfulCount }}</span>
                </button>
                <button class="action-button copy-button" @click="copyAnswer(question)">
                  <i class="fas fa-copy"></i> 
                  <span>Copiar</span>
                </button>
                <button class="action-button share-button" @click="shareQuestion(question)">
                  <i class="fas fa-share-alt"></i> 
                  <span>Compartir</span>
                </button>
              </div>
              <div v-if="question.relatedQuestions && question.relatedQuestions.length > 0" class="related-questions">
                <h4>Preguntas relacionadas:</h4>
                <ul>
                  <li v-for="relatedId in question.relatedQuestions" :key="relatedId">
                    <a href="#" @click.prevent="goToRelatedQuestion(relatedId)">
                      {{ getQuestionById(relatedId).question }}
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </transition>
        </div>
      </transition-group>

      <div v-if="filteredQuestions.length === 0" class="no-results">
        <div class="no-results-icon">
          <i class="fas fa-search"></i>
        </div>
        <h3>No se encontraron resultados</h3>
        <p>No hay coincidencias para "<strong>{{ searchQuery }}</strong>" en la categoría seleccionada.</p>
        <div class="no-results-actions">
          <button @click="clearSearch" class="reset-search-button">
            <i class="fas fa-redo"></i> Limpiar búsqueda
          </button>
          <button @click="showAllCategories" class="show-all-button">
            <i class="fas fa-th-list"></i> Ver todas las categorías
          </button>
        </div>
      </div>
    </div>

    <div class="contact-support">
      <div class="support-card">
        <div class="support-icon">
          <i class="fas fa-headset"></i>
        </div>
        <div class="support-content">
          <h3>¿No encontraste lo que buscabas?</h3>
          <p>Nuestro equipo de soporte está listo para ayudarte con cualquier duda o problema.</p>
          <div class="support-actions">
            <button @click="contactSupport" class="support-button">
              <i class="fas fa-envelope"></i> Contactar Soporte
            </button>
            <button @click="openLiveChat" class="chat-button">
              <i class="fas fa-comment-dots"></i> Chat en vivo
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="faq-feedback">
      <h3>¿Te resultó útil esta sección?</h3>
      <div class="feedback-buttons">
        <button @click="provideFeedback(true)" class="feedback-button positive">
          <i class="fas fa-smile"></i> Sí, fue útil
        </button>
        <button @click="provideFeedback(false)" class="feedback-button negative">
          <i class="fas fa-frown"></i> No, necesito más ayuda
        </button>
      </div>
    </div>

    <!-- Feedback Modal -->
    <transition name="modal">
      <div v-if="showFeedbackModal" class="modal-overlay">
        <div class="modal-container">
          <div class="modal-header">
            <h3>{{ feedbackPositive ? '¡Gracias por tu feedback!' : 'Lamentamos que no encontraras lo que buscabas' }}</h3>
            <button @click="closeFeedbackModal" class="close-modal">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="modal-body">
            <p v-if="feedbackPositive">Nos alegra que hayas encontrado la información que necesitabas.</p>
            <div v-else>
              <p>¿Qué podríamos mejorar en nuestra sección de FAQ?</p>
              <textarea 
                v-model="feedbackText" 
                placeholder="Cuéntanos qué información estabas buscando o cómo podríamos mejorar..."
                rows="4"
                class="feedback-textarea"
              ></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button @click="closeFeedbackModal" class="modal-button cancel">Cerrar</button>
            <button v-if="!feedbackPositive" @click="submitFeedback" class="modal-button submit">Enviar feedback</button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Toast Notification -->
    <transition name="toast">
      <div v-if="showToast" class="toast-notification" :class="toastType">
        <i :class="['fas', toastIcon]"></i>
        <span>{{ toastMessage }}</span>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();

// Enhanced categories with icons
const categories = [
  { id: 'all', name: 'Todas', icon: 'fa-th-list' },
  { id: 'general', name: 'General', icon: 'fa-info-circle' },
  { id: 'account', name: 'Cuenta', icon: 'fa-user-circle' },
  { id: 'orders', name: 'Pedidos', icon: 'fa-shopping-bag' },
  { id: 'shipping', name: 'Envíos', icon: 'fa-truck' },
  { id: 'returns', name: 'Devoluciones', icon: 'fa-undo' },
  { id: 'payment', name: 'Pagos', icon: 'fa-credit-card' }
];

// Enhanced FAQ data with more details
const faqData = ref([
  { 
    id: 1, 
    category: 'general', 
    question: '¿Cómo funciona la plataforma?', 
    answer: 'Nuestra plataforma permite a los usuarios comprar productos de manera fácil y segura. Puedes navegar por categorías, agregar productos al carrito y realizar el pago de forma segura.<br><br>Características principales:<ul><li>Catálogo de productos organizado por categorías</li><li>Sistema de búsqueda avanzado</li><li>Carrito de compras intuitivo</li><li>Múltiples métodos de pago</li></ul>', 
    helpfulCount: 24,
    relatedQuestions: [3, 6]
  },
  { 
    id: 2, 
    category: 'account', 
    question: '¿Cómo puedo crear una cuenta?', 
    answer: 'Para crear una cuenta, haz clic en el botón "Registrarse" en la esquina superior derecha de la página. Llena el formulario con tu información y sigue las instrucciones para verificar tu correo electrónico.<br><br>El proceso de registro incluye:<ol><li>Completar el formulario con tus datos personales</li><li>Verificar tu correo electrónico a través del enlace que te enviamos</li><li>Configurar tus preferencias de cuenta</li></ol>', 
    helpfulCount: 18,
    relatedQuestions: [7]
  },
  { 
    id: 3, 
    category: 'orders', 
    question: '¿Cómo puedo realizar un pedido?', 
    answer: 'Para realizar un pedido, selecciona los productos que deseas comprar, agrégalos al carrito, y procede al pago. Asegúrate de estar registrado o inicia sesión antes de finalizar la compra.<br><br>Pasos para realizar un pedido:<ol><li>Busca y selecciona los productos deseados</li><li>Haz clic en "Agregar al carrito"</li><li>Revisa tu carrito y haz clic en "Proceder al pago"</li><li>Completa la información de envío y pago</li><li>Confirma tu pedido</li></ol>', 
    helpfulCount: 32,
    relatedQuestions: [8, 4]
  },
  { 
    id: 4, 
    category: 'shipping', 
    question: '¿Cuánto tiempo tarda en llegar mi pedido?', 
    answer: 'El tiempo de entrega depende de tu ubicación y el método de envío seleccionado. Generalmente, los pedidos se entregan en un plazo de 3 a 7 días hábiles.<br><br>Tiempos estimados por región:<table><tr><th>Región</th><th>Tiempo estimado</th></tr><tr><td>Capitales</td><td>3-5 días hábiles</td></tr><tr><td>Ciudades principales</td><td>4-6 días hábiles</td></tr><tr><td>Áreas rurales</td><td>5-10 días hábiles</td></tr></table>', 
    helpfulCount: 45,
    relatedQuestions: [3, 8]
  },
  { 
    id: 5, 
    category: 'returns', 
    question: '¿Cuál es la política de devoluciones?', 
    answer: 'Aceptamos devoluciones dentro de los 30 días posteriores a la compra. El producto debe estar sin usar y en su empaque original.<br><br>Proceso de devolución:<ol><li>Inicia sesión en tu cuenta</li><li>Ve a "Mis pedidos" y selecciona el pedido correspondiente</li><li>Haz clic en "Solicitar devolución" y sigue las instrucciones</li><li>Una vez aprobada, recibirás instrucciones para enviar el producto</li><li>El reembolso se procesará en 5-10 días hábiles después de recibir el producto</li></ol>', 
    helpfulCount: 29,
    relatedQuestions: [9, 10]
  },
  { 
    id: 6, 
    category: 'general', 
    question: '¿Ofrecen descuentos para compras al por mayor?', 
    answer: 'Sí, ofrecemos descuentos para compras al por mayor. Los descuentos varían según la cantidad y tipo de productos.<br><br>Beneficios de compras al por mayor:<ul><li>Descuentos progresivos según volumen</li><li>Envío prioritario</li><li>Gestor de cuenta dedicado</li><li>Condiciones de pago especiales</li></ul><br>Por favor, contacta a nuestro equipo de ventas en <a href="mailto:ventas@empresa.com">ventas@empresa.com</a> para obtener más información sobre precios especiales.', 
    helpfulCount: 15,
    relatedQuestions: [1, 3]
  },
  { 
    id: 7, 
    category: 'account', 
    question: '¿Cómo puedo cambiar mi contraseña?', 
    answer: 'Para cambiar tu contraseña, sigue estos pasos:<ol><li>Inicia sesión en tu cuenta</li><li>Ve a la sección de "Configuración de cuenta"</li><li>Selecciona "Seguridad" o "Cambiar contraseña"</li><li>Ingresa tu contraseña actual</li><li>Ingresa y confirma tu nueva contraseña</li><li>Haz clic en "Guardar cambios"</li></ol><br>Recomendaciones para una contraseña segura:<ul><li>Usa al menos 8 caracteres</li><li>Combina letras mayúsculas y minúsculas</li><li>Incluye números y símbolos</li><li>Evita información personal fácil de adivinar</li></ul>', 
    helpfulCount: 22,
    relatedQuestions: [2, 11]
  },
  { 
    id: 8, 
    category: 'orders', 
    question: '¿Puedo cancelar mi pedido?', 
    answer: 'Puedes cancelar tu pedido dentro de las 24 horas posteriores a la realización del mismo, siempre que no haya sido enviado.<br><br>Para cancelar un pedido:<ol><li>Inicia sesión en tu cuenta</li><li>Ve a "Mis pedidos"</li><li>Selecciona el pedido que deseas cancelar</li><li>Haz clic en "Cancelar pedido" si está disponible</li></ol><br>Si la opción no está disponible, contacta a nuestro servicio al cliente lo antes posible al <a href="tel:+123456789">+12 345 6789</a> o por correo a <a href="mailto:soporte@empresa.com">soporte@empresa.com</a>.', 
    helpfulCount: 38,
    relatedQuestions: [3, 4]
  },
  { 
    id: 9, 
    category: 'returns', 
    question: '¿Quién paga el envío de la devolución?', 
    answer: 'La responsabilidad del costo de envío para devoluciones depende del motivo:<ul><li><strong>Producto defectuoso o incorrecto:</strong> Nosotros cubrimos el costo del envío</li><li><strong>Cambio de opinión o error al ordenar:</strong> El cliente cubre el costo del envío</li></ul><br>Si el producto llegó defectuoso o recibiste un artículo incorrecto, contacta a nuestro servicio al cliente para recibir una etiqueta de devolución prepagada.', 
    helpfulCount: 19,
    relatedQuestions: [5, 10]
  },
  { 
    id: 10, 
    category: 'returns', 
    question: '¿Puedo cambiar un producto por otro en lugar de solicitar un reembolso?', 
    answer: 'Sí, ofrecemos la opción de cambiar productos en lugar de solicitar un reembolso. El proceso es similar al de devolución:<ol><li>Inicia sesión en tu cuenta</li><li>Ve a "Mis pedidos" y selecciona el pedido correspondiente</li><li>Haz clic en "Solicitar cambio" y selecciona el producto de reemplazo</li><li>Sigue las instrucciones para enviar el producto original</li></ol><br>Ten en cuenta que solo puedes cambiar por productos del mismo valor o superior (pagando la diferencia). Los cambios también deben solicitarse dentro de los 30 días posteriores a la compra.', 
    helpfulCount: 24,
    relatedQuestions: [5, 9]
  },
  { 
    id: 11, 
    category: 'account', 
    question: '¿Cómo puedo actualizar mi información de contacto?', 
    answer: 'Para actualizar tu información de contacto:<ol><li>Inicia sesión en tu cuenta</li><li>Ve a "Mi perfil" o "Configuración de cuenta"</li><li>Selecciona "Información personal" o "Datos de contacto"</li><li>Actualiza la información necesaria</li><li>Haz clic en "Guardar cambios"</li></ol><br>Es importante mantener tu información de contacto actualizada para recibir notificaciones sobre tus pedidos y otras comunicaciones importantes.', 
    helpfulCount: 14,
    relatedQuestions: [2, 7]
  },
  { 
    id: 12, 
    category: 'payment', 
    question: '¿Qué métodos de pago aceptan?', 
    answer: 'Aceptamos diversos métodos de pago para tu comodidad:<ul><li>Tarjetas de crédito y débito (Visa, Mastercard, American Express)</li><li>PayPal</li><li>Transferencia bancaria</li><li>Pago contra entrega (en áreas seleccionadas)</li><li>Billeteras digitales (Apple Pay, Google Pay)</li></ul><br>Todos nuestros métodos de pago cuentan con protocolos de seguridad avanzados para garantizar la protección de tus datos.', 
    helpfulCount: 41,
    relatedQuestions: [13, 14]
  },
  { 
    id: 13, 
    category: 'payment', 
    question: '¿Es seguro comprar en su sitio web?', 
    answer: 'Sí, nuestro sitio web implementa múltiples medidas de seguridad para proteger tus datos y transacciones:<ul><li>Certificado SSL de 256 bits para encriptar toda la información</li><li>Cumplimiento con estándares PCI DSS para procesamiento de pagos</li><li>Autenticación de dos factores para acceso a cuentas</li><li>Sistemas de detección de fraudes</li><li>No almacenamos datos completos de tarjetas de crédito</li></ul><br>Además, trabajamos con proveedores de pago reconocidos y confiables a nivel mundial.', 
    helpfulCount: 37,
    relatedQuestions: [12, 14]
  },
  { 
    id: 14, 
    category: 'payment', 
    question: '¿Ofrecen opciones de pago a plazos?', 
    answer: 'Sí, ofrecemos opciones de pago a plazos para compras superiores a $100:<ul><li>3 cuotas sin interés con tarjetas seleccionadas</li><li>6 y 12 cuotas con interés según el banco emisor</li><li>Financiamiento a través de nuestros socios financieros</li></ul><br>Las opciones disponibles se mostrarán durante el proceso de pago, dependiendo del valor de tu compra y los métodos de pago seleccionados.', 
    helpfulCount: 28,
    relatedQuestions: [12, 13]
  },
]);

// State variables
const selectedCategory = ref('all');
const searchQuery = ref('');
const expandedQuestions = ref([]);
const highlightedQuestionId = ref(null);
const showFeedbackModal = ref(false);
const feedbackPositive = ref(false);
const feedbackText = ref('');
const showToast = ref(false);
const toastMessage = ref('');
const toastType = ref('');
const toastIcon = ref('');
const toastTimeout = ref(null);

// Computed properties
const filteredQuestions = computed(() => {
  let questions = faqData.value;
  
  // Filter by category
  if (selectedCategory.value !== 'all') {
    questions = questions.filter(q => q.category === selectedCategory.value);
  }
  
  // Filter by search query
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    questions = questions.filter(q => 
      q.question.toLowerCase().includes(query) || 
      q.answer.toLowerCase().includes(query)
    );
  }
  
  return questions;
});

// Methods
const selectCategory = (category) => {
  selectedCategory.value = category;
  expandedQuestions.value = [];
  highlightedQuestionId.value = null;
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
  // Auto-expand first result when searching
  if (searchQuery.value.trim() && filteredQuestions.value.length > 0) {
    expandedQuestions.value = [filteredQuestions.value[0].id];
  }
};

const clearSearch = () => {
  searchQuery.value = '';
  expandedQuestions.value = [];
  highlightedQuestionId.value = null;
};

const contactSupport = () => {
  router.push({ path: '/contacto' });
};

const openLiveChat = () => {
  showToast('info', 'El chat en vivo estará disponible próximamente', 'fa-info-circle');
};

const getCategoryName = (categoryId) => {
  const category = categories.find(c => c.id === categoryId);
  return category ? category.name : '';
};

const getCategoryStyle = (categoryId) => {
  const colors = {
    'general': { background: '#E3F2FD', color: '#1976D2' },
    'account': { background: '#E8F5E9', color: '#388E3C' },
    'orders': { background: '#FFF8E1', color: '#FFA000' },
    'shipping': { background: '#F3E5F5', color: '#8E24AA' },
    'returns': { background: '#FFEBEE', color: '#D32F2F' },
    'payment': { background: '#E0F7FA', color: '#0097A7' }
  };
  
  return colors[categoryId] || { background: '#F5F5F5', color: '#616161' };
};

const markAsHelpful = (id) => {
  const question = faqData.value.find(q => q.id === id);
  if (question) {
    if (!question.helpfulCount) question.helpfulCount = 0;
    question.helpfulCount++;
    showToasts('success', 'Gracias por tu feedback', 'fa-check-circle');
  }
};

const copyAnswer = (question) => {
  // Create a temporary element to strip HTML tags
  const tempElement = document.createElement('div');
  tempElement.innerHTML = question.answer;
  const textToCopy = `Pregunta: ${question.question}\n\nRespuesta: ${tempElement.textContent}`;
  
  navigator.clipboard.writeText(textToCopy).then(() => {
    showToasts('success', 'Respuesta copiada al portapapeles', 'fa-copy');
  }).catch(() => {
    showToasts('error', 'No se pudo copiar la respuesta', 'fa-exclamation-circle');
  });
};

const shareQuestion = (question) => {
  // Create share URL with question ID
  const shareUrl = `${window.location.origin}${window.location.pathname}?question=${question.id}&category=${question.category}`;
  
  if (navigator.share) {
    navigator.share({
      title: 'FAQ - ' + question.question,
      text: question.question,
      url: shareUrl
    }).catch(() => {
      copyShareLink(shareUrl);
    });
  } else {
    copyShareLink(shareUrl);
  }
};

const copyShareLink = (url) => {
  navigator.clipboard.writeText(url).then(() => {
    showToasts('success', 'Enlace copiado al portapapeles', 'fa-link');
  }).catch(() => {
    showToasts('error', 'No se pudo copiar el enlace', 'fa-exclamation-circle');
  });
};

const goToRelatedQuestion = (id) => {
  const question = getQuestionById(id);
  if (question) {
    // Set category if needed
    if (selectedCategory.value !== 'all' && question.category !== selectedCategory.value) {
      selectedCategory.value = question.category;
    }
    
    // Expand the question
    if (!expandedQuestions.value.includes(id)) {
      expandedQuestions.value.push(id);
    }
    
    // Highlight the question
    highlightedQuestionId.value = id;
    
    // Scroll to the question
    setTimeout(() => {
      const element = document.querySelector(`.faq-item[data-id="${id}"]`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  }
};

const getQuestionById = (id) => {
  return faqData.value.find(q => q.id === id);
};

const isHighlighted = (question) => {
  return question.id === highlightedQuestionId.value;
};

const showAllCategories = () => {
  selectedCategory.value = 'all';
  clearSearch();
};

const provideFeedback = (isPositive) => {
  feedbackPositive.value = isPositive;
  showFeedbackModal.value = true;
};

const closeFeedbackModal = () => {
  showFeedbackModal.value = false;
  feedbackText.value = '';
};

const submitFeedback = () => {
  // Here you would typically send the feedback to your server
  showToasts('success', 'Gracias por tu feedback', 'fa-check-circle');
  closeFeedbackModal();
};

const showToasts = (type, message, icon) => {
  // Clear any existing timeout
  if (toastTimeout.value) {
    clearTimeout(toastTimeout.value);
  }
  
  // Set toast properties
  toastType.value = type;
  toastMessage.value = message;
  toastIcon.value = icon;
  showToast.value = true;
  
  // Auto-hide toast after 3 seconds
  toastTimeout.value = setTimeout(() => {
    showToast.value = false;
  }, 3000);
};

const formatAnswer = (answer) => {
  // This function allows HTML in answers but could be enhanced with a proper markdown parser
  return answer;
};

// Check URL parameters on mount
onMounted(() => {
  // Check if there's a question ID in the URL
  const questionId = parseInt(route.query.question);
  const category = route.query.category;
  
  if (questionId) {
    const question = faqData.value.find(q => q.id === questionId);
    if (question) {
      // Set the category if provided and valid
      if (category && categories.some(c => c.id === category)) {
        selectedCategory.value = category;
      } else if (question.category) {
        selectedCategory.value = question.category;
      }
      
      // Expand the question
      expandedQuestions.value = [questionId];
      
      // Highlight the question
      highlightedQuestionId.value = questionId;
      
      // Scroll to the question after a short delay
      setTimeout(() => {
        const element = document.querySelector(`.faq-item[data-id="${questionId}"]`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 500);
    }
  }
});

// Watch for changes in the route
watch(() => route.query, (newQuery) => {
  const questionId = parseInt(newQuery.question);
  if (questionId) {
    goToRelatedQuestion(questionId);
  }
}, { deep: true });
</script>

<style scoped>
/* Base Styles  {
    goToRelatedQuestion(questionId);
  }
}, { deep: true });
</script>

<style scoped>
/* Base Styles */
.faq-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 3rem 1.5rem;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: #1f2937;
  background-color: #fff;
}

/* Header Styles */
.faq-header {
  text-align: center;
  margin-bottom: 3rem;
}

.faq-title {
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: 700;
  color: #111827;
  margin-bottom: 1rem;
  line-height: 1.2;
}

.faq-subtitle {
  font-size: clamp(1rem, 3vw, 1.2rem);
  color: #6b7280;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
}

/* Search Styles */
.search-container {
  margin-bottom: 2.5rem;
}

.search-wrapper {
  position: relative;
  max-width: 700px;
  margin: 0 auto;
}

.search-input {
  width: 100%;
  padding: 1rem 1rem 1rem 3rem;
  font-size: 1.1rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  background-color: #f9fafb;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #3b82f6;
  background-color: #fff;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  font-size: 1.2rem;
}

.clear-search {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  font-size: 1rem;
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.clear-search:hover {
  color: #4b5563;
  background-color: #f3f4f6;
}

/* Category Styles */
.faq-categories {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.75rem;
  margin-bottom: 3rem;
}

.category-button {
  padding: 0.75rem 1.25rem;
  background-color: #f3f4f6;
  border: none;
  border-radius: 30px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.95rem;
  font-weight: 500;
  color: #4b5563;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.category-button i {
  font-size: 1rem;
}

.category-button:hover {
  background-color: #e5e7eb;
  color: #1f2937;
  transform: translateY(-2px);
}

.category-button.active {
  background-color: #3b82f6;
  color: white;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
}

/* FAQ Content Styles */
.faq-content {
  margin-bottom: 3rem;
}

.faq-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.faq-item {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
  background-color: #fff;
}

.faq-item.highlighted {
  border-color: #3b82f6;
  box-shadow: 0 4px 20px rgba(59, 130, 246, 0.15);
  animation: highlight-pulse 2s infinite;
}

@keyframes highlight-pulse {
  0% { box-shadow: 0 4px 20px rgba(59, 130, 246, 0.15); }
  50% { box-shadow: 0 4px 25px rgba(59, 130, 246, 0.3); }
  100% { box-shadow: 0 4px 20px rgba(59, 130, 246, 0.15); }
}

.faq-question {
  padding: 1.25rem;
  background-color: #f9fafb;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.3s ease;
  user-select: none;
}

.question-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
}

.question-category-tag {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  background-color: #e5e7eb;
  color: #4b5563;
  align-self: flex-start;
}

.question-text {
  font-weight: 600;
  font-size: 1.1rem;
  color: #1f2937;
  line-height: 1.4;
}

.faq-question:hover {
  background-color: #f3f4f6;
}

.faq-question.active {
  background-color: #eff6ff;
  border-bottom: 1px solid #dbeafe;
}

.toggle-icon {
  font-size: 1rem;
  color: #6b7280;
  transition: transform 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}

.toggle-icon.rotated {
  transform: rotate(180deg);
  color: #3b82f6;
}

.faq-answer {
  padding: 1.5rem;
  background-color: #fff;
  border-top: 1px solid #e5e7eb;
}

.answer-content {
  color: #4b5563;
  font-size: 1rem;
  line-height: 1.7;
}

.answer-content a {
  color: #3b82f6;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;
}

.answer-content a:hover {
  color: #2563eb;
  text-decoration: underline;
}

.answer-content ul, 
.answer-content ol {
  margin: 1rem 0;
  padding-left: 1.5rem;
}

.answer-content li {
  margin-bottom: 0.5rem;
}

.answer-content table {
  width: 100%;
  border-collapse: collapse;
  margin: 1rem 0;
}

.answer-content th, 
.answer-content td {
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  text-align: left;
}

.answer-content th {
  background-color: #f9fafb;
  font-weight: 600;
}

.answer-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 1.5rem;
  flex-wrap: wrap;
}

.action-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background-color: #f9fafb;
  color: #4b5563;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-button:hover {
  background-color: #f3f4f6;
  border-color: #d1d5db;
  color: #1f2937;
}

.helpful-button {
  color: #059669;
}

.helpful-button:hover {
  background-color: #ecfdf5;
  border-color: #a7f3d0;
  color: #047857;
}

.copy-button {
  color: #6366f1;
}

.copy-button:hover {
  background-color: #eef2ff;
  border-color: #c7d2fe;
  color: #4f46e5;
}

.share-button {
  color: #7c3aed;
}

.share-button:hover {
  background-color: #f5f3ff;
  border-color: #ddd6fe;
  color: #6d28d9;
}

.count-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  border-radius: 10px;
  background-color: #d1fae5;
  color: #059669;
  font-size: 0.75rem;
  font-weight: 600;
}

.related-questions {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.related-questions h4 {
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.75rem;
}

.related-questions ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.related-questions li {
  margin-bottom: 0.5rem;
}

.related-questions a {
  display: inline-block;
  color: #3b82f6;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s ease;
  padding: 0.5rem 0;
}

.related-questions a:hover {
  color: #2563eb;
  text-decoration: underline;
}

/* No Results Styles */
.no-results {
  text-align: center;
  padding: 3rem 1rem;
  background-color: #f9fafb;
  border-radius: 12px;
  border: 1px dashed #e5e7eb;
}

.no-results-icon {
  font-size: 3rem;
  color: #9ca3af;
  margin-bottom: 1rem;
}

.no-results h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.75rem;
}

.no-results p {
  color: #6b7280;
  margin-bottom: 1.5rem;
}

.no-results-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.reset-search-button,
.show-all-button {
  padding: 0.75rem 1.25rem;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.reset-search-button {
  background-color: #fff;
  border: 1px solid #e5e7eb;
  color: #4b5563;
}

.reset-search-button:hover {
  background-color: #f9fafb;
  border-color: #d1d5db;
  color: #1f2937;
}

.show-all-button {
  background-color: #3b82f6;
  border: 1px solid #3b82f6;
  color: white;
}

.show-all-button:hover {
  background-color: #2563eb;
  border-color: #2563eb;
}

/* Contact Support Styles */
.contact-support {
  margin-bottom: 3rem;
}

.support-card {
  display: flex;
  align-items: center;
  gap: 2rem;
  padding: 2rem;
  background-color: #eff6ff;
  border-radius: 12px;
  border: 1px solid #dbeafe;
}

.support-icon {
  font-size: 3rem;
  color: #3b82f6;
  flex-shrink: 0;
}

.support-content {
  flex: 1;
}

.support-content h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.75rem;
}

.support-content p {
  color: #4b5563;
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

.support-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.support-button,
.chat-button {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.support-button {
  background-color: #3b82f6;
  border: none;
  color: white;
}

.support-button:hover {
  background-color: #2563eb;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
}

.chat-button {
  background-color: white;
  border: 1px solid #e5e7eb;
  color: #4b5563;
}

.chat-button:hover {
  background-color: #f9fafb;
  border-color: #d1d5db;
  color: #1f2937;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

/* Feedback Section */
.faq-feedback {
  text-align: center;
  padding: 2rem;
  background-color: #f9fafb;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
}

.faq-feedback h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1.5rem;
}

.feedback-buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.feedback-button {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.feedback-button.positive {
  background-color: #10b981;
  border: none;
  color: white;
}

.feedback-button.positive:hover {
  background-color: #059669;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
}

.feedback-button.negative {
  background-color: white;
  border: 1px solid #e5e7eb;
  color: #4b5563;
}

.feedback-button.negative:hover {
  background-color: #f9fafb;
  border-color: #d1d5db;
  color: #1f2937;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-container {
  background-color: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.close-modal {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  font-size: 1.25rem;
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-modal:hover {
  color: #1f2937;
  background-color: #f3f4f6;
}

.modal-body {
  padding: 1.5rem;
}

.modal-body p {
  color: #4b5563;
  margin-bottom: 1rem;
}

.feedback-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  resize: vertical;
  transition: all 0.3s ease;
}

.feedback-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.modal-button {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.modal-button.cancel {
  background-color: white;
  border: 1px solid #e5e7eb;
  color: #4b5563;
}

.modal-button.cancel:hover {
  background-color: #f9fafb;
  border-color: #d1d5db;
  color: #1f2937;
}

.modal-button.submit {
  background-color: #3b82f6;
  border: none;
  color: white;
}

.modal-button.submit:hover {
  background-color: #2563eb;
}

/* Toast Notification */
.toast-notification {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  background-color: white;
  color: #1f2937;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  z-index: 1000;
  max-width: 350px;
}

.toast-notification.success {
  border-left: 4px solid #10b981;
}

.toast-notification.success i {
  color: #10b981;
}

.toast-notification.error {
  border-left: 4px solid #ef4444;
}

.toast-notification.error i {
  color: #ef4444;
}

.toast-notification.info {
  border-left: 4px solid #3b82f6;
}

.toast-notification.info i {
  color: #3b82f6;
}

/* Animations */
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from {
  opacity: 0;
  transform: translateY(30px);
}

.list-leave-to {
  opacity: 0;
  transform: translateY(-30px);
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
  max-height: 1000px;
  overflow: hidden;
}

.slide-enter-from,
.slide-leave-to {
  max-height: 0;
  opacity: 0;
}

.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

/* Responsive Styles */
@media (max-width: 768px) {
  .faq-container {
    padding: 2rem 1rem;
  }
  
  .support-card {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
    padding: 1.5rem;
  }
  
  .support-icon {
    font-size: 2.5rem;
  }
  
  .support-actions {
    justify-content: center;
  }
  
  .question-content {
    gap: 0.25rem;
  }
  
  .question-text {
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .faq-title {
    font-size: 1.75rem;
  }
  
  .faq-subtitle {
    font-size: 0.95rem;
  }
  
  .search-input {
    padding: 0.75rem 0.75rem 0.75rem 2.5rem;
    font-size: 1rem;
  }
  
  .search-icon {
    left: 0.75rem;
    font-size: 1rem;
  }
  
  .category-button {
    padding: 0.5rem 1rem;
    font-size: 0.85rem;
  }
  
  .faq-question {
    padding: 1rem;
  }
  
  .faq-answer {
    padding: 1.25rem;
  }
  
  .answer-content {
    font-size: 0.95rem;
  }
  
  .action-button {
    padding: 0.5rem 0.75rem;
    font-size: 0.85rem;
  }
  
  .support-button,
  .chat-button,
  .feedback-button {
    width: 100%;
    justify-content: center;
  }
}

/* Accessibility Improvements */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Focus styles for keyboard navigation */
a:focus,
button:focus,
input:focus,
textarea:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* High contrast mode adjustments */
@media (forced-colors: active) {
  .faq-item,
  .support-card,
  .modal-container {
    border: 2px solid currentColor;
  }
}
</style>