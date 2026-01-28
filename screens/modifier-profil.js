import React, { useContext, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { GlobalContext } from '../config/GlobalUser';

// Pour la navigation (si tu utilises React Navigation)
// import { useNavigation } from '@react-navigation/native';

const ModifierProfil = () => {
  const [user, setUser] = useContext(GlobalContext);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nom_prenom: '',
    email: '',
    telephone: '',
    ville: '',
    pays: '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Initialiser les données du formulaire avec les infos de l'utilisateur
  useEffect(() => {
    if (user) {
      setFormData({
        nom_prenom: user.nom_prenom || '',
        email: user.email || '',
        telephone: user.telephone || '',
        ville: user.ville || '',
        pays: user.pays || '',
      });
    }
  }, [user]);

  const handleInputChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handlePasswordChange = (field, value) => {
    setPasswordData({
      ...passwordData,
      [field]: value,
    });
  };

  const handleSaveProfile = async () => {
    // Validation simple
    if (!formData.nom_prenom.trim()) {
      Alert.alert('Erreur', 'Le nom complet est obligatoire');
      return;
    }

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      Alert.alert('Erreur', 'Veuillez entrer un email valide');
      return;
    }

    setLoading(true);
    try {
      // Simuler un appel API
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mettre à jour le contexte global
      const updatedUser = {
        ...user,
        ...formData,
      };
      setUser(updatedUser);

      Alert.alert('Succès', 'Profil mis à jour avec succès');
      // Si tu utilises React Navigation pour revenir en arrière :
      // navigation.goBack();
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    // Validation du mot de passe
    if (!passwordData.currentPassword) {
      Alert.alert('Erreur', 'Veuillez entrer votre mot de passe actuel');
      return;
    }

    if (!passwordData.newPassword) {
      Alert.alert('Erreur', 'Veuillez entrer un nouveau mot de passe');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
      return;
    }

    // Vérification du mot de passe actuel (simulé)
    if (passwordData.currentPassword !== user.mdp) {
      Alert.alert('Erreur', 'Mot de passe actuel incorrect');
      return;
    }

    setLoading(true);
    try {
      // Simuler un appel API
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mettre à jour le mot de passe dans le contexte
      const updatedUser = {
        ...user,
        mdp: passwordData.newPassword,
      };
      setUser(updatedUser);

      Alert.alert('Succès', 'Mot de passe modifié avec succès');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue lors du changement de mot de passe');
    } finally {
      setLoading(false);
    }
  };

  const avatarUri = user?.photoURL || 'https://i.pravatar.cc/150?u=' + user?.user_id;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Image source={{ uri: avatarUri }} style={styles.avatar} />
            <TouchableOpacity style={styles.changePhotoButton}>
              <Text style={styles.changePhotoText}>Changer la photo</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.title}>Modifier le profil</Text>
        </View>

        {/* Formulaire d'édition */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Informations personnelles</Text>

          {/* Nom complet */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Nom complet *</Text>
            <TextInput
              style={styles.input}
              value={formData.nom_prenom}
              onChangeText={(text) => handleInputChange('nom_prenom', text)}
              placeholder="Votre nom et prénom"
              placeholderTextColor="#9ca3af"
            />
          </View>

          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={styles.input}
              value={formData.email}
              onChangeText={(text) => handleInputChange('email', text)}
              placeholder="votre@email.com"
              placeholderTextColor="#9ca3af"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Téléphone */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Téléphone</Text>
            <TextInput
              style={styles.input}
              value={formData.telephone}
              onChangeText={(text) => handleInputChange('telephone', text)}
              placeholder="Votre numéro de téléphone"
              placeholderTextColor="#9ca3af"
              keyboardType="phone-pad"
            />
          </View>

          {/* Ville */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Ville</Text>
            <TextInput
              style={styles.input}
              value={formData.ville}
              onChangeText={(text) => handleInputChange('ville', text)}
              placeholder="Votre ville"
              placeholderTextColor="#9ca3af"
            />
          </View>

          {/* Pays */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Pays</Text>
            <TextInput
              style={styles.input}
              value={formData.pays}
              onChangeText={(text) => handleInputChange('pays', text)}
              placeholder="Votre pays"
              placeholderTextColor="#9ca3af"
            />
          </View>
        </View>

        {/* Changement de mot de passe */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Changer le mot de passe</Text>

          {/* Mot de passe actuel */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Mot de passe actuel</Text>
            <TextInput
              style={styles.input}
              value={passwordData.currentPassword}
              onChangeText={(text) => handlePasswordChange('currentPassword', text)}
              placeholder="Entrez votre mot de passe actuel"
              placeholderTextColor="#9ca3af"
              secureTextEntry
            />
          </View>

          {/* Nouveau mot de passe */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Nouveau mot de passe</Text>
            <TextInput
              style={styles.input}
              value={passwordData.newPassword}
              onChangeText={(text) => handlePasswordChange('newPassword', text)}
              placeholder="Minimum 6 caractères"
              placeholderTextColor="#9ca3af"
              secureTextEntry
            />
          </View>

          {/* Confirmer le mot de passe */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Confirmer le mot de passe</Text>
            <TextInput
              style={styles.input}
              value={passwordData.confirmPassword}
              onChangeText={(text) => handlePasswordChange('confirmPassword', text)}
              placeholder="Retapez le nouveau mot de passe"
              placeholderTextColor="#9ca3af"
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            style={styles.passwordButton}
            onPress={handleChangePassword}
            disabled={loading}
          >
            <Text style={styles.passwordButtonText}>
              Changer le mot de passe
            </Text>
          </TouchableOpacity>
        </View>

        {/* Boutons d'action */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.cancelButton]}
            // Pour revenir en arrière
            onPress={() => {
              // navigation.goBack();
            }}
          >
            <Text style={styles.cancelButtonText}>Annuler</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.saveButton]}
            onPress={handleSaveProfile}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>Enregistrer</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f9fc',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e8ecef',
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#ffffff',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  changePhotoButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
  },
  changePhotoText: {
    color: '#4b5563',
    fontSize: 14,
    fontWeight: '500',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    marginTop: 8,
  },
  card: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginVertical: 12,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 20,
    letterSpacing: -0.2,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#111827',
  },
  passwordButton: {
    backgroundColor: '#f3f4f6',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  passwordButtonText: {
    color: '#4b5563',
    fontSize: 16,
    fontWeight: '600',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginTop: 24,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  saveButton: {
    backgroundColor: '#6366f1',
  },
  cancelButtonText: {
    color: '#4b5563',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ModifierProfil;