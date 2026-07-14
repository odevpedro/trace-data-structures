import { useCallback, useEffect, useRef } from "react";
import type { LimitationDrawer } from "../../core/trace-engine/types";

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  limitation: LimitationDrawer;
}

export function Drawer({ isOpen, onClose, limitation }: DrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;
      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (!isOpen) return;
    previousFocusRef.current = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);
    requestAnimationFrame(() => {
      panelRef.current?.querySelector<HTMLElement>("button")?.focus();
    });
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      previousFocusRef.current?.focus();
    };
  }, [handleKeyDown, isOpen]);

  if (!isOpen) return null;

  return (
    <>
      <div
        className="drawer-backdrop"
        data-open="true"
        aria-hidden="true"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        className="drawer-panel"
        data-open="true"
        role="dialog"
        aria-modal="true"
        aria-label={limitation.title}
        tabIndex={-1}
      >
        <div className="drawer-header">
          <span className="eyebrow">Simulador de limitação</span>
          <h2>{limitation.title}</h2>
          <button
            type="button"
            className="icon-button"
            aria-label="Fechar"
            onClick={onClose}
          >
            ✕
          </button>
        </div>
        <div className="drawer-body">
          <div className="drawer-bar">
            <span className="drawer-bar-label">{limitation.goodLabel}</span>
            <div className="drawer-bar-track" aria-hidden="true">
              <div
                className="drawer-bar-fill drawer-bar-fill--good"
                style={{ width: `${limitation.goodWidth}%` }}
              />
            </div>
            <span className="drawer-bar-value">{limitation.goodValue}</span>
          </div>
          <div className="drawer-bar">
            <span className="drawer-bar-label">{limitation.badLabel}</span>
            <div className="drawer-bar-track" aria-hidden="true">
              <div
                className="drawer-bar-fill drawer-bar-fill--bad"
                style={{ width: `${limitation.badWidth}%` }}
              />
            </div>
            <span className="drawer-bar-value">{limitation.badValue}</span>
          </div>
          <p className="drawer-note">{limitation.text}</p>
        </div>
      </div>
    </>
  );
}
