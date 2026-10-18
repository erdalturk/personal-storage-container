"use client";

import React, { Suspense, useState } from "react";
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
  Eye,
  Trash2,
  Folder,
  X,
  Clapperboard,
} from "lucide-react";

interface SharedRecord {
  title: string;
  author: string;
  authorAvatar: string;
  scope: "container" | "item"; // "container" = Deponun Tamamı, "item" = Tek Bir İçerik
  type: "text" | "movie";
  createdAt: string;
  isActive: boolean;
  isDeleted?: boolean; // Eğer içerik silindiyse otomatik iptal kuralı
  // Tekil içerik alanları
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
  // Tüm depo alanları
  containerDesc?: string;
  containerItems?: Array<{
    id: string;
    title: string;
    year?: number;
    rating?: number;
    posterUrl?: string;
    director?: string;
    overview?: string;
    userNote?: string;
    genres?: string[];
    content?: string;
    folder?: string;
  }>;
}

const SHARED_DATA: Record<string, SharedRecord> = {
  // 1. DEPONUN TAMAMI PAYLAŞIMI: Film Deposu (Ana sayfadan basıldığında)
  "sinema-kulubu-deposu": {
    title: "Sinema Kulübü & Başyapıtlar",
    author: "Erdal Türk",
    authorAvatar: "ET",
    scope: "container",
    type: "movie",
    createdAt: "Ekim 2026",
    isActive: true,
    containerDesc: "Kişisel sinema arşivim. İzlediğim, favorilediğim ve üzerine notlar aldığım tüm başyapıtlar.",
    containerItems: [
      {
        id: "m1",
        title: "Inception",
        year: 2010,
        director: "Christopher Nolan",
        rating: 8.8,
        genres: ["Bilim Kurgu", "Aksiyon"],
        posterUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=600&q=80",
        overview: "Çok yetenekli bir hırsız olan Dom Cobb, insanların rüyalarına girerek bilinçaltındaki en değerli sırları çalar.",
        userNote: "Zaman kavramının rüyalar katmanında bükülmesi muazzam bir kurgu.",
      },
      {
        id: "m2",
        title: "Interstellar",
        year: 2014,
        director: "Christopher Nolan",
        rating: 8.7,
        genres: ["Bilim Kurgu", "Macera"],
        posterUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80",
        overview: "İnsanlığın Dünya'daki son günleri yaklaşırken, bir grup kaşif insanlık için yaşanabilir yeni bir gezegen arar.",
        userNote: "Yerçekimi, sevgi ve zamanın buluştuğu nokta.",
      },
      {
        id: "m3",
        title: "Dune: Part Two",
        year: 2024,
        director: "Denis Villeneuve",
        rating: 8.5,
        genres: ["Bilim Kurgu", "Macera"],
        posterUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80",
        overview: "Paul Atreides, ailesini yok eden komploculara karşı intikam arayışındayken Fremenlerle güçlerini birleştirir.",
        userNote: "Görsel ve işitsel bir başyapıt.",
      },
      {
        id: "m4",
        title: "Kış Uykusu",
        year: 2014,
        director: "Nuri Bilge Ceylan",
        rating: 8.1,
        genres: ["Dram"],
        posterUrl: "https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=600&q=80",
        overview: "Emekli bir tiyatro oyuncusu olan Aydın, Kapadokya'da babasından kalan butik oteli işletmektedir.",
        userNote: "Altın Palmiye ödüllü başyapıt.",
      },
      {
        id: "m5",
        title: "Spirited Away",
        year: 2001,
        director: "Hayao Miyazaki",
        rating: 8.6,
        genres: ["Animasyon", "Fantastik"],
        posterUrl: "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=600&q=80",
        overview: "10 yaşındaki Chihiro, ailesiyle yeni bir kasabaya taşınırken gizemli bir ruhlar dünyasına adım atar.",
        userNote: "Miyazaki'nin hayal gücünün zirvesi.",
      },
    ],
  },

  // 2. DEPONUN TAMAMI PAYLAŞIMI: Metin Deposu (Ana sayfadan basıldığında)
  "gece-siirleri-deposu": {
    title: "Gece Düşünceleri & Şiirlerim",
    author: "Erdal Türk",
    authorAvatar: "ET",
    scope: "container",
    type: "text",
    createdAt: "Ekim 2026",
    isActive: true,
    containerDesc: "Gece notları, şiir denemeleri ve mimari fikirlerimin tamamı.",
    containerItems: [
      {
        id: "t1",
        title: "Mavi Bir Akşamüstü",
        folder: "Şiirlerim & Dizeler",
        content: "Rüzgâr estiğinde deniz fısıldar,\nUzak kıyılardan kalan bir hatırayı.\nHer dizede biraz kaybolur insan,\nVe her sessizlikte yeniden başlar.",
      },
      {
        id: "t2",
        title: "Kişisel Depo — Mimari Düşünceler",
        folder: "Proje Fikirleri",
        content: "Dağınık dijital varlıkları tek bir merkezde toplamak kullanıcıya inanılmaz bir zihinsel ferahlık sunuyor. Duolingo benzeri mikro etkileşimler ve görsel önizlemeler ile sıkıcı arşiv mantığı tamamen kırılıyor.",
      },
      {
        id: "t3",
        title: "Haftalık Okuma Listesi Notları",
        folder: "Günün Notları",
        content: "1. Tasarım Sistemleri Üzerine Notlar\n2. İnsan Zihninin Dijital Arşivleme Alışkanlıkları\n3. Sadeliğin Gücü ve Minimalist Yazılımlar",
      },
    ],
  },

  // 3. TEKİL İÇERİK PAYLAŞIMI: Tek bir film
  "inception-arsiv": {
    title: "Inception (2010)",
    author: "Erdal Türk",
    authorAvatar: "ET",
    scope: "item",
    type: "movie",
    createdAt: "3 gün önce",
    isActive: true,
    director: "Christopher Nolan",
    year: 2010,
    rating: 8.8,
    genres: ["Bilim Kurgu", "Aksiyon", "Gerilim"],
    posterUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=600&q=80",
    overview: "Çok yetenekli bir hırsız olan Dom Cobb, insanların rüyalarına girerek bilinçaltındaki en değerli sırları çalar. Kendisine verilen imkansız bir görevde zihne fikir eklemesi gerekmektedir.",
    userNote: "Zaman kavramının rüyalar katmanında bükülmesi sinema tarihinin en zeki kurgularından biri. Hans Zimmer müzikleri muazzam.",
  },

  // 4. TEKİL İÇERİK PAYLAŞIMI: Tek bir şiir
  "mavi-aksamustu": {
    title: "Mavi Bir Akşamüstü",
    author: "Erdal Türk",
    authorAvatar: "ET",
    scope: "item",
    type: "text",
    createdAt: "Dün",
    isActive: true,
    content: "Rüzgâr estiğinde deniz fısıldar,\nUzak kıyılardan kalan bir hatırayı.\nHer dizede biraz kaybolur insan,\nVe her sessizlikte yeniden başlar.",
    wordCount: 22,
    lineCount: 4,
  },

  // 5. SİLİNMİŞ İÇERİK (Otomatik İptal Örneği)
  "silinmis-icerik-ornegi": {
    title: "Eski Taslak Şiir",
    author: "Erdal Türk",
    authorAvatar: "ET",
    scope: "item",
    type: "text",
    createdAt: "1 hafta önce",
    isActive: false,
    isDeleted: true, // Silindiği için otomatik iptal
  },
};

