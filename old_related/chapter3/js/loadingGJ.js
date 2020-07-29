var myMap;
var myLocLayer, myLocLayerBuf;
var obstLayer, obstLayerBuf;
var obstLayerBBox, obstLayerGrid, extPs, extBbox;
var gj;

function initMap() {
	
	L.mapbox.accessToken = 'pk.eyJ1IjoiYWFidXJpemEiLCJhIjoiYlN2dzI0RSJ9.IjJvieDo3m-cPBq4zk-jKw';
	myMap = L.mapbox.map('mapbox-map', 'examples.map-i86nkdio');
	var latlng = L.latLng(38.8294527777778,-77.3061638888889);
	myMap.setView(latlng,16);

	obstLayer = L.mapbox.featureLayer();
	obstLayer.loadURL('../../input/campusData.geojson');
	obstLayer.addTo(myMap);

	//obstLayerGrid = L.mapbox.featureLayer();
	//obstLayerGrid.loadURL('../../output/squareGrid.geojson');
	//obstLayerGrid.addTo(myMap);

}