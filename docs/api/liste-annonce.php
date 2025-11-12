<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
date_default_timezone_set('Africa/Abidjan');

try {
    // Connexion à la base
    $con = new PDO(
        'mysql:host=localhost;dbname=u738064605_demo;charset=utf8mb4',
        'u738064605_demo',
        'Demo0709107849!',
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );

    // Requête avec jointure sur 3 tables : annonce + utilisateur + media_annonce
    $sql = "
        SELECT 
            a.id_annonce, 
            a.titre, 
            a.description, 
            a.prix_normal, 
            a.prix_promo, 
            a.date, 
            a.heure, 
            a.type, 
            a.duree, 
            a.telephone, 
            a.audience, 
            a.vue,
            a.ville,
            m.id_media,
            m.type_media,
            TO_BASE64(m.fichier) AS fichier64,
            m.type_fichier,
            m.date AS media_date,
            u.nom_prenom AS utilisateur
        FROM annonce a
        JOIN utilisateurs u ON a.user_id = u.user_id
        LEFT JOIN media_annonce m ON a.id_annonce = m.id_annonce
        ORDER BY a.date DESC, a.heure DESC, m.date ASC
    ";

    $req = $con->prepare($sql);
    $req->execute();
    $results = $req->fetchAll(PDO::FETCH_ASSOC);

    $annonces = [];

    foreach ($results as $row) {
        $id_annonce = $row['id_annonce'];

        // Si l'annonce n'existe pas encore dans le tableau
        if (!isset($annonces[$id_annonce])) {
            $annonces[$id_annonce] = [
                'id_annonce'   => $row['id_annonce'],
                'titre'        => $row['titre'],
                'description'  => $row['description'],
                'prix_normal'  => $row['prix_normal'],
                'prix_promo'   => $row['prix_promo'],
                'date'         => $row['date'],
                'heure'        => $row['heure'],
                'type'         => $row['type'],
                'duree'        => $row['duree'],
                'telephone'    => $row['telephone'],
                'audience'     => $row['audience'],
                'vue'          => $row['vue'],
                'ville'        => $row['ville'],
                'utilisateur'  => $row['utilisateur'], // 🧍 nom de l'utilisateur
                'medias'       => [],
                'photo64'      => null
            ];
        }

        // Si la ligne contient un média
        if (!empty($row['id_media'])) {
            $media = [
                'id_media'     => $row['id_media'],
                'type_media'   => $row['type_media'],
                'fichier64'    => $row['fichier64'],
                'type_fichier' => $row['type_fichier'],
                'date'         => $row['media_date']
            ];

            $annonces[$id_annonce]['medias'][] = $media;

            // Première image = photo principale
            if (
                !$annonces[$id_annonce]['photo64'] && 
                strtolower($row['type_media']) === 'image'
            ) {
                $annonces[$id_annonce]['photo64'] = $row['fichier64'];
            }
        }
    }

    // Conversion en tableau indexé
    $annonces = array_values($annonces);

    echo json_encode($annonces, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Erreur base de données : " . $e->getMessage()]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Erreur inattendue : " . $e->getMessage()]);
}
?>
