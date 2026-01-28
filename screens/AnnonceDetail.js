import React, { useState, useRef } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity, Dimensions, Modal, StatusBar } from 'react-native';
import { Video } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const AnnonceDetail = ({ route, navigation }) => {
  const { annonce } = route.params;
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
  const [fullScreenMedia, setFullScreenMedia] = useState(null);
  const [playingVideos, setPlayingVideos] = useState({});
  const videoRefs = useRef({});

  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

  // Vos fonctions de formatage et de nettoyage des données
  const formatPrice = (price) => {
    if (!price || price === '0') return 'Prix à discuter';
    const numericPrice = parseInt(price);
    if (isNaN(numericPrice)) return 'Prix à discuter';
    return `${numericPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} FCFA`;
  };

  const hasPromotion = (item) => {
    return item.prix_promo && item.prix_promo !== item.prix_normal && item.prix_promo !== '0' && item.prix_promo !== '0';
  };

  const cleanBase64Data = (base64String) => {
    if (!base64String) return null;
    if (base64String.startsWith('data:')) {
      return base64String;
    }
    return base64String.trim();
  };

  const openFullScreen = async (mediaIndex = 0) => {
    await stopAllVideos();
    
    setFullScreenMedia({ item: annonce, mediaIndex });
    
    if (annonce.medias && annonce.medias[mediaIndex]?.type_media === 'video') {
      setPlayingVideos(prev => ({
        ...prev,
        [`fullscreen_${annonce.id_annonce}`]: true
      }));
    }
  };

  const closeFullScreen = async () => {
    if (fullScreenMedia && annonce.medias) {
      const currentMedia = annonce.medias[fullScreenMedia.mediaIndex];
      if (currentMedia.type_media === 'video' && videoRefs.current[`fullscreen_${annonce.id_annonce}`]) {
        await videoRefs.current[`fullscreen_${annonce.id_annonce}`].stopAsync();
      }
    }
    
    setPlayingVideos(prev => {
      const newState = { ...prev };
      delete newState[`fullscreen_${annonce.id_annonce}`];
      return newState;
    });
    
    setFullScreenMedia(null);
  };

  const navigateFullScreenMedia = async (direction) => {
    if (!fullScreenMedia) return;

    const { mediaIndex } = fullScreenMedia;
    const medias = annonce.medias || [];

    if (medias.length <= 1) return;

    let newIndex;
    if (direction === 'next') {
      newIndex = (mediaIndex + 1) % medias.length;
    } else {
      newIndex = (mediaIndex - 1 + medias.length) % medias.length;
    }

    const currentMedia = medias[mediaIndex];
    if (currentMedia.type_media === 'video' && videoRefs.current[`fullscreen_${annonce.id_annonce}`]) {
      await videoRefs.current[`fullscreen_${annonce.id_annonce}`].stopAsync();
    }

    setFullScreenMedia({ item: annonce, mediaIndex: newIndex });
    
    setPlayingVideos(prev => {
      const newState = { ...prev };
      delete newState[`fullscreen_${annonce.id_annonce}`];
      if (medias[newIndex].type_media === 'video') {
        newState[`fullscreen_${annonce.id_annonce}`] = true;
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

  const renderMedia = () => {
    const medias = annonce.medias || [];
    const currentMedia = medias[selectedMediaIndex] || { type_media: 'image', fichier64: annonce.photo64, type_fichier: annonce.type };
    
    const cleanedBase64 = cleanBase64Data(currentMedia.fichier64);
    
    if (!cleanedBase64) {
      return renderNoMedia('Données base64 invalides');
    }

    let mediaUri = cleanedBase64;
    if (!cleanedBase64.startsWith('data:')) {
      const mimeType = currentMedia.type_fichier || 
                      (currentMedia.type_media === 'video' ? 'video/mp4' : 'image/jpeg');
      mediaUri = `data:${mimeType};base64,${cleanedBase64}`;
    }

    const isVideo = currentMedia.type_media === 'video';
    const isPlaying = playingVideos[annonce.id_annonce];

    return (
      <View style={styles.mediaContainer}>
        <TouchableOpacity 
          style={styles.mediaTouchable}
          onPress={() => openFullScreen(selectedMediaIndex)}
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
              ref={ref => videoRefs.current[annonce.id_annonce] = ref}
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
                  handleVideoPlay(annonce.id_annonce);
                } else if (status.didJustFinish || status.isLoaded) {
                  handleVideoPause(annonce.id_annonce);
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
              <Ionicons name="play" size={22} color="white" />
            </View>
          )}

          {/* Promotion badge */}
          {hasPromotion(annonce) && (
            <View style={styles.promoBadge}>
              <Text style={styles.promoBadgeText}>PROMO</Text>
            </View>
          )}
        </TouchableOpacity>

        {medias.length > 1 && (
          <View style={styles.mediaIndicator}>
            <Text style={styles.mediaIndicatorText}>
              {selectedMediaIndex + 1} / {medias.length}
            </Text>
          </View>
        )}

        {medias.length > 1 && (
          <>
            {selectedMediaIndex > 0 && (
              <TouchableOpacity 
                style={[styles.navButton, styles.prevButton]}
                onPress={() => setSelectedMediaIndex(selectedMediaIndex - 1)}
              >
                <Ionicons name="chevron-back" size={18} color="white" />
              </TouchableOpacity>
            )}
            {selectedMediaIndex < medias.length - 1 && (
              <TouchableOpacity 
                style={[styles.navButton, styles.nextButton]}
                onPress={() => setSelectedMediaIndex(selectedMediaIndex + 1)}
              >
                <Ionicons name="chevron-forward" size={18} color="white" />
              </TouchableOpacity>
            )}
          </>
        )}

        {/* Miniatures des médias */}
        {medias.length > 1 && (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.thumbnailsContainer}
          >
            {medias.map((media, index) => {
              const cleanedThumbnailBase64 = cleanBase64Data(media.fichier64);
              let thumbnailUri = cleanedThumbnailBase64;
              
              if (cleanedThumbnailBase64 && !cleanedThumbnailBase64.startsWith('data:')) {
                const mimeType = media.type_fichier || 
                                (media.type_media === 'video' ? 'video/mp4' : 'image/jpeg');
                thumbnailUri = `data:${mimeType};base64,${cleanedThumbnailBase64}`;
              }

              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.thumbnail,
                    index === selectedMediaIndex && styles.selectedThumbnail
                  ]}
                  onPress={() => setSelectedMediaIndex(index)}
                >
                  {media.type_media === 'video' ? (
                    <View style={styles.thumbnailVideoContainer}>
                      {thumbnailUri ? (
                        <Image 
                          source={{ uri: thumbnailUri }}
                          style={styles.thumbnailImage}
                          resizeMode="cover"
                        />
                      ) : (
                        <View style={[styles.thumbnailImage, styles.noThumbnail]}>
                          <Ionicons name="play-circle" size={14} color="#999" />
                        </View>
                      )}
                      <View style={styles.thumbnailVideoIndicator}>
                        <Ionicons name="play" size={8} color="white" />
                      </View>
                    </View>
                  ) : (
                    thumbnailUri ? (
                      <Image 
                        source={{ uri: thumbnailUri }}
                        style={styles.thumbnailImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={[styles.thumbnailImage, styles.noThumbnail]}>
                        <Ionicons name="image-outline" size={14} color="#999" />
                      </View>
                    )
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}
      </View>
    );
  };

  const renderNoMedia = (message) => {
    return (
      <View style={[styles.announcementImage, styles.noMediaContainer]}>
        <Ionicons name="image-outline" size={32} color="#999" />
        <Text style={styles.noMediaText}>{message}</Text>
      </View>
    );
  };

  const renderFullScreenMedia = () => {
    if (!fullScreenMedia) return null;

    const { mediaIndex } = fullScreenMedia;
    const medias = annonce.medias || [];
    const currentMedia = medias[mediaIndex] || { type_media: 'image', fichier64: annonce.photo64, type_fichier: annonce.type };
    
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
            <Ionicons name="close" size={22} color="white" />
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
                ref={ref => videoRefs.current[`fullscreen_${annonce.id_annonce}`] = ref}
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
                <Ionicons name="chevron-back" size={22} color="white" />
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.fullScreenNavButton, styles.fullScreenNextButton]}
                onPress={() => navigateFullScreenMedia('next')}
              >
                <Ionicons name="chevron-forward" size={22} color="white" />
              </TouchableOpacity>
            </>
          )}

          {isVideo && (
            <View style={styles.fullScreenVideoIndicator}>
              <Text style={styles.fullScreenVideoIndicatorText}>VIDÉO</Text>
            </View>
          )}
        </View>
      </Modal>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header avec bouton retour */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={20} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Détails</Text>
        </View>

        {/* Section médias */}
        <View style={styles.mediaSection}>
          {renderMedia()}
        </View>

        {/* SECTION 1: INFORMATIONS DE L'ANNONCE */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Informations de l'annonce</Text>
          
          <View style={styles.priceContainer}>
            {hasPromotion(annonce) ? (
              <>
                <Text style={styles.promoPrice}>{formatPrice(annonce.prix_promo)}</Text>
                <Text style={styles.originalPrice}>{formatPrice(annonce.prix_normal)}</Text>
              </>
            ) : (
              <Text style={styles.price}>{formatPrice(annonce.prix_normal)}</Text>
            )}
          </View>

          <View style={styles.infoItem}>
            <Ionicons name="location-outline" size={15} color="#666" style={styles.infoIcon} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Localisation</Text>
              <Text style={styles.infoValue}>{annonce.utilisateur?.ville || annonce.ville || 'Non spécifié'}</Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <Ionicons name="calendar-outline" size={15} color="#666" style={styles.infoIcon} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Date</Text>
              <Text style={styles.infoValue}>{annonce.date || 'Date inconnue'} à {annonce.heure || 'Heure inconnue'}</Text>
            </View>
          </View>

          {annonce.type && (
            <View style={styles.infoItem}>
              <Ionicons name="pricetag-outline" size={15} color="#666" style={styles.infoIcon} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Type d'annonce</Text>
                <Text style={styles.infoValue}>{annonce.type}</Text>
              </View>
            </View>
          )}

          {annonce.description && (
            <View style={styles.descriptionContainer}>
              <Text style={styles.descriptionTitle}>Description</Text>
              <Text style={styles.descriptionText}>{annonce.titre}</Text>
              <Text style={styles.descriptionText}>{annonce.description}</Text>
            </View>
          )}
        </View>

        {/* SECTION 2: INFORMATIONS DU VENDEUR */}
        <View style={styles.vendorSection}>
          <Text style={styles.sectionTitle}>Vendeur</Text>
          
          <View style={styles.vendorInfo}>
            <View style={styles.vendorAvatar}>
              <Ionicons name="person-circle" size={45} color="#007AFF" />
            </View>
            
            <View style={styles.vendorDetails}>
              <Text style={styles.vendorName}>{annonce.utilisateur?.nom || 'Vendeur'}</Text>
              
              <View style={styles.vendorItem}>
                <Ionicons name="location-outline" size={13} color="#666" />
                <Text style={styles.vendorText}>{annonce.utilisateur?.ville || 'Ville non précisée'}</Text>
              </View>
              
              {annonce.utilisateur?.telephone && (
                <View style={styles.vendorItem}>
                  <Ionicons name="call-outline" size={13} color="#666" />
                  <Text style={styles.vendorText}>{annonce.utilisateur.telephone}</Text>
                </View>
              )}
              
              <TouchableOpacity 
                style={styles.vendorButton}
                onPress={() => {
                  // Navigation vers le profil du vendeur
                  if (annonce.user_id) {
                    navigation.navigate('AnnoncesProfil', { userId: annonce.user_id });
                  }
                }}
              >
                <Text style={styles.vendorButtonText}>Voir ses annonces</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bouton contacter */}
      <TouchableOpacity style={styles.contactButton}>
        <Ionicons name="chatbubble-ellipses" size={16} color="white" />
        <Text style={styles.contactButtonText}>Contacter</Text>
      </TouchableOpacity>

      {/* Full Screen Media Modal */}
      {renderFullScreenMedia()}
    </View>
  );
};

const { width: screenWidth } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
    marginBottom: 70,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    marginTop: 40,
  },
  backButton: {
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  mediaSection: {
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  mediaContainer: {
    position: 'relative',
  },
  mediaTouchable: {
    flex: 1,
  },
  announcementImage: {
    width: '100%',
    height: 280, // Légèrement réduit
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
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  videoIndicatorText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
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
    paddingVertical: 3,
    borderRadius: 10,
  },
  mediaIndicatorText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  navButton: {
    position: 'absolute',
    top: '50%',
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -16,
  },
  prevButton: {
    left: 12,
  },
  nextButton: {
    right: 12,
  },
  promoBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#FF4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  promoBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  noMediaContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e9ecef',
    borderWidth: 1,
    borderColor: '#dee2e6',
    height: 280,
  },
  noMediaText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
  thumbnailsContainer: {
    padding: 8,
    backgroundColor: '#f9f9f9',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  thumbnail: {
    width: 50,
    height: 50,
    marginRight: 8,
    borderRadius: 6,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedThumbnail: {
    borderColor: '#FF6B00',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  thumbnailVideoContainer: {
    position: 'relative',
    width: '100%',
    height: '100%',
  },
  thumbnailVideoIndicator: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.7)',
    width: 12,
    height: 12,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noThumbnail: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e9ecef',
  },
  // SECTION INFORMATIONS ANNONCE
  infoSection: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 8,
    marginHorizontal: 8,
    marginBottom: 8,
  },
  vendorSection: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 8,
    marginHorizontal: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  priceContainer: {
    marginBottom: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  price: {
    fontSize: 19,
    fontWeight: '700',
    color: '#FF6B00',
  },
  promoPrice: {
    fontSize: 19,
    fontWeight: '700',
    color: '#FF6B00',
  },
  originalPrice: {
    fontSize: 14,
    color: '#666',
    textDecorationLine: 'line-through',
    marginTop: 3,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  infoIcon: {
    marginTop: 1,
    marginRight: 10,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    color: '#999',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
  },
  descriptionContainer: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  descriptionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
    marginBottom: 6,
  },
  // SECTION VENDEUR
  vendorInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  vendorAvatar: {
    marginRight: 12,
  },
  vendorDetails: {
    flex: 1,
  },
  vendorName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  vendorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  vendorText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 6,
  },
  vendorButton: {
    marginTop: 10,
    backgroundColor: '#007AFF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  vendorButtonText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 11,
  },
  contactButton: {
    position: 'absolute',
    bottom: 30,
    left: 12,
    right: 12,
    backgroundColor: '#21a403',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 6,
  },
  contactButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
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
    top: 30,
    right: 12,
    zIndex: 1000,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 15,
    padding: 4,
  },
  fullScreenMediaContainer: {
    width: screenWidth,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: screenWidth,
    height: '100%',
  },
  fullScreenVideo: {
    width: screenWidth,
    height: '100%',
  },
  fullScreenIndicator: {
    position: 'absolute',
    top: 30,
    left: 12,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  fullScreenIndicatorText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  fullScreenNavButton: {
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
  fullScreenPrevButton: {
    left: 12,
  },
  fullScreenNextButton: {
    right: 12,
  },
  fullScreenVideoIndicator: {
    position: 'absolute',
    bottom: 30,
    left: 12,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  fullScreenVideoIndicatorText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default AnnonceDetail;