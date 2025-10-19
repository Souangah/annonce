import React, { useLayoutEffect, useContext, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { GlobalContext } from '../config/GlobalUser';
import NotificationBadge from '../screens/notification-non-lu';

// Importez vos screens ici
import Accueil from '../screens/accueil';
import ListeAnnonces from '../screens/liste-annonce';
import AjouterAnnonce from '../screens/aj-annonce';
import AnnonceUtilisateur from '../screens/annonce-utilisateur';
import Parametre from '../screens/parametre';
import Menu from '../screens/menu';


const Tab = createBottomTabNavigator();

export default function MenuTabs({ navigation }) {
  const [user] = useContext(GlobalContext);
  const [count, setCount] = useState(0);

  // Fonction pour récupérer les notifications non lues
  const fetchCount = async () => {
    if (!user?.user_id) {
      console.warn('user_id est undefined ou vide, appel API ignoré');
      return;
    }
    try {
      const res = await fetch(
        `https://epencia.net/app/souangah/annonce/notification-non-lu.php?user_id=${user.user_id}`
      );
      const data = await res.json();
      if (data && data[0]?.total) {
        setCount(data[0].total);
      }
    } catch (error) {
      console.error('Erreur de connexion:', error);
    }
  };

  useEffect(() => {
    if (user?.user_id) {
      fetchCount();
      const interval = setInterval(fetchCount, 10000); // actualise chaque 10 secondes
      return () => clearInterval(interval);
    }
  }, [user?.user_id]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: '',
      headerStyle: {
        backgroundColor: '#fff',
        elevation: 0,
        shadowOpacity: 0,
      },
      headerTintColor: '#000000',
      headerRight: () => (
        <View style={styles.headerRight}>
          <NotificationBadge
            userId={user?.code_utilisateur}
            onPress={() => navigation.navigate('Notification')}
          />
          {count > 0 && (
            <View style={styles.badgeContainer}>
              <Text style={styles.badgeText}>{count}</Text>
            </View>
          )}
          <TouchableOpacity
            onPress={() => navigation.navigate('MenuSolde')}
            style={styles.soldeButton}
          >
            <Ionicons name="wallet-outline" size={22} color="#000000" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('Connexion')}
            style={styles.logoutButton}
          >
            <Ionicons name="log-out-outline" size={22} color="#000000" />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, user, count]);

  return (
    <Tab.Navigator initialRouteName='Menu'
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#000',
        tabBarInactiveTintColor: '#888',
        tabBarStyle: styles.tabBarStyle,
        tabBarLabelStyle: styles.tabBarLabelStyle,
        tabBarIcon: ({ color, size, focused }) => {
          let iconName;

          switch (route.name) {
            case 'Menu':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'ListeAnnonces':
              iconName = 'briefcase-outline';
              break;
            case 'AjouterAnnonce':
              iconName = 'add';
              break;
            case 'AnnonceUtilisateur':
              iconName = 'briefcase-outline';
              break;
            case 'Parametre':
              iconName = focused ? 'settings' : 'settings-outline';
              break;
            default:
              iconName = 'ellipse-outline';
          }

          if (route.name === 'AjouterAnnonce') {
            return (
              <View style={styles.mainActionButton}>
                <Ionicons name="add" size={30} color="#fff" />
              </View>
            );
          }

          return <Ionicons name={iconName} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Menu"
        component={Menu}
        options={{ tabBarLabel: 'Menu' }}
      />
      <Tab.Screen
        name="ListeAnnonces"
        component={ListeAnnonces}
        options={{ tabBarLabel: 'Les Annonces' }}
      />
      <Tab.Screen
        name="AjouterAnnonce"
        component={AjouterAnnonce}
        initialParams={{ user }}
        options={{ tabBarLabel: 'Ajouter' }}
      />
      <Tab.Screen
        name="AnnonceUtilisateur"
        component={AnnonceUtilisateur}
        options={{ tabBarLabel: 'Mes Annonces' }}
      />
      <Tab.Screen
        name="Parametre"
        component={Parametre}
        options={{ tabBarLabel: 'Paramètre' }}
      />
    </Tab.Navigator>
  );
}
const styles = StyleSheet.create({
  headerRight: {
    flexDirection: 'row',
    marginRight: 15,
    alignItems: 'center',
  },
  badgeContainer: {
    position: 'absolute',
    top: 0,
    left: 25,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  soldeButton: {
    marginLeft: 15,
  },
  logoutButton: {
    marginLeft: 15,
  },
  tabBarStyle: {
    backgroundColor: '#fff',
    height: 55, // Reduced height to move tabs upward
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingBottom: 2, // Reduced padding to shift tabs up
    paddingTop: 10,
    marginBottom: 40, // Negative margin to pull the tab bar higher
  },
  tabBarLabelStyle: {
    fontSize: 9,
    fontWeight: '500',
    marginBottom: 8, // Adjusted to keep labels aligned with icons
  },
  mainActionButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -25, // Adjusted to align with the raised tab bar
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});