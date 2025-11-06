import React, { useState, useEffect, useContext } from 'react';
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity, ActivityIndicator, Linking, TextInput, ScrollView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Video } from 'expo-av';
import { GlobalContext } from '../config/GlobalUser';

export default function AnnonceFavoris({ navigation }) {
  const [liste, setListe] = useState([]);
  const [filteredListe, setFilteredListe] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [rechercher, setRechercher] = useState('');
  const [user] = useContext(GlobalContext);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState({});

  useEffect(() => {
    getAnnonce();
  }, []);

  useEffect(() => {
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
      const response = await fetch('https://epencia.net/app/souangah/annonce/liste-annonce.php');
      const result = await response.json();
      setListe(result);
      setFilteredListe(result);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    getAnnonce();
  };

  const handleMediaPress = (annonceId, index) => {
    setSelectedMediaIndex(prev => ({
      ...prev,
      [annonceId]: index
    }));
  };

  const renderMedia = (item) => {
    if (!item.medias || item.medias.length === 0) {
      return (
        <View style={styles.mediaContainer}>
          <Image 
            source={{ uri: `data:${item.type};base64,${item.photo64}` }}
            style={styles.singleMedia}
            resizeMode="cover"
          />
        </View>
      );
    }

    const currentIndex = selectedMediaIndex[item.id_annonce] || 0;
    const currentMedia = item.medias[currentIndex];

    return (
      <View style={styles.mediaContainer}>
        {/* Media principal */}
        {currentMedia.type_media === 'image' ? (
          <Image 
            source={{ uri: `data:${currentMedia.type_fichier};base64,${currentMedia.fichier64}` }}
            style={styles.singleMedia}
            resizeMode="cover"
          />
        ) : (
          <Video
            source={{ uri: `data:${currentMedia.type_fichier};base64,${currentMedia.fichier64}` }}
            style={styles.singleMedia}
            useNativeControls
            resizeMode="cover"
            shouldPlay={false}
          />
        )}

        {/* Indicateur de position si plusieurs médias */}
        {item.medias.length > 1 && (
          <View style={styles.mediaIndicator}>
            <Text style={styles.mediaIndicatorText}>
              {currentIndex + 1} / {item.medias.length}
            </Text>
          </View>
        )}

        {/* Boutons de navigation si plusieurs médias */}
        {item.medias.length > 1 && (
          <>
            {currentIndex > 0 && (
              <TouchableOpacity 
                style={[styles.navButton, styles.prevButton]}
                onPress={() => handleMediaPress(item.id_annonce, currentIndex - 1)}
              >
                <Ionicons name="chevron-back" size={24} color="white" />
              </TouchableOpacity>
            )}
            {currentIndex < item.medias.length - 1 && (
              <TouchableOpacity 
                style={[styles.navButton, styles.nextButton]}
                onPress={() => handleMediaPress(item.id_annonce, currentIndex + 1)}
              >
                <Ionicons name="chevron-forward" size={24} color="white" />
              </TouchableOpacity>
            )}
          </>
        )}

        {/* Miniatures des médias */}
        {item.medias.length > 1 && (
          <ScrollView 
            horizontal 
            style={styles.thumbnailsContainer}
            showsHorizontalScrollIndicator={false}
          >
            {item.medias.map((media, index) => (
              <TouchableOpacity
                key={media.id_media}
                style={[
                  styles.thumbnail,
                  index === currentIndex && styles.thumbnailActive
                ]}
                onPress={() => handleMediaPress(item.id_annonce, index)}
              >
                {media.type_media === 'image' ? (
                  <Image 
                    source={{ uri: `data:${media.type_fichier};base64,${media.fichier64}` }}
                    style={styles.thumbnailImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.thumbnailVideo}>
                    <Ionicons name="videocam" size={16} color="white" />
                    <Text style={styles.thumbnailVideoText}>Vidéo</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>
    );
  };

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
        <View style={styles.headerRight}>
          <Text style={styles.date}>{item.date} à {item.heure}</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Details d'annonce", { annonceId: item.id_annonce })}>
            <Ionicons name="eye" size={20} color="#ff4757" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Ligne de séparation */}
      <View style={styles.separator} />

      {/* Titre de l'annonce */}
      <View style={styles.titleContainer}>
        <Text style={styles.titleText}>{item.titre}</Text>
      </View>

      {/* Ligne de séparation */}
      <View style={styles.separator} />

      {/* Tous les médias de l'annonce */}
      {renderMedia(item)}

      <View style={styles.content}>
        {/* Prix */}
        <View style={styles.priceContainer}>
          <Text style={styles.prixNormal}>{item.prix_normal} FCFA</Text>
          <Text style={styles.prixPromo}>{item.prix_promo} FCFA</Text>
        </View>

        {/* Description */}
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

          {/* Nombre de médias */}
          {item.medias && item.medias.length > 0 && (
            <View style={styles.statsItem}>
              <Ionicons name="images" size={16} color="#666" />
              <Text style={styles.statsText}>{item.medias.length} médias</Text>
            </View>
          )}
        </View>

        {/* Boutons d'action */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#3378dfff' }]}
            onPress={() => Linking.openURL(`tel:${item.telephone}`)}
          >
            <Ionicons name="call-outline" size={20} color="white" />
            <Text style={styles.actionText}>Appeler</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#11ae21ff' }]}
            onPress={() => Linking.openURL(`https://wa.me/${item.telephone}`)}
          >
            <Ionicons name="logo-whatsapp" size={20} color="white" />
            <Text style={styles.actionText}>WhatsApp</Text>
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

const { width } = Dimensions.get('window');

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
    alignItems: 'flex-end',
  },
  date: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  separator: {
    height: 1,
    backgroundColor: '#eaeaea',
  },
  titleContainer: {
    padding: 15,
    backgroundColor: '#f8f9fa',
  },
  titleText: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  mediaContainer: {
    position: 'relative',
  },
  singleMedia: {
    width: '100%',
    height: 300,
    backgroundColor: '#f0f0f0',
  },
  mediaIndicator: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  mediaIndicatorText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  navButton: {
    position: 'absolute',
    top: '50%',
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -20,
  },
  prevButton: {
    left: 10,
  },
  nextButton: {
    right: 10,
  },
  thumbnailsContainer: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
    height: 60,
  },
  thumbnail: {
    width: 50,
    height: 50,
    marginRight: 5,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  thumbnailActive: {
    borderColor: '#4CAF50',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  thumbnailVideo: {
    width: '100%',
    height: '100%',
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnailVideoText: {
    color: 'white',
    fontSize: 8,
    marginTop: 2,
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
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 120,
    justifyContent: 'center',
  },
  actionText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 14,
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