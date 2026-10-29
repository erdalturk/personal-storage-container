/**
 * Türkiye 81 İl ve Dünya Ülkeleri Kütüğü (GeoData)
 * PM-CONTROL Satır 68: Güvenilir Şehir ve Ülke Ototamamlayıcı (Autocomplete)
 */

export interface ProvinceItem {
  plate: string;
  name: string;
}

export interface CountryItem {
  name: string;
  flag: string;
  isDomestic?: boolean;
}

export const TURKEY_PROVINCES: ProvinceItem[] = [
  { plate: "01", name: "Adana" },
  { plate: "02", name: "Adıyaman" },
  { plate: "03", name: "Afyonkarahisar" },
  { plate: "04", name: "Ağrı" },
  { plate: "05", name: "Amasya" },
  { plate: "06", name: "Ankara" },
  { plate: "07", name: "Antalya" },
  { plate: "08", name: "Artvin" },
  { plate: "09", name: "Aydın" },
  { plate: "10", name: "Balıkesir" },
  { plate: "11", name: "Bilecik" },
  { plate: "12", name: "Bingöl" },
  { plate: "13", name: "Bitlis" },
  { plate: "14", name: "Bolu" },
  { plate: "15", name: "Burdur" },
  { plate: "16", name: "Bursa" },
  { plate: "17", name: "Çanakkale" },
  { plate: "18", name: "Çankırı" },
  { plate: "19", name: "Çorum" },
  { plate: "20", name: "Denizli" },
  { plate: "21", name: "Diyarbakır" },
  { plate: "22", name: "Edirne" },
  { plate: "23", name: "Elazığ" },
  { plate: "24", name: "Erzincan" },
  { plate: "25", name: "Erzurum" },
  { plate: "26", name: "Eskişehir" },
  { plate: "27", name: "Gaziantep" },
  { plate: "28", name: "Giresun" },
  { plate: "29", name: "Gümüşhane" },
  { plate: "30", name: "Hakkâri" },
  { plate: "31", name: "Hatay" },
  { plate: "32", name: "Isparta" },
  { plate: "33", name: "Mersin" },
  { plate: "34", name: "İstanbul" },
  { plate: "35", name: "İzmir" },
  { plate: "36", name: "Kars" },
  { plate: "37", name: "Kastamonu" },
  { plate: "38", name: "Kayseri" },
  { plate: "39", name: "Kırklareli" },
  { plate: "40", name: "Kırşehir" },
  { plate: "41", name: "Kocaeli" },
  { plate: "42", name: "Konya" },
  { plate: "43", name: "Kütahya" },
  { plate: "44", name: "Malatya" },
  { plate: "45", name: "Manisa" },
  { plate: "46", name: "Kahramanmaraş" },
  { plate: "47", name: "Mardin" },
  { plate: "48", name: "Muğla" },
  { plate: "49", name: "Muş" },
  { plate: "50", name: "Nevşehir" },
  { plate: "51", name: "Niğde" },
  { plate: "52", name: "Ordu" },
  { plate: "53", name: "Rize" },
  { plate: "54", name: "Sakarya" },
  { plate: "55", name: "Samsun" },
  { plate: "56", name: "Siirt" },
  { plate: "57", name: "Sinop" },
  { plate: "58", name: "Sivas" },
  { plate: "59", name: "Tekirdağ" },
  { plate: "60", name: "Tokat" },
  { plate: "61", name: "Trabzon" },
  { plate: "62", name: "Tunceli" },
  { plate: "63", name: "Şanlıurfa" },
  { plate: "64", name: "Uşak" },
  { plate: "65", name: "Van" },
  { plate: "66", name: "Yozgat" },
  { plate: "67", name: "Zonguldak" },
  { plate: "68", name: "Aksaray" },
  { plate: "69", name: "Bayburt" },
  { plate: "70", name: "Karaman" },
  { plate: "71", name: "Kırıkkale" },
  { plate: "72", name: "Batman" },
  { plate: "73", name: "Şırnak" },
  { plate: "74", name: "Bartın" },
  { plate: "75", name: "Ardahan" },
  { plate: "76", name: "Iğdır" },
  { plate: "77", name: "Yalova" },
  { plate: "78", name: "Karabük" },
  { plate: "79", name: "Kilis" },
  { plate: "80", name: "Osmaniye" },
  { plate: "81", name: "Düzce" },
];

export const WORLD_COUNTRIES: CountryItem[] = [
  { name: "Türkiye", flag: "🇹🇷", isDomestic: true },
  { name: "İtalya", flag: "🇮🇹" },
  { name: "İspanya", flag: "🇪🇸" },
  { name: "Fransa", flag: "🇫🇷" },
  { name: "Yunanistan", flag: "🇬🇷" },
  { name: "Almanya", flag: "🇩🇪" },
  { name: "Portekiz", flag: "🇵🇹" },
  { name: "İngiltere", flag: "🇬🇧" },
  { name: "Japonya", flag: "🇯🇵" },
  { name: "Amerika Birleşik Devletleri", flag: "🇺🇸" },
  { name: "İsviçre", flag: "🇨🇭" },
  { name: "Avusturya", flag: "🇦🇹" },
  { name: "Hollanda", flag: "🇳🇱" },
  { name: "Gürcistan", flag: "🇬🇪" },
  { name: "Hırvatistan", flag: "🇭🇷" },
  { name: "Karadağ", flag: "🇲🇪" },
  { name: "Norveç", flag: "🇳🇴" },
  { name: "İzlanda", flag: "🇮🇸" },
  { name: "Mısır", flag: "🇪🇬" },
  { name: "Fas", flag: "🇲🇦" },
];

export function normalizeTurkish(text: string): string {
  return text
    .replace(/İ/g, "i")
    .replace(/I/g, "ı")
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function searchProvinces(query: string): ProvinceItem[] {
  if (!query || query.trim().length === 0) return TURKEY_PROVINCES.slice(0, 8);
  const q = normalizeTurkish(query.trim());
  return TURKEY_PROVINCES.filter(
    (p) => normalizeTurkish(p.name).includes(q) || p.plate.includes(q)
  );
}

export function searchCountries(query: string): CountryItem[] {
  if (!query || query.trim().length === 0) return WORLD_COUNTRIES.slice(0, 8);
  const q = normalizeTurkish(query.trim());
  return WORLD_COUNTRIES.filter((c) => normalizeTurkish(c.name).includes(q));
}
