import { playLoopingSound } from "/js/lib.js";
import playSound from "/js/lib.js";

document.onkeydown = function(click) {
    if (click.key == 's' || click.key == 'r') {
        history.pushState(undefined, "Main screen", "/");
        window.location.replace("/game/");
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