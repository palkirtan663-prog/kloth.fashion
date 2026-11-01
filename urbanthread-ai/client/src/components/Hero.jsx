import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  Sparkles,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  Rotate3d,
  ShieldCheck,
  Layers,
} from 'lucide-react';
import { api } from '../services/api.js';
import Img from './Img.jsx';
import Tilt from './Tilt.jsx';

const DEFAULT_SLIDES = [
  {
    id: 's1',
    title: 'Engineered to move.\nBuilt to repeat.',
    subtitle: 'Drop 02 Metropolis Archive: 450 GSM French Terry Hoodies, Textured Waffle Tees & Curved Barrel Jeans.',
    badge: 'NEW DROP 02 LIVE',
    image: '/images/hero.jpg',
    fallbackImage: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=80',
    ctaText: 'Explore Trending Drops',
    ctaLink: '#trending',
    secondaryCtaText: 'New Arrivals (50+ Pieces)',
    secondaryCtaLink: '#new-arrivals',
    tagline: 'INDIA / 2026 ARCHIVE',
  },
  {
    id: 's2',
    title: 'Winter Streetwear &\nGrunge Flannels.',
    subtitle: 'Ultra-heavy double-brushed cotton flannel overshirts cut with slouchy drop shoulders and skater drape.',
    badge: 'TRENDING COLLECTION',
    image: '/images/field-overshirt.jpg',
    fallbackImage: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80',
    ctaText: 'Shop Flannels & Shirts',
    ctaLink: '#shop',
    secondaryCtaText: 'View Street Pants',
    secondaryCtaLink: '#shop',
    tagline: 'VINTAGE DISTRESSED EDIT',
  },
  {
    id: 's3',
    title: 'Bespoke Artisan\nJewelry & Hardware.',
    subtitle: 'Solid Cuban Links, Baroque Freshwater Pearls & Industrial Chrome Chains to elevate any minimalist fit.',
    badge: 'ACCESSORIES EXCLUSIVE',
    image: '/images/jewelry-hero.jpg',
    fallbackImage: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1200&q=80',
    ctaText: 'Explore Jewelry Drop',
    ctaLink: '#shop',
    secondaryCtaText: 'Custom Clothing Request',
    secondaryCtaLink: '#custom',
    tagline: 'HANDCRAFTED FINISH',
  },
  {
    id: 's4',
    title: 'Custom Clothing &\nBespoke Atelier.',
    subtitle: 'Have a design reference? Master streetwear tailors craft your 1-of-1 silhouette to exact millimeter measurements.',
    badge: '1-OF-1 BESPOKE',
    image: '/images/afterhours-overshirt.jpg',
    fallbackImage: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1200&q=80',
    ctaText: 'Custom Fit Request',
    ctaLink: '#custom',
    secondaryCtaText: 'Explore Archive',
    secondaryCtaLink: '#shop',
    tagline: 'PRIVATE ATELIER',
  },
];

