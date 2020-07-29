function initMap()
	{
	// initiate leaflet map
	map = new L.Map('cartodb-map', {center: [38.83078, -77.30731],zoom: 16});
	
	
	L.tileLayer('https://{s}.tiles.mapbox.com/v3/aaburiza.k9dg608e/{z}/{x}/{y}.png', 
		{
			attribution: 'Mapbox <a href="http://mapbox.com/about/maps" target="_blank">Terms &amp; Feedback</a>'
		}).addTo(map);
	
		
	var layerUrl = 'http://aaburiza.cartodb.com/api/v2/viz/6a0bbf56-71ea-11e4-8001-0e018d66dc29/viz.json';
	
	cartodb.createLayer(map,layerUrl).addTo(map);
	
	// http://caniuse.com/#feat=geolocation
	if (!navigator.geolocation) {
	    alert('Geolocation is not available');
	} else {
	        map.locate();
	}
	
	// Once we've got a position, zoom and center the map
	// on it, and add a single marker.
	map.on('locationfound', function(e) {
	    map.fitBounds(e.bounds);
	    var radius = e.accuracy / 4;
	    L.circle(e.latlng, radius).addTo(map);
	});
	
	// If the user chooses not to allow their location
	// to be shared, display an error message.
	map.on('locationerror', function() {
	    alert('Geolocation is not available');
	});
	
	}