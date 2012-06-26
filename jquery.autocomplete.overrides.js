(function($) {
    "use strict";
	
	$.Autocompleter.prototype.executeRequest = function(filter, callback) {
		console.log(filter);
		
		var xhr = new XMLHttpRequest();
		xhr.open("GET", "http://www.episodeworld.com/search/?searchitem=" + filter, true);
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4) {
				callback(parseResponse(xhr.responseText));
			}
		}
		xhr.send();
	};
	
	/**
		Some searches redirect to the specific show.
			house
			klaus
	*/
	function parseResponse(response) {
		var titleRegExp = new RegExp('"><b>(.*)</b></a>', "g");
		var yearRegExp = new RegExp('</b></a> ([()0-9-]*)<br>', "g");
		var statusRegExp = new RegExp('<td align="left" nowrap>(.*)</td></tr>', "g");
		var idRegExp = new RegExp('<a href="/show/(.*)"><b>', "g");
		
		var returnString = "";
		
		var title;
		while ((title = titleRegExp.exec(response))) {
			var year = yearRegExp.exec(response);
			var status = statusRegExp.exec(response);
			var id = idRegExp.exec(response);
		
			returnString += title[1] + "|" + year[1] + "|" + status[1] + "|" + id[1] + "\n";			
		}
		
		console.log(returnString);
		return returnString;
	}
	
})(jQuery);