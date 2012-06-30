(function($) {
    "use strict";
	
	$.Autocompleter.prototype.executeRequest = function(filter, callback) {
		
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
        var redirectRegExp = new RegExp('Show Summary', "g");
        
        if (null != redirectRegExp.exec(response)) {
            var titleRegExp = new RegExp('nowrap>&nbsp;<h1>(.*)</h1></th>', "g");
            var yearRegExp = new RegExp('<th width="70" align="center" valign="middle" nowrap>(.*)</th>', "g");
            var statusRegExp = new RegExp('<th width="170" align="center" valign="middle" nowrap>(.*)</th>', "g");
            var idRegExp = new RegExp('<a href="/news/(.*)/" class="blueheader">News', "g");
        }
        else {
            var titleRegExp = new RegExp('"><b>(.*)</b></a>', "g");
            var yearRegExp = new RegExp('</b></a> ([()0-9-]*)<br>', "g");
            var statusRegExp = new RegExp('<td align="left" nowrap>(.*)</td></tr>', "g");
            var idRegExp = new RegExp('<a href="/show/(.*)"><b>', "g");
        }

		var returnString = "";
        
        var title;
        while ((title = titleRegExp.exec(response))) {
            var year = yearRegExp.exec(response);
            var status = statusRegExp.exec(response);
            var id = idRegExp.exec(response);
        
            returnString += title[1] + "|" + year[1] + "|" + status[1] + "|" + id[1] + "\n";			
        }

		return returnString;
	}
	
})(jQuery);