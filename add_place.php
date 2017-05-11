<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <title>Add new location</title>
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous">
</head>
<body onload="initialize()">
    <script type="text/javascript" src="https://maps.googleapis.com/maps/api/js?key=AIzaSyCFuaH_8dXWWtV4qDTLhobOVoB_GsljS_Y"></script>
<!--     <script type="text/javascript">
        window.onload = function () {
            var mapOptions = {
                center: new google.maps.LatLng(52.22937, 21.01135),
                zoom: 14,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            };
            var infoWindow = new google.maps.InfoWindow();
            var latlngbounds = new google.maps.LatLngBounds();
            var map = new google.maps.Map(document.getElementById("dvMap"), mapOptions);
            google.maps.event.addListener(map, 'click', function (e) {
                //alert("Latitude: " + e.latLng.lat() + "\r\nLongitude: " + e.latLng.lng());
            var lat = document.getElementById('lat');
            var long = document.getElementById('long');
            lat.value = e.latLng.lat();  
            long.value = e.latLng.lng(); 

            });
        }
    </script> -->

<script>
  var geocoder;
  var map;
  function initialize() {
    geocoder = new google.maps.Geocoder();
    var latlng = new google.maps.LatLng(52.2296756, 21.012228700000037);
    var mapOptions = {
      zoom: 15,
      center: latlng
    }
    map = new google.maps.Map(document.getElementById('map'), mapOptions);
  }

  function codeAddress() {
    var address = document.getElementById('address').value;
    geocoder.geocode( { 'address': address}, function(results, status) {
      if (status == 'OK') {
        map.setCenter(results[0].geometry.location);
        var marker = new google.maps.Marker({
            map: map,
            position: results[0].geometry.location            
        });
        var lat = document.getElementById('lat');
        var long = document.getElementById('long');
        lat.value = results[0].geometry.location.lat();  
        long.value = results[0].geometry.location.lng();
      } else {
        alert('Geocode was not successful for the following reason: ' + status);
      }
    });
  }   
</script>

    <div class="container">
        <div class="row">
            <div class="col-md-6">
                <form action="process.php" method="post">
                    <div class="form-group">
                        <label for="name">Name</label>
                        <input type="text" id="name" class="form-control" name="name">
                    </div>
                    <div class="form-group">
                        <label for="address">Address</label>
                        <input type="text" id="address" class="form-control" name="address" value="Warsaw">
                    </div>
                    <div class="form-group">
                        <label for="lat">Latitude:</label>
                        <input type="text" id="lat" class="form-control" name="lat">
                    </div>
                    <div class="form-group">
                        <label for="long">Longtitude:</label>
                        <input type="text" id="long" class="form-control" name="long">
                    </div>
                    <div class="form-group">
                        <label for="type">Type</label>
                        <select id="type" class="form-control" name="type">
                          <option value="restaurant">Restaurant</option>
                          <option value="bar">Bar</option>
                        </select>
                    </div>
                    <input type="submit" class="btn btn-default" value="Submit">
                </form>
                <input type="button" value="Show on map" onclick="codeAddress()">            
            </div>    
            <div class="col-md-6">
                <div id="map" style="width: 100%; height: 400px"></div>
            </div>
        </div>
    </div>
</body>
</html>
