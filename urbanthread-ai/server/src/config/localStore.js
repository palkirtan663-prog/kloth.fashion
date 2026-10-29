const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const { PRODUCTS } = require('../seed/seedProducts');

const generateId = () => new mongoose.Types.ObjectId().toHexString();

const DATA_DIR = path.join(__dirname, '..', '..', 'data');
const DATA_FILE = path.join(DATA_DIR, 'localStore.json');

const INITIAL_BANNERS = [
  {
    _id: '65f0000000000000000000b1',
    id: '65f0000000000000000000b1',
    title: 'DROP 02: THE METROPOLIS OVERSIZED EDIT',
    subtitle: 'Heavy 450 GSM French Terry Hoodies, Structured Boxy Tees & Acid Mineral Washes',
    badge: 'NEW DROP 02 LIVE',
    image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1600&q=80',
    ctaText: 'Explore Collection',
    ctaLink: '#shop',
    active: true,
    displayOrder: 1,
    createdAt: new Date().toISOString(),
  },
  {
    _id: '65f0000000000000000000b2',
    id: '65f0000000000000000000b2',
    title: 'WINTER STREETWEAR & OVERSIZED FLANNELS',
    subtitle: 'Double-brushed heavy flannels and vintage skater silhouettes crafted for effortless layering',
    badge: 'TRENDING NOW',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1600&q=80',
    ctaText: 'Shop Trending',
    ctaLink: '#trending',
    active: true,
    displayOrder: 2,
    createdAt: new Date().toISOString(),
  },
  {
    _id: '65f0000000000000000000b3',
    id: '65f0000000000000000000b3',
    title: 'LUXURY ARTISAN JEWELRY & CHAINS',
    subtitle: 'Solid Cuban Links, Baroque Freshwater Pearls & Industrial Streetwear Hardware',
    badge: 'ACCESSORIES EXCLUSIVE',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1600&q=80',
    ctaText: 'View Accessories',
    ctaLink: '#shop',
    active: true,
    displayOrder: 3,
    createdAt: new Date().toISOString(),
  },
  {
    _id: '65f0000000000000000000b4',
    id: '65f0000000000000000000b4',
    title: 'CUSTOM CLOTHING & BESPOKE ATELIER',
    subtitle: 'Have a design in mind? Upload your reference photo and let our master tailors stitch it for you.',
    badge: 'DESIGN YOUR OWN',
    image: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1600&q=80',
    ctaText: 'Request Your Style',
    ctaLink: '#custom-clothing',
    active: true,
    displayOrder: 4,
    createdAt: new Date().toISOString(),
  },
];

const INITIAL_NOTIFICATIONS = [
  {
    _id: '65f0000000000000000000n1',
    id: '65f0000000000000000000n1',
    title: '🔥 DROP 02 Is Officially Live!',
    message: '50+ new oversized hoodies, boxy cut tees, and distressed skate cargos have just landed.',
    type: 'collection',
    targetRole: 'all',
    tag: 'NEW DROP',
    link: '#shop',
    readBy: [],
    createdAt: new Date().toISOString(),
  },
  {
    _id: '65f0000000000000000000n2',
    id: '65f0000000000000000000n2',
    title: '⚡ Promo Code Active: STREET20',
    message: 'Apply coupon code STREET20 at checkout for an extra 20% discount on all streetwear apparel.',
    type: 'promo',
    targetRole: 'all',
    tag: 'DISCOUNT',
    link: '#shop',
    readBy: [],
    createdAt: new Date().toISOString(),
  },
  {
    _id: '65f0000000000000000000n3',
    id: '65f0000000000000000000n3',
    title: '✨ Bespoke Custom Clothing Atelier Now Open',
    message: 'You can now upload your own clothing design inspiration images for tailor-made production.',
    type: 'announcement',
    targetRole: 'all',
    tag: 'NEW FEATURE',
    link: '#custom-clothing',
    readBy: [],
    createdAt: new Date().toISOString(),
  },
];

