import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';

export default function Accueil({ navigation }) {
  const [tableau, setTableau] = useState({ mesAnnonces: 0, totalAnnonces: 0 });

  useEffect(() => {
    Tableau_bord();
  }, []);

  const Tableau_bord = async () => {
    try {
      // Replace with your actual API endpoint
      const response = await fetch('https://your-api-endpoint.com/data');
      const result = await response.json();
      // Assuming the API returns an object like { mesAnnonces: number, totalAnnonces: number }
      setTableau({
        mesAnnonces: result.mesAnnonces || 0,
        totalAnnonces: result.totalAnnonces || 0,
      });
    } catch (error) {
      console.error('Erreur API :', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.title}>
        <Text style={styles.titleText}>Tableau de bord</Text>
      </View>

      <View style={styles.menu}>
        <TouchableOpacity
          style={styles.boutton1}
          onPress={() => navigation.navigate('AnnonceUtilisateur')}
        >
          <View style={styles.card}>
            <Text style={styles.cardText1}>{tableau.mesAnnonces}</Text>
            <Text style={styles.cardText2}>Mes annonces</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.boutton2}
          onPress={() => navigation.navigate('ListeAnnonces')} // Changed to different screen
        >
          <View style={styles.card}>
            <Text style={styles.cardText1}>{tableau.totalAnnonces}</Text>
            <Text style={styles.cardText2}>Annonces</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f2f2f2',
  },
  title: {
    alignItems: 'flex-start', // Align title to the left
    marginBottom: 20,
  },
  titleText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  menu: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20, // Reduced from 400 to a reasonable value
  },
  boutton1: {
    backgroundColor: '#007bff',
    borderRadius: 10,
    width: Dimensions.get('window').width / 2.5, // Responsive width
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  boutton2: {
    backgroundColor: '#0a8e10',
    borderRadius: 10,
    width: Dimensions.get('window').width / 2.5, // Responsive width
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  card: {
    alignItems: 'center',
  },
  cardText1: {
    fontSize: 40,
    marginBottom: 10,
    color: '#fff',
  },
  cardText2: {
    fontSize: 14,
    color: '#fff',
  },
});