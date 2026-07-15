<template>
  <section>
    <div class="banner-card">
      <h2>광주·전라를 만나는 가장 빠른 방법</h2>
      <p>가야Ging은 광주 지역 주민과 관광객이 관광 정보, 맛집 리뷰, 일정 추천을 자유롭게 공유하는 익명 커뮤니티입니다.</p>
      <div class="list-header">
        <div>
          <strong>주요 기능</strong>
        </div>
        <button class="primary" @click="goPlanner">내 일정 관리</button>
      </div>
    </div>

    <div class="card">
      <div class="list-header">
        <h3>최근 게시글</h3>
        <button class="secondary" @click="goBoard('관광지')">게시판 전체 보기</button>
      </div>
      <div class="card-list">
        <article v-for="post in recentPosts" :key="post.id" class="post-item post-clickable" @click="goPost(post)">
          <strong>{{ post.title }}</strong>
          <p>{{ post.body.slice(0, 90) }}...</p>
          <div class="meta">
            <span>{{ post.category }}</span>
            <span>{{ post.createdAt }}</span>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { usePosts } from '../stores/usePosts';

const { recentPosts } = usePosts();
const router = useRouter();

function goPlanner() {
  router.push({ name: 'trip-planner' });
}

function goBoard(category) {
  router.push({ name: 'board-list', params: { category } });
}

function goPost(post) {
  router.push({ name: 'board-detail', params: { category: post.category, id: post.id } });
}
</script>
