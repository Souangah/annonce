import React, { useLayoutEffect, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { GlobalContext } from '../config/GlobalUser';

const { width } = Dimensions.get('window');

export default function Menu({ navigation, route }) {


  const[user, setUser] = useContext(GlobalContext);
   

  // Configuration de l'en-tête
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
        <View style={{ flexDirection: 'row', marginRight: 15 }}>
          <TouchableOpacity 
            onPress={() => Alert.alert('Notifications', 'Aucune notification')}
            style={styles.notificationBadge}
          >
            <Icon name="notifications-outline" size={22} color="#000000" style={{ marginRight: 20 }} /> 
            <View style={styles.badge} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Connexion')}>
            <Icon name="log-out-outline" size={22} color="#000000" /> 
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation]);

  return (
    <View style={styles.container}>
      {/* Contenu principal */}
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Bonjour,</Text>
          <Text style={styles.username}>{user?.nom_prenom}</Text>
          <Text style={styles.subtitle}>Que souhaitez-vous faire aujourd'hui ?</Text>
        </View>
      </View>

      {/* Menu en bas */}
      <View style={styles.bottomMenu}>
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => Alert.alert('Plus', 'Options supplémentaires')}
        >
          <Icon name="home" size={24} color="#000000" /> 
          <Text style={styles.menuLabel}>Acceuil</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigation.navigate('ListeAnnonces')}
        >
          <Icon name="list-outline" size={22} color="#000000" /> 
          <Text style={styles.menuLabel}>Annonces</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.mainActionButton}
          onPress={() => navigation.navigate('AjouterAnnonce', { user })}
        >
          <Icon name="add" size={30} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigation.navigate('ListeAnnonces')}
        >
          <Icon name="briefcase-outline" size={22} color="#000000" /> 
          <Text style={styles.menuLabel}>Mes annonces</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuItem} 
          onPress={() => navigation.navigate('ProfilUtilisateu')}
        >
          <Icon name="person-outline" size={22} color="#000000" /> 
          <Text style={styles.menuLabel}>Profil</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { flex: 1, padding: 24, paddingTop: 40 },
  header: { marginBottom: 32 },
  greeting: { fontSize: 24, color: '#555', fontWeight: '300' },
  username: { fontSize: 28, color: '#000', fontWeight: 'bold', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#888' },
  mainActionButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    marginTop: -25,
  },
  bottomMenu: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingBottom: 24,
    paddingHorizontal: 10,
    position: 'absolute',
    bottom: 30,
  },
  menuItem: {
    alignItems: 'center',
    flex: 1,
    paddingVertical: 8,
  },
  menuLabel: {
    fontSize: 10,
    color: '#000',
    marginTop: 6,
    fontWeight: '500',
  },
  notificationBadge: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    right: 15,
    top: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF5722',
  },
});
