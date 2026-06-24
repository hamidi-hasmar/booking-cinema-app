import Constants from "expo-constants";
import { Platform } from "react-native";

import { Movie, MovieListResponse, MovieResponse } from "../types";

type ApiMovie = {
  id: number;
  title: string;
  slug: string;
  posterUrl: string | null;
  backdropUrl: string | null;
  genres: string[];
  releaseDate: string | null;
  durationMinutes: number;
  ageRating: string | null;
  language: string;
  format: string;
  rating: {
    average: number;
    count: number;
  };
  isFeatured: boolean;
  synopsis?: string;
  trailerUrl?: string | null;
  castMembers?: string[];
  director?: string | null;
  writers?: string[];
};

type ApiMovieListResponse = {
  data: ApiMovie[];
};

type ApiMovieResponse = {
  data: ApiMovie;
};

function getApiBaseUrl() {
  const configuredUrl = process.env.EXPO_PUBLIC_API_URL;

  if (configuredUrl) {
    return configuredUrl.replace(/\/$/, "");
  }

  if (Platform.OS === "web") {
    return "http://localhost:8000";
  }

  if (Platform.OS === "android") {
    return "http://10.0.2.2:8000";
  }

  const hostUri = Constants.expoConfig?.hostUri;
  const host = hostUri?.split(":")[0];

  return host ? `http://${host}:8000` : "http://localhost:8000";
}

const API_BASE_URL = getApiBaseUrl();

function mapMovie(apiMovie: ApiMovie): Movie {
  const genres = apiMovie.genres ?? [];

  return {
    id: apiMovie.id,
    title: apiMovie.title,
    slug: apiMovie.slug,
    synopsis: apiMovie.synopsis,
    durationMinutes: apiMovie.durationMinutes,
    language: apiMovie.language,
    genre: genres.join(", "),
    rating: String(apiMovie.ageRating ?? ""),
    genres,
    posterUrl: apiMovie.posterUrl ?? "",
    backdropUrl: apiMovie.backdropUrl,
    trailerUrl: apiMovie.trailerUrl,
    cast: apiMovie.castMembers?.join(", "),
    director: apiMovie.director,
    writers: apiMovie.writers?.join(", "),
    averageRating: apiMovie.rating.average,
    reviewCount: apiMovie.rating.count,
    releaseDate: apiMovie.releaseDate,
    ageRating: apiMovie.ageRating,
    format: apiMovie.format,
    isNowShowing: apiMovie.isFeatured,
  };
}

export async function fetchMovies() {
  const response = await fetch(`${API_BASE_URL}/api/movies`);

  if (!response.ok) {
    throw new Error("Unable to load movies");
  }

  const result = (await response.json()) as ApiMovieListResponse;

  if (!Array.isArray(result.data)) {
    throw new Error("Unable to load movies");
  }

  return result.data.map(mapMovie) satisfies MovieListResponse["data"];
}

export async function fetchMovie(movieSlug: string) {
  const response = await fetch(`${API_BASE_URL}/api/movies/${movieSlug}`);

  if (!response.ok) {
    throw new Error("Unable to load movie");
  }

  const result = (await response.json()) as ApiMovieResponse;

  if (!result.data) {
    throw new Error("Unable to load movie");
  }

  return mapMovie(result.data) satisfies MovieResponse["data"];
}
