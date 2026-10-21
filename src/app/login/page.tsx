"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Layers,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  KeyRound,
} from "lucide-react";
import { loginUser } from "@/lib/appStore";
import ThemeToggle from "@/components/ThemeToggle";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("Erdal Türk");
  const [email, setEmail] = useState("erdal.turk@kisiseldepo.com");
  const [password, setPassword] = useState("••••••••••••");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email.trim() || !email.includes("@")) {
      setErrorMsg("Lütfen geçerli bir e-posta adresi girin.");
      return;
    }
    if (!password || password.length < 4) {
      setErrorMsg("Şifreniz en az 4 karakter olmalıdır.");
      return;
    }
    if (mode === "register" && !name.trim()) {
      setErrorMsg("Lütfen adınızı ve soyadınızı girin.");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      loginUser(email, mode === "register" ? name : undefined);
      router.push("/");
    }, 350);
  };

  const handleGoogleLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      loginUser("erdal.turk@kisiseldepo.com", "Erdal Türk");
      router.push("/");
    }, 300);
  };

  const handleQuickDemo = () => {
    setEmail("erdal.turk@kisiseldepo.com");
    setName("Erdal Türk");
    setPassword("demo123456");
    loginUser("erdal.turk@kisiseldepo.com", "Erdal Türk");
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-slate-950 text-stone-900 dark:text-slate-100 flex flex-col lg:flex-row font-sans transition-colors duration-200">
      {/* Sol Vitrin Paneli */}
      <div className="lg:w-1/2 bg-gradient-to-br from-slate-900 via-indigo-950 to-stone-900 text-white p-8 sm:p-14 flex flex-col justify-between relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30 group-hover:scale-105 transition">
              <Layers className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-lg font-extrabold tracking-tight block">
                Kişisel Depo
              </span>
              <span className="text-xs text-indigo-200/80">
                Personal Storage Container
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/10 border border-white/15 text-indigo-200 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              v2.0 Tam Sürüm
            </span>
            <ThemeToggle />
          </div>
        </div>

        <div className="relative z-10 my-12 lg:my-0 max-w-lg space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Uçtan Uca Kişisel Arşiv & Vitrin Mimarisi
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
            Dağınık dijital dünyanızı{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-200 to-indigo-300">
              estetik bir hafızaya
            </span>{" "}
            dönüştürün.
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            4 Standart Depo (Metin, Ses, Görüntü, Belge) ve 4 Akıllı Özel Depo
            (Film, Kod, Gezi, Ders Notu) ile tüm birikiminizi tek merkezde
            saklayın, şifreleyin veya salt okunur vitrin kartlarıyla paylaşın.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {[
              "8 Özel & Standart Depo Mimarisi",
              "Salt Okunur Vitrin Paylaşım Kartları",
              "Global Arama (Ctrl + K) & Arşiv Yedekleme",
              "30 Günlük Çöp Kutusu & Otomatik İptal",
            ].map((feat) => (
              <div
                key={feat}
                className="flex items-center gap-2.5 text-xs font-medium text-slate-200 bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{feat}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between text-xs text-slate-400 border-t border-white/10 pt-6">
          <span>© 2026 Kişisel Depo • Tüm hakları saklıdır.</span>
          <Link href="/" className="text-indigo-300 hover:text-white font-semibold">
            Ana Sayfaya Göz At →
          </Link>
        </div>
      </div>

      {/* Sağ Giriş / Kayıt Formu */}
      <div className="lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-[#FAF8F5] dark:bg-slate-950 transition-colors">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-stone-200/90 dark:border-slate-800 shadow-xl p-7 sm:p-9 space-y-6">
          {/* Mod Seçici */}
          <div className="flex p-1 bg-stone-100 dark:bg-slate-800 rounded-2xl border border-stone-200/70 dark:border-slate-700">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setErrorMsg(null);
              }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition ${
                mode === "login"
                  ? "bg-white dark:bg-slate-900 text-stone-900 dark:text-white shadow-xs"
                  : "text-stone-500 dark:text-slate-400 hover:text-stone-800 dark:hover:text-slate-200"
              }`}
            >
              Giriş Yap
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("register");
                setErrorMsg(null);
              }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition ${
                mode === "register"
                  ? "bg-white dark:bg-slate-900 text-stone-900 dark:text-white shadow-xs"
                  : "text-stone-500 dark:text-slate-400 hover:text-stone-800 dark:hover:text-slate-200"
              }`}
            >
              Yeni Hesap Oluştur
            </button>
          </div>

          <div>
            <h2 className="text-2xl font-extrabold text-stone-900 dark:text-white tracking-tight">
              {mode === "login" ? "Tekrar Hoş Geldiniz" : "Kişisel Deponuzu Açın"}
            </h2>
            <p className="text-xs text-stone-500 dark:text-slate-400 mt-1">
              {mode === "login"
                ? "Kişisel arşivlerinize ve özel depolarınıza erişmek için giriş yapın."
                : "Saniyeler içinde ücretsiz hesabınızı oluşturup arşivlemeye başlayın."}
            </p>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/60 text-xs font-semibold text-rose-700 dark:text-rose-300">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {mode === "register" && (
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Ad Soyad
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Örn: Erdal Türk"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                E-Posta Adresi
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ornek@kisiseldepo.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-stone-700 dark:text-slate-300 uppercase tracking-wider">
                  Şifre
                </label>
                {mode === "login" && (
                  <button
                    type="button"
                    onClick={() =>
                      setErrorMsg(
                        "Şifre sıfırlama bağlantısı e-posta adresinize gönderildi (Demo)."
                      )
                    }
                    className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700"
                  >
                    Şifremi Unuttum?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 rounded-xl border border-stone-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 dark:text-slate-500 hover:text-stone-700 dark:hover:text-slate-300"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-bold shadow-md shadow-indigo-600/20 transition flex items-center justify-center gap-2"
            >
              <span>
                {isLoading
                  ? "Oturum Açılıyor..."
                  : mode === "login"
                  ? "Kişisel Depoya Giriş Yap"
                  : "Hesabımı Oluştur ve Başla"}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="relative flex py-1 items-center">
            <div className="grow border-t border-stone-200 dark:border-slate-800" />
            <span className="shrink mx-3 text-[11px] uppercase tracking-wider text-stone-400 dark:text-slate-500 font-semibold">
              veya hızlı bağlantı
            </span>
            <div className="grow border-t border-stone-200 dark:border-slate-800" />
          </div>

          <div className="space-y-2.5">
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full py-2.5 px-4 rounded-xl bg-white dark:bg-slate-800 hover:bg-stone-50 dark:hover:bg-slate-700/80 border border-stone-200 dark:border-slate-700 text-stone-700 dark:text-slate-200 text-xs font-bold transition flex items-center justify-center gap-2.5 shadow-2xs"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96z"
                />
              </svg>
              Google Hesabı ile Devam Et
            </button>

            <button
              type="button"
              onClick={handleQuickDemo}
              className="w-full py-2.5 px-4 rounded-xl bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100/80 dark:hover:bg-amber-900/60 border border-amber-200/80 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 text-xs font-bold transition flex items-center justify-center gap-2"
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
              Demo Hesapla Tek Tıkla Giriş (Erdal Türk)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
