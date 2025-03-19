<script setup>
import { inject, onMounted, ref, watchEffect, computed } from 'vue'

const searchQuery = ref('')
const showMobileMenu = ref(false)
const activeStatIndex = ref(null)
const activeMemberIndex = ref(null)
const isIntersecting = ref({
  stats: false,
  team: false
})
const isMobile = ref(false)
const isTablet = ref(false)
const currentTeamPage = ref(0)
const touchStartX = ref(0)
const touchEndX = ref(0)

// Check device type
const checkDeviceType = () => {
  isMobile.value = window.innerWidth <= 640
  isTablet.value = window.innerWidth > 640 && window.innerWidth <= 1024
}

const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value
}

// Stats with animated counters
const stats = [
  {
    number: '2.4K',
    rawNumber: 2400,
    title: 'Clientes satisfechos',
    description: 'Miles de personas ya confían en nosotros para sus compras internacionales.',
    icon: 'users',
    color: 'var(--primary-color)'
  },
  {
    number: '$3.2M',
    rawNumber: 3200000,
    title: 'en ventas realizadas',
    description: 'Más de 3 millones de dólares en ventas que reflejan nuestra calidad y compromiso',
    icon: 'dollar-sign',
    color: '#10b981'
  },
  {
    number: '15K+',
    rawNumber: 15000,
    title: 'Productos vendidos',
    description: 'Cada producto vendido es una solución confiable para nuestros clientes.',
    icon: 'package',
    color: '#8b5cf6'
  },
  {
    number: '1.2K+',
    rawNumber: 1200,
    title: 'Productos en catálogo',
    description: 'Encuentra una amplia variedad de productos exclusivos en cada ciclo.',
    icon: 'shopping-bag',
    color: '#f59e0b'
  }
]

// Enhanced team members with roles and social media
const teamMembers = [
  {
    image: 'https://placehold.co/400x400',
    name: 'John Doe',
    position: 'CEO & Fundador',
    bio: 'Visionario con más de 10 años de experiencia en comercio internacional.',
    social: {
      linkedin: '#',
      twitter: '#',
      email: 'john@neotech.com'
    }
  },
  {
    image: 'https://placehold.co/400x400',
    name: 'Jane Smith',
    position: 'Gerente de Ventas',
    bio: 'Especialista en desarrollo de estrategias comerciales y atención al cliente.',
    social: {
      linkedin: '#',
      twitter: '#',
      email: 'jane@neotech.com'
    }
  },
  {
    image: 'https://placehold.co/400x400',
    name: 'Robert Johnson',
    position: 'Director de Operaciones',
    bio: 'Experto en logística internacional y gestión de la cadena de suministro.',
    social: {
      linkedin: '#',
      twitter: '#',
      email: 'robert@neotech.com'
    }
  },
  {
    image: 'https://placehold.co/400x400',
    name: 'Maria Garcia',
    position: 'Soporte al Cliente',
    bio: 'Dedicada a garantizar la mejor experiencia para todos nuestros clientes.',
    social: {
      linkedin: '#',
      twitter: '#',
      email: 'maria@neotech.com'
    }
  },
  {
    image: 'https://placehold.co/400x400',
    name: 'David Wilson',
    position: 'Líder Técnico',
    bio: 'Innovador tecnológico que mantiene nuestra plataforma a la vanguardia.',
    social: {
      linkedin: '#',
      twitter: '#',
      email: 'david@neotech.com'
    }
  }
]

// Computed properties for pagination
const totalPages = computed(() => {
  if (isMobile.value) {
    return Math.ceil(teamMembers.length / 1)
  } else if (isTablet.value) {
    return Math.ceil(teamMembers.length / 2)
  } else {
    return Math.ceil(teamMembers.length / 5)
  }
})

const visibleTeamMembers = computed(() => {
  const itemsPerPage = isMobile.value ? 1 : isTablet.value ? 2 : 5
  const start = currentTeamPage.value * itemsPerPage
  return teamMembers.slice(start, start + itemsPerPage)
})

// Methods for team carousel
const nextTeamPage = () => {
  if (currentTeamPage.value < totalPages.value - 1) {
    currentTeamPage.value++
  } else {
    currentTeamPage.value = 0 // Loop back to first page
  }
}

