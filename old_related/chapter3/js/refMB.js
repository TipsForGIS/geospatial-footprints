var myMap;
var myLocLayer, myLocLayerBuf;
var obstLayer;

function initMap() {
	
	L.mapbox.accessToken = 'pk.eyJ1IjoiYWFidXJpemEiLCJhIjoiYlN2dzI0RSJ9.IjJvieDo3m-cPBq4zk-jKw';
	//var geolocate = document.getElementById('geolocate');
	myMap = L.mapbox.map('mapbox-map', 'examples.map-i86nkdio');
	
	
	myLocLayer = L.mapbox.featureLayer().addTo(myMap);
	myLocLayerBuf = L.mapbox.featureLayer().addTo(myMap);
	
	obstLayer = L.mapbox.featureLayer();
	rndPnts = fs.readFileSync('../input/rndPnts.geojson');
	console.log("Hi");
	//obstLayer.loadURL('../input/rndPnts.geojson');
	/*
	for (var i = 0; i < obstLayer.features.length; i++) {
		obstLayer.features[i].properties['marker-color'] = '#f00';
		obstLayer.features[i].properties['marker-symbol'] = 'roadblock';
	}*/
	obstLayer.addTo(myMap);
	
	obstLayer = JSON.parse(obstLayer);
	console.log(obstLayer.features.length);
	

	
	//for(var i = 0; i < obstLayer.features.length - 1; i++) {
	  //turf.buffer(obstLayer.features[i], 15, 'meters');
	  //obstLayerBuf.setGeoJSON(turf.buffer(obstLayer, 15, 'meters'));
	//};
	
	//detectUserLocation();
	//geoLocate();

}


function detectUserLocation(){
  if (navigator.geolocation) {
    var timeoutVal = 10 * 1000 * 1000;
    navigator.geolocation.watchPosition(
      mapToPosition, 
      alertError,
      { enableHighAccuracy: true, timeout: timeoutVal, maximumAge: 0 }
    );
  }
  else {
    alert("Geolocation is not supported by this browser");
  }
  
  function alertError(error) {
    var errors = { 
      1: 'Permission denied',
      2: 'Position unavailable',
      3: 'Request timeout'
    };
    alert("Error: " + errors[error.code]);
  }
}


function mapToPosition(position) {
  lon = position.coords.longitude;
  lat = position.coords.latitude;
  myMap.setView(new L.LatLng(lat,lon), 19);

  myLocLayer.setGeoJSON({
      type: 'Feature',
      geometry: {
          type: 'Point',
          coordinates: [lon, lat]
      },
      properties: {
          'marker-color': '#000000',
          'marker-symbol': 'pitch'
      }
  });
  //myCircle = L.CircleMarker([lat,lon],{radius: 4}).addTo(myMap);
  myLocLayerBuf.setGeoJSON();
}

function geoLocate() {myLocLayer}