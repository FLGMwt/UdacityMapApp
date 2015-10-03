document.addEventListener("DOMContentLoaded", function() {
    function MapAppViewModel() {
        var self = this;

        var initialPlaces = [{
            name: "Cloud Gate"
        }, {
            name: "Willis Tower"
        }, {
            name: "Civic Opera House"
        }];

        self.places = ko.observableArray(initialPlaces);

        self.searchTerm = ko.observable('');

	    self.filteredPlaces = ko.computed(function() {
	    	if (!self.searchTerm()) { 
	    		return self.places(); 
	    	}

	    	var filter = self.searchTerm().toLowerCase();
	    	return ko.utils.arrayFilter(self.places(), function(place) {
	    		return place.name.toLowerCase().indexOf(filter) !== -1;
	    	});
	    });
    };


    ko.applyBindings(new MapAppViewModel());
});

var map;
function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: -34.397, lng: 150.644},
    zoom: 8
  });
}