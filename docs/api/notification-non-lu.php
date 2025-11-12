<?php
header('Content-Type: application/json');

try {
    $con = new PDO('mysql:host=localhost;dbname=u738064605_demo', 'u738064605_demo', 'Demo0709107849!');

    if (isset($_GET['user_id'])) {
        $user_id = $_GET['user_id'];

        $req = $con->prepare("SELECT COUNT(id_annonce) AS total FROM annonce WHERE json_client NOT LIKE '%':user_id'%'");
        $req->execute(['user_id' => $user_id]);
        $result = $req->fetchAll(PDO::FETCH_ASSOC);

        print_r(json_encode($result));

    } else {
        echo json_encode([
            'status' => 'error',
            'message' => 'user_id manquant'
        ]);
    }

} catch (PDOException $e) {
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
}
?>


