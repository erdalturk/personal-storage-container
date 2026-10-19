"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  addToTrash,
  getStoredCollection,
  saveStoredCollection,
} from "@/lib/appStore";
import {
  ArrowLeft,
  Search,
  Plus,
  GraduationCap,
  Calendar,
  Clock,
  Star,
  Heart,
  Share2,
  Trash2,
  ExternalLink,
  RotateCcw,
  SlidersHorizontal,
  X,
  FileText,
  Check,
  CheckCircle2,
  Sparkles,
  BookOpen,
  Download,
  Eye,
  Tag,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  FolderArchive,
  Layers,
  HelpCircle,
} from "lucide-react";

export type ExamType = "vize" | "final" | "but" | "genel";
export type PriorityLevel = "yuksek" | "orta" | "dusuk";
export type StudyStatus = "tamamlandi" | "calisiliyor" | "tekrar_edilecek";

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
}

export interface CourseStudyNote {
  id: string;
  courseCode: string;
  courseName: string;
  term: string;
  instructor: string;
  targetExam: ExamType;
  examDate: string;
  daysLeft: number;
  title: string;
  topics: string[];
  summary: string;
  keyFormulas?: string;
  pdfAttachment?: {
    name: string;
    pages: number;
    size: string;
    previewText?: string;
  };
  flashcards: Flashcard[];
  priority: PriorityLevel;
  status: StudyStatus;
  isFavorite: boolean;
  colorTheme: "sky" | "indigo" | "emerald" | "amber" | "violet";
}

