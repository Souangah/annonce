<?php
header('Content-Type: application/json; charset=utf-8');

try { 
    $con = new PDO('mysql:host=localhost;dbname=u738064605_demo', 'u738064605_demo', 'Demo0709107849!');
    $con->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $json = file_get_contents("php://input");
    $data = json_decode($json, true);

    // Vérification si le téléphone existe déjà
    $req = $con->prepare("SELECT * FROM utilisateurs WHERE telephone = :telephone");
    $req->bindParam(":telephone", $data['telephone']);
    $req->execute();
    $verifUtilisateur = $req->fetchAll();

    if (empty($verifUtilisateur)) {

        if(!empty($data['telephone']))
        {
        $etat = "Actif";
        $role = "client";
        $date = date("Y-m-d");
        $heure = date("H:i:s");
        $user_id = "USER" . date("YmdHis");

        $req = $con->prepare("INSERT INTO utilisateurs (user_id, nom_prenom, telephone, mdp, etat, role, date, heure) 
                              VALUES (:user_id, :nom_prenom, :telephone, :mdp, :etat, :role, :date, :heure)");
        $req->bindParam(':user_id', $user_id);
        $req->bindParam(':nom_prenom', $data['nom_prenom']);
        $req->bindParam(':telephone', $data['telephone']);
        $req->bindParam(':mdp', $data['mdp']);
        $req->bindParam(':etat', $etat);
        $req->bindParam(':role', $role);
        $req->bindParam(':date', $date);
        $req->bindParam(':heure', $heure);

        if ($req->execute()) {
            // Insertion autorisation
            $autorisation_annonce = "2";
            $frais = "1";
            $recharge_min = "500";
            $recharge_max = "200000";
            $retrait_min = "1000";
            $etat_autorisation = "Actif";
            $id_autorisation = "AUT" . date("YmdHis");

            $req = $con->prepare("INSERT INTO autorisations (id_autorisation, autorisation_annonce, frais, recharge_max, recharge_min, retrait_min, user_id, etat_autorisation) 
                                  VALUES (:id_autorisation, :autorisation_annonce, :frais, :recharge_min, :recharge_max, :retrait_min, :user_id, :etat_autorisation)");
            $req->bindParam(":id_autorisation", $id_autorisation);
            $req->bindParam(":autorisation_annonce", $autorisation_annonce);
            $req->bindParam(":frais", $frais);
            $req->bindParam(":recharge_min", $recharge_min);
            $req->bindParam(":recharge_max", $recharge_max);
            $req->bindParam(":retrait_min", $retrait_min);
            $req->bindParam(":user_id", $user_id);
            $req->bindParam(":etat_autorisation", $etat_autorisation);
            $req->execute();
            if ($sol==true) {
                echo json_encode('Utilisateur inscrit avec succes');
            } else {
                echo json_encode( "Échec de l'enregistrement des autorisations");
            }

        } else {
            echo json_encode("Échec de l'enregistrement de l'utilisateur");
        }

    }

    } else {
        echo json_encode("Ce numero est deja utilise");
    }

} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => 'Erreur : ' . $e->getMessage()]);
}
?>
