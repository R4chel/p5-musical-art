function FrequencyBand({
    minValue, maxValue, framesForAction
}){
    this.minValue = minValue;
    this.maxValue = maxValue;
    this.framesForAction = framesForAction;
    this.frames = 0;

    this.update = function(frequency){
        if(frequency => this.minValue && frequency <= this.maxValue){
            this.frames++;
        }
        else{
            this.frames = 0;
        }
        return (this.frames > this.framesForAction);
    };

    this.reset = function(frequency) {
        this.frames = 0;
    }
}
