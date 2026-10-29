import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, ArrowRight, Tag, Truck } from 'lucide-react';
import Img from './Img.jsx';
import { formatINR, productAlt } from '../utils/format.js';

const CartDialog = React.forwardRef(function CartDialog(
  { cart, onUpdateQty, onRemove, onProceedToCheckout, initialPromo = '' },
  ref
) {
  const [promoCode, setPromoCode] = useState(initialPromo);
  const [appliedPromo, setAppliedPromo] = useState(initialPromo ? initialPromo.toUpperCase() : '');
  const [promoError, setPromoError] = useState('');

  const subtotal = cart.reduce((s, p) => s + (p.price * (p.quantity || 1)), 0);

  let discount = 0;
  if (appliedPromo === 'STREET20') discount = Math.round(subtotal * 0.20);
  else if (appliedPromo === 'FIRSTBUY') discount = subtotal >= 1500 ? 500 : 0;
  else if (appliedPromo === 'URBAN10') discount = Math.round(subtotal * 0.10);

  const freeShippingThreshold = 1499;
  const freeShipping = subtotal >= freeShippingThreshold || appliedPromo === 'FREESHIP';
  const shippingFee = freeShipping ? 0 : 149;
  const total = Math.max(0, subtotal - discount + shippingFee);

  const handleApplyPromo = () => {
    setPromoError('');
    const code = promoCode.trim().toUpperCase();
    if (!code) {
      setAppliedPromo('');
      return;
    }
    if (['STREET20', 'FIRSTBUY', 'URBAN10', 'FREESHIP'].includes(code)) {
      if (code === 'FIRSTBUY' && subtotal < 1500) {
        setPromoError('FIRSTBUY requires minimum ₹1,500 order.');
        return;
      }
      setAppliedPromo(code);
    } else {
      setPromoError('Invalid code. Try STREET20 or FIRSTBUY');
    }
  };

  const closeDialog = () => {
    if (ref.current) ref.current.close();
  };

  return (
    <dialog id="cart" ref={ref} className="cartDrawer" aria-label="Your Shopping Bag">
      <div className="cartHead">
        <div>
          <h2>YOUR BAG</h2>
          <span className="cartItemCount">{cart.reduce((s, p) => s + (p.quantity || 1), 0)} pieces</span>
        </div>
        <button onClick={closeDialog} aria-label="Close bag"><X size={20} /></button>
      </div>

      {/* Free Shipping Meter */}
      <div className="shippingMeterBox">
        <div className="shippingMeterText">
          <Truck size={14} />
          {freeShipping ? (
            <span>You unlocked <b>FREE Express Doorstep Delivery!</b></span>
          ) : (
            <span>Add <b>{formatINR(freeShippingThreshold - subtotal)}</b> more for <b>FREE Delivery</b></span>
          )}
        </div>
        <div className="shippingProgressBar">
          <div
            className="shippingProgressFill"
            style={{ width: `${Math.min(100, (subtotal / freeShippingThreshold) * 100)}%` }}
          />
        </div>
      </div>

      {cart.length > 0 ? (
        <div className="cartDrawerBody">
          <div className="cartItemsScroll">
            {cart.map((p, i) => (
              <div className="cartRow" key={`${p.id}-${p.size || 'M'}-${i}`}>
                <Img src={p.image} alt={productAlt(p)} label={p.name} width={75} height={90} />
                <div className="cartRowDetails">
                  <b>{p.name}</b>
                  <div className="cartRowPills">
                    <span className="sizePill">Size: {p.size || 'M'}</span>
                    {p.color && <span className="colorPill">{p.color}</span>}
                  </div>
                  <p className="cartRowPrice">{formatINR(p.price)}</p>

                  <div className="cartQtyControls">
                    <button
                      type="button"
                      className="qtyBtn"
                      onClick={() => onUpdateQty && onUpdateQty(p.id, p.size || 'M', -1)}
                      aria-label="Decrease quantity"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="qtyNumber">{p.quantity || 1}</span>
                    <button
                      type="button"
                      className="qtyBtn"
                      onClick={() => onUpdateQty && onUpdateQty(p.id, p.size || 'M', 1)}
                      aria-label="Increase quantity"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </div>

                <button
                  className="cartRemoveBtn"
                  onClick={() => onRemove && onRemove(p.id, p.size || 'M')}
                  title="Remove from bag"
                  aria-label="Remove item"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          {/* Promo code box */}
          <div className="cartPromoSection">
            <div className="cartPromoInputWrap">
              <Tag size={14} />
              <input
                placeholder="Discount code (e.g. STREET20)"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && handleApplyPromo()}
              />
              <button type="button" onClick={handleApplyPromo}>Apply</button>
            </div>
            {appliedPromo && (
              <div className="appliedPromoNotice">
                <span>Code <b>{appliedPromo}</b> applied!</span>
                <button onClick={() => { setAppliedPromo(''); setPromoCode(''); }}>✕</button>
              </div>
            )}
            {promoError && <div className="promoErrorMsg">{promoError}</div>}
          </div>

          {/* Pricing summary */}
          <div className="cartTotalsSection">
            <div className="cartTotalRow">
              <span>Subtotal</span>
              <b>{formatINR(subtotal)}</b>
            </div>
            {discount > 0 && (
              <div className="cartTotalRow discount">
                <span>Offer Discount</span>
                <b>- {formatINR(discount)}</b>
              </div>
            )}
            <div className="cartTotalRow">
              <span>Shipping</span>
              <span>{freeShipping ? <b style={{ color: '#2c6a1f' }}>FREE</b> : formatINR(shippingFee)}</span>
            </div>
            <div className="cartTotalRow grandTotal">
              <span>Grand Total</span>
              <b>{formatINR(total)}</b>
            </div>
          </div>

          <button
            type="button"
            className="primary full checkoutTriggerBtn"
            onClick={() => {
              closeDialog();
              if (onProceedToCheckout) onProceedToCheckout(appliedPromo);
            }}
          >
            Checkout · {formatINR(total)} <ArrowRight size={17} />
          </button>
        </div>
      ) : (
        <div className="emptyBagState">
          <p className="emptyTitle">Your bag is currently empty.</p>
          <p className="emptySub">Check out Drop 02 for relaxed everyday essentials.</p>
          <button className="primary" onClick={closeDialog}>Shop The Drop</button>
        </div>
      )}
    </dialog>
  );
});

export default CartDialog;
