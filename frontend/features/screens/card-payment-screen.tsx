import { router, useLocalSearchParams } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { createBookingTransaction } from "../api/movie-api";
import { SelectedConcessionItem } from "../types";

type SummaryConcession = {
  id: number;
  name: string;
  quantity: number;
  price: number;
};

type CardPaymentRouteParams = {
  id?: string;
  ticketType?: string;
  location?: string;
  hall?: string;
  date?: string;
  time?: string;
  showtimeId?: string;
  seats?: string;
  ticketTotal?: string;
  concessions?: string;
  concessionTotal?: string;
  grandTotal?: string;
  paymentMethod?: string;
};

function formatPrice(value: number) {
  return `RM ${(value / 100).toFixed(0)}`;
}

function parseConcessions(value?: string): SelectedConcessionItem[] {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value) as SummaryConcession[];

    return Array.isArray(parsed)
      ? parsed.map((item) => ({
          id: item.id,
          name: item.name,
          description: "",
          category: "combo",
          price: item.price,
          originalPrice: null,
          discountPercent: null,
          imageUrl: null,
          quantity: item.quantity,
        }))
      : [];
  } catch {
    return [];
  }
}

export function CardPaymentScreen() {
  const params = useLocalSearchParams<CardPaymentRouteParams>();
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [saveCard, setSaveCard] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const grandTotal = Number(params.grandTotal ?? 0);

  async function submitPayment() {
    setIsSubmitting(true);

    try {
      const booking = await createBookingTransaction({
        showtimeId: Number(params.showtimeId ?? 0),
        ticketType: params.ticketType ?? "Classic",
        location: params.location ?? "",
        cinemaHall: params.hall ?? "",
        showDate: params.date ?? "",
        startTime: params.time ?? "",
        seats: params.seats?.split(",").filter(Boolean) ?? [],
        concessions: parseConcessions(params.concessions),
        ticketTotal: Number(params.ticketTotal ?? 0),
        concessionTotal: Number(params.concessionTotal ?? 0),
        grandTotal,
        paymentMethod: params.paymentMethod ?? "debit_card",
        cardNumber,
      });

      router.replace({
        pathname: "/movies/payment-success/[id]",
        params: {
          id: params.id ?? "",
          bookingReference: booking.reference,
        },
      });
    } catch {
      // Keep the mock payment form silent for this demo flow.
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.iconButton}>
            <SymbolView name="chevron.left" tintColor="#ffffff" size={26} />
          </Pressable>
          <Text style={styles.headerTitle}>Card payment</Text>
          <View style={styles.iconButton} />
        </View>

        <View style={styles.content}>
          <Text style={styles.prompt}>Please enter your card details</Text>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Card number</Text>
            <TextInput
              value={cardNumber}
              onChangeText={setCardNumber}
              placeholder="Enter card number"
              placeholderTextColor="#c7c7c7"
              keyboardType="number-pad"
              style={styles.input}
            />
          </View>

          <View style={styles.row}>
            <View style={styles.halfField}>
              <Text style={styles.label}>Expiry date</Text>
              <TextInput
                value={expiryDate}
                onChangeText={setExpiryDate}
                placeholder="MM/YY"
                placeholderTextColor="#c7c7c7"
                style={styles.input}
              />
            </View>
            <View style={styles.halfField}>
              <Text style={styles.label}>CVV2</Text>
              <TextInput
                value={cvv}
                onChangeText={setCvv}
                placeholder="Enter CVV"
                placeholderTextColor="#c7c7c7"
                keyboardType="number-pad"
                secureTextEntry
                style={styles.input}
              />
            </View>
          </View>

          <Pressable
            disabled={isSubmitting}
            onPress={submitPayment}
            style={[styles.payButton, isSubmitting && styles.disabledButton]}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.payText}>Pay {formatPrice(grandTotal)}</Text>
            )}
          </Pressable>

          <Pressable
            onPress={() => setSaveCard((current) => !current)}
            style={styles.checkboxRow}
          >
            <View style={[styles.checkbox, saveCard && styles.checkedBox]}>
              {saveCard && (
                <SymbolView name="checkmark" tintColor="#111111" size={12} />
              )}
            </View>
            <Text style={styles.checkboxText}>
              Save card info for future transactions
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
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
  content: {
    width: "100%",
    maxWidth: 430,
    alignSelf: "center",
    paddingHorizontal: 24,
    paddingTop: 28,
  },
  prompt: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 22,
  },
  fieldGroup: {
    gap: 8,
    marginBottom: 17,
  },
  label: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "800",
  },
  input: {
    height: 48,
    borderRadius: 5,
    backgroundColor: "#4d4d4d",
    color: "#ffffff",
    paddingHorizontal: 14,
    fontSize: 14,
    fontWeight: "700",
  },
  row: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  halfField: {
    flex: 1,
    gap: 8,
  },
  payButton: {
    height: 48,
    borderRadius: 4,
    backgroundColor: "#b5b5b5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  disabledButton: {
    opacity: 0.65,
  },
  payText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "900",
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  checkbox: {
    width: 17,
    height: 17,
    borderRadius: 3,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
  checkedBox: {
    backgroundColor: "#d6d6d6",
  },
  checkboxText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "800",
  },
});
