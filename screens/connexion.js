import React, { useState, useContext, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { GlobalContext } from '../config/GlobalUser'; // adapte ce chemin si besoin
import { Feather } from '@expo/vector-icons';

export default function Connexion({ navigation }) {
  const [telephone, setTelephone] = useState('');
  const [mdp, setMdp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [user, setUser] = useContext(GlobalContext);

  // Facultatif : charger des valeurs par défaut depuis une API
  useEffect(() => {
    const fetchUserDefaults = async () => {
      try {
        const response = await fetch('https://epencia.net/app/diako/api/connexion.php'); // adapte l'URL
        const result = await response.json();
        if (result && result[0]) {
          setTelephone(result[0].telephone || '');
          setMdp(result[0].mdp || '');
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données par défaut :', error);
      }
    };

    fetchUserDefaults();
  }, []);

  const handleConnexion = async () => {
    if (!telephone.trim() || !mdp.trim()) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
      return;
    }

    try {
      const response = await fetch('https://epencia.net/app/diako/api/connexion.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telephone, mdp }),
      });

      const result = await response.json();
      console.log('Réponse serveur:', result);

      if (result.length > 0 && result[0].telephone) {
        setUser(result[0]);
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
    <View style={styles.container}>
      <Text style={styles.title}>Connexion</Text>

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

      <TouchableOpacity style={styles.button} onPress={handleConnexion}>
        <Text style={styles.buttonText}>Se connecter</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Inscription')}>
        <Text style={styles.linkText}>Pas encore inscrit ? S'inscrire</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#f2f2f2',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
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
    color: '#fff',
    fontSize: 16,
  },
  linkText: {
    color: '#007bff',
    textAlign: 'center',
    marginTop: 15,
  },
});
