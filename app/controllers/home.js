// Controller dependencies
var APP = require("core");

// Set up variables
$.detailsVisible = false;
$.location = null;
$.results = null;
$.pinSelectionChanged = false;

// Geolocation settings
Ti.Geolocation.accuracy = Ti.Geolocation.ACCURACY_BEST;
Ti.Geolocation.distanceFilter = 100;
Ti.Geolocation.purpose = "Geo-Location";

/**
 * Creates the category icon event listeners
 */
$.createIcons = function() {
	var icons = [
		$.iconCoffee,
		$.iconGas,
		$.iconFood,
		$.iconBar,
		$.iconActive,
		$.iconArt
	];
	
	// Adds event listeners to each icon
	for(var i = 0; i < icons.length; i++) {
		icons[i].addEventListener("click", function(_event) {
			$.getDataPoints(_event.source.category);
			$.highlightActiveIcon(_event.source.id);
		});
	}
};

/**
 * Highlights the selected icon, de-selects the others
 * @param {String} _id The ID of the selected icon
 */
$.highlightActiveIcon = function(_id) {
	var icons = [
		{ id: "iconCoffee", element: $.iconCoffee },
		{ id: "iconGas", element: $.iconGas },
		{ id: "iconFood", element: $.iconFood },
		{ id: "iconBar", element: $.iconBar },
		{ id: "iconActive", element: $.iconActive },
		{ id: "iconArt", element: $.iconArt }
	];
	
	for(var i = 0; i < icons.length; i++) {
		// Check if it's the selected icon
		if(icons[i].id == _id) {
			// Is the selected icon
			icons[i].element.image = "/images/icon/" + icons[i].id + "Active.png";
			
			if(OS_IOS) {
				// Move the underline selection indicator
				var animation = Ti.UI.createAnimation({
					left: (18 + (i * 47)) + "dp",
					duration: 500
				});
				
				$.underline.animate(animation);
			}
		} else {
			// Is NOT the selected icon
			icons[i].element.image = "/images/icon/" + icons[i].id + ".png";
		}
	}
};

/**
 * Retrieves the data set for the specified category from Yelp
 * @param {Object} _category The Yelp category to filter on
 */
$.getDataPoints = function(_category) {
	// See if we have a user location
	if($.location !== null) {
		var args = {
			url: "http://api.yelp.com/v2/search?category_filter=" + _category + "&limit=10&sort=1&ll=" + $.location.latitude + "," + $.location.longitude + "," + $.location.accuracy + "," + $.location.altitude + "," + $.location.altitudeAccuracy,
			success: $.handleYelpResponse,
			failure: function(_data) {
				alert("Request has failed");
			}
		};
		
		// Send out the Yelp OAuth-ed request
		APP.Yelp.get(args.url, args.success, args.failure);
	} else {
		// Get the user location if we don't have it
		Ti.Geolocation.getCurrentPosition(function(_data) {
			// Save the user location
			$.location = _data.coords;
			
			// Call this same method (getDataPoints) again, now with location!
			$.getDataPoints(_category);
		});
	}
};

/**
 * The "success" callback for Yelp API calls
 * @param {Object} _data The Yelp API response
 */
$.handleYelpResponse = function(_data) {
	_data = JSON.parse(_data.text);
	
	// Remove all existing annotations
	$.map.removeAllAnnotations();
	
	// See if we have any valid business results
	if(_data.total == 0) {
		var alert = Ti.UI.createAlertDialog({
			ok: "OK",
			message: "No results found",
			title: "Sorry!"
		});
		
		alert.show();
	} else {
		// Save the results
		$.results = _data.businesses;
		
		// Loop through each business, add to the map
		for(var i = 0; i < _data.businesses.length; i++) {
			var business = _data.businesses[i];
			
			// Keep track of the index for click event use
			business.index = i;
			
			// Make sure the business isn't closed for good
			if(business.is_closed === false) {
				$.addBusinessToMap(business);
			}
		}
		
		// Re-center and re-zoom the map based on the results (thanks, Yelp, for this nifty data!)
		$.map.setLocation({
			latitude: _data.region.center.latitude,
			longitude: _data.region.center.longitude,
			latitudeDelta: _data.region.span.latitude_delta,
			longitudeDelta: _data.region.span.longitude_delta,
			animate: true
		});
	}
};

/**
 * Adds an annotation to the map for a business
 * @param {Object} _data The business data
 */
$.addBusinessToMap = function(_data) {
	var annotation = Ti.Map.createAnnotation({
		animate: false,
		draggable: false,
		latitude: _data.location.coordinate.latitude,
		longitude: _data.location.coordinate.longitude,
		title: _data.name,
		index: _data.index,
		pincolor: Ti.Map.ANNOTATION_RED,
	});
	
	$.map.addAnnotation(annotation);
};