let inMemoryDb = {
  products: [],
  users: [],
  orders: [],
  customRequests: [],
  supportTickets: [],
  notifications: [],
  banners: [],
};

let isActivatedState = false;

function saveToDisk() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(inMemoryDb, null, 2), 'utf8');
  } catch (err) {
    console.warn('[localStore] Could not write store to disk:', err.message);
  }
}

function loadFromDisk(config = {}) {
  let existingUsers = [];
  let existingOrders = [];
  let existingCustomRequests = [];
  let existingSupportTickets = [];
  let existingNotifications = [];
  let existingBanners = [];

  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf8');
      const parsed = JSON.parse(raw);
      if (parsed) {
        if (Array.isArray(parsed.users) && parsed.users.length > 0) existingUsers = parsed.users;
        if (Array.isArray(parsed.orders)) existingOrders = parsed.orders;
        if (Array.isArray(parsed.customRequests)) existingCustomRequests = parsed.customRequests;
        if (Array.isArray(parsed.supportTickets)) existingSupportTickets = parsed.supportTickets;
        if (Array.isArray(parsed.notifications) && parsed.notifications.length > 0) existingNotifications = parsed.notifications;
        if (Array.isArray(parsed.banners) && parsed.banners.length > 0) existingBanners = parsed.banners;
      }
    }
  } catch (err) {
    console.warn('[localStore] Could not load store from disk:', err.message);
  }

  // Sync products catalogue
  inMemoryDb.products = PRODUCTS.map((p) => {
    const id = new mongoose.Types.ObjectId().toHexString();
    const isAccessory = ['Caps', 'Earrings', 'Necklaces', 'Chains', 'Bracelets'].includes(p.category);
    return {
      ...p,
      _id: id,
      id,
      sizes: isAccessory ? ['One Size'] : ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
      stock: 25,
      gender: p.category === 'Earrings' || p.category === 'Necklaces' ? 'Unisex' : 'Men',
      gallery: [p.image],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  });

  const adminEmail = (config.adminEmail || process.env.ADMIN_EMAIL || 'admin@urbanthread.com').trim().toLowerCase();
  const adminPassword = config.adminPassword || process.env.ADMIN_PASSWORD || 'UrbanThread@2026!';
  const adminHash = bcrypt.hashSync(adminPassword, 10);

  if (existingUsers.length > 0) {
    inMemoryDb.users = existingUsers;
    // Ensure admin user exists with admin role; never overwrite a chosen password
    const adminUser = inMemoryDb.users.find((u) => u.email.toLowerCase() === adminEmail || u.email.toLowerCase() === 'admin@kloth.fashion');
    if (adminUser) {
      adminUser.role = 'admin';
      if (!adminUser.passwordHash) {
        adminUser.passwordHash = adminHash;
      }
      if (!adminUser.name) {
        adminUser.name = 'Kloth.fashion Admin';
      }
    } else {
      inMemoryDb.users.unshift({
        _id: '65f000000000000000000001',
        id: '65f000000000000000000001',
        name: 'Kloth.fashion Admin',
        email: adminEmail,
        passwordHash: adminHash,
        role: 'admin',
        createdAt: new Date().toISOString(),
      });
    }
    // Also ensure admin@kloth.fashion exists
    const klothAdmin = inMemoryDb.users.find(u => u.email.toLowerCase() === 'admin@kloth.fashion');
    if (!klothAdmin) {
      inMemoryDb.users.push({
        _id: '65f00000000000000000001a',
        id: '65f00000000000000000001a',
        name: 'Kloth.fashion Admin',
        email: 'admin@kloth.fashion',
        passwordHash: adminHash,
        role: 'admin',
        createdAt: new Date().toISOString(),
      });
    } else {
      klothAdmin.role = 'admin';
      if (!klothAdmin.passwordHash) klothAdmin.passwordHash = adminHash;
    }
    // Ensure customer@kloth.fashion exists
    if (!inMemoryDb.users.some(u => u.email.toLowerCase() === 'customer@kloth.fashion')) {
      inMemoryDb.users.push({
        _id: '65f00000000000000000002a',
        id: '65f00000000000000000002a',
        name: 'Demo Customer',
        email: 'customer@kloth.fashion',
        passwordHash: bcrypt.hashSync('Customer@123', 10),
        role: 'user',
        createdAt: new Date().toISOString(),
      });
    }
    // Automatically guarantee palkirtan663@gmail.com has admin role
    const kirtanUser = inMemoryDb.users.find(u => u.email.toLowerCase() === 'palkirtan663@gmail.com');
    if (kirtanUser) {
      kirtanUser.role = 'admin';
    }
  } else {

    inMemoryDb.users = [
      {
        _id: '65f000000000000000000001',
        id: '65f000000000000000000001',
        name: 'Kloth.fashion Admin',
        email: adminEmail,
        passwordHash: adminHash,
        role: 'admin',
        createdAt: new Date().toISOString(),
      },
      {
        _id: '65f00000000000000000001a',
        id: '65f00000000000000000001a',
        name: 'Kloth.fashion Admin',
        email: 'admin@kloth.fashion',
        passwordHash: adminHash,
        role: 'admin',
        createdAt: new Date().toISOString(),
      },
      {
        _id: '65f000000000000000000002',
        id: '65f000000000000000000002',
        name: 'Demo Customer',
        email: 'customer@urbanthread.com',
        passwordHash: bcrypt.hashSync('Customer@123', 10),
        role: 'user',
        createdAt: new Date().toISOString(),
      },
      {
        _id: '65f00000000000000000002a',
        id: '65f00000000000000000002a',
        name: 'Demo Customer',
        email: 'customer@kloth.fashion',
        passwordHash: bcrypt.hashSync('Customer@123', 10),
        role: 'user',
        createdAt: new Date().toISOString(),
      },
    ];
  }

  inMemoryDb.orders = existingOrders;
  inMemoryDb.customRequests = existingCustomRequests;
  inMemoryDb.supportTickets = existingSupportTickets;
  inMemoryDb.notifications = existingNotifications.length > 0 ? existingNotifications : INITIAL_NOTIFICATIONS;
  inMemoryDb.banners = existingBanners.length > 0 ? existingBanners : INITIAL_BANNERS;

  saveToDisk();
}

