var myMap;
var myLocLayer, myLocLayerBuf;
var obstLayer, obstLayerBuf;
var obstLayerBBox, obstLayerGrid, extPs, extBbox;
var gj;
var fc;
var feature_layer;

function initMap() {
	
	L.mapbox.accessToken = 'pk.eyJ1IjoiYWFidXJpemEiLCJhIjoiYlN2dzI0RSJ9.IjJvieDo3m-cPBq4zk-jKw';
	myMap = L.mapbox.map('mapbox-map', 'examples.map-i86nkdio');
	var latlng = L.latLng(35.463453, -97.508014);
	myMap.setView(latlng,14);
	
	
	var features = [
	    turf.polygon([
	        [
	            [-97.5, 35.460], [-97.5, 35.468], [-97.51, 35.468], [-97.51, 35.460]
	        ]
	    ], {
	        "fill": "#6BC65F",
	        "stroke": "#6BC65F",
	        "stroke-width": 5
	    }),
	    turf.polygon([
	        [
	            [-97.51, 35.460], [-97.51, 35.468], [-97.52, 35.468], [-97.52, 35.460]
	        ]
	    ], {
	        "fill": "#6BC65F",
	        "stroke": "#6BC65F",
	        "stroke-width": 5
	    }),
	    turf.point([-97.502754, 35.463455], {
	        "marker-color": "#6BC65F"
	    }),
	    turf.point([-97.508269, 35.463245], {
	        "marker-color": "#6BC65F"
	    }),
	    turf.point([-97.516809, 35.465779], {
	        "marker-color": "#6BC65F"
	    }),
	    turf.point([-97.515372, 35.467072], {
	        "marker-color": "#6BC65F"
	    }),
	    turf.point([-97.509363, 35.463053], {
	        "marker-color": "#6BC65F"
	    }),
	    turf.point([-97.511123, 35.466601], {
	        "marker-color": "#6BC65F"
	    }),
	    turf.point([-97.522259, 35.469100], {
	        "marker-color": "#6BC65F"
	    }),
	    turf.point([-97.518547, 35.469327], {
	        "marker-color": "#6BC65F"
	    }),
	    turf.point([-97.519706, 35.469659], {
	        "marker-color": "#6BC65F"
	    }),
	    turf.point([-97.517839, 35.466998], {
	        "marker-color": "#6BC65F"
	    }),
	    turf.point([-97.508678, 35.464942], {
	        "marker-color": "#6BC65F"
	    }),
	    turf.point([-97.514914, 35.463453], {
	        "marker-color": "#6BC65F"
	    })
	];
	
	fc = turf.featurecollection(features);
	feature_layer = L.mapbox.featureLayer().setGeoJSON(fc).addTo(myMap);
	
}

function callTurfSample() {
    var sample = turf.sample(fc, 5);
    feature_layer.setGeoJSON(sample);
}