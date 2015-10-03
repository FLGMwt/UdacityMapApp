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
    };

    ko.applyBindings(new MapAppViewModel());
});