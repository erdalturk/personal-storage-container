import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

// Mock browser globals for testing in Node
const storageMap = new Map();

globalThis.window = {
  dispatchEvent: () => true,
  addEventListener: () => {},
  removeEventListener: () => {},
};

globalThis.localStorage = {
  getItem: (key) => (storageMap.has(key) ? storageMap.get(key) : null),
  setItem: (key, val) => storageMap.set(key, String(val)),
  removeItem: (key) => storageMap.delete(key),
  clear: () => storageMap.clear(),
};

globalThis.Event = class Event {
  constructor(name) {
    this.name = name;
  }
};

const tsPath = path.resolve(process.cwd(), "src/lib/appStore.ts");
const tsCode = fs.readFileSync(tsPath, "utf8");
const jsCode = ts.transpileModule(tsCode, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
  },
}).outputText;

const dataUrl = `data:text/javascript;base64,${Buffer.from(jsCode).toString("base64")}`;
const store = await import(dataUrl);

test("BATCH-01: addBatchToTrash birden fazla öğeyi tek seferde çöp kutusuna ekler", () => {
  localStorage.clear();
  const batchToAdd = [
    {
      title: "Toplu Silinen Belge 1",
      originContainer: "Sözleşmeler",
      type: "file",
      contentPreview: "Önizleme 1",
      originalData: { id: "doc-1", title: "Toplu Silinen Belge 1" },
    },
    {
      title: "Toplu Silinen Belge 2",
      originContainer: "Sözleşmeler",
      type: "file",
      contentPreview: "Önizleme 2",
      originalData: { id: "doc-2", title: "Toplu Silinen Belge 2" },
    },
  ];

  const added = store.addBatchToTrash(batchToAdd);
  assert.equal(added.length, 2);
  assert.ok(added[0].id.startsWith("tr-"));
  assert.ok(added[1].id.startsWith("tr-"));

  const allTrash = store.getTrashItems();
  const found1 = allTrash.find((t) => t.id === added[0].id);
  const found2 = allTrash.find((t) => t.id === added[1].id);
  assert.ok(found1, "Öğe 1 çöp kutusunda bulunmalıdır");
  assert.ok(found2, "Öğe 2 çöp kutusunda bulunmalıdır");
});

test("BATCH-02: restoreBatchFromTrash seçilen ID listesindeki tüm öğeleri çöp kutusundan çıkarır", () => {
  const batch = [
    {
      title: "Geri Yüklenecek Metin 1",
      originContainer: "Notlar",
      type: "text",
      originalData: { id: "txt-1", title: "Geri Yüklenecek Metin 1" },
    },
    {
      title: "Geri Yüklenecek Metin 2",
      originContainer: "Notlar",
      type: "text",
      originalData: { id: "txt-2", title: "Geri Yüklenecek Metin 2" },
    },
  ];

  const added = store.addBatchToTrash(batch);
  const idsToRestore = added.map((a) => a.id);

  const restored = store.restoreBatchFromTrash(idsToRestore);
  assert.equal(restored.length, 2);

  const allTrash = store.getTrashItems();
  const stillInTrash = allTrash.filter((t) => idsToRestore.includes(t.id));
  assert.equal(stillInTrash.length, 0, "Geri yüklenen öğeler çöp kutusunda kalmamalıdır");
});

test("BATCH-03: permanentDeleteBatchFromTrash seçilen ID'leri kalıcı olarak siler", () => {
  const batch = [
    {
      title: "Kalıcı Silinecek 1",
      originContainer: "Görseller",
      type: "image",
    },
    {
      title: "Kalıcı Silinecek 2",
      originContainer: "Görseller",
      type: "image",
    },
  ];

  const added = store.addBatchToTrash(batch);
  const idsToDelete = added.map((a) => a.id);

  const deletedCount = store.permanentDeleteBatchFromTrash(idsToDelete);
  assert.equal(deletedCount, 2);

  const allTrash = store.getTrashItems();
  const remaining = allTrash.filter((t) => idsToDelete.includes(t.id));
  assert.equal(remaining.length, 0);
});
