"use client";

import React, { Suspense, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Layers,
  Lock,
  Share2,
  Calendar,
  Clock,
  Star,
  Film,
  FileText,
  AlertOctagon,
  Copy,
  Check,
  ArrowRight,
  Sparkles,
  Eye,
  Trash2,
  Folder,
  X,
  Clapperboard,
  GraduationCap,
  BookOpen,
  FileCheck,
  Download,
} from "lucide-react";
import { isTokenDeleted } from "@/lib/appStore";

interface SharedRecord {
  title: string;
  author: string;
  authorAvatar: string;
  scope: "container" | "item"; // "container" = Deponun Tamamı, "item" = Tek Bir İçerik
  type: "text" | "movie" | "code" | "travel" | "study";
  createdAt: string;
  isActive: boolean;
  isDeleted?: boolean; // Eğer içerik silindiyse otomatik iptal kuralı
  // Tekil içerik alanları
  content?: string;
  wordCount?: number;
  lineCount?: number;
  posterUrl?: string;
  director?: string;
  year?: number;
  rating?: number;
  genres?: string[];
  overview?: string;
  userNote?: string;
  destination?: string;
  country?: string;
  durationDays?: number;
  highlightPlaces?: string[];
  // Kod alanları
  code?: string;
  language?: string;
  tags?: string[];
  // Ders & Çalışma Notu alanları
  courseCode?: string;
  term?: string;
  instructor?: string;
  targetExam?: string;
  examDate?: string;
  daysLeft?: number;
  topics?: string[];
  pdfName?: string;
  pdfPages?: number;
  pdfSize?: string;
  flashcards?: Array<{ question: string; answer: string }>;
  formulaSummary?: string;
  // Tüm depo alanları
  containerDesc?: string;
  containerItems?: Array<{
    id: string;
    title: string;
    year?: number;
    rating?: number;
    posterUrl?: string;
    director?: string;
    overview?: string;
    userNote?: string;
    genres?: string[];
    content?: string;
    folder?: string;
    code?: string;
    language?: string;
    tags?: string[];
    description?: string;
    destination?: string;
    country?: string;
    durationDays?: number;
    highlightPlaces?: string[];
    courseCode?: string;
    term?: string;
    instructor?: string;
    targetExam?: string;
    examDate?: string;
    daysLeft?: number;
    topics?: string[];
    pdfName?: string;
    pdfPages?: number;
    pdfSize?: string;
    flashcards?: Array<{ question: string; answer: string }>;
    formulaSummary?: string;
  }>;
}

