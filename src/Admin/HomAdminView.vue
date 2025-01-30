<template>
    <div class="container">
      <div class="row">
        <div class="col-12 col-md-4">
          <Doughnut :data="chartData" :options="chartOptions" />
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
  import { Doughnut } from 'vue-chartjs';
  
  // Registrar los elementos de Chart.js
  ChartJS.register(ArcElement, Tooltip, Legend);
  
  // Definir datos reactivos
  const chartData = ref({
    labels: ['Users Active', 'Users Inactive'],
    datasets: [
      {
        backgroundColor: ['#41B883', '#DD1B16'],
        data: [40, 10]
      }
    ]
  });
  
  const chartOptions = ref({
    responsive: true,
    maintainAspectRatio: false
  });
  </script>
  
  <style>
  /* Puedes agregar estilos aquí si es necesario */
  </style>