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

test("AUTH-ISO-01: Erdal Türk (Demo) kullanıcısı demo koleksiyonlarına erişir", () => {
  localStorage.clear();
  store.loginUser("erdal.turk@kisiseldepo.com", "Erdal Türk");
  const user = store.getCurrentUser();
  assert.equal(user.isAuthenticated, true);
  assert.equal(user.name, "Erdal Türk");

  const movies = store.getStoredCollection("movies", [
    { id: "m-demo-1", title: "Inception" },
  ]);
  assert.ok(movies.length > 0, "Erdal Türk demo filmleri görmelidir");
  assert.equal(movies[0].title, "Inception");
});

test("AUTH-ISO-02: Yeni kayıt olan kullanıcıya Erdal Türk'ün verileri sızmaz (boş liste)", () => {
  localStorage.clear();
  // Yeni kullanıcı kaydı
  const regResult = store.registerUser(
    "ahmet.kaya@kisiseldepo.com",
    "Ahmet Kaya",
    "sifre123"
  );
  assert.equal(regResult.success, true);
  assert.equal(regResult.user.email, "ahmet.kaya@kisiseldepo.com");
  assert.equal(regResult.user.isAuthenticated, true);

  // Koleksiyonlar kontrol ediliyor
  const ahmetMovies = store.getStoredCollection("movies", [
    { id: "m-demo-1", title: "Inception" },
  ]);
  assert.equal(ahmetMovies.length, 0, "Yeni kullanıcıya Erdal'ın filmleri sızmamalı, 0 film dönmelidir");

  const ahmetTexts = store.getStoredCollection("texts", [
    { id: "t-demo-1", title: "Şiir" },
  ]);
  assert.equal(ahmetTexts.length, 0, "Yeni kullanıcıya Erdal'ın notları sızmamalı, 0 metin dönmelidir");
});

test("AUTH-ISO-03: Yeni kullanıcının eklediği içerik yalnızca kendi alanına yazılır", () => {
  // Ahmet Kaya aktif
  store.loginUser("ahmet.kaya@kisiseldepo.com", "Ahmet Kaya");

  const ahmetNewMovie = { id: "m-ahmet-1", title: "The Matrix" };
  store.saveStoredCollection("movies", [ahmetNewMovie]);

  const readAhmet = store.getStoredCollection("movies", []);
  assert.equal(readAhmet.length, 1);
  assert.equal(readAhmet[0].title, "The Matrix");

  // Erdal Türk'e geç
  store.loginUser("erdal.turk@kisiseldepo.com", "Erdal Türk");
  const readErdal = store.getStoredCollection("movies", [
    { id: "m-demo-1", title: "Inception" },
  ]);
  const matrixInErdal = readErdal.find((m) => m.title === "The Matrix");
  assert.equal(matrixInErdal, undefined, "Ahmet'in eklediği film Erdal'ın listesinde görünmemelidir");
});

test("AUTH-ISO-04: Çöp kutusu kullanıcı bazlı tamamen izoledir", () => {
  localStorage.clear();

  // Erdal Türk varsayılan çöp kutusu öğelerine sahiptir
  store.loginUser("erdal.turk@kisiseldepo.com", "Erdal Türk");
  const erdalTrash = store.getTrashItems();
  assert.ok(erdalTrash.length > 0, "Erdal Türk demo çöp kutusu öğelerine sahip olmalıdır");

  // Yeni kullanıcı Ahmet Kaya'nın çöp kutusu başlangıçta boştur
  store.registerUser("ahmet.kaya@kisiseldepo.com", "Ahmet Kaya");
  const ahmetTrash = store.getTrashItems();
  assert.equal(ahmetTrash.length, 0, "Yeni kullanıcının çöp kutusu boş olmalıdır");

  // Ahmet çöp kutusuna bir öğe atar
  store.addToTrash({
    title: "Ahmet'in Silinen Notu",
    originContainer: "Ahmet Notları",
    type: "text",
    contentPreview: "Silinen deneme",
  });

  const ahmetTrashAfter = store.getTrashItems();
  assert.equal(ahmetTrashAfter.length, 1);
  assert.equal(ahmetTrashAfter[0].title, "Ahmet'in Silinen Notu");

  // Erdal Türk'e dönüldüğünde Ahmet'in sildiği öğe Erdal'ın çöpünde görünmez
  store.loginUser("erdal.turk@kisiseldepo.com", "Erdal Türk");
  const erdalTrashCheck = store.getTrashItems();
  const ahmetNoteInErdal = erdalTrashCheck.find((t) => t.title === "Ahmet'in Silinen Notu");
  assert.equal(ahmetNoteInErdal, undefined, "Ahmet'in çöpü Erdal'da görünmemelidir");
});

test("AUTH-ISO-05: Oturum kapatıldığında isAuthenticated false olur", () => {
  store.loginUser("ahmet.kaya@kisiseldepo.com", "Ahmet Kaya");
  assert.equal(store.getCurrentUser().isAuthenticated, true);

  store.logoutUser();
  assert.equal(store.getCurrentUser().isAuthenticated, false);
});
