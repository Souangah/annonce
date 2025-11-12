<?php

$con= new PDO('mysql:host=localhost;dbname=u738064605_demo','u738064605_demo','Demo0709107849!');

if(isset($_GET['id_annonce']))
{
    $req=$con->prepare('SELECT titre,description,prix_normal,prix_promo,date,heure,TO_BASE64(photo) AS photo64,type FROM annonce WHERE id_annonce=:id_annonce');
    $req->bindparam(":id_annonce",$_GET['id_annonce']);
        $req->execute();
        $sol = $req->fetchAll();

        print_r(json_encode($sol));

}
 ?>