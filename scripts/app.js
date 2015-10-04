window.onresize = function() {
	var mainContent = document.getElementById("main-content");

};

var map;
var infoWindow;
function closeInfo() {
	if (infoWindow) {
		infoWindow.close();
	};
}
var initialPlaces = [
	{
		name: "Cloud Gate",
		position: { lat: 41.882663, lng: -87.623306 }
	},
	{
		name: "Willis Tower",
		position: {lat: 41.878888, lng: -87.635910 }
	},
	{
		name: "Civic Opera House",
		position: { lat: 41.882571, lng: -87.637391 }
	},
	{
		name: "Buckingham Fountain",
		position: { lat: 41.875776, lng: -87.619003 }
	},
	{
		name: "Museum of Contemporary Art Chicago",
		position: { lat: 41.897179, lng: -87.621447 }
	},
	{
		name: "Navy Pier",
		position: { lat: 41.891640, lng: -87.608705 }
	},
	{
		name: "The Art Institute of Chicago",
		position: { lat: 41.879585, lng: -87.622898 }
	},
	{
		name: "Shedd Aquarium",
		position: { lat: 41.867571, lng: -87.614061 }
	},
	{
		name: "Adler Planetarium",
		position: { lat: 41.866322, lng: -87.606772 }
	}
];

var timeout = window.setTimeout(function(){
	console.log('error things')
}, 1500);

function initMap() {
	map = new google.maps.Map(document.getElementById('map'), {
		center: {lat: 41.866205, lng: -87.606826 },
		zoom: 12
	});

	map.addListener('click', closeInfo);

	window.clearTimeout(timeout);

	initializeApp();
}

var oauth = OAuth({
    consumer: {
        public: 'CONSUMERPUBLIC',
        secret: 'CONSUMERSECRET'
    },
    signature_method: 'HMAC-SHA1'
});

var token = {
    public: 'TOKENPUBLIC',
    secret: 'TOKENSECRET'
};

function getInfoContent(place) {

	return '<h1>hello whirld, at ' + place.name + '</h1>';
}

function initializeApp() {
	function initializePlace(place) {
		var marker = new google.maps.Marker({
			position: place.position,			
    		animation: google.maps.Animation.DROP,
			map: map
		});

		var infoWindowContent = getInfoContent(place);
		function showInfoWindow() {
			closeInfo();
			infoWindow = new google.maps.InfoWindow({
				content: infoWindowContent
			});
			marker.setAnimation(google.maps.Animation.BOUNCE);
			window.setTimeout(function() {
				marker.setAnimation(null);
			}, 1440);
			infoWindow.open(map, marker);
		}
		marker.addListener('click', showInfoWindow);

		place.marker = marker;
		place.showMarker = showInfoWindow;
	}

	function getInitialPlaces(places) {
		places.forEach(initializePlace);
		return places;
	}

    function MapAppViewModel(initialPlaces) {
        var self = this;

        self.places = ko.observableArray(getInitialPlaces(initialPlaces));

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
	    	self.places().forEach(function(place, i) {
	    		var matchingFilteredPlace = ko.utils.arrayFirst(self.filteredPlaces(), function(filteredPlace) {
		            return filteredPlace.name === place.name;
	    	    });
	    	    if (matchingFilteredPlace === null) {
	    	    	closeInfo();
	    	    	place.marker.setMap(null);	    	    	
	    	    } else if (place.marker.map === null) {
	    	    	place.marker.setMap(map);
	    	    	place.marker.setAnimation(google.maps.Animation.DROP);
	    	    }
	    	});
	    })
    };

    ko.applyBindings(new MapAppViewModel(initialPlaces));
}