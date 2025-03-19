// Importando los módulos necesarios de Node.js y Vite
import { fileURLToPath, URL } from 'node:url' // Para manejar URLs de archivos
import { defineConfig } from 'vite' // Función para definir la configuración de Vite
import vue from '@vitejs/plugin-vue' // Plugin de Vue para Vite
import vueDevTools from 'vite-plugin-vue-devtools' // Plugin para la integración de Vue DevTools

// Exportando la configuración de Vite usando defineConfig para mejor autocompletado
export default defineConfig({
  // Plugins que se utilizarán en el proyecto de Vite
  plugins: [
    vue(), // Habilita el soporte para Vue
    vueDevTools(), // Habilita Vue DevTools para desarrollo
  ],
  
  // Resolución de rutas de módulos
  resolve: {
    alias: {
      // Creando un alias '@' que apunta al directorio 'src'
      '@': fileURLToPath(new URL('./src', import.meta.url)) // Convierte la URL a una ruta de archivo
    },
  },
})