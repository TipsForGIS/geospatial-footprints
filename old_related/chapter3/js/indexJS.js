//**********************************************
// Place class definition
function Place(id,name,myGJ) {
	this.id = id;
	this.name = name;
	this.myGJ = myGJ;
}

Place.prototype.consoleInfo = function() {

	console.log(this.name);

}
//**********************************************


//**********************************************
//global variables
//**********************************************
// the map object
var myMap;

// the JSON variable holding prepositions as keys and the distances as their values.
var prepositionsJSON = {
	"pList":
		[
	    	{"pName":"near", "bufVal":125},
	    	{"pName":"close to", "bufVal":125},
			{"pName":"next to", "bufVal":50},
			{"pName":"beside", "bufVal":50},
			{"pName":"outside", "bufVal":50},
			{"pName":"along", "bufVal":30}
		]
    };
    
// the JSON variable holding bearing as keys and their values.
var bearingsJSON = {
	"bList":
		[
	    	/*{"bName":"north", "min":-22.5, "max":22.5},
	    	{"bName":"northeast", "min":22.5, "max":67.5},
	    	{"bName":"east", "min":67.5, "max":112.5},
	    	{"bName":"southeast", "min":112.5, "max":157.5},
	    	{"bName":"south", "min":157.5, "max":-157.5},
	    	{"bName":"southwest", "min":-157.5, "max":-112.5},
	    	{"bName":"west", "min":-112.5, "max":-67.5},
	    	{"bName":"northwest", "min":-67.5, "max":-22.5}*/
	    	{"dirct":"northeast", "dirct2":"north east", "angle":45},
	    	{"dirct":"southeast", "dirct2":"south east", "angle":135},
	    	{"dirct":"southwest", "dirct2":"south west", "angle":-135},
	    	{"dirct":"northwest", "dirct2":"north west", "angle":-45},
	    	{"dirct":"north", "dirct2":"north", "angle":0},
	    	{"dirct":"east", "dirct2":"east", "angle":90},
	    	{"dirct":"south", "dirct2":"south", "angle":180},
	    	{"dirct":"west", "dirct2":"west", "angle":-90}
		]
    };

// two boolean variables to test weather the message has a bearing word or a preposition
var hasBearing = -1;
var hasPreposition = -1;

// two variables to assign found bearing or preposition
var foundedBearing = "";
var bearingAngle = -1;
var foundedPreposition = "";

// the message string
var message;
// the message array
var messageArr = [];
// the explanation message JQuery object
var explanationM = "";

// the layer used to display the places found in the message
var foundedPlaceGJLayer = L.mapbox.featureLayer();
// the turf featurecolllection object to collect the places found
var foundedPlaceFC;

// the turf featurecolllection object to collect the exploded points of the polygons found
var explodedPointsFC;

// the layer used to display the convexhull
var convexhullGJLayer = L.mapbox.featureLayer();
// the turf featurecolllection object to collect the convexhull
var convexhullFC;

// the layer used to display the buffer genrated
var bufferGJLayer = L.mapbox.featureLayer();
// for future use --> the layer used to display the 3 buffer
var bufferGJLayer1 = L.mapbox.featureLayer();
var bufferGJLayer2 = L.mapbox.featureLayer();
var bufferGJLayer3 = L.mapbox.featureLayer();
// the turf featurecolllection object to collect the buffer
var bufferFC;

// the variable used to set the buffer distance based on different criteria
var bufDist = 0;

// the array used to check if the geojson place value ID already exists
// this insures avoiding duplications.
var foundedPlaceValsIDsArr = [];

// the array used to collect place objects, their ids, and their names found
// in the original GeoJSON file based on the message.
var foundedPlaceObjsArr = [];

// the array is used to collect the GeoJSON objects seperatly to pass it as a
// parameter to turf.featurecollection which only accepts an array of pure GeoJSON objs
var foundedPlaceGJsArr = [];

// the array used to collect the GeoJSON objects of the walkways intersecting
var foundedWalkwaysGJsArr = [];

// these variables are used to create turf intersection object(s)
var intersection, intersection2;

// these variables are used to pan and set the zoom around the final buffer or the footprint
var bufCentroidPt, latlngBufCentriodPt;

// this variable is used to create the turf linestring object between two intersections
var slicedLineString;

// 
var enveloped;
var pt1, pt2, pt3;
var distance1, distance2, halfDiagonal;
var centroidPt, centroidPt2;
var lineStringBetweenCentriods;
var bearingDistination;
//**********************************************


//**********************************************
// initiation functions
//**********************************************

// initiate the map
function initMap() {

	// Define the map object with removing the zoom control.
	L.mapbox.accessToken = 'pk.eyJ1IjoiYWFidXJpemEiLCJhIjoiYlN2dzI0RSJ9.IjJvieDo3m-cPBq4zk-jKw';
	myMap = L.mapbox.map('mbMap', 'aaburiza.k9dg608e', { zoomControl: false });
	// Defining the latlng object based on the center of GMU campus
	var latlng = L.latLng(38.8294527777778,-77.3061638888889);
	// Setting the map with the latlng center and zoom level
	myMap.setView(latlng,16);
	// Adding a zoom control to the bottom right of the map.
	new L.Control.Zoom({ position: 'bottomright' }).addTo(myMap);

	var layers = {
      Streets: L.mapbox.tileLayer('aaburiza.k9dg608e'),
      Satellite: L.mapbox.tileLayer('mapbox.streets-satellite')
  	};

  	layers.Streets.addTo(myMap);
  	new L.control.layers(layers,null,{ position: 'bottomleft' }).addTo(myMap);

}

