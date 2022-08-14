let art;
let debug = true;

let mic, fft, amplitude;
let ranges = ["bass", "lowMid", "mid", "highMid", "treble"];
let frequencies = new Object();

let seed;
// seed = 0;
let canvasSize;
// canvasSize = 1000;


function setup() {
    seed = seed === undefined ? floor(random(1000000)) : seed;
    let canvasWidth = canvasSize === undefined ? windowWidth : canvasSize;
    let canvasHeight= canvasSize === undefined ? windowHeight: canvasSize;
    randomSeed(seed);
    angleMode(RADIANS);
    ellipseMode(RADIUS);
    rectMode(RADIUS);
    let canvas = new Canvas(canvasWidth, canvasHeight); 
    canvas.canvas.mouseClicked(canvasMouseClicked);
    art = new Art(canvas, ranges);
    art.reset();


    let smoothing = 0.8;
    mic = new p5.AudioIn();
    fft = new p5.FFT(smoothing);

    mic.connect(fft);
    amplitude = new p5.Amplitude();
    amplitude.setInput(mic);
    amplitude.toggleNormalize(true);

    mic.start();
}

function process_update(data){
    let action = false;
    if(data.key !== undefined){
        art.keyPress(data.key);
        action = true;
    }
    if(data.encoder_switch !== undefined ) {
        art.encoderSwitch(data.encoder_switch);
        action = true;
    }
    if(data.encoder !== undefined ) {
        art.encoder(data.encoder);
        action = true;
    }
    if(!action){
        console.log("TODO", update);
    }
}

function on_update(update){
    data = JSON.parse(update);
    process_update(data);
}

function keyPressed(event){
    if(isFinite(event.key)){
        art.keyPress(parseInt(event.key));
    }
    
}
function canvasMouseClicked() {
    art.addShape({x:mouseX, y:mouseY});
}
let globalMax = 0;

function draw() {

    // console.log("level", mic.getLevel());
    // console.log("seed", seed);

    let spectrum = fft.analyze();
    let soundwave = fft.waveform();

    let amplitudeLevel = amplitude.getLevel();

    for(let i = 0; i < ranges.length; i++){
        let range = ranges[i];
        frequencies[range] = fft.getEnergy(range);
    }
  
    art.draw(soundwave, amplitudeLevel, frequencies);
    art.update(amplitudeLevel,frequencies);
}


// This is a fix for chrome:
// https://github.com/processing/p5.js-sound/issues/249
function touchStarted() {
    if (getAudioContext().state !== 'running') {
        getAudioContext().resume();
    }
}
