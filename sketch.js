let art, config;

let mic, fft, amplitude;
let ranges = ["bass", "lowMid", "mid", "highMid", "treble"];
let frequencies = new Object();

let nonZeroAmplitude = false;

let seed;
// seed = 0;
let canvasSize;
// canvasSize = 1000;
let calibration = [];
let avgs = [];
let peaks = [];

let configurable = true;

function setup() {
    config = new Config({
        seed
    });

    angleMode(RADIANS);
    ellipseMode(RADIUS);
    rectMode(RADIUS);

    let canvas = createCanvas(config.canvasWidth, config.canvasHeight);
    canvas.mouseClicked(canvasMouseClicked);

    art = new Art(config, ranges);
    art.reset();

    if (configurable) {

        makeSlider("timeWindow", 1, 100, 5, config.getTimeWindow, config.setTimeWindow);
        makeCheckbox("normalizeSound", config.getNormalizeSound, config.setNormalizeSound);


        // This is here rather than being in coloring or a separate function due to a bug related to calling select not working.
        let fillModeSelector = createSelect(false);

        let fillModes= art.coloring.fillModes;
        for (let i = 0; i < fillModes.length; i++) {
            fillModeSelector.option(fillModes[i], i);
        }
        fillModeSelector.selected(art.coloring.fillMode());
        fillModeSelector.input(function () {
            art.coloring.setFillModeIndex(fillModeSelector.value());
        });


    }

    mic = new p5.AudioIn();
    fft = new p5.FFT();
    mic.connect(fft);
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
let latestAmplitude = 0;

function draw() {
    let spectrum = fft.analyze();
    let soundwave = fft.waveform();

    let amplitudeLevel = mic.getLevel();
    if (amplitudeLevel != 0) {
        nonZeroAmplitude = true;
    }

    let avgSound = soundAnalysis(soundwave);
    avgSound = avgSound.toPrecision(3);

    // this is because currently mic.getLevel() doesn't work in safari
    if (!nonZeroAmplitude) {
        amplitudeLevel = latestAmplitude;
    }
    for (let i = 0; i < ranges.length; i++) {
        let range = ranges[i];
        frequencies[range] = fft.getEnergy(range);
    }

    if (config.debug) {
        let callibration = rootMeanSquare(avgs);

        let ratio = amplitudeLevel / callibration;
        let ratio2 = amplitudeLevel / avgSound;
        if (ratio > 5 || ratio < .05) {

            console.log("1", ratio.toFixed(3));
        }
        if (ratio2 > 6 || ratio2 < .05) {

            console.log("2", ratio2.toFixed(3));
        }
    }

    art.draw({
        soundwave: soundwave,
        amplitude: amplitudeLevel,
        frequencies: frequencies,
        avgSound: avgSound,
        safari: !nonZeroAmplitude,
        normalizeSound : config.normalizeSound,
        maxSound : peaks[peaks.length-1],
    });

    art.update({
        amplitude: amplitudeLevel,
        frequencies: frequencies,
        avgSound: avgSound
    });
}


function soundAnalysis(soundwave) {
    let sampleMax = 0;
    let sampleSum = 0;
    for (let i = 0; i < soundwave.length; i++) {
        let value = soundwave[i];
        sampleMax = max(sampleMax, value);
        sampleSum += value ** 2;
    }

    let sampleAvg = Math.sqrt(sampleSum / soundwave.length);
    latestAmplitude = sampleAvg;
    avgs.push(sampleAvg);
    peaks.push(sampleMax);
    while (avgs.length > config.calibrationWindow) {
        avgs.shift();
        peaks.shift();
    }

    let squares = 0;
    let count = 0;

    for (let i = 1; i <= min(avgs.length, config.timeWindow); i++) {
        squares += avgs[avgs.length - i] ** 2;
        count++;
    }
    let runningAvg = Math.sqrt(squares / count);


    return runningAvg;
}

function rootMeanSquare(data) {
    return Math.sqrt(
        data.reduce(function(acc, x) {
            return (acc + x * x);
        }, 0) / data.length);
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

function makeCheckbox(name, getter, setter) {
    let d = createDiv();

    let label = createElement("label");
    let checkbox = createCheckbox(name, getter.apply(config));
    checkbox.changed(function () {
        setter.apply(config, [checkbox.checked()]);
        redraw();
    })

    d.child(label);
    d.child(checkbox);
    return checkbox
}
