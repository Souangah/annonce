import React, { useContext, useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { GlobalContext } from '../config/GlobalUser';
import Feather from 'react-native-vector-icons/Feather';


export default function ProfilUtilisateur({ route }) {
  
  const [showPassword, setShowPassword] = useState(false);
  const [user, setUser] = useContext(GlobalContext);
  
useEffect(() => {

},[]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profil de l'utilisateur</Text>

      <View style={styles.avatarContainer}>
        <Image style={styles.avatar} />
        <Icon name="person-circle-outline" size={80} color="#888" />
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.label}>Nom & Prénom</Text>
        <TextInput style={styles.input} value={user?.nom_prenom || 'aucun resultat'} editable={false} />
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.label}>Téléphone</Text>
        <TextInput style={styles.input} value={user?.telephone || 'aucun resultat'} editable={false} />
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.label}>Mot de passe</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            value={user?.mdp || 'aucun resultat'}
            secureTextEntry={!showPassword}
            editable={false}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Feather name={showPassword ? 'eye' : 'eye-off'} size={22} color="#555" />
          </TouchableOpacity>
        </View>
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
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 50,
    height: 10,
    borderRadius: 50,
    margin: 5,
    padding: 8,

  },
  infoContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 15,
    marginBottom: 5,
    color: '#333',
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 8,
    backgroundColor: '#fff',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },
});