require([
    "esri/Map",
    "esri/Basemap",
    "esri/layers/FeatureLayer",
    "esri/layers/VectorTileLayer",
    "esri/layers/WebTileLayer",

    "esri/views/MapView",
    "esri/geometry/Extent",

    "dojo/on",
    "dojo/dom",
    "dojo/dom-construct",
    "dojo/dom-class",
    "dojo/text!./2D_control_panel.html",

    "dojo/domReady!"
],

function(
    Map, Basemap, FeatureLayer, VectorTileLayer, WebTileLayer,
    MapView, Extent,
    on, dom, domConstruct, domClass, panelTemplate
) {



    /** Utilities **/

    function log(target,message) {
        var messageNode = domConstruct.create("div", null, target, "first");
        messageNode.innerHTML = message;
        setTimeout( function() { domConstruct.destroy( messageNode ); }, 3000 );
    }




    /*********** DEFINING CONSTANT OBJECTS WE'LL PLAY WITH ************/

    // sub domains for the WebTile services
    var wtSubDomains = ["a","b","c","d"];

    // Extents
    var extents = {
        rhone: Extent.fromJSON({xmin:245820.9623693882,ymin:5598247.542463157,xmax:832857.3395992587,ymax:5908276.129187683,spatialReference:{wkid:102100,latestWkid:3857}}),
        lyon: Extent.fromJSON({xmin:522343.7041050792,ymin:5735170.433854902,xmax:559033.4776819143,ymax:5748642.4600901455,spatialReference:{wkid:102100,latestWkid:3857}})
    };


    // Layers
    var layers = {

        cellSites : new FeatureLayer("http://services.arcgis.com/S3Ai1AW0LHe63cdi/arcgis/rest/services/couverture/FeatureServer/5"),
        coverage: new FeatureLayer({
            url:"http://services.arcgis.com/S3Ai1AW0LHe63cdi/ArcGIS/rest/services/couverture/FeatureServer/11",
            //definitionExpression:"NOM_REG='RHONE-ALPES'"
            definitionExpression:"CODE_DEPT like '%69%'"
        }),

        tonerBackground : new WebTileLayer({
            urlTemplate: 'http://{subDomain}.tile.stamen.com/toner-background/${level}/${col}/${row}.png',
            subDomains: wtSubDomains
        }),
        tonerLabels : new WebTileLayer({
            urlTemplate: 'http://{subDomain}.tile.stamen.com/toner-labels/${level}/${col}/${row}.png',
            subDomains: wtSubDomains
        })
    };


    // Basemap names
    var defaultBasemapId = "satellite";
    var wtBasemapId = "Toner";
    var esriVectorBasemapId = "gray-vector";
    var customVectorBasemapId = "custom-vector";



    /*************** BASIC UI ELEMENTS *****************/

    var map = new Map({
        basemap: defaultBasemapId,
        layers: [layers.coverage, layers.cellSites]
    });

    var view = new MapView({
        container:"viewDiv",
        map:map,
        extent:extents.rhone
    });

    var panelNode = domConstruct.create("div");
    panelNode.innerHTML = panelTemplate;
    view.ui.add(panelNode, "top-right");
    bindPanelUserEvents();





    /** CONVENIENCE TO LET US PLAY WITH THE BROWSER CONSOLE **/

    window.app = {
        map:map,
        layers:layers,
        extents:extents,
        view:view
    };



    /*** Basemap related functions ***/

    function showDefaultBasemap() {
        map.basemap = defaultBasemapId;
    }

    function showWebtilesBasemap() {
        var wtBasemap = new Basemap({
            title: "Toner",
            id: wtBasemapId,
            baseLayers: [layers.tonerBackground]
        });
        map.basemap = wtBasemap;
    }

    function showEsriVectorBasemap() {
        map.basemap = esriVectorBasemapId;
    }

    function showCustomBasemap() {
        map.basemap = esriVectorBasemapId;
        map.basemap.then(
            function baseMapLoaded() {
            map.basemap.id = customVectorBasemapId;
            var vtLayer = map.basemap.baseLayers.items[0];
            vtLayer.then(
                function baseLayerLoaded() {
                vtLayer.loadStyle("alternate_style.json");
            });
        });
    }

    function toggleLabels() {
        if(!!map.basemap.referenceLayers.length) {
            map.basemap.referenceLayers.removeAll();
        } else {
            map.basemap.referenceLayers.add(layers.tonerLabels);
        }
    }




    /*** UI panel management **/

    function bindPanelUserEvents() {

        function bindExtentPanelEvents() {
            view.watch("extent",
                       function() { log("log-extent", "Changement d'extent") });
            view.watch("extent.xmin",
                       function() { log("log-extent", "Changement d'extent.xmin") });
            on( dom.byId("btnGoToLyon"), "click",
               function() { view.goTo(extents.lyon); });
            on( dom.byId("btnSwitchToLyon"), "click",
               function() { view.extent = extents.lyon; });
        }

        function bindBasemapPanelEvents() {
            map.watch("basemap.id", updateBasemapButtons);
            // map.watch("basemap", updateBasemapButtons); // DOES NOT SEE CHANGES OF ATTRIBUTES


            map.basemap.referenceLayers.on("change", updateBasemapButtons);

            on( dom.byId("btnDefaultBasemap"), "click", showDefaultBasemap );
            on( dom.byId("btnWTBasemap"), "click", showWebtilesBasemap);
            on( dom.byId("btnWTBasemapLabels"), "click", toggleLabels );
            on( dom.byId("btnEsriVector"), "click", showEsriVectorBasemap );
            on( dom.byId("btnCustomVector"), "click", showCustomBasemap );
        }

        bindExtentPanelEvents();
        bindBasemapPanelEvents();
    }


    function updateBasemapButtons(){
        showActiveIf("btnDefaultBasemap", map.basemap.id === defaultBasemapId );
        showActiveIf("btnWTBasemap", map.basemap.id === wtBasemapId );
        showActiveIf("btnWTBasemapLabels", !!map.basemap.referenceLayers.length );
        showActiveIf("btnEsriVector", map.basemap.id === esriVectorBasemapId );
        showActiveIf("btnCustomVector", map.basemap.id === customVectorBasemapId);

        function showActiveIf(node,enabled) {
            if(typeof(node) === "string") { node = dom.byId(node); }
            if(enabled) {
                domClass.add(node, "active");
            } else {
                domClass.remove(node, "active");
            }
        }
    }
});
