import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { setCache, getCache } from "../utils/cache";
import FooterDock from "../components/FooterDock";

const API_KEY = "fdd10ed1203d4ce19d9db91b4ff0d8f1";

const HomeScreen = ({ navigation }) => {
  const [selectedTab, setSelectedTab] = useState("Live");
  const [matches, setMatches] = useState({
    live: [],
    completed: [],
    upcoming: [],
  });
  const [loading, setLoading] = useState(true);

  const LEAGUES = "PL,PD,BL1,SA,FL1";

  const formatDateTime = (utcDate) => {
    const d = new Date(utcDate);
    let hours = d.getHours();
    let minutes = d.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;

    const date = `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
    const time = `${hours}:${minutes} ${ampm}`;
    return { date, time };
  };

  const fetchMatches = async () => {
    try {
      setLoading(true);

      const cached = await getCache("all_matches");
      if (cached) {
        setMatches(cached);
        setLoading(false);
        return;
      }

      const today = new Date();
      const pastDate = new Date(today);
      pastDate.setDate(today.getDate() - 7);

      const dateFrom = pastDate.toISOString().split("T")[0];
      const dateTo = today.toISOString().split("T")[0];

      const upcoming_res = await fetch(
        `https://api.football-data.org/v4/matches?competitions=${LEAGUES}&status=SCHEDULED,TIMED,IN_PLAY,PAUSED`,
        { headers: { "X-Auth-Token": API_KEY } }
      );

      await new Promise((res) => setTimeout(res, 6000));

      const upcoming_data = await upcoming_res.json();

      const completed_res = await fetch(
        `https://api.football-data.org/v4/matches?competitions=${LEAGUES}&status=FINISHED&dateFrom=${dateFrom}&dateTo=${dateTo}`,
        { headers: { "X-Auth-Token": API_KEY } }
      );

      const completed_data = await completed_res.json();

      const live = [], completed = [], upcoming = [];

      upcoming_data.matches.forEach((m) => {
        const { date, time } = formatDateTime(m.utcDate);

        const obj = {
          home: m.homeTeam.shortName || m.homeTeam.name,
          away: m.awayTeam.shortName || m.awayTeam.name,
          homeLogo: { uri: m.homeTeam.crest },
          awayLogo: { uri: m.awayTeam.crest },
        };

        if (m.status === "IN_PLAY" || m.status === "PAUSED") {
          obj.score = `${m.score.fullTime.home ?? 0} - ${
            m.score.fullTime.away ?? 0
          }`;
          obj.status = "Live";
          live.push(obj);
        } else {
          obj.date = date;
          obj.time = time;
          upcoming.push(obj);
        }
      });

      completed_data.matches.forEach((m) => {
        completed.push({
          home: m.homeTeam.shortName || m.homeTeam.name,
          away: m.awayTeam.shortName || m.awayTeam.name,
          homeLogo: { uri: m.homeTeam.crest },
          awayLogo: { uri: m.awayTeam.crest },
          score: `${m.score.fullTime.home} - ${m.score.fullTime.away}`,
          status: "Full-Time",
          date: m.utcDate.split("T")[0],
          goals: [],
        });
      });

      const all = { live, completed, upcoming };

      setMatches(all);
      await setCache("all_matches", all);

      await setCache("raw_matches", {
        upcoming: upcoming_data.matches || [],
        completed: completed_data.matches || [],
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  const current =
    selectedTab === "Live"
      ? matches.live
      : selectedTab === "Completed"
      ? matches.completed
      : matches.upcoming;

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loaderWrapper}>
          <ActivityIndicator size="large" color="#d7fc5a" />
        </View>
      );
    }

    if (selectedTab === "Live" && current.length === 0) {
      return (
        <View style={styles.emptyStateContainer}>
          <Text style={styles.noMatchesText}>
            No live matches right now. Check back soon!
          </Text>
        </View>
      );
    }

    return (
      <ScrollView
        style={{ marginTop: 20 }}
        contentContainerStyle={{ paddingBottom: 140 }}
      >
        {current.map((match, i) => (
          <TouchableOpacity
            key={i}
            disabled={selectedTab !== "Completed"}
            onPress={() => navigation.navigate("MatchDetails", { match })}
          >
            <View style={styles.card}>
              <View style={styles.teamContainer}>
                <Image source={match.homeLogo} style={styles.logo} />
                <Text style={styles.teamName}>{match.home}</Text>
              </View>

              <View style={styles.centerContent}>
                {match.time ? (
                  <>
                    <Text style={styles.dateText}>{match.date}</Text>
                    <Text style={styles.timeText2}>{match.time}</Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.scoreText}>{match.score}</Text>
                    <Text style={styles.statusText}>{match.status}</Text>
                  </>
                )}
              </View>

              <View style={styles.teamContainer}>
                <Image source={match.awayLogo} style={styles.logo} />
                <Text style={styles.teamName}>{match.away}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  return (
    <LinearGradient
      colors={["#3b3d0e", "#0f0f0d", "#1a1a0d"]}
      style={styles.gradientBackground}
    >
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Watch Matches</Text>
      </View>
      <View style={styles.segmentContainer}>
        {["Completed", "Live", "Upcoming"].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.segmentButton,
              selectedTab === tab && styles.activeSegmentButton,
            ]}
            onPress={() => setSelectedTab(tab)}
          >
            <Text
              style={[
                styles.segmentText,
                selectedTab === tab && styles.activeSegmentText,
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {renderContent()}
      <FooterDock navigation={navigation} active="Home" />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientBackground: { flex: 1 },

  loaderWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 140,
  },

  noMatchesText: {
    color: "#fff",
    fontSize: 20,
    textAlign: "center",
    opacity: 0.8,
    paddingHorizontal: 40,
  },

  headerContainer: {
    marginTop: 65,
    alignItems: "center",
  },

  headerTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
  },

  segmentContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    marginTop: 25,
  },

  segmentButton: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 22,
    backgroundColor: "rgba(255,255,255,0.05)",
  },

  activeSegmentButton: {
    backgroundColor: "#d7fc5a",
    borderColor: "#d7fc5a",
  },

  segmentText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },

  activeSegmentText: {
    color: "#000",
    fontWeight: "700",
  },

  card: {          
    alignSelf: "center",             
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 20,
    padding: 22,
    marginBottom: 20,
    marginHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },

  teamContainer: {
    flex: 1, 
    alignItems: "center",
    justifyContent: "center",
  },

  centerContent: {
    alignItems: "center",
    justifyContent: "center",
    minWidth: 100,            
    paddingHorizontal: 10,
  },

  logo: {
    width: 60,            
    height: 60,
    resizeMode: "contain",
  },

  teamName: {
    color: "#fff",
    marginTop: 8,
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
    numberOfLines: 2,
  },
  dateText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    opacity: 0.9,
  },

  timeText2: {
    color: "#d7fc5a",
    fontSize: 20,
    fontWeight: "800",
    marginTop: 6,
  },

  scoreText: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: 1,
  },

  statusText: {
    color: "#d7fc5a",
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 6,
    textTransform: "uppercase",
  },

  timeText2: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginTop: 4,
  },

  scoreText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
  },

  statusText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 13,
  },
});

export default HomeScreen;
