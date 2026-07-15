<template>
  <section>
    <div class="list-header">
      <h1 class="page-title">여행 일정 생성/관리</h1>
      <div style="display:flex;gap:8px;align-items:center;">
        <button class="primary" @click="downloadPlan">일정 다운로드</button>
        <button class="primary" @click="addDay">Day 추가</button>
      </div>
    </div>

    <div class="trip-card">
      <div class="form-group">
        <label>여행 제목</label>
        <input type="text" v-model="tripTitle" placeholder="여행 제목을 입력하세요" />
      </div>

      <div class="trip-list">
        <article v-for="day in itinerary" :key="day.id" class="trip-item">
          <header>
            <strong>Day {{ day.day }}</strong>
            <div class="day-actions">
              <button class="secondary" @click="addSchedule(day.id)">항목 추가</button>
              <button class="secondary" @click="removeDay(day.id)">삭제</button>
            </div>
          </header>

          <div v-for="item in day.items" :key="item.id" class="schedule-block">
            <div class="schedule-row">
              <input v-model="item.time" type="text" placeholder="예: 09:00" />
              <input v-model="item.place" type="text" placeholder="장소를 입력하세요" />
              <button class="secondary" @click="removeSchedule(day.id, item.id)">삭제</button>
            </div>
            <div class="memo-toggle">
              <label>
                <input type="checkbox" v-model="item.hasMemo" />
                메모 추가
              </label>
            </div>
            <textarea v-if="item.hasMemo" v-model="item.note" class="memo-input" placeholder="메모를 입력하세요"></textarea>
          </div>
        </article>
      </div>

      <div class="page-actions">
        <button class="primary" @click="savePlan">저장</button>
        <button class="secondary" @click="clearPlan">초기화</button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { reactive, ref } from 'vue';
import * as XLSX from 'xlsx';

const tripTitle = ref('광주 여행 일정');
const itinerary = reactive([
  {
    id: 1,
    day: 1,
    items: [
      {
        id: Date.now(),
        time: '09:00',
        place: '황리단길',
        hasMemo: true,
        note: '문화공간과 카페가 모여 있는 인기 거리'
      }
    ]
  }
]);

function addDay() {
  itinerary.push({
    id: Date.now(),
    day: itinerary.length + 1,
    items: [
      {
        id: Date.now() + Math.random(),
        time: '',
        place: '',
        hasMemo: false,
        note: ''
      }
    ]
  });
}

function addSchedule(dayId) {
  const day = itinerary.find(item => item.id === dayId);
  if (!day) return;
  day.items.push({
    id: Date.now() + Math.random(),
    time: '',
    place: '',
    hasMemo: false,
    note: ''
  });
}

function removeDay(id) {
  const index = itinerary.findIndex(item => item.id === id);
  if (index !== -1) itinerary.splice(index, 1);
  itinerary.forEach((item, idx) => item.day = idx + 1);
}

function removeSchedule(dayId, itemId) {
  const day = itinerary.find(item => item.id === dayId);
  if (!day) return;
  day.items = day.items.filter(item => item.id !== itemId);
}

function savePlan() {
  alert('일정이 저장되었습니다. (브라우저 메모리 내 저장)');
}

async function downloadPlan() {
  // Build rows matching the provided 양식: 첫 행에 제목/메타, 이후 Day/Time/Place/Note 형식
  const rows = [];
  // Header info
  rows.push(['여행 제목', tripTitle.value]);
  rows.push([]);
  // Table header
  rows.push(['Day', '시간', '장소', '메모']);

  itinerary.forEach(day => {
    day.items.forEach(item => {
      rows.push([`Day ${day.day}`, item.time || '', item.place || '', item.hasMemo ? item.note || '' : '']);
    });
  });

  const ws = XLSX.utils.aoa_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, '일정표');

  const fileName = `${tripTitle.value || '여행일정'}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

function clearPlan() {
  itinerary.splice(0, itinerary.length);
  itinerary.push({
    id: 1,
    day: 1,
    items: [
      {
        id: Date.now(),
        time: '',
        place: '',
        hasMemo: false,
        note: ''
      }
    ]
  });
  tripTitle.value = '광주 여행 일정';
}
</script>
