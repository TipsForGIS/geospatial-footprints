var map;
var sublayerU;
var sublayerM;
var sublayerI;
var subLayerF;
var sql;
var cX;
var cY;
var uX;
var uY;
var mX;
var mY;
var iX;
var iY;
var point1;
var point2;
var pointList;
var pLine;


function initMap()
	{
	// initiate leaflet map
	map = new L.Map('cartodb-map', {center: [38.83078, -77.30731],zoom: 16});
	
	L.tileLayer('https://{s}.tiles.mapbox.com/v3/aaburiza.k9dg608e/{z}/{x}/{y}.png', 
		{
			attribution: 'Mapbox <a href="http://mapbox.com/about/maps" target="_blank">Terms &amp; Feedback</a>'
		}).addTo(map);
				
				
				
	var layerUrl = 'http://aaburiza.cartodb.com/api/v2/viz/6a0bbf56-71ea-11e4-8001-0e018d66dc29/viz.json';
	
	        	
	var subLayerUOptions =
		{
			sql: "SELECT * FROM user_loc",
			cartocss: "#user_loc{marker-fill-opacity: 0.9;marker-line-color: #FFF;marker-line-width: 1.5;marker-line-opacity: 1;marker-placement: point;marker-type: ellipse;marker-width: 10;marker-fill: #ffff00;marker-allow-overlap: true;}"
		}
	var subLayerMOptions =
		{
			sql: "SELECT * FROM mod_loc",
			cartocss: "#mod_loc{marker-fill-opacity: 0.9;marker-line-color: #FFF;marker-line-width: 1.5;marker-line-opacity: 1;marker-placement: point;marker-type: ellipse;marker-width: 10;marker-fill: #229A00;marker-allow-overlap: true;}"
		}
	var subLayerIOptions =
		{
			sql: "SELECT * FROM img_loc",
			cartocss: "#img_loc{marker-fill-opacity: 0.9;marker-line-color: #FFF;marker-line-width: 1.5;marker-line-opacity: 1;marker-placement: point;marker-type: ellipse;marker-width: 10;marker-fill: #2167AB;marker-allow-overlap: true;}"
		}
	var subLayerFOptions =
		{
			sql: "SELECT * FROM footprint",
			cartocss: "#footprint{polygon-fill: #FFFFFF;polygon-opacity: 0.3;line-color: #F84F40;line-width: 2;line-opacity: 1;}"
		}
	        		
	        		
	cartodb.createLayer(map,layerUrl)
	.addTo(map)
	.on('done', function(layer) 
		{
			sublayerU = layer.getSubLayer(0);
			sublayerU.set(subLayerUOptions);
			
			sublayerM = layer.getSubLayer(1);
			sublayerM.set(subLayerMOptions);
			
			sublayerI = layer.getSubLayer(2);
			sublayerI.set(subLayerIOptions);
			
			sublayerF = layer.getSubLayer(3);
			sublayerF.set(subLayerFOptions);
			
		}).on('error', function() 
			{
				//log the error
			});
	          	  
	    $('#convexhull').click(convexhullF);
	          	  
	    $('#segment').click(segmentF);
	          	    
	    $('#intersection').click(intersectionF);
	}
	

