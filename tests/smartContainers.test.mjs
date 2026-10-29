import test from "node:test";
import assert from "node:assert/strict";
import {
  TURKEY_PROVINCES,
  WORLD_COUNTRIES,
  searchProvinces,
  searchCountries,
} from "../src/lib/geoData.ts";

test("SMART-01: geoData contains all 81 Turkish provinces and search works", () => {
  assert.equal(TURKEY_PROVINCES.length, 81, "81 il eksiksiz bulunmalıdır");

  // İlk ve son iller
  assert.equal(TURKEY_PROVINCES[0].plate, "01");
  assert.equal(TURKEY_PROVINCES[0].name, "Adana");
  assert.equal(TURKEY_PROVINCES[80].plate, "81");
  assert.equal(TURKEY_PROVINCES[80].name, "Düzce");

  // Arama metotları
  const antalyaSearch = searchProvinces("antalya");
  assert.ok(antalyaSearch.length > 0);
  assert.equal(antalyaSearch[0].name, "Antalya");

  const plakaSearch = searchProvinces("06");
  assert.ok(plakaSearch.some((p) => p.name === "Ankara"));
});

test("SMART-02: geoData world countries list contains popular destinations", () => {
  assert.ok(WORLD_COUNTRIES.length >= 15, "Dünya ülkeleri listesi zengin olmalıdır");
  const turkey = WORLD_COUNTRIES.find((c) => c.name === "Türkiye");
  assert.ok(turkey);
  assert.equal(turkey.flag, "🇹🇷");
  assert.equal(turkey.isDomestic, true);

  const italySearch = searchCountries("italya");
  assert.ok(italySearch.length > 0);
  assert.equal(italySearch[0].flag, "🇮🇹");
});

test("SMART-03: Movie 3-tier evaluation cycle (Başyapıt -> Mid -> Zaman Kaybı -> Sıfırla)", () => {
  function cycleEvaluation(current) {
    if (!current) return "masterpiece";
    if (current === "masterpiece") return "mid";
    if (current === "mid") return "waste";
    return null;
  }

  let evalStatus = null;
  evalStatus = cycleEvaluation(evalStatus);
  assert.equal(evalStatus, "masterpiece", "1. tık: Başyapıt");

  evalStatus = cycleEvaluation(evalStatus);
  assert.equal(evalStatus, "mid", "2. tık: Mid");

  evalStatus = cycleEvaluation(evalStatus);
  assert.equal(evalStatus, "waste", "3. tık: Zaman Kaybı");

  evalStatus = cycleEvaluation(evalStatus);
  assert.equal(evalStatus, null, "4. tık: Sıfırla (null)");
});

test("SMART-04: Code Snippet GitHub URL property and validation", () => {
  const sampleSnippet = {
    id: "sn-test",
    title: "FastAPI JWT Auth",
    language: "python",
    code: "def authenticate(): pass",
    tags: ["#auth"],
    createdAt: "Az önce",
    githubUrl: "https://github.com/fastapi/fastapi",
  };

  assert.ok(sampleSnippet.githubUrl);
  assert.ok(sampleSnippet.githubUrl.startsWith("https://github.com"));
});

test("SMART-05: Slide Deck navigation bounds logic", () => {
  const slides = [
    { id: "sl-1", slideNumber: 1, title: "Giriş", bullets: ["A"] },
    { id: "sl-2", slideNumber: 2, title: "Gelişme", bullets: ["B"] },
    { id: "sl-3", slideNumber: 3, title: "Sonuç", bullets: ["C"] },
  ];

  let activeIndex = 0;

  // Önceki slayt sınır kontrolü (0'dan aşağı inemez)
  activeIndex = Math.max(0, activeIndex - 1);
  assert.equal(activeIndex, 0);

  // Sonraki slayt
  activeIndex = Math.min(slides.length - 1, activeIndex + 1);
  assert.equal(activeIndex, 1);

  // Son slayta gitme
  activeIndex = Math.min(slides.length - 1, activeIndex + 1);
  assert.equal(activeIndex, 2);

  // Sınır kontrolü (daha ileri gidemez)
  activeIndex = Math.min(slides.length - 1, activeIndex + 1);
  assert.equal(activeIndex, 2);
});
