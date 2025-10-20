import React, { useContext, useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Modal, Linking, Alert } from 'react-native';
import { GlobalContext } from '../config/GlobalUser';

const Menu = () => {
  const [liste, setListe] = useState([]);
  const [user] = useContext(GlobalContext);
  const [popularannonce, setPopularAnnonce] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingPopular, setLoadingPopular] = useState(true);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAnnonce, setSelectedAnnonce] = useState(null);

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
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }
        const data = await response.json();
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
    recent: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=200&h=100&fit=crop',
  };

  const openModal = (annonce) => {
    setSelectedAnnonce(annonce);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedAnnonce(null);
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
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Section */}
      <View style={styles.header}>
        <Image
          source={{ uri: imageUrls.header }}
          style={styles.headerImage}
          resizeMode="cover"
          onError={(e) => console.log('Header image failed to load')}
        />
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>Votre véhicule à crédit</Text>
          <Image
            source={{ uri: imageUrls.logo }}
            style={styles.logo}
            resizeMode="contain"
            onError={(e) => console.log('Logo failed to load')}
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
            <View key={index} style={styles.announcement}>
              <Image
                source={{ uri: `data:${item.type};base64,${item.photo64}` }}
                style={styles.announcementImage}
                resizeMode="cover"
                onError={(e) => console.log('Image failed to load')}
              />
              
              <Text style={styles.price}>{item.prix_normal} FCFA</Text>
              <Text style={styles.price}>{item.prix_promo} FCFA</Text>
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
                <View key={`${chunkIndex}-${index}`} style={styles.popularAnnouncement}>
                  <Image
                    source={{ uri: `data:${item.type};base64,${item.photo64}` }}
                    style={styles.popularImage}
                    resizeMode="cover"
                    onError={(e) => console.log('Popular image failed to load')}
                  />
                  <View style={styles.popularContent}>
                    <Text style={styles.popularTitle} numberOfLines={2}>
                      {item.description}
                    </Text>
                    <Text style={styles.popularPrice}>{item.prix_normal} FCFA</Text>
                    <Text style={styles.popularLocation}>Abidjan, Cocody</Text>
                    <View style={styles.buttonContainer}>
                      <TouchableOpacity style={styles.detailsButton}>
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
              <TouchableOpacity style={styles.modalButton} onPress={handleWhatsApp}>
                <Image
                  source={{ uri: 'https://img.icons8.com/color/48/000000/whatsapp.png' }}
                  style={styles.modalIcon}
                  resizeMode="contain"
                />
                <Text style={styles.modalButtonText}>WhatsApp</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButton} onPress={handleCall}>
                <Image
                  source={{ uri: 'https://img.icons8.com/color/48/000000/phone.png' }}
                  style={styles.modalIcon}
                  resizeMode="contain"
                />
                <Text style={styles.modalButtonText}>Appeler</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButton} onPress={handleMessage}>
                <Image
                  source={{ uri: 'https://img.icons8.com/color/48/000000/sms.png' }}
                  style={styles.modalIcon}
                  resizeMode="contain"
                />
                <Text style={styles.modalButtonText}>Message</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
              <Text style={styles.closeButtonText}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
  announcementImage: {
    width: 120,
    height: 80,
    marginBottom: 8,
    borderRadius: 6,
  },
  price: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FF6B00',
    marginBottom: 4,
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
    marginBottom: 20,
  },
  popularRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  popularAnnouncement: {
    width: '48%',
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
  popularImage: {
    width: '100%',
    height: 120,
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
    marginBottom: 4,
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
  },
  modalIcon: {
    width: 40,
    height: 40,
    marginBottom: 8,
  },
  modalButtonText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
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
});

export default Menu;