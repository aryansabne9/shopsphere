import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowDownWideNarrow, ArrowLeft, ArrowRight, Check, ChevronDown, Heart, LogIn, Menu, Minus, Plus, Search, ShieldCheck, ShoppingBag, SlidersHorizontal, Trash2, UserRound, X } from 'lucide-react';
import { api } from './api.js';
import AdminProductEditor from './AdminProductEditor.jsx';
import AccountPanel from './AccountPanel.jsx';

const demoProducts = [
  { _id: 'demo-1', name: 'Field Overshirt', category: 'Outerwear', price: 88, compareAtPrice: 110, stock: 24, featured: true, description: 'A light, structured layer cut from sturdy organic cotton. Finished with utility pockets and a relaxed shoulder.', imageUrl: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=900&q=85' },
  { _id: 'demo-2', name: 'Everyday Tote', category: 'Objects', price: 34, stock: 61, featured: true, description: 'Room for the daily essentials, made from heavy recycled canvas with an inside pocket and reinforced handles.', imageUrl: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=900&q=85' },
  { _id: 'demo-3', name: 'Ribbed Tank', category: 'Tops', price: 28, stock: 45, description: 'A close but comfortable fit in soft, breathable cotton rib. Designed to wear alone or as a base layer.', imageUrl: 'https://images.unsplash.com/photo-1564257577-1d7a88c8c67c?auto=format&fit=crop&w=900&q=85' },
  { _id: 'demo-4', name: 'Sunday Knit', category: 'Knitwear', price: 96, compareAtPrice: 120, stock: 13, featured: true, description: 'A softly textured crew neck with an easy drape and a substantial hand feel for cooler mornings.', imageUrl: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=900&q=85' },
  { _id: 'demo-5', name: 'Canvas Weekender', category: 'Objects', price: 112, stock: 9, featured: true, description: 'A durable carryall for short trips, with a zip top, padded handles, and a separate shoe compartment.', imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=85' },
  { _id: 'demo-6', name: 'Relaxed Chino', category: 'Bottoms', price: 74, stock: 31, description: 'An everyday trouser in midweight cotton twill with a straight leg, clean front, and adjustable waist tabs.', imageUrl: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=900&q=85' },
  { _id: 'demo-7', name: 'Studio Hoodie', category: 'Tops', price: 82, stock: 18, description: 'Midweight loopback fleece with a clean silhouette, roomy front pocket, and thoughtful finishing.', imageUrl: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=900&q=85' },
  { _id: 'demo-8', name: 'Everyday Cap', category: 'Objects', price: 32, stock: 38, description: 'A six-panel cotton cap with an adjustable strap and low-profile shape. Made for long days outside.', imageUrl: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=900&q=85' },
  { _id: 'demo-9', name: 'Utility Jacket', category: 'Outerwear', price: 138, stock: 7, featured: true, description: 'A weather-ready jacket in tightly woven cotton, with a concealed placket and four practical pockets.', imageUrl: 'https://images.unsplash.com/photo-1544923246-77307dd654cb?auto=format&fit=crop&w=900&q=85' },
  { _id: 'demo-10', name: 'Daily Tee', category: 'Tops', price: 36, stock: 53, description: 'A reliable, midweight jersey tee with a considered neckline and a little extra room through the body.', imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=85' }
];
const money = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);
const productId = (product) => product?._id || product?.id;
const isDatabaseId = (id) => /^[a-f\d]{24}$/i.test(id || '');

function ProductCard({ product, saved, onLike, onAdd, onOpen }) {
  return <article className="product-card"><button className="product-image-button" onClick={() => onOpen(product)} aria-label={`View ${product.name}`}><img src={product.imageUrl} alt={product.name} loading="lazy" />{product.featured && <span className="product-badge">STUDIO PICK</span>}<span className="quick-view">Quick view <ArrowRight size={14} /></span></button><div className="product-meta"><div><span className="product-category">{product.category}</span><button className="product-name" onClick={() => onOpen(product)}>{product.name}</button></div><button className={`save-button ${saved ? 'saved' : ''}`} onClick={() => onLike(product)} aria-label={saved ? 'Remove from wishlist' : 'Add to wishlist'}><Heart size={17} fill={saved ? 'currentColor' : 'none'} /></button></div><div className="product-buyline"><div><strong>{money(product.price)}</strong>{product.compareAtPrice && <del>{money(product.compareAtPrice)}</del>}</div><button className="add-button" onClick={() => onAdd(product)} disabled={product.stock < 1} title={product.stock < 1 ? 'Out of stock' : 'Add to bag'}>{product.stock < 1 ? 'Sold out' : <><Plus size={15} /> Add</>}</button></div></article>;
}

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [products, setProducts] = useState(demoProducts);
  const [category, setCategory] = useState('All');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('featured');
  const [maxPrice, setMaxPrice] = useState(180);
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('shopsphere-user') || 'null'));
  const [profileOpen, setProfileOpen] = useState(false);
  const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem('shopsphere-cart') || '[]'));
  const [wishlist, setWishlist] = useState(() => new Set(JSON.parse(localStorage.getItem('shopsphere-wishlist') || '[]')));
  const [orders, setOrders] = useState([]);
  const [adminUsers, setAdminUsers] = useState([]);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [authError, setAuthError] = useState('');
  const [bagOpen, setBagOpen] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(true);
  const [checkout, setCheckout] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(null);

  useEffect(() => {
    api('/products').then(({ products: loaded }) => { if (loaded?.length) setProducts(loaded); }).catch(() => {}).finally(() => setLoading(false));
  }, []);
  useEffect(() => {
    if (!user) return;
    api('/cart').then(({ items }) => { setCart(items); localStorage.setItem('shopsphere-cart', JSON.stringify(items)); }).catch(() => {});
    api('/wishlist').then(({ products: saved }) => { const ids = new Set(saved.map(productId)); setWishlist(ids); localStorage.setItem('shopsphere-wishlist', JSON.stringify([...ids])); }).catch(() => {});
    api('/orders').then(({ orders: loaded }) => setOrders(loaded)).catch(() => {});
  }, [user]);
  useEffect(() => { localStorage.setItem('shopsphere-cart', JSON.stringify(cart)); }, [cart]);
  useEffect(() => { localStorage.setItem('shopsphere-wishlist', JSON.stringify([...wishlist])); }, [wishlist]);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);
  const shipping = subtotal >= 75 || subtotal === 0 ? 0 : 7.95;
  const isAdminPage = location.pathname === '/admin';
  const isOrdersPage = location.pathname === '/orders';
  const isWishlistPage = location.pathname === '/wishlist';
  const filteredProducts = useMemo(() => {
    let list = products.filter((product) => product.price <= maxPrice);
    if (category !== 'All') list = list.filter((product) => product.category === category);
    if (query.trim()) list = list.filter((product) => `${product.name} ${product.category} ${product.description}`.toLowerCase().includes(query.toLowerCase()));
    if (isWishlistPage) list = list.filter((product) => wishlist.has(productId(product)));
    if (sort === 'price-low') list = [...list].sort((a, b) => a.price - b.price);
    if (sort === 'price-high') list = [...list].sort((a, b) => b.price - a.price);
    if (sort === 'newest') list = [...list].reverse();
    return list;
  }, [products, category, query, sort, maxPrice, isWishlistPage, wishlist]);
  const categories = ['All', ...new Set(products.map((product) => product.category))];

  function notify(message) { setNotice(message); window.setTimeout(() => setNotice(''), 3200); }
  async function addToCart(product) {
    const id = productId(product);
    const previous = cart.find((item) => productId(item.product) === id)?.quantity || 0;
    if (previous >= product.stock) return notify('You have reached the available stock for this item.');
    const updated = cart.some((item) => productId(item.product) === id)
      ? cart.map((item) => productId(item.product) === id ? { ...item, quantity: item.quantity + 1 } : item)
      : [...cart, { product, quantity: 1 }];
    setCart(updated);
    if (user && isDatabaseId(id)) {
      try { const result = await api('/cart', { method: 'POST', body: JSON.stringify({ productId: id, quantity: 1 }) }); setCart(result.items); }
      catch (error) { setCart(cart); notify(error.message); return; }
    }
    notify(`${product.name} added to your bag.`);
  }
  async function updateQuantity(product, quantity) {
    const id = productId(product);
    if (quantity < 1) return removeFromCart(product);
    const previous = cart;
    setCart((items) => items.map((item) => productId(item.product) === id ? { ...item, quantity } : item));
    if (user && isDatabaseId(id)) {
      try { const result = await api(`/cart/${id}`, { method: 'PATCH', body: JSON.stringify({ quantity }) }); setCart(result.items); }
      catch (error) { setCart(previous); notify(error.message); }
    }
  }
  async function removeFromCart(product) {
    const id = productId(product);
    setCart((items) => items.filter((item) => productId(item.product) !== id));
    if (user && isDatabaseId(id)) api(`/cart/${id}`, { method: 'DELETE' }).catch((error) => notify(error.message));
  }
  async function toggleWishlist(product) {
    const id = productId(product);
    const next = new Set(wishlist);
    if (next.has(id)) next.delete(id); else next.add(id);
    setWishlist(next);
    if (user && isDatabaseId(id)) {
      try { const result = await api(`/wishlist/${id}`, { method: 'PUT' }); if (result.saved !== next.has(id)) setWishlist((old) => { const corrected = new Set(old); result.saved ? corrected.add(id) : corrected.delete(id); return corrected; }); }
      catch (error) { notify(error.message); }
    }
  }
  async function submitAuth(event) {
    event.preventDefault();
    setAuthError('');
    const formData = new FormData(event.currentTarget);
    try {
      const result = await api(`/auth/${authMode === 'signup' ? 'register' : 'login'}`, { method: 'POST', body: JSON.stringify(Object.fromEntries(formData)) });
      localStorage.setItem('shopsphere-token', result.token);
      localStorage.setItem('shopsphere-user', JSON.stringify(result.user));
      try {
        let { items } = await api('/cart');
        for (const guestItem of cart) {
          const id = productId(guestItem.product);
          if (!isDatabaseId(id)) continue;
          const existing = items.find((item) => productId(item.product) === id);
          if (!existing) {
            ({ items } = await api('/cart', { method: 'POST', body: JSON.stringify({ productId: id, quantity: guestItem.quantity }) }));
          } else if (guestItem.quantity > existing.quantity) {
            ({ items } = await api(`/cart/${id}`, { method: 'PATCH', body: JSON.stringify({ quantity: guestItem.quantity }) }));
          }
        }
        const databaseWishlist = await api('/wishlist');
        const savedIds = new Set(databaseWishlist.products.map(productId));
        for (const id of wishlist) {
          if (isDatabaseId(id) && !savedIds.has(id)) await api(`/wishlist/${id}`, { method: 'PUT' });
        }
        const [accountCart, accountWishlist] = await Promise.all([api('/cart'), api('/wishlist')]);
        setCart(accountCart.items);
        setWishlist(new Set(accountWishlist.products.map(productId)));
      } catch (error) { notify(error.message); }
      setUser(result.user);
      setAuthOpen(false);
    } catch (error) { setAuthError(error.message); }
  }
  function signOut() {
    localStorage.removeItem('shopsphere-token');
    localStorage.removeItem('shopsphere-user');
    setUser(null);
    setOrders([]);
    navigate('/');
  }
  function updateProfile(updatedUser) {
    localStorage.setItem('shopsphere-user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  }
  function openAccount() {
    if (user) setProfileOpen(true);
    else setAuthOpen(true);
  }
  async function openOrders() {
    if (!user) { setAuthOpen(true); return; }
    navigate('/orders');
  }
  async function placeOrder(event) {
    event.preventDefault();
    if (!user) { setAuthOpen(true); return; }
    const address = Object.fromEntries(new FormData(event.currentTarget));
    try {
      const { order } = await api('/orders', { method: 'POST', body: JSON.stringify({ address }) });
      setOrderPlaced(order);
      setCart([]);
      setCheckout(false);
      setBagOpen(false);
      setOrders((old) => [order, ...old]);
      setProducts((old) => old.map((product) => { const line = order.items.find((item) => item.product === productId(product)); return line ? { ...product, stock: Math.max(0, product.stock - line.quantity) } : product; }));
    } catch (error) { notify(error.message); }
  }
  async function loadAdmin() {
    if (!user || user.role !== 'admin') return;
    try {
      const [{ orders: allOrders }, { users }] = await Promise.all([api('/orders/admin/all'), api('/admin/users')]);
      setOrders(allOrders);
      setAdminUsers(users);
    } catch (error) { notify(error.message); }
  }
  useEffect(() => { if (isAdminPage) loadAdmin(); }, [isAdminPage, user]);
  async function createProduct(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const payload = Object.fromEntries(new FormData(form));
    payload.price = Number(payload.price);
    payload.stock = Number(payload.stock);
    payload.featured = event.currentTarget.elements.featured.checked;
    try { const { product } = await api('/products', { method: 'POST', body: JSON.stringify(payload) }); setProducts((old) => [product, ...old]); form.reset(); notify('Product added to the catalog.'); }
    catch (error) { notify(error.message); }
  }
  async function deleteProduct(product) {
    if (!window.confirm(`Remove ${product.name} from the catalog?`)) return;
    try { await api(`/products/${productId(product)}`, { method: 'DELETE' }); setProducts((old) => old.filter((item) => productId(item) !== productId(product))); notify('Product removed.'); }
    catch (error) { notify(error.message); }
  }
  async function saveProduct(id, payload) {
    try {
      const { product } = await api(`/products/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
      setProducts((old) => old.map((item) => productId(item) === id ? product : item));
      notify('Product details updated.');
    } catch (error) { throw error; }
  }
  async function updateOrderStatus(order, status) {
    try { const { order: updated } = await api(`/orders/${order._id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }); setOrders((old) => old.map((item) => item._id === updated._id ? updated : item)); }
    catch (error) { notify(error.message); }
  }

  return <div className="shop-app">
    <div className="announcement"><span>MADE FOR THE EVERYDAY, NOT JUST THE OCCASION</span><span>COMPLIMENTARY SHIPPING OVER $75</span></div>
    <header className="shop-header"><button className="mobile-menu-trigger" onClick={() => setMobileMenu((value) => !value)} aria-label="Toggle menu"><Menu size={20} /></button><Link to="/" className="shop-wordmark">shopsphere<span>®</span></Link><nav className={`shop-nav ${mobileMenu ? 'menu-open' : ''}`}><button onClick={() => { navigate('/'); setCategory('All'); setMobileMenu(false); }}>New arrivals</button>{categories.filter((name) => name !== 'All').slice(0, 4).map((name) => <button key={name} onClick={() => { navigate('/'); setCategory(name); setMobileMenu(false); }}>{name}</button>)}{user?.role === 'admin' && <button onClick={() => { navigate('/admin'); setMobileMenu(false); }}>Studio admin</button>}</nav><div className="header-tools"><label className="header-search"><Search size={17} /><input value={query} onChange={(event) => { setQuery(event.target.value); if (location.pathname !== '/') navigate('/'); }} placeholder="Search the collection" /></label><button className="header-icon account-trigger" aria-label={user ? 'Open account' : 'Sign in'} title={user ? `Signed in as ${user.name}. Click to open your account.` : 'Sign in'} onClick={openAccount}>{user ? <span className="account-initial">{user.name.charAt(0).toUpperCase()}</span> : <UserRound size={19} />}</button><button className="header-icon bag-trigger" onClick={() => setBagOpen(true)} aria-label={`Shopping bag with ${cartCount} items`}><ShoppingBag size={19} /><span>{cartCount}</span></button></div></header>

    {isAdminPage ? <main className="admin-page"><div className="admin-topline"><div><span className="eyebrow">SHOPSPHERE / OPERATIONS</span><h1>Studio admin</h1></div><button className="back-store" onClick={() => navigate('/')}><ArrowLeft size={15} /> Back to store</button></div>{user?.role !== 'admin' ? <div className="admin-locked"><ShieldCheck size={25} /><strong>Admin access only</strong><span>Sign in with an admin account to manage the shop.</span><button onClick={() => setAuthOpen(true)}>Sign in</button></div> : <div className="admin-grid"><section className="admin-section"><div className="admin-section-title"><div><span className="eyebrow">CATALOG</span><h2>Add a product</h2></div><span>{products.length} items</span></div><form className="product-form" onSubmit={createProduct}><label>Product name<input name="name" required maxLength="120" /></label><div className="form-pair"><label>Category<input name="category" required /></label><label>Price (USD)<input name="price" type="number" min="0" step="0.01" required /></label></div><div className="form-pair"><label>Stock<input name="stock" type="number" min="0" required /></label><label>Image URL<input name="imageUrl" type="url" required /></label></div><label>Description<textarea name="description" maxLength="1500" required rows="3" /></label><label className="check-label"><input name="featured" type="checkbox" /> Feature in storefront</label><button className="dark-button" type="submit"><Plus size={15} /> Add product</button></form><div className="admin-product-list">{products.map((product) => <div className="admin-product-row" key={productId(product)}><img src={product.imageUrl} alt="" /><span><strong>{product.name}</strong><small>{product.stock} in stock · {money(product.price)}</small></span><button className="icon-button" onClick={() => deleteProduct(product)} aria-label={`Delete ${product.name}`}><Trash2 size={16} /></button></div>)}</div></section><div className="admin-right"><section className="admin-section"><div className="admin-section-title"><div><span className="eyebrow">FULFILLMENT</span><h2>Recent orders</h2></div><span>{orders.length}</span></div>{orders.length ? orders.map((order) => <div className="admin-order" key={order._id}><div><strong>{order.orderNumber}</strong><span>{order.user?.name || 'Customer'} · {money(order.total)}</span></div><select aria-label={`Status for ${order.orderNumber}`} value={order.status} onChange={(event) => updateOrderStatus(order, event.target.value)}><option value="placed">Placed</option><option value="processing">Processing</option><option value="shipped">Shipped</option><option value="delivered">Delivered</option><option value="cancelled">Cancelled</option></select></div>) : <p className="admin-empty">New orders will appear here.</p>}</section><section className="admin-section"><div className="admin-section-title"><div><span className="eyebrow">CUSTOMERS</span><h2>Registered users</h2></div><span>{adminUsers.length}</span></div>{adminUsers.map((person) => <div className="user-row" key={person._id}><span className="user-avatar">{person.name.charAt(0)}</span><span><strong>{person.name}</strong><small>{person.email}</small></span><small>{person.role}</small></div>)}</section></div></div>}</main>
      : isOrdersPage ? <main className="orders-page"><div className="page-kicker"><span className="eyebrow">YOUR ACCOUNT / PURCHASES</span><h1>Order history</h1><button onClick={() => navigate('/')}><ArrowLeft size={14} /> Continue shopping</button></div>{orders.length ? <div className="orders-list">{orders.map((order) => <article className="order-card" key={order._id}><div className="order-head"><div><span className="eyebrow">ORDER {order.orderNumber}</span><strong>{new Date(order.createdAt).toLocaleDateString()}</strong></div><span className={`status-pill status-${order.status}`}>{order.status}</span></div><div className="order-lines">{order.items.map((item) => <div key={item._id || item.name}><img src={item.imageUrl} alt="" /><span>{item.name} <small>× {item.quantity}</small></span><strong>{money(item.unitPrice * item.quantity)}</strong></div>)}</div><div className="order-total"><span>{order.address?.city}, {order.address?.country}</span><strong>Total {money(order.total)}</strong></div></article>)}</div> : <div className="orders-empty"><ShoppingBag size={23} /><strong>No orders just yet.</strong><span>Your next everyday favorite is out there.</span><button onClick={() => navigate('/')}>Explore the collection</button></div>}</main>
      : <><main><section className="shop-hero"><div className="hero-visual"><img src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1800&q=90" alt="Friends browsing a considered everyday wardrobe" /><div className="hero-shade" /><div className="hero-copy"><span className="eyebrow">OBJECTS FOR THE EVERYDAY</span><h1>A little more<br /><em>considered.</em></h1><p>Useful things, made to be used.</p><button className="hero-cta" onClick={() => { setCategory('All'); document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' }); }}>Shop the collection <ArrowRight size={16} /></button></div><span className="hero-photo-note">FIELD NOTES / VOL. 04</span><div className="hero-index"><span>01</span> / 03</div></div></section>
        <section className="collection-section" id="collection"><div className="collection-intro"><div><span className="eyebrow">THE CURRENT EDIT</span><h2>{isWishlistPage ? 'Saved for later' : query ? `Results for “${query}”` : 'Things in good company.'}</h2><p>{isWishlistPage ? 'A short list worth coming back to.' : 'Familiar forms, thoughtful details, and a softer kind of utility.'}</p></div><button className="wishlist-link" onClick={() => { if (!user) setAuthOpen(true); else navigate('/wishlist'); }}><Heart size={16} /> Saved pieces <span>{wishlist.size}</span></button></div>
          <div className="shop-controls"><div className="category-tabs">{categories.map((name) => <button className={category === name ? 'selected' : ''} key={name} onClick={() => { setCategory(name); if (isWishlistPage) navigate('/'); }}>{name}</button>)}</div><div className="filter-tools"><label className="price-filter"><SlidersHorizontal size={14} /><span>Up to {money(maxPrice)}</span><input aria-label="Maximum price" type="range" min="30" max="180" step="5" value={maxPrice} onChange={(event) => setMaxPrice(Number(event.target.value))} /></label><label className="sort-filter"><ArrowDownWideNarrow size={14} /><select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Sort products"><option value="featured">Featured</option><option value="newest">Newest</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option></select><ChevronDown size={13} /></label></div></div>
          <div className="result-count"><span>{loading ? 'Finding the good things…' : `${filteredProducts.length} pieces`}</span><span>01 — EVERYDAY ESSENTIALS</span></div>
          {filteredProducts.length ? <div className="product-grid">{filteredProducts.map((product) => <ProductCard key={productId(product)} product={product} saved={wishlist.has(productId(product))} onLike={toggleWishlist} onAdd={addToCart} onOpen={setSelectedProduct} />)}</div> : <div className="catalog-empty"><Search size={20} /><strong>No pieces found.</strong><span>Try a different search or reset the filters.</span><button onClick={() => { setQuery(''); setCategory('All'); setMaxPrice(180); navigate('/'); }}>Reset collection</button></div>}
        </section></main><footer className="shop-footer"><Link to="/" className="shop-wordmark">shopsphere<span>®</span></Link><span>Thoughtful things, everyday.</span><button onClick={openOrders}>Order history</button><span>© 2026 SHOPSPHERE</span></footer></>}

    {bagOpen && <div className="drawer-backdrop" onClick={() => { setBagOpen(false); setCheckout(false); }}><aside className="bag-drawer" onClick={(event) => event.stopPropagation()}><div className="drawer-head"><div><span className="eyebrow">YOUR SELECTION</span><h2>{checkout ? 'Delivery details' : 'Shopping bag'} <small>({cartCount})</small></h2></div><button className="header-icon" onClick={() => { setBagOpen(false); setCheckout(false); }} aria-label="Close bag"><X size={19} /></button></div>{checkout ? <form className="checkout-form" onSubmit={placeOrder}><p>Checkout is in demo mode. No payment is collected.</p>{['name', 'line1', 'city', 'postalCode', 'country'].map((name) => <label key={name}>{name === 'line1' ? 'Street address' : name === 'postalCode' ? 'Postal code' : name.charAt(0).toUpperCase() + name.slice(1)}<input name={name} required defaultValue={name === 'name' ? user?.name : ''} /></label>)}<div className="bag-total"><span>Total due</span><strong>{money(subtotal + shipping)}</strong></div><button className="checkout-button" type="submit">Place demo order <ArrowRight size={16} /></button></form> : <>{cart.length ? <><div className="bag-items">{cart.map(({ product, quantity }) => <div className="bag-item" key={productId(product)}><img src={product.imageUrl} alt="" /><div className="bag-item-info"><span className="product-category">{product.category}</span><strong>{product.name}</strong><span>{money(product.price)}</span><div className="quantity-control"><button onClick={() => updateQuantity(product, quantity - 1)} aria-label="Decrease quantity"><Minus size={13} /></button><span>{quantity}</span><button onClick={() => updateQuantity(product, quantity + 1)} aria-label="Increase quantity"><Plus size={13} /></button><button className="remove-item" onClick={() => removeFromCart(product)} aria-label="Remove item"><Trash2 size={14} /></button></div></div><strong className="bag-line-total">{money(product.price * quantity)}</strong></div>)}</div><div className="bag-summary"><div><span>Subtotal</span><strong>{money(subtotal)}</strong></div><div><span>Shipping</span><strong>{shipping ? money(shipping) : 'Complimentary'}</strong></div>{subtotal < 75 && <p>Add {money(75 - subtotal)} more for complimentary shipping.</p>}<div className="bag-total"><span>Total</span><strong>{money(subtotal + shipping)}</strong></div><button className="checkout-button" onClick={() => user ? setCheckout(true) : setAuthOpen(true)}>Continue to checkout <ArrowRight size={16} /></button><span className="bag-note"><ShieldCheck size={14} /> Secure demo checkout · no payment collected</span></div></> : <div className="bag-empty"><ShoppingBag size={25} /><strong>Your bag is taking a day off.</strong><span>Find something useful for the everyday.</span><button onClick={() => setBagOpen(false)}>Explore the collection</button></div>}</>}</aside></div>}

    {selectedProduct && <div className="detail-backdrop" onClick={() => setSelectedProduct(null)}><section className="product-detail" onClick={(event) => event.stopPropagation()}><button className="detail-close header-icon" onClick={() => setSelectedProduct(null)} aria-label="Close details"><X size={19} /></button><img className="detail-image" src={selectedProduct.imageUrl} alt={selectedProduct.name} /><div className="detail-copy"><span className="eyebrow">{selectedProduct.category}</span><h2>{selectedProduct.name}</h2><div className="detail-price">{money(selectedProduct.price)} {selectedProduct.compareAtPrice && <del>{money(selectedProduct.compareAtPrice)}</del>}</div><p>{selectedProduct.description}</p><span className="stock-note">{selectedProduct.stock > 0 ? `${selectedProduct.stock} available` : 'Currently unavailable'}</span><div className="detail-actions"><button className="dark-button" onClick={() => addToCart(selectedProduct)} disabled={selectedProduct.stock < 1}><ShoppingBag size={16} /> Add to bag</button><button className={`detail-save ${wishlist.has(productId(selectedProduct)) ? 'saved' : ''}`} onClick={() => toggleWishlist(selectedProduct)} aria-label="Save item"><Heart size={17} fill={wishlist.has(productId(selectedProduct)) ? 'currentColor' : 'none'} /></button></div></div></section></div>}

    {orderPlaced && <div className="confirmation-backdrop"><section className="confirmation-modal"><span className="confirmation-check"><Check size={25} /></span><span className="eyebrow">ORDER RECEIVED</span><h2>Thank you, {user?.name.split(' ')[0]}.</h2><p>Your demo order <strong>{orderPlaced.orderNumber}</strong> is confirmed.</p><div className="confirmation-total"><span>Order total</span><strong>{money(orderPlaced.total)}</strong></div><button className="dark-button" onClick={() => { setOrderPlaced(null); navigate('/orders'); }}>View order history <ArrowRight size={15} /></button><button className="confirmation-close" onClick={() => setOrderPlaced(null)}>Back to the collection</button></section></div>}

    {authOpen && <div className="auth-backdrop" onClick={() => setAuthOpen(false)}><section className="auth-modal" onClick={(event) => event.stopPropagation()}><button className="detail-close header-icon" onClick={() => setAuthOpen(false)} aria-label="Close"><X size={19} /></button><span className="eyebrow">A GOOD PLACE TO BEGIN</span><h2>{authMode === 'signup' ? 'Make yourself at home.' : 'Welcome back.'}</h2><p>Sign in to keep your bag, saved pieces, and orders together.</p><form onSubmit={submitAuth}>{authMode === 'signup' && <label>Your name<input name="name" autoComplete="name" required /></label>}<label>Email address<input name="email" type="email" autoComplete="email" required /></label><label>Password<input name="password" type="password" minLength="8" autoComplete={authMode === 'signup' ? 'new-password' : 'current-password'} required /></label>{authError && <span className="auth-error">{authError}</span>}<button className="dark-button" type="submit">{authMode === 'signup' ? 'Create account' : 'Sign in'} <ArrowRight size={15} /></button></form><div className="auth-switch">{authMode === 'signup' ? 'Already have an account?' : 'New to ShopSphere?'} <button onClick={() => { setAuthMode(authMode === 'signup' ? 'login' : 'signup'); setAuthError(''); }}>{authMode === 'signup' ? 'Sign in' : 'Create account'}</button></div></section></div>}
    {isAdminPage && user?.role === 'admin' && <AdminProductEditor products={products} onSave={saveProduct} />}
    {profileOpen && user && <AccountPanel user={user} onClose={() => setProfileOpen(false)} onSignOut={signOut} onOrders={() => { setProfileOpen(false); openOrders(); }} onUpdate={updateProfile} />}
    {notice && <div className="shop-toast" role="status">{notice}<button onClick={() => setNotice('')} aria-label="Dismiss"><X size={15} /></button></div>}
  </div>;
}
