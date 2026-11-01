import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  ShoppingBag,
  Heart,
  Menu,
  X,
  User,
  Shield,
  Package,
  Sparkles,
  TrendingUp,
  Scissors,
  HelpCircle,
  Bell,
  ChevronDown,
  ArrowRight,
  Truck,
  RotateCcw,
  Check,
  Flame,
  Star,
  ExternalLink,
} from 'lucide-react';
import { formatINR } from '../utils/format.js';

const ANNOUNCEMENTS = [
  {
    id: 1,
    text: '⚡ Free Express Delivery on orders over ₹1,499 across India',
    badge: 'FREE SHIPPING',
    actionText: 'Shop Drops',
  },
  {
    id: 2,
    text: '🔥 DROP 02 LIVE · 50+ Contemporary Streetwear Pieces Now Available',
    badge: 'NEW COLLECTION',
    actionText: 'Explore',
  },
  {
    id: 3,
    text: '✨ Exclusive Launch Offer: Use code STREET20 for 20% OFF your entire order',
    badge: 'CODE: STREET20',
    actionText: 'Apply Code',
  },
  {
    id: 4,
    text: '🎯 7-Day Doorstep Returns & Exchanges · Guaranteed Authenticity',
    badge: 'ASSURED',
    actionText: 'Learn More',
  },
];

const POPULAR_SEARCH_TAGS = [
  'Hoodies',
  'Baggy Jeans',
  'T-Shirts',
  'Chains',
  'Jackets',
  'Cargo Pants',
  'Caps',
];

