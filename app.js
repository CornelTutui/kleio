/// <reference path="../node_modules/@types/leaflet/index.d.ts" />
var LeafletMap = /** @class */ (function () {
    function LeafletMap(p) {
        var map = new L.Map(p);
        map.locate({ /*watch: true, */ setView: true, maxZoom: 18, enableHighAccuracy: true });
        L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
            maxZoom: 20,
            maxNativeZoom: 18,
            attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
                'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
            id: 'mapbox/streets-v11',
            tileSize: 512,
            zoomOffset: -1
        }).addTo(map);
        map.on('locationfound', onLocationFound);
        map.on('locationerror', onLocationError);
        function onLocationFound(e) {
            console.log("locating with", e.accuracy, "accuracy");
            var radius = e.accuracy;
            //L.marker(e.latlng).addTo(map).bindPopup("You are within " + radius + " meters from this point").openPopup();
            L.circle(e.latlng, radius).addTo(map);
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