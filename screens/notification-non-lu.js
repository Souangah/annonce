import React, { useState, useEffect, useContext } from 'react';
import {View,Text,StyleSheet,FlatList,TouchableOpacity,Image,ActivityIndicator,RefreshControl,Alert,Linking,Dimensions,Animated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GlobalContext } from '../config/GlobalUser';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

const { width } = Dimensions.get('window');
const CARD_MARGIN = 5;
const CARD_WIDTH = (width - 32 - CARD_MARGIN) / 2;
const IMAGE_HEIGHT = 70;

const Notification = ({ navigation, route }) => {
  const [globalUser] = useContext(GlobalContext);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];
  
  const { id_annonce } = route.params || {};

  // Extraction sécurisée des données utilisateur
  const user = globalUser || {};
  const user_id = user.user_id || user.id || '';
  const nom_prenom = user.nom_prenom || user.nom || user.prenom || 'Utilisateur';

  // Fonction pour calculer le pourcentage de réduction
  const calculateDiscountPercentage = (normalPrice, promoPrice) => {
    const normal = parseFloat(normalPrice) || 0;
    const promo = parseFloat(promoPrice) || 0;
    
    if (normal <= 0 || promo >= normal) return 0;
    
    const discount = ((normal - promo) / normal) * 100;
    return Math.round(discount);
  };

  const fetchUnreadAnnouncements = async () => {
    if (!user_id) {
      console.warn('Aucun user_id trouvé dans le contexte:', globalUser);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('https://epencia.net/app/souangah/annonce/liste-annonce.php');
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (id_annonce) {
        setNotifications(data.annonce ? [data.annonce] : [data]);
      } else if (Array.isArray(data)) {
        setNotifications(data);
      } else {
        console.warn('Format de données inattendu:', data);
        setNotifications([]);
      }

      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    } catch (error) {
      console.error('Erreur lors du chargement des notifications:', error);
      Alert.alert('Erreur', 'Impossible de charger les notifications');
      setNotifications([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // FONCTION VALIDER CORRIGÉE POUR VOTRE API
  const Valider = async (annonceId) => {
    try {
      // Vérifier que nous avons toutes les données nécessaires
      if (!user_id) {
        Alert.alert('Erreur', 'Utilisateur non connecté');
        return;
      }

      if (!annonceId) {
        Alert.alert('Erreur', 'ID annonce manquant');
        return;
      }

      console.log('Données utilisateur disponibles:', {
        user_id,
        nom_prenom,
        globalUser: globalUser
      });

      console.log('Données envoyées à gain.php:', {
        user_id: user_id,
        id_annonce: annonceId,
        nom_prenom: nom_prenom,
      });

      // Feedback haptique
      if (Platform.OS === 'ios') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }

      // VOTRE API ATTEND DU JSON BRUT - CORRECTION ICI
      const payload = {
        user_id: user_id.toString(),
        id_annonce: annonceId.toString(),
        nom_prenom: nom_prenom
      };

      const response = await fetch("https://epencia.net/app/souangah/annonce/gain.php", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload)
      });
      
      console.log('Statut HTTP:', response.status);
      
      const responseText = await response.text();
      console.log('Réponse brute:', responseText);

      let responseData;
      try {
        responseData = JSON.parse(responseText);
        console.log("Réponse parsée:", responseData);
      } catch (jsonError) {
        console.error('Erreur parsing JSON:', jsonError);
        throw new Error('Réponse du serveur invalide - Format JSON attendu');
      }
      
      // Vérifier si la requête est réussie selon votre format de réponse
      if (response.ok && responseData.status === "success") {
        // Retirer l'annonce de la liste
        setNotifications(prev => prev.filter(item => item.id !== annonceId));
        
        Alert.alert(
          'Succès !',
          `Annonce validée !\nVotre solde: ${responseData.solde || 0} FCFA`,
          [{ text: 'OK' }]
        );
      } else {
        const errorMessage = responseData.message || responseData.status || 'Erreur lors de la validation';
        throw new Error(errorMessage);
      }
    } catch (err) {
      console.error("Erreur détaillée:", err);
      Alert.alert(
        'Erreur',
        err.message || 'Impossible de valider cette annonce. Veuillez réessayer.',
        [{ text: 'OK' }]
      );
    }
  };

  const callPhoneNumber = (phoneNumber) => {
    if (phoneNumber) {
      Linking.openURL(`tel:${phoneNumber}`);
    } else {
      Alert.alert('Erreur', 'Numéro de téléphone non disponible');
    }
  };

  const sendWhatsAppMessage = (phoneNumber) => {
    if (phoneNumber) {
      const cleanNumber = phoneNumber.replace(/\s/g, '');
      const whatsappUrl = `whatsapp://send?phone=${cleanNumber}&text=Bonjour, je suis intéressé par votre annonce`;
      
      Linking.openURL(whatsappUrl).catch(() => {
        Alert.alert('Erreur', 'WhatsApp n\'est pas installé sur votre appareil');
      });
    } else {
      Alert.alert('Erreur', 'Numéro de téléphone non disponible');
    }
  };

  const readFullAnnouncement = (item) => {
    const discountPercentage = calculateDiscountPercentage(item.prix_normal, item.prix_promo);
    
    // Vérifier si l'utilisateur est connecté avant d'afficher l'option de validation
    const canValidate = user_id && user_id !== '';
    
    const alertButtons = [
      { 
        text: 'Voir en détail', 
        onPress: () => navigation.navigate('DetailsAnnonce', { 
          id_annonce: item.id,
          item: item 
        })
      },
      { text: 'Fermer', style: 'cancel' }
    ];

    // Ajouter le bouton de validation seulement si l'utilisateur est connecté
    if (canValidate) {
      alertButtons.unshift({
        text: 'Valider et gagner 1000 FCFA', 
        onPress: () => Valider(item.id),
        style: 'default'
      });
    }

    Alert.alert(
      item.titre || 'Détails de l\'annonce',
      `${item.description || 'Aucune description disponible'}\n\n💰 Prix normal: ${item.prix_normal} FCFA\n🔥 Prix promo: ${item.prix_promo} FCFA${discountPercentage > 0 ? `\n🎉 Réduction: ${discountPercentage}%` : ''}${!canValidate ? '\n\n⚠️ Connectez-vous pour valider cette annonce' : ''}`,
      alertButtons
    );
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchUnreadAnnouncements();
  };

  useEffect(() => {
    fetchUnreadAnnouncements();
  }, [user_id, id_annonce]);

  // Afficher un message si l'utilisateur n'est pas connecté
  useEffect(() => {
    if (!user_id && !loading) {
      console.log('Utilisateur non connecté, données disponibles:', globalUser);
    }
  }, [user_id, loading, globalUser]);

  // FONCTION FORMATDATE CORRIGÉE POUR GÉRER DATE ET HEURE SÉPARÉES
  const formatDate = (item) => {
    if (!item) return 'Maintenant';
    
    try {
      // Vérifier si on a une date et une heure séparées
      const datePart = item.date; // Colonne date
      const timePart = item.heure; // Colonne heure
      
      // Si on n'a ni date ni heure
      if (!datePart && !timePart) {
        return 'Maintenant';
      }
      
      // Construire la date complète
      let dateString;
      if (datePart && timePart) {
        // Combiner date et heure
        dateString = `${datePart} ${timePart}`;
      } else if (datePart) {
        // Si seulement la date est disponible, utiliser minuit
        dateString = `${datePart} 00:00:00`;
      } else {
        // Si seulement l'heure est disponible, utiliser la date d'aujourd'hui
        const today = new Date().toISOString().split('T')[0];
        dateString = `${today} ${timePart}`;
      }
      
      // Parser la date complète
      const date = new Date(dateString);
      const now = new Date();
      
      // Vérifie si la date est valide
      if (isNaN(date.getTime())) {
        console.warn('Date invalide:', dateString);
        return 'Maintenant';
      }
      
      // Calcul la différence en millisecondes
      const diffTime = now.getTime() - date.getTime();
      const diffSeconds = Math.floor(diffTime / 1000);
      const diffMinutes = Math.floor(diffSeconds / 60);
      const diffHours = Math.floor(diffMinutes / 60);
      const diffDays = Math.floor(diffHours / 24);
      
      // Retourne le format approprié
      if (diffSeconds < 60) return 'À l\'instant';
      if (diffMinutes < 60) return `Il y a ${diffMinutes} min`;
      if (diffHours < 24) return `Il y a ${diffHours} h`;
      if (diffDays === 1) return 'Hier';
      if (diffDays < 7) return `Il y a ${diffDays} j`;
      if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} sem`;
      
      // Pour les dates plus anciennes
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: diffDays > 365 ? 'numeric' : undefined
      });
    } catch (error) {
      console.error('Erreur dans formatDate:', error);
      return 'Maintenant';
    }
  };

  const groupNotifications = (data) => {
    const grouped = [];
    for (let i = 0; i < data.length; i += 2) {
      grouped.push(data.slice(i, i + 2));
    }
    return grouped;
  };

  const NotificationRow = ({ rowData, rowIndex }) => (
    <View style={styles.rowContainer}>
      {rowData.map((item, index) => (
        <NotificationCard 
          key={item.id?.toString() || `${rowIndex}-${index}`} 
          item={item} 
          index={rowIndex * 2 + index}
        />
      ))}
      {rowData.length < 2 && <View style={[styles.notificationCard, styles.emptyCard]} />}
    </View>
  );

  const NotificationCard = ({ item, index }) => {
    const discountPercentage = calculateDiscountPercentage(item.prix_normal, item.prix_promo);
    const hasDiscount = discountPercentage > 0;
    const canValidate = user_id && user_id !== '';

    return (
      <Animated.View 
        style={[
          styles.notificationCard,
          { 
            opacity: fadeAnim, 
            transform: [{ 
              translateY: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [30, 0]
              })
            }] 
          }
        ]}
      >
        <LinearGradient
          colors={['#FFFFFF', '#F8FAFF']}
          style={styles.cardGradient}
        >
          {/* Header compact avec badge de réduction */}
          <View style={styles.cardHeader}>
            <View style={styles.headerLeft}>
              <View style={styles.statusContainer}>
                <View style={styles.liveIndicator} />
                <Text style={styles.statusText}>En ligne</Text>
              </View>
              {hasDiscount && (
                <View style={styles.discountBadge}>
                  <Text style={styles.discountBadgeText}>-{discountPercentage}%</Text>
                </View>
              )}
            </View>
            <Text style={styles.timeText}>{formatDate(item)}</Text>
          </View>

          {/* Image réduite */}
          <View style={styles.imageContainer}>
            {item.photo64 ? (
              <Image
                source={{ uri: `data:image/jpeg;base64,${item.photo64}` }}
                style={styles.announcementImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Ionicons name="image-outline" size={16} color="#9CA3AF" />
              </View>
            )}
          </View>

          {/* Contenu principal compact */}
          <View style={styles.contentContainer}>
            <Text style={styles.announcementTitle} numberOfLines={2}>
              {item.titre || 'Annonce sans titre'}
            </Text>
            
            <View style={styles.priceContainer}>
              {hasDiscount ? (
                <View style={styles.promoContainer}>
                  <Text style={styles.originalPrice}>{item.prix_normal} FCFA</Text>
                  <Text style={styles.promoText}>{item.prix_promo} FCFA</Text>
                </View>
              ) : (
                <Text style={styles.normalPrice}>{item.prix_normal} FCFA</Text>
              )}
            </View>
          </View>

          {/* Actions footer compact */}
          <View style={styles.cardFooter}>
            <TouchableOpacity 
              style={styles.detailButton}
              onPress={() => readFullAnnouncement(item)}
            >
              <Text style={styles.detailButtonText}>Voir</Text>
            </TouchableOpacity>

            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.whatsappButton]}
                onPress={() => sendWhatsAppMessage(item.telephone)}
              >
                <Ionicons name="logo-whatsapp" size={12} color="#FFFFFF" />
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.actionButton, styles.callButton]}
                onPress={() => callPhoneNumber(item.telephone)}
              >
                <Ionicons name="call" size={10} color="#FFFFFF" />
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.menuButton, !canValidate && styles.disabledButton]}
                onPress={() => canValidate ? Valider(item.id) : Alert.alert('Connexion requise', 'Veuillez vous connecter pour valider cette annonce')}
                disabled={!canValidate}
              >
                <Ionicons name="checkmark" size={12} color={canValidate ? "#10B981" : "#9CA3AF"} />
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>
    );
  };

  const renderEmptyList = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIllustration}>
        <Ionicons name="notifications-off" size={48} color="#9CA3AF" />
      </View>
      <Text style={styles.emptyTitle}>
        {id_annonce ? 'Annonce non trouvée' : 'Aucune notification'}
      </Text>
      <Text style={styles.emptySubtitle}>
        {id_annonce 
          ? 'Cette annonce n\'existe pas ou a été supprimée'
          : !user_id 
            ? 'Connectez-vous pour voir les annonces'
            : 'Toutes vos annonces sont à jour'
        }
      </Text>
      {!user_id && (
        <TouchableOpacity 
          style={styles.loginButton}
          onPress={() => navigation.navigate('Login')} // Adaptez selon votre navigation
        >
          <Ionicons name="log-in" size={16} color="#FFFFFF" />
          <Text style={styles.loginButtonText}>Se connecter</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity 
        style={styles.refreshButton}
        onPress={onRefresh}
      >
        <Ionicons name="refresh" size={16} color="#667eea" />
        <Text style={styles.refreshButtonText}>Actualiser</Text>
      </TouchableOpacity>
    </View>
  );

  const groupedNotifications = groupNotifications(notifications);

  return (
    <View style={styles.container}>
      {/* Header compact */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          
          <View style={styles.titleContainer}>
            <Text style={styles.headerTitle}>
              {id_annonce ? 'Détails Annonce' : 'Notifications'}
            </Text>
            {notifications.length > 0 && !id_annonce && (
              <View style={styles.notificationCount}>
                <Text style={styles.notificationCountText}>
                  {notifications.length}
                </Text>
              </View>
            )}
          </View>

          <TouchableOpacity 
            style={styles.headerAction}
            onPress={onRefresh}
          >
            <Ionicons name="sync" size={20} color="#667eea" />
          </TouchableOpacity>
        </View>
        {!user_id && (
          <View style={styles.warningBanner}>
            <Ionicons name="warning" size={16} color="#FFFFFF" />
            <Text style={styles.warningText}>Connectez-vous pour valider les annonces</Text>
          </View>
        )}
      </View>

      {loading ? (
        <View style={styles.loadingState}>
          <ActivityIndicator size="small" color="#667eea" />
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      ) : (
        <FlatList
          data={groupedNotifications}
          renderItem={({ item, index }) => <NotificationRow rowData={item} rowIndex={index} />}
          keyExtractor={(item, index) => `row-${index}`}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={renderEmptyList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#667eea']}
              tintColor="#667eea"
              progressBackgroundColor="#FFFFFF"
            />
          }
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFF',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 6,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  notificationCount: {
    backgroundColor: '#EF4444',
    borderRadius: 12,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  notificationCountText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  headerAction: {
    padding: 6,
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F59E0B',
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
    gap: 8,
  },
  warningText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  listContainer: {
    padding: 12,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  separator: {
    height: 6,
  },
  notificationCard: {
    width: CARD_WIDTH,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  emptyCard: {
    backgroundColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
  },
  cardGradient: {
    padding: 8,
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  liveIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#10B981',
  },
  statusText: {
    fontSize: 8,
    fontWeight: '600',
    color: '#10B981',
  },
  discountBadge: {
    backgroundColor: '#EF4444',
    borderRadius: 4,
    paddingHorizontal: 3,
    paddingVertical: 1,
  },
  discountBadgeText: {
    color: '#FFFFFF',
    fontSize: 7,
    fontWeight: '800',
  },
  timeText: {
    fontSize: 8,
    fontWeight: '500',
    color: '#6B7280',
  },
  imageContainer: {
    marginBottom: 6,
  },
  announcementImage: {
    width: '100%',
    height: IMAGE_HEIGHT,
    borderRadius: 8,
  },
  imagePlaceholder: {
    width: '100%',
    height: IMAGE_HEIGHT,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    flex: 1,
    marginBottom: 6,
  },
  announcementTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
    lineHeight: 14,
  },
  priceContainer: {
    marginTop: 'auto',
  },
  promoContainer: {
    flexDirection: 'column',
    gap: 1,
  },
  originalPrice: {
    fontSize: 8,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
    fontWeight: '500',
  },
  promoText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#EF4444',
  },
  normalPrice: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1F2937',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    minWidth: 40,
    alignItems: 'center',
  },
  detailButtonText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  actionButton: {
    width: 22,
    height: 22,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  whatsappButton: {
    backgroundColor: '#25D366',
  },
  callButton: {
    backgroundColor: '#10B981',
  },
  menuButton: {
    padding: 2,
  },
  disabledButton: {
    opacity: 0.5,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyIllustration: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#667eea',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
    marginBottom: 12,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  refreshButtonText: {
    color: '#667eea',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
});

export default Notification;