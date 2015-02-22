var showHandles = {};

(function($) {
    onLoad();
})(jQuery);

function onLoad() {
    $("#showTitle").autocomplete("/url/to/backend", {
        useCache: false,
        filterResults: false,
        maxItemsToShow: 15,
        showResult: function(value, data) {
            var year = data[0];
            var status = data[1];
            return '<div class="title">' + value + '</div><div class="info">' + year + ' ' + status + '</div>';
        },
        onItemSelect: function(item) {
            var ewId = item.data[2];
            $("#showTitle").val(ewId);
            $("#newShowForm").submit();
        },
        onOpen: function(ulEl) {
            $("body").height($(".acResults").height() + 20);
        },
        onFinish: function() {
            $("body").height("");
        }
    });

    showStorage.withAllItems(addShowsToPage);
}

function addShowsToPage(shows) {
    var orderedShowIds = Array();
    for (var key in shows) {
        var showDataEntry = shows[key];

        var j = showDataEntry["order"];
        while (null != orderedShowIds[j]) {
            j++;
        }
        orderedShowIds[j] = key;
    }

    for (var i = 0; i < orderedShowIds.length; i++) {
        if (null != orderedShowIds[i]) {
            addShowToPage(getBackgroundHandle().getShowData(orderedShowIds[i]));
        }
    }

    makeShowsSortable();

    $("#newShowForm").submit(function() {
        addShow();
        return false;
    });

    $("#sortButton").click(function() {
        showStorage.withAllItems(sortShows);
        return false;
    });

    $("#refreshButton").click(function() {
        refresh();
        return false;
    });
}

function addShow() {
    var ewId = $("#addShow #showTitle").val()
    // Make sure id always starts with a letter. Leading numbers make CSS selectors sad.
    var showId = "id_" + ewId.toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/ /g, '_');

    if (showId != "" && !getBackgroundHandle().alreadyAdded(showId)) {
        var showDataEntry = {ewId: ewId, dayOffset: 0, order: 0};
        showStorage.setItem(showId, showDataEntry);

        $("#addShow #showTitle").attr("disabled", "disabled");
        $("#addShow #showTitle").addClass("spinner");
    }
    else {
        enableInput();
    }
}

function addShowToPage(showData) {
    var show = new Show(showData);
    show.init();
    show.appendShowTo("shows");
    show.appendEpisodesTo("episodes");

    showHandles[showData.id] = show;
}

function enableInput() {
    $("#addShow #showTitle").removeAttr("disabled");
    $("#addShow #showTitle").val("");
    $("#addShow #showTitle").removeClass("spinner");
}

function saveNewOrder() {
    var orders = {};
    $("#shows").find(".show").each(function(i)
    {
        var showId = $(this).attr("id");
        orders[showId] = i;

    }).promise().done(function(){
        storeNewOrder(orders);
    });
}

function storeNewOrder(orders) {
    showStorage.modifyAllItems(function(allShows) {
        for (var key in allShows) {
            allShows[key].order = orders[key];
        }
        return allShows;
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

function sortShows(storedShows) {
    var shows = [];
    var showsWithoutAirDate = [];

    for (var key in storedShows) {
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
    var orders = {};
    for (var i = 0; i < sortedShows.length; i++) {
        orders[sortedShows[i].showId] = i;
    }
    storeNewOrder(orders);
}

function onSortShows() {
    showStorage.withAllItems(function(allShows) {
        var sortedShows = [];
        for (var key in allShows) {
            sortedShows.push({showId: key, order: allShows[key].order});
        }
        sortedShows.sort(function(a, b) {
            return a.order - b.order;
        });

        for (var i = 0; i < sortedShows.length; i++) {
            var showId = sortedShows[i].showId;
            var showDom = $("#shows").children("#" + showId);
            var showAfterDom = $("#shows > div").eq(i);

            if (showDom.attr("id") != showAfterDom.attr("id")) {
                showDom.insertBefore(showAfterDom);
            }
        }
    });
}

function refresh() {
    for (key in showHandles) {
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
        })(showHandles[key]);
    }
}
