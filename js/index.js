import playSound from "/js/lib.js";

const gamefield = document.getElementById("gamefield");
const spedometer = document.getElementById("speedometer");
const scoreMeter = document.getElementById("score");

let context = new(window.AudioContext || window.webkitAudioContext)();
let osc = context.createOscillator(); // instantiate an oscillator

let velocity = 0.6;
const maxVel = 2.0;
const minVel = 0.95;
const horisontalV = 0.40;
const keyPressed = [];

let dead = false;
let score = 0;
const timeStarted = Date.now();
let oscilatorStarted = true;

let zIndex = 100;

const car = document.createElement("div");
car.classList.add("object", "car");
car.style.opacity = 0.5;
gamefield.appendChild(car);


// Kao main, koristi IIFE.
(function() {
    var vol = context.createGain();
    vol.gain.value = 0.1;

    var distortion = context.createWaveShaper();
    distortion.curve = makeDistortionCurve(400);

    osc.type = 'sawtooth'; // this is the default - also square, sawtooth, triangle
    osc.frequency.value = 45; // Hz
    osc.connect(vol); // connect it to the destination
    vol.connect(distortion);
    distortion.connect(context.destination);
    try {
        osc.start(); // start the oscillator
    } catch (error) {
        oscilatorStarted = false;
    }

    //osc.stop(); // stop 2 seconds after the current time

    setPos(car, gamefield.clientWidth * 0.5, gamefield.clientHeight * 0.3);
    for (let i = 0; i < 7; i++) {
        addEnemyCar();
    }
})();


document.onkeydown = function(click) {
    keyPressed[click.key] = true;
    if (!oscilatorStarted) {
        try {
            osc.start();
            oscilatorStarted = true;
        } catch (error) {

        }
    }
}

document.onkeyup = function(click) {
    keyPressed[click.key] = false;
}

// Game loop (Petlja igre)
let deltaT = 0;
let listOfElements;

let intervalId = window.setInterval(function() {
    if (deltaT == 0) { deltaT = Date.now() - 1 }
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

        accelerate(-(2e-5) * deltaT);

        listOfElements = document.getElementsByClassName("moving");
        let isAbovePlayfield;
        if (listOfElements != undefined) {
            for (let element of listOfElements) {
                isAbovePlayfield = Math.abs(getActualY(element)) < gamefield.clientHeight * 0.90 - element.clientHeight;
                if (!isAbovePlayfield) {
                    if (isCar(element)) {
                        setRandomType(element);
                    }

                    if (getRand(0, 100) < 7 && isCar(element)) {
                        setPos(element, getX(car), getRand(2 * gamefield.clientHeight, 2.1 * gamefield.clientHeight));
                    } else {
                        setPos(element, getRand(0, 500), getRand(2 * gamefield.clientHeight, 2.1 * gamefield.clientHeight));
                    }
                }
                if (isAbovePlayfield) {
                    setPos(element, getX(element), getY(element) - velocity * deltaT);
                }
                if (Date.now() - timeStarted < 2500) {
                    setCarTrasparrent(0.5);

                } else {
                    setCarTrasparrent(1);
                    if (isColliding(car, element, 7, 12)) {
                        osc.stop();
                        playSound("/sound/crash.wav");
                        isDead(true);
                        return;
                    }
                }

            }
        }

        scrollTextures(velocity * deltaT);

        if (!isInside()) isDead(true);

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
    osc.frequency.value = velocity * 100 / 2;
}

function isColliding(obj, obj2, overrideX, overrideY) {
    if (overrideY == undefined) {
        overrideY = 0;
    }

    if (overrideX == undefined) {
        overrideX = 0;
    }

    let rect1 = obj.getBoundingClientRect();
    rect1 = {
        left: rect1.left + overrideX,
        width: rect1.width - (overrideX * 2),
        height: rect1.height - (overrideY * 2),
        top: rect1.top + overrideY
    };
    /*rect1.left += overrideX;
    rect1.width -= overrideX;
    rect1.height -= overrideY;
    rect1.top += overrideY;*/

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
    setPos(enemyCar, getRand(0, 500), getRand(gamefield.clientHeight * 1.5, gamefield.clientHeight * 2));
    enemyCar.style.zIndex = zIndex;
}

function getRand(min, max) {
    let arr = new Uint32Array(1);
    crypto.getRandomValues(arr);

    return Math.abs(arr[0]) % (max + 1) + min;
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

function isInside() {
    const rect1 = car.getBoundingClientRect();
    const rect2 = gamefield.getBoundingClientRect();

    return (rect1.left < rect2.left && rect2.left < rect1.left + rect1.width || rect2.left < rect1.left && rect1.left < rect2.left + rect2.width); //width
}

function isCar(element) {
    return element.classList.contains("enemy-car") || element.classList.contains("car");
}

let scroll = 0.0;

/**Scroll-uje objekte sa klasom `scrollable` */
function scrollTextures(delta) {
    if (scroll > gamefield.clientHeight * 10) {
        scroll = 0;
    }
    scroll += delta;
    for (let element of document.getElementsByClassName("scrollable")) {
        element.style.backgroundPositionY = scroll + "px";
    }
}

async function setRandomType(car) {
    car.style.backgroundImage = "url(/img/car" + getRand(0, 5) + ".png)";
}

async function setCarTrasparrent(newVal) {
    let oldVal = car.style.opacity;
    if (newVal == oldVal) {
        return;
    }
    playSound("/sound/synth.wav");
    car.style.opacity = newVal;
}

function makeDistortionCurve(amount) {
    var k = typeof amount === 'number' ? amount : 50,
        n_samples = 44100,
        curve = new Float32Array(n_samples),
        deg = Math.PI / 180,
        i = 0,
        x;
    for (let i = 0; i < n_samples; ++i) {
        x = i * 2 / n_samples - 1;
        curve[i] = (3 + k) * x * 20 * deg / (Math.PI + k * Math.abs(x));
    }
    return curve;
}

function isDead(isDead) {
    dead = isDead;
    if (dead) {
        window.location.href = "/dead/";
    }
}