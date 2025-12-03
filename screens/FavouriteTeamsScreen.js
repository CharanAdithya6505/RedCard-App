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
import { Ionicons } from "@expo/vector-icons";
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

      // Try cache first
      const cachedTeams = await getCache('all_teams');
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

          if (!res.ok) {
            console.log(`League ${league} error: ${res.status}`);
            continue;
          }

          const data = await res.json();

          if (data?.teams) {
            collected.push(...data.teams);
          }
        } catch (err) {
          console.log(`Error loading league ${league}`, err);
        }
        await new Promise(resolve => setTimeout(resolve, 3000));
      }

      const unique = Array.from(
        new Map(collected.map((t) => [t.id, t])).values()
      );

      setAllTeams(unique);
      await setCache('all_teams', unique);
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

  const toggleFavourite = (team) => {
    const exists = favTeams.find((t) => t.id === team.id);

    if (exists) {
      setFavTeams(favTeams.filter((t) => t.id !== team.id));
    } else {
      setFavTeams([...favTeams, team]);
    }
  };

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

      <ScrollView contentContainerStyle={[styles.gridContainer, { paddingBottom: 140 }]}>
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
              <TouchableOpacity 
                onPress={() => toggleFavourite(team)}
                style={{ position: "absolute", top: 10, right: 10, zIndex: 1 }}
              >
                <Ionicons
                  name={
                    favTeams.some((t) => t.id === team.id)
                      ? "heart"
                      : "heart-outline"
                  }
                  size={26}
                  color="#d7fc5a"
                />
              </TouchableOpacity>

              <Image
                source={{ uri: team.crest }}
                style={styles.teamLogo}
                resizeMode="contain"
              />
              <Text style={styles.teamName}>
                {team.shortName || team.name}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </ScrollView>

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
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  searchContainer: {
    marginHorizontal: 18,
    marginBottom: 15,
  },
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
  cardInner: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  teamLogo: {
    width: 70,
    height: 70,
    marginBottom: 12,
  },
  teamName: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
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