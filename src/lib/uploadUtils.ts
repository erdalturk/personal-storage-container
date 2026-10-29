export function formatBytes(bytes: number, decimals: number = 1): string {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i] || "MB"}`;
}

export function getFileExtension(filename: string): string {
  const parts = (filename || "").split(".");
  return parts.length > 1 ? parts.pop()!.toUpperCase() : "DOSYA";
}

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Dosya okunamadı."));
    reader.readAsDataURL(file);
  });
}

export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string) || "");
    reader.onerror = () => reject(new Error("Metin dosyası okunamadı."));
    reader.readAsText(file);
  });
}

// Görselleri tarayıcıda hafifletip optimize eden motor (localStorage kotasını korur)
export function compressImageClient(
  file: File,
  maxWidth: number = 1400,
  quality: number = 0.85
): Promise<{ dataUrl: string; width: number; height: number; sizeStr: string }> {
  return new Promise(async (resolve, reject) => {
    if (typeof window === "undefined") {
      resolve({
        dataUrl: "",
        width: 800,
        height: 600,
        sizeStr: formatBytes(file.size),
      });
      return;
    }

    try {
      const originalDataUrl = await readFileAsDataUrl(file);
      const img = new Image();
      img.onload = () => {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          resolve({
            dataUrl: originalDataUrl,
            width,
            height,
            sizeStr: formatBytes(file.size),
          });
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // PNG veya JPEG optimizasyonu
        const isPng = file.type === "image/png" && file.size < 800 * 1024;
        const outputMime = isPng ? "image/png" : "image/jpeg";
        const compressedDataUrl = canvas.toDataURL(outputMime, quality);

        // Yaklaşık boyut hesabı
        const approxBytes = Math.round((compressedDataUrl.length * 3) / 4);

        resolve({
          dataUrl: compressedDataUrl,
          width,
          height,
          sizeStr: formatBytes(approxBytes),
        });
      };
      img.onerror = () => {
        resolve({
          dataUrl: originalDataUrl,
          width: 800,
          height: 600,
          sizeStr: formatBytes(file.size),
        });
      };
      img.src = originalDataUrl;
    } catch (e) {
      reject(e);
    }
  });
}

export type TargetContainer = "code" | "text" | "media" | "files" | "audio";

export interface FileDetectionResult {
  container: TargetContainer;
  categoryLabel: string;
  route: string;
  language?: string;
  ext: string;
  isMediaVideo?: boolean;
}

// Dosya uzantısı ve MIME tipine göre hedef depoyu akıllıca tespit eden evrensel sınıflandırıcı
export function detectContainerForFile(file: { name?: string; type?: string }): FileDetectionResult {
  const filename = file.name || "";
  const parts = filename.split(".");
  const ext = parts.length > 1 ? parts.pop()!.toLowerCase() : "";
  const mime = (file.type || "").toLowerCase();

  // 1. Kod Parçacıkları (py, ts, js, rs, sql, go, sh, html, css, json...)
  const codeExtMap: Record<string, string> = {
    py: "python",
    ts: "typescript",
    tsx: "typescript",
    js: "javascript",
    jsx: "javascript",
    mjs: "javascript",
    cjs: "javascript",
    sql: "sql",
    rs: "rust",
    go: "go",
    sh: "bash",
    bash: "bash",
    zsh: "bash",
    html: "html",
    htm: "html",
    css: "css",
    scss: "css",
    sass: "css",
    json: "json",
    dockerfile: "dockerfile",
  };

  if (codeExtMap[ext] || filename.toLowerCase() === "dockerfile") {
    return {
      container: "code",
      categoryLabel: "Kod Parçacıkları Deposu",
      route: "/containers/code",
      language: codeExtMap[ext] || "dockerfile",
      ext: ext.toUpperCase(),
    };
  }

  // 2. Metin & Notlar (txt, md, markdown)
  if (["txt", "md", "markdown"].includes(ext)) {
    return {
      container: "text",
      categoryLabel: "Metin & Şiir Deposu",
      route: "/containers/text",
      ext: ext.toUpperCase(),
    };
  }

  // 3. Ses Dosyaları (mp3, wav, m4a, ogg, aac, flac)
  if (["mp3", "wav", "m4a", "ogg", "aac", "flac"].includes(ext) || mime.startsWith("audio/")) {
    return {
      container: "audio",
      categoryLabel: "Ses Deposu",
      route: "/containers/audio",
      ext: ext.toUpperCase() || "MP3",
    };
  }

  // 4. Medya (Fotoğraflar & Videolar)
  const isVideo = ["mp4", "webm", "mov", "mkv", "avi"].includes(ext) || mime.startsWith("video/");
  if (
    isVideo ||
    ["jpg", "jpeg", "png", "webp", "gif", "svg", "bmp", "avif"].includes(ext) ||
    mime.startsWith("image/")
  ) {
    return {
      container: "media",
      categoryLabel: "Görüntü & Medya Deposu",
      route: "/containers/media",
      ext: ext.toUpperCase() || (isVideo ? "MP4" : "JPG"),
      isMediaVideo: isVideo,
    };
  }

  // 5. Belgeler & Arşivler (PDF, DOCX, PPTX, XLSX, ZIP, TAR vb.)
  return {
    container: "files",
    categoryLabel: "Belge & Dosya Deposu",
    route: "/containers/files",
    ext: ext.toUpperCase() || "PDF",
  };
}

// Güvenli yerel koleksiyon okuma/yazma yardımcıları
function getLocalCollection<T>(storageKey: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(storageKey);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalCollection<T>(storageKey: string, data: T[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(storageKey, JSON.stringify(data));
    window.dispatchEvent(new Event("psc-store-updated"));
  } catch (err) {
    console.error("Storage error:", err);
  }
}

// Dosyayı tarayıcıda doğrudan doğru depoya aktaran ve depolayan evrensel ingest motoru
export async function autoIngestFile(
  file: File,
  overrideContainer?: TargetContainer
): Promise<{
  success: boolean;
  container: TargetContainer;
  containerName: string;
  title: string;
  route: string;
}> {
  const detected = detectContainerForFile(file);
  const targetContainer = overrideContainer || detected.container;
  const cleanTitle = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]+/g, " ");

  const containerMetaMap: Record<TargetContainer, { name: string; route: string }> = {
    code: { name: "Kod Parçacıkları Deposu", route: "/containers/code" },
    text: { name: "Metin Deposu", route: "/containers/text" },
    media: { name: "Görüntü Deposu", route: "/containers/media" },
    audio: { name: "Ses Deposu", route: "/containers/audio" },
    files: { name: "Dosya & Belge Deposu", route: "/containers/files" },
  };

  if (targetContainer === "code") {
    const codeText = await readFileAsText(file);
    const snippets = getLocalCollection<any>("psc_snippets");
    const newSnippet = {
      id: `snip-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: cleanTitle || file.name,
      language: detected.language || "typescript",
      code: codeText || "// Boş kod dosyası",
      description: `${file.name} dosyasından cihazdan otomatik aktarıldı.`,
      tags: [detected.language || "kod", "cihazdan"],
      createdAt: "Bugün",
      isFavorite: false,
    };
    saveLocalCollection("psc_snippets", [newSnippet, ...snippets]);
  } else if (targetContainer === "text") {
    const textContent = await readFileAsText(file);
    const texts = getLocalCollection<any>("psc_texts");
    const words = textContent.trim().split(/\s+/).filter(Boolean).length;
    const lines = textContent.split("\n").length;
    const newText = {
      id: `text-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: cleanTitle || file.name,
      content: textContent,
      folderId: null,
      formatType: detected.ext === "MD" ? "note" : "plain",
      lastUpdated: "Bugün",
      wordCount: words,
      lineCount: lines,
    };
    saveLocalCollection("psc_texts", [newText, ...texts]);
  } else if (targetContainer === "media") {
    let finalUrl = "";
    let resolution = "1920 × 1080";
    let sizeStr = formatBytes(file.size);

    if (detected.isMediaVideo) {
      finalUrl = await readFileAsDataUrl(file);
      resolution = "Video Dosyası";
    } else {
      try {
        const comp = await compressImageClient(file);
        finalUrl = comp.dataUrl;
        resolution = `${comp.width} × ${comp.height}`;
        sizeStr = comp.sizeStr;
      } catch {
        finalUrl = await readFileAsDataUrl(file);
      }
    }

    const mediaList = getLocalCollection<any>("psc_media_items");
    const newMedia = {
      id: `img-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: cleanTitle || file.name,
      folder: "Kişisel Çekimler",
      imageUrl: finalUrl,
      resolution: resolution,
      format: detected.ext === "PNG" ? "PNG" : detected.ext === "WEBP" ? "WEBP" : "JPG",
      size: sizeStr,
      cameraInfo: `Cihazdan Aktarıldı • ${sizeStr}`,
      description: `${file.name} — Cihazdan aktarılan orijinal medya referansı.`,
      tags: ["cihazdan", detected.ext.toLowerCase()],
      createdAt: "Bugün",
      isFavorite: false,
    };
    saveLocalCollection("psc_media_items", [newMedia, ...mediaList]);
  } else if (targetContainer === "audio") {
    const dataUrl = await readFileAsDataUrl(file);
    const audios = getLocalCollection<any>("psc_audio_items");
    const newAudio = {
      id: `aud-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: cleanTitle || file.name,
      folder: "Sesli Fikirler",
      duration: "03:15",
      format: detected.ext === "WAV" ? "WAV" : detected.ext === "M4A" ? "M4A" : "MP3",
      recordedAt: "Bugün",
      transcript: `${file.name} — Cihazdan yüklenen ses kaydı (${formatBytes(file.size)}).`,
      audioUrl: dataUrl,
      tags: ["cihazdan", "ses"],
      isFavorite: false,
    };
    saveLocalCollection("psc_audio_items", [newAudio, ...audios]);
  } else {
    // files
    const dataUrl = await readFileAsDataUrl(file);
    const files = getLocalCollection<any>("psc_file_items");
    const validExts = ["PDF", "ZIP", "DOCX", "XLSX", "PPTX", "JSON"];
    const fileExt = validExts.includes(detected.ext) ? detected.ext : "PDF";
    const sizeStr = formatBytes(file.size);

    const newFile = {
      id: `file-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: file.name,
      folder: "Belgelerim",
      extension: fileExt,
      sizeLabel: sizeStr,
      lastModified: "Bugün",
      version: "v1.0 • Orijinal Belge",
      summary: `${file.name} — Cihazınızdan aktarılan orijinal arşiv kopyası (${sizeStr}).`,
      tags: ["cihazdan", fileExt.toLowerCase()],
      isFavorite: false,
      fileDataUrl: dataUrl,
    };
    saveLocalCollection("psc_file_items", [newFile, ...files]);
  }

  const meta = containerMetaMap[targetContainer] || { name: detected.categoryLabel, route: detected.route };

  return {
    success: true,
    container: targetContainer,
    containerName: meta.name,
    title: cleanTitle || file.name,
    route: meta.route,
  };
}
