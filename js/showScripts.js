function init() {
    var map = new google.maps.Map(document.getElementById('map'), {
        center: new google.maps.LatLng(52.2296756, 21.012228700000037),
        zoom: 15
    });
    var geocoder = new google.maps.Geocoder;
    var directionsDisplay = new google.maps.DirectionsRenderer({suppressMarkers: true});
    var infoWindow = new google.maps.InfoWindow;
    var userPosOptions = {enableHighAccuracy: true, timeout: 5000, maximumAge: 0};
    var iconUser = "icon.png";
    var locations = document.getElementById('locations');
    var distance = document.getElementById('distInput').value;

    /*
     * Load locations and user location.
     * Print locations and addresses.
     */
    function load(position) {
        var userCoords = position.coords;
        var latlng = {lat: userCoords.latitude, lng: userCoords.longitude};
        var locationLabel = {restaurant: {label: 'R'}, bar: {label: 'B'}};
        var dataUrl = "get.php?dist=" + distance + "&lat=" + userCoords.latitude + "&lng=" + userCoords.longitude;

        /*
         * Set marker position.
         */
        var userMarkerCoords = new google.maps.LatLng(parseFloat(userCoords.latitude), parseFloat(userCoords.longitude));
        var userMarker = new google.maps.Marker({
            map: map,
            position: userMarkerCoords,
            icon: iconUser
        });

        /*
         * Center map on user location.
         */
        var initialLocation = new google.maps.LatLng(userCoords.latitude, userCoords.longitude);
        map.setCenter(initialLocation);

        /*
         * Print user lat / lng and accuracy.
         */
        document.getElementById('lat').innerHTML = 'Latitude : ' + userCoords.latitude;
        document.getElementById("lng").innerHTML = 'Longitude: ' + userCoords.longitude;
        if (userCoords.accuracy) {
            document.getElementById("accuracy").innerHTML = 'Accuracy: ' + userCoords.accuracy + ' meters.';
        } else {
            document.getElementById("accuracy").innerHTML = '';
        }

        /*
         * Print address from lat/lng.
         */
        geocoder.geocode({'location': latlng}, function(results, status) {
            if (status === 'OK') {
                if (results[1]) {
                    document.getElementById("formatted_address").innerHTML = results[1].formatted_address;
                } else {
                    window.alert('No results found');
                }
            } else {
                window.alert('Geocoder failed due to: ' + status);
            }
        });

        /*
         * Load locations from database.
         */
        downloadLocations('get.php', function(data) {
            locations.innerHTML = '';
            var xml = data.responseXML;
            var markers = xml.documentElement.getElementsByTagName('marker');
            document.getElementById("resultsNumber").innerHTML = markers.length;
            if (markers.length === 0) {
                locations.innerHTML = '<li>Nothing was found :(</li>';
            }

            Array.prototype.forEach.call(markers, function(markerElem) {
                var id = markerElem.getAttribute('id');
                var name = markerElem.getAttribute('name');
                var address = markerElem.getAttribute('address');
                var type = markerElem.getAttribute('type');
                var point = new google.maps.LatLng(parseFloat(markerElem.getAttribute('lat')), parseFloat(markerElem.getAttribute('lng')));

                /*
                 * Print markers info windows.
                 */
                var infoWinContent = document.createElement('div');
                var strong = document.createElement('strong');
                strong.textContent = name;
                infoWinContent.appendChild(strong);
                infoWinContent.appendChild(document.createElement('br'));
                var text = document.createElement('text');
                text.textContent = address;
                infoWinContent.appendChild(text);
                infoWinContent.appendChild(document.createElement('hr'));
                var urlButton = document.createElement("button");
                urlButton.setAttribute("class", "btn btn-default");
                infoWinContent.appendChild(urlButton);
                var routeButton = document.createElement("button");
                routeButton.setAttribute("class", "btn btn-default");
                infoWinContent.appendChild(routeButton);
                var iconWWW = document.createElement("img");
                iconWWW.setAttribute("src", "www.png");
                iconWWW.setAttribute("height", "36");
                iconWWW.setAttribute("width", "36");
                iconWWW.setAttribute("alt", "Visit website");
                urlButton.appendChild(iconWWW);
                var iconWay = document.createElement("img");
                iconWay.setAttribute("src", "way.png");
                iconWay.setAttribute("height", "36");
                iconWay.setAttribute("width", "36");
                iconWay.setAttribute("alt", "Search route");
                routeButton.appendChild(iconWay);

                /*
                 * Print locations markers.
                 */
                var locationIcon = locationLabel[type] || {};
                var marker = new google.maps.Marker({
                    map: map,
                    position: point,
                    label: locationIcon.label
                });
                marker.addListener('click', function() {
                    infoWindow.setContent(infoWinContent);
                    infoWindow.open(map, marker);
                });

                /*
                 * Listen to find route.
                 */
                routeButton.addEventListener('click', function() {
                    findRoute(map, userMarkerCoords, directionsDisplay, text);
                });

                /*
                 * Print locations list.
                 */
                locations.innerHTML += '<tr><td>' + name + '</td><td>' + address + '</td><td>' + type + '</td></tr>';
            });
        });

        /*
         * Call PHP script.
         */
        function downloadLocations(url, callback) {
            var request = window.ActiveXObject ? new ActiveXObject('Microsoft.XMLHTTP') : new XMLHttpRequest;
            request.open("GET", dataUrl, true);
            request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            request.onreadystatechange = function() {
                if (request.readyState === 4 && request.status === 200) {
                    request.onreadystatechange = doNothing;
                    callback(request, request.status);
                }
            };
            request.send();
        }
    }

    /*
     Search by current position.
     */
    this.currentPosition = function() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(load, error, userPosOptions);
        } else {
            alert("Geolocation is not supported by this browser.");
        }
    };

    /*
     Search by address.
     */
    this.addressToLocation = function() {
        var address = document.getElementById('address').value;
        geocoder.geocode({'address': address}, function(results, status) {
            if (status === 'OK') {
                var position = {
                    'coords': {
                        latitude: results[0].geometry.location.lat(),
                        longitude: results[0].geometry.location.lng()
                    }
                };
                load(position);
            } else {
                alert('Geocode was not successful for the following reason: ' + status);
            }
        });
    };
}

