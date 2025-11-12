<?php
date_default_timezone_set('UTC');
$con = new PDO('mysql:host=localhost;dbname=u738064605_demo','u738064605_demo','Demo0709107849!');

$data = json_decode(file_get_contents('php://input'), true);
 
$utilisateur_id = $data['utilisateur_id'] ?? null;
$push_token = $data['push_token'] ?? null;

if (!$push_token) {
    http_response_code(400);
    echo json_encode(['error' => 'Token manquant']);
    exit;
}

// Verifier l'existence du token pour un utilisateur

$req = $con->prepare('SELECT * FROM user_tokens WHERE push_token=:push_token and utilisateur_id=:utilisateur_id');
$req->bindParam(':push_token', $push_token);
$req->bindParam(':utilisateur_id', $utilisateur_id);
$req->execute();
$sol = $req->fetchAll();

if(empty($sol))
{

    $sql = "INSERT INTO user_tokens (utilisateur_id,push_token) VALUES (:utilisateur_id,:push_token)";
    $stmt = $con->prepare($sql);
    $stmt->execute([
        'push_token' => $push_token,
        'utilisateur_id' => $utilisateur_id,
    ]);

    echo json_encode(['success' => true]);

}else {
    // update
    $sql = "UPDATE user_tokens SET utilisateur_id=:utilisateur_id WHERE push_token=:push_token";
    $stmt = $con->prepare($sql);
    $stmt->execute([
        'push_token' => $push_token,
        'utilisateur_id' => $utilisateur_id,
    ]);

    echo json_encode(['success' => true]);
    // Le token existe déjà
    //echo json_encode(['success' => true, 'message' => 'Token déjà existant']);
}


?>