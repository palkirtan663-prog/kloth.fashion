/*
  seedProducts.js - 2026 Gen-Z Trendy Streetwear Catalogue (Prices in INR)
  Featuring:
    - Waffle Knit Boxy T-Shirts & Thermal Tees
    - Oversized Boxy Shirts & Flannel Overshirts
    - Retro Abstract Printed Camp / Resort Shirts
    - Architectural Barrel-Leg Curved Jeans
    - 90s Ultra-Wide Baggy Skater Jeans
    - Relaxed Mom-Fit Pleated Chinos & Tailored Street Trousers
    - Gorpcore Balloon Parachute Pants & Tactical Cargos
    - 450 GSM Cropped Boxy Hoodies & Two-Way Zip Fleece
    - Streetwear Moto Jackets, Denim Truckers & Boxy Puffers
    - Vintage Enzyme Dad Caps, Y2K Truckers & Beanies
    - Chrome Star Chains, Baroque Pearls, Silver Huggies & Cuban Links
    - Complete Curated Streetwear Outfits & Co-Ords
*/
const Product = require('../models/Product');

const PRODUCTS = [
  // ==========================================
  // 1. T-SHIRTS & WAFFLE TEES (Gen-Z 2026)
  // ==========================================
  {
    name: 'Heavyweight Waffle Knit Boxy T-Shirt',
    price: 1199,
    category: 'T-Shirts',
    tag: 'BESTSELLER',
    rating: 4.9,
    color: 'Oatmeal Cream',
    image: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=800&q=80',
    description: 'Textured 280 GSM heavy waffle-knit cotton t-shirt with dropped shoulders, raw ribbed collar, and a signature boxy drape.'
  },
  {
    name: 'Washed Thermal Waffle Oversized Tee',
    price: 1249,
    category: 'T-Shirts',
    tag: 'TRENDING',
    rating: 4.8,
    color: 'Faded Slate Grey',
    image: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=800&q=80',
    description: 'Enzyme-washed waffle-textured streetwear tee featuring wide elbow-length sleeves and double-stitched reinforced hems.'
  },
  {
    name: 'Cyber Y2K Oversized Graphic Tee',
    price: 1099,
    category: 'T-Shirts',
    tag: 'NEW',
    rating: 4.8,
    color: 'Acid Washed Black',
    image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=800&q=80',
    description: 'Heavy 260 GSM organic cotton skate tee with chrome Y2K tribal back typography and vintage mineral acid wash.'
  },
  {
    name: 'Boxy Heavyweight Clean Essential Tee',
    price: 949,
    category: 'T-Shirts',
    tag: 'RESTOCK',
    rating: 4.7,
    color: 'Bone White',
    image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80',
    description: 'Thick 3.5cm ribbed collar with a clean oversized square drape in premium pre-shrunk combed cotton jersey.'
  },
  {
    name: 'Sun-Bleached Distress Skater Tee',
    price: 1049,
    category: 'T-Shirts',
    tag: 'DROP 02',
    rating: 4.7,
    color: 'Vintage Forest Olive',
    image: 'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?auto=format&fit=crop&w=800&q=80',
    description: 'Vintage-faded skate t-shirt with subtle neck distressing, relaxed wide torso, and dropped drop-shoulder seam lines.'
  },
  {
    name: 'Noir Heavy Boxy Streetwear Tee',
    price: 999,
    category: 'T-Shirts',
    tag: 'TRENDING',
    rating: 4.9,
    color: 'Pitch Black',
    image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80',
    description: 'Minimalist heavyweight streetwear tee tailored specifically for effortless stacking with baggy denim and gorpcore cargos.'
  },

  // ==========================================
  // 2. OVERSIZED BOXY SHIRTS, FLANNELS & PRINTED SHIRTS
  // ==========================================
  {
    name: '90s Grunge Heavy Brushed Flannel Shirt',
    price: 1899,
    category: 'Shirts',
    tag: 'BESTSELLER',
    rating: 4.9,
    color: 'Shadow Crimson & Black',
    image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=800&q=80',
    description: 'Ultra-heavy double-brushed cotton flannel overshirt cut with slouchy dropped shoulders and twin flap chest pockets.'
  },
  {
    name: 'Retro Y2K Abstract Printed Camp Shirt',
    price: 1699,
    category: 'Shirts',
    tag: 'TRENDING',
    rating: 4.8,
    color: 'Monochrome Cyber Print',
    image: 'https://images.unsplash.com/photo-1589310243389-96a5483213a8?auto=format&fit=crop&w=800&q=80',
    description: 'Open Cuban camp collar short-sleeve resort shirt with an abstract retro monochrome cyber print and liquid fluid drape.'
  },
  {
    name: 'Oversized Boxy Utility Poplin Shirt',
    price: 1799,
    category: 'Shirts',
    tag: 'NEW',
    rating: 4.7,
    color: 'Chalk Off-White',
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80',
    description: 'Architectural boxy cut button-up shirt in crisp dense poplin with dropped shoulders and clean tonal matte buttons.'
  },
  {
    name: 'Boxy Wide-Wale Corduroy Workshirt',
    price: 2199,
    category: 'Shirts',
    tag: 'DROP 02',
    rating: 4.9,
    color: 'Camel Tan',
    image: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=800&q=80',
    description: 'Thick wide-ribbed cotton corduroy overshirt cut with relaxed drop shoulders, heavy metal snap buttons, and side slit hems.'
  },
  {
    name: 'Vintage Shadow Plaid Oversized Flannel',
    price: 1999,
    category: 'Shirts',
    tag: 'RESTOCK',
    rating: 4.7,
    color: 'Forest Olive & Charcoal',
    image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80',
    description: 'Heavyweight brushed cotton plaid flannel with frayed raw edge hem detailing and generous layering volume.'
  },
  {
    name: 'Slouchy Botanical Printed Resort Shirt',
    price: 1649,
    category: 'Shirts',
    tag: 'LIMITED',
    rating: 4.6,
    color: 'Sage & Ink Black Print',
    image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80',
    description: 'Breathable washed rayon resort shirt with relaxed open spread collar and custom Gen-Z botanical studio artwork.'
  },

  // ==========================================
  // 3. BARREL JEANS & OVERSIZED BAGGY JEANS
  // ==========================================
  {
    name: 'Architectural Barrel-Leg Curved Jeans',
    price: 2599,
    category: 'Baggy Jeans',
    tag: 'TRENDING',
    rating: 4.9,
    color: 'Vintage Medium Wash',
    image: 'https://images.unsplash.com/photo-1560243563-062bfc001d68?auto=format&fit=crop&w=800&q=80',
    description: 'The viral 2026 horseshoe barrel silhouette: dramatic curved outer seams, relaxed balloon knee, and tapered ankle drape.'
  },
  {
    name: '90s Ultra-Wide Baggy Skater Jeans',
    price: 2499,
    category: 'Baggy Jeans',
    tag: 'BESTSELLER',
    rating: 4.9,
    color: 'Bleached Ice Blue',
    image: 'https://images.unsplash.com/photo-1604176354204-9268737828e4?auto=format&fit=crop&w=800&q=80',
    description: 'Extreme wide-leg skater denim with relaxed low rise, generous shoe-pooling hem, and 14oz rigid authentic denim drape.'
  },
  {
    name: 'Distressed Slashed Knee Baggy Jeans',
    price: 2399,
    category: 'Baggy Jeans',
    tag: 'DROP 02',
    rating: 4.8,
    color: 'Stonewashed Blue',
    image: 'https://images.unsplash.com/photo-1582552938357-32b906df40cb?auto=format&fit=crop&w=800&q=80',
    description: 'Artisanal hand-abraded knee rips and raw hems on an effortless wide skateboarder denim cut with vintage whiskering.'
  },
  {
    name: 'Jet Black Slouchy Wide-Leg Denim',
    price: 2299,
    category: 'Baggy Jeans',
    tag: 'NEW',
    rating: 4.8,
    color: 'Pitch Black',
    image: 'https://images.unsplash.com/photo-1555689502-c4b22d76c56f?auto=format&fit=crop&w=800&q=80',
    description: 'Deep fade-resistant sulfur black denim with an exaggerated wide profile and clean tailored high-rise waistband.'
  },
  {
    name: 'Raw Indigo Horseshoe Barrel Jeans',
    price: 2699,
    category: 'Baggy Jeans',
    tag: 'NEW',
    rating: 4.9,
    color: 'Dark Raw Indigo',
    image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=800&q=80',
    description: 'Sculptural curved barrel jeans in unwashed raw indigo denim accented with bold contrast white topstitching.'
  },
  {
    name: 'Carpenter Utility Baggy Jeans',
    price: 2499,
    category: 'Baggy Jeans',
    tag: 'RESTOCK',
    rating: 4.7,
    color: 'Natural Ecru Canvas',
    image: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=800&q=80',
    description: 'Heavy duck canvas baggy jeans equipped with side hammer loops, double-reinforced knees, and multi-compartment tool pockets.'
  },

  // ==========================================
  // 4. MOM FIT PANTS & GORPCORE CARGOS
  // ==========================================
  {
    name: 'Relaxed Mom Fit Pleated Chino Pants',
    price: 2199,
    category: 'Cargo Pants',
    tag: 'TRENDING',
    rating: 4.8,
    color: 'Muted Sand',
    image: 'https://images.unsplash.com/photo-1509551388413-e18d0ac5d495?auto=format&fit=crop&w=800&q=80',
    description: 'High-waisted relaxed mom-fit trousers with twin front pleats, balloon leg drape, and cropped tapered cuffs.'
  },
  {
    name: 'Gorpcore Balloon Parachute Pants',
    price: 2399,
    category: 'Cargo Pants',
    tag: 'BESTSELLER',
    rating: 4.9,
    color: 'Obsidian Black',
    image: 'https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&w=800&q=80',
    description: 'Ultra-lightweight tech nylon balloon parachute pants with bungee toggle cord hems and elastic waist.'
  },
  {
    name: 'Tactical 8-Pocket Modular Cargo',
    price: 2499,
    category: 'Cargo Pants',
    tag: 'DROP 02',
    rating: 4.8,
    color: 'Military Olive',
    image: 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?auto=format&fit=crop&w=800&q=80',
    description: 'Heavyweight cotton twill utility cargos with articulated knee darts and 3D bellow utility pockets.'
  },
  {
    name: 'Slouchy Wide-Leg Tailored Trousers',
    price: 2299,
    category: 'Cargo Pants',
    tag: 'NEW',
    rating: 4.7,
    color: 'Charcoal Heather',
    image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=800&q=80',
    description: 'Effortless slouchy mom-fit tailored trousers blending classic suiting with modern streetwear pooling hems.'
  },
  {
    name: 'High-Rise Relaxed Mom Fit Pants',
    price: 2149,
    category: 'Cargo Pants',
    tag: 'NEW',
    rating: 4.8,
    color: 'Washed Khaki Stone',
    image: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?auto=format&fit=crop&w=800&q=80',
    description: 'Contemporary mom fit pants in washed cotton twill, featuring a cinched high waist and generous tapered leg room.'
  },
  {
    name: 'Ripstop Desert Utility Cargo',
    price: 2199,
    category: 'Cargo Pants',
    tag: 'RESTOCK',
    rating: 4.6,
    color: 'Dune Khaki',
    image: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=800&q=80',
    description: 'Reinforced tear-resistant ripstop cargo pants featuring modular zippered storage and gusseted crotch.'
  },

  // ==========================================
  // 5. HOODIES (Gen-Z 2026 Drops)
  // ==========================================
  {
    name: '450 GSM Heavy Cropped Boxy Hoodie',
    price: 2499,
    category: 'Hoodies',
    tag: 'BESTSELLER',
    rating: 4.9,
    color: 'Slate Grey',
    image: 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=800&q=80',
    description: 'Ultra-dense 450 GSM fleece hoodie with a modern cropped waistline, no-drawstring hood, and slouchy sleeves.'
  },
  {
    name: 'Dual-Zip Washed Obsidian Hoodie',
    price: 2599,
    category: 'Hoodies',
    tag: 'TRENDING',
    rating: 4.8,
    color: 'Vintage Washed Black',
    image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80',
    description: 'Enzyme-washed heavyweight fleece hoodie equipped with a two-way antique silver zip and raw outer seams.'
  },
  {
    name: 'Signal Heavyweight Brushed Hoodie',
    price: 2199,
    category: 'Hoodies',
    tag: 'DROP 02',
    rating: 4.7,
    color: 'Heather Grey',
    image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
    description: 'Brushed fleece interior with an oversized double-lined hood and tonal micro-embroidery at the chest.'
  },
  {
    name: 'Cyberpunk Raw Edge Heavy Hoodie',
    price: 2399,
    category: 'Hoodies',
    tag: 'NEW',
    rating: 4.8,
    color: 'Moss Military Green',
    image: 'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?auto=format&fit=crop&w=800&q=80',
    description: 'Distressed raw-hem cuffs and waistband on an oversized boxy hoodie cut from heavy French terry.'
  },
  {
    name: 'Bone White Clean Uniform Hoodie',
    price: 2299,
    category: 'Hoodies',
    tag: 'RESTOCK',
    rating: 4.6,
    color: 'Bone Chalk',
    image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=800&q=80',
    description: 'Pristine tonal bone white fleece hoodie with seamless side pockets and heavy structured ribbed trim.'
  },
  {
    name: 'Espresso Heavyweight Pullover',
    price: 2399,
    category: 'Hoodies',
    tag: 'LIMITED',
    rating: 4.9,
    color: 'Deep Espresso Brown',
    image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80',
    description: 'Dense dark chocolate French terry hoodie engineered with a wide boxy torso and fitted wrists.'
  },

  // ==========================================
  // 6. JACKETS & OUTERWEAR (Gen-Z 2026 Drops)
  // ==========================================
  {
    name: 'Streetwear Vegan Leather Moto Jacket',
    price: 3599,
    category: 'Jackets',
    tag: 'BESTSELLER',
    rating: 4.9,
    color: 'Matte Black',
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80',
    description: 'Supple grain vegan leather biker jacket with stand snap collar, silver hardware, and satin lining.'
  },
  {
    name: 'Vintage Washed Denim Trucker Jacket',
    price: 2899,
    category: 'Jackets',
    tag: 'TRENDING',
    rating: 4.8,
    color: 'Faded Selvedge Indigo',
    image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=800&q=80',
    description: 'Heavy 14oz rigid denim trucker jacket treated with authentic stone wash and subtle edge distressing.'
  },
  {
    name: 'Mono Contrast Track Bomber Jacket',
    price: 2699,
    category: 'Jackets',
    tag: 'DROP 02',
    rating: 4.7,
    color: 'Graphite & White Piping',
    image: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80',
    description: 'Lightweight weather-resistant track bomber with contrast sports piping and matte metal zippers.'
  },
  {
    name: 'Cropped Boxy Puffer Jacket',
    price: 3399,
    category: 'Jackets',
    tag: 'NEW',
    rating: 4.8,
    color: 'Olive Khaki',
    image: 'https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=800&q=80',
    description: 'Insulated thermal cropped puffer featuring storm cuffs, high stand collar, and adjustable hem bungee.'
  },
  {
    name: 'Technical Ergonomic Shell Windbreaker',
    price: 2799,
    category: 'Jackets',
    tag: 'RESTOCK',
    rating: 4.6,
    color: 'Obsidian Black',
    image: 'https://images.unsplash.com/photo-1544923246-77307dd654cb?auto=format&fit=crop&w=800&q=80',
    description: 'Hydrophobic techwear nylon hooded jacket with taped waterproof zippers and vented underarms.'
  },

  // ==========================================
  // 7. CAPS & HEADWEAR (Gen-Z 2026 Drops)
  // ==========================================
  {
    name: 'Distressed Vintage Enzyme Dad Cap',
    price: 699,
    category: 'Caps',
    tag: 'BESTSELLER',
    rating: 4.8,
    color: 'Washed Charcoal',
    image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=800&q=80',
    description: 'Unstructured 6-panel cotton twill cap with washed fading and an antique brass strap buckle.'
  },
  {
    name: 'Y2K Retro Mesh Trucker Hat',
    price: 749,
    category: 'Caps',
    tag: 'TRENDING',
    rating: 4.7,
    color: 'Forest Green & White',
    image: 'https://images.unsplash.com/photo-1575428652377-a2d80e2277fc?auto=format&fit=crop&w=800&q=80',
    description: 'Breathable foam front trucker hat with high-density embroidery and an adjustable snap closure.'
  },
  {
    name: 'Heavy Rib Fisherman Beanie',
    price: 649,
    category: 'Caps',
    tag: 'DROP 02',
    rating: 4.9,
    color: 'Camel Beige',
    image: 'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?auto=format&fit=crop&w=800&q=80',
    description: 'Shallow fit chunky ribbed knit beanie spun from non-itch ultra-soft merino blend yarn.'
  },
  {
    name: 'Matte Nylon Crinkle Strapback Cap',
    price: 799,
    category: 'Caps',
    tag: 'NEW',
    rating: 4.6,
    color: 'Slate Grey',
    image: 'https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&w=800&q=80',
    description: 'Water-repellent matte crinkle nylon cap with flexible soft brim and quick-release clip strap.'
  },
  {
    name: 'Two-Tone Racing Snapback',
    price: 799,
    category: 'Caps',
    tag: 'LIMITED',
    rating: 4.7,
    color: 'Black & Maroon Visor',
    image: 'https://images.unsplash.com/photo-1534215754734-18e55d13e346?auto=format&fit=crop&w=800&q=80',
    description: 'Structured high crown racing cap with flat visor and contrast underside green fabric.'
  },

  // ==========================================
  // 8. EARRINGS (Gen-Z 2026 Drops)
  // ==========================================
  {
    name: 'Sterling Silver Huggie Mini Hoops',
    price: 799,
    category: 'Earrings',
    tag: 'BESTSELLER',
    rating: 4.9,
    color: 'Brushed Silver',
    image: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=800&q=80',
    description: 'Pair of hypoallergenic solid 925 sterling silver huggie hoops with secure clicker clasp.'
  },
  {
    name: 'Gothic Dagger Cross Drop Earrings',
    price: 899,
    category: 'Earrings',
    tag: 'TRENDING',
    rating: 4.8,
    color: 'Polished Surgical Steel',
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80',
    description: 'Y2K punk sword dagger drop earrings cast in 316L medical-grade tarnish-free steel.'
  },
  {
    name: 'Minimal Titanium Bar Studs',
    price: 599,
    category: 'Earrings',
    tag: 'NEW',
    rating: 4.6,
    color: 'Gunmetal Titanium',
    image: 'https://images.unsplash.com/photo-1635767798638-3e25273a8236?auto=format&fit=crop&w=800&q=80',
    description: 'Clean unisex titanium architectural bar studs with secure screw-on butterfly backs.'
  },
  {
    name: 'Pearl & Chain Non-Pierce Ear Cuff',
    price: 699,
    category: 'Earrings',
    tag: 'DROP 02',
    rating: 4.7,
    color: 'Silver & Pearl',
    image: 'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&w=800&q=80',
    description: 'Adjustable clip-on ear cuff with dangling mini box chain and genuine freshwater pearl.'
  },

  // ==========================================
  // 9. CHAINS & NECKLACES (Gen-Z 2026 Drops)
  // ==========================================
  {
    name: 'Y2K Chrome Star Heavy Cuban Chain',
    price: 1499,
    category: 'Chains',
    tag: 'BESTSELLER',
    rating: 4.9,
    color: 'Sterling Silver',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',
    description: 'Substantial 10mm diamond-cut curb link Cuban chain featuring a detachable chrome star pendant.'
  },
  {
    name: 'Raw Baroque Freshwater Pearl Choker',
    price: 1299,
    category: 'Necklaces',
    tag: 'TRENDING',
    rating: 4.8,
    color: 'Ivory Pearl',
    image: 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&w=800&q=80',
    description: 'Handcrafted irregular baroque freshwater pearls strung on braided steel wire with industrial toggle clasp.'
  },
  {
    name: 'Obsidian Crystal Pendant Necklace',
    price: 1199,
    category: 'Necklaces',
    tag: 'NEW',
    rating: 4.7,
    color: 'Black & Silver',
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80',
    description: 'Raw cut volcanic black obsidian gemstone encased in a stainless steel claw setting on a rope chain.'
  },
  {
    name: 'Liquid Silver Flat Snake Chain',
    price: 999,
    category: 'Chains',
    tag: 'DROP 02',
    rating: 4.8,
    color: 'High Polish Silver',
    image: 'https://images.unsplash.com/photo-1600003014755-ba31aa59c4b6?auto=format&fit=crop&w=800&q=80',
    description: 'Smooth flat herringbone snake chain that drapes fluidly with liquid-metal reflective shine.'
  },
  {
    name: 'Micro 4mm Stacking Cuban Chain',
    price: 899,
    category: 'Chains',
    tag: 'RESTOCK',
    rating: 4.6,
    color: 'Silver',
    image: 'https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?auto=format&fit=crop&w=800&q=80',
    description: 'Delicate 4mm stainless steel Cuban chain engineered for subtle daily layering.'
  },

  // ==========================================
  // 10. BRACELETS (Gen-Z 2026 Drops)
  // ==========================================
  {
    name: 'Heavy 12mm Stainless Cuban Bracelet',
    price: 1199,
    category: 'Bracelets',
    tag: 'BESTSELLER',
    rating: 4.9,
    color: 'Silver',
    image: 'https://images.unsplash.com/photo-1622434641406-a158123450f9?auto=format&fit=crop&w=800&q=80',
    description: 'Solid heavy curb link wrist chain with dual security latches and bevelled polished edges.'
  },
  {
    name: 'Braided Matte Leather Steel Cuff',
    price: 899,
    category: 'Bracelets',
    tag: 'TRENDING',
    rating: 4.7,
    color: 'Midnight Black',
    image: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=800&q=80',
    description: 'Multi-ply woven genuine leather strap joined with a magnetic brushed stainless steel barrel lock.'
  },
  {
    name: 'Minimal Titanium Open Bangle',
    price: 999,
    category: 'Bracelets',
    tag: 'NEW',
    rating: 4.8,
    color: 'Brushed Silver',
    image: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&w=800&q=80',
    description: 'Solid titanium cuff with beveled ends and satin matte brushed finish, gently adjustable to fit.'
  },
  {
    name: 'Matte Lava Stone & Silver Bracelet',
    price: 799,
    category: 'Bracelets',
    tag: 'DROP 02',
    rating: 4.6,
    color: 'Charcoal & Silver',
    image: 'https://images.unsplash.com/photo-1590736969955-71cc94801759?auto=format&fit=crop&w=800&q=80',
    description: 'Natural porous volcanic lava beads accented with carved sterling silver geometric spacer beads.'
  },
  {
    name: 'Dual Intertwined Rope Bracelet',
    price: 849,
    category: 'Bracelets',
    tag: 'RESTOCK',
    rating: 4.7,
    color: 'Silver',
    image: 'https://images.unsplash.com/photo-1608042314453-ae338d80c427?auto=format&fit=crop&w=800&q=80',
    description: 'Two interlocking twist rope chains with lobster claw clasp in durable tarnish-free steel.'
  },

  // ==========================================
  // 11. COMPLETE OUTFITS & CO-ORDS (Gen-Z 2026 Drops)
  // ==========================================
  {
    name: 'The Blokecore Streetwear Ensemble',
    price: 3899,
    category: 'Complete Outfits',
    tag: 'BESTSELLER',
    rating: 4.9,
    color: 'Washed Green & Indigo',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
    description: 'Complete 3-piece look: Cyber graphic tee, 90s baggy denim jeans, and Y2K star pendant chain.'
  },
  {
    name: 'Gorpcore Utility Parachute Uniform',
    price: 4499,
    category: 'Complete Outfits',
    tag: 'TRENDING',
    rating: 4.8,
    color: 'Monochrome Heather',
    image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80',
    description: 'Complete 3-piece fit: Heavy waffle tee, balloon parachute pants, and vintage washed dad cap.'
  },
  {
    name: 'Grunge Flannel Layered Street Set',
    price: 4299,
    category: 'Complete Outfits',
    tag: 'DROP 02',
    rating: 4.9,
    color: 'Crimson, Black & Denim',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80',
    description: 'Complete 3-piece outfit: Heavy brushed flannel over boxy tee, distressed knee baggy jeans, and Cuban bracelet.'
  },
  {
    name: 'Downtown Minimalist Slouch Co-Ord',
    price: 3299,
    category: 'Complete Outfits',
    tag: 'NEW',
    rating: 4.8,
    color: 'Noir & Muted Sand',
    image: 'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&w=800&q=80',
    description: 'Complete 2-piece modern uniform: Oversized boxy utility shirt and relaxed mom fit pleated trousers.'
  },
  {
    name: 'Opium All-Black Uniform Set',
    price: 4699,
    category: 'Complete Outfits',
    tag: 'LIMITED',
    rating: 4.9,
    color: 'Total Blackout',
    image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=800&q=80',
    description: 'Complete luxury darkwear fit: 450 GSM cropped hoodie, wide-leg slouch denim, and heavy Cuban star chain.'
  }
];

async function seedProducts({ reset = false } = {}) {
  if (reset) {
    await Product.deleteMany({});
  }
  const result = await Product.bulkWrite(
    PRODUCTS.map((p) => ({
      updateOne: { filter: { name: p.name }, update: { $set: p }, upsert: true },
    }))
  );
  return { inserted: result.upsertedCount, updated: result.modifiedCount, total: PRODUCTS.length };
}

async function seedIfEmpty() {
  const count = await Product.estimatedDocumentCount();
  if (count > 0) return false;
  const r = await seedProducts();
  console.log(`[seed] Products collection was empty - inserted ${r.inserted} demo products.`);
  return true;
}

module.exports = { PRODUCTS, seedProducts, seedIfEmpty };
