import OpenAI from 'https://esm.sh/openai?bundle';

const statusEl = document.getElementById('newsStatus');
const tableBody = document.querySelector('#newsTable tbody');

let openaiApiKey = localStorage.getItem('openaiApiKey') || '';
const googleCseCx = localStorage.getItem('googleCseCx') || '';
const googleApiKey = localStorage.getItem('googleApiKey') || '';
const serpApiKey = localStorage.getItem('serpApiKey') || '';

// Prompt for OpenAI key if missing (same as scanner page)
if (!openaiApiKey) {
  setTimeout(() => {
    if (confirm('Enter your OpenAI API key to enable AI news extraction?')) {
      const key = prompt('OpenAI API key (sk-...)');
      if (key) {
        localStorage.setItem('openaiApiKey', key.trim());
        openaiApiKey = key.trim();
        location.reload();
      }
    }
  }, 500);
}

function setStatus(msg) { statusEl.textContent = msg || ''; }

async function fetchWithTimeout(url, { timeoutMs = 10000, headers = {} } = {}) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { headers, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(id);
  }
}

// Try direct fetch; on CORS failure, retry via public CORS proxies
async function fetchJsonWithCors(url, { timeoutMs = 12000 } = {}) {
  try {
    // SerpAPI blocks CORS; prefer proxy-first for those URLs
    if (!/serpapi\.com/i.test(url)) {
      const res = await fetchWithTimeout(url, { timeoutMs });
      if (res.ok) return await res.json();
    }
  } catch (_) {}
  const proxies = [
    u => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`,
    u => `https://thingproxy.freeboard.io/fetch/${u}`,
    u => `https://r.jina.ai/http://${u.replace(/^https?:\/\//, '')}`
  ];
  for (const wrap of proxies) {
    try {
      const proxied = wrap(url);
      const res = await fetchWithTimeout(proxied, { timeoutMs });
      if (!res.ok) continue;
      const text = await res.text();
      try { return JSON.parse(text); } catch { /* not JSON */ }
    } catch (_) {}
  }
  return null;
}

async function searchNews(query) {
  const q = encodeURIComponent(query);
  // Prefer SerpAPI Google News if available
  if (serpApiKey) {
    const url = `https://serpapi.com/search.json?engine=google_news&q=${q}&gl=sg&hl=en&when=7d&api_key=${serpApiKey}`;
    const data = await fetchJsonWithCors(url, { timeoutMs: 12000 });
    if (data) {
      const news = Array.isArray(data.news_results) ? data.news_results : [];
      // Normalize to CSE-like items for downstream code
      return news.map(n => ({ title: n.title, link: n.link, snippet: n.snippet || n.title, displayLink: new URL(n.link).hostname }));
    }
  }
  // Fallback: Google CSE web search
  if (googleCseCx && googleApiKey) {
    const url = `https://www.googleapis.com/customsearch/v1?q=${q}&cx=${googleCseCx}&key=${googleApiKey}&num=10&gl=sg`;
    const data = await fetchJsonWithCors(url, { timeoutMs: 12000 });
    if (data) {
      return Array.isArray(data.items) ? data.items : [];
    }
  }
  return [];
}

function cleanHtml(html) {
  const el = document.createElement('div');
  el.innerHTML = html;
  return el.textContent || el.innerText || '';
}

function ruleBasedExtract(items) {
  const openRe = /(opens|opening|to open|launch(?:es|ing)?|debut|set to open)/i;
  const closeRe = /(closes|closure|closing|to close|shutting down|shut(?:s)?|cease operations)/i;
  return items
    .map(it => {
      const t = `${it.title || ''} ${it.snippet || ''}`;
      let eventType = '';
      if (openRe.test(t)) eventType = 'opening';
      else if (closeRe.test(t)) eventType = 'closure';
      if (!eventType) return null;
      return {
        eventType,
        businessName: it.title?.split(':')[0] || '',
        location: '',
        headline: it.title || '',
        date: '',
        sourceUrl: it.link,
        sourceOutlet: it.displayLink || (it.link ? new URL(it.link).hostname : ''),
        confidence: 0.4
      };
    })
    .filter(Boolean);
}