const INITIAL_STUDY_NOTES: CourseStudyNote[] = [
  {
    id: "st-1",
    courseCode: "CENG 451",
    courseName: "Yapay Zekâ & Makine Öğrenimi",
    term: "2026 Güz",
    instructor: "Prof. Dr. Ahmet Yılmaz",
    targetExam: "vize",
    examDate: "14 Kasım 2026",
    daysLeft: 18,
    title: "A* Arama & Heuristic Fonksiyonları",
    topics: ["f(n) = g(n) + h(n)", "Admissibility Şartı", "Consistency", "Manhattan Mesafesi"],
    summary:
      "A* algoritmasının temel matematiksel ispatı, Manhattan ve Euclidean heuristic'lerinin karşılaştırılması. Düğüm genişletme sırası ve optimal rota garantisi için gereken koşullar.",
    keyFormulas: "f(n) = g(n) + h(n)\nAdmissibility: h(n) <= h*(n)\nConsistency: h(n) <= c(n, a, n') + h(n')",
    pdfAttachment: {
      name: "A_Star_Search_Lecture_Slides.pdf",
      pages: 28,
      size: "4.2 MB",
      previewText: "A* Arama Algoritması: Bilgilendirilmiş Arama Stratejileri ve Heuristic Değerlendirme...",
    },
    flashcards: [
      {
        id: "fc-1",
        question: "Heuristic admissibility (kabul edilebilirlik) şartı nedir?",
        answer: "h(n) değeri, hedefe olan gerçek maliyeti asla aşmamalıdır: h(n) <= h*(n).",
      },
      {
        id: "fc-2",
        question: "Manhattan vs Euclidean mesafesi ne zaman tercih edilir?",
        answer: "Sadece 4 yöne (yukarı, aşağı, sağ, sol) ızgara hareketi izinliyse Manhattan; serbest açılı harekette Euclidean.",
      },
      {
        id: "fc-3",
        question: "A* algoritmasında Consistency (Monotonluk) ne sağlar?",
        answer: "Tutarlı bir heuristic kullanıldığında A* her düğümü en fazla bir kez genişletir (kapalı kümedeki düğümler yeniden açılmaz).",
      },
    ],
    priority: "yuksek",
    status: "calisiliyor",
    isFavorite: true,
    colorTheme: "sky",
  },
  {
    id: "st-2",
    courseCode: "CENG 451",
    courseName: "Yapay Zekâ & Makine Öğrenimi",
    term: "2026 Güz",
    instructor: "Prof. Dr. Ahmet Yılmaz",
    targetExam: "vize",
    examDate: "14 Kasım 2026",
    daysLeft: 18,
    title: "Gradient Descent & Backpropagation Temelleri",
    topics: ["Zincir Kuralı", "Learning Rate Seçimi", "Momentum", "Adam Optimizer"],
    summary:
      "Çok katmanlı yapay sinir ağlarında kayıp fonksiyonunun gradyanını hesaplama ve ağırlıkların güncellenmesi. Aşırı öğrenmeyi (overfitting) engelleme stratejileri.",
    keyFormulas: "w = w - η * (∂L / ∂w)\nChain Rule: (∂L / ∂w1) = (∂L / ∂y) * (∂y / ∂h) * (∂h / ∂w1)",
    pdfAttachment: {
      name: "Neural_Nets_Backprop_Notes.pdf",
      pages: 34,
      size: "5.8 MB",
      previewText: "Geriye Yayılım (Backpropagation) ve Gradyan İnişi: Matematiksel Türetimler...",
    },
    flashcards: [
      {
        id: "fc-4",
        question: "Öğrenme oranı (learning rate) çok büyük seçilirse ne olur?",
        answer: "Ağırlık güncellemeleri sapar (divergence meydana gelir) ve minimum noktası ıskalanır.",
      },
      {
        id: "fc-5",
        question: "Overfitting'i engellemenin 3 temel yöntemi nedir?",
        answer: "1. Dropout katmanı eklemek, 2. L1/L2 ağırlık cezalandırma (weight decay), 3. Early Stopping (erken durdurma).",
      },
    ],
    priority: "yuksek",
    status: "calisiliyor",
    isFavorite: true,
    colorTheme: "indigo",
  },
  {
    id: "st-3",
    courseCode: "CENG 301",
    courseName: "Algoritma Analizi & Tasarımı",
    term: "2026 Güz",
    instructor: "Doç. Dr. Selin Kaya",
    targetExam: "final",
    examDate: "28 Aralık 2026",
    daysLeft: 62,
    title: "Dinamik Programlama: Sırt Çantası & En Uzun Alt Dizi",
    topics: ["0/1 Knapsack", "Longest Common Subsequence (LCS)", "Memoization", "Tabulation"],
    summary:
      "Böl ve yönet yönteminin yetersiz kaldığı örtüşen alt problemler için optimum alt yapı yaklaşımı. Zaman ve bellek karmaşıklığı analizleri.",
    keyFormulas: "dp[i][w] = max(dp[i-1][w], val[i] + dp[i-1][w - wt[i]])",
    pdfAttachment: {
      name: "Dynamic_Programming_Handout.pdf",
      pages: 22,
      size: "3.1 MB",
      previewText: "Dinamik Programlama: Optimal Alt Yapı ve Örtüşen Alt Problemler...",
    },
    flashcards: [
      {
        id: "fc-6",
        question: "Dinamik programlamanın 2 temel özelliği nedir?",
        answer: "1. Optimal alt yapı (Optimal Substructure) 2. Örtüşen alt problemler (Overlapping Subproblems).",
      },
      {
        id: "fc-7",
        question: "Top-down (Memoization) ile Bottom-up (Tabulation) farkı nedir?",
        answer: "Memoization özyinelemelidir ve ihtiyaç duyuldukça çözer; Tabulation iteratiftir ve tabloyu sırayla doldurur.",
      },
    ],
    priority: "orta",
    status: "tamamlandi",
    isFavorite: false,
    colorTheme: "emerald",
  },
  {
    id: "st-4",
    courseCode: "CENG 451",
    courseName: "Yapay Zekâ & Makine Öğrenimi",
    term: "2026 Güz",
    instructor: "Prof. Dr. Ahmet Yılmaz",
    targetExam: "final",
    examDate: "5 Ocak 2027",
    daysLeft: 70,
    title: "Konvolüsyonel Sinir Ağları (CNN) & Evrişim Katmanları",
    topics: ["Filtre / Kernel", "Stride & Padding", "Max Pooling", "Receptive Field"],
    summary:
      "Görsel tanıma için mekansal hiyerarşi çıkaran konvolüsyon katmanları, havuzlama (pooling) yöntemleri ve tam bağlantılı (dense) katmana aktarım aşamaları.",
    keyFormulas: "Çıktı Boyutu = ((W - K + 2P) / S) + 1",
    pdfAttachment: {
      name: "CNN_Architecture_Guide.pdf",
      pages: 40,
      size: "7.4 MB",
      previewText: "CNN Mimarileri: LeNet, AlexNet, VGG ve ResNet Kalıntı Blokları...",
    },
    flashcards: [
      {
        id: "fc-8",
        question: "Pooling (Havuzlama) katmanının ana amacı nedir?",
        answer: "Boyutu ve hesaplama yükünü azaltmak, dönüşüm değişmezliği (translation invariance) sağlamak.",
      },
      {
        id: "fc-9",
        question: "Zero Padding neden kullanılır?",
        answer: "Köşe piksellerindeki bilginin kaybolmasını önlemek ve çıktı haritasının boyutunu korumak için.",
      },
    ],
    priority: "orta",
    status: "tekrar_edilecek",
    isFavorite: true,
    colorTheme: "violet",
  },
  {
    id: "st-5",
    courseCode: "CENG 412",
    courseName: "Dağıtık Sistemler",
    term: "2026 Güz",
    instructor: "Prof. Dr. Murat Demir",
    targetExam: "vize",
    examDate: "20 Kasım 2026",
    daysLeft: 24,
    title: "Raft Konsensus & Lider Seçimi Protokolü",
    topics: ["Leader Election", "Log Replication", "Term Numarası", "Split Vote"],
    summary:
      "Dağıtık düğümler arasında veri tutarlılığını garanti altına alan Raft algoritmasının çalışma prensibi. Lider, Takipçi ve Aday durumları arasındaki geçişler.",
    keyFormulas: "Çoğunluk (Quorum) = ⌊N/2⌋ + 1",
    pdfAttachment: {
      name: "Raft_Consensus_Explained.pdf",
      pages: 18,
      size: "2.4 MB",
      previewText: "In Search of an Understandable Consensus Algorithm (Raft Summary)...",
    },
    flashcards: [
      {
        id: "fc-10",
        question: "Raft'ta Split Vote (oy bölünmesi) nasıl engellenir?",
        answer: "Rastgele seçilen seçim zaman aşımı (randomized election timeout, 150-300ms) süreleri kullanılarak.",
      },
    ],
    priority: "yuksek",
    status: "calisiliyor",
    isFavorite: false,
    colorTheme: "amber",
  },
];

