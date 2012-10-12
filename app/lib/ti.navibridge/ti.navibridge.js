/**
 * The NaviBridge module allows developers to send POI (point of interest) locations to the NaviBridge application, which can then send
 * the location to a Denso in-dash display unit.
 *
 * Developers must register for a key ("Application ID") to authenticate calls to the NaviBridge system:
 *		Japan:
 *			Register: https://navicon.denso.co.jp/navicon_download/
 *			iOS Application: http://itunes.apple.com/jp/app/navicon-kanabi-lian-xie/id368186022?mt=8
 *		US:
 *			Register: http://www.globaldenso.com/en/products/aftermarket/navibridge/index.html
 *
 * All coordinates must be passed to NaviBridge as a decimal. NaviBridge uses the WGS84 datum with the following range limitations:
 *		-90.0 < lat < 90.0
 *		-180.0 <= lng <= 180.0
 */

var NAVIBRIDGE = (function() {
	Ti.API.trace("NAVIBRIDGE module initiated");

	/** Do not modify these values */
	var API = {
		Version: "1.3",
		URLBase: "navicon://",
		Install: {
			iOS: "http://itunes.apple.com/us/app/navibridge/id498898448?mt=8",
			Android: "http://appcappstore.s3.amazonaws.com/navibridge/NaviBridge_Appcelerator_test_v3.3f.apk"
		},
		ApplicationId: null,
		Platform: Ti.Platform.osname === "iphone" || Ti.Platform.osname ==="ipad" ? "ios" : Ti.Platform.osname == "android" ? "android" : "mobileweb"
	};

	/**
	 * Sets the Denso-approved Application ID to authenticate NaviBridge calls
	 * @param {String} _id The Application ID provided by Denso
	 */
	API.setApplicationId = function(_id) {
		Ti.API.trace("NAVIBRIDGE.setApplicationId()");

		if(API.isDefined(_id)) {
			API.ApplicationId = _id;
		}
	};

	/**
	 * Legacy support
	 * @deprecated
	 */
	API.SetApplicationID = function(_id) {
		Ti.API.info("NAVIBRIDGE.SetApplicationID() is deprecated; use NAVIBRIDGE.setApplicationId()");

		API.setApplicationId(_id);
	};

	/**
	 * Opens the NaviBridge application on the user device, or installs NaviBridge if necessary
	 */
	API.openNavi = function() {
		Ti.API.trace("NAVIBRIDGE.openNavi()");

		if(API.checkInstall()) {
			Ti.Platform.openURL(API.URLBase);
		} else {
			Ti.API.error("NaviBridge is not installed");

			API.installNavi();
		}
	};

	/**
	 * Determines if the NaviBridge application is installed on the user device
	 */
	API.checkInstall = function() {
		Ti.API.trace("NAVIBRIDGE.checkInstall()");

		if(Ti.Platform.canOpenURL(API.URLBase)) {
			return true;
		} else {
			return false;
		}
	};

	/**
	 * Promps the user to install the NaviBridge application on their device
	 */
	API.installNavi = function() {
		Ti.API.trace("NAVIBRIDGE.installNavi()");

		if(!API.checkInstall()) {
			var alert = Ti.UI.createAlertDialog({
				title: "NaviBridge Not Installed",
				message: "This action requires you install the NaviBridge application",
				buttonNames: [ "OK", "Cancel" ],
				cancel: 1
			});

			alert.addEventListener("click", function(_event) {
				if(_event.index === 0) {
					var installURL;

					switch(API.Platform) {
						case "ios":
							installURL = API.Install.iOS;
							break;
						case "android":
							installURL = API.Install.Android;
							break;
						case "mobileweb":
							Ti.API.error("NaviBridge not available for mobile web");
							return;
							break;
					}

					Ti.API.info("Installing NaviBridge application");

					Ti.Platform.openURL(installURL);
				} else {
					Ti.API.info("User aborted NaviBridge installation");
				}
			});

			alert.show();
		} else {
			Ti.API.info("NaviBridge is already installed");
		}
	};

	/**
	 * Adds a POI (point of interest) waypoint to the NaviBridge application
	 * @param {Object} _poi The POI object (see dictionary definition below)
	 * @param {String|Number} _poi.lat The longitude for the POI (must exist if no 'address')
	 * @param {String|Number} _poi.lon The latitude for the POI (must exist if no 'address')
	 * @param {String} _poi.address The address for the POI (must exist if no 'lat'/'lon')
	 * @param {String|Number} _poi.radiusKM The map zoom radius in KM (has priority over radiusMI) (optional)
	 * @param {String|Number} _poi.radiusMI The map zoom radius in MI (optional)
	 * @param {String} _poi.title The title text for the POI pin within NaviBridge (optional)
	 * @param {String|Number} _poi.tel The telephone number for the POI [0-9+*#](optional)
	 * @param {String} _poi.text A message to display on the in-dash screen after sending data to NaviBridge (optional)
	 * @param {Function} _poi.callbackURL The callback URL for the application sending data to NaviBridge (optional)
	 * @return {Bool} Returns false on error
	 */
	API.addPOI = function(_poi) {
		Ti.API.trace("NAVIBRIDGE.addPOI()");

		if(API.checkInstall()) {
			if(typeof _poi === "object" && _poi !== null) {
				if((!API.isDefined(_poi.lat) || !API.isDefined(_poi.lon)) && !API.isDefined(_poi.addr)) {
					Ti.API.error("POI object must have 'lat' and 'lon' properties, or 'addr' property");

					return false;
				} else {
					var appURL = API.URLBase + "setPOI?ver=" + API.Version;

					if(API.isDefined(_poi.lat) && API.isDefined(_poi.lon)) {
						appURL += API.appendURL("ll", _poi.lat + "," + _poi.lon);
					}

					appURL += API.appendURL("addr", _poi.address);
					appURL += API.appendURL("appName", API.ApplicationId);
					appURL += API.appendURL("title", _poi.title);
					appURL += API.appendURL("radKM", _poi.radiusKM);
					appURL += API.appendURL("radML", _poi.radiusMI);
					appURL += API.appendURL("tel", _poi.tel);
					appURL += API.appendURL("text", _poi.text);
					appURL += API.appendURL("callURL", _poi.callbackURL);

					Ti.API.info(appURL);

					Ti.Platform.openURL(appURL);
				}
			} else {
				Ti.API.error("Incorrect POI data type given (or null)");

				return false;
			}
		} else {
			Ti.API.error("NaviBridge is not installed");

			API.installNavi();

			return false;
		}
	};

	/**
	 * Adds multiple POI (point of interest) waypoints to the NaviBridge application
	 * @param {Object} _object An object of POIs and meta-data
	 * @param {Array} _object.poi An array of POIs [max. 5] including lat, lon, address, title, & tel (see "addPOI()" method documentation for definitions)
	 * @example
	 * 	{
	 * 		poi: [
	 * 			{
	 * 				lat: x, lon: x, address: x, title: x, tel: x
	 * 			},
	 * 			{
	 * 				lat: x, lon: x, address: x, title: x, tel: x
	 * 			},
	 * 		],
	 * 		callbackURL: "schema://",
	 * 		text: "POI added successfully"
	 * 	}
	 */
	API.addMultiPOI = function(_object) {
		Ti.API.trace("NAVIBRIDGE.addMultiPOI()");

		if(API.checkInstall()) {
			if(typeof _object === "object" && _object !== null) {
				if(API.isDefined(_object.poi)) {
					if(_object.poi.length > 5) {
						Ti.API.info("Too many POI items provided; limiting to 5");
					}

					var length = _object.poi.length > 5 ? 5 : _object.poi.length;

					var appURL = API.URLBase + "setMultiPOI?ver=" + API.Version;

					appURL += API.appendURL("appName", API.ApplicationId);

					for(var i = 0; i < length; i++) {
						var poi = _object.poi[i];

						if(API.isDefined(poi.lat) && API.isDefined(poi.lon)) {
							appURL += API.appendURL("ll" + (i + 1), poi.lat + "," + poi.lon);
						}

						appURL += API.appendURL("addr" + (i + 1), poi.address);
						appURL += API.appendURL("title" + (i + 1), poi.title);
						appURL += API.appendURL("tel" + (i + 1), poi.tel);
					}


					appURL += API.appendURL("text", _object.text);
					appURL += API.appendURL("callURL", _object.callbackURL);

					Ti.API.info(appURL);

					Ti.Platform.openURL(appURL);
				} else {
					Ti.API.error("No POIs found");

					return false;
				}
			} else {
				Ti.API.error("Incorrect POI data type given (or null)");

				return false;
			}
		} else {
			Ti.API.error("NaviBridge is not installed");

			API.installNavi();

			return false;
		}
	};

	/**
	 * Appends a value to a URL string
	 * @param {String} _key The key for the item
	 * @param {String} _value The value for the item
	 */
	API.appendURL = function(_key, _value) {
		if(API.isDefined(_value)) {
			return "&" + _key + "=" + _value;
		} else {
			return "";
		}
	};

	/**
	 * Verifies a value is defined and is not null
	 * @param _value The value to check
	 */
	API.isDefined = function(_value) {
		if(typeof _value !== "undefined" && _value !== null) {
			return true;
		} else {
			return false;
		}
	};

	return API;
})();

module.exports = NAVIBRIDGE;