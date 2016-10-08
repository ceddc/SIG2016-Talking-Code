require([
// Esri
"esri/WebMap",
"esri/WebScene", 
"esri/core/watchUtils", 
"esri/geometry/Extent", 
"esri/tasks/Locator", 
"esri/views/MapView", 
"esri/views/SceneView", 
"esri/widgets/Home", 
"esri/widgets/Locate", 
"esri/widgets/Search", 
"esri/widgets/Legend",
"esri/widgets/NavigationToggle", 
"esri/layers/FeatureLayer", 
"esri/renderers/UniqueValueRenderer", 
"esri/symbols/TextSymbol",
"esri/symbols/TextSymbol3DLayer",
"esri/symbols/PointSymbol3D",
"esri/symbols/ObjectSymbol3DLayer",
// Dojo
"dojo/dom", "dojo/dom-class", "dojo/dom-construct", "dojo/on", "dojo/query",

// Bootstrap
"bootstrap/Collapse", "bootstrap/Dropdown", "bootstrap/Modal", "bootstrap/Tab",

//Esri France
"esrifrance-widgets/Slides",

// Calcite-maps
"calcite-maps/calcitemaps-v0.2", "dojo/domReady!"], function(
	WebMap, WebScene, watchUtils, Extent, Locator, MapView, SceneView, Home, Locate, Search, Legend, NavigationToggle, FeatureLayer, UniqueValueRenderer, TextSymbol, TextSymbol3DLayer, PointSymbol3D, ObjectSymbol3DLayer,
	dom, domClass, domConstruct, on, query, Collapse, Dropdown, Modal, Tab, 
	Slides) {

	/************
	 * START Init App
	 */
	
	app = {
		basemap : "hybrid",
		viewPadding : {
			top : 50
		},
		mapView : null,
		sceneView : null,
		activeView : null
	};
	

	// Tabs
	function syncTabs(e) {
		query(".calcite-navbar li.active").removeClass("active");
		query(e.target).addClass("active");
	}

	// Views
	function syncViews(fromView, toView) {
		watchUtils.whenTrueOnce(toView, "ready").then(function(result) {
			watchUtils.whenTrueOnce(toView, "stationary").then(function(result) {
				toView.goTo(fromView.viewpoint);
				toView.popup.reposition();
			});
		});
	}

	// Tab Events (Views)
	query(".calcite-navbar li a[data-toggle='tab']").on("click", function(e) {
		syncTabs(e);
		if (e.target.id.indexOf("mapNav") > -1) {
			syncViews(app.sceneView, app.mapView);
			app.activeView = app.mapView;
			
			
		} else {
			syncViews(app.mapView, app.sceneView);
			app.activeView = app.sceneView;
			
		}
		syncSearch();
	});

	/*
	* END Init App
	***********/

	/****************************
	 * Init MapView & SceneView
	 */

	// Map View
	app.mapView = new MapView({
		container : "mapViewDiv",
		padding: app.viewPadding,
		ui : {
			components : ["zoom", "compass", "attribution"]
		}
	});

	// Scene View
	app.sceneView = new SceneView({
		container : "sceneViewDiv",
		padding: app.viewPadding,
		ui : {
			components : ["zoom", "compass"]
		}
	});

	// Define which view to display
	app.activeView = app.mapView;
	
	
	// Typical usage
	var webMap = new WebMap({
	  portalItem: {
	    id: "34da9c3209054cb4a374ff225e97d86a"
	  }
	});
	
	webMap.load().then(function(){
		var featureLayer = webMap.allLayers.find(function(layer) {
		 	return layer.title === "couverture4G - emetteur";
		});

		return featureLayer.load();
	}).then(function(featureLayer){
		featureLayer.renderer = get2DRenderer();
		app.mapView.map = webMap;
	});
	
	// Typical usage
	var webScene = new WebScene({
	  portalItem: {
	    id: "3d5841086ab84a2580eb042e2a2443ea"
	  }
	});
	
	webScene.load().then(function(){
		var featureLayer = webScene.allLayers.find(function(layer) {
		 	return layer.title === "Couverture4G";
		});

		return featureLayer.load();
	}).then(function(featureLayer){
		featureLayer.renderer = get3DRenderer();
		app.sceneView.map = webScene;
	});

	/*
	 * END MapView & SceneView
	 **************************/


	/***********************
	 * START Basemap Toggle
	 */

	// Basemap events
	query("#selectBasemapPanel").on("change", function(e) {
		app.mapView.map.basemap = e.target.options[e.target.selectedIndex].dataset.vector;
		app.sceneView.map.basemap = e.target.value;
	});

	/*
	* END Basemap Toggle
	*********************/

	/********************
	 * START Add buttons
	 */
	
	// Navigation Toggle only for 3D Scene
	var navigationToggle_Scene = new NavigationToggle({
	  view: app.sceneView
	});
	
	app.sceneView.ui.add(navigationToggle_Scene, {
		position : "top-left",
	});

	// Home button
	var homeBtn_Map = new Home({
		view : app.mapView
	});
	homeBtn_Map.startup();
	app.mapView.ui.add(homeBtn_Map, "top-left");

	var homeBtn_Scene = new Home({
		view : app.sceneView
	});
	homeBtn_Scene.startup();
	app.sceneView.ui.add(homeBtn_Scene, "bottom-left");

	// Locate button
	var locateBtn_Map = new Locate({
		view : app.mapView
	});
	locateBtn_Map.startup();
	app.mapView.ui.add(locateBtn_Map, {
		position : "top-left",
	});

	var locateBtn_Scene = new Locate({
		view : app.sceneView
	});
	locateBtn_Scene.startup();
	app.sceneView.ui.add(locateBtn_Scene, {
		position : "top-left",
	});

	var legendBtn_Map = new Legend({
		view : app.mapView
	});

	app.mapView.ui.add(legendBtn_Map, {
		position : "top-left",
	});
	
	var slides_Scene = new Slides({
		view : app.sceneView
	});
	
	slides_Scene.startup();
	app.sceneView.ui.add(slides_Scene, {
		position : "top-right",
	});

	/*
	* END Add buttons
	*******************/

	/**********************
	 * START Search Widget
	 */

	var locatorUrl = "http://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer";

	app.searchWidget = new Search({
		view : app.activeView,
		sources : [{
			//Pass in the custom locator to the sources
			locator : new Locator(locatorUrl),
			singleLineFieldName : "SingleLine",
			outFields : ["Match_addr"],
			name : "OSM",
			placeholder : "Saisissez une adresse",
			countryCode : "FR"
		}],
		allPlaceholder : "Recherchez un endroit",
		autoSelect : true,
		minSuggestCharacters : 3
	}, "searchWidgetDiv");
	app.searchWidget.startup();

	// Search
	function syncSearch() {
		app.searchWidget.view = app.activeView;
		// Perform search
		if (app.searchWidget.selectedResult) {
			app.searchWidget.search(app.searchWidget.selectedResult.name);
			app.activeView.popup.reposition();
		} else {
			app.searchWidget.clear();
		}
	}

	/*
	 * END Search Widget
	 *********************/

	/**********************
	 * DEFINE RENDERER
	 */
	
	function get2DRenderer(){
      
		//Set the symbols for each category
		var coverageSymbol = new TextSymbol({
        	color: [51, 51, 204, 0.9],
        	text: "\ue900", // esri-icon-map-pin
        	font: { // autocast as esri/symbols/Font
          		size: 15,
          		family: "CalciteWebCoreIcons"
        	}
      	});
		
		var freeSymbol = new TextSymbol({
        	color: [66, 244, 134, 0.9],
        	text: "\ue900", // esri-icon-map-pin
        	font: { // autocast as esri/symbols/Font
          		size: 15,
          		family: "CalciteWebCoreIcons"
        	}
      	});
      	
		var sfrSymbol = new TextSymbol({
        	color: [244, 80, 66, 0.9],
        	text: "\ue900", // esri-icon-map-pin
        	font: { // autocast as esri/symbols/Font
          		size: 15,
          		family: "CalciteWebCoreIcons"
        	}
      	});

		var bouyguesSymbol = new TextSymbol({
        	color: [244, 66, 185, 0.9],
        	text: "\ue900", // esri-icon-map-pin
        	font: { // autocast as esri/symbols/Font
          		size: 15,
          		family: "CalciteWebCoreIcons"
        	}
      	});


		var orangeSymbol = new TextSymbol({
        	color: [244, 155, 66, 0.9],
        	text: "\ue900", // esri-icon-map-pin
        	font: { // autocast as esri/symbols/Font
          		size: 15,
          		family: "CalciteWebCoreIcons"
        	}
      	});
		
		return new UniqueValueRenderer({
			field : "Exploitant",
			//defaultSymbol: coverageSymbol,  // used to visualize all features not matching specified types
			defaultLabel : "couverture 4G global", //  used in the legend for all other types not specified
			// used for specifying unique values
			uniqueValueInfos : [{
				value : "FREE MOBILE",
				symbol : freeSymbol,
				label : "antennes 4G FreeMobile"
			}, {
				value : "SFR",
				symbol : sfrSymbol,
				label : "antennes 4G SFR"
			}, {
				value : "BOUYGUES TELECOM",
				symbol : bouyguesSymbol,
				label : "antennes 4G Bouygues"
			}, {
				value : "ORANGE",
				symbol : orangeSymbol,
				label : "antennes 4G Orange"
			}],

			visualVariables: [{
	          type: "rotation",
	          field: "Azimut",
	          rotationType: "geographic"
	        }]
		});
		
	}
	
	
	function get3DRenderer(){
		//Set the symbols for each category

		var coverageSymbol = new PointSymbol3D({
	        symbolLayers: [new ObjectSymbol3DLayer({
	          resource: {
	            href:"../style/emetteur4G.json"
	          },
	          material: {
	            color:[51, 51, 204],
				transparency:0
	          }
	        })]
	   	});
		
		
		var freeSymbol = new PointSymbol3D({
	        symbolLayers: [new ObjectSymbol3DLayer({
	          resource: {
	            href:"../style/emetteur4G.json"
	          },
	          material: {
	            color:[66, 244, 134],
				transparency:0
	          }
	        })]
	   	});
		
		
		var sfrSymbol = new PointSymbol3D({
	        symbolLayers: [new ObjectSymbol3DLayer({
	          resource: {
	            href:"../style/emetteur4G.json"
	          },
	          material: {
	            color:[244, 80, 66],
				transparency:0
	          }
	        })]
	   	});
		
		
		var bouyguesSymbol = new PointSymbol3D({
	        symbolLayers: [new ObjectSymbol3DLayer({
	          resource: {
	            href:"../style/emetteur4G.json"
	          },
	          material: {
	            color:[244, 66, 185],
				transparency:0
	          }
	        })]
	   	});
		
		
		var orangeSymbol = new PointSymbol3D({
	        symbolLayers: [new ObjectSymbol3DLayer({
	          resource: {
	            href:"../style/emetteur4G.json"
	          },
	          material: {
	            color:[244, 155, 66],
				transparency:0
	          }
	        })]
	   	});
		
		return new UniqueValueRenderer({
			field : "Exploitant",
			//defaultSymbol: coverageSymbol,  // used to visualize all features not matching specified types
			defaultLabel : "couverture 4G global", //  used in the legend for all other types not specified
			// used for specifying unique values
			uniqueValueInfos : [{
				value : "FREE MOBILE",
				symbol : freeSymbol,
				label : "antennes 4G FreeMobile"
			}, {
				value : "SFR",
				symbol : sfrSymbol,
				label : "antennes 4G SFR"
			}, {
				value : "BOUYGUES TELECOM",
				symbol : bouyguesSymbol,
				label : "antennes 4G Bouygues"
			}, {
				value : "ORANGE",
				symbol : orangeSymbol,
				label : "antennes 4G Orange"
			}],
			visualVariables: [{
	          type: "rotation",
	          field: "Azimut",
	          rotationType: "geographic"
	        }]
		});
		
		
	}
	/*
	 * END DEFINE RENDERER
	 *********************/
	
}); 