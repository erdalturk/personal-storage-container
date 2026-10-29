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
  X,
  MailCheck,
  ArrowLeft,
  RotateCcw,
} from "lucide-react";
import { loginUser, registerUser, getRegisteredUsers } from "@/lib/appStore";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabaseClient";
import ThemeToggle from "@/components/ThemeToggle";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // E-Posta 6 Haneli Doğrulama Kodu State'leri
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  const [verificationCodeInput, setVerificationCodeInput] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [codeResentToast, setCodeResentToast] = useState(false);

  // Google Hesap Seçici Simülasyon Modalı State'leri
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanEmail.includes("@")) {
      setErrorMsg("Lütfen geçerli bir e-posta adresi girin.");
      return;
    }
    if (!cleanPassword || cleanPassword.length < 4) {
      setErrorMsg("Şifreniz en az 4 karakter olmalıdır.");
      return;
    }
    if (mode === "register" && !name.trim()) {
      setErrorMsg("Lütfen adınızı ve soyadınızı girin.");
      return;
    }

    // Kayıt Modunda E-Posta Onay Kodu Gönderimi
    if (mode === "register") {
      const registered = getRegisteredUsers();
      if (registered.some((u) => u.email.toLowerCase() === cleanEmail.toLowerCase())) {
        setErrorMsg("Bu e-posta adresi ile zaten kayıtlı bir hesap bulunmaktadır. Giriş yapabilirsiniz.");
        return;
      }
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedCode(code);
      setIsVerifyingEmail(true);
      setVerificationCodeInput("");
      setVerificationError(null);
      return;
    }

    setIsLoading(true);

    if (isSupabaseConfigured()) {
      const supabase = getSupabase();
      if (supabase) {
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: cleanEmail,
            password: cleanPassword,
          });
          if (error) throw error;
          loginUser(cleanEmail, data.user?.user_metadata?.full_name, cleanPassword);
          router.push("/");
          return;
        } catch (err: any) {
          setIsLoading(false);
          setErrorMsg(err.message || "Giriş işlemi sırasında hata oluştu.");
          return;
        }
      }
    }

    // Yerel Mod Fallback (Supabase yapılandırılmamışsa bireysel yerel oturum)
    setTimeout(() => {
      loginUser(cleanEmail, undefined, cleanPassword);
      setIsLoading(false);
      router.push("/");
    }, 250);
  };

  const handleConfirmVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerificationError(null);

    if (verificationCodeInput.trim() !== generatedCode) {
      setVerificationError("Girdiğiniz 6 haneli güvenlik kodu hatalı. Lütfen kontrol edip tekrar deneyin.");
      return;
    }

    setIsLoading(true);
    const cleanEmail = email.trim();
    const cleanPassword = password.trim();
    const cleanName = name.trim();

    if (isSupabaseConfigured()) {
      const supabase = getSupabase();
      if (supabase) {
        try {
          await supabase.auth.signUp({
            email: cleanEmail,
            password: cleanPassword,
            options: {
              data: { full_name: cleanName },
            },
          });
        } catch (err) {
          // Supabase offline ise yerel kayıt devam eder
        }
      }
    }

    setTimeout(() => {
      const regRes = registerUser(cleanEmail, cleanName, cleanPassword);
      if (!regRes.success) {
        setIsLoading(false);
        setVerificationError(regRes.message || "Kayıt işlemi başarısız.");
        return;
      }
      loginUser(cleanEmail, cleanName, cleanPassword);
      setIsLoading(false);
      router.push("/");
    }, 250);
  };

  const handleResendVerificationCode = () => {
    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(newCode);
    setVerificationCodeInput("");
    setVerificationError(null);
    setCodeResentToast(true);
    setTimeout(() => setCodeResentToast(false), 4000);
  };

  const handleSelectGoogleAccount = (accEmail: string, accName: string) => {
    setIsLoading(true);
    setIsGoogleModalOpen(false);
    setTimeout(() => {
      loginUser(accEmail, accName);
      setIsLoading(false);
      router.push("/");
    }, 250);
  };

  const handleRealGoogleOAuth = async () => {
    if (isSupabaseConfigured()) {
      const supabase = getSupabase();
      if (supabase) {
        try {
          setIsLoading(true);
          const { error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
              redirectTo: typeof window !== "undefined" ? window.location.origin : undefined,
            },
          });
          if (error) throw error;
        } catch (e: any) {
          setIsLoading(false);
          setErrorMsg(e.message || "Google ile giriş başlatılamadı.");
        }
      }
    }
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
          <ThemeToggle />
        </div>

        <div className="relative z-10 my-12 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            Bireysel & Güvenli Dijital Hafıza
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
            Tüm anılarınız, kodlarınız ve belgeleriniz{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-amber-300">
              yalnızca size özel.
            </span>
          </h1>

          <p className="text-stone-300 text-sm sm:text-base leading-relaxed max-w-lg">
            Kişisel Depo, film koleksiyonlarınızdan seyahat rotalarınıza, kod parçacıklarından sesli notlarınıza kadar her şeyi bağımsız ve şifreli depolarda düzenlemenizi sağlar.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-sm block">İzole Çalışma Alanı</span>
                <span className="text-xs text-stone-400">Her hesap kendi depolarına sahiptir</span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-sm block">Master PIN Koruması</span>
                <span className="text-xs text-stone-400">Özel depolar tek dokunuşla kilitlenir</span>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-stone-400 flex items-center justify-between border-t border-white/10 pt-4">
          <span>© 2026 Kişisel Depo Sistemi</span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            v2.0 Çevrimdışı & Güvenli
          </span>
        </div>
      </div>

      {/* Sağ Form Paneli */}
      <div className="lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-16">
        <div className="max-w-md w-full space-y-6">
          {/* Giriş / Kayıt Geçiş Sekmesi */}
          <div className="flex p-1 rounded-2xl bg-stone-200/60 dark:bg-slate-800/80">
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
              Hesap Oluştur
            </button>
          </div>

          {isVerifyingEmail ? (
            <div className="space-y-5">
              <div>
                <button
                  type="button"
                  onClick={() => setIsVerifyingEmail(false)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-800 dark:text-slate-400 dark:hover:text-slate-200 mb-3"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Bilgileri Değiştir
                </button>
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3 border border-indigo-200 dark:border-indigo-800">
                  <MailCheck className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-extrabold text-stone-900 dark:text-white tracking-tight">
                  E-Posta Doğrulama Kodu
                </h2>
                <p className="text-xs text-stone-500 dark:text-slate-400 mt-1">
                  <b>{email}</b> adresinize 6 haneli bir güvenlik onay kodu ilettik. Hesabınızı aktifleştirmek için kodu girin:
                </p>
              </div>

              {/* Demo / Canlı Kod Bildirim Rozeti */}
              <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-900 dark:text-indigo-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>
                    Simülasyon Onay Kodunuz: <b className="font-mono text-sm tracking-wider">{generatedCode}</b>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setVerificationCodeInput(generatedCode);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white font-bold text-[11px] hover:bg-indigo-700 transition cursor-pointer"
                >
                  Doldur
                </button>
              </div>

              {verificationError && (
                <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/60 text-xs font-semibold text-rose-700 dark:text-rose-300">
                  {verificationError}
                </div>
              )}

              {codeResentToast && (
                <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900/60 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                  Yeni doğrulama kodu başarıyla iletildi.
                </div>
              )}

              <form onSubmit={handleConfirmVerification} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    6 Haneli Güvenlik Kodu
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    autoFocus
                    value={verificationCodeInput}
                    onChange={(e) => setVerificationCodeInput(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
                    placeholder="123456"
                    className="w-full text-center tracking-widest text-2xl font-mono py-3 rounded-xl border border-stone-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-stone-900 dark:text-white placeholder:text-stone-300 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-bold"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading || verificationCodeInput.length < 6}
                  className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-bold shadow-md shadow-indigo-600/20 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isLoading ? "Hesap Oluşturuluyor..." : "Kodu Doğrula ve Hesabı Aç"}</span>
                </button>

                <div className="flex items-center justify-between text-xs pt-2">
                  <button
                    type="button"
                    onClick={handleResendVerificationCode}
                    className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Kodu Tekrar Gönder
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsVerifyingEmail(false)}
                    className="text-stone-500 dark:text-slate-400 hover:underline cursor-pointer"
                  >
                    Vazgeç
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <>
              <div>
                <h2 className="text-2xl font-extrabold text-stone-900 dark:text-white tracking-tight">
                  {mode === "login" ? "Tekrar Hoş Geldiniz" : "Kişisel Deponuzu Açın"}
                </h2>
                <p className="text-xs text-stone-500 dark:text-slate-400 mt-1">
                  {mode === "login"
                    ? "Kişisel arşivlerinize ve özel depolarınıza erişmek için giriş yapın."
                    : "Saniyeler içinde e-posta doğrulamalı hesabınızı oluşturup arşivlemeye başlayın."}
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
                        autoComplete="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Adınız ve Soyadınız"
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
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="eposta@ornek.com"
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
                        className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 cursor-pointer"
                      >
                        Şifremi Unuttum?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-stone-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? "text" : "password"}
                      autoComplete={mode === "login" ? "current-password" : "new-password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="En az 4 karakter"
                      className="w-full pl-10 pr-10 py-3 rounded-xl border border-stone-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 dark:text-slate-500 hover:text-stone-700 dark:hover:text-slate-300 cursor-pointer"
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
                  className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-bold shadow-md shadow-indigo-600/20 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>
                    {isLoading
                      ? "İşlem Yapılıyor..."
                      : mode === "login"
                      ? "Kişisel Depoya Giriş Yap"
                      : "Hesabımı Oluştur ve Doğrula"}
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
                  onClick={() => setIsGoogleModalOpen(true)}
                  className="w-full py-2.5 px-4 rounded-xl bg-white dark:bg-slate-800 hover:bg-stone-50 dark:hover:bg-slate-700/80 border border-stone-200 dark:border-slate-700 text-stone-700 dark:text-slate-200 text-xs font-bold transition flex items-center justify-center gap-2.5 shadow-2xs cursor-pointer"
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
                  className="w-full py-2.5 px-4 rounded-xl bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100/80 dark:hover:bg-amber-900/60 border border-amber-200/80 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <KeyRound className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                  Demo Hesapla Tek Tıkla Giriş (Erdal Türk)
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Google Hesap Seçici Simülasyon Modalı */}
      {isGoogleModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 max-w-sm w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z" />
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24z" />
                  <path fill="#FBBC05" d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14z" />
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96z" />
                </svg>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Google ile Oturum Aç
                </h3>
              </div>
              <button
                onClick={() => setIsGoogleModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Kişisel Depo sistemine devam etmek için Google hesabınızı seçin:
            </p>

            <div className="space-y-2">
              {/* Hesap 1: Erdal Türk */}
              <button
                type="button"
                onClick={() =>
                  handleSelectGoogleAccount("erdal.turk@kisiseldepo.com", "Erdal Türk")
                }
                className="w-full p-3 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 hover:bg-indigo-50/40 dark:hover:bg-slate-800/80 transition flex items-center gap-3 text-left group cursor-pointer"
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  ET
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    Erdal Türk
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    erdal.turk@kisiseldepo.com
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  Demo
                </span>
              </button>

              {/* Hesap 2: Bireysel Kullanıcı */}
              <button
                type="button"
                onClick={() =>
                  handleSelectGoogleAccount("demo.kullanici@gmail.com", "Bireysel Kullanıcı")
                }
                className="w-full p-3 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 hover:bg-indigo-50/40 dark:hover:bg-slate-800/80 transition flex items-center gap-3 text-left group cursor-pointer"
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  BK
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    Bireysel Kullanıcı
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    demo.kullanici@gmail.com
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  İzole
                </span>
              </button>

              {/* Eğer formda email yazılmışsa o hesapla tek tık giriş */}
              {email.trim().includes("@") && email.trim() !== "erdal.turk@kisiseldepo.com" && email.trim() !== "demo.kullanici@gmail.com" && (
                <button
                  type="button"
                  onClick={() =>
                    handleSelectGoogleAccount(
                      email.trim(),
                      name.trim() || email.split("@")[0]
                    )
                  }
                  className="w-full p-3 rounded-2xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/30 dark:bg-indigo-950/30 hover:border-indigo-500 hover:bg-indigo-50/60 transition flex items-center gap-3 text-left group cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    {(name.trim() || email.charAt(0)).slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {name.trim() || email.split("@")[0]}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {email.trim()}
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300">
                    Seçili
                  </span>
                </button>
              )}

              {isSupabaseConfigured() && (
                <button
                  type="button"
                  onClick={handleRealGoogleOAuth}
                  className="w-full p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs mt-2"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z" />
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24z" />
                    <path fill="#FBBC05" d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14z" />
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96z" />
                  </svg>
                  Canlı Google OAuth ile Bağlan
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