const prevTeamPage = () => {
  if (currentTeamPage.value > 0) {
    currentTeamPage.value--
  } else {
    currentTeamPage.value = totalPages.value - 1 // Loop to last page
  }
}

const goToTeamPage = (page) => {
  currentTeamPage.value = page
}

// Touch events for swiping
const handleTouchStart = (e) => {
  touchStartX.value = e.touches[0].clientX
}

const handleTouchMove = (e) => {
  touchEndX.value = e.touches[0].clientX
}

const handleTouchEnd = () => {
  const minSwipeDistance = 50
  const swipeDistance = touchStartX.value - touchEndX.value
  
  if (Math.abs(swipeDistance) > minSwipeDistance) {
    if (swipeDistance > 0) {
      // Swiped left
      nextTeamPage()
    } else {
      // Swiped right
      prevTeamPage()
    }
  }
}

// Animation for stats when they come into view
const setupIntersectionObserver = () => {
  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        isIntersecting.value.stats = true
        statsObserver.unobserve(entry.target)
      }
    })
  }, { threshold: 0.2 })

  const teamObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        isIntersecting.value.team = true
        teamObserver.unobserve(entry.target)
      }
    })
  }, { threshold: 0.2 })

  // Observe sections
  setTimeout(() => {
    const statsSection = document.querySelector('.stats-section')
    const teamSection = document.querySelector('.team-section')
    
    if (statsSection) statsObserver.observe(statsSection)
    if (teamSection) teamObserver.observe(teamSection)
  }, 100)
}

// Lifecycle hooks
onMounted(() => {
  checkDeviceType()
  window.addEventListener('resize', checkDeviceType)
  setupIntersectionObserver()
})
</script>

