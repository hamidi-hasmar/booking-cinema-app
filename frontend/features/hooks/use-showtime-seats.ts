import { useCallback, useEffect, useState } from "react";

import {
  fetchShowtimeSeats,
  lockShowtimeSeat,
  releaseShowtimeSeat,
} from "../api/movie-api";
import { ShowtimeSeatMap } from "../types";

export function useShowtimeSeats(showtimeId: number | null) {
  const [seatMap, setSeatMap] = useState<ShowtimeSeatMap | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSeats = useCallback(async () => {
    if (!showtimeId) {
      setSeatMap(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      setSeatMap(await fetchShowtimeSeats(showtimeId));
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : "Unable to load seats",
      );
    } finally {
      setIsLoading(false);
    }
  }, [showtimeId]);

  const lockSeat = useCallback(
    async (seatNumber: string) => {
      if (!showtimeId) {
        return;
      }

      await lockShowtimeSeat(showtimeId, seatNumber);
      await loadSeats();
    },
    [loadSeats, showtimeId],
  );

  const releaseSeat = useCallback(
    async (seatNumber: string) => {
      if (!showtimeId) {
        return;
      }

      await releaseShowtimeSeat(showtimeId, seatNumber);
      await loadSeats();
    },
    [loadSeats, showtimeId],
  );

  useEffect(() => {
    loadSeats();

    if (!showtimeId) {
      return undefined;
    }

    const intervalId = setInterval(loadSeats, 3000);

    return () => clearInterval(intervalId);
  }, [loadSeats, showtimeId]);

  return {
    seatMap,
    isLoading,
    error,
    reload: loadSeats,
    lockSeat,
    releaseSeat,
  };
}
