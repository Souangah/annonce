<?php
$servername = "localhost"; // Remplacer par l'adresse de ton serveur MySQL
$username = "root"; // Remplacer par le nom d'utilisateur MySQL
$password = ""; // Remplacer par le mot de passe MySQL
$dbname = "eglise_db"; // Remplacer par le nom de la base de données

// Connexion à la base de données
$conn = new mysqli($servername, $username, $password, $dbname);

// Vérifier la connexion
if ($conn->connect_error) {
    die("Échec de la connexion : " . $conn->connect_error);
}

// Récupérer les données du formulaire
$nom = $_POST['nom'];
$role = $_POST['role'];

// Insertion dans la base de données
$sql = "INSERT INTO membres (nom, role) VALUES ('$nom', '$role')";

if ($conn->query($sql) === TRUE) {
    echo "Nouveau membre ajouté avec succès";
} else {
    echo "Erreur : " . $sql . "<br>" . $conn->error;
}

$conn->close();
?>
