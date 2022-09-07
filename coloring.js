const NUM_COLOR_MODES = 8;
const FILL_MODES = ["frequency", "frequencyPalette", "frequencyRandomPalette", "filled", "noFill", "whiteFill", "randomOpacity", ];

function Coloring() {
    this.reset = function (){
        this.colorIndex = floor(random(NUM_COLOR_MODES));
        this.background = color(floor(random(255)));
        this._fillModeIndex = 0;
    };
    this.reset();

    this.fillMode = function (){
        return FILL_MODES[this._fillModeIndex];
    };

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

    this.createFillModeSelector = function(){
        let select = createSelect(false);
        for (let i = 0; i < FILL_MODES.length; i++) {
            select.option(FILL_MODES[i], i);
        }
        // TODO confirm that this works as expected
        select.selected(FILL_MODES[this._fillModeIndex]);
        select.input(function () {
            this._fillModeIndex = select.value();
        });
        this.fillModeSelector = select;
        this.onFillModeIndexChange = function(value) {
            select.selected(value);
        };
        return select;
    };

    this.changeFillMode = function(){
        this._fillModeIndex = (this._fillModeIndex + 1) % FILL_MODES.length;
        this.onFillModeIndexChange(FILL_MODES[this._fillModeIndex]);
        if(this.fillModeSelector != undefined){
            this.fillModeSelector.selected(FILL_MODES[this._fillModeIndex]);
        }

    };
    this.setFillModeIndex = function(index){
        this._fillModeIndex= index
    };

    this.fillModes = FILL_MODES;
}
