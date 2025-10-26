import React, { useLayoutEffect, useContext, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { GlobalContext } from '../config/GlobalUser';
import Notification from '../screens/notification-non-lu';

// Importez vos screens ici
import Accueil from '../screens/accueil';
import ListeAnnonces from '../screens/liste-annonce';
import AjouterAnnonce from '../screens/aj-annonce';
import AnnonceUtilisateur from '../screens/annonce-utilisateur';
import Parametre from '../screens/parametre';
import Menu from '../screens/menu';
import NotificationsScreen from '../screens/notification-non-lu'; // Nouvel écran

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
      } else {
        setCount(0);
      }
    } catch (error) {
      console.error('Erreur de connexion:', error);
      setCount(0);
    }
  };

  useEffect(() => {
    if (user?.user_id) {
      fetchCount();
      const interval = setInterval(fetchCount, 10000);
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
          <TouchableOpacity 
            onPress={() => navigation.navigate('Notification')}
            style={styles.notificationButton}
          >
            <Ionicons name="notifications-outline" size={24} color="#000000" />
            {count > 0 && (
              <View style={styles.badgeContainer}>
                <Text style={styles.badgeText}>
                  {count > 99 ? '99+' : count}
                </Text>
              </View>
            )}
          </TouchableOpacity>
          
          <View style={styles.soldeContainer}>
            <Text style={styles.labelsolde}>Solde</Text>
            <Text style={styles.footersolde}>{user?.solde || 0} FCFA</Text>
          </View>
          
          <TouchableOpacity
            onPress={() => navigation.navigate('MenuSolde')}
            style={styles.iconButton}
          >
            <Ionicons name="wallet-outline" size={22} color="#000000" />
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => navigation.navigate('Connexion')}
            style={styles.iconButton}
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
              iconName = focused ? 'briefcase' : 'briefcase-outline';
              break;
            case 'AjouterAnnonce':
              iconName = 'add';
              break;
            case 'AnnonceUtilisateur':
              iconName = focused ? 'document-text' : 'document-text-outline';
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
    gap: 15,
  },
  notificationButton: {
    position: 'relative',
    padding: 5,
  },
  badgeContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  soldeContainer: {
    alignItems: 'center',
  },
  labelsolde: {
    fontSize: 12,
    fontWeight: '500',
  },
  footersolde: {
    fontSize: 10,
    color: '#666',
  },
  iconButton: {
    padding: 5,
  },
  tabBarStyle: {
    backgroundColor: '#fff',
    height: 95,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingBottom: 2,
    paddingTop: 10,
  },
  tabBarLabelStyle: {
    fontSize: 9,
    fontWeight: '500',
    marginBottom: 8,
  },
  mainActionButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -25,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});