async function extractEventsFromSnippets(items) {
  if (!items.length) return [];
  if (!openaiApiKey) return ruleBasedExtract(items);
  const client = new OpenAI({ apiKey: openaiApiKey, dangerouslyAllowBrowser: true });
  const snippets = items.map(it => ({
    title: it.title,
    link: it.link,
    snippet: cleanHtml(it.snippet || ''),
    displayLink: it.displayLink
  }));

  const schema = {
    type: 'json_schema',
    json_schema: {
      name: 'business_events',
      schema: {
        type: 'object',
        properties: {
          events: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                eventType: { enum: ['opening', 'closure', 'reopening', 'relocation'] },
                businessName: { type: 'string' },
                location: { type: 'string' },
                headline: { type: 'string' },
                date: { type: 'string' },
                sourceUrl: { type: 'string' },
                sourceOutlet: { type: 'string' },
                confidence: { type: 'number' }
              },
              required: ['eventType','businessName','sourceUrl','sourceOutlet','confidence']
            }
          }
        },
        required: ['events']
      }
    }
  };

  const prompt = `From the news snippets below, list only headlines that clearly indicate a business opening or closure (Singapore focus). If unsure, skip. Return JSON per schema.
  ${snippets.map((s, i) => `
  [${i+1}] TITLE: ${s.title}
  OUTLET: ${s.displayLink}
  URL: ${s.link}
  SNIPPET: ${s.snippet}
  `).join('\n')}`;

  try {
    const resp = await client.responses.create({
      model: 'gpt-4o-mini',
      response_format: schema,
      input: [{ role: 'user', content: prompt }]
    });
    const content = resp.output_text || '{}';
    try { return JSON.parse(content).events || []; } catch { return ruleBasedExtract(items); }
  } catch (e) {
    // 401 or any failure → fallback
    setStatus('OpenAI auth failed — falling back to keyword filter.');
    return ruleBasedExtract(items);
  }
}

function renderEvents(events) {
  tableBody.innerHTML = '';
  events.forEach((ev, idx) => {
    const tr = document.createElement('tr');
    tr.className = 'table-row';
    tr.innerHTML = `
      <td>${idx + 1}</td>
      <td>${ev.headline || ''}</td>
      <td>${ev.eventType || ''}</td>
      <td>${ev.businessName || ''}</td>
      <td>${ev.location || ''}</td>
      <td>${ev.date || ''}</td>
      <td>${ev.sourceOutlet || ''} — <a href="${ev.sourceUrl}" target="_blank" rel="noopener">link</a></td>
    `;
    tableBody.appendChild(tr);
  });
}

async function refreshNews() {
  setStatus('Searching news…');
  try {
    const items = await searchNews('site:todayonline.com OR site:straitstimes.com opening OR closure OR closes OR shutting down Singapore');
    if (!items.length) { setStatus('No results'); return; }
    setStatus('Extracting events…');
    const events = await extractEventsFromSnippets(items);
    renderEvents(events);
    setStatus(events.length ? `Found ${events.length} events` : 'No opening/closure headlines detected');
  } catch (e) {
    setStatus('Failed to load news');
  }
}

document.getElementById('refreshNewsBtn').addEventListener('click', refreshNews);

// Auto-load on open with soft prompt for keys if missing
if (serpApiKey || (googleCseCx && googleApiKey)) {
  refreshNews();
} else {
  setStatus('Set SerpAPI or Google CSE keys to enable news search.');
  setTimeout(() => {
    if (confirm('Enter your SerpAPI key to enable news search?')) {
      const s = prompt('SerpAPI key');
      if (s) {
        localStorage.setItem('serpApiKey', s.trim());
        location.reload();
      }
    }
  }, 600);
}


