var Alloy = require("alloy");

/**
 * Main app singleton
 * @type {Object}
 */
var APP = {
	/**
	 * Keeps track of the current screen controller
	 * @type {Object}
	 */
	currentController: null,
	/**
	 * Keeps track of the current screen controller
	 * @type {String}
	 */
	currentControllerId: null,
	/**
	 * The detail controller
	 * @type {Object}
	 */
	detailController: null,
	/**
	 * The global view all screen controllers get added to
	 * @type {Object}
	 */
	GlobalWrapper: null,
	/**
	 * Yelp handle (uses OAuth)
	 */
	Yelp: require("jsOAuth").OAuth({
		consumerKey : "rs7TEh2KCZD1F92432YBgw",
		consumerSecret : "3zZuKJ02j8ZLOBV0lN-alOpQhpk",
		accessTokenKey : "dnVL6qE6-ToQcPbDxmhXhv2Tkylx7U1n",
		accessTokenSecret : "FGq9kzrlKdWOX6df_srw7zBrqmE",
	}),
	/**
	 * NaviBridge library
	 */
	NaviBridge: require("ti.navibridge/ti.navibridge"),
	/**
	 * Sets up the app singleton and all it's child dependencies
	 * NOTE: This should only be fired in index controller file and only once.
	 */
	init: function() {
		// Global system Events
		Ti.Network.addEventListener("change", APP.networkObserverUpdate);
		Ti.App.addEventListener("pause", APP.exit);
		Ti.App.addEventListener("close", APP.exit);
		Ti.App.addEventListener("resumed", APP.resume);
		
		// Set up NaviBridge library
		APP.NaviBridge.SetApplicationID("ICiAV4Ay");
	},
	/**
	 * Global event handler to change screens
	 * @param  {Object} _params Params for this navigation event
	 * @example
	 * {
	 * 		controller: String The controller name to load
	 * }
	 */
	handleNavigation: function(_params) {
		if(_params.controller) {
			// Requesting same screen as we're on
			if(_params.controller == APP.currentControllerId) {
				// Do nothing
			} else {
				APP.currentControllerId = _params.controller;
				
				// Remove current controller view
				APP.removeCurrentScreen(function() {
					// Create the new screen controller
					APP.currentController = Alloy.createController( _params.controller, _params );
					
					// Add the new screen to the window
					APP.GlobalWrapper.add( APP.currentController.wrapper );
				});
			}
		} else {
			if(!_params.controller) {
				Ti.API.error("APP.handleNavigation() - Controller is undefined");
			}
		}
	},
	/**
	 * Global function to remove screens
	 * @param {Function} _callback
	 */
	removeCurrentScreen: function(_callback) {
		if(APP.currentController) {
			APP.GlobalWrapper.remove(APP.currentController.wrapper);
			APP.currentController = null;
		}

		if(typeof(_callback) !== "undefined") {
			_callback();
		}
	},
	/**
	 * Global network event handler
	 * @param  {Object} _event Standard Ti callback
	 */
	networkObserverUpdate: function(_event) {

	},
	/**
	 * Exit event observer
	 */
	exit: function() {

	},
	/**
	 * Resume event observer
	 */
	resume: function() {

	}
};

module.exports = APP;