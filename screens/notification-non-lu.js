import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const Notification = ({ userId, onPress }) => {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fonction pour récupérer les notifications non lues
  const fetchCount = async () => {
    try {
      const res = await fetch(`https://enpencia.net/app/souangah/annonce/notification-non-lu.php?user_id=${userId}`);
      const data = await res.json();
      if (data.status === 'success') {
        setCount(data.total_non_lues);
      }
    } catch (error) {
      console.error('Erreur de connexion:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCount();
    const interval = setInterval(fetchCount, 60000); // actualise chaque 60 sec
    return () => clearInterval(interval);
  }, []);

  return (
    <TouchableOpacity onPress={onPress} style={styles.iconContainer}>
      <Ionicons name="notifications-outline" size={30} color="#000" />
      {loading ? null : count > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{count}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    padding: 10,
  },
  badge: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'red',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 1,
    minWidth: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default Notification;
