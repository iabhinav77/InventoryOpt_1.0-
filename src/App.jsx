import React, { useState, useEffect, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// ─── SECURITY: Simple PIN-based auth ───────────────────────────────────────
const SECURITY_KEY = import.meta.env.VITE_SECURITY_KEY || 'AOF2024';

// ─── FONTS ──────────────────────────────────────────────────────────────────
const fontLink = document.createElement('link');
fontLink.rel = 'stylesheet';
fontLink.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap';
document.head.appendChild(fontLink);

// ─── GLOBAL STYLES ──────────────────────────────────────────────────────────
const globalStyle = document.createElement('style');
globalStyle.textContent = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #0f0e11;
    --surface: #18161c;
    --surface2: #211e28;
    --surface3: #2a2535;
    --border: #332e40;
    --gold: #c9a96e;
    --gold2: #e8c98a;
    --rose: #c97b8a;
    --mint: #6ec9b0;
    --crimson: #c94f4f;
    --sky: #6ea8c9;
    --text: #f0ece8;
    --text2: #a89e94;
    --text3: #6b6275;
    --good: #4caf7d;
    --warn: #e6a817;
    --crit: #e05252;
    --hold: #6ea8c9;
    --dead: #8b5cf6;
    --shadow: 0 4px 24px rgba(0,0,0,0.4);
    --radius: 12px;
    --radius-sm: 8px;
  }
  body { background: var(--bg); color: var(--text); font-family: 'DM Sans', sans-serif; min-height: 100vh; }
  h1, h2, h3 { font-family: 'Playfair Display', serif; }
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: var(--surface); }
  ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }
  input, select, textarea { background: var(--surface3); border: 1px solid var(--border); color: var(--text); border-radius: var(--radius-sm); padding: 10px 14px; font-family: 'DM Sans', sans-serif; font-size: 14px; transition: border-color 0.2s; outline: none; width: 100%; }
  input:focus, select:focus, textarea:focus { border-color: var(--gold); }
  button { cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.2s; border: none; }
  table { border-collapse: collapse; width: 100%; }
  th { text-align: left; font-weight: 600; font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--text3); padding: 12px 14px; border-bottom: 1px solid var(--border); white-space: nowrap; }
  td { padding: 12px 14px; border-bottom: 1px solid var(--border); font-size: 13px; vertical-align: middle; }
  tr:hover td { background: rgba(201,169,110,0.03); }
  .badge { display: inline-flex; align-items: center; gap: 4px; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; letter-spacing: 0.05em; }
  .badge-good { background: rgba(76,175,125,0.15); color: var(--good); }
  .badge-warn { background: rgba(230,168,23,0.15); color: var(--warn); }
  .badge-crit { background: rgba(224,82,82,0.15); color: var(--crit); }
  .badge-hold { background: rgba(110,168,201,0.15); color: var(--hold); }
  .badge-dead { background: rgba(139,92,246,0.15); color: var(--dead); }
  .badge-uncat { background: rgba(107,98,117,0.25); color: var(--text3); }
  .btn-primary { background: linear-gradient(135deg, var(--gold), var(--gold2)); color: #1a1510; padding: 10px 20px; border-radius: var(--radius-sm); font-weight: 600; font-size: 13px; }
  .btn-primary:hover { opacity: 0.9; transform: translateY(-1px); }
  .btn-ghost { background: transparent; border: 1px solid var(--border); color: var(--text2); padding: 8px 16px; border-radius: var(--radius-sm); font-size: 13px; }
  .btn-ghost:hover { border-color: var(--gold); color: var(--gold); }
  .btn-danger { background: rgba(224,82,82,0.1); border: 1px solid rgba(224,82,82,0.3); color: var(--crit); padding: 6px 12px; border-radius: 6px; font-size: 12px; }
  .btn-danger:hover { background: rgba(224,82,82,0.2); }
  .card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 20px; }
  .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(4px); padding: 20px; }
  .modal { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 28px; width: 100%; max-width: 560px; max-height: 90vh; overflow-y: auto; }
  .modal-wide { max-width: 780px; }
  .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  .form-group { display: flex; flex-direction: column; gap: 6px; }
  .form-group label { font-size: 12px; font-weight: 500; color: var(--text2); letter-spacing: 0.05em; }
  .divider { height: 1px; background: var(--border); margin: 20px 0; }
  .tab { padding: 8px 20px; border-radius: 8px; font-size: 13px; font-weight: 500; background: transparent; color: var(--text3); border: 1px solid transparent; }
  .tab.active { background: var(--surface2); border-color: var(--border); color: var(--gold); }
  .chip { display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 500; cursor: pointer; border: 1px solid var(--border); color: var(--text2); background: transparent; }
  .chip.active { background: rgba(201,169,110,0.1); border-color: var(--gold); color: var(--gold); }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
  .fade-in { animation: fadeIn 0.3s ease; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .spin { animation: spin 0.8s linear infinite; }
  .stat-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 20px 24px; position: relative; overflow: hidden; }
  .stat-card::before { content: ''; position: absolute; inset: 0; opacity: 0.04; background: linear-gradient(135deg, var(--gold), transparent); }
  .stat-number { font-size: 32px; font-weight: 700; font-family: 'Playfair Display', serif; }
  .stat-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: var(--text3); margin-top: 2px; }
  .top-list-item { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid var(--border); }
  .top-list-item:last-child { border-bottom: none; }
  .rank { width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; background: var(--surface3); color: var(--text3); flex-shrink: 0; }
  .rank-1 { background: rgba(201,169,110,0.2); color: var(--gold); }
  .rank-2 { background: rgba(201,169,110,0.1); color: var(--gold2); }
  .rank-3 { background: rgba(201,169,110,0.07); color: var(--text2); }
