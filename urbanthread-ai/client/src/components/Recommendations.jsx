import React from 'react';
import { Sparkles, Star, Plus } from 'lucide-react';
import Img from './Img.jsx';
import { formatINR, productAlt } from '../utils/format.js';

export default function Recommendations({ products = [], onAdd, liked = [], onToggleLike }) {
  if (!products.length) return null;

  // Pick top-rated or trending pieces as recommendations
  const recommended = [...products]
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 4);

  return (
    <section className="recommendationsSection" id="recommendations">
      <div className="sectionContainer">
        <div className="sectionHead">
          <div>
            <p className="eyebrow"><Sparkles size={13} style={{ verticalAlign: -2 }} /> CURATED FOR YOUR FIT</p>
            <h2>Recommended Pieces</h2>
            <p className="recSub">Handpicked streetwear essentials designed to layer effortlessly with your wardrobe.</p>
          </div>
        </div>

        <div className="recGrid">
          {recommended.map((p) => (
            <div key={p.id} className="recCard">
              <div className="recPicWrap">
                <Img src={p.image} alt={productAlt(p)} label={p.name} width={400} height={500} />
                {p.tag && <span className="recTag">{p.tag}</span>}
                <button
                  className="recLikeBtn"
                  onClick={() => onToggleLike && onToggleLike(p.id)}
                  aria-label="Save to wishlist"
                >
                  ♥
                </button>
              </div>
              <div className="recMeta">
                <div className="recInfo">
                  <span className="recCategory">{p.category}</span>
                  <h4>{p.name}</h4>
                  <div className="recRating"><Star size={11} fill="currentColor" /> {p.rating?.toFixed(1) || '4.8'}</div>
                </div>
                <div className="recAction">
                  <b>{formatINR(p.price)}</b>
                  <button
                    className="recAddBtn"
                    onClick={() => onAdd && onAdd({ ...p, quantity: 1, size: 'M' })}
                    title="Add to Bag"
                  >
                    <Plus size={15} /> Add
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
