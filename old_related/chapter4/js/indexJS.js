var myMap;
var myLocLayer, myLocPoint, myLocBufLayer, myLocBuf;
var obstsLayer, obstsWithinLayer, obstsWithinLayerArr = [];
var lat, lon;
var obstListHTML;

function initMap() {

	L.mapbox.accessToken = 'pk.eyJ1IjoiYWFidXJpemEiLCJhIjoiYlN2dzI0RSJ9.IjJvieDo3m-cPBq4zk-jKw';
	myMap = L.mapbox.map('mbMap', 'examples.map-i86nkdio');


	myLocLayer = L.mapbox.featureLayer().addTo(myMap);
	myLocBufLayer = L.mapbox.featureLayer().addTo(myMap);

	obstsLayer = L.mapbox.featureLayer();
	obstsLayer.loadURL('input/obstacles.geojson');
	obstsLayer.addTo(myMap);

	obstsWithinLayer = L.mapbox.featureLayer();



	detectUserLocation();

}

function detectUserLocation(){
  if (navigator.geolocation) {
    var timeoutVal = 10000;
    navigator.geolocation.watchPosition(
      mapToPosition,
      alertError,
      { enableHighAccuracy: true, timeout: timeoutVal, maximumAge: 1000 }
    );
  }
  else {
    alert("Your browser does not support geolocation!");
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
  myMap.setView(new L.LatLng(lat,lon), 18);

  myLocLayer.setGeoJSON({
      type: 'Feature',
      geometry: {
          type: 'Point',
          coordinates: [lon, lat]
      },
      properties: {
          'marker-color': '#FFD700',
          'marker-symbol': 'pitch'
      }
  });

  myLocPoint = turf.point([lon, lat]);

  myLocBuf = turf.buffer(myLocPoint, 100, 'feet');
  myLocBuf.features[0].properties['fill'] = '#FFFF00';
  myLocBuf.features[0].properties['fill-opacity'] = 0.2;
  myLocBuf.features[0].properties['stroke'] = '#FFFF00';
  myLocBuf.features[0].properties['stroke-width'] = 2;
  myLocBufLayer.setGeoJSON(myLocBuf);

  searchNearby();

}

function toggleInfoMess() {
	$(".obstacleListDiv").slideToggle("slow");

	if ($(".toggleBut").text() == "Hide obstacles")
	{$(".toggleBut").text("Show obstacles");}
	else
	{$(".toggleBut").text("Hide obstacles");}
}

function searchNearby() {

	obstsWithinLayerArr = [];
	obstListHTML = "";

	$.ajax({
		url : "input/obstacles.geojson",
		type : "get",
		dataType : "json",
		cache : false,
		success : function(data) {
			$(data.features).each(function(index,val) {

				if (turf.inside(val, myLocBuf.features[0])) {
					val.properties['marker-color'] = '#FF0000';
					obstsWithinLayerArr.push(val);
					obstListHTML = obstListHTML + "<li>ID : " + val.properties.id + " -> " + val.properties.description.substr(0, 15) +
					 "... <a href='#' class='btn btn-xs btn-link' data-toggle='modal' data-target='.explainFeatFoundModal'>more</a></li><br />";


				}
				else {
					val.properties['marker-color'] = '#000000';
					obstsWithinLayerArr.push(val);
				}
			});

			$('.obstacleUl').html(obstListHTML);

			obstsWithinLayer.setGeoJSON(obstsWithinLayerArr).addTo(myMap);
		},

		error: function(jqXHR,textStatus,errorThrown) {
			alert("Data source is missing or corrupted. Please contact site admin");
		}
	});

}