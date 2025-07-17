import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking, Alert } from 'react-native';
import { Ionicons, FontAwesome5, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { GlobalContext } from '../config/GlobalUser';

export default function Service({ navigation }) {
  const [user] = useContext(GlobalContext);

  const openWhatsApp = () => {
    const phone = '2250150961134'; // Remplace par ton numéro
    const url = `https://wa.me/${phone}`;
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Alert.alert('Erreur', "WhatsApp n'est pas installé ou l'URL est invalide.");
        }
      });
  };

  const openTelegram = () => {
    const username = '@Souangah'; // remplace par ton @username Telegram
    const url = `https://t.me/${username}`;
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Alert.alert('Erreur', "Telegram n'est pas installé ou l'URL est invalide.");
        }
      });
  };

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.menu}>
        <MenuItem
          icon={<Ionicons name="logo-whatsapp" size={20} color="#25D366" />}
          label="Contacter nous sur WhatsApp"
          onPress={openWhatsApp}
        />

        <MenuItem
          icon={<FontAwesome5 name="telegram-plane" size={20} color="#0088cc" />}
          label="Contacter nous sur Telegram"
          onPress={openTelegram}
        />
      </View>
    </ScrollView>
  );
}

function MenuItem({ icon, label, onPress }) {
  return (
    <TouchableOpacity 
      style={styles.menuItem} 
      onPress={onPress} 
      activeOpacity={0.9}
    >
      <View style={styles.menuIcon}>
        {icon}
      </View>
      <Text style={styles.menuLabel}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 40,
  },
  menu: {
    marginBottom: 20,
  },
  menuItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
    shadowColor: '#0F172A',
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 1.5,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#E0E7FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    color: '#1E293B',
    fontWeight: '500',
  },
});
