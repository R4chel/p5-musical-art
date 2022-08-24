const NUM_COLOR_MODES = 8;
const MAX_NUM_SHAPES = 20;
const MAX_SHAPES_PER_RANGE = 5;

function Art(config, ranges) {
    this.config = config;
    this.fillModes = ["frequency", "frequencyPalette", "frequencyRandomPalette", "filled", "noFill", "whiteFill", "randomOpacity", ];
    this.shapeModes = ["circle", "heart", "square", "rose", "inverseRose", "star"];
    this.shapes = [];
    this.min_radius = floor(max(width, height) / 20);
    this.max_radius = floor(max(width, height) / 5);
    this.colorIndex = 0;
    this.numPoints = 50;
    this.noise = 5;
    this.fillModeIndex = 0;
    this.shapeModeIndex = 0;
    this.shapeOverride = false;
    this.move = true;
    this.background = color(255);
    this.drawBackground = false;
    this.ranges = ranges;
    this.frequencyBandsByRanges = Object.fromEntries([...this.ranges].map((range) => [range, {
        splitBand: new FrequencyBand({
            minValue: 0.8,
            maxValue: 1.,
            framesForAction: 30
        }),
        dieBand: new FrequencyBand({
            minValue: 0,
            maxValue: 0.01,
            framesForAction: 50
        }),
        count: 0,
    }]));
    this.rangesWithoutShapes = new Set(ranges);
    this.rotate = true;
    this.maxes = [];

    this.draw = function({
        soundwave,
        amplitude,
        avgSound,
        frequencies,
        safari,
        normalizeSound,
        maxSound,
    }) {
        if (this.drawBackground) {
            background(this.background);
        }
        noStroke();

        fill(color(0, 0, 0, 3));
        // fill(color(255, 255, 255, 3));
        rect(0, 0, width, height);
        let shapeKind = this.shapeOverride ? this.shapeModes[this.shapeModeIndex] : undefined;
        let normalizedSound = normalizeSound ? soundwave.map((x) => x / avgSound) : soundwave;
        // let normalizedSound = normalizeSound ? soundwave.map((x) => x / maxSound) : soundwave;

        // this.maxes.push(max(normalizedSound));
        let amplitudeModifier = safari ? 10 : 100;
        for (let i = 0; i < this.shapes.length; i++) {
            this.shapes[i].draw({
                fillMode: this.fillModes[this.fillModeIndex],
                soundwave: normalizedSound,
                amplitude: min(amplitude * amplitudeModifier, 1.0),
                min_radius: this.min_radius,
                shapeKind: shapeKind,
                frequencies: frequencies,
                rotate: this.rotate,
            });
        }
    };

    this.update = function({
        amplitude,
        frequencies,
        avgSound,
        safari
    }) {
        let amplitudeModifier = safari ? 10 : 100;
        let deadList = [];
        let splitList = [];
        for (let i = 0; i < this.shapes.length; i++) {
            let action = this.shapes[i].update({
                move: this.move,
                frequencies: frequencies,
                amplitude: min(amplitude * amplitudeModifier, 1.0),
            });
            switch (action) {
                case "DIE":
                    console.log("DIE", this.shapes[i].range, this.shapes[i].dieBand);
                    deadList.push(i);
                    break;
                case "SPLIT":
                    console.log("SPLIT", this.shapes[i].range, this.shapes[i].splitBand);
                    splitList.push(i);
                    break;
                default:
                    break;
            }
            let newShapes = [];
            let deadListIndex = deadList.length - 1;
            for (let i = 0; i < splitList.length; i++) {
                let s = this.shapes[splitList[i]];
                if (this.shapes.length - deadListIndex + 1 < MAX_NUM_SHAPES && this.frequencyBandsByRanges[s.range] < MAX_SHAPES_PER_RANGE) {

                    // probably wanna make the new center offset from the old center
                    let newShape = new Shape({
                        center: {
                            x: s.center.x,
                            y: s.center.y
                        },
                        radius: constrain(floor(random(.5, 1.5) * s.radius), this.min_radius, this.max_radius),
                        numPoints: s.numPoints,
                        noise: s.noise,
                        default_shape: s.default_shape_kind,
                        range: s.range,
                        strokeColor: this.randomColor(),
                        dieBand: new FrequencyBand({
                            minValue: s.dieBand.minValue,
                            maxValue: s.dieBand.maxValue,
                            framesForAction: s.dieBand.framesForAction
                        }),
                        splitBand: new FrequencyBand({
                            minValue: s.splitBand.minValue,
                            maxValue: s.splitBand.maxValue,
                            framesForAction: s.splitBand.framesForAction
                        }),
                    });
                    newShape.dieBand.adjustFrames(true);
                    newShape.splitBand.adjustFrames(false);
                    // I'm not sure about this;
                    if (random() < 0.5) {
                        newShape.c2 = s.c2;
                    } else {
                        newShape.c1 = s.c1;
                    };

                    s.radius = constrain(floor(random(.5, 1.1) * s.radius), this.min_radius, this.max_radius);
                    s.resetFrequencyBands();
                    s.dieBand.widen(false);
                    s.splitBand.narrow(true);

                    this.frequencyBandsByRanges[s.range].count++;
                    this.rangesWithoutShapes.delete(s.range);

                    if (deadListIndex >= 0) {

                        this.processDead(this.shapes[deadList[deadListIndex]]);
                        this.shapes[deadList[deadListIndex]] = newShape;
                        deadListIndex--;
                    } else {
                        this.shapes.push(newShape);
                    }
                }
            };
            for (let i = deadListIndex; i >= 0; i--) {
                let elts = this.shapes.splice(i, 1);
                this.processDead(elts[0]);
            }
        }
        // lots of parameter tweaking to do here
        // TODO add something about amount of time since last shape added 
        if (amplitude / avgSound > 1.05 && this.rangesWithoutShapes.size > 0) {
            if (random() < 0.25 * this.rangesWithoutShapes.size * amplitude / avgSound) {

                let range = random([...this.rangesWithoutShapes.keys()]);
                console.log("Adding Shape", range);
                this.addShape(undefined, range);

            } else {
                console.log("not this time");
            }
        }
    };

    this.processDead = function(shape) {
        this.frequencyBandsByRanges[shape.range].count--;
        if (this.frequencyBandsByRanges[shape.range].count == 0) {
            this.rangesWithoutShapes.add(shape.range);
        }
        this.frequencyBandsByRanges[shape.range].dieBand.narrow(false);
        this.frequencyBandsByRanges[shape.range].dieBand.adjustFrames(random() < 0.25);
        if (random() < 0.5) {
            this.frequencyBandsByRanges[shape.range].splitBand.widen(true);
        }
        if (random() < 0.5) {
            this.frequencyBandsByRanges[shape.range].splitBand.adjustFrames(true);
        }
    };

    this.encoderSwitch = function(encoder_switch_value) {
        console.log("TODO: encoder switch", encoder_switch_value);
    };

    this.encoder = function(value) {
        // if (value > -20) {
        //     frameRate(value + 20);
        // }
    };

    this.removeShape = function(i) {
        i = i === undefined ? floor(random() * this.shapes.length) : i;
        if (this.shapes.length > 0) {
            let shape = this.shapes.splice(i, 1)[0];
            console.log("removed", shape);
            this.frequencyBandsByRanges[shape.range].count--;
            if (this.frequencyBandsByRanges[shape.range].count == 0) {
                this.rangesWithoutShapes.add(shape.range);
            }
        }
    };

    this.addShape = function(point, range) {
        // unclear what I want to do here. Should I not spawn a shape if there are too many
        // or just get rid of existing shapes.
        if (this.shapes.length > MAX_NUM_SHAPES) {
            this.removeShape();
        }
        let bands;
        if (range === undefined) {
            let chooseableRanges =
                Object.entries(this.frequencyBandsByRanges).filter(([k, value]) => value.count < MAX_SHAPES_PER_RANGE);
            if (chooseableRanges.length < 1) {
                console.log("UHOH THERES A WEIRD BUG", this.frequencyBandsByRanges);
                chooseableRanges = Object.entries(this.frequencyBandsByRanges.entries());
            }

            let rangeAndBand = random(chooseableRanges);
            range = rangeAndBand[0];
            bands = rangeAndBand[1];

        } else {
            bands = this.frequencyBandsByRanges[range];
        }

        let center = point === undefined ? randomPoint() : point;
        let s =
            new Shape({
                center: center,
                radius: round(random(this.min_radius, this.max_radius)),
                strokeColor: this.randomColor(),
                numPoints: this.numPoints,
                noise: this.noise,
                default_shape: random(this.shapeModes),
                range: range,
                dieBand: new FrequencyBand({
                    minValue: bands.dieBand.minValue,
                    maxValue: bands.dieBand.maxValue,
                    framesForAction: bands.dieBand.framesForAction
                }),
                splitBand: new FrequencyBand({
                    minValue: bands.splitBand.minValue,
                    maxValue: bands.splitBand.maxValue,
                    framesForAction: bands.splitBand.framesForAction
                }),
            });
        this.shapes.push(s);
        this.rangesWithoutShapes.delete(s.range);
        this.frequencyBandsByRanges[s.range].count++;
        this.frequencyBandsByRanges[s.range].dieBand.widen(false);
        this.frequencyBandsByRanges[s.range].splitBand.narrow(true);
        this.frequencyBandsByRanges[s.range].splitBand.adjustFrames(random() < 0.5);
        this.frequencyBandsByRanges[s.range].dieBand.adjustFrames(random() < 0.5);

    };

    this.reset = function() {
        this.shapes = [];
        this.min_radius = 5;
        this.max_radius = 100;
        this.colorIndex = floor(random(NUM_COLOR_MODES));
        this.numPoints = 50;
        this.noise = 5;
        this.fillModeIndex = 0;
        this.shapeModeIndex = 0;
        this.shapeOverride = false;
        this.move = true;
        this.background = color(floor(random(255)));
        this.drawBackground = false;
        this.rotate = true;

        background(this.background);
    }

    this.validateRadii = function() {
        if (this.min_radius <= 0) {
            this.min_radius = floor(random(5, 10));
        }
        if (this.min_radius > this.max_radius) {
            this.max_radius += 5;
            this.min_radius -= 5;
        }

    };

    this.keyPress = function(key) {
        switch (key) {
            case 0:
                this.addShape();
                break;
            case 1:
                this.fillModeIndex = (this.fillModeIndex + 1) % this.fillModes.length;
                break;

            case 2:

                for (let i = 0; i < this.shapes.length; i++) {
                    this.shapes[i].c1 = color(floor(random(255)), floor(random(255)), floor(random(255)));
                    this.shapes[i].c2 = color(floor(random(255)), floor(random(255)), floor(random(255)));
                }
                break;
            case 3:
                this.shapeOverride = true;
                this.shapeModeIndex = (this.shapeModeIndex + 1) % this.shapeModes.length;
                break;
            case 4:
                this.shapeOverride = !this.shapeOverride;
                break;
            case 5:
                this.min_radius += floor(random(5));
                this.max_radius += floor(random(5));
                this.validateRadii();
                console.log(this.min_radius, this.max_radius);
                break;
            case 6:
                this.min_radius -= floor(random(5));
                this.max_radius -= floor(random(5));
                this.validateRadii();
                console.log(this.min_radius, this.max_radius);
                break;
            case 7:
                this.drawBackground = !this.drawBackground;
                break;

            case 8:
                for (let i = 0; i < this.shapes.length; i++) {
                    this.shapes[i].default_shape_kind = random(this.shapeModes);
                }
                this.shapeOverride = false;

                break;
            case 9:
                this.removeShape();
                break;
            case 10:
                this.colorIndex = (this.colorIndex + 1) % NUM_COLOR_MODES;
                this.move = !this.move;
                break;
            case 11:
                this.reset();
                break;
            default:
                console.log("Key not supported", key);
        }
        if (this.shapes.length == 0 && key != 11) {
            this.colorIndex = key;
            this.shapeModeIndex = floor(random(this.shapeModes.length));
            if (key > 6) {
                this.min_radius += key;
                this.max_radius += key;
            } else {
                this.min_radius -= key;
                this.max_radius -= key;
            }
            this.addShape();
        }

    }

    this.randomColor = function() {

        let vals = [...Array(3)].map(() => random(255));
        vals.sort();
        switch (this.colorIndex) {
            case 0:
                return {
                    r: vals[0], g: vals[1], b: vals[2]
                };
            case 1:
                return {
                    r: vals[0], g: vals[2], b: vals[1]
                };
            case 2:
                return {
                    r: vals[1], g: vals[0], b: vals[2]
                };
            case 3:
                return {
                    r: vals[1], g: vals[2], b: vals[1]
                };
            case 4:
                return {
                    r: vals[2], g: vals[0], b: vals[1]
                };
            case 5:
                return {
                    r: vals[2], g: vals[1], b: vals[0]
                };
            case 6:
                return {
                    r: vals[1], g: vals[1], b: vals[1]
                };
            case 7:
                // IF YOU ADD THINGS HERE UPDATE NUM COLOR MODES 
            case 8:
            case 9:
            case 10:
            case 11:

            default:
                return {
                    r: random(255), g: random(255), b: random(255)
                };

        }
    }
}

function weightedChoice(weightedList) {
    let totalWeight = 0;

    for (let i = 0; i < weightedList.length; i++) {
        totalWeight += weightedList[i].weight;
    }
    let choice = floor(random(0, totalWeight));
    let currentWeight = 0;
    for (let i = 0; i < weightedList.length; i++) {
        currentWeight += weightedList[i].weight;
        if (currentWeight > choice) {
            return weightedList[i].value;
        }
    }

    console.error("Error choosing element from weighted list", {
        choice: choice,
        totalWeight: totalWeight,
        weightedList: weightedList,
    });
}

function randomPoint() {
    return {
        x: floor(random(width)),
        y: floor(random(height))
    };
}