export default function StudyContainerPage() {
  const [notes, setNotes] = useState<CourseStudyNote[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "vize" | "final" | "urgent" | "pdf" | "favorites">("all");
  const [sortBy, setSortBy] = useState<"examDate" | "priority" | "title">("examDate");

  // Detay & Düzenleme Modalları
  const [selectedNote, setSelectedNote] = useState<CourseStudyNote | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<CourseStudyNote | null>(null);

  // Flashcards (Ezber Kartları) Çalışma Modalı
  const [flashcardStudyNote, setFlashcardStudyNote] = useState<CourseStudyNote | null>(null);
  const [activeFlashcardIndex, setActiveFlashcardIndex] = useState(0);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);

  // PDF Doküman Önizleme Modalı
  const [pdfPreviewNote, setPdfPreviewNote] = useState<CourseStudyNote | null>(null);

  // Form State'leri
  const [formCourseCode, setFormCourseCode] = useState("");
  const [formCourseName, setFormCourseName] = useState("");
  const [formTerm, setFormTerm] = useState("2026 Güz");
  const [formInstructor, setFormInstructor] = useState("");
  const [formTargetExam, setFormTargetExam] = useState<ExamType>("vize");
  const [formExamDate, setFormExamDate] = useState("20 Kasım 2026");
  const [formDaysLeft, setFormDaysLeft] = useState("20");
  const [formTitle, setFormTitle] = useState("");
  const [formTopics, setFormTopics] = useState("");
  const [formSummary, setFormSummary] = useState("");
  const [formKeyFormulas, setFormKeyFormulas] = useState("");
  const [formPdfName, setFormPdfName] = useState("");
  const [formPdfPages, setFormPdfPages] = useState("25");
  const [formPriority, setFormPriority] = useState<PriorityLevel>("yuksek");
  const [formStatus, setFormStatus] = useState<StudyStatus>("calisiliyor");

  // Paylaşım & Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [deletedBackup, setDeletedBackup] = useState<CourseStudyNote | null>(null);

  // Merkezi Store ile Senkronizasyon
  useEffect(() => {
    setNotes(getStoredCollection("study", INITIAL_STUDY_NOTES));

    const handleUpdate = () => {
      setNotes(getStoredCollection("study", INITIAL_STUDY_NOTES));
    };

    window.addEventListener("psc-store-updated", handleUpdate);
    return () => window.removeEventListener("psc-store-updated", handleUpdate);
  }, []);

  // İstatistikler
  const totalFlashcardsCount = useMemo(() => {
    return notes.reduce((acc, n) => acc + n.flashcards.length, 0);
  }, [notes]);

  const urgentExamsCount = useMemo(() => {
    return notes.filter((n) => n.daysLeft <= 25).length;
  }, [notes]);

  const pdfCount = useMemo(() => {
    return notes.filter((n) => Boolean(n.pdfAttachment)).length;
  }, [notes]);

  // Filtreleme & Sıralama
  const filteredNotes = useMemo(() => {
    return notes
      .filter((n) => {
        // Arama filtresi
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const inCode = n.courseCode.toLowerCase().includes(q);
          const inName = n.courseName.toLowerCase().includes(q);
          const inTitle = n.title.toLowerCase().includes(q);
          const inInstructor = n.instructor.toLowerCase().includes(q);
          const inTopics = n.topics.some((t) => t.toLowerCase().includes(q));
          const inSummary = n.summary.toLowerCase().includes(q);
          if (!inCode && !inName && !inTitle && !inInstructor && !inTopics && !inSummary) return false;
        }

        // Sekme filtresi
        if (activeTab === "vize") return n.targetExam === "vize";
        if (activeTab === "final") return n.targetExam === "final";
        if (activeTab === "urgent") return n.daysLeft <= 25;
        if (activeTab === "pdf") return Boolean(n.pdfAttachment);
        if (activeTab === "favorites") return n.isFavorite;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "examDate") return a.daysLeft - b.daysLeft;
        if (sortBy === "title") return a.title.localeCompare(b.title);
        if (sortBy === "priority") {
          const pMap: Record<PriorityLevel, number> = { yuksek: 3, orta: 2, dusuk: 1 };
          return pMap[b.priority] - pMap[a.priority];
        }
        return 0;
      });
  }, [notes, searchQuery, activeTab, sortBy]);

  // 1-Tıkla Favorileme (Toggle)
  const toggleFavorite = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const updated = notes.map((n) =>
      n.id === id ? { ...n, isFavorite: !n.isFavorite } : n
    );
    setNotes(updated);
    saveStoredCollection("study", updated);
    if (selectedNote && selectedNote.id === id) {
      setSelectedNote({ ...selectedNote, isFavorite: !selectedNote.isFavorite });
    }
  };

  // Yeni Not Modalı Aç
  const handleOpenNewNote = () => {
    setEditingNote(null);
    setFormCourseCode("CENG 451");
    setFormCourseName("Yapay Zekâ & Makine Öğrenimi");
    setFormTerm("2026 Güz");
    setFormInstructor("Prof. Dr. Ahmet Yılmaz");
    setFormTargetExam("vize");
    setFormExamDate("25 Kasım 2026");
    setFormDaysLeft("25");
    setFormTitle("");
    setFormTopics("Konu 1, Konu 2, Formüller");
    setFormSummary("");
    setFormKeyFormulas("");
    setFormPdfName("Ders_Ozet_Slayti.pdf");
    setFormPdfPages("20");
    setFormPriority("yuksek");
    setFormStatus("calisiliyor");
    setIsEditorOpen(true);
  };

  // Mevcut Notu Düzenleme Modalı Aç
  const handleOpenEditNote = (note: CourseStudyNote, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingNote(note);
    setFormCourseCode(note.courseCode);
    setFormCourseName(note.courseName);
    setFormTerm(note.term);
    setFormInstructor(note.instructor);
    setFormTargetExam(note.targetExam);
    setFormExamDate(note.examDate);
    setFormDaysLeft(String(note.daysLeft));
    setFormTitle(note.title);
    setFormTopics(note.topics.join(", "));
    setFormSummary(note.summary);
    setFormKeyFormulas(note.keyFormulas || "");
    setFormPdfName(note.pdfAttachment?.name || "");
    setFormPdfPages(String(note.pdfAttachment?.pages || 20));
    setFormPriority(note.priority);
    setFormStatus(note.status);
    setIsEditorOpen(true);
  };

  // Kaydet (Ekle veya Güncelle)
  const handleSaveNote = () => {
    if (!formTitle.trim()) {
      alert("Lütfen ders notu için bir başlık belirleyin.");
      return;
    }
    if (!formCourseName.trim()) {
      alert("Lütfen ders adını yazın.");
      return;
    }

    const topicsArr = formTopics
      .split(/[,;\n]+/)
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const pdf = formPdfName.trim()
      ? {
          name: formPdfName.trim(),
          pages: Number(formPdfPages) || 20,
          size: "3.5 MB",
          previewText: `${formTitle} için eklenmiş ders slaytı ve dökümanı...`,
        }
      : undefined;

    if (editingNote) {
      // Güncelleme
      const updatedItem: CourseStudyNote = {
        ...editingNote,
        courseCode: formCourseCode.trim() || "CENG",
        courseName: formCourseName.trim(),
        term: formTerm.trim() || "2026 Güz",
        instructor: formInstructor.trim() || "Öğretim Üyesi",
        targetExam: formTargetExam,
        examDate: formExamDate.trim(),
        daysLeft: Number(formDaysLeft) || 20,
        title: formTitle.trim(),
        topics: topicsArr.length > 0 ? topicsArr : ["Genel Konular"],
        summary: formSummary.trim(),
        keyFormulas: formKeyFormulas.trim() || undefined,
        pdfAttachment: pdf,
        priority: formPriority,
        status: formStatus,
      };

      const updated = notes.map((n) => (n.id === editingNote.id ? updatedItem : n));
      setNotes(updated);
      saveStoredCollection("study", updated);
      if (selectedNote && selectedNote.id === editingNote.id) {
        setSelectedNote(updatedItem);
      }
      setToastMessage("Ders notu başarıyla güncellendi.");
    } else {
      // Yeni Ekleme
      const newItem: CourseStudyNote = {
        id: `st-${Date.now()}`,
        courseCode: formCourseCode.trim() || "CENG",
        courseName: formCourseName.trim(),
        term: formTerm.trim() || "2026 Güz",
        instructor: formInstructor.trim() || "Öğretim Üyesi",
        targetExam: formTargetExam,
        examDate: formExamDate.trim(),
        daysLeft: Number(formDaysLeft) || 20,
        title: formTitle.trim(),
        topics: topicsArr.length > 0 ? topicsArr : ["Genel"],
        summary: formSummary.trim(),
        keyFormulas: formKeyFormulas.trim() || undefined,
        pdfAttachment: pdf,
        flashcards: [
          {
            id: `fc-${Date.now()}`,
            question: `${formTitle} konusunun en kilit tanımı nedir?`,
            answer: formSummary.slice(0, 100) || "Ders notu özeti.",
          },
        ],
        priority: formPriority,
        status: formStatus,
        isFavorite: false,
        colorTheme: "sky",
      };

      const updated = [newItem, ...notes];
      setNotes(updated);
      saveStoredCollection("study", updated);
      setToastMessage("Yeni ders notu arşive eklendi.");
    }

    setIsEditorOpen(false);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Notu Sil (Çöp Kutusuna At & Paylaşımını Otomatik İptal Et)
  const handleDeleteNote = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const target = notes.find((n) => n.id === id);
    if (!target) return;

    addToTrash({
      title: target.title,
      originContainer: "Yapay Zekâ & Algoritmalar Dersi",
      type: "study",
      contentPreview: `${target.courseCode} • ${target.courseName} • Sınava ${target.daysLeft} gün kaldı`,
      originalData: target,
    });

    setDeletedBackup(target);
    const updated = notes.filter((n) => n.id !== id);
    setNotes(updated);
    saveStoredCollection("study", updated);
    if (selectedNote && selectedNote.id === id) {
      setSelectedNote(null);
    }

    setToastMessage(`"${target.title}" Çöp Kutusu'na taşındı.`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Silmeyi Geri Al
  const handleUndoDelete = () => {
    if (deletedBackup) {
      const updated = [deletedBackup, ...notes];
      setNotes(updated);
      saveStoredCollection("study", updated);
      setDeletedBackup(null);
      setToastMessage(`"${deletedBackup.title}" geri yüklendi.`);
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  // Paylaşım Bağlantısını Salt Okunur Kart / Vitrin Olarak Yeni Sekmede Aç
  const handleShareStudy = (tokenSlug: string = "yapay-zeka-ders-notlari", e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    window.open(`/share/${tokenSlug}`, "_blank");
  };

  // Flashcards (Ezber Kartları) Modunu Başlat
  const handleStartFlashcards = (note: CourseStudyNote, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setFlashcardStudyNote(note);
    setActiveFlashcardIndex(0);
    setIsAnswerRevealed(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      {/* 1. ÜST HEADER */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/90 h-16 flex items-center justify-between px-4 sm:px-8 shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title="Ana Sayfaya Dön"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>

          <div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-sky-500 to-blue-600 text-white flex items-center justify-center shadow-xs">
                <GraduationCap className="w-4 h-4" />
              </div>
              <h1 className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight">
                Ders & Çalışma Notları
              </h1>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
                Akıllı Depo
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              Vize/final özetleri, sınav hazırlık kartları, formüller ve PDF dokümanları
            </p>
          </div>
        </div>

        {/* Sağ Butonlar */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => handleShareStudy("yapay-zeka-ve-algoritmalar-deposu")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
            title="Tüm Ders Deposunu Salt Okunur Paylaş"
          >
            <Share2 className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Depoyu Paylaş</span>
          </button>

          <button
            onClick={handleOpenNewNote}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white text-xs font-bold shadow-md shadow-sky-200 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni Not Ekle</span>
          </button>
        </div>
      </header>

      {/* 2. İSTATİSTİK ŞERİDİ & HERO (Duolingo Mikro Etkileşimli Kartlar) */}
      <section className="bg-gradient-to-b from-sky-500/10 via-sky-500/5 to-transparent border-b border-sky-500/15 py-6 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100 shrink-0">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xl font-extrabold text-slate-900">{notes.length}</span>
                <p className="text-[11px] text-slate-500 font-medium">Toplam Ders Notu</p>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100 shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xl font-extrabold text-slate-900">{urgentExamsCount}</span>
                <p className="text-[11px] text-slate-500 font-medium">Sınavı Yaklaşan (&lt;25 gün)</p>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xl font-extrabold text-slate-900">{totalFlashcardsCount}</span>
                <p className="text-[11px] text-slate-500 font-medium">Ezber &amp; Sınav Kartı</p>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xl font-extrabold text-slate-900">{pdfCount}</span>
                <p className="text-[11px] text-slate-500 font-medium">PDF &amp; Slayt Dosyası</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FİLTRE VE ARAMA KONTROLLERİ */}
      <section className="max-w-7xl w-full mx-auto px-4 sm:px-8 pt-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Sekmeler */}
          <div className="flex items-center gap-1.5 bg-slate-200/60 p-1 rounded-2xl flex-wrap">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                activeTab === "all" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Tümü ({notes.length})
            </button>
            <button
              onClick={() => setActiveTab("vize")}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                activeTab === "vize" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Vize Notları ({notes.filter((n) => n.targetExam === "vize").length})
            </button>
            <button
              onClick={() => setActiveTab("final")}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                activeTab === "final" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Final Notları ({notes.filter((n) => n.targetExam === "final").length})
            </button>
            <button
              onClick={() => setActiveTab("urgent")}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                activeTab === "urgent" ? "bg-white text-rose-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Sınavı Yaklaşanlar ({urgentExamsCount})
            </button>
            <button
              onClick={() => setActiveTab("pdf")}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                activeTab === "pdf" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              PDF'liler ({pdfCount})
            </button>
            <button
              onClick={() => setActiveTab("favorites")}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1 ${
                activeTab === "favorites" ? "bg-white text-amber-600 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Heart className="w-3 h-3 fill-amber-500 text-amber-500" />
              Favoriler ({notes.filter((n) => n.isFavorite).length})
            </button>
          </div>

          {/* Arama & Sıralama */}
          <div className="flex items-center gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ders, konu, hoca ara..."
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-sky-500 shadow-2xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-1 text-xs text-slate-500 shrink-0">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-700 outline-none focus:border-sky-500 shadow-2xs"
              >
                <option value="examDate">Sınav Tarihine Göre</option>
                <option value="priority">Önceliğe Göre</option>
                <option value="title">İsme Göre</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* 4. DERS NOTLARI GRİD LİSTESİ */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 flex-1">
        {/* Toast Bildirimi (Silme & Geri Alma) */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 p-4 rounded-2xl bg-slate-900 text-white shadow-xl flex items-center justify-between text-xs"
            >
              <span>{toastMessage}</span>
              {deletedBackup && (
                <button
                  onClick={handleUndoDelete}
                  className="px-3 py-1 rounded-lg bg-sky-500 text-white font-bold hover:bg-sky-400 transition-colors flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  Geri Al
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {filteredNotes.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center border-2 border-dashed border-slate-200 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 flex items-center justify-center mx-auto border border-sky-100">
              <GraduationCap className="w-6 h-6 text-sky-500" />
            </div>
            <h3 className="font-bold text-slate-800">Hiç ders notu bulunamadı</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Arama kriterlerinize uygun ders notu yok veya henüz eklenmedi.
            </p>
            <button
              onClick={handleOpenNewNote}
              className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-sky-600 text-white text-xs font-bold shadow-md hover:bg-sky-700 transition-colors mt-2"
            >
              <Plus className="w-4 h-4" />
              İlk Notu Ekle
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNotes.map((note) => (
              <motion.div
                key={note.id}
                layout
                whileHover={{ y: -5 }}
                className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:border-sky-300 hover:shadow-xl transition-all flex flex-col justify-between overflow-hidden group cursor-pointer"
                onClick={() => setSelectedNote(note)}
              >
                <div className="p-6 space-y-4">
                  {/* Üst Başlık & Rozetler */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="px-2.5 py-1 rounded-xl text-xs font-extrabold uppercase bg-sky-50 text-sky-700 border border-sky-200">
                        {note.courseCode}
                      </span>
                      <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600">
                        {note.targetExam === "vize" ? "Vize" : "Final"}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      {/* 1-Tıkla Favori Toggle */}
                      <button
                        onClick={(e) => toggleFavorite(note.id, e)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          note.isFavorite
                            ? "text-rose-500 bg-rose-50"
                            : "text-slate-300 hover:text-slate-500 hover:bg-slate-100"
                        }`}
                        title="Favorilere Ekle"
                      >
                        <Heart className={`w-4 h-4 ${note.isFavorite ? "fill-rose-500" : ""}`} />
                      </button>

                      {/* Geri Sayım Rozeti */}
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                          note.daysLeft <= 20
                            ? "bg-rose-50 text-rose-700 border border-rose-200"
                            : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        }`}
                      >
                        <Clock className="w-3 h-3" />
                        {note.daysLeft} gün
                      </span>
                    </div>
                  </div>

                  {/* Ders Başlığı ve Eğitmen */}
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900 group-hover:text-sky-600 transition-colors line-clamp-1">
                      {note.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5 font-medium">
                      {note.courseName} • {note.instructor}
                    </p>
                  </div>

                  {/* Özet Metin */}
                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {note.summary}
                  </p>

                  {/* Konu Etiketleri */}
                  {note.topics && note.topics.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {note.topics.slice(0, 3).map((topic, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-50 text-slate-600 border border-slate-200/80"
                        >
                          #{topic}
                        </span>
                      ))}
                      {note.topics.length > 3 && (
                        <span className="text-[10px] text-slate-400 font-medium">
                          +{note.topics.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* PDF ve Sınav Kartları Önizleme Butonları */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                    {note.pdfAttachment ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setPdfPreviewNote(note);
                        }}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 text-[11px] font-bold transition-colors"
                        title="PDF Önizle"
                      >
                        <FileText className="w-3.5 h-3.5 text-sky-600" />
                        <span>{note.pdfAttachment.pages}s PDF</span>
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-400">PDF Yok</span>
                    )}

                    {note.flashcards && note.flashcards.length > 0 && (
                      <button
                        onClick={(e) => handleStartFlashcards(note, e)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-bold transition-colors"
                        title="Sınav Kartlarını Çalış"
                      >
                        <Sparkles className="w-3 h-3 text-indigo-600" />
                        <span>{note.flashcards.length} Soru Çalış</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Alt Aksiyon Çubuğu */}
                <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-sky-600 font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                    Detayları İncele →
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => handleOpenEditNote(note, e)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
                      title="Notu Düzenle"
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleShareStudy("yapay-zeka-ders-notlari", e)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition-colors"
                      title="Bu Notu Salt Okunur Paylaş"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteNote(note.id, e)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Çöp Kutusuna Gönder"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* 5. DERS NOTU DETAY MODALI */}
      <AnimatePresence>
        {selectedNote && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedNote(null)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="relative w-full max-w-3xl bg-white rounded-3xl overflow-hidden shadow-2xl z-10 max-h-[90vh] flex flex-col"
            >
              {/* Modal Başlık Çubuğu */}
              <div className="p-6 bg-gradient-to-r from-sky-600 to-blue-700 text-white shrink-0 relative">
                <button
                  onClick={() => setSelectedNote(null)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-black/20 text-white hover:bg-black/40 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold uppercase bg-white/20 backdrop-blur-md">
                    {selectedNote.courseCode}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold uppercase bg-sky-900/60">
                    {selectedNote.targetExam === "vize" ? "Vize Notu" : "Final Notu"}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-amber-400 text-amber-950 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Sınava {selectedNote.daysLeft} Gün Kaldı
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                  {selectedNote.title}
                </h2>
                <p className="text-xs text-sky-100 mt-1 font-medium">
                  {selectedNote.courseName} • {selectedNote.instructor} • {selectedNote.term}
                </p>
              </div>

              {/* Modal İçeriği */}
              <div className="p-6 overflow-y-auto space-y-5 flex-1">
                {/* Konu Başlıkları */}
                {selectedNote.topics && (
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Kapsanan Konu Başlıkları
                    </h4>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {selectedNote.topics.map((t, idx) => (
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

                {/* Özet Açıklama */}
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Ders &amp; Konu Özeti
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                    {selectedNote.summary}
                  </p>
                </div>

                {/* Önemli Formüller */}
                {selectedNote.keyFormulas && (
                  <div className="space-y-1.5">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Matematiksel Formüller &amp; Denklemler
                    </h4>
                    <div className="p-4 rounded-2xl bg-slate-900 font-mono text-xs text-sky-300 leading-relaxed border border-slate-800">
                      <pre className="whitespace-pre font-mono">{selectedNote.keyFormulas}</pre>
                    </div>
                  </div>
                )}

                {/* Sınav Soru-Cevap Kartları */}
                {selectedNote.flashcards && selectedNote.flashcards.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                        Sınav Soru - Cevap Kartları ({selectedNote.flashcards.length})
                      </h4>
                      <button
                        onClick={() => handleStartFlashcards(selectedNote)}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                      >
                        Tam Ekran Çalış →
                      </button>
                    </div>
                    <div className="grid grid-cols-1 gap-2.5">
                      {selectedNote.flashcards.map((fc) => (
                        <div
                          key={fc.id}
                          className="p-3.5 rounded-2xl bg-indigo-50/50 border border-indigo-100 text-xs space-y-1.5"
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

                {/* PDF Ek Dosyası */}
                {selectedNote.pdfAttachment && (
                  <div className="p-4 rounded-2xl bg-sky-50/50 border border-sky-200/70 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <h5 className="font-bold text-xs text-slate-900">
                          {selectedNote.pdfAttachment.name}
                        </h5>
                        <p className="text-[11px] text-slate-500">
                          {selectedNote.pdfAttachment.pages} Sayfa • {selectedNote.pdfAttachment.size} • Ders Slaytı
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setPdfPreviewNote(selectedNote)}
                      className="px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-colors shadow-xs"
                    >
                      Dokümanı Aç
                    </button>
                  </div>
                )}
              </div>

              {/* Alt Eylemler */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                <button
                  onClick={() => handleDeleteNote(selectedNote.id)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Çöp Kutusuna Taşı
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEditNote(selectedNote)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    Düzenle
                  </button>
                  <button
                    onClick={() => handleShareStudy("yapay-zeka-ders-notlari")}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-colors shadow-sm"
                    title="Bu Notu Salt Okunur Kart Olarak Paylaş"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    Paylaş
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 6. FLASHCARDS (EZBER KARTLARI) ÇALIŞMA MODALI */}
      <AnimatePresence>
        {flashcardStudyNote && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setFlashcardStudyNote(null)}
              className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl z-10 space-y-6"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900">
                      Sınav Ezber Kartları (Flashcards)
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      {flashcardStudyNote.courseCode} • {flashcardStudyNote.title}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setFlashcardStudyNote(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* İlerleme Çubuğu */}
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-1.5">
                  <span>
                    Kart {activeFlashcardIndex + 1} / {flashcardStudyNote.flashcards.length}
                  </span>
                  <span>
                    %{Math.round(((activeFlashcardIndex + 1) / flashcardStudyNote.flashcards.length) * 100)} Tamamlandı
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-sky-500 to-indigo-600 transition-all duration-300"
                    style={{
                      width: `${((activeFlashcardIndex + 1) / flashcardStudyNote.flashcards.length) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* Aktif Soru - Cevap Kartı */}
              {flashcardStudyNote.flashcards[activeFlashcardIndex] && (
                <div
                  onClick={() => setIsAnswerRevealed(!isAnswerRevealed)}
                  className="p-8 rounded-3xl bg-gradient-to-b from-indigo-50/50 to-white border-2 border-indigo-200/80 shadow-md min-h-[220px] flex flex-col justify-between cursor-pointer hover:border-indigo-400 transition-all"
                >
                  <div className="space-y-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                      Soru {activeFlashcardIndex + 1}
                    </span>
                    <h4 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                      {flashcardStudyNote.flashcards[activeFlashcardIndex].question}
                    </h4>
                  </div>

                  <div className="pt-4 mt-4 border-t border-indigo-100">
                    {isAnswerRevealed ? (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 rounded-2xl bg-white border border-indigo-200 text-xs sm:text-sm text-slate-800 font-medium shadow-xs"
                      >
                        <span className="font-bold text-indigo-700 block mb-1">Cevap:</span>
                        {flashcardStudyNote.flashcards[activeFlashcardIndex].answer}
                      </motion.div>
                    ) : (
                      <div className="text-center py-2 text-xs font-bold text-indigo-600 flex items-center justify-center gap-1.5">
                        <HelpCircle className="w-4 h-4" />
                        <span>Cevabı Görmek İçin Tıkla</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Gezinme Butonları */}
              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  disabled={activeFlashcardIndex === 0}
                  onClick={() => {
                    setActiveFlashcardIndex((curr) => Math.max(0, curr - 1));
                    setIsAnswerRevealed(false);
                  }}
                  className="flex items-center gap-1 px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Önceki Kart
                </button>

                <button
                  onClick={() => setIsAnswerRevealed(!isAnswerRevealed)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-colors"
                >
                  {isAnswerRevealed ? "Cevabı Gizle" : "Cevabı Göster"}
                </button>

                <button
                  disabled={activeFlashcardIndex === flashcardStudyNote.flashcards.length - 1}
                  onClick={() => {
                    setActiveFlashcardIndex((curr) =>
                      Math.min(flashcardStudyNote.flashcards.length - 1, curr + 1)
                    );
                    setIsAnswerRevealed(false);
                  }}
                  className="flex items-center gap-1 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-xs"
                >
                  Sonraki Kart
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 7. PDF DOKÜMAN ÖNİZLEME MODALI */}
      <AnimatePresence>
        {pdfPreviewNote && pdfPreviewNote.pdfAttachment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPdfPreviewNote(null)}
              className="fixed inset-0 bg-slate-900/75 backdrop-blur-xs"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-3xl bg-slate-900 text-white rounded-3xl overflow-hidden shadow-2xl z-10 flex flex-col max-h-[90vh]"
            >
              {/* PDF Header */}
              <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-sky-600 text-white flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-white line-clamp-1">
                      {pdfPreviewNote.pdfAttachment.name}
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      {pdfPreviewNote.courseCode} • {pdfPreviewNote.pdfAttachment.pages} Sayfa • {pdfPreviewNote.pdfAttachment.size}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      alert(`"${pdfPreviewNote.pdfAttachment?.name}" indirme bağlantısı simüle edildi.`);
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>İndir</span>
                  </button>
                  <button
                    onClick={() => setPdfPreviewNote(null)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* PDF Belge Simülatörü */}
              <div className="p-8 overflow-y-auto flex-1 bg-slate-900 space-y-6">
                <div className="max-w-xl mx-auto bg-white text-slate-900 p-8 sm:p-12 rounded-2xl shadow-xl space-y-6 border border-slate-200">
                  <div className="border-b border-slate-200 pb-4 text-center">
                    <span className="text-xs font-bold uppercase tracking-wider text-sky-600">
                      {pdfPreviewNote.courseCode} — {pdfPreviewNote.courseName}
                    </span>
                    <h2 className="text-xl font-extrabold text-slate-900 mt-1">
                      {pdfPreviewNote.title}
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      {pdfPreviewNote.instructor} • {pdfPreviewNote.term}
                    </p>
                  </div>

                  <div className="space-y-4 text-xs leading-relaxed text-slate-700">
                    <p className="font-semibold text-slate-900">
                      {pdfPreviewNote.pdfAttachment.previewText || pdfPreviewNote.summary}
                    </p>
                    <p>
                      Bu döküman, {pdfPreviewNote.courseName} dersi kapsamında işlenen {pdfPreviewNote.title} konusuna ait resmi ders sunum slaytlarını ve laboratuvar notlarını içermektedir.
                    </p>

                    {pdfPreviewNote.keyFormulas && (
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 font-mono text-[11px] text-slate-800">
                        <span className="font-bold text-sky-700 block mb-1">Ders Formülleri:</span>
                        <pre className="whitespace-pre font-mono">{pdfPreviewNote.keyFormulas}</pre>
                      </div>
                    )}
                  </div>

                  <div className="pt-6 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Sayfa 1 / {pdfPreviewNote.pdfAttachment.pages}</span>
                    <span>Kişisel Dijital Arşiv Okuyucu</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 8. YENİ NOT EKLEME & DÜZENLEME MODALI */}
      <AnimatePresence>
        {isEditorOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditorOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl z-10 max-h-[90vh] overflow-y-auto space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <h3 className="font-extrabold text-base text-slate-900">
                    {editingNote ? "Ders Notunu Düzenle" : "Yeni Ders Notu Ekle"}
                  </h3>
                </div>
                <button
                  onClick={() => setIsEditorOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                {/* Ders Kodu & Adı */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Ders Kodu</label>
                    <input
                      type="text"
                      value={formCourseCode}
                      onChange={(e) => setFormCourseCode(e.target.value)}
                      placeholder="CENG 451"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-sky-500 font-semibold"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="font-bold text-slate-700 block mb-1">Ders Adı</label>
                    <input
                      type="text"
                      value={formCourseName}
                      onChange={(e) => setFormCourseName(e.target.value)}
                      placeholder="Yapay Zekâ & Makine Öğrenimi"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-sky-500 font-semibold"
                    />
                  </div>
                </div>

                {/* Not Başlığı */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Not / Konu Başlığı</label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="A* Arama & Heuristic Fonksiyonları"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-sky-500 font-semibold"
                  />
                </div>

                {/* Eğitmen & Dönem */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Öğretim Üyesi / Hoca</label>
                    <input
                      type="text"
                      value={formInstructor}
                      onChange={(e) => setFormInstructor(e.target.value)}
                      placeholder="Prof. Dr. Ahmet Yılmaz"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Dönem</label>
                    <input
                      type="text"
                      value={formTerm}
                      onChange={(e) => setFormTerm(e.target.value)}
                      placeholder="2026 Güz"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                {/* Sınav Türü, Tarihi ve Kalan Gün */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Hedef Sınav</label>
                    <select
                      value={formTargetExam}
                      onChange={(e) => setFormTargetExam(e.target.value as ExamType)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-sky-500 font-semibold"
                    >
                      <option value="vize">Vize Sınavı</option>
                      <option value="final">Final Sınavı</option>
                      <option value="but">Bütünleme</option>
                      <option value="genel">Genel Çalışma</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Sınav Tarihi</label>
                    <input
                      type="text"
                      value={formExamDate}
                      onChange={(e) => setFormExamDate(e.target.value)}
                      placeholder="20 Kasım 2026"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Kalan Gün Sayısı</label>
                    <input
                      type="number"
                      value={formDaysLeft}
                      onChange={(e) => setFormDaysLeft(e.target.value)}
                      min="0"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-sky-500 font-semibold"
                    />
                  </div>
                </div>

                {/* Konu Başlıkları (Virgülle) */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Konu Başlıkları (Virgülle ayırın)
                  </label>
                  <input
                    type="text"
                    value={formTopics}
                    onChange={(e) => setFormTopics(e.target.value)}
                    placeholder="Admissibility, Heuristics, Manhattan, Formüller"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-sky-500"
                  />
                </div>

                {/* Özet Not Metni */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Ders Özeti &amp; Kilit Notlar</label>
                  <textarea
                    rows={4}
                    value={formSummary}
                    onChange={(e) => setFormSummary(e.target.value)}
                    placeholder="A* algoritmasının temel mantığı ve ispat adımları..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-sky-500"
                  />
                </div>

                {/* Formüller */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Matematiksel Formüller (İsteğe bağlı)
                  </label>
                  <textarea
                    rows={2}
                    value={formKeyFormulas}
                    onChange={(e) => setFormKeyFormulas(e.target.value)}
                    placeholder="f(n) = g(n) + h(n)"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-sky-500 font-mono text-[11px]"
                  />
                </div>

                {/* PDF Dosya Eki Bilgileri */}
                <div className="p-3.5 rounded-2xl bg-sky-50/50 border border-sky-100 space-y-2">
                  <span className="font-bold text-sky-900 block">PDF Dosya Eki (Opsiyonel)</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={formPdfName}
                      onChange={(e) => setFormPdfName(e.target.value)}
                      placeholder="Ders_Notu_Slayt.pdf"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:border-sky-500 text-xs"
                    />
                    <input
                      type="number"
                      value={formPdfPages}
                      onChange={(e) => setFormPdfPages(e.target.value)}
                      placeholder="Sayfa sayısı (örn: 25)"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:border-sky-500 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Form Butonları */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  onClick={() => setIsEditorOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  İptal
                </button>
                <button
                  onClick={handleSaveNote}
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-all shadow-md"
                >
                  {editingNote ? "Değişiklikleri Kaydet" : "Arşive Ekle"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
