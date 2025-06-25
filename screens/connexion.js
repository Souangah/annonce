import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native';

export default function Connexion({ navigation }) {
  const [login, setLogin] = useState('');
  const [motDePass, setMotDePass] = useState('');

  const handleConnexion = () => {
    // Simuler une authentification
    if (login === 'admin' && motDePass === 'admin') {
      navigation.navigate('Menu', { user: { login } });
    } else {
      Alert.alert('Erreur', 'Identifiants invalides');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Connexion</Text>
        
        <TextInput 
          placeholder="Login" 
          style={styles.input} 
          value={login} 
          onChangeText={setLogin}
          placeholderTextColor="#999"
        />
        
        <TextInput 
          placeholder="Mot de passe" 
          secureTextEntry 
          style={styles.input} 
          value={motDePass} 
          onChangeText={setMotDePass}
          placeholderTextColor="#999"
        />
        
        <TouchableOpacity style={styles.button} onPress={handleConnexion}>
          <Text style={styles.buttonText}>Se connecter</Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={() => navigation.navigate('Inscription')}>
          <Text style={styles.link}>
            Pas encore inscrit ? <Text style={styles.linkBold}>Crée un compte</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 350,
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#333',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 20,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  button: {
    backgroundColor: '#4a90e2',
    borderRadius: 8,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  link: {
    marginTop: 20,
    textAlign: 'center',
    color: '#666',
  },
  linkBold: {
    fontWeight: 'bold',
    color: '#4a90e2',
  },
});