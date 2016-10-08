using Esri.ArcGISRuntime.Data;
using Esri.ArcGISRuntime.Geometry;
using Esri.ArcGISRuntime.Mapping;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using Xamarin.Forms;

namespace TalkingCode2016
{
    public partial class Online3D : ContentPage
    {
        private Scene myScene;
        private FeatureLayer stationnements;
        public Online3D()
        {
            InitializeComponent();

            // Initialisation de carte/scene standard avec Basemap
            Scene myScene = new Scene(Basemap.CreateImageryWithLabels());

            // création d'une étendue sur Lyon et la part dieu
            Envelope myExtent = new Envelope(540412.4772154895, 5742150.47836813, 540985.754927453, 5742435.624313403, SpatialReferences.WebMercator);
            // mise en place de l'étendue par défaut de la carte à l'ouverture
            myScene.InitialViewpoint = new Viewpoint(myExtent);

            // Ajouter une couche
            ArcGISSceneLayer lyonBatiments = new ArcGISSceneLayer(new System.Uri("http://maps.esrifrance.fr/arcgis/rest/services/Hosted/Batiments_3D_Lyon/SceneServer/layers/0"));
            myScene.OperationalLayers.Add(lyonBatiments);

            // récupération du service d'élévation
            var elevationSource = new ArcGISTiledElevationSource(new System.Uri("http://elevation3d.arcgis.com/arcgis/rest/services/WorldElevation3D/Terrain3D/ImageServer"));          
            var sceneSurface = new Surface();
            sceneSurface.ElevationSources.Add(elevationSource);
            // ajout de l'élévation à la scène.
            myScene.BaseSurface = sceneSurface;

            // on assigne notre scene à la vue
            myView.Scene = myScene;
        }


    }
}
