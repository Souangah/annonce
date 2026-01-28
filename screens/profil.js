import React, { useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { GlobalContext } from '../config/GlobalUser';
import { useNavigation } from '@react-navigation/native';

// Pour les icônes (optionnel) → tu peux utiliser expo-vector-icons ou react-native-vector-icons
// import { MaterialIcons, Ionicons } from '@expo/vector-icons';

const ProfilUtilisateur = () => {
  const [user] = useContext(GlobalContext);
  const navigation = useNavigation();

  // Placeholder pour la photo (à remplacer par user.photoURL si tu l'as)
  const avatarUri = user?.photoURL || 'https://i.pravatar.cc/150?u=' + user?.user_id;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header avec avatar */}
        <View style={styles.header}>
          <Image source={{ uri: avatarUri }} style={styles.avatar} />
          
          <Text style={styles.userName}>
            {user?.nom_prenom || 'Utilisateur'}
          </Text>
          
          <Text style={styles.userHandle}>
            @{user?.user_id || 'id'}
          </Text>

          <TouchableOpacity style={styles.editButton} activeOpacity={0.8} 
          onPress={() => navigation.navigate('Modifier le profil')}>
            <Text style={styles.editButtonText}>Modifier le profil</Text>
          </TouchableOpacity>
        </View>

        {/* Section Compte */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Compte</Text>

          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Numéro de compte</Text>
            <Text style={styles.fieldValue}>{user?.user_id || '-'}</Text>
          </View>

          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Email</Text>
            <Text style={styles.fieldValue}>{user?.email || 'Non renseigné'}</Text>
          </View>

          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Téléphone</Text>
            <Text style={styles.fieldValue}>{user?.telephone || 'Non renseigné'}</Text>
          </View>

          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Mot de passe</Text>
            <Text style={styles.fieldValue}>••••••••</Text> 
            {/* On ne montre JAMAIS le vrai mdp */}
          </View>

          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Inscription</Text>
            <Text style={styles.fieldValue}>
              {user?.date} à {user?.heure}
            </Text>
          </View>
        </View>

        {/* Section Infos perso */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Informations personnelles</Text>

          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Nom complet</Text>
            <Text style={styles.fieldValue}>{user?.nom_prenom || '-'}</Text>
          </View>

          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Pays</Text>
            <Text style={styles.fieldValue}>{user?.pays || 'Non renseigné'}</Text>
          </View>

          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Ville</Text>
            <Text style={styles.fieldValue}>{user?.ville || 'Non renseignée'}</Text>
          </View>
        </View>

        {/* Espace en bas */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f9fc', // fond très clair moderne
  },
  header: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e8ecef',
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 3,
    borderColor: '#ffffff',
    marginBottom: 16,
    // shadow pour un effet "pop"
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  userName: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  userHandle: {
    fontSize: 15,
    color: '#6c757d',
    marginBottom: 20,
  },
  editButton: {
    backgroundColor: '#6366f1', // indigo moderne
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 30,
    marginTop: 8,
  },
  editButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginVertical: 12,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    // légère ombre
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
    letterSpacing: -0.2,
  },
  fieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  fieldLabel: {
    fontSize: 15,
    color: '#6b7280',
    fontWeight: '500',
  },
  fieldValue: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
    textAlign: 'right',
    flexShrink: 1,
  },
});

export default ProfilUtilisateur;