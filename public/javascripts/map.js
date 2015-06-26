
google.maps.event.addDomListener(window, 'load', initialize);


var overlay;
TMap.prototype = new google.maps.OverlayView();
var swBound;
var neBound;
var mapTypes = {};

mapTypes['blank'] = {
    getTileUrl: function (coord, zoom) { return ""; },
    tileSize: new google.maps.Size(256, 256),
    isPng: false,
    maxZoom: 16,
    minZoom: 9,
    name: 'Map'
};

var xyNode = document.createElement('div');
xyNode.id = 'mapXY';
xyNode.innerHTML = 'mouseover to view';
var map;

function initialize() {
    var mapTypeIds = [];
    for (var key in mapTypes) {
        mapTypeIds.push(key);
    }
    var mapOptions = {
        zoom: 12, 
        center: PointToLatLng(new google.maps.Point(mapWidth / 2, mapHeight / 2)),
        mapTypeId: 'blank', 
        mapTypeControlOptions: { mapTypeIds: [] },
        backgroundColor: "rgb(50, 50, 50)",
        overviewMapControl: false, 
        streetViewControl: false
    };
    map = new google.maps.Map(document.getElementById('map_canvas'), mapOptions);
    for (key in mapTypes) {
        map.mapTypes.set(key, new google.maps.ImageMapType(mapTypes[key]));
    }
    map.controls[google.maps.ControlPosition.BOTTOM_CENTER].push(xyNode);

    google.maps.event.addListener(map, 'mousemove', function (e) {
        var pos = LatLngToPoint(e.latLng);
        xyNode.innerHTML = 'X: ' + Math.ceil(pos.x) + ' | Y: ' + Math.ceil(pos.y);
    });
    swBound = PointToLatLng(new google.maps.Point(0, mapHeight));
    neBound = PointToLatLng(new google.maps.Point(mapWidth, 0));
    var bounds = new google.maps.LatLngBounds(swBound, neBound);
    overlay = new TMap(bounds, autosavepngLocation, map);
    var visible = ($('#sidebar .wcheck:checked').length === 1);
    for (var i = 0; i < warps.length; i++) {
        add_warp(warps[i], visible);
    }
    if (window.location.hash) {
        parseHash();
    }

    google.maps.event.addListener(map, 'center_changed', updateHash);
    google.maps.event.addListener(map, 'zoom_changed', updateHash);
    $('#sidebar .expand').css("line-height", $(this).height() + "px");
    $('#sidebar fieldset').css("height", $('#sidebar').height() - 91 + "px");

    $(window).resize(function () {
        $('#sidebar .expand').css("line-height", $(this).height() + "px");
        $('#sidebar fieldset').css("height", $('#sidebar').height() - 91 + "px");
    });

    $('#sidebar .pin').click(function () {
        if ($('#sidebar').hasClass('pinned')) {
            $(this).html("Pin sidebar <strong>&#8250;</strong>");
            $('#sidebar').removeClass('pinned');
        }
        else {
            $(this).html("Unpin sidebar <strong>&#8249;</strong>");
            $('#sidebar').addClass('pinned');
        }
    });

    $('#sidebar .link').click(function () {
        window.prompt('Copy the following url to link to the current position', window.location.href);
    });

    $('#sidebar .expand_goto').click(function () {
        if ($('#sidebar .goto').hasClass('hidden')) {
            $(this).html("<strong>&#8250;</strong> Goto point");
            $('#sidebar .goto').removeClass('hidden');
        } 
        else {
            $(this).html("<strong>&#8249;</strong> Goto point"); $('#sidebar .goto').addClass('hidden');
        }
    });

    $('#sidebar .wcheck').change(function (e) {
        if ($('#sidebar .wcheck:checked')[0]) {
            var search = $('#sidebar .wsearch').val();
            for (var i = 0; i < markers.length; i++) {
                if (!search || warpdivs[i].getAttribute('name').indexOf(search) != -1) {
                    markers[i].setVisible(true);
                }
            }
        } else { for (var i = 0; i < markers.length; i++) { markers[i].setVisible(false); } }
    });
}
function WarpSearch() {
    var val = $('#sidebar .wsearch').val(); var list = document.querySelector('#sidebar .warps');
    list.innerHTML = ""; if (!val) {
        for (var i = 0; i < warpdivs.length; i++) {
            list.appendChild(warpdivs[i]); if ($('#sidebar .wcheck:checked').length === 1) {
                markers[i].setVisible(true);
            }
        }
        return;
    }
    for (var i = 0; i < warpdivs.length; i++) {
        if (warpdivs[i].getAttribute('name').indexOf(val) != -1) {
            if ($('#sidebar .wcheck:checked').length === 1) {
                markers[i].setVisible(true);
            }
            list.appendChild(warpdivs[i]);
        } else if ($('#sidebar .wcheck:checked').length === 1) {
            markers[i].setVisible(false);
        }
    }
}
function updateHash()
 {
    var c = LatLngToPoint(map.getCenter());
    window.location.hash = "#" + map.getZoom() + "," + Math.ceil(c.x) + "," + Math.ceil(c.y);
}
function parseHash()
 {
    var hash = window.location.hash.substring(1);
    var data = hash.split(',');
    if (data.length != 3)
        return;
    var z = parseInt(data[0]);
    var x = parseInt(data[1]);
    var y = parseInt(data[2]);
    if (isNaN(z) || isNaN(x) || isNaN(y))
        return;
    if (z < 9 || z > 16)
        return;
    PanToZXY(z, x, y);
}

