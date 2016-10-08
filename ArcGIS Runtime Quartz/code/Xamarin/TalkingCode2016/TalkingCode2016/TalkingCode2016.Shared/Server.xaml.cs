using Esri.ArcGISRuntime.Data;
using Esri.ArcGISRuntime.Geometry;
using Esri.ArcGISRuntime.Mapping;
using Esri.ArcGISRuntime.Symbology;
using Esri.ArcGISRuntime.UI;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using Xamarin.Forms;




namespace TalkingCode2016
{
	public partial class Server : ContentPage
	{
        private Map myMap;
        private FeatureLayer stationnements, livraisons;



        public Feature myFeature { get; set; }

        public Server()
		{
            InitializeComponent ();


            // Initialisation de carte standard avec Basemap
            myMap = new Map(Basemap.CreateImageryWithLabels());

            // création d'une étendue sur versailles
            Envelope myExtent = new Envelope(227170.8480635096, 6236085.360818156, 245515.73485192718, 6245210.031069688, SpatialReferences.WebMercator);
            // mise en place de l'étendue par défaut de la carte à l'ouverture
            myMap.InitialViewpoint = new Viewpoint(myExtent);
            
            // Ajouter une couche
            stationnements = new FeatureLayer(new Uri("https://services2.arcgis.com/YECJCCLQCtaylXWh/arcgis/rest/services/Stationnement/FeatureServer/3"));
            myMap.OperationalLayers.Add(stationnements);
            // selection plus large
            stationnements.SelectionWidth = stationnements.SelectionWidth + 3;



            // Ajouter une autre couche ponctuelle
            livraisons = new FeatureLayer(new Uri("https://services2.arcgis.com/YECJCCLQCtaylXWh/arcgis/rest/services/Stationnement/FeatureServer/1/"));
            myMap.OperationalLayers.Add(livraisons);


            // on assigne notre carte à la vue : la carte est "chargée"
            myView.Map = myMap;

            // on en profite pour assigner l'event au click/tap sur la vue
            myView.GeoViewTapped += MyView_GeoViewTapped;


        }

        /// <summary>
        /// Action effectuée au clic sur la carte
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        private async void MyView_GeoViewTapped(object sender, Esri.ArcGISRuntime.Xamarin.Forms.GeoViewInputEventArgs e)
        {
            // au clic, on va aller faire un identify sur la couche.
            IdentifyLayerResult identifyResult = await  myView.IdentifyLayerAsync(stationnements,e.Position, 5);

            // on clear la sélection existante
            stationnements.ClearSelection();
            // on cache le formulaire attributaire
            AttributesForm.IsVisible = false;

            // Si on récupère un objet (ou plusieurs)
            if(identifyResult.GeoElements.Count > 0)
            {
                // on affiche le formulaire
                AttributesForm.IsVisible = true;

                // on récupère le premier résultat
                Feature feature = identifyResult.GeoElements[0] as Feature;
                // on sélectionne l'objet sur la carte
                stationnements.SelectFeature(feature);

                // Mise à jour de l'IHM
                // implémentation simple
                attributeTitle.Title = "Stationnement : " + feature.Attributes["LibVoie"].ToString();
                LibVoie.Detail = feature.Attributes["LibVoie"].ToString();
                Abonnement.Detail = feature.Attributes["Abonnement"].ToString();
                QUARTIER.Detail = feature.Attributes["QUARTIER"].ToString();
                SECTEUR.Detail = feature.Attributes["SECTEUR"].ToString();
                ZONE_.Detail = feature.Attributes["ZONE_"].ToString();
            }
           
        }
    }
}