<template>
  <main>
    <!-- Statistics Section -->
    <section class="stats-section" :class="{ 'animate': isIntersecting.stats }">
      <div class="section-header">
        <h2>Nuestros <span class="highlight">Números</span></h2>
        <p>Resultados que hablan por sí mismos</p>
      </div>
      
      <!-- Mobile Stats Carousel -->
      <div v-if="isMobile" class="stats-carousel">
        <div class="carousel-container" 
             @touchstart="handleTouchStart" 
             @touchmove="handleTouchMove" 
             @touchend="handleTouchEnd">
          <div v-for="(stat, index) in stats" 
               :key="`mobile-${stat.number}`" 
               class="stat-card mobile"
               :class="{ 'active': activeStatIndex === index }"
               @click="activeStatIndex = activeStatIndex === index ? null : index">
            <div class="stat-icon" :style="{ backgroundColor: stat.color + '15' }">
              <svg v-if="stat.icon === 'users'" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" :style="{ color: stat.color }">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              <svg v-else-if="stat.icon === 'dollar-sign'" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" :style="{ color: stat.color }">
                <line x1="12" y1="1" x2="12" y2="23"></line>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
              <svg v-else-if="stat.icon === 'package'" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" :style="{ color: stat.color }">
                <line x1="16.5" y1="9.4" x2="7.5" y2="4.21"></line>
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                <line x1="12" y1="22.08" x2="12" y2="12"></line>
              </svg>
              <svg v-else-if="stat.icon === 'shopping-bag'" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" :style="{ color: stat.color }">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
              </svg>
            </div>
            <h2 class="stat-number">{{ stat.number }}</h2>
            <h3 class="stat-title">{{ stat.title }}</h3>
            <p class="stat-description">{{ stat.description }}</p>
          </div>
        </div>
        
        <!-- Mobile Indicators -->
        <div class="carousel-indicators">
          <button v-for="(stat, index) in stats" 
                  :key="`indicator-${index}`"
                  :class="['indicator', { active: activeStatIndex === index }]"
                  @click="activeStatIndex = index"
                  :aria-label="`Ver estadística ${index + 1}`"></button>
        </div>
      </div>
      
      <!-- Desktop/Tablet Stats Grid -->
      <div v-else class="stats-container">
        <div v-for="(stat, index) in stats" 
             :key="`desktop-${stat.number}`" 
             class="stat-card"
             :class="{ 'active': activeStatIndex === index }"
             @mouseenter="activeStatIndex = index"
             @mouseleave="activeStatIndex = null">
          <div class="stat-icon" :style="{ backgroundColor: stat.color + '15' }">
            <svg v-if="stat.icon === 'users'" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" :style="{ color: stat.color }">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            <svg v-else-if="stat.icon === 'dollar-sign'" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" :style="{ color: stat.color }">
              <line x1="12" y1="1" x2="12" y2="23"></line>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
            <svg v-else-if="stat.icon === 'package'" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" :style="{ color: stat.color }">
              <line x1="16.5" y1="9.4" x2="7.5" y2="4.21"></line>
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
              <line x1="12" y1="22.08" x2="12" y2="12"></line>
            </svg>
            <svg v-else-if="stat.icon === 'shopping-bag'" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" :style="{ color: stat.color }">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
          </div>
          <h2 class="stat-number">{{ stat.number }}</h2>
          <h3 class="stat-title">{{ stat.title }}</h3>
          <p class="stat-description">{{ stat.description }}</p>
        </div>
      </div>
    </section>

    <!-- Team Section -->
    <section class="team-section" :class="{ 'animate': isIntersecting.team }">
      <div class="team-container">
        <div class="team-header">
          <h2>Nuestro <span class="highlight">Equipo</span></h2>
          <p>El corazón detrás de NeoTech, trabajando para ti.</p>
        </div>
        
        <!-- Team Carousel -->
        <div class="team-carousel" 
             @touchstart="handleTouchStart" 
             @touchmove="handleTouchMove" 
             @touchend="handleTouchEnd">
          
          <!-- Navigation Arrows -->
          <button v-if="totalPages > 1" class="nav-arrow prev" @click="prevTeamPage" aria-label="Equipo anterior">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
          
          <div class="team-grid" :style="{ transform: `translateX(-${currentTeamPage * 100}%)` }">
            <div v-for="(member, index) in teamMembers" 
                 :key="member.name" 
                 class="team-member"
                 :class="{ 'active': activeMemberIndex === index, 'visible': visibleTeamMembers.includes(member) }"
                 @mouseenter="activeMemberIndex = index"
                 @mouseleave="activeMemberIndex = null"
                 @click="isMobile ? (activeMemberIndex = activeMemberIndex === index ? null : index) : null">
              <div class="member-image">
                <img :src="member.image" :alt="member.name">
                <div class="member-overlay">
                  <p class="member-bio">{{ member.bio }}</p>
                  <div class="member-social">
                    <a :href="member.social.linkedin" aria-label="LinkedIn" title="LinkedIn">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                        <rect x="2" y="9" width="4" height="12"></rect>
                        <circle cx="4" cy="4" r="2"></circle>
                      </svg>
                    </a>
                    <a :href="member.social.twitter" aria-label="Twitter" title="Twitter">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
                      </svg>
                    </a>
                    <a :href="`mailto:${member.social.email}`" aria-label="Email" title="Email">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                        <polyline points="22,6 12,13 2,6"></polyline>
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
              <div class="member-info">
                <h3>{{ member.name }}</h3>
                <p>{{ member.position }}</p>
              </div>
            </div>
          </div>
          
          <button v-if="totalPages > 1" class="nav-arrow next" @click="nextTeamPage" aria-label="Equipo siguiente">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>
        
        <!-- Pagination Indicators -->
        <div v-if="totalPages > 1" class="pagination-indicators">
          <button v-for="page in totalPages" 
                  :key="`page-${page}`"
                  :class="['page-indicator', { active: currentTeamPage === page - 1 }]"
                  @click="goToTeamPage(page - 1)"
                  :aria-label="`Página ${page} de equipo`"></button>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>

/* Main Content Styles */
main {
  padding: 40px 20px;
}

/* Section Header Styles */
.section-header {
  text-align: center;
  margin-bottom: 40px;
}

.section-header h2 {
  font-size: 2.5rem;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 12px;
  position: relative;
  display: inline-block;
}

.section-header h2::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  height: 4px;
  background-color: var(--primary-color);
  border-radius: 2px;
}

.highlight {
  color: var(--primary-color);
}

.section-header p {
  color: var(--text-secondary);
  font-size: 1.1rem;
  max-width: 600px;
  margin: 0 auto;
}