function intersectionF()
	{
				/*var cX;
				var cY;
				var uX;
				var uY;
				var mX;
				var mY;
				var iX;
				var iY;
				var point1;
				var point2;
				var pointList;
				var pLine;
				*/
				
				sublayerU.setSQL("SELECT * FROM user_loc where name = 'obstacle_4'");
				sublayerM.setSQL("SELECT * FROM mod_loc where name = 'obstacle_4'");
				sublayerI.setSQL("SELECT * FROM img_loc where name = 'obstacle_4'");
				sublayerF.setSQL("SELECT * FROM footprint where name = 'obstacle_4'");
				
				sql = new cartodb.SQL({user: 'aaburiza'});
				sql.execute("select st_x(st_centroid(the_geom)) as cX, st_y(st_centroid(the_geom)) as cY from footprint where name = 'obstacle_4'")
				.done(function(data) {
				  cX = parseFloat(data.rows[0]["cx"]);
				  cY = parseFloat(data.rows[0]["cy"]);
				  map.panTo([cY, cX]);
				  map.setZoom(19);
				})
				.error(function(errors) {
				  // errors contains a list of errors
				  alert("errors:" + errors);
				})
				
				sql.execute("select description as d from user_loc where name = 'obstacle_4'")
				.done(function(data) {
				  $('#pMessage').text("");
				  $('#pMessage').text("Message: " + data.rows[0]["d"]);

				})
				.error(function(errors) {
				  // errors contains a list of errors
				  alert("errors:" + errors);
				})
				
				sql.execute("select st_x(u.the_geom) as uX, st_y(u.the_geom) as uY, st_x(m.the_geom) as mX, st_y(m.the_geom) as mY,st_distance(u.the_geom::geography,m.the_geom::geography) as d from user_loc as u, mod_loc as m where u.name = m.name and m.name= 'obstacle_4'")
				.done(function(data) {
					uX = parseFloat(data.rows[0]["uX"]);
					uY = parseFloat(data.rows[0]["uY"]);
					mX = parseFloat(data.rows[0]["mX"]);
					mY = parseFloat(data.rows[0]["mY"]);
				  	$('#pMessage').append("<br />-------<br />Distance user->mod = " + Math.round((data.rows[0]["d"])*10)/10 + " m");
				})
				.error(function(errors) {
				  // errors contains a list of errors
				  alert("errors:" + errors);
				})
				
				sql.execute("select st_x(i.the_geom) as iX, st_y(i.the_geom) as iY, st_distance(i.the_geom::geography,m.the_geom::geography) as d from img_loc as i, mod_loc as m where i.name = m.name and m.name= 'obstacle_4'")
				.done(function(data) {
					iX = parseFloat(data.rows[0]["iX"]);
					iY = parseFloat(data.rows[0]["iY"]);
				  	$('#pMessage').append("<br />Distance img->mod = " + Math.round((data.rows[0]["d"])*10)/10 + " m");
				})
				.error(function(errors) {
				  // errors contains a list of errors
				  alert("errors:" + errors);
				})
				
				sql.execute("select st_distance((select st_centroid(the_geom)::geography from footprint where name = 'obstacle_4'),m.the_geom::geography) as d from mod_loc as m where m.name = 'obstacle_4'")
				.done(function(data) {
				  $('#pMessage').append("<br />Distance centroid->mod = " + Math.round((data.rows[0]["d"])*10)/10 + " m");
				})
				.error(function(errors) {
				  // errors contains a list of errors
				  alert("errors:" + errors);
				})
				
				/*
				point1 = new L.LatLng(cY,cX);
				point2 = new L.LatLng(mY,mX);
				pointList = [point1, point2];
				pLine = new L.Polyline(pointList, 
				{
				color: 'red',
				weight: 1,
				opacity: 0.5,
				smoothFactor: 1
				});
				pLine.addTo(map);
				
				point1 = new L.LatLng(iY,iX);
				point2 = new L.LatLng(mY,mX);
				pointList = [point1, point2];
				pLine = new L.Polyline(pointList, 
				{
				color: 'red',
				weight: 1,
				opacity: 0.5,
				smoothFactor: 1
				});
				pLine.addTo(map);
				
				point1 = new L.LatLng(uY,uX);
				point2 = new L.LatLng(mY,mX);
				pointList = [point1, point2];
				pLine = new L.Polyline(pointList, 
				{
				color: 'red',
				weight: 1,
				opacity: 0.5,
				smoothFactor: 1
				});
				pLine.addTo(map);
				*/
				//return true;
	}


