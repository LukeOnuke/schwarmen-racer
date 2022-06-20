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
export default function playSound(path, vol = 1) {
    console.log(`Playing sound ${path}`);
    const au = new Audio(path);
    au.volume = vol;
    au.play();
}

export function playLoopingSound(path, vol = 1) {
    console.log(`Playing looping sound from ${path}.`);
    const au = new Audio(path);
    au.volume = vol;
    au.loop = true;
    au.play();
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