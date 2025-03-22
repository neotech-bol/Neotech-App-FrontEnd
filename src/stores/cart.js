import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

/**
 * Store de Pinia para gestionar el carrito de compras
 */
export const useCartStore = defineStore('cart', () => {
  // ===== ESTADO DEL CARRITO =====
  const productos = ref([]);
  const descuento = ref(0);
  const tipoDescuento = ref('');
  const montoPorcentaje = ref(0);
  const montoDescuento = ref(0);
  const cupon_id = ref(null);
  const cuponAplicado = ref(null);

  // Cargar datos del carrito desde localStorage al inicializar
  if (localStorage.getItem('cart')) {
    productos.value = JSON.parse(localStorage.getItem('cart'));
  }

  /**
   * Carga el carrito desde localStorage
   * @returns {Array} - Array de productos o array vacío
   */
  function loadCartFromStorage() {
    const savedCart = localStorage.getItem("cart");
    return savedCart ? JSON.parse(savedCart) : [];
  }
  // Propiedad computada que calcula el número de productos únicos en el carrito
  const uniqueItemCount = computed(() => {
    return productos.value.length; // Devuelve la cantidad de productos únicos
  });

  // ===== PROPIEDADES CALCULADAS (GETTERS) =====
  const totalItems = computed(() => {
    return productos.value.reduce((total, item) => total + item.cantidad, 0);
  });

  const totalAmount = computed(() => {
    return productos.value.reduce((total, item) => {
      const precio = item.es_preventa ? item.precio_preventa : item.precio;
      return total + precio * item.cantidad;
    }, 0);
  });

  const totalAfterDiscount = computed(() => totalAmount.value - montoDescuento.value);
  const totalToPay = computed(() => totalAfterDiscount.value * 0.7);
  const pending = computed(() => totalAfterDiscount.value * 0.3);

  /**
   * Guarda el estado actual del carrito en localStorage
   */
  function saveCartToStorage() {
    localStorage.setItem('cart', JSON.stringify(productos.value));
  }

  /**
   * Determina si un producto debe usar precio de preventa
   * @param {Object} product - Producto a evaluar
   * @returns {boolean} - true si debe usar precio de preventa
   */
  function determinarSiEsPreventa(product) {
    if (!product.precio_preventa) return false;
    
    const cantidad = product.cantidad || 1;
    const minPreventa = product.cantidad_minima_preventa;
    const maxPreventa = product.cantidad_maxima_preventa;
    
    if (!minPreventa || !maxPreventa) return false;
    
    return cantidad >= minPreventa && cantidad <= maxPreventa;
  }

  /**
   * Genera un ID único para cada producto en el carrito
   * @param {Object} product - Producto para generar ID
   * @returns {string} - ID único
   */
  function generarUniqueId(product) {
    const preventaStatus = product.es_preventa ? 'preventa' : 'regular';
    return `${product.id}-${product.modeloId || "default"}-${product.color || "default"}-${preventaStatus}`;
  }

  /**
   * Añade un producto al carrito o actualiza su cantidad si ya existe
   * @param {Object} product - Producto a añadir
   */
  function addToCart(product) {
    console.log('Añadiendo producto al carrito:', product.nombre, {
      imagen_principal: product.imagen_principal,
      colorImage: product.colorImage,
      image: product.image
    });
  
    const originalImage = product.imagen_principal || product.colorImage || product.image;
    const esPreventa = determinarSiEsPreventa(product);
    const uniqueId = generarUniqueId({ ...product, es_preventa: esPreventa });
  
    const existingItem = productos.value.find((item) => item.uniqueId === uniqueId);
  
    if (existingItem) {
      const cantidadMaxima = esPreventa
        ? existingItem.cantidad_maxima_preventa || existingItem.cantidad_maxima
        : existingItem.cantidad_maxima;
  
      if (existingItem.cantidad < cantidadMaxima) {
        existingItem.cantidad += product.cantidad || 1;
      }
  
      // Preservar imágenes
      existingItem.imagen_principal = product.imagen_principal || existingItem.imagen_principal || originalImage;
      existingItem.colorImage = product.colorImage || existingItem.colorImage;
      existingItem.image = product.image || existingItem.image || originalImage;
    } else {
      const cantidadMinima = esPreventa
        ? product.cantidad_minima_preventa || product.cantidad_minima
        : product.cantidad_minima;
  
      const newCartItem = {
        ...product,
        uniqueId,
        es_preventa: esPreventa,
        cantidad: product.cantidad || cantidadMinima || 1,
        imagen_principal: product.imagen_principal || originalImage,
        colorImage: product.colorImage,
        image: product.image || originalImage
      };
  
      productos.value.push(newCartItem);
    }
  
    saveCartToStorage();
    recalcularDescuento();
  }

  /**
   * Elimina un producto del carrito
   * @param {string} uniqueId - ID único del producto a eliminar
   */
  function removeFromCart(uniqueId) {
    productos.value = productos.value.filter((item) => item.uniqueId !== uniqueId);
    saveCartToStorage();
    recalcularDescuento();
  }

  /**
   * Vacía completamente el carrito
   */
  function clearCart() {
    productos.value = [];
    descuento.value = 0;
    montoDescuento.value = 0;
    tipoDescuento.value = "";
    montoPorcentaje.value = 0;
    cupon_id.value = null;
    cuponAplicado.value = null;
    saveCartToStorage();
  }

  /**
   * Calcula el monto de descuento basado en el tipo y valor del descuento
   * @param {number} totalAmount - Monto total antes del descuento
   * @param {string} discountType - Tipo de descuento ('porcentaje' o 'fijo')
   * @param {number} discountValue - Valor del descuento (porcentaje o monto fijo)
   * @returns {number} - El monto de descuento calculado
   */
  function calculateDiscountAmount(totalAmount, discountType, discountValue) {
    if (!totalAmount || !discountValue) return 0;
    
    let discountAmount = 0;
    
    if (discountType === 'porcentaje') {
      // Calcular descuento porcentual
      discountAmount = (totalAmount * discountValue) / 100;
    } else if (discountType === 'fijo') {
      // Descuento de monto fijo
      discountAmount = discountValue;
    }
    
    // Asegurar que el descuento no exceda el monto total
    return Math.min(discountAmount, totalAmount);
  }

  /**
   * Aplica un cupón de descuento
   * @param {Object} cupon - Cupón a aplicar
   */
  function applyCoupon(cupon) {
    cuponAplicado.value = cupon;
    cupon_id.value = cupon.id;
    tipoDescuento.value = cupon.tipo;
    descuento.value = cupon.descuento;
    recalcularDescuento();
  }

  /**
   * Elimina el cupón aplicado
   */
  function removeCoupon() {
    descuento.value = 0;
    montoDescuento.value = 0;
    tipoDescuento.value = "";
    montoPorcentaje.value = 0;
    cupon_id.value = null;
    cuponAplicado.value = null;
  }

  /**
   * Recalcula el descuento basado en el cupón aplicado
   */
  function recalcularDescuento() {
    if (!cuponAplicado.value) {
      montoDescuento.value = 0;
      montoPorcentaje.value = 0;
      descuento.value = 0;
      return;
    }

    // Usar la función mejorada para calcular el descuento
    montoDescuento.value = calculateDiscountAmount(
      totalAmount.value,
      cuponAplicado.value.tipo,
      cuponAplicado.value.descuento
    );

    // Calcular el porcentaje equivalente para mostrar en la UI
    if (cuponAplicado.value.tipo === "porcentaje") {
      montoPorcentaje.value = cuponAplicado.value.descuento;
    } else if (cuponAplicado.value.tipo === "fijo") {
      montoPorcentaje.value = totalAmount.value > 0 ? (montoDescuento.value / totalAmount.value) * 100 : 0;
    }

    // Asegurar que el descuento nunca exceda el monto total
    montoDescuento.value = Math.min(montoDescuento.value, totalAmount.value);
  }

  /**
   * Actualiza el estado de preventa de un producto
   * @param {Object} item - Item a actualizar
   * @returns {boolean} - true si el estado cambió
   */
  function actualizarEstadoPreventa(item) {
    const estadoAnterior = item.es_preventa;
    
    if (!item.precio_preventa) {
      item.es_preventa = false;
      return estadoAnterior !== item.es_preventa;
    }

    // Solo actualiza si la cantidad está fuera del rango actual
    if (item.es_preventa) {
      const min = item.cantidad_minima_preventa;
      const max = item.cantidad_maxima_preventa;
      if (min && max && (item.cantidad < min || item.cantidad > max)) {
        item.es_preventa = false;
      }
    } else {
      const min = item.cantidad_minima;
      const max = item.cantidad_maxima;
      if (min && max && (item.cantidad < min || item.cantidad > max)) {
        const preventaMin = item.cantidad_minima_preventa;
        const preventaMax = item.cantidad_maxima_preventa;
        if (preventaMin && preventaMax && item.cantidad >= preventaMin && item.cantidad <= preventaMax) {
          item.es_preventa = true;
        }
      }
    }

    return estadoAnterior !== item.es_preventa;
  }

  /**
   * Actualiza la cantidad de un producto
   * @param {string} uniqueId - ID único del producto
   * @param {number} cantidad - Nueva cantidad
   */
  function updateQuantity(uniqueId, cantidad) {
    const index = productos.value.findIndex((item) => item.uniqueId === uniqueId);
    if (index === -1) return;
    
    const item = productos.value[index];
    
    // Guardar propiedades de imagen antes de cualquier cambio
    const originalImage = item.image || item.colorImage || item.imagen_principal;
    
    // Determinar límites min/max
    let minCantidad = item.cantidad_minima || 1;
    let maxCantidad = item.cantidad_maxima || 999;

    // Verificar límites
    if (cantidad < minCantidad) {
      cantidad = minCantidad;
    } else if (cantidad > maxCantidad) {
      cantidad = maxCantidad;
    }
    
    // Actualizar cantidad
    item.cantidad = cantidad;
    
    // Validar contra el rango actual
    const min = item.es_preventa ? item.cantidad_minima_preventa : item.cantidad_minima;
    const max = item.es_preventa ? item.cantidad_maxima_preventa : item.cantidad_maxima;
    
    if (cantidad < min || cantidad > max) {
      // Forzar actualización de estado
      const cambioEstado = actualizarEstadoPreventa(item);
      if (cambioEstado) {
        // Crear copia profunda del item
        const itemActualizado = JSON.parse(JSON.stringify(item));
        
        // Asegurar que las propiedades de imagen se preserven
        itemActualizado.imagen_principal = item.imagen_principal;
        itemActualizado.colorImage = item.colorImage;
        itemActualizado.image = item.image;
        
        // Si todas las propiedades de imagen están ausentes, usar la original
        if (!itemActualizado.imagen_principal && !itemActualizado.colorImage && !itemActualizado.image) {
          itemActualizado.image = originalImage;
        }
        
        // Regenerar ID único
        itemActualizado.uniqueId = generarUniqueId(itemActualizado);
        
        // Reemplazar item en el carrito
        productos.value.splice(index, 1);
        productos.value.push(itemActualizado);
      }
    }
    
    saveCartToStorage();
    recalcularDescuento();
  }

  return {
    // Estado
    productos,
    
    // Getters
    totalItems,
    totalAmount,
    totalAfterDiscount,
    totalToPay,
    pending,
    uniqueItemCount,
    
    // Métodos
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    applyCoupon,
    removeCoupon,
    calculateDiscountAmount,
    
    // Propiedades de descuento
    descuento,
    tipoDescuento,
    montoPorcentaje,
    montoDescuento,
    cupon_id,
    cuponAplicado,
    
    // Métodos auxiliares
    generarUniqueId,
    determinarSiEsPreventa
  };
});