// src/components/admin/support/ReplyEditor.jsx
import { useState, useRef } from 'react';
import { Send, Loader2, Paperclip, X, Bold, Italic, List } from 'lucide-react';

const QUICK_REPLIES = [
  { label: 'Acknowledgement', text: 'Bonday,\n\nNous avons bien reçu votre message et notre équipe y répondra dans les plus brefs délais.\n\nCordialement,\nL\'équipe CYNA' },
  { label: 'Demande d\'infos', text: 'Bonday,\n\nAfin de mieux vous aider, pourriez-vous nous fournir davantage d\'informations concernant votre demande ?\n\nCordialement,\nL\'équipe CYNA' },
  { label: 'Resolvedtion',       text: 'Bonday,\n\nNous avons résolu votre problème. N\'hésitez pas à nous recontacter si vous avez d\'autres questions.\n\nCordialement,\nL\'équipe CYNA' },
];

/**
 * ReplyEditor
 * Props :
 *   onSend    {function(text: string) => Promise<void>}
 *   disabled  {boolean}
 *   recipientEmail {string}
 */
export default function ReplyEditor({ onSend, disabled = false, recipientEmail = '' }) {
  const [text, setText]           = useState('');
  const [sending, setSending]     = useState(false);
  const [error, setError]         = useState(null);
  const [showQuick, setShowQuick] = useState(false);
  const textareaRef               = useRef(null);

  const charCount = text.length;
  const maxChars  = 2000;
  const isEmpty   = !text.trim();

  const handleSend = async () => {
    if (isEmpty || sending || disabled) return;
    setError(null);
    setSending(true);
    try {
      await onSend(text.trim());
      setText('');
    } catch (err) {
      setError(err.message ?? 'Error lors de l\'envoi de la réponse.');
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    // Ctrl+Enter ou Cmd+Enter to send
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  const applyQuickReply = (quickText) => {
    setText(quickText);
    setShowQuick(false);
    textareaRef.current?.focus();
  };

  // Formatage simple du texte sélectionné
  const applyFormat = (type) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end   = textarea.selectionEnd;
    const selected = text.slice(start, end);
    let replacement = '';
    if (type === 'bold')   replacement = `**${selected}**`;
    if (type === 'italic') replacement = `_${selected}_`;
    if (type === 'list')   replacement = `\n- ${selected}`;
    const newText = text.slice(0, start) + replacement + text.slice(end);
    setText(newText);
    setTimeout(() => {
      textarea.selectionStart = start + replacement.length;
      textarea.selectionEnd   = start + replacement.length;
      textarea.focus();
    }, 0);
  };

  return (
    <div className="space-y-2">
      {/* Recipient */}
      {recipientEmail && (
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <span className="font-medium">To:</span>
          <span className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full font-medium text-gray-700 dark:text-gray-300">
            {recipientEmail}
          </span>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          {/* Formatage */}
          {[
            { icon: Bold,   type: 'bold',   title: 'Bold (selection)' },
            { icon: Italic, type: 'italic', title: 'Italic (selection)' },
            { icon: List,   type: 'list',   title: 'List' },
          ].map(({ icon: Icon, type, title }) => (
            <button
              key={type}
              type="button"
              onClick={() => applyFormat(type)}
              disabled={disabled}
              title={title}
              className="p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-300 disabled:opacity-40 transition-all"
            >
              <Icon size={13} />
            </button>
          ))}
        </div>

        {/* Réponses rapides */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowQuick((v) => !v)}
            disabled={disabled}
            className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 disabled:opacity-40 transition-colors"
          >
            Quick replies ↓
          </button>

          {showQuick && (
            <div className="absolute right-0 bottom-full mb-2 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl z-10 overflow-hidden">
              {QUICK_REPLIES.map((qr) => (
                <button
                  key={qr.label}
                  onClick={() => applyQuickReply(qr.text)}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-0"
                >
                  {qr.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Zone de texte */}
      <div className={`
        relative rounded-2xl border transition-all duration-200
        ${disabled
          ? 'opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
          : 'bg-white dark:bg-gray-700/60 border-gray-200 dark:border-gray-600 focus-within:ring-2 focus-within:ring-indigo-500/30 focus-within:border-indigo-400 dark:focus-within:border-indigo-500'}
      `}>
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, maxChars))}
          onKeyDown={handleKeyDown}
          disabled={disabled || sending}
          rows={5}
          placeholder="Write your reply… (Ctrl+Enter to send)"
          className="
            w-full px-4 py-3 rounded-2xl text-sm
            bg-transparent
            text-gray-900 dark:text-white
            placeholder-gray-400 dark:placeholder-gray-500
            outline-none resize-none
            disabled:cursor-not-allowed
          "
        />

        {/* Compteur + bouton envoi */}
        <div className="flex items-center justify-between px-4 pb-3">
          <span className={`text-xs ${charCount > maxChars * 0.9 ? 'text-amber-500' : 'text-gray-400 dark:text-gray-500'}`}>
            {charCount}/{maxChars}
          </span>

          <button
            type="button"
            onClick={handleSend}
            disabled={isEmpty || sending || disabled}
            className="
              flex items-center gap-2 h-8 px-4 rounded-xl text-xs font-semibold
              bg-indigo-500 hover:bg-indigo-600
              text-white
              disabled:opacity-40 disabled:cursor-not-allowed
              transition-all duration-200
            "
          >
            {sending
              ? <><Loader2 size={12} className="animate-spin" />Sending…</>
              : <><Send size={12} />Send</>}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 text-xs">
          <span>{error}</span>
          <button onClick={() => setError(null)}>
            <X size={12} />
          </button>
        </div>
      )}

      <p className="text-[10px] text-gray-400 dark:text-gray-500">
        Shortcut: <kbd className="px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-700 font-mono">Ctrl+Enter</kbd> to send
      </p>
    </div>
  );
}
