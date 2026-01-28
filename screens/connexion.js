import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, Image, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { GlobalContext } from '../config/GlobalUser';
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
        navigation.navigate('MenuTabs');
      } else {
        Alert.alert('Erreur', 'Téléphone ou mot de passe incorrect');
      }
    } catch (error) {
      console.error('Erreur lors de la connexion :', error);
      Alert.alert('Erreur', "Une erreur est survenue lors de la connexion.");
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.content}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Image
              source={require('../assets/images/logo.png')} 
              style={styles.logo}
            />
          </View>

          {/* Titre */}
          <Text style={styles.title}>Connectez-vous</Text>
          <Text style={styles.subtitle}>Entrez vos informations pour continuer</Text>

          {/* Formulaire */}
          <View style={styles.form}>
            {/* Champ téléphone */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Numéro de téléphone</Text>
              <View style={styles.inputWrapper}>
                <Feather name="phone" size={18} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Ex: 07 00 00 00 00"
                  keyboardType="numeric"
                  value={telephone}
                  maxLength={10}
                  onChangeText={(text) => {
                    const cleanText = text.replace(/[^0-9]/g, '');
                    setTelephone(cleanText);
                  }}
                />
              </View>
            </View>

            {/* Champ mot de passe */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Mot de passe</Text>
              <View style={styles.inputWrapper}>
                <Feather name="lock" size={18} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  placeholder="Entrez votre mot de passe"
                  secureTextEntry={!showPassword}
                  value={mdp}
                  maxLength={10}
                  onChangeText={setMdp}
                />
                <TouchableOpacity 
                  onPress={() => setShowPassword(!showPassword)} 
                  style={styles.eyeButton}
                >
                  <Feather name={showPassword ? 'eye' : 'eye-off'} size={20} color="#666" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Lien mot de passe oublié */}
            <TouchableOpacity 
              onPress={() => navigation.navigate('Inscription')}
              style={styles.forgotPasswordLink}
            >
              <Text style={styles.forgotPasswordText}>Mot de passe oublié ?</Text>
            </TouchableOpacity>

            {/* Bouton de connexion */}
            <TouchableOpacity style={styles.button} onPress={Valider}>
              <Text style={styles.buttonText}>Se connecter</Text>
              <Feather name="arrow-right" size={18} color="#fff" style={styles.buttonIcon} />
            </TouchableOpacity>
          </View>

          {/* Lien vers inscription */}
          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Vous n'avez pas de compte ? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Inscription')}>
              <Text style={styles.signupLink}>Créer un compte</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 32,
  },
  form: {
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#475569',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
    color: '#1e293b',
  },
  passwordInput: {
    paddingRight: 40,
  },
  eyeButton: {
    padding: 8,
  },
  forgotPasswordLink: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#6366f1',
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#6366f1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 10,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  buttonIcon: {
    marginTop: 2,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: {
    fontSize: 14,
    color: '#64748b',
  },
  signupLink: {
    fontSize: 14,
    color: '#6366f1',
    fontWeight: '600',
  },
});