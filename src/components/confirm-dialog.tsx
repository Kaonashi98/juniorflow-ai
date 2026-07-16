"use client";

import { useEffect, useRef } from "react";
import { TriangleAlert } from "lucide-react";

export function ConfirmDialog({
  open,
  title,
  description,
  cancelLabel,
  confirmLabel,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title: string;
  description: string;
  cancelLabel: string;
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    previousFocusRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    cancelRef.current?.focus();
    return () => previousFocusRef.current?.focus();
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#14261f]/60 p-5">
      <div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            onCancel();
            return;
          }
          if (event.key !== "Tab") return;
          const buttons = dialogRef.current?.querySelectorAll<HTMLElement>(
            "button:not([disabled])",
          );
          const first = buttons?.[0];
          const last = buttons?.[buttons.length - 1];
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last?.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first?.focus();
          }
        }}
        className="w-full max-w-md border border-[#14261f] bg-white p-6 shadow-[7px_7px_0_#c8f169]"
      >
        <span className="flex size-10 items-center justify-center bg-[#fff1e8] text-[#9a5137]">
          <TriangleAlert aria-hidden="true" size={20} />
        </span>
        <h2 id="confirm-dialog-title" className="mt-4 text-xl font-semibold">
          {title}
        </h2>
        <p id="confirm-dialog-description" className="mt-2 leading-7 text-[#64736d]">
          {description}
        </p>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            className="min-h-11 border border-[#cbd4cc] px-4 font-semibold"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="min-h-11 bg-[#8e4a3a] px-4 font-semibold text-white hover:bg-[#743a2d]"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