`;
document.head.appendChild(globalStyle);

// ─── HELPERS ────────────────────────────────────────────────────────────────
const fmt = (n) => (n ?? 0).toLocaleString('en-IN');
const fmtDate = (d) => d ? new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

function calcStatus(p, deadStockConfig) {
  if ((p.hold_stock || 0) > 0) return 'hold';
  const { enabled, threshold, period_days } = deadStockConfig;
  if (enabled) {
    const sales = p.sales_velocity || 0;
    const soldInPeriod = sales * period_days;
    if (soldInPeriod <= threshold) return 'dead';
  }
  if ((p.sellable_stock || 0) <= (p.reorder_point || 5)) return 'critical';
  if ((p.sellable_stock || 0) <= (p.reorder_point || 5) * 1.25) return 'warning';
  return 'good';
}

function calcDaysToStockout(sellable, velocity) {
  if (!velocity || velocity <= 0) return null;
  const days = Math.floor(sellable / velocity);
  return days;
}

function calcReorderPoint(velocity, periodDays) {
  // Safety stock = 1.5x lead time (assume 7 days lead time)
  const leadTime = 7;
  return Math.ceil(velocity * leadTime * 1.5);
}

// ─── LOGIN SCREEN ────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [key, setKey] = useState('');
  const [err, setErr] = useState('');
  const [shake, setShake] = useState(false);

  const attempt = () => {
    if (key === SECURITY_KEY) {
      sessionStorage.setItem('aof_auth', 'yes');
      onLogin();
    } else {
      setErr('Incorrect security key');
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(ellipse at center, #1a1520 0%, #0f0e11 70%)' }}>
      <div style={{ textAlign: 'center', maxWidth: 360, width: '100%', padding: '0 20px' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>👗</div>
        <h1 style={{ fontSize: 28, color: 'var(--gold)', marginBottom: 6 }}>Authority of Fashion</h1>
        <p style={{ color: 'var(--text3)', fontSize: 13, marginBottom: 32 }}>Inventory Management · Secure Access</p>
        <div className="card" style={{ animation: shake ? 'none' : undefined, outline: shake ? '2px solid var(--crit)' : 'none' }}>
          <div className="form-group" style={{ marginBottom: 16 }}>
            <label>SECURITY KEY</label>
            <input
              type="password"
              placeholder="Enter your security key"
              value={key}
              onChange={e => { setKey(e.target.value); setErr(''); }}
              onKeyDown={e => e.key === 'Enter' && attempt()}
              autoFocus
            />
            {err && <span style={{ color: 'var(--crit)', fontSize: 12 }}>{err}</span>}
          </div>
          <button className="btn-primary" style={{ width: '100%' }} onClick={attempt}>Unlock →</button>
        </div>
        <p style={{ color: 'var(--text3)', fontSize: 11, marginTop: 20 }}>Set your key via VITE_SECURITY_KEY env variable</p>
      </div>
    </div>
  );
}

// ─── MAIN APP ────────────────────────────────────────────────────────────────
export default function InventoryApp() {
  const [authed, setAuthed] = useState(sessionStorage.getItem('aof_auth') === 'yes');

  // ── State ──────────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('dashboard');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [snapshots, setSnapshots] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');

  // Dead stock config
  const [deadConfig, setDeadConfig] = useState({ enabled: true, threshold: 0, period_days: 30 });

  // Sales velocity period (for days-to-stockout)
  const [velocityPeriod, setVelocityPeriod] = useState(30); // days

  // Modals
  const [modal, setModal] = useState(null); // 'product' | 'supplier' | 'category' | 'po' | 'snapshot' | 'deadconfig'

  // Product form
  const [editProduct, setEditProduct] = useState(null);
  const [formData, setFormData] = useState(defaultForm());

  // Selected for bulk Shopify push
  const [selected, setSelected] = useState(new Set());

  // Shopify sync timestamps
  const [lastSync, setLastSync] = useState(localStorage.getItem('aof_sync') || null);
  const [lastPush, setLastPush] = useState(localStorage.getItem('aof_push') || null);

  // PO state
  const [poItems, setPoItems] = useState([]);

  // Bulk import
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [importLog, setImportLog] = useState([]);

  // ── Init ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!authed) return;
    fetchAll();
  }, [authed]);

  function defaultForm() {
    return {
      product_name: '', local_name: '', sku: '',
      sellable_stock: 0, hold_stock: 0, new_stock_in: 0,
      design: '', reorder_point: 5, reorder_point_custom: false,
      supplier_id: '', category_id: '',
      sales_velocity: 0,
      last_pushed_at: null,
    };
  }

  async function fetchAll() {
    setLoading(true);
    try {
      const [prodRes, catRes, supRes, snapRes] = await Promise.all([
        supabase.from('inventory_v2').select('*').order('created_at', { ascending: false }),
        supabase.from('categories').select('*').order('name'),
        supabase.from('suppliers').select('*').order('name'),
        supabase.from('snapshots').select('*').order('created_at', { ascending: false }).limit(10),
      ]);
      if (prodRes.error) throw prodRes.error;
      setProducts(prodRes.data || []);
      setCategories(catRes.data || []);
      setSuppliers(supRes.data || []);
      setSnapshots(snapRes.data || []);
    } catch (e) {
      alert('DB Error: ' + e.message);
    } finally {
      setLoading(false);
    }
  }

  // ── Derived data ────────────────────────────────────────────────────────────
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const s = search.toLowerCase();
      const matchSearch = !s || p.product_name?.toLowerCase().includes(s) || p.local_name?.toLowerCase().includes(s) || String(p.sku).includes(s);
      const status = calcStatus(p, deadConfig);
      const matchStatus = filterStatus === 'all' || status === filterStatus;
      const matchCat = filterCategory === 'all' || String(p.category_id) === String(filterCategory);
      return matchSearch && matchStatus && matchCat;
    });
  }, [products, search, filterStatus, filterCategory, deadConfig]);

  const stats = useMemo(() => {
    const total = products.length;
    const critical = products.filter(p => calcStatus(p, deadConfig) === 'critical').length;
    const warning = products.filter(p => calcStatus(p, deadConfig) === 'warning').length;
    const dead = products.filter(p => calcStatus(p, deadConfig) === 'dead').length;
    const onHold = products.filter(p => (p.hold_stock || 0) > 0).length;
    const sellableTotal = products.reduce((a, p) => a + (p.sellable_stock || 0), 0);
    const needReorder = products.filter(p => ['critical'].includes(calcStatus(p, deadConfig))).length;

    const fastMovers = [...products]
      .filter(p => (p.sales_velocity || 0) > 0)
      .sort((a, b) => (b.sales_velocity || 0) - (a.sales_velocity || 0))
      .slice(0, 5);

    const deadItems = [...products]
      .filter(p => calcStatus(p, deadConfig) === 'dead')
      .sort((a, b) => (a.sales_velocity || 0) - (b.sales_velocity || 0))
      .slice(0, 5);

    return { total, critical, warning, dead, onHold, sellableTotal, needReorder, fastMovers, deadItems };
  }, [products, deadConfig]);

  // ── Product CRUD ────────────────────────────────────────────────────────────
  function openAddProduct() {
    setEditProduct(null);
    setFormData(defaultForm());
    setModal('product');
  }

  function openEditProduct(p) {
    setEditProduct(p);
    setFormData({
      product_name: p.product_name || '',
      local_name: p.local_name || '',
      sku: p.sku || '',
      sellable_stock: p.sellable_stock || 0,
      hold_stock: p.hold_stock || 0,
      new_stock_in: 0,
      design: p.design || '',
      reorder_point: p.reorder_point || 5,
      reorder_point_custom: p.reorder_point_custom || false,
      supplier_id: p.supplier_id || '',
      category_id: p.category_id || '',
      sales_velocity: p.sales_velocity || 0,
      last_pushed_at: p.last_pushed_at || null,
    });
    setModal('product');
  }

  async function saveProduct() {
    const data = { ...formData };
    // Add new stock to sellable
    data.sellable_stock = (parseInt(data.sellable_stock) || 0) + (parseInt(data.new_stock_in) || 0);
    delete data.new_stock_in;
    // Auto-calc reorder point if not custom
    if (!data.reorder_point_custom) {
      data.reorder_point = calcReorderPoint(data.sales_velocity || 0, velocityPeriod) || data.reorder_point;
    }
    data.reorder_point = parseInt(data.reorder_point) || 5;
    data.category_id = data.category_id || null;
    data.supplier_id = data.supplier_id || null;

    try {
      if (editProduct) {
        const { error } = await supabase.from('inventory_v2').update(data).eq('id', editProduct.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('inventory_v2').insert([data]);
        if (error) throw error;
      }
      setModal(null);
      fetchAll();
    } catch (e) {
      alert('Error: ' + e.message);
    }
  }

  async function deleteProduct(id) {
    if (!confirm('Delete this product?')) return;
    await supabase.from('inventory_v2').delete().eq('id', id);
    fetchAll();
  }

  // ── Category CRUD ───────────────────────────────────────────────────────────
  const [catForm, setCatForm] = useState({ name: '' });
  const [editCat, setEditCat] = useState(null);

  async function saveCat() {
    if (!catForm.name.trim()) return;
    if (editCat) {
      await supabase.from('categories').update({ name: catForm.name }).eq('id', editCat.id);
    } else {
      await supabase.from('categories').insert([{ name: catForm.name }]);
    }
    setCatForm({ name: '' });
    setEditCat(null);
    fetchAll();
  }

  async function deleteCat(id) {
    if (!confirm('Delete this category? Products will become Uncategorized.')) return;
    await supabase.from('inventory_v2').update({ category_id: null }).eq('category_id', id);
    await supabase.from('categories').delete().eq('id', id);
    fetchAll();
  }

  // ── Supplier CRUD ───────────────────────────────────────────────────────────
  const [supForm, setSupForm] = useState({ name: '', address: '', mobile: '', gst: '' });
  const [editSup, setEditSup] = useState(null);

  async function saveSup() {
    if (!supForm.name.trim()) return;
    if (editSup) {
      await supabase.from('suppliers').update(supForm).eq('id', editSup.id);
    } else {
      await supabase.from('suppliers').insert([supForm]);
    }
    setSupForm({ name: '', address: '', mobile: '', gst: '' });
    setEditSup(null);
    fetchAll();
  }

  async function deleteSup(id) {
    if (!confirm('Delete supplier?')) return;
    await supabase.from('suppliers').delete().eq('id', id);
    fetchAll();
  }

  // ── Weekly Snapshot ─────────────────────────────────────────────────────────
  async function takeSnapshot() {
    const snap = {
      taken_at: new Date().toISOString(),
      product_count: products.length,
      total_sellable: products.reduce((a, p) => a + (p.sellable_stock || 0), 0),
      critical_count: stats.critical,
      data: JSON.stringify(products.map(p => ({
        id: p.id, sku: p.sku, name: p.product_name,
        sellable: p.sellable_stock, velocity: p.sales_velocity,
      }))),
    };
    await supabase.from('snapshots').insert([snap]);
    fetchAll();
    alert('Snapshot saved!');
  }

  // ── Purchase Order Generator ────────────────────────────────────────────────
  function openPO() {
    const items = products
      .filter(p => calcStatus(p, deadConfig) === 'critical' || (p.sellable_stock || 0) <= (p.reorder_point || 5) * 1.25)
      .map(p => ({
        id: p.id, sku: p.sku, product_name: p.product_name, local_name: p.local_name,
        current_stock: p.sellable_stock || 0, reorder_point: p.reorder_point || 5,
        order_qty: Math.max(1, (p.reorder_point || 5) * 2 - (p.sellable_stock || 0)),
        remark: '',
        supplier: suppliers.find(s => s.id === p.supplier_id)?.name || '—',
      }));
    setPoItems(items);
    setModal('po');
  }

  function exportPOCSV() {
    const rows = [
      ['SKU', 'Product Name', 'Local Name', 'Current Stock', 'Reorder Point', 'Order Qty', 'Supplier', 'Remark'],
      ...poItems.map(i => [i.sku, i.product_name, i.local_name, i.current_stock, i.reorder_point, i.order_qty, i.supplier, i.remark]),
    ];
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `PO_AOF_${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  function exportPOText() {
    const date = new Date().toLocaleDateString('en-IN');
    let text = `PURCHASE ORDER - Authority of Fashion\nDate: ${date}\n${'─'.repeat(60)}\n\n`;
    poItems.forEach((item, i) => {
      text += `${i + 1}. ${item.product_name} (SKU: ${item.sku})\n`;
      text += `   Local Name: ${item.local_name || '—'}\n`;
      text += `   Current Stock: ${item.current_stock} | Order Qty: ${item.order_qty}\n`;
      text += `   Supplier: ${item.supplier}\n`;
      if (item.remark) text += `   Note: ${item.remark}\n`;
      text += '\n';
    });
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `PO_AOF_${new Date().toISOString().slice(0, 10)}.txt`; a.click();
    URL.revokeObjectURL(url);
  }

  // ── Shopify Bulk Push ───────────────────────────────────────────────────────
  async function pushSelectedToShopify() {
    if (selected.size === 0) return alert('Select products to push first.');
    const toUpdate = products.filter(p => selected.has(p.id));
    let ok = 0;
    for (const p of toUpdate) {
      try {
        const res = await fetch('/api/shopify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'updateStock', sku: p.sku, quantity: p.sellable_stock }),
        });
        if (res.ok) {
          await supabase.from('inventory_v2').update({ last_pushed_at: new Date().toISOString() }).eq('id', p.id);
          ok++;
        }
      } catch {}
    }
    const ts = new Date().toISOString();
    localStorage.setItem('aof_push', ts);
    setLastPush(ts);
    setSelected(new Set());
    fetchAll();
    alert(`Pushed ${ok}/${toUpdate.length} products to Shopify.`);
  }

  async function syncFromShopify() {
    try {
      const res = await fetch('/api/shopify?action=syncInventory');
      const data = await res.json();
      if (!data.products) throw new Error(data.error || 'No data');
      let synced = 0;
      for (const sp of data.products) {
        const match = products.find(p => String(p.sku) === String(sp.sku));
        if (match) {
          // Only update sellable_stock from Shopify, never override reorder_point if custom
          const update = { last_synced_at: new Date().toISOString() };
          if (!match.reorder_point_custom) {
            update.reorder_point = calcReorderPoint(match.sales_velocity || 0, velocityPeriod);
          }
          await supabase.from('inventory_v2').update(update).eq('id', match.id);
          synced++;
        }
      }
      const ts = new Date().toISOString();
      localStorage.setItem('aof_sync', ts);
      setLastSync(ts);
      fetchAll();
      alert(`Synced ${synced} products from Shopify.`);
    } catch (e) {
      alert('Sync error: ' + e.message);
    }
  }

  // ── Bulk CSV Import ─────────────────────────────────────────────────────────
  async function handleBulkCSV(e) {
    const file = e.target.files[0];
    if (!file) return;
    const text = await file.text();
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length < 2) return;
    const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim().toLowerCase());
    const log = [];
    for (let i = 1; i < lines.length; i++) {
      const vals = lines[i].split(',').map(v => v.replace(/"/g, '').trim());
      const row = {};
      headers.forEach((h, idx) => { row[h] = vals[idx] || ''; });
      if (!row.sku) { log.push(`Row ${i}: skipped (no SKU)`); continue; }
      const existing = products.find(p => String(p.sku) === String(row.sku));
      const data = {
        product_name: row.product_name || row['product name'] || '',
        local_name: row.local_name || row['local name'] || '',
        sku: row.sku,
        sellable_stock: parseInt(row.sellable_stock || row.stock || 0),
        hold_stock: parseInt(row.hold_stock || 0),
        design: row.design || '',
        reorder_point: parseInt(row.reorder_point || row.reorder || 5),
        reorder_point_custom: false,
        sales_velocity: parseFloat(row.sales_velocity || 0),
        category_id: null,
        supplier_id: null,
      };
      try {
        if (existing) {
          // Add to existing sellable
          data.sellable_stock = (existing.sellable_stock || 0) + data.sellable_stock;
          await supabase.from('inventory_v2').update(data).eq('id', existing.id);
          log.push(`Row ${i}: Updated ${row.sku}`);
        } else {
          await supabase.from('inventory_v2').insert([data]);
          log.push(`Row ${i}: Added ${row.sku}`);
        }
      } catch (ex) {
        log.push(`Row ${i}: ERROR - ${ex.message}`);
      }
    }
    setImportLog(log);
    fetchAll();
  }

  // ── Selection helpers ───────────────────────────────────────────────────────
  function toggleSelect(id) {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function selectAll() {
    if (selected.size === filteredProducts.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filteredProducts.map(p => p.id)));
    }
  }

  // ── Render guards ───────────────────────────────────────────────────────────
  if (!authed) return <LoginScreen onLogin={() => setAuthed(true)} />;
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: 16 }}>
      <div className="spin" style={{ width: 32, height: 32, border: '3px solid var(--border)', borderTopColor: 'var(--gold)', borderRadius: '50%' }} />
      <p style={{ color: 'var(--text3)', fontSize: 13 }}>Loading inventory…</p>
    </div>
  );

  const getCatName = (id) => categories.find(c => c.id === id)?.name || 'Uncategorized';
  const getSupName = (id) => suppliers.find(s => s.id === id)?.name || '—';

  // ─────────────────────────────────────────────────────────────────────────────
  //  RENDER
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* ── TOP NAV ── */}
      <nav style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '0 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60, position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 20 }}>👗</span>
          <span style={{ fontFamily: 'Playfair Display', color: 'var(--gold)', fontSize: 17, fontWeight: 600 }}>Authority of Fashion</span>
          <span style={{ color: 'var(--border)', fontSize: 14, margin: '0 4px' }}>·</span>
          <span style={{ color: 'var(--text3)', fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Inventory v2</span>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {['dashboard', 'inventory', 'suppliers', 'categories', 'changelog'].map(tab => (
            <button key={tab} className={`tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
        <button className="btn-ghost" style={{ fontSize: 12 }} onClick={() => { sessionStorage.removeItem('aof_auth'); setAuthed(false); }}>
          🔒 Lock
        </button>
      </nav>

      {/* ── MAIN CONTENT ── */}
      <main style={{ flex: 1, padding: '28px', maxWidth: 1600, margin: '0 auto', width: '100%' }}>

        {/* ──────────────── DASHBOARD TAB ──────────────── */}
        {activeTab === 'dashboard' && (
          <div className="fade-in">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <div>
                <h2 style={{ fontSize: 24, color: 'var(--gold)' }}>Overview</h2>
                <p style={{ color: 'var(--text3)', fontSize: 13, marginTop: 2 }}>Decision-ready in 10 seconds</p>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn-ghost" onClick={() => setModal('deadconfig')} style={{ fontSize: 12 }}>⚙ Dead Stock Config</button>
                <button className="btn-primary" onClick={takeSnapshot}>📸 Take Snapshot</button>
              </div>
            </div>

            {/* Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 28 }}>
              {[
                { label: 'Total SKUs', value: stats.total, color: 'var(--gold)' },
                { label: 'Need Reorder Now', value: stats.needReorder, color: 'var(--crit)' },
                { label: 'Low Warning', value: stats.warning, color: 'var(--warn)' },
                { label: 'Dead Stock', value: stats.dead, color: 'var(--dead)' },
                { label: 'On Hold', value: stats.onHold, color: 'var(--hold)' },
                { label: 'Total Sellable Units', value: fmt(stats.sellableTotal), color: 'var(--mint)' },
              ].map(s => (
                <div key={s.label} className="stat-card">
                  <div className="stat-number" style={{ color: s.color }}>{s.value}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Top Lists */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div className="card">
                <h3 style={{ fontSize: 15, marginBottom: 16, color: 'var(--gold)' }}>🚀 Top 5 Fast Movers</h3>
                {stats.fastMovers.length === 0 ? (
                  <p style={{ color: 'var(--text3)', fontSize: 13 }}>No sales velocity data. Edit products to add.</p>
                ) : stats.fastMovers.map((p, i) => (
                  <div key={p.id} className="top-list-item">
                    <div className={`rank rank-${i + 1}`}>{i + 1}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.product_name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text3)' }}>SKU {p.sku} · {p.sales_velocity}/day avg</div>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--mint)', fontWeight: 600 }}>{p.sellable_stock} left</div>
                  </div>
                ))}
              </div>

              <div className="card">
                <h3 style={{ fontSize: 15, marginBottom: 16, color: 'var(--dead)' }}>💀 Top 5 Dead Stock</h3>
                {stats.deadItems.length === 0 ? (
                  <p style={{ color: 'var(--text3)', fontSize: 13 }}>No dead stock detected. 🎉</p>
                ) : stats.deadItems.map((p, i) => (
                  <div key={p.id} className="top-list-item">
                    <div className="rank">{i + 1}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.product_name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text3)' }}>SKU {p.sku} · {getCatName(p.category_id)}</div>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--dead)', fontWeight: 600 }}>{p.sellable_stock} units</div>
                  </div>
                ))}
              </div>

              <div className="card" style={{ gridColumn: '1 / -1' }}>
                <h3 style={{ fontSize: 15, marginBottom: 16 }}>🔴 Reorder Required Now ({stats.needReorder})</h3>
                {products.filter(p => calcStatus(p, deadConfig) === 'critical').length === 0 ? (
                  <p style={{ color: 'var(--good)', fontSize: 13 }}>✅ All stock levels healthy.</p>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table>
                      <thead><tr><th>Product</th><th>SKU</th><th>Sellable</th><th>Reorder Point</th><th>Days to Stockout</th><th>Supplier</th></tr></thead>
                      <tbody>
                        {products.filter(p => calcStatus(p, deadConfig) === 'critical').map(p => {
                          const dts = calcDaysToStockout(p.sellable_stock, p.sales_velocity);
                          return (
                            <tr key={p.id}>
                              <td>{p.product_name}</td>
                              <td style={{ color: 'var(--text3)' }}>{p.sku}</td>
                              <td><span style={{ color: 'var(--crit)', fontWeight: 700 }}>{p.sellable_stock}</span></td>
                              <td>{p.reorder_point}</td>
                              <td>{dts !== null ? <span style={{ color: dts < 7 ? 'var(--crit)' : 'var(--warn)', fontWeight: 600 }}>{dts}d</span> : '—'}</td>
                              <td style={{ color: 'var(--text3)', fontSize: 12 }}>{getSupName(p.supplier_id)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ──────────────── INVENTORY TAB ──────────────── */}
        {activeTab === 'inventory' && (
          <div className="fade-in">
            {/* Toolbar */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap', alignItems: 'center' }}>
              <input placeholder="🔍 Search product, SKU, local name…" value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: 280 }} />

              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ width: 'auto' }}>
                <option value="all">All Status</option>
                <option value="good">Good</option>
                <option value="warning">Warning</option>
                <option value="critical">Critical</option>
                <option value="dead">Dead Stock</option>
                <option value="hold">On Hold</option>
              </select>

              <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} style={{ width: 'auto' }}>
                <option value="all">All Categories</option>
                <option value="">Uncategorized</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>

              <select value={velocityPeriod} onChange={e => setVelocityPeriod(Number(e.target.value))} style={{ width: 'auto' }}>
                <option value={7}>Days-to-Stockout: 1 Week</option>
                <option value={30}>Days-to-Stockout: 1 Month</option>
                <option value={90}>Days-to-Stockout: 3 Months</option>
                <option value={180}>Days-to-Stockout: 6 Months</option>
                <option value={365}>Days-to-Stockout: 1 Year</option>
              </select>

              <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                {selected.size > 0 && (
                  <button className="btn-primary" onClick={pushSelectedToShopify}>
                    🔼 Push {selected.size} to Shopify
                  </button>
                )}
                <button className="btn-ghost" onClick={syncFromShopify}>🔄 Sync from Shopify</button>
                <button className="btn-ghost" onClick={openPO}>📋 Purchase Order</button>
                <button className="btn-ghost" onClick={() => setShowBulkImport(v => !v)}>📦 Bulk Import</button>
                <button className="btn-primary" onClick={openAddProduct}>+ Add Product</button>
              </div>
            </div>

            {/* Sync / Push timestamps */}
            <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
              {lastSync && <span style={{ fontSize: 11, color: 'var(--text3)' }}>🔄 Last Sync: {fmtDate(lastSync)}</span>}
              {lastPush && <span style={{ fontSize: 11, color: 'var(--text3)' }}>🔼 Last Push: {fmtDate(lastPush)}</span>}
            </div>

            {/* Bulk Import Panel */}
            {showBulkImport && (
              <div className="card" style={{ marginBottom: 16 }}>
                <h3 style={{ fontSize: 14, marginBottom: 12 }}>Bulk Import via CSV</h3>
                <p style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 10 }}>
                  Columns: product_name, local_name, sku, sellable_stock, hold_stock, design, reorder_point, sales_velocity<br />
                  If SKU exists → adds to existing sellable stock. If new → creates product.
                </p>
                <input type="file" accept=".csv" onChange={handleBulkCSV} style={{ width: 'auto' }} />
                {importLog.length > 0 && (
                  <div style={{ marginTop: 12, background: 'var(--surface3)', borderRadius: 8, padding: 12, maxHeight: 160, overflowY: 'auto', fontSize: 12, color: 'var(--text2)', fontFamily: 'monospace' }}>
                    {importLog.map((l, i) => <div key={i}>{l}</div>)}
                  </div>
                )}
              </div>
            )}

            {/* Table */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table>
                  <thead>
                    <tr>
                      <th style={{ width: 32 }}>
                        <input type="checkbox" checked={selected.size > 0 && selected.size === filteredProducts.length} onChange={selectAll} />
                      </th>
                      <th>Product Name</th>
                      <th>Local Name</th>
                      <th>SKU</th>
                      <th>Category</th>
                      <th>Sellable</th>
                      <th>Hold</th>
                      <th>Reorder Pt</th>
                      <th>Days to Stockout</th>
                      <th>Velocity/day</th>
                      <th>Status</th>
                      <th>Supplier</th>
                      <th>Pushed to Shopify</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.length === 0 && (
                      <tr><td colSpan={14} style={{ textAlign: 'center', color: 'var(--text3)', padding: 40 }}>No products found.</td></tr>
                    )}
                    {filteredProducts.map(p => {
                      const status = calcStatus(p, deadConfig);
                      const dts = calcDaysToStockout(p.sellable_stock, p.sales_velocity);
                      const statusMap = {
                        good: { label: 'GOOD', cls: 'badge-good' },
                        warning: { label: 'WARN', cls: 'badge-warn' },
                        critical: { label: 'CRITICAL', cls: 'badge-crit' },
                        dead: { label: 'DEAD', cls: 'badge-dead' },
                        hold: { label: 'ON HOLD', cls: 'badge-hold' },
                      };
                      const s = statusMap[status];
                      return (
                        <tr key={p.id}>
                          <td>
                            <input type="checkbox" checked={selected.has(p.id)} onChange={() => toggleSelect(p.id)} />
                          </td>
                          <td style={{ fontWeight: 500 }}>{p.product_name}</td>
                          <td style={{ color: 'var(--text3)' }}>{p.local_name || '—'}</td>
                          <td style={{ color: 'var(--gold)', fontSize: 12, fontFamily: 'monospace' }}>{p.sku}</td>
                          <td>
                            {p.category_id
                              ? <span className="badge badge-uncat" style={{ background: 'rgba(201,169,110,0.1)', color: 'var(--gold2)' }}>{getCatName(p.category_id)}</span>
                              : <span className="badge badge-uncat">Uncategorized</span>}
                          </td>
                          <td style={{ fontWeight: 600 }}>{fmt(p.sellable_stock)}</td>
                          <td style={{ color: 'var(--hold)' }}>{fmt(p.hold_stock)}</td>
                          <td style={{ fontSize: 12 }}>
                            {fmt(p.reorder_point)}
                            {p.reorder_point_custom && <span style={{ fontSize: 10, color: 'var(--gold)', marginLeft: 4 }}>✎</span>}
                          </td>
                          <td>
                            {dts !== null
                              ? <span style={{ color: dts < 7 ? 'var(--crit)' : dts < 14 ? 'var(--warn)' : 'var(--good)', fontWeight: 600, fontSize: 13 }}>{dts}d</span>
                              : <span style={{ color: 'var(--text3)', fontSize: 12 }}>—</span>}
                          </td>
                          <td style={{ color: 'var(--text3)', fontSize: 12 }}>{p.sales_velocity || 0}/d</td>
                          <td><span className={`badge ${s.cls}`}>{s.label}</span></td>
                          <td style={{ fontSize: 12, color: 'var(--text3)' }}>{getSupName(p.supplier_id)}</td>
                          <td style={{ fontSize: 11 }}>
                            {p.last_pushed_at
                              ? <span style={{ color: 'var(--mint)' }}>✓ {fmtDate(p.last_pushed_at)}</span>
                              : <span style={{ color: 'var(--text3)' }}>Not pushed</span>}
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: 6 }}>
                              <button onClick={() => openEditProduct(p)} style={{ background: 'var(--surface3)', border: '1px solid var(--border)', color: 'var(--text2)', padding: '4px 10px', borderRadius: 6, fontSize: 12 }}>Edit</button>
                              <button className="btn-danger" onClick={() => deleteProduct(p.id)}>✕</button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div style={{ padding: '10px 16px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text3)' }}>
                <span>{filteredProducts.length} products shown · {selected.size} selected</span>
                <span>Velocity period: {velocityPeriod} days</span>
              </div>
            </div>
          </div>
        )}

        {/* ──────────────── SUPPLIERS TAB ──────────────── */}
        {activeTab === 'suppliers' && (
          <div className="fade-in">
            <h2 style={{ fontSize: 22, color: 'var(--gold)', marginBottom: 20 }}>Supplier Master List</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 20 }}>
              <div className="card">
                <h3 style={{ fontSize: 14, marginBottom: 16 }}>{editSup ? 'Edit Supplier' : 'Add Supplier'}</h3>
                {[['name', 'Supplier Name *'], ['address', 'Address'], ['mobile', 'Mobile No.'], ['gst', 'GST ID']].map(([key, label]) => (
                  <div className="form-group" style={{ marginBottom: 12 }} key={key}>
                    <label>{label}</label>
                    <input value={supForm[key]} onChange={e => setSupForm(p => ({ ...p, [key]: e.target.value }))} />
                  </div>
                ))}
                <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                  <button className="btn-primary" onClick={saveSup} style={{ flex: 1 }}>{editSup ? 'Update' : 'Add Supplier'}</button>
                  {editSup && <button className="btn-ghost" onClick={() => { setEditSup(null); setSupForm({ name: '', address: '', mobile: '', gst: '' }); }}>Cancel</button>}
                </div>
              </div>
              <div className="card" style={{ padding: 0 }}>
                <table>
                  <thead><tr><th>Name</th><th>Address</th><th>Mobile</th><th>GST</th><th>Actions</th></tr></thead>
                  <tbody>
                    {suppliers.length === 0 && <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text3)', padding: 40 }}>No suppliers yet.</td></tr>}
                    {suppliers.map(s => (
                      <tr key={s.id}>
                        <td style={{ fontWeight: 600 }}>{s.name}</td>
                        <td style={{ color: 'var(--text3)', fontSize: 12 }}>{s.address || '—'}</td>
                        <td style={{ fontSize: 12 }}>{s.mobile || '—'}</td>
                        <td style={{ fontSize: 12, fontFamily: 'monospace', color: 'var(--gold2)' }}>{s.gst || '—'}</td>
                        <td>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button onClick={() => { setEditSup(s); setSupForm({ name: s.name, address: s.address || '', mobile: s.mobile || '', gst: s.gst || '' }); }} style={{ background: 'var(--surface3)', border: '1px solid var(--border)', color: 'var(--text2)', padding: '4px 10px', borderRadius: 6, fontSize: 12 }}>Edit</button>
                            <button className="btn-danger" onClick={() => deleteSup(s.id)}>✕</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ──────────────── CATEGORIES TAB ──────────────── */}
        {activeTab === 'categories' && (
          <div className="fade-in">
            <h2 style={{ fontSize: 22, color: 'var(--gold)', marginBottom: 20 }}>Product Categories</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 20 }}>
              <div className="card">
                <h3 style={{ fontSize: 14, marginBottom: 16 }}>{editCat ? 'Rename Category' : 'New Category'}</h3>
                <div className="form-group" style={{ marginBottom: 14 }}>
                  <label>Category Name</label>
                  <input placeholder="e.g. Sarees, Blouses, Earrings…" value={catForm.name} onChange={e => setCatForm({ name: e.target.value })} />
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn-primary" onClick={saveCat} style={{ flex: 1 }}>{editCat ? 'Rename' : 'Create'}</button>
                  {editCat && <button className="btn-ghost" onClick={() => { setEditCat(null); setCatForm({ name: '' }); }}>Cancel</button>}
                </div>
              </div>
              <div className="card" style={{ padding: 0 }}>
                <table>
                  <thead><tr><th>Category</th><th>Products</th><th>Actions</th></tr></thead>
                  <tbody>
                    {categories.length === 0 && <tr><td colSpan={3} style={{ textAlign: 'center', color: 'var(--text3)', padding: 40 }}>No categories yet. Create your first one.</td></tr>}
                    {categories.map(c => (
                      <tr key={c.id}>
                        <td style={{ fontWeight: 600 }}>{c.name}</td>
                        <td style={{ color: 'var(--text3)' }}>{products.filter(p => p.category_id === c.id).length}</td>
                        <td>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button onClick={() => { setEditCat(c); setCatForm({ name: c.name }); }} style={{ background: 'var(--surface3)', border: '1px solid var(--border)', color: 'var(--text2)', padding: '4px 10px', borderRadius: 6, fontSize: 12 }}>Rename</button>
                            <button className="btn-danger" onClick={() => deleteCat(c.id)}>✕</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ──────────────── CHANGELOG TAB ──────────────── */}
        {activeTab === 'changelog' && (
          <div className="fade-in">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ fontSize: 22, color: 'var(--gold)' }}>Weekly Snapshots / Changelog</h2>
              <button className="btn-primary" onClick={takeSnapshot}>📸 Take Snapshot Now</button>
            </div>
            {snapshots.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: 60, color: 'var(--text3)' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📸</div>
                <p>No snapshots yet. Take your first snapshot to track inventory changes over time.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {snapshots.map((snap, idx) => (
                  <div key={snap.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: idx === 0 ? 'var(--good)' : 'var(--border)', flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{fmtDate(snap.taken_at)}</div>
                      <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 3 }}>
                        {snap.product_count} SKUs · {fmt(snap.total_sellable)} total sellable · {snap.critical_count} critical
                      </div>
                    </div>
                    {idx > 0 && snapshots[idx - 1] && (
                      <div style={{ fontSize: 12, color: 'var(--text3)', textAlign: 'right' }}>
                        <div style={{ color: (snapshots[idx - 1].total_sellable - snap.total_sellable) > 0 ? 'var(--crit)' : 'var(--good)' }}>
                          {snapshots[idx - 1].total_sellable - snap.total_sellable > 0 ? '−' : '+'}{Math.abs(snapshots[idx - 1].total_sellable - snap.total_sellable)} units vs prev
                        </div>
                      </div>
                    )}
                    {idx === 0 && <span style={{ fontSize: 11, color: 'var(--good)', fontWeight: 600 }}>LATEST</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* ─────────────────────────────────────────────────────────────────────
           MODALS
         ───────────────────────────────────────────────────────────────────── */}

      {/* ── Product Add/Edit Modal ── */}
      {modal === 'product' && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="modal modal-wide fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: 18 }}>{editProduct ? 'Edit Product' : 'Add New Product'}</h3>
              <button onClick={() => setModal(null)} style={{ background: 'none', color: 'var(--text3)', fontSize: 20 }}>×</button>
            </div>

            <div className="form-row" style={{ marginBottom: 12 }}>
              <div className="form-group">
                <label>PRODUCT NAME *</label>
                <input value={formData.product_name} onChange={e => setFormData(p => ({ ...p, product_name: e.target.value }))} placeholder="Velvet Temptation After Dark" />
              </div>
              <div className="form-group">
                <label>LOCAL NAME</label>
                <input value={formData.local_name} onChange={e => setFormData(p => ({ ...p, local_name: e.target.value }))} placeholder="Red plain georgette" />
              </div>
            </div>

            <div className="form-row" style={{ marginBottom: 12 }}>
              <div className="form-group">
                <label>SKU *</label>
                <input value={formData.sku} onChange={e => setFormData(p => ({ ...p, sku: e.target.value }))} placeholder="AOF-001" />
              </div>
              <div className="form-group">
                <label>DESIGN</label>
                <input value={formData.design} onChange={e => setFormData(p => ({ ...p, design: e.target.value }))} placeholder="Chiffon, Border, Plain…" />
              </div>
            </div>

            <div className="divider" />

            <div className="form-row" style={{ marginBottom: 12 }}>
              <div className="form-group">
                <label>CURRENT SELLABLE STOCK</label>
                <input type="number" value={formData.sellable_stock} onChange={e => setFormData(p => ({ ...p, sellable_stock: e.target.value }))} />
              </div>
              <div className="form-group">
                <label>➕ ADD NEW STOCK INCOMING</label>
                <input type="number" min="0" value={formData.new_stock_in} onChange={e => setFormData(p => ({ ...p, new_stock_in: e.target.value }))} placeholder="Will be added to sellable" />
              </div>
            </div>

            <div style={{ background: 'rgba(201,169,110,0.06)', border: '1px solid rgba(201,169,110,0.15)', borderRadius: 8, padding: '8px 14px', marginBottom: 12, fontSize: 12, color: 'var(--gold2)' }}>
              New total after save: <strong>{(parseInt(formData.sellable_stock) || 0) + (parseInt(formData.new_stock_in) || 0)} units</strong>
            </div>

            <div className="form-row" style={{ marginBottom: 12 }}>
              <div className="form-group">
                <label>HOLD STOCK</label>
                <input type="number" value={formData.hold_stock} onChange={e => setFormData(p => ({ ...p, hold_stock: e.target.value }))} />
              </div>
              <div className="form-group">
                <label>SALES VELOCITY (units/day avg)</label>
                <input type="number" step="0.1" value={formData.sales_velocity} onChange={e => setFormData(p => ({ ...p, sales_velocity: e.target.value }))} placeholder="e.g. 1.5 = 1.5 units/day" />
              </div>
            </div>

            <div className="form-row" style={{ marginBottom: 12 }}>
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  REORDER POINT
                  <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 400, fontSize: 11 }}>
                    <input type="checkbox" style={{ width: 'auto' }} checked={formData.reorder_point_custom} onChange={e => setFormData(p => ({ ...p, reorder_point_custom: e.target.checked }))} />
                    Custom (lock from auto-calc)
                  </label>
                </label>
                <input type="number" value={formData.reorder_point} onChange={e => setFormData(p => ({ ...p, reorder_point: e.target.value }))} disabled={!formData.reorder_point_custom} style={{ opacity: formData.reorder_point_custom ? 1 : 0.5 }} />
                {!formData.reorder_point_custom && <span style={{ fontSize: 11, color: 'var(--text3)' }}>Auto: {calcReorderPoint(formData.sales_velocity || 0, velocityPeriod)} units</span>}
              </div>
              <div className="form-group">
                <label>CATEGORY</label>
                <select value={formData.category_id} onChange={e => setFormData(p => ({ ...p, category_id: e.target.value }))}>
                  <option value="">Uncategorized</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 20 }}>
              <label>SUPPLIER</label>
              <select value={formData.supplier_id} onChange={e => setFormData(p => ({ ...p, supplier_id: e.target.value }))}>
                <option value="">— No Supplier —</option>
                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn-primary" style={{ flex: 1 }} onClick={saveProduct}>{editProduct ? 'Save Changes' : 'Add Product'}</button>
              <button className="btn-ghost" onClick={() => setModal(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Purchase Order Modal ── */}
      {modal === 'po' && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="modal modal-wide fade-in" style={{ maxWidth: 900 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: 18 }}>📋 Purchase Order Generator</h3>
              <button onClick={() => setModal(null)} style={{ background: 'none', color: 'var(--text3)', fontSize: 20 }}>×</button>
            </div>
            <p style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 16 }}>
              {poItems.length} items need reordering. Edit quantities and add remarks before exporting.
            </p>

            <div style={{ overflowX: 'auto', marginBottom: 16 }}>
              <table>
                <thead>
                  <tr>
                    <th>Product</th><th>Local Name</th><th>SKU</th><th>Current</th><th>Reorder Pt</th>
                    <th style={{ minWidth: 90 }}>Order Qty</th><th>Supplier</th><th style={{ minWidth: 180 }}>Remark</th>
                  </tr>
                </thead>
                <tbody>
                  {poItems.map((item, i) => (
                    <tr key={item.id}>
                      <td style={{ fontWeight: 500 }}>{item.product_name}</td>
                      <td style={{ color: 'var(--text3)', fontSize: 12 }}>{item.local_name || '—'}</td>
                      <td style={{ color: 'var(--gold)', fontFamily: 'monospace', fontSize: 12 }}>{item.sku}</td>
                      <td style={{ color: 'var(--crit)', fontWeight: 700 }}>{item.current_stock}</td>
                      <td>{item.reorder_point}</td>
                      <td>
                        <input type="number" min="1" value={item.order_qty} onChange={e => setPoItems(prev => prev.map((p, j) => j === i ? { ...p, order_qty: parseInt(e.target.value) || 1 } : p))} style={{ padding: '6px 10px' }} />
                      </td>
                      <td style={{ fontSize: 12, color: 'var(--text3)' }}>{item.supplier}</td>
                      <td>
                        <input value={item.remark} onChange={e => setPoItems(prev => prev.map((p, j) => j === i ? { ...p, remark: e.target.value } : p))} placeholder="Optional note…" style={{ padding: '6px 10px', fontSize: 12 }} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn-primary" onClick={exportPOCSV}>⬇ Export CSV / Excel</button>
              <button className="btn-ghost" onClick={exportPOText}>⬇ Export as Text</button>
              <button className="btn-ghost" onClick={() => setModal(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Dead Stock Config Modal ── */}
      {modal === 'deadconfig' && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="modal fade-in" style={{ maxWidth: 420 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: 18 }}>⚙ Dead Stock Configuration</h3>
              <button onClick={() => setModal(null)} style={{ background: 'none', color: 'var(--text3)', fontSize: 20 }}>×</button>
            </div>
            <div className="form-group" style={{ marginBottom: 14 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="checkbox" style={{ width: 'auto' }} checked={deadConfig.enabled} onChange={e => setDeadConfig(p => ({ ...p, enabled: e.target.checked }))} />
                Enable Dead Stock Detection
              </label>
            </div>
            <div className="form-group" style={{ marginBottom: 14 }}>
              <label>SOLD LESS THAN (units) in the period below</label>
              <input type="number" min="0" value={deadConfig.threshold} onChange={e => setDeadConfig(p => ({ ...p, threshold: parseInt(e.target.value) || 0 }))} />
              <span style={{ fontSize: 11, color: 'var(--text3)' }}>e.g. 0 = sold nothing, 10 = sold less than 10 units</span>
            </div>
            <div className="form-group" style={{ marginBottom: 20 }}>
              <label>TIME PERIOD</label>
              <select value={deadConfig.period_days} onChange={e => setDeadConfig(p => ({ ...p, period_days: parseInt(e.target.value) }))}>
                <option value={30}>30 Days (1 Month)</option>
                <option value={60}>60 Days (2 Months)</option>
                <option value={90}>90 Days (3 Months)</option>
                <option value={180}>180 Days (6 Months)</option>
                <option value={365}>365 Days (1 Year)</option>
              </select>
            </div>
            <div style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: 'var(--dead)', marginBottom: 20 }}>
              Currently: products that sold &lt; {deadConfig.threshold} units in {deadConfig.period_days} days will be flagged as dead stock.
            </div>
            <button className="btn-primary" style={{ width: '100%' }} onClick={() => setModal(null)}>Apply Configuration</button>
          </div>
        </div>
      )}

    </div>
  );
}
