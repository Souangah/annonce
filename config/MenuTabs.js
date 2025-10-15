// components/MenuGlobal.js
import React, { useState, useEffect, useLayoutEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function MenuGlobal({ navigation, user }) {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Fonction pour récupérer les notifications non lues
  const fetchCount = async () => {
    try {
      setLoading(true);
      const res = await fetch(`https://epencia.net/app/souangah/annonce/notification-non-lu.php?user_id=${user?.user_id}`);
      const data = await res.json();
      if (data && data.length > 0) {
        setCount(data[0].total);
      }
    } catch (error) {
      console.error('Erreur de connexion:', error);
    } finally {
      setLoading(false);
    }
  };

  // Charger le compteur au montage du composant
  useEffect(() => {
    if (user?.user_id) {
      fetchCount();
    }
  }, [user]);

  // Configurer le header
  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: '',
      headerStyle: { backgroundColor: '#fff', elevation: 0, shadowOpacity: 0 },
      headerTintColor: '#000',
      headerRight: () => (
        <View style={{ flexDirection: 'row', marginRight: 15, alignItems: 'center' }}>
          <TouchableOpacity onPress={() => navigation.navigate('Notification')}>
            <Ionicons name="notifications-outline" size={24} color="#000" />
            {count > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{count}</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Connexion')} style={{ marginLeft: 15 }}>
            <Ionicons name="log-out-outline" size={22} color="#000" />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, user, count]);

  return (
    <View style={styles.bottomMenu}>
      <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Accueil')}>
        <Ionicons name="home" size={24} color="#000000" />
        <Text style={styles.menuLabel}>Accueil</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('ListeAnnonces')}>
        <Ionicons name="briefcase-outline" size={24} color="#000" />
        <Text style={styles.menuLabel}>Les annonces</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.mainActionButton}
        onPress={() => navigation.navigate('AjouterAnnonce', { user })}
      >
        <Ionicons name="add" size={36} color="#fff" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('AnnonceUtilisateur')}>
        <Ionicons name="document-text-outline" size={24} color="#000" />
        <Text style={styles.menuLabel}>Mes annonces</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Parametre')}>
        <Ionicons name="settings-outline" size={24} color="#000000" />
        <Text style={styles.menuLabel}>Paramètres</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
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
    bottom: 0,
    width: '100%',
  },
  menuItem: {
    alignItems: 'center',
    flex: 1,
    paddingVertical: 8,
  },
  menuLabel: {
    fontSize: 9,
    color: '#000',
    marginTop: 4,
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
  badge: {
    position: 'absolute',
    right: -6,
    top: -6,
    backgroundColor: 'red',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
});