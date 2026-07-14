const basePath = "../data/광주_전라권/";
const tabs = document.querySelectorAll("[data-file]");
const cardsEl = document.getElementById("cards");
const summaryEl = document.getElementById("summary");
const searchInput = document.getElementById("search");
const commentForm = document.getElementById("comment-form");
const commentName = document.getElementById("comment-name");
const commentText = document.getElementById("comment-text");
const commentList = document.getElementById("comment-list");

let currentData = [];
let currentType = "광주_전라권_관광지.json";

async function loadData(fileName) {
  currentType = fileName;
  const res = await fetch(basePath + fileName);
  const data = await res.json();
  currentData = data.items;
  renderSummary(data);
  renderCards(currentData);
  activateTab(fileName);
}

function activateTab(fileName) {
  tabs.forEach(button => {
    button.classList.toggle("active", button.dataset.file === fileName);
  });
}

function renderSummary(data) {
  summaryEl.innerHTML = `
    <h2>${data.contentType} LocalHub</h2>
    <p>지역: ${data.region}</p>
    <p>총 ${data.total}개의 항목</p>
  `;
}

function renderCards(items) {
  const filtered = filterItems(items);
  if (filtered.length === 0) {
    cardsEl.innerHTML = `<div class="card"><p>검색 결과가 없습니다.</p></div>`;
    return;
  }
  cardsEl.innerHTML = filtered.slice(0, 12).map(item => {
    const image = item.firstimage || "https://via.placeholder.com/400x250?text=No+Image";
    return `
      <article class="card place-card">
        <img src="${image}" alt="${item.title}" />
        <h3>${item.title}</h3>
        <p>${item.addr1 || "주소 정보 없음"}</p>
        <p>${item.tel || "전화번호 없음"}</p>
        <p><a href="https://map.kakao.com/link/map/${encodeURIComponent(item.title)},${item.mapy},${item.mapx}" target="_blank">지도 보기</a></p>
      </article>
    `;
  }).join("");
}

function filterItems(items) {
  const term = searchInput.value.trim().toLowerCase();
  if (!term) return items;
  return items.filter(item => 
    item.title.toLowerCase().includes(term) ||
    (item.addr1 || "").toLowerCase().includes(term) ||
    (item.cat1 || "").toLowerCase().includes(term)
  );
}

tabs.forEach(button => {
  button.addEventListener("click", () => loadData(button.dataset.file));
});
searchInput.addEventListener("input", () => renderCards(currentData));

commentForm.addEventListener("submit", event => {
  event.preventDefault();
  const comment = {
    name: commentName.value.trim(),
    text: commentText.value.trim(),
    date: new Date().toLocaleString()
  };
  if (!comment.name || !comment.text) return;
  saveComment(comment);
  commentName.value = "";
  commentText.value = "";
  renderComments();
});

function readComments() {
  return JSON.parse(localStorage.getItem("localhubComments") || "[]");
}
function saveComment(comment) {
  const list = readComments();
  list.unshift(comment);
  localStorage.setItem("localhubComments", JSON.stringify(list.slice(0, 20)));
}
function renderComments() {
  const comments = readComments();
  commentList.innerHTML = `
    <h2>커뮤니티 댓글</h2>
    ${comments.length === 0 ? "<p>첫 번째 댓글을 남겨보세요!</p>" : ""}
    ${comments.map(c => `
      <div class="comment-item">
        <strong>${c.name}</strong>
        <span>${c.date}</span>
        <p>${c.text}</p>
      </div>
    `).join("")}
  `;
}

renderComments();
loadData(currentType);
