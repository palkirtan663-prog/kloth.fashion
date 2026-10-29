/*
  aiChatService.js - the shopping assistant.

  DEMO mode  (no AI_API_KEY): rule-based replies built ONLY from the products passed in
             (which come from MongoDB). The API reports mode:"demo" so the UI never
             pretends this is real AI.
  AI mode    (AI_API_KEY set): asks an OpenAI-compatible model to answer as JSON
             {reply, productIds}. Every productId is checked against the catalogue; any
             unusable answer (timeout, HTTP error, bad JSON, unknown product) falls back to
             the demo reply with mode:"fallback".

  This module never touches the database or the browser: products and config are injected,
  so the API key stays on the server and the logic is unit-testable.
*/

const MAX_REPLY_CHARS = 600;

const INTENTS = [
  { words: /\b(tee|tees|t-?shirts?|tshirts?)\b/, category: /t-?shirt|tee/i },
  { words: /\b(hoodies?|sweatshirts?)\b/, category: /hood/i },
  { words: /\b(cargos?|pants?|trousers?|bottoms?|bottomwear|joggers?)\b/, category: /bottom|pant|trouser/i },
  { words: /\b(overshirts?|shackets?)\b/, category: /overshirt/i },
  { words: /\b(jackets?|outerwear|layers?)\b/, category: /jacket/i },
];
const OCCASION_WORDS = /\b(casual|night out|party|date|everyday|daily|college|weekend)\b/;
const OCCASION_CATEGORIES = [/overshirt/i, /t-?shirt|tee/i, /bottom|pant|trouser/i];
const DISCOVERY_WORDS = /\b(best|popular|top|recommend(?:ations?|ed)?|collection|drop|pieces|clothes|clothing|what(?:'s| is)? (?:new|popular|good|available)|what do you have)\b/;
const BUDGET_RE =
  /(?:under|below|less than|within|upto|up to|max(?:imum)?|budget(?: of)?|<)\s*(?:rs\.?|inr|₹)?\s*(\d[\d,]*(?:\.\d+)?)\s*(k\b)?/;

const inr = (n) => `₹${Number(n).toLocaleString('en-IN')}`;
const HELP_TEXT =
  'Try asking me something specific, like “black tee under ₹1,000”, “show me cargos”, or “what should I wear for a casual night out?”';

function parseBudget(s) {
  const m = s.match(BUDGET_RE);
  if (!m) return null;
  let n = Number(m[1].replace(/,/g, ''));
  if (m[2]) n *= 1000;
  return Number.isFinite(n) && n > 0 ? n : null;
}

function hasWord(s, word) {
  return new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`).test(s);
}

function buildDemoReply(message, products) {
  if (!products.length) return 'The catalogue is empty right now, so I have nothing to recommend yet.';

  const s = String(message || '').toLowerCase();
  const budget = parseBudget(s);
  const named = products.filter((p) => s.includes(p.name.toLowerCase()));
  const categoryMatchers = INTENTS.filter((i) => i.words.test(s)).map((i) => i.category);
  const occasion = OCCASION_WORDS.test(s);
  const discovery = DISCOVERY_WORDS.test(s);
  const colourWords = [...new Set(products.flatMap((p) => String(p.color || '').toLowerCase().split(/\s+/)))]
    .filter((w) => w.length >= 3 && hasWord(s, w));

  if (!named.length && !categoryMatchers.length && !occasion && !discovery && !colourWords.length && budget === null) {
    return HELP_TEXT;
  }

  let pool = products;
  let colourMissed = false;
  if (named.length) {
    pool = named;
  } else {
    const matchers = categoryMatchers.length ? categoryMatchers : occasion ? OCCASION_CATEGORIES : [];
    if (matchers.length) pool = pool.filter((p) => matchers.some((re) => re.test(p.category)));
    if (colourWords.length) {
      const byColour = pool.filter((p) => colourWords.some((w) => hasWord(String(p.color || '').toLowerCase(), w)));
      if (byColour.length) pool = byColour;
      else colourMissed = true;
    }
  }

  const beforeBudget = pool;
  if (budget !== null) pool = pool.filter((p) => p.price <= budget);

  if (!pool.length) {
    const closest = [...beforeBudget].sort((a, b) => a.price - b.price).slice(0, 2);
    if (!closest.length) return HELP_TEXT;
    return `I don’t have anything that fits under ${inr(budget)}. The closest is ${closest
      .map((p) => `${p.name} (${inr(p.price)})`)
      .join(' or ')}.`;
  }

  const top = [...pool].sort((a, b) => (b.rating || 0) - (a.rating || 0) || a.price - b.price).slice(0, 3);
  const list = top.map((p) => `${p.name} (${inr(p.price)})`).join(', ');
  const note = colourMissed ? ' I don’t have that exact colour, so these are the closest matches.' : '';
  return `I’d start with ${list}.${note}${top[0].description ? ` ${top[0].description}` : ''}`;
}

function catalogueText(products) {
  return products
    .map((p) => `${p.id} | ${p.name} | ${inr(p.price)} | ${p.category} | ${p.color} | ${p.description}`)
    .join('\n');
}

function parseModelReply(text, products) {
  if (typeof text !== 'string' || !text.trim()) throw new Error('empty AI response');
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end <= start) throw new Error('AI response was not JSON');

  let data;
  try {
    data = JSON.parse(text.slice(start, end + 1));
  } catch {
    throw new Error('AI response was not valid JSON');
  }
  if (!data || typeof data.reply !== 'string' || !data.reply.trim()) throw new Error('AI response had no reply');

  const ids = Array.isArray(data.productIds) ? data.productIds.map(String) : [];
  const known = new Set(products.map((p) => String(p.id)));
  if (ids.some((id) => !known.has(id))) throw new Error('AI recommended a product that does not exist');

  return { reply: data.reply.trim().slice(0, MAX_REPLY_CHARS), productIds: ids };
}

async function askModel({ message, products, ai, fetchImpl }) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ai.timeoutMs);
  try {
    const res = await fetchImpl(`${ai.baseUrl}/chat/completions`, {
      method: 'POST',
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${ai.apiKey}` },
      body: JSON.stringify({
        model: ai.model,
        temperature: 0.3,
        max_tokens: 300,
        messages: [
          {
            role: 'system',
            content:
              'You are Kloth, the concise shopping assistant for the Kloth.fashion store. ' +
              'Recommend ONLY products from the catalogue below. Never invent products, stock, prices, discounts, policies or orders. ' +

              'If nothing fits, say so. Reply with JSON only, no markdown: {"reply": "<max 400 characters>", "productIds": ["<id>", ...]} ' +
              'where productIds are ids copied exactly from the catalogue (use [] if none).\n\n' +
              `Catalogue (id | name | price | category | colour | description):\n${catalogueText(products)}`,
          },
          { role: 'user', content: message },
        ],
      }),
    });
    if (!res.ok) throw new Error(`AI request failed with HTTP ${res.status}`);
    const body = await res.json();
    return parseModelReply(body && body.choices && body.choices[0] && body.choices[0].message && body.choices[0].message.content, products);
  } catch (err) {
    if (err && err.name === 'AbortError') throw new Error(`AI request timed out after ${ai.timeoutMs} ms`);
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

function extractProductIdsFromReply(reply, products) {
  if (typeof reply !== 'string') return [];
  return products.filter((p) => p && p.name && reply.includes(p.name)).map((p) => String(p.id));
}

async function getChatReply({ message, products, ai, fetchImpl = globalThis.fetch }) {
  if (!products.length || !ai.apiKey) {
    const reply = buildDemoReply(message, products);
    return { reply, mode: 'demo', productIds: extractProductIdsFromReply(reply, products) };
  }
  try {
    const { reply, productIds } = await askModel({ message, products, ai, fetchImpl });
    return { reply, mode: 'ai', productIds };
  } catch (err) {
    // Log the reason (never the key) and degrade gracefully.
    console.warn(`[chat] AI unavailable, using demo reply: ${err.message}`);
    const reply = buildDemoReply(message, products);
    return { reply, mode: 'fallback', productIds: extractProductIdsFromReply(reply, products) };
  }
}

module.exports = { getChatReply, buildDemoReply, parseModelReply, parseBudget };
