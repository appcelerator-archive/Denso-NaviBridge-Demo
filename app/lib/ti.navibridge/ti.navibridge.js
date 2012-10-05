
var NAVIBRIDGE = (function() {
  	
  	var API = {};
  	API.isIOS = (Ti.Platform.osname === 'iphone' || Ti.Platform.osname ==='ipad' )? true : false;
	
  	API.ApplicationID = "tjKEEUqB";//"DEADBEEF";ICiAV4Ay
  	API.ver = "1.4";
  	
  	API.URLschemeBASE = "navicon://"; //fb://<insert function here>"
	API.installIPhone = "http://itunes.apple.com/us/app/navibridge/id498898448?mt=8";
	API.installAndroid = "http://appcappstore.s3.amazonaws.com/navibridge/NaviBridge_Appcelerator_test_v3.3f.apk";
	
	// NaviCon: navicon://setPOI?ver=1.3&ll=38.270348,140.871357&appName=ICiAV4Ay
	
	/*
	README.MD
		The navibridge Module allows developers to send "Points Of Interest" Locations the the NaviBridge application and Denos In Dash Display
		
		Developers must register for a key to talk with the naviBridge system:
			Japanes Register ... Key ( navicon )
			https://navicon.denso.co.jp/navicon_download/
			jp install url jp install: http://itunes.apple.com/jp/app/navicon-kanabi-lian-xie/id368186022?mt=8
			
			Navi Bridge US site:
			http://www.globaldenso.com/en/products/aftermarket/navibridge/index.html
			
	================================================
			ver=(ver)
			Scheme’s Version This parameter is used in NaviCon’s internal processing.. The decimal number needs to be set to this parameter. If this parameter is blank or undefined, an error will occur. 
	================================================
			ll=(lat)
			(lng) Coordinates (lat., lng.) This parameter is used to set Pin on NaviCon.  (lat) means latitude[°] and (lng) means longitude[°]. Both of them need to be set with decimal number. Datum is WGS84.【Range】-90.0 ＜ lat ＜ 90.0　　－180.0 ≦ lng ≦ 180.0 If your application set value outside of the range, or either LI (POI Coordinates) or addr (POI Address) is blank, an error will occur.
	========================
			
			addr=(addr)
	Address
	This parameter is used to display address on the POI detail screen on NaviCon.
	Put a blank between names of building and block number, if you would like to set both of them. 
	If this parameter is not set, the address is not displayed on POI detail screen.
	If LI (POI Coordinates) is undefined, POI Coordinates are set via Google API search with this parameter.
	If Both LI (POI Coordinates) and addr (POI Address) are blank or undefined, an error will occur
	========================
	
	appName=(appName)	Application ID/Website ID (*1) 
	This parameter is used NaviCon’s internal processing.
	Smartphone application: Application ID
	Website: Website ID
	If this parameter is blank or undefined, an error will occur.
	Title=(title)	Title.
	This parameter is used to display location name on balloon view and POI detail screen..
	The number of characters is unlimited. However, if it exceeds the display range, those characters beyond that are omitted (Display Range: around 26 one-byte or 13 two-byte letters).
	If this parameter is blank or undefined, “Untitled”.
	* How to omit: Replace excessive letters with “…”.
	radKM=(radKM)	Map Scale（ｋｍ）
	This parameter is used to adjust map scale of NaviCon.
	Specify NaviCon’s map scale with the radius of the circle (KM) centering POI coordinates.
	(redKM) has priority over (redML) if both of them are set.
	Last screen’s scale is used if neither of them is blank or undefined.
	Approximate range can be set with this parameter because map scale is automatically adjusted by Google MAP API.
	【Range】
　	0 < radKM
	If its value of this parameter is larger than the radius of the Earth, it is rounded to 1/2 the circumference of the Earth.
	radML=(radML)	Map Scale（mile）
	This parameter is used to adjust map scale of NaviCon.
	Specify NaviCon’s map scale with the radius of the circle (KM) centering POI coordinates.
	(redKM) has priority over (redML) if both of them are set.
	Last screen’s scale is used if neither of them is blank or undefined.
	Approximate range can be set with this parameter because map scale is automatically adjusted by Google MAP API.
	【Range】
	　0 < radML
	If its value of this parameter is larger than the radius of the Earth, it is rounded to 1/2 the circumference of the Earth.
	tel=(tel)	Phone Number
	This parameter is used to display phone number on the POI detail screen.
	Numbers (0 to 9) and signs (+, *, #) can be set as the parameter (without -).
	If the parameter is blank or undefined, phone number is not displayed. 
	text=(text)	Text
	This parameter is used to display message on pup-up window after starting NaviCon or on POI detail screen. It is used to show optional messages to NaviCon users from your application/website.
	The number of characters is unlimited. However, if it exceeds the display range, those characters beyond that are omitted (Display Range: around 26 one-byte or 13 two-byte letters). 
	If this parameter is blank or undefined, nothing will be displayed.
	* How to omit: Replace excessive letters with “…”.


	========================
	callURL=(callURL)
	URL to invoke your application/web site from NaviCon
	This parameter is used to invoke your application/web site from NaviCon after NaviCon sends POI to car navigation system. Your application can achieve to provide a seamless service to users by using this parameter.
	When NaviCon can’t send POI to car navigation system, NaviCon doesn’t invoke your application/web site. 

	 */
	
	API.SetApplicationID = function(appID) {
		NAVIBRIDGE.ApplicationID = appID;
	}//end authorize
	
	API.openNavi = function() {
		API.fireConsoleEvent( "canOpenURL" + API.URLschemeBASE );
		
		if (Ti.Platform.canOpenURL(API.URLschemeBASE)){
			API.fireConsoleEvent( "App installed, opening app:" + API.URLschemeBASE );
			Ti.Platform.openURL(API.URLschemeBASE);
		}//end if true
		else
		{
			alert("NaviBridge must be Installed on this device!");
			API.fireConsoleEvent( "App not installed, calling install" );
			API.installNavi();
		}//end else
	}//end openNavi
	
	API.installNavi = function() {
		API.fireConsoleEvent( "open install:" + API.installIPhone );
		
		Ti.Platform.openURL(API.installIPhone);
	}//end installNavi
	
	API.addPOI = function( poi ) {
		//var appURL = "navicon://setPOI?ver=1.4&ll=37.38922,-122.048496&appName=ICiAV4Ay&title=Title";
		var appURL = "navicon://setPOI?ver=1.3&ll=37.38922,-122.048496&appName="+API.ApplicationID;
		
		if ( poi != null ){
			
			appURL = "navicon://setPOI?ver=1.3&ll=37.38922,-122.048496&appName="+API.ApplicationID;
			
			if ( poi.lat != null ) {
				if ( poi.lon != null ) {
					appURL = "navicon://setPOI?ver=1.3&ll="+poi.lat+","+poi.lon; 
					
					if ( poi.title != null )
					{
						appURL += "&title=" + poi.title;
						//appURL+= "&title=" + poi.title;
					}
					if ( poi.tel != null )
					{
						appURL += "&tel=" + poi.tel;
						//appURL+= "&tel=" + poi.tel;
					}
					if ( poi.text != null )
					{
						appURL += "&text=" + poi.text;
						//appURL+= "&text=" + poi.text;
					}
					if ( poi.callURL != null )
					{
						appURL += "&callURL=" + poi.callURL;
						//appURL+= "&callURL=" + poi.callURL;
					}//end if callURL
					
					appURL += "&appName="+API.ApplicationID;
				}//end if
			}//end set lat lon
			
			//"&radKM="+"15" +
			//"&addr="+"440 Bernardo Ave Mountain View, CA 94043";
			
		}//end poi
		API.fireConsoleEvent( "addPOI =>"  + appURL );
		
		Ti.Platform.openURL(appURL);
	}//end addPOI
	
	API.addPOIMultiple = function( wayPointArray ) {
		API.fireConsoleEvent( "addPOIMultiple => NOT IMPLIMENTED " );//  + API._URLschemeADDPOI_MULTIPLE );
		Ti.Platform.openURL("navicon://setPOI?ver=1.3&ll=37.38922,-122.048496&appName=ICiAV4Ay");
	}//end addPOIMultiple
	
	API.fireConsoleEvent = function ( notes ) {
		Ti.App.fireEvent('ti.navibridge.admin.console', { message: notes });
	}//end fireConsoleEvent
	
	API.factoryAdminView = function( ) {
		var topView = Ti.UI.createView({ top: 0, height: 600 });
		
		var versionLabel = Ti.UI.createLabel({
				top: 0, left: 0, height: 10,
				color: 'black',
				text:"v" + Titanium.App.getVersion() + " ",
				font: {fontSize: 6}
		});//end versionLabel
		topView.add( versionLabel );
		
		//and the trigger button
		var OpenButton = Ti.UI.createButton({ top:5, title:'Open NaviBridge', height:40, width:200 });
		OpenButton.addEventListener('click', function(){ NAVIBRIDGE.openNavi(); });
		topView.add( OpenButton );
		
		var InstallButton = Ti.UI.createButton({ top:50, title:'Install NaviBridge', height:40, width:200 });
		InstallButton.addEventListener('click', function(){ NAVIBRIDGE.installNavi();  });
		topView.add( InstallButton );
		
		var InsertPOIButton = Ti.UI.createButton({ top:95, title:'Insert POI', height:40, width:200 });
		InsertPOIButton.addEventListener('click', function(){ NAVIBRIDGE.addPOI({ lat:37.38922, lon:-122.048496});  });
		//InsertPOIButton.addEventListener('click', function(){ NAVIBRIDGE.addPOI({lat:"37.38922", lon:"-122.048496",text:"Appc" });  });
		topView.add( InsertPOIButton );
		
		var InsertPOIArrayButton = Ti.UI.createButton({ top:140, title:'Insert Multiple POIs', height:40, width:200 });
		InsertPOIArrayButton.addEventListener('click', function(){ NAVIBRIDGE.addPOIMultiple(
				{lat:"37.38922", lon:"-122.048496", title:"Appc"},
				{lat:"37.38922", lon:"-122.048496", title:"Appc"},
				{lat:"37.38922", lon:"-122.048496", title:"Appc"}
		) });//end
		topView.add( InsertPOIArrayButton );
		
		//add the console
		var console = Ti.UI.createLabel({
				top: 200, left: 5, right: 5, height: 160,
				backgroundColor: 'white', color: 'black',
				text:" ... waiting ...",
				font: {fontSize: 12}, verticalAlign: 'top'
		});
		topView.add( console )
		
		function addMsg(msg) {
			var text = console.text;
			if (text && text.length > 0) {
				text = msg + '\n' + text;
			} else {
				text = msg;
			}
			console.text = text;
		}//end addMsg
		
		Ti.App.addEventListener('ti.navibridge.admin.console', function(data) {
			addMsg('admin.console: "' + data.message + '"');
		});
		return topView;
		
	}//end factoryAdminView
  	
  	return API;
})(); //end NAVIBRIDGE

module.exports = NAVIBRIDGE;
