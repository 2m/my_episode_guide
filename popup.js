var showHandles = [];

(function($) {
    onLoad();
})(jQuery);

function onLoad() {
    $("#showTitle").autocomplete("/url/to/backend", {
        useCache: false,
        filterResults: false,
        showResult: function(value, data) {
            return '<div class="title">' + value + '</div><div class="info">' + data[0] + ' ' + data[1] + '</div>';
        },
        onItemSelect: function(item) {
            $("#showTitle").val(item.data[2].replace(/_/g, ' '));
            $("#newShowForm").submit();
        },
        onOpen: function(ulEl) {
            $("body").height($(".acResults").height() + 20);            
        },
        onFinish: function() {
            $("body").height("");
        }
    });

    var orderedShowIds = Array();
    for (var i = 0; i < showStorage.length(); i++) {
        var key = showStorage.key(i);
        var showDataEntry = showStorage.getItem(key);

        orderedShowIds[showDataEntry["order"]] = key;
    }

    for (var i = 0; i < orderedShowIds.length; i++) {
        addShowToPage(getBackgroundHandle().getShowData(orderedShowIds[i]));
        //console.log("on load "+orderedShowIds[i]);
    }

    makeShowsSortable();
    
    $("#newShowForm").submit(function() {
        addShow();
        return false;
    });
    
    $("#sortButton").click(function() {
        sortShows();
    });
    
    $("#refreshButton").click(function() {
        refresh();
    });
}

function addShow() {
    var showTitle = $("#addShow #showTitle").val().replace(/[^A-Za-z0-9 -]/g, '');
    var showData = getBackgroundHandle().getNewShowData(showTitle);

    $("#addShow #showTitle").attr("disabled", "disabled");
    $("#addShow #showTitle").addClass("spinner");
}

function addShowToPage(showData) {
    var show = new Show(showData);
    show.init();
    show.appendShowTo("shows");
    show.appendEpisodesTo("episodes");
    
    showHandles.push(show);
}

function enableInput() {
    $("#addShow #showTitle").removeAttr("disabled");
    $("#addShow #showTitle").val("");
    $("#addShow #showTitle").removeClass("spinner");
}

function saveNewOrder() {
    $("#shows").find(".show").each(function(i)
    {
        var showId = $(this).attr("id");

        var showDataEntry = showStorage.getItem(showId);
        showDataEntry["order"] = i;
        showStorage.setItem(showId, showDataEntry);
    });
}

function makeShowsSortable() {
    $("#shows").sortable({
        update: function(event, ui)
        {
            saveNewOrder();
        }
    });
}

function sortShows() {
    var shows = [];
    var showsWithoutAirDate = [];
    
    for (var i = 0; i < showStorage.length(); i++) {
        var key = showStorage.key(i);
        
        var showData = getBackgroundHandle().getShowData(key);
        var title = showData.title;
        var airsIn = showData.episodeToShowAirsInDays;
        
        if (airsIn == null) {
            showsWithoutAirDate.push({"showId": key, "airsIn": null, 'title': title});
        }
        else {
            shows.push({"showId": key, "airsIn": airsIn, 'title': title});
        }
    }
    
    shows.sort(function(a, b) {
        return a.airsIn - b.airsIn;        
    });
    
    showsWithoutAirDate.sort(function(a, b) {
        return a.title.localeCompare(b.title);
    });
    
    var sortedShows = shows.concat(showsWithoutAirDate);
    
    for (var i = 0; i < sortedShows.length; i++) {
        var showIds = sortedShows[i];
        var showDom = $("#shows").children("#" + showIds.showId);
        var showAfterDom = $("#shows > div").eq(i);
        
        if (showDom.attr("id") != showAfterDom.attr("id")) {
            showDom.insertBefore(showAfterDom);
        }
    }
    
    saveNewOrder();
}

function refresh() {
    for (var i = 0; i < showHandles.length; i++) {
        (function(showHandle) {
            // clear the style first,
            // because sometimes animations get stuck in the middle
            showHandle.rootEl.attr("style", "");
            
            showHandle.rootEl.addClass("loading", 100);
            showHandle.showData.getData(function() {                
                showHandle.fillInfo();
                showHandle.rootEl.removeClass("loading", 500, 'easeOutBounce')
                getBackgroundHandle().getDaysToNextEpisode();
            });
        })(showHandles[i]);
    }
}