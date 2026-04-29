import { Children, useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown } from 'lucide-react';

/**
 * Fully custom themed select for the admin dashboard.
 *
 * Drop-in replacement for a native <select> — it accepts <option> children
 * (so existing forms keep working) and emits a synthetic onChange event with
 * `e.target.value` matching the picked option. The popup is rendered through
 * a portal so it can overflow scrollable parents.
 *
 * Usage:
 *   <AdminSelect value={x} onChange={e => setX(e.target.value)}>
 *     <option value="">All</option>
 *     <option value="a">Alpha</option>
 *   </AdminSelect>
 */
export default function AdminSelect({
  size = 'md',
  className = '',
  value,
  onChange,
  name,
  disabled = false,
  placeholder,
  children,
  ...rest
}) {
  const triggerRef = useRef(null);
  const menuRef    = useRef(null);
  const [open, setOpen]                 = useState(false);
  const [highlighted, setHighlighted]   = useState(-1);
  const [menuStyle, setMenuStyle]       = useState({ left: 0, top: 0, width: 0 });

  // ── Parse <option> children → [{ value, label, disabled }] ────────────────
  const options = useMemo(() => {
    const collected = [];
    const walk = (nodes) => {
      Children.forEach(nodes, (child) => {
        if (!child || typeof child !== 'object') return;
        if (child.type === 'optgroup') {
          collected.push({ kind: 'group', label: child.props.label });
          walk(child.props.children);
          return;
        }
        if (child.type === 'option') {
          const { value: v, children: c, disabled: d } = child.props;
          const label = typeof c === 'string'
            ? c
            : Array.isArray(c) ? c.join('') : String(c ?? '');
          collected.push({ kind: 'option', value: v ?? '', label, disabled: !!d });
        }
      });
    };
    walk(children);
    return collected;
  }, [children]);

  const selectableOptions = options.filter(o => o.kind === 'option' && !o.disabled);
  const selected = options.find(o => o.kind === 'option' && String(o.value) === String(value ?? ''));
  const displayLabel = selected?.label ?? placeholder ?? '';

  // ── Position floating menu under trigger ──────────────────────────────────
  const recomputePosition = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setMenuStyle({
      left:  r.left + window.scrollX,
      top:   r.bottom + window.scrollY + 4,
      width: r.width,
    });
  }, []);

  useEffect(() => {
    if (!open) return;
    recomputePosition();
    const handler = () => recomputePosition();
    window.addEventListener('scroll', handler, true);
    window.addEventListener('resize', handler);
    return () => {
      window.removeEventListener('scroll', handler, true);
      window.removeEventListener('resize', handler);
    };
  }, [open, recomputePosition]);

  // ── Click outside / Escape ────────────────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    const onClick = (e) => {
      if (menuRef.current?.contains(e.target)) return;
      if (triggerRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') { setOpen(false); triggerRef.current?.focus(); }
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  // ── Open menu and snap highlight to current selection ─────────────────────
  const openMenu = () => {
    const idx = selectableOptions.findIndex(o => String(o.value) === String(value ?? ''));
    setHighlighted(idx >= 0 ? idx : 0);
    setOpen(true);
  };

  // ── Pick a value ──────────────────────────────────────────────────────────
  const pick = (v) => {
    onChange?.({ target: { value: v, name } });
    setOpen(false);
    triggerRef.current?.focus();
  };

  // ── Keyboard nav on trigger ───────────────────────────────────────────────
  const onTriggerKey = (e) => {
    if (disabled) return;
    if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
      e.preventDefault();
      if (!open) { openMenu(); return; }
    }
    if (!open) return;
    if (e.key === 'ArrowDown') {
      setHighlighted(h => Math.min(h + 1, selectableOptions.length - 1));
    } else if (e.key === 'ArrowUp') {
      setHighlighted(h => Math.max(h - 1, 0));
    } else if (e.key === 'Enter') {
      const opt = selectableOptions[highlighted];
      if (opt) pick(opt.value);
    }
  };

  const toggle = () => {
    if (disabled) return;
    if (open) setOpen(false);
    else openMenu();
  };

  const heightCls = size === 'sm' ? 'h-9' : 'h-10';

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={toggle}
        onKeyDown={onTriggerKey}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`
          relative w-full ${heightCls} pl-3 pr-9 rounded-xl text-sm text-left
          bg-gray-50 dark:bg-gray-700/60
          border border-gray-200 dark:border-gray-600
          text-gray-900 dark:text-white
          hover:border-indigo-300 dark:hover:border-indigo-500/60
          focus:outline-none focus:ring-2 focus:ring-indigo-500/30
          focus:border-indigo-400 dark:focus:border-indigo-500
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-all flex items-center
          ${className}
        `}
        {...rest}
      >
        <span className={`flex-1 truncate ${selected ? '' : 'text-gray-400 dark:text-gray-500'}`}>
          {displayLabel || placeholder || ' '}
        </span>
        <ChevronDown
          size={14}
          className={`absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && createPortal(
        <div
          ref={menuRef}
          role="listbox"
          style={{ position: 'absolute', ...menuStyle, zIndex: 9999 }}
          className="
            rounded-xl overflow-hidden
            bg-white dark:bg-gray-800
            border border-gray-200 dark:border-gray-700
            shadow-xl shadow-black/10 dark:shadow-black/40
            animate-in fade-in slide-in-from-top-1 duration-150
          "
        >
          <ul className="max-h-64 overflow-y-auto py-1">
            {options.length === 0 && (
              <li className="px-3 py-2 text-sm text-gray-400 dark:text-gray-500">No options</li>
            )}
            {(() => {
              // Convention: the first <option> is always the label / placeholder
              // and is hidden from the open dropdown. Its label is still shown in
              // the trigger when nothing else is selected.
              const firstOptionIdx = options.findIndex(o => o.kind === 'option');
              return options.map((opt, i) => {
                if (i === firstOptionIdx) return null;
                if (opt.kind === 'group') {
                return (
                  <li
                    key={`g-${i}`}
                    className="px-3 pt-2.5 pb-1 text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500"
                  >
                    {opt.label}
                  </li>
                );
              }
              const idxAmongSelectable = selectableOptions.indexOf(opt);
              const isActive = String(opt.value) === String(value ?? '');
              const isHighlighted = idxAmongSelectable === highlighted;
              return (
                <li
                  key={`o-${i}-${opt.value}`}
                  role="option"
                  aria-selected={isActive}
                  onMouseEnter={() => !opt.disabled && setHighlighted(idxAmongSelectable)}
                  onMouseDown={(e) => e.preventDefault() /* keep focus */}
                  onClick={() => !opt.disabled && pick(opt.value)}
                  className={`
                    flex items-center justify-between gap-2 mx-1 px-2.5 py-2 rounded-lg text-sm cursor-pointer
                    ${opt.disabled
                      ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                      : isActive
                        ? 'bg-indigo-500 text-white'
                        : isHighlighted
                          ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300'
                          : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/60'
                    }
                    transition-colors duration-100
                  `}
                >
                  <span className="truncate">{opt.label || <span className="opacity-60">—</span>}</span>
                  {isActive && <Check size={14} className="flex-shrink-0" />}
                </li>
              );
              });
            })()}
          </ul>
        </div>,
        document.body
      )}
    </>
  );
}
