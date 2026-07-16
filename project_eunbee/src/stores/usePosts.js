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
  { category: '맛집', title: '광주 특산물 파는 맛집 추천', body: '지역 특산물과 함께 즐길 수 있는 메뉴가 인상적인 곳입니다.', author: '익명', createdAt: '2026-07-09' },
  { category: '숙박', title: '도심 근처 가성비 숙소 추천', body: '교통이 편리해 일정 관리가 쉬운 숙소입니다.', author: '익명', createdAt: '2026-07-08' }
];

const persisted = loadPosts();
const initialPosts = persisted || seedPosts.map((post, index) => ({ ...post, id: index + 1 }));
const posts = reactive(initialPosts);

const categories = ['관광지', '레포츠', '문화시설', '쇼핑', '숙박', '여행코스', '맛집'];

// Region tokens used to detect user requests about Jeonbuk (전북) and nearby areas
const REGION_TOKENS = ['전북','전라북도','전라북','전주','군산','익산','정읍','남원','김제','완주','무주','장수','진안','임실','고창','부안','순창'];
// District tokens for finer-grained location filtering (common city districts)
const DISTRICT_TOKENS = ['서구','동구','남구','북구','광산구','완산구','덕진구','중구','중앙구'];
// Category tokens map: map various user keywords to dataset category labels used in getAllDatasetItems
const CATEGORY_TOKENS = {
  '관광지': ['관광지','관광'],
  '레포츠': ['레포츠','레저','스포츠','운동','수영','액티비티'],
  '문화시설': ['문화시설','문화','전시','공연','박물관','미술관'],
  '쇼핑': ['쇼핑','쇼핑몰','상점','시장','마트','기념품','백화점'],
  '숙박': ['숙박','호텔','게스트하우스','숙소','민박'],
  '여행코스': ['여행코스','코스','일정','루트','데이트','데이트코스','데이트 코스'],
  '맛집': ['맛집','음식점','식당','먹다','맛있는','밥']
};

// Tokens indicating a user specifically requests '모범음식점' (exemplary restaurants)
const EXEMPLARY_TOKENS = ['모범음식점', '모범 업소', '모범업소', '모범', '모범식당', '모범 음식점'];

function isItemExemplary(raw) {
  if (!raw) return false;
  const fields = `${raw.title || raw.name || ''} ${raw.overview || raw.addr || raw.addr1 || ''} ${raw.tel || ''}`.toLowerCase();
  return EXEMPLARY_TOKENS.some(tok => fields.includes(tok));
}

const state = reactive({
  selectedCategory: '관광지',
  posts,
  categories,
  currentPostId: Math.max(1, ...initialPosts.map(post => Number(post.id || 0))) + 1,
  isChatOpen: false,
  chatMessages: [{ id: 1, author: 'bot', text: '안녕하세요! 광주·전라권 여행 도와드릴게요. 무엇을 원하시나요?\n\n1. 여행 코스 추천 (자연·문화·레포츠·쇼핑 등)\n2. 맛집 추천(지역별 특산물, 모범음식점 등)\n3. 숙소 추천 (한옥체험·호텔·게스트하우스 등)\n\n원하시는 항목 번호나 가고 싶은 지역(예: 광주 동구, 담양 등)을 알려주시면 맞춤으로 추천해드릴게요.' }]
});

