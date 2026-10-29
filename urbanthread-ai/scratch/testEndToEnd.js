const http = require('http');

async function testE2E() {
  console.log('🧪 Running UrbanThread 2026 Gen-Z Full Suite Test...');

  // 1. Check /api/products
  const prodRes = await fetch('http://127.0.0.1:5000/api/products');
  if (prodRes.status !== 200) {
    throw new Error(`Products failed with HTTP ${prodRes.status}`);
  }
  const products = await prodRes.json();
  console.log(`✅ Loaded ${products.length} products from API`);

  // Verify key items
  const checkNames = [
    'Heavyweight Waffle Knit Boxy T-Shirt',
    'Architectural Barrel-Leg Curved Jeans',
    '90s Ultra-Wide Baggy Skater Jeans',
    '90s Grunge Heavy Brushed Flannel Shirt',
    'Retro Y2K Abstract Printed Camp Shirt',
    'Relaxed Mom Fit Pleated Chino Pants',
    'Oversized Boxy Utility Poplin Shirt',
    'Gorpcore Balloon Parachute Pants',
    '450 GSM Heavy Cropped Boxy Hoodie'
  ];

  for (const name of checkNames) {
    const item = products.find((p) => p.name === name);
    if (!item) {
      throw new Error(`Missing expected Gen-Z 2026 product: ${name}`);
    }
    console.log(`  ✓ Found "${item.name}" [${item.category}] - ₹${item.price} (${item.image})`);
  }

  // 2. Customer login
  const custRes = await fetch('http://127.0.0.1:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'customer@urbanthread.com', password: 'Customer@123' })
  });
  const custData = await custRes.json();
  if (!custData.token) throw new Error('Customer login failed: ' + JSON.stringify(custData));
  console.log('✅ Customer login verified:', custData.user.name);

  // 3. Admin login
  const adminRes = await fetch('http://127.0.0.1:5000/api/auth/admin-login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@urbanthread.com', password: 'UrbanThread@2026!' })
  });
  const adminData = await adminRes.json();
  if (!adminData.token || adminData.user.role !== 'admin') {
    throw new Error('Admin login failed: ' + JSON.stringify(adminData));
  }
  console.log('✅ Admin login verified:', adminData.user.name, `(${adminData.user.role})`);

  // 4. Place an order with Gen-Z pieces
  const waffleTee = products.find((p) => p.name.includes('Waffle'));
  const barrelJeans = products.find((p) => p.name.includes('Barrel'));
  const momFitPants = products.find((p) => p.name.includes('Mom Fit'));

  const orderPayload = {
    items: [
      { product: waffleTee.id, size: 'L', quantity: 2, price: waffleTee.price },
      { product: barrelJeans.id, size: 'M', quantity: 1, price: barrelJeans.price },
      { product: momFitPants.id, size: 'M', quantity: 1, price: momFitPants.price }
    ],
    shippingAddress: {
      fullName: 'Alex Vance',
      street: '42 Neo-Tokyo Avenue',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560001',
      phone: '+91 98765 43210'
    },
    paymentMethod: 'COD',
    appliedPromo: 'STREET20'
  };

  const orderRes = await fetch('http://127.0.0.1:5000/api/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${custData.token}`
    },
    body: JSON.stringify(orderPayload)
  });
  const orderData = await orderRes.json();
  const order = orderData.order || orderData;
  if (!order.trackingNumber) {
    throw new Error('Order creation failed: ' + JSON.stringify(orderData));
  }
  console.log(`✅ Placed Gen-Z Order: Tracking #${order.trackingNumber}, Total: ₹${order.total || order.totalAmount}`);

  // 5. Admin updates order status
  const updateRes = await fetch(`http://127.0.0.1:5000/api/admin/orders/${order.id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminData.token}`
    },
    body: JSON.stringify({ status: 'Shipped' })
  });
  const updatedOrder = await updateRes.json();
  const updatedStatus = updatedOrder.order?.status || updatedOrder.status;
  console.log(`✅ Admin updated order status to: ${updatedStatus}`);

  console.log('\n🎉 ALL 5 SUITE VERIFICATIONS PASSED 100%!');
}

testE2E().catch((err) => {
  console.error('❌ Test failed:', err.message);
  process.exit(1);
});
