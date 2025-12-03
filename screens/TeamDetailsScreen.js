import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { getCache } from "../utils/cache";

const API_KEY = "fdd10ed1203d4ce19d9db91b4ff0d8f1";

export default function TeamDetailsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { team } = route.params || {};
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!team) {
      setError("Team data not found.");
      setLoading(false);
      return;
    }
    fetchTeamMatches();
  }, []);

  const fetchTeamMatches = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!team?.id) {
        throw new Error("Team ID not found.");
      }

      const cachedRaw = await getCache('raw_matches');
      if (!cachedRaw || typeof cachedRaw !== 'object') {
        throw new Error("No cached matches. Load Home screen first.");
      }

      const upcomingMatches = Array.isArray(cachedRaw.upcoming) ? cachedRaw.upcoming : [];
      const completedMatches = Array.isArray(cachedRaw.completed) ? cachedRaw.completed : [];
      const allMatches = [...upcomingMatches, ...completedMatches];

      const teamMatches = allMatches.filter((match) => {
        if (!match || typeof match !== 'object') return false;
        return (match.homeTeam && match.homeTeam.id === team.id) || (match.awayTeam && match.awayTeam.id === team.id);
      });

      if (teamMatches.length > 0) {
        const grouped = teamMatches.reduce((acc, match) => {
          if (!match || !match.competition || !match.competition.code || !match.competition.name) {
            return acc;
          }
          const compCode = match.competition.code;
          const compName = match.competition.name;
          if (!acc[compCode]) {
            acc[compCode] = {
              name: compName,
              matches: [],
            };
          }
          acc[compCode].matches.push(match);
          return acc;
        }, {});

        Object.values(grouped).forEach((group) => {
          if (group && group.matches) {
            group.matches.sort((a, b) => {
              const aStatus = a && a.status ? a.status : 'FINISHED';
              const bStatus = b && b.status ? b.status : 'FINISHED';
              const statusOrder = { SCHEDULED: 1, TIMED: 1, IN_PLAY: 2, PAUSED: 2, FINISHED: 3 };
              if (statusOrder[aStatus] !== statusOrder[bStatus]) {
                return statusOrder[aStatus] - statusOrder[bStatus];
              }
              const aDate = a && a.utcDate ? new Date(a.utcDate) : new Date();
              const bDate = b && b.utcDate ? new Date(b.utcDate) : new Date();
              return aDate - bDate;
            });
          }
        });

        setMatches(Object.values(grouped));
      }
    } catch (err) {
      console.log("Error fetching team matches:", err);
      setError(err.message || "Failed to load matches. Try loading Home screen first.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { 
      weekday: "short", 
      month: "short", 
      day: "numeric", 
      hour: "2-digit", 
      minute: "2-digit" 
    });
  };

  const getScore = (match) => {
    if (!match || match.status !== "FINISHED") {
      return "vs";
    }
    const homeScore = match.score && match.score.fullTime ? match.score.fullTime.home || 0 : 0;
    const awayScore = match.score && match.score.fullTime ? match.score.fullTime.away || 0 : 0;
    return `${homeScore} - ${awayScore}`;
  };

  const isHomeMatch = (match) => {
    return match && match.homeTeam && match.homeTeam.id === team.id;
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

  if (error) {
    return (
      <LinearGradient
        colors={["#3b3d0e", "#0f0f0d", "#1a1a0d"]}
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={fetchTeamMatches} style={styles.retryButton}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={["#3b3d0e", "#0f0f0d", "#1a1a0d"]}
      style={{ flex: 1, paddingTop: 50 }}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#d7fc5a" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Image source={{ uri: team.crest }} style={styles.headerLogo} resizeMode="contain" />
          <Text style={styles.teamName}>{team.name}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        {matches.length === 0 ? (
          <View style={styles.noDataContainer}>
            <Ionicons name="football" size={64} color="#d7fc5a" />
            <Text style={styles.noDataText}>No matches available for this team.</Text>
          </View>
        ) : (
          matches.map((competition) => (
            <View key={competition.name} style={styles.competitionSection}>
              <Text style={styles.competitionTitle}>{competition.name}</Text>
              {competition.matches && competition.matches.map((match) => {
                if (!match || !match.homeTeam || !match.awayTeam) return null;
                const homeTeam = match.homeTeam;
                const awayTeam = match.awayTeam;
                const selectedIsHome = isHomeMatch(match);
                return (
                  <View key={match.id} style={styles.matchCard}>
                    <Text style={styles.matchDate}>{formatDate(match.utcDate)}</Text>
                    <View style={styles.matchTeams}>
                      <View style={styles.teamInfo}>
                        <Text style={[
                          styles.teamLabel,
                          styles.homeTeam
                        ]}>
                          HOME
                        </Text>
                        <Text style={[
                          styles.opponentName,
                          selectedIsHome ? styles.selectedTeam : null
                        ]}>
                          {homeTeam.name}
                        </Text>
                      </View>
                      <View style={styles.scoreContainer}>
                        <Text style={styles.score}>{getScore(match)}</Text>
                        {match.status === "IN_PLAY" || match.status === "PAUSED" ? (
                          <Text style={styles.liveIndicator}>LIVE</Text>
                        ) : match.status === "SCHEDULED" || match.status === "TIMED" ? (
                          <Text style={styles.upcomingIndicator}>UPCOMING</Text>
                        ) : null}
                      </View>
                      <View style={styles.teamInfo}>
                        <Text style={[
                          styles.teamLabel,
                          styles.awayTeam
                        ]}>
                          AWAY
                        </Text>
                        <Text style={[
                          styles.opponentName,
                          !selectedIsHome ? styles.selectedTeam : null
                        ]}>
                          {awayTeam.name}
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          ))
        )}
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  backButton: {
    padding: 5,
    marginRight: 10,
  },
  headerContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  headerLogo: {
    width: 40,
    height: 40,
    marginRight: 10,
  },
  teamName: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  contentContainer: {
    paddingHorizontal: 18,
    paddingBottom: 140,
  },
  competitionSection: {
    marginBottom: 30,
  },
  competitionTitle: {
    color: "#d7fc5a",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  matchCard: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
  },
  matchDate: {
    color: "#ccc",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 10,
  },
  matchTeams: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  teamInfo: {
    flex: 1,
    alignItems: "center",
  },
  teamLabel: {
    fontSize: 10,
    color: "#888",
    marginBottom: 2,
    textTransform: "uppercase",
  },
  homeTeam: {
    color: "#d7fc5a",
  },
  awayTeam: {
    color: "#ff6b6b",
  },
  opponentName: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  selectedTeam: {
    color: "#d7fc5a",
    fontWeight: "bold",
  },
  scoreContainer: {
    alignItems: "center",
  },
  score: {
    color: "#d7fc5a",
    fontSize: 18,
    fontWeight: "bold",
  },
  liveIndicator: {
    color: "#ff6b6b",
    fontSize: 12,
    fontWeight: "bold",
    marginTop: 2,
  },
  upcomingIndicator: {
    color: "#d7fc5a",
    fontSize: 12,
    fontWeight: "bold",
    marginTop: 2,
  },
  noDataContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 50,
  },
  noDataText: {
    color: "#ccc",
    fontSize: 16,
    marginTop: 10,
    textAlign: "center",
  },
  errorText: {
    color: "#ff6b6b",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  retryText: {
    color: "#d7fc5a",
    fontSize: 16,
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