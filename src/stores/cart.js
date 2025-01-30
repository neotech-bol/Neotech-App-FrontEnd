import { defineStore } from 'pinia'; // Importa la función para definir un store de Pinia
import { ref, computed } from 'vue'; // Importa funciones reactivas y computadas de Vue

// Define un nuevo store llamado 'cart'
export const useCartStore = defineStore('cart', () => {
  // Crea una referencia reactiva para almacenar los artículos del carrito
  const items = ref(loadCartFromStorage() || []);

  // Función para cargar el carrito desde el almacenamiento local
  function loadCartFromStorage() {
    const savedCart = localStorage.getItem('cart'); // Intenta obtener el carrito guardado
    return savedCart ? JSON.parse(savedCart) : []; // Si existe, lo convierte a objeto; si no, devuelve un arreglo vacío
  }

  // Función para guardar el carrito en el almacenamiento local
  function saveCartToStorage() {
    localStorage.setItem('cart', JSON.stringify(items.value)); // Convierte el carrito a JSON y lo guarda
  }

  // Propiedad computada que calcula el total de artículos en el carrito
  const totalItems = computed(() => {
    return items.value.reduce((total, item) => total + item.cantidad, 0); // Suma la cantidad de cada artículo
  });

  // Propiedad computada que calcula el monto total del carrito
  const totalAmount = computed(() => {
    return items.value.reduce((total, item) => total + (item.precio * item.cantidad), 0); // Suma el precio total de cada artículo
  });

  // Propiedad computada que calcula el 70% del monto total del carrito
  const totalToPay = computed(() => {
    return totalAmount.value * 0.7; // Retorna el 70% del total
  });

  // Propiedad computada que calcula el monto pendiente (30% del total)
  const pending = computed(() => {
    return totalAmount.value * 0.3; // Retorna el 30% del total
  });

  // Función para agregar un producto al carrito
  function addToCart(product) {
    const existingItem = items.value.find(item => item.id === product.id);
    
    if (existingItem) {
      // Si ya existe, solo se puede incrementar la cantidad
      existingItem.cantidad += 1; // Aumenta la cantidad
    } else {
      // Si no existe, se agrega con una cantidad inicial de 10
      items.value.push({
        id: product.id,
        nombre: product.nombre,
        precio: product.precio,
        cantidad: 10, // Inicializa la cantidad en 10
        image: product.imagen_principal
      });
    }
    
    saveCartToStorage();
  }

  // Función para eliminar un producto del carrito
  function removeFromCart(productId) {
    items.value = items.value.filter(item => item.id !== productId);
    saveCartToStorage();
  }

  // Función para actualizar la cantidad de un producto en el carrito
  function updateQuantity(productId, cantidad) {
    const item = items.value.find(item => item.id === productId);
    if (item) {
      // Asegúrate de que la cantidad no sea menor a 10
      if (cantidad >= 10) {
        item.cantidad = cantidad; // Actualiza la cantidad
      } else {
        console.warn(`La cantidad mínima para el producto ${item.nombre} es 10.`);
      }
      
      if (item.cantidad <= 0) {
        removeFromCart(productId);
      }
    }
    saveCartToStorage();
  }

  // Función para limpiar el carrito
  function clearCart() {
    items.value = [];
    saveCartToStorage();
  }

  // Retorna el estado y las funciones del store para que puedan ser utilizadas en otros componentes
  return {
    items,
    totalItems,
    totalAmount,
    totalToPay,
    pending, // Agregado para que puedas acceder al monto pendiente
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart
  };
});