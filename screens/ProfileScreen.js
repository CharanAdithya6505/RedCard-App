import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import { useNavigation, useRoute } from "@react-navigation/native";

export default function ProfileScreen() {
  const navigation = useNavigation();
  const route = useRoute();

  const [name, setName] = useState(auth.currentUser?.displayName);
  const [photo, setPhoto] = useState(auth.currentUser?.photoURL);

  useEffect(() => {
    if (route.params?.updatedName) setName(route.params.updatedName);
    if (route.params?.updatedPhoto) setPhoto(route.params.updatedPhoto);
  }, [route.params]);

  const logout = async () => {
    await signOut(auth);
    navigation.replace("Login");
  };

  return (
    <LinearGradient
      colors={["#3b3d0e", "#0f0f0d", "#1a1a0d"]}
      style={styles.gradientBackground}
    >
      <View style={styles.container}>
        <LinearGradient colors={["#3b3b3b", "#2f2f2f"]} style={styles.card}>
          <Image
            source={{
              uri: photo || "https://i.ibb.co/4pDNDk1/avatar.png",
            }}
            style={styles.avatar}
          />

          <Text style={styles.name}>{name || "User"}</Text>
          <Text style={styles.email}>{auth.currentUser?.email}</Text>

          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => navigation.navigate("EditProfile")}
          >
            <Ionicons name="create-outline" size={18} color="#000" />
            <Text style={styles.editText}>Edit Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
            <Ionicons name="log-out-outline" size={20} color="#000" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientBackground: { flex: 1 },
  container: { flex: 1, justifyContent: "center", padding: 24 },
  card: {
    padding: 35,
    borderRadius: 32,
    backgroundColor: "#3a3a3a",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  avatar: {
    width: 130,
    height: 130,
    borderRadius: 70,
    borderWidth: 3,
    borderColor: "#d7fc5a",
  },
  name: { color: "#d7fc5a", fontSize: 26, fontWeight: "800", marginTop: 15 },
  email: { color: "#ddd", fontSize: 14, marginTop: 4 },
  editBtn: {
    flexDirection: "row",
    backgroundColor: "#d7fc5a",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 14,
    marginTop: 28,
    alignItems: "center",
  },
  editText: { marginLeft: 8, fontWeight: "700", color: "#000", fontSize: 16 },
  logoutBtn: {
    flexDirection: "row",
    backgroundColor: "#ff4c4c",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 14,
    marginTop: 16,
    alignItems: "center",
  },
  logoutText: { marginLeft: 8, fontWeight: "700", color: "#000", fontSize: 16 },
});
