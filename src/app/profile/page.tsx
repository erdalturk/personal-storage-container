"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Share2,
  Trash2,
  ExternalLink,
  Copy,
  Check,
  Shield,
  KeyRound,
  FileText,
  Film,
  Layers,
  Calendar,
  Eye,
  AlertCircle,
  Ban,
  Sparkles,
  Settings,
  Edit3,
  X,
  User,
  Lock,
  Code2,
  Compass,
  GraduationCap,
  Music,
  Image as ImageIcon,
  FolderArchive,
  Download,
  Upload,
  LogOut,
  Database,
  Cloud,
  RefreshCw,
  CheckCircle2,
  Sun,
  Moon,
  Monitor,
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { useTheme } from "@/components/ThemeProvider";
import { syncLocalDataToCloud, getSyncStatus } from "@/lib/syncService";
import {
  getSharedLinks,
  toggleShareLinkActive,
  deleteSharedLink,
  SharedLink,
  getCurrentUser,
  loginUser,
  logoutUser,
  exportFullArchive,
  importFullArchive,
  hasMasterPin,
  setMasterPin,
  changeMasterPin,
  resetMasterPinForDemo,
} from "@/lib/appStore";

const AVATAR_PALETTES = [
  { id: "purple", name: "Mor & İndigo", gradient: "from-purple-500 to-indigo-600" },
  { id: "blue", name: "Mavi & Cyan", gradient: "from-blue-500 to-cyan-500" },
  { id: "emerald", name: "Zümrüt & Yeşil", gradient: "from-emerald-500 to-teal-600" },
  { id: "amber", name: "Turuncu & Amber", gradient: "from-amber-500 to-orange-600" },
  { id: "rose", name: "Kırmızı & Pembe", gradient: "from-rose-500 to-pink-600" },
];

