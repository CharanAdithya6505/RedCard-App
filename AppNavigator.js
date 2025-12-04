import React, { useState } from "react";
import { View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import LoginScreen from "./screens/LoginScreen";
import SignupScreen from "./screens/SignupScreen";
import GetStarted from "./screens/GetStarted";
import HomeScreen from "./screens/HomeScreen";
import StandingsScreen from "./screens/StandingsScreen";
import FavouriteTeamsScreen from "./screens/FavouriteTeamsScreen";
import NewsScreen from "./screens/NewsScreen";
import TeamDetailsScreen from "./screens/TeamDetailsScreen";
import FooterDock from "./components/FooterDock";
import ProfileScreen from "./screens/ProfileScreen";
import EditProfileScreen from "./screens/EditProfileScreen";

const Stack = createStackNavigator();

export default function AppNavigator() {
  const [currentRoute, setCurrentRoute] = useState("GetStarted");

  const hideFooterScreens = ["GetStarted", "Login", "Signup"];
  const shouldShowFooter = !hideFooterScreens.includes(currentRoute);

  return (
    <SafeAreaProvider>
      <NavigationContainer
        onStateChange={(state) => {
          const route = state?.routes[state.index]?.name;
          if (route) setCurrentRoute(route);
        }}
      >
        <View style={{ flex: 1 }}>
          <View style={{ flex: 1 }}>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
              <Stack.Screen name="GetStarted" component={GetStarted} />
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Signup" component={SignupScreen} />

              <Stack.Screen name="Home" component={HomeScreen} />
              <Stack.Screen name="Standings" component={StandingsScreen} />
              <Stack.Screen
                name="Favourites"
                component={FavouriteTeamsScreen}
              />
              <Stack.Screen name="News" component={NewsScreen} />
              <Stack.Screen name="Profile" component={ProfileScreen} />
              <Stack.Screen name="EditProfile" component={EditProfileScreen} />
              <Stack.Screen name="TeamDetails" component={TeamDetailsScreen} />
            </Stack.Navigator>
          </View>
          {shouldShowFooter && <FooterDock />}
        </View>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
