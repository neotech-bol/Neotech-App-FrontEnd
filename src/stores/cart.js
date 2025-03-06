import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useCartStore = defineStore('cart', () => {
  const productos = ref(loadCartFromStorage() || []);
  const descuento = ref(0);
  const tipoDescuento = ref('');
  const montoPorcentaje = ref(0);
  const montoDescuento = ref(0);
  const cupon_id = ref(null);
  const cuponAplicado = ref(null);

  function loadCartFromStorage() {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  }

  function saveCartToStorage() {
    localStorage.setItem('cart', JSON.stringify(productos.value));
  }

  const totalItems = computed(() => {
    return productos.value.reduce((total, item) => total + item.cantidad, 0);
  });

  const uniqueItemCount = computed(() => productos.value.length);

  const totalAmount = computed(() => {
    return productos.value.reduce((total, item) => total + (item.precio * item.cantidad), 0);
  });

  const totalAfterDiscount = computed(() => totalAmount.value - montoDescuento.value);
  const totalToPay = computed(() => totalAfterDiscount.value * 0.7);
  const pending = computed(() => totalAfterDiscount.value * 0.3);

  function addToCart(product) {
    const uniqueId = generarUniqueId(product);
    const existingItem = productos.value.find(item => item.uniqueId === uniqueId);

    if (existingItem) {
      if (existingItem.cantidad < existingItem.cantidad_maxima) {
        existingItem.cantidad += product.cantidad;
      } else {
        console.warn(`Límite máximo alcanzado para ${existingItem.nombre}`);
      }
    } else {
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
    saveCartToStorage();
    recalcularDescuento();
  }

  function generarUniqueId(product) {
    return `${product.id}-${product.modeloId}-${product.color || 'default'}`;
  }

  function removeFromCart(uniqueId) {
    console.log("Eliminando producto con uniqueId:", uniqueId);
    productos.value = productos.value.filter(item => item.uniqueId !== uniqueId);
    console.log("Productos restantes:", productos.value); // Verifica el estado del carrito
    saveCartToStorage();
    recalcularDescuento();
  }

  function updateQuantity(uniqueId, cantidad) {
    const item = productos.value.find(item => item.uniqueId === uniqueId);
    if (item) {
      if (cantidad >= item.cantidad_minima && cantidad <= item.cantidad_maxima) {
        item.cantidad = cantidad;
      }
    }
    saveCartToStorage();
    recalcularDescuento();
  }

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

  function applyCoupon(cupon) {
    cuponAplicado.value = cupon;
    cupon_id.value = cupon.id;
    tipoDescuento.value = cupon.tipo;
    
    recalcularDescuento();
  }

  function recalcularDescuento() {
    if (!cuponAplicado.value) {
      montoDescuento.value = 0;
      montoPorcentaje.value = 0;
      descuento.value = 0;
      return;
    }

    if (cuponAplicado.value.tipo === 'porcentaje') {
      montoDescuento.value = (totalAmount.value * cuponAplicado.value.descuento) / 100;
      montoPorcentaje.value = cuponAplicado.value.descuento;
      descuento.value = cuponAplicado.value.descuento;
    } else if (cuponAplicado.value.tipo === 'fijo') {
      montoDescuento.value = Math.min(cuponAplicado.value.descuento, totalAmount.value);
      montoPorcentaje.value = (montoDescuento.value / totalAmount.value) * 100;
      descuento.value = cuponAplicado.value.descuento;
    }

    // Asegurarse de que el descuento no exceda el total del carrito
    montoDescuento.value = Math.min(montoDescuento.value, totalAmount.value);
  }

  function removeCoupon() {
    descuento.value = 0;
    montoDescuento.value = 0;
    tipoDescuento.value = '';
    montoPorcentaje.value = 0;
    cupon_id.value = null;
    cuponAplicado.value = null;
  }

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
    descuento,
    tipoDescuento,
    montoPorcentaje,
    montoDescuento,
    cupon_id,
    cuponAplicado
  };
});