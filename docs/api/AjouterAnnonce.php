<?php
date_default_timezone_set('UTC');

$con = new PDO('mysql:host=localhost;dbname=u738064605_demo', 'u738064605_demo', 'Demo0709107849!');

header('Content-Type: application/json');

$out = "";

function sendPushNotification($con, $expo_push_token, $title, $body, $data = []) {
    $url = 'https://exp.host/--/api/v2/push/send';
    $payload = [
        'to' => $expo_push_token,
        'sound' => 'default',
        'title' => $title,
        'body' => $body,
        'data' => $data,
        'priority' => 'high'
    ];

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Accept: application/json',
        'Accept-encoding: gzip, deflate',
        'Content-Type: application/json'
    ]);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

    $response = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($http_code !== 200) {
        error_log("Erreur HTTP $http_code pour push: $response");
        return ['status' => 'error', 'http_code' => $http_code, 'response' => $response];
    }

    $result = json_decode($response, true);
    return ['status' => 'ok', 'receipt' => $result];
}

function generateMediaId() {
    return uniqid('media_', true);
}

function getMediaType($mime_type) {
    if (strpos($mime_type, 'video/') !== false) {
        return 'video';
    } elseif (strpos($mime_type, 'image/') !== false) {
        return 'image';
    } else {
        return 'image'; // fallback
    }
}

