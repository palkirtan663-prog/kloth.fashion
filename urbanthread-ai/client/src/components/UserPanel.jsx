import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Package,
  Heart,
  LogOut,
  Check,
  Save,
  MapPin,
  Phone,
  Mail,
  Shield,
  ExternalLink,
  Loader2,
  RotateCcw,
  Scissors,
  FileText,
  Bell,
  Printer,
  Ban,
  RefreshCw,
  Send,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { api } from '../services/api.js';
import { formatINR } from '../utils/format.js';
import Img from './Img.jsx';
import InvoiceDialog from './InvoiceDialog.jsx';
import ReturnRequestDialog from './ReturnRequestDialog.jsx';

export default function UserPanel({
  open,
  onClose,
  user,
  onUpdateUser,
  onLogout,
  onOpenTracker,
  likedProducts = [],
  onAddToCart,
  initialTab = 'orders',
  onOpenCustomRequestModal,
  onOpenHelpCenter,
}) {
  const [tab, setTab] = useState(initialTab); // 'orders' | 'custom' | 'tickets' | 'profile' | 'wishlist'
  const [orders, setOrders] = useState([]);
  const [customRequests, setCustomRequests] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketReply, setTicketReply] = useState('');
  const [replying, setReplying] = useState(false);

  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingCustom, setLoadingCustom] = useState(false);
  const [loadingTickets, setLoadingTickets] = useState(false);

  // Modals inside user panel
  const [invoiceOrder, setInvoiceOrder] = useState(null);
  const [returnOrder, setReturnOrder] = useState(null);
  const [cancellingOrderId, setCancellingOrderId] = useState(null);

  // Profile state
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');
  const [profile, setProfile] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || 'Maharashtra',
    postalCode: user?.address?.postalCode || '',
    notificationPreferences: {
      marketing: user?.notificationPreferences?.marketing ?? true,
      orderUpdates: user?.notificationPreferences?.orderUpdates ?? true,
      restocks: user?.notificationPreferences?.restocks ?? true,
    },
  });

  useEffect(() => {
    if (open) {
      if (initialTab) setTab(initialTab);
      loadOrders();
      loadCustomRequests();
      loadTickets();
      if (user) {
        setProfile({
          name: user.name || '',
          phone: user.phone || '',
          street: user.address?.street || '',
          city: user.address?.city || '',
          state: user.address?.state || 'Maharashtra',
          postalCode: user.address?.postalCode || '',
          notificationPreferences: {
            marketing: user.notificationPreferences?.marketing ?? true,
            orderUpdates: user.notificationPreferences?.orderUpdates ?? true,
            restocks: user.notificationPreferences?.restocks ?? true,
          },
        });
      }
    }
  }, [open, user, initialTab]);

  const loadOrders = async () => {
    if (user?.isGuest) {
      setOrders([]);
      return;
    }
    setLoadingOrders(true);
    try {
      const res = await api('/orders/mine');
      setOrders(res.orders || []);
    } catch (e) {
      console.warn('Could not fetch user orders:', e.message);
    } finally {
      setLoadingOrders(false);
    }
  };

  const loadCustomRequests = async () => {
    if (user?.isGuest) {
      setCustomRequests([]);
      return;
    }
    setLoadingCustom(true);
    try {
      const res = await api('/custom-requests/mine');
      setCustomRequests(res.requests || []);
    } catch (e) {
      console.warn('Could not fetch custom requests:', e.message);
    } finally {
      setLoadingCustom(false);
    }
  };

  const loadTickets = async () => {
    if (user?.isGuest) {
      setTickets([]);
      return;
    }
    setLoadingTickets(true);
    try {
      const res = await api('/support/tickets/mine');
      setTickets(res.tickets || []);
    } catch (e) {
      console.warn('Could not fetch tickets:', e.message);
    } finally {
      setLoadingTickets(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    setCancellingOrderId(orderId);
    try {
      await api(`/orders/${orderId}/cancel`, {
        method: 'POST',
        body: { reason: 'Customer requested cancellation from User Profile.' },
      });
      await loadOrders();
    } catch (err) {
      alert('Could not cancel order: ' + err.message);
    } finally {
      setCancellingOrderId(null);
    }
  };

  const handleQuoteDecision = async (requestId, decision) => {
    try {
      await api(`/custom-requests/${requestId}/respond`, {
        method: 'PATCH',
        body: { decision },
      });
      await loadCustomRequests();
    } catch (err) {
      alert('Could not submit response: ' + err.message);
    }
  };

  const handleSendTicketReply = async (e) => {
    e.preventDefault();
    if (!ticketReply.trim() || !selectedTicket) return;
    setReplying(true);
    try {
      const res = await api(`/support/tickets/${selectedTicket.id}/reply`, {
        method: 'POST',
        body: { message: ticketReply.trim() },
      });
      setSelectedTicket(res.ticket);
      setTicketReply('');
      loadTickets();
    } catch (err) {
      alert('Failed to send reply: ' + err.message);
    } finally {
      setReplying(false);
    }
  };

  const handleReorder = (order) => {
    if (!onAddToCart || !order.items) return;
    order.items.forEach((it) => {
      onAddToCart(it);
    });
    alert('Items from this order have been added to your shopping bag!');
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (user?.isGuest) {
      setProfileMsg('Please create an account or sign in to save your delivery address and preferences.');
      return;
    }
    setSavingProfile(true);
    setProfileMsg('');
    try {
      const res = await api('/auth/profile', {
        method: 'PATCH',
        body: {
          name: profile.name,
          phone: profile.phone,
          address: {
            street: profile.street,
            city: profile.city,
            state: profile.state,
            postalCode: profile.postalCode,
          },
          notificationPreferences: profile.notificationPreferences,
        },
      });
      if (onUpdateUser) onUpdateUser(res.user);
      setProfileMsg('Profile and preferences updated successfully!');
      setTimeout(() => setProfileMsg(''), 3000);
    } catch (err) {
      setProfileMsg('Failed: ' + err.message);
    } finally {
      setSavingProfile(false);
    }
  };

  if (!open) return null;

  return (
    <>
      <div className="modalBack" onClick={onClose} role="dialog" aria-modal="true">
        <div className="modalBox userPanelBox" onClick={(e) => e.stopPropagation()}>
          <div className="modalHead">
            <div className="userPanelTitle">
              <div className="userAvatar">{user.name.charAt(0).toUpperCase()}</div>
              <div>
                <h2>{user.name}</h2>
                <small>{user.email} · {user.role === 'admin' ? 'STORE OWNER / ADMIN' : 'VIP MEMBER'}</small>
              </div>
            </div>
            <button className="iconClose" onClick={onClose} aria-label="Close user panel"><X size={20} /></button>
          </div>

          {/* Panel Navigation Tabs */}
          <div className="userPanelTabs scrollableTabs">
            <button
              className={'panelTab ' + (tab === 'orders' ? 'active' : '')}
              onClick={() => setTab('orders')}
            >
              <Package size={15} /> My Orders ({orders.length})
            </button>
            <button
              className={'panelTab ' + (tab === 'custom' ? 'active' : '')}
              onClick={() => setTab('custom')}
            >
              <Scissors size={15} /> Custom Requests ({customRequests.length})
            </button>
            <button
              className={'panelTab ' + (tab === 'tickets' ? 'active' : '')}
              onClick={() => setTab('tickets')}
            >
              <FileText size={15} /> Support Tickets ({tickets.length})
            </button>
            <button
              className={'panelTab ' + (tab === 'profile' ? 'active' : '')}
              onClick={() => setTab('profile')}
            >
              <User size={15} /> Profile & Settings
            </button>
            <button
              className={'panelTab ' + (tab === 'wishlist' ? 'active' : '')}
              onClick={() => setTab('wishlist')}
            >
              <Heart size={15} /> Wishlist ({likedProducts.length})
            </button>
          </div>

          {user?.isGuest && (
            <div style={{ background: '#f5f4ef', borderBottom: '1px solid #deddd6', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
              <span>You are browsing as a guest. Sign in to save orders, profile details, and bespoke tailoring quotes.</span>
              <button
                type="button"
                className="primary"
                style={{ padding: '6px 14px', fontSize: '11px', whiteSpace: 'nowrap', marginLeft: 12 }}
                onClick={() => {
                  onClose();
                  if (onLogout) onLogout();
                }}
              >
                Sign In / Register →
              </button>
            </div>
          )}

          <div className="userPanelBody">
            {/* TAB 1: ORDERS */}
            {tab === 'orders' && (
              <div className="ordersListTab">
                {loadingOrders ? (
                  <div className="statusBox"><p>Loading your orders…</p></div>
                ) : orders.length === 0 ? (
                  <div className="emptyOrdersState">
                    <Package size={44} />
                    <p><b>No orders placed yet</b></p>
                    <small>Pick pieces from our Drop 02 Streetwear Archive and enjoy free express delivery.</small>
                    <button className="primary" onClick={onClose} style={{ marginTop: 15 }}>Browse Catalogue</button>
                  </div>
                ) : (
                  <div className="ordersCardsWrap">
                    {orders.map((o) => {
                      const canCancel = ['Processing', 'Confirmed', 'Packed'].includes(o.status);
                      const isDelivered = o.status === 'Delivered';
                      const hasReturn = o.returnRequest && o.returnRequest.status !== 'None';

                      return (
                        <div key={o.id} className="orderItemCard">
                          <div className="orderCardHeader">
                            <div>
                              <span className="orderDate">
                                {new Date(o.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                              <span className="orderTrkNum">Tracking: <b>{o.trackingNumber}</b></span>
                            </div>
                            <div className="orderHeaderRight">
                              <span className={'statusBadge ' + o.status.toLowerCase().replace(/\s+/g, '-')}>
                                {o.status}
                              </span>
                              <button
                                type="button"
                                className="trackOrderSmallBtn"
                                onClick={() => {
                                  onClose();
                                  if (onOpenTracker) onOpenTracker(o.trackingNumber);
                                }}
                              >
                                Track <ExternalLink size={12} />
                              </button>
                            </div>
                          </div>

                          {/* Order Return Banner if return requested */}
                          {hasReturn && (
                            <div className={`orderReturnBanner ${o.returnRequest.status.toLowerCase()}`}>
                              <RotateCcw size={14} />
                              <span>
                                <b>{o.returnRequest.type} ({o.returnRequest.status}):</b> {o.returnRequest.reason}
                                {o.returnRequest.adminNote && ` — Note: ${o.returnRequest.adminNote}`}
                              </span>
                            </div>
                          )}

                          <div className="orderCardItems">
                            {o.items?.map((it, idx) => (
                              <div key={idx} className="orderCardItemRow">
                                <Img src={it.image} alt={it.name} label={it.name} width={45} height={55} />
                                <div className="orderItemInfo">
                                  <b>{it.name}</b>
                                  <small>Size: {it.size} · Qty: {it.quantity}</small>
                                </div>
                                <span className="orderItemPrice">{formatINR(it.price * it.quantity)}</span>
                              </div>
                            ))}
                          </div>

                          <div className="orderCardFooter">
                            <div className="orderCardFooterLeft">
                              <span>Paid via <b>{o.payment?.method}</b></span>
                              <span className="orderTotalAmount">Total: <b>{formatINR(o.total)}</b></span>
                            </div>

                            <div className="orderActionBtns">
                              {/* Invoice Receipt */}
                              <button
                                type="button"
                                className="secondary miniBtn"
                                onClick={() => setInvoiceOrder(o)}
                                title="View & Print Invoice"
                              >
                                <Printer size={13} /> Invoice
                              </button>

                              {/* Reorder */}
                              <button
                                type="button"
                                className="secondary miniBtn"
                                onClick={() => handleReorder(o)}
                                title="Add items to bag"
                              >
                                <RefreshCw size={13} /> Reorder
                              </button>

                              {/* Return / Exchange button for delivered items */}
                              {isDelivered && !hasReturn && (
                                <button
                                  type="button"
                                  className="primary miniBtn"
                                  onClick={() => setReturnOrder(o)}
                                >
                                  <RotateCcw size={13} /> Return / Exchange
                                </button>
                              )}

                              {/* Cancel order before dispatch */}
                              {canCancel && (
                                <button
                                  type="button"
                                  className="danger miniBtn"
                                  disabled={cancellingOrderId === o.id}
                                  onClick={() => handleCancelOrder(o.id)}
                                >
                                  {cancellingOrderId === o.id ? 'Cancelling…' : <><Ban size={13} /> Cancel</>}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: CUSTOM REQUESTS */}
            {tab === 'custom' && (
              <div className="customRequestsTab">
                <div className="tabSubhead">
                  <div>
                    <h3>Bespoke Garment Inquiries</h3>
                    <small>Track custom silhouettes, view tailor quotations, and monitor production.</small>
                  </div>
                  <button
                    type="button"
                    className="primary miniBtn"
                    onClick={() => {
                      onClose();
                      if (onOpenCustomRequestModal) onOpenCustomRequestModal();
                    }}
                  >
                    <Scissors size={14} /> New Custom Request
                  </button>
                </div>

                {loadingCustom ? (
                  <div className="statusBox"><p>Loading custom requests…</p></div>
                ) : customRequests.length === 0 ? (
                  <div className="emptyOrdersState">
                    <Scissors size={44} />
                    <p><b>No custom design requests yet</b></p>
                    <small>Have an original piece in mind? Submit your specs and get a custom quote within 24 hours.</small>
                    <button
                      className="primary"
                      style={{ marginTop: 15 }}
                      onClick={() => {
                        onClose();
                        if (onOpenCustomRequestModal) onOpenCustomRequestModal();
                      }}
                    >
                      Open Bespoke Studio
                    </button>
                  </div>
                ) : (
                  <div className="customCardsList">
                    {customRequests.map((cr) => (
                      <div key={cr.id} className="customCardItem">
                        <div className="customCardTop">
                          <div>
                            <span className="crIdBadge">#{cr.requestId}</span>
                            <h4>{cr.category} · {cr.color}</h4>
                            <small>Submitted {new Date(cr.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</small>
                          </div>
                          <span className={`statusBadge crStatus-${cr.status.toLowerCase().replace(/\s+/g, '-')}`}>
                            {cr.status}
                          </span>
                        </div>

                        <p className="crDesc">{cr.description}</p>

                        <div className="crSpecsRow">
                          <span><b>Fabric:</b> {cr.fabric}</span>
                          <span><b>Fit/Size:</b> {cr.size}</span>
                          <span><b>Qty:</b> {cr.quantity}</span>
                          <span><b>Budget:</b> ₹{cr.budget}</span>
                        </div>

                        {cr.referenceImage && (
                          <div className="crImageWrap">
                            <img src={cr.referenceImage} alt="Design reference" className="crThumb" />
                          </div>
                        )}

                        {/* Master Tailor Quote Box */}
                        {cr.quote && cr.quote.price > 0 && (
                          <div className="tailorQuoteBox">
                            <div className="quoteHeader">
                              <Sparkles size={16} />
                              <strong>Official Tailor Quotation</strong>
                            </div>
                            <div className="quoteValues">
                              <div>Price Quote: <b>{formatINR(cr.quote.price)}</b></div>
                              <div>Estimated Lead Time: <b>{cr.quote.estimatedDays} Days</b></div>
                            </div>
                            {cr.quote.notes && <p className="quoteNotes">"{cr.quote.notes}"</p>}

                            {cr.status === 'Quotation Provided' && (
                              <div className="quoteResponseActions">
                                <button
                                  type="button"
                                  className="primary miniBtn"
                                  onClick={() => handleQuoteDecision(cr.id, 'accept')}
                                >
                                  Accept Quote & Proceed
                                </button>
                                <button
                                  type="button"
                                  className="secondary miniBtn"
                                  onClick={() => handleQuoteDecision(cr.id, 'decline')}
                                >
                                  Decline Quote
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: SUPPORT TICKETS */}
            {tab === 'tickets' && (
              <div className="ticketsTab">
                {selectedTicket ? (
                  <div className="ticketDetailView">
                    <button
                      type="button"
                      className="backToTicketsBtn"
                      onClick={() => setSelectedTicket(null)}
                    >
                      ← Back to all tickets
                    </button>
                    <div className="ticketDetailHead">
                      <div>
                        <span className="crIdBadge">#{selectedTicket.ticketNumber}</span>
                        <h3>{selectedTicket.subject}</h3>
                        <small>{selectedTicket.category} · Priority: {selectedTicket.priority}</small>
                      </div>
                      <span className={`statusBadge ${selectedTicket.status.toLowerCase().replace(/\s+/g, '-')}`}>
                        {selectedTicket.status}
                      </span>
                    </div>

                    <div className="ticketOriginalMessage">
                      <b>Initial Inquiry:</b>
                      <p>{selectedTicket.message}</p>
                      {selectedTicket.attachment && (
                        <div className="ticketAttachmentPreview">
                          <img src={selectedTicket.attachment} alt="Attachment" />
                        </div>
                      )}
                    </div>

                    {/* Replies Thread */}
                    <div className="repliesThread">
                      <h4>Conversation History:</h4>
                      {selectedTicket.replies?.length === 0 ? (
                        <p className="noRepliesYet">Our team is reviewing your ticket. Replies will appear here.</p>
                      ) : (
                        selectedTicket.replies?.map((rep, idx) => (
                          <div key={idx} className={`replyBubble ${rep.senderRole === 'admin' ? 'adminReply' : 'userReply'}`}>
                            <div className="replyMeta">
                              <b>{rep.sender} {rep.senderRole === 'admin' ? '🛡️ (Support Concierge)' : ''}</b>
                              <small>{new Date(rep.timestamp).toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</small>
                            </div>
                            <p>{rep.message}</p>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Reply form */}
                    {selectedTicket.status !== 'Closed' && (
                      <form onSubmit={handleSendTicketReply} className="ticketReplyForm">
                        <textarea
                          rows={2}
                          placeholder="Type your response to support..."
                          value={ticketReply}
                          onChange={(e) => setTicketReply(e.target.value)}
                          required
                        />
                        <button type="submit" className="primary miniBtn" disabled={replying}>
                          {replying ? 'Sending…' : <><Send size={14} /> Send Reply</>}
                        </button>
                      </form>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="tabSubhead">
                      <div>
                        <h3>Support Inquiries & Tickets</h3>
                        <small>Direct communication thread with Kloth.fashion customer care specialists.</small>

                      </div>
                      <button
                        type="button"
                        className="primary miniBtn"
                        onClick={() => {
                          onClose();
                          if (onOpenHelpCenter) onOpenHelpCenter();
                        }}
                      >
                        <FileText size={14} /> Open New Ticket
                      </button>
                    </div>

                    {loadingTickets ? (
                      <div className="statusBox"><p>Loading tickets…</p></div>
                    ) : tickets.length === 0 ? (
                      <div className="emptyOrdersState">
                        <FileText size={44} />
                        <p><b>No support tickets on record</b></p>
                        <small>Need assistance with a delivery, return, or order? Open a ticket anytime.</small>
                        <button
                          className="primary"
                          style={{ marginTop: 15 }}
                          onClick={() => {
                            onClose();
                            if (onOpenHelpCenter) onOpenHelpCenter();
                          }}
                        >
                          Visit Help Center
                        </button>
                      </div>
                    ) : (
                      <div className="ticketsListWrap">
                        {tickets.map((t) => (
                          <div
                            key={t.id}
                            className="ticketRowItem"
                            onClick={() => setSelectedTicket(t)}
                          >
                            <div className="ticketRowLeft">
                              <span className="crIdBadge">#{t.ticketNumber}</span>
                              <div>
                                <b>{t.subject}</b>
                                <small>{t.category} · {t.replies?.length || 0} replies</small>
                              </div>
                            </div>
                            <div className="ticketRowRight">
                              <span className={`statusBadge ${t.status.toLowerCase().replace(/\s+/g, '-')}`}>
                                {t.status}
                              </span>
                              <ChevronRight size={16} />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* TAB 4: PROFILE, ADDRESS & NOTIFICATION SETTINGS */}
            {tab === 'profile' && (
              <form onSubmit={handleSaveProfile} className="profileTabForm">
                {profileMsg && <div className="profileFeedbackMsg">{profileMsg}</div>}

                <div className="formRow">
                  <div className="formGroup">
                    <label><User size={13} /> Full Name</label>
                    <input
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="formGroup">
                    <label><Mail size={13} /> Email (Verified)</label>
                    <input value={user.email} disabled className="disabledInput" />
                  </div>
                </div>

                <div className="formGroup">
                  <label><Phone size={13} /> Mobile Phone Number</label>
                  <input
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                  />
                </div>

                <h4><MapPin size={15} /> Default Delivery Address</h4>
                <div className="formGroup">
                  <label>Street Address</label>
                  <input
                    value={profile.street}
                    onChange={(e) => setProfile({ ...profile, street: e.target.value })}
                    placeholder="Apartment, Street Name, Landmark"
                  />
                </div>

                <div className="formRow">
                  <div className="formGroup">
                    <label>City</label>
                    <input
                      value={profile.city}
                      onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                      placeholder="Mumbai"
                    />
                  </div>
                  <div className="formGroup">
                    <label>State</label>
                    <input
                      value={profile.state}
                      onChange={(e) => setProfile({ ...profile, state: e.target.value })}
                      placeholder="Maharashtra"
                    />
                  </div>
                  <div className="formGroup">
                    <label>PIN Code</label>
                    <input
                      value={profile.postalCode}
                      onChange={(e) => setProfile({ ...profile, postalCode: e.target.value })}
                      placeholder="400001"
                    />
                  </div>
                </div>

                <h4><Bell size={15} /> Marketing & Notification Preferences</h4>
                <div className="prefsTogglesGroup">
                  <label className="toggleLabel">
                    <input
                      type="checkbox"
                      checked={profile.notificationPreferences?.marketing}
                      onChange={(e) =>
                        setProfile({
                          ...profile,
                          notificationPreferences: {
                            ...profile.notificationPreferences,
                            marketing: e.target.checked,
                          },
                        })
                      }
                    />
                    <span>Receive Promotional Announcements, Flash Sales & New Drops</span>
                  </label>
                  <label className="toggleLabel">
                    <input
                      type="checkbox"
                      checked={profile.notificationPreferences?.orderUpdates}
                      onChange={(e) =>
                        setProfile({
                          ...profile,
                          notificationPreferences: {
                            ...profile.notificationPreferences,
                            orderUpdates: e.target.checked,
                          },
                        })
                      }
                    />
                    <span>Real-time Order Status & Courier Dispatch Notifications</span>
                  </label>
                  <label className="toggleLabel">
                    <input
                      type="checkbox"
                      checked={profile.notificationPreferences?.restocks}
                      onChange={(e) =>
                        setProfile({
                          ...profile,
                          notificationPreferences: {
                            ...profile.notificationPreferences,
                            restocks: e.target.checked,
                          },
                        })
                      }
                    />
                    <span>VIP Restock Alerts on Sold-Out Streetwear Pieces</span>
                  </label>
                </div>

                <button type="submit" className="primary" disabled={savingProfile} style={{ marginTop: 20 }}>
                  {savingProfile ? <><Loader2 size={15} className="spin" /> Saving…</> : <><Save size={15} /> Save All Changes</>}
                </button>
              </form>
            )}

            {/* TAB 5: WISHLIST */}
            {tab === 'wishlist' && (
              <div className="wishlistTab">
                {likedProducts.length === 0 ? (
                  <div className="emptyOrdersState">
                    <Heart size={44} />
                    <p><b>Your wishlist is empty</b></p>
                    <small>Tap the heart icon on any piece to save it for later.</small>
                  </div>
                ) : (
                  <div className="wishlistGrid">
                    {likedProducts.map((p) => (
                      <div key={p.id} className="wishlistCard">
                        <Img src={p.image} alt={p.name} label={p.name} width={80} height={100} />
                        <div className="wishlistMeta">
                          <b>{p.name}</b>
                          <p>{formatINR(p.price)}</p>
                          <button
                            type="button"
                            className="primary full"
                            style={{ padding: '8px 12px', fontSize: 11 }}
                            onClick={() => {
                              if (onAddToCart) onAddToCart(p);
                              onClose();
                            }}
                          >
                            + Move to Bag
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="userPanelFooter">
            <button className="logoutBtn" onClick={onLogout}><LogOut size={15} /> Log Out</button>
          </div>
        </div>
      </div>

      {/* Invoice Modal */}
      {invoiceOrder && (
        <InvoiceDialog order={invoiceOrder} onClose={() => setInvoiceOrder(null)} />
      )}

      {/* Return & Exchange Request Modal */}
      {returnOrder && (
        <ReturnRequestDialog
          order={returnOrder}
          onClose={() => setReturnOrder(null)}
          onSuccess={() => {
            loadOrders();
            setReturnOrder(null);
          }}
        />
      )}
    </>
  );
}
