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

// Show an error message if google maps doesn't respond for a bit
var errorTimeout = window.setTimeout(function(){
	var map = document.getElementById('map');
	map.innerHTML = "<h1>Whoops! Looks like we can't reach Google Maps. Sorry about that!</h1>";
	map.style['padding-left'] = '10px';
	var list = document.getElementById('place-list');
	list.style.display = 'none';
}, 1500);

function initMap() {
	map = new google.maps.Map(document.getElementById('map'), {
		center: {lat: 41.878205, lng: -87.606826 },
		zoom: 13
	});

	// close the info window any time the map is clicked
	map.addListener('click', closeInfo);

	// clear error timeout if google maps comes back okay
	window.clearTimeout(errorTimeout);

	initializeApp();
}

function getInfoContent(place) {

	$.get("http://api.nytimes.com/svc/search/v2/articlesearch.json", {
		"api-key": "APIKEY"
		, "q": place.name 
	})
	.done(function(data) {
		// Build up a bit of html to show up inside the info window
		place.infoWindowContent = '<h3>Latest Stories About ' + place.name + '</3>';
		var docs = data.response.docs;
		// Limit articles to 4 to prevent crowding
		for (var i = 0; i < docs.length && i < 4; i++) {
			var doc = docs[i];
			// The print headline is usually more concise, use that if available
			var title = doc.headline.print_headline || doc.headline.main;
			// if we're in a small browser, show a snippet of the title
			if (window.innerWidth < 450) {
				title = title.substring(0, 26) + '...';
			};
			place.infoWindowContent += '<p><a href="' + doc.web_url + '">' + title + '</a></p>';
		}
	})
	.fail(function(data) {
		place.infoWindowContent = '<p>Oh no! Looks like we couldn\'t reach the New York Times to find news. Try <a href="http://www.nytimes.com/">their website.</a></p>';
	});

	return '<h1>hello whirld, at ' + place.name + '</h1>';
}

function initializeApp() {
    // Add some map-related properties to the static data now that we know we have the maps API
	function initializePlace(place) {
		var marker = new google.maps.Marker({
			position: place.position,			
    		animation: google.maps.Animation.DROP,
			map: map
		});
		// Info window content is set asynchronously, but here's some default text
		place.infoWindowContent = "Loading...";
		getInfoContent(place);

		function showInfoWindow() {
			closeInfo();
			infoWindow = new google.maps.InfoWindow({
				content: place.infoWindowContent
			});
			// When the info window gets enabled, do an animation that lasts 1440 ms
			marker.setAnimation(google.maps.Animation.BOUNCE);
			window.setTimeout(function() {
				marker.setAnimation(null);
			}, 1440);
			infoWindow.open(map, marker);
		}
		marker.addListener('click', showInfoWindow);
		place.showMarker = showInfoWindow;

		place.marker = marker;		
	}

	function getInitialPlaces(places) {
		places.forEach(initializePlace);
		return places;
	}

    function MapAppViewModel(initialPlaces) {
        var self = this;
        
        self.places = ko.observableArray(getInitialPlaces(initialPlaces));

        self.searchTerm = ko.observable('');

        // filteredPlaces drives the list and is all the places that match the search term, case-insensitive
	    self.filteredPlaces = ko.computed(function() {
	    	if (!self.searchTerm()) { 
	    		return self.places();
	    	}
	    	var filter = self.searchTerm().toLowerCase();
	    	return ko.utils.arrayFilter(self.places(), function(place) {
	    		return place.name.toLowerCase().indexOf(filter) !== -1;
	    	});
	    });

	    // Whenever the value of filteredPlaces changes, we need to update the map to show the right markers
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
	    });

	    // Show a toggle button when the device screen is small
	    var smallDevice = window.innerWidth < 450;

	    self.showToggleButton = smallDevice;
	    self.showPlaceList = ko.observable(!smallDevice);

	    self.togglePlacesList = function() {
	    	self.showPlaceList(!self.showPlaceList());
	    };
    };

    // initialPlaces are static to the ViewModel, but could be generated on load from an API 
    // and passed in here if desired
    ko.applyBindings(new MapAppViewModel(initialPlaces));
}