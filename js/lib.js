export default function playSound(path) {
    console.log("Playing sound " + path);
    return new Audio(path).play();
}