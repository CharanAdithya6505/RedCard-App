import React from "react";
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

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="GetStarted" component={GetStarted} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Standings" component={StandingsScreen} />
        <Stack.Screen name="Favourites" component={FavouriteTeamsScreen} />
        <Stack.Screen name="News" component={NewsScreen} />
        <Stack.Screen name="TeamDetails" component={TeamDetailsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
