import { Children, useEffect, useRef, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown } from 'lucide-react';

/**
 * Themed select for the public site — matches the AdminSelect dropdown
 * behaviour but is styled with the home design tokens (var(--bg-card),
 * var(--accent), var(--border)…) so it blends with the rest of the UI.
 *
 * Drop-in replacement for a native <select>: accepts `<option>` children,
 * fires `onChange({ target: { value, name } })`, supports `disabled`,
 * `placeholder`, `size` ("sm" | "md" | "lg") and a `compact` mode for inline
 * filter bars.
 *
 * The placeholder convention follows the rest of the codebase: the first
 * `<option value="">…` is treated as the placeholder and hidden from the
 * dropdown list — its label is shown muted in the trigger when nothing is
 * picked.
 */
export default function Select({
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
  const [open, setOpen]               = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const [menuStyle, setMenuStyle]     = useState({ left: 0, top: 0, width: 0 });

  // Parse <option> children → [{ value, label, disabled }]
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

  // Position floating menu under trigger
  useEffect(() => {
    if (!open) return;
    const recompute = () => {
      const el = triggerRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      setMenuStyle({
        left:  r.left + window.scrollX,
        top:   r.bottom + window.scrollY + 4,
        width: r.width,
      });
    };
    recompute();
    window.addEventListener('scroll', recompute, true);
    window.addEventListener('resize', recompute);
    return () => {
      window.removeEventListener('scroll', recompute, true);
      window.removeEventListener('resize', recompute);
    };
  }, [open]);

  // Click outside / Escape
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

  const openMenu = () => {
    const idx = selectableOptions.findIndex(o => String(o.value) === String(value ?? ''));
    setHighlighted(idx >= 0 ? idx : 0);
    setOpen(true);
  };

  const pick = (v) => {
    onChange?.({ target: { value: v, name } });
    setOpen(false);
    triggerRef.current?.focus();
  };

  const toggle = () => {
    if (disabled) return;
    if (open) setOpen(false);
    else openMenu();
  };

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

  const heightCls =
    size === 'sm' ? 'h-9'  :
    size === 'lg' ? 'h-12' :
                    'h-10';

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
        style={{
          background: 'var(--bg-subtle)',
          border: '1px solid var(--border)',
          color: 'var(--text-primary)',
          fontFamily: "'Kumbh Sans', sans-serif",
        }}
        className={`
          relative w-full ${heightCls} pl-3 pr-9 rounded-xl text-sm text-left
          transition-all flex items-center
          hover:border-[var(--accent)]
          focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30
          focus:border-[var(--accent)]
          disabled:opacity-50 disabled:cursor-not-allowed
          ${className}
        `}
        {...rest}
      >
        <span
          className="flex-1 truncate"
          style={selected ? undefined : { color: 'var(--text-muted)' }}
        >
          {displayLabel || placeholder || ' '}
        </span>
        <ChevronDown
          size={14}
          className={`absolute right-3 top-1/2 -translate-y-1/2 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          style={{ color: 'var(--text-muted)' }}
        />
      </button>

      {open && createPortal(
        <div
          ref={menuRef}
          role="listbox"
          style={{
            position: 'absolute',
            ...menuStyle,
            zIndex: 9999,
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-lg, 0 12px 32px rgba(0,0,0,0.18))',
          }}
          className="
            rounded-xl overflow-hidden
            animate-in fade-in slide-in-from-top-1 duration-150
          "
        >
          <ul className="max-h-64 overflow-y-auto py-1">
            {options.length === 0 && (
              <li className="px-3 py-2 text-sm" style={{ color: 'var(--text-muted)' }}>No options</li>
            )}
            {(() => {
              // Convention: the first <option> always acts as the label / placeholder
              // and is hidden from the open dropdown. Its label is still shown muted
              // in the trigger when nothing else is selected.
              const firstOptionIdx = options.findIndex(o => o.kind === 'option');
              return options.map((opt, i) => {
                if (i === firstOptionIdx) return null;
                if (opt.kind === 'group') {
                return (
                  <li
                    key={`g-${i}`}
                    className="px-3 pt-2.5 pb-1 text-[10px] font-semibold uppercase tracking-widest"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {opt.label}
                  </li>
                );
              }
              const idxAmongSelectable = selectableOptions.indexOf(opt);
              const isActive = String(opt.value) === String(value ?? '');
              const isHighlighted = idxAmongSelectable === highlighted;
              const baseStyle = {
                fontFamily: "'Kumbh Sans', sans-serif",
                color: 'var(--text-primary)',
              };
              const activeStyle = isActive
                ? { background: 'var(--accent)', color: '#fff' }
                : isHighlighted
                  ? { background: 'var(--bg-subtle)', color: 'var(--accent)' }
                  : opt.disabled
                    ? { color: 'var(--text-muted)' }
                    : {};
              return (
                <li
                  key={`o-${i}-${opt.value}`}
                  role="option"
                  aria-selected={isActive}
                  onMouseEnter={() => !opt.disabled && setHighlighted(idxAmongSelectable)}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => !opt.disabled && pick(opt.value)}
                  style={{ ...baseStyle, ...activeStyle }}
                  className={`
                    flex items-center justify-between gap-2 mx-1 px-2.5 py-2 rounded-lg text-sm
                    transition-colors duration-100
                    ${opt.disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
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
