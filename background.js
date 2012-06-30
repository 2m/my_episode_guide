var showDataHandles = {};

(function($) {
    onLoad();
})(jQuery);

function onLoad() {
    for (i = 0; i < showStorage.length(); i++) {
        var key = showStorage.key(i);
        var showDataEntry = showStorage.getItem(key);
        showDataHandles[key] = new ShowData(key, showDataEntry.dayOffset, onShowDelete, onGetDaysRemaining).getData();
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

function getNewShowData(title) {
    return new ShowData(title, 0, onShowDelete, onGetDaysRemaining).getData(onNewShowDataParsed);
}

function onNewShowDataParsed(showData) {
    var showDataEntry = {title: showData.title, dayOffset: showData.dayOffset, order: 0};
    showStorage.setItem(showData.id, showDataEntry);
    showDataHandles[showData.id] = showData;

    var popupHandle = getPopupHandle();
    if (null != popupHandle) {
        popupHandle.addShowToPage(showData);
        popupHandle.saveNewOrder();
        popupHandle.enableInput();
    }
    
    getDaysToNextEpisode();
}

function onShowDelete(showData) {
    delete showDataHandles[showData.id];
    getDaysToNextEpisode();
    
    var popupHandle = getPopupHandle();
    if (null != popupHandle) {
        popupHandle.saveNewOrder();
    }
}

function onGetDaysRemaining(showData) {
    getDaysToNextEpisode();
}

function getDaysToNextEpisode() {

    var nextEpisodeAirsIn = null;
    for (i = 0; i < showStorage.length(); i++) {
        var key = showStorage.key(i);

        if (showDataHandles[key].episodeToShowAirsInDays != null) {
            if (nextEpisodeAirsIn == null || showDataHandles[key].episodeToShowAirsInDays < nextEpisodeAirsIn) {
                nextEpisodeAirsIn = showDataHandles[key].episodeToShowAirsInDays;
            }
        }
    }

    draw(nextEpisodeAirsIn);
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

    var refreshInterval = settingsStorage.getItem("refreshInterval");

    refreshTimerId = setInterval(function() {
        refreshInBackground();
    }, refreshInterval);
}

var refreshTimerId = 0;
startRefreshTimer();