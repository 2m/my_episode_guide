(function($) {
    $("#clearCacheButton").click(function() {
        clearCache();
    });
})(jQuery);

function clearCache() {
    localStorage.clear();
    loadDefaultSettings(settingsStorage);

    getBackgroundHandle().draw();
}

$(function() {
    $("#refreshHours").keyup(function() {
        updateRefreshInterval;
    }).click(function() {
        updateRefreshInterval();
    });

    settingsStorage.withItem("refreshInterval", function(refreshInterval) {
        $("#refreshHours").val(refreshInterval / (1000 * 60 * 60));
    });
});

function updateRefreshInterval() {
    settingsStorage.setItem("refreshInterval", $("#refreshHours").val() * 60 * 60 * 1000, function() {
        getBackgroundHandle().startRefreshTimer();
    });
}
