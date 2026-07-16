<template>
  <div v-if="visible" class="modal-backdrop" @click.self="emit('close')">
    <div class="modal-panel weather-modal">
      <div class="weather-header">
        <div>
          <h4>7일 예보</h4>
          <p>광주 기준으로 한눈에 확인해보세요</p>
        </div>
        <button class="secondary" @click="emit('close')">닫기</button>
      </div>

      <div class="weather-loading" v-if="loading">날씨 정보를 불러오는 중입니다… 잠시만 기다려 주세요.</div>

      <div class="weather-body" v-else>
        <div class="weather-summary">
          <div class="weather-main">
              <div class="weather-icon-large">{{ currentIcon }}</div>
              <div>
                <div class="weather-title">{{ currentLabel }}</div>
                <p class="weather-desc">{{ currentSummary }}</p>
                <p class="weather-data-source" v-if="dataTimestamp">데이터 기준: {{ dataTimestamp }} (기상청)</p>
              </div>
            </div>
          <a class="weather-link" href="https://www.weather.go.kr/w/index.do" target="_blank" rel="noopener">기상청 바로가기</a>
        </div>

        <div class="weather-calendar">
          <div v-for="day in weekLabels" :key="day" class="weekday-cell">{{ day }}</div>
          <div v-for="day in calendarDays" :key="day.key" class="day-cell" :class="{ muted: !day.inMonth }">
            <div class="day-number">{{ day.day }}</div>
            <div class="day-icon">{{ day.icon }}</div>
            <div class="day-label">{{ day.label }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';

const props = defineProps({
  visible: Boolean
});

const emit = defineEmits(['close']);

const loading = ref(true);
const currentLabel = ref('오늘 예보');
const currentSummary = ref('기상청 7일 예보를 불러오고 있습니다.');
const currentIcon = ref('☀️');
const dataTimestamp = ref('');
const weatherData = ref([]);
const hasWeatherData = ref(false);
const weekLabels = ['일', '월', '화', '수', '목', '금', '토'];
let refreshTimer = null;

function formatDateTime(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hour}:${minute}`;
}

function chooseWeatherIconByText(text) {
  if (!text) return '☁️';
  if (text.includes('비')) return '🌧️';
  if (text.includes('눈')) return '❄️';
  if (text.includes('맑음')) return '☀️';
  if (text.includes('구름많음') || text.includes('구름')) return '⛅';
  if (text.includes('흐림')) return '☁️';
  return '☁️';
}

function chooseWeatherLabelByText(text) {
  if (!text) return '예보 없음';
  if (text.includes('비')) return '비';
  if (text.includes('눈')) return '눈';
  if (text.includes('맑음')) return '맑음';
  if (text.includes('구름많음') || text.includes('구름')) return '구름';
  if (text.includes('흐림')) return '흐림';
  return text;
}

function getLatestForecastBaseDateTime(now = new Date()) {
  const baseTimes = ['0200', '0500', '0800', '1100', '1400', '1700', '2000', '2300'];
  const hour = now.getHours();
  const minute = now.getMinutes();
  const latest = baseTimes.slice().reverse().find(time => {
    const baseHour = Number(time.slice(0, 2));
    return hour > baseHour || (hour === baseHour && minute >= 0);
  });

  if (latest) {
    return {
      baseDate: `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`,
      baseTime: latest
    };
  }

  const previousDay = new Date(now);
  previousDay.setDate(previousDay.getDate() - 1);
  return {
    baseDate: `${previousDay.getFullYear()}${String(previousDay.getMonth() + 1).padStart(2, '0')}${String(previousDay.getDate()).padStart(2, '0')}`,
    baseTime: '2300'
  };
}

function formatDateLabel(date) {
  return `${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
}

function formatForecastLabel(text) {
  return text ? text.replace(/\s*\/\s*/g, ' /\n') : text;
}

const calendarDays = computed(() => {
  if (!hasWeatherData.value || !weatherData.value.length) return [];

  return weatherData.value.map(item => ({
    key: item.key,
    day: item.day,
    inMonth: true,
    icon: item.icon,
    label: item.forecastText ? item.forecastText : item.label
  }));
});

function parseShortTermWeather(response) {
  const items = response?.response?.body?.items?.item || [];
  const rows = Array.isArray(items) ? items : [items];
  const dailyMap = new Map();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  rows.forEach(item => {
    const fcstDate = item.fcstDate;
    if (!fcstDate) return;

    const date = new Date(`${fcstDate.slice(0, 4)}-${fcstDate.slice(4, 6)}-${fcstDate.slice(6, 8)}`);
    date.setHours(0, 0, 0, 0);
    if (date < today) return;

    const key = fcstDate;
    if (!dailyMap.has(key)) {
      dailyMap.set(key, {
        day: date.getDate(),
        date,
        minTemp: Infinity,
        maxTemp: -Infinity,
        pop: 0,
        pty: '0',
        sky: '1'
      });
    }

    const entry = dailyMap.get(key);
    const category = item.category;
    const value = item.fcstValue;
    const numericValue = Number(value);

    if ((category === 'TMP' || category === 'TMX') && Number.isFinite(numericValue)) {
      entry.maxTemp = Math.max(entry.maxTemp, numericValue);
    }

    if ((category === 'TMP' || category === 'TMN') && Number.isFinite(numericValue)) {
      entry.minTemp = Math.min(entry.minTemp, numericValue);
    }

    if (category === 'POP' && Number.isFinite(numericValue)) {
      entry.pop = Math.max(entry.pop, numericValue);
    }

    if (category === 'PTY') {
      entry.pty = value;
    }

    if (category === 'SKY') {
      entry.sky = value;
    }
  });

  return Array.from(dailyMap.values())
    .sort((a, b) => a.date - b.date)
    .slice(0, 4)
    .map(entry => {
      const weatherText = entry.pty !== '0'
        ? '비'
        : (entry.sky === '1' ? '맑음' : entry.sky === '3' ? '구름많음' : '흐림');
      return {
        key: `short-${entry.day}-${entry.date.toISOString().slice(0, 10)}`,
        day: entry.day,
        date: entry.date,
        icon: chooseWeatherIconByText(weatherText),
        forecastText: weatherText,
        label: `${formatDateLabel(entry.date)} ${formatForecastLabel(weatherText)}`
      };
    });
}

function parseMidTermWeather(response) {
  const items = response?.response?.body?.items?.item;
  const item = Array.isArray(items) ? items[0] : items;
  if (!item) return [];

  const now = new Date();
  const entries = [];

  for (let offset = 4; offset <= 6; offset += 1) {
    const date = new Date(now);
    date.setDate(date.getDate() + offset);
    const day = date.getDate();
    const amKey = `wf${offset}Am`;
    const pmKey = `wf${offset}Pm`;
    const forecastAm = item[amKey] ? item[amKey].trim() : '';
    const forecastPm = item[pmKey] ? item[pmKey].trim() : '';
    const forecastText = forecastAm && forecastPm
      ? `${forecastAm} / ${forecastPm}`
      : item[`wf${offset}`] || forecastAm || forecastPm || '';
    if (!forecastText) continue;

    entries.push({
      key: `mid-${offset}`,
      day,
      date,
      icon: chooseWeatherIconByText(forecastText),
      forecastText,
      label: `${formatDateLabel(date)} ${formatForecastLabel(forecastText)}`,
      offset
    });
  }

  return entries;
}

async function fetchWeather() {
  loading.value = true;
  hasWeatherData.value = false;
  weatherData.value = [];

  const authKey = import.meta.env.VITE_WEATHER_SERVICE_KEY?.trim();
  if (!authKey) {
    currentIcon.value = '☁️';
    currentLabel.value = 'API 키 없음';
    currentSummary.value = '기상청 API 키가 설정되어 있지 않습니다.';
    dataTimestamp.value = '';
    loading.value = false;
    return;
  }

  try {
    const now = new Date();
    const { baseDate, baseTime } = getLatestForecastBaseDateTime(now);
    const shortUrl = `/api/kma/vilage/VilageFcstInfoService_2.0/getVilageFcst?authKey=${authKey}&pageNo=1&numOfRows=1000&dataType=JSON&base_date=${baseDate}&base_time=${baseTime}&nx=67&ny=100`;
    const [shortRes, midRes] = await Promise.all([
      fetch(shortUrl),
      fetch(`/api/kma/vilage/MidFcstInfoService/getMidLandFcst?authKey=${authKey}&pageNo=1&numOfRows=10&dataType=JSON&regId=11B00000&tmFc=${baseDate}0600`)
    ]);

    if (!shortRes.ok) throw new Error(`단기 예보 요청 실패: ${shortRes.status}`);
    if (!midRes.ok) throw new Error(`중기 예보 요청 실패: ${midRes.status}`);

    const shortJson = await shortRes.json();
    const midJson = await midRes.json();
    const shortForecast = parseShortTermWeather(shortJson);
    const midForecast = parseMidTermWeather(midJson);

    weatherData.value = [...shortForecast, ...midForecast].sort((a, b) => a.date - b.date);
    hasWeatherData.value = weatherData.value.length > 0;
    dataTimestamp.value = formatDateTime(new Date());

    if (weatherData.value.length) {
      const today = weatherData.value[0];
      currentIcon.value = today.icon;
      currentLabel.value = '오늘 예보';
      currentSummary.value = today.forecastText || today.label;
    } else {
      currentIcon.value = '☁️';
      currentLabel.value = '예보 없음';
      currentSummary.value = '7일 예보 데이터를 찾을 수 없습니다.';
    }
  } catch (error) {
    console.warn(error);
    currentIcon.value = '☁️';
    currentLabel.value = '불러오기 실패';
    currentSummary.value = '7일 예보 데이터를 불러오지 못했습니다.';
    dataTimestamp.value = '';
  } finally {
    loading.value = false;
  }
}

function scheduleRefresh() {
  if (refreshTimer) {
    clearInterval(refreshTimer);
  }
  refreshTimer = setInterval(() => {
    if (props.visible) {
      fetchWeather();
    }
  }, 1000 * 60 * 60);
}

watch(() => props.visible, value => {
  if (value) {
    fetchWeather();
    scheduleRefresh();
  } else if (refreshTimer) {
    clearInterval(refreshTimer);
    refreshTimer = null;
  }
});

onMounted(() => {
  if (props.visible) {
    fetchWeather();
    scheduleRefresh();
  }
});

onUnmounted(() => {
  if (refreshTimer) {
    clearInterval(refreshTimer);
    refreshTimer = null;
  }
});
</script>
