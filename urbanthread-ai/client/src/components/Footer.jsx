import React, { useState } from 'react';
import {
  Send,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ShieldCheck,
  CreditCard,
  Truck,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { api } from '../services/api.js';


export default function Footer({
  onSelectGender,
  onSelectCategory,
  onOpenTracking,
  onOpenHelpCenter,
  onOpenCustomRequest,
  onOpenNotifications,
}) {
  const [email, setEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState({ state: 'idle', message: '' });
  const [mobileExpanded, setMobileExpanded] = useState({
    shop: false,
    support: false,
    about: false,
  });

  const toggleMobileCol = (col) => {
    setMobileExpanded((prev) => ({ ...prev, [col]: !prev[col] }));
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();
    const trimmed = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!trimmed || !emailRegex.test(trimmed)) {
      setNewsletterStatus({
        state: 'error',
        message: 'Please enter a valid email address (e.g. name@domain.com).',
      });
      return;
    }

    try {
      // Check if already subscribed locally
      const subscribedList = JSON.parse(localStorage.getItem('kloth_subscribed_emails') || '[]');
      if (subscribedList.includes(trimmed.toLowerCase())) {
        setNewsletterStatus({
          state: 'success',
          message: 'You are already on the VIP private drop list!',
        });
        return;
      }

      await api('/marketing/newsletter', {
        method: 'POST',
        body: { email: trimmed },
      }).catch(() => {
        // Fallback resilience if offline
        return { ok: true };
      });

      subscribedList.push(trimmed.toLowerCase());
      localStorage.setItem('kloth_subscribed_emails', JSON.stringify(subscribedList));

      setNewsletterStatus({
        state: 'success',
        message: '✓ Welcome to Kloth.fashion. Check your inbox for private drop invitations.',
      });
      setEmail('');
    } catch {
      setNewsletterStatus({
        state: 'error',
        message: 'Unable to subscribe right now. Please try again shortly.',
      });
    }
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="siteFooter" id="footer" role="contentinfo">
      {/* Upper Service Highlights Strip */}
      <div className="footerServiceStrip">
        <div className="footerServiceContainer">
          <div className="footerServiceItem">
            <Truck size={18} />
            <div>
              <strong>Free Express Delivery</strong>
              <small>On orders over ₹1,499 across India</small>
            </div>
          </div>
          <div className="footerServiceItem">
            <RotateCcw size={18} />
            <div>
              <strong>7-Day Doorstep Returns</strong>
              <small>Hassle-free size & silhouette exchanges</small>
            </div>
          </div>
          <div className="footerServiceItem">
            <ShieldCheck size={18} />
            <div>
              <strong>Authentic Heavyweight Garments</strong>
              <small>240+ to 450 GSM luxury fabrics</small>
            </div>
          </div>
          <div className="footerServiceItem">
            <Sparkles size={18} />
            <div>
              <strong>1-of-1 Bespoke Tailoring</strong>
              <small>Custom streetwear stitched to your specs</small>
            </div>
          </div>
        </div>
      </div>

      <div className="footerGrid">
        {/* Column 1: Brand Identity & Newsletter */}
        <div className="footerCol brandCol">
          <div className="footerBrandLogo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <span className="logoMain">KLOTH</span>
            <span className="logoAccent">.fashion</span>
            <span className="logoAtelierBadge">EST. 2026 · ATELIER</span>
          </div>

          <p className="footerAboutText">
            Discover your style with thoughtfully curated fashion, everyday essentials, and the latest trends.
            Engineered silhouettes, heavyweight textiles, and uncompromising contemporary aesthetics.
          </p>

          {/* Social Channels */}
          <div className="footerSocialIcons" aria-label="Official Social Profiles">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Kloth.fashion Instagram"
              className="socialIconLink"
              title="Instagram"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Kloth.fashion Facebook"
              className="socialIconLink"
              title="Facebook"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
              </svg>
            </a>
            <a
              href="https://pinterest.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Kloth.fashion Pinterest"
              className="socialIconLink"
              title="Pinterest"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345-.09.375-.291 1.199-.334 1.373-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
              </svg>
            </a>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Kloth.fashion YouTube"
              className="socialIconLink"
              title="YouTube"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </a>
          </div>


          {/* Newsletter Box */}
          <div className="footerNewsletterCard">
            <h5>BE FIRST TO RECEIVE PRIVATE DROPS</h5>
            <p className="newsletterSub">
              Subscribe for secret capsule releases, private flash sales, and restock alerts before anyone else.
            </p>
            <form onSubmit={handleSubscribe} className="footerNewsletterForm" noValidate>
              <div className="newsletterInputWrap">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (newsletterStatus.state !== 'idle') {
                      setNewsletterStatus({ state: 'idle', message: '' });
                    }
                  }}
                  placeholder="Enter your email address..."
                  aria-label="Newsletter email address"
                  autoComplete="email"
                />
                <button type="submit" aria-label="Subscribe to newsletter" className="newsletterSubmitBtn">
                  <span>Join</span>
                  <Send size={13} />
                </button>
              </div>

              {newsletterStatus.state === 'success' && (
                <div className="newsletterFeedback success" role="alert">
                  <CheckCircle2 size={13} />
                  <span>{newsletterStatus.message}</span>
                </div>
              )}
              {newsletterStatus.state === 'error' && (
                <div className="newsletterFeedback error" role="alert">
                  <AlertCircle size={13} />
                  <span>{newsletterStatus.message}</span>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Column 2: Shop & Collections */}
        <div className={`footerCol ${mobileExpanded.shop ? 'expandedMobile' : ''}`}>
          <div className="footerColHeader" onClick={() => toggleMobileCol('shop')}>
            <h4>SHOP COLLECTIONS</h4>
            <ChevronDown size={16} className="accordionArrow" />
          </div>
          <ul className="footerLinksList">
            <li>
              <button
                type="button"
                className="footerLinkBtn"
                onClick={() => {
                  onSelectGender?.('All');
                  onSelectCategory?.('All');
                  scrollToSection('new-arrivals');
                }}
              >
                New Arrivals
              </button>
            </li>
            <li>
              <button
                type="button"
                className="footerLinkBtn"
                onClick={() => {
                  onSelectGender?.('All');
                  onSelectCategory?.('All');
                  scrollToSection('trending');
                }}
              >
                Trending Now
              </button>
            </li>
            <li>
              <button
                type="button"
                className="footerLinkBtn"
                onClick={() => {
                  onSelectGender?.('Men');
                  onSelectCategory?.('All');
                  scrollToSection('shop');
                }}
              >
                Men's Collection
              </button>
            </li>
            <li>
              <button
                type="button"
                className="footerLinkBtn"
                onClick={() => {
                  onSelectGender?.('Women');
                  onSelectCategory?.('All');
                  scrollToSection('shop');
                }}
              >
                Women's Collection
              </button>
            </li>
            <li>
              <button
                type="button"
                className="footerLinkBtn"
                onClick={() => {
                  onSelectGender?.('All');
                  onSelectCategory?.('All');
                  scrollToSection('shop');
                }}
              >
                All Clothing & Essentials
              </button>
            </li>
            <li>
              <button
                type="button"
                className="footerLinkBtn"
                onClick={() => {
                  onSelectGender?.('All');
                  onSelectCategory?.('Chains');
                  scrollToSection('shop');
                }}
              >
                Accessories & Jewelry
              </button>
            </li>
            <li>
              <button
                type="button"
                className="footerLinkBtn"
                onClick={() => {
                  onSelectGender?.('All');
                  onSelectCategory?.('All');
                  scrollToSection('trending');
                }}
              >
                Best Sellers
              </button>
            </li>
            <li>
              <button
                type="button"
                className="footerLinkBtn highlightSaleLink"
                onClick={() => {
                  if (onOpenNotifications) onOpenNotifications();
                }}
              >
                Sale & Promotional Offers
              </button>
            </li>
          </ul>
        </div>

        {/* Column 3: Customer Support */}
        <div className={`footerCol ${mobileExpanded.support ? 'expandedMobile' : ''}`}>
          <div className="footerColHeader" onClick={() => toggleMobileCol('support')}>
            <h4>CUSTOMER SUPPORT</h4>
            <ChevronDown size={16} className="accordionArrow" />
          </div>
          <ul className="footerLinksList">
            <li>
              <button
                type="button"
                className="footerLinkBtn"
                onClick={() => onOpenHelpCenter?.('contact')}
              >
                Contact Us & Concierge
              </button>
            </li>
            <li>
              <button
                type="button"
                className="footerLinkBtn"
                onClick={() => onOpenHelpCenter?.('faq')}
              >
                Help Center
              </button>
            </li>
            <li>
              <button
                type="button"
                className="footerLinkBtn"
                onClick={() => onOpenTracking?.()}
              >
                Track My Order
              </button>
            </li>
            <li>
              <button
                type="button"
                className="footerLinkBtn"
                onClick={() => onOpenHelpCenter?.('shipping')}
              >
                Shipping & Delivery Info
              </button>
            </li>
            <li>
              <button
                type="button"
                className="footerLinkBtn"
                onClick={() => onOpenHelpCenter?.('returns')}
              >
                Returns & Size Exchanges
              </button>
            </li>
            <li>
              <button
                type="button"
                className="footerLinkBtn"
                onClick={() => onOpenHelpCenter?.('returns')}
              >
                7-Day Refund Policy
              </button>
            </li>
            <li>
              <button
                type="button"
                className="footerLinkBtn"
                onClick={() => onOpenHelpCenter?.('faq')}
              >
                Frequently Asked Questions
              </button>
            </li>
            <li>
              <button
                type="button"
                className="footerLinkBtn"
                onClick={() => onOpenHelpCenter?.('sizing')}
              >
                Streetwear Sizing & Fit Guide
              </button>
            </li>
          </ul>
        </div>

        {/* Column 4: About Kloth.fashion */}
        <div className={`footerCol ${mobileExpanded.about ? 'expandedMobile' : ''}`}>
          <div className="footerColHeader" onClick={() => toggleMobileCol('about')}>
            <h4>ABOUT KLOTH.FASHION</h4>
            <ChevronDown size={16} className="accordionArrow" />
          </div>
          <ul className="footerLinksList">
            <li>
              <button
                type="button"
                className="footerLinkBtn"
                onClick={() => scrollToSection('story')}
              >
                About Us
              </button>
            </li>
            <li>
              <button
                type="button"
                className="footerLinkBtn"
                onClick={() => scrollToSection('story')}
              >
                Our Story & Manifesto
              </button>
            </li>
            <li>
              <button
                type="button"
                className="footerLinkBtn"
                onClick={() => onOpenCustomRequest?.()}
              >
                Bespoke Tailoring Atelier
              </button>
            </li>
            <li>
              <button
                type="button"
                className="footerLinkBtn"
                onClick={() => onOpenHelpCenter?.('terms')}
              >
                Privacy Policy
              </button>
            </li>
            <li>
              <button
                type="button"
                className="footerLinkBtn"
                onClick={() => onOpenHelpCenter?.('terms')}
              >
                Terms and Conditions
              </button>
            </li>
            <li>
              <button
                type="button"
                className="footerLinkBtn"
                onClick={() => onOpenHelpCenter?.('shipping')}
              >
                Shipping Policy
              </button>
            </li>
            <li>
              <button
                type="button"
                className="footerLinkBtn"
                onClick={() => onOpenHelpCenter?.('contact')}
              >
                Careers & Studio Inquiries
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Footer Bar */}
      <div className="footerBottom">
        <div className="footerBottomContainer">
          <div className="footerCopyright">
            <p>© 2026 Kloth.fashion. All rights reserved.</p>
          </div>

          <div className="footerLegalLinks">
            <button type="button" className="footerLegalBtn" onClick={() => onOpenHelpCenter?.('terms')}>
              Privacy Policy
            </button>
            <span className="footerLegalSep">·</span>
            <button type="button" className="footerLegalBtn" onClick={() => onOpenHelpCenter?.('terms')}>
              Terms and Conditions
            </button>
            <span className="footerLegalSep">·</span>
            <button type="button" className="footerLegalBtn" onClick={() => onOpenHelpCenter?.('returns')}>
              Refund and Return Policy
            </button>
          </div>

          {/* Supported Payment Badges: UPI, Cards, NetBanking, Cash on Delivery */}
          <div className="footerPaymentMethods" aria-label="Supported Payment Methods">
            <span className="paymentBadge upiBadge" title="Unified Payments Interface (UPI)">UPI</span>
            <span className="paymentBadge cardsBadge" title="Debit & Credit Cards (Visa, Mastercard, RuPay)">CARDS</span>
            <span className="paymentBadge netBankingBadge" title="Net Banking">NETBANKING</span>
            <span className="paymentBadge codBadge" title="Cash on Delivery">CASH ON DELIVERY</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
