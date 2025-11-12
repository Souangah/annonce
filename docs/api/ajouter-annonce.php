<?php
date_default_timezone_set('UTC');

$con = new PDO('mysql:host=localhost;dbname=u738064605_demo','u738064605_demo','Demo0709107849!');

header('Content-Type: application/json');

$out = "";

// Fonction pour envoyer une notification push via Expo
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

try {
     if (!empty($_FILES['sai_photo'])) {
      
    // Récupérer les champs
    $id_annonce = $_POST['id_annonce'];
    $titre = $_POST['titre'];
    $description = $_POST['description'];
    $prix_normal = $_POST['prix_normal'];
    $prix_promo = $_POST['prix_promo'];
    $date = date("Y-m-d");
    $heure = date("H:i:s");
    $user_id = $_POST['user_id'];

    // Photo
    $photo = file_get_contents($_FILES['sai_photo']['tmp_name']);
    $type = mime_content_type($_FILES['sai_photo']['tmp_name']);

    // Insertion
    $req = $con->prepare("INSERT INTO annonce(id_annonce,titre,description,prix_normal,prix_promo,date,heure,photo,type,user_id) 
        VALUES(:id_annonce, :titre, :description, :prix_normal, :prix_promo, :date, :heure, :photo, :type, :user_id)");
    $req->bindParam(":id_annonce", $id_annonce);
    $req->bindParam(":titre", $titre);
    $req->bindParam(":description", $description);
    $req->bindParam(":prix_normal", $prix_normal);
    $req->bindParam(":prix_promo", $prix_promo);
    $req->bindParam(":date", $date);
    $req->bindParam(":heure", $heure);
    $req->bindParam(":photo", $photo, PDO::PARAM_LOB);
    $req->bindParam(":type", $type);
    $req->bindParam(":user_id",$user_id);

    $req->execute();

    // Notifications
    $pushStmt = $con->query("SELECT push_token FROM user_tokens");
    $tokens = $pushStmt->fetchAll(PDO::FETCH_COLUMN);

    $notification_results = [];
    foreach ($tokens as $token) {
        $notif = sendPushNotification(
            $con,
            $token,
            $titre,
            $description,
            [
                'screen' => "Details d'annonce",
                'params' => [
                    'id_annonce' => $id_annonce,
                    'titre' => $titre,
                    'description' => $description,
                    'date' => $date,
                    'heure' => $heure
                ]
            ]
        );
        $notification_results[] = $notif;
    }

    echo json_encode([
        'status' => 'success',
        'message' => "Annonce publiée avec succès",
        'notifications' => $notification_results
    ]);

}else{
    $out = "echec";
}

echo json_encode($out);

} catch (PDOException $e) {
    echo json_encode([
        'status' => 'error',
        'message' => "Erreur SQL: " . $e->getMessage()
    ]);
} catch (Exception $e) {
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
}
?>