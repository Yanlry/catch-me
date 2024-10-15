const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let player = {
  x: canvas.width / 2 - 75,  // Centrer le joueur initialement
  y: canvas.height / 2 - 80,  // Centrer le joueur initialement
  width: 190,
  height: 200,
  image: new Image(),
};

let bot = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  width: 190,
  height: 200,
  speedX: 1,
  speedY: 1,
  image: new Image(),
};

// Charger les images
player.image.src = 'player.png';
bot.image.src = 'bot.png';

let contactTime = 0;
const timeToWin = 2000;
let gameRunning = true;
let level = 1;
const maxLevel = 10;

// Charger le meilleur niveau depuis le localStorage ou initialiser à 1 s'il n'existe pas
let highestLevelReached = parseInt(localStorage.getItem('highestLevelReached')) || 1;

function updateLevelDisplay() {
  document.getElementById('levelDisplay').textContent = `Niveau : ${level} | Meilleur Niveau : ${highestLevelReached}`;
}

// Commencer le jeu seulement lorsque les images sont bien chargées
player.image.onload = function() {
  bot.image.onload = function() {
    updateLevelDisplay();
    updateGame();
  };
};

canvas.addEventListener('mousemove', (e) => {
  const canvasRect = canvas.getBoundingClientRect();
  
  // Calculer l'échelle entre la taille du canvas affichée et la taille réelle du canvas
  const scaleX = canvas.width / canvasRect.width;
  const scaleY = canvas.height / canvasRect.height;

  // Utiliser ces échelles pour calculer la position correcte du joueur
  player.x = (e.clientX - canvasRect.left) * scaleX - player.width / 2;
  player.y = (e.clientY - canvasRect.top) * scaleY - player.height / 2;
});

function drawPlayer() {
  ctx.drawImage(player.image, player.x, player.y, player.width, player.height);
}

function movebot() {
  bot.x += bot.speedX;
  bot.y += bot.speedY;

  if (bot.x + bot.width > canvas.width || bot.x < 0) {
    bot.speedX *= -1;
  }
  if (bot.y + bot.height > canvas.height || bot.y < 0) {
    bot.speedY *= -1;
  }

  ctx.drawImage(bot.image, bot.x, bot.y, bot.width, bot.height);
}

function checkCollision() {
  if (
    player.x < bot.x + bot.width &&
    player.x + player.width > bot.x &&
    player.y < bot.y + bot.height &&
    player.y + player.height > bot.y
  ) {
    contactTime += 16;
    if (contactTime >= timeToWin) {
      if (level >= maxLevel) {
        victory();
      } else {
        nextLevel();
      }
    }
  } else {
    contactTime = 0;
  }
}

function nextLevel() {
  level++;
  bot.speedX = level;
  bot.speedY = level;
  contactTime = 0;
  highestLevelReached = Math.max(highestLevelReached, level);

  // Enregistrer le meilleur niveau dans le localStorage
  localStorage.setItem('highestLevelReached', highestLevelReached);

  updateLevelDisplay();
  updateGame();
}

function victory() {
  gameRunning = false;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Définir la police pour mesurer le texte correctement
  ctx.font = '50px Arial';
  const text = `Félicitations, soit vous êtes bon, soit vous trichez ! 😈`;

  // Mesurer la largeur du texte
  const textMetrics = ctx.measureText(text);
  const textWidth = textMetrics.width;
  const textHeight = 50; // Correspond à la taille de la police

  // Définir la taille et la position du rectangle noir
  const padding = 20; // Ajouter un peu d'espace autour du texte
  const rectWidth = textWidth + padding * 2;
  const rectHeight = textHeight + padding * 2;
  const rectX = canvas.width / 2 - rectWidth / 2;
  const rectY = canvas.height / 2 - rectHeight / 2;

  // Dessiner le rectangle noir pour le fond du texte
  ctx.fillStyle = '#111';
  ctx.fillRect(rectX, rectY, rectWidth, rectHeight);

  // Ajouter le texte par-dessus
  ctx.fillStyle = 'green';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);

  document.getElementById('restartButton').style.display = 'block';
}


function restartGame() {
  // Réinitialiser les positions et les variables
  player.x = canvas.width / 2 - player.width / 2;  // Recentre le joueur
  player.y = canvas.height / 2 - player.height / 2;  // Recentre le joueur
  bot.x = canvas.width / 2;
  bot.y = canvas.height / 2;
  contactTime = 0;
  level = 1;
  bot.speedX = 1;  // Réinitialiser la vitesse au niveau 1
  bot.speedY = 1;

  // Effacer le canvas pour supprimer le message de félicitations
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Remettre à jour l'affichage du niveau et du meilleur score
  updateLevelDisplay();  

  // Masquer les boutons et le message de victoire
  document.getElementById('restartButton').style.display = 'none';
  document.getElementById('victoryMessage').style.display = 'none';

  // Relancer le jeu
  gameRunning = true;
  updateGame();
}

function updateGame() {
  if (!gameRunning) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  movebot();
  drawPlayer();
  checkCollision();

  requestAnimationFrame(updateGame);
}

// Adapter la taille du canvas si la fenêtre change de taille
window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  // Recentre le joueur sur le canvas après redimensionnement
  player.x = canvas.width / 2 - player.width / 2;
  player.y = canvas.height / 2 - player.height / 2;

  updateGame();
});
