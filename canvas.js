function Canvas(width, height){
    this.width = width;
    this.height = height;
    this.canvas = createCanvas(this.width, this.height);
    

    this.randomPoint = function() {
        return {
            x: random(0, this.width),
            y: random(0, this.height)
        };
    }

     
}
