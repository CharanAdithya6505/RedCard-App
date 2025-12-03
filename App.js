import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import GetStarted from "./screens/GetStarted";
import { HomeScreen, MatchDetailsScreen } from "./screens/HomeScreen";
import StandingsScreen from "./screens/StandingsScreen";
import FavouriteTeamsScreen from "./screens/FavouriteTeamsScreen";
import TeamDetailsScreen from "./screens/TeamDetailsScreen";

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="GetStarted" component={GetStarted} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="MatchDetails" component={MatchDetailsScreen} />
        <Stack.Screen name="Standings" component={StandingsScreen} />
        <Stack.Screen name="Favourites" component={FavouriteTeamsScreen} />
        <Stack.Screen
          name="TeamDetails"
          component={TeamDetailsScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
