//https://www.html5rocks.com/en/tutorials/casestudies/jamwithchrome-audio/
export default class SlapbackDelayNode {

    //Milisekunde
    constructor(audioContext, i, d, f, wL) {
        //create the nodes we’ll use
        this.input = i;
        this.output = audioContext.createGain();
        this.delay = audioContext.createDelay();
        var feedback = audioContext.createGain(),
            wetLevel = audioContext.createGain();

        //set some decent values
        this.setDelay(d);
        feedback.gain.value = f;
        wetLevel.gain.value = wL;

        //set up the routing
        this.input.connect(this.delay);
        this.input.connect(this.output);
        this.delay.connect(feedback);
        this.delay.connect(wetLevel);
        feedback.connect(this.delay);
        wetLevel.connect(this.output);


    }

    connect(target) {
        this.output.connect(target);
    };

    setDelay(d) {
        this.delay.delayTime.value = d;
    }
}