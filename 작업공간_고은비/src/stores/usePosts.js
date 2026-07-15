import { reactive, computed } from 'vue';
import tourismData from '../data/광주_전라권/광주_전라권_관광지.json';
import sportsData from '../data/광주_전라권/광주_전라권_레포츠.json';
import cultureData from '../data/광주_전라권/광주_전라권_문화시설.json';
import shoppingData from '../data/광주_전라권/광주_전라권_쇼핑.json';
import lodgingData from '../data/광주_전라권/광주_전라권_숙박.json';
import courseData from '../data/광주_전라권/광주_전라권_여행코스.json';
import foodData from '../data/광주_전라권/광주_전라권_음식점.json';

const STORAGE_KEY = 'localhub-posts';

function loadPosts() {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return null;
    return JSON.parse(saved);
  } catch {
    return null;
  }
}

function savePosts(posts) {
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
  }
}

const seedPosts = [
  { category: '관광지', title: '충민사 주변 산책 코스', body: '충민사와 주변 골목을 따라 천천히 둘러보면 광주의 정취를 느끼기 좋습니다.', author: '익명', createdAt: '2026-07-10' },
  { category: '관광지', title: '정엄정려비와 함께하는 역사 여행', body: '역사 유적지를 중심으로 광주의 독립정신을 느낄 수 있는 코스입니다.', author: '익명', createdAt: '2026-07-09' },
  { category: '관광지', title: '부용정에서 느끼는 여유', body: '산과 강이 어우러진 풍경이 아름다워 조용히 쉬기 좋은 장소입니다.', author: '익명', createdAt: '2026-07-08' },
  { category: '관광지', title: '양과동정의 조용한 분위기', body: '한적한 분위기와 역사적 의미가 함께 느껴지는 곳입니다.', author: '익명', createdAt: '2026-07-07' },
  { category: '관광지', title: '무등산 주상절리대 추천', body: '자연과 지질을 함께 즐기고 싶은 분들에게 추천합니다.', author: '익명', createdAt: '2026-07-06' },

  { category: '레포츠', title: '염주실내수영장 가족 나들이', body: '비 오는 날이나 더운 날에도 즐기기 좋은 실내 레포츠 추천입니다.', author: '익명', createdAt: '2026-07-10' },
  { category: '레포츠', title: '광주-기아 챔피언스 필드 관람 후기', body: '야구 경기를 즐기며 광주 분위기를 만끽할 수 있는 추천 코스입니다.', author: '익명', createdAt: '2026-07-09' },
  { category: '레포츠', title: '시민의 숲 야영장 추천', body: '캠핑과 산책을 함께 즐기고 싶다면 좋은 선택입니다.', author: '익명', createdAt: '2026-07-08' },
  { category: '레포츠', title: '휴파크 광산점 액티비티 후기', body: '다양한 실내 체험이 준비돼 있어 친구들과 가기 좋습니다.', author: '익명', createdAt: '2026-07-07' },
  { category: '레포츠', title: '북구청소년수련관 체험 코스', body: '청소년 활동 프로그램과 다양한 체험이 있어 만족도가 높습니다.', author: '익명', createdAt: '2026-07-06' },

  { category: '문화시설', title: '광주 동구문화원 전시 관람', body: '지역의 역사와 문화를 이해하기 좋은 전시 공간입니다.', author: '익명', createdAt: '2026-07-10' },
  { category: '문화시설', title: '광주 전통문화관 체험 후기', body: '전통 공예와 체험 프로그램이 다양해 흥미롭습니다.', author: '익명', createdAt: '2026-07-09' },
  { category: '문화시설', title: '광주시립미술관 데이트 코스', body: '조용한 분위기에서 예술을 감상하기 좋은 장소입니다.', author: '익명', createdAt: '2026-07-08' },
  { category: '문화시설', title: '광산문화원 프로그램 추천', body: '공연과 전시가 잘 이어져 문화생활을 즐기기 좋습니다.', author: '익명', createdAt: '2026-07-07' },
  { category: '문화시설', title: '서구문화원 문화행사 후기', body: '지역 문화행사에 관심 있는 분들에게 좋은 정보입니다.', author: '익명', createdAt: '2026-07-06' },

  { category: '쇼핑', title: '서부농수산물도매시장 먹거리 탐방', body: '신선한 먹거리를 저렴하게 즐길 수 있는 곳입니다.', author: '익명', createdAt: '2026-07-10' },
  { category: '쇼핑', title: '비아5일시장 장보기 코스', body: '식재료와 생활용품을 한 번에 구입하기 좋습니다.', author: '익명', createdAt: '2026-07-09' },
  { category: '쇼핑', title: '상무화훼단지 구경 후기', body: '꽃과 식물 관련 소품을 구경하기 좋은 추천 장소입니다.', author: '익명', createdAt: '2026-07-08' },
  { category: '쇼핑', title: '월곡시장 추천 아이템', body: '지역 특산물과 간단한 기념품을 찾기에 좋습니다.', author: '익명', createdAt: '2026-07-07' },
  { category: '쇼핑', title: '무안요(광주) 쇼핑 후기', body: '가성비 좋은 구매 아이템이 많아 재방문하고 싶은 곳입니다.', author: '익명', createdAt: '2026-07-06' },

  { category: '숙박', title: '도심 근처 가성비 숙소 추천', body: '교통이 편리하고 이동 시간이 적어 일정이 편합니다.', author: '익명', createdAt: '2026-07-10' },
  { category: '숙박', title: '볼튼호텔 편안한 숙박 후기', body: '편안한 객실과 깔끔한 서비스가 만족스러웠습니다.', author: '익명', createdAt: '2026-07-09' },
  { category: '숙박', title: '호텔 5월 여름 휴식', body: '시원한 분위기와 여유로운 휴식이 잘 어우러졌습니다.', author: '익명', createdAt: '2026-07-08' },
  { category: '숙박', title: '탑클라우드호텔 조식과 뷰', body: '뷰와 조식 품질이 좋았던 숙소였습니다.', author: '익명', createdAt: '2026-07-07' },
  { category: '숙박', title: '산수동 한옥체험 숙박 후기', body: '전통 분위기를 느끼며 쉬기 좋은 특별한 경험이었습니다.', author: '익명', createdAt: '2026-07-06' },

  { category: '여행코스', title: '5.18 역사기행 코스 추천', body: '광주의 역사와 의미를 함께 느끼고 싶다면 이 코스를 추천합니다.', author: '익명', createdAt: '2026-07-10' },
  { category: '여행코스', title: '호남 유적지 여행 루트', body: '유적지와 자연을 함께 즐기고 싶은 분들에게 적합합니다.', author: '익명', createdAt: '2026-07-09' },
  { category: '여행코스', title: '녹색의 에너지 체험 코스', body: '공원과 산책 코스를 자연스럽게 연결한 추천 루트입니다.', author: '익명', createdAt: '2026-07-08' },
  { category: '여행코스', title: '광주하계유니버시아드 경기장 코스', body: '도시의 현대적인 분위기와 스포츠 공간을 함께 즐길 수 있습니다.', author: '익명', createdAt: '2026-07-07' },
  { category: '여행코스', title: '광주 야경과 유적지 투어', body: '밤에도 매력적인 도시 풍경을 즐기고 싶다면 추천합니다.', author: '익명', createdAt: '2026-07-06' },

  { category: '맛집', title: '송정떡갈비 1호점 후기', body: '맛과 양이 모두 만족스러운 대표적인 광주 음식점입니다.', author: '익명', createdAt: '2026-07-10' },
  { category: '맛집', title: '제일반점 가성비 추천', body: '친구와 함께 가기 좋은 든든한 한 끼 메뉴가 많습니다.', author: '익명', createdAt: '2026-07-09' },
  { category: '맛집', title: '금다연한정식 만족 후기', body: '전통적인 한정식 느낌을 즐기고 싶을 때 추천합니다.', author: '익명', createdAt: '2026-07-08' },
  { category: '맛집', title: '송학한정식 든든한 점심', body: '무난하게 만족을 느끼기 좋은 한식 코스입니다.', author: '익명', createdAt: '2026-07-07' },
  { category: '맛집', title: '종가집 설렁탕 추천', body: '따뜻하고 편안한 분위기에서 즐기기 좋은 메뉴입니다.', author: '익명', createdAt: '2026-07-06' }
];

