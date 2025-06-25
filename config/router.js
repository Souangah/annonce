import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Connexion from '../screens/connexion';
import Inscription from '../screens/inscription';
import Menu from '../screens/menu';
import AjoutAnnonce from '../screens/aj-annonce';

const Stack = createStackNavigator();

export default function Router() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Menu">
        <Stack.Screen name="Connexion" component={Connexion} />
        <Stack.Screen name="Inscription" component={Inscription} />
        <Stack.Screen name="Menu" component={Menu} />
        <Stack.Screen name="AjouterAnnonce" component={AjoutAnnonce} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
