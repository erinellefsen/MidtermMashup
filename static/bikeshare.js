"use strict"


class BikeShare {

  constructor() {
    this.usr_lat = '';
    this.usr_lng = '';
    this.min_lat = '';
    this.min_lng = '';
  }

  //get locations of all bike shares from city bikes api
  get_bike_locations() {
    let bike_locations = {};
    let self = this;
    $.ajax({
      url: "http://localhost:5000/proxy/getbikes",
      method: "GET"
    }).done(function(data) {
      let d = JSON.parse(data).networks;
      for (let i of d) {
        bike_locations[i.id] = [i.location.latitude, i.location.longitude];
      };
      self.calc_distances(bike_locations);
    });
  }

  //gets location of user from their input and google maps geocode api
  get_usr_location() {
    let self = this;
    var inputaddress = document.getElementById('address').value;
    $.ajax({
      url: `http://localhost:5000/proxy/getlatlong?address=${inputaddress}&key=AIzaSyCPeRre--luGA6MKHUFYpMUXS0b9FxDSBg`,
      method: "GET"
    }).done(function(data) {
      let d = JSON.parse(data).results;
      for (let i of d) {
        let lat = i.geometry.location.lat;
        let lng = i.geometry.location.lng;
        self.usr_lat = lat;
        self.usr_lng = lng;
      }
      self.get_bike_locations();
    });
  }

  //finds the closest bike share to the user
  calc_distances(array) {
    var distlist = {}

    for (var key in array) {
      var lat2 = array[key][0];
      var long2 = array[key][1];
      var t1 = lat2 - this.usr_lat;
      var t2 = long2 - this.usr_lng;

      var dist = Math.abs(t1)+Math.abs(t2);
      distlist[key] = dist;
    }

    var mindist = 9999;

    for (var item in distlist) {
      if (distlist[item] < mindist) {
        mindist = distlist[item];
        var minkey = item;
      }
    }

    this.min_lat = array[minkey][0];
    this.min_lng = array[minkey][1];

    this.create_map(minkey);
  }

  //makes the map with user's location and location of nearest bike share
  create_map(minkey) {
    let self = this;
    var closest_bikes = {lat: this.min_lat, lng: this.min_lng};
    var map = new google.maps.Map(document.getElementById('map'), {
      zoom: 12,
      center: closest_bikes
    });
    var marker = new google.maps.Marker({
      position: closest_bikes,
      map: map
    });
    var user_marker = new google.maps.Marker({
      position: {lat: this.usr_lat, lng: this.usr_lng},
      map: map,
      icon: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'
    });
    google.maps.event.addListener(marker, 'click', function() {
      self.get_network(minkey, map) });
  }

  //once you click on the marker for the bike share location, this adds markers for each bike rack in the bike share
  // it also adds textboxes to each marker that pop up when you click on the marker
  get_network(id, googlemap) {
    $.ajax({
      url: `http://localhost:5000/proxy/getnetwork?${id}`,
      method: "GET"
    }).done(function(data) {
      let d = JSON.parse(data).network.stations;
      for (let i of d) {
        var date  = i.timestamp.split("T")[0];
        var time = i.timestamp.split("T")[1].split("Z")[0];

        var contentString = "<h6>" + "Name : </h6> <p>" + `${i.name}`
          + "</p> <h6> Free Bikes: </h6> <p>" + `${i.free_bikes}`
          + "</p> <h6>Empty Slots:</h6> <p>" + `${i.empty_slots}`
          + "</p>" + "<h6>Last updated: </h6>" + "<p> Date:   " + date + "   Time:   " + time + "</p>";

        var marker = new google.maps.Marker({
          position: {lat: i.latitude, lng: i.longitude},
          map: googlemap,
          icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
        });
        var infowindow = new google.maps.InfoWindow();
        bindInfoWindow(marker, googlemap, infowindow, contentString);
      }
    });
  }

}

//makes the textbox pop up when you click on the marker for a bike rack
function bindInfoWindow(marker, map, infowindow, html) {
    marker.addListener('click', function() {
      infowindow.setContent(html);
      infowindow.open(map, this);
    });
}


var bikeshare = new BikeShare;
