import { router, useLocalSearchParams } from "expo-router";
import { SymbolView } from "expo-symbols";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export function PaymentSuccessScreen() {
  const params = useLocalSearchParams<{ bookingReference?: string }>();

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        <View style={styles.content}>
          <View style={styles.checkCircle}>
            <SymbolView name="checkmark" tintColor="#ffffff" size={86} />
          </View>

          <Text style={styles.title}>Congratulations!</Text>
          <Text style={styles.message}>
            Your ticket purchase is successful, a confirmation has been sent to
            your e-mail
          </Text>
          {params.bookingReference && (
            <Text style={styles.reference}>{params.bookingReference}</Text>
          )}

          <View style={styles.actions}>
            <Pressable
              onPress={() => router.replace("/")}
              style={styles.actionButton}
            >
              <SymbolView
                name="chevron.left.circle"
                tintColor="#ffffff"
                size={18}
              />
              <Text style={styles.actionText}>Main menu</Text>
            </Pressable>
            <Pressable style={styles.actionButton}>
              <SymbolView name="ticket" tintColor="#ffffff" size={18} />
              <Text style={styles.actionText}>View ticket</Text>
            </Pressable>
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
  content: {
    flex: 1,
    width: "100%",
    maxWidth: 430,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 38,
  },
  checkCircle: {
    width: 124,
    height: 124,
    borderRadius: 62,
    backgroundColor: "#a7a7a7",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 54,
  },
  title: {
    color: "#ffffff",
    fontSize: 21,
    fontWeight: "900",
    marginBottom: 26,
  },
  message: {
    color: "#cfcfcf",
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 12,
  },
  reference: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "900",
    marginBottom: 72,
  },
  actions: {
    flexDirection: "row",
    gap: 14,
  },
  actionButton: {
    height: 39,
    minWidth: 120,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#777777",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 12,
  },
  actionText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "900",
  },
});
