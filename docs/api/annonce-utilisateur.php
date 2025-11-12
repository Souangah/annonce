<?php
header('Content-Type: application/json');
date_default_timezone_set('UTC');

try {
    $con = new PDO('mysql:host=localhost;dbname=u738064605_demo', 'u738064605_demo', 'Demo0709107849!');
    $con->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    if (isset($_GET['user_id'])) {
        $user_id = $_GET['user_id'];

        // Récupérer les annonces de cet utilisateur
        $req = $con->prepare("SELECT id_annonce, titre, description, prix_normal, prix_promo, date, heure,TO_BASE64(photo) AS photo64, type,telephone,audience,vue FROM annonce WHERE user_id = :user_id ORDER BY date DESC, heure DESC");
        $req->bindParam(':user_id', $user_id);
        $req->execute();
        $sol = $req->fetchAll();

        if (count($sol) > 0) {
            echo json_encode([
                'status' => 'success',
                'annonces' => $sol
            ]);
        } else {
            echo json_encode([
                'status' => 'empty',
                'message' => 'Aucune annonce trouvée pour cet utilisateur.'
            ]);
        }
    } else {
        echo json_encode([
            'status' => 'error',
            'message' => 'Paramètre user_id manquant. Veuillez vous connecter.'
        ]);
    }

} catch (PDOException $e) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Erreur SQL: ' . $e->getMessage()
    ]);
}
?>
