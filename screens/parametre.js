import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons, FontAwesome5, Feather, MaterialCommunityIcons, FontAwesome } from '@expo/vector-icons';
import { GlobalContext } from '../config/GlobalUser';

export default function Parametre({ navigation }) {
  const [user] = useContext(GlobalContext);

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.welcome}>Paramètres</Text>
      </View>

      <View style={styles.menu}>
        <MenuItem
          icon={<Ionicons name="person-outline" size={22} color="#5E72E4" />}
          label="Information de compte"
          onPress={() => navigation.navigate('ProfilUtilisateur')}
        />

        <MenuItem
          icon={<Ionicons name="add-circle-outline" size={22} color="#5E72E4" />}
          label="Publier une annonce"
          onPress={() => navigation.navigate('AjouterAnnonce')}
        />

        <MenuItem
          icon={<MaterialCommunityIcons name="credit-card-plus-outline" size={22} color="#5E72E4" />}
          label="Rechargement"
          onPress={() => navigation.navigate('Rechargement')}
        />

        <MenuItem
          icon={<FontAwesome name="money" size={22} color="#5E72E4" />}
          label="Retrait"
          onPress={() => navigation.navigate('Retrait')}
        />

        <MenuItem
          icon={<Ionicons name="earth-outline" size={22} color="#5E72E4" />}
          label="Toutes les annonces"
          onPress={() => navigation.navigate('ListeAnnonces')}
        />

        <MenuItem
          icon={<MaterialCommunityIcons name="format-list-bulleted" size={22} color="#5E72E4" />}
          label="Mes annonces"
          onPress={() => navigation.navigate('AnnonceUtilisateur')}
        />

        <MenuItem
          icon={<FontAwesome5 name="headset" size={22} color="#5E72E4" />}
          label="Service client"
          onPress={() => navigation.navigate('Service')}
        />

        <MenuItem
          icon={<Feather name="file-text" size={22} color="#5E72E4" />}
          label="Termes et conditions"
          onPress={() => navigation.navigate('Termes')}
        />
      </View>

      <TouchableOpacity 
        style={styles.logoutButton} 
        onPress={() => navigation.navigate('Connexion')}
        activeOpacity={0.9}
      >
        <View style={styles.logoutContent}>
          <Ionicons name="log-out-outline" size={20} color="#fff" />
          <Text style={styles.logoutText}>Déconnexion</Text>
        </View>
      </TouchableOpacity>
    </ScrollView>
  );
}

function MenuItem({ icon, label, onPress }) {
  return (
    <TouchableOpacity 
      style={styles.menuItem} 
      onPress={onPress} 
      activeOpacity={0.9}
    >
      <View style={styles.menuIcon}>
        {icon}
      </View>
      <Text style={styles.menuLabel}>{label}</Text>
      <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 30,
  },
  header: {
    marginBottom: 8,
    paddingBottom: 8,
  },
  welcome: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
  },
  menu: {
    marginBottom: 16,
  },
  menuItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  menuIcon: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: '#E0E7FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuLabel: {
    flex: 1,
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '500',
  },
  logoutButton: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginTop: 8,
  },
  logoutContent: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
});