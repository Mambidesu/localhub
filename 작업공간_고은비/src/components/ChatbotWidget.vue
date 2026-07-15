<template>
  <div class="chatbot-float">
    <button v-if="!isOpen" @click="toggleChat" class="chatbot-button chatbot-character-btn" aria-label="챗봇 열기">
      <img src="/flagmouse.png" alt="가야Ging 캐릭터" class="chatbot-character" />
      <div class="chatbot-bubble">아따, 왔는가! 궁금한 거 있으믄 언넝 물어보쇼!</div>
    </button>

    <div v-else class="chatbot-panel">
      <div class="chatbot-header">
        <span class="chatbot-title">가야Ging 챗봇</span>
        <button @click="toggleChat" class="chatbot-close" aria-label="챗봇 닫기">✕</button>
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

<style scoped>
.chatbot-float {
  position: fixed;
  right: 22px;
  bottom: 22px;
  z-index: 1200;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.chatbot-character-btn {
  background: transparent;
  border: none;
  padding: 0;
  cursor: pointer;
  width: 76px;
  height: 76px;
  border-radius: 999px;
  box-shadow: 0 10px 28px rgba(47,107,58,0.18);
  position: relative;
}

.chatbot-character {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}

.chatbot-bubble {
  position: absolute;
  top: -14px;
  right: calc(100% + 10px);
  min-width: 180px;
  max-width: 220px;
  background: linear-gradient(135deg, #fff8e6, #f6e2b8);
  color: #3a4c2f;
  border: 1px solid #e9d7a8;
  border-radius: 18px;
  padding: 10px 14px;
  font-size: 0.88rem;
  box-shadow: 0 12px 24px rgba(47, 107, 58, 0.16);
  opacity: 0;
  transform: translateY(-10px) scale(0.92);
  transition: opacity 0.18s ease, transform 0.18s ease;
  pointer-events: none;
  text-align: center;
  line-height: 1.35;
  word-break: keep-all;
}

.chatbot-character-btn:hover .chatbot-bubble {
  opacity: 1;
  transform: translateY(-10px) scale(1);
  background: linear-gradient(180deg, #fffdf9, #f7fbf6);
  border: 1px solid #e9f3ea;
  border-radius: 14px;
  box-shadow: 0 18px 40px rgba(32,60,28,0.12);
}

.chatbot-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  background: linear-gradient(90deg, #2f6b3a, #7bbf5a);
  color: #fff8f0;
}

.chatbot-title {
  font-weight: 700;
}

.chatbot-close {
  background: rgba(255,255,255,0.12);
  border: none;
  color: #fff;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  cursor: pointer;
}

.chatbot-body {
  max-height: 260px;
  overflow-y: auto;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.chatbot-message.user {
  background: #e9f7df;
  align-self: flex-end;
  color: #1b3b1f;
  padding: 8px 12px;
  border-radius: 12px;
  max-width: 86%;
}

.chatbot-message.bot {
  background: #fff;
  color: #1b1b1b;
  padding: 8px 12px;
  border-radius: 12px;
  max-width: 86%;
}

.chatbot-footer {
  display: flex;
  gap: 8px;
  padding: 12px;
  align-items: center;
}

.chatbot-footer input[type="text"] {
  flex: 1;
  padding: 10px 12px;
  border-radius: 999px;
  border: 1px solid #e6efe6;
}

</style>
