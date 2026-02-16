// メインJS: スクロールアニメーション、ヘッダー制御、動的コンテンツ
document.addEventListener('DOMContentLoaded', async () => {
  // --- Store Init ---
  const inits = [];
  if (typeof NewsStore !== 'undefined' && NewsStore.init) inits.push(NewsStore.init());
  if (typeof ScheduleStore !== 'undefined' && ScheduleStore.init) inits.push(ScheduleStore.init());
  await Promise.all(inits);

  // --- Scroll Header ---
  const header = document.querySelector('.header');
  if (header) {
    window.addEventListener('scroll', () => {
      header.classList.toggle('header--scrolled', window.scrollY > 20);
    }, { passive: true });
  }

  // --- Mobile Menu ---
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('is-open');
      nav.classList.toggle('is-open');
    });
    nav.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        toggle.classList.remove('is-open');
        nav.classList.remove('is-open');
      });
    });
  }

  // --- Scroll Reveal ---
  const reveals = document.querySelectorAll('.reveal');
  if (reveals.length > 0) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const delay = entry.target.dataset.delay || 0;
          setTimeout(() => entry.target.classList.add('is-visible'), delay);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(el => observer.observe(el));
  }

  // --- Re-observe helper ---
  function reobserve(container) {
    container.querySelectorAll('.reveal').forEach(el => {
      const obs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) { entry.target.classList.add('is-visible'); obs.unobserve(entry.target); }
        });
      }, { threshold: 0.1 });
      obs.observe(el);
    });
  }

  // --- Dynamic News (Top page) ---
  const newsList = document.getElementById('news-list');
  if (newsList && typeof NewsStore !== 'undefined') {
    const news = NewsStore.getPublished().slice(0, 5);
    newsList.innerHTML = news.map(n => {
      const date = new Date(n.createdAt).toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '.');
      const tagClass = n.category === '大会結果' ? 'tag-result' : 'tag-info';
      return `<li>
        <a href="news.html?id=${n.id}">
          <span class="news-date">${date}</span>
          <span class="news-tag ${tagClass}">${n.category}</span>
          <span class="news-text">${n.title}</span>
        </a>
      </li>`;
    }).join('');
    if (news.length === 0) {
      newsList.innerHTML = '<li style="color:#888;padding:24px 0;">現在お知らせはありません。</li>';
    }
  }

  // --- Dynamic Schedule (Top page) ---
  const scheduleList = document.getElementById('schedule-list');
  if (scheduleList && typeof ScheduleStore !== 'undefined') {
    const schedules = ScheduleStore.getPublished();
    let html = '<div class="schedule-table-wrap">';
    html += '<table class="schedule-table">';
    html += '<thead><tr><th>曜日</th><th>時間</th><th>場所</th><th>対象</th><th>備考</th></tr></thead>';
    html += '<tbody>';
    html += schedules.map(s => `
      <tr class="reveal">
        <td class="schedule-day">${s.day}</td>
        <td>${s.time}</td>
        <td>${s.location}</td>
        <td>${s.target}</td>
        <td class="schedule-note">${s.note || '—'}</td>
      </tr>
    `).join('');
    html += '</tbody></table></div>';
    scheduleList.innerHTML = html;
    reobserve(scheduleList);
  }
});
