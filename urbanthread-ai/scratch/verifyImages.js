const https = require('https');

// Curated list of high-end Gen-Z 2026 streetwear photo IDs on Unsplash
const candidates = [
  // Waffle & Boxy Tees
  { id: 'photo-1503342217505-b0a15ec3261c', label: 'Noir Heavy Boxy Tee' },
  { id: 'photo-1521572267360-ee0c2909d518', label: 'White Heavy Cotton' },
  { id: 'photo-1583743814966-8936f5b7be1a', label: 'Clean Essential Boxy Tee' },
  { id: 'photo-1576566588028-4147f3842f27', label: 'Cyber Graphic Street Tee' },
  { id: 'photo-1618354691373-d851c5c3a990', label: 'Washed Thermal Tee' },
  { id: 'photo-1529374255404-311a2a4f1fd9', label: 'Vintage Skater Tee' },
  { id: 'photo-1581655353564-df123a1eb820', label: 'Oversized Street Tee' },
  { id: 'photo-1503342394128-c104d54dba01', label: 'Moody Boxy Tee' },
  { id: 'photo-1622445268962-d9e03d420542', label: 'Heavy Knit Tee' },

  // Flannels & Printed Shirts & Boxy Shirts
  { id: 'photo-1519085360753-af0119f7cbe7', label: 'Grunge Flannel Shirt' },
  { id: 'photo-1602810318383-e386cc2a3ccf', label: 'Plaid Overshirt' },
  { id: 'photo-1596755094514-f87e34085b2c', label: 'Boxy Utility Button-Up' },
  { id: 'photo-1598033129183-c4f50c736f10', label: 'Corduroy Overshirt' },
  { id: 'photo-1589310243389-96a5483213a8', label: 'Printed Camp Shirt' },
  { id: 'photo-1607345366928-199ea26cfe3e', label: 'Street Flannel Plaid' },
  { id: 'photo-1489987707025-afc232f7ea0f', label: 'Oversized Summer Shirt' },
  { id: 'photo-1594938298603-c8148c4dae35', label: 'Printed Silk/Rayon Shirt' },

  // Barrel Jeans & Baggy Skater Jeans
  { id: 'photo-1541099649105-f69ad21f3246', label: 'Skater Baggy Denim' },
  { id: 'photo-1604176354204-9268737828e4', label: 'Ice Blue Wide Leg Denim' },
  { id: 'photo-1582552938357-32b906df40cb', label: 'Distressed Baggy Jeans' },
  { id: 'photo-1555689502-c4b22d76c56f', label: 'Black Wide Cut Jeans' },
  { id: 'photo-1576995853123-5a10305d93c0', label: 'Raw Indigo Selvedge Denim' },
  { id: 'photo-1512436991641-6745cdb1723f', label: 'Ecru Work Denim' },
  { id: 'photo-1560243563-062bfc001d68', label: 'Curved Barrel Fit Jeans' },
  { id: 'photo-1542272604-780c96856592', label: 'Faded Denim Puddle Jeans' },

  // Mom Fit Pants & Cargos & Parachute Pants
  { id: 'photo-1509551388413-e18d0ac5d495', label: 'Pleated Mom Fit Trousers' },
  { id: 'photo-1517445312882-bc9910d016b7', label: 'Gorpcore Balloon Pants' },
  { id: 'photo-1552902865-b72c031ac5ea', label: 'Tactical Cargo Pants' },
  { id: 'photo-1624378439575-d8705ad7ae80', label: 'Slouchy Tailored Trousers' },
  { id: 'photo-1473966968600-fa801b869a1a', label: 'Ripstop Utility Cargos' },
  { id: 'photo-1506629082955-511b1aa562c8', label: 'High Rise Mom Fit Chino' },
  { id: 'photo-1515886657613-9f3515b0c78f', label: 'Street Model In Relaxed Pants' },

  // Hoodies & Jackets
  { id: 'photo-1509967419530-da38b4704bc6', label: 'Heavy Cropped Hoodie' },
  { id: 'photo-1543163521-1bf539c55dd2', label: 'Two-Way Zip Washed Hoodie' },
  { id: 'photo-1556905055-8f358a7a47b2', label: 'Signal Grey Brushed Hoodie' },
  { id: 'photo-1578587018452-892bacefd3f2', label: 'Raw Edge Street Hoodie' },
  { id: 'photo-1620799140408-edc6dcb6d633', label: 'Bone White Heavy Hoodie' },
  { id: 'photo-1578632767115-351597cf2477', label: 'Espresso Boxy Pullover' },
  { id: 'photo-1551028719-00167b16eac5', label: 'Biker Moto Leather Jacket' },
  { id: 'photo-1544441893-675973e31985', label: 'Piping Track Bomber' },
  { id: 'photo-1548883354-7622d03aca27', label: 'Puffer Cropped Jacket' },
  { id: 'photo-1544923246-77307dd654cb', label: 'Tech Shell Windbreaker' },

  // Headwear & Jewelry & Outfits
  { id: 'photo-1588850561407-ed78c282e89b', label: 'Vintage Enzyme Dad Cap' },
  { id: 'photo-1575428652377-a2d80e2277fc', label: 'Mesh Foam Trucker Hat' },
  { id: 'photo-1576871337632-b9aef4c17ab9', label: 'Heavy Fisherman Beanie' },
  { id: 'photo-1521369909029-2afed882baee', label: 'Nylon Crinkle Strapback' },
  { id: 'photo-1534215754734-18e55d13e346', label: 'Two Tone Racing Cap' },
  { id: 'photo-1630019852942-f89202989a59', label: 'Huggie Silver Hoops' },
  { id: 'photo-1535632066927-ab7c9ab60908', label: 'Gothic Dagger Drop Earrings' },
  { id: 'photo-1635767798638-3e25273a8236', label: 'Titanium Bar Studs' },
  { id: 'photo-1602751584552-8ba73aad10e1', label: 'Pearl Ear Cuff' },
  { id: 'photo-1599643478518-a784e5dc4c8f', label: 'Heavy Cuban Star Chain' },
  { id: 'photo-1599643477877-530eb83abc8e', label: 'Baroque Pearl Choker' },
  { id: 'photo-1515562141207-7a88fb7ce338', label: 'Obsidian Crystal Necklace' },
  { id: 'photo-1600003014755-ba31aa59c4b6', label: 'Flat Snake Chain' },
  { id: 'photo-1601121141461-9d6647bca1ed', label: 'Stacking Cuban Chain' },
  { id: 'photo-1622434641406-a158123450f9', label: 'Cuban Link Bracelet' },
  { id: 'photo-1611652022419-a9419f74343d', label: 'Leather Steel Cuff' },
  { id: 'photo-1573408301185-9146fe634ad0', label: 'Titanium Bangle' },
  { id: 'photo-1590736969955-71cc94801759', label: 'Lava Stone Beads' },
  { id: 'photo-1608042314453-ae338d80c427', label: 'Rope Chain Bracelet' },
  { id: 'photo-1509631179647-0177331693ae', label: 'Gorpcore Utility Set' },
  { id: 'photo-1490481651871-ab68de25d43d', label: 'Grunge Flannel Street Fit' },
  { id: 'photo-1485230895905-ec40ba36b9bc', label: 'Downtown Slouch Co-Ord' },
  { id: 'photo-1469334031218-e382a71b716b', label: 'Opium All-Black Set' }
];

async function verify() {
  console.log(`Verifying ${candidates.length} candidates...`);
  let ok = 0;
  for (const c of candidates) {
    const url = `https://images.unsplash.com/${c.id}?auto=format&fit=crop&w=800&q=80`;
    try {
      const res = await fetch(url, { method: 'HEAD' });
      if (res.status === 200) {
        ok++;
        // console.log(`[OK 200] ${c.label}`);
      } else {
        console.warn(`[WARN ${res.status}] ${c.id} - ${c.label}`);
      }
    } catch (e) {
      console.error(`[ERR] ${c.id}: ${e.message}`);
    }
  }
  console.log(`Done! ${ok} / ${candidates.length} candidate images verified 200 OK.`);
}

verify();
