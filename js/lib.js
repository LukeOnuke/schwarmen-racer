/*
 * ==============================================================================================================
 * lib.js - component for Schwarmen Racer Turbo | © MIT Kontributeri https://github.com/LukeOnuke/schwarmen-racer 
 * ==============================================================================================================
 */

/**
 * Pusti zvuk koristeci `Audio` interface.
 * @param {String} path 
 */
export default function playSound(path) {
    console.log("Playing sound " + path);
    new Audio(path).play();
}

const highscore = "highscore";
/**
 * Vrati highscore.
 * @returns Trenutni highscore za ovog klienta, ako je `undefined` onda vraca 0.
 */
export function getHighScore() {
    const local = window.localStorage;
    return local.getItem(highscore) || 0;
}

/**
 * Postavi highscore.
 * @param {Number} v Novi highscore za klienta. 
 */
export function setHighScore(v) {
    const local = window.localStorage;
    local.setItem(highscore, v) || 0;
}