function makeDoc(obj) {
  if (!obj) return null;
  const doc = { ...obj };
  doc.id = String(doc._id || doc.id);
  doc.select = function () {
    return this;
  };
  doc.save = async function () {
    // Synchronize all updated properties back to the stored object
    Object.assign(obj, doc);
    delete obj.save;
    delete obj.toJSON;
    delete obj.select;
    saveToDisk();
    return this;
  };
  doc.toJSON = function () {
    const copy = { ...this };
    copy.id = String(copy._id || copy.id);
    delete copy._id;
    delete copy.__v;
    delete copy.passwordHash;
    delete copy.save;
    delete copy.toJSON;
    return copy;
  };
  return doc;
}

function createQuery(resultPromise) {
  const q = {
    then(onFulfilled, onRejected) {
      return resultPromise.then(onFulfilled, onRejected);
    },
    catch(onRejected) {
      return resultPromise.catch(onRejected);
    },
    finally(onFinally) {
      return resultPromise.finally(onFinally);
    },
    select() {
      return q;
    },
    sort(sortObj) {
      resultPromise = resultPromise.then((arr) => {
        if (!Array.isArray(arr)) return arr;
        return [...arr].sort((a, b) => {
          if (sortObj?.createdAt === -1) {
            return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
          }
          if (sortObj?.createdAt === 1) {
            return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
          }
          return 0;
        });
      });
      return q;
    },
  };
  return q;
}

