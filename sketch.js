let art, config;

let mic, fft, amplitude;
let ranges = ["bass", "lowMid", "mid", "highMid", "treble"];
let frequencies = new Object();

let seed;
// seed = 0;
let canvasSize;
// canvasSize = 1000;


function setup() {
    config = new Config({ seed });

    angleMode(RADIANS);
    ellipseMode(RADIUS);
    rectMode(RADIUS);
    
    let canvas = createCanvas(config.canvasWidth, config.canvasHeight);
    canvas.mouseClicked(canvasMouseClicked);


    art = new Art(config, ranges);
    art.reset();

    let smoothing = 0.8;
    mic = new p5.AudioIn();
    fft = new p5.FFT(smoothing);

    mic.connect(fft);
    // amplitude = new p5.Amplitude();
    // amplitude.setInput(mic);
    // amplitude.toggleNormalize(true);

    mic.start();
}

function process_update(data) {
    let action = false;
    if (data.key !== undefined) {
        art.keyPress(data.key);
        action = true;
    }
    if (data.encoder_switch !== undefined) {
        art.encoderSwitch(data.encoder_switch);
        action = true;
    }
    if (data.encoder !== undefined) {
        art.encoder(data.encoder);
        action = true;
    }
    if (!action) {
        console.log("TODO", update);
    }
}

function on_update(update) {
    data = JSON.parse(update);
    process_update(data);
}

function keyPressed(event) {
    if (isFinite(event.key)) {
        art.keyPress(parseInt(event.key));
    }

}

function canvasMouseClicked() {
    art.addShape({
        x: mouseX,
        y: mouseY
    });

}

function draw() {
    let spectrum = fft.analyze();
    let soundwave = fft.waveform();

    let amplitudeLevel = mic.getLevel();

    for (let i = 0; i < ranges.length; i++) {
        let range = ranges[i];
        frequencies[range] = fft.getEnergy(range);
    }

    art.draw(soundwave, amplitudeLevel, frequencies);
    art.update(amplitudeLevel, frequencies);
}

// This is a fix for chrome:
// https://github.com/processing/p5.js-sound/issues/249
function touchStarted() {
    if (getAudioContext().state !== 'running') {
        getAudioContext().resume();
    }
}
