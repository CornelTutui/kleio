/// <reference path="../node_modules/@types/leaflet/index.d.ts" />
/// <reference path="../node_modules/@types/bootstrap/index.d.ts" />
var LeafletMap = /** @class */ (function () {
    function LeafletMap(p) {
        var currentPositionCircle, currentPosition;
        var firstSetView = true;
        var delta = 0;
        var map = new L.Map(p);
        L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
            maxZoom: 20,
            maxNativeZoom: 18,
            attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
                'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
            id: 'mapbox/streets-v11',
            tileSize: 512,
            zoomOffset: -1
        }).addTo(map);
        setInterval(locate, 3000);
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
            console.log("locating with", e.accuracy, "accuracy");
            document.getElementById("lblAccuracy").textContent = "Accuracy: " + e.accuracy.toFixed(2) + "m";
            var pos = e.latlng;
            pos.lat += delta;
            pos.lng += delta;
            //currentPositionCircle = L.circle(e.latlng, e.accuracy / 2).addTo(map);
            currentPositionCircle = L.circle(pos, e.accuracy / 2).addTo(map);
            currentPosition = L.marker(e.latlng).addTo(map);
            delta += .0001;
        }
        function onLocationError(e) {
            alert(e.message);
        }
    }
    return LeafletMap;
}());
window.onload = function () {
    var p = document.getElementById("content");
    var map = new LeafletMap(p);
};
//# sourceMappingURL=app.js.map