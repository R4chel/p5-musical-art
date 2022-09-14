const SHAPE_MODES =  ["circle", "heart", "square", "rose", "inverseRose", "star"];
function ShapeConfig(){
    this.reset = function (){
        this.globalMode = false;
        this.globalModeIndex = floor(random(SHAPE_MODES.length));
    };
    this.reset();

    this.createShapeModeSelector = function(){
        let d = createDiv();

        let label = createElement("label");
        let checkbox = createCheckbox("global shape", this.globalMode);

        let select = createSelect(false);
        for (let i = 0; i < SHAPE_MODES.length; i++) {
            select.option(SHAPE_MODES[i], i);
        }
        // TODO confirm that this works as expected
        select.selected(SHAPE_MODES[this._shapeModeIndex]);
        select.input(() => this.globalModeIndex = select.value());
        if(this.globalMode){
            select.attribute('disabled', '');
        }
        this.shapeModeSelector = select;
        
        checkbox.changed(function () {
            this.globalMode = checkbox.checked();
            if (this.checked()) {
                // Disable the selector
                select.attribute('disabled', '');
            } else {
                // Re-enable the selector
                select.removeAttribute('disabled');
            } 
            redraw();
        });
        this.globalModeCheckbox = checkbox;
        d.child(label);
        d.child(checkbox);
        d.child(select);
        return d;
    };

    this.onShapeModeChange = function(){
        if(this.shapeModeSelector != undefined){
            this.shapeModeSelector.value(this._shapeModeIndex);
        }
    };
    this.changeShapeMode = function(){
        this._shapeModeIndex = (this._shapeModeIndex + 1) % SHAPE_MODES.length;
        this.onShapeModeChange();
    };

    this.getGlobalShapeKind = function(){
       return this.globalMode ? SHAPE_MODES[this._shapeModeIndex] : undefined;
    };

    this.randomKind = function(){
        return SHAPE_MODES[floor(random(SHAPE_MODES.length))];
    };

    this.setGlobalMode = function(value){
        this.globalMode = value;
        if(this.globalModeCheckbox != undefined){
            this.globalModeCheckbox.value(value);
        }
    };

    this.toggleGlobalMode = function(){
        this.setGlobalMode(!this.globalMode);
    };

    this.changeShapeModeIndex = function(){
        this.setGlobalMode(true);
        this._shapeModeIndex = (this._shapeModeIndex + 1) % SHAPE_MODES.length;
        if(this.shapeModeSelector != undefined){
            this.shapeModeSelector.value(this._shapeModeIndex);
        }
    }
}
