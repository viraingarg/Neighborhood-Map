//error function calling when map in not loaded
function loadingError()
{
	window.alert("Unable to load map error");
}

//location values stored in an location array 
var initiallocations = [
	{
		title: 'Disneyland Resort',
		latitude: 33.810104100148706,
		longitude: -117.91863269486055,
		fsqIdentity: '40f86c00f964a520bd0a1fe3'
	},
	{
		title: 'Walt Disney World',
		latitude: 40.71764410089365,
		longitude: -74.57062270813654,
		fsqIdentity: '4e6872ada8095c02001c13eb'
	},
	{
		title: 'Disneyland Paris',
		latitude: 48.87089705553826,
		longitude: 2.7785110473632812,
		fsqIdentity: '519c002350198591be176d2b'
	},
	{
		title: 'Shanghai Disney Resort',
		latitude: 31.141621410344538,
		longitude: 121.65783430408098,
		fsqIdentity: '5719784a498e9a18b1d406a9'
	},
	{
		title: 'Hong Kong Disneyland Resort',
		latitude: 22.306971056709703,
		longitude: 114.0453627705574,
		fsqIdentity: '4bca8b100687ef3b945edccc'
	},
	{
		title: 'Tokyo Disney Resort',
		latitude: 35.63616352244419,
		longitude: 139.88392669318785,
		fsqIdentity: '4b56ee34f964a520a51f28e3'
	}
];

//global wikipedia variables
var wiki,wikiInfo;

//On load this function will be called by the index.html
function loadContent()
{

	//creating area object to be stored in the list
	var area = function(value)
	{
		var self = this;
		this.name = ko.observable(value.title);
		this.title = value.title;
		this.latitude = value.latitude;
		this.longitude = value.longitude;
		this.pin = "";
		this.photoUrl = "";
		this.address = "";
		this.phoneNo = "";
		this.fsqIdentity = value.fsqIdentity;
		this.wikiInfo = "";
		this.gotoLink = "";
	};

	//creating new map object;
	naksha = new google.maps.Map(document.getElementById("naksha"),
	{
		zoom: 2,
		center:
		{
			lat: 41.387640,
			lng: 15.690949
		}
	});

	//creating new info box/window object
	box_info = new google.maps.InfoWindow(
	{
		maxHeight: 200,
		maxWidth: 350,
		content: ""
	});

	//setting marker icon properties
	var icon = {
    url: "img/disney_movies1600.png",
    scaledSize: new google.maps.Size(32, 32),
    origin: new google.maps.Point(0,0),
    anchor: new google.maps.Point(16, 16)
	};

	//knockout binding function
	function fetching()
	{
		var self = this;

		//creating object array variable 
		this.list = ko.observableArray();

		initiallocations.forEach(function(item)
		{
			// creating list elements from the area list
			self.list.push(new area(item));
		});

		//creating marker for each area object
		this.list().forEach(function(a)
		{
			var pin = new google.maps.Marker(
			{
				map: naksha,
				position: {lat: a.latitude, lng: a.longitude},
				icon : icon,
				animation: google.maps.Animation.DROP
			});

			//copying marker to the area list
			a.pin = pin;

			//on click event for the marker
			pin.addListener("click", function()
			{
				this.wiki = ko.observable(wikiInfo);

				//changing marker icon on clicking the marker or list places
				pin.setIcon('http://maps.google.com/mapfiles/ms/icons/green-dot.png');

				//giving bounce effect to the marker on clicking it
				pin.setAnimation(google.maps.Animation.BOUNCE);

				//terminating the bounce effect after 1 security
				setTimeout(function()
				{
					pin.setIcon(icon);
					pin.setAnimation(null);

				},2000);

				//shifting map by 160px to the right
				naksha.panBy(0,-160);

				//string variable storing html content to be displayed on info box
				var info_box_data = "<div class='ibox'><a href='" + a.gotoLink+
				"' target='_blank'><h2 align='center' class='ibox'><u>" + a.title +
				"</u></h2></a><br><br><div class='iboximg'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"+
				"<img src='"+a.photoUrl + "'></div><br><br><div><p>"+a.wikiInfo+"</p>"+
				"</div><div><br><label><u>Address"+
				"</u> :</label><br><p>"+a.address+"</p><br></div><div><label>"+
				"<u>Phone no</u> :</label>&nbsp;&nbsp;"+a.phoneNo+"</div></div>";

				//set content on to the infobox
				box_info.setContent(info_box_data);

				//opens infobox on the map
				box_info.open(naksha, pin);
			});
		});

		// creating click for the list items
		this.touch = function(area)
		{
			google.maps.event.trigger(area.pin, "click");
		};

		//closing info box when clicked somewhere on the map other than the marker itself
		naksha.addListener("click",function()
		{
			box_info.close(box_info);
			this.list().forEach(function(t)
			{
				t.pin.setIcon(icon);
			});
		});

		//Filtering the area list for the search query
		self.search = ko.observable("");
		var on = true;
		var off = false;
		this.listSearch = ko.dependentObservable(function()
		{
			var y = this.search().toLowerCase();

			if(y)
			{
				return ko.utils.arrayFilter(this.list(), function(z)
				{
					if(z.name.toLowerCase().indexOf(y) >= 0)
					{
						return on;
					}
					else
					{
						z.pin.setVisible(off);
						return off;
					}
				});
			}
			else if(!y)
			{
				return ko.utils.arrayFilter(self.list(), function(z)
				{
					z.pin.setVisible(on);
					return on;
				});
			}
		}, this);

		//list iterator for api call to each list object
		self.list().forEach(function(x)
		{
			//foursquare API URL parameters
			var baseURL = "https://api.foursquare.com/v2/venues/";
			var id = "UC1ZGAFAQ0GHRQ0QKHO1HRQDRJ31KMAAOQ2BOPFMBSTTKJCJ";
			var secret = "3AZDLJABAFTREU54AHCW4T3L4NM5TZGBKCOMHFTXUBSDDPE1";
			var placeId = x.fsqIdentity + "/?";
			var fsqURL = baseURL + placeId + "client_id=" + id + "&client_secret=" + secret + "&v=20170601";

			//get request to foursquare using Json
			$.getJSON(fsqURL).done(function(data)
			{
				var response = data.response;
				x.phoneNo = response.venue.contact.phone;
				x.address = response.venue.location.formattedAddress;
				x.name = response.venue.name;
				x.photoUrl = 'http://maps.googleapis.com/maps/api/streetview?size=300x150&location= ' + x.title + ' ';
			
			}).error(function(err){  //error function calling for foursquare api
				window.alert("Foursquare api not working!!");
			});

			//wikipedia url for ajax call
			var wikiUrl = 'http://en.wikipedia.org/w/api.php?action=opensearch&search='+ x.title + '&limit'+
			'=1&namespace=0&format=json&callback=wikiCallback';

			//wikipedia error message call
			var wikiRequestTimeout = setTimeout(function(){
				window.alert("Wikipedia api not working!!");
			},9900);
			
			//ajax call to wikipedia
			$.ajax(
			{
				url: wikiUrl,
				dataType: "jsonp",
				success: function(response)
				{
					x.gotoLink = response[3];
					var article = response[2];
					x.wikiInfo = article;
					
					//revoking wikipedia error call
					clearTimeout(wikiRequestTimeout);
				}
			});
		});
	}
	ko.applyBindings(new fetching());
}