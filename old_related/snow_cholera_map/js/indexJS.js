//**********************************************
// Pump class definition
function Pump(lon, lat) {
	this.lon = lon;
	this.lat = lat;
}

Pump.prototype.consoleInfo = function() {
	console.log('lon :' + this.lon);
	console.log('lat :' + this.lat);
}

// Death class definition
function Death(lon, lat) {
	this.lon = lon;
	this.lat = lat;
}

Death.prototype.consoleInfo = function() {
	console.log('lon :' + this.lon);
	console.log('lat :' + this.lat);
}

//**********************************************


//**********************************************
//global variables
//**********************************************
// the map object
var myMap;

var pumpIcon = L.icon({
        iconUrl: 'icons/pump.png',
        iconSize: [39,39]
});

var deathIcon = L.icon({
        iconUrl: 'icons/death.png',
        iconSize: [9,9]
});

var markerIconed;

var clickedPoint;

var nearestPumpPoint;

var linkingLine;


// the array to collect the pumps to create the turf feature collection
// the feature collection is used to symbolize the data
var allPumpsArr = [];
// the feature collection of all pumps
var allPumpsFC;
var allPumpsFCLayer = L.layerGroup();

// the array to collect the death points to create the turf feature collection
// the feature collection is used to symbolize the data
var allDeathsArr = [];
// the feature collection of all deaths
var allDeathsFC;
var allDeathsFCLayer = L.layerGroup();

var allVoroPolysLayer = L.mapbox.featureLayer();
var allVoroPolysArr = [];
var allVoroPolysFC;

var linkedVoroPolysLayer = L.mapbox.featureLayer();
var linkedVoroPolysArr = [];
var linkedVoroPolysFC;


// the layer used to display linked pump points
var linkedPumpsLayer = L.mapbox.featureLayer();
// the array to collect the pump points to create the turf feature collection
// the feature collection is used to symbolize the data
var linkedPumpsArr = [];
// the turf featurecolllection object to collect the matching death incidents points
var linkedDeathsFC;

// the layer used to display linked death incidents points
var linkedDeathsLayer = L.mapbox.featureLayer();
// the array to collect the death points to create the turf feature collection
// the feature collection is used to symbolize the data
var linkedDeathsArr = [];
// the turf featurecolllection object to collect the matching death incidents points
var linkedDeathsFC;

// the layer used to display linking lines
var linkingLinesLayer = L.mapbox.featureLayer();
// the array to collect the linking lines to create the turf feature collection
// the feature collection is used to symbolize the data
var linkingLinesArr = [];
// the turf featurecolllection object to collect the linking lines
var linkingLinesFC;

var allLinkingLinesLayer = L.mapbox.featureLayer();

var heatMapLayer;

var heatMapArr = [];

//**********************************************


//**********************************************
// initiation functions
//**********************************************

// initiate the map
function initMap() {
	
	// Prepare data first
		// This ajax call generates leaflet markers based on the point cholera death features in the GeoJSON file
	$.ajax({
		url : "input/choleraDeaths.geojson",
		type : "get",
		dataType : "json",
		cache : false,
		success : function(data) {

			$(data.features).each(function(index,val) {
					lon = val.geometry.coordinates[0];
					lat = val.geometry.coordinates[1];
					markerIconed = L.marker([lat,lon], {icon: deathIcon,zIndexOffset: -100}).on('click', deathClick);
					allDeathsArr.push(val);
					allDeathsFCLayer.addLayer(markerIconed);
					heatMapArr.push([lat,lon]);
					
				});
			
			allDeathsFC = turf.featurecollection(allDeathsArr);
			allDeathsFCLayer.addTo(myMap);
			heatMapLayer = L.heatLayer(heatMapArr, {maxZoom: 18, max: 2, gradient: {'.3': 'blue','.6': 'yellow','.95': 'red'}});
			},

		error: function(jqXHR,textStatus,errorThrown) {
			alert("Network problem or data source is missing. Please contact site admin");
		}
	});
	
	// This ajax call generates leaflet markers based on the point pump features in the GeoJSON file
	$.ajax({
		url : "input/Pumps.geojson",
		type : "get",
		dataType : "json",
		cache : false,
		success : function(data) {

			$(data.features).each(function(index,val) {
					lon = val.geometry.coordinates[0];
					lat = val.geometry.coordinates[1];
					markerIconed = L.marker([lat,lon], {icon: pumpIcon,zIndexOffset: 100,riseOnHover:true}).addTo(myMap).on('click', pumpClick);
					allPumpsArr.push(val);
					allPumpsFCLayer.addLayer(markerIconed);
				});
			
			allPumpsFC = turf.featurecollection(allPumpsArr);
			allPumpsFCLayer.addTo(myMap);
			
			},

		error: function(jqXHR,textStatus,errorThrown) {
			alert("Network problem or data source is missing. Please contact site admin");
		}
	});
	
	// This ajax call generates a turf featurecollection for the voronois polys
	$.ajax({
		url : "input/voro15.geojson",
		type : "get",
		dataType : "json",
		cache : false,
		success : function(data) {

			$(data.features).each(function(index,val) {
					allVoroPolysArr.push(val);
				});
			
			allVoroPolysFC = turf.featurecollection(allVoroPolysArr);
			allVoroPolysLayer.setGeoJSON(allVoroPolysFC).on('click', handleVoroiClick);
			
			},

		error: function(jqXHR,textStatus,errorThrown) {
			alert("Network problem or data source is missing. Please contact site admin");
		}
	});


	allLinkingLinesLayer.loadURL('input/allLinkingLines.geojson');
	
	// Define the map object with removing the zoom control.
	L.mapbox.accessToken = 'pk.eyJ1IjoiYWFidXJpemEiLCJhIjoiYlN2dzI0RSJ9.IjJvieDo3m-cPBq4zk-jKw';
	
	var southWest = L.latLng(51.39, -0.364),
    northEast = L.latLng(51.64, .0899),
    Londonbounds = L.latLngBounds(southWest, northEast);
    
    
	myMap = L.mapbox.map('mbMap', 'aaburiza.o6hb317c', { zoomControl: false, minZoom: 12, maxBounds: Londonbounds });

    
    
	// Defining the latlng object based on the center of GMU campus
	var latlng = L.latLng(51.512,-0.1345);
	// Setting the map with the latlng center and zoom level
	myMap.setView(latlng,16);
	// Adding a zoom control to the bottom right of the map.
	new L.Control.Zoom({ position: 'bottomright' }).addTo(myMap);
	
	var baseMaps = {
      Streets: L.mapbox.tileLayer('aaburiza.o6hb317c'),
      Dark: L.mapbox.tileLayer('mapbox.dark')
  	};
  	
  	/*
  	var overlayMaps = {
    	Pumps : allPumpsFCLayer,
    	"Death Incedents" : allDeathsFCLayer,
    	Voronoi : allVoroPolysLayer,
    	Spider : allLinkingLinesLayer
	};
	*/

  	baseMaps.Streets.addTo(myMap);
  	new L.control.layers(baseMaps,null,{ position: 'bottomleft' }).addTo(myMap);
  	//new L.control.layers(baseMaps,overlayMaps,{ position: 'bottomleft' }).addTo(myMap);

}