/* Statistics Section */
.stats-section {
  margin-bottom: 80px;
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.8s ease, transform 0.8s ease;
}

.stats-section.animate {
  opacity: 1;
  transform: translateY(0);
}

.stats-container {
  max-width: 1440px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  padding: 20px;
}

.stat-card {
  background: var(--card-bg);
  padding: 30px;
  border-radius: 12px;
  box-shadow: var(--card-shadow);
  text-align: center;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 0;
  background: var(--primary-color);
  transition: height 0.3s ease;
}

.stat-card.active::before {
  height: 100%;
}

.stat-card:hover, .stat-card.active {
  transform: translateY(-8px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  transition: transform 0.3s ease;
}

.stat-card:hover .stat-icon, .stat-card.active .stat-icon {
  transform: scale(1.1);
}

.stat-number {
  font-size: 2.5rem;
  font-weight: 800;
  color: var(--primary-color);
  margin-bottom: 12px;
  transition: transform 0.3s ease;
}

.stat-card:hover .stat-number, .stat-card.active .stat-number {
  transform: scale(1.05);
}

.stat-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 12px;
}

.stat-description {
  font-size: 0.95rem;
  color: var(--text-secondary);
  line-height: 1.6;
}

/* Mobile Stats Carousel */
.stats-carousel {
  max-width: 100%;
  margin: 0 auto;
  position: relative;
  padding: 0 20px;
}

.carousel-container {
  display: flex;
  overflow-x: hidden;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  scroll-behavior: smooth;
}

.stat-card.mobile {
  flex: 0 0 100%;
  scroll-snap-align: center;
  min-height: 300px;
  padding: 30px 20px;
  margin: 0 auto;
  max-width: 340px;
}

.carousel-indicators {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 20px;
}

.indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #ddd;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.indicator.active {
  background: var(--primary-color);
  transform: scale(1.2);
}

/* Team Section */
.team-section {
  padding: 60px 0;
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.8s ease, transform 0.8s ease;
}

.team-section.animate {
  opacity: 1;
  transform: translateY(0);
}

.team-container {
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 20px;
}

.team-header {
  text-align: center;
  margin-bottom: 50px;
}

.team-header h2 {
  font-size: 2.5rem;
  color: var(--text-primary);
  margin-bottom: 12px;
  font-weight: 800;
  position: relative;
  display: inline-block;
}

.team-header h2::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  height: 4px;
  background-color: var(--primary-color);
  border-radius: 2px;
}

.team-header p {
  color: var(--text-secondary);
  font-size: 1.1rem;
  max-width: 600px;
  margin: 0 auto;
}

/* Team Carousel */
.team-carousel {
  position: relative;
  overflow: hidden;
  padding: 0 40px;
}

.team-grid {
  display: flex;
  transition: transform 0.5s ease;
}

.team-member {
  flex: 0 0 20%;
  padding: 0 12px;
  text-align: center;
  transition: all 0.3s ease;
  opacity: 0.7;
  transform: scale(0.95);
}

.team-member.visible {
  opacity: 1;
  transform: scale(1);
}

.team-member.active {
  transform: translateY(-8px);
}

.member-image {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 16px;
  box-shadow: var(--card-shadow);
  position: relative;
}

.member-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.team-member:hover .member-image img, .team-member.active .member-image img {
  transform: scale(1.08);
}

.member-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 20px;
  opacity: 0;
  transition: opacity 0.3s ease;
  color: white;
}

.team-member:hover .member-overlay, .team-member.active .member-overlay {
  opacity: 1;
}

.member-bio {
  font-size: 0.9rem;
  line-height: 1.6;
  margin-bottom: 15px;
}

.member-social {
  display: flex;
  gap: 15px;
}

.member-social a {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  transition: all 0.3s ease;
}

.member-social a:hover {
  background: var(--primary-color);
  transform: translateY(-3px);
}

.member-info {
  padding: 0 10px;
}

.member-info h3 {
  font-size: 1.2rem;
  color: var(--text-primary);
  margin-bottom: 6px;
  font-weight: 600;
  transition: color 0.3s ease;
}

.team-member:hover .member-info h3, .team-member.active .member-info h3 {
  color: var(--primary-color);
}