var warpdivs = [];

function add_warp(warp, visible) {
    var list = document.querySelector('#sidebar .warps');
    var li = document.createElement('li');
    li.setAttribute('class', 'warp');
    li.setAttribute('name', warp.name);
    li.innerHTML = '<a onclick="PanToXY(' + warp.x + ', ' + warp.y + ')" href="#14,' + warp.x + ',' + warp.y + '">' + warp.name + '</a>';
    list.appendChild(li); warpdivs.push(li);
    addMarker(PointToLatLng(new google.maps.Point(warp.x, warp.y)), warp.name);
}
var markers = [];

function addMarker(location, name, visible) {
    marker = new google.maps.Marker({ title: name, position: location, map: map, visible: visible });
    markers.push(marker);
}

function GotoBttn(){
    var X = $('#sidebar .goto .x').val(); var Y = $('#sidebar .goto .y').val();
    var intX = parseInt(X);
    var intY = parseInt(Y);
    if (isNaN(intX) || isNaN(intY))
        return; PanToXY(intX, intY);
}

function PanToXY(X, Y) {
    var latlng = PointToLatLng(new google.maps.Point(X, Y)); map.panTo(latlng); map.setZoom(14);
}

function PanToZXY(Z, X, Y) {
    var latlng = PointToLatLng(new google.maps.Point(X, Y)); map.panTo(latlng); map.setZoom(Z);
}

function PointToLatLng(Point){
    return new google.maps.LatLng(Point.y * -0.0001, Point.x * 0.0001);
}

function LatLngToPoint(LatLng) {
    return new google.maps.Point(LatLng.lng() / 0.0001, LatLng.lat() / -0.0001);
}

function TMap(bounds, image, map) {
    this.bounds_ = bounds;
    this.image_ = image;
    this.map_ = map;
    this.div_ = null;
    this.setMap(map);
}

TMap.prototype.onAdd = function () {
    var div = document.createElement('div');
    div.style.borderStyle = 'none';
    div.style.borderWidth = '0px';
    div.style.position = 'absolute';
    var img = document.createElement('img');
    img.src = this.image_;
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.position = 'absolute';
    div.appendChild(img);
    this.div_ = div; var panes = this.getPanes();
    panes.overlayLayer.appendChild(div);
}

TMap.prototype.draw = function () {
    var overlayProjection = this.getProjection();
    var sw = overlayProjection.fromLatLngToDivPixel(this.bounds_.getSouthWest());
    var ne = overlayProjection.fromLatLngToDivPixel(this.bounds_.getNorthEast());
    var div = this.div_;
    div.style.left = sw.x + 'px';
    div.style.top = ne.y + 'px';
    div.style.width = (ne.x - sw.x) + 'px';
    div.style.height = (sw.y - ne.y) + 'px';
}

TMap.prototype.onRemove = function () {
    this.div_.parentNode.removeChild(this.div_);
    this.div_ = null;
}