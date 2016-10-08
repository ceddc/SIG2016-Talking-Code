define([
"./Slides/SlidesViewModel",
"esri/core/watchUtils",
"esri/widgets/support/viewModelWiring",
"esri/widgets/Widget",
"dijit/_TemplatedMixin", 
"dojo/dom-class",
"dojo/dom-construct",
"dojo/_base/lang",
"dojo/on",
"dojo/query",
"dojo/text!./Slides/templates/Slides.html"], function(SlidesViewModel, watchUtils, viewModelWiring, Widget, _TemplatedMixin, domClass, domConstruct, lang, on, query, Template) {
    return Widget.createSubclass([_TemplatedMixin], {
        declaredClass: "esri.widgets.Slides",
        baseClass: "esri-slides",
        templateString: Template,
        
        properties: {
            viewModel: {
                type: SlidesViewModel
            },
            view: {
                dependsOn: ["viewModel.view"]
            }
        },
        
        postCreate: function() {
            this.inherited(arguments);
        	 watchUtils.whenTrueOnce(this.viewModel, "ready", function(ready) {
              this.createSlides();
            }.bind(this));
        },
        
        createSlideUI : function (slide, placement) {
       
	        var slideElement = domConstruct.create("div", {
	          // Assign the ID of the slide to the <span> element
	          id: slide.id,
	          className: "slide"
	        });

       
	        var position = placement ? placement : "last";
	        domConstruct.place(slideElement, this.slidesNode, position);

       
	        domConstruct.create("div", {
	          // Place the title of the slide in the <div> element
	          textContent: slide.title.text,
	          className: "title"
	        }, slideElement);

        
	        domConstruct.create("img", {
	          // Set the src URL of the image to the thumbnail URL of the slide
	          src: slide.thumbnail.url,
	
	          // Set the title property of the image to the title of the slide
	          title: slide.title.text
	        }, slideElement); // Place the image inside the new <div> element

        
        	on(slideElement, "click", lang.hitch(this, function() {
          		query(".slide").removeClass("active");
				domClass.add(slideElement, "active");
          		this.changeSlide(slide);
        	}));
      	},
      
      	createSlides : function(){
        	this.viewModel.slides.forEach(lang.hitch(this, this.createSlideUI));
      	},
      
        
        _getViewAttr: viewModelWiring.createGetterDelegate("view"),
        _setViewAttr: viewModelWiring.createSetterDelegate("view"),
        changeSlide: viewModelWiring.createMethodDelegate("changeSlide")
    });
});