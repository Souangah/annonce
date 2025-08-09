import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';

export default function Accueil({ navigation }) {
  const [tableau, setTableau] = useState();

  useEffect(() => {
    Tableau_bord();
  }, []);

  const Tableau_bord = async () => {
    try {
      const response = await fetch(""); // ⚠️ Mets ici l’URL de ton API
      const result = await response.json();
      setTableau(result);
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
      <TouchableOpacity style={styles.boutton1} onPress={() => navigation.navigate('AnnonceUtilisateur')}>
        <View style={styles.card}>
          <Text style={styles.cardText1}>2</Text>
          <Text style={styles.cardText2}>Mes annonces</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.boutton2} onPress={() => navigation.navigate('AnnonceUtilisateur')}>
        <View style={styles.card}>
          <Text style={styles.cardText1}>1052</Text>
          <Text style={styles.cardText2}> Annonces</Text>
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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
  },

  titleText: {
    fontSize: 20,
    marginBottom: 50,
    marginRight: 200,
  },

  menu: {
    flexDirection: 'row',
    marginBottom: 400,
  },

boutton1: {
  backgroundColor: '#007bff',
  borderRadius: 10,
  marginBottom: 20,
  paddingHorizontal: 30,
  paddingVertical: 10,
  width: 150,
  height: 150,
  marginHorizontal: 5,
  justifyContent: 'center', 
  alignItems: 'center',     
},

boutton2: {
  backgroundColor: '#0a8e10',
  borderRadius: 10,
  marginBottom: 20,
  paddingHorizontal: 30,
  paddingVertical: 10,
  width: 150,
  height: 150,
  justifyContent: 'center',
  alignItems: 'center',
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
