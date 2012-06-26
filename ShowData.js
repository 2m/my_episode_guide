function ShowData(title, dayOffset, onDelete, onGetDaysRemaining) {

    this.title = title;
    this.id = title.toLowerCase().replace(/[^a-z0-9-]/g, '_');
    this.status = null;
    this.dayOffset = dayOffset;
    this.episodes = new Array();

    this.episodeToShow = null;
    this.episodeToShowAirsInDays = null;

    // callback on delete and episodeToShow change
    this.onDelete = onDelete;
    this.onGetDaysRemaining = onGetDaysRemaining;
}

ShowData.prototype.getData = function(callback) {

    var thisShow = this;

    var xhr = new XMLHttpRequest();
    xhr.open("GET", "http://www.episodeworld.com/show/"+this.id+"/season=all/english", true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            thisShow.parseInfoResp(xhr.responseText);
            thisShow.adjustEpisodeAirDates();
            thisShow.getEpisodeToShow();
            thisShow.getDaysUntilEpisodeToShow();

            if (callback != null) {
                callback(thisShow);
            }
        }
    }
    xhr.send();

    return this;
}

/**
	Some special shows that should test against,
	if something to be changed here.
		improv
		Ultimate Spider-Man
		Avengers: Earth's Mightiest Heroes
		NCIS	
*/
ShowData.prototype.parseInfoResp = function(resp) {
    var titleRegExp = new RegExp('<h1>(.*)</h1>', "g");
    var idRegExp = new RegExp('show/([A-Za-z0-9_-]*)/season=all/english">All Seasons', "g");
    var statusRegExp = new RegExp('<th width="170".*?>(.*)<', "g");
    var episodesRegExp = new RegExp('">([0-9]{1,2}x[0-9]{2}|Special).*?">(?:.*faint">)?(.*?)(?:</font>)?</a>.*?([0-9]{4}-[0-9]{2}-[0-9]{2}|\(unknown\))', "g");

    var status = statusRegExp.exec(resp);
    if (status == null) {
        // no such show found
        return;
    }
    this.status = status[1];

    var title = titleRegExp.exec(resp);
    this.title = title[1];

    var id = idRegExp.exec(resp);
    this.id = id[1];

    var episode;
    while ((episode = episodesRegExp.exec(resp))) {
        this.episodes.push(new Episode(episode[1], episode[2], episode[3]))
    }
}

ShowData.prototype.adjustEpisodeAirDates = function () {
    for (var i = 0; i < this.episodes.length; i++) {
        if (this.episodes[i].airDate == null) {
            continue;
        }
        this.episodes[i].adjustedAirDate = new Date(this.episodes[i].airDate.getFullYear(), this.episodes[i].airDate.getMonth(), this.episodes[i].airDate.getDate() + this.dayOffset);
    }
}

ShowData.prototype.getEpisodeToShow = function() {

    var today = new Date();
    today.setHours(0, 0, 0, 0);

    for (var i = this.episodes.length - 1; i >= 0; i--) {
        if (this.episodes[i].adjustedAirDate == null || this.episodes[i].adjustedAirDate >= today) {
            this.episodeToShow = this.episodes[i];
        }
        else {
            return;
        }
    }
}

ShowData.prototype.getDaysUntilEpisodeToShow = function() {
    if (this.episodeToShow == null || this.episodeToShow.adjustedAirDate == null) {
        this.episodeToShowAirsInDays = null;
    }
    else {
        var one_day = 1000 * 60 * 60 * 24;
        var todayDate = new Date();

        this.episodeToShowAirsInDays = Math.ceil((this.episodeToShow.adjustedAirDate.getTime() - todayDate.getTime()) / (one_day));
    }

    this.onGetDaysRemaining(this);
}

ShowData.prototype.formatTimeRemaining = function () {

    if (this.episodeToShowAirsInDays == null) {
        return "Episode release date unknown.";
    }
    else {
        if (this.episodeToShowAirsInDays > 1) {
            episodeReleaseDate = "In " + this.episodeToShowAirsInDays + " days";
        }
        else if (this.episodeToShowAirsInDays == 1) {
            episodeReleaseDate = "In " + this.episodeToShowAirsInDays + " day";
        }
        else {
            episodeReleaseDate = "Today";
        }

        var weekDays = new Array("Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat");
        var months = new Array("Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec");
        episodeReleaseDate += " - " + weekDays[this.episodeToShow.adjustedAirDate.getDay()] + " " + this.episodeToShow.adjustedAirDate.getDate() + " " + months[this.episodeToShow.adjustedAirDate.getMonth()];

        return episodeReleaseDate;
    }
}

ShowData.prototype.adjustDayOffset = function (delta) {

    if (delta == null) {
        this.dayOffset = 0;
    }
    else {
        this.dayOffset += delta;
    }

    var showEntry = JSON.parse(localStorage.getItem(this.id));
    showEntry.dayOffset = this.dayOffset;
    localStorage.setItem(this.id, JSON.stringify(showEntry));

    this.adjustEpisodeAirDates();
    this.getEpisodeToShow();
    this.getDaysUntilEpisodeToShow();
}

ShowData.prototype.remove = function () {
    localStorage.removeItem(this.id);
    this.onDelete(this);
}

function Episode(number, title, airDate) {

    this.number = (number == "Special" ? "Spec." : number);;
    this.title = title;
    this.id = title.toLowerCase().replace(/[^a-z0-9]/g, '_');

    this.airDate = null;
    if (airDate != "unknown") {
        var temp = airDate.split('-');
        this.airDate = new Date(temp[0], temp[1]-1, temp[2]);;
    }
    this.adjustedAirDate = null;
}
