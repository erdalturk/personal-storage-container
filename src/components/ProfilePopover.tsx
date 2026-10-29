"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  KeyRound,
  Shield,
  Cloud,
  Share2,
  LogOut,
  Sun,
  Moon,
  Monitor,
  Check,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { getCurrentUser, logoutUser, hasMasterPin, getSharedLinks } from "@/lib/appStore";
import { useTheme } from "@/components/ThemeProvider";
import { getSyncStatus } from "@/lib/syncService";
import useEscKey from "@/hooks/useEscKey";

interface ProfilePopoverProps {
  userName?: string;
  userAvatar?: string;
}

export default function ProfilePopover({
  userName = "Erdal Türk",
  userAvatar = "ET",
}: ProfilePopoverProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const { theme, setTheme } = useTheme();
  const [pinConfigured, setPinConfigured] = useState(false);
  const [activeShareCount, setActiveShareCount] = useState(0);
  const [syncState, setSyncState] = useState({ isConfigured: false, lastSyncedAt: null as string | null });
  const [currentUser, setCurrentUser] = useState(getCurrentUser());

  useEffect(() => {
    const syncInfo = () => {
      setPinConfigured(hasMasterPin());
      const links = getSharedLinks();
      setActiveShareCount(links.filter((l) => l.isActive).length);
      const s = getSyncStatus();
      setSyncState({ isConfigured: s.isConfigured, lastSyncedAt: s.lastSyncedAt });
      setCurrentUser(getCurrentUser());
    };

    syncInfo();
    window.addEventListener("psc-store-updated", syncInfo);
    return () => window.removeEventListener("psc-store-updated", syncInfo);
  }, [isOpen]);

  // Dışarı tıklama kontrolü
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // ESC ile kapatma
  useEscKey(isOpen, () => setIsOpen(false));

  const handleLogout = () => {
    logoutUser();
    setIsOpen(false);
    router.push("/login");
  };

  return (
    <div className="relative" ref={popoverRef}>
      {/* Profil Rozeti / Tetikleyici Buton */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800/90 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 transition-colors border border-slate-200/60 dark:border-slate-700/60 cursor-pointer shadow-2xs select-none"
        title="Profil Menüsü ve Hızlı Ayarlar"
        aria-expanded={isOpen}
      >
        {currentUser?.avatarImage ? (
          <img
            src={currentUser.avatarImage}
            alt={currentUser?.name || userName}
            className="w-7 h-7 rounded-full object-cover shadow-xs border border-white/40 dark:border-slate-700 shrink-0"
          />
        ) : (
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold shadow-xs">
            {userAvatar}
          </div>
        )}
        <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 hidden sm:inline">
          {userName}
        </span>
      </button>

      {/* Popover Menü */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ type: "spring", stiffness: 450, damping: 30 }}
            className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-4 z-50 overflow-hidden"
          >
            {/* Kullanıcı Kartı */}
            <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 mb-3">
              {currentUser?.avatarImage ? (
                <img
                  src={currentUser.avatarImage}
                  alt={currentUser?.name || userName}
                  className="w-10 h-10 rounded-2xl object-cover shadow-xs shrink-0 border border-slate-200 dark:border-slate-700"
                />
              ) : (
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm shadow-xs shrink-0">
                  {userAvatar}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="text-xs font-extrabold text-slate-900 dark:text-white truncate">
                  {currentUser?.name || userName}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  {currentUser?.email || "erdal.turk@kisiseldepo.com"}
                </div>
              </div>
              <Link
                href="/profile"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-xl hover:bg-white dark:hover:bg-slate-700 text-slate-500 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                title="Profile Git"
              >
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Tema Hızlı Seçici */}
            <div className="p-2.5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 mb-3">
              <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                Arayüz Teması
              </div>
              <div className="grid grid-cols-3 gap-1 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200/70 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setTheme("light")}
                  className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                    theme === "light"
                      ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold"
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <Sun className="w-3.5 h-3.5" />
                  <span>Açık</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTheme("dark")}
                  className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                    theme === "dark"
                      ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold"
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <Moon className="w-3.5 h-3.5" />
                  <span>Koyu</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTheme("system")}
                  className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                    theme === "system"
                      ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold"
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <Monitor className="w-3.5 h-3.5" />
                  <span>Oto</span>
                </button>
              </div>
            </div>

            {/* Durum Rozetleri: Master PIN & Senkronizasyon */}
            <div className="space-y-1.5 mb-3 text-xs font-medium">
              <Link
                href="/profile"
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition text-slate-700 dark:text-slate-200"
              >
                <div className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-indigo-500" />
                  <span>Master PIN Kilidi</span>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    pinConfigured
                      ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                      : "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
                  }`}
                >
                  {pinConfigured ? "Aktif" : "Belirlenmedi"}
                </span>
              </Link>

              <Link
                href="/profile"
                onClick={() => setIsOpen(false)}
                title={
                  syncState.isConfigured
                    ? "Supabase PostgreSQL bulut senkronizasyonu aktif"
                    : "Yerel Mod (Offline / PWA): Verileriniz tarayıcınızın yerel hafızasında saklanmaktadır."
                }
                className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition text-slate-700 dark:text-slate-200"
              >
                <div className="flex items-center gap-2">
                  <Cloud className="w-4 h-4 text-sky-500" />
                  <span>Bulut Eşitleme</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  {syncState.isConfigured ? "Supabase Aktif" : "Yerel Mod"}
                </span>
              </Link>

              <Link
                href="/profile"
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition text-slate-700 dark:text-slate-200"
              >
                <div className="flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-purple-500" />
                  <span>Paylaşılan Bağlantılar</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                  {activeShareCount} Aktif
                </span>
              </Link>
            </div>

            {/* Alt Eylemler: Profil Detay & Çıkış */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
              <Link
                href="/profile"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-xs font-bold transition"
              >
                <span>Tüm Ayarlar</span>
                <ExternalLink className="w-3 h-3" />
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-bold transition cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Çıkış Yap</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
