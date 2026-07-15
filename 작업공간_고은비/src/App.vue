<template>
  <div class="app-shell">
    <header class="app-header">
      <div class="header-inner">
        <RouterLink to="/" class="logo-link">
          <img src="/logo.png" alt="가야Ging" class="logo-image" />
          <div class="logo-text">
            <strong>가야</strong><span>Ging</span>
          </div>
        </RouterLink>
        <nav class="menu-links">
          <RouterLink v-for="item in topMenu" :key="item.label" :to="item.to" class="menu-link" :class="{ active: item.active }">
            {{ item.label }}
          </RouterLink>
          <button class="menu-link weather-button" @click="isWeatherOpen = true">🌤️ 날씨</button>
        </nav>
      </div>
    </header>

    <WeatherModal :visible="isWeatherOpen" @close="isWeatherOpen = false" />

    <main class="main-content">
      <RouterView />
    </main>

    <ChatbotWidget />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import ChatbotWidget from './components/ChatbotWidget.vue';
import WeatherModal from './components/WeatherModal.vue';

const route = useRoute();
const isWeatherOpen = ref(false);

const topMenu = computed(() => [
  { label: '관광지', to: '/board/관광지', active: route.params.category === '관광지' && route.name === 'board-list' },
  { label: '레포츠', to: '/board/레포츠', active: route.params.category === '레포츠' && route.name === 'board-list' },
  { label: '문화시설', to: '/board/문화시설', active: route.params.category === '문화시설' && route.name === 'board-list' },
  { label: '쇼핑', to: '/board/쇼핑', active: route.params.category === '쇼핑' && route.name === 'board-list' },
  { label: '숙박', to: '/board/숙박', active: route.params.category === '숙박' && route.name === 'board-list' },
  { label: '여행코스', to: '/board/여행코스', active: route.params.category === '여행코스' && route.name === 'board-list' },
  { label: '맛집', to: '/board/맛집', active: route.params.category === '맛집' && route.name === 'board-list' }
]);
</script>