const SHARED_DATA: Record<string, SharedRecord> = {
  // 1. DEPONUN TAMAMI PAYLAŞIMI: Film Deposu (Ana sayfadan basıldığında)
  "sinema-kulubu-deposu": {
    title: "Sinema Kulübü & Başyapıtlar",
    author: "Erdal Türk",
    authorAvatar: "ET",
    scope: "container",
    type: "movie",
    createdAt: "Ekim 2026",
    isActive: true,
    containerDesc: "Kişisel sinema arşivim. İzlediğim, favorilediğim ve üzerine notlar aldığım tüm başyapıtlar.",
    containerItems: [
      {
        id: "m1",
        title: "Inception",
        year: 2010,
        director: "Christopher Nolan",
        rating: 8.8,
        genres: ["Bilim Kurgu", "Aksiyon"],
        posterUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=600&q=80",
        overview: "Çok yetenekli bir hırsız olan Dom Cobb, insanların rüyalarına girerek bilinçaltındaki en değerli sırları çalar.",
        userNote: "Zaman kavramının rüyalar katmanında bükülmesi muazzam bir kurgu.",
      },
      {
        id: "m2",
        title: "Interstellar",
        year: 2014,
        director: "Christopher Nolan",
        rating: 8.7,
        genres: ["Bilim Kurgu", "Macera"],
        posterUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80",
        overview: "İnsanlığın Dünya'daki son günleri yaklaşırken, bir grup kaşif insanlık için yaşanabilir yeni bir gezegen arar.",
        userNote: "Yerçekimi, sevgi ve zamanın buluştuğu nokta.",
      },
      {
        id: "m3",
        title: "Dune: Part Two",
        year: 2024,
        director: "Denis Villeneuve",
        rating: 8.5,
        genres: ["Bilim Kurgu", "Macera"],
        posterUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80",
        overview: "Paul Atreides, ailesini yok eden komploculara karşı intikam arayışındayken Fremenlerle güçlerini birleştirir.",
        userNote: "Görsel ve işitsel bir başyapıt.",
      },
      {
        id: "m4",
        title: "Kış Uykusu",
        year: 2014,
        director: "Nuri Bilge Ceylan",
        rating: 8.1,
        genres: ["Dram"],
        posterUrl: "https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=600&q=80",
        overview: "Emekli bir tiyatro oyuncusu olan Aydın, Kapadokya'da babasından kalan butik oteli işletmektedir.",
        userNote: "Altın Palmiye ödüllü başyapıt.",
      },
      {
        id: "m5",
        title: "Spirited Away",
        year: 2001,
        director: "Hayao Miyazaki",
        rating: 8.6,
        genres: ["Animasyon", "Fantastik"],
        posterUrl: "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=600&q=80",
        overview: "10 yaşındaki Chihiro, ailesiyle yeni bir kasabaya taşınırken gizemli bir ruhlar dünyasına adım atar.",
        userNote: "Miyazaki'nin hayal gücünün zirvesi.",
      },
    ],
  },

  // 2. DEPONUN TAMAMI PAYLAŞIMI: Metin Deposu (Ana sayfadan basıldığında)
  "gece-siirleri-deposu": {
    title: "Gece Düşünceleri & Şiirlerim",
    author: "Erdal Türk",
    authorAvatar: "ET",
    scope: "container",
    type: "text",
    createdAt: "Ekim 2026",
    isActive: true,
    containerDesc: "Gece notları, şiir denemeleri ve mimari fikirlerimin tamamı.",
    containerItems: [
      {
        id: "t1",
        title: "Mavi Bir Akşamüstü",
        folder: "Şiirlerim & Dizeler",
        content: "Rüzgâr estiğinde deniz fısıldar,\nUzak kıyılardan kalan bir hatırayı.\nHer dizede biraz kaybolur insan,\nVe her sessizlikte yeniden başlar.",
      },
      {
        id: "t2",
        title: "Kişisel Depo — Mimari Düşünceler",
        folder: "Proje Fikirleri",
        content: "Dağınık dijital varlıkları tek bir merkezde toplamak kullanıcıya inanılmaz bir zihinsel ferahlık sunuyor. Duolingo benzeri mikro etkileşimler ve görsel önizlemeler ile sıkıcı arşiv mantığı tamamen kırılıyor.",
      },
      {
        id: "t3",
        title: "Haftalık Okuma Listesi Notları",
        folder: "Günün Notları",
        content: "1. Tasarım Sistemleri Üzerine Notlar\n2. İnsan Zihninin Dijital Arşivleme Alışkanlıkları\n3. Sadeliğin Gücü ve Minimalist Yazılımlar",
      },
    ],
  },

  // 3. TEKİL İÇERİK PAYLAŞIMI: Tek bir film
  "inception-arsiv": {
    title: "Inception (2010)",
    author: "Erdal Türk",
    authorAvatar: "ET",
    scope: "item",
    type: "movie",
    createdAt: "3 gün önce",
    isActive: true,
    director: "Christopher Nolan",
    year: 2010,
    rating: 8.8,
    genres: ["Bilim Kurgu", "Aksiyon", "Gerilim"],
    posterUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=600&q=80",
    overview: "Çok yetenekli bir hırsız olan Dom Cobb, insanların rüyalarına girerek bilinçaltındaki en değerli sırları çalar. Kendisine verilen imkansız bir görevde zihne fikir eklemesi gerekmektedir.",
    userNote: "Zaman kavramının rüyalar katmanında bükülmesi sinema tarihinin en zeki kurgularından biri. Hans Zimmer müzikleri muazzam.",
  },

  // 4. TEKİL İÇERİK PAYLAŞIMI: Tek bir şiir
  "mavi-aksamustu": {
    title: "Mavi Bir Akşamüstü",
    author: "Erdal Türk",
    authorAvatar: "ET",
    scope: "item",
    type: "text",
    createdAt: "Dün",
    isActive: true,
    content: "Rüzgâr estiğinde deniz fısıldar,\nUzak kıyılardan kalan bir hatırayı.\nHer dizede biraz kaybolur insan,\nVe her sessizlikte yeniden başlar.",
    wordCount: 22,
    lineCount: 4,
  },

  // 5. DEPONUN TAMAMI PAYLAŞIMI: Kod Parçacıkları Deposu (Ana sayfadan basıldığında)
  "kod-parcaciklari-deposu": {
    title: "Frontend & Fullstack Snippet'lar",
    author: "Erdal Türk",
    authorAvatar: "ET",
    scope: "container",
    type: "code",
    createdAt: "Ekim 2026",
    isActive: true,
    containerDesc: "Sık kullandığım API middleware'leri, SQL sorguları, React hook'ları ve Docker şablonlarının salt okunur arşivi.",
    containerItems: [
      {
        id: "sn-1",
        title: "Supabase RLS Policy with Auth Check",
        language: "sql",
        tags: ["#database", "#supabase", "#rls"],
        description: "Kullanıcının sadece kendi depo ve dökümanlarını okuyup güncelleyebilmesini sağlayan RLS kuralı.",
        code: `-- Kullanıcıların yalnızca kendi depolarını görmesini ve düzenlemesini sağlayan RLS kuralı\nALTER TABLE containers ENABLE ROW LEVEL SECURITY;\n\nCREATE POLICY "Users can only access their own containers"\nON containers FOR ALL TO authenticated\nUSING (auth.uid() = user_id)\nWITH CHECK (auth.uid() = user_id);`,
      },
      {
        id: "sn-2",
        title: "FastAPI JWT Bearer Middleware",
        language: "python",
        tags: ["#api", "#auth", "#fastapi"],
        description: "Bearer token kontrolü yapan ve geçersiz oturumlarda 401 Unauthorized fırlatan temiz dependency fonksiyonu.",
        code: `from fastapi import Depends, HTTPException, status\nfrom fastapi.security import HTTPBearer, HTTPAuthorizationCredentials\nimport jwt\n\nsecurity = HTTPBearer()\n\nasync def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):\n    token = credentials.credentials\n    try:\n        payload = jwt.decode(token, "SECRET", algorithms=["HS256"])\n        return payload\n    except jwt.PyJWTError:\n        raise HTTPException(status_code=401, detail="Geçersiz oturum")`,
      },
      {
        id: "sn-3",
        title: "Docker Multi-Stage Next.js Build",
        language: "dockerfile",
        tags: ["#docker", "#nextjs", "#devops"],
        description: "Next.js standalone çıktısını minimale indirgeyen hafif (~120MB) üretim konteyneri.",
        code: `FROM node:20-alpine AS base\nWORKDIR /app\nCOPY package.json package-lock.json ./\nRUN npm ci\nCOPY . .\nRUN npm run build\nEXPOSE 3000\nCMD ["node", "server.js"]`,
      },
    ],
  },

  // 6. DEPONUN TAMAMI PAYLAŞIMI: Gezi & Seyahat Anıları Deposu (Ana sayfadan veya depodan basıldığında)
  "gezi-ve-seyahat-deposu": {
    title: "Gezi & Seyahat Anıları",
    author: "Erdal Türk",
    authorAvatar: "ET",
    scope: "container",
    type: "travel",
    createdAt: "Ekim 2026",
    isActive: true,
    containerDesc: "Keşfettiğim şehirler, seyahat rotalarım, yol anılarım ve gezgin ipuçlarımın tamamı.",
    containerItems: [
      {
        id: "trv-1",
        title: "Yaz 2026 Ege & Akdeniz Gezisi",
        destination: "Kaş, Kalkan & Fethiye",
        country: "Türkiye 🇹🇷",
        durationDays: 8,
        rating: 9.8,
        posterUrl: "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1200&q=80",
        overview: "Turkuaz suların ve antik Likya Yolu patikalarının buluştuğu eşsiz bir yaz rotası. Patara ve Kekova batık şehri büyüleyiciydi.",
        userNote: "Kaş merkezde gün batımı dondurması, Kekova tekne turunda batık şehri kano ile gezmek.",
        highlightPlaces: ["Kaputaş Plajı", "Kekova Batık Şehir", "Patara Kum Tepeleri", "Saklıkent"],
      },
      {
        id: "trv-2",
        title: "Floransa & Toskana Vadisi Rotası",
        destination: "Floransa, Siena & Val d'Orcia",
        country: "İtalya 🇮🇹",
        durationDays: 7,
        rating: 9.7,
        posterUrl: "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1200&q=80",
        overview: "Rönesans sanatının kalbinde yürümek ve servi ağaçlarıyla çevrili tepelerde kaybolmak.",
        userNote: "Uffizi biletlerini önceden alın; Pienza peynir tadımı.",
        highlightPlaces: ["Duomo Katedrali", "Uffizi Galerisi", "Ponte Vecchio", "Pienza"],
      },
      {
        id: "trv-3",
        title: "Kapadokya — Masalsı Bir Sonbahar",
        destination: "Göreme, Uçhisar & Avanos",
        country: "Türkiye 🇹🇷",
        durationDays: 4,
        rating: 9.4,
        posterUrl: "https://images.unsplash.com/photo-1641128324571-a93c347dd943?auto=format&fit=crop&w=1200&q=80",
        overview: "Vadinin üzerinden yükselen yüzlerce renkli balonun yarattığı büyüleyici manzara ve taş oyma otel deneyimi.",
        userNote: "Balon uçuşunu ilk güne alın; testi kebabı deneyin.",
        highlightPlaces: ["Aşk Vadisi", "Uçhisar Kalesi", "Derinkuyu", "Avanos"],
      },
      {
        id: "trv-4",
        title: "Kyoto & Tokyo — Kiraz Çiçekleri Dönemi",
        destination: "Kyoto & Tokyo",
        country: "Japonya 🇯🇵",
        durationDays: 11,
        rating: 9.9,
        posterUrl: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80",
        overview: "Gelenek ve fütürizmin kusursuz uyumu. Zen tapınaklarından Tokyo neonlarına uzanan rüya gibi rota.",
        userNote: "Fushimi Inari'ye sabah 07:00'den önce gidin.",
        highlightPlaces: ["Fushimi Inari", "Arashiyama", "Shibuya", "Kinkaku-ji"],
      },
    ],
  },

  // 7. TEKİL İÇERİK PAYLAŞIMI: Tek bir kod parçacığı
  "snippet-jwt-auth": {
    title: "FastAPI JWT Bearer Middleware",
    author: "Erdal Türk",
    authorAvatar: "ET",
    scope: "item",
    type: "code",
    createdAt: "Dün",
    isActive: true,
    language: "python",
    tags: ["#api", "#auth", "#fastapi", "#jwt"],
    userNote: "Bearer token kontrolü yapan ve geçersiz oturumlarda 401 Unauthorized fırlatan temiz dependency fonksiyonu.",
    code: `from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt

security = HTTPBearer()
SECRET_KEY = "your-personal-secret-key"
ALGORITHM = "HS256"

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Geçersiz token")
        return {"user_id": user_id, "email": payload.get("email")}
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Oturum doğrulaması başarısız oldu",
        )`,
  },

  // 7. TEKİL İÇERİK PAYLAŞIMI: Seyahat & Gezi Rotası
  "ege-akdeniz-gezi-rotasi": {
    title: "Yaz 2026 Ege & Akdeniz Gezisi",
    author: "Erdal Türk",
    authorAvatar: "ET",
    scope: "item",
    type: "travel",
    createdAt: "3 gün önce",
    isActive: true,
    destination: "Kaş, Kalkan & Fethiye",
    country: "Türkiye 🇹🇷",
    durationDays: 8,
    rating: 9.8,
    posterUrl: "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1200&q=80",
    overview: "Turkuaz suların ve antik Likya Yolu patikalarının buluştuğu eşsiz bir yaz rotası. Gün batımını Patara kum tepelerinde izlemek ve Kekova'da şnorkelle antik kalıntıları keşfetmek unutulmazdı.",
    userNote: "Kaputaş'a sabah 08:30'da git, Kekova tekne turunda batık şehri kano ile gez.",
    highlightPlaces: ["Kaputaş Plajı", "Kekova Batık Şehir", "Patara Kum Tepeleri", "Saklıkent Kanyonu", "Meis Adası"],
  },

  // 8. DEPONUN TAMAMI PAYLAŞIMI: Ders & Çalışma Notları Deposu
  "yapay-zeka-ve-algoritmalar-deposu": {
    title: "Yapay Zekâ & Algoritmalar Dersi",
    author: "Erdal Türk",
    authorAvatar: "ET",
    scope: "container",
    type: "study",
    createdAt: "Ekim 2026",
    isActive: true,
    containerDesc: "Yapay zekâ ders notları, algoritma özetleri, vize/final hazırlık kartları ve PDF dökümanları arşivi.",
    containerItems: [
      {
        id: "st-1",
        title: "A* Arama & Heuristic Fonksiyonları",
        courseCode: "CENG 451",
        term: "2026 Güz",
        instructor: "Prof. Dr. Ahmet Yılmaz",
        targetExam: "vize",
        examDate: "14 Kasım 2026",
        daysLeft: 18,
        topics: ["f(n) = g(n) + h(n)", "Admissibility Şartı", "Consistency", "Manhattan Mesafesi"],
        overview: "A* algoritmasının temel matematiksel ispatı, Manhattan ve Euclidean heuristic'lerinin karşılaştırılması. Düğüm genişletme sırası ve optimal rota garantisi.",
        userNote: "Hoca vizede tutarlılık (consistency) ispatını kesin soracak. Formül tablosuna odaklan.",
        pdfName: "A_Star_Search_Lecture_Slides.pdf",
        pdfPages: 28,
        pdfSize: "4.2 MB",
        flashcards: [
          { question: "Heuristic admissibility (kabul edilebilirlik) şartı nedir?", answer: "h(n) değeri, hedefe olan gerçek maliyeti asla aşmamalıdır: h(n) <= h*(n)." },
          { question: "Manhattan vs Euclidean mesafesi ne zaman tercih edilir?", answer: "Sadece 4 yöne (yukarı, aşağı, sağ, sol) hareket izinliyse Manhattan; serbest açılı harekette Euclidean." },
        ],
      },
      {
        id: "st-2",
        title: "Gradient Descent & Backpropagation Temelleri",
        courseCode: "CENG 451",
        term: "2026 Güz",
        instructor: "Prof. Dr. Ahmet Yılmaz",
        targetExam: "vize",
        examDate: "14 Kasım 2026",
        daysLeft: 18,
        topics: ["Zincir Kuralı", "Learning Rate Seçimi", "Momentum", "Adam Optimizer"],
        overview: "Çok katmanlı yapay sinir ağlarında kayıp fonksiyonunun gradyanını hesaplama ve ağırlıkların güncellenmesi. Aşırı öğrenmeyi (overfitting) engelleme stratejileri.",
        userNote: "Zincir kuralı türev adımlarını elle çözme alıştırması yap.",
        pdfName: "Neural_Nets_Backprop_Notes.pdf",
        pdfPages: 34,
        pdfSize: "5.8 MB",
        flashcards: [
          { question: "Öğrenme oranı (learning rate) çok büyük seçilirse ne olur?", answer: "Ağırlık güncellemeleri sapar (divergence meydana gelir) ve minimum noktası ıskalanır." },
          { question: "Overfitting'i engellemenin 3 temel yolu nedir?", answer: "Dropout katmanı eklemek, L1/L2 ağırlık cezalandırma (weight decay) ve Early Stopping." },
        ],
      },
      {
        id: "st-3",
        title: "Dinamik Programlama: Sırt Çantası & En Uzun Alt Dizi",
        courseCode: "CENG 301",
        term: "2026 Güz",
        instructor: "Doç. Dr. Selin Kaya",
        targetExam: "final",
        examDate: "28 Aralık 2026",
        daysLeft: 62,
        topics: ["0/1 Knapsack", "Longest Common Subsequence (LCS)", "Memoization", "Tabulation"],
        overview: "Böl ve yönet yönteminin yetersiz kaldığı örtüşen alt problemler için optimum alt yapı yaklaşımı. Zaman ve bellek karmaşıklığı analizleri.",
        userNote: "Tablo doldurma yönü (bottom-up) matris indekslerine dikkat.",
        pdfName: "Dynamic_Programming_Handout.pdf",
        pdfPages: 22,
        pdfSize: "3.1 MB",
        flashcards: [
          { question: "Dinamik programlamanın 2 temel özelliği nedir?", answer: "1. Optimal alt yapı (Optimal Substructure) 2. Örtüşen alt problemler (Overlapping Subproblems)." },
          { question: "Top-down (Memoization) ile Bottom-up (Tabulation) farkı nedir?", answer: "Memoization özyinelemelidir ve ihtiyaç duyuldukça çözer; Tabulation iteratiftir ve tüm tabloyu sırayla doldurur." },
        ],
      },
      {
        id: "st-4",
        title: "Konvolüsyonel Sinir Ağları (CNN) & Evrişim Katmanları",
        courseCode: "CENG 451",
        term: "2026 Güz",
        instructor: "Prof. Dr. Ahmet Yılmaz",
        targetExam: "final",
        examDate: "5 Ocak 2027",
        daysLeft: 70,
        topics: ["Filtre / Kernel", "Stride & Padding", "Max Pooling", "Receptive Field"],
        overview: "Görsel tanıma için mekansal hiyerarşi çıkaran konvolüsyon katmanları, havuzlama (pooling) yöntemleri ve Flattening aşamaları.",
        userNote: "Çıktı matrisi boyutu formülü: ((W - K + 2P)/S) + 1.",
        pdfName: "CNN_Architecture_Guide.pdf",
        pdfPages: 40,
        pdfSize: "7.4 MB",
        flashcards: [
          { question: "Pooling (Havuzlama) katmanının ana amacı nedir?", answer: "Boyutu ve hesaplama yükünü azaltmak, dönüşüm değişmezliği (translation invariance) sağlamak." },
          { question: "Zero Padding neden kullanılır?", answer: "Köşe piksellerindeki bilginin kaybolmasını önlemek ve çıktı haritasının boyutunu korumak için." },
        ],
      },
    ],
  },

  // 9. TEKİL İÇERİK PAYLAŞIMI: Ders & Çalışma Notu
  "yapay-zeka-ders-notlari": {
    title: "A* Arama & Heuristic Fonksiyonları",
    author: "Erdal Türk",
    authorAvatar: "ET",
    scope: "item",
    type: "study",
    createdAt: "2 gün önce",
    isActive: true,
    courseCode: "CENG 451",
    term: "2026 Güz",
    instructor: "Prof. Dr. Ahmet Yılmaz",
    targetExam: "vize",
    examDate: "14 Kasım 2026",
    daysLeft: 18,
    topics: ["f(n) = g(n) + h(n)", "Admissibility Şartı", "Consistency (Monotonluk)", "Manhattan vs Euclidean Mesafesi"],
    overview: "A* arama algoritmasının adım adım düğüm genişletme mantığı, optimal rota garantisi için gereken admissibility şartı ve tutarlılık teoreminin ispatı.",
    userNote: "Vizede admissibility ispatı kesinlikle soru olarak gelecek. Formül tablosunu ve örnek 8-puzzle matrisini ezberle.",
    pdfName: "A_Star_Search_Lecture_Slides.pdf",
    pdfPages: 28,
    pdfSize: "4.2 MB",
    flashcards: [
      { question: "Heuristic admissibility (kabul edilebilirlik) şartı nedir?", answer: "h(n) değeri, hedefe olan gerçek maliyeti asla aşmamalıdır: h(n) <= h*(n)." },
      { question: "Manhattan vs Euclidean mesafesi ne zaman tercih edilir?", answer: "Sadece 4 yöne (yukarı, aşağı, sağ, sol) hareket izinliyse Manhattan; serbest açılı harekette Euclidean." },
      { question: "Tutarlılık (Consistency / Monotonicity) ne anlama gelir?", answer: "Her n düğümü ve komşusu n' için: h(n) <= c(n, a, n') + h(n'). Tutarlı ise A* asla bir düğümü birden fazla ziyaret etmez." },
    ],
  },

  // 10. SİLİNMİŞ İÇERİK (Otomatik İptal Örneği)
  "silinmis-icerik-ornegi": {
    title: "Eski Taslak Şiir",
    author: "Erdal Türk",
    authorAvatar: "ET",
    scope: "item",
    type: "text",
    createdAt: "1 hafta önce",
    isActive: false,
    isDeleted: true, // Silindiği için otomatik iptal
  },
};

