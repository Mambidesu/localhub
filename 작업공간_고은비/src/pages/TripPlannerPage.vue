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

          <div class="day-date">
            <div class="date-picker">
              <select v-model.number="day._year" @change="onDateChange(day)">
                <option v-for="y in yearsRange()" :key="y" :value="y">{{ y }}</option>
              </select>
              <select v-model.number="day._month" @change="onDateChange(day)">
                <option v-for="m in 12" :key="m" :value="m">{{ pad(m) }}</option>
              </select>
              <select :key="`${day._year}-${day._month}`" v-model.number="day._day" @change="onDateChange(day)">
                <option v-for="d in daysInMonth(day._year || new Date().getFullYear(), day._month || 1)" :key="d" :value="d">{{ pad(d) }}</option>
              </select>
            </div>
          </div>

          <div v-for="item in day.items" :key="item.id" class="schedule-block">
            <div class="schedule-row">
              <div class="time-picker">
                <select v-model.number="item._hour" @change="onTimeChange(item)">
                  <option v-for="h in hoursRange()" :key="h" :value="h">{{ pad(h) }}</option>
                </select>
                :
                <select v-model.number="item._minute" @change="onTimeChange(item)">
                  <option v-for="m in minutesRange(1)" :key="m" :value="m">{{ pad(m) }}</option>
                </select>
              </div>
              <input v-model="item.place" class="place-input" type="text" placeholder="장소를 입력하세요" />
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

function pad(n) { return n.toString().padStart(2, '0'); }
function daysInMonth(y, m) { return new Date(y, m, 0).getDate(); }
function todayParts() {
  const d = new Date();
  return { y: d.getFullYear(), m: d.getMonth() + 1, d: d.getDate() };
}
function formatDate(y, m, d) { return `${y}-${pad(m)}-${pad(d)}`; }

const today = todayParts();

const itinerary = reactive([
  {
    id: 1,
    day: 1,
    date: formatDate(today.y, today.m, today.d),
    _year: today.y,
    _month: today.m,
    _day: today.d,
    items: [
      {
        id: Date.now(),
        time: '09:00',
        _hour: 9,
        _minute: 0,
        place: '무등산',
        hasMemo: true,
        note: '모노레일 타고 시내 전경 보기!'
      }
    ]
  }
]);

function initDayDate(day) {
  if (!day.date && day._year && day._month && day._day) {
    day.date = formatDate(day._year, day._month, day._day);
    return;
  }
  if (!day._year || !day._month || !day._day) {
    const p = todayParts();
    if (!day.date) day.date = formatDate(p.y, p.m, p.d);
    const parts = day.date.split('-').map(Number);
    day._year = parts[0]; day._month = parts[1]; day._day = parts[2];
  }
}

function onDateChange(day) {
  // clamp day._day to valid days in month
  const maxd = daysInMonth(day._year, day._month);
  if (day._day > maxd) day._day = maxd;
  day.date = formatDate(day._year, day._month, day._day);
}

function yearsRange(spanBefore = 5, spanAfter = 5) {
  const y = new Date().getFullYear();
  const start = y - spanBefore;
  const end = y + spanAfter;
  const arr = [];
  for (let i = start; i <= end; i++) arr.push(i);
  return arr;
}

function addDay() {
  itinerary.push({
    id: Date.now(),
    day: itinerary.length + 1,
    // initialize date fields
    date: formatDate(today.y, today.m, today.d),
    _year: today.y,
    _month: today.m,
    _day: today.d,
    items: [
        {
          id: Date.now() + Math.random(),
          time: '09:00',
          _hour: 9,
          _minute: 0,
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
    time: '09:00',
    _hour: 9,
    _minute: 0,
    place: '',
    hasMemo: false,
    note: ''
  });
}

function hoursRange() { return Array.from({length:24}, (_,i) => i); }
function minutesRange(step = 1) { const arr=[]; for(let i=0;i<60;i+=step) arr.push(i); return arr; }
function onTimeChange(item) {
  const h = Number(item._hour || 0);
  const m = Number(item._minute || 0);
  item.time = `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}`;
}

// (ensureInitDates defined later with item initialization)

function initItemTime(item) {
  if (item._hour === undefined || item._minute === undefined) {
    if (typeof item.time === 'string' && item.time.match(/^\d{1,2}:\d{1,2}$/)) {
      const parts = item.time.split(':').map(Number);
      item._hour = parts[0];
      item._minute = parts[1];
    } else {
      item._hour = 9;
      item._minute = 0;
      item.time = `${pad(item._hour)}:${pad(item._minute)}`;
    }
  }
}

// ensure day date init when adding/removing days AND initialize item times
function ensureInitDates() {
  itinerary.forEach(d => {
    initDayDate(d);
    (d.items || []).forEach(i => initItemTime(i));
  });
}

function removeDay(id) {
  const index = itinerary.findIndex(item => item.id === id);
  if (index !== -1) itinerary.splice(index, 1);
  itinerary.forEach((item, idx) => item.day = idx + 1);
  ensureInitDates();
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
    date: formatDate(today.y, today.m, today.d),
    _year: today.y,
    _month: today.m,
    _day: today.d,
    items: [
      {
        id: Date.now(),
        time: '09:00',
        _hour: 9,
        _minute: 0,
        place: '',
        hasMemo: false,
        note: ''
      }
    ]
  });
  tripTitle.value = '광주 여행 일정';
}

// initialize dates/times for existing itinerary on load
ensureInitDates();
</script>

<style scoped>
.day-date { margin: 8px 0 12px; display:flex; flex-direction:column; gap:6px; }
.date-display { font-size: 14px; color: #1b1b1b; }
.date-picker { display:flex; gap:8px; }
.date-picker select { width: 100px; height: 36px; border-radius:6px; border:1px solid #ddd; padding:4px; background:white; }
@media (max-width:600px) {
  .date-picker select { width: 80px; height:34px; }
}
.time-picker { display:flex; align-items:center; gap:6px; }
.time-picker select { width:72px; height:36px; border-radius:6px; border:1px solid #ddd; padding:4px; background:white; }
.time-picker select + select { margin-left:4px; }

.schedule-row { display:flex; gap:8px; align-items:center; }
.schedule-row .place-input { flex: 1 1 auto; min-width: 120px; padding: 8px; border-radius: 6px; border: 1px solid #ddd; }
.schedule-row button.secondary { flex: 0 0 auto; }
@media (max-width: 600px) {
  .time-picker { width: 92px; }
  .time-picker select { width: 56px; height:32px; }
  .schedule-row .place-input { min-width: 80px; }
}
</style>
