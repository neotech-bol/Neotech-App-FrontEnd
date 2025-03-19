import { defineStore } from 'pinia'
import { ref, watch, onMounted } from 'vue'

const departmentThemes = {
  'la-paz': {
    primary: '#f8a812',
    hover: '#e69711'
  },
  'cochabamba': {
    primary: '#3B82F6',
    hover: '#2563eb'
  },
  // Other departments...
}

export const useThemeStore = defineStore('theme', () => {
  const initialDepartment = localStorage.getItem('departamento') || 'cochabamba'
  const currentDepartment = ref(initialDepartment)

  const setDepartment = (department) => {
    currentDepartment.value = department
    localStorage.setItem('departamento', department)
    applyTheme(department)
  }

  const applyTheme = (department) => {
    const theme = departmentThemes[department] || departmentThemes['cochabamba']
    
    document.documentElement.style.setProperty('--primary-color', theme.primary)
    document.documentElement.style.setProperty('--primary-hover-color', theme.hover)
    
    document.documentElement.className = ''
    document.documentElement.classList.add(`theme-${department}`)
  }

  // Apply theme when the store is initialized, but also ensure it's applied after DOM is ready
  if (typeof window !== 'undefined') {
    // Check if we're in browser environment
    setTimeout(() => {
      applyTheme(currentDepartment.value)
    }, 0)
  }

  watch(currentDepartment, (newDepartment) => {
    applyTheme(newDepartment)
  })

  return {
    currentDepartment,
    setDepartment,
    applyTheme
  }
})
