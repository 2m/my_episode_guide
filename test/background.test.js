describe('background page', function() {

    // sometimes it takes time to start phantomjs
    this.timeout(4000);

    // empty html page aka generated background page
    var FILENAME = 'test/empty.html';

    function setupStorage(page) {
        page.evaluate(function(shows) {
            chrome.storage.sync.get.callsArgWith(1, JSON.parse(shows));
            //chrome.tabs.query.yields(JSON.parse(tabs));
        }, fs.read('test/data/storage.shows.json'));
    }

    function setupServer(page) {
        page.evaluate(function(response) {
            server = sinon.fakeServer.create();
            server.respondWith("http://www.episodeworld.com/show/100/season=all/english", [
                200,
                { "Content-Type": "application/json" },
                response
            ]);
        }, fs.read('test/data/ew.the-100.html'));
    }

    function setupCanvas(page) {
        // spyout canvas where time to next show is printed
        page.evaluate(function() {
            sinon.stub(document, 'getElementById').withArgs('canvas').returns({
                getContext: function(type) {
                    var context = {
                        save: function() {},
                        translate: function() {},
                        fillText: function() {},
                        getImageData: function() {},
                        restore: function() {},
                        clearRect: function() {}
                    };
                    contextSpy = sinon.spy(context, "fillText");
                    return context;
                }
            });
        });
    }

    function setupTimers(page) {
        page.evaluate(function() {
            sinonClock = sinon.useFakeTimers();
        });
    }

    function runBackgroundJs(page) {
        // run background js with all the dependencies
        page.injectJs('src/jquery-1.7.2.min.js');
        page.injectJs('src/storage.js');
        page.injectJs('src/handles.js');
        page.injectJs('src/ShowData.js');
        page.injectJs('src/background.js');
    }

    it('should load', function(done) {
        page.open(FILENAME, function() {

            setupStorage(page);
            setupServer(page);
            setupCanvas(page);
            setupTimers(page);

            runBackgroundJs(page);

            // assert
            page.evaluate(function() {
                server.respond(); // return server response
                sinon.assert.calledWithExactly(contextSpy, 16149, 0, 0);
            });

            done();
        });
    });

    it('should decrease time left when time goes by', function(done) {
        page.open(FILENAME, function() {

            setupStorage(page);
            setupServer(page);
            setupCanvas(page);

            runBackgroundJs(page);

            // assert
            page.evaluate(function() {
                server.respond(); // return server response
                sinon.assert.calledWith(contextSpy, "??", 0, 0);
            });

            var clock = setupTimers(page);

            page.evaluate(function() {
                chrome.extension.getViews.returns([]);
                refreshInBackground();
                server.respond(); // return server response
                sinon.assert.calledWith(contextSpy, 16149, 0, 0);
            });

            page.evaluate(function() {
                sinonClock.tick(86400000); // one day
                refreshInBackground();
                server.respond(); // return server response
                sinon.assert.calledWith(contextSpy, 16148, 0, 0);
            });

            page.evaluate(function() {
                sinonClock.tick(86400000 * 16148); // 16148 days, start of the first season
                refreshInBackground();
                server.respond(); // return server response
                sinon.assert.calledWith(contextSpy, 0, 0, 0);
            });

            page.evaluate(function() {
                sinonClock.tick(86400000 * 357); // 357 days, end of the second season
                refreshInBackground();
                server.respond(); // return server response
                sinon.assert.calledWith(contextSpy, 0, 0, 0);
            });

            page.evaluate(function() {
                sinonClock.tick(86400000); // one day
                refreshInBackground();
                server.respond(); // return server response
                sinon.assert.calledWith(contextSpy, "??", 0, 0);
            });

            done();
        });
    });

});
