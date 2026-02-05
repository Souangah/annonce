import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { GlobalContext } from '../config/GlobalUser';
import { Ionicons } from '@expo/vector-icons';

export default function PaiementSucces() {
  const route = useRoute();
  const navigation = useNavigation();
  const [user, setUser] = useContext(GlobalContext);

  const numero = route.params?.numero;

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('Validation du paiement...');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!numero) {
      setLoading(false);
      setMessage("Transaction introuvable");
      return;
    }

    validerPaiement();
  }, [numero]);

  const validerPaiement = async () => {
    try {
      const res = await fetch('https://epencia.net/app/souangah/paiement/succes.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          numero,
          user_id: user?.user_id
        }),
      });

      const data = await res.json();

      if (data?.success) {
        setSuccess(true);
        setMessage(data.message || 'Paiement validé avec succès 🎉');

        // Mettre à jour le solde local
        setUser({
          ...user,
          solde: data.nouveau_solde,
          abonnement: data.abonnement || user.abonnement,
        });
      } else {
        setSuccess(false);
        setMessage(data?.message || "Échec de la validation du paiement");
      }
    } catch (error) {
      console.log(error);
      setSuccess(false);
      setMessage("Erreur de connexion au serveur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <>
          <ActivityIndicator size="large" color="#ed720d" />
          <Text style={styles.text}>Validation du paiement en cours...</Text>
        </>
      ) : (
        <>
          <Ionicons
            name={success ? 'checkmark-circle' : 'close-circle'}
            size={90}
            color={success ? '#16a34a' : '#dc2626'}
          />

          <Text style={styles.title}>
            {success ? 'Paiement réussi 🎉' : 'Paiement échoué'}
          </Text>

          <Text style={styles.text}>Transaction : {numero}</Text>
          <Text style={styles.text}>{message}</Text>

          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('Menu')}
          >
            <Text style={styles.buttonText}>Retour à l’accueil</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff'
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
  },
  text: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
    textAlign: 'center',
  },
  button: {
    marginTop: 20,
    backgroundColor: '#ed720dff',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
