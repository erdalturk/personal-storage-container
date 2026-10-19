"use client";

import React, { useState } from "react";
import Link from "next/link";
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
} from "lucide-react";

interface SharedLink {
  id: string;
  token: string;
  itemTitle: string;
  containerName: string;
  type: "text" | "movie" | "code" | "container";
  scope: "container" | "item";
  createdAt: string;
  views: number;
  isActive: boolean; // Aktif veya İptal Edilmiş (Revoked)
}

const AVATAR_PALETTES = [
  { id: "purple", name: "Mor & İndigo", gradient: "from-purple-500 to-indigo-600" },
  { id: "blue", name: "Mavi & Cyan", gradient: "from-blue-500 to-cyan-500" },
  { id: "emerald", name: "Zümrüt & Yeşil", gradient: "from-emerald-500 to-teal-600" },
  { id: "amber", name: "Turuncu & Amber", gradient: "from-amber-500 to-orange-600" },
  { id: "rose", name: "Kırmızı & Pembe", gradient: "from-rose-500 to-pink-600" },
];

const INITIAL_SHARES: SharedLink[] = [
  {
    id: "s1",
    token: "sinema-kulubu-deposu",
    itemTitle: "Sinema Kulübü & Başyapıtlar",
    containerName: "Sinema Kulübü & Başyapıtlar",
    type: "container",
    scope: "container",
    createdAt: "Ekim 2026",
    views: 42,
    isActive: true,
  },
  {
    id: "s2",
    token: "gece-siirleri-deposu",
    itemTitle: "Gece Düşünceleri & Şiirlerim",
    containerName: "Gece Düşünceleri & Şiirlerim",
    type: "container",
    scope: "container",
    createdAt: "Ekim 2026",
    views: 19,
    isActive: true,
  },
  {
    id: "s3",
    token: "inception-arsiv",
    itemTitle: "Inception & Arşiv Notlarım",
    containerName: "Sinema Kulübü & Başyapıtlar",
    type: "movie",
    scope: "item",
    createdAt: "3 gün önce",
    views: 28,
    isActive: true,
  },
  {
    id: "s4",
    token: "mavi-aksamustu",
    itemTitle: "Mavi Bir Akşamüstü (Şiir)",
    containerName: "Gece Düşünceleri & Şiirlerim",
    type: "text",
    scope: "item",
    createdAt: "Dün",
    views: 14,
    isActive: true,
  },
  {
    id: "s5",
    token: "kod-parcaciklari-deposu",
    itemTitle: "Frontend & Fullstack Snippet'lar",
    containerName: "Frontend & Fullstack Snippet'lar",
    type: "container",
    scope: "container",
    createdAt: "Ekim 2026",
    views: 31,
    isActive: true,
  },
  {
    id: "s6",
    token: "snippet-jwt-auth",
    itemTitle: "FastAPI JWT Bearer Middleware",
    containerName: "Frontend & Fullstack Snippet'lar",
    type: "code",
    scope: "item",
    createdAt: "Dün",
    views: 9,
    isActive: true,
  },
];

