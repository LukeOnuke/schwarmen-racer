export default function playSound(path) {
    console.log("Playing sound " + path);
    new Audio(path).play();
}