try {
    // Récupération des champs
    $id_annonce = $_POST['id_annonce'];
    $titre = $_POST['titre'];
    $description = $_POST['description'];
    $prix_normal = $_POST['prix_normal'];
    $prix_promo = $_POST['prix_promo'];
    $date = date("Y-m-d");
    $heure = date("H:i:s");
    $duree = '7';
    $date_fin = date('Y-m-d H:i:s', strtotime("+$duree days"));
    $user_id = $_POST['user_id'];
    $audience = $_POST['audience'];
    $prix_annonce = $_POST['prix_annonce'];
    $telephone = $_POST['telephone'];
    $nombre_medias = isset($_POST['nombre_medias']) ? intval($_POST['nombre_medias']) : 0;

    // Vérification du rôle
    $req = $con->prepare("SELECT * FROM utilisateurs WHERE user_id=:user_id");
    $req->bindParam(":user_id", $user_id);
    $req->execute();
    $VerifRole = $req->fetchAll();

    // Vérification de l'etat autorisation
    $req = $con->prepare("SELECT * FROM autorisations WHERE user_id=:user_id");
    $req->bindParam(":user_id", $user_id);
    $req->execute();
    $VerifAutorisation = $req->fetchAll();

    if($VerifAutorisation[0]['etat_autorisation'] == 'Actif') {
        // Vérifier audience disponible
        $req = $con->prepare("SELECT count(*) AS nombre FROM utilisateurs");
        $req->execute();
        $VerificationAudience = $req->fetchAll();

        if($_POST['audience'] <= $VerificationAudience[0]['nombre']) {

            if ($VerifAutorisation[0]['autorisation_annonce'] > $VerifAutorisation[0]['nombre_annonce'] || 
                ($VerifAutorisation[0]['autorisation_annonce'] <= $VerifAutorisation[0]['nombre_annonce'] && $VerifRole[0]['role'] == 'Administrateur')) {

                // Vérifier qu'il y a au moins un média
                if ($nombre_medias > 0 && !empty($_FILES['sai_media'])) {
                    
                    // Insérer l'annonce principale
                    $req = $con->prepare("INSERT INTO annonce (id_annonce, titre, description, prix_normal, prix_promo, date, heure, user_id, prix_annonce, audience,  date_fin, duree, telephone) 
                    VALUES (:id_annonce, :titre, :description, :prix_normal, :prix_promo, :date, :heure, :user_id,:prix_annonce, :audience, :date_fin, :duree, :telephone)");
                    $req->bindParam(":id_annonce", $id_annonce);
                    $req->bindParam(":titre", $titre);
                    $req->bindParam(":description", $description);
                    $req->bindParam(":prix_normal", $prix_normal);
                    $req->bindParam(":prix_promo", $prix_promo);
                    $req->bindParam(":date", $date);
                    $req->bindParam(":heure", $heure);
                    $req->bindParam(":user_id", $user_id);
                    $req->bindParam(":prix_annonce", $prix_annonce);
                    $req->bindParam(":audience", $audience);
                    $req->bindParam(":date_fin", $date_fin);
                    $req->bindParam(":duree", $duree);
                    $req->bindParam(":telephone", $telephone);
                    $req->execute();

                    // Insérer les médias dans la table media_annonce
                    $medias_inserted = 0;
                    
                    // Gestion des médias multiples
                    if (is_array($_FILES['sai_media']['name'])) {
                        // Multiple files
                        for ($i = 0; $i < count($_FILES['sai_media']['name']); $i++) {
                            if ($_FILES['sai_media']['error'][$i] === UPLOAD_ERR_OK) {
                                $fichier = file_get_contents($_FILES['sai_media']['tmp_name'][$i]);
                                $type_fichier = $_FILES['sai_media']['type'][$i];
                                $type_media = getMediaType($type_fichier);
                                
                                $id_media = generateMediaId();
                                
                                $req_media = $con->prepare("INSERT INTO media_annonce (id_media, id_annonce, type_media, fichier, type_fichier, date) 
                                    VALUES (:id_media, :id_annonce, :type_media, :fichier, :type_fichier, :date)");
                                $req_media->bindParam(":id_media", $id_media);
                                $req_media->bindParam(":id_annonce", $id_annonce);
                                $req_media->bindParam(":type_media", $type_media);
                                $req_media->bindParam(":fichier", $fichier, PDO::PARAM_LOB);
                                $req_media->bindParam(":type_fichier", $type_fichier);
                                $req_media->bindParam(":date", $date);
                                $req_media->execute();
                                
                                $medias_inserted++;
                            }
                        }
                    } else {
                        // Single file
                        if ($_FILES['sai_media']['error'] === UPLOAD_ERR_OK) {
                            $fichier = file_get_contents($_FILES['sai_media']['tmp_name']);
                            $type_fichier = $_FILES['sai_media']['type'];
                            $type_media = getMediaType($type_fichier);
                            
                            $id_media = generateMediaId();
                            
                            $req_media = $con->prepare("INSERT INTO media_annonce (id_media, id_annonce, type_media, fichier, type_fichier, date) 
                                VALUES (:id_media, :id_annonce, :type_media, :fichier, :type_fichier, :date)");
                            $req_media->bindParam(":id_media", $id_media);
                            $req_media->bindParam(":id_annonce", $id_annonce);
                            $req_media->bindParam(":type_media", $type_media);
                            $req_media->bindParam(":fichier", $fichier, PDO::PARAM_LOB);
                            $req_media->bindParam(":type_fichier", $type_fichier);
                            $req_media->bindParam(":date", $date);
                            $req_media->execute();
                            
                            $medias_inserted++;
                        }
                    }

                    // Mettre à jour le nombre d'annonces
                    $req = $con->prepare("UPDATE autorisations SET nombre_annonce=nombre_annonce + 1 WHERE user_id=:user_id");
                    $req->bindParam(":user_id", $user_id);
                    $req->execute();

                    // Envoi notifications
                    $req = $con->prepare("SELECT push_token FROM user_tokens WHERE utilisateur_id!=:user_id AND push_token IS NOT NULL AND push_token <> '' ORDER BY RAND() LIMIT :audience");
                    $req->bindValue(":audience", (int)$audience, PDO::PARAM_INT);
                    $req->bindValue(":user_id", $user_id);
                    $req->execute();
                    $tokens = $req->fetchAll(PDO::FETCH_COLUMN);
                    $notification_results = [];

                    foreach ($tokens as $token) {
                        $notification_results[] = sendPushNotification($con, $token, $titre, $description, [
                            'screen' => "Details d'annonce",
                            'params' => [
                                'id_annonce' => $id_annonce,
                                'titre' => $titre,
                                'description' => $description,
                                'date' => $date,
                                'heure' => $heure
                            ]
                        ]);
                    }

                    echo json_encode([
                        'status' => 'success',
                        'message' => "Annonce publiée avec succès avec $medias_inserted médias",
                        'medias_inserted' => $medias_inserted,
                        'notifications' => $notification_results
                    ]);

                } else {
                    echo json_encode(['status' => 'error', 'message' => "Aucun média fourni"]);
                }

            } else {
                // Si autorisation atteinte - version premium

                $req = $con->prepare("SELECT solde FROM utilisateurs WHERE user_id=:user_id");
                $req->bindParam(":user_id", $user_id);
                $req->execute();
                $VerificationSolde = $req->fetchAll();

                if($_POST['prix_annonce'] <= $VerificationSolde[0]["solde"]) {

                    // Débit + Crédit
                    $con->beginTransaction();
                    $req = $con->prepare("UPDATE utilisateurs SET solde = solde - :prix_annonce WHERE user_id = :user_id");
                    $req->bindParam(":user_id", $user_id);
                    $req->bindParam(":prix_annonce", $prix_annonce);
                    $req->execute();

                    $req = $con->prepare("UPDATE utilisateurs SET solde = solde + :prix_annonce WHERE user_id = 100");
                    $req->bindParam(":prix_annonce", $prix_annonce);
                    $req->execute();
                    $con->commit();

                    if ($nombre_medias > 0 && !empty($_FILES['sai_media'])) {
                        
                        // Insérer l'annonce principale
                        $req = $con->prepare("INSERT INTO annonce (id_annonce, titre, description, prix_normal, prix_promo, date, heure,user_id, prix_annonce, audience, date_fin, duree, telephone) 
                        VALUES (:id_annonce, :titre, :description, :prix_normal, :prix_promo,:date,
                            :heure,:user_id,:prix_annonce,:audience,:date_fin, :duree, :telephone)");
                        $req->bindParam(":id_annonce", $id_annonce);
                        $req->bindParam(":titre", $titre);
                        $req->bindParam(":description", $description);
                        $req->bindParam(":prix_normal", $prix_normal);
                        $req->bindParam(":prix_promo", $prix_promo);
                        $req->bindParam(":date", $date);
                        $req->bindParam(":heure", $heure);
                        $req->bindParam(":user_id", $user_id);
                        $req->bindParam(":prix_annonce", $prix_annonce);
                        $req->bindParam(":audience", $audience);
                        $req->bindParam(":date_fin", $date_fin);
                        $req->bindParam(":duree", $duree);
                        $req->bindParam(":telephone", $telephone);
                        $req->execute();

                        // Insérer les médias
                        $medias_inserted = 0;
                        
                        if (is_array($_FILES['sai_media']['name'])) {
                            for ($i = 0; $i < count($_FILES['sai_media']['name']); $i++) {
                                if ($_FILES['sai_media']['error'][$i] === UPLOAD_ERR_OK) {
                                    $fichier = file_get_contents($_FILES['sai_media']['tmp_name'][$i]);
                                    $type_fichier = $_FILES['sai_media']['type'][$i];
                                    $type_media = getMediaType($type_fichier);
                                    
                                    $id_media = generateMediaId();
                                    
                                    $req_media = $con->prepare("INSERT INTO media_annonce (id_media, id_annonce, type_media, fichier, type_fichier, date) 
                                        VALUES (:id_media, :id_annonce, :type_media, :fichier, :type_fichier, :date)");
                                    $req_media->bindParam(":id_media", $id_media);
                                    $req_media->bindParam(":id_annonce", $id_annonce);
                                    $req_media->bindParam(":type_media", $type_media);
                                    $req_media->bindParam(":fichier", $fichier, PDO::PARAM_LOB);
                                    $req_media->bindParam(":type_fichier", $type_fichier);
                                    $req_media->bindParam(":date", $date);
                                    $req_media->execute();
                                    
                                    $medias_inserted++;
                                }
                            }
                        } else {
                            if ($_FILES['sai_media']['error'] === UPLOAD_ERR_OK) {
                                $fichier = file_get_contents($_FILES['sai_media']['tmp_name']);
                                $type_fichier = $_FILES['sai_media']['type'];
                                $type_media = getMediaType($type_fichier);
                                
                                $id_media = generateMediaId();
                                
                                $req_media = $con->prepare("INSERT INTO media_annonce (id_media, id_annonce, type_media, fichier, type_fichier, date) 
                                    VALUES (:id_media, :id_annonce, :type_media, :fichier, :type_fichier, :date)");
                                $req_media->bindParam(":id_media", $id_media);
                                $req_media->bindParam(":id_annonce", $id_annonce);
                                $req_media->bindParam(":type_media", $type_media);
                                $req_media->bindParam(":fichier", $fichier, PDO::PARAM_LOB);
                                $req_media->bindParam(":type_fichier", $type_fichier);
                                $req_media->bindParam(":date", $date);
                                $req_media->execute();
                                
                                $medias_inserted++;
                            }
                        }

                        $req = $con->prepare("UPDATE autorisations SET nombre_annonce=nombre_annonce + 1 WHERE user_id=:user_id");
                        $req->bindParam(":user_id", $user_id);
                        $req->execute();

                        // Notifications
                        $req = $con->prepare("SELECT push_token FROM user_tokens WHERE utilisateur_id!=:user_id AND push_token IS NOT NULL AND push_token <> '' ORDER BY RAND() LIMIT :audience");
                        $req->bindValue(":audience", (int)$audience, PDO::PARAM_INT);
                        $req->bindValue(":user_id", $user_id);
                        $req->execute();
                        $tokens = $req->fetchAll(PDO::FETCH_COLUMN);
                        $notification_results = [];

                        foreach ($tokens as $token) {
                            $notification_results[] = sendPushNotification($con, $token, $titre, $description, [
                                'screen' => "Details d'annonce",
                                'params' => [
                                    'id_annonce' => $id_annonce,
                                    'titre' => $titre,
                                    'description' => $description,
                                    'date' => $date,
                                    'heure' => $heure
                                ]
                            ]);
                        }

                        echo json_encode([
                            'status' => 'success',
                            'message' => "Annonce premium publiée avec succès avec $medias_inserted médias",
                            'medias_inserted' => $medias_inserted,
                            'notifications' => $notification_results
                        ]);

                    } else {
                        echo json_encode(['status' => 'error', 'message' => "Aucun média fourni"]);
                    }

                } else {
                    echo json_encode(['status' => 'error', 'message' => "Solde insuffisant"]);
                }
            }

        } else {
            echo json_encode(['status' => 'error', 'message' => "Nombre d'audience indisponible"]);
        }

    } else {
        echo json_encode(['status' => 'error', 'message' => "Votre compte est inactif"]);
    }

} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => "Erreur SQL: " . $e->getMessage()]);
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>