function convexhullF()
	{
				sublayerU.setSQL("SELECT * FROM user_loc where name = 'obstacle_24'");
				sublayerM.setSQL("SELECT * FROM mod_loc where name = 'obstacle_24'");
				sublayerI.setSQL("SELECT * FROM img_loc where name = 'obstacle_24'");
				sublayerF.setSQL("SELECT * FROM footprint where name = 'obstacle_24'");
				
				sql = new cartodb.SQL({user: 'aaburiza'});
				sql.execute("select st_x(st_centroid(the_geom)), st_y(st_centroid(the_geom)) from footprint where name = 'obstacle_24'")
				.done(function(data) {
				  x = data.rows[0]["st_x"];
				  y = data.rows[0]["st_y"];
				  map.panTo([y, x]);
				  map.setZoom(18);
				})
				.error(function(errors) {
				  // errors contains a list of errors
				  alert("errors:" + errors);
				})
				
				
				sql.execute("select description as d from user_loc where name = 'obstacle_24'")
				.done(function(data) {
					$('#pMessage').text("");
				  	$('#pMessage').text("Message: " + data.rows[0]["d"]);

				})
				.error(function(errors) {
				  // errors contains a list of errors
				  alert("errors:" + errors);
				})
				
				sql.execute("select st_distance(u.the_geom::geography,m.the_geom::geography) as d from user_loc as u, mod_loc as m where u.name = m.name and m.name= 'obstacle_24'")
				.done(function(data) {
				  $('#pMessage').append("<br />-------<br />Distance user->mod = " + Math.round((data.rows[0]["d"])*10)/10 + " m");
				})
				.error(function(errors) {
				  // errors contains a list of errors
				  alert("errors:" + errors);
				})
				
				sql.execute("select st_distance(i.the_geom::geography,m.the_geom::geography) as d from img_loc as i, mod_loc as m where i.name = m.name and m.name= 'obstacle_24'")
				.done(function(data) {
				  $('#pMessage').append("<br />Distance img->mod = " + Math.round((data.rows[0]["d"])*10)/10 + " m");
				})
				.error(function(errors) {
				  // errors contains a list of errors
				  alert("errors:" + errors);
				})
				
				sql.execute("select st_distance((select st_centroid(the_geom)::geography from footprint where name = 'obstacle_24'),m.the_geom::geography) as d from mod_loc as m where m.name = 'obstacle_24'")
				.done(function(data) {
				  $('#pMessage').append("<br />Distance centroid->mod = " + Math.round((data.rows[0]["d"])*10)/10 + " m");
				})
				.error(function(errors) {
				  // errors contains a list of errors
				  alert("errors:" + errors);
				})
				//return true;
	}


function segmentF()
	{
				
				
				sublayerU.setSQL("SELECT * FROM user_loc where name = 'obstacle_50'");
				sublayerM.setSQL("SELECT * FROM mod_loc where name = 'obstacle_50'");
				sublayerI.setSQL("SELECT * FROM img_loc where name = 'obstacle_50'");
				sublayerF.setSQL("SELECT * FROM footprint where name = 'obstacle_50'");
				
				sql = new cartodb.SQL({user: 'aaburiza'});
				sql.execute("select st_x(st_centroid(the_geom)), st_y(st_centroid(the_geom)) from footprint where name = 'obstacle_50'")
				.done(function(data) {
				  x = data.rows[0]["st_x"];
				  y = data.rows[0]["st_y"];
				  map.panTo([y, x]);
				  map.setZoom(18);
				})
				.error(function(errors) {
				  // errors contains a list of errors
				  alert("errors:" + errors);
				})
				
				
				sql.execute("select description as d from user_loc where name = 'obstacle_50'")
				.done(function(data) {
				  $('#pMessage').text("");
				  $('#pMessage').text("Message: " + data.rows[0]["d"]);

				})
				.error(function(errors) {
				  // errors contains a list of errors
				  alert("errors:" + errors);
				})
				
				sql.execute("select st_distance(u.the_geom::geography,m.the_geom::geography) as d from user_loc as u, mod_loc as m where u.name = m.name and m.name= 'obstacle_50'")
				.done(function(data) {
				  $('#pMessage').append("<br />-------<br />Distance user->mod = " + Math.round((data.rows[0]["d"])*10)/10 + " m");
				})
				.error(function(errors) {
				  // errors contains a list of errors
				  alert("errors:" + errors);
				})
				
				sql.execute("select st_distance(i.the_geom::geography,m.the_geom::geography) as d from img_loc as i, mod_loc as m where i.name = m.name and m.name= 'obstacle_50'")
				.done(function(data) {
				  $('#pMessage').append("<br />Distance img->mod = " + Math.round((data.rows[0]["d"])*10)/10 + " m");
				})
				.error(function(errors) {
				  // errors contains a list of errors
				  alert("errors:" + errors);
				})
				
				sql.execute("select st_distance((select st_centroid(the_geom)::geography from footprint where name = 'obstacle_50'),m.the_geom::geography) as d from mod_loc as m where m.name = 'obstacle_50'")
				.done(function(data) {
				  $('#pMessage').append("<br />Distance centroid->mod = " + Math.round((data.rows[0]["d"])*10)/10 + " m");
				})
				.error(function(errors) {
				  // errors contains a list of errors
				  alert("errors:" + errors);
				})
				//return true;
				  
	}

function toggleParagraph()
{
	$("#messageP").slideToggle("slow");
	
	if ($("#toggleMessage").text() == "Hide Message")
	{$("#toggleMessage").text("Show Message");}
	else
	{$("#toggleMessage").text("Hide Message");}
}
