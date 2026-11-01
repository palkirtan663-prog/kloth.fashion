import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, CheckCircle2, CreditCard, Smartphone, Building, Truck, Tag, ArrowRight, Loader2 } from 'lucide-react';
import Img from './Img.jsx';
import { formatINR, productAlt } from '../utils/format.js';
import { api } from '../services/api.js';

export default function CheckoutDialog({ open, onClose, cart, user, onOrderPlaced, initialPromo = '' }) {
  const [step, setStep] = useState('checkout'); // 'checkout' | 'success'
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [placedOrder, setPlacedOrder] = useState(null);

  // Address state
  const [address, setAddress] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || 'Maharashtra',
    postalCode: user?.address?.postalCode || '',
  });

  // Promo code state
  const [promoCode, setPromoCode] = useState(initialPromo);
  const [appliedPromo, setAppliedPromo] = useState(initialPromo ? initialPromo.toUpperCase() : '');
  const [promoError, setPromoError] = useState('');

  // Payment method state
  const [paymentMethod, setPaymentMethod] = useState('UPI'); // 'UPI' | 'Card' | 'NetBanking' | 'COD'
  const [upiId, setUpiId] = useState('');
  const [upiVerified, setUpiVerified] = useState(false);
  const [card, setCard] = useState({ number: '', expiry: '', cvv: '', name: '' });
  const [bank, setBank] = useState('HDFC Bank');

  useEffect(() => {
    if (initialPromo) {
      setPromoCode(initialPromo);
      setAppliedPromo(initialPromo.toUpperCase());
    }
  }, [initialPromo]);

  if (!open) return null;

  // Calculate pricing
  const subtotal = cart.reduce((s, p) => s + (p.price * (p.quantity || 1)), 0);

  let discount = 0;
  if (appliedPromo === 'STREET20') discount = Math.round(subtotal * 0.20);
  else if (appliedPromo === 'FIRSTBUY') discount = subtotal >= 1500 ? 500 : 0;
  else if (appliedPromo === 'URBAN10') discount = Math.round(subtotal * 0.10);

  const shippingFee = (subtotal >= 1499 || appliedPromo === 'FREESHIP') ? 0 : 149;
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
        setPromoError('FIRSTBUY requires a minimum order of ₹1,500');
        return;
      }
      setAppliedPromo(code);
    } else {
      setPromoError('Invalid promo code. Try STREET20 or FIRSTBUY');
    }
  };

  const handlePayAndPlace = async (e) => {
    e.preventDefault();
    setError('');

    if (user?.isGuest) {
      setError('You are currently exploring as a guest. Please sign in or create an account to place and track your orders.');
      return;
    }

    if (!address.fullName || !address.phone || !address.street || !address.city || !address.postalCode) {
      setError('Please fill in your complete delivery address and mobile number.');
      return;
    }

    if (paymentMethod === 'Card') {
      if (card.number.replace(/\s/g, '').length < 16 || !card.expiry || !card.cvv) {
        setError('Please enter valid credit/debit card details.');
        return;
      }
    }

    setSubmitting(true);
    try {
      const payload = {
        items: cart.map((p) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          quantity: p.quantity || 1,
          size: p.size || 'M',
          color: p.color || '',
          image: p.image || '',
        })),
        shippingAddress: address,
        payment: { method: paymentMethod },
        promoCode: appliedPromo,
      };

      const res = await api('/orders', { method: 'POST', body: payload });
      setPlacedOrder(res.order);
      setStep('success');
      if (onOrderPlaced) onOrderPlaced(res.order);
    } catch (err) {
      setError(err.message || 'Payment processing failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modalBack" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modalBox checkoutBox" onClick={(e) => e.stopPropagation()}>
        {step === 'checkout' ? (
          <>
            <div className="modalHead">
              <div>
                <h2>CHECKOUT</h2>
                <span className="checkoutSecurity"><ShieldCheck size={14} /> 256-Bit Encrypted Secure Checkout</span>
              </div>
              <button onClick={onClose} aria-label="Close checkout"><X size={20} /></button>
            </div>

            {error && (
              <div className="authError" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div>{error}</div>
                {user?.isGuest && (
                  <button
                    type="button"
                    className="primary"
                    style={{ alignSelf: 'flex-start', padding: '6px 14px', fontSize: '11px', marginTop: 4 }}
                    onClick={() => {
                      if (onClose) onClose();
                      window.location.reload();
                    }}
                  >
                    Go to Sign In / Register →
                  </button>
                )}
              </div>
            )}

            <form onSubmit={handlePayAndPlace} className="checkoutForm">
              <div className="checkoutGrid">
                {/* Left column: Address & Payment */}
                <div className="checkoutLeft">
                  <section className="checkoutSection">
                    <h3>1. Delivery Address</h3>
                    <div className="formRow">
                      <div className="formGroup">
                        <label>Full Name *</label>
                        <input
                          required
                          value={address.fullName}
                          onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                          placeholder="Kirtan Pal"
                        />
                      </div>
                      <div className="formGroup">
                        <label>Phone Number *</label>
                        <input
                          required
                          value={address.phone}
                          onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                          placeholder="+91 98765 43210"
                        />
                      </div>
                    </div>
                    <div className="formGroup">
                      <label>Street Address / Flat / Landmark *</label>
                      <input
                        required
                        value={address.street}
                        onChange={(e) => setAddress({ ...address, street: e.target.value })}
                        placeholder="House / Flat No., Street, Area"
                      />
                    </div>
                    <div className="formRow">
                      <div className="formGroup">
                        <label>City *</label>
                        <input
                          required
                          value={address.city}
                          onChange={(e) => setAddress({ ...address, city: e.target.value })}
                          placeholder="Mumbai"
                        />
                      </div>
                      <div className="formGroup">
                        <label>PIN Code *</label>
                        <input
                          required
                          value={address.postalCode}
                          onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
                          placeholder="400001"
                        />
                      </div>
                    </div>
                  </section>

                  <section className="checkoutSection">
                    <h3>2. Select Payment Method</h3>
                    <div className="paymentTabs">
                      <button
                        type="button"
                        className={'payTab ' + (paymentMethod === 'UPI' ? 'active' : '')}
                        onClick={() => setPaymentMethod('UPI')}
                      >
                        <Smartphone size={16} /> UPI / QR
                      </button>
                      <button
                        type="button"
                        className={'payTab ' + (paymentMethod === 'Card' ? 'active' : '')}
                        onClick={() => setPaymentMethod('Card')}
                      >
                        <CreditCard size={16} /> Card
                      </button>
                      <button
                        type="button"
                        className={'payTab ' + (paymentMethod === 'NetBanking' ? 'active' : '')}
                        onClick={() => setPaymentMethod('NetBanking')}
                      >
                        <Building size={16} /> NetBanking
                      </button>
                      <button
                        type="button"
                        className={'payTab ' + (paymentMethod === 'COD' ? 'active' : '')}
                        onClick={() => setPaymentMethod('COD')}
                      >
                        <Truck size={16} /> Cash on Delivery
                      </button>
                    </div>

                    <div className="paymentDetails">
                      {paymentMethod === 'UPI' && (
                        <div className="upiBox">
                          <p>Instant UPI payment via Google Pay, PhonePe, Paytm, or BHIM.</p>
                          <div className="upiInputWrap">
                            <input
                              placeholder="Enter UPI ID (e.g. mobile@upi)"
                              value={upiId}
                              onChange={(e) => {
                                setUpiId(e.target.value);
                                setUpiVerified(e.target.value.includes('@'));
                              }}
                            />
                            <button
                              type="button"
                              className="verifyBtn"
                              onClick={() => setUpiVerified(upiId.includes('@'))}
                            >
                              {upiVerified ? '✓ Verified' : 'Verify'}
                            </button>
                          </div>
                          <span className="payNote">Or scan QR code at final checkout popup</span>
                        </div>
                      )}

                      {paymentMethod === 'Card' && (
                        <div className="cardBox">
                          <div className="formGroup">
                            <label>Card Number</label>
                            <input
                              maxLength={19}
                              value={card.number}
                              onChange={(e) => {
                                const v = e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim();
                                setCard({ ...card, number: v });
                              }}
                              placeholder="4242 4242 4242 4242"
                            />
                          </div>
                          <div className="formRow">
                            <div className="formGroup">
                              <label>Expiry (MM/YY)</label>
                              <input
                                maxLength={5}
                                value={card.expiry}
                                onChange={(e) => setCard({ ...card, expiry: e.target.value })}
                                placeholder="12/28"
                              />
                            </div>
                            <div className="formGroup">
                              <label>CVV</label>
                              <input
                                type="password"
                                maxLength={4}
                                value={card.cvv}
                                onChange={(e) => setCard({ ...card, cvv: e.target.value })}
                                placeholder="•••"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {paymentMethod === 'NetBanking' && (
                        <div className="netBankingBox">
                          <p>Select your bank to proceed with secure NetBanking:</p>
                          <div className="bankGrid">
                            {['HDFC Bank', 'State Bank of India', 'ICICI Bank', 'Axis Bank', 'Kotak Bank'].map((b) => (
                              <button
                                key={b}
                                type="button"
                                className={'bankBtn ' + (bank === b ? 'selected' : '')}
                                onClick={() => setBank(b)}
                              >
                                {b}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {paymentMethod === 'COD' && (
                        <div className="codBox">
                          <p><b>Cash on Delivery</b> is available for this address.</p>
                          <p className="subtle">Pay with cash or UPI QR directly to the courier upon delivery.</p>
                        </div>
                      )}
                    </div>
                  </section>
                </div>

                {/* Right column: Order Summary & Pay Button */}
                <div className="checkoutRight">
                  <h3>Order Summary ({cart.length} pieces)</h3>
                  <div className="checkoutItemsList">
                    {cart.map((p, idx) => (
                      <div className="checkoutItemRow" key={`${p.id}-${idx}`}>
                        <Img src={p.image} alt={productAlt(p)} label={p.name} width={50} height={60} />
                        <div className="checkoutItemMeta">
                          <b>{p.name}</b>
                          <small>Size: {p.size || 'M'} · Qty: {p.quantity || 1}</small>
                          <p>{formatINR(p.price * (p.quantity || 1))}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Promo Code Input */}
                  <div className="promoInputBox">
                    <div className="promoField">
                      <Tag size={15} />
                      <input
                        placeholder="Promo Code (e.g. STREET20)"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                      />
                      <button type="button" onClick={handleApplyPromo}>Apply</button>
                    </div>
                    {appliedPromo && (
                      <div className="appliedPromoTag">
                        <span>Code <b>{appliedPromo}</b> applied!</span>
                        <button type="button" onClick={() => { setAppliedPromo(''); setPromoCode(''); }}>✕</button>
                      </div>
                    )}
                    {promoError && <div className="promoErrorMsg">{promoError}</div>}
                  </div>

                  {/* Price Breakdown */}
                  <div className="checkoutPricing">
                    <div className="priceRow"><span>Bag Subtotal</span><span>{formatINR(subtotal)}</span></div>
                    {discount > 0 && (
                      <div className="priceRow discountRow"><span>Offer Discount ({appliedPromo})</span><span>- {formatINR(discount)}</span></div>
                    )}
                    <div className="priceRow">
                      <span>Express Shipping</span>
                      <span>{shippingFee === 0 ? <b style={{ color: '#2c6a1f' }}>FREE</b> : formatINR(shippingFee)}</span>
                    </div>
                    <div className="priceRow grandTotal">
                      <span>Total Amount</span>
                      <b>{formatINR(total)}</b>
                    </div>
                  </div>

                  <button type="submit" className="primary full checkoutPayBtn" disabled={submitting}>
                    {submitting ? (
                      <><Loader2 size={16} className="spin" /> Processing Payment…</>
                    ) : (
                      <>Pay {formatINR(total)} & Place Order <ArrowRight size={16} /></>
                    )}
                  </button>
                  <p className="guaranteeText">7-Day Hassle-Free Returns · 100% Genuine Streetwear</p>
                </div>
              </div>
            </form>
          </>
        ) : (
          /* Order Confirmation Success State */
          <div className="orderSuccessCard">
            <CheckCircle2 size={56} className="successIcon" />
            <h2>ORDER CONFIRMED!</h2>
            <p className="successSub">Thank you for ordering with Kloth.fashion.</p>


            <div className="successDetailsBox">
              <div className="successRow"><span>Tracking Number:</span><b className="highlightTrk">{placedOrder?.trackingNumber}</b></div>
              <div className="successRow"><span>Estimated Delivery:</span><b>{placedOrder?.estimatedDelivery || 'In 3-4 Business Days'}</b></div>
              <div className="successRow"><span>Payment Mode:</span><b>{placedOrder?.payment?.method} ({placedOrder?.payment?.status})</b></div>
              <div className="successRow"><span>Total Paid:</span><b>{formatINR(placedOrder?.total || total)}</b></div>
              <div className="successRow"><span>Deliver to:</span><b>{placedOrder?.shippingAddress?.street}, {placedOrder?.shippingAddress?.city}</b></div>
            </div>

            <div className="successActions">
              <button
                className="primary"
                onClick={() => {
                  onClose();
                  if (window.__openTracker) window.__openTracker(placedOrder?.trackingNumber);
                }}
              >
                Track This Order
              </button>
              <button className="secondary" onClick={onClose}>Continue Shopping</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
