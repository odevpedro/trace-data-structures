import { useCallback, useEffect, useRef } from "react";
import type { LimitationDrawer } from "../../core/trace-engine/types";

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  limitation: LimitationDrawer;
}

export function Drawer({ isOpen, onClose, limitation }: DrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

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
    document.addEventListener("keydown", handleKeyDown);
    requestAnimationFrame(() => {
      panelRef.current?.querySelector<HTMLElement>("button")?.focus();
    });
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown, isOpen]);

  return (
    <>
      <div
        className="drawer-backdrop"
        data-open={isOpen}
        aria-hidden="true"
        onClick={onClose}
      />
      <aside
        ref={panelRef}
        className="drawer-panel"
        data-open={isOpen}
        role="dialog"
        aria-modal="true"
        aria-label={limitation.title}
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
            <div className="drawer-bar-track">
              <div
                className="drawer-bar-fill drawer-bar-fill--good"
                style={{ width: `${limitation.goodWidth}%` }}
              >
                <span>{limitation.goodValue}</span>
              </div>
            </div>
          </div>
          <div className="drawer-bar">
            <span className="drawer-bar-label">{limitation.badLabel}</span>
            <div className="drawer-bar-track">
              <div
                className="drawer-bar-fill drawer-bar-fill--bad"
                style={{ width: `${limitation.badWidth}%` }}
              >
                <span>{limitation.badValue}</span>
              </div>
            </div>
          </div>
          <p className="drawer-note">{limitation.text}</p>
        </div>
      </aside>
    </>
  );
}
