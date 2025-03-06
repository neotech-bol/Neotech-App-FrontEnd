import { reactive } from 'vue'

// Crear un objeto reactivo para almacenar el estado de la aplicación
const state = reactive({
  currentLanguage: 'es', // Idioma actual, por defecto en español
  translations: { // Objeto que contiene las traducciones para cada idioma
    es: { // Traducciones en español
      help: 'Ayuda',
      experience: 'La experiencia de compra más veloz del país',
      select_language: 'Seleccionar idioma',
      search_placeholder: '¿Qué estás buscando en este ciclo?', // Clave para el placeholder
      account: 'Cuenta', // Clave para la cuenta
      login: 'Iniciar sesión', // Clave para iniciar sesión
      favorites: 'Favoritos', // Clave para favoritos
      cart: 'Carrito', // Clave para carrito
      home: 'Inicio', // Clave para "Inicio"
      products: 'Productos', // Clave para "Productos"
      categories: 'Categorías', // Clave para "Categorías"
      about: 'Nosotros', // Clave para "Nosotros"
      contact: 'Contacto', // Clave para "Contacto"
      view_catalog: 'Ver catálogo', // Clave para "Ver catálogo"
    },
    en: { // Traducciones en inglés
      help: 'Help',
      experience: 'The fastest shopping experience in the country',
      select_language: 'Select language',
      search_placeholder: 'What are you looking for this cycle?', // Clave para el placeholder
      account: 'Account', // Clave para la cuenta
      login: 'Log in', // Clave para iniciar sesión
      favorites: 'Favorites', // Clave para favoritos
      cart: 'Cart', // Clave para carrito
      home: 'Home', // Clave para "Home"
      products: 'Products', // Clave para "Products"
      categories: 'Categories', // Clave para "Categories"
      about: 'About Us', // Clave para "About Us"
      contact: 'Contact', // Clave para "Contact",
      view_catalog: 'View catalog', // Clave para "View catalog"
      
    }
  }
})

// Función principal que se exporta para usar en otros componentes
export const useLanguageStore = () => {
  // Función para establecer el idioma actual
  const setLanguage = (lang) => {
    state.currentLanguage = lang // Cambia el idioma actual al proporcionado
  }

  // Función para traducir una clave de texto al idioma actual
  const translate = (key) => {
    // Devuelve la traducción correspondiente o la clave original si no se encuentra
    return state.translations[state.currentLanguage][key] || key
  }

  // Función para traducir datos que pueden ser cadenas, objetos o arreglos
  const translateApiData = (data) => {
    if (!data) return data; // Si no hay datos, devuelve null o undefined
  
    // Manejar arreglos
    if (Array.isArray(data)) {
      return data.map(item => translateApiData(item)); // Aplica la traducción a cada elemento del arreglo
    }
  
    // Manejar objetos
    if (typeof data === 'object') {
      const translatedData = {}; // Objeto para almacenar los datos traducidos
      for (const key in data) {
        // Verifica si hay una traducción para la clave actual
        if (key === 'nombre') {
          translatedData[key] = state.translations[state.currentLanguage][data[key]] || data[key]; // Traduce el nombre
        } else {
          translatedData[key] = data[key]; // Mantiene el valor original para otras claves
        }
      }
      return translatedData; // Devuelve el objeto traducido
    }
  
    // Manejar cadenas
    if (typeof data === 'string') {
      return state.translations[state.currentLanguage][data] || data; // Devuelve la traducción de la cadena o la cadena original si no hay traducción
    }
  
    return data; // Devuelve el dato original si no es un arreglo, objeto o cadena
  };

  // Retorna el estado y las funciones para ser utilizadas en otros componentes
  return {
    currentLanguage: state.currentLanguage, // Idioma actual
    setLanguage, // Función para cambiar el idioma
    translate, // Función para traducir claves de texto
    translateApiData // Función para traducir datos de la API
  }
}

// Exporta el hook para su uso en otros componentes
export default useLanguageStore