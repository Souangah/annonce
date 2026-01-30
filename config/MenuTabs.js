import React, { useLayoutEffect, useContext, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { GlobalContext } from '../config/GlobalUser';
import { SafeAreaView } from 'react-native-safe-area-context';

// Importez vos screens ici
import Menu from '../screens/menu';
import ListeAnnonces from '../screens/liste-annonce';
import AnnonceUtilisateur from '../screens/annonce-utilisateur';
import Parametre from '../screens/parametre';
import AnnonceFavoris from '../screens/annonce-favoris';

const Tab = createBottomTabNavigator();

export default function MenuTabs({ navigation }) {
  const [user] = useContext(GlobalContext);
  const [count, setCount] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Vérifier si l'utilisateur est connecté
  useEffect(() => {
    setIsLoggedIn(!!user?.user_id);
  }, [user]);

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
    } else {
      setCount(0);
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
          {isLoggedIn ? (
            <>
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
            </>
          ) : null}
        </View>
      ),
    });
  }, [navigation, user, count, isLoggedIn]);

  // Si non connecté, afficher seulement le Menu sans tab navigation
  if (!isLoggedIn) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
        <View style={{flex: 1}}>
          <View style={styles.header}>
            <Image 
              source={require('../assets/images/logo.png')}
              style={styles.logo} 
            />
            <View style={styles.principal}>
              <TouchableOpacity
                onPress={() => navigation.navigate('Connexion')}
                style={styles.authButton}
              >
                <Text style={styles.authButtonText}>Connexion</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={() => navigation.navigate('Inscription')}
                style={[styles.authButton, styles.inscriptionButton]}
              >
                <Text style={[styles.authButtonText, styles.inscriptionButtonText]}>Inscription</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Afficher directement l'écran Menu */}
          <View style={{ flex: 1 }}>
            <Menu navigation={navigation} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Si connecté, afficher la tab navigation complète
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={{flex: 1}}>
        <View style={styles.header}>
          <Image 
            source={require('../assets/images/logo.png')}
            style={styles.logo} 
          />
          <View style={styles.principal}>
            <View style={styles.soldeContainer}>
              <Text style={styles.labelsolde}>Solde</Text>
              <Text style={styles.footersolde}>{user?.solde || 0} FCFA</Text>
            </View>
           
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
            
            <TouchableOpacity
              onPress={() => navigation.navigate('Connexion')}
              style={styles.iconButton}
            >
              <Ionicons name="log-out-outline" size={22} color="#000000" />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={{ flex: 1 }}>
        <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => {
        return (
      <View style={styles.tabBarStyle}>
        {/* Première paire */}
        <View style={styles.tabBarPair}>
          {props.state.routes.slice(0, 2).map((route, index) => (
            <TouchableOpacity
              key={route.key}
              onPress={() => props.navigation.navigate(route.name)}
              style={styles.tabBarButton}
            >
              <Ionicons
                name={
                  route.name === 'Menu'
                    ? 'home-outline'
                    : 'ListeAnnonces'
                    ? 'briefcase-outline'
                    : 'ellipse-outline'
                }
                size={25}
                color={props.state.index === index ? '#000' : '#888'}
              />
              <Text style={styles.tabLabel}>{route.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Espace central pour “Publier” */}
        <View style={{ width: 70 }} />

        {/* Deuxième paire */}
        <View style={styles.tabBarPair}>
          {props.state.routes.slice(2).map((route, index) => (
            <TouchableOpacity
              key={route.key}
              onPress={() => props.navigation.navigate(route.name)}
              style={styles.tabBarButton}
            >
              <Ionicons
                name={
                  route.name === 'AnnonceUtilisateur'
                    ? 'document-text-outline'
                    : 'Parametre'
                    ? 'settings-outline'
                    : 'ellipse-outline'
                }
                size={25}
                color={props.state.index === index + 2 ? '#000' : '#888'}
              />
              <Text style={styles.tabLabel}>{route.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  }}
>
      <Tab.Screen name="Menu" component={Menu} />
      <Tab.Screen name="ListeAnnonces" component={ListeAnnonces} />
      <Tab.Screen name="AnnonceUtilisateur" component={AnnonceUtilisateur} />
      <Tab.Screen name="Parametre" component={Parametre} />
    </Tab.Navigator>

          
          <TouchableOpacity
            style={styles.buttonpublier}
            onPress={() => navigation.navigate('AjouterAnnonce')}
          >
            <Ionicons name='add' size={30} color='white' />
            <Text style={styles.textbutton}>publier</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
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
  authButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#6366f1',
  },
  authButtonText: {
    color: '#6366f1',
    fontSize: 12,
    fontWeight: '500',
  },
  inscriptionButton: {
    backgroundColor: '#6366f1',
  },
  inscriptionButtonText: {
    color: '#fff',
  },
 tabBarStyle: {
  flexDirection: 'row',
  justifyContent: 'space-between', // espace entre les deux paires
  alignItems: 'center',
  paddingHorizontal: 15,
  height: 50,
  backgroundColor: '#fff',
  borderTopWidth: 1,
  borderTopColor: '#e0e0e0',
},
tabBarPair: {
  flexDirection: 'row',
  gap: 29, // espace entre boutons de la même paire
},
tabBarButton: {
  alignItems: 'center',
  justifyContent: 'center',
},
tabLabel: {
  fontSize: 10,
  color: '#888',
  marginTop: 2,
},
buttonpublier: {
  position: 'absolute',
  bottom: 2,
  alignSelf: 'center',
  left: '35%',
  width: 80,
  height: 80,
  borderRadius: 80,
  backgroundColor: '#ed720dff',
  justifyContent: 'center',
  alignItems: 'center',
  elevation: 5,
  shadowColor: '#000',
  shadowOpacity: 0.3,
  shadowRadius: 5,
  shadowOffset: { width: 0, height: 3 },
  zIndex: 10,
},

  textbutton: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  principal: {
    flexDirection: 'row',
    marginHorizontal: 15,
    gap: 10,
    alignItems: 'center',
  },
  logo: {
    width: 58,
    height: 58, 
    borderRadius: 5,
    marginHorizontal: 10,
  },
});