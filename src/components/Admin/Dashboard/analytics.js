// src/components/admin/dashboard/analytics.js
//
// Pure helpers that turn raw `commandes` (and the products map for category
// resolution) into the series the Dashboard charts consume. Only PAID orders
// are counted as revenue — pending/cancelled are ignored.

const PAID = 'PAID';

const isPaid = (c) => String(c?.statut ?? '').toUpperCase() === PAID;

const num = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);

// ── Period bucketing ────────────────────────────────────────────────────────
//
// `period` matches the values emitted by PeriodSelector: '7d', '5w', '30d',
// 'month', 'custom'. We materialise an ordered list of buckets, each with a
// label (X-axis tick), a [start, end) range, and a running sum.

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function startOfWeek(d) {
  const x = startOfDay(d);
  const day = (x.getDay() + 6) % 7; // ISO: Monday=0
  x.setDate(x.getDate() - day);
  return x;
}

function getISOWeek(d) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil((((date - yearStart) / 86400000) + 1) / 7);
}

/**
 * Returns ordered buckets for the requested period.
 * Each bucket: { label, start: Date, end: Date }
 */
function buildBuckets(period) {
  const now = new Date();
  const buckets = [];

  if (period === '7d') {
    for (let i = 6; i >= 0; i--) {
      const start = startOfDay(now);
      start.setDate(start.getDate() - i);
      const end = new Date(start);
      end.setDate(end.getDate() + 1);
      buckets.push({
        label: start.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' }),
        start,
        end,
      });
    }
  } else if (period === '5w') {
    const monday = startOfWeek(now);
    for (let i = 4; i >= 0; i--) {
      const start = new Date(monday);
      start.setDate(start.getDate() - i * 7);
      const end = new Date(start);
      end.setDate(end.getDate() + 7);
      buckets.push({ label: `W${getISOWeek(start)}`, start, end });
    }
  } else if (period === '30d') {
    // 10 buckets of 3 days each
    for (let i = 9; i >= 0; i--) {
      const start = startOfDay(now);
      start.setDate(start.getDate() - (i + 1) * 3 + 3);
      const end = new Date(start);
      end.setDate(end.getDate() + 3);
      buckets.push({
        label: start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        start,
        end,
      });
    }
  } else if (period === 'month') {
    // 4 buckets of 7 days, ending today
    for (let i = 3; i >= 0; i--) {
      const start = startOfDay(now);
      start.setDate(start.getDate() - (i + 1) * 7 + 7);
      const end = new Date(start);
      end.setDate(end.getDate() + 7);
      buckets.push({
        label: `Week ${4 - i}`,
        start,
        end,
      });
    }
  } else {
    // Default fallback: last 7 days
    return buildBuckets('7d');
  }

  return buckets;
}

// ── Public helpers ─────────────────────────────────────────────────────────

/**
 * Revenue line series.
 * @returns Array<{ label: string, value: number }>
 */
export function buildRevenueSeries(commandes, period) {
  const buckets = buildBuckets(period).map((b) => ({ ...b, value: 0 }));
  for (const c of commandes ?? []) {
    if (!isPaid(c) || !c.createdAt) continue;
    const t = new Date(c.createdAt).getTime();
    if (Number.isNaN(t)) continue;
    for (const b of buckets) {
      if (t >= b.start.getTime() && t < b.end.getTime()) {
        b.value += num(c.totalPrice);
        break;
      }
    }
  }
  return buckets.map(({ label, value }) => ({
    label,
    value: Math.round(value * 100) / 100,
  }));
}

/**
 * Total revenue across the period (sum of PAID commandes' totalPrice).
 */
export function totalPaidRevenue(commandes, period) {
  const series = buildRevenueSeries(commandes, period);
  return series.reduce((s, p) => s + p.value, 0);
}

/**
 * Total order count (PAID) across the period.
 */
export function paidOrderCount(commandes, period) {
  const buckets = buildBuckets(period);
  if (!buckets.length) return 0;
  const start = buckets[0].start.getTime();
  const end = buckets[buckets.length - 1].end.getTime();
  return (commandes ?? []).filter((c) => {
    if (!isPaid(c) || !c.createdAt) return false;
    const t = new Date(c.createdAt).getTime();
    return t >= start && t < end;
  }).length;
}

/**
 * Build a productId → categoryName lookup.
 * Uses the products list (already populated server-side with service.category).
 */
function buildProductCategoryMap(products) {
  const map = new Map();
  for (const p of products ?? []) {
    const id = p?._id ?? p?.id;
    if (!id) continue;
    const catName =
      p?.service?.category?.name ??
      p?.category?.name ??
      null;
    map.set(String(id), catName);
  }
  return map;
}

/**
 * Aggregates revenue by category from PAID commandes' abonnements.
 * @returns Array<{ label: string, value: number }>
 */
export function revenueByCategory(commandes, products) {
  const productCat = buildProductCategoryMap(products);
  const totals = new Map();

  for (const c of commandes ?? []) {
    if (!isPaid(c)) continue;
    for (const ab of c.abonnements ?? []) {
      const productId =
        typeof ab.product === 'object' ? ab.product?._id : ab.product;
      const cat = productCat.get(String(productId)) ?? 'Uncategorized';
      const price = num(ab.price);
      totals.set(cat, (totals.get(cat) ?? 0) + price);
    }
  }

  return Array.from(totals.entries())
    .map(([label, value]) => ({ label, value: Math.round(value * 100) / 100 }))
    .filter((d) => d.value > 0)
    .sort((a, b) => b.value - a.value);
}

/**
 * Top N products by paid revenue.
 * @returns Array<{ label, value }>
 */
export function topProductsByRevenue(commandes, products, limit = 6) {
  const productMap = new Map();
  for (const p of products ?? []) {
    const id = p?._id ?? p?.id;
    if (id) productMap.set(String(id), p);
  }

  const totals = new Map();
  for (const c of commandes ?? []) {
    if (!isPaid(c)) continue;
    for (const ab of c.abonnements ?? []) {
      const productId =
        typeof ab.product === 'object' ? ab.product?._id : ab.product;
      const prod = productMap.get(String(productId));
      const name =
        prod?.name ??
        (typeof ab.product === 'object' ? ab.product?.name : null) ??
        'Unknown';
      const price = num(ab.price);
      totals.set(name, (totals.get(name) ?? 0) + price);
    }
  }

  return Array.from(totals.entries())
    .map(([label, value]) => ({ label, value: Math.round(value * 100) / 100 }))
    .filter((d) => d.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);
}
