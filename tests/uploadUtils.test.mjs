import test from "node:test";
import assert from "node:assert/strict";
import { formatBytes, getFileExtension, detectContainerForFile } from "../src/lib/uploadUtils.ts";

test("UPLOAD-01: formatBytes converts byte integers into readable units", () => {
  assert.equal(formatBytes(0), "0 B");
  assert.equal(formatBytes(500), "500 B");
  assert.equal(formatBytes(1024), "1 KB");
  assert.equal(formatBytes(1048576), "1 MB");
  assert.equal(formatBytes(5242880), "5 MB");
});

test("UPLOAD-02: getFileExtension correctly extracts and capitalizes file extensions", () => {
  assert.equal(getFileExtension("sozlesme.pdf"), "PDF");
  assert.equal(getFileExtension("tablo.xlsx"), "XLSX");
  assert.equal(getFileExtension("resim.png"), "PNG");
  assert.equal(getFileExtension("arsiv.zip"), "ZIP");
  assert.equal(getFileExtension("uzantisiz-dosya"), "DOSYA");
});

test("UPLOAD-03: detectContainerForFile auto-routes all universal formats correctly", () => {
  // 1. Kod: .py, .ts, .js, .sql, .rs
  const pyResult = detectContainerForFile({ name: "script.py" });
  assert.equal(pyResult.container, "code");
  assert.equal(pyResult.language, "python");

  const tsResult = detectContainerForFile({ name: "server.ts" });
  assert.equal(tsResult.container, "code");
  assert.equal(tsResult.language, "typescript");

  const sqlResult = detectContainerForFile({ name: "schema.sql" });
  assert.equal(sqlResult.container, "code");
  assert.equal(sqlResult.language, "sql");

  // 2. Metin & Notlar: .txt, .md
  const mdResult = detectContainerForFile({ name: "README.md" });
  assert.equal(mdResult.container, "text");

  const txtResult = detectContainerForFile({ name: "gunluk_notlar.txt" });
  assert.equal(txtResult.container, "text");

  // 3. Ses: .mp3, .wav, audio/*
  const mp3Result = detectContainerForFile({ name: "kayit.mp3", type: "audio/mpeg" });
  assert.equal(mp3Result.container, "audio");

  const wavResult = detectContainerForFile({ name: "nota.wav" });
  assert.equal(wavResult.container, "audio");

  // 4. Medya (Resim & Video): .jpg, .png, .mp4, .webm
  const jpgResult = detectContainerForFile({ name: "manzara.jpg", type: "image/jpeg" });
  assert.equal(jpgResult.container, "media");
  assert.equal(jpgResult.isMediaVideo, false);

  const mp4Result = detectContainerForFile({ name: "tanitim.mp4", type: "video/mp4" });
  assert.equal(mp4Result.container, "media");
  assert.equal(mp4Result.isMediaVideo, true);

  // 5. Belgeler & Sunumlar: .pdf, .docx, .pptx, .xlsx
  const pdfResult = detectContainerForFile({ name: "sozlesme.pdf" });
  assert.equal(pdfResult.container, "files");

  const docxResult = detectContainerForFile({ name: "rapor.docx" });
  assert.equal(docxResult.container, "files");

  const pptxResult = detectContainerForFile({ name: "sunum.pptx" });
  assert.equal(pptxResult.container, "files");
});
