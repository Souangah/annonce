import React, { useEffect, useState, useContext } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { GlobalContext } from '../config/GlobalUser';

export default function DetailsAnnonce({ route }) {
  const { id_annonce } = route.params;
  const [annonce, setAnnonce] = useState(null);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(true);
  const [user, setUser] = useContext(GlobalContext);

  useEffect(() => {
    console.log("Réponse du serveur:", user.nom_prenom);
    const fetchAnnonce = async () => {
      try {
        const response = await fetch(`https://epencia.net/app/souangah/annonce/details-annonce.php?id_annonce=${id_annonce}`);
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

const Valider = async () =>{
    try {
        const response = await fetch("https://epencia.net/app/souangah/annonce/gain.php", {
            method: 'POST',
            headers: {
                'Content-Type': "application/json"
            },
            body: JSON.stringify({
                nom_prenom: user.nom_prenom,
                id_annonce: id_annonce 
            })
            
        });
        const data = await response.json();
        console.log("Réponse du serveur:", data);

        setVisible(false);
    } catch (err) {
        console.error("Erreur réseau:", err);
    }
}


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
    <View style={styles.container}>
      <ScrollView>
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

      {visible && (
        <TouchableOpacity style={styles.valider} onPress={Valider}>
          <Text style={styles.detailTexte}>OK</Text>
        </TouchableOpacity>
      )}
    </View>
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

  valider: {
    position: 'absolute',
    bottom: 50,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4cf926ff',
    paddingVertical: 12,
    borderRadius: 15,
    shadowRadius: 8,
    elevation: 2,
  },

  detailTexte: {
    fontSize: 18,
    color: '#000',
    fontWeight: 'bold'
  }
});
