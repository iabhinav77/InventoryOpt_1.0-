import React, { useState, useEffect, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';

// ── Supabase ─────────────────────────────────────────────────────────────────
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// ── Security key (set VITE_SECURITY_KEY in Vercel env vars) ──────────────────
const SECURITY_KEY = import.meta.env.VITE_SECURITY_KEY || 'AOF2024';

// ── Font injection ────────────────────────────────────────────────────────────
;(() => {
  const l = document.createElement('link');
  l.rel = 'stylesheet';
  l.href = 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Inter:wght@300;400;500;600&display=swap';
  document.head.appendChild(l);
})();

// ── Export library lazy-loader ────────────────────────────────────────────────
const loadScript = (src) => new Promise((res, rej) => {
  if (document.querySelector(`script[src="${src}"]`)) return res();
  const s = document.createElement('script');
  s.src = src; s.onload = res; s.onerror = rej;
  document.head.appendChild(s);
});
const CDN_XLSX    = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
const CDN_JSPDF   = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
const CDN_AUTOTBL = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.31/jspdf.plugin.autotable.min.js';

// ── Global CSS ────────────────────────────────────────────────────────────────
;(() => {
  const s = document.createElement('style');
  s.textContent = `
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#0c0b0f;
  --s1:#141218;
  --s2:#1c1922;
  --s3:#242130;
  --s4:#2d2a3a;
  --border:#38334a;
  --border2:#463f5c;
  --gold:#c9a96e;
  --gold2:#e2c285;
  --goldglow:rgba(201,169,110,0.15);
  --rose:#d4748a;
  --teal:#5bbfaa;
  --sky:#6baed4;
  --lavender:#a78bfa;
  --text:#f2ede8;
  --t2:#b0a89e;
  --t3:#7a7085;
  --good:#52c47a;
  --warn:#f0a832;
  --crit:#e85555;
  --hold:#6baed4;
  --dead:#a78bfa;
  --r:10px;--rs:7px;
}
body{background:var(--bg);color:var(--text);font-family:'Inter',sans-serif;min-height:100vh;line-height:1.5}
h1,h2,h3,h4{font-family:'Cormorant Garamond',serif;letter-spacing:0.01em}
::-webkit-scrollbar{width:5px;height:5px}
::-webkit-scrollbar-track{background:var(--s1)}
::-webkit-scrollbar-thumb{background:var(--border2);border-radius:3px}
input,select,textarea{
  background:var(--s3);border:1.5px solid var(--border);color:var(--text);
  border-radius:var(--rs);padding:9px 13px;font-family:'Inter',sans-serif;
  font-size:13px;transition:border-color .18s,box-shadow .18s;outline:none;width:100%
}
input:focus,select:focus,textarea:focus{border-color:var(--gold);box-shadow:0 0 0 3px var(--goldglow)}
input[type=checkbox]{width:16px!important;height:16px!important;accent-color:var(--gold);cursor:pointer;padding:0}
button{cursor:pointer;font-family:'Inter',sans-serif;transition:all .18s;border:none;outline:none}
table{border-collapse:collapse;width:100%}
thead th{
  background:var(--s2);text-align:left;font-size:10.5px;font-weight:600;
  letter-spacing:0.1em;text-transform:uppercase;color:var(--t3);
  padding:11px 14px;border-bottom:1.5px solid var(--border);white-space:nowrap;
  position:sticky;top:0;z-index:1
}
td{padding:11px 14px;border-bottom:1px solid var(--border);font-size:13px;vertical-align:middle}
tbody tr:hover td{background:rgba(201,169,110,0.035)}
.badge{display:inline-flex;align-items:center;gap:3px;padding:2px 9px;border-radius:20px;font-size:10.5px;font-weight:600;letter-spacing:.04em;white-space:nowrap}
.bg{background:rgba(76,175,125,.13);color:var(--good)}
.bw{background:rgba(240,168,50,.13);color:var(--warn)}
.bc{background:rgba(232,85,85,.13);color:var(--crit)}
.bh{background:rgba(107,174,212,.13);color:var(--hold)}
.bd{background:rgba(167,139,250,.13);color:var(--dead)}
.bu{background:rgba(120,110,140,.18);color:var(--t3)}
.bp{background:rgba(201,169,110,.12);color:var(--gold2)}
.btn{display:inline-flex;align-items:center;gap:6px;border-radius:var(--rs);font-size:13px;font-weight:500;padding:9px 18px;white-space:nowrap}
.btn-gold{background:linear-gradient(135deg,#c9a96e,#e2c285);color:#14100a;font-weight:600}
.btn-gold:hover{opacity:.88;transform:translateY(-1px);box-shadow:0 4px 16px rgba(201,169,110,.25)}
.btn-outline{background:transparent;border:1.5px solid var(--border);color:var(--t2)}
.btn-outline:hover{border-color:var(--gold);color:var(--gold)}
.btn-ghost{background:transparent;border:1px solid transparent;color:var(--t3);padding:7px 12px;font-size:12px}
.btn-ghost:hover{color:var(--gold);background:var(--goldglow)}
.btn-danger{background:rgba(232,85,85,.1);border:1px solid rgba(232,85,85,.25);color:var(--crit);padding:5px 11px;border-radius:6px;font-size:12px}
.btn-danger:hover{background:rgba(232,85,85,.2)}
.btn-sm{padding:5px 12px;font-size:12px}
.card{background:var(--s1);border:1.5px solid var(--border);border-radius:var(--r);padding:20px}
.card-inner{background:var(--s2);border:1px solid var(--border);border-radius:var(--rs);padding:16px}
.overlay{position:fixed;inset:0;background:rgba(0,0,0,.72);display:flex;align-items:center;justify-content:center;z-index:1000;backdrop-filter:blur(6px);padding:16px}
.modal{background:var(--s1);border:1.5px solid var(--border2);border-radius:16px;padding:28px;width:100%;max-width:580px;max-height:92vh;overflow-y:auto}
.modal-lg{max-width:920px}
.modal-md{max-width:460px}
.frow{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.fgroup{display:flex;flex-direction:column;gap:5px}
.fgroup label{font-size:11px;font-weight:600;color:var(--t3);letter-spacing:.08em;text-transform:uppercase}
.divider{height:1px;background:var(--border);margin:18px 0}
.nav-tab{padding:7px 18px;border-radius:var(--rs);font-size:13px;font-weight:500;background:transparent;color:var(--t3);border:1px solid transparent}
.nav-tab.active{background:var(--s3);border-color:var(--border2);color:var(--gold)}
.nav-tab:hover:not(.active){color:var(--t2)}
@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
.fade{animation:fadeUp .25s ease}
@keyframes spin{to{transform:rotate(360deg)}}
.spinner{animation:spin .75s linear infinite;border-radius:50%;border:2.5px solid var(--border2);border-top-color:var(--gold)}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
.pulse{animation:pulse 1.5s ease infinite}
.glow-dot{width:7px;height:7px;border-radius:50%;display:inline-block}
.inp-hint{font-size:11px;color:var(--t3);margin-top:3px}
.section-title{font-size:22px;color:var(--gold);margin-bottom:20px}
.empty-state{text-align:center;padding:56px 20px;color:var(--t3)}
.empty-icon{font-size:38px;margin-bottom:12px}
.tag{display:inline-flex;align-items:center;gap:5px;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:500}
`;
  document.head.appendChild(s);
})();

// ── Pure helpers ──────────────────────────────────────────────────────────────
const fmt    = n  => (n ?? 0).toLocaleString('en-IN');
const fmtINR = n  => n > 0 ? `₹${(n).toLocaleString('en-IN')}` : '—';
const fmtDt  = d  => d ? new Date(d).toLocaleString('en-IN',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}) : '—';
const fmtDay = d  => d ? new Date(d).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}) : '—';

function calcStatus(p, dc) {
  if ((p.hold_stock||0) > 0) return 'hold';
  if (dc.enabled) {
    const sold = (p.sales_velocity||0) * dc.period_days;
    if (sold <= dc.threshold) return 'dead';
  }
  const s = p.sellable_stock||0, r = p.reorder_point||5;
  if (s <= r)         return 'critical';
  if (s <= r * 1.25)  return 'warning';
  return 'good';
}

function autoReorderPoint(velocity) {
  if (!velocity || velocity <= 0) return 5;
  return Math.ceil(velocity * 7 * 1.5); // 7-day lead × 1.5 safety
}

function daysToStockout(sellable, velocity) {
  if (!velocity || velocity <= 0) return null;
  return Math.floor(sellable / velocity);
}

