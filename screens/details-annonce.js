import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';

export default function DetailsAnnonce({ route }) {
  const { id_annonce } = route.params;  // passé depuis la navigation
  const [annonce, setAnnonce] = useState(null);
  const [loading, setLoading] = useState(true);

  // Appel API pour récupérer l'annonce
  useEffect(() => {
    const fetchAnnonce = async () => {
      try {
        const response = await fetch(`https://epencia.net/app/souangah/details-annonce.php?id_annonce=${id_annonce}`);
        const data = await response.json();
        setAnnonce(data[0]);
      } catch (error) {
        console.error('Erreur:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnonce();
  }, []);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  if (!annonce) {
    return (
      <View style={styles.container}>
        <Text>Impossible de charger l'annonce.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Image 
        source={{ uri: `data:${annonce.type};base64,${annonce.photo64}` }}
        style={styles.image}
      />

      <View style={styles.content}>
        <Text style={styles.title}>{annonce.titre}</Text>

        <Text style={styles.priceNormal}>
          Prix Normal: {parseFloat(annonce.prix_normal)} FCFA
        </Text>

        {annonce.prix_promo && (
          <Text style={styles.pricePromo}>
            Promo: {parseFloat(annonce.prix_promo)} FCFA
          </Text>
        )}

        <Text style={styles.description}>
          {annonce.description}
        </Text>

        <Text style={styles.date}>
          Publié le {annonce.date} à {annonce.heure}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loader: {
    flex:1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: 300,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333'
  },
  priceNormal: {
    fontSize: 18,
    color: '#555',
    marginBottom: 5,
  },
  pricePromo: {
    fontSize: 18,
    color: '#e53935',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
    marginBottom: 15,
  },
  date: {
    fontSize: 14,
    color: '#999',
    textAlign: 'right',
  },
});
