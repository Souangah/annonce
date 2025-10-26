import React, { useContext, useEffect, useState, useRef } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Modal, Linking, Alert, Dimensions, StatusBar } from 'react-native';
import { GlobalContext } from '../config/GlobalUser';
import { Video } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';

const Menu = () => {
  const [liste, setListe] = useState([]);
  const [user] = useContext(GlobalContext);
  const [popularannonce, setPopularAnnonce] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingPopular, setLoadingPopular] = useState(true);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAnnonce, setSelectedAnnonce] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false); // Corrigé: false au lieu de null
  const [selectedMediaIndex, setSelectedMediaIndex] = useState({});
  const [fullScreenMedia, setFullScreenMedia] = useState(null);
  const [playingVideos, setPlayingVideos] = useState({});
  const videoRefs = useRef({});

  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

  useEffect(() => {
    getAnnonce();
  }, []);

  const getAnnonce = async () => {
    if (!user?.user_id) {
      console.warn('user_id non disponible');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`https://epencia.net/app/souangah/annonce/annonce-utilisateur.php?user_id=${user.user_id}`);
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      const result = await response.json();
      if (result.status === 'success' && Array.isArray(result.annonces)) {
        setListe(result.annonces);
      } else if (Array.isArray(result)) {
        setListe(result);
      } else {
        console.warn('Structure de données inattendue:', result);
        setListe([]);
        setError('Format de données non reconnu');
      }
    } catch (error) {
      console.error('Erreur Top Annonces:', error);
      setError('Erreur de chargement des annonces');
      setListe([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchPopularAnnonces = async () => {
      try {
        setLoadingPopular(true);
        const response = await fetch('https://epencia.net/app/souangah/annonce/liste-annonce.php');
        const data = await response.json();
        console.log('Données populaires reçues:', data);
        if (Array.isArray(data)) {
          setPopularAnnonce(data);
        } else {
          console.warn('Les données populaires ne sont pas un tableau:', data);
          setPopularAnnonce([]);
        }
      } catch (err) {
        console.error('Erreur Annonces Populaires:', err);
        setPopularAnnonce([]);
      } finally {
        setLoadingPopular(false);
      }
    };
    fetchPopularAnnonces();
  }, []);

  const chunkArray = (array, chunkSize) => {
    if (!Array.isArray(array)) return [];
    const chunks = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  };

  const popularChunks = chunkArray(popularannonce, 2);

  const imageUrls = {
    header: 'https://images.unsplash.com/photo-1549399542-7e7f0edb80d8?w=150&h=150&fit=crop',
    logo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=50&h=50&fit=crop',
  };

  const openModal = (annonce) => {
    setSelectedAnnonce(annonce);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedAnnonce(null);
  };

  // Fonction pour ouvrir le modal detail - CORRIGÉE
  const openDetail = (annonce) => {
    setSelectedAnnonce(annonce);
    setDetailModalVisible(true);
  };

  // Fonction pour fermer le modal detail - CORRIGÉE (paramètre enlevé)
  const closeDetail = () => {
    setDetailModalVisible(false);
    setSelectedAnnonce(null);
  };

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
    
    const cleaned = base64String
      .replace(/^data:image\/[a-zA-Z]+;base64,/, '')
      .replace(/^data:video\/[a-zA-Z]+;base64,/, '')
      .trim();
    
    return cleaned;
  };

  const renderMedia = (item, isPopular = false) => {
    if (item.medias && item.medias.length > 0) {
      const currentIndex = selectedMediaIndex[item.id_annonce] || 0;
      const currentMedia = item.medias[currentIndex];
      
      const cleanedBase64 = cleanBase64Data(currentMedia.fichier64);
      
      if (!cleanedBase64) {
        return renderNoMedia(isPopular, 'Données base64 invalides');
      }

      const mediaUri = `data:${currentMedia.type_fichier || 'image/jpeg'};base64,${cleanedBase64}`;
      const isVideo = currentMedia.type_media === 'video';
      const isPlaying = playingVideos[item.id_annonce];

      return (
        <View style={isPopular ? styles.popularMediaContainer : styles.mediaContainer}>
          <TouchableOpacity 
            style={styles.mediaTouchable}
            onPress={() => openFullScreen(item, currentIndex)}
            activeOpacity={0.9}
          >
            {!isVideo ? (
              <Image 
                source={{ uri: mediaUri }}
                style={isPopular ? styles.popularImage : styles.announcementImage}
                resizeMode="cover"
                onError={(e) => console.log('Media image failed to load:', e.nativeEvent.error)}
              />
            ) : (
              <Video
                ref={ref => videoRefs.current[item.id_annonce] = ref}
                source={{ uri: mediaUri }}
                style={isPopular ? styles.popularImage : styles.announcementImage}
                useNativeControls
                resizeMode="cover"
                shouldPlay={false}
                isLooping={false}
                onError={(e) => console.log('Video failed to load:', e)}
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

            {isVideo && (
              <View style={styles.videoIndicator}>
                <Ionicons name="play-circle" size={16} color="white" />
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
                  <Ionicons name="chevron-back" size={20} color="white" />
                </TouchableOpacity>
              )}
              {currentIndex < item.medias.length - 1 && (
                <TouchableOpacity 
                  style={[styles.navButton, styles.nextButton]}
                  onPress={() => handleMediaPress(item.id_annonce, currentIndex + 1)}
                >
                  <Ionicons name="chevron-forward" size={20} color="white" />
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
        return renderNoMedia(isPopular, 'Données base64 invalides');
      }

      const imageUri = `data:${item.type || 'image/jpeg'};base64,${cleanedBase64}`;

      return (
        <TouchableOpacity 
          onPress={() => openFullScreen(item)}
          activeOpacity={0.9}
        >
          <Image
            source={{ uri: imageUri }}
            style={isPopular ? styles.popularImage : styles.announcementImage}
            resizeMode="cover"
            onError={(e) => console.log('Single image failed to load')}
          />
        </TouchableOpacity>
      );
    }
    else {
      return renderNoMedia(isPopular, 'Aucune image');
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

  const renderNoMedia = (isPopular, message) => {
    return (
      <View style={[isPopular ? styles.popularImage : styles.announcementImage, styles.noMediaContainer]}>
        <Ionicons name="image-outline" size={30} color="#999" />
        <Text style={styles.noMediaTextSmall}>{message}</Text>
      </View>
    );
  };

  const handleWhatsApp = () => {
    if (!selectedAnnonce?.telephone) {
      Alert.alert('Erreur', 'Numéro de téléphone non disponible pour cette annonce.');
      return;
    }
    const phoneNumber = selectedAnnonce.telephone.replace(/\D/g, '');
    const url = `whatsapp://send?phone=${phoneNumber}&text=Bonjour, je suis intéressé par votre annonce: ${selectedAnnonce?.description}`;
    Linking.openURL(url).catch((err) => {
      console.error('Erreur WhatsApp:', err);
      Alert.alert('Erreur', 'Impossible d\'ouvrir WhatsApp. Vérifiez si l\'application est installée.');
    });
    closeModal();
  };

  const handleCall = () => {
    if (!selectedAnnonce?.telephone) {
      Alert.alert('Erreur', 'Numéro de téléphone non disponible pour cette annonce.');
      return;
    }
    const phoneNumber = selectedAnnonce.telephone.replace(/\D/g, '');
    const url = `tel:${phoneNumber}`;
    Linking.openURL(url).catch((err) => {
      console.error('Erreur Appel:', err);
      Alert.alert('Erreur', 'Impossible de passer l\'appel.');
    });
    closeModal();
  };

  const handleMessage = () => {
    if (!selectedAnnonce?.telephone) {
      Alert.alert('Erreur', 'Numéro de téléphone non disponible pour cette annonce.');
      return;
    }
    const phoneNumber = selectedAnnonce.telephone.replace(/\D/g, '');
    const url = `sms:${phoneNumber}?body=Bonjour, je suis intéressé par votre annonce: ${selectedAnnonce?.description}`;
    Linking.openURL(url).catch((err) => {
      console.error('Erreur SMS:', err);
      Alert.alert('Erreur', 'Impossible d\'envoyer le SMS.');
    });
    closeModal();
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.header}>
          <Image
            source={{ uri: imageUrls.header }}
            style={styles.headerImage}
            resizeMode="cover"
          />
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Votre véhicule à crédit</Text>
            <Image
              source={{ uri: imageUrls.logo }}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* Top Announcements Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Annonces</Text>
          <TouchableOpacity>
            <Text style={styles.viewAll}>Toutes ></Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#FF0000" style={styles.loading} />
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={getAnnonce}>
              <Text style={styles.retryText}>Réessayer</Text>
            </TouchableOpacity>
          </View>
        ) : !liste || liste.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Aucune annonce disponible</Text>
          </View>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.announcementScroll}>
            {liste.map((item, index) => (
              <View key={item.id_annonce || index} style={styles.announcement}>
                {renderMedia(item, false)}
                
                <Text style={styles.price}>{item.prix_normal} FCFA</Text>
                {item.prix_promo && item.prix_promo !== item.prix_normal && (
                  <Text style={styles.promoPrice}>{item.prix_promo} FCFA</Text>
                )}
                <Text style={styles.carName} numberOfLines={2}>{item.description}</Text>
                <TouchableOpacity style={styles.contactButton} onPress={() => openModal(item)}>
                  <Text style={styles.contactText}>CONTACTER</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        )}

        {/* Section Annonces Populaires */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Annonces populaires</Text>
          <TouchableOpacity>
            <Text style={styles.viewAll}>Voir plus ></Text>
          </TouchableOpacity>
        </View>

        {loadingPopular ? (
          <ActivityIndicator size="large" color="#FF0000" style={styles.loading} />
        ) : !popularannonce || popularannonce.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Aucune annonce populaire disponible</Text>
          </View>
        ) : (
          <View style={styles.popularGrid}>
            {popularChunks.map((chunk, chunkIndex) => (
              <View key={chunkIndex} style={styles.popularRow}>
                {chunk.map((item, index) => (
                  <View key={item.id_annonce || `${chunkIndex}-${index}`} style={styles.popularAnnouncement}>
                    {renderMedia(item, true)}
                    
                    <View style={styles.popularContent}>
                      <Text style={styles.popularTitle} numberOfLines={2}>
                        {item.description}
                      </Text>
                      <Text style={styles.popularPrice}>{item.prix_normal} FCFA</Text>
                      {item.prix_promo && item.prix_promo !== item.prix_normal && (
                        <Text style={styles.popularPromoPrice}>{item.prix_promo} FCFA</Text>
                      )}
                      <Text style={styles.popularLocation}>{item.ville}</Text>
                      <View style={styles.buttonContainer}>
                        <TouchableOpacity style={styles.detailsButton} onPress={() => openDetail(item)}>
                          <Text style={styles.detailsText}>Voir détails</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.contactButtonSmall} onPress={() => openModal(item)}>
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

      {/* Modal for Contact Options */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Contacter le vendeur</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalButton, styles.whatsappButton]} onPress={handleWhatsApp}>
                <Ionicons name='logo-whatsapp' size={24} color="white" />
                <Text style={styles.modalButtonText}>WhatsApp</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.callButton]} onPress={handleCall}>
                <Ionicons name="call-outline" size={24} color="white" />
                <Text style={styles.modalButtonText}>Appeler</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.messageButton]} onPress={handleMessage}>
                <Ionicons name="chatbubble-outline" size={24} color="white" />
                <Text style={styles.modalButtonText}>Message</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
              <Text style={styles.closeButtonText}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal detail - CORRIGÉ */}
      <Modal
        animationType="slide"
        transparent={true} // Corrigé: true au lieu de "true"
        visible={detailModalVisible}
        onRequestClose={closeDetail}
      >
        <View style={styles.modalContainer}>
          <View style={styles.detailsModalContent}>
            <TouchableOpacity>
              <Text>Profil</Text>
            </TouchableOpacity>

            {selectedAnnonce && (
              // Contenu détail annonce - CORRIGÉ (commentaire fermé correctement)
              <View style={styles.detailContent}>
                <Text style={styles.detailTitle}>{selectedAnnonce.description}</Text>
                <Text style={styles.detailPrice}>{selectedAnnonce.prix_normal} FCFA</Text>
                <Text style={styles.detailPrice}>{selectedAnnonce.ville}</Text>
                {/* Ajoutez plus de détails ici selon vos besoins */}
              </View>
            )}
            <TouchableOpacity style={styles.closeButton} onPress={closeDetail}>
              <Text style={styles.closeButtonText}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
  loading: {
    marginVertical: 20,
  },
  errorContainer: {
    alignItems: 'center',
    padding: 20,
    marginVertical: 10,
  },
  errorText: {
    color: '#FF0000',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 20,
    marginVertical: 10,
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#1a1a1a',
    marginBottom: 15,
  },
  headerImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  headerText: {
    marginLeft: 15,
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  logo: {
    width: 150,
    height: 120,
  },
  section: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginVertical: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  viewAll: {
    color: '#007AFF',
    fontWeight: '500',
  },
  announcementScroll: {
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  announcement: {
    alignItems: 'center',
    width: 160,
    backgroundColor: '#fff',
    marginHorizontal: 5,
    padding: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mediaContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  popularMediaContainer: {
    position: 'relative',
  },
  mediaTouchable: {
    flex: 1,
  },
  announcementImage: {
    width: 120,
    height: 80,
    borderRadius: 6,
  },
  popularImage: {
    width: '100%',
    height: 120,
  },
  videoIndicator: {
    position: 'absolute',
    top: 5,
    left: 5,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  videoIndicatorText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  mediaIndicator: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  mediaIndicatorText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  navButton: {
    position: 'absolute',
    top: '50%',
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -15,
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
    backgroundColor: '#e0e0e0',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
  },
  noMediaTextSmall: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
    marginTop: 5,
  },
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
  price: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FF6B00',
    marginBottom: 2,
    marginTop: 4,
  },
  promoPrice: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#FF0000',
    marginBottom: 4,
    textDecorationLine: 'line-through',
  },
  carName: {
    fontSize: 14,
    textAlign: 'center',
    color: '#333',
    marginBottom: 8,
    fontWeight: '500',
    height: 40,
  },
  contactButton: {
    backgroundColor: '#21a403ff',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    width: '100%',
  },
  contactText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 12,
    fontWeight: 'bold',
  },
  contactButtonSmall: {
    backgroundColor: '#21a403ff',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  contactTextSmall: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 11,
    fontWeight: 'bold',
  },
  popularGrid: {
    paddingHorizontal: 10,
    marginBottom: 60,
  },
  popularRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  popularAnnouncement: {
    width: '49%',
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  emptySpace: {
    width: '48%',
  },
  popularContent: {
    padding: 10,
  },
  popularTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
    height: 40,
  },
  popularPrice: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#FF6B00',
    marginBottom: 2,
  },
  popularPromoPrice: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FF0000',
    marginBottom: 4,
    textDecorationLine: 'line-through',
  },
  popularLocation: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailsButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  detailsText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 11,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    alignItems: 'center',
  },
  detailsModalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  modalButton: {
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    minWidth: 80,
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginTop: 5,
    fontSize: 12,
  },
  closeButton: {
    backgroundColor: '#FF0000',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  whatsappButton: {
    backgroundColor: '#25D366',
  },
  callButton: {
    backgroundColor: '#007AFF',
  },
  messageButton: {
    backgroundColor: '#FF9500',
  },
  detailContent: {
    marginTop: 20,
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  detailPrice: {
    fontSize: 16,
    color: '#FF6B00',
    fontWeight: 'bold',
  },
});

export default Menu;