.member-info p {
  font-size: 0.95rem;
  color: var(--text-secondary);
}

/* Navigation Arrows */
.nav-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  color: var(--text-primary);
  transition: all 0.3s ease;
}

.nav-arrow:hover {
  background: var(--primary-color);
  color: white;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
}

.nav-arrow.prev {
  left: 0;
}

.nav-arrow.next {
  right: 0;
}

/* Pagination Indicators */
.pagination-indicators {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 30px;
}

.page-indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #ddd;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.page-indicator.active {
  background: var(--primary-color);
  transform: scale(1.2);
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { 
    opacity: 0;
    transform: translateY(30px);
  }
  to { 
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive Styles */
@media (max-width: 1200px) {
  .stats-container {
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }
  
  .team-member {
    flex: 0 0 25%;
  }
  
  .section-header h2, .team-header h2 {
    font-size: 2.2rem;
  }
}

@media (max-width: 1024px) {
  .team-member {
    flex: 0 0 50%;
  }
  
  .stat-number {
    font-size: 2.2rem;
  }
  
  .section-header h2, .team-header h2 {
    font-size: 2rem;
  }
}

@media (max-width: 768px) {
  .stats-container {
    grid-template-columns: 1fr;
    max-width: 400px;
    margin: 0 auto;
  }
  
  .team-member {
    flex: 0 0 100%;
    max-width: 320px;
    margin: 0 auto;
  }
  
  .section-header h2, .team-header h2 {
    font-size: 1.8rem;
  }
  
  .section-header p, .team-header p {
    font-size: 1rem;
  }
  
  .stat-card {
    padding: 25px 20px;
  }
  
  .stat-icon {
    width: 50px;
    height: 50px;
  }
  
  .member-overlay {
    opacity: 1;
    background: rgba(0, 0, 0, 0.6);
  }
}

@media (max-width: 640px) {
  .stats-section, .team-section {
    margin-bottom: 60px;
  }
  
  .section-header h2, .team-header h2 {
    font-size: 1.6rem;
  }
  
  .section-header h2::after, .team-header h2::after {
    width: 60px;
    height: 3px;
  }
  
  .stat-number {
    font-size: 2rem;
  }
  
  .stat-title {
    font-size: 1.1rem;
  }
  
  .stat-description {
    font-size: 0.9rem;
  }
  
  .member-info h3 {
    font-size: 1.1rem;
  }
  
  .member-info p {
    font-size: 0.9rem;
  }
  
  .member-bio {
    font-size: 0.85rem;
  }
  
  .member-social a {
    width: 32px;
    height: 32px;
  }
  
  .nav-arrow {
    width: 36px;
    height: 36px;
  }
}

@media (max-width: 480px) {
  main {
    padding: 30px 15px;
  }
  
  .section-header, .team-header {
    margin-bottom: 30px;
  }
  
  .section-header h2, .team-header h2 {
    font-size: 1.5rem;
  }
  
  .stat-card.mobile {
    min-height: 260px;
  }
  
  .stat-icon {
    width: 45px;
    height: 45px;
    margin-bottom: 15px;
  }
  
  .stat-number {
    font-size: 1.8rem;
    margin-bottom: 8px;
  }
  
  .team-carousel {
    padding: 0 30px;
  }
  
  .member-overlay {
    padding: 15px;
  }
}

/* Touch device optimizations */
@media (hover: none) {
  .member-overlay {
    opacity: 1;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.4), transparent);
    justify-content: flex-end;
  }
  
  .member-bio {
    display: none;
  }
  
  .member-social {
    margin-bottom: 10px;
  }
  
  .stat-card:active {
    transform: scale(0.98);
  }
  
  .nav-arrow:active {
    transform: translateY(-50%) scale(0.95);
  }
}

/* Accessibility Improvements */
@media (prefers-reduced-motion: reduce) {
  .stats-section,
  .team-section,
  .stat-card,
  .team-member,
  .member-image img,
  .member-overlay,
  .nav-arrow,
  .team-grid {
    transition: none;
    animation: none;
  }
  
  .stats-section,
  .team-section {
    opacity: 1;
    transform: none;
  }
}
</style>