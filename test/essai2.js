import React, { useLayoutEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const { width } = Dimensions.get('window');

const PRIMARY_COLOR = '#2196F3'; // Bleu vif
const SECONDARY_COLOR = '#64B5F6'; // Bleu plus clair
const TEXT_COLOR = '#1976D2'; // Bleu foncé pour texte
const WHITE = '#FFFFFF';
const LIGHT_GRAY = '#F5F5F5';

export default function BlueThemeMenu({ navigation, route }) {
  const user = route.params?.user || { login: 'Utilisateur' };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: '',
      headerStyle: {
        backgroundColor: WHITE,
        elevation: 0,
        shadowOpacity: 0,
      },
      headerTintColor: PRIMARY_COLOR,
      headerRight: () => (
        <View style={{ flexDirection: 'row', marginRight: 15 }}>
          <TouchableOpacity 
            onPress={() => Alert.alert('Notifications', 'Aucune notification')}
            style={styles.notificationBadge}
          >
            <Icon name="notifications-outline" size={24} color={PRIMARY_COLOR} style={{ marginRight: 20 }} />
            <View style={styles.badge} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Connexion')}>
            <Icon name="log-out-outline" size={24} color={PRIMARY_COLOR} />
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
          <Text style={styles.username}>{user.login}</Text>
          <Text style={styles.subtitle}>Que souhaitez-vous faire aujourd'hui ?</Text>
        </View>
      </View>

      {/* Menu en bas avec bouton central */}
      <View style={styles.bottomMenu}>
        <TouchableOpacity 
          style={styles.menuItem} 
          onPress={() => navigation.navigate('Profil')}
        >
          <View style={styles.menuIcon}>
            <Icon name="person-outline" size={24} color={WHITE} />
          </View>
          <Text style={styles.menuLabel}>Profil</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigation.navigate('ListeAnnonces')}
        >
          <View style={styles.menuIcon}>
            <Icon name="list-outline" size={24} color={WHITE} />
          </View>
          <Text style={styles.menuLabel}>Annonces</Text>
        </TouchableOpacity>

        {/* Bouton central d'action principale */}
        <TouchableOpacity
          style={styles.mainActionButton}
          onPress={() => navigation.navigate('AjouterAnnonce', { user })}
        >
          <Icon name="add" size={28} color={WHITE} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigation.navigate('MesAnnonces')}
        >
          <View style={styles.menuIcon}>
            <Icon name="briefcase-outline" size={24} color={WHITE} />
          </View>
          <Text style={styles.menuLabel}>Mes annonces</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => Alert.alert('Plus', 'Options supplémentaires')}
        >
          <View style={styles.menuIcon}>
            <Icon name="ellipsis-horizontal-outline" size={24} color={WHITE} />
          </View>
          <Text style={styles.menuLabel}>Plus</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LIGHT_GRAY,
  },
  content: {
    flex: 1,
    padding: 24,
    paddingTop: 40,
  },
  header: {
    marginBottom: 32,
  },
  greeting: {
    fontSize: 24,
    color: TEXT_COLOR,
    fontWeight: '300',
  },
  username: {
    fontSize: 28,
    color: PRIMARY_COLOR,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: TEXT_COLOR,
    opacity: 0.8,
  },
  mainActionButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: PRIMARY_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: PRIMARY_COLOR,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    marginTop: -30,
    borderWidth: 3,
    borderColor: WHITE,
  },
  bottomMenu: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 15,
    backgroundColor: WHITE,
    borderTopWidth: 1,
    borderTopColor: '#E3F2FD',
    paddingBottom: 25,
    paddingHorizontal: 10,
  },
  menuItem: {
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    backgroundColor: SECONDARY_COLOR,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  menuLabel: {
    fontSize: 12,
    color: TEXT_COLOR,
    fontWeight: '600',
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