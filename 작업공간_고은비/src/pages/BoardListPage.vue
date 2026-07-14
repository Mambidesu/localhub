<template>
  <section>
    <div class="list-header">
      <h1 class="page-title">{{ category }} 게시판</h1>
      <button class="primary" @click="goWrite">글쓰기</button>
    </div>

    <div class="card">
      <div class="table-wrapper">
        <table class="post-table">
          <thead>
            <tr>
              <th>번호</th>
              <th>제목</th>
              <th>카테고리</th>
              <th>작성일</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="post in displayPosts" :key="post.id" @click="viewPost(post)">
              <td>{{ post.id }}</td>
              <td>{{ post.title }}</td>
              <td>{{ post.category }}</td>
              <td>{{ post.createdAt }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="pagination">
        <button v-for="page in totalPages" :key="page" class="page-button" :class="{ active: page === currentPage }" @click="setPage(page)">{{ page }}</button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { usePosts } from '../stores/usePosts';

const router = useRouter();
const route = useRoute();
const { categories, state, selectCategory, categoryPosts } = usePosts();
const currentPage = ref(1);
const perPage = 5;
const category = route.params.category || '관광지';

selectCategory(category);

watch(route, () => {
  selectCategory(route.params.category || '관광지');
  currentPage.value = 1;
});

const displayPosts = computed(() => {
  const posts = categoryPosts.value;
  const start = (currentPage.value - 1) * perPage;
  return posts.slice(start, start + perPage);
});

const totalPages = computed(() => Math.max(1, Math.ceil(categoryPosts.value.length / perPage)));

function goWrite() {
  router.push({ name: 'board-write', params: { category } });
}

function viewPost(post) {
  router.push({ name: 'board-detail', params: { category: post.category, id: post.id } });
}

function setPage(page) {
  currentPage.value = page;
}
</script>
