import { buildImageUrl, productsAPI } from "@/services/api";
import { CheckCircle2, Package, Search, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

export default function SearchPage() {
  const [params, setParams] = useSearchParams();
  const q = params.get("q") || "";
  const [query, setQuery] = useState(q);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!q) return;
    setLoading(true);
    productsAPI.getAll({ limit: 100 })
      .then(res => {
        const all = res.data?.data?.items ?? res.data?.data ?? res.data ?? [];
        const arr = Array.isArray(all) ? all : [];
        const filtered = arr.filter(p =>
          p.name?.toLowerCase().includes(q.toLowerCase()) ||
          p.description?.toLowerCase().includes(q.toLowerCase())
        ).sort((a, b) => {
          const al = a.name?.toLowerCase(), bl = b.name?.toLowerCase(), ql = q.toLowerCase();
          if (al === ql && bl !== ql) return -1;
          if (bl === ql && al !== ql) return 1;
          if (al?.startsWith(ql) && !bl?.startsWith(ql)) return -1;
          if (bl?.startsWith(ql) && !al?.startsWith(ql)) return 1;
          return 0;
        });
        setResults(filtered);
      })
      .finally(() => setLoading(false));
  }, [q]);

  const handleSearch = (e) => { 
    e.preventDefault(); 
    setParams({ q: query }); 
  };

  return (
    <div className="page-enter" style={{ background: "var(--bg-base)", minHeight: "70vh" }}>
      <div style={{ background: "var(--bg-subtle)", borderBottom: "1px solid var(--border)" }}>
        <div className="cyna-container py-10">
          <p className="section-label mt-5">Search</p>
          <form onSubmit={handleSearch} className="flex gap-2 max-w-lg mb-2">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
              <input 
                type="text" 
                value={query} 
                onChange={e => setQuery(e.target.value)} 
                placeholder="Search for a solution..."
                className="w-full pl-10 pr-4 h-12 rounded-full border border-[var(--border)] bg-[var(--bg-card)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-all" 
              />
            </div>
            <button type="submit" className="btn-primary px-6">Search</button>
          </form>
          {q && (
            <p className="text-sm mb-5" style={{ color: "var(--text-muted)" }}>
              {results.length} result{results.length !== 1 ? "s" : ""} for « 
              <strong style={{ color: "var(--text-primary)" }}>{q}</strong> »
            </p>
          )}
        </div>
      </div>

      <div className="cyna-container py-10">
        {loading ? (
          <div className="products-grid">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="cyna-card overflow-hidden">
                <div className="skeleton w-full" style={{ aspectRatio: "1/1" }} />
                <div className="p-4 space-y-2">
                  <div className="skeleton h-4 w-3/4 rounded" />
                  <div className="skeleton h-3 w-1/2 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : results.length === 0 && q ? (
          <div className="text-center py-16">
            <Package size={40} style={{ color: "var(--text-muted)", margin: "0 auto 12px" }} />
            <p className="font-[Kumbh Sans] font-600 mb-1" style={{ color: "var(--text-secondary)" }}>
              No results for « {q} »
            </p>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Try another term or browse our catalog
            </p>
            <Link to="/products" className="btn-primary mt-6 gap-2 inline-flex">
              View All Products
            </Link>
          </div>
        ) : (
          <div className="products-grid">
            {results.map(p => {
              const img = buildImageUrl(p.images?.[0]?.path ?? p.images?.[0]);
              const isOut = p.stock === 0;
              return (
                <Link 
                  key={p._id} 
                  to={`/products/${p.slug}`} 
                  className="cyna-card overflow-hidden group block" 
                  style={{ textDecoration: "none" }}
                >
                  <div className="relative overflow-hidden" style={{ aspectRatio: "1/1", background: "var(--bg-muted)" }}>
                    {img ? (
                      <img 
                        src={img} 
                        alt={p.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package size={32} style={{ color: "var(--text-muted)" }} />
                      </div>
                    )}
                    {isOut && (
                      <div className="absolute inset-0 flex items-center justify-center" style={{ background: "rgba(0,0,0,.4)" }}>
                        <span className="badge badge-danger">Out of Stock</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-[Kumbh Sans] font-700 text-sm line-clamp-2 mb-2" style={{ color: "var(--text-primary)" }}>
                      {p.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      {p.priceMonth != null && (
                        <p className="font-[Kumbh Sans] font-700 text-sm" style={{ color: "var(--accent)" }}>
                          {Number(p.priceMonth).toFixed(2)} €/month
                        </p>
                      )}
                      <span className={`text-xs flex items-center gap-1 ${isOut ? "text-[var(--danger)]" : "text-[var(--success)]"}`}>
                        {isOut ? <XCircle size={11} /> : <CheckCircle2 size={11} />}
                        {isOut ? "Out of stock" : "Available"}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}