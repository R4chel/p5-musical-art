let art, config;

let mic, fft, amplitude;
let ranges = ["bass", "lowMid", "mid", "highMid", "treble"];
let frequencies = new Object();

let beat;
let lastPeak;


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


    makeSlider("threshold", 0, 1,0.05,config.getThreshold,config.setThreshold);
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

    beat = millis();
    lastPeak = 0;

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

    // console.log("level", mic.getLevel());
    // console.log("seed", seed);

    let spectrum = fft.analyze();
    let soundwave = fft.waveform();

    // let amplitudeLevel = amplitude.getLevel();
    let amplitudeLevel = mic.getLevel();

    for (let i = 0; i < ranges.length; i++) {
        let range = ranges[i];
        frequencies[range] = fft.getEnergy(range);
    }

    // background(map(1 / pow((millis() - beat) / 1000 + 1, 3), 1, 0, 255, 100));
    drawSpectrumGraph(0, 0, width, height); 

    art.draw(soundwave, amplitudeLevel, frequencies);
    art.update(amplitudeLevel, frequencies);
}

// https: //stackoverflow.com/questions/67726950/how-do-i-animate-this-image-to-match-with-a-bpm-in-p5-js
let avgWindow = 20;
let i = 0;                      // 
function drawSpectrumGraph(left, top, w, h) {

    let spectrum = fft.analyze();

    stroke('limegreen');
    fill('darkgreen');
    strokeWeight(1);


    let peak = 0;
    // compute a running average of values to avoid very
    // localized energy from triggering a beat.
    let runningAvg = 0;
    for (let i = 0; i < spectrum.length; i++) {
        vertex(
            //left + map(i, 0, spectrum.length, 0, w),
            // Distribute the spectrum values on a logarithmic scale
            // We do this because as you go higher in the spectrum
            // the same perceptible difference in tone requires a 
            // much larger chang in frequency.
            left + map(log(i), 0, log(spectrum.length), 0, w),
            // Spectrum values range from 0 to 255
            top + map(spectrum[i], 0, 255, h, 0)
        );

        runningAvg += spectrum[i] / avgWindow;
        if (i >= avgWindow) {
            runningAvg -= spectrum[i] / avgWindow;
        }
        if (runningAvg > peak) {
            peak = runningAvg;
        }
    }

    // any time there is a sudden increase in peak energy, call that a beat
    if (peak > lastPeak * (1 + config.threshold)) {
        print(`tick ${++i}`);
        circle(i, peak, 100);
        beat = millis();
    }
    lastPeak = peak;

    // this is the range of frequencies covered by the FFT
    let nyquist = 22050;

    // get the centroid (value in hz)
    let centroid = fft.getCentroid();

    // the mean_freq_index calculation is for the display.
    // centroid frequency / hz per bucket
    let mean_freq_index = centroid / (nyquist / spectrum.length);
    stroke('red');
    // convert index to x value using a logarithmic x axis
    let cx = map(log(mean_freq_index), 0, log(spectrum.length), 0, width);
    circle(cx, i*20, 5);
}

// This is a fix for chrome:
// https://github.com/processing/p5.js-sound/issues/249
function touchStarted() {
    if (getAudioContext().state !== 'running') {
        getAudioContext().resume();
    }
}

function makeSlider(name, minimum, maximum, delta, getter, setter) {
    let d = createDiv();

    let label = createElement("label");
    let textBox = createInput((getter.apply(config)).toString(), "number");
    textBox.style("width", "100px");
    textBox.attribute("step", delta);
    let slider = createSlider(minimum, maximum, getter.apply(config), delta);
    label.html(name);
    label.attribute("for", slider.id());
    slider.input(function() {
        setter.apply(config, [slider.value()]);
        textBox.value(slider.value());
    });
    textBox.input(function() {
        let value = parseFloat(textBox.value());
        setter.apply(config, [value]);
        slider.value(value);
    });
    d.child(label);
    d.child(slider);
    d.child(textBox);
    return slider;
}
