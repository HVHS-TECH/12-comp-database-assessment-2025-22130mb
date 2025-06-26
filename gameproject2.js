// Game Project
// Written by Max Bergman

// Initialize Firebase (using compat version loaded in HTML)
const database = firebase.database();
const auth = firebase.auth();

var timerValue = 10;
var Ballnumber = 1;
var Score = 0;
var timer = 10;
var currentBall;
var imgFace, imgHammer;
var Background;
var gameState = "start";
var scoreSaved = false; 

function preload() {
    imgBG = loadImage('images/background2.png');
    imgFace = loadImage('images/coin.png');
    imgHammer = loadImage('images/hammer.png');
    Background = loadImage('images/background2.png');
}

function setup() {
    createCanvas(1000, 1000);
    imgFace.resize(150, 150);

    bat = new Sprite(400, 400, 400, 400, 'd');
    bat.img = imgHammer;
    bat.scale = 0.2;
    bat.visible = false;

    wallLH = new Sprite(0, 500, 15, 1000, 'k');
    wallRH = new Sprite(1000, 500, 15, 1000, 'k');
    wallTop = new Sprite(500, 0, 1000, 15, 'k');
    wallBot = new Sprite(500, 1000, 1000, 15, 'k');

    wallLH.color = wallRH.color = wallTop.color = wallBot.color = 'white';
    wallLH.visible = wallRH.visible = wallTop.visible = wallBot.visible = false;
}

function draw() {
    if (gameState === "start") {
        showStartScreen();
    } else if (gameState === "playing") {
        background(Background);

        bat.visible = true;
        wallLH.visible = true;
        wallRH.visible = true;
        wallTop.visible = true;
        wallBot.visible = true;

        bat.position.x = mouseX;
        bat.position.y = mouseY;

        score();
        displayTimer();
    } else if (gameState === "end") {
        showEndScreen();
    }
}

function mousePressed() {
    if (gameState === "start") {
        gameState = "playing";
        createBall();
    }
}

function keyPressed() {
    checkKey(key);
}

function checkKey(_keyPressed) {
    if (_keyPressed === " " || _keyPressed === "Enter") {
        if (gameState === "start") {
            gameState = "playing";
            createBall();
        }
    } else if (_keyPressed === 'r' || _keyPressed === 'R') {
        restartGame();
    }
}

function displayTimer() {
    textSize(100);
    fill('Black');
    textAlign(CENTER, CENTER);
    text(timer, width / 2, height / 2);

    if (frameCount % 60 == 0 && timer > 0) {
        timer--;
    }

    if (timer <= 0) {
        gameState = "end";
    }
}

function score() {
    textSize(35);
    fill('Black');
    text("Score: " + Score, 80, 50);
}

function createBall() {
    if (currentBall) {
        currentBall.remove();
    }

    currentBall = new Sprite(random(100, 900), random(100, 900), 50, 50, 'k');
    currentBall.img = imgFace;
    currentBall.scale = 0.5;

    currentBall.collides(bat, function (ball, bat) {
        ball.remove();
        Score++;
        createBall();
    });
}

function showStartScreen() {
    background(0);
    textSize(50);
    fill('white');
    textAlign(CENTER, CENTER);
    text("Click or Press Enter To Start", width / 2, height / 2);
}


function saveScoreToFirebase(score) {
    const user = auth.currentUser;
    if (!user) {
        console.log("User not authenticated - score not saved");
        return;
    }

    const safeUid = user.uid.replace(/\./g, '_');
    const playerName = localStorage.getItem('name') || "Anonymous";

    database.ref('Scores/' + safeUid).set({
        name: playerName,
        score: score,
        game: "coin"
    }).then(() => {
        console.log("Score saved successfully:", score);
    }).catch((error) => {
        console.error("Error saving score:", error);
    });
}

function showEndScreen() {
    background(0);
    textSize(50);
    fill('white');
    textAlign(CENTER, CENTER);
    text("Game Over!", width / 2, height / 2);
    text("Score: " + Score, width / 2, height / 2 + 50);
    textSize(25);
    text("Press 'R' to Restart", width / 2, height / 2 + 100);

    // Hide game elements
    imgHammer.visible = false;
    bat.visible = false;
    wallLH.visible = false;
    wallRH.visible = false;
    wallTop.visible = false;
    wallBot.visible = false;

    
    if (!scoreSaved) {
        saveScoreToFirebase(Score);
        scoreSaved = true;
    }

    // Remove current ball
    if (currentBall) {
        currentBall.remove();
    }

    // Display score coins
    for (let i = 0; i < Score; i++) {
        image(
            imgFace,
            200 + (i % 10) * 60,
            height / 2 + 150 + floor(i / 10) * 60,
            50, 50
        );
    }
}

function restartGame() {
    gameState = "start";
    Score = 0;
    timer = 10;
    frameCount = 0;
    scoreSaved = false; 
    if (currentBall) {
        currentBall.remove();
    }
}

function fb_write() {
  const playerName = document.getElementById("name").value || "Anonymous";
 
}