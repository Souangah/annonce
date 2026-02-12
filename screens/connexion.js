import React, { useState, useContext } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  StyleSheet, 
  Image, 
  KeyboardAvoidingView, 
  Platform, 
  TouchableWithoutFeedback, 
  Keyboard 
} from 'react-native';
import { GlobalContext } from '../config/GlobalUser';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Connexion({ navigation, route }) {
  const { redirectTo, redirectParams } = route.params || {};
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

      if (Array.isArray(result) && result.length > 0 && result[0].telephone) {
        const connectedUser = result[0];

        // 🔐 Mettre dans le context global
        setUser(connectedUser);

        // 💾 Sauvegarde locale (connexion persistante)
        await AsyncStorage.multiSet([
          ['user', JSON.stringify(connectedUser)],
          ['isLogged', 'true'],
        ]);

        // 🔁 Redirection
        if (redirectTo) {
          navigation.replace(redirectTo, redirectParams);
        } else {
          navigation.replace('MenuTabs');
        }
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
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <Image source={require('../assets/images/logo.png')} style={styles.logo} />
          </View>

          <Text style={styles.title}>Connectez-vous</Text>
          <Text style={styles.subtitle}>Entrez vos informations pour continuer</Text>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Numéro de téléphone</Text>
              <View style={styles.inputWrapper}>
                <Feather name="phone" size={18} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, Platform.OS === 'android' && styles.androidInput]}
                  placeholder="Ex: 07 00 00 00 00"
                  placeholderTextColor="#94a3b8"
                  keyboardType="phone-pad"
                  value={telephone}
                  maxLength={10}
                  onChangeText={(text) => setTelephone(text.replace(/[^0-9]/g, ''))}
                  allowFontScaling={false}
                  textAlignVertical="center"
                  returnKeyType="next"
                  blurOnSubmit={false}
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Mot de passe</Text>
              <View style={styles.inputWrapper}>
                <Feather name="lock" size={18} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, Platform.OS === 'android' && styles.androidInput]}
                  placeholder="Entrez votre mot de passe"
                  placeholderTextColor="#94a3b8"
                  secureTextEntry={!showPassword}
                  value={mdp}
                  maxLength={20}
                  onChangeText={setMdp}
                  allowFontScaling={false}
                  textAlignVertical="center"
                  returnKeyType="done"
                  onSubmitEditing={Valider}
                />
                <TouchableOpacity 
                  onPress={() => setShowPassword(!showPassword)} 
                  style={styles.eyeButton}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Feather name={showPassword ? 'eye' : 'eye-off'} size={20} color="#666" />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity 
              onPress={() => navigation.navigate('Inscription')} 
              style={styles.forgotPasswordLink}
            >
              <Text style={styles.forgotPasswordText}>Mot de passe oublié ?</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={Valider} activeOpacity={0.8}>
              <Text style={styles.buttonText}>Se connecter</Text>
              <Feather name="arrow-right" size={18} color="#fff" style={styles.buttonIcon} />
            </TouchableOpacity>
          </View>

          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Vous n'avez pas de compte ? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Inscription')} activeOpacity={0.7}>
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
    paddingBottom: Platform.OS === 'ios' ? 0 : 20,
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
    includeFontPadding: false,
    allowFontScaling: false,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 32,
    includeFontPadding: false,
    allowFontScaling: false,
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
    includeFontPadding: false,
    allowFontScaling: false,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: Platform.OS === 'ios' ? 50 : 48, // Hauteur légèrement différente par plateforme
    minHeight: 48,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#000000',
    paddingVertical: Platform.OS === 'ios' ? 12 : 0,
    includeFontPadding: false,
    textAlignVertical: 'center',
    minHeight: 48,
    allowFontScaling: false,
  },
  androidInput: {
    paddingVertical: 0,
    height: 48,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  eyeButton: {
    padding: 4,
    marginLeft: 4,
  },
  forgotPasswordLink: {
    alignSelf: 'flex-end',
    marginBottom: 24,
    paddingVertical: 4,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#6366f1',
    fontWeight: '500',
    includeFontPadding: false,
    allowFontScaling: false,
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
    minHeight: 56,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
    includeFontPadding: false,
    allowFontScaling: false,
  },
  buttonIcon: {
    marginTop: 2,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
  signupText: {
    fontSize: 14,
    color: '#64748b',
    includeFontPadding: false,
    allowFontScaling: false,
  },
  signupLink: {
    fontSize: 14,
    color: '#6366f1',
    fontWeight: '600',
    includeFontPadding: false,
    allowFontScaling: false,
  },
});