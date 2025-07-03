import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Connexion from '../screens/connexion';
import Inscription from '../screens/inscription';
import Menu from '../screens/menu';
import AjoutAnnonce from '../screens/aj-annonce';
import ListeAnnonces from '../screens/liste-annonce';
import ProfilUtilisateur from '../screens/profil';



const Stack = createStackNavigator();

export default function Router() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Connexion">
        <Stack.Screen name="Connexion" component={Connexion} />
        <Stack.Screen name="Inscription" component={Inscription} />
        <Stack.Screen name="Menu" component={Menu} />
        <Stack.Screen name="AjouterAnnonce" component={AjoutAnnonce} />
        <Stack.Screen name="ListeAnnonces" component={ListeAnnonces} />
         <Stack.Screen name="ProfilUtilisateur" component={ProfilUtilisateur} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
