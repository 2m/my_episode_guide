function getBackgroundHandle() {
    return getPageHandle('background.html');
}

function getPopupHandle() {
    return getPageHandle('popup.html');
}

function getPageHandle(page) {
    var viewUrl = chrome.extension.getURL(page);
    //Look through all the pages in this extension to find one we can use.
    var views = chrome.extension.getViews();
    for (var i = 0; i < views.length; i++) {
        var view = views[i];
        if (view.location.href == viewUrl) {
            return view;
        }
    }
}