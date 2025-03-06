import { defineStore } from 'pinia'; // Importa la función para definir un store de Pinia
import { ref, computed } from 'vue'; // Importa funciones reactivas y computadas de Vue

// Define un nuevo store llamado 'cart'
export const useCartStore = defineStore('cart', () => {
  // Crea una referencia reactiva para almacenar los artículos del carrito
  const productos = ref(loadCartFromStorage() || []);
  const descuento = ref(0); // Nueva propiedad para almacenar el descuento aplicado
  const tipoDescuento = ref('');
  const montoPorcentaje = ref('');
  const cupon_id = ref(null); // Agrega esta línea para definir cupon_id

  // Agrega propiedades para el color y la imagen del color
  const selectedColor = ref(null); // Para almacenar el color seleccionado
  const selectedColorImage = ref(''); // Para almacenar la imagen del color seleccionado

  // Función para cargar el carrito desde el almacenamiento local
  function loadCartFromStorage() {
    const savedCart = localStorage.getItem('cart'); // Intenta obtener el carrito guardado
    return savedCart ? JSON.parse(savedCart) : []; // Si existe, lo convierte a objeto; si no, devuelve un arreglo vacío
  }

  // Función para guardar el carrito en el almacenamiento local
  function saveCartToStorage() {
    localStorage.setItem('cart', JSON.stringify(productos.value)); // Convierte el carrito a JSON y lo guarda
  }

  // Propiedad computada que calcula el total de artículos en el carrito
  const totalItems = computed(() => {
    return productos.value.reduce((total, item) => total + item.cantidad, 0); // Suma la cantidad de cada artículo
  });

  // Propiedad computada que calcula el número de productos únicos en el carrito
  const uniqueItemCount = computed(() => {
    return productos.value.length; // Devuelve la cantidad de productos únicos
  });

  // Propiedad computada que calcula el monto total del carrito
  const totalAmount = computed(() => {
    return productos.value.reduce((total, item) => total + (item.precio * item.cantidad), 0); // Suma el precio total de cada artículo
  });

  // Propiedad computada que calcula el monto total después de aplicar el descuento
  const totalAfterDiscount = computed(() => {
    return totalAmount.value - descuento.value; // Resta el descuento del total
  });

  // Propiedad computada que calcula el 70% del monto total después del descuento
  const totalToPay = computed(() => {
    return totalAfterDiscount.value * 0.7; // Retorna el 70% del total después del descuento
  });

  // Propiedad computada que calcula el monto pendiente (30% del total después del descuento)
  const pending = computed(() => {
    return totalAfterDiscount.value * 0.3; // Retorna el 30% del total después del descuento
  });

  // Función para agregar un producto al carrito
  function addToCart(product) {
    console.log(product);  
    const existingItem = productos.value.find(item => item.id === product.id && item.modeloId === product.modeloId);
    console.log(existingItem);
    if (existingItem) {
      // Si ya existe, verifica si se puede incrementar la cantidad
      if (existingItem.cantidad < existingItem.cantidad_maxima) {
        existingItem.cantidad += 1; // Aumenta la cantidad
      } else {
        console.warn(`No se puede aumentar la cantidad del producto ${existingItem.nombre} más allá de ${existingItem.cantidad_maxima}.`);
      }
    } else {
      // Si no existe, se agrega con una cantidad inicial de cantidad_minima
      productos.value.push({
        id: product.id,
        nombre: product.nombre,
        precio: product.precio,
        cantidad: product.cantidad_minima || 1,
        cantidad_minima: product.cantidad_minima,
        cantidad_maxima: product.cantidad_maxima,
        image: product.imagen_principal,
        modeloId: product.modeloId,
        modelo: product.nombreModelo,
        color: product.color, // Agrega el color seleccionado
        colorImage: product.colorImage // Agrega la imagen del color seleccionado
      });
      console.log(product.value);
    }
    
    saveCartToStorage();
  }

  // Función para eliminar un producto del carrito
  function removeFromCart(productId, modeloId) {
    productos.value = productos.value.filter(item => !(item.id === productId && item.modeloId === modeloId));
    saveCartToStorage();
  }

  // Función para actualizar la cantidad de un producto en el carrito
  function updateQuantity(productId, modeloId, cantidad) {
    const item = productos.value.find(item => item.id === productId && item.modeloId === modeloId);
    console.log(item);
    if (item) {
      // Asegúrate de que la cantidad no sea menor a la cantidad mínima
      if (cantidad >= item.cantidad_minima) {
        item.cantidad = cantidad; // Actualiza la cantidad
      } else {
        console.log(`La cantidad mínima para el producto ${item.nombre} es ${item.cantidad_minima}.`);
      }

      if (item.cantidad <= 0) {
        removeFromCart(productId, modeloId); // Elimina el producto si la cantidad es 0 o menor
      }
    }
    saveCartToStorage();
  }

  // Función para limpiar el carrito
  function clearCart() {
    productos.value = [];
    descuento.value = 0; // Reinicia el descuento al limpiar el carrito
    saveCartToStorage();
  }

  // Función para aplicar un descuento
  function applyCoupon(cupon) {
    // Aquí puedes agregar lógica para validar el cupón si es necesario
    if (cupon.tipo === 'porcentaje') {
      descuento.value = (totalAmount.value * cupon.descuento) / 100; // Aplica el descuento porcentual
      montoPorcentaje.value = (descuento.value * 100) / totalAmount.value;
      console.log(montoPorcentaje.value);  

      tipoDescuento.value = 'porcentaje'; // Almacena el tipo de descuento
    } else if (cupon.tipo === 'fijo') {
      descuento.value = cupon.descuento; // Aplica el descuento fijo
      tipoDescuento.value = 'fijo'; // Almacena el tipo de descuento
    } else {
      console.warn('Tipo de cupón no reconocido.');
    }
    // Almacena el cupon_id en el store
    cupon_id.value = cupon.id; // Asegúrate de que cupon_id esté definido en el store
  }

  // Función para eliminar el descuento
  function removeCoupon() {
    descuento.value = 0; // Reinicia el descuento
    tipoDescuento.value = ''; // Reinicia el tipo de descuento
  }

  // Retorna el estado y las funciones del store para que puedan ser utilizadas en otros componentes
  return {
    productos,
    totalItems,
    totalAmount,
    totalAfterDiscount,
    totalToPay,
    pending,
    uniqueItemCount,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    applyCoupon,
    removeCoupon,
    descuento, // Agregado para que puedas acceder al descuento aplicado
    tipoDescuento,
    montoPorcentaje,
    cupon_id,
    selectedColor, // Agregado para acceder al color seleccionado
    selectedColorImage // Agregado para acceder a la imagen del color seleccionado
  };
});