const STATUS_META = {
  good:     { label:'GOOD',     cls:'bg', dot:'var(--good)' },
  warning:  { label:'WARNING',  cls:'bw', dot:'var(--warn)' },
  critical: { label:'CRITICAL', cls:'bc', dot:'var(--crit)' },
  hold:     { label:'ON HOLD',  cls:'bh', dot:'var(--hold)' },
  dead:     { label:'DEAD',     cls:'bd', dot:'var(--dead)' },
};

// ─────────────────────────────────────────────────────────────────────────────
//  LOGIN SCREEN
// ─────────────────────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [key, setKey]   = useState('');
  const [err, setErr]   = useState('');
  const [shk, setShk]   = useState(false);

  const submit = () => {
    if (key === SECURITY_KEY) { sessionStorage.setItem('aof_v2_auth','1'); onLogin(); }
    else { setErr('Incorrect key — try again'); setShk(true); setTimeout(()=>setShk(false),500); }
  };

  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',
      background:'radial-gradient(ellipse 80% 60% at 50% 0%,#1e1728 0%,#0c0b0f 70%)'}}>
      <div style={{width:'100%',maxWidth:380,padding:'0 20px',textAlign:'center'}}>
        {/* Logo area */}
        <div style={{marginBottom:32}}>
          <div style={{width:64,height:64,borderRadius:'50%',background:'linear-gradient(135deg,#2a2535,#3d3650)',
            border:'1.5px solid var(--border2)',display:'inline-flex',alignItems:'center',
            justifyContent:'center',fontSize:28,marginBottom:16}}>
            👗
          </div>
          <h1 style={{fontSize:30,color:'var(--gold)',fontWeight:600,marginBottom:4}}>
            Authority of Fashion
          </h1>
          <p style={{fontSize:13,color:'var(--t3)',letterSpacing:'0.06em'}}>INVENTORY MANAGEMENT · v2</p>
        </div>

        <div className="card" style={{
          outline: shk ? '2px solid var(--crit)' : '2px solid transparent',
          transition:'outline .1s',textAlign:'left'
        }}>
          <div className="fgroup" style={{marginBottom:16}}>
            <label>Security Key</label>
            <input type="password" value={key} autoFocus
              placeholder="Enter your access key…"
              onChange={e=>{setKey(e.target.value);setErr('')}}
              onKeyDown={e=>e.key==='Enter'&&submit()}
            />
            {err && <span style={{fontSize:12,color:'var(--crit)',marginTop:2}}>{err}</span>}
          </div>
          <button className="btn btn-gold" style={{width:'100%',justifyContent:'center'}} onClick={submit}>
            Unlock Dashboard →
          </button>
        </div>

        <p style={{fontSize:11,color:'var(--t3)',marginTop:16,lineHeight:1.6}}>
          Set your key via <code style={{background:'var(--s3)',padding:'1px 5px',borderRadius:4,fontSize:11}}>VITE_SECURITY_KEY</code> in Vercel environment variables
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  MAIN APP
// ─────────────────────────────────────────────────────────────────────────────
export default function App() {
  const [authed, setAuthed] = useState(sessionStorage.getItem('aof_v2_auth')==='1');
  if (!authed) return <LoginScreen onLogin={()=>setAuthed(true)} />;
  return <InventoryApp />;
}

