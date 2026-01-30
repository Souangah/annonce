import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ScrollView, Alert, Modal, Dimensions } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { GlobalContext } from '../config/GlobalUser';
import { Picker } from '@react-native-picker/picker';
import { Video } from 'expo-av';

export default function AjoutAnnonce() {
  const [titre, setTitre] = useState('');
  const [description, setDescription] = useState('');
  const [medias, setMedias] = useState([]);
  const [id_annonce, Id_Annonce] = useState('');
  const [prix_promo, setPrix_Promo] = useState('');
  const [prix_normal, setPrix_Normal] = useState('');
  const [user, setUser] = useContext(GlobalContext);
  const [audience, setAudience] = useState('');
  const [telephone, setTelephone] = useState('');
  const [prix_annonce, setPrix_Annonce] = useState('');
  const [showMainModal, setShowMainModal] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [showMediaViewer, setShowMediaViewer] = useState(false);
  const [typeannonce, setTypeAnnonce] = useState([]);
  const [selectedTypeAnnonce, setSelectedTypeAnnonce] = useState('');

  // Liste des type annonces
  useEffect(() => {
    getTypeAnnonce();
  }, []);

  const getTypeAnnonce = async () => {
   
      const response = await fetch('https://epencia.net/app/souangah/annonce/type-annonce.php');
      const result = await response.json();
      setTypeAnnonce(result);
      
   
  };

  useEffect(() => {
    Id_Annonce(generateId());
    calculerPrixDepuisAudience(audience);
  }, []);

  const generateId = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  const calculerPrixDepuisAudience = (val) => {
    const prix = parseInt(val) * 30;
    setPrix_Annonce(prix.toString());
  };

  const handlePriceChange = (text, setPrice) => {
    const numericValue = text.replace(/[^0-9]/g, '');
    setPrice(numericValue);
  };

  // CORRECTION DE L'ERREUR ICI
  const displayFormattedPrice = (price) => {
    if (!price) return '0';
    
    // Vérifier que price est une chaîne de caractères
    const priceStr = String(price);
    
    // Supprimer les caractères non numériques
    const numericValue = priceStr.replace(/[^0-9]/g, '');
    
    // Convertir en nombre
    const numericPrice = parseInt(numericValue);
    
    // Vérifier si c'est un nombre valide
    if (isNaN(numericPrice)) {
      return '0';
    }
    
    // Formater le nombre
    return numericPrice.toLocaleString('fr-FR');
  };

  // Vérifier si on peut ajouter plus de médias
  const canAddMoreMedias = () => {
    return medias.length < 4;
  };

  // Prendre une photo avec la caméra
  const takePhoto = async () => {
    if (!canAddMoreMedias()) {
      Alert.alert("Limite atteinte", "Vous ne pouvez ajouter que 4 médias maximum.");
      setShowMainModal(false);
      return;
    }

    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission requise", "Autorisez l'accès à la caméra pour continuer.");
      setShowMainModal(false);
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });

    if (!result.canceled) {
      const newMedia = {
        uri: result.assets[0].uri,
        type: 'image',
        name: `image_${Date.now()}.jpg`,
        id: Date.now().toString()
      };
      setMedias(prev => [...prev, newMedia]);
    }
    setShowMainModal(false);
  };

  // Prendre une vidéo avec la caméra
  const takeVideo = async () => {
    if (!canAddMoreMedias()) {
      Alert.alert("Limite atteinte", "Vous ne pouvez ajouter que 4 médias maximum.");
      setShowMainModal(false);
      return;
    }

    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission requise", "Autorisez l'accès à la caméra pour continuer.");
      setShowMainModal(false);
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
      videoMaxDuration: 30,
    });

    if (!result.canceled) {
      const newMedia = {
        uri: result.assets[0].uri,
        type: 'video',
        name: `video_${Date.now()}.mp4`,
        id: Date.now().toString()
      };
      setMedias(prev => [...prev, newMedia]);
    }
    setShowMainModal(false);
  };

  // Choisir depuis la galerie (images et vidéos mélangés)
  const choisirMedia = async () => {
    if (!canAddMoreMedias()) {
      Alert.alert("Limite atteinte", "Vous ne pouvez ajouter que 4 médias maximum.");
      setShowMainModal(false);
      return;
    }

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission requise', 'Autorisez l\'accès à la galerie pour continuer.');
      setShowMainModal(false);
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
      videoMaxDuration: 30,
      allowsMultipleSelection: true,
      selectionLimit: 4 - medias.length
    });

    if (!result.canceled) {
      const newMedias = result.assets.map((asset, index) => ({
        uri: asset.uri,
        type: asset.type === 'video' ? 'video' : 'image',
        name: asset.type === 'video' ? `video_${Date.now()}_${index}.mp4` : `image_${Date.now()}_${index}.jpg`,
        id: `${Date.now()}_${index}`
      }));
      
      setMedias(prev => [...prev, ...newMedias]);
    }
    setShowMainModal(false);
  };

  // Supprimer un média spécifique
  const supprimerMedia = (mediaId) => {
    setMedias(prev => prev.filter(media => media.id !== mediaId));
  };

  // Supprimer tous les médias
  const supprimerTousMedias = () => {
    setMedias([]);
  };

  // Ouvrir le visualiseur de média
  const ouvrirMedia = (media) => {
    setSelectedMedia(media);
    setShowMediaViewer(true);
  };

  // Fermer le visualiseur de média
  const fermerMediaViewer = () => {
    setShowMediaViewer(false);
    setSelectedMedia(null);
  };

  const validerAnnonce = async () => {
    if (!titre || !description || !prix_normal || !prix_promo || medias.length === 0 || !selectedTypeAnnonce) {
      Alert.alert('Champs manquants', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    const formData = new FormData();
    formData.append("id_annonce", id_annonce);
    formData.append("titre", titre);
    formData.append("description", description);
    formData.append("prix_normal", prix_normal);
    formData.append("prix_promo", prix_promo);
    formData.append("user_id", user.user_id);
    formData.append("audience", audience);
    formData.append("prix_annonce", prix_annonce);
    formData.append("telephone", telephone);
    formData.append("code_type", selectedTypeAnnonce);

    // Ajouter tous les médias
    medias.forEach((media, index) => {
      formData.append("sai_media[]", {
        uri: media.uri,
        name: media.name,
        type: media.type === 'video' ? 'video/mp4' : 'image/jpeg',
      });
      
      // Ajouter les informations du média pour la table media_annonce
      formData.append(`media_type_${index}`, media.type);
      formData.append(`media_name_${index}`, media.name);
    });

    formData.append("nombre_medias", medias.length.toString());

    try {
      const response = await fetch("https://epencia.net/app/souangah/annonce/AjouterAnnonce.php", {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      const result = await response.text();
      Alert.alert("Message", result);
      console.log(result);

      // Réinitialiser le formulaire
      setTitre('');
      setDescription('');
      setPrix_Normal('');
      setPrix_Promo('');
      setMedias([]);
      Id_Annonce(generateId());
      setAudience('');
      calculerPrixDepuisAudience('');
      setSelectedTypeAnnonce('');
      setTelephone('');
    } catch (error) {
      Alert.alert('Erreur', error.toString());
    }
  };

  // Fonction pour afficher la prévisualisation
  const renderMediaPreview = (media) => {
    if (media.type === 'image') {
      return <Image source={{ uri: media.uri }} style={styles.media} />;
    } else {
      return (
        <View style={styles.videoContainer}>
          <Ionicons name="videocam" size={30} color="#666" />
          <Text style={styles.videoText}>Vidéo</Text>
        </View>
      );
    }
  };

  // Afficher les emplacements vides pour la sélection
  const renderEmptySlots = () => {
    const emptySlots = [];
    const totalSlots = 4;
    const usedSlots = medias.length;
    
    for (let i = 0; i < totalSlots; i++) {
      if (i < usedSlots) {
        // Afficher le média existant
        const media = medias[i];
        emptySlots.push(
          <TouchableOpacity 
            key={media.id} 
            style={styles.mediaWrapper}
            onPress={() => ouvrirMedia(media)}
          >
            {renderMediaPreview(media)}
            <TouchableOpacity 
              style={styles.deleteButton} 
              onPress={(e) => {
                e.stopPropagation();
                supprimerMedia(media.id);
              }}
            >
              <Ionicons name="close" size={16} color="white" />
            </TouchableOpacity>
            <View style={styles.mediaBadge}>
              <Text style={styles.mediaBadgeText}>
                {media.type === 'video' ? 'VIDÉO' : 'IMAGE'}
              </Text>
            </View>
            <View style={styles.mediaIndex}>
              <Text style={styles.mediaIndexText}>{i + 1}</Text>
            </View>
            {media.type === 'video' && (
              <View style={styles.playIconContainer}>
                <Ionicons name="play" size={20} color="white" />
              </View>
            )}
          </TouchableOpacity>
        );
      } else {
        // Afficher un emplacement vide cliquable
        emptySlots.push(
          <TouchableOpacity 
            key={`empty-${i}`}
            style={styles.emptySlot}
            onPress={() => setShowMainModal(true)}
          >
            <Ionicons name="images" size={30} color="#666" />
            <Text style={styles.emptySlotText}>{i + 1}</Text>
          </TouchableOpacity>
        );
      }
    }
    
    return emptySlots;
  };

  // Modal principal pour les options
  const MainModal = () => (
    <Modal
      visible={showMainModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowMainModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Ajouter un média</Text>
          
          <TouchableOpacity 
            style={styles.modalOption} 
            onPress={() => {
              setShowMainModal(false);
              setTimeout(() => showCameraOptions(), 300);
            }}
          >
            <Ionicons name="camera" size={24} color="#007AFF" />
            <Text style={styles.modalOptionText}>Appareil photo</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.modalOption} 
            onPress={choisirMedia}
          >
            <Ionicons name="images" size={24} color="#007AFF" />
            <Text style={styles.modalOptionText}>Choisir dans la galerie</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.modalCancelButton} 
            onPress={() => setShowMainModal(false)}
          >
            <Text style={styles.modalCancelText}>Annuler</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  // Options pour l'appareil photo
  const showCameraOptions = () => {
    Alert.alert(
      "Appareil photo",
      "Que voulez-vous faire ?",
      [
        {
          text: "Prendre une photo",
          onPress: takePhoto
        },
        {
          text: "Prendre une vidéo",
          onPress: takeVideo
        },
        {
          text: "Annuler",
          style: "cancel"
        }
      ]
    );
  };

  // Modal pour visualiser les médias en plein écran
  const MediaViewerModal = () => (
    <Modal
      visible={showMediaViewer}
      transparent={true}
      animationType="fade"
      onRequestClose={fermerMediaViewer}
    >
      <View style={styles.mediaViewerOverlay}>
        <TouchableOpacity 
          style={styles.closeViewerButton} 
          onPress={fermerMediaViewer}
        >
          <Ionicons name="close" size={30} color="white" />
        </TouchableOpacity>
        
        {selectedMedia && (
          <View style={styles.mediaViewerContent}>
            {selectedMedia.type === 'image' ? (
              <Image 
                source={{ uri: selectedMedia.uri }} 
                style={styles.fullScreenMedia} 
                resizeMode="contain"
              />
            ) : (
              <Video
                source={{ uri: selectedMedia.uri }}
                style={styles.fullScreenMedia}
                useNativeControls
                resizeMode="contain"
                shouldPlay={false}
                isLooping={false}
              />
            )}
          </View>
        )}
        
        <TouchableOpacity 
          style={styles.deleteViewerButton} 
          onPress={() => {
            if (selectedMedia) {
              supprimerMedia(selectedMedia.id);
              fermerMediaViewer();
            }
          }}
        >
          <Ionicons name="trash" size={20} color="white" />
          <Text style={styles.deleteViewerText}>Supprimer</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.titre}>Créer une annonce</Text>

      <View style={styles.section}>
        <View style={styles.mediaHeader}>
          <Text style={styles.label}>Ajouter des (Images et Vidéos)</Text>
          <Text style={styles.mediaCounter}>
            {medias.length}/4 médias
          </Text>
        </View>
        
        {medias.length > 0 && (
          <TouchableOpacity style={styles.clearAllButton} onPress={supprimerTousMedias}>
            <Text style={styles.clearAllText}>Tout supprimer</Text>
          </TouchableOpacity>
        )}

        <View style={styles.mediaContainer}>
          {renderEmptySlots()}
        </View>

        {medias.length === 0 && (
          <Text style={styles.helperText}>
            Cliquez sur les emplacements pour ajouter des images ou vidéos
          </Text>
        )}

        {!canAddMoreMedias() && (
          <Text style={styles.limitText}>
            Maximum 4 médias atteint
          </Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Titre*</Text>
        <TextInput
          style={styles.input}
          placeholder="Titre de l'annonce"
          value={titre}
          onChangeText={setTitre}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Description*</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Décrivez votre annonce en détail..."
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>choisissez une categorie*</Text>
        
        {typeannonce && Array.isArray(typeannonce) && typeannonce.length > 0 ? (
          <View style={styles.typeAnnonceContainer}>
            {typeannonce.map((type, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.typeAnnonceButton,
                  selectedTypeAnnonce === type.code_type ? styles.typeAnnonceButtonSelected : styles.typeAnnonceButtonNormal
                ]}
                onPress={() => setSelectedTypeAnnonce(type.code_type)}
              >
                <Text 
                  style={[
                    styles.typeAnnonceButtonText,
                    selectedTypeAnnonce === type.code_type ? styles.typeAnnonceButtonTextSelected : styles.typeAnnonceButtonTextNormal
                  ]}
                >
                  {type.libelle_annonce}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <Text style={styles.noTypeText}>Chargement des types d'annonce...</Text>
        )}
        
        {selectedTypeAnnonce && (
          <Text style={styles.selectedTypeText}>
            Type sélectionné: {typeannonce.find(t => t.code_type === selectedTypeAnnonce)?.libelle_annonce || ''}
          </Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Numéro WhatsApp</Text>
        <TextInput
          style={styles.input}
          placeholder='Entrer votre numéro WhatsApp'
          value={telephone}
          onChangeText={setTelephone}
          keyboardType="phone-pad"
        />
      </View>

      <View style={styles.row}>
        <View style={styles.section}>
          <Text style={styles.label}>Prix Normal*</Text>
          <TextInput
            style={styles.input}
            value={prix_normal}
            onChangeText={(text) => handlePriceChange(text, setPrix_Normal)}
            placeholder="Entrez le prix normal"
            keyboardType="numeric"
          />
          {prix_normal && (
            <Text style={styles.formattedPrice}>
              {displayFormattedPrice(prix_normal)} FCFA
            </Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Prix Promotionnel*</Text>
          <TextInput
            style={styles.input}
            value={prix_promo}
            onChangeText={(text) => handlePriceChange(text, setPrix_Promo)}
            placeholder="Entrez le prix promo"
            keyboardType="numeric"
          />
          {prix_promo && (
            <Text style={styles.formattedPrice}>
              {displayFormattedPrice(prix_promo)} FCFA
            </Text>
          )}
        </View>
      </View>

      {prix_normal && prix_promo && (
        <View style={styles.section}>
          <Text style={styles.discountText}>
            Réduction: {Math.round(((parseInt(prix_normal) - parseInt(prix_promo)) / parseInt(prix_normal)) * 100)}%
          </Text>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.label}>Audience*</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={audience}
            onValueChange={(itemValue) => {
              setAudience(itemValue);
              calculerPrixDepuisAudience(itemValue);
            }}
            style={styles.picker}
          >
            <Picker.Item label="1 à 3 personnes" value="2" />
            <Picker.Item label="1 à 10 personnes" value="10" />
            <Picker.Item label="1 à 50 personnes" value="50" />
            <Picker.Item label="1 à 100 personnes" value="100" />
          </Picker>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Prix à payer*</Text>
        <TextInput
          style={styles.input}
          placeholder="Prix à payer pour publier"
          value={displayFormattedPrice(prix_annonce)}
          editable={false}
        />
        {prix_annonce && (
          <Text style={styles.priceDetails}>
            {audience ? `${audience} personnes × 30 FCFA = ${displayFormattedPrice(prix_annonce)} FCFA` : ''}
          </Text>
        )}
      </View>

      <TouchableOpacity style={styles.validerButton} onPress={validerAnnonce}>
        <Text style={styles.validerButtonText}>Publier l'annonce</Text>
      </TouchableOpacity>

      {/* Modals */}
      <MainModal />
      <MediaViewerModal />
    </ScrollView>
  );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#f5f5f5',
    marginTop: 30,
  },
  titre: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  discountText: {
    fontSize: 16,
    color: 'green',
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 10,
  },
  formattedPrice: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
    fontStyle: 'italic',
  },
  priceDetails: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
    fontStyle: 'italic',
  },
  mediaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  mediaCounter: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  mediaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  mediaWrapper: {
    width: 100,
    height: 100,
    marginRight: 10,
    marginBottom: 10,
    position: 'relative',
  },
  emptySlot: {
    width: 100,
    height: 100,
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
  },
  emptySlotText: {
    marginTop: 5,
    fontSize: 12,
    color: '#666',
    fontWeight: 'bold',
  },
  media: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  videoContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  videoText: {
    marginTop: 5,
    fontSize: 10,
    color: '#666',
  },
  deleteButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: 'red',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  mediaBadge: {
    position: 'absolute',
    bottom: 5,
    left: 5,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  mediaBadgeText: {
    color: 'white',
    fontSize: 8,
    fontWeight: 'bold',
  },
  mediaIndex: {
    position: 'absolute',
    top: 5,
    left: 5,
    backgroundColor: 'rgba(0,0,0,0.7)',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediaIndexText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  playIconContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -10 }, { translateY: -10 }],
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearAllButton: {
    alignSelf: 'flex-end',
    padding: 8,
    backgroundColor: '#ff6b6b',
    borderRadius: 6,
    marginBottom: 10,
  },
  clearAllText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  helperText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 5,
  },
  limitText: {
    fontSize: 12,
    color: '#ff6b6b',
    fontWeight: '600',
    marginTop: 5,
  },
  validerButton: {
    backgroundColor: '#000000',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 60,
  },
  validerButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 5,
  },
  pickerContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    overflow: 'hidden',
  },
  picker: {
    height: 60,
    width: '100%',
  },
  // Styles pour les types d'annonce
  typeAnnonceContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 5,
  },
  typeAnnonceButton: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    minWidth: 100,
    alignItems: 'center',
  },
  typeAnnonceButtonNormal: {
    backgroundColor: 'white',
    borderColor: '#ddd',
  },
  typeAnnonceButtonSelected: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  typeAnnonceButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  typeAnnonceButtonTextNormal: {
    color: '#333',
  },
  typeAnnonceButtonTextSelected: {
    color: 'white',
  },
  noTypeText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 10,
  },
  selectedTypeText: {
    fontSize: 14,
    color: '#000000',
    fontWeight: '600',
    marginTop: 10,
    textAlign: 'center',
  },
  // Styles pour les modals
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    width: '80%',
    maxWidth: 300,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalOptionText: {
    fontSize: 16,
    marginLeft: 15,
    color: '#333',
  },
  modalCancelButton: {
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  modalCancelText: {
    fontSize: 16,
    color: '#ff3b30',
    fontWeight: '600',
  },
  // Styles pour le visualiseur de médias
  mediaViewerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediaViewerContent: {
    width: width,
    height: height * 0.8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenMedia: {
    width: '100%',
    height: '100%',
  },
  closeViewerButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 5,
  },
  deleteViewerButton: {
    position: 'absolute',
    bottom: 130,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,0,0,0.7)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
  },
  deleteViewerText: {
    color: 'white',
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
  },
});