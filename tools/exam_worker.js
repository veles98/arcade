// exam_worker.js: the Cloudflare Worker behind veles98.github.io/arcade/exam/ («اختبرني»).
// It holds the Gemini key as the secret GEMINI_KEY (Settings -> Variables and Secrets), so the key never reaches the browser.
// Only our site may call it (CORS + Origin check), each visitor gets a small request budget, and a busy model falls through to the next.
// Deploy: Workers -> Create -> Hello World -> Edit code -> paste this file -> Deploy; then add the secret GEMINI_KEY.

const ALLOWED = ['https://veles98.github.io', 'http://localhost:8765'];
const MODELS = ['gemini-3-flash-preview', 'gemini-3.1-flash-lite', 'gemini-flash-latest', 'gemini-flash-lite-latest'];
const MAX_CHARS = 60000;          // prompt size cap (the page sends at most 40k chars of material + instructions)
const LIMIT = 30, WINDOW_MS = 60 * 60 * 1000; // 30 calls per visitor per hour (one exam = 1 call, + 1 to grade written answers)
const hits = new Map();           // best effort, per worker instance

function cors(origin) {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin'
  };
}
function reply(body, status, origin) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', ...cors(origin) } });
}
function overBudget(ip) {
  const now = Date.now(), h = hits.get(ip);
  if (!h || now - h.t > WINDOW_MS) { hits.set(ip, { t: now, n: 1 }); return false; }
  h.n++;
  return h.n > LIMIT;
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    if (!ALLOWED.includes(origin)) return new Response('forbidden', { status: 403 });
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors(origin) });
    if (request.method !== 'POST') return reply({ error: 'method' }, 405, origin);

    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    if (overBudget(ip)) return reply({ error: 'limit' }, 429, origin);

    let prompt;
    try { prompt = String((await request.json()).prompt || ''); } catch (e) { return reply({ error: 'bad json' }, 400, origin); }
    if (!prompt || prompt.length > MAX_CHARS) return reply({ error: 'size' }, 413, origin);

    for (const model of MODELS) {
      const r = await fetch('https://generativelanguage.googleapis.com/v1beta/models/' + model + ':generateContent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': env.GEMINI_KEY },
        body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: prompt }] }], generationConfig: { responseMimeType: 'application/json', temperature: 0.4 } })
      });
      if (r.status === 429 || r.status === 404 || r.status >= 500) continue; // busy or missing: try the next model
      if (!r.ok) return reply({ error: 'upstream ' + r.status }, 502, origin);
      const j = await r.json();
      const text = ((j.candidates && j.candidates[0] && j.candidates[0].content && j.candidates[0].content.parts) || []).map(p => p.text || '').join('');
      return reply({ text, model }, 200, origin);
    }
    return reply({ error: 'busy' }, 503, origin);
  }
};
