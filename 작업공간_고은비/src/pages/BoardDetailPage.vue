<template>
  <section>
    <div class="list-header">
      <h1 class="page-title">{{ post?.title || '게시글을 찾을 수 없습니다' }}</h1>
      <div class="page-actions" v-if="post">
        <button class="secondary" @click="prepareEdit">수정</button>
        <button class="secondary" @click="prepareDelete">삭제</button>
      </div>
    </div>

    <div class="card" v-if="post">
      <div class="post-meta">작성일: {{ post.createdAt }}</div>
      <p>{{ post.body }}</p>
      <div class="post-footer">
        <button class="secondary" @click="goList">목록으로</button>
      </div>
    </div>

    <div class="modal-backdrop" v-if="confirmModalOpen">
      <div class="modal-panel">
        <h4>비밀번호 확인</h4>
        <div class="form-group">
          <label>비밀번호</label>
          <input type="password" v-model="password" placeholder="수정/삭제 비밀번호 입력" />
        </div>
        <div class="page-actions">
          <button class="primary" @click="confirmAction">확인</button>
          <button class="secondary" @click="cancelAction">취소</button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { usePosts } from '../stores/usePosts';

const router = useRouter();
const route = useRoute();
const { getPost, removePost } = usePosts();
const post = getPost(route.params.id);
const confirmModalOpen = ref(false);
const actionType = ref('');
const password = ref('');

function prepareEdit() {
  actionType.value = 'edit';
  confirmModalOpen.value = true;
}

function prepareDelete() {
  actionType.value = 'delete';
  confirmModalOpen.value = true;
}

function goList() {
  router.push({ name: 'board-list', params: { category: post.category } });
}

function cancelAction() {
  confirmModalOpen.value = false;
  password.value = '';
}

function confirmAction() {
  if (password.value !== '1234') {
    alert('비밀번호가 올바르지 않습니다.');
    return;
  }

  if (actionType.value === 'edit') {
    router.push({ name: 'board-write', params: { category: post.category, id: post.id } });
  } else {
    removePost(post.id);
    router.push({ name: 'board-list', params: { category: post.category } });
  }
}
</script>
