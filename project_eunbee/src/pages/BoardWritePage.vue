<template>
  <section>
    <div class="list-header">
      <h1 class="page-title">{{ isEdit ? '게시글 수정' : '새 게시글 작성' }}</h1>
    </div>

    <div class="card">
      <div class="form-group">
        <label>카테고리</label>
        <select v-model="form.category">
          <option v-for="category in categories" :key="category" :value="category">{{ category }}</option>
        </select>
      </div>
      <div class="form-group">
        <label>제목</label>
        <input type="text" v-model="form.title" placeholder="제목을 입력하세요" />
      </div>
      <div class="form-group">
        <label>내용</label>
        <textarea v-model="form.body" placeholder="내용을 입력하세요"></textarea>
      </div>
      <div class="form-group">
        <label>수정용 비밀번호</label>
        <input type="password" v-model="form.password" placeholder="숫자 4자리 이상" />
      </div>
      <div class="page-actions">
        <button class="primary" @click="submitForm">등록</button>
        <button class="secondary" @click="cancelForm">취소</button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { reactive, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { usePosts } from '../stores/usePosts';

const router = useRouter();
const route = useRoute();
const { getPost, addPost, updatePost, categories } = usePosts();
const isEdit = computed(() => Boolean(route.params.id));

const existing = isEdit.value ? getPost(route.params.id) : null;

const form = reactive({
  category: existing?.category || route.params.category || '관광지',
  title: existing?.title || '',
  body: existing?.body || '',
  password: ''
});

function submitForm() {
  if (!form.title.trim() || !form.body.trim() || form.password.length < 4) {
    alert('모든 항목을 정확히 입력해주세요.');
    return;
  }

  if (isEdit.value) {
    if (form.password !== '1234') {
      alert('비밀번호가 올바르지 않습니다.');
      return;
    }
    updatePost(route.params.id, { category: form.category, title: form.title, body: form.body });
    router.push({ name: 'board-detail', params: { category: form.category, id: route.params.id } });
  } else {
    addPost({ category: form.category, title: form.title, body: form.body });
    router.push({ name: 'board-list', params: { category: form.category } });
  }
}

function cancelForm() {
  if (isEdit.value) {
    router.back();
  } else {
    router.push({ name: 'board-list', params: { category: form.category } });
  }
}
</script>
