import React, { useContext, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons, FontAwesome5, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { GlobalContext } from '../config/GlobalUser';

export default function Parametre({ navigation }) {
    const[user, setUser]=useContext(GlobalContext);
  return (
    <ScrollView style={styles.container}> 
      <View style={styles.section}>
        <Text style={styles.subtitle}>Bienvenue</Text>
         <Text style={styles.phone}>{user?.nom_prenom || 'aucun'}</Text>
        <Text style={styles.phone}>{user?.telephone || 'aucun'}</Text>
      </View>

      <View style={styles.menu}>

        <View style={styles.card}>
          <MenuItem
            icon={<Ionicons name="person-outline" size={18} color="#333" />}
            label="Information de compte"
            onPress={() => navigation.navigate('ProfilUtilisateur')}
          />
        </View>

        <View style={styles.card}>
          <MenuItem
            icon={<Feather name="key" size={18} color="#333" />}
            label="Créer mon code"
            onPress={() => navigation.navigate('CreerCode')}
          />
        </View>

        <View style={styles.card}>
          <MenuItem
            icon={<MaterialCommunityIcons name="wallet-outline" size={18} color="#333" />}
            label="Plafond du compte"
            onPress={() => navigation.navigate('Plafond')}
          />
        </View>

        <View style={styles.card}>
          <MenuItem
            icon={<FontAwesome5 name="headset" size={18} color="#333" />}
            label="Service client"
            onPress={() => navigation.navigate('Connexion')}
          />
        </View>

        <View style={styles.card}>
          <MenuItem
            icon={<Feather name="file-text" size={18} color="#333" />}
            label="Termes et conditions"
            onPress={() => navigation.navigate('Termes')}
          />
        </View>

      </View>

      <TouchableOpacity style={styles.logout} onPress={() => navigation.navigate('Connexion')}>
        <Text style={styles.logoutText}>Déconnexion</Text>
        <Ionicons name="log-out-outline" size={20} color="#fbf8f8ff" />
      </TouchableOpacity>
    </ScrollView>
  );
}

function MenuItem({ icon, label, onPress }) {
  return (
    <TouchableOpacity style={styles.item} onPress={onPress}>
      <View style={styles.itemLeft}>
        {icon}
        <Text style={styles.itemText}>{label}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#999"/>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
    padding: 20,
  },
  section: {
    marginBottom: 25,
    
  },
  subtitle: {
    fontSize: 45,
    color: '#222',
    marginBottom: 4
  },
  phone: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333'
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 18
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  itemLeft: {
    flexDirection: 'row',
   
  },
  itemText: {
    fontSize: 15,
    color: '#333',
    marginLeft: 12
  },
  logout: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0d0d0dff',
    paddingVertical: 16,
    paddingHorizontal: 15,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fbf8f8ff'
  },
});
