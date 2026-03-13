const DOMAIN  = process.env.authorityoffashion.myshopify.com;
const TOKEN   = process.env.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;
const VERSION = process.env.SHOPIFY_API_VERSION || '2026-01';
const BASE    = `https://${DOMAIN}/admin/api/${VERSION}`;
 
const headers = {
  'X-Shopify-Access-Token': TOKEN,
  'Content-Type': 'application/json',
};
 
// ── Shopify API helper ────────────────────────────────────────────────────────
async function shopifyFetch(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Shopify ${res.status}: ${text}`);
  }
  return res.json();
}
 
// ── Get all products with inventory (paginated) ───────────────────────────────
async function getAllProducts() {
  const products = [];
  let url = `${BASE}/products.json?limit=250&fields=id,title,variants`;
 
  while (url) {
    const res = await fetch(url, { headers });
    const link = res.headers.get('Link') || '';
    const data = await res.json();
    products.push(...(data.products || []));
 
    // Pagination: find next link
    const nextMatch = link.match(/<([^>]+)>;\s*rel="next"/);
    url = nextMatch ? nextMatch[1] : null;
  }
  return products;
}
 
// ── Get inventory levels for a location ──────────────────────────────────────
async function getInventoryLevels(inventoryItemIds, locationId) {
  const ids = inventoryItemIds.slice(0, 50).join(','); // max 50 per call
  const data = await shopifyFetch(
    `/inventory_levels.json?inventory_item_ids=${ids}&location_ids=${locationId}`
  );
  return data.inventory_levels || [];
}
 
// ── Get primary location ──────────────────────────────────────────────────────
async function getPrimaryLocation() {
  const data = await shopifyFetch('/locations.json');
  const locs = data.locations || [];
  const primary = locs.find(l => l.active) || locs[0];
  if (!primary) throw new Error('No active location found in Shopify');
  return primary.id;
}
 
// ─────────────────────────────────────────────────────────────────────────────
//  HANDLER
// ─────────────────────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
 
  if (req.method === 'OPTIONS') return res.status(200).end();
 
  // Validate env vars
  if (!DOMAIN || !TOKEN) {
    return res.status(500).json({
      error: 'Missing SHOPIFY_STORE_DOMAIN or SHOPIFY_ACCESS_TOKEN environment variables. Check Vercel settings.'
    });
  }
 
  try {
    const action = req.method === 'GET'
      ? req.query.action
      : (req.body?.action || req.query.action);
 
    // ── CHECK CONNECTION ──────────────────────────────────────────────────────
    if (action === 'checkConnection') {
      const data = await shopifyFetch('/shop.json');
      return res.status(200).json({
        connected: true,
        shop: data.shop?.name,
        domain: data.shop?.domain,
      });
    }
 
    // ── SYNC INVENTORY FROM SHOPIFY ───────────────────────────────────────────
    // Returns all products with SKU + current Shopify inventory quantity
    if (action === 'syncInventory') {
      const locationId = await getPrimaryLocation();
      const allProducts = await getAllProducts();
 
      const result = [];
      const inventoryItemIds = [];
      const variantMap = {};
 
      for (const product of allProducts) {
        for (const variant of product.variants || []) {
          if (variant.sku && variant.inventory_item_id) {
            inventoryItemIds.push(variant.inventory_item_id);
            variantMap[variant.inventory_item_id] = {
              sku: variant.sku,
              title: product.title,
              variant_title: variant.title,
              product_id: product.id,
              variant_id: variant.id,
            };
          }
        }
      }
 
      // Fetch inventory levels in batches of 50
      for (let i = 0; i < inventoryItemIds.length; i += 50) {
        const batch = inventoryItemIds.slice(i, i + 50);
        const levels = await getInventoryLevels(batch, locationId);
        for (const level of levels) {
          const meta = variantMap[level.inventory_item_id];
          if (meta) {
            result.push({
              sku: meta.sku,
              product_title: meta.title,
              variant_title: meta.variant_title,
              shopify_quantity: level.available,
              inventory_item_id: level.inventory_item_id,
              variant_id: meta.variant_id,
              location_id: locationId,
            });
          }
        }
      }
 
      return res.status(200).json({ products: result, count: result.length });
    }
 
    // ── UPDATE STOCK IN SHOPIFY (push from app → Shopify) ─────────────────────
    // Body: { action: 'updateStock', sku: 'AOF-001', quantity: 25 }
    if (action === 'updateStock') {
      const { sku, quantity } = req.method === 'POST' ? req.body : req.query;
 
      if (!sku) return res.status(400).json({ error: 'sku is required' });
      if (quantity === undefined) return res.status(400).json({ error: 'quantity is required' });
 
      // Find variant by SKU
      const searchData = await shopifyFetch(
        `/variants.json?fields=id,sku,inventory_item_id,product_id`
      );
 
      // Shopify doesn't have a direct SKU search — search through products
      const allProds = await getAllProducts();
      let foundVariant = null;
      for (const product of allProds) {
        for (const variant of product.variants || []) {
          if (String(variant.sku) === String(sku)) {
            foundVariant = variant; break;
          }
        }
        if (foundVariant) break;
      }
 
      if (!foundVariant) {
        return res.status(404).json({ error: `SKU "${sku}" not found in Shopify` });
      }
 
      const locationId = await getPrimaryLocation();
 
      // Set inventory level
      const updateRes = await shopifyFetch('/inventory_levels/set.json', {
        method: 'POST',
        body: JSON.stringify({
          location_id: locationId,
          inventory_item_id: foundVariant.inventory_item_id,
          available: parseInt(quantity),
        }),
      });
 
      return res.status(200).json({
        success: true,
        sku,
        quantity_set: parseInt(quantity),
        inventory_level: updateRes.inventory_level,
      });
    }
 
    // ── GET RECENT ORDERS (for sales velocity calculation) ────────────────────
    // Returns order line items for the last N days to help calculate velocity
    if (action === 'getOrders') {
      const days = parseInt(req.query.days) || 30;
      const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
 
      const data = await shopifyFetch(
        `/orders.json?status=any&created_at_min=${since}&limit=250&fields=id,line_items,created_at`
      );
 
      // Aggregate SKU quantities
      const skuSales = {};
      for (const order of data.orders || []) {
        for (const item of order.line_items || []) {
          if (item.sku) {
            skuSales[item.sku] = (skuSales[item.sku] || 0) + item.quantity;
          }
        }
      }
 
      // Convert to velocity per day
      const velocities = Object.entries(skuSales).map(([sku, total]) => ({
        sku,
        total_sold: total,
        days,
        velocity_per_day: parseFloat((total / days).toFixed(3)),
      }));
 
      return res.status(200).json({ velocities, period_days: days });
    }
 
    return res.status(400).json({ error: `Unknown action: "${action}". Valid: checkConnection, syncInventory, updateStock, getOrders` });
 
  } catch (err) {
    console.error('Shopify API error:', err);
    return res.status(500).json({ error: err.message });
  }
}
 
