"use client";

import React, { useState } from "react";
import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { motion, AnimatePresence } from "framer-motion";

interface ThemeToggleProps {
  showLabel?: boolean;
  className?: string;
}

export default function ThemeToggle({ showLabel = false, className = "" }: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();
  const [showMenu, setShowMenu] = useState(false);

  // Tema etiketleri ve ikonları
  const getThemeInfo = () => {
    switch (theme) {
      case "dark":
        return { label: "Koyu Tema", icon: Moon, desc: "Göz yormayan karanlık mod" };
      case "light":
        return { label: "Açık Tema", icon: Sun, desc: "Aydınlık standart görünüm" };
      case "system":
      default:
        return {
          label: "Sistem",
          icon: Monitor,
          desc: `Cihaz ayarı izleniyor (${resolvedTheme === "dark" ? "Koyu" : "Açık"})`,
        };
    }
  };

  const current = getThemeInfo();
  const CurrentIcon = current.icon;

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        type="button"
        onClick={toggleTheme}
        onContextMenu={(e) => {
          e.preventDefault();
          setShowMenu(!showMenu);
        }}
        title={`Tema: ${current.label} (Değiştirmek için tıkla)`}
        className="flex items-center gap-2 p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 border border-slate-200/60 dark:border-slate-700/60 transition-all shadow-xs cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={theme}
            initial={{ y: -10, opacity: 0, rotate: -40 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            exit={{ y: 10, opacity: 0, rotate: 40 }}
            transition={{ duration: 0.18 }}
          >
            <CurrentIcon className="w-5 h-5 text-indigo-600 dark:text-amber-400" />
          </motion.div>
        </AnimatePresence>

        {showLabel && (
          <span className="text-xs font-medium text-slate-700 dark:text-slate-200">
            {current.label}
          </span>
        )}
      </button>

      {/* Sağ tık veya isteğe bağlı açılır menü */}
      {showMenu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
          <div className="absolute right-0 mt-2 w-44 z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-1.5 space-y-1">
            <button
              onClick={() => {
                setTheme("light");
                setShowMenu(false);
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-xl transition-colors ${
                theme === "light"
                  ? "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-semibold"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <Sun className="w-4 h-4 text-amber-500" />
              Açık Tema
            </button>
            <button
              onClick={() => {
                setTheme("dark");
                setShowMenu(false);
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-xl transition-colors ${
                theme === "dark"
                  ? "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-semibold"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <Moon className="w-4 h-4 text-indigo-400" />
              Koyu Tema
            </button>
            <button
              onClick={() => {
                setTheme("system");
                setShowMenu(false);
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-xl transition-colors ${
                theme === "system"
                  ? "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-semibold"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <Monitor className="w-4 h-4 text-sky-500" />
              Sistem Varsayılanı
            </button>
          </div>
        </>
      )}
    </div>
  );
}
