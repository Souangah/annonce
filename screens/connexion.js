import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, Image, ImageBackground } from 'react-native';
import { GlobalContext } from '../config/GlobalUser'; // adapte ce chemin si besoin
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Connexion({ navigation }) {
  const [telephone, setTelephone] = useState('');
  const [mdp, setMdp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [user, setUser] = useContext(GlobalContext);

  const Valider = async () => {
    if (!telephone.trim() || !mdp.trim()) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
      return;
    }

    try {
      const response = await fetch('https://epencia.net/app/diako/api/connexion.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          telephone: telephone,
          mdp: mdp
        }),
      });

      const result = await response.json();
      console.log('Réponse serveur:', result);

      if (result.length > 0 && result[0].telephone) {
        setUser(result[0]);
        if (result[0].user_id) {
          await AsyncStorage.setItem('matricule', result[0].user_id);
        }
        navigation.navigate('Menu');
      } else {
        Alert.alert('Erreur', 'Téléphone ou mot de passe incorrect');
      }
    } catch (error) {
      console.error('Erreur lors de la connexion :', error);
      Alert.alert('Erreur', "Une erreur est survenue lors de la connexion.");
    }
  };

  return (
    <ImageBackground
      source={require('../assets/images/font1.jpg')} // Assurez-vous que l'image existe dans ce chemin
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <Image
          source={require('../assets/images/logo.png')} 
          style={styles.logo}
        />
        <Text style={styles.title}>Espace de Connexion</Text>

        <TextInput
          style={styles.input}
          placeholder="Téléphone"
          keyboardType="numeric"
          value={telephone}
          maxLength={10}
          onChangeText={(text) => {
            const cleanText = text.replace(/[^0-9]/g, '');
            setTelephone(cleanText);
          }}
        />

        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Mot de passe"
            secureTextEntry={!showPassword}
            value={mdp}
            maxLength={4}
            onChangeText={setMdp}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
            <Feather name={showPassword ? 'eye' : 'eye-off'} size={24} color="#888" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.button} onPress={Valider}>
          <Text style={styles.buttonText}>Se connecter</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Inscription')}>
          <Text style={styles.linkText}>Mot de passe oublié ?</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Inscription')}>
          <Text style={styles.linkText}>Créer un compte ?</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
   // Fond semi-transparent pour améliorer la lisibilité
  },
  title: {
    fontSize: 20,
    marginBottom: 20,
    textAlign: 'center',
    color: '#333', // Couleur du texte ajustée pour contraste
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 5,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    backgroundColor: '#fff',
    marginBottom: 15,
  },
  passwordInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
  },
  eyeButton: {
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  button: {
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  linkText: {
    color: '#007bff',
    textAlign: 'center',
    marginTop: 15,
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 10,
    resizeMode: 'contain',
    alignSelf: 'center',
    borderWidth: 1,
    borderRadius: 5,
    borderColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
  },
});