const persisted = loadPosts();
const initialPosts = persisted || seedPosts.map((post, index) => ({ ...post, id: index + 1 }));
const posts = reactive(initialPosts);

const categories = ['관광지', '레포츠', '문화시설', '쇼핑', '숙박', '여행코스', '맛집'];

const state = reactive({
  selectedCategory: '관광지',
  posts,
  categories,
  currentPostId: Math.max(1, ...initialPosts.map(post => Number(post.id || 0))) + 1,
  isChatOpen: false,
  chatMessages: [
    { id: 1, author: 'bot', text: '안녕하세요! 무엇을 도와드릴까요?' }
  ]
});

export function usePosts() {
  const recentPosts = computed(() => {
    return [...state.posts]
      .sort((a, b) => {
        const dateA = new Date(a.createdAt || '1970-01-01');
        const dateB = new Date(b.createdAt || '1970-01-01');
        return dateB - dateA;
      })
      .slice(0, 5);
  });
  const categoryPosts = computed(() => {
    return [...state.posts]
      .filter(post => post.category === state.selectedCategory)
      .sort((a, b) => {
        const dateA = new Date(a.createdAt || '1970-01-01');
        const dateB = new Date(b.createdAt || '1970-01-01');
        return dateB - dateA;
      });
  });

  function selectCategory(value) {
    state.selectedCategory = value;
  }

  function getPost(id) {
    return state.posts.find(post => post.id === Number(id));
  }

  function addPost(post) {
    const newPost = {
      ...post,
      id: state.currentPostId++,
      author: '익명',
      createdAt: new Date().toISOString().slice(0, 10)
    };
    state.posts.push(newPost);
    savePosts(state.posts);
  }

  function updatePost(id, updated) {
    const target = getPost(id);
    if (target) {
      if (updated.category) target.category = updated.category;
      if (updated.title) target.title = updated.title;
      if (updated.body) target.body = updated.body;
      target.createdAt = new Date().toISOString().slice(0, 10);
      savePosts(state.posts);
    }
  }

  function removePost(id) {
    const index = state.posts.findIndex(post => post.id === Number(id));
    if (index !== -1) {
      state.posts.splice(index, 1);
      savePosts(state.posts);
    }
  }

  function sendChatMessage(text) {
    state.chatMessages.push({ id: Date.now(), author: 'user', text });
    setTimeout(() => {
      const answer = buildTravelRecommendation(text);
      state.chatMessages.push({ id: Date.now() + 1, author: 'bot', text: answer });
    }, 600);
  }

  function buildTravelRecommendation(text) {
    const lowerText = text.toLowerCase();
    const datasets = [
      { keyword: ['관광', '관광지', '명소', '여행지', '가볼만한곳'], items: tourismData.items },
      { keyword: ['레포츠', '액티비티', '운동', '체험'], items: sportsData.items },
      { keyword: ['문화', '전시', '공연', '문화시설'], items: cultureData.items },
      { keyword: ['쇼핑', '시장', '상점', '구매'], items: shoppingData.items },
      { keyword: ['숙박', '호텔', '게스트하우스', '숙소'], items: lodgingData.items },
      { keyword: ['코스', '여행코스', '루트', '일정'], items: courseData.items },
      { keyword: ['맛집', '음식', '식당', '먹거리'], items: foodData.items }
    ];

    const matched = datasets.find(dataset => dataset.keyword.some(keyword => lowerText.includes(keyword)));
    const items = matched?.items || tourismData.items;
    const sampleItems = items.slice(0, 3).map(item => item.title).join(', ');

    if (lowerText.includes('추천') || lowerText.includes('가르쳐') || lowerText.includes('어디')) {
      return `광주·전라권 데이터 기준으로 추천해드리면: ${sampleItems} 정도를 먼저 고려해보세요. 더 구체적으로 원하시면 “맛집 추천”, “숙박 추천”, “가족 여행지 추천”처럼 말해 주세요.`;
    }

    return `광주·전라권 데이터를 참고해 보니 ${sampleItems} 같은 곳이 눈에 띕니다. 원하시는 테마를 더 알려주시면 더 맞춤형으로 추천해 드릴게요.`;
  }

  function toggleChat() {
    state.isChatOpen = !state.isChatOpen;
  }

  return {
    state,
    categories,
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
