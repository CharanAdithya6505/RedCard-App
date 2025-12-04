import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

export default function FooterDock() {
  const navigation = useNavigation();

  return (
    <View style={styles.dockFooter}>
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
  );
}

const styles = StyleSheet.create({
  dockFooter: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 85,
    backgroundColor: "rgba(0,0,0,0.88)",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingTop: 10,
    paddingBottom: 15,
    justifyContent: "center",
    alignItems: "center",
  },

  footerIcons: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "90%",
  },

  iconContainer: {
    justifyContent: "center",
    alignItems: "center",
  },

  footerLabel: {
    color: "#d7fc5a",
    fontSize: 13,
    marginTop: 4,
    fontWeight: "600",
  },
});
