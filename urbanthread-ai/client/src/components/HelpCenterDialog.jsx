import React, { useState } from 'react';
import {
  X,
  Search,
  HelpCircle,
  Package,
  RotateCcw,
  Ruler,
  Scissors,
  CreditCard,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Send,
  Loader2,
  CheckCircle,
  FileText,
  Mail,
  Phone,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { api } from '../services/api.js';
import ImageUpload from './ImageUpload.jsx';

const FAQ_DATA = [
  {
    category: 'Orders & Tracking',
    icon: Package,
    items: [
      {
        q: 'How do I track the live status of my shipment?',
        a: 'Every order receives a unique tracking number (e.g. KLOTH-849201). Tap "Track Order" in the top navigation or in your user profile to view live checkpoint updates from our courier partner (Streetwear Express).',
      },
      {
        q: 'Can I cancel an order after placing it?',
        a: 'Yes! Orders can be cancelled instantly from your User Profile as long as they are in "Processing", "Confirmed", or "Packed" status before dispatch. Once marked "Shipped", you can request a return after delivery.',
      },
      {
        q: 'What are the delivery timelines across India?',
        a: 'Metro cities (Mumbai, Delhi-NCR, Bangalore, Pune, Hyderabad, Chennai) receive express delivery in 2 to 4 business days. Other regions take 4 to 6 business days.',
      },
    ],
  },
  {
    category: 'Returns, Refunds & Exchanges',
    icon: RotateCcw,
    items: [
      {
        q: 'What is the return and exchange window?',
        a: 'We offer a hassle-free 7-day return and exchange policy from the date of delivery. Items must be unworn, unwashed, and in their original packaging with tags intact.',
      },
      {
        q: 'How do I initiate a size exchange or refund?',
        a: 'Go to your User Profile → My Orders. Delivered orders have a "Request Return / Exchange" button. Choose whether you want a size exchange, replacement, or refund, select your preferred size or reason, and submit. Our team approves requests within 24 hours.',
      },
      {
        q: 'How long does a refund take to process?',
        a: 'Prepaid orders (UPI, Card, NetBanking) are refunded back to the original payment source within 3 to 5 business days after product pickup. Cash on Delivery (COD) refunds are credited via UPI or direct bank transfer.',
      },
    ],
  },
  {
    category: 'Sizing & Streetwear Fit',
    icon: Ruler,
    items: [
      {
        q: 'How do Kloth.fashion sizes fit compared to standard brands?',
        a: 'Our streetwear cuts are designed with modern silhouettes: T-shirts and Hoodies have dropped shoulders and a boxy drape; jeans and cargos are engineered with wide skater legs and relaxed rises. Check our Sizing Guide tab for precise centimeter and inch measurements.',
      },
      {
        q: 'What if the size I ordered doesn’t fit me properly?',
        a: 'We provide free one-time doorstep size exchanges across all non-custom catalog products.',
      },
    ],
  },
  {
    category: 'Custom Clothing & Bespoke Orders',
    icon: Scissors,
    items: [
      {
        q: 'How does the custom clothing request process work?',
        a: 'Click "Custom Request" in the header to open our Bespoke Studio form. Submit your desired garment category, fabric, color, measurements, budget, and design reference photos. Our master tailors review your design and issue a quotation with price and timeline within 24 hours in your profile.',
      },
      {
        q: 'Can I review and decline the quotation if it exceeds my budget?',
        a: 'Absolutely. Quotations are non-binding. You can accept or decline the quote directly from your profile dashboard.',
      },
    ],
  },
  {
    category: 'Payments & Offers',
    icon: CreditCard,
    items: [
      {
        q: 'Which payment methods are supported?',
        a: 'We accept all major UPI apps (Google Pay, PhonePe, Paytm), Credit/Debit Cards (Visa, Mastercard, RuPay), NetBanking, and Cash on Delivery (COD).',
      },
      {
        q: 'How do I apply promotional discount codes?',
        a: 'During checkout or in the bag drawer, enter codes such as STREET20 (20% off), FIRSTBUY (₹500 off on ₹1,500+), or FREESHIP for free express delivery.',
      },
    ],
  },
];

const SIZE_CHARTS = {
  'T-Shirts & Tops': [
    { size: 'S', chest: '40"', length: '27.5"', shoulder: '20.5"', fit: 'Boxy Relaxed' },
    { size: 'M', chest: '43"', length: '28.5"', shoulder: '21.5"', fit: 'Oversized Boxy' },
    { size: 'L', chest: '46"', length: '29.5"', shoulder: '22.5"', fit: 'Heavy Slouch' },
    { size: 'XL', chest: '49"', length: '30.5"', shoulder: '23.5"', fit: 'Street Wide' },
    { size: 'XXL', chest: '52"', length: '31.5"', shoulder: '24.5"', fit: 'Ultra Baggy' },
  ],
  'Hoodies & Fleeces': [
    { size: 'S', chest: '42"', length: '26"', shoulder: '21"', fit: 'Cropped Boxy' },
    { size: 'M', chest: '45"', length: '27"', shoulder: '22"', fit: 'Signature Drape' },
    { size: 'L', chest: '48"', length: '28"', shoulder: '23"', fit: 'Oversized Heavy' },
    { size: 'XL', chest: '51"', length: '29"', shoulder: '24"', fit: 'Slouchy Wide' },
  ],
  'Denim & Cargo Pants': [
    { size: '28', waist: '30"', length: '40"', inseam: '30"', thigh: '26"' },
    { size: '30', waist: '32"', length: '41"', inseam: '30.5"', thigh: '27"' },
    { size: '32', waist: '34"', length: '42"', inseam: '31"', thigh: '28"' },
    { size: '34', waist: '36"', length: '43"', inseam: '31.5"', thigh: '29"' },
    { size: '36', waist: '38"', length: '44"', inseam: '32"', thigh: '30"' },
  ],
};

export default function HelpCenterDialog({ open, onClose, user, onOpenLiveChat, onOpenUserTickets }) {
  const [activeTab, setActiveTab] = useState('faq'); // 'faq' | 'sizing' | 'returns' | 'ticket' | 'contact'
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [sizeCategory, setSizeCategory] = useState('T-Shirts & Tops');

  // Support ticket form
  const [ticketForm, setTicketForm] = useState({
    category: 'Order status and tracking',
    orderId: '',
    subject: '',
    message: '',
    attachment: '',
    priority: 'Normal',
  });
  const [ticketBusy, setTicketBusy] = useState(false);
  const [ticketError, setTicketError] = useState('');
  const [createdTicket, setCreatedTicket] = useState(null);

  if (!open) return null;

  const handleTicketSubmit = async (e) => {
    e.preventDefault();
    if (!ticketForm.subject.trim() || ticketForm.subject.trim().length < 3) {
      setTicketError('Please provide a subject for your ticket.');
      return;
    }
    if (!ticketForm.message.trim() || ticketForm.message.trim().length < 10) {
      setTicketError('Please provide a detailed description (at least 10 characters).');
      return;
    }

    setTicketBusy(true);
    setTicketError('');

    try {
      const res = await api('/support/tickets', {
        method: 'POST',
        body: ticketForm,
      });
      setCreatedTicket(res.ticket);
    } catch (err) {
      setTicketError(err.message);
    } finally {
      setTicketBusy(false);
    }
  };

  const handleResetTicket = () => {
    setCreatedTicket(null);
    setTicketForm({
      category: 'Order status and tracking',
      orderId: '',
      subject: '',
      message: '',
      attachment: '',
      priority: 'Normal',
    });
    setTicketError('');
  };

  // Filter FAQs based on search
  const filteredFaqs = FAQ_DATA.map((cat) => {
    const matching = cat.items.filter(
      (it) =>
        it.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        it.a.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return { ...cat, items: matching };
  }).filter((cat) => cat.items.length > 0);

  return (
    <div className="modalBack" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modalBox helpCenterModalBox" onClick={(e) => e.stopPropagation()}>
        <div className="modalHead">
          <div className="helpHeader">
            <span className="helpBadge"><HelpCircle size={14} /> 24/7 CUSTOMER CARE</span>
            <h2>Kloth.fashion Help Center & Support</h2>
            <p>Find answers to common questions, view size specs, or open an official support ticket.</p>
          </div>
          <button className="iconClose" onClick={onClose} aria-label="Close Help Center">
            <X size={20} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="helpTabs">
          <button
            className={'helpTabBtn ' + (activeTab === 'faq' ? 'active' : '')}
            onClick={() => setActiveTab('faq')}
          >
            <HelpCircle size={15} /> FAQs & Solutions
          </button>
          <button
            className={'helpTabBtn ' + (activeTab === 'sizing' ? 'active' : '')}
            onClick={() => setActiveTab('sizing')}
          >
            <Ruler size={15} /> Sizing & Fit Guide
          </button>
          <button
            className={'helpTabBtn ' + (activeTab === 'returns' ? 'active' : '')}
            onClick={() => setActiveTab('returns')}
          >
            <RotateCcw size={15} /> Returns & Policies
          </button>
          <button
            className={'helpTabBtn ' + (activeTab === 'ticket' ? 'active' : '')}
            onClick={() => setActiveTab('ticket')}
          >
            <FileText size={15} /> Submit Support Ticket
          </button>
          <button
            className={'helpTabBtn ' + (activeTab === 'contact' ? 'active' : '')}
            onClick={() => setActiveTab('contact')}
          >
            <MessageSquare size={15} /> Contact Channels
          </button>
        </div>

        <div className="helpModalBody">
          {/* TAB 1: FAQS */}
          {activeTab === 'faq' && (
            <div className="faqSection">
              <div className="faqSearchWrap">
                <Search size={18} />
                <input
                  type="text"
                  placeholder="Search questions on orders, sizing, delivery, refunds, or fabrics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="faqList">
                {filteredFaqs.length === 0 ? (
                  <div className="noFaqResults">
                    <p>No questions matched "{searchQuery}".</p>
                    <button className="primary" onClick={() => setActiveTab('ticket')}>
                      Submit a Support Ticket Instead
                    </button>
                  </div>
                ) : (
                  filteredFaqs.map((cat, catIdx) => {
                    const CatIcon = cat.icon;
                    return (
                      <div key={catIdx} className="faqCategoryGroup">
                        <h3><CatIcon size={16} /> {cat.category}</h3>
                        <div className="faqItems">
                          {cat.items.map((it, itIdx) => {
                            const key = `${catIdx}-${itIdx}`;
                            const isOpen = expandedFaq === key;
                            return (
                              <div key={itIdx} className={`faqAccordionItem ${isOpen ? 'open' : ''}`}>
                                <button
                                  type="button"
                                  className="faqQuestion"
                                  onClick={() => setExpandedFaq(isOpen ? null : key)}
                                >
                                  <span>{it.q}</span>
                                  {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                </button>
                                {isOpen && <div className="faqAnswer">{it.a}</div>}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB 2: SIZING GUIDE */}
          {activeTab === 'sizing' && (
            <div className="sizingSection">
              <div className="sizeNav">
                {Object.keys(SIZE_CHARTS).map((catName) => (
                  <button
                    key={catName}
                    type="button"
                    className={`sizeCatBtn ${sizeCategory === catName ? 'active' : ''}`}
                    onClick={() => setSizeCategory(catName)}
                  >
                    {catName}
                  </button>
                ))}
              </div>

              <div className="sizeTableWrap">
                <table className="sizeTable">
                  <thead>
                    <tr>
                      {Object.keys(SIZE_CHARTS[sizeCategory][0]).map((col) => (
                        <th key={col}>{col.toUpperCase()}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {SIZE_CHARTS[sizeCategory].map((row, idx) => (
                      <tr key={idx}>
                        {Object.values(row).map((val, vIdx) => (
                          <td key={vIdx}>{val}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="sizingTipsCard">
                <h4>📐 How to Measure for Kloth.fashion Streetwear:</h4>
                <ul>
                  <li><b>Chest:</b> Measure around the fullest part of your chest, keeping the tape horizontal.</li>
                  <li><b>Length:</b> Measured from high shoulder point down to the bottom hem.</li>
                  <li><b>Boxy Drape:</b> Our pieces are intentionally tailored with drop shoulders. Order your regular size for an authentic slouch drape; size down if you prefer a fitted look.</li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 3: RETURNS & POLICIES */}
          {activeTab === 'returns' && (
            <div className="policiesSection">
              <div className="policyCard">
                <h3>🔄 7-Day Doorstep Returns & Exchanges</h3>
                <p>
                  We stand by the craftsmanship of every garment. If you are not satisfied with your piece or require a different size,
                  you can initiate an instant request within 7 calendar days of delivery.
                </p>
                <div className="stepsGrid">
                  <div className="policyStep">
                    <span className="stepNum">1</span>
                    <b>Open Order in Profile</b>
                    <p>Navigate to "My Orders" and click "Request Return / Exchange" on your delivered package.</p>
                  </div>
                  <div className="policyStep">
                    <span className="stepNum">2</span>
                    <b>Instant Review</b>
                    <p>Our team approves requests within 24 hours and schedules a reverse pickup courier.</p>
                  </div>
                  <div className="policyStep">
                    <span className="stepNum">3</span>
                    <b>Free Doorstep Pickup</b>
                    <p>Our courier collects the package right from your doorstep. Replacement size is dispatched immediately.</p>
                  </div>
                </div>
              </div>

              <div className="policyCard">
                <h3>💰 Refund Timeline & Guarantee</h3>
                <p>
                  Refunds are credited within 3-5 business days upon item pickup. We do not deduct any reverse courier fees for size exchanges or defective items.
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: SUBMIT SUPPORT TICKET */}
          {activeTab === 'ticket' && (
            <div className="ticketSection">
              {createdTicket ? (
                <div className="ticketSuccess">
                  <CheckCircle size={52} className="successIcon" />
                  <h3>Support Ticket #{createdTicket.ticketNumber} Opened!</h3>
                  <p>
                    Thank you, <b>{user?.name}</b>. Your inquiry regarding <b>{createdTicket.category}</b> has been queued for our customer support specialists.
                  </p>
                  <div className="quoteInfoCard">
                    <div className="quoteRow">
                      <span>Subject:</span>
                      <strong>{createdTicket.subject}</strong>
                    </div>
                    <div className="quoteRow">
                      <span>Priority:</span>
                      <strong>{createdTicket.priority}</strong>
                    </div>
                    <div className="quoteRow">
                      <span>Response SLA:</span>
                      <strong>Under 4 Hours</strong>
                    </div>
                  </div>
                  <div className="successActions">
                    <button
                      type="button"
                      className="primary"
                      onClick={() => {
                        handleResetTicket();
                        onClose();
                        if (onOpenUserTickets) onOpenUserTickets();
                      }}
                    >
                      View in My Profile <ArrowRight size={15} />
                    </button>
                    <button type="button" className="secondary" onClick={handleResetTicket}>
                      Open Another Ticket
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleTicketSubmit} className="ticketForm">
                  {ticketError && <div className="formErrorNotice">{ticketError}</div>}

                  <div className="formGrid2">
                    <div className="formField">
                      <label>Inquiry Category</label>
                      <select
                        value={ticketForm.category}
                        onChange={(e) => setTicketForm({ ...ticketForm, category: e.target.value })}
                      >
                        <option value="Order status and tracking">Order status and tracking</option>
                        <option value="Cancellation requests">Cancellation requests</option>
                        <option value="Return requests">Return requests</option>
                        <option value="Refund requests">Refund requests</option>
                        <option value="Size and product exchanges">Size and product exchanges</option>
                        <option value="Damaged or incorrect products">Damaged or incorrect products</option>
                        <option value="Payment issues">Payment issues</option>
                        <option value="Delivery problems">Delivery problems</option>
                        <option value="Account and login issues">Account and login issues</option>
                        <option value="General questions and complaints">General questions and complaints</option>
                        <option value="Contact customer support">Contact customer support</option>
                      </select>
                    </div>

                    <div className="formField">
                      <label>Related Order Tracking # or ID (Optional)</label>
                      <input
                        type="text"
                        placeholder="e.g. KLOTH-849201"
                        value={ticketForm.orderId}
                        onChange={(e) => setTicketForm({ ...ticketForm, orderId: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="formGrid2">
                    <div className="formField">
                      <label>Subject</label>
                      <input
                        type="text"
                        placeholder="Brief summary of your question or issue"
                        value={ticketForm.subject}
                        onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                        required
                      />
                    </div>
                    <div className="formField">
                      <label>Priority</label>
                      <select
                        value={ticketForm.priority}
                        onChange={(e) => setTicketForm({ ...ticketForm, priority: e.target.value })}
                      >
                        <option value="Low">Low - General Question</option>
                        <option value="Normal">Normal - Standard Inquiry</option>
                        <option value="High">High - Active Order Issue</option>
                        <option value="Urgent">Urgent - Delivery / Payment Problem</option>
                      </select>
                    </div>
                  </div>

                  <div className="formField">
                    <label>Detailed Message</label>
                    <textarea
                      rows={4}
                      placeholder="Please explain the details of your inquiry so our team can resolve it quickly..."
                      value={ticketForm.message}
                      onChange={(e) => setTicketForm({ ...ticketForm, message: e.target.value })}
                      required
                    />
                  </div>

                  <ImageUpload
                    value={ticketForm.attachment}
                    onChange={(url) => setTicketForm({ ...ticketForm, attachment: url })}
                    label="Attach Screenshot or Photo (Optional)"
                    hint="Upload photos of package, defect, or invoice"
                  />

                  <div className="modalFooterBtns">
                    <button type="button" className="secondary" onClick={onClose} disabled={ticketBusy}>
                      Close
                    </button>
                    <button type="submit" className="primary" disabled={ticketBusy}>
                      {ticketBusy ? <><Loader2 size={16} className="spin" /> Submitting…</> : <><Send size={15} /> Submit Support Ticket</>}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB 5: CONTACT CHANNELS */}
          {activeTab === 'contact' && (
            <div className="contactSection">
              <div className="contactCardsGrid">
                <div className="contactCard">
                  <div className="contactCardIcon"><MessageSquare size={24} /></div>
                  <h4>Kloth.fashion AI Live Assistant</h4>
                  <p>Get instant answers regarding style recommendations, size advice, and stock checks.</p>
                  <button
                    type="button"
                    className="primary"
                    onClick={() => {
                      onClose();
                      if (onOpenLiveChat) onOpenLiveChat();
                    }}
                  >
                    Open Live Chat Widget
                  </button>
                </div>

                <div className="contactCard">
                  <div className="contactCardIcon"><Mail size={24} /></div>
                  <h4>Direct Concierge Email</h4>
                  <p>Inquiries, collaborations, bulk bespoke orders & press:</p>
                  <a href="mailto:support@kloth.fashion" className="contactLink">
                    support@kloth.fashion
                  </a>
                  <small>Typical response time: under 4 hours</small>
                </div>

                <div className="contactCard">
                  <div className="contactCardIcon"><Clock size={24} /></div>
                  <h4>Boutique Hours & Headquarters</h4>
                  <p>Kloth.fashion Studios & Flagship Archive</p>
                  <p className="contactAddress">Bandra West, Mumbai, Maharashtra 400050</p>
                  <small>Monday – Saturday: 10:00 AM – 8:00 PM IST</small>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
