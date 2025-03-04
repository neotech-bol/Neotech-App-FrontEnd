import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

// Define los colores de cada departamento
const departmentThemes = {
  'la-paz': {
    primary: '#f8a812',
    hover: '#e69711'
  },
  'cochabamba': {
    primary: '#3B82F6',
    hover: '#2563eb'
  },
/*   'santa-cruz': {
    primary: '#10b981',
    hover: '#059669'
  },
  'tarija': {
    primary: '#8b5cf6',
    hover: '#7c3aed'
  },
  'potosi': {
    primary: '#ef4444',
    hover: '#dc2626'
  },
  'oruro': {
    primary: '#f59e0b',
    hover: '#d97706'
  },
  'beni': {
    primary: '#6366f1',
    hover: '#4f46e5'
  },
  'pando': {
    primary: '#ec4899',
    hover: '#db2777'
  },
  'chuquisaca': {
    primary: '#14b8a6',
    hover: '#0d9488'
  },
  'el-beni': {
    primary: '#6366f1',
    hover: '#4f46e5'
  } */
}

export const useThemeStore = defineStore('theme', () => {
  // Get initial department from localStorage or default to 'cochabamba'
  const initialDepartment = localStorage.getItem('departamento') || 'cochabamba'

  // Create reactive state
  const currentDepartment = ref(initialDepartment)

  // Function to update the department and apply theme
  const setDepartment = (department) => {
    currentDepartment.value = department
    localStorage.setItem('departamento', department)
    applyTheme(department)
  }
 // Function to apply CSS variables based on department
 const applyTheme = (department) => {
  const theme = departmentThemes[department] || departmentThemes['cochabamba']
  document.documentElement.style.setProperty('--primary-color', theme.primary)
  document.documentElement.style.setProperty('--primary-hover-color', theme.hover)
  
  // Add theme class to document root element
  document.documentElement.className = ''
  document.documentElement.classList.add(`theme-${department}`)
}


  // Apply theme on store initialization
  applyTheme(currentDepartment.value)

  // Watch for changes to currentDepartment and update theme
  watch(currentDepartment, (newDepartment) => {
    applyTheme(newDepartment)
  })

  return {
    currentDepartment,
    setDepartment,
    applyTheme
  }
})