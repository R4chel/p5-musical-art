function Shape({
    center,
    radius,
    noise,
    numPoints,
    color,
    default_shape,
    range,

}) {
    this.center = center;
    this.radius = radius;
    this.color = color;
    this.noise = noise;
    this.thetaOffset = random(0, 2 * PI);
    this.a = floor(random(3, 8));
    this.b = floor(random(2, 6));
    this.default_shape_kind = default_shape;
    this.range = range;
    this.waveMultiplier = floor(random(1, 6));
    // bands should be specified by range
    this.splitBand = new FrequencyBand({
        minValue: 0.8,
        maxValue: 1.,
        framesForAction: 30
    });
    this.dieBand = new FrequencyBand({
        minValue: 0,
        maxValue: 0.01,
        framesForAction: 100
    });


    this.drawColors = function(fillMode, frequencies) {
        switch (fillMode) {
            case "noFill":
                noFill();
                break;
            case "filled":
                fill(toColor(this.color));
                break;

            case "whiteFill":
                fill("white");
                break;
            case "randomOpacity":
                fill(this.color.r, this.color.g, this.color.b, random(255));
                break;
            case "frequency":
                fill(frequencies[this.range]);
                break;


        };
        stroke(toColor(this.color));
    };

    function fancyHeart(scale, t) {
        t += PI;
        // source : https://pavpanchekha.com/blog/heart-polar-coordinates.html
        // note: looks bad if numPoints < 360
        let r = (Math.sin(t) * Math.sqrt(Math.abs(Math.cos(t)))) / (Math.sin(t) + 7 / 5) - 2 * Math.sin(t) + 2;
        return r * scale / 2.5;
    };


    this.rByShape = function(shapeKind, r, theta) {
        switch (shapeKind) {
            case "star":
                return r + this.a * sin(this.b * 2 * theta + PI / 2);
                break;
            case "inverseRose":
                // this is wrong
                return r * sin((this.b) * theta / (this.b - 1));
                break;
            case "rose":
                return r * sin(this.b * theta);
                break;
            case "square":
                return r * min(1 / abs(cos(theta)), 1 / abs(sin(theta)));
                break;
            case "heart":
                return fancyHeart(r, theta);
                break;
            case "circle":
                return r;
                break;
            default:
                console.log("unknown shape", shapeKind);
                return r;
                break;

        }
    };

    this.period = function(shapeKind) {
        switch (shapeKind) {
            case "spiral":
                return 2 * PI;
            case "inverseRose":
                // this is wrong
                return 2 * PI * (this.b - 1);
                break;
            case "rose":
            case "square":
            case "heart":
            case "circle":
            default:
                return 2 * PI;
                break;

        }
    };

    this.draw = function({
        fillMode,
        soundwave,
        amplitude,
        min_radius,
        shapeKind,
        frequencies,
        rotate
    }) {
        shapeKind = shapeKind === undefined ? this.default_shape_kind : shapeKind;
        let period = this.period(shapeKind);
        this.drawColors(fillMode, frequencies);
        stroke(toColor(this.color));
        beginShape();
        let radius = this.radius;
        if (amplitude != 0) {
            radius = lerp(min_radius, this.radius * 2, amplitude);
        }
        for (let i = 0; i < soundwave.length; i++) {
            let theta = i * period / soundwave.length;

            let r = map(soundwave[i], 0, 1, radius, radius * 5 / 4);
            // let r = radius + soundwave[i] * this.waveMultiplier;
            let rotatedTheta = rotate ? theta + this.thetaOffset : theta;
            r = this.rByShape(shapeKind, r, rotatedTheta);
            let x = cos(theta) * (r) + this.center.x;
            let y = sin(theta) * (r) + this.center.y;
            curveVertex(x, y);
        }

        switch (shapeKind) {
            case "spiral":
                endShape();
                break;
            default:
                endShape(CLOSE);
                break;
        }

    };

    this.update = function({
        move,
        frequencies,
        amplitude
    }) {
        let frequency = frequencies[this.range];
        let normalizedFrequency = map(frequency, 0, 255, 0, 1);
        if (move) {

            let noise = map(frequency, 0, 255, 0.001, this.noise * this.radius);
            let thetaDelta = map(frequency, 0, 255, 0.001, PI / 2);

            let center_x_update = randomGaussian(0, noise);
            let center_y_update = randomGaussian(0, noise);
            this.center.x = constrain(center.x + center_x_update, 0, width);
            this.center.y = constrain(center.y + center_y_update, 0, height);
            this.thetaOffset += random(-thetaDelta, thetaDelta);
        }

        if (this.splitBand.update(normalizedFrequency)) {
            console.log(this.range, normalizedFrequency, this.splitBand);
            return "SPLIT";
        }
        if (this.dieBand.update(normalizedFrequency)) {
            return "DIE";
        }
    };

    this.resetFrequencyBands = function() {
        this.splitBand.reset();
        this.dieBand.reset();
    }

}

function toColor(x) {
    return color(x.r, x.g, x.b);
}
