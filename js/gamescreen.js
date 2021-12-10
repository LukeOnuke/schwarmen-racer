import playSound from "/js/lib.js";

document.onkeydown = function(click) {
    if (click.key == 's') {
        history.pushState(undefined, "Main screen", "/");
        window.location.href = "/game/";
    }
}

const v = 0;
(function() {
    for (let element of document.getElementsByTagName("a")) {

        element.addEventListener("mouseover", function(e) {
            playSound("/sound/blipSelect.wav");
        });
    }
})(v);