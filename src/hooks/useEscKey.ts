"use client";

import { useEffect } from "react";

/**
 * Kişisel Depo — Evrensel ESC Tuşu ile Modal Kapatma Kancası
 *
 * Modal açıkken Escape tuşuna basıldığında tetiklenir.
 * Eğer formda kaydedilmemiş bir değişiklik varsa (isDirty === true),
 * kullanıcıya kazara veri kaybını önlemek için onay sorusu yöneltir.
 */
export function useEscKey(
  isOpen: boolean,
  onClose: () => void,
  isDirty: boolean = false,
  confirmMessage: string = "Kaydedilmemiş değişiklikleriniz var. Yine de kapatmak istediğinize emin misiniz?"
): void {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Esc") {
        e.preventDefault();
        if (isDirty) {
          const confirmed =
            typeof window !== "undefined"
              ? window.confirm(confirmMessage)
              : true;
          if (confirmed) {
            onClose();
          }
        } else {
          onClose();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, isDirty, confirmMessage]);
}

export default useEscKey;
