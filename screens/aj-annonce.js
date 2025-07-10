import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ScrollView, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { GlobalContext } from '../config/GlobalUser';

export default function AjoutAnnonce() {
  // États
  const [titre, setTitre] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState([]);
  const [id_annonce, Id_Annonce] = useState('');
  const [prix_promo, setPrix_Promo] = useState('');
  const [prix_normal, setPrix_Normal] = useState('');
  const [user, setUser] = useContext(GlobalContext);

  useEffect(() => {
    Id_Annonce(generateId());
  }, []);

  const generateId = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  const handlePriceChange = (text, setPrice) => {
    const numericValue = text.replace(/[^0-9]/g, '');
    setPrice(numericValue);
  };

  const displayFormattedPrice = (price) => {
    if (!price) return '0';
    return parseInt(price).toLocaleString('fr-FR');
  };

  // Prendre une photo
  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission requise", "Autorisez l'accès à la caméra pour continuer.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImages([result.assets[0].uri]);
    }
  };

  // Choisir une image
  const choisirImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission requise', 'Autorisez l’accès à la galerie pour continuer.');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImages([result.assets[0].uri]);
    }
  };

  const supprimerImage = () => {
    setImages([]);
  };

  const validerAnnonce = async () => {
    if (!titre || !description) {
      Alert.alert('Champs manquants', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    const formData = new FormData();
    formData.append("id_annonce", id_annonce);
    formData.append("titre", titre);
    formData.append("description", description);
    formData.append("prix_normal", prix_normal);
    formData.append("prix_promo", prix_promo);

    images.forEach((uri, index) => {
      formData.append("sai_photo", {
        uri,
        name: `image_${index}.jpg`,
        type: 'image/jpeg',
      });
    });

    try {
      const response = await fetch("https://epencia.net/app/souangah/AjouterAnnonce.php", {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      const result = await response.text();
      Alert.alert("Réponse du serveur", result);
      console.log(result);

      setTitre('');
      setDescription('');
      setPrix_Normal('');
      setPrix_Promo('');
      setImages([]);
      Id_Annonce(generateId());
    } catch (error) {
      Alert.alert('Erreur', error.toString());
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.titre}>Publier une annonce</Text>

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
        <Text style={styles.label}>Prix Normal</Text>
        <TextInput
          style={styles.input}
          value={prix_normal}
          onChangeText={(text) => handlePriceChange(text, setPrix_Normal)}
          placeholder="Entrez le prix normal"
          keyboardType="numeric"
        />
        <Text style={styles.formattedPrice}>
          {displayFormattedPrice(prix_normal)} FCFA
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Prix Promotionnel</Text>
        <TextInput
          style={styles.input}
          value={prix_promo}
          onChangeText={(text) => handlePriceChange(text, setPrix_Promo)}
          placeholder="Entrez le prix promo"
          keyboardType="numeric"
        />
        <Text style={styles.formattedPrice}>
          {displayFormattedPrice(prix_promo)} FCFA
        </Text>
      </View>

      {prix_normal && prix_promo && (
        <View style={styles.section}>
          <Text style={styles.discountText}>
            Réduction: {Math.round((1 - prix_promo/prix_normal) * 100)}%
          </Text>
        </View>
      )}

      {/* Sélection d'Images */}
      <View style={styles.section}>
        <Text style={styles.label}>Photo (max 1)</Text>
        <View style={styles.imagesContainer}>
          {images.map((uri, index) => (
            <View key={index} style={styles.imageWrapper}>
              <Image source={{ uri }} style={styles.image} />
              <TouchableOpacity 
                style={styles.deleteButton} 
                onPress={supprimerImage}
              >
                <Ionicons name="close" size={20} color="white" />
              </TouchableOpacity>
            </View>
          ))}
          {images.length === 0 && (
            <>
              <TouchableOpacity style={styles.addImageButton} onPress={takePhoto}>
                <Ionicons name="camera" size={25} color="#666" />
                <Text style={styles.addImageText}>Prendre une photo</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.addImageButton} onPress={choisirImage}>
                <Ionicons name="images" size={25} color="#666" />
                <Text style={styles.addImageText}>Galerie</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      <TouchableOpacity style={styles.validerButton} onPress={validerAnnonce}>
        <Text style={styles.validerButtonText}>Publier l'annonce</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#f5f5f5',
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
  formattedPrice: {
    fontSize: 16,
    color: '#333',
    marginTop: 5,
  },
  discountText: {
    fontSize: 16,
    color: 'green',
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 10,
  },
  imagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  imageWrapper: {
    width: 300,
    height: 200,
    marginRight: 10,
    marginBottom: 10,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  deleteButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addImageButton: {
    width: 150,
    height: 70,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    marginRight: 15,
  },
  addImageText: {
    marginTop: 5,
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  validerButton: {
    backgroundColor: '#4CAF50',
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
});
