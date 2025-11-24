import React, { useState, useEffect, useContext, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Modal,
  Dimensions,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Video } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { GlobalContext } from '../config/GlobalUser';

const { width: screenWidth } = Dimensions.get('window');
const CARD_WIDTH = (screenWidth - 30) / 2; // 2 cartes par ligne avec marge

export default function AnnonceUtilisateur({ navigation }) {
  const [liste, setListe] = useState([]);
  const [filteredListe, setFilteredListe] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [rechercher, setRechercher] = useState('');
  const [user] = useContext(GlobalContext);

  const [fullScreenMedia, setFullScreenMedia] = useState(null);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState({});
  const videoRefs = useRef({});

  useEffect(() => {
    getAnnonce();
  }, []);

  useEffect(() => {
    const filtered = liste.filter(item =>
      (item.titre?.toLowerCase() || '').includes(rechercher.toLowerCase()) ||
      (item.description?.toLowerCase() || '').includes(rechercher.toLowerCase())
    );
    setFilteredListe(filtered);
  }, [rechercher, liste]);

  const getAnnonce = async () => {
    try {
      setRefreshing(true);
      const response = await fetch(
        `https://epencia.net/app/souangah/annonce/annonce-utilisateur.php?user_id=${user.user_id}`
      );
      const result = await response.json();
      if (result.status === 'success' && Array.isArray(result.annonces)) {
        setListe(result.annonces);
        setFilteredListe(result.annonces);
      } else {
        setListe([]);
        setFilteredListe([]);
      }
    } catch (err) {
      console.error('Erreur mes annonces:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const formatPrice = price =>
    price ? `${Number(price).toLocaleString('fr-FR')} FCFA` : 'Prix non défini';

  const hasPromotion = item =>
    item.prix_promo && item.prix_promo !== item.prix_normal && item.prix_promo !== '0';

  const cleanBase64 = str => str?.replace(/^data:[a-z\/]+;base64,/, '').trim();

  const handleMediaPress = (annonceId, index) => {
    setSelectedMediaIndex(prev => ({ ...prev, [annonceId]: index }));
  };

  const openFullScreen = async (item, mediaIndex = 0) => {
    await stopAllVideos();
    setFullScreenMedia({ item, mediaIndex });
  };

  const closeFullScreen = () => setFullScreenMedia(null);

  const navigateFullScreen = direction => {
    if (!fullScreenMedia) return;
    const { item, mediaIndex } = fullScreenMedia;
    const medias = item.medias || [];
    if (medias.length <= 1) return;

    const newIndex = direction === 'next'
      ? (mediaIndex + 1) % medias.length
      : (mediaIndex - 1 + medias.length) % medias.length;

    setFullScreenMedia({ item, mediaIndex: newIndex });
  };

  const stopAllVideos = async () => {
    for (const key in videoRefs.current) {
      if (videoRefs.current[key]?.stopAsync) {
        try { await videoRefs.current[key].stopAsync(); } catch (_) {}
      }
    }
  };

  // OPTIMISÉ : Chargement progressif + taille réduite
  const renderMedia = (item) => {
    const medias = item.medias && item.medias.length > 0 ? item.medias : null;
    const currentIndex = selectedMediaIndex[item.id_annonce] || 0;
    const current = medias
      ? medias[currentIndex]
      : { type_media: 'image', type_fichier: item.type, fichier64: item.photo64 };

    const uri = `data:${current.type_fichier || 'image/jpeg'};base64,${cleanBase64(current.fichier64)}`;
    const isVideo = current.type_media === 'video';

    return (
      <TouchableOpacity
        activeOpacity={0.95}
        onPress={() => openFullScreen(item, currentIndex)}
        style={styles.mediaWrapper}
      >
        {isVideo ? (
          <View style={styles.videoPlaceholder}>
            <Ionicons name="play-circle" size={40} color="white" />
            <Text style={styles.videoText}>VIDÉO</Text>
          </View>
        ) : (
          <Image
            source={{ uri }}
            style={styles.gridImage}
            resizeMode="cover"
            progressiveRenderingEnabled={true}
            fadeDuration={300}
          />
        )}

        <LinearGradient colors={['transparent', 'rgba(0,0,0,0.5)']} style={styles.gradient} />

        {hasPromotion(item) && (
          <View style={styles.promoBadge}>
            <Text style={styles.promoText}>PROMO</Text>
          </View>
        )}

        {medias && medias.length > 1 && (
          <View style={styles.mediaCount}>
            <Text style={styles.mediaCountText}>{currentIndex + 1}/{medias.length}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.gridCard}>
      {/* Média */}
      {renderMedia(item)}

      {/* Contenu */}
      <View style={styles.gridContent}>
        <Text style={styles.gridTitle} numberOfLines={2}>
          {item.titre || 'Sans titre'}
        </Text>

        <View style={styles.gridPriceRow}>
          {hasPromotion(item) ? (
            <>
              <Text style={styles.gridPromoPrice}>{formatPrice(item.prix_promo)}</Text>
              <Text style={styles.gridOldPrice}>{formatPrice(item.prix_normal)}</Text>
            </>
          ) : (
            <Text style={styles.gridNormalPrice}>{formatPrice(item.prix_normal)}</Text>
          )}
        </View>

        <View style={styles.gridStats}>
          <View style={styles.gridStat}>
            <Ionicons name="eye" size={12} color="#888" />
            <Text style={styles.gridStatText}>{item.vue || 0}</Text>
          </View>
          <View style={styles.gridStat}>
            <Ionicons name="people-outline" size={12} color="#888" />
            <Text style={styles.gridStatText}>{item.audience || 0}</Text>
          </View>
        </View>
      </View>
    </View>
  );

  // Grille 2 colonnes
  const renderGridItem = ({ item, index }) => {
    if (index % 2 === 0 && filteredListe[index + 1]) {
      return (
        <View style={styles.row}>
          {renderItem({ item: filteredListe[index] })}
          {renderItem({ item: filteredListe[index + 1] })}
        </View>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#FF6B00" />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Recherche */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher dans vos annonces..."
          value={rechercher}
          onChangeText={setRechercher}
        />
        {rechercher ? (
          <TouchableOpacity onPress={() => setRechercher('')}>
            <Ionicons name="close-circle" size={20} color="#888" />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Liste en grille 2x2 */}
      <FlatList
        data={filteredListe}
        renderItem={renderGridItem}
        keyExtractor={(_, index) => index.toString()}
        contentContainerStyle={styles.gridList}
        refreshing={refreshing}
        onRefresh={getAnnonce}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="car-outline" size={80} color="#ccc" />
            <Text style={styles.emptyText}>
              {rechercher ? 'Aucune annonce trouvée' : 'Aucune annonce publiée'}
            </Text>
          </View>
        }
      />

      {/* Plein écran */}
      {fullScreenMedia && (
        <Modal visible animationType="fade" statusBarTranslucent>
          <View style={styles.fullScreenContainer}>
            <StatusBar hidden />
            <TouchableOpacity style={styles.closeBtn} onPress={closeFullScreen}>
              <Ionicons name="close" size={34} color="white" />
            </TouchableOpacity>

            {fullScreenMedia.item.medias?.[fullScreenMedia.mediaIndex]?.type_media === 'video' ? (
              <Video
                source={{
                  uri: `data:${fullScreenMedia.item.medias[fullScreenMedia.mediaIndex].type_fichier};base64,${cleanBase64(fullScreenMedia.item.medias[fullScreenMedia.mediaIndex].fichier64)}`
                }}
                style={styles.fullScreenMedia}
                useNativeControls
                resizeMode="contain"
                shouldPlay
                isLooping
              />
            ) : (
              <Image
                source={{
                  uri: fullScreenMedia.item.medias?.[fullScreenMedia.mediaIndex]
                    ? `data:${fullScreenMedia.item.medias[fullScreenMedia.mediaIndex].type_fichier};base64,${cleanBase64(fullScreenMedia.item.medias[fullScreenMedia.mediaIndex].fichier64)}`
                    : `data:${fullScreenMedia.item.type};base64,${cleanBase64(fullScreenMedia.item.photo64)}`
                }}
                style={styles.fullScreenMedia}
                resizeMode="contain"
              />
            )}

            {fullScreenMedia.item.medias?.length > 1 && (
              <>
                <TouchableOpacity style={[styles.fsNavBtn, styles.fsPrev]} onPress={() => navigateFullScreen('prev')}>
                  <Ionicons name="chevron-back" size={40} color="white" />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.fsNavBtn, styles.fsNext]} onPress={() => navigateFullScreen('next')}>
                  <Ionicons name="chevron-forward" size={40} color="white" />
                </TouchableOpacity>
                <View style={styles.fsCounter}>
                  <Text style={styles.fsCounterText}>
                    {fullScreenMedia.mediaIndex + 1} / {fullScreenMedia.item.medias.length}
                  </Text>
                </View>
              </>
            )}
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 15,
    marginBottom: 10,
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 50,
    elevation: 4,
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 16, color: '#333' },
  gridList: { paddingHorizontal: 10, paddingBottom: 20 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  gridCard: {
    width: CARD_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
  },
  mediaWrapper: { position: 'relative', height: 160 },
  gridImage: { width: '100%', height: '100%' },
  videoPlaceholder: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoText: { color: 'white', fontSize: 12, marginTop: 8, fontWeight: 'bold' },
  gradient: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 60 },
  promoBadge: { position: 'absolute', top: 10, left: 10, backgroundColor: '#e74c3c', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  promoText: { color: 'white', fontSize: 10, fontWeight: 'bold' },
  mediaCount: { position: 'absolute', top: 10, right: 10, backgroundColor: 'rgba(0,0,0,0.7)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  mediaCountText: { color: 'white', fontSize: 10, fontWeight: 'bold' },
  gridContent: { padding: 10 },
  gridTitle: { fontSize: 13, fontWeight: 'bold', color: '#333', marginBottom: 6 },
  gridPriceRow: { flexDirection: 'row', alignItems: 'baseline', flexWrap: 'wrap' },
  gridPromoPrice: { fontSize: 15, fontWeight: 'bold', color: '#FF6B00', marginRight: 6 },
  gridOldPrice: { fontSize: 12, color: '#999', textDecorationLine: 'line-through' },
  gridNormalPrice: { fontSize: 15, fontWeight: 'bold', color: '#FF6B00' },
  gridStats: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  gridStat: { flexDirection: 'row', alignItems: 'center' },
  gridStatText: { fontSize: 11, color: '#888', marginLeft: 4 },

  // Plein écran
  fullScreenContainer: { flex: 1, backgroundColor: '#000', justifyContent: 'center' },
  closeBtn: { position: 'absolute', top: 40, right: 20, zIndex: 10, backgroundColor: 'rgba(0,0,0,0.5)', padding: 10, borderRadius: 30 },
  fullScreenMedia: { width: '100%', height: '100%' },
  fsNavBtn: { position: 'absolute', top: '50%', backgroundColor: 'rgba(0,0,0,0.5)', width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', marginTop: -30 },
  fsPrev: { left: 20 },
  fsNext: { right: 20 },
  fsCounter: { position: 'absolute', top: 50, left: 20, backgroundColor: 'rgba(0,0,0,0.7)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  fsCounterText: { color: 'white', fontWeight: 'bold', fontSize: 14 },

  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 15, fontSize: 16, color: '#666' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyText: { marginTop: 20, fontSize: 17, color: '#999', textAlign: 'center' },
});