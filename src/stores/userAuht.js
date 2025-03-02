import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
  const user = ref({
    departamento: 'cochabamba'
  })

  // Function to list user globally
  const listarUserGlobal = async () => {
    try {
      // Uncomment when you have the userAutenticado function
       const { data } = await userAutenticado()
      user.value = data.datos
      console.log(user.value)
    } catch (error) {
      console.log(error)
    }
  }

  // Computed to check if user is authenticated
  const isAuthenticated = computed(() => !!user.value.id)

  return { user, listarUserGlobal, isAuthenticated }
})