export default function ProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { theme, setTheme, resolvedTheme } = useTheme();

  // Profil State'leri
  const [displayName, setDisplayName] = useState("Erdal Türk");
  const [email, setEmail] = useState("erdal.turk@kisiseldepo.com");
  const [avatarGradient, setAvatarGradient] = useState("from-purple-500 to-indigo-600");

  // Düzenleme Modalı State'leri
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [tempDisplayName, setTempDisplayName] = useState(displayName);
  const [tempAvatarGradient, setTempAvatarGradient] = useState(avatarGradient);

  // Paylaşılan Linkler (Merkezi Store ile Tam Senkronize)
  const [sharedLinks, setSharedLinks] = useState<SharedLink[]>([]);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Master PIN Güvenlik State'leri
  const [isPinSet, setIsPinSet] = useState(false);
  const [currentPinInput, setCurrentPinInput] = useState("");
  const [newPinInput, setNewPinInput] = useState("");
  const [confirmPinInput, setConfirmPinInput] = useState("");
  const [pinFeedback, setPinFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [isPinFormOpen, setIsPinFormOpen] = useState(false);

  // Bulut Senkronizasyon State'leri
  const [syncStatus, setSyncStatus] = useState(() => getSyncStatus());
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const syncAll = () => {
      setSharedLinks(getSharedLinks());
      setIsPinSet(hasMasterPin());
      const currentUser = getCurrentUser();
      if (currentUser?.name) setDisplayName(currentUser.name);
      if (currentUser?.email) setEmail(currentUser.email);
    };
    syncAll();

    window.addEventListener("psc-store-updated", syncAll);
    return () => window.removeEventListener("psc-store-updated", syncAll);
  }, []);

  const handleUpdateMasterPin = (e: React.FormEvent) => {
    e.preventDefault();
    setPinFeedback(null);
    const cleanNew = newPinInput.trim();
    if (!/^\d{4,6}$/.test(cleanNew)) {
      setPinFeedback({ type: "error", msg: "Yeni PIN 4 ile 6 haneli rakamlardan oluşmalıdır." });
      return;
    }
    if (cleanNew !== confirmPinInput.trim()) {
      setPinFeedback({ type: "error", msg: "Yeni PIN ve tekrarı birbiriyle uyuşmuyor!" });
      return;
    }

    if (isPinSet) {
      const res = changeMasterPin(currentPinInput, cleanNew);
      if (res.success) {
        setPinFeedback({ type: "success", msg: "Master PIN'iniz başarıyla güncellendi." });
        setCurrentPinInput("");
        setNewPinInput("");
        setConfirmPinInput("");
        setIsPinSet(true);
        setIsPinFormOpen(false);
        setToastMessage("Master PIN güncellendi.");
        setTimeout(() => setToastMessage(null), 3500);
      } else {
        setPinFeedback({ type: "error", msg: res.message });
      }
    } else {
      const res = setMasterPin(cleanNew);
      if (res.success) {
        setPinFeedback({ type: "success", msg: "Kişisel Master PIN'iniz oluşturuldu." });
        setNewPinInput("");
        setConfirmPinInput("");
        setIsPinSet(true);
        setIsPinFormOpen(false);
        setToastMessage("Master PIN oluşturuldu.");
        setTimeout(() => setToastMessage(null), 3500);
      } else {
        setPinFeedback({ type: "error", msg: res.message });
      }
    }
  };

  // Düzenleme Modalını Aç
  const handleOpenEdit = () => {
    setTempDisplayName(displayName);
    setTempAvatarGradient(avatarGradient);
    setIsEditModalOpen(true);
  };

  // Düzenlemeyi Kaydet
  const handleSaveProfile = () => {
    if (!tempDisplayName.trim()) {
      alert("Lütfen geçerli bir görünen ad yazın.");
      return;
    }
    setDisplayName(tempDisplayName.trim());
    loginUser(email, tempDisplayName.trim());
    setAvatarGradient(tempAvatarGradient);
    setIsEditModalOpen(false);
    setToastMessage("Profil bilgileriniz başarıyla güncellendi.");
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Çıkış Yap (Logout)
  const handleLogout = () => {
    logoutUser();
    router.push("/login");
  };

  // Bulut Senkronizasyonu Tetikle (Local -> Cloud)
  const handleCloudSync = async () => {
    setIsSyncing(true);
    const res = await syncLocalDataToCloud();
    setIsSyncing(false);
    setSyncStatus(getSyncStatus());
    setToastMessage(res.message);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Tam Arşiv Yedeği İndir (.json)
  const handleExportBackup = () => {
    const jsonData = exportFullArchive();
    const blob = new Blob([jsonData], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const dateStr = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.download = `kisisel-depo-yedek-${dateStr}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setToastMessage("Tüm arşiv yedeğiniz (.json) başarıyla indirildi.");
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Yedekten Geri Yükle (.json)
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const result = importFullArchive(content);
      setToastMessage(result.message);
      setTimeout(() => setToastMessage(null), 4500);
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // Paylaşım Bağlantısını İptal Et / Yeniden Aç (Revoke - Bölüm 15.2)
  const handleToggleShareActive = (id: string) => {
    const updated = toggleShareLinkActive(id);
    if (updated) {
      setToastMessage(
        updated.isActive
          ? `"${updated.itemTitle}" paylaşım bağlantısı yeniden aktif edildi.`
          : `"${updated.itemTitle}" paylaşım bağlantısı iptal edildi. Dış erişim kapatıldı.`
      );
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  // Link Kopyala
  const handleCopyLink = (token: string) => {
    const fullUrl = `${window.location.origin}/share/${token}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2500);
  };

  // Paylaşım Bağlantısını Tamamen Sil / Kaldır (Otomatik Silinme Kuralı)
  const handleDeleteShare = (id: string) => {
    const target = sharedLinks.find((s) => s.id === id);
    deleteSharedLink(id);
    setToastMessage(
      `"${target?.itemTitle}" paylaşım bağlantısı iptal edildi ve paylaşılan içerikler listesinden kaldırıldı.`
    );
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans flex flex-col transition-colors duration-200">
      {/* ÜST HEADER */}
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 h-16 flex items-center justify-between px-4 sm:px-8 shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Ana Sayfaya Dön"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>

          <div>
            <h1 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white">
              Hesap, Yedekleme ve Paylaşım Yönetimi
            </h1>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Profil bilgileri, tam arşiv yedekleme ve salt okunur dış bağlantılar
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <ThemeToggle />
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/80 text-xs font-bold transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Oturumu Kapat</span>
          </button>
        </div>
      </header>

      {/* ANA İÇERİK ALANI */}
      <main className="max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8 flex-1">
        {/* 1. KULLANICI KİMLİK KARTI (Görüntüleme Modu - Sade, Temiz, Düzenle Butonlu) */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div
              className={`w-16 h-16 rounded-2xl bg-gradient-to-tr ${avatarGradient} flex items-center justify-center text-white text-xl font-bold shadow-md shadow-indigo-100 dark:shadow-none shrink-0 transition-all`}
            >
              {displayName.slice(0, 2).toUpperCase() || "ET"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-xl sm:text-2xl text-slate-900 dark:text-white tracking-tight">
                  {displayName}
                </h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{email}</p>
              
              <div className="flex items-center gap-2 mt-2">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-300">
                  <Shield className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  <span>Kişisel Arşiv Sahibi</span>
                </div>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                  • Ekim 2026'dan beri üye
                </span>
              </div>
            </div>
          </div>

          {/* DÜZENLE BUTONU (Kullanıcının talep ettiği estetik düğme) */}
          <div className="self-end sm:self-center flex items-center gap-2.5">
            <button
              onClick={handleOpenEdit}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all border border-slate-200 dark:border-slate-700 shadow-xs"
            >
              <Settings className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              <span>Profili Düzenle</span>
            </button>
          </div>
        </div>

        {/* 1.1 GÖRÜNÜM & TEMA YÖNETİMİ (Karanlık Mod / Açık Mod / Sistem) */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-100 dark:border-indigo-800/60">
                {resolvedTheme === "dark" ? <Moon className="w-5 h-5 text-amber-400" /> : <Sun className="w-5 h-5 text-amber-500" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    Görünüm ve Tema Tercihi
                  </h3>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full border bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/60">
                    {theme === "system" ? "Sistem (Otomatik)" : theme === "dark" ? "Koyu Tema" : "Açık Tema"}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Uygulamanın açık veya OLED uyumlu koyu modda nasıl görüneceğini belirleyin.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <button
              type="button"
              onClick={() => setTheme("system")}
              className={`p-4 rounded-2xl border-2 flex items-center gap-3 transition-all text-left ${
                theme === "system"
                  ? "border-indigo-600 dark:border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40 ring-2 ring-indigo-200 dark:ring-indigo-800/60"
                  : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50 dark:bg-slate-800/60"
              }`}
            >
              <div className="w-9 h-9 rounded-xl bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
                <Monitor className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">Sistem Varsayılanı</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">Cihaz ayarını izler</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setTheme("light")}
              className={`p-4 rounded-2xl border-2 flex items-center gap-3 transition-all text-left ${
                theme === "light"
                  ? "border-indigo-600 dark:border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40 ring-2 ring-indigo-200 dark:ring-indigo-800/60"
                  : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50 dark:bg-slate-800/60"
              }`}
            >
              <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <Sun className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">Açık Tema</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">Standart aydınlık mod</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setTheme("dark")}
              className={`p-4 rounded-2xl border-2 flex items-center gap-3 transition-all text-left ${
                theme === "dark"
                  ? "border-indigo-600 dark:border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40 ring-2 ring-indigo-200 dark:ring-indigo-800/60"
                  : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50 dark:bg-slate-800/60"
              }`}
            >
              <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <Moon className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">Koyu Tema</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">OLED uyumlu karanlık mod</div>
              </div>
            </button>
          </div>
        </section>

        {/* 1.2 MASTER PIN GÜVENLİK YÖNETİMİ (Tek Master PIN ile Tüm Depoları Koruma) */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-100 dark:border-indigo-800/60">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    Depo Güvenlik PIN'i (Master PIN)
                  </h3>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                      isPinSet
                        ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60"
                        : "bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800/60"
                    }`}
                  >
                    {isPinSet ? "Özel Master PIN Aktif" : "Varsayılan PIN (1234)"}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Tüm kilitli depolarınız tek bir Master PIN ile korunur ve sadece bu sayfadan değiştirilebilir.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsPinFormOpen(!isPinFormOpen);
                setPinFeedback(null);
                setCurrentPinInput("");
                setNewPinInput("");
                setConfirmPinInput("");
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition border border-slate-200 dark:border-slate-700 self-start sm:self-auto"
            >
              <Lock className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span>{isPinFormOpen ? "Formu Kapat" : isPinSet ? "PIN'i Değiştir" : "Kişisel PIN Belirle"}</span>
            </button>
          </div>

          {/* PIN Değiştirme / Belirleme Formu */}
          <AnimatePresence>
            {isPinFormOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4 overflow-hidden"
              >
                {pinFeedback && (
                  <div
                    className={`p-3.5 rounded-2xl text-xs font-semibold border ${
                      pinFeedback.type === "success"
                        ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60"
                        : "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900/60"
                    }`}
                  >
                    {pinFeedback.msg}
                  </div>
                )}

                <form onSubmit={handleUpdateMasterPin} className="space-y-4 max-w-md">
                  {isPinSet && (
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                        Mevcut PIN
                      </label>
                      <input
                        type="password"
                        maxLength={6}
                        value={currentPinInput}
                        onChange={(e) => setCurrentPinInput(e.target.value)}
                        placeholder="••••"
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl text-sm font-mono tracking-widest outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900"
                        autoFocus
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                        Yeni PIN (4-6 Haneli)
                      </label>
                      <input
                        type="password"
                        maxLength={6}
                        value={newPinInput}
                        onChange={(e) => setNewPinInput(e.target.value)}
                        placeholder="••••"
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl text-sm font-mono tracking-widest outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900"
                        autoFocus={!isPinSet}
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                        Yeni PIN Tekrar
                      </label>
                      <input
                        type="password"
                        maxLength={6}
                        value={confirmPinInput}
                        onChange={(e) => setConfirmPinInput(e.target.value)}
                        placeholder="••••"
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl text-sm font-mono tracking-widest outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-200 dark:shadow-none transition"
                    >
                      {isPinSet ? "PIN'i Güncelle" : "Master PIN'i Kaydet"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsPinFormOpen(false)}
                      className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    >
                      Vazgeç
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* 1.4 BULUT VERİTABANI & HİBRİT SENKRONİZASYON (SUPABASE POSTGRESQL) */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-100 dark:border-emerald-800/60">
                <Cloud className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    Bulut Veritabanı & Senkronizasyon (Supabase)
                  </h3>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                      syncStatus.isConfigured
                        ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60"
                        : "bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800/60"
                    }`}
                  >
                    {syncStatus.isConfigured ? "🟢 Bulut Bağlantısı Aktif" : "🟡 Yerel Mod (Offline / PWA)"}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {syncStatus.lastSyncedAt
                    ? `Son eşitleme: ${syncStatus.lastSyncedAt}`
                    : "Verileriniz tarayıcınızda güvende. Dilediğiniz an tek tıkla bulut veritabanına aktarabilirsiniz."}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 self-start sm:self-auto">
              <button
                type="button"
                onClick={handleCloudSync}
                disabled={isSyncing}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold transition shadow-xs cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
                <span>{isSyncing ? "Eşitleniyor..." : "Buluta Şimdi Eşitle"}</span>
              </button>
            </div>
          </div>
        </section>

        {/* 1.5 TAM ARŞİV YEDEKLEME VE GERİ YÜKLEME (.JSON) KARTI */}
        <section className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg border border-indigo-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-2 max-w-lg">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-[11px] font-bold">
              <Database className="w-3.5 h-3.5 text-amber-400" />
              <span>Taşınabilir Veri & Tam Yedekleme</span>
            </div>
            <h3 className="text-lg font-extrabold tracking-tight">
              Tam Arşiv Yedekleme & Geri Yükleme (.json)
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Tüm 8 deponuzdaki içeriklerinizi, klasörlerinizi, paylaşım bağlantılarınızı ve çöp kutusu geçmişinizi tek bir <b>.json</b> dosyası olarak bilgisayarınıza indirebilir veya daha önce aldığınız bir yedeği geri yükleyebilirsiniz.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handleExportBackup}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition"
            >
              <Download className="w-4 h-4" />
              <span>Tüm Arşivimi İndir (.json)</span>
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={handleImportBackup}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs font-bold transition"
            >
              <Upload className="w-4 h-4 text-amber-300" />
              <span>Yedekten Geri Yükle</span>
            </button>
          </div>
        </section>

        {/* 2. PAYLAŞILAN İÇERİKLER BÖLÜMÜ (Bölüm 15.2 - Kritik Yönetim Ekranı) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Paylaşılan İçerikler
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Daha önce oluşturduğun salt okunur dış bağlantıları yönet ve istediğin zaman erişimi iptal et.
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold border border-indigo-200 dark:border-indigo-800/60">
              {sharedLinks.filter((s) => s.isActive).length} Aktif Bağlantı
            </span>
          </div>

          {/* Otomatik İptal & Temizleme Güvenlik Bilgilendirmesi */}
          <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 flex items-center gap-3 text-xs text-indigo-900 dark:text-indigo-200">
            <Shield className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <span>
              <b>Otomatik İptal Kuralı:</b> Silinen içerik veya depolara ait tüm dış bağlantılar anında sonlandırılır ve bu listeden otomatik olarak kaldırılır.
            </span>
          </div>

          {sharedLinks.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 space-y-2">
              <Share2 className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
              <h3 className="font-bold text-slate-800 dark:text-slate-200">Henüz paylaşılan içerik yok</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Depolarındaki şiirleri veya filmleri dışarıdaki insanlara salt okunur göstermek için içerik kartındaki "Paylaş" butonunu kullanabilirsin.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {sharedLinks.map((link) => (
                <div
                  key={link.id}
                  className={`bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    link.isActive
                      ? "border-slate-200 dark:border-slate-800 shadow-xs"
                      : "border-slate-200/60 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-850/40 opacity-60"
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 ${
                        link.type === "container"
                          ? "bg-indigo-600"
                          : link.type === "text"
                          ? "bg-blue-500"
                          : link.type === "code"
                          ? "bg-emerald-600"
                          : link.type === "travel"
                          ? "bg-amber-500"
                          : link.type === "study"
                          ? "bg-sky-600"
                          : link.type === "audio"
                          ? "bg-amber-600"
                          : link.type === "image"
                          ? "bg-rose-600"
                          : link.type === "file"
                          ? "bg-teal-700"
                          : "bg-purple-600"
                      }`}
                    >
                      {link.type === "container" ? (
                        <Layers className="w-5 h-5" />
                      ) : link.type === "text" ? (
                        <FileText className="w-5 h-5" />
                      ) : link.type === "code" ? (
                        <Code2 className="w-5 h-5" />
                      ) : link.type === "travel" ? (
                        <Compass className="w-5 h-5" />
                      ) : link.type === "study" ? (
                        <GraduationCap className="w-5 h-5" />
                      ) : link.type === "audio" ? (
                        <Music className="w-5 h-5" />
                      ) : link.type === "image" ? (
                        <ImageIcon className="w-5 h-5" />
                      ) : link.type === "file" ? (
                        <FolderArchive className="w-5 h-5" />
                      ) : (
                        <Film className="w-5 h-5" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                          {link.itemTitle}
                        </h4>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            link.scope === "container"
                              ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                          }`}
                        >
                          {link.scope === "container" ? "Tüm Depo" : "Tekil İçerik"}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            link.isActive
                              ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60"
                              : "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60"
                          }`}
                        >
                          {link.isActive ? "Aktif" : "Erişim Kapatıldı"}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-500 dark:text-slate-400 font-medium flex-wrap">
                        <span>Depo: {link.containerName}</span>
                        <span>•</span>
                        <span>{link.createdAt}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3 text-slate-400" />
                          {link.views} görüntülenme
                        </span>
                      </div>

                      <div className="mt-2 text-[11px] font-mono text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                        <span>/share/{link.token}</span>
                      </div>
                    </div>
                  </div>

                  {/* Sağ Eylemler: Kopyala, Aç, İptal Et, Sil */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    {/* Linki Aç */}
                    <Link
                      href={`/share/${link.token}`}
                      target="_blank"
                      className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Salt Okunur Önizlemeyi Aç"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>

                    {/* Linki Kopyala */}
                    <button
                      onClick={() => handleCopyLink(link.token)}
                      className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Bağlantıyı Kopyala"
                    >
                      {copiedToken === link.token ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>

                    {/* Erişimi İptal Et / Yeniden Aç (Section 15.2) */}
                    <button
                      onClick={() => handleToggleShareActive(link.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                        link.isActive
                          ? "bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-900/60"
                          : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700"
                      }`}
                      title={
                        link.isActive
                          ? "Bağlantıyı Kapat (Kimse erişemesin)"
                          : "Bağlantıyı Yeniden Aktif Et"
                      }
                    >
                      <Ban className="w-3.5 h-3.5" />
                      <span>{link.isActive ? "Erişimi İptal Et" : "Yeniden Aç"}</span>
                    </button>

                    {/* Bağlantıyı Tamamen Sil / Kaldır */}
                    <button
                      onClick={() => handleDeleteShare(link.id)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                      title="Paylaşım Bağlantısını İptal Et ve Listeden Kaldır"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* 3. PROFİLİ DÜZENLE MODALI (Section 13.2 & 13.3) */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditModalOpen(false)}
              className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 z-10 space-y-6"
            >
              {/* Modal Başlık */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white">
                      Profili Düzenle
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Salt okunur paylaşımlarda görünecek kimliğinizi güncelleyin
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Alanları */}
              <div className="space-y-4">
                {/* 1. Görünen Ad / Takma Ad */}
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Görünen Ad / Takma Ad
                  </label>
                  <input
                    type="text"
                    value={tempDisplayName}
                    onChange={(e) => setTempDisplayName(e.target.value)}
                    placeholder="Örn: Erdal Türk"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-indigo-100 transition-all"
                  />
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block">
                    Bu isim dışarıya paylaştığınız içeriklerde imzanız olarak görünür.
                  </span>
                </div>

                {/* 2. Avatar Renk Paleti */}
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
                    Avatar Rengi Seçin
                  </label>
                  <div className="flex items-center gap-2.5">
                    {AVATAR_PALETTES.map((palette) => (
                      <button
                        key={palette.id}
                        type="button"
                        onClick={() => setTempAvatarGradient(palette.gradient)}
                        className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${palette.gradient} flex items-center justify-center text-white transition-all shadow-xs ${
                          tempAvatarGradient === palette.gradient
                            ? "ring-3 ring-indigo-500 ring-offset-2 scale-110"
                            : "hover:scale-105 opacity-80 hover:opacity-100"
                        }`}
                        title={palette.name}
                      >
                        {tempAvatarGradient === palette.gradient && (
                          <Check className="w-4 h-4 stroke-[3]" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. E-posta (Salt Okunur) */}
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Giriş E-postası (Değiştirilemez)
                  </label>
                  <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-xl text-xs text-slate-500 dark:text-slate-400 font-medium">
                    <span>{email}</span>
                    <Lock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                  </div>
                </div>

                {/* Bölüm 13.3 Kural Hatırlatması */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  💡 <b>Not:</b> Platform sosyal medya olmadığı için biyografi (bio), takipçi ve benzeri alanlar bulunmamaktadır.
                </div>
              </div>

              {/* Alt Eylemler: Vazgeç & Kaydet */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Vazgeç
                </button>
                <button
                  type="button"
                  onClick={handleSaveProfile}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-200 transition-colors"
                >
                  Değişiklikleri Kaydet
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* TOAST BİLDİRİMİ */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl text-xs font-semibold"
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
