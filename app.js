const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');

const playerScores = {};
let connectedPlayers = [];
let gameStarted = false;

app.use(express.static(path.join(__dirname, '')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

io.on('connection', (socket) => {
  console.log('Un nouveau joueur s\'est connecté');

  function checkPlayersAndStartGame() {
    if (connectedPlayers.length >= 4 && !gameStarted) {
      gameStarted = true;
      io.emit('startGame');
    }
  }

  socket.on('newPlayer', (username) => {
    addNewPlayer(username, socket);
    checkPlayersAndStartGame();
  });

  socket.on('playerAnswer', (data) => {
    updatePlayerScore(data.username, data.isCorrect);
    io.emit('playerScore', { playerScores });
  });

  socket.on('nextQuestion', (currentQuestion) => {
    io.emit('nextQuestion', { currentQuestion });
  });

  socket.on('startGame', () => {
    gameStarted = true;
    io.emit('startGame');
  });

  socket.on('gameFinished', () => {
    let highestScore = 0;
    let winner = null;
    for (const [player, score] of Object.entries(playerScores)) {
      if (score > highestScore) {
        highestScore = score;
        winner = player;
      }
    }
    io.emit('showWinner', { winner });
  });

  socket.on('disconnect', () => {
    console.log('Un joueur s\'est déconnecté');
    connectedPlayers = connectedPlayers.filter(player => player.id !== socket.id);
    gameStarted = false;
  });
});

function addNewPlayer(username, socket) {
  connectedPlayers.push({ id: socket.id, username });
  playerScores[username] = 0;
  io.emit('playerScore', { playerScores });
}

function updatePlayerScore(username, isCorrect) {
    if (isCorrect) {
      playerScores[username]++;
    }
  
    // Trouver le joueur avec le score le plus élevé
    let highestScore = 0;
    let winner = null;
    for (const [player, score] of Object.entries(playerScores)) {
      if (score > highestScore) {
        highestScore = score;
        winner = player;
      }
    }
  }

const port = process.env.PORT || 3000;
http.listen(port, () => {
  console.log(`Serveur en écoute sur le port ${port}`);
});