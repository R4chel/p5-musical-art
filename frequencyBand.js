const FRICTION = 0.95;

function FrequencyBand({
    minValue,
    maxValue,
    framesForAction
}) {
    this.minValue = minValue;
    this.maxValue = maxValue;
    this.framesForAction = framesForAction;
    this.frames = 0;

    this.update = function(frequency) {
        if (frequency >= this.minValue && frequency <= this.maxValue) {
            this.frames++;
        } else {
            this.frames = 0;
        }
        return (this.frames > this.framesForAction);
    };

    this.reset = function() {
        this.frames = 0;
    };

    this.adjustFrames = function(widen) {
        if (widen) {
            this.framesForAction = max(round(this.framesForAction * FRICTION), 5);
        } else {
            this.framesForAction = round(this.framesForAction / FRICTION);
        }
    };

    this.widen = function(split){
        if(split){
            this.minValue *= FRICTION;
        }
        else{
            this.maxValue /= FRICTION;
        }
    };
    this.narrow = function(split){
        if(split){
            this.minValue /= FRICTION;
        }
        else{
            this.maxValue *=FRICTION;
        }
    };
}
