class LeafletMap {
	constructor(p) {
		var currentPositionCircle, currentPosition;
		var firstSetView = true;
		var delta = 0;
		var keepCentered = true;
		var currentZoom = 0;
		var moving = false;
		var refreshInterval = 5000;

		document.getElementById("btnHome").addEventListener("click", (e) => onHome());

		var map = new L.Map(p);

		var sidebar = L.control.sidebar('sidebar').addTo(map);

		map.on("drag", () => { keepCentered = false; });
		map.on("zoomend", () => { currentZoom = map.getZoom(); console.log(currentZoom); });

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

		map.on('locationfound', onLocationFound);
		map.on('locationerror', onLocationError);

		function locate() {
			map.locate({ setView: firstSetView, maxZoom: 18, enableHighAccuracy: true });
			firstSetView = false;
		}

		function onLocationFound(e) {
			if (currentPositionCircle) {
				map.removeLayer(currentPositionCircle);
				map.removeLayer(currentPosition);
			}

			console.log("locating with", e.accuracy, "m accuracy");
			document.getElementById("lblAccuracy").textContent = "Accuracy: " + e.accuracy.toFixed(2) + "m";

			if (window.navigator.onLine) {
				document.getElementById("lblConnected").style.color = "black";
				document.getElementById("lblConnected").innerText = "Online";
			}
			else {
				document.getElementById("lblConnected").style.color = "gray";
				document.getElementById("lblConnected").innerText = "Offline";
			}


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

		}

		function onLocationError(e) {
			alert(e.message);
		}


		function onHome() {
			delta = 0;
			keepCentered = true;
			map.locate({ setView: true, maxZoom: currentZoom, enableHighAccuracy: true });
			map.setZoom(currentZoom);
			console.log(currentZoom);
		};

	}
}

window.onload = () => {
	const p = document.getElementById("map");
	const map = new LeafletMap(p);
};

