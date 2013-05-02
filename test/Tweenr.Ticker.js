describe("Tweenr.Ticker.js", function() {
	describe("#constructor", function() {
		it("should not be instantiable", function() {
			(function() {
				var t = new Ticker();
			}).should.throw(Error);
		});
	});
		
	describe("#start", function() {
		it("should set Ticker._running to true", function() {
			Ticker._running.should.be.false;
			Ticker.start();
			Ticker._running.should.be.true;
			Ticker.stop();
		});
		
		it("should set Ticker._frameDuration to 1000/FPS", function() {
			Ticker.start();
			
			Ticker._frameDuration.should.be.a.Number;
			Ticker._frameDuration.should.equal(~~(1000/Ticker.FPS));
			
			Ticker.stop();
		});
		
		it("should set Ticker._interval to the interval id", function() {
			Ticker.start();
			Ticker._interval.should.be.a.Number;
			Ticker.stop();
		});
	});
	
	describe("#stop", function() {
		it("should stop the ticker", function() {
			Ticker.start();
			Ticker._running.should.be.true;
			
			Ticker.stop();
			Ticker._running.should.be.false;
		});
	});
	
	describe("#addListener", function() {
		var listener = {
			update: function(elapsedTime) {
				// do stuff
			}
		}
		
		it("should call Ticker.start() if it isn't started already", function() {
			Ticker._running.should.be.false;
			Ticker.addListener(listener);
			Ticker._running.should.be.true;
		});
		
		it("should append the object to Ticker._listeners", function() {
			//Ticker._listeners.should.have.length(1);
		});
		
		/*
		it("should call the update function of the listener on every tick", function(done) {
			var called = 0;
			
			listener.update = function(elapsedTime) {
				elapsedTime.should.be.a.number;
				called++;
			}
			
			// Should be called once if we wait exactly one frame
			setTimeout(function() {
				called.should.equal(1);
				done();
			}, Ticker._frameDuration);
			
		});
		*/
		
		after(function() {
			Ticker.removeListener(listener);
		});
	});
	
	describe("#removeListener", function() {
		var l = {
			update: function() {}
		}
		before(function() {
			// There should be no listeners
			Ticker._listeners.should.have.length(0)
		});
		
		it("should remove the listener from Ticker._listeners", function() {
			Ticker.addListener(l);
			Ticker._listeners.should.have.length(1);
			Ticker.removeListener(l);
			Ticker._listeners.should.have.length(0);
		});
		
		
		it("update function should not be called", function(done) {
			var called = 0;
			
			// should never be called
			l.update = function(elapsedTime) {
				called++;
			}
			
			setTimeout(function() {
				called.should.equal(0);
				done();
			}, Ticker._frameDuration * 2);
		});
	});
	
	describe("#removeAllListeners", function() {
		it("should set _listeners to an empty array", function() {
			// Add some listeners
			Ticker.addListener(function() {});
			Ticker.addListener(function() {});
			Ticker._listeners.should.have.length(2);
			
			Ticker.removeAllListeners();
			Ticker._listeners.should.have.length(0);
		});
	});
});