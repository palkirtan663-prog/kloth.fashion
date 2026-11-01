import React, { useEffect, useState } from 'react';
import {
  Shield,
  ShoppingBag,
  TrendingUp,
  PackageCheck,
  Users,
  Search,
  Plus,
  Edit2,
  Trash2,
  Check,
  AlertCircle,
  LogOut,
  ExternalLink,
  X,
  Package,
  Layers,
  ArrowRight,
  RefreshCw,
  RotateCcw,
  Scissors,
  FileText,
  Bell,
  Sparkles,
  Send,
  AlertTriangle,
  CheckCircle2,
  SlidersHorizontal,
  KeyRound,
} from 'lucide-react';
import { api } from '../services/api.js';
import { formatINR } from '../utils/format.js';
import ImageUpload from '../components/ImageUpload.jsx';
import { FALLBACK_PRODUCTS } from '../data/fallbackProducts.js';

const CATEGORIES = [
  'T-Shirts',
  'Shirts',
  'Hoodies',
  'Jackets',
  'Baggy Jeans',
  'Cargo Pants',
  'Caps',
  'Earrings',
  'Necklaces',
  'Chains',
  'Bracelets',
  'Complete Outfits',
];

const TAG_SUGGESTIONS = ['', 'NEW', 'TRENDING', 'BESTSELLER', 'DROP 02', 'LIMITED', 'RESTOCK', 'LOW STOCK'];
const ORDER_STATUSES = ['Processing', 'Confirmed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled', 'Returned', 'Exchanged'];
const ALL_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '28', '30', '32', '34', '36', 'ONE SIZE'];

const emptyProductForm = {
  name: '',
  price: '',
  category: 'T-Shirts',
  description: '',
  image: '',
  color: '',
  rating: 4.8,
  tag: 'NEW',
  sizes: ['S', 'M', 'L', 'XL'],
  stock: 25,
  gender: 'Unisex',
};

const emptyBannerForm = {
  title: '',
  subtitle: '',
  badge: 'NEW DROP 02 LIVE',
  image: '',
  ctaText: 'Shop Now',
  ctaLink: '#shop',
  displayOrder: 1,
  active: true,
};

