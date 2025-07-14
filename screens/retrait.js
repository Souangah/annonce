import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert,Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GlobalContext } from '../config/GlobalUser';

export default function Retrait({ navigation }) {
  const [montant, setMontant] = useState('');
  const [numero, setNumero] = useState('');
  const [user, setUser] = useContext(GlobalContext);

  const RetirerMontant = () => {
    const soldeActuel = Number(user.solde || 0);
    const montantNumber = Number(montant);

    if (!montant || isNaN(montant) || montantNumber <= 0) {
      Alert.alert('Erreur', 'Veuillez entrer un montant valide.');
      return;
    }

    if (!numero || numero.length < 8) {
      Alert.alert('Erreur', 'Veuillez entrer un numéro valide.');
      return;
    }

    if (montantNumber > soldeActuel) {
      Alert.alert('Fonds insuffisants', `Votre solde actuel est de ${soldeActuel} FCFA`);
      return;
    }

    // Mettre à jour le solde
    const nouveauSolde = soldeActuel - montantNumber;
    setUser({ ...user, solde: nouveauSolde });

    Alert.alert(
      'Succès',
      `Retrait de ${montant} FCFA vers le numéro ${numero} effectué avec succès.`
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

      <Text style={styles.label}>Montant à retirer</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: 5000"
        keyboardType="numeric"
        value={montant}
        onChangeText={setMontant}
      />

      <TouchableOpacity style={styles.button} onPress={RetirerMontant}>
        <Ionicons name="cash-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
        <Text style={styles.buttonText}>Valider le retrait</Text>
      </TouchableOpacity>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#f0f4f7',
  },
  label: {
    fontSize: 18,
    marginBottom: 6,
    fontWeight: '500',
    color: '#333',
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  input: {
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: 30,
    resizeMode: 'contain',
    marginTop: -100,
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
