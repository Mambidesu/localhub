<template>
  <div class="chatbot-float">
    <button v-if="!isOpen" @click="toggleChat" class="chatbot-button" aria-label="챗봇 열기">💬</button>
    <div v-else class="chatbot-panel">
      <div class="chatbot-header">
        <span>LocalHub 챗봇</span>
        <button @click="toggleChat" class="chatbot-button" style="width: 40px; height: 40px; font-size: 1rem;">✕</button>
      </div>
      <div class="chatbot-body">
        <div v-for="message in messages" :key="message.id" :class="['chatbot-message', message.author]">
          {{ message.text }}
        </div>
      </div>
      <div class="chatbot-footer">
        <input type="text" v-model="draft" placeholder="메시지를 입력하세요" @keyup.enter="sendMessage" />
        <button @click="sendMessage" class="primary">전송</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { usePosts } from '../stores/usePosts';

const { state, sendChatMessage, toggleChat } = usePosts();
const draft = ref('');

const isOpen = computed(() => state.isChatOpen);
const messages = computed(() => state.chatMessages);

function sendMessage() {
  if (!draft.value.trim()) return;
  sendChatMessage(draft.value.trim());
  draft.value = '';
}
</script>
