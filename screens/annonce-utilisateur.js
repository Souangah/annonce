import React, { useState, useEffect, useContext } from 'react';
import {View,Text,FlatList,Image,StyleSheet,TouchableOpacity,ActivityIndicator,Linking,TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GlobalContext } from '../config/GlobalUser';

export default function AnnonceUtilisateur({ navigation,item }) {
  const [liste, setListe] = useState([]);
  const [filteredListe, setFilteredListe] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [rechercher, setRechercher] = useState('');
  const [user] = useContext(GlobalContext);

  useEffect(() => {
    getAnnonce();
  }, []);

  useEffect(() => {
    // Filtrer les annonces quand la recherche change
    if (rechercher) {
      const filtered = liste.filter(item => 
        item.titre.toLowerCase().includes(rechercher.toLowerCase()) ||
        item.description.toLowerCase().includes(rechercher.toLowerCase())
      );
      setFilteredListe(filtered);
    } else {
      setFilteredListe(liste);
    }
  }, [rechercher, liste]);

  const getAnnonce = async () => {
  try {
    setRefreshing(true);
    const response = await fetch(`https://epencia.net/app/souangah/annonce/annonce-utilisateur.php?user_id=${user.user_id}`);
    const result = await response.json();
    if (result.status === 'success') {
      setListe(result.annonces);
      setFilteredListe(result.annonces);
    } else {
      setListe([]);
      setFilteredListe([]);
      console.log(result.message || "Aucune annonce.");
    }
  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
};


  const handleRefresh = () => {
    getAnnonce();
  }


  const renderItem = ({ item }) => (
    <View style={styles.card}>
      {/* En-tête de la carte */}
      <View style={styles.header}>
        <Image
          source={{ uri: `data:${item.type};base64,${item.photo64}` }}
          style={styles.avatar}
        />
        <View style={styles.headerText}>
          <Text style={styles.name}>{user?.nom_prenom || "Utilisateur"}</Text>
          <Text style={styles.sponsored}>Sponsorisé</Text>
        </View>
      </View>

      {/* Ligne de séparation */}
      <View style={styles.separator} />

      {/* Message de promotion */}
      <View style={styles.promotionContainer}>
        <View style={styles.headerRight}>
          <Text style={styles.date}>{item.date} à {item.heure}</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Details d'annonce", { annonceId: item.id_annonce })}>
            <Ionicons name="eye" size={20} color="#ff4757" />
          </TouchableOpacity>
        </View>
        <Text style={styles.promotionText}>
          {item.titre}
        </Text>
      </View>

      {/* Ligne de séparation */}
      <View style={styles.separator} />

      {/* Image principale */}
      <Image 
        source={{ uri: `data:${item.type};base64,${item.photo64}` }}
        style={styles.image}
        resizeMode="cover"
      />

      <View style={styles.content}>
        {/* Prix */}
        <View style={styles.priceContainer}>
          <Text style={styles.prixNormal}>{item.prix_normal} FCFA</Text>
          <Text style={styles.prixPromo}>{item.prix_promo} FCFA</Text>
        </View>

        {/* description */}
        <Text style={styles.description}>{item.description}</Text>

        {/* Informations de vue et audience */}
        <View style={styles.statsContainer}>
          <View style={styles.statsItem}>
            <Ionicons name="eye" size={16} color="#666" />
            <Text style={styles.statsText}>{item.vue} vues</Text>
          </View>
          
          <View style={styles.statsItem}>
            <Ionicons name="people-outline" size={16} color="#666" />
            <Text style={styles.statsText}>Audience: {item.audience}</Text>
          </View>
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
    <View style={styles.container}>
      {/* Champ de recherche */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher des annonces..."
          placeholderTextColor="#888"
          value={rechercher}
          onChangeText={setRechercher}
        />
        {rechercher ? (
          <TouchableOpacity onPress={() => setRechercher('')} style={styles.clearButton}>
            <Ionicons name="close-circle" size={20} color="#888" />
          </TouchableOpacity>
        ) : null}
      </View>

      <FlatList
        data={filteredListe}
        renderItem={renderItem}
        keyExtractor={(item) => item.id_annonce.toString()}
        contentContainerStyle={styles.listContainer}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="alert-circle-outline" size={50} color="#ccc" />
            <Text style={styles.emptyText}>
              {rechercher ? 
                "Aucune annonce trouvée pour votre recherche" : 
                "Aucune annonce disponible"
              }
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    margin: 15,
    marginBottom: 10,
    paddingHorizontal: 15,
    height: 50,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: '#333',
  },
  clearButton: {
    padding: 5,
  },
  listContainer: {
    paddingBottom: 20,
    paddingHorizontal: 10,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 20,
    overflow: 'hidden',
    elevation: 2,
    borderWidth: 1,
    borderColor: '#eaeaea',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    paddingBottom: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  headerText: {
    flex: 1,
  },
  name: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
  },
  sponsored: {
    color: '#888',
    fontSize: 12,
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  date: {
    fontSize: 12,
    color: '#666',
    marginRight: 10,
  },
  separator: {
    height: 1,
    backgroundColor: '#eaeaea',
  },
  promotionContainer: {
    padding: 5,
    backgroundColor: '#f8f9fa',
  },
  promotionText: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
  },
  image: {
    width: '100%',
    height: 300,
    backgroundColor: '#f0f0f0',
  },
  content: {
    padding: 15,
  },
  description: {
    fontSize: 14,
    color: '#444',
    marginVertical: 10,
    lineHeight: 20,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  prixNormal: {
    fontSize: 14,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  prixPromo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ff4757',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  statsItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 5,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },

  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 50,
    backgroundColor: '#f8f9fa',
  },
  emptyText: {
    marginTop: 15,
    color: '#999',
    fontSize: 16,
    textAlign: 'center',
  },
});