import React, { useMemo, useRef, useState, useEffect } from 'react';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import Hero from '../components/Hero.jsx';

import ProductCard from '../components/ProductCard.jsx';
import CartDialog from '../components/CartDialog.jsx';
import CheckoutDialog from '../components/CheckoutDialog.jsx';
import TrackingDialog from '../components/TrackingDialog.jsx';
import UserPanel from '../components/UserPanel.jsx';
import AdminPanel from '../components/AdminPanel.jsx';
import ChatWidget from '../components/ChatWidget.jsx';
import OfferBanner from '../components/OfferBanner.jsx';
import Recommendations from '../components/Recommendations.jsx';
import CustomRequestDialog from '../components/CustomRequestDialog.jsx';
import HelpCenterDialog from '../components/HelpCenterDialog.jsx';
import NotificationDrawer from '../components/NotificationDrawer.jsx';
import useProducts from '../hooks/useProducts.js';
import {
  TrendingUp,
  Sparkles,
  Layers,
  SlidersHorizontal,
  Check,
  Scissors,
  HelpCircle,
  RotateCcw,
  ShieldCheck,
  Truck,
  Heart,
  Phone,
  Mail,
  MapPin,
  Clock,
} from 'lucide-react';
import { formatINR } from '../utils/format.js';

const CART_STORAGE_KEY = 'kloth_cart_items';
const LIKED_STORAGE_KEY = 'kloth_liked_ids';

const ALL_CATEGORIES = [
  'All',
  'T-Shirts',
  'Shirts',
  'Hoodies',
  'Jackets',
  'Baggy Jeans',
  'Cargo Pants',
  'Caps',
  'Earrings',
  'Necklaces',
  'Chains',
  'Bracelets',
  'Complete Outfits',
];

const SIZES_LIST = ['All', 'S', 'M', 'L', 'XL', 'XXL'];

