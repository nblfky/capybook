import OpenAI from 'https://esm.sh/openai?bundle';

const statusEl = document.getElementById('newsStatus');
const tableBody = document.querySelector('#newsTable tbody');

const openaiApiKey = localStorage.getItem('openaiApiKey') || '';
const googleCseCx = localStorage.getItem('googleCseCx') || '';
const googleApiKey = localStorage.getItem('googleApiKey') || '';

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

async function searchNews(query) {
  if (!googleCseCx || !googleApiKey) return [];
  const q = encodeURIComponent(query);
  const url = `https://www.googleapis.com/customsearch/v1?q=${q}&cx=${googleCseCx}&key=${googleApiKey}&num=10&gl=sg`; 
  const res = await fetchWithTimeout(url, { timeoutMs: 12000 });
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data.items) ? data.items : [];
}

function cleanHtml(html) {
  const el = document.createElement('div');
  el.innerHTML = html;
  return el.textContent || el.innerText || '';
}

async function extractEventsFromSnippets(items) {
  if (!openaiApiKey || !items.length) return [];
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

  const resp = await client.responses.create({
    model: 'gpt-4o-mini',
    response_format: schema,
    input: [{ role: 'user', content: prompt }]
  });
  const content = resp.output_text || '{}';
  try { return JSON.parse(content).events || []; } catch { return []; }
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

// Auto-load on open
refreshNews();


