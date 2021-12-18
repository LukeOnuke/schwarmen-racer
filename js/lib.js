/*
 * ==============================================================================================================|
 * lib.js - komponenta za Schwarmen Racer Turbo | © MIT Kontributeri https://github.com/LukeOnuke/schwarmen-racer|
 * ==============================================================================================================|
 */

/**
 * Pusti zvuk koristeci `Audio` interface.
 * @param {String} path 
 * @author Uros Matijas
 */
export default function playSound(path) {
    console.log(`Playing sound ${path}`);
    new Audio(path).play();
}

const highscore = "highscore";
/**
 * Vrati highscore.
 * @returns Trenutni highscore za ovog klienta, ako je `undefined` onda vraca 0.
 * @author Milos Lazarevic
 */
export function getHighScore() {
    const hs = window.localStorage.getItem(highscore);
    if (hs == undefined || hs == Infinity) {
        return 0;
    }
    return hs;
}

/**
 * Postavi highscore.
 * @param {Number} v Novi highscore za klienta. 
 * @author Milos Lazarevic
 */
export function setHighScore(v) {
    const local = window.localStorage;
    local.setItem(highscore, v);
}