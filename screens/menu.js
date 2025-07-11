import React, { useLayoutEffect, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GlobalContext } from '../config/GlobalUser';

const { width } = Dimensions.get('window');

export default function Menu({ navigation }) {
  const [user, setUser] = useContext(GlobalContext);

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
            <Ionicons name="notifications-outline" size={22} color="#000000" style={{ marginRight: 20 }} />
            <View style={styles.badge} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Connexion')}>
            <Ionicons name="log-out-outline" size={22} color="#000000" />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.compte}>
        <Text style={styles.title}>Mon solde</Text>
        <Text style={styles.solde}>{user?.solde ?? 0} FCFA</Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={[styles.button, styles.retrait]}>
            <Text style={styles.buttonText}>Retrait</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, styles.recharge]}>
            <Text style={styles.buttonText}>Recharger</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.bottomMenu}>
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => Alert.alert('Plus', 'Options supplémentaires')}
        >
          <Ionicons name="home" size={24} color="#000000" /> 
          <Text style={styles.menuLabel}>Accueil</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigation.navigate('ListeAnnonces')}
        >
          <Ionicons name="briefcase-outline" size={22} color="#000" />
          <Text style={styles.menuLabel}>Tout les Annonces</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.mainActionButton}
          onPress={() => navigation.navigate('AjouterAnnonce', { user })}
        >
          <Ionicons name="add" size={30} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigation.navigate('AnnonceUtilisateur')}
        >
          <Ionicons name="briefcase-outline" size={22} color="#000" />
          <Text style={styles.menuLabel}>Mes Annonces</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigation.navigate('ProfilUtilisateur')}
        >
          <Ionicons name="person-outline" size={22} color="#000000" />
          <Text style={styles.menuLabel}>Profil</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f0f0' },
  compte: {
    flex: 1,
    justifyContent: 'top',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '300',
    marginBottom: 10,
    color: '#333',
  },
  solde: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '00000',
    marginBottom: 30,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 20, // si ton RN le supporte (>=0.71)
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    elevation: 2,
  },
  retrait: {
    backgroundColor: '#f44336',
  },
  recharge: {
    backgroundColor: '#2196F3',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // ton menu déjà existant
  bottomMenu: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: '#f0f0f0',
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
