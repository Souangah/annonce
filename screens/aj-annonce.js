import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ScrollView, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function AjoutAnnonce(){
  // États pour les champs du formulaire
  const [titre, setTitre] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState([]);
  const [date, setDate] = useState(new Date());
  const [heure, setHeure] = useState(new Date());
  const [idAnnonce, setIdAnnonce] = useState('');
  
  // États pour les sélecteurs de date/heure
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Générer un ID aléatoire lors du premier rendu
  useEffect(() => {
    setIdAnnonce(generateId());
  }, []);

  // Fonction pour générer un ID aléatoire
  const generateId = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  // Sélection d'images
  const choisirImage = async () => {
    if (images.length >= 1) {
      Alert.alert('Maximum atteint', 'Vous ne pouvez ajouter que 5 images maximum');
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission refusée', 'Désolé, nous avons besoin des permissions pour accéder à vos photos.');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImages([...images, result.assets[0].uri]);
    }
  };

  // Supprimer une image
  const supprimerImage = (index) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  // Gestion du changement de date
  const onChangeDate = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  // Gestion du changement d'heure
  const onChangeTime = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setHeure(selectedTime);
    }
  };

  // Validation et soumission du formulaire
  const validerAnnonce = async() => {
    if (!titre || !description) {
      Alert.alert('Champs manquants', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (images.length === 0) {
      Alert.alert('Image manquante', 'Veuillez ajouter au moins une image');
      return;
    }

    // Formatage de la date et de l'heure
    const dateFormatee = date.toLocaleDateString('fr-FR');
    const heureFormatee = heure.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

   
  const dateISO = date.toISOString().split('T')[0]; // Format: YYYY-MM-DD
  const heureISO = heure.toTimeString().split(' ')[0]; // Format: HH:MM:SS

    const formData = new FormData();
    formData.append("id_annonce", id_annonce),
    formData.append("titre", titre),
    formData.append("description", description),
    formData.append("date", dateISO),
    formData.append("heure", heureISO),
     formData.append('images', {
      uri: image.uri,
      name: image.filName,
      type: 'image/jpeg',
    });

    const response = await fetch("https://epencia.net/app/souangah/", {
        method : 'POST',
        headers: {
            'content-type' : 'application/json',
        },
        body : formData,
    });

   const resText = await response.text();
   Alert.alert("serveur", resText);
    
    // Réinitialisation du formulaire
    setTitre('');
    setDescription('');
    setImages([]);
    setDate(new Date());
    setHeure(new Date());
    setIdAnnonce(generateId());
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.titre}>Ajouter une nouvelle annonce</Text>

      {/* Champ ID Annonce (lecture seule) */}
      <View style={styles.section}>
        <Text style={styles.label}>ID Annonce</Text>
        <TextInput
          style={[styles.input, styles.disabledInput]}
          value={idAnnonce}
          editable={false}
        />
      </View>

      {/* Champ Titre */}
      <View style={styles.section}>
        <Text style={styles.label}>Titre*</Text>
        <TextInput
          style={styles.input}
          placeholder="Titre de l'annonce"
          value={titre}
          onChangeText={setTitre}
        />
      </View>

      {/* Champ Description */}
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

      {/* Champ Prix */}
        <View style={styles.section}>
          <Text style={styles.label}>Prix*</Text>
          <View style={styles.prixContainer}>
            <TextInput
              style={[styles.input, styles.prixInput]}
              placeholder="0.00"
              value={formatPrix(prix)}
              onChangeText={handlePrixChange}
              keyboardType="decimal-pad"
              returnKeyType="done"
            />
            <View style={styles.deviseContainer}>
              <Text style={styles.deviseText}>{devise}</Text>
            </View>
          </View>
        </View>


      {/* Sélecteur de Date */}
      <View style={styles.section}>
        <Text style={styles.label}>Date</Text>
        <TouchableOpacity 
          style={styles.input} 
          onPress={() => setShowDatePicker(true)}
        >
          <Text>{date.toLocaleDateString('fr-FR')}</Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={onChangeDate}
          />
        )}
      </View>

      {/* Sélecteur d'Heure */}
      <View style={styles.section}>
        <Text style={styles.label}>Heure</Text>
        <TouchableOpacity 
          style={styles.input} 
          onPress={() => setShowTimePicker(true)}
        >
          <Text>{heure.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</Text>
        </TouchableOpacity>
        {showTimePicker && (
          <DateTimePicker
            value={heure}
            mode="time"
            display="default"
            onChange={onChangeTime}
          />
        )}
      </View>

      {/* Sélection d'Images */}
      <View style={styles.section}>
        <Text style={styles.label}>Photos* (max 5)</Text>
        <View style={styles.imagesContainer}>
          {images.map((uri, index) => (
            <View key={index} style={styles.imageWrapper}>
              <Image source={{ uri }} style={styles.image} />
              <TouchableOpacity 
                style={styles.deleteButton} 
                onPress={() => supprimerImage(index)}
              >
                <Ionicons name="close" size={20} color="white" />
              </TouchableOpacity>
            </View>
          ))}
          
          {images.length < 5 && (
            <TouchableOpacity style={styles.addImageButton} onPress={choisirImage}>
              <Ionicons name="camera" size={30} color="#666" />
              <Text style={styles.addImageText}>Ajouter une photo</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Bouton de validation */}
      <TouchableOpacity style={styles.validerButton} onPress={validerAnnonce}>
        <Text style={styles.validerButtonText}>Publier l'annonce</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
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
  disabledInput: {
    backgroundColor: '#eee',
    color: '#666',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  imagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  imageWrapper: {
    width: 100,
    height: 100,
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
    width: 100,
    height: 100,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
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
    marginBottom: 40,
  },
  validerButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

