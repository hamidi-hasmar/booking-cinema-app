import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { SymbolView } from "expo-symbols";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useMovie } from "../hooks/use-movie";

type SummaryConcession = {
  id: number;
  name: string;
  quantity: number;
  price: number;
};

function formatPrice(value: number) {
  return `RM ${(value / 100).toFixed(0)}`;
}

function formatDate(value?: string) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

function parseConcessions(value?: string): SummaryConcession[] {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function BookingSummaryScreen() {
  const params = useLocalSearchParams<{
    id?: string;
    ticketType?: string;
    location?: string;
    hall?: string;
    date?: string;
    time?: string;
    seats?: string;
    ticketTotal?: string;
    concessions?: string;
    concessionTotal?: string;
  }>();
  const movieId = params.id ? Number(params.id) : null;
  const { movie, isLoading, error, reload } = useMovie(movieId);

  const seats = params.seats?.split(",").filter(Boolean) ?? [];
  const concessions = parseConcessions(params.concessions);
  const ticketTotal = Number(params.ticketTotal ?? 0);
  const concessionTotal = Number(params.concessionTotal ?? 0);
  const serviceCharge = 50;
  const grandTotal = ticketTotal + concessionTotal + serviceCharge;

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.iconButton}>
            <SymbolView name="chevron.left" tintColor="#ffffff" size={26} />
          </Pressable>
          <Text style={styles.headerTitle}>Booking Summary</Text>
          <View style={styles.iconButton} />
        </View>

        {isLoading ? (
          <View style={styles.statePanel}>
            <ActivityIndicator color="#ffffff" />
          </View>
        ) : error || !movie ? (
          <View style={styles.statePanel}>
            <Text style={styles.stateText}>{error ?? "Movie not found"}</Text>
            <Pressable style={styles.retryButton} onPress={reload}>
              <Text style={styles.retryText}>Retry</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.content}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.ticketCard}>
                <View style={styles.movieBlock}>
                  <Image
                    source={{ uri: movie.posterUrl }}
                    style={styles.poster}
                    contentFit="cover"
                  />
                  <View style={styles.movieCopy}>
                    <Text style={styles.movieTitle} numberOfLines={2}>
                      {movie.title}
                    </Text>
                    <Text style={styles.movieMeta}>{movie.genre}</Text>
                    <Text style={styles.movieMeta}>
                      {Math.floor(movie.durationMinutes / 60)}h{" "}
                      {movie.durationMinutes % 60}m
                    </Text>
                    <Text style={styles.movieMeta}>
                      {movie.language}, {movie.format}
                    </Text>
                    <Text style={styles.movieMeta}>
                      {params.ticketType || "Classic"} Tickets
                    </Text>
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.cinemaBlock}>
                  <Text style={styles.infoLabel}>Cinema</Text>
                  <Text style={styles.infoValue}>
                    {params.location}: {params.hall}
                  </Text>
                </View>

                <View style={styles.infoGrid}>
                  <InfoColumn label="Date" value={formatDate(params.date)} />
                  <InfoColumn label="Seat" value={seats.join(", ") || "-"} />
                  <InfoColumn label="Start" value={params.time ?? "-"} />
                  <InfoColumn label="End" value="-" />
                </View>
              </View>

              <View style={styles.paymentCard}>
                <SummaryRow
                  title="Tickets"
                  subtitle={`${params.ticketType || "Classic"} tickets [x${seats.length}]`}
                  amount={ticketTotal}
                />
                <SummaryRow
                  title="Food & Beverage"
                  subtitle={
                    concessions.length > 0
                      ? concessions
                          .map((item) => `${item.name} [x${item.quantity}]`)
                          .join(", ")
                      : "No items selected"
                  }
                  amount={concessionTotal}
                />
                <SummaryRow
                  title="Charges"
                  subtitle="Service charge"
                  amount={serviceCharge}
                />

                <View style={styles.promoRow}>
                  <Text style={styles.promoText}>Promo Code</Text>
                  <View style={styles.promoBox} />
                </View>

                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Total Amount Payable</Text>
                  <Text style={styles.totalValue}>{formatPrice(grandTotal)}</Text>
                </View>
              </View>
            </ScrollView>

            <View style={styles.bottomBar}>
              <Pressable style={styles.payButton}>
                <Text style={styles.payText}>Proceed to payment</Text>
              </Pressable>
            </View>
          </>
        )}
      </SafeAreaView>
    </View>
  );
}

