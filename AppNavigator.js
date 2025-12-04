import React from "react";
import { View, StyleSheet } from "react-native";
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

const Stack = createStackNavigator();

const withFooter = (Component) => {
  return function WrappedComponent(props) {
    return (
      <View style={{ flex: 1 }}>
        <Component {...props} />
        <FooterDock />
      </View>
    );
  };
};

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="GetStarted" component={GetStarted} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="Home" component={withFooter(HomeScreen)} />
        <Stack.Screen name="Standings" component={withFooter(StandingsScreen)} />
        <Stack.Screen
          name="Favourites"
          component={withFooter(FavouriteTeamsScreen)}
        />
        <Stack.Screen name="News" component={withFooter(NewsScreen)} />
        <Stack.Screen
          name="TeamDetails"
          component={withFooter(TeamDetailsScreen)}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
