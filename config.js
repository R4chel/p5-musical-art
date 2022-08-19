function Config({
    seed,
    debug,
    canvasWidth,
    canvasHeight,
    timeWindow,
    calibrationWindow, 

}) {

    this.debug = debug === undefined ? false : debug;
    this.canvasWidth = canvasWidth === undefined ? (debug ? 200 : windowWidth) : canvasWidth;
    this.canvasHeight = canvasHeight === undefined ? (debug ? 200 : windowHeight) : canvasHeight;
    this.seed = seed === undefined ? (debug ? 1 : seed) : seed;
    this.timeWindow = timeWindow === undefined ? 10 : timeWindow;
    this.calibrationWindow= calibrationWindow === undefined ? 1000 : calibrationWindow;
    this.setSeed = function() {
        if (this.seed === undefined) {
            this.seed = round(random(1000000));
        }
        randomSeed(this.seed);
    };

}