function ShareContent() {
  const params = useParams();
  const token = params?.token as string;
  const item = SHARED_DATA[token];

  const [copied, setCopied] = useState(false);
  const [selectedMoviePreview, setSelectedMoviePreview] = useState<any>(null);

  const handleCopyText = (text?: string) => {
    if (text) {
      navigator.clipboard.writeText(text);
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

  // 2. Durum: İçerik Silindiği İçin Otomatik İptal Edilmiş Bağlantı (Kullanıcının İstediği Kural!)
  if (item.isDeleted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center border border-slate-200 shadow-xl space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
            <Trash2 className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900">
            İçerik Silinmiş
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Bu içerik sahibi tarafından silindiği için paylaşım bağlantısı otomatik olarak sonlandırılmıştır.
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

  // 3. Durum: Sahibi Tarafından Manuel İptal Edilmiş (Revoked) Bağlantı
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
            Bu bağlantının dışarıya erişimi sahibi tarafından kapatılmıştır.
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

  // 4. Durum: BAŞARILI SALT OKUNUR GÖRÜNÜM
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 text-slate-900 font-sans flex flex-col justify-between">
      {/* ÜST BİLGİ ŞERİDİ */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5 sticky top-0 z-30 shadow-xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900">
                  Kişisel Depo
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {item.scope === "container" ? "Tüm Depo Paylaşımı" : "Tekil İçerik Paylaşımı"}
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                Salt Okunur Vitrin (Değişiklik yapılamaz)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center text-white text-[11px] font-bold">
              {item.authorAvatar}
            </div>
            <span>{item.author}</span>
          </div>
        </div>
      </header>

      {/* ANA İÇERİK ALANI */}
      <main className="max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex-1">
        {/* ======================================================== */}
        {/* SENARYO 1: DEPONUN TAMAMI PAYLAŞIMI (scope === "container") */}
        {/* ======================================================== */}
        {item.scope === "container" ? (
          <div className="space-y-8">
            {/* Depo Başlığı & Tanıtım Kartı */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
                  {item.type === "movie" ? "Film & Dizi Deposu" : "Metin Deposu"}
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
                  {item.title}
                </h1>
                <p className="text-xs text-slate-500 mt-1 max-w-xl">
                  {item.containerDesc}
                </p>
              </div>

              <div className="text-xs font-semibold text-slate-400 shrink-0">
                Toplam {item.containerItems?.length || 0} içerik paylaşımda
              </div>
            </div>

            {/* FİLM DEPOSU TAMAMI VİTRİNİ */}
            {item.type === "movie" && item.containerItems && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {item.containerItems.map((movie) => (
                  <div
                    key={movie.id}
                    onClick={() => setSelectedMoviePreview(movie)}
                    className="group bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-md hover:border-purple-500/60 hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div className="aspect-[2/3] w-full relative overflow-hidden bg-slate-950">
                      <img
                        src={movie.posterUrl}
                        alt={movie.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent p-3 flex flex-col justify-between">
                        <span className="flex items-center gap-1 self-start px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-md text-[10px] font-bold text-amber-400">
                          <Star className="w-3 h-3 fill-amber-400" /> {movie.rating}
                        </span>
                        <div>
                          <div className="text-[10px] text-purple-300 font-bold uppercase">
                            {movie.director}
                          </div>
                          <div className="text-xs font-bold text-white line-clamp-1">
                            {movie.title}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {movie.year}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="p-2.5 bg-slate-900 border-t border-slate-800 text-[11px] text-slate-400 font-medium text-center">
                      Detayları Gör →
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* METİN DEPOSU TAMAMI VİTRİNİ */}
            {item.type === "text" && item.containerItems && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {item.containerItems.map((text) => (
                  <div
                    key={text.id}
                    className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <span className="text-[10px] font-bold uppercase text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                        {text.folder}
                      </span>
                      <h3 className="font-bold text-sm text-slate-900 mt-2">
                        {text.title}
                      </h3>
                      <p className="text-xs text-slate-600 mt-2 italic font-serif leading-relaxed line-clamp-5 whitespace-pre-line">
                        {text.content}
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Salt Okunur</span>
                      <button
                        onClick={() => handleCopyText(text.content)}
                        className="text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-1"
                      >
                        <Copy className="w-3 h-3" />
                        <span>Kopyala</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* ======================================================== */
          /* SENARYO 2: TEK BİR İÇERİK PAYLAŞIMI (scope === "item")    */
          /* ======================================================== */
          <div className="max-w-2xl mx-auto py-8">
            {item.type === "text" ? (
              <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xl space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="text-xs font-bold uppercase text-indigo-600">
                    Tekil Şiir / Not
                  </span>
                  <button
                    onClick={() => handleCopyText(item.content)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                  >
                    {copied ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>{copied ? "Kopyalandı" : "Metni Kopyala"}</span>
                  </button>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                  {item.title}
                </h1>
                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 text-base sm:text-lg text-slate-800 font-serif italic leading-relaxed whitespace-pre-line">
                  {item.content}
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-100">
                  <span>{item.wordCount} kelime • {item.lineCount} dize</span>
                  <span>{item.createdAt}</span>
                </div>
              </div>
            ) : (
              <div className="bg-slate-900 text-white rounded-3xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col sm:flex-row">
                <div className="sm:w-2/5 aspect-[2/3] relative shrink-0">
                  <img
                    src={item.posterUrl}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="text-xs text-purple-400 font-bold mb-1">
                      {item.year} • {item.director}
                    </div>
                    <h1 className="text-2xl font-extrabold text-white">
                      {item.title}
                    </h1>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="flex items-center gap-1 text-xs font-bold text-amber-400 bg-black/40 px-2 py-0.5 rounded-md">
                        <Star className="w-3 h-3 fill-amber-400" /> {item.rating}
                      </span>
                      <span className="text-xs text-slate-400">{item.genres?.join(", ")}</span>
                    </div>
                    <p className="text-xs text-slate-300 mt-4 leading-relaxed">
                      {item.overview}
                    </p>
                  </div>

                  {item.userNote && (
                    <div className="p-3.5 rounded-2xl bg-purple-950/40 border border-purple-500/30">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300 block mb-1">
                        {item.author}'ın Arşiv Notu
                      </span>
                      <p className="text-xs text-slate-200 italic">"{item.userNote}"</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* TÜM DEPO İÇİNDEN FİLM DETAYI MODALI */}
      {selectedMoviePreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setSelectedMoviePreview(null)}
            className="fixed inset-0 bg-black/75 backdrop-blur-xs"
          />
          <div className="relative w-full max-w-xl bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 shadow-2xl z-10 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={selectedMoviePreview.posterUrl}
                  alt={selectedMoviePreview.title}
                  className="w-16 h-24 object-cover rounded-xl"
                />
                <div>
                  <h3 className="font-extrabold text-lg text-white">
                    {selectedMoviePreview.title} ({selectedMoviePreview.year})
                  </h3>
                  <p className="text-xs text-purple-400 font-semibold">
                    Yönetmen: {selectedMoviePreview.director}
                  </p>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-400 mt-1">
                    <Star className="w-3 h-3 fill-amber-400" /> {selectedMoviePreview.rating}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedMoviePreview(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {selectedMoviePreview.overview}
            </p>
            {selectedMoviePreview.userNote && (
              <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/20 text-xs italic text-slate-200">
                "{selectedMoviePreview.userNote}"
              </div>
            )}
          </div>
        </div>
      )}

      {/* ALT ÇAĞRI (FOOTER) */}
      <footer className="py-6 text-center text-xs text-slate-500 border-t border-slate-200 bg-white">
        <div className="max-w-md mx-auto space-y-2 px-4">
          <p>
            Kişisel Dijital Depo — Kişisel arşivinizi tek merkezde güvenle toplayın.
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
