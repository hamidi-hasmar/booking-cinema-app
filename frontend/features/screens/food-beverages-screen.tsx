import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SymbolView } from "expo-symbols";

import { useConcessionItems } from "../hooks/use-concession-items";
import {
  ConcessionCategory,
  ConcessionItem,
  SelectedConcessionItem,
} from "../types";

const TABS: Array<{ key: ConcessionCategory; label: string }> = [
  { key: "combo", label: "Combo" },
  { key: "food", label: "Food/Snacks" },
  { key: "beverage", label: "Beverages" },
];

function formatPrice(value: number) {
  return `RM ${(value / 100).toFixed(0)}`;
}

export function FoodBeveragesScreen() {
  const params = useLocalSearchParams<{
    id?: string;
    ticketType?: string;
    location?: string;
    hall?: string;
    date?: string;
    time?: string;
    showtimeId?: string;
    seats?: string;
    ticketTotal?: string;
  }>();
  const { items, isLoading, error, reload } = useConcessionItems();
  const [activeTab, setActiveTab] = useState<ConcessionCategory>("combo");
  const [selectedItems, setSelectedItems] = useState<SelectedConcessionItem[]>(
    [],
  );

  const filteredItems = items.filter((item) => item.category === activeTab);
  const itemCount = selectedItems.reduce((total, item) => total + item.quantity, 0);
  const subtotal = selectedItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );

  const serializedConcessions = useMemo(
    () =>
      JSON.stringify(
        selectedItems.map((item) => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
      ),
    [selectedItems],
  );

  function quantityFor(itemId: number) {
    return selectedItems.find((item) => item.id === itemId)?.quantity ?? 0;
  }

  function addItem(item: ConcessionItem) {
    setSelectedItems((currentItems) => {
      const existingItem = currentItems.find(
        (currentItem) => currentItem.id === item.id,
      );

      if (existingItem) {
        return currentItems.map((currentItem) =>
          currentItem.id === item.id
            ? { ...currentItem, quantity: currentItem.quantity + 1 }
            : currentItem,
        );
      }

      return [...currentItems, { ...item, quantity: 1 }];
    });
  }

  function removeItem(item: ConcessionItem) {
    setSelectedItems((currentItems) =>
      currentItems
        .map((currentItem) =>
          currentItem.id === item.id
            ? { ...currentItem, quantity: currentItem.quantity - 1 }
            : currentItem,
        )
        .filter((currentItem) => currentItem.quantity > 0),
    );
  }

  function goToSummary(concessions: string, concessionTotal: number) {
    if (!params.id) {
      return;
    }

    router.push({
      pathname: "/movies/booking-summary/[id]",
      params: {
        id: params.id,
        ticketType: params.ticketType ?? "",
        location: params.location ?? "",
        hall: params.hall ?? "",
        date: params.date ?? "",
        time: params.time ?? "",
        showtimeId: params.showtimeId ?? "",
        seats: params.seats ?? "",
        ticketTotal: params.ticketTotal ?? "0",
        concessions,
        concessionTotal: String(concessionTotal),
      },
    });
  }

  function skipFood() {
    goToSummary("[]", 0);
  }

  function confirmFood() {
    goToSummary(serializedConcessions, subtotal);
  }

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.iconButton}>
            <SymbolView name="chevron.left" tintColor="#ffffff" size={26} />
          </Pressable>
          <Text style={styles.headerTitle}>Beverages & Food</Text>
          <Pressable onPress={skipFood} style={styles.skipButton}>
            <Text style={styles.skipText}>Skip</Text>
            <SymbolView name="chevron.right" tintColor="#a8a8a8" size={15} />
          </Pressable>
        </View>

        <View style={styles.tabs}>
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;

            return (
              <Pressable
                key={tab.key}
                onPress={() => setActiveTab(tab.key)}
                style={styles.tabButton}
              >
                <Text style={[styles.tabText, isActive && styles.activeTabText]}>
                  {tab.label}
                </Text>
                {isActive && <View style={styles.activeTabIndicator} />}
              </Pressable>
            );
          })}
        </View>

        {isLoading ? (
          <View style={styles.statePanel}>
            <ActivityIndicator color="#ffffff" />
          </View>
        ) : error ? (
          <View style={styles.statePanel}>
            <Text style={styles.stateText}>{error}</Text>
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
              <View style={styles.grid}>
                {filteredItems.map((item) => (
                  <ConcessionCard
                    key={item.id}
                    item={item}
                    quantity={quantityFor(item.id)}
                    onAdd={() => addItem(item)}
                    onRemove={() => removeItem(item)}
                  />
                ))}
              </View>
            </ScrollView>

            <View style={styles.bottomArea}>
              {itemCount > 0 && (
                <View style={styles.subtotalPanel}>
                  <View style={styles.subtotalColumn}>
                    <Text style={styles.subtotalLabel}>Item</Text>
                    <Text style={styles.subtotalValue}>{itemCount}</Text>
                  </View>
                  <View style={styles.subtotalDivider} />
                  <View style={styles.subtotalColumn}>
                    <Text style={styles.subtotalLabel}>Sub-total</Text>
                    <Text style={styles.subtotalValue}>
                      {formatPrice(subtotal)}
                    </Text>
                  </View>
                </View>
              )}

              <Pressable
                onPress={confirmFood}
                style={[
                  styles.confirmButton,
                  itemCount === 0 && styles.disabledConfirmButton,
                ]}
              >
                <Text style={styles.confirmText}>Confirm</Text>
              </Pressable>
            </View>
          </>
        )}
      </SafeAreaView>
    </View>
  );
}

