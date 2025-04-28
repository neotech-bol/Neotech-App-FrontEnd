<template>
    <div
        class="whatsapp-bubble"
        :style="{ top: `${positionY}px`, left: `${positionX}px` }"
        @mousedown="startDragging"
        @touchstart="startDragging"
    >
        <a :href="whatsappLink" target="_blank" aria-label="Contact us on WhatsApp" class="bubble-link">
            <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp Icon" />
            <span class="tooltip">¡Chatea con nosotras!</span>
        </a>
    </div>
</template>

<script setup>
import { ref } from 'vue'

const whatsappNumber = ref('60792059')
const whatsappLink = ref(`https://wa.me/+591${whatsappNumber.value}`)

// Reactive properties for bubble position
const positionX = ref(window.innerWidth - 65) // Initial right: 5px (60px width + 5px margin)
const positionY = ref(window.innerHeight - 120) // Initial bottom: 60px (60px height + 60px margin)

// Dragging state
const isDragging = ref(false)
const dragOffset = ref({ x: 0, y: 0 })

const startDragging = (event) => {
    event.preventDefault()
    isDragging.value = true
    
    // Get initial touch or mouse position
    const clientX = event.type === 'touchstart' ? event.touches[0].clientX : event.clientX
    const clientY = event.type === 'touchstart' ? event.touches[0].clientY : event.clientY
    
    // Calculate offset from bubble's top-left corner
    dragOffset.value = {
        x: clientX - positionX.value,
        y: clientY - positionY.value
    }

    // Add event listeners for dragging
    window.addEventListener('mousemove', drag)
    window.addEventListener('touchmove', drag)
    window.addEventListener('mouseup', stopDragging)
    window.addEventListener('touchend', stopDragging)
}

const drag = (event) => {
    if (!isDragging.value) return
    
    // Get current touch or mouse position
    const clientX = event.type === 'touchmove' ? event.touches[0].clientX : event.clientX
    const clientY = event.type === 'touchmove' ? event.touches[0].clientY : event.clientY
    
    // Calculate new position
    let newX = clientX - dragOffset.value.x
    let newY = clientY - dragOffset.value.y
    
    // Keep bubble within viewport boundaries
    newX = Math.max(0, Math.min(newX, window.innerWidth - 60)) // 60px is bubble width
    newY = Math.max(0, Math.min(newY, window.innerHeight - 60)) // 60px is bubble height
    
    positionX.value = newX
    positionY.value = newY
}

const stopDragging = () => {
    isDragging.value = false
    // Remove event listeners
    window.removeEventListener('mousemove', drag)
    window.removeEventListener('touchmove', drag)
    window.removeEventListener('mouseup', stopDragging)
    window.removeEventListener('touchend', stopDragging)
}
</script>

<style scoped>
.whatsapp-bubble {
    position: fixed;
    z-index: 1000;
    cursor: move; /* Indicate draggability */
    user-select: none; /* Prevent text selection while dragging */
}

.bubble-link {
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
}

.whatsapp-bubble img {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    animation: pulse 2s infinite ease-in-out;
}

.whatsapp-bubble img:hover {
    transform: scale(1.15);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.25);
}

.tooltip {
    position: absolute;
    left: -120px; /* Adjusted to appear left of the bubble */
    background-color: #25d366;
    color: white;
    padding: 6px 12px;
    border-radius: 12px;
    font-size: 14px;
    white-space: nowrap;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.3s ease, visibility 0.3s ease;
    pointer-events: none;
}

.bubble-link:hover .tooltip {
    opacity: 1;
    visibility: visible;
}

@keyframes pulse {
    0% {
        transform: scale(1);
    }
    50% {
        transform: scale(1.05);
    }
    100% {
        transform: scale(1);
    }
}
</style>