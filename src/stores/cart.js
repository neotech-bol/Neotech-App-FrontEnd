import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

/**
 * Store de Pinia para gestionar el carrito de compras
 * Implementa todas las funcionalidades relacionadas con el carrito:
 * - Agregar/eliminar productos
 * - Actualizar cantidades
 * - Aplicar cupones de descuento
 * - Calcular totales
 */
export const useCartStore = defineStore('cart', () => {
  // ===== ESTADO DEL CARRITO =====
  
  // Lista de productos en el carrito (cargada desde localStorage al inicio)
  const productos = ref(loadCartFromStorage() || []);
  
  // Variables relacionadas con descuentos y cupones
  const descuento = ref(0);           // Valor del descuento
  const tipoDescuento = ref('');      // Tipo de descuento (porcentaje o fijo)
  const montoPorcentaje = ref(0);     // Porcentaje de descuento calculado
  const montoDescuento = ref(0);      // Monto total del descuento en valor monetario
  const cupon_id = ref(null);         // ID del cupón aplicado
  const cuponAplicado = ref(null);    // Objeto completo del cupón aplicado

  /**
   * Carga el carrito desde localStorage al iniciar la aplicación
   * @returns {Array} - Array de productos guardados o array vacío si no hay datos
   */
  function loadCartFromStorage() {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  }

  /**
   * Guarda el estado actual del carrito en localStorage
   * Permite persistencia de datos entre sesiones
   */
  function saveCartToStorage() {
    localStorage.setItem('cart', JSON.stringify(productos.value));
  }

  // ===== PROPIEDADES CALCULADAS (GETTERS) =====

  /**
   * Calcula el número total de items en el carrito
   * Suma las cantidades de todos los productos
   */
  const totalItems = computed(() => {
    return productos.value.reduce((total, item) => total + item.cantidad, 0);
  });

  /**
   * Calcula el número de productos únicos en el carrito
   * Cuenta cuántos productos diferentes hay, independientemente de su cantidad
   */
  const uniqueItemCount = computed(() => productos.value.length);

  /**
   * Calcula el monto total del carrito sin descuentos
   * Multiplica precio por cantidad para cada producto y suma todos
   */
  const totalAmount = computed(() => {
    return productos.value.reduce((total, item) => total + (item.precio * item.cantidad), 0);
  });

  /**
   * Calcula el total después de aplicar descuentos
   * Resta el monto de descuento del total
   */
  const totalAfterDiscount = computed(() => totalAmount.value - montoDescuento.value);
  
  /**
   * Calcula el monto a pagar inicialmente (70% del total con descuento)
   * Representa el pago inicial o anticipo
   */
  const totalToPay = computed(() => totalAfterDiscount.value * 0.7);
  
  /**
   * Calcula el monto pendiente por pagar (30% del total con descuento)
   * Representa el saldo pendiente después del pago inicial
   */
  const pending = computed(() => totalAfterDiscount.value * 0.3);

  // ===== MÉTODOS PARA MANIPULAR EL CARRITO =====

  /**
   * Añade un producto al carrito
   * Si el producto ya existe, incrementa su cantidad
   * Si es nuevo, lo agrega como nuevo item
   * 
   * @param {Object} product - Objeto con datos del producto a añadir
   */
  function addToCart(product) {
    // Genera un ID único para el producto basado en sus características
    const uniqueId = generarUniqueId(product);
    // Busca si el producto ya existe en el carrito
    const existingItem = productos.value.find(item => item.uniqueId === uniqueId);

    if (existingItem) {
      // Si ya existe, incrementa la cantidad si no supera el máximo
      if (existingItem.cantidad < existingItem.cantidad_maxima) {
        existingItem.cantidad += product.cantidad;
      } else {
        console.warn(`Límite máximo alcanzado para ${existingItem.nombre}`);
      }
    } else {
      // Si es nuevo, añade el producto completo al carrito
      productos.value.push({
        uniqueId,
        id: product.id,
        nombre: product.nombre,
        precio: product.precio,
        cantidad: product.cantidad_minima || 1,
        cantidad_minima: product.cantidad_minima,
        cantidad_maxima: product.cantidad_maxima,
        image: product.colorImage || product.imagen_principal,
        modeloId: product.modeloId,
        modelo: product.nombreModelo,
        color: product.color,
        colorImage: product.colorImage
      });
    }
    // Guarda cambios y recalcula descuentos
    saveCartToStorage();
    recalcularDescuento();
  }

  /**
   * Genera un identificador único para cada producto
   * Combina ID del producto, modelo y color para diferenciar variantes
   * 
   * @param {Object} product - Producto para el que se genera el ID
   * @returns {string} - ID único para el producto
   */
  function generarUniqueId(product) {
    return `${product.id}-${product.modeloId}-${product.color || 'default'}`;
  }

  /**
   * Elimina un producto del carrito por su ID único
   * 
   * @param {string} uniqueId - ID único del producto a eliminar
   */
  function removeFromCart(uniqueId) {
    console.log("Eliminando producto con uniqueId:", uniqueId);
    productos.value = productos.value.filter(item => item.uniqueId !== uniqueId);
    console.log("Productos restantes:", productos.value); // Verifica el estado del carrito
    saveCartToStorage();
    recalcularDescuento();
  }

  /**
   * Actualiza la cantidad de un producto en el carrito
   * Verifica que la cantidad esté dentro de los límites permitidos
   * 
   * @param {string} uniqueId - ID único del producto a actualizar
   * @param {number} cantidad - Nueva cantidad a establecer
   */
  function updateQuantity(uniqueId, cantidad) {
    const item = productos.value.find(item => item.uniqueId === uniqueId);
    if (item) {
      // Verifica que la cantidad esté dentro de los límites min/max
      if (cantidad >= item.cantidad_minima && cantidad <= item.cantidad_maxima) {
        item.cantidad = cantidad;
      }
    }
    saveCartToStorage();
    recalcularDescuento();
  }

  /**
   * Vacía completamente el carrito y elimina descuentos
   * Reinicia todos los valores a su estado inicial
   */
  function clearCart() {
    productos.value = [];
    descuento.value = 0;
    montoDescuento.value = 0;
    tipoDescuento.value = '';
    montoPorcentaje.value = 0;
    cupon_id.value = null;
    cuponAplicado.value = null;
    saveCartToStorage();
  }

  /**
   * Aplica un cupón de descuento al carrito
   * Guarda la información del cupón y recalcula los descuentos
   * 
   * @param {Object} cupon - Objeto con datos del cupón a aplicar
   */
  function applyCoupon(cupon) {
    cuponAplicado.value = cupon;
    cupon_id.value = cupon.id;
    tipoDescuento.value = cupon.tipo;
    
    recalcularDescuento();
  }

  /**
   * Recalcula el descuento basado en el cupón aplicado
   * Maneja diferentes tipos de descuento (porcentaje o monto fijo)
   * Asegura que el descuento no exceda el total del carrito
   */
  function recalcularDescuento() {
    // Si no hay cupón aplicado, reinicia valores de descuento
    if (!cuponAplicado.value) {
      montoDescuento.value = 0;
      montoPorcentaje.value = 0;
      descuento.value = 0;
      return;
    }

    // Calcula descuento según el tipo (porcentaje o fijo)
    if (cuponAplicado.value.tipo === 'porcentaje') {
      // Descuento porcentual: calcula el monto basado en el porcentaje
      montoDescuento.value = (totalAmount.value * cuponAplicado.value.descuento) / 100;
      montoPorcentaje.value = cuponAplicado.value.descuento;
      descuento.value = cuponAplicado.value.descuento;
    } else if (cuponAplicado.value.tipo === 'fijo') {
      // Descuento de monto fijo: usa el valor directo (sin exceder el total)
      montoDescuento.value = Math.min(cuponAplicado.value.descuento, totalAmount.value);
      montoPorcentaje.value = (montoDescuento.value / totalAmount.value) * 100;
      descuento.value = cuponAplicado.value.descuento;
    }

    // Asegura que el descuento nunca sea mayor que el total del carrito
    montoDescuento.value = Math.min(montoDescuento.value, totalAmount.value);
  }

  /**
   * Elimina el cupón aplicado y reinicia todos los valores de descuento
   */
  function removeCoupon() {
    descuento.value = 0;
    montoDescuento.value = 0;
    tipoDescuento.value = '';
    montoPorcentaje.value = 0;
    cupon_id.value = null;
    cuponAplicado.value = null;
  }

  // Expone estado y métodos para ser utilizados fuera del store
  return {
    // Estado
    productos,
    
    // Getters (propiedades calculadas)
    totalItems,
    totalAmount,
    totalAfterDiscount,
    totalToPay,
    pending,
    uniqueItemCount,
    
    // Métodos para manipular el carrito
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    
    // Métodos y estado para cupones/descuentos
    applyCoupon,
    removeCoupon,
    descuento,
    tipoDescuento,
    montoPorcentaje,
    montoDescuento,
    cupon_id,
    cuponAplicado
  };
});