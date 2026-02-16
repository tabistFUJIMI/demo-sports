// お知らせデータストア (JSON file + localStorage fallback)
const NEWS_KEY = 'demo_sports_news';

const SEED_NEWS = [
  {
    id: '1',
    title: 'ホームページを開設しました',
    body: '<p>ふじみDXラボFCのホームページを開設しました。</p><p>練習スケジュールや大会結果をお伝えします。</p>',
    category: 'お知らせ',
    status: 'published',
    createdAt: '2026-02-10T09:00:00',
    updatedAt: '2026-02-10T09:00:00',
  },
  {
    id: '2',
    title: '春季大会の結果報告',
    body: '<p>2月の春季大会に出場し、見事ベスト8に入りました！</p><p>選手たちの頑張りに拍手！</p>',
    category: '大会結果',
    status: 'published',
    createdAt: '2026-02-08T09:00:00',
    updatedAt: '2026-02-08T09:00:00',
  },
  {
    id: '3',
    title: '3月の練習スケジュール変更のお知らせ',
    body: '<p>3月第2週は卒業式準備のためグラウンドが使用できません。</p><p>代替練習場所は追ってお知らせします。</p>',
    category: 'お知らせ',
    status: 'published',
    createdAt: '2026-01-25T09:00:00',
    updatedAt: '2026-01-25T09:00:00',
  },
];

const NewsStore = {
  _cache: null,

  async init() {
    try {
      const res = await fetch('data/news.json');
      if (res.ok) {
        this._cache = await res.json();
        return;
      }
    } catch (e) { /* fetch失敗時はlocalStorageフォールバック */ }
    this._cache = null;
  },

  _getAll() {
    if (this._cache) return [...this._cache];
    const raw = localStorage.getItem(NEWS_KEY);
    if (!raw) {
      localStorage.setItem(NEWS_KEY, JSON.stringify(SEED_NEWS));
      return [...SEED_NEWS];
    }
    return JSON.parse(raw);
  },

  getPublished() {
    return this._getAll()
      .filter(n => n.status === 'published')
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  getAll() {
    return this._getAll().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  getById(id) {
    return this._getAll().find(n => n.id === id) || null;
  },

  save(item) {
    const all = this._getAll();
    const now = new Date().toISOString();
    if (item.id) {
      const idx = all.findIndex(n => n.id === item.id);
      if (idx >= 0) {
        all[idx] = { ...all[idx], ...item, updatedAt: now };
      }
    } else {
      item.id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      item.createdAt = now;
      item.updatedAt = now;
      item.status = item.status || 'published';
      all.push(item);
    }
    localStorage.setItem(NEWS_KEY, JSON.stringify(all));
    return item;
  },

  delete(id) {
    const all = this._getAll().filter(n => n.id !== id);
    localStorage.setItem(NEWS_KEY, JSON.stringify(all));
  },
};

if (typeof module !== 'undefined') module.exports = NewsStore;
