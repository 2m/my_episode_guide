var showDataHandles = {};
var refreshTimerId = 0;

(function($) {
    onLoad();
    startRefreshTimer();
})(jQuery);

function onLoad() {
    showStorage.withAllItems(function(shows) {
        for (var key in shows) {
            var showDataEntry = shows[key];
            showDataHandles[key] = new ShowData(key, showDataEntry.ewId, showDataEntry.dayOffset).getData(function(){
                getDaysToNextEpisode();
            });
        }

        showStorage.addOnChangeCallback(onShowStorageChange);
    });
}

function onShowStorageChange(newValue, oldValue) {
    var newShowIds = Object.keys(newValue === undefined ? {} : newValue);
    var oldShowIds = Object.keys(oldValue === undefined ? {} : oldValue);

    var changedShowIds = newShowIds.filter(function(id) {
        return oldShowIds.indexOf(id) != -1;
    });
    var addedShowIds = newShowIds.filter(function(id) {
        return changedShowIds.indexOf(id) == -1;
    });
    var removedShowIds = oldShowIds.filter(function(id) {
        return changedShowIds.indexOf(id) == -1;
    });

    for (idx in changedShowIds) {
        var key = changedShowIds[idx];
        if (newValue[key].dayOffset != oldValue[key].dayOffset) {
            onDayOffsetChange(key, newValue[key].dayOffset);
        }
        if (newValue[key].order != oldValue[key].order) {
            onOrderChange(key, newValue[key].order);
        }
    }

    for (idx in addedShowIds) {
        var key = addedShowIds[idx];
        onNewShow(key, newValue[key]);
    }

    for (idx in removedShowIds) {
        var key = removedShowIds[idx];
        onShowDelete(key);
    }
}

function onDayOffsetChange(id, dayOffset) {
    showDataHandles[id].onAdjustDayOffset(dayOffset);

    var popupHandle = getPopupHandle();
    if (null != popupHandle) {
        popupHandle.showHandles[id].onAdjustDayOffset(dayOffset);
    }

    getDaysToNextEpisode();
}

function onOrderChange(id, order) {
    var popupHandle = getPopupHandle();
    if (null != popupHandle) {
        popupHandle.onSortShows();
    }
}

function onNewShow(showId, showDataEntry) {
    if (!alreadyAdded(showId)) {
        showDataHandles[showId] = new ShowData(showId, showDataEntry.ewId, showDataEntry.dayOffset).getData(onNewShowDataParsed);
    }
}

function getShowData(id) {
    return showDataHandles[id];
}

function alreadyAdded(newShowId) {
    for (var key in showDataHandles) {
        var storedShowId = showDataHandles[key].id;
        if (storedShowId.toLowerCase() == newShowId.toLowerCase()) {
            return true;
        }
    }

    return false;
}

function onNewShowDataParsed(showData) {
    var popupHandle = getPopupHandle();
    if (null != popupHandle) {
        popupHandle.addShowToPage(showData);
        popupHandle.saveNewOrder();
        popupHandle.enableInput();
    }

    getDaysToNextEpisode();
}

function onShowDelete(showId) {
    delete showDataHandles[showId];
    getDaysToNextEpisode();

    var popupHandle = getPopupHandle();
    if (null != popupHandle) {
        popupHandle.showHandles[showId].onRemove();
        popupHandle.saveNewOrder();
    }
}

function getDaysToNextEpisode() {
    showStorage.withAllItems(function(shows) {
        var nextEpisodeAirsIn = null;
        for (var key in shows) {
            if (showDataHandles[key].episodeToShowAirsInDays != null && showDataHandles[key].episodeToShowAirsInDays >= 0) {
                if (nextEpisodeAirsIn == null || showDataHandles[key].episodeToShowAirsInDays < nextEpisodeAirsIn) {
                    nextEpisodeAirsIn = showDataHandles[key].episodeToShowAirsInDays;
                }
            }
        }

        draw(nextEpisodeAirsIn);
    });
}

function draw(nextEpisodeAirsIn) {
    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");

    ctx.save();
    ctx.translate(9, 9);

    ctx.font = "bold 10pt Verdana";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.fillText(nextEpisodeAirsIn == null ? "??" : nextEpisodeAirsIn, 0, 0);

    chrome.browserAction.setIcon({imageData:ctx.getImageData(0, 0, 18, 18)});
    ctx.restore();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function refreshInBackground() {
    if (getPopupHandle() != null) {
        // do not do refresh if popup is open,
        // background page does not know how to update dom
        return;
    }

    for (var key in showDataHandles) {
        showDataHandles[key].getData(function() {
            getDaysToNextEpisode();
        });
    }
}

function startRefreshTimer() {
    clearInterval(refreshTimerId);

    settingsStorage.withItem("refreshInterval", function(refreshInterval) {
        refreshTimerId = setInterval(function() {
            refreshInBackground();
        }, refreshInterval);
    });
}
