import React, { useState, useEffect, useContext } from 'react';
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
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Video } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { GlobalContext } from '../config/GlobalUser';

const { width: screenWidth } = Dimensions.get('window');
const CARD_WIDTH = (screenWidth - 30) / 2;

export default function AnnoncesProfil({ route, navigation }) {
  const { userId } = route.params;
  const [liste, setListe] = useState([]);
  const [filteredListe, setFilteredListe] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [rechercher, setRechercher] = useState('');

  // Plein écran
  const [fullScreenData, setFullScreenData] = useState(null);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);

  useEffect(() => {
    getAnnonces();
  }, []);

  useEffect(() => {
    const filtered = liste.filter(item =>
      (item.titre?.toLowerCase() || '').includes(rechercher.toLowerCase()) ||
      (item.description?.toLowerCase() || '').includes(rechercher.toLowerCase())
    );
    setFilteredListe(filtered);
  }, [rechercher, liste]);

   const getAnnonces = async () => {
  try {
    setRefreshing(true);
    setLoading(true);

    const url = `https://epencia.net/app/souangah/annonce/annonces-par-utilisateur.php?user_id=${userId}`;
    console.log('Appel API vers :', url);

    const response = await fetch(url);
    const result = await response.json();

    console.log('Résultat complet :', result);

    // VERSION ULTRA SOLIDE – marche dans tous les cas
    let annoncesArray = [];

    if (result && result.status === 'success' && Array.isArray(result.annonces)) {
      annoncesArray = result.annonces;
    } else if (Array.isArray(result)) {
      annoncesArray = result;
    } else if (result && Array.isArray(result.annonces)) {
      annoncesArray = result.annonces;
    }

    console.log('Nombre d\'annonces détectées :', annoncesArray.length);

    setListe(annoncesArray);
    setFilteredListe(annoncesArray);

  } catch (error) {
    console.error('Erreur totale :', error);
    alert('Erreur réseau : ' + error.message);
    setListe([]);
    setFilteredListe([]);
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
};

  const formatPrice = price =>
    price ? `${Number(price).toLocaleString('fr-FR')} FCFA` : 'Prix non défini';

  const hasPromotion = item =>
    item.prix_promo && item.prix_promo !== '0' && item.prix_promo !== item.prix_normal;

  const cleanBase64 = str => str?.replace(/^data:[a-z\/]+;base64,/, '').trim();

  const openFullScreen = (item, index = 0) => {
    setFullScreenData({ item });
    setCurrentMediaIndex(index);
  };

  const closeFullScreen = () => setFullScreenData(null);

  const navigateMedia = direction => {
    if (!fullScreenData) return;
    const medias = fullScreenData.item.medias || [];
    const total = medias.length || 1;
    let newIndex = currentMediaIndex + (direction === 'next' ? 1 : -1);
    if (newIndex < 0) newIndex = total - 1;
    if (newIndex >= total) newIndex = 0;
    setCurrentMediaIndex(newIndex);
  };

  const renderGridMedia = (item) => {
    const medias = item.medias && item.medias.length > 0 ? item.medias : null;
    const totalMedias = medias ? medias.length : 1;
    const media = medias
      ? medias[0]
      : { type_media: 'image', type_fichier: item.type, fichier64: item.photo64 };

    const isVideo = media.type_media === 'video';
    const uri = `data:${media.type_fichier || 'image/jpeg'};base64,${cleanBase64(media.fichier64)}`;

    return (
      <TouchableOpacity
        activeOpacity={0.95}
        onPress={() => openFullScreen(item, 0)}
        style={styles.mediaWrapper}
      >
        {isVideo ? (
          <View style={styles.videoPlaceholder}>
            <Ionicons name="play-circle" size={48} color="#fff" />
            <Text style={styles.videoText}>VIDÉO</Text>
          </View>
        ) : (
          <Image
            source={{ uri }}
            style={styles.gridImage}
            resizeMode="cover"
            progressiveRenderingEnabled
            fadeDuration={200}
          />
        )}

        <LinearGradient colors={['transparent', 'rgba(0,0,0,0.5)']} style={styles.gradient} />

        {hasPromotion(item) && (
          <View style={styles.promoBadge}>
            <Text style={styles.promoText}>PROMO</Text>
          </View>
        )}

        {totalMedias > 1 && (
          <View style={styles.mediaCount}>
            <Text style={styles.mediaCountText}>1/{totalMedias}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.gridCard}
      onPress={() => navigation.navigate('DetailsAnnonce', { annonceId: item.id_annonce })}
    >
      {renderGridMedia(item)}

      <View style={styles.gridContent}>
        <Text style={styles.gridTitle} numberOfLines={2}>
          {item.titre || 'Sans titre'}
        </Text>

        <View style={styles.priceRow}>
          {hasPromotion(item) ? (
            <>
              <Text style={styles.promoPrice}>{formatPrice(item.prix_promo)}</Text>
              <Text style={styles.oldPrice}>{formatPrice(item.prix_normal)}</Text>
            </>
          ) : (
            <Text style={styles.normalPrice}>{formatPrice(item.prix_normal)}</Text>
          )}
        </View>

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Ionicons name="eye" size={12} color="#888" />
            <Text style={styles.statText}>{item.vue || 0}</Text>
          </View>
          <View style={styles.stat}>
            <Ionicons name="people-outline" size={12} color="#888" />
            <Text style={styles.statText}>{item.audience || 0}</Text>
          </View>
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.callBtn}
            onPress={() => Linking.openURL(`tel:${item.telephone}`)}
          >
            <Ionicons name="call" size={16} color="#3378df" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.whatsappBtn}
            onPress={() => Linking.openURL(`https://wa.me/${item.telephone}`)}
          >
            <Ionicons name="logo-whatsapp" size={18} color="#25D366" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderRow = ({ item, index }) => {
    if (index % 2 !== 0) return null;
    const nextItem = filteredListe[index + 1];
    return (
      <View style={styles.row}>
        {renderItem({ item })}
        {nextItem && renderItem({ item: nextItem })}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#FF6B00" />
        <Text style={styles.loadingText}>Chargement des annonces...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>

      {/* En-tête */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Annonces de cet utilisateur</Text>
        <Text style={styles.headerSubtitle}>{liste.length} annonce(s) publiée(s)</Text>
      </View>

      {/* Barre de recherche */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher dans ses pour cette personne..."
          value={rechercher}
          onChangeText={setRechercher}
        />
        {rechercher ? (
          <TouchableOpacity onPress={() => setRechercher('')}>
            <Ionicons name="close-circle" size={20} color="#888" />
          </TouchableOpacity>
        ) : null}
      </View>

      <FlatList
        data={filteredListe}
        renderItem={renderRow}
        keyExtractor={(_, i) => i.toString()}
        contentContainerStyle={styles.list}
        refreshing={refreshing}
        onRefresh={getAnnonces}   
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="sad-outline" size={80} color="#ccc" />
            <Text style={styles.emptyText}>
              {rechercher
                ? 'Aucune annonce trouvée'
                : 'Cet utilisateur n\'a publié aucune annonce pour le moment'}
            </Text>
          </View>
        }
      />

      {/* Modal plein écran */}
      <Modal visible={!!fullScreenData} animationType="fade" statusBarTranslucent>
        <View style={styles.fullScreen}>
          <StatusBar hidden />
          <TouchableOpacity style={styles.closeBtn} onPress={closeFullScreen}>
            <Ionicons name="close" size={36} color="#fff" />
          </TouchableOpacity>

          {fullScreenData && (
            (() => {
              const item = fullScreenData.item;
              const medias = item.medias || [];
              const media = medias[currentMediaIndex] || {
                type_media: 'image',
                type_fichier: item.type,
                fichier64: item.photo64,
              };
              const uri = `data:${media.type_fichier || 'image/jpeg'};base64,${cleanBase64(media.fichier64)}`;

              return media.type_media === 'video' ? (
                <Video
                  source={{ uri }}
                  style={styles.fullMedia}
                  useNativeControls
                  resizeMode="contain"
                  shouldPlay
                  isLooping
                />
              ) : (
                <Image source={{ uri }} style={styles.fullMedia} resizeMode="contain" />
              );
            })()
          )}

          {fullScreenData?.item.medias?.length > 1 && (
            <>
              <TouchableOpacity style={[styles.navBtn, styles.prev]} onPress={() => navigateMedia('prev')}>
                <Ionicons name="chevron-back" size={44} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.navBtn, styles.next]} onPress={() => navigateMedia('next')}>
                <Ionicons name="chevron-forward" size={44} color="#fff" />
              </TouchableOpacity>
              <View style={styles.counter}>
                <Text style={styles.counterText}>
                  {currentMediaIndex + 1} / {fullScreenData.item.medias.length}
                </Text>
              </View>
            </>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },

  header: {
    backgroundColor: '#fff',
    padding: 18,
    paddingTop: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginTop: 30
  },
  headerTitle: { fontSize: 19, fontWeight: 'bold', color: '#333' },
  headerSubtitle: { fontSize: 14, color: '#666', marginTop: 4 },

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

  list: { paddingHorizontal: 10, paddingBottom: 30 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },

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
    backgroundColor: '#222',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoText: { color: '#fff', marginTop: 8, fontSize: 12, fontWeight: 'bold' },
  gradient: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 70 },
  promoBadge: { position: 'absolute', top: 10, left: 10, backgroundColor: '#e74c3c', paddingHorizontal: 9, paddingVertical: 5, borderRadius: 10 },
  promoText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  mediaCount: { position: 'absolute', top: 10, right: 10, backgroundColor: 'rgba(0,0,0,0.7)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  mediaCountText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },

  gridContent: { padding: 10 },
  gridTitle: { fontSize: 13.5, fontWeight: 'bold', color: '#333', marginBottom: 6 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', flexWrap: 'wrap' },
  promoPrice: { fontSize: 15, fontWeight: 'bold', color: '#FF6B00', marginRight: 6 },
  oldPrice: { fontSize: 12, color: '#999', textDecorationLine: 'line-through' },
  normalPrice: { fontSize: 15, fontWeight: 'bold', color: '#FF6B00' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6, marginBottom: 8 },
  stat: { flexDirection: 'row', alignItems: 'center' },
  statText: { fontSize: 11, color: '#888', marginLeft: 4 },
  actionsRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 8 },
  callBtn: { padding: 8, backgroundColor: '#e3f2fd', borderRadius: 20 },
  whatsappBtn: { padding: 8, backgroundColor: '#e8f5e9', borderRadius: 20 },

  fullScreen: { flex: 1, backgroundColor: '#000', justifyContent: 'center' },
  closeBtn: { position: 'absolute', top: 40, right: 20, zIndex: 10, backgroundColor: 'rgba(0,0,0,0.5)', padding: 10, borderRadius: 30 },
  fullMedia: { width: '100%', height: '100%' },
  navBtn: { position: 'absolute', top: '50%', backgroundColor: 'rgba(0,0,0,0.5)', width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', marginTop: -30 },
  prev: { left: 20 },
  next: { right: 20 },
  counter: { position: 'absolute', top: 50, left: 20, backgroundColor: 'rgba(0,0,0,0.7)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  counterText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },

  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f9fa' },
  loadingText: { marginTop: 15, fontSize: 16, color: '#666' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyText: { marginTop: 20, fontSize: 17, color: '#999', textAlign: 'center' },
});