class DB
{

	constructor()
	{
		//this.db = new PouchDB('SitesCoordinates');

		//this.addCoord(1, 1);
		//this.printCoords();
	}

	addCoord(lat, long)
	{
		var coord = {
			_id: (Date.now()).toString(),
			latitude: lat,
			longitude: long
		};

		this.db.put(coord, function callback(err, result)
		{
			if (err)
				console.log("error adding coord: ", err);
			else
				console.log("inserting ok");
		});
	}

	printCoords()
	{
		this.db.allDocs({ include_docs: true, descending: true }, function (err, doc)
		{
			console.log(doc.rows);
		});
	}

}

class LeafletMap
{

	constructor(p)
	{
		var currentPositionCircle, currentPosition;
		var firstSetView = true;
		var delta = 0;
		var keepCentered = true;
		var currentZoom = 0;
		var moving = false;
		var refreshInterval = 10000;


		document.getElementById("btnHome").addEventListener("click", (e) => onHome());

		document.getElementById("btnSaveCoords").addEventListener("click", (e) => onSaveCoords());

		var map = new L.Map(p);

		var sidebar = L.control.sidebar('sidebar').addTo(map);

		map.on("drag", () => { keepCentered = false; });
		map.on("zoomend", () => { currentZoom = map.getZoom(); console.log(currentZoom); });

		window.addEventListener('online', function (e)
		{
			document.getElementById("lblConnected").style.color = "black";
			document.getElementById("lblConnected").innerText = "Online";
		});

		window.addEventListener('offline', function (e)
		{
			document.getElementById("lblConnected").style.color = "gray";
			document.getElementById("lblConnected").innerText = "Offline";
		});

		L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw',
			{
				useCache: true,
				//useOnlyCache: true,

				maxZoom: 20,
				maxNativeZoom: 18,
				attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
					'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
				id: 'mapbox/streets-v11',
				tileSize: 512,
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

			console.log("locating with", e.accuracy, "m accuracy");
			document.getElementById("lblAccuracy").textContent = "Accuracy: " + e.accuracy.toFixed(2) + "m";

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


			navigator.geolocation.getCurrentPosition(function (location)
			{
				httpGetAsync("https://nominatim.openstreetmap.org/reverse?format=json&lat=" + location.coords.latitude + "&lon=" + location.coords.longitude, function (data)
				{
					var crtLoc = JSON.parse(data).display_name.toString();
					document.getElementById("lblCrtLocation").textContent = "Current location: " + crtLoc + "(" + location.coords.latitude.toFixed(5) + ", " + location.coords.longitude.toFixed(5) + ")";
				}
				);

			}
			);

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
			console.log(currentZoom);
		}


		function onSaveCoords()
		{
			delta = 0;
			keepCentered = true;
			map.locate({ setView: true, maxZoom: currentZoom, enableHighAccuracy: true });
			map.setZoom(currentZoom);
			console.log(currentZoom);
		};

		function httpGetAsync(theUrl, callback)
		{
			var xmlHttp = new XMLHttpRequest();
			xmlHttp.onreadystatechange = function ()
			{
				if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
					callback(xmlHttp.responseText);
			}
			xmlHttp.open("GET", theUrl, true);
			xmlHttp.send(null);
		}


	}
}

window.onload = () =>
{
	const p = document.getElementById("map");
	const map = new LeafletMap(p);
	const db = new DB;
};

