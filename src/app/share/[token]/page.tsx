"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Layers,
  Lock,
  Share2,
  Calendar,
  Clock,
  Star,
  Film,
  FileText,
  AlertOctagon,
  Copy,
  Check,
  ArrowRight,
  Sparkles,
} from "lucide-react";

// Mock Paylaşılan Veritabanı
const SHARED_DATA: Record<
  string,
  {
    title: string;
    author: string;
    authorAvatar: string;
    type: "text" | "movie";
    createdAt: string;
    isActive: boolean; // Aktif mi yoksa iptal mi edildi
    content?: string;
    wordCount?: number;
    lineCount?: number;
    posterUrl?: string;
    director?: string;
    year?: number;
    rating?: number;
    genres?: string[];
    overview?: string;
    userNote?: string;
  }
> = {
  "mavi-aksamustu": {
    title: "Mavi Bir Akşamüstü",
    author: "Erdal Türk",
    authorAvatar: "ET",
    type: "text",
    createdAt: "Dün",
    isActive: true,
    content:
      "Rüzgâr estiğinde deniz fısıldar,\nUzak kıyılardan kalan bir hatırayı.\nHer dizede biraz kaybolur insan,\nVe her sessizlikte yeniden başlar.",
    wordCount: 22,
    lineCount: 4,
  },
  "inception-arsiv": {
    title: "Inception (2010)",
    author: "Erdal Türk",
    authorAvatar: "ET",
    type: "movie",
    createdAt: "3 gün önce",
    isActive: true,
    director: "Christopher Nolan",
    year: 2010,
    rating: 8.8,
    genres: ["Bilim Kurgu", "Aksiyon", "Gerilim"],
    posterUrl:
      "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=600&q=80",
    overview:
      "Çok yetenekli bir hırsız olan Dom Cobb, insanların rüyalarına girerek bilinçaltındaki en değerli sırları çalar. Kendisine verilen imkansız bir görevde zihne fikir eklemesi gerekmektedir.",
    userNote:
      "Zaman kavramının rüyalar katmanında bükülmesi sinema tarihinin en zeki kurgularından biri. Hans Zimmer müzikleri muazzam.",
  },
  "eski-proje-fikirleri": {
    title: "Eski Proje Fikirleri 2025",
    author: "Erdal Türk",
    authorAvatar: "ET",
    type: "text",
    createdAt: "2 hafta önce",
    isActive: false, // Sahibi tarafından iptal edilmiş (Revoked)
  },
};

function ShareContent() {
  const params = useParams();
  const token = params?.token as string;
  const item = SHARED_DATA[token];

  const [copied, setCopied] = React.useState(false);

  const handleCopyText = () => {
    if (item?.content) {
      navigator.clipboard.writeText(item.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // 1. Durum: Bağlantı Bulunamadı
  if (!item) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center border border-slate-200 shadow-xl space-y-4">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Bağlantı Bulunamadı</h2>
          <p className="text-xs text-slate-500">
            Aradığınız paylaşım bağlantısı mevcut değil veya süresi dolmuş olabilir.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-md hover:bg-indigo-700 transition-colors"
          >
            Kişisel Depo Ana Sayfasına Git
          </Link>
        </div>
      </div>
    );
  }

  // 2. Durum: Sahibi Tarafından Erişimi İptal Edilmiş Bağlantı (Section 15.2)
  if (!item.isActive) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center border border-slate-200 shadow-xl space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-100">
            <AlertOctagon className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900">
            Erişim İptal Edildi
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Bu içerik daha önce paylaşıma açılmış, ancak sahibi tarafından erişim bağlantısı kapatılmıştır.
          </p>
          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
            >
              Kişisel Depo'ya Dön
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 3. Durum: Başarılı Salt Okunur Önizleme
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 text-slate-900 font-sans flex flex-col justify-between">
      {/* Üst Salt Okunur Bilgi Şeridi */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900">
                Kişisel Depo
              </span>
              <span className="text-[10px] text-slate-400 ml-2">
                (Salt Okunur Önizleme)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-white text-[10px] font-bold">
              {item.authorAvatar}
            </div>
            <span>{item.author} tarafından paylaşıldı</span>
          </div>
        </div>
      </header>

      {/* ANA İÇERİK KARTI (SALT OKUNUR - DEĞİŞTİRİLEMEZ) */}
      <main className="max-w-3xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex-1 flex flex-col justify-center">
        {item.type === "text" ? (
          /* METİN PAYLAŞIMI */
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600">
                <FileText className="w-4 h-4" />
                <span>Şiir / Not Arşivi</span>
              </div>
              <button
                onClick={handleCopyText}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                title="Metni Kopyala"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Kopyalandı</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Metni Kopyala</span>
                  </>
                )}
              </button>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {item.title}
            </h1>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 text-base sm:text-lg text-slate-800 font-serif italic leading-relaxed whitespace-pre-line">
              {item.content}
            </div>

            <div className="flex items-center justify-between text-xs font-semibold text-slate-400 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-3">
                <span>{item.wordCount} kelime</span>
                <span>•</span>
                <span>{item.lineCount} dize/satır</span>
              </div>
              <span>Paylaşım Tarihi: {item.createdAt}</span>
            </div>
          </div>
        ) : (
          /* FİLM PAYLAŞIMI */
          <div className="bg-slate-900 text-white rounded-3xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col sm:flex-row">
            <div className="sm:w-1/3 aspect-[2/3] relative shrink-0">
              <img
                src={item.posterUrl}
                alt={item.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center gap-2 text-xs text-purple-400 font-bold mb-1">
                  <span>{item.year}</span>
                  <span>•</span>
                  <span>{item.director}</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  {item.title}
                </h1>
                <div className="flex items-center gap-2 mt-2">
                  <span className="flex items-center gap-1 text-xs font-bold text-amber-400 bg-black/40 px-2 py-0.5 rounded-md">
                    <Star className="w-3 h-3 fill-amber-400" /> {item.rating}
                  </span>
                  <span className="text-xs text-slate-400">
                    {item.genres?.join(", ")}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-4 leading-relaxed">
                  {item.overview}
                </p>
              </div>

              {item.userNote && (
                <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/30">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-purple-300 block mb-1">
                    {item.author}'ın Arşiv Notu
                  </span>
                  <p className="text-xs text-slate-200 italic">
                    "{item.userNote}"
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* ALT CTA BİLGİSİ */}
      <footer className="py-6 text-center text-xs text-slate-500">
        <div className="max-w-md mx-auto space-y-2 px-4">
          <p>
            Kişisel Dijital Depo — Kendi notlarını, filmlerini ve projelerini tek merkezde güvenle sakla.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-indigo-600 hover:text-indigo-700 font-bold"
          >
            <span>Kişisel Depo'yu Keşfet</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </footer>
    </div>
  );
}

export default function ShareViewPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center text-xs text-slate-400">
          Paylaşım yükleniyor...
        </div>
      }
    >
      <ShareContent />
    </Suspense>
  );
}
