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
import { doc, updateDoc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

export default function EditProfileScreen({ navigation }) {
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
        <LinearGradient colors={["#3b3b3b", "#2f2f2f"]} style={styles.card}>
          <Text style={styles.title}>Edit Profile</Text>

          <TouchableOpacity onPress={pickImage} style={styles.imageWrapper}>
            <Image
              source={{
                uri: image || "https://i.ibb.co/4pDNDk1/avatar.png",
              }}
              style={styles.avatar}
            />
            <View style={styles.editIcon}>
              <Ionicons name="camera" size={22} color="#000" />
            </View>
          </TouchableOpacity>

          <TextInput
            placeholder="Enter username"
            placeholderTextColor="#aaa"
            value={username}
            onChangeText={setUsername}
            style={styles.input}
          />

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
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#d7fc5a",
    marginBottom: 25,
  },
  imageWrapper: { position: "relative" },
  avatar: {
    width: 130,
    height: 130,
    borderRadius: 70,
    borderWidth: 3,
    borderColor: "#d7fc5a",
  },
  editIcon: {
    position: "absolute",
    bottom: 4,
    right: 4,
    backgroundColor: "#d7fc5a",
    borderRadius: 18,
    padding: 6,
  },
  input: {
    width: "100%",
    marginTop: 25,
    backgroundColor: "rgba(255,255,255,0.13)",
    padding: 14,
    borderRadius: 14,
    color: "#fff",
    fontSize: 16,
  },
  saveBtn: {
    width: "100%",
    backgroundColor: "#d7fc5a",
    padding: 15,
    borderRadius: 14,
    marginTop: 30,
    alignItems: "center",
  },
  saveText: { fontSize: 17, fontWeight: "700", color: "#000" },
  cancelBtn: { marginTop: 15 },
  cancelText: { color: "#d7fc5a", fontSize: 15, fontWeight: "600" },
});
