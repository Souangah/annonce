import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GlobalContext } from '../config/GlobalUser';

export default function Rechargement({ navigation }) {
  const [montant, setMontant] = useState('');
  const [numero, setNumero] = useState('');
  const [user, setUser] = useContext(GlobalContext);

  const RechargeMoi = () => {
    if (!montant || isNaN(montant) || Number(montant) <= 0) {
      Alert.alert('Erreur', 'Veuillez entrer un montant valide.');
      return;
    }

    if (!numero || numero.length < 8) {
      Alert.alert('Erreur', 'Veuillez entrer un numéro valide.');
      return;
    }

    const nouveauSolde = Number(user.solde || 0) + Number(montant);
    setUser({ ...user, solde: nouveauSolde });

    Alert.alert(
      'Succès',
      `Recharge de ${montant} FCFA sur le numéro ${numero} effectuée avec succès.`
    );

    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      {/* Logo Wave affiché au centre */}
      <Image
        source={require('../assets/images/wave.png')} // ✅ chemin relatif correct
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

      <Text style={styles.label}>Montant à recharger</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: 1000"
        keyboardType="numeric"
        value={montant}
        onChangeText={setMontant}
      />

      <TouchableOpacity style={styles.button} onPress={RechargeMoi}>
        <Ionicons name="wallet" size={20} color="#fff" style={{ marginRight: 8 }} />
        <Text style={styles.buttonText}>Valider le rechargement</Text>
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
    marginTop: -100,
  },
  label: {
    fontSize: 18,
    marginBottom: 6,
    fontWeight: '500',
    color: '#333',
    alignSelf: 'flex-start',
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#2196F3',
    paddingVertical: 14,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    paddingHorizontal: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
