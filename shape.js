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
    this.a = floor(random(3,8));
    this.b = floor(random(2, 6));
    this.default_shape_kind = default_shape;
    this.range = range;

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

    }

    function fancyHeart(scale, t) {
        t += PI;
        // source : https://pavpanchekha.com/blog/heart-polar-coordinates.html
        // note: looks bad if numPoints < 360
        let r = (Math.sin(t) * Math.sqrt(Math.abs(Math.cos(t)))) / (Math.sin(t) + 7 / 5) - 2 * Math.sin(t) + 2;
        return r * scale;
    }


    this.rByShape = function(shapeKind, r, theta) {
        switch (shapeKind) {
        case "star":
            return r + this.a*sin(this.b * 2 * theta + PI / 2) ;
            break;
            
            case "inverseRose":
            // this is wrong
            return r * sin((this.b )  * theta/( this.b - 1 ));
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
    }

    this.period = function(shapeKind) {
        switch (shapeKind) {
        case "spiral":
            return 2 * PI;
        case "inverseRose":
            // this is wrong
            return 2 * PI *(this.b - 1);
            break;
        case "rose":
        case "square":
        case "heart":
        case "circle":
        default:
            return 2 * PI;
            break;

        }
    }

    this.draw = function({
        fillMode,
        soundwave,
        amplitude,
        canvas,
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
            radius = lerp(min_radius, this.radius, amplitude);
        }
        for (let i = 0; i < soundwave.length; i++) {
            let theta = i * period / soundwave.length;
            let r = map(soundwave[i], -1, 1, 0, radius * 2);
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

    }

    this.update = function({
        canvas,
        move,
        frequencies,
        amplitude
    }) {
        if (move) {
            let noise = this.noise;
            let thetaDelta = PI / 10;
            let frequency = frequencies[this.range];


            noise = map(frequency, 0, 255, 0, this.noise * 5);
            thetaDelta = 2 * PI * frequency / (255 * 2)

            let center_x_update = randomGaussian(0, this.noise);
            let center_y_update = randomGaussian(0, this.noise);
            this.center.x = constrain(center.x + center_x_update, 0, canvas.width);
            this.center.y = constrain(center.y + center_y_update, 0, canvas.height);
            this.thetaOffset += random(-thetaDelta, thetaDelta);
        }

        let frequency = frequencies[this.range];
        let normalizedFrequency = map(frequency, 0, 255, -1, 1);
        // this.radius += normalizedFrequency;


    }

}

function toColor(x) {
    return color(x.r, x.g, x.b);
}
