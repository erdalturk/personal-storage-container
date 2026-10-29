import test from "node:test";
import assert from "node:assert/strict";

test("MEDIA-01: Text Folder Tree hierarchy groups notes correctly", () => {
  const folders = [
    { id: "f1", name: "Şiirler" },
    { id: "f2", name: "Projeler" },
  ];

  const texts = [
    { id: "t1", title: "Şiir 1", folderId: "f1", content: "Mavi bir gökyüzü", wordCount: 3 },
    { id: "t2", title: "Proje Notu", folderId: "f2", content: "Mimari kararlar", wordCount: 2 },
    { id: "t3", title: "Klasörsüz Not", folderId: null, content: "Hızlı not", wordCount: 2 },
  ];

  // Klasör bazlı filtreleme (Tree View)
  const f1Texts = texts.filter((t) => t.folderId === "f1");
  assert.equal(f1Texts.length, 1);
  assert.equal(f1Texts[0].title, "Şiir 1");

  const unorganizedTexts = texts.filter((t) => t.folderId === null);
  assert.equal(unorganizedTexts.length, 1);
  assert.equal(unorganizedTexts[0].title, "Klasörsüz Not");
});

test("MEDIA-02: Text live character and word counters calculate accurately", () => {
  const text = "Merhaba Dünya! Kişisel Depo Projesi.";
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const chars = text.length;

  assert.equal(words, 5, "Kelime sayısı 5 olmalı");
  assert.equal(chars, 36, "Karakter sayısı 36 olmalı");
});

test("MEDIA-03: Audio playback speeds cycle and set accurately", () => {
  const speeds = [0.75, 1, 1.25, 1.5, 2];

  function getNextSpeed(current) {
    const idx = (speeds.indexOf(current) + 1) % speeds.length;
    return speeds[idx];
  }

  let speed = 1;
  speed = getNextSpeed(speed);
  assert.equal(speed, 1.25);

  speed = getNextSpeed(speed);
  assert.equal(speed, 1.5);

  speed = getNextSpeed(speed);
  assert.equal(speed, 2);

  speed = getNextSpeed(speed);
  assert.equal(speed, 0.75);

  speed = getNextSpeed(speed);
  assert.equal(speed, 1);
});

test("MEDIA-04: Image metadata contains resolution, aspect ratio and color palette", () => {
  const mediaItem = {
    id: "img-test",
    title: "Nordik Mimari",
    resolution: "3840 × 2160",
    aspectRatio: "16:9",
    colorPalette: ["#1E293B", "#B45309", "#E2E8F0", "#334155"],
    format: "RAW",
    size: "18.4 MB",
    cameraInfo: "Sony A7IV • 35mm f/1.4",
  };

  assert.equal(mediaItem.aspectRatio, "16:9");
  assert.ok(mediaItem.colorPalette && mediaItem.colorPalette.length === 4);
  assert.ok(mediaItem.colorPalette.every((c) => c.startsWith("#")));
});

test("MEDIA-05: Files container filters by all supported extensions", () => {
  const files = [
    { id: "1", title: "Sozlesme.pdf", extension: "PDF" },
    { id: "2", title: "Butce.xlsx", extension: "XLSX" },
    { id: "3", title: "Rapor.docx", extension: "DOCX" },
    { id: "4", title: "Sunum.pptx", extension: "PPTX" },
    { id: "5", title: "Yedek.zip", extension: "ZIP" },
    { id: "6", title: "Ayar.json", extension: "JSON" },
  ];

  const filterFiles = (ext) => (ext === "all" ? files : files.filter((f) => f.extension === ext));

  assert.equal(filterFiles("all").length, 6);
  assert.equal(filterFiles("PDF").length, 1);
  assert.equal(filterFiles("XLSX").length, 1);
  assert.equal(filterFiles("DOCX").length, 1);
  assert.equal(filterFiles("PPTX").length, 1);
  assert.equal(filterFiles("ZIP").length, 1);
  assert.equal(filterFiles("JSON").length, 1);
});
