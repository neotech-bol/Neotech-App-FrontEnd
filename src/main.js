import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createHead } from '@vueuse/head' // Importamos vueuse/head para manejar el <head>
import "./assets/global.css" // Import the global CSS file
import App from './App.vue'
import router from './router'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import 'sweetalert2/dist/sweetalert2.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import { useThemeStore } from './stores/themeStore'
// Crear la instancia de la aplicación
const app = createApp(App)

// Crear instancia de Pinia para estado global
const pinia = createPinia()

// Crear instancia de Head para gestionar metadatos dinámicos
const head = createHead()

// Usar Pinia y Router en la aplicación
app.use(pinia)
app.use(router)
app.use(head)
// Initialize the theme store before mounting the app
// This ensures the theme is applied immediately
const themeStore = useThemeStore()
themeStore.applyTheme(themeStore.currentDepartment)

// Configurar el manejo dinámico de metadatos SEO desde el router
router.beforeEach((to, from, next) => {
  // Actualizar el título de la página
  head.addHeadObjs({
    title: to.meta.title || 'Neotech-Bol | Tecnología y Electrónica en Bolivia',
    meta: [
      {
        name: 'description',
        content: to.meta.description || 'Tienda líder en tecnología y electrónica en Bolivia. Encuentra smartphones, computadoras y más al mejor precio.',
      },
      // Puedes añadir más metaetiquetas como Open Graph o Twitter Card aquí si lo deseas
      {
        property: 'og:title',
        content: to.meta.title || 'Neotech-Bol | Tecnología y Electrónica en Bolivia',
      },
      {
        property: 'og:description',
        content: to.meta.description || 'Tienda líder en tecnología y electrónica en Bolivia.',
      },
      {
        property: 'og:url',
        content: `https://neotech-bol.com${to.fullPath}`,
      },
    ],
  })
  next()
})

// Montar la aplicación en el elemento #app
app.mount('#app')