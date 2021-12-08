const gamefield = document.getElementById("gamefield");
const spedometer = document.getElementById("speedometer");
const scoreMeter = document.getElementById("score");

let velocity = 0.6;
const maxVel = 2.0;
const minVel = 0.95;
const horisontalV = 0.40;
const keyPressed = [];

let dead = false;
let score = 0;

let zIndex = 100;

const car = document.createElement("div");
car.classList.add("object", "car");
gamefield.appendChild(car);


// Kao main, koristi IIFE.
(function() {
    setPos(car, gamefield.clientWidth * 0.5, gamefield.clientHeight * 0.3);
    for (i = 0; i < 7; i++) {
        addEnemyCar();
    }
})();

document.onkeydown = function(click) {
    keyPressed[click.key] = true;
}

document.onkeyup = function(click) {
    keyPressed[click.key] = false;
}

// Game loop (Petlja igre)
let deltaT = 0;
let listOfElements;
let intervalId = window.setInterval(function() {
    deltaT -= Date.now();
    deltaT = Math.abs(deltaT);
    if (dead) {

    } else {
        if (keyPressed["w"]) {
            accelerate(12e-3);
        }
        if (keyPressed["s"]) {
            accelerate(-(6e-3));
        }
        if (keyPressed["a"]) {
            setPos(car, getX(car) - horisontalV * deltaT, getY(car));
        }
        if (keyPressed["d"]) {
            setPos(car, getX(car) + horisontalV * deltaT, getY(car));
        }

        if (keyPressed["p"]) {
            addEnemyCar();
        }

        accelerate(-(2e-5) * deltaT);

        listOfElements = document.getElementsByClassName("moving");
        let isAbovePlayfield;
        if (listOfElements != undefined) {
            for (element of listOfElements) {
                isAbovePlayfield = Math.abs(getActualY(element)) < gamefield.clientHeight * 0.90 - element.clientHeight;
                if (!isAbovePlayfield) {
                    setPos(element, getRand(0, 500), getRand(2 * gamefield.clientHeight, 2.1 * gamefield.clientHeight));
                }
                if (isAbovePlayfield) {
                    setPos(element, getX(element), getY(element) - velocity * deltaT);
                }
                if (isColliding(car, element)) {
                    dead = true;
                    return;
                }
            }
        }

        if(!isInside()) dead = true;

        addScore((velocity ^ 2) / deltaT);
    }
    deltaT = Date.now();
}, 32);

function getX(object) {
    return parseInt(object.style.left);
}

function getY(object) {
    return gamefield.clientHeight - parseInt(object.style.top) - parseInt(object.clientHeight);
}

function setPos(object, x, y) {
    object.style.position = "relative";
    y += object.clientHeight;
    object.style.top = (gamefield.clientHeight - y) + "px";
    object.style.left = x + "px";
}

function clamp(val, min, max) {
    return Math.min(Math.max(val, min), max);
}

function clampVel(vel) {
    return clamp(vel, minVel, maxVel);
}

function accelerate(deltaV) {
    velocity = clampVel(velocity + deltaV);
    spedometer.textContent = parseInt(velocity * 100);
}

function isColliding(obj, obj2) {
    const rect1 = obj.getBoundingClientRect();
    const rect2 = obj2.getBoundingClientRect();
    //return rect1.x > rect2.x && rect1.x < rect2.x + rect2.width && rect1.y > rect2.y && rect1.y < rect2.y + rect2.height;
    return (rect1.top > rect2.top && rect2.top > rect1.top - rect1.height || rect2.top > rect1.top && rect1.top > rect2.top - rect2.height) && //height
        (rect1.left < rect2.left && rect2.left < rect1.left + rect1.width || rect2.left < rect1.left && rect1.left < rect2.left + rect2.width); //width
}

function addEnemyCar() {
    if (zIndex > 200) zIndex = 100;
    zIndex++;
    let enemyCar = document.createElement("div");
    enemyCar.classList.add("object", "enemy-car", "moving");
    gamefield.appendChild(enemyCar);
    setPos(enemyCar, getRand(0, 500), -2 * gamefield.clientHeight);
    enemyCar.style.zIndex = zIndex;
    enemyCar.style.top = "0px";
    console.log(enemyCar.getBoundingClientRect())
}

function getRand(min, max) {
    let arr = new Uint32Array(1);
    crypto.getRandomValues(arr);
    
    return arr[0] * (max - min) + min;
}

async function removeObj(object) {
    object.remove();
}

function getActualY(obj) {
    return obj.getBoundingClientRect().y;
}

function addScore(sc) {
    score += sc;
    scoreMeter.textContent = parseInt(score);
}

function isInside(){
    const rect1 = car.getBoundingClientRect();
    const rect2 = gamefield.getBoundingClientRect();

    return (rect1.left < rect2.left && rect2.left < rect1.left + rect1.width || rect2.left < rect1.left && rect1.left < rect2.left + rect2.width); //width
}