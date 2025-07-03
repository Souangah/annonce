import React, { useState, useEffect,useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ScrollView, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { GlobalContext } from '../config/GlobalUser';
import * as Notifications from 'expo-notifications';

export default function AjoutAnnonce() {
  // États pour les champs du formulaire
  const [titre, setTitre] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState([]);
  const [date, setDate] = useState(new Date());
  const [heure, setHeure] = useState(new Date());
  const [id_annonce, Id_Annonce] = useState('');
  // États pour les sélecteurs de date/heure
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [prix_promo, setPrix_Promo] = useState('');
  const [prix_normal, setPrix_Normal] = useState('');

  // user
    const [user, setUser] = useContext(GlobalContext);

  // Générer un ID aléatoire lors du premier rendu
  useEffect(() => {
    Id_Annonce(generateId());
  }, []);

  // Fonction pour générer un ID aléatoire
  const generateId = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  // Fonction pour formater et valider les prix (nombres entiers)
  const handlePriceChange = (text, setPrice) => {
    // Supprime tous les caractères non numériques
    const numericValue = text.replace(/[^0-9]/g, '');
    setPrice(numericValue);
  };

  // Fonction pour afficher le prix formaté
  const displayFormattedPrice = (price) => {
    if (!price) return '0';
    return parseInt(price).toLocaleString('fr-FR');
  };

  // Sélection d'images
  const choisirImage = async () => {
    if (images.length >= 1) {
      Alert.alert('Maximum atteint', 'Vous ne pouvez ajouter que 1 images maximum');
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
  const validerAnnonce = async () => {
    if (!titre || !description) {
      Alert.alert('Champs manquants', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (images.length === 0) {
      Alert.alert('Image manquante', 'Veuillez ajouter au moins une image');
      return;
    }

    // Formatage de la date et de l'heure
    const dateISO = date.toISOString().split('T')[0];
    const heureISO = heure.toTimeString().split(' ')[0];

    const formData = new FormData();
    formData.append("id_annonce", id_annonce);
    formData.append("titre", titre);
    formData.append("description", description);
    formData.append("prix_normal", prix_normal);
    formData.append("prix_promo", prix_promo);
    formData.append("date", dateISO);
    formData.append("heure", heureISO);


    
    
    // Ajout des images
    images.forEach((uri, index) => {
      formData.append("sai_photo", {
        uri: uri,
        name: `image_${index}.jpg`,
        type: 'image/jpeg',
      });
    });

    try {
      const response = await fetch("https://epencia.net/app/souangah/AjouterAnnonce.php", {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const result = await response.text();
      Alert.alert("Réponse du serveur", result);
      
      // Réinitialisation du formulaire
      setTitre('');
      setDescription('');
      setPrix_Normal('');
      setPrix_Promo('');
      setImages([]);
      setDate(new Date());
      setHeure(new Date());
      Id_Annonce(generateId());
    } catch (error) {
   
      Alert.alert('Erreur', 'Une erreur est survenue lors de l\'envoi');
    }
  };

  // LES CODES DU DG
      // Function to register for push notifications
    const registerForPushNotificationsAsync = async () => {
      try {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        
        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
        
        if (finalStatus !== 'granted') {
          console.log('Permission for notifications not granted');
          return null;
        }
  
        const token = (await Notifications.getExpoPushTokenAsync()).data;
        return token;
      } catch (error) {
        console.error('Error getting push token:', error);
        return null;
      }
    };
  
      // Configuration des notifications
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
  
    // Function to setup notification listeners
     const setupNotificationListeners = () => {
      const notificationListener = Notifications.addNotificationReceivedListener((notification) => {
        setNotification(notification);
        Alert.alert(
          notification.request.content.title || 'Notification',
          notification.request.content.body
        );
      });
      const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log(response);
    });
      
      return () => {
        notificationListener.remove();
        responseListener.remove();
      };
    };
  
  
    // Function to send token to server
    const sendTokenToServer = async (token) => {
      try {
  
        const response = await fetch('https://epencia.net/app/souangah/token.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            utilisateur_id: user.user_id,
            push_token: token,
          }),
        });
        const result = await response.json();
        console.log('Token envoyé au serveur:', result);
      } catch (error) {
        console.error('Erreur lors de l\'envoi du token:', error);
      }
    };

    useEffect(() => {

    // Setup push notifications
    registerForPushNotificationsAsync().then(token => {
      if (token) {
        console.log('Push token:', token);
        sendTokenToServer(token);
      }
    });

    // Configure notification listeners
    const unsubscribe = setupNotificationListeners(
      (notification) => {
        setNotification(notification);
        Alert.alert(
          notification.request.content.title || 'Notification',
          notification.request.content.body
        );
      },
      (response) => {
        console.log('Notification interaction:', response);
      }
    );


      unsubscribe();

  }, []);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.titre}>Ajouter une nouvelle annonce</Text>

      {/* Champ ID Annonce (lecture seule) */}
      {false &&(
      <View style={styles.section}>
        <Text style={styles.label}>ID Annonce</Text>
        <TextInput
          style={[styles.input, styles.disabledInput,]}
          value={id_annonce}
          editable={false}
        />
      </View>
      )}

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

      {/* Champ Prix Normal */}
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

      {/* Champ Prix Promotionnel */}
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

      {/* Affichage de la réduction si les deux prix sont renseignés */}
      {prix_normal && prix_promo && (
        <View style={styles.section}>
          <Text style={styles.discountText}>
            Réduction: {Math.round((1 - prix_promo/prix_normal) * 100)}%
          </Text>
        </View>
      )}

      
      
    {false && (
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
)}

     {/* Sélecteur d'Heure */}

      {false && (
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
      )}

      {/* Sélection d'Images */}
      <View style={styles.section}>
        <Text style={styles.label}>Photos* (max 1)</Text>
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
    padding: 15,
    backgroundColor: '#f5f5f5',
    bottom: 13,
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