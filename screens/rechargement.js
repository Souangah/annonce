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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GlobalContext } from '../config/GlobalUser';

export default function Rechargement({ navigation }) {
  const [montant, setMontant] = useState('');
  const [numero, setNumero] = useState('');
  const [loading, setLoading] = useState(false);
  const [user] = useContext(GlobalContext);

  const RechargeMoi = async () => {
    // 🔐 Validations
    if (!montant || isNaN(montant) || Number(montant) <= 0) {
      Alert.alert('Erreur', 'Veuillez entrer un montant valide.');
      return;
    }

    if (!numero || numero.length < 8) {
      Alert.alert('Erreur', 'Veuillez entrer un numéro valide.');
      return;
    }

    if (!user?.user_id) {
      Alert.alert('Erreur', 'Utilisateur non identifié.');
      return;
    }

    setLoading(true);

    try {
      // 📦 Payload conforme à l’API PHP
      const payload = {
        user_id: user.user_id,                 // 🔥 vient de la base
        MontantEnvoye: parseFloat(montant),    // 🔥 du formulaire
        MontantRecu: parseFloat(montant),      // 🔥 idem (frais à gérer côté PHP)
        telephone: numero                      // 🔥 numéro Wave
      };

      console.log('Payload envoyé :', payload);

      const response = await fetch(
        'https://epencia.net/app/souangah/annonce/rechargement.php',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();
      console.log('Réponse API :', result);

      // 🌊 Redirection Wave
      if (result.wave_launch_url) {
        Linking.openURL(result.wave_launch_url);
      }
      // ❌ Erreur backend
      else if (result.error) {
        Alert.alert('Erreur', result.error);
      }
      // ⚠️ Réponse inconnue
      else {
        Alert.alert('Erreur', 'Réponse inattendue du serveur.');
      }

    } catch (error) {
      Alert.alert('Erreur', 'Impossible de contacter le serveur.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/images/wave.png')}
        style={styles.logo}
      />

      <Text style={styles.label}>Numéro de téléphone</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: 0700000000"
        keyboardType="phone-pad"
        value={numero}
        maxLength={10}
        onChangeText={setNumero}
      />

      <Text style={styles.label}>Montant à recharger (FCFA)</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: 1000"
        keyboardType="numeric"
        value={montant}
        onChangeText={setMontant}
      />

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={RechargeMoi}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Ionicons name="wallet" size={20} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.buttonText}>Payer avec Wave</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#f0f4f7',
    alignItems: 'center',
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: 30,
    resizeMode: 'contain',
    marginTop: -50,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
    color: '#333',
    alignSelf: 'flex-start',
    width: '100%',
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#2196F3',
    paddingVertical: 15,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    width: '100%',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  buttonDisabled: {
    backgroundColor: '#90CAF9',
  },
});
