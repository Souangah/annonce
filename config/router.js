import React, { useEffect, useContext, useState } from 'react';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Linking from 'expo-linking';

import Connexion from '../screens/connexion';
import Inscription from '../screens/inscription';
import Menu from '../screens/menu';
import AjoutAnnonce from '../screens/aj-annonce';
import ListeAnnonces from '../screens/liste-annonce';
import ProfilUtilisateur from '../screens/profil';
import Accueil from '../screens/accueil';
import NotificationPush from './NotificationPush';
import DetailsAnnonce from '../screens/details-annonce';
import AnnonceUtilisateur from '../screens/annonce-utilisateur';
import Rechargement from '../screens/rechargement';
import Retrait from '../screens/retrait';
import Parametre from '../screens/parametre';
import Plus from '../screens/autre-parametre';
import Service from '../screens/service';
import Notification from '../screens/notification-non-lu';
import MenuTabs from './MenuTabs';
import AnnonceFavoris from '../screens/annonce-favoris';
import AnnoncesProfil from '../screens/annonce-profil';
import AnnonceDetail from '../screens/AnnonceDetail';
import ModifierProfil from '../screens/modifier-profil';
import Abonnement from '../screens/abonnement';
import PaiementSucces from '../screens/PaiementSucces';
import { GlobalContext } from '../config/GlobalUser';

export const navigationRef = createNavigationContainerRef();

const Stack = createStackNavigator();

export default function Router() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useContext(GlobalContext);

  useEffect(() => {
    const restoreSession = async () => {
      const savedUser = await AsyncStorage.getItem('user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
      setLoading(false);
    };
    restoreSession();
  }, []);

  const linking = {
    prefixes: ['yebema://'],
    config: {
      screens: {
        PaiementSucces: {
          path: 'paiement-succes',
          parse: {
            numero: (numero) => decodeURIComponent(numero),
          },
        },
        Abonnement: 'abonnement',
        AjouterAnnonce: 'publier',
        Notification: 'notification',
        AnnonceDetail: 'annonce/:id',
        MenuTabs: '',
      },
    },
  };

  if (loading) return null;

  return (
    <NavigationContainer
      ref={navigationRef}
      linking={linking}
      fallback={null}
    >
      <NotificationPush />

      <Stack.Navigator
        initialRouteName="MenuTabs"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen 
          name="PaiementSucces" 
          component={PaiementSucces}
          options={{
            headerShown: true,
            title: 'Paiement Réussi',
          }}
        />

        <Stack.Screen name="MenuTabs" component={MenuTabs} />
        <Stack.Screen name="Connexion" component={Connexion} />
        <Stack.Screen name="Inscription" component={Inscription} />
        <Stack.Screen name="Menu" component={Menu} />
        <Stack.Screen name="AjouterAnnonce" component={AjoutAnnonce} />
        <Stack.Screen name="ListeAnnonces" component={ListeAnnonces} />
        <Stack.Screen name="ProfilUtilisateur" component={ProfilUtilisateur} />
        <Stack.Screen name="Accueil" component={Accueil} />
        <Stack.Screen name="DetailsAnnonce" component={DetailsAnnonce} />
        <Stack.Screen name="AnnonceUtilisateur" component={AnnonceUtilisateur} />
        <Stack.Screen name="Rechargement" component={Rechargement} />
        <Stack.Screen name="Retrait" component={Retrait} />
        <Stack.Screen name="Parametre" component={Parametre} />
        <Stack.Screen name="Plus" component={Plus} />
        <Stack.Screen name="Service" component={Service} />
        <Stack.Screen name="Notification" component={Notification} />
        <Stack.Screen name="AnnonceFavoris" component={AnnonceFavoris} />
        <Stack.Screen name="AnnoncesProfil" component={AnnoncesProfil} />
        <Stack.Screen name="AnnonceDetail" component={AnnonceDetail} />
        <Stack.Screen name="ModifierProfil" component={ModifierProfil} />
        <Stack.Screen 
          name="Abonnement" 
          component={Abonnement}
          options={{ headerShown: true, title: 'Abonnement' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