// verify if message is empty or not
function verifyMessage() {

	if ( $.trim($('#messageText').val()) == '' )
		{
			$('.noTextModal').modal('show');
		}
		else
		{
			// Show the geoparsing modal
			$('.geoparseModal').modal('show');
			
			// clean up the message
			message = $.trim($('#messageText').val());
			message = message.toLowerCase();
			message = message.replace(/\s+/g, ' ');
			messageArr = message.split(' ');
			
			// reset values for new entrys
			explanationM = "";
			foundedPlaceObjsArr = [];
			foundedPlaceValsIDsArr = [];
			foundedPlaceGJsArr = [];
			bufDist = -1;
			hasPreposition = -1;
			hasBearing = -1;
			bearingAngle = -1;
			
			// check if message has preposition
			for (var key in prepositionsJSON.pList) {
				
				if (message.indexOf(prepositionsJSON.pList[key].pName) != -1) {
					hasPreposition = 1;
					foundedPreposition = prepositionsJSON.pList[key].pName;
					bufDist = prepositionsJSON.pList[key].bufVal;
					break;
				}
			}
			
			if (bufDist == -1)
			{
				bufDist = 75;
			}
			
			// check if the message has bearing mentioned
			for (var key in bearingsJSON.bList) {
				
				if (message.indexOf(bearingsJSON.bList[key].dirct) != -1 || message.indexOf(bearingsJSON.bList[key].dirct) != -1) {
					hasBearing = 1;
					foundedBearing = bearingsJSON.bList[key].dirct;
					bearingAngle = bearingsJSON.bList[key].angle;
					break;
				}
			}
			

			geoParseMessage();
		}
}

// geoparse the message
function geoParseMessage() {

	$.ajax({
		url : "input/namedCampusData.geojson",
		type : "get",
		dataType : "json",
		cache : false,
		success : function(data) {

			$(data.features).each(function(index,val) {

				// add found placenames as objects to foundedPlaceObjsArr
				for (var i in val.properties.names) {
					if (message.toLowerCase().search(val.properties.names[i].toLowerCase()) != -1) {
						if ($.inArray(val.properties.id,foundedPlaceValsIDsArr) == -1) {
							  		foundedPlaceValsIDsArr.push(val.properties.id);
							  		fObj = new Place(val.properties.id, val.properties.names[i].toLowerCase(), val);
								  	foundedPlaceObjsArr.push(fObj);
								  	foundedPlaceGJsArr.push(val);
						}
					}
				}
				});

				// if placenames are found, call switchCaseFunc function
				if (foundedPlaceObjsArr != 0) {
					switchCaseFunc();
				}
				// else alert user that no placenames were found and remove previously found data from previous messages
				else {
					$('.noPlaceFoundModal').modal('show');

					$('.noPlaceFoundModal').on('hide.bs.modal', function (e) {
						if (myMap.hasLayer(convexhullGJLayer)) {
							myMap.removeLayer(convexhullGJLayer);
							}
						if (myMap.hasLayer(foundedPlaceGJLayer)) {
							myMap.removeLayer(foundedPlaceGJLayer);
							}
						if (myMap.hasLayer(bufferGJLayer)) {
							myMap.removeLayer(bufferGJLayer);
						}
					});
				}
			},

		error: function(jqXHR,textStatus,errorThrown) {
			alert("Network problem or data source is missing. Please contact site admin");
		}
	});

}

// switch case based on found placenames
function switchCaseFunc() {

	// Only one place in message
	if (foundedPlaceObjsArr.length == 1)
	{
		switch (foundedPlaceObjsArr[0].myGJ.geometry.type)
		{
			case 'Polygon':
				
				if (hasBearing == 1 && hasPreposition == -1) {
					onePolygonBearing();
				}
				else if (hasPreposition == 1 && hasBearing == -1) {
					onePolygonPreposition();
				}
				else if (hasPreposition == 1 && hasBearing == 1) {
					onePolygonBearingAndPreposition();
				}
				else {
					onePolygon();
				}
				
				break;
				
			case 'MultiLineString':
			
				oneLine();
				
				break;
				
			case 'Point':
			
				if (hasBearing == 1 && hasPreposition == -1) {
					onePointBearing();
				}
				else if (hasPreposition == 1 && hasBearing == -1) {
					onePointPreposition();
				}
				else if (hasPreposition == 1 && hasBearing == 1) {
					onePointBearingAndPreposition();
				}
				else {
					onePoint();
				}
				
				break;
		}
	}

	else if(foundedPlaceObjsArr.length == 2)
	{
		if (foundedPlaceObjsArr[0].myGJ.geometry.type == 'Polygon' && foundedPlaceObjsArr[1].myGJ.geometry.type == 'Polygon')
		{
			if (message.toLowerCase().search('walkway') != -1) {
				
				walkwaysTwoPolygons();
			}
			else {
				twoPolygons();
			}
		}
		if (foundedPlaceObjsArr[0].myGJ.geometry.type == 'MultiLineString' && foundedPlaceObjsArr[1].myGJ.geometry.type == 'MultiLineString')
		{
			twoLines();
		}
		if ((foundedPlaceObjsArr[0].myGJ.geometry.type == 'Polygon' && foundedPlaceObjsArr[1].myGJ.geometry.type == 'MultiLineString') || (foundedPlaceObjsArr[0].myGJ.geometry.type == 'MultiLineString' && foundedPlaceObjsArr[1].myGJ.geometry.type == 'Polygon')) {
    	    polygonAndLine();
		}
		if ((foundedPlaceObjsArr[0].myGJ.geometry.type == 'Polygon' && foundedPlaceObjsArr[1].myGJ.geometry.type == 'Point') || (foundedPlaceObjsArr[0].myGJ.geometry.type == 'Point' && foundedPlaceObjsArr[1].myGJ.geometry.type == 'Polygon')) {
    	    polygonAndPoint();
		}
		
	}
	else if(foundedPlaceObjsArr.length == 3)
	{
		if (foundedPlaceObjsArr[0].myGJ.geometry.type == 'MultiLineString' && foundedPlaceObjsArr[1].myGJ.geometry.type == 'MultiLineString' && foundedPlaceObjsArr[0].myGJ.geometry.type == 'MultiLineString')
		{
    		oneLineBetweenTwoLines();
		}
	}
}
//**********************************************


