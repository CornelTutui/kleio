class DB
{

	constructor()
	{
		this.db = new PouchDB('SitesCoordinates');
	}

	addCoord(lat, long)
	{
		//if DB not exists, create it, else update it
		this.db = new PouchDB('SitesCoordinates');

		var coord = {
			_id: (Date.now()).toString(),
			latitude: lat,
			longitude: long
		};

		this.db.put(coord, (err, result) =>
		{
			if (err)
				console.log("error adding coord: ", err);
		});
	}

	destroy()
	{
		this.db.destroy().then( (response) =>
		{
			console.log("DB deleted");
		}).catch( (err) =>
		{
			console.log(err);
		});
	}


	printCoords()
	{
		this.db.allDocs({ include_docs: true, descending: true }, (err, doc) =>
		{
			console.log(doc.rows);
		});
	}

	readCoords(fct)
	{
		this.db.allDocs({ include_docs: true }).then((result) =>
		{
			var docs = result.rows.map((row) =>
			{
				return row.doc;
			});
			fct(docs);
			return docs;
		}).catch((err) =>
		{
			console.log(err);
		});
	}

}

class Kleio
{

	constructor()
	{
		var currentPositionCircle, currentPosition;
		var firstSetView = true;
		var delta = 0;
		var keepCentered = true;
		var currentZoom = 0;
		var moving = false;
		var refreshInterval = 3000;
		var sitesDiameter = 50;
		var oldLat = 0, oldLong = 0;
		var oldCenter;


		var db = new DB;

		document.getElementById("btnHome").addEventListener("click", (e) => onHome());

		document.getElementById("btnSaveCoords").addEventListener("click", (e) => onSaveCoords());

		document.getElementById("btnDeleteCoords").addEventListener("click", (e) => onDeleteCoords());

		var map = new L.Map(document.getElementById("map"));

		var sidebar = L.control.sidebar('sidebar').addTo(map);

		map.on("dragstart", (e) =>
		{
			oldCenter = map.getCenter();
		});

		map.on("dragend", (e) =>
		{
			var center = map.getCenter();
			console.log(distance(oldCenter.lat, oldCenter.lng, center.lat, center.lng));
			if (distance(oldCenter.lat, oldCenter.lng, center.lat, center.lng) > .01)
				keepCentered = false;
			oldCenter = center;
		});

		map.on("zoomend", () => { currentZoom = map.getZoom();});

		window.addEventListener('online', (e) =>
		{
			document.getElementById("lblConnected").style.color = "black";
			document.getElementById("lblConnected").innerHTML = "<b>Online</b>";
		});

		window.addEventListener('offline', (e) =>
		{
			document.getElementById("lblConnected").style.color = "gray";
			document.getElementById("lblConnected").innerHTML = "<b>Offline</b>";
		});

		L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw',
			{
				useCache: true,
				//useOnlyCache: true,

				maxZoom: 20,
				maxNativeZoom: 18,
				attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
					'Imagery <a href="https://www.mapbox.com/">Mapbox</a>',
				id: 'mapbox/streets-v11',
				tileSize: 512,
				reuseTiles: true,
				zoomOffset: -1
			}
		).addTo(map);

		setInterval(locate, refreshInterval);
		locate();

		map.on('locationfound', onLocationFound);
		map.on('locationerror', onLocationError);

		function locate()
		{
			map.locate({ setView: firstSetView, maxZoom: 18, enableHighAccuracy: true });
			firstSetView = false;
		}

		function onLocationFound(e)
		{
			if (currentPositionCircle) {
				map.removeLayer(currentPositionCircle);
				map.removeLayer(currentPosition);
			}

			document.getElementById("lblAccuracy").innerHTML = "<b>Accuracy: </b><br>" + e.accuracy.toFixed(2) + "m";

			var pos = e.latlng;
			currentPositionCircle = L.circle(pos, e.accuracy / 2).addTo(map);
			currentPosition = L.marker(e.latlng).addTo(map);

			if (moving) {
				pos.lat += delta;
				pos.lng += delta;
				delta += .001;
			}

			if (keepCentered) {
				map.panTo(e.latlng);
			}


			navigator.geolocation.getCurrentPosition((location) =>
			{
				var d = distance(location.coords.latitude, location.coords.longitude, oldLat, oldLong);
				oldLat = location.coords.latitude;
				oldLong = location.coords.longitude;

				//daca nu ma misc prea mult, nu aplezez APIul, evit ban
				if (d < .01) 
					return;

				httpGetAsync("https://nominatim.openstreetmap.org/reverse?format=json&lat=" + location.coords.latitude + "&lon=" + location.coords.longitude, (data) =>
				{
					var crtLoc = JSON.parse(data).display_name.toString();
					document.getElementById("lblCrtLocation").innerHTML = "<b>Current location: </b><br>" + crtLoc + " ( " + location.coords.latitude.toFixed(5) + ", " + location.coords.longitude.toFixed(5) + " )";
				}
				);

			}
			);

		}

		function distance(lat1, long1, lat2, long2)
		{
			return Math.sqrt(Math.pow(lat1 - lat2, 2) + Math.pow(long1 - long2, 2));
		}

		function onLocationError(e)
		{
			alert(e.message);
		}


		function onHome()
		{
			delta = 0;
			keepCentered = true;
			map.locate({ setView: true, maxZoom: currentZoom, enableHighAccuracy: true });
			map.setZoom(currentZoom);
		}


		function onSaveCoords()
		{
			db.addCoord(document.getElementById("iLat").value, document.getElementById("iLong").value);
			db.printCoords();

			db.readCoords((docs) =>
			{
				for (var i = 0; i < docs.length; ++i) {
					addSite(docs[i].latitude, docs[i].longitude);
				}
			});
		};

		function onDeleteCoords()
		{
			db.destroy();
		}

		function httpGetAsync(theUrl, callback)
		{
			var xmlHttp = new XMLHttpRequest();
			xmlHttp.onreadystatechange = () =>
			{
				var response;
				if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
					callback(xmlHttp.responseText);
			}
			xmlHttp.open("GET", theUrl, true);
			xmlHttp.send(null);
		}


		function addSite(lat, long)
		{
			L.circle(L.latLng(lat, long),
				{
					color: 'red',
					fillColor: 'red',
					fillOpacity: 1,
					radius: sitesDiameter
				}
			).addTo(map);
		}

	}
}

//window.onload = () =>
//{
//	const app = new Kleio;
//};

document.addEventListener('DOMContentLoaded', (e) =>
{
	const app = new Kleio;
})