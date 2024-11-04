<?php
$servername = "Game";
$username = "root";
$password = "Dinosaurus1";
$dbname = "game_scores";

// Connect to the database
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Get data from POST request
$nickname = $_POST['nickname'];
$score = (int)$_POST['score'];

// Insert the score into the database
$stmt = $conn->prepare("INSERT INTO high_scores (nickname, score) VALUES (?, ?)");
$stmt->bind_param("si", $nickname, $score);
$stmt->execute();
$stmt->close();

// Determine player's rank if outside the top 10
$rank_query = $conn->prepare("SELECT COUNT(*) + 1 AS rank FROM high_scores WHERE score > ?");
$rank_query->bind_param("i", $score);
$rank_query->execute();
$rank_result = $rank_query->get_result();
$rank = $rank_result->fetch_assoc()['rank'];
$rank_query->close();

$conn->close();

// Return rank as JSON
echo json_encode(["rank" => $rank]);
?>
