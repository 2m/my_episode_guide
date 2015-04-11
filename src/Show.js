function Show(showData) {

    this.showData = showData;

    // DOM elements for show list
    this.rootEl = null;
    this.showTitleEl = null;
    this.episodeTitleEl = null;
    this.episodeNumberEl = null;
    this.infoEl = null;

    // DOM elements for episode list
    this.episodeListRootEl = null;
}

Show.prototype.init = function (element) {
    this.createShowDOM();
    this.createEpisodeListDOM();
    this.onAdjustDayOffset();
}

Show.prototype.createShowDOM = function () {

    var thisShow = this;

    this.rootEl = $('<div></div>')
        .attr({
            'id': thisShow.showData.id,
            'class': 'show'
        })
    ;

    // this will be used in inner anonymous functions
    var thisRootEl = this.rootEl;

    this.showTitleEl = $("<a></a>").attr({'class': 'showTitle', 'target': '_blank'});
    this.episodeTitleEl = $("<div></div>").attr({'class': 'episodeTitle', 'target': '_blank'});
    this.episodeNumberEl = $("<div></div>").attr('class', 'episodeNumber');

    // create show title with episode title and episode number
    var fullTitle = $('<div></div>').attr('class', 'fullTitle');
    fullTitle.append(this.showTitleEl);
    fullTitle.append(this.episodeTitleEl);
    fullTitle.append(this.episodeNumberEl);
    this.rootEl.append(fullTitle);

    this.rootEl.append($("<img>")
        .attr('class', 'removeShow')
        .attr('src', 'images/del_p.png')
        .click(function()
        {
            // delete show
            thisRootEl.fadeOut(500, function()
            {
                thisShow.showData.remove();
            });
        })
        .hover(function()
        {
            $(this).attr('src', 'images/del_j.png');
        },
        function()
        {
            $(this).attr('src', 'images/del_p.png');
        })
    );

    this.rootEl.append($("<img>")
        .attr('class', 'toEpisodeList')
        .attr('src', 'images/left_p.png')
        .click(function()
        {
            if (thisShow.showData.status == null) { return; }
            $("#episodes div#"+thisShow.showData.id).css("display", "block");
            $("#episodes").animate({left:0});
            $("#shows").animate({left:-400});

            $(this).attr('src', 'images/left_p.png');
        })
        .hover(function()
        {
            $(this).attr('src', 'images/left_j.png');
        },
        function()
        {
            $(this).attr('src', 'images/left_p.png');
        })
    );

    this.infoEl = $("<div></div>").attr('class', 'episodeDate');
    this.rootEl.append(this.infoEl);
}

Show.prototype.createEpisodeListDOM = function () {
    var thisShow = this;

    this.episodeListRootEl = $("<div></div>")
        .attr({
            'id': thisShow.showData.id,
            'class': 'for_show'
        })
        .click(function(e) {
            if ($(e.target).is("img")) { return; }
            $("#episodes").animate({left:400}, function () {$("#episodes").children("div").css("display", "none")});
            $("#shows").animate({left:0});
        })
    ;

    var dateAdjustEl = $("<p>");
    dateAdjustEl.append($("<span>").html("Dates are not quite right? Adjust!"));

    dateAdjustEl.append($("<img>")
        .attr('class', 'decOffset')
        .attr('src', 'images/minus_p.png')
        .click(function() {
            // minus
            thisShow.adjustDayOffset(-1);
        })
        .hover(function() {
            $(this).attr('src', 'images/minus_j.png');
        },
        function() {
            $(this).attr('src', 'images/minus_p.png');
        })
    );

    dateAdjustEl.append($("<img>")
        .attr('class', 'resetOffset')
        .attr('src', 'images/zero_p.png')
        .click(function() {
            // plus
            thisShow.adjustDayOffset();
        })
        .hover(function() {
            $(this).attr('src', 'images/zero_j.png');
        },
        function() {
            $(this).attr('src', 'images/zero_p.png');
        })
    );

    dateAdjustEl.append($("<img>")
        .attr('class', 'decOffset')
        .attr('src', 'images/plus_p.png')
        .click(function() {
            // plus
            thisShow.adjustDayOffset(1);
        })
        .hover(function() {
            $(this).attr('src', 'images/plus_j.png');
        },
        function() {
            $(this).attr('src', 'images/plus_p.png');
        })
    );

    this.episodeListRootEl.append(dateAdjustEl);

    for (var i = thisShow.showData.episodes.length - 1; i >= 0; i--) {
        var episodeEl = $("<div>").attr({id: thisShow.showData.episodes[i].id, class: "episode"});
        episodeEl.append($("<span>").attr("class", "number").html(thisShow.showData.episodes[i].number));
        episodeEl.append($("<span>").attr("class", "title").html(thisShow.showData.episodes[i].title));
        episodeEl.append($("<span>").attr("class", "airDate"));
        this.episodeListRootEl.append(episodeEl);
    }
}

