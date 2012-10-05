// Pull in the core app singleton
var APP = require("core");

// Make sure we always have a reference to global elements throughout the app singleton
APP.GlobalWrapper = $.GlobalWrapper;

// Open the main window
APP.GlobalWrapper.open();

// Start the app
APP.init();

// The initial screen to show
APP.handleNavigation({
	controller: "home"
});