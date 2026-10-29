import React, { useEffect, useState } from 'react';
import { X, Plus, Edit2, Trash2, Search, Check, AlertCircle, ShoppingBag, TrendingUp, PackageCheck } from 'lucide-react';
import { api } from '../services/api.js';
import { formatINR } from '../utils/format.js';

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
const ORDER_STATUSES = ['Processing', 'Confirmed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'];

const emptyForm = {
  name: '',
  price: '',
  category: 'T-Shirts',
  description: '',
  image: '',
  color: '',
  rating: 4.5,
  tag: '',
};

export default function AdminPanel({ me, onClose, onProductsChanged }) {
  const [tab, setTab] = useState('orders'); // 'orders' | 'products' | 'users'
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [orderFilter, setOrderFilter] = useState('All');
  const [orderSearch, setOrderSearch] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);

  // Product modal / form state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null); // null = creating new
  const [form, setForm] = useState(emptyForm);
  const [formBusy, setFormBusy] = useState(false);
  const [formError, setFormError] = useState('');
  const [prodSearch, setProdSearch] = useState('');

  // Load initial data
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');

    Promise.all([
      api('/admin/users').then((d) => d.users).catch((e) => { setError(e.message); return []; }),
      api('/products').catch((e) => { setError(e.message); return []; }),
      api('/admin/orders').then((d) => d.orders).catch(() => []),
      api('/admin/stats').catch(() => null),
    ])
      .then(([uList, pList, oList, sData]) => {
        if (!cancelled) {
          setUsers(Array.isArray(uList) ? uList : []);
          setProducts(Array.isArray(pList) ? pList : []);
          setOrders(Array.isArray(oList) ? oList : []);
          setStats(sData);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  async function changeOrderStatus(orderId, newStatus) {
    setError('');
    setSuccess('');
    try {
      const d = await api(`/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        body: { status: newStatus },
      });
      setOrders((list) => list.map((o) => (o.id === orderId ? d.order : o)));
      setSuccess(`Updated order ${d.order.trackingNumber} to ${newStatus}`);
    } catch (e) {
      setError(e.message);
    }
  }

  /* -------------------------- User Operations -------------------------- */
  async function changeRole(u, role) {
    setError('');
    setSuccess('');
    try {
      const d = await api(`/admin/users/${u.id}/role`, { method: 'PATCH', body: { role } });
      setUsers((list) => list.map((x) => (x.id === u.id ? d.user : x)));
      setSuccess(`Updated ${u.name}'s role to ${role}.`);
    } catch (e) {
      setError(e.message);
    }
  }

  async function removeUser(u) {
    if (!window.confirm(`Delete user ${u.email}? This cannot be undone.`)) return;
    setError('');
    setSuccess('');
    try {
      await api(`/admin/users/${u.id}`, { method: 'DELETE' });
      setUsers((list) => list.filter((x) => x.id !== u.id));
      setSuccess(`Deleted account ${u.email}.`);
    } catch (e) {
      setError(e.message);
    }
  }

  /* ------------------------- Product Operations ------------------------- */
  function openCreateModal() {
    setEditingProduct(null);
    setForm(emptyForm);
    setFormError('');
    setModalOpen(true);
  }

  function openEditModal(p) {
    setEditingProduct(p);
    setForm({
      name: p.name || '',
      price: p.price ?? '',
      category: p.category || 'T-Shirts',
      description: p.description || '',
      image: p.image || '',
      color: p.color || '',
      rating: p.rating ?? 4.5,
      tag: p.tag || '',
    });
    setFormError('');
    setModalOpen(true);
  }

  function closeFormModal() {
    if (formBusy) return;
    setModalOpen(false);
    setEditingProduct(null);
    setFormError('');
  }

  async function handleProductSubmit(e) {
    e.preventDefault();
    setFormError('');

    // Client-side validations
    const name = form.name.trim();
    if (!name) return setFormError('Product name is required.');
    const price = Number(form.price);
    if (Number.isNaN(price) || price < 0) return setFormError('Please enter a valid non-negative price.');
    if (!form.category.trim()) return setFormError('Category is required.');
    if (form.image && !/^(\/(?!\/)|https:\/\/)/.test(form.image.trim())) {
      return setFormError('Image must be a local path starting with "/" or an https:// URL.');
    }

    const payload = {
      name,
      price,
      category: form.category.trim(),
      description: form.description.trim(),
      image: form.image.trim(),
      color: form.color.trim(),
      rating: Number(form.rating) || 0,
      tag: form.tag.trim(),
    };

    setFormBusy(true);
    try {
      if (editingProduct) {
        // Edit existing product
        const updated = await api(`/admin/products/${editingProduct.id}`, {
          method: 'PATCH',
          body: payload,
        });
        setProducts((list) => list.map((p) => (p.id === editingProduct.id ? updated : p)));
        setSuccess(`Updated product "${updated.name}".`);
      } else {
        // Create new product
        const created = await api('/admin/products', {
          method: 'POST',
          body: payload,
        });
        setProducts((list) => [...list, created]);
        setSuccess(`Created product "${created.name}".`);
      }
      closeFormModal();
      if (typeof onProductsChanged === 'function') {
        onProductsChanged();
      }
    } catch (err) {
      setFormError(err.message);
    } finally {
      setFormBusy(false);
    }
  }

  async function deleteProduct(p) {
    if (!window.confirm(`Delete product "${p.name}"? This removes it from the store.`)) return;
    setError('');
    setSuccess('');
    try {
      await api(`/admin/products/${p.id}`, { method: 'DELETE' });
      setProducts((list) => list.filter((x) => x.id !== p.id));
      setSuccess(`Deleted product "${p.name}".`);
      if (typeof onProductsChanged === 'function') {
        onProductsChanged();
      }
    } catch (e) {
      setError(e.message);
    }
  }

  const filteredProducts = products.filter((p) => {
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

  return (
    <div className="modalBack" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modalBox adminModal" role="dialog" aria-label="Admin Control Panel">
        <div className="modalHead">
          <div>
            <h2>Admin Control Panel</h2>
            <div className="adminTabs" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={tab === 'orders'}
                className={tab === 'orders' ? 'active' : ''}
                onClick={() => { setTab('orders'); setError(''); setSuccess(''); }}
              >
                Orders ({orders.length})
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={tab === 'products'}
                className={tab === 'products' ? 'active' : ''}
                onClick={() => { setTab('products'); setError(''); setSuccess(''); }}
              >
                Products ({products.length})
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={tab === 'users'}
                className={tab === 'users' ? 'active' : ''}
                onClick={() => { setTab('users'); setError(''); setSuccess(''); }}
              >
                Users ({users.length})
              </button>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close" className="closeBtn"><X /></button>
        </div>

        {/* Analytics Summary */}
        <div className="adminStatsGrid">
          <div className="statCard">
            <span className="statLabel"><TrendingUp size={12} /> REVENUE</span>
            <b className="statVal">
              {formatINR(stats?.totalRevenue ?? orders.reduce((s, o) => s + (o.status !== 'Cancelled' ? o.total : 0), 0))}
            </b>
          </div>
          <div className="statCard">
            <span className="statLabel"><ShoppingBag size={12} /> TOTAL ORDERS</span>
            <b className="statVal">{orders.length}</b>
          </div>
          <div className="statCard">
            <span className="statLabel"><PackageCheck size={12} /> DELIVERED</span>
            <b className="statVal">{orders.filter((o) => o.status === 'Delivered').length}</b>
          </div>
          <div className="statCard">
            <span className="statLabel">MEMBERS</span>
            <b className="statVal">{users.length}</b>
          </div>
        </div>

        {error && <div className="authError adminBanner"><AlertCircle size={16} /> {error}</div>}
        {success && <div className="adminSuccess adminBanner"><Check size={16} /> {success}</div>}

        {loading ? (
          <p className="empty">Loading admin data…</p>
        ) : tab === 'orders' ? (
          /* ================= Orders View ================= */
          <div className="adminSection">
            <div className="adminActionsBar">
              <div className="adminSearch">
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Search tracking #, customer, city..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  aria-label="Filter orders"
                />
              </div>
              <div className="orderStatusFilters">
                {['All', ...ORDER_STATUSES].map((st) => (
                  <button
                    key={st}
                    className={'filterChip ' + (orderFilter === st ? 'active' : '')}
                    onClick={() => setOrderFilter(st)}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <div className="tableWrap">
              <table className="userTable orderAdminTable">
                <thead>
                  <tr>
                    <th>TRACKING / DATE</th>
                    <th>CUSTOMER</th>
                    <th>ITEMS</th>
                    <th>TOTAL & PAYMENT</th>
                    <th>STATUS (UPDATE LIVE)</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.length === 0 ? (
                    <tr><td colSpan={5} className="emptyCell">No orders found.</td></tr>
                  ) : (
                    filteredOrders.map((o) => (
                      <tr key={o.id}>
                        <td>
                          <b>{o.trackingNumber}</b>
                          <small className="orderDateSub">
                            {new Date(o.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </small>
                        </td>
                        <td>
                          <strong>{o.customerName || o.shippingAddress?.fullName}</strong>
                          <small className="prodDescSub">{o.customerEmail}</small>
                          <small className="prodDescSub">{o.shippingAddress?.phone} · {o.shippingAddress?.city}</small>
                        </td>
                        <td>
                          <div className="orderAdminItems">
                            {o.items?.map((it, i) => (
                              <span key={i} className="adminItemBadge">
                                {it.name} ({it.size} × {it.quantity})
                              </span>
                            ))}
                          </div>
                        </td>
                        <td>
                          <b>{formatINR(o.total)}</b>
                          <small className="prodDescSub">{o.payment?.method} ({o.payment?.status})</small>
                        </td>
                        <td>
                          <select
                            value={o.status}
                            onChange={(e) => changeOrderStatus(o.id, e.target.value)}
                            className={'statusSelect ' + o.status.toLowerCase().replace(/\s+/g, '-')}
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
        ) : tab === 'products' ? (
          /* ================= Products View ================= */
          <div className="adminSection">
            <div className="adminActionsBar">
              <div className="adminSearch">
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={prodSearch}
                  onChange={(e) => setProdSearch(e.target.value)}
                  aria-label="Filter products"
                />
              </div>
              <button className="primary addBtn" onClick={openCreateModal} type="button">
                <Plus size={16} /> Add Product
              </button>
            </div>

            <div className="tableWrap">
              <table className="userTable productTable">
                <thead>
                  <tr>
                    <th>IMAGE</th>
                    <th>NAME</th>
                    <th>CATEGORY</th>
                    <th>PRICE</th>
                    <th>COLOR</th>
                    <th>TAG</th>
                    <th>RATING</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="emptyCell">No products match your search.</td>
                    </tr>
                  ) : (
                    filteredProducts.map((p) => (
                      <tr key={p.id}>
                        <td className="prodImgCell">
                          {p.image ? (
                            <img src={p.image} alt={p.name} className="adminThumb" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                          ) : (
                            <span className="noThumb">—</span>
                          )}
                        </td>
                        <td>
                          <strong>{p.name}</strong>
                          {p.description && <small className="prodDescSub">{p.description.slice(0, 50)}...</small>}
                        </td>
                        <td><span className="catBadge">{p.category}</span></td>
                        <td><b>{formatINR(p.price)}</b></td>
                        <td>{p.color || '—'}</td>
                        <td>{p.tag ? <span className="tagBadge">{p.tag}</span> : '—'}</td>
                        <td>★ {Number(p.rating || 0).toFixed(1)}</td>
                        <td className="actionsCell">
                          <button className="iconAction" onClick={() => openEditModal(p)} title="Edit product" aria-label={`Edit ${p.name}`}>
                            <Edit2 size={15} />
                          </button>
                          <button className="iconAction danger" onClick={() => deleteProduct(p)} title="Delete product" aria-label={`Delete ${p.name}`}>
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* ================= Users View ================= */
          <div className="adminSection">
            <p className="authSub">{users.length} registered {users.length === 1 ? 'account' : 'accounts'}</p>
            <div className="tableWrap">
              <table className="userTable">
                <thead>
                  <tr>
                    <th>NAME</th>
                    <th>EMAIL</th>
                    <th>ROLE</th>
                    <th>JOINED</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => {
                    const self = u.id === me.id;
                    return (
                      <tr key={u.id}>
                        <td>
                          {u.name}
                          {self && <span className="you">YOU</span>}
                        </td>
                        <td>{u.email}</td>
                        <td>
                          <select
                            value={u.role}
                            disabled={self}
                            onChange={(e) => changeRole(u, e.target.value)}
                            aria-label={`Role for ${u.name}`}
                          >
                            <option value="user">user</option>
                            <option value="admin">admin</option>
                          </select>
                        </td>
                        <td>{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                        <td>
                          {!self && (
                            <button className="dangerBtn" onClick={() => removeUser(u)}>
                              Delete
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= Add / Edit Product Modal ================= */}
        {modalOpen && (
          <div className="modalBack innerModalBack" onClick={(e) => e.target === e.currentTarget && closeFormModal()}>
            <div className="modalBox productFormBox" role="dialog" aria-label={editingProduct ? 'Edit Product' : 'Add New Product'}>
              <div className="modalHead">
                <h3>{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
                <button onClick={closeFormModal} aria-label="Close form" disabled={formBusy}><X /></button>
              </div>

              {formError && <div className="authError">{formError}</div>}

              <form onSubmit={handleProductSubmit} noValidate>
                <div className="formGrid">
                  <label className="field">
                    <span>Product Name *</span>
                    <input
                      type="text"
                      value={form.name}
                      maxLength={80}
                      required
                      placeholder="e.g. Midnight Box Tee"
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                  </label>

                  <label className="field">
                    <span>Price (INR) *</span>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      required
                      placeholder="e.g. 1299"
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: e.target.value })}
                    />
                  </label>

                  <label className="field">
                    <span>Category *</span>
                    <select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                    >
                      {CATEGORIES.map((c) => (
                        <option value={c} key={c}>{c}</option>
                      ))}
                    </select>
                  </label>

                  <label className="field">
                    <span>Color</span>
                    <input
                      type="text"
                      maxLength={40}
                      placeholder="e.g. Charcoal Black"
                      value={form.color}
                      onChange={(e) => setForm({ ...form, color: e.target.value })}
                    />
                  </label>

                  <label className="field">
                    <span>Tag / Badge</span>
                    <select
                      value={form.tag}
                      onChange={(e) => setForm({ ...form, tag: e.target.value })}
                    >
                      {TAG_SUGGESTIONS.map((t) => (
                        <option value={t} key={t}>{t || '(None)'}</option>
                      ))}
                    </select>
                  </label>

                  <label className="field">
                    <span>Rating (0 to 5)</span>
                    <input
                      type="number"
                      min="0"
                      max="5"
                      step="0.1"
                      value={form.rating}
                      onChange={(e) => setForm({ ...form, rating: e.target.value })}
                    />
                  </label>
                </div>

                <label className="field fullWidth">
                  <span>Image URL or Local Path</span>
                  <input
                    type="text"
                    maxLength={500}
                    placeholder="/images/midnight-box-tee.jpg or https://..."
                    value={form.image}
                    onChange={(e) => setForm({ ...form, image: e.target.value })}
                  />
                  <small className="fieldHint">Must begin with "/" (e.g. <code>/images/studio-cargo.jpg</code>) or "https://".</small>
                </label>

                <label className="field fullWidth">
                  <span>Description</span>
                  <textarea
                    rows={3}
                    maxLength={500}
                    placeholder="Short description of fit, fabric, and style details..."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </label>

                <div className="modalButtons">
                  <button type="button" className="secondaryBtn" onClick={closeFormModal} disabled={formBusy}>
                    Cancel
                  </button>
                  <button type="submit" className="primary" disabled={formBusy}>
                    {formBusy ? 'Saving…' : editingProduct ? 'Save Changes' : 'Create Product'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
