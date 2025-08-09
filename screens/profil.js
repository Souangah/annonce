import React, { useContext, useState } from 'react';
import {View,Text,TextInput,StyleSheet,TouchableOpacity,Image,Alert,ScrollView
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { Feather } from '@expo/vector-icons';
import { GlobalContext } from '../config/GlobalUser';

export default function ProfilUtilisateur() {
  const [user, setUser] = useContext(GlobalContext);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState();
  const [image, setImage] = useState(null);

  const [profil, setProfil] = useState({
    nom_prenom: user.nom_prenom || '',
    telephone: user.telephone || '',
    mdp: user.mdp || '',
    date: user.date || '',
    
  });

  const changerPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission refusée", "Vous devez autoriser l'accès à la galerie.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.Images,
      quality: 1,
      allowsEditing: true,
      aspect: [1, 1],
    });

    if (!result.canceled) {
      setImage(result.assets[0] );
    }
  };

  const handleChange = (key, value) => {
    setImage({ image, [key]: value });
  };

  const modifier = async () => {

     if (!image) {
      Alert.alert("Aucune image", "Veuillez d'abord choisir une image.");
      return;
    }

    const formData = new FormData();
    formData.append("user_id", user.id);
    formData.append("nom_prenom", profil.nom_prenom);
    formData.append("telephone", profil.telephone);
    formData.append("mdp", profil.mdp);
    formData.append("email",email);

    if (image) {
      formData.append("sai_photo", {
        uri: image.uri,
        name: `photo_${Date.now()}.jpg`,
        type: 'image/jpeg',
      });
    }

    try {
      const response = await fetch("https://epencia.net/app/souangah/annonce/profil.php", {
        method: "POST",
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      const result = await response.json();
      console.log(result);
      if (result.status === 'success') {
        setUser({ ...user, ...profil });
      }

      Alert.alert("Résultat", result.message || 'Profil mis à jour1');
    } catch (err) {
      console.error("Erreur", err);
      Alert.alert("Erreur", "Impossible de modifier le profil.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <View style={styles.avatarContainer}>
          <TouchableOpacity onPress={changerPhoto}>
            <Image
              source={
                image
                  ?{ uri: image}
                  : require('../assets/images/icon.png')
              }
              style={styles.avatar}
            />
            <View style={styles.editIcon}>
              <Ionicons name='add' size={20} color={'white'} />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.title}>
          <Text style={styles.title}>{profil.nom_prenom}</Text>
          <Text style={styles.titleText}>Bénéficiaire</Text>
        </View>

        <View style={styles.champ}>
          <Text style={styles.label}>Nom & Prénoms</Text>
          <TextInput
            style={styles.input}
            value={profil.nom_prenom}
            onChangeText={(text) => handleChange('nom_prenom', text)}
          />
        </View>

        <View style={styles.champ}>
          <Text style={styles.label}>Téléphone</Text>
          <TextInput
            style={styles.input}
            value={profil.telephone}
            keyboardType="phone-pad"
            onChangeText={(text) => handleChange('telephone', text)}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Mot de passe</Text>
          <View style={styles.inputWithIcon}>
            <TextInput
              style={styles.input}
              value={profil.mdp}
              onChangeText={(text) => handleChange('mdp', text)}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.iconInsideInput}
            >
              <Feather name={showPassword ? 'eye' : 'eye-off'} size={20} color="#555" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.champ}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />
        </View>

        <View style={styles.champ}>
          <Text style={styles.label}>Date de création</Text>
          <TextInput
            style={styles.input}
            value={profil.date}
            editable={false}
          />
        </View>

        <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={modifier}>
          <Text style={styles.buttonText}>Modifier</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  title: {
    fontSize: 32,
    marginTop: -12,
    alignItems: 'center',
  },
  titleText: {
    marginBottom: 18,
    fontSize: 20,
  },
  container: {
    padding: 25,
    backgroundColor: '#f8f9fa',
    flex: 1,
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 30,
    position: 'relative',
  },
  avatar: {
    width: 150,
    height: 150,
    borderRadius: 70,
    backgroundColor: '#e1e4e8',
    borderWidth: 3,
    borderColor: '#fff',
  },
  editIcon: {
    position: 'absolute',
    right: 5,
    bottom: 5,
    backgroundColor: '#3498db',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  champ: {
    alignSelf: 'stretch',
    marginBottom: 15,
  },
  label: {
    fontWeight: '600',
    marginBottom: 8,
    fontSize: 15,
    color: '#34495e',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  button: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  saveButton: {
    backgroundColor: '#4c90df',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 17,
  },
  inputGroup: {
    alignSelf: 'stretch',
    marginBottom: 15,
  },
  inputWithIcon: {
    position: 'relative',
    justifyContent: 'center',
  },
  iconInsideInput: {
    position: 'absolute',
    right: 12,
  },
});
