import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { setCache, getCache } from "../utils/cache";

const API_KEY = "fdd10ed1203d4ce19d9db91b4ff0d8f1";

export default function FavouriteTeamsScreen() {
  const navigation = useNavigation();
  const [allTeams, setAllTeams] = useState([]);
  const [favTeams, setFavTeams] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const leagues = ["PD", "PL", "SA", "BL1", "FL1"];

  const fetchLeagueTeams = async () => {
    try {
      setLoading(true);

      const cachedTeams = await getCache("all_teams");
      if (cachedTeams) {
        setAllTeams(cachedTeams);
        setLoading(false);
        return;
      }

      let collected = [];

      for (const league of leagues) {
        try {
          const res = await fetch(
            `https://api.football-data.org/v4/competitions/${league}/teams`,
            {
              headers: {
                "X-Auth-Token": API_KEY,
                "Content-Type": "application/json",
              },
            }
          );

          if (!res.ok) continue;

          const data = await res.json();
          if (data?.teams) collected.push(...data.teams);
        } catch (err) {
          console.log(`Error loading league ${league}`, err);
        }

        await new Promise((resolve) => setTimeout(resolve, 3000));
      }

      const unique = Array.from(
        new Map(collected.map((t) => [t.id, t])).values()
      );

      setAllTeams(unique);
      await setCache("all_teams", unique);
    } catch (e) {
      console.log("MAIN ERROR:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeagueTeams();
  }, []);

  const filteredTeams = search
    ? allTeams.filter((t) =>
        t?.name?.toLowerCase().includes(search.toLowerCase())
      )
    : favTeams.length > 0
    ? favTeams
    : allTeams.slice(0, 40);

  if (loading) {
    return (
      <LinearGradient
        colors={["#3b3d0e", "#0f0f0d", "#1a1a0d"]}
        style={styles.loaderContainer}
      >
        <ActivityIndicator size="large" color="#d7fc5a" />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={["#3b3d0e", "#0f0f0d", "#1a1a0d"]}
      style={{ flex: 1, paddingTop: 50 }}
    >
      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Search team..."
          placeholderTextColor="#ccc"
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <ScrollView
        contentContainerStyle={[styles.gridContainer, { paddingBottom: 30 }]}
      >
        {filteredTeams.map((team) => (
          <TouchableOpacity
            key={team.id}
            style={styles.card}
            onPress={() => navigation.navigate("TeamDetails", { team })}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={["rgba(255,255,255,0.05)", "rgba(255,255,255,0.02)"]}
              style={styles.cardInner}
            >
              <Image
                source={{ uri: team.crest }}
                style={styles.teamLogo}
                resizeMode="contain"
              />
              <Text style={styles.teamName}>{team.shortName || team.name}</Text>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  searchContainer: { marginHorizontal: 18, marginBottom: 15 },
  searchInput: {
    height: 48,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 25,
    paddingHorizontal: 20,
    color: "#fff",
    fontSize: 16,
  },
  gridContainer: {
    paddingHorizontal: 12,
    paddingBottom: 30,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    width: "48%",
    height: 170,
    backgroundColor: "rgba(255,255,255,0.10)",
    borderRadius: 22,
    marginBottom: 18,
    overflow: "hidden",
  },
  cardInner: { flex: 1, justifyContent: "center", alignItems: "center" },
  teamLogo: { width: 70, height: 70, marginBottom: 12 },
  teamName: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
});
