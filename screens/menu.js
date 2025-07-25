import React, { useLayoutEffect, useContext, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GlobalContext } from '../config/GlobalUser';
import NotificationBadge from './notification-non-lu';

const { width } = Dimensions.get('window');

export default function Menu({ navigation }) {
  const [user] = useContext(GlobalContext);
  const [showSolde, setShowSolde] = useState(true);

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
        <View style={{ flexDirection: 'row', marginRight: 15, alignItems: 'center' }}>
          <NotificationBadge
            userId={user?.code_utilisateur}
            onPress={() => navigation.navigate('Notification')}
          />
          <TouchableOpacity onPress={() => navigation.navigate('Connexion')} style={{ marginLeft: 15 }}>
            <Ionicons name="log-out-outline" size={22} color="#000000" />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, user]);

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => setShowSolde(!showSolde)} activeOpacity={0.8}>
        <View style={styles.soldeCard}>
          <View style={styles.cardHeaderOnly}>
            <Text style={styles.cardLabel}>Mon solde</Text>
            <Text style={styles.cardSolde}>
              {showSolde ? `${user?.solde || 0} FCFA` : '*********'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={[styles.button, styles.retrait]} onPress={() => navigation.navigate('Retrait')}>
          <Ionicons name="cash-outline" size={18} color="#fff" style={{ marginRight: 6 }} />
          <Text style={styles.buttonText}>Retrait</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.recharge]} onPress={() => navigation.navigate('Rechargement')}>
          <Ionicons name="wallet-outline" size={18} color="#fff" style={{ marginRight: 6 }} />
          <Text style={styles.buttonText}>Recharger</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.transactionContainer}>
        <Text style={styles.transactionTitle}>Dernières transactions</Text>
        {[
          { id: 1, type: 'Recharge', montant: 5000, date: '2025-07-14' },
          { id: 2, type: 'Retrait', montant: 2000, date: '2025-07-13' },
          { id: 3, type: 'Recharge', montant: 3000, date: '2025-07-12' },
        ].map((tx) => (
          <View key={tx.id} style={styles.transactionItem}>
            <Ionicons
              name={tx.type === 'Recharge' ? 'arrow-down-circle-outline' : 'arrow-up-circle-outline'}
              size={20}
              color={tx.type === 'Recharge' ? '#4CAF50' : '#f44336'}
              style={{ marginRight: 10 }}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.txLabel}>{tx.type}</Text>
              <Text style={styles.txDate}>{tx.date}</Text>
            </View>
            <Text style={[styles.txAmount, { color: tx.type === 'Recharge' ? '#4CAF50' : '#f44336' }]}>
              {tx.type === 'Recharge' ? '+' : '-'} {tx.montant} FCFA
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.bottomMenu}>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Plus')}>
          <Ionicons name="home" size={20} color="#000000" />
          <Text style={styles.menuLabel}>Accueil</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('ListeAnnonces')}>
          <Ionicons name="briefcase-outline" size={20} color="#000" />
          <Text style={styles.menuLabel}>les Annonces</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.mainActionButton} onPress={() => navigation.navigate('AjouterAnnonce', { user })}>
          <Ionicons name="add" size={35} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('AnnonceUtilisateur')}>
          <Ionicons name="briefcase-outline" size={20} color="#000" />
          <Text style={styles.menuLabel}>Mes Annonces</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Parametre')}>
          <Ionicons name="settings-outline" size={20} color="#000000" />
          <Text style={styles.menuLabel}>Paramètre</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f0f0' },
  soldeCard: {
    backgroundColor: '#02080cff',
    width: width * 0.9,
    alignSelf: 'center',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  cardHeaderOnly: { alignItems: 'center' },
  cardLabel: { color: '#fff', fontSize: 18, fontWeight: '300' },
  cardSolde: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginTop: 10 },

  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    paddingHorizontal: 20,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    elevation: 2,
    marginHorizontal: 5,
  },
  retrait: { backgroundColor: '#0c0302ff' },
  recharge: { backgroundColor: '#070d12ff' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

  transactionContainer: { marginTop: 30, paddingHorizontal: 20 },
  transactionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 12, color: '#000' },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 2,
  },
  txLabel: { fontSize: 14, fontWeight: '500', color: '#000' },
  txDate: { fontSize: 12, color: '#666' },
  txAmount: { fontSize: 14, fontWeight: 'bold' },

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
    fontSize: 9,
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
});
