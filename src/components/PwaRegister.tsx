"use client";

import React, { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

export default function PwaRegister() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  useEffect(() => {
    // 1. Service Worker Kaydı
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          console.log("[PWA] Service Worker kayıt başarılı, kapsam:", reg.scope);
        })
        .catch((err) => {
          console.warn("[PWA] Service Worker kayıt hatası:", err);
        });
    }

    // 2. Tarayıcı Uygulama Yükleme İsteği Yakalama (beforeinstallprompt)
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Daha önce reddetmemişse banner'ı göster
      const dismissed = localStorage.getItem("psc_pwa_banner_dismissed");
      if (!dismissed) {
        setShowInstallBanner(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowInstallBanner(false);
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowInstallBanner(false);
    localStorage.setItem("psc_pwa_banner_dismissed", "true");
  };

  if (!showInstallBanner) return null;

  return (
    <aside aria-label="Uygulama bildirimleri" className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-sm z-50 bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-slate-800 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0">
          <Download className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="text-xs font-bold">Kişisel Depo'yu Yükle</div>
          <div className="text-[11px] text-slate-400">
            Ana ekrana ekleyip çevrimdışı hızlıca kullanın.
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={handleInstallClick}
          className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-xs"
        >
          Yükle
        </button>
        <button
          onClick={handleDismiss}
          className="p-1.5 text-slate-400 hover:text-white rounded-lg transition"
          title="Kapat"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}
