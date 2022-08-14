const NUM_COLOR_MODES = 8;

function Art(canvas, ranges) {
    this.canvas = canvas;
    this.fillModes = ["frequency","filled", "noFill", "whiteFill", "randomOpacity", ];
    this.shapeModes = ["circle", "heart", "square", "rose", "inverseRose", "star"];
    this.shapes = [];
    this.min_radius = floor(max(canvas.width, canvas.height) / 20);
    this.max_radius = floor(max(canvas.width, canvas.height) / 5);
    this.colorIndex = 0;
    this.numPoints = 50;
    this.noise = 5;
    this.fillModeIndex = 0;
    this.shapeModeIndex = 0;
    this.shapeOverride = true;
    this.move = true;
    this.background = color(255);
    this.drawBackground = false;
    this.ranges = ranges;
    this.rotate = true;

    this.draw = function(soundwave, amplitude) {
        if (this.drawBackground) {
            background(this.background);
        }
        let shapeKind = this.shapeOverride ? this.shapeModes[this.shapeModeIndex] : undefined;
        for (let i = 0; i < this.shapes.length; i++) {
            this.shapes[i].draw({
                fillMode: this.fillModes[this.fillModeIndex],
                soundwave: soundwave,
                amplitude: min(amplitude * 100, 1.0),
                min_radius: this.min_radius,
                canvas: this.canvas,
                shapeKind: shapeKind,
                frequencies: frequencies,
                rotate : this.rotate,
            });
        }
    }

    this.update = function(amplitude, frequencies) {

        for (let i = 0; i < this.shapes.length; i++) {
            this.shapes[i].update({
                canvas: this.canvas,
                move: this.move,
                frequencies: frequencies,
                amplitude: min(amplitude * 100, 1.0),

            });
        }

    }

    this.encoderSwitch = function(encoder_switch_value) {
        console.log("TODO: encoder switch", encoder_switch_value);
    }

    this.encoder = function(value) {
        // if (value > -20) {
        //     frameRate(value + 20);
        // }
    }

    this.addShape = function(point) {
        let center =point === undefined ? this.canvas.randomPoint() : point;
        let s =
            new Shape({
                center: center,
                radius: floor(random(this.min_radius, this.max_radius + 1)),
                color: this.randomColor(),
                numPoints: this.numPoints,
                noise: this.noise,
                default_shape: random(this.shapeModes),
                range: random(this.ranges)
            });
        this.shapes.push(s);
    }

    this.reset = function() {
        this.shapes = [];
        this.min_radius = 5;
        this.max_radius = 100;
        this.colorIndex = 0;
        this.numPoints = 50;
        this.noise = 5;
        this.fillModeIndex = 0;
        this.shapeModeIndex = 0;
        this.shapeOverride = true;
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

    }
    this.keyPress = function(key) {
        console.log("TODO", key);
        switch (key) {
            case 0:
            this.addShape(x,y);
                break;
            case 1:
                this.fillModeIndex = (this.fillModeIndex + 1) % this.fillModes.length;
                break;

            case 2:
                this.rotate = !this.rotate;
                console.log(this);
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
                this.colorIndex = (this.colorIndex + 1) % NUM_COLOR_MODES;
                break;
            case 10:
                this.move = !this.move;
                break;
            case 11:
                this.reset();
                break;
            default:
                console.log("TODO!", key);
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
