<template>
  <section>
    <div class="list-header">
      <h1 class="page-title">{{ pageTitle }}</h1>
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
              <td>{{ post.displayId }}</td>
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
const categoryTitleMap = {
  관광지: '관광지 게시판',
  레포츠: '레포츠 게시판',
  문화시설: '문화시설 게시판',
  쇼핑: '쇼핑 게시판',
  숙박: '숙박 게시판',
  여행코스: '여행코스 게시판',
  맛집: '맛집 게시판'
};
const category = computed(() => route.params.category || '관광지');
const pageTitle = computed(() => categoryTitleMap[category.value] || `${category.value} 게시판`);

selectCategory(category.value);

watch(() => route.params.category, () => {
  selectCategory(category.value);
  currentPage.value = 1;
});

const displayPosts = computed(() => {
  const posts = categoryPosts.value;
  const start = (currentPage.value - 1) * perPage;
  return posts
    .map((post, index) => ({
      ...post,
      displayId: index + 1
    }))
    .slice(start, start + perPage);
});

const totalPages = computed(() => Math.max(1, Math.ceil(categoryPosts.value.length / perPage)));

function goWrite() {
  router.push({ name: 'board-write', params: { category: category.value } });
}

function viewPost(post) {
  router.push({ name: 'board-detail', params: { category: post.category, id: post.id } });
}

function setPage(page) {
  currentPage.value = page;
}
</script>
