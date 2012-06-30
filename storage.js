function SimpleStorage(id) {
    this.storageId = id;
}

SimpleStorage.prototype.getStorage = function(id) {
    return JSON.parse(localStorage.getItem(this.storageId));
}

SimpleStorage.prototype.setStorage = function(storage) {
    localStorage.setItem(this.storageId, JSON.stringify(storage));
}

SimpleStorage.prototype.getItem = function(id) {
    var storage = this.getStorage();

    if (storage == null) {
        return null;
    }
    
    return storage[id];
}

SimpleStorage.prototype.setItem = function(id, item) {
    var storage = this.getStorage();

    if (storage == null) {
        storage = {};
    }
    
    storage[id] = item;
    
    this.setStorage(storage);
}

SimpleStorage.prototype.removeItem = function(id) {
    var storage = this.getStorage();

    if (storage == null) {
        return null;
    }
    
    delete storage[id];
    
    this.setStorage(storage);
}

SimpleStorage.prototype.key = function(index) {
    var storage = this.getStorage();

    if (storage == null) {
        return null;
    }
    
    return Object.keys(storage)[index];
}

SimpleStorage.prototype.length = function() {
    var storage = this.getStorage();

    if (storage == null) {
        return 0;
    }
    
    return Object.keys(storage).length;
}

function loadDefaultSettings(settingsStorage) {
    if (null == settingsStorage.getItem("refreshInterval")) {
        settingsStorage.setItem("refreshInterval", 2 * 60 * 60 * 1000); // 2 hours
    }
}

function migrateToShowStorage() {
    if (localStorage.length > 0 && localStorage.getItem("shows") == null) {
        var showMap = {};
        for (i = 0; i < localStorage.length; i++) {
            var key = localStorage.key(i);
            showMap[key] = JSON.parse(localStorage.getItem(key));            
        }
        
        localStorage.clear();
        
        for (var key in showMap) {
            showStorage.setItem(key, showMap[key]);
        }
    }
}

var showStorage = new SimpleStorage("shows");
migrateToShowStorage();

var settingsStorage = new SimpleStorage("settings");

loadDefaultSettings(settingsStorage);