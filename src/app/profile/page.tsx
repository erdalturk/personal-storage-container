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
} from "lucide-react";

interface SharedLink {
  id: string;
  token: string;
  itemTitle: string;
  containerName: string;
  type: "text" | "movie" | "container";
  createdAt: string;
  views: number;
  isActive: boolean; // Aktif veya İptal Edilmiş (Revoked)
}

const INITIAL_SHARES: SharedLink[] = [
  {
    id: "s1",
    token: "mavi-aksamustu",
    itemTitle: "Mavi Bir Akşamüstü (Şiir)",
    containerName: "Gece Düşünceleri & Şiirlerim",
    type: "text",
    createdAt: "Dün",
    views: 14,
    isActive: true,
  },
  {
    id: "s2",
    token: "inception-arsiv",
    itemTitle: "Inception & Arşiv Notlarım",
    containerName: "Sinema Kulübü & Başyapıtlar",
    type: "movie",
    createdAt: "3 gün önce",
    views: 28,
    isActive: true,
  },
  {
    id: "s3",
    token: "eski-proje-fikirleri",
    itemTitle: "Eski Proje Fikirleri 2025",
    containerName: "Gece Düşünceleri & Şiirlerim",
    type: "text",
    createdAt: "2 hafta önce",
    views: 6,
    isActive: false, // Daha önce iptal edilmiş
  },
];

export default function ProfilePage() {
  const [displayName, setDisplayName] = useState("Erdal Türk");
  const [email] = useState("erdalturk@example.com");
  const [sharedLinks, setSharedLinks] = useState<SharedLink[]>(INITIAL_SHARES);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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
        {/* 1. KULLANICI KİMLİK KARTI (Bölüm 13.2 & 13.3 - Kesinlikle Bio Alanı Yok) */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center text-white text-xl font-bold shadow-md shadow-indigo-100 shrink-0">
              ET
            </div>
            <div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="font-extrabold text-xl sm:text-2xl text-slate-900 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-500 outline-none transition-colors"
                  title="Görünen Adı Düzenle"
                />
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{email}</p>
              <div className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-0.5 rounded-full bg-slate-100 text-[10px] font-bold text-slate-600">
                <Shield className="w-3 h-3 text-emerald-600" />
                <span>Kişisel Arşiv Sahibi</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              onClick={() => alert("Profil bilgileriniz güncellendi.")}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-colors"
            >
              Kaydet
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
                        link.type === "text" ? "bg-blue-500" : "bg-purple-600"
                      }`}
                    >
                      {link.type === "text" ? (
                        <FileText className="w-5 h-5" />
                      ) : (
                        <Film className="w-5 h-5" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-slate-900">
                          {link.itemTitle}
                        </h4>
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

                      <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-500 font-medium">
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

                  {/* Sağ Eylemler: Kopyala, Aç, İptal Et */}
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
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

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
