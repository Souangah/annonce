import React, { useEffect, useState,useContext } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GlobalContext } from '../config/GlobalUser';

// Créez une référence de navigation
export const navigationRef = React.createRef();

export default function NotificationPush  () {
  
  const [matricule, setMatricule] = useState(user?.user_id);
  const [user, setUser] = useContext(GlobalContext);

  const registerForPushNotificationsAsync = async () => {
    try {
      if (!Device.isDevice) return null;

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Permission pour les notifications refusée');
        return null;
      }

      const token = (await Notifications.getExpoPushTokenAsync()).data;
      return token;
    } catch (error) {
      console.error('Erreur de récupération du token :', error);
      return null;
    }
  };

  const sendTokenToServer = async (token) => {
    try {
      if (!token) return;

      const response = await fetch('https://epencia.net/app/souangah/token.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
           utilisateur_id: "0",
           push_token: token,
        }),
      });

      const result = await response.json();
      console.log('Token envoyé au serveur:', result);
    } catch (error) {
      console.error("Erreur d'envoi du token :", error);
    }
  };

  const handleNotificationResponse = (response) => {
    const data = response.notification.request.content.data;
    
    // Gestion des notifications d'annonces
    if (data?.screen === "Details d'annonce" && navigationRef.current) {
      navigationRef.current.navigate("Details d'annonce", {
            id_annonce: data.params.id_annonce,
            titre: data.params.titre,
            description: data.params.description
        });
    }

  };

  useEffect(() => {
    const init = async () => {


        const token = await registerForPushNotificationsAsync();
        if (token) {
          console.log("Push token obtenu :", token);
          await sendTokenToServer(token);
        }
    };

    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });

    const notificationListener = Notifications.addNotificationReceivedListener((notification) => {
      Alert.alert(
        notification.request.content.title || 'Notification',
        notification.request.content.body
      );
    });

    const responseListener = Notifications.addNotificationResponseReceivedListener(handleNotificationResponse);

    init();

    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
  }, [matricule]);

  return null; // Ce composant n'affiche rien
};

