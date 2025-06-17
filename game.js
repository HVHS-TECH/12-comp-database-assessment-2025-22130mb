// Game Project
// Written by Max Bergman

var timerValue = 10;
var Ballnumber = 1;
var Score = 0;
var timer = 10;
var currentBall;
var imgFace, imgHammer;
var Background;
var gameState = "start";

function preload() {
    imgBG = loadImage('images/pixil-frame-0.png');
    imgFace = loadImage('images/pixil-frame-0.png');
    imgHammer = loadImage('images/hammer.png');
    Background = loadImage('images/background.png');
} //loads all images in

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
    //spawns walls
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
} //this block of code just gets the game started once the game state is changed to playing. it makes all walls appear and makes the score and timer show up

function mousePressed() {
    if (gameState === "start") {
        gameState = "playing";
        createBall();
    } //create ball if game state = playing
}

 
function keyPressed() {
    checkKey(key);
}

function checkKey(_keyPressed) {
    if (_keyPressed === " " || _keyPressed === "Enter") {
        console.log("Game Started!");
        if (gameState === "start") {
            gameState = "playing";
            createBall();
        }
    } else if (_keyPressed === 'r' || _keyPressed === 'R') {
        console.log("Game Restarted!");
        restartGame();
    }
} // if r key is pressed it will check the gamestate and change it from the start screen to playing state

function displayTimer() {
    textSize(100);
    fill('Black');
    textAlign(CENTER, CENTER);
    text(timer, width / 2, height / 2);

    if (frameCount % 60 == 0 && timer > 0) {
        timer--;
    } //timer is at 60 frames per second so it changes by 1 second every 60 seconds

    if (timer <= 0) {
        gameState = "end";
    }
} //if timer=0 then gamestate = end

function score() {
    textSize(35);
    fill('Black');
    text("Score: " + Score, 80, 50);
} //makes text with score show up

function createBall() {
    if (currentBall) {
        currentBall.remove();
    } //this makes it so that once a mole get hit it dissapears

    currentBall = new Sprite(random(100, 900), random(100, 900), 50, 50, 'k');
    currentBall.img = imgFace;
    currentBall.scale = 0.5;
// this spawns a new mole in a random spot
    currentBall.collides(bat, function (ball, bat) {
        ball.remove();
        Score++;
        createBall();
    });
} //Adds 1 score each time a ball is removed

function showStartScreen() {
    background(0);
    textSize(50);
    fill('white');
    textAlign(CENTER, CENTER);
    text("Click or Press Enter To Start", width / 2, height / 2);
} // 

function showEndScreen() {
    background(0);
    textSize(50);
    fill('white');
    textAlign(CENTER, CENTER);
    text("Game Over!", width / 2, height / 2);
    text("Score: " + Score, width / 2, height / 2 + 50);
    textSize(25);
    text("Press 'R' to Restart", width / 2, height / 2 + 100);
    imgHammer.visible = false;
    bat.visible = false;
    wallLH.visible = false;
    wallRH.visible = false;
    wallTop.visible = false;
    wallBot.visible = false;
//this is the end screen and it hides everything on the screen that would be showing up on the game state "playing"
    if (currentBall) {
        currentBall.remove();
    }

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
    if (currentBall) {
        currentBall.remove();
    }
}
