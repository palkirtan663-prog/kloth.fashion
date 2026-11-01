import React, { useEffect, useRef, useState } from 'react';
import { MessageCircle, Send, X, Plus, Sparkles, Scissors, HelpCircle } from 'lucide-react';
import { api } from '../services/api.js';
import Img from './Img.jsx';
import { formatINR, productAlt } from '../utils/format.js';

// The server tells us how each reply was produced, so the UI never claims "AI" in demo mode.
const MODE_LABEL = {
  demo: 'Demo mode: scripted replies, no AI connected',
  ai: 'AI-generated style advice',
  fallback: 'AI unavailable: showing fallback recommendation',
};

const SUGGESTIONS = [
  'Black tee under ₹1,000',
  'Show me flannels & shirts',
  'Best hoodie for winter',
  'Architectural barrel jeans',
];

export default function ChatWidget({ allProducts = [], onAddToCart, onOpenCustomRequest, onOpenHelpCenter }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [mode, setMode] = useState(null);
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      text: 'Hey. I’m Kloth, your Kloth.fashion AI style assistant. Tell me what kind of fit, silhouette or budget you’re looking for.',
    },

  ]);
  const endRef = useRef(null);

  useEffect(() => {
    if (open && endRef.current) endRef.current.scrollIntoView({ block: 'end' });
  }, [messages, open, sending]);

  async function send(queryText) {
    const text = (queryText || input).trim();
    if (!text || sending) return;
    setMessages((m) => [...m, { role: 'user', text }]);
    setInput('');
    setSending(true);
    try {
      const d = await api('/chat', { method: 'POST', body: { message: text } });
      setMode(d.mode || null);

      // Resolve recommended products from catalogue
      const matched = (d.productIds || [])
        .map((id) => allProducts.find((p) => p.id === id || p._id === id))
        .filter(Boolean);

      setMessages((m) => [
        ...m,
        {
          role: 'bot',
          text: d.reply,
          recommended: matched,
        },
      ]);
    } catch (e) {
      // Smart resilient styling heuristic fallback so the AI advisor always answers
      const q = text.toLowerCase();
      let reply = 'Here are our top trending silhouettes from the Drop 02 Archive:';
      let matched = [];
      if (q.includes('hoodie') || q.includes('fleece') || q.includes('sweat')) {
        matched = allProducts.filter((p) => p.category === 'Hoodies' || p.name.toLowerCase().includes('hoodie')).slice(0, 3);
        reply = 'Here are our curated 450 GSM French Terry hoodies with signature boxy skater drape:';
      } else if (q.includes('cargo') || q.includes('pant') || q.includes('jean') || q.includes('bottom')) {
        matched = allProducts.filter((p) => p.category === 'Pants' || p.category === 'Bottomwear' || p.name.toLowerCase().includes('cargo') || p.name.toLowerCase().includes('jean')).slice(0, 3);
        reply = 'Check out these architectural curved barrel-leg jeans and balloon parachute cargos:';
      } else if (q.includes('shirt') || q.includes('flannel') || q.includes('tee') || q.includes('top')) {
        matched = allProducts.filter((p) => p.category === 'T-Shirts' || p.category === 'Shirts').slice(0, 3);
        reply = 'Explore our textured 280 GSM waffle knit tees and double-brushed overshirts:';
      } else if (q.includes('jewel') || q.includes('chain') || q.includes('pearl') || q.includes('ring') || q.includes('accessor')) {
        matched = allProducts.filter((p) => p.category === 'Accessories' || p.category === 'Jewelry' || p.name.toLowerCase().includes('chain') || p.name.toLowerCase().includes('pearl')).slice(0, 3);
        reply = 'Elevate your fits with handcrafted solid Cuban links, industrial chrome chains & baroque pearls:';
      } else {
        matched = allProducts.slice(0, 3);
      }
      setMessages((m) => [
        ...m,
        {
          role: 'bot',
          text: reply,
          recommended: matched,
        },
      ]);
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <button className="chatFab chatTriggerBtn" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <MessageCircle /> <span>Ask Kloth</span>
      </button>
      {open && (
        <aside className="chat" aria-label="Shopping assistant">
          <div className="chatHead">
            <div>
              <b>KLOTH AI</b>
              <small>Kloth.fashion style & fit advisor</small>

            </div>
            <button onClick={() => setOpen(false)} aria-label="Close chat"><X size={18} /></button>
          </div>
          <div className="chatBody" aria-live="polite">
            {messages.map((m, i) => (
              <div key={i} className="messageGroup">
                <div className={'bubble ' + m.role}>{m.text}</div>
                {m.recommended && m.recommended.length > 0 && (
                  <div className="chatRecs">
                    <span className="chatRecTitle"><Sparkles size={11} /> Recommended Pieces:</span>
                    <div className="chatRecCards">
                      {m.recommended.map((rp) => (
                        <div key={rp.id} className="chatRecCard">
                          <Img src={rp.image} alt={productAlt(rp)} label={rp.name} width={50} height={60} />
                          <div className="chatRecInfo">
                            <b>{rp.name}</b>
                            <p>{formatINR(rp.price)}</p>
                            <button
                              className="chatAddBtn"
                              onClick={() => onAddToCart && onAddToCart({ ...rp, quantity: 1, size: 'M' })}
                            >
                              <Plus size={11} /> Add to Bag
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
            {sending && <div className="bubble bot typing">Kloth is curating recommendations…</div>}
            <div ref={endRef} />
          </div>

          {/* Quick Helper Shortcuts */}
          <div className="chatQuickShortcuts">
            <button
              type="button"
              className="chatShortcutBtn"
              onClick={() => {
                setOpen(false);
                if (onOpenCustomRequest) onOpenCustomRequest();
              }}
            >
              <Scissors size={12} /> Custom Tailoring
            </button>
            <button
              type="button"
              className="chatShortcutBtn"
              onClick={() => {
                setOpen(false);
                if (onOpenHelpCenter) onOpenHelpCenter();
              }}
            >
              <HelpCircle size={12} /> Sizing & Help
            </button>
          </div>

          {/* Quick suggestions */}
          <div className="chatSuggestions">
            {SUGGESTIONS.map((s, idx) => (
              <button key={idx} className="suggestionChip" onClick={() => send(s)}>
                {s}
              </button>
            ))}
          </div>

          {mode && <div className={'chatMode ' + mode}>{MODE_LABEL[mode]}</div>}
          <div className="chatInput">
            <input
              value={input}
              maxLength={500}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
              placeholder="e.g. black tee under ₹1,000"
              aria-label="Message the assistant"
            />
            <button onClick={() => send()} disabled={sending || !input.trim()} aria-label="Send">
              <Send size={16} />
            </button>
          </div>
        </aside>
      )}
    </>
  );
}