export default function ProfilePage() {
  // Profil State'leri
  const [displayName, setDisplayName] = useState("Erdal Türk");
  const [email] = useState("erdalturk@example.com");
  const [avatarGradient, setAvatarGradient] = useState("from-purple-500 to-indigo-600");

  // Düzenleme Modalı State'leri
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [tempDisplayName, setTempDisplayName] = useState(displayName);
  const [tempAvatarGradient, setTempAvatarGradient] = useState(avatarGradient);

  // Paylaşılan Linkler
  const [sharedLinks, setSharedLinks] = useState<SharedLink[]>(INITIAL_SHARES);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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
    setAvatarGradient(tempAvatarGradient);
    setIsEditModalOpen(false);
    setToastMessage("Profil bilgileriniz başarıyla güncellendi.");
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Paylaşım Bağlantısını İptal Et (Revoke - Bölüm 15.2)
  const handleToggleShareActive = (id: string) => {
    setSharedLinks((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const newStatus = !s.isActive;
          setToastMessage(
            newStatus
              ? `"${s.itemTitle}" paylaşım bağlantısı yeniden aktif edildi.`
              : `"${s.itemTitle}" paylaşım bağlantısı iptal edildi. Dış erişim kapatıldı.`
          );
          setTimeout(() => setToastMessage(null), 4000);
          return { ...s, isActive: newStatus };
        }
        return s;
      })
    );
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
    setSharedLinks((prev) => prev.filter((s) => s.id !== id));
    setToastMessage(
      `"${target?.itemTitle}" paylaşım bağlantısı iptal edildi ve paylaşılanlar listesinden kaldırıldı.`
    );
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      {/* ÜST HEADER */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 sm:px-8 shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title="Ana Sayfaya Dön"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>

          <div>
            <h1 className="font-bold text-base sm:text-lg text-slate-900">
              Hesap ve Paylaşım Yönetimi
            </h1>
            <p className="text-[11px] text-slate-500">
              Profil bilgileri ve salt okunur dış bağlantılar
            </p>
          </div>
        </div>
      </header>

      {/* ANA İÇERİK ALANI */}
      <main className="max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8 flex-1">
        {/* 1. KULLANICI KİMLİK KARTI (Görüntüleme Modu - Sade, Temiz, Düzenle Butonlu) */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div
              className={`w-16 h-16 rounded-2xl bg-gradient-to-tr ${avatarGradient} flex items-center justify-center text-white text-xl font-bold shadow-md shadow-indigo-100 shrink-0 transition-all`}
            >
              {displayName.slice(0, 2).toUpperCase() || "ET"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-xl sm:text-2xl text-slate-900 tracking-tight">
                  {displayName}
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{email}</p>
              
              <div className="flex items-center gap-2 mt-2">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-[10px] font-bold text-slate-600">
                  <Shield className="w-3 h-3 text-emerald-600" />
                  <span>Kişisel Arşiv Sahibi</span>
                </div>
                <span className="text-[10px] text-slate-400 font-medium">
                  • Ekim 2026'dan beri üye
                </span>
              </div>
            </div>
          </div>

          {/* DÜZENLE BUTONU (Kullanıcının talep ettiği estetik düğme) */}
          <div className="self-end sm:self-center">
            <button
              onClick={handleOpenEdit}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-bold transition-all border border-slate-200 shadow-xs"
            >
              <Settings className="w-4 h-4 text-slate-500" />
              <span>Profili Düzenle</span>
            </button>
          </div>
        </div>

        {/* 2. PAYLAŞILAN İÇERİKLER BÖLÜMÜ (Bölüm 15.2 - Kritik Yönetim Ekranı) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Paylaşılan İçerikler
              </h2>
              <p className="text-xs text-slate-500">
                Daha önce oluşturduğun salt okunur dış bağlantıları yönet ve istediğin zaman erişimi iptal et.
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-200">
              {sharedLinks.filter((s) => s.isActive).length} Aktif Bağlantı
            </span>
          </div>

          {/* Otomatik İptal & Temizleme Güvenlik Bilgilendirmesi */}
          <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex items-center gap-3 text-xs text-indigo-900">
            <Shield className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>
              <b>Otomatik İptal Kuralı:</b> Silinen içerik veya depolara ait tüm dış bağlantılar anında sonlandırılır ve bu listeden otomatik olarak kaldırılır.
            </span>
          </div>

          {sharedLinks.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-slate-200 space-y-2">
              <Share2 className="w-8 h-8 text-slate-300 mx-auto" />
              <h3 className="font-bold text-slate-800">Henüz paylaşılan içerik yok</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Depolarındaki şiirleri veya filmleri dışarıdaki insanlara salt okunur göstermek için içerik kartındaki "Paylaş" butonunu kullanabilirsin.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {sharedLinks.map((link) => (
                <div
                  key={link.id}
                  className={`bg-white rounded-2xl p-4 sm:p-5 border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    link.isActive
                      ? "border-slate-200 shadow-xs"
                      : "border-slate-200/60 bg-slate-50/50 opacity-60"
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
                          : "bg-purple-600"
                      }`}
                    >
                      {link.type === "container" ? (
                        <Layers className="w-5 h-5" />
                      ) : link.type === "text" ? (
                        <FileText className="w-5 h-5" />
                      ) : link.type === "code" ? (
                        <Code2 className="w-5 h-5" />
                      ) : (
                        <Film className="w-5 h-5" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-sm text-slate-900">
                          {link.itemTitle}
                        </h4>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            link.scope === "container"
                              ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                              : "bg-slate-100 text-slate-600 border border-slate-200"
                          }`}
                        >
                          {link.scope === "container" ? "Tüm Depo" : "Tekil İçerik"}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            link.isActive
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-rose-50 text-rose-700 border border-rose-200"
                          }`}
                        >
                          {link.isActive ? "Aktif" : "Erişim Kapatıldı"}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-500 font-medium flex-wrap">
                        <span>Depo: {link.containerName}</span>
                        <span>•</span>
                        <span>{link.createdAt}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3 text-slate-400" />
                          {link.views} görüntülenme
                        </span>
                      </div>

                      <div className="mt-2 text-[11px] font-mono text-indigo-600 flex items-center gap-1">
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
                      className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                      title="Salt Okunur Önizlemeyi Aç"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>

                    {/* Linki Kopyala */}
                    <button
                      onClick={() => handleCopyLink(link.token)}
                      className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
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
                          ? "bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200"
                          : "bg-slate-200 text-slate-700 hover:bg-slate-300"
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
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
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
              className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 z-10 space-y-6"
            >
              {/* Modal Başlık */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-900">
                      Profili Düzenle
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Salt okunur paylaşımlarda görünecek kimliğinizi güncelleyin
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Alanları */}
              <div className="space-y-4">
                {/* 1. Görünen Ad / Takma Ad */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    Görünen Ad / Takma Ad
                  </label>
                  <input
                    type="text"
                    value={tempDisplayName}
                    onChange={(e) => setTempDisplayName(e.target.value)}
                    placeholder="Örn: Erdal Türk"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Bu isim dışarıya paylaştığınız içeriklerde imzanız olarak görünür.
                  </span>
                </div>

                {/* 2. Avatar Renk Paleti */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-2">
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
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    Giriş E-postası (Değiştirilemez)
                  </label>
                  <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-100 border border-slate-200/80 rounded-xl text-xs text-slate-500 font-medium">
                    <span>{email}</span>
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </div>

                {/* Bölüm 13.3 Kural Hatırlatması */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-[10px] text-slate-500 leading-relaxed">
                  💡 <b>Not:</b> Platform sosyal medya olmadığı için biyografi (bio), takipçi ve benzeri alanlar bulunmamaktadır.
                </div>
              </div>

              {/* Alt Eylemler: Vazgeç & Kaydet */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
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
