using Esri.ArcGISRuntime.Mapping;
using Esri.ArcGISRuntime.Tasks.Geocoding;
using Esri.ArcGISRuntime.UI;
using System;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Windows;
using System.Collections.Generic;
using System.Windows.Input;

namespace TalkingCode2016PointNet
{
    public partial class MainWindow : Window
    {
        private LocatorTask myLocator;

        public MainWindow()
        {
            InitializeComponent();
            
            // Création de l'objet map standard
            var myDefaultMap = new Map(Basemap.CreateImageryWithLabels());
            // On assigne notre map à la vue, la carte se charge.
            mapView1.Map = myDefaultMap;
            

        }

        /// <summary>
        /// Action de clic sur le bouton
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        private void loadMmpk_Click(object sender, RoutedEventArgs e)
        {
            LoadMapPackage();
        }
        

        /// <summary>
        /// CHargement du package de carte et de la carte asociée.
        /// </summary>
        async private void LoadMapPackage()
        {
            // ouverture du Map mobile package
            var mapPackage = await MobileMapPackage.OpenAsync(@".\Data\DemoParis2.mmpk");
            
            // récupération de la première carte
            var map = mapPackage.Maps[0];

            // On assigne notre map à la vue, la carte se charge.
            mapView1.Map = map;


            

            if (mapPackage.Locator != null)
            {
                // assignation de l'event clic sur la carte
                mapView1.GeoViewTapped += mapView1_GeoViewTapped;

                // recupere le locator du package
                myLocator = mapPackage.Locator;
            }
            

        }
        /// <summary>
        /// Reverse geocode au clic sur la carte
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        async void mapView1_GeoViewTapped(object sender, GeoViewInputEventArgs e)
        {
            // on set les paramètres du reverse geocode
            ReverseGeocodeParameters geocodeParams = new ReverseGeocodeParameters();
            geocodeParams.MaxDistance = 800;
            geocodeParams.MaxResults = 10;
            // on effectue le reverse geocode sur l'emplacement cliqué
            IReadOnlyList<GeocodeResult> resultList = await myLocator.ReverseGeocodeAsync(e.Location, geocodeParams);
            // si il y a un résultat, on affiche le premier
            if(resultList.Count > 0)
            {
                reverseGeocodeLabel.Visibility = Visibility.Visible;
                reverseGeocodeLabel.Content = "Magasin : " + resultList[0].Label;
            }
            else
            {
                reverseGeocodeLabel.Visibility = Visibility.Hidden;
            }
        }
        /// <summary>
        /// Sugestion de geocodage lorsque input rempli
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        async private void suggestInput_KeyDown(object sender, System.Windows.Input.KeyEventArgs e)
        {
            // on set les pramètres du geocodage
                SuggestParameters suggestParams = new SuggestParameters();
                suggestParams.MaxResults = 5;
                // on effectue un suggest
                IReadOnlyList<SuggestResult> suggests = await myLocator.SuggestAsync(suggestInput.Text, suggestParams);
                // et on met à jour la liste
                suggestList.ItemsSource = suggests.ToList();
        }
        /// <summary>
        /// Deplacement sur le resultat du geocodage au clic sur la liste
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        async private void suggestList_Selected(object sender, RoutedEventArgs e)
        {
            if (suggestList.SelectedItem != null)
            {
                // on récupère le suggest result
                SuggestResult currentSuggest = suggestList.SelectedItem as SuggestResult;
                // et on geocode avec ce résultat.
                IReadOnlyList<GeocodeResult> geocodeResults = await myLocator.GeocodeAsync(currentSuggest);
                // si on récupère bien un résultat
                if(geocodeResults.Count>0)
                {
                    // on demande a la vue de zoomer sur l'étendue du premier résultat.
                    await mapView1.SetViewpointGeometryAsync(geocodeResults[0].Extent);
                }
            }
        }
        
    }
}