/*
 Update the value of distance field.
 */
function updateDistInput(val) {
    document.getElementById('distInput').value = val;
}

function error(err) {
    alert('ERROR(' + err.code + '): ' + err.message);
}

/*
 Called in downloadLocations()
 Why?
 */
function doNothing() {}

/*
 * Find route to location.
 */
function findRoute(map, markerCoords, directionsDisplay, endpoint) {
    document.getElementById('directionsPanel').innerHTML = "";
    var directionsService = new google.maps.DirectionsService();
    var start = markerCoords;
    var end = endpoint.innerHTML;
    var selectedMode = document.getElementById('travelMode').value;
    directionsDisplay.setMap(map);
    directionsDisplay.setPanel(document.getElementById('directionsPanel'));

    var request = {
        origin: start,
        destination: end,
        travelMode: selectedMode
    };
    directionsService.route(request, function(result, status) {
        if (status === 'OK') {
            directionsDisplay.setDirections(result);
        }
    });
}

/*
 * Filter locations by search field.
 */
function filterLocationsBy() {
    // Declare variables.
    var searchFields, filter = [], table, tr, td = [], rowsArray, rowsCount, i, j, k;
    // Get all search fields.
    searchFields = document.getElementsByClassName("filterInput");
    // Search fields nodes to array.
    var searchValues = Array.prototype.map.call(searchFields, function(el) {
        return el.value;
    });
    for (i = 0; i < searchFields.length; i++) {
        filter.push(searchValues[i].toUpperCase());
    }
    // Prepare table and rows.
    table = document.getElementById("locations");
    tr = table.getElementsByTagName("tr");
    // For each row...
    for (i = 0; i < tr.length; i++) {
        // Prepare table data array
        for (j = 0; j < searchFields.length; j++) {
            td.push(tr[i].getElementsByTagName("td")[j]);
        }
        if (td) {
            // Check each table data in this row against each search field.
            // (first td against first search field, second against second etc.
            // filter[k] = current search field value.
            // td[k] = current table data in this row.
            // substring to force match string from the the first letters (based od checkbox!).
            // filter.length = number of letters in search field.
            if (document.getElementById('strictSearch').checked) {
                for (k = 0; k < searchFields.length; k++) {
                    if (td[k].innerHTML.substring(0, filter[k].length).toUpperCase().indexOf(filter[k]) > -1) {
                        tr[i].style.display = "";
                    } else {
                        tr[i].style.display = "none";
                        break; // So that next iteration won't restore the row
                    }
                }
            } else {
                for (k = 0; k < searchFields.length; k++) {
                    if (td[k].innerHTML.toUpperCase().indexOf(filter[k]) > -1) {
                        tr[i].style.display = "";
                    } else {
                        tr[i].style.display = "none";
                        break; // So that next iteration won't restore the row
                    }
                }
            }
        }
        // Set table data to empty array.
        td.length = 0;
    }
    // Update results number.
    rowsArray = [].slice.call(tr);
    rowsCount = rowsArray.filter(function(el) {
        return getComputedStyle(el).display !== "none";
    });
    document.getElementById("resultsNumber").innerHTML = rowsCount.length;
}

function resetInputs() {
    var fields = document.getElementsByClassName('filterInput');
    for (var i = 0; i < fields.length; i++) {
        fields[i].value = '';
    }
}