export default function Hero({ onOpenCustomRequest }) {
  const [slides, setSlides] = useState(DEFAULT_SLIDES);
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    // Try to load any admin-configured banners
    api('/marketing/banners')
      .then((res) => {
        if (Array.isArray(res.banners) && res.banners.length > 0) {
          const mapped = res.banners.map((b) => ({
            id: b.id,
            title: b.title.replace('\\n', '\n'),
            subtitle: b.subtitle,
            badge: b.badge || 'SPECIAL DROP',
            image: b.image.includes('1599643478518') ? '/images/jewelry-hero.jpg' : b.image,
            fallbackImage: b.image.includes('1599643478518') || b.badge?.includes('ACCESSORIES')
              ? '/images/jewelry-hero.jpg'
              : '/images/hero.jpg',
            ctaText: b.ctaText || 'Shop Now',
            ctaLink: b.ctaLink || '#shop',
            secondaryCtaText: 'Explore Collection',
            secondaryCtaLink: '#new-arrivals',
            tagline: 'KLOTH.FASHION EDIT',
          }));

          setSlides(mapped);
        }
      })
      .catch(() => {});
  }, []);

  // Auto-advance slider every 6 seconds unless paused
  useEffect(() => {
    if (paused || slides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [paused, slides.length]);

  const slide = slides[current] || slides[0];

  return (
    <section
      className="hero sliderHero"
      id="hero"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="heroContainer">
        <div className="heroCopy">
        <div className="heroEyebrowRow">
          <span className="eyebrowBadge"><Sparkles size={13} /> {slide.badge}</span>
          <span className="heroSeason">{slide.tagline}</span>
        </div>

        <h1 style={{ whiteSpace: 'pre-line' }}>
          {slide.title}
        </h1>

        <p className="heroText">
          {slide.subtitle}
        </p>

        <div className="heroCtaGroup">
          <a className="primary heroPrimaryBtn" href={slide.ctaLink}>
            <ShoppingBag size={16} /> {slide.ctaText}
          </a>
          {slide.secondaryCtaLink === '#custom' ? (
            <button
              type="button"
              className="secondary heroSecondaryBtn"
              onClick={onOpenCustomRequest}
            >
              {slide.secondaryCtaText} <ArrowRight size={15} />
            </button>
          ) : (
            <a className="secondary heroSecondaryBtn" href={slide.secondaryCtaLink}>
              {slide.secondaryCtaText} <ArrowRight size={15} />
            </a>
          )}
        </div>

        {/* Slider Navigation Dots */}
        {slides.length > 1 && (
          <div className="sliderControls">
            <button
              type="button"
              className="sliderNavArrow"
              onClick={() => setCurrent((c) => (c - 1 + slides.length) % slides.length)}
              aria-label="Previous slide"
            >
              <ChevronLeft size={16} />
            </button>

            <div className="sliderDots">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`sliderDot ${idx === current ? 'activeDot' : ''}`}
                  onClick={() => setCurrent(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>

            <button
              type="button"
              className="sliderNavArrow"
              onClick={() => setCurrent((c) => (c + 1) % slides.length)}
              aria-label="Next slide"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}

        <div className="heroStatsBar">
          <div className="heroStat">
            <b>50+</b>
            <span>Curated Drops</span>
          </div>
          <div className="heroStatDivider" />
          <div className="heroStat">
            <b>₹1,499+</b>
            <span>Free Express Ship</span>
          </div>
          <div className="heroStatDivider" />
          <div className="heroStat">
            <b>4.9★</b>
            <span>Community Verified</span>
          </div>
        </div>
      </div>

      {/* Interactive 3D Rotation Showcase & Exhibition Stage */}
      <div className="hero3DStage">
        {/* Ambient atmospheric lighting aura behind the card */}
        <div className="heroStageAura" />

        {/* Blueprint Framing Corner Crosshairs */}
        <div className="stageCrosshair stageCrossTopLeft">+</div>
        <div className="stageCrosshair stageCrossTopRight">+</div>
        <div className="stageCrosshair stageCrossBottomLeft">+</div>
        <div className="stageCrosshair stageCrossBottomRight">+</div>

        {/* Floating Spec Tag 1: Top-Left Luxury Material Specs */}
        <div className="floatingSpecCard specCardTop">
          <div className="specCardIcon">
            <Sparkles size={14} />
          </div>
          <div className="specCardText">
            <span className="specCardLabel">CRAFT SPECIFICATION</span>
            <strong>Heavyweight 240+ GSM & Solid 925 Silver</strong>
            <small>Handcrafted in Mumbai Studio</small>
          </div>
        </div>

        {/* Centerpiece 3D Card Stage */}
        <div className="heroCardWrapper">
          <Tilt className="heroCard" autoRotate={true} maxTilt={24} perspective={1100}>
            <div className="hero3DCardInner">
              <Img
                key={slide.image}
                src={slide.image}
                fallbackSrc={slide.fallbackImage || '/images/jewelry-hero.jpg'}
                alt={slide.title}
                label="KLOTH.FASHION"
                sublabel={slide.badge}
                eager
                width={900}
                height={1100}
              />
              {/* Dynamic specular light reflection sheen */}
              <div className="hero3DSheen" />

              {/* 3D Floating Tag Badges with multi-layer depth */}
              <div className="heroFloatingBadge">
                <span>{slide.badge}</span>
                <strong>GEN-Z STREETWEAR ARCHIVE</strong>
              </div>

              {/* 3D Rotation Interactive Pill */}
              <div className="hero3DControlPill" title="Click to spin 360°">
                <Rotate3d size={13} className="spinIcon3D" />
                <span>3D ROTATION · CLICK TO SPIN</span>
              </div>
            </div>
          </Tilt>
          {/* Ambient 3D ground shadow */}
          <div className="hero3DShadow" />
        </div>

        {/* Floating Spec Tag 2: Bottom-Left Drop Provenance */}
        <div className="floatingSpecCard specCardBottom">
          <div className="specCardIcon highlightIcon">
            <ShieldCheck size={14} />
          </div>
          <div className="specCardText">
            <span className="specCardLabel">DROP PROVENANCE</span>
            <strong>1-of-1 Atelier Cut · Limited Run</strong>
            <small>7-Day Doorstep Returns & Exchanges</small>
          </div>
        </div>

        {/* Companion Drop Preview Rail (Fills the right side of the 3D card) */}
        <div className="heroSideDropRail">
          <div className="sideRailTitle">
            <Layers size={12} />
            <span>DROP COMPANIONS</span>
          </div>
          <div className="sideRailCards">
            <a href="#trending" className="sideRailItem">
              <img src="/images/noir-oversized-tee.jpg" alt="Noir Boxy Tee" />
              <div className="sideRailInfo">
                <b>Noir Box Tee</b>
                <span className="sideRailGsm">280 GSM Waffle</span>
                <strong>₹999</strong>
              </div>
            </a>
            <a href="#new-arrivals" className="sideRailItem">
              <img src="/images/signal-hoodie.jpg" alt="Signal Hoodie" />
              <div className="sideRailInfo">
                <b>Signal Heavy Hoodie</b>
                <span className="sideRailGsm">450 GSM French Terry</span>
                <strong>₹2,499</strong>
              </div>
            </a>
            <a href="#shop" className="sideRailItem">
              <img src="/images/studio-cargo.jpg" alt="Studio Cargos" />
              <div className="sideRailInfo">
                <b>Wide Barrel Cargo</b>
                <span className="sideRailGsm">Curved Skater Denim</span>
                <strong>₹1,899</strong>
              </div>
            </a>
          </div>
        </div>
      </div>
      </div>
    </section>
  );
}