function InventoryApp() {
  // ── Core state ──────────────────────────────────────────────────────────────
  const [tab,        setTab]        = useState('dashboard');
  const [products,   setProducts]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers,  setSuppliers]  = useState([]);
  const [snapshots,  setSnapshots]  = useState([]);
  const [loading,    setLoading]    = useState(true);

  // ── Filters ─────────────────────────────────────────────────────────────────
  const [search,     setSearch]     = useState('');
  const [fStatus,    setFStatus]    = useState('all');
  const [fCat,       setFCat]       = useState('all');

  // ── Dead stock config (Point 5) ──────────────────────────────────────────────
  const [deadCfg, setDeadCfg] = useState({
    enabled:true, threshold:0, period_days:30
  });

  // ── Avg sales period for DTS calc (Point 2) ─────────────────────────────────
  const [velPeriod, setVelPeriod] = useState(30);

  // ── Modals ───────────────────────────────────────────────────────────────────
  const [modal, setModal] = useState(null);

  // ── Product form ─────────────────────────────────────────────────────────────
  const [editProd,  setEditProd]  = useState(null);
  const [form,      setForm]      = useState(blankForm());

  // ── Shopify selection (Point 8) ──────────────────────────────────────────────
  const [selected,  setSelected]  = useState(new Set());
  const [lastSync,  setLastSync]  = useState(localStorage.getItem('aof_sync')||null);
  const [lastPush,  setLastPush]  = useState(localStorage.getItem('aof_push')||null);

  // ── PO ───────────────────────────────────────────────────────────────────────
  const [poItems,   setPoItems]   = useState([]);

  // ── Bulk import ──────────────────────────────────────────────────────────────
  const [bulkOpen,  setBulkOpen]  = useState(false);
  const [bulkLog,   setBulkLog]   = useState([]);

  // ── Inline supplier/category editing ────────────────────────────────────────
  const [supForm,  setSupForm]  = useState({name:'',address:'',mobile:'',gst:''});
  const [editSup,  setEditSup]  = useState(null);
  const [catForm,  setCatForm]  = useState({name:''});
  const [editCat,  setEditCat]  = useState(null);

  // ── Boot ─────────────────────────────────────────────────────────────────────
  useEffect(()=>{ fetchAll(); },[]);

  function blankForm() {
    return {
      product_name:'', local_name:'', sku:'',
      sellable_stock:0, new_stock_in:0, hold_stock:0,
      design:'',
      price:0,
      sales_velocity:0,
      reorder_point:5, reorder_point_custom:false,
      category_id:'', supplier_id:'',
    };
  }

  async function fetchAll() {
    setLoading(true);
    try {
      const [pr,cr,sr,snr] = await Promise.all([
        supabase.from('inventory_v2').select('*').order('created_at',{ascending:false}),
        supabase.from('categories').select('*').order('name'),
        supabase.from('suppliers').select('*').order('name'),
        supabase.from('snapshots').select('*').order('created_at',{ascending:false}).limit(20),
      ]);
      if (pr.error) throw pr.error;
      setProducts(pr.data||[]);
      setCategories(cr.data||[]);
      setSuppliers(sr.data||[]);
      setSnapshots(snr.data||[]);
    } catch(e){ alert('DB error: '+e.message); }
    finally{ setLoading(false); }
  }

  // ── Derived ──────────────────────────────────────────────────────────────────
  const filtered = useMemo(()=>products.filter(p=>{
    const q = search.toLowerCase();
    const mSearch = !q || (p.product_name||'').toLowerCase().includes(q)
                       || (p.local_name||'').toLowerCase().includes(q)
                       || String(p.sku||'').toLowerCase().includes(q);
    const st = calcStatus(p,deadCfg);
    const mStatus = fStatus==='all' || st===fStatus;
    const mCat    = fCat==='all' || (fCat==='' ? !p.category_id : String(p.category_id)===fCat);
    return mSearch && mStatus && mCat;
  }),[products,search,fStatus,fCat,deadCfg]);

  const stats = useMemo(()=>{
    const all = products;
    const total         = all.length;
    const critical      = all.filter(p=>calcStatus(p,deadCfg)==='critical').length;
    const warning       = all.filter(p=>calcStatus(p,deadCfg)==='warning').length;
    const dead          = all.filter(p=>calcStatus(p,deadCfg)==='dead').length;
    const onHold        = all.filter(p=>(p.hold_stock||0)>0).length;
    const needReorder   = critical;
    const totalUnits    = all.reduce((a,p)=>a+(p.sellable_stock||0),0);
    const totalValue    = all.reduce((a,p)=>a+((p.sellable_stock||0)*(p.price||0)),0);
    const fastMovers    = [...all].filter(p=>(p.sales_velocity||0)>0).sort((a,b)=>(b.sales_velocity||0)-(a.sales_velocity||0)).slice(0,5);
    const deadItems     = [...all].filter(p=>calcStatus(p,deadCfg)==='dead').sort((a,b)=>(a.sales_velocity||0)-(b.sales_velocity||0)).slice(0,5);
    return { total,critical,warning,dead,onHold,needReorder,totalUnits,totalValue,fastMovers,deadItems };
  },[products,deadCfg]);

  // ── Product CRUD ─────────────────────────────────────────────────────────────
  function openAdd() { setEditProd(null); setForm(blankForm()); setModal('product'); }
  function openEdit(p) {
    setEditProd(p);
    setForm({
      product_name:p.product_name||'', local_name:p.local_name||'', sku:p.sku||'',
      sellable_stock:p.sellable_stock||0, new_stock_in:0, hold_stock:p.hold_stock||0,
      design:p.design||'', price:p.price||0, sales_velocity:p.sales_velocity||0,
      reorder_point:p.reorder_point||5, reorder_point_custom:p.reorder_point_custom||false,
      category_id:p.category_id||'', supplier_id:p.supplier_id||'',
    });
    setModal('product');
  }

  async function saveProd() {
    const d = {...form};
    // Point 10: add incoming stock to sellable
    d.sellable_stock = (parseInt(d.sellable_stock)||0) + (parseInt(d.new_stock_in)||0);
    delete d.new_stock_in;
    // Point 4: auto reorder if not custom — never overwritten by sync
    if (!d.reorder_point_custom) d.reorder_point = autoReorderPoint(d.sales_velocity);
    d.reorder_point  = parseInt(d.reorder_point)||5;
    d.category_id    = d.category_id  || null;
    d.supplier_id    = d.supplier_id  || null;
    d.price          = parseInt(d.price)||0;
    d.sales_velocity = parseFloat(d.sales_velocity)||0;
    try {
      if (editProd) {
        const {error} = await supabase.from('inventory_v2').update(d).eq('id',editProd.id);
        if (error) throw error;
      } else {
        const {error} = await supabase.from('inventory_v2').insert([d]);
        if (error) throw error;
      }
      setModal(null); fetchAll();
    } catch(e){ alert('Error: '+e.message); }
  }

  async function deleteProd(id) {
    if (!confirm('Delete this product?')) return;
    await supabase.from('inventory_v2').delete().eq('id',id);
    fetchAll();
  }

  // ── Category CRUD (Point 12) ──────────────────────────────────────────────────
  async function saveCat() {
    if (!catForm.name.trim()) return;
    if (editCat) await supabase.from('categories').update({name:catForm.name}).eq('id',editCat.id);
    else         await supabase.from('categories').insert([{name:catForm.name}]);
    setCatForm({name:''}); setEditCat(null); fetchAll();
  }
  async function delCat(id) {
    if (!confirm('Delete category? Products become Uncategorized.')) return;
    await supabase.from('inventory_v2').update({category_id:null}).eq('category_id',id);
    await supabase.from('categories').delete().eq('id',id);
    fetchAll();
  }

  // ── Supplier CRUD (Point 7) ───────────────────────────────────────────────────
  async function saveSup() {
    if (!supForm.name.trim()) return;
    if (editSup) await supabase.from('suppliers').update(supForm).eq('id',editSup.id);
    else         await supabase.from('suppliers').insert([supForm]);
    setSupForm({name:'',address:'',mobile:'',gst:''}); setEditSup(null); fetchAll();
  }
  async function delSup(id) {
    if (!confirm('Delete supplier?')) return;
    await supabase.from('suppliers').delete().eq('id',id);
    fetchAll();
  }

  // ── Snapshot (Point 6) ────────────────────────────────────────────────────────
  async function takeSnapshot() {
    await supabase.from('snapshots').insert([{
      taken_at:new Date().toISOString(),
      product_count:products.length,
      total_sellable:products.reduce((a,p)=>a+(p.sellable_stock||0),0),
      total_value:products.reduce((a,p)=>a+((p.sellable_stock||0)*(p.price||0)),0),
      critical_count:stats.critical,
      dead_count:stats.dead,
      data:JSON.stringify(products.map(p=>({id:p.id,sku:p.sku,name:p.product_name,sellable:p.sellable_stock,velocity:p.sales_velocity}))),
    }]);
    fetchAll(); alert('Snapshot saved ✓');
  }

  // ── Purchase Order (Point 3) ──────────────────────────────────────────────────
  function openPO() {
    const items = products
      .filter(p=>['critical','warning'].includes(calcStatus(p,deadCfg)))
      .map(p=>({
        id:p.id, sku:p.sku, product_name:p.product_name, local_name:p.local_name||'',
        current_stock:p.sellable_stock||0, reorder_point:p.reorder_point||5,
        order_qty:Math.max(1,(p.reorder_point||5)*2-(p.sellable_stock||0)),
        supplier:suppliers.find(s=>s.id===p.supplier_id)?.name||'—',
        remark:'',
      }));
    setPoItems(items); setModal('po');
  }

  async function exportPOXLSX() {
    await loadScript(CDN_XLSX);
    const X = window.XLSX;
    const date = new Date().toLocaleDateString('en-IN');
    const data = [
      ['PURCHASE ORDER — Authority of Fashion','','','','','','','',''],
      [`Date: ${date}`,'','','','','','','',''],
      [],
      ['#','SKU','Product Name','Local Name','Current Stock','Reorder Pt','Order Qty','Supplier','Remark'],
      ...poItems.map((r,i)=>[i+1,r.sku,r.product_name,r.local_name,r.current_stock,r.reorder_point,r.order_qty,r.supplier,r.remark||'']),
      [],
      ['','','','','','TOTAL ORDER QTY →',poItems.reduce((a,r)=>a+(parseInt(r.order_qty)||0),0),'',''],
    ];
    const ws = X.utils.aoa_to_sheet(data);
    ws['!cols']=[{wch:4},{wch:14},{wch:34},{wch:22},{wch:14},{wch:12},{wch:12},{wch:20},{wch:34}];
    const wb = X.utils.book_new();
    X.utils.book_append_sheet(wb,ws,'Purchase Order');
    X.writeFile(wb,`PO_AOF_${new Date().toISOString().slice(0,10)}.xlsx`);
  }

  async function exportPOPDF() {
    await loadScript(CDN_JSPDF);
    await loadScript(CDN_AUTOTBL);
    const {jsPDF} = window.jspdf;
    const doc = new jsPDF({orientation:'landscape',unit:'mm',format:'a4'});
    const date = new Date().toLocaleDateString('en-IN');
    doc.setFont('helvetica','bold'); doc.setFontSize(18); doc.setTextColor(201,169,110);
    doc.text('Purchase Order',14,16);
    doc.setFont('helvetica','normal'); doc.setFontSize(9); doc.setTextColor(170,160,155);
    doc.text(`Authority of Fashion   ·   Date: ${date}   ·   ${poItems.length} items`,14,23);
    doc.autoTable({
      startY:28,
      head:[['#','SKU','Product Name','Local Name','Current Stock','Reorder Pt','Order Qty','Supplier','Remark']],
      body:poItems.map((r,i)=>[i+1,r.sku,r.product_name,r.local_name||'—',r.current_stock,r.reorder_point,r.order_qty,r.supplier,r.remark||'']),
      foot:[['','','','','','TOTAL →',poItems.reduce((a,r)=>a+(parseInt(r.order_qty)||0),0),'','']],
      styles:{fontSize:8.5,cellPadding:3.5,textColor:[242,237,232]},
      headStyles:{fillColor:[28,25,34],textColor:[201,169,110],fontStyle:'bold',fontSize:8,lineColor:[56,51,74],lineWidth:.3},
      footStyles:{fillColor:[28,25,34],textColor:[201,169,110],fontStyle:'bold'},
      bodyStyles:{fillColor:[20,18,24],lineColor:[38,33,48],lineWidth:.3},
      alternateRowStyles:{fillColor:[24,22,30]},
      columnStyles:{2:{cellWidth:42},3:{cellWidth:28},8:{cellWidth:44}},
    });
    doc.save(`PO_AOF_${new Date().toISOString().slice(0,10)}.pdf`);
  }

  function exportPODOC() {
    const date = new Date().toLocaleDateString('en-IN');
    const rows = poItems.map((r,i)=>`
      <tr>
        <td style="padding:6px 10px;border:1px solid #ddd;text-align:center;">${i+1}</td>
        <td style="padding:6px 10px;border:1px solid #ddd;font-family:monospace;font-size:11px;">${r.sku}</td>
        <td style="padding:6px 10px;border:1px solid #ddd;font-weight:600;">${r.product_name}</td>
        <td style="padding:6px 10px;border:1px solid #ddd;color:#666;">${r.local_name||'—'}</td>
        <td style="padding:6px 10px;border:1px solid #ddd;text-align:center;color:#c94f4f;font-weight:bold;">${r.current_stock}</td>
        <td style="padding:6px 10px;border:1px solid #ddd;text-align:center;">${r.reorder_point}</td>
        <td style="padding:6px 10px;border:1px solid #ddd;text-align:center;font-weight:bold;font-size:15px;">${r.order_qty}</td>
        <td style="padding:6px 10px;border:1px solid #ddd;">${r.supplier}</td>
        <td style="padding:6px 10px;border:1px solid #ddd;color:#666;">${r.remark||''}</td>
      </tr>`).join('');
    const total = poItems.reduce((a,r)=>a+(parseInt(r.order_qty)||0),0);
    const html = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word'><head><meta charset="utf-8">
<style>body{font-family:Arial,sans-serif;margin:40px}h1{color:#2d2a3a;font-size:24px;margin-bottom:4px}
th{background:#2d2a3a;color:#c9a96e;padding:8px 10px;border:1px solid #2d2a3a;font-size:11px;text-transform:uppercase}
table{width:100%;border-collapse:collapse} .foot td{background:#f5f4f8;font-weight:bold}</style></head>
<body>
<h1>Purchase Order</h1>
<p style="color:#888;margin-bottom:24px;font-size:13px">Authority of Fashion &nbsp;·&nbsp; Date: ${date} &nbsp;·&nbsp; ${poItems.length} items</p>
<table>
<thead><tr><th>#</th><th>SKU</th><th>Product Name</th><th>Local Name</th><th>Current Stock</th><th>Reorder Pt</th><th>Order Qty</th><th>Supplier</th><th>Remark</th></tr></thead>
<tbody>${rows}</tbody>
<tfoot><tr class="foot"><td colspan="6" style="text-align:right;padding:8px 10px;border:1px solid #ddd">TOTAL ORDER QTY</td><td style="text-align:center;padding:8px;border:1px solid #ddd;font-size:16px">${total}</td><td colspan="2" style="border:1px solid #ddd"></td></tr></tfoot>
</table></body></html>`;
    const blob = new Blob(['\ufeff'+html],{type:'application/msword'});
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a'); a.href=url; a.download=`PO_AOF_${new Date().toISOString().slice(0,10)}.doc`; a.click();
    URL.revokeObjectURL(url);
  }

  // ── Shopify push / sync (Point 8) ─────────────────────────────────────────────
  async function pushToShopify() {
    if (!selected.size) return alert('Select at least one product to push.');
    const items = products.filter(p=>selected.has(p.id));
    let ok=0;
    for (const p of items) {
      try {
        const r = await fetch('/api/shopify',{
          method:'POST', headers:{'Content-Type':'application/json'},
          body:JSON.stringify({action:'updateStock',sku:p.sku,quantity:p.sellable_stock}),
        });
        if (r.ok) {
          await supabase.from('inventory_v2').update({last_pushed_at:new Date().toISOString()}).eq('id',p.id);
          ok++;
        }
      } catch{}
    }
    const ts=new Date().toISOString();
    localStorage.setItem('aof_push',ts); setLastPush(ts);
    setSelected(new Set()); fetchAll();
    alert(`✓ Pushed ${ok}/${items.length} products to Shopify`);
  }

  async function syncFromShopify() {
    try {
      const r = await fetch('/api/shopify?action=syncInventory');
      const d = await r.json();
      if (!d.products) throw new Error(d.error||'No products returned');
      let synced=0;
      for (const sp of d.products) {
        const match = products.find(p=>String(p.sku)===String(sp.sku));
        if (match) {
          const upd = {last_synced_at:new Date().toISOString()};
          // Point 4: never overwrite custom reorder point during sync
          if (!match.reorder_point_custom) upd.reorder_point = autoReorderPoint(match.sales_velocity||0);
          await supabase.from('inventory_v2').update(upd).eq('id',match.id);
          synced++;
        }
      }
      const ts=new Date().toISOString();
      localStorage.setItem('aof_sync',ts); setLastSync(ts);
      fetchAll(); alert(`✓ Synced ${synced} products from Shopify`);
    } catch(e){ alert('Sync error: '+e.message); }
  }

  // ── Bulk CSV import ───────────────────────────────────────────────────────────
  async function handleCSV(e) {
    const file=e.target.files[0]; if(!file) return;
    const text=await file.text();
    const lines=text.split('\n').map(l=>l.trim()).filter(Boolean);
    if(lines.length<2) return;
    const headers=lines[0].split(',').map(h=>h.replace(/"/g,'').trim().toLowerCase());
    const log=[];
    for(let i=1;i<lines.length;i++){
      const vals=lines[i].split(',').map(v=>v.replace(/"/g,'').trim());
      const row={}; headers.forEach((h,idx)=>{row[h]=vals[idx]||'';});
      if(!row.sku){log.push(`Row ${i}: skipped — no SKU`);continue;}
      const ex=products.find(p=>String(p.sku)===String(row.sku));
      const d={
        product_name:row.product_name||row['product name']||'',
        local_name:row.local_name||row['local name']||'',
        sku:row.sku, design:row.design||'',
        sellable_stock:parseInt(row.sellable_stock||row.stock||0),
        hold_stock:parseInt(row.hold_stock||0),
        price:parseInt(row.price||0),
        sales_velocity:parseFloat(row.sales_velocity||0),
        reorder_point:parseInt(row.reorder_point||5),
        reorder_point_custom:false, category_id:null, supplier_id:null,
      };
      try {
        if(ex){
          d.sellable_stock=(ex.sellable_stock||0)+d.sellable_stock;
          await supabase.from('inventory_v2').update(d).eq('id',ex.id);
          log.push(`Row ${i}: ✓ Updated SKU ${row.sku}`);
        } else {
          await supabase.from('inventory_v2').insert([d]);
          log.push(`Row ${i}: ✓ Added SKU ${row.sku}`);
        }
      } catch(ex2){log.push(`Row ${i}: ✗ Error — ${ex2.message}`);}
    }
    setBulkLog(log); fetchAll(); e.target.value='';
  }

  // ── Selection helpers ────────────────────────────────────────────────────────
  const toggleSel = id => setSelected(prev=>{const n=new Set(prev);n.has(id)?n.delete(id):n.add(id);return n;});
  const selectAll = () => setSelected(prev=>prev.size===filtered.length?new Set():new Set(filtered.map(p=>p.id)));

  // ── Lookups ──────────────────────────────────────────────────────────────────
  const getCat = id => categories.find(c=>c.id===id)?.name||'Uncategorized';
  const getSup = id => suppliers.find(s=>s.id===id)?.name||'—';

  // ─────────────────────────────────────────────────────────────────────────────
  //  LOADING
  // ─────────────────────────────────────────────────────────────────────────────
  if (loading) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:16}}>
      <div className="spinner" style={{width:36,height:36}}/>
      <p style={{color:'var(--t3)',fontSize:13}}>Loading inventory…</p>
    </div>
  );

  // ─────────────────────────────────────────────────────────────────────────────
  //  RENDER
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div style={{minHeight:'100vh',display:'flex',flexDirection:'column'}}>

      {/* ════════════════ NAV ════════════════ */}
      <nav style={{
        background:'var(--s1)',borderBottom:'1.5px solid var(--border)',
        padding:'0 28px',display:'flex',alignItems:'center',
        justifyContent:'space-between',height:58,
        position:'sticky',top:0,zIndex:200,
        boxShadow:'0 2px 20px rgba(0,0,0,.35)'
      }}>
        {/* Brand */}
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <div style={{width:32,height:32,borderRadius:8,background:'linear-gradient(135deg,var(--s3),var(--s4))',
            border:'1px solid var(--border2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16}}>
            👗
          </div>
          <div>
            <div style={{fontFamily:'Cormorant Garamond',color:'var(--gold)',fontSize:16,fontWeight:600,lineHeight:1.2}}>
              Authority of Fashion
            </div>
            <div style={{fontSize:9.5,color:'var(--t3)',letterSpacing:'0.12em',textTransform:'uppercase',lineHeight:1}}>
              Inventory v2
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{display:'flex',gap:4}}>
          {[
            {id:'dashboard',icon:'⬡',label:'Dashboard'},
            {id:'inventory',icon:'⊞',label:'Inventory'},
            {id:'suppliers',icon:'◈',label:'Suppliers'},
            {id:'categories',icon:'⊹',label:'Categories'},
            {id:'changelog',icon:'◷',label:'Changelog'},
          ].map(t=>(
            <button key={t.id} className={`nav-tab${tab===t.id?' active':''}`} onClick={()=>setTab(t.id)}>
              <span style={{marginRight:5,opacity:.7}}>{t.icon}</span>{t.label}
            </button>
          ))}
        </div>

        {/* Lock */}
        <button className="btn btn-outline btn-sm" onClick={()=>{sessionStorage.removeItem('aof_v2_auth');window.location.reload();}}>
          🔒 Lock
        </button>
      </nav>

      {/* ════════════════ CONTENT ════════════════ */}
      <main style={{flex:1,padding:'28px 32px',maxWidth:1700,margin:'0 auto',width:'100%'}}>

        {/* ───────────── DASHBOARD ───────────── */}
        {tab==='dashboard' && (
          <div className="fade">
            {/* Header row */}
            <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:24}}>
              <div>
                <h2 style={{fontSize:28,color:'var(--gold)'}}>Good day 👋</h2>
                <p style={{color:'var(--t3)',fontSize:13,marginTop:3}}>Here's your inventory at a glance — {fmtDay(new Date().toISOString())}</p>
              </div>
              <div style={{display:'flex',gap:10}}>
                <button className="btn btn-outline" onClick={()=>setModal('deadcfg')}>⚙ Dead Stock Rules</button>
                <button className="btn btn-gold" onClick={takeSnapshot}>📸 Snapshot</button>
              </div>
            </div>

            {/* Stat cards — Point 9 */}
            <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:14,marginBottom:24}}>
              {[
                {label:'Total SKUs',       val:fmt(stats.total),          color:'var(--gold)',  bg:'rgba(201,169,110,.06)'},
                {label:'Need Reorder',     val:fmt(stats.needReorder),    color:'var(--crit)',  bg:'rgba(232,85,85,.06)'},
                {label:'Low Warning',      val:fmt(stats.warning),        color:'var(--warn)',  bg:'rgba(240,168,50,.06)'},
                {label:'Dead Stock',       val:fmt(stats.dead),           color:'var(--dead)',  bg:'rgba(167,139,250,.06)'},
                {label:'On Hold',          val:fmt(stats.onHold),         color:'var(--hold)',  bg:'rgba(107,174,212,.06)'},
                {label:'Sellable Units',   val:fmt(stats.totalUnits),     color:'var(--teal)',  bg:'rgba(91,191,170,.06)'},
                {label:'Sellable Value',   val:fmtINR(stats.totalValue),  color:'var(--gold2)', bg:'rgba(226,194,133,.06)', small:true},
              ].map(s=>(
                <div key={s.label} style={{background:s.bg,border:`1.5px solid ${s.color}22`,borderRadius:var(--r)||10,padding:'18px 16px',position:'relative',overflow:'hidden'}}>
                  <div style={{fontSize:s.small&&stats.totalValue>99999?18:28,fontFamily:'Cormorant Garamond',fontWeight:700,color:s.color,lineHeight:1.1}}>
                    {s.val}
                  </div>
                  <div style={{fontSize:10.5,color:'var(--t3)',textTransform:'uppercase',letterSpacing:'.08em',marginTop:5}}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Top lists + reorder table */}
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:18,marginBottom:18}}>
              {/* Fast movers */}
              <div className="card">
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
                  <h3 style={{fontSize:16,color:'var(--gold)'}}>🚀 Top 5 Fast Movers</h3>
                  <span style={{fontSize:11,color:'var(--t3)'}}>by daily velocity</span>
                </div>
                {stats.fastMovers.length===0
                  ? <div className="empty-state" style={{padding:'24px 0'}}><div style={{fontSize:24}}>📊</div><p style={{fontSize:12,marginTop:8}}>Add sales velocity to products to see fast movers</p></div>
                  : stats.fastMovers.map((p,i)=>{
                    const dts=daysToStockout(p.sellable_stock,p.sales_velocity);
                    return (
                      <div key={p.id} style={{display:'flex',alignItems:'center',gap:12,padding:'9px 0',borderBottom:i<4?'1px solid var(--border)':'none'}}>
                        <div style={{width:22,height:22,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:700,
                          background:i===0?'rgba(201,169,110,.2)':i===1?'rgba(201,169,110,.12)':i===2?'rgba(201,169,110,.07)':'var(--s3)',
                          color:i<2?'var(--gold)':i===2?'var(--gold2)':'var(--t3)',flexShrink:0}}>
                          {i+1}
                        </div>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontSize:13,fontWeight:500,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{p.product_name}</div>
                          <div style={{fontSize:11,color:'var(--t3)'}}>SKU {p.sku} · {p.sales_velocity}/day</div>
                        </div>
                        <div style={{textAlign:'right',flexShrink:0}}>
                          <div style={{fontSize:13,fontWeight:600,color:'var(--teal)'}}>{p.sellable_stock} units</div>
                          {dts!==null&&<div style={{fontSize:10,color:dts<7?'var(--crit)':dts<14?'var(--warn)':'var(--t3)'}}>{dts}d left</div>}
                        </div>
                      </div>
                    );
                  })}
              </div>

              {/* Dead stock */}
              <div className="card">
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
                  <h3 style={{fontSize:16,color:'var(--dead)'}}>💀 Top 5 Dead Stock</h3>
                  <button className="btn btn-ghost" style={{fontSize:11,padding:'4px 8px'}} onClick={()=>setModal('deadcfg')}>configure ⚙</button>
                </div>
                {stats.deadItems.length===0
                  ? <div className="empty-state" style={{padding:'24px 0'}}><div style={{fontSize:24}}>🎉</div><p style={{fontSize:12,marginTop:8}}>No dead stock — great stock health!</p></div>
                  : stats.deadItems.map((p,i)=>(
                    <div key={p.id} style={{display:'flex',alignItems:'center',gap:12,padding:'9px 0',borderBottom:i<4?'1px solid var(--border)':'none'}}>
                      <div style={{width:22,height:22,borderRadius:'50%',background:'rgba(167,139,250,.1)',color:'var(--dead)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:700,flexShrink:0}}>{i+1}</div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:13,fontWeight:500,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{p.product_name}</div>
                        <div style={{fontSize:11,color:'var(--t3)'}}>SKU {p.sku} · {getCat(p.category_id)}</div>
                      </div>
                      <div style={{fontSize:13,fontWeight:600,color:'var(--dead)',flexShrink:0}}>{p.sellable_stock} units</div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Reorder now table */}
            <div className="card">
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
                <h3 style={{fontSize:16}}>
                  <span style={{color:'var(--crit)'}}>●</span>
                  <span style={{marginLeft:8}}>Reorder Required Now</span>
                  <span style={{fontSize:13,fontWeight:400,color:'var(--t3)',marginLeft:8}}>({stats.needReorder} products)</span>
                </h3>
                {stats.needReorder>0 && <button className="btn btn-gold btn-sm" onClick={openPO}>Generate PO →</button>}
              </div>
              {stats.needReorder===0
                ? <p style={{color:'var(--good)',fontSize:13}}>✅ All stock levels are healthy.</p>
                : <div style={{overflowX:'auto'}}>
                  <table>
                    <thead><tr><th>Product</th><th>SKU</th><th>Category</th><th>Sellable</th><th>Reorder Pt</th><th>Days to Stockout</th><th>Supplier</th></tr></thead>
                    <tbody>
                      {products.filter(p=>calcStatus(p,deadCfg)==='critical').map(p=>{
                        const dts=daysToStockout(p.sellable_stock,p.sales_velocity);
                        return (
                          <tr key={p.id}>
                            <td style={{fontWeight:500}}>{p.product_name}</td>
                            <td style={{fontFamily:'monospace',fontSize:12,color:'var(--gold)'}}>{p.sku}</td>
                            <td><span className="badge bu">{getCat(p.category_id)}</span></td>
                            <td><span style={{color:'var(--crit)',fontWeight:700}}>{p.sellable_stock}</span></td>
                            <td style={{color:'var(--t3)'}}>{p.reorder_point}</td>
                            <td>{dts!==null?<span style={{color:dts<7?'var(--crit)':dts<14?'var(--warn)':'var(--t3)',fontWeight:600}}>{dts}d</span>:'—'}</td>
                            <td style={{fontSize:12,color:'var(--t3)'}}>{getSup(p.supplier_id)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>}
            </div>
          </div>
        )}

        {/* ───────────── INVENTORY ───────────── */}
        {tab==='inventory' && (
          <div className="fade">
            {/* Toolbar */}
            <div style={{display:'flex',gap:10,marginBottom:14,flexWrap:'wrap',alignItems:'center'}}>
              <input style={{maxWidth:260}} placeholder="🔍  Search name, SKU, local name…" value={search} onChange={e=>setSearch(e.target.value)}/>

              <select style={{width:'auto'}} value={fStatus} onChange={e=>setFStatus(e.target.value)}>
                <option value="all">All Status</option>
                <option value="good">Good</option>
                <option value="warning">Warning</option>
                <option value="critical">Critical</option>
                <option value="dead">Dead Stock</option>
                <option value="hold">On Hold</option>
              </select>

              <select style={{width:'auto'}} value={fCat} onChange={e=>setFCat(e.target.value)}>
                <option value="all">All Categories</option>
                <option value="">Uncategorized</option>
                {categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
              </select>

              {/* Point 2: avg sales period selector */}
              <select style={{width:'auto'}} value={velPeriod} onChange={e=>setVelPeriod(Number(e.target.value))} title="Sets the sales window used to calculate Days-to-Stockout">
                <option value={7}>Avg Period: 1 Week</option>
                <option value={30}>Avg Period: 1 Month</option>
                <option value={90}>Avg Period: 3 Months</option>
                <option value={180}>Avg Period: 6 Months</option>
                <option value={365}>Avg Period: 1 Year</option>
              </select>

              <div style={{marginLeft:'auto',display:'flex',gap:8,flexWrap:'wrap'}}>
                {selected.size>0&&(
                  <button className="btn btn-gold" onClick={pushToShopify}>
                    🔼 Push {selected.size} to Shopify
                  </button>
                )}
                <button className="btn btn-outline" onClick={syncFromShopify}>🔄 Sync Shopify</button>
                <button className="btn btn-outline" onClick={openPO}>📋 Gen PO</button>
                <button className="btn btn-outline" onClick={()=>setBulkOpen(v=>!v)}>📦 Bulk Import</button>
                <button className="btn btn-gold" onClick={openAdd}>+ Add Product</button>
              </div>
            </div>

            {/* Sync/push timestamps */}
            <div style={{display:'flex',gap:20,marginBottom:10,fontSize:11,color:'var(--t3)'}}>
              {lastSync&&<span>🔄 Last sync from Shopify: {fmtDt(lastSync)}</span>}
              {lastPush&&<span>🔼 Last push to Shopify: {fmtDt(lastPush)}</span>}
            </div>

            {/* Bulk import panel */}
            {bulkOpen&&(
              <div className="card" style={{marginBottom:14}}>
                <h4 style={{fontSize:14,marginBottom:10,color:'var(--gold)'}}>Bulk Import CSV</h4>
                <p style={{fontSize:12,color:'var(--t3)',marginBottom:10,lineHeight:1.6}}>
                  Columns: <code style={{background:'var(--s3)',padding:'1px 5px',borderRadius:4}}>product_name, local_name, sku, sellable_stock, hold_stock, design, price, reorder_point, sales_velocity</code><br/>
                  If SKU already exists → adds incoming stock to existing. If new SKU → creates product.
                </p>
                <input type="file" accept=".csv" onChange={handleCSV} style={{width:'auto'}}/>
                {bulkLog.length>0&&(
                  <div style={{marginTop:12,background:'var(--s3)',borderRadius:8,padding:12,maxHeight:150,overflowY:'auto',fontSize:12,fontFamily:'monospace',color:'var(--t2)'}}>
                    {bulkLog.map((l,i)=><div key={i} style={{color:l.includes('✗')?'var(--crit)':'var(--good)'}}>{l}</div>)}
                  </div>
                )}
              </div>
            )}

            {/* Table */}
            <div className="card" style={{padding:0,overflow:'hidden'}}>
              <div style={{overflowX:'auto'}}>
                <table>
                  <thead>
                    <tr>
                      <th style={{width:36,paddingLeft:16}}>
                        <input type="checkbox"
                          checked={selected.size>0&&selected.size===filtered.length}
                          onChange={selectAll}/>
                      </th>
                      <th>Product Name</th>
                      <th>Local Name</th>
                      <th>SKU</th>
                      <th>Category</th>
                      <th>Sellable</th>
                      <th>Hold</th>
                      <th>Price ₹</th>
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
                    {filtered.length===0&&(
                      <tr><td colSpan={15}><div className="empty-state"><div className="empty-icon">🔍</div><p>No products match your filters.</p></div></td></tr>
                    )}
                    {filtered.map(p=>{
                      const st  = calcStatus(p,deadCfg);
                      const sm  = STATUS_META[st];
                      const dts = daysToStockout(p.sellable_stock,p.sales_velocity);
                      return (
                        <tr key={p.id} style={{opacity:st==='dead'?0.8:1}}>
                          <td style={{paddingLeft:16}}>
                            <input type="checkbox" checked={selected.has(p.id)} onChange={()=>toggleSel(p.id)}/>
                          </td>
                          <td style={{fontWeight:500,maxWidth:220}}>
                            <div style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{p.product_name}</div>
                          </td>
                          <td style={{color:'var(--t2)',fontSize:12,maxWidth:150}}>
                            <div style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{p.local_name||'—'}</div>
                          </td>
                          <td style={{fontFamily:'monospace',fontSize:11.5,color:'var(--gold)'}}>{p.sku}</td>
                          <td>
                            <span className={`badge ${p.category_id?'bp':'bu'}`}>{getCat(p.category_id)}</span>
                          </td>
                          <td style={{fontWeight:600}}>{fmt(p.sellable_stock)}</td>
                          <td style={{color:'var(--hold)'}}>{fmt(p.hold_stock)||'—'}</td>
                          <td style={{color:'var(--t3)',fontSize:12}}>{p.price?`₹${fmt(p.price)}`:'—'}</td>
                          <td style={{fontSize:12}}>
                            {fmt(p.reorder_point)}
                            {p.reorder_point_custom&&<span style={{fontSize:9,color:'var(--gold)',marginLeft:4,verticalAlign:'middle'}} title="Custom reorder point">✎</span>}
                          </td>
                          <td>
                            {dts!==null
                              ?<span style={{fontWeight:600,fontSize:13,color:dts<7?'var(--crit)':dts<14?'var(--warn)':'var(--good)'}}>{dts}d</span>
                              :<span style={{color:'var(--t3)',fontSize:12}}>—</span>}
                          </td>
                          <td style={{fontSize:12,color:'var(--t3)'}}>{p.sales_velocity||0}</td>
                          <td>
                            <span className={`badge ${sm.cls}`}>
                              <span style={{width:5,height:5,borderRadius:'50%',background:sm.dot,display:'inline-block'}}/>
                              {sm.label}
                            </span>
                          </td>
                          <td style={{fontSize:12,color:'var(--t3)'}}>{getSup(p.supplier_id)}</td>
                          <td style={{fontSize:11}}>
                            {p.last_pushed_at
                              ?<span style={{color:'var(--teal)',fontSize:11}}>✓ {fmtDt(p.last_pushed_at)}</span>
                              :<span style={{color:'var(--t3)'}}>Not pushed</span>}
                          </td>
                          <td>
                            <div style={{display:'flex',gap:6}}>
                              <button className="btn btn-ghost btn-sm" onClick={()=>openEdit(p)}>Edit</button>
                              <button className="btn-danger" onClick={()=>deleteProd(p.id)}>✕</button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {/* Footer bar */}
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 16px',borderTop:'1px solid var(--border)',fontSize:12,color:'var(--t3)'}}>
                <span>{filtered.length} of {products.length} products · {selected.size} selected</span>
                <span>Avg period: {velPeriod} days</span>
              </div>
            </div>
          </div>
        )}

        {/* ───────────── SUPPLIERS ───────────── */}
        {tab==='suppliers' && (
          <div className="fade">
            <h2 className="section-title">Supplier Master List</h2>
            <div style={{display:'grid',gridTemplateColumns:'360px 1fr',gap:20}}>
              {/* Form */}
              <div className="card">
                <h4 style={{fontSize:15,marginBottom:16,color:'var(--gold)'}}>{editSup?'Edit Supplier':'Add New Supplier'}</h4>
                {[['name','Supplier Name *'],['address','Address'],['mobile','Mobile No.'],['gst','GST ID']].map(([k,lbl])=>(
                  <div className="fgroup" key={k} style={{marginBottom:13}}>
                    <label>{lbl}</label>
                    <input value={supForm[k]} onChange={e=>setSupForm(p=>({...p,[k]:e.target.value}))} placeholder={k==='name'?'e.g. Varanasi Fabrics Co.':k==='gst'?'22AAAAA0000A1Z5':''}/>
                  </div>
                ))}
                <div style={{display:'flex',gap:8,marginTop:4}}>
                  <button className="btn btn-gold" style={{flex:1}} onClick={saveSup}>{editSup?'Update Supplier':'Add Supplier'}</button>
                  {editSup&&<button className="btn btn-outline" onClick={()=>{setEditSup(null);setSupForm({name:'',address:'',mobile:'',gst:''});}}>Cancel</button>}
                </div>
              </div>
              {/* List */}
              <div className="card" style={{padding:0}}>
                <table>
                  <thead><tr><th>Name</th><th>Address</th><th>Mobile</th><th>GST ID</th><th>Actions</th></tr></thead>
                  <tbody>
                    {suppliers.length===0&&<tr><td colSpan={5}><div className="empty-state"><div className="empty-icon">🏭</div><p>No suppliers yet.</p></div></td></tr>}
                    {suppliers.map(s=>(
                      <tr key={s.id}>
                        <td style={{fontWeight:600}}>{s.name}</td>
                        <td style={{color:'var(--t3)',fontSize:12}}>{s.address||'—'}</td>
                        <td style={{fontSize:12}}>{s.mobile||'—'}</td>
                        <td style={{fontFamily:'monospace',fontSize:11,color:'var(--gold2)'}}>{s.gst||'—'}</td>
                        <td>
                          <div style={{display:'flex',gap:6}}>
                            <button className="btn btn-ghost btn-sm" onClick={()=>{setEditSup(s);setSupForm({name:s.name,address:s.address||'',mobile:s.mobile||'',gst:s.gst||''});}}>Edit</button>
                            <button className="btn-danger" onClick={()=>delSup(s.id)}>✕</button>
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

        {/* ───────────── CATEGORIES ───────────── */}
        {tab==='categories' && (
          <div className="fade">
            <h2 className="section-title">Product Categories</h2>
            <div style={{display:'grid',gridTemplateColumns:'300px 1fr',gap:20}}>
              {/* Form */}
              <div className="card">
                <h4 style={{fontSize:15,marginBottom:16,color:'var(--gold)'}}>{editCat?'Rename Category':'Create Category'}</h4>
                <p style={{fontSize:12,color:'var(--t3)',marginBottom:14,lineHeight:1.6}}>
                  Name your own categories. New products start as Uncategorized. Categories survive Shopify syncs — only you can change them.
                </p>
                <div className="fgroup" style={{marginBottom:14}}>
                  <label>Category Name</label>
                  <input value={catForm.name} onChange={e=>setCatForm({name:e.target.value})} placeholder="e.g. Sarees, Blouses, Earrings…"/>
                </div>
                <div style={{display:'flex',gap:8}}>
                  <button className="btn btn-gold" style={{flex:1}} onClick={saveCat}>{editCat?'Rename':'Create'}</button>
                  {editCat&&<button className="btn btn-outline" onClick={()=>{setEditCat(null);setCatForm({name:''});}}>Cancel</button>}
                </div>
              </div>
              {/* List */}
              <div className="card" style={{padding:0}}>
                <table>
                  <thead><tr><th>Category Name</th><th>Products</th><th>Actions</th></tr></thead>
                  <tbody>
                    {categories.length===0&&<tr><td colSpan={3}><div className="empty-state"><div className="empty-icon">🏷</div><p>No categories yet.</p></div></td></tr>}
                    {categories.map(c=>(
                      <tr key={c.id}>
                        <td style={{fontWeight:600}}>{c.name}</td>
                        <td>
                          <span className="badge bp">{products.filter(p=>p.category_id===c.id).length} products</span>
                        </td>
                        <td>
                          <div style={{display:'flex',gap:6}}>
                            <button className="btn btn-ghost btn-sm" onClick={()=>{setEditCat(c);setCatForm({name:c.name});}}>Rename</button>
                            <button className="btn-danger" onClick={()=>delCat(c.id)}>✕</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    <tr>
                      <td style={{color:'var(--t3)',fontStyle:'italic'}}>Uncategorized</td>
                      <td><span className="badge bu">{products.filter(p=>!p.category_id).length} products</span></td>
                      <td style={{color:'var(--t3)',fontSize:12}}>Default</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ───────────── CHANGELOG ───────────── */}
        {tab==='changelog' && (
          <div className="fade">
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20}}>
              <div>
                <h2 className="section-title" style={{marginBottom:4}}>Weekly Snapshots</h2>
                <p style={{fontSize:12,color:'var(--t3)'}}>Take a snapshot each week to track inventory movement over time.</p>
              </div>
              <button className="btn btn-gold" onClick={takeSnapshot}>📸 Take Snapshot Now</button>
            </div>
            {snapshots.length===0
              ? <div className="card empty-state"><div className="empty-icon">📸</div><p>No snapshots yet. Take your first one now.</p></div>
              : (
                <div style={{display:'flex',flexDirection:'column',gap:10}}>
                  {snapshots.map((snap,i)=>{
                    const prev = snapshots[i+1];
                    const diff = prev ? (snap.total_sellable - prev.total_sellable) : null;
                    return (
                      <div key={snap.id} className="card" style={{display:'flex',alignItems:'center',gap:20,padding:'16px 20px'}}>
                        <div style={{width:10,height:10,borderRadius:'50%',background:i===0?'var(--good)':'var(--border2)',flexShrink:0}}/>
                        <div style={{flex:1}}>
                          <div style={{fontWeight:600,fontSize:14}}>{fmtDt(snap.taken_at)}</div>
                          <div style={{fontSize:12,color:'var(--t3)',marginTop:3,display:'flex',gap:16,flexWrap:'wrap'}}>
                            <span>{snap.product_count} SKUs</span>
                            <span>{fmt(snap.total_sellable)} sellable units</span>
                            {snap.total_value>0&&<span>{fmtINR(snap.total_value)} value</span>}
                            <span style={{color:'var(--crit)'}}>{snap.critical_count} critical</span>
                            {snap.dead_count>0&&<span style={{color:'var(--dead)'}}>{snap.dead_count} dead</span>}
                          </div>
                        </div>
                        {diff!==null&&(
                          <div style={{textAlign:'right',flexShrink:0}}>
                            <div style={{fontSize:13,fontWeight:600,color:diff<0?'var(--crit)':diff>0?'var(--good)':'var(--t3)'}}>
                              {diff>0?'+':''}{fmt(diff)} units
                            </div>
                            <div style={{fontSize:11,color:'var(--t3)'}}>vs prev snapshot</div>
                          </div>
                        )}
                        {i===0&&<span className="badge bg" style={{flexShrink:0}}>LATEST</span>}
                      </div>
                    );
                  })}
                </div>
              )}
          </div>
        )}
      </main>

      {/* ═══════════════════════════════════════════
           MODALS
         ═══════════════════════════════════════════ */}

      {/* ── Add / Edit Product ── */}
      {modal==='product' && (
        <div className="overlay" onClick={e=>e.target===e.currentTarget&&setModal(null)}>
          <div className="modal fade" style={{maxWidth:640}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:22}}>
              <h3 style={{fontSize:20}}>{editProd?'Edit Product':'Add Product'}</h3>
              <button onClick={()=>setModal(null)} style={{background:'none',color:'var(--t3)',fontSize:22,lineHeight:1}}>×</button>
            </div>

            <div className="frow" style={{marginBottom:13}}>
              <div className="fgroup">
                <label>Product Name *</label>
                <input value={form.product_name} onChange={e=>setForm(p=>({...p,product_name:e.target.value}))} placeholder="Velvet Temptation After Dark"/>
              </div>
              <div className="fgroup">
                <label>Local Name</label>
                <input value={form.local_name} onChange={e=>setForm(p=>({...p,local_name:e.target.value}))} placeholder="Red plain georgette"/>
              </div>
            </div>

            <div className="frow" style={{marginBottom:13}}>
              <div className="fgroup">
                <label>SKU *</label>
                <input value={form.sku} onChange={e=>setForm(p=>({...p,sku:e.target.value}))} placeholder="AOF-001"/>
              </div>
              <div className="fgroup">
                <label>Design / Fabric</label>
                <input value={form.design} onChange={e=>setForm(p=>({...p,design:e.target.value}))} placeholder="Chiffon, Border, Plain…"/>
              </div>
            </div>

            <div className="divider"/>

            {/* Point 10: incoming stock field */}
            <div className="frow" style={{marginBottom:8}}>
              <div className="fgroup">
                <label>Current Sellable Stock</label>
                <input type="number" value={form.sellable_stock} onChange={e=>setForm(p=>({...p,sellable_stock:e.target.value}))}/>
              </div>
              <div className="fgroup">
                <label>➕ Add Incoming Stock</label>
                <input type="number" min="0" value={form.new_stock_in} onChange={e=>setForm(p=>({...p,new_stock_in:e.target.value}))} placeholder="Units arriving — added to sellable"/>
              </div>
            </div>
            {/* Preview */}
            {parseInt(form.new_stock_in)>0&&(
              <div style={{background:'rgba(201,169,110,.07)',border:'1px solid rgba(201,169,110,.18)',borderRadius:7,padding:'7px 13px',fontSize:12,color:'var(--gold2)',marginBottom:13}}>
                New total after save: <strong>{(parseInt(form.sellable_stock)||0)+(parseInt(form.new_stock_in)||0)} units</strong>
              </div>
            )}

            <div className="frow" style={{marginBottom:13}}>
              <div className="fgroup">
                <label>Hold Stock</label>
                <input type="number" value={form.hold_stock} onChange={e=>setForm(p=>({...p,hold_stock:e.target.value}))}/>
              </div>
              <div className="fgroup">
                <label>Selling Price (₹)</label>
                <input type="number" value={form.price} onChange={e=>setForm(p=>({...p,price:e.target.value}))} placeholder="e.g. 1095"/>
                <span className="inp-hint">Used to calculate total inventory value</span>
              </div>
            </div>

            <div className="frow" style={{marginBottom:13}}>
              <div className="fgroup">
                <label>Sales Velocity (units/day)</label>
                <input type="number" step="0.1" value={form.sales_velocity} onChange={e=>setForm(p=>({...p,sales_velocity:e.target.value}))} placeholder="e.g. 1.5"/>
                <span className="inp-hint">Used to auto-calculate reorder point & days to stockout</span>
              </div>
              <div className="fgroup">
                {/* Point 4: reorder point with custom lock */}
                <label style={{display:'flex',alignItems:'center',gap:8}}>
                  Reorder Point
                  <label style={{display:'flex',alignItems:'center',gap:5,fontWeight:400,fontSize:10,textTransform:'none',letterSpacing:0,cursor:'pointer'}}>
                    <input type="checkbox" style={{width:'auto'}} checked={form.reorder_point_custom} onChange={e=>setForm(p=>({...p,reorder_point_custom:e.target.checked}))}/>
                    Lock (custom)
                  </label>
                </label>
                <input type="number" value={form.reorder_point} onChange={e=>setForm(p=>({...p,reorder_point:e.target.value}))} disabled={!form.reorder_point_custom} style={{opacity:form.reorder_point_custom?1:.5}}/>
                <span className="inp-hint">{form.reorder_point_custom?'Custom — not changed by sync':`Auto: ${autoReorderPoint(form.sales_velocity)} units · tick to lock`}</span>
              </div>
            </div>

            <div className="frow" style={{marginBottom:20}}>
              <div className="fgroup">
                {/* Point 12: category dropdown */}
                <label>Category</label>
                <select value={form.category_id} onChange={e=>setForm(p=>({...p,category_id:e.target.value}))}>
                  <option value="">Uncategorized</option>
                  {categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="fgroup">
                {/* Point 7: supplier dropdown */}
                <label>Supplier</label>
                <select value={form.supplier_id} onChange={e=>setForm(p=>({...p,supplier_id:e.target.value}))}>
                  <option value="">— No Supplier —</option>
                  {suppliers.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            </div>

            <div style={{display:'flex',gap:10}}>
              <button className="btn btn-gold" style={{flex:1}} onClick={saveProd}>{editProd?'Save Changes':'Add Product'}</button>
              <button className="btn btn-outline" onClick={()=>setModal(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Purchase Order ── Point 3 */}
      {modal==='po' && (
        <div className="overlay" onClick={e=>e.target===e.currentTarget&&setModal(null)}>
          <div className="modal modal-lg fade">
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
              <div>
                <h3 style={{fontSize:20}}>📋 Purchase Order</h3>
                <p style={{fontSize:12,color:'var(--t3)',marginTop:3}}>{poItems.length} items need reordering · Edit quantities & add remarks before export</p>
              </div>
              <button onClick={()=>setModal(null)} style={{background:'none',color:'var(--t3)',fontSize:22,lineHeight:1}}>×</button>
            </div>

            <div style={{overflowX:'auto',marginBottom:16,borderRadius:var(--rs)||8,border:'1px solid var(--border)',overflow:'hidden'}}>
              <table>
                <thead>
                  <tr><th>#</th><th>Product</th><th>Local Name</th><th>SKU</th><th>Stock</th><th>Reorder</th><th style={{minWidth:90}}>Order Qty</th><th>Supplier</th><th style={{minWidth:200}}>Remark / Note</th></tr>
                </thead>
                <tbody>
                  {poItems.length===0&&<tr><td colSpan={9}><div className="empty-state" style={{padding:'20px 0'}}><p>No items need reordering right now.</p></div></td></tr>}
                  {poItems.map((item,i)=>(
                    <tr key={item.id}>
                      <td style={{color:'var(--t3)',fontSize:12}}>{i+1}</td>
                      <td style={{fontWeight:500,maxWidth:200}}><div style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{item.product_name}</div></td>
                      <td style={{color:'var(--t3)',fontSize:12}}>{item.local_name||'—'}</td>
                      <td style={{fontFamily:'monospace',fontSize:11,color:'var(--gold)'}}>{item.sku}</td>
                      <td><span style={{color:'var(--crit)',fontWeight:700}}>{item.current_stock}</span></td>
                      <td style={{fontSize:12,color:'var(--t3)'}}>{item.reorder_point}</td>
                      <td>
                        <input type="number" min="1" value={item.order_qty}
                          style={{padding:'6px 10px'}}
                          onChange={e=>setPoItems(prev=>prev.map((p,j)=>j===i?{...p,order_qty:parseInt(e.target.value)||1}:p))}/>
                      </td>
                      <td style={{fontSize:12,color:'var(--t3)'}}>{item.supplier}</td>
                      <td>
                        <input value={item.remark}
                          style={{padding:'6px 10px',fontSize:12}}
                          placeholder="Optional remark…"
                          onChange={e=>setPoItems(prev=>prev.map((p,j)=>j===i?{...p,remark:e.target.value}:p))}/>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total row */}
            <div style={{background:'var(--s3)',borderRadius:8,padding:'10px 16px',fontSize:13,color:'var(--gold)',fontWeight:600,marginBottom:16,display:'flex',justifyContent:'space-between'}}>
              <span>Total Order Qty:</span>
              <span>{poItems.reduce((a,r)=>a+(parseInt(r.order_qty)||0),0)} units across {poItems.length} SKUs</span>
            </div>

            {/* Export buttons */}
            <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
              <button className="btn btn-gold" onClick={exportPOXLSX}>⬇ Excel (.xlsx)</button>
              <button className="btn btn-gold" style={{background:'linear-gradient(135deg,#b05870,#d4748a)',color:'#fff'}} onClick={exportPOPDF}>⬇ PDF</button>
              <button className="btn btn-outline" onClick={exportPODOC}>⬇ Word (.doc)</button>
              <button className="btn btn-outline" style={{marginLeft:'auto'}} onClick={()=>setModal(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Dead Stock Config ── Point 5 */}
      {modal==='deadcfg' && (
        <div className="overlay" onClick={e=>e.target===e.currentTarget&&setModal(null)}>
          <div className="modal modal-md fade">
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
              <h3 style={{fontSize:20}}>⚙ Dead Stock Rules</h3>
              <button onClick={()=>setModal(null)} style={{background:'none',color:'var(--t3)',fontSize:22}}>×</button>
            </div>

            <div className="fgroup" style={{marginBottom:16}}>
              <label style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer'}}>
                <input type="checkbox" style={{width:'auto'}} checked={deadCfg.enabled} onChange={e=>setDeadCfg(p=>({...p,enabled:e.target.checked}))}/>
                <span>Enable dead stock detection</span>
              </label>
            </div>

            <div className="fgroup" style={{marginBottom:16,opacity:deadCfg.enabled?1:.5}}>
              <label>Flag products that sold fewer than</label>
              <div style={{display:'flex',alignItems:'center',gap:10}}>
                <input type="number" min="0" value={deadCfg.threshold} style={{maxWidth:100}} onChange={e=>setDeadCfg(p=>({...p,threshold:parseInt(e.target.value)||0}))}/>
                <span style={{color:'var(--t2)',fontSize:13}}>units in the period below</span>
              </div>
              <span className="inp-hint">0 = sold absolutely nothing &nbsp;·&nbsp; 10 = sold fewer than 10</span>
            </div>

            <div className="fgroup" style={{marginBottom:20,opacity:deadCfg.enabled?1:.5}}>
              <label>Time period</label>
              <select value={deadCfg.period_days} onChange={e=>setDeadCfg(p=>({...p,period_days:parseInt(e.target.value)}))}>
                <option value={30}>Last 30 days (1 month)</option>
                <option value={60}>Last 60 days (2 months)</option>
                <option value={90}>Last 90 days (3 months)</option>
                <option value={180}>Last 180 days (6 months)</option>
                <option value={365}>Last 365 days (1 year)</option>
              </select>
            </div>

            {deadCfg.enabled&&(
              <div style={{background:'rgba(167,139,250,.08)',border:'1px solid rgba(167,139,250,.2)',borderRadius:8,padding:'10px 14px',fontSize:12,color:'var(--dead)',marginBottom:20,lineHeight:1.6}}>
                Products with velocity × {deadCfg.period_days} days ≤ {deadCfg.threshold} units will be flagged <strong>DEAD</strong>
              </div>
            )}

            <button className="btn btn-gold" style={{width:'100%'}} onClick={()=>setModal(null)}>Apply Rules</button>
          </div>
        </div>
      )}

    </div>
  );
}
