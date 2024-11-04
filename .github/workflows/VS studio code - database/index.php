<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Chase Me Game</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div id="game-container">
        <h1>PAN SEVERA V AKCI</h1>
        <button id="start-button">START</button>

        <div id="score-board">
            <p>High Score: <span id="high-score">0</span></p>
        </div>

        <div id="music-controls">
      <button id="toggle-music">Pause Music</button>
      <label>Volume:
        <input id="volume-control" type="range" min="0" max="1" step="0.1" value="0.5">
      </label>
    </div>
   </div>
        <canvas id="game-canvas"></canvas>

        <div id="game-over" style="display: none;">
            <h2>Game Over!</h2>
            <p id="score-display"></p>
            
            <!-- Nickname input and submit button for score submission -->
            <input type="text" id="nickname-input" placeholder="Enter your nickname">
            <button id="submit-score-button">Submit Score</button>
            
            <button id="restart-button">Play Again</button>
        </div>

        <div id="high-score-display"></div>
    </div>

    <script src="script.js"></script>
</body>
</html>