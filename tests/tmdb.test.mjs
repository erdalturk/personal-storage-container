import test from "node:test";
import assert from "node:assert/strict";
import { searchMoviesOnline } from "../src/lib/tmdbClient.ts";

test("TMDB-01: Empty or single character query returns empty array", async () => {
  const emptyRes = await searchMoviesOnline("");
  assert.deepEqual(emptyRes, []);

  const shortRes = await searchMoviesOnline("a");
  assert.deepEqual(shortRes, []);
});

test("TMDB-02: Fallback search returns structured movie results with posters and metadata", async () => {
  const results = await searchMoviesOnline("Fight Club");
  assert.ok(Array.isArray(results));
  assert.ok(results.length > 0);

  const movie = results[0];
  assert.equal(movie.title, "Fight Club");
  assert.equal(movie.year, 1999);
  assert.equal(movie.director, "David Fincher");
  assert.ok(movie.rating > 8);
  assert.ok(movie.posterUrl.startsWith("http"));
  assert.ok(Array.isArray(movie.genres));
  assert.ok(Array.isArray(movie.cast));
  assert.ok(movie.overview.length > 10);
});

test("TMDB-03: Movie search query matches by director name as well", async () => {
  const results = await searchMoviesOnline("Nolan");
  assert.ok(Array.isArray(results));
  assert.ok(results.length >= 2, "Should match Christopher Nolan movies (Interstellar, Dark Knight)");
  assert.ok(results.some((m) => m.title === "Interstellar"));
});
