export type Movie = {
  id: number;
  title: string;
  slug: string;
  synopsis?: string;
  durationMinutes: number;
  language: string;
  genre: string;
  rating: string;
  genres: string[];
  posterUrl: string;
  backdropUrl: string | null;
  trailerUrl?: string | null;
  cast?: string;
  director?: string | null;
  writers?: string;
  averageRating: number;
  reviewCount: number;
  ratingBreakdown?: string;
  reviews?: string;
  releaseDate: string | null;
  ageRating: string | null;
  format: string;
  isNowShowing?: boolean;
};

export type MovieListResponse = {
  data: Movie[];
};

export type MovieResponse = {
  data: Movie;
};

export type MovieReview = {
  author: string;
  rating: number;
  title: string;
  comment: string;
};

export type BookingTime = {
  id: number;
  startTime: string;
};

export type BookingDate = {
  date: string;
  times: BookingTime[];
};

export type BookingHall = {
  id: number;
  name: string;
  seatRows: number;
  seatsPerRow: number;
  dates: BookingDate[];
};

export type BookingLocation = {
  id: number;
  name: string;
  city: string | null;
  address: string | null;
  halls: BookingHall[];
};

export type BookingTicketType = {
  label: string;
  minPrice: number;
  maxPrice: number;
};

export type MovieBookingOptions = {
  ticketTypes: BookingTicketType[];
  locations: BookingLocation[];
};

export type MovieBookingOptionsResponse = {
  data: MovieBookingOptions;
};

export type SeatLock = {
  seatNumber: string;
  lockedBy: string;
  status: string;
  updatedAt: string;
};

export type SeatStatus = "available" | "locked";

export type ShowtimeSeat = {
  seatNumber: string;
  row: string;
  column: number;
  status: SeatStatus;
  lockedByCurrentUser: boolean;
  lockedUntil: string | null;
};

export type ShowtimeSeatMap = {
  showtimeId: number;
  seatRows: number;
  seatsPerRow: number;
  lockExpiresInSeconds: number;
  seats: ShowtimeSeat[];
};

export type SeatLocksResponse = {
  data: ShowtimeSeatMap;
};

export type SeatLockResponse = {
  data: {
    seatNumber: string;
    status: SeatStatus;
    lockedByCurrentUser?: boolean;
    lockedUntil?: string;
  };
};

export type ConcessionCategory = "food" | "beverage" | "combo";

export type ConcessionItem = {
  id: number;
  name: string;
  description: string;
  category: ConcessionCategory;
  price: number;
  originalPrice: number | null;
  discountPercent: number | null;
  imageUrl: string | null;
};

export type ConcessionItemsResponse = {
  data: ConcessionItem[];
};

export type SelectedConcessionItem = ConcessionItem & {
  quantity: number;
};

export type BookingSummaryParams = {
  movieId: string;
  ticketType: string;
  location: string;
  hall: string;
  date: string;
  time: string;
  showtimeId: string;
  seats: string;
  ticketTotal: string;
  concessions?: string;
  concessionTotal?: string;
};

export type BookingTransactionPayload = {
  showtimeId: number;
  ticketType: string;
  location: string;
  cinemaHall: string;
  showDate: string;
  startTime: string;
  seats: string[];
  concessions: SelectedConcessionItem[];
  ticketTotal: number;
  concessionTotal: number;
  grandTotal: number;
  paymentMethod: string;
  cardNumber?: string;
};

export type BookingTransaction = {
  id: number;
  reference: string;
  showtimeId: number;
  ticketType: string;
  location: string;
  cinemaHall: string;
  showDate: string;
  startTime: string;
  seats: string;
  concessions: string;
  ticketTotal: number;
  concessionTotal: number;
  grandTotal: number;
  paymentMethod: string;
  cardLastFour: string;
  status: string;
  createdAt: string;
};

export type BookingTransactionResponse = {
  success: boolean;
  data: BookingTransaction;
};
