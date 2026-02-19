/* eslint-disable no-unused-vars */
// src/components/admin/support/ConversationModal.jsx
import { createPortal } from 'react-dom';
import { useState, useEffect, useRef } from 'react';
import { X, User, Bot, Shield, CheckCheck, Clock, XCircle, Loader2 } from 'lucide-react';
import { supportAPI } from '../../../services/api';
import StatusBadge from '../shared/StatusBadge';
import ReplyEditor from './ReplyEditor';

const STATUS_ACTIONS = [
  { value: 'resolved', label: 'Mark as resolved', icon: CheckCheck, classes: 'bg-green-500 hover:bg-green-600 text-white'  },
  { value: 'closed',   label: 'Close',          icon: XCircle,    classes: 'bg-gray-500 hover:bg-gray-600 text-white'   },
  { value: 'open',     label: 'Reopen',          icon: Clock,      classes: 'bg-amber-500 hover:bg-amber-600 text-white' },
];

// ── Bulle de message ──────────────────────────────────────────────────────────
function MessageBubble({ msg }) {
  const isAdmin   = msg.role === 'admin'   || msg.isAdmin;
  const isBot     = msg.role === 'bot'     || msg.isBot;
  const isCustomer  = !isAdmin && !isBot;

  const formatTime = (d) =>
    d ? new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '';

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }) : '';

  return (
    <div className={`flex gap-3 ${isAdmin ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div className={`
        w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-1
        ${isAdmin  ? 'bg-gradient-to-br from-indigo-500 to-violet-600'  : ''}
        ${isBot    ? 'bg-gradient-to-br from-cyan-400 to-blue-500'       : ''}
        ${isCustomer ? 'bg-gradient-to-br from-gray-400 to-gray-500'       : ''}
      `}>
        {isAdmin  && <Shield size={13} className="text-white" />}
        {isBot    && <Bot    size={13} className="text-white" />}
        {isCustomer && <User   size={13} className="text-white" />}
      </div>

      {/* Bulle */}
      <div className={`max-w-[75%] space-y-1 ${isAdmin ? 'items-end' : 'items-start'} flex flex-col`}>
        {/* Toteur */}
        <div className={`flex items-center gap-2 ${isAdmin ? 'flex-row-reverse' : ''}`}>
          <span className="text-[11px] font-semibold text-gray-600 dark:text-gray-400">
            {isAdmin  ? 'CYNA Support'    : ''}
            {isBot    ? 'CYNA Assistant'  : ''}
            {isCustomer ? (msg.authorName ?? msg.email ?? 'Customer') : ''}
          </span>
          <span className="text-[10px] text-gray-400 dark:text-gray-500">
            {formatDate(msg.createdAt)} · {formatTime(msg.createdAt)}
          </span>
        </div>

        {/* Texte */}
        <div className={`
          px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap
          ${isAdmin
            ? 'bg-indigo-500 text-white rounded-tr-sm'
            : isBot
            ? 'bg-cyan-50 dark:bg-cyan-500/10 text-cyan-900 dark:text-cyan-100 border border-cyan-200 dark:border-cyan-500/20 rounded-tl-sm'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-tl-sm'
          }
        `}>
          {msg.content ?? msg.message ?? msg.text ?? ''}
        </div>
      </div>
    </div>
  );
}

// ── Séparateur de date ────────────────────────────────────────────────────────
function DateDivider({ date }) {
  return (
    <div className="flex items-center gap-3 my-4">
      <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
      <span className="text-[11px] font-medium text-gray-400 dark:text-gray-500 px-2">
        {new Date(date).toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })}
      </span>
      <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
    </div>
  );
}

// ── Composant principal ───────────────────────────────────────────────────────
export default function ConversationModal({ message, onClose, onStatusUpdated, onReplySent }) {
  const [conversation, setConversation] = useState(null);
  const [loadingConv, setLoadingConv]   = useState(true);
  const [loadingStatus, setLoadingStatus] = useState(null);
  const [error, setError]               = useState(null);
  const bottomRef                       = useRef(null);

  // Charger la conversation complète avec l'historique
  useEffect(() => {
    const load = async () => {
      setLoadingConv(true);
      try {
        const res = await supportAPI.getById(message.id);
        const data = res.data?.data ?? res.data;
        setConversation(data);
      } catch (err) {
        // Fallback : utiliser les données du message directement
        setConversation({
          ...message,
          messages: message.messages ?? [
            {
              id:        1,
              role:      'client',
              content:   message.message ?? message.content ?? '(Content not available)',
              createdAt: message.createdAt,
              email:     message.email,
            },
          ],
        });
        console.warn('Full conversation unavailable, showing message only.');
      } finally {
        setLoadingConv(false);
      }
    };
    load();
  }, [message, message.id]);

  // Scroll vers le bas à chaque nouveau message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation?.messages]);

  // ── Change status ──
  const handleStatusChange = async (newStatus) => {
    setError(null);
    setLoadingStatus(newStatus);
    try {
      await supportAPI.updateStatus(message.id, newStatus);
      onStatusUpdated(message.id, newStatus);
      setConversation((prev) => prev ? { ...prev, status: newStatus } : prev);
    } catch (err) {
      setError(err.response?.data?.message ?? 'Unable to update status.');
    } finally {
      setLoadingStatus(null);
    }
  };

  // ── Send une réponse ──
  const handleSendReply = async (text) => {
    await supportAPI.reply(message.id, text);

    // Ajouter le message localement sans re-fetch
    const newMsg = {
      id:        Date.now(),
      role:      'admin',
      isAdmin:   true,
      content:   text,
      createdAt: new Date().toISOString(),
    };
    setConversation((prev) =>
      prev ? { ...prev, messages: [...(prev.messages ?? []), newMsg] } : prev
    );

    // Marquer comme résolu automatiquement après une réponse
    if (conversation?.status === 'open') {
      await handleStatusChange('resolved');
    }
    onReplySent(message.id);
  };

  const currentStatus = conversation?.status ?? message.status ?? 'open';

  // Available action buttons based on current status
  const availableActions = STATUS_ACTIONS.filter((a) => a.value !== currentStatus);

  // Grouper les messages par date
  const groupedMessages = (conversation?.messages ?? []).reduce((groups, msg) => {
    const date = msg.createdAt ? new Date(msg.createdAt).toDateString() : 'unknown';
    if (!groups[date]) groups[date] = [];
    groups[date].push(msg);
    return groups;
  }, {});

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString('en-US', { day: '2-digit', month: 'long', year: 'numeric' }) : '—';

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="
        relative w-full max-w-2xl h-[85vh] flex flex-col
        bg-white dark:bg-gray-800
        rounded-2xl shadow-2xl
        border border-gray-200 dark:border-gray-700
        overflow-hidden
      ">
        {/* ── Header ── */}
        <div className="flex-shrink-0 flex items-start justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-bold text-gray-900 dark:text-white truncate">
                {message.subject ?? message.title ?? '(No subject)'}
              </h2>
              <StatusBadge status={currentStatus} />
            </div>
            <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
              <span>{message.email ?? message.customerEmail ?? '—'}</span>
              <span>·</span>
              <span>{formatDate(message.createdAt)}</span>
              {message.source && (
                <>
                  <span>·</span>
                  <span className="capitalize">{message.source}</span>
                </>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="ml-3 flex-shrink-0 p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Status actions ── */}
        {availableActions.length > 0 && (
          <div className="flex-shrink-0 flex items-center gap-2 px-6 py-2.5 bg-gray-50 dark:bg-gray-700/40 border-b border-gray-200 dark:border-gray-700">
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Action:</span>
            {availableActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.value}
                  onClick={() => handleStatusChange(action.value)}
                  disabled={loadingStatus !== null}
                  className={`
                    flex items-center gap-1.5 h-7 px-3 rounded-lg text-xs font-medium
                    disabled:opacity-50 disabled:cursor-not-allowed
                    transition-all duration-200 ${action.classes}
                  `}
                >
                  {loadingStatus === action.value
                    ? <Loader2 size={11} className="animate-spin" />
                    : <Icon size={11} />}
                  {action.label}
                </button>
              );
            })}
          </div>
        )}

        {/* ── Error ── */}
        {error && (
          <div className="flex-shrink-0 mx-4 mt-2 px-3 py-2 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 text-xs">
            {error}
          </div>
        )}

        {/* ── Historique conversation ── */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-1">
          {loadingConv ? (
            <div className="flex flex-col gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className={`flex gap-3 ${i % 2 === 0 ? '' : 'flex-row-reverse'}`}>
                  <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse flex-shrink-0" />
                  <div className={`space-y-1.5 ${i % 2 === 0 ? '' : 'items-end'} flex flex-col`}>
                    <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    <div className="h-16 w-64 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            Object.entries(groupedMessages).map(([date, msgs]) => (
              <div key={date}>
                <DateDivider date={msgs[0].createdAt} />
                <div className="space-y-4">
                  {msgs.map((msg) => (
                    <MessageBubble key={msg.id} msg={msg} />
                  ))}
                </div>
              </div>
            ))
          )}
          {/* Ancre pour scroll automatique */}
          <div ref={bottomRef} />
        </div>

        {/* ── Zone de réponse ── */}
        <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
          <ReplyEditor
            onSend={handleSendReply}
            disabled={currentStatus === 'closed'}
            recipientEmail={message.email ?? message.customerEmail ?? ''}
          />
          {currentStatus === 'closed' && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 text-center">
              This ticket is closed. Reopen it to reply.
            </p>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
