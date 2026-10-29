"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getCurrentUser, purgeExpiredTrashItems } from "@/lib/appStore";

// Genel halka açık rotalar (oturum gerektirmeyenler)
const PUBLIC_PREFIXES = ["/login", "/share"];

function AuthGuardContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = () => {
      // Halka açık rota kontrolü
      const isPublic = PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));
      const user = getCurrentUser();

      if (isPublic) {
        // Eğer oturumu açık kullanıcı /login'e gitmeye çalışırsa doğrudan ana panele yönlendir
        if (pathname === "/login" && user?.isAuthenticated) {
          router.replace("/");
          return;
        }
        setIsAuthorized(true);
        return;
      }

      // Korumalı rota: oturum kapalıysa derhal /login'e yönlendir
      if (!user?.isAuthenticated) {
        setIsAuthorized(false);
        router.replace("/login");
        return;
      }

      // PM-CONTROL Satır 116: Uygulama açılışında ve oturum kontrolünde süresi dolan çöpleri otomatik temizle
      try {
        purgeExpiredTrashItems();
      } catch {
        // Tarayıcı ilk boot istisnası yakalama
      }

      setIsAuthorized(true);
    };

    checkAuth();

    // Oturum değişikliklerini (Login/Logout) dinle
    window.addEventListener("psc-store-updated", checkAuth);
    return () => window.removeEventListener("psc-store-updated", checkAuth);
  }, [pathname, router]);

  // Henüz kontrol tamamlanmadıysa veya halka açık sayfada değilse bekleme durumu
  if (isAuthorized === null) {
    const isPublic = PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));
    if (isPublic) return <>{children}</>;
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center gap-3">
        <div className="w-9 h-9 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          Oturum kontrol ediliyor...
        </p>
      </div>
    );
  }

  // Yetkisizse çocuk bileşenleri basma (yönlendirme gerçekleşiyor)
  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center gap-3">
          <div className="w-9 h-9 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <AuthGuardContent>{children}</AuthGuardContent>
    </Suspense>
  );
}
