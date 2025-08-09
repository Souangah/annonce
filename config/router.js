import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Connexion from '../screens/connexion';
import Inscription from '../screens/inscription';
import Menu from '../screens/menu';
import AjoutAnnonce from '../screens/aj-annonce';
import ListeAnnonces from '../screens/liste-annonce';
import ProfilUtilisateur from '../screens/profil';
import Accueil from '../screens/accueil';
import NotificationPush from './NotificationPush';
import { navigationRef } from './NotificationPush';
import DetailsAnnonce from '../screens/details-annonce';
import AnnonceUtilisateur from '../screens/annonce-utilisateur';
import Rechargement from '../screens/rechargement';
import Retrait from '../screens/retrait';
import Parametre from '../screens/parametre';
import Plus from '../screens/autre-parametre';
import Service from '../screens/service';
import Notification from '../screens/notification-non-lu';




const Stack = createStackNavigator();

export default function Router() {
  return (
    <NavigationContainer ref={navigationRef}>
       <NotificationPush />
      <Stack.Navigator initialRouteName="Connexion">
        <Stack.Screen name="Connexion" component={Connexion} />
        <Stack.Screen name="Inscription" component={Inscription} />
        <Stack.Screen name="Menu" component={Menu} options={{ headerShown: true }}/>
        <Stack.Screen name="AjouterAnnonce" component={AjoutAnnonce} />
        <Stack.Screen name="ListeAnnonces" component={ListeAnnonces} />
         <Stack.Screen name="ProfilUtilisateur" component={ProfilUtilisateur} />
         <Stack.Screen name="Accueil" component={Accueil} />
         <Stack.Screen name="Details d'annonce" component={DetailsAnnonce} />
         <Stack.Screen name="AnnonceUtilisateur" component={AnnonceUtilisateur} />
         <Stack.Screen name="Rechargement" component={Rechargement} />
         <Stack.Screen name="Retrait" component={Retrait} />
          <Stack.Screen name="Parametre" component={Parametre} />
          <Stack.Screen name="Plus" component={Plus} />
           <Stack.Screen name="Service" component={Service} />
           <Stack.Screen name="Notification" component={Notification} /> 
      </Stack.Navigator>
    </NavigationContainer>
  );
}
