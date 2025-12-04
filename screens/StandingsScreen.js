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
  const [showLeagueMenu, setShowLeagueMenu] = useState(false);

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
      style={{ flex: 1, paddingTop: 70 }}
    >
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.circleButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={26} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.header}>League Standings</Text>

        <TouchableOpacity
          style={styles.circleButton}
          onPress={() => setShowLeagueMenu(true)}
        >
          <Ionicons name="options-outline" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.columnLabelRow}>
        <Text style={styles.colEmpty}></Text>

        <Text style={styles.colTeamLabel}>Team</Text>

        <Text style={styles.colLabel}>MP</Text>
        <Text style={styles.colLabel}>GD</Text>
        <Text style={styles.colLabel}>PTS</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 140 }}>
        {standings.map((team, i) => (
          <View key={i} style={styles.row}>
            <Text style={styles.position}>{team.position}</Text>

            <View style={styles.teamBox}>
              <Image
                source={{ uri: team.team.crest }}
                style={styles.teamLogo}
              />
              <Text style={styles.teamName}>
                {team.team.shortName || team.team.name}
              </Text>
            </View>

            <Text style={styles.played}>{team.playedGames}</Text>
            <Text style={styles.gd}>{team.goalDifference}</Text>
            <Text style={styles.points}>{team.points}</Text>
          </View>
        ))}
      </ScrollView>

      {showLeagueMenu && (
        <>
          <TouchableOpacity
            style={styles.dropdownOverlay}
            activeOpacity={1}
            onPress={() => setShowLeagueMenu(false)}
          />

          <View style={styles.dropdownBox}>
            {LEAGUES.map((league) => (
              <TouchableOpacity
                key={league.id}
                onPress={() => {
                  setSelectedLeague(league.id);
                  setShowLeagueMenu(false);
                }}
                style={styles.modalItem}
              >
                <Text
                  style={[
                    styles.modalText,
                    selectedLeague === league.id && styles.modalTextActive,
                  ]}
                >
                  {league.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    marginBottom: 20,
  },

  header: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
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

  columnLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    marginBottom: 5,
    opacity: 0.7,
  },

  colEmpty: { width: 30 },

  colTeamLabel: {
    color: "#fff",
    fontSize: 14,
    width: "50%",
  },

  colLabel: {
    color: "#fff",
    fontSize: 14,
    width: 37,
    textAlign: "center",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
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
    width: "50%",
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

  /* NUMBERS */
  played: {
    color: "#fff",
    fontSize: 15,
    width: 35,
    textAlign: "center",
  },

  gd: {
    color: "#fff",
    fontSize: 15,
    width: 35,
    textAlign: "center",
  },

  points: {
    color: "#d7fc5a",
    fontSize: 16,
    fontWeight: "700",
    width: 40,
    textAlign: "right",
  },

  dropdownOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  dropdownBox: {
    position: "absolute",
    top: 115,
    right: 20,
    backgroundColor: "#1c1c1c",
    width: 220,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    zIndex: 999,
  },

  modalItem: {
    paddingVertical: 14,
    paddingHorizontal: 20,
  },

  modalText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  modalTextActive: {
    color: "#d7fc5a",
    fontWeight: "800",
  },
});
