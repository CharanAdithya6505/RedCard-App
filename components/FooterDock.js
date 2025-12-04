import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function FooterDock() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <View style={[styles.dockFooter, { paddingBottom: insets.bottom || 12 }]}>
        <View style={styles.footerIcons}>
          <TouchableOpacity style={styles.iconWrapper} onPress={() => navigation.navigate("Home")}>
            <Ionicons name="home" size={28} color="#d7fc5a" />
            <Text style={styles.footerLabel}>Home</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconWrapper} onPress={() => navigation.navigate("Standings")}>
            <Ionicons name="stats-chart" size={28} color="#d7fc5a" />
            <Text style={styles.footerLabel}>Standings</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconWrapper} onPress={() => navigation.navigate("Favourites")}>
            <MaterialCommunityIcons name="soccer" size={28} color="#d7fc5a" />
            <Text style={styles.footerLabel}>Teams</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconWrapper} onPress={() => navigation.navigate("News")}>
            <Ionicons name="newspaper" size={28} color="#d7fc5a" />
            <Text style={styles.footerLabel}>News</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconWrapper} onPress={() => navigation.navigate("Profile")}>
            <Ionicons name="person-circle" size={28} color="#d7fc5a" />
            <Text style={styles.footerLabel}>Profile</Text>
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
    height: 85,
    justifyContent: "flex-end",
  },
  dockFooter: {
    marginHorizontal: 20,
    marginBottom: 12,
    backgroundColor: "rgba(0, 0, 0, 0.88)",
    borderRadius: 38,
    paddingVertical: 20,
    paddingHorizontal: 8,
  },
  footerIcons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  iconWrapper: {
    flex: 1,
    alignItems: "center",
  },
  footerLabel: {
    color: "#d7fc5a",
    fontSize: 12,
    marginTop: 3,
    fontWeight: "600",
  },
});