function ConcessionCard({
  item,
  quantity,
  onAdd,
  onRemove,
}: {
  item: ConcessionItem;
  quantity: number;
  onAdd: () => void;
  onRemove: () => void;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.imagePlaceholder}>
        {item.discountPercent ? (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{item.discountPercent}% off</Text>
          </View>
        ) : null}
      </View>
      <Text style={styles.itemName} numberOfLines={1}>
        {item.name}
      </Text>
      <Text style={styles.itemDescription} numberOfLines={2}>
        {item.description}
      </Text>
      <View style={styles.priceRow}>
        <View>
          {item.originalPrice ? (
            <Text style={styles.originalPrice}>
              {formatPrice(item.originalPrice)}
            </Text>
          ) : null}
          <Text style={styles.price}>{formatPrice(item.price)}</Text>
        </View>
        <View style={styles.stepper}>
          <Pressable onPress={onRemove} style={styles.stepButton}>
            <Text style={styles.stepText}>-</Text>
          </Pressable>
          <Text style={styles.quantityText}>{quantity}</Text>
          <Pressable onPress={onAdd} style={styles.stepButton}>
            <Text style={styles.stepText}>+</Text>
          </Pressable>
        </View>
      </View>
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
    alignItems: "flex-start",
    justifyContent: "center",
  },
  headerTitle: {
    color: "#ffffff",
    fontSize: 18,
    lineHeight: 22,
    fontWeight: "900",
  },
  skipButton: {
    width: 54,
    height: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  skipText: {
    color: "#a8a8a8",
    fontSize: 13,
    fontWeight: "900",
  },
  tabs: {
    width: "100%",
    maxWidth: 430,
    alignSelf: "center",
    height: 58,
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#202020",
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  tabText: {
    color: "#a0a0a0",
    fontSize: 15,
    lineHeight: 18,
    fontWeight: "900",
    paddingBottom: 12,
  },
  activeTabText: {
    color: "#ffffff",
  },
  activeTabIndicator: {
    height: 2,
    width: "42%",
    backgroundColor: "#ffffff",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    width: "100%",
    maxWidth: 430,
    alignSelf: "center",
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 138,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
  },
  card: {
    width: "48%",
    minHeight: 238,
    borderRadius: 5,
    backgroundColor: "#111111",
    padding: 10,
  },
  imagePlaceholder: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 4,
    backgroundColor: "#a8a8a8",
    marginBottom: 10,
    alignItems: "flex-end",
    justifyContent: "flex-end",
    padding: 7,
  },
  discountBadge: {
    borderRadius: 3,
    backgroundColor: "#a5a5a5",
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  discountText: {
    color: "#ffffff",
    fontSize: 8,
    fontWeight: "900",
  },
  itemName: {
    color: "#ffffff",
    fontSize: 12,
    lineHeight: 15,
    fontWeight: "900",
  },
  itemDescription: {
    minHeight: 28,
    marginTop: 3,
    color: "#b5b5b5",
    fontSize: 9,
    lineHeight: 12,
    fontWeight: "700",
  },
  priceRow: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 8,
  },
  originalPrice: {
    color: "#b5b5b5",
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "800",
    textDecorationLine: "line-through",
  },
  price: {
    color: "#ffffff",
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "900",
  },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stepButton: {
    width: 19,
    height: 19,
    borderRadius: 2,
    backgroundColor: "#d4d4d4",
    alignItems: "center",
    justifyContent: "center",
  },
  stepText: {
    color: "#151515",
    fontSize: 13,
    lineHeight: 16,
    fontWeight: "900",
  },
  quantityText: {
    minWidth: 12,
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "900",
    textAlign: "center",
  },
  bottomArea: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    backgroundColor: "#050505",
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 22,
    gap: 14,
  },
  subtotalPanel: {
    minHeight: 64,
    width: 198,
    borderWidth: 1,
    borderColor: "#5d5d5d",
    flexDirection: "row",
  },
  subtotalColumn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },
  subtotalDivider: {
    width: 1,
    backgroundColor: "#5d5d5d",
  },
  subtotalLabel: {
    color: "#bdbdbd",
    fontSize: 11,
    textTransform: "uppercase",
    fontWeight: "900",
  },
  subtotalValue: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "900",
  },
  confirmButton: {
    width: "100%",
    maxWidth: 382,
    height: 48,
    borderRadius: 4,
    backgroundColor: "#b5b5b5",
    alignItems: "center",
    justifyContent: "center",
  },
  disabledConfirmButton: {
    opacity: 0.6,
  },
  confirmText: {
    color: "#ffffff",
    fontSize: 18,
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
