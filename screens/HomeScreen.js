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
import FooterDock from "../components/FooterDock";
import { setCache, getCache } from "../utils/cache";

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
      const futureDate = new Date(today);
      futureDate.setDate(today.getDate() + 3);
      const futureTo = futureDate.toISOString().split("T")[0];
      const upcoming_res = await fetch(
        `https://api.football-data.org/v4/matches?competitions=${LEAGUES}&dateFrom=${dateTo}&dateTo=${futureTo}`,
        { headers: { "X-Auth-Token": API_KEY } }
      );
      await new Promise((res) => setTimeout(res, 5000));

      const upcoming_data = await upcoming_res.json();
      const completed_res = await fetch(
        `https://api.football-data.org/v4/matches?competitions=${LEAGUES}&status=FINISHED&dateFrom=${dateFrom}&dateTo=${dateTo}`,
        { headers: { "X-Auth-Token": API_KEY } }
      );

      const completed_data = await completed_res.json();
      const live = [];
      const completed = [];
      const upcoming = [];
      const LIVE_STATUSES = [
        "IN_PLAY",
        "PAUSED",
        "LIVE",
        "EXTRA_TIME",
        "PENALTY_SHOOTOUT",
      ];
      upcoming_data.matches.forEach((m) => {
        const { date, time } = formatDateTime(m.utcDate);

        const obj = {
          home: m.homeTeam.shortName || m.homeTeam.name,
          away: m.awayTeam.shortName || m.awayTeam.name,
          homeLogo: { uri: m.homeTeam.crest },
          awayLogo: { uri: m.awayTeam.crest },
        };

        if (LIVE_STATUSES.includes(m.status)) {
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
      completed_data.matches
        .sort((a, b) => new Date(b.utcDate) - new Date(a.utcDate))
        .forEach((m) => {
          completed.push({
            home: m.homeTeam.shortName || m.homeTeam.name,
            away: m.awayTeam.shortName || m.awayTeam.name,
            homeLogo: { uri: m.homeTeam.crest },
            awayLogo: { uri: m.awayTeam.crest },
            score: `${m.score.fullTime.home} - ${m.score.fullTime.away}`,
            status: "Full-Time",
            date: m.utcDate.split("T")[0],
          });
        });

      const all = { live, completed, upcoming };

      setMatches(all);
      await setCache("all_matches", all);
    } catch (err) {
      console.log("Match Fetch Error", err);
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
        contentContainerStyle={{ paddingBottom: 130 }}
      >
        {current.map((match, i) => (
          <TouchableOpacity key={i} activeOpacity={1}>
            <View style={styles.card}>
              <View style={styles.teamContainer}>
                <Image source={match.homeLogo} style={styles.logo} />
                <Text style={styles.teamName}>{match.home}</Text>
              </View>

              <View style={styles.centerContent}>
                {match.time ? (
                  <>
                    <Text style={styles.dateText}>{match.date}</Text>
                    <Text style={styles.timeText}>{match.time}</Text>
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
      style={{ flex: 1 }}
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
  loaderWrapper: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 130,
  },
  noMatchesText: {
    color: "#fff",
    fontSize: 20,
    textAlign: "center",
    opacity: 0.8,
  },
  headerContainer: { marginTop: 65, alignItems: "center" },
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
  activeSegmentButton: { backgroundColor: "#d7fc5a", borderColor: "#d7fc5a" },
  segmentText: { color: "#fff", fontSize: 15, fontWeight: "600" },
  activeSegmentText: { color: "#000", fontWeight: "700" },

  card: {
  backgroundColor: "rgba(255,255,255,0.15)",
  borderRadius: 20,
  padding: 22,
  marginBottom: 20,
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginHorizontal: 20,
},


  teamContainer: { flex: 1, alignItems: "center" },
  centerContent: { alignItems: "center", minWidth: 100 },
  logo: { width: 60, height: 60, resizeMode: "contain" },
  teamName: {
    color: "#fff",
    marginTop: 8,
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
  },
  dateText: { color: "#fff", fontSize: 18, fontWeight: "600" },
  timeText: { color: "#d7fc5a", fontSize: 20, fontWeight: "800", marginTop: 6 },
  scoreText: { color: "#fff", fontSize: 28, fontWeight: "800" },
  statusText: { color: "rgba(255,255,255,0.7)", marginTop: 6 },
});

export default HomeScreen;
