// ===== 예식 정보 (여기만 바꾸면 달력/카운트다운이 함께 바뀝니다) =====
const WEDDING_DATE = new Date(2027, 4, 15, 12, 30); // 월은 0부터 시작 → 4 = 5월

// ===== 1. 달력 그리기 =====
function renderCalendar() {
  const calendar = document.getElementById('calendar');
  const year = WEDDING_DATE.getFullYear();
  const month = WEDDING_DATE.getMonth();
  const day = WEDDING_DATE.getDate();

  const firstWeekday = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();
  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];

  let html = '<div class="calendar__grid">';

  weekdays.forEach((w, i) => {
    const cls = i === 0 ? 'sun' : i === 6 ? 'sat' : '';
    html += `<div class="calendar__head calendar__cell ${cls}">${w}</div>`;
  });

  for (let i = 0; i < firstWeekday; i++) {
    html += '<div class="calendar__cell"></div>';
  }

  for (let d = 1; d <= lastDate; d++) {
    const weekday = (firstWeekday + d - 1) % 7;
    const classes = ['calendar__cell'];
    if (weekday === 0) classes.push('sun');
    if (weekday === 6) classes.push('sat');
    if (d === day) classes.push('is-day');
    html += `<div class="${classes.join(' ')}">${d}</div>`;
  }

  html += '</div>';
  calendar.innerHTML = html;
}

// ===== 2. D-day 카운트다운 =====
function updateCountdown() {
  const diff = WEDDING_DATE - new Date();
  const msg = document.getElementById('countdown-msg');

  if (diff <= 0) {
    document.getElementById('countdown').style.display = 'none';
    msg.innerHTML = '저희 두 사람, <em>결혼했습니다</em> ♥';
    return;
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const mins = Math.floor((diff / (1000 * 60)) % 60);
  const secs = Math.floor((diff / 1000) % 60);

  document.getElementById('cd-days').textContent = days;
  document.getElementById('cd-hours').textContent = hours;
  document.getElementById('cd-mins').textContent = mins;
  document.getElementById('cd-secs').textContent = secs;

  msg.innerHTML = `민준 ♥ 서연의 결혼식이 <em>${days}일</em> 남았습니다`;
}

// ===== 3. 토스트 알림 =====
let toastTimer;
function showToast(text) {
  const toast = document.getElementById('toast');
  toast.textContent = text;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2000);
}

// ===== 4. 복사 기능 (주소, 계좌번호, 링크) =====
async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    // 로컬 파일(file://) 등 clipboard API를 못 쓰는 환경용 대체 방법
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
  }
}

function initCopyButtons() {
  document.querySelectorAll('.copy-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      await copyText(btn.dataset.copy);
      showToast('복사되었습니다');
    });
  });

  document.getElementById('share-btn').addEventListener('click', async () => {
    const url = location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: document.title, url });
      } catch { /* 사용자가 공유를 취소한 경우 */ }
    } else {
      await copyText(url);
      showToast('청첩장 링크가 복사되었습니다');
    }
  });
}

// ===== 5. 계좌번호 아코디언 =====
function initAccordion() {
  document.querySelectorAll('.accordion__head').forEach((head) => {
    head.addEventListener('click', () => {
      const body = head.nextElementSibling;
      const isOpen = head.getAttribute('aria-expanded') === 'true';
      head.setAttribute('aria-expanded', String(!isOpen));
      body.style.maxHeight = isOpen ? '0' : body.scrollHeight + 'px';
    });
  });
}

// ===== 6. 갤러리 라이트박스 =====
function initGallery() {
  const items = Array.from(document.querySelectorAll('.gallery__item'));
  const lightbox = document.getElementById('lightbox');
  const view = document.getElementById('lightbox-img');
  let current = 0;

  function show(index) {
    current = (index + items.length) % items.length;
    const item = items[current];
    const img = item.querySelector('img');
    view.innerHTML = img ? `<img src="${img.src}" alt="${img.alt}">` : item.textContent;
    view.style.background = getComputedStyle(item).backgroundColor;
  }

  function open(index) {
    show(index);
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
  }

  function close() {
    lightbox.hidden = true;
    document.body.style.overflow = '';
  }

  items.forEach((item, i) => item.addEventListener('click', () => open(i)));
  lightbox.querySelector('.lightbox__close').addEventListener('click', close);
  lightbox.querySelector('.lightbox__prev').addEventListener('click', () => show(current - 1));
  lightbox.querySelector('.lightbox__next').addEventListener('click', () => show(current + 1));
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) close(); });

  document.addEventListener('keydown', (e) => {
    if (lightbox.hidden) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') show(current - 1);
    if (e.key === 'ArrowRight') show(current + 1);
  });
}

// ===== 7. 스크롤 시 섹션 서서히 나타나기 =====
function initFadeIn() {
  const targets = document.querySelectorAll('.fade-in');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  targets.forEach((el) => observer.observe(el));
}

// ===== 실행 =====
document.addEventListener('DOMContentLoaded', () => {
  renderCalendar();
  updateCountdown();
  setInterval(updateCountdown, 1000);
  initCopyButtons();
  initAccordion();
  initGallery();
  initFadeIn();
});
