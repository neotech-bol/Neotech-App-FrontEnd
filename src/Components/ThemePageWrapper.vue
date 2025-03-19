<template>
    <div :class="`theme-${currentDepartment}`">
        <slot></slot>
    </div>
</template>

<script setup>
import { onMounted, computed, watch } from 'vue';
import { useThemeStore } from '@/stores/themeStore';
import { useThemeStoreDark } from '@/stores/themeDarkStore';

const themeStore = useThemeStore();
const themeStoreDark = useThemeStoreDark();

const currentDepartment = computed(() => themeStore.currentDepartment);

const applyThemesOnPage = () => {
    document.documentElement.classList.forEach(className => {
        if (className.startsWith('theme-')) {
            document.documentElement.classList.remove(className);
        }
    });
    document.documentElement.classList.add(`theme-${currentDepartment.value}`);
    
    if (themeStoreDark.isDarkMode) {
        document.documentElement.classList.add('dark-mode');
        document.documentElement.classList.remove('light-mode');
    } else {
        document.documentElement.classList.add('light-mode');
        document.documentElement.classList.remove('dark-mode');
    }
};

onMounted(() => {
    applyThemesOnPage();
    setTimeout(() => {
        applyThemesOnPage();
    }, 0);
});

watch(() => themeStore.currentDepartment, () => {
    applyThemesOnPage();
});

watch(() => themeStoreDark.isDarkMode, () => {
    applyThemesOnPage();
});
</script>