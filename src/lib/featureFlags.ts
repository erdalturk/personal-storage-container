/**
 * Kişisel Depo (Personal Storage Container)
 * Merkezi Özellik Bayrakları Kütüğü (Feature Flags Registry)
 * 
 * PM-CONTROL Denetimi (Satır 43, 71, 78, 81, 125, 136-137, 152-154) kapsamında:
 * Pasife alınan özelliklerin kod tabanından tamamen silinmek yerine,
 * istenildiğinde tek bir bayrakla anında yeniden aktifleştirilmesini sağlar.
 */

export interface FeatureFlagRegistry {
  // 1. Arşiv Dışa/İçe Aktarma (PM-CONTROL Satır 125, 136-137)
  enableFullArchiveJsonExport: boolean; // Profil: Tüm arşivi JSON olarak indirme
  enableFullArchiveJsonImport: boolean; // Profil: Dosyadan JSON yedeği geri yükleme

  // 2. Depo Paylaşım İndirmeleri (PM-CONTROL Satır 43)
  enableSharedContainerFullDownload: boolean; // Paylaşılan depoda "Tüm Depoyu İndir" aksiyonu
  enableMovieArchiveExport: boolean; // Film vitrininde JSON/CSV toplu indirme

  // 3. Markdown (.md) Dışa Aktarma (PM-CONTROL Satır 71, 78)
  enableMarkdownExportTravel: boolean; // Gezi rehberini markdown (.md) olarak indirme
  enableMarkdownExportStudy: boolean; // Ders notlarını markdown (.md) olarak indirme

  // 4. Sınav Ezber Kartları İndirme (PM-CONTROL Satır 81)
  enableFlashcardsDownload: boolean; // Sınav kartlarını metin/kod olarak indirme
}

/**
 * Varsayılan Özellik Durumları
 * Kullanıcının PM denetiminde pasife alınmasını istediği tüm özellikler varsayılan olarak false (pasif) olarak kütüklenmiştir.
 */
export const DEFAULT_FEATURE_FLAGS: FeatureFlagRegistry = {
  enableFullArchiveJsonExport: false,
  enableFullArchiveJsonImport: false,
  enableSharedContainerFullDownload: false,
  enableMovieArchiveExport: false,
  enableMarkdownExportTravel: false,
  enableMarkdownExportStudy: false,
  enableFlashcardsDownload: false,
};

const FEATURE_FLAGS_STORAGE_KEY = "psc_feature_flags";

/**
 * Bir özelliğin aktif olup olmadığını denetler.
 * Tarayıcıda localStorage geçersiz kılmalarını (overrides) destekler; SSR sırasında varsayılanları döner.
 */
export function isFeatureEnabled(flag: keyof FeatureFlagRegistry): boolean {
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(FEATURE_FLAGS_STORAGE_KEY);
      if (raw) {
        const overrides = JSON.parse(raw);
        if (typeof overrides[flag] === "boolean") {
          return overrides[flag];
        }
      }
    } catch {
      // JSON hatasında varsayılan değere dön
    }
  }
  return DEFAULT_FEATURE_FLAGS[flag];
}

/**
 * İleride test veya geliştirme aşamasında bir özelliği yerel olarak açıp kapatmaya yarar.
 */
export function setFeatureFlag(flag: keyof FeatureFlagRegistry, enabled: boolean): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(FEATURE_FLAGS_STORAGE_KEY);
    const overrides = raw ? JSON.parse(raw) : {};
    overrides[flag] = enabled;
    localStorage.setItem(FEATURE_FLAGS_STORAGE_KEY, JSON.stringify(overrides));
    window.dispatchEvent(new Event("psc-store-updated"));
  } catch (err) {
    console.error("[FeatureFlags] Bayrak kaydedilemedi:", err);
  }
}

/**
 * Tüm bayrakların durumunu bir nesne olarak döner (ayarlar ve denetim panelleri için).
 */
export function getAllFeatureFlags(): FeatureFlagRegistry {
  const result: FeatureFlagRegistry = { ...DEFAULT_FEATURE_FLAGS };
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(FEATURE_FLAGS_STORAGE_KEY);
      if (raw) {
        const overrides = JSON.parse(raw);
        for (const key of Object.keys(DEFAULT_FEATURE_FLAGS) as Array<keyof FeatureFlagRegistry>) {
          if (typeof overrides[key] === "boolean") {
            result[key] = overrides[key];
          }
        }
      }
    } catch {
      // Hata durumunda varsayılanlar kalır
    }
  }
  return result;
}

/**
 * Tüm bayrakları varsayılan duruma sıfırlar.
 */
export function resetFeatureFlags(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(FEATURE_FLAGS_STORAGE_KEY);
  window.dispatchEvent(new Event("psc-store-updated"));
}
