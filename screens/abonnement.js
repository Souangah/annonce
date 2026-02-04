import { View, Text, TouchableOpacity, SafeAreaView, StyleSheet, Alert, ScrollView } from 'react-native'
import { useContext, useState } from 'react';
import { GlobalContext } from '../config/GlobalUser';

export default function Abonnement() {
    const [activeTab, setActiveTab] = useState('akwaba');
    const [selectedDuration, setSelectedDuration] = useState('1');
    const [user, setUser] = useContext(GlobalContext);
    const [loading, setLoading] = useState(false);

    console.log(user.user_id);

    const ChangerBoutton = (tab) => {
        setActiveTab(tab);
    };

    // Fonction pour calculer le prix selon la durée
    const getPrice = (plan, duration) => {
        const prices = {
            'akwaba': 5000,
            'business': 8000,
            'premium': 15000
        };
        
        const basePrice = prices[plan];
        
        switch(duration) {
            case '3':
                return Math.round(basePrice * 3 * 0.9); // 10% de réduction
            case '6':
                return Math.round(basePrice * 6 * 0.8); // 20% de réduction
            default:
                return basePrice;
        }
    };

    // Fonction pour obtenir le pourcentage de réduction
    const getDiscountPercentage = (duration) => {
        switch(duration) {
            case '3':
                return '10%';
            case '6':
                return '20%';
            default:
                return null;
        }
    };

    const formatPrice = (price) => {
        return `${price.toLocaleString()} FCFA`;
    };

    // Fonction pour obtenir le nombre max d'annonces selon le plan
    const getMaxAnnonces = (plan) => {
        switch(plan) {
            case 'akwaba':
                return '10';
            case 'business':
                return '30';
            case 'premium':
                return '100';
            default:
                return '0';
        }
    };

    // Fonction pour obtenir la durée en jours selon la durée sélectionnée
    const getDureeEnJours = (duration) => {
        switch(duration) {
            case '1':
                return '30'; // 1 mois = 30 jours
            case '3':
                return '90'; // 3 mois = 90 jours
            case '6':
                return '180'; // 6 mois = 180 jours
            default:
                return '30';
        }
    };

    // Fonction pour obtenir le type d'abonnement formaté
    const getTypeAbonnement = () => {
        switch(activeTab) {
            case 'akwaba':
                return 'Akwaba';
            case 'business':
                return 'Business';
            case 'premium':
                return 'Premium';
            default:
                return '';
        }
    };

    // Fonction pour envoyer l'abonnement à l'API PHP
    const saveAbonnementToDatabase = async (abonnementData) => {
        try {
            setLoading(true);
            
            // URL de votre API PHP - remplacez par votre URL réelle
            const url = 'https://epencia.net/app/souangah/annonce/abonnement.php';
            
            // Création des données FormData comme attendu par votre API
            const formData = new FormData();
            formData.append('user_id', abonnementData.user_id);
            formData.append('type_abonnement', abonnementData.type_abonnement);
            formData.append('prix', abonnementData.prix);
            formData.append('duree_jours', abonnementData.duree_jours);
            formData.append('max_annonces', abonnementData.max_annonce);
            
            
            const response = await fetch(url, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json',
                },
            });
            
            const result = await response.json();
            
            // Essayer de parser le JSON, sinon utiliser le texte brut
            let parsedResult;
            try {
                parsedResult = JSON.parse(result);
            } catch (e) {
                parsedResult = result;
            }
            
            if (response.ok) {
                if (typeof parsedResult === 'string' && parsedResult === 'succes') {
                    return { success: true, message: 'Abonnement créé avec succès' };
                } else if (parsedResult.status === 'echec') {
                    return { success: false, error: parsedResult.message || 'Erreur lors de l\'enregistrement' };
                } else if (typeof parsedResult === 'string' && parsedResult.includes('parametres manquants')) {
                    return { success: false, error: 'Paramètres manquants' };
                } else {
                    return { success: true, data: parsedResult };
                }
            } else {
                return { success: false, error: 'Erreur serveur' };
            }
        } catch (error) {
            console.error('Erreur:', error);
            return { success: false, error: 'Erreur de connexion au serveur' };
        } finally {
            setLoading(false);
        }
    };

    // Fonction pour gérer l'achat
    const handlePurchase = async () => {
      

        const planName = getTypeAbonnement();
        const durationText = selectedDuration === '1' ? '1 mois' : 
                            selectedDuration === '3' ? '3 mois' : '6 mois';
        
        const price = getPrice(activeTab, selectedDuration);
        
        Alert.alert(
            'Confirmer l\'achat',
            `Voulez-vous souscrire à l'abonnement ${planName} pour ${durationText} au prix de ${formatPrice(price)} ?`,
            [
                {
                    text: 'Annuler',
                    style: 'cancel'
                },
                {
                    text: 'Confirmer',
                    onPress: async () => {
                        try {
                            // Préparer les données pour l'API
                            const abonnementData = {
                                user_id: user.user_id.toString(), // Votre API attend un user_id
                                type_abonnement: planName,
                                prix: price.toString(),
                                duree_jours: getDureeEnJours(selectedDuration),
                                max_annonce: getMaxAnnonces(activeTab),
                                
                            };
                            
                            console.log('Données envoyées:', abonnementData);
                            
                            // Envoyer à l'API
                            const result = await saveAbonnementToDatabase(abonnementData);
                            
                            if (result.success) {
                                Alert.alert(
                                    'Succès',
                                    `Votre abonnement ${planName} pour ${durationText} a été activé avec succès!`,
                                    [
                                        {
                                            text: 'OK',
                                            onPress: () => {
                                                // Mettre à jour le contexte utilisateur si nécessaire
                                                // setUser({...user, abonnement: planName});
                                            }
                                        }
                                    ]
                                );
                            } else {
                                Alert.alert(
                                    'Erreur',
                                    `Une erreur est survenue: ${result.error}\nVeuillez réessayer.`
                                );
                            }
                        } catch (error) {
                            console.error('Erreur complète:', error);
                            Alert.alert(
                                'Erreur',
                                'Une erreur inattendue est survenue. Veuillez réessayer.'
                            );
                        }
                    }
                }
            ]
        );
    };

    // Fonction pour obtenir le texte du bouton d'achat avec le montant
    const getPurchaseButtonText = () => {
        if (loading) {
            return 'Traitement en cours...';
        }
        const price = getPrice(activeTab, selectedDuration);
        return `Acheter maintenant - ${formatPrice(price)}`;
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                {/*le bouton akwaba */}
                <TouchableOpacity 
                    style={[
                        styles.boutton,
                        activeTab === 'akwaba' && styles.activateBotton
                    ]}
                    onPress={() => ChangerBoutton('akwaba')}
                >
                    <Text style={[
                        styles.bouttonText,
                        activeTab === 'akwaba' && styles.activationBouttonText
                    ]}>
                        Akwaba
                    </Text>
                </TouchableOpacity>

                {/* le bouton business */}
                <TouchableOpacity 
                    style={[
                        styles.boutton,
                        activeTab === 'business' && styles.activateBotton
                    ]}
                    onPress={() => ChangerBoutton('business')}
                >
                    <Text style={[
                        styles.bouttonText,
                        activeTab === 'business' && styles.activationBouttonText
                    ]}>
                        Business
                    </Text>
                </TouchableOpacity>

                {/* le bouton premium */}
                <TouchableOpacity 
                    style={[
                        styles.boutton,
                        activeTab === 'premium' && styles.activateBotton
                    ]}
                    onPress={() => ChangerBoutton('premium')}
                >
                    <Text style={[
                        styles.bouttonText,
                        activeTab === 'premium' && styles.activationBouttonText
                    ]}>
                        Premium
                    </Text>
                </TouchableOpacity>
            </View>

            {/* ScrollView pour le contenu */}
            <ScrollView 
                style={styles.scrollView}
                showsVerticalScrollIndicator={true}
                contentContainerStyle={styles.scrollContent}
            >
                {/*le contenu d'akwaba */}
                { activeTab === 'akwaba' && (
                    <View style={styles.card}>
                        <Text style={styles.title}>Abonnement Akwaba</Text>
                        
                        <View style={styles.featureContainer}>
                            <View style={styles.featureRow}>
                                <Text style={styles.featureText}>Nombre d'annonces</Text>
                                <Text style={styles.featureNumber}>10</Text>
                            </View>
                            <View style={styles.featureRow}>
                                <Text style={styles.featureText}>Photos / Vidéos</Text>
                                <Text style={styles.featureNumber}>4</Text>
                            </View>
                            <View style={styles.featureRow}>
                                <Text style={styles.featureText}>Contacts directs</Text>
                                <Text style={styles.featureNumber}>100</Text>
                            </View>
                            <View style={styles.featureRow}>
                                <Text style={[styles.featureText, styles.strikethrough]}>Remonté d'annonce</Text>
                                <Text style={[styles.featureNumber, styles.strikethrough]}>-</Text>
                            </View>
                            <View style={styles.featureRow}>
                                <Text style={[styles.featureText, styles.strikethrough]}>Sponsoring</Text>
                                <Text style={[styles.featureNumber, styles.strikethrough]}>-</Text>
                            </View>
                        </View>

                        {/* Sélection de la durée */}
                        <View style={styles.durationContainer}>
                            <TouchableOpacity 
                                style={[
                                    styles.durationButton,
                                    selectedDuration === '1' && styles.selectedDurationButton
                                ]}
                                onPress={() => setSelectedDuration('1')}
                            >
                                <View style={styles.durationButtonContent}>
                                    <Text style={[
                                        styles.durationText,
                                        selectedDuration === '1' && styles.selectedDurationText
                                    ]}>1 mois</Text>
                                    {selectedDuration === '1' && (
                                        <Text style={styles.mostPopularText}>Populaire</Text>
                                    )}
                                </View>
                            </TouchableOpacity>
                            
                            <TouchableOpacity 
                                style={[
                                    styles.durationButton,
                                    selectedDuration === '3' && styles.selectedDurationButton
                                ]}
                                onPress={() => setSelectedDuration('3')}
                            >
                                <View style={styles.durationButtonContent}>
                                    <Text style={[
                                        styles.durationText,
                                        selectedDuration === '3' && styles.selectedDurationText
                                    ]}>3 mois</Text>
                                    <View style={styles.discountBadge}>
                                        <Text style={styles.discountText}>-10%</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                            
                            <TouchableOpacity 
                                style={[
                                    styles.durationButton,
                                    selectedDuration === '6' && styles.selectedDurationButton
                                ]}
                                onPress={() => setSelectedDuration('6')}
                            >
                                <View style={styles.durationButtonContent}>
                                    <Text style={[
                                        styles.durationText,
                                        selectedDuration === '6' && styles.selectedDurationText
                                    ]}>6 mois</Text>
                                    <View style={styles.discountBadge}>
                                        <Text style={styles.discountText}>-20%</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        </View>

                        {/* Prix */}
                        <View style={styles.priceContainer}>
                            <Text style={styles.price}>{formatPrice(getPrice('akwaba', selectedDuration))}</Text>
                            <Text style={styles.durationLabel}>pour {selectedDuration === '1' ? '1 mois' : `${selectedDuration} mois`}</Text>
                            
                            {/* Afficher l'économie réalisée */}
                            {selectedDuration !== '1' && (
                                <View style={styles.savingsContainer}>
                                    <Text style={styles.savingsText}>
                                        Économisez {getDiscountPercentage(selectedDuration)} 
                                    </Text>
                                    <Text style={styles.originalPrice}>
                                        {formatPrice(getPrice('akwaba', selectedDuration) / (selectedDuration === '3' ? 0.9 : 0.8))}
                                    </Text>
                                </View>
                            )}
                        </View>

                        {/* Bouton Acheter */}
                        <TouchableOpacity 
                            style={[styles.purchaseButton, loading && styles.purchaseButtonDisabled]} 
                            onPress={handlePurchase}
                            disabled={loading}
                        >
                            <Text style={styles.purchaseButtonText}>{getPurchaseButtonText()}</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/*le contenu business */}
                { activeTab === 'business' && (
                    <View style={styles.card}>
                        <Text style={styles.title}>Abonnement Business</Text>
                        
                        <View style={styles.featureContainer}>
                            <View style={styles.featureRow}>
                                <Text style={styles.featureText}>Nombre d'annonces</Text>
                                <Text style={styles.featureNumber}>30</Text>
                            </View>
                            <View style={styles.featureRow}>
                                <Text style={styles.featureText}>Photos / Vidéos</Text>
                                <Text style={styles.featureNumber}>6</Text>
                            </View>
                            <View style={styles.featureRow}>
                                <Text style={styles.featureText}>Contacts directs</Text>
                                <Text style={styles.featureNumber}>Illimités</Text>
                            </View>
                            <View style={styles.featureRow}>
                                <Text style={styles.featureText}>Remonté d'annonce</Text>
                                <Text style={styles.featureNumber}>✓</Text>
                            </View>
                            <View style={styles.featureRow}>
                                <Text style={styles.featureText}>Sponsoring</Text>
                                <Text style={styles.featureNumber}>✓</Text>
                            </View>
                        </View>

                        {/* Sélection de la durée */}
                        <View style={styles.durationContainer}>
                            <TouchableOpacity 
                                style={[
                                    styles.durationButton,
                                    selectedDuration === '1' && styles.selectedDurationButton
                                ]}
                                onPress={() => setSelectedDuration('1')}
                            >
                                <View style={styles.durationButtonContent}>
                                    <Text style={[
                                        styles.durationText,
                                        selectedDuration === '1' && styles.selectedDurationText
                                    ]}>1 mois</Text>
                                    {selectedDuration === '1' && (
                                        <Text style={styles.mostPopularText}>Populaire</Text>
                                    )}
                                </View>
                            </TouchableOpacity>
                            
                            <TouchableOpacity 
                                style={[
                                    styles.durationButton,
                                    selectedDuration === '3' && styles.selectedDurationButton
                                ]}
                                onPress={() => setSelectedDuration('3')}
                            >
                                <View style={styles.durationButtonContent}>
                                    <Text style={[
                                        styles.durationText,
                                        selectedDuration === '3' && styles.selectedDurationText
                                    ]}>3 mois</Text>
                                    <View style={styles.discountBadge}>
                                        <Text style={styles.discountText}>-10%</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                            
                            <TouchableOpacity 
                                style={[
                                    styles.durationButton,
                                    selectedDuration === '6' && styles.selectedDurationButton
                                ]}
                                onPress={() => setSelectedDuration('6')}
                            >
                                <View style={styles.durationButtonContent}>
                                    <Text style={[
                                        styles.durationText,
                                        selectedDuration === '6' && styles.selectedDurationText
                                    ]}>6 mois</Text>
                                    <View style={styles.discountBadge}>
                                        <Text style={styles.discountText}>-20%</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        </View>

                        {/* Prix */}
                        <View style={styles.priceContainer}>
                            <Text style={styles.price}>{formatPrice(getPrice('business', selectedDuration))}</Text>
                            <Text style={styles.durationLabel}>pour {selectedDuration === '1' ? '1 mois' : `${selectedDuration} mois`}</Text>
                            
                            {/* Afficher l'économie réalisée */}
                            {selectedDuration !== '1' && (
                                <View style={styles.savingsContainer}>
                                    <Text style={styles.savingsText}>
                                        Économisez {getDiscountPercentage(selectedDuration)} 
                                    </Text>
                                    <Text style={styles.originalPrice}>
                                        {formatPrice(getPrice('business', selectedDuration) / (selectedDuration === '3' ? 0.9 : 0.8))}
                                    </Text>
                                </View>
                            )}
                        </View>

                        {/* Bouton Acheter */}
                        <TouchableOpacity 
                            style={[styles.purchaseButton, loading && styles.purchaseButtonDisabled]} 
                            onPress={handlePurchase}
                            disabled={loading}
                        >
                            <Text style={styles.purchaseButtonText}>{getPurchaseButtonText()}</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/*le contenu premium */}
                { activeTab === 'premium' && (
                    <View style={styles.card}>
                        <Text style={styles.title}>Abonnement Premium</Text>
                        
                        <View style={styles.featureContainer}>
                            <View style={styles.featureRow}>
                                <Text style={styles.featureText}>Nombre d'annonces</Text>
                                <Text style={styles.featureNumber}>100</Text>
                            </View>
                            <View style={styles.featureRow}>
                                <Text style={styles.featureText}>Photos / Vidéos</Text>
                                <Text style={styles.featureNumber}>6</Text>
                            </View>
                            <View style={styles.featureRow}>
                                <Text style={styles.featureText}>Contacts directs</Text>
                                <Text style={styles.featureNumber}>Illimités</Text>
                            </View>
                            <View style={styles.featureRow}>
                                <Text style={styles.featureText}>Remonté d'annonce</Text>
                                <Text style={styles.featureNumber}>✓</Text>
                            </View>
                            <View style={styles.featureRow}>
                                <Text style={styles.featureText}>Sponsoring</Text>
                                <Text style={styles.featureNumber}>✓</Text>
                            </View>
                        </View>

                        {/* Sélection de la durée */}
                        <View style={styles.durationContainer}>
                            <TouchableOpacity 
                                style={[
                                    styles.durationButton,
                                    selectedDuration === '1' && styles.selectedDurationButton
                                ]}
                                onPress={() => setSelectedDuration('1')}
                            >
                                <View style={styles.durationButtonContent}>
                                    <Text style={[
                                        styles.durationText,
                                        selectedDuration === '1' && styles.selectedDurationText
                                    ]}>1 mois</Text>
                                    {selectedDuration === '1' && (
                                        <Text style={styles.mostPopularText}>Populaire</Text>
                                    )}
                                </View>
                            </TouchableOpacity>
                            
                            <TouchableOpacity 
                                style={[
                                    styles.durationButton,
                                    selectedDuration === '3' && styles.selectedDurationButton
                                ]}
                                onPress={() => setSelectedDuration('3')}
                            >
                                <View style={styles.durationButtonContent}>
                                    <Text style={[
                                        styles.durationText,
                                        selectedDuration === '3' && styles.selectedDurationText
                                    ]}>3 mois</Text>
                                    <View style={styles.discountBadge}>
                                        <Text style={styles.discountText}>-10%</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                            
                            <TouchableOpacity 
                                style={[
                                    styles.durationButton,
                                    selectedDuration === '6' && styles.selectedDurationButton
                                ]}
                                onPress={() => setSelectedDuration('6')}
                            >
                                <View style={styles.durationButtonContent}>
                                    <Text style={[
                                        styles.durationText,
                                        selectedDuration === '6' && styles.selectedDurationText
                                    ]}>6 mois</Text>
                                    <View style={styles.discountBadge}>
                                        <Text style={styles.discountText}>-20%</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        </View>

                        {/* Prix */}
                        <View style={styles.priceContainer}>
                            <Text style={styles.price}>{formatPrice(getPrice('premium', selectedDuration))}</Text>
                            <Text style={styles.durationLabel}>pour {selectedDuration === '1' ? '1 mois' : `${selectedDuration} mois`}</Text>
                            
                            {/* Afficher l'économie réalisée */}
                            {selectedDuration !== '1' && (
                                <View style={styles.savingsContainer}>
                                    <Text style={styles.savingsText}>
                                        Économisez {getDiscountPercentage(selectedDuration)} 
                                    </Text>
                                    <Text style={styles.originalPrice}>
                                        {formatPrice(getPrice('premium', selectedDuration) / (selectedDuration === '3' ? 0.9 : 0.8))}
                                    </Text>
                                </View>
                            )}
                        </View>

                        {/* Bouton Acheter */}
                        <TouchableOpacity 
                            style={[styles.purchaseButton, loading && styles.purchaseButtonDisabled]} 
                            onPress={handlePurchase}
                            disabled={loading}
                        >
                            <Text style={styles.purchaseButtonText}>{getPurchaseButtonText()}</Text>
                        </TouchableOpacity>
                    </View>
                )}
                
                {/* Espace supplémentaire en bas pour le scroll */}
                <View style={styles.bottomSpacing} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#fff',
        marginTop: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    boutton: {
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 15,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        marginHorizontal: 5,
        backgroundColor: '#f8f8f8',
    },
    activateBotton: {
        backgroundColor: '#000',
        borderColor: '#000',
    },
    bouttonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
    },
    activationBouttonText: {
        color: '#fff',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 15,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 4,
        marginBottom: 10,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 20,
        textAlign: 'center',
    },
    featureContainer: {
        marginBottom: 20,
    },
    featureRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    featureText: {
        fontSize: 15,
        color: '#333',
        flex: 1,
    },
    featureNumber: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#000',
        marginLeft: 10,
    },
    strikethrough: {
        textDecorationLine: 'line-through',
        color: '#999',
    },
    durationContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
        backgroundColor: '#f8f8f8',
        borderRadius: 8,
        padding: 4,
    },
    durationButton: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 6,
        marginHorizontal: 3,
    },
    selectedDurationButton: {
        backgroundColor: '#000',
    },
    durationButtonContent: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    durationText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#666',
    },
    selectedDurationText: {
        color: '#fff',
    },
    discountBadge: {
        backgroundColor: '#FF6B6B',
        borderRadius: 4,
        paddingHorizontal: 6,
        paddingVertical: 2,
        marginTop: 4,
    },
    discountText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#fff',
    },
    mostPopularText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#4CAF50',
        marginTop: 4,
    },
    priceContainer: {
        alignItems: 'center',
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
        marginBottom: 20,
    },
    price: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 5,
    },
    durationLabel: {
        fontSize: 13,
        color: '#666',
        marginBottom: 10,
    },
    savingsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    savingsText: {
        fontSize: 12,
        color: '#4CAF50',
        fontWeight: '600',
        marginRight: 8,
    },
    originalPrice: {
        fontSize: 12,
        color: '#999',
        textDecorationLine: 'line-through',
    },
    purchaseButton: {
        backgroundColor: '#000',
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 5,
    },
    purchaseButtonDisabled: {
        backgroundColor: '#666',
        opacity: 0.7,
    },
    purchaseButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
    },
    bottomSpacing: {
        height: 30,
    },
});