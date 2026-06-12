// src/pages/Admin/MessagesPage.jsx
import { useEffect, useState, useCallback, useRef } from "react";
import {
  AlertCircle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Inbox,
  Loader2,
  Mail,
  Reply,
  Search,
  Trash2,
} from "lucide-react";
import { contactAPI } from "@/services/api";
import { ADMIN_REFRESH_EVENT } from "../../layouts/admin/AdminHeader";

const LIMIT = 10;

const fmtDate = (iso) => {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleString("fr-FR", {
      day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
    });
  } catch { return ""; }
};

const buildMailto = (m) => {
  const subject = encodeURIComponent(`Re: ${m.subject ?? ""}`);
  const body = encodeURIComponent(
    `\n\n----------\nEn réponse à votre message :\n"${m.message ?? ""}"`,
  );
  return `mailto:${m.email}?subject=${subject}&body=${body}`;
};

function Toast({ message, type, onDismiss }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 3500);
    return () => clearTimeout(t);
  }, [onDismiss]);
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl text-sm font-medium ${type === "error" ? "bg-red-500 text-white" : "bg-green-500 text-white"}`}>
      {type === "error" ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
      {message}
    </div>
  );
}

export default function MessagesPage() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [confirmId, setConfirmId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [toast, setToast] = useState(null);
  const searchTimeout = useRef(null);

  const load = useCallback((opts = {}) => {
    setLoading(true);
    const nextPage = opts.page ?? page;
    const nextSearch = opts.search ?? search;
    const params = { page: nextPage, limit: LIMIT, ...(nextSearch ? { search: nextSearch } : {}) };
    contactAPI.getAll(params)
      .then((r) => {
        const payload = r.data?.data ?? r.data ?? {};
        const list = payload?.data ?? (Array.isArray(payload) ? payload : []);
        setMessages(Array.isArray(list) ? list : []);
        setTotal(payload?.total ?? list.length);
        setPage(nextPage);
      })
      .catch(() => setMessages([]))
      .finally(() => setLoading(false));
  }, [page, search]);

  useEffect(() => { load(); /* initial load */ // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onRefresh = () => load();
    window.addEventListener(ADMIN_REFRESH_EVENT, onRefresh);
    return () => window.removeEventListener(ADMIN_REFRESH_EVENT, onRefresh);
  }, [load]);

  const handleSearch = (value) => {
    setSearch(value);
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => load({ search: value, page: 1 }), 400);
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      const res = await contactAPI.remove(id);
      if (res?.data?.success === false) {
        setToast({ type: "error", message: res.data.message || "Suppression impossible." });
      } else {
        setToast({ type: "success", message: "Message supprimé." });
        load();
      }
    } catch {
      setToast({ type: "error", message: "Suppression impossible." });
    } finally {
      setDeletingId(null);
      setConfirmId(null);
    }
  };

  const totalPages = Math.ceil(total / LIMIT) || 1;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Messages</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Messages envoyés via le formulaire de contact
          </p>
        </div>
        {!loading && (
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            {total} message{total > 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Rechercher par email, sujet, message…"
          className="w-full pl-10 pr-4 h-10 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-indigo-400 transition-all"
        />
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-28 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
          ))}
        </div>
      ) : messages.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 p-12 text-center">
          <Inbox size={32} className="mx-auto mb-3 text-gray-300 dark:text-gray-600" />
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {search ? "Aucun message ne correspond à la recherche." : "Aucun message pour le moment."}
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {messages.map((m) => (
              <div
                key={m._id}
                className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700/60 shadow-sm p-5"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
                    <Mail size={17} className="text-indigo-500" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <a
                        href={`mailto:${m.email}`}
                        className="text-sm font-semibold text-gray-900 dark:text-white hover:text-indigo-500 truncate"
                      >
                        {m.email}
                      </a>
                      <span className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">
                        {fmtDate(m.createdAt)}
                      </span>
                    </div>

                    <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mt-1">
                      {m.subject}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 whitespace-pre-wrap break-words">
                      {m.message}
                    </p>

                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700/60">
                      <a
                        href={buildMailto(m)}
                        className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-semibold bg-indigo-500 hover:bg-indigo-600 text-white transition-colors"
                      >
                        <Reply size={13} /> Répondre
                      </a>

                      {confirmId === m._id ? (
                        <span className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => handleDelete(m._id)}
                            disabled={deletingId === m._id}
                            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-semibold bg-red-500 hover:bg-red-600 text-white disabled:opacity-60 transition-colors"
                          >
                            {deletingId === m._id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                            Confirmer
                          </button>
                          <button
                            onClick={() => setConfirmId(null)}
                            className="h-8 px-3 rounded-lg text-xs font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          >
                            Annuler
                          </button>
                        </span>
                      ) : (
                        <button
                          onClick={() => setConfirmId(m._id)}
                          className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium text-gray-500 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={13} /> Supprimer
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {total > LIMIT && (
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">Page {page} / {totalPages}</span>
              <div className="flex items-center gap-1">
                <button onClick={() => load({ page: page - 1 })} disabled={page <= 1}
                  className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 transition-all"
                >
                  <ChevronLeft size={16} />
                </button>
                <button onClick={() => load({ page: page + 1 })} disabled={page >= totalPages}
                  className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 transition-all"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}
    </div>
  );
}