function showAllSpider() {
	
	myMap.removeLayer(allVoroPolysLayer);
	myMap.removeLayer(heatMapLayer);
	allDeathsFCLayer.addTo(myMap);
	allLinkingLinesLayer.addTo(myMap);	
}

function showVoronoi() {
	
	myMap.removeLayer(allLinkingLinesLayer);
	myMap.removeLayer(heatMapLayer);
	allDeathsFCLayer.addTo(myMap);
	allVoroPolysLayer.addTo(myMap);	
}

function showHeatMap() {
	
	myMap.removeLayer(allLinkingLinesLayer);
	myMap.removeLayer(allVoroPolysLayer);
	myMap.removeLayer(allDeathsFCLayer);
	heatMapLayer.addTo(myMap);	
}

//**********************************************
// analysis functions
//**********************************************

function deathClick(e) {
	
	clickedPnt = turf.point([e.latlng.lng, e.latlng.lat]);
	
	nearestPPnt = turf.nearest(clickedPnt, allPumpsFC);
		
	linkingLine = turf.linestring([[e.latlng.lng,e.latlng.lat], [nearestPPnt.geometry.coordinates[0],nearestPPnt.geometry.coordinates[1]]]);
	
	linkingLinesArr = [];
	
	linkingLinesArr.push(linkingLine);
	
	linkingLinesFC = turf.featurecollection(linkingLinesArr);
	
	for (lLF in linkingLinesFC.features)
	{
		linkingLinesFC.features[lLF].properties['stroke'] = '#FFFF00';
        linkingLinesFC.features[lLF].properties['stroke-width'] = 3;
        linkingLinesFC.features[lLF].properties['stroke-opacity'] = 1;
	}
	
	linkingLinesLayer.setGeoJSON(linkingLinesFC).addTo(myMap);
	
}


function pumpClick(e) {
	
	clickedPnt = turf.point([e.latlng.lng, e.latlng.lat]);
	
	linkedDeathsArr = [];
	
	linkedVoroPolysArr = [];
	
	linkingLinesArr = [];
	
	// This nested loop first finds the point clicked and then find the associated voro polygon
	for (pF in allPumpsFC.features)
	{
		if (allPumpsFC.features[pF].geometry.coordinates[0] == clickedPnt.geometry.coordinates[0] && allPumpsFC.features[pF].geometry.coordinates[1] == clickedPnt.geometry.coordinates[1])
		{
			for (vF in allVoroPolysFC.features)
			{
				if (allVoroPolysFC.features[vF].properties.id == allPumpsFC.features[pF].properties.id)
				{
					linkedVoroPolysArr.push(allVoroPolysFC.features[vF]);
				}
		
			}
		}
		
	}
	
	linkedVoroPolysFC = turf.featurecollection(linkedVoroPolysArr);
	
	linkedDeathsFC = turf.within(allDeathsFC, linkedVoroPolysFC);
	
		
	for (lDF in linkedDeathsFC.features)
	{
		
		linkingLine = turf.linestring([[linkedDeathsFC.features[lDF].geometry.coordinates[0],linkedDeathsFC.features[lDF].geometry.coordinates[1]], [clickedPnt.geometry.coordinates[0],clickedPnt.geometry.coordinates[1]]]);
		
		linkingLinesArr.push(linkingLine);
	
	}

	linkingLinesFC = turf.featurecollection(linkingLinesArr);
	
	
	for (lLF in linkingLinesFC.features)
	{
		linkingLinesFC.features[lLF].properties['stroke'] = '#FFFF00';
        linkingLinesFC.features[lLF].properties['stroke-width'] = 1;
        linkingLinesFC.features[lLF].properties['stroke-opacity'] = 0.8;
	}
	
	
	linkingLinesLayer.setGeoJSON(linkingLinesFC).addTo(myMap);
	console.log(JSON.stringify(linkingLinesFC));
	
}

function handleVoroiClick(e) {
	
	console.log(e);
	
}


//**********************************************


