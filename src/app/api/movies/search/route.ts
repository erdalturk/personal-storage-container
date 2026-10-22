import { NextRequest, NextResponse } from "next/server";

interface FormattedMovie {
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

// Hızlı bellek önbelleği (aynı filmleri tekrar tekrar çağırmamak için)
const searchCache = new Map<string, { data: FormattedMovie[]; timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 10; // 10 dakika

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim() || "";

  if (!query || query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const cacheKey = query.toLowerCase();
  const cached = searchCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return NextResponse.json({ results: cached.data });
  }

  // 1. TMDB API Kontrolü (Eğer TMDB_API_KEY tanımlıysa)
  const tmdbKey = process.env.TMDB_API_KEY || process.env.NEXT_PUBLIC_TMDB_API_KEY;
  if (tmdbKey) {
    try {
      const tmdbRes = await fetch(
        `https://api.themoviedb.org/3/search/movie?api_key=${tmdbKey}&query=${encodeURIComponent(
          query
        )}&language=tr-TR&page=1&include_adult=false`,
        { next: { revalidate: 3600 } }
      );
      if (tmdbRes.ok) {
        const tmdbData = await tmdbRes.json();
        if (tmdbData.results && tmdbData.results.length > 0) {
          const results: FormattedMovie[] = tmdbData.results.slice(0, 8).map((m: any) => ({
            id: `tmdb_${m.id}`,
            title: m.title || m.original_title,
            year: m.release_date ? parseInt(m.release_date.split("-")[0]) : new Date().getFullYear(),
            director: "Yönetmen Bilgisi",
            rating: m.vote_average ? Math.round(m.vote_average * 10) / 10 : 7.0,
            genres: ["Sinema"],
            posterUrl: m.poster_path
              ? `https://image.tmdb.org/t/p/w500${m.poster_path}`
              : "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80",
            backdropUrl: m.backdrop_path
              ? `https://image.tmdb.org/t/p/w1280${m.backdrop_path}`
              : undefined,
            duration: "2s",
            cast: [],
            overview: m.overview || "Konu özeti bulunmuyor.",
          }));

          searchCache.set(cacheKey, { data: results, timestamp: Date.now() });
          return NextResponse.json({ results });
        }
      }
    } catch (e) {
      // OMDb Fallback'e geç
    }
  }

  // 2. Canlı OMDb / IMDb API Sorgusu
  try {
    const omdbUrl = `http://www.omdbapi.com/?apikey=trilogy&s=${encodeURIComponent(query)}&type=movie`;
    const res = await fetch(omdbUrl);
    if (!res.ok) {
      return NextResponse.json({ results: [] });
    }

    const data = await res.json();
    if (data.Response !== "True" || !data.Search) {
      return NextResponse.json({ results: [] });
    }

    // İlk 5 filmin detaylarını al (Yönetmen, Oyuncular, Puan, Konu)
    const topMovies = data.Search.slice(0, 5);
    const detailPromises = topMovies.map(async (item: any) => {
      try {
        const detailRes = await fetch(
          `http://www.omdbapi.com/?apikey=trilogy&i=${item.imdbID}&plot=short`
        );
        if (detailRes.ok) {
          return await detailRes.json();
        }
      } catch {
        // Hata durumunda temel arama kaydını kullan
      }
      return item;
    });

    const detailedList = await Promise.all(detailPromises);

    const results: FormattedMovie[] = detailedList.map((m: any) => {
      const parsedYear = parseInt(m.Year) || (m.release_date ? parseInt(m.release_date) : 2020);
      const parsedRating = parseFloat(m.imdbRating) || 7.5;
      const validPoster =
        m.Poster && m.Poster !== "N/A"
          ? m.Poster
          : "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80";

      const rawGenres = m.Genre && m.Genre !== "N/A" ? m.Genre.split(",") : ["Sinema"];
      const genres = rawGenres.map((g: string) => g.trim());

      const rawCast = m.Actors && m.Actors !== "N/A" ? m.Actors.split(",") : [];
      const cast = rawCast.map((a: string) => a.trim());

      return {
        id: `m_${m.imdbID || Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        imdbId: m.imdbID,
        title: m.Title || "Adsız Film",
        year: parsedYear,
        director: m.Director && m.Director !== "N/A" ? m.Director : "Bilinmiyor",
        rating: Math.round(parsedRating * 10) / 10,
        genres,
        posterUrl: validPoster,
        backdropUrl: validPoster,
        duration: m.Runtime && m.Runtime !== "N/A" ? m.Runtime : "2s",
        cast,
        overview:
          m.Plot && m.Plot !== "N/A"
            ? m.Plot
            : "Film konusu ve özeti bu başlık için henüz eklenmedi.",
      };
    });

    searchCache.set(cacheKey, { data: results, timestamp: Date.now() });
    return NextResponse.json({ results });
  } catch (error: any) {
    console.error("Film arama rotası hatası:", error);
    return NextResponse.json({ results: [], error: error.message });
  }
}
