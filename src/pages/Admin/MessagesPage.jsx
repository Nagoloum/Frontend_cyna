// src/pages/Admin/MessagesPage.jsx
import { useEffect, useState, useCallback, useRef } from "react";
import {
  AlertCircle,
  CheckCircle,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  Eye,
  Inbox,
  Loader2,
  Mail,
  Reply,
  Search,
  Send,
  Trash2,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { contactAPI } from "@/services/api";
import { ADMIN_REFRESH_EVENT } from "../../layouts/admin/AdminHeader";

const LIMIT = 10;

const STATUS = {
  NEW:     { key: "status_new",     cls: "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400" },
  READ:    { key: "status_read",    cls: "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400" },
  REPLIED: { key: "status_replied", cls: "bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400" },
  CLOSED:  { key: "status_closed",  cls: "bg-gray-100 dark:bg-gray-700/60 text-gray-500 dark:text-gray-400" },
};

const fmtDate = (iso) => {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleString("fr-FR", {
      day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
    });
  } catch { return ""; }
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
  const { t } = useTranslation();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [confirmId, setConfirmId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [toast, setToast] = useState(null);
  const [replyOpenId, setReplyOpenId] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [replySending, setReplySending] = useState(false);
  const [statusBusyId, setStatusBusyId] = useState(null);
  const searchTimeout = useRef(null);

  const patchLocal = (id, patch) =>
    setMessages((prev) => prev.map((m) => (m._id === id ? { ...m, ...patch } : m)));

  const sendReply = async (id) => {
    if (!replyText.trim() || replySending) return;
    setReplySending(true);
    try {
      const res = await contactAPI.reply(id, replyText.trim());
      if (res?.data?.success === false) {
        setToast({ type: "error", message: res.data.message || t("admin.messages.reply_failed") });
      } else {
        patchLocal(id, { status: "REPLIED", reply: replyText.trim() });
        setReplyOpenId(null);
        setReplyText("");
        setToast({ type: "success", message: t("admin.messages.reply_sent") });
      }
    } catch (err) {
      setToast({ type: "error", message: err.response?.data?.message || t("admin.messages.reply_failed") });
    } finally {
      setReplySending(false);
    }
  };

  const changeStatus = async (id, status) => {
    setStatusBusyId(id);
    try {
      const res = await contactAPI.setStatus(id, status);
      if (res?.data?.success !== false) patchLocal(id, { status });
    } catch { /* silencieux */ } finally {
      setStatusBusyId(null);
    }
  };

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
        setToast({ type: "error", message: res.data.message || t("admin.common.delete_failed") });
      } else {
        setToast({ type: "success", message: t("admin.messages.delete_success") });
        load();
      }
    } catch {
      setToast({ type: "error", message: t("admin.common.delete_failed") });
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">{t("admin.messages.title")}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {t("admin.messages.subtitle")}
          </p>
        </div>
        {!loading && (
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            {t("admin.messages.count", { count: total })}
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
          placeholder={t("admin.messages.search_placeholder")}
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
            {search ? t("admin.messages.empty_search") : t("admin.messages.empty")}
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
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${(STATUS[m.status] ?? STATUS.NEW).cls}`}>
                          {t(`admin.messages.${(STATUS[m.status] ?? STATUS.NEW).key}`)}
                        </span>
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          {fmtDate(m.createdAt)}
                        </span>
                      </div>
                    </div>

                    <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mt-1">
                      {m.subject}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 whitespace-pre-wrap break-words">
                      {m.message}
                    </p>

                    {m.reply && (
                      <div className="mt-3 p-3 rounded-xl bg-green-50/60 dark:bg-green-500/5 border border-green-100 dark:border-green-500/15">
                        <p className="text-[11px] font-semibold text-green-700 dark:text-green-400 mb-1">
                          {t("admin.messages.your_reply")} · {fmtDate(m.repliedAt)}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap break-words">{m.reply}</p>
                      </div>
                    )}

                    {/* Reply panel */}
                    {replyOpenId === m._id && (
                      <div className="mt-3">
                        <textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          rows={3}
                          placeholder={t("admin.messages.reply_placeholder")}
                          className="w-full p-3 rounded-xl text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:border-indigo-400"
                        />
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => sendReply(m._id)}
                            disabled={replySending || !replyText.trim()}
                            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-semibold bg-indigo-500 hover:bg-indigo-600 text-white disabled:opacity-60"
                          >
                            {replySending ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />} {t("admin.messages.send")}
                          </button>
                          <button
                            onClick={() => { setReplyOpenId(null); setReplyText(""); }}
                            className="h-8 px-3 rounded-lg text-xs font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            {t("admin.common.cancel")}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700/60 flex-wrap">
                      <button
                        onClick={() => { setReplyOpenId(replyOpenId === m._id ? null : m._id); setReplyText(""); }}
                        className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-semibold bg-indigo-500 hover:bg-indigo-600 text-white transition-colors"
                      >
                        <Reply size={13} /> {t("admin.messages.reply")}
                      </button>

                      {m.status !== "READ" && m.status !== "REPLIED" && (
                        <button
                          onClick={() => changeStatus(m._id, "READ")}
                          disabled={statusBusyId === m._id}
                          className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-60"
                        >
                          <Eye size={13} /> {t("admin.messages.mark_read")}
                        </button>
                      )}
                      {m.status !== "CLOSED" && (
                        <button
                          onClick={() => changeStatus(m._id, "CLOSED")}
                          disabled={statusBusyId === m._id}
                          className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-60"
                        >
                          <CheckCheck size={13} /> {t("admin.messages.close")}
                        </button>
                      )}

                      {confirmId === m._id ? (
                        <span className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => handleDelete(m._id)}
                            disabled={deletingId === m._id}
                            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-semibold bg-red-500 hover:bg-red-600 text-white disabled:opacity-60 transition-colors"
                          >
                            {deletingId === m._id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                            {t("admin.messages.confirm")}
                          </button>
                          <button
                            onClick={() => setConfirmId(null)}
                            className="h-8 px-3 rounded-lg text-xs font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          >
                            {t("admin.common.cancel")}
                          </button>
                        </span>
                      ) : (
                        <button
                          onClick={() => setConfirmId(m._id)}
                          className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium text-gray-500 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={13} /> {t("admin.common.delete")}
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
              <span className="text-xs text-gray-500 dark:text-gray-400">{t("admin.common.page_of", { page, total: totalPages })}</span>
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
