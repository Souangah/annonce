import React, { useContext, useEffect, useState, useRef } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Modal, Linking, Alert, Dimensions, StatusBar } from 'react-native';
import { GlobalContext } from '../config/GlobalUser';
import { Video } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const Menu = ({navigation}) => {
  const [liste, setListe] = useState([]);
  const [user] = useContext(GlobalContext);
  const [popularannonce, setPopularAnnonce] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingPopular, setLoadingPopular] = useState(true);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAnnonce, setSelectedAnnonce] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedMediaIndexTop, setSelectedMediaIndexTop] = useState({});
  const [selectedMediaIndexPopular, setSelectedMediaIndexPopular] = useState({});
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
      const response = await fetch('https://epencia.net/app/souangah/annonce/liste-annonce.php');
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

  const openDetail = (annonce) => {
    setSelectedAnnonce(annonce);
    setDetailModalVisible(true);
  };

  const closeDetail = () => {
    setDetailModalVisible(false);
    setSelectedAnnonce(null);
  };

  const handleMediaPressTop = (annonceId, index) => {
    setSelectedMediaIndexTop(prev => ({
      ...prev,
      [annonceId]: index
    }));
  };

  const handleMediaPressPopular = (annonceId, index) => {
    setSelectedMediaIndexPopular(prev => ({
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

  // Fonction pour formater le prix
  const formatPrice = (price) => {
    if (!price) return '0 FCFA';
    return `${price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} FCFA`;
  };

  // Fonction pour vérifier si une annonce a une promotion
  const hasPromotion = (item) => {
    return item.prix_promo && item.prix_promo !== item.prix_normal && item.prix_promo !== '0';
  };

  const renderMedia = (item, isPopular = false) => {
    const currentIndex = isPopular 
      ? selectedMediaIndexPopular[item.id_annonce] || 0
      : selectedMediaIndexTop[item.id_annonce] || 0;
    
    const handleMediaPress = isPopular 
      ? handleMediaPressPopular 
      : handleMediaPressTop;

    if (item.medias && item.medias.length > 0) {
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

            {/* Overlay gradient */}
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.3)']}
              style={styles.imageGradient}
            />

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
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.3)']}
            style={styles.imageGradient}
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

  // Composant pour afficher les prix correctement
  const PriceDisplay = ({ item, isPopular = false }) => {
    const hasPromo = hasPromotion(item);
    const priceStyle = isPopular ? styles.popularPrice : styles.horizontalPrice;
    const promoPriceStyle = isPopular ? styles.popularPromoPrice : styles.horizontalPromoPrice;

    return (
      <View style={styles.priceContainer}>
        {hasPromo ? (
          <>
            <Text style={priceStyle}>{formatPrice(item.prix_promo)}</Text>
            <Text style={promoPriceStyle}>{formatPrice(item.prix_normal)}</Text>
          </>
        ) : (
          <Text style={priceStyle}>{formatPrice(item.prix_normal)}</Text>
        )}
      </View>
    );
  };

  // Composant pour afficher les prix dans les détails
  const DetailPriceDisplay = ({ item }) => {
    const hasPromo = hasPromotion(item);

    return (
      <View style={styles.detailPriceContainer}>
        {hasPromo ? (
          <>
            <Text style={styles.detailPrice}>{formatPrice(item.prix_promo)}</Text>
            <Text style={styles.detailPromoPrice}>{formatPrice(item.prix_normal)}</Text>
          </>
        ) : (
          <Text style={styles.detailPrice}>{formatPrice(item.prix_normal)}</Text>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header Section améliorée */}
        <LinearGradient
          colors={['#1a1a1a', '#2d2d2d']}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>Votre véhicule à crédit</Text>
              <Text style={styles.headerSubtitle}>Trouvez la voiture de vos rêves</Text>
            </View>
            <Image
              source={{ uri: imageUrls.logo }}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
        </LinearGradient>

        {/* Top Announcements Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Ionicons name="flash" size={24} color="#FF6B00" />
              <Text style={styles.sectionTitle}>Top annonces</Text>
            </View>
            <TouchableOpacity style={styles.viewAllButton}>
              <Text style={styles.viewAll}>Voir plus</Text>
              <Ionicons name="chevron-forward" size={16} color="#007AFF" />
            </TouchableOpacity>
          </View>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF6B00" />
            <Text style={styles.loadingText}>Chargement des annonces...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={50} color="#FF6B00" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={getAnnonce}>
              <Text style={styles.retryText}>Réessayer</Text>
            </TouchableOpacity>
          </View>
        ) : !liste || liste.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="car-outline" size={60} color="#ccc" />
            <Text style={styles.emptyText}>Aucune annonce disponible</Text>
            <Text style={styles.emptySubtext}>Revenez plus tard pour découvrir de nouvelles annonces</Text>
          </View>
        ) : (
          <ScrollView 
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.horizontalScroll}
            contentContainerStyle={styles.horizontalScrollContent}
          >
            {liste.map((item, index) => (
              <View key={item.id_annonce || index} style={styles.horizontalAnnouncement}>
                {renderMedia(item, false)}
                
                <View style={styles.horizontalContent}>
                  <Text style={styles.horizontalTitle} numberOfLines={2}>
                    {item.description}
                  </Text>
                  
                  <PriceDisplay item={item} isPopular={false} />
                  
                  <View style={styles.locationContainer}>
                    <Ionicons name="location-outline" size={14} color="#666" />
                    <Text style={styles.horizontalLocation}>{item.ville}</Text>
                  </View>
                  
                  <View style={styles.horizontalButtonContainer}>
                    <TouchableOpacity style={styles.detailsButton} onPress={() => openDetail(item)}>
                      <Ionicons name="eye-outline" size={14} color="white" />
                      <Text style={styles.detailsText}>Détails</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.contactButtonSmall} onPress={() => openModal(item)}>
                      <Ionicons name="chatbubble-outline" size={14} color="white" />
                      <Text style={styles.contactTextSmall}>Contacter</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
        )}

        {/* Section Annonces Populaires */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Ionicons name="trending-up" size={24} color="#4CAF50" />
              <Text style={styles.sectionTitle}>Annonces populaires</Text>
            </View>
            <TouchableOpacity style={styles.viewAllButton}>
              <Text style={styles.viewAll}>Voir plus</Text>
              <Ionicons name="chevron-forward" size={16} color="#007AFF" />
            </TouchableOpacity>
          </View>
        </View>

        {loadingPopular ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF6B00" />
            <Text style={styles.loadingText}>Chargement des annonces populaires...</Text>
          </View>
        ) : !popularannonce || popularannonce.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="car-outline" size={60} color="#ccc" />
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
                      
                      <PriceDisplay item={item} isPopular={true} />
                      
                      <View style={styles.locationContainer}>
                        <Ionicons name="location-outline" size={12} color="#666" />
                        <Text style={styles.popularLocation}>{item.ville}</Text>
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

      {/* Modal for Contact Options amélioré */}
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

            <View style={styles.profileSection}>
              <View style={styles.profileAvatar}>
                <Ionicons name="person-circle" size={70} color="#007AFF"/>
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.userName}>{user?.nom_prenom || 'Utilisateur'}</Text>
                <View style={styles.locationContainer}>
                  <Ionicons name="location-outline" size={14} color="#666" />
                  <Text style={styles.userCity}>{user?.ville || 'Ville non précisée'}</Text>
                </View>
                <TouchableOpacity 
                  style={styles.profileButton}
                  onPress={() => {
                    closeModal();
                    navigation.navigate('ProfilUtilisateur');
                  }}
                >
                  <Text style={styles.profileButtonText}>Voir le profil</Text>
                </TouchableOpacity>
              </View>
            </View>
                        
            <View style={styles.separator} />
            
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

      {/* Modal detail amélioré */}
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
                  
                  <DetailPriceDisplay item={selectedAnnonce} />
                  
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

      {/* Full Screen Media Modal */}
      {renderFullScreenMedia()}
    </View>
  );
};

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  // Header amélioré
  header: {
    paddingVertical: 20,
    paddingHorizontal: 15,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  logo: {
    width: 80,
    height: 80,
  },
  // Sections améliorées
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
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  viewAll: {
    color: '#007AFF',
    fontWeight: '500',
    marginRight: 4,
  },
  // Loading et erreurs améliorés
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
  errorContainer: {
    alignItems: 'center',
    padding: 40,
    marginVertical: 20,
    backgroundColor: '#fff',
    marginHorizontal: 15,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  errorText: {
    color: '#FF0000',
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 10,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 10,
  },
  retryText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
    marginVertical: 20,
    backgroundColor: '#fff',
    marginHorizontal: 15,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  emptyText: {
    color: '#666',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 10,
    fontWeight: '600',
  },
  emptySubtext: {
    color: '#999',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 5,
  },
  // Cartes horizontales améliorées
  horizontalScroll: {
    marginBottom: 10,
  },
  horizontalScrollContent: {
    paddingHorizontal: 10,
  },
  horizontalAnnouncement: {
    width: 200,
    backgroundColor: '#fff',
    marginHorizontal: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 5,
    overflow: 'hidden',
    marginBottom: 15,
  },
  horizontalContent: {
    padding: 15,
  },
  horizontalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    lineHeight: 20,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  horizontalPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6B00',
    marginRight: 8,
  },
  horizontalPromoPrice: {
    fontSize: 14,
    color: '#666',
    textDecorationLine: 'line-through',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  horizontalLocation: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  horizontalButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  // Styles médias améliorés
  mediaContainer: {
    position: 'relative',
  },
  popularMediaContainer: {
    position: 'relative',
  },
  mediaTouchable: {
    flex: 1,
  },
  announcementImage: {
    width: '100%',
    height: 180,
  },
  popularImage: {
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
  videoIndicator: {
    position: 'absolute',
    top: 10,
    left: 10,
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
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
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
    width: 35,
    height: 35,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -18,
  },
  prevButton: {
    left: 10,
  },
  nextButton: {
    right: 10,
  },
  promoBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#FF4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  promoBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  noMediaContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e9ecef',
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 15,
  },
  noMediaTextSmall: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
    marginTop: 5,
  },
  // Grille populaire améliorée
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
  popularContent: {
    padding: 12,
  },
  popularTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
    lineHeight: 18,
  },
  popularPrice: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FF6B00',
    marginBottom: 2,
  },
  popularPromoPrice: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    textDecorationLine: 'line-through',
  },
  popularLocation: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  // Boutons améliorés
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
    textAlign: 'center',
    fontSize: 11,
    fontWeight: 'bold',
  },
  // Modals améliorés
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
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
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  profileAvatar: {
    marginRight: 15,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  userCity: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  profileButton: {
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  profileButtonText: {
    fontWeight: 'bold',
    color: '#FFFFFF',
    backgroundColor: '#007AFF',
    borderRadius: 15,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 12,
    textAlign: 'center',
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
    minWidth: 80,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
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
  messageButton: {
    backgroundColor: '#FF9500',
  },
  // Modal détails amélioré
  detailsModalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 0,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  contactMainButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  separator: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginHorizontal: 20,
  },
  // Styles plein écran existants
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
});

export default Menu;