import { userAutenticado } from '@/Services/UsuarioService'
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'


export const useUserStore = defineStore('user', () => {
  const user = ref({
    departamento: 'cochabamba'
  })

  // Function to list user globally
  const listarUserGlobal = async () => {
    try {
      const { data } = await userAutenticado()
      user.value = data.datos
      console.log('User data loaded:', user.value)
      return data.datos // Return the data for chaining
    } catch (error) {
      console.error('Error loading user data:', error)
      return null
    }
  }

  // Computed to check if user is authenticated
  const isAuthenticated = computed(() => !!user.value.id)

  // Function to handle login redirect
  const handleLoginRedirect = (router, redirectPath) => {
    // If there's a specific redirect path, use it
    if (redirectPath) {
      router.replace(redirectPath)
    } 
    // Otherwise, check user role and redirect accordingly
    else if (user.value.rol === 'super-admin') {
      router.replace('/admin-panel')
    } else {
      router.replace('/')
    }
  }

  return { 
    user, 
    listarUserGlobal, 
    isAuthenticated,
    handleLoginRedirect
  }
})