/**
 * Opens the details pane with business information
 * @param {Object} _data The business data
 */
$.showDetails = function(_data) {
	// Keep track of the current business
	$.currentBusiness = _data;
	
	// Set all the data to the appropriate labels/views
	$.detailName.text = _data.name;
	$.detailDistance.text = (Math.round((_data.distance / 1609.344) * 10) / 10) + "mi";
	$.detailAddress1.text = _data.location.display_address[0];
	$.detailAddress2.text = _data.location.display_address[1];
	$.detailPhone.text = $.formatPhone(_data.phone);
	
	// Create the Yelp rating stars
	for(var i = 0; i < Math.round(_data.rating); i++) {
		var star = Ti.UI.createImageView({
			top: 0,
			left: 0,
			width: "10dp",
			height: "10dp",
			image: "/images/star.png"
		});
		
		$.starContainer.add(star);
	}
	
	// See if the details pane is already open
	if(!$.detailsVisible) {
		// If not, animate it into view
		$.detailsVisible = true;
		
		var animation = Ti.UI.createAnimation({
			top: "103dp",
			duration: 500
		});
		
		animation.addEventListener("complete", function(_event) {
			$.details.top = "103dp";
		});
		
		$.details.animate(animation);
	}
};

/**
 * Closes the details pane
 */
$.hideDetails = function() {
	// See if the details pane is already open
	if($.detailsVisible) {
		// If so, close it
		$.detailsVisible = false;
		
		var animation = Ti.UI.createAnimation({
			top: "-52dp",
			duration: 500
		});
		
		animation.addEventListener("complete", function(_event) {
			$.details.top = "-52dp";
		});
		
		$.details.animate(animation);
	}
};

/**
 * Formats a phone number e.g. (555) 555-5555
 * @param {Object} _number The number to format
 */
$.formatPhone = function(_number) {
    var regex = /^(?:\+?1[-. ]?)?(?:\(?([0-9]{3})\)?[-. ]?)?([0-9]{3})[-. ]?([0-9]{4})$/;
   
    if(regex.test(_number)) {
        var parts = _number.match(regex);
        var phone = "";
        
        if(parts[1]) {
        	phone += "(" + parts[1] + ") ";
        }
        
        phone += parts[2] + "-" + parts[3];
        
        return phone;
    } else {
        return _number;
    }
}

// Add an event listener to the map
$.map.addEventListener("click", function(_event) {
	// See if we clicked on a pin or the map
	if(_event.clicksource === null) {
		// We clicked on the map
		
		// This is to combat the stupid "null" then "pin" clicksource issue
		// See if we receive a "pin" click immediately after "null" click, aka going from one pin to another
		$.pinSelectionChanged = false;
		
		setTimeout(function() {
			if(!$.pinSelectionChanged) {
				// Hide the details pane (we unselected a pin)
				$.hideDetails();
			}
			
			$.pinSelectionChanged = false;
		}, 250);
	} else {
		$.pinSelectionChanged = true;
		
		// Show the details pane
		$.showDetails($.results[_event.annotation.index]);
		
		// Push the pin down on the map so it's visible below the details pane (that's what the "/ 2" is for)
		$.map.setLocation({
			latitude: OS_IOS ? _event.annotation.latitude + ($.map.longitudeDelta / 2) : _event.annotation.latitude,
			longitude: _event.annotation.longitude,
			latitudeDelta: OS_IOS ? $.map.latitudeDelta : 0.04,
			longitudeDelta: OS_IOS ? $.map.longitudeDelta : 0.04,
			animate: true
		});
		Ti.API.info("Leaving!");
	}
});

// Add an event listener to the "Add to GPS" button
$.addButton.addEventListener("click", function(_event) {
	// Add the business location to the GPS unit
	APP.NaviBridge.addPOI({
		lat: $.currentBusiness.location.coordinate.latitude,
		lon: $.currentBusiness.location.coordinate.longitude
	});
});

// Add an event listener for the phone number
$.detailPhone.addEventListener("click", function(_event) {
	// Offer to call the phone number
	Ti.Platform.openURL("tel:" + _event.source.text);
});

// Add an event listener for geolocation updates
Ti.Geolocation.addEventListener("location", function(_data) {
	// Save the location of the user
	$.location = _data.coords;
	
	// Re-center the map based on the user location
	$.map.setLocation({
		latitude: _data.coords.latitude,
		longitude: _data.coords.longitude,
		latitudeDelta: $.map.latitudeDelta ? $.map.latitudeDelta : 0.04,
		longitudeDelta: $.map.longitudeDelta ? $.map.longitudeDelta : 0.04,
		animate: true
	});
});

// Creates the category icons
$.createIcons();

// Runs the app with a default search for nearby coffee shops
$.getDataPoints("coffee");