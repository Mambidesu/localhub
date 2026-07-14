<template>
  <div class="app-shell">
    <header class="app-header">
      <div class="header-inner">
        <div>
          <h1>LocalHub</h1>
          <p class="tagline">광주 지역 주민과 관광객을 위한 익명 커뮤니티</p>
        </div>
        <nav class="menu-links">
          <RouterLink v-for="item in topMenu" :key="item.label" :to="item.to" class="menu-link" :class="{ active: item.active }">
            {{ item.label }}
          </RouterLink>
        </nav>
      </div>
    </header>

    <main class="main-content">
      <RouterView />
    </main>

    <ChatbotWidget />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import ChatbotWidget from './components/ChatbotWidget.vue';

const route = useRoute();

const topMenu = computed(() => [
  { label: '내 일정 관리', to: '/planner', active: route.path === '/planner' },
  { label: '관광지', to: '/board/관광지', active: route.params.category === '관광지' && route.name === 'board-list' },
  { label: '레포츠', to: '/board/레포츠', active: route.params.category === '레포츠' && route.name === 'board-list' },
  { label: '문화시설', to: '/board/문화시설', active: route.params.category === '문화시설' && route.name === 'board-list' },
  { label: '쇼핑', to: '/board/쇼핑', active: route.params.category === '쇼핑' && route.name === 'board-list' },
  { label: '숙박', to: '/board/숙박', active: route.params.category === '숙박' && route.name === 'board-list' },
  { label: '여행코스', to: '/board/여행코스', active: route.params.category === '여행코스' && route.name === 'board-list' },
  { label: '맛집', to: '/board/맛집', active: route.params.category === '맛집' && route.name === 'board-list' }
]);
</script>
