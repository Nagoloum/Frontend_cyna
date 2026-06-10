// src/pages/Admin/MessagesPage.jsx
import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle,
  Inbox,
  Loader2,
  Mail,
  Reply,
  Search,
  Trash2,
} from "lucide-react";
import { contactAPI } from "@/services/api";

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
  const [confirmId, setConfirmId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [toast, setToast] = useState(null);

  const load = () => {
    setLoading(true);
    contactAPI.getAll()
      .then((r) => {
        const list = r.data?.data ?? r.data ?? [];
        setMessages(Array.isArray(list) ? list : []);
      })
      .catch(() => setMessages([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const sorted = [...messages].sort(
      (a, b) => new Date(b.createdAt ?? 0) - new Date(a.createdAt ?? 0),
    );
    if (!q) return sorted;
    return sorted.filter(
      (m) =>
        m.email?.toLowerCase().includes(q) ||
        m.subject?.toLowerCase().includes(q) ||
        m.message?.toLowerCase().includes(q),
    );
  }, [messages, search]);

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      const res = await contactAPI.remove(id);
      if (res?.data?.success === false) {
        setToast({ type: "error", message: res.data.message || "Suppression impossible." });
      } else {
        setMessages((prev) => prev.filter((m) => m._id !== id));
        setToast({ type: "success", message: "Message supprimé." });
      }
    } catch {
      setToast({ type: "error", message: "Suppression impossible." });
    } finally {
      setDeletingId(null);
      setConfirmId(null);
    }
  };

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
            {messages.length} message{messages.length > 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
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
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 p-12 text-center">
          <Inbox size={32} className="mx-auto mb-3 text-gray-300 dark:text-gray-600" />
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {search ? "Aucun message ne correspond à la recherche." : "Aucun message pour le moment."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((m) => (
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
      )}

      {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}
    </div>
  );
}
