import React, { useState } from 'react';
import { Heart, Star, Check, ShoppingBag, AlertTriangle } from 'lucide-react';
import Img from './Img.jsx';
import Tilt from './Tilt.jsx';
import { formatINR, productAlt } from '../utils/format.js';

const DEFAULT_APPAREL_SIZES = ['S', 'M', 'L', 'XL'];
const ACCESSORY_CATEGORIES = ['Caps', 'Earrings', 'Necklaces', 'Chains', 'Bracelets'];

export default function ProductCard({ product: p, liked, onToggleLike, onAdd }) {
  const isAccessory = ACCESSORY_CATEGORIES.includes(p.category);
  const availableSizes = Array.isArray(p.sizes) && p.sizes.length > 0 ? p.sizes : DEFAULT_APPAREL_SIZES;
  const [selectedSize, setSelectedSize] = useState(isAccessory ? 'ONE SIZE' : (availableSizes[1] || availableSizes[0] || 'M'));
  const [justAdded, setJustAdded] = useState(false);

  const isOutOfStock = typeof p.stock === 'number' && p.stock === 0;
  const isLowStock = typeof p.stock === 'number' && p.stock > 0 && p.stock <= 8;

  const handleAdd = (e) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    if (onAdd) {
      onAdd({ ...p, size: isAccessory ? 'ONE SIZE' : selectedSize, quantity: 1 }, e);
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 1600);
    }
  };

  return (
    <article className={`product ${isOutOfStock ? 'outOfStockProduct' : ''}`} data-category={p.category}>
      <Tilt className="pic">
        <Img src={p.image} alt={productAlt(p)} label={p.name} sublabel={`${p.category} · ${p.color}`} />
        <div className="cardBadgesRow">
          {p.tag && <span className={`prodTagBadge tag-${p.tag.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}>{p.tag}</span>}
          {p.gender && p.gender !== 'Unisex' && <span className="genderMiniBadge">{p.gender}</span>}
        </div>

        <button
          className="likeBtn"
          onClick={() => onToggleLike(p.id)}
          aria-pressed={liked}
          aria-label={liked ? `Remove ${p.name} from wishlist` : `Save ${p.name} to wishlist`}
        >
          <Heart fill={liked ? 'currentColor' : 'none'} size={18} />
        </button>

        {/* Quick Add Overlay */}
        <div className="quick">
          {!isAccessory ? (
            <div className="cardSizeSelect" onClick={(e) => e.stopPropagation()}>
              {availableSizes.map((s) => (
                <button
                  key={s}
                  type="button"
                  className={'cardSizeBtn ' + (selectedSize === s ? 'active' : '')}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedSize(s);
                  }}
                  aria-label={`Select size ${s}`}
                  aria-pressed={selectedSize === s}
                >
                  {s}
                </button>
              ))}
            </div>
          ) : (
            <div className="cardSizeSelect accessorySize" onClick={(e) => e.stopPropagation()}>
              <span className="cardSizeBtn active oneSizeBtn">ONE SIZE</span>
            </div>
          )}

          <button
            onClick={handleAdd}
            className={`quickAddBtn ${justAdded ? 'added' : ''} ${isOutOfStock ? 'disabledAdd' : ''}`}
            disabled={justAdded || isOutOfStock}
            type="button"
          >
            {isOutOfStock ? (
              'Sold Out'
            ) : justAdded ? (
              <>
                <Check size={14} /> Added to Bag
              </>
            ) : (
              <>
                <ShoppingBag size={13} style={{ marginRight: 4 }} />
                Add to Bag {!isAccessory ? `(${selectedSize})` : ''}
              </>
            )}
          </button>
        </div>
      </Tilt>

      <div className="meta">
        <div>
          <h3>{p.name}</h3>
          <p>{p.category}{p.color ? ` · ${p.color}` : ''}</p>
        </div>
        <strong>{formatINR(p.price)}</strong>
      </div>

      {p.description && <p className="desc">{p.description}</p>}

      <div className="cardBottomMeta">
        <div className="rating">
          <Star size={13} fill="currentColor" /> {Number(p.rating || 4.8).toFixed(1)}
          <span className="ratingReviews">({Math.floor((p.price % 37) + 12)} reviews)</span>
        </div>

        {isLowStock && (
          <span className="lowStockWarning">
            <AlertTriangle size={11} /> Only {p.stock} left
          </span>
        )}
      </div>
    </article>
  );
}
