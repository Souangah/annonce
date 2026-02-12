import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  Linking,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GlobalContext } from '../config/GlobalUser';

export default function Rechargement({ navigation }) {
  const [montant, setMontant] = useState('');
  const [telephone, setTelephone] = useState('');
  const [loading, setLoading] = useState(false);
  const [user] = useContext(GlobalContext);

  const RechargeMoi = async () => {
    if (!montant || isNaN(montant) || Number(montant) <= 0) {
      Alert.alert('Erreur', 'Veuillez entrer un montant valide.');
      return;
    }

    if (!telephone || telephone.length < 8) {
      Alert.alert('Erreur', 'Veuillez entrer un numéro valide.');
      return;
    }

    if (!user?.user_id) {
      Alert.alert('Erreur', 'Utilisateur non identifié.');
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("telephone", telephone);
    formData.append("montant", montant);
    formData.append("user_id", user.user_id);

    try {
      const response = await fetch('https://epencia.net/app/souangah/annonce/rechargement.php', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.wave_launch_url) {
        Linking.openURL(result.wave_launch_url);   // 🔥 redirection Wave
      } else if (result.error) {
        Alert.alert("Erreur", result.error);
      } else {
        Alert.alert("Erreur", "Réponse inattendue du serveur");
      }

    } catch (error) {
      console.log(error);
      Alert.alert('Erreur', 'Impossible de contacter le serveur.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            <Image
              source={require('../assets/images/wave.png')}
              style={styles.logo}
            />

            <Text style={styles.label}>Numéro de téléphone</Text>
            <TextInput
              style={[styles.input, Platform.OS === 'android' && styles.androidInput]}
              placeholder="Ex: 0700000000"
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

            <Text style={styles.label}>Montant à recharger (FCFA)</Text>
            <TextInput
              style={[styles.input, Platform.OS === 'android' && styles.androidInput]}
              placeholder="Ex: 1000"
              placeholderTextColor="#94a3b8"
              keyboardType="numeric"
              value={montant}
              onChangeText={(text) => setMontant(text.replace(/[^0-9]/g, ''))}
              allowFontScaling={false}
              textAlignVertical="center"
              returnKeyType="done"
              onSubmitEditing={RechargeMoi}
            />

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={RechargeMoi}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="wallet" size={20} color="#fff" style={styles.buttonIcon} />
                  <Text style={styles.buttonText}>Payer avec Wave</Text>
                </>
              )}
            </TouchableOpacity>

            <View style={styles.infoContainer}>
              <Text style={styles.infoText}>
                <Ionicons name="information-circle-outline" size={16} color="#2196F3" />{' '}
                Le rechargement est sécurisé via Wave
              </Text>
              <Text style={styles.infoNote}>
                Assurez-vous que votre numéro est correct pour recevoir la recharge
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f7',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: 40,
  },
  content: {
    paddingHorizontal: 20,
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 40 : 20,
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: 30,
    resizeMode: 'contain',
    marginTop: Platform.OS === 'ios' ? 0 : -20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
    color: '#333',
    alignSelf: 'flex-start',
    width: '100%',
    includeFontPadding: false,
    allowFontScaling: false,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: Platform.OS === 'ios' ? 12 : 0,
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: '#fff',
    includeFontPadding: false,
    textAlignVertical: 'center',
    minHeight: 48,
    allowFontScaling: false,
    color: '#000',
  },
  androidInput: {
    paddingVertical: 0,
    height: 45,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  button: {
    backgroundColor: '#2196F3',
    paddingVertical: 16,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    width: '100%',
    minHeight: 56,
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    includeFontPadding: false,
    allowFontScaling: false,
  },
  buttonDisabled: {
    backgroundColor: '#90CAF9',
    opacity: 0.7,
  },
  infoContainer: {
    marginTop: 30,
    padding: 15,
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
    width: '100%',
    borderWidth: 1,
    borderColor: '#bbdefb',
  },
  infoText: {
    fontSize: 14,
    color: '#1565c0',
    fontWeight: '500',
    marginBottom: 8,
    includeFontPadding: false,
    allowFontScaling: false,
  },
  infoNote: {
    fontSize: 13,
    color: '#546e7a',
    fontStyle: 'italic',
    includeFontPadding: false,
    allowFontScaling: false,
  },
});