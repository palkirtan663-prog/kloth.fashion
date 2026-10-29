import React, { useState, useEffect } from 'react';
import { X, Bell, Tag, Sparkles, AlertCircle, Copy, Check, ExternalLink, Settings } from 'lucide-react';
import { api } from '../services/api.js';

export default function NotificationDrawer({ open, onClose, onSelectPromo, onOpenUserPrefs }) {
  const [notifications, setNotifications] = useState([]);
  const [copiedCode, setCopiedCode] = useState('');

  useEffect(() => {
    if (open) {
      loadNotifications();
    }
  }, [open]);

  const loadNotifications = async () => {
    try {
      const res = await api('/marketing/notifications');
      setNotifications(res.notifications || []);
    } catch (e) {
      // Fallback notifications if offline
      setNotifications([
        {
          id: 'n1',
          title: '🔥 FLASH SALE: 20% OFF Everything',
          message: 'Apply discount code STREET20 at checkout for flat 20% off all drop pieces.',
          tag: 'CODE: STREET20',
          type: 'promo',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'n2',
          title: '⚡ DROP 02: Metropolis Archive Live',
          message: '50+ new Gen-Z streetwear pieces: waffle tees, grunge flannels, and barrel jeans.',
          tag: 'NEW DROP',
          type: 'collection',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'n3',
          title: '🚚 Free Express Shipping Over ₹1,499',
          message: 'No coupon needed. Automatic free delivery applied to all orders above ₹1,499 across India.',
          tag: 'SHIPPING',
          type: 'announcement',
          createdAt: new Date().toISOString(),
        },
      ]);
    }
  };

  const handleCopy = (code) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    if (onSelectPromo) onSelectPromo(code);
    setTimeout(() => setCopiedCode(''), 2500);
  };

  if (!open) return null;

  return (
    <div className="modalBack notificationBackdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="notificationDrawerBox" onClick={(e) => e.stopPropagation()}>
        <div className="drawerHead">
          <div className="drawerTitle">
            <Bell size={18} />
            <h3>Notifications & Deals</h3>
            <span className="notifBadgeCount">{notifications.length}</span>
          </div>
          <button className="iconClose" onClick={onClose} aria-label="Close notification drawer">
            <X size={18} />
          </button>
        </div>

        <div className="drawerBody">
          {notifications.length === 0 ? (
            <div className="emptyNotifs">
              <Bell size={36} />
              <p>You're all caught up!</p>
              <small>Stay tuned for exclusive drop announcements and flash sale codes.</small>
            </div>
          ) : (
            <div className="notifsList">
              {notifications.map((n) => {
                const isPromo = n.tag?.includes('CODE:') || n.type === 'promo';
                const promoCodeMatch = n.tag?.match(/CODE:\s*([A-Za-z0-9]+)/) || n.message?.match(/\b(STREET20|FIRSTBUY|FREESHIP|URBAN10)\b/);
                const code = promoCodeMatch ? promoCodeMatch[1] : null;

                return (
                  <div key={n.id || n._id} className={`notifCard ${n.type || 'announcement'}`}>
                    <div className="notifMetaRow">
                      <span className={`notifTag ${n.type || 'promo'}`}>
                        {n.tag || 'ALERT'}
                      </span>
                      <span className="notifTime">
                        {n.createdAt ? new Date(n.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : 'Today'}
                      </span>
                    </div>

                    <h4>{n.title}</h4>
                    <p>{n.message}</p>

                    {code && (
                      <div className="promoCodeCopyRow">
                        <span className="promoCodePill">{code}</span>
                        <button
                          type="button"
                          className="copyCodeBtn"
                          onClick={() => handleCopy(code)}
                        >
                          {copiedCode === code ? <><Check size={13} /> Applied!</> : <><Copy size={13} /> Copy & Apply</>}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="drawerFooter">
          <button
            type="button"
            className="manageAlertsBtn"
            onClick={() => {
              onClose();
              if (onOpenUserPrefs) onOpenUserPrefs();
            }}
          >
            <Settings size={14} /> Notification Preferences
          </button>
        </div>
      </div>
    </div>
  );
}
