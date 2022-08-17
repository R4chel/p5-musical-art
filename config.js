function Config({
    seed,
    debug,
    canvasWidth,
    canvasHeight,
    threshold,
}) {

    this.debug = debug === undefined ? false : debug;
    this.canvasWidth = canvasWidth === undefined ? (debug ? 200 : windowWidth) : canvasWidth;
    this.canvasHeight = canvasHeight === undefined ? (debug ? 200 : windowHeight) : canvasHeight;
    this.threshold = threshold === undefined ? 0.4 : threshold;
    this.seed = seed === undefined ? (debug ? 1 : seed) : seed;
    this.setSeed = function() {
        if (this.seed === undefined) {
            this.seed = round(random(1000000));
        }
        randomSeed(this.seed);
    };

    this.getThreshold = function() {
        return this.threshold;
    };

    this.setThreshold = function(threshold) {
        this.threshold = threshold;
    };


}
