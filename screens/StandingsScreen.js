import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const API_KEY = "fdd10ed1203d4ce19d9db91b4ff0d8f1";

const LEAGUES = [
  { id: "PD", name: "LaLiga" },
  { id: "PL", name: "Premier League" },
  { id: "SA", name: "Serie A" },
  { id: "BL1", name: "Bundesliga" },
  { id: "FL1", name: "Ligue 1" },
];

export default function StandingsScreen() {
  const navigation = useNavigation();
  const [selectedLeague, setSelectedLeague] = useState("PD");
  const [standings, setStandings] = useState([]);

  const fetchStandings = async (leagueId) => {
    try {
      const res = await fetch(
        `https://api.football-data.org/v4/competitions/${leagueId}/standings`,
        { headers: { "X-Auth-Token": API_KEY } }
      );
      const data = await res.json();
      const table = data.standings?.[0]?.table ?? [];
      setStandings(table);
    } catch (error) {
      console.log("Error loading standings:", error);
    }
  };

  useEffect(() => {
    fetchStandings(selectedLeague);
  }, [selectedLeague]);

  return (
    <LinearGradient
      colors={["#3b3d0e", "#0f0f0d", "#1a1a0d"]}
      style={{ flex: 1, paddingTop: 50 }}
    >
      {/* TOP BAR */}
      <View style={styles.topBar}>
        {/* BACK BUTTON */}
        <TouchableOpacity
          style={styles.circleButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={26} color="#fff" />
        </TouchableOpacity>

        {/* TITLE */}
        <Text style={styles.header}>League Standings</Text>

        {/* FILTER BUTTON */}
        <TouchableOpacity style={styles.circleButton}>
          <Ionicons name="options-outline" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* LEAGUE FILTERS */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterBar}
      >
        {LEAGUES.map((l) => (
          <TouchableOpacity
            key={l.id}
            onPress={() => setSelectedLeague(l.id)}
            style={[
              styles.filterButton,
              selectedLeague === l.id && styles.activeFilterButton,
            ]}
          >
            <Text
              style={[
                styles.filterText,
                selectedLeague === l.id && styles.activeFilterText,
              ]}
            >
              {l.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* TABLE */}
      <ScrollView style={{ marginTop: 20 }} contentContainerStyle={{ paddingBottom: 140 }}>
        {standings.map((team, i) => (
          <View key={i} style={styles.row}>
            <Text style={styles.position}>{team.position}</Text>

            <View style={styles.teamBox}>
              <Image
                source={{ uri: team.team.crest }}
                style={styles.teamLogo}
              />
              <Text style={styles.teamName}>{team.team.shortName || team.team.name}</Text>
            </View>

            <Text style={styles.points}>{team.points}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Dock Footer */}
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
          <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
            <View style={styles.iconContainer}>
              <Ionicons name="person" size={30} color="#d7fc5a" />
              <Text style={styles.footerLabel}>Profile</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    marginBottom: 10,
  },

  circleButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },

  header: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
  },

  filterBar: {
    marginTop: 15,
    paddingHorizontal: 10,
    paddingBottom: 10,
  },

  filterButton: {
    height: 40,
    paddingHorizontal: 22,
    marginRight: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },

  activeFilterButton: {
    backgroundColor: "#d7fc5a",
    borderColor: "#d7fc5a",
  },

  filterText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },

  activeFilterText: {
    color: "#000",
    fontWeight: "700",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    marginHorizontal: 15,
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },

  position: {
    color: "#fff",
    width: 30,
    fontWeight: "700",
    fontSize: 16,
  },

  teamBox: {
    flexDirection: "row",
    alignItems: "center",
    width: "70%",
  },

  teamLogo: {
    width: 30,
    height: 30,
    marginRight: 10,
  },

  teamName: {
    color: "#fff",
    fontSize: 15,
    width: "80%",
  },

  points: {
    color: "#d7fc5a",
    fontSize: 16,
    fontWeight: "700",
    width: 40,
    textAlign: "right",
  },

  dockFooter: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "rgba(6, 5, 5, 0.74)",
    borderTopColor: "rgba(255,255,255,0.3)",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderBottomRightRadius: 30,
    borderBottomLeftRadius: 30,
    paddingVertical: 10,
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    elevation: 5,
  },
  footerIcons: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  iconContainer: {
    alignItems: "center",
  },
  footerLabel: {
    color: "#fff",
    fontSize: 12,
    marginTop: 4,
    opacity: 0.8,
  },
});