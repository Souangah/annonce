import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  Alert, 
  TouchableOpacity, 
  ScrollView, 
  Image, 
  KeyboardAvoidingView, 
  Platform, 
  TouchableWithoutFeedback, 
  Keyboard 
} from 'react-native';
import { Feather } from '@expo/vector-icons';

export default function NouveauUtilisateur({ navigation }) {
  const [nom_prenom, setNomPrenom] = useState('');
  const [telephone, setTelephone] = useState('');
  const [mdp, setMdp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const handlePhoneChange = (text) => {
    const onlyNums = text.replace(/[^0-9]/g, '');
    if (onlyNums.length <= 10) {
      setTelephone(onlyNums);
    }
  };

  const ValiderUtilisateur = async () => {
    if (!nom_prenom || !telephone || !mdp) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
      return;
    }

    if (telephone.length !== 10) {
      Alert.alert('Erreur', 'Le numéro doit contenir exactement 10 chiffres.');
      return;
    }

    if (!/^\d{6}$/.test(mdp)) {
      Alert.alert('Erreur', 'Le mot de passe doit contenir exactement 4 chiffres.');
      return;
    }

    try {
      const response = await fetch("https://epencia.net/app/souangah/annonce/inscription.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          nom_prenom: nom_prenom,
          telephone: telephone,
          mdp: mdp
        })
      });

      const result = await response.text();
      console.log(result);

      if (result === 'success') {
        Alert.alert("Succès", "Inscription réussie !", [
          { 
            text: "OK", 
            onPress: () => {
              navigation.navigate('Connexion');
              // Réinitialiser les champs
              setNomPrenom('');
              setTelephone('');
              setMdp('');
            }
          }
        ]);
      } else {
        Alert.alert("Erreur", result);
      }

    } catch (error) {
      Alert.alert("Erreur", "Échec lors de l'envoi des données.");
      console.log("Erreur réseau :", error);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Image
              source={require('../assets/images/logo.png')}
              style={styles.logo}
            />
          </View>

          {/* Titre */}
          <Text style={styles.title}>Créez votre compte</Text>
          <Text style={styles.subtitle}>Remplissez vos informations pour vous inscrire</Text>

          {/* Formulaire */}
          <View style={styles.form}>
            {/* Champ Nom & Prénom */}
            <View style={[
              styles.inputContainer,
              focusedField === 'nom' && styles.inputFocused
            ]}>
              <Text style={styles.inputLabel}>Nom & Prénom</Text>
              <View style={styles.inputWrapper}>
                <Feather 
                  name="user" 
                  size={18} 
                  color={focusedField === 'nom' ? '#6366f1' : '#666'} 
                  style={styles.inputIcon} 
                />
                <TextInput
                  style={styles.input}
                  value={nom_prenom}
                  onChangeText={setNomPrenom}
                  placeholder="Ex: Jean Dupont"
                  placeholderTextColor="#94a3b8"
                  maxLength={30}
                  onFocus={() => setFocusedField('nom')}
                  onBlur={() => setFocusedField(null)}
                />
              </View>
            </View>

            {/* Champ Téléphone */}
            <View style={[
              styles.inputContainer,
              focusedField === 'phone' && styles.inputFocused
            ]}>
              <Text style={styles.inputLabel}>Numéro de téléphone</Text>
              <View style={styles.inputWrapper}>
                <Feather 
                  name="phone" 
                  size={18} 
                  color={focusedField === 'phone' ? '#6366f1' : '#666'} 
                  style={styles.inputIcon} 
                />
                <TextInput
                  style={styles.input}
                  value={telephone}
                  onChangeText={handlePhoneChange}
                  placeholder="Ex: 07 00 00 00 00"
                  placeholderTextColor="#94a3b8"
                  keyboardType="phone-pad"
                  maxLength={10}
                  onFocus={() => setFocusedField('phone')}
                  onBlur={() => setFocusedField(null)}
                />
              </View>
              <Text style={styles.hintText}>10 chiffres requis</Text>
            </View>

            {/* Champ Mot de passe */}
            <View style={[
              styles.inputContainer,
              focusedField === 'password' && styles.inputFocused
            ]}>
              <Text style={styles.inputLabel}>Mot de passe</Text>
              <View style={styles.inputWrapper}>
                <Feather 
                  name="lock" 
                  size={18} 
                  color={focusedField === 'password' ? '#6366f1' : '#666'} 
                  style={styles.inputIcon} 
                />
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  value={mdp}
                  onChangeText={setMdp}
                  placeholder=" 6 chiffres"
                  placeholderTextColor="#94a3b8"
                  secureTextEntry={!showPassword}
                  maxLength={6}
                  keyboardType="number-pad"
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                />
                <TouchableOpacity 
                  onPress={() => setShowPassword(!showPassword)} 
                  style={styles.eyeButton}
                >
                  <Feather 
                    name={showPassword ? 'eye' : 'eye-off'} 
                    size={20} 
                    color="#666" 
                  />
                </TouchableOpacity>
              </View>
              <Text style={styles.hintText}>4 chiffres requis</Text>
            </View>

            {/* Informations sur les données */}
            <View style={styles.infoBox}>
              <Feather name="info" size={16} color="#6366f1" style={styles.infoIcon} />
              <Text style={styles.infoText}>
                En vous inscrivant, vous acceptez nos conditions d'utilisation et notre politique de confidentialité.
              </Text>
            </View>

            {/* Bouton d'inscription */}
            <TouchableOpacity 
              style={styles.button} 
              onPress={ValiderUtilisateur}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>S'inscrire</Text>
              <Feather name="user-plus" size={18} color="#fff" style={styles.buttonIcon} />
            </TouchableOpacity>
          </View>

          {/* Lien vers connexion */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Vous avez déjà un compte ? </Text>
            <TouchableOpacity 
              onPress={() => navigation.navigate('Connexion')}
              activeOpacity={0.7}
            >
              <Text style={styles.loginLink}>Se connecter</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 24,
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
  inputFocused: {
    // Effet de focus
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
  hintText: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
    marginLeft: 4,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#f0f9ff',
    borderWidth: 1,
    borderColor: '#bae6fd',
    borderRadius: 10,
    padding: 14,
    marginBottom: 24,
    alignItems: 'flex-start',
  },
  infoIcon: {
    marginRight: 10,
    marginTop: 2,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: '#0369a1',
    lineHeight: 16,
  },
  button: {
    backgroundColor: '#6366f1', // Vert pour différencier de la connexion
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 10,
    shadowColor: '#10b981',
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
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  loginText: {
    fontSize: 14,
    color: '#64748b',
  },
  loginLink: {
    fontSize: 14,
    color: '#6366f1',
    fontWeight: '600',
  },
});