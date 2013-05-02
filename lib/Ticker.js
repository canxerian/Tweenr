/**
 * Provides a heartbeat for animations occuring on the stage
 *
 * Ticker should be treated as a static class (almost like a singleton,
 * if you will). If a listener implements an 'update' function, it will 
 * call this on every tick and pass in the elapsed time.
 *
 * If the listener is a function, it will pass elapse time on every tick
 */ 
var Ticker = {
	FPS: 30,
	
	/**
	 * Array of listeners
	 */
	_listeners: [],
	
	_running: false,
	
	/**
	 * Total elapsed time of Ticker
	 */
	elapsedTime: 0,
	
	start: function() {
		Ticker._running = true;
		Ticker._frameDuration = ~~(1000/this.FPS);
		Ticker._lastTime = new Date().getTime();
		
		Ticker._interval = setInterval(Ticker.tick, Ticker._frameDuration);
	},
	
	/**
	 * Reference to the game instance, so that the correct draw 
	 * function is called on every tick. If this isn't set then no draw 
	 * function will be called
	 * 
	 * @param {Object}  Game object that implements a draw interface
	 */
/*
	setGameInstance: function(game) {
		// type checking necessary here
		Ticker.game = game;
	},
*/
	
	/**
	 * Add a listener to be called on every tick (interval).
	 *
	 * @param {Function || Object} l Listener can either be a function or an
	 *								 object that has an update interface.
	 */
	addListener: function() {
		if (arguments.length === 0) return;
		
		for (var i = 0, l = arguments.length; i < l; i++) {
			var li = arguments[i];
			
			if (typeof li === "undefined")
				return;
			
			// Give listeners access to the Ticker object, so that
			// they can remove themselves  
			li.Ticker = Ticker;
			li._noTick = false;
			
			if (typeof li === "object" && !li.elapsedTime) { 
				li.elapsedTime = 0;
			}
			
			Ticker._listeners.push(li);
		}

		if (!Ticker._running)
			Ticker.start();	

		return Ticker;
	},
	
	removeListener: function(l) {
		// cos array.splice(-1, 1) removes the last listener. Prevent non-listeners from doing this
		if (Ticker._listeners.indexOf(l) !== -1) {
			// Set noTick for immediate effect
			l._noTick = true;
			delete l.Ticker;
			Ticker._listeners.splice(Ticker._listeners.indexOf(l), 1);
		}
	},
	
	removeAllListeners: function() {
		Ticker._listeners = [];
	},
	
	setFPS: function(r) {
		Ticker.FPS = r;
		
		// If the ticker is currently running, restart it
		if (Ticker._running) {
			clearInterval(Ticker._interval);
			Ticker._interval = undefined;
			Ticker.start();
		}
	},
	
	tick: function() {
		if (!Ticker._running) return;

		if (typeof Stage !== "undefined" && typeof ctx !== "undefined") {
			Stage.draw(ctx);
		}
		
		// update all listeners with the elapsed time
		var nlstnrs = Ticker._listeners.length;
		
		// If all listeners have removed themselves, stop the ticker
		if (nlstnrs <= 0) {
			Ticker.stop();
			Ticker.elapsedTime = 0;
			return;
		}
		
		var now = new Date().getTime();
		
		// delta time - time between this tick and the last
		var dt = now - Ticker._lastTime;
		
		Ticker._lastTime = now;
		
		Ticker.elapsedTime += dt;
		
		for (var i = 0; i < nlstnrs; i++) {
			var l = Ticker._listeners[i];
			
			if (l === undefined || l._noTick === true) 
				continue;
				
			// update listener.elapsedTime
			//l._elapsedTime += dt;
			
			// If the listener has update() interface
			if (l.update !== undefined)
				l.update(dt);
				
			if (typeof l === "function")
				l(dt);
		}
	},
	
	pause: function() {
		Ticker._paused = true;
	},

	stop: function() {
		clearInterval(Ticker._interval);
		Ticker._interval = undefined;
		Ticker._running = false;
	},
	
	reset: function() {
		Ticker.removeAllListeners();
		Ticker.stop();
	},
	
	isRunning: function() {
		return Ticker._running;
	}
}