function buildDatasetContext(userText = '') {
  const isRegionQuery = REGION_TOKENS.some(tok => userText.includes(tok));

  const datasets = [
    { label: '관광지', items: tourismData.items || [] },
    { label: '레포츠', items: sportsData.items || [] },
    { label: '문화시설', items: cultureData.items || [] },
    { label: '쇼핑', items: shoppingData.items || [] },
    { label: '숙박', items: lodgingData.items || [] },
    { label: '여행코스', items: courseData.items || [] },
    { label: '맛집', items: foodData.items || [] }
  ];

  return datasets.map(dataset => {
    let items = dataset.items || [];

    if (isRegionQuery && Array.isArray(items) && items.length) {
      const filtered = items.filter(item => {
        const fields = `${item.title || item.name || ''} ${item.overview || item.addr || ''}`;
        return REGION_TOKENS.some(tok => fields.includes(tok));
      });
      if (filtered.length) items = filtered;
    }

    const lines = (items || []).slice(0, 12).map(item => {
      const title = item.title || item.name || '이름 없음';
      const brief = item.overview || item.addr || '';
      return `- ${title}${brief ? `: ${brief}` : ''}`;
    });

    return `${dataset.label}:\n${lines.join('\n') || '- 정보 없음'}`;
  }).join('\n\n');
}

function buildBoardContext() {
  return state.posts.slice(-8).map(post => `- ${post.title}: ${post.body}`).join('\n');
}

function extractReplyFromData(data) {
  if (!data) return null;
  try {
    // common Chat Completions shape
    if (data.choices && data.choices.length) {
      const ch = data.choices[0];
      if (ch.message && ch.message.content) {
        if (typeof ch.message.content === 'string') return ch.message.content.trim();
        // sometimes content can be an array
        if (Array.isArray(ch.message.content) && ch.message.content[0]) return (ch.message.content[0].text || ch.message.content[0].content || '').toString().trim();
      }
      if (ch.text) return ch.text.toString().trim();
    }

    // common alternative fields
    if (typeof data.output_text === 'string' && data.output_text.trim()) return data.output_text.trim();
    if (data.output && Array.isArray(data.output) && data.output[0]?.content) {
      const content = data.output[0].content;
      if (Array.isArray(content)) {
        const first = content.find(c => typeof c.text === 'string' || typeof c === 'string');
        if (first) return (typeof first === 'string' ? first : first.text || first[0]?.text || '').toString().trim();
      }
    }
  } catch (e) {
    // ignore extraction errors
    return null;
  }
  return null;
}

// External search fallback using SerpAPI (requires VITE_SERPAPI_KEY in .env)
async function searchExternal(query, limit = 5) {
  const serpKey = import.meta.env.VITE_SERPAPI_KEY;
  if (!serpKey) return null;
  try {
    const url = `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(query)}&hl=ko&gl=kr&num=${limit}&api_key=${serpKey}`;
    const res = await fetch(url);
    const json = await res.json();
    if (!res.ok) {
      console.error('SerpAPI error:', json);
      return null;
    }

    const organic = json.organic_results || [];
    const results = organic.slice(0, limit).map(r => {
      const title = r.title || r.title_no_formatting || '';
      const snippet = r.snippet || r.description || '';
      const link = r.link || r.url || '';
      return `- ${title}${snippet ? `: ${snippet}` : ''}${link ? ` (${link})` : ''}`;
    });

    if (results.length) return results.join('\n');
    return null;
  } catch (e) {
    console.error('searchExternal error', e);
    return null;
  }
}

// Aggregate dataset items into a normalized list for searching
function getAllDatasetItems() {
  const normalize = (item, label) => {
    const title = item.title || item.name || item.facltNm || '';
    const brief = item.overview || item.addr1 || item.addr || item.tel || '';
    return {
      source: label,
      title: title,
      brief: brief,
      raw: item
    };
  };

  const list = [];
  (foodData.items || []).forEach(i => list.push(normalize(i, '맛집')));
  (tourismData.items || []).forEach(i => list.push(normalize(i, '관광지')));
  (sportsData.items || []).forEach(i => list.push(normalize(i, '레포츠')));
  (cultureData.items || []).forEach(i => list.push(normalize(i, '문화시설')));
  (shoppingData.items || []).forEach(i => list.push(normalize(i, '쇼핑')));
  (lodgingData.items || []).forEach(i => list.push(normalize(i, '숙박')));
  (courseData.items || []).forEach(i => list.push(normalize(i, '여행코스')));
  return list;
}

