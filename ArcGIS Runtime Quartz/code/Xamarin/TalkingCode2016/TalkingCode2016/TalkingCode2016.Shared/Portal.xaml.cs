using Esri.ArcGISRuntime.Mapping;
using Esri.ArcGISRuntime.Portal;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using Xamarin.Forms;

namespace TalkingCode2016
{
	public partial class Portal : ContentPage
	{
		public Portal ()
        {
            InitializeComponent();
            BindingContext = this;

            Initialize();
        }


        private ArcGISPortal portal;
        private void Initialize()
        {

            // Initialisation d'une webmap
            Map myMap  = new Map(new Uri("http://www.arcgis.com/home/webmap/viewer.html?webmap=273c8055c32b48a8b4fd44bce87e5bbb"));

            // on assigne notre carte à la vue : la carte est "chargée"
            myView.Map = myMap;





            // Initialisation de l'objet Portal
            InitPortal();
        }


        /// <summary>
        /// FOnction asynchrone de creation de l'objet Portal
        /// </summary>
        private async void InitPortal()
        {
            // Creation du "Portal"
            portal = await ArcGISPortal.CreateAsync(new Uri("https://www.arcgis.com/sharing/rest/"));

            // mise à jour de la liste des couches, afin de récupérer des cartes spécifiques.
            updateList("(group:\"c755678be14e4a0984af36a15f5b643e\" OR group:\"2cf4e5dec77b448db35d28c7d44af361\")  type:\"Web Map\" AND -type:\"Application\" and -owner:\"esri\"");
        }

        /// <summary>
        /// Fonction de mise à jour de la liste des cartes
        /// </summary>
        /// <param name="query"></param>
        private async void updateList(string query)
        {
            // Creation des parametres de recherche
            SearchParameters searchParameters = new SearchParameters(query);
            //searchParameters.SortField = "modified";
            searchParameters.SortField = "numviews";
            searchParameters.SortOrder = QuerySortOrder.Descending;


            // Lancement de la recherche sur le portal.
            SearchResultInfo<ArcGISPortalItem> resultItems = await portal.SearchItemsAsync(searchParameters);

            // Conversion en liste
            List<ArcGISPortalItem> itemList = resultItems.Results.ToList();
            // On assigne les resultats à notre liste coté ihm.
            webmapsList.ItemsSource = itemList;
        }
        /// <summary>
        /// AU clic sur une carte de la liste
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        private void webmapsList_SelectionChanged(object sender, SelectedItemChangedEventArgs e)
        {
            
            if (webmapsList.SelectedItem != null)
            {
                // on récupère la carte sélectionnée : Un portal item
                ArcGISPortalItem webmap = (ArcGISPortalItem)webmapsList.SelectedItem;
                
                // on crée une nouvelle carte
                Map myNewMap = new Map(webmap);

                // on assigne la nouvelle carte à la vue
                myView.Map = myNewMap;
            }
        }

        /// <summary>
        /// Validation de l'entry/textinput
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        private void searchBox_Completed(object sender, EventArgs e)
        {
            // recupère le texte et spécifie le type webmap
            var searchText = searchBox.Text + " type:\"Web Map\" AND -type:\"Application\"";
            // appelle la fonction de mise à jour
            updateList(searchText);
        }
}
}