export default function StorePage({
  user: initialUser,
  onLogout,
  isAdminPreview = false,
  onReturnToAdminDashboard,
}) {
  const { products, status, error, reload } = useProducts();
  const [currentUser, setCurrentUser] = useState(initialUser);

  // Filters & Sorting state
  const [query, setQuery] = useState('');
  const [cat, setCat] = useState('All');
  const [gender, setGender] = useState('All'); // 'All' | 'Men' | 'Women' | 'Unisex'
  const [sizeFilter, setSizeFilter] = useState('All');
  const [priceTier, setPriceTier] = useState('All'); // 'All' | 'under1000' | '1000to2000' | 'above2000'
  const [sortBy, setSortBy] = useState('featured'); // 'featured' | 'price-asc' | 'price-desc' | 'rating' | 'newest'

  // Persistent cart
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Persistent wishlist
  const [liked, setLiked] = useState(() => {
    try {
      const saved = localStorage.getItem(LIKED_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Flying bubbles state for Add to Cart animation
  const [flyingBubbles, setFlyingBubbles] = useState([]);
  const [cartBouncing, setCartBouncing] = useState(false);

  // Modals & Drawers
  const [mobile, setMobile] = useState(false);
  const [admin, setAdmin] = useState(false);
  const [userPanel, setUserPanel] = useState(false);
  const [userPanelInitialTab, setUserPanelInitialTab] = useState('orders');
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [trackingOpen, setTrackingOpen] = useState(false);
  const [trackingId, setTrackingId] = useState('');
  const [showWishlist, setShowWishlist] = useState(false);
  const [activePromo, setActivePromo] = useState('STREET20');
  const [toast, setToast] = useState('');

  // New Modals
  const [customRequestOpen, setCustomRequestOpen] = useState(false);
  const [helpCenterOpen, setHelpCenterOpen] = useState(false);
  const [notifDrawerOpen, setNotifDrawerOpen] = useState(false);

  const cartRef = useRef(null);

  // Sync cart & wishlist to storage
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch { /* storage full */ }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem(LIKED_STORAGE_KEY, JSON.stringify(liked));
    } catch { /* storage full */ }
  }, [liked]);

  // Global helper for opening tracking
  useEffect(() => {
    window.__openTracker = (trk) => {
      setTrackingId(trk);
      setTrackingOpen(true);
    };
    return () => { delete window.__openTracker; };
  }, []);

  const triggerToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  // Distinct categories available in products
  const availableCats = useMemo(() => {
    const fromProds = new Set(products.map((p) => p.category));
    return ALL_CATEGORIES.filter((c) => c === 'All' || fromProds.has(c));
  }, [products]);

  // Trending & Popular Products (rating >= 4.8 or BESTSELLER/TRENDING tag)
  const trendingProducts = useMemo(() => {
    return products
      .filter((p) => p.tag === 'TRENDING' || p.tag === 'BESTSELLER' || p.rating >= 4.8)
      .slice(0, 8);
  }, [products]);

  // New Arrivals & Newly Launched Products (NEW or DROP 02 tag)
  const newArrivals = useMemo(() => {
    return products
      .filter((p) => p.tag === 'NEW' || p.tag === 'DROP 02')
      .slice(0, 8);
  }, [products]);

  // Complete Outfits
  const completeOutfits = useMemo(() => {
    return products.filter((p) => p.category === 'Complete Outfits');
  }, [products]);

  // Catalogue filtered & sorted list
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = products.filter((p) => {
      if (showWishlist && !liked.includes(p.id)) return false;

      // Category filter
      if (cat !== 'All' && p.category !== cat) return false;

      // Gender filter
      if (gender !== 'All') {
        const pGender = p.gender || 'Unisex';
        if (pGender !== gender && pGender !== 'Unisex') return false;
      }

      // Size filter
      if (sizeFilter !== 'All') {
        const sizes = p.sizes || ['S', 'M', 'L', 'XL'];
        if (!sizes.includes(sizeFilter)) return false;
      }

      // Price Tier filter
      if (priceTier === 'under1000' && p.price >= 1000) return false;
      if (priceTier === '1000to2000' && (p.price < 1000 || p.price > 2000)) return false;
      if (priceTier === 'above2000' && p.price <= 2000) return false;

      // Search Query
      if (q) {
        const combined = `${p.name} ${p.category} ${p.color || ''} ${p.tag || ''} ${p.description || ''}`.toLowerCase();
        if (!combined.includes(q)) return false;
      }

      return true;
    });

    if (sortBy === 'price-asc') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      list.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === 'newest') {
      list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }

    return list;
  }, [products, cat, gender, sizeFilter, priceTier, query, showWishlist, liked, sortBy]);

  const toggleLike = (id) => {
    setLiked((l) => {
      const isLiked = l.includes(id);
      triggerToast(isLiked ? 'Removed from wishlist' : 'Saved to wishlist ♥');
      return isLiked ? l.filter((x) => x !== id) : [...l, id];
    });
  };

  // Add item with animated flying bubble to cart and instant count update
  const addToCart = (productToAdd, event) => {
    const size = productToAdd.size || 'M';

    // 1. UPDATE CART COUNT INSTANTLY
    setCart((current) => {
      const idx = current.findIndex(
        (item) => item.id === productToAdd.id && (item.size || 'M') === size
      );
      if (idx > -1) {
        const updated = [...current];
        updated[idx] = {
          ...updated[idx],
          quantity: (updated[idx].quantity || 1) + (productToAdd.quantity || 1),
        };
        return updated;
      }
      return [...current, { ...productToAdd, size, quantity: productToAdd.quantity || 1 }];
    });

    // 2. TRIGGER FLYING BUBBLE ANIMATION
    let startX = window.innerWidth / 2;
    let startY = window.innerHeight / 2;

    if (event && event.currentTarget) {
      const rect = event.currentTarget.getBoundingClientRect();
      startX = rect.left + rect.width / 2;
      startY = rect.top + rect.height / 2;
    }

    const cartBtn = document.getElementById('header-cart-btn') || document.querySelector('.headerCartBtn');
    let endX = window.innerWidth - 65;
    let endY = 40;

    if (cartBtn) {
      const cRect = cartBtn.getBoundingClientRect();
      endX = cRect.left + cRect.width / 2;
      endY = cRect.top + cRect.height / 2;
    }

    const bubbleId = Date.now() + Math.random();
    setFlyingBubbles((prev) => [
      ...prev,
      {
        id: bubbleId,
        image: productToAdd.image,
        startX,
        startY,
        endX,
        endY,
      },
    ]);

    // Cart icon bounce
    setCartBouncing(true);
    setTimeout(() => setCartBouncing(false), 750);

    // Remove flying bubble after animation finishes (650ms)
    setTimeout(() => {
      setFlyingBubbles((prev) => prev.filter((b) => b.id !== bubbleId));
    }, 650);

    triggerToast(`Added ${productToAdd.name} (${size}) to your bag`);
  };

  const updateCartQty = (id, size, delta) => {
    setCart((current) =>
      current
        .map((item) => {
          if (item.id === id && (item.size || 'M') === size) {
            const newQty = (item.quantity || 1) + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const removeFromCart = (id, size) => {
    setCart((current) => current.filter((item) => !(item.id === id && (item.size || 'M') === size)));
  };

  const handleOrderPlaced = (order) => {
    setCart([]);
    triggerToast(`Order ${order.trackingNumber} placed successfully!`);
  };

  const likedProducts = products.filter((p) => liked.includes(p.id));

  const resetAllFilters = () => {
    setQuery('');
    setCat('All');
    setGender('All');
    setSizeFilter('All');
    setPriceTier('All');
    setShowWishlist(false);
  };

  return (
    <div className="app">
      {/* Live Offer Ticker Banner */}
      <OfferBanner onApplyCode={(code) => { setActivePromo(code); triggerToast(`Offer ${code} activated!`); }} />

      <Header
        user={currentUser}
        query={query}
        onQuery={setQuery}
        allProducts={products}
        onSelectProduct={(p) => {
          setQuery(p.name);
          const el = document.getElementById('shop');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        genderFilter={gender}
        onSelectGender={(g) => {
          setGender(g);
          const el = document.getElementById('shop');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        categoryFilter={cat}
        onSelectCategory={setCat}
        likedCount={liked.length}
        cartCount={cart.reduce((s, p) => s + (p.quantity || 1), 0)}
        cartBouncing={cartBouncing}
        mobileOpen={mobile}
        onToggleMobile={() => setMobile((m) => !m)}
        onOpenCart={() => cartRef.current && cartRef.current.showModal()}
        onOpenAdmin={() => setAdmin(true)}
        onOpenUserPanel={() => { setUserPanelInitialTab('orders'); setUserPanel(true); }}
        onOpenTracking={() => { setTrackingId(''); setTrackingOpen(true); }}
        onOpenCustomRequest={() => setCustomRequestOpen(true)}
        onOpenHelpCenter={() => setHelpCenterOpen(true)}
        onOpenNotifications={() => setNotifDrawerOpen(true)}
        onToggleWishlist={() => setShowWishlist((prev) => !prev)}
        showWishlist={showWishlist}
        onLogout={onLogout}
        isAdminPreview={isAdminPreview}
        onReturnToAdminDashboard={onReturnToAdminDashboard}
      />

      <main>
        {/* Dynamic Promotional Hero Slider */}
        <Hero onOpenCustomRequest={() => setCustomRequestOpen(true)} />

        {/* Global Streetwear Values Ticker */}
        <section className="ticker">
          <span>50+ CURATED STREETWEAR PIECES</span>
          <span>HEAVYWEIGHT 240+ GSM WAFFLE & FLEECE</span>
          <span>7-DAY DOORSTEP RETURNS & EXCHANGES</span>
          <span>FREE SHIPPING OVER ₹1,499</span>
          <span>BESPOKE CUSTOM 1-OF-1 TAILORING</span>
        </section>

        {/* ================= SECTION 1: TRENDING & POPULAR ================= */}
        {!showWishlist && !query && (
          <section className="curatedSection trendingSection" id="trending">
            <div className="sectionHead">
              <div>
                <div className="curatedBadge highlight">
                  <TrendingUp size={14} /> COMMUNITY DEMAND
                </div>
                <h2>Trending Now · Most Popular</h2>
                <p className="curatedSub">
                  The most coveted streetwear pieces of the week. High-density fabrics, boxy silhouettes, and customer favorites.
                </p>
              </div>
            </div>

            <div className="grid">
              {trendingProducts.map((p) => (
                <ProductCard
                  key={`trend-${p.id}`}
                  product={p}
                  liked={liked.includes(p.id)}
                  onToggleLike={toggleLike}
                  onAdd={addToCart}
                />
              ))}
            </div>
          </section>
        )}

        {/* ================= SECTION 2: NEW ARRIVALS & FRESH DROPS ================= */}
        {!showWishlist && !query && (
          <section className="curatedSection newArrivalsSection" id="new-arrivals">
            <div className="sectionHead">
              <div>
                <div className="curatedBadge cyan">
                  <Sparkles size={14} /> FRESH FROM THE DESIGN STUDIO
                </div>
                <h2>New Arrivals & Newly Launched</h2>
                <p className="curatedSub">
                  Latest drop additions including acid-washed graphics, vintage skate tees, and tarnish-free stainless accessories.
                </p>
              </div>
            </div>

            <div className="grid">
              {newArrivals.map((p) => (
                <ProductCard
                  key={`new-${p.id}`}
                  product={p}
                  liked={liked.includes(p.id)}
                  onToggleLike={toggleLike}
                  onAdd={addToCart}
                />
              ))}
            </div>
          </section>
        )}

        {/* ================= BESPOKE BANNER CALLOUT ================= */}
        {!showWishlist && !query && (
          <section className="bespokePromoBanner">
            <div className="bespokePromoContent">
              <span className="bespokeEyebrow"><Scissors size={14} /> 1-OF-1 BESPOKE ATELIER</span>
              <h2>Can't find your exact silhouette?</h2>
              <p>
                Our master tailors create custom streetwear garments crafted from 450 GSM French Terry, 14oz rigid skater denim,
                or double-brushed flannels according to your exact measurements and design references.
              </p>
              <button
                type="button"
                className="primary bespokeCtaBtn"
                onClick={() => setCustomRequestOpen(true)}
              >
                Submit Custom Design Request <Sparkles size={15} />
              </button>
            </div>
          </section>
        )}

        {/* ================= SECTION 3: CURATED COMPLETE OUTFITS ================= */}
        {!showWishlist && !query && completeOutfits.length > 0 && (
          <section className="curatedSection outfitsSection" id="outfits">
            <div className="sectionHead">
              <div>
                <div className="curatedBadge gold">
                  <Layers size={14} /> COMPLETE STREETWEAR ENSEMBLES
                </div>
                <h2>Head-to-Toe Curated Outfits</h2>
                <p className="curatedSub">
                  Pre-styled matching co-ords, layered skate ensembles, and utility sets crafted for effortless presence.
                </p>
              </div>
            </div>

            <div className="grid">
              {completeOutfits.map((p) => (
                <ProductCard
                  key={`outfit-${p.id}`}
                  product={p}
                  liked={liked.includes(p.id)}
                  onToggleLike={toggleLike}
                  onAdd={addToCart}
                />
              ))}
            </div>
          </section>
        )}

        {/* ================= SECTION 4: FULL SHOP CATALOGUE (50+ ITEMS) ================= */}
        <section className="shop" id="shop">
          <div className="sectionHead">
            <div>
              <p className="eyebrow">{showWishlist ? 'SAVED WISHLIST' : 'THE FULL DROP ARCHIVE (50+ PIECES)'}</p>
              <h2>{showWishlist ? 'Your Saved Wishlist Pieces' : 'Explore The Full Catalogue'}</h2>
              <p className="sectionNote">
                {showWishlist
                  ? `${likedProducts.length} saved favorites`
                  : `Showing ${visible.length} of ${products.length} fashion products`}
              </p>
            </div>

            <div className="catalogueControls">
              {!showWishlist && (
                <div className="sortWrap">
                  <SlidersHorizontal size={14} />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    aria-label="Sort products"
                  >
                    <option value="featured">Sort: Featured</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="rating">Highest Rated</option>
                    <option value="newest">Newest Drops</option>
                  </select>
                </div>
              )}

              {showWishlist && (
                <button className="primary" onClick={() => setShowWishlist(false)}>
                  ← View Full Catalogue
                </button>
              )}
            </div>
          </div>

          {/* Comprehensive Multi-Filter Bar */}
          {!showWishlist && (
            <div className="multiFilterBar">
              {/* Category Filter Chips */}
              <div className="categoryFilterScroll" role="group" aria-label="Filter by category">
                {availableCats.map((c) => (
                  <button
                    className={'catChip ' + (cat === c ? 'active' : '')}
                    aria-pressed={cat === c}
                    onClick={() => setCat(c)}
                    key={c}
                  >
                    {c} {c !== 'All' ? `(${products.filter(p => p.category === c).length})` : `(${products.length})`}
                  </button>
                ))}
              </div>

              {/* Sub-Filters: Gender, Size, Price Range */}
              <div className="subFiltersRow">
                <div className="subFilterGroup">
                  <span className="subFilterLabel">Audience:</span>
                  {['All', 'Men', 'Women', 'Unisex'].map((g) => (
                    <button
                      key={g}
                      type="button"
                      className={`filterPillBtn ${gender === g ? 'active' : ''}`}
                      onClick={() => setGender(g)}
                    >
                      {g}
                    </button>
                  ))}
                </div>

                <div className="subFilterGroup">
                  <span className="subFilterLabel">Size:</span>
                  {SIZES_LIST.map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      className={`filterPillBtn ${sizeFilter === sz ? 'active' : ''}`}
                      onClick={() => setSizeFilter(sz)}
                    >
                      {sz}
                    </button>
                  ))}
                </div>

                <div className="subFilterGroup">
                  <span className="subFilterLabel">Price:</span>
                  <button
                    type="button"
                    className={`filterPillBtn ${priceTier === 'All' ? 'active' : ''}`}
                    onClick={() => setPriceTier('All')}
                  >
                    All
                  </button>
                  <button
                    type="button"
                    className={`filterPillBtn ${priceTier === 'under1000' ? 'active' : ''}`}
                    onClick={() => setPriceTier('under1000')}
                  >
                    Under ₹1,000
                  </button>
                  <button
                    type="button"
                    className={`filterPillBtn ${priceTier === '1000to2000' ? 'active' : ''}`}
                    onClick={() => setPriceTier('1000to2000')}
                  >
                    ₹1,000 – ₹2,000
                  </button>
                  <button
                    type="button"
                    className={`filterPillBtn ${priceTier === 'above2000' ? 'active' : ''}`}
                    onClick={() => setPriceTier('above2000')}
                  >
                    ₹2,000+
                  </button>
                </div>

                {(cat !== 'All' || gender !== 'All' || sizeFilter !== 'All' || priceTier !== 'All' || query) && (
                  <button
                    type="button"
                    className="clearFiltersTextBtn"
                    onClick={resetAllFilters}
                  >
                    Reset Filters
                  </button>
                )}
              </div>
            </div>
          )}

          {status === 'loading' && (
            <div className="grid" aria-busy="true" aria-label="Loading products">
              {Array.from({ length: 8 }, (_, i) => <div className="skeleton" key={i} />)}
            </div>
          )}

          {status === 'error' && (
            <div className="statusBox" role="alert">
              <p><b>We couldn’t load the catalogue.</b></p>
              <p>{error}</p>
              <button className="primary" onClick={reload}>Try again</button>
            </div>
          )}

          {status === 'ready' && products.length === 0 && (
            <div className="statusBox">
              <p><b>The catalogue is empty.</b></p>
              <p>No products were found. Reload to seed the 50+ item catalogue.</p>
              <button className="primary" onClick={reload}>Reload Catalogue</button>
            </div>
          )}

          {status === 'ready' && products.length > 0 && visible.length === 0 && (
            <div className="statusBox">
              <p><b>No pieces match your search or filters.</b></p>
              <button className="primary" onClick={resetAllFilters}>
                Clear all filters
              </button>
            </div>
          )}

          {status === 'ready' && visible.length > 0 && (
            <div className="grid">
              {visible.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  liked={liked.includes(p.id)}
                  onToggleLike={toggleLike}
                  onAdd={addToCart}
                />
              ))}
            </div>
          )}
        </section>

        {/* Dynamic Recommendations Section */}
        <Recommendations
          products={products}
          onAdd={addToCart}
          liked={liked}
          onToggleLike={toggleLike}
        />

        {/* Storefront Feature Trust Badges */}
        <section className="storeTrustBadges">
          <div className="trustBadgeItem">
            <Truck size={26} />
            <div>
              <strong>Pan-India Express Shipping</strong>
              <small>Doorstep delivery in 2-4 days, free on ₹1,499+</small>
            </div>
          </div>
          <div className="trustBadgeItem">
            <RotateCcw size={26} />
            <div>
              <strong>7-Day Returns & Exchanges</strong>
              <small>Hassle-free size swaps & full refunds</small>
            </div>
          </div>
          <div className="trustBadgeItem">
            <Scissors size={26} />
            <div>
              <strong>1-of-1 Bespoke Tailoring</strong>
              <small>Custom fits crafted by master tailors</small>
            </div>
          </div>
          <div className="trustBadgeItem">
            <ShieldCheck size={26} />
            <div>
              <strong>Verified Safe Checkout</strong>
              <small>Instant UPI, Cards, NetBanking & COD</small>
            </div>
          </div>
        </section>

        <section className="story" id="story">
          <div>
            <p className="eyebrow">KLOTH.FASHION MANIFESTO</p>
            <h2>Clothes for the days you didn't plan.</h2>
          </div>
          <p>
            Kloth.fashion is an independent contemporary streetwear concept engineered around
            durable 240+ GSM fabrics, versatile drop-shoulder layers, wide-profile baggy denim, and effortless
            silhouettes. Built with intention. Crafted to repeat.
          </p>
        </section>

      </main>

      {/* Floating Animated Cart Bubbles Portal */}
      {flyingBubbles.map((b) => (
        <div
          key={b.id}
          className="flyingCartBubble"
          style={{
            '--startX': `${b.startX}px`,
            '--startY': `${b.startY}px`,
            '--endX': `${b.endX}px`,
            '--endY': `${b.endY}px`,
          }}
        >
          <img src={b.image} alt="Adding to bag..." />
        </div>
      ))}

      {/* Floating AI Chat Assistant with interactive product recommendations */}
      <ChatWidget
        allProducts={products}
        onAddToCart={addToCart}
        onOpenCustomRequest={() => setCustomRequestOpen(true)}
        onOpenHelpCenter={() => setHelpCenterOpen(true)}
      />

      {/* Cart Drawer */}
      <CartDialog
        ref={cartRef}
        cart={cart}
        onUpdateQty={updateCartQty}
        onRemove={removeFromCart}
        initialPromo={activePromo}
        onProceedToCheckout={(promo) => {
          setActivePromo(promo);
          setCheckoutOpen(true);
        }}
      />

      {/* Checkout & Payment Integration Modal */}
      <CheckoutDialog
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        cart={cart}
        user={currentUser}
        initialPromo={activePromo}
        onOrderPlaced={handleOrderPlaced}
      />

      {/* Live Order Tracking Modal */}
      <TrackingDialog
        open={trackingOpen}
        onClose={() => setTrackingOpen(false)}
        defaultTracking={trackingId}
      />

      {/* User Panel (Profile, Orders, Bespoke Requests, Support Tickets, Wishlist) */}
      <UserPanel
        open={userPanel}
        onClose={() => setUserPanel(false)}
        user={currentUser}
        initialTab={userPanelInitialTab}
        onUpdateUser={setCurrentUser}
        onLogout={onLogout}
        onOpenTracker={(trk) => {
          setTrackingId(trk);
          setTrackingOpen(true);
        }}
        likedProducts={likedProducts}
        onAddToCart={addToCart}
        onOpenCustomRequestModal={() => setCustomRequestOpen(true)}
        onOpenHelpCenter={() => setHelpCenterOpen(true)}
      />

      {/* Bespoke Custom Clothing Request Modal */}
      <CustomRequestDialog
        open={customRequestOpen}
        onClose={() => setCustomRequestOpen(false)}
        user={currentUser}
        onOpenUserRequests={() => {
          setUserPanelInitialTab('custom');
          setUserPanel(true);
        }}
      />

      {/* Help Center & Support Modal */}
      <HelpCenterDialog
        open={helpCenterOpen}
        onClose={() => setHelpCenterOpen(false)}
        user={currentUser}
        onOpenLiveChat={() => {
          const chatBtn = document.querySelector('.chatTriggerBtn') || document.querySelector('.chatWidgetToggle');
          if (chatBtn) chatBtn.click();
        }}
        onOpenUserTickets={() => {
          setUserPanelInitialTab('tickets');
          setUserPanel(true);
        }}
      />

      {/* Marketing Notifications Drawer */}
      <NotificationDrawer
        open={notifDrawerOpen}
        onClose={() => setNotifDrawerOpen(false)}
        onSelectPromo={(code) => {
          setActivePromo(code);
          triggerToast(`Promo code ${code} copied!`);
        }}
        onOpenUserPrefs={() => {
          setUserPanelInitialTab('profile');
          setUserPanel(true);
        }}
      />

      {/* Admin Panel Modal (fallback storefront shortcut) */}
      {admin && (
        <AdminPanel
          me={currentUser}
          onClose={() => setAdmin(false)}
          onProductsChanged={reload}
        />
      )}

      {/* Floating Action Toast Notification */}
      {toast && <div className="floatingToast">{toast}</div>}

      {/* Comprehensive Modern E-Commerce Footer */}
      <Footer
        onSelectGender={(g) => {
          setGender(g);
          const el = document.getElementById('shop');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        onSelectCategory={(c) => {
          setCat(c);
          const el = document.getElementById('shop');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        onOpenTracking={() => {
          setTrackingId('');
          setTrackingOpen(true);
        }}
        onOpenHelpCenter={(tab) => {
          setHelpCenterOpen(true);
        }}
        onOpenCustomRequest={() => setCustomRequestOpen(true)}
        onOpenNotifications={() => setNotifDrawerOpen(true)}
      />
    </div>
  );
}

