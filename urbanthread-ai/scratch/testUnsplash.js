const fs = require('fs');

async function test() {
  const res = await fetch('https://unsplash.com/s/photos/streetwear', {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
    }
  });
  const html = await res.text();
  console.log('HTML status:', res.status, 'HTML length:', html.length);
  
  // Look for photo IDs or image URLs
  const nextDataMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">([^<]+)<\/script>/);
  if (nextDataMatch) {
    console.log('Found __NEXT_DATA__');
    const data = JSON.parse(nextDataMatch[1]);
    console.log('Keys in data:', Object.keys(data));
    console.log('props:', JSON.stringify(data.props).slice(0, 500));
  } else {
    // Look for any images.unsplash.com links
    const matches = html.match(/https:\/\/images\.unsplash\.com\/photo-[a-zA-Z0-9_\-]+/g);
    console.log('Direct photo matches:', matches ? matches.slice(0, 10) : 'none');
  }
}

test();
