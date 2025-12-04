import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRoute, useNavigation } from "@react-navigation/native";

const API_KEY = "fdd10ed1203d4ce19d9db91b4ff0d8f1";

export default function TeamDetailsScreen() {
  const route = useRoute();
  const navigation = useNavigation();

  const { team } = route.params;

  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchTeam = async () => {
    try {
      const res = await fetch(
        `https://api.football-data.org/v4/teams/${team.id}`,
        {
          headers: { "X-Auth-Token": API_KEY },
        }
      );

      const data = await res.json();
      setDetails(data);
    } catch (e) {
      console.log("TEAM DETAILS ERROR:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, []);

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
      style={{ flex: 1, paddingTop: 60 }}
    >
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={28} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.header}>{details.shortName}</Text>

        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Logo + Name */}
        <View style={styles.centerBox}>
          <Image
            source={{ uri: details.crest }}
            style={{ width: 120, height: 120 }}
            resizeMode="contain"
          />
          <Text style={styles.teamFullName}>{details.name}</Text>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Venue</Text>
          <Text style={styles.infoValue}>{details.venue}</Text>

          <Text style={styles.infoLabel}>Address</Text>
          <Text style={styles.infoValue}>{details.address}</Text>

          <Text style={styles.infoLabel}>Website</Text>
          <Text
            style={styles.link}
            onPress={() => Linking.openURL(details.website)}
          >
            {details.website}
          </Text>
        </View>

        {/* Squad (Optional but premium) */}
        <Text style={styles.sectionHeader}>Squad</Text>
        {details.squad?.length > 0 ? (
          details.squad.map((p) => (
            <View key={p.id} style={styles.playerRow}>
              <Text style={styles.playerName}>{p.name}</Text>
              <Text style={styles.playerPos}>{p.position || "—"}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.noSquad}>Squad data not available</Text>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    justifyContent: "space-between",
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 25,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  header: { color: "#fff", fontSize: 20, fontWeight: "700" },
  centerBox: {
    alignItems: "center",
    marginTop: 20,
  },
  teamFullName: {
    color: "#fff",
    fontSize: 22,
    marginTop: 12,
    fontWeight: "700",
    textAlign: "center",
  },
  infoCard: {
    backgroundColor: "rgba(255,255,255,0.10)",
    borderRadius: 18,
    padding: 16,
    margin: 20,
  },
  infoLabel: {
    color: "#d7fc5a",
    fontSize: 14,
    marginTop: 10,
    fontWeight: "600",
  },
  infoValue: {
    color: "#fff",
    fontSize: 16,
    marginTop: 4,
  },
  link: {
    color: "#8CE0FF",
    fontSize: 15,
    marginTop: 4,
  },
  sectionHeader: {
    color: "#d7fc5a",
    fontSize: 18,
    fontWeight: "700",
    marginLeft: 20,
    marginTop: 10,
  },
  playerRow: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomColor: "rgba(255,255,255,0.1)",
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  playerName: { color: "#fff", fontSize: 15 },
  playerPos: { color: "#ccc", fontSize: 14 },
  noSquad: {
    color: "#ccc",
    marginLeft: 20,
    marginTop: 8,
    fontSize: 14,
  },
});
