var map;
var markers = [];
var initialPlaces = [
	{ name: "Cloud Gate", lat: 41.882663, lng: -87.623306 },
	{ name: "Willis Tower", lat: 41.878888, lng: -87.635910 },
	{ name: "Civic Opera House", lat: 41.882571, lng: -87.637391 },
	{ name: "Buckingham Fountain", lat: 41.875776, lng: -87.619003 },
	{ name: "Museum of Contemporary Art Chicago", lat: 41.897179, lng: -87.621447 },
	{ name: "Navy Pier", lat: 41.891640, lng: -87.608705 },
	{ name: "The Art Institute of Chicago", lat: 41.879585, lng: -87.622898 },
	{ name: "Shedd Aquarium", lat: 41.867571, lng: -87.614061 },
	{ name: "Adler Planetarium", lat: 41.866322, lng: -87.606772 },
];

function initMap() {
	map = new google.maps.Map(document.getElementById('map'), {
		center: {lat: 41.866205, lng: -87.606826 },
		zoom: 12
	});
	for (var i = 0; i < initialPlaces.length; i++) {
		var marker = new google.maps.Marker({
			position: initialPlaces[i],			
    		animation: google.maps.Animation.DROP,
			map: map
		});
		markers.push(marker);
	}
}

document.addEventListener("DOMContentLoaded", function() {
    function MapAppViewModel(initialPlaces) {
        var self = this;

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

	    self.filteredPlaces.subscribe(function(newValue) {
	    	for (var i = 0; i < initialPlaces.length; i++) {
	    		var thisInitialPlace = initialPlaces[i];
	    		var matchingFilteredPlace = ko.utils.arrayFirst(self.filteredPlaces(), function(place) {
		            return place.name === thisInitialPlace.name;
	    	    });
	    	    if (matchingFilteredPlace === null) {
	    	    	markers[i].setMap(null);
	    	    } else if (markers[i].map === null) {
	    	    	markers[i].setMap(map);
	    	    	markers[i].setAnimation(google.maps.Animation.DROP);
	    	    }
	    	}
	    })
    };

    ko.applyBindings(new MapAppViewModel(initialPlaces));	
});