function InfoColumn({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoColumn}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function SummaryRow({
  title,
  subtitle,
  amount,
}: {
  title: string;
  subtitle: string;
  amount: number;
}) {
  return (
    <View style={styles.summaryRow}>
      <View style={styles.summaryCopy}>
        <Text style={styles.summaryTitle}>{title}</Text>
        <Text style={styles.summarySubtitle} numberOfLines={2}>
          {subtitle}
        </Text>
      </View>
      <Text style={styles.summaryAmount}>{formatPrice(amount)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#050505",
  },
  safeArea: {
    flex: 1,
  },
  header: {
    height: 58,
    maxWidth: 430,
    width: "100%",
    alignSelf: "center",
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "900",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    width: "100%",
    maxWidth: 430,
    alignSelf: "center",
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 112,
    gap: 22,
  },
  ticketCard: {
    borderWidth: 1,
    borderColor: "#5f5f5f",
    padding: 14,
  },
  movieBlock: {
    flexDirection: "row",
    gap: 14,
  },
  poster: {
    width: 118,
    height: 132,
    borderRadius: 4,
    backgroundColor: "#a8a8a8",
  },
  movieCopy: {
    flex: 1,
    gap: 7,
  },
  movieTitle: {
    color: "#ffffff",
    fontSize: 19,
    lineHeight: 23,
    fontWeight: "900",
  },
  movieMeta: {
    color: "#d0d0d0",
    fontSize: 12,
    lineHeight: 15,
    fontWeight: "700",
  },
  divider: {
    height: 1,
    backgroundColor: "#5f5f5f",
    marginVertical: 18,
  },
  cinemaBlock: {
    gap: 5,
    marginBottom: 16,
  },
  infoGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  infoColumn: {
    flex: 1,
    gap: 5,
  },
  infoLabel: {
    color: "#a8a8a8",
    fontSize: 11,
    fontWeight: "800",
  },
  infoValue: {
    color: "#ffffff",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "900",
  },
  paymentCard: {
    borderWidth: 1,
    borderColor: "#5f5f5f",
    padding: 16,
    gap: 18,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },
  summaryCopy: {
    flex: 1,
    gap: 5,
  },
  summaryTitle: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "900",
  },
  summarySubtitle: {
    color: "#a8a8a8",
    fontSize: 12,
    lineHeight: 15,
    fontWeight: "700",
  },
  summaryAmount: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "900",
  },
  promoRow: {
    minHeight: 44,
    borderTopWidth: 1,
    borderTopColor: "#5f5f5f",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 12,
  },
  promoText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "900",
  },
  promoBox: {
    width: 106,
    height: 34,
    borderRadius: 4,
    backgroundColor: "#6b6b6b",
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: "#5f5f5f",
    paddingTop: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  totalLabel: {
    flex: 1,
    color: "#ffffff",
    fontSize: 17,
    fontWeight: "900",
  },
  totalValue: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "900",
  },
  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    backgroundColor: "#050505",
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 22,
  },
  payButton: {
    width: "100%",
    maxWidth: 382,
    height: 48,
    borderRadius: 4,
    backgroundColor: "#b5b5b5",
    alignItems: "center",
    justifyContent: "center",
  },
  payText: {
    color: "#ffffff",
    fontSize: 17,
    fontWeight: "900",
  },
  statePanel: {
    flex: 1,
    minHeight: 420,
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
    paddingHorizontal: 24,
  },
  stateText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "800",
    textAlign: "center",
  },
  retryButton: {
    height: 40,
    minWidth: 104,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
  },
  retryText: {
    color: "#080808",
    fontSize: 14,
    fontWeight: "800",
  },
});
