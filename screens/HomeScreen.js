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

const API_KEY = "fdd10ed1203d4ce19d9db91b4ff0d8f1";

export const MatchDetailsScreen = ({ route, navigation }) => {
  const { match } = route.params;

  return (
    <LinearGradient
      colors={["#3b3d0e", "#0f0f0d", "#1a1a0d"]}
      style={{ flex: 1, padding: 20 }}
    >
      <View style={styles.headerContainer2}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={26} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Match Details</Text>

        <View style={{ width: 26 }} />
      </View>

      <Text style={styles.matchDate}>{match.date}</Text>

      <View style={styles.detailScoreBox}>
        <View style={styles.detailTeam}>
          <Image source={match.homeLogo} style={styles.detailLogo} />
          <Text style={styles.detailTeamName}>{match.home}</Text>
        </View>

        <View style={styles.detailCenter}>
          <Text style={styles.finalScore}>{match.score}</Text>
          <Text style={styles.finishedText}>Finished</Text>
        </View>

        <View style={styles.detailTeam}>
          <Image source={match.awayLogo} style={styles.detailLogo} />
          <Text style={styles.detailTeamName}>{match.away}</Text>
        </View>
      </View>

      {/* Goals List */}
      <View style={{ marginTop: 20 }}>
        {match.goals?.map((g, i) => (
          <Text key={i} style={styles.goalText}>
            {g}
          </Text>
        ))}
      </View>

      {/* Tabs */}
      <View style={[styles.bottomTabs, { marginBottom: 140 }]}>
        {["Details", "AI Insights", "Lineups", "Statistics", "Commentary"].map(
          (t) => (
            <View key={t} style={styles.tabButton}>
              <Text style={styles.tabText}>{t}</Text>
            </View>
          )
        )}
      </View>

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
};

export const HomeScreen = ({ navigation }) => {
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

      // Try cache first
      const cachedMatches = await getCache("all_matches");
      if (cachedMatches) {
        setMatches(cachedMatches);
        setLoading(false);
        return;
      }

      const today = new Date();
      const pastDate = new Date();
      pastDate.setDate(today.getDate() - 7);

      const dateFrom = pastDate.toISOString().split("T")[0];
      const dateTo = today.toISOString().split("T")[0];

      const upcoming_res = await fetch(
        `https://api.football-data.org/v4/matches?competitions=${LEAGUES}&status=SCHEDULED,TIMED,IN_PLAY,PAUSED`,
        { headers: { "X-Auth-Token": API_KEY } }
      );
      await new Promise((resolve) => setTimeout(resolve, 6000)); // Delay to avoid rate limit

      const upcoming_data = await upcoming_res.json();

      const completed_res = await fetch(
        `https://api.football-data.org/v4/matches?competitions=${LEAGUES}&status=FINISHED&dateFrom=${dateFrom}&dateTo=${dateTo}`,
        { headers: { "X-Auth-Token": API_KEY } }
      );
      const completed_data = await completed_res.json();

      const live = [];
      const completed = [];
      const upcoming = [];

      upcoming_data.matches.forEach((m) => {
        const { date, time } = formatDateTime(m.utcDate);
        const matchObj = {
          home: m.homeTeam.shortName || m.homeTeam.name,
          away: m.awayTeam.shortName || m.awayTeam.name,
          homeLogo: { uri: m.homeTeam.crest },
          awayLogo: { uri: m.awayTeam.crest },
        };

        if (m.status === "IN_PLAY" || m.status === "PAUSED") {
          matchObj.score = `${m.score.fullTime.home ?? 0} - ${
            m.score.fullTime.away ?? 0
          }`;
          matchObj.status = "Live";
          live.push(matchObj);
        } else {
          matchObj.date = date;
          matchObj.time = time;
          upcoming.push(matchObj);
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

      const allMatchesData = { live, completed, upcoming };
      setMatches(allMatchesData);

      // Cache the processed matches
      await setCache("all_matches", allMatchesData);

      // Cache the raw matches for TeamDetails reuse
      const rawMatches = {
        upcoming: upcoming_data.matches || [],
        completed: completed_data.matches || [],
      };
      await setCache("raw_matches", rawMatches);
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
            There are no live matches scheduled right now. Check back soon!
          </Text>
        </View>
      );
    }

    return (
      <ScrollView
        style={{ marginTop: 20 }}
        contentContainerStyle={[styles.scrollContainer, { paddingBottom: 140 }]}
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
                {selectedTab === "Upcoming" ? (
                  <>
                    <Text style={styles.dateText}>{match.date}</Text>
                    <Text style={styles.timeText2}>{match.time}</Text>
                  </>
                ) : match.time ? (
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
    opacity: 1,
    paddingHorizontal: 40,
  },

  headerContainer: {
    marginTop: 65,
    paddingHorizontal: 20,
    alignItems: "center",
  },

  headerContainer2: {
    marginTop: 55,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    alignItems: "center",
  },

  headerTitle: { color: "#fff", fontSize: 22, fontWeight: "700" },

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

  scrollContainer: { paddingVertical: 20, alignItems: "center" },

  card: {
    width: "90%",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 20,
    padding: 22,
    marginBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },

  teamContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: "30%",
  },

  logo: { width: 55, height: 55 },

  teamName: {
    color: "#fff",
    marginTop: 6,
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
  },

  centerContent: {
    alignItems: "center",
    justifyContent: "center",
    width: "40%",
  },

  dateText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },

  timeText2: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
    marginTop: 4,
    textAlign: "center",
  },

  scoreText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
  },

  statusText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 13,
    marginTop: 2,
  },

  matchDate: {
    color: "#fff",
    textAlign: "center",
    marginTop: 20,
    fontSize: 15,
    opacity: 0.8,
  },

  detailScoreBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 40,
    alignItems: "center",
  },

  detailTeam: { alignItems: "center", width: "30%" },
  detailTeamName: { color: "#fff", marginTop: 10, fontSize: 15 },
  detailLogo: { width: 70, height: 70 },

  detailCenter: { alignItems: "center" },
  finalScore: {
    fontSize: 40,
    color: "#fff",
    fontWeight: "700",
  },
  finishedText: { color: "#a1ff45", marginTop: 5 },

  goalText: {
    color: "#fff",
    fontSize: 14,
    marginBottom: 8,
    opacity: 0.9,
  },

  bottomTabs: {
    flexDirection: "row",
    marginTop: 35,
    justifyContent: "space-between",
  },

  tabButton: { paddingVertical: 8, paddingHorizontal: 10 },
  tabText: { color: "#fff", fontSize: 14, opacity: 0.8 },

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

export default HomeScreen;
