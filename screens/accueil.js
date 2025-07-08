import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions, Animated } from 'react-native';

const { width } = Dimensions.get('window');

export default function Accueil({ navigation }) {
  const images = [
    { id: 1, src: require('../assets/images/im7.jpg') },
    { id: 2, src: require('../assets/images/im5.jpg') },
    { id: 3, src: require('../assets/images/im3.jpg') },
  ];

  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef(null);

  useEffect(() => {
    let position = 0;

    const animation = Animated.loop(
      Animated.timing(scrollX, {
        toValue: (images.length) * (width * 0.8 + 15),
        duration: images.length * 4000, // + lent
        useNativeDriver: false,
      })
    );

    animation.start();

    const listener = scrollX.addListener(({ value }) => {
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ x: value, animated: false });
      }
    });

    return () => {
      animation.stop();
      scrollX.removeListener(listener);
    };
  }, []);

  return (
    <View style={styles.container}>
      <Animated.ScrollView
        horizontal
        ref={scrollViewRef}
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        contentContainerStyle={styles.imageRow}
      >
        {images.concat(images).map((item, index) => ( // doublé pour effet boucle
          <Image
            key={index}
            source={item.src}
            style={styles.image}
            resizeMode="cover"
          />
        ))}
      </Animated.ScrollView>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => navigation.navigate('Connexion')}
        >
          <Text style={styles.buttonText}>Se Connecter</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.registerButton]}
          onPress={() => navigation.navigate('Inscription')}
        >
          <Text style={styles.buttonText}>S'inscrire</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2',
    justifyContent: 'space-between',
    paddingVertical: 40,
  },
  imageRow: {
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  image: {
    width: width * 0.8,
    height: 200,
    borderRadius: 12,
    marginRight: 15,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 50,
  },
  button: {
    backgroundColor: '#1e88e5',
    paddingVertical: 14,
    paddingHorizontal: 25,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  registerButton: {
    backgroundColor: '#1e88e5',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
