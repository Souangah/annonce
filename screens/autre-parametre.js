import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome } from '@expo/vector-icons';
import { GlobalContext } from '../config/GlobalUser';

export default function Plus({ navigation }) {
  const [user] = useContext(GlobalContext);

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.welcome}>Bienvenue</Text>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user?.nom_prenom || 'Invité'}</Text>
        </View>
      </View>

      <View style={styles.menu}>
        <MenuItem
          icon={<Ionicons name="add-circle-outline" size={20} color="#5E72E4" />}
          label="Publier une annonce"
          onPress={() => navigation.navigate('AjouterAnnonce')}
        />

        <MenuItem
          icon={<MaterialCommunityIcons name="credit-card-plus-outline" size={20} color="#5E72E4" />}
          label="Rechargement"
          onPress={() => navigation.navigate('Rechargement')}
        />

        <MenuItem
          icon={<FontAwesome name="money" size={18} color="#5E72E4" />}
          label="Retrait"
          onPress={() => navigation.navigate('Retrait')}
        />

        <MenuItem
          icon={<MaterialCommunityIcons name="format-list-bulleted" size={20} color="#5E72E4" />}
          label="Mes annonces"
          onPress={() => navigation.navigate('AnnonceUtilisateur')}
        />

        <MenuItem
          icon={<Ionicons name="earth-outline" size={20} color="#5E72E4" />}
          label="Toutes les annonces"
          onPress={() => navigation.navigate('ListeAnnonces')}
        />

          <MenuItem
          icon={<Ionicons name="settings-outline" size={20} color="#5E72E4" />}
          label="Paramètre"
          onPress={() => navigation.navigate('Parametre')}
        />
      </View>
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
      <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  welcome: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 6,
  },
  userInfo: {
    marginTop: 10,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#334155',
  },
  phone: {
    fontSize: 15,
    color: '#64748B',
    marginTop: 4,
  },
  menu: {
    marginBottom: 20,
  },
  menuItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
    shadowColor: '#0F172A',
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 1.5,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#E0E7FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    color: '#1E293B',
    fontWeight: '500',
  },
});