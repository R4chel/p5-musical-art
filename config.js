function Config({
    seed,
    debug,
    canvasWidth,
    canvasHeight,
    timeWindow,

}) {

    this.debug = debug === undefined ? false : debug;
    this.canvasWidth = canvasWidth === undefined ? (debug ? 200 : windowWidth) : canvasWidth;
    this.canvasHeight = canvasHeight === undefined ? (debug ? 200 : windowHeight) : canvasHeight;
    this.seed = seed === undefined ? (debug ? 1 : seed) : seed;
    this.timeWindow = timeWindow === undefined ? 10 : timeWindow;
    this.setSeed = function() {
        if (this.seed === undefined) {
            this.seed = round(random(1000000));
        }
        randomSeed(this.seed);
    };

}
