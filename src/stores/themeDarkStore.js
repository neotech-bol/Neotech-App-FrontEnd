import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

/**
 * Configuración de colores para modos claro y oscuro
 * Define los colores base para cada modo
 */
const themes = {
  light: {
    primary: '#3B82F6',
    hover: '#2563eb',
    background: '#ffffff',
    text: '#333333',
    surface: '#f5f5f5',
    border: '#e5e7eb'
  },
  dark: {
    primary: '#3B82F6',
    hover: '#2563eb',
    background: '#121212',
    text: '#f5f5f5',
    surface: '#242424',
    border: '#4b5563'
  }
}

/**
 * Store de Pinia para gestionar el modo oscuro/claro de la aplicación
 * Siempre inicia con el tema claro por defecto
 */
export const useThemeStoreDark = defineStore('themeDark', () => {
  // Siempre inicializa con el tema claro (light)
  const isDarkMode = ref(false)
  
  /**
   * Función para alternar entre modo claro y oscuro
   * Cambia el estado, guarda la preferencia y aplica el tema
   */
  const toggleDarkMode = () => {
    isDarkMode.value = !isDarkMode.value
    localStorage.setItem('darkMode', isDarkMode.value.toString())
    applyTheme()
  }
  
  /**
   * Función para establecer explícitamente el modo oscuro
   * @param {boolean} value - true para activar modo oscuro, false para desactivarlo
   */
  const setDarkMode = (value) => {
    isDarkMode.value = value
    localStorage.setItem('darkMode', value.toString())
    applyTheme()
  }
  
  /**
   * Aplica el tema según el modo actual (claro u oscuro)
   * Establece variables CSS y clases en el documento
   */
  const applyTheme = () => {
    // Selecciona el tema según el modo actual
    const theme = isDarkMode.value ? themes.dark : themes.light
    
    // Establece variables CSS para el tema
    document.documentElement.style.setProperty('--primary-color', theme.primary)
    document.documentElement.style.setProperty('--primary-hover-color', theme.hover)
    document.documentElement.style.setProperty('--background-color', theme.background)
    document.documentElement.style.setProperty('--text-color', theme.text)
    document.documentElement.style.setProperty('--surface-color', theme.surface)
    document.documentElement.style.setProperty('--border-color', theme.border)
    
    // Actualiza las clases del elemento raíz
    if (isDarkMode.value) {
      document.documentElement.classList.add('dark-mode')
      document.documentElement.classList.remove('light-mode')
    } else {
      document.documentElement.classList.add('light-mode')
      document.documentElement.classList.remove('dark-mode')
    }
  }
  
  // Aplica el tema claro al inicializar el store
  applyTheme()
  
  // Observa cambios en el modo oscuro y actualiza el tema
  watch(isDarkMode, () => {
    applyTheme()
  })
  
  // Recupera la preferencia guardada después de la carga inicial
  // Esto permite que el usuario mantenga su preferencia en sesiones futuras
  // después de cambiar manualmente el tema
  const loadSavedPreference = () => {
    const savedMode = localStorage.getItem('darkMode')
    if (savedMode !== null) {
      isDarkMode.value = savedMode === 'true'
      applyTheme()
    }
  }
  
  // Expone estado y métodos para ser utilizados fuera del store
  return {
    isDarkMode,
    toggleDarkMode,
    setDarkMode,
    loadSavedPreference
  }
})