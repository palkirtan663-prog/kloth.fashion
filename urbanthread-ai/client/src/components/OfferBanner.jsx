import React, { useState, useEffect } from 'react';
import { Tag, Clock, Copy, Check, Sparkles } from 'lucide-react';

export default function OfferBanner({ onApplyCode }) {
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 28, seconds: 15 });
  const [copiedCode, setCopiedCode] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 6, minutes: 0, seconds: 0 }; // reset cycle
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const offers = [
    { code: 'STREET20', title: '20% OFF', desc: 'On all streetwear drops' },
    { code: 'FIRSTBUY', title: '₹500 OFF', desc: 'Orders above ₹1,500' },
    { code: 'URBAN10', title: '10% OFF', desc: 'Extra discount on checkout' },
    { code: 'FREESHIP', title: 'FREE SHIPPING', desc: 'All orders across India' },
  ];

  const handleCopy = (code) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    if (onApplyCode) onApplyCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const pad = (n) => String(n).padStart(2, '0');

  return (
    <div className="liveOfferBar">
      <div className="offerTicker">
        <div className="offerHighlight">
          <span className="livePulse"></span>
          <b>LIVE DROP OFFERS</b>
          <span className="offerSep">/</span>
          <span className="countdownWrap">
            <Clock size={13} />
            <span>FLASH SALE ENDS IN</span>
            <span className="clockDigits">{pad(timeLeft.hours)}h : {pad(timeLeft.minutes)}m : {pad(timeLeft.seconds)}s</span>
          </span>
        </div>

        <div className="offerChips">
          {offers.map((o) => (
            <button
              key={o.code}
              className={'offerChip ' + (copiedCode === o.code ? 'copied' : '')}
              onClick={() => handleCopy(o.code)}
              title={`Click to copy & apply ${o.code}`}
            >
              <Tag size={12} />
              <span className="chipCode">{o.code}</span>
              <span className="chipTitle">{o.title}</span>
              {copiedCode === o.code ? <Check size={12} className="copyIcon" /> : <Copy size={11} className="copyIcon" />}
            </button>
          ))}
        </div>
      </div>
      {copiedCode && (
        <div className="toastNotice">
          <Sparkles size={14} /> Coupon <b>{copiedCode}</b> copied & ready for bag checkout!
        </div>
      )}
    </div>
  );
}
