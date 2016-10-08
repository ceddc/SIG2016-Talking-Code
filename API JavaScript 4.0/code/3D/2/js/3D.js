require([
// Esri
"esri/Map", 
"esri/core/watchUtils", 
"esri/geometry/Extent", 
"esri/tasks/Locator", 
"esri/views/MapView", 
"esri/views/SceneView",
"esri/widgets/NavigationToggle",  
"esri/widgets/Home", 
"esri/widgets/Locate", 
"esri/widgets/Search", 
"esri/widgets/Legend", 
"esri/layers/FeatureLayer", 
"esri/renderers/UniqueValueRenderer", 
"esri/symbols/SimpleFillSymbol", 
"esri/symbols/PolygonSymbol3D", 
"esri/symbols/ExtrudeSymbol3DLayer",

// Dojo
"dojo/dom", "dojo/dom-class", "dojo/dom-construct", "dojo/on", "dojo/query",

// Bootstrap
"bootstrap/Collapse", "bootstrap/Dropdown", "bootstrap/Modal", "bootstrap/Tab",

// Calcite-maps
"calcite-maps/calcitemaps-v0.2", "dojo/domReady!"], function(Map, watchUtils, Extent, Locator, MapView, SceneView, NavigationToggle, Home, Locate, Search, Legend, FeatureLayer, UniqueValueRenderer, SimpleFillSymbol, PolygonSymbol3D, ExtrudeSymbol3DLayer, dom, domClass, domConstruct, on, query, Collapse, Dropdown, Modal, Tab) {

	/************
	 * START Init App
	 */

	app = {
		initialExtent : {
			xmin : 495046.6048022819,
			ymin : 5726109.2691623345,
			xmax : 584019.3057261071,
			ymax : 5754161.658542957,
			spatialReference : 102100
		},
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
			coverageLyr.renderer = get2DRenderer();
			syncViews(app.sceneView, app.mapView);
			app.activeView = app.mapView;
			
			
		} else {
			coverageLyr.renderer = get3DRenderer();
			syncViews(app.mapView, app.sceneView);
			app.activeView = app.sceneView;
			
		}
		syncSearch();
	});

	/*
	* END Init App
	***********/

	/****************************
	 * Create Layer
	 */
	
	
	var coverageLyr = new FeatureLayer({
		url : "http://localhost:6080/arcgis/rest/services/sig2016/couverture4G/MapServer/11",
		renderer : get2DRenderer(),
		definitionExpression : "CODE_REG = '82'", //couverture_pop > 0 AND
		 popupTemplate: {
          title: "Couverture 4G - {NOM_COMMUNE} {CODE_POSTAL}",
          content: "<p>Couverture 4G totale, <b>{couverture_pop}%</b>, couverture par Opérateur :</p>" +
          "<ul>"+
          "<li>Orange<b> {Orange_pop}%</b></li>" +
          "<li>Bouygues<b> {Bouygues_pop}%</b></li>" +
          "<li>FreeMobile<b> {FreeMobile_pop}%</b></li>" +
          "<li>SFR<b> {SFR_pop}%</b></li>" +
          "</ul>",
            
            
            fieldInfos: [{
              fieldName: "NOM_COMMUNE",
              label: "Commune"
            },
            {
              fieldName: "CODE_POSTAL",
              label: "Département"
            }, 
            {
              fieldName: "Orange_pop",
              label: "Taux de couverture Orange"
            },
            {
              fieldName: "FreeMobile_pop",
              label: "Taux de couverture FreeMobile"
            },
            {
              fieldName: "Bouygues_pop",
              label: "Taux de couverture Bouygues"
            },
            {
              fieldName: "SFR_pop",
              label: "Taux de couverture SFR_pop"
            }, 
            {
              fieldName: "couverture_pop",
              label: "Taux de couverture global"
            }]
        },
        outFields: ["*"],
	});

	/****************************
	 * Init MapView & SceneView
	 */

	// Map
	var map = new Map({
		basemap : app.basemap,
	});

	// Map View
	app.mapView = new MapView({
		container : "mapViewDiv",
		map : map,
		extent : app.initialExtent,
		padding: app.viewPadding,
		ui : {
			components : ["zoom", "compass", "attribution"]
		}
	});

	// Scene View
	app.sceneView = new SceneView({
		container : "sceneViewDiv",
		map : map,
		extent : app.initialExtent,
		padding: app.viewPadding,
	});

	// Define which view to display
	app.activeView = app.mapView;

	/*
	 * END MapView & SceneView
	 **************************/

	map.add(coverageLyr);
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
	
	
	var legendBtn_Scene = new Legend({
		view : app.sceneView
	});

	app.sceneView.ui.add(legendBtn_Scene, {
		position : "top-left",
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

	/*
	 * DEFINE RENDERER
	 **********************/

	function get2DRenderer() {
		//Set the symbols for each category

		var coverageSymbol = new SimpleFillSymbol({
			color : [51, 51, 204, 0.9],
			style : "solid",
			outline : {// autocasts as esri/symbols/SimpleLineSymbol
				color : "white",
				width : 1
			}
		});

		var freeSymbol = new SimpleFillSymbol({
			color : [66, 244, 134, 0.9],
			style : "solid",
			outline : {// autocasts as esri/symbols/SimpleLineSymbol
				color : "white",
				width : 1
			}
		});

		var sfrSymbol = new SimpleFillSymbol({
			color : [244, 80, 66, 0.9],
			style : "solid",
			outline : {// autocasts as esri/symbols/SimpleLineSymbol
				color : "white",
				width : 1
			}
		});

		var bouyguesSymbol = new SimpleFillSymbol({
			color : [244, 66, 185, 0.9],
			style : "solid",
			outline : {// autocasts as esri/symbols/SimpleLineSymbol
				color : "white",
				width : 1
			}
		});

		var orangeSymbol = new SimpleFillSymbol({
			color : [244, 155, 66, 0.9],
			style : "solid",
			outline : {// autocasts as esri/symbols/SimpleLineSymbol
				color : "white",
				width : 1
			}
		});

		return new UniqueValueRenderer({
			field : "BEST_OPERATOR",
			//defaultSymbol: coverageSymbol,  // used to visualize all features not matching specified types
			defaultLabel : "couverture 4G global", //  used in the legend for all other types not specified
			// used for specifying unique values
			uniqueValueInfos : [{
				value : "FreeMobile",
				symbol : freeSymbol,
				label : "couverture 4G FreeMobile"
			}, {
				value : "SFR",
				symbol : sfrSymbol,
				label : "couverture 4G SFR"
			}, {
				value : "Bouygues",
				symbol : bouyguesSymbol,
				label : "couverture 4G Bouygues"
			}, {
				value : "Orange",
				symbol : orangeSymbol,
				label : "couverture 4G Orange"
			}],

			visualVariables : [{
				type : "opacity",
				field : "couverture_pop",
				maxDataValue : 100,
				minDataValue : 0,
				stops : [{
					value : 10,
					opacity : 0.1
				}, {
					value : 90,
					opacity : 0.8
				}]
			}]
		});

	};
	
	function get3DRenderer() {
		//Set the symbols for each category

		var coverageSymbol = new PolygonSymbol3D({
			symbolLayers: [  // add an ExtrudeSymbol3DLayer to the symbolLayers array and set the color
		    new ExtrudeSymbol3DLayer({
		      material: {
		        color: [51, 51, 204, 0.9] 
		      }
		    })
		  	]
		});
		
		
		var freeSymbol = new PolygonSymbol3D({
			symbolLayers: [  // add an ExtrudeSymbol3DLayer to the symbolLayers array and set the color
		    new ExtrudeSymbol3DLayer({
		      material: {
		        color: [66, 244, 134, 0.9]  
		      }
		    })
		  	]
		});
		

		var sfrSymbol = new PolygonSymbol3D({
			symbolLayers: [  // add an ExtrudeSymbol3DLayer to the symbolLayers array and set the color
		    new ExtrudeSymbol3DLayer({
		      material: {
		        color: [244, 80, 66, 0.9]  
		      }
		    })
		  	]
		});

		var bouyguesSymbol = new PolygonSymbol3D({
			symbolLayers: [  // add an ExtrudeSymbol3DLayer to the symbolLayers array and set the color
		    new ExtrudeSymbol3DLayer({
		      material: {
		        color: [244, 66, 185, 0.9]  
		      }
		    })
		  	]
		});
		
		
		var orangeSymbol = new PolygonSymbol3D({
			symbolLayers: [  // add an ExtrudeSymbol3DLayer to the symbolLayers array and set the color
		    new ExtrudeSymbol3DLayer({
		      material: {
		        color: [244, 155, 66, 0.9]  
		      }
		    })
		  	]
		});

		return new UniqueValueRenderer({
			field : "BEST_OPERATOR",
			//defaultSymbol: coverageSymbol,  // used to visualize all features not matching specified types
			defaultLabel : "couverture 4G global", //  used in the legend for all other types not specified
			// used for specifying unique values
			uniqueValueInfos : [{
				value : "FreeMobile",
				symbol : freeSymbol,
				label : "couverture 4G FreeMobile"
			}, {
				value : "SFR",
				symbol : sfrSymbol,
				label : "couverture 4G SFR"
			}, {
				value : "Bouygues",
				symbol : bouyguesSymbol,
				label : "couverture 4G Bouygues"
			}, {
				value : "Orange",
				symbol : orangeSymbol,
				label : "couverture 4G Orange"
			}],

			visualVariables : [{
				type : "opacity",
				field : "couverture_pop",
				maxDataValue : 100,
				minDataValue : 0,
				stops : [{
					value : 10,
					opacity : 0.1
				}, {
					value : 90,
					opacity : 0.8
				}]
			},{
				type : "size",
				field : "POPULATION",
				valueUnit: "feet" 
			}]
		});

	};


}); 