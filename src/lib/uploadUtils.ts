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

        // WebP destekleniyorsa webp, değilse jpeg
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
