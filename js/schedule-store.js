// スケジュールデータストア (JSON file + localStorage fallback)
const SCHEDULE_KEY = 'demo_sports_schedule';

const SEED_SCHEDULE = [
  { id: '1', day: '水曜日', time: '16:30〜18:00', location: '○○小学校グラウンド', target: '1〜3年生', note: '', status: 'published', createdAt: '2026-02-01T09:00:00', updatedAt: '2026-02-01T09:00:00' },
  { id: '2', day: '水曜日', time: '16:30〜18:30', location: '○○小学校グラウンド', target: '4〜6年生', note: '', status: 'published', createdAt: '2026-02-01T09:00:00', updatedAt: '2026-02-01T09:00:00' },
  { id: '3', day: '土曜日', time: '9:00〜12:00', location: '総合運動公園', target: '全学年', note: '雨天時は体育館', status: 'published', createdAt: '2026-02-01T09:00:00', updatedAt: '2026-02-01T09:00:00' },
  { id: '4', day: '日曜日', time: '—', location: '—', target: '—', note: '試合・大会（不定期）', status: 'published', createdAt: '2026-02-01T09:00:00', updatedAt: '2026-02-01T09:00:00' },
];

const ScheduleStore = {
  _cache: null,

  async init() {
    try {
      const res = await fetch('data/schedule.json');
      if (res.ok) {
        this._cache = await res.json();
        return;
      }
    } catch (e) { /* fetch失敗時はlocalStorageフォールバック */ }
    this._cache = null;
  },

  _getAll() {
    if (this._cache) return [...this._cache];
    const raw = localStorage.getItem(SCHEDULE_KEY);
    if (!raw) {
      localStorage.setItem(SCHEDULE_KEY, JSON.stringify(SEED_SCHEDULE));
      return [...SEED_SCHEDULE];
    }
    return JSON.parse(raw);
  },

  getPublished() {
    return this._getAll().filter(s => s.status === 'published');
  },

  getAll() {
    return this._getAll();
  },

  getById(id) {
    return this._getAll().find(s => s.id === id) || null;
  },

  save(item) {
    const all = this._getAll();
    const now = new Date().toISOString();
    if (item.id) {
      const idx = all.findIndex(s => s.id === item.id);
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
    localStorage.setItem(SCHEDULE_KEY, JSON.stringify(all));
    return item;
  },

  delete(id) {
    const all = this._getAll().filter(s => s.id !== id);
    localStorage.setItem(SCHEDULE_KEY, JSON.stringify(all));
  },
};

if (typeof module !== 'undefined') module.exports = ScheduleStore;
