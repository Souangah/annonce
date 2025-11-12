<?php
header('Content-Type: application/json; charset=utf-8');

try { 
    $con = new PDO('mysql:host=localhost;dbname=u738064605_demo', 'u738064605_demo', 'Demo0709107849!');
    $con->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $json = file_get_contents("php://input");
    $data = json_decode($json, true);

    if (!empty($data['id'])) {
        $req = $con->prepare('INSERT INTO utilisateurs
                              VALUES (:id, :nom_prenom, :telephone, :mdp)');
        
        $req->bindParam(':id', $data['id']);
        $req->bindParam(':nom_prenom', $data['nom_prenom']);
        $req->bindParam(':telephone', $data['telephone']);
        $req->bindParam(':mdp', $data['mdp']);

        $sol = $req->execute();

        if ($sol) {
            echo json_encode(['message' => 'Succès']);
        } else {
            echo json_encode(['message' => 'Échec']);
        }

    } else {
        echo json_encode(['message' => 'Saisir un matricule']);
    }

} catch (Exception $e) {
    echo json_encode(['message' => 'Erreur : ' . $e->getMessage()]);
}
?>
