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

function getInfoContent(place) {
	$.get("http://api.nytimes.com/svc/search/v2/articlesearch.json",
		{ "api-key": "APIKEY", "q": place.name })
		.done(function(data) {
			// Build up a bit of html to show up inside the info window
			place.infoWindowContent = '<h3>Latest Stories About ' + place.name + '</3><ul>';
			var docs = data.response.docs;
			// Limit articles to 4 to prevent crowding
			for (var i = 0; i < docs.length && i < 4; i++) {
				var doc = docs[i];
				// The print headlin is usually more concise, use that if available
				var title = doc.headline.print_headline || doc.headline.main;
				place.infoWindowContent += '<li><a href="' + doc.web_url + '">' + title + '</a></p>';
			}
			place.infoWindowContent += '</ul>';
		})
		.fail(function(data) {
			place.infoWindowContent = '<p>Oh no! Looks like we couldn\'t reach the New York Times to find news. Try <a href="http://www.nytimes.com/">their website.</a></p>';
		});

	return '<h1>hello whirld, at ' + place.name + '</h1>';
}

function initializeApp() {
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
        // Add some map-related properties to the static data now that we know we have the maps API
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
	    })
    };

    ko.applyBindings(new MapAppViewModel(initialPlaces));
}