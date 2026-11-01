import React from 'react';
import { Home, Layers, Heart, ShoppingBag, User } from 'lucide-react';

export default function MobileBottomNav({
  onHome,
  onOpenCategories,
  onToggleWishlist,
  showWishlist,
  likedCount = 0,
  onOpenCart,
  cartCount = 0,
  cartBouncing = false,
  onOpenAccount,
  user,
}) {
  return (
    <nav className="mobileBottomNav" aria-label="Mobile Bottom Navigation">
      <div className="mobileBottomNavContainer">
        {/* 1. Home */}
        <button
          type="button"
          className={`mobileNavBtn ${!showWishlist ? 'active' : ''}`}
          onClick={onHome}
          aria-label="Home"
        >
          <Home size={20} />
          <span className="mobileNavLabel">Home</span>
        </button>

        {/* 2. Explore / Categories */}
        <button
          type="button"
          className="mobileNavBtn"
          onClick={onOpenCategories}
          aria-label="Explore Categories"
        >
          <Layers size={20} />
          <span className="mobileNavLabel">Categories</span>
        </button>

        {/* 3. Wishlist */}
        <button
          type="button"
          className={`mobileNavBtn ${showWishlist ? 'active' : ''}`}
          onClick={onToggleWishlist}
          aria-label={`Wishlist (${likedCount})`}
        >
          <div className="mobileNavIconWrap">
            <Heart size={20} fill={showWishlist ? 'currentColor' : 'none'} />
            {likedCount > 0 && <span className="mobileNavBadge">{likedCount}</span>}
          </div>
          <span className="mobileNavLabel">Wishlist</span>
        </button>

        {/* 4. Bag / Cart */}
        <button
          type="button"
          className={`mobileNavBtn ${cartBouncing ? 'cartPopAnim' : ''}`}
          onClick={onOpenCart}
          aria-label={`Shopping Bag (${cartCount})`}
        >
          <div className="mobileNavIconWrap">
            <ShoppingBag size={20} />
            <span className={`mobileNavBadge ${cartBouncing ? 'badgeBounceAnim' : ''}`}>
              {cartCount}
            </span>
          </div>
          <span className="mobileNavLabel">Bag</span>
        </button>

        {/* 5. You / Account */}
        <button
          type="button"
          className="mobileNavBtn"
          onClick={onOpenAccount}
          aria-label="My Account"
        >
          <div className="mobileNavUserAvatar">
            {user?.name ? user.name.charAt(0).toUpperCase() : <User size={16} />}
          </div>
          <span className="mobileNavLabel">
            {user?.isGuest ? 'Sign In' : (user?.name ? user.name.split(' ')[0] : 'You')}
          </span>
        </button>
      </div>
    </nav>
  );
}