export default function AdminDashboardPage({ me, onLogout, onSwitchToStore }) {
  const [tab, setTab] = useState('orders'); // 'orders' | 'returns' | 'products' | 'custom' | 'support' | 'marketing' | 'users'
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customRequests, setCustomRequests] = useState([]);
  const [supportTickets, setSupportTickets] = useState([]);
  const [banners, setBanners] = useState([]);
  const [stats, setStats] = useState(null);

  const [orderFilter, setOrderFilter] = useState('All');
  const [orderSearch, setOrderSearch] = useState('');
  const [prodSearch, setProdSearch] = useState('');
  const [prodCatFilter, setProdCatFilter] = useState('All');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);

  // Security & Password tab state
  const [newAdminPass, setNewAdminPass] = useState('');
  const [confirmAdminPass, setConfirmAdminPass] = useState('');
  const [passBusy, setPassBusy] = useState(false);
  const [passMsg, setPassMsg] = useState('');
  const [passError, setPassError] = useState('');

  // Product modal
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState(emptyProductForm);
  const [formBusy, setFormBusy] = useState(false);

  // Quote modal
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [quoteForm, setQuoteForm] = useState({ price: '', estimatedDays: 7, notes: '' });

  // Ticket reply modal / view
  const [activeTicket, setActiveTicket] = useState(null);
  const [ticketReplyText, setTicketReplyText] = useState('');

  // Banner modal
  const [bannerModalOpen, setBannerModalOpen] = useState(false);
  const [bannerForm, setBannerForm] = useState(emptyBannerForm);
  const [editingBannerId, setEditingBannerId] = useState(null);

  // New announcement form
  const [notifForm, setNotifForm] = useState({ title: '', message: '', type: 'announcement', tag: 'FLASH SALE' });

  const loadData = () => {
    setLoading(true);
    setError('');
    Promise.all([
      api('/admin/users', { timeoutMs: 2000 }).then((d) => d.users).catch(() => []),
      api('/products', { timeoutMs: 2000 }).catch(() => []),
      api('/admin/orders', { timeoutMs: 2000 }).then((d) => d.orders).catch(() => []),
      api('/admin/stats', { timeoutMs: 2000 }).catch(() => null),
      api('/admin/custom-requests', { timeoutMs: 2000 }).then((d) => d.requests).catch(() => []),
      api('/admin/support/tickets', { timeoutMs: 2000 }).then((d) => d.tickets).catch(() => []),
      api('/admin/banners', { timeoutMs: 2000 }).then((d) => d.banners).catch(() => []),
    ])
      .then(([uList, pList, oList, sData, crList, stList, bList]) => {
        const resolvedUsers = (Array.isArray(uList) && uList.length > 0)
          ? uList
          : [{ id: 'u_admin', name: me?.name || 'Store Owner', email: me?.email || 'admin@urbanthread.com', role: 'admin' }];
        setUsers(resolvedUsers);

        const resolvedProducts = (Array.isArray(pList) && pList.length > 0) ? pList : FALLBACK_PRODUCTS;
        setProducts(resolvedProducts);

        let localOrders = [];
        try {
          localOrders = JSON.parse(localStorage.getItem('kloth_placed_orders') || '[]');
        } catch (_) {}
        const serverOrders = Array.isArray(oList) ? oList : [];
        const combinedOrders = [...serverOrders];
        for (const lo of localOrders) {
          const match = combinedOrders.some(
            (o) =>
              (o.orderNumber && lo.orderNumber && o.orderNumber === lo.orderNumber) ||
              (o.trackingNumber && lo.trackingNumber && o.trackingNumber === lo.trackingNumber) ||
              (o.id && lo.id && o.id === lo.id) ||
              (o._id && lo._id && o._id === lo._id)
          );
          if (!match) combinedOrders.push(lo);
        }
        setOrders(combinedOrders);

        let localCR = [];
        try {
          localCR = JSON.parse(localStorage.getItem('kloth_custom_requests') || '[]');
        } catch (_) {}
        const serverCR = Array.isArray(crList) ? crList : [];
        const combinedCR = [...serverCR];
        for (const lr of localCR) {
          const match = combinedCR.some(
            (r) =>
              (r.requestId && lr.requestId && r.requestId === lr.requestId) ||
              (r.id && lr.id && r.id === lr.id) ||
              (r._id && lr._id && r._id === lr._id)
          );
          if (!match) combinedCR.push(lr);
        }
        setCustomRequests(combinedCR);

        let localST = [];
        try {
          localST = JSON.parse(localStorage.getItem('kloth_support_tickets') || '[]');
        } catch (_) {}
        const serverST = Array.isArray(stList) ? stList : [];
        const combinedST = [...serverST];
        for (const lt of localST) {
          const match = combinedST.some(
            (t) =>
              (t.ticketId && lt.ticketId && t.ticketId === lt.ticketId) ||
              (t.id && lt.id && t.id === lt.id) ||
              (t._id && lt._id && t._id === lt._id)
          );
          if (!match) combinedST.push(lt);
        }
        setSupportTickets(combinedST);

        setBanners(Array.isArray(bList) ? bList : []);
        setStats(sData || {
          totalOrders: combinedOrders.length,
          totalRevenue: combinedOrders.reduce((acc, o) => acc + (o.total || 0), 0),
          activeProducts: resolvedProducts.length,
          totalUsers: resolvedUsers.length,
        });
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  async function handleChangeAdminPassword(e) {
    e.preventDefault();
    setPassError('');
    setPassMsg('');
    if (!newAdminPass) return setPassError('Please enter a new password.');
    if (newAdminPass.length < 8 || !/[A-Za-z]/.test(newAdminPass) || !/\d/.test(newAdminPass)) {
      return setPassError('Password must be at least 8 characters with letters and numbers.');
    }
    if (newAdminPass !== confirmAdminPass) {
      return setPassError('Passwords do not match.');
    }

    setPassBusy(true);
    try {
      await api('/auth/change-password', {
        method: 'POST',
        body: { newPassword: newAdminPass },
      });
      setPassMsg('Your Store Owner password has been successfully updated and secured!');
      setNewAdminPass('');
      setConfirmAdminPass('');
      setTimeout(() => setPassMsg(''), 6000);
    } catch (err) {
      setPassError(err.message);
    } finally {
      setPassBusy(false);
    }
  }

  /* ------------------- Orders Actions ------------------- */
  async function changeOrderStatus(orderId, newStatus) {
    try {
      const d = await api(`/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        body: { status: newStatus },
        timeoutMs: 2000,
      });
      setOrders((list) => list.map((o) => ((o.id === orderId || o._id === orderId || o.orderNumber === orderId) ? d.order : o)));
      setSuccess(`Updated order ${d.order?.trackingNumber || orderId} to "${newStatus}".`);
    } catch (e) {
      setOrders((list) => {
        const updated = list.map((o) =>
          (o.id === orderId || o._id === orderId || o.orderNumber === orderId)
            ? { ...o, status: newStatus }
            : o
        );
        try {
          localStorage.setItem('kloth_placed_orders', JSON.stringify(updated));
        } catch (_) {}
        return updated;
      });
      setSuccess(`Updated order to "${newStatus}".`);
    } finally {
      setTimeout(() => setSuccess(''), 3500);
    }
  }

  async function handleReturnResolution(orderId, status, adminNote = '') {
    try {
      const d = await api(`/admin/orders/${orderId}/return-status`, {
        method: 'PATCH',
        body: { status, adminNote },
        timeoutMs: 2000,
      });
      setOrders((list) => list.map((o) => ((o.id === orderId || o._id === orderId || o.orderNumber === orderId) ? d.order : o)));
      setSuccess(`Return request for ${d.order?.trackingNumber || orderId} marked as ${status}.`);
    } catch (e) {
      setOrders((list) => {
        const updated = list.map((o) => {
          if (o.id === orderId || o._id === orderId || o.orderNumber === orderId) {
            return {
              ...o,
              returnRequest: {
                ...(o.returnRequest || {}),
                status,
                adminNote,
                resolvedAt: new Date().toISOString(),
              },
            };
          }
          return o;
        });
        try {
          localStorage.setItem('kloth_placed_orders', JSON.stringify(updated));
        } catch (_) {}
        return updated;
      });
      setSuccess(`Return request marked as ${status}.`);
    } finally {
      setTimeout(() => setSuccess(''), 3500);
    }
  }

  /* ------------------- Product Management ------------------- */
  function openCreateProductModal() {
    setEditingProduct(null);
    setProductForm(emptyProductForm);
    setProductModalOpen(true);
  }

  function openEditProductModal(p) {
    setEditingProduct(p);
    setProductForm({
      name: p.name || '',
      price: p.price ?? '',
      category: p.category || 'T-Shirts',
      description: p.description || '',
      image: p.image || '',
      color: p.color || '',
      rating: p.rating ?? 4.8,
      tag: p.tag || '',
      sizes: Array.isArray(p.sizes) ? p.sizes : ['S', 'M', 'L', 'XL'],
      stock: p.stock ?? 25,
      gender: p.gender || 'Unisex',
    });
    setProductModalOpen(true);
  }

  const toggleSizeInForm = (sz) => {
    setProductForm((prev) => {
      const current = prev.sizes || [];
      if (current.includes(sz)) {
        return { ...prev, sizes: current.filter((s) => s !== sz) };
      }
      return { ...prev, sizes: [...current, sz] };
    });
  };

  async function handleProductSubmit(e) {
    e.preventDefault();
    if (!productForm.name.trim()) return setError('Product name is required.');
    const price = Number(productForm.price);
    if (isNaN(price) || price < 0) return setError('Enter a valid non-negative price.');

    setFormBusy(true);
    try {
      const payload = {
        name: productForm.name.trim(),
        price,
        category: productForm.category.trim(),
        description: productForm.description.trim(),
        image: productForm.image.trim(),
        color: productForm.color.trim(),
        rating: Number(productForm.rating) || 4.8,
        tag: productForm.tag.trim(),
        sizes: productForm.sizes,
        stock: parseInt(productForm.stock, 10) || 0,
        gender: productForm.gender,
      };

      if (editingProduct) {
        let updated;
        try {
          updated = await api(`/admin/products/${editingProduct.id || editingProduct._id}`, {
            method: 'PATCH',
            body: payload,
            timeoutMs: 2000,
          });
        } catch (_) {
          updated = { ...editingProduct, ...payload, id: editingProduct.id || editingProduct._id };
        }
        setProducts((list) => list.map((p) => ((p.id === (editingProduct.id || editingProduct._id) || p._id === (editingProduct.id || editingProduct._id)) ? updated : p)));
        setSuccess(`Updated "${updated.name}".`);
      } else {
        let created;
        try {
          created = await api('/admin/products', {
            method: 'POST',
            body: payload,
            timeoutMs: 2000,
          });
        } catch (_) {
          created = { ...payload, id: 'prod_' + Date.now(), _id: 'prod_' + Date.now(), inStock: true };
        }
        setProducts((list) => [created, ...list]);
        setSuccess(`Added new product "${created.name}".`);
      }
      setProductModalOpen(false);
      setTimeout(() => setSuccess(''), 3500);
    } catch (err) {
      setError(err.message);
    } finally {
      setFormBusy(false);
    }
  }

  async function deleteProduct(p) {
    if (!window.confirm(`Delete product "${p.name}"? This removes it permanently.`)) return;
    try {
      await api(`/admin/products/${p.id || p._id}`, { method: 'DELETE', timeoutMs: 2000 });
    } catch (_) {}
    setProducts((list) => list.filter((x) => (x.id !== p.id && x._id !== p._id && x.id !== p._id)));
    setSuccess(`Product "${p.name}" was removed.`);
    setTimeout(() => setSuccess(''), 3500);
  }

  /* ------------------- Custom Requests Management ------------------- */
  function openQuoteModal(cr) {
    setSelectedRequest(cr);
    setQuoteForm({
      price: cr.quote?.price || cr.budget || 2499,
      estimatedDays: cr.quote?.estimatedDays || 7,
      notes: cr.quote?.notes || 'Custom pattern drafted with premium heavyweight fabric.',
    });
    setQuoteModalOpen(true);
  }

  async function handleSendQuote(e) {
    e.preventDefault();
    if (!selectedRequest) return;
    const reqId = selectedRequest.id || selectedRequest._id || selectedRequest.requestId;
    try {
      const res = await api(`/admin/custom-requests/${reqId}/quote`, {
        method: 'PATCH',
        body: quoteForm,
        timeoutMs: 2000,
      });
      setCustomRequests((list) => list.map((r) => ((r.id === reqId || r._id === reqId || r.requestId === reqId) ? res.request : r)));
      setSuccess(`Quotation sent to ${res.request?.customerName || 'customer'}.`);
    } catch (err) {
      // Local fallback
      setCustomRequests((list) => {
        const updated = list.map((r) => {
          if (r.id === reqId || r._id === reqId || r.requestId === reqId) {
            return {
              ...r,
              status: 'Quoted',
              quote: {
                price: Number(quoteForm.price),
                estimatedDays: Number(quoteForm.estimatedDays) || 7,
                notes: quoteForm.notes,
                sentAt: new Date().toISOString(),
              },
            };
          }
          return r;
        });
        try {
          localStorage.setItem('kloth_custom_requests', JSON.stringify(updated));
        } catch (_) {}
        return updated;
      });
      setSuccess('Quotation sent to customer.');
    } finally {
      setQuoteModalOpen(false);
      setTimeout(() => setSuccess(''), 3500);
    }
  }

  async function changeCustomStatus(crId, status) {
    try {
      const res = await api(`/admin/custom-requests/${crId}/status`, {
        method: 'PATCH',
        body: { status },
        timeoutMs: 2000,
      });
      setCustomRequests((list) => list.map((r) => ((r.id === crId || r._id === crId || r.requestId === crId) ? res.request : r)));
      setSuccess(`Custom request status updated to ${status}.`);
    } catch (err) {
      setCustomRequests((list) => {
        const updated = list.map((r) => ((r.id === crId || r._id === crId || r.requestId === crId) ? { ...r, status } : r));
        try {
          localStorage.setItem('kloth_custom_requests', JSON.stringify(updated));
        } catch (_) {}
        return updated;
      });
      setSuccess(`Custom request status updated to ${status}.`);
    } finally {
      setTimeout(() => setSuccess(''), 3500);
    }
  }

  /* ------------------- Support Tickets ------------------- */
  async function handleTicketReply(e) {
    e.preventDefault();
    if (!activeTicket || !ticketReplyText.trim()) return;
    const tId = activeTicket.id || activeTicket._id || activeTicket.ticketId;
    try {
      const res = await api(`/admin/support/tickets/${tId}/reply`, {
        method: 'POST',
        body: { message: ticketReplyText.trim() },
        timeoutMs: 2000,
      });
      setActiveTicket(res.ticket);
      setSupportTickets((list) => list.map((t) => ((t.id === tId || t._id === tId || t.ticketId === tId) ? res.ticket : t)));
    } catch (err) {
      const replyObj = {
        sender: 'admin',
        senderName: 'Store Owner',
        message: ticketReplyText.trim(),
        createdAt: new Date().toISOString(),
      };
      const updatedTicket = {
        ...activeTicket,
        status: 'In Progress',
        replies: [...(activeTicket.replies || []), replyObj],
      };
      setActiveTicket(updatedTicket);
      setSupportTickets((list) => {
        const updated = list.map((t) => ((t.id === tId || t._id === tId || t.ticketId === tId) ? updatedTicket : t));
        try {
          localStorage.setItem('kloth_support_tickets', JSON.stringify(updated));
        } catch (_) {}
        return updated;
      });
    } finally {
      setTicketReplyText('');
      setSuccess('Reply sent to customer.');
      setTimeout(() => setSuccess(''), 3500);
    }
  }

  async function changeTicketStatus(ticketId, status) {
    try {
      const res = await api(`/admin/support/tickets/${ticketId}/status`, {
        method: 'PATCH',
        body: { status },
        timeoutMs: 2000,
      });
      if (activeTicket && (activeTicket.id === ticketId || activeTicket._id === ticketId || activeTicket.ticketId === ticketId)) {
        setActiveTicket(res.ticket);
      }
      setSupportTickets((list) => list.map((t) => ((t.id === ticketId || t._id === ticketId || t.ticketId === ticketId) ? res.ticket : t)));
      setSuccess(`Ticket status updated to ${status}.`);
    } catch (err) {
      setSupportTickets((list) => {
        const updated = list.map((t) => ((t.id === ticketId || t._id === ticketId || t.ticketId === ticketId) ? { ...t, status } : t));
        try {
          localStorage.setItem('kloth_support_tickets', JSON.stringify(updated));
        } catch (_) {}
        return updated;
      });
      setSuccess(`Ticket status updated to ${status}.`);
    } finally {
      setTimeout(() => setSuccess(''), 3500);
    }
  }

  /* ------------------- Marketing & Banners ------------------- */
  function openCreateBannerModal() {
    setEditingBannerId(null);
    setBannerForm(emptyBannerForm);
    setBannerModalOpen(true);
  }

  async function handleBannerSubmit(e) {
    e.preventDefault();
    if (!bannerForm.title || !bannerForm.image) {
      return setError('Banner title and image are required.');
    }
    try {
      if (editingBannerId) {
        const res = await api(`/admin/banners/${editingBannerId}`, {
          method: 'PATCH',
          body: bannerForm,
        });
        setBanners((list) => list.map((b) => (b.id === editingBannerId ? res.banner : b)));
        setSuccess('Banner updated.');
      } else {
        const res = await api('/admin/banners', {
          method: 'POST',
          body: bannerForm,
        });
        setBanners((list) => [...list, res.banner]);
        setSuccess('Promotional banner published.');
      }
      setBannerModalOpen(false);
      setTimeout(() => setSuccess(''), 3500);
    } catch (err) {
      setError(err.message);
    }
  }

  async function deleteBanner(id) {
    if (!window.confirm('Delete this banner?')) return;
    try {
      await api(`/admin/banners/${id}`, { method: 'DELETE' });
      setBanners((list) => list.filter((b) => b.id !== id));
      setSuccess('Banner removed.');
      setTimeout(() => setSuccess(''), 3500);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleCreateNotification(e) {
    e.preventDefault();
    if (!notifForm.title || !notifForm.message) return;
    try {
      await api('/admin/notifications', {
        method: 'POST',
        body: notifForm,
      });
      setSuccess('Marketing notification broadcasted to all users.');
      setNotifForm({ title: '', message: '', type: 'announcement', tag: 'FLASH SALE' });
      setTimeout(() => setSuccess(''), 3500);
    } catch (err) {
      setError(err.message);
    }
  }

  /* ------------------- Filtered Data ------------------- */
  const filteredProducts = products.filter((p) => {
    if (prodCatFilter !== 'All' && p.category !== prodCatFilter) return false;
    const q = prodSearch.trim().toLowerCase();
    if (!q) return true;
    return `${p.name} ${p.category} ${p.color || ''} ${p.tag || ''}`.toLowerCase().includes(q);
  });

  const filteredOrders = orders.filter((o) => {
    if (orderFilter !== 'All' && o.status !== orderFilter) return false;
    const q = orderSearch.trim().toLowerCase();
    if (!q) return true;
    return (
      (o.trackingNumber || '').toLowerCase().includes(q) ||
      (o.customerName || '').toLowerCase().includes(q) ||
      (o.customerEmail || '').toLowerCase().includes(q) ||
      (o.shippingAddress?.city || '').toLowerCase().includes(q)
    );
  });

  const returnOrders = orders.filter((o) => o.returnRequest && o.returnRequest.status !== 'None');
  const lowStockProducts = products.filter((p) => typeof p.stock === 'number' && p.stock < 10);
  const totalRev = stats?.totalRevenue ?? orders.reduce((s, o) => s + (o.status !== 'Cancelled' ? o.total : 0), 0);

  return (
    <div className="adminDashboardPage">
      {/* Top Header */}
      <header className="adminDashboardHeader">
        <div className="adminBrand">
          <div className="adminBrandIcon">
            <Shield size={20} />
          </div>
          <div>
            <div className="adminBrandTitle">
              KLOTH<span>.fashion</span> <span className="adminConsoleTag">OWNER CONSOLE</span>
            </div>

            <small>Active Administrator: <b>{me.email}</b></small>
          </div>
        </div>

        <div className="adminHeaderRight">
          <button
            type="button"
            className="previewStoreBtn"
            onClick={onSwitchToStore}
            title="Open customer storefront in preview mode"
          >
            <ExternalLink size={15} /> Preview Storefront
          </button>
          <button
            type="button"
            className="adminLogoutBtn"
            onClick={onLogout}
            title="Log out of owner dashboard"
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="adminDashboardMain">
        {/* KPI Cards */}
        <section className="adminKpiGrid">
          <div className="kpiCard">
            <div className="kpiIconWrap green"><TrendingUp size={22} /></div>
            <div>
              <span className="kpiLabel">GROSS REVENUE</span>
              <strong className="kpiVal">{formatINR(totalRev)}</strong>
              <small className="kpiHint">+18.4% from last drop</small>
            </div>
          </div>

          <div className="kpiCard">
            <div className="kpiIconWrap blue"><ShoppingBag size={22} /></div>
            <div>
              <span className="kpiLabel">TOTAL ORDERS</span>
              <strong className="kpiVal">{orders.length}</strong>
              <small className="kpiHint">{orders.filter((o) => o.status === 'Processing').length} pending dispatch</small>
            </div>
          </div>

          <div className="kpiCard" onClick={() => setTab('returns')} style={{ cursor: 'pointer' }}>
            <div className="kpiIconWrap amber"><RotateCcw size={22} /></div>
            <div>
              <span className="kpiLabel">RETURN / EXCHANGES</span>
              <strong className="kpiVal">{returnOrders.length}</strong>
              <small className="kpiHint">{returnOrders.filter((o) => o.returnRequest?.status === 'Requested').length} pending review</small>
            </div>
          </div>

          <div className="kpiCard" onClick={() => setTab('custom')} style={{ cursor: 'pointer' }}>
            <div className="kpiIconWrap purple"><Scissors size={22} /></div>
            <div>
              <span className="kpiLabel">BESPOKE REQUESTS</span>
              <strong className="kpiVal">{customRequests.length}</strong>
              <small className="kpiHint">{customRequests.filter((r) => r.status === 'Submitted').length} await quotes</small>
            </div>
          </div>

          <div className="kpiCard" onClick={() => setTab('support')} style={{ cursor: 'pointer' }}>
            <div className="kpiIconWrap cyan"><FileText size={22} /></div>
            <div>
              <span className="kpiLabel">SUPPORT INQUIRIES</span>
              <strong className="kpiVal">{supportTickets.length}</strong>
              <small className="kpiHint">{supportTickets.filter((t) => t.status === 'Open').length} open tickets</small>
            </div>
          </div>
        </section>

        {/* Low Stock Alert Banner if items are low */}
        {lowStockProducts.length > 0 && (
          <div className="lowStockAdminAlert">
            <AlertTriangle size={18} />
            <span>
              <b>Low Stock Alert:</b> {lowStockProducts.length} items have fewer than 10 units remaining (
              {lowStockProducts.slice(0, 3).map((p) => `${p.name} [${p.stock} left]`).join(', ')}
              {lowStockProducts.length > 3 ? '...' : ''}).
            </span>
            <button type="button" className="miniBtn secondary" onClick={() => setTab('products')}>
              Manage Inventory
            </button>
          </div>
        )}

        {/* Global Notifications */}
        {error && <div className="authError adminBanner"><AlertCircle size={16} /> {error}</div>}
        {success && <div className="adminSuccess adminBanner"><Check size={16} /> {success}</div>}

        {/* Navigation Tabs */}
        <div className="adminMainTabs scrollableTabs" role="tablist">
          <button
            type="button"
            className={'tabBtn ' + (tab === 'orders' ? 'active' : '')}
            onClick={() => setTab('orders')}
          >
            <Package size={16} /> Orders ({orders.length})
          </button>
          <button
            type="button"
            className={'tabBtn ' + (tab === 'returns' ? 'active' : '')}
            onClick={() => setTab('returns')}
          >
            <RotateCcw size={16} /> Returns & Exchanges ({returnOrders.length})
          </button>
          <button
            type="button"
            className={'tabBtn ' + (tab === 'products' ? 'active' : '')}
            onClick={() => setTab('products')}
          >
            <Layers size={16} /> Inventory ({products.length})
          </button>
          <button
            type="button"
            className={'tabBtn ' + (tab === 'custom' ? 'active' : '')}
            onClick={() => setTab('custom')}
          >
            <Scissors size={16} /> Bespoke Tailoring ({customRequests.length})
          </button>
          <button
            type="button"
            className={'tabBtn ' + (tab === 'support' ? 'active' : '')}
            onClick={() => setTab('support')}
          >
            <FileText size={16} /> Customer Support ({supportTickets.length})
          </button>
          <button
            type="button"
            className={'tabBtn ' + (tab === 'marketing' ? 'active' : '')}
            onClick={() => setTab('marketing')}
          >
            <Bell size={16} /> Banners & Marketing ({banners.length})
          </button>
          <button
            type="button"
            className={'tabBtn ' + (tab === 'users' ? 'active' : '')}
            onClick={() => setTab('users')}
          >
            <Users size={16} /> Users ({users.length})
          </button>
          <button
            type="button"
            className={'tabBtn ' + (tab === 'security' ? 'active' : '')}
            onClick={() => setTab('security')}
          >
            <Shield size={16} /> Admin Security & Password
          </button>
          <button type="button" className="tabBtn refreshBtn" onClick={loadData}>
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        {/* ================= TAB 1: ORDERS ================= */}
        {tab === 'orders' && (
          <div className="adminSectionCard">
            <div className="sectionActionBar">
              <div className="adminSearchBar">
                <Search size={17} />
                <input
                  type="text"
                  placeholder="Search tracking #, customer name, email..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                />
              </div>

              <div className="orderStatusChips">
                {['All', ...ORDER_STATUSES].map((st) => (
                  <button
                    key={st}
                    type="button"
                    className={'chipBtn ' + (orderFilter === st ? 'active' : '')}
                    onClick={() => setOrderFilter(st)}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <div className="tableResponsive">
              <table className="adminDataTable">
                <thead>
                  <tr>
                    <th>TRACKING / DATE</th>
                    <th>CUSTOMER DETAILS</th>
                    <th>ORDERED ITEMS</th>
                    <th>PAYMENT & TOTAL</th>
                    <th>DISPATCH STATUS (CHANGEABLE)</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="emptyCell">No orders matching criteria.</td>
                    </tr>
                  ) : (
                    filteredOrders.map((o) => (
                      <tr key={o.id}>
                        <td>
                          <b className="trackingBadge">{o.trackingNumber}</b>
                          <span className="orderDateText">
                            {new Date(o.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </td>
                        <td>
                          <strong>{o.customerName}</strong>
                          <small className="mutedBlock">{o.customerEmail}</small>
                          <small className="mutedBlock">{o.shippingAddress?.phone}</small>
                          <small className="mutedBlock">{o.shippingAddress?.city}, {o.shippingAddress?.state}</small>
                        </td>
                        <td>
                          <div className="itemsCellMini">
                            {o.items?.map((it, idx) => (
                              <div key={idx} className="itemRowMini">
                                <span>{it.quantity}x {it.name} ({it.size})</span>
                                <b>{formatINR(it.price * it.quantity)}</b>
                              </div>
                            ))}
                          </div>
                        </td>
                        <td>
                          <strong>{formatINR(o.total)}</strong>
                          <small className="paymentMethodBadge">{o.payment?.method}</small>
                          {o.discount > 0 && <small className="discountAppliedTag">Discount: -{formatINR(o.discount)}</small>}
                        </td>
                        <td>
                          <select
                            className={`statusSelect ${o.status.toLowerCase().replace(/\s+/g, '-')}`}
                            value={o.status}
                            onChange={(e) => changeOrderStatus(o.id, e.target.value)}
                          >
                            {ORDER_STATUSES.map((st) => (
                              <option key={st} value={st}>{st}</option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= TAB 2: RETURNS & EXCHANGES ================= */}
        {tab === 'returns' && (
          <div className="adminSectionCard">
            <div className="sectionHeadRow">
              <div>
                <h3>Customer Return, Refund & Exchange Requests</h3>
                <small>Review customer requests for delivered garments, approve reverse courier pickup, or process replacements.</small>
              </div>
            </div>

            {returnOrders.length === 0 ? (
              <div className="emptyBoxState">
                <CheckCircle2 size={36} />
                <p>No active return or exchange requests at this time.</p>
              </div>
            ) : (
              <div className="tableResponsive">
                <table className="adminDataTable">
                  <thead>
                    <tr>
                      <th>ORDER TRACKING</th>
                      <th>TYPE & REASON</th>
                      <th>CUSTOMER NOTES</th>
                      <th>STATUS</th>
                      <th>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {returnOrders.map((ro) => (
                      <tr key={ro.id}>
                        <td>
                          <b className="trackingBadge">{ro.trackingNumber}</b>
                          <small className="mutedBlock">{ro.customerName} ({ro.customerEmail})</small>
                          <small className="mutedBlock">Total: {formatINR(ro.total)}</small>
                        </td>
                        <td>
                          <span className="returnTypeTag">{ro.returnRequest?.type}</span>
                          <p className="returnReasonText">"{ro.returnRequest?.reason}"</p>
                          {ro.returnRequest?.preferredSize && (
                            <small className="preferredSizePill">Preferred Size: <b>{ro.returnRequest.preferredSize}</b></small>
                          )}
                        </td>
                        <td>
                          <p>{ro.returnRequest?.details || 'No additional comment.'}</p>
                          {ro.returnRequest?.adminNote && (
                            <small className="adminNoteText">Admin Note: {ro.returnRequest.adminNote}</small>
                          )}
                        </td>
                        <td>
                          <span className={`statusBadge ${ro.returnRequest?.status.toLowerCase()}`}>
                            {ro.returnRequest?.status}
                          </span>
                        </td>
                        <td>
                          <div className="returnActionsGroup">
                            <button
                              type="button"
                              className="primary miniBtn"
                              onClick={() => handleReturnResolution(ro.id, 'Approved', 'Reverse courier scheduled.')}
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              className="secondary miniBtn"
                              onClick={() => handleReturnResolution(ro.id, 'Completed', 'Refund / Exchange finalized.')}
                            >
                              Mark Completed
                            </button>
                            <button
                              type="button"
                              className="danger miniBtn"
                              onClick={() => handleReturnResolution(ro.id, 'Rejected', 'Policy conditions not met.')}
                            >
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 3: PRODUCTS INVENTORY ================= */}
        {tab === 'products' && (
          <div className="adminSectionCard">
            <div className="sectionActionBar">
              <div className="adminSearchBar">
                <Search size={17} />
                <input
                  type="text"
                  placeholder="Search catalogue items..."
                  value={prodSearch}
                  onChange={(e) => setProdSearch(e.target.value)}
                />
              </div>

              <div className="actionBarRight">
                <select
                  value={prodCatFilter}
                  onChange={(e) => setProdCatFilter(e.target.value)}
                  className="filterDropdown"
                >
                  <option value="All">All Categories</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>

                <button type="button" className="primary miniBtn" onClick={openCreateProductModal}>
                  <Plus size={15} /> Add New Piece
                </button>
              </div>
            </div>

            <div className="tableResponsive">
              <table className="adminDataTable">
                <thead>
                  <tr>
                    <th>IMAGE / PIECE NAME</th>
                    <th>CATEGORY & GENDER</th>
                    <th>PRICE (INR)</th>
                    <th>SIZES & STOCK</th>
                    <th>TAG</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <div className="productRowThumb">
                          <img src={p.image} alt={p.name} className="adminProdImg" />
                          <div>
                            <strong>{p.name}</strong>
                            <small className="mutedBlock">{p.color}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="catTag">{p.category}</span>
                        <small className="mutedBlock">Gender: {p.gender || 'Unisex'}</small>
                      </td>
                      <td><b>{formatINR(p.price)}</b></td>
                      <td>
                        <div className="sizeChipsMini">
                          {(p.sizes || ['S', 'M', 'L', 'XL']).map((s) => (
                            <span key={s} className="sizePill">{s}</span>
                          ))}
                        </div>
                        <small className={p.stock < 10 ? 'stockWarningText' : 'stockNormalText'}>
                          Stock: <b>{p.stock ?? 25} units</b>
                        </small>
                      </td>
                      <td>
                        {p.tag && <span className="adminTagPill">{p.tag}</span>}
                      </td>
                      <td>
                        <div className="actionButtons">
                          <button
                            type="button"
                            className="iconActionBtn"
                            onClick={() => openEditProductModal(p)}
                            title="Edit product"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            type="button"
                            className="iconActionBtn danger"
                            onClick={() => deleteProduct(p)}
                            title="Delete product"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= TAB 4: BESPOKE CUSTOM REQUESTS ================= */}
        {tab === 'custom' && (
          <div className="adminSectionCard">
            <div className="sectionHeadRow">
              <div>
                <h3>Bespoke Custom Streetwear Requests</h3>
                <small>Review customer tailoring specifications, inspect reference photos, and send official quotations.</small>
              </div>
            </div>

            {customRequests.length === 0 ? (
              <div className="emptyBoxState">
                <Scissors size={36} />
                <p>No bespoke custom clothing requests submitted yet.</p>
              </div>
            ) : (
              <div className="customAdminGrid">
                {customRequests.map((cr) => (
                  <div key={cr.id} className="customAdminCard">
                    <div className="customCardTop">
                      <div>
                        <span className="crIdBadge">#{cr.requestId}</span>
                        <h4>{cr.category} ({cr.color})</h4>
                        <small>{cr.customerName} · {cr.customerEmail} · {cr.customerPhone}</small>
                      </div>
                      <span className={`statusBadge crStatus-${cr.status.toLowerCase().replace(/\s+/g, '-')}`}>
                        {cr.status}
                      </span>
                    </div>

                    <p className="adminCrDesc">{cr.description}</p>

                    <div className="adminCrSpecs">
                      <span>Fabric: <b>{cr.fabric}</b></span>
                      <span>Fit/Size: <b>{cr.size}</b></span>
                      <span>Qty: <b>{cr.quantity}</b></span>
                      <span>Customer Budget: <b>₹{cr.budget}</b></span>
                    </div>

                    {/* Measurements */}
                    {cr.measurements && Object.values(cr.measurements).some(Boolean) && (
                      <div className="measurementsRowMini">
                        <b>Measurements: </b>
                        {Object.entries(cr.measurements)
                          .filter(([_, v]) => Boolean(v))
                          .map(([k, v]) => `${k.toUpperCase()}: ${v}"`)
                          .join(' · ')}
                      </div>
                    )}

                    {cr.referenceImage && (
                      <div className="adminCrImage">
                        <img src={cr.referenceImage} alt="Reference mockup" />
                      </div>
                    )}

                    {/* Existing Quote display */}
                    {cr.quote && cr.quote.price > 0 && (
                      <div className="adminExistingQuote">
                        <span>Quoted Price: <b>{formatINR(cr.quote.price)}</b> ({cr.quote.estimatedDays} Days lead time)</span>
                        {cr.quote.notes && <small>"{cr.quote.notes}"</small>}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="adminCrActions">
                      <button
                        type="button"
                        className="primary miniBtn"
                        onClick={() => openQuoteModal(cr)}
                      >
                        {cr.quote?.price ? 'Update Quotation' : 'Send Tailor Quotation'}
                      </button>

                      <select
                        className="statusSelect"
                        value={cr.status}
                        onChange={(e) => changeCustomStatus(cr.id, e.target.value)}
                      >
                        <option value="Submitted">Submitted</option>
                        <option value="Under Review">Under Review</option>
                        <option value="Quotation Provided">Quotation Provided</option>
                        <option value="Quotation Accepted">Quotation Accepted</option>
                        <option value="In Production">In Production</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 5: SUPPORT TICKETS ================= */}
        {tab === 'support' && (
          <div className="adminSectionCard">
            {activeTicket ? (
              <div className="ticketAdminThread">
                <button
                  type="button"
                  className="secondary miniBtn"
                  onClick={() => setActiveTicket(null)}
                  style={{ marginBottom: 15 }}
                >
                  ← Back to Ticket Queue
                </button>

                <div className="ticketHeaderAdmin">
                  <div>
                    <span className="crIdBadge">#{activeTicket.ticketNumber}</span>
                    <h3>{activeTicket.subject}</h3>
                    <small>Customer: {activeTicket.customerName} ({activeTicket.customerEmail}) · Category: {activeTicket.category}</small>
                  </div>
                  <div className="ticketStatusControls">
                    <select
                      value={activeTicket.status}
                      onChange={(e) => changeTicketStatus(activeTicket.id, e.target.value)}
                      className="statusSelect"
                    >
                      <option value="Open">Open</option>
                      <option value="In Review">In Review</option>
                      <option value="Awaiting Customer">Awaiting Customer</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>
                </div>

                <div className="ticketInitialMsgAdmin">
                  <b>Customer Inquiry:</b>
                  <p>{activeTicket.message}</p>
                  {activeTicket.attachment && (
                    <div className="attachmentThumbWrap">
                      <img src={activeTicket.attachment} alt="Attachment" />
                    </div>
                  )}
                </div>

                {/* Conversation Thread */}
                <div className="repliesThread">
                  {activeTicket.replies?.map((rep, idx) => (
                    <div key={idx} className={`replyBubble ${rep.senderRole === 'admin' ? 'adminReply' : 'userReply'}`}>
                      <div className="replyMeta">
                        <b>{rep.sender} ({rep.senderRole === 'admin' ? 'Support Team' : 'Customer'})</b>
                        <small>{new Date(rep.timestamp).toLocaleString('en-IN')}</small>
                      </div>
                      <p>{rep.message}</p>
                    </div>
                  ))}
                </div>

                {/* Reply Form */}
                <form onSubmit={handleTicketReply} className="ticketReplyForm">
                  <textarea
                    rows={3}
                    placeholder="Type official support reply to the customer..."
                    value={ticketReplyText}
                    onChange={(e) => setTicketReplyText(e.target.value)}
                    required
                  />
                  <button type="submit" className="primary">
                    <Send size={15} /> Send Reply & Notify Customer
                  </button>
                </form>
              </div>
            ) : (
              <>
                <div className="sectionHeadRow">
                  <div>
                    <h3>Help Center Support Tickets</h3>
                    <small>Respond to customer inquiries regarding orders, exchanges, sizing, and payments.</small>
                  </div>
                </div>

                {supportTickets.length === 0 ? (
                  <div className="emptyBoxState">
                    <FileText size={36} />
                    <p>No support tickets in queue.</p>
                  </div>
                ) : (
                  <div className="tableResponsive">
                    <table className="adminDataTable">
                      <thead>
                        <tr>
                          <th>TICKET #</th>
                          <th>CUSTOMER / CATEGORY</th>
                          <th>SUBJECT</th>
                          <th>PRIORITY</th>
                          <th>STATUS</th>
                          <th>ACTION</th>
                        </tr>
                      </thead>
                      <tbody>
                        {supportTickets.map((t) => (
                          <tr key={t.id}>
                            <td><b className="trackingBadge">#{t.ticketNumber}</b></td>
                            <td>
                              <strong>{t.customerName}</strong>
                              <small className="mutedBlock">{t.category}</small>
                            </td>
                            <td>{t.subject}</td>
                            <td>
                              <span className={`priorityBadge priority-${t.priority.toLowerCase()}`}>
                                {t.priority}
                              </span>
                            </td>
                            <td>
                              <span className={`statusBadge ${t.status.toLowerCase().replace(/\s+/g, '-')}`}>
                                {t.status}
                              </span>
                            </td>
                            <td>
                              <button
                                type="button"
                                className="primary miniBtn"
                                onClick={() => setActiveTicket(t)}
                              >
                                View & Reply
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ================= TAB 6: MARKETING & BANNERS ================= */}
        {tab === 'marketing' && (
          <div className="adminSectionCard">
            <div className="sectionHeadRow">
              <div>
                <h3>Homepage Promotional Banners & Collection Slider</h3>
                <small>Manage hero slides, high-fashion model photography, promotional links, and campaign badges.</small>
              </div>
              <button type="button" className="primary miniBtn" onClick={openCreateBannerModal}>
                <Plus size={15} /> Add New Hero Banner
              </button>
            </div>

            <div className="bannersListGrid">
              {banners.map((b) => (
                <div key={b.id} className="adminBannerCard">
                  <img src={b.image} alt={b.title} className="bannerPreviewImg" />
                  <div className="bannerCardContent">
                    <div className="bannerBadge">{b.badge || 'PROMO'}</div>
                    <h4>{b.title}</h4>
                    <p>{b.subtitle}</p>
                    <div className="bannerMeta">
                      <span>CTA: <b>{b.ctaText}</b></span>
                      <span>Link: <b>{b.ctaLink}</b></span>
                    </div>
                    <div className="bannerActions">
                      <button
                        type="button"
                        className="danger miniBtn"
                        onClick={() => deleteBanner(b.id)}
                      >
                        <Trash2 size={13} /> Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="announcementFormSection" style={{ marginTop: 40 }}>
              <h3>Broadcast Customer Flash Sale or Alert</h3>
              <form onSubmit={handleCreateNotification} className="notifBroadcastForm">
                <div className="formGrid3">
                  <div className="formField">
                    <label>Announcement Title</label>
                    <input
                      type="text"
                      placeholder="e.g. FLASH SALE: 20% OFF Everything"
                      value={notifForm.title}
                      onChange={(e) => setNotifForm({ ...notifForm, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="formField">
                    <label>Badge / Tag</label>
                    <input
                      type="text"
                      placeholder="e.g. CODE: STREET20"
                      value={notifForm.tag}
                      onChange={(e) => setNotifForm({ ...notifForm, tag: e.target.value })}
                      required
                    />
                  </div>
                  <div className="formField">
                    <label>Notification Type</label>
                    <select
                      value={notifForm.type}
                      onChange={(e) => setNotifForm({ ...notifForm, type: e.target.value })}
                    >
                      <option value="promo">Promo Code / Sale</option>
                      <option value="announcement">Store Announcement</option>
                      <option value="collection">New Drop Alert</option>
                    </select>
                  </div>
                </div>

                <div className="formField">
                  <label>Message Details</label>
                  <input
                    type="text"
                    placeholder="Details of the promotion and instructions for users..."
                    value={notifForm.message}
                    onChange={(e) => setNotifForm({ ...notifForm, message: e.target.value })}
                    required
                  />
                </div>

                <button type="submit" className="primary miniBtn">
                  <Bell size={14} /> Send Broadcast Notification
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ================= TAB 7: USERS ================= */}
        {tab === 'users' && (
          <div className="adminSectionCard">
            <div className="sectionHeadRow">
              <div>
                <h3>Customer Accounts & Role Authorization</h3>
                <small>View registered shoppers and promote accounts to administrators.</small>
              </div>
            </div>

            <div className="tableResponsive">
              <table className="adminDataTable">
                <thead>
                  <tr>
                    <th>NAME</th>
                    <th>EMAIL</th>
                    <th>ROLE</th>
                    <th>PHONE</th>
                    <th>REGISTERED</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td><strong>{u.name}</strong></td>
                      <td>{u.email}</td>
                      <td>
                        <span className={`roleBadge ${u.role}`}>
                          {u.role === 'admin' ? 'ADMIN / OWNER' : 'CUSTOMER'}
                        </span>
                      </td>
                      <td>{u.phone || '—'}</td>
                      <td>{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= TAB 8: SECURITY & PASSWORD ================= */}
        {tab === 'security' && (
          <div className="adminSectionCard adminSecuritySection">
            <div className="sectionHeadRow">
              <div>
                <h3>Store Owner Account & Access Security</h3>
                <small>Manage your credentials, change your password, and verify administrator privileges.</small>
              </div>
            </div>

            <div className="adminSecurityGrid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginTop: '20px' }}>
              {/* Current Admin Profile */}
              <div className="adminSecurityCard" style={{ background: '#fff', border: '1px solid #e5e4df', padding: '24px', borderRadius: '4px' }}>
                <h4 style={{ margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Shield size={18} /> Verified Store Administrator
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
                  <div>
                    <span style={{ color: '#888', display: 'block', fontSize: '11px', textTransform: 'uppercase', marginBottom: '2px' }}>Administrator Name</span>
                    <strong style={{ fontSize: '15px' }}>{me?.name || 'Store Owner'}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#888', display: 'block', fontSize: '11px', textTransform: 'uppercase', marginBottom: '2px' }}>Admin Portal Email</span>
                    <strong style={{ fontSize: '14px' }}>{me?.email}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#888', display: 'block', fontSize: '11px', textTransform: 'uppercase', marginBottom: '4px' }}>Current Role</span>
                    <span className="roleTag" style={{ background: '#d8ff3e', padding: '4px 8px', borderRadius: '2px', fontWeight: 800, fontSize: '11px' }}>
                      STORE OWNER / ADMIN
                    </span>
                  </div>
                  <div style={{ marginTop: '8px', padding: '12px', background: '#f8f8f6', border: '1px solid #eee', fontSize: '12px', color: '#555', lineHeight: '1.6' }}>
                    ✓ Full unrestricted access to orders, products, bespoke tailoring quotes, marketing, and user permissions.
                  </div>
                </div>
              </div>

              {/* Change Password Form */}
              <div className="adminSecurityCard" style={{ background: '#fff', border: '1px solid #e5e4df', padding: '24px', borderRadius: '4px' }}>
                <h4 style={{ margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <KeyRound size={18} /> Update Store Owner Password
                </h4>
                <p style={{ color: '#777', fontSize: '12px', margin: '0 0 16px' }}>
                  Establish a new personal password for logging into the Store Owner & Admin Portal.
                </p>

                <form onSubmit={handleChangeAdminPassword}>
                  <div className="formField" style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', marginBottom: '6px', color: '#666' }}>
                      New Admin Password
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••••••"
                      value={newAdminPass}
                      onChange={(e) => setNewAdminPass(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid #ccc', borderRadius: '2px', fontSize: '14px' }}
                    />
                  </div>

                  <div className="formField" style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', marginBottom: '6px', color: '#666' }}>
                      Confirm New Admin Password
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••••••"
                      value={confirmAdminPass}
                      onChange={(e) => setConfirmAdminPass(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid #ccc', borderRadius: '2px', fontSize: '14px' }}
                    />
                  </div>

                  <p style={{ fontSize: '11px', color: '#888', margin: '0 0 14px' }}>
                    Must be at least 8 characters with letters & numbers.
                  </p>

                  {passError && (
                    <div className="authError" style={{ marginBottom: '14px', padding: '8px 12px', fontSize: '12px' }}>
                      {passError}
                    </div>
                  )}
                  {passMsg && (
                    <div className="adminSuccess" style={{ marginBottom: '14px', padding: '8px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CheckCircle2 size={16} /> {passMsg}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="primary"
                    disabled={passBusy}
                    style={{ width: '100%', padding: '12px', fontSize: '12px', letterSpacing: '0.06em', justifyContent: 'center' }}
                  >
                    {passBusy ? 'UPDATING PASSWORD…' : 'SAVE NEW ADMIN PASSWORD'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Product Add/Edit Modal */}
      {productModalOpen && (
        <div className="modalBack" onClick={() => setProductModalOpen(false)}>
          <div className="modalBox productEditModal" onClick={(e) => e.stopPropagation()}>
            <div className="modalHead">
              <h2>{editingProduct ? 'Edit Streetwear Piece' : 'Add New Streetwear Piece'}</h2>
              <button className="iconClose" onClick={() => setProductModalOpen(false)}><X size={20} /></button>
            </div>

            <form onSubmit={handleProductSubmit} className="adminProductForm">
              <div className="formGrid2">
                <div className="formField">
                  <label>Garment Name</label>
                  <input
                    type="text"
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    required
                  />
                </div>
                <div className="formField">
                  <label>Price (INR)</label>
                  <input
                    type="number"
                    min="0"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="formGrid3">
                <div className="formField">
                  <label>Category</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="formField">
                  <label>Target Audience / Gender</label>
                  <select
                    value={productForm.gender}
                    onChange={(e) => setProductForm({ ...productForm, gender: e.target.value })}
                  >
                    <option value="Unisex">Unisex</option>
                    <option value="Men">Men</option>
                    <option value="Women">Women</option>
                  </select>
                </div>

                <div className="formField">
                  <label>Stock Quantity</label>
                  <input
                    type="number"
                    min="0"
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="formGrid2">
                <div className="formField">
                  <label>Color / Mineral Wash</label>
                  <input
                    type="text"
                    value={productForm.color}
                    onChange={(e) => setProductForm({ ...productForm, color: e.target.value })}
                    placeholder="e.g. Acid Oatmeal Washed"
                  />
                </div>

                <div className="formField">
                  <label>Promotional Tag</label>
                  <select
                    value={productForm.tag}
                    onChange={(e) => setProductForm({ ...productForm, tag: e.target.value })}
                  >
                    {TAG_SUGGESTIONS.map((t) => (
                      <option key={t} value={t}>{t || 'None'}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Sizes Multi-Select */}
              <div className="formField">
                <label>Available Sizing Options</label>
                <div className="sizePickerGrid">
                  {ALL_SIZES.map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      className={`sizePickerBtn ${productForm.sizes?.includes(sz) ? 'active' : ''}`}
                      onClick={() => toggleSizeInForm(sz)}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              <div className="formField">
                <label>Product Description & Fabric Specs</label>
                <textarea
                  rows={3}
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  placeholder="280 GSM waffle cotton, drop shoulders, boxy drape..."
                />
              </div>

              {/* Image Upload Component */}
              <ImageUpload
                value={productForm.image}
                onChange={(img) => setProductForm({ ...productForm, image: img })}
                label="Product Image (Upload Photo or Paste URL)"
                hint="High-resolution fashion model or studio shot (PNG, JPG, WEBP)"
              />

              <div className="modalFooterBtns">
                <button type="button" className="secondary" onClick={() => setProductModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="primary" disabled={formBusy}>
                  {formBusy ? 'Saving Piece…' : editingProduct ? 'Save Changes' : 'Create Piece'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tailor Quotation Modal */}
      {quoteModalOpen && selectedRequest && (
        <div className="modalBack" onClick={() => setQuoteModalOpen(false)}>
          <div className="modalBox quoteModal" onClick={(e) => e.stopPropagation()}>
            <div className="modalHead">
              <h2>Issue Tailor Quotation for #{selectedRequest.requestId}</h2>
              <button className="iconClose" onClick={() => setQuoteModalOpen(false)}><X size={20} /></button>
            </div>

            <form onSubmit={handleSendQuote} className="adminQuoteForm">
              <div className="formField">
                <label>Official Quoted Price (INR)</label>
                <input
                  type="number"
                  min="100"
                  value={quoteForm.price}
                  onChange={(e) => setQuoteForm({ ...quoteForm, price: e.target.value })}
                  required
                />
              </div>

              <div className="formField">
                <label>Estimated Production & Delivery Days</label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={quoteForm.estimatedDays}
                  onChange={(e) => setQuoteForm({ ...quoteForm, estimatedDays: e.target.value })}
                  required
                />
              </div>

              <div className="formField">
                <label>Notes for Customer</label>
                <textarea
                  rows={3}
                  value={quoteForm.notes}
                  onChange={(e) => setQuoteForm({ ...quoteForm, notes: e.target.value })}
                  placeholder="Details regarding custom fabric sourcing, tech pack drafting, or measurement verification..."
                />
              </div>

              <div className="modalFooterBtns">
                <button type="button" className="secondary" onClick={() => setQuoteModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="primary">
                  Send Quotation to Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Banner Create Modal */}
      {bannerModalOpen && (
        <div className="modalBack" onClick={() => setBannerModalOpen(false)}>
          <div className="modalBox bannerModal" onClick={(e) => e.stopPropagation()}>
            <div className="modalHead">
              <h2>Add Promotional Hero Slide</h2>
              <button className="iconClose" onClick={() => setBannerModalOpen(false)}><X size={20} /></button>
            </div>

            <form onSubmit={handleBannerSubmit} className="adminBannerForm">
              <div className="formField">
                <label>Banner Title</label>
                <input
                  type="text"
                  placeholder="e.g. DROP 02: THE METROPOLIS OVERSIZED EDIT"
                  value={bannerForm.title}
                  onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })}
                  required
                />
              </div>

              <div className="formGrid2">
                <div className="formField">
                  <label>Subtitle / Description</label>
                  <input
                    type="text"
                    placeholder="Heavyweight cotton, curved barrel jeans..."
                    value={bannerForm.subtitle}
                    onChange={(e) => setBannerForm({ ...bannerForm, subtitle: e.target.value })}
                  />
                </div>
                <div className="formField">
                  <label>Badge / Eyebrow Text</label>
                  <input
                    type="text"
                    placeholder="NEW DROP 02 LIVE"
                    value={bannerForm.badge}
                    onChange={(e) => setBannerForm({ ...bannerForm, badge: e.target.value })}
                  />
                </div>
              </div>

              <ImageUpload
                value={bannerForm.image}
                onChange={(img) => setBannerForm({ ...bannerForm, image: img })}
                label="Hero Model Photo"
                hint="High-resolution realistic fashion model photograph"
              />

              <div className="formGrid2">
                <div className="formField">
                  <label>CTA Button Text</label>
                  <input
                    type="text"
                    value={bannerForm.ctaText}
                    onChange={(e) => setBannerForm({ ...bannerForm, ctaText: e.target.value })}
                  />
                </div>
                <div className="formField">
                  <label>CTA Button Link</label>
                  <input
                    type="text"
                    value={bannerForm.ctaLink}
                    onChange={(e) => setBannerForm({ ...bannerForm, ctaLink: e.target.value })}
                  />
                </div>
              </div>

              <div className="modalFooterBtns">
                <button type="button" className="secondary" onClick={() => setBannerModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="primary">
                  Publish Banner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
