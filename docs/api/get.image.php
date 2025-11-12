<?php
if (isset($_GET['id'])) {
    $id = $_GET['id'];

    try {
        $con = new PDO('mysql:host=localhost;dbname=u738064605_demo', 'u738064605_demo', 'Demo0709107849!');
        $con->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        $req = $con->prepare("SELECT photo FROM annonce WHERE id_annonce = :id");
        $req->bindParam(':id', $id);
        $req->execute();

        if ($row = $req->fetch(PDO::FETCH_ASSOC)) {
            // Si tu es sûr que ce sont toutes des JPEG
            header("Content-Type: image/jpeg");
            echo $row['photo'];
            exit;
        } else {
            http_response_code(404);
            echo "Image non trouvée";
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo "Erreur serveur : " . $e->getMessage();
    }
} else {
    http_response_code(400);
    echo "Paramètre 'id' manquant";
}
?>
