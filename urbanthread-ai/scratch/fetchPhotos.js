const fs = require('fs');

async function getPhotos(tag) {
  try {
    const url = `https://unsplash.com/s/photos/${tag}`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    const html = await res.text();
    const regex = /https:\/\/images\.unsplash\.com\/photo-([a-zA-Z0-9_\-]+)\?auto=format/g;
    const matches = new Set();
    let m;
    while ((m = regex.exec(html)) !== null) {
      if (m[1] && m[1].length > 6) {
        matches.add(m[1]);
      }
    }
    return Array.from(matches);
  } catch (err) {
    console.error(err.message);
    return [];
  }
}

async function run() {
  const queries = [
    'streetwear-waffle',
    'oversized-t-shirt',
    'boxy-t-shirt',
    'oversized-shirt',
    'flannel-shirt',
    'printed-shirt',
    'barrel-jeans',
    'baggy-jeans',
    'skater-jeans',
    'mom-jeans',
    'cargo-pants',
    'parachute-pants',
    'streetwear-hoodie',
    'streetwear-jacket',
    'streetwear-outfit'
  ];

  const results = {};
  for (const q of queries) {
    const list = await getPhotos(q);
    results[q] = list.slice(0, 8);
    console.log(q, results[q].length, 'images found');
  }

  fs.writeFileSync('scratch/photos.json', JSON.stringify(results, null, 2));
}

run();
