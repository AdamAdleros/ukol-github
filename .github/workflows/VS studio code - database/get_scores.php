<?php
$servername = "Game";
$username = "root";
$password = "Dinosaurus1";
$dbname = "game_scores";

$conn = new mysqli($servername, $username, $password, $dbname);


if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$sql = "SELECT nickname, score FROM high_scores ORDER BY score DESC LIMIT 10";
$result = $conn->query($sql);

$topScores = [];
while ($row = $result->fetch_assoc()) {
    $topScores[] = $row;
}

$conn->close();

echo json_encode($topScores);
?>
