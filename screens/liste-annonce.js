import React, { useState, useEffect } from 'react';
import {View,Text,FlatList,Image,StyleSheet,TouchableOpacity,ActivityIndicator} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ListeAnnonce({ navigation }) {
  const [liste, setListe] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    getAnnonce();
  }, []);

  const getAnnonce = async () => {
    try {
      const response = await fetch('https://epencia.net/app/souangah/liste-annonce.php');
      const result = await response.json();
      setListe(result);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    getAnnonce();
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Image
        source={{ uri: `https://epencia.net/app/souangah/get.image.php?id=${item.id_annonce}` }}
        style={styles.image}
      />

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>{item.titre}</Text>
        <View style={styles.priceContainer}>
          {item.prix_promo ? (
            <>
              <Text style={styles.prixOriginal}>{item.prix_normal} FCFA</Text>
              <Text style={styles.prixPromo}>{item.prix_promo} FCFA</Text>
            </>
          ) : (
            <Text style={styles.prixNormal}>{item.prix_normal} FCFA</Text>
          )}
        </View>

        <View style={styles.footer}>
          <Text style={styles.date}>
            {item.date_annonce || item.date} à {item.heure || item.heure}
          </Text>

          {/* ➕ Bouton "Voir détail" */}
          <TouchableOpacity
            style={styles.detailButton}
            onPress={() => navigation.navigate('DetailAnnonce', { annonce: item })}
          >
            <Text style={styles.detailText}>Voir détail</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <FlatList
      data={liste}
      renderItem={renderItem}
      keyExtractor={(item) => item.id_annonce}
      contentContainerStyle={styles.container}
      refreshing={refreshing}
      onRefresh={handleRefresh}
      ListEmptyComponent={
        <View style={styles.empty}>
          <Ionicons name="alert-circle-outline" size={50} color="#ccc" />
          <Text style={styles.emptyText}>Aucune annonce disponible</Text>
        </View>
      }
    />
  );
}
const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 15,
    overflow: 'hidden',
    elevation: 2,
  },
  image: {
    width: '100%',
    height: 50,
  },
  content: {
    padding: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  prixOriginal: {
    fontSize: 14,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  prixPromo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ff4757',
  },
  prixNormal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    fontSize: 12,
    color: '#666',
  },
  detailButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  detailText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 10,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 50,
  },
  emptyText: {
    marginTop: 10,
    color: '#999',
    fontSize: 16,
  },
});
