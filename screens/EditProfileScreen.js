import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { auth, db, storage } from "../firebase";
import { updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

export default function EditProfileScreen() {
  const navigation = useNavigation();
  const user = auth.currentUser;

  const [username, setUsername] = useState(user?.displayName || "");
  const [image, setImage] = useState(user?.photoURL || null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaType.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    setLoading(true);

    let photoURL = user?.photoURL;

    if (image && !image.startsWith("https")) {
      const response = await fetch(image);
      const imgBlob = await response.blob();

      const imgRef = ref(storage, `profilePics/${user.uid}.jpg`);
      await uploadBytes(imgRef, imgBlob);
      photoURL = await getDownloadURL(imgRef);
    }

    await updateProfile(user, { displayName: username, photoURL });

    await setDoc(
      doc(db, "users", user.uid),
      {
        username,
        photoURL,
        email: user.email,
      },
      { merge: true }
    );

    navigation.navigate("Profile", {
      updatedName: username,
      updatedPhoto: photoURL,
    });

    setLoading(false);
  };

  return (
    <LinearGradient
      colors={["#3b3d0e", "#0f0f0d", "#1a1a0d"]}
      style={styles.gradientBackground}
    >
      <View style={styles.container}>
        <LinearGradient colors={["#4a4f0f", "#2a2a0c"]} style={styles.card}>
          <TouchableOpacity onPress={pickImage}>
            <Image
              source={{
                uri: image || "https://i.ibb.co/4pDNDk1/avatar.png",
              }}
              style={styles.avatar}
            />
          </TouchableOpacity>

          <TextInput
            placeholder="Enter username"
            placeholderTextColor="#aaa"
            value={username}
            onChangeText={setUsername}
            style={styles.nameInput}
          />

          <Text style={styles.email}>{user?.email}</Text>

          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            {loading ? (
              <ActivityIndicator size="small" color="#000" />
            ) : (
              <Text style={styles.saveText}>Save Changes</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelText}>Cancel</Text>
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
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
    alignItems: "center",
  },
  avatar: {
    width: 130,
    height: 130,
    borderRadius: 70,
    borderWidth: 3,
    borderColor: "#d7fc5a",
    marginBottom: 20,
  },
  nameInput: {
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.13)",
    color: "#d7fc5a",
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    borderRadius: 14,
    paddingVertical: 10,
    marginBottom: 10,
  },
  email: { color: "#ddd", fontSize: 14, marginBottom: 20 },
  saveBtn: {
    flexDirection: "row",
    backgroundColor: "#d7fc5a",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 15,
  },
  saveText: { marginLeft: 8, fontWeight: "700", color: "#000", fontSize: 16 },
  cancelBtn: {
    flexDirection: "row",
    backgroundColor: "#ff4c4c",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 14,
    alignItems: "center",
  },
  cancelText: { marginLeft: 8, fontWeight: "700", color: "#000", fontSize: 16 },
});
