import { router, useLocalSearchParams } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useMovieBookingOptions } from "../hooks/use-movie-booking-options";
import { useShowtimeSeats } from "../hooks/use-showtime-seats";
import {
  BookingDate,
  BookingHall,
  BookingLocation,
  BookingTicketType,
  BookingTime,
  ShowtimeSeat,
} from "../types";

type DropdownKey = "location" | "hall" | null;

function formatPrice(value: number) {
  return `RM ${(value / 100).toFixed(0)}`;
}

function formatDate(value: string) {
  const date = new Date(`${value}T00:00:00`);

  return {
    day: new Intl.DateTimeFormat("en", { weekday: "short" }).format(date),
    date: new Intl.DateTimeFormat("en", { day: "2-digit" }).format(date),
  };
}

export function MovieBookingOptionsScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const movieId = params.id ? Number(params.id) : null;
  const { bookingOptions, isLoading, error, reload } =
    useMovieBookingOptions(movieId);
  const [selectedTicketType, setSelectedTicketType] =
    useState<BookingTicketType | null>(null);
  const [selectedLocation, setSelectedLocation] =
    useState<BookingLocation | null>(null);
  const [selectedHall, setSelectedHall] = useState<BookingHall | null>(null);
  const [selectedDate, setSelectedDate] = useState<BookingDate | null>(null);
  const [selectedTime, setSelectedTime] = useState<BookingTime | null>(null);
  const [openDropdown, setOpenDropdown] = useState<DropdownKey>(null);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [seatError, setSeatError] = useState<string | null>(null);
  const {
    seatMap,
    isLoading: isLoadingSeats,
    error: seatMapError,
    lockSeat,
    releaseSeat,
  } = useShowtimeSeats(selectedTime?.id ?? null);

  const locations = bookingOptions?.locations ?? [];
  const ticketTypes = bookingOptions?.ticketTypes ?? [];
  const availableDates = selectedHall?.dates ?? [];
  const ticketPrice = selectedTicketType?.minPrice ?? 0;
  const ticketSubtotal = selectedSeats.length * ticketPrice;

  const canProceed = Boolean(
    selectedTicketType &&
      selectedLocation &&
      selectedHall &&
      selectedDate &&
      selectedTime &&
      selectedSeats.length > 0,
  );

  const selectedSummary = useMemo(() => {
    if (!selectedLocation || !selectedHall || !selectedDate || !selectedTime) {
      return null;
    }

    return [
      selectedLocation.name,
      selectedHall.name,
      selectedDate.date,
      selectedTime.startTime,
    ].join(" - ");
  }, [selectedDate, selectedHall, selectedLocation, selectedTime]);

  useEffect(() => {
    setSelectedSeats([]);
    setSeatError(null);
  }, [selectedTime?.id]);

  useEffect(() => {
    if (!seatMap) {
      return;
    }

    setSelectedSeats(
      seatMap.seats
        .filter((seat) => seat.lockedByCurrentUser)
        .map((seat) => seat.seatNumber),
    );
  }, [seatMap]);

  function chooseLocation(location: BookingLocation) {
    setSelectedLocation(location);
    setSelectedHall(null);
    setSelectedDate(null);
    setSelectedTime(null);
    setOpenDropdown(null);
  }

  function chooseHall(hall: BookingHall) {
    setSelectedHall(hall);
    setSelectedDate(null);
    setSelectedTime(null);
    setOpenDropdown(null);
  }

  function chooseDate(date: BookingDate) {
    setSelectedDate(date);
    setSelectedTime(null);
  }

  async function toggleSeat(seat: ShowtimeSeat) {
    if (!selectedTime) {
      return;
    }

    setSeatError(null);

    try {
      if (seat.lockedByCurrentUser) {
        await releaseSeat(seat.seatNumber);
        setSelectedSeats((currentSeats) =>
          currentSeats.filter((seatNumber) => seatNumber !== seat.seatNumber),
        );
        return;
      }

      if (seat.status === "locked") {
        setSeatError("Seat is already locked by another user");
        return;
      }

      await lockSeat(seat.seatNumber);
      setSelectedSeats((currentSeats) =>
        currentSeats.includes(seat.seatNumber)
          ? currentSeats
          : [...currentSeats, seat.seatNumber],
      );
    } catch (lockError) {
      setSeatError(
        lockError instanceof Error ? lockError.message : "Unable to update seat",
      );
    }
  }

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.iconButton}>
            <SymbolView name="chevron.left" tintColor="#ffffff" size={26} />
          </Pressable>
          <Text style={styles.headerTitle}>Ticket Booking</Text>
          <View style={styles.iconButton} />
        </View>

        {isLoading ? (
          <View style={styles.statePanel}>
            <ActivityIndicator color="#ffffff" />
          </View>
        ) : error || !bookingOptions ? (
          <View style={styles.statePanel}>
            <Text style={styles.stateText}>
              {error ?? "Booking options not found"}
            </Text>
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
              <Text style={styles.prompt}>
                Where would you like to see the movie? Kindly select as
                appropriate
              </Text>

              <View style={styles.ticketGrid}>
                {ticketTypes.map((ticketType) => {
                  const isSelected =
                    selectedTicketType?.label === ticketType.label;

                  return (
                    <Pressable
                      key={ticketType.label}
                      onPress={() => setSelectedTicketType(ticketType)}
                      style={[
                        styles.ticketCard,
                        isSelected && styles.selectedTicketCard,
                      ]}
                    >
                      <Text style={styles.ticketCaption}>Tickets from</Text>
                      <Text style={styles.ticketPrice}>
                        {formatPrice(ticketType.minPrice)} -{" "}
                        {formatPrice(ticketType.maxPrice)}
                      </Text>
                      <Text style={styles.ticketLabel}>{ticketType.label}</Text>
                    </Pressable>
                  );
                })}
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Location</Text>
                <DropdownButton
                  label={selectedLocation?.name ?? "Select Location"}
                  isOpen={openDropdown === "location"}
                  onPress={() =>
                    setOpenDropdown(
                      openDropdown === "location" ? null : "location",
                    )
                  }
                />
                {openDropdown === "location" && (
                  <View style={styles.dropdownList}>
                    {locations.map((location) => (
                      <Pressable
                        key={location.id}
                        onPress={() => chooseLocation(location)}
                        style={styles.dropdownItem}
                      >
                        <Text style={styles.dropdownTitle}>
                          {location.name}
                        </Text>
                        <Text style={styles.dropdownSubtitle}>
                          {location.city}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                )}
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Cinema Location</Text>
                <DropdownButton
                  label={selectedHall?.name ?? "Select Cinema Hall"}
                  disabled={!selectedLocation}
                  isOpen={openDropdown === "hall"}
                  onPress={() =>
                    selectedLocation &&
                    setOpenDropdown(openDropdown === "hall" ? null : "hall")
                  }
                />
                {openDropdown === "hall" && selectedLocation && (
                  <View style={styles.dropdownList}>
                    {selectedLocation.halls.map((hall) => (
                      <Pressable
                        key={hall.id}
                        onPress={() => chooseHall(hall)}
                        style={styles.dropdownItem}
                      >
                        <Text style={styles.dropdownTitle}>{hall.name}</Text>
                        <Text style={styles.dropdownSubtitle}>
                          {hall.seatRows} rows - {hall.seatsPerRow} seats per
                          row
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                )}
              </View>

              <View style={styles.sectionBlock}>
                <Text style={styles.fieldLabel}>Select a date</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.dateList}
                >
                  {availableDates.map((date) => {
                    const formattedDate = formatDate(date.date);
                    const isSelected = selectedDate?.date === date.date;

                    return (
                      <Pressable
                        key={date.date}
                        onPress={() => chooseDate(date)}
                        style={[
                          styles.dateButton,
                          isSelected && styles.selectedDateButton,
                        ]}
                      >
                        <Text
                          style={[
                            styles.dateDay,
                            isSelected && styles.selectedDateText,
                          ]}
                        >
                          {formattedDate.day}
                        </Text>
                        <Text
                          style={[
                            styles.dateNumber,
                            isSelected && styles.selectedDateText,
                          ]}
                        >
                          {formattedDate.date}
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>

              <View style={styles.sectionBlock}>
                <Text style={styles.fieldLabel}>Available Time</Text>
                <View style={styles.timeGrid}>
                  {(selectedDate?.times ?? []).map((time) => {
                    const isSelected = selectedTime?.id === time.id;

                    return (
                      <Pressable
                        key={time.id}
                        onPress={() => setSelectedTime(time)}
                        style={[
                          styles.timeButton,
                          isSelected && styles.selectedTimeButton,
                        ]}
                      >
                        <Text
                          style={[
                            styles.timeText,
                            isSelected && styles.selectedTimeText,
                          ]}
                        >
                          {time.startTime}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <View style={styles.seatHeader}>
                <Text style={styles.seatTitle}>Select Seat</Text>
                <View style={styles.legendRow}>
                  <LegendItem color="#4f4f4f" label="Available" />
                  <LegendItem color="#7c7c7c" label="Unavailable" />
                  <LegendItem color="#c7c7c7" label="Selected" />
                </View>
              </View>

              <SeatMap
                seatMap={seatMap}
                selectedTime={selectedTime}
                selectedSeats={selectedSeats}
                isLoadingSeats={isLoadingSeats}
                seatMapError={seatMapError}
                onSeatPress={toggleSeat}
              />

              {seatError && <Text style={styles.seatError}>{seatError}</Text>}

              <View style={styles.seatSummary}>
                <View style={styles.seatSummaryColumn}>
                  <Text style={styles.seatSummaryLabel}>Seat</Text>
                  <View style={styles.selectedSeatList}>
                    {selectedSeats.length > 0 ? (
                      selectedSeats.map((seatNumber) => (
                        <Text key={seatNumber} style={styles.selectedSeatPill}>
                          {seatNumber}
                        </Text>
                      ))
                    ) : (
                      <Text style={styles.emptySeatText}>-</Text>
                    )}
                  </View>
                </View>
                <View style={styles.seatSummaryDivider} />
                <View style={styles.seatSummaryColumn}>
                  <Text style={styles.seatSummaryLabel}>Sub-total</Text>
                  <Text style={styles.seatSummaryPrice}>
                    {formatPrice(ticketSubtotal)}
                  </Text>
                </View>
              </View>

              {selectedSummary && (
                <Text style={styles.summaryText}>{selectedSummary}</Text>
              )}
            </ScrollView>

            <View style={styles.bottomBar}>
              <Pressable
                style={styles.cancelButton}
                onPress={() => router.back()}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                disabled={!canProceed}
                style={[
                  styles.proceedButton,
                  !canProceed && styles.disabledProceedButton,
                ]}
              >
                <Text style={styles.proceedText}>Proceed</Text>
              </Pressable>
            </View>
          </>
        )}
      </SafeAreaView>
    </View>
  );
}

function SeatMap({
  seatMap,
  selectedTime,
  selectedSeats,
  isLoadingSeats,
  seatMapError,
  onSeatPress,
}: {
  seatMap: { seatRows: number; seats: ShowtimeSeat[] } | null;
  selectedTime: BookingTime | null;
  selectedSeats: string[];
  isLoadingSeats: boolean;
  seatMapError: string | null;
  onSeatPress: (seat: ShowtimeSeat) => void;
}) {
  if (!selectedTime) {
    return <Text style={styles.seatMessage}>Select a time to view seats</Text>;
  }

  if (isLoadingSeats && !seatMap) {
    return (
      <View style={styles.seatStatePanel}>
        <ActivityIndicator color="#ffffff" />
      </View>
    );
  }

  if (seatMapError) {
    return <Text style={styles.seatMessage}>{seatMapError}</Text>;
  }

  if (!seatMap) {
    return null;
  }

  return (
    <View style={styles.seatMapBlock}>
      <View style={styles.screenArc}>
        <View style={styles.screenCurve} />
        <Text style={styles.screenText}>Screen</Text>
      </View>

      <View style={styles.seatGrid}>
        {Array.from({ length: seatMap.seatRows }).map((_, rowIndex) => {
          const rowLabel = String.fromCharCode("A".charCodeAt(0) + rowIndex);
          const rowSeats = seatMap.seats.filter((seat) => seat.row === rowLabel);

          return (
            <View key={rowLabel} style={styles.seatRow}>
              <Text style={styles.rowLabel}>{rowLabel}</Text>
              <View style={styles.rowSeats}>
                {rowSeats.map((seat) => {
                  const isSelected =
                    seat.lockedByCurrentUser ||
                    selectedSeats.includes(seat.seatNumber);
                  const isUnavailable = seat.status === "locked" && !isSelected;

                  return (
                    <Pressable
                      key={seat.seatNumber}
                      disabled={isUnavailable}
                      onPress={() => onSeatPress(seat)}
                      style={[
                        styles.seatButton,
                        isUnavailable && styles.unavailableSeatButton,
                        isSelected && styles.selectedSeatButton,
                      ]}
                    >
                      <Text
                        style={[
                          styles.seatButtonText,
                          isSelected && styles.selectedSeatButtonText,
                        ]}
                      >
                        {seat.column}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              <Text style={styles.rowLabel}>{rowLabel}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function DropdownButton({
  label,
  disabled,
  isOpen,
  onPress,
}: {
  label: string;
  disabled?: boolean;
  isOpen: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={[styles.dropdownButton, disabled && styles.disabledDropdown]}
    >
      <Text
        style={[styles.dropdownButtonText, disabled && styles.disabledText]}
        numberOfLines={1}
      >
        {label}
      </Text>
      <SymbolView
        name={isOpen ? "chevron.up" : "chevron.down"}
        tintColor={disabled ? "#8f8f8f" : "#121212"}
        size={18}
      />
    </Pressable>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendSwatch, { backgroundColor: color }]} />
      <Text style={styles.legendText}>{label}</Text>
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
    lineHeight: 22,
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
    paddingTop: 18,
    paddingBottom: 124,
  },
  prompt: {
    color: "#ffffff",
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "700",
    marginBottom: 22,
  },
  ticketGrid: {
    flexDirection: "row",
    gap: 14,
    marginBottom: 20,
  },
  ticketCard: {
    flex: 1,
    minHeight: 88,
    borderRadius: 6,
    backgroundColor: "#343434",
    padding: 14,
    justifyContent: "flex-end",
    borderWidth: 1,
    borderColor: "#343434",
  },
  selectedTicketCard: {
    borderColor: "#ffffff",
    backgroundColor: "#414141",
  },
  ticketCaption: {
    color: "#bdbdbd",
    fontSize: 10,
    fontWeight: "700",
  },
  ticketPrice: {
    color: "#ffffff",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "900",
  },
  ticketLabel: {
    marginTop: 8,
    color: "#dcdcdc",
    fontSize: 11,
    fontWeight: "800",
  },
  fieldGroup: {
    marginBottom: 17,
    gap: 8,
  },
  fieldLabel: {
    color: "#ffffff",
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "900",
  },
  dropdownButton: {
    height: 50,
    borderRadius: 7,
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  disabledDropdown: {
    backgroundColor: "#d5d5d5",
  },
  dropdownButtonText: {
    flex: 1,
    color: "#1b1b1b",
    fontSize: 14,
    fontWeight: "700",
  },
  disabledText: {
    color: "#7a7a7a",
  },
  dropdownList: {
    borderRadius: 7,
    backgroundColor: "#1f1f1f",
    overflow: "hidden",
  },
  dropdownItem: {
    minHeight: 58,
    justifyContent: "center",
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#303030",
  },
  dropdownTitle: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "800",
  },
  dropdownSubtitle: {
    marginTop: 4,
    color: "#adadad",
    fontSize: 11,
    fontWeight: "700",
  },
  sectionBlock: {
    gap: 10,
    marginBottom: 20,
  },
  dateList: {
    gap: 14,
    paddingRight: 8,
  },
  dateButton: {
    width: 44,
    minHeight: 52,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  selectedDateButton: {
    backgroundColor: "#ffffff",
  },
  dateDay: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "900",
  },
  dateNumber: {
    color: "#bdbdbd",
    fontSize: 11,
    fontWeight: "800",
  },
  selectedDateText: {
    color: "#101010",
  },
  timeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
  },
  timeButton: {
    minWidth: 78,
    height: 35,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  selectedTimeButton: {
    backgroundColor: "#ffffff",
  },
  timeText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "900",
  },
  selectedTimeText: {
    color: "#101010",
  },
  seatHeader: {
    alignItems: "center",
    gap: 16,
    paddingTop: 6,
  },
  seatTitle: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "900",
  },
  legendRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  legendSwatch: {
    width: 16,
    height: 16,
    borderRadius: 3,
  },
  legendText: {
    color: "#b8b8b8",
    fontSize: 11,
    fontWeight: "700",
  },
  seatMapBlock: {
    paddingTop: 18,
    gap: 18,
  },
  screenArc: {
    alignItems: "center",
    gap: 10,
    marginBottom: 4,
  },
  screenCurve: {
    width: "72%",
    height: 18,
    borderTopWidth: 10,
    borderTopColor: "#b5b5b5",
    borderRadius: 120,
  },
  screenText: {
    color: "#bdbdbd",
    fontSize: 12,
    fontWeight: "800",
  },
  seatGrid: {
    gap: 12,
  },
  seatRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  rowLabel: {
    width: 16,
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "800",
    textAlign: "center",
  },
  rowSeats: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    gap: 9,
  },
  seatButton: {
    width: 22,
    height: 22,
    borderRadius: 4,
    backgroundColor: "#4f4f4f",
    alignItems: "center",
    justifyContent: "center",
  },
  unavailableSeatButton: {
    backgroundColor: "#7c7c7c",
  },
  selectedSeatButton: {
    backgroundColor: "#c7c7c7",
  },
  seatButtonText: {
    color: "#dddddd",
    fontSize: 8,
    fontWeight: "900",
  },
  selectedSeatButtonText: {
    color: "#111111",
  },
  seatMessage: {
    marginTop: 18,
    color: "#bdbdbd",
    fontSize: 12,
    fontWeight: "800",
    textAlign: "center",
  },
  seatError: {
    marginTop: 14,
    color: "#ff9f9f",
    fontSize: 12,
    fontWeight: "800",
    textAlign: "center",
  },
  seatStatePanel: {
    minHeight: 220,
    alignItems: "center",
    justifyContent: "center",
  },
  seatSummary: {
    marginTop: 24,
    minHeight: 70,
    width: "64%",
    alignSelf: "center",
    borderWidth: 1,
    borderColor: "#5d5d5d",
    flexDirection: "row",
  },
  seatSummaryColumn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 8,
  },
  seatSummaryDivider: {
    width: 1,
    backgroundColor: "#5d5d5d",
  },
  seatSummaryLabel: {
    color: "#bdbdbd",
    fontSize: 11,
    textTransform: "uppercase",
    fontWeight: "900",
  },
  selectedSeatList: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 5,
  },
  selectedSeatPill: {
    minWidth: 28,
    borderWidth: 1,
    borderColor: "#ffffff",
    borderRadius: 3,
    paddingHorizontal: 5,
    paddingVertical: 2,
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "900",
    textAlign: "center",
  },
  emptySeatText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "900",
  },
  seatSummaryPrice: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "900",
  },
  summaryText: {
    marginTop: 20,
    color: "#cfcfcf",
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "700",
    textAlign: "center",
  },
  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    flexDirection: "row",
    gap: 14,
    backgroundColor: "#050505",
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 22,
  },
  cancelButton: {
    flex: 1,
    height: 48,
    borderRadius: 4,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
  cancelText: {
    color: "#111111",
    fontSize: 16,
    fontWeight: "900",
  },
  proceedButton: {
    flex: 1,
    height: 48,
    borderRadius: 4,
    backgroundColor: "#b5b5b5",
    alignItems: "center",
    justifyContent: "center",
  },
  disabledProceedButton: {
    opacity: 0.5,
  },
  proceedText: {
    color: "#ffffff",
    fontSize: 16,
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
