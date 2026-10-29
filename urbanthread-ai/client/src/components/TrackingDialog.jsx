import React, { useState, useEffect } from 'react';
import { X, Search, Package, CheckCircle2, Clock, Truck, MapPin, AlertCircle, RefreshCw } from 'lucide-react';
import { api } from '../services/api.js';
import { formatINR } from '../utils/format.js';
import Img from './Img.jsx';

const STATUS_STEPS = [
  { key: 'Processing', label: 'Order Placed', desc: 'Order received & verified' },
  { key: 'Confirmed', label: 'Confirmed', desc: 'Payment confirmed & preparing' },
  { key: 'Packed', label: 'Packed', desc: 'Sealed & ready at warehouse' },
  { key: 'Shipped', label: 'In Transit', desc: 'Handed over to carrier' },
  { key: 'Out for Delivery', label: 'Out for Delivery', desc: 'Courier out for doorstep drop' },
  { key: 'Delivered', label: 'Delivered', desc: 'Delivered to recipient' },
];

export default function TrackingDialog({ open, onClose, defaultTracking = '' }) {
  const [trackingNumber, setTrackingNumber] = useState(defaultTracking);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchTracking = async (num) => {
    const target = (num || trackingNumber).trim();
    if (!target) return;
    setLoading(true);
    setError('');
    try {
      const res = await api(`/orders/track/${encodeURIComponent(target)}`);
      setOrder(res.order);
    } catch (err) {
      setError(err.message || 'No shipment found with that tracking number.');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (defaultTracking) {
      setTrackingNumber(defaultTracking);
      fetchTracking(defaultTracking);
    }
  }, [defaultTracking, open]);

  if (!open) return null;

  const currentStepIndex = order
    ? STATUS_STEPS.findIndex((s) => s.key === order.status)
    : 0;

  return (
    <div className="modalBack" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modalBox trackingBox" onClick={(e) => e.stopPropagation()}>
        <div className="modalHead">
          <div>
            <h2>LIVE SHIPMENT TRACKING</h2>
            <small style={{ color: '#777', fontFamily: 'DM Mono' }}>Real-time doorstep dispatch updates</small>
          </div>
          <button onClick={onClose} aria-label="Close tracking"><X size={20} /></button>
        </div>

        {/* Search bar */}
        <div className="trackSearchBar">
          <input
            placeholder="Enter Tracking # (e.g. KLOTH-123456) or Order ID"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === 'Enter' && fetchTracking()}
          />
          <button className="primary" onClick={() => fetchTracking()} disabled={loading}>
            {loading ? <RefreshCw size={14} className="spin" /> : <Search size={14} />} Track
          </button>
        </div>

        {error && (
          <div className="authError" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {loading && (
          <div className="trackingLoading">
            <RefreshCw size={24} className="spin" />
            <p>Locating shipment with Streetwear Express…</p>
          </div>
        )}

        {order && !loading && (
          <div className="trackingContent">
            {/* Summary card */}
            <div className="shipmentMetaBanner">
              <div>
                <span className="eyebrow">TRACKING NUMBER</span>
                <b>{order.trackingNumber}</b>
              </div>
              <div>
                <span className="eyebrow">ESTIMATED DELIVERY</span>
                <b>{order.estimatedDelivery || 'In 3-4 days'}</b>
              </div>
              <div>
                <span className="eyebrow">CARRIER</span>
                <b>{order.carrier || 'Streetwear Express'}</b>
              </div>
              <div>
                <span className="eyebrow">CURRENT STATUS</span>
                <span className={'statusBadge ' + order.status.toLowerCase().replace(/\s+/g, '-')}>
                  {order.status}
                </span>
              </div>
            </div>

            {/* Stepper Timeline */}
            <div className="stepperWrapper">
              {STATUS_STEPS.map((step, idx) => {
                const isPassed = idx <= currentStepIndex;
                const isCurrent = idx === currentStepIndex;
                return (
                  <div key={step.key} className={'stepperNode ' + (isPassed ? 'passed ' : '') + (isCurrent ? 'current' : '')}>
                    <div className="stepIcon">
                      {isPassed ? <CheckCircle2 size={16} /> : <div className="dot" />}
                    </div>
                    <div className="stepInfo">
                      <b>{step.label}</b>
                      <small>{step.desc}</small>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Delivery address & Items */}
            <div className="trackingColumns">
              <div className="trackingCard">
                <h4><MapPin size={15} /> Delivery Address</h4>
                <p><b>{order.shippingAddress?.fullName}</b> ({order.shippingAddress?.phone})</p>
                <p>{order.shippingAddress?.street}, {order.shippingAddress?.city}</p>
                <p>{order.shippingAddress?.state} - {order.shippingAddress?.postalCode}</p>
              </div>

              <div className="trackingCard">
                <h4><Package size={15} /> Items in this Parcel</h4>
                <div className="parcelItemsList">
                  {order.items?.map((it, i) => (
                    <div key={i} className="parcelItemRow">
                      <Img src={it.image} alt={it.name} label={it.name} width={45} height={55} />
                      <div>
                        <b>{it.name}</b>
                        <small>Size: {it.size} · Qty: {it.quantity}</small>
                        <p>{formatINR(it.price * it.quantity)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Status History log */}
            {order.statusHistory?.length > 0 && (
              <div className="historyLogBox">
                <h4>Activity Log</h4>
                <div className="logList">
                  {order.statusHistory.map((h, i) => (
                    <div key={i} className="logRow">
                      <span className="logTime">
                        {new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })},{' '}
                        {new Date(h.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                      <span className="logStatus"><b>{h.status}</b>: {h.note}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
