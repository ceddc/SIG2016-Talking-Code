 require([
	  // Esri
      "esri/Map",
      "esri/core/watchUtils",
      "esri/tasks/Locator",
      "esri/views/MapView",
      "esri/views/SceneView",
      "esri/widgets/Home",
      "esri/widgets/Locate",
      "esri/widgets/Search",

	  // Dojo
      "dojo/dom",
      "dojo/dom-class",
      "dojo/dom-construct",
      "dojo/on",
      "dojo/query",

      // Bootstrap
      "bootstrap/Collapse",
      "bootstrap/Dropdown",
      "bootstrap/Modal",
      "bootstrap/Tab",

      // Calcite-maps
      "calcite-maps/calcitemaps-v0.2",
      "dojo/domReady!"
    ],
 	function (
 		Map, watchUtils, Locator, MapView, SceneView, Home, Locate, Search,
 		dom, domClass, domConstruct, on, query,
 		Collapse, Dropdown, Modal, Tab) {

 		/************
 		 * START Init App
 		 */

 		app = {
 			scale: 50000000,
 			center: [-40, 40],
 			initialExtent: { // autocasts as new Extent()
            xmin: 381004,
            ymin: 6101279,
            xmax: 808249,
            ymax: 381004,
            spatialReference: 102100
          },
 			basemap: "hybrid",
 			viewPadding: {
 				top: 50
 			},
 			mapView: null,
 			sceneView: null,
 			activeView: null
 		};

 		// Tabs
 		function syncTabs(e) {
 			query(".calcite-navbar li.active").removeClass("active");
 			query(e.target).addClass("active");
 		}

 		// Views
 		function syncViews(fromView, toView) {
 			watchUtils.whenTrueOnce(toView, "ready").then(function (result) {
 				watchUtils.whenTrueOnce(toView, "stationary").then(function (result) {
 					toView.goTo(fromView.viewpoint);
 					toView.popup.reposition();
 				});
 			});
 		}

 		// Tab Events (Views)
 		query(".calcite-navbar li a[data-toggle='tab']").on("click", function (e) {
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

 		// Map 
 		var map = new Map({
 			basemap: app.basemap,
 		});

 		// Map View
 		app.mapView = new MapView({
 			container: "mapViewDiv",
 			map: map,
 			padding: app.viewPadding,
 			ui: {
 				components: ["zoom", "compass", "attribution"]
 			}
 		});

 		// Scene View
 		app.sceneView = new SceneView({
 			container: "sceneViewDiv",
 			map: map,
 			padding: app.viewPadding,
 		});

 		// Define which view to display
 		app.activeView = app.mapView;

 		/*
 		 * END MapView & SceneView
 		 **************************/



 		/***********************
 		 * START Basemap Toggle
 		 */

 		// Basemap events
 		query("#selectBasemapPanel").on("change", function (e) {
 			app.mapView.map.basemap = e.target.options[e.target.selectedIndex]
 				.dataset.vector;
 			app.sceneView.map.basemap = e.target.value;
 		});

 		/*
 		 * END Basemap Toggle
 		 *********************/



 		/********************
 		 * START Add buttons
 		 */

 		// Home button
 		var homeBtn_Map = new Home({
 			view: app.mapView
 		});
 		homeBtn_Map.startup();
 		app.mapView.ui.add(homeBtn_Map, "top-left");

 		var homeBtn_Scene = new Home({
 			view: app.sceneView
 		});
 		homeBtn_Scene.startup();
 		app.sceneView.ui.add(homeBtn_Scene, "bottom-left");

 		// Locate button
 		var locateBtn_Map = new Locate({
 			view: app.mapView
 		});
 		locateBtn_Map.startup();
 		app.mapView.ui.add(locateBtn_Map, {
 			position: "top-left",
 		});

 		var locateBtn_Scene = new Locate({
 			view: app.sceneView
 		});
 		locateBtn_Scene.startup();
 		app.sceneView.ui.add(locateBtn_Scene, {
 			position: "top-left",
 		});

 		/*
 		 * END Add buttons
 		 *******************/



 		/**********************
 		 * START Search Widget
 		 */

 		var locatorUrl = "http://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer";

 		app.searchWidget = new Search({
 			view: app.activeView,
 			sources: [
 				{
 					//Pass in the custom locator to the sources
 					locator: new Locator(locatorUrl),
 					singleLineFieldName: "SingleLine",
 					outFields: ["Match_addr"],
 					name: "OSM",
 					placeholder: "Saisissez une adresse",
 					countryCode: "FR"
            }
          ],
 			allPlaceholder: "Recherchez un endroit",
 			autoSelect: true,
 			minSuggestCharacters: 3
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
	 
	 
	 
	 	/*******
 		 * TODO
 		 */
	 
	 
 	});