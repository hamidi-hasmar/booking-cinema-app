import Constants from "expo-constants";
import { Platform } from "react-native";

import {
  BookingTransactionPayload,
  BookingTransactionResponse,
  ConcessionItemsResponse,
  Movie,
  MovieBookingOptionsResponse,
  MovieListResponse,
  MovieResponse,
  SeatLockResponse,
  SeatLocksResponse,
} from "../types";

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

const CLIENT_ID = `client-${Math.random().toString(36).slice(2)}-${Date.now()}`;

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

export async function fetchMovie(movieId: number) {
  const response = await fetch(`${API_BASE_URL}/api/movies/${movieId}`);

  if (!response.ok) {
    throw new Error("Unable to load movie");
  }

  const result = (await response.json()) as ApiMovieResponse;

  if (!result.data) {
    throw new Error("Unable to load movie");
  }

  return mapMovie(result.data) satisfies MovieResponse["data"];
}

export async function fetchMovieBookingOptions(movieId: number) {
  const response = await fetch(
    `${API_BASE_URL}/api/movies/${movieId}/booking-options`,
  );

  if (!response.ok) {
    throw new Error("Unable to load booking options");
  }

  const result = (await response.json()) as MovieBookingOptionsResponse;

  if (!Array.isArray(result.data.locations)) {
    throw new Error("Unable to load booking options");
  }

  return result.data;
}

export async function fetchShowtimeSeats(showtimeId: number) {
  const response = await fetch(
    `${API_BASE_URL}/api/showtimes/${showtimeId}/seats?clientId=${CLIENT_ID}`,
  );

  if (!response.ok) {
    throw new Error("Unable to load seats");
  }

  const result = (await response.json()) as SeatLocksResponse;

  if (!Array.isArray(result.data.seats)) {
    throw new Error("Unable to load seats");
  }

  return result.data;
}

export async function lockShowtimeSeat(showtimeId: number, seatNumber: string) {
  const response = await fetch(
    `${API_BASE_URL}/api/showtimes/${showtimeId}/seats/lock`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        seatNumber,
        clientId: CLIENT_ID,
      }),
    },
  );

  if (response.status === 409) {
    throw new Error("Seat is already locked");
  }

  if (!response.ok) {
    throw new Error("Unable to lock seat");
  }

  const result = (await response.json()) as SeatLockResponse;

  return result.data;
}

export async function releaseShowtimeSeat(
  showtimeId: number,
  seatNumber: string,
) {
  const response = await fetch(
    `${API_BASE_URL}/api/showtimes/${showtimeId}/seats/release`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        seatNumber,
        clientId: CLIENT_ID,
      }),
    },
  );

  if (!response.ok) {
    throw new Error("Unable to release seat");
  }

  const result = (await response.json()) as SeatLockResponse;

  return result.data;
}

export async function fetchConcessionItems() {
  const response = await fetch(`${API_BASE_URL}/api/concession-items`);

  if (!response.ok) {
    throw new Error("Unable to load food and beverages");
  }

  const result = (await response.json()) as ConcessionItemsResponse;

  if (!Array.isArray(result.data)) {
    throw new Error("Unable to load food and beverages");
  }

  return result.data;
}

export async function createBookingTransaction(
  payload: BookingTransactionPayload,
) {
  const response = await fetch(`${API_BASE_URL}/api/bookings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Unable to complete payment");
  }

  const result = (await response.json()) as BookingTransactionResponse;

  return result.data;
}