//**********************************************
// cases
//**********************************************

//***** One place *****
// Case 1-1: one polygon without preposition nor bearing ** simple 1
function onePolygon() {
	
	
	explanationM = explanationM + '<p>Found one ' + foundedPlaceObjsArr[0].myGJ.properties.placeType + ' ( <span class="orangeSpan">';
	explanationM = explanationM + foundedPlaceObjsArr[0].name + '</span> ).</p>';
	explanationM = explanationM + '<p>You did not use a prepostion.</p>';
	explanationM = explanationM + "<p>Thus <span class='orangeSpan'>" + foundedPlaceObjsArr[0].name + "</span>";
	explanationM = explanationM + " is buffered by <span class='orangeSpan'>" + bufDist + '</span> ft.</p>';

	// add the founded places layer
	addFoundPlaces(foundedPlaceGJsArr);

	// explode, convex, buffer
	bufferOnly(foundedPlaceFC);
	//explodeConvexBuf(foundedPlaceFC);

	// add polygons buf layer
	addPinkBuf();

	// center to buffer centroid
	centerToBufCentriod(18);

	// set explaination message to modal and show it
	setExplnModalAndShow();
	
}
// Case 1-2: one point without preposition nor bearing ** simple 1
function onePoint() {

	explanationM = explanationM + '<p>Found one ' + foundedPlaceObjsArr[0].myGJ.properties.placeType + ' ( <span class="orangeSpan">';
	explanationM = explanationM + foundedPlaceObjsArr[0].name + '</span> ).</p>';
	explanationM = explanationM + '<p>You did not use a prepostion.</p>';
	explanationM = explanationM + "<p>Thus <span class='orangeSpan'>" + foundedPlaceObjsArr[0].name + "</span>";
	explanationM = explanationM + " is buffered by <span class='orangeSpan'>" + bufDist + '</span> ft.</p>';

	addFoundPlaces(foundedPlaceGJsArr);

	bufferOnly(foundedPlaceFC);

	addYellowBuf();

	centerToBufCentriod(20);

	setExplnModalAndShow();

}
//**********************************************
// Case 2-1: one polygon with preposition ** ambiguous 1
function onePolygonPreposition() {
		
	explanationM = explanationM + '<p>Found one ' + foundedPlaceObjsArr[0].myGJ.properties.placeType + ' ( <span class="orangeSpan">';
	explanationM = explanationM + foundedPlaceObjsArr[0].name + '</span> ).</p>';
	explanationM = explanationM + '<p>Found prepostion ( <span class="orangeSpan">';
	explanationM = explanationM + foundedPreposition + '</span> ).</p>';
	explanationM = explanationM + "<p>Thus <span class='orangeSpan'>" + foundedPlaceObjsArr[0].name;
	explanationM = explanationM + "</span> is buffered by <span class='orangeSpan'> ";
	explanationM = explanationM + bufDist + "</span> ft.</p>";

	// add the founded places layer
	addFoundPlaces(foundedPlaceGJsArr);

	// buffer
	bufferOnly(foundedPlaceFC);

	// add polygons buf layer
	addPinkBuf();

	// center to buffer centroid
	centerToBufCentriod(18);

	// set explaination message to modal and show it
	setExplnModalAndShow();

}
// Case 2-2: one point with preposition ** ambiguous 1
function onePointPreposition() {

	explanationM = explanationM + '<p>Found one ' + foundedPlaceObjsArr[0].myGJ.properties.placeType + ' ( <span class="orangeSpan">';
	explanationM = explanationM + foundedPlaceObjsArr[0].name + '</span> ).</p>';
	explanationM = explanationM + '<p>Found prepostion ( <span class="orangeSpan">';
	explanationM = explanationM + foundedPreposition + '</span> ).</p>';
	explanationM = explanationM + "<p>Thus <span class='orangeSpan'>" + foundedPlaceObjsArr[0].name;
	explanationM = explanationM + "</span>'s convexhull</p><p>was buffered by <span class='orangeSpan'>";
	explanationM = explanationM + bufDist + "</span> feet.</p>";

	addFoundPlaces(foundedPlaceGJsArr);

	bufferOnly(foundedPlaceFC);

	addYellowBuf();

	centerToBufCentriod(20);

	setExplnModalAndShow();

}
//**********************************************
// Case 3-1: one polygon with bearing ** complex 2
function onePolygonBearing() {
		
	explanationM = explanationM + '<p>Found one ' + foundedPlaceObjsArr[0].myGJ.properties.placeType + ' ( <span class="orangeSpan">';
	explanationM = explanationM + foundedPlaceObjsArr[0].name + '</span> ).</p>';
	explanationM = explanationM + '<p>Found a directional word ( <span class="orangeSpan">';
	explanationM = explanationM + foundedBearing + '</span> ).</p>';
	explanationM = explanationM + "<p>Accordingly, the footprint was generated</p>";
	
	// add the founded places layer
	addFoundPlaces(foundedPlaceGJsArr);
	
	// envelope, shift toward bearing, and buffer
	envelopeShiftBearingBufErasePolygon(foundedPlaceFC);
	
	// add polygons buf layer
	addPinkBuf();
	
	// center to buffer centroid
	centerToBufCentriod(18);

	// set explaination message to modal and show it
	setExplnModalAndShow();
	
}
// Case 3-2: one point with bearing ** complex 2
function onePointBearing() {
	
	explanationM = explanationM + '<p>Found one ' + foundedPlaceObjsArr[0].myGJ.properties.placeType + ' ( <span class="orangeSpan">';
	explanationM = explanationM + foundedPlaceObjsArr[0].name + '</span> ).</p>';
	explanationM = explanationM + '<p>Found a directional word ( <span class="orangeSpan">';
	explanationM = explanationM + foundedBearing + '</span> ).</p>';
	explanationM = explanationM + "<p>Accordingly, the footprint was generated</p>";
	
	// add the founded places layer
	addFoundPlaces(foundedPlaceGJsArr);

	// envelope, shift toward bearing, and buffer
	envelopeShiftBearingBufPoint(foundedPlaceFC);
	
	// add polygons buf layer
	addPinkBuf();
	
	// center to buffer centroid
	centerToBufCentriod(18);

	// set explaination message to modal and show it
	setExplnModalAndShow();
	
}
//**********************************************
// Case 4-1: one polygon with bearing and preposition -> not implemented
function onePolygonBearingAndPreposition() {
	
	explanationM = explanationM + '<p>Found one ' + foundedPlaceObjsArr[0].myGJ.properties.placeType + ' ( <span class="orangeSpan">';
	explanationM = explanationM + foundedPlaceObjsArr[0].name + '</span> ).</p>';
	explanationM = explanationM + '<p>Also found a preposition: ( <span class="orangeSpan">' + foundedPreposition + '</span> )</p>';
	explanationM = explanationM + '<p>and a directional word: ( <span class="orangeSpan">' + foundedBearing + '</span> )</p>';
	explanationM = explanationM + '<p>Generating such a footprint with both direction and preposiotion ';
	explanationM = explanationM + 'is not implemented yet.</p>';

	setErrorModalAndShow();
	
} 
// Case 4-2: one point with bearing and preposition -> not implemented
function onePointBearingAndPreposition() {
	
	explanationM = explanationM + '<p>Found one ' + foundedPlaceObjsArr[0].myGJ.properties.placeType + ' ( <span class="orangeSpan">';
	explanationM = explanationM + foundedPlaceObjsArr[0].name + '</span> ).</p>';
	explanationM = explanationM + '<p>Also found a preposition: ( <span class="orangeSpan">' + foundedPreposition + '</span> )</p>';
	explanationM = explanationM + '<p>and a directional word: ( <span class="orangeSpan">' + foundedBearing + '</span> )</p>';
	explanationM = explanationM + '<p>Generating such a footprint with both direction and preposiotion ';
	explanationM = explanationM + 'is not implemented yet.</p>';

	setErrorModalAndShow();
	
}
//**********************************************
// Case 5: one entire road -> not implemented ** ambiguous 2
function oneLine() {

	explanationM = explanationM + '<p>Found one ' + foundedPlaceObjsArr[0].myGJ.properties.placeType + ' ( <span class="orangeSpan">';
	explanationM = explanationM + foundedPlaceObjsArr[0].name + '</span> ).</p>';
	explanationM = explanationM + '<p>Generating a footpring on an entire road is not applicable.</p>';
	explanationM = explanationM + '<p>You need to mention another place name to clarify position.</p>';

	setErrorModalAndShow();

}
//**********************************************
//***** two places *****
//**********************************************
// Case 6-1: two polygons ** complex 1
function twoPolygons() {

	explanationM = explanationM + '<p>Found a ' + foundedPlaceObjsArr[0].myGJ.properties.placeType + ' : <span class="orangeSpan">' + foundedPlaceObjsArr[0].name + '</span></p>';
	explanationM = explanationM + '<p>and a ' + foundedPlaceObjsArr[1].myGJ.properties.placeType + ' : <span class="orangeSpan">' + foundedPlaceObjsArr[1].name + '</span></p>';
	explanationM = explanationM + '<p>A buffered convexhull was generated and</p>'; 
	explanationM = explanationM + '<p>clipped to cover only the area inbetween.</p>';

	addFoundPlaces(foundedPlaceGJsArr);
	
	bufDist = -5;
	
	explodeConvexBuf(foundedPlaceFC);
	
	bufErased1 = turf.erase(bufferFC.features[0],foundedPlaceFC.features[0]);
	bufErased2 = turf.erase(bufErased1,foundedPlaceFC.features[1]);
	//bufferFC.features[0] = bufErased2;

	centroidPt = turf.centroid(foundedPlaceGJsArr[0]);
	centroidPt2 = turf.centroid(foundedPlaceGJsArr[1]);
	lineStringBetweenCentriods = turf.linestring([centroidPt.geometry.coordinates,centroidPt2.geometry.coordinates]);
	
	for (p in bufErased2.geometry.coordinates)
	{
		poly = turf.polygon(bufErased2.geometry.coordinates[p]);

		console.log(lineStringBetweenCentriods);
		intersection = turf.intersect(poly,lineStringBetweenCentriods);
		if (typeof intersection != 'undefined')
		{
			bufferFC.features[0] = poly;
		}
		
	}

	addPinkBuf();

	centerToBufCentriod(17);

	setExplnModalAndShow();
}
// Case 6-2: polygon and a point ** complex 1
function polygonAndPoint() {
		
	explanationM = explanationM + '<p>Found a ' + foundedPlaceObjsArr[0].myGJ.properties.placeType + ' : <span class="orangeSpan">' + foundedPlaceObjsArr[0].name + '</span></p>';
	explanationM = explanationM + '<p>and a ' + foundedPlaceObjsArr[1].myGJ.properties.placeType + ' : <span class="orangeSpan">' + foundedPlaceObjsArr[1].name + '</span></p>';
	explanationM = explanationM + '<p>A buffered convexhull was generated and</p>'; 
	explanationM = explanationM + '<p>clipped to cover only the area inbetween.</p>';

	addFoundPlaces(foundedPlaceGJsArr);
	
	bufDist = -5;
	
	explodeConvexBuf(foundedPlaceFC);
	if (foundedPlaceFC.features[0].geometry.type == 'Polygon') {
		bufErased1 = turf.erase(bufferFC.features[0],foundedPlaceFC.features[0]);
		
		centroidPt = turf.centroid(foundedPlaceGJsArr[0]);
		centroidPt2 = turf.point([foundedPlaceGJsArr[1].geometry.coordinates[0], foundedPlaceGJsArr[1].geometry.coordinates[1]]);
	}
	else {
		bufErased1 = turf.erase(bufferFC.features[0],foundedPlaceFC.features[1]);
		
		centroidPt = turf.point([foundedPlaceGJsArr[0].geometry.coordinates[0], foundedPlaceGJsArr[0].geometry.coordinates[1]]);
		centroidPt2 = turf.centroid(foundedPlaceGJsArr[1]);
	}

	lineStringBetweenCentriods = turf.linestring([centroidPt.geometry.coordinates,centroidPt2.geometry.coordinates]);
	console.log(lineStringBetweenCentriods);
	
	for (p in bufErased1.geometry.coordinates)
	{
		poly = turf.polygon(bufErased1.geometry.coordinates[p]);

		intersection = turf.intersect(poly,lineStringBetweenCentriods);
		if (typeof intersection != 'undefined')
		{
			bufferFC.features[0] = poly;
		}
		
	}
	
	addPinkBuf();

	centerToBufCentriod(17);

	setExplnModalAndShow();
	
}
//**********************************************
// Case 7: line along a polygon ** complex 3
function polygonAndLine() {

    var polyCentriod;
    var nearestObj, nearestInd;
    var line1,line2,line3,line4,line5,line6;
    var newArr = [];
    var thePolygonPlace;
    var theLinerPlace;

    for (var f in foundedPlaceObjsArr) {
        if (foundedPlaceObjsArr[f].myGJ.geometry.type == 'MultiLineString') {
            explodedPointsFC = turf.explode(foundedPlaceObjsArr[f].myGJ);
        }
        else if (foundedPlaceObjsArr[f].myGJ.geometry.type == 'Polygon') {
            polyCentriod = turf.centroid(foundedPlaceObjsArr[f].myGJ);
            newArr.push(foundedPlaceObjsArr[f].myGJ);
            thePolygonPlace = foundedPlaceObjsArr[f].myGJ;
        }
    }

    nearest = turf.nearest(polyCentriod, explodedPointsFC);

    for (var f in explodedPointsFC.features) {

        if (explodedPointsFC.features[f] === nearest)
        {
            nearestInd = parseInt(f);
        }
    }


    line1 = turf.linestring([[explodedPointsFC.features[nearestInd-1].geometry.coordinates[0],explodedPointsFC.features[nearestInd-1].geometry.coordinates[1]],[explodedPointsFC.features[nearestInd].geometry.coordinates[0],explodedPointsFC.features[nearestInd].geometry.coordinates[1]]]);
    
    line2 = turf.linestring([[explodedPointsFC.features[nearestInd].geometry.coordinates[0],explodedPointsFC.features[nearestInd].geometry.coordinates[1]],[explodedPointsFC.features[nearestInd+1].geometry.coordinates[0],explodedPointsFC.features[nearestInd+1].geometry.coordinates[1]]]);
    
    line3 = turf.linestring([[explodedPointsFC.features[nearestInd-1].geometry.coordinates[0],explodedPointsFC.features[nearestInd-1].geometry.coordinates[1]],[explodedPointsFC.features[nearestInd-2].geometry.coordinates[0],explodedPointsFC.features[nearestInd-2].geometry.coordinates[1]]]);
    
    line4 = turf.linestring([[explodedPointsFC.features[nearestInd+1].geometry.coordinates[0],explodedPointsFC.features[nearestInd+1].geometry.coordinates[1]],[explodedPointsFC.features[nearestInd+2].geometry.coordinates[0],explodedPointsFC.features[nearestInd+2].geometry.coordinates[1]]]);
    


    newArr.push(line1);
    newArr.push(line2);
    newArr.push(line3);
    newArr.push(line4);
    addFoundPlaces(newArr);
        
    bufDist = -1;
    explodeConvexBuf(foundedPlaceFC);    
    
    bufErased1 = turf.erase(bufferFC.features[0],thePolygonPlace);
	centroidPt = turf.centroid(thePolygonPlace);
	
   
	lineStringBetweenCentriods = turf.linestring([centroidPt.geometry.coordinates,nearest.geometry.coordinates]);
	
	
	for (p in bufErased1.geometry.coordinates)
	{
		poly = turf.polygon(bufErased1.geometry.coordinates[p]);

		console.log(lineStringBetweenCentriods);
		intersection = turf.intersect(poly,lineStringBetweenCentriods);
		if (typeof intersection != 'undefined')
		{
			bufferFC.features[0] = poly;
		}
		
	}
	
    addPinkBuf();
    centerToBufCentriod(18);

    explanationM = explanationM + '<p>Found a ' + foundedPlaceObjsArr[0].myGJ.properties.placeType + ' : <span class="orangeSpan">' + foundedPlaceObjsArr[0].name + '</span></p>';
    explanationM = explanationM + '<p>and a ' + foundedPlaceObjsArr[1].myGJ.properties.placeType + ' : <span class="orangeSpan">' + foundedPlaceObjsArr[1].name + '</span></p>';
    explanationM = explanationM + "<p>A buffered convexhull of the polygon and its closest sliced linestrings.</p>";

    setExplnModalAndShow();

}
//**********************************************
// Case 8: intersection of two roads ** simple 2
function twoLines() {

	intersection = turf.intersect(foundedPlaceGJsArr[0], foundedPlaceGJsArr[1]);

	var prep = '';

	if (message.toLowerCase().search("intersection") != -1) {
		prep = 'intersection';
	}

	if (message.toLowerCase().search("corner of") != -1) {
		prep = 'corner of';
	}

	if (typeof intersection == 'undefined')
	{
		explanationM = explanationM + '<p>Found a ' + foundedPlaceObjsArr[0].myGJ.properties.placeType + ' : <span class="orangeSpan">' + foundedPlaceObjsArr[0].name + '</span></p>';
	explanationM = explanationM + '<p>and a ' + foundedPlaceObjsArr[1].myGJ.properties.placeType + ' : <span class="orangeSpan">' + foundedPlaceObjsArr[1].name + '</span></p>';
	if (prep == 'intersection' || prep == 'corner of') {
		explanationM = explanationM + '<p>and found the term<span class="orangeSpan"> ' + prep + '</span></p>';
	}
	else {
		explanationM = explanationM + '<p>The message indicates that you are on the intersection.</p>';
	}
	explanationM = explanationM + "<p>But the two roads do NOT intersect.</p>";
	setErrorModalAndShow();
	}
	else
	{
		if (intersection.geometry.type == 'Point')
		{
			explanationM = explanationM + '<p>Found a ' + foundedPlaceObjsArr[0].myGJ.properties.placeType + ' : <span class="orangeSpan">' + foundedPlaceObjsArr[0].name + '</span></p>';
			explanationM = explanationM + '<p>and a ' + foundedPlaceObjsArr[1].myGJ.properties.placeType + ' : <span class="orangeSpan">' + foundedPlaceObjsArr[1].name + '</span></p>';
				if (prep == 'intersection' || prep == 'corner of') {
					explanationM = explanationM + '<p>and found the term<span class="orangeSpan"> ' + prep + '</span></p>';
				}
				else {
					explanationM = explanationM + '<p>The message indicates that you are on the intersection.</p>';
				}
			explanationM = explanationM + "<p>The intersection been bufferd as the footprint.</p>";

			intersection.properties['marker-color'] = '#FF4500';

			foundedPlaceGJsArr.push(intersection);

			addFoundPlaces(foundedPlaceGJsArr);

			bufferFC = turf.buffer(intersection, 50, "feet");

			addPinkBuf();

			centerToBufCentriod(20);

			setExplnModalAndShow();
		}

		if (intersection.geometry.type == 'MultiPoint')
		{
			explanationM = explanationM + '<p>Found a ' + foundedPlaceObjsArr[0].myGJ.properties.placeType + ' : <span class="orangeSpan">' + foundedPlaceObjsArr[0].name + '</span></p>';
			explanationM = explanationM + '<p>and a ' + foundedPlaceObjsArr[1].myGJ.properties.placeType + ' : <span class="orangeSpan">' + foundedPlaceObjsArr[1].name + '</span></p>';
			if (prep == 'intersection' || prep == 'corner of') {
					explanationM = explanationM + '<p>and found the term<span class="orangeSpan"> ' + prep + '</span></p>';
			}
			else {
					explanationM = explanationM + '<p>The message indicates that you are on the intersection.</p>';
			}
			explanationM = explanationM + "<p>There are more than one intersection found and bufferd as the footprint.</p>";

			intersection.properties['marker-color'] = '#FF4500';

			foundedPlaceGJsArr.push(intersection);

			addFoundPlaces(foundedPlaceGJsArr);

			bufferFC = turf.buffer(intersection, 50, "feet");

			addPinkBuf();

			centerToBufCentriod(17);

			setExplnModalAndShow();
		}
	}

}
//**********************************************
//***** three places *****
//**********************************************
// Case 9: walkways between two polygons ** complex 4
function walkwaysTwoPolygons() {
	
	explanationM = explanationM + '<p>Found a ' + foundedPlaceObjsArr[0].myGJ.properties.placeType + ' : <span class="orangeSpan">' + foundedPlaceObjsArr[0].name + '</span></p>';
	explanationM = explanationM + '<p>and a ' + foundedPlaceObjsArr[1].myGJ.properties.placeType + ' : <span class="orangeSpan">' + foundedPlaceObjsArr[1].name + '</span></p>';
	explanationM = explanationM + '<p>Also you mentioned <span class="orangeSpan">walkway(s)</span> in between.</p>'
	explanationM = explanationM + "<p>The walkway(s) in between are highlighted as the footprint.</p>";
	
	addFoundPlaces(foundedPlaceGJsArr);
	
	bufDist = -5;
	
	explodeConvexBuf(foundedPlaceFC);
	
	bufErased1 = turf.erase(bufferFC.features[0],foundedPlaceFC.features[0]);
	bufErased2 = turf.erase(bufErased1,foundedPlaceFC.features[1]);
	centroidPt = turf.centroid(foundedPlaceGJsArr[0]);
	centroidPt2 = turf.centroid(foundedPlaceGJsArr[1]);
	lineStringBetweenCentriods = turf.linestring([centroidPt.geometry.coordinates,centroidPt2.geometry.coordinates]);
	
	
	for (p in bufErased2.geometry.coordinates)
	{
		poly = turf.polygon(bufErased2.geometry.coordinates[p]);

		intersection = turf.intersect(poly,lineStringBetweenCentriods);
		if (typeof intersection != 'undefined')
		{
			bufferFC.features[0] = poly;
		}
		
	}

	$.ajax({
		url : "input/walkways.geojson",
		type : "get",
		dataType : "json",
		cache : false,
		success : function(data) {
				
				intersection = turf.intersect(data.features[0], bufferFC.features[0]);
				intersection.properties['stroke'] = '#DA70D6';
				
				if (typeof intersection != 'undefined') {
					foundedPlaceGJsArr.push(intersection);
				}
			
			addFoundPlaces(foundedPlaceGJsArr);

			centerToBufCentriod(17);
			
			addPinkBuf();

			setExplnModalAndShow();
			
			},
		error: function(jqXHR,textStatus,errorThrown) {
			alert("Network problem or data source is missing. Please contact site admin");
		}
	});
	
}
//**********************************************
// Case 10: road segment between two intersections ** complex 5
function oneLineBetweenTwoLines() {

	if (message.indexOf("between") == -1)
	{
		explanationM = explanationM + '<p>The message is not clear about the relationship between <span class="orangeSpan">';
		explanationM = explanationM  + foundedPlaceObjsArr[0].name + '</span>, <span class="orangeSpan">'+ foundedPlaceObjsArr[1].name + ', and ';
		explanationM = explanationM  + '</span> and <span class="orangeSpan">' + foundedPlaceObjsArr[2].name + '</span></p>';
		setErrorModalAndShow();
	}
	else
	{
		var betweenInd = message.indexOf("between");
		var slicedBetweenInd = -1;
		var between1Ind = -1;
		var between2Ind = -1;

		if (message.indexOf(foundedPlaceObjsArr[0].name) < betweenInd) {
			slicedBetweenInd = 0;
			between1Ind = 1;
			between2Ind = 2;
		}

		if (message.indexOf(foundedPlaceObjsArr[1].name) < betweenInd) {
			slicedBetweenInd = 1;
			between1Ind = 0;
			between2Ind = 2;
		}

		if (message.indexOf(foundedPlaceObjsArr[2].name) < betweenInd) {
			slicedBetweenInd = 2;
			between1Ind = 0;
			between2Ind = 1;
		}

		intersection = turf.intersect(foundedPlaceObjsArr[slicedBetweenInd].myGJ, foundedPlaceObjsArr[between1Ind].myGJ);
		intersection2 = turf.intersect(foundedPlaceObjsArr[slicedBetweenInd].myGJ, foundedPlaceObjsArr[between2Ind].myGJ);

		if (typeof intersection == 'undefined' || typeof intersection2 == 'undefined')
		{
			explanationM = explanationM + '<p>The message implies that <span class="orangeSpan">' + foundedPlaceObjsArr[slicedBetweenInd].name + '</span>';
			explanationM = explanationM + ' is between <span class="orangeSpan">' + foundedPlaceObjsArr[between1Ind].name + '</span>';
			explanationM = explanationM + ' and <span class="orangeSpan">' + foundedPlaceObjsArr[between2Ind].name + '</span></p>';
			explanationM = explanationM + '<p>But it is NOT.</p>';

			setErrorModalAndShow();

		}
		else if (intersection.geometry.type == 'MultiPoint' || intersection2.geometry.type == 'MultiPoint')
		{
			explanationM = explanationM + '<p><span class="orangeSpan">' + foundedPlaceObjsArr[slicedBetweenInd].name + '</span>';
			explanationM = explanationM + ' is intersecting more than once with either <span class="orangeSpan">' + foundedPlaceObjsArr[between1Ind].name;
			explanationM = explanationM + '</span> or <span class="orangeSpan">' + foundedPlaceObjsArr[between2Ind].name + '</span></p>';
			explanationM = explanationM + '<p>The footpring cannot be generated accordingly.</p>';

			setErrorModalAndShow();
		}
		else if (typeof intersection != 'undefined' && typeof intersection2 != 'undefined')
		{
		    foundedPlaceGJsArr.push(intersection);
			foundedPlaceGJsArr.push(intersection2);
			addFoundPlaces(foundedPlaceGJsArr);
			slicedLineString = turf.linestring([intersection.geometry.coordinates,intersection2.geometry.coordinates]);
			bufferFC = turf.buffer(slicedLineString, 35, "feet");

			addPinkBuf();

			centerToBufCentriod(18);

		    explanationM = explanationM + '<p><span class="orangeSpan">' + foundedPlaceObjsArr[slicedBetweenInd].name + '</span> was sliced</p>';
			explanationM = explanationM + '<p>between <span class="orangeSpan">' + foundedPlaceObjsArr[between1Ind].name + '</span>';
			explanationM = explanationM + ' and <span class="orangeSpan">' + foundedPlaceObjsArr[between2Ind].name + '</span></p>';
			explanationM = explanationM + "<p>A buffer was generated to cover the inclusive footprint area.</p>";

			setExplnModalAndShow();
		}


	}

}
//**********************************************


