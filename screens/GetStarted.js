import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";

export default function GetStarted() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      <ImageBackground
        source={require("../assets/Messi.jpeg")}
        style={styles.background}
        resizeMode="contain"
      >
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.80)"]}
          style={styles.gradient}
        />

        <View style={styles.content}>
          <Text style={styles.title}>
            Real-Time Football Scores{"\n"}
            <Text style={styles.subtitle}>Anytime, Anywhere</Text>
          </Text>

          <Text style={styles.description}>
            Follow every match with real-time football scores, quick updates,
            and live stats — anytime, anywhere.
          </Text>

          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate("Login")}
          >
            <Text style={styles.buttonText}>Get Started</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  background: { flex: 1, justifyContent: "flex-end" },
  gradient: { ...StyleSheet.absoluteFillObject },
  content: { paddingHorizontal: 24, paddingBottom: 60 },
  title: { fontSize: 26, fontWeight: "700", color: "#fff" },
  subtitle: { fontSize: 24, fontWeight: "600", color: "#fff" },
  description: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 15,
    marginTop: 12,
    lineHeight: 22,
  },
  button: {
    backgroundColor: "#e9f602",
    marginTop: 28,
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: "center",
  },
  buttonText: { color: "#000", fontWeight: "700", fontSize: 18 },
});
