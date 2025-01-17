<script setup lang="ts">
import { ref } from 'vue'

const searchQuery = ref('')
const showMobileMenu = ref(false)

const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value
}

const stats = [
  {
    number: '2.4K',
    title: 'Clientes satisfechos',
    description: 'Miles de personas ya confían en nosotros para sus compras internacionales.'
  },
  {
    number: '$3.2M',
    title: 'en ventas realizadas',
    description: 'Más de 3 millones de dólares en ventas que reflejan nuestra calidad y compromiso'
  },
  {
    number: '15K+',
    title: 'Productos vendidos',
    description: 'Cada producto vendido es una solución confiable para nuestros clientes.'
  },
  {
    number: '1.2K+',
    title: 'Productos en catálogo',
    description: 'Encuentra una amplia variedad de productos exclusivos en cada ciclo.'
  }
]

const teamMembers = [
  {
    image: 'https://placehold.co/400x400',
    name: 'John Doe',
    position: 'CEO'
  },
  {
    image: 'https://placehold.co/400x400',
    name: 'Jane Smith',
    position: 'Sales Manager'
  },
  {
    image: 'https://placehold.co/400x400',
    name: 'Robert Johnson',
    position: 'Operations Director'
  },
  {
    image: 'https://placehold.co/400x400',
    name: 'Maria Garcia',
    position: 'Customer Support'
  },
  {
    image: 'https://placehold.co/400x400',
    name: 'David Wilson',
    position: 'Technical Lead'
  }
]
</script>

<template>
  <header>
    <!-- Previous header code remains unchanged -->
  </header>

  <main>
    <!-- Statistics Section -->
    <section class="stats-section">
      <div class="stats-container">
        <div v-for="stat in stats" :key="stat.number" class="stat-card">
          <h2 class="stat-number">{{ stat.number }}</h2>
          <h3 class="stat-title">{{ stat.title }}</h3>
          <p class="stat-description">{{ stat.description }}</p>
        </div>
      </div>
    </section>

    <!-- Team Section -->
    <section class="team-section">
      <div class="team-container">
        <div class="team-header">
          <h2>Nuestro <span class="highlight">Equipo</span></h2>
          <p>El corazón detrás de NeoTech, trabajando para ti.</p>
        </div>
        <div class="team-grid">
          <div v-for="member in teamMembers" :key="member.name" class="team-member">
            <div class="member-image">
              <img :src="member.image" :alt="member.name">
            </div>
            <div class="member-info">
              <h3>{{ member.name }}</h3>
              <p>{{ member.position }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
/* Previous header styles remain unchanged */

/* Main Content Styles */
main {
  padding: 40px 20px;
}

/* Statistics Section */
.stats-section {
  margin-bottom: 60px;
}

.stats-container {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  padding: 20px;
}

.stat-card {
  background: #fff;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
  transition: transform 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-number {
  font-size: 2.5rem;
  font-weight: 700;
  color: #007bff;
  margin-bottom: 8px;
}

.stat-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
}

.stat-description {
  font-size: 0.9rem;
  color: #666;
  line-height: 1.5;
}

/* Team Section */
.team-section {
  padding: 60px 0;
}

.team-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.team-header {
  text-align: center;
  margin-bottom: 40px;
}

.team-header h2 {
  font-size: 2rem;
  color: #333;
  margin-bottom: 12px;
}

.highlight {
  color: #007bff;
}

.team-header p {
  color: #666;
  font-size: 1.1rem;
}

.team-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 24px;
}

.team-member {
  text-align: center;
}

.member-image {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.member-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.team-member:hover .member-image img {
  transform: scale(1.05);
}

.member-info h3 {
  font-size: 1.1rem;
  color: #333;
  margin-bottom: 4px;
}

.member-info p {
  font-size: 0.9rem;
  color: #666;
}

/* Responsive Styles */
@media (max-width: 1024px) {
  .stats-container {
    grid-template-columns: repeat(2, 1fr);
  }

  .team-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .team-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .stats-container {
    grid-template-columns: 1fr;
  }

  .team-grid {
    grid-template-columns: 1fr;
    max-width: 300px;
    margin: 0 auto;
  }

  .stat-number {
    font-size: 2rem;
  }

  .team-header h2 {
    font-size: 1.75rem;
  }
}
</style>