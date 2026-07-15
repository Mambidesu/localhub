import { createRouter, createWebHistory } from 'vue-router';
import HomePage from './pages/HomePage.vue';
import BoardListPage from './pages/BoardListPage.vue';
import BoardDetailPage from './pages/BoardDetailPage.vue';
import BoardWritePage from './pages/BoardWritePage.vue';
import TripPlannerPage from './pages/TripPlannerPage.vue';

const routes = [
  { path: '/', name: 'home', component: HomePage },
  { path: '/board/:category', name: 'board-list', component: BoardListPage, props: true },
  { path: '/post/:category/:id', name: 'board-detail', component: BoardDetailPage, props: true },
  { path: '/write/:category/:id?', name: 'board-write', component: BoardWritePage, props: true },
  { path: '/planner', name: 'trip-planner', component: TripPlannerPage }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
