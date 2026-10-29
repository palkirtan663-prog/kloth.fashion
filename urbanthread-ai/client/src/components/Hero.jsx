import React, { useState, useEffect } from 'react';
import { ArrowRight, Sparkles, TrendingUp, ChevronLeft, ChevronRight, ShoppingBag } from 'lucide-react';
import { api } from '../services/api.js';
import Img from './Img.jsx';
import Tilt from './Tilt.jsx';

const DEFAULT_SLIDES = [
  {
    id: 's1',
    title: 'Engineered to move.\nBuilt to repeat.',
    subtitle: 'Drop 02 Metropolis Archive: 450 GSM French Terry Hoodies, Textured Waffle Tees & Curved Barrel Jeans.',
    badge: 'NEW DROP 02 LIVE',
    image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=80',
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
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80',
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
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1200&q=80',
    ctaText: 'Explore Jewelry Drop',
    ctaLink: '#shop',
    secondaryCtaText: 'Custom Clothing Request',
    secondaryCtaLink: '#custom',
    tagline: 'HANDCRAFTED FINISH',
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
            image: b.image,
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

      <Tilt className="heroCard">
        <Img
          key={slide.image}
          src={slide.image}
          alt={slide.title}
          label="KLOTH.FASHION"
          sublabel={slide.badge}

          eager
          width={900}
          height={1100}
        />
        <div className="heroFloatingBadge">
          <span>{slide.badge}</span>
          <strong>GEN-Z STREETWEAR ARCHIVE</strong>
        </div>
      </Tilt>
    </section>
  );
}
