import { router, useLocalSearchParams } from "expo-router";
import { SymbolView } from "expo-symbols";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type PaymentMethod = {
  key: string;
  title: string;
  subtitle: string;
  icon: "creditcard" | "building.columns" | "wallet.pass";
};

const PAYMENT_METHODS: PaymentMethod[] = [
  {
    key: "debit_card",
    title: "Debit card",
    subtitle: "Pay with Visa",
    icon: "creditcard",
  },
  {
    key: "bank_transfer",
    title: "Bank Transfer",
    subtitle: "Make a transfer from your bank account",
    icon: "building.columns",
  },
  {
    key: "crypto_wallet",
    title: "Crypto wallets",
    subtitle: "Pay from your cryptocurrency wallet",
    icon: "wallet.pass",
  },
];

type PaymentRouteParams = {
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
  grandTotal?: string;
};

export function PaymentMethodScreen() {
  const params = useLocalSearchParams<PaymentRouteParams>();

  function chooseMethod(method: PaymentMethod) {
    router.push({
      pathname: "/movies/card-payment/[id]",
      params: {
        ...params,
        id: params.id ?? "",
        paymentMethod: method.key,
      },
    });
  }

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.iconButton}>
            <SymbolView name="chevron.left" tintColor="#ffffff" size={26} />
          </Pressable>
          <Text style={styles.headerTitle}>Payment</Text>
          <View style={styles.iconButton} />
        </View>

        <View style={styles.content}>
          <Text style={styles.prompt}>
            How would you like to make the payment? Kindly select your preferred
            option
          </Text>

          <View style={styles.methodList}>
            {PAYMENT_METHODS.map((method) => (
              <Pressable
                key={method.key}
                onPress={() => chooseMethod(method)}
                style={styles.methodRow}
              >
                <View style={styles.methodIcon}>
                  <SymbolView name={method.icon} tintColor="#ffffff" size={20} />
                </View>
                <View style={styles.methodCopy}>
                  <Text style={styles.methodTitle}>{method.title}</Text>
                  <Text style={styles.methodSubtitle}>{method.subtitle}</Text>
                </View>
                <SymbolView name="chevron.right" tintColor="#ffffff" size={17} />
              </Pressable>
            ))}
          </View>
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
    lineHeight: 18,
    fontWeight: "800",
    marginBottom: 22,
  },
  methodList: {
    backgroundColor: "#0d0d0d",
  },
  methodRow: {
    minHeight: 72,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#232323",
  },
  methodIcon: {
    width: 28,
    alignItems: "center",
  },
  methodCopy: {
    flex: 1,
    gap: 4,
  },
  methodTitle: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "900",
  },
  methodSubtitle: {
    color: "#a8a8a8",
    fontSize: 10,
    fontWeight: "700",
  },
});
