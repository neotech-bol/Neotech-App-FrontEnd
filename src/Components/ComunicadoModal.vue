<template>
  <div v-if="mostrarModal" class="modal-overlay" @click.self="cerrarSiClickFuera && cerrarModal()">
    <div class="modal-container">
      <div class="modal-header">
        <h2 class="modal-title">Información Importante</h2>
        <button @click="cerrarModal" class="modal-close" aria-label="Cerrar">
          <XIcon class="h-5 w-5" />
        </button>
      </div>
      
      <div class="modal-body">
        <div class="aviso-container">
          <div class="icono-container">
            <InfoIcon class="icono-info" />
          </div>
          
          <div class="mensaje-container">
            <h3 class="mensaje-titulo">Instrucciones para el registro</h3>
            
            <div class="mensaje-item">
              <KeyIcon class="mensaje-icono" />
              <p class="mensaje-texto">
                <strong>Contraseña:</strong> Utilice su número de Cédula de Identidad (C.I.) como contraseña para acceder al sistema.
              </p>
            </div>
            
            <div class="mensaje-item">
              <ClipboardCheckIcon class="mensaje-icono" />
              <p class="mensaje-texto">
                <strong>Campos obligatorios:</strong> Asegúrese de completar todos los espacios requeridos en el formulario de registro.
              </p>
            </div>
            
            <div class="mensaje-item">
              <AlertTriangleIcon class="mensaje-icono" />
              <p class="mensaje-texto">
                <strong>Importante:</strong> La información proporcionada debe ser verídica y será verificada por nuestro sistema.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div class="modal-footer">
        <button @click="cerrarModal" class="boton-entendido">
          Entendido
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { XIcon, InfoIcon, KeyIcon, ClipboardCheckIcon, AlertTriangleIcon } from 'lucide-vue-next';

// Props
const props = defineProps({
  cerrarSiClickFuera: {
    type: Boolean,
    default: true
  }
});

// Estado del modal
const mostrarModal = ref(true);

// Métodos
const cerrarModal = () => {
  mostrarModal.value = false;
  // Emitir evento para informar al componente padre que el modal se ha cerrado
  emit('cerrar');
};

// Definir eventos emitidos
const emit = defineEmits(['cerrar']);
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0; 
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 1rem;
}

.modal-container {
  background-color: white;
  border-radius: 0.75rem;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
}

.modal-close {
  background: transparent;
  border: none;
  cursor: pointer;
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem;
  border-radius: 9999px;
  transition: background-color 0.2s;
}

.modal-close:hover {
  background-color: #f3f4f6;
  color: #1f2937;
}

.modal-body {
  padding: 1.5rem;
}

.aviso-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.icono-container {
  display: flex;
  justify-content: center;
  margin-bottom: 0.5rem;
}

.icono-info {
  height: 3rem;
  width: 3rem;
  color: #0ea5e9;
}

.mensaje-container {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.mensaje-titulo {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  text-align: center;
  margin-bottom: 0.5rem;
}

.mensaje-item {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
}

.mensaje-icono {
  height: 1.25rem;
  width: 1.25rem;
  color: #0ea5e9;
  flex-shrink: 0;
  margin-top: 0.125rem;
}

.mensaje-texto {
  margin: 0;
  color: #4b5563;
  font-size: 0.9375rem;
  line-height: 1.5;
}

.modal-footer {
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: center;
  border-top: 1px solid #e5e7eb;
}

.boton-entendido {
  padding: 0.625rem 1.5rem;
  background-color: #0ea5e9;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.boton-entendido:hover {
  background-color: #0284c7;
}

/* Responsive */
@media (max-width: 640px) {
  .modal-container {
    max-width: 100%;
    border-radius: 0.5rem;
  }
  
  .modal-body {
    padding: 1.25rem;
  }
  
  .mensaje-titulo {
    font-size: 1rem;
  }
  
  .mensaje-texto {
    font-size: 0.875rem;
  }
  
  .boton-entendido {
    width: 100%;
  }
}
</style>