//**********************************************
// helper functions
//**********************************************
// add founded places to the map
function addFoundPlaces(arr) {

	foundedPlaceFC = turf.featurecollection(arr);
	foundedPlaceGJLayer.setGeoJSON(foundedPlaceFC).addTo(myMap);
}
// explode polygons into points and convexhull the points and buffer them
function explodeConvexBuf(fc) {
	explodedPointsFC = turf.explode(fc);
	convexhullFC = turf.convex(explodedPointsFC);
	bufferFC = turf.buffer(convexhullFC, bufDist, "feet");
}
// only buffer without convexhull
function bufferOnly(fc) {

	bufferFC = turf.buffer(fc, bufDist, "feet");

}
// buffer a multistring
function bufferMultistring(fc) {

	/*explodedPointsFC = turf.explode(fc);
	var line;
	var bufArr = [];
	var merged;
	for (var i = 0; i < explodedPointsFC.features.length - 2; i++) {

		//pointsArr.push([explodedPointsFC.features[i].geometry.coordinates[0],explodedPointsFC.features[i].geometry.coordinates[1]]);

		line = turf.linestring([explodedPointsFC.features[i].geometry.coordinates,explodedPointsFC.features[i+1].geometry.coordinates]);
		bufferFC = turf.buffer(line, 200, "feet");
		bufArr.push(bufferFC.features[0]);

	}

	bufferFC = turf.featurecollection(bufArr);
	merged = turf.merge(bufferFC);
	console.log(merged);
	bufArr = [];
	bufArr.push(merged);
	bufferFC = turf.featurecollection(bufArr);
	*/

}
// for a polygon with bearing word
function envelopeShiftBearingBufErasePolygon(fc) {
	
	enveloped = turf.envelope(fc);
	pt1 = turf.point([enveloped.geometry.coordinates[0][0][0],enveloped.geometry.coordinates[0][0][1]]);
	pt2 = turf.point([enveloped.geometry.coordinates[0][1][0],enveloped.geometry.coordinates[0][1][1]]);
	pt3 = turf.point([enveloped.geometry.coordinates[0][2][0],enveloped.geometry.coordinates[0][2][1]]);
	distance1 = turf.distance(pt1, pt2, "miles")/1.5;
	distance2 = turf.distance(pt2, pt3, "miles")/1.5;
	halfDiagonal = Math.sqrt(Math.pow(distance1,2) + Math.pow(distance2,2))/2;
	centroidPt = turf.centroid(enveloped);
	bearingDistination = turf.destination(centroidPt, halfDiagonal, bearingAngle, "miles");
	bufferFC = turf.buffer(bearingDistination, bufDist, "feet");
	bufErased = turf.erase(bufferFC.features[0], fc.features[0]);
	bufferFC.features[0] = bufErased;
}
// for a point with bearing word
function envelopeShiftBearingBufPoint(fc) {
	
	bearingDistination = turf.destination(fc.features[0], 0.0155, bearingAngle, "miles");
	bufferFC = turf.buffer(bearingDistination, bufDist, "feet");
}
// add pink buffer
function addPinkBuf() {
	bufferFC.features[0].properties['fill'] = '#FFC0CB';//FFC0CB
	bufferFC.features[0].properties['stroke'] = '#FFC0CB';
	bufferFC.features[0].properties['fill-opacity'] = 0.2;
	bufferFC.features[0].properties['stroke-width'] = 3;
	bufferGJLayer.setGeoJSON(bufferFC).addTo(myMap);

}
// add yellow buffer
function addYellowBuf() {
	bufferFC.features[0].properties['fill'] = '#FFFF00';
	bufferFC.features[0].properties['stroke'] = '#FFFF00';
	bufferFC.features[0].properties['fill-opacity'] = 0.2;
	bufferFC.features[0].properties['stroke-width'] = 2;
	bufferGJLayer.setGeoJSON(bufferFC).addTo(myMap);
}
// center the map on the buffer centroid of the footprint
function centerToBufCentriod(zoomL) {

	bufCentroidPt = turf.centroid(bufferFC);
	latlngBufCentriodPt = L.latLng(bufCentroidPt.geometry.coordinates[1], bufCentroidPt.geometry.coordinates[0]);
	myMap.panTo(latlngBufCentriodPt);
	myMap.setZoom(zoomL);
}
// set explaination modal content and show it
function setExplnModalAndShow() {
	$('.geoparseModal').modal('hide');
	$('.geoParseExplP').html(explanationM);
	$('.explainPlaceFoundModal').modal('show');
}
// set only one road modal content and show it
function setErrorModalAndShow() {
	$('.geoparseModal').modal('hide');
	$('.errorP').html(explanationM);
	$('.errorModal').modal('show');
}
//**********************************************