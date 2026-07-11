const K = {
  KEYS: 'lockin.apiKeys',
  PREFS: 'lockin.prefs',
  RESUME: 'lockin.resume',
  ANALYSIS: 'lockin.analysis',
  HISTORY: 'lockin.history',
};

const read = (k, fallback) => {
  try {
    const v = localStorage.getItem(k);
    return v ? JSON.parse(v) : fallback;
  } catch { return fallback; }
};
const write = (k, v) => localStorage.setItem(k, JSON.stringify(v));

export const getKeys = () => read(K.KEYS, { gemini: '', openai: '', tavily: '' });
export const setKeys = (v) => write(K.KEYS, v);

export const getPrefs = () => read(K.PREFS, {
  voiceMode: 'interviewer',
  answerLength: 'auto',
  model: 'gemini-2.5-flash-lite',
});
export const setPrefs = (v) => write(K.PREFS, v);

export const getResume = () => read(K.RESUME, null);
export const setResume = (v) => write(K.RESUME, v);

export const getAnalysis = () => read(K.ANALYSIS, null);
export const setAnalysis = (v) => write(K.ANALYSIS, v);

export const getHistory = () => read(K.HISTORY, []);
export const pushHistory = (item) => {
  const list = getHistory();
  list.unshift({ ...item, ts: Date.now() });
  write(K.HISTORY, list.slice(0, 200));
};

export const STORAGE_KEYS = K;
