const NUM_COLOR_MODES = 8;
const FILL_MODES = ["frequency", "frequencyPalette", "frequencyRandomPalette", "filled", "noFill", "whiteFill", "randomOpacity", ];

function Coloring() {
    this.reset = function (){
        this.colorIndex = floor(random(NUM_COLOR_MODES));
        this.background = color(floor(random(255)));
        this.fillModeIndex = 0;
    };
    this.reset();

    this.fillMode = function (){
        return FILL_MODES[this._fillModeIndex];
        
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
    };
}
