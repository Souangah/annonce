<?php
header("Content-Type: application/json");

try {
    $con = new PDO('mysql:host=localhost;dbname=u738064605_demo','u738064605_demo','Demo0709107849!');
    $out = [];

    $json = file_get_contents("php://input");
    $data = json_decode($json, true);

    if (!empty($data['id_annonce']) && !empty($data['user_id']) && !empty($data['nom_prenom'])) {

        $id_annonce = $data['id_annonce'];
        $user_id = $data['user_id'];
        $nom_prenom = $data['nom_prenom'];

        // Identifiant complet à enregistrer
        $identifiant_complet = $user_id . '-' . $nom_prenom;

        // Récupérer la vue actuelle et json_client
        $req = $con->prepare("SELECT vue, json_client FROM annonce WHERE id_annonce = :id_annonce");
        $req->bindParam(":id_annonce", $id_annonce);
        $req->execute();
        $result = $req->fetch();

        if ($result) {
            $vueActuelle = intval($result['vue']);
            $clientsRaw = $result['json_client'];

            // Convertir en tableau
            $clientsArray = array_filter(explode(";", $clientsRaw));
            $userIsNew = !in_array($identifiant_complet, $clientsArray);

            if ($userIsNew) {
                $clientsArray[] = $identifiant_complet;
                $vueActuelle += 1;

                // ✅ Incrémenter le solde de l'utilisateur cliqueur
               $reqSolde = $con->prepare("UPDATE utilisateurs SET solde = solde + 1000 WHERE user_id = :user_id");
               $reqSolde->bindParam(":user_id", $user_id);
               $reqSolde->execute();

                // ✅ Débiter l'utilisateur propriétaire (user_id = 100)
                $debiter = $con->prepare("UPDATE utilisateurs SET solde = solde - 1000 WHERE user_id = 100");
                $debiter->execute();
            }

            // Récupérer le solde actuel de l'utilisateur cliqueur
            $UserSolde = $con->prepare("SELECT solde FROM utilisateurs WHERE user_id = :user_id");
            $UserSolde->bindParam(":user_id", $user_id);
            $UserSolde->execute();
            $soldeResult = $UserSolde->fetch(PDO::FETCH_ASSOC);

            $json_client = implode("; ", $clientsArray);

            // Mise à jour annonce
           $req = $con->prepare("UPDATE annonce SET vue = :vue, json_client = :json_client WHERE id_annonce = :id_annonce");
           $req->bindParam(":vue", $vueActuelle);
           $req->bindParam(":json_client", $json_client);
           $req->bindParam(":id_annonce", $id_annonce);
            $sol =$req->execute();

            if ($sol) {
                $out = [
                    "status" => "success",
                    "solde" => $soldeResult['solde']
                ];
            } else {
                $out = [
                    "status" => "echec",
                    "solde" => $soldeResult['solde']
                ];
            }
        } else {
            $out = [
                "status" => "annonce introuvable"
            ];
        }

        echo json_encode($out);
    } else {
        echo json_encode([
            "status" => "id_annonce, user_id ou nom_prenom manquant"
        ]);
    }

} catch (Exception $e) {
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
}
?>
