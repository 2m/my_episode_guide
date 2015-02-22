function SimpleStorage(id) {
    this.storageId = id;
}

SimpleStorage.prototype.getStorage = function(userCallback) {
    var storageCallback = function(storageId) {
        return function(data) {
            if (data[storageId] === undefined) {
                data[storageId] = {};
            }
            userCallback(data[storageId]);
        }
    }
    chrome.storage.sync.get(this.storageId, storageCallback(this.storageId));
}

SimpleStorage.prototype.setStorage = function(storage, callback) {
    var request = {};
    request[this.storageId] = storage;
    chrome.storage.sync.set(request, callback);
}

SimpleStorage.prototype.getItem = function(id) {
    var storage = this.getStorage();

    if (storage == null) {
        return null;
    }

    return storage[id];
}

SimpleStorage.prototype.setItem = function(id, item, callback) {
    var storageCallback = function(_this) {
        return function(storage) {
            storage[id] = item;
            _this.setStorage(storage, callback);
        }
    }

    var storage = this.getStorage(storageCallback(this));
}

SimpleStorage.prototype.removeItem = function(id, callback) {
    var storageCallback = function(_this) {
        return function(storage) {
            delete storage[id];
            _this.setStorage(storage, callback);
        }
    }

    this.getStorage(storageCallback(this));
}

SimpleStorage.prototype.modifyItem = function(id, modifier, callback) {
    var storageCallback = function(_this) {
        return function(storage) {
            storage[id] = modifier(storage[id]);
            _this.setStorage(storage, callback);
        }
    }

    this.getStorage(storageCallback(this));
}

SimpleStorage.prototype.modifyAllItems = function(modifier, callback) {
    var storageCallback = function(_this) {
        return function(storage) {
            _this.setStorage(modifier(storage), callback);
        }
    }

    this.getStorage(storageCallback(this));
}

SimpleStorage.prototype.withItem = function(id, callback) {
    this.getStorage(function(storage) {
        callback(storage[id]);
    });
}

SimpleStorage.prototype.withAllItems = function(callback) {
    this.getStorage(callback);
}

SimpleStorage.prototype.addOnChangeCallback = function(callback) {
    var listener = function(_this) {
        return function(changes, areaName) {
            if (areaName != "sync") {
                return;
            }

            if (changes[_this.storageId] === undefined) {
                return;
            }

            callback(changes[_this.storageId].newValue, changes[_this.storageId].oldValue);
        }
    }

    chrome.storage.onChanged.addListener(listener(this));
}

function loadDefaultSettings(settingsStorage) {
    settingsStorage.modifyItem("refreshInterval", function(interval) {
        if (interval === undefined) {
            interval = 2 * 60 * 60 * 1000; // 2 hours
        }
        return interval;
    });
}

var showStorage = new SimpleStorage("shows");
var settingsStorage = new SimpleStorage("settings");

loadDefaultSettings(settingsStorage);
