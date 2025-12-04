import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function FooterDock() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <View style={[styles.dockFooter, { paddingBottom: insets.bottom || 12 }]}>
        <View style={styles.footerIcons}>

          <TouchableOpacity onPress={() => navigation.navigate("Home")}>
            <View style={styles.iconContainer}>
              <Ionicons name="home" size={30} color="#d7fc5a" />
              <Text style={styles.footerLabel}>Home</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate("Standings")}>
            <View style={styles.iconContainer}>
              <Ionicons name="stats-chart" size={30} color="#d7fc5a" />
              <Text style={styles.footerLabel}>Standings</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate("Favourites")}>
            <View style={styles.iconContainer}>
              <Ionicons name="heart" size={30} color="#d7fc5a" />
              <Text style={styles.footerLabel}>Favourites</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate("News")}>
            <View style={styles.iconContainer}>
              <Ionicons name="newspaper" size={30} color="#d7fc5a" />
              <Text style={styles.footerLabel}>News</Text>
            </View>
          </TouchableOpacity>

        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 100,
    justifyContent: "flex-end",
  },
  dockFooter: {
    marginHorizontal: 20,
    marginBottom: 8,
    backgroundColor: "rgba(0, 0, 0, 0.88)",
    borderRadius: 28,
    paddingVertical: 14,
    paddingHorizontal: 10,
  },
  footerIcons: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  footerLabel: {
    color: "#d7fc5a",
    fontSize: 13,
    marginTop: 4,
    fontWeight: "600",
  },
});
