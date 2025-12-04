import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Platform,
} from "react-native";
import { BlurView } from "expo-blur";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigation } from "@react-navigation/native";

export default function LoginScreen() {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigation.replace("Home");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      <ImageBackground
        source={require("../assets/Messi.jpeg")}
        style={styles.background}
        resizeMode="cover"
      >
        {/* CURVED TOP LOGIN BAR */}
        <BlurView intensity={55} tint="dark" style={styles.card}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Login to continue</Text>

          <TextInput
            placeholder="Email"
            placeholderTextColor="#ccc"
            style={styles.input}
            onChangeText={setEmail}
            value={email}
          />

          <TextInput
            placeholder="Password"
            placeholderTextColor="#ccc"
            secureTextEntry
            style={styles.input}
            onChangeText={setPassword}
            value={password}
          />

          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
            <Text style={styles.signupText}>
              Don’t have an account?{" "}
              <Text style={styles.signupLink}>Sign Up</Text>
            </Text>
          </TouchableOpacity>
        </BlurView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  background: { flex: 1, justifyContent: "flex-end" },

  card: {
    width: "100%",
    paddingHorizontal: 24,
    paddingVertical: 30,
    backgroundColor: "rgba(0,0,0,0.45)",
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    overflow: Platform.OS === "android" ? "hidden" : "visible",
  },

  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#fff",
  },

  subtitle: {
    fontSize: 15,
    color: "rgba(255,255,255,0.85)",
    marginTop: 6,
    marginBottom: 25,
  },

  input: {
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 14,
    color: "#fff",
    fontSize: 15,
  },

  button: {
    backgroundColor: "#EBFF00",
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 8,
  },

  buttonText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#000",
  },

  signupText: {
    marginTop: 16,
    textAlign: "center",
    fontSize: 14,
    color: "#fff",
  },

  signupLink: {
    color: "#EBFF00",
    fontWeight: "700",
  },
});