export default function Header({
  user,
  query,
  onQuery,
  allProducts = [],
  onSelectProduct,
  genderFilter,
  onSelectGender,
  categoryFilter,
  onSelectCategory,
  likedCount,
  cartCount,
  cartBouncing = false,
  mobileOpen,
  onToggleMobile,
  onOpenCart,
  onOpenAdmin,
  onOpenUserPanel,
  onOpenTracking,
  onOpenCustomRequest,
  onOpenHelpCenter,
  onOpenNotifications,
  onToggleWishlist,
  showWishlist,
  onLogout,
  isAdminPreview = false,
  onReturnToAdminDashboard,
}) {
  const [searchFocused, setSearchFocused] = useState(false);
  const [activeAnnouncementIdx, setActiveAnnouncementIdx] = useState(0);
  const [clothingMenuOpen, setClothingMenuOpen] = useState(false);
  const [accessoriesMenuOpen, setAccessoriesMenuOpen] = useState(false);
  const [mobileSearchVisible, setMobileSearchVisible] = useState(false);

  // Mobile accordion states
  const [mobileClothingOpen, setMobileClothingOpen] = useState(false);
  const [mobileAccessoriesOpen, setMobileAccessoriesOpen] = useState(false);

  const searchContainerRef = useRef(null);
  const mobileSearchRef = useRef(null);
  const clothingTimeoutRef = useRef(null);
  const accessoriesTimeoutRef = useRef(null);

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Rotating top announcement banner (every 5 seconds)
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveAnnouncementIdx((prev) => (prev + 1) % ANNOUNCEMENTS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Live Auto-complete matches from actual store catalogue
  const searchMatches = query.trim().length >= 1
    ? allProducts
        .filter((p) => {
          const q = query.toLowerCase();
          return (
            p.name.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q) ||
            (p.color && p.color.toLowerCase().includes(q)) ||
            (p.tag && p.tag.toLowerCase().includes(q)) ||
            (p.gender && p.gender.toLowerCase().includes(q))
          );
        })
        .slice(0, 6)
    : [];

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target) &&
        (!mobileSearchRef.current || !mobileSearchRef.current.contains(e.target))
      ) {
        setSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const closeMenu = () => {
    if (mobileOpen) onToggleMobile();
  };

  const handleSelectCategoryAndScroll = (category, gender = 'All') => {
    closeMenu();
    setClothingMenuOpen(false);
    setAccessoriesMenuOpen(false);
    onSelectGender(gender);
    onSelectCategory(category);
    const shopEl = document.getElementById('shop');
    if (shopEl) shopEl.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSelectProductItem = (prod) => {
    onQuery(prod.name);
    setSearchFocused(false);
    setMobileSearchVisible(false);
    closeMenu();
    if (onSelectProduct) onSelectProduct(prod);
    const shopEl = document.getElementById('shop');
    if (shopEl) shopEl.scrollIntoView({ behavior: 'smooth' });
  };

  const activeAnnouncement = ANNOUNCEMENTS[activeAnnouncementIdx];

  return (
    <header className={`siteHeader ${isScrolled ? 'headerScrolled' : ''}`} role="banner">
      {/* Admin Preview Mode Floating Bar */}
      {isAdminPreview && (
        <div className="adminPreviewTopBar" role="region" aria-label="Administrator Preview Notice">
          <div className="previewLeft">
            <Shield size={14} />
            <span>Store Preview Mode (Logged in as Store Administrator)</span>
          </div>
          <button
            type="button"
            className="returnToAdminBtn"
            onClick={onReturnToAdminDashboard}
          >
            ← Back to Owner Dashboard
          </button>
        </div>
      )}

      {/* ================= LEVEL A: TOP PROMOTIONAL ANNOUNCEMENT BAR ================= */}
      <div className="topAnnouncementBar">
        <div className="announcementContainer">
          {/* Left: Rotating Announcement Message */}
          <div className="announcementContent" key={activeAnnouncement.id}>
            <span className="announcementBadge">{activeAnnouncement.badge}</span>
            <span className="announcementText">{activeAnnouncement.text}</span>
            <button
              type="button"
              className="announcementActionBtn"
              onClick={() => {
                const el = document.getElementById('shop');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Shop Now →
            </button>
          </div>

          {/* Right: Quick Utilities */}
          <div className="announcementRightLinks">
            <button
              type="button"
              className="announcementLink"
              onClick={() => onOpenTracking && onOpenTracking()}
            >
              <Package size={12} />
              <span>Track Order</span>
            </button>
            <span className="announcementSep">|</span>
            <button
              type="button"
              className="announcementLink"
              onClick={() => onOpenHelpCenter && onOpenHelpCenter('contact')}
            >
              <HelpCircle size={12} />
              <span>Help & Support</span>
            </button>
            <span className="announcementSep">|</span>
            <button
              type="button"
              className="announcementLink highlightAtelier"
              onClick={() => onOpenCustomRequest && onOpenCustomRequest()}
            >
              <Scissors size={12} />
              <span>Bespoke Atelier</span>
            </button>
          </div>
        </div>
      </div>

      {/* ================= LEVEL B: MAIN HEADER ROW ================= */}
      <div className="mainHeaderRow">
        <div className="headerContainer">
          {/* Mobile Hamburger Toggle Button */}
          <button
            className="mobileMenuToggleBtn mobileOnly"
            onClick={onToggleMobile}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          {/* Left: High-Fashion Brand Logo */}
          <div
            className="brandLogo"
            onClick={() => {
              onSelectGender('All');
              onSelectCategory('All');
              onQuery('');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            role="link"
            tabIndex={0}
            aria-label="Kloth.fashion Homepage"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
          >
            <span className="brandWord">KLOTH</span>
            <span className="brandSuffix">.fashion</span>
            <span className="brandAtelierTag">EST. 2026 · ATELIER</span>
          </div>

          {/* Center: Prominent Responsive Search Bar */}
          <div className="mainSearchWrapper desktopOnly" ref={searchContainerRef}>
            <div className={`searchBarBox ${searchFocused ? 'isFocused' : ''}`}>
              <Search size={18} className="searchIcon" />
              <input
                type="text"
                value={query}
                onChange={(e) => {
                  onQuery(e.target.value);
                  setSearchFocused(true);
                }}
                onFocus={() => setSearchFocused(true)}
                placeholder="Search clothing, sneakers, accessories..."
                aria-label="Search catalog for clothing, sneakers, accessories"
                autoComplete="off"
              />
              {query && (
                <button
                  type="button"
                  className="searchClearBtn"
                  onClick={() => {
                    onQuery('');
                    setSearchFocused(false);
                  }}
                  aria-label="Clear search input"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            {/* Live Search Auto-Complete & Recommendations Dropdown */}
            {searchFocused && (
              <div className="searchDropdownPopover" role="listbox">
                {query.trim().length === 0 ? (
                  <div className="searchPopularTags">
                    <span className="popTagHeader">Popular Searches:</span>
                    <div className="popTagList">
                      {POPULAR_SEARCH_TAGS.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          className="searchPopPill"
                          onClick={() => {
                            onQuery(tag);
                            handleSelectCategoryAndScroll(tag);
                            setSearchFocused(false);
                          }}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : searchMatches.length === 0 ? (
                  <div className="searchNoResults">
                    <p>No matching pieces found for "<b>{query}</b>"</p>
                    <small>Try searching for "hoodie", "cargos", or "chains"</small>
                  </div>
                ) : (
                  <div className="searchMatchesSection">
                    <div className="searchMatchHeader">
                      <span>Matching Pieces ({searchMatches.length})</span>
                      <small>Press Enter to view all</small>
                    </div>
                    <div className="searchMatchList">
                      {searchMatches.map((item) => (
                        <div
                          key={item.id}
                          className="searchMatchItem"
                          role="option"
                          tabIndex={0}
                          onClick={() => handleSelectProductItem(item)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSelectProductItem(item)}
                        >
                          <img
                            src={item.image}
                            alt={item.name}
                            className="searchThumb"
                            loading="lazy"
                          />
                          <div className="searchMatchDetails">
                            <strong className="matchName">{item.name}</strong>
                            <div className="matchSub">
                              <span className="matchCategory">{item.category}</span>
                              <span className="matchDot">·</span>
                              <span className="matchPrice">{formatINR(item.price)}</span>
                              {item.tag && <span className="matchTag">{item.tag}</span>}
                            </div>
                          </div>
                          <ArrowRight size={14} className="matchArrow" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right: Customer Action Icons */}
          <div className="headerActionsRow">
            {/* Mobile Search Toggle Icon */}
            <button
              className="actionIconBtn mobileOnly"
              onClick={() => setMobileSearchVisible((prev) => !prev)}
              aria-label="Toggle search input"
              title="Search"
            >
              <Search size={20} />
            </button>

            {/* Customer Support Icon */}
            <button
              className="actionIconBtn desktopOnly"
              onClick={() => onOpenHelpCenter && onOpenHelpCenter('faq')}
              aria-label="Help Center & Customer Support"
              title="Customer Support & FAQs"
            >
              <HelpCircle size={20} />
            </button>

            {/* Order Tracking Icon */}
            <button
              className="actionIconBtn desktopOnly"
              onClick={() => onOpenTracking && onOpenTracking()}
              aria-label="Track Order Shipment"
              title="Track My Order"
            >
              <Package size={20} />
            </button>

            {/* Marketing Notifications Drawer Bell */}
            <button
              className="actionIconBtn notifActionBtn"
              onClick={onOpenNotifications}
              aria-label="View announcements and promotional coupons"
              title="Promotional Alerts & Deals"
            >
              <Bell size={20} />
              <span className="notifPulseDot" aria-hidden="true" />
            </button>

            {/* Saved Wishlist Icon */}
            <button
              className={`actionIconBtn wishlistActionBtn ${showWishlist ? 'activeWishlist' : ''}`}
              onClick={onToggleWishlist}
              aria-label={`Wishlist, ${likedCount} saved pieces`}
              aria-pressed={showWishlist}
              title={showWishlist ? 'View all products' : `Saved Wishlist (${likedCount})`}
            >
              <Heart size={20} fill={showWishlist ? 'currentColor' : 'none'} />
              {likedCount > 0 && <span className="iconBadge wishlistBadge">{likedCount}</span>}
            </button>

            {/* Shopping Bag / Cart Icon */}
            <button
              id="header-cart-btn"
              className={`actionIconBtn bagActionBtn ${cartBouncing ? 'cartPopAnim' : ''}`}
              onClick={onOpenCart}
              aria-label={`Shopping bag, ${cartCount} items`}
              title="Open Shopping Bag"
            >
              <ShoppingBag size={20} />
              <span className={`iconBadge cartBadge ${cartBouncing ? 'badgeBounceAnim' : ''}`}>
                {cartCount}
              </span>
            </button>

            {/* User Account / Profile */}
            <div className="userAccountWrap">
              <button
                className="userAccountBtn"
                onClick={onOpenUserPanel}
                aria-label={`User account for ${user.name}`}
                title={`Logged in as ${user.name}`}
              >
                <span className="userAvatarCircle">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </span>
                <span className="userFirstName desktopOnly">
                  {user.name ? user.name.split(' ')[0] : 'Account'}
                </span>
                {user?.isGuest ? (
                  <span
                    className="guestSignInPill desktopOnly"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onLogout) onLogout();
                    }}
                    style={{
                      fontSize: '11px',
                      background: 'var(--accent)',
                      color: '#111',
                      padding: '3px 8px',
                      borderRadius: '3px',
                      fontWeight: 700,
                      marginLeft: 4,
                    }}
                  >
                    Sign In
                  </span>
                ) : user?.role === 'admin' ? (
                  <span className="adminRolePill desktopOnly" title="Administrator">
                    <Shield size={11} />
                    <span>OWNER</span>
                  </span>
                ) : null}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Full-Width Search Input Row (toggled) */}
        {mobileSearchVisible && (
          <div className="mobileSearchExpandRow" ref={mobileSearchRef}>
            <div className="mobileSearchInputBox">
              <Search size={16} />
              <input
                type="text"
                value={query}
                onChange={(e) => onQuery(e.target.value)}
                placeholder="Search clothing, sneakers, accessories..."
                autoFocus
              />
              {query && (
                <button
                  type="button"
                  onClick={() => onQuery('')}
                  aria-label="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Mobile Auto-Complete List */}
            {query.trim().length >= 1 && searchMatches.length > 0 && (
              <div className="mobileSearchDropdown">
                {searchMatches.map((item) => (
                  <div
                    key={item.id}
                    className="mobileMatchRow"
                    onClick={() => handleSelectProductItem(item)}
                  >
                    <img src={item.image} alt={item.name} />
                    <div>
                      <strong>{item.name}</strong>
                      <small>{item.category} · {formatINR(item.price)}</small>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ================= LEVEL C: MAIN HORIZONTAL CATEGORY NAVIGATION BAR ================= */}
      <nav className="categoryNavBar desktopOnly" aria-label="Main category navigation">
        <div className="navContainer">
          <ul className="navCategoryList">
            {/* Home */}
            <li className="navItem">
              <button
                type="button"
                className={`navCategoryLink ${genderFilter === 'All' && categoryFilter === 'All' && !query && !showWishlist ? 'active' : ''}`}
                onClick={() => {
                  onSelectGender('All');
                  onSelectCategory('All');
                  onQuery('');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                Home
              </button>
            </li>

            {/* New Arrivals */}
            <li className="navItem">
              <a
                href="#new-arrivals"
                className="navCategoryLink highlightCyan"
                onClick={() => {
                  onSelectGender('All');
                  onSelectCategory('All');
                }}
              >
                <Sparkles size={13} className="navIcon" />
                <span>New Arrivals</span>
                <span className="navPillBadge new">NEW</span>
              </a>
            </li>

            {/* Men */}
            <li className="navItem">
              <button
                type="button"
                className={`navCategoryLink ${genderFilter === 'Men' ? 'active' : ''}`}
                onClick={() => handleSelectCategoryAndScroll('All', 'Men')}
              >
                Men
              </button>
            </li>

            {/* Women */}
            <li className="navItem">
              <button
                type="button"
                className={`navCategoryLink ${genderFilter === 'Women' ? 'active' : ''}`}
                onClick={() => handleSelectCategoryAndScroll('All', 'Women')}
              >
                Women
              </button>
            </li>

            {/* Clothing with Interactive Mega Menu */}
            <li
              className={`navItem hasDropdown ${clothingMenuOpen ? 'menuActive' : ''}`}
              onMouseEnter={() => {
                clearTimeout(clothingTimeoutRef.current);
                setClothingMenuOpen(true);
              }}
              onMouseLeave={() => {
                clothingTimeoutRef.current = setTimeout(() => setClothingMenuOpen(false), 200);
              }}
              onFocus={() => setClothingMenuOpen(true)}
              onBlur={() => {
                clothingTimeoutRef.current = setTimeout(() => setClothingMenuOpen(false), 200);
              }}
            >
              <button
                type="button"
                className={`navCategoryLink ${['T-Shirts', 'Shirts', 'Hoodies', 'Jackets', 'Baggy Jeans', 'Cargo Pants'].includes(categoryFilter) ? 'active' : ''}`}
                onClick={() => handleSelectCategoryAndScroll('All')}
                aria-haspopup="true"
                aria-expanded={clothingMenuOpen}
              >
                <span>Clothing</span>
                <ChevronDown size={14} className="dropdownChevron" />
              </button>

              {/* Mega Menu Overlay */}
              {clothingMenuOpen && (
                <div className="megaMenuDropdown clothingMegaMenu" role="menu">
                  <div className="megaMenuGrid">
                    {/* Column 1: Tops & Layers */}
                    <div className="megaCol">
                      <h4 className="megaColTitle">TOPS & LAYERS</h4>
                      <ul className="megaLinks">
                        <li>
                          <button
                            type="button"
                            onClick={() => handleSelectCategoryAndScroll('Hoodies')}
                          >
                            Boxy Heavyweight Hoodies
                          </button>
                        </li>
                        <li>
                          <button
                            type="button"
                            onClick={() => handleSelectCategoryAndScroll('T-Shirts')}
                          >
                            Oversized Acid Wash T-Shirts
                          </button>
                        </li>
                        <li>
                          <button
                            type="button"
                            onClick={() => handleSelectCategoryAndScroll('Shirts')}
                          >
                            Double-Brushed Flannels & Casual Shirts
                          </button>
                        </li>
                        <li>
                          <button
                            type="button"
                            onClick={() => handleSelectCategoryAndScroll('Jackets')}
                          >
                            Technical Utility Jackets & Windbreakers
                          </button>
                        </li>
                      </ul>
                    </div>

                    {/* Column 2: Bottoms & Denim */}
                    <div className="megaCol">
                      <h4 className="megaColTitle">BOTTOMS & DENIM</h4>
                      <ul className="megaLinks">
                        <li>
                          <button
                            type="button"
                            onClick={() => handleSelectCategoryAndScroll('Baggy Jeans')}
                          >
                            Architectural Baggy Skater Jeans
                          </button>
                        </li>
                        <li>
                          <button
                            type="button"
                            onClick={() => handleSelectCategoryAndScroll('Cargo Pants')}
                          >
                            Parachute Multi-Pocket Cargo Pants
                          </button>
                        </li>
                        <li>
                          <button
                            type="button"
                            onClick={() => handleSelectCategoryAndScroll('All')}
                          >
                            Relaxed Heavyweight Sweatpants
                          </button>
                        </li>
                      </ul>
                    </div>

                    {/* Column 3: Featured Atelier Card */}
                    <div className="megaCol megaFeatureCol">
                      <div className="megaFeatureCard">
                        <span className="featureCardEyebrow">240+ GSM STREETWEAR</span>
                        <h5>Drop 02 Silhouettes</h5>
                        <p>Durable cotton textiles tailored for authentic Gen-Z slouch aesthetics.</p>
                        <button
                          type="button"
                          className="megaFeatureBtn"
                          onClick={() => handleSelectCategoryAndScroll('All')}
                        >
                          View Entire Catalogue →
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </li>

            {/* Accessories with Mega Menu */}
            <li
              className={`navItem hasDropdown ${accessoriesMenuOpen ? 'menuActive' : ''}`}
              onMouseEnter={() => {
                clearTimeout(accessoriesTimeoutRef.current);
                setAccessoriesMenuOpen(true);
              }}
              onMouseLeave={() => {
                accessoriesTimeoutRef.current = setTimeout(() => setAccessoriesMenuOpen(false), 200);
              }}
              onFocus={() => setAccessoriesMenuOpen(true)}
              onBlur={() => {
                accessoriesTimeoutRef.current = setTimeout(() => setAccessoriesMenuOpen(false), 200);
              }}
            >
              <button
                type="button"
                className={`navCategoryLink ${['Caps', 'Earrings', 'Necklaces', 'Chains', 'Bracelets'].includes(categoryFilter) ? 'active' : ''}`}
                onClick={() => handleSelectCategoryAndScroll('Chains')}
                aria-haspopup="true"
                aria-expanded={accessoriesMenuOpen}
              >
                <span>Accessories</span>
                <ChevronDown size={14} className="dropdownChevron" />
              </button>

              {/* Accessories Dropdown */}
              {accessoriesMenuOpen && (
                <div className="megaMenuDropdown accessoriesDropdown" role="menu">
                  <div className="megaMenuGrid accessoriesGrid">
                    <div className="megaCol">
                      <h4 className="megaColTitle">JEWELRY & HARDWARE</h4>
                      <ul className="megaLinks">
                        <li>
                          <button type="button" onClick={() => handleSelectCategoryAndScroll('Chains')}>
                            Solid Cuban Chains & Links
                          </button>
                        </li>
                        <li>
                          <button type="button" onClick={() => handleSelectCategoryAndScroll('Necklaces')}>
                            Industrial Pendants & Pearl Necklaces
                          </button>
                        </li>
                        <li>
                          <button type="button" onClick={() => handleSelectCategoryAndScroll('Bracelets')}>
                            Stainless Steel Chunky Bracelets
                          </button>
                        </li>
                        <li>
                          <button type="button" onClick={() => handleSelectCategoryAndScroll('Earrings')}>
                            Hypoallergenic Statement Earrings
                          </button>
                        </li>
                      </ul>
                    </div>

                    <div className="megaCol">
                      <h4 className="megaColTitle">HEADWEAR & EXTRAS</h4>
                      <ul className="megaLinks">
                        <li>
                          <button type="button" onClick={() => handleSelectCategoryAndScroll('Caps')}>
                            Vintage Washed Skater Caps
                          </button>
                        </li>
                        <li>
                          <button type="button" onClick={() => handleSelectCategoryAndScroll('Complete Outfits')}>
                            Curated Complete Outfit Bundles
                          </button>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </li>

            {/* Trending */}
            <li className="navItem">
              <a href="#trending" className="navCategoryLink">
                <Flame size={13} className="navIcon flameIcon" />
                <span>Trending</span>
              </a>
            </li>

            {/* Best Sellers */}
            <li className="navItem">
              <a
                href="#trending"
                className="navCategoryLink"
                onClick={() => handleSelectCategoryAndScroll('All')}
              >
                <Star size={13} className="navIcon goldStarIcon" />
                <span>Best Sellers</span>
              </a>
            </li>

            {/* Sale / Offers */}
            <li className="navItem">
              <button
                type="button"
                className="navCategoryLink saleHighlightLink"
                onClick={() => onOpenNotifications && onOpenNotifications()}
              >
                <span>Sale & Offers</span>
                <span className="navPillBadge sale">20% OFF</span>
              </button>
            </li>

            {/* Bespoke / Custom Request */}
            <li className="navItem navItemRight">
              <button
                type="button"
                className="navCategoryLink bespokeNavLink"
                onClick={onOpenCustomRequest}
                title="Request tailor-made bespoke clothing"
              >
                <Scissors size={14} className="navIcon" />
                <span>Bespoke Atelier</span>
              </button>
            </li>
          </ul>
        </div>
      </nav>

      {/* ================= LEVEL D: QUICK ACCESS & SERVICE UTILITY STRIP ================= */}
      <div className="quickUtilityStrip desktopOnly" role="navigation" aria-label="Quick store services">
        <div className="utilityContainer">
          <div className="utilityPills">
            <button
              type="button"
              className="utilityPillBtn"
              onClick={() => onOpenTracking && onOpenTracking()}
            >
              <Truck size={13} />
              <span>Track My Order</span>
            </button>
            <span className="utilityDot">·</span>
            <button
              type="button"
              className="utilityPillBtn"
              onClick={() => onOpenHelpCenter && onOpenHelpCenter('returns')}
            >
              <RotateCcw size={13} />
              <span>7-Day Return / Exchange</span>
            </button>
            <span className="utilityDot">·</span>
            <button
              type="button"
              className="utilityPillBtn"
              onClick={() => onOpenHelpCenter && onOpenHelpCenter('sizing')}
            >
              <Shield size={13} />
              <span>Streetwear Sizing Guide</span>
            </button>
            <span className="utilityDot">·</span>
            <button
              type="button"
              className="utilityPillBtn"
              onClick={() => onOpenHelpCenter && onOpenHelpCenter('contact')}
            >
              <HelpCircle size={13} />
              <span>Customer Support</span>
            </button>
            <span className="utilityDot">·</span>
            <button
              type="button"
              className="utilityPillBtn highlightDeal"
              onClick={() => onOpenNotifications && onOpenNotifications()}
            >
              <Sparkles size={13} />
              <span>Coupon Code: STREET20</span>
            </button>
          </div>
        </div>
      </div>

      {/* ================= MOBILE NAVIGATION SLIDE-OUT DRAWER ================= */}
      {mobileOpen && (
        <div className="mobileDrawerOverlay" onClick={closeMenu} role="dialog" aria-modal="true">
          <div className="mobileDrawerContent" onClick={(e) => e.stopPropagation()}>
            {/* Drawer Top User Card */}
            <div className="mobileUserHeader">
              <div className="mobileUserAvatar">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="mobileUserDetails">
                <strong>{user.name}</strong>
                <small>{user.email}</small>
              </div>
              <button
                type="button"
                className="mobileDrawerCloseBtn"
                onClick={closeMenu}
                aria-label="Close navigation menu"
              >
                <X size={20} />
              </button>
            </div>

            {/* Quick Action Grid inside Mobile Drawer */}
            <div className="mobileQuickActionsGrid">
              <button
                type="button"
                className="mobileActionCard"
                onClick={() => { closeMenu(); onOpenTracking && onOpenTracking(); }}
              >
                <Package size={18} />
                <span>Track Order</span>
              </button>
              <button
                type="button"
                className="mobileActionCard"
                onClick={() => { closeMenu(); onOpenCustomRequest && onOpenCustomRequest(); }}
              >
                <Scissors size={18} />
                <span>Bespoke 1-of-1</span>
              </button>
              <button
                type="button"
                className="mobileActionCard"
                onClick={() => { closeMenu(); onOpenHelpCenter && onOpenHelpCenter('faq'); }}
              >
                <HelpCircle size={18} />
                <span>Help Center</span>
              </button>
              <button
                type="button"
                className="mobileActionCard"
                onClick={() => { closeMenu(); onToggleWishlist && onToggleWishlist(); }}
              >
                <Heart size={18} />
                <span>Wishlist ({likedCount})</span>
              </button>
            </div>

            {/* Mobile Categories Accordion Navigation */}
            <div className="mobileCategoryList">
              <div className="mobileNavGroupTitle">EXPLORE STORE</div>

              <button
                type="button"
                className="mobileNavItem"
                onClick={() => { closeMenu(); onSelectGender('All'); onSelectCategory('All'); }}
              >
                <span>All Drops & Pieces</span>
                <ArrowRight size={14} />
              </button>

              <button
                type="button"
                className="mobileNavItem"
                onClick={() => { closeMenu(); onSelectGender('Men'); onSelectCategory('All'); }}
              >
                <span>Men's Streetwear</span>
                <ArrowRight size={14} />
              </button>

              <button
                type="button"
                className="mobileNavItem"
                onClick={() => { closeMenu(); onSelectGender('Women'); onSelectCategory('All'); }}
              >
                <span>Women's Collection</span>
                <ArrowRight size={14} />
              </button>

              {/* Collapsible Clothing Subcategories */}
              <div className="mobileAccordionSection">
                <button
                  type="button"
                  className="mobileNavItem accordionHeader"
                  onClick={() => setMobileClothingOpen((prev) => !prev)}
                >
                  <span>Clothing Categories</span>
                  <ChevronDown size={16} className={`accordionChevron ${mobileClothingOpen ? 'expanded' : ''}`} />
                </button>
                {mobileClothingOpen && (
                  <div className="mobileSubmenu">
                    <button type="button" onClick={() => handleSelectCategoryAndScroll('Hoodies')}>
                      Boxy Hoodies
                    </button>
                    <button type="button" onClick={() => handleSelectCategoryAndScroll('T-Shirts')}>
                      Oversized Graphic Tees
                    </button>
                    <button type="button" onClick={() => handleSelectCategoryAndScroll('Shirts')}>
                      Flannels & Casual Shirts
                    </button>
                    <button type="button" onClick={() => handleSelectCategoryAndScroll('Jackets')}>
                      Utility Jackets & Outerwear
                    </button>
                    <button type="button" onClick={() => handleSelectCategoryAndScroll('Baggy Jeans')}>
                      Baggy Denim & Jeans
                    </button>
                    <button type="button" onClick={() => handleSelectCategoryAndScroll('Cargo Pants')}>
                      Parachute Cargo Pants
                    </button>
                  </div>
                )}
              </div>

              {/* Collapsible Accessories Subcategories */}
              <div className="mobileAccordionSection">
                <button
                  type="button"
                  className="mobileNavItem accordionHeader"
                  onClick={() => setMobileAccessoriesOpen((prev) => !prev)}
                >
                  <span>Accessories & Hardware</span>
                  <ChevronDown size={16} className={`accordionChevron ${mobileAccessoriesOpen ? 'expanded' : ''}`} />
                </button>
                {mobileAccessoriesOpen && (
                  <div className="mobileSubmenu">
                    <button type="button" onClick={() => handleSelectCategoryAndScroll('Chains')}>
                      Solid Chains & Links
                    </button>
                    <button type="button" onClick={() => handleSelectCategoryAndScroll('Necklaces')}>
                      Pendants & Necklaces
                    </button>
                    <button type="button" onClick={() => handleSelectCategoryAndScroll('Caps')}>
                      Vintage Skater Caps
                    </button>
                    <button type="button" onClick={() => handleSelectCategoryAndScroll('Bracelets')}>
                      Chunky Link Bracelets
                    </button>
                    <button type="button" onClick={() => handleSelectCategoryAndScroll('Earrings')}>
                      Statement Earrings
                    </button>
                  </div>
                )}
              </div>

              <a
                href="#trending"
                className="mobileNavItem"
                onClick={closeMenu}
              >
                <span>🔥 Trending Pieces</span>
                <ArrowRight size={14} />
              </a>

              <a
                href="#new-arrivals"
                className="mobileNavItem"
                onClick={closeMenu}
              >
                <span>✨ New Arrivals</span>
                <ArrowRight size={14} />
              </a>

              <button
                type="button"
                className="mobileNavItem highlightPromoItem"
                onClick={() => { closeMenu(); onOpenNotifications && onOpenNotifications(); }}
              >
                <span>🎁 Special Deals & Coupons (STREET20)</span>
                <ArrowRight size={14} />
              </button>
            </div>

            {/* Mobile Footer & Logout */}
            <div className="mobileDrawerFooter">
              <button
                type="button"
                className="mobileProfileLinkBtn"
                onClick={() => { closeMenu(); onOpenUserPanel && onOpenUserPanel(); }}
              >
                <User size={16} />
                <span>My Account & Past Orders</span>
              </button>

              {isAdminPreview && (
                <button
                  type="button"
                  className="mobileAdminReturnBtn"
                  onClick={() => { closeMenu(); onReturnToAdminDashboard && onReturnToAdminDashboard(); }}
                >
                  <Shield size={16} />
                  <span>Return to Owner Dashboard</span>
                </button>
              )}

              <button
                type="button"
                className="mobileLogoutBtn"
                onClick={() => { closeMenu(); onLogout && onLogout(); }}
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
