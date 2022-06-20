import { setHighScore, getHighScore } from "/js/lib.js";
import playSound from "/js/lib.js";
import SlapbackDelayNode from "/js/audio.js";
import { sliderInit, loadSlider } from "/js/save.js";


/**
 * ==============================================================================================================
 * Schwarmen racer turbo - © MIT 2021 Vuk Milic, Luka Kresoja, Uros Matijas, Milos Lazarevic, Nikola Milatovic ||
 * ==============================================================================================================
 * 
 * Ovaj deo ukljucuje glavi kod igrice "gamescreen".
 * 
 * Radjeno za projektni zadatak u decembru 2021. godine.
 * 
 * ===========
 * MIT License
 *
 * Copyright (c) 2021 Luka Kresoja, Uros Matijas, Vuk Milic, Milos Lazarevic
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

const gamefield = document.getElementById("gamefield");
const spedometer = document.getElementById("speedometer");
const scoreMeter = document.getElementById("score");
const highScoreMeter = document.getElementById("highscore");
const revMeter = document.getElementById("rpm");
const revGauge = document.getElementById("revgauge");
const gearGauge = document.getElementById("gear");

const engineVoliume = document.getElementById("engineVoliume");

let context = new(window.AudioContext || window.webkitAudioContext)();
let osc = context.createOscillator(); // Pokreni oscilator
let osc2 = context.createOscillator();

let velocity = 0.6;
const maxVel = 2.0;
const minVel = 0.65;
const horisontalV = 0.40;
const keyPressed = [];

let rev = 3000;
let maxRev = 6000;
let minRev = 2000;
let gear = 1;

let dead = false;
let score = 0;
const timeStarted = Date.now();
let oscilatorStarted = true;
let slapbackDelayNode;

let zIndex = 100;

const car = document.createElement("div");
car.classList.add("object", "car");
car.style.opacity = 0.5;
setPlayerRandomType(car);
gamefield.appendChild(car);


// Kao main, koristi IIFE.
(function() {

    sliderInit(engineVoliume);
    engineVoliume.value = loadSlider(engineVoliume);
    console.log(loadSlider(engineVoliume));


    highScoreMeter.textContent = Math.round(getHighScore());

    // Zvuk , radio matke i milic
    var vol = context.createGain();
    vol.gain.value = loadSlider(engineVoliume) / 100;

    slapbackDelayNode = new SlapbackDelayNode(context, vol, 0.12, 0.30, 0.30);

    osc.type = 'sawtooth'; // postoji : square, sawtooth, triangle
    osc.frequency.value = 45; // Hz
    osc.connect(vol); // povezi

    osc2.type = 'square';
    osc2.frequency.value = 45;
    osc2.connect(vol);

    vol.connect(context.destination);
    slapbackDelayNode.connect(vol);

    // Pokreni oscilatore
    osc.start();
    osc2.start();

    //Inicializacija, svi zajedno
    setPos(car, gamefield.clientWidth * 0.5, gamefield.clientHeight * 0.3);
    for (let i = 0; i < 7; i++) {
        addEnemyCar();
    }

    setSeason(); //Postavi sezonu.

    engineVoliume.oninput = function() {
        vol.gain.value = this.value / 100;
    }
})();


// Prezentuja Kresoja
// Na pritiak tastera dodati na niz.
document.onkeydown = function(click) {
    keyPressed[click.key] = true;
}

// Prezentuja Kresoja
// Kada se taster pusti skini sa niza.
document.onkeyup = function(click) {
    keyPressed[click.key] = false;
}

// Petlja igre (Game loop)
let deltaT = 0;
let listOfElements;

let intervalId = window.setInterval(function() {
    if (window.devicePixelRatio != 1) {
        isDead(true);
    }

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

        //Milic
        scrollTextures(velocity * deltaT);

        if (!isInside()) isDead(true);

        addScore((velocity ^ 2) / deltaT);
    }
    deltaT = Date.now();
}, 32);

/**
 * @author Luka Kresoja, Vuk Milic
 */
function getX(object) {
    return parseInt(object.style.left);
}

/**
 * @author Luka Kresoja, Vuk Milic
 */
function getY(object) {
    return gamefield.clientHeight - parseInt(object.style.top) - parseInt(object.clientHeight);
}

/**
 * Promeni koordinate objekta
 * @param {*} object Objekat koga treba da postavimo
 * @param {*} x Buduca X koordinata
 * @param {*} y Buduca Y koordinata
 * @author Luka Kresoja
 */
function setPos(object, x, y) {
    object.style.position = "relative";
    y += object.clientHeight;
    object.style.top = (gamefield.clientHeight - y) + "px";
    object.style.left = x + "px";
}

/**
 * @author Milos Lazarevic
 */
function clamp(val, min, max) {
    return Math.min(Math.max(val, min), max);
}

/**
 * @author Milos Lazarevic
 */
function clampVel(vel) {
    return clamp(vel, minVel, maxVel);
}

/**
 * Ubrzaj auto
 * @param {*} deltaV DeltaV
 * @author Luka Kresoja
 */
function accelerate(deltaV) {
    velocity = clampVel(velocity + deltaV);
    updateSpeedometer(velocity * 100);
    changeRev(velocity * 100 * 42);
}

/**
 * Proverava da li se dva objekta sudaraju.
 * @param {*} obj Prvi objekat.
 * @param {*} obj2 Drugi objekat.
 * @param {*} overrideX Override za x smer.
 * @param {*} overrideY Override za y smer.
 * @returns Da li se sudara.
 * @author Milos Lazarevic, Luka Kresoja 
 */
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

    const rect2 = obj2.getBoundingClientRect();

    return (rect1.top > rect2.top && rect2.top > rect1.top - rect1.height || rect2.top > rect1.top && rect1.top > rect2.top - rect2.height) && //height
        (rect1.left < rect2.left && rect2.left < rect1.left + rect1.width || rect2.left < rect1.left && rect1.left < rect2.left + rect2.width); //width
}

