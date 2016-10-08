define(["esri/core/Accessor", "esri/core/Evented"], function(Accessor, Evented) {
    return Accessor.createSubclass([Evented], {
        declaredClass: "esri.widgets.Sildes.SildesViewModel",
        
        properties: {
            ready: {
                dependsOn: ["view.ready"],
                readOnly: true
            },
            
            slides: {
                dependsOn: ["view.map.presentation.slides"],
                readOnly: true
            },
            view: {
            	
            }
        },
        
        
        constructor: function() {},
        
        _readyGetter: function() {
            return this.get("view.ready");
        },
        
         _slidesGetter: function() {
            return this.get("view.map.presentation.slides");
        },
        
        //view: null,
        
        _viewSetter: function(view) {
            this._set("view", view);
        },
        
        changeSlide : function (slide) {
        	if (this.get("view.ready")) {
               	slide.applyTo(this.view);
            }
        }
        
    });
});
