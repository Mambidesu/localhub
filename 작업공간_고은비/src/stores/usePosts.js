import { reactive, computed } from 'vue';

const posts = reactive([
  {
    id: 1,
    category: '관광지',
    title: '광주 대표 관광지 추천합니다',
    body: '광주에는 다양한 문화와 자연이 있어요. 특히 1913 송정역 시장과 광주비엔날레가 유명합니다.',
    author: '익명',
    createdAt: '2026-07-14'
  },
  {
    id: 2,
    category: '맛집',
    title: '맛집 리스트 공유해요',
    body: '광주의 숨은 맛집이 궁금하신 분들을 위해 몇 곳 추천합니다. 떡갈비부터 광주비빔밥까지 다양해요.',
    author: '익명',
    createdAt: '2026-07-13'
  },
  {
    id: 3,
    category: '숙박',
    title: '가성비 좋은 숙소 후기',
    body: '광주 도심 근처 편안한 게스트하우스 후기입니다. 교통도 편리하고 가격도 괜찮았어요.',
    author: '익명',
    createdAt: '2026-07-12'
  },
  {
    id: 4,
    category: '레포츠',
    title: '레포츠 체험 장소 추천',
    body: '무등산 등산 코스와 강변 자전거길이 정말 좋아요. 봄과 가을에 추천합니다.',
    author: '익명',
    createdAt: '2026-07-11'
  }
]);

const categories = ['관광지', '레포츠', '문화시설', '쇼핑', '숙박', '여행코스', '맛집'];

const state = reactive({
  selectedCategory: '관광지',
  posts,
  categories,
  currentPostId: 5,
  isChatOpen: false,
  chatMessages: [
    { id: 1, author: 'bot', text: '안녕하세요! 무엇을 도와드릴까요?' }
  ]
});

export function usePosts() {
  const recentPosts = computed(() => [...state.posts].sort((a, b) => b.id - a.id).slice(0, 5));
  const categoryPosts = computed(() => state.posts.filter(post => post.category === state.selectedCategory));

  function selectCategory(value) {
    state.selectedCategory = value;
  }

  function getPost(id) {
    return state.posts.find(post => post.id === Number(id));
  }

  function addPost(post) {
    state.posts.push({ ...post, id: state.currentPostId++, author: '익명', createdAt: new Date().toISOString().slice(0, 10) });
  }

  function updatePost(id, updated) {
    const target = getPost(id);
    if (target) {
      target.title = updated.title;
      target.body = updated.body;
    }
  }

  function removePost(id) {
    const index = state.posts.findIndex(post => post.id === Number(id));
    if (index !== -1) state.posts.splice(index, 1);
  }

  function sendChatMessage(text) {
    state.chatMessages.push({ id: Date.now(), author: 'user', text });
    setTimeout(() => {
      state.chatMessages.push({ id: Date.now() + 1, author: 'bot', text: '도와드릴 내용이 있으면 언제든지 말씀해주세요.' });
    }, 600);
  }

  function toggleChat() {
    state.isChatOpen = !state.isChatOpen;
  }

  return {
    state,
    recentPosts,
    categoryPosts,
    selectCategory,
    getPost,
    addPost,
    updatePost,
    removePost,
    sendChatMessage,
    toggleChat
  };
}
