export interface MovieSearchResult {
  id: string;
  imdbId?: string;
  title: string;
  year: number;
  director: string;
  rating: number;
  genres: string[];
  posterUrl: string;
  backdropUrl?: string;
  duration: string;
  cast: string[];
  overview: string;
}

const LOCAL_FALLBACK_MOVIES: MovieSearchResult[] = [
  {
    id: "fb_1",
    title: "Fight Club",
    year: 1999,
    director: "David Fincher",
    rating: 8.8,
    genres: ["Dram", "Gerilim"],
    posterUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80",
    duration: "2s 19dk",
    cast: ["Brad Pitt", "Edward Norton", "Helena Bonham Carter"],
    overview: "Uykusuzluk çeken bir ofis çalışanı ve başına buyruk bir sabun üreticisi, yeraltında gizli bir dövüş kulübü kurarak düzene meydan okur.",
  },
  {
    id: "fb_2",
    title: "Pulp Fiction",
    year: 1994,
    director: "Quentin Tarantino",
    rating: 8.9,
    genres: ["Suç", "Dram"],
    posterUrl: "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=600&q=80",
    duration: "2s 34dk",
    cast: ["John Travolta", "Uma Thurman", "Samuel L. Jackson"],
    overview: "Los Angeles yeraltı dünyasından iki tetikçi, bir boksör ve bir gangsterin eşinin yollarının kesiştiği kült başyapıt.",
  },
  {
    id: "fb_3",
    title: "The Dark Knight",
    year: 2008,
    director: "Christopher Nolan",
    rating: 9.0,
    genres: ["Aksiyon", "Suç", "Dram"],
    posterUrl: "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=600&q=80",
    duration: "2s 32dk",
    cast: ["Christian Bale", "Heath Ledger", "Aaron Eckhart"],
    overview: "Batman, Teğmen Gordon ve Savcı Dent ile birlikte Gotham sokaklarındaki organize suç örgütlerini çökertmeye çalışırken Joker sahneye çıkar.",
  },
  {
    id: "fb_4",
    title: "Interstellar",
    year: 2014,
    director: "Christopher Nolan",
    rating: 8.7,
    genres: ["Bilim Kurgu", "Macera", "Dram"],
    posterUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80",
    duration: "2s 49dk",
    cast: ["Matthew McConaughey", "Anne Hathaway", "Jessica Chastain"],
    overview: "İnsanlığın son umudu olarak bir grup kâşif, yaşanabilir yeni bir gezegen bulmak için solucan deliğinden geçerek bilinmeyene doğru yolculuğa çıkar.",
  },
];

export async function searchMoviesOnline(query: string): Promise<MovieSearchResult[]> {
  const clean = query.trim();
  if (!clean || clean.length < 2) {
    return [];
  }

  // 1. Tarayıcı ortamında sunucu Next.js API rotasını çağır
  if (typeof window !== "undefined") {
    try {
      const res = await fetch(`/api/movies/search?q=${encodeURIComponent(clean)}`);
      if (res.ok) {
        const json = await res.json();
        if (json.results && Array.isArray(json.results) && json.results.length > 0) {
          return json.results;
        }
      }
    } catch (e) {
      console.warn("Canlı film araması API hatası, yerel kataloğa geçiliyor:", e);
    }
  }

  // 2. Çevrimdışı / API yanıt vermezse filtreleme fallback'i
  return LOCAL_FALLBACK_MOVIES.filter(
    (m) =>
      m.title.toLowerCase().includes(clean.toLowerCase()) ||
      m.director.toLowerCase().includes(clean.toLowerCase())
  );
}