/**
 * @author Uros Matijas , Vuk Milic
 */
function addEnemyCar() {
    if (zIndex > 200) zIndex = 100;
    zIndex++;
    let enemyCar = document.createElement("div");
    enemyCar.classList.add("object", "enemy-car", "moving");
    gamefield.appendChild(enemyCar);
    setPos(enemyCar, getRand(0, 500), getRand(gamefield.clientHeight * 1.5, gamefield.clientHeight * 2));
    enemyCar.style.zIndex = zIndex;
}

/**
 * GetRand
 * 
 * @author Milos Lazarevic
 */
function getRand(min, max) {
    let arr = new Uint32Array(1);
    crypto.getRandomValues(arr);

    return Math.abs(arr[0]) % (max + 1) + min;
}

/**
 * Remove Object
 * 
 * @author Milos Lazarevic
 */
async function removeObj(object) {
    object.remove();
}

/**
 * GetRand
 * 
 * @author Uros Matijas
 */
function getActualY(obj) {
    return obj.getBoundingClientRect().y;
}


/**
 * Dodaj skore
 * @param {*} sc deltaScore 
 * @author Vuk Milic
 */
function addScore(sc) {
    score += sc;
    scoreMeter.textContent = parseInt(score);
}

/**
 * Proverava
 * @author Milos Lazarevic, Luka Kresoja 
 * @returns Da li je auto unutar staze
 */
function isInside() {
    const rect1 = car.getBoundingClientRect();
    const rect2 = gamefield.getBoundingClientRect();

    return (rect1.left < rect2.left && rect2.left < rect1.left + rect1.width || rect2.left < rect1.left && rect1.left < rect2.left + rect2.width); //width
}

/**
 * @param {*} element Element koji treba proveriti dali je auto.
 * @returns Da li je auto.
 * @author Luka Kresoja
 */
function isCar(element) {
    return element.classList.contains("enemy-car") || element.classList.contains("car");
}

let scroll = 0.0;

/**
 * Scroll-uje objekte sa klasom `scrollable`
 * @param {*} delta Razlika u prodjenom putu.
 * @author Luka Kresoja.
 */
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

async function setPlayerRandomType(car) {
    car.style.backgroundImage = "url(/img/car-final" + getRand(0, 6) + ".png)";
}

/**
 * Set car trancparrency.
 * @param {*} newVal Car transparrency. 
 * @returns Void
 * @author Luka Kresoja
 */
async function setCarTrasparrent(newVal) {
    let oldVal = car.style.opacity;
    if (newVal == oldVal) {
        return;
    }
    playSound("/sound/synth.mp3");
    car.style.opacity = newVal;
}

/**
 * 
 * @param {*} isDead Da li je mrtav
 * @author Milos Lazarevic
 */
function isDead(isDead) {
    //Prakticno dogadjaj za kada igrac umre
    dead = isDead;
    if (dead) {
        if (score > getHighScore()) setHighScore(score);
        window.location.href = "/dead/";
    }
}

/**
 * @author Vuk Milic
 */
function setSeason() {
    const season = getRand(0, 3);
    document.body.style.backgroundImage = `url('/img/trava${season}.png')`;
    console.log(document.body.style);
}

/**
 * Refresuj brzinomjer
 * @param {*} speed Brzina
 * @author Vuk Milic
 */
function updateSpeedometer(speed) {
    spedometer.textContent = Math.round(speed + 75);
    let style;
    if (speed > 170) {
        style = "#C50F1F"
    } else if (speed > 130) {
        style = "#F9F1A5"
    } else {
        style = "#00360e"
    }
    spedometer.style.color = style;
}

function changeRev(delta) {
    rev = delta;

    let oldGear = gear;
    gear = returnGear(rev);

    if (gear > oldGear) {

        //rev = minRev + (rev - maxRev);

    }
    if (gear < oldGear) {

        gearDownChange();
        //rev = maxRev - (minRev - rev);
    }

    rev -= (gear - 1) * maxRev;

    if (rev < minRev) {
        rev = maxRev - (minRev - rev)
    }
    if (rev > maxRev) {
        rev = minRev + (rev - maxRev);
    }

    //updejti
    osc.frequency.value = rev / 60;
    osc2.frequency.value = rev / 60;
    slapbackDelayNode.setDelay(rev / 8 / 60 / 1000);

    revMeter.textContent = Math.round(rev);

    updateRevmeter(rev);
    updateGearGauge(gear);
}

function returnGear(revs) {
    let gear = 1;
    while (revs > maxRev) {
        revs -= maxRev;
        gear++;
    }
    return gear;
}

async function gearDownChange() {
    let max = getRand(2, 5);
    for (let i = 0; i < max; i++) {
        setTimeout(() => {
            playSound("/sound/exaustBang.wav", (loadSlider(engineVoliume) / 100) * 2);
        }, 125 * i);
    }
}

function updateRevmeter(rev) {
    let i;
    for (i = 0; i < revGauge.children.length; i++) {
        revGauge.children[i].classList.remove("active");
        revGauge.children[i].classList.remove("blink-quick");
    }
    for (i = 0; i <= (rev) / ((maxRev) / revGauge.children.length); i++) {
        revGauge.children[i].classList.add("active");
    }
    if (rev > maxRev - 500) {
        for (i = 0; i < revGauge.children.length; i++) {
            revGauge.children[i].classList.add("blink-quick");
        }
    }
}

function updateGearGauge(g) {
    gearGauge.textContent = g;
}