function activateLocalStore(config = {}) {
  if (isActivatedState) return;
  isActivatedState = true;
  loadFromDisk(config);

  const Product = require('../models/Product');
  const User = require('../models/User');
  const Order = require('../models/Order');
  const CustomRequest = require('../models/CustomRequest');
  const SupportTicket = require('../models/SupportTicket');
  const Notification = require('../models/Notification');
  const Banner = require('../models/Banner');

  // --- PRODUCT OVERRIDES ---
  Product.init = async () => true;
  Product.estimatedDocumentCount = async () => inMemoryDb.products.length;
  Product.countDocuments = async (filter) => {
    if (!filter) return inMemoryDb.products.length;
    return inMemoryDb.products.filter((p) => {
      if (filter.category && p.category !== filter.category) return false;
      return true;
    }).length;
  };

  Product.find = (filter = {}) => {
    const run = async () => {
      let list = inMemoryDb.products;
      if (filter.category) {
        list = list.filter((p) => p.category === filter.category);
      }
      return list.map(makeDoc);
    };
    return createQuery(run());
  };

  Product.findById = async (id) => {
    const p = inMemoryDb.products.find((x) => String(x.id) === String(id) || String(x._id) === String(id));
    return makeDoc(p);
  };

  Product.create = async (data) => {
    const existing = inMemoryDb.products.find(
      (p) => p.name.trim().toLowerCase() === data.name.trim().toLowerCase()
    );
    if (existing) {
      const err = new Error('A product with this name already exists.');
      err.code = 11000;
      throw err;
    }
    const newId = generateId();
    const isAccessory = ['Caps', 'Earrings', 'Necklaces', 'Chains', 'Bracelets'].includes(data.category);
    const newProd = {
      ...data,
      sizes: data.sizes || (isAccessory ? ['One Size'] : ['XS', 'S', 'M', 'L', 'XL', 'XXL']),
      stock: data.stock !== undefined ? Number(data.stock) : 25,
      gender: data.gender || 'Unisex',
      gallery: data.gallery || [data.image],
      _id: newId,
      id: newId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    inMemoryDb.products.unshift(newProd);
    saveToDisk();
    return makeDoc(newProd);
  };

  Product.findByIdAndUpdate = async (id, update) => {
    const idx = inMemoryDb.products.findIndex(
      (x) => String(x.id) === String(id) || String(x._id) === String(id)
    );
    if (idx === -1) return null;
    inMemoryDb.products[idx] = {
      ...inMemoryDb.products[idx],
      ...update,
      updatedAt: new Date().toISOString(),
    };
    saveToDisk();
    return makeDoc(inMemoryDb.products[idx]);
  };

  Product.findByIdAndDelete = async (id) => {
    const idx = inMemoryDb.products.findIndex(
      (x) => String(x.id) === String(id) || String(x._id) === String(id)
    );
    if (idx === -1) return null;
    const [deleted] = inMemoryDb.products.splice(idx, 1);
    saveToDisk();
    return makeDoc(deleted);
  };

  Product.deleteMany = async () => {
    inMemoryDb.products = [];
    saveToDisk();
    return { deletedCount: 0 };
  };

  Product.bulkWrite = async (ops) => {
    let upsertedCount = 0;
    let modifiedCount = 0;
    for (const op of ops) {
      if (op.updateOne) {
        const { filter, update } = op.updateOne;
        const target = inMemoryDb.products.find((p) => p.name === filter.name);
        if (target) {
          Object.assign(target, update.$set, { updatedAt: new Date().toISOString() });
          modifiedCount++;
        } else {
          const newId = generateId();
          inMemoryDb.products.push({
            ...update.$set,
            _id: newId,
            id: newId,
            createdAt: new Date().toISOString(),
          });
          upsertedCount++;
        }
      }
    }
    saveToDisk();
    return { upsertedCount, modifiedCount };
  };

  // --- USER OVERRIDES ---
  User.init = async () => true;
  User.countDocuments = async (filter) => {
    if (!filter) return inMemoryDb.users.length;
    return inMemoryDb.users.filter((u) => {
      if (filter.role && u.role !== filter.role) return false;
      return true;
    }).length;
  };

  User.exists = async (filter) => {
    if (filter.email) {
      const email = String(filter.email).trim().toLowerCase();
      return inMemoryDb.users.some((u) => u.email.toLowerCase() === email);
    }
    return false;
  };

  User.findOne = (filter) => {
    const run = async () => {
      if (filter.email) {
        const email = String(filter.email).trim().toLowerCase();
        const found = inMemoryDb.users.find((u) => u.email.toLowerCase() === email);
        return makeDoc(found);
      }
      if (filter._id || filter.id) {
        const targetId = String(filter._id || filter.id);
        const found = inMemoryDb.users.find((u) => String(u.id) === targetId || String(u._id) === targetId);
        return makeDoc(found);
      }
      return null;
    };
    return createQuery(run());
  };

  User.findById = async (id) => {
    const u = inMemoryDb.users.find((x) => String(x.id) === String(id) || String(x._id) === String(id));
    return makeDoc(u);
  };

  User.find = () => {
    const run = async () => inMemoryDb.users.map(makeDoc);
    return createQuery(run());
  };

  User.create = async (data) => {
    const email = String(data.email).trim().toLowerCase();
    if (inMemoryDb.users.some((u) => u.email.toLowerCase() === email)) {
      const err = new Error('An account with this email already exists.');
      err.code = 11000;
      throw err;
    }
    const newId = generateId();
    const newUser = {
      _id: newId,
      id: newId,
      name: data.name,
      email,
      passwordHash: data.passwordHash,
      role: data.role || 'user',
      phone: data.phone || '',
      address: data.address || { street: '', city: '', state: '', postalCode: '' },
      notificationPreferences: data.notificationPreferences || { marketing: true, orderUpdates: true, restocks: true },
      createdAt: new Date().toISOString(),
    };
    inMemoryDb.users.push(newUser);
    saveToDisk();
    return makeDoc(newUser);
  };

  User.findByIdAndUpdate = async (id, update) => {
    const idx = inMemoryDb.users.findIndex(
      (x) => String(x.id) === String(id) || String(x._id) === String(id)
    );
    if (idx === -1) return null;
    inMemoryDb.users[idx] = {
      ...inMemoryDb.users[idx],
      ...update,
    };
    saveToDisk();
    return makeDoc(inMemoryDb.users[idx]);
  };

  User.findByIdAndDelete = async (id) => {
    const idx = inMemoryDb.users.findIndex(
      (x) => String(x.id) === String(id) || String(x._id) === String(id)
    );
    if (idx === -1) return null;
    const [deleted] = inMemoryDb.users.splice(idx, 1);
    saveToDisk();
    return makeDoc(deleted);
  };

  // --- ORDER OVERRIDES ---
  Order.init = async () => true;
  Order.countDocuments = async () => inMemoryDb.orders.length;

  Order.find = (filter = {}) => {
    const run = async () => {
      let list = inMemoryDb.orders;
      if (filter.user) {
        list = list.filter((o) => String(o.user) === String(filter.user));
      }
      return list.map(makeDoc);
    };
    return createQuery(run());
  };

  Order.findById = async (id) => {
    const o = inMemoryDb.orders.find((x) => String(x.id) === String(id) || String(x._id) === String(id));
    return makeDoc(o);
  };

  Order.findOne = (filter) => {
    const run = async () => {
      if (filter.trackingNumber) {
        const regex = filter.trackingNumber instanceof RegExp ? filter.trackingNumber : new RegExp(`^${filter.trackingNumber}$`, 'i');
        const o = inMemoryDb.orders.find((x) => regex.test(x.trackingNumber));
        return makeDoc(o);
      }
      return null;
    };
    return createQuery(run());
  };

  Order.create = async (data) => {
    const newId = generateId();
    const trackingNumber = 'KLOTH-' + Math.floor(100000 + Math.random() * 900000);
    const newOrder = {
      ...data,
      _id: newId,
      id: newId,
      trackingNumber,
      carrier: 'Streetwear Express',
      status: data.status || 'Processing',
      statusHistory: [
        {
          status: data.status || 'Processing',
          timestamp: new Date(),
          note: 'Order confirmed and placed via online store.',
        },
      ],
      returnRequest: data.returnRequest || { status: 'None', type: 'Return & Refund', reason: '', details: '', preferredSize: '', adminNote: '' },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    inMemoryDb.orders.unshift(newOrder);
    saveToDisk();
    return makeDoc(newOrder);
  };

  Order.findByIdAndUpdate = async (id, update) => {
    const idx = inMemoryDb.orders.findIndex(
      (x) => String(x.id) === String(id) || String(x._id) === String(id)
    );
    if (idx === -1) return null;
    inMemoryDb.orders[idx] = {
      ...inMemoryDb.orders[idx],
      ...update,
      updatedAt: new Date().toISOString(),
    };
    saveToDisk();
    return makeDoc(inMemoryDb.orders[idx]);
  };

  // --- CUSTOM REQUEST OVERRIDES ---
  CustomRequest.init = async () => true;
  CustomRequest.countDocuments = async () => inMemoryDb.customRequests.length;
  CustomRequest.find = (filter = {}) => {
    const run = async () => {
      let list = inMemoryDb.customRequests;
      if (filter.user) {
        list = list.filter((r) => String(r.user) === String(filter.user));
      }
      return list.map(makeDoc);
    };
    return createQuery(run());
  };
  CustomRequest.findById = async (id) => {
    const r = inMemoryDb.customRequests.find((x) => String(x.id) === String(id) || String(x._id) === String(id));
    return makeDoc(r);
  };
  CustomRequest.create = async (data) => {
    const newId = generateId();
    const requestId = 'CR-' + Math.floor(100000 + Math.random() * 900000);
    const newReq = {
      ...data,
      _id: newId,
      id: newId,
      requestId,
      status: data.status || 'Submitted',
      quote: data.quote || { price: 0, estimatedDays: 7, notes: '' },
      history: [
        {
          status: 'Submitted',
          note: 'Custom design request received with inspiration references.',
          timestamp: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    inMemoryDb.customRequests.unshift(newReq);
    saveToDisk();
    return makeDoc(newReq);
  };
  CustomRequest.findByIdAndUpdate = async (id, update) => {
    const idx = inMemoryDb.customRequests.findIndex(
      (x) => String(x.id) === String(id) || String(x._id) === String(id)
    );
    if (idx === -1) return null;
    inMemoryDb.customRequests[idx] = {
      ...inMemoryDb.customRequests[idx],
      ...update,
      updatedAt: new Date().toISOString(),
    };
    saveToDisk();
    return makeDoc(inMemoryDb.customRequests[idx]);
  };

  // --- SUPPORT TICKET OVERRIDES ---
  SupportTicket.init = async () => true;
  SupportTicket.countDocuments = async () => inMemoryDb.supportTickets.length;
  SupportTicket.find = (filter = {}) => {
    const run = async () => {
      let list = inMemoryDb.supportTickets;
      if (filter.user) {
        list = list.filter((t) => String(t.user) === String(filter.user));
      }
      return list.map(makeDoc);
    };
    return createQuery(run());
  };
  SupportTicket.findById = async (id) => {
    const t = inMemoryDb.supportTickets.find((x) => String(x.id) === String(id) || String(x._id) === String(id));
    return makeDoc(t);
  };
  SupportTicket.create = async (data) => {
    const newId = generateId();
    const ticketNumber = 'TKT-' + Math.floor(100000 + Math.random() * 900000);
    const newTkt = {
      ...data,
      _id: newId,
      id: newId,
      ticketNumber,
      status: data.status || 'Open',
      priority: data.priority || 'Normal',
      replies: data.replies || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    inMemoryDb.supportTickets.unshift(newTkt);
    saveToDisk();
    return makeDoc(newTkt);
  };
  SupportTicket.findByIdAndUpdate = async (id, update) => {
    const idx = inMemoryDb.supportTickets.findIndex(
      (x) => String(x.id) === String(id) || String(x._id) === String(id)
    );
    if (idx === -1) return null;
    inMemoryDb.supportTickets[idx] = {
      ...inMemoryDb.supportTickets[idx],
      ...update,
      updatedAt: new Date().toISOString(),
    };
    saveToDisk();
    return makeDoc(inMemoryDb.supportTickets[idx]);
  };

  // --- NOTIFICATION OVERRIDES ---
  Notification.init = async () => true;
  Notification.countDocuments = async () => inMemoryDb.notifications.length;
  Notification.find = () => {
    const run = async () => inMemoryDb.notifications.map(makeDoc);
    return createQuery(run());
  };
  Notification.findById = async (id) => {
    const n = inMemoryDb.notifications.find((x) => String(x.id) === String(id) || String(x._id) === String(id));
    return makeDoc(n);
  };
  Notification.create = async (data) => {
    const newId = generateId();
    const newNotif = {
      ...data,
      _id: newId,
      id: newId,
      readBy: data.readBy || [],
      createdAt: new Date().toISOString(),
    };
    inMemoryDb.notifications.unshift(newNotif);
    saveToDisk();
    return makeDoc(newNotif);
  };
  Notification.findByIdAndUpdate = async (id, update) => {
    const idx = inMemoryDb.notifications.findIndex(
      (x) => String(x.id) === String(id) || String(x._id) === String(id)
    );
    if (idx === -1) return null;
    inMemoryDb.notifications[idx] = {
      ...inMemoryDb.notifications[idx],
      ...update,
    };
    saveToDisk();
    return makeDoc(inMemoryDb.notifications[idx]);
  };
  Notification.deleteMany = async () => {
    inMemoryDb.notifications = [];
    saveToDisk();
    return { deletedCount: 0 };
  };

  // --- BANNER OVERRIDES ---
  Banner.init = async () => true;
  Banner.find = () => {
    const run = async () => inMemoryDb.banners.map(makeDoc);
    return createQuery(run());
  };
  Banner.findById = async (id) => {
    const b = inMemoryDb.banners.find((x) => String(x.id) === String(id) || String(x._id) === String(id));
    return makeDoc(b);
  };
  Banner.create = async (data) => {
    const newId = generateId();
    const newBan = {
      ...data,
      _id: newId,
      id: newId,
      active: data.active !== undefined ? data.active : true,
      displayOrder: data.displayOrder || inMemoryDb.banners.length + 1,
      createdAt: new Date().toISOString(),
    };
    inMemoryDb.banners.push(newBan);
    saveToDisk();
    return makeDoc(newBan);
  };
  Banner.findByIdAndUpdate = async (id, update) => {
    const idx = inMemoryDb.banners.findIndex(
      (x) => String(x.id) === String(id) || String(x._id) === String(id)
    );
    if (idx === -1) return null;
    inMemoryDb.banners[idx] = {
      ...inMemoryDb.banners[idx],
      ...update,
    };
    saveToDisk();
    return makeDoc(inMemoryDb.banners[idx]);
  };
  Banner.findByIdAndDelete = async (id) => {
    const idx = inMemoryDb.banners.findIndex(
      (x) => String(x.id) === String(id) || String(x._id) === String(id)
    );
    if (idx === -1) return null;
    const [deleted] = inMemoryDb.banners.splice(idx, 1);
    saveToDisk();
    return makeDoc(deleted);
  };

  console.log('[localStore] Complete resilient database activated with 56 products, admin, banners, notifications, tickets & custom requests.');
}

module.exports = { activateLocalStore, isActivated: () => isActivatedState };
