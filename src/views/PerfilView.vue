<template>
    <div class="contenedor-perfil">
      <header class="encabezado-perfil">
        <div class="avatar-perfil">
          {{ inicialesUsuario }}
        </div>
        <div class="titulo-perfil">
          <h1>{{ usuario.nombre }}</h1>
          <p>{{ usuario.email }}</p>
        </div>
      </header>
      <main class="contenido-perfil">
        <section class="info-perfil">
          <h2>Información del Perfil</h2>
          <div class="grid-info">
            <div class="item-info" v-for="(valor, clave) in camposEditables" :key="clave">
              <strong>{{ formatearEtiqueta(clave) }}:</strong>
              <span v-if="!editando">{{ valor }}</span>
              <input v-else v-model="usuarioEditado[clave]" :placeholder="formatearEtiqueta(clave)" />
            </div>
            <div class="item-info">
              <strong>Miembro desde:</strong>
              <span>{{ usuario.miembroDesde }}</span>
            </div>
            <div class="item-info">
              <strong>Total de pedidos:</strong>
              <span>{{ usuario.totalPedidos }}</span>
            </div>
          </div>
          <div class="botones-edicion">
            <button v-if="!editando" @click="iniciarEdicion" class="boton-editar">Editar Perfil</button>
            <template v-else>
              <button @click="guardarCambios" class="boton-guardar">Guardar Cambios</button>
              <button @click="cancelarEdicion" class="boton-cancelar">Cancelar</button>
            </template>
          </div>
        </section>
        <section class="historial-pedidos">
          <h2>Historial de Pedidos</h2>
          <div class="lista-pedidos">
            <div v-for="pedido in usuario.pedidos" :key="pedido.id" class="item-pedido">
              <div class="encabezado-pedido">
                <span class="id-pedido">Pedido #{{ pedido.id }}</span>
                <span class="fecha-pedido">{{ formatearFecha(pedido.fecha) }}</span>
              </div>
              <div class="detalles-pedido">
                <span class="total-pedido">{{ formatearPrecio(pedido.total) }}</span>
                <span class="estado-pedido" :class="pedido.estado.toLowerCase()">
                  {{ pedido.estado }}
                </span>
              </div>
              <div class="progreso-pedido">
                <div class="barra-progreso" :style="{ width: obtenerProgresoPedido(pedido.estado) }"></div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue'
  
  const usuario = ref({
    nombre: 'Juan Pérez',
    email: 'juan.perez@ejemplo.com',
    nombreUsuario: 'juanperez',
    miembroDesde: '1 de enero de 2023',
    ubicacion: 'Madrid, España',
    telefono: '+34 123 456 789',
    totalPedidos: 15,
    pedidos: [
      { id: 1001, fecha: '2023-06-15', total: 125.99, estado: 'Entregado' },
      { id: 1002, fecha: '2023-06-02', total: 79.50, estado: 'Enviado' },
      { id: 1003, fecha: '2023-05-18', total: 249.99, estado: 'En proceso' },
      { id: 1004, fecha: '2023-05-01', total: 59.99, estado: 'Entregado' },
      { id: 1005, fecha: '2023-04-15', total: 149.95, estado: 'Cancelado' },
    ]
  })
  
  const editando = ref(false)
  const usuarioEditado = ref({})
  
  const camposEditables = computed(() => {
    const { nombre, nombreUsuario, ubicacion, telefono } = usuario.value
    return { nombre, nombreUsuario, ubicacion, telefono }
  })
  
  const inicialesUsuario = computed(() => {
    return usuario.value.nombre
      .split(' ')
      .map(nombre => nombre[0])
      .join('')
      .toUpperCase()
  })
  
  function iniciarEdicion() {
    usuarioEditado.value = { ...camposEditables.value }
    editando.value = true
  }
  
  function guardarCambios() {
    Object.assign(usuario.value, usuarioEditado.value)
    editando.value = false
  }
  
  function cancelarEdicion() {
    editando.value = false
  }
  
  function formatearEtiqueta(clave) {
    const etiquetas = {
      nombre: 'Nombre',
      nombreUsuario: 'Nombre de usuario',
      ubicacion: 'Ubicación',
      telefono: 'Teléfono'
    }
    return etiquetas[clave] || clave
  }
  
  function formatearFecha(fechaString) {
    const opciones = { year: 'numeric', month: 'long', day: 'numeric' }
    return new Date(fechaString).toLocaleDateString('es-ES', opciones)
  }
  
  function formatearPrecio(precio) {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(precio)
  }
  
  function obtenerProgresoPedido(estado) {
    const mapaProgreso = {
      'En proceso': '25%',
      'Enviado': '75%',
      'Entregado': '100%',
      'Cancelado': '100%'
    }
    return mapaProgreso[estado] || '0%'
  }
  </script>
  
  <style scoped>
  .contenedor-perfil {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
    background-color: #ffffff;
    color: #333;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  }
  
  .encabezado-perfil {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    margin-bottom: 2rem;
    background-color: #fff;
    padding: 1.5rem;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  .avatar-perfil {
    width: 80px;
    height: 80px;
    background-color: #3498db;
    color: white;
    font-size: 2rem;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    margin-right: 1.5rem;
  }
  
  .titulo-perfil h1 {
    font-size: 2rem;
    color: #2c3e50;
    margin-bottom: 0.25rem;
  }
  
  .titulo-perfil p {
    font-size: 1rem;
    color: #7f8c8d;
  }
  
  .contenido-perfil {
    display: grid;
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  
  @media (min-width: 768px) {
    .contenido-perfil {
      grid-template-columns: 1fr 1fr;
    }
  }
  
  .info-perfil, .historial-pedidos {
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    padding: 1.5rem;
  }
  
  h2 {
    font-size: 1.5rem;
    color: #2c3e50;
    margin-bottom: 1rem;
    border-bottom: 2px solid #3498db;
    padding-bottom: 0.5rem;
  }
  
  .grid-info {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  @media (min-width: 480px) {
    .grid-info {
      grid-template-columns: repeat(2, 1fr);
    }
  }
  
  .item-info {
    display: flex;
    flex-direction: column;
  }
  
  .item-info strong {
    font-weight: bold;
    margin-bottom: 0.25rem;
    color: #34495e;
  }
  
  .item-info input {
    padding: 0.5rem;
    border: 1px solid #bdc3c7;
    border-radius: 4px;
    font-size: 1rem;
  }
  
  .botones-edicion {
    margin-top: 1rem;
    display: flex;
    gap: 1rem;
  }
  
  .boton-editar, .boton-guardar, .boton-cancelar {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;
    transition: background-color 0.3s ease;
  }
  
  .boton-editar {
    background-color: #3498db;
    color: white;
  }
  
  .boton-guardar {
    background-color: #2ecc71;
    color: white;
  }
  
  .boton-cancelar {
    background-color: #e74c3c;
    color: white;
  }
  
  .boton-editar:hover, .boton-guardar:hover, .boton-cancelar:hover {
    opacity: 0.9;
  }
  
  .lista-pedidos {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  
  .item-pedido {
    border: 1px solid #ecf0f1;
    border-radius: 8px;
    padding: 1rem;
    transition: box-shadow 0.3s ease;
    background-color: #f9f9f9;
  }
  
  .item-pedido:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  
  .encabezado-pedido {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
  }
  
  .id-pedido {
    font-weight: bold;
    color: #3498db;
  }
  
  .fecha-pedido {
    color: #7f8c8d;
  }
  
  .detalles-pedido {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
  }
  
  .total-pedido {
    font-weight: bold;
    font-size: 1.1rem;
    color: #2c3e50;
  }
  
  .estado-pedido {
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.8rem;
    font-weight: bold;
    text-transform: uppercase;
  }
  
  .estado-pedido.entregado {
    background-color: #2ecc71;
    color: white;
  }
  
  .estado-pedido.enviado {
    background-color: #f39c12;
    color: white;
  }
  
  .estado-pedido.en {
    background-color: #3498db;
    color: white;
  }
  
  .estado-pedido.cancelado {
    background-color: #e74c3c;
    color: white;
  }
  
  .progreso-pedido {
    height: 4px;
    background-color: #ecf0f1;
    border-radius: 2px;
    overflow: hidden;
  }
  
  .barra-progreso {
    height: 100%;
    background-color: #3498db;
    transition: width 0.3s ease;
  }
  </style>