function ShareContent() {
  const params = useParams();
  const token = params?.token as string;
  const item = SHARED_DATA[token];

  const [copied, setCopied] = useState(false);
  const [selectedMoviePreview, setSelectedMoviePreview] = useState<any>(null);
  const [selectedCodePreview, setSelectedCodePreview] = useState<any>(null);
  const [selectedTravelPreview, setSelectedTravelPreview] = useState<any>(null);
  const [selectedStudyPreview, setSelectedStudyPreview] = useState<any>(null);

  const handleCopyText = (text?: string) => {
    if (text) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // 1. Durum: İçerik Silindiği İçin Otomatik İptal Edilmiş Bağlantı (Merkezi Store ile Tam Senkronize!)
  if (isTokenDeleted(token) || (item && item.isDeleted)) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center border border-slate-200 shadow-xl space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
            <Trash2 className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900">
            İçerik Silinmiş
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Bu içerik veya ait olduğu depo sahibi tarafından silindiği için paylaşım bağlantısı otomatik olarak sonlandırılmıştır.
          </p>
          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
            >
              Kişisel Depo'ya Dön
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 2. Durum: Bağlantı Bulunamadı
  if (!item) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center border border-slate-200 shadow-xl space-y-4">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Bağlantı Bulunamadı</h2>
          <p className="text-xs text-slate-500">
            Aradığınız paylaşım bağlantısı mevcut değil veya süresi dolmuş olabilir.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-md hover:bg-indigo-700 transition-colors"
          >
            Kişisel Depo Ana Sayfasına Git
          </Link>
        </div>
      </div>
    );
  }

  // 3. Durum: Sahibi Tarafından Manuel İptal Edilmiş (Revoked) Bağlantı
  if (!item.isActive) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center border border-slate-200 shadow-xl space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-100">
            <AlertOctagon className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900">
            Erişim İptal Edildi
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Bu bağlantının dışarıya erişimi sahibi tarafından kapatılmıştır.
          </p>
          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
            >
              Kişisel Depo'ya Dön
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 4. Durum: BAŞARILI SALT OKUNUR GÖRÜNÜM
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 text-slate-900 font-sans flex flex-col justify-between">
      {/* ÜST BİLGİ ŞERİDİ */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5 sticky top-0 z-30 shadow-xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900">
                  Kişisel Depo
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {item.scope === "container" ? "Tüm Depo Paylaşımı" : "Tekil İçerik Paylaşımı"}
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                Salt Okunur Vitrin (Değişiklik yapılamaz)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center text-white text-[11px] font-bold">
              {item.authorAvatar}
            </div>
            <span>{item.author}</span>
          </div>
        </div>
      </header>

      {/* ANA İÇERİK ALANI */}
      <main className="max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex-1">
        {/* ======================================================== */}
        {/* SENARYO 1: DEPONUN TAMAMI PAYLAŞIMI (scope === "container") */}
        {/* ======================================================== */}
        {item.scope === "container" ? (
          <div className="space-y-8">
            {/* Depo Başlığı & Tanıtım Kartı */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
                  {item.type === "movie"
                    ? "Film & Dizi Deposu"
                    : item.type === "code"
                    ? "Kod Parçacıkları Deposu"
                    : item.type === "travel"
                    ? "Gezi & Seyahat Anıları Deposu"
                    : item.type === "study"
                    ? "Ders & Çalışma Notları Deposu"
                    : "Metin Deposu"}
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
                  {item.title}
                </h1>
                <p className="text-xs text-slate-500 mt-1 max-w-xl">
                  {item.containerDesc}
                </p>
              </div>

              <div className="text-xs font-semibold text-slate-400 shrink-0">
                Toplam {item.containerItems?.length || 0} içerik paylaşımda
              </div>
            </div>

            {/* FİLM DEPOSU TAMAMI VİTRİNİ */}
            {item.type === "movie" && item.containerItems && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {item.containerItems.map((movie) => (
                  <div
                    key={movie.id}
                    onClick={() => setSelectedMoviePreview(movie)}
                    className="group bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-md hover:border-purple-500/60 hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div className="aspect-[2/3] w-full relative overflow-hidden bg-slate-950">
                      <img
                        src={movie.posterUrl}
                        alt={movie.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent p-3 flex flex-col justify-between">
                        <span className="flex items-center gap-1 self-start px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-md text-[10px] font-bold text-amber-400">
                          <Star className="w-3 h-3 fill-amber-400" /> {movie.rating}
                        </span>
                        <div>
                          <div className="text-[10px] text-purple-300 font-bold uppercase">
                            {movie.director}
                          </div>
                          <div className="text-xs font-bold text-white line-clamp-1">
                            {movie.title}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {movie.year}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="p-2.5 bg-slate-900 border-t border-slate-800 text-[11px] text-slate-400 font-medium text-center">
                      Detayları Gör →
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* METİN DEPOSU TAMAMI VİTRİNİ */}
            {item.type === "text" && item.containerItems && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {item.containerItems.map((text) => (
                  <div
                    key={text.id}
                    className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <span className="text-[10px] font-bold uppercase text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                        {text.folder}
                      </span>
                      <h3 className="font-bold text-sm text-slate-900 mt-2">
                        {text.title}
                      </h3>
                      <p className="text-xs text-slate-600 mt-2 italic font-serif leading-relaxed line-clamp-5 whitespace-pre-line">
                        {text.content}
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Salt Okunur</span>
                      <button
                        onClick={() => handleCopyText(text.content)}
                        className="text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-1"
                      >
                        <Copy className="w-3 h-3" />
                        <span>Kopyala</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* KOD DEPOSU TAMAMI VİTRİNİ */}
            {item.type === "code" && item.containerItems && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {item.containerItems.map((codeItem) => (
                  <div
                    key={codeItem.id}
                    onClick={() => setSelectedCodePreview(codeItem)}
                    className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-lg hover:border-emerald-500/50 hover:shadow-emerald-950/20 transition-all flex flex-col justify-between group cursor-pointer text-white"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-800 text-emerald-400 border border-emerald-500/20">
                          {codeItem.language || "Kod"}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyText(codeItem.code);
                          }}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                          title="Kodu Kopyala"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <h3 className="font-bold text-sm text-white group-hover:text-emerald-400 transition-colors line-clamp-1">
                        {codeItem.title}
                      </h3>
                      {codeItem.description && (
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                          {codeItem.description}
                        </p>
                      )}

                      <div className="mt-3 p-3 rounded-xl bg-slate-950 font-mono text-[11px] text-emerald-300 overflow-hidden max-h-28 border border-slate-800/60">
                        <pre className="whitespace-pre font-mono">
                          {codeItem.code}
                        </pre>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                      <span className="text-emerald-400 font-bold group-hover:underline">Detay ve Kodu Gör →</span>
                      <span>Salt Okunur</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* GEZİ & SEYAHAT DEPOSU TAMAMI VİTRİNİ */}
            {item.type === "travel" && item.containerItems && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
                {item.containerItems.map((trv: any) => (
                  <div
                    key={trv.id}
                    onClick={() => setSelectedTravelPreview(trv)}
                    className="group bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:border-amber-400 hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <div className="h-52 w-full relative overflow-hidden bg-slate-100">
                        <img
                          src={trv.posterUrl}
                          alt={trv.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent p-4 flex flex-col justify-between">
                          <div className="flex items-center justify-between">
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/95 text-slate-900 shadow-xs">
                              📍 {trv.destination}
                            </span>
                            {trv.rating && (
                              <span className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-black/60 backdrop-blur-md text-xs font-bold text-amber-400">
                                <Star className="w-3.5 h-3.5 fill-amber-400" /> {trv.rating}
                              </span>
                            )}
                          </div>
                          <div>
                            <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider">
                              {trv.country} • {trv.durationDays} Gün
                            </span>
                            <h3 className="text-base sm:text-lg font-extrabold text-white leading-snug line-clamp-1">
                              {trv.title}
                            </h3>
                          </div>
                        </div>
                      </div>

                      <div className="p-5 space-y-3">
                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                          {trv.overview}
                        </p>

                        {trv.highlightPlaces && trv.highlightPlaces.length > 0 && (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {trv.highlightPlaces.slice(0, 4).map((pl: string, idx: number) => (
                              <span
                                key={idx}
                                className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200/60"
                              >
                                • {pl}
                              </span>
                            ))}
                            {trv.highlightPlaces.length > 4 && (
                              <span className="text-[10px] text-slate-400 font-medium">
                                +{trv.highlightPlaces.length - 4} durak
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-600">
                      <span className="text-amber-600 font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                        Rotayı ve Anıları İncele →
                      </span>
                      <span className="text-[11px] text-slate-400">Salt Okunur</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* DERS & ÇALIŞMA NOTLARI DEPOSU TAMAMI VİTRİNİ */}
            {item.type === "study" && item.containerItems && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
                {item.containerItems.map((studyItem: any) => (
                  <div
                    key={studyItem.id}
                    onClick={() => setSelectedStudyPreview(studyItem)}
                    className="group bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:border-sky-400 hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div className="p-6 space-y-4">
                      {/* Üst Şerit: Ders Kodu, Sınav Türü, Geri Sayım */}
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-extrabold uppercase px-2.5 py-1 rounded-xl bg-sky-50 text-sky-700 border border-sky-200">
                            {studyItem.courseCode || "DERS"}
                          </span>
                          <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600">
                            {studyItem.targetExam === "vize" ? "Vize Notu" : "Final Notu"}
                          </span>
                        </div>

                        {studyItem.daysLeft !== undefined && (
                          <span
                            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                              studyItem.daysLeft <= 20
                                ? "bg-rose-50 text-rose-700 border border-rose-200"
                                : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            }`}
                          >
                            <Clock className="w-3 h-3" />
                            {studyItem.daysLeft} gün kaldı
                          </span>
                        )}
                      </div>

                      {/* Başlık & Eğitmen */}
                      <div>
                        <h3 className="font-extrabold text-base sm:text-lg text-slate-900 group-hover:text-sky-600 transition-colors line-clamp-1">
                          {studyItem.title}
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5 font-medium">
                          {studyItem.instructor} • {studyItem.term}
                        </p>
                      </div>

                      {/* Özet Açıklama */}
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {studyItem.overview}
                      </p>

                      {/* Konu Başlıkları */}
                      {studyItem.topics && studyItem.topics.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {studyItem.topics.slice(0, 3).map((topic: string, idx: number) => (
                            <span
                              key={idx}
                              className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-50 text-slate-600 border border-slate-200/80"
                            >
                              #{topic}
                            </span>
                          ))}
                          {studyItem.topics.length > 3 && (
                            <span className="text-[10px] text-slate-400 font-medium">
                              +{studyItem.topics.length - 3} konu
                            </span>
                          )}
                        </div>
                      )}

                      {/* PDF ve Sınav Kartı Rozetleri */}
                      <div className="pt-2 flex items-center gap-2 text-[11px] text-slate-500 flex-wrap">
                        {studyItem.pdfName && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-50/70 border border-sky-100 text-sky-800 font-medium">
                            <FileText className="w-3.5 h-3.5 text-sky-600" />
                            {studyItem.pdfPages} Sayfa PDF
                          </span>
                        )}
                        {studyItem.flashcards && studyItem.flashcards.length > 0 && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50/70 border border-indigo-100 text-indigo-800 font-medium">
                            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                            {studyItem.flashcards.length} Sınav Kartı
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-600">
                      <span className="text-sky-600 font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                        Ders Notunu & Sınav Kartlarını Aç →
                      </span>
                      <span className="text-[11px] text-slate-400">Salt Okunur</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* ======================================================== */
          /* SENARYO 2: TEK BİR İÇERİK PAYLAŞIMI (scope === "item")    */
          /* ======================================================== */
          <div className="max-w-2xl mx-auto py-8">
            {item.type === "code" ? (
              <div className="bg-slate-900 text-white rounded-3xl border border-slate-800 shadow-2xl overflow-hidden space-y-4 p-6 sm:p-8">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                      {item.language || "Kod Parçacığı"}
                    </span>
                    <span className="text-xs text-slate-400">{item.createdAt}</span>
                  </div>
                  <button
                    onClick={() => handleCopyText(item.code)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors"
                  >
                    {copied ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>{copied ? "Kopyalandı" : "Kodu Kopyala"}</span>
                  </button>
                </div>

                <h1 className="text-2xl font-extrabold text-white">
                  {item.title}
                </h1>

                {item.userNote && (
                  <div className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 text-xs text-slate-300">
                    <span className="font-bold text-emerald-400 block mb-1">
                      {item.author}'ın Kullanım Notu:
                    </span>
                    <p className="italic">"{item.userNote}"</p>
                  </div>
                )}

                <div className="bg-slate-950 rounded-2xl border border-slate-800/80 p-4 font-mono text-xs overflow-x-auto text-emerald-300">
                  <pre className="whitespace-pre font-mono leading-relaxed">{item.code}</pre>
                </div>

                {item.tags && item.tags.length > 0 && (
                  <div className="flex items-center gap-1.5 pt-2 border-t border-slate-800/80 flex-wrap">
                    {item.tags.map((t) => (
                      <span
                        key={t}
                        className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-slate-700/50"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ) : item.type === "text" ? (
              <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xl space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="text-xs font-bold uppercase text-indigo-600">
                    Tekil Şiir / Not
                  </span>
                  <button
                    onClick={() => handleCopyText(item.content)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                  >
                    {copied ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>{copied ? "Kopyalandı" : "Metni Kopyala"}</span>
                  </button>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                  {item.title}
                </h1>
                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 text-base sm:text-lg text-slate-800 font-serif italic leading-relaxed whitespace-pre-line">
                  {item.content}
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-100">
                  <span>{item.wordCount} kelime • {item.lineCount} dize</span>
                  <span>{item.createdAt}</span>
                </div>
              </div>
            ) : item.type === "travel" ? (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md max-w-3xl mx-auto space-y-6">
                <div className="relative h-64 sm:h-80 w-full rounded-2xl overflow-hidden bg-slate-100 shadow-sm">
                  <img
                    src={item.posterUrl || "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1200&q=80"}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute top-4 left-4 flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/95 text-slate-900 shadow-sm">
                      📍 {item.destination || "Kaş, Kalkan & Fethiye"}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-black/40 text-white border border-white/20">
                      {item.country || "Türkiye 🇹🇷"}
                    </span>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                        {item.title}
                      </h2>
                      <p className="text-xs text-white/80 mt-1">
                        {item.durationDays || 8} Günlük Keşif Rotası
                      </p>
                    </div>
                    {item.rating && (
                      <span className="px-3 py-1.5 rounded-xl bg-amber-500 text-white font-extrabold text-sm shadow-md flex items-center gap-1">
                        ★ {item.rating} / 10
                      </span>
                    )}
                  </div>
                </div>

                {item.highlightPlaces && (
                  <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Ziyaret Edilen Duraklar
                    </h4>
                    <div className="flex items-center gap-2 flex-wrap">
                      {item.highlightPlaces.map((place, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold"
                        >
                          • {place}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Seyahat Deneyimi & Anılar
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                    {item.overview}
                  </p>
                </div>

                {item.userNote && (
                  <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/70 text-xs text-amber-950 space-y-1">
                    <span className="font-bold text-amber-800 block">
                      ✨ {item.author}'ın Seyahat Tavsiyesi & İpuçları
                    </span>
                    <p className="italic">"{item.userNote}"</p>
                  </div>
                )}
              </div>
            ) : item.type === "study" ? (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md max-w-3xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-xl text-xs font-extrabold uppercase bg-sky-50 text-sky-700 border border-sky-200">
                      {item.courseCode || "DERS NOTU"}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-700">
                      {item.targetExam === "vize" ? "Vize Hazırlığı" : "Final Hazırlığı"}
                    </span>
                  </div>
                  {item.daysLeft !== undefined && (
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                        item.daysLeft <= 20
                          ? "bg-rose-50 text-rose-700 border border-rose-200"
                          : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      Sınava {item.daysLeft} Gün Kaldı
                    </span>
                  )}
                </div>

                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                    {item.title}
                  </h1>
                  <p className="text-xs text-slate-500 mt-1 font-medium">
                    {item.instructor} • {item.term} • Sınav Tarihi: {item.examDate || "Kasım 2026"}
                  </p>
                </div>

                {item.topics && item.topics.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Kapsanan Konu Başlıkları
                    </h4>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {item.topics.map((t, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-lg bg-sky-50 border border-sky-200 text-sky-900 text-xs font-semibold"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Ders & Konu Özeti
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-5 rounded-2xl border border-slate-200/80">
                    {item.overview}
                  </p>
                </div>

                {item.userNote && (
                  <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/70 text-xs text-amber-950 space-y-1">
                    <span className="font-bold text-amber-800 block">
                      📌 Sınav İpucu & Önemli Vurgular
                    </span>
                    <p className="italic">"{item.userNote}"</p>
                  </div>
                )}

                {item.flashcards && item.flashcards.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                        Sınav Soru - Cevap Kartları ({item.flashcards.length})
                      </h4>
                    </div>
                    <div className="grid grid-cols-1 gap-2.5">
                      {item.flashcards.map((fc, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-2xl bg-indigo-50/40 border border-indigo-100 text-xs space-y-1.5"
                        >
                          <span className="font-bold text-indigo-900 block">
                            Soru: {fc.question}
                          </span>
                          <p className="text-slate-700 font-medium bg-white p-2.5 rounded-xl border border-indigo-100/60">
                            Cevap: {fc.answer}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {item.pdfName && (
                  <div className="p-4 rounded-2xl bg-sky-50/50 border border-sky-200/70 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <h5 className="font-bold text-xs text-slate-900 line-clamp-1">
                          {item.pdfName}
                        </h5>
                        <p className="text-[11px] text-slate-500">
                          {item.pdfPages} Sayfa • {item.pdfSize} • Ders Slaytı
                        </p>
                      </div>
                    </div>
                    <span className="px-3 py-1.5 rounded-xl bg-sky-100 text-sky-800 text-xs font-bold shrink-0">
                      Salt Okunur Ek
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-slate-900 text-white rounded-3xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col sm:flex-row">
                <div className="sm:w-2/5 aspect-[2/3] relative shrink-0">
                  <img
                    src={item.posterUrl}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="text-xs text-purple-400 font-bold mb-1">
                      {item.year} • {item.director}
                    </div>
                    <h1 className="text-2xl font-extrabold text-white">
                      {item.title}
                    </h1>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="flex items-center gap-1 text-xs font-bold text-amber-400 bg-black/40 px-2 py-0.5 rounded-md">
                        <Star className="w-3 h-3 fill-amber-400" /> {item.rating}
                      </span>
                      <span className="text-xs text-slate-400">{item.genres?.join(", ")}</span>
                    </div>
                    <p className="text-xs text-slate-300 mt-4 leading-relaxed">
                      {item.overview}
                    </p>
                  </div>

                  {item.userNote && (
                    <div className="p-3.5 rounded-2xl bg-purple-950/40 border border-purple-500/30">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300 block mb-1">
                        {item.author}'ın Arşiv Notu
                      </span>
                      <p className="text-xs text-slate-200 italic">"{item.userNote}"</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* TÜM DEPO İÇİNDEN FİLM DETAYI MODALI */}
      {selectedMoviePreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setSelectedMoviePreview(null)}
            className="fixed inset-0 bg-black/75 backdrop-blur-xs"
          />
          <div className="relative w-full max-w-xl bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 shadow-2xl z-10 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={selectedMoviePreview.posterUrl}
                  alt={selectedMoviePreview.title}
                  className="w-16 h-24 object-cover rounded-xl"
                />
                <div>
                  <h3 className="font-extrabold text-lg text-white">
                    {selectedMoviePreview.title} ({selectedMoviePreview.year})
                  </h3>
                  <p className="text-xs text-purple-400 font-semibold">
                    Yönetmen: {selectedMoviePreview.director}
                  </p>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-400 mt-1">
                    <Star className="w-3 h-3 fill-amber-400" /> {selectedMoviePreview.rating}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedMoviePreview(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {selectedMoviePreview.overview}
            </p>
            {selectedMoviePreview.userNote && (
              <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/20 text-xs italic text-slate-200">
                "{selectedMoviePreview.userNote}"
              </div>
            )}
          </div>
        </div>
      )}

      {/* TÜM DEPO İÇİNDEN KOD DETAYI MODALI */}
      {selectedCodePreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setSelectedCodePreview(null)}
            className="fixed inset-0 bg-black/80 backdrop-blur-xs"
          />
          <div className="relative w-full max-w-3xl bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 shadow-2xl z-10 space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                  {selectedCodePreview.language || "Kod"}
                </span>
                <h3 className="font-extrabold text-lg text-white mt-1">
                  {selectedCodePreview.title}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopyText(selectedCodePreview.code)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "Kopyalandı" : "Kodu Kopyala"}</span>
                </button>
                <button
                  onClick={() => setSelectedCodePreview(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {selectedCodePreview.description && (
              <p className="text-xs text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800">
                {selectedCodePreview.description}
              </p>
            )}

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 font-mono text-xs text-emerald-300 overflow-auto flex-1 leading-relaxed">
              <pre className="whitespace-pre font-mono">{selectedCodePreview.code}</pre>
            </div>
          </div>
        </div>
      )}

      {/* TÜM DEPO İÇİNDEN SEYAHAT DETAYI MODALI */}
      {selectedTravelPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setSelectedTravelPreview(null)}
            className="fixed inset-0 bg-black/75 backdrop-blur-xs"
          />
          <div className="relative w-full max-w-2xl bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-2xl z-10 max-h-[90vh] flex flex-col">
            <div className="relative h-60 sm:h-72 w-full bg-slate-900 shrink-0">
              <img
                src={selectedTravelPreview.posterUrl}
                alt={selectedTravelPreview.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
              <button
                onClick={() => setSelectedTravelPreview(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                <div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-white text-slate-900 shadow-xs mb-1 inline-block">
                    📍 {selectedTravelPreview.destination} • {selectedTravelPreview.country}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-white">
                    {selectedTravelPreview.title}
                  </h3>
                  <p className="text-xs text-white/80 mt-0.5">
                    {selectedTravelPreview.durationDays} Günlük Rota
                  </p>
                </div>
                {selectedTravelPreview.rating && (
                  <span className="px-3 py-1.5 rounded-xl bg-amber-500 text-white font-extrabold text-sm shadow-md flex items-center gap-1 shrink-0">
                    ★ {selectedTravelPreview.rating}
                  </span>
                )}
              </div>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              {selectedTravelPreview.highlightPlaces && (
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Duraklar & Ziyaret Edilen Noktalar
                  </h4>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {selectedTravelPreview.highlightPlaces.map((pl: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium"
                      >
                        • {pl}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Seyahat Notları & Deneyim
                </h4>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                  {selectedTravelPreview.overview}
                </p>
              </div>

              {selectedTravelPreview.userNote && (
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/70 text-xs text-amber-950 space-y-1">
                  <span className="font-bold text-amber-800 block">
                    ✨ Gezgin Tavsiyesi & İpuçları
                  </span>
                  <p className="italic">"{selectedTravelPreview.userNote}"</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TÜM DEPO İÇİNDEN DERS NOTU VE SINAV KARTI DETAYI MODALI */}
      {selectedStudyPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setSelectedStudyPreview(null)}
            className="fixed inset-0 bg-black/75 backdrop-blur-xs"
          />
          <div className="relative w-full max-w-2xl bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-2xl z-10 max-h-[90vh] flex flex-col">
            <div className="p-6 bg-gradient-to-r from-sky-600 to-blue-700 text-white shrink-0 relative">
              <button
                onClick={() => setSelectedStudyPreview(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/20 text-white hover:bg-black/40 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold uppercase bg-white/20 backdrop-blur-md">
                  {selectedStudyPreview.courseCode || "DERS NOTU"}
                </span>
                <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold uppercase bg-sky-900/60">
                  {selectedStudyPreview.targetExam === "vize" ? "Vize Notu" : "Final Notu"}
                </span>
                {selectedStudyPreview.daysLeft !== undefined && (
                  <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-amber-400 text-amber-950 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {selectedStudyPreview.daysLeft} gün kaldı
                  </span>
                )}
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-white">
                {selectedStudyPreview.title}
              </h3>
              <p className="text-xs text-sky-100 mt-1 font-medium">
                {selectedStudyPreview.instructor} • {selectedStudyPreview.term}
              </p>
            </div>

            <div className="p-6 overflow-y-auto space-y-5">
              {selectedStudyPreview.topics && (
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Konu Başlıkları
                  </h4>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {selectedStudyPreview.topics.map((t: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-sky-50 border border-sky-200 text-sky-900 text-xs font-medium"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Ders & Konu Özeti
                </h4>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                  {selectedStudyPreview.overview}
                </p>
              </div>

              {selectedStudyPreview.userNote && (
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/70 text-xs text-amber-950 space-y-1">
                  <span className="font-bold text-amber-800 block">
                    📌 Sınav İpucu & Önemli Vurgular
                  </span>
                  <p className="italic">"{selectedStudyPreview.userNote}"</p>
                </div>
              )}

              {selectedStudyPreview.flashcards && selectedStudyPreview.flashcards.length > 0 && (
                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    Sınav Soru - Cevap Kartları ({selectedStudyPreview.flashcards.length})
                  </h4>
                  <div className="space-y-2">
                    {selectedStudyPreview.flashcards.map((fc: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-2xl bg-indigo-50/40 border border-indigo-100 text-xs space-y-1"
                      >
                        <span className="font-bold text-indigo-950 block">S: {fc.question}</span>
                        <p className="text-slate-700 font-medium bg-white p-2 rounded-xl border border-indigo-100/50">
                          C: {fc.answer}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedStudyPreview.pdfName && (
                <div className="p-4 rounded-2xl bg-sky-50/50 border border-sky-200/70 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="font-bold text-xs text-slate-900 line-clamp-1">
                        {selectedStudyPreview.pdfName}
                      </h5>
                      <p className="text-[11px] text-slate-500">
                        {selectedStudyPreview.pdfPages} Sayfa • {selectedStudyPreview.pdfSize} • Ders Slaytı
                      </p>
                    </div>
                  </div>
                  <span className="px-3 py-1.5 rounded-xl bg-sky-100 text-sky-800 text-xs font-bold shrink-0">
                    Salt Okunur Ek
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ALT ÇAĞRI (FOOTER) */}
      <footer className="py-6 text-center text-xs text-slate-500 border-t border-slate-200 bg-white">
        <div className="max-w-md mx-auto space-y-2 px-4">
          <p>
            Kişisel Dijital Depo — Kişisel arşivinizi tek merkezde güvenle toplayın.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-indigo-600 hover:text-indigo-700 font-bold"
          >
            <span>Kişisel Depo'yu Keşfet</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </footer>
    </div>
  );
}

export default function ShareViewPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center text-xs text-slate-400">
          Paylaşım yükleniyor...
        </div>
      }
    >
      <ShareContent />
    </Suspense>
  );
}
