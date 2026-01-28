import React, { useContext, useEffect, useState, useRef } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Modal, Linking, Alert, Dimensions, StatusBar, TextInput, FlatList } from 'react-native';
import { GlobalContext } from '../config/GlobalUser';
import { Video } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const Menu = ({navigation}) => {
  const [liste, setListe] = useState([]);
  const [filteredListe, setFilteredListe] = useState([]);
  const [user] = useContext(GlobalContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState({});
  const [fullScreenMedia, setFullScreenMedia] = useState(null);
  const [playingVideos, setPlayingVideos] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const videoRefs = useRef({});
  const [typeannonce, setTypeAnnonce] = useState('');
  const [selectedType, setSelectedType] = useState(null);

  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

  // liste des type annonces

  useEffect(() => {
    getTypeAnnonce();
  },[]);

  const getTypeAnnonce = async () => {
    const response = await fetch('https://epencia.net/app/souangah/annonce/type-annonce.php');
    const result = await response.json();
    setTypeAnnonce(result);
    
  }

  useEffect(() => {
    getAnnonce();
  }, []);

  // Filtrer les annonces quand la recherche change
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredListe(liste);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = liste.filter(item => 
        (item.titre && item.titre.toLowerCase().includes(query)) ||
        (item.description && item.description.toLowerCase().includes(query)) ||
        (item.utilisateur?.ville && item.utilisateur.ville.toLowerCase().includes(query))
      );
      setFilteredListe(filtered);
    }
  }, [searchQuery, liste]);

  const getAnnonce = async () => {
   
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('https://epencia.net/app/souangah/annonce/liste-annonce.php');
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      const result = await response.json();
      
      // L'API retourne directement un tableau d'annonces
      if (Array.isArray(result)) {
        setListe(result);
        setFilteredListe(result);
        console.log('Annonces chargées:', result.length);
      } else {
        console.warn('Structure de données inattendue:', result);
        setListe([]);
        setFilteredListe([]);
        setError('Format de données non reconnu');
      }
    } catch (error) {
      console.error('Erreur Top Annonces:', error);
      setError('Erreur de chargement des annonces');
      setListe([]);
      setFilteredListe([]);
    } finally {
      setLoading(false);
    }
  };

  const chunkArray = (array, chunkSize) => {
    if (!Array.isArray(array)) return [];
    const chunks = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  };

  const annonceChunks = chunkArray(filteredListe, 2);

  const handleMediaPress = (annonceId, index) => {
    setSelectedMediaIndex(prev => ({
      ...prev,
      [annonceId]: index
    }));
  };

  const openFullScreen = async (item, mediaIndex = 0) => {
    await stopAllVideos();
    
    setFullScreenMedia({ item, mediaIndex });
    
    if (item.medias && item.medias[mediaIndex]?.type_media === 'video') {
      setPlayingVideos(prev => ({
        ...prev,
        [`fullscreen_${item.id_annonce}`]: true
      }));
    }
  };

  const closeFullScreen = async () => {
    if (fullScreenMedia && fullScreenMedia.item.medias) {
      const currentMedia = fullScreenMedia.item.medias[fullScreenMedia.mediaIndex];
      if (currentMedia.type_media === 'video' && videoRefs.current[`fullscreen_${fullScreenMedia.item.id_annonce}`]) {
        await videoRefs.current[`fullscreen_${fullScreenMedia.item.id_annonce}`].stopAsync();
      }
    }
    
    setPlayingVideos(prev => {
      const newState = { ...prev };
      delete newState[`fullscreen_${fullScreenMedia?.item.id_annonce}`];
      return newState;
    });
    
    setFullScreenMedia(null);
  };

  const navigateFullScreenMedia = async (direction) => {
    if (!fullScreenMedia) return;

    const { item, mediaIndex } = fullScreenMedia;
    const medias = item.medias || [];

    if (medias.length <= 1) return;

    let newIndex;
    if (direction === 'next') {
      newIndex = (mediaIndex + 1) % medias.length;
    } else {
      newIndex = (mediaIndex - 1 + medias.length) % medias.length;
    }

    const currentMedia = medias[mediaIndex];
    if (currentMedia.type_media === 'video' && videoRefs.current[`fullscreen_${item.id_annonce}`]) {
      await videoRefs.current[`fullscreen_${item.id_annonce}`].stopAsync();
    }

    setFullScreenMedia({ item, mediaIndex: newIndex });
    
    setPlayingVideos(prev => {
      const newState = { ...prev };
      delete newState[`fullscreen_${item.id_annonce}`];
      if (medias[newIndex].type_media === 'video') {
        newState[`fullscreen_${item.id_annonce}`] = true;
      }
      return newState;
    });
  };

  const stopAllVideos = async () => {
    const stopPromises = Object.keys(videoRefs.current).map(async (key) => {
      if (videoRefs.current[key] && typeof videoRefs.current[key].stopAsync === 'function') {
        try {
          await videoRefs.current[key].stopAsync();
        } catch (error) {
          console.log('Erreur lors de l\'arrêt de la vidéo:', error);
        }
      }
    });
    
    await Promise.all(stopPromises);
    setPlayingVideos({});
  };

  const handleVideoPlay = (annonceId) => {
    setPlayingVideos(prev => ({
      ...prev,
      [annonceId]: true
    }));
  };

  const handleVideoPause = (annonceId) => {
    setPlayingVideos(prev => {
      const newState = { ...prev };
      delete newState[annonceId];
      return newState;
    });
  };

  const cleanBase64Data = (base64String) => {
    if (!base64String) return null;
    
    // Vérifier si le base64 est déjà préfixé
    if (base64String.startsWith('data:')) {
      return base64String;
    }
    
    // Si ce n'est pas préfixé, c'est probablement déjà un base64 pur
    return base64String.trim();
  };

  // Fonction pour formater le prix
  const formatPrice = (price) => {
    if (!price || price === '0') return 'Prix à discuter';
    const numericPrice = parseInt(price);
    if (isNaN(numericPrice)) return 'Prix à discuter';
    return `${numericPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} FCFA`;
  };

  // Fonction pour vérifier si une annonce a une promotion
  const hasPromotion = (item) => {
    return item.prix_promo && item.prix_promo !== item.prix_normal && item.prix_promo !== '0' && item.prix_promo !== '0';
  };

  const renderMedia = (item) => {
    const currentIndex = selectedMediaIndex[item.id_annonce] || 0;

    if (item.medias && item.medias.length > 0) {
      const currentMedia = item.medias[currentIndex];
      
      const cleanedBase64 = cleanBase64Data(currentMedia.fichier64);
      
      if (!cleanedBase64) {
        return renderNoMedia('Données base64 invalides');
      }

      let mediaUri = cleanedBase64;
      // Si le base64 n'a pas de préfixe data:, l'ajouter
      if (!cleanedBase64.startsWith('data:')) {
        const mimeType = currentMedia.type_fichier || 
                        (currentMedia.type_media === 'video' ? 'video/mp4' : 'image/jpeg');
        mediaUri = `data:${mimeType};base64,${cleanedBase64}`;
      }

      const isVideo = currentMedia.type_media === 'video';
      const isPlaying = playingVideos[item.id_annonce];

      return (
        <View style={styles.mediaContainer}>
          <TouchableOpacity 
            style={styles.mediaTouchable}
            onPress={(e) => {
              e.stopPropagation(); // Empêche la propagation au parent
              openFullScreen(item, currentIndex);
            }}
            activeOpacity={0.9}
          >
            {!isVideo ? (
              <Image 
                source={{ uri: mediaUri }}
                style={styles.announcementImage}
                resizeMode="cover"
                onError={(e) => {
                  console.log('Media image failed to load:', e.nativeEvent.error);
                  console.log('URI essayée:', mediaUri.substring(0, 100) + '...');
                }}
              />
            ) : (
              <Video
                ref={ref => videoRefs.current[item.id_annonce] = ref}
                source={{ uri: mediaUri }}
                style={styles.announcementImage}
                useNativeControls
                resizeMode="cover"
                shouldPlay={false}
                isLooping={false}
                onError={(e) => {
                  console.log('Video failed to load:', e);
                  console.log('URI essayée:', mediaUri.substring(0, 100) + '...');
                }}
                onLoad={() => console.log('Video loaded successfully')}
                onPlaybackStatusUpdate={(status) => {
                  if (status.isPlaying) {
                    handleVideoPlay(item.id_annonce);
                  } else if (status.didJustFinish || status.isLoaded) {
                    handleVideoPause(item.id_annonce);
                  }
                }}
              />
            )}

            {/* Overlay gradient */}
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.3)']}
              style={styles.imageGradient}
            />

            {isVideo && (
              <View style={styles.videoIndicator}>
                <Ionicons name="play-circle" size={12} color="white" />
                <Text style={styles.videoIndicatorText}>VIDÉO</Text>
              </View>
            )}

            {isVideo && !isPlaying && (
              <View style={styles.videoOverlay}>
                <Ionicons name="play" size={20} color="white" />
              </View>
            )}

            {/* Promotion badge */}
            {hasPromotion(item) && (
              <View style={styles.promoBadge}>
                <Text style={styles.promoBadgeText}>PROMO</Text>
              </View>
            )}
          </TouchableOpacity>

          {item.medias.length > 1 && (
            <View style={styles.mediaIndicator}>
              <Text style={styles.mediaIndicatorText}>
                {currentIndex + 1} / {item.medias.length}
              </Text>
            </View>
          )}

          {item.medias.length > 1 && (
            <>
              {currentIndex > 0 && (
                <TouchableOpacity 
                  style={[styles.navButton, styles.prevButton]}
                  onPress={(e) => {
                    e.stopPropagation(); // Empêche la propagation au parent
                    handleMediaPress(item.id_annonce, currentIndex - 1);
                  }}
                >
                  <Ionicons name="chevron-back" size={16} color="white" />
                </TouchableOpacity>
              )}
              {currentIndex < item.medias.length - 1 && (
                <TouchableOpacity 
                  style={[styles.navButton, styles.nextButton]}
                  onPress={(e) => {
                    e.stopPropagation(); // Empêche la propagation au parent
                    handleMediaPress(item.id_annonce, currentIndex + 1);
                  }}
                >
                  <Ionicons name="chevron-forward" size={16} color="white" />
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      );
    } 
    else if (item.photo64) {
      const cleanedBase64 = cleanBase64Data(item.photo64);
      
      if (!cleanedBase64) {
        return renderNoMedia('Données base64 invalides');
      }

      let imageUri = cleanedBase64;
      // Si le base64 n'a pas de préfixe data:, l'ajouter
      if (!cleanedBase64.startsWith('data:')) {
        const mimeType = item.type || 'image/jpeg';
        imageUri = `data:${mimeType};base64,${cleanedBase64}`;
      }

      return (
        <TouchableOpacity 
          onPress={(e) => {
            e.stopPropagation(); // Empêche la propagation au parent
            openFullScreen(item);
          }}
          activeOpacity={0.9}
        >
          <Image
            source={{ uri: imageUri }}
            style={styles.announcementImage}
            resizeMode="cover"
            onError={(e) => {
              console.log('Single image failed to load:', e.nativeEvent.error);
              console.log('URI essayée:', imageUri.substring(0, 100) + '...');
            }}
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.3)']}
            style={styles.imageGradient}
          />
        </TouchableOpacity>
      );
    }
    else {
      return renderNoMedia('Aucune image');
    }
  };

  const renderFullScreenMedia = () => {
    if (!fullScreenMedia) return null;

    const { item, mediaIndex } = fullScreenMedia;
    const medias = item.medias || [];
    const currentMedia = medias[mediaIndex] || { type_media: 'image', fichier64: item.photo64, type_fichier: item.type };
    
    const cleanedBase64 = cleanBase64Data(currentMedia.fichier64);
    if (!cleanedBase64) return null;

    let mediaUri = cleanedBase64;
    if (!cleanedBase64.startsWith('data:')) {
      const mimeType = currentMedia.type_fichier || 
                      (currentMedia.type_media === 'video' ? 'video/mp4' : 'image/jpeg');
      mediaUri = `data:${mimeType};base64,${cleanedBase64}`;
    }
    
    const isVideo = currentMedia.type_media === 'video';

    return (
      <Modal
        visible={!!fullScreenMedia}
        animationType="fade"
        statusBarTranslucent={true}
      >
        <View style={styles.fullScreenContainer}>
          <StatusBar hidden={true} />
          
          <TouchableOpacity 
            style={styles.closeFullScreenButton}
            onPress={closeFullScreen}
          >
            <Ionicons name="close" size={30} color="white" />
          </TouchableOpacity>

          <View style={styles.fullScreenMediaContainer}>
            {!isVideo ? (
              <Image 
                source={{ uri: mediaUri }}
                style={styles.fullScreenImage}
                resizeMode="contain"
              />
            ) : (
              <Video
                ref={ref => videoRefs.current[`fullscreen_${item.id_annonce}`] = ref}
                source={{ uri: mediaUri }}
                style={styles.fullScreenVideo}
                useNativeControls
                resizeMode="contain"
                shouldPlay={true}
                isLooping={true}
                onError={(e) => console.log('Fullscreen video failed to load:', e)}
              />
            )}
          </View>

          {medias.length > 1 && (
            <>
              <View style={styles.fullScreenIndicator}>
                <Text style={styles.fullScreenIndicatorText}>
                  {mediaIndex + 1} / {medias.length}
                </Text>
              </View>

              <TouchableOpacity 
                style={[styles.fullScreenNavButton, styles.fullScreenPrevButton]}
                onPress={() => navigateFullScreenMedia('prev')}
              >
                <Ionicons name="chevron-back" size={30} color="white" />
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.fullScreenNavButton, styles.fullScreenNextButton]}
                onPress={() => navigateFullScreenMedia('next')}
              >
                <Ionicons name="chevron-forward" size={30} color="white" />
              </TouchableOpacity>
            </>
          )}

          {isVideo && (
            <View style={styles.fullScreenVideoIndicator}>
              <Text style={styles.fullScreenVideoIndicatorText}> VIDÉO</Text>
            </View>
          )}
        </View>
      </Modal>
    );
  };

  const renderNoMedia = (message) => {
    return (
      <View style={[styles.announcementImage, styles.noMediaContainer]}>
        <Ionicons name="image-outline" size={24} color="#999" />
        <Text style={styles.noMediaTextSmall}>{message}</Text>
      </View>
    );
  };

  // Composant pour afficher les prix correctement
  const PriceDisplay = ({ item }) => {
    const hasPromo = hasPromotion(item);

    return (
      <View style={styles.priceContainer}>
        {hasPromo ? (
          <>
            <Text style={styles.announcementPrice}>{formatPrice(item.prix_promo)}</Text>
            <Text style={styles.announcementPromoPrice}>{formatPrice(item.prix_normal)}</Text>
          </>
        ) : (
          <Text style={styles.announcementPrice}>{formatPrice(item.prix_normal)}</Text>
        )}
      </View>
    );
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  // Fonction pour naviguer vers l'écran de détails
  const navigateToDetail = (item) => {
    // Naviguer vers l'écran 'AnnonceDetail' avec les données de l'annonce
    navigation.navigate('AnnonceDetail', { annonce: item });
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Barre de recherche */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher des annonces..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>

        {/* Résultats de recherche */}
        {searchQuery.trim() !== '' && (
          <View style={styles.searchResultsHeader}>
            <Text style={styles.searchResultsText}>
              Résultats pour "{searchQuery}" : {filteredListe.length} annonce(s) trouvée(s)
            </Text>
          </View>
        )}
        
        {/* la liste des type annonce*/}

        <View style={styles.typecontainer}>
          <Text style={styles.sectionTitle}>Types d'annonces</Text>
          <FlatList
          data={typeannonce}
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          keyExtractor = {(item) => item.code_type.toString()}
          renderItem = {({item}) => (
          <TouchableOpacity
            style={[
              styles.typebox,
              selectedType === item.code_type && styles.typeboxSelected
            ]}
            onPress={() => {
              if (selectedType === item.code_type) {
                setSelectedType(null);
                setFilteredListe(liste);
              } else {
                setSelectedType(item.code_type);
                const filtered = liste.filter(
                  annonce => annonce.code_type === item.code_type
                );
                setFilteredListe(filtered);
              }
            }}
             >
            <Text
              style={[
                styles.typeText,
                selectedType === item.code_type && styles.typeTextSelected
              ]}
            >
              {item.libelle_annonce}
            </Text>
          </TouchableOpacity>

          )}
          />
        </View>

        {/* Section principale des annonces */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Text style={styles.sectionTitle}>Annonces</Text>
            </View>
            {!searchQuery && (
              <TouchableOpacity style={styles.viewAllButton} onPress={() => navigation.navigate('ListeAnnonces')}>
                <Text style={styles.viewAll}>Toutes</Text>
                <Ionicons name="chevron-forward" size={14} color="#000000" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#FF6B00" />
            <Text style={styles.loadingText}>Chargement...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={40} color="#FF6B00" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={getAnnonce}>
              <Text style={styles.retryText}>Réessayer</Text>
            </TouchableOpacity>
          </View>
        ) : !filteredListe || filteredListe.length === 0 ? (
          <View style={styles.emptyContainer}>
            {searchQuery.trim() !== '' ? (
              <>
                <Ionicons name="search-outline" size={50} color="#ccc" />
                <Text style={styles.emptyText}>Aucun résultat trouvé</Text>
                <Text style={styles.emptySubtext}>Essayez d'autres mots-clés</Text>
              </>
            ) : (
              <>
                <Ionicons name="car-outline" size={50} color="#ccc" />
                <Text style={styles.emptyText}>Aucune annonce disponible</Text>
              </>
            )}
          </View>
        ) : (
          <View style={styles.annoncesGrid}>
            {annonceChunks.map((chunk, chunkIndex) => (
              <View key={chunkIndex} style={styles.annonceRow}>
                {chunk.map((item, index) => (
                  <TouchableOpacity 
                    key={item.id_annonce || `${chunkIndex}-${index}`} 
                    style={styles.annonceCard}
                    onPress={() => navigateToDetail(item)}
                    activeOpacity={0.9}
                  >
                    {renderMedia(item)}
                    
                    <View style={styles.annonceContent}>
                      <Text style={styles.annonceTitle} numberOfLines={2}>
                        {item.titre}
                      </Text>
                      <Text style={styles.annonceDescription} numberOfLines={2}>
                        {item.description}
                      </Text>
                      
                      <PriceDisplay item={item} />
                      
                      <View style={styles.locationContainer}>
                        <Ionicons name="location-outline" size={10} color="#666" />
                        <Text style={styles.annonceLocation}>{item.utilisateur?.ville || 'Aucune'}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
                {chunk.length === 1 && <View style={styles.emptySpace} />}
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Full Screen Media Modal */}
      {renderFullScreenMedia()}
    </View>
  );
};

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  // Barre de recherche
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 12,
    marginVertical: 15,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    paddingVertical: 2,
  },
  clearButton: {
    padding: 5,
  },
  searchResultsHeader: {
    paddingHorizontal: 12,
    marginBottom: 15,
  },
  searchResultsText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  // Sections
  section: {
    paddingHorizontal: 12,
    marginVertical: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 6,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  viewAll: {
    color: '#000000',
    fontWeight: '500',
    fontSize: 12,
    marginRight: 3,
  },
  // Loading et erreurs
  loadingContainer: {
    alignItems: 'center',
    padding: 30,
    marginVertical: 15,
  },
  loadingText: {
    marginTop: 8,
    color: '#666',
    fontSize: 14,
  },
  errorContainer: {
    alignItems: 'center',
    padding: 30,
    marginVertical: 15,
    backgroundColor: '#fff',
    marginHorizontal: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  errorText: {
    color: '#FF0000',
    fontSize: 14,
    textAlign: 'center',
    marginVertical: 8,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 8,
  },
  retryText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 30,
    marginVertical: 15,
    backgroundColor: '#fff',
    marginHorizontal: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '500',
  },
  emptySubtext: {
    color: '#999',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 4,
  },
  // Grille d'annonces
  annoncesGrid: {
    paddingHorizontal: 8,
    marginBottom: 50,
  },
  annonceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  annonceCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 1,
    overflow: 'hidden',
    marginBottom: 8,
  },
  emptySpace: {
    width: '48%',
  },
  annonceContent: {
    padding: 8,
  },
  annonceTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  annonceDescription: {
    fontSize: 11,
    color: '#666',
    marginBottom: 4,
    lineHeight: 14,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 6,
    flexWrap: 'wrap',
  },
  announcementPrice: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#FF6B00',
    marginRight: 6,
  },
  announcementPromoPrice: {
    fontSize: 10,
    color: '#666',
    marginBottom: 3,
    textDecorationLine: 'line-through',
  },
  annonceLocation: {
    fontSize: 10,
    color: '#666',
    marginLeft: 3,
  },
  // Styles médias
  mediaContainer: {
    position: 'relative',
  },
  mediaTouchable: {
    flex: 1,
  },
  announcementImage: {
    width: '100%',
    height: 90,
  },
  imageGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 40,
  },
  videoIndicator: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  videoIndicatorText: {
    color: 'white',
    fontSize: 8,
    fontWeight: 'bold',
    marginLeft: 3,
  },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  mediaIndicator: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
  },
  mediaIndicatorText: {
    color: 'white',
    fontSize: 8,
    fontWeight: 'bold',
  },
  navButton: {
    position: 'absolute',
    top: '50%',
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 25,
    height: 25,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -13,
  },
  prevButton: {
    left: 6,
  },
  nextButton: {
    right: 6,
  },
  promoBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: '#FF4444',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  promoBadgeText: {
    color: 'white',
    fontSize: 8,
    fontWeight: 'bold',
  },
  noMediaContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e9ecef',
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 12,
  },
  noMediaTextSmall: {
    fontSize: 8,
    color: '#666',
    textAlign: 'center',
    marginTop: 3,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  // Styles plein écran
  fullScreenContainer: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeFullScreenButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1000,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 5,
  },
  fullScreenMediaContainer: {
    width: screenWidth,
    height: screenHeight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: screenWidth,
    height: screenHeight,
  },
  fullScreenVideo: {
    width: screenWidth,
    height: screenHeight,
  },
  fullScreenIndicator: {
    position: 'absolute',
    top: 40,
    left: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  fullScreenIndicatorText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  fullScreenNavButton: {
    position: 'absolute',
    top: '50%',
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -25,
  },
  fullScreenPrevButton: {
    left: 20,
  },
  fullScreenNextButton: {
    right: 20,
  },
  fullScreenVideoIndicator: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  fullScreenVideoIndicatorText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  // Styles type annonce
  sectionTitle:{
    marginBottom: 12,
    fontSize: 18,
  },
  typecontainer: {
    marginVertical: 10,
    marginHorizontal: 8,
  },
  typebox: {
    backgroundColor: '#f8f9fa',
    padding: 10,
    marginHorizontal: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
    elevation: 2,
  },
  typeText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#000000',
  },
  typeboxSelected: {
    backgroundColor: '#FF6B00',
    borderColor: '#FF6B00',
  },
  typeTextSelected: {
    color: '#ffffff',
  },
});

export default Menu;