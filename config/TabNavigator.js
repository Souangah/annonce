// config/TabNavigator.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, TouchableOpacity } from 'react-native';

// Importez vos écrans avec les chemins relatifs corrects
import HomeScreen from '../screens/HomeScreen'; // Ancien menu.js
import ListeAnnonces from '../screens/liste-annonce';
import AnnonceUtilisateur from '../screens/annonce-utilisateur';
import Parametre from '../screens/parametre';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="Accueil"
      screenOptions={{
        headerShown: false, // Laissez chaque écran gérer son propre header
        tabBarActiveTintColor: '#000000',
        tabBarInactiveTintColor: '#666',
        tabBarStyle: {
          height: 85, 
          paddingBottom: 15,
        },
      }}
    >
      <Tab.Screen
        name="Accueil"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Accueil',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="ListeAnnonces"
        component={ListeAnnonces}
        options={{
          tabBarLabel: 'Les Annonces',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="briefcase-outline" size={size} color={color} />
          ),
        }}
      />

      {/* Le Bouton Central Personnalisé pour AjouterAnnonce */}
      <Tab.Screen
        name="AddPlaceholder"
        component={View} // Composant vide
        options={({ navigation }) => ({
            tabBarLabel: '',
            tabBarIcon: () => (
                <Ionicons 
                    name="add" 
                    size={40} 
                    color="#fff" 
                    // Style de votre bouton noir
                    style={{
                        width: 56, height: 56, borderRadius: 28, 
                        backgroundColor: '#000', textAlign: 'center', 
                        textAlignVertical: 'center', marginTop: -25, 
                        overflow: 'hidden'
                    }}
                />
            ),
            tabBarButton: (props) => (
                <TouchableOpacity
                    {...props}
                    // Navigue vers la route Stack "AjouterAnnonce" SANS le menu
                    onPress={() => navigation.navigate('AjouterAnnonce')}
                    style={{ flex: 1, alignItems: 'center' }}
                />
            ),
        })}
      />

      <Tab.Screen
        name="MesAnnonces"
        component={AnnonceUtilisateur}
        options={{
          tabBarLabel: 'Mes Annonces',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="briefcase-outline" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Parametre"
        component={Parametre}
        options={{
          tabBarLabel: 'Paramètre',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}