Show.prototype.colorEpisodeList = function () {
    var notAired = this.showData.episodeToShow != null;

    for (var i = this.showData.episodes.length - 1; i >= 0; i--) {
        var newAttributes = {"class": "episode"};

        if (this.showData.episodeToShow != null && this.showData.episodeToShow == this.showData.episodes[i]) {
            newAttributes = {"class": "episode bold"};
            notAired = false;
        }

        if (notAired) {
            newAttributes = {"class": "episode gray"};
        }

        this.episodeListRootEl.children("#"+this.showData.episodes[i].id).attr(newAttributes);
    }
}

Show.prototype.fillInfo = function () {
    if (this.showData.status == null) {
        // no such show
        this.showTitleEl.html(this.showData.title);
        this.infoEl.html("No such show.");
        return;
    }

    this.showTitleEl.attr("href", "http://www.episodeworld.com/show/"+this.showData.ewId);
    this.showTitleEl.html(this.showData.title);

    if (this.showData.episodeToShow == null) {
        this.infoEl.html("No episode information. "+this.showData.status+".");
    }
    else {
        this.infoEl.html(this.showData.formatTimeRemaining());
        this.episodeTitleEl.html(this.showData.episodeToShow.title);
        this.episodeNumberEl.html(this.showData.episodeToShow.number);
    }
}

Show.prototype.appendShowTo = function (element) {
    $("#"+element).append(this.rootEl);
}

Show.prototype.appendEpisodesTo = function (element) {
    $("#"+element).append(this.episodeListRootEl);
}

Show.prototype.onRemove = function () {
    this.rootEl.remove();
    this.episodeListRootEl.remove();
}

Show.prototype.adjustDayOffset = function (delta) {
    this.showData.adjustDayOffset(delta);
}

Show.prototype.onAdjustDayOffset = function () {
    this.colorEpisodeList();
    this.fillInfo();
    this.fillEpisodeAirDates();
}

Show.prototype.fillEpisodeAirDates = function () {
    for (var i = 0; i < this.showData.episodes.length; i++) {
        var dateToWrite;
        if (this.showData.episodes[i].adjustedAirDate == null) {
            dateToWrite = "unknown";
        }
        else {
            var monthToWrite = this.showData.episodes[i].adjustedAirDate.getMonth() + 1;
            if (monthToWrite < 10) {
                monthToWrite = "0"+monthToWrite;
            }

            var dayToWrite = this.showData.episodes[i].adjustedAirDate.getDate();
            if (dayToWrite < 10) {
                dayToWrite = "0"+dayToWrite;
            }

            dateToWrite = this.showData.episodes[i].adjustedAirDate.getFullYear()+"-"+monthToWrite+"-"+dayToWrite;
        }

        this.episodeListRootEl.children("#"+this.showData.episodes[i].id).children(".airDate").html(dateToWrite);
    }
}
