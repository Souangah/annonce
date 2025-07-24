import React, { useEffect, useState, useContext, useRef } from 'react';
import {View,Text,Image,StyleSheet,ScrollView,ActivityIndicator,TouchableOpacity,Dimensions,Animated,Easing,Platform,Share} from 'react-native';
import { GlobalContext } from '../config/GlobalUser';
import { Ionicons, MaterialIcons, FontAwesome, Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import moment from 'moment';
import 'moment/locale/fr';

const { width, height } = Dimensions.get('window');

export default function DetailsAnnonce({ route, navigation }) {

  const item = route.params?.item || {};
  
  const { id_annonce } = route.params;
  const [annonce, setAnnonce] = useState(null);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(true);
  const [user, setUser] = useContext(GlobalContext);
  const scrollY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    const fetchAnnonce = async () => {
      try {
        const response = await fetch(`https://epencia.net/app/souangah/annonce/details-annonce.php?id_annonce=${id_annonce}`);
        const data = await response.json();
        setAnnonce(data[0]);
        
        // Animations d'entrée
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 6,
            useNativeDriver: true,
          })
        ]).start();
      } catch (error) {
        console.error('Erreur:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnonce();
  }, []);

  const Valider = async () => {
    try {
      // Feedback haptique
      if (Platform.OS === 'ios') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }

      const response = await fetch("https://epencia.net/app/souangah/annonce/gain.php", {
        method: 'POST',
        headers: {
          'Content-Type': "application/json"
        },
        body: JSON.stringify({
          user_id: user.user_id,
          id_annonce: id_annonce,
          nom_prenom: user.nom_prenom, 
        
        })
      });
      const data = await response.json();
      console.log("Réponse du serveur:", data);
      
      // Animation de confirmation
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 5,
          useNativeDriver: true,
        })
      ]).start();
      
      setVisible(false);
    } catch (err) {
      console.error("Erreur réseau:", err);
    }
  }

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Découvrez cette offre incroyable : ${annonce.titre} - Prix promo : ${annonce.prix_promo} FCFA`,
        url: `https://epencia.net/app/souangah/annonce/${id_annonce}`
      });
    } catch (error) {
      console.error('Erreur lors du partage:', error);
    }
  };

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const imageScale = scrollY.interpolate({
    inputRange: [-100, 0],
    outputRange: [1.5, 1],
    extrapolate: 'extend',
  });

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#6C63FF" />
        <Text style={styles.loadingText}>Chargement de l'offre...</Text>
      </View>
    );
  }

  if (!annonce) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Impossible de charger l'annonce.</Text>
      </View>
    );
  }

  const formattedDate = moment(annonce.date).locale('fr').format('DD MMMM YYYY');

  return (
    <View style={styles.container}>
      <Animated.ScrollView 
        style={styles.scrollView}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY }} }],
          { useNativeDriver: false }
        )}
      >
        {/* Image principale avec effet parallax */}
        <Animated.View 
          style={[
            styles.imageContainer, 
            { transform: [{ scale: imageScale }] }
          ]}
        >
          <Image 
            source={{ uri: `data:${annonce.type};base64,${annonce.photo64}` }}
            style={styles.image}
          />
          <LinearGradient
            colors={['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.3)', 'transparent']}
            style={styles.imageGradient}
          />
          
          {/* Badge promo */}
          {annonce.prix_promo && (
            <View style={styles.promoBadge}>
              <Text style={styles.promoText}>ÉCONOMISEZ {parseFloat(annonce.prix_normal) - parseFloat(annonce.prix_promo)} FCFA</Text>
            </View>
          )}
        </Animated.View>

        {/* Contenu principal avec animations */}
        <Animated.View 
          style={[
            styles.content,
            { 
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }] 
            }
          ]}
        >
          <View style={styles.titleRow}>
            <Text style={styles.title}>{annonce.titre}</Text>
            <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
              <Feather name="share-2" size={22} color="#6C63FF" />
            </TouchableOpacity>
          </View>


          <View style={styles.priceContainer}>
            <View style={styles.priceColumn}>
              <Text style={styles.priceLabel}>Prix normal</Text>
              <Text style={styles.priceNormal}>{parseFloat(annonce.prix_normal)} FCFA</Text>
            </View>
            
            {annonce.prix_promo ? (
              <View style={styles.priceColumn}>
                <Text style={styles.priceLabel}>Prix promo</Text>
                <Text style={styles.pricePromo}>{parseFloat(annonce.prix_promo)} FCFA</Text>
              </View>
            ) : (
              <View style={styles.priceColumn}>
                <Text style={styles.priceLabel}>Prix actuel</Text>
                <Text style={styles.pricePromo}>{parseFloat(annonce.prix_normal)} FCFA</Text>
              </View>
            )}
          </View>

          <View style={styles.savingsContainer}>
            <MaterialIcons name="local-offer" size={20} color="#E74C3C" />
            <Text style={styles.savingsText}>Économisez jusqu'à 25% avec cette offre exclusive</Text>
          </View>

          <View style={styles.divider} />
          
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>
            {annonce.description}
          </Text>
          
          <View style={styles.infoBox}>
            <View style={styles.infoHeader}>
              <Ionicons name="information-circle-outline" size={24} color="#6C63FF" />
              <Text style={styles.infoHeaderText}>Détails de l'offre</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={18} color="#6C63FF" />
              <Text style={styles.infoText}>Publié le {formattedDate}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="time-outline" size={18} color="#6C63FF" />
              <Text style={styles.infoText}>À {annonce.heure}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="pricetag-outline" size={18} color="#6C63FF" />
              <Text style={styles.infoText}>Référence: #{id_annonce}</Text>
            </View>
          </View>
        </Animated.View>
      </Animated.ScrollView>

      {/* Header animé */}
      <Animated.View style={[styles.animatedHeader, { opacity: headerOpacity }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.animatedHeaderTitle} numberOfLines={1}>{annonce.titre}</Text>
        <TouchableOpacity onPress={handleShare} style={styles.headerButton}>
          <Feather name="share-2" size={20} color="#FFF" />
        </TouchableOpacity>
      </Animated.View>

      {/* Bouton d'action */}
      {visible && (
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={Valider}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={['#6C63FF', '#4A43D0']}
            style={styles.buttonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.buttonText}>ok</Text>
            <MaterialIcons name="flash-on" size={24} color="#FFF" style={styles.buttonIcon} />
          </LinearGradient>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFF',
  },
  scrollView: {
    flex: 1,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFF',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#6C63FF',
    fontWeight: '500',
  },
  errorText: {
    fontSize: 18,
    color: '#E74C3C',
    textAlign: 'center',
    marginTop: 50,
  },
  animatedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 50,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#6C63FF',
    height: 90,
    zIndex: 100,
  },
  animatedHeaderTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    textAlign: 'center',
    marginHorizontal: 10,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    height: height * 0.4,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: '100%',
  },
  promoBadge: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: '#E74C3C',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  promoText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  content: {
    padding: 25,
    backgroundColor: '#FFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30,
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
    paddingBottom: 100,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#2C3E50',
    flex: 1,
    fontFamily: 'sans-serif-medium',
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(108, 99, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  ratingText: {
    fontSize: 14,
    color: '#7F8C8D',
    marginLeft: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    backgroundColor: '#F8FAFF',
    borderRadius: 15,
    padding: 15,
  },
  priceColumn: {
    alignItems: 'center',
    flex: 1,
  },
  priceLabel: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 5,
    fontWeight: '500',
  },
  priceNormal: {
    fontSize: 18,
    color: '#95A5A6',
    textDecorationLine: 'line-through',
  },
  pricePromo: {
    fontSize: 24,
    fontWeight: '800',
    color: '#E74C3C',
  },
  savingsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F5',
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#E74C3C',
  },
  savingsText: {
    fontSize: 14,
    color: '#E74C3C',
    marginLeft: 10,
    flex: 1,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#ECF0F1',
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 15,
  },
  description: {
    fontSize: 16,
    color: '#34495E',
    lineHeight: 24,
    marginBottom: 25,
  },
  featuresContainer: {
    marginBottom: 25,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    fontSize: 16,
    color: '#34495E',
    marginLeft: 10,
  },
  infoBox: {
    backgroundColor: '#F8FAFF',
    borderRadius: 20,
    padding: 20,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#EDF2FF',
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  infoHeaderText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6C63FF',
    marginLeft: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 16,
    color: '#34495E',
    marginLeft: 12,
  },
  actionButton: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  buttonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginRight: 10,
  },
  buttonIcon: {
    marginLeft: 5,
  },
});