// Find local items matching user text. Check saved `state.posts` first, then datasets.
function findLocalItems(userText, limit = 5) {
  if (!userText) return [];
  const q = userText.toLowerCase();
  const isExemplaryQuery = EXEMPLARY_TOKENS.some(tok => q.includes(tok));
  const tokens = q.split(/\s+/).filter(t => t.length > 1);
  const applyExemplaryFilter = (arr) => {
    if (!isExemplaryQuery) return arr;
    const filtered = (arr || []).filter(it => {
      if (!it) return false;
      if (typeof it.isExemplary === 'boolean') return it.isExemplary;
      if (it.raw) return isItemExemplary(it.raw);
      return false;
    });
    return filtered;
  };
  // Only check dataset items (do NOT search community posts)
  const items = getAllDatasetItems();
  const regionQuery = REGION_TOKENS.some(tok => q.includes(tok));

  // detect requested category from user text (e.g., '쇼핑', '맛집')
  let requestedCategory = null;
  for (const [cat, synonyms] of Object.entries(CATEGORY_TOKENS)) {
    if (synonyms.some(s => q.includes(s))) {
      requestedCategory = cat;
      break;
    }
  }
  

  // detect district token (e.g., '서구') for stricter location filtering
  const districtToken = DISTRICT_TOKENS.find(dt => q.includes(dt));
  const dtLower = districtToken ? districtToken.toLowerCase() : null;

  // --- PRIORITIZE previously generated/saved posts in memory
  const generatedPosts = (state.posts || []).filter(p => p.generated);
  if (generatedPosts.length) {
    // district filter on generated posts
    if (districtToken) {
      const genInDistrict = generatedPosts.filter(p => {
        const hay = `${p.title} ${p.body || ''} ${p.addr || ''} ${p.category || ''}`.toLowerCase();
        return hay.includes(dtLower);
      });
      if (genInDistrict.length) {
        if (requestedCategory) {
          const catGen = genInDistrict.filter(p => p.category === requestedCategory);
          if (catGen.length) {
            // score and return
            const scored = catGen.map(p => {
              const hay = `${p.title} ${p.body || ''}`.toLowerCase();
              let score = 0; tokens.forEach(tok => { if (hay.includes(tok)) score += 2; });
              return { p, score };
            }).filter(s => s.score > 0).sort((a,b) => b.score - a.score).slice(0, limit).map(s => ({ title: s.p.title, brief: s.p.body, source: '생성된 항목', raw: s.p, isExemplary: isItemExemplary(s.p) }));
            const scoredFiltered = applyExemplaryFilter(scored);
            if (scoredFiltered.length) return scoredFiltered;
            return applyExemplaryFilter(catGen.slice(0, limit).map(p => ({ title: p.title, brief: p.body, source: '생성된 항목', raw: p, isExemplary: isItemExemplary(p) })));
          }
        }
        // no category match: return top genInDistrict
        const scored = genInDistrict.map(p => {
          const hay = `${p.title} ${p.body || ''}`.toLowerCase();
          let score = 0; tokens.forEach(tok => { if (hay.includes(tok)) score += 2; });
          return { p, score };
        }).filter(s => s.score > 0).sort((a,b) => b.score - a.score).slice(0, limit).map(s => ({ title: s.p.title, brief: s.p.body, source: '생성된 항목', raw: s.p, isExemplary: isItemExemplary(s.p) }));
        const scoredFiltered2 = applyExemplaryFilter(scored);
        if (scoredFiltered2.length) return scoredFiltered2;
        return applyExemplaryFilter(genInDistrict.slice(0, limit).map(p => ({ title: p.title, brief: p.body, source: '생성된 항목', raw: p, isExemplary: isItemExemplary(p) })));
      }
    }

    // category-only match on generated posts
    if (requestedCategory) {
      const catGen = generatedPosts.filter(p => p.category === requestedCategory);
      if (catGen.length) {
        const scored = catGen.map(p => {
          const hay = `${p.title} ${p.body || ''}`.toLowerCase();
          let score = 0; tokens.forEach(tok => { if (hay.includes(tok)) score += 2; });
          if (regionQuery && REGION_TOKENS.some(rt => hay.includes(rt))) score += 5;
          return { p, score };
        }).filter(s => s.score > 0).sort((a,b) => b.score - a.score).slice(0, limit).map(s => ({ title: s.p.title, brief: s.p.body, source: '생성된 항목', raw: s.p, isExemplary: isItemExemplary(s.p) }));
        if (scored.length) return applyExemplaryFilter(scored);
        return applyExemplaryFilter(catGen.slice(0, limit).map(p => ({ title: p.title, brief: p.body, source: '생성된 항목', raw: p, isExemplary: isItemExemplary(p) })));
      }
    }

    // general scoring on generated posts
    const genScored = generatedPosts.map(p => {
      const hay = `${p.title} ${p.body || ''}`.toLowerCase();
      let score = 0; tokens.forEach(tok => { if (hay.includes(tok)) score += 2; });
      if (regionQuery && REGION_TOKENS.some(rt => hay.includes(rt))) score += 5;
      if (requestedCategory && p.category === requestedCategory) score += 4;
      return { p, score };
    }).filter(s => s.score > 0).sort((a,b) => b.score - a.score).slice(0, limit).map(s => ({ title: s.p.title, brief: s.p.body, source: '생성된 항목', raw: s.p, isExemplary: isItemExemplary(s.p) }));
    const genScoredFiltered = applyExemplaryFilter(genScored);
    if (genScoredFiltered.length) return genScoredFiltered;
  }

  if (districtToken) {
    // filter items that explicitly mention the district in title/brief/address
    const itemsInDistrict = items.filter(it => {
      const rawText = it.raw ? (it.raw.addr1 || it.raw.addr || JSON.stringify(it.raw)) : '';
      const hay = `${it.title} ${it.brief} ${rawText}`.toLowerCase();
      return hay.includes(dtLower);
    });

    if (itemsInDistrict.length) {
      // if category requested, prefer that category within district
      if (requestedCategory) {
        const catInDistrict = itemsInDistrict.filter(it => it.source === requestedCategory);
        if (catInDistrict.length) {
          // score and return category results within district
          const scoredCat = catInDistrict.map(it => {
            const hay = `${it.title} ${it.brief}`.toLowerCase();
            let score = 0;
            tokens.forEach(tok => { if (hay.includes(tok)) score += 2; });
            return { it, score };
          }).filter(s => s.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, limit)
            .map(s => ({ title: s.it.title, brief: s.it.brief, source: s.it.source, raw: s.it.raw, isExemplary: isItemExemplary(s.it.raw) }));
          if (scoredCat.length) return applyExemplaryFilter(scoredCat);
          return catInDistrict.slice(0, limit).map(it => ({ title: it.title, brief: it.brief, source: it.source, raw: it.raw, isExemplary: isItemExemplary(it) }));
        }
      }

      // no category or no category match within district: return top items in district
      const scoredDistrict = itemsInDistrict.map(it => {
        const hay = `${it.title} ${it.brief}`.toLowerCase();
        let score = 0;
        tokens.forEach(tok => { if (hay.includes(tok)) score += 2; });
        return { it, score };
      }).filter(s => s.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(s => ({ title: s.it.title, brief: s.it.brief, source: s.it.source, raw: s.it.raw, isExemplary: isItemExemplary(s.it.raw) }));

      if (scoredDistrict.length) return applyExemplaryFilter(scoredDistrict);
      return applyExemplaryFilter(itemsInDistrict.slice(0, limit).map(it => ({ title: it.title, brief: it.brief, source: it.source, raw: it.raw, isExemplary: isItemExemplary(it) })));
    }
    // if district requested but no items found in district, continue to fallback logic
  }

  // If a specific category is requested, prefer items from that category first
  if (requestedCategory) {
    const categoryItems = items.filter(it => it.source === requestedCategory);
    if (categoryItems.length) {
      const scoredCat = categoryItems.map(it => {
        const hay = `${it.title} ${it.brief}`.toLowerCase();
        let score = 0;
        tokens.forEach(tok => { if (hay.includes(tok)) score += 2; });
        if (regionQuery && REGION_TOKENS.some(tok => hay.includes(tok))) score += 5;
        return { it, score };
      }).filter(s => s.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(s => ({ title: s.it.title, brief: s.it.brief, source: s.it.source, raw: s.it.raw, isExemplary: isItemExemplary(s.it.raw) }));

      // If we found scored items in the category, return them; otherwise return top category items
      if (scoredCat.length) return applyExemplaryFilter(scoredCat);
      return categoryItems.slice(0, limit).map(it => ({ title: it.title, brief: it.brief, source: it.source, raw: it.raw, isExemplary: isItemExemplary(it) }));
    }
    // else fall through to general scoring with category boost
  }

  // General scoring across all items, with boost for requested category if any
  const scored = items.map(it => {
    const hay = `${it.title} ${it.brief}`.toLowerCase();
    let score = 0;
    tokens.forEach(tok => { if (hay.includes(tok)) score += 2; });
    if (regionQuery && REGION_TOKENS.some(tok => hay.includes(tok))) score += 5;
    if (requestedCategory && it.source === requestedCategory) score += 4;
    return { it, score };
  }).filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(s => ({ title: s.it.title, brief: s.it.brief, source: s.it.source, raw: s.it.raw, isExemplary: isItemExemplary(s.it.raw) }));

  return scored;
}

// Parse JSON block from model-generated text
function parseGeneratedJSON(text) {
  if (!text || typeof text !== 'string') return null;
  // try fenced json block first
  const fenced = /```json\s*([\s\S]*?)```/i.exec(text);
  const objText = fenced ? fenced[1] : (text.match(/\{[\s\S]*\}/) || [null])[0];
  if (!objText) return null;
  try {
    const parsed = JSON.parse(objText);
    return parsed;
  } catch (e) {
    // try to repair common mistakes (single quotes -> double)
    try {
      const repaired = objText.replace(/'/g, '"');
      return JSON.parse(repaired);
    } catch (e2) {
      console.warn('parseGeneratedJSON failed', e2);
      return null;
    }
  }
}

// Save generated post to server if VITE_SERVER_API_URL provided, else return null
async function savePostToServer(post) {
  const base = import.meta.env.VITE_SERVER_API_URL || import.meta.env.VITE_API_URL || '';
  if (!base) return null;
  try {
    const url = base.replace(/\/$/, '') + '/posts';
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(post)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'server save failed');
    return json;
  } catch (e) {
    console.error('savePostToServer error', e);
    return null;
  }
}

function buildPrompt(userText, historyMessages) {
  const localContext = buildDatasetContext(userText);
  // don't include the phrase '로컬 데이터' in prompts or answers; use '제공된 데이터' instead
  // Note: do not include community posts in the search logic; only use provided dataset JSON files.
  const boardContext = '';
  return `당신은 광주·전라권 여행 안내 챗봇입니다. 가능한 경우 제공된 데이터(프로젝트 내 JSON 파일)를 근거로 답하세요. 만약 사용자가 요청한 지역(예: 전북)에 대한 관련 정보가 제공된 데이터에 없으면 OpenAI의 일반 지식을 사용하여 답변해도 됩니다. 답변에 '로컬 데이터'라는 표현은 포함하지 마세요.
- 답변은 간결하고 실용적으로 작성하세요.
- 숫자 목록으로 정리하면 보기 좋게 답하세요.
- 모르는 정보는 추측하지 말고 "해당 정보가 없습니다"라고 말하세요.
- 주요 질의 유형: 관광지 추천, 축제 또는 행사 일정, 맛집/특산물 파는 곳, 데이트 코스, 숙소 추천, 커뮤니티 게시글 검색.

최근 대화:
${historyMessages.map(item => `${item.role === 'user' ? '사용자' : '도우미'}: ${item.content}`).join('\n') || '없음'}


제공 데이터:
${localContext}


사용자 질문:
${userText}`;
}

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

  async function sendChatMessage(text) {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userId = Date.now();
    state.chatMessages.push({ id: userId, author: 'user', text: trimmed });

    const typingId = Date.now() + 1;
    state.chatMessages.push({ id: typingId, author: 'bot', text: '응답 생성 중입니다...' });

    const historyMessages = state.chatMessages
      .filter(message => message.id !== typingId && message.id !== userId)
      .slice(-8)
      .map(message => ({
        role: message.author === 'user' ? 'user' : 'assistant',
        content: message.text
      }));

    // 1) Try to find matching local items first (saved posts or datasets)
    const localMatches = findLocalItems(trimmed, 5);
    if (localMatches && localMatches.length) {
      const lines = localMatches.map((it, i) => {
        const mark = it.isExemplary ? ' (모범: 확인됨)' : '';
        return `${i + 1}. ${it.title}${it.brief ? ` — ${it.brief}` : ''}${mark}`;
      });
      const replyText = `다음 항목을 찾았습니다:\n${lines.join('\n')}`;
      const idx = state.chatMessages.findIndex(message => message.id === typingId);
      if (idx !== -1) state.chatMessages.splice(idx, 1);
      state.chatMessages.push({ id: Date.now() + 2, author: 'bot', text: replyText });
      return;
    }

    // build local context and allow OpenAI general-knowledge fallback when local data missing
    const localContext = buildDatasetContext(trimmed);
    const isRegionQuery = REGION_TOKENS.some(tok => trimmed.includes(tok));
    const localHasRegion = REGION_TOKENS.some(tok => localContext.includes(tok));
    let externalContext = '';
    if (isRegionQuery && !localHasRegion) {
      externalContext = '\n\n제공된 데이터에 관련 정보가 없습니다. 일반 지식을 사용하여 답변하되, 답변에 "로컬 데이터"라는 표현을 포함하지 마세요.';
    }

    const baseSystem = buildPrompt(trimmed, historyMessages) + externalContext;
    const generationInstruction = '\n\n만약 제공된 데이터에 없어서 새로운 장소/맛집 항목을 생성해야 한다면, 먼저 사람이 읽기 쉬운 한국어 응답을 작성한 뒤, 마지막에 정확한 JSON 객체를 ```json ... ``` 코드블록으로 출력하세요. JSON 스키마는 { "title": string, "category": string, "body": string, "addr": string (선택), "tel": string (선택), "author": string (선택), "createdAt": string (선택) } 입니다. JSON은 기계가 파싱할 수 있도록 정확한 JSON 형식을 사용하세요.';
    const systemPrompt = baseSystem + generationInstruction;
    const apiKey = import.meta.env.VITE_OPENAI_KEY;

    if (!apiKey) {
      const idx = state.chatMessages.findIndex(message => message.id === typingId);
      if (idx !== -1) state.chatMessages.splice(idx, 1);
      state.chatMessages.push({ id: Date.now() + 2, author: 'bot', text: 'OpenAI API 키가 설정되지 않았습니다. .env 파일에 VITE_OPENAI_KEY를 입력한 뒤 다시 시도해 주세요.' });
      return;
    }

    try {
      console.log('SYSTEM PROMPT:', systemPrompt);
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-5-mini',
          messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: trimmed }
            ],
            max_completion_tokens: 500
        })
      });

      const data = await response.json();
      console.log('OpenAI response raw:', data);
      if (!response.ok) {
        throw new Error(data.error?.message || 'OpenAI 요청에 실패했습니다.');
      }

      const extracted = extractReplyFromData(data) || '';
      console.log('Extracted full text from model:', extracted);

      // Try to parse a JSON object from the model output (if model provided structured item)
      const parsedObj = parseGeneratedJSON(extracted);

      // Determine human-readable answer (strip JSON block if present)
      let humanAnswer = extracted;
      if (parsedObj) {
        humanAnswer = humanAnswer.replace(/```json[\s\S]*?```/i, '').replace(/\{[\s\S]*\}\s*$/i, '').trim();
        if (!humanAnswer) {
          // fallback: use parsed body or title for reply
          humanAnswer = parsedObj.body || parsedObj.title || '(AI가 생성한 항목을 추가했습니다.)';
        }
      }

      // If we have a parsed structured object, attempt to save it
      let finalParsed = parsedObj;
      if (!finalParsed) {
        // Ask the model to convert the provided answer into the JSON schema only
        try {
          const extractorSystem = '다음 텍스트를 아래 스키마에 맞는 정확한 JSON으로 변환하세요. 출력은 순수 JSON이어야 합니다: { "title": string, "category": string, "body": string, "addr": string (선택), "tel": string (선택), "author": string (선택), "createdAt": string (선택) }';
          const resp2 = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${apiKey}`
            },
            body: JSON.stringify({
              model: 'gpt-5-mini',
              messages: [
                { role: 'system', content: extractorSystem },
                { role: 'user', content: extracted }
              ],
              max_completion_tokens: 500
            })
          });
          const data2 = await resp2.json();
          const extracted2 = extractReplyFromData(data2) || '';
          finalParsed = parseGeneratedJSON(extracted2);
          console.log('Extractor response parsed JSON:', finalParsed);
        } catch (e) {
          console.warn('JSON extractor failed', e);
          finalParsed = null;
        }
      }

      if (finalParsed && typeof finalParsed === 'object') {
        // Only save if the parsed object contains a sensible title/name.
        const titleValue = (finalParsed.title || finalParsed.name || '').toString().trim();
        if (titleValue) {
          const newPost = {
            category: finalParsed.category || parsedObj?.category || '맛집',
            title: titleValue,
            body: finalParsed.body || finalParsed.description || humanAnswer,
            addr: finalParsed.addr || finalParsed.address || '',
            tel: finalParsed.tel || '',
            author: finalParsed.author || 'AI',
            generated: true,
            createdAt: finalParsed.createdAt || new Date().toISOString().slice(0, 10)
          };

          const serverResp = await savePostToServer(newPost);
          if (serverResp && serverResp.id) {
            // Use server-provided id if available
            const saved = { ...newPost, id: serverResp.id };
            state.posts.push(saved);
            savePosts(state.posts);
            console.log('Saved generated post to server:', serverResp);
          } else {
            // fallback: save locally
            addPost(newPost);
            console.log('Saved generated post locally');
          }
        } else {
          console.log('Parsed object had no title; skipping auto-save to posts. Parsed:', finalParsed);
        }
      }

      // Ensure we always send a human-readable fallback if model output was empty
      if (!humanAnswer || !humanAnswer.toString().trim()) {
        humanAnswer = '질문을 이해하지 못했습니다. 조금 더 구체적으로 말씀해 주세요.';
      }

      const idx = state.chatMessages.findIndex(message => message.id === typingId);
      if (idx !== -1) state.chatMessages.splice(idx, 1);
      state.chatMessages.push({ id: Date.now() + 2, author: 'bot', text: humanAnswer });
    } catch (error) {
      const idx = state.chatMessages.findIndex(message => message.id === typingId);
      if (idx !== -1) state.chatMessages.splice(idx, 1);
      // surface known error messages when possible
      const errMsg = error?.message || '응답 생성 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.';
      state.chatMessages.push({ id: Date.now() + 3, author: 'bot', text: errMsg });
      console.error('OpenAI chat error:', error);
    }
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
