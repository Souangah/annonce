import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, TouchableOpacity, ScrollView} from 'react-native';
import { Feather } from '@expo/vector-icons';

export default function NouveauUtilisateur({ navigation}) {
 
  const [nom_prenom, setNomPrenom] = useState();
  const [telephone, setTelephone] = useState();
  const [mdp, setMdp] = useState();
  const [showPassword, setShowPassword] = useState(false);

  const handlePhoneChange = (text) => {
    const onlyNums = text.replace(/[^0-9]/g, '');
    if (onlyNums.length <= 10) {
      setTelephone(onlyNums);
    }
  };

  const ValiderUtilisateur = async () => {
    if ( !nom_prenom || !telephone || !mdp) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
      return;
    }

    if (telephone.length !== 10) {
      Alert.alert('Erreur', 'Le numéro doit contenir exactement 10 chiffres.');
      return;
    }

    if (!/^\d{4}$/.test(mdp)) {
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
  Alert.alert("Succès", result, [
    { text: "OK", onPress: () => navigation.navigate('Connexion') }
  ]);
        setNomPrenom('');
        setTelephone('');
        setMdp('');

} else {
  Alert.alert("Erreur ", result);
}


       

    } catch (error) {
      Alert.alert("Erreur", "Échec lors de l'envoi des données.");
      console.log("Erreur réseau :", error);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Créer votre compte</Text>
      <Text style={styles.subtitle}>Remplissez les informations</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Nom & Prénom</Text>
        <TextInput
          style={styles.input}
          value={nom_prenom}
          onChangeText={setNomPrenom}
          placeholder="Jean Dupont"
          maxLength={30}
          placeholderTextColor="#A1A1AA"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Téléphone</Text>
        <TextInput
          style={styles.input}
          value={telephone}
          onChangeText={handlePhoneChange}
          placeholder="0700000000"
          placeholderTextColor="#A1A1AA"
          keyboardType="phone-pad"
          maxLength={10}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Mot de passe</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            value={mdp}
            onChangeText={setMdp}
            placeholder="••••"
           
            secureTextEntry={!showPassword}
            maxLength={4}
            keyboardType="number-pad"
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Feather name={showPassword ? 'eye' : 'eye-off'} size={22} color="#94A3B8" />
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity style={styles.button} onPress={ValiderUtilisateur}>
        <Text style={styles.buttonText}>Enregistrer</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
    flexGrow: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 10,
    color: '#1E293B',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 24,
    textAlign: 'center',
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
  input: {
    height: 56,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    color: '#1E293B',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    height: 56,
    justifyContent: 'space-between',
  },
  passwordInput: {
    flex: 1,
    fontSize: 16,
    color: '#1E293B',
  },
  button: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
