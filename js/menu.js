import { playLoopingSound } from "/js/lib.js";
import playSound from "/js/lib.js";

document.onkeydown = function(click) {
    if (click.key.toLowerCase() == 's' || click.key.toLowerCase() == 'r') {
        history.pushState(undefined, "Main screen", "/");
        window.location.replace("/game/");
    }
    if (click.key.toLowerCase() == 'm') {
        history.pushState(undefined, "Main screen", "/");
        window.location.replace("/");
    }
}

const v = 0;
(function() {
    playLoopingSound("/sound/mainMenuTheme.wav");
    for (let element of document.getElementsByTagName("a")) {

        element.addEventListener("mouseover", function(e) {
            playSound("/sound/blipSelect.wav");
        });
    }
})(v);