import React, {useEffect, useContext, useState, useRef} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
  Dimensions,
  StatusBar, screenWidth, screenHeight
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GlobalContext } from '../config/GlobalUser';
import { Video } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';

const ProfilUtilisateur = ({navigation}) => {
  const [user] = useContext(GlobalContext);
  const [liste, setListe] = useState([]);
  const [filteredListe, setFilteredListe] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('En vente');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAnnonce, setSelectedAnnonce] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [favorites, setFavorites] = useState({});
  const [selectedMediaIndex, setSelectedMediaIndex] = useState({});
  const [fullScreenMedia, setFullScreenMedia] = useState(null);
  const [playingVideos, setPlayingVideos] = useState({});
  const videoRefs = useRef({});

  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

  useEffect(() => {
    ProfilAnnonce();
    loadFavorites();
  }, []);

  const ProfilAnnonce = async () => {
    try {
      setLoading(true);
      const response = await fetch("https://epencia.net/app/souangah/annonce/liste-annonce.php");
      const result = await response.json();
      
      if (Array.isArray(result)) {
        setListe(result);
        setFilteredListe(result);
      } else if (result.status === 'success' && Array.isArray(result.annonces)) {
        setListe(result.annonces);
        setFilteredListe(result.annonces);
      } else {
        setListe([]);
        setFilteredListe([]);
      }
    } catch (error) {
      console.error('Erreur chargement annonces:', error);
      setListe([]);
      setFilteredListe([]);
    } finally {
      setLoading(false);
    }
  };

  // Gestion des favoris
  const loadFavorites = async () => {
    try {
      setFavorites({});
    } catch (error) {
      console.error('Erreur chargement favoris:', error);
    }
  };

  const toggleFavorite = (annonceId) => {
    const newFavorites = {...favorites};
    if (newFavorites[annonceId]) {
      delete newFavorites[annonceId];
      Alert.alert('Succès', 'Annonce retirée des favoris');
    } else {
      newFavorites[annonceId] = true;
      Alert.alert('Succès', 'Annonce ajoutée aux favoris');
    }
    setFavorites(newFavorites);
  };

  const isFavorite = (annonceId) => {
    return favorites[annonceId] || false;
  };

  // Fonctions pour les médias
  const handleMediaPress = (annonceId, index) => {
    setSelectedMediaIndex(prev => ({
      ...prev,
      [annonceId]: index
    }));
  };

  const cleanBase64Data = (base64String) => {
    if (!base64String) return null;
    return base64String
      .replace(/^data:image\/[a-zA-Z]+;base64,/, '')
      .replace(/^data:video\/[a-zA-Z]+;base64,/, '')
      .trim();
  };

  // Fonctions pour le plein écran
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

  const renderMedia = (item) => {
    const currentIndex = selectedMediaIndex[item.id_annonce] || 0;

    if (item.medias && item.medias.length > 0) {
      const currentMedia = item.medias[currentIndex];
      const cleanedBase64 = cleanBase64Data(currentMedia.fichier64);
      
      if (!cleanedBase64) {
        return renderNoMedia();
      }

      const mediaUri = `data:${currentMedia.type_fichier || 'image/jpeg'};base64,${cleanedBase64}`;
      const isVideo = currentMedia.type_media === 'video';
      const isPlaying = playingVideos[item.id_annonce];

      return (
        <View style={styles.mediaContainer}>
          <TouchableOpacity 
            style={styles.mediaTouchable}
            activeOpacity={0.9}
            onPress={() => openFullScreen(item, currentIndex)}
          >
            {!isVideo ? (
              <Image 
                source={{ uri: mediaUri }}
                style={styles.announcementImage}
                resizeMode="cover"
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
                onPlaybackStatusUpdate={(status) => {
                  if (status.isPlaying) {
                    handleVideoPlay(item.id_annonce);
                  } else if (status.didJustFinish || status.isLoaded) {
                    handleVideoPause(item.id_annonce);
                  }
                }}
              />
            )}

            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.3)']}
              style={styles.imageGradient}
            />

            {/* Bouton favori */}
            <TouchableOpacity 
              style={styles.favoriteButton}
              onPress={() => toggleFavorite(item.id_annonce)}
            >
              <Ionicons 
                name={isFavorite(item.id_annonce) ? "heart" : "heart-outline"} 
                size={20} 
                color={isFavorite(item.id_annonce) ? "#FF6B6B" : "white"} 
              />
            </TouchableOpacity>

            {isVideo && (
              <View style={styles.videoIndicator}>
                <Ionicons name="play-circle" size={14} color="white" />
                <Text style={styles.videoIndicatorText}>VIDÉO</Text>
              </View>
            )}

            {isVideo && !isPlaying && (
              <View style={styles.videoOverlay}>
                <Ionicons name="play" size={30} color="white" />
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
                  onPress={() => handleMediaPress(item.id_annonce, currentIndex - 1)}
                >
                  <Ionicons name="chevron-back" size={16} color="white" />
                </TouchableOpacity>
              )}
              {currentIndex < item.medias.length - 1 && (
                <TouchableOpacity 
                  style={[styles.navButton, styles.nextButton]}
                  onPress={() => handleMediaPress(item.id_annonce, currentIndex + 1)}
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
      if (!cleanedBase64) return renderNoMedia();

      const imageUri = `data:${item.type || 'image/jpeg'};base64,${cleanedBase64}`;

      return (
        <View style={styles.mediaContainer}>
          <TouchableOpacity 
            activeOpacity={0.9}
            onPress={() => openFullScreen(item)}
          >
            <Image
              source={{ uri: imageUri }}
              style={styles.announcementImage}
              resizeMode="cover"
            />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.3)']}
              style={styles.imageGradient}
            />

            {/* Bouton favori */}
            <TouchableOpacity 
              style={styles.favoriteButton}
              onPress={() => toggleFavorite(item.id_annonce)}
            >
              <Ionicons 
                name={isFavorite(item.id_annonce) ? "heart" : "heart-outline"} 
                size={20} 
                color={isFavorite(item.id_annonce) ? "#FF6B6B" : "white"} 
              />
            </TouchableOpacity>
          </TouchableOpacity>
        </View>
      );
    }
    else {
      return renderNoMedia();
    }
  };

  const renderFullScreenMedia = () => {
    if (!fullScreenMedia) return null;

    const { item, mediaIndex } = fullScreenMedia;
    const medias = item.medias || [];
    const currentMedia = medias[mediaIndex] || { type_media: 'image', fichier64: item.photo64, type_fichier: item.type };
    
    const cleanedBase64 = cleanBase64Data(currentMedia.fichier64);
    if (!cleanedBase64) return null;

    const mediaUri = `data:${currentMedia.type_fichier || 'image/jpeg'};base64,${cleanedBase64}`;
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

          {/* Bouton favori en plein écran */}
          <TouchableOpacity 
            style={styles.fullScreenFavoriteButton}
            onPress={() => toggleFavorite(item.id_annonce)}
          >
            <Ionicons 
              name={isFavorite(item.id_annonce) ? "heart" : "heart-outline"} 
              size={30} 
              color={isFavorite(item.id_annonce) ? "#FF6B6B" : "white"} 
            />
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

  const renderNoMedia = () => {
    return (
      <View style={[styles.announcementImage, styles.noMediaContainer]}>
        <Ionicons name="image-outline" size={30} color="#999" />
        <Text style={styles.noMediaText}>Aucune image</Text>
      </View>
    );
  };

  // Fonctions pour les prix
  const formatPrice = (price) => {
    if (!price) return '0 FCFA';
    return `${price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} FCFA`;
  };

  const hasPromotion = (item) => {
    return item.prix_promo && item.prix_promo !== item.prix_normal && item.prix_promo !== '0';
  };

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

  // Fonctions pour les modals
  const openModal = (annonce) => {
    setSelectedAnnonce(annonce);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedAnnonce(null);
  };

  const openDetail = (annonce) => {
    setSelectedAnnonce(annonce);
    setDetailModalVisible(true);
  };

  const closeDetail = () => {
    setDetailModalVisible(false);
    setSelectedAnnonce(null);
  };

  const handleWhatsApp = () => {
    if (!selectedAnnonce?.telephone) {
      Alert.alert('Erreur', 'Numéro de téléphone non disponible.');
      return;
    }
    const phoneNumber = selectedAnnonce.telephone.replace(/\D/g, '');
    const url = `whatsapp://send?phone=${phoneNumber}&text=Bonjour, je suis intéressé par votre annonce: ${selectedAnnonce?.description}`;
    Linking.openURL(url).catch((err) => {
      Alert.alert('Erreur', 'Impossible d\'ouvrir WhatsApp.');
    });
    closeModal();
  };

  const handleCall = () => {
    if (!selectedAnnonce?.telephone) {
      Alert.alert('Erreur', 'Numéro de téléphone non disponible.');
      return;
    }
    const phoneNumber = selectedAnnonce.telephone.replace(/\D/g, '');
    const url = `tel:${phoneNumber}`;
    Linking.openURL(url).catch((err) => {
      Alert.alert('Erreur', 'Impossible de passer l\'appel.');
    });
    closeModal();
  };

  // Filtrer par onglet
  const filteredAnnonces = filteredListe.filter(item => {
    if (selectedTab === 'En vente') return true;
    if (selectedTab === 'Vendu') return item.est_vendu === true;
    return true;
  });

  const chunkArray = (array, chunkSize) => {
    if (!Array.isArray(array)) return [];
    const chunks = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  };

  const annonceChunks = chunkArray(filteredAnnonces, 2);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Header - Profil vendeur */}
        <View style={styles.profileCard}>
          <View style={styles.proBadge}>
            <Text style={styles.proText}>PRO</Text>
            <Text style={styles.verifiedText}>Pro Vérifié ✔</Text>
          </View>

          <View style={styles.profileInfo}>
            <View style={styles.avatar}>
              <Ionicons name="person-circle" size={60} color="#007AFF" />
            </View>

            <View style={styles.infoText}>
              <Text style={styles.name}>{user?.nom_prenom || 'Utilisateur'}</Text>
              <Text style={styles.location}>📍 {user?.ville || 'Ville non précisée'}</Text>
              <Text style={styles.stats}>{filteredAnnonces.length} annonces</Text>
              <Text style={styles.member}>Membre depuis 3 ans</Text>
            </View>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.contactButton} onPress={() => openModal(liste[0])}>
              <Ionicons name="chatbubble-outline" size={20} color="#fff" />
              <Text style={styles.contactButtonText}>Contacter</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.aboutSection}>
            <Text style={styles.aboutTitle}>A propos</Text>
            <TouchableOpacity>
              <Text style={styles.aboutLink}>Voir plus d'infos</Text>
            </TouchableOpacity>

            <Text style={styles.categoryTitle}>Catégorie de produit vendu</Text>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>Véhicules</Text>
            </View>
          </View>
        </View>

        {/* Tabs En vente / Vendu */}
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, selectedTab === 'En vente' && styles.tabActive]} 
            onPress={() => setSelectedTab('En vente')}
          >
            <Text style={[styles.tabText, selectedTab === 'En vente' && styles.tabTextActive]}>
              En vente
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, selectedTab === 'Vendu' && styles.tabActive]} 
            onPress={() => setSelectedTab('Vendu')}
          >
            <Text style={[styles.tabText, selectedTab === 'Vendu' && styles.tabTextActive]}>
              Vendu
            </Text>
          </TouchableOpacity>
        </View>

        {/* Section Annonces */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Ionicons name="car-outline" size={24} color="#4CAF50" />
              <Text style={styles.sectionTitle}>Mes annonces</Text>
            </View>
          </View>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF6B00" />
            <Text style={styles.loadingText}>Chargement des annonces...</Text>
          </View>
        ) : filteredAnnonces.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="car-outline" size={60} color="#ccc" />
            <Text style={styles.emptyText}>Aucune annonce {selectedTab.toLowerCase()}</Text>
          </View>
        ) : (
          <View style={styles.annoncesGrid}>
            {annonceChunks.map((chunk, chunkIndex) => (
              <View key={chunkIndex} style={styles.annoncesRow}>
                {chunk.map((item, index) => (
                  <View key={item.id_annonce || `${chunkIndex}-${index}`} style={styles.annonceCard}>
                    {renderMedia(item)}
                    
                    <View style={styles.annonceContent}>
                      <Text style={styles.annonceTitle} numberOfLines={2}>
                        {item.description}
                      </Text>
                      
                      <PriceDisplay item={item} />
                      
                      <View style={styles.locationContainer}>
                        <Ionicons name="location-outline" size={12} color="#666" />
                        <Text style={styles.annonceLocation}>{item.ville}</Text>
                      </View>
                      
                      <View style={styles.buttonContainer}>
                        <TouchableOpacity style={styles.detailsButton} onPress={() => openDetail(item)}>
                          <Ionicons name="eye-outline" size={12} color="white" />
                          <Text style={styles.detailsText}>Détails</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.contactButtonSmall} onPress={() => openModal(item)}>
                          <Ionicons name="chatbubble-outline" size={12} color="white" />
                          <Text style={styles.contactTextSmall}>Contacter</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                ))}
                {chunk.length === 1 && <View style={styles.emptySpace} />}
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Modal Contact */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Contacter le vendeur</Text>
              <TouchableOpacity onPress={closeModal} style={styles.closeIcon}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalButton, styles.whatsappButton]} onPress={handleWhatsApp}>
                <Ionicons name='logo-whatsapp' size={24} color="white" />
                <Text style={styles.modalButtonText}>WhatsApp</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={[styles.modalButton, styles.callButton]} onPress={handleCall}>
                <Ionicons name="call-outline" size={24} color="white" />
                <Text style={styles.modalButtonText}>Appeler</Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
              <Text style={styles.closeButtonText}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal Détails */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={detailModalVisible}
        onRequestClose={closeDetail}
      >
        <View style={styles.modalContainer}>
          <View style={styles.detailsModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Détails de l'annonce</Text>
              <TouchableOpacity onPress={closeDetail} style={styles.closeIcon}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {selectedAnnonce && (
              <ScrollView style={styles.detailScroll}>
                <View style={styles.detailContent}>
                  <Text style={styles.detailTitle}>{selectedAnnonce.description}</Text>
                  
                  <View style={styles.detailPriceContainer}>
                    {hasPromotion(selectedAnnonce) ? (
                      <>
                        <Text style={styles.detailPrice}>{formatPrice(selectedAnnonce.prix_promo)}</Text>
                        <Text style={styles.detailPromoPrice}>{formatPrice(selectedAnnonce.prix_normal)}</Text>
                      </>
                    ) : (
                      <Text style={styles.detailPrice}>{formatPrice(selectedAnnonce.prix_normal)}</Text>
                    )}
                  </View>
                  
                  <View style={styles.detailInfo}>
                    <View style={styles.infoItem}>
                      <Ionicons name="location-outline" size={18} color="#666" />
                      <Text style={styles.infoText}>{selectedAnnonce.ville}</Text>
                    </View>
                  </View>
                </View>
              </ScrollView>
            )}
            
            <TouchableOpacity style={styles.contactMainButton} onPress={() => { closeDetail(); openModal(selectedAnnonce); }}>
              <Ionicons name="chatbubble-ellipses" size={20} color="white" />
              <Text style={styles.contactMainButtonText}>Contacter le vendeur</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal Plein Écran */}
      {renderFullScreenMedia()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },

  // Profil
  profileCard: {
    backgroundColor: '#fff',
    margin: 12,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  proBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  proText: {
    backgroundColor: '#007bff',
    color: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 12,
    fontWeight: 'bold',
    marginRight: 8,
  },
  verifiedText: {
    color: '#007bff',
    fontWeight: '600',
    fontSize: 14,
  },

  profileInfo: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoText: { flex: 1, justifyContent: 'center' },
  name: { fontSize: 18, fontWeight: 'bold' },
  location: { fontSize: 14, color: '#555', marginTop: 2 },
  stats: { fontSize: 14, color: '#333', marginTop: 4 },
  member: { fontSize: 13, color: '#888' },

  actionButtons: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  contactButton: {
    flexDirection: 'row',
    backgroundColor: '#28a745',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  contactButtonText: { color: '#fff', marginLeft: 6, fontWeight: '600' },

  aboutSection: {},
  aboutTitle: { fontSize: 15, fontWeight: '600', marginBottom: 4 },
  aboutLink: { color: '#007bff', textDecorationLine: 'underline', marginBottom: 8 },
  categoryTitle: { fontSize: 14, color: '#555', marginBottom: 6 },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#e9ecef',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  categoryText: { fontSize: 13, color: '#495057' },

  // Tabs
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 2,
    borderColor: '#d9534f',
  },
  tabText: {
    fontSize: 16,
    color: '#888',
  },
  tabTextActive: {
    color: '#d9534f',
    fontWeight: 'bold',
  },

  // Sections
  section: {
    paddingHorizontal: 15,
    marginVertical: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },

  // Loading et erreurs
  loadingContainer: {
    alignItems: 'center',
    padding: 40,
    marginVertical: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
    marginVertical: 20,
    backgroundColor: '#fff',
    marginHorizontal: 15,
    borderRadius: 15,
  },
  emptyText: {
    color: '#666',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 10,
    fontWeight: '600',
  },

  // Grille d'annonces
  annoncesGrid: {
    paddingHorizontal: 10,
    marginBottom: 60,
  },
  annoncesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  annonceCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
    overflow: 'hidden',
  },
  emptySpace: {
    width: '48%',
  },
  annonceContent: {
    padding: 12,
  },
  annonceTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
    lineHeight: 18,
  },
  annonceLocation: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
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
    height: 140,
  },
  imageGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 60,
  },
  favoriteButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 15,
    padding: 5,
  },
  videoIndicator: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  videoIndicatorText: {
    color: 'white',
    fontSize: 9,
    fontWeight: 'bold',
    marginLeft: 2,
  },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  mediaIndicator: {
    position: 'absolute',
    top: 10,
    right: 50,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
  },
  mediaIndicatorText: {
    color: 'white',
    fontSize: 9,
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
    left: 5,
  },
  nextButton: {
    right: 5,
  },
  noMediaContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e9ecef',
  },
  noMediaText: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
    marginTop: 5,
  },

  // Prix
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 6,
    flexWrap: 'wrap',
  },
  announcementPrice: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FF6B00',
    marginRight: 8,
  },
  announcementPromoPrice: {
    fontSize: 12,
    color: '#666',
    textDecorationLine: 'line-through',
  },

  // Boutons
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailsButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailsText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 11,
  },
  contactButtonSmall: {
    backgroundColor: '#21a403',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  contactTextSmall: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },

  // Modals
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 0,
    width: '90%',
    maxWidth: 400,
  },
  detailsModalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 0,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeIcon: {
    padding: 4,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    gap: 10,
  },
  modalButton: {
    alignItems: 'center',
    padding: 15,
    borderRadius: 15,
    flex: 1,
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginTop: 8,
    fontSize: 12,
  },
  closeButton: {
    backgroundColor: '#6c757d',
    paddingVertical: 15,
    margin: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  whatsappButton: {
    backgroundColor: '#25D366',
  },
  callButton: {
    backgroundColor: '#007AFF',
  },

  // Détails modal
  detailScroll: {
    flex: 1,
  },
  detailContent: {
    padding: 20,
  },
  detailTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    lineHeight: 28,
  },
  detailPriceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  detailPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B00',
    marginRight: 12,
  },
  detailPromoPrice: {
    fontSize: 18,
    color: '#666',
    textDecorationLine: 'line-through',
  },
  detailInfo: {
    marginBottom: 20,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 16,
    color: '#666',
    marginLeft: 8,
  },
  contactMainButton: {
    backgroundColor: '#21a403',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    margin: 20,
    borderRadius: 12,
    gap: 8,
  },
  contactMainButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
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
  fullScreenFavoriteButton: {
    position: 'absolute',
    top: 40,
    left: 20,
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
    left: 70,
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
});

export default ProfilUtilisateur;