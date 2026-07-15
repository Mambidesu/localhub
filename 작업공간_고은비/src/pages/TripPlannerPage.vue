<template>
  <section>
    <div class="list-header">
      <h1 class="page-title">여행 일정 생성/관리</h1>
      <button class="primary" @click="addDay">일정 추가</button>
    </div>

    <div class="trip-card">
      <div class="form-group">
        <label>여행 제목</label>
        <input type="text" v-model="tripTitle" placeholder="여행 제목을 입력하세요" />
      </div>
      <div class="trip-list">
        <article v-for="item in itinerary" :key="item.id" class="trip-item">
          <header>
            <strong>Day {{ item.day }}</strong>
            <button class="secondary" @click="removeDay(item.id)">삭제</button>
          </header>
          <div class="form-group">
            <label>장소</label>
            <input type="text" v-model="item.location" placeholder="장소를 입력하세요" />
          </div>
          <div class="form-group">
            <label>메모</label>
            <textarea v-model="item.note" placeholder="메모를 입력하세요"></textarea>
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

const tripTitle = ref('광주 여행 일정');
const itinerary = reactive([{
  id: 1,
  day: 1,
  location: '황리단길',
  note: '문화공간과 카페가 모여 있는 인기 거리'
}]);

function addDay() {
  itinerary.push({ id: Date.now(), day: itinerary.length + 1, location: '', note: '' });
}

function removeDay(id) {
  const index = itinerary.findIndex(item => item.id === id);
  if (index !== -1) itinerary.splice(index, 1);
  itinerary.forEach((item, idx) => item.day = idx + 1);
}

function savePlan() {
  alert('일정이 저장되었습니다. (브라우저 메모리 내 저장)');
}

function clearPlan() {
  itinerary.splice(0, itinerary.length);
  itinerary.push({ id: 1, day: 1, location: '', note: '' });
  tripTitle.value = '